# User Interface Design Specification

## Overview

This document provides comprehensive UI design specifications for the LFS Automated Build System, including wireframes, component structures, user interaction flows, and design patterns as required by ISCS methodology Section 2.3.5 (Project Part - User Interface Project).

---

## 1. UI Architecture Overview

### 1.1 Design System Foundation

**Framework Stack:**
- **Next.js 16.1.0**: React-based framework with App Router architecture
- **React 19.2.0**: Component-based UI library with Server Components
- **Tailwind CSS 4.0.0**: Utility-first CSS framework for styling
- **Framer Motion 11.15.0**: Animation library for smooth transitions
- **Shadcn/ui**: Headless component library built on Radix UI primitives

**Design Tokens:**
```typescript
// tailwind.config.ts
const colors = {
  primary: '#3b82f6',      // Blue-500
  secondary: '#8b5cf6',    // Violet-500
  success: '#10b981',      // Green-500
  warning: '#f59e0b',      // Amber-500
  error: '#ef4444',        // Red-500
  background: '#ffffff',   // White
  foreground: '#1f2937',   // Gray-800
  muted: '#f3f4f6'        // Gray-100
}

const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem'    // 48px
}

const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem'     // 32px
  }
}
```

### 1.2 Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ RootLayout (app/layout.tsx)                         │
│ - Global styles, fonts, metadata                    │
│ - Providers: AuthProvider, FirebaseProvider         │
└─────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┬──────────────┐
        │                       │              │
┌───────▼────────┐   ┌─────────▼────────┐   ┌▼──────────────┐
│ Home Page (/)  │   │ Install Wizard   │   │ Dashboard     │
│ - Hero section │   │ (/install)       │   │ (/dashboard)  │
│ - Features     │   │ - 12 stages      │   │ - Build list  │
│ - CTA buttons  │   │ - Progress track │   │ - Statistics  │
└────────────────┘   └──────────────────┘   └───────────────┘
        │                       │                      │
        └───────────────────────┴──────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Shared Components      │
                    │ - Navigation           │
                    │ - BuildWizard          │
                    │ - LogViewer            │
                    │ - CommandBlock         │
                    └────────────────────────┘
```

---

## 2. Page-Level UI Specifications

### 2.1 Home Page (`/`)

**Purpose:** Landing page introducing LFS automation platform with educational content.

**Layout Structure:**
```
┌──────────────────────────────────────────────────────────┐
│ Navigation Bar                                           │
│ [Logo] [Learn] [Install] [Build] [Dashboard] [Login]   │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                    Hero Section                          │
│                                                          │
│     Build Linux From Scratch                            │
│     The Modern Way                                      │
│                                                          │
│     [Start Learning →] [Quick Install →]                │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                  Features Grid (3 columns)               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Automated│  │ Learning │  │ Real-time│             │
│  │  Builds  │  │ Platform │  │  Monitor │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                    Footer                                │
└──────────────────────────────────────────────────────────┘
```

**Key Components:**
1. **Hero Section** (lines 1-45 in `app/page.tsx`)
   - Heading: H1, 3xl font, gradient text effect
   - Subheading: Text-xl, muted color
   - CTA buttons: Primary and secondary styles
   - Background: Gradient mesh with subtle animation

2. **Feature Cards** (lines 47-120)
   - Grid layout: 3 columns desktop, 1 column mobile
   - Icon: Lucide React icons (24px)
   - Title: Text-lg, font-semibold
   - Description: Text-sm, text-gray-600

**Screenshot Description:**
> **Figure 1: Home Page Landing View**
> - Full-width hero section with blue gradient background
> - Prominent heading "Build Linux From Scratch The Modern Way"
> - Two action buttons: "Start Learning" (primary blue) and "Quick Install" (outline)
> - Feature cards below with icons showing automation, learning, and monitoring capabilities
> - Responsive navigation bar at top with logo and menu items

**Responsive Behavior:**
- Desktop (≥1024px): 3-column feature grid, full navigation
- Tablet (768-1023px): 2-column grid, hamburger menu
- Mobile (<768px): Single column, bottom navigation

---

### 2.2 Installation Wizard (`/install`)

**Purpose:** 12-stage guided installation process for LFS setup on Windows/Linux.

**Overall Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Progress Bar (12 stages)                                 │
│ ●━━━○━━━○━━━○━━━○━━━○━━━○━━━○━━━○━━━○━━━○━━━○           │
│ 1   2   3   4   5   6   7   8   9  10  11  12         │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌────────────────────┐  ┌──────────────────────────┐  │
│  │  Stage List        │  │  Stage Content            │  │
│  │  (Sidebar)         │  │                           │  │
│  │                    │  │  Stage 1: Platform Setup  │  │
│  │  ✓ 1. Platform     │  │                           │  │
│  │  → 2. Mount Point  │  │  [Platform: Windows/Linux]│  │
│  │  ○ 3. Sources      │  │                           │  │
│  │  ○ 4. LFS User     │  │  Commands:                │  │
│  │  ○ 5. Environment  │  │  ┌────────────────────┐  │  │
│  │  ○ 6. Tools        │  │  │ wsl --install      │  │  │
│  │  ○ 7. Chroot       │  │  │ -d Ubuntu          │  │  │
│  │  ○ 8. Packages     │  │  └────────────────────┘  │  │
│  │  ○ 9. Config       │  │  [Copy] [Mark Complete]  │  │
│  │  ○ 10. Kernel      │  │                           │  │
│  │  ○ 11. Bootloader  │  │  Troubleshooting:         │  │
│  │  ○ 12. Final       │  │  - Enable virtualization  │  │
│  └────────────────────┘  └──────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [← Previous]              [Next Stage →]                 │
└──────────────────────────────────────────────────────────┘
```

**Component Breakdown:**

**1. Progress Indicator Component**
```typescript
// components/wizard/ProgressBar.tsx
interface ProgressBarProps {
  totalStages: 12;
  currentStage: number;
  completedStages: number[];
}

Visual states:
- Completed: Filled circle (●) with blue color
- Current: Outlined circle with pulse animation
- Locked: Gray circle (○) with reduced opacity
- Line: Blue solid (completed), gray dashed (incomplete)
```

**2. Stage List Sidebar**
```typescript
// components/wizard/StageList.tsx
interface StageItemProps {
  stageNumber: number;
  title: string;
  status: 'completed' | 'current' | 'locked';
  icon: React.ComponentType;
}

Visual representation:
✓ Checkmark icon for completed stages (green)
→ Arrow icon for current stage (blue)
○ Empty circle for locked stages (gray)
```

**3. Stage Content Area**

**Stage 1 - Platform Setup:**
```
┌──────────────────────────────────────────────┐
│ Select Your Platform                         │
│                                              │
│ ┌──────────────┐  ┌──────────────┐         │
│ │   Windows    │  │    Linux     │         │
│ │   [WSL2]     │  │   [Native]   │         │
│ │   Selected ✓ │  │              │         │
│ └──────────────┘  └──────────────┘         │
│                                              │
│ Windows Distribution:                       │
│ [Ubuntu v] [Debian] [Other]                 │
│                                              │
│ Commands to execute:                        │
│ ┌──────────────────────────────────────┐   │
│ │ # Enable WSL                         │   │
│ │ wsl --install -d Ubuntu              │   │
│ │                                      │   │
│ │ # Verify installation                │   │
│ │ wsl --list --verbose                 │   │
│ └──────────────────────────────────────┘   │
│ [Copy All Commands]                         │
│                                              │
│ [✓ Mark Stage Complete]                     │
└──────────────────────────────────────────────┘
```

**4. Command Block Component**
```typescript
// components/wizard/CommandBlock.tsx
interface CommandBlockProps {
  commands: string[];
  platform: 'windows' | 'linux';
  copyable: boolean;
}

Features:
- Syntax highlighting for bash/PowerShell
- One-click copy button
- Platform-specific adaptation
- Copy confirmation toast notification
```

**Screenshot Descriptions:**

> **Figure 2: Installation Wizard - Stage 1 (Platform Setup)**
> - Left sidebar showing 12 stages with stage 1 highlighted
> - Progress bar at top showing 1/12 completion
> - Main content area with platform selection cards (Windows/Linux)
> - Command block displaying WSL installation commands
> - Copy button with clipboard icon
> - "Mark Complete" button at bottom (disabled until action confirmed)

> **Figure 3: Installation Wizard - Stage 5 (Environment Setup)**
> - Stage list showing stages 1-4 completed (green checkmarks)
> - Current stage 5 highlighted with arrow indicator
> - Environment variable export commands in terminal-style block
> - Warning callout box for PATH variable importance
> - Code block showing: export LFS=/mnt/lfs, export LFS_TGT=x86_64-lfs-linux-gnu

> **Figure 4: Installation Wizard - Stage 12 (Final Steps)**
> - All previous stages marked complete with checkmarks
> - Final verification checklist with checkboxes
> - Success message banner: "Congratulations! LFS Installation Complete"
> - Summary statistics: Time taken, packages installed, system size
> - "Start Building" CTA button linking to build submission page

**Interaction Flow:**
1. User lands on stage 1 (only accessible stage initially)
2. Selects platform (Windows WSL or Linux native)
3. Copies and executes commands in terminal
4. Verifies completion (e.g., `wsl --version` output)
5. Marks stage complete → stage 2 unlocks
6. Progress persists in localStorage for session recovery

**Implementation Reference:**
- Main file: `lfs-learning-platform/app/install/page.tsx` (lines 1-850)
- Stage definitions: `lfs-learning-platform/lib/data/wizard-stages.ts` (lines 1-1200)
- Storage utilities: `lfs-learning-platform/lib/wizardStorage.ts`

---

### 2.3 Build Submission Form (`/build`)

**Purpose:** Configure and submit LFS build jobs to Cloud Run.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│              Submit New Build                            │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Step 1: Basic Information                                │
│                                                          │
│ Project Name: [____________________________]            │
│               (e.g., "my-lfs-build-v1")                 │
│                                                          │
│ LFS Version:  [12.0 ▼]                                  │
│               Options: 12.0, 11.3, 11.2                 │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Step 2: Build Options                                    │
│                                                          │
│ ☑ Include Kernel (Linux 6.4.12)                         │
│ ☐ Include Network Tools (wget, curl, net-tools)         │
│ ☐ Include Development Tools (glibc-dev, gcc-multilib)   │
│                                                          │
│ Optimization Level:                                      │
│ ○ Standard (-O2)                                         │
│ ● Performance (-O3 -march=native)                        │
│ ○ Size (-Os)                                             │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Step 3: Review Configuration                             │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Configuration Summary                               │ │
│ │ ────────────────────────────────────────────────── │ │
│ │ Project: my-lfs-build-v1                           │ │
│ │ Version: LFS 12.0                                  │ │
│ │ Packages: 18 core + 1 kernel                       │ │
│ │ Estimated Time: 50-60 minutes                      │ │
│ │ Estimated Cost: $0.18                              │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Cancel]                           [Submit Build →]     │
└──────────────────────────────────────────────────────────┘
```

**Form Validation:**
```typescript
// lib/build-client.ts (lines 45-80)
const buildConfigSchema = z.object({
  projectName: z.string()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name too long")
    .regex(/^[a-zA-Z0-9-_]+$/, "Only alphanumeric, dash, underscore allowed"),
  
  lfsVersion: z.enum(['12.0', '11.3', '11.2']),
  
  buildOptions: z.object({
    includeKernel: z.boolean().default(false),
    includeNetwork: z.boolean().default(false),
    includeGlibcDev: z.boolean().default(false),
    optimization: z.enum(['standard', 'performance', 'size']).default('standard')
  })
});
```

**Screenshot Description:**

> **Figure 5: Build Submission Form - Step 1**
> - Clean form layout with single-column design
> - Project name text input with validation hint below
> - LFS version dropdown showing available versions
> - Progress indicator showing "Step 1 of 3"

> **Figure 6: Build Submission Form - Step 2 (Options)**
> - Checkbox list for optional components
> - Radio button group for optimization level
> - Tooltips on hover explaining each option
> - Disabled options shown with reduced opacity and lock icon

> **Figure 7: Build Submission Form - Review Step**
> - Summary card with all selected options
> - Estimated time and cost calculations
> - Warning banner if resource-intensive options selected
> - Prominent "Submit Build" button (primary blue, large size)

**Success State:**
```
┌──────────────────────────────────────────────────────────┐
│            ✓ Build Submitted Successfully!               │
│                                                          │
│  Your build "my-lfs-build-v1" has been queued.          │
│  Build ID: eM2w6RRvdFm3zheuTM1Q                         │
│                                                          │
│  [View Build Progress →]  [Submit Another Build]        │
└──────────────────────────────────────────────────────────┘
```

---

### 2.4 Real-Time Log Viewer

**Purpose:** Display live build logs with terminal-style interface.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Build: my-lfs-build-v1          Status: ● RUNNING       │
│ Started: 2025-12-12 14:32:18    Progress: 65%           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [●] Auto-scroll  [⟳] Refresh  [↓] Download  [✕] Stop   │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Terminal Output                                          │
│ ──────────────────────────────────────────────────────  │
│ [14:32:18] ℹ Starting LFS build process...              │
│ [14:32:19] ℹ Initializing directories at /mnt/lfs       │
│ [14:32:20] ✓ Created /mnt/lfs/sources                   │
│ [14:32:21] ✓ Created /mnt/lfs/tools                     │
│ [14:32:22] ℹ Downloading source packages...             │
│ [14:33:45] ✓ Downloaded binutils-2.41.tar.xz (24.5MB)  │
│ [14:34:12] ✓ Downloaded gcc-13.2.0.tar.xz (87.2MB)     │
│ [14:35:30] ℹ Building binutils pass 1...                │
│ [14:35:31] ℹ Extracting tarball...                      │
│ [14:35:35] ℹ Running configure...                       │
│ [14:36:18] ℹ Compiling (4 cores)...                     │
│ [14:38:32] ✓ Binutils pass 1 completed (3m 15s)        │
│ [14:38:33] ℹ Building GCC pass 1...                     │
│ [14:51:12] ✓ GCC pass 1 completed (12m 40s)            │
│ [14:51:13] ℹ Building glibc...                          │
│ [15:09:35] ✓ Glibc completed (18m 22s)                  │
│ [15:09:36] ℹ Current progress: 12/18 packages (67%)     │
│ [15:09:37] ℹ Estimated remaining: 18 minutes            │
│ ──────────────────────────────────────────────────────  │
│ ▌ Streaming live...                                     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Package Progress                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ ■■■■■■■■■■■■░░░░░░░░ 12/18 completed (67%)             │
└──────────────────────────────────────────────────────────┘
```

**Component Implementation:**
```typescript
// components/lfs/log-viewer.tsx (lines 1-250)
interface LogViewerProps {
  buildId: string;
  autoScroll?: boolean;
}

function LogViewer({ buildId, autoScroll = true }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Firestore real-time listener
    const unsubscribe = onSnapshot(
      collection(db, 'builds', buildId, 'buildLogs')
        .orderBy('timestamp', 'asc'),
      (snapshot) => {
        const newLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LogEntry));
        setLogs(newLogs);
        
        // Auto-scroll to bottom
        if (autoScroll && scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }
    );
    
    return () => unsubscribe();
  }, [buildId]);
  
  return (
    <div className="terminal-container">
      <div className="terminal-header">
        {/* Controls */}
      </div>
      <div ref={scrollRef} className="terminal-body">
        {logs.map(log => (
          <LogLine key={log.id} entry={log} />
        ))}
      </div>
    </div>
  );
}
```

**Log Line Formatting:**
```typescript
// Log types with colors
type LogLevel = 'info' | 'success' | 'warning' | 'error';

const logStyles = {
  info: 'text-blue-400',      // ℹ icon, blue text
  success: 'text-green-400',  // ✓ icon, green text
  warning: 'text-yellow-400', // ⚠ icon, yellow text
  error: 'text-red-400'       // ✕ icon, red text
};

// ANSI color code support for compiler output
const ansiToHtml = (text: string) => {
  return text
    .replace(/\033\[31m/g, '<span class="text-red-400">')
    .replace(/\033\[32m/g, '<span class="text-green-400">')
    .replace(/\033\[0m/g, '</span>');
};
```

**Screenshot Descriptions:**

> **Figure 8: Real-Time Log Viewer - Active Build**
> - Terminal-style black background with monospace font
> - Color-coded log levels (blue info, green success, red error)
> - Timestamps on left margin ([HH:MM:SS] format)
> - Auto-scroll indicator showing "Streaming live..." at bottom
> - Progress bar showing 67% completion with 12/18 packages done
> - Control buttons: Auto-scroll toggle, Refresh, Download logs, Stop build

> **Figure 9: Log Viewer - Compilation Progress**
> - Detailed compiler output with ANSI color codes preserved
> - Real-time package build status (configure → compile → install)
> - Time taken for each package displayed
> - Progress percentage updates every 30 seconds
> - Visual separator lines between packages

> **Figure 10: Log Viewer - Error State**
> - Red error message highlighting compilation failure
> - Error context showing last 20 lines before failure
> - "Build Failed" banner at top in red
> - Action buttons: "Retry Build", "View Error Log", "Report Issue"

**Performance Optimization:**
- Virtual scrolling for logs >1000 lines
- Log batching: Update UI every 500ms instead of per-log
- Lazy loading: Load initial 200 logs, fetch more on scroll

---

### 2.5 Dashboard (`/dashboard`)

**Purpose:** Overview of all builds with statistics and quick actions.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Dashboard                                  [+ New Build] │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Statistics Cards (4 columns)                             │
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ Total    │ │ Running  │ │ Success  │ │ Failed   │   │
│ │ Builds   │ │          │ │          │ │          │   │
│ │   42     │ │    3     │ │   36     │ │    3     │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Recent Builds                                            │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Name              Status    Duration  Started       │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ my-lfs-v1        ● RUNNING  42m       2 hours ago   │ │
│ │ test-build       ✓ SUCCESS  48m       1 day ago     │ │
│ │ kernel-test      ✓ SUCCESS  51m       2 days ago    │ │
│ │ debug-build      ✕ FAILED   12m       3 days ago    │ │
│ │ production-v2    ✓ SUCCESS  47m       5 days ago    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [View All Builds →]                                     │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Build Time Chart (Last 30 Days)                         │
│                                                          │
│  60min ┤                                    ●            │
│  50min ┤              ●     ●          ●       ●         │
│  40min ┤     ●    ●             ●  ●                     │
│  30min ┤                                                 │
│        └────────────────────────────────────────────    │
│         Dec 1      Dec 8      Dec 15     Dec 22         │
└──────────────────────────────────────────────────────────┘
```

**Statistics Card Component:**
```typescript
// components/dashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

Visual design:
- White background with subtle shadow
- Icon in colored circle (blue/green/red based on type)
- Large number (text-3xl, font-bold)
- Trend indicator with arrow (optional)
```

**Build Table Component:**
```typescript
// components/dashboard/BuildTable.tsx
interface BuildTableRow {
  id: string;
  name: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  duration: number; // seconds
  startedAt: Timestamp;
}

Status badges:
- RUNNING: Blue badge with pulse animation
- COMPLETED: Green badge with checkmark
- FAILED: Red badge with X icon
- PENDING: Gray badge with clock icon
```

**Screenshot Descriptions:**

> **Figure 11: Dashboard Overview**
> - Four statistics cards at top showing totals
> - Recent builds table with 5 most recent entries
> - Status badges color-coded (blue/green/red)
> - Line chart showing build duration trend over 30 days
> - "New Build" button in top-right corner (primary CTA)

> **Figure 12: Dashboard - Build Details Modal**
> - Overlay modal triggered by clicking table row
> - Build metadata: ID, name, status, duration
> - Package compilation progress list
> - Log preview (last 50 lines)
> - Action buttons: "View Full Logs", "Download Artifact", "Clone Build"

> **Figure 13: Dashboard - Empty State**
> - Illustration showing empty dashboard
> - Message: "No builds yet. Start your first LFS build!"
> - Large "Create Your First Build" button
> - Link to installation wizard

**Firestore Query:**
```typescript
// hooks/useBuilds.ts (lines 20-45)
const useBuilds = (userId: string) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(
      collection(db, 'builds'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const buildsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Build));
      
      setBuilds(buildsData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userId]);
  
  return { builds, loading };
};
```

---

## 3. Component-Level Specifications

### 3.1 Navigation Component

**File:** `lfs-learning-platform/components/Navigation.tsx`

```
┌──────────────────────────────────────────────────────────┐
│ [LFS Logo] Learn  Install  Build  Dashboard      [User ▼]│
└──────────────────────────────────────────────────────────┘
```

**States:**
1. **Desktop Navigation (≥768px):**
   - Horizontal layout with flex display
   - All menu items visible
   - User dropdown on right with avatar

2. **Mobile Navigation (<768px):**
   - Hamburger menu button (☰)
   - Slide-in drawer from right
   - Vertical menu items

**Interactive Elements:**
- Hover effect: Underline animation on menu items
- Active state: Blue underline for current page
- Dropdown: User menu with "Profile", "Settings", "Logout"

### 3.2 Command Block Component

**Purpose:** Display copyable terminal commands with platform adaptation.

```typescript
// components/wizard/CommandBlock.tsx
interface CommandBlockProps {
  commands: string[];
  language: 'bash' | 'powershell';
  title?: string;
  copyable?: boolean;
}
```

**Visual Design:**
```
┌──────────────────────────────────────────────┐
│ Bash Commands                    [📋 Copy]   │
├──────────────────────────────────────────────┤
│ $ export LFS=/mnt/lfs                        │
│ $ mkdir -pv $LFS                             │
│ $ sudo chown -v $USER $LFS                   │
└──────────────────────────────────────────────┘
```

**Features:**
- Syntax highlighting via Prism.js
- Copy button with clipboard API
- Toast notification on successful copy
- Platform detection for command adaptation

### 3.3 Status Badge Component

**Usage:** Display build status with color coding.

```typescript
// components/ui/StatusBadge.tsx
type BuildStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

const statusConfig = {
  PENDING: { color: 'gray', icon: Clock },
  RUNNING: { color: 'blue', icon: Loader, animate: true },
  COMPLETED: { color: 'green', icon: CheckCircle },
  FAILED: { color: 'red', icon: XCircle },
  CANCELLED: { color: 'gray', icon: Ban }
};
```

**Visual:**
```
● RUNNING   (blue with pulse animation)
✓ COMPLETED (green with checkmark)
✕ FAILED    (red with X icon)
○ PENDING   (gray with clock)
```

---

## 4. Design Patterns and Conventions

### 4.1 Typography Scale

```css
h1: 2rem (32px), font-weight: 700, line-height: 1.2
h2: 1.5rem (24px), font-weight: 600, line-height: 1.3
h3: 1.25rem (20px), font-weight: 600, line-height: 1.4
h4: 1rem (16px), font-weight: 600, line-height: 1.5
body: 1rem (16px), font-weight: 400, line-height: 1.6
small: 0.875rem (14px), font-weight: 400, line-height: 1.5
```

### 4.2 Spacing System

- Container padding: 1rem (mobile), 2rem (tablet), 3rem (desktop)
- Section spacing: 3rem vertical margin between major sections
- Component gap: 1rem default gap in flex/grid layouts
- Button padding: 0.5rem 1rem (small), 0.75rem 1.5rem (default), 1rem 2rem (large)

### 4.3 Animation Guidelines

**Transitions:**
```css
/* Default transition for interactive elements */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Page transitions */
transition: opacity 0.3s ease-in-out;

/* Hover effects */
transform: translateY(-2px);
transition: transform 0.2s ease;
```

**Framer Motion Variants:**
```typescript
// Fade in from bottom
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Stagger children
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
```

### 4.4 Accessibility Standards

**WCAG 2.1 AA Compliance:**
- Color contrast ratio ≥4.5:1 for normal text
- Color contrast ratio ≥3:1 for large text (≥18pt)
- Keyboard navigation support for all interactive elements
- ARIA labels for icon-only buttons
- Focus visible indicators (2px blue outline)

**Implementation:**
```typescript
// Button with proper ARIA
<button
  aria-label="Copy commands to clipboard"
  aria-pressed={isCopied}
  className="focus:ring-2 focus:ring-blue-500"
>
  <ClipboardIcon aria-hidden="true" />
</button>

// Form input with error state
<input
  aria-invalid={hasError}
  aria-describedby="input-error"
  {...inputProps}
/>
{hasError && (
  <span id="input-error" role="alert">
    {errorMessage}
  </span>
)}
```

---

## 5. Responsive Design Breakpoints

### 5.1 Breakpoint Definitions

```typescript
const breakpoints = {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large (desktops)
  '2xl': '1536px' // 2X extra large (large desktops)
};
```

### 5.2 Layout Adaptations

**Grid Columns:**
- Mobile (<640px): 1 column
- Tablet (640-1023px): 2 columns
- Desktop (≥1024px): 3-4 columns

**Navigation:**
- Mobile: Hamburger menu with drawer
- Tablet/Desktop: Full horizontal navigation

**Dashboard Cards:**
- Mobile: Stacked vertically
- Tablet: 2x2 grid
- Desktop: 1x4 horizontal row

---

## 6. UML Diagrams Reference

As required by ISCS Annexes 8-12, the following diagrams are provided:

### 6.1 Use Case Diagram (Annexe 8)
See: `THESIS-ISCS/04-project-part/diagrams/use-case-diagram.png`

**Actors:**
- Guest User
- Authenticated User
- System Administrator

**Use Cases:**
- Browse learning content
- Register account
- Submit build
- Monitor build progress
- Download artifacts
- Manage user settings

### 6.2 Sequence Diagrams (Annexe 9)
See: `THESIS-ISCS/04-project-part/diagrams/sequence-diagrams/`

**Diagrams:**
1. Build submission sequence
2. Real-time log streaming sequence
3. Authentication flow sequence

### 6.3 Activity Diagram (Annexe 11)
See: `SYSTEM-PROCESSES-WORKFLOW.md` Section 1

### 6.4 Component Diagram (Annexe 12)
See: `THESIS-ISCS/04-project-part/diagrams/component-diagram.png`

---

## 7. Implementation Technologies

### 7.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.0 | React framework with SSR/SSG |
| React | 19.2.0 | UI component library |
| TypeScript | 5.7.3 | Type-safe JavaScript |
| Tailwind CSS | 4.0.0 | Utility-first CSS framework |
| Framer Motion | 11.15.0 | Animation library |
| React Hook Form | 7.54.2 | Form state management |
| Zod | 3.24.1 | Schema validation |

### 7.2 Component Libraries

- **Radix UI**: Headless accessible components
- **Lucide React**: Icon library (900+ icons)
- **Recharts**: Charting library for dashboard
- **Prism.js**: Syntax highlighting for code blocks

---

## References

- Component implementations: `lfs-learning-platform/components/`
- Page layouts: `lfs-learning-platform/app/`
- Tailwind config: `lfs-learning-platform/tailwind.config.ts`
- TypeScript types: `lfs-learning-platform/lib/types/`
- Design system: `lfs-learning-platform/components/ui/`
