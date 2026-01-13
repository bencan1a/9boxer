# Documentation Workflows - Permission Fix Required

## Current Status

Both documentation workflows are failing due to repository security settings that prevent GitHub Actions from creating pull requests.

### Error Message
```
GitHub Actions is not permitted to create or approve pull requests (createPullRequest)
```

## Root Cause

The repository has the workflow permission setting **"Allow GitHub Actions to create and approve pull requests"** disabled. This is a repository-level security setting that blocks all automated PR creation, regardless of workflow permissions.

## Solution: Enable PR Creation for GitHub Actions

### Steps to Fix

1. Go to repository: https://github.com/bencan1a/9boxer
2. Navigate to: **Settings** → **Actions** → **General**
3. Scroll to the **"Workflow permissions"** section
4. Check the box: **☑ Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### What This Enables

- [docs.yml](../.github/workflows/docs.yml) can create PRs for documentation updates
- [docs-auto-update.yml](../.github/workflows/docs-auto-update.yml) can update screenshots on PRs

### Security Considerations

This setting is safe because:
- PRs still require human review and approval
- Branch protection rules still apply (status checks, reviews, etc.)
- Auto-created PRs are clearly labeled as bot-generated
- You maintain full control over what gets merged

## Alternative Approaches

If you prefer **not** to enable this setting:

### Option 1: Manual Documentation Updates
- Disable the automatic documentation workflows
- Run `python tools/build_context.py` manually when needed
- Create PRs manually for documentation changes

### Option 2: Use a Personal Access Token (PAT)
- Create a PAT with `repo` scope
- Store it as a repository secret (e.g., `PAT_TOKEN`)
- Update workflows to use `token: ${{ secrets.PAT_TOKEN }}`
- **Note:** This bypasses the security setting but requires maintaining a PAT

### Option 3: Keep Current Settings (Not Recommended)
- Accept that documentation workflows will continue to fail
- Manually update documentation when needed
- Monitor and close failed workflow runs

## Recommended Action

**Enable the repository setting** (Solution above) because:
1. It's the intended GitHub Actions approach for automated workflows
2. Maintains repository security through PR review process
3. No additional secrets or tokens to manage
4. Workflows function as designed

## Testing After Fix

Once the setting is enabled, trigger a test run:

```bash
gh workflow run docs.yml
```

Check that it creates a PR successfully:

```bash
gh pr list --label "documentation"
```

## Related Commits

- [3890a5c] fix: Update Documentation workflow to create PRs instead of direct pushes
- [3cb6dc5] fix: Prevent Documentation Auto-Update workflow from failing on forked PRs
- [8cca5f9] fix: Add issues:write permission to internal-docs-maintenance job

These commits updated the workflows to create PRs instead of direct pushes, but the repository setting must be enabled for them to work.
