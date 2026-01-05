# Manual LFS Build Monitoring Guide

This guide explains how to manually track your Linux From Scratch builds if the web interface is unavailable or if you need deeper debugging.

## 1. Quick Status Check (Firebase Console)

The most direct way to see the raw status of your build.

-   **URL**: [Firebase Firestore Data](https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/~2Fbuilds)
-   **Steps**:
    1.  Go to the **Firestore Database** tab.
    2.  Select the `builds` collection.
    3.  Click on the most recent document (Build ID).
    4.  Check the `status` field (e.g., `RUNNING`, `SUCCESS`, `FAILED`).
    5.  Check `currentStep` for the specific action currently being performed.

## 2. Builder Infrastructure (Cloud Run Jobs)

Check if the builder container is actually running.

-   **URL**: [Cloud Run Jobs](https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder-job/executions?project=alfs-bd1e0)
-   **Steps**:
    1.  Look for the most recent **Execution**.
    2.  **Green Checkmark**: Job completed successfully.
    3.  **Red Exclamation**: Job failed (click to see why).
    4.  **Spinning Icon**: Job is currently building your LFS system.
    5.  Click on the execution name to view the **Logs** tab for real-time terminal output.

## 3. Pipeline Logs (Cloud Functions)

If the build doesn't even start, check the "glue" code.

-   **URL**: [Cloud Functions Logs](https://console.cloud.google.com/logs/query?project=alfs-bd1e0)
-   **Query**:
    ```text
    resource.type="cloud_function"
    resource.labels.function_name="executeLfsBuild"
    ```
-   **What to look for**:
    -   "Execution started": Function triggered successfully.
    -   "Error": Permissions or configuration issues preventing the build from launching.

## 4. Email Notifications (Extension Logs)

If you aren't receiving emails.

-   **URL**: [Extension Logs](https://console.firebase.google.com/project/alfs-bd1e0/extensions/instances/firestore-send-email?tab=logs)
-   **Common Errors**:
    -   `quota exceeded`: You sent too many emails.
    -   `invalid login`: Your SMTP password/app password is incorrect.
    -   `MISSING_DESTINATION`: The `to` field was empty (check your Firestore `mail` document).
