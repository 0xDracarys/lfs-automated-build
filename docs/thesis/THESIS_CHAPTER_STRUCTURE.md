# LFS AUTOMATED BUILD SYSTEM
## Bachelor's Thesis Chapter Structure and Requirements
### Information Systems and Cyber Security

**Total Pages Target:** 40-50 pages (40 pages text + 10 pages diagrams/figures)

---

## THESIS STRUCTURE OVERVIEW

### Unnumbered Sections (Mandatory)
1. **Title Page**
2. **CONTENTS** (Auto-generated Table of Contents)
3. **LIST OF FIGURES** (if applicable)
4. **LIST OF TABLES** (if applicable)
5. **LIST OF ABBREVIATIONS**
6. **INTRODUCTION** (3-4 pages)
7. **Main Body** - Chapters 1-4 (numbered)
8. **CONCLUSIONS** (2-3 pages)
9. **SUMMARY** (in Lithuanian, 1 page)
10. **LIST OF REFERENCES** (2-3 pages)
11. **ANNEXES** (if more than 5, separate list)

---

## DETAILED CHAPTER BREAKDOWN

### UNNUMBERED: CONTENTS
**Requirements:**
- Auto-generated using Word's Table of Contents tool
- "CONTENTS" title: 14pt, CAPITAL LETTERS, Bold, Center
- Chapter titles: 14pt, CAPITALS
- Subchapter titles: 12pt, Lower-case (first letter capital)
- Page numbers right-aligned with dot leaders
- The word "CONTENTS" itself is NOT included in the auto-generated TOC

**Example Structure:**
```
CONTENTS

LIST OF FIGURES................................................5
LIST OF TABLES.................................................6
LIST OF ABBREVIATIONS..........................................7
INTRODUCTION...................................................8

1. ANALYSIS OF LFS BUILD SYSTEMS AND TECHNOLOGIES............11
   1.1. Overview of Linux From Scratch methodology............11
   1.2. Analysis of existing build automation tools...........14
   1.3. Web-based learning platforms for system administration.18
   1.4. Summary of chapter.....................................22

2. DESIGN OF THE LFS AUTOMATED BUILD SYSTEM..................23
   2.1. System architecture and component design..............23
   ...
```

---

### UNNUMBERED: LIST OF FIGURES
**Format:**
```
LIST OF FIGURES

Figure 1. System Architecture Diagram...........................25
Figure 2. Data Flow from User Interface to Docker Container.....28
Figure 3. Multi-stage Docker Build Process......................32
Figure 4. Firestore Database Schema.............................36
Figure 5. LFS Build Pipeline Sequence...........................40
Figure 6. Chapter 5 Toolchain Build Flow........................45
Figure 7. User Authentication Flow..............................50
Figure 8. Cloud Run Job Execution Process.......................54
Figure 9. Dashboard Component Structure.........................58
Figure 10. Test Coverage Results................................65
```

**Estimated:** 15-20 figures

---

### UNNUMBERED: LIST OF TABLES
**Format:**
```
LIST OF TABLES

Table 1. Technology Stack Comparison............................15
Table 2. Frontend Dependencies and Versions.....................24
Table 3. Backend Services and Their Responsibilities............27
Table 4. Firestore Collections and Fields.......................37
Table 5. Build Performance Metrics..............................48
Table 6. Test Coverage Summary..................................66
Table 7. Hardware Requirements Justification....................70
Table 8. Docker Image Layer Sizes...............................33
```

**Estimated:** 8-12 tables

---

### UNNUMBERED: LIST OF ABBREVIATIONS
**Format:** Alphabetical order, two-column layout
```
LIST OF ABBREVIATIONS

AI      – Artificial Intelligence
API     – Application Programming Interface
CDN     – Content Delivery Network
CI/CD   – Continuous Integration/Continuous Deployment
CPU     – Central Processing Unit
CSS     – Cascading Style Sheets
DOM     – Document Object Model
GCC     – GNU Compiler Collection
GCS     – Google Cloud Storage
HTTP    – Hypertext Transfer Protocol
JS      – JavaScript
JSON    – JavaScript Object Notation
LFS     – Linux From Scratch
MCP     – Model Context Protocol
NFR     – Non-Functional Requirement
npm     – Node Package Manager
OS      – Operating System
RAM     – Random Access Memory
REST    – Representational State Transfer
RLS     – Row-Level Security
SDK     – Software Development Kit
SPA     – Single Page Application
SQL     – Structured Query Language
SSH     – Secure Shell
SSR     – Server-Side Rendering
UI      – User Interface
URL     – Uniform Resource Locator
VM      – Virtual Machine
WSL     – Windows Subsystem for Linux
```

**Estimated:** 30-40 abbreviations

---

### UNNUMBERED: INTRODUCTION
**Length:** 3-4 pages

**Content Requirements:**
1. **Background and Context** (0.5-1 page)
   - Importance of understanding operating systems at a low level
   - Challenges faced by beginners learning Linux system internals
   - Gap between theoretical knowledge and practical system building

2. **Problem Statement** (0.5 page)
   - Manual LFS builds are time-consuming (20-40 hours)
   - Lack of automated error recovery mechanisms
   - Absence of interactive learning platforms for LFS
   - Difficulty tracking progress across multi-day builds

3. **Research Aim and Objectives** (0.5 page)
   - **Aim:** Develop an automated LFS build system with integrated learning platform
   - **Objectives:**
     - Design containerized build automation framework
     - Implement cloud-based build execution system
     - Create interactive web-based learning interface
     - Develop progress tracking and error recovery mechanisms
     - Ensure reproducible builds across different environments

4. **Scope and Limitations** (0.5 page)
   - **Scope:**
     - LFS version 12.0
     - Debian-based build environment
     - Web-based frontend (Next.js)
     - Firebase/Google Cloud backend
   - **Limitations:**
     - Does not support custom kernel configurations
     - Limited to x86_64 architecture
     - Requires stable internet connection for cloud builds

5. **Methodology** (0.5 page)
   - Software development approach (Agile/Iterative)
   - Testing methodology (Unit, Integration, E2E)
   - Tools and technologies overview

6. **Thesis Structure Overview** (0.5 page)
   - Brief description of each chapter
   - How chapters relate to objectives

**Writing Style:**
- Personal voice acceptable in introduction
- Clear problem-solution narrative
- Engaging but professional tone
- Avoid overly technical jargon in this section

---

## NUMBERED CHAPTERS (Main Body)

### CHAPTER 1: ANALYSIS OF LFS BUILD SYSTEMS AND TECHNOLOGIES
**Title Format:** 14pt, CAPITALS, Bold, Center, New Page
**Length:** 10-12 pages

**Introductory Paragraph:** (0.25 page)
"This chapter examines the existing approaches to Linux From Scratch builds, analyzes available automation tools, and reviews related web-based learning platforms. The analysis establishes the theoretical foundation for the system design and identifies gaps in current solutions."

#### 1.1. Overview of Linux From Scratch methodology
**Length:** 2.5-3 pages

**Content:**
- History and purpose of LFS (0.5 page)
- LFS build phases overview (1 page):
  - Chapter 5: Temporary toolchain construction
  - Chapter 6: Basic system software
  - Chapter 7: System configuration
  - Chapter 8-11: Additional components
- Manual build process challenges (0.5 page)
- Learning benefits of LFS (0.5 page)
- **Include:** Table comparing LFS versions 11.0, 11.3, 12.0
- **Include:** Figure showing LFS build dependency tree

**References:** LFS documentation, Linux kernel books, system administration guides

#### 1.2. Analysis of existing build automation tools
**Length:** 3-3.5 pages

**Content:**
- **Docker-based solutions** (1 page)
  - Review of existing LFS Docker containers
  - Analysis of automated-lfs/ALFS projects
  - Limitations of current containerized approaches
  
- **Cloud-based build systems** (1 page)
  - GitHub Actions for LFS builds
  - Travis CI examples
  - Jenkins pipelines
  - Comparison table of features
  
- **Build orchestration frameworks** (1 page)
  - Make-based automation
  - Bash script collections
  - Python-based tools (Jhalfs, ALFS)
  - **Table:** Comparison of automation approaches

**Include:**
- Table 1: "Comparison of LFS Automation Tools"
- Figure: "Typical Docker-based LFS Build Flow"

#### 1.3. Web-based learning platforms for system administration
**Length:** 2.5-3 pages

**Content:**
- **Interactive coding platforms** (1 page)
  - Codecademy, freeCodeCamp models
  - Terminal-in-browser technologies (xterm.js)
  - Progress tracking implementations
  
- **Documentation platforms** (0.5 page)
  - Read the Docs
  - GitBook
  - MkDocs
  
- **Linux learning platforms** (1 page)
  - LinuxJourney.com
  - OverTheWire
  - Katacoda/KillerCoda
  - **Table:** Feature comparison
  
- **Gap analysis** (0.5 page)
  - What's missing in current platforms
  - Opportunity for integrated LFS platform

#### 1.4. Technology stack analysis
**Length:** 2-2.5 pages

**Content:**
- **Frontend frameworks** (0.75 page)
  - React ecosystem (Next.js, Create React App)
  - Vue.js, Angular comparison
  - Justification for Next.js selection
  
- **Backend platforms** (0.75 page)
  - Firebase vs. custom Node.js backend
  - Google Cloud Platform services
  - Serverless architecture benefits
  
- **Containerization technologies** (0.5 page)
  - Docker vs. Podman
  - Cloud Run vs. Kubernetes
  - **Table:** "Technology Selection Criteria"

#### 1.5. Summary of chapter
**Length:** 0.5 page

**Content:**
- Key findings from analysis
- Identified gaps in existing solutions
- Selected technologies justification
- Transition to design chapter

**Chapter 1 Total:** ~11 pages

---

### CHAPTER 2: DESIGN OF THE LFS AUTOMATED BUILD SYSTEM
**Title Format:** 14pt, CAPITALS, Bold, Center, New Page
**Length:** 10-12 pages

**Introductory Paragraph:** (0.25 page)
"This chapter presents the architectural design of the LFS Automated Build System, describing the system components, their interactions, and the design decisions that ensure scalability, security, and usability."

#### 2.1. System architecture and component design
**Length:** 3-3.5 pages

**Content:**
- **Overall architecture** (1 page)
  - Three-tier architecture (Presentation, Application, Data)
  - Cloud-native design principles
  - Microservices approach
  - **Figure 1:** "System Architecture Diagram" (full system)
  
- **Component breakdown** (1.5 pages)
  - Frontend application (Next.js SPA)
  - Backend services (Firebase Functions)
  - Build execution layer (Cloud Run)
  - Data persistence layer (Firestore, GCS)
  - **Figure 2:** "Component Interaction Diagram"
  
- **Design patterns** (0.5 page)
  - Observer pattern for real-time updates
  - Factory pattern for build job creation
  - Singleton for Firebase connections

#### 2.2. Frontend architecture design
**Length:** 2.5-3 pages

**Content:**
- **Application structure** (1 page)
  - Next.js App Router architecture
  - Page routing strategy
  - Component hierarchy
  - **Figure:** "Frontend Component Tree"
  
- **State management** (0.75 page)
  - React Context API usage
  - Client-side state vs. server state
  - Real-time data synchronization
  
- **User interface design** (0.75 page)
  - Dashboard layout
  - Wizard flow design
  - Terminal emulator interface
  - Responsive design considerations
  
- **Authentication flow** (0.5 page)
  - Firebase Auth integration
  - Protected route implementation
  - **Figure:** "User Authentication Flow"

#### 2.3. Backend services architecture
**Length:** 2.5-3 pages

**Content:**
- **Cloud Functions design** (1 page)
  - onBuildSubmitted trigger function
  - executeLfsBuild Pub/Sub function
  - Function orchestration
  - **Figure:** "Cloud Function Execution Flow"
  
- **Build orchestration** (1 page)
  - Pub/Sub messaging architecture
  - Cloud Run Job execution
  - Environment variable injection
  - **Figure:** "Build Job Lifecycle"
  
- **Helper services** (0.5 page)
  - Firestore logger design
  - GCS uploader implementation
  - Error handling strategy

#### 2.4. Database schema design
**Length:** 2-2.5 pages

**Content:**
- **Firestore collections** (1.5 pages)
  - `builds` collection structure
  - `buildLogs` collection design
  - `users` collection and subcollections
  - User progress tracking schema
  - **Figure:** "Firestore Database Schema Diagram"
  - **Table:** "Firestore Collections and Fields"
  
- **Security rules design** (0.5 page)
  - Row-level security policies
  - Authentication-based access control
  - Demo vs. production rules

#### 2.5. Docker containerization design
**Length:** 2-2.5 pages

**Content:**
- **Multi-stage build strategy** (1 page)
  - 9-layer architecture rationale
  - Layer caching optimization
  - Build artifact management
  - **Figure:** "Docker Multi-stage Build Layers"
  
- **Container configuration** (0.75 page)
  - Base image selection (Debian Bookworm)
  - Environment variables design
  - Volume mount strategy
  
- **Isolation and security** (0.5 page)
  - User context switching design
  - Network isolation
  - Resource limits

#### 2.6. Summary of chapter
**Length:** 0.5 page

**Chapter 2 Total:** ~11 pages

---

### CHAPTER 3: IMPLEMENTATION OF THE LFS AUTOMATED BUILD SYSTEM
**Title Format:** 14pt, CAPITALS, Bold, Center, New Page
**Length:** 12-14 pages

**Introductory Paragraph:** (0.25 page)
"This chapter describes the practical implementation of the designed system, covering the development of frontend components, backend services, build automation scripts, and the integration of all system parts."

#### 3.1. Frontend application implementation
**Length:** 3-3.5 pages

**Content:**
- **Technology stack implementation** (0.5 page)
  - Next.js 16.0.1 setup
  - Tailwind CSS 4.0 configuration
  - TypeScript configuration
  
- **Key components** (1.5 pages)
  - Dashboard component implementation
  - Wizard system implementation
  - Terminal emulator implementation
  - Code examples for each component
  - **Code Listing 1:** "Dashboard Component Structure"
  
- **State management** (0.75 page)
  - AuthContext implementation
  - WizardContext with localStorage persistence
  - Real-time Firestore listeners
  - **Code Listing 2:** "Progress Service Implementation"
  
- **API integration** (0.5 page)
  - Firebase SDK integration
  - API route handlers
  - Error handling

#### 3.2. Backend services implementation
**Length:** 3-3.5 pages

**Content:**
- **Cloud Functions** (1.5 pages)
  - onBuildSubmitted function implementation
  - executeLfsBuild function implementation
  - Pub/Sub message handling
  - **Code Listing 3:** "onBuildSubmitted Function"
  - **Code Listing 4:** "Cloud Run Job Execution"
  
- **Helper scripts** (1 page)
  - firestore-logger.js implementation
  - gcs-uploader.js implementation
  - Error retry logic
  - **Code Listing 5:** "GCS Upload with Retry"
  
- **Build orchestration** (0.75 page)
  - lfs-build.sh main script
  - Progress tracking implementation
  - Status update mechanism

#### 3.3. LFS build automation implementation
**Length:** 3.5-4 pages

**Content:**
- **Build script architecture** (1 page)
  - lfs-build.sh structure
  - Chapter 5 build script (lfs-chapter5-real.sh)
  - Function organization
  - **Code Listing 6:** "Build Script Main Flow"
  
- **Package compilation** (1.5 pages)
  - Binutils Pass 1 implementation
  - GCC Pass 1 implementation
  - Glibc compilation
  - Toolchain finalization
  - **Code Listing 7:** "GCC Build Function"
  
- **Error handling and recovery** (0.75 page)
  - Checkpoint system implementation
  - Trap-based error catching
  - Logging mechanism
  
- **Progress tracking** (0.5 page)
  - Firestore log writing
  - Build status updates
  - Real-time synchronization

#### 3.4. Docker container implementation
**Length:** 2-2.5 pages

**Content:**
- **Dockerfile creation** (1.5 pages)
  - Multi-stage build implementation
  - Layer-by-layer construction
  - Verification at each stage
  - **Code Listing 8:** "Dockerfile Key Layers"
  
- **Container orchestration** (0.75 page)
  - Cloud Run Job configuration
  - Environment variable injection
  - Volume mounting implementation

#### 3.5. Summary of chapter
**Length:** 0.5 page

**Chapter 3 Total:** ~13 pages

---

### CHAPTER 4: TESTING AND EVALUATION
**Title Format:** 14pt, CAPITALS, Bold, Center, New Page
**Length:** 8-10 pages

**Introductory Paragraph:** (0.25 page)
"This chapter presents the testing methodology, test results, performance evaluation, and validation of the system against the defined requirements."

#### 4.1. Testing methodology
**Length:** 1.5-2 pages

**Content:**
- **Test strategy** (0.5 page)
  - Unit testing approach
  - Integration testing approach
  - End-to-end testing approach
  
- **Testing tools** (0.5 page)
  - Vitest configuration
  - React Testing Library
  - Playwright for E2E tests
  - **Table:** "Testing Tools and Purposes"
  
- **Test coverage requirements** (0.5 page)
  - Target coverage percentages
  - Critical path identification

#### 4.2. Unit and integration testing
**Length:** 2.5-3 pages

**Content:**
- **Frontend component tests** (1 page)
  - Authentication tests
  - Terminal emulator tests
  - Navigation tests
  - **Code Listing 9:** "Authentication Test Example"
  - **Table:** "Frontend Test Coverage"
  
- **Backend function tests** (1 page)
  - Cloud Function unit tests
  - Helper script tests
  - Firestore integration tests
  - **Code Listing 10:** "Progress API Test"
  
- **Test results** (0.5 page)
  - Coverage statistics
  - Pass/fail rates
  - **Figure:** "Test Coverage Report"

#### 4.3. Build process testing
**Length:** 1.5-2 pages

**Content:**
- **Chapter 5 build validation** (0.75 page)
  - Toolchain functionality tests
  - Package installation verification
  - Build reproducibility tests
  
- **Error recovery testing** (0.75 page)
  - Simulated build failures
  - Checkpoint recovery validation
  - Logging accuracy verification

#### 4.4. Performance evaluation
**Length:** 2-2.5 pages

**Content:**
- **Build time measurements** (1 page)
  - Single-core vs. multi-core performance
  - Chapter 5 compilation times
  - Total build duration
  - **Table:** "Build Performance Metrics"
  - **Figure:** "Build Time vs. CPU Cores"
  
- **Resource utilization** (0.75 page)
  - Memory usage analysis
  - CPU utilization patterns
  - Storage requirements
  - **Figure:** "Resource Consumption Graph"
  
- **Scalability testing** (0.5 page)
  - Concurrent build jobs
  - Cloud Run performance
  - Database query performance

#### 4.5. Requirements validation
**Length:** 1.5-2 pages

**Content:**
- **Functional requirements** (0.75 page)
  - Build automation verification
  - Progress tracking validation
  - User authentication testing
  - **Table:** "Functional Requirements Checklist"
  
- **Non-functional requirements** (0.75 page)
  - Reproducibility (NFN1) validation
  - Isolation (NFN5) verification
  - Performance requirements
  - **Table:** "Non-Functional Requirements Validation"

#### 4.6. Summary of chapter
**Length:** 0.5 page

**Chapter 4 Total:** ~9 pages

---

### UNNUMBERED: CONCLUSIONS
**Length:** 2-3 pages

**Content Structure:**

1. **Achievement of Objectives** (0.75-1 page)
   - Restate each objective from Introduction
   - Confirm achievement with evidence
   - Example: "The first objective was to design a containerized build automation framework. This was achieved through the implementation of a 9-layer Docker multi-stage build..."

2. **Key Findings** (0.5 page)
   - Build time reduction: Manual (20-40 hours) → Automated (1.5-2 hours)
   - Reproducibility: 100% consistent builds with version pinning
   - User engagement: Interactive learning platform reduces learning curve

3. **Contributions** (0.5 page)
   - First integrated LFS automation + learning platform
   - Novel approach to progress tracking via Firestore
   - Reusable Docker containerization strategy

4. **Limitations and Future Work** (0.75-1 page)
   - **Limitations:**
     - Single architecture support (x86_64)
     - Requires cloud connectivity
     - Limited customization options
   - **Future Work:**
     - Multi-architecture support (ARM, RISC-V)
     - Offline build mode
     - Custom kernel configuration wizard
     - Package selection interface
     - Build optimization techniques

5. **Final Statement** (0.25 page)
   - Impact on Linux education
   - Contribution to open-source community

**Writing Style:**
- Professional, objective tone
- Past tense for achievements
- Future tense for recommendations
- No new information introduced

---

### UNNUMBERED: SUMMARY (in Lithuanian)
**Length:** 1 page
**Language:** Lithuanian

**Content:**
- Thesis topic and aim
- Main objectives
- Methodology summary
- Key results
- Conclusions

**Note:** This is a direct Lithuanian translation of the Introduction and Conclusions condensed into one page.

---

### UNNUMBERED: LIST OF REFERENCES
**Length:** 2-3 pages
**Format:** Auto-generated bibliography using Word's References tool

**Categories:**

1. **Books and Textbooks** (5-8 sources)
   - Kerrisk, M. (2010). *The Linux Programming Interface*
   - Love, R. (2013). *Linux System Programming*
   - Ward, B. (2021). *How Linux Works*
   - Nemeth, E. et al. (2017). *UNIX and Linux System Administration Handbook*

2. **Linux From Scratch Documentation** (2-3 sources)
   - LFS Development Team. (2023). *Linux From Scratch Version 12.0*
   - BLFS Development Team. (2023). *Beyond Linux From Scratch*

3. **Academic Papers** (3-5 sources)
   - Papers on containerization
   - Papers on cloud-based build systems
   - Papers on web-based learning platforms

4. **Online Documentation** (10-15 sources)
   - Next.js documentation
   - Firebase documentation
   - Google Cloud documentation
   - Docker documentation
   - React documentation

5. **GitHub Repositories** (3-5 sources)
   - Existing LFS automation projects
   - Reference implementations

6. **Web Resources** (5-8 sources)
   - Medium articles on DevOps
   - Blog posts on React patterns
   - Technical tutorials

**Total References:** 30-40 sources

**Citation Style:** IEEE or Harvard (check university requirements)

**Format Example:**
```
[1] M. Kerrisk, *The Linux Programming Interface: A Linux and UNIX System Programming Handbook*, San Francisco, CA, USA: No Starch Press, 2010.

[2] Linux From Scratch Development Team, "Linux From Scratch Version 12.0," [Online]. Available: https://www.linuxfromscratch.org/lfs/view/12.0/. [Accessed: 10-Dec-2025].

[3] Vercel, "Next.js Documentation," [Online]. Available: https://nextjs.org/docs. [Accessed: 10-Dec-2025].
```

---

### ANNEXES

**Total Annexes:** 8-12 (requires separate list)

#### ANNEX 1: Source Code Repository Structure
**Content:**
- Directory tree of project
- File organization explanation
- Configuration files list

#### ANNEX 2: Dockerfile Complete Source
**Content:**
- Full 235-line Dockerfile
- Layer-by-layer comments

#### ANNEX 3: Build Script Source Code
**Content:**
- Complete lfs-build.sh (936 lines)
- Function documentation

#### ANNEX 4: Chapter 5 Build Script
**Content:**
- Complete lfs-chapter5-real.sh
- Package build functions

#### ANNEX 5: Frontend Component Examples
**Content:**
- Dashboard component full code
- Wizard component full code

#### ANNEX 6: Cloud Function Source Code
**Content:**
- onBuildSubmitted function
- executeLfsBuild function

#### ANNEX 7: Firestore Security Rules
**Content:**
- Complete firestore.rules file
- Rule explanations

#### ANNEX 8: Test Suite Examples
**Content:**
- Complete test files
- Test coverage reports

#### ANNEX 9: Build Performance Data
**Content:**
- Raw performance measurements
- Resource utilization logs

#### ANNEX 10: User Guide
**Content:**
- Step-by-step usage instructions
- Screenshots of UI

#### ANNEX 11: API Documentation
**Content:**
- REST API endpoints
- Request/response examples

#### ANNEX 12: Database Schema Documentation
**Content:**
- Detailed field descriptions
- Sample documents

**ANNEX PAGE FORMAT:**
```
                                                           ANNEX 1

                        Source Code Repository Structure

[Content starts here...]
```

---

## FORMATTING REQUIREMENTS SUMMARY

### Chapter Titles
- **Font:** 14pt, Bold
- **Alignment:** Center
- **Case:** CAPITAL LETTERS
- **Spacing:** New page for each chapter
- **Example:** **CHAPTER 1: ANALYSIS OF LFS BUILD SYSTEMS AND TECHNOLOGIES**

### Subchapter Titles (e.g., 1.1, 1.2)
- **Font:** 12pt, Bold
- **Alignment:** Left
- **Case:** Lower-case (except first letter)
- **Spacing:** One blank line above and below
- **Numbering:** 1.1., 1.2., etc.
- **Example:** **1.1. Overview of Linux From Scratch methodology**

### Sub-subchapter Titles (e.g., 1.1.1, 1.1.2)
- **Font:** 12pt, Bold
- **Alignment:** Left
- **Case:** Lower-case (except first letter)
- **Numbering:** 1.1.1., 1.1.2., etc.
- **Example:** **1.1.1. Historical development of LFS**

### Body Text
- **Font:** 12pt, Normal
- **Alignment:** Justified
- **Line Spacing:** 1.5
- **Paragraph Spacing:** 6pt after

### Figures
- **Placement:** After first reference in text
- **Caption:** Below figure, centered
- **Format:** "Figure X. Description"
- **Numbering:** Sequential throughout thesis
- **Example:** *Figure 1. System Architecture Diagram*

### Tables
- **Placement:** After first reference in text
- **Caption:** Above table, centered
- **Format:** "Table X. Description"
- **Numbering:** Sequential throughout thesis
- **Example:** *Table 1. Technology Stack Comparison*

### Code Listings
- **Font:** Courier New or Consolas, 10pt
- **Background:** Light gray box
- **Caption:** Above listing
- **Format:** "Code Listing X. Description"

---

## PAGE COUNT BREAKDOWN

### Without Diagrams (40 pages)
- Introduction: 3-4 pages
- Chapter 1: 10-12 pages
- Chapter 2: 10-12 pages
- Chapter 3: 12-14 pages
- Chapter 4: 8-10 pages
- Conclusions: 2-3 pages
- **Total:** ~40 pages

### With Diagrams (50 pages)
- Add 10 pages for:
  - 15-20 figures (some full-page)
  - 8-12 tables
  - Code listings

### Additional Pages
- Contents: 2-3 pages
- Lists (Figures/Tables/Abbreviations): 3-4 pages
- Summary: 1 page
- References: 2-3 pages
- Annexes: 20-30 pages

**Grand Total:** ~70-80 pages including front matter and annexes

---

## WRITING TIPS

1. **Start each chapter with context** - Explain why this chapter matters
2. **End each chapter with summary** - Recap key points and transition
3. **Use transitions** - Connect sections smoothly
4. **Reference figures/tables** - "As shown in Figure 3..."
5. **Cite sources** - Every claim needs a reference [1]
6. **Be specific** - Use actual numbers, versions, metrics
7. **Active voice** - "We implemented..." not "It was implemented..."
8. **Past tense for implementation** - "The system was developed..."
9. **Present tense for facts** - "React is a JavaScript library..."
10. **Avoid repetition** - Each section should add new information

---

## QUALITY CHECKLIST

- [ ] All chapters start on new page
- [ ] All titles formatted correctly (size, bold, alignment)
- [ ] All figures numbered sequentially and referenced
- [ ] All tables numbered sequentially and referenced
- [ ] All abbreviations listed and used consistently
- [ ] All sources cited in List of References
- [ ] Auto-generated Table of Contents
- [ ] Auto-generated Bibliography
- [ ] Page numbers in footer
- [ ] Headers with chapter names
- [ ] Consistent spacing (1.5 line spacing)
- [ ] Justified text alignment
- [ ] No orphan/widow lines
- [ ] All annexes referenced in text
- [ ] Lithuanian summary provided
- [ ] Spell-checked and grammar-checked

---

*This structure follows the ISCS Methodological Requirements and is based on the reference thesis Muhammad_Muslim_Thesis.docx*

**Generated:** December 10, 2025
**For:** LFS Automated Build System Bachelor's Thesis
