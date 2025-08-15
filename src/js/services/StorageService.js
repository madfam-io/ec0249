/**
 * Storage Service - Modular storage management
 * Provides unified interface for localStorage, sessionStorage, and IndexedDB
 */
import Module from '../core/Module.js';

class StorageService extends Module {
  constructor() {
    super('StorageService', ['EventBus'], {
      defaultAdapter: 'localStorage',
      prefix: 'ec0249_',
      compression: false,
      encryption: false,
      ttl: false, // Time to live in milliseconds
      fallbackToMemory: true
    });

    this.adapters = new Map();
    this.memoryStorage = new Map();
    this.initialized = false;
  }

  async onInitialize() {
    // Register memory adapter first (always works)
    this.registerAdapter('memory', new MemoryStorageAdapter(this.memoryStorage));
    
    // Try to register localStorage adapter
    try {
      if (this.isLocalStorageSupported()) {
        this.registerAdapter('localStorage', new LocalStorageAdapter());
        console.log('[StorageService] localStorage adapter registered');
      } else {
        console.warn('[StorageService] localStorage not supported, falling back to memory');
      }
    } catch (error) {
      console.warn('[StorageService] localStorage not available:', error.message);
    }
    
    // Try to register sessionStorage adapter
    try {
      if (this.isSessionStorageSupported()) {
        this.registerAdapter('sessionStorage', new SessionStorageAdapter());
        console.log('[StorageService] sessionStorage adapter registered');
      }
    } catch (error) {
      console.warn('[StorageService] sessionStorage not available:', error.message);
    }
    
    // Try to register IndexedDB adapter
    try {
      if (this.isIndexedDBSupported()) {
        this.registerAdapter('indexedDB', new IndexedDBAdapter(this.getConfig('prefix')));
        console.log('[StorageService] IndexedDB adapter registered');
      }
    } catch (error) {
      console.warn('[StorageService] IndexedDB not available:', error.message);
    }

    // Set initialized flag BEFORE subscribing to events (which uses eventBus)
    this.initialized = true;
    
    // Subscribe to storage events (now safe to emit events)
    this.subscribe('storage:clear', this.handleClearStorage.bind(this));
    this.subscribe('storage:migrate', this.handleMigration.bind(this));
    
    console.log(`[StorageService] Initialized with adapters: ${Array.from(this.adapters.keys()).join(', ')}`);
  }

  /**
   * Register a storage adapter
   * @param {string} name - Adapter name
   * @param {Object} adapter - Storage adapter
   */
  registerAdapter(name, adapter) {
    this.adapters.set(name, adapter);
  }

  /**
   * Get storage adapter
   * @param {string} name - Adapter name
   * @returns {Object} Storage adapter
   */
  getAdapter(name = null) {
    const adapterName = name || this.getConfig('defaultAdapter');
    let adapter = this.adapters.get(adapterName);
    
    if (!adapter) {
      // Try fallback chain: requested → localStorage → sessionStorage → memory
      const fallbackOrder = ['localStorage', 'sessionStorage', 'memory'];
      
      for (const fallbackName of fallbackOrder) {
        if (fallbackName !== adapterName) {
          adapter = this.adapters.get(fallbackName);
          if (adapter) {
            if (adapterName !== this.getConfig('defaultAdapter') || fallbackName !== 'memory') {
              // Only warn for non-default requests or non-memory fallbacks
              console.warn(`[StorageService] Adapter '${adapterName}' not found, using '${fallbackName}'`);
            }
            return adapter;
          }
        }
      }
      
      // Last resort: create memory adapter on the fly
      if (!this.adapters.has('memory')) {
        console.warn(`[StorageService] No adapters available, creating memory adapter`);
        adapter = new MemoryStorageAdapter(this.memoryStorage);
        this.adapters.set('memory', adapter);
        return adapter;
      }
      
      throw new Error(`Storage adapter '${adapterName}' not found and no fallbacks available`);
    }
    
    return adapter;
  }

  /**
   * Store a value
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Promise} Storage promise
   */
  async set(key, value, options = {}) {
    const adapter = this.getAdapter(options.adapter);
    const prefixedKey = this.getPrefixedKey(key);
    
    let dataToStore = value;
    
    // Add metadata
    const metadata = {
      timestamp: Date.now(),
      ttl: options.ttl || this.getConfig('ttl'),
      type: typeof value,
      compressed: false,
      encrypted: false
    };

    // Compression
    if (this.getConfig('compression') || options.compress) {
      dataToStore = await this.compress(dataToStore);
      metadata.compressed = true;
    }

    // Encryption
    if (this.getConfig('encryption') || options.encrypt) {
      dataToStore = await this.encrypt(dataToStore);
      metadata.encrypted = true;
    }

    const storageValue = {
      data: dataToStore,
      metadata
    };

    try {
      await adapter.set(prefixedKey, storageValue);
      
      // Only emit events if the module is fully initialized and eventBus is available
      if (this.initialized && this.eventBus) {
        this.emit('storage:set', {
          key: prefixedKey,
          originalKey: key,
          adapter: adapter.name,
          size: this.getStorageSize(storageValue)
        });
      }
    } catch (error) {
      console.error(`Storage set error for key '${key}':`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @param {Object} options - Retrieval options
   * @returns {Promise<*>} Retrieved value
   */
  async get(key, defaultValue = null, options = {}) {
    const adapter = this.getAdapter(options.adapter);
    const prefixedKey = this.getPrefixedKey(key);

    try {
      const storageValue = await adapter.get(prefixedKey);
      
      if (!storageValue) {
        return defaultValue;
      }

      // Check TTL
      if (this.isExpired(storageValue)) {
        await this.remove(key, options);
        return defaultValue;
      }

      let data = storageValue.data;

      // Decrypt if needed
      if (storageValue.metadata?.encrypted) {
        data = await this.decrypt(data);
      }

      // Decompress if needed
      if (storageValue.metadata?.compressed) {
        data = await this.decompress(data);
      }

      // Only emit events if the module is fully initialized and eventBus is available
      if (this.initialized && this.eventBus) {
        this.emit('storage:get', {
          key: prefixedKey,
          originalKey: key,
          adapter: adapter.name,
          hit: true
        });
      }

      return data;
    } catch (error) {
      console.error(`Storage get error for key '${key}':`, error);
      
      // Only emit events if the module is fully initialized and eventBus is available
      if (this.initialized && this.eventBus) {
        this.emit('storage:get', {
          key: prefixedKey,
          originalKey: key,
          adapter: adapter.name,
          hit: false,
          error: error.message
        });
      }
      
      return defaultValue;
    }
  }

  /**
   * Remove a value
   * @param {string} key - Storage key
   * @param {Object} options - Removal options
   * @returns {Promise} Removal promise
   */
  async remove(key, options = {}) {
    const adapter = this.getAdapter(options.adapter);
    const prefixedKey = this.getPrefixedKey(key);

    try {
      await adapter.remove(prefixedKey);
      
      // Only emit events if the module is fully initialized and eventBus is available
      if (this.initialized && this.eventBus) {
        this.emit('storage:remove', {
          key: prefixedKey,
          originalKey: key,
          adapter: adapter.name
        });
      }
    } catch (error) {
      console.error(`Storage remove error for key '${key}':`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @param {Object} options - Check options
   * @returns {Promise<boolean>} Existence status
   */
  async has(key, options = {}) {
    const adapter = this.getAdapter(options.adapter);
    const prefixedKey = this.getPrefixedKey(key);
    
    try {
      const value = await adapter.get(prefixedKey);
      return value !== null && !this.isExpired(value);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all storage
   * @param {Object} options - Clear options
   * @returns {Promise} Clear promise
   */
  async clear(options = {}) {
    const adapter = this.getAdapter(options.adapter);
    
    try {
      if (options.prefix !== false) {
        // Clear only prefixed keys
        const keys = await this.getKeys(options);
        await Promise.all(keys.map(key => adapter.remove(key)));
      } else {
        // Clear all storage
        await adapter.clear();
      }
      
      // Only emit events if the module is fully initialized and eventBus is available
      if (this.initialized && this.eventBus) {
        this.emit('storage:clear', {
          adapter: adapter.name,
          prefixed: options.prefix !== false
        });
      }
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  /**
   * Get all keys
   * @param {Object} options - Options
   * @returns {Promise<Array>} Array of keys
   */
  async getKeys(options = {}) {
    const adapter = this.getAdapter(options.adapter);
    const prefix = this.getConfig('prefix');
    
    try {
      const allKeys = await adapter.getKeys();
      return allKeys.filter(key => key.startsWith(prefix));
    } catch (error) {
      console.error('Storage getKeys error:', error);
      return [];
    }
  }

  /**
   * Get storage size
   * @param {Object} options - Options
   * @returns {Promise<number>} Storage size in bytes
   */
  async getSize(options = {}) {
    const adapter = this.getAdapter(options.adapter);
    
    try {
      if (adapter.getSize) {
        return await adapter.getSize();
      }
      
      // Fallback calculation
      const keys = await this.getKeys(options);
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await adapter.get(key);
        totalSize += this.getStorageSize(value);
      }
      
      return totalSize;
    } catch (error) {
      console.error('Storage getSize error:', error);
      return 0;
    }
  }

  /**
   * Get prefixed key
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  getPrefixedKey(key) {
    const prefix = this.getConfig('prefix');
    return prefix + key;
  }

  /**
   * Check if storage value is expired
   * @param {Object} storageValue - Storage value with metadata
   * @returns {boolean} Expiration status
   */
  isExpired(storageValue) {
    if (!storageValue.metadata?.ttl) {
      return false;
    }
    
    const expirationTime = storageValue.metadata.timestamp + storageValue.metadata.ttl;
    return Date.now() > expirationTime;
  }

  /**
   * Calculate storage size
   * @param {*} value - Value to measure
   * @returns {number} Size in bytes
   */
  getStorageSize(value) {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Compress data (placeholder - implement with actual compression library)
   * @param {*} data - Data to compress
   * @returns {Promise<*>} Compressed data
   */
  async compress(data) {
    // Placeholder - implement with LZ-string or similar
    return data;
  }

  /**
   * Decompress data (placeholder)
   * @param {*} data - Data to decompress
   * @returns {Promise<*>} Decompressed data
   */
  async decompress(data) {
    // Placeholder - implement with LZ-string or similar
    return data;
  }

  /**
   * Encrypt data (placeholder)
   * @param {*} data - Data to encrypt
   * @returns {Promise<*>} Encrypted data
   */
  async encrypt(data) {
    // Placeholder - implement with Web Crypto API
    return data;
  }

  /**
   * Decrypt data (placeholder)
   * @param {*} data - Data to decrypt
   * @returns {Promise<*>} Decrypted data
   */
  async decrypt(data) {
    // Placeholder - implement with Web Crypto API
    return data;
  }

  /**
   * Check if IndexedDB is supported
   * @returns {boolean} Support status
   */
  isIndexedDBSupported() {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  /**
   * Handle clear storage event
   * @param {Object} data - Event data
   */
  async handleClearStorage(data) {
    await this.clear(data.options || {});
  }

  /**
   * Handle migration event
   * @param {Object} data - Migration data
   */
  async handleMigration(data) {
    // Implement storage migration logic
    console.log('Storage migration requested:', data);
  }

  /**
   * Check if localStorage is supported
   * @returns {boolean} Support status
   */
  isLocalStorageSupported() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if sessionStorage is supported
   * @returns {boolean} Support status
   */
  isSessionStorageSupported() {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if IndexedDB is supported
   * @returns {boolean} Support status
   */
  isIndexedDBSupported() {
    return 'indexedDB' in window;
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  async getStats() {
    const stats = {
      adapters: Array.from(this.adapters.keys()),
      totalSize: 0,
      keyCount: 0
    };

    for (const [name, adapter] of this.adapters) {
      try {
        const size = await this.getSize({ adapter: name });
        const keys = await this.getKeys({ adapter: name });
        
        stats[name] = {
          size,
          keyCount: keys.length,
          available: true
        };
        
        stats.totalSize += size;
        stats.keyCount += keys.length;
      } catch (error) {
        stats[name] = {
          size: 0,
          keyCount: 0,
          available: false,
          error: error.message
        };
      }
    }

    return stats;
  }
}

// Storage Adapters

class LocalStorageAdapter {
  constructor() {
    this.name = 'localStorage';
  }

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage.setItem failed:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('localStorage.getItem failed:', error);
      return null;
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage.removeItem failed:', error);
      throw error;
    }
  }

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage.clear failed:', error);
      throw error;
    }
  }

  async getKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('localStorage.getKeys failed:', error);
      return [];
    }
  }
}

class SessionStorageAdapter {
  constructor() {
    this.name = 'sessionStorage';
  }

  async set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  async get(key) {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key) {
    sessionStorage.removeItem(key);
  }

  async clear() {
    sessionStorage.clear();
  }

  async getKeys() {
    return Object.keys(sessionStorage);
  }
}

class MemoryStorageAdapter {
  constructor(storage) {
    this.name = 'memory';
    this.storage = storage;
  }

  async set(key, value) {
    this.storage.set(key, value);
  }

  async get(key) {
    return this.storage.get(key) || null;
  }

  async remove(key) {
    this.storage.delete(key);
  }

  async clear() {
    this.storage.clear();
  }

  async getKeys() {
    return Array.from(this.storage.keys());
  }
}

class IndexedDBAdapter {
  constructor(dbName) {
    this.name = 'indexedDB';
    this.dbName = dbName;
    this.version = 1;
    this.storeName = 'keyvalue';
  }

  async set(key, value) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await store.put(value, key);
  }

  async get(key) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    return await store.get(key);
  }

  async remove(key) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await store.delete(key);
  }

  async clear() {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await store.clear();
  }

  async getKeys() {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    return await store.getAllKeys();
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
}

export default StorageService;