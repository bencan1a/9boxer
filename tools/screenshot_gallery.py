#!/usr/bin/env python3
"""
Generate Interactive Screenshot Gallery

Reads the screenshot config and generates an interactive HTML gallery
with review workflow capabilities:
- Approve/Needs Work toggles for each screenshot
- Notes field for feedback
- localStorage persistence
- Export/Import review data as JSON
- Progress tracking and filtering

Agents can read exported JSON to make corrections and regenerate screenshots.
"""

import re
import sys
from pathlib import Path
from typing import Any


# Read the TypeScript config file and extract screenshot data
def parse_config_ts() -> dict[str, dict[str, Any]]:
    """Parse config.ts and extract screenshot metadata."""
    config_path = (
        Path(__file__).parent.parent / "frontend" / "playwright" / "screenshots" / "config.ts"
    )

    with config_path.open(encoding="utf-8") as f:
        content = f.read()

    # Extract the screenshotConfig object
    match = re.search(
        r"export const screenshotConfig: Record<string, ScreenshotMetadata> = \{(.*?)\};",
        content,
        re.DOTALL,
    )
    if not match:
        raise ValueError("Could not find screenshotConfig in config.ts")

    config_str = match.group(1)

    # Parse each screenshot entry
    screenshots: dict[str, dict[str, Any]] = {}
    current_key = None
    current_data: dict[str, Any] = {}

    # Simple regex-based parsing (not perfect but works for our structured config)
    lines = config_str.split("\n")

    for line in lines:
        line = line.strip()  # noqa: PLW2901

        # Screenshot key
        if line.startswith('"') and '": {' in line:
            if current_key:
                screenshots[current_key] = current_data
            current_key = line.split('"')[1]
            current_data = {}

        # Properties
        elif ": " in line and current_key:
            if line.startswith("source:"):
                current_data["source"] = "storybook" if "storybook" in line else "full-app"
            elif line.startswith("path:"):
                path_match = re.search(r'"(.+?)"', line)
                if path_match:
                    current_data["path"] = path_match.group(1)
            elif line.startswith("description:"):
                desc_match = re.search(r'"(.+?)"', line)
                if desc_match:
                    current_data["description"] = desc_match.group(1)
                else:
                    # Multi-line description
                    desc_match = re.search(r'"(.+)', line)
                    if desc_match:
                        current_data["description"] = desc_match.group(1).rstrip(",").rstrip('"')
            elif line.startswith("manual:"):
                current_data["manual"] = "true" in line.lower()
            elif line.startswith("storyId:"):
                story_match = re.search(r'"(.+?)"', line)
                if story_match:
                    current_data["storyId"] = story_match.group(1)

    # Add last screenshot
    if current_key:
        screenshots[current_key] = current_data

    return screenshots


# Organize screenshots by category
def organize_by_category(
    screenshots: dict[str, dict[str, Any]],
) -> dict[str, list[tuple[str, dict[str, Any]]]]:
    """Organize screenshots into categories based on path."""
    categories: dict[str, list[tuple[str, dict[str, Any]]]] = {
        "Changes Workflow": [],
        "Notes Workflow": [],
        "Filters Workflow": [],
        "Quickstart Workflow": [],
        "Calibration Workflow": [],
        "Intelligence Components": [],
        "Statistics Panel": [],
        "Donut Mode": [],
        "Grid and Basic UI": [],
        "Hero Image": [],
        "Additional Features": [],
        "Zoom Controls": [],
        "ViewControls": [],
        "Details Panel": [],
    }

    for key, data in screenshots.items():
        path = data.get("path", "")

        if "making-changes" in path or key.startswith("changes-"):
            categories["Changes Workflow"].append((key, data))
        elif "workflow-changes-add-note" in path or "notes" in path:
            categories["Notes Workflow"].append((key, data))
        elif "filters/" in path:
            categories["Filters Workflow"].append((key, data))
        elif "quickstart/" in path:
            categories["Quickstart Workflow"].append((key, data))
        elif "calibration" in key or "intelligence-" in key:
            if "intelligence" in key and "calibration" not in key:
                categories["Intelligence Components"].append((key, data))
            else:
                categories["Calibration Workflow"].append((key, data))
        elif "statistics/" in path:
            categories["Statistics Panel"].append((key, data))
        elif "donut/" in path or "donut-mode" in key:
            categories["Donut Mode"].append((key, data))
        elif key in ["grid-normal", "employee-tile-normal"]:
            categories["Grid and Basic UI"].append((key, data))
        elif "hero" in key:
            categories["Hero Image"].append((key, data))
        elif "view-controls" in path:
            categories["ViewControls"].append((key, data))
        elif "details-panel" in path:
            categories["Details Panel"].append((key, data))
        elif "zoom-controls" in path:
            categories["Zoom Controls"].append((key, data))
        else:
            categories["Additional Features"].append((key, data))

    # Remove empty categories
    return {k: v for k, v in categories.items() if v}


# Generate HTML
def generate_html(screenshots: dict[str, dict[str, Any]]) -> str:
    """Generate complete HTML gallery."""
    categories = organize_by_category(screenshots)

    # Count stats
    total = len(screenshots)
    storybook = sum(1 for s in screenshots.values() if s.get("source") == "storybook")
    fullapp = sum(1 for s in screenshots.values() if s.get("source") == "full-app")
    manual = sum(1 for s in screenshots.values() if s.get("manual", False))

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>9Boxer Screenshot Gallery - Interactive Review</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 1600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        h1 {{ color: #1976d2; margin-bottom: 10px; font-size: 32px; }}
        .subtitle {{ color: #666; margin-bottom: 20px; font-size: 16px; }}

        /* Toolbar */
        .toolbar {{ background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }}
        .filter-buttons {{ display: flex; gap: 10px; }}
        .action-buttons {{ display: flex; gap: 10px; }}
        button {{ padding: 8px 16px; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; transition: all 0.2s; }}
        button:hover {{ opacity: 0.8; }}
        .btn-filter {{ background: #e0e0e0; color: #333; }}
        .btn-filter.active {{ background: #1976d2; color: white; }}
        .btn-export {{ background: #4caf50; color: white; }}
        .btn-import {{ background: #ff9800; color: white; }}
        .btn-clear {{ background: #f44336; color: white; }}

        /* Stats */
        .stats {{ background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; }}
        .stat {{ text-align: center; }}
        .stat-number {{ font-size: 28px; font-weight: bold; color: #1976d2; }}
        .stat-label {{ font-size: 14px; color: #666; margin-top: 5px; }}
        .stat.approved .stat-number {{ color: #4caf50; }}
        .stat.needs-work .stat-number {{ color: #f44336; }}
        .stat.unreviewed .stat-number {{ color: #999; }}

        /* Table */
        h2 {{ color: #1976d2; margin-top: 40px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #1976d2; font-size: 24px; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 40px; }}
        thead {{ background: #1976d2; color: white; }}
        th {{ padding: 12px; text-align: left; font-weight: 600; }}
        td {{ padding: 15px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }}
        tbody tr:hover {{ background: #f5f5f5; }}
        tbody tr.hidden {{ display: none; }}
        .description-cell {{ width: 35%; }}
        .image-cell {{ width: 45%; text-align: center; }}
        .review-cell {{ width: 20%; }}

        /* Screenshot info */
        .screenshot-name {{ font-weight: 600; color: #1976d2; font-size: 16px; margin-bottom: 8px; }}
        .screenshot-desc {{ color: #555; margin-bottom: 8px; }}
        .screenshot-meta {{ font-size: 12px; color: #999; margin-top: 8px; }}
        .badge {{ display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 5px; margin-top: 5px; }}
        .badge-storybook {{ background: #4caf50; color: white; }}
        .badge-fullapp {{ background: #ff9800; color: white; }}
        .badge-manual {{ background: #f44336; color: white; }}
        .badge-automated {{ background: #2196f3; color: white; }}
        .screenshot-img {{ max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .screenshot-img:hover {{ box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; }}
        .path {{ font-family: 'Courier New', monospace; font-size: 11px; color: #666; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-top: 5px; }}
        .category-count {{ color: #999; font-size: 14px; font-weight: normal; }}

        /* Review controls */
        .review-controls {{ display: flex; flex-direction: column; gap: 10px; }}
        .status-buttons {{ display: flex; gap: 8px; }}
        .status-btn {{ padding: 6px 12px; border: 2px solid #e0e0e0; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; }}
        .status-btn:hover {{ border-color: #999; }}
        .status-btn.approved {{ background: #4caf50; color: white; border-color: #4caf50; }}
        .status-btn.needs-work {{ background: #f44336; color: white; border-color: #f44336; }}
        .status-icon {{ margin-right: 4px; }}
        .notes-field {{ width: 100%; min-height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-family: inherit; resize: vertical; }}
        .notes-field:focus {{ outline: none; border-color: #1976d2; }}
        .review-timestamp {{ font-size: 11px; color: #999; margin-top: 5px; }}

        /* Hidden file input */
        #importFileInput {{ display: none; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>9Boxer Screenshot Gallery</h1>
        <p class="subtitle">Interactive review tool for documentation screenshots</p>

        <!-- Toolbar -->
        <div class="toolbar">
            <div class="filter-buttons">
                <button class="btn-filter active" onclick="filterScreenshots('all')">All</button>
                <button class="btn-filter" onclick="filterScreenshots('approved')">Approved</button>
                <button class="btn-filter" onclick="filterScreenshots('needs-work')">Needs Work</button>
                <button class="btn-filter" onclick="filterScreenshots('unreviewed')">Unreviewed</button>
            </div>
            <div class="action-buttons">
                <button class="btn-export" onclick="exportReviews()">Export Reviews (JSON)</button>
                <button class="btn-import" onclick="document.getElementById('importFileInput').click()">Import Reviews</button>
                <button class="btn-clear" onclick="clearAllReviews()">Clear All Reviews</button>
            </div>
        </div>
        <input type="file" id="importFileInput" accept=".json" onchange="importReviews(event)">

        <!-- Stats -->
        <div class="stats">
            <div class="stat"><div class="stat-number">{total}</div><div class="stat-label">Total Screenshots</div></div>
            <div class="stat approved"><div class="stat-number" id="stat-approved">0</div><div class="stat-label">Approved</div></div>
            <div class="stat needs-work"><div class="stat-number" id="stat-needs-work">0</div><div class="stat-label">Needs Work</div></div>
            <div class="stat unreviewed"><div class="stat-number" id="stat-unreviewed">{total}</div><div class="stat-label">Unreviewed</div></div>
            <div class="stat"><div class="stat-number">{storybook}</div><div class="stat-label">Storybook</div></div>
            <div class="stat"><div class="stat-number">{fullapp}</div><div class="stat-label">Full-App</div></div>
        </div>
"""

    # Add each category
    for category, items in categories.items():
        cat_id = category.lower().replace(" ", "-")
        html += f'\n        <h2 id="{cat_id}">{category} <span class="category-count">({len(items)} screenshot{"s" if len(items) > 1 else ""})</span></h2>\n'
        html += '        <table>\n            <thead>\n                <tr>\n                    <th class="description-cell">Description</th>\n                    <th class="image-cell">Screenshot</th>\n                    <th class="review-cell">Review</th>\n                </tr>\n            </thead>\n            <tbody>\n'

        for key, data in items:
            source = data.get("source", "unknown")
            is_manual = data.get("manual", False)
            description = data.get("description", "No description")
            path = data.get("path", "")
            story_id = data.get("storyId", "")

            # Convert path to relative from HTML location (resources/user-guide/)
            # Path format: resources/user-guide/docs/images/screenshots/...
            rel_path = path.replace("resources/user-guide/", "")

            # Badges
            source_badge = (
                '<span class="badge badge-storybook">Storybook</span>'
                if source == "storybook"
                else '<span class="badge badge-fullapp">Full-App</span>'
            )
            type_badge = (
                '<span class="badge badge-manual">Manual</span>'
                if is_manual
                else '<span class="badge badge-automated">Automated</span>'
            )

            # Story meta
            story_meta = f'<div class="screenshot-meta">Story: {story_id}</div>' if story_id else ""

            # Path display
            path_display = path.replace("resources/user-guide/docs/images/screenshots/", "")

            html += f"""                <tr data-screenshot="{key}" data-status="unreviewed">
                    <td class="description-cell">
                        <div class="screenshot-name">{key}</div>
                        <div class="screenshot-desc">{description}</div>
                        <div>
                            {source_badge}
                            {type_badge}
                        </div>
                        {story_meta}
                        <div class="path">{path_display}</div>
                    </td>
                    <td class="image-cell">
                        <img src="{rel_path}"
                             alt="{key}"
                             class="screenshot-img"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-family=%22Arial%22%3EImage not yet generated%3C/text%3E%3C/svg%3E'">
                    </td>
                    <td class="review-cell">
                        <div class="review-controls">
                            <div class="status-buttons">
                                <button class="status-btn" onclick="setStatus('{key}', 'approved')">
                                    <span class="status-icon">✓</span>Approve
                                </button>
                                <button class="status-btn" onclick="setStatus('{key}', 'needs-work')">
                                    <span class="status-icon">✗</span>Needs Work
                                </button>
                            </div>
                            <textarea class="notes-field"
                                      placeholder="Add review notes..."
                                      onchange="saveNotes('{key}', this.value)"></textarea>
                            <div class="review-timestamp" id="timestamp-{key}"></div>
                        </div>
                    </td>
                </tr>
"""

        html += "            </tbody>\n        </table>\n"

    html += (
        """
        <p style="margin-top: 40px; text-align: center; color: #999; font-size: 14px;">
            Generated: 2025-12-28 | Total: """
        + str(total)
        + """ screenshots ("""
        + str(storybook)
        + """ Storybook, """
        + str(fullapp)
        + """ Full-App, """
        + str(manual)
        + """ Manual)
        </p>
    </div>

    <script>
        // State management
        const STORAGE_KEY = 'screenshot-reviews';
        let reviews = {};
        let currentFilter = 'all';

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadReviews();
            restoreUIState();
            updateStats();
        });

        // Load reviews from localStorage
        function loadReviews() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    reviews = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse reviews:', e);
                    reviews = {};
                }
            }
        }

        // Save reviews to localStorage
        function saveReviews() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        }

        // Restore UI state from reviews
        function restoreUIState() {
            document.querySelectorAll('tr[data-screenshot]').forEach(row => {
                const screenshot = row.dataset.screenshot;
                const review = reviews[screenshot];

                if (review) {
                    // Restore status
                    if (review.status) {
                        setStatusUI(screenshot, review.status);
                    }

                    // Restore notes
                    if (review.notes) {
                        const textarea = row.querySelector('.notes-field');
                        if (textarea) textarea.value = review.notes;
                    }

                    // Restore timestamp
                    if (review.reviewed_at) {
                        const timestamp = row.querySelector(`#timestamp-${screenshot}`);
                        if (timestamp) {
                            const date = new Date(review.reviewed_at);
                            timestamp.textContent = `Reviewed: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                        }
                    }
                }
            });
        }

        // Set status for a screenshot
        function setStatus(screenshot, status) {
            // Initialize review if doesn't exist
            if (!reviews[screenshot]) {
                reviews[screenshot] = { status: 'unreviewed', notes: '', reviewed_at: null };
            }

            // Toggle status (clicking same status clears it)
            if (reviews[screenshot].status === status) {
                reviews[screenshot].status = 'unreviewed';
                reviews[screenshot].reviewed_at = null;
            } else {
                reviews[screenshot].status = status;
                reviews[screenshot].reviewed_at = new Date().toISOString();
            }

            saveReviews();
            setStatusUI(screenshot, reviews[screenshot].status);
            updateStats();
            applyFilter();

            // Update timestamp
            const timestamp = document.querySelector(`#timestamp-${screenshot}`);
            if (timestamp) {
                if (reviews[screenshot].status !== 'unreviewed') {
                    const date = new Date(reviews[screenshot].reviewed_at);
                    timestamp.textContent = `Reviewed: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                } else {
                    timestamp.textContent = '';
                }
            }
        }

        // Update UI for status
        function setStatusUI(screenshot, status) {
            const row = document.querySelector(`tr[data-screenshot="${screenshot}"]`);
            if (!row) return;

            // Update row data attribute
            row.dataset.status = status;

            // Update button styles
            const buttons = row.querySelectorAll('.status-btn');
            buttons.forEach(btn => {
                btn.classList.remove('approved', 'needs-work');
            });

            if (status === 'approved') {
                buttons[0].classList.add('approved');
            } else if (status === 'needs-work') {
                buttons[1].classList.add('needs-work');
            }
        }

        // Save notes for a screenshot
        function saveNotes(screenshot, notes) {
            if (!reviews[screenshot]) {
                reviews[screenshot] = { status: 'unreviewed', notes: '', reviewed_at: null };
            }

            reviews[screenshot].notes = notes;
            saveReviews();
        }

        // Update statistics
        function updateStats() {
            let approved = 0;
            let needsWork = 0;
            let unreviewed = 0;

            document.querySelectorAll('tr[data-screenshot]').forEach(row => {
                const screenshot = row.dataset.screenshot;
                const review = reviews[screenshot];
                const status = review ? review.status : 'unreviewed';

                if (status === 'approved') approved++;
                else if (status === 'needs-work') needsWork++;
                else unreviewed++;
            });

            document.getElementById('stat-approved').textContent = approved;
            document.getElementById('stat-needs-work').textContent = needsWork;
            document.getElementById('stat-unreviewed').textContent = unreviewed;
        }

        // Filter screenshots
        function filterScreenshots(filter) {
            currentFilter = filter;

            // Update button styles
            document.querySelectorAll('.btn-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            applyFilter();
        }

        // Apply current filter
        function applyFilter() {
            document.querySelectorAll('tr[data-screenshot]').forEach(row => {
                const screenshot = row.dataset.screenshot;
                const review = reviews[screenshot];
                const status = review ? review.status : 'unreviewed';

                if (currentFilter === 'all') {
                    row.classList.remove('hidden');
                } else if (currentFilter === status) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });
        }

        // Export reviews as JSON
        function exportReviews() {
            const dataStr = JSON.stringify(reviews, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `screenshot-reviews-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`Exported ${Object.keys(reviews).length} reviews to JSON file.\\n\\nAgents can read this file to make corrections and regenerate screenshots.`);
        }

        // Import reviews from JSON
        function importReviews(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const imported = JSON.parse(e.target.result);

                    // Merge imported reviews with existing
                    if (confirm(`Import ${Object.keys(imported).length} reviews?\\n\\nThis will merge with existing reviews (imported reviews will overwrite conflicts).`)) {
                        reviews = { ...reviews, ...imported };
                        saveReviews();
                        restoreUIState();
                        updateStats();
                        applyFilter();
                        alert('Reviews imported successfully!');
                    }
                } catch (err) {
                    alert('Error importing reviews: ' + err.message);
                }
            };
            reader.readAsText(file);

            // Reset input so same file can be imported again
            event.target.value = '';
        }

        // Clear all reviews
        function clearAllReviews() {
            if (confirm('Clear all reviews? This cannot be undone.')) {
                reviews = {};
                saveReviews();

                // Reset UI
                document.querySelectorAll('tr[data-screenshot]').forEach(row => {
                    row.dataset.status = 'unreviewed';
                    const buttons = row.querySelectorAll('.status-btn');
                    buttons.forEach(btn => btn.classList.remove('approved', 'needs-work'));
                    const textarea = row.querySelector('.notes-field');
                    if (textarea) textarea.value = '';
                    const timestamp = row.querySelector('[id^="timestamp-"]');
                    if (timestamp) timestamp.textContent = '';
                });

                updateStats();
                alert('All reviews cleared!');
            }
        }
    </script>
</body>
</html>
"""
    )

    return html


if __name__ == "__main__":
    try:
        screenshots = parse_config_ts()
        html = generate_html(screenshots)

        output_path = (
            Path(__file__).parent.parent / "resources" / "user-guide" / "SCREENSHOT_GALLERY.html"
        )
        output_path.write_text(html, encoding="utf-8")

        print(f"[OK] Generated screenshot gallery: {output_path}")
        print(f"  Total screenshots: {len(screenshots)}")
        print(
            f"  Storybook: {sum(1 for s in screenshots.values() if s.get('source') == 'storybook')}"
        )
        print(
            f"  Full-App: {sum(1 for s in screenshots.values() if s.get('source') == 'full-app')}"
        )
        print(f"  Manual: {sum(1 for s in screenshots.values() if s.get('manual', False))}")

    except Exception as e:
        print(f"Error generating gallery: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
