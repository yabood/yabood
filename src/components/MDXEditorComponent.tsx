import React from 'react';
import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';

interface MDXEditorComponentProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

const MDXEditorComponent = React.forwardRef<MDXEditorMethods, MDXEditorComponentProps>(
  ({ initialContent = '', onChange, readOnly = false }, ref) => {
    const [MDXEditor, setMDXEditor] = React.useState<typeof import('@mdxeditor/editor').MDXEditor | null>(null);
    const [plugins, setPlugins] = React.useState<import('@mdxeditor/editor').MDXEditorPlugin[]>([]);

    React.useEffect(() => {
      // Dynamically import MDXEditor to avoid SSR issues
      import('@mdxeditor/editor').then((mod) => {
        setMDXEditor(() => mod.MDXEditor as typeof mod.MDXEditor);
        setPlugins([
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
          mod.jsxPlugin && mod.jsxPlugin(),
          mod.diffSourcePlugin({ viewMode: 'rich-text' }),
          mod.frontmatterPlugin(),
        ].filter(Boolean));
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
          plugins={plugins}
          contentEditableClassName="min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
);

MDXEditorComponent.displayName = 'MDXEditorComponent';

export default MDXEditorComponent;