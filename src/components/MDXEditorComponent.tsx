import React from 'react';
import type { MDXEditorMethods } from '@mdxeditor/editor';

interface MDXEditorComponentProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

const MDXEditorComponent = React.forwardRef<MDXEditorMethods, MDXEditorComponentProps>(
  ({ initialContent = '', onChange, readOnly = false }, ref) => {
    const [MDXEditor, setMDXEditor] = React.useState<
      typeof import('@mdxeditor/editor').MDXEditor | null
    >(null);

    React.useEffect(() => {
      // Dynamically import MDXEditor to avoid SSR issues
      import('@mdxeditor/editor').then((mod) => {
        setMDXEditor(() => mod.MDXEditor as typeof mod.MDXEditor);
        // Plugins are temporarily disabled for stability
        /*setPlugins([
          mod.headingsPlugin(),
          mod.listsPlugin(),
          mod.quotePlugin(),
          mod.thematicBreakPlugin(),
          mod.markdownShortcutPlugin(),
          mod.linkPlugin(),
          mod.linkDialogPlugin(),
          mod.imagePlugin(),
          mod.tablePlugin(),
          mod.codeBlockPlugin({ 
            defaultCodeBlockLanguage: 'text',
            codeBlockEditorDescriptors: [
              {
                match: (language, meta) => language === 'txt' || language === 'text' || language === '',
                priority: 0,
                Editor: (props) => React.createElement('div', props)
              }
            ]
          }),
          mod.codeMirrorPlugin({
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
          mod.jsxPlugin && mod.jsxPlugin({
            jsxComponentDescriptors: [
              {
                name: 'Image',
                kind: 'flow',
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
                Editor: (props: { mdastNode: { name: string; type: 'mdxJsxFlowElement' | 'mdxJsxTextElement'; attributes: Array<{ name: string; type: string; value: any }>; children: any[] }; children?: React.ReactNode }) => {
                  const { mdastNode } = props;
                  const attributes = mdastNode.attributes || [];
                  const getAttr = (name: string) => {
                    const attr = attributes.find((p: { name: string; value: string }) => p.name === name);
                    return attr?.value || '';
                  };
                  
                  const src = getAttr('src');
                  const alt = getAttr('alt');
                  const width = getAttr('width');
                  const height = getAttr('height');
                  
                  return React.createElement('div', {
                    style: { 
                      border: '2px dashed #e2e8f0', 
                      padding: '16px', 
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      textAlign: 'center',
                      fontFamily: 'system-ui, sans-serif'
                    }
                  }, [
                    React.createElement('div', { 
                      key: 'icon',
                      style: { fontSize: '24px', marginBottom: '8px' } 
                    }, '🖼️'),
                    React.createElement('div', {
                      key: 'title', 
                      style: { fontWeight: 'bold', marginBottom: '4px' }
                    }, 'Image Component'),
                    src && React.createElement('div', {
                      key: 'src',
                      style: { fontSize: '12px', color: '#64748b', marginBottom: '2px' }
                    }, `src: ${src}`),
                    alt && React.createElement('div', {
                      key: 'alt',
                      style: { fontSize: '12px', color: '#64748b', marginBottom: '2px' }
                    }, `alt: ${alt}`),
                    (width || height) && React.createElement('div', {
                      key: 'dimensions',
                      style: { fontSize: '12px', color: '#64748b' }
                    }, `${width || '?'} × ${height || '?'}`),
                  ]);
                }
              },
              {
                name: 'div',
                kind: 'flow',
                props: [
                  { name: 'className', type: 'string' },
                  { name: 'style', type: 'string' },
                ],
                hasChildren: true,
                Editor: (props: { mdastNode?: any; children?: React.ReactNode }) => React.createElement('div', { className: 'jsx-div' }, props.children)
              }
            ]
          }),
          mod.diffSourcePlugin({ viewMode: 'rich-text' }),
          mod.frontmatterPlugin(),
        ].filter(Boolean)); */
      });

      // Import styles
      import('@mdxeditor/editor/style.css');
    }, []);

    if (!MDXEditor) {
      return <div className="p-4">Loading editor...</div>;
    }

    return (
      <div className="prose max-w-none">
        <MDXEditor
          ref={ref}
          markdown={initialContent}
          onChange={onChange}
          readOnly={readOnly}
          plugins={[]}
          contentEditableClassName="min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
);

MDXEditorComponent.displayName = 'MDXEditorComponent';

export default MDXEditorComponent;
