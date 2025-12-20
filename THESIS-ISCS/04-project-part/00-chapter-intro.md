# 2. PROJECT PART

<!-- Chapter Introduction - must appear before first section -->
<!-- Word count target: 150-200 words -->

---

This chapter presents the comprehensive design of the LFS Automated Build System, covering logical structure, information equipment, software architecture, and technical infrastructure. The design phase translates the requirements identified in the Analytical Part into a concrete system specification ready for implementation.

The chapter is organized into six main sections. Section 2.1 formally states the project objective and design constraints. Section 2.2 describes the logic structure through UML diagrams including use case analysis, data flow diagrams, entity-relationship modeling, and behavioral specifications. Section 2.3 addresses information equipment design, specifying input/output data structures and the database schema. Section 2.4 presents the software project including system architecture, Docker environment configuration, and user/programmer documentation. Section 2.5 justifies technical equipment selections with quantitative analysis. Section 2.6 evaluates the designed system against existing solutions and alternatives.

The design follows industry-standard software engineering methodologies including Unified Modeling Language (UML) for behavioral modeling, Entity-Relationship modeling for database design, and multi-tier architectural patterns for scalability and maintainability. Each design decision is justified with reference to the requirements established in Chapter 1.

---

## Content Outline for Project Part Sections:

### 2.1 Project Objective (1-2 pages)
- Formal objective statement: deliver a reproducible, local-first LFS 12.0 toolchain builder using WSL2 + chroot, driven by PowerShell entrypoints and bash automation
- Design constraints: Windows host + WSL2, /mnt/lfs mount ownership, privileged chroot entry, long-running compilation time, limited RAM on developer laptops
- Scope boundaries: Chapter 5 toolchain + minimal bootable image; cloud deployment is optional/secondary

### 2.2 Logic Structure (8-10 pages)
See individual files in `02-logic-structure/` subdirectory

### 2.3 Information Equipment (4-5 pages)
See individual files in `03-information-equipment/` subdirectory

### 2.4 Software Project (6-8 pages)
See individual files in `04-software-project/` subdirectory

### 2.5 Technical Equipment (1-2 pages)
- Hardware requirements justification with measured local runs (8–16GB RAM recommended; build logs show 6–9GB peak during GCC/GLIBC)
- CPU requirement analysis (4 cores minimum; MAKEFLAGS -j$(nproc) used by default in scripts)
- Storage requirement analysis (sources ~4GB, build/work dir ~10–12GB, logs/artifacts ~2GB; recommend 25GB free on host)
- Optional cloud sizing notes removed; local workstation is the primary target

### 2.6 System Assessment and Comparison (2-3 pages)
- Qualitative comparison (PowerShell/WSL flow vs ALFS/jhalfs; reduced setup vs raw manual book)
- Quantitative comparison (observed build time from `lfs-output/build-metadata-*.txt`, setup steps count, recovery steps after failure)
- Design strengths (local reproducibility, scripted mount/chroot, log capture)
- Design weaknesses (long wall-clock time, WSL dependency, manual cloud offload deferred)

### 2.X Chapter Summary (200 words)
- Synthesize design decisions
- Transition to implementation chapter

---

<!-- 
CONTENT EXTRACTION NOTES:
- Extract use cases from user workflows
- Extract DFDs from `lfs-build.sh` script flow
- Extract ERD from Firestore collections in `firestore.rules`
- Extract sequence diagrams from `functions/index.js` Cloud Function flow
- Extract architecture from system overview documentation
- Extract Docker config from `Dockerfile` 9-stage build
-->
