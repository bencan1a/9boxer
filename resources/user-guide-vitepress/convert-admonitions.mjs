#!/usr/bin/env node
/**
 * Convert MkDocs admonitions to VitePress containers
 *
 * MkDocs format:
 *   !!! tip "Title"
 *       Content here
 *       More content
 *
 * VitePress format:
 *   ::: tip Title
 *   Content here
 *   More content
 *   :::
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mapping of MkDocs admonition types to VitePress container types
const typeMapping = {
  'tip': 'tip',
  'note': 'info',
  'info': 'info',
  'warning': 'warning',
  'danger': 'danger',
  'question': 'info',
  'success': 'tip',
  'example': 'details',
};

function convertAdmonitions(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Match MkDocs admonition start: !!! type or !!! type "Title"
    const match = line.match(/^!!!\s+(\w+)(?:\s+"([^"]+)")?/);

    if (match) {
      const [, type, title] = match;
      const vitepressType = typeMapping[type] || 'info';

      // Start VitePress container
      if (title) {
        result.push(`::: ${vitepressType} ${title}`);
      } else {
        result.push(`::: ${vitepressType}`);
      }

      // Collect indented content (4 spaces or 1 tab)
      i++;
      while (i < lines.length) {
        const contentLine = lines[i];

        // Check if line is indented (part of admonition)
        if (contentLine.startsWith('    ') || contentLine.startsWith('\t')) {
          // Remove 4 spaces of indentation
          result.push(contentLine.replace(/^    /, ''));
          i++;
        } else if (contentLine.trim() === '') {
          // Empty lines within admonition
          result.push('');
          i++;
        } else {
          // Non-indented line means end of admonition
          break;
        }
      }

      // Close VitePress container
      result.push(':::');
      result.push(''); // Add blank line after container
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join('\n');
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file has admonitions
  if (!content.includes('!!!')) {
    return false;
  }

  const converted = convertAdmonitions(content);
  fs.writeFileSync(filePath, converted, 'utf8');
  return true;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'public' && file.name !== 'node_modules') {
      count += processDirectory(fullPath);
    } else if (file.isFile() && file.name.endsWith('.md')) {
      if (processFile(fullPath)) {
        console.log(`✓ Converted: ${path.relative(path.join(__dirname, 'docs'), fullPath)}`);
        count++;
      }
    }
  }

  return count;
}

// Main execution
const docsDir = path.join(__dirname, 'docs');
console.log('Converting MkDocs admonitions to VitePress containers...\n');

const count = processDirectory(docsDir);

console.log(`\n✓ Converted ${count} file(s)`);
