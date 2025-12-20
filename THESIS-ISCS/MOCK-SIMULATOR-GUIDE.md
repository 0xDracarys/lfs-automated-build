# Mock Build Simulator - Quick Start Guide

## Overview

The Mock Build Simulator generates all build states and logs needed for screenshot capture WITHOUT actually compiling anything. It simulates:
- All 5 build states (SUBMITTED → PENDING → RUNNING → COMPLETED/FAILED)
- 18 package builds with realistic timing
- Color-coded terminal output
- Firestore-compatible mock data
- Dashboard states

## Installation

No installation needed! Just ensure you have Node.js installed.

```bash
# Check Node.js version (need 14+)
node --version
```

## Quick Start

### Option 1: Full Build Simulation (Most Screenshots)

```bash
# Run complete build simulation (takes ~5 minutes)
node MOCK-BUILD-SIMULATOR.js full
```

**What you get:**
- ✓ Complete terminal output with all 18 packages
- ✓ Color-coded logs (INFO/WARN/ERROR/SUCCESS)
- ✓ All build states from start to finish
- ✓ Mock Firestore data
- ✓ Artifact hash generation

**Screenshots you can capture:**
- Figure 8: Log Viewer with structured output
- Figure 9: Compilation progress
- Figure 18: Terminal execution
- Figure 19: Dependency closure verification
- Figure 20: Parallel compilation (combine with htop)
- Figure 29: Artifact files

### Option 2: Error Scenario (For Error Screenshots)

```bash
# Simulate build failure
node MOCK-BUILD-SIMULATOR.js error
```

**What you get:**
- ✓ Failed build state
- ✓ Error messages with stack trace
- ✓ traceId for recovery
- ✓ errorMessage field populated

**Screenshots you can capture:**
- Figure 10: Log Viewer error state
- Figure 25: State recovery interface

### Option 3: Dashboard States (For Dashboard Screenshots)

```bash
# Generate multiple build states for dashboard
node MOCK-BUILD-SIMULATOR.js dashboard
```

**What you get:**
- ✓ 5 builds in different states simultaneously
- ✓ Dashboard statistics (total builds, success rate, etc.)
- ✓ Mock data ready for import

**Screenshots you can capture:**
- Figure 4: State indicator widget (5 badges)
- Figure 5: Progress tracker (67%)
- Figure 6: Performance metrics widget
- Figure 11: Dashboard overview

### Option 4: Generate Diagrams

```bash
# Get Mermaid diagram code
node MOCK-BUILD-SIMULATOR.js diagrams
```

**What you get:**
- ✓ Gantt chart code for Figure 13
- ✓ Data flow diagram code for Figure 32

Copy the output to https://mermaid.live to generate PNG images.

## Output Files

All outputs are saved to: `lfs-output/mock-build/`

### Generated Files

1. **`build-LFS-xxxxx-SIM.log`**
   - Plain text log file
   - All log entries with timestamps
   - Use for: Code screenshots, documentation

2. **`state-LFS-xxxxx-SIM.json`**
   - Current build state
   - Progress, status, memory usage
   - Use for: State inspection, debugging

3. **`firestore-mock-LFS-xxxxx-SIM.json`**
   - Firestore-compatible mock data
   - Complete builds + buildLogs structure
   - Use for: Firebase Emulator import, testing

4. **`dashboard-mock.json`** (dashboard mode only)
   - Multiple builds for dashboard view
   - Statistics and recent builds
   - Use for: Dashboard UI testing

## Step-by-Step Screenshot Workflow

### Phase 1: Prepare Environment

```bash
# Terminal 1: Start dev server
cd lfs-learning-platform
npm run dev

# Terminal 2: Keep ready for screenshots
cd ..
```

### Phase 2: Capture Build Process Screenshots

#### Figure 8 & 9: Log Viewer Active

```bash
# Start full simulation
node MOCK-BUILD-SIMULATOR.js full

# When you see "Building: binutils-2.41", capture:
# - Color-coded output (INFO=cyan, SUCCESS=green, ERROR=red)
# - Package name column
# - Timestamps

# When you see GCC compilation messages, capture:
# - "[  1%] Building C object..."
# - Progress percentages
# - Parallel compilation indicators
```

**Timing for screenshots:**
- T+0:30 - Environment setup (Figure 18)
- T+1:00 - First package (Binutils) starting
- T+2:00 - GCC compilation in progress (Figure 9)
- T+3:30 - Glibc with --without-bash-malloc flag (Figure 19)
- T+5:00 - Final success message

#### Figure 10: Error State

```bash
# Run error simulation
node MOCK-BUILD-SIMULATOR.js error

# Capture when you see:
# - Red ERROR messages
# - Make error output
# - "BUILD FAILED!" banner
# - traceId and errorMessage
```

#### Figure 20: Parallel Compilation + htop

```bash
# Terminal 3: Start htop first
htop

# Terminal 2: Run simulation
node MOCK-BUILD-SIMULATOR.js full

# When at compilation phase:
# 1. Arrange terminals side-by-side
# 2. Capture both showing:
#    - LEFT: htop with 12 processes, 85-95% CPU
#    - RIGHT: simulator showing "Compiling with -j12"
```

### Phase 3: Capture Dashboard Screenshots

```bash
# Generate dashboard mock data
node MOCK-BUILD-SIMULATOR.js dashboard

# Import the mock data (see "Importing Mock Data" section below)

# Navigate to http://localhost:3000/dashboard

# Capture:
# - Figure 4: All 5 state badges visible
# - Figure 5: Progress widget showing 67%
# - Figure 6: Performance metrics
# - Figure 11: Full dashboard view
```

### Phase 4: Capture Firebase Console Screenshots

```bash
# After running any simulation, you have mock data

# Option A: Use Firebase Emulator
firebase emulators:start
# Import mock data through Emulator UI
# Navigate to http://localhost:4000/firestore

# Option B: Upload to real Firestore
# (Use test environment only!)
node upload-mock-to-firestore.js
```

**Capture:**
- Figure 14: builds collection with expanded document
- Figure 15: buildLogs subcollection
- Figure 16: Indexes tab
- Figure 17: Specific successful build record

## Importing Mock Data

### Method 1: Firebase Emulator (Recommended)

```bash
# Start emulators
cd lfs-learning-platform
firebase emulators:start

# In browser: http://localhost:4000
# 1. Go to Firestore tab
# 2. Manually create documents from firestore-mock-*.json
# OR use the import script below
```

### Method 2: Programmatic Import

Create `import-mock-data.js`:

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({
  projectId: 'demo-lfs-project' // Use emulator
});

const db = admin.firestore();
db.settings({
  host: 'localhost:8080',
  ssl: false
});

const mockData = JSON.parse(
  fs.readFileSync('lfs-output/mock-build/firestore-mock-LFS-xxxxx-SIM.json')
);

async function importData() {
  // Import build document
  const buildId = Object.keys(mockData.builds)[0];
  const buildData = mockData.builds[buildId];
  
  await db.collection('builds').doc(buildId).set(buildData);
  console.log('✓ Build document imported');
  
  // Import logs
  const batch = db.batch();
  mockData.buildLogs.forEach(log => {
    const ref = db.collection('builds').doc(buildId)
                  .collection('buildLogs').doc(log.logId);
    batch.set(ref, log);
  });
  
  await batch.commit();
  console.log(`✓ ${mockData.buildLogs.length} log entries imported`);
}

importData().catch(console.error);
```

Run with:
```bash
node import-mock-data.js
```

## Advanced Usage

### Combining with Real UI

```bash
# Terminal 1: Dev server
cd lfs-learning-platform
npm run dev

# Terminal 2: Run simulator and capture buildId
node MOCK-BUILD-SIMULATOR.js full | tee output.log

# Extract buildId from output
BUILD_ID=$(grep "Build LFS-" output.log | head -1 | awk '{print $2}')
echo $BUILD_ID

# Terminal 3: Navigate to specific build
# Open: http://localhost:3000/logs/$BUILD_ID
```

### Custom Package List

Edit `MOCK-BUILD-SIMULATOR.js` to modify packages:

```javascript
// Line 62-80: PACKAGES array
const PACKAGES = [
    { name: 'your-package', version: '1.0', pass: 1, 
      configTime: 0.5, compileTime: 2.0, installTime: 0.2 },
    // ... add more
];
```

### Adjusting Timing

Speed up for quick screenshots:

```javascript
// In buildPackage() function, reduce sleep times:
await this.sleep(0.1); // Instead of 0.5
```

Or slow down for manual capture:

```javascript
await this.sleep(2); // More time to prepare screenshot
```

## Troubleshooting

### Issue: No color output

**Solution:**
```bash
# Windows: Use Windows Terminal (not CMD)
# Or force colors:
node MOCK-BUILD-SIMULATOR.js full --color=always
```

### Issue: Output directory not found

**Solution:**
```bash
# Create manually
mkdir -p lfs-output/mock-build
```

### Issue: Mock data not loading in UI

**Solution:**
```bash
# Verify file exists
ls lfs-output/mock-build/firestore-mock-*.json

# Check JSON validity
node -e "console.log(JSON.parse(require('fs').readFileSync('lfs-output/mock-build/firestore-mock-LFS-xxxxx-SIM.json')))"
```

### Issue: Can't see all log colors

**Solution:**
```bash
# Use a terminal that supports 256 colors
# Recommended: Windows Terminal, iTerm2, Alacritty

# Test colors:
node -e "console.log('\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m')"
```

## Screenshot Checklist

Use this checklist to ensure you capture everything:

### Build Process Screenshots
- [ ] Figure 8: Structured log output with all color levels
- [ ] Figure 9: Compilation progress with percentage updates
- [ ] Figure 10: Error state with red highlighting
- [ ] Figure 18: Environment initialization
- [ ] Figure 19: Configure flags with --disable-shared
- [ ] Figure 20: Parallel compilation + htop showing 12 processes
- [ ] Figure 25: Error recovery interface with traceId
- [ ] Figure 29: Output directory with artifacts

### Dashboard Screenshots
- [ ] Figure 4: State indicator with 5 badges (SUBMITTED/PENDING/RUNNING/COMPLETED/FAILED)
- [ ] Figure 5: Progress tracker showing 67% and 12/18 packages
- [ ] Figure 6: Performance metrics widget
- [ ] Figure 11: Full dashboard overview
- [ ] Figure 12: Build details modal (click on build row)

### Firebase Console Screenshots
- [ ] Figure 14: builds collection structure
- [ ] Figure 15: buildLogs subcollection
- [ ] Figure 16: Indexes configuration
- [ ] Figure 17: Successful build record with all fields

### Diagram Screenshots
- [ ] Figure 13: Gantt chart (from Mermaid)
- [ ] Figure 32: Data flow diagram (from Mermaid)

## Tips for Best Screenshots

1. **Resolution**: Use 1920x1080 or higher
2. **Terminal size**: 120x40 characters minimum
3. **Font**: Use monospace font (Consolas, Fira Code, JetBrains Mono)
4. **Zoom**: Ensure text is readable (14-16pt font size)
5. **Timing**: Pause simulation if needed (Ctrl+C, review, restart)
6. **Clean terminal**: Clear terminal before starting for clean output
7. **Multiple attempts**: Run simulation multiple times to get perfect timing
8. **Save raw logs**: Keep the `.log` files for reference

## Performance Notes

- **Full simulation**: ~5 minutes runtime
- **Error simulation**: ~2 minutes runtime
- **Dashboard mode**: Instant
- **Disk usage**: ~1 MB per simulation (logs + mock data)

## Next Steps

After capturing screenshots:

1. **Organize files**:
   ```bash
   mkdir THESIS-ISCS/screenshots
   cp lfs-output/mock-build/*.log THESIS-ISCS/screenshots/
   ```

2. **Rename screenshots** using naming convention:
   ```
   figure-08-log-viewer-structured-output.png
   figure-09-compilation-progress.png
   figure-10-log-viewer-error-state.png
   ```

3. **Create diagram images**:
   - Copy Mermaid code to https://mermaid.live
   - Export as PNG (1920x1080)
   - Save as `figure-13-timeline.png` and `figure-32-dataflow.png`

4. **Verify quality**:
   - Check all text is readable
   - Ensure colors are visible
   - Confirm data matches thesis claims (e.g., peakMemory_GB: 6.20)

5. **Document capture**:
   - Update SCREENSHOT-CATEGORIZATION.md with actual filenames
   - Note any deviations or special captures
   - Add timestamps for reference

## Support

If you encounter issues:

1. Check `lfs-output/mock-build/*.log` for error messages
2. Verify Node.js version: `node --version` (need 14+)
3. Review this guide's Troubleshooting section
4. Check console output for warnings

---

**Ready to capture screenshots!** Start with `node MOCK-BUILD-SIMULATOR.js full` and follow the timing marks.
