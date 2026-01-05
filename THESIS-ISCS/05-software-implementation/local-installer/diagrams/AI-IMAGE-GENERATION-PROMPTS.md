# AI Image Generation Prompts for LFS Installer Diagrams

## For Google Gemini / Imagen 3

### Prompt 1: Use Case Diagram

```
Create a professional UML use case diagram for a Windows installer application with the following specifications:

Style: Clean, modern UML diagram with pastel colors
Layout: Centered system boundary box with actors on left and right sides

Actors:
- Left side: "Windows User" stick figure icon
- Left side: "System Administrator" stick figure icon with admin badge
- Right side: "WSL System" component box
- Right side: "File System" component box

System Boundary: Large rounded rectangle labeled "LFS Builder Installer System"

Use Cases (oval shapes inside system boundary):
1. "Check System Prerequisites" (orange/amber color)
2. "Configure Installation" (orange/amber color)
3. "Install WSL2" (green/lime color)
4. "Setup LFS Environment" (green/lime color)
5. "Create Shortcuts" (green/lime color)
6. "View Logs" (blue/cyan color)
7. "Uninstall" (red/pink color)

Connections:
- User connects to "Check Prerequisites" and "View Logs" with dashed lines
- Administrator connects to all use cases with solid lines
- "Install WSL2" includes "Check Prerequisites" (dashed arrow with <<include>>)
- "Setup LFS Environment" includes "Install WSL2" (dashed arrow with <<include>>)
- "Create Shortcuts" includes "Setup LFS Environment" (dashed arrow with <<include>>)

Style details:
- Soft shadows on all shapes
- Rounded corners
- Professional business diagram aesthetic
- White background
- Clear, readable Segoe UI or similar sans-serif font
- High contrast for readability
```

---

### Prompt 2: Activity Diagram - Installation Flow

```
Create a professional UML activity diagram showing the installation process flow:

Style: Modern flowchart with color-coded nodes
Layout: Top-to-bottom vertical flow

Start: Green rounded rectangle "User Launches Installer"

Decision diamonds (yellow/amber):
1. "Running as Administrator?" - branches to error if No
2. "All Critical Checks Pass?" - loops back if No
3. "Configuration Valid?" - loops back if No
4. "Installation Successful?" - shows error if No
5. "User Selects Launch Now?" - branches at end

Process boxes (light blue):
- "Show Welcome Screen"
- "Start Prerequisites Check"
- "Show Configuration Form"
- Multiple stage boxes: "Stage 1: Enable WSL Features", "Stage 2: Install WSL Kernel", etc.

Progress boxes (cyan, smaller):
- "Update Progress: 20%"
- "Update Progress: 35%"
- "Update Progress: 75%"
- "Update Progress: 90%"
- "Update Progress: 100%"

Error states (light red):
- "Display Admin Rights Error"
- "Display Failed Requirements"
- "Display Error Dialog"

End states: Green rounded rectangles:
- "Exit" (multiple endpoints)
- "Exit Installer"
- "Start LFS Builder Application"

Swimlanes (optional): 3 columns
- User Interaction
- System Processes
- External Systems (WSL, File System)

Arrows:
- Solid black arrows for normal flow
- Dashed arrows for error/exception paths
- Thick arrows for main success path

Add annotations on right side:
- "Admin check required"
- "7 system validations"
- "6-8 minute process"
- "Event-driven progress"

Color scheme: Soft pastels with good contrast
Font: Clean sans-serif (Segoe UI, Roboto)
Background: White or very light gray gradient
```

---

### Prompt 3: Sequence Diagram - User Installation

```
Create a professional UML sequence diagram showing user-installer interaction:

Style: Clean vertical timeline diagram with lifelines

Participants (left to right):
1. Actor icon: "Windows User" (person stick figure)
2. Box: "WelcomeForm" (light blue)
3. Box: "PrerequisitesForm" (light blue)
4. Box: "PrerequisitesChecker" (yellow/amber)
5. Box: "ConfigurationForm" (light blue)
6. Box: "ProgressForm" (light blue)
7. Box: "InstallationManager" (yellow/amber)
8. Box: "WSL System" (gray)
9. Box: "CompletionForm" (light green)

Timeline: Vertical dashed lines below each participant

Messages (horizontal arrows with labels):
- Solid arrows for calls: "Launch Installer", "Click Next", "RunAllChecks()"
- Dashed arrows for returns: "Return CheckResults", "Success"
- Self-arrows (loops back to same box): "Check Admin Rights", "ValidateConfiguration()"

Alternative flows (boxes with dashed borders):
- "alt [Not Administrator]" - shows error path
- "alt [Critical Check Failed]" - shows retry/exit path
- "alt [Launch Now]" - shows app launch path

Loop box:
- "loop [Installation Stages]" containing multiple WSL operations

Activation bars:
- Thin vertical rectangles on lifelines showing when object is active
- Stacked for nested calls

Notes (yellow sticky note style):
- "Requires admin privileges"
- "7 prerequisite checks"
- "Progress events fired every stage"

Color scheme: Soft professional colors
- Forms: Light blue #E3F2FD
- Core logic: Amber #FFF9C4
- External systems: Gray #ECEFF1
- Success states: Light green #C8E6C9

Font: Sans-serif, readable size
Spacing: Clear separation between messages
Background: White
```

---

### Prompt 4: Class Diagram - Core Architecture

```
Create a professional UML class diagram showing the installer architecture:

Style: Standard UML class diagram with 3-compartment boxes

Classes arranged in 3 tiers (top to bottom):

Tier 1 - Presentation (Light Blue boxes):
- WelcomeForm
- PrerequisitesForm
- ConfigurationForm
- ProgressForm
- CompletionForm

Each form class box shows:
- Class name in top compartment (bold)
- Key properties in middle: -lblTitle: Label, -btnNext: Button
- Key methods in bottom: +WelcomeForm(), -btnNext_Click(): void

Tier 2 - Business Logic (Yellow/Amber boxes):
- InstallationManager (largest box)
  Properties: -_config: InstallationConfig, -_logger: InstallerLogger
  Events: +ProgressChanged, +StageChanged, +LogMessage, +InstallationComplete
  Methods: +StartInstallation(), -EnableWSL2Features(), -InstallWSLKernel()
  
- PrerequisitesChecker
  Methods: +RunAllChecks(), -CheckWindowsVersion(), -CheckRAM(), +CanProceed()
  
- InstallerLogger (singleton diamond marker)
  Properties: +Instance: InstallerLogger, +LogFilePath: string
  Methods: +Info(), +Warning(), +Error(), +Stage()
  
- InstallationConfig
  Properties: +InstallPath: string, +LinuxDistro: string, +BuildCores: int
  Methods: +IsValid(): bool, +ToJson(): string, +FromJson(): InstallationConfig

Tier 3 - Supporting Classes (Light Gray):
- CheckResult (data class)
  Properties: +Name: string, +Passed: bool, +Severity: CheckSeverity
  
- CheckSeverity (enumeration box with <<enumeration>> stereotype)
  Values: Critical, Warning, Info

Relationships (arrows):
- Solid lines with filled triangles: Inheritance
- Solid lines with open triangles: Implementation
- Solid lines with arrows: Association
- Dashed lines with arrows: Dependency
- Lines with diamonds: Aggregation/Composition

Key relationships:
- ProgressForm --> InstallationManager (uses)
- InstallationManager --> InstallationConfig (uses)
- InstallationManager --> InstallerLogger (uses)
- PrerequisitesForm --> PrerequisitesChecker (uses)
- PrerequisitesChecker --> CheckResult (returns)

Multiplicity markers where relevant:
- InstallationManager "1" -- "*" CheckResult

Visibility markers:
+ public
- private
# protected

Font: Clean sans-serif
Line style: Crisp, clean lines
Background: White
Add subtle shadows for depth
```

---

### Prompt 5: Component Diagram - System Architecture

```
Create a professional UML component diagram showing layered architecture:

Style: 3D-looking boxes arranged in horizontal layers

Layout: 4 layers from top to bottom

Layer 1 - Presentation Layer (top, light blue):
Box: "Presentation Layer"
Contains 5 component boxes with icons:
- WelcomeForm (window icon)
- PrerequisitesForm (checklist icon)
- ConfigurationForm (settings icon)
- ProgressForm (progress bar icon)
- CompletionForm (checkmark icon)

Layer 2 - Business Logic Layer (yellow/amber):
Box: "Business Logic Layer"
Contains 4 component boxes with icons:
- InstallationManager (gear icon)
- PrerequisitesChecker (shield icon)
- InstallerLogger (document icon)
- InstallationConfig (file icon)

Layer 3 - System Integration Layer (purple):
Box: "System Integration Layer"
Contains 4 component boxes:
- WMI Queries (System.Management)
- Process Execution (System.Diagnostics)
- File System (System.IO)
- Registry (Microsoft.Win32)

Layer 4 - External Systems (gray):
Box: "External Systems"
Contains 3 component boxes with external markers:
- Windows Subsystem for Linux (WSL)
- DISM.exe
- Microsoft Store (Ubuntu Download)

Connections (dependency arrows):
- Solid arrows showing component dependencies between layers
- Dashed arrows for events: "Event: ProgressChanged", "Event: LogMessage"
- Assembly connectors (lollipop and socket notation) for interfaces

Color scheme:
- Presentation: #E3F2FD (light blue)
- Business Logic: #FFF9C4 (light yellow)
- System Integration: #F3E5F5 (light purple)
- External Systems: #ECEFF1 (light gray)

Add labels on arrows:
- "uses"
- "calls"
- "subscribes to"
- "fires event"

Style details:
- 3D perspective with subtle shadows
- Rounded corners on component boxes
- Professional business diagram look
- Clear hierarchy from top to bottom
- Component icons for visual interest
```

---

### Prompt 6: State Diagram - Installation States

```
Create a professional UML state diagram showing installation state transitions:

Style: Modern state machine diagram with rounded rectangles

States (rounded rectangles with state names):

1. Initial pseudo-state (filled black circle): [*]

2. Main states (light blue):
- Welcome
- Prerequisites
- Configuration
- Installing

3. Sub-states within "Installing" (nested, different shade):
- CheckingSystem
- Stage1_WSLFeatures
- Stage2_WSLKernel  
- Stage3_LinuxDistro
- Stage4_Environment
- Stage5_Shortcuts

4. Success states (light green):
- ChecksPassed
- InstallSuccess
- Completion

5. Error states (light red):
- ChecksFailed
- InstallError

6. Final pseudo-states (filled black circle with ring): [*]

Transitions (solid arrows with labels):
- "Launch Installer" from initial to Welcome
- "Click Next" from Welcome to Prerequisites
- "Cancel" from Welcome to final
- "Start Checks" from Prerequisites to CheckingSystem
- "All Critical Pass" from CheckingSystem to ChecksPassed
- "Critical Failure" from CheckingSystem to ChecksFailed
- "Retry" from ChecksFailed back to Prerequisites
- "Click Next" from ChecksPassed to Configuration
- "Valid Config" from Configuration to Installing
- Progress transitions: "20% Complete", "35% Complete", "75% Complete"
- "Error" transitions to InstallError state
- "100% Complete" to InstallSuccess
- "Show Success" to Completion
- "Finish" to final state

Notes (yellow boxes with dog-eared corner):
- Near CheckingSystem: "Validating: Windows version, RAM, Disk, Virtualization, Admin"
- Near Installing: "Progress events fired to update UI in real-time"

Guards (conditions in square brackets on transitions):
- [Admin Rights OK]
- [All Checks Pass]
- [Config Valid]

Color scheme:
- Normal states: #E3F2FD (light blue)
- Success states: #C8E6C9 (light green)
- Error states: #FFCDD2 (light red)
- Background: White or very light gray

Font: Clean sans-serif
Arrow style: Solid with filled arrowheads
Layout: Left to right flow, then down for sub-states
```

---

## Tips for Best Results

### For All Prompts:

1. **Add to prompt for high quality**:
   - "High resolution, 4K quality"
   - "Professional business presentation style"
   - "Clean, minimalist design"
   - "Suitable for academic thesis"

2. **Specify dimensions**:
   - "Landscape orientation, 16:9 aspect ratio"
   - "1920x1080 resolution"
   - "PNG format with transparent background"

3. **If colors aren't working well**:
   - Add: "Use soft pastel color palette"
   - Add: "High contrast for accessibility"
   - Add: "Follow UML standard colors"

4. **For thesis use**:
   - Add: "Publication quality"
   - Add: "Black and white friendly (works when printed in grayscale)"
   - Add: "Clear labels, readable at small sizes"

### Platform-Specific Tips:

**Google Gemini / Imagen**:
- Works best with detailed structural descriptions
- Good at understanding UML terminology
- May need to regenerate 2-3 times for perfect result

**DALL-E 3**:
- Excellent at understanding layout instructions
- Good at following color schemes
- Use phrase "in the style of a professional UML diagram"

**Midjourney**:
- Add: "--v 6" for latest model
- Add: "--style raw" for less artistic interpretation
- Use: "technical diagram, UML style"

### Iteration Tips:

If first result isn't perfect, modify prompt with:
- "Make [specific element] larger/smaller"
- "Use more spacing between [elements]"
- "Emphasize [particular aspect]"
- "Add more detail to [specific part]"

---

## Example Modification Request

If you get a diagram but want to refine it:

```
Based on the previous diagram, please make these adjustments:
1. Increase font size on all labels by 20%
2. Add more spacing between the component boxes
3. Make the error states (red boxes) more prominent
4. Use a softer shade of blue for the form components
5. Add subtle drop shadows to all boxes for depth
```

---

## Saving and Using Generated Images

1. **Export Format**: PNG or SVG for thesis
2. **Resolution**: Minimum 1920x1080 for thesis printing
3. **File Naming**: `figure-5.8-class-diagram.png`
4. **Location**: Save to `THESIS-ISCS/05-software-implementation/local-installer/diagrams/`
5. **Thesis Integration**: Reference as "Figure 5.8" with caption "Source: compiled by author using AI-assisted diagram generation"

---

## Quick Prompt Templates

### Ultra-Short Version (for quick tests):

**Use Case**: "UML use case diagram: Windows installer app, actors: User and Admin, 7 use cases in system boundary, professional style, pastel colors"

**Activity**: "UML activity diagram: installation flow, start to finish, 5 stages with progress updates, decision diamonds, error paths, professional flowchart style"

**Class**: "UML class diagram: 5 forms, 4 core classes, 3-tier architecture, associations and dependencies, professional software engineering style"

**Sequence**: "UML sequence diagram: user installing software through wizard forms, actors and components, message flows, activation bars, professional style"

**Component**: "UML component diagram: 4-layer architecture, presentation/business/integration/external, dependency arrows, professional enterprise style"
