# COMPREHENSIVE DIAGRAM PROMPTS GUIDE
## LFS Automated Build System - ISCS Thesis Project Part (Chapter 4)

**Author:** Shubham Bhasker  
**Date:** December 11, 2025  
**Purpose:** Detailed prompts for creating all required diagrams manually on draw.io or similar platforms

---

## TABLE OF CONTENTS

1. [Section 4.1 Diagrams - Project Objectives](#section-41-diagrams)
2. [Section 4.2.1 Diagrams - Hierarchy of Functions](#section-421-diagrams)
3. [Section 4.2.2 Diagrams - Data Flow Diagrams](#section-422-diagrams)
4. [Section 4.2.3 Diagrams - Conceptual Object Model](#section-423-diagrams)
5. [Section 4.2.4 Diagrams - System States and Processes](#section-424-diagrams)
6. [Section 4.2.5 Diagrams - Formal Calculations](#section-425-diagrams)
7. [Section 4.3 Diagrams - Information Equipment](#section-43-diagrams)
8. [Section 4.4 Diagrams - Software Project](#section-44-diagrams)

---

## SECTION 4.1 DIAGRAMS - Project Objectives

### Figure 13: Project Objectives Hierarchy Diagram

**Location:** Insert after subsection 4.1.1 "Restatement of Project Aim and Objectives" (after the text describing the three primary goals)

**Diagram Type:** Hierarchical Tree Diagram / Organizational Chart

**Tool Settings (draw.io):**
- Canvas: A4 Landscape
- Style: Clean, professional tree layout
- Colors: Blue gradient for main objective, green for sub-objectives, yellow for NFRs

**Prompt for Creation:**

```
Create a hierarchical tree diagram with the following structure:

ROOT NODE (Top, Large Rectangle with rounded corners, Blue gradient fill):
"LFS Automated Build System"
"Central Aim: Containerized, Automated LFS Build with Educational Platform"

LEVEL 1 - THREE MAIN BRANCHES (Medium rectangles, Green gradient):
├── Branch 1: "Simplify Build Process"
│   Sub-nodes (Small rectangles, Light blue):
│   ├── "Eliminate manual user context switching"
│   ├── "Reduce 10-15hr manual time"
│   └── "Automate environment setup"
│
├── Branch 2: "Provide Reproducibility"
│   Sub-nodes:
│   ├── "Host-independent builds"
│   ├── "Two-pass toolchain verification"
│   └── "SHA256 hash stability (NFR-R01, NFR-R03)"
│
└── Branch 3: "Offer Learning Material"
    Sub-nodes:
    ├── "Interactive tutorial modules"
    ├── "Terminal emulation practice"
    └── "Real-time build monitoring"

LEVEL 2 - ARCHITECTURAL CONSTRAINTS (Dashed boxes, Orange):
Connected to root with dotted lines:
├── "Cloud Run 60-min timeout constraint"
├── "WSL2/Chroot hybrid architecture"
└── "Performance priority (NFR-P01)"

Add connection lines:
- Solid arrows from root to Level 1 branches
- Solid arrows from Level 1 to sub-nodes
- Dashed arrows from constraints to relevant branches

Labels on arrows:
- "fulfills" (root to Level 1)
- "implements" (Level 1 to sub-nodes)
- "constrains" (constraints to branches)

Legend (Bottom right corner):
- Blue: Main Objective
- Green: Primary Goals
- Light Blue: Implementation Details
- Orange: Constraints
- Solid Line: Direct implementation
- Dashed Line: Constraint influence
```

**Caption:** "Figure 13. Hierarchical decomposition of project objectives showing the relationship between the central aim, three primary goals, implementation mechanisms, and architectural constraints. The hybrid WSL/chroot architecture directly responds to Cloud Run timeout constraints while maintaining performance objectives (NFR-P01)."

---

### Figure 14: Constraint-Solution Mapping Flowchart

**Location:** Insert at the end of subsection 4.1.2 "Design Constraints" (after Table 16: Non-Functional Success Criteria)

**Diagram Type:** Swimlane Flowchart

**Tool Settings:**
- Canvas: A4 Portrait
- Style: Flowchart with swimlanes
- Colors: Different color for each constraint category

**Prompt for Creation:**

```
Create a swimlane flowchart with 3 vertical lanes:

LANE 1: "Technical Constraints" (Light Red background)
┌─────────────────────────────┐
│ START: Cloud Run 60-min     │
│ timeout constraint          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ DECISION: Can full build    │
│ complete in <60 min?        │
└──────┬─────────┬────────────┘
       │ NO      │ YES (not feasible)
       │         │
       ▼         ▼
┌─────────┐   ┌──────────────┐
│ Pivot   │   │ (Dead end)   │
│ Required│   │              │
└────┬────┘   └──────────────┘
     │
     ▼
┌─────────────────────────────┐
│ WSL2 Host Dependency        │
│ constraint                  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Filesystem Permission       │
│ Requirements                │
└──────────┬──────────────────┘

LANE 2: "Architectural Solutions" (Light Green background)
┌─────────────────────────────┐
│ Adopt Hybrid WSL/Chroot     │
│ Architecture                │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Prioritize Performance      │
│ (chroot vs Docker)          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ PowerShell Wrapper Layer    │
│ (BUILD-LFS-CORRECT.ps1)     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ init-lfs-env.sh             │
│ (ownership management)      │
└──────────┬──────────────────┘

LANE 3: "NFR Fulfillment" (Light Blue background)
┌─────────────────────────────┐
│ ✓ NFR-P01: Performance      │
│   (CPU ≈ host throughput)   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ ✓ NFR-P02: Portability      │
│   (Windows/macOS support)   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ ✓ NFR-U02: Usability        │
│   (simplified entry)        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ END: PoC Validation         │
│ Complete                    │
└─────────────────────────────┘

Connect lanes with horizontal arrows showing:
- Constraint → Solution (red arrows)
- Solution → NFR (green arrows)

Add labels on arrows:
- "necessitates"
- "implements"
- "validates"
```

**Caption:** "Figure 14. Constraint-solution mapping flowchart demonstrating how technical constraints (Cloud Run timeout, WSL2 dependency, filesystem permissions) drive architectural solutions (hybrid architecture, PowerShell wrappers, environment initialization) that fulfill Non-Functional Requirements (NFR-P01, NFR-P02, NFR-U02)."

---

## SECTION 4.2.1 DIAGRAMS - Hierarchy of Functions

### Figure 15: Complete Use Case Diagram

**Location:** Insert after subsection 4.2.1 "Use Case Diagram Description" (after UC-8 description, before "Hierarchy of Computerised Functions")

**Diagram Type:** UML Use Case Diagram

**Tool Settings:**
- Canvas: A4 Landscape
- Style: Standard UML notation
- Actors: Stick figures
- Use cases: Ovals
- System boundary: Rectangle

**Prompt for Creation:**

```
Create a UML Use Case Diagram:

SYSTEM BOUNDARY (Large rectangle):
┌─────────────────────────────────────────────────────────────┐
│        LFS Automated Build System                           │
│                                                             │
│  USE CASES (Ovals inside boundary):                        │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │ UC-1:            │    │ UC-2:            │            │
│  │ User             │    │ Browse Learning  │            │
│  │ Authentication   │    │ Modules          │            │
│  └──────────────────┘    └──────────────────┘            │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │ UC-3:            │    │ UC-4:            │            │
│  │ Practice         │    │ Submit Build     │            │
│  │ Commands         │    │ Request          │            │
│  └──────────────────┘    └──────────────────┘            │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │ UC-5:            │    │ UC-6:            │            │
│  │ Monitor Build    │    │ Download Build   │            │
│  │ Progress         │    │ Artifacts        │            │
│  └──────────────────┘    └──────────────────┘            │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │ UC-7:            │    │ UC-8:            │            │
│  │ Execute Build    │    │ Manage System    │            │
│  │ in Cloud         │    │ (Admin)          │            │
│  └──────────────────┘    └──────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

EXTERNAL ACTORS (Outside boundary, stick figures):

Left side:
┌─────────┐
│  👤     │ Anonymous Visitor
│         │ (connects to UC-1)
└─────────┘

┌─────────┐
│  👤     │ End User (Authenticated)
│         │ (connects to UC-1, UC-2, UC-3, UC-4, UC-5, UC-6)
└─────────┘

┌─────────┐
│  👤     │ System Administrator
│         │ (connects to UC-1, UC-8)
└─────────┘

Right side:
┌─────────┐
│  ⚙️     │ Google Cloud Platform
│         │ (connects to UC-7)
└─────────┘

┌─────────┐
│  📦     │ LFS Mirror Servers
│         │ (connects to UC-7)
└─────────┘

┌─────────┐
│  🔐     │ Firebase Services
│         │ (connects to UC-1)
└─────────┘

RELATIONSHIPS (Solid arrows from actors to use cases):
- Anonymous Visitor → UC-1
- End User → UC-1, UC-2, UC-3, UC-4, UC-5, UC-6
- System Administrator → UC-1, UC-8
- Google Cloud Platform → UC-7
- LFS Mirror Servers → UC-7
- Firebase Services → UC-1

INCLUDES RELATIONSHIPS (Dashed arrows with «include»):
- UC-2 ─«include»→ UC-1
- UC-3 ─«include»→ UC-2
- UC-4 ─«include»→ UC-1
- UC-5 ─«include»→ UC-4
- UC-6 ─«include»→ UC-5
- UC-8 ─«include»→ UC-1

EXTENDS RELATIONSHIPS (Dashed arrows with «extend»):
- UC-5 ←«extend»─ "Real-time log streaming"

TRIGGERS RELATIONSHIPS (Dashed arrow):
- UC-4 ─«triggers»→ UC-7

Legend (Bottom):
─────  Association
- - -→  Include
- - -→  Extend
👤      Actor (Human)
⚙️      Actor (System)
```

**Caption:** "Figure 15. Complete UML Use Case Diagram showing 8 primary use cases, 6 external actors (3 human, 3 system), and their relationships. The diagram illustrates how authenticated users interact with learning platform features (UC-2, UC-3) and build management workflows (UC-4, UC-5, UC-6), while cloud infrastructure (GCP) executes the actual compilation process (UC-7)."

---

### Figure 16: System Context Diagram

**Location:** Insert immediately after Figure 15 in subsection 4.2.1

**Diagram Type:** Context Diagram (Level 0 DFD style)

**Tool Settings:**
- Canvas: A4 Landscape
- Style: Context diagram with central system circle
- Colors: Blue center, green external entities

**Prompt for Creation:**

```
Create a System Context Diagram:

CENTER (Large circle, blue gradient):
┌─────────────────────────────┐
│                             │
│   LFS Automated Build       │
│   System                    │
│   (PoC Implementation)      │
│                             │
└─────────────────────────────┘

EXTERNAL ENTITIES (Rectangles around center, green):

Top Left:
┌─────────────────┐
│  End User       │
└────────┬────────┘
         │
         │ [Inputs]
         │ • Build requests
         │ • Authentication credentials
         │ • Learning progress events
         │
         │ [Outputs]
         │ • Build status updates
         │ • Build logs
         │ • Learning content
         │ • Artifacts
         ▼

Top Right:
┌─────────────────┐
│  Firebase Auth  │
└────────┬────────┘
         │
         │ [Inputs to System]
         │ • JWT tokens
         │ • User profile data
         │
         │ [Outputs from System]
         │ • Auth requests
         ▼

Right:
┌─────────────────┐
│  Google Cloud   │
│  Platform       │
└────────┬────────┘
         │
         │ [Inputs to System]
         │ • Pub/Sub messages
         │ • Container instances
         │
         │ [Outputs from System]
         │ • Firestore writes
         │ • GCS uploads
         │ • Cloud Run executions
         ▼

Bottom Right:
┌─────────────────┐
│  LFS Mirror     │
│  Servers        │
└────────┬────────┘
         │
         │ [Inputs to System]
         │ • Source packages (.tar.xz)
         │ • MD5/SHA256 checksums
         ▲

Bottom:
┌─────────────────┐
│  Windows Host   │
│  (WSL2)         │
└────────┬────────┘
         │
         │ [Inputs to System]
         │ • PowerShell commands
         │ • Host filesystem paths
         │
         │ [Outputs from System]
         │ • Build artifacts (local)
         │ • BUILDLOG files
         │ • Status updates
         ▲

Connect all entities to center circle with bidirectional arrows.
Label arrows with data flow names.

Add 4 corner annotations:
Top-Left corner: "User Interaction Layer"
Top-Right corner: "Authentication Layer"
Bottom-Right corner: "Source Acquisition Layer"
Bottom-Left corner: "Local Execution Layer"
```

**Caption:** "Figure 16. System Context Diagram (Level 0) showing the LFS Automated Build System boundary and its five primary external entities: End User (authentication and interaction), Firebase Auth (identity management), Google Cloud Platform (cloud infrastructure), LFS Mirror Servers (source package distribution), and Windows Host/WSL2 (local execution environment). Arrows indicate bidirectional data flows with specific data types labeled."

---

## SECTION 4.2.2 DIAGRAMS - Data Flow Diagrams

### Figure 17: DFD Level 0 (Context Diagram)

**Location:** Insert at the end of subsection 4.2.2.1 "DFD Level 0 - Context Diagram" (after "Data Flows (Output)" section)

**Diagram Type:** Data Flow Diagram Level 0

**Tool Settings:**
- Canvas: A4 Landscape
- Notation: Gane-Sarson style
- Process: Rounded rectangle
- External entities: Squares
- Data flows: Arrows with labels

**Prompt for Creation:**

```
Create DFD Level 0 using Gane-Sarson notation:

CENTER PROCESS (Large rounded rectangle, gradient blue):
┌────────────────────────────────────────┐
│         0.0                            │
│   LFS Automated Build System           │
│   (Hybrid WSL/Chroot + Cloud)          │
└────────────────────────────────────────┘

EXTERNAL ENTITIES (Squares, gray):

Position entities around center in circular arrangement:

TOP-LEFT:
┌──────────────────┐
│                  │
│    End User      │
│                  │
└──────────────────┘

TOP-CENTER:
┌──────────────────┐
│                  │
│  Firebase Auth   │
│                  │
└──────────────────┘

TOP-RIGHT:
┌──────────────────┐
│                  │
│  Google Cloud    │
│  Platform        │
│                  │
└──────────────────┘

BOTTOM-RIGHT:
┌──────────────────┐
│                  │
│  LFS Mirror      │
│  Servers         │
│                  │
└──────────────────┘

DATA FLOWS (Labeled arrows):

From End User → System:
→ "Build Request {buildId, userId, projectName, lfsVersion, buildOptions}"
→ "Authentication Credentials {email, password, OAuth token}"
→ "Learning Progress Events {moduleId, completion, quizScore}"

From System → End User:
← "Build Status Updates {status, progress, currentPackage}"
← "Build Logs {timestamp, level, message, packageName}"
← "Build Artifacts {TAR archive, signed URL}"
← "Learning Content {modules, tutorials, terminal responses}"

From Firebase Auth → System:
→ "JWT Tokens {uid, email, claims}"
→ "User Profile Data {displayName, photoURL, provider}"

From System → Firebase Auth:
← "Authentication Requests {verifyToken, createUser}"

From System → Google Cloud Platform:
← "Firestore Writes {builds, buildLogs, users, enrollments}"
← "GCS Uploads {artifacts, logs}"
← "Cloud Run Executions {container instantiation}"
← "Pub/Sub Messages {buildConfig, traceId}"

From Google Cloud Platform → System:
→ "Pub/Sub Delivery {buildId, configuration}"
→ "Container Resources {CPU, memory, disk}"

From LFS Mirror Servers → System:
→ "Source Packages {binutils.tar.xz, gcc.tar.xz, glibc.tar.xz, ...}"
→ "Package Checksums {MD5, SHA256}"

From System → LFS Mirror Servers:
← "Download Requests {wget, package name}"

Add flow numbers (D1, D2, etc.) on each arrow.
Use different arrow styles:
- Solid thick arrow: High-volume data (logs, artifacts)
- Solid thin arrow: Control messages (status, requests)
- Dashed arrow: Lookup/reference data (checksums, tokens)
```

**Caption:** "Figure 17. Data Flow Diagram Level 0 (Context Diagram) showing the LFS Automated Build System as a single process (0.0) with four external entities and thirteen primary data flows. Solid thick arrows indicate high-volume data transfers (build logs, artifacts), solid thin arrows represent control messages (status updates, requests), and dashed arrows denote reference data (authentication tokens, checksums). The diagram abstracts internal system complexity to focus on system boundary interactions."

---

### Figure 18: DFD Level 1 (Major Processes)

**Location:** Insert at the end of subsection 4.2.2.2 "DFD Level 1 - Major Processes" (after Process 5.0 description, before subsection 4.2.2.3)

**Diagram Type:** Data Flow Diagram Level 1

**Tool Settings:**
- Canvas: A3 Landscape (larger canvas needed for complexity)
- Notation: Gane-Sarson style
- Processes: Numbered circles
- Data stores: Open-ended rectangles

**Prompt for Creation:**

```
Create DFD Level 1 with 5 major processes and 4 data stores:

EXTERNAL ENTITIES (Squares at edges):
┌─────────────┐                              ┌─────────────┐
│  End User   │                              │ Firebase    │
│             │                              │ Auth        │
└─────────────┘                              └─────────────┘

┌─────────────┐                              ┌─────────────┐
│  LFS Mirror │                              │             │
│  Servers    │                              │             │
└─────────────┘                              └─────────────┘

PROCESSES (Numbered circles, positioned centrally):

Process 1.0 (Top-left):
    ┌─────────┐
    │   1.0   │
    │Authenti-│
    │  cate   │
    │  User   │
    └─────────┘

Process 2.0 (Top-center):
    ┌─────────┐
    │   2.0   │
    │ Submit  │
    │  Build  │
    │ Request │
    └─────────┘

Process 3.0 (Center):
    ┌─────────┐
    │   3.0   │
    │ Execute │
    │  Build  │
    │ in Cloud│
    └─────────┘

Process 4.0 (Bottom-left):
    ┌─────────┐
    │   4.0   │
    │ Monitor │
    │  Build  │
    │ Progress│
    └─────────┘

Process 5.0 (Bottom-right):
    ┌─────────┐
    │   5.0   │
    │Retrieve │
    │ Build   │
    │Artifacts│
    └─────────┘

DATA STORES (Open rectangles, positioned between processes):

D1 (Top):
    ┌────────────────────────────┐
    │  D1: users                 │
    └────────────────────────────┘

D2 (Center):
    ┌────────────────────────────┐
    │  D2: builds                │
    └────────────────────────────┘

D3 (Bottom-center):
    ┌────────────────────────────┐
    │  D3: buildLogs             │
    └────────────────────────────┘

D4 (Right):
    ┌────────────────────────────┐
    │  D4: Google Cloud Storage  │
    └────────────────────────────┘

DATA FLOWS (Labeled arrows between components):

End User → Process 1.0:
"credentials {email, password, OAuth}"

Process 1.0 → Firebase Auth:
"verifyIdToken(jwt)"

Firebase Auth → Process 1.0:
"{uid, email, verified}"

Process 1.0 ↔ D1:
Write: "user profile"
Read: "user data"

Process 1.0 → End User:
"JWT token, session"

End User → Process 2.0:
"build configuration"

Process 2.0 → D2:
Write: "build metadata {SUBMITTED status}"

Process 2.0 → D2:
Update: "{PENDING status, pendingAt}"

Process 2.0 → Process 3.0:
"Pub/Sub message {buildConfig}"

Process 3.0 ← LFS Mirrors:
"source packages"

Process 3.0 → D2:
Update: "{RUNNING status, currentPackage, progress}"

Process 3.0 → D3:
Write: "log entries {timestamp, level, message}"

Process 3.0 → D4:
Write: "artifact TAR.GZ"

Process 3.0 → D2:
Update: "{COMPLETED/FAILED, completedAt, artifactPath}"

End User → Process 4.0:
"buildId, auth token"

Process 4.0 ← D2:
Read: "build status, progress"

Process 4.0 ← D3:
Read: "log stream (real-time)"

Process 4.0 → End User:
"UI updates, log display"

End User → Process 5.0:
"download request, buildId"

Process 5.0 ← D2:
Read: "verify ownership, artifactPath"

Process 5.0 ← D4:
Read: "artifact file"

Process 5.0 → End User:
"signed URL, TAR download"

Add flow identifiers (F1, F2, ..., F20) on arrows.
Use arrow styles:
- Solid: Data read/write
- Dashed: Control flow
- Thick: High-volume streams
```

**Caption:** "Figure 18. Data Flow Diagram Level 1 decomposing the system into 5 major processes (1.0 Authenticate User, 2.0 Submit Build Request, 3.0 Execute Build in Cloud, 4.0 Monitor Build Progress, 5.0 Retrieve Build Artifacts) and 4 data stores (D1 users, D2 builds, D3 buildLogs, D4 GCS). Process 3.0 represents the core compilation workflow that reads from LFS Mirror Servers, writes to buildLogs for observability, and deposits final artifacts in Cloud Storage. Real-time monitoring (4.0) subscribes to buildLogs via Firestore listeners, enabling progress bar updates and log streaming to the frontend."

---

### Figure 19: DFD Level 2 (Local Build Subprocess)

**Location:** Insert at the end of subsection 4.2.2.5 "Local Build Data Flow (WSL/Chroot Architecture)" (after Process 8.0 description)

**Diagram Type:** Data Flow Diagram Level 2

**Tool Settings:**
- Canvas: A3 Landscape
- Focus: Local build subprocess decomposition

**Prompt for Creation:**

```
Create DFD Level 2 showing local build subprocess decomposition:

TITLE: "Process 3.0 Decomposition - Local Build Execution"

EXTERNAL ENTITIES (Outside boundary):
┌─────────────────┐
│  Windows Host   │
│  (PowerShell)   │
└─────────────────┘

┌─────────────────┐
│  LFS Mirror     │
│  Servers        │
└─────────────────┘

SUBPROCESS BOUNDARY:
┌─────────────────────────────────────────────────────────────────┐
│  3.0 Execute Build (Local WSL/Chroot Implementation)            │
│                                                                 │
│  SUBPROCESSES (Numbered 3.1, 3.2, ...):                       │
│                                                                 │
│      ┌─────────┐          ┌─────────┐          ┌─────────┐   │
│      │   3.1   │          │   3.2   │          │   3.3   │   │
│      │Initialize│   →     │  Build  │   →     │ Chroot  │   │
│      │  Local   │          │Toolchain│          │Transition│   │
│      │  Env     │          │(Ch. 5)  │          │         │   │
│      └─────────┘          └─────────┘          └─────────┘   │
│           │                     │                     │        │
│           ↓                     ↓                     ↓        │
│      ┌─────────┐          ┌─────────┐          ┌─────────┐   │
│      │   3.4   │          │   3.5   │          │   3.6   │   │
│      │ In-Chroot│   ←     │  Kernel  │   ←     │Artifact │   │
│      │  Build  │          │  Build   │          │ Package │   │
│      │(Ch. 6-8)│          │         │          │         │   │
│      └─────────┘          └─────────┘          └─────────┘   │
│                                                                 │
│  DATA STORES (Inside boundary):                               │
│                                                                 │
│  D5: ┌────────────────────────────────┐                      │
│      │ Shell Environment Variables     │                      │
│      │ ($LFS, $LFS_TGT, $PATH, etc.)  │                      │
│      └────────────────────────────────┘                      │
│                                                                 │
│  D6: ┌────────────────────────────────┐                      │
│      │ /mnt/lfs Filesystem Hierarchy   │                      │
│      │ (sources/, tools/, usr/, boot/) │                      │
│      └────────────────────────────────┘                      │
│                                                                 │
│  D7: ┌────────────────────────────────┐                      │
│      │ lfs-output/ (Artifacts)         │                      │
│      │ (BUILDLOG, metadata, TAR)       │                      │
│      └────────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DATA FLOWS:

Windows Host → 3.1:
"PowerShell command, Windows paths"

3.1 → D5:
Write: "export LFS=/mnt/lfs, LFS_TGT=x86_64-lfs-linux-gnu, PATH=/tools/bin:..., MAKEFLAGS=-j12"

3.1 → D6:
Create: "directory structure (/mnt/lfs/{sources,tools,usr,boot,etc})"

LFS Mirrors → 3.2:
"wget download: binutils.tar.xz, gcc.tar.xz, glibc.tar.xz, ..."

3.2 ← D5:
Read: "$LFS, $LFS_TGT, $MAKEFLAGS"

3.2 ↔ D6:
Read: "/mnt/lfs/sources/*.tar.xz"
Write: "/mnt/lfs/tools/ (compiled binaries)"

3.2 → D7:
Write: "BUILDLOG (Chapter 5 logs)"

3.3 ← D6:
Read: "/mnt/lfs/tools/ (temporary toolchain)"

3.3 → D6:
Mount: "bind /dev, /proc, /sys to /mnt/lfs/"

3.3 → 3.4:
"sudo chroot $LFS /usr/bin/env -i (clean environment)"

3.4 ← D5:
Read: "MAKEFLAGS (inside chroot)"

3.4 ↔ D6:
Read: "/mnt/lfs/sources/ (Chapter 6-8 sources)"
Write: "/mnt/lfs/usr/ (final system binaries)"

3.4 → D7:
Append: "BUILDLOG (Chapter 6-8 logs), CURRENT_BUILD_INFO.txt"

3.4 → 3.5:
"invoke build-bootable-kernel.sh"

3.5 ← D6:
Read: "/mnt/lfs/sources/linux-6.4.12.tar.xz"

3.5 → D6:
Write: "/mnt/lfs/boot/vmlinuz, /mnt/lfs/boot/grub/"

3.6 ← D6:
Read: "/mnt/lfs/ (entire filesystem)"

3.6 → D7:
Create: "lfs-system-{date}.tar.gz, build-metadata-*.txt"

3.6 → Windows Host:
"completion status, artifact path"

Label all flows with data descriptions.
Use numbering: F3.1, F3.2, etc.
```

**Caption:** "Figure 19. Data Flow Diagram Level 2 decomposing Process 3.0 (Execute Build) into 6 subprocesses for local WSL/chroot execution: 3.1 Initialize Local Environment (creates /mnt/lfs, sets $LFS variables), 3.2 Build Toolchain (Chapter 5: 18 packages to /tools), 3.3 Chroot Transition (bind mounts virtual filesystems), 3.4 In-Chroot Build (Chapter 6-8: 50+ packages to /usr), 3.5 Kernel Build (Linux compilation to /boot), 3.6 Artifact Package (TAR creation). Three local data stores (D5: shell environment, D6: /mnt/lfs filesystem, D7: lfs-output/) support sequential data transformations from source tarballs to bootable system archive."

---

## SECTION 4.2.3 DIAGRAMS - Conceptual Object Model

### Figure 20: Entity-Relationship Diagram (ERD)

**Location:** Insert at the end of subsection 4.2.3.2 "Relationships" (before subsection 4.2.3.3)

**Diagram Type:** Entity-Relationship Diagram (Chen notation or Crow's Foot)

**Tool Settings:**
- Canvas: A3 Landscape
- Notation: Crow's Foot (preferred for clarity)
- Entities: Rectangles
- Relationships: Diamond shapes or lines with cardinality

**Prompt for Creation:**

```
Create an Entity-Relationship Diagram using Crow's Foot notation:

ENTITIES (Rectangles with attributes):

Entity: users (Top-left, blue header)
┌─────────────────────────────────┐
│ users                            │
├─────────────────────────────────┤
│ PK userId: STRING                │
│    email: STRING                 │
│    displayName: STRING           │
│    photoURL: STRING              │
│    provider: STRING              │
│    createdAt: TIMESTAMP          │
│    lastLoginAt: TIMESTAMP        │
│    builds: ARRAY<STRING>         │
│    totalBuilds: INTEGER          │
│    preferences: OBJECT           │
└─────────────────────────────────┘

Entity: builds (Center, green header)
┌─────────────────────────────────┐
│ builds                           │
├─────────────────────────────────┤
│ PK buildId: STRING               │
│ FK userId: STRING                │
│    projectName: STRING           │
│    lfsVersion: STRING            │
│    email: STRING (denormalized)  │
│    status: STRING                │
│    submittedAt: TIMESTAMP        │
│    pendingAt: TIMESTAMP          │
│    startedAt: TIMESTAMP          │
│    completedAt: TIMESTAMP        │
│    currentPackage: STRING        │
│    progress: INTEGER (0-100)     │
│    totalPackages: INTEGER        │
│    completedPackages: INTEGER    │
│    buildOptions: OBJECT          │
│    additionalNotes: STRING       │
│    artifactPath: STRING          │
│    artifactSize: INTEGER         │
│    traceId: STRING               │
│    errorMessage: STRING          │
└─────────────────────────────────┘

Entity: buildLogs (Bottom-center, orange header)
┌─────────────────────────────────┐
│ buildLogs                        │
├─────────────────────────────────┤
│ PK logId: STRING                 │
│ FK buildId: STRING               │
│    timestamp: TIMESTAMP          │
│    level: STRING                 │
│    message: STRING               │
│    packageName: STRING           │
│    phase: STRING                 │
│    source: STRING                │
└─────────────────────────────────┘

Entity: enrollments (Top-right, purple header)
┌─────────────────────────────────┐
│ enrollments                      │
├─────────────────────────────────┤
│ PK enrollmentId: STRING          │
│ FK userId: STRING                │
│    moduleId: STRING              │
│    enrolledAt: TIMESTAMP         │
│    startedAt: TIMESTAMP          │
│    completedAt: TIMESTAMP        │
│    status: STRING                │
│    progressPercentage: INTEGER   │
│    lastAccessedAt: TIMESTAMP     │
└─────────────────────────────────┘

Entity: lessonProgress (Right, yellow header)
┌─────────────────────────────────┐
│ lessonProgress                   │
├─────────────────────────────────┤
│ PK progressId: STRING            │
│ FK userId: STRING                │
│ FK enrollmentId: STRING          │
│    lessonId: STRING              │
│    sectionId: STRING             │
│    completed: BOOLEAN            │
│    quizScore: INTEGER            │
│    timeSpent: INTEGER            │
│    terminalCommands: ARRAY       │
│    updatedAt: TIMESTAMP          │
└─────────────────────────────────┘

Entity: analytics (Bottom-left, gray header)
┌─────────────────────────────────┐
│ analytics                        │
├─────────────────────────────────┤
│ PK metricId: STRING              │
│    date: TIMESTAMP               │
│    totalBuilds: INTEGER          │
│    completedBuilds: INTEGER      │
│    failedBuilds: INTEGER         │
│    averageBuildTime: INTEGER     │
│    activeUsers: INTEGER          │
│    newUsers: INTEGER             │
│    popularModules: ARRAY<OBJECT> │
└─────────────────────────────────┘

RELATIONSHIPS (Crow's Foot notation):

R1: users →< builds (One-to-Many)
From users.userId to builds.userId
Cardinality: 1 user → 0..N builds
Line style: ─────<
Label: "submits"

R2: builds →< buildLogs (One-to-Many)
From builds.buildId to buildLogs.buildId
Cardinality: 1 build → 0..N logs
Line style: ─────<
Label: "generates"

R3: users →< enrollments (One-to-Many)
From users.userId to enrollments.userId
Cardinality: 1 user → 0..N enrollments
Line style: ─────<
Label: "enrolls in"

R4: enrollments →< lessonProgress (One-to-Many)
From enrollments.enrollmentId to lessonProgress.enrollmentId
Cardinality: 1 enrollment → 0..N progress records
Line style: ─────<
Label: "tracks"

Legend (Bottom-right corner):
PK = Primary Key
FK = Foreign Key
─────< = One-to-Many
Solid line = Mandatory relationship
Dashed line = Optional relationship
```

**Caption:** "Figure 20. Entity-Relationship Diagram (Crow's Foot notation) showing the Firestore NoSQL conceptual schema with 6 entities and 4 primary relationships. The builds entity serves as the central job orchestration hub, related to users (R1: many builds per user), buildLogs (R2: many logs per build), and implicitly to GCS artifacts via artifactPath. The learning platform subsystem comprises users, enrollments, and lessonProgress entities (R3, R4) tracking module completion. The analytics entity remains standalone, aggregating metrics via Cloud Function cron jobs. Denormalized fields (e.g., builds.email) optimize query performance by eliminating joins, accepting the trade-off of batch update complexity for email changes."

---

### Figure 21: Firestore Collection Hierarchy Diagram

**Location:** Insert immediately after Figure 20 in subsection 4.2.3

**Diagram Type:** Tree Hierarchy Diagram

**Tool Settings:**
- Canvas: A4 Portrait
- Style: Tree structure with nested boxes

**Prompt for Creation:**

```
Create a Firestore collection hierarchy tree:

ROOT (Top, database icon):
🗄️ Firestore Database: lfs-automated-build

LEVEL 1: ROOT COLLECTIONS (Large boxes)

Collection 1:
┌─────────────────────────────────────────┐
│ 📁 users/                               │
│ Document: {userId}                      │
│                                         │
│ Fields: {email, displayName, photoURL,  │
│          provider, createdAt,           │
│          lastLoginAt, builds[],         │
│          totalBuilds, preferences{}}    │
│                                         │
│ SUBCOLLECTIONS (Nested inside):        │
│   ├─ 📂 enrollments/                   │
│   │    Document: {enrollmentId}        │
│   │    Fields: {moduleId, enrolledAt,  │
│   │             startedAt, completedAt,│
│   │             status, progress%}     │
│   │                                    │
│   └─ 📂 lessonProgress/                │
│        Document: {progressId}          │
│        Fields: {lessonId, sectionId,   │
│                 completed, quizScore,  │
│                 timeSpent, commands[]} │
└─────────────────────────────────────────┘

Collection 2:
┌─────────────────────────────────────────┐
│ 📁 builds/                              │
│ Document: {buildId}                     │
│                                         │
│ Fields: {userId, projectName,           │
│          lfsVersion, email, status,     │
│          submittedAt, pendingAt,        │
│          startedAt, completedAt,        │
│          currentPackage, progress,      │
│          totalPackages,                 │
│          completedPackages,             │
│          buildOptions{}, artifactPath,  │
│          artifactSize, traceId,         │
│          errorMessage}                  │
│                                         │
│ SUBCOLLECTIONS (Nested inside):        │
│   └─ 📂 buildLogs/                     │
│        Document: {logId}               │
│        Fields: {timestamp, level,       │
│                 message, packageName,   │
│                 phase, source}          │
└─────────────────────────────────────────┘

Collection 3:
┌─────────────────────────────────────────┐
│ 📁 analytics/                           │
│ Document: {metricId}                    │
│                                         │
│ Fields: {date, totalBuilds,             │
│          completedBuilds, failedBuilds, │
│          averageBuildTime, activeUsers, │
│          newUsers, popularModules[]}    │
│                                         │
│ NO SUBCOLLECTIONS                       │
└─────────────────────────────────────────┘

DESIGN ANNOTATIONS (Callout boxes):

Annotation 1 (pointing to builds/):
"Root collection (not subcollection)
 Rationale: Enables global query
 across all users' builds for
 analytics aggregation"

Annotation 2 (pointing to buildLogs subcollection):
"Subcollection (not root)
 Rationale: Logs only queried per-build,
 avoids polluting global namespace,
 supports automatic cleanup via
 parent document deletion"

Annotation 3 (pointing to enrollments/lessonProgress):
"Nested subcollections under users/
 Rationale: User-scoped queries,
 leverages Firestore document path
 security rules inheritance"

Add cardinality indicators:
users/ → 1..N documents (userId as PK)
builds/ → 1..N documents (buildId as PK)
buildLogs/ → 0..N subdocs per build
enrollments/ → 0..N subdocs per user
lessonProgress/ → 0..N subdocs per user
analytics/ → 1 document per day/metric
```

**Caption:** "Figure 21. Firestore collection hierarchy showing 3 root collections (users/, builds/, analytics/) and 3 nested subcollections (enrollments/, lessonProgress/ under users/; buildLogs/ under builds/). The design follows Firestore best practices: builds/ remains a root collection to support global analytics queries (e.g., 'total builds today across all users'), while buildLogs/ is nested as a subcollection since logs are never queried independently of their parent build. Subcollections leverage hierarchical security rules and automatic cascade deletion, but sacrifice cross-document queryability."

---

## SECTION 4.2.4 DIAGRAMS - System States and Processes

### Figure 22: Build Submission Sequence Diagram

**Location:** Insert at the end of subsection 4.2.4.1 "Sequence Diagrams - Build Submission Flow" (after Step 10 description)

**Diagram Type:** UML Sequence Diagram

**Tool Settings:**
- Canvas: A4 Portrait (tall)
- Style: Standard UML sequence diagram
- Lifelines: Vertical dashed lines
- Activations: Thin rectangles on lifelines

**Prompt for Creation:**

```
Create UML Sequence Diagram with 5 participants:

PARTICIPANTS (Across top, left to right):
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  User    │  │ Next.js  │  │ Firebase │  │  Cloud   │  │  Pub/Sub │
│ (Browser)│  │ Frontend │  │ Functions│  │ Firestore│  │ (GCP)    │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │             │
     │ Lifeline    │ Lifeline    │ Lifeline    │ Lifeline    │ Lifeline
     ┆             ┆             ┆             ┆             ┆

SEQUENCE INTERACTIONS (Timeline top to bottom):

1. User → Frontend:
   "Fill build form
    (projectName, lfsVersion, options)"
   Solid arrow →

2. User → Frontend:
   "Click 'Submit Build'"
   Solid arrow →

3. Frontend (activation box):
   Internal processing box
   "Validate input
    Check authentication"

4. Frontend → Cloud Functions:
   "POST /submitBuild
    {projectName, lfsVersion,
     buildOptions, JWT}"
   Solid arrow →

5. Cloud Functions (activation box):
   "verifyIdToken(JWT)"

6. Cloud Functions → Firestore:
   "Create /builds/{buildId}
    status: SUBMITTED"
   Solid arrow →

7. Firestore → Cloud Functions:
   Return: "{buildId, submittedAt}"
   Dashed arrow ←

8. Cloud Functions (activation box):
   "Update status: PENDING"

9. Cloud Functions → Firestore:
   "UPDATE /builds/{buildId}
    status: PENDING, pendingAt"
   Solid arrow →

10. Cloud Functions → Pub/Sub:
    "Publish message
     {buildId, userId, config}"
    Solid arrow →

11. Pub/Sub → Cloud Functions:
    Return: "messageId"
    Dashed arrow ←

12. Cloud Functions → Frontend:
    Return: "200 OK
     {buildId, status, submittedAt}"
    Dashed arrow ←

13. Frontend → User:
    "Display confirmation
     'Build submitted successfully
      buildId: {id}'"
    Solid arrow →

14. Frontend (activation box):
    "Navigate to /builds/[id]
     Start Firestore listener"

15. Frontend → Firestore:
    "Subscribe to /builds/{buildId}"
    Solid arrow with «subscribe» label →

Notes (Right side annotations):
- Note at step 5: "JWT validation ensures user owns this request"
- Note at step 8: "Two-phase update: SUBMITTED → PENDING ensures atomicity"
- Note at step 10: "Pub/Sub decouples submission from execution"
- Note at step 15: "Real-time listener enables live progress updates"

Time indicators (Left margin):
T+0ms   (Step 1)
T+50ms  (Step 4)
T+150ms (Step 6)
T+250ms (Step 10)
T+300ms (Step 12)
```

**Caption:** "Figure 22. UML Sequence Diagram depicting the 10-step build submission flow across 5 system components. The two-phase status update (SUBMITTED → PENDING, lines 6 and 9) implements an atomic transaction pattern ensuring no builds remain in limbo if Pub/Sub publish fails. JWT validation (line 5) enforces authentication, while the Firestore real-time subscription (line 15) establishes the WebSocket channel for subsequent progress updates. The diagram illustrates asynchronous decoupling: Cloud Functions returns HTTP 200 before build execution begins, enabling non-blocking UI responsiveness."

---

### Figure 23: Cloud Build Execution Activity Diagram

**Location:** Insert at the end of subsection 4.2.4.2 "Activity Diagrams - Cloud Build Execution" (after describing the workflow steps)

**Diagram Type:** UML Activity Diagram

**Tool Settings:**
- Canvas: A4 Portrait
- Style: UML activity diagram with swimlanes
- Nodes: Rounded rectangles
- Decision points: Diamonds

**Prompt for Creation:**

```
Create UML Activity Diagram with swimlanes:

SWIMLANES (3 vertical lanes):

Lane 1: "Pub/Sub Trigger" (left, light blue)
Lane 2: "Cloud Run Container" (center, light green)
Lane 3: "Firestore/GCS" (right, light orange)

FLOW (Top to bottom):

[START] Black filled circle in Lane 1

Lane 1:
┌─────────────────────┐
│ Receive Build       │
│ Request Message     │
│ {buildId, config}   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Invoke Cloud        │
│ Run Container       │
└──────────┬──────────┘
           │
           ╰──────────────→ (arrow crosses to Lane 2)

Lane 2:
┌─────────────────────┐
│ Container           │
│ Instantiation       │
│ (Docker image pull) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Execute             │
│ lfs-build.sh        │
└──────────┬──────────┘
           │
           ├──────────────→ (arrow to Lane 3)
           │                "UPDATE status: RUNNING"
           │
           ▼
◇──────────────────────◇  DECISION DIAMOND
│ Toolchain build     │
│ (Chapter 5)         │
│ successful?         │
◇──────────┬──────────◇
           │ YES
           ▼
┌─────────────────────┐
│ Build final system  │
│ (Chapter 6-8)       │
└──────────┬──────────┘
           │
           ├──────────────→ (arrow to Lane 3, loop)
           │                "WRITE buildLogs (per package)"
           │
           ▼
◇──────────────────────◇  DECISION DIAMOND
│ All packages        │
│ compiled?           │
◇──────────┬──────────◇
           │ YES
           ▼
┌─────────────────────┐
│ Build bootable      │
│ kernel (vmlinuz)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Package artifacts   │
│ (TAR.GZ creation)   │
└──────────┬──────────┘
           │
           ├──────────────→ (arrow to Lane 3)
           │                "UPLOAD to GCS"
           │
           ▼
┌─────────────────────┐
│ Generate metadata   │
│ (SHA256, size)      │
└──────────┬──────────┘
           │
           ├──────────────→ (arrow to Lane 3)
           │                "UPDATE status: COMPLETED,
           │                 artifactPath, artifactSize"
           │
           ▼
[END] Black filled circle with outer ring

ERROR PATHS (NO branches from decisions):

From "Toolchain build successful?" → NO:
           │ NO
           ▼
┌─────────────────────┐
│ Log error details   │
│ (stderr capture)    │
└──────────┬──────────┘
           │
           ├──────────────→ (arrow to Lane 3)
           │                "UPDATE status: FAILED,
           │                 errorMessage"
           │
           ▼
[END]

From "All packages compiled?" → NO:
           │ NO
           ▼
┌─────────────────────┐
│ Identify failed     │
│ package             │
└──────────┬──────────┘
           │
           ├──────────────→ (arrow to Lane 3)
           │                "LOG failure, UPDATE status: FAILED"
           │
           ▼
[END]

Lane 3 (Data store operations):
Every incoming arrow shows write/update operation
Draw small cylinder icons for Firestore and GCS

Add timing annotations:
- "~1 min" at Container Instantiation
- "~20 min" at Toolchain build
- "~40 min" at Final system build
- "~5 min" at Kernel build
- "~2 min" at Package artifacts
- "Total: ~68 minutes" at END node
```

**Caption:** "Figure 23. UML Activity Diagram depicting cloud build execution workflow across 3 swimlanes (Pub/Sub trigger, Cloud Run container, Firestore/GCS persistence). The diagram shows two critical decision points: toolchain build success (Chapter 5) and complete package compilation (Chapter 6-8), with error handling paths leading to FAILED status updates. Timing annotations indicate the 68-minute typical execution time, exceeding Cloud Run's 60-minute timeout constraint—this limitation motivated the pivot to hybrid WSL/chroot local architecture. Iterative buildLog writes (per package) enable real-time progress monitoring via Firestore subscriptions."

---

### Figure 24: Build Lifecycle State Machine

**Location:** Insert at the end of subsection 4.2.4.3 "State Machine Diagrams - Build Lifecycle" (after describing all states and transitions)

**Diagram Type:** UML State Machine Diagram

**Tool Settings:**
- Canvas: A4 Landscape
- Style: UML state machine
- States: Rounded rectangles
- Transitions: Arrows with labels

**Prompt for Creation:**

```
Create UML State Machine Diagram:

STATES (Rounded rectangles with state names):

[START] Filled black circle (top-left)
           │
           ▼
┌─────────────────────────────────┐
│ ⓪ SUBMITTED                     │
│ Entry: Write build document     │
│ Do: Await processing            │
│ Exit: Log submission timestamp  │
└───────────┬─────────────────────┘
            │ [onBuildSubmitted trigger]
            ▼
┌─────────────────────────────────┐
│ ① PENDING                       │
│ Entry: Update pendingAt         │
│ Do: Queue in Pub/Sub            │
│ Exit: Emit Pub/Sub message      │
└───────────┬─────────────────────┘
            │ [Cloud Run receives message]
            ▼
┌─────────────────────────────────┐
│ ② RUNNING                       │
│ Entry: Update startedAt         │
│ Do: Execute lfs-build.sh        │
│      Update currentPackage      │
│      Update progress %          │
│      Write buildLogs            │
│ Exit: Final log flush           │
└───────────┬─────────────────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌─────────┐ ┌─────────────────────┐
│ ④ FAILED│ │ ③ COMPLETED         │
│ Entry:  │ │ Entry: Update       │
│  Write  │ │  completedAt        │
│  error  │ │ Do: Upload artifact │
│ Do:     │ │     to GCS          │
│  Log    │ │ Exit: Write         │
│  stack  │ │  artifactPath       │
│ Exit:   │ │                     │
│  Notify │ │                     │
└────┬────┘ └──────────┬──────────┘
     │                 │
     │                 │
     ▼                 ▼
[END] Black filled circle with outer ring

TRANSITIONS (Labeled arrows):

SUBMITTED → PENDING:
Label: "onBuildSubmitted()
        [JWT verified]"
Event: Cloud Function trigger

PENDING → RUNNING:
Label: "Container instantiated
        [Docker image ready]"
Event: Cloud Run start

RUNNING → COMPLETED:
Label: "All packages built
        [artifactSize > 0]
        [kernel bootable]"
Guard: success condition

RUNNING → FAILED:
Label: "Compilation error
        [exit code != 0] OR
        Timeout exceeded
        [duration > 60 min] OR
        Dependency missing
        [wget 404]"
Guard: failure conditions

SELF-LOOPS (Transitions back to same state):

RUNNING → RUNNING (loop arrow):
Label: "Package completed /
        Update progress /
        [completedPackages < totalPackages]"
Event: Per-package completion

ANNOTATIONS (Callout boxes):

Annotation 1 (near PENDING state):
"Pub/Sub decoupling: State persists
 even if consumer temporarily unavailable"

Annotation 2 (near RUNNING state):
"Progress updates are NOT atomic
 (eventual consistency trade-off)"

Annotation 3 (near FAILED state):
"No retry logic implemented
 (user must resubmit manually)"

Annotation 4 (near COMPLETED state):
"Terminal state: No transitions out
 (immutable once completed)"
```

**Caption:** "Figure 24. UML State Machine Diagram modeling the 5-state build lifecycle (SUBMITTED, PENDING, RUNNING, COMPLETED, FAILED). The state machine enforces strict unidirectional flow: no transitions exist from terminal states (COMPLETED/FAILED) back to active states, ensuring build immutability for audit compliance. The RUNNING state features a self-loop for per-package progress updates, illustrating non-atomic but eventually consistent state evolution. Guard conditions on the RUNNING → FAILED transition (exit code != 0, timeout > 60 min, wget 404) enumerate the three primary failure modes. The absence of retry logic (Annotation 3) represents a deliberate design choice prioritizing system simplicity over automatic error recovery."

---

### Figure 25: Learning Progress State Machine

**Location:** Insert at the end of subsection 4.2.4.3 (after Figure 24)

**Diagram Type:** UML State Machine Diagram

**Tool Settings:**
- Canvas: A4 Portrait
- Style: UML state machine

**Prompt for Creation:**

```
Create UML State Machine for learning module progress:

STATES (Rounded rectangles):

[START] Filled black circle
           │
           ▼
┌─────────────────────────────────┐
│ NOT_ENROLLED                    │
│ Entry: User browses catalog     │
│ Do: Display module preview      │
└───────────┬─────────────────────┘
            │ [User clicks "Enroll"]
            ▼
┌─────────────────────────────────┐
│ ENROLLED                        │
│ Entry: Create enrollment doc    │
│ Do: Unlock module content       │
│ Exit: Set enrolledAt timestamp  │
└───────────┬─────────────────────┘
            │ [User accesses first lesson]
            ▼
┌─────────────────────────────────┐
│ IN_PROGRESS                     │
│ Entry: Update startedAt         │
│ Do: Track lesson completion     │
│     Record terminal commands    │
│     Calculate progress %        │
│ Exit: Save current position     │
└───────────┬─────────────────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌─────────┐ ┌─────────────────────┐
│ABANDONED│ │ COMPLETED           │
│ Entry:  │ │ Entry: Update       │
│  -none- │ │  completedAt        │
│ Do:     │ │ Do: Award badge     │
│  -none- │ │     Unlock next     │
│ Exit:   │ │     module          │
│  -none- │ │ Exit: Send cert     │
└────┬────┘ └──────────┬──────────┘
     │                 │
     │                 │
     ▼                 ▼
[END] Black filled circle with outer ring

TRANSITIONS:

NOT_ENROLLED → ENROLLED:
"[Enroll button clicked] / createEnrollment()"

ENROLLED → IN_PROGRESS:
"[First lesson accessed] / updateProgress()"

IN_PROGRESS → IN_PROGRESS (self-loop):
"[Lesson completed] /
 incrementProgress() /
 [progressPercentage < 100]"

IN_PROGRESS → COMPLETED:
"[All lessons completed] /
 awardBadge() /
 [progressPercentage == 100]"

IN_PROGRESS → ABANDONED:
"[No activity for 30 days] /
 [progressPercentage < 100]"

ABANDONED → IN_PROGRESS:
"[User returns] / resumeProgress()"
Dashed arrow (can resume)

Add temporal annotations:
- "T+0 days" at ENROLLED
- "T+1-14 days" at IN_PROGRESS
- "T+30 days" at ABANDONED
- "T+completion" at COMPLETED
```

**Caption:** "Figure 25. UML State Machine for learning module enrollment lifecycle. Unlike the build lifecycle (Figure 24), this state machine permits bidirectional transition (ABANDONED → IN_PROGRESS) enabling users to resume incomplete modules. The temporal guard condition ([No activity for 30 days]) triggers automatic ABANDONED classification, though the state remains non-terminal to support re-engagement. Progress tracking (IN_PROGRESS self-loop) increments per-lesson completion, with the [progressPercentage == 100] guard ensuring only fully completed modules trigger badge awards."

---

## SECTION 4.2.5 DIAGRAMS - Formal Calculations

### Figure 26: Amdahl's Law Parallelization Analysis

**Location:** Insert at the end of subsection 4.2.5.1 "Amdahl's Law Analysis" (after the mathematical derivation)

**Diagram Type:** Line Graph / Performance Chart

**Tool Settings:**
- Canvas: A4 Landscape
- Chart type: Line graph with multiple curves
- Axes: Speedup vs. Number of Cores

**Prompt for Creation:**

```
Create a line graph showing Amdahl's Law analysis:

AXES:
X-axis: "Number of CPU Cores" (1 to 16)
Y-axis: "Theoretical Speedup" (1x to 10x)

Grid: Light gray gridlines every 2 cores horizontally, every 1x vertically

CURVES (3 lines):

Line 1: "Ideal Linear Speedup (No overhead)" (Dashed gray line)
Points: (1, 1x), (2, 2x), (4, 4x), (8, 8x), (12, 12x), (16, 16x)
Equation label: "S = n"

Line 2: "LFS Parallel Speedup (p=0.80)" (Solid blue line, thick)
Formula: S(n) = 1 / (0.20 + 0.80/n)
Points calculated:
- (1, 1.00x)
- (2, 1.67x)
- (4, 2.50x)
- (6, 3.08x)
- (8, 3.48x)
- (10, 3.77x)
- (12, 3.97x)
- (16, 4.26x)

Mark special points:
• (4, 2.50x) - Red dot with label "4-core efficiency: 62.5%"
• (8, 3.48x) - Red dot with label "8-core efficiency: 43.5%"
• (12, 3.97x) - Red dot with label "12-core efficiency: 33.1%"

Line 3: "LFS Measured Speedup (Build Duration)" (Dotted orange line)
Empirical points from actual builds:
- (1, 1.00x) [180 min baseline]
- (4, 2.12x) [85 min observed]
- (8, 3.00x) [60 min observed]
- (12, 3.36x) [53.6 min observed]

Add annotation box (top-right):
┌────────────────────────────────────┐
│ Serial Fraction Analysis:         │
│ • Download/Extract: 20% (serial)   │
│ • Compile/Link: 80% (parallel)     │
│                                    │
│ Optimal Core Count: 8-12 cores     │
│ Recommendation: MAKEFLAGS=-j12     │
│                                    │
│ Diminishing returns beyond 12      │
│ cores due to I/O bottlenecks       │
└────────────────────────────────────┘

Legend (bottom-right):
- - - Ideal (no overhead)
──── Theoretical (p=0.80)
· · · · Measured (local WSL)
•     Key efficiency thresholds
```

**Caption:** "Figure 26. Amdahl's Law parallelization analysis comparing theoretical speedup (p=0.80 parallelizable fraction, solid blue) against measured build durations on local WSL environment (dotted orange). The graph demonstrates diminishing returns beyond 8 cores: 4-core configuration achieves 62.5% parallel efficiency (2.5x speedup), while 8-core drops to 43.5% efficiency (3.48x speedup), and 12-core further degrades to 33.1% efficiency (3.97x speedup). Measured data tracks theoretical predictions closely, validating the p=0.80 estimation. The 20% serial fraction comprises non-parallelizable phases (package downloads via sequential wget, tarball extraction, configure script execution), while the 80% parallel fraction represents multi-job `make` compilation. Red dots mark inflection points guiding the `MAKEFLAGS=-j12` recommendation in build scripts."

---

### Figure 27: Storage Requirements Breakdown

**Location:** Insert at the end of subsection 4.2.5.2 "Storage and Memory Calculations" (after GCS storage cost calculation)

**Diagram Type:** Stacked Bar Chart / Waterfall Diagram

**Tool Settings:**
- Canvas: A4 Portrait
- Chart type: Horizontal stacked bar
- Colors: Distinct colors for each category

**Prompt for Creation:**

```
Create a horizontal stacked bar chart showing storage allocation:

TITLE: "Per-Build Storage Requirements (Total: 7.82 GB)"

MAIN BAR (Horizontal, left-to-right accumulation):

┌─────────┬────────────┬──────────┬─────────┬─────────┐
│ Source  │ Toolchain  │  Final   │  Kernel │ Logs &  │
│ Tarballs│ (Chapter 5)│  System  │  Build  │Metadata │
│ 1.2 GB  │  1.5 GB    │  3.8 GB  │ 0.92 GB │ 0.4 GB  │
│ (Blue)  │ (Green)    │(Orange)  │(Purple) │ (Gray)  │
└─────────┴────────────┴──────────┴─────────┴─────────┘
0 GB     1.2        2.7         6.5       7.42      7.82 GB

BREAKDOWN TABLE (Below bar):

┌────────────────────────┬──────────┬─────────────────┐
│ Component              │ Size     │ Description     │
├────────────────────────┼──────────┼─────────────────┤
│ Source Tarballs        │ 1.2 GB   │ 69 .tar.xz pkgs │
│ (binutils, gcc, etc.)  │          │ downloaded      │
├────────────────────────┼──────────┼─────────────────┤
│ Toolchain Build        │ 1.5 GB   │ /tools/ dir     │
│ (Chapter 5)            │          │ 18 packages     │
├────────────────────────┼──────────┼─────────────────┤
│ Final System           │ 3.8 GB   │ /usr, /lib,     │
│ (Chapter 6-8)          │          │ /bin, /sbin     │
├────────────────────────┼──────────┼─────────────────┤
│ Kernel Build           │ 0.92 GB  │ /boot/vmlinuz,  │
│                        │          │ modules, headers│
├────────────────────────┼──────────┼─────────────────┤
│ Logs & Metadata        │ 0.4 GB   │ BUILDLOG,       │
│                        │          │ package-db.txt  │
├────────────────────────┼──────────┼─────────────────┤
│ TOTAL (Uncompressed)   │ 7.82 GB  │                 │
├────────────────────────┼──────────┼─────────────────┤
│ TAR.GZ (Compressed)    │ 2.8 GB   │ 64.2% reduction │
└────────────────────────┴──────────┴─────────────────┘

VERTICAL ANNOTATIONS (Right side callouts):

Arrow pointing to Final System:
"Largest component: 48.6% of total
 Includes glibc, binutils, gcc,
 Python, systemd, ~50 packages"

Arrow pointing to TAR.GZ row:
"Compression savings: 5.02 GB
 Upload time: ~8 min @ 50 Mbps
 GCS cost: $0.023 per build"

Add formula box (bottom):
┌────────────────────────────────────────┐
│ Storage Efficiency Calculation:        │
│                                        │
│ Compression Ratio = 2.8 / 7.82 = 0.358│
│ Space Saved = 7.82 - 2.8 = 5.02 GB    │
│ % Reduction = (1 - 0.358) × 100 = 64.2%│
└────────────────────────────────────────┘
```

**Caption:** "Figure 27. Per-build storage requirements breakdown showing 7.82 GB uncompressed allocation distributed across 5 major components: Source Tarballs (1.2 GB, 15.3%), Toolchain (1.5 GB, 19.2%), Final System (3.8 GB, 48.6%), Kernel (0.92 GB, 11.8%), and Logs/Metadata (0.4 GB, 5.1%). The Final System dominates storage consumption due to inclusion of large packages (glibc 2.38: 450 MB, gcc 13.2.0: 680 MB, Python 3.11.4: 380 MB, systemd: 290 MB). TAR.GZ compression reduces the artifact to 2.8 GB (64.2% reduction), enabling efficient GCS uploads and minimizing per-build storage costs ($0.023/build at $0.023/GB/month standard storage pricing). This compression ratio (0.358) validates the decision to store artifacts compressed, trading CPU time (2-3 minutes gzip overhead) for persistent storage savings."

---

### Figure 28: Memory Utilization Timeline

**Location:** Insert immediately after Figure 27 in subsection 4.2.5.2

**Diagram Type:** Area Chart / Memory Profile Graph

**Tool Settings:**
- Canvas: A4 Landscape
- Chart type: Stacked area chart over time
- Colors: Layered with transparency

**Prompt for Creation:**

```
Create a stacked area chart showing memory usage over build duration:

AXES:
X-axis: "Build Time (minutes)" (0 to 70 min)
Y-axis: "Memory Usage (GB)" (0 to 8 GB)

Horizontal reference lines (dashed):
- 8 GB line (red): "System Memory Limit"
- 6 GB line (orange): "Recommended allocation"
- 2 GB line (gray): "Base system overhead"

STACKED AREAS (Bottom to top, different colors with transparency):

Area 1: "Base System" (Gray, 0-2 GB constant)
Flat line at 2 GB across entire timeline
Components: WSL2 kernel, systemd, bash, filesystem cache

Area 2: "Build Tools" (Blue, varies 0.5-1.5 GB)
Timeline profile:
- 0-10 min: 0.5 GB (initialization)
- 10-30 min: 1.5 GB (gcc, ld, as during toolchain)
- 30-50 min: 1.2 GB (in-chroot build)
- 50-65 min: 1.0 GB (kernel compilation)
- 65-70 min: 0.5 GB (packaging)

Area 3: "Package Compilation" (Green, varies 1-4 GB)
Peak points:
- 15 min: 3.2 GB (gcc pass 1 compilation)
- 18 min: 2.8 GB (glibc linking)
- 25 min: 3.5 GB (gcc pass 2 final)
- 40 min: 3.8 GB (systemd compilation, PEAK)
- 52 min: 2.5 GB (Python 3.11.4)
- 60 min: 3.0 GB (Linux kernel make)
- 68 min: 0.8 GB (artifact TAR creation)

Area 4: "Filesystem Cache" (Yellow, varies 0.5-1.5 GB)
Gradual accumulation:
- 0-20 min: 0.5 GB (initial caching)
- 20-50 min: 1.2 GB (peak caching)
- 50-70 min: 1.0 GB (moderate caching)

TOTAL MEMORY LINE (Black thick line on top of stack):
Shows sum of all areas, should reach ~7.5 GB at peak (40 min mark)

ANNOTATIONS (Callout boxes):

Annotation 1 (at 40 min, 7.5 GB peak):
"PEAK: systemd compilation
 Memory: 7.5 GB (93.8% of limit)
 Risk: OOM if swap disabled"

Annotation 2 (at 25 min, 6.8 GB):
"gcc pass 2 final link
 Large object files in memory
 Parallel make -j12 stress"

Annotation 3 (at 60 min, 6.0 GB):
"Linux kernel compilation
 Modular build reduces peak
 vs monolithic kernel"

Annotation 4 (bottom-right):
┌────────────────────────────────────┐
│ Memory Allocation Strategy:        │
│ • Recommended: 8 GB system RAM     │
│ • Minimum: 6 GB (with swap)        │
│ • Peak usage: 7.5 GB (40 min mark) │
│ • Average: 5.2 GB across build     │
│                                    │
│ Swap requirement: 2 GB minimum     │
│ to handle compilation spikes       │
└────────────────────────────────────┘
```

**Caption:** "Figure 28. Memory utilization timeline showing stacked area chart across 70-minute build duration with four memory components: Base System (2 GB constant WSL2 overhead), Build Tools (0.5-1.5 GB for gcc/ld), Package Compilation (1-4 GB variable per package), and Filesystem Cache (0.5-1.5 GB gradual accumulation). Peak memory consumption occurs at 40 minutes during systemd compilation (7.5 GB, 93.8% of 8 GB limit), driven by parallel `make -j12` spawning 12 concurrent gcc processes each allocating ~500 MB. The graph validates the 8 GB recommended RAM allocation specified in build documentation, though minimum 6 GB systems can survive with 2 GB swap enabled. Notable secondary peaks occur during gcc pass 2 final link (25 min, 6.8 GB) and Linux kernel compilation (60 min, 6.0 GB), both mitigated by the build system's memory-aware `-j` tuning (lines 50-55 of init-lfs-env.sh adjust MAKEFLAGS based on `free -g` output)."

---

## SECTION 4.3 DIAGRAMS - Information Equipment

### Figure 29: Input Data Structure Diagram

**Location:** Insert at the end of subsection 4.3.2 "Input Data Specification" (after describing all input forms and API endpoints)

**Diagram Type:** Data Structure Diagram / JSON Schema Visualization

**Tool Settings:**
- Canvas: A4 Portrait
- Style: Tree structure showing nested JSON objects

**Prompt for Creation:**

```
Create a hierarchical data structure diagram for input data:

TITLE: "Build Submission Request Schema"

ROOT OBJECT (Top box):
┌────────────────────────────────────────┐
│ BuildSubmissionRequest                 │
│ (HTTP POST /api/submitBuild)           │
└────────────────┬───────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌──────────────┐     ┌────────────────────┐
│ Required     │     │ Optional           │
│ Fields       │     │ Fields             │
└──────┬───────┘     └────────┬───────────┘
       │                      │
       ├─ projectName: STRING (1-100 chars)
       │  Pattern: ^[a-zA-Z0-9-_]+$
       │  Example: "my-custom-lfs"
       │
       ├─ lfsVersion: STRING (enum)
       │  Values: ["12.0", "11.3", "11.2"]
       │  Default: "12.0"
       │
       ├─ userId: STRING (Firebase UID)
       │  Pattern: ^[a-zA-Z0-9]{28}$
       │  Source: JWT token (auto-extracted)
       │
       ├─ email: STRING (email format)
       │  Validation: RFC 5322 compliant
       │  Source: Firebase Auth (denormalized)
       │
                      │
                      ├─ buildOptions: OBJECT
                      │  └─ enableOptimizations: BOOLEAN
                      │     Default: true
                      │  └─ includeDebugSymbols: BOOLEAN
                      │     Default: false
                      │  └─ parallelJobs: INTEGER (1-24)
                      │     Default: 12
                      │  └─ customCFLAGS: STRING
                      │     Pattern: ^-O[0-3s].*$
                      │     Example: "-O3 -march=native"
                      │
                      └─ additionalNotes: STRING
                         Max length: 500 chars
                         Optional: User comments

VALIDATION RULES (Callout box on right):
┌────────────────────────────────────────┐
│ Validation Layer: Cloud Functions      │
│                                        │
│ 1. JWT Authentication:                 │
│    - Verify Firebase token             │
│    - Extract userId from claims        │
│                                        │
│ 2. Input Sanitization:                 │
│    - XSS prevention (strip HTML)       │
│    - SQL injection N/A (NoSQL)         │
│    - Path traversal prevention         │
│                                        │
│ 3. Business Logic:                     │
│    - Check user build quota            │
│    - Validate lfsVersion availability  │
│    - Ensure parallelJobs ≤ CPU count   │
│                                        │
│ 4. Error Responses:                    │
│    - 400: Invalid input format         │
│    - 401: Unauthorized (bad JWT)       │
│    - 429: Rate limit exceeded          │
│    - 500: Internal server error        │
└────────────────────────────────────────┘

Example JSON (Bottom):
```json
{
  "projectName": "production-lfs",
  "lfsVersion": "12.0",
  "userId": "abc123xyz...", // auto-extracted
  "email": "user@example.com", // auto-extracted
  "buildOptions": {
    "enableOptimizations": true,
    "includeDebugSymbols": false,
    "parallelJobs": 12,
    "customCFLAGS": "-O3 -pipe"
  },
  "additionalNotes": "Build for production server"
}
```
```

**Caption:** "Figure 29. Input data structure diagram for BuildSubmissionRequest showing required fields (projectName, lfsVersion, userId, email) and optional nested buildOptions object. The diagram illustrates a four-layer validation pipeline in Cloud Functions: (1) JWT authentication extracts userId from token claims, (2) input sanitization prevents XSS and path traversal attacks, (3) business logic enforces user quotas and validates lfsVersion availability, (4) standardized error responses (HTTP 400/401/429/500) provide client feedback. The buildOptions.parallelJobs field demonstrates constraint propagation: frontend enforces max=24 via HTML input validation, while backend cross-references navigator.hardwareConcurrency to prevent resource over-subscription. This dual-layer validation exemplifies defense-in-depth security principles."

---

### Figure 30: Output Data Structure Diagram

**Location:** Insert at the end of subsection 4.3.3 "Output Data Specification" (after describing artifact formats and API responses)

**Diagram Type:** Data Structure Diagram / Response Schema

**Tool Settings:**
- Canvas: A4 Portrait
- Style: Tree structure for nested responses

**Prompt for Creation:**

```
Create output data structure diagram showing 3 response types:

TITLE: "Build System Output Data Structures"

TYPE 1: Build Status Response
┌────────────────────────────────────────┐
│ BuildStatusResponse                    │
│ (GET /api/builds/{buildId})            │
└────────────────┬───────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌──────────────┐     ┌────────────────────┐
│ Metadata     │     │ Progress Data      │
└──────┬───────┘     └────────┬───────────┘
       │                      │
       ├─ buildId: STRING
       ├─ userId: STRING
       ├─ projectName: STRING
       ├─ lfsVersion: STRING
       ├─ status: ENUM
       │  Values: [SUBMITTED, PENDING,
       │           RUNNING, COMPLETED, FAILED]
       │
       ├─ timestamps: OBJECT
       │  ├─ submittedAt: TIMESTAMP
       │  ├─ pendingAt: TIMESTAMP
       │  ├─ startedAt: TIMESTAMP
       │  └─ completedAt: TIMESTAMP
       │
                      ├─ currentPackage: STRING
                      │  Example: "glibc-2.38"
                      │
                      ├─ progress: INTEGER (0-100)
                      │  Calculation: (completed/total)*100
                      │
                      ├─ completedPackages: INTEGER
                      ├─ totalPackages: INTEGER
                      │  Fixed: 69 (LFS 12.0)
                      │
                      └─ artifactPath: STRING
                         Example: "gs://bucket/builds/
                                  {buildId}/lfs-system.tar.gz"
                         Size: artifactSize (bytes)

TYPE 2: Log Stream Response
┌────────────────────────────────────────┐
│ BuildLogEntry[]                        │
│ (GET /api/builds/{buildId}/logs)       │
└────────────────┬───────────────────────┘
                 │
       ┌─────────┴─────────┐
       │ Array of objects  │
       └─────────┬─────────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
┌──────────────┐     ┌────────────────────┐
│ Log Entry    │     │ Metadata           │
└──────┬───────┘     └────────┬───────────┘
       ├─ timestamp: TIMESTAMP
       │  Format: ISO 8601
       │
       ├─ level: STRING (enum)
       │  Values: [DEBUG, INFO, WARN, ERROR]
       │  RFC 5424 codes: [0-3]
       │
       ├─ message: STRING
       │  Max length: 4096 chars
       │  Encoding: UTF-8
       │
       ├─ packageName: STRING
       │  Example: "binutils-2.41"
       │
       ├─ phase: STRING
       │  Values: [DOWNLOAD, EXTRACT,
       │           CONFIGURE, COMPILE, INSTALL]
       │
       └─ source: STRING
          Values: [lfs-build.sh, chroot, kernel]

TYPE 3: Artifact Metadata Response
┌────────────────────────────────────────┐
│ ArtifactMetadata                       │
│ (HEAD /artifacts/{buildId}.tar.gz)     │
└────────────────┬───────────────────────┘
                 │
       ├─ signedURL: STRING
       │  Expiry: 1 hour (GCS signed URL)
       │  Method: GET
       │
       ├─ filename: STRING
       │  Pattern: lfs-system-{date}-{buildId}.tar.gz
       │
       ├─ size: INTEGER (bytes)
       │  Typical: ~2.8 GB (compressed)
       │
       ├─ checksums: OBJECT
       │  ├─ md5: STRING (32 hex chars)
       │  └─ sha256: STRING (64 hex chars)
       │
       ├─ contentType: STRING
       │  Value: "application/gzip"
       │
       └─ metadata: OBJECT
          ├─ lfsVersion: STRING
          ├─ buildDate: TIMESTAMP
          ├─ kernelVersion: STRING
          │  Example: "6.4.12"
          └─ packageCount: INTEGER

Add HTTP Headers annotation:
┌────────────────────────────────────────┐
│ HTTP Response Headers:                 │
│ Content-Type: application/json         │
│ Cache-Control: no-cache (status)       │
│               max-age=3600 (artifacts) │
│ X-Build-Id: {buildId}                  │
│ X-Trace-Id: {traceId}                  │
└────────────────────────────────────────┘
```

**Caption:** "Figure 30. Output data structure diagram showing three response schemas: (1) BuildStatusResponse for real-time progress monitoring with status enum (5 states), progress percentage calculation, and timestamp audit trail; (2) BuildLogEntry[] array for log streaming with RFC 5424 severity levels and 5-phase taxonomy (DOWNLOAD, EXTRACT, CONFIGURE, COMPILE, INSTALL); (3) ArtifactMetadata with GCS signed URLs (1-hour expiry), dual checksums (MD5 + SHA256) for integrity verification, and nested metadata object containing lfsVersion and kernelVersion. The diagram illustrates Firestore-to-HTTP mapping: NoSQL documents (builds/, buildLogs/) transform into RESTful JSON responses via Cloud Functions serialization layer (functions/index.js lines 200-250). Cache-Control headers differentiate mutable data (status: no-cache) from immutable artifacts (max-age=3600), optimizing CDN edge caching."

---

### Figure 31: Database Schema Diagram (Firestore Collections)

**Location:** Insert at the end of subsection 4.3.4 "Database Project" (after describing all collection schemas and indexes)

**Diagram Type:** Database Schema Diagram with collections and indexes

**Tool Settings:**
- Canvas: A3 Landscape
- Style: UML-style class diagram adapted for NoSQL

**Prompt for Creation:**

```
Create Firestore database schema diagram:

COLLECTION 1: users
┌─────────────────────────────────────────────┐
│ users                                       │
│ ──────────────────────────────────────────  │
│ Collection Path: /users/{userId}            │
│                                             │
│ Fields (Document Schema):                   │
│ • userId: string PK                         │
│ • email: string                             │
│ • displayName: string                       │
│ • photoURL: string                          │
│ • provider: string                          │
│ • createdAt: timestamp                      │
│ • lastLoginAt: timestamp                    │
│ • builds: array<string> (buildIds)          │
│ • totalBuilds: number                       │
│ • preferences: map                          │
│   ├─ theme: string                          │
│   ├─ notifications: boolean                 │
│   └─ defaultLfsVersion: string              │
│                                             │
│ Indexes:                                    │
│ [1] email ASC (single-field)                │
│ [2] createdAt DESC (single-field)           │
│ [3] totalBuilds DESC (single-field)         │
│                                             │
│ Subcollections:                             │
│ ├─ /users/{userId}/enrollments              │
│ └─ /users/{userId}/lessonProgress           │
└─────────────────────────────────────────────┘

COLLECTION 2: builds
┌─────────────────────────────────────────────┐
│ builds                                      │
│ ──────────────────────────────────────────  │
│ Collection Path: /builds/{buildId}          │
│                                             │
│ Fields (Document Schema):                   │
│ • buildId: string PK (auto-generated)       │
│ • userId: string FK → users                 │
│ • projectName: string                       │
│ • lfsVersion: string                        │
│ • email: string (denormalized)              │
│ • status: string enum                       │
│   Values: [SUBMITTED, PENDING, RUNNING,     │
│            COMPLETED, FAILED]               │
│ • submittedAt: timestamp                    │
│ • pendingAt: timestamp                      │
│ • startedAt: timestamp                      │
│ • completedAt: timestamp                    │
│ • currentPackage: string                    │
│ • progress: number (0-100)                  │
│ • totalPackages: number                     │
│ • completedPackages: number                 │
│ • buildOptions: map                         │
│   ├─ enableOptimizations: boolean           │
│   ├─ includeDebugSymbols: boolean           │
│   ├─ parallelJobs: number                   │
│   └─ customCFLAGS: string                   │
│ • additionalNotes: string                   │
│ • artifactPath: string                      │
│ • artifactSize: number                      │
│ • traceId: string (GCP trace correlation)   │
│ • errorMessage: string                      │
│                                             │
│ Indexes (Composite):                        │
│ [1] userId ASC, submittedAt DESC            │
│ [2] status ASC, submittedAt DESC            │
│ [3] lfsVersion ASC, status ASC,             │
│     submittedAt DESC                        │
│                                             │
│ Subcollections:                             │
│ └─ /builds/{buildId}/buildLogs              │
└─────────────────────────────────────────────┘

COLLECTION 3: buildLogs (Subcollection)
┌─────────────────────────────────────────────┐
│ buildLogs                                   │
│ ──────────────────────────────────────────  │
│ Path: /builds/{buildId}/buildLogs/{logId}   │
│                                             │
│ Fields:                                     │
│ • logId: string PK (auto-generated)         │
│ • timestamp: timestamp                      │
│ • level: string enum                        │
│   Values: [DEBUG, INFO, WARN, ERROR]        │
│ • message: string                           │
│ • packageName: string                       │
│ • phase: string enum                        │
│   Values: [DOWNLOAD, EXTRACT, CONFIGURE,    │
│            COMPILE, INSTALL]                │
│ • source: string                            │
│                                             │
│ Indexes:                                    │
│ [1] timestamp ASC (automatic)               │
│ [2] level ASC, timestamp ASC (composite)    │
│                                             │
│ TTL Policy: 30 days (automatic deletion)    │
└─────────────────────────────────────────────┘

COLLECTION 4: enrollments (Subcollection)
┌─────────────────────────────────────────────┐
│ enrollments                                 │
│ ──────────────────────────────────────────  │
│ Path: /users/{userId}/enrollments/          │
│       {enrollmentId}                        │
│                                             │
│ Fields:                                     │
│ • enrollmentId: string PK                   │
│ • moduleId: string                          │
│ • enrolledAt: timestamp                     │
│ • startedAt: timestamp                      │
│ • completedAt: timestamp                    │
│ • status: string enum                       │
│   Values: [NOT_ENROLLED, ENROLLED,          │
│            IN_PROGRESS, COMPLETED,          │
│            ABANDONED]                       │
│ • progressPercentage: number (0-100)        │
│ • lastAccessedAt: timestamp                 │
│                                             │
│ Indexes:                                    │
│ [1] moduleId ASC (single-field)             │
│ [2] status ASC, lastAccessedAt DESC         │
└─────────────────────────────────────────────┘

COLLECTION 5: lessonProgress (Subcollection)
┌─────────────────────────────────────────────┐
│ lessonProgress                              │
│ ──────────────────────────────────────────  │
│ Path: /users/{userId}/lessonProgress/       │
│       {progressId}                          │
│                                             │
│ Fields:                                     │
│ • progressId: string PK                     │
│ • enrollmentId: string FK                   │
│ • lessonId: string                          │
│ • sectionId: string                         │
│ • completed: boolean                        │
│ • quizScore: number (0-100)                 │
│ • timeSpent: number (seconds)               │
│ • terminalCommands: array<string>           │
│ • updatedAt: timestamp                      │
│                                             │
│ Indexes:                                    │
│ [1] lessonId ASC, completed ASC             │
│ [2] enrollmentId ASC, updatedAt DESC        │
└─────────────────────────────────────────────┘

COLLECTION 6: analytics
┌─────────────────────────────────────────────┐
│ analytics                                   │
│ ──────────────────────────────────────────  │
│ Collection Path: /analytics/{metricId}      │
│                                             │
│ Fields:                                     │
│ • metricId: string PK (date-based)          │
│ • date: timestamp                           │
│ • totalBuilds: number                       │
│ • completedBuilds: number                   │
│ • failedBuilds: number                      │
│ • averageBuildTime: number (seconds)        │
│ • activeUsers: number                       │
│ • newUsers: number                          │
│ • popularModules: array<map>                │
│   ├─ moduleId: string                       │
│   ├─ enrollments: number                    │
│   └─ completions: number                    │
│                                             │
│ Indexes:                                    │
│ [1] date DESC (single-field)                │
│                                             │
│ Aggregation: Daily cron job at 00:00 UTC    │
└─────────────────────────────────────────────┘

Add relationships (arrows between collections):
users → builds: "1 user : N builds" (solid arrow)
builds → buildLogs: "1 build : N logs" (solid arrow, nested)
users → enrollments: "1 user : N enrollments" (solid arrow, nested)
users → lessonProgress: "1 user : N progress" (solid arrow, nested)

Add Security Rules annotation:
┌─────────────────────────────────────────────┐
│ Security Rules Summary:                     │
│                                             │
│ /builds/{buildId}:                          │
│ • Read: owner (userId == request.auth.uid)  │
│ • Write: Cloud Functions only (admin)       │
│                                             │
│ /users/{userId}:                            │
│ • Read: owner only                          │
│ • Write: owner can update preferences       │
│                                             │
│ Subcollections inherit parent rules         │
└─────────────────────────────────────────────┘
```

**Caption:** "Figure 31. Firestore database schema diagram showing 6 collections with complete field specifications, indexes, and relationships. The builds collection features 3 composite indexes (userId+submittedAt, status+submittedAt, lfsVersion+status+submittedAt) optimizing common query patterns identified in functions/index.js lines 100-150. The buildLogs subcollection implements a 30-day TTL policy (automatic deletion) preventing unbounded storage growth. Denormalized fields (builds.email) trade write complexity for read performance, eliminating client-side joins. Security rules enforce owner-only read access for builds and users collections, while reserving write privileges for Cloud Functions (admin SDK). Subcollections (enrollments, lessonProgress, buildLogs) nest under parent documents, enabling hierarchical security rule inheritance and automatic cascade deletion."

---

## SECTION 4.4 DIAGRAMS - Software Project

### Figure 32: High-Level System Architecture

**Location:** Insert at the end of subsection 4.4.1 "System Architecture" (after describing the three-tier architecture)

**Diagram Type:** Layered Architecture Diagram

**Tool Settings:**
- Canvas: A4 Landscape
- Style: Layered box diagram with technology stack labels

**Prompt for Creation:**

```
Create a three-tier layered architecture diagram:

LAYER 1: PRESENTATION TIER (Top, Blue gradient)
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │ Next.js Frontend   │  │ React Components   │           │
│  │ • App Router       │  │ • BuildForm        │           │
│  │ • Server Actions   │  │ • ProgressTracker  │           │
│  │ • API Routes       │  │ • LogViewer        │           │
│  └────────────────────┘  └────────────────────┘           │
│                                                             │
│  Technologies: Next.js 16, React 19, TypeScript,           │
│               Tailwind CSS 4, Framer Motion                │
│                                                             │
│  Deployment: Netlify (CDN-distributed static site)         │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS REST API
                             │ WebSocket (Firestore listeners)
                             ▼
LAYER 2: BUSINESS LOGIC TIER (Middle, Green gradient)
┌─────────────────────────────────────────────────────────────┐
│  MIDDLEWARE / APPLICATION LAYER                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │ Firebase Functions │  │ Cloud Functions    │           │
│  │ • onBuildSubmitted │  │ • submitBuild()    │           │
│  │ • verifyIdToken()  │  │ • getBuildStatus() │           │
│  │ • scheduledCleanup │  │ • getArtifact()    │           │
│  └────────────────────┘  └────────────────────┘           │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │ Firebase Auth      │  │ Pub/Sub Topics     │           │
│  │ • JWT validation   │  │ • build-requests   │           │
│  │ • OAuth providers  │  │ • build-completed  │           │
│  └────────────────────┘  └────────────────────┘           │
│                                                             │
│  Technologies: Node.js 20, Firebase SDK, Google Cloud SDK  │
│                                                             │
│  Deployment: Google Cloud Functions (serverless)           │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Pub/Sub Messages
                             │ Database Writes/Reads
                             ▼
LAYER 3: EXECUTION TIER (Bottom, Orange gradient)
┌─────────────────────────────────────────────────────────────┐
│  EXECUTION / BUILD LAYER                                    │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │ CLOUD PATH (Original)                 │                 │
│  │ ┌────────────────────────────────┐    │                 │
│  │ │ Cloud Run Container            │    │                 │
│  │ │ • lfs-build.sh                 │    │                 │
│  │ │ • Debian 11 base image         │    │                 │
│  │ │ • GCC toolchain                │    │                 │
│  │ └────────────────────────────────┘    │                 │
│  │ Constraint: 60-min timeout            │                 │
│  └───────────────────────────────────────┘                 │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │ LOCAL PATH (PoC Implementation)       │                 │
│  │ ┌────────────────────────────────┐    │                 │
│  │ │ Windows Host (PowerShell)      │    │                 │
│  │ │ • BUILD-LFS-CORRECT.ps1        │    │                 │
│  │ │ • CHECK_BUILD_STATUS.ps1       │    │                 │
│  │ └──────────┬─────────────────────┘    │                 │
│  │            │ WSL2 bridge              │                 │
│  │            ▼                           │                 │
│  │ ┌────────────────────────────────┐    │                 │
│  │ │ WSL2 Ubuntu Environment        │    │                 │
│  │ │ • init-lfs-env.sh              │    │                 │
│  │ │ • build-lfs-complete-local.sh  │    │                 │
│  │ └──────────┬─────────────────────┘    │                 │
│  │            │ chroot transition        │                 │
│  │            ▼                           │                 │
│  │ ┌────────────────────────────────┐    │                 │
│  │ │ Chroot Environment (/mnt/lfs)  │    │                 │
│  │ │ • chroot-and-build.sh          │    │                 │
│  │ │ • build-lfs-in-chroot.sh       │    │                 │
│  │ └────────────────────────────────┘    │                 │
│  │ Technologies: WSL2, Bash, Chroot      │                 │
│  └───────────────────────────────────────┘                 │
│                                                             │
│  Deployment: Local PoC (no cloud execution yet)            │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Artifact Upload
                             │ Log Streaming
                             ▼
DATA LAYER (Bottom, Gray)
┌─────────────────────────────────────────────────────────────┐
│  PERSISTENCE LAYER                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Firestore DB │ │ Cloud Storage│ │ Local FS     │       │
│  │ • users      │ │ • artifacts/ │ │ • lfs-output/│       │
│  │ • builds     │ │ • logs/      │ │ • /mnt/lfs/  │       │
│  │ • buildLogs  │ │              │ │              │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│  Technologies: Firestore, Google Cloud Storage, ext4       │
└─────────────────────────────────────────────────────────────┘

Add cross-layer annotations:
• Dashed vertical line separating "Cloud Path" vs "Local Path"
• Annotation: "Hybrid architecture: Frontend/Middleware cloud-hosted, Execution local (PoC)"
• Traffic flow arrows showing data movement between layers
```

**Caption:** "Figure 32. High-level three-tier system architecture showing Presentation Layer (Next.js 16 + React 19 on Netlify), Business Logic Layer (Firebase Functions + Cloud Functions + Pub/Sub on GCP), and Execution Layer (dual-path: Cloud Run containers vs. local WSL2/chroot). The diagram illustrates the hybrid architecture: frontend and middleware remain cloud-hosted for scalability and accessibility, while the execution layer pivots to local WSL2 environment to circumvent Cloud Run's 60-minute timeout constraint. Data flows top-down through HTTPS REST APIs and WebSocket subscriptions (Presentation → Middleware), Pub/Sub asynchronous messages (Middleware → Execution), and artifact uploads (Execution → Persistence). The persistence layer comprises three storage systems: Firestore (metadata, logs), Cloud Storage (artifacts), and local ext4 filesystem (/mnt/lfs build root, lfs-output/ artifacts). This architecture demonstrates cloud-local hybrid patterns suitable for computationally intensive workloads constrained by serverless platform limitations."

---

### Figure 33: Component Interaction Diagram

**Location:** Insert in subsection 4.4.2 "Interface Design" (after describing component interfaces)

**Diagram Type:** UML Component Diagram

**Tool Settings:**
- Canvas: A4 Landscape
- Style: UML 2.5 component diagram with interfaces

**Prompt for Creation:**

```
Create UML Component Diagram showing major components and interfaces:

COMPONENTS (Rectangles with «component» stereotype):

Component 1: «component» NextJS Frontend
┌────────────────────────────────────┐
│ «component»                        │
│ NextJS Frontend                    │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • Render UI                        │
│ • Handle user input                │
│ • Real-time subscriptions          │
│ • Client-side routing              │
│                                    │
│ Provided Interfaces:               │
│ ○ IUserInterface                   │
│                                    │
│ Required Interfaces:               │
│ ◐ IAuthService                     │
│ ◐ IBuildService                    │
│ ◐ IRealtimeService                 │
└────────────────────────────────────┘

Component 2: «component» Firebase Functions
┌────────────────────────────────────┐
│ «component»                        │
│ Firebase Functions                 │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • Build submission orchestration   │
│ • JWT validation                   │
│ • Firestore triggers               │
│ • Scheduled cleanup                │
│                                    │
│ Provided Interfaces:               │
│ ○ IBuildService                    │
│ ○ IAuthService                     │
│                                    │
│ Required Interfaces:               │
│ ◐ IDatabase                        │
│ ◐ IPubSub                          │
│ ◐ IStorage                         │
└────────────────────────────────────┘

Component 3: «component» Firebase Auth
┌────────────────────────────────────┐
│ «component»                        │
│ Firebase Auth                      │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • User authentication              │
│ • JWT token generation             │
│ • OAuth provider integration       │
│                                    │
│ Provided Interfaces:               │
│ ○ IAuthService                     │
└────────────────────────────────────┘

Component 4: «component» Firestore Database
┌────────────────────────────────────┐
│ «component»                        │
│ Firestore Database                 │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • Persist build metadata           │
│ • Store user profiles              │
│ • Real-time data sync              │
│                                    │
│ Provided Interfaces:               │
│ ○ IDatabase                        │
│ ○ IRealtimeService                 │
└────────────────────────────────────┘

Component 5: «component» Pub/Sub Messaging
┌────────────────────────────────────┐
│ «component»                        │
│ Pub/Sub Messaging                  │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • Asynchronous message delivery    │
│ • Decouple submission from exec    │
│                                    │
│ Provided Interfaces:               │
│ ○ IPubSub                          │
└────────────────────────────────────┘

Component 6: «component» Cloud Storage
┌────────────────────────────────────┐
│ «component»                        │
│ Cloud Storage                      │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • Artifact persistence             │
│ • Signed URL generation            │
│                                    │
│ Provided Interfaces:               │
│ ○ IStorage                         │
└────────────────────────────────────┘

Component 7: «component» Build Executor (Local)
┌────────────────────────────────────┐
│ «component»                        │
│ Build Executor                     │
│ ────────────────────────────────   │
│ Responsibilities:                  │
│ • Execute LFS build scripts        │
│ • Manage chroot environment        │
│ • Generate artifacts               │
│                                    │
│ Provided Interfaces:               │
│ ○ IBuildExecutor                   │
│                                    │
│ Required Interfaces:               │
│ ◐ IDatabase (log writes)           │
│ ◐ IStorage (artifact upload)       │
└────────────────────────────────────┘

INTERFACES (Lollipop notation - circles):

Interface: IAuthService
Methods:
• verifyIdToken(token: string): Promise<DecodedToken>
• getUserProfile(uid: string): Promise<UserProfile>

Interface: IBuildService
Methods:
• submitBuild(config: BuildConfig): Promise<BuildId>
• getBuildStatus(buildId: string): Promise<BuildStatus>
• getBuildLogs(buildId: string): Promise<LogEntry[]>

Interface: IDatabase
Methods:
• create(collection: string, data: object): Promise<DocId>
• update(docPath: string, data: object): Promise<void>
• query(collection: string, filters: Filter[]): Promise<Doc[]>

Interface: IPubSub
Methods:
• publish(topic: string, message: object): Promise<MessageId>
• subscribe(subscription: string, handler: Function): void

Interface: IStorage
Methods:
• upload(path: string, file: Buffer): Promise<URL>
• generateSignedUrl(path: string, expiry: number): Promise<URL>

Interface: IRealtimeService
Methods:
• onSnapshot(docPath: string, callback: Function): Unsubscribe

CONNECTIONS (Draw connectors between components):
- NextJS → Firebase Auth (uses IAuthService)
- NextJS → Firebase Functions (uses IBuildService)
- NextJS → Firestore (uses IRealtimeService)
- Firebase Functions → Firestore (uses IDatabase)
- Firebase Functions → Pub/Sub (uses IPubSub)
- Firebase Functions → Cloud Storage (uses IStorage)
- Build Executor → Firestore (uses IDatabase for logs)
- Build Executor → Cloud Storage (uses IStorage for artifacts)

Add dependency notation:
Use dashed arrows with «use» stereotype for required interfaces
Use solid lines with lollipop symbols for provided interfaces
```

**Caption:** "Figure 33. UML Component Diagram illustrating the 7 major system components and their interface contracts. The NextJS Frontend component requires three interfaces (IAuthService, IBuildService, IRealtimeService) satisfied by Firebase Auth, Firebase Functions, and Firestore respectively, demonstrating loose coupling through interface-based design. Firebase Functions acts as the central orchestration hub, requiring IDatabase (Firestore), IPubSub (Pub/Sub), and IStorage (Cloud Storage) interfaces. The Build Executor component (local WSL2/chroot implementation) requires only IDatabase and IStorage for log streaming and artifact uploads, enabling independent testing with mock implementations. Interface specifications (shown in boxes) define method signatures enforcing contracts: e.g., IBuildService.submitBuild() returns Promise<BuildId>, establishing asynchronous non-blocking behavior. This diagram supports architecture documentation by clarifying component responsibilities and inter-component dependencies, facilitating future refactoring (e.g., swapping Build Executor from local to Cloud Run without affecting Firebase Functions)."

---

### Figure 34: Deployment Diagram

**Location:** Insert at the end of subsection 4.4.2 "Interface Design"

**Diagram Type:** UML Deployment Diagram

**Tool Settings:**
- Canvas: A4 Landscape
- Style: UML deployment diagram with nodes and artifacts

**Prompt for Creation:**

```
Create UML Deployment Diagram showing infrastructure:

NODES (3D boxes representing execution environments):

NODE 1: «device» User's Browser
┌─────────────────────────────────┐
│ «device»                        │
│ User's Browser                  │
│ ─────────────────────────────   │
│                                 │
│ «artifact»                      │
│ Next.js SPA                     │
│ (JavaScript bundle)             │
│                                 │
│ Runtime: Chrome/Firefox/Safari  │
│ OS: Windows/macOS/Linux         │
└─────────────────────────────────┘

NODE 2: «execution environment» Netlify CDN
┌─────────────────────────────────┐
│ «execution environment»         │
│ Netlify CDN                     │
│ ─────────────────────────────   │
│                                 │
│ «artifact»                      │
│ Static Assets                   │
│ • _next/static/*.js             │
│ • _next/static/*.css            │
│ • public/images/*               │
│                                 │
│ Edge Locations: Global          │
│ Protocol: HTTPS/HTTP2           │
└─────────────────────────────────┘

NODE 3: «execution environment» Google Cloud Functions
┌─────────────────────────────────┐
│ «execution environment»         │
│ Cloud Functions (Node.js 20)    │
│ ─────────────────────────────   │
│                                 │
│ «artifact»                      │
│ functions/                      │
│ • index.js                      │
│ • package.json                  │
│ • node_modules/                 │
│                                 │
│ Region: us-central1             │
│ Concurrency: 1000               │
│ Memory: 256 MB per instance     │
└─────────────────────────────────┘

NODE 4: «database» Firestore
┌─────────────────────────────────┐
│ «database»                      │
│ Firestore NoSQL Database        │
│ ─────────────────────────────   │
│                                 │
│ Collections:                    │
│ • users/                        │
│ • builds/                       │
│ • buildLogs/ (subcollection)    │
│ • analytics/                    │
│                                 │
│ Region: us-central1 (multi)     │
│ Replication: 3 zones            │
└─────────────────────────────────┘

NODE 5: «storage» Cloud Storage
┌─────────────────────────────────┐
│ «storage»                       │
│ Google Cloud Storage Bucket     │
│ ─────────────────────────────   │
│                                 │
│ Buckets:                        │
│ • lfs-artifacts/                │
│   ├─ builds/{buildId}/*.tar.gz  │
│   └─ logs/{buildId}/*.txt       │
│                                 │
│ Storage Class: Standard         │
│ Region: us-central1             │
└─────────────────────────────────┘

NODE 6: «device» Windows Host (Local)
┌─────────────────────────────────┐
│ «device»                        │
│ Windows 10/11 Host              │
│ ─────────────────────────────   │
│                                 │
│ «artifact»                      │
│ BUILD-LFS-CORRECT.ps1           │
│ CHECK_BUILD_STATUS.ps1          │
│                                 │
│ Contains NODE:                  │
│ ┌─────────────────────────────┐ │
│ │ «execution environment»     │ │
│ │ WSL2 Ubuntu 22.04           │ │
│ │ ───────────────────────────  │ │
│ │                             │ │
│ │ «artifact»                  │ │
│ │ init-lfs-env.sh             │ │
│ │ build-lfs-complete-local.sh │ │
│ │ chroot-and-build.sh         │ │
│ │                             │ │
│ │ «artifact»                  │ │
│ │ /mnt/lfs/ (chroot root)     │ │
│ │ lfs-output/ (artifacts)     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Hardware: 8 GB RAM, 4-8 cores   │
│ Disk: 50 GB free space          │
└─────────────────────────────────┘

NODE 7: «execution environment» Firebase Auth
┌─────────────────────────────────┐
│ «execution environment»         │
│ Firebase Authentication         │
│ ─────────────────────────────   │
│                                 │
│ Providers:                      │
│ • Google OAuth 2.0              │
│ • Email/Password                │
│                                 │
│ JWT Signing: RS256              │
└─────────────────────────────────┘

NODE 8: «message broker» Pub/Sub
┌─────────────────────────────────┐
│ «message broker»                │
│ Google Pub/Sub                  │
│ ─────────────────────────────   │
│                                 │
│ Topics:                         │
│ • build-requests                │
│ • build-completed               │
│                                 │
│ Retention: 7 days               │
└─────────────────────────────────┘

CONNECTIONS (Communication paths):

User's Browser ←HTTP/HTTPS→ Netlify CDN
"Static asset delivery"

User's Browser ←HTTPS→ Cloud Functions
"API calls: /api/submitBuild, /api/builds/{id}"

User's Browser ←WebSocket→ Firestore
"Real-time subscriptions"

Cloud Functions ←gRPC→ Firestore
"CRUD operations"

Cloud Functions ←gRPC→ Cloud Storage
"Artifact uploads, signed URLs"

Cloud Functions ←gRPC→ Pub/Sub
"Publish build messages"

Cloud Functions ←HTTPS→ Firebase Auth
"Token verification"

Windows Host ←HTTPS→ Firestore
"Log writes (local builds)"

Windows Host ←HTTPS→ Cloud Storage
"Artifact uploads (local builds)"

Pub/Sub ←gRPC→ Cloud Functions
"Message delivery (unused in local PoC)"

Add protocol/port annotations:
- HTTPS: Port 443
- WebSocket: Port 443 (WSS)
- gRPC: Port 443 (HTTP/2)

Add security annotations:
• TLS 1.3 encryption for all connections
• JWT authentication for API endpoints
• IAM service accounts for GCP inter-service auth
• Firestore security rules for data access
```

**Caption:** "Figure 34. UML Deployment Diagram showing physical infrastructure topology across 8 execution nodes: User's Browser (client-side SPA), Netlify CDN (static asset distribution), Google Cloud Functions (serverless compute), Firestore (NoSQL database), Cloud Storage (artifact repository), Firebase Auth (identity provider), Pub/Sub (message broker), and Windows Host (local WSL2 build environment). Communication paths use HTTPS/WebSocket for browser-cloud interactions, gRPC for efficient inter-service communication within GCP, and TLS 1.3 encryption universally. The Windows Host node contains a nested WSL2 execution environment, illustrating the layered virtualization (Windows → WSL2 → chroot) characteristic of the local build architecture. Firestore and Cloud Storage reside in us-central1 region with multi-zone replication for 99.95% SLA, while Cloud Functions auto-scale to 1000 concurrent instances. The diagram omits the unused Cloud Run node (60-min timeout constraint), focusing on the operational hybrid architecture: cloud-hosted frontend/middleware, local execution layer."

---

### Figure 35: Algorithm Flowchart - Build Orchestration

**Location:** Insert in subsection 4.4.3 "Algorithms and Flowcharts" (after describing the build orchestration logic)

**Diagram Type:** Detailed Algorithm Flowchart

**Tool Settings:**
- Canvas: A4 Portrait (tall)
- Style: Traditional flowchart symbols

**Prompt for Creation:**

```
Create detailed algorithm flowchart for build orchestration:

TITLE: "BUILD-LFS-CORRECT.ps1 Orchestration Algorithm"

[START] Rounded rectangle
   │
   ▼
┌──────────────────────────┐
│ Parse command-line args  │
│ $ProjectName, $LfsVersion│
└──────────┬───────────────┘
           │
           ▼
   ◇───────────────◇ DECISION
   │ WSL2 installed  │
   │ and running?    │
   ◇────┬───────────◇
        │ YES   │ NO
        │       └──────┐
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│ Continue      │  │ ERROR: Display   │
│               │  │ "WSL2 required"  │
└───────┬───────┘  │ Exit code 1      │
        │          └──────────────────┘
        │                │
        ▼                ▼
┌───────────────────────────┐  [END]
│ Check /mnt/lfs/ exists    │
└──────────┬────────────────┘
           │
           ▼
   ◇───────────────◇ DECISION
   │ Directory      │
   │ exists?        │
   ◇────┬───────────◇
        │ YES   │ NO
        │       └──────┐
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│ WARN: Reuse   │  │ Create directory │
│ existing      │  │ sudo mkdir /mnt  │
└───────┬───────┘  │ /lfs             │
        │          └──────┬───────────┘
        │                 │
        └─────────┬───────┘
                  ▼
┌───────────────────────────┐
│ Invoke WSL2 bash command: │
│ wsl -d Ubuntu-22.04       │
│ bash init-lfs-env.sh      │
└──────────┬────────────────┘
           │
           ▼
   ◇───────────────◇ DECISION
   │ init-lfs-env   │
   │ exit code == 0?│
   ◇────┬───────────◇
        │ YES   │ NO
        │       └──────┐
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│ Environment   │  │ ERROR: Init      │
│ initialized   │  │ failed           │
│ $LFS set      │  │ Display stderr   │
└───────┬───────┘  │ Exit code 2      │
        │          └──────────────────┘
        │                │
        ▼                ▼
┌───────────────────────────┐  [END]
│ Invoke Chapter 5 build:   │
│ wsl bash                  │
│ build-lfs-complete-       │
│ local.sh                  │
└──────────┬────────────────┘
           │ (Wait for completion, ~30 min)
           ▼
   ◇───────────────◇ DECISION
   │ Toolchain      │
   │ build success? │
   ◇────┬───────────◇
        │ YES   │ NO
        │       └──────┐
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│ Verify /tools │  │ ERROR: Toolchain │
│ directory     │  │ build failed     │
└───────┬───────┘  │ Parse BUILDLOG   │
        │          │ Exit code 3      │
        │          └──────────────────┘
        │                │
        ▼                ▼
┌───────────────────────────┐  [END]
│ Invoke chroot transition: │
│ wsl sudo bash             │
│ chroot-and-build.sh       │
└──────────┬────────────────┘
           │ (Wait for chroot setup, ~2 min)
           ▼
   ◇───────────────◇ DECISION
   │ Chroot mount   │
   │ successful?    │
   ◇────┬───────────◇
        │ YES   │ NO
        │       └──────┐
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│ Enter chroot  │  │ ERROR: Mount     │
│ environment   │  │ failed (sudo?)   │
└───────┬───────┘  │ Exit code 4      │
        │          └──────────────────┘
        │                │
        ▼                ▼
┌───────────────────────────┐  [END]
│ Execute in-chroot build:  │
│ bash /build-lfs-in-       │
│ chroot.sh                 │
└──────────┬────────────────┘
           │ (Wait for Chapter 6-8, ~50 min)
           ▼
   ◇───────────────◇ DECISION
   │ All packages   │
   │ built?         │
   ◇────┬───────────◇
        │ YES   │ NO
        │       └──────┐
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│ Build kernel  │  │ ERROR: Package   │
│ vmlinuz       │  │ compilation fail │
└───────┬───────┘  │ Identify failed  │
        │          │ Exit code 5      │
        │          └──────────────────┘
        │                │
        ▼                ▼
┌───────────────────────────┐  [END]
│ Package artifacts:        │
│ tar -czf lfs-system.tar.gz│
│ -C /mnt/lfs .             │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│ Move to lfs-output/       │
│ Generate SHA256 checksum  │
│ Write metadata JSON       │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│ Display SUCCESS message   │
│ "Build completed in       │
│  {duration} minutes"      │
│ "Artifact: lfs-system.    │
│  tar.gz ({size} GB)"      │
└──────────┬────────────────┘
           │
           ▼
[END] Rounded rectangle

Add timing annotations on right side:
T+0     Start
T+0.5s  WSL2 check
T+1s    Directory setup
T+2s    init-lfs-env.sh
T+2min  Chapter 5 start
T+32min Chroot transition
T+34min Chapter 6-8 start
T+84min Kernel build
T+90min Artifact packaging
T+92min Success
```

**Caption:** "Figure 35. Detailed algorithm flowchart for BUILD-LFS-CORRECT.ps1 orchestration script showing the sequential execution flow with 5 critical decision points: (1) WSL2 availability check, (2) /mnt/lfs directory existence, (3) environment initialization success, (4) Chapter 5 toolchain build success, (5) chroot mount success, (6) Chapter 6-8 compilation success. Each NO branch terminates with specific error codes (1-5) and descriptive error messages, enabling systematic troubleshooting. Timing annotations (right margin) indicate typical execution duration at each milestone: 2 minutes for initialization, 30 minutes for Chapter 5 toolchain, 2 minutes for chroot transition, 50 minutes for in-chroot build, 6 minutes for kernel compilation, 2 minutes for artifact packaging—totaling ~92 minutes for successful full build. The flowchart illustrates error handling strategy: fail-fast with informative exit codes rather than attempting automatic recovery, prioritizing diagnostic clarity over resilience."

---

(Continuing with remaining diagrams in final section...)
