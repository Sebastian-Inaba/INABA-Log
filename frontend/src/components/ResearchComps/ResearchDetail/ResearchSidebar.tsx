// src/components/ResearchComps/ResearchDetail/ResearchSidebar.tsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../../utilities/api';
import { error as logError } from '../../../utilities/logger';
import type { Research } from '../../../types';

interface ResearchSidebarProps {
    slug: string;
    showOnlyTop?: boolean; // Flag to show only the top section
    showOnlyBottom?: boolean; // Flag to show only the bottom section
}

export default function ResearchSidebar({
    slug,
    showOnlyTop = false,
    showOnlyBottom = false,
}: ResearchSidebarProps) {
    // State management
    const [research, setResearch] = useState<Research | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    // Fetch research with slug
    useEffect(() => {
        const fetchResearch = async () => {
            try {
                setLoading(true);
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
                logError('ResearchSidebar error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        };
        fetchResearch();
    }, [slug]);

    /**
     * Handles copying the current page URL to clipboard
     * Shows temporary feedback when copied
     */
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied('link');
        setTimeout(() => setCopied(null), 2000);
    };

    /**
     * Handles copying formatted citation to clipboard
     * Uses pattern: "Author. (Year). Title."
     * Shows temporary feedback when copied
     */
    const handleCopyCitation = () => {
        if (!research) return;
        // Format citation: Author. (Year). Title.
        const citation = `${research.author ? `${research.author}. ` : ''}(${new Date(research.createdAt).getFullYear()}). ${research.title}.`;
        navigator.clipboard.writeText(citation);
        setCopied('citation');
        setTimeout(() => setCopied(null), 2000);
    };

    // CSS class constants for consistent styling
    const baseCard =
        'rounded-lg shadow-lg p-5 border-2 border-gray-400 bg-neutral-900 text-slate-50';
    const buttonBase =
        'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors border-2 border-gray-400 cursor-pointer';

    // Loading state
    if (loading) {
        return (
            <div className="space-y-4">
                {!showOnlyBottom && (
                    <div className={`${baseCard} animate-pulse`} />
                )}
                {!showOnlyBottom && (
                    <div className={`${baseCard} animate-pulse`} />
                )}
                {!showOnlyTop && (
                    <div className={`${baseCard} animate-pulse`} />
                )}
                {!showOnlyTop && (
                    <div className={`${baseCard} animate-pulse`} />
                )}
            </div>
        );
    }

    // Return null if no research data
    if (!research) return null;

    // Show only top section when showOnlyTop prop is true
    if (showOnlyTop) {
        return (
            <div className="space-y-4">
                {/* PDF Access Card */}
                <div className={`${baseCard}`}>
                    <div className="flex items-center gap-2 mb-3">
                        {/* PDF Icon */}
                        <svg
                            className="w-5 h-5 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="text-base font-bold">
                            Full Research Paper
                        </h3>
                    </div>

                    {/* PDF Attachment Availability */}
                    {research.pdfAttachment ? (
                        <>
                            <p className="text-xs mb-3 text-slate-300">
                                Access the complete research document
                            </p>
                            <div className="flex gap-2">
                                {/* View PDF Button */}
                                <a
                                    href={research.pdfAttachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${buttonBase} text-purple-300 hover:bg-purple-950/20`}
                                    aria-label="View research PDF"
                                >
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
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    View
                                </a>

                                {/* Download PDF Button */}
                                <a
                                    href={research.pdfAttachment}
                                    download
                                    className={`${buttonBase} text-purple-300 hover:bg-purple-950/20`}
                                    aria-label="Download research PDF"
                                >
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
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Download
                                </a>
                            </div>
                        </>
                    ) : (
                        // Fallback when no PDF available
                        <p className="text-xs italic text-slate-400">
                            PDF not available for this research
                        </p>
                    )}
                </div>

                {/* Quick Details Card */}
                <div className={baseCard}>
                    <h3 className="text-base font-bold mb-3">Details</h3>
                    <div className="space-y-2.5 text-sm">
                        {/* Author Information */}
                        {research.author && (
                            <div>
                                <span className="text-slate-400 block mb-0.5">
                                    Author
                                </span>
                                <span className="font-medium">
                                    {research.author}
                                </span>
                            </div>
                        )}
                        {/* Publication Date */}
                        <div>
                            <span className="text-slate-400 block mb-0.5">
                                Published
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    research.createdAt,
                                ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Credibility Indicator Card */}
                {research.credibility && (
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg shadow-lg p-5 border-2 border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2 mb-2">
                            {/* Checkmark Icon */}
                            <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h3 className="text-base font-bold text-green-900 dark:text-green-100">
                                Credibility
                            </h3>
                        </div>
                        <p className="text-xs text-green-800 dark:text-green-200">
                            {research.credibility}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Show only bottom section when showOnlyBottom prop is true
    if (showOnlyBottom) {
        return (
            <>
                {/* Citation Card */}
                <div className={baseCard}>
                    <h3 className="text-base font-bold mb-3">Cite This Work</h3>
                    {/* Citation Preview */}
                    <div className="rounded p-3 border-2 border-gray-400 mb-3">
                        <p className="text-xs font-mono wrap-break-words leading-relaxed text-slate-50">
                            {research.author ? `${research.author}. ` : ''}(
                            {new Date(research.createdAt).getFullYear()}).{' '}
                            {research.title}.
                        </p>
                    </div>

                    {/* Copy Citation Button */}
                    <button
                        onClick={handleCopyCitation}
                        className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-neutral-800 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-2 border-gray-400 cursor-pointer"
                        aria-label="Copy citation"
                    >
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
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                        </svg>
                        {/* Dynamic button text based on copy state */}
                        {copied === 'citation' ? 'Copied!' : 'Copy Citation'}
                    </button>
                </div>

                {/* Share Card */}
                <div className={baseCard}>
                    <h3 className="text-base font-bold mb-3">Share</h3>
                    {/* Current URL Display */}
                    <div className="rounded p-3 border-2 border-gray-400 mb-3">
                        <p className="text-xs font-mono wrap-break-words leading-relaxed text-slate-300 overflow-x-auto">
                            {window.location.href}
                        </p>
                    </div>
                    {/* Copy Link Button */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-2 border-gray-400 bg-transparent cursor-pointer hover:bg-neutral-800"
                    >
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
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                        </svg>
                        {/* Dynamic button text based on copy state */}
                        {copied === 'link' ? 'Link Copied!' : 'Copy Link'}
                    </button>
                </div>
            </>
        );
    }

    // Default state
    return (
        <div className="space-y-4">
            {/* Top Section: PDF, Details, Credibility */}
            <div className="space-y-4">
                {/* PDF Access Card */}
                <div className={`${baseCard}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <svg
                            className="w-5 h-5 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="text-base font-bold">
                            Full Research Paper
                        </h3>
                    </div>

                    {research.pdfAttachment ? (
                        <>
                            <p className="text-xs mb-3 text-slate-300">
                                Access the complete research document
                            </p>
                            <div className="flex gap-2">
                                <a
                                    href={research.pdfAttachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${buttonBase} text-purple-300 hover:bg-purple-950/20`}
                                    aria-label="View research PDF"
                                >
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
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    View
                                </a>

                                <a
                                    href={research.pdfAttachment}
                                    download
                                    className={`${buttonBase} text-purple-300 hover:bg-purple-950/20`}
                                    aria-label="Download research PDF"
                                >
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
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Download
                                </a>
                            </div>
                        </>
                    ) : (
                        <p className="text-xs italic text-slate-400">
                            PDF not available for this research
                        </p>
                    )}
                </div>

                {/* Quick Details Card */}
                <div className={baseCard}>
                    <h3 className="text-base font-bold mb-3">Details</h3>
                    <div className="space-y-2.5 text-sm">
                        {research.author && (
                            <div>
                                <span className="text-slate-400 block mb-0.5">
                                    Author
                                </span>
                                <span className="font-medium">
                                    {research.author}
                                </span>
                            </div>
                        )}
                        <div>
                            <span className="text-slate-400 block mb-0.5">
                                Published
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    research.createdAt,
                                ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Credibility Indicator Card */}
                {research.credibility && (
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg shadow-lg p-5 border-2 border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2 mb-2">
                            <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h3 className="text-base font-bold text-green-900 dark:text-green-100">
                                Credibility
                            </h3>
                        </div>
                        <p className="text-xs text-green-800 dark:text-green-200">
                            {research.credibility}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Section: Citation and Share */}
            <div className="space-y-4">
                {/* Citation Card */}
                <div className={baseCard}>
                    <h3 className="text-base font-bold mb-3">Cite This Work</h3>
                    <div className="rounded p-3 border-2 border-gray-400 mb-3">
                        <p className="text-xs font-mono wrap-break-words leading-relaxed text-slate-50">
                            {research.author ? `${research.author}. ` : ''}(
                            {new Date(research.createdAt).getFullYear()}).{' '}
                            {research.title}.
                        </p>
                    </div>

                    <button
                        onClick={handleCopyCitation}
                        className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-neutral-800 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-2 border-gray-400 cursor-pointer"
                        aria-label="Copy citation"
                    >
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
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                        </svg>
                        {copied === 'citation' ? 'Copied!' : 'Copy Citation'}
                    </button>
                </div>

                {/* Share Card */}
                <div className={baseCard}>
                    <h3 className="text-base font-bold mb-3">Share</h3>
                    <div className="rounded p-3 border-2 border-gray-400 mb-3">
                        <p className="text-xs font-mono wrap-break-words leading-relaxed text-slate-300 overflow-x-auto">
                            {window.location.href}
                        </p>
                    </div>
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-2 border-gray-400 bg-transparent cursor-pointer hover:bg-neutral-800"
                    >
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
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                        </svg>
                        {copied === 'link' ? 'Link Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
