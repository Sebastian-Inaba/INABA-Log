// src/components/ResearchComps/ResearchGet.tsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { formatDate } from '../../utilities/helpers';
import type { Research, ContentItem } from '../../types';
import { error as logError } from '../../utilities/logger';
import { FilterWrapper } from '../../components/GlobalComps/FilterWrapper';

// TEST

export default function PublicResearchList() {
    const navigate = useNavigate();

    const [research, setResearch] = useState<Research[]>([]);
    const [filteredResearch, setFilteredResearch] = useState<Research[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredResearch.length / itemsPerPage);

    useEffect(() => {
        void fetchResearch();
    }, []);

    async function fetchResearch() {
        setError(null);
        setLoading(true);
        try {
            const res = await apiClient.get('/research');

            const raw = Array.isArray(res.data) ? res.data : (res.data?.research ?? []);

            const normalized: Research[] = (raw || []).filter(Boolean).map((r: unknown, i: number) => {
                const obj = r as Record<string, unknown>;

                const _id = String(obj._id ?? obj.id ?? `fallback-${i}`);
                const title = (obj.title as string) ?? '';
                const abstract = (obj.abstract as string) ?? '';
                const tags = Array.isArray(obj.tags) ? (obj.tags as string[]) : [];
                const featured = Boolean(obj.featured);
                const pdfAttachment = (obj.pdfAttachment as string) ?? null;
                const category = (obj.category as string) ?? null;
                const author = (obj.author as string) ?? null;

                const createdAt = (obj.createdAt as string) ?? '';
                const updatedAt = (obj.updatedAt as string) ?? '';

                const references = Array.isArray(obj.references) ? (obj.references as string[]) : [];
                const slug = (obj.slug as string) ?? '';
                const type = (obj.type as string) ?? 'research';

                const content = (obj.content as string) ?? '';
                const introduction = (obj.introduction as string) ?? '';
                const method = (obj.method as string) ?? '';
                const keyFindings = (obj.keyFindings as string) ?? '';
                const credibility = (obj.credibility as string) ?? '';

                return {
                    ...obj,
                    _id,
                    title,
                    abstract,
                    tags,
                    featured,
                    pdfAttachment,
                    category,
                    author,
                    createdAt,
                    updatedAt,
                    references,
                    slug,
                    type,
                    content,
                    introduction,
                    method,
                    keyFindings,
                    credibility,
                } as Research;
            });

            setResearch(normalized);
            setFilteredResearch(normalized);
            setPage(0);
        } catch (err) {
            logError(err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleFilter = useCallback((items: ContentItem[]) => {
        setFilteredResearch(items as Research[]);
        setPage(0);
    }, []);

    // Route handler
    const handleRedirect = (slug: string) => {
        if (!slug) return;
        navigate(`/research/${slug}`);
    };

    const currentItems = filteredResearch.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

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
                        onClick={() => void fetchResearch()}
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
            <div className="p-2">
                <FilterWrapper
                    items={research}
                    onFilter={handleFilter}
                    isAdmin={false}
                    showSearch={true}
                    showDateFilter={true}
                    showFeaturedFilter={true}
                />
            </div>

            <div className="flex items-center justify-end p-2">
                <div className="text-sm text-purple-300">Total: {filteredResearch.length} research items</div>
            </div>

            {filteredResearch.length === 0 ? (
                <div className="flex-1 min-h-0 flex items-center justify-center text-center text-neutral-400 p-4">
                    <p>No research found.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentItems.map((item) => {
                                const tags = item.tags ?? [];

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => handleRedirect(item.slug)}
                                        className="relative bg-neutral-800 rounded-lg p-4 min-w-0 shadow-md hover:shadow-lg transition cursor-pointer"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded-full text-xs font-medium">
                                                    Research
                                                </span>
                                                {item.featured && (
                                                    <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-semibold text-white mb-1 truncate">{item.title}</h3>
                                            <p className="text-neutral-400 text-sm mb-2 line-clamp-2">{item.abstract}</p>

                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {tags.length === 0 ? (
                                                    <span className="px-2 py-1 text-xs text-neutral-400">No tags</span>
                                                ) : (
                                                    tags.slice(0, 6).map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                )}
                                                {tags.length > 6 && (
                                                    <span className="px-2 py-1 text-neutral-500 rounded-full text-xs">
                                                        +{tags.length - 6} more
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-neutral-500 truncate">
                                                <span>Created: {item.createdAt ? formatDate(item.createdAt) : '—'}</span>
                                                <span>Updated: {item.updatedAt ? formatDate(item.updatedAt) : '—'}</span>
                                                {item.author && <span className="truncate">By: {item.author}</span>}
                                            </div>

                                            {item.pdfAttachment && (
                                                <div className="mt-3">
                                                    <a
                                                        href={item.pdfAttachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-red-700 text-red-300 rounded-lg hover:bg-red-600 text-sm inline-flex items-center"
                                                    >
                                                        Download PDF
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4 border-t border-purple-700">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
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
                                        page === i ? 'bg-purple-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-purple-600'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                disabled={page === totalPages - 1}
                                className="px-3 py-1 bg-purple-700 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
