# Screenshot Categorization Guide

## Overview

This document categorizes all required screenshots into two groups:
1. **Website Screenshots** - Captured from the live Next.js application
2. **Build Process Screenshots** - Captured using the mock build simulation script

---

## Category A: Website Screenshots (No Build Required)

### Group A1: Static Pages and Navigation

**Figure 1: Home Page Landing View**
- **Location**: `http://localhost:3000/`
- **What to Capture**: 
  - Full page view showing hero section
  - Navigation bar with all menu items
  - Feature cards grid
  - Footer
- **Prerequisites**: None
- **Steps**: 
  1. `cd lfs-learning-platform`
  2. `npm run dev`
  3. Navigate to `http://localhost:3000/`
  4. Take full-page screenshot

**Figure 26: WSL Installation Verification**
- **Location**: Command line (Windows/WSL)
- **What to Capture**: 
  - `wsl --status` output
  - Hardware check results
  - Disk space verification
- **Prerequisites**: WSL installed
- **Steps**:
  1. Open PowerShell
  2. Run: `wsl --status`
  3. Run: `wsl -d Ubuntu -- lscpu | grep "CPU(s)"`
  4. Run: `wsl -d Ubuntu -- free -h`
  5. Run: `wsl -d Ubuntu -- df -h /mnt/lfs`
  6. Capture terminal output

**Figure 27: Build Initiation - PowerShell Command**
- **Location**: PowerShell
- **What to Capture**: Command syntax example
- **Prerequisites**: Script exists
- **Steps**:
  1. Open PowerShell
  2. `cd` to project root
  3. Show command: `.\BUILD-LFS-CORRECT.ps1 -StartBuild`
  4. Capture the help output or dry-run mode

### Group A2: Installation Wizard (12 Stages)

**Figure 2: Installation Wizard - Stage 1 (Platform Setup)**
- **Location**: `http://localhost:3000/install`
- **What to Capture**:
  - Left sidebar with all 12 stages
  - Stage 1 highlighted
  - Platform selection cards (Windows/Linux)
  - Command block with WSL commands
  - Progress bar showing 1/12
- **Prerequisites**: None
- **Steps**:
  1. Navigate to `/install`
  2. Ensure stage 1 is active
  3. Take full-page screenshot

**Figure 3: Installation Wizard - Stage 5 (Environment Setup)**
- **Location**: `http://localhost:3000/install`
- **What to Capture**:
  - Stages 1-4 completed (green checkmarks)
  - Stage 5 highlighted with arrow
  - Environment variable export commands
  - Warning callout box
- **Prerequisites**: Mark stages 1-4 complete in localStorage
- **Steps**:
  1. Navigate to `/install`
  2. Open DevTools Console
  3. Run: 
     ```javascript
     localStorage.setItem('wizard-progress', JSON.stringify({
       currentStage: 5,
       completedStages: [1, 2, 3, 4],
       stageData: {}
     }));
     location.reload();
     ```
  4. Take screenshot

**Figure 4: Installation Wizard - Stage 12 (Final Steps)**
- **Location**: `http://localhost:3000/install`
- **What to Capture**:
  - All 11 previous stages marked complete
  - Stage 12 active
  - Success message banner
  - Summary statistics
  - "Start Building" CTA button
- **Prerequisites**: Mark stages 1-11 complete
- **Steps**:
  1. Navigate to `/install`
  2. Open DevTools Console
  3. Run:
     ```javascript
     localStorage.setItem('wizard-progress', JSON.stringify({
       currentStage: 12,
       completedStages: [1,2,3,4,5,6,7,8,9,10,11],
       stageData: {}
     }));
     location.reload();
     ```
  4. Take screenshot

**Figure 13: Installation Timeline Gantt Chart**
- **Location**: Create using Mermaid or project tool
- **What to Capture**: Visual timeline with 4 phases
- **Prerequisites**: None
- **Steps**:
  1. Use Mermaid Live Editor: https://mermaid.live
  2. Paste Gantt chart code (see MOCK-BUILD-SIMULATOR.md)
  3. Export as PNG
  4. Save as `figure-13-timeline.png`

### Group A3: Build Submission Form (No Active Build)

**Figure 5: Build Submission Form - Step 1**
- **Location**: `http://localhost:3000/build`
- **What to Capture**:
  - Step 1 of 3 indicator
  - Project name input field
  - LFS version dropdown
  - Validation hints
- **Prerequisites**: None
- **Steps**:
  1. Navigate to `/build`
  2. Ensure on step 1
  3. Take screenshot

**Figure 6: Build Submission Form - Step 2 (Options)**
- **Location**: `http://localhost:3000/build`
- **What to Capture**:
  - Checkbox list for components
  - Radio button group for optimization
  - Tooltips visible (hover over option)
- **Prerequisites**: Complete step 1
- **Steps**:
  1. Navigate to `/build`
  2. Fill step 1, click "Next"
  3. Hover over an option to show tooltip
  4. Take screenshot

**Figure 7: Build Submission Form - Review Step**
- **Location**: `http://localhost:3000/build`
- **What to Capture**:
  - Configuration summary card
  - Estimated time and cost
  - "Submit Build" button
- **Prerequisites**: Complete steps 1-2
- **Steps**:
  1. Navigate to `/build`
  2. Complete steps 1-2
  3. Reach step 3 (review)
  4. Take screenshot

### Group A4: Dashboard (Empty/Mock State)

**Figure 13: Dashboard - Empty State**
- **Location**: `http://localhost:3000/dashboard`
- **What to Capture**:
  - Empty state illustration
  - Message: "No builds yet..."
  - "Create Your First Build" button
- **Prerequisites**: No builds in Firestore (or use mock empty data)
- **Steps**:
  1. Clear Firestore builds collection OR use dev mode
  2. Navigate to `/dashboard`
  3. Take screenshot

### Group A5: Firebase Console Screenshots

**Figure 14: Firestore Console - LFS_Builds Collection**
- **Location**: Firebase Console
- **What to Capture**:
  - Collection: `builds`
  - Sample document with all fields
  - Document tree expanded
- **Prerequisites**: Firebase project with sample data
- **Steps**:
  1. Go to Firebase Console: https://console.firebase.google.com
  2. Select your project
  3. Navigate to Firestore Database
  4. Open `builds` collection
  5. Expand a sample document
  6. Take screenshot

**Figure 15: Firestore Console - LFS_BuildLogs Subcollection**
- **Location**: Firebase Console
- **What to Capture**:
  - Path: `builds/{buildId}/buildLogs`
  - Multiple log documents visible
  - Fields: timestamp, packageName, level, message
- **Prerequisites**: Sample build with logs
- **Steps**:
  1. In Firestore Console
  2. Navigate to `builds/{any-build-id}/buildLogs`
  3. Show multiple log entries
  4. Take screenshot

**Figure 16: Firestore Indexes Configuration**
- **Location**: Firebase Console
- **What to Capture**:
  - Indexes tab
  - Composite index definition
  - Status: Enabled (green)
- **Prerequisites**: Indexes configured
- **Steps**:
  1. In Firebase Console
  2. Firestore Database > Indexes tab
  3. Show created indexes
  4. Take screenshot

**Figure 17: Example Successful Build Record**
- **Location**: Firebase Console
- **What to Capture**:
  - Complete document matching Table 5
  - Highlight: peakMemory_GB: 6.20
  - Highlight: artifactHash_SHA256 field
- **Prerequisites**: Sample successful build document
- **Steps**:
  1. In Firestore Console
  2. Navigate to specific build document
  3. Expand all fields
  4. Take screenshot

### Group A6: Diagrams (Create with Tools)

**Figure 23: Architecture Diagram - Hybrid WSL/chroot**
- **Tool**: Draw.io, Lucidchart, or Excalidraw
- **What to Create**:
  - Layered architecture showing Windows → WSL2 → chroot
  - Virtual filesystem mounts
  - Trust boundaries
- **Steps**:
  1. Use draw.io: https://app.diagrams.net
  2. Create architecture layers
  3. Export as PNG
  4. Save as `figure-23-architecture.png`

**Figure 24: Code Snippet - Configuration Flags**
- **Tool**: VS Code + Screenshot extension
- **What to Create**:
  - Side-by-side comparison
  - LEFT: Standard config
  - RIGHT: LFS secure config with annotations
- **Steps**:
  1. Create comparison in markdown file
  2. Use VS Code with syntax highlighting
  3. Add annotations with comments
  4. Take screenshot

**Figure 31: Table 6 Visual - Configuration Flags Matrix**
- **Tool**: Google Sheets, Excel, or Figma
- **What to Create**:
  - Formatted table from report Table 6
  - Color-coded by objective
  - Visual indicators
- **Steps**:
  1. Create table in Google Sheets
  2. Apply color coding
  3. Add icons/symbols
  4. Export as image

**Figure 32: Data Flow Diagram - UI to Database**
- **Tool**: Mermaid, Draw.io
- **What to Create**:
  - Flowchart showing 6-step data flow
  - From wizard to database to dashboard
- **Steps**:
  1. Use Mermaid Live Editor
  2. Create flowchart (see MOCK-BUILD-SIMULATOR.md for code)
  3. Export as PNG
  4. Save as `figure-32-dataflow.png`

---

## Category B: Build Process Screenshots (Use Mock Simulator)

### Group B1: Dashboard with Active Builds

**Figure 4: Dashboard - State Indicator Widget**
- **Source**: Mock Build Simulator (State: Multiple builds)
- **What to Capture**:
  - Dashboard showing 5 different build states simultaneously
  - Each state badge clearly visible
- **Prerequisites**: Run mock simulator with multiple builds
- **Script Section**: "Dashboard Mock - Multiple States"
- **Timing**: Capture at T+0 (initial state)

**Figure 11: Dashboard Overview**
- **Source**: Mock Build Simulator (State: Active dashboard)
- **What to Capture**:
  - Four statistics cards with numbers
  - Recent builds table (5 entries)
  - Line chart with build trends
  - "New Build" button
- **Prerequisites**: Run dashboard mock
- **Script Section**: "Dashboard Mock - Statistics"
- **Timing**: Capture at T+0

**Figure 12: Dashboard - Build Details Modal**
- **Source**: Mock Build Simulator + Manual Trigger
- **What to Capture**:
  - Modal overlay with build details
  - Package progress list
  - Log preview (last 50 lines)
  - Action buttons
- **Prerequisites**: Click on build row after dashboard loads
- **Script Section**: "Dashboard Mock - Build Click Handler"
- **Timing**: Capture after clicking build

### Group B2: Real-Time Build Progress

**Figure 5: Dashboard - Progress Tracker Widget**
- **Source**: Mock Build Simulator (State: RUNNING at 67%)
- **What to Capture**:
  - Circular progress: 67%
  - Progress bar: 12/18 packages
  - Current package: "glibc-2.38"
- **Prerequisites**: Run simulator to Phase 3
- **Script Section**: "Build Progress - 67%"
- **Timing**: Capture at T+3min mark

**Figure 6: Dashboard - Performance Metrics Widget**
- **Source**: Mock Build Simulator (State: RUNNING)
- **What to Capture**:
  - Time Elapsed: 42m 18s
  - Estimated Remaining: 8m 12s
  - Peak RAM: 6.2 GB / 9 GB
  - CPU: 78%
- **Prerequisites**: Run simulator to late stage
- **Script Section**: "Performance Metrics - Active"
- **Timing**: Capture at T+4min mark

**Figure 7: Dashboard - Denormalized Data Display**
- **Source**: Mock Build Simulator (State: Live update)
- **What to Capture**:
  - Build card with real-time fields
  - Firestore data structure visible (DevTools)
- **Prerequisites**: Open DevTools Network tab, run simulator
- **Script Section**: "Firestore Real-time Update"
- **Timing**: Capture during status update

### Group B3: Log Viewer Interface

**Figure 8: Log Viewer - Structured Output Display**
- **Source**: Mock Build Simulator (State: RUNNING with logs)
- **What to Capture**:
  - Terminal-style black background
  - Color-coded log levels (all 4 types)
  - Timestamps on left
  - Package filter dropdown active
- **Prerequisites**: Run simulator with log generation
- **Script Section**: "Log Viewer - Active Build"
- **Timing**: Capture at T+2min (multiple packages built)

**Figure 9: Log Viewer - Compilation Progress**
- **Source**: Mock Build Simulator (State: Package compilation)
- **What to Capture**:
  - Detailed compiler output with ANSI colors
  - Package build phases: configure → compile → install
  - Time taken displayed
  - Progress percentage updates
- **Prerequisites**: Run simulator to package build phase
- **Script Section**: "Log Viewer - GCC Compilation"
- **Timing**: Capture during GCC Pass 1 simulation

**Figure 10: Log Viewer - Error State**
- **Source**: Mock Build Simulator (State: FAILED)
- **What to Capture**:
  - Red error message highlighted
  - Error context (20 lines before/after)
  - "Build Failed" banner at top
  - Action buttons: Retry, View Error Log
- **Prerequisites**: Run simulator with failure mode
- **Script Section**: "Log Viewer - Error Simulation"
- **Timing**: Capture at failure point (T+2min failure mode)

**Figure 11: Log Viewer - Time-Series Data Presentation**
- **Source**: Mock Build Simulator (State: COMPLETED)
- **What to Capture**:
  - Full log table with all timestamps
  - Metadata columns visible
  - "Export Logs" button
  - Chronological ordering clear
- **Prerequisites**: Run simulator to completion
- **Script Section**: "Log Viewer - Complete Build"
- **Timing**: Capture after completion

**Figure 25: Log Analysis - State Recovery Interface**
- **Source**: Mock Build Simulator (State: FAILED with recovery)
- **What to Capture**:
  - traceId correlation visible
  - errorMessage highlighted
  - Context lines shown
  - "Resume from Failure" button
  - Manual cleanup instructions
- **Prerequisites**: Run simulator with recovery mode
- **Script Section**: "Error Recovery UI"
- **Timing**: Capture at failure + recovery panel open

### Group B4: Build Submission Success

**Figure 7 (continued): Build Submitted Successfully**
- **Source**: Mock Build Simulator (State: POST submission)
- **What to Capture**:
  - Success modal/banner
  - Build ID generated
  - "View Build Progress" link
  - "Submit Another Build" option
- **Prerequisites**: Submit form after filling
- **Script Section**: "Build Submission Success"
- **Timing**: Capture immediately after submit

### Group B5: Terminal/Script Execution

**Figure 18: VSCode/Terminal - init-lfs-env.sh Execution**
- **Source**: Mock Build Simulator (State: Initialization)
- **What to Capture**:
  - Terminal showing directory creation
  - Environment variable exports
  - Path isolation setup
  - Success messages
- **Prerequisites**: Run init phase of simulator
- **Script Section**: "Phase 1 - Environment Init"
- **Timing**: Capture at T+30s (Phase 1)

**Figure 19: Build Log - Dependency Closure Verification**
- **Source**: Mock Build Simulator (State: GCC Pass 1 config)
- **What to Capture**:
  - Configure command with `--disable-shared` highlighted
  - Success message
  - `ldd` verification output
- **Prerequisites**: Run simulator to GCC Pass 1
- **Script Section**: "Phase 2 - GCC Pass 1 Config"
- **Timing**: Capture at T+1min30s

**Figure 20: Terminal - Parallel Compilation Active**
- **Source**: Mock Build Simulator + htop
- **What to Capture**:
  - htop showing 12 parallel make processes
  - CPU bars at 85-95%
  - Memory usage during compilation
  - MAKEFLAGS=-j12 visible
- **Prerequisites**: Run simulator with htop in split terminal
- **Script Section**: "Phase 2 - Parallel Compilation"
- **Timing**: Capture at T+2min (peak compilation)

**Figure 21: Terminal - chroot Environment Transition**
- **Source**: Mock Build Simulator (State: Phase 3 entry)
- **What to Capture**:
  - Mount commands executed
  - chroot invocation
  - Prompt change to `(lfs chroot) root:/#`
  - Isolation confirmed
- **Prerequisites**: Run simulator to Phase 3
- **Script Section**: "Phase 3 - Chroot Transition"
- **Timing**: Capture at T+3min

**Figure 22: PowerShell - BUILD-LFS-CORRECT.ps1 Execution**
- **Source**: Mock Build Simulator (State: PowerShell wrapper)
- **What to Capture**:
  - PowerShell command execution
  - WSL wrapper output
  - Real-time status updates
  - Final buildId and path
- **Prerequisites**: Run PowerShell wrapper script
- **Script Section**: "PowerShell Wrapper Execution"
- **Timing**: Full execution capture (0-5min)

### Group B6: Artifact and Verification

**Figure 28: Learning Platform - Educational Integration**
- **Source**: Mock Build Simulator + Learning Content
- **What to Capture**:
  - Split screen: Build progress LEFT, Lesson content RIGHT
  - Current package matches lesson section
  - Educational annotations
- **Prerequisites**: Run simulator with learning integration
- **Script Section**: "Educational Integration View"
- **Timing**: Capture at T+2min (during Binutils)

**Figure 29: Artifact Retrieval - File Explorer**
- **Source**: Mock Build Simulator (State: COMPLETED)
- **What to Capture**:
  - Windows Explorer showing output folder
  - .tar.gz artifact file
  - build-metadata-*.txt file
  - File sizes and timestamps
- **Prerequisites**: Run simulator to completion
- **Script Section**: "Artifact Generation"
- **Timing**: Capture after completion (check output folder)

**Figure 30: Reproducibility Verification - Hash Comparison**
- **Source**: Mock Build Simulator (State: Verification)
- **What to Capture**:
  - Terminal split view
  - TOP: sha256sum output
  - BOTTOM: metadata file contents
  - Hashes matching (highlighted green)
  - Verification success message
- **Prerequisites**: Run simulator with hash verification
- **Script Section**: "Hash Verification"
- **Timing**: Capture at final verification step

---

## Screenshot Capture Workflow

### Workflow for Category A (Website Screenshots)

```bash
# Terminal 1: Start development server
cd lfs-learning-platform
npm run dev

# Terminal 2: Screenshot capture
# Use browser DevTools or extension like "Full Page Screenshot"
# For each figure in Category A, follow the specific steps listed above
```

### Workflow for Category B (Build Process Screenshots)

```bash
# Terminal 1: Start development server
cd lfs-learning-platform
npm run dev

# Terminal 2: Run mock build simulator
cd ..
node MOCK-BUILD-SIMULATOR.js

# Terminal 3: Monitor logs (optional)
tail -f lfs-output/mock-build.log

# Capture screenshots at the timing marks indicated in each figure description
```

---

## Tools Required

### Screenshot Capture Tools
- **Browser Extension**: "GoFullPage" (Chrome/Edge) or "Awesome Screenshot"
- **Windows**: Snipping Tool, Snip & Sketch, or ShareX
- **Terminal**: Windows Terminal built-in screenshot (Ctrl+Shift+S)
- **Firebase Console**: Browser screenshot extension

### Diagram Creation Tools
- **Mermaid Live**: https://mermaid.live (for flowcharts, Gantt charts)
- **Draw.io**: https://app.diagrams.net (for architecture diagrams)
- **Excalidraw**: https://excalidraw.com (for hand-drawn style diagrams)
- **VS Code**: With extensions for code screenshots

### Video Recording (Optional)
- **OBS Studio**: For recording full build process demonstration
- **ShareX**: For GIF captures of animations

---

## Naming Convention

Save all screenshots using this format:
```
figure-{number}-{short-description}.png
```

Examples:
- `figure-01-home-page-landing.png`
- `figure-08-log-viewer-structured-output.png`
- `figure-14-firestore-builds-collection.png`
- `figure-30-hash-verification.png`

---

## Quality Checklist

Before submitting each screenshot, verify:

- [ ] **Resolution**: Minimum 1920x1080 for full-page, 1280x720 for components
- [ ] **Clarity**: Text is readable, no blur or compression artifacts
- [ ] **Context**: All relevant UI elements visible
- [ ] **Annotations**: Add arrows/highlights if needed (use tools like Snagit)
- [ ] **Consistency**: Similar screenshots use same zoom level and browser width
- [ ] **Privacy**: No personal data visible (use mock user: "Shubham Bhasker")
- [ ] **Timing**: Build process screenshots captured at correct phase

---

## Quick Reference Summary

| Category | Count | Method | Estimated Time |
|----------|-------|--------|----------------|
| A1: Static Pages | 4 | Browser navigation | 15 min |
| A2: Installation Wizard | 3 | Browser + localStorage | 10 min |
| A3: Build Form | 3 | Browser navigation | 10 min |
| A4: Dashboard Empty | 1 | Browser | 5 min |
| A5: Firebase Console | 4 | Firebase web UI | 20 min |
| A6: Diagrams (Create) | 4 | Draw tools | 60 min |
| **Subtotal Category A** | **19** | **Manual** | **2 hours** |
| B1: Dashboard Active | 3 | Mock simulator | 5 min |
| B2: Build Progress | 3 | Mock simulator | 10 min |
| B3: Log Viewer | 5 | Mock simulator | 15 min |
| B4: Submission Success | 1 | Mock simulator | 2 min |
| B5: Terminal Execution | 5 | Mock simulator | 20 min |
| B6: Artifacts | 3 | Mock simulator | 10 min |
| **Subtotal Category B** | **20** | **Automated** | **1 hour** |
| **TOTAL** | **39** | **Mixed** | **3 hours** |

---

## Notes

- **Category A screenshots** can be captured in any order
- **Category B screenshots** must follow the mock simulator sequence
- Some screenshots require browser DevTools open (Network/Console tabs)
- Keep original high-resolution versions and create web-optimized copies
- Store all screenshots in: `THESIS-ISCS/screenshots/`
- Update this document with actual filenames after capture
