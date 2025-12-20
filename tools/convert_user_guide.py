#!/usr/bin/env python3
"""
Convert USER_GUIDE.md to resources/USER_GUIDE.html with proper styling.

This script reads the markdown user guide and converts it to a standalone
HTML file with embedded CSS styling for use in the Electron application.
"""

import re
from pathlib import Path


def _process_lists(lines: list[str]) -> list[str]:  # noqa: PLR0912
    """
    Process markdown lists and convert them to HTML.

    Args:
        lines: List of text lines to process

    Returns:
        List of HTML lines with lists converted

    Note:
        This function has many branches due to state machine logic for list parsing.
        Each branch handles a specific case (unordered list, ordered list, paragraph, etc.).
    """
    in_list = False
    result = []
    for line in lines:
        if re.match(r"^- ", line):
            if not in_list:
                result.append("<ul>")
                in_list = True
            result.append("<li>" + line[2:] + "</li>")
        elif re.match(r"^\d+\. ", line):
            if not in_list:
                result.append("<ol>")
                in_list = True
            result.append("<li>" + re.sub(r"^\d+\. ", "", line) + "</li>")
        else:
            if in_list:
                if result and "<ul>" in result[-2:]:
                    result.append("</ul>")
                elif result and "<ol>" in result[-2:]:
                    result.append("</ol>")
                in_list = False
            if line.strip():
                result.append("<p>" + line + "</p>")
            else:
                result.append("")

    if in_list:
        if "<ul>" in result[-2:]:
            result.append("</ul>")
        else:
            result.append("</ol>")

    return result


def markdown_to_html(markdown_text: str) -> str:
    """
    Convert markdown text to HTML with basic formatting.

    Args:
        markdown_text: Markdown-formatted text

    Returns:
        HTML-formatted text with basic styling
    """
    html = markdown_text

    # Convert headers
    html = re.sub(r"^# (.+)$", r'<h1 id="\1">\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r"^## (.+)$", r'<h2 id="\1">\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r"^### (.+)$", r"<h3>\1</h3>", html, flags=re.MULTILINE)
    html = re.sub(r"^#### (.+)$", r"<h4>\1</h4>", html, flags=re.MULTILINE)

    # Convert horizontal rules
    html = re.sub(r"^---$", r"<hr />", html, flags=re.MULTILINE)

    # Convert bold
    html = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html)

    # Convert code blocks
    html = re.sub(r"```(\w+)?\n(.*?)```", r"<pre><code>\2</code></pre>", html, flags=re.DOTALL)

    # Convert inline code
    html = re.sub(r"`([^`]+)`", r"<code>\1</code>", html)

    # Convert lists by processing lines
    lines = html.split("\n")
    result = _process_lists(lines)
    html = "\n".join(result)

    # Clean up multiple consecutive p tags
    html = re.sub(r"<p>\s*</p>", "", html)

    return html


def generate_html(content: str) -> str:
    """
    Generate complete HTML document with styling.

    Args:
        content: HTML content body

    Returns:
        Complete HTML document
    """
    template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>9Boxer - User Guide</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}

        h1 {{
            color: #1976d2;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 2.5em;
        }}

        h2 {{
            color: #1976d2;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.8em;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
        }}

        h3 {{
            color: #424242;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.4em;
        }}

        h4 {{
            color: #616161;
            margin-top: 15px;
            margin-bottom: 8px;
            font-size: 1.1em;
        }}

        p {{
            margin-bottom: 12px;
        }}

        ul, ol {{
            margin-left: 25px;
            margin-bottom: 15px;
        }}

        li {{
            margin-bottom: 8px;
        }}

        code {{
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}

        pre {{
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 15px;
        }}

        pre code {{
            background: none;
            padding: 0;
        }}

        strong {{
            font-weight: 600;
            color: #212121;
        }}

        hr {{
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 30px 0;
        }}

        a {{
            color: #1976d2;
            text-decoration: none;
        }}

        a:hover {{
            text-decoration: underline;
        }}

        @media print {{
            body {{
                background: white;
                padding: 0;
            }}

            .container {{
                box-shadow: none;
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
{content}
    </div>
</body>
</html>"""

    return template.format(content=content)


def main() -> None:
    """Main function to convert USER_GUIDE.md to resources/USER_GUIDE.html."""
    # Get paths
    project_root = Path(__file__).parent.parent
    md_path = project_root / "USER_GUIDE.md"
    html_path = project_root / "resources" / "USER_GUIDE.html"

    # Ensure resources directory exists
    html_path.parent.mkdir(exist_ok=True)

    # Read markdown
    print(f"Reading {md_path}...")
    with md_path.open(encoding="utf-8") as f:
        markdown_content = f.read()

    # Convert to HTML
    print("Converting markdown to HTML...")
    html_content = markdown_to_html(markdown_content)

    # Generate complete document
    full_html = generate_html(html_content)

    # Write output
    print(f"Writing to {html_path}...")
    with html_path.open("w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"[OK] Successfully generated {html_path}")
    print(f"  Size: {len(full_html):,} bytes")


if __name__ == "__main__":
    main()
