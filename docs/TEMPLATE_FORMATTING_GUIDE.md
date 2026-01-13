# Template Formatting Guide

## Common Template Errors

When generating documents, you may encounter template formatting errors. These are typically caused by how Microsoft Word handles placeholders internally.

### Error Types

#### 1. Duplicate Open Tag
**Error Message:** `Duplicate open tag found near: "{{placeholder}}"`

**Cause:** Word has split your placeholder across multiple XML tags internally, creating duplicate opening braces.

**Solution:**
1. Select the entire placeholder (e.g., `{{name}}`)
2. Clear all formatting: Press `Ctrl+Space` or use Format → Clear Formatting
3. Retype the placeholder manually
4. Do NOT copy-paste placeholders - always type them

#### 2. Duplicate Close Tag
**Error Message:** `Duplicate close tag found near: "{{placeholder}}"`

**Cause:** Similar to duplicate open tag - Word has fragmented the closing braces.

**Solution:** Same as above - clear formatting and retype.

### Best Practices for Creating Templates

1. **Type Placeholders Manually**
   - Always type `{{placeholder}}` directly
   - Never copy-paste placeholders from other documents

2. **Use Plain Text**
   - Keep placeholders in plain text format
   - Avoid applying bold, italic, or other formatting to placeholders
   - Apply formatting to the surrounding text instead

3. **Avoid Mid-Placeholder Edits**
   - Don't edit in the middle of a placeholder
   - If you need to change a placeholder, delete it completely and retype

4. **Test Your Template**
   - After creating placeholders, save and test the template
   - Generate a sample document to verify it works

5. **Simple Formatting**
   - Keep the document structure simple
   - Complex formatting can interfere with placeholder detection

### How to Fix a Broken Template

If you encounter errors:

1. **Identify the Problem Placeholder**
   - The error message will show which placeholder is causing issues
   - Example: `Duplicate open tag found near: "{{name}}"`

2. **Fix the Placeholder**
   - Find the placeholder in your Word document
   - Select it completely (including the `{{` and `}}`)
   - Press `Ctrl+Space` to clear formatting
   - Delete the placeholder
   - Retype it manually

3. **Save and Test**
   - Save the document
   - Re-upload it to the system
   - Try generating a document again

### Example: Correct Placeholder Usage

```
Good:
Hello {{name}}, welcome to {{company}}!

Bad (copied/pasted):
Hello {{name}}, welcome to {{company}}!  ← May have hidden formatting

Bad (partially formatted):
Hello {{name}}, welcome to {{company}}!  ← Bold applied to placeholder
```

### Technical Details

The system uses `docxtemplater` to process Word documents. When Word saves a document, it may split text across multiple XML tags, especially if:
- Text was copied from another source
- Formatting was applied and removed
- The document was edited multiple times
- Track changes was enabled

This splitting causes the placeholder parser to see multiple opening or closing tags, resulting in validation errors.

### Need Help?

If you continue to experience issues:
1. Create a new Word document from scratch
2. Type all content and placeholders manually
3. Keep formatting minimal
4. Test with a single placeholder first
5. Gradually add more placeholders

Remember: **Always type placeholders manually, never copy-paste them!**
