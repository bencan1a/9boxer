# Screenshot Gallery Tool

## Overview

The interactive screenshot gallery tool generates a comprehensive HTML gallery for reviewing and managing all 58 documentation screenshots.

## Location

- **Script**: `tools/screenshot_gallery.py`
- **Output**: `resources/user-guide/SCREENSHOT_GALLERY.html` (168KB)

## Features

### 1. Interactive Review Workflow
- **Approve/Needs Work buttons** for each screenshot
- **Notes field** to add specific feedback
- **Timestamp tracking** for when reviews are made
- **Auto-save** to browser localStorage (reviews persist across sessions)

### 2. Filtering
- Filter by status: All, Approved, Needs Work, Unreviewed
- Real-time filtering without page reload

### 3. Progress Tracking
- Live statistics showing:
  - Total screenshots (58)
  - Approved count
  - Needs work count
  - Unreviewed count
  - Storybook/Full-App breakdown

### 4. Export/Import
- **Export Reviews (JSON)**: Download reviews for agent analysis
- **Import Reviews**: Restore previous review sessions
- **Clear All Reviews**: Reset all review data

## Usage

### Generate Gallery

```bash
# From project root
.venv\Scripts\activate  # Windows
# or
. .venv/bin/activate    # Linux/macOS

python tools/screenshot_gallery.py
```

**Output**: `resources/user-guide/SCREENSHOT_GALLERY.html`

### Open Gallery

Open `resources/user-guide/SCREENSHOT_GALLERY.html` in any web browser.

### Review Workflow

1. **Review each screenshot**:
   - Click "Approve" if screenshot is correct
   - Click "Needs Work" if changes needed
   - Add notes with specific feedback

2. **Filter screenshots**:
   - Click filter buttons to show only: All, Approved, Needs Work, or Unreviewed

3. **Export reviews**:
   - Click "Export Reviews (JSON)" to download review data
   - Share with agents for automated corrections

4. **Import previous reviews**:
   - Click "Import Reviews" and select a JSON file
   - Reviews will merge with existing data

### Agent Workflow

Agents can use exported review data to make corrections:

1. **Read exported JSON**:
   ```json
   {
     "screenshot-name": {
       "status": "needs-work",
       "notes": "Missing employee labels on grid",
       "reviewed_at": "2025-12-28T18:57:00.000Z"
     }
   }
   ```

2. **Identify issues**: Parse JSON to find screenshots with `status: "needs-work"`

3. **Read notes**: Extract specific feedback from `notes` field

4. **Make corrections**: Update Storybook stories or workflow functions

5. **Regenerate screenshots**:
   ```bash
   cd frontend
   npm run screenshots:generate screenshot-name
   ```

6. **Refresh gallery**: Just reload the HTML (images update automatically)

## JSON Export Format

```json
{
  "screenshot-name": {
    "status": "approved|needs-work|unreviewed",
    "notes": "User feedback text",
    "reviewed_at": "ISO 8601 timestamp"
  }
}
```

**Example**:
```json
{
  "grid-normal": {
    "status": "approved",
    "notes": "Looks good!",
    "reviewed_at": "2025-12-28T18:57:00.000Z"
  },
  "changes-drag-sequence": {
    "status": "needs-work",
    "notes": "Need to show all 3 panels in the sequence",
    "reviewed_at": "2025-12-28T18:58:00.000Z"
  }
}
```

## Auto-Update Behavior

### After Regenerating Screenshots

When you run `npm run screenshots:generate`, the gallery **automatically reflects new screenshots**:
- Images are referenced by relative path
- Just refresh the browser to see updated images
- No need to re-run `screenshot_gallery.py`

### When to Re-run the Script

Only re-run `python tools/screenshot_gallery.py` when:
- Screenshot entries added/removed in `config.ts`
- Screenshot descriptions change
- Categories change

## Storage

- **Reviews**: Stored in browser `localStorage` with key `screenshot-reviews`
- **Location**: Browser-specific, persists across sessions
- **Clear**: Use "Clear All Reviews" button or browser dev tools

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Requires JavaScript enabled and localStorage support.

## Tips

1. **Review in batches**: Use filters to focus on specific categories
2. **Be specific in notes**: Help agents understand exact changes needed
3. **Export regularly**: Save review progress as JSON backup
4. **Share reviews**: Export and share JSON with team or agents
5. **Track progress**: Watch stats update in real-time as you review

## Troubleshooting

### Reviews not saving
- Check browser localStorage is enabled
- Check browser console for errors
- Try "Export Reviews" to backup before clearing browser data

### Images not loading
- Verify screenshots exist at `resources/user-guide/docs/images/screenshots/`
- Run `npm run screenshots:generate` to generate missing images
- Check browser console for 404 errors

### Import not working
- Verify JSON file format matches expected structure
- Check for valid JSON syntax (use JSON validator)
- Ensure file has `.json` extension

## Related Files

- **Config**: `frontend/playwright/screenshots/config.ts` - Screenshot metadata
- **Workflows**: `frontend/playwright/screenshots/workflows/` - Generation functions
- **Output**: `resources/user-guide/docs/images/screenshots/` - Generated images
