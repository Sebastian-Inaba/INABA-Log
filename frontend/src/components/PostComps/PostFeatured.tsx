// src/components/PostComps/PostFeatured.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Post } from '../../types';

export function FeaturedPosts() {
    const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Handle post click navigation
    const handlePostClick = (slug: string) => {
        if (!slug) return;
        navigate(`/post/${slug}`);
    };

    // Fetch featured posts on mount
    useEffect(() => {
        const handleFetchFeaturedPosts = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    posts: Post[];
                }>('/posts/featured');
                setFeaturedPosts(response.data.posts);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch featured posts';
                setFetchError(errorMessage);
                logError('FeaturedPosts error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        };
        handleFetchFeaturedPosts();
    }, []);

    // Loading state
    if (loading) {
        return (
            <aside className="bg-neutral-900 rounded-xl shadow-lg p-6 w-full md:w-80 flex flex-col gap-5 border border-purple-500 animate-pulse">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-500">
                    <div className="h-6 w-40 bg-neutral-800 rounded" />
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="space-y-2">
                            <div
                                className="h-4 rounded bg-neutral-800"
                                style={{ width: `${80 - idx * 5}%` }}
                            />
                            <div className="h-3 rounded bg-neutral-800 w-20" />
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    // Error state
    if (fetchError) {
        return (
            <aside className="bg-neutral-900 rounded-xl shadow-lg p-6 w-full md:w-80 flex flex-col gap-5 border border-purple-500">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-500">
                    <h2 className="text-lg font-bold text-purple-500 uppercase tracking-widest">
                        Editor's Choice
                    </h2>
                </div>
                <div className="text-center py-6">
                    <p className="text-red-400 text-sm mb-4">{fetchError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </aside>
        );
    }

    // Empty state
    if (featuredPosts.length === 0) {
        return (
            <aside className="bg-neutral-900 rounded-xl shadow-lg p-6 w-full md:w-80 flex flex-col gap-5 border border-purple-500">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-500">
                    <h2 className="text-lg font-bold text-purple-500 uppercase tracking-widest">
                        Editor's Choice
                    </h2>
                </div>
                <div className="text-center py-6 text-gray-400 text-sm">
                    No featured posts yet
                </div>
            </aside>
        );
    }

    return (
        <aside className="bg-neutral-900 rounded-xl shadow-lg p-6 w-full flex flex-col gap-5 border border-purple-500">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-500">
                <h2 className="text-lg font-bold text-purple-500 uppercase tracking-widest">
                    Editor's Choice
                </h2>
            </div>

            <ul className="space-y-3">
                {featuredPosts.map((post) => (
                    <li
                        key={post._id}
                        onClick={() => handlePostClick(post.slug)}
                        className="group cursor-pointer"
                    >
                        <article className="space-y-2 p-4 rounded-lg border-l-4 border-purple-500 bg-neutral-800/50 group-hover:bg-neutral-800 group-hover:border-purple-400 transition-all duration-200">
                            <h3 className="text-white font-semibold leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors duration-200">
                                {post.title}
                            </h3>
                            {post.category && (
                                <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium uppercase tracking-wider group-hover:text-purple-400 transition-colors duration-200">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                    {post.category}
                                </span>
                            )}
                        </article>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
