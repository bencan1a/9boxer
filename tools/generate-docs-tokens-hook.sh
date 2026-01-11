#!/usr/bin/env bash
#
# Pre-commit hook: Auto-generate documentation design tokens
#
# This hook automatically regenerates the documentation design tokens CSS file
# when frontend/src/theme/tokens.ts is modified in a commit.
#
# The generated file is automatically staged for inclusion in the commit (VitePress docs).

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Design tokens changed - regenerating documentation tokens...${NC}"

# Navigate to project root directory (parent of tools/)
cd "$(dirname "$0")/.." || exit 1

# Change to frontend directory
cd frontend || exit 1

# Run the generation script
if npm run generate:docs-tokens; then
    echo -e "${GREEN}✅ Documentation tokens regenerated successfully${NC}"

    # Add the generated file to staging area
    TOKENS_FILE="../resources/user-guide-vitepress/docs/public/stylesheets/design-tokens.css"

    if [ -f "$TOKENS_FILE" ]; then
        git add "$TOKENS_FILE"
        echo -e "${GREEN}✅ Added design-tokens.css to commit${NC}"
        echo ""
        echo -e "${YELLOW}📝 Note: The generated design-tokens.css has been automatically staged.${NC}"
        echo -e "${YELLOW}   This ensures the VitePress documentation stays in sync with your design system.${NC}"
    else
        echo -e "${RED}❌ Error: Generated file not found at $TOKENS_FILE${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to generate documentation tokens${NC}"
    echo -e "${YELLOW}Please fix the errors and try again.${NC}"
    exit 1
fi

exit 0
