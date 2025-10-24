// src/components/ResearchComps/ResearchGet.tsx
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { formatDate } from '../../utilities/helpers';
import type { Research, ContentItem } from '../../types';
import { error as logError } from '../../utilities/logger';
import { FilterWrapper } from '../../components/GlobalComps/FilterWrapper';
import { FadeIn } from '../AnimationComps/FadeIn';

export default function PublicResearchList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State management
    const [research, setResearch] = useState<Research[]>([]);
    const [filteredResearch, setFilteredResearch] = useState<Research[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Pagination
    const itemsPerPage = 4;
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Memoized font styles
    const fontStyles = useMemo(
        () => ({
            title: { fontFamily: 'Poppins', fontWeight: 700 },
            body: { fontFamily: 'Roboto_Slab', fontWeight: 400 },
            meta: { fontFamily: 'Lato', fontWeight: 400 },
            cta: { fontFamily: 'Poppins', fontWeight: 500 },
        }),
        [],
    );

    // Initialize page URL param on mount
    useEffect(() => {
        void fetchResearch();
        if (!searchParams.has('page')) {
            navigate('/research?page=1', { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
        if (window.lenis) {
            try {
                window.lenis.scrollTo(0, { immediate: true });
            } catch {
                // ignore
            }
        }
    }, [page]);

    // Fetch and normalize research from API
    async function fetchResearch() {
        setError(null);
        setLoading(true);
        try {
            const res = await apiClient.get('/research');
            const raw = Array.isArray(res.data) ? res.data : (res.data?.research ?? []);

            const normalized: Research[] = (raw || []).filter(Boolean).map((r: unknown, i: number) => {
                const obj = r as Record<string, unknown>;
                return {
                    ...obj,
                    _id: String(obj._id ?? obj.id ?? `fallback-${i}`),
                    title: (obj.title as string) ?? '',
                    abstract: (obj.abstract as string) ?? '',
                    tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
                    featured: Boolean(obj.featured),
                    pdfAttachment: (obj.pdfAttachment as string) ?? null,
                    author: (obj.author as string) ?? null,
                    createdAt: (obj.createdAt as string) ?? '',
                    updatedAt: (obj.updatedAt as string) ?? '',
                    references: Array.isArray(obj.references) ? (obj.references as string[]) : [],
                    slug: (obj.slug as string) ?? '',
                    type: (obj.type as string) ?? 'research',
                    content: (obj.content as string) ?? '',
                    introduction: (obj.introduction as string) ?? '',
                    method: (obj.method as string) ?? '',
                    keyFindings: (obj.keyFindings as string) ?? '',
                    credibility: (obj.credibility as string) ?? '',
                } as Research;
            });

            setResearch(normalized);
            setFilteredResearch(normalized);
        } catch (err) {
            logError(err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    // Handle filter changes from FilterWrapper
    const handleFilter = useCallback(
        (items: ContentItem[]) => {
            setFilteredResearch(items as Research[]);
            // Reset to page 1 when filtering
            navigate('/research?page=1', { replace: true });
        },
        [navigate],
    );

    // Navigate to individual research detail page
    const handleViewDetails = (slug: string) => {
        if (!slug) return;
        navigate(`/research/${slug}`);
    };

    // Update page in URL
    const setPage = useCallback(
        (newPage: number) => {
            navigate(`/research?page=${newPage}`, { replace: false });
        },
        [navigate],
    );

    // Toggle abstract expansion
    const toggleAbstract = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Pagination calculations (convert 1-indexed page to 0-indexed for array slicing)
    const totalPages = Math.ceil(filteredResearch.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredResearch.slice(startIndex, endIndex);

    // Loading state
    if (loading) {
        return (
            <div className="w-full py-6 px-4">
                <div className="w-full max-w-[1200px] mx-auto mb-6">
                    <div className="h-20 bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="w-full max-w-[1200px] mx-auto space-y-4">
                    {[...Array(5)].map((_, idx) => (
                        <div key={idx} className="bg-neutral-800 rounded-lg h-32 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full min-h-0 flex items-center justify-center p-6">
                <div className="bg-red-900 border border-red-700 text-red-200 p-6 rounded-lg max-w-lg w-full">
                    <p className="wrap-break-words mb-4">Error: {error}</p>
                    <button
                        onClick={() => void fetchResearch()}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                        style={fontStyles.cta}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (filteredResearch.length === 0) {
        return (
            <div className="w-full py-6 px-4">
                <div className="w-full max-w-[900px] mx-auto mb-6">
                    <FilterWrapper
                        items={research}
                        onFilter={handleFilter}
                        isAdmin={false}
                        showSearch={true}
                        showDateFilter={true}
                        showFeaturedFilter={false}
                    />
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center max-w-[1200px] mx-auto">
                    <p className="text-gray-300" style={fontStyles.body}>
                        No research found.
                    </p>
                </div>
            </div>
        );
    }

    // Default render
    return (
        <div className="w-full py-6 hide-scrollbar">
            {/* Filter Section */}
            <div className="w-full max-w-[1000px] mx-auto mb-6 px-4">
                <FilterWrapper
                    items={research}
                    onFilter={handleFilter}
                    isAdmin={false}
                    showSearch={true}
                    showDateFilter={true}
                    showFeaturedFilter={false}
                />
            </div>

            {/* Results count */}
            <div className="w-full max-w-[1200px] mx-auto mb-4 px-4">
                <p className="text-sm text-slate-400" style={fontStyles.meta}>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredResearch.length)} of {filteredResearch.length} results
                </p>
            </div>

            {/* Research List */}
            <div className="w-full max-w-[1200px] mx-auto px-4">
                <FadeIn direction="up">
                    <div className="space-y-3">
                        {/* Individual research cards */}
                        {currentItems.map((item, index) => {
                            const isExpanded = expandedIds.has(item._id);
                            const tags = item.tags ?? [];

                            return (
                                <FadeIn key={item._id} direction="up" delay={index * 40}>
                                    <article className="group relative bg-neutral-900/50 hover:bg-neutral-900 border-l-4 border border-gray-700 hover:border-transparent hover:border-l-purple-500 transition-all duration-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-900/20">
                                        {/* Main content row */}
                                        <div className="p-6">
                                            {/* Title and badges row */}
                                            <div className="flex items-start gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    {/* Research badge */}
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-2.5 py-0.5 bg-linear-to-r from-purple-700 to-purple-600 text-purple-100 rounded text-xs font-bold uppercase tracking-wide shadow-md">
                                                            Research
                                                        </span>
                                                    </div>

                                                    {/* Title - inline-block to fit content width */}
                                                    <h2
                                                        className="text-2xl text-white transition-colors cursor-pointer leading-tight mb-2 inline-block relative group/title"
                                                        style={fontStyles.title}
                                                        onClick={() => handleViewDetails(item.slug)}
                                                    >
                                                        <span className="group-hover/title:text-purple-300 transition-colors">
                                                            {item.title}
                                                        </span>
                                                        {/* Animated underline on title hover */}
                                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover/title:w-full transition-all duration-300"></span>
                                                    </h2>
                                                </div>
                                            </div>

                                            {/* Metadata row with author and date */}
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-sm text-slate-400">
                                                {item.author && (
                                                    <div className="flex items-center gap-1.5">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                        <span style={fontStyles.meta}>{item.author}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span style={fontStyles.meta}>{item.createdAt ? formatDate(item.createdAt) : '—'}</span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            {tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {tags.slice(0, 6).map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2.5 py-1 bg-neutral-800/80 text-purple-300 rounded-full text-xs border border-purple-700/30 hover:bg-purple-900/30 transition-colors cursor-default"
                                                            style={fontStyles.meta}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {tags.length > 6 && (
                                                        <span className="px-2.5 py-1 text-neutral-500 text-xs" style={fontStyles.meta}>
                                                            +{tags.length - 6} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Abstract toggle and action buttons */}
                                            <div className="flex items-center justify-between gap-4 mt-4">
                                                {/* Show/Hide Abstract button */}
                                                {item.abstract && (
                                                    <button
                                                        onClick={() => toggleAbstract(item._id)}
                                                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                                                        style={fontStyles.cta}
                                                        aria-expanded={isExpanded}
                                                    >
                                                        <svg
                                                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 9l-7 7-7-7"
                                                            />
                                                        </svg>
                                                        <span>{isExpanded ? 'Hide' : 'Show'} Abstract</span>
                                                    </button>
                                                )}

                                                {/* Action buttons (PDF and View Details) */}
                                                <div className="flex items-center gap-3">
                                                    {item.pdfAttachment && (
                                                        <a
                                                            href={item.pdfAttachment}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-red-700/80 text-red-100 rounded-lg hover:bg-red-600 text-sm inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                                                            style={fontStyles.cta}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                            PDF
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewDetails(item.slug)}
                                                        className="px-4 py-2 bg-purple-700/80 text-purple-100 rounded-lg hover:bg-purple-600 text-sm inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg group-hover:translate-x-1 cursor-pointer"
                                                        style={fontStyles.cta}
                                                    >
                                                        <span>Dive In</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable abstract with smooth animation */}
                                            <div
                                                className="overflow-hidden transition-all duration-500 ease-in-out"
                                                style={{
                                                    maxHeight: isExpanded ? '500px' : '0px',
                                                    opacity: isExpanded ? 1 : 0,
                                                }}
                                            >
                                                {item.abstract && (
                                                    <div className="mt-4 pt-4 border-t border-neutral-700/50">
                                                        <div className="bg-neutral-950/50 rounded-lg p-4 border-l-4 border-purple-600">
                                                            <h3
                                                                className="text-xs font-semibold uppercase tracking-wide text-purple-300 mb-2"
                                                                style={fontStyles.meta}
                                                            >
                                                                Abstract
                                                            </h3>
                                                            <p className="text-sm text-slate-300 leading-relaxed" style={fontStyles.body}>
                                                                {item.abstract}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </FadeIn>
                            );
                        })}
                    </div>
                </FadeIn>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 mt-8 border-t border-gray-700 mx-auto">
                    <button
                        onClick={() => setPage(Math.max(page - 1, 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        style={fontStyles.cta}
                    >
                        &lt;
                    </button>

                    <div className="flex gap-2">
                        {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                            const pageNumber = i + 1;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setPage(pageNumber)}
                                    className={`w-10 h-10 rounded-lg transition-all duration-200 font-semibold cursor-pointer ${
                                        page === pageNumber
                                            ? 'bg-purple-500 text-white scale-110'
                                            : 'bg-neutral-700 text-neutral-300 hover:bg-purple-600 hover:text-white'
                                    }`}
                                    style={fontStyles.cta}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        {totalPages > 10 && <span className="flex items-center text-gray-500 text-xs px-2">+{totalPages - 10} more</span>}
                    </div>

                    <button
                        onClick={() => setPage(Math.min(page + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        style={fontStyles.cta}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
