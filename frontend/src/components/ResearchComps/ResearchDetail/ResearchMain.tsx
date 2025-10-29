// src/components/ResearchComps/ResearchDetail/ResearchMain.tsx
import { useEffect, useState, useMemo, memo } from 'react';
import { FadeIn } from '../../AnimationComps/FadeIn';
import { MarkdownRenderer } from '../../UtilityComps/MarkdownRenderer';
import { apiClient } from '../../../utilities/api';
import { error as logError } from '../../../utilities/logger';
import { formatDate } from '../../../utilities/helpers';
import type { Research } from '../../../types';
import ResearchSidebar from './ResearchSidebar';

interface ResearchMainProps {
    slug: string;
}

// Memoized loading skeleton
const LoadingSkeleton = memo(() => (
    <FadeIn direction="up" duration={500} distance={100}>
        <div className="rounded-lg shadow-lg p-8 animate-pulse border-2 border-gray-400 bg-neutral-900 text-slate-50">
            <div className="space-y-6">
                <div className="h-10 w-3/4 rounded bg-slate-700" />
                <div className="h-5 w-48 rounded bg-slate-700" />
                <div className="h-20 w-full rounded bg-slate-700" />
                <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-slate-700" />
                    <div className="h-4 w-5/6 rounded bg-slate-700" />
                </div>
            </div>
        </div>
    </FadeIn>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized error component
const ErrorState = memo(({ error }: { error: string }) => (
    <FadeIn direction="up" duration={500} distance={100}>
        <div className="rounded-lg shadow-lg p-8 border-2 border-gray-400 bg-neutral-900 text-slate-50">
            <div className="text-center">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        </div>
    </FadeIn>
));

ErrorState.displayName = 'ErrorState';

// Memoized not found component
const NotFoundState = memo(() => (
    <FadeIn direction="up" duration={500} distance={100}>
        <div className="rounded-lg shadow-lg p-8 border-2 border-gray-400 bg-neutral-900 text-slate-50">
            <div className="text-center text-slate-300 text-lg">
                Research not found.
            </div>
        </div>
    </FadeIn>
));

NotFoundState.displayName = 'NotFoundState';

// Memoized metadata component
const ResearchMetadata = memo(
    ({ author, formattedDate }: { author?: string; formattedDate: string }) => (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-slate-300">
            {author && (
                <div className="flex items-center gap-1.5">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                    <span className="font-medium">{author}</span>
                </div>
            )}
            <div className="flex items-center gap-1.5">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <span>{formattedDate}</span>
            </div>
        </div>
    ),
);

ResearchMetadata.displayName = 'ResearchMetadata';

// Memoized keywords component
const Keywords = memo(({ tags }: { tags: string[] }) => (
    <div className="mt-2 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 mr-2">Keywords:</span>
            {tags.map((tag, idx) => (
                <span
                    key={idx}
                    className="px-3 py-1 text-purple-300 text-xs rounded-full border-2 border-purple-500"
                >
                    {tag}
                </span>
            ))}
        </div>
    </div>
));

Keywords.displayName = 'Keywords';

// Memoized references component
const References = memo(({ references }: { references: string[] }) => (
    <section className="py-6">
        <h2 className="text-3xl font-bold mb-4 text-slate-50">References</h2>
        <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm">
            {references.map((ref, idx) => (
                <li key={idx} className="pl-2">
                    <span className="pl-2">{ref}</span>
                </li>
            ))}
        </ol>
    </section>
));

References.displayName = 'References';

export function ResearchMain({ slug }: ResearchMainProps) {
    // states
    const [research, setResearch] = useState<Research | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // fetch via slug
    useEffect(() => {
        const fetchResearch = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    deepDive: Research;
                }>(`/research/${slug}`);
                setResearch(response.data.deepDive);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch research';
                setError(errorMessage);
                logError('ResearchMain error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        };
        fetchResearch();
    }, [slug]);

    // memoized formatted date
    const formattedDate = useMemo(
        () => (research ? formatDate(research.createdAt) : ''),
        [research],
    );

    // Consolidate all markdown content into one string
    const consolidatedMarkdown = useMemo(() => {
        if (!research) return '';

        const sections: string[] = [];

        if (research.introduction) {
            sections.push(`## Introduction\n\n${research.introduction}`);
        }

        if (research.method) {
            sections.push(`## Methods & Approach\n\n${research.method}`);
        }

        if (research.keyFindings) {
            sections.push(`## Key Findings\n\n${research.keyFindings}`);
        }

        if (research.content) {
            sections.push(`## Discussion & Analysis\n\n${research.content}`);
        }

        return sections.join('\n\n---\n\n');
    }, [research]);

    // loading state
    if (loading) {
        return <LoadingSkeleton />;
    }

    // error state
    if (error) {
        return <ErrorState error={error} />;
    }

    // not-found state
    if (!research) {
        return <NotFoundState />;
    }

    // default state
    return (
        <FadeIn direction="up" duration={700} distance={100}>
            <article className="paper rounded-lg shadow-lg border-2 border-gray-400 overflow-hidden bg-neutral-950/70 text-slate-50">
                {/* Inline CSS for the specific 770px behavior and sidebar shrink rules */}
                <style>{`
                    @media (max-width: 770px) {
                        .title-image-grid {
                            display: grid;
                            grid-template-columns: 1fr;
                            grid-template-rows: auto auto;
                            gap: 0.75rem;
                        }
                        .title-image-grid .featured-img {
                            order: -1;
                            width: 100% !important;
                            max-width: 420px;
                            margin-left: auto;
                            margin-right: auto;
                        }
                        .header-aside {
                            margin-top: 0.5rem;
                        }
                    }

                    @media (min-width: 771px) {
                        .title-image-grid {
                            display: grid;
                            grid-template-columns: 1fr auto;
                            align-items: center;
                            gap: 1rem;
                        }
                        .title-image-grid .featured-img {
                            width: 11rem;
                            height: 11rem;
                            min-width: 11rem;
                        }
                    }

                    @media (max-width: 770px) {
                        .header-sidebar {
                            flex: 0 1 16rem;
                            min-width: 120px;
                        }
                        .header-main {
                            min-width: 220px;
                        }
                    }

                    @media (min-width: 771px) {
                        .header-sidebar {
                            flex: 0 0 16rem;
                        }
                        .header-main {
                            min-width: 0;
                        }
                    }
                `}</style>

                {/* Header */}
                <div className="flex flex-col md:flex-row lg:flex-col border-b-2 border-gray-400">
                    <header className="flex-1 p-8 lg:p-12 md:border-r-2 md:border-gray-400 lg:border-r-0">
                        {/* Title + image (grid) */}
                        <div className="title-image-grid mb-4">
                            <h1 className="text-3xl lg:text-4xl font-bold leading-tight wrap-break-words">
                                {research.title}
                            </h1>

                            {research.featuredImage && (
                                <div className="featured-img rounded-lg border-2 border-gray-400 object-cover overflow-hidden">
                                    <img
                                        src={research.featuredImage}
                                        alt={research.title}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* meta + abstract + sidebar beside them(on touch devices) */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* left main column */}
                            <div className="header-main flex-1 flex flex-col min-h-0">
                                <ResearchMetadata
                                    author={research.author}
                                    formattedDate={formattedDate}
                                />

                                {research.abstract && (
                                    <div className="rounded-sm pl-4 mb-4 border-l-4 border-purple-600 bg-transparent">
                                        <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide text-slate-50">
                                            Abstract
                                        </h2>
                                        <p className="leading-relaxed text-sm text-slate-300">
                                            {research.abstract}
                                        </p>
                                    </div>
                                )}

                                {/* Keywords */}
                                {research.tags && research.tags.length > 0 && (
                                    <Keywords tags={research.tags} />
                                )}
                            </div>

                            {/* sidebar */}
                            <aside className="hidden md:block lg:hidden header-sidebar">
                                <div className="p-4">
                                    <ResearchSidebar
                                        slug={slug}
                                        showOnlyTop={true}
                                    />
                                </div>
                            </aside>
                        </div>

                        {/* bottom sidebar blocks */}
                        <div className="hidden md:block lg:hidden w-full mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <ResearchSidebar
                                    slug={slug}
                                    showOnlyBottom={true}
                                />
                            </div>
                        </div>
                    </header>
                </div>

                {/* mobile: full sidebar below header */}
                <div className="block md:hidden p-8 border-b-2 border-gray-400">
                    <ResearchSidebar slug={slug} />
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                    {/* Sidebar - ONLY visible desktop */}
                    <aside className="hidden lg:block p-8 lg:p-12 lg:relative lg:top-24">
                        <ResearchSidebar slug={slug} />
                    </aside>

                    {/* Content column - Single MarkdownRenderer */}
                    <main className="content p-8 lg:p-12 lg:order-first">
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <MarkdownRenderer
                                content={consolidatedMarkdown}
                                variant="preview"
                            />
                        </div>

                        {/* References */}
                        {research.references &&
                            research.references.length > 0 && (
                                <References references={research.references} />
                            )}
                    </main>
                </div>

                {/* Footer metadata */}
                <footer className="border-t-2 border-gray-400 p-6 lg:p-8 text-sm text-slate-300 flex flex-col lg:flex-row justify-between gap-3">
                    <div>
                        <div className="font-medium">
                            {research.author ?? 'Unknown author'}
                        </div>
                        <div className="text-xs">
                            © {new Date(research.createdAt).getFullYear()}
                        </div>
                    </div>
                    <div className="text-xs">
                        <div>Published: {formattedDate}</div>
                    </div>
                </footer>
            </article>
        </FadeIn>
    );
}
