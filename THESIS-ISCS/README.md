# THESIS-ISCS: LFS Automated Build System
## Bachelor's Thesis - Vilnius University ISCS Programme

---

## 📁 Directory Structure

This directory contains the complete thesis content following Vilnius University ISCS methodological guidelines for bachelor's theses.

```
THESIS-ISCS/
├── 00-initial-pages/          ✅ COMPLETE (7 files)
├── 01-introduction/           ✅ COMPLETE (1 file, ~1000 words)
├── 02-analytical-part/        ✅ COMPLETE (5 files, ~3500 words)
├── 03-technical-task/         ✅ COMPLETE (1 file, ~800 words)
├── 04-project-part/           🚧 IN PROGRESS (needs content)
├── 05-software-implementation/ 🚧 IN PROGRESS (needs content)
├── 06-conclusions/            🚧 IN PROGRESS (needs content)
├── 07-final-pages/            🚧 IN PROGRESS (needs content)
├── 08-annexes/                🚧 IN PROGRESS (needs content)
└── diagrams/                  📝 TODO (create UML diagrams, flowcharts)
```

---

## 📊 Content Status

### ✅ Completed Sections (5,300+ words)

#### 00-initial-pages/ (7 files)
- ✅ `01-title-page-1.md` - First title page (university, programme, thesis title)
- ✅ `02-title-page-2.md` - Second title page (with supervisor)
- ✅ `03-table-of-contents.md` - Auto-generated ToC template
- ✅ `04-list-of-figures.md` - 24 figures specified
- ✅ `05-list-of-tables.md` - 21 tables specified
- ✅ `06-list-of-abbreviations.md` - 50+ abbreviations defined
- ✅ `07-summary-lithuanian.md` - Lithuanian summary template

#### 01-introduction/ (1,000 words)
- ✅ `introduction.md` - Complete 2-page introduction with all 13 ISCS-required elements:
  - Relevance, research problem, object, aim
  - 5 objectives, research methods, IS design methods
  - Technologies, results overview, difficulties
  - Logical structure, key sources, scopez

#### 02-analytical-part/ (3,500 words)
- ✅ `00-chapter-intro.md` - Chapter introduction (150 words)
- ✅ `01-problem-area-characteristics.md` - LFS process, educational context, challenges (1,000 words)
- ✅ `02-information-flows-analysis.md` - Manual vs automated flows, ALFS vs jhalfs comparison (1,200 words)
- ✅ `03-requirements-and-tools-selection.md` - FR/NFR specification, technology stack justification (1,500 words)
- ✅ `04-chapter-summary.md` - Synthesis of analytical findings (200 words)

#### 03-technical-task/ (800 words)
- ✅ `technical-task.md` - Formal specification with:
  - 24 functional requirements across 4 categories
  - Testing methodology and acceptance criteria
  - Documentation requirements
  - Hardware/software requirements

---

## 🚧 Remaining Work

### 04-project-part/ (Target: 18-22 pages, ~7,000 words)

**Status**: Files created, need content population from codebase

**Files to Complete**:
- `00-chapter-intro.md` - Overview of system design approach
- `01-project-objective.md` - Formal objective statement and constraints

**02-logic-structure/** (5 files):
- `01-hierarchy-of-functions.md` - Use case diagram, function tree
- `02-data-flow-diagrams.md` - DFD Level 0, Level 1, process descriptions
- `03-conceptual-object-model.md` - ERD for Firestore collections
- `04-system-states-processes.md` - Sequence diagrams, activity diagrams, state diagrams
- `05-formal-calculations.md` - Build time estimates, resource calculations

**03-information-equipment/** (5 files):
- `01-classification-coding.md` - Data classification schemes
- `02-input-data-specification.md` - Build request schema, configuration parameters
- `03-output-data-specification.md` - Build artifacts, logs, status updates
- `04-database-project.md` - Firestore schema (builds, buildLogs, users, enrollments, lessonProgress)
- `05-data-processing.md` - Data transformation algorithms

**04-software-project/** (5 files):
- `01-system-architecture.md` - Three-tier architecture diagram
- `02-software-environment.md` - Docker multi-stage build, environment variables
- `03-test-data-description.md` - Test scenarios, sample inputs
- `04-user-manual.md` - End-user guide for web interface
- `05-programmer-manual.md` - Developer guide for extending system

**Other files**:
- `05-technical-equipment.md` - Hardware justification (8GB RAM, 4 CPU cores)
- `06-deployment-plan.md` - Netlify + GCP deployment steps
- `07-system-assessment-comparison.md` - Evaluation vs existing tools
- `08-chapter-summary.md` - Synthesis

---

### 05-software-implementation/ (Target: 12-15 pages, ~5,000 words)

**Files to Complete**:
- `00-chapter-intro.md` - Implementation approach overview
- `01-database-specification.md` - Actual Firestore document examples from codebase
- `02-user-interface-modules.md` - React components from `lfs-learning-platform/components/`
- `03-data-processing-modules.md` - `functions/index.js`, `lfs-build.sh`, helpers
- `04-test-operation-examples.md` - Real build execution examples with screenshots
- `05-testing-results.md` - Unit test results, integration test results, performance data
- `06-programmer-guide.md` - Code structure, key functions, extension points
- `07-user-guide.md` - Step-by-step usage instructions
- `08-chapter-summary.md` - Implementation synthesis

---

### 06-conclusions/ (Target: 2-3 pages, ~800 words)

**File to Complete**:
- `conclusions-and-recommendations.md` - Numbered conclusions (1 per objective), recommendations for future work

---

### 07-final-pages/ (Target: 3-4 pages)

**Files to Complete**:
- `01-list-of-references.md` - APA format references (10-15 sources minimum)
- `02-summary-english.md` - English summary (~3000 characters)
- `03-annexes-list.md` - List of annexes

---

### 08-annexes/ (Variable length, not counted toward page total)

**Files to Complete**:
- `annexe-01-source-code-listings.md` - Key code excerpts (functions/index.js, lfs-build.sh)
- `annexe-02-docker-configuration.md` - Complete Dockerfile with annotations
- `annexe-03-firestore-rules.md` - Security rules with explanations
- `annexe-04-api-documentation.md` - Cloud Functions API specifications
- `annexe-05-test-results-data.md` - Detailed test outputs
- `annexe-06-screenshots.md` - UI screenshots, build process visuals

---

### diagrams/ (24 figures, 21 tables)

**Diagrams to Create**:
1. High-Level System Architecture
2. Organizational Context Diagram
3. Information Flow - Manual LFS
4. Information Flow - Automated System
5. Use Case Diagram
6. Hierarchy of Functions
7. DFD Level 0
8. DFD Level 1
9. Entity-Relationship Diagram
10. Sequence Diagram - Build Submission
11. Sequence Diagram - Cloud Function
12. Activity Diagram - Build Process
13. State Diagram - Build Status
14. Relational Schema - Firestore
15. System Architecture - Three-Tier
16. Component Diagram - Frontend
17. Component Diagram - Backend
18. Docker Multi-Stage Build
19. Deployment Diagram
20. UI Screenshots (3-4 variations)
21-24. Performance Graphs

**Tables to Create**:
1. Comparison of LFS Automation Approaches
2. Technology Selection Criteria Matrix
3-5. Technology Stack Specifications (Frontend, Backend, Build Env)
6-7. Requirements Specifications (Functional, Non-Functional)
8-10. Docker/Environment Configuration Tables
11-14. Database Schema Tables
15-17. Hardware/Software Requirements
18-21. Testing Results Tables

---

## 📝 Word Count Targets

| Section | Target | Current | Status |
|---------|--------|---------|--------|
| Introduction | 800-1000 | 1,000 | ✅ Complete |
| Analytical Part | 3,000-3,500 | 3,500 | ✅ Complete |
| Technical Task | 600-800 | 800 | ✅ Complete |
| Project Part | 6,000-7,000 | 0 | 🚧 TODO |
| Software Implementation | 4,000-5,000 | 0 | 🚧 TODO |
| Conclusions | 700-900 | 0 | 🚧 TODO |
| **TOTAL** | **15,100-17,200** | **5,300** | **31% Complete** |

---

## 🎯 Page Count Targets (44-55 pages excluding references/annexes)

- Introduction: 2 pages ✅
- Analytical Part: 10-12 pages ✅
- Technical Task: 2 pages ✅
- Project Part: 18-22 pages 🚧
- Software Implementation: 12-15 pages 🚧
- Conclusions: 2-3 pages 🚧

**Current**: ~14 pages / Target: 44-55 pages (31% complete)

---

## 🛠️ How to Use This Structure

### 1. Compile to Word Document

Each markdown file should be converted to Word format:

```bash
# Install pandoc if not already installed
# For each markdown file:
pandoc introduction.md -o introduction.docx --reference-doc=template.docx
```

### 2. Formatting in Word

**Font Specifications**:
- Chapter titles (e.g., "INTRODUCTION"): 14pt Bold Capitals Centered
- Section headings (e.g., "1.1 Problem Area"): 12pt Bold Left
- Subsection headings (e.g., "1.1.1 LFS Process"): 12pt Bold Italic Left
- Body text: 12pt Regular, justified alignment
- Line spacing: 1.5 lines
- Margins: 2.5cm left, 2cm right, 2cm top, 2cm bottom

**Page Setup**:
- Paper size: A4
- Header: Page number (right-aligned, starts from Introduction)
- Footer: None
- Page breaks: Each major chapter starts on new page

### 3. Auto-Generate Lists

In Word:
- **Table of Contents**: References > Table of Contents > Automatic Table 1
- **List of Figures**: References > Insert Table of Figures
- **List of Tables**: References > Insert Table of Tables

Update all lists before final submission (right-click > Update Field).

### 4. Insert Diagrams

1. Create diagrams using draw.io, PlantUML, or similar
2. Export as high-quality PNG (300 DPI)
3. Insert in Word at appropriate locations
4. Add captions: References > Insert Caption
5. Format: "Figure X. [Description]" in 10pt italic below image

### 5. Insert Tables

1. Create tables directly in Word or import from Excel
2. Use Light Shading - Accent 1 table style
3. Add captions: References > Insert Caption
4. Format: "Table X. [Description]" in 10pt italic above table

---

## ✅ Quality Checklist

Before finalizing thesis:

- [ ] All 13 introduction elements present (ISCS Section 2.3.2)
- [ ] Each chapter has introduction paragraph
- [ ] Each chapter has summary paragraph
- [ ] Smallest section is ≥1 page
- [ ] Total length: 44-55 pages (excluding references/annexes)
- [ ] Figures: 18-24 total, all referenced in text
- [ ] Tables: 12-21 total, all referenced in text
- [ ] References: 10-15 sources minimum, APA format
- [ ] All acronyms defined in List of Abbreviations
- [ ] Table of Contents auto-generated and updated
- [ ] Page numbers correct (starting from Introduction)
- [ ] Formatting consistent throughout
- [ ] No orphan/widow lines
- [ ] All code snippets syntax-highlighted
- [ ] Lithuanian summary translated and proofread
- [ ] English summary proofread
- [ ] Supervisor name added to title page
- [ ] Personal name replaced on title page
- [ ] Plagiarism check passed
- [ ] Spelling and grammar checked

---

## 📚 Key Sources to Reference

- Beekmans, Gerard. (2023). *Linux From Scratch - Version 12.0*. Linux From Scratch Project.
- Merkel, Dirk. (2014). Docker: Lightweight Linux Containers for Consistent Development and Deployment. *Linux Journal*, 2014(239).
- Google Cloud Documentation. (2024). *Cloud Run Documentation*. Google Cloud.
- Firebase Documentation. (2024). *Firebase Documentation*. Google.
- Next.js Documentation. (2024). *Next.js Documentation*. Vercel.
- [Add 5-10 more academic sources on OS education, containerization, cloud computing]

---

## 🚀 Next Steps

1. **Create diagrams** (priority: Figures 1, 3, 4, 5, 7, 8, 9 for Analytical Part)
2. **Complete Project Part** using data from:
   - `lfs-build.sh` for build process
   - `Dockerfile` for container architecture
   - `firestore.rules` for database security
   - `functions/index.js` for backend logic
3. **Complete Software Implementation** using data from:
   - `lfs-learning-platform/components/` for UI
   - `helpers/` for data processing
   - Test files for results
4. **Write Conclusions** (one per objective)
5. **Create References** list in APA format
6. **Generate English Summary**
7. **Translate Lithuanian Summary**
8. **Create Annexes** with code listings

---

## 📞 Support

If you need assistance:
- Refer to ISCS Methodological Guidelines PDF
- Consult reference thesis: Muhammad_Muslim_Thesis.docx
- Review existing thesis data: `docs/thesis/THESIS_DATA_EXTRACTION.md`

---

**Last Updated**: 2025-12-10  
**Author**: [Your Name]  
**Thesis Advisor**: [Advisor Name]  
**Programme**: Information Systems and Cyber Security (ISCS)  
**Institution**: Vilnius University Kaunas Faculty
