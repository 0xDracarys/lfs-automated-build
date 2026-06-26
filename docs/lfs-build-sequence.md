# LFS Build Sequence: "The Life of a Build"

This sequence diagram visualizes the asynchronous communication flow between the Frontend, the Next.js API, the Background Runner, and the File System throughout the build lifecycle.

```mermaid
sequenceDiagram
    autonumber
    
    actor User as 👤 User
    participant UI as 🖥️ Build Dashboard
    participant API as 🌐 Next.js API (/trigger)
    participant Runner as 🏃 LfsRunner (Lib)
    participant Script as 📜 Shell Script
    participant FS as 💾 File System
    participant Poller as 📡 Status API (/status)

    %% Phase 1: Initiation
    User->>UI: Clicks "Start Build"
    UI->>API: POST /api/lfs/trigger
    
    activate API
    API->>Runner: new LfsRunner(config)
    Runner-->>API: Instance Created
    
    %% Async Handoff
    par Fire and Forget
        API->>Runner: startBuild() (Async)
        activate Runner
    and Return Response
        API-->>UI: 200 OK { status: "initializing" }
        deactivate API
    end

    %% Phase 2: Execution & Persistence
    Runner->>FS: Write State (PENDING)
    Runner->>Script: spawn("init-lfs-env.sh")
    activate Script
    
    loop Output Streaming
        Script-->>Runner: stdout / stderr
        Runner->>FS: Append to lfs-build.log
        Runner->>FS: Update lfs-build-state.json (RUNNING)
    end
    
    %% Phase 3: Monitoring Loop (Client Side)
    loop Every 2 Seconds
        UI->>Poller: GET /api/lfs/status
        activate Poller
        Poller->>FS: Read lfs-build-state.json
        FS-->>Poller: { status: "RUNNING", ... }
        Poller-->>UI: JSON Response
        deactivate Poller
        UI->>UI: Update "Live Build Feed"
    end

    %% Phase 4: Completion
    Script-->>Runner: Exit Code (0)
    deactivate Script
    
    Runner->>FS: Update State (COMPLETED)
    deactivate Runner
    
    UI->>Poller: GET /api/lfs/status
    activate Poller
    Poller->>FS: Read lfs-build-state.json
    FS-->>Poller: { status: "COMPLETED" }
    Poller-->>UI: JSON Response
    deactivate Poller
    
    UI-->>User: Show "Build Success" Notification
```

## Flow Description

1.  **Initiation**: The user triggers the action. The API creates the `LfsRunner` but responds immediately to the UI to prevent hanging the browser request. This is the **Fire-and-Forget** pattern.
2.  **Execution**: The `LfsRunner` acts as a background worker. It spawns the shell script (e.g., `init-lfs-env.sh`) and listens to its output streams in real-time.
3.  **Persistence**: Because Next.js serverless functions are stateless, we use the File System (`lfs-build-state.json`) as a shared "database" to store the current status.
4.  **Monitoring**: The Frontend polls the Status API, which simply reads the shared file to report progress back to the user.
