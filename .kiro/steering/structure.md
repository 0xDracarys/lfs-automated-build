# Project Structure

## Root Level

```
/
├── lfs-learning-platform/   # Main Next.js frontend application
├── functions/               # Firebase Cloud Functions
├── helpers/                 # Build helper scripts (Node.js)
├── public/                  # Static HTML files for Firebase hosting
├── docs/                    # Documentation files
├── Alfs-v1/                 # Legacy LFS automation scripts
├── *.sh                     # Shell scripts for LFS build process
├── *.ps1                    # PowerShell scripts for Windows
└── firebase.json            # Firebase configuration
```

## Frontend Application (lfs-learning-platform/)

```
lfs-learning-platform/
├── app/                     # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── ai/              # AI chat endpoints
│   │   ├── build/           # Build management
│   │   ├── progress/        # User progress tracking
│   │   └── ...
│   ├── auth/                # Login/signup pages
│   ├── dashboard/           # User dashboard
│   ├── docs/                # Documentation pages
│   ├── downloads/           # Download resources
│   ├── learn/               # Learning modules
│   │   └── [moduleId]/      # Dynamic module routes
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Reusable UI components (card, badge, progress, etc.)
│   ├── auth/                # Auth-related components (ProtectedRoute)
│   ├── lfs/                 # LFS-specific components (build-progress, log-viewer)
│   ├── providers/           # Context providers wrapper
│   └── *.tsx                # Feature components (ai-chat, lesson-viewer, etc.)
├── contexts/
│   └── AuthContext.tsx      # Firebase auth context
├── data/
│   └── lessons.ts           # Module and lesson content definitions
├── lib/
│   ├── data/                # Data utilities
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Service layer
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── firebase.ts          # Firebase initialization
│   └── progressService.ts   # Progress tracking service
├── types/
│   └── database.ts          # Database type definitions
└── public/                  # Static assets
```

## Code Organization Conventions

- **Pages:** Use App Router conventions (`page.tsx`, `layout.tsx`)
- **Components:** Feature components at root, reusable UI in `ui/` subfolder
- **Data fetching:** API routes in `app/api/`, client services in `lib/services/`
- **State:** React Context for auth, component state for UI
- **Types:** Shared types in `lib/types/` and `types/`
- **Path aliases:** Use `@/*` for imports from project root
