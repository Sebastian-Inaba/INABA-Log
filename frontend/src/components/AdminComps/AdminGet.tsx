// src/components/AdminComps/AdminGet.tsx
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../utilities/api';
import { formatDate } from '../../utilities/helpers';
import { error as logError } from '../../utilities/logger';
import { EditModal } from './AdminPatch';
import { FilterWrapper } from '../../components/GlobalComps/FilterWrapper';
import type { ContentItem, Post, Research } from '../../types';

interface ApiContentResponse {
    posts?: Post[];
    research?: Research[];
}

export function ContentList() {
    // state
    const [content, setContent] = useState<ContentItem[]>([]);
    const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Post | Research | null>(
        null,
    );
    const [editingType, setEditingType] = useState<'post' | 'research'>('post');

    // Pagination state
    const [page, setPage] = useState(0);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

    // effects
    useEffect(() => {
        void fetchContent();
    }, []);

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
            setFilteredContent(items);
            setPage(0);
        } catch (err) {
            logError(err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (item: ContentItem) => {
        try {
            const endpoint =
                item.type === 'post'
                    ? `/admin/posts/${item._id}`
                    : `/admin/research/${item._id}`;

            const response = await apiClient.get(endpoint);

            setEditingItem(response.data);
            setEditingType(item.type);
            setEditModalOpen(true);
        } catch (err) {
            logError(err);
            setError('Failed to fetch item details for editing');
        }
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setEditingItem(null);
    };

    const handleEditUpdate = () => {
        void fetchContent();
    };

    const handleDelete = async (id: string, type: 'post' | 'research') => {
        try {
            const segment = type === 'post' ? 'posts' : 'research';
            await apiClient.delete(`/admin/${segment}/${id}`);

            // update both sets so filter/ui stays consistent
            setContent((prev) => prev.filter((item) => item._id !== id));
            setFilteredContent((prev) =>
                prev.filter((item) => item._id !== id),
            );
            setDeleteConfirm(null);
        } catch (err) {
            logError(err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'An error occurred during deletion',
            );
        }
    };

    // onFilter receives ContentItem[] from FilterWrapper
    const handleFilter = useCallback((items: ContentItem[]) => {
        setFilteredContent(items);
        setPage(0);
    }, []);

    // Pagination helpers
    const currentItems = filteredContent.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage,
    );

    // loadingAndErrorStates
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
                    <p className="wrap-break-words">Error: {error}</p>
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
        <div className="flex flex-col h-full min-h-0 w-full">
            {/* Filter bar (admin) */}
            <div className="p-2">
                <FilterWrapper
                    items={content}
                    onFilter={handleFilter}
                    isAdmin={true}
                    showSearch={true}
                    showDateFilter={true}
                    showFeaturedFilter={true}
                />
            </div>

            {/* Header and stats */}
            <div className="flex items-center justify-end p-2">
                <div className="text-sm text-purple-300">
                    Total: {filteredContent.length} items
                </div>
            </div>

            {/* Main content area */}
            {filteredContent.length === 0 ? (
                <div className="flex-1 min-h-0 flex items-center justify-center text-center text-neutral-400 p-4">
                    <p>No content found. Create your first post or research!</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Scrollable content grid */}
                    <div className="flex-1 overflow-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentItems.map((item) => (
                                <div
                                    key={`${item.type}-${item._id}`}
                                    className="relative bg-neutral-800 rounded-lg p-4 min-w-0 shadow-md hover:shadow-lg transition"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.type === 'post'
                                                            ? 'bg-blue-900 text-blue-300'
                                                            : 'bg-purple-900 text-purple-300'
                                                    }`}
                                                >
                                                    {item.type}
                                                </span>
                                                {item.featured && (
                                                    <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                                                        Featured
                                                    </span>
                                                )}
                                                {'category' in item &&
                                                    item.category && (
                                                        <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs">
                                                            {item.category}
                                                        </span>
                                                    )}
                                            </div>

                                            <h3 className="text-xl font-semibold text-white mb-1 truncate">
                                                {item.title}
                                            </h3>
                                            <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                                                {'description' in item
                                                    ? item.description
                                                    : 'abstract' in item
                                                      ? item.abstract
                                                      : ''}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {item.tags.length === 0 ? (
                                                    <span className="px-2 py-1 text-xs text-neutral-400">
                                                        No tags
                                                    </span>
                                                ) : (
                                                    item.tags
                                                        .slice(0, 6)
                                                        .map((tag, i) => (
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
                                                        +{item.tags.length - 6}{' '}
                                                        more
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-neutral-500 truncate">
                                                <span>
                                                    Created:{' '}
                                                    {formatDate(item.createdAt)}
                                                </span>
                                                <span>
                                                    Updated:{' '}
                                                    {formatDate(item.updatedAt)}
                                                </span>
                                                {item.author && (
                                                    <span className="truncate">
                                                        By: {item.author}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="px-3 py-2 bg-blue-700 text-blue-300 rounded-lg hover:bg-blue-600 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm(item._id)
                                                }
                                                className="px-3 py-2 bg-red-700 text-red-300 rounded-lg hover:bg-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {deleteConfirm === item._id && (
                                        <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col justify-center items-center p-4 rounded-lg z-10">
                                            <p className="text-red-200 mb-2 text-center">
                                                Are you sure you want to delete
                                                "{item.title}"? This action
                                                cannot be undone.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        void handleDelete(
                                                            item._id,
                                                            item.type,
                                                        )
                                                    }
                                                    className="px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                                                >
                                                    Confirm Delete
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteConfirm(null)
                                                    }
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

                    {/* Pagination buttons */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4 border-t border-purple-700">
                            <button
                                onClick={() =>
                                    setPage((prev) => Math.max(prev - 1, 0))
                                }
                                disabled={page === 0}
                                className="px-3 py-1 bg-purple-700 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition"
                            >
                                Prev
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        page === i
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-neutral-700 text-neutral-300 hover:bg-purple-600'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(prev + 1, totalPages - 1),
                                    )
                                }
                                disabled={page === totalPages - 1}
                                className="px-3 py-1 bg-purple-700 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {editingItem && (
                <EditModal
                    item={editingItem}
                    type={editingType}
                    isOpen={editModalOpen}
                    onClose={handleEditClose}
                    onUpdate={handleEditUpdate}
                />
            )}
        </div>
    );
}
