# Documentation Contributing Guidelines

This folder contains guides and standards for writing and maintaining 9Boxer user documentation.

## For Documentation Writers

If you're writing or updating documentation for 9Boxer, these guides will help ensure consistency and quality:

### Core Guides

1. **[Documentation Writing Guide](documentation-writing-guide.md)** (40KB)
   - Complete documentation standards for best-in-class user guides
   - Core principles (user-centric organization, quick wins, show don't tell)
   - Content structure patterns (home page, getting started, feature guides)
   - Visual standards (screenshots, annotations)
   - Tone and voice guidelines with examples
   - **Start here** for comprehensive documentation standards

2. **[Voice & Tone Guide](voice-and-tone-guide.md)** (8KB)
   - Quick reference for writing style
   - DO's and DON'Ts checklist
   - Common transformations (passive → active, formal → conversational)
   - Before/after examples
   - Word replacement tables
   - **Use this** for quick lookups while writing

3. **[Screenshot Guide](screenshot-guide.md)** (20KB)
   - Technical specifications (format, resolution, file size)
   - Annotation standards (colors, callouts, arrows)
   - Screenshot types and when to use them
   - Capture workflow and tools
   - Quality checklist
   - **Follow this** when creating or updating screenshots

4. **[User Personas](user-personas.md)** (12KB)
   - 5 detailed user personas (HR Manager, Department Head, etc.)
   - User goals, workflows, and pain points
   - Realistic scenarios and quotes
   - **Reference these** when writing documentation to understand target users

## Key Principles (Quick Summary)

### Voice & Tone
- ✅ Second person ("you", "your")
- ✅ Contractions ("you'll", "don't")
- ✅ Active voice ("Click Upload" not "Upload should be clicked")
- ✅ Short paragraphs (2-3 sentences max)
- ✅ Friendly, encouraging tone
- ❌ No jargon without explanation
- ❌ No condescending language ("simply", "just", "obviously")

### Content Organization
- Organize by user goals, not features
- Progressive disclosure (basics → advanced)
- Include time estimates for tasks
- Add "Success looks like..." sections
- Provide "What's next" navigation

### Screenshots
- 2400px width (2x for retina)
- PNG format, optimized <500KB
- Descriptive alt text (accessibility)
- Consistent annotation style (red boxes, blue callouts)

## For AI Agents

**IMPORTANT:** This project is agent-only. Only AI agents write code and documentation. These guidelines are optimized for agent use.

When writing or revising user documentation, always:

1. **Read the voice & tone guide** to understand writing style
2. **Follow the documentation writing guide** for structure and patterns
3. **Reference the screenshot guide** for technical standards (automation managed by Issues #51-62)
4. **Test workflows** in the actual application before documenting
5. **Validate accessibility** (alt text, heading hierarchy, link text)

**Note:** These guidelines apply to **user-facing documentation** only. For internal developer/agent documentation standards, see the main CLAUDE.md and AGENTS.md files.

## Quality Standards

All documentation must achieve:
- Voice & Tone: 95%+ compliance
- Accessibility: WCAG 2.1 Level AA
- Readability: Flesch Reading Ease >60
- Technical Accuracy: 95%+ validated against app

## Related Documentation

- **[CLAUDE.md](../../CLAUDE.md)** - Main project instructions for AI agents
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - General contribution guidelines
- **[docs/](../)** - Production user documentation

---

*Last Updated: December 2024*
*Maintained by: 9Boxer Documentation Team*
