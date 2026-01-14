# Contributing to Internal Documentation

This guide is for AI agents contributing to internal developer documentation.

**For human contributors:** See [CONTRIBUTING.md](../../CONTRIBUTING.md) for Git workflow and PR process.

---

## Documentation Guides

Quick navigation to specialized guides:

- **[Documentation Writing Guide](documentation-writing-guide.md)** - Comprehensive standards for user-facing documentation
- **[Voice & Tone Guide](voice-and-tone-guide.md)** - Style reference for conversational, engaging writing
- **[Screenshot Guide](screenshot-guide.md)** - Technical screenshot standards (format, resolution, annotation)
- **[User Personas](user-personas.md)** - Target audience understanding (5 detailed personas)

---

## Agent Documentation Standards

When writing or updating internal developer documentation (files in `internal-docs/`):

### Core Principles

1. **Agent-Optimized Language**
   - Use present tense, active voice
   - Write actionable commands (not suggestions)
   - Avoid unnecessary prose
   - Include actual file paths from codebase

2. **Document Current State Only**
   - Focus on "how it works now"
   - No migration history in permanent docs
   - Agents have no memory of past implementations
   - Add verification dates: "Verified current: YYYY-MM-DD"

3. **Single Source of Truth**
   - One authoritative location per topic
   - No conflicting versions
   - Clear cross-references if related topics span multiple files

4. **Context Efficiency**
   - Keep main entry points <100KB (CLAUDE.md, CONTEXT.md)
   - Group related docs in category folders
   - Provide clear navigation hierarchy

5. **Anti-Proliferation**
   - Update existing docs instead of creating new ones
   - Use `agent-tmp/` for temporary work (auto-deleted after 7 days)
   - Use `agent-projects/<project>/` for ephemeral plans (<21 days)

### Writing Style

**DO:**
- ✅ Use imperative mood: "Run pytest", "Update file", "Verify output"
- ✅ Include copy-pasteable commands with full paths
- ✅ Provide real examples from actual codebase
- ✅ Cross-reference related internal docs
- ✅ Keep paragraphs short (2-3 sentences max)

**DON'T:**
- ❌ Use passive voice: "Tests should be run"
- ❌ Use vague suggestions: "You might want to consider..."
- ❌ Reference removed features or obsolete code
- ❌ Duplicate content from other internal docs

### Example Transformations

**❌ BAD (passive, vague):**
```markdown
The testing documentation can be found in the testing folder where various
testing strategies and patterns are discussed that developers might find
useful when writing new tests.
```

**✅ GOOD (active, specific):**
```markdown
Read [internal-docs/testing/test-principles.md](../testing/test-principles.md)
for core testing philosophy. Run tests with `pytest backend/tests/unit/`.
```

---

## User Documentation Standards

When writing or updating user-facing documentation (files in `resources/user-guide/docs/`):

### Required Reading

**BEFORE writing user documentation, read these guides:**

1. **[Voice & Tone Guide](voice-and-tone-guide.md)** - Writing style quick reference
   - Second person ("you", "your")
   - Contractions ("you'll", "don't")
   - Active voice, conversational tone
   - Short paragraphs (2-3 sentences max)

2. **[Documentation Writing Guide](documentation-writing-guide.md)** - Complete standards
   - Content structure patterns (home page, getting started, features)
   - Accessibility requirements (WCAG 2.1 Level AA)
   - Readability targets (Flesch Reading Ease >60)
   - Visual standards (screenshots, annotations)

3. **[Screenshot Guide](screenshot-guide.md)** - Technical specifications
   - Format: PNG, 2400px width (2x for retina)
   - Annotation standards (colors, callouts, arrows)
   - Screenshot types and when to use them
   - Quality checklist

### Workflow

1. **Test workflows in actual application** before documenting
2. **Write documentation** following voice & tone guide
3. **Generate/update screenshots** using automation system
4. **Validate accessibility** (alt text, heading hierarchy, descriptive link text)
5. **Check readability** (target Flesch Reading Ease >60)

### Quality Bar

All user documentation must achieve:
- Voice & Tone compliance: 95%+
- Technical accuracy (validated against app): 95%+
- Accessibility: WCAG 2.1 Level AA
- Readability: Flesch Reading Ease >60 (conversational)

---

## Screenshot Automation & Testing

**User documentation screenshot automation** is managed by the self-managing docs system (Issues #51-62).

### Quick Reference

**Generate screenshots:**
```bash
cd frontend
npm run screenshots:generate              # All screenshots
npm run screenshots:generate grid-normal  # Specific screenshot
HEADLESS=false npm run screenshots:generate  # Show browser
```

**For detailed automation guides:**
- `frontend/playwright/screenshots/HOWTO.md` - Complete automation guide
- `frontend/playwright/screenshots/config.ts` - Screenshot registry
- `frontend/playwright/screenshots/workflows/` - Generation functions
- `frontend/playwright/visual-regression/README.md` - Quality validation

**Technical standards only:**
- [Screenshot Guide](screenshot-guide.md) - Format, resolution, annotation style

---

## Git Workflow for Documentation

**For human contributors:** See [CONTRIBUTING.md](../../CONTRIBUTING.md) for Git/PR workflow.

**For AI agents:** Follow these rules:

1. **Update existing files** instead of creating new ones (anti-proliferation)
2. **Use Edit tool** to preserve formatting and Git history
3. **Test all links** after updates (use relative paths like `../category/file.md`)
4. **Verify commands work** before documenting them
5. **Add verification notes** when updating older content: "Verified current: YYYY-MM-DD"

---

## Trust Hierarchy

When information conflicts, use this priority order:

1. **[facts.json](../facts.json)** - Highest authority, hand-maintained project truths
2. **Permanent content in internal-docs/** - Established documentation
3. **Active plans summaries** - Hints only, not authoritative

---

## Related Documentation

- **[CLAUDE_INDEX.md](../../CLAUDE_INDEX.md)** - Main agent entry point
- **[AGENTS.md](../../AGENTS.md)** - Quick reference for common commands
- **[AGENT_DOCS_CONTRACT.md](../AGENT_DOCS_CONTRACT.md)** - Documentation system rules
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - Git workflow and PR process (for humans)

---

*Last Updated: December 2024*
*Maintained by: 9Boxer Documentation Team*
