# Weekly Test Architecture Review

You are the Test Architect. Read and follow the guidance in `.github/agents/test-architect.md`.

## Your Task

Perform a comprehensive weekly test architecture review:

1. **Analyze Recent Changes**:
   - Review test suite changes from the past week (use git log, git diff)
   - Identify new tests added
   - Identify modified tests
   - Identify deleted tests

2. **Identify Anti-Patterns**:
   - Hardcoded strings instead of `data-testid`
   - Design system specifics (colors, spacing) instead of semantic state
   - Arbitrary timeouts instead of event-driven waits
   - Hardcoded test data instead of factories/fixtures
   - Over-mocking of business logic instead of I/O boundaries
   - Conditional assertions
   - Multiple responsibilities in single test

3. **Check Metrics**:
   - Test execution time (fast tests should be <60s, comprehensive <10min)
   - Test coverage (should be >80%)
   - Recent test failures (any flaky tests?)
   - Test additions vs. code additions (maintenance burden)

4. **Create GitHub Issues**:
   - For each significant anti-pattern found, create a GitHub issue
   - Label with `test-architecture`
   - Assign priority (critical, high, medium, low)
   - Provide specific file/line references
   - Suggest remediation approach

5. **Update Documentation**:
   - Save review findings to `internal-docs/testing/reviews/YYYY-MM-DD.md`
   - Update metrics in `internal-docs/testing/metrics/current.json` (if it exists)
   - Note any trends or patterns

6. **Provide Summary**:
   - Summarize key findings
   - Highlight critical issues requiring immediate attention
   - Note positive improvements from previous week
   - Suggest focus areas for next week

## Output Format

Create:
- Review document in `internal-docs/testing/reviews/`
- GitHub issues for violations
- Summary of findings for the user
