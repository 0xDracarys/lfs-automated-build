# 🎨 Diagrams Quick Reference

## 📂 Files Created

### 1. [MERMAID-DIAGRAMS.md](MERMAID-DIAGRAMS.md)
**Contains 6 diagram types in Mermaid format:**
- ✅ Use Case Diagram (2 versions)
- ✅ Activity Diagram (Installation Flow)
- ✅ Sequence Diagram (User Interaction)
- ✅ Class Diagram (Core Architecture)
- ✅ Component Diagram (System Layers)
- ✅ State Diagram (Installation States)

### 2. [AI-IMAGE-GENERATION-PROMPTS.md](AI-IMAGE-GENERATION-PROMPTS.md)
**Contains 6 detailed AI prompts for:**
- Google Gemini / Imagen 3
- DALL-E 3
- Midjourney
- Any AI image generator

---

## 🚀 Quick Start - 3 Steps

### Step 1: Preview Mermaid Diagrams
```powershell
# Open Mermaid Live Editor
start https://mermaid.live/
```
Copy any diagram code from `MERMAID-DIAGRAMS.md` → Paste → See instant preview!

### Step 2: Export for Thesis
In Mermaid Live:
1. Click "Actions" button
2. Select "PNG" or "SVG" (SVG = best quality)
3. Save to `screenshots/` folder
4. Name: `figure-5-8-class-diagram.png`

### Step 3: Generate with AI (Optional)
1. Open Google Gemini or your preferred AI
2. Copy prompt from `AI-IMAGE-GENERATION-PROMPTS.md`
3. Paste and generate
4. Refine if needed

---

## 📊 Diagram Recommendations for Thesis

| Diagram | Priority | Use In Section | Figure # |
|---------|----------|----------------|----------|
| **Use Case (Simplified)** | ⭐⭐⭐ | 02-analytical-part | Fig 2.X |
| **Activity Diagram** | ⭐⭐⭐ | 04-project-part or 05-implementation | Fig 5.2 |
| **Class Diagram** | ⭐⭐⭐ | 05-software-implementation | Fig 5.8 |
| **Sequence Diagram** | ⭐⭐ | 05-software-implementation | Fig 5.X |
| **Component Diagram** | ⭐⭐ | 04-project-part | Fig 4.X |
| **State Diagram** | ⭐ | 04-project-part (optional) | Fig 4.X |

---

## 🎯 Which Diagram for What?

### Use Case Diagram
**Shows**: Who uses the system and what they can do  
**Best for**: Requirements analysis, system scope  
**Thesis section**: Analytical Part (Chapter 2)

### Activity Diagram
**Shows**: Step-by-step installation process flow  
**Best for**: Process workflows, algorithms  
**Thesis section**: Project Part (Chapter 4) or Implementation (Chapter 5)

### Class Diagram
**Shows**: Code structure, classes, relationships  
**Best for**: Software architecture, OOP design  
**Thesis section**: Software Implementation (Chapter 5)

### Sequence Diagram
**Shows**: How objects interact over time  
**Best for**: Dynamic behavior, message flows  
**Thesis section**: Software Implementation (Chapter 5)

### Component Diagram
**Shows**: System architecture in layers  
**Best for**: High-level system design  
**Thesis section**: Project Part (Chapter 4)

### State Diagram
**Shows**: System states and transitions  
**Best for**: State machines, lifecycle  
**Thesis section**: Project Part (Chapter 4) - optional

---

## 📝 Thesis Caption Format (ISCS)

### Lithuanian Caption Example:
```
5.8 pav. LFS diegimo programos klasių diagrama
Source: compiled by author.
```

### English Caption Example:
```
Figure 5.8 - LFS Installer Class Diagram
Source: compiled by author.
```

### In Markdown:
```markdown
**Figure 5.8** - LFS Installer Class Diagram

![Class Diagram](../screenshots/figure-5-8-class-diagram.png)

Source: compiled by author.
```

---

## 🔧 Editing Diagrams

### Option 1: Edit Mermaid Code (Easiest)
1. Open `MERMAID-DIAGRAMS.md`
2. Find the diagram
3. Edit text directly in code
4. Preview at mermaid.live
5. Export updated version

### Option 2: AI Regeneration
1. Copy prompt from `AI-IMAGE-GENERATION-PROMPTS.md`
2. Add modification request at end:
   ```
   Make these changes:
   - Increase font size
   - Add more spacing
   - Change color of X to Y
   ```
3. Generate new version

### Option 3: Image Editor (Last Resort)
- Use for minor text corrections only
- Tools: Paint.NET, GIMP, Photoshop
- Not recommended (harder to maintain)

---

## 💡 Pro Tips

### Tip 1: Keep It Simple
- Use simplified use case diagram (version 2 in file)
- Less is more for thesis readability
- Focus on key concepts

### Tip 2: Consistency
- Use same color scheme across all diagrams
- Same font/style for professional look
- Export all at same resolution (1920x1080)

### Tip 3: Test Printing
- Print in grayscale to check readability
- Ensure labels are large enough
- Check contrast is sufficient

### Tip 4: Version Control
- Name files with version: `class-diagram-v2.png`
- Keep Mermaid source code (easy to edit later)
- Save AI prompts used (for regeneration)

### Tip 5: Thesis Integration
```markdown
As shown in Figure 5.8, the installer architecture consists of three 
main layers: Presentation Layer (5 wizard forms), Business Logic Layer 
(4 core classes), and System Integration Layer (WMI, Process, FileSystem).
```

---

## 🎨 Color Codes Used

### For Consistency Across All Diagrams:

| Element Type | Color | Hex Code |
|--------------|-------|----------|
| **Forms/UI** | Light Blue | `#E3F2FD` |
| **Business Logic** | Light Yellow | `#FFF9C4` |
| **System Integration** | Light Purple | `#F3E5F5` |
| **External Systems** | Light Gray | `#ECEFF1` |
| **Success States** | Light Green | `#C8E6C9` |
| **Error States** | Light Red | `#FFCDD2` |
| **Warning/Decisions** | Amber | `#FFE082` |

---

## 📁 File Organization

```
diagrams/
├── README.md (this file)
├── MERMAID-DIAGRAMS.md
├── AI-IMAGE-GENERATION-PROMPTS.md
└── ../screenshots/
    ├── figure-5-2-activity-diagram.png
    ├── figure-5-8-class-diagram.png
    ├── figure-5-9-sequence-diagram.png
    ├── figure-4-5-component-diagram.png
    └── figure-2-3-use-case-diagram.png
```

---

## 🚀 Commands Cheat Sheet

### View Diagrams
```powershell
# Open Mermaid Live Editor
start https://mermaid.live/

# Open diagram files
code "THESIS-ISCS/05-software-implementation/local-installer/diagrams/MERMAID-DIAGRAMS.md"

# Open AI prompts
code "THESIS-ISCS/05-software-implementation/local-installer/diagrams/AI-IMAGE-GENERATION-PROMPTS.md"
```

### Copy Specific Diagram
```powershell
# Example: Copy use case diagram code
# 1. Open MERMAID-DIAGRAMS.md
# 2. Find "Use Case Diagram" section
# 3. Copy code between ```mermaid and ```
# 4. Paste at mermaid.live
```

### Export High Quality
In Mermaid Live editor:
1. Actions → Configuration
2. Set scale: 2 or 3 (higher = bigger)
3. Actions → PNG/SVG
4. Save with descriptive name

---

## 📖 Additional Resources

### Mermaid Documentation
- Official: https://mermaid.js.org/
- Syntax: https://mermaid.js.org/intro/syntax-reference.html
- Examples: https://mermaid.js.org/ecosystem/integrations.html

### UML Standards
- UML 2.5 Specification: https://www.omg.org/spec/UML/
- Tutorial: https://www.lucidchart.com/pages/uml

### AI Tools
- Google Gemini: https://gemini.google.com/
- DALL-E 3: https://openai.com/dall-e-3
- Midjourney: https://midjourney.com/

---

## ✅ Checklist for Thesis

Before submitting thesis, ensure:
- [ ] All diagrams exported at consistent resolution
- [ ] Figure numbers assigned sequentially
- [ ] Captions added in ISCS format
- [ ] "Source: compiled by author" on all diagrams
- [ ] Diagrams referenced in text
- [ ] Grayscale print test passed
- [ ] Files saved in thesis screenshots folder
- [ ] Mermaid source code backed up

---

## 🆘 Troubleshooting

### Mermaid diagram not rendering?
- Check syntax (missing backticks, braces)
- Try simpler version first
- Use mermaid.live validator

### AI generated wrong diagram?
- Be more specific in prompt
- Add "UML standard" to prompt
- Show example image if possible

### Export quality poor?
- Increase scale in Mermaid settings
- Use SVG instead of PNG
- Check zoom level before export

### Diagram too complex?
- Simplify (remove non-essential elements)
- Split into 2 diagrams
- Use "..." to indicate omitted parts

---

**Quick Links:**
- 📊 [View All Diagrams](MERMAID-DIAGRAMS.md)
- 🎨 [AI Generation Prompts](AI-IMAGE-GENERATION-PROMPTS.md)
- 🏠 [Back to Installer Docs](../README.md)

---

**Status**: 6 complete Mermaid diagrams + 6 AI prompts ready to use! 🎉
