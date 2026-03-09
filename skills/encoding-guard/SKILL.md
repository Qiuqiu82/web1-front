---
name: encoding-guard
description: Prevent and recover from UTF-8/BOM/terminal-encoding corruption when editing Java, Vue, JS, TS, JSON, YAML, or config files on Windows PowerShell. Use when Chinese text, BOM-sensitive files, or repeated mojibake, unterminated strings, or \ufeff errors appear.
---

# Encoding Guard

Use this skill when:
- the environment is Windows PowerShell
- files contain Chinese text or mixed-language UI copy
- Java reports `illegal character: '\ufeff'`
- Vue/JS/TS files start showing mojibake or broken string literals after edits
- repeated shell-based rewrites are corrupting source files
- you need a safe, repeatable way to check BOM and recover damaged files

## What went wrong in this project

The recurring failures came from four sources:

1. **UTF-8 BOM inserted into sensitive files**
   - Java source is especially sensitive when a hidden BOM lands at the start of the file.
   - Symptom: `illegal character: '\ufeff'`.

2. **Terminal display encoding != file encoding**
   - PowerShell console output displayed Chinese as mojibake.
   - That visual corruption sometimes reflected only the terminal, but sometimes got copied back into source during later rewrites.

3. **Large shell rewrites with raw Chinese literals**
   - Rewriting `.vue`, `.js`, and `.ts` files from PowerShell with direct Chinese text was fragile.
   - Once one broken line got re-saved, it could create unterminated strings, invalid template content, or parser errors.

4. **Incremental patching on already-corrupted files**
   - Small replacements on partially damaged files often made syntax worse.
   - In practice, full clean rewrites were safer than repeated micro-edits once corruption spread.

## Default prevention rules

Always follow these rules unless the user explicitly asks otherwise.

### 1) Write files as UTF-8 without BOM

When using PowerShell to write text files, prefer:

```powershell
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $enc)
```

For line arrays:

```powershell
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($path, $lines, $enc)
```

Never rely on ambiguous default encodings for source files.

### 2) Prefer Unicode escapes for fragile static text

If the console or shell is already showing mojibake, avoid writing raw Chinese literals into source.
Use `\uXXXX` escapes for:
- JS string constants
- fallback UI copy
- status labels
- message strings inserted through shell rewrites
- object maps or text dictionaries likely to be edited through PowerShell

This is especially useful for:
- `const TEXTS = { ... }`
- JavaScript object maps
- inline string replacements
- risky shell-driven rewrites of frontend files

### 3) Treat console display as untrusted

If `Get-Content` output looks garbled, do **not** assume the file is definitely broken.
First verify through:
- parser, lint, or build output
- byte-level BOM checks
- targeted syntax validation

Do not copy garbled console text back into files.

### 4) For corrupted files, prefer full clean rewrites

If a file has multiple broken strings, mojibake, or template parse errors:
- stop doing tiny replacements
- rewrite the whole file or the whole damaged block from a known-good structure
- save once with UTF-8 without BOM
- validate immediately

### 5) Validate right after risky edits

After any encoding-sensitive rewrite, run the smallest useful validation:
- Vue, JS, TS: `eslint <files>`
- Java: compile or module build if available
- JSON or YAML: parser validation if available
- byte check for BOM when relevant

## Safe workflow

### A. Before editing

1. Identify whether the target file is BOM-sensitive.
   - Highest risk: `.java`, `.vue`, `.js`, `.ts`, `.json`, `.yml`, `.yaml`, `.properties`.
2. If using shell rewrite, prepare UTF-8 without BOM output explicitly.
3. If the terminal already garbles Chinese, switch planned inserted text to Unicode escapes.
4. If this is a broad rewrite, plan validation before the first write.

### B. During editing

1. Make one coherent change block instead of many tiny string replacements.
2. Avoid mixing raw Chinese literals and shell interpolation in long commands.
3. Prefer structured rewrites over regex-heavy patching for large template or script blocks.
4. If a file is already partially corrupted, rebuild the damaged section or the whole file from clean content.

### C. After editing

1. Check BOM.
2. Run syntax validation.
3. If validation fails with gibberish strings, replace those strings with Unicode escapes or rewrite the affected block.
4. If validation passes but the console still looks wrong, do not rewrite just to satisfy terminal output.

## Frontend-specific guidance

Use this section when editing `.vue`, `.js`, or `.ts` files.

### Typical frontend failure modes
- `Unterminated string constant`
- template parse errors
- broken attribute parsing in `.vue`
- mysteriously invalid object literals after shell rewrite
- mojibake text inside `TEXTS`, `computed`, `data`, or `methods`

### Frontend recovery steps
1. Inspect the nearest string literal, object map, or template attribute.
2. Replace suspicious literals with Unicode escapes or temporary ASCII.
3. If many UI strings are broken, rewrite the entire component block instead of chasing single lines.
4. Re-run `eslint` on the minimum set of files.

### Frontend defaults
- Prefer escaped text inside large `const TEXTS = {}` blocks if shell writes are involved.
- Prefer a full component rewrite when both `<template>` and `<script>` are already damaged.
- Do not trust terminal mojibake as proof of file corruption if lint passes.

## Java-specific guidance

Use this section when editing `.java` files.

### Typical Java failure modes
- `illegal character: '\ufeff'`
- compile failure only on one file after a shell rewrite
- source looks normal in editor but compiler fails at the first character

### Java recovery steps
1. Check the first bytes for BOM.
2. Rewrite the file as UTF-8 without BOM.
3. Re-run compile.
4. If the file contains Chinese comments or strings and the shell is unstable, avoid shell-driven partial rewrites.

### Java defaults
- Always BOM-check Java files after shell-based rewrites.
- Avoid rewriting Java source with tools that may silently insert BOM.
- If the file is small, rewrite the entire file cleanly rather than doing byte-level surgery.

## Recovery playbook

### Case 1: Java reports `\ufeff`
1. Rewrite the file as UTF-8 without BOM.
2. Re-run compile.
3. If the file was edited by multiple tools, inspect the first bytes for BOM.

### Case 2: Vue or JS says `Unterminated string constant`
1. Inspect nearby lines for garbled Chinese or half-written quotes.
2. Replace suspicious literals with Unicode escapes or plain ASCII.
3. If multiple lines are affected, rewrite the entire component or script block.
4. Re-run `eslint`.

### Case 3: Console shows mojibake but lint passes
1. Assume display issue first, not file corruption.
2. Avoid rewriting from copied terminal output.
3. Keep editing through controlled writes only.

### Case 4: Repeated patch attempts keep making it worse
1. Stop incremental patching.
2. Reconstruct the target file cleanly.
3. Save with UTF-8 without BOM.
4. Validate immediately.

## Bundled script

Use `scripts/check-bom.ps1` when you need a quick BOM audit.

### Examples

Check one file:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/check-bom.ps1 -Path "src/pages/tryon/index.vue"
```

Check a folder recursively:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/check-bom.ps1 -Path "src" -Recurse
```

Output includes:
- file path
- whether UTF-8 BOM is present
- quick status summary

## Preferred patterns for this environment

### PowerShell write pattern

```powershell
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $enc)
```

### Encoding-safe JS text pattern

```js
const TEXTS = {
  title: '\u63a8\u8350\u5217\u8868',
  action: '\u53bb3D\u8bd5\u7a7f'
}
```

### BOM check pattern

```powershell
$bytes = [System.IO.File]::ReadAllBytes($path)
$hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191
```

## Decision rules

- If the file is small and only one line is corrupted: do a targeted fix.
- If multiple strings or templates are corrupted: rewrite the block.
- If the terminal cannot display Chinese reliably: use Unicode escapes.
- If the target is Java backend code: always double-check BOM.
- If validation passes and only console output looks wrong: do not rewrite just to make the console look right.

## Deliverables this skill should bias toward

When helping on encoding-sensitive work, prefer to provide:
- a short root-cause summary
- the exact safe write method used
- whether BOM is present
- the validation command run
- what rule should be followed next time to avoid recurrence