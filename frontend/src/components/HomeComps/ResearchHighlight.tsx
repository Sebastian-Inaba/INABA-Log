// src/components/HomeComps/ResearchHighlight.tsx
import { useState, useEffect, useCallback, memo } from 'react';
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

/**
 * ResearchCard
 *
 * - Renders 2 research items as accessible, focusable cards.
 * - Uses a semantic <ul>/<li> list wrapper in the parent to preserve document structure.
 * - The interactive element is a <button type="button"> for correct keyboard behavior.
 *
 */
const ResearchCard = memo(
    ({
        research,
        idx,
        showAuthor,
        onNavigate,
    }: {
        research: Research;
        idx: number;
        showAuthor: boolean;
        onNavigate: (slug: string) => void;
    }) => {
        const id = research._id ?? research.slug;

        // // click handler
        const handleClick = useCallback(() => {
            onNavigate(research.slug);
        }, [research.slug, onNavigate]);

        const readableDate = research.createdAt
            ? new Date(research.createdAt).toLocaleDateString()
            : 'Unknown date';

        return (
            // Fade-in animation for each list item
            <FadeIn direction="right" delay={300 + idx * 100} key={id}>
                {/* Each research card is a list item in the parent <ul> */}
                <li>
                    <button
                        type="button"
                        onClick={handleClick}
                        // Accessible name describes the action
                        aria-label={`Open research: ${research.title}`}
                        className="group transform transition-transform duration-200 ease-out hover:scale-101 hover:-translate-y-1 bg-[#9162CB] hover:bg-neutral-950/60 rounded-lg border border-gray-700 dark:border-slate-700 border-l-4 hover:border-transparent hover:border-l-purple-500 p-3 sm:p-4 flex items-start gap-2 sm:gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 w-full text-left"
                        style={{ willChange: 'transform' }}
                    >
                        {/* Decorative accent - mark as aria-hidden so assistive tech ignores it */}
                        <div
                            className="w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-purple-600 dark:bg-purple-400 mt-1 shrink-0 transition-colors duration-200 group-hover:bg-purple-500"
                            aria-hidden="true"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="text-left w-full">
                                <h3 className="text-base sm:text-lg text-white dark:text-white wrap-break-words line-clamp-2 transition-colors duration-200 group-hover:text-purple-300">
                                    {research.title}
                                </h3>
                            </div>

                            <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-900 dark:text-slate-900 group-hover:text-white">
                                <div className="shrink-0">
                                    {showAuthor && research.author && (
                                        <span
                                            className="wrap-break-words"
                                            aria-hidden="false"
                                        >
                                            By {research.author} •{' '}
                                        </span>
                                    )}
                                    <time dateTime={research.createdAt ?? ''}>
                                        {readableDate}
                                    </time>
                                </div>
                            </div>

                            {research.abstract && (
                                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-900 dark:text-slate-900 line-clamp-3 wrap-break-words transition-opacity duration-200 group-hover:opacity-90 group-hover:text-white">
                                    {research.abstract}
                                </p>
                            )}
                        </div>
                    </button>
                </li>
            </FadeIn>
        );
    },
);

ResearchCard.displayName = 'ResearchCard';

/**
 * NewestResearch
 *
 * - Shows a hero/info block and a list of newest deep dive highlights.
 *
 */
export function NewestResearch({
    apiUrl = '/research/newest',
    className = '',
    showAuthor = true,
    autoFetch = true,
    heroTitle = 'The place of infinite loops of coffee and errors',
    heroText = 'You have come to the right place if you are interested in web development, gaming, or Sebastian Inaba(me). I can assure you my code works most of the time, so feel free to look around my posts; and if something catches your eye, check out my latest deep dives or some of my other projects.',
    heroCtaText = 'or go deeper.',
}: NewestResearchProps) {
    const [researchList, setResearchList] = useState<Research[]>([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // // fetch handler
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

    // // redirect handler - navigate to specific research detail
    const handleGoDeeperRedirect = useCallback(
        (slug: string) => {
            if (!slug) return;
            navigate(`/research/${slug}`);
        },
        [navigate],
    );

    const handleRetry = useCallback(
        () => handleFetchNewestResearch(),
        [handleFetchNewestResearch],
    );

    // // redirect handler - navigate to research listing page
    const handleResearchNavigation = useCallback(() => {
        navigate('/research');
    }, [navigate]);

    if (error) {
        // Error state
        return (
            <section
                className={`p-3 sm:p-4 md:p-6 ${className}`}
                aria-labelledby="research-error-heading"
            >
                <div
                    className="rounded-lg p-6 text-center bg-transparent border border-gray-700"
                    role="alert"
                    aria-live="assertive"
                >
                    <h2 id="research-error-heading" className="sr-only">
                        Research highlights error
                    </h2>
                    <p className="text-gray-300 mb-2 text-base md:text-lg leading-relaxed tracking-wide">
                        Something went wrong getting research highlights.
                    </p>
                    <button
                        onClick={handleRetry}
                        className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg mt-2"
                        aria-label="Retry fetching research highlights"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section
            className={`${className} relative z-20 h-full flex flex-col`}
            // Hero heading id referenced by aria-labelledby
            aria-labelledby="home-hero"
            role="region"
        >
            {/* Info/Hero section */}
            <div className="border border-[#9162CB] p-4 rounded-2xl bg-neutral-950/80 mb-4">
                <FadeIn direction="right" delay={0}>
                    <h2
                        id="home-hero"
                        className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-white wrap-break-words"
                    >
                        {heroTitle}
                    </h2>
                </FadeIn>

                <FadeIn direction="right" delay={100}>
                    <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-base text-gray-600 dark:text-slate-300">
                        {heroText}
                    </p>
                </FadeIn>

                <FadeIn direction="right" delay={200}>
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-3 items-center">
                        <a
                            href="/portfolio"
                            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/40 whitespace-nowrap bg-neutral-900/50"
                            aria-label="View portfolio"
                        >
                            View Portfolio
                        </a>
                        <a
                            href="https://github.com/your-username"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/40 whitespace-nowrap bg-neutral-900/50"
                            aria-label="Open GitHub in a new tab"
                        >
                            GitHub
                        </a>
                        <span
                            className="inline text-sm text-gray-500 dark:text-slate-400"
                            aria-hidden="true"
                        >
                            •
                        </span>
                        <button
                            onClick={handleResearchNavigation}
                            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 hover:underline whitespace-nowrap cursor-pointer"
                            aria-label={heroCtaText}
                        >
                            {heroCtaText}
                        </button>
                    </div>
                </FadeIn>
            </div>

            {/* Research cards section */}
            <div className="flex-1">
                {loading ? (
                    // Loading state — use role=status so screen readers are informed
                    <div className="space-y-3" role="status" aria-live="polite">
                        {[0, 1].map((_, researchIndex) => (
                            <div
                                key={researchIndex}
                                className="p-3 rounded-lg border border-gray-700 bg-transparent animate-pulse"
                                aria-hidden="true"
                            >
                                <div className="h-4 sm:h-5 w-full sm:w-3/4 rounded bg-gray-700 mb-2" />
                                <div className="h-3 sm:h-4 w-3/4 sm:w-1/2 rounded bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : researchList.length === 0 ? (
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center"
                        role="status"
                        aria-live="polite"
                    >
                        <p className="text-gray-300">
                            No research highlights available.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="mt-3 text-indigo-400 hover:text-indigo-200 text-sm"
                            aria-label="Refresh research highlights"
                        >
                            Refresh
                        </button>
                    </div>
                ) : (
                    // Semantic list of research cards
                    <ul
                        role="list"
                        aria-label="Research highlights"
                        className="space-y-3 sm:space-y-4 border border-[#9162CB] p-2 rounded-2xl"
                    >
                        {researchList.map((research, idx) => (
                            <ResearchCard
                                key={research._id ?? research.slug}
                                research={research}
                                idx={idx}
                                showAuthor={showAuthor}
                                onNavigate={handleGoDeeperRedirect}
                            />
                        ))}

                        {/* If less than two items, render placeholders to keep visual balance */}
                        {researchList.length < 2 &&
                            Array.from({ length: 2 - researchList.length }).map(
                                (_, i) => (
                                    <FadeIn
                                        direction="right"
                                        delay={
                                            300 +
                                            researchList.length * 100 +
                                            i * 100
                                        }
                                        key={`empty-${i}`}
                                    >
                                        <li>
                                            <div className="p-3 sm:p-4 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                                                    More deep dives coming soon.
                                                </p>
                                            </div>
                                        </li>
                                    </FadeIn>
                                ),
                            )}
                    </ul>
                )}
            </div>
        </section>
    );
}
