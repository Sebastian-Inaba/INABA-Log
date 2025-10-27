import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import { FadeIn } from '../AnimationComps/FadeIn';
import type { Post } from '../../types/';

const COLOR_OPTIONS = ['text-yellow-500', 'text-green-500', 'text-blue-500', 'text-pink-500', 'text-red-500'];

interface LatestPostsProps {
    apiUrl?: string;
    className?: string;
    showAuthor?: boolean;
    imageHeight?: string;
    autoFetch?: boolean;
    maxPosts?: number;
    // Font props
    titleFont?: string;
    bodyFont?: string;
    ctaFont?: string;
    tagFont?: string;
    dateFont?: string;
}

export function LatestPosts({
    apiUrl = '/posts/latest-five',
    className = '',
    imageHeight = 'h-64',
    autoFetch = true,
    maxPosts = 5,
    // Font defaults
    titleFont = 'Poppins',
    bodyFont = 'Roboto_Slab',
    ctaFont = 'Poppins',
    tagFont = 'Lato',
    dateFont = 'Poppins',
}: LatestPostsProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Simple font styles
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

    // Fetch latest posts handler
    const handleFetchLatestPosts = useCallback(
        async (url: string = apiUrl) => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{ success: boolean; posts: Post[] }>(url);
                const postsArray = response.data.posts ?? [];
                const postsData = postsArray.slice(0, maxPosts);
                setPosts(postsData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
                setError(errorMessage);
                logError('LatestPosts component error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        },
        [apiUrl, maxPosts],
    );

    useEffect(() => {
        if (autoFetch) {
            handleFetchLatestPosts();
        }
    }, [autoFetch, handleFetchLatestPosts]);

    // Read more handler using slug
    const handleReadMore = (slug: string) => {
        if (!slug) return;
        navigate(`/post/${slug}`);
    };

    // Retry handler
    const handleRetry = () => {
        handleFetchLatestPosts();
    };

    // Generate color maps for all posts with unique colors per post
    const postColorMaps = useMemo(() => {
        return posts.map((post) => {
            if (!post?.tags) return [] as string[];
            const colors: string[] = [];
            const availableColors = [...COLOR_OPTIONS];

            return post.tags.slice(0, 4).map(() => {
                if (availableColors.length === 0) {
                    availableColors.push(...COLOR_OPTIONS);
                }
                const randomIndex = Math.floor(Math.random() * availableColors.length);
                const selectedColor = availableColors.splice(randomIndex, 1)[0];
                colors.push(selectedColor);
                return selectedColor;
            });
        });
    }, [posts]);

    if (error) {
        return (
            <div className={`rounded-lg p-6 text-center bg-transparent border border-gray-700 ${className}`}>
                <p className="text-gray-300 mb-2 text-base md:text-lg leading-relaxed tracking-wide" style={fontStyles.description}>
                    Something went wrong getting recent posts.
                </p>
                <button
                    onClick={handleRetry}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg mt-2"
                    style={fontStyles.readMore}
                >
                    Try Again
                </button>
            </div>
        );
    }

    /** Loading skeleton */
    if (loading) {
        return (
            <div className={`space-y-6 ${className}`}>
                {[...Array(maxPosts)].map((_, postIndex) => (
                    <div
                        key={postIndex}
                        className="flex flex-col lg:flex-row bg-transparent border border-gray-700 rounded-lg animate-pulse"
                    >
                        <div className="lg:w-28 shrink-0 flex items-center justify-center p-4">
                            <div className="h-10 w-10 rounded bg-gray-700" />
                        </div>
                        <div className="hidden lg:flex items-stretch">
                            <div className="w-px bg-gray-700 mx-4" />
                        </div>
                        <div className="flex-1 border border-gray-700 rounded-lg">
                            <div className={`bg-gray-800 ${imageHeight} rounded-t-lg`} />
                            <div className="p-6">
                                <div className="h-6 w-3/4 rounded bg-gray-700 mb-3" />
                                <div className="h-4 w-1/2 rounded bg-gray-700 mb-4" />
                                <div className="h-10 w-32 rounded bg-gray-700" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!loading && posts.length === 0) {
        return (
            <div className={`bg-gray-900 border border-gray-700 rounded-lg p-8 text-center ${className}`}>
                <p className="text-gray-300" style={fontStyles.description}>
                    No recent posts available.
                </p>
                <button onClick={handleRetry} className="mt-3 text-indigo-400 hover:text-indigo-200 text-sm" style={fontStyles.readMore}>
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="flex flex-col xl:flex-row">
                <div className="flex-1 space-y-0">
                    {posts.map((post, postIndex) => {
                        const visibleTags = post?.tags?.slice(0, 5) ?? [];
                        const tagColorMap = postColorMaps[postIndex] || [];

                        return (
                            <div key={post._id}>
                                <article className="flex flex-col xl:flex-row items-stretch bg-transparent xl:gap-0">
                                    {/* Date column, top on mobile/tablet, left sidebar on xl+ */}
                                    <FadeIn direction="up" delay={postIndex * 100}>
                                        <div className="xl:absolute xl:-ml-[136px] xl:w-28 shrink-0 flex flex-col items-start ls:items-center justify-center p-0 pb-2 lg:p-4">
                                            <div className="text-center">
                                                <div className="text-xl text-gray-900 dark:text-white" style={fontStyles.dateDay}>
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', { day: '2-digit' })}
                                                </div>
                                                <div
                                                    className="text-xs text-gray-500 dark:text-slate-300 mt-1"
                                                    style={fontStyles.dateMonth}
                                                >
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </FadeIn>
                                    {/* Vertical divider, hidden on tablet and below, shown on xl+ */}
                                    <div className="hidden xl:flex items-stretch mr-30">
                                        <div className="w-px border-2 rounded-2xl border-gray-400" />
                                    </div>

                                    {/* Cards*/}
                                    <FadeIn direction="up" delay={postIndex * 100} className="w-full">
                                        <article className="flex-1 relative">
                                            {post.featuredImage && (
                                                <div
                                                    className={`relative ${imageHeight} cursor-pointer overflow-hidden rounded-lg border border-gray-950 shadow-2xl`}
                                                    onClick={() => handleReadMore(post.slug)}
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

                                            <div className="p-0 pt-2 lg:p-6 flex flex-col gap-4">
                                                <h2
                                                    className="group relative text-2xl text-white line-clamp-2 cursor-pointer pb-1"
                                                    style={fontStyles.postTitle}
                                                    onClick={() => handleReadMore(post.slug)}
                                                    role="link"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleReadMore(post.slug);
                                                        }
                                                    }}
                                                >
                                                    <span className="relative inline-block wrap-break-words">
                                                        {post.title}
                                                        {/* Animated underline on title hover */}
                                                        <span className="absolute left-0 bottom-0 h-0.5 w-full bg-purple-400 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                                                    </span>
                                                </h2>

                                                {visibleTags.length > 0 && (
                                                    <div className="flex flex-wrap items-center text-sm md:text-base gap-1">
                                                        {visibleTags.map((tag: string, i: number) => (
                                                            <span
                                                                key={i}
                                                                className={`${tagColorMap[i] ?? 'text-blue-600'}`}
                                                                style={fontStyles.tags}
                                                            >
                                                                {tag}
                                                                {i !== visibleTags.length - 1 && (
                                                                    <span className="mx-2 text-gray-300">|</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                        {post.tags && post.tags.length > 4 && (
                                                            <span className="ml-3 text-gray-500 text-sm" style={fontStyles.tags}>
                                                                +{post.tags.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {post.description && (
                                                    <p
                                                        className="text-white line-clamp-3 tracking-wide mt-4"
                                                        style={fontStyles.description}
                                                    >
                                                        {post.description}
                                                    </p>
                                                )}

                                                <div className="mt-2 flex items-center justify-end relative">
                                                    <button
                                                        onClick={() => handleReadMore(post.slug)}
                                                        className="relative left-2 inline-flex items-center gap-3 text-purple-400 font-semibold text-lg tracking-wide transition-all duration-200 transform hover:text-purple-200 hover:translate-x-1 hover:cursor-pointer"
                                                        aria-label="Read more about this post"
                                                        style={fontStyles.readMore}
                                                    >
                                                        <span>Read More</span>
                                                        <span className="text-current text-xl">&gt;</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Horizontal divider between posts */}
                                            {postIndex < posts.length - 1 && (
                                                <div className="mb-12 border-t border rounded-2xl border-gray-400" />
                                            )}
                                        </article>
                                    </FadeIn>
                                </article>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
