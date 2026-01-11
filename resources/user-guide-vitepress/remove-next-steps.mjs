#!/usr/bin/env node
/**
 * Remove "Next Steps" sections from documentation files
 * These are redundant with VitePress prev/next navigation buttons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function removeNextSteps(content) {
  // Pattern: ## Next Steps heading followed by bullet list until next ## heading or EOF
  // We want to remove everything from "## Next Steps" to either the next ## heading or end of file
  const nextStepsPattern = /\n## Next Steps\n[\s\S]*?(?=\n## |$)/g;

  return content.replace(nextStepsPattern, '');
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('## Next Steps')) {
    return false;
  }

  const cleaned = removeNextSteps(content);
  fs.writeFileSync(filePath, cleaned, 'utf8');
  return true;
}

const docsDir = path.join(__dirname, 'docs');
const filesToProcess = [
  'donut-mode.md',
  'employee-data.md',
  'exporting.md',
  'filters.md',
  'intelligence.md',
  'new-to-9box.md',
  'overview.md',
  'settings.md',
  'statistics.md',
  'tracking-changes.md',
  'understanding-grid.md',
  'working-with-employees.md'
];

console.log('Removing redundant "Next Steps" sections...\n');

let count = 0;
for (const file of filesToProcess) {
  const filePath = path.join(docsDir, file);
  if (fs.existsSync(filePath) && processFile(filePath)) {
    console.log(`✓ Removed from: ${file}`);
    count++;
  }
}

console.log(`\n✓ Removed "Next Steps" from ${count} file(s)`);
