# Screenshot Specifications for index.md (Home Page)

**Created:** 2024-12-20
**Purpose:** Define required screenshots for the revised home page
**Total Screenshots:** 2

---

## Screenshot 1: Hero Grid Sample

**Filename:** `hero-grid-sample.png`

**Purpose:** Welcome/hero image showing a populated 9-box grid with sample employees

**UI State to Capture:**
- 9Boxer application open with sample data loaded
- Grid fully populated with employee tiles distributed across all 9 boxes
- At least 15-20 employees visible
- Professional, clean appearance (no filters active, no employees selected)
- Standard theme (light mode preferred for welcoming feel)
- Full grid view (not expanded into any particular box)

**Annotations Needed:**
- No annotations - this is a clean hero image
- Should look welcoming and professional
- Shows the "at a glance" value proposition

**Recommended Setup:**
1. Load `Sample_People_List.xlsx` from resources
2. Ensure good distribution (some employees in each section)
3. No filters active (no orange dot on Filters button)
4. No employees selected (right panel closed or on Statistics tab)
5. Capture full grid area

**Alt Text:**
```
Sample 9-box grid showing employees organized by performance and potential
```

**Technical Specs:**
- Format: PNG
- Resolution: 2400px width minimum
- Aspect ratio: 16:10 or 16:9 (landscape)
- File size target: < 500KB (optimized)

**Priority:** HIGH - This is the first visual impression for new users

---

## Screenshot 2: Your Grid in 2 Minutes Preview

**Filename:** `index-quick-win-preview.png`

**Purpose:** Visual preview showing "You'll have your grid in 2 minutes" - same as hero but with success indicators

**UI State to Capture:**
- Same populated grid as Screenshot 1
- Could be identical or similar view
- Focus on showing successful outcome state

**Annotations Needed:**
- Green checkmark callout pointing to the grid: "Your team visualized"
- Green checkmark callout pointing to employee count: "15 employees loaded"
- Green checkmark callout pointing to a populated box: "Everyone positioned automatically"
- Optional: Green success border or glow around entire grid
- Text overlay in corner: "✅ Success in 2 minutes!"

**Recommended Setup:**
1. Use same state as Screenshot 1 (or identical screenshot)
2. Add annotations in post-processing:
   - 3 green checkmarks (✅ or green circle with checkmark icon)
   - White text on semi-transparent green background
   - Clean, not cluttered

**Alt Text:**
```
Annotated grid showing successful upload with checkmarks highlighting: populated grid, employee count, and automatic positioning
```

**Technical Specs:**
- Format: PNG
- Resolution: 2400px width minimum
- Aspect ratio: 16:10 or 16:9 (landscape)
- File size target: < 500KB (optimized)
- Annotation colors:
  - Checkmarks: Green (#4CAF50 or similar)
  - Text: White with 60% black background or green background
  - Success border (if used): 4px green (#4CAF50)

**Priority:** MEDIUM - Enhances the "quick win" messaging

**Note:** This screenshot could potentially be created by annotating Screenshot 1, eliminating the need for a separate capture.

---

## Alternative: Consider Reusing from quickstart.md

**Option:** If screenshots for `quickstart.md` include a success state image (like `quickstart-success-annotated.png`), we could reuse that for the home page preview.

**Decision needed:** Should we create home-specific screenshots or reuse from quickstart?

**Recommendation:**
- Screenshot 1 (Hero): Create new, clean, professional hero image (no annotations)
- Screenshot 2 (Preview): Could reuse `quickstart-success-annotated.png` if available, or create simplified version

---

## Screenshot Annotation Standards

Reference: `agent-projects/documentation-redesign/screenshot-specifications.md`

**Highlight boxes:** Red, 3px border, no fill
**Callout circles:** Blue (#1976D2), 40px diameter for numbers
**Success indicators:** Green (#4CAF50), checkmark icon or ✅
**Text labels:** 16px Roboto, white text on 60% black background
**Arrows:** Red, 4px width, simple arrowhead

---

## Implementation Notes

**Tools:**
- Screenshot capture: `tools/generate_docs_screenshots.py`
- Annotation: Can be done in script or via image editor (e.g., GIMP, Photoshop, Figma)

**Test Data:**
- Use `Sample_People_List.xlsx` from `resources/` folder
- Ensure realistic names and good distribution
- No sensitive or identifiable data

**Storage:**
- Save to: `internal-docs/images/screenshots/`
- Naming: Use exact filenames specified above
- Also update any image manifests or indexes

---

## Validation Checklist

Before considering screenshots complete:

- [ ] Screenshot 1: Clean hero image with no annotations
- [ ] Screenshot 1: Professional appearance, good distribution
- [ ] Screenshot 1: Proper resolution (2400px+ width)
- [ ] Screenshot 1: Optimized file size (< 500KB)
- [ ] Screenshot 1: Descriptive alt text added to index.md
- [ ] Screenshot 2: Success indicators annotated clearly
- [ ] Screenshot 2: Annotations follow style guide
- [ ] Screenshot 2: File size optimized
- [ ] Screenshot 2: Alt text added to index.md
- [ ] Both images render correctly in MkDocs build
- [ ] Images are accessible (alt text, contrast, clarity)

---

**Next Steps:**
1. Run screenshot generation script or manually capture
2. Annotate Screenshot 2 per specifications
3. Optimize file sizes
4. Place in `internal-docs/images/screenshots/`
5. Verify rendering in MkDocs preview
6. Update this document with completion status
