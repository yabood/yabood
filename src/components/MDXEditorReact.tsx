import React, { useEffect } from 'react';
import MDXEditorClient from './MDXEditorClient';

interface MDXEditorReactProps {
  initialContent?: string;
}

const MDXEditorReact: React.FC<MDXEditorReactProps> = ({
  initialContent = '# Start writing...',
}) => {
  const handleChange = (content: string) => {
    // Store content globally for access from other scripts
    if (typeof window !== 'undefined') {
      (window as Window & { mdxEditorContent?: string }).mdxEditorContent = content;
    }
  };

  useEffect(() => {
    // Set initial content
    if (typeof window !== 'undefined') {
      (window as Window & { mdxEditorContent?: string }).mdxEditorContent = initialContent;
    }
  }, [initialContent]);

  return <MDXEditorClient initialContent={initialContent} onChange={handleChange} />;
};

export default MDXEditorReact;
