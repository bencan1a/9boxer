# Tracking Changes and Adding Notes

The **Changes** tab provides a comprehensive tracking system for all employee movements with the ability to add notes explaining your decisions.

## Accessing the Change Tracker

1. **Click the "Changes" tab** in the right panel (second tab after Details)
2. The change tracker displays a table of all employee movements
3. Each row shows one employee who has been moved from their original position

### Change Tracker Views

The change tracker has two modes depending on whether you're using Donut Mode:

**When donut mode is active or donut changes exist:**

- The change tracker shows two tabs: **Regular Changes** and **Donut Changes**
- **Regular Changes** tab displays normal employee movements
- **Donut Changes** tab displays donut exercise placements (see [Donut Mode Exercise](donut-mode.md))
- Tab badges show the count of changes in each category
- Click between tabs to view regular or donut changes

**When donut mode is inactive and no donut changes exist:**

- The change tracker shows a single list of regular changes (original behavior)
- No tabs are displayed for a cleaner interface

<!-- Screenshot placeholder -->
!!! example "Screenshot Placeholder"
    **Change tracker with separate Regular and Donut tabs**

    _(Screenshot to be added: Changes panel showing both tabs when donut changes exist)_

## Understanding the Change Tracker Table

The table has three columns:

**Employee**
: Shows the employee's full name
: Helps you quickly identify who has been moved

**Movement**
: Visual display showing: "From Position → To Position"
: Uses color-coded chips to show the transition
: Position labels (e.g., "Core Performer [M,M]" → "Star [H,H]")
: Arrow icon between positions for clarity

**Notes**
: Editable text field for each employee
: Document the rationale for the change
: Preserved across sessions and included in Excel export

## How the Change Tracker Works

### Automatic Tracking

When you drag an employee to a new box, an entry is automatically added to the change tracker:

- Each employee appears **only once** in the tracker showing their net change from original position
- If you move an employee multiple times, the tracker updates to show the overall change (from original to current)
- No need to manually create entries - the system tracks everything automatically

### Automatic Removal

The tracker keeps itself clean:

- If you move an employee **back to their original position**, the entry is automatically removed from the tracker
- This keeps the tracker clean, showing only employees who are actually in modified positions
- Makes it easy to see which employees have net changes that will be exported

### Persistence

Changes are saved automatically:

- The change tracker persists when you close and reopen the app (as long as you don't clear the session)
- All changes and notes are preserved until you upload a new file
- Notes are saved automatically as you type them
- No manual save button needed - everything saves in the background

## Adding Notes to Track Your Rationale

Notes help you document why each change was made, which is valuable for:

- Calibration meetings and performance discussions
- Justifying rating changes to management
- Future reference when reviewing decisions
- Compliance and audit trails

### To add a note:

1. **Click in the Notes field** for the employee
2. **Type your explanation** (e.g., "Promoted to manager role in Q4, strong leadership")
3. **Click outside the field or press ++tab++** to save
    - Notes save automatically in the background
    - You can immediately move to the next field without waiting
4. The note is now saved and will be included in your Excel export

### Note Tips

!!! tip "Writing Effective Notes"
    - **Be specific** about the reason (promotion, performance improvement, role change, etc.)
    - **Keep notes concise** but informative
    - **Use consistent terminology** across your team
    - **Support multiple lines** for longer explanations if needed

## Regular Changes vs. Donut Changes

The change tracker separates regular employee movements from donut exercise placements to maintain data integrity.

| Aspect | Regular Changes | Donut Changes |
|--------|----------------|---------------|
| **Purpose** | Track actual rating changes | Track donut exercise placements |
| **When visible** | Always (when changes exist) | Only when donut mode active or donut data exists |
| **Impact on ratings** | Updates actual Performance/Potential | No impact on actual ratings |
| **Export behavior** | Updates main rating columns | Separate "Donut Exercise" columns |
| **Notes field** | "9Boxer Change Notes" in export | "Donut Exercise Notes" in export |

See [Donut Mode Exercise](donut-mode.md) for detailed information about donut tracking.

## Empty State

If you haven't moved any employees yet, you'll see:

- An icon and message: "No changes yet"
- Instruction: "Move employees to track changes here"

This reminds you that the change tracker is ready but waiting for you to make employee movements.

## Use Cases

### Talent Calibration Sessions

1. Move employees during the meeting
2. Add notes capturing the discussion and consensus
3. Review the Changes tab to confirm all decisions
4. Export with notes for the record

### Performance Review Cycles

1. Adjust ratings throughout the review period
2. Document the reason for each rating change
3. Reference notes when discussing changes with managers
4. Include notes in the exported file for HR records

### Succession Planning

1. Identify and move high-potential employees
2. Note development plans or promotion timelines
3. Track progress across multiple sessions
4. Export notes for succession planning documentation

### Audit and Compliance

1. Every movement is tracked with who, what, and when
2. Add notes explaining the business justification
3. Export provides complete audit trail
4. Maintain transparency in talent decisions

## Tips for Effective Change Tracking

!!! tip "Best Practices"
    1. **Add notes immediately** - Capture your reasoning while it's fresh
    2. **Be specific** - "Completed leadership training, ready for next level" is better than "Good performance"
    3. **Use consistent language** - Adopt standard phrases for common scenarios
    4. **Review before export** - Check the Changes tab to ensure all notes are complete
    5. **Keep it professional** - Notes may be reviewed by others; maintain professionalism

## What Gets Tracked

The change tracker captures:

- **Employee movements** - From original position to current position
- **Net changes** - Overall change, even if employee was moved multiple times
- **Timestamps** - When each change was made (visible in export)
- **Notes** - Your documented reasoning for each change
- **Regular vs. Donut** - Separate tracking for actual changes vs. exercise placements

## What Doesn't Get Tracked

The tracker intentionally excludes:

- Employees who haven't been moved
- Intermediate positions (if employee moved multiple times)
- Filter changes or view preferences
- Employees moved back to their original position (auto-removed)

## Change History in Export

When you export your changes, the Excel file includes:

### Regular Changes Columns

- **"Modified in Session"** - Shows "Yes" for employees who were moved
- **"Modification Date"** - Timestamp of when each employee was last moved
- **"9Boxer Change Description"** - Formatted description (e.g., "Moved from Core Talent [M,M] to Star [H,H]")
- **"9Boxer Change Notes"** - Your notes explaining the change

### Donut Exercise Columns (if applicable)

- **"Donut Exercise Position"** - Position number from donut exercise
- **"Donut Exercise Label"** - Box label from donut exercise
- **"Donut Exercise Change Description"** - Formatted donut movement description
- **"Donut Exercise Notes"** - Your notes from the donut exercise

See [Exporting Your Changes](exporting.md) for complete export documentation.

## Related Topics

- [Working with Employees](working-with-employees.md) - How to move and select employees
- [Donut Mode Exercise](donut-mode.md) - Special validation exercise with separate tracking
- [Exporting Your Changes](exporting.md) - How change data appears in exports
- [Tips and Best Practices](tips.md) - General workflow recommendations
