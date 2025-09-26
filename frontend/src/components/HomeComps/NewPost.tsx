import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Post } from '../../types/';

// Keep the color options at module scope so they are stable across renders.
// This fixes the ESLint warning about missing dependencies while preserving the
// original behavior (random color assigned once per post load).
const COLOR_OPTIONS = ['text-yellow-500', 'text-green-500', 'text-blue-500', 'text-pink-500', 'text-red-500'];

interface NewestPostProps {
    apiUrl?: string;
    className?: string;
    imageHeight?: string;
    autoFetch?: boolean;
}

export function NewestPost({ apiUrl = '/posts/newest', className = '', imageHeight = 'h-64', autoFetch = true }: NewestPostProps) {
    // State
    const [post, setPost] = useState<Post | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Fetch
    const fetchNewestPost = useCallback(
        async (url: string = apiUrl) => {
            try {
                setError(null);
                const response = await apiClient.get<{ success: boolean; post: Post }>(url);
                setPost(response.data.post);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post';
                setError(errorMessage);
                logError('NewestPost component error:', errorMessage, err);
            }
        },
        [apiUrl],
    );

    // Auto-fetch on mount (if enabled)
    useEffect(() => {
        if (autoFetch) fetchNewestPost();
    }, [autoFetch, fetchNewestPost]);

    // Navigate to read-more; (goes to post page for will make a get by id component later)
    const handleReadMore = () => {
        if (!post) return;
        navigate(`/post`);
    };

    const handleRetry = () => fetchNewestPost();

    // Visible tags limit
    const visibleTags = post?.tags?.slice(0, 5) ?? [];

    // Assign a random color to each visible tag once per post load.
    const tagColorMap = useMemo(() => {
        if (!post?.tags) return [] as string[];
        return post.tags.slice(0, 4).map(() => COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
    }, [post]);

    // Error state
    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
                <p className="text-red-800 mb-2">Failed to load post</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button onClick={handleRetry} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
                    Try Again
                </button>
            </div>
        );
    }

    // Empty state
    if (!post) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
                <p className="text-gray-600">No posts available</p>
                <button onClick={handleRetry} className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Refresh
                </button>
            </div>
        );
    }

    // Main render
    return (
        <article className={` ${className}`}>
            {post.featuredImage && (
                <div className={`relative ${imageHeight} overflow-hidden rounded-lg border border-gray-950 shadow-2xl`}>
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
                <h1 className="text-2xl font-bold text-white line-clamp-2">{post.title}</h1>

                {visibleTags.length > 0 && (
                    <div className="flex flex-wrap items-center text-sm md:text-base gap-1">
                        {visibleTags.map((tag: string, i: number) => (
                            <span key={i} className={`font-medium ${tagColorMap[i] ?? 'text-blue-600'}`}>
                                {tag}
                                {i !== visibleTags.length - 1 && <span className="mx-2 text-gray-300">|</span>}
                            </span>
                        ))}
                        {post.tags && post.tags.length > 4 && (
                            <span className="ml-3 text-gray-500 text-sm">+{post.tags.length - 4} more</span>
                        )}
                    </div>
                )}

                {post.description && <p className="text-white line-clamp-3 tracking-wide mt-4">{post.description}</p>}

                <div className="mt-2 flex items-center justify-center">
                    {/* CTA */}
                    <button
                        onClick={handleReadMore}
                        className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-100 shadow-md hover:shadow-lg px-6 py-3 rounded-full text-base font-semibold tracking-wide transition-transform transform hover:-translate-y-0.5"
                        aria-label="Read more about this post"
                    >
                        <span>Read More</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    );
}
