import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Post } from '../../types/';

// Keep the color options at module scope
const COLOR_OPTIONS = [
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-pink-500',
    'text-red-500',
];

interface NewestPostProps {
    apiUrl?: string;
    className?: string;
    imageHeight?: string;
    autoFetch?: boolean;
}

export function NewestPost({
    apiUrl = '/posts/newest',
    className = '',
    imageHeight = 'h-64',
    autoFetch = true,
}: NewestPostProps) {
    // State
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(autoFetch); // <-- add loading state
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Fetch newest post handler
    const handleFetchNewestPost = useCallback(
        async (url: string = apiUrl) => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    post: Post;
                }>(url);
                setPost(response.data.post);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch post';
                setError(errorMessage);
                logError('NewestPost component error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        },
        [apiUrl],
    );

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) handleFetchNewestPost();
    }, [autoFetch, handleFetchNewestPost]);

    // Read more handler using slug
    const handleReadMore = (slug: string) => {
        if (!slug) return;
        navigate(`/post/${slug}`);
    };

    const handleRetry = () => handleFetchNewestPost();

    // Visible tags limit
    const visibleTags = post?.tags?.slice(0, 5) ?? [];

    // Assign a random color to each visible tag once per post load.
    const tagColorMap = useMemo(() => {
        if (!post?.tags) return [] as string[];
        const availableColors = [...COLOR_OPTIONS];

        return post.tags.slice(0, 4).map(() => {
            if (availableColors.length === 0) {
                availableColors.push(...COLOR_OPTIONS);
            }
            const randomIndex = Math.floor(
                Math.random() * availableColors.length,
            );
            return availableColors.splice(randomIndex, 1)[0];
        });
    }, [post]);

    /** Error state */
    if (error) {
        return (
            <div
                className={`rounded-lg p-6 text-center bg-transparent border border-gray-700 ${className}`}
            >
                <p className="text-gray-300 mb-2 text-base md:text-lg leading-relaxed tracking-wide">
                    Something went wrong getting the latest post.
                </p>
                <button
                    onClick={handleRetry}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg mt-2"
                >
                    Try Again
                </button>
            </div>
        );
    }

    /** Loading skeleton */
    if (loading) {
        return (
            <div
                className={`rounded-lg p-6 text-center bg-transparent border border-gray-700 ${className}`}
            >
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-1/2 mx-auto rounded bg-gray-700 mb-4" />
                    <div className="h-64 w-full rounded bg-gray-800 mb-4" />
                    <div className="h-6 w-3/4 mx-auto rounded bg-gray-700 mb-2" />
                    <div className="h-4 w-1/2 mx-auto rounded bg-gray-700 mb-2" />
                    <div className="h-10 w-32 mx-auto rounded bg-gray-700" />
                </div>
            </div>
        );
    }

    /** Empty state */
    if (!post) {
        return (
            <div
                className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}
            >
                <p className="text-gray-600 text-base md:text-lg leading-relaxed tracking-wide">
                    No posts available
                </p>
                <button
                    onClick={handleRetry}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                >
                    Refresh
                </button>
            </div>
        );
    }

    // Default render
    return (
        <article className="relative p-2 md:p-5 rounded-xl border border-gray-400 duration-300 ease-in-out bg-neutral-950/50">
            {/* H1*/}
            <div className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 text-center">
                <h1 className="italic">New Post</h1>
            </div>

            {post.featuredImage && (
                <div
                    className={`relative ${imageHeight} cursor-pointer overflow-hidden rounded-lg border border-gray-950`}
                    onClick={() => handleReadMore(post.slug)}
                >
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                                'none';
                        }}
                    />
                </div>
            )}

            <div className="p-0 md:p-6 flex flex-col gap-4">
                {/* H2 */}
                <h2
                    className="group relative w-fit text-2xl text-white line-clamp-2 cursor-pointer pb-1"
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
                    <span className="relative inline-block">
                        {post.title}
                        {/* Animated underline on title hover */}
                        <span className="absolute left-0 bottom-0 h-0.5 w-full bg-purple-400 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                    </span>
                </h2>

                {/* Tags */}
                {visibleTags.length > 0 && (
                    <div className="flex flex-wrap items-center text-sm md:text-base gap-1">
                        {visibleTags.map((tag: string, i: number) => (
                            <span
                                key={i}
                                className={`${tagColorMap[i] ?? 'text-blue-600'}`}
                            >
                                {tag}
                                {i !== visibleTags.length - 1 && (
                                    <span className="mx-2 text-gray-300">
                                        |
                                    </span>
                                )}
                            </span>
                        ))}
                        {post.tags && post.tags.length > 4 && (
                            <span className="ml-3 text-gray-500 text-sm">
                                +{post.tags.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {/* Body text */}
                {post.description && (
                    <p className="text-white line-clamp-3 tracking-wide mt-4">
                        {post.description}
                    </p>
                )}

                <div className="mt-2 flex items-center justify-center">
                    {/* CTA */}
                    <button
                        onClick={() => handleReadMore(post.slug)}
                        className="cursor-pointer inline-flex items-center gap-2 bg-transparent text-[#9162CB] border border-gray-400 px-6 py-3 rounded-full tracking-wide transition-all transform hover:scale-110 hover:border-[#9162CB]"
                        aria-label="Read more about this post"
                    >
                        <span>Read More</span>
                    </button>
                </div>
            </div>
        </article>
    );
}
