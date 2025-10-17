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

const COLOR_OPTIONS = ['text-yellow-500', 'text-green-500', 'text-blue-500', 'text-pink-500', 'text-red-500'];

interface PublicPostListProps {
    titleFont?: string;
    bodyFont?: string;
    ctaFont?: string;
    tagFont?: string;
    dateFont?: string;
    imageHeight?: string;
}

export default function PublicPostList({
    titleFont = 'Poppins',
    bodyFont = 'Roboto_Slab',
    ctaFont = 'Poppins',
    tagFont = 'Lato',
    dateFont = 'Poppins',
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

    // Memoized font styles
    const fontStyles = useMemo(
        () => ({
            dateDay: { fontFamily: dateFont, fontWeight: 800 },
            dateMonth: { fontFamily: dateFont, fontWeight: 400 },
            postTitle: { fontFamily: titleFont, fontWeight: 700 },
            tags: { fontFamily: tagFont, fontWeight: 400 },
            description: { fontFamily: bodyFont, fontWeight: 400 },
            readMore: { fontFamily: ctaFont, fontWeight: 500 },
        }),
        [titleFont, bodyFont, ctaFont, tagFont, dateFont],
    );

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
            const raw = Array.isArray(res.data) ? res.data : (res.data?.posts ?? []);

            const normalized: Post[] = (raw || []).filter(Boolean).map((p: unknown, i: number) => {
                const obj = p as Record<string, unknown>;
                const _id = String(obj._id ?? obj.id ?? `fallback-${i}`);
                const title = (obj.title as string) ?? '';
                const description = (obj.description as string) ?? '';
                const tags = Array.isArray(obj.tags) ? (obj.tags as string[]) : [];
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
                const randomIndex = Math.floor(Math.random() * availableColors.length);
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
            <div className="w-full py-6 px-4">
                {/* Filter skeleton*/}
                <div className="w-full max-w-[1040px] xl:max-w-[1600px] mx-auto mb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6">
                        <div /> {/* Spacer for desktop alignment */}
                        <div className="h-20 bg-neutral-800 rounded animate-pulse" />
                        <div /> {/* Spacer for desktop alignment */}
                    </div>
                </div>

                {/* Content skeleton*/}
                <div className="w-full max-w-[1040px] xl:max-w-none grid grid-cols-1 xl:grid-cols-[1fr_auto_280px] gap-6 xl:mx-0 mx-auto">
                    <div /> {/* Left spacer for desktop */}
                    <div className="w-full max-w-[1040px] space-y-6">
                        {[...Array(3)].map((_, idx) => (
                            <div key={idx} className="bg-neutral-800 rounded-lg h-96 animate-pulse" />
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
            <div className="h-full min-h-0 flex items-center justify-center p-6">
                <div className="bg-red-900 border border-red-700 text-red-200 p-6 rounded-lg max-w-lg w-full">
                    <p className="break-words mb-4">Error: {error}</p>
                    <button
                        onClick={() => void fetchPosts()}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600"
                        style={fontStyles.readMore}
                        aria-label="Retry fetching posts"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (filteredPosts.length === 0) {
        return (
            <div className="w-full py-6 px-4">
                {/* Filter section */}
                <div className="w-full max-w-[1040px] xl:max-w-[1600px] mx-auto mb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6">
                        <div className="hidden xl:block" /> {/* Spacer for desktop alignment */}
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
                        <div className="hidden xl:block" /> {/* Spacer for desktop alignment */}
                    </div>
                </div>

                {/* Empty state message */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center max-w-[1040px] mx-auto">
                    <p className="text-gray-300" style={fontStyles.description}>
                        No posts found.
                    </p>
                </div>
            </div>
        );
    }

    // Default render
    return (
        <div className="w-full py-6 px-4 hide-scrollbar">
            {/* Filter Section */}
            <div className="w-full max-w-[1040px] xl:max-w-[1600px] mx-auto mb-6">
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6">
                    <div className="hidden xl:block" /> {/* Left spacer */}
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
                    <div className="hidden xl:block" /> {/* Right spacer */}
                </div>
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
                            <FadeIn key={post._id} direction="up" delay={postIndex * 60}>
                                <article
                                    className="relative flex-1 w-full"
                                    style={{ marginBottom: postIndex < currentPosts.length - 1 ? '1.5rem' : '0' }}
                                >
                                    {/* Desktop date display */}
                                    <div className="hidden xl:flex xl:absolute xl:-ml-[150px] xl:w-28 xl:top-6 justify-center">
                                        <div className="text-center">
                                            <div className="text-xl text-white" style={fontStyles.dateDay}>
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { day: '2-digit' })}
                                            </div>
                                            <div className="text-sm text-slate-300 mt-1" style={fontStyles.dateMonth}>
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile date display */}
                                    <div className="xl:hidden flex items-center gap-2 mb-4">
                                        <div className="text-center">
                                            <div className="text-xl text-white" style={fontStyles.dateDay}>
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { day: '2-digit' })}
                                            </div>
                                            <div className="text-xs text-slate-300 mt-1" style={fontStyles.dateMonth}>
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Featured image */}
                                    {post.featuredImage && (
                                        <div
                                            className={`relative ${imageHeight} cursor-pointer overflow-hidden rounded-lg border border-gray-950 shadow-2xl`}
                                            onClick={() => handleReadMore(post.slug)}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`View ${post.title}`}
                                        >
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Post content */}
                                    <div className="p-6 pb-0 flex flex-col gap-4">
                                        {/* Title and category row */}
                                        <div className="flex flex-wrap items-center gap-4">
                                            <h2
                                                className="text-2xl text-white hover:text-gray-200 hover:underline line-clamp-2 cursor-pointer flex-1"
                                                style={fontStyles.postTitle}
                                                onClick={() => handleReadMore(post.slug)}
                                            >
                                                {post.title}
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
                                                {visibleTags.map((tag: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className={`${tagColorMap[i] ?? 'text-blue-600'}`}
                                                        style={fontStyles.tags}
                                                    >
                                                        {tag}
                                                        {i !== visibleTags.length - 1 && <span className="mx-2 text-gray-300">|</span>}
                                                    </span>
                                                ))}
                                                {post.tags && post.tags.length > 5 && (
                                                    <span className="ml-3 text-gray-500 text-sm" style={fontStyles.tags}>
                                                        +{post.tags.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {post.description && (
                                            <p className="text-white line-clamp-3 tracking-wide mt-4" style={fontStyles.description}>
                                                {post.description}
                                            </p>
                                        )}

                                        {/* Metadata (author and date) */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                            {post.author && <span>By: {post.author}</span>}
                                            <span>Created: {post.createdAt ? formatDate(post.createdAt) : '—'}</span>
                                        </div>

                                        {/* Read More button */}
                                        <div className="mt-2 flex items-center justify-end relative">
                                            <button
                                                onClick={() => handleReadMore(post.slug)}
                                                className="relative left-8 inline-flex items-center gap-3 text-purple-400 font-semibold text-lg tracking-wide transition-all duration-200 transform hover:text-purple-200 hover:translate-x-1 hover:cursor-pointer"
                                                aria-label={`Read more about ${post.title}`}
                                                style={fontStyles.readMore}
                                            >
                                                <span>Read More</span>
                                                <span className="text-current text-xl">&gt;</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Divider between posts */}
                                    {postIndex < currentPosts.length - 1 && <div className="m-0 border-1 border-gray-400 rounded-2xl" />}
                                </article>
                            </FadeIn>
                        );
                    })}
                </div>

                {/* Featured Posts Column - stays at top */}
                <div className="hidden xl:flex w-full justify-end self-start">
                    <FadeIn direction="left" delay={300}>
                        <div className="w-[280px]">
                            <FeaturedPosts />
                        </div>
                    </FadeIn>
                </div>
            </FadeIn>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 mt-8 border-t border-gray-700">
                    {/* Previous button */}
                    <button
                        onClick={() => setPage(Math.max(page - 1, 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        style={fontStyles.readMore}
                        aria-label="Previous page"
                    >
                        &lt;
                    </button>

                    {/* Page numbers */}
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
                                    aria-label={`Go to page ${pageNumber}`}
                                    aria-current={page === pageNumber ? 'page' : undefined}
                                    style={fontStyles.readMore}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        {totalPages > 10 && <span className="flex items-center text-gray-500 text-xs px-2">+{totalPages - 10} more</span>}
                    </div>

                    {/* Next button */}
                    <button
                        onClick={() => setPage(Math.min(page + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        style={fontStyles.readMore}
                        aria-label="Next page"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
