# DIAGRAM PLACEMENT TABLE
## LFS Automated Build System - Complete Figure Reference

**Document Purpose:** Master reference for all diagrams in Chapter 3 (Project Part)  
**Total Diagrams:** 24 figures (Figures 13-36)  
**Date:** December 11, 2025

---

## TABLE OF CONTENTS
1. [Complete Diagram Index](#complete-diagram-index)
2. [Section 3.1 Diagrams](#section-31-project-objectives)
3. [Section 3.2.1 Diagrams](#section-321-hierarchy-of-functions)
4. [Section 3.2.2 Diagrams](#section-322-data-flow-diagrams)
5. [Section 3.2.3 Diagrams](#section-323-conceptual-object-model)
6. [Section 3.2.4 Diagrams](#section-324-system-states-and-processes)
7. [Section 3.2.5 Diagrams](#section-325-formal-calculations)
8. [Section 3.3 Diagrams](#section-33-information-equipment)
9. [Section 3.4 Diagrams](#section-34-software-project)

---

## COMPLETE DIAGRAM INDEX

| Figure # | Diagram Title | Diagram Type | Section | Subsection | Status |
|----------|---------------|--------------|---------|------------|--------|
| **13** | Project Objectives Hierarchy Diagram | Hierarchical Tree | 3.1 | 3.1.1 Restatement of Project Aim and Objectives | Required |
| **14** | Constraint-Solution Mapping Flowchart | Swimlane Flowchart | 3.1 | 3.1.2 Architectural Rationale: Justification of the Hybrid WSL/chroot PoC | Required |
| **15** | Complete Use Case Diagram | UML Use Case | 3.2.1 | 3.2.1 Hierarchy of Computerized Functions (HCIS) | Required |
| **16** | System Context Diagram | Context Diagram | 3.2.1 | 3.2.1 Hierarchy of Computerized Functions (HCIS) | Required |
| **17** | DFD Level 0 (Context Diagram) | Data Flow Diagram | 3.2.2 | 3.2.2 Conceptual Data Model and Entity Relationships (CDM) | Required |
| **18** | DFD Level 1 (Major Processes) | Data Flow Diagram | 3.2.2 | 3.2.2 Conceptual Data Model and Entity Relationships (CDM) | Required |
| **19** | DFD Level 2 (Local Build Subprocess) | Data Flow Diagram | 3.2.2 | 3.2.2 Conceptual Data Model and Entity Relationships (CDM) | Required |
| **20** | Entity-Relationship Diagram (ERD) | ERD Crow's Foot | 3.2.3 | 3.2.3 System Dynamics and Build State Diagram | Required |
| **21** | Firestore Collection Hierarchy Diagram | Tree Hierarchy | 3.2.3 | 3.2.3 System Dynamics and Build State Diagram | Required |
| **22** | Build Submission Sequence Diagram | UML Sequence | 3.2.4 | 3.2.4 Formal Description of LFS Build Procedures and Optimization | Required |
| **23** | Cloud Build Execution Activity Diagram | UML Activity | 3.2.4 | 3.2.4 Formal Description of LFS Build Procedures and Optimization | Required |
| **24** | Build Lifecycle State Machine | UML State Machine | 3.2.4 | 3.2.4 Formal Description of LFS Build Procedures and Optimization | Required |
| **25** | Learning Progress State Machine | UML State Machine | 3.2.4 | 3.2.4 Formal Description of LFS Build Procedures and Optimization | Required |
| **26** | Amdahl's Law Parallelization Analysis | Line Graph | 3.2.5 | 3.2.5 Formal Calculation: Performance Optimization via Amdahl's Law | Required |
| **27** | Storage Requirements Breakdown | Stacked Bar Chart | 3.2.5 | 3.2.5 Storage and Memory Calculations | Required |
| **28** | Memory Utilization Timeline | Area Chart | 3.2.5 | 3.2.5 Storage and Memory Calculations | Required |
| **29** | Input Data Structure Diagram | Data Structure | 3.3 | 3.3.1 Input Data Specification (Configuration and Environment Variables) | Required |
| **30** | Output Data Structure Diagram | Data Structure | 3.3 | 3.3.3 Output Data Specification and Artifact Management | Required |
| **31** | Database Schema Diagram | DB Schema | 3.3 | 3.3.2 Database Project (Detailed Entity Schemas) | Required |
| **32** | High-Level System Architecture | Layered Architecture | 3.4 | 3.4.1 Hybrid WSL/Chroot Architecture (The Physical Model) | Required |
| **33** | Component Interaction Diagram | UML Component | 3.4 | 3.4.2 Toolchain Management and Dependency Closure | Required |
| **34** | Deployment Diagram | UML Deployment | 3.4 | 3.4.2 Toolchain Management and Dependency Closure | Required |
| **35** | Algorithm Flowchart - Build Orchestration | Flowchart | 3.4 | 3.4.3 System Scripting and Structured Observability | Required |
| **36** | Testing Strategy Matrix | Matrix Diagram | 3.5 | 3.5.1 Functional and Non-Functional Test Case Specification | Required |

---

## SECTION 3.1: PROJECT AIM AND ARCHITECTURAL JUSTIFICATION

### Figure 13: Project Objectives Hierarchy Diagram
- **Section:** 3.1 Project Aim and Architectural Justification
- **Subsection:** 3.1.1 Restatement of Project Aim and Objectives
- **Placement:** Insert after the paragraph describing "three primary goals: simplifying the historically difficult LFS build process, providing robust reproducibility, and offering comprehensive learning material"
- **Heading Level:** Place after paragraph under "#### 3.1.1 Restatement of Project Aim and Objectives"
- **Diagram Type:** Hierarchical Tree Diagram / Organizational Chart
- **Key Content:** 
  - Root: LFS Automated Build System central aim
  - Level 1: Three main branches (Simplify, Reproducibility, Learning)
  - Level 2: Architectural constraints (Cloud Run timeout, WSL2/Chroot)
- **Referenced Code:** General architecture overview
- **Caption Length:** ~180 words

### Figure 14: Constraint-Solution Mapping Flowchart
- **Section:** 3.1 Project Aim and Architectural Justification
- **Subsection:** 3.1.2 Architectural Rationale: Justification of the Hybrid WSL/chroot PoC
- **Placement:** Insert at the end of subsection 3.1.2, after the paragraph about "fulfillment of Accessibility (NFR-P02)"
- **Heading Level:** Place after final paragraph under "#### 3.1.2 Architectural Rationale"
- **Diagram Type:** Swimlane Flowchart (3 lanes)
- **Key Content:**
  - Lane 1: Technical Constraints (Cloud Run timeout, WSL2, permissions)
  - Lane 2: Architectural Solutions (Hybrid arch, PowerShell, init scripts)
  - Lane 3: NFR Fulfillment (Performance, Portability, Usability)
- **Referenced Code:** BUILD-LFS-CORRECT.ps1, init-lfs-env.sh
- **Caption Length:** ~170 words

---

## SECTION 3.2: LOGICAL STRUCTURE OF THE AUTOMATED BUILD SYSTEM

### Figure 15: Complete Use Case Diagram
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.1 Hierarchy of Computerized Functions (HCIS)
- **Placement:** Insert after the description of UC-8 (Manage System), before "Hierarchy of Computerised Functions" subsection
- **Heading Level:** Place after UC-8 description, add heading "##### Use Case Diagram"
- **Diagram Type:** UML Use Case Diagram
- **Key Content:**
  - 8 use cases (UC-1 through UC-8)
  - 6 actors (3 human: Anonymous Visitor, End User, Admin; 3 system: GCP, LFS Mirrors, Firebase)
  - Include/Extend relationships
  - Triggers relationship (UC-4 → UC-7)
- **Referenced Code:** Functions across frontend, Firebase, and build scripts
- **Caption Length:** ~195 words

### Figure 16: System Context Diagram
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.1 Hierarchy of Computerized Functions (HCIS)
- **Placement:** Insert immediately after Figure 15, before Functions 1.0-10.0 descriptions
- **Heading Level:** Place after Figure 15, add heading "##### System Context"
- **Diagram Type:** Context Diagram (Level 0 DFD style)
- **Key Content:**
  - Central circle: LFS Automated Build System
  - 5 external entities: End User, Firebase Auth, GCP, LFS Mirrors, Windows Host/WSL2
  - Bidirectional data flows with labels
  - Layer annotations (User Interaction, Authentication, Source Acquisition, Local Execution)
- **Referenced Code:** System boundary definition across all components
- **Caption Length:** ~185 words

---

## SECTION 3.2.2: CONCEPTUAL DATA MODEL AND ENTITY RELATIONSHIPS

### Figure 17: DFD Level 0 (Context Diagram)
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.2 Conceptual Data Model and Entity Relationships (CDM)
- **Specific Location:** Data Flow Context
- **Placement:** Insert at the end of subsection 3.2.2, after "Data Flows (Output)" section
- **Heading Level:** Add "##### Figure 17: DFD Level 0" before insertion
- **Diagram Type:** Data Flow Diagram Level 0 (Gane-Sarson notation)
- **Key Content:**
  - Single process: 0.0 LFS Automated Build System
  - 4 external entities
  - 13 primary data flows (labeled D1-D13)
  - Flow types: solid thick (high-volume), solid thin (control), dashed (reference)
- **Referenced Code:** Overall system data flows
- **Caption Length:** ~180 words

### Figure 18: DFD Level 1 (Major Processes)
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.2 Conceptual Data Model and Entity Relationships (CDM)
- **Specific Location:** Major Processes Flow
- **Placement:** Insert at the end of subsection, after Process 5.0 description
- **Heading Level:** Add "##### Figure 18: DFD Level 1" before insertion
- **Diagram Type:** Data Flow Diagram Level 1 (Gane-Sarson notation)
- **Key Content:**
  - 5 major processes (1.0-5.0): Authenticate, Submit, Execute, Monitor, Retrieve
  - 4 data stores: D1 users, D2 builds, D3 buildLogs, D4 GCS
  - 20+ data flows (F1-F20)
  - Real-time subscriptions via Firestore
- **Referenced Code:** functions/index.js (Cloud Functions), lfs-build.sh
- **Caption Length:** ~220 words

### Figure 19: DFD Level 2 (Local Build Subprocess)
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.2 Conceptual Data Model and Entity Relationships (CDM)
- **Specific Location:** Local Build Data Flow (WSL/Chroot Architecture)
- **Placement:** Insert at the end of subsection, after Process 8.0 description
- **Heading Level:** Add "##### Figure 19: DFD Level 2 - Local Build" before insertion
- **Diagram Type:** Data Flow Diagram Level 2 (Process 3.0 decomposition)
- **Key Content:**
  - 6 subprocesses (3.1-3.6): Initialize, Build Toolchain, Chroot Transition, In-Chroot Build, Kernel Build, Artifact Package
  - 3 local data stores: D5 (env vars), D6 (/mnt/lfs), D7 (lfs-output/)
  - Sequential flow with data transformations
- **Referenced Code:** BUILD-LFS-CORRECT.ps1, init-lfs-env.sh, build-lfs-complete-local.sh, chroot-and-build.sh, build-lfs-in-chroot.sh
- **Caption Length:** ~235 words

---

## SECTION 3.2.3: SYSTEM DYNAMICS AND BUILD STATE DIAGRAM

### Figure 20: Entity-Relationship Diagram (ERD)
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.3 System Dynamics and Build State Diagram
- **Specific Location:** Entity Relationships
- **Placement:** Insert at the end of subsection 3.2.3, before state transition discussion
- **Heading Level:** Add "##### Figure 20: Entity-Relationship Diagram" before insertion
- **Diagram Type:** Entity-Relationship Diagram (Crow's Foot notation)
- **Key Content:**
  - 6 entities: users, builds, buildLogs, enrollments, lessonProgress, analytics
  - 4 primary relationships (R1-R4) with cardinalities
  - Attributes with data types (PK, FK)
  - Denormalized fields highlighted
- **Referenced Code:** Firestore schema from firestore.rules, functions/index.js
- **Caption Length:** ~215 words

### Figure 21: Firestore Collection Hierarchy Diagram
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.3 System Dynamics and Build State Diagram
- **Placement:** Insert immediately after Figure 20, continuing entity relationship discussion
- **Heading Level:** Add "##### Figure 21: Firestore Collection Hierarchy" before insertion
- **Diagram Type:** Tree Hierarchy Diagram
- **Key Content:**
  - Root collections: users/, builds/, analytics/
  - Subcollections: enrollments/, lessonProgress/ (under users/), buildLogs/ (under builds/)
  - Design rationale annotations (root vs subcollection decisions)
  - Cardinality indicators
- **Referenced Code:** firebase.json, firestore.rules, firestore.indexes.json
- **Caption Length:** ~175 words

---

## SECTION 3.2.4: FORMAL DESCRIPTION OF LFS BUILD PROCEDURES AND OPTIMIZATION

### Figure 22: Build Submission Sequence Diagram
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization
- **Specific Location:** Build Submission Flow
- **Placement:** Insert at the end of build flow description, after Step 10 description
- **Heading Level:** Add "##### Figure 22: Build Submission Sequence" before insertion
- **Diagram Type:** UML Sequence Diagram
- **Key Content:**
  - 5 participants: User, Next.js Frontend, Firebase Functions, Firestore, Pub/Sub
  - 15 interaction steps
  - Two-phase update pattern (SUBMITTED → PENDING)
  - Real-time subscription establishment
- **Referenced Code:** functions/index.js (onBuildSubmitted, lines 50-120)
- **Caption Length:** ~175 words

### Figure 23: Cloud Build Execution Activity Diagram
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization
- **Specific Location:** Cloud Build Execution Activity
- **Placement:** Insert at the end of subsection, after workflow steps description
- **Heading Level:** Add "##### Figure 23: Cloud Build Activity Diagram" before insertion
- **Diagram Type:** UML Activity Diagram with Swimlanes
- **Key Content:**
  - 3 swimlanes: Pub/Sub Trigger, Cloud Run Container, Firestore/GCS
  - Decision points: toolchain success, package compilation success
  - Error paths with FAILED status updates
  - Timing annotations (~68 minutes total)
- **Referenced Code:** lfs-build.sh (lines 100-500), Dockerfile
- **Caption Length:** ~185 words

### Figure 24: Build Lifecycle State Machine
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization
- **Specific Location:** Build Lifecycle State Machine
- **Placement:** Insert at the end of subsection, after state descriptions
- **Heading Level:** Add "##### Figure 24: Build Lifecycle State Machine" before insertion
- **Diagram Type:** UML State Machine Diagram
- **Key Content:**
  - 5 states: SUBMITTED, PENDING, RUNNING, COMPLETED, FAILED
  - Transitions with guard conditions
  - Entry/Do/Exit actions per state
  - Self-loop for progress updates
  - Terminal states (no outgoing transitions)
- **Referenced Code:** functions/index.js (status updates), builds entity schema
- **Caption Length:** ~210 words

### Figure 25: Learning Progress State Machine
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization
- **Specific Location:** State Machine continuation
- **Placement:** Insert immediately after Figure 24, at end of subsection 3.2.4
- **Heading Level:** Add "##### Figure 25: Learning Progress State Machine" before insertion
- **Diagram Type:** UML State Machine Diagram
- **Key Content:**
  - 5 states: NOT_ENROLLED, ENROLLED, IN_PROGRESS, COMPLETED, ABANDONED
  - Bidirectional transition (ABANDONED ↔ IN_PROGRESS)
  - Temporal guard conditions (30-day inactivity)
  - Progress tracking self-loop
- **Referenced Code:** enrollments and lessonProgress entities
- **Caption Length:** ~165 words

---

## SECTION 3.2.4 (CONTINUED): FORMAL CALCULATIONS

### Figure 26: Amdahl's Law Parallelization Analysis
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization (Continued)
- **Specific Location:** Performance Optimization via Amdahl's Law
- **Placement:** Insert at the end of subsection, after mathematical derivation
- **Heading Level:** Add "##### Figure 26: Amdahl's Law Analysis" before insertion
- **Diagram Type:** Line Graph / Performance Chart
- **Key Content:**
  - X-axis: Number of CPU cores (1-16)
  - Y-axis: Theoretical speedup (1x-10x)
  - 3 curves: Ideal linear, Theoretical (p=0.80), Measured (actual builds)
  - Key efficiency thresholds marked (4-core, 8-core, 12-core)
  - Annotation box with optimization recommendations
- **Referenced Code:** init-lfs-env.sh (MAKEFLAGS=-j12), build duration measurements
- **Caption Length:** ~240 words

### Figure 27: Storage Requirements Breakdown
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization (Continued)
- **Specific Location:** Storage and Memory Calculations
- **Placement:** Insert at the end of subsection, after GCS storage cost calculation
- **Heading Level:** Add "##### Figure 27: Storage Breakdown" before insertion
- **Diagram Type:** Stacked Bar Chart / Waterfall Diagram
- **Key Content:**
  - Horizontal stacked bar (7.82 GB total)
  - 5 components: Source Tarballs (1.2 GB), Toolchain (1.5 GB), Final System (3.8 GB), Kernel (0.92 GB), Logs (0.4 GB)
  - Breakdown table with percentages
  - Compression analysis (TAR.GZ: 2.8 GB, 64.2% reduction)
- **Referenced Code:** Package sizes from LFS documentation, artifact measurements
- **Caption Length:** ~220 words

### Figure 28: Memory Utilization Timeline
- **Section:** 3.2 Logical Structure of the Automated Build System
- **Subsection:** 3.2.4 Formal Description of LFS Build Procedures and Optimization (Continued)
- **Specific Location:** Storage and Memory Calculations (continued)
- **Placement:** Insert immediately after Figure 27, at end of subsection
- **Heading Level:** Add "##### Figure 28: Memory Timeline" before insertion
- **Diagram Type:** Stacked Area Chart
- **Key Content:**
  - X-axis: Build time (0-70 minutes)
  - Y-axis: Memory usage (0-8 GB)
  - 4 stacked areas: Base System, Build Tools, Package Compilation, Filesystem Cache
  - Peak annotations (systemd at 40 min: 7.5 GB)
  - Reference lines (8 GB limit, 6 GB recommended)
- **Referenced Code:** Memory profiling data, systemd/gcc/Python compilation peaks
- **Caption Length:** ~245 words

---

## SECTION 3.3: INFORMATION ARCHITECTURE AND DATA SPECIFICATION

### Figure 29: Input Data Structure Diagram
- **Section:** 3.3 Information Architecture and Data Specification
- **Subsection:** 3.3.1 Input Data Specification (Configuration and Environment Variables)
- **Placement:** Insert at the end of subsection 3.3.1, after describing input forms and API endpoints
- **Heading Level:** Add "##### Figure 29: Input Data Structure" before insertion
- **Diagram Type:** Data Structure Diagram / JSON Schema Visualization
- **Key Content:**
  - BuildSubmissionRequest schema tree
  - Required fields: projectName, lfsVersion, userId, email
  - Optional fields: buildOptions (nested object), additionalNotes
  - Validation rules callout box (JWT, sanitization, business logic)
  - Example JSON
- **Referenced Code:** functions/index.js (input validation, lines 80-150)
- **Caption Length:** ~185 words

### Figure 30: Output Data Structure Diagram
- **Section:** 3.3 Information Architecture and Data Specification
- **Subsection:** 3.3.3 Output Data Specification and Artifact Management
- **Placement:** Insert at the end of subsection 3.3.3, after describing artifact formats
- **Heading Level:** Add "##### Figure 30: Output Data Structure" before insertion
- **Diagram Type:** Data Structure Diagram / Response Schema
- **Key Content:**
  - 3 response types: BuildStatusResponse, BuildLogEntry[], ArtifactMetadata
  - Field specifications with data types
  - HTTP headers annotation
  - Cache-Control strategies
- **Referenced Code:** functions/index.js (response serialization, lines 200-300)
- **Caption Length:** ~195 words

### Figure 31: Database Schema Diagram (Firestore Collections)
- **Section:** 3.3 Information Architecture and Data Specification
- **Subsection:** 3.3.2 Database Project (Detailed Entity Schemas)
- **Placement:** Insert at the end of subsection 3.3.2, after all schema descriptions
- **Heading Level:** Add "##### Figure 31: Database Schema" before insertion
- **Diagram Type:** Database Schema Diagram
- **Key Content:**
  - 6 collection boxes: users, builds, buildLogs, enrollments, lessonProgress, analytics
  - Complete field specifications with data types
  - Composite indexes listed
  - Subcollection indicators
  - Security rules summary annotation
- **Referenced Code:** firestore.rules, firestore.indexes.json, firebase.json
- **Caption Length:** ~200 words

---

## SECTION 3.4: SOFTWARE ARCHITECTURE AND EXECUTION ENVIRONMENT

### Figure 32: High-Level System Architecture
- **Section:** 3.4 Software Architecture and Execution Environment
- **Subsection:** 3.4.1 Hybrid WSL/Chroot Architecture (The Physical Model)
- **Placement:** Insert at the end of subsection 3.4.1, after describing three-tier architecture
- **Heading Level:** Add "##### Figure 32: System Architecture" before insertion
- **Diagram Type:** Layered Architecture Diagram
- **Key Content:**
  - 4 layers: Presentation (Next.js), Business Logic (Firebase Functions), Execution (Cloud/Local paths), Data (Firestore/GCS/Local FS)
  - Technology stack labels per layer
  - Dual execution path (Cloud Run vs WSL2/chroot)
  - Cross-layer annotations
- **Referenced Code:** Overall architecture across all components
- **Caption Length:** ~230 words

### Figure 33: Component Interaction Diagram
- **Section:** 3.4 Software Architecture and Execution Environment
- **Subsection:** 3.4.2 Toolchain Management and Dependency Closure
- **Placement:** Insert in subsection 3.4.2, after describing component interfaces
- **Heading Level:** Add "##### Figure 33: Component Interaction" before insertion
- **Diagram Type:** UML Component Diagram
- **Key Content:**
  - 7 components: NextJS Frontend, Firebase Functions, Firebase Auth, Firestore, Pub/Sub, Cloud Storage, Build Executor
  - Interface specifications (IAuthService, IBuildService, IDatabase, IPubSub, IStorage, IRealtimeService, IBuildExecutor)
  - Provided/Required interfaces (lollipop notation)
  - Dependency arrows
- **Referenced Code:** Interface contracts across system
- **Caption Length:** ~210 words

### Figure 34: Deployment Diagram
- **Section:** 3.4 Software Architecture and Execution Environment
- **Subsection:** 3.4.2 Toolchain Management and Dependency Closure (continued)
- **Placement:** Insert immediately after Figure 33, at end of subsection 3.4.2
- **Heading Level:** Add "##### Figure 34: Deployment Diagram" before insertion
- **Diagram Type:** UML Deployment Diagram
- **Key Content:**
  - 8 execution nodes: User's Browser, Netlify CDN, Cloud Functions, Firestore, Cloud Storage, Firebase Auth, Pub/Sub, Windows Host (with nested WSL2)
  - Communication paths with protocols (HTTPS, WebSocket, gRPC)
  - Artifact deployments per node
  - Security annotations (TLS 1.3, JWT, IAM)
- **Referenced Code:** Deployment configurations, netlify.toml, firebase.json, cloudbuild.yaml
- **Caption Length:** ~215 words

### Figure 35: Algorithm Flowchart - Build Orchestration
- **Section:** 3.4 Software Architecture and Execution Environment
- **Subsection:** 3.4.3 System Scripting and Structured Observability
- **Placement:** Insert in subsection 3.4.3, after describing build orchestration logic
- **Heading Level:** Add "##### Figure 35: Build Orchestration Algorithm" before insertion
- **Diagram Type:** Detailed Algorithm Flowchart
- **Key Content:**
  - Sequential flow: WSL2 check → directory setup → init-lfs-env → Chapter 5 build → chroot transition → in-chroot build → kernel → packaging
  - 6 decision points with error exits (codes 1-5)
  - Timing annotations (T+0 to T+92min)
  - Error handling branches
- **Referenced Code:** BUILD-LFS-CORRECT.ps1 (complete flow)
- **Caption Length:** ~195 words

### Figure 36: Testing Strategy Matrix
- **Section:** 3.5 System Testing and Evaluation Plan
- **Subsection:** 3.5.1 Functional and Non-Functional Test Case Specification
- **Placement:** Insert at the end of subsection 3.5.1, after testing strategy description
- **Heading Level:** Add "##### Figure 36: Testing Matrix" before insertion
- **Diagram Type:** Matrix Diagram / Testing Coverage Table
- **Key Content:**
  - 5x5 matrix: Components (Next.js, Firebase Functions, Firestore, Build Scripts, WSL2) × Test Types (Unit, Integration, E2E, Security, Performance)
  - Priority levels (High/Medium/Low/N/A) with tools
  - Coverage targets and testing tools annotation
- **Referenced Code:** Test configurations, package.json test scripts
- **Caption Length:** ~185 words

---

## DIAGRAM CREATION WORKFLOW

### Phase 1: Preparation (Before Creating Diagrams)
1. **Read prompt guide:** Review DIAGRAM-PROMPTS-GUIDE.md for each figure
2. **Gather context:** Read the target markdown file section where diagram will be inserted
3. **Verify placement:** Confirm the exact heading/subheading location
4. **Check code references:** Ensure you understand the code files mentioned in caption

### Phase 2: Diagram Creation (Per Figure)
1. **Open draw.io** or preferred tool
2. **Set canvas size** as specified in prompt
3. **Follow prompt instructions** step-by-step
4. **Apply styling** for student-created appearance
5. **Export as PNG** (300 DPI) or SVG
6. **Name file:** `figure-{number}-{short-name}.png` (e.g., `figure-13-objectives-hierarchy.png`)

### Phase 3: Document Integration (Per Figure)
1. **Create diagrams folder:** `THESIS-ISCS/04-project-part/diagrams/`
2. **Copy image file** to diagrams folder
3. **Update markdown file:**
   - Add appropriate heading level
   - Insert image: `![Figure X: Title](../diagrams/figure-X-name.png)`
   - Add full caption from prompt guide
   - Add figure reference marker: `**[INSERT FIGURE X HERE]**` if diagram not yet created
4. **Update this table:** Change status from "Required" to "Completed"

### Phase 4: Quality Assurance (All Diagrams)
1. **Verify all 24 figures** are inserted in correct locations
2. **Check caption consistency** with DIAGRAM-PROMPTS-GUIDE.md
3. **Validate cross-references** between figures and text
4. **Test image links** (all display correctly)
5. **Update List of Figures** in thesis front matter (00-initial-pages/)

---

## FILE STRUCTURE FOR DIAGRAM STORAGE

```
THESIS-ISCS/
├── 04-project-part/
│   ├── diagrams/
│   │   ├── figure-13-objectives-hierarchy.png
│   │   ├── figure-14-constraint-solution-flowchart.png
│   │   ├── figure-15-use-case-diagram.png
│   │   ├── figure-16-system-context.png
│   │   ├── figure-17-dfd-level-0.png
│   │   ├── figure-18-dfd-level-1.png
│   │   ├── figure-19-dfd-level-2-local.png
│   │   ├── figure-20-erd-crows-foot.png
│   │   ├── figure-21-firestore-hierarchy.png
│   │   ├── figure-22-build-submission-sequence.png
│   │   ├── figure-23-cloud-build-activity.png
│   │   ├── figure-24-build-lifecycle-state-machine.png
│   │   ├── figure-25-learning-progress-state-machine.png
│   │   ├── figure-26-amdahl-law-analysis.png
│   │   ├── figure-27-storage-breakdown.png
│   │   ├── figure-28-memory-timeline.png
│   │   ├── figure-29-input-data-structure.png
│   │   ├── figure-30-output-data-structure.png
│   │   ├── figure-31-database-schema.png
│   │   ├── figure-32-system-architecture.png
│   │   ├── figure-33-component-interaction.png
│   │   ├── figure-34-deployment-diagram.png
│   │   ├── figure-35-build-orchestration-flowchart.png
│   │   └── figure-36-testing-matrix.png
│   ├── 01-project-objectives.md (Figures 13-14)
│   ├── 02-logic-structure/
│   │   ├── 01-hierarchy-of-functions.md (Figures 15-16)
│   │   ├── 02-data-flow-diagrams.md (Figures 17-19)
│   │   ├── 03-conceptual-object-model.md (Figures 20-21)
│   │   ├── 04-system-states-processes.md (Figures 22-25)
│   │   └── 05-formal-calculations.md (Figures 26-28)
│   ├── 03-information-equipment/
│   │   ├── 02-input-data-specification.md (Figure 29)
│   │   ├── 03-output-data-specification.md (Figure 30)
│   │   └── 04-database-project.md (Figure 31)
│   └── 04-software-project/
│       ├── 01-system-architecture.md (Figure 32)
│       ├── 02-interface-design.md (Figures 33-34)
│       ├── 03-algorithms.md (Figure 35)
│       └── 04-testing-strategy.md (Figure 36)
```

---

## CAPTION STYLE GUIDE

All captions follow this format:

```markdown
**Figure X. [Diagram Title]** showing [primary content description]. [Key insight 1]. [Key insight 2]. [Code reference with file names and line numbers]. [Relationship to other figures or architectural significance].
```

**Caption Requirements:**
- **Length:** 150-250 words per caption
- **Content:** Must reference actual codebase (file names, line numbers, functions)
- **Style:** Technical, objective, informative
- **Cross-references:** Link to related figures when relevant
- **Justification:** Explain why diagram matters (architectural decision, NFR fulfillment, etc.)

---

## PROGRESS TRACKING

| Section | Total Figures | Completed | Pending | Progress |
|---------|---------------|-----------|---------|----------|
| 3.1 Project Aim and Architectural Justification | 2 | 0 | 2 | 0% |
| 3.2.1 Hierarchy of Computerized Functions | 2 | 0 | 2 | 0% |
| 3.2.2 Conceptual Data Model | 3 | 0 | 3 | 0% |
| 3.2.3 System Dynamics and Build State | 2 | 0 | 2 | 0% |
| 3.2.4 Formal Description & Optimization | 4 | 0 | 4 | 0% |
| 3.2.4 (Continued) Formal Calculations | 3 | 0 | 3 | 0% |
| 3.3 Information Architecture | 3 | 0 | 3 | 0% |
| 3.4 Software Architecture | 3 | 0 | 3 | 0% |
| 3.5 System Testing | 2 | 0 | 2 | 0% |
| **TOTAL** | **24** | **0** | **24** | **0%** |

**Update Instructions:** After creating and inserting each diagram, update the "Completed" count and change "Pending" accordingly. Update "Progress" percentage.

---

**END OF DIAGRAM PLACEMENT TABLE**

**Next Steps:**
1. Create diagrams folder: `THESIS-ISCS/04-project-part/diagrams/`
2. Begin with Section 3.1 (Figures 13-14)
3. Use DIAGRAM-PROMPTS-GUIDE.md for detailed creation instructions
4. Insert figure placeholders in markdown files
5. Create actual diagrams using draw.io
6. Replace placeholders with actual images
7. Update progress tracking table above
