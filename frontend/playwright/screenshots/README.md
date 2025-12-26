# Screenshot Generator

Automated documentation screenshot generation for 9Boxer.

## Quick Reference

**Choose your screenshot method:**
- **Storybook** - For isolated component screenshots (faster, more reliable)
- **Full-App** - For workflows and multi-component interactions

📖 **Complete instructions**: [HOWTO.md](./HOWTO.md) - **Read this first** when adding new screenshots

## Quick Start

```bash
# Generate all screenshots
npm run screenshots:generate

# Generate specific screenshots
npm run screenshots:generate employee-tile-normal changes-tab

# Run in headed mode (show browser)
HEADLESS=false npm run screenshots:generate
```

## Adding New Screenshots

📖 **See [HOWTO.md](./HOWTO.md)** for complete instructions on:
- When to use Storybook vs Full-App
- Step-by-step creation guide
- Available helper functions
- Troubleshooting tips

## Directory Structure

```
screenshots/
├── config.ts                     # Screenshot registry
├── generate.ts                   # Main CLI
├── storybook-screenshot.ts       # Storybook utilities (NEW)
├── workflows/
│   ├── storybook-components.ts   # Component screenshots via Storybook (NEW)
│   ├── quickstart.ts             # Quickstart workflow
│   ├── calibration.ts            # Calibration workflow
│   ├── changes.ts                # Changes workflow
│   └── ...                       # Other workflows
├── HOWTO.md                      # Complete instructions (READ THIS)
├── README.md                     # This file
└── MANUAL_SCREENSHOTS.md         # Manual screenshot guide
```

## Screenshot Types

**Automated (31 total):**
- **Storybook** (6): Component screenshots - employee tiles, panels, controls
- **Full-App** (25): Workflow screenshots - quickstart, calibration, filters, export

**Manual (8 total):**
- Excel file views
- Multi-panel compositions
- Annotated screenshots

See [config.ts](./config.ts) for complete list.

## Automation

Screenshots are regenerated automatically:
- **Weekly**: Mondays at 2 AM UTC
- **Manual**: Via GitHub Actions workflow_dispatch
- **Auto-commit**: Changes committed with `[skip ci]`

See `.github/workflows/screenshots.yml`

## Troubleshooting

Common issues and solutions in [HOWTO.md](./HOWTO.md#troubleshooting):
- Storybook server not starting
- Backend executable not found
- Story ID not found
- Screenshot appears empty

## Related Files

- **Complete Guide**: [HOWTO.md](./HOWTO.md) ← **Start here**
- **Config Registry**: [config.ts](./config.ts)
- **Storybook Utils**: [storybook-screenshot.ts](./storybook-screenshot.ts)
- **Manual Guide**: [MANUAL_SCREENSHOTS.md](./MANUAL_SCREENSHOTS.md)
- **E2E Helpers**: `../helpers/`
