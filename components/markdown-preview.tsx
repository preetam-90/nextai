'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  markdownContent: string;
}

export function MarkdownPreview({ markdownContent }: MarkdownPreviewProps) {
  return (
    <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="text-sm font-medium">Markdown Preview</span>
      </div>
      <div className="p-4 prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
}
