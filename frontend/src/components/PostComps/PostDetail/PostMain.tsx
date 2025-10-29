// src/components/PostComps/PostDetail/PostMain.tsx
import { useEffect, useState } from 'react';
import { FadeIn } from '../../AnimationComps/FadeIn';
import { MarkdownRenderer } from '../../UtilityComps/MarkdownRenderer';
import { apiClient } from '../../../utilities/api';
import { error as logError } from '../../../utilities/logger';
import type { Post } from '../../../types';

interface PostMainProps {
    slug: string;
}

export function PostMain({ slug }: PostMainProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch post content
    useEffect(() => {
        const handleFetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    post: Post;
                }>(`/posts/${slug}`);
                setContent(response.data.post.content || '');
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch post content';
                setError(errorMessage);
                logError('PostMain error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        };
        handleFetchPost();
    }, [slug]);

    // Loading state
    if (loading) {
        return (
            <FadeIn direction="up" duration={700} delay={1300}>
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-10 mb-8 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-6 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                </section>
            </FadeIn>
        );
    }

    // Error state
    if (error) {
        return (
            <FadeIn direction="up" duration={700} delay={200}>
                <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 md:p-10 mb-8">
                    <div className="text-center">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                </section>
            </FadeIn>
        );
    }

    // Loaded state
    return (
        <FadeIn direction="up" duration={700} delay={200}>
            <section className="mb-8 px-3">
                <MarkdownRenderer content={content} variant="preview" />
            </section>
        </FadeIn>
    );
}
