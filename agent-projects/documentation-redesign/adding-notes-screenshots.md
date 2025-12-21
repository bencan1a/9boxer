# Screenshot Specifications: Adding Notes & Documentation

**Task:** 2.3 - Adding Notes & Documentation
**Document:** docs/workflows/adding-notes.md
**Total Screenshots Needed:** 3-4

---

## Screenshot 1: Changes Tab with Note Field Highlighted

**Filename:** `workflow-changes-add-note.png`

**Purpose:** Show users where to add notes after moving an employee

**UI State:**
- Employee selected and right panel open
- Changes tab active (highlighted)
- Note field visible with placeholder "Add notes..."
- One movement shown in the changes list
- Employee details visible above (name, current position)

**Required Annotations:**
- Red box around the Changes tab
- Red box around the Notes text field
- Blue numbered callout "1" pointing to Changes tab: "Switch to Changes tab"
- Blue numbered callout "2" pointing to Notes field: "Type your note here"
- Arrow pointing to movement row showing "from → to" positions

**Sample Data:**
- Employee: Sarah Johnson (or realistic name)
- Movement: Core Performer (5) → High Potential (8)
- Notes field: Empty with placeholder visible

**Alt Text:**
"Changes tab showing movement history with notes field highlighted. The tab displays one employee movement from Core Performer to High Potential, with an empty notes field ready for input."

---

## Screenshot 2: Good Note Example

**Filename:** `workflow-note-good-example.png`

**Purpose:** Demonstrate what a well-written note looks like

**UI State:**
- Changes tab active
- Note field contains a complete, professional note
- Same employee as Screenshot 1 for continuity

**Required Annotations:**
- Green checkmark icon in corner: "✅ Good note example"
- Green highlight or border around the note text
- Optional: Callout bubbles pointing to key elements:
  - "Specific reason" pointing to evidence
  - "Action item" pointing to next steps
  - "Date/context" pointing to time reference

**Sample Data:**
- Employee: Sarah Johnson
- Movement: Core Performer (5) → High Potential (8)
- Note text: "Moved to High Potential based on Q4 2024 leadership demonstrated in cross-functional API project. Successfully managed team of 5 engineers and delivered ahead of schedule. Action: Enroll in leadership development program Q1 2025."

**Alt Text:**
"Changes tab showing a well-written note example. The note includes specific reasons (Q4 leadership in API project), evidence (managed 5 engineers, delivered early), and action items (leadership program enrollment)."

---

## Screenshot 3: Exported Excel with Notes Column

**Filename:** `export-excel-notes-column.png`

**Purpose:** Show users where their notes appear in the exported file

**UI State:**
- Microsoft Excel application open
- Exported file: `modified_sample_data.xlsx`
- Scrolled to show the "9Boxer Change Notes" column
- 3-5 rows visible with some notes filled in
- Other columns visible for context: Employee ID, Worker, Performance, Potential

**Required Annotations:**
- Red box around "9Boxer Change Notes" column header
- Red box around 2-3 example note cells
- Blue callout pointing to header: "Your notes appear here"
- Optional: Yellow highlight on the "Modified in Session" column showing "Yes"

**Sample Data:**
- Row 1: Sarah Johnson - "Moved to High Potential based on Q4 2024 leadership..."
- Row 2: Michael Chen - "Calibration 2024-12: Adjusted rating to match peer consensus..."
- Row 3: Jessica Williams - "Performance improved after completing technical training..."

**Alt Text:**
"Exported Excel file showing the 9Boxer Change Notes column. Three employees have notes documenting their rating changes, visible alongside their updated performance and potential ratings."

---

## Screenshot 4 (Optional): Donut Mode Notes

**Filename:** `workflow-donut-notes-example.png`

**Purpose:** Show that donut mode changes also support notes (mentioned in guide)

**UI State:**
- Changes tab active with two tabs visible: "Regular Changes" and "Donut Changes"
- "Donut Changes" tab selected
- At least one donut movement shown with a note
- Donut icon visible on the tab

**Required Annotations:**
- Red box around "Donut Changes" tab
- Blue callout pointing to tab: "Separate notes for donut mode"
- Red box around donut note field
- Purple/secondary color accent to differentiate from regular changes

**Sample Data:**
- Employee: David Martinez
- Movement: Core Performer (5) → High Potential (8) [in donut mode]
- Note: "Actually High Potential - demonstrated strong technical leadership in Q3. Should be moved out of center box in regular ratings."

**Alt Text:**
"Changes tab showing the Donut Changes sub-tab. One employee has been moved during donut mode validation, with a note explaining why they should be reclassified from the center box."

---

## Technical Requirements

### All Screenshots

**Resolution:** 2400px width minimum (retina quality)
**Format:** PNG with transparency
**Color depth:** 24-bit RGB
**Compression:** Optimized after annotation (target <500KB)

### Annotation Style

**Highlight boxes:** Red (#FF0000), 3px border, no fill
**Callout circles:** Blue (#1976D2), 30px diameter, white text
**Arrows:** Red (#FF0000), 4px wide, simple arrowhead
**Text annotations:** 16px Roboto, white text, black 50% opacity background
**Checkmarks/icons:** Green (#4CAF50) for good examples, Red (#F44336) for bad examples

### Data Privacy

- Use realistic but anonymous employee names
- No real employee IDs or sensitive information
- Blur or mask any confidential data
- Use generic job titles and departments

---

## Capture Method

### Automated (Preferred)
Use `tools/generate_docs_screenshots.py` to capture base screenshots:
- Upload sample data
- Move employees programmatically
- Add notes via API
- Capture screenshot at each state

### Manual Annotation
Use image editing tool (Snagit, GIMP, Photoshop) to add:
- Red boxes and arrows
- Numbered callouts
- Text labels
- Icons/checkmarks

### Excel Screenshot (Manual)
- Export file from actual application
- Open in Excel
- Arrange columns to show relevant data
- Capture with screen capture tool
- Annotate as specified

---

## Integration into Documentation

### Markdown References

**Screenshot 1 (Changes Tab):**
```markdown
![Changes tab showing movement history with notes field highlighted](../images/screenshots/workflow-changes-add-note.png)
```
**Location in doc:** Section "How to Add Notes" → "Method 1: In the Changes Tab"

**Screenshot 2 (Good Example):**
```markdown
![Changes tab showing a well-written note example](../images/screenshots/workflow-note-good-example.png)
```
**Location in doc:** Section "Writing Effective Notes" → "Good Note Examples"

**Screenshot 3 (Excel Export):**
```markdown
![Exported Excel file showing the 9Boxer Change Notes column with example notes](../images/screenshots/export-excel-notes-column.png)
```
**Location in doc:** Section "Viewing Your Notes Later" → "In Your Export"

**Screenshot 4 (Donut Notes - Optional):**
```markdown
![Changes tab showing donut mode notes in separate tab](../images/screenshots/workflow-donut-notes-example.png)
```
**Location in doc:** Section "Special Case: Donut Mode Notes"

---

## Priority

**Critical (Must Have):**
- Screenshot 1: Changes tab with note field
- Screenshot 3: Excel export with notes

**High Priority (Should Have):**
- Screenshot 2: Good note example

**Optional (Nice to Have):**
- Screenshot 4: Donut mode notes

---

## Notes for Screenshot Capture

### Pre-requisites
1. Application running with sample data loaded
2. At least 3 employees moved to create changes
3. Notes added to demonstrate feature
4. Export performed to generate Excel file

### Sequence
1. Capture Changes tab first (Screenshot 1)
2. Add good example note, capture (Screenshot 2)
3. Export to Excel, capture Excel (Screenshot 3)
4. If time permits, activate donut mode and capture (Screenshot 4)

### Quality Checks
- [ ] All text is readable at 100% zoom
- [ ] Annotations don't obscure critical UI elements
- [ ] Colors match 9Boxer app theme (dark mode)
- [ ] File sizes optimized (<500KB each)
- [ ] Alt text written for accessibility
- [ ] Screenshots saved in correct directory (docs/images/screenshots/)

---

**Status:** Specification complete, ready for screenshot capture phase
**Next Step:** Use `tools/generate_docs_screenshots.py` or capture manually
**Dependencies:** Application must be running with sample data
