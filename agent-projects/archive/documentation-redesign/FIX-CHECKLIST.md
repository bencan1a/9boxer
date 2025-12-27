# Phase 1 Documentation - Fix Checklist

**Created:** December 20, 2024
**Total Estimated Time:** 1-2 hours
**Priority:** Required before user testing

---

## Required Fixes (Before User Testing)

### ✅ Fix 1: Export Terminology Update
**Priority:** ⭐ HIGHEST
**Estimated Time:** 30 minutes
**File:** `internal-docs/getting-started.md`

**Lines to update:** 228-246 (Step 5: Export Your Updated Ratings)

**Current text:**
```markdown
1. **Click the Export button** in the top-right corner

   ![Export button with badge showing "3" changes ready to export]
```

**Updated text:**
```markdown
1. **Open the File menu** (the button that shows your filename)

2. **Click "Apply X Changes to Excel"** in the dropdown
   (The number X shows how many changes you've made)

   ![File menu showing Apply Changes option with badge]
```

**Also update screenshot specification:**
- OLD: `export-button-with-badge.png`
- NEW: `file-menu-apply-changes.png`
- Alt text: "File menu dropdown with 'Apply 3 Changes to Excel' option highlighted"

**Verification:**
- [ ] Text updated
- [ ] Screenshot specification updated
- [ ] No other references to "Export button" in file

---

### ✅ Fix 2: Step 2 Skip Link Anchor
**Priority:** ⭐ HIGH
**Estimated Time:** 5 minutes
**File:** `internal-docs/getting-started.md`

**Line to update:** 5

**Current text:**
```markdown
> **Already did the [2-minute quickstart](quickstart.md)?** Skip to [Step 2: Review Your Distribution](#step-2-review-your-distribution)
```

**Updated text:**
```markdown
> **Already did the [2-minute quickstart](quickstart.md)?** Skip to [Step 2: Review Your Distribution](#step-2-review-your-distribution-3-minutes)
```

**Verification:**
- [ ] Link updated
- [ ] Build MkDocs and test link works
- [ ] Link jumps to correct heading

---

### ✅ Fix 3: Common Tasks Link
**Priority:** ⭐ HIGH
**Estimated Time:** 5 minutes
**File:** `internal-docs/quickstart.md`

**Line to update:** 115

**Current text:**
```markdown
[Jump to specific tasks](index.md#common-tasks)
```

**Updated text (Option 1 - Recommended):**
```markdown
[Jump to specific tasks](index.md#need-specific-help)
```

**OR Updated text (Option 2 - Add anchor to index.md):**
```markdown
[Jump to specific tasks](index.md#choose-your-path)
```

**Verification:**
- [ ] Link updated
- [ ] Build MkDocs and test link works
- [ ] Link jumps to correct section

---

### ✅ Fix 4: Troubleshooting Anchor Links
**Priority:** MEDIUM
**Estimated Time:** 15 minutes
**File:** `internal-docs/getting-started.md`

**Lines to verify:** 319-322

**Current text:**
```markdown
- **Upload failed?** → [Troubleshooting upload errors](troubleshooting.md#upload-issues)
- **Employees not appearing?** → [Check if filters are active](troubleshooting.md#employees-dont-appear)
- **Can't drag employees?** → [Drag and drop troubleshooting](troubleshooting.md#drag-and-drop-issues)
- **Export not working?** → [Export troubleshooting](troubleshooting.md#export-issues)
```

**Action:**
1. Open `internal-docs/troubleshooting.md`
2. Find actual heading names for these sections
3. Update anchor links to match

**Verification:**
- [ ] Opened troubleshooting.md
- [ ] Found correct heading anchors
- [ ] Updated all 4 links
- [ ] Built MkDocs and tested links

---

## Optional Improvements (Nice to Have)

### Fix 5: Add Specific Sample File Paths
**Priority:** LOW
**Estimated Time:** 15 minutes
**File:** `internal-docs/quickstart.md`

**Lines to update:** 32-34

**Current text:**
```markdown
1. Look in your 9Boxer installation folder for `Sample_People_List.xlsx`
2. Or download it from the Help menu inside the app
```

**Updated text:**
```markdown
1. Look for `Sample_People_List.xlsx` in:
   - **Windows:** `C:\Program Files\9Boxer\resources\`
   - **macOS:** `/Applications/9Boxer.app/Contents/Resources/`
   - **Linux:** `/opt/9boxer/resources/`
2. Or open the app and select Help → Download Sample File
```

**Verification:**
- [ ] Paths verified for all OS
- [ ] Text updated
- [ ] Clarity improved

---

### Fix 6: Clean Up Passive Voice
**Priority:** LOW
**Estimated Time:** 5 minutes
**File:** `internal-docs/getting-started.md`

**Line to update:** 59

**Current text:**
```markdown
Your employees appear on the grid, automatically positioned based on their Performance and Potential ratings.
```

**Updated text:**
```markdown
Your employees appear on the grid, positioned automatically by their Performance and Potential ratings.
```

**Verification:**
- [ ] Text updated
- [ ] Voice is now active
- [ ] Meaning unchanged

---

## Verification Steps (After All Fixes)

### 1. Build MkDocs
```bash
mkdocs build
```
**Check for:**
- [ ] No critical errors
- [ ] Screenshot warnings only (expected)
- [ ] Reduced anchor link warnings

### 2. Test All Fixed Links
Open built site in browser (`site/index.html`) and test:
- [ ] Skip to Step 2 link (getting-started.html)
- [ ] Common tasks link (quickstart.html)
- [ ] All 4 troubleshooting links (getting-started.html)

### 3. Review Export Section
- [ ] Read Step 5 in getting-started.md
- [ ] Verify terminology matches UI
- [ ] Check screenshot specification is clear

### 4. Final Content Review
- [ ] Read quickstart.md start to finish
- [ ] Read getting-started.md start to finish
- [ ] Check voice consistency
- [ ] Verify no new issues introduced

---

## Sign-Off

After completing all required fixes (1-4):

- [ ] All 4 required fixes completed
- [ ] MkDocs builds successfully
- [ ] All links tested and working
- [ ] No new issues introduced
- [ ] Ready for user testing

**Completed by:** _______________
**Date:** _______________
**Time spent:** _______________

---

## Next Steps After Fixes

1. ✅ Commit changes to git
2. ✅ Build final MkDocs site
3. ✅ Prepare user testing environment
4. ✅ Recruit 2-3 test participants
5. ✅ Schedule testing sessions
6. ✅ Conduct user testing
7. ✅ Analyze results
8. ✅ Iterate if needed

---

**Questions?** See full review in `phase1-comprehensive-review.md`
