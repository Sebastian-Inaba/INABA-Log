// src/components/AdminComps/AdminGet.tsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../utilities/api';
import { formatDate } from '../../utilities/helpers';
import type { ContentItem, Post, Research } from '../../types';
import { error as logError } from '../../utilities/logger';

interface ApiContentResponse {
    posts?: Post[];
    research?: Research[];
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
            const res = await apiClient.get('/admin/content');
            const data: ApiContentResponse = res.data;

            const items: ContentItem[] = [
                ...(data.posts?.map((post) => ({
                    ...post,
                    type: 'post' as const,
                    tags: post.tags || [],
                    featured: post.featured || false,
                    featuredImage: post.featuredImage || null,
                })) || []),
                ...(data.research?.map((research) => ({
                    ...research,
                    type: 'research' as const,
                    tags: research.tags || [],
                    featured: research.featured || false,
                    featuredImage: research.featuredImage || null,
                    pdfAttachment: research.pdfAttachment || null,
                })) || []),
            ];

            setContent(items);
        } catch (err) {
            logError(err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchContent();
    }, []);

    const handleDelete = async (id: string, type: 'post' | 'research') => {
        try {
            const segment = type === 'post' ? 'posts' : 'research';
            await apiClient.delete(`/admin/${segment}/${id}`);

            setContent((prev) => prev.filter((item) => item._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            logError(err);
            setError(err instanceof Error ? err.message : 'An error occurred during deletion');
        }
    };

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
                    <button
                        onClick={() => void fetchContent()}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 mt-2"
                    >
                        Try Again
                    </button>
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
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.type === 'post' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                                                }`}
                                            >
                                                {item.type}
                                            </span>
                                            {item.featured && (
                                                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                                                    Featured
                                                </span>
                                            )}
                                            {'category' in item && item.category && (
                                                <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-1 truncate">{item.title}</h3>
                                        <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                                            {'description' in item ? item.description : 'abstract' in item ? item.abstract : ''}
                                        </p>

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
                                        <button className="px-3 py-2 bg-blue-700 text-blue-300 rounded-lg hover:bg-blue-600 text-sm">
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
