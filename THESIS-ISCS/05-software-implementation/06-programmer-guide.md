# 06. Programmer Guide

This section provides guidance for developers extending or maintaining the LFS Automated Build system. The codebase is modular, with clear separation of concerns (Hunt & Thomas, 1999).

## Code Structure

- **Cloud Functions**: Located in `functions/index.js`. Each function is documented with JSDoc comments and follows Firebase best practices (Firebase, 2024).
- **Helpers**: Utility scripts in `helpers/` (firestore-logger.js, gcs-uploader.js) encapsulate logging and artifact upload logic.
- **Frontend**: React components in `lfs-learning-platform/components/` and pages in `app/` follow Next.js conventions (Vercel Inc., 2024).
- **Build Scripts**: Bash scripts in the root directory (`lfs-build.sh`, `build-bootable-kernel.sh`) orchestrate package compilation and error handling (Beekmans & Burgess, 2023).

## Extension Points

- Add new build options by updating the schema in `build.config` and frontend validation logic.
- Extend logging by modifying `firestore-logger.js` to include additional metadata.
- Integrate new cloud services by adding triggers in `functions/index.js`.

## Debugging

- Use Firebase Emulator Suite for local testing (Firebase, 2024).
- Monitor logs in Firestore and Cloud Monitoring dashboards (Google Cloud, 2024).
- Common errors are documented in Table 13 and surfaced in the UI.

## Figure Reference

Figure 28: Codebase module dependency diagram; see diagrams/figure-28.png.

*Citation: Hunt, A., & Thomas, D. (1999). The pragmatic programmer: From journeyman to master. Addison-Wesley Professional.*