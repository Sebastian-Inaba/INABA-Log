// src/components/AdminComps/ContentList.tsx
import { useEffect, useState } from 'react';

// todo:
// basically same as AdminCreatorComponent

interface ContentItem {
    _id: string;
    type: 'post' | 'research';
    title: string;
    slug?: string;
    author?: string;
    description?: string;
    category?: string;
    tags: string[];
    featured: boolean;
    featuredImage?: string | null;
    createdAt: string;
    updatedAt: string;
    abstract?: string;
    pdfAttachment?: string | null;
}

type RawServerItem = {
    _id?: string;
    id?: string;
    __t?: string;
    abstract?: string;
    category?: string;
    title?: string;
    name?: string;
    slug?: string;
    author?: string;
    description?: string;
    tags?: string[] | string;
    featured?: boolean;
    featuredImage?: string | null;
    featured_image?: string | null;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
    pdfAttachment?: string | null;
    pdf_attachment?: string | null;
};

const API_BASE = 'http://localhost:5000/api/admin';

function parseTags(raw: string[] | string | undefined): string[] {
    if (!raw) return [];

    if (Array.isArray(raw)) {
        return raw
            .map(String)
            .map((s) => s.trim())
            .filter(Boolean);
    }

    let s = String(raw).trim();

    while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        const unwrapped = s.slice(1, -1).trim();
        if (unwrapped === s) break;
        s = unwrapped;
    }

    try {
        const parsed: unknown = JSON.parse(s);
        if (Array.isArray(parsed)) {
            return parsed.map((p) => String(p).trim()).filter(Boolean);
        }
    } catch (e) {
        console.debug('parseTags JSON.parse failed', e);
    }

    if (s.startsWith('[') && s.endsWith(']')) {
        const inner = s.slice(1, -1).trim();
        if (!inner) return [];
        return inner
            .split(/\s*,\s*/)
            .map((t) => t.replace(/^['"]|['"]$/g, '').trim())
            .filter(Boolean);
    }

    return s
        .split(/[,;\n]/)
        .map((t) => t.trim())
        .filter(Boolean);
}

function normalizeServerItem(raw: RawServerItem, forcedType?: 'post' | 'research'): ContentItem {
    const inferredType = forcedType ?? (raw.__t as unknown as string) ?? (raw.abstract ? 'research' : 'post');

    const tags = parseTags(raw.tags);

    return {
        _id: raw._id ?? raw.id ?? `tmp-${Math.random().toString(36).slice(2)}`,
        type: inferredType === 'research' ? 'research' : 'post',
        title: raw.title ?? raw.name ?? 'Untitled',
        slug: raw.slug,
        author: raw.author,
        description: raw.description,
        category: raw.category,
        tags,
        featured: !!raw.featured,
        featuredImage: raw.featuredImage ?? raw.featured_image ?? null,
        createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
        updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
        abstract: raw.abstract,
        pdfAttachment: raw.pdfAttachment ?? raw.pdf_attachment ?? null,
    };
}

export default function ContentList() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    async function fetchContent() {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/content`, { credentials: 'include' });
            if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
            const data: unknown = await res.json();
            console.debug('GET /content ->', data);

            let items: ContentItem[] = [];

            if (Array.isArray(data)) {
                items = data.map((d) => normalizeServerItem(d as RawServerItem));
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                const obj = data as Record<string, unknown>;
                if (Array.isArray(obj.posts) || Array.isArray(obj.research)) {
                    const posts = Array.isArray(obj.posts)
                        ? (obj.posts as unknown[]).map((p) => normalizeServerItem(p as RawServerItem, 'post'))
                        : [];
                    const research = Array.isArray(obj.research)
                        ? (obj.research as unknown[]).map((r) => normalizeServerItem(r as RawServerItem, 'research'))
                        : [];
                    items = [...posts, ...research];
                } else if (Array.isArray(obj.content)) {
                    items = (obj.content as unknown[]).map((c) => normalizeServerItem(c as RawServerItem));
                } else {
                    const arrays = Object.values(obj).filter(Array.isArray);
                    if (arrays.length === 1) {
                        items = (arrays[0] as unknown[]).map((i) => normalizeServerItem(i as RawServerItem));
                    } else if ('_id' in obj || 'id' in obj) {
                        items = [normalizeServerItem(obj as RawServerItem)];
                    } else {
                        throw new Error('Unexpected response shape from server');
                    }
                }
            } else {
                throw new Error('Unexpected response from server');
            }

            setContent(items);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchContent();
    }, []);

    function typeToRouteSegment(type: 'post' | 'research') {
        return type === 'post' ? 'posts' : 'research';
    }

    const handleDelete = async (id: string, type: 'post' | 'research') => {
        try {
            const segment = typeToRouteSegment(type);
            const response = await fetch(`${API_BASE}/${segment}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                let body = '';
                try {
                    body = await response.text();
                } catch (e) {
                    console.debug('read body failed', e);
                }
                throw new Error(`Failed to delete ${type}: ${response.status} ${body ? '- ' + body : ''}`);
            }

            setContent((prev) => prev.filter((item) => item._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An error occurred during deletion');
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (loading) {
        return (
            <div className="h-full min-h-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full min-h-0 flex items-center justify-center">
                <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg max-w-lg w-full">
                    <p className="break-words">Error: {error}</p>
                    <div className="mt-2 flex justify-end">
                        <button onClick={() => void fetchContent()} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 flex flex-col w-full">
            <div className="flex items-center justify-end p-2">
                <div className="text-sm text-purple-300">Total: {content.length} items</div>
            </div>

            {content.length === 0 ? (
                <div className="flex-1 min-h-0 flex items-center justify-center text-center text-neutral-400 p-4">
                    <p>No content found. Create your first post or research!</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.map((item) => (
                            <div
                                key={`${item.type}-${item._id}`}
                                className="bg-neutral-800 border border-purple-700 rounded-lg p-4 min-w-0"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'post' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}
                                            >
                                                {item.type}
                                            </span>
                                            {item.featured && (
                                                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                                                    Featured
                                                </span>
                                            )}
                                            {item.category && (
                                                <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-1 truncate">{item.title}</h3>
                                        <p className="text-neutral-400 text-sm mb-2 line-clamp-2">{item.description || item.abstract}</p>

                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {item.tags.length === 0 ? (
                                                <span className="px-2 py-1 text-xs text-neutral-400">No tags</span>
                                            ) : (
                                                item.tags.slice(0, 6).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))
                                            )}
                                            {item.tags.length > 6 && (
                                                <span className="px-2 py-1 text-neutral-500 rounded-full text-xs">
                                                    +{item.tags.length - 6} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-neutral-500 truncate">
                                            <span>Created: {formatDate(item.createdAt)}</span>
                                            <span>Updated: {formatDate(item.updatedAt)}</span>
                                            {item.author && <span className="truncate">By: {item.author}</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => {
                                                /* open edit modal later */
                                            }}
                                            className="px-3 py-2 bg-blue-700 text-blue-300 rounded-lg hover:bg-blue-600 text-sm"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setDeleteConfirm(item._id)}
                                            className="px-3 py-2 bg-red-700 text-red-300 rounded-lg hover:bg-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {deleteConfirm === item._id && (
                                    <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg">
                                        <p className="text-red-200 mb-2">
                                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => void handleDelete(item._id, item.type)}
                                                className="px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                                            >
                                                Confirm Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
