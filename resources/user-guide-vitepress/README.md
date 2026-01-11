# 9Boxer User Guide - VitePress

This directory contains the VitePress-based user documentation for 9Boxer (proof of concept for migration from MkDocs).

## Status: Proof of Concept ✅

This is a working POC demonstrating VitePress as an alternative to MkDocs. Currently contains 3 sample pages:
- `index.md` - Home page with hero layout
- `quickstart.md` - 2-minute quickstart guide
- `overview.md` - Overview page

See [MIGRATION_POC_FINDINGS.md](./MIGRATION_POC_FINDINGS.md) for full comparison and migration plan.

## Quick Start

### Development Server
```bash
# From project root or frontend/
npm run docs:dev:vitepress

# Or from this directory
npm run dev
```

Opens at: http://localhost:38081

### Build Documentation
```bash
# From project root or frontend/
npm run docs:build:vitepress

# Or from this directory
npm run build
```

Output: `site/` directory

### Preview Built Docs
```bash
# From project root or frontend/
npm run docs:preview:vitepress

# Or from this directory
npm run preview
```

Opens at: http://localhost:38082

## Directory Structure

```
user-guide-vitepress/
├── docs/                          # Markdown source files
│   ├── .vitepress/
│   │   └── config.ts             # VitePress configuration (TypeScript)
│   ├── public/                   # Static assets (served from root)
│   │   ├── images/               # Screenshots and images
│   │   │   └── screenshots/      # Auto-generated screenshots
│   │   └── stylesheets/          # CSS files
│   │       ├── design-tokens.css # Auto-generated from tokens.ts
│   │       └── extra.css         # Custom overrides
│   ├── index.md                  # Home page
│   ├── quickstart.md             # Quickstart guide
│   └── overview.md               # Overview
├── site/                         # Build output (generated)
├── package.json                  # npm dependencies
├── node_modules/                 # Dependencies (generated)
└── README.md                     # This file
```

## Key Differences from MkDocs

| Aspect | MkDocs | VitePress |
|--------|--------|-----------|
| **Config** | `mkdocs.yml` (YAML) | `.vitepress/config.ts` (TypeScript) |
| **Images** | Relative paths: `images/foo.png` | Absolute paths: `/images/foo.png` |
| **Assets** | `docs/images/` | `docs/public/images/` |
| **Admonitions** | `!!! tip "Title"` | `::: tip Title` |
| **Dev Server** | Port 38080 | Port 38081 |
| **Build Output** | `resources/user-guide/site/` | `resources/user-guide-vitepress/site/` |

## Configuration

The VitePress configuration is in [docs/.vitepress/config.ts](docs/.vitepress/config.ts) and includes:

- Site metadata (title, description)
- Navigation structure (sidebar, nav bar)
- Theme settings (logo, colors, dark mode)
- Search configuration (local search)
- Markdown extensions
- Custom CSS integration

## Adding New Pages

1. Create a new `.md` file in `docs/`
2. Add to sidebar in `docs/.vitepress/config.ts`
3. Use absolute paths for images: `/images/foo.png`
4. Save and dev server will hot-reload

## Image Paths

**Important:** VitePress requires absolute paths from the `public/` directory.

```markdown
<!-- ✅ Correct (VitePress) -->
![Alt text](/images/screenshots/foo.png)

<!-- ❌ Incorrect (MkDocs style) -->
![Alt text](images/screenshots/foo.png)
```

## Custom CSS

Custom styles are loaded in this order:

1. VitePress default theme
2. `public/stylesheets/design-tokens.css` (auto-generated from `frontend/src/theme/tokens.ts`)
3. `public/stylesheets/extra.css` (custom overrides)

To regenerate design tokens:
```bash
cd frontend
npm run generate:docs-tokens
```

## Search

VitePress includes built-in local search powered by MiniSearch. No configuration needed - it indexes all markdown content automatically.

## Dark Mode

Dark mode is enabled by default (matching MkDocs Material). Users can toggle with the button in the nav bar.

Configure in `config.ts`:
```typescript
themeConfig: {
  appearance: 'dark', // 'dark' | 'light' | false
}
```

## Markdown Features

VitePress supports:

- **Containers** (like MkDocs admonitions):
  ```markdown
  ::: tip Optional Title
  This is a tip
  :::

  ::: warning
  This is a warning
  :::

  ::: danger
  This is a danger notice
  :::
  ```

- **Code groups** (tabbed code blocks)
- **Custom containers**
- **GitHub-flavored markdown**
- **Frontmatter** (YAML metadata)

See: https://vitepress.dev/guide/markdown

## Deployment

The static site in `site/` can be:

1. **Bundled in Electron** - Served via `file://` protocol (like MkDocs)
2. **Deployed to static hosting** - GitHub Pages, Netlify, Vercel, etc.
3. **Served from any web server** - The output is plain HTML/CSS/JS

For Electron bundling, ensure `base: './'` is set in config (already configured).

## Migration Status

See [MIGRATION_POC_FINDINGS.md](./MIGRATION_POC_FINDINGS.md) for:
- Full comparison with MkDocs
- Migration checklist
- Estimated effort
- Recommendation

## Resources

- **VitePress Docs**: https://vitepress.dev/
- **VitePress GitHub**: https://github.com/vuejs/vitepress
- **Migration Guide**: [MIGRATION_POC_FINDINGS.md](./MIGRATION_POC_FINDINGS.md)

## Questions?

See [MIGRATION_POC_FINDINGS.md](./MIGRATION_POC_FINDINGS.md) Q&A section or refer to the VitePress documentation.
