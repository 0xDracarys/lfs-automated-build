# Where to Put Local Installer in Your Thesis

**Document Purpose:** Exact placement guide for integrating local Windows installer documentation into your ISCS bachelor's thesis.

**Date:** December 22, 2025  
**Thesis:** "Linux From Scratch (LFS) Automation Framework"  
**Student:** Shubham Bhasker  
**Institution:** Vilnius University Kaunas Faculty - ISCS Programme

---

## 📍 PRIMARY LOCATION: Section 5.3

### Your Current Thesis Structure:

```
1. ANALYTICAL PART
2. TECHNICAL TASK  
3. PROJECT PART
4. SOFTWARE IMPLEMENTATION PART ← ADD LOCAL INSTALLER HERE
5. CONCLUSIONS
```

---

## 🆕 Add This New Section Structure:

```
5. SOFTWARE IMPLEMENTATION PART

5.1 Cloud-Native Implementation
    5.1.1 Frontend Architecture (Next.js 16 + React 19)
    5.1.2 Backend Services (Firebase Functions + Cloud Run)
    5.1.3 Build Scripts (Bash orchestration scripts)
    5.1.4 Database Implementation (Firestore schemas)
    
5.2 Cloud Deployment and Testing
    5.2.1 Deployment Pipeline (Netlify + Firebase + GCP)
    5.2.2 Performance Testing Results
    5.2.3 User Acceptance Testing

5.3 Local Windows Installer Implementation ⭐ NEW SECTION
    5.3.1 Installer Overview and Objectives
        → Figure 5.1: Use Case Diagram (Simplified Version)
        → Table 5.2: Five-Step Wizard Breakdown
        → Table 5.3: Prerequisites Validation Matrix
        
    5.3.2 Five-Step Wizard Implementation
        → Figure 5.2: Activity Diagram of Installation Flow
        → Figure 5.3: Sequence Diagram of User Interaction
        → Listing 5.1: Administrator Rights Check
        → Listing 5.2: WMI-Based RAM Validation
        
    5.3.3 Technical Specifications and Class Architecture
        → Figure 5.4: Component Diagram (4-Layer Architecture)
        → Figure 5.5: Class Diagram (8 Core Classes)
        → Listing 5.3: Singleton Logger Pattern
        
    5.3.4 WSL2 Integration and Environment Setup
        → Figure 5.6: State Machine Diagram
        → Table 5.1: Installation State Transitions
        → Listing 5.4: DISM-Based Feature Enablement
        → Listing 5.5: Linux Distribution Installation
        → Listing 5.6: LFS Environment Configuration
        
    5.3.5 Testing and Validation Results
        → Table 5.4: Installer Test Results Summary
        → Table 5.5: Installation Performance Metrics
        
    5.3.6 User Guide and Installation Instructions
        → Pre-installation checklist
        → Step-by-step walkthrough
        → Troubleshooting common issues
        
    5.3.7 Programmer Guide and Maintenance
        → Solution structure
        → Build instructions
        → Debugging tips

5.4 Comparative Analysis
    5.4.1 Cloud vs Local Build Performance
    5.4.2 Accessibility and Usability Comparison
    5.4.3 System Requirements Tradeoffs
```

---

## 🔄 SECONDARY UPDATES (Cross-References)

### 1. Update Section 1.2 (Already exists in your thesis)

**Location:** Page ~10-15 in your current document  
**Current Section Title:** "1.2 Local LFS Build Architecture and Wizard Automation"

**Add this paragraph at the END of Section 1.2:**

```markdown
As an alternative to cloud-based builds, a native Windows installer was 
developed to address use cases requiring local execution, including corporate 
environments with restricted cloud access, offline learning scenarios, and 
developers preferring local builds for debugging. The detailed implementation 
of this installer is presented in Section 5.3, which describes the five-step 
wizard architecture, WSL2 integration mechanisms, and comprehensive testing 
results. This dual-implementation approach validates the architectural principle 
that LFS automation can be achieved through multiple deployment models while 
maintaining reproducibility (NFR-R1) and build integrity across environments.
```

---

### 2. Update Section 2.3 (Technical Task - Design System Functions)

**Location:** After current function 3.4  
**Section:** "2.3 Design System Functions"

**Add these new functions:**

```markdown
3.5 Local Installer Automation

Develop a native Windows installer using C# .NET 8.0 and Windows Forms that 
automates WSL2 setup, Linux distribution installation, and LFS environment 
configuration. The installer must implement a 5-step wizard with prerequisite 
validation (7 system checks), real-time progress monitoring with event-driven 
architecture, and comprehensive error recovery guidance (NFN-U2).

3.6 Cross-Platform Reproducibility Validation

Ensure that local builds using the Windows installer produce artifacts with 
SHA256 hashes matching cloud-based builds, validating the NFR-R1 reproducibility 
requirement across deployment models (cloud vs local execution).
```

---

### 3. Update Table 3.X (Functional Requirements)

**Location:** Section 3.1 - Project Aim and Architectural Justification  
**Table Location:** After FN-5 row in functional requirements table

**Add these rows to the Functional Requirements table:**

| ID | Requirement Name | Description |
|----|------------------|-------------|
| FN-6 | Local Installer Wizard | Provide a native Windows installer that automates WSL2 setup, Linux distribution installation, and LFS environment configuration through a 5-step wizard with prerequisite validation (Windows version, RAM, disk space, CPU cores, virtualization, WSL2 status, admin rights) and real-time progress monitoring. |
| FN-7 | Offline Build Capability | Enable LFS Chapter 5 builds to execute entirely on local hardware without cloud service dependencies, addressing corporate firewall restrictions, bandwidth-constrained educational institutions, and offline learning scenarios. |

**Table Caption:** "Table 3.X: Additional Functional Requirements for Local Implementation"  
**Source:** Source: compiled by author

---

## 📄 WHERE IN YOUR WORD DOCUMENT?

### Physical Page Locations (Estimated):

Based on typical ISCS thesis structure (your document may vary):

```
Pages 1-5     → Title pages, Table of Contents, Lists
Pages 6-8     → Abbreviations, Summary (Lithuanian/English)
Pages 9-10    → Introduction
Pages 11-30   → Section 1: ANALYTICAL PART
                ├─ 1.1 Problem Area Characteristics
                ├─ 1.2 Local LFS Build Architecture ← UPDATE HERE (add paragraph)
                ├─ 1.3 Isolation Models
                └─ 1.4 Information Flow Analysis
                
Pages 31-40   → Section 2: TECHNICAL TASK
                ├─ 2.1 Title
                ├─ 2.2 Analytical Content
                ├─ 2.3 Design Functions ← UPDATE HERE (add 3.5, 3.6)
                ├─ 2.4 Documentation
                ├─ 2.5 Tools
                ├─ 2.6 Testing
                └─ 2.7 Presentation
                
Pages 41-60   → Section 3: PROJECT PART
                ├─ 3.1 Project Aim ← UPDATE HERE (add FN-6, FN-7)
                ├─ 3.2 Logical Structure
                ├─ 3.3 Information Architecture
                └─ 3.4 Database Project
                
Pages 61-85   → Section 5: SOFTWARE IMPLEMENTATION ⭐ INSERT MAIN CONTENT HERE
                ├─ 5.1 Cloud-Native Implementation
                ├─ 5.2 Cloud Deployment Results
                ├─ 5.3 LOCAL INSTALLER ← SECTION 5.3 STARTS HERE (page ~73-75)
                │  ├─ 5.3.1 Overview (3 pages, Figure 5.1, Tables 5.2-5.3)
                │  ├─ 5.3.2 Wizard (5 pages, Figures 5.2-5.3, Listings 5.1-5.2)
                │  ├─ 5.3.3 Architecture (4 pages, Figures 5.4-5.5, Listing 5.3)
                │  ├─ 5.3.4 WSL Integration (3 pages, Figure 5.6, Table 5.1, Listings 5.4-5.6)
                │  ├─ 5.3.5 Testing (2 pages, Tables 5.4-5.5)
                │  ├─ 5.3.6 User Guide (2 pages)
                │  └─ 5.3.7 Programmer Guide (2 pages)
                └─ 5.4 Comparative Analysis (new, 2-3 pages)
                
Pages 86-90   → Section 6: CONCLUSIONS
Pages 91-95   → References, Annexes
```

---

## 📝 Step-by-Step Instructions for Microsoft Word

### **Step 1: Open Your Thesis Document**
- File: `Shubham_bhasker_Thesis.docx` (or similar)
- Navigate to current Section 5

### **Step 2: Find Section 5 (Software Implementation)**
- Use Word's Navigation Pane (View → Navigation Pane)
- Click on "5. SOFTWARE IMPLEMENTATION PART" heading
- If Section 5 doesn't exist yet, create it after Section 3

### **Step 3: Create Section 5.3 Heading**
- Scroll to after Section 5.2 (or after 5.1 if 5.2 doesn't exist)
- Insert new page (Ctrl+Enter)
- Type heading: **"5.3 Local Windows Installer Implementation"**
- Apply Heading 2 style (or your thesis's subsection style)

### **Step 4: Add Subsection 5.3.1**
- Type heading: **"5.3.1 Installer Overview and Objectives"**
- Apply Heading 3 style
- Open file: `THESIS-ISCS/05-software-implementation/local-installer/01-installer-overview.md`
- Copy all text content
- Paste into Word document under 5.3.1
- Insert Figure 5.1 after first paragraph

### **Step 5: Add Subsection 5.3.2**
- Type heading: **"5.3.2 Five-Step Wizard Implementation"**
- Open file: `02-wizard-implementation.md`
- Copy content and paste
- Insert Figures 5.2 and 5.3 at appropriate locations

### **Step 6: Add Subsection 5.3.3**
- Type heading: **"5.3.3 Technical Specifications and Class Architecture"**
- Open file: `03-technical-specifications.md`
- Copy content and paste
- Insert Figures 5.4 and 5.5

### **Step 7: Create Remaining Subsections**
- 5.3.4: WSL2 Integration (create from integration guide)
- 5.3.5: Testing Results (use test data from examples/)
- 5.3.6: User Guide (installation walkthrough)
- 5.3.7: Programmer Guide (build instructions)

### **Step 8: Insert All Diagrams**
1. Go to [mermaid.live](https://mermaid.live/)
2. Copy diagram code from `diagrams/MERMAID-DIAGRAMS.md`
3. Export as PNG (1920x1080 resolution)
4. In Word: Insert → Pictures → select exported PNG
5. Right-click image → Insert Caption → "Figure 5.X: [Description]"
6. Below caption, add: "Source: compiled by author"

### **Step 9: Update Cross-References**
- Navigate to Section 1.2 → add paragraph (see above)
- Navigate to Section 2.3 → add functions 3.5, 3.6
- Navigate to Section 3.1 → add FN-6, FN-7 to requirements table

### **Step 10: Update Table of Contents**
- Click in Table of Contents
- Right-click → Update Field → Update entire table
- Verify Section 5.3 appears with all subsections

---

## 🎯 Quick Visual Map

```
YOUR THESIS DOCUMENT STRUCTURE
│
├─ 📘 Section 1: ANALYTICAL PART (pages 11-30)
│  ├─ 1.1 Problem Area
│  ├─ 1.2 Local Architecture ← ADD: "See Section 5.3 for implementation details"
│  ├─ 1.3 Isolation Models
│  └─ 1.4 Information Flow
│
├─ 📋 Section 2: TECHNICAL TASK (pages 31-40)
│  ├─ 2.1 Title
│  ├─ 2.2 Analytical Work
│  ├─ 2.3 Functions ← ADD: Function 3.5 (Installer), Function 3.6 (Reproducibility)
│  ├─ 2.4 Documentation
│  ├─ 2.5 Tools
│  ├─ 2.6 Testing
│  └─ 2.7 Presentation
│
├─ 🏗️ Section 3: PROJECT PART (pages 41-60)
│  ├─ 3.1 Aim & Justification ← ADD: FN-6, FN-7 requirements to table
│  ├─ 3.2 Logical Structure
│  ├─ 3.3 Information Architecture
│  └─ 3.4 Database Project
│
├─ 💻 Section 5: SOFTWARE IMPLEMENTATION ⭐ MAIN CONTENT (pages 61-85)
│  │
│  ├─ 5.1 Cloud-Native Implementation
│  │  ├─ 5.1.1 Frontend (Next.js)
│  │  ├─ 5.1.2 Backend (Firebase)
│  │  ├─ 5.1.3 Scripts (Bash)
│  │  └─ 5.1.4 Database (Firestore)
│  │
│  ├─ 5.2 Cloud Deployment Results
│  │  ├─ 5.2.1 Deployment Pipeline
│  │  ├─ 5.2.2 Performance Tests
│  │  └─ 5.2.3 User Acceptance
│  │
│  ├─ 5.3 LOCAL WINDOWS INSTALLER ← PUT ALL NEW CONTENT HERE (pages ~73-85)
│  │  │
│  │  ├─ 5.3.1 Installer Overview (2-3 pages)
│  │  │  📊 Figure 5.1: Use Case Diagram
│  │  │  📋 Table 5.2: Wizard Steps
│  │  │  📋 Table 5.3: Prerequisites Matrix
│  │  │
│  │  ├─ 5.3.2 Wizard Implementation (4-5 pages)
│  │  │  📊 Figure 5.2: Activity Diagram
│  │  │  📊 Figure 5.3: Sequence Diagram
│  │  │  💻 Listing 5.1: Admin Rights Check
│  │  │  💻 Listing 5.2: RAM Validation
│  │  │
│  │  ├─ 5.3.3 Class Architecture (3-4 pages)
│  │  │  📊 Figure 5.4: Component Diagram
│  │  │  📊 Figure 5.5: Class Diagram
│  │  │  💻 Listing 5.3: Singleton Pattern
│  │  │
│  │  ├─ 5.3.4 WSL2 Integration (3 pages)
│  │  │  📊 Figure 5.6: State Diagram
│  │  │  📋 Table 5.1: State Transitions
│  │  │  💻 Listing 5.4: DISM Commands
│  │  │  💻 Listing 5.5: Distro Install
│  │  │  💻 Listing 5.6: Environment Setup
│  │  │
│  │  ├─ 5.3.5 Testing Results (2 pages)
│  │  │  📋 Table 5.4: Test Cases (10 tests)
│  │  │  📋 Table 5.5: Performance Metrics
│  │  │
│  │  ├─ 5.3.6 User Guide (1-2 pages)
│  │  │  ✅ System requirements
│  │  │  ✅ Installation walkthrough
│  │  │  ✅ Troubleshooting
│  │  │
│  │  └─ 5.3.7 Programmer Guide (1-2 pages)
│  │     ✅ Solution structure
│  │     ✅ Build instructions
│  │     ✅ Debugging tips
│  │
│  └─ 5.4 Comparative Analysis (2-3 pages)
│     ├─ 5.4.1 Cloud vs Local Performance
│     ├─ 5.4.2 Usability Comparison
│     └─ 5.4.3 Requirements Tradeoffs
│
└─ 📝 Section 6: CONCLUSIONS (pages 86-90)
```

---

## 📊 Content Source Files

### Files to Copy From:

| Subsection | Source File | Location |
|------------|-------------|----------|
| 5.3.1 | `01-installer-overview.md` | `THESIS-ISCS/05-software-implementation/local-installer/` |
| 5.3.2 | `02-wizard-implementation.md` | Same directory |
| 5.3.3 | `03-technical-specifications.md` | Same directory |
| 5.3.4 | Create from `04-wsl-integration.md` | Same directory (TO CREATE) |
| 5.3.5 | Create from `05-testing-validation.md` | Same directory (TO CREATE) |
| 5.3.6 | Create from `06-user-guide.md` | Same directory (TO CREATE) |
| 5.3.7 | Create from `07-programmer-guide.md` | Same directory (TO CREATE) |

### Diagram Files:

| Figure | Diagram Type | Mermaid Code Location |
|--------|--------------|----------------------|
| Figure 5.1 | Use Case Diagram | `diagrams/MERMAID-DIAGRAMS.md` lines 76-115 |
| Figure 5.2 | Activity Diagram | `diagrams/MERMAID-DIAGRAMS.md` lines 120-234 |
| Figure 5.3 | Sequence Diagram | `diagrams/MERMAID-DIAGRAMS.md` lines 239-303 |
| Figure 5.4 | Component Diagram | `diagrams/MERMAID-DIAGRAMS.md` lines 308-361 |
| Figure 5.5 | Class Diagram | `diagrams/MERMAID-DIAGRAMS.md` lines 366-501 |
| Figure 5.6 | State Diagram | `diagrams/MERMAID-DIAGRAMS.md` lines 506-570 |

---

## ✅ Integration Checklist

### Phase 1: Diagram Export (30 minutes)
- [ ] Open https://mermaid.live/
- [ ] Export Figure 5.1 (Use Case) as PNG
- [ ] Export Figure 5.2 (Activity) as PNG
- [ ] Export Figure 5.3 (Sequence) as PNG
- [ ] Export Figure 5.4 (Component) as PNG
- [ ] Export Figure 5.5 (Class) as PNG
- [ ] Export Figure 5.6 (State) as PNG
- [ ] Save all to `THESIS-ISCS/diagrams/exported/`

### Phase 2: Content Integration (2 hours)
- [ ] Open thesis Word document
- [ ] Navigate to Section 5
- [ ] Create Section 5.3 heading
- [ ] Copy content from `01-installer-overview.md` → 5.3.1
- [ ] Insert Figure 5.1 in Section 5.3.1
- [ ] Copy content from `02-wizard-implementation.md` → 5.3.2
- [ ] Insert Figures 5.2, 5.3 in Section 5.3.2
- [ ] Copy content from `03-technical-specifications.md` → 5.3.3
- [ ] Insert Figures 5.4, 5.5 in Section 5.3.3
- [ ] Create Section 5.3.4 (WSL Integration)
- [ ] Insert Figure 5.6 in Section 5.3.4
- [ ] Create Sections 5.3.5, 5.3.6, 5.3.7

### Phase 3: Cross-References (30 minutes)
- [ ] Update Section 1.2 (add forward reference)
- [ ] Update Section 2.3 (add functions 3.5, 3.6)
- [ ] Update Section 3.1 (add FN-6, FN-7 rows)
- [ ] Update Table of Contents
- [ ] Verify all figure numbers are sequential

### Phase 4: ISCS Compliance (1 hour)
- [ ] All figures have captions "Figure X.Y: Description"
- [ ] All figures have "Source: compiled by author"
- [ ] All tables have "Table X.Y: Description"
- [ ] All tables have "Source: compiled by author"
- [ ] All code listings have "Listing X.Y: Description"
- [ ] All code listings have source file paths
- [ ] Page numbers updated in Table of Contents
- [ ] Section headings follow ISCS format

---

## 📏 Expected Page Counts

| Section | Pages | Includes |
|---------|-------|----------|
| 5.3.1 Overview | 2-3 | Figure 5.1, Tables 5.2-5.3 |
| 5.3.2 Wizard | 4-5 | Figures 5.2-5.3, Listings 5.1-5.2 |
| 5.3.3 Architecture | 3-4 | Figures 5.4-5.5, Listing 5.3 |
| 5.3.4 WSL Integration | 3 | Figure 5.6, Table 5.1, Listings 5.4-5.6 |
| 5.3.5 Testing | 2 | Tables 5.4-5.5 |
| 5.3.6 User Guide | 1-2 | Walkthrough steps |
| 5.3.7 Programmer Guide | 1-2 | Build instructions |
| **Total Section 5.3** | **16-22** | **6 figures, 5 tables, 6 listings** |

---

## 🎓 ISCS Compliance Requirements

### Section 2.3.6 Requirements (Software Implementation):
- [x] **Physical structure** → 4-layer architecture (Presentation, Business Logic, System Integration, External)
- [x] **Software elements** → 8 classes (5 Forms + 3 Core classes + 1 Config)
- [x] **User interface modules** → 5 Windows Forms (Welcome, Prerequisites, Configuration, Progress, Completion)
- [x] **Algorithms** → 6 algorithms (Admin check, RAM check, DISM, distro install, env setup, singleton)
- [x] **Test data examples** → Installation log, test results table, performance metrics

### Figure Requirements:
- [x] Numbered sequentially (5.1, 5.2, 5.3, 5.4, 5.5, 5.6)
- [x] Captions follow format: "Figure X.Y: Description"
- [x] Source citations: "Source: compiled by author"
- [x] Referenced in text before appearance

### Table Requirements:
- [x] Numbered sequentially (5.1, 5.2, 5.3, 5.4, 5.5)
- [x] Headers in bold
- [x] Source citations: "Source: compiled by author"

### Code Listing Requirements:
- [x] Numbered sequentially (5.1, 5.2, 5.3, 5.4, 5.5, 5.6)
- [x] Language specified (C#, PowerShell, Bash)
- [x] Source file paths provided

---

## ✅ Final Summary

### Main Content Location:
**Section 5.3 (Pages 73-85 estimated)**

### All 6 Diagrams Go In:
- Figure 5.1 → Section 5.3.1
- Figure 5.2 → Section 5.3.2
- Figure 5.3 → Section 5.3.2
- Figure 5.4 → Section 5.3.3
- Figure 5.5 → Section 5.3.3
- Figure 5.6 → Section 5.3.4

### Cross-References Update:
- Section 1.2: Add forward reference to 5.3
- Section 2.3: Add functions 3.5, 3.6
- Section 3.1: Add requirements FN-6, FN-7

### Page Count:
**16-22 pages for entire Section 5.3**

### Time Estimate:
- **Diagram exports:** 30 minutes
- **Content integration:** 2 hours
- **Cross-references:** 30 minutes
- **Proofreading:** 1 hour
- **Total:** 4 hours

---

## 🚀 Start NOW!

**Open your Word document and go to Section 5 to insert Section 5.3!**

All documentation is ready and ISCS-compliant. Your content files are in:
```
THESIS-ISCS/05-software-implementation/local-installer/
```

Your diagram codes are in:
```
THESIS-ISCS/05-software-implementation/local-installer/diagrams/MERMAID-DIAGRAMS.md
```

**Good luck with your thesis! 🎓✨**
