# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive educational platform for the EC0249 Mexican competency standard "Proporcionar servicios de consultoría general" (Provide general consulting services). The project consists of:

- **Interactive Single Page Application** (`app.html`) - Modern web-based learning platform
- **Academic LaTeX Manual** (`manual-academico-ec0249.tex`) - Professional PDF handbook
- **Original Reference Materials** (`reference/raw/`) - Source documents and analysis
- **Modular JavaScript Architecture** (`js/`) - Component-based system

## Application Architecture

### Core Files Structure
- **app.html**: Main SPA with embedded CSS and complete application shell
- **js/modules.js**: 4-module learning system with detailed content
- **js/document-templates.js**: 15 EC0249 deliverable templates with validation
- **js/assessment-portfolio.js**: Knowledge tests and portfolio management
- **js/simulation-system.js**: Interactive interview and presentation simulators

### Key Features Implemented

#### Learning Management System
- **Module 1**: Consulting fundamentals, ethics, and interpersonal skills
- **Module 2**: Element 1 (Problem Identification) - 8 document templates + interview simulator
- **Module 3**: Element 2 (Solution Development) - 2 document templates + solution design tools  
- **Module 4**: Element 3 (Solution Presentation) - 5 document templates + presentation simulator

#### Document Generation System
- 15 interactive document templates matching EC0249 requirements
- Real-time validation and progress tracking
- Auto-save functionality with localStorage persistence
- Professional PDF export capabilities (framework ready)

#### Assessment and Portfolio Management
- Knowledge-based assessments for each competency element
- Performance evaluations through realistic simulations
- Portfolio builder with certification readiness tracking
- Progress analytics and competency mapping

#### Interactive Simulations
- **Interview Simulator**: Virtual client scenarios with real-time feedback
- **Presentation Trainer**: Boardroom environment with Q&A simulation
- Criteria-based evaluation matching official EC0249 requirements

### Technical Architecture

#### State Management
- Centralized application state in `EC0249App` class
- localStorage persistence for user progress and documents
- Component communication through app instance

#### UI/UX Design
- Mobile-first responsive design
- CSS custom properties for consistent theming
- Auto/light/dark theme switching
- Notification system for user feedback
- Progressive disclosure of complex content

#### Content Organization
- Competency-based learning paths
- Just-in-time access to reference materials
- Evidence-based portfolio development
- Certification pathway guidance

## Academic Manual

### LaTeX Document Structure
- Professional academic formatting with proper citations
- 6 comprehensive chapters covering theory and practice
- Bilingual content with Spanish primary language
- Complete reference materials and bibliography
- Practice cases and evaluation rubrics

### Content Coverage
1. **Introduction**: EC0249 standard and national competency framework
2. **Theoretical Foundations**: Consulting history, types, and best practices  
3. **Element 1**: Problem identification methodologies and techniques
4. **Element 2**: Solution development and cost-benefit analysis
5. **Element 3**: Proposal presentation and negotiation skills
6. **Assessment**: Evaluation criteria and certification preparation

## Development Guidelines

### Working with the SPA
- All JavaScript is modular and component-based
- Use the TodoWrite/TodoRead tools for progress tracking
- Follow established notification patterns for user feedback
- Maintain localStorage data structure for persistence

### Adding New Features
- Extend existing class structures in respective JS files
- Follow CSS custom property patterns for theming
- Ensure mobile responsiveness in all new components
- Add appropriate error handling and user feedback

### Content Management
- Document templates follow EC0249 official criteria exactly
- Assessment questions align with CONOCER standards
- Simulation scenarios are based on real consulting situations
- All content supports the certification pathway

### Quality Assurance
- Template validation against official requirements
- Assessment alignment with competency standards
- Simulation accuracy for performance evaluation
- Academic rigor in theoretical content

## Key Commands

To compile the LaTeX manual:
```bash
pdflatex manual-academico-ec0249.tex
bibtex manual-academico-ec0249
pdflatex manual-academico-ec0249.tex
pdflatex manual-academico-ec0249.tex
```

To serve the SPA locally:
```bash
# Any local server, e.g.:
python -m http.server 8000
# Then open http://localhost:8000/app.html
```

## Integration Notes

- The SPA and LaTeX manual complement each other for comprehensive learning
- Reference materials in `reference/` inform both digital and print content
- Assessment systems prepare learners for official EC0249 evaluation
- Portfolio management aligns with CONOCER certification requirements

This platform provides a complete educational ecosystem for EC0249 certification preparation, combining modern web technology with rigorous academic content and practical skill development.