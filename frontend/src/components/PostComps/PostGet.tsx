// src/components/PostComps/PostGet.tsx
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { formatDate } from '../../utilities/helpers';
import type { Post, ContentItem } from '../../types';
import { error as logError } from '../../utilities/logger';
import { FilterWrapper } from '../../components/GlobalComps/FilterWrapper';
import { FadeIn } from '../AnimationComps/FadeIn';
import { FeaturedPosts } from './PostFeatured';
import { ArrowSvgIconComponent } from '../../assets/icons/other/arrowIcon';

const COLOR_OPTIONS = [
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-pink-500',
    'text-red-500',
];

interface PublicPostListProps {
    imageHeight?: string;
}

export default function PublicPostList({
    imageHeight = 'h-64',
}: PublicPostListProps = {}) {
    // Use URL search params for pagination
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const postsPerPage = 5;

    // Get page from URL, default to 1 (1-indexed for users)
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Fetch posts on component mount
    useEffect(() => {
        void fetchPosts();

        // Initialize URL with page=1 if no page param exists
        if (!searchParams.has('page')) {
            navigate('/post?page=1', { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
        // Also trigger Lenis scroll if available
        if (window.lenis) {
            try {
                window.lenis.scrollTo(0, { immediate: true });
            } catch {
                // ignore if lenis doesn't support this
            }
        }
    }, [page]);

    // Fetch and normalize posts from API
    async function fetchPosts() {
        setError(null);
        setLoading(true);
        try {
            const res = await apiClient.get('/posts');
            const raw = Array.isArray(res.data)
                ? res.data
                : (res.data?.posts ?? []);

            const normalized: Post[] = (raw || [])
                .filter(Boolean)
                .map((p: unknown, i: number) => {
                    const obj = p as Record<string, unknown>;
                    const _id = String(obj._id ?? obj.id ?? `fallback-${i}`);
                    const title = (obj.title as string) ?? '';
                    const description = (obj.description as string) ?? '';
                    const tags = Array.isArray(obj.tags)
                        ? (obj.tags as string[])
                        : [];
                    const featured = Boolean(obj.featured);
                    const featuredImage = obj.featuredImage ?? null;
                    const category = (obj.category as string) ?? null;
                    const author = (obj.author as string) ?? null;
                    const createdAt = (obj.createdAt as string) ?? null;
                    const slug = (obj.slug as string) ?? '';

                    return {
                        ...obj,
                        _id,
                        title,
                        description,
                        tags,
                        featured,
                        featuredImage,
                        category,
                        author,
                        createdAt,
                        slug,
                    } as Post;
                });

            setPosts(normalized);
            setFilteredPosts(normalized);
            // Don't reset page on initial fetch - preserve URL param
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
            setFilteredPosts(items as Post[]);
            // Reset to page 1 when filtering using absolute path
            navigate('/post?page=1', { replace: true });
        },
        [navigate],
    );

    // Navigate to individual post page
    const handleReadMore = (slug: string) => {
        if (!slug) return;
        navigate(`/post/${slug}`);
    };

    // Update page in URL using navigate with absolute path
    const setPage = useCallback(
        (newPage: number) => {
            navigate(`/post?page=${newPage}`, { replace: false });
        },
        [navigate],
    );

    // Generate random colors for tags
    const postColorMaps = useMemo(() => {
        return filteredPosts.map((post) => {
            if (!post?.tags) return [] as string[];
            const availableColors = [...COLOR_OPTIONS];

            return post.tags.slice(0, 5).map(() => {
                if (availableColors.length === 0) {
                    availableColors.push(...COLOR_OPTIONS);
                }
                const randomIndex = Math.floor(
                    Math.random() * availableColors.length,
                );
                return availableColors.splice(randomIndex, 1)[0];
            });
        });
    }, [filteredPosts]);

    // Pagination calculations (convert 1-indexed page to 0-indexed for array slicing)
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    // Loading state
    if (loading) {
        return (
            <div className="w-full min-h-screen flex flex-col items-stretch py-6 px-4">
                {/* Filter skeleton */}
                <div className="w-full max-w-[1040px] xl:max-w-[1600px] mx-auto mb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6">
                        <div /> {/* Spacer for desktop alignment */}
                        <div className="h-20 bg-neutral-800 rounded animate-pulse" />
                        <div /> {/* Spacer for desktop alignment */}
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="w-full max-w-[1040px] xl:max-w-none mx-auto flex-1 grid grid-cols-1 xl:grid-cols-[1fr_auto_280px] gap-6">
                    <div /> {/* Left spacer for desktop */}
                    <div className="w-full max-w-[1040px] space-y-6">
                        {[...Array(3)].map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-neutral-800 rounded-lg h-96 animate-pulse"
                            />
                        ))}
                    </div>
                    <div className="hidden xl:block">
                        <div className="h-96 bg-neutral-900 rounded-xl border border-purple-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center py-6 px-4">
                <div className="bg-red-900 border border-red-700 text-red-200 p-6 rounded-lg max-w-lg w-full">
                    <p className="wrap-break-words mb-4">Error: {error}</p>
                    <button
                        onClick={() => void fetchPosts()}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600"
                        aria-label="Retry fetching posts"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state (posts) — replace your current `if (filteredPosts.length === 0) { ... }` block with this
    if (filteredPosts.length === 0) {
        return (
            <div className="w-full min-h-screen flex flex-col items-stretch py-6 px-4">
                {/* Filter section */}
                <div className="w-full max-w-[1040px] xl:max-w-[1600px] mx-auto mb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6">
                        <div className="hidden xl:block" />{' '}
                        {/* Spacer for desktop alignment */}
                        <div>
                            <FilterWrapper
                                items={posts}
                                onFilter={handleFilter}
                                isAdmin={false}
                                showSearch={true}
                                showDateFilter={true}
                                showFeaturedFilter={true}
                            />
                        </div>
                        <div className="hidden xl:block" />{' '}
                        {/* Spacer for desktop alignment */}
                    </div>
                </div>

                {/* Empty state panel */}
                <div className="w-full max-w-[1040px] mx-auto flex-1 flex items-center justify-center">
                    <div className="bg-neutral-900 border border-gray-700 rounded-lg p-10 text-center max-w-[880px] w-full">
                        {/* subtle illustrative icon */}
                        <div className="mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-full bg-neutral-800/60">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-12 h-12 text-purple-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 7h16M4 12h16M4 17h16"
                                />
                            </svg>
                        </div>

                        <h2 className="text-2xl md:text-3xl text-white font-semibold mb-2">
                            No posts found
                        </h2>

                        <p className="text-sm text-slate-400 mb-6 max-w-[720px] mx-auto">
                            There aren't any posts that match your filters right
                            now. Try widening your search, clearing filters, or
                            refresh the list.
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => void fetchPosts()}
                                className="px-4 py-2 bg-purple-700/80 text-purple-100 rounded-lg hover:bg-purple-600 transition"
                                aria-label="Refresh post list"
                            >
                                Refresh
                            </button>

                            <button
                                onClick={() => {
                                    // restore all posts and reset pagination
                                    setFilteredPosts(posts);
                                    navigate('/post?page=1', { replace: true });
                                }}
                                className="px-4 py-2 bg-neutral-800 border border-gray-700 text-slate-300 rounded-lg hover:bg-neutral-900 transition"
                                aria-label="Clear post filters"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default render
    return (
        <div className="w-full px-4 py-6 hide-scrollbar">
            {/* Filter Section */}
            <div className="w-full max-w-[1040px] xl:max-w-[1600px] mx-auto mb-6">
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6">
                    <div className="hidden xl:block" /> {/* Left spacer */}
                    <div>
                        <FilterWrapper
                            items={posts}
                            contentType="post"
                            onFilter={handleFilter}
                            isAdmin={false}
                            showSearch={true}
                            showDateFilter={true}
                            showFeaturedFilter={true}
                        />
                    </div>
                    <div className="hidden xl:block" /> {/* Right spacer */}
                </div>
            </div>

            {/* Results count */}
            <div className="w-full max-w-[1040px] mx-auto mb-4 px-4">
                <p className="text-sm text-slate-400">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredPosts.length)} of{' '}
                    {filteredPosts.length} results
                </p>
            </div>

            {/* Content Grid - Three column layout on desktop */}
            <FadeIn
                direction="up"
                className="w-full max-w-[1040px] xl:max-w-none mx-auto grid grid-cols-1 xl:grid-cols-[minmax(280px,1fr)_minmax(0,1040px)_minmax(280px,1fr)] gap-6 hide-scrollbar"
            >
                {/* Left spacer with date line */}
                <div className="hidden xl:flex justify-end pl-6">
                    <div className="flex items-center">
                        <div className="w-1 h-full bg-gray-400 rounded-full" />
                    </div>
                </div>

                {/* Posts Column - centered when few posts */}
                <div className="w-full flex flex-col justify-center">
                    {/* Individual post cards */}
                    {currentPosts.map((post, postIndex) => {
                        const visibleTags = post?.tags?.slice(0, 5) ?? [];
                        const globalIndex = startIndex + postIndex;
                        const tagColorMap = postColorMaps[globalIndex] || [];

                        return (
                            <FadeIn
                                key={post._id}
                                direction="up"
                                delay={postIndex * 60}
                            >
                                <article
                                    className="relative flex-1 w-full"
                                    style={{
                                        marginBottom:
                                            postIndex < currentPosts.length - 1
                                                ? '1.5rem'
                                                : '0',
                                    }}
                                >
                                    {/* Desktop date display */}
                                    <div className="hidden xl:flex xl:absolute xl:-ml-[150px] xl:w-28 xl:top-6 justify-center">
                                        <div className="text-center">
                                            <div className="text-xl text-white">
                                                {new Date(
                                                    post.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                })}
                                            </div>
                                            <div className="text-sm text-slate-300 mt-1">
                                                {new Date(
                                                    post.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile date display */}
                                    <div className="xl:hidden flex items-center gap-2 mb-4">
                                        <div className="text-center">
                                            <div className="text-xl text-white">
                                                {new Date(
                                                    post.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                })}
                                            </div>
                                            <div className="text-xs text-slate-300 mt-1">
                                                {new Date(
                                                    post.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Featured image */}
                                    {post.featuredImage && (
                                        <div
                                            className={`relative ${imageHeight} cursor-pointer overflow-hidden rounded-lg border border-gray-950`}
                                            onClick={() =>
                                                handleReadMore(post.slug)
                                            }
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`View ${post.title}`}
                                        >
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Post content */}
                                    <div className="p-0 md:p-6 pb-0 flex flex-col gap-4">
                                        {/* Title and category row */}
                                        <div className="flex justify-between items-center gap-4">
                                            <h2
                                                className="text-2xl text-white cursor-pointer inline-flex relative group/title"
                                                onClick={() =>
                                                    handleReadMore(post.slug)
                                                }
                                                role="link"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' ||
                                                        e.key === ' '
                                                    ) {
                                                        e.preventDefault();
                                                        handleReadMore(
                                                            post.slug,
                                                        );
                                                    }
                                                }}
                                            >
                                                <span className="relative inline-block wrap-break-words">
                                                    {post.title}
                                                    {/* Animated underline on title hover */}
                                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover/title:w-full transition-all duration-300" />
                                                </span>
                                            </h2>

                                            {post.category && (
                                                <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs whitespace-nowrap">
                                                    {post.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {visibleTags.length > 0 && (
                                            <div className="flex flex-wrap items-center text-sm md:text-base gap-1">
                                                {visibleTags.map(
                                                    (
                                                        tag: string,
                                                        i: number,
                                                    ) => (
                                                        <span
                                                            key={i}
                                                            className={`${tagColorMap[i] ?? 'text-blue-600'}`}
                                                        >
                                                            {tag}
                                                            {i !==
                                                                visibleTags.length -
                                                                    1 && (
                                                                <span className="mx-2 text-gray-300">
                                                                    |
                                                                </span>
                                                            )}
                                                        </span>
                                                    ),
                                                )}
                                                {post.tags &&
                                                    post.tags.length > 5 && (
                                                        <span className="ml-3 text-gray-500 text-sm">
                                                            +
                                                            {post.tags.length -
                                                                5}{' '}
                                                            more
                                                        </span>
                                                    )}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {post.description && (
                                            <p className="text-white tracking-wide mt-4">
                                                {post.description}
                                            </p>
                                        )}

                                        {/* Metadata (author and date) */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                            {post.author && (
                                                <span>By: {post.author}</span>
                                            )}
                                            <span>
                                                Created:{' '}
                                                {post.createdAt
                                                    ? formatDate(post.createdAt)
                                                    : '—'}
                                            </span>
                                        </div>

                                        {/* Read More button */}
                                        <div className="mt-2 flex items-center justify-end relative">
                                            <button
                                                onClick={() =>
                                                    handleReadMore(post.slug)
                                                }
                                                className="relative left-1 md:left-8 inline-flex items-center gap-3 text-purple-400 font-semibold text-lg tracking-wide transition-all duration-200 transform hover:text-purple-200 hover:translate-x-1 hover:cursor-pointer"
                                                aria-label={`Read more about ${post.title}`}
                                            >
                                                <span>Read More</span>
                                                <span className="text-current text-xl">
                                                    &gt;
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Divider between posts */}
                                    {postIndex < currentPosts.length - 1 && (
                                        <div className="m-0 border border-gray-400 rounded-2xl" />
                                    )}
                                </article>
                            </FadeIn>
                        );
                    })}
                </div>

                {/* Featured Posts Column - stays at top */}
                <div className="hidden xl:flex w-full justify-end self-start">
                    <FadeIn direction="left" delay={300}>
                        <div className="">
                            <FeaturedPosts />
                        </div>
                    </FadeIn>
                </div>
            </FadeIn>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav
                    aria-label="Pagination"
                    className="flex flex-col items-center justify-center pt-8 mt-8"
                >
                    <div className="flex items-center justify-center gap-6">
                        {/* Previous Button */}
                        <div className="flex flex-col items-center group">
                            <button
                                type="button"
                                onClick={() => setPage(Math.max(page - 1, 1))}
                                disabled={page === 1}
                                className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-purple-600"
                                aria-label="Previous page"
                            >
                                <ArrowSvgIconComponent className="rotate-90 w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setPage(Math.max(page - 1, 1))}
                                disabled={page === 1}
                                className="text-xs text-gray-400 mt-1 bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200 group-hover:text-purple-400"
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                        </div>

                        {/* Page Indicators */}
                        <div className="flex items-center justify-center gap-4">
                            {[...Array(Math.min(totalPages, 10))].map(
                                (_, i) => {
                                    const pageNumber = i + 1;
                                    const isActive = page === pageNumber;
                                    return (
                                        <div
                                            key={i}
                                            className="flex flex-col items-center group"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPage(pageNumber)
                                                }
                                                className={`cursor-pointer w-4 h-4 rounded-full transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-purple-500 scale-110'
                                                        : 'bg-neutral-600 group-hover:bg-purple-400'
                                                }`}
                                                aria-label={`Go to page ${pageNumber}`}
                                                aria-current={
                                                    isActive
                                                        ? 'page'
                                                        : undefined
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPage(pageNumber)
                                                }
                                                className={`text-xs mt-1 bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200 ${
                                                    isActive
                                                        ? 'text-purple-400 font-semibold'
                                                        : 'text-gray-400 group-hover:text-purple-400'
                                                }`}
                                                aria-label={`Go to page ${pageNumber}`}
                                                aria-current={
                                                    isActive
                                                        ? 'page'
                                                        : undefined
                                                }
                                            >
                                                {pageNumber}
                                            </button>
                                        </div>
                                    );
                                },
                            )}
                            {totalPages > 10 && (
                                <span className="flex items-center text-gray-500 text-xs px-2">
                                    +{totalPages - 10} more
                                </span>
                            )}
                        </div>

                        {/* Next Button */}
                        <div className="flex flex-col items-center group">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage(Math.min(page + 1, totalPages))
                                }
                                disabled={page === totalPages}
                                className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-purple-600"
                                aria-label="Next page"
                            >
                                <ArrowSvgIconComponent className="-rotate-90 w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(Math.min(page + 1, totalPages))
                                }
                                disabled={page === totalPages}
                                className="text-xs text-gray-400 mt-1 bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200 group-hover:text-purple-400"
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </nav>
            )}
        </div>
    );
}
