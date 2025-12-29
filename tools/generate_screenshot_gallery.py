#!/usr/bin/env python3
"""
Generate Screenshot Gallery HTML

Reads the screenshot config and generates a complete HTML gallery
with descriptions and images in a table format.
"""

import re
import sys
from pathlib import Path


# Read the TypeScript config file and extract screenshot data
def parse_config_ts():
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
    screenshots = {}
    current_key = None
    current_data = {}

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
def organize_by_category(screenshots):
    """Organize screenshots into categories based on path."""
    categories = {
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
def generate_html(screenshots):
    """Generate complete HTML gallery."""
    categories = organize_by_category(screenshots)

    # Count stats
    total = len(screenshots)
    storybook = sum(1 for s in screenshots.values() if s.get("source") == "storybook")
    fullapp = sum(1 for s in screenshots.values() if s.get("source") == "full-app")
    manual = sum(1 for s in screenshots.values() if s.get("manual", False))
    automated = total - manual

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>9Boxer Screenshot Gallery - Complete Registry</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        h1 {{ color: #1976d2; margin-bottom: 10px; font-size: 32px; }}
        .subtitle {{ color: #666; margin-bottom: 30px; font-size: 16px; }}
        .stats {{ background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }}
        .stat {{ text-align: center; }}
        .stat-number {{ font-size: 28px; font-weight: bold; color: #1976d2; }}
        .stat-label {{ font-size: 14px; color: #666; margin-top: 5px; }}
        h2 {{ color: #1976d2; margin-top: 40px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #1976d2; font-size: 24px; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 40px; }}
        thead {{ background: #1976d2; color: white; }}
        th {{ padding: 12px; text-align: left; font-weight: 600; }}
        td {{ padding: 15px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }}
        tbody tr:hover {{ background: #f5f5f5; }}
        .description-cell {{ width: 40%; }}
        .image-cell {{ width: 60%; text-align: center; }}
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
        .note {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin-top: 8px; font-size: 13px; color: #856404; }}
        .category-count {{ color: #999; font-size: 14px; font-weight: normal; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>9Boxer Screenshot Gallery</h1>
        <p class="subtitle">Complete visual registry of all documentation screenshots</p>

        <div class="stats">
            <div class="stat"><div class="stat-number">{total}</div><div class="stat-label">Total Screenshots</div></div>
            <div class="stat"><div class="stat-number">{storybook}</div><div class="stat-label">Storybook ({storybook/total*100:.0f}%)</div></div>
            <div class="stat"><div class="stat-number">{fullapp}</div><div class="stat-label">Full-App ({fullapp/total*100:.0f}%)</div></div>
            <div class="stat"><div class="stat-number">{manual}</div><div class="stat-label">Manual ({manual/total*100:.0f}%)</div></div>
            <div class="stat"><div class="stat-number">{automated}</div><div class="stat-label">Automated ({automated/total*100:.0f}%)</div></div>
        </div>
"""

    # Add each category
    for category, items in categories.items():
        cat_id = category.lower().replace(" ", "-")
        html += f'\n        <h2 id="{cat_id}">{category} <span class="category-count">({len(items)} screenshot{"s" if len(items) > 1 else ""})</span></h2>\n'
        html += '        <table>\n            <thead>\n                <tr>\n                    <th class="description-cell">Description</th>\n                    <th class="image-cell">Screenshot</th>\n                </tr>\n            </thead>\n            <tbody>\n'

        for key, data in items:
            source = data.get("source", "unknown")
            is_manual = data.get("manual", False)
            description = data.get("description", "No description")
            path = data.get("path", "")
            story_id = data.get("storyId", "")

            # Convert path to relative from HTML location
            rel_path = "../../" + path

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

            html += f"""                <tr>
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
            Path(__file__).parent.parent
            / "agent-projects"
            / "screenshot-storybook-migration"
            / "SCREENSHOT_GALLERY.html"
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
