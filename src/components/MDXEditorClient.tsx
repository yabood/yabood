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
                  <DiffSourceToggleWrapper options={['rich-text', 'source']}>
                    <BoldItalicUnderlineToggles />
                    <Separator />
                    <BlockTypeSelect />
                  </DiffSourceToggleWrapper>
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
            codeBlockPlugin({ defaultCodeBlockLanguage: 'text' }),
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
            jsxPlugin({
              jsxComponentDescriptors: [
                {
                  name: 'Image',
                  kind: 'flow', // or 'text' for inline components
                  source: './src/components',
                  props: [
                    { name: 'src', type: 'string' },
                    { name: 'alt', type: 'string' },
                    { name: 'width', type: 'number' },
                    { name: 'height', type: 'number' },
                    { name: 'quality', type: 'number' },
                    { name: 'format', type: 'string' },
                    { name: 'loading', type: 'string' },
                    { name: 'decoding', type: 'string' },
                  ],
                  hasChildren: false,
                  Editor: (props: any) => {
                    const { mdastNode } = props;
                    const attributes = mdastNode.attributes || [];
                    const getAttr = (name: string) => {
                      const attr = attributes.find(
                        (p: { name: string; value: string }) => p.name === name
                      );
                      return attr?.value || '';
                    };

                    const src = getAttr('src');
                    const alt = getAttr('alt');
                    const width = getAttr('width');
                    const height = getAttr('height');

                    return React.createElement(
                      'div',
                      {
                        style: {
                          border: '2px dashed #e2e8f0',
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          textAlign: 'center',
                          fontFamily: 'system-ui, sans-serif',
                        },
                      },
                      [
                        React.createElement(
                          'div',
                          {
                            key: 'icon',
                            style: { fontSize: '24px', marginBottom: '8px' },
                          },
                          '🖼️'
                        ),
                        React.createElement(
                          'div',
                          {
                            key: 'title',
                            style: { fontWeight: 'bold', marginBottom: '4px' },
                          },
                          'Image Component'
                        ),
                        src &&
                          React.createElement(
                            'div',
                            {
                              key: 'src',
                              style: { fontSize: '12px', color: '#64748b', marginBottom: '2px' },
                            },
                            `src: ${src}`
                          ),
                        alt &&
                          React.createElement(
                            'div',
                            {
                              key: 'alt',
                              style: { fontSize: '12px', color: '#64748b', marginBottom: '2px' },
                            },
                            `alt: ${alt}`
                          ),
                        (width || height) &&
                          React.createElement(
                            'div',
                            {
                              key: 'dimensions',
                              style: { fontSize: '12px', color: '#64748b' },
                            },
                            `${width || '?'} × ${height || '?'}`
                          ),
                      ]
                    );
                  },
                },
                {
                  name: 'div',
                  kind: 'flow',
                  props: [
                    { name: 'className', type: 'string' },
                    { name: 'style', type: 'string' },
                  ],
                  hasChildren: true,
                  Editor: (props: { mdastNode?: any; children?: React.ReactNode }) => {
                    return React.createElement('div', { className: 'jsx-div' }, props.children);
                  },
                },
              ],
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
