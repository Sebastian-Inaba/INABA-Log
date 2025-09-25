// src/components/UtilityComps/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    variant?: 'preview' | 'public';
}

// This is to hard set the styles for the markdown HTML, These styles will most likely be changed later
// Tried some other stuff but this was the only thing that worked

export function MarkdownRenderer({ content, className = '', variant = 'public' }: MarkdownRendererProps) {
    // Base styles that apply to all variants
    const baseStyles = `
    .markdown-content h1, 
    .markdown-content h2, 
    .markdown-content h3, 
    .markdown-content h4, 
    .markdown-content h5, 
    .markdown-content h6 {
      line-height: 1.2;
      margin: 1rem 0;
    }
    .markdown-content p { 
      margin: 1rem 0; 
      line-height: 1.7; 
    }
    .markdown-content ul { 
      list-style-type: disc; 
      margin: 1rem 0; 
      padding-left: 1.5rem; 
    }
    .markdown-content ol { 
      list-style-type: decimal; 
      margin: 1rem 0; 
      padding-left: 1.5rem; 
    }
    .markdown-content li { 
      margin: 0.5rem 0; 
    }
    .markdown-content blockquote { 
      border-left: 4px solid #60a5fa; 
      padding: 0.75rem 1rem; 
      margin: 1rem 0; 
      background: rgba(96, 165, 250, 0.1);
      border-radius: 0.25rem;
    }
    .markdown-content code { 
      background: #1f2937; 
      padding: 0.125rem 0.375rem; 
      border-radius: 0.25rem; 
      font-family: 'Courier New', monospace; 
      font-size: 0.875rem;
    }
    .markdown-content pre { 
      background: #1f2937; 
      padding: 1rem; 
      border-radius: 0.5rem; 
      overflow-x: auto; 
      margin: 1rem 0;
    }
    .markdown-content pre code { 
      background: none; 
      padding: 0; 
    }
    .markdown-content a { 
      color: #60a5fa; 
      text-decoration: underline; 
      transition: color 0.2s;
    }
    .markdown-content a:hover { 
      color: #93c5fd; 
    }
    .markdown-content img { 
      max-width: 100%; 
      height: auto; 
      border-radius: 0.5rem; 
      margin: 1rem 0; 
    }
    .markdown-content hr { 
      border: none; 
      border-top: 2px solid #374151; 
      margin: 2rem 0; 
    }
    .markdown-content table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1rem 0;
    }
    .markdown-content th, 
    .markdown-content td { 
      border: 1px solid #4b5563; 
      padding: 0.75rem; 
      text-align: left; 
    }
    .markdown-content th { 
      background: #1f2937; 
      font-weight: 600;
    }
    .markdown-content strong { 
      font-weight: 700; 
    }
    .markdown-content em { 
      font-style: italic; 
    }
  `;

    // Variant-specific styles
    const variantStyles = {
        preview: `
      .markdown-content h1 { font-size: 2rem; font-weight: 700; }
      .markdown-content h2 { font-size: 1.75rem; font-weight: 700; }
      .markdown-content h3 { font-size: 1.5rem; font-weight: 600; }
      .markdown-content h4 { font-size: 1.25rem; font-weight: 600; }
      .markdown-content h5 { font-size: 1.1rem; font-weight: 600; }
      .markdown-content h6 { font-size: 1rem; font-weight: 600; }
      .markdown-content { color: #e5e7eb; }
      .markdown-content code { color: #fbbf24; }
      .markdown-content pre code { color: #e5e7eb; }
    `,
        public: `
      .markdown-content h1 { font-size: 2.5rem; font-weight: 800; }
      .markdown-content h2 { font-size: 2rem; font-weight: 700; }
      .markdown-content h3 { font-size: 1.5rem; font-weight: 600; }
      .markdown-content h4 { font-size: 1.25rem; font-weight: 600; }
      .markdown-content h5 { font-size: 1.1rem; font-weight: 600; }
      .markdown-content h6 { font-size: 1rem; font-weight: 600; }
      .markdown-content { color: #1f2937; }
      .markdown-content code { color: #1f2937; background: #f3f4f6; }
      .markdown-content pre code { color: #1f2937; }
      .markdown-content blockquote { 
        border-left-color: #3b82f6; 
        background: rgba(59, 130, 246, 0.05);
      }
      .markdown-content a { color: #3b82f6; }
      .markdown-content a:hover { color: #2563eb; }
    `,
    };

    return (
        <div className={`markdown-content ${className}`}>
            <style dangerouslySetInnerHTML={{ __html: baseStyles + variantStyles[variant] }} />
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
