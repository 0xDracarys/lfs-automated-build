# Implementation Plan

- [x] 1. Set up project structure and types
  - [x] 1.1 Create TypeScript type definitions for wizard
    - Create `lib/types/wizard.ts` with Platform, LinuxDistro, StageInfo, WizardProgress, etc.
    - _Requirements: 1.1, 15.1_
  - [x] 1.2 Write property test for platform detection
    - **Property 1: Platform Detection Consistency**
    - **Validates: Requirements 1.1, 1.2**

- [x] 2. Implement WizardContext and state management
  - [x] 2.1 Create WizardContext provider
    - Create `contexts/WizardContext.tsx` with state for currentStage, completedStages, platform, distro
    - Implement setCurrentStage, markStageComplete, resetStage, resetAllProgress functions
    - _Requirements: 15.1, 15.2, 15.3_
  - [x] 2.2 Implement localStorage persistence
    - Create `lib/utils/wizardStorage.ts` with save/load functions
    - Handle schema versioning for future migrations
    - _Requirements: 15.1, 15.2_
  - [x] 2.3 Write property test for progress persistence
    - **Property 2: Progress Persistence Round-Trip**
    - **Validates: Requirements 15.1, 15.2**
  - [x] 2.4 Write property test for stage prerequisites
    - **Property 3: Stage Prerequisite Enforcement**
    - **Validates: Requirements 15.4**

- [x] 3. Create stage data definitions
  - [x] 3.1 Define all 12 stages with metadata
    - Create `lib/data/wizard-stages.ts` with STAGES array
    - Include title, description, estimatedTime, diskSpace, prerequisites for each stage
    - _Requirements: 18.1, 18.2, 18.3_
  - [x] 3.2 Define platform-specific commands for Stage 1 (Platform Setup)
    - Windows: WSL installation commands
    - Linux: Package manager commands for Ubuntu, Fedora, Arch
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_
  - [x] 3.3 Define commands for Stages 2-6 (Mount, Downloads, User, Toolchain, Temp Tools)
    - Mount point creation, environment variables
    - Source download options (wget-list vs pre-built)
    - LFS user creation and permissions
    - Toolchain extraction/build commands
    - _Requirements: 4.1-4.5, 5.1-5.5, 6.1-6.5, 7.1-7.5, 8.1-8.5_
  - [x] 3.4 Define commands for Stages 7-12 (Chroot, Build, Config, Kernel, GRUB, Final)
    - Chroot setup and virtual filesystem mounts
    - Core package build instructions
    - System configuration files
    - Kernel compilation commands
    - GRUB installation for BIOS/UEFI
    - _Requirements: 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.5, 13.1-13.5, 14.1-14.5_
  - [x] 3.5 Write property test for distro-specific commands
    - **Property 5: Distro-Specific Command Selection**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  - [x] 3.6 Write property test for time estimate validity
    - **Property 9: Time Estimate Validity**
    - **Validates: Requirements 18.1, 18.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - All 134 tests passing ✓

- [x] 5. Build core UI components
  - [x] 5.1 Create CommandBlock component
    - Create `components/wizard/CommandBlock.tsx`
    - Implement copy-to-clipboard with visual feedback
    - Support platform filtering
    - _Requirements: 8.2, 8.3_
  - [x] 5.2 Write property test for command copy functionality
    - **Property 10: Command Copy Functionality**
    - **Validates: Requirements 8.2, 8.3**
  - [x] 5.3 Create ProgressSidebar component
    - Create `components/wizard/ProgressSidebar.tsx`
    - Show all stages with status icons (locked, available, complete)
    - Clickable navigation to unlocked stages
    - _Requirements: 15.3, 15.4_
  - [x] 5.4 Write property test for progress bar accuracy
    - **Property 7: Progress Bar Accuracy**
    - **Validates: Requirements 15.3**
  - [x] 5.5 Create StageContent component
    - Create `components/wizard/StageContent.tsx`
    - Display stage header, steps, commands, and actions
    - _Requirements: 8.1, 8.4_
  - [x] 5.6 Create StageActions component (integrated into StageContent)
    - Include Mark Complete, Download Script, Next Stage buttons
    - _Requirements: 9.1, 9.2, 16.1_

- [x] 6. Implement script generation
  - [x] 6.1 Create ScriptGenerator utility
    - Create `lib/utils/scriptGenerator.ts`
    - Generate shell scripts from stage commands
    - Include comments and error handling in scripts
    - _Requirements: 16.1, 16.2, 16.3_
  - [x] 6.2 Write property test for script generation completeness
    - **Property 6: Script Generation Completeness**
    - **Validates: Requirements 16.2, 16.3**
  - [x] 6.3 Implement download functionality
    - Create downloadable .sh files
    - Support single stage and full script download
    - _Requirements: 16.4, 16.5_

- [x] 7. Build main wizard page
  - [x] 7.1 Create wizard page layout
    - Create `app/install/page.tsx`
    - Implement responsive layout with sidebar and content area
    - _Requirements: 1.2, 15.3_
  - [x] 7.2 Implement platform detection
    - Create `lib/utils/platformDetection.ts`
    - Detect OS from navigator.userAgent
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  - [x] 7.3 Write property test for command platform filtering
    - **Property 4: Command Platform Filtering**
    - **Validates: Requirements 2.1, 3.1**
  - [x] 7.4 Implement stage navigation
    - Handle stage transitions with prerequisite checking
    - Update URL hash for deep linking
    - _Requirements: 15.4_
  - [x] 7.5 Write property test for stage reset cascade
    - **Property 8: Stage Reset Cascade**
    - **Validates: Requirements 15.5**

- [x] 8. Add troubleshooting and help features
  - [x] 8.1 Create TroubleshootingSection component (integrated into StageContent)
    - Expandable section with common issues and solutions
    - _Requirements: 17.1, 17.2_
  - [x] 8.2 Add troubleshooting data for each stage
    - Define common errors and solutions in stage data
    - Include diagnostic commands
    - _Requirements: 17.3, 17.4, 17.5_

- [x] 9. Implement final features
  - [x] 9.1 Create WizardHeader with progress bar (integrated into page)
    - Show overall progress percentage
    - Display platform indicator
    - _Requirements: 15.3, 1.2_
  - [x] 9.2 Create WizardFooter with reset and download options (integrated into page)
    - Reset all progress button with confirmation
    - Download full installation script button
    - _Requirements: 15.5, 16.4_
  - [x] 9.3 Add LFS Shell entry instructions (Stage 12)
    - Provide chroot and boot commands
    - Include first-boot checklist
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 10. Integration and polish
  - [x] 10.1 Add wizard link to navigation and build page
    - Update navigation to include "Install Wizard" link
    - Add prominent link from /build page
    - _Requirements: 1.2_
  - [x] 10.2 Add animations and transitions
    - Smooth stage transitions with Framer Motion
    - Progress bar animations
    - _Requirements: UI polish_
  - [x] 10.3 Ensure responsive design
    - Mobile-friendly layout
    - Collapsible sidebar on small screens
    - _Requirements: UI polish_

- [x] 11. Final Checkpoint - Ensure all tests pass
  - All 134 tests passing ✓

## Test Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| app.test.tsx | 28 | ✓ |
| platformDetection.property.test.ts | 12 | ✓ |
| wizardStorage.property.test.ts | 9 | ✓ |
| stagePrerequisites.property.test.ts | 10 | ✓ |
| stageData.property.test.ts | 19 | ✓ |
| commandCopy.property.test.ts | 9 | ✓ |
| progressBar.property.test.ts | 13 | ✓ |
| stageReset.property.test.ts | 14 | ✓ |
| scriptGenerator.property.test.ts | 20 | ✓ |
| **Total** | **134** | **✓** |

## Files Created/Modified

### New Files
- `lib/types/wizard.ts` - Type definitions
- `lib/utils/platformDetection.ts` - Platform detection utility
- `lib/utils/wizardStorage.ts` - localStorage persistence
- `lib/utils/scriptGenerator.ts` - Script generation utility
- `lib/data/wizard-stages.ts` - Stage definitions with commands
- `contexts/WizardContext.tsx` - Wizard state context
- `components/wizard/CommandBlock.tsx` - Command display component
- `components/wizard/ProgressSidebar.tsx` - Progress sidebar component
- `components/wizard/StageContent.tsx` - Stage content component
- `app/install/page.tsx` - Main wizard page
- `__tests__/wizard/platformDetection.property.test.ts`
- `__tests__/wizard/wizardStorage.property.test.ts`
- `__tests__/wizard/stagePrerequisites.property.test.ts`
- `__tests__/wizard/stageData.property.test.ts`
- `__tests__/wizard/commandCopy.property.test.ts`
- `__tests__/wizard/progressBar.property.test.ts`
- `__tests__/wizard/stageReset.property.test.ts`
- `__tests__/wizard/scriptGenerator.property.test.ts`

### Modified Files
- `app/build/page.tsx` - Added wizard link with Wand2 icon
