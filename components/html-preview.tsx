'use client';

import React, { useEffect, useRef } from 'react';

interface HtmlPreviewProps {
  htmlContent: string;
  css?: string;
  js?: string;
}

export function HtmlPreview({ htmlContent, css = '', js = '' }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const document = iframeRef.current.contentWindow.document;
      
      // Clear existing content
      document.open();
      
      // Create a full HTML document with the provided HTML, CSS, and JavaScript
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              ${css}
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              ${js}
            </script>
          </body>
        </html>
      `;
      
      // Write the content to the iframe
      document.write(fullHtml);
      document.close();
    }
  }, [htmlContent, css, js]);

  return (
    <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="text-sm font-medium">HTML Preview</span>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full h-[500px] bg-white dark:bg-gray-900"
        title="HTML Preview"
        sandbox="allow-scripts allow-popups allow-forms"
      />
    </div>
  );
}
