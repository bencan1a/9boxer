#!/usr/bin/env node
/**
 * Convert MkDocs keyboard shortcut syntax to VitePress/HTML format
 * MkDocs: ++ctrl+plus++
 * VitePress: <kbd>Ctrl</kbd>+<kbd>+</kbd>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mapping of common shortcuts
const keyMappings = {
  'ctrl': 'Ctrl',
  'cmd': 'Cmd',
  'alt': 'Alt',
  'shift': 'Shift',
  'plus': '+',
  'minus': '−',
  'scroll': 'Scroll',
  'esc': 'Esc',
  'tab': 'Tab',
  'f11': 'F11',
  'd': 'D',
  '0': '0',
  '=': '='
};

function convertShortcut(match, content) {
  // Extract the keys between ++ markers
  const keys = content.split('+').map(k => k.trim());

  // Convert each key
  const kbdTags = keys.map(key => {
    const displayKey = keyMappings[key.toLowerCase()] || key;
    return `<kbd>${displayKey}</kbd>`;
  });

  // Join with + between keys
  return kbdTags.join('+');
}

function convertKeyboardShortcuts(content) {
  // Pattern: ++key1+key2+key3++
  const pattern = /\+\+([a-z0-9+\-=]+)\+\+/gi;

  return content.replace(pattern, (match, keys) => {
    return convertShortcut(match, keys);
  });
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('++')) {
    return false;
  }

  const converted = convertKeyboardShortcuts(content);
  fs.writeFileSync(filePath, converted, 'utf8');
  return true;
}

const docsDir = path.join(__dirname, 'docs');
const filePath = path.join(docsDir, 'keyboard-shortcuts.md');

console.log('Converting keyboard shortcut syntax...\n');

if (fs.existsSync(filePath) && processFile(filePath)) {
  console.log('✓ Converted: keyboard-shortcuts.md');
} else {
  console.log('No shortcuts to convert');
}

console.log('\n✓ Keyboard shortcuts converted to <kbd> tags');
