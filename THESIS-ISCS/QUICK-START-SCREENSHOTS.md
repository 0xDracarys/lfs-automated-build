# 🎯 Screenshot Capture - Quick Reference Card

## 📋 Three Files You Need

1. **SCREENSHOT-CATEGORIZATION.md** → What to capture
2. **MOCK-SIMULATOR-GUIDE.md** → How to use simulator
3. **SCREENSHOT-SYSTEM-SUMMARY.md** → Complete overview

## ⚡ Quick Start (5 Minutes)

### Test the Simulator
```powershell
node MOCK-BUILD-SIMULATOR.js full
```

**What you'll see:**
- Color-coded logs scrolling
- 18 packages building
- ~5 minutes runtime
- Output files in `lfs-output/mock-build/`

### Check Outputs
```powershell
ls lfs-output/mock-build/
```

**Expected files:**
- `build-LFS-xxxxx-SIM.log` ✓
- `state-LFS-xxxxx-SIM.json` ✓
- `firestore-mock-LFS-xxxxx-SIM.json` ✓

## 🎬 Capture Workflow

### Part 1: Website Screenshots (2 hours)

```powershell
# Start dev server
cd lfs-learning-platform
npm run dev
```

**Capture in browser** (http://localhost:3000):
- ✅ Figure 1: Home page
- ✅ Figures 2-4: Wizard stages 1, 5, 12
- ✅ Figures 5-7: Build form steps
- ✅ Figure 13: Dashboard empty state

**Firebase Console** (console.firebase.google.com):
- ✅ Figures 14-17: Firestore collections

### Part 2: Build Screenshots (1 hour)

```powershell
# Run simulator
cd ..
node MOCK-BUILD-SIMULATOR.js full
```

**Capture at timing marks:**
| Time | Action | Figures |
|------|--------|---------|
| T+0:30 | Init complete | Figure 18 |
| T+2:00 | GCC compiling | Figure 9 |
| T+3:30 | Glibc flags | Figure 19 |
| T+5:00 | Artifacts | Figure 29 |

### Part 3: Special Modes (30 min)

```powershell
# Error state
node MOCK-BUILD-SIMULATOR.js error
# → Figures 10, 25

# Dashboard
node MOCK-BUILD-SIMULATOR.js dashboard
# → Figures 4, 5, 6, 11

# Diagrams
node MOCK-BUILD-SIMULATOR.js diagrams
# → Copy to mermaid.live → Figures 13, 32
```

## 📸 Screenshot Priority

### Priority 1: CRITICAL (Must have first)
- Figures 1-3: Wizard flow
- Figures 4-7: Dashboard + Form
- Figures 8-11: Log viewer
- Figures 14-17: Firestore schema
- Figure 30: Hash verification

### Priority 2: Technical validation
- Figures 18-22: Module execution
- Figures 26-29: User walkthrough

### Priority 3: Architecture
- Figures 23-25: Diagrams + recovery
- Figures 31-32: Supplementary diagrams

## 🛠️ Simulator Modes

| Mode | Command | Runtime | Outputs |
|------|---------|---------|---------|
| **Full** | `node MOCK-BUILD-SIMULATOR.js full` | 5 min | All states, 18 packages, complete logs |
| **Error** | `node MOCK-BUILD-SIMULATOR.js error` | 2 min | Failed build, error messages |
| **Dashboard** | `node MOCK-BUILD-SIMULATOR.js dashboard` | instant | Multiple build states |
| **Diagrams** | `node MOCK-BUILD-SIMULATOR.js diagrams` | instant | Mermaid code |

## 📊 Data That Matches Thesis

| Figure | What to Show | Exact Value |
|--------|--------------|-------------|
| 17 | Firestore record | `peakMemory_GB: 6.20` |
| 6 | Performance widget | `48m 30s` total time |
| 5 | Progress tracker | `12/18 packages (67%)` |
| 30 | Hash verification | SHA256 match ✓ |
| 19 | Configure flags | `--disable-shared` |

## 🎨 Screenshot Quality

**Required:**
- ✅ 1920x1080 resolution minimum
- ✅ Readable text (14-16pt font)
- ✅ All colors visible
- ✅ Clean, no personal data
- ✅ Proper naming: `figure-{num}-{desc}.png`

## ❌ Troubleshooting

### No colors?
Use **Windows Terminal**, not CMD

### Simulator won't run?
```powershell
node --version  # Should be 14+
```

### Can't find outputs?
```powershell
mkdir lfs-output\mock-build -Force
```

### Mock data not loading?
```powershell
# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('lfs-output/mock-build/firestore-mock-LFS-xxxxx-SIM.json'))"
```

## 📁 File Organization

```
THESIS-ISCS/
├── screenshots/                  ← Save here
│   ├── figure-01-home-page.png
│   ├── figure-08-log-viewer.png
│   └── ...
└── SCREENSHOT-CATEGORIZATION.md  ← Reference

lfs-output/mock-build/           ← Outputs
├── build-*.log
├── state-*.json
└── firestore-mock-*.json
```

## ✅ Completion Checklist

### Before Starting
- [ ] Node.js installed (v14+)
- [ ] Dev server can start (`npm run dev`)
- [ ] Windows Terminal ready (for colors)
- [ ] Screenshot tool installed (Snipping Tool, ShareX)

### Website Screenshots (19 figures)
- [ ] Home page (Figure 1)
- [ ] Wizard stages 1, 5, 12 (Figures 2-4)
- [ ] Build form steps 1-3 (Figures 5-7)
- [ ] Dashboard empty (Figure 13)
- [ ] Firestore collections (Figures 14-17)

### Build Process Screenshots (13 figures)
- [ ] Log viewer states (Figures 8-11)
- [ ] Terminal execution (Figures 18-22)
- [ ] Artifacts (Figure 29)
- [ ] Hash verification (Figure 30)

### Diagrams (4 figures)
- [ ] Gantt timeline (Figure 12/13)
- [ ] Architecture (Figure 23)
- [ ] Config comparison (Figure 24)
- [ ] Data flow (Figure 32)

### Quality Check
- [ ] All 32 figures captured
- [ ] Resolution 1920x1080+
- [ ] Text readable
- [ ] Proper naming
- [ ] Data matches thesis claims
- [ ] SCREENSHOT-CATEGORIZATION.md updated

## 🚀 Start Now!

**Step 1:** Test simulator
```powershell
node MOCK-BUILD-SIMULATOR.js full
```

**Step 2:** Capture Priority 1 (14 critical figures)

**Step 3:** Review MOCK-SIMULATOR-GUIDE.md for details

---

**Total Time Estimate:** 4 hours (2h website + 1h build + 1h diagrams)

**Questions?** Check:
- MOCK-SIMULATOR-GUIDE.md - Detailed usage
- SCREENSHOT-SYSTEM-SUMMARY.md - Complete overview
- SCREENSHOT-CATEGORIZATION.md - All figure specs
