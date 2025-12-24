# New Feature Development Workflow

You are starting a new feature development workflow. Follow the comprehensive guide in `.github/agents/feature-development.md`.

## Your Workflow

### Phase 1: Discovery & Planning
**Start with clarifying questions** to understand the user's goal:
- What problem are you trying to solve?
- What should the user be able to do when this is complete?
- Are there specific edge cases or constraints I should know about?
- How will you test/validate this feature?
- Are there performance requirements?
- Are there security concerns?
- Will this change existing user workflows?

**Capture** the user's answers to build a clear picture of success.

### Phase 2: Design & Planning
**Propose an implementation approach** based on:
- Existing architecture (Backend: FastAPI + SQLite, Frontend: React + TypeScript)
- Established patterns (see `backend/src/ninebox/` and `frontend/src/`)
- Testing strategy (unit, integration, e2e, performance)
- Documentation needs (user docs, screenshots, architecture docs)

**Get user approval** on the approach before proceeding.

**Document the plan**:
1. Create `agent-projects/<feature-name>/plan.md` with metadata:
   ```yaml
   status: active
   owner: <github-username>
   created: YYYY-MM-DD
   summary:
     - Brief description
     - Key approach
     - Expected impact
   ```
2. Create GitHub issue using the "Feature Development" template
3. Break work into logical sub-tasks

### Phase 3: Implementation
**Implement with tests**, following:
- TDD approach where practical (tests first)
- Type annotations everywhere (params + returns)
- Comprehensive docstrings with examples
- Security best practices (OWASP Top 10)
- Error handling with user-friendly messages
- Code quality standards (ruff, mypy, pyright, bandit)

**Test suites**:
- `backend/tests/unit/` - Fast isolated tests (most new tests)
- `backend/tests/integration/` - Multi-component tests
- `backend/tests/e2e/` - Full frozen executable tests
- `backend/tests/performance/` - Benchmark tests
- `frontend/src/**/*.test.tsx` - Component tests
- `frontend/playwright/e2e/` - E2E tests

### Phase 4: Validation
**Run all quality checks**:
```bash
# Activate venv first
.venv/Scripts/activate  # Windows
# or
. .venv/bin/activate    # Linux/macOS

# Run pre-commit checks
pre-commit run --files <changed-files>

# If issues found:
make fix  # Auto-fix formatting and linting

# Run tests
pytest  # Backend tests
cd frontend && npm test  # Frontend component tests
cd frontend && npm run test:e2e:pw  # E2E tests
```

**Manual validation**:
- Smoke test with user (does it work as expected?)
- Edge case testing (what could go wrong?)
- Cross-platform testing if applicable

### Phase 5: Documentation & Handoff
**Update documentation**:
- User documentation (if user-facing): `resources/user-guide/docs/*.md`
- Screenshots (if UI change): `npm run screenshots:generate`
- Architecture docs (if significant change): `docs/`
- API docs (auto-generated from docstrings)

**Update GitHub issue** with:
- Decisions made and rationale
- Constraints discovered
- Implementation progress and learnings
- Testing notes
- Any blockers or open questions

This ensures future agents can pick up where you left off.

### Phase 6: Review & Merge
**Automated code review**:
- Review for security issues (OWASP Top 10)
- Review for performance issues (N+1 queries, memory leaks)
- Review for edge cases (null checks, error handling)
- Review for maintainability (clear naming, minimal complexity)

**Final steps**:
- Ensure all checklist items complete (in GitHub issue)
- Ensure all CI checks passing
- Request user smoke test and approval
- Mark agent project plan as 'done'
- Create PR linking to GitHub issue
- Merge when user approves

## Key Principles

1. **Conversation over Documentation** - Interactive dialogue, not formal docs
2. **Agent Continuity** - Document for future agents in GitHub issue
3. **Automated Quality** - Pre-commit hooks + CI validation
4. **User Acceptance** - User decides in real-time
5. **Practical Standards** - Follow existing patterns

## References

- **Full workflow guide**: `.github/agents/feature-development.md`
- **Testing strategies**: `.github/agents/test.md` and `docs/testing/`
- **Documentation standards**: `docs/contributing/documentation-writing-guide.md`
- **Project context**: `docs/CONTEXT.md`

---

**Ready to start?** Ask your first clarifying question to understand what the user wants to build.
