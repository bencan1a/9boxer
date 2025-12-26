# Active Plans

**Updated**: 2025-12-26T07:43:37.665680+00:00
**Showing**: Plans with status=active created within 21 days

## playwright-performance
- **Status**: active
- **Owner**: Claude Code
- **Created**: 2025-12-25
- **Path**: `agent-projects/playwright-performance/plan.md`
- **Summary**:
  - Eliminate 239 hardcoded waitForTimeout calls causing ~95 seconds of unnecessary waiting
  - Enable test parallelization to reduce total runtime by 60-70%
  - Replace arbitrary waits with state-based assertions using Playwright best practices
  - Target runtime reduction from 10-15 minutes to 2-4 minutes

## design-system
- **Status**: active
- **Owner**: Claude Code
- **Created**: 2025-12-24
- **Path**: `agent-projects/design-system/plan.md`
- **Summary**:
  - Implement comprehensive design system with tokens, documentation, and tooling
  - Extract hardcoded values into centralized theme tokens
  - Create Storybook for component discovery and validation
  - Establish governance processes for design consistency

## view-controls-consolidation
- **Status**: active
- **Owner**: Claude
- **Created**: 2025-12-24
- **Path**: `agent-projects/view-controls-consolidation/plan.md`
- **Summary**:
  - Consolidate floating view controls into single top-right toolbar
  - Move language selector from AppBar to Settings dialog
  - Improve UX by grouping related controls and reducing toolbar clutter

## i18n-implementation
- **Status**: active
- **Owner**: bencan1a
- **Created**: 2025-12-23
- **Path**: `agent-projects/i18n-implementation/plan.md`
- **Summary**:
  - Implement react-i18next for internationalization across entire frontend
  - Externalize 400-500 hardcoded strings from 42 React components
  - Support English + Spanish (minimum 2 languages)
  - Break work into 10 agent-sized tasks (24-34 hours total)

## backend-robustness
- **Status**: active
- **Owner**: Claude Code
- **Created**: 2025-12-22
- **Path**: `agent-projects/backend-robustness/plan.md`
- **Summary**:
  - Implement dynamic port selection for backend to handle port conflicts
  - Add connection monitoring and automatic recovery from backend crashes
  - Improve error messages and user experience during failures

## big-movers-feature
- **Status**: active
- **Owner**: Claude
- **Created**: 2025-12-21
- **Path**: `agent-projects/big-movers-feature/plan.md`
- **Summary**:
  - Add "big mover" detection for employees who moved significantly between positions
  - Display badge on employee tiles for big movers
  - Add filtering capability to show only big movers
  - Ensure dynamic updates when employees are moved via drag-and-drop

## ninebox-expand-collapse
- **Status**: active
- **Owner**: Claude Code
- **Created**: 2025-12-10
- **Path**: `agent-projects/ninebox-expand-collapse/plan.md`
- **Summary**:
  - Add expand/collapse functionality to nine box grid boxes
  - Expanded box fills grid area while other boxes remain as small drop targets
  - Preserve drag-and-drop functionality across all boxes
  - Implement smooth animations and keyboard controls
