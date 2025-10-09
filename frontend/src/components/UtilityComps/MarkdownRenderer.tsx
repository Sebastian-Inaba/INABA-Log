// src/components/UtilityComps/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useState, useEffect } from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    variant?: 'preview' | 'public';
}

interface LinkPreviewData {
    title: string;
    description: string;
    image: string;
    domain: string;
}

// Code block with copy button
function CodeBlock({ children, className }: { children: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const language = className?.replace('language-', '') || 'text';

    // handle copy to clipboard
    const handleCopy = async () => {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            {/* copy button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleCopy}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                    title="Copy code"
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>
            {/* language label */}
            <div className="text-xs text-gray-400 mb-1 px-4 pt-3 font-mono">{language}</div>
            {/* code content */}
            <pre className="!pt-0">
                <code className={className}>{children}</code>
            </pre>
        </div>
    );
}

// Link preview banner for special URLs
function LinkPreview({ href, children }: { href: string; children: React.ReactNode }) {
    const [preview, setPreview] = useState<LinkPreviewData | null>(null);
    const [loading, setLoading] = useState(false);

    // determine if URL should have preview
    const shouldShowPreview = (url: string) => {
        const previewPatterns = [
            /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
            /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/,
            /^https?:\/\/(www\.)?github\.com\/[\w-]+/,
        ];

        try {
            return previewPatterns.some((pattern) => pattern.test(url));
        } catch {
            return false;
        }
    };

    // extract YouTube video ID
    const getYouTubeVideoId = (url: string): string | null => {
        const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/, /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    // fetch mock preview data
    useEffect(() => {
        if (shouldShowPreview(href)) {
            setLoading(true);
            setTimeout(() => {
                const domain = new URL(href).hostname;
                let mockData: LinkPreviewData;

                // Twitter/X
                if (domain.includes('twitter.com') || domain.includes('x.com')) {
                    mockData = {
                        title: 'Twitter Post',
                        description: 'Check out this interesting tweet about web development and modern JavaScript frameworks.',
                        image: '',
                        domain: domain,
                    };
                }
                // GitHub
                else if (domain.includes('github.com')) {
                    const username = href.split('github.com/')[1]?.split('/')[0] || 'user';
                    mockData = {
                        title: `${username} - GitHub`,
                        description: 'Check out this GitHub profile and their amazing projects.',
                        image: `https://github.com/${username}.png?size=400`,
                        domain: domain,
                    };
                }
                // YouTube
                else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                    const videoId = getYouTubeVideoId(href);
                    mockData = {
                        title: 'YouTube Video',
                        description: 'Watch this interesting video on YouTube.',
                        image: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
                        domain: domain,
                    };
                }
                // fallback
                else {
                    mockData = {
                        title: 'Link Preview',
                        description: 'Preview description of the linked content.',
                        image: '',
                        domain: domain,
                    };
                }

                setPreview(mockData);
                setLoading(false);
            }, 500);
        }
    }, [href]);

    // normal link if no preview
    if (!shouldShowPreview(href)) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                {children}
            </a>
        );
    }

    // loading state
    if (loading) {
        return (
            <div className="my-4 p-4 border border-gray-700 rounded-lg bg-gray-800 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    // show preview
    if (preview) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block my-4 no-underline hover:transform hover:scale-[1.02] transition-transform"
            >
                <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 hover:border-purple-500 transition-colors">
                    {/* preview image */}
                    {preview.image && (
                        <img
                            src={preview.image}
                            alt={preview.title}
                            style={{
                                width: '100%',
                                height: 'clamp(144px, 25vw, 192px)',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    )}
                    {/* preview content */}
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <h3 className="!m-0 text-lg font-semibold text-white mb-1">{preview.title}</h3>
                                <p className="!m-0 text-sm text-gray-400 mb-2">{preview.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>🔗</span>
                                    <span>{preview.domain}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        );
    }

    // fallback link
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
            {children}
        </a>
    );
}

// Main markdown renderer
export function MarkdownRenderer({ content, className = '', variant = 'public' }: MarkdownRendererProps) {
    // base styles
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
      border-left: 4px solid #7c3aed; 
      padding: 0.75rem 1rem; 
      margin: 1rem 0; 
      background: rgba(124, 58, 237, 0.06);
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

    // links
    .markdown-content .markdown-link { 
      color: #7c3aed; 
      text-decoration: underline; 
      transition: color 0.2s;
    }
    .markdown-content .markdown-link:hover { 
      color: #6d28d9; 
    }

    // images
    .markdown-content img { 
      max-width: 100%; 
      height: auto; 
      border-radius: 0.5rem; 
    }

    // hr
    .markdown-content hr { 
      border: none; 
      border-top: 2px solid #374151; 
      margin: 2rem 0; 
    }

    // tables
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

    // typography
    .markdown-content strong { font-weight: 700; }
    .markdown-content em { font-style: italic; }

    // utility colors
    .markdown-content .text-red { color: #ef4444; }
    .markdown-content .text-blue { color: #3b82f6; }
    .markdown-content .text-green { color: #10b981; }
    .markdown-content .text-yellow { color: #f59e0b; }
    .markdown-content .text-purple { color: #a855f7; }
    .markdown-content .text-pink { color: #ec4899; }

    // highlight backgrounds
    .markdown-content .bg-yellow-highlight { 
      background: #fef3c7; 
      padding: 0.125rem 0.25rem; 
      border-radius: 0.25rem; 
      color: #92400e;
    }
    .markdown-content .bg-blue-highlight { 
      background: #dbeafe; 
      padding: 0.125rem 0.25rem; 
      border-radius: 0.25rem; 
      color: #1e3a8a;
    }
    .markdown-content .bg-purple-highlight { 
      background: #f3e8ff; 
      padding: 0.125rem 0.25rem; 
      border-radius: 0.25rem; 
      color: #5b21b6;
    }

    // link preview image sizing
    .link-preview-img {
      width: 100%;
      height: 9rem; 
      object-fit: cover;
      display: block;
    }
    @media (min-width: 768px) {
      .link-preview-img { height: 12rem; }
    }
  `;

    // variant-specific styles
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
        border-left-color: #7c3aed; 
        background: rgba(124, 58, 237, 0.05);
      }
      .markdown-content .markdown-link { color: #7c3aed; }
      .markdown-content .markdown-link:hover { color: #6d28d9; }
    `,
    };

    // render markdown
    return (
        <div className={`markdown-content ${className}`}>
            <style dangerouslySetInnerHTML={{ __html: baseStyles + variantStyles[variant] }} />
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    // code blocks
                    code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                        const codeString = String(children).replace(/\n$/, '');
                        if (inline) return <code className={className}>{children}</code>;
                        return <CodeBlock className={className}>{codeString}</CodeBlock>;
                    },
                    // links
                    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => {
                        return <LinkPreview href={href || '#'}>{children}</LinkPreview>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
