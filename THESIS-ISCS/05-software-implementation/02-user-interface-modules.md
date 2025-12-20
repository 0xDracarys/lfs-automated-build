# 02. User Interface Modules

This section describes the React components that form the interactive frontend for LFS Automated Build. The UI is built with Next.js, React, and Tailwind CSS (Vercel Inc., 2024; Meta Open Source, 2024; Tailwind Labs, 2024).

## Key Components

- **AdminDashboard** (`components/admin-dashboard.tsx`): Displays build statistics, recent activity, and system health. Uses Firestore queries to render real-time metrics. Example snippet:
```tsx
// ...existing code...
const totalBuilds = useFirestoreCount('builds');
const successRate = useFirestoreMetric('builds', 'status', 'COMPLETED');
// ...existing code...
```
This enables rapid feedback for administrators, supporting Objective 3 (real-time observability).

- **LogViewer** (`components/lfs/log-viewer.tsx`): Renders build logs in a terminal-like interface. Color-codes log levels (INFO, WARN, ERROR) for clarity. Example:
```tsx
// ...existing code...
<span className={level === 'ERROR' ? 'text-red-500' : 'text-green-500'}>{message}</span>
// ...existing code...
```
This module is critical for debugging and transparency (see Table 23).

- **BuildProgress** (`components/lfs/build-progress.tsx`): Shows build progress as a percentage bar, updating in real time from Firestore. Supports Objective 1 (automation feedback).

- **InstallWizard** (`app/install/page.tsx`): Guides users through a 5-step build submission process, validating input and providing contextual help. Example validation:
```tsx
// ...existing code...
if (!projectName || projectName.length < 3) setError('Project name too short');
// ...existing code...
```
This ensures data integrity and user experience (see Table 16).

## Rationale

The modular UI design enables rapid iteration, accessibility, and real-time feedback. Tailwind CSS ensures consistent styling, while Next.js provides fast server-side rendering (Vercel Inc., 2024).

## Figure Reference

Figure 20: Screenshot of AdminDashboard showing build statistics and health indicators. See diagrams/figure-20.png.

*Citation: Vercel Inc. (2024). Next.js 14 Documentation. https://nextjs.org/docs*