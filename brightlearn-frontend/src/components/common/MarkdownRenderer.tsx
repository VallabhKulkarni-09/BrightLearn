import React, { useEffect, useRef, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    marked: any;
    DOMPurify: any;
    hljs: any;
  }
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderContent = () => {
      try {
        if (!containerRef.current) return;

        // Check if libraries are loaded
        if (!window.marked || !window.DOMPurify) {
          // If not loaded yet, wait a bit and retry (CDN might be slow)
          setTimeout(renderContent, 500);
          return;
        }

        // 1. Parse Markdown to HTML
        // Marked 4.0+ uses marked.parse()
        const rawHtml = typeof window.marked.parse === 'function' 
          ? window.marked.parse(content) 
          : window.marked(content);
        
        // 2. Sanitize HTML
        const cleanHtml = window.DOMPurify.sanitize(rawHtml);
        
        // 3. Render
        containerRef.current.innerHTML = cleanHtml;

        // 4. Highlight code blocks
        if (window.hljs) {
          containerRef.current.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightElement(block as HTMLElement);
          });
        }
        setError(null);
      } catch (err) {
        console.error('Markdown rendering error:', err);
        setError('Failed to render content');
      }
    };

    renderContent();
  }, [content]);

  if (error) {
    return <div className="text-red-500 font-medium italic p-4 border border-red-100 rounded-xl bg-red-50/30">{error}</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content ${className}`}
    />
  );
};
