/**
 * Script to check for missing i18n translation keys
 */

const fs = require('fs');
const path = require('path');

// Read all translation files
const localesDir = path.join(__dirname, 'frontend', 'src', 'i18n', 'locales');
const locales = ['en', 'es', 'de', 'cs', 'fr', 'hi', 'ja'];

const translations = {};
for (const locale of locales) {
  const filePath = path.join(localesDir, locale, 'translation.json');
  translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Recursively find all TypeScript/TSX files
function findFiles(dir, pattern, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== '.git') {
        findFiles(filePath, pattern, results);
      }
    } else if (file.isFile() && pattern.test(file.name)) {
      results.push(filePath);
    }
  }

  return results;
}

const tsFiles = findFiles(
  path.join(__dirname, 'frontend', 'src'),
  /\.(ts|tsx)$/
).filter(file => !file.includes('.test.'));

// Extract all translation keys from code
const translationKeyRegex = /t\(\s*["']([^"']+)["']/g;
const usedKeys = new Set();

console.log(`Scanning ${tsFiles.length} TypeScript files...\n`);

for (const file of tsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = translationKeyRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

// Helper function to check if a key exists in translation object
function hasKey(obj, key) {
  const parts = key.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return true;
}

// Check for missing keys in each locale
console.log('=== Checking for missing translation keys ===\n');

let foundMissing = false;
for (const locale of locales) {
  const missingKeys = [];

  for (const key of usedKeys) {
    if (!hasKey(translations[locale], key)) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    foundMissing = true;
    console.log(`[${locale.toUpperCase()}] Missing ${missingKeys.length} keys:`);
    missingKeys.forEach(key => console.log(`  - ${key}`));
    console.log('');
  }
}

if (!foundMissing) {
  console.log('✓ No missing translation keys found!');
}

// Also check for unused keys (keys in translation files but not used in code)
console.log('\n=== Checking for potentially unused translation keys ===\n');

function getAllKeys(obj, prefix = '') {
  const keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

const allEnglishKeys = getAllKeys(translations['en']);
const unusedKeys = allEnglishKeys.filter(key => !usedKeys.has(key));

if (unusedKeys.length > 0) {
  console.log(`Found ${unusedKeys.length} potentially unused keys in English translation:`);
  unusedKeys.slice(0, 20).forEach(key => console.log(`  - ${key}`));
  if (unusedKeys.length > 20) {
    console.log(`  ... and ${unusedKeys.length - 20} more`);
  }
} else {
  console.log('✓ All translation keys are being used!');
}

console.log('\n=== Summary ===');
console.log(`Total keys used in code: ${usedKeys.size}`);
console.log(`Total keys in English translation: ${allEnglishKeys.length}`);
console.log(`Missing keys: ${foundMissing ? 'YES - see above' : 'NO'}`);
console.log(`Unused keys: ${unusedKeys.length > 0 ? unusedKeys.length : 'NO'}`);
