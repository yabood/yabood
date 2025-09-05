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
    return (
      <div className="prose max-w-none">
        <MDXEditor
          ref={ref}
          markdown={initialContent}
          onChange={onChange}
          readOnly={readOnly}
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
            codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                txt: 'Text',
                js: 'JavaScript',
                jsx: 'JSX',
                ts: 'TypeScript',
                tsx: 'TSX',
                css: 'CSS',
                html: 'HTML',
                python: 'Python',
                bash: 'Bash',
                json: 'JSON',
                md: 'Markdown',
              },
            }),
            diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
            frontmatterPlugin(),
          ]}
          contentEditableClassName="min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
);

MDXEditorClient.displayName = 'MDXEditorClient';

export default MDXEditorClient;