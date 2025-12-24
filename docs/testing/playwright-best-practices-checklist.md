# Playwright Best Practices Checklist

Quick reference guide for writing and reviewing E2E tests. Use this checklist before committing new tests.

---

## ✅ Test Design Checklist

### Before Writing a Test

- [ ] **Does this test verify user-visible behavior?** (Not implementation details)
- [ ] **Can a non-technical person understand what this test verifies?**
- [ ] **Is this test independent?** (Can it run in any order?)
- [ ] **Does this test have a single, clear purpose?**

### Anti-Patterns to Avoid ❌

| ❌ Don't Do This | ✅ Do This Instead |
|------------------|-------------------|
| Check CSS properties (`borderWidth === '4px'`) | Check user-visible indicators (`expect(indicator).toBeVisible()`) |
| Check class names (`toHaveAttribute('class', /invisible/)`) | Check content/visibility (`not.toContainText()`, `.toBeHidden()`) |
| Use fixed timeouts (`waitForTimeout(300)`) | Use network idle (`waitForLoadState('networkidle')`) |
| Multiple assertions in one test (drag + badge + export) | Split into focused tests (one per concern) |
| Silent try/catch that logs errors | Let errors bubble up with clear messages |
| Brittle selectors (`.MuiBadge-badge`) | Semantic selectors (`data-testid`, `getByRole`) |

---

## 🎯 Selector Strategy

**Priority Order:**

1. ✅ **`data-testid`** - Preferred for E2E tests
   ```typescript
   page.locator('[data-testid="employee-card-1"]')
   ```

2. ✅ **Accessibility roles** - Good for semantic elements
   ```typescript
   page.getByRole('button', { name: 'File Menu' })
   ```

3. ✅ **User-visible text** - Good for content verification
   ```typescript
   page.getByText('Alice Smith')
   ```

4. ⚠️ **CSS selectors** - Only if no better option
   ```typescript
   page.locator('.employee-card')  // Brittle!
   ```

5. ❌ **XPath** - Last resort
   ```typescript
   page.locator('//div[@class="card"]')  // Very brittle!
   ```

---

## ⏱️ Async Handling Best Practices

### ✅ Good Patterns

```typescript
// ✅ Auto-retry assertions (preferred)
await expect(element).toBeVisible({ timeout: 5000 });

// ✅ Wait for network to settle
await page.waitForLoadState('networkidle');

// ✅ Wait for specific API call
await page.waitForResponse((r) => r.url().includes('/move'));

// ✅ Wait for specific event
const downloadPromise = page.waitForEvent('download');
await exportButton.click();
const download = await downloadPromise;
```

### ❌ Bad Patterns

```typescript
// ❌ Fixed arbitrary delays
await page.waitForTimeout(300);  // Why 300? What are we waiting for?

// ❌ Manual polling
while (!(await element.isVisible())) {
  await page.waitForTimeout(100);
}
```

### ⚠️ Acceptable Fixed Timeouts

Only use `waitForTimeout()` for:
- **CSS animations** (match animation duration)
- **Deliberate delays** (e.g., testing auto-save after 2s)
- **Between rapid operations** (after `waitForLoadState`)

```typescript
// ✅ Acceptable: Known animation duration
await page.waitForTimeout(300);  // Matches CSS animation-duration: 300ms

// ✅ Acceptable: Stabilization buffer after network idle
await page.waitForLoadState('networkidle');
await page.waitForTimeout(200);  // Small buffer for React re-renders
```

---

## 🔄 Consecutive Operations Pattern

When performing multiple drag-drop or state-changing operations:

```typescript
// ✅ GOOD: Explicit stabilization between operations
await dragEmployeeToPosition(page, 1, 6);
await page.waitForLoadState('networkidle');  // Wait for network
await page.waitForTimeout(500);              // Buffer for React state

await dragEmployeeToPosition(page, 2, 5);    // Now succeeds
```

**Why?**
- React may still be processing state updates from first operation
- Backend may queue session operations
- DOM elements may be stale

---

## 🧪 Test Structure Template

### Single-Action Test (Preferred)

```typescript
test('should show modified indicator when employee moved', async ({ page }) => {
  // Arrange
  await uploadExcelFile(page, 'sample-employees.xlsx');

  // Act
  await dragEmployeeToPosition(page, 1, 6);

  // Assert
  const indicator = page
    .locator('[data-testid="employee-card-1"]')
    .locator('[data-testid="modified-indicator"]');
  await expect(indicator).toBeVisible();
});
```

### Multi-Step Workflow (When Necessary)

```typescript
test('should complete full export workflow', async ({ page }) => {
  // Step 1: Upload
  await uploadExcelFile(page, 'sample-employees.xlsx');

  // Step 2: Make change
  await dragEmployeeToPosition(page, 1, 6);
  await expect(page.locator('[data-testid="file-menu-badge"]')).toContainText('1');

  // Step 3: Export
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-testid="file-menu-button"]').click();
  await page.locator('[data-testid="export-changes-menu-item"]').click();
  const download = await downloadPromise;

  // Step 4: Verify download
  expect(download.suggestedFilename()).toContain('9Box_Changes');
});
```

**Keep multi-step tests focused on a single user journey.**

---

## 📝 Test Naming Conventions

### ✅ Good Names

```typescript
test('should show modified indicator when employee moved', ...)
test('should increment badge count for each unique employee', ...)
test('should enable export when changes exist', ...)
```

**Pattern:** `should [expected behavior] when [condition]`

### ❌ Bad Names

```typescript
test('test drag and drop', ...)               // Too vague
test('employee movement test', ...)           // Doesn't state expectation
test('check if badge updates correctly', ...) // Implementation-focused
```

---

## 🔍 Debugging Failing Tests

### Checklist When Test Fails

1. **[ ] Is the failure consistent?**
   - Flaky → Add retries, check timing
   - Consistent → Likely real bug or brittle test

2. **[ ] Did UI implementation change?**
   - Check if test is checking implementation details
   - Refactor to test behavior instead

3. **[ ] Check the screenshot/trace**
   - What does the page actually look like?
   - Is the element present but not visible?

4. **[ ] Run locally with headed browser**
   ```bash
   npx playwright test --headed --debug
   ```

5. **[ ] Check timing**
   - Add `waitForLoadState('networkidle')` before assertion
   - Increase timeout temporarily to rule out timing

### Common Failure Patterns

| Error Message | Likely Cause | Fix |
|---------------|--------------|-----|
| `Element not visible` | Timing issue or wrong selector | Add `waitForLoadState`, check selector |
| `Timeout waiting for...` | Element never appears or wrong selector | Verify element exists, check testid |
| `Expected pattern: /invisible/` | Checking wrong MUI class | Check badge content instead |
| `API call timeout` | Network slow or endpoint changed | Check backend logs, add stabilization |
| `Expected "4px" received "0px"` | Testing implementation detail | Remove CSS check, test behavior |

---

## ⚙️ Configuration Quick Reference

### Current Settings (Good for Development)

```typescript
// playwright.config.ts
{
  timeout: 30000,           // 30s per test
  retries: 0,               // ⚠️ Consider enabling (1 local, 2 CI)
  workers: 1,               // Sequential (good for shared backend)
  expect: { timeout: 5000 } // 5s for assertions
}
```

### Recommended Changes

```typescript
{
  retries: process.env.CI ? 2 : 1,  // ✅ Tolerate flaky E2E
  use: {
    trace: 'retain-on-failure',     // ✅ Always capture traces
    video: 'retain-on-failure',     // ✅ Add video for debugging
    viewport: { width: 1920, height: 1080 },  // ✅ Larger for grid
  }
}
```

---

## 🚀 Performance Tips

### Faster Test Execution

1. **Use API setup when possible** (instead of UI upload every time)
   ```typescript
   // Instead of uploading via UI
   await request.post('http://localhost:8000/api/session/upload', { data });
   ```

2. **Parallelize independent tests** (if you add multi-session support)
   ```typescript
   workers: process.env.CI ? 2 : 1
   ```

3. **Use `test.describe.configure({ mode: 'serial' })`** for dependent tests
   ```typescript
   test.describe.configure({ mode: 'serial' });
   test('step 1', ...);
   test('step 2', ...);  // Shares state with step 1
   ```

---

## 📊 Test Suite Health Metrics

### Green Flags ✅

- [ ] **>95% passing rate**
- [ ] **All tests independent** (can run in any order)
- [ ] **Clear failure messages** (immediately know what broke)
- [ ] **Fast feedback** (<5 minutes for full suite)
- [ ] **Minimal flakiness** (<5% flaky rate)

### Red Flags 🚩

- [ ] Tests fail intermittently without code changes
- [ ] Tests break on UI refactoring (CSS changes, component renames)
- [ ] Failure messages don't indicate what broke
- [ ] Many tests with `skip` or `fixme`
- [ ] >20% of tests use `waitForTimeout()`

---

## 📚 Helper Function Guidelines

### Good Helper Design

```typescript
// ✅ Clear parameters, explicit behavior
async function dragEmployeeToPosition(
  page: Page,
  employeeId: number,
  targetPosition: number,
  options: {
    expectModified?: boolean;  // Explicit control
    maxRetries?: number;
  } = {}
) {
  const { expectModified = true, maxRetries = 2 } = options;

  // ... perform drag ...

  // ✅ Fail fast if expectation not met
  if (expectModified) {
    await expect(modifiedIndicator).toBeVisible();
  }

  // No silent try/catch!
}
```

### Bad Helper Design

```typescript
// ❌ Boolean parameters (unclear meaning)
async function dragEmployee(page, id, pos, check, retries, wait) {
  // ❌ Silent error handling
  try {
    await expect(indicator).toBeVisible();
  } catch {
    console.log('Might be OK...');  // Masks bugs!
  }
}
```

---

## 🎓 Learning Resources

**Official Docs:**
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Auto-Waiting](https://playwright.dev/docs/actionability)
- [Test Retries](https://playwright.dev/docs/test-retries)

**Internal Docs:**
- [Architecture Review](./playwright-architecture-review.md) - Comprehensive analysis
- [Test Principles](./test-principles.md) - General testing philosophy
- [Quick Reference](./quick-reference.md) - Fast lookup for patterns

---

## 🔄 Pre-Commit Checklist

Before committing a new test:

- [ ] Test name describes **expected behavior**, not implementation
- [ ] Test uses `data-testid` or accessibility selectors (no CSS classes)
- [ ] Test verifies **user-visible outcomes**, not CSS/classes
- [ ] Test has **single clear purpose** (not testing 5 things at once)
- [ ] Test uses **auto-retry assertions** (`expect(...).toBeVisible()`)
- [ ] No arbitrary `waitForTimeout()` without comment explaining why
- [ ] Test passes **3 times in a row** locally (not flaky)
- [ ] Added **comments** for any non-obvious waits or logic

---

## Quick Decision Tree

```
┌─────────────────────────────────┐
│  What am I testing?             │
└────────────┬────────────────────┘
             │
     ┌───────┴───────┐
     │               │
  Visual?         Behavior?
     │               │
     ▼               ▼
Screenshot test   E2E test
                     │
             ┌───────┴────────┐
             │                │
        Single action?   Multi-step?
             │                │
             ▼                ▼
      Focused test    Workflow test
      (preferred)     (when needed)
```

**General Rule:** Prefer **focused tests** over **comprehensive tests**.

---

**Last Updated:** December 23, 2024
**Maintainer:** Architecture Review
**Review Frequency:** After each major test suite change
