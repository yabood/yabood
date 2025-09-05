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
          mod.codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          mod.codeMirrorPlugin({
            codeBlockLanguages: {
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
          mod.diffSourcePlugin({ viewMode: 'rich-text' }),
          mod.frontmatterPlugin(),
        ]);
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