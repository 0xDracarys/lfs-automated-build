# Tech Stack

## Frontend (lfs-learning-platform/)

- **Framework:** Next.js 16 with App Router
- **React:** 19.2.0
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4, tw-animate-css
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Markdown:** react-markdown with remark-gfm, rehype-highlight, rehype-slug
- **Charts:** Recharts

## Backend Services

- **Auth & Database:** Firebase (Auth, Firestore, Analytics)
- **AI:** Google Cloud Vertex AI
- **Functions:** Firebase Functions (Node.js 18)

## Deployment

- **Frontend:** Netlify with @netlify/plugin-nextjs
- **Backend:** Google Cloud Run (for LFS builds)
- **Functions:** Firebase Functions

## Common Commands

### Frontend Development
```bash
cd lfs-learning-platform
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

### Deployment
```bash
cd lfs-learning-platform
netlify deploy --prod    # Deploy to Netlify
```

### Firebase
```bash
npm run serve            # Start Firebase emulators
npm run deploy           # Deploy all Firebase services
npm run deploy:functions # Deploy functions only
npm run deploy:hosting   # Deploy hosting only
```

## Environment Variables

Frontend requires these in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Key Configuration Files

- `lfs-learning-platform/netlify.toml` - Netlify build config
- `lfs-learning-platform/tsconfig.json` - TypeScript config (strict, ES2017 target)
- `firebase.json` - Firebase project config
- `firestore.rules` - Firestore security rules
