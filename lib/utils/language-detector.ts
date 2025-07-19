import { SupportedLanguage } from '@/components/code-editor';

// Extensions to language mapping
const extensionMap: Record<string, SupportedLanguage> = {
  py: 'python',
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  html: 'html',
  css: 'css',
  md: 'markdown',
  json: 'json',
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
};

// Content-based language detection patterns
const languagePatterns: Record<SupportedLanguage, RegExp[]> = {
  python: [
    /^#!/,
    /\bimport\s+[a-zA-Z0-9_]+\b/,
    /\bdef\s+[a-zA-Z0-9_]+\s*\(/,
    /\bclass\s+[a-zA-Z0-9_]+[^\n]*:/,
  ],
  javascript: [
    /\bconst\b|\blet\b|\bvar\b/,
    /\bfunction\b|\b=>\b/,
    /\bimport\s+.*\bfrom\b/,
    /\bexport\b/,
  ],
  jsx: [
    /\bReact\b/,
    /<[A-Z][a-zA-Z0-9]*(\s+[a-zA-Z0-9]+="[^"]*")*\s*>/,
    /<\/[A-Z][a-zA-Z0-9]*>/,
  ],
  typescript: [
    /:\s*[A-Za-z<>\[\]]+/,
    /\binterface\b|\btype\b/,
    /\bReadonly\b|\bPartial\b|\bPick\b|\bRecord\b/,
  ],
  tsx: [
    /:\s*[A-Za-z<>\[\]]+/,
    /<[A-Z][a-zA-Z0-9]*(\s+[a-zA-Z0-9]+="[^"]*")*\s*>/,
    /<\/[A-Z][a-zA-Z0-9]*>/,
  ],
  html: [
    /<(!DOCTYPE|html|head|body|div|span|h1|p|a|img|ul|li|table)/i,
    /<\/[a-z]+>/i,
  ],
  css: [
    /[.#][a-zA-Z0-9_-]+\s*{/,
    /@media\b|\@import\b|\@keyframes\b/,
    /\b(margin|padding|color|background|font|display):/,
  ],
  markdown: [
    /^#\s+/m,
    /\*\*\w+\*\*/,
    /\[.+\]\(.+\)/,
    /^\s*-\s+/m,
  ],
  json: [
    /^[\s]*{/,
    /[\s]*}[\s]*$/,
    /"[a-zA-Z0-9_]+"\s*:/,
  ],
  c: [
    /#include\s*<[^>]+>/,
    /\bint\s+main\s*\(/,
    /\bprintf\s*\(/,
    /\b(int|char|float|double|void)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
  ],
  cpp: [
    /#include\s*<[^>]+>/,
    /\bstd::/,
    /\bcout\s*<</,
    /\bnamespace\s+/,
    /\bclass\s+[a-zA-Z_][a-zA-Z0-9_]*\s*{/,
  ],
};

/**
 * Detect the programming language based on file extension
 */
export function detectLanguageFromExtension(filename: string): SupportedLanguage {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension && extension in extensionMap
    ? extensionMap[extension]
    : 'python'; // Default to Python
}

/**
 * Detect the programming language based on code content
 */
export function detectLanguageFromContent(content: string): SupportedLanguage {
  const scores: Record<SupportedLanguage, number> = {
    python: 0,
    javascript: 0,
    typescript: 0,
    jsx: 0,
    tsx: 0,
    html: 0,
    css: 0,
    markdown: 0,
    json: 0,
    c: 0,
    cpp: 0,
  };

  // Detect language based on patterns in content
  Object.entries(languagePatterns).forEach(([language, patterns]) => {
    patterns.forEach((pattern) => {
      if (pattern.test(content)) {
        scores[language as SupportedLanguage] += 1;
      }
    });
  });

  // Find language with highest score
  let detectedLanguage: SupportedLanguage = 'python';
  let highestScore = 0;

  Object.entries(scores).forEach(([language, score]) => {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = language as SupportedLanguage;
    }
  });

  return detectedLanguage;
}

/**
 * Detect language using both filename and content (if available)
 */
export function detectLanguage(
  filename: string = '',
  content: string = ''
): SupportedLanguage {
  // If we have a filename with extension, use that first
  if (filename && filename.includes('.')) {
    return detectLanguageFromExtension(filename);
  }
  
  // If we have content, analyze it
  if (content) {
    return detectLanguageFromContent(content);
  }
  
  // Default fallback
  return 'python';
}
