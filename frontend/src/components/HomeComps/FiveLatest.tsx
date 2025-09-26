import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Post } from '../../types/';

//TEST

interface LatestPostsProps {
    apiUrl?: string;
    className?: string;
    showAuthor?: boolean;
    imageHeight?: string;
    autoFetch?: boolean;
    maxPosts?: number;
}

export function LatestPosts({
    apiUrl = '/posts/latest-five',
    className = '',
    showAuthor = true,
    imageHeight = 'h-48',
    autoFetch = true,
    maxPosts = 5,
}: LatestPostsProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchLatestPosts = useCallback(
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
            fetchLatestPosts();
        }
    }, [autoFetch, fetchLatestPosts]);

    const handleReadMore = (post: Post) => {
        navigate(`/post/${post.slug}`);
    };

    const handleRetry = () => {
        fetchLatestPosts();
    };

    if (loading) {
        return (
            <div className={`space-y-6 ${className}`}>
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className={`bg-gray-200 ${imageHeight} rounded-t-lg`}></div>
                        <div className="p-6">
                            <div className="bg-gray-200 h-6 rounded mb-3"></div>
                            <div className="bg-gray-200 h-4 rounded w-3/4 mb-4"></div>
                            <div className="bg-gray-200 h-10 rounded w-32"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
                <div className="text-red-600 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <p className="text-red-800 mb-2">Failed to load latest posts</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
                <div className="text-gray-400 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <p className="text-gray-600">No posts available</p>
                <button onClick={handleRetry} className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {posts.map((post) => (
                <article
                    key={post._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Featured Image */}
                        {post.featuredImage && (
                            <div
                                className={`relative ${imageHeight} md:w-64 md:flex-shrink-0 overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none`}
                            >
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex-1 p-6">
                            {/* Title */}
                            <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                                {post.title}
                            </h2>

                            {/* Meta Information */}
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                {showAuthor && post.author && <span className="mr-4">By {post.author}</span>}
                                <time dateTime={post.createdAt}>
                                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </time>
                            </div>

                            {/* Category */}
                            {post.category && (
                                <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
                                    {post.category}
                                </div>
                            )}

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                    {post.tags.length > 3 && (
                                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            +{post.tags.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            {post.description && <p className="text-gray-700 leading-relaxed mb-4 line-clamp-2">{post.description}</p>}

                            {/* Read More Button */}
                            <button
                                onClick={() => handleReadMore(post)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition-colors"
                            >
                                Read More
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
