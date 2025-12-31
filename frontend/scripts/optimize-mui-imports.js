#!/usr/bin/env node

/**
 * Script to optimize MUI imports by converting barrel imports to direct imports
 *
 * Before: import { Button, TextField, Box } from '@mui/material'
 * After:  import Button from '@mui/material/Button'
 *         import TextField from '@mui/material/TextField'
 *         import Box from '@mui/material/Box'
 */

const fs = require("fs");
const path = require("path");

// Files to process
const filesToProcess = process.argv.slice(2);

if (filesToProcess.length === 0) {
  console.error("Usage: node optimize-mui-imports.js <file1> <file2> ...");
  process.exit(1);
}

/**
 * Transform MUI barrel imports to direct imports
 */
function transformMuiImports(content) {
  // Match multi-line import statements from @mui/material
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/material['"]/g;

  let match;
  const replacements = [];

  while ((match = importRegex.exec(content)) !== null) {
    const fullImport = match[0];
    const componentsString = match[1];

    // Parse the components, handling multi-line imports
    const components = componentsString
      .split(",")
      .map((comp) => comp.trim())
      .filter((comp) => comp.length > 0)
      .map((comp) => {
        // Handle type imports like "type Breakpoint"
        const typeMatch = comp.match(/^type\s+(\w+)$/);
        if (typeMatch) {
          return { name: typeMatch[1], isType: true };
        }
        return { name: comp, isType: false };
      });

    // Generate direct imports
    const directImports = components
      .map(({ name, isType }) => {
        if (isType) {
          return `import type { ${name} } from '@mui/material/${name}'`;
        }
        return `import ${name} from '@mui/material/${name}'`;
      })
      .join("\n");

    replacements.push({
      original: fullImport,
      replacement: directImports,
    });
  }

  // Apply replacements
  let transformedContent = content;
  for (const { original, replacement } of replacements) {
    transformedContent = transformedContent.replace(original, replacement);
  }

  return transformedContent;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(absolutePath, "utf8");

    // Check if file has MUI barrel imports
    if (
      !content.includes("from '@mui/material'") &&
      !content.includes('from "@mui/material"')
    ) {
      console.log(`Skipping ${filePath} - no MUI barrel imports found`);
      return true;
    }

    const transformedContent = transformMuiImports(content);

    if (transformedContent === content) {
      console.log(`No changes needed for ${filePath}`);
      return true;
    }

    fs.writeFileSync(absolutePath, transformedContent, "utf8");
    console.log(`✓ Transformed ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
let successCount = 0;
let failCount = 0;

for (const file of filesToProcess) {
  if (processFile(file)) {
    successCount++;
  } else {
    failCount++;
  }
}

console.log("\n=== Summary ===");
console.log(`Successfully processed: ${successCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total: ${filesToProcess.length}`);

process.exit(failCount > 0 ? 1 : 0);
