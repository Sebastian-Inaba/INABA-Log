import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Post } from '../../types/';

// Keep the color options at module scope
const COLOR_OPTIONS = ['text-yellow-500', 'text-green-500', 'text-blue-500', 'text-pink-500', 'text-red-500'];

interface NewestPostProps {
    apiUrl?: string;
    className?: string;
    imageHeight?: string;
    autoFetch?: boolean;
    titleFont?: string;
    pFont?: string;
    ctaFont?: string;
    tagFont?: string;
}

export function NewestPost({
    apiUrl = '/posts/newest',
    className = '',
    imageHeight = 'h-64',
    autoFetch = true,
    titleFont = 'Poppins',
    pFont = 'Roboto_Slab',
    ctaFont = 'Poppins',
    tagFont = 'Lato',
}: NewestPostProps) {
    // State
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(autoFetch); // <-- add loading state
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Simple font styles - just use the font family from props
    const fontStyles = useMemo(
        () => ({
            h1: { fontFamily: titleFont, fontStyle: 'italic' },
            h2: { fontFamily: titleFont, fontWeight: 500 },
            tags: { fontFamily: tagFont, fontWeight: 400 },
            p: { fontFamily: pFont, fontWeight: 500 },
            cta: { fontFamily: ctaFont, fontWeight: 500, fontSize: '0.875rem' },
        }),
        [titleFont, pFont, ctaFont, tagFont],
    );

    // Fetch newest post handler
    const handleFetchNewestPost = useCallback(
        async (url: string = apiUrl) => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{ success: boolean; post: Post }>(url);
                setPost(response.data.post);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post';
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

    const handleReadMore = () => {
        if (!post) return;
        navigate(`/post`);
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
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            return availableColors.splice(randomIndex, 1)[0];
        });
    }, [post]);

    /** Error state */
    if (error) {
        return (
            <div className={`rounded-lg p-6 text-center bg-transparent border border-gray-700 ${className}`}>
                <p className="text-gray-300 mb-2 text-base md:text-lg leading-relaxed tracking-wide" style={fontStyles.p}>
                    Something went wrong getting the latest post.
                </p>
                <button
                    onClick={handleRetry}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg mt-2"
                    style={fontStyles.cta}
                >
                    Try Again
                </button>
            </div>
        );
    }

    /** Loading skeleton */
    if (loading) {
        return (
            <div className={`rounded-lg p-6 text-center bg-transparent border border-gray-700 ${className}`}>
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
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed tracking-wide" style={fontStyles.p}>
                    No posts available
                </p>
                <button onClick={handleRetry} className="mt-3 text-blue-600 hover:text-blue-800 text-sm" style={fontStyles.cta}>
                    Refresh
                </button>
            </div>
        );
    }

    // Main render with simple font application
    return (
        <article className={`${className}`}>
            {/* H1 with italic titleFont */}
            <div className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 text-center">
                <h1 style={fontStyles.h1}>New Post</h1>
            </div>

            {post.featuredImage && (
                <div
                    className={`relative ${imageHeight} cursor-pointer overflow-hidden rounded-lg border border-gray-950 shadow-2xl`}
                    onClick={handleReadMore}
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

            <div className="p-6 flex flex-col gap-4">
                {/* H2 with medium titleFont */}
                <h2
                    className="w-fit text-2xl text-white line-clamp-2 cursor-pointer hover:text-gray-200 hover:underline"
                    style={fontStyles.h2}
                    onClick={handleReadMore}
                >
                    {post.title}
                </h2>

                {/* Tags with regular tagFont */}
                {visibleTags.length > 0 && (
                    <div className="flex flex-wrap items-center text-sm md:text-base gap-1">
                        {visibleTags.map((tag: string, i: number) => (
                            <span key={i} className={`${tagColorMap[i] ?? 'text-blue-600'}`} style={fontStyles.tags}>
                                {tag}
                                {i !== visibleTags.length - 1 && <span className="mx-2 text-gray-300">|</span>}
                            </span>
                        ))}
                        {post.tags && post.tags.length > 4 && (
                            <span className="ml-3 text-gray-500 text-sm" style={fontStyles.tags}>
                                +{post.tags.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {/* Body text with medium bodyFont */}
                {post.description && (
                    <p className="text-white line-clamp-3 tracking-wide mt-4" style={fontStyles.p}>
                        {post.description}
                    </p>
                )}

                <div className="mt-2 flex items-center justify-center">
                    {/* CTA with medium ctaFont and smaller size */}
                    <button
                        onClick={handleReadMore}
                        className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-blue-100 shadow-md hover:shadow-lg px-6 py-3 rounded-full tracking-wide transition-transform transform hover:-translate-y-0.5"
                        aria-label="Read more about this post"
                        style={fontStyles.cta}
                    >
                        <span>Read More</span>
                    </button>
                </div>
            </div>
        </article>
    );
}
