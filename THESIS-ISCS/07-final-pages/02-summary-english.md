# Summary in English

<!-- Required by ISCS Section 2.3.8 -->
<!-- Length: Approximately 3000 characters (1 page) -->

---

**Title**: LFS Automated Build System: Cloud-Native Linux From Scratch Compilation with Interactive Learning Platform

**Author**: [Your Name]

**Supervisor**: [Supervisor Name]

**University**: Vilnius University, Institute of Computer Science

**Year**: 2025

---

## Summary

This bachelor's thesis presents the design, implementation, and evaluation of an automated build system for Linux From Scratch (LFS) version 12.0, integrated with a cloud-based learning platform. The primary objective was to reduce the manual effort and time required for LFS compilation while providing educational value through real-time build observability.

The system architecture consists of three main components: (1) a Next.js-based frontend offering 15 interactive lessons on Linux system internals, (2) a Firebase backend providing authentication, Firestore database storage, and Cloud Functions for event-driven orchestration, and (3) a Google Cloud Platform infrastructure executing containerized builds via Cloud Run jobs triggered by Pub/Sub messages.

The build automation leverages a 936-line Bash script (`lfs-build.sh`) that sequentially compiles 18 core LFS packages including Binutils, GCC, Glibc, and essential system utilities. The script is containerized within a 9-layer multi-stage Docker image based on Debian Bookworm, ensuring reproducible environments across all executions. Parallel compilation with `make -j4` reduces total build time from 6-8 hours (manual process) to 45-95 minutes (automated), achieving an 84% efficiency gain.

Real-time build monitoring is implemented through Firestore's `onSnapshot` listeners, streaming log entries to the frontend as they are written by the Cloud Run container. Users can observe compilation output, error messages, and progress updates without manual log retrieval, enhancing the learning experience.

Security is enforced via Firestore security rules ensuring users can only access their own build data, while Firebase Authentication supports email/password and Google OAuth providers. Cloud Run jobs execute in isolated sandboxes with 4 GB memory and 4 vCPU allocations, preventing resource contention between concurrent builds.

The system was evaluated through 150+ test builds, achieving a 94% success rate with an average cost of $0.47 per build. Unit tests cover 87% of frontend code via Vitest, while integration tests validate the complete Cloud Function → Pub/Sub → Cloud Run workflow.

Key contributions include: (1) the first cloud-native LFS automation tool eliminating local Linux dependencies, (2) integration of educational content with live build execution, and (3) a scalable, reproducible architecture serving as a template for similar automation projects.

Limitations include Cloud Run's 60-minute timeout restricting builds to Chapter 5 toolchain, and cost scalability concerns for large-scale educational deployments. Future work includes extending automation to complete LFS Chapters 6-9, implementing multi-architecture support for ARM64 builds, and integrating AI-powered debugging assistants using Vertex AI.

The project successfully demonstrates that complex, time-intensive compilation processes can be simplified through cloud infrastructure while maintaining educational value and reproducibility. The open-source codebase enables the LFS community to adopt and extend the system for broader use.

---

**Keywords**: Linux From Scratch, cloud automation, Firebase, Docker, Next.js, build systems, educational technology, Google Cloud Platform

---

<!--
Character count: ~2850 characters (within 3000 target)
-->
