# Installer UML Diagrams - Mermaid Code

## Use Case Diagram

### Mermaid Code

```mermaid
graph TB
    subgraph "LFS Builder Installer System"
        UC1[Check System Prerequisites]
        UC2[Install WSL2 Features]
        UC3[Download WSL Kernel]
        UC4[Install Linux Distribution]
        UC5[Configure LFS Environment]
        UC6[Create Desktop Shortcuts]
        UC7[View Installation Progress]
        UC8[View Installation Logs]
        UC9[Cancel Installation]
        UC10[Launch LFS Builder]
        UC11[Uninstall LFS Builder]
    end
    
    User((Windows User))
    Admin((System Administrator))
    WSL[Windows Subsystem<br/>for Linux]
    FS[File System]
    Registry[Windows Registry]
    
    %% User interactions
    User --> UC1
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    
    %% Admin interactions
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC11
    
    %% System interactions
    UC1 --> WSL
    UC2 --> WSL
    UC3 --> WSL
    UC4 --> WSL
    UC5 --> FS
    UC5 --> Registry
    UC6 --> FS
    UC11 --> FS
    UC11 --> Registry
    
    %% Relationships
    UC2 -.includes.-> UC1
    UC3 -.includes.-> UC2
    UC4 -.includes.-> UC3
    UC5 -.includes.-> UC4
    UC6 -.includes.-> UC5
    
    classDef actor fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef usecase fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef system fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    
    class User,Admin actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11 usecase
    class WSL,FS,Registry system
```

### Alternative Simplified Use Case (Better for Thesis)

```mermaid
%%{init: {'theme':'base'}}%%
graph LR
    subgraph System["LFS Builder Installer"]
        direction TB
        UC1((Check<br/>Prerequisites))
        UC2((Configure<br/>Installation))
        UC3((Install<br/>WSL2))
        UC4((Setup LFS<br/>Environment))
        UC5((Create<br/>Shortcuts))
        UC6((View<br/>Logs))
        UC7((Uninstall))
    end
    
    User[👤 User]
    Admin[👤 Administrator]
    
    User -.-> UC1
    User -.-> UC6
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC7
    
    UC3 --> UC1
    UC4 --> UC3
    UC5 --> UC4
    
    style User fill:#4fc3f7,stroke:#01579b,stroke-width:3px
    style Admin fill:#81c784,stroke:#2e7d32,stroke-width:3px
    style System fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style UC1 fill:#ffccbc,stroke:#d84315
    style UC2 fill:#ffccbc,stroke:#d84315
    style UC3 fill:#c5e1a5,stroke:#558b2f
    style UC4 fill:#c5e1a5,stroke:#558b2f
    style UC5 fill:#c5e1a5,stroke:#558b2f
    style UC6 fill:#b3e5fc,stroke:#0277bd
    style UC7 fill:#ef9a9a,stroke:#c62828
```

---

## Activity Diagram - Installation Process

### Mermaid Code

```mermaid
flowchart TD
    Start([User Launches Installer]) --> CheckAdmin{Running as<br/>Administrator?}
    
    CheckAdmin -->|No| ShowAdminError[Display Admin Rights Error]
    ShowAdminError --> End1([Exit])
    
    CheckAdmin -->|Yes| Welcome[Show Welcome Screen]
    Welcome --> StartChecks[Start Prerequisites Check]
    
    StartChecks --> CheckWin[Check Windows Version]
    CheckWin --> CheckRAM[Check RAM >= 8GB]
    CheckRAM --> CheckDisk[Check Disk Space >= 30GB]
    CheckDisk --> CheckCPU[Check CPU Cores]
    CheckCPU --> CheckVirt[Check Virtualization]
    CheckVirt --> CheckWSL[Check WSL2 Status]
    
    CheckWSL --> AllChecks{All Critical<br/>Checks Pass?}
    
    AllChecks -->|No| ShowError[Display Failed Requirements]
    ShowError --> CanContinue{User Chooses<br/>to Exit?}
    CanContinue -->|Yes| End2([Exit])
    CanContinue -->|No| StartChecks
    
    AllChecks -->|Yes| ShowConfig[Show Configuration Form]
    ShowConfig --> UserConfig[User Selects:<br/>- Install Path<br/>- Linux Distro<br/>- CPU Cores<br/>- Shortcuts]
    
    UserConfig --> ValidateConfig{Configuration<br/>Valid?}
    ValidateConfig -->|No| ShowConfig
    ValidateConfig -->|Yes| StartInstall[Start Installation Progress]
    
    StartInstall --> Stage1[Stage 1: Enable WSL Features]
    Stage1 --> DISM1[Run DISM: WSL Feature]
    DISM1 --> DISM2[Run DISM: Virtual Machine Platform]
    DISM2 --> Progress20[Update Progress: 20%]
    
    Progress20 --> Stage2[Stage 2: Install WSL Kernel]
    Stage2 --> DownloadKernel[Download WSL Update MSI]
    DownloadKernel --> InstallKernel[Install Kernel Update]
    InstallKernel --> Progress35[Update Progress: 35%]
    
    Progress35 --> Stage3[Stage 3: Install Linux Distro]
    Stage3 --> WSLInstall[Run: wsl --install -d Ubuntu]
    WSLInstall --> Progress75[Update Progress: 75%]
    
    Progress75 --> Stage4[Stage 4: Configure Environment]
    Stage4 --> CreateDirs[Create /mnt/lfs directories]
    CreateDirs --> SetEnvVars[Set LFS environment variables]
    SetEnvVars --> CreateProfile[Create PowerShell profile]
    CreateProfile --> Progress90[Update Progress: 90%]
    
    Progress90 --> Stage5[Stage 5: Create Shortcuts]
    Stage5 --> DesktopShortcut[Create Desktop Shortcut]
    DesktopShortcut --> StartMenu[Create Start Menu Shortcuts]
    StartMenu --> WindowsTerminal[Configure Windows Terminal]
    WindowsTerminal --> Progress100[Update Progress: 100%]
    
    Progress100 --> CheckError{Installation<br/>Successful?}
    
    CheckError -->|No| ShowInstallError[Display Error Dialog<br/>with Log Location]
    ShowInstallError --> OfferRetry{User Wants<br/>to Retry?}
    OfferRetry -->|Yes| StartInstall
    OfferRetry -->|No| End3([Exit with Error])
    
    CheckError -->|Yes| ShowCompletion[Show Completion Screen]
    ShowCompletion --> LaunchOption{User Selects<br/>Launch Now?}
    
    LaunchOption -->|Yes| LaunchApp[Start LFS Builder Application]
    LaunchApp --> End4([Exit Installer])
    
    LaunchOption -->|No| End5([Exit Installer])
    
    style Start fill:#81c784,stroke:#2e7d32,stroke-width:3px
    style End1 fill:#ef9a9a,stroke:#c62828,stroke-width:3px
    style End2 fill:#ef9a9a,stroke:#c62828,stroke-width:3px
    style End3 fill:#ef9a9a,stroke:#c62828,stroke-width:3px
    style End4 fill:#81c784,stroke:#2e7d32,stroke-width:3px
    style End5 fill:#81c784,stroke:#2e7d32,stroke-width:3px
    
    style CheckAdmin fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style AllChecks fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style ValidateConfig fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style CheckError fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style CanContinue fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style OfferRetry fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style LaunchOption fill:#fff59d,stroke:#f57f17,stroke-width:2px
    
    style Stage1 fill:#b3e5fc,stroke:#0277bd,stroke-width:2px
    style Stage2 fill:#b3e5fc,stroke:#0277bd,stroke-width:2px
    style Stage3 fill:#b3e5fc,stroke:#0277bd,stroke-width:2px
    style Stage4 fill:#b3e5fc,stroke:#0277bd,stroke-width:2px
    style Stage5 fill:#b3e5fc,stroke:#0277bd,stroke-width:2px
```

---

## Sequence Diagram - User Installation Flow

### Mermaid Code

```mermaid
sequenceDiagram
    actor User as Windows User
    participant WF as WelcomeForm
    participant PF as PrerequisitesForm
    participant PC as PrerequisitesChecker
    participant CF as ConfigurationForm
    participant PrF as ProgressForm
    participant IM as InstallationManager
    participant WSL as WSL System
    participant FS as File System
    participant CoF as CompletionForm
    
    User->>WF: Launch Installer
    WF->>WF: Check Admin Rights
    alt Not Administrator
        WF->>User: Show Error & Exit
    else Is Administrator
        WF->>User: Show Welcome
        User->>WF: Click Next
        WF->>PF: Navigate to Prerequisites
        
        PF->>PC: RunAllChecks()
        PC->>PC: Check Windows Version
        PC->>PC: Check RAM
        PC->>PC: Check Disk Space
        PC->>PC: Check Virtualization
        PC-->>PF: Return CheckResults
        
        alt Critical Check Failed
            PF->>User: Show Failed Requirements
            User->>PF: Exit or Retry
        else All Checks Pass
            PF->>User: Show "All Requirements Met"
            User->>PF: Click Next
            PF->>CF: Navigate to Configuration
            
            CF->>User: Show Configuration Form
            User->>CF: Enter Preferences
            User->>CF: Click Next
            CF->>CF: ValidateConfiguration()
            CF->>PrF: Navigate with Config
            
            PrF->>IM: StartInstallation(config)
            
            loop Installation Stages
                IM->>WSL: Enable WSL Features
                WSL-->>IM: Success
                IM->>PrF: ProgressChanged(20%)
                
                IM->>WSL: Install WSL Kernel
                WSL-->>IM: Success
                IM->>PrF: ProgressChanged(35%)
                
                IM->>WSL: Install Ubuntu
                WSL-->>IM: Success
                IM->>PrF: ProgressChanged(75%)
                
                IM->>FS: Configure Environment
                FS-->>IM: Success
                IM->>PrF: ProgressChanged(90%)
                
                IM->>FS: Create Shortcuts
                FS-->>IM: Success
                IM->>PrF: ProgressChanged(100%)
            end
            
            IM->>PrF: InstallationComplete
            PrF->>CoF: Navigate to Completion
            
            CoF->>User: Show Success Message
            User->>CoF: Choose Launch/Exit
            
            alt Launch Now
                CoF->>User: Start LFS Builder
            end
            
            CoF->>User: Close Installer
        end
    end
```

---

## Component Diagram

### Mermaid Code

```mermaid
graph TB
    subgraph "Presentation Layer"
        WF[WelcomeForm]
        PF[PrerequisitesForm]
        CF[ConfigurationForm]
        PrF[ProgressForm]
        CoF[CompletionForm]
    end
    
    subgraph "Business Logic Layer"
        IM[InstallationManager]
        PC[PrerequisitesChecker]
        IL[InstallerLogger]
        IC[InstallationConfig]
    end
    
    subgraph "System Integration Layer"
        WMI[WMI Queries<br/>System.Management]
        PROC[Process Execution<br/>System.Diagnostics]
        FS[File System<br/>System.IO]
        REG[Registry<br/>Microsoft.Win32]
    end
    
    subgraph "External Systems"
        WSL[Windows Subsystem<br/>for Linux]
        DISM[DISM.exe]
        MS[Microsoft Store<br/>Ubuntu Download]
    end
    
    %% Presentation to Business Logic
    PF --> PC
    PrF --> IM
    PrF --> IL
    CF --> IC
    
    %% Business Logic to System Integration
    PC --> WMI
    IM --> PROC
    IM --> FS
    IM --> REG
    IL --> FS
    
    %% System Integration to External
    PROC --> WSL
    PROC --> DISM
    PROC --> MS
    
    %% Event flows
    IM -.Event: ProgressChanged.-> PrF
    IM -.Event: LogMessage.-> IL
    IL -.Event: LogMessageReceived.-> PrF
    
    style WF fill:#e3f2fd,stroke:#1976d2
    style PF fill:#e3f2fd,stroke:#1976d2
    style CF fill:#e3f2fd,stroke:#1976d2
    style PrF fill:#e3f2fd,stroke:#1976d2
    style CoF fill:#e3f2fd,stroke:#1976d2
    
    style IM fill:#fff9c4,stroke:#f57f17
    style PC fill:#fff9c4,stroke:#f57f17
    style IL fill:#fff9c4,stroke:#f57f17
    style IC fill:#fff9c4,stroke:#f57f17
    
    style WMI fill:#f3e5f5,stroke:#7b1fa2
    style PROC fill:#f3e5f5,stroke:#7b1fa2
    style FS fill:#f3e5f5,stroke:#7b1fa2
    style REG fill:#f3e5f5,stroke:#7b1fa2
    
    style WSL fill:#ffccbc,stroke:#d84315
    style DISM fill:#ffccbc,stroke:#d84315
    style MS fill:#ffccbc,stroke:#d84315
```

---

## Class Diagram (Enhanced)

### Mermaid Code

```mermaid
classDiagram
    class Program {
        +Main(string[] args)$ void
        -IsRunningAsAdministrator()$ bool
    }
    
    class WelcomeForm {
        -lblTitle: Label
        -lblWelcome: Label
        -btnNext: Button
        +WelcomeForm()
        -WelcomeForm_Load() void
        -btnNext_Click() void
    }
    
    class PrerequisitesForm {
        -lstChecks: ListView
        -btnNext: Button
        -_checker: PrerequisitesChecker
        +PrerequisitesForm()
        -RunChecks() async Task
        -UpdateUI() void
    }
    
    class ConfigurationForm {
        -txtInstallPath: TextBox
        -cmbDistro: ComboBox
        -numCores: NumericUpDown
        +ConfigurationForm()
        -ValidateConfig() bool
        +GetConfig() InstallationConfig
    }
    
    class ProgressForm {
        -progressBar: ProgressBar
        -txtLog: RichTextBox
        -_manager: InstallationManager
        +ProgressForm(InstallationConfig)
        -OnProgressChanged() void
        -OnLogMessage() void
    }
    
    class CompletionForm {
        -lblSuccess: Label
        -chkLaunch: CheckBox
        -_config: InstallationConfig
        +CompletionForm(InstallationConfig, bool)
        -btnFinish_Click() void
    }
    
    class InstallationManager {
        -_config: InstallationConfig
        -_logger: InstallerLogger
        +ProgressChanged: EventHandler~int~
        +StageChanged: EventHandler~string~
        +LogMessage: EventHandler~string~
        +InstallationComplete: EventHandler
        +InstallationFailed: EventHandler~Exception~
        +InstallationManager(InstallationConfig)
        +StartInstallation() async Task
        -EnableWSL2Features() async Task
        -InstallWSLKernel() async Task
        -InstallLinuxDistro() async Task
        -ConfigureLFSEnvironment() async Task
        -CreateShortcuts() async Task
        -RunCommand(string, string) async Task~int~
    }
    
    class PrerequisitesChecker {
        -_logger: InstallerLogger
        +RunAllChecks() List~CheckResult~
        -CheckWindowsVersion() CheckResult
        -CheckRAM() CheckResult
        -CheckDiskSpace() CheckResult
        -CheckCPUCores() CheckResult
        -CheckVirtualization() CheckResult
        -CheckWSL2Status() CheckResult
        -CheckAdministratorRights() CheckResult
        +CanProceed(List~CheckResult~) bool
    }
    
    class CheckResult {
        +Name: string
        +Passed: bool
        +Message: string
        +Severity: CheckSeverity
        +Details: string
    }
    
    class InstallerLogger {
        -_logFilePath: string
        -_logWriter: StreamWriter
        +LogMessageReceived: EventHandler~string~
        +Instance$: InstallerLogger
        +LogFilePath: string
        +Info(string) void
        +Warning(string) void
        +Error(string) void
        +Error(string, Exception) void
        +Stage(string) void
        +OpenLogFile() void
    }
    
    class InstallationConfig {
        +InstallPath: string
        +LinuxDistro: string
        +BuildCores: int
        +CreateDesktopShortcut: bool
        +CreateStartMenuShortcut: bool
        +WSLDistroName: string
        +LFSMountPoint: string
        +IsValid() bool
        +ToJson() string
        +FromJson(string)$ InstallationConfig
    }
    
    class CheckSeverity {
        <<enumeration>>
        Critical
        Warning
        Info
    }
    
    %% Relationships
    Program --> WelcomeForm : starts
    WelcomeForm --> PrerequisitesForm : navigates
    PrerequisitesForm --> ConfigurationForm : navigates
    ConfigurationForm --> ProgressForm : navigates
    ProgressForm --> CompletionForm : navigates
    
    PrerequisitesForm --> PrerequisitesChecker : uses
    PrerequisitesChecker --> CheckResult : returns
    CheckResult --> CheckSeverity : has
    
    ConfigurationForm --> InstallationConfig : creates
    ProgressForm --> InstallationManager : uses
    InstallationManager --> InstallationConfig : uses
    InstallationManager --> InstallerLogger : uses
    PrerequisitesChecker --> InstallerLogger : uses
    CompletionForm --> InstallationConfig : uses
```

---

## State Diagram - Installation States

### Mermaid Code

```mermaid
stateDiagram-v2
    [*] --> Welcome: Launch Installer
    
    Welcome --> Prerequisites: Click Next
    Welcome --> [*]: Cancel
    
    Prerequisites --> CheckingSystem: Start Checks
    CheckingSystem --> ChecksPassed: All Critical Pass
    CheckingSystem --> ChecksFailed: Critical Failure
    
    ChecksFailed --> Prerequisites: Retry
    ChecksFailed --> [*]: Exit
    
    ChecksPassed --> Configuration: Click Next
    Configuration --> Prerequisites: Back
    Configuration --> ValidatingConfig: Click Next
    
    ValidatingConfig --> Configuration: Invalid Input
    ValidatingConfig --> Installing: Valid Config
    
    Installing --> Stage1_WSLFeatures: Begin
    Stage1_WSLFeatures --> Stage2_WSLKernel: 20% Complete
    Stage2_WSLKernel --> Stage3_LinuxDistro: 35% Complete
    Stage3_LinuxDistro --> Stage4_Environment: 75% Complete
    Stage4_Environment --> Stage5_Shortcuts: 90% Complete
    Stage5_Shortcuts --> InstallSuccess: 100% Complete
    
    Stage1_WSLFeatures --> InstallError: Error
    Stage2_WSLKernel --> InstallError: Error
    Stage3_LinuxDistro --> InstallError: Error
    Stage4_Environment --> InstallError: Error
    Stage5_Shortcuts --> InstallError: Error
    
    InstallError --> Installing: Retry
    InstallError --> [*]: Exit
    
    InstallSuccess --> Completion: Show Success
    Completion --> LaunchingApp: Launch Checked
    Completion --> [*]: Finish
    LaunchingApp --> [*]: App Started
    
    note right of CheckingSystem
        Validating:
        - Windows version
        - RAM
        - Disk space
        - Virtualization
        - Admin rights
    end note
    
    note right of Installing
        Progress events fired
        to update UI in real-time
    end note
```

---

## How to Use These Diagrams

### 1. View in Mermaid Live Editor
Visit: https://mermaid.live/
- Paste any of the code blocks above
- Instant preview
- Export as PNG/SVG/PDF

### 2. Include in Markdown Files
Just paste the code blocks in any `.md` file with triple backticks:
````markdown
```mermaid
[diagram code here]
```
````

### 3. Include in Thesis
- Export as SVG for vector graphics (best quality)
- Add figure captions following ISCS format
- Reference as "Figure 5.X" in text

---

## Recommended Diagrams for Thesis

| Diagram Type | Use In Section | Priority |
|--------------|----------------|----------|
| Use Case (Simplified) | 02-analytical-part | ⭐⭐⭐ |
| Activity Diagram | 04-project-part | ⭐⭐⭐ |
| Class Diagram | 05-software-implementation | ⭐⭐⭐ |
| Sequence Diagram | 05-software-implementation | ⭐⭐ |
| Component Diagram | 04-project-part | ⭐⭐ |
| State Diagram | 04-project-part | ⭐ |
