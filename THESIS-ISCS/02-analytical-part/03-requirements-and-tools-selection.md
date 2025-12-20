# 1.3 Requirements and Tools Selection

<!-- Word count target: 1200-1500 words (5-6 pages) -->
<!-- Must reference Tables 2, 3, 4, 5 -->

---

## 1.3.1 Functional and Non-Functional Requirements

Based on the problem analysis and information flow examination, the following comprehensive requirements have been established:

### Functional Requirements

**FR1: User Authentication and Authorization**
- The system shall support user registration with email/password
- The system shall support OAuth authentication (Google, GitHub)
- The system shall maintain user session persistence
- The system shall enforce role-based access control (user, admin)

**FR2: Build Submission and Configuration**
- Users shall submit LFS build requests through web forms
- Users shall specify build configuration (target architecture, optional components)
- The system shall validate build configurations before acceptance
- The system shall queue build requests when resources are unavailable

**FR3: Automated Build Execution**
- The system shall execute LFS Chapter 5 builds without user intervention
- The system shall download source packages from official mirrors
- The system shall verify package checksums before compilation
- The system shall execute build steps in correct dependency order
- The system shall handle build failures gracefully with error reporting

**FR4: Real-Time Monitoring and Logging**
- The system shall provide build status updates (PENDING, RUNNING, COMPLETED, FAILED)
- The system shall stream compilation logs to authenticated users
- The system shall track build progress (current package, percentage complete)
- The system shall record resource utilization (CPU, memory, disk I/O)

**FR5: Artifact Storage and Retrieval**
- The system shall store successfully compiled artifacts in cloud storage
- The system shall generate downloadable TAR archives of build outputs
- The system shall maintain artifact metadata (build configuration, timestamp, file size)
- The system shall provide time-limited signed URLs for secure artifact downloads
- The system shall implement artifact retention policies (automatic cleanup after 30 days)

**FR6: Learning Platform Integration**
- The system shall provide structured LFS tutorials (minimum 8 modules)
- The system shall offer interactive terminal emulation for command practice
- The system shall track user progress through learning modules
- The system shall link tutorial content to corresponding build stages
- The system shall support code syntax highlighting for command examples

**FR7: Administrative Functions**
- Administrators shall view all user builds and system metrics
- Administrators shall manually trigger or cancel builds
- Administrators shall configure system parameters (resource limits, quotas)
- Administrators shall access aggregated analytics (build success rates, popular modules)

### Non-Functional Requirements

**NFR1: Performance**
- Build submission shall complete within 2 seconds
- Web interface shall load within 3 seconds on 4G connection
- Real-time log streaming shall exhibit < 500ms latency
- Chapter 5 build shall complete within 60 minutes on 4-core instance

**NFR2: Scalability**
- System shall support 100 concurrent users on frontend
- System shall support 10 simultaneous build executions
- Database shall handle 1000 build records with <100ms query time
- System shall scale horizontally for increased load

**NFR3: Reliability**
- System uptime shall be ≥99.5% (excluding scheduled maintenance)
- Build failures shall not corrupt database state
- System shall implement automatic retry for transient errors
- Data shall be backed up daily with 7-day retention

**NFR4: Security**
- All HTTP traffic shall use TLS 1.2 or higher
- User passwords shall be hashed with bcrypt (cost factor ≥10)
- API endpoints shall validate authentication tokens
- Build containers shall run with non-root privileges
- Firestore security rules shall enforce row-level access control

**NFR5: Usability**
- Web interface shall be responsive (mobile, tablet, desktop)
- Interface shall conform to WCAG 2.1 Level AA accessibility standards
- Error messages shall be user-friendly with actionable guidance
- Tutorial content shall be written at undergraduate reading level

**NFR6: Maintainability**
- Source code shall include inline documentation
- Code shall follow consistent style guide (ESLint, Prettier)
- System shall use semantic versioning (MAJOR.MINOR.PATCH)
- Infrastructure shall be defined as code (Dockerfile, firebase.json)

---

## 1.3.2 Technology Selection Criteria

The selection of technologies for this system was guided by the following criteria (see Table 2):

1. **Cloud-Native Compatibility**: Support for containerization and serverless execution
2. **Development Velocity**: Availability of comprehensive libraries and frameworks
3. **Documentation Quality**: Official documentation, tutorials, community resources
4. **Long-Term Support**: Active maintenance, predictable release cycles
5. **Cost Efficiency**: Free tier availability for development, reasonable production pricing
6. **Security Posture**: Regular security updates, vulnerability disclosure process
7. **Learning Curve**: Time to productivity for developers with web development background
8. **Ecosystem Maturity**: Third-party integrations, developer tools, IDE support

**Table 2. Technology Selection Criteria Matrix**

| Criterion | Weight | Frontend | Backend | Build Env | Database |
|-----------|--------|----------|---------|-----------|----------|
| Cloud-Native | 20% | High | Critical | Critical | Critical |
| Dev Velocity | 15% | High | High | Medium | High |
| Documentation | 15% | High | High | High | High |
| LTS | 10% | Medium | High | High | High |
| Cost | 15% | Medium | High | Medium | High |
| Security | 15% | High | Critical | Critical | Critical |
| Learning Curve | 5% | Medium | Medium | Low | Medium |
| Ecosystem | 5% | High | High | Medium | High |

*Ratings: Critical (essential), High (very important), Medium (important), Low (nice-to-have)*

---

## 1.3.3 Frontend Technology Stack Selection

### Framework Selection: Next.js vs Alternatives

**Alternatives Considered:**
- **Create React App (CRA)**: Traditional client-side rendering, limited SEO
- **Gatsby**: Static site generation, less suitable for dynamic real-time data
- **Vue.js + Nuxt**: Alternative ecosystem, smaller community than React
- **Angular**: Steeper learning curve, heavier bundle sizes

**Next.js Selected** for the following reasons:
- Hybrid rendering (SSR, SSG, CSR) enables SEO-friendly pages and dynamic dashboards
- React Server Components reduce JavaScript sent to client
- API routes provide backend-for-frontend without separate server
- Automatic code splitting optimizes performance
- Built-in TypeScript support
- Excellent Vercel/Netlify deployment integration
- Large community (1M+ weekly npm downloads)

**Table 3. Frontend Technology Stack Specification**

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 16.0.1 | React framework | SSR, routing, API routes, React 19 support |
| **React** | 19.2.0 | UI library | Component-based architecture, hooks, concurrent rendering |
| **TypeScript** | 5.x | Type safety | Compile-time error checking, better IDE support, code documentation |
| **Tailwind CSS** | 4.x | Styling | Utility-first CSS, responsive design, smaller bundle than Bootstrap |
| **Framer Motion** | 12.23.24 | Animations | Declarative animations, gesture support, 60fps performance |
| **Lucide React** | 0.553.0 | Icons | Modern icon set, tree-shakeable, consistent design |
| **React Markdown** | 10.1.0 | Content rendering | Markdown → React components, extensible with plugins |
| **Recharts** | 3.4.1 | Data visualization | React-based charts, responsive, customizable |
| **@react-three/fiber** | 9.4.2 | 3D graphics | Three.js React renderer for interactive visualizations |
| **xterm.js** | (via package) | Terminal emulator | Browser-based terminal for interactive shell |

**Bundle Size Consideration**: Tree-shaking and code splitting limit initial page load to ~150KB gzipped JavaScript, meeting performance requirements.

---

## 1.3.4 Backend Technology Stack Selection

### Cloud Platform Selection: GCP vs AWS vs Azure

**Google Cloud Platform (GCP) Selected** based on:
- **Firebase Integration**: Unified platform (Auth, Firestore, Functions, Hosting)
- **Cloud Run**: True serverless containers (vs ECS requiring cluster management)
- **Generous Free Tier**: 2M Cloud Function invocations/month, 180K vCPU-seconds Cloud Run
- **Development Experience**: Firebase Local Emulator Suite enables offline development
- **NoSQL Database**: Firestore offers real-time listeners critical for log streaming
- **Pricing Transparency**: Per-second billing for Cloud Run vs per-hour for AWS Fargate

**Alternative Analysis:**
- **AWS**: More mature (Lambda, ECS, DynamoDB) but complex IAM and fragmented services
- **Azure**: Strong enterprise features but less intuitive for indie developers
- **Heroku/Render**: Simpler but limited customization and higher cost at scale

**Table 4. Backend Technology Stack Specification**

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Firebase Auth** | 12.5.0 | Authentication | OAuth providers, email/password, JWT tokens, session management |
| **Cloud Firestore** | 12.5.0 | Database | NoSQL document store, real-time listeners, offline support, security rules |
| **Cloud Functions** | 4.4.1 | Serverless compute | Event-driven triggers (Firestore, Pub/Sub), auto-scaling, pay-per-use |
| **Cloud Run** | N/A (GCP service) | Container execution | Serverless containers, 60min timeout, 8GB RAM, custom Docker images |
| **Cloud Storage** | 7.0.0 SDK | Artifact storage | Object storage, signed URLs, lifecycle policies, CDN integration |
| **Cloud Pub/Sub** | 4.0.0 | Message queue | Decouples functions from build jobs, retry logic, at-least-once delivery |
| **Node.js** | 20.x | Runtime | LTS release, ES modules support, async/await, worker threads |
| **firebase-admin** | 12.7.0 | Server SDK | Firestore writes, user management, token verification |

**Architecture Pattern**: Event-driven microservices with Firestore as single source of truth.

---

## 1.3.5 Build Environment Technology Stack Selection

### Containerization Platform: Docker vs Alternatives

**Docker Selected** over:
- **Podman**: Less mature ecosystem, fewer pre-built images, rootless benefits not applicable for LFS builds requiring privileged operations
- **LXC/LXD**: System containers less portable than application containers
- **Virtual Machines**: Higher overhead (minutes startup vs seconds), larger image sizes

**Base Image Selection: Debian Bookworm**

**Alternatives Considered:**
- **Ubuntu**: Larger image size (250MB vs 120MB), slower package manager
- **Alpine**: Musl libc incompatible with glibc-based LFS builds
- **Fedora**: RPM-based, less similarity to LFS target system
- **Arch**: Rolling release introduces reproducibility concerns

**Debian Bookworm Advantages:**
- Official LFS host system recommendation (Debian/Ubuntu)
- Stable release cycle (predictable updates)
- Comprehensive package repository (build-essential, development tools)
- APT package manager familiar to users
- Smaller base image than Ubuntu

**Table 5. Build Environment Technology Stack**

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Debian Bookworm** | 12.x | Base image | LFS-recommended distro, stable, comprehensive repos |
| **GCC** | 13.2.0 | C/C++ compiler | Required for LFS toolchain builds, supports C11/C++17 |
| **GNU Make** | 4.3 | Build automation | Executes Makefiles for LFS packages |
| **GNU Binutils** | 2.41 | Binary tools | Assembler, linker, objdump for compilation |
| **Bash** | 5.2 | Shell | LFS build scripts written in bash |
| **wget/curl** | Latest | Download | Fetch source packages from mirrors |
| **Python** | 3.11 | Scripting | Helper scripts for Firestore logging |
| **Google Cloud SDK** | Latest | Integration | Upload artifacts to GCS, authenticate with GCP |

**Multi-Stage Build**: Dockerfile uses 9 stages to optimize layer caching and reduce final image size from 2.1GB to 850MB.

---

## 1.3.6 Database Technology Selection

### Firestore vs Alternatives

**Cloud Firestore Selected** over:
- **PostgreSQL (Cloud SQL)**: Requires connection pooling, no native real-time listeners, higher latency for read-heavy workloads
- **MongoDB Atlas**: Third-party service, additional vendor relationship, less Firebase integration
- **DynamoDB**: AWS ecosystem, more complex pricing, no built-in real-time subscriptions
- **Redis**: In-memory only, not suitable for persistent build metadata

**Firestore Advantages for This Use Case:**
- **Real-Time Listeners**: WebSocket-based subscriptions enable live log streaming without polling
- **Offline Support**: PWA capability for unreliable networks
- **Security Rules**: Declarative access control at document/collection level
- **Auto-Scaling**: No capacity planning, automatic sharding
- **Free Tier**: 50K reads, 20K writes, 20K deletes per day
- **Document Model**: Natural fit for build metadata (nested objects, arrays)

**Schema Design**: 6 collections (builds, buildLogs, users, enrollments, lessonProgress, analytics) with denormalization for read optimization.

---

## 1.3.7 Development and Testing Tools

**Version Control**: Git + GitHub (issue tracking, CI/CD via GitHub Actions)  
**Code Editor**: Visual Studio Code (TypeScript IntelliSense, Docker integration)  
**Testing Framework**: Vitest 2.0.0 (faster than Jest, native ESM support)  
**Linting**: ESLint 9.x (code quality), Prettier (formatting)  
**API Testing**: Postman (manual), Playwright (automated browser tests)  
**Monitoring**: Google Cloud Monitoring (logs, metrics, traces)

---

<!-- 
SECTION SUMMARY:
This section established comprehensive functional and non-functional requirements, defined technology selection criteria, and justified the chosen stack across frontend (Next.js, React, TypeScript), backend (Firebase, Cloud Run, Firestore), and build environment (Docker, Debian, GCC) layers. Comparative analysis of alternatives demonstrates that the selected technologies optimally satisfy cloud-native, performance, cost, and developer experience requirements.
-->
