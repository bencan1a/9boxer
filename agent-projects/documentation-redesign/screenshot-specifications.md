# Screenshot Specifications & Annotation Guide

**Purpose:** Standardize screenshot creation and annotation for 9Boxer user documentation

**Version:** 1.0 | **Date:** December 2024

---

## Overview

This guide ensures all documentation screenshots are:
- **Consistent** - Same style, colors, and annotation approach
- **Clear** - Highlight exactly what users need to see
- **Accessible** - Include alt text and high contrast
- **Professional** - Clean, uncluttered, well-composed

---

## Technical Specifications

### File Format

| Attribute | Specification |
|-----------|---------------|
| **Format** | PNG (Portable Network Graphics) |
| **Color depth** | 24-bit RGB (8 bits per channel) |
| **Transparency** | Alpha channel where appropriate |
| **Compression** | Optimized (use TinyPNG or similar after annotation) |
| **Metadata** | Strip EXIF data (privacy) |

### Resolution & Size

| Type | Width | Max Height | DPI |
|------|-------|------------|-----|
| **Full application** | 2400px | 1600px | 144 (2x for retina) |
| **Partial UI** | 1800px | 1200px | 144 (2x for retina) |
| **Detail callout** | 1200px | 800px | 144 (2x for retina) |
| **Icon/button** | 600px | 400px | 144 (2x for retina) |

**Why 2x resolution?**
- Renders crisp on retina/high-DPI displays
- MkDocs automatically scales down for standard displays
- Better for zooming/accessibility

### File Naming Convention

```
[page]-[feature]-[state]-[sequence].png
```

**Components:**
- `[page]` - Documentation page (lowercase, hyphenated)
- `[feature]` - UI feature being shown (lowercase, hyphenated)
- `[state]` - UI state: before, after, active, hover, error, success
- `[sequence]` - Number (01, 02, 03...) if multiple shots

**Examples:**
```
quickstart-upload-button-highlighted-01.png
quickstart-grid-before-upload-02.png
quickstart-grid-after-upload-03.png
workflow-drag-drop-before-01.png
workflow-drag-drop-during-02.png
workflow-drag-drop-after-03.png
features-filters-panel-open-01.png
features-statistics-tab-active-01.png
troubleshooting-upload-error-message-01.png
```

### Storage Location

```
docs/images/screenshots/
├── quickstart/
│   ├── quickstart-upload-button-highlighted-01.png
│   ├── quickstart-grid-populated-02.png
│   └── quickstart-success-annotated-03.png
├── workflow/
│   ├── workflow-drag-drop-sequence-01.png
│   └── workflow-employee-details-02.png
├── features/
│   ├── features-filters-panel-01.png
│   └── features-donut-mode-active-01.png
└── troubleshooting/
    └── troubleshooting-upload-error-01.png
```

---

## Annotation Standards

### Color Palette

Use these exact colors for consistency:

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| **Highlight box** | Red | `#FF0000` | Draw attention to buttons, fields, UI elements |
| **Callout circle** | Blue | `#1976D2` | Number indicators (1, 2, 3) |
| **Arrow** | Red | `#FF0000` | Point to specific elements |
| **Text background** | Black 60% opacity | `#000000 @ 60%` | Behind white annotation text |
| **Text color** | White | `#FFFFFF` | Annotation labels and descriptions |
| **Success indicator** | Green | `#4CAF50` | Checkmarks, success states |
| **Warning indicator** | Orange | `#FF9800` | Warnings, important notes |
| **Error indicator** | Red | `#F44336` | Errors, problems |

### Annotation Elements

#### 1. Highlight Box (Red Rectangle)

**Purpose:** Draw attention to clickable UI elements

**Specifications:**
- Border: 3px solid red (`#FF0000`)
- Fill: None (transparent)
- Corner radius: 4px
- Padding: 8px around element

**When to use:**
- Buttons (Upload, Apply, Filters)
- Menu items
- Input fields
- Clickable tiles/cards

**Example:**
```
┌─────────────────┐
│                 │  ← 3px red border, no fill
│    Upload       │  ← 8px padding around button
│                 │
└─────────────────┘
```

![Example of highlight box around Upload button](examples/annotation-highlight-box.png)

#### 2. Numbered Callout Circle

**Purpose:** Create step-by-step sequences

**Specifications:**
- Circle diameter: 40px
- Background: Blue (`#1976D2`)
- Border: 2px solid white (`#FFFFFF`)
- Text: White, bold, 20px Roboto
- Shadow: 2px drop shadow (black 30% opacity)

**When to use:**
- Multi-step instructions
- Sequence of actions (1 → 2 → 3)
- Referring to numbered steps in text

**Example:**
```
    ┌───────┐
    │   1   │  ← White number on blue circle
    └───────┘     with white border
```

![Example of numbered callout circles showing a sequence](examples/annotation-numbered-callouts.png)

#### 3. Arrow Pointer

**Purpose:** Direct eye to specific UI element

**Specifications:**
- Width: 4px
- Color: Red (`#FF0000`)
- Arrowhead: Simple triangle, 12px
- Style: Curved or straight (context-dependent)
- Shadow: 1px drop shadow (black 40% opacity)

**When to use:**
- Pointing from annotation text to UI element
- Showing direction of action (drag from here → to here)
- Indicating state changes

**Types:**
- **Straight arrow:** Direct point to nearby element
- **Curved arrow:** Point to element while avoiding clutter
- **Double-ended arrow:** Show movement (drag and drop)

![Examples of arrow styles: straight, curved, and double-ended](examples/annotation-arrows.png)

#### 4. Annotation Text Label

**Purpose:** Explain what user should see or do

**Specifications:**
- Font: Roboto Medium, 16px
- Text color: White (`#FFFFFF`)
- Background: Black rounded rectangle, 60% opacity
- Padding: 8px horizontal, 6px vertical
- Corner radius: 4px
- Shadow: 2px drop shadow (black 40% opacity)

**When to use:**
- Explain what a UI element does
- Describe expected outcome
- Provide context for highlighted element

**Example:**
```
┌──────────────────────────────┐
│  Click here to upload file   │  ← White text on semi-transparent black
└──────────────────────────────┘
```

![Example of annotation text label](examples/annotation-text-label.png)

#### 5. Success Indicator (Checkmark)

**Purpose:** Show what users should see when successful

**Specifications:**
- Symbol: ✓ (checkmark)
- Color: Green (`#4CAF50`)
- Size: 24px
- Background: White circle, 32px diameter
- Border: 2px solid green
- Shadow: 2px drop shadow (black 30% opacity)

**When to use:**
- Marking successful completion
- Showing expected result
- Confirming correct state

![Example of success checkmarks on annotated screenshot](examples/annotation-success-checkmarks.png)

#### 6. Blur Overlay (Privacy)

**Purpose:** Hide sensitive data while preserving layout

**Specifications:**
- Effect: Gaussian blur, 10px radius
- OR: Solid color overlay (#CCCCCC) with "Sample Data" text
- Applied to: Employee names, IDs, manager names

**When to use:**
- Screenshots of real employee data
- Demonstrating with production data
- Privacy-sensitive information

**Do NOT blur:**
- UI elements (buttons, labels, icons)
- Grid structure
- Anonymized sample data (use realistic fake names instead)

**Better approach:** Use realistic but fictional data
- Names: "Sarah Chen", "Marcus Johnson", "Emma Rodriguez"
- IDs: 1001, 1002, 1003
- Departments: "Engineering", "Sales", "Marketing"

---

## Screenshot Composition Guidelines

### Framing & Cropping

#### Full Application Screenshot

**When to use:**
- First-time view of application
- Showing overall layout and navigation
- Context for where features are located

**Composition:**
- Include full window (title bar to bottom)
- Show entire application UI
- Capture at standard window size (1600x1000px app window)
- Center application on screen

![Example of full application screenshot composition](examples/composition-full-app.png)

#### Partial UI Screenshot

**When to use:**
- Focusing on specific feature or panel
- Showing dialog or modal
- Highlighting particular section

**Composition:**
- Include enough context to orient user
- Crop to relevant area only
- Maintain aspect ratio
- Include reference points (top bar, side panel edge)

![Example of partial UI screenshot showing just the filters panel](examples/composition-partial-ui.png)

#### Detail Callout

**When to use:**
- Showing small UI elements (buttons, badges, icons)
- Demonstrating state changes (color, text)
- Extreme close-up of specific element

**Composition:**
- Crop tightly to element
- Include small amount of surrounding context
- Ensure element is large and visible
- Use for secondary "zoomed in" views

![Example of detail callout showing Apply button badge](examples/composition-detail-callout.png)

### Visual Hierarchy

**Priority order:**
1. **Primary focus** - What user needs to click/see (red highlight box)
2. **Secondary context** - Supporting UI elements (visible but not highlighted)
3. **Background** - Overall layout (present but de-emphasized)

**Techniques:**
- Dim background slightly (10% darker) to make foreground pop
- Use selective focus (slight blur on non-essential areas)
- Ensure annotations don't obscure UI

### Multi-Step Sequences

**For actions with multiple steps:**
- Create separate screenshot for each step
- Use numbered callouts consistently (1, 2, 3)
- Show progression clearly (before → during → after)
- Maintain consistent framing across sequence

**Example: Drag and Drop Sequence**
```
Step 1: Before (numbered "1")
- Show employee in original position
- Highlight tile with red box
- Annotation: "Click and hold this employee"

Step 2: During (numbered "2")
- Show tile being dragged (semi-transparent)
- Motion lines or arrow showing direction
- Target box highlighted
- Annotation: "Drag to this box"

Step 3: After (numbered "3")
- Show employee in new position
- Yellow highlight on moved tile
- Annotation: "Employee moved and marked as changed"
```

---

## State Variations

Document different UI states for interactive elements:

### Before/After Pairs

**When to use:**
- Showing result of user action
- Demonstrating state change
- Illustrating transformation

**Examples:**
- Grid before upload (empty) vs. after upload (populated)
- Employee tile before move (blue) vs. after move (yellow)
- Apply button with 0 changes vs. with badge count
- Filters button inactive vs. active (orange dot)

### Hover States

**When to use:**
- Showing interactive elements respond to mouse
- Demonstrating tooltips
- Revealing hidden UI on hover

**Capture method:**
- Trigger hover state
- Screenshot immediately
- Annotate with "Hover state" label

### Active States

**When to use:**
- Showing selected/active elements
- Demonstrating current focus
- Indicating user is "here"

**Examples:**
- Selected employee tile (border highlight)
- Active tab (underline, bold)
- Expanded box (collapse icon visible)

### Error States

**When to use:**
- Troubleshooting documentation
- Showing what users see when things go wrong
- Demonstrating validation messages

**Composition:**
- Capture full error message
- Include context showing what triggered error
- Highlight error message with orange box (not red)

---

## Accessibility Requirements

### Alt Text

Every screenshot MUST have descriptive alt text for screen readers.

**Format:**
```markdown
![Alt text describing what's shown in the image](path/to/image.png)
```

**Good alt text structure:**
1. **What:** What's shown in the image
2. **Where:** Location in UI if relevant
3. **Annotations:** Describe any callouts or highlights

**Examples:**

✅ **GOOD:**
```markdown
![Upload button in top-left of application toolbar, highlighted with red box and numbered callout "1"](quickstart-upload-button-01.png)
```

```markdown
![9-box grid showing 87 employees organized by performance (horizontal axis) and potential (vertical axis), with annotations labeling each axis](quickstart-grid-axes-labeled-01.png)
```

```markdown
![Three-panel sequence showing drag-and-drop: panel 1 shows clicking employee tile, panel 2 shows dragging to new box with motion arrow, panel 3 shows employee in new position with yellow highlight](workflow-drag-drop-sequence-01.png)
```

❌ **BAD:**
```markdown
![Screenshot](image.png)
![Grid](grid.png)
![Upload button](upload.png)
```

### Color Contrast

Ensure annotations are readable:
- White text on dark background (60% black)
- High contrast between highlight color and UI
- Don't rely on color alone (use shapes, text, arrows)

### Text Size

- Annotation text: Minimum 16px (readable when scaled)
- Callout numbers: Minimum 20px (highly visible)
- UI text in screenshot: Keep at actual size (don't scale up)

---

## Annotation Tools & Software

### Recommended Tools

#### **Option 1: Snagit (Paid, Recommended)**
- **Why:** Professional annotations, templates, consistency
- **Features:** Callouts, arrows, blur, numbering, templates
- **Platform:** Windows, macOS
- **Cost:** ~$50 one-time purchase

#### **Option 2: Greenshot (Free, Open Source)**
- **Why:** Free, powerful, good for basic annotations
- **Features:** Shapes, text, arrows, blur, numbering
- **Platform:** Windows
- **Cost:** Free (donations appreciated)

#### **Option 3: macOS Screenshot + Markup (Free, Built-in)**
- **Why:** Built into macOS, no install needed
- **Features:** Shapes, text, arrows, basic annotations
- **Platform:** macOS only
- **Cost:** Free

#### **Option 4: GIMP (Free, Advanced)**
- **Why:** Full image editor, total control
- **Features:** Layers, filters, text, shapes, effects
- **Platform:** Windows, macOS, Linux
- **Cost:** Free, open source
- **Learning curve:** Steeper than dedicated screenshot tools

### Annotation Workflow (Snagit Example)

1. **Capture screenshot**
   - Use Snagit capture tool
   - Select region or full window
   - Capture at 2x resolution (144 DPI)

2. **Apply annotations**
   - Add red highlight boxes around clickable elements
   - Add numbered callouts for sequences
   - Add arrows pointing to key areas
   - Add text labels explaining elements

3. **Apply blur to sensitive data** (if needed)
   - Select employee names/IDs
   - Apply 10px Gaussian blur
   - OR replace with fictional data

4. **Export optimized PNG**
   - Save as PNG (not JPG)
   - Include alpha channel for transparency
   - Name file according to convention
   - Optimize with TinyPNG

5. **Add to documentation**
   - Move file to appropriate screenshots folder
   - Add to markdown with descriptive alt text
   - Verify rendering in MkDocs preview

---

## Screenshot Checklist

Before publishing any screenshot, verify:

### Composition
- [ ] Screenshot captures relevant UI clearly
- [ ] Framing includes enough context
- [ ] No unnecessary clutter or distractions
- [ ] Consistent window size across similar screenshots

### Annotations
- [ ] Key elements highlighted with red boxes
- [ ] Numbered callouts used for sequences
- [ ] Arrows point clearly to referenced elements
- [ ] Text labels explain what users should see/do
- [ ] Annotation colors match style guide

### Privacy & Data
- [ ] No real employee names, IDs, or sensitive data
- [ ] Sample data is realistic but fictional
- [ ] Blur applied to any real data (if unavoidable)

### Technical Quality
- [ ] Resolution: 2x (144 DPI) for retina displays
- [ ] Format: PNG with alpha channel
- [ ] File size: Optimized (< 500KB if possible)
- [ ] File named according to convention

### Accessibility
- [ ] Alt text is descriptive and complete
- [ ] Annotations use high-contrast colors
- [ ] Text is readable when scaled
- [ ] Don't rely on color alone to convey meaning

### Documentation Integration
- [ ] File saved in correct screenshots folder
- [ ] Referenced in markdown with proper syntax
- [ ] Renders correctly in MkDocs preview
- [ ] Markdown includes alt text

---

## Examples: Before & After

### Example 1: Upload Button

**❌ BEFORE (poor annotation):**
![Upload button screenshot with no annotations](examples/before-upload-no-annotation.png)
*Issues: No highlights, user doesn't know what to click*

**✅ AFTER (good annotation):**
![Upload button in top-left toolbar, highlighted with red box and numbered "1", with arrow pointing to it and label "Click here to upload your Excel file"](examples/after-upload-annotated.png)
*Improvements: Red highlight box, numbered callout, clear label*

---

### Example 2: Drag and Drop Sequence

**❌ BEFORE (single static screenshot):**
![Grid showing employee tiles with no indication of drag and drop](examples/before-drag-drop-static.png)
*Issues: Doesn't show action, unclear what user should do*

**✅ AFTER (3-panel sequence):**

**Panel 1: Click and hold**
![Employee tile highlighted with red box and numbered "1", annotation: "Click and hold this employee"](examples/after-drag-drop-step1.png)

**Panel 2: Drag to target**
![Semi-transparent employee tile being dragged with motion arrow to target box, highlighted with numbered "2", annotation: "Drag to this box"](examples/after-drag-drop-step2.png)

**Panel 3: Drop and confirm**
![Employee now in new position with yellow highlight, numbered "3", annotation: "Employee moved and marked as changed"](examples/after-drag-drop-step3.png)

*Improvements: Shows progression, numbered sequence, motion indicated*

---

### Example 3: Success State

**❌ BEFORE (no success indicators):**
![Grid populated with employees but no visual confirmation](examples/before-success-no-indicators.png)
*Issues: User doesn't know if upload succeeded, no clear verification*

**✅ AFTER (with success indicators):**
![Grid populated with employees, green checkmarks pointing to: grid, employee count, and tiles, with annotation "Success! Your data is loaded"](examples/after-success-with-checkmarks.png)
*Improvements: Green checkmarks, labeled success elements, clear confirmation*

---

## Maintenance & Updates

### When to Update Screenshots

- **UI changes:** Any visual change to the interface
- **Feature updates:** New buttons, panels, or functionality
- **Branding changes:** Color scheme, logo, or theme updates
- **Quarterly review:** Check all screenshots for accuracy

### Version Tracking

Keep a log of screenshot updates:

```
Screenshot Update Log
=====================
2024-12-15: Initial creation (v1.0)
2025-01-10: Updated filters panel (new filter added)
2025-02-05: Refreshed theme (dark mode → updated palette)
```

### Screenshot Source Files

Save editable source files separately:

```
docs/images/screenshots/
└── _source/
    ├── quickstart-upload-button-01.snag (Snagit project)
    ├── workflow-drag-drop-sequence-01.xcf (GIMP project)
    └── ...
```

**Why:**
- Easy to update annotations without recapturing
- Maintain consistency when refreshing
- Preserve layer structure for future edits

---

## Quick Reference: Common Annotations

| Scenario | Annotation Style | Example |
|----------|------------------|---------|
| **Clickable button** | Red highlight box + numbered callout | Upload button with "1" |
| **Sequence of steps** | Numbered callouts (1, 2, 3) + arrows | Drag-drop sequence |
| **Success state** | Green checkmarks + labels | Grid loaded successfully |
| **Error message** | Orange highlight box + error text | Upload failed error |
| **Hover state** | Dashed outline + "Hover" label | Tooltip appearing |
| **Before/after** | Side-by-side or sequential panels | Empty grid → Populated grid |
| **Multi-panel UI** | Numbered sections + labels | Details/Changes/Stats tabs |
| **Motion/direction** | Curved arrow + motion blur | Employee being dragged |

---

**For questions or clarifications, refer to this guide or consult the documentation team.**

*Screenshot Specifications v1.0 | December 2024 | 9Boxer Documentation*
