import React from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  jsxPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  UndoRedo,
  DiffSourceToggleWrapper,
  Separator,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MDXEditorClientProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

const MDXEditorClient = React.forwardRef<MDXEditorMethods, MDXEditorClientProps>(
  ({ initialContent = '', onChange, readOnly = false }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleError = React.useCallback((error: Error) => {
      console.error('MDX Editor Error:', error);
      setHasError(true);
      setErrorMessage(error.message);
    }, []);

    const resetError = React.useCallback(() => {
      setHasError(false);
      setErrorMessage('');
    }, []);

    if (hasError) {
      return (
        <div className="prose max-w-none">
          <div className="p-4 border border-red-300 rounded-lg bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Editor Error</h3>
            <p className="text-red-700 mb-4">{errorMessage}</p>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    try {
      return (
        <div className="prose max-w-none">
          <MDXEditor
            ref={ref}
            markdown={initialContent}
            onChange={onChange}
            readOnly={readOnly}
            onError={handleError}
            plugins={[
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertImage />
                  <Separator />
                  <InsertTable />
                  <Separator />
                  <InsertCodeBlock />
                  <Separator />
                  <InsertThematicBreak />
                  <Separator />
                  <DiffSourceToggleWrapper />
                </>
              ),
            }),
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin({ 
              defaultCodeBlockLanguage: 'text',
              codeBlockEditorDescriptors: [
                {
                  match: (language, meta) => language === 'txt' || language === 'text' || language === '',
                  priority: 0,
                  Editor: (props) => <div {...props} />
                }
              ]
            }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                '': 'Plain text',
                text: 'Plain text',
                txt: 'Text',
                js: 'JavaScript',
                javascript: 'JavaScript',
                jsx: 'JSX',
                ts: 'TypeScript',
                typescript: 'TypeScript',
                tsx: 'TSX',
                css: 'CSS',
                html: 'HTML',
                xml: 'XML',
                python: 'Python',
                py: 'Python',
                bash: 'Bash',
                shell: 'Shell',
                sh: 'Shell',
                json: 'JSON',
                md: 'Markdown',
                markdown: 'Markdown',
                yaml: 'YAML',
                yml: 'YAML',
                astro: 'Astro',
                sql: 'SQL',
              },
            }),
            jsxPlugin(),
            diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
            frontmatterPlugin(),
          ]}
            contentEditableClassName="min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown editor error'));
      return (
        <div className="prose max-w-none">
          <div className="p-4 border border-red-300 rounded-lg bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Editor Loading Error</h3>
            <p className="text-red-700">There was an error loading the MDX editor. Please try refreshing the page.</p>
          </div>
        </div>
      );
    }
  }
);

MDXEditorClient.displayName = 'MDXEditorClient';

export default MDXEditorClient;