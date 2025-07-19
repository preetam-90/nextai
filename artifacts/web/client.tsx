'use client';

import { Artifact } from '@/components/create-artifact';
import { CodeEditor, SupportedLanguage } from '@/components/code-editor';
import {
  CopyIcon,
  EyeIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { detectLanguage } from '@/lib/utils/language-detector';
import { HtmlPreview } from '@/components/html-preview';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import { useCallback, useState } from 'react';

interface Metadata {
  language: SupportedLanguage;
  showPreview: boolean;
  html: string;
  css: string;
  javascript: string;
}

export const webArtifact = new Artifact<'web', Metadata>({
  kind: 'web',
  description: 'Create and run web applications with HTML, CSS, and JavaScript',
  initialize: async ({ setMetadata }) => {
    // Initialize with default metadata - language will be detected during streaming
    setMetadata({
      language: 'html', // default language
      showPreview: false,
      html: '',
      css: '',
      javascript: ''
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'data-codeDelta') {
      // Get the updated content
      const updatedContent = streamPart.data;
      
      // Detect language from content
      const detectedLanguage = detectLanguage('', updatedContent);
      
      // Update metadata based on the detected language
      setMetadata((metadata) => {
        const newMetadata = { ...metadata };
        
        if (detectedLanguage === 'html') {
          newMetadata.html = updatedContent;
        } else if (detectedLanguage === 'css') {
          newMetadata.css = updatedContent;
        } else if (detectedLanguage === 'javascript' || detectedLanguage === 'jsx') {
          newMetadata.javascript = updatedContent;
        }
        
        newMetadata.language = detectedLanguage;
        return newMetadata;
      });
      
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: updatedContent,
        isVisible:
          draftArtifact.status === 'streaming' &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: 'streaming',
      }));
    }
  },
  content: ({ metadata, setMetadata, content, ...props }) => {
    // States to track the current editing mode
    const [currentMode, setCurrentMode] = useState<'html' | 'css' | 'js'>(
      metadata?.language === 'css' ? 'css' : 
      metadata?.language === 'javascript' ? 'js' : 'html'
    );
    
    // Get content based on current mode
    const getCurrentContent = useCallback(() => {
      if (!metadata) return content || '';
      
      switch (currentMode) {
        case 'html':
          return metadata.html || '';
        case 'css':
          return metadata.css || '';
        case 'js':
          return metadata.javascript || '';
        default:
          return content || '';
      }
    }, [content, currentMode, metadata]);
    
    // Get language based on current mode
    const getCurrentLanguage = useCallback((): SupportedLanguage => {
      switch (currentMode) {
        case 'html':
          return 'html';
        case 'css':
          return 'css';
        case 'js':
          return 'javascript';
        default:
          return 'html';
      }
    }, [currentMode]);
    
    // Handle content changes
    const handleContentChange = useCallback((updatedContent: string, debounce: boolean) => {
      setMetadata((metadata) => {
        if (!metadata) return metadata;
        
        const newMetadata = { ...metadata };
        
        switch (currentMode) {
          case 'html':
            newMetadata.html = updatedContent;
            break;
          case 'css':
            newMetadata.css = updatedContent;
            break;
          case 'js':
            newMetadata.javascript = updatedContent;
            break;
        }
        
        return newMetadata;
      });
      
      // Call the original onSaveContent to maintain default behavior
      if (props.onSaveContent) {
        props.onSaveContent(updatedContent, debounce);
      }
    }, [currentMode, props, setMetadata]);
    
    return (
      <>
        <div className="px-1">
          {/* Tabs for switching between HTML, CSS, and JS */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-2">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                currentMode === 'html' 
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setCurrentMode('html')}
            >
              HTML
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                currentMode === 'css' 
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setCurrentMode('css')}
            >
              CSS
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                currentMode === 'js' 
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setCurrentMode('js')}
            >
              JavaScript
            </button>
          </div>
          
          <CodeEditor 
            {...props} 
            content={getCurrentContent()} 
            language={getCurrentLanguage()}
            onSaveContent={handleContentChange}
          />        
        </div>
        
        {metadata?.showPreview && (
          <div className="mt-4">
            <HtmlPreview 
              htmlContent={metadata.html} 
              css={metadata.css} 
              js={metadata.javascript} 
            />
          </div>
        )}
      </>
    );
  },
  actions: [
    {
      icon: <EyeIcon size={18} />,
      label: 'Preview',
      description: 'Toggle web preview',
      onClick: ({ setMetadata }) => {
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: !metadata.showPreview,
        }));
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy code to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: 'Add comments',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Add comments to the code snippet for better understanding',
            },
          ],
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: 'Add logs',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Add debug logs to the JavaScript code',
            },
          ],
        });
      },
    },
  ],
});
