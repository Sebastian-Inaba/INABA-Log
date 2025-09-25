// src/components/AdminComps/ChildComps/PreviewPanel.tsx
import { MarkdownRenderer } from '../../UtilityComps/MarkdownRenderer';

interface PreviewPanelProps {
    title: string;
    author: string;
    description: string;
    category: string;
    tags: string;
    featuredImageUrl: string | null;
    content: string;
}

export function PreviewPanel({ title, author, description, category, tags, featuredImageUrl, content }: PreviewPanelProps) {
    return (
        <div className="border-l border-purple-800 pl-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-purple-400 text-lg">Preview</h3>
                <div className="text-xs text-purple-500">Live markdown preview</div>
            </div>
            <div className="overflow-auto max-h-[70vh] p-5 bg-neutral-800 rounded-lg border border-purple-700">
                {featuredImageUrl && <img src={featuredImageUrl} alt="Featured" className="w-full h-64 object-cover rounded-lg mb-4" />}
                <h1 className="text-3xl font-bold text-white mb-2">{title || 'Untitled'}</h1>
                <div className="flex items-center text-sm text-purple-300 mb-3">
                    <span>By {author || 'Author'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {category && <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">{category}</span>}
                    {tags
                        .split(',')
                        .filter((tag) => tag.trim())
                        .map((tag: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-sm">
                                {tag.trim()}
                            </span>
                        ))}
                </div>
                {description && <p className="text-lg text-neutral-300 italic mb-4">{description}</p>}
                <MarkdownRenderer content={content || '*Start typing markdown to see preview...*'} variant="preview" />
            </div>
        </div>
    );
}
