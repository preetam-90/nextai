import { Artifact } from '@/components/create-artifact';
import { CodeEditor, SupportedLanguage } from '@/components/code-editor';
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
  EyeIcon,
} from '@/components/icons';
import { detectLanguage } from '@/lib/utils/language-detector';
import { HtmlPreview } from '@/components/html-preview';
import { MarkdownPreview } from '@/components/markdown-preview';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import {
  Console,
  type ConsoleOutput,
  type ConsoleOutputContent,
} from '@/components/console';

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ['basic'];

  if (code.includes('matplotlib') || code.includes('plt.')) {
    handlers.push('matplotlib');
  }

  return handlers;
}

interface Metadata {
  outputs: Array<ConsoleOutput>;
  language: SupportedLanguage;
  filename?: string;
  showPreview?: boolean;
  css?: string;
  js?: string;
}

export const codeArtifact = new Artifact<'code', Metadata>({
  kind: 'code',
  description:
    'Useful for code generation in various languages including Python, JavaScript, C, C++, HTML, CSS, and more. Code execution is only available for Python code.',
  initialize: async ({ setMetadata }) => {
    // Initialize with default metadata - language will be detected during streaming
    setMetadata({
      outputs: [],
      language: 'javascript', // default language
      showPreview: false,
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'data-codeDelta') {
      // Get the updated content
      const updatedContent = streamPart.data;
      
      // Detect language from content
      const detectedLanguage = detectLanguage('', updatedContent);
      
      // Update metadata with detected language
      setMetadata((metadata) => ({
        ...metadata,
        language: detectedLanguage,
      }));
      
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
    // Ensure language is set, detect from content if not available
    const language = metadata?.language || detectLanguage('', content || '');
    
    // Function to render the appropriate preview based on language
    const renderPreview = () => {
      if (!metadata?.showPreview || !content) return null;
      
      switch (language) {
        case 'html':
          return <HtmlPreview htmlContent={content} css={metadata?.css || ''} js={metadata?.js || ''} />;
        case 'markdown':
          return <MarkdownPreview markdownContent={content} />;
        default:
          return null;
      }
    };
    
    return (
      <>
        <div className="px-1">
          <CodeEditor {...props} content={content} language={language} />        
        </div>
        
        {metadata?.showPreview && renderPreview()}

        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({
                ...metadata,
                outputs: [],
              });
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <EyeIcon size={18} />,
      label: 'Preview',
      description: 'Toggle preview for supported languages (HTML, Markdown)',
      onClick: ({ content, setMetadata }) => {
        const language = detectLanguage('', content);
        
        // Only show preview for HTML and Markdown for now
        if (language !== 'html' && language !== 'markdown') {
          toast.error(`Preview not available for ${language} code`);
          return;
        }
        
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: !metadata.showPreview,
        }));
      },
    },
    {
      icon: <PlayIcon size={18} />,
      label: 'Run',
      description: 'Execute code',
      onClick: async ({ content, setMetadata }) => {
        // Check if the language is Python, as we only support Python execution currently
        const language = detectLanguage('', content);
        
        if (language !== 'python') {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs,
              {
                id: generateUUID(),
                contents: [{ 
                  type: 'text', 
                  value: `Code execution is only available for Python. This appears to be ${language} code. You can view and edit the code, but execution is not supported.` 
                }],
                status: 'failed',
              },
            ],
          }));
          return;
        }
        
        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            {
              id: runId,
              contents: [],
              status: 'in_progress',
            },
          ],
        }));

        try {
          // @ts-expect-error - loadPyodide is not defined
          const currentPyodideInstance = await globalThis.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
          });

          currentPyodideInstance.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith('data:image/png;base64')
                  ? 'image'
                  : 'text',
                value: output,
              });
            },
          });

          await currentPyodideInstance.loadPackagesFromImports(content, {
            messageCallback: (message: string) => {
              setMetadata((metadata) => ({
                ...metadata,
                outputs: [
                  ...metadata.outputs.filter((output) => output.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: 'text', value: message }],
                    status: 'loading_packages',
                  },
                ],
              }));
            },
          });

          const requiredHandlers = detectRequiredHandlers(content);
          for (const handler of requiredHandlers) {
            if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
              await currentPyodideInstance.runPythonAsync(
                OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS],
              );

              if (handler === 'matplotlib') {
                await currentPyodideInstance.runPythonAsync(
                  'setup_matplotlib_output()',
                );
              }
            }
          }

          await currentPyodideInstance.runPythonAsync(content);

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: 'completed',
              },
            ],
          }));
        } catch (error: any) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ type: 'text', value: error.message }],
                status: 'failed',
              },
            ],
          }));
        }
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
              text: 'Add comments to the code snippet for understanding',
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
              text: 'Add logs to the code snippet for debugging',
            },
          ],
        });
      },
    },
  ],
});
