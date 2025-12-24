# Translation Workflow Guide

This guide explains how to add and update translations in the 9Boxer application. It's designed for professional translators who may not be familiar with React or JavaScript.

## Overview

9Boxer uses a JSON-based translation system with separate files for each language:
- **English (en)**: Source language, always complete
- **Spanish (es)**: Translation target

All translation files are plain text JSON files that you can edit with any text editor.

## Quick Start

1. **Locate translation files** in the project
2. **Edit the Spanish translation file** to add/update translations
3. **Follow the format** of the English file
4. **Test your translations** in the application
5. **Submit for review**

## Step 1: Accessing Translation Files

Translation files are located in:
```
frontend/src/i18n/locales/
├── en/
│   └── translation.json      # English translations (reference)
└── es/
    └── translation.json      # Spanish translations (edit this)
```

**How to find the files:**
- If you have access to the project files directly, navigate to the path above
- If working through a version control system (Git), locate the files in the repository
- Ask your development contact if you need help accessing these files

## Step 2: Understanding the Translation File Format

Translation files use JSON format, which looks like this:

```json
{
  "app": {
    "title": "9Boxer",
    "subtitle": "Employee Performance Grid"
  },
  "dashboard": {
    "fileMenu": {
      "importData": "Import Data",
      "exportChanges": "Apply Changes to Excel"
    }
  }
}
```

**Key rules:**
- Text is organized in nested groups (namespaces)
- Each line ends with a comma, except the last line in each section
- Text must be in double quotes `"`
- Special characters must be escaped: `\"` for quotes, `\\` for backslash
- The file must be valid JSON (use a JSON validator if unsure)

## Step 3: Translation Patterns

### Simple Text

**English:**
```json
{
  "greeting": "Welcome to 9Boxer"
}
```

**Spanish:**
```json
{
  "greeting": "Bienvenido a 9Boxer"
}
```

### Text with Variables

Variables are placeholders that get replaced with actual data. They use `{{variableName}}` syntax.

**IMPORTANT: Never translate the variable names inside `{{}}` - only translate the surrounding text.**

**English:**
```json
{
  "welcome": "Welcome back, {{name}}!",
  "fileSelected": "Selected file: {{filename}}"
}
```

**Spanish:**
```json
{
  "welcome": "Bienvenido de nuevo, {{name}}!",
  "fileSelected": "Archivo seleccionado: {{filename}}"
}
```

**Common variables you'll see:**
- `{{count}}` - Numbers (e.g., 5)
- `{{name}}` - Person's name
- `{{filename}}` - File name
- `{{date}}` - Date
- `{{percentage}}` - Percentage value

### Pluralization

Pluralization uses special suffixes: `_one` and `_other`.

**English:**
```json
{
  "employeeCount_one": "{{count}} employee",
  "employeeCount_other": "{{count}} employees"
}
```

**Spanish:**
```json
{
  "employeeCount_one": "{{count}} empleado",
  "employeeCount_other": "{{count}} empleados"
}
```

**How it works:**
- `_one` is used when count = 1
- `_other` is used for all other counts (0, 2, 3, 4, etc.)
- The system automatically chooses the right form based on `{{count}}`

### Text with Special Characters

If text contains quotes, escape them with a backslash:

**English:**
```json
{
  "message": "Click \"OK\" to continue"
}
```

**Spanish:**
```json
{
  "message": "Haga clic en \"Aceptar\" para continuar"
}
```

### Text with Line Breaks

For multi-line text, use `\n`:

**English:**
```json
{
  "instructions": "Step 1: Upload file\nStep 2: Review data\nStep 3: Export"
}
```

**Spanish:**
```json
{
  "instructions": "Paso 1: Cargar archivo\nPaso 2: Revisar datos\nPaso 3: Exportar"
}
```

## Step 4: Translation Workflow

### Adding a New Translation

1. **Find the English text** in `locales/en/translation.json`
2. **Locate the same key** in `locales/es/translation.json`
3. **Translate the text** while keeping:
   - The same key name (left side of `:`)
   - Variables unchanged (`{{variableName}}`)
   - JSON syntax correct (quotes, commas, brackets)
4. **Save the file**
5. **Verify JSON is valid** (use online JSON validator if needed)

### Updating an Existing Translation

1. **Find the key** in `locales/es/translation.json`
2. **Update the translation text** (right side of `:`)
3. **Keep the format** consistent
4. **Save the file**

### Example Workflow

**Task:** Translate the file menu export button

**English (locales/en/translation.json):**
```json
{
  "dashboard": {
    "fileMenu": {
      "exportChanges_one": "Apply {{count}} Change to Excel",
      "exportChanges_other": "Apply {{count}} Changes to Excel"
    }
  }
}
```

**Spanish (locales/es/translation.json) - Before:**
```json
{
  "dashboard": {
    "fileMenu": {
      "exportChanges_one": "Apply {{count}} Change to Excel",
      "exportChanges_other": "Apply {{count}} Changes to Excel"
    }
  }
}
```

**Spanish (locales/es/translation.json) - After:**
```json
{
  "dashboard": {
    "fileMenu": {
      "exportChanges_one": "Aplicar {{count}} Cambio a Excel",
      "exportChanges_other": "Aplicar {{count}} Cambios a Excel"
    }
  }
}
```

## Step 5: Testing Your Translations

### Testing in the Application

1. **Save your translation file**
2. **Request a test build** from the development team
3. **Open the application** in a browser
4. **Switch language to Spanish**:
   - Look for language selector in the top-right corner
   - Click and select "Español"
5. **Verify your translations** appear correctly
6. **Check for:**
   - Text display (no missing translations)
   - Layout issues (text too long, overlapping)
   - Variables replaced correctly (no `{{variable}}` visible)
   - Plurals work correctly (try different counts)

### Common Testing Scenarios

**Test variables:**
- Upload a file and verify filename appears in Spanish text
- Check employee counts display correctly
- Verify names and dates show in translated text

**Test plurals:**
- Look for counts of 0, 1, and 2+ to verify singular/plural forms
- Example: "1 empleado" vs "5 empleados"

**Test layout:**
- Spanish text is typically 20-30% longer than English
- Verify buttons don't get cut off
- Check that dialogs and panels fit the text
- Report any layout issues to development team

## Translation Quality Checklist

Before submitting your translations, verify:

- [ ] All keys from English file are present in Spanish file
- [ ] JSON syntax is valid (no missing commas, quotes, or brackets)
- [ ] Variables (`{{variable}}`) are unchanged and in the correct position
- [ ] Pluralization suffixes (`_one`, `_other`) are used correctly
- [ ] Special characters are properly escaped (`\"`, `\\`)
- [ ] Text length is reasonable (not excessively longer than English)
- [ ] Terminology is consistent across all translations
- [ ] Technical terms are translated appropriately for the domain
- [ ] Formal/informal tone matches the English source
- [ ] No hardcoded English text remains

## Common Mistakes and How to Avoid Them

### Mistake 1: Translating Variable Names

**Wrong:**
```json
{
  "welcome": "Bienvenido, {{nombre}}!"  // ❌ Changed variable name
}
```

**Correct:**
```json
{
  "welcome": "Bienvenido, {{name}}!"  // ✅ Variable name unchanged
}
```

### Mistake 2: Missing Commas

**Wrong:**
```json
{
  "title": "Título"
  "subtitle": "Subtítulo"  // ❌ Missing comma on line above
}
```

**Correct:**
```json
{
  "title": "Título",  // ✅ Comma added
  "subtitle": "Subtítulo"
}
```

### Mistake 3: Mismatched Brackets

**Wrong:**
```json
{
  "section": {
    "key": "value"
  // ❌ Missing closing }
}
```

**Correct:**
```json
{
  "section": {
    "key": "value"
  }  // ✅ Bracket added
}
```

### Mistake 4: Unescaped Quotes

**Wrong:**
```json
{
  "message": "Click "OK" to continue"  // ❌ Unescaped quotes
}
```

**Correct:**
```json
{
  "message": "Click \"OK\" to continue"  // ✅ Quotes escaped with \
}
```

### Mistake 5: Incorrect Plural Forms

**Wrong:**
```json
{
  "count": "{{count}} empleados"  // ❌ No singular form
}
```

**Correct:**
```json
{
  "count_one": "{{count}} empleado",
  "count_other": "{{count}} empleados"  // ✅ Both forms provided
}
```

## Translation Guidelines

### Terminology Consistency

Maintain consistent translations for key terms:

| English | Spanish | Context |
|---------|---------|---------|
| Employee | Empleado | Person in organization |
| Performance | Desempeño | Work performance rating |
| Potential | Potencial | Growth potential rating |
| Grid | Cuadrícula | 9-box grid layout |
| Box | Casilla | Individual grid cell |
| Changes | Cambios | Tracked modifications |
| Filter | Filtro | Data filtering |
| Export | Exportar | Save to Excel |
| Import | Importar | Load from Excel |

**Create your own glossary** as you work through the translations to maintain consistency.

### Tone and Style

- **Use formal "usted" form** - The application uses professional language
- **Be concise** - Match the brevity of English where possible
- **Be clear** - Avoid ambiguity, especially in instructions
- **Be consistent** - Use the same translations for repeated terms

### Handling Technical Terms

Some terms may not translate well:
- **Excel** - Keep as "Excel" (product name)
- **9Boxer** - Keep as "9Boxer" (product name)
- **API** - Keep as "API" (technical term)

When in doubt, ask the development team if a term should be translated or kept in English.

## Tools and Resources

### Recommended Tools

- **Text Editor**: Any editor works (Notepad++, VS Code, Sublime Text)
- **JSON Validator**: https://jsonlint.com/ - Verify your JSON is valid
- **JSON Formatter**: https://jsonformatter.org/ - Format and beautify JSON
- **Character Counter**: Check text length to avoid layout issues

### Testing Tools

- **Browser DevTools**: Check for errors in browser console
- **Language Switcher**: Built into the app's top-right corner
- **Clear Browser Cache**: Sometimes needed to see updated translations

## Getting Help

If you encounter issues:

1. **Check this guide** for common patterns and mistakes
2. **Validate your JSON** using an online validator
3. **Compare with English file** to verify structure matches
4. **Contact the development team** with specific questions:
   - Which key/file you're working on
   - What you tried
   - What error or issue you're seeing
   - Screenshot if applicable

## Submitting Your Work

When you've completed translations:

1. **Run final quality check** using the checklist above
2. **Validate JSON** one last time
3. **Provide summary** of what was translated/updated
4. **Note any questions** or uncertain translations
5. **Submit files** according to your team's workflow (Git, email, etc.)

## Related Documentation

- [i18n Developer Guide](./README.md) - Technical overview for developers
- [Adding New Strings](./adding-new-strings.md) - How developers add translatable text
- [Testing Guide](./testing-guide.md) - How developers test i18n

## Appendix: Translation File Structure

The translation files are organized by feature area:

```
app.*               - Global application strings
dashboard.*         - Main dashboard interface
  appBar.*          - Top application bar
  fileMenu.*        - File operations menu
  filters.*         - Data filtering controls
grid.*              - 9-box grid display
panel.*             - Right side panel
  details.*         - Employee details view
  statistics.*      - Statistics view
  changes.*         - Change tracking view
  intelligence.*    - AI insights view
dialogs.*           - Dialog windows and modals
forms.*             - Form components
messages.*          - Notification messages
  success.*         - Success messages
  error.*           - Error messages
  warning.*         - Warning messages
  info.*            - Information messages
common.*            - Reusable UI elements
```

This structure helps you find related translations together.
