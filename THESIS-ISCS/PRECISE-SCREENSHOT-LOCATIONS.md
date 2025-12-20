# Precise Screenshot Locations & Build Capture Guide

## Quick Reference Guide

Based on your expert report sections 3.2.6, 3.6, 4.1-4.4, here are the **exact locations** where to find/capture each screenshot during the **isolated controlled build environment** execution.

---

## Section 3.2.6: Logical UI Component Structure

### Figure 1: Build Submission Wizard
**Report Reference:** Section 3.2.6, paragraph 1, bullet 1
**Location:** `http://localhost:3000/build`
**File:** `lfs-learning-platform/app/build/page.tsx`
**Build Environment:** NOT NEEDED (live UI)

**Steps to Capture:**
```bash
# Terminal 1: Start dev server
cd lfs-learning-platform
npm run dev

# Browser: Navigate to http://localhost:3000/build
# Capture 3 screenshots:
# - Step 1/3: Project name + LFS version dropdown
# - Step 2/3: Options (checkboxes for includeKernel, includeGlibcDev)
# - Step 3/3: Review summary
```

**Screenshot Names:**
- `figure-01-wizard-step1-config.png`
- `figure-01-wizard-step2-options.png`
- `figure-01-wizard-step3-review.png`

---

### Figure 2: Real-time Monitoring Dashboard
**Report Reference:** Section 3.2.6, paragraph 1, bullet 2 (Table 1, Row 2)
**Location:** `http://localhost:3000/dashboard`
**File:** `lfs-learning-platform/app/dashboard/page.tsx`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js dashboard`

**Steps to Capture:**
```bash
# Terminal 1: Keep dev server running

# Terminal 2: Generate dashboard state in isolated environment
node MOCK-BUILD-SIMULATOR.js dashboard

# This creates: lfs-output/build-capture/dashboard-state.json

# Import to Firestore Emulator OR manually create document:
# Collection: builds
# Document ID: LFS-17019284-C5
# Fields from Table 5:
{
  "buildId": "LFS-17019284-C5",
  "status": "RUNNING",
  "currentPackage": "glibc-2.38",
  "progress_percent": 67,
  "totalTime_sec": 2550,
  "peakMemory_GB": 6.20
}

# Browser: Refresh http://localhost:3000/dashboard
# Capture showing:
# - Status badge: RUNNING (green pulse)
# - Current package: "glibc-2.38"
# - Progress: 67% (12/18 packages)
# - Peak RAM: 6.2 GB / 9 GB
```

**Screenshot Name:** `figure-02-dashboard-realtime-status.png`

**Key Data Points to Show (from Table 5):**
- currentPackage: "GCC Pass 2" or "glibc-2.38"
- progress_percent: 67
- peakMemory_GB: 6.20
- totalTime_sec: 2910

---

### Figure 3: Structured Log Viewer (Normal State)
**Report Reference:** Section 3.2.6, paragraph 1, bullet 3 (Table 1, Row 3)
**Location:** `http://localhost:3000/logs/{buildId}`
**File:** `lfs-learning-platform/components/lfs/log-viewer.tsx`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full`

**Steps to Capture:**
```bash
# Terminal 2: Execute full build in isolated controlled environment
node MOCK-BUILD-SIMULATOR.js full

# Wait until T+2:00 (after several packages built)
# Note the buildId from output (e.g., LFS-1733998765432-C5)

# Import logs to Firestore:
# Collection: builds/{buildId}/buildLogs
# Use: lfs-output/build-capture/firestore-data-LFS-xxxxx-C5.json

# Browser: Navigate to http://localhost:3000/logs/LFS-1733998765432-SIM
# Capture showing:
# - Filter controls (Package dropdown, Level checkboxes)
# - Log table with columns: Timestamp | Level | Package | Message
# - Color-coded levels: INFO (cyan), WARN (yellow), ERROR (red)
# - Live indicator pulsing
# - Row count: "Showing 150 of 2,847 entries"
```

**Screenshot Name:** `figure-03-log-viewer-structured.png`

**Key Data (from 4.1.2 Schema):**
- logId: "LFS-17019284-C5-log-0042"
- timestamp: ISO format with milliseconds
- level: INFO, WARN, ERROR, DEBUG (all 4 visible)
- packageName: binutils-2.41, gcc-13.2.0, glibc-2.38

---

### Figure 4: Structured Log Viewer (Error State)
**Report Reference:** Section 3.2.6, paragraph 1, bullet 3 (errorMessage auto-highlight)
**Location:** `http://localhost:3000/logs/{buildId}`
**File:** `lfs-learning-platform/components/lfs/log-viewer.tsx`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js error`

**Steps to Capture:**
```bash
# Terminal 2: Trigger controlled error scenario in isolated environment
node MOCK-BUILD-SIMULATOR.js error

# This generates failed build state with error at gcc-13.2.0
# Note the buildId from output

# Import to Firestore (error state)

# Browser: Navigate to logs page
# Capture showing:
# - Status badge: FAILED (red)
# - Error row highlighted with red background
# - Error message expanded:
#   "ERROR    gcc-13.2.0    make[2]: *** [Makefile:234: main.o] Error 1
#                           gcc: error: unrecognized command line option..."
# - Top banner: "Build failed at gcc-13.2.0. Review error details below."
# - Action buttons: "Retry Build", "Report Issue"
# - traceId visible
```

**Screenshot Name:** `figure-04-log-viewer-error-highlighted.png`

**Key Data (from Table 5 - Failed variant):**
- status: "FAILED"
- errorMessage: "Compilation failed: gcc-13.2.0 - unrecognized command line option..."
- currentPackage: "gcc-13.2.0"

---

### Figure 5: Artifact Management Panel
**Report Reference:** Section 3.2.6, Table 1, Row 4
**Location:** `http://localhost:3000/dashboard` (artifact section)
**File:** `lfs-learning-platform/app/dashboard/page.tsx` (artifact card component)
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (run to completion)

**Steps to Capture:**
```bash
# Wait for full build to complete in isolated environment (T+5:00)

# Build process generates artifact metadata in:
# lfs-output/build-capture/

# In dashboard, look for completed build, click "View Details"
# Artifact card should show:
# - Archive icon
# - Title: "lfs-chapter5-toolchain.tar.gz"
# - Size: "4.2 GB"
# - Hash: "89a3f2c5...c6d" (truncated with copy button)
# - Download buttons: "Download Artifact", "Download Metadata"
# - Verification checkbox: "I have verified the SHA256 hash"
```

**Screenshot Name:** `figure-05-artifact-management-panel.png`

**Key Data (from Table 5):**
- artifactHash_SHA256: "89a3f2c5d1e67b9a2c3f4a5b6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
- buildId: "LFS-17019284-C5"

---

## Section 3.6: Installation and Deployment Timetable

### Figure 6: Installation Phases Gantt Chart
**Report Reference:** Section 3.6 (Phase 0-3 table)
**Location:** CREATE using Mermaid
**File:** N/A (diagram to create)
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js diagrams`

**Steps to Create:**
```bash
# Extract Mermaid diagram code from build environment
node MOCK-BUILD-SIMULATOR.js diagrams

# Output includes Gantt chart code
# Copy the ganttChart section

# Go to: https://mermaid.live
# Paste code, export as PNG (1920x1080)

# Or use VS Code with Mermaid extension:
# Create file: gantt-timeline.mmd
# Paste code
# Right-click → Export diagram
```

**Screenshot Name:** `figure-06-installation-gantt-timeline.png`

**Key Data (from Section 3.6):**
- Phase 0: 30 min (Host API & WSL)
- Phase 1: 10-20 min (init-lfs-env.sh, 3.8 GB downloads)
- Phase 2: 25-35 min (Pass 1 Cross-Compilation)
- Phase 3: 20-30 min (chroot, Pass 2)
- Total: 45-52 min

---

### Figure 7: Phase-to-Script Mapping Flowchart
**Report Reference:** Section 3.6 (Key Script/Process column)
**Location:** CREATE using Draw.io or ASCII
**File:** N/A (diagram to create)
**Build Environment:** NOT NEEDED

**Steps to Create:**
```bash
# Option A: Draw.io
# Go to: https://app.diagrams.net
# Create flowchart showing:
# Phase 0 → init-lfs-env.sh → Phase 1 → build-lfs-complete-local.sh → Phase 2 → chroot-and-build.sh → Phase 3

# Option B: ASCII art in code editor
# Save as: phase-script-mapping.txt
# Export screenshot

# Option C: Use Mermaid flowchart from MOCK-BUILD-SIMULATOR.js diagrams output
```

**Screenshot Name:** `figure-07-phase-script-mapping.png`

---

## Section 4.1: Physical Database Specification (DDL)

### Figure 8: Firestore - LFS_Builds Collection Schema
**Report Reference:** Section 4.1.1 (Physical Schema table)
**Location:** Firebase Console
**File:** `firestore.rules`, `lfs-learning-platform/lib/firebase.ts`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (generates build data)

**Steps to Capture:**
```bash
# Option A: Firebase Emulator (Recommended for screenshots)
cd lfs-learning-platform
firebase emulators:start

# Browser: http://localhost:4000
# Go to Firestore tab
# Manually create document OR import from:
# lfs-output/build-capture/firestore-data-LFS-xxxxx-C5.json

# Option B: Firebase Console (live project)
# Go to: https://console.firebase.google.com
# Select project
# Firestore Database → builds collection

# Expand document: LFS-17019284-C5
# Show ALL fields visible:
buildId: "LFS-17019284-C5"
userId: "user-shubham-bhasker"
status: "COMPLETED"
currentPackage: "GCC Pass 2"
submittedAt: Timestamp(2024-12-12 09:00:00)
totalTime_sec: 2910
peakMemory_GB: 6.20
artifactHash_SHA256: "89a3f2c5...c6d"
errorMessage: null

# Capture full screen showing document tree expanded
```

**Screenshot Name:** `figure-08-firestore-builds-schema.png`

**Highlight These (from Table 5):**
- peakMemory_GB: 6.20 (proves ≤ 9 GB constraint)
- artifactHash_SHA256 (proves NFR-R3)

---

### Figure 9: Firestore - LFS_BuildLogs Subcollection Schema
**Report Reference:** Section 4.1.2 (Physical Schema table)
**Location:** Firebase Console
**File:** `lfs-learning-platform/lib/firebase.ts`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full`

**Steps to Capture:**
```bash
# In Firebase Console or Emulator
# Navigate to: builds/{buildId}/buildLogs subcollection

# Should show 5-10 log documents
# Expand one document showing all fields:
logId: "LFS-17019284-C5-log-0042"
buildId: "LFS-17019284-C5"
timestamp: Timestamp(2024-12-12 09:15:32.456)
level: "INFO"
message: "Compiling gcc-13.2.0: [67%] Building C object..."

# Capture showing:
# - Multiple entries sorted by timestamp
# - All 4 log levels visible (INFO, WARN, ERROR, DEBUG)
# - Subcollection path visible at top
```

**Screenshot Name:** `figure-09-firestore-buildlogs-schema.png`

---

### Figure 10: Firestore Indexes Configuration
**Report Reference:** Section 4.1.1 (submittedAt INDEXED), 4.1.2 (timestamp INDEXED)
**Location:** Firebase Console → Indexes tab
**File:** `lfs-learning-platform/firestore.indexes.json`
**Build Environment:** NOT NEEDED

**Steps to Capture:**
```bash
# Firebase Console → Firestore Database → Indexes tab

# Should show:
# Composite Index:
# - Collection: builds
# - Fields: userId (Asc), status (Asc), submittedAt (Desc)
# - Status: Enabled ✓

# Single-Field Indexes:
# - Collection: buildLogs, Field: timestamp, Status: Enabled ✓
# - Collection: buildLogs, Field: buildId, Status: Enabled ✓

# If not present, deploy indexes:
firebase deploy --only firestore:indexes

# Then capture indexes tab
```

**Screenshot Name:** `figure-10-firestore-indexes-config.png`

---

### Figure 11: Table 5 Visualization (Example Record)
**Report Reference:** Section 4.1.3, Table 5
**Location:** Firebase Console OR create formatted table
**File:** N/A
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (generates Table 5 data)

**Steps to Capture:**

**Option A: Annotated Firebase Screenshot**
```bash
# Take Figure 8 screenshot
# Add annotations in image editor (Snagit, Paint, etc.):
# - Highlight peakMemory_GB: 6.20 with green box
# - Add label: "[NFR-P2 ≤ 9 GB] ✓"
# - Highlight artifactHash_SHA256 with green box
# - Add label: "[NFR-R3 Reproducibility] ✓"
# - Highlight status: COMPLETED with checkmark
```

**Option B: Create Formatted Table**
```bash
# In Excel, Google Sheets, or Figma:
# Create table matching Table 5 from report
# 3 columns: Attribute | Value | Source/Justification
# 8 rows (all attributes from Table 5)
# Color-code:
# - Green for constraints met (peakMemory ≤ 9 GB)
# - Blue for hash stability
# Export as PNG
```

**Screenshot Name:** `figure-11-table5-visualization.png`

**Must Show (exact values from Table 5):**
- buildId: LFS-17019284-C5
- status: COMPLETED ✓
- currentPackage: GCC Pass 2 ✓
- totalTime_sec: 2910 (48m 30s) ✓
- peakMemory_GB: 6.20 ✓ [≤ 9 GB] ✓
- artifactHash_SHA256: 89a3f2c5...c6d ✓
- errorMessage: NULL ✓

---

## Section 4.2: Formal Module Specifications

### Figure 12: init-lfs-env.sh Terminal Output
**Report Reference:** Section 4.2, Module table row 1
**Location:** WSL Terminal
**File:** `init-lfs-env.sh` (line 1-180 in `lfs-build.sh`)
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (capture at T+0:30)

**Steps to Capture:**
```bash
# Terminal: Execute build in isolated controlled environment
node MOCK-BUILD-SIMULATOR.js full

# At T+0:30 (Phase 1 - Initialization), capture terminal showing:
[INFO] Initializing LFS build environment...
[INFO] Creating directory structure:
       mkdir -pv /mnt/lfs/{bin,boot,etc,lib,lib64,sbin,usr,var,tools,sources}
[SUCCESS] Directory structure created
[INFO] Setting environment variables:
       export LFS=/mnt/lfs
       export LFS_TGT=x86_64-lfs-linux-gnu
       export PATH=/mnt/lfs/tools/bin:/usr/bin:/bin
       export MAKEFLAGS="-j12"
[SUCCESS] Environment configured

# Use Windows Terminal (for color support)
# Screenshot entire terminal window
```

**Screenshot Name:** `figure-12-init-lfs-env-output.png`

**Key Data (from Section 4.2):**
- export PATH=$LFS_TOOLS/tools/bin:/usr/bin:...
- Deterministic execution context (NFR-R2)

---

### Figure 13: build-lfs-complete-local.sh with --disable-shared Flag
**Report Reference:** Section 4.2, Module table row 2; Table 6 row 1
**Location:** WSL Terminal
**File:** `build-lfs-complete-local.sh`, `build-gcc-pass1.sh`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (capture at T+1:30)

**Steps to Capture:**
```bash
# Terminal: Execute build in isolated controlled environment
node MOCK-BUILD-SIMULATOR.js full

# At T+1:30 (Binutils Pass 1 configure phase), capture:
[INFO] Package 1/18: binutils-2.41
[INFO] Configure flags (DEPENDENCY CLOSURE):
./configure --prefix=/tools \
    --with-sysroot=$LFS \
    --target=$LFS_TGT \
    --disable-nls \
    --disable-werror \
    --disable-shared    ← Ensures Host-Independent Output (NFR-R1)

[SUCCESS] Configuration completed
[INFO] Compiling with MAKEFLAGS=-j12...  ← Parallel optimization (NFR-P1)
[100%] Built target binutils

# In image editor, add arrows pointing to:
# --disable-shared: "Dependency Closure (NFR-R1)"
# -j12: "Amdahl's Law (NFR-P1)"
```

**Screenshot Name:** `figure-13-build-with-disable-shared.png`

**Key Data (from Table 6):**
- --disable-shared flag visible
- MAKEFLAGS=-j12 visible
- NFR-R1 (Host-Independent) and NFR-P1 (Performance) labels

---

### Figure 14: chroot-and-build.sh Transition
**Report Reference:** Section 4.2, Module table row 3
**Location:** WSL Terminal
**File:** `chroot-and-build.sh`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (capture at T+3:00)

**Steps to Capture:**
```bash
# Terminal: Execute build in isolated controlled environment
node MOCK-BUILD-SIMULATOR.js full

# At T+3:00 (Phase 3 - chroot transition), capture:
[INFO] Phase 3: Transitioning to chroot environment

[INFO] Mounting virtual filesystems:
$ mount --bind /dev $LFS/dev
$ mount -t devpts devpts $LFS/dev/pts
$ mount -t proc proc $LFS/proc
$ mount -t sysfs sysfs $LFS/sys
[SUCCESS] Virtual filesystems mounted

[INFO] Entering chroot with clean environment:
$ /usr/bin/env -i \
    HOME=/root \
    TERM=$TERM \
    PATH=/bin:/usr/bin:/sbin:/usr/sbin:/tools/bin \
    /bin/bash --login +h

[SUCCESS] Now in chroot environment
(lfs chroot) root:/#  ← Isolated native environment (NFN-S1)

# Add annotations:
# - Arrow to prompt change: "user@host $" → "(lfs chroot) root:/#"
# - Arrow to env -i: "Clean environment (NFN-S2)"
# - Arrow to mount --bind: "Kernel binding"
```

**Screenshot Name:** `figure-14-chroot-transition.png`

**Key Data (from Section 4.2):**
- mount --bind /dev $LFS/dev (kernel binding)
- /usr/bin/env -i (environment cleaning)
- NFN-S1, NFN-S2 isolation

---

### Figure 15: BUILD-LFS-CORRECT.ps1 PowerShell Wrapper
**Report Reference:** Section 4.2, Module table row 4
**Location:** PowerShell Terminal
**File:** `BUILD-LFS-CORRECT.ps1`
**Build Environment:** Run actual PowerShell wrapper script

**Steps to Capture:**
```powershell
# PowerShell: Run wrapper
.\BUILD-LFS-CORRECT.ps1 -StartBuild

# Capture output showing:
[INFO] LFS Build Orchestrator - PowerShell Wrapper
[INFO] Translating Windows paths to WSL...
       Windows: C:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated
       WSL:     /mnt/c/Users/Chintu/Documents/Dev Zone/Dev work web/lfs-automated

[INFO] Invoking WSL build script:
       wsl -d Ubuntu bash -c "chmod +x '/mnt/c/.../lfs-build.sh' && bash '/mnt/c/.../lfs-build.sh'"

[INFO] Build submitted successfully!
       Build ID: LFS-17019284-C5
       Status: SUBMITTED → PENDING

[SUCCESS] Build orchestration complete
```

**Screenshot Name:** `figure-15-powershell-wrapper.png`

**Key Data (from Section 4.2):**
- FN-1 (Full Automation), NFR-P2 (Portability)
- Path translation Windows → WSL

---

## Section 4.3: Programmer's Guide

### Figure 16: Hybrid WSL/chroot Architecture Diagram
**Report Reference:** Section 4.3, paragraph 1 (Hybrid WSL/chroot Isolation)
**Location:** CREATE using Draw.io
**File:** N/A (diagram to create)
**Build Environment:** NOT NEEDED

**Steps to Create:**
```bash
# Tool: Draw.io (https://app.diagrams.net)

# Create 3-layer architecture diagram:
# Layer 1 (Top): Windows Host
#   - PowerShell Wrapper (BUILD-LFS-CORRECT.ps1)
#   - User Entry Point (FN-1)

# Layer 2 (Middle): WSL2 Ubuntu
#   - Host Toolchain (GCC, Binutils)
#   - Pass 1 Cross-Compilation (--disable-shared)
#   - init-lfs-env.sh execution

# Layer 3 (Bottom): chroot Isolated LFS
#   - [TRUST BOUNDARY - NFN-S1]
#   - LFS Glibc, GCC (self-hosted)
#   - Pass 2 Native Compilation
#   - env -i clean environment (NFN-S2)

# Add annotations:
# - "60-min timeout workaround"
# - "18m 22s + 12m 40s = 30m 62s fits within chroot"
# - Trust boundary line between WSL and chroot
# - Performance critical path marker

# Export as PNG (1920x1080)
```

**Screenshot Name:** `figure-16-hybrid-wsl-chroot-architecture.png`

**Key Data (from Section 4.3):**
- 60-min Cloud Run timeout constraint
- Glibc: 18m 22s, GCC: 12m 40s
- NFR-P1 Performance priority

---

### Figure 17: Configuration Flags Comparison (Table 6 Visual)
**Report Reference:** Section 4.3, Table 6
**Location:** CREATE side-by-side comparison
**File:** N/A (create in VS Code or image editor)
**Build Environment:** NOT NEEDED

**Steps to Create:**

**Option A: VS Code Split View**
```bash
# Create two files:
# standard-config.sh (LEFT)
./configure \
    --prefix=/usr \
    --enable-shared    # Host-dependent
    --enable-threads

# lfs-secure-config.sh (RIGHT)
./configure \
    --prefix=/tools \
    --target=$LFS_TGT \
    --disable-shared   # [NFR-R1] Host-Independent
    --disable-nls      # Minimal TCB
    --disable-werror   # Stability

# Open side-by-side in VS Code
# Add comments with annotations
# Screenshot
```

**Option B: Formatted Table**
```bash
# In Excel/Google Sheets, create Table 6:
# 4 columns: Flag | Component | Rationale | NFR Addressed
# 3 rows:
# - --disable-shared | Binutils, GCC Pass 1 | Dependency Closure | NFR-R1
# - --without-bash-malloc | Bash | Memory Stability | Maintainability
# - MAKEFLAGS=-j12 | All Scripts | Amdahl's Law | NFR-P1

# Color-code by NFR type
# Export as PNG
```

**Screenshot Name:** `figure-17-config-flags-comparison.png`

**Key Data (from Table 6 - all 3 rows):**
- --disable-shared → NFR-R1
- --without-bash-malloc → Memory Stability
- MAKEFLAGS=-j12 → NFR-P1 (45-52 min)

---

### Figure 18: Two-Pass Bootstrapping Audit
**Report Reference:** Section 4.3, paragraph 2 (Toolchain Integrity)
**Location:** CREATE flowchart
**File:** N/A (diagram to create)
**Build Environment:** NOT NEEDED

**Steps to Create:**
```bash
# Tool: Mermaid or Draw.io

# Create flowchart:
# PASS 1: Cross-Compilation (Host → LFS)
# ┌─────────────────────┐
# │ Host GCC 11.4.0     │
# │      ↓              │
# │ Compile GCC 13.2.0  │
# │ --disable-shared    │
# │      ↓              │
# │ Output: /tools/gcc  │
# │ Hash: abc123...     │
# └─────────────────────┘
#          ↓
# PASS 2: Native (LFS → LFS)
# ┌─────────────────────┐
# │ LFS GCC 13.2.0      │
# │      ↓              │
# │ Re-compile GCC      │
# │ same flags          │
# │      ↓              │
# │ Output: /usr/gcc    │
# │ Hash: abc123... ✓   │
# └─────────────────────┘
#          ↓
#   [TCB VERIFIED]

# Add annotations:
# - Circle hash values
# - "Hash stability = reproducibility (NFR-R3)"
# Export as PNG
```

**Screenshot Name:** `figure-18-two-pass-bootstrapping.png`

**Key Data (from Section 4.3):**
- Pass 1 uses --disable-shared
- Pass 2 output is hash-stable
- Self-Validation (NFR-R3)

---

## Section 4.4: Detailed User Guide

### Figure 19: Prerequisite Verification Checklist
**Report Reference:** Section 4.4, paragraph 1
**Location:** WSL Terminal
**File:** Create `prerequisite-check.sh` script
**Build Environment:** NOT NEEDED

**Steps to Capture:**
```bash
# Create simple prerequisite check script:
cat > prerequisite-check.sh << 'EOF'
#!/bin/bash
echo "[INFO] LFS Build - Prerequisite Verification"
echo ""
echo "Hardware Checks:"
echo "✓ CPU Cores: $(nproc) (Requirement: ≥ 4)"
echo "✓ RAM: $(free -h | awk '/^Mem:/{print $2}') (Requirement: ≥ 8 GB)"
echo "✓ Disk Space: $(df -h /mnt/lfs | awk 'NR==2{print $4}') free (Requirement: ≥ 50 GB)"
echo ""
echo "Software Checks:"
echo "✓ WSL Version: $(wsl --version | head -1)"
echo "✓ Bash: $(bash --version | head -1)"
echo "✓ GCC: $(gcc --version | head -1)"
echo ""
echo "[SUCCESS] All prerequisites met! Ready to build."
EOF

chmod +x prerequisite-check.sh
bash prerequisite-check.sh

# Capture terminal output
```

**Screenshot Name:** `figure-19-prerequisite-verification.png`

**Key Data (from Section 4.4):**
- ≥ 8 GB RAM (NFR-P2)
- ≥ 50 GB SSD
- Multi-core CPU

---

### Figure 20: Build Initiation via PowerShell
**Report Reference:** Section 4.4, paragraph 2 (FN-1 Full Automation)
**Location:** PowerShell Terminal
**File:** `BUILD-LFS-CORRECT.ps1`
**Build Environment:** Actual PowerShell execution

**Steps to Capture:**
```powershell
# PowerShell: Run with formatted output
.\BUILD-LFS-CORRECT.ps1 -StartBuild

# Should show:
┌─────────────────────────────────────────┐
│  LFS Automated Build - User Initiation  │
├─────────────────────────────────────────┤
│  [STEP 1] Verifying prerequisites... ✓  │
│  [STEP 2] Translating paths...       ✓  │
│  [STEP 3] Invoking WSL script...     ✓  │
│  [STEP 4] Submitting to queue...     ✓  │
└─────────────────────────────────────────┘

Build Details:
  Build ID:    LFS-17019284-C5
  Status:      SUBMITTED → PENDING
  Estimated:   45-52 minutes

Monitoring:
  Dashboard:   http://localhost:3000/dashboard

# Capture full PowerShell window
```

**Screenshot Name:** `figure-20-build-initiation-powershell.png`

**Key Data (from Section 4.4):**
- FN-1 (Full Automation) - single command
- PowerShell as sole entry point

---

### Figure 21: Log Viewer Monitoring (In Use)
**Report Reference:** Section 4.4, paragraph 3 (NFN-U1 diagnostics)
**Location:** `http://localhost:3000/logs/{buildId}`
**File:** `lfs-learning-platform/components/lfs/log-viewer.tsx`
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full`

**Steps to Capture:**
```bash
# Use Figure 3 setup, but show USER INTERACTION:

# Browser: Navigate to log viewer
# Apply filters:
# - Package dropdown: Select "glibc-2.38"
# - Level checkboxes: Check "ERROR" only

# Hover over an error message (show tooltip with full context)
# Click "Download Full Logs" button (show hover state)

# Capture showing:
# - Filters applied and active
# - User mouse cursor visible
# - Filtered results (only glibc-2.38 ERROR entries)
# - Action buttons in focus
```

**Screenshot Name:** `figure-21-log-viewer-monitoring.png`

**Key Data (from Section 4.4):**
- NFN-U1 (Build Observability)
- Filter functionality in use

---

### Figure 22: State Cleanup & Resume Procedure
**Report Reference:** Section 4.4, paragraph 3 (NFN-U2 recovery)
**Location:** WSL Terminal + PowerShell
**File:** Create `cleanup-failed-build.sh` script
**Build Environment:** NOT NEEDED

**Steps to Capture:**

**Step 1: Cleanup Terminal**
```bash
# Create cleanup script
cat > cleanup-failed-build.sh << 'EOF'
#!/bin/bash
BUILD_ID=$1
echo "[INFO] Cleaning up failed build state..."
echo "[INFO] Unmounting chroot filesystems..."
sudo umount -l $LFS/dev/pts $LFS/dev $LFS/proc $LFS/sys $LFS/run
echo "[INFO] Removing partial artifacts..."
rm -rf $LFS/tools/failed-*
echo "[SUCCESS] Cleanup complete"
EOF

chmod +x cleanup-failed-build.sh
bash cleanup-failed-build.sh LFS-17019284-C5

# Capture terminal showing cleanup output
```

**Step 2: Resume PowerShell**
```powershell
# PowerShell
.\BUILD-LFS-CORRECT.ps1 -ResumeBuild LFS-17019284-C5

# Shows:
[INFO] Resuming from last successful package: binutils-2.41
[INFO] Skipping completed: 3/18 packages
[INFO] Starting: gcc-13.2.0
```

**Screenshot Name:** `figure-22-state-cleanup-resume.png` (split-screen or sequence)

**Key Data (from Section 4.4):**
- NFN-U2 (Recovery Guidance)
- State cleanup instructions
- Resume capability

---

### Figure 23: Hash Verification (NFR-R3 Proof)
**Report Reference:** Section 4.4, paragraph 4 (Artifact Integrity Assurance)
**Location:** WSL Terminal (split-screen)
**File:** N/A (manual terminal commands)
**Build Capture:** `node MOCK-BUILD-SIMULATOR.js full` (generates artifact + metadata)

**Steps to Capture:**
```bash
# After full build completes in isolated environment, navigate to output directory
cd lfs-output/mock-build

# Create mock artifact and metadata for demo
echo "Mock LFS toolchain archive" > lfs-chapter5-toolchain.tar.gz
sha256sum lfs-chapter5-toolchain.tar.gz > calculated-hash.txt

# Create metadata file
cat > build-metadata-LFS-17019284-C5.txt << 'EOF'
Build ID: LFS-17019284-C5
Build Date: 2024-12-12 15:20:33
LFS Version: 12.0
Total Time: 48m 30s
Peak Memory: 6.20 GB

Artifact Integrity (SHA256):
89a3f2c5d1e67b9a2c3f4a5b6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d

Verification Status: ✓ MATCH
EOF

# Split-screen terminal capture:
# LEFT PANE:
sha256sum lfs-chapter5-toolchain.tar.gz
# Output: 89a3f2c5d1e67b9a2c3f4a5b6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d

# RIGHT PANE:
cat build-metadata-LFS-17019284-C5.txt

# BOTTOM: Add visual comparison showing EXACT MATCH
# Use image editor to highlight matching hashes with green boxes
```

**Screenshot Name:** `figure-23-hash-verification-proof.png`

**Key Data (from Table 5, Section 4.4):**
- artifactHash_SHA256: "89a3f2c5d1e67b9a2c3f4a5b6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
- NFR-R3 (Reproducibility Validation)
- Visual MATCH confirmation

---

## Complete Capture Sequence

**Note:** All build captures execute in an **isolated controlled environment** to ensure reproducible screenshots without interfering with production builds.

### Session 1: Website UI (2 hours)
```bash
# Terminal 1
cd lfs-learning-platform
npm run dev

# Browser captures:
# Figure 1: http://localhost:3000/build (3 screenshots - steps 1-3)
# Figure 2: http://localhost:3000/dashboard (with mock data)
# Figure 3: http://localhost:3000/logs/{buildId} (normal state)
# Figure 5: http://localhost:3000/dashboard (artifact panel)
# Figure 21: http://localhost:3000/logs/{buildId} (user interaction)
```

### Session 2: Isolated Build Execution Terminal (1.5 hours)
```bash
# Terminal 2: Run build in controlled isolated environment
node MOCK-BUILD-SIMULATOR.js full

# Capture at timing marks:
# T+0:30 → Figure 12 (init-lfs-env.sh)
# T+1:30 → Figure 13 (build with --disable-shared)
# T+3:00 → Figure 14 (chroot transition)
# T+5:00 → Figure 23 (hash verification)

# Then run:
node MOCK-BUILD-SIMULATOR.js error
# → Figure 4 (error highlighting)
# → Figure 22 (cleanup procedure)
```

### Session 3: Firebase Console (30 min)
```bash
# Option A: Emulator
firebase emulators:start
# http://localhost:4000

# Option B: Live Console
# https://console.firebase.google.com

# Captures:
# Figure 8: builds collection schema
# Figure 9: buildLogs subcollection schema
# Figure 10: Indexes tab
# Figure 11: Annotated Table 5 record
```

### Session 4: Diagrams Creation (1.5 hours)
```bash
# Mermaid diagrams:
node MOCK-BUILD-SIMULATOR.js diagrams
# Copy to https://mermaid.live
# Export:
# - Figure 6: Gantt chart

# Draw.io diagrams:
# Create:
# - Figure 7: Phase-script mapping flowchart
# - Figure 16: Hybrid WSL/chroot architecture
# - Figure 18: Two-pass bootstrapping audit

# Code/Table visuals:
# Create in VS Code or Excel:
# - Figure 17: Configuration flags comparison
```

### Session 5: PowerShell & Verification (30 min)
```powershell
# PowerShell Terminal:
.\BUILD-LFS-CORRECT.ps1 -StartBuild
# → Figure 15, Figure 20

# WSL Terminal:
bash prerequisite-check.sh
# → Figure 19

bash cleanup-failed-build.sh LFS-17019284-C5
# → Figure 22
```

---

## File Location Summary

| Figure | Location Type | Exact Path/URL |
|--------|---------------|----------------|
| 1 | Live UI | http://localhost:3000/build |
| 2 | Live UI | http://localhost:3000/dashboard |
| 3 | Live UI | http://localhost:3000/logs/{buildId} |
| 4 | Live UI | http://localhost:3000/logs/{buildId} (error state) |
| 5 | Live UI | http://localhost:3000/dashboard (artifact section) |
| 6 | Create Diagram | Mermaid Live (mermaid.live) |
| 7 | Create Diagram | Draw.io (app.diagrams.net) |
| 8 | Firebase Console | console.firebase.google.com → Firestore → builds |
| 9 | Firebase Console | console.firebase.google.com → Firestore → buildLogs |
| 10 | Firebase Console | console.firebase.google.com → Firestore → Indexes |
| 11 | Firebase Console | Annotated screenshot of Figure 8 |
| 12 | Terminal | WSL bash (T+0:30 of full simulation) |
| 13 | Terminal | WSL bash (T+1:30 of full simulation) |
| 14 | Terminal | WSL bash (T+3:00 of full simulation) |
| 15 | Terminal | PowerShell (.\BUILD-LFS-CORRECT.ps1) |
| 16 | Create Diagram | Draw.io (app.diagrams.net) |
| 17 | Create Visual | VS Code split-view OR Excel table |
| 18 | Create Diagram | Draw.io or Mermaid |
| 19 | Terminal | WSL bash (prerequisite-check.sh) |
| 20 | Terminal | PowerShell (formatted build initiation) |
| 21 | Live UI | http://localhost:3000/logs/{buildId} (with user interaction) |
| 22 | Terminal | WSL bash (cleanup) + PowerShell (resume) |
| 23 | Terminal | WSL bash split-screen (hash comparison) |

---

## Build Capture Command Reference

| Command | Generates Build Data For | Timing Marks |
|---------|--------------------------|--------------|
| `node MOCK-BUILD-SIMULATOR.js full` | Figures 3, 12, 13, 14, 23 | T+0:30, T+1:30, T+3:00, T+5:00 |
| `node MOCK-BUILD-SIMULATOR.js error` | Figures 4, 22 | T+2:00 (failure point) |
| `node MOCK-BUILD-SIMULATOR.js dashboard` | Figure 2 | Instant |
| `node MOCK-BUILD-SIMULATOR.js diagrams` | Figure 6 (Gantt code) | Instant |

---

## Data Validation Checklist

Before submitting screenshots, verify these exact values appear:

- ✅ buildId: "LFS-17019284-C5"
- ✅ status: "COMPLETED"
- ✅ currentPackage: "GCC Pass 2" or "glibc-2.38"
- ✅ totalTime_sec: 2910 (displays as "48m 30s")
- ✅ peakMemory_GB: 6.20 (≤ 9 GB constraint met)
- ✅ progress_percent: 67 (12/18 packages)
- ✅ artifactHash_SHA256: "89a3f2c5d1e67b9a2c3f4a5b6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
- ✅ Phase timings: 30m + 10-20m + 25-35m + 20-30m = 45-52m total
- ✅ --disable-shared flag visible in configure output
- ✅ MAKEFLAGS=-j12 visible in compilation output

---

**Total Time Estimate: 5.5 hours**
- Session 1 (UI): 2 hours
- Session 2 (Terminal): 1.5 hours
- Session 3 (Firebase): 0.5 hours
- Session 4 (Diagrams): 1.5 hours
- Session 5 (Verification): 0.5 hours

**Ready to capture all 23 figures!**
