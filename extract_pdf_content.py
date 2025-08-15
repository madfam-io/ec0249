#!/usr/bin/env python3
"""
PDF Content Extraction Script for EC0249 Reference Materials
Extracts text content from PDF files for analysis
"""

import pdfplumber
import os
import json
from pathlib import Path

def extract_pdf_text(pdf_path):
    """Extract text from a PDF file using pdfplumber"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_content = []
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text_content.append({
                        'page': page_num,
                        'content': page_text.strip()
                    })
            return text_content
    except Exception as e:
        return f"Error extracting from {pdf_path}: {str(e)}"

def analyze_pdf_files():
    """Analyze all PDF files in the reference/raw directory"""
    base_path = Path("/Users/aldoruizluna/labspace/ec0249/reference/raw")
    pdf_files = list(base_path.glob("*.pdf"))
    
    analysis_results = {}
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        content = extract_pdf_text(pdf_file)
        analysis_results[pdf_file.name] = content
        
        # Print summary for immediate analysis
        if isinstance(content, list):
            print(f"  - Pages: {len(content)}")
            if content:
                first_page_preview = content[0]['content'][:200] + "..." if len(content[0]['content']) > 200 else content[0]['content']
                print(f"  - First page preview: {first_page_preview}")
        else:
            print(f"  - Error: {content}")
        print()
    
    # Save detailed results to JSON file
    output_file = base_path.parent / "pdf_content_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    
    print(f"Detailed analysis saved to: {output_file}")
    return analysis_results

if __name__ == "__main__":
    results = analyze_pdf_files()