import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import { FadeIn } from '../AnimationComps/FadeIn';
import type { Research } from '../../types/';

interface NewestResearchProps {
    apiUrl?: string;
    className?: string;
    showAuthor?: boolean;
    autoFetch?: boolean;
    heroTitle?: string;
    heroText?: string;
    heroCtaText?: string;
}

export function NewestResearch({
    apiUrl = '/research/newest',
    className = '',
    showAuthor = true,
    autoFetch = true,
    heroTitle = 'The person behind it all',
    heroText = 'You have come to the right place if you are interested in web development, gaming, or Sebastian Inaba(me). Feel free to look around my posts; and if something catches your eye, check out my latest deep dives or some of my other projects.',
    heroCtaText = 'or go deeper.',
}: NewestResearchProps) {
    const [researchList, setResearchList] = useState<Research[]>([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Fetch newest research handler
    const handleFetchNewestResearch = useCallback(
        async (url: string = apiUrl) => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    research: Research[];
                }>(url);
                setResearchList(response.data.research);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch research';
                setError(message);
                logError('NewestResearch error:', message, err);
            } finally {
                setLoading(false);
            }
        },
        [apiUrl],
    );

    useEffect(() => {
        if (autoFetch) handleFetchNewestResearch();
    }, [autoFetch, handleFetchNewestResearch]);

    const handleGoDeeperRedirect = (slug: string) => {
        if (!slug) return;
        navigate(`/research/${slug}`);
    };

    const handleRetry = () => handleFetchNewestResearch();

    /** Error state */
    if (error) {
        return (
            <section className={`p-3 sm:p-4 md:p-6 ${className}`}>
                <div className="rounded-lg p-6 text-center bg-transparent border border-gray-700">
                    <p className="text-gray-300 mb-2 text-base md:text-lg leading-relaxed tracking-wide">
                        Something went wrong getting research highlights.
                    </p>
                    <button
                        onClick={handleRetry}
                        className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg mt-2"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    /** Loading skeleton */
    if (loading) {
        return (
            <section
                className={`p-3 sm:p-4 md:p-6 ${className}`}
                aria-labelledby="home-hero"
            >
                <header id="home-hero" className="mb-4 sm:mb-5">
                    <div className="h-7 sm:h-8 w-48 sm:w-64 rounded bg-gray-700 mb-2" />
                    <div className="h-3 sm:h-4 w-full sm:w-5/6 rounded bg-gray-700" />
                    <div className="h-7 sm:h-8 w-24 sm:w-32 rounded bg-gray-700 mt-3" />
                </header>
                <div className="space-y-3">
                    {[0, 1].map((_, researchIndex) => (
                        <div
                            key={researchIndex}
                            className="p-3 rounded-lg border border-gray-700 bg-transparent animate-pulse"
                        >
                            <div className="h-4 sm:h-5 w-full sm:w-3/4 rounded bg-gray-700 mb-2" />
                            <div className="h-3 sm:h-4 w-3/4 sm:w-1/2 rounded bg-gray-700" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!loading && researchList.length === 0) {
        return (
            <section
                className={`bg-gray-900 border border-gray-700 rounded-lg p-8 text-center ${className}`}
            >
                <p className="text-gray-300">
                    No research highlights available.
                </p>
                <button
                    onClick={handleRetry}
                    className="mt-3 text-indigo-400 hover:text-indigo-200 text-sm"
                >
                    Refresh
                </button>
            </section>
        );
    }

    return (
        <section
            className={`${className} relative z-20`}
            aria-labelledby="home-hero"
        >
            <div id="home-hero" className="mb-4 sm:mb-6">
                <FadeIn direction="right" delay={0}>
                    <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-white wrap-break-words drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        {heroTitle}
                    </h1>
                </FadeIn>

                <FadeIn direction="right" delay={100}>
                    <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-base text-gray-600 dark:text-slate-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                        {heroText}
                    </p>
                </FadeIn>

                <FadeIn direction="right" delay={200}>
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 items-center">
                        <a
                            href="/portfolio"
                            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/40 whitespace-nowrap bg-neutral-900/50 backdrop-blur-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                        >
                            View Portfolio
                        </a>
                        <a
                            href="https://github.com/your-username"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/40 whitespace-nowrap bg-neutral-900/50 backdrop-blur-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                        >
                            GitHub
                        </a>
                        {/* This will be for news letter or something else later? 
                        <a
                            href="/newsletter"
                            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold whitespace-nowrap"
                        >
                            Subscribe
                        </a>  
                        */}
                        <span className="hidden sm:inline text-sm text-gray-500 dark:text-slate-400">
                            •
                        </span>
                        <button
                            onClick={() => navigate('/research')}
                            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 hover:underline whitespace-nowrap cursor-pointer drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                            aria-label={heroCtaText}
                        >
                            {heroCtaText}
                        </button>
                    </div>
                </FadeIn>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {researchList.map((research, idx) => {
                    const id = research._id ?? research.slug;
                    return (
                        <FadeIn
                            direction="right"
                            delay={300 + idx * 100}
                            key={id}
                        >
                            <article
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                    handleGoDeeperRedirect(research.slug)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleGoDeeperRedirect(research.slug);
                                    }
                                }}
                                className={`group transform transition-transform duration-200 ease-out
                                    hover:scale-101 hover:-translate-y-1 hover:shadow-xl
                                    bg-neutral-900/50 hover:bg-neutral-900
                                    rounded-lg border border-gray-700 dark:border-slate-700 border-l-4
                                    hover:border-transparent hover:border-l-purple-500
                                    p-3 sm:p-4 flex items-start gap-2 sm:gap-4 cursor-pointer
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 backdrop-blur-sm
                                `}
                                style={{ willChange: 'transform' }}
                            >
                                <div className="w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-purple-600 dark:bg-purple-400 mt-1 shrink-0 transition-colors duration-200 group-hover:bg-purple-500" />

                                <div className="flex-1 min-w-0">
                                    <div className="text-left w-full">
                                        <h3 className="text-base sm:text-lg text-white dark:text-white wrap-break-words line-clamp-2 transition-colors duration-200 group-hover:text-purple-300">
                                            {research.title}
                                        </h3>
                                    </div>

                                    <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 dark:text-slate-300">
                                        <div className="shrink-0">
                                            {showAuthor && research.author ? (
                                                <span className="wrap-break-words">
                                                    By {research.author} •{' '}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                            <time dateTime={research.createdAt}>
                                                {new Date(
                                                    research.createdAt,
                                                ).toLocaleDateString()}
                                            </time>
                                        </div>
                                    </div>

                                    {research.abstract && (
                                        <p
                                            className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-slate-300 line-clamp-3 wrap-break-words
                    transition-opacity duration-200 group-hover:opacity-90"
                                        >
                                            {research.abstract}
                                        </p>
                                    )}
                                </div>
                            </article>
                        </FadeIn>
                    );
                })}

                {/* If backend returns <2 items, show placeholders */}
                {researchList.length < 2 &&
                    Array.from({ length: 2 - researchList.length }).map(
                        (_, i) => (
                            <FadeIn
                                direction="right"
                                delay={
                                    300 + researchList.length * 100 + i * 100
                                }
                                key={`empty-${i}`}
                            >
                                <div className="p-3 sm:p-4 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                                        More deep dives coming soon.
                                    </p>
                                </div>
                            </FadeIn>
                        ),
                    )}
            </div>
        </section>
    );
}
