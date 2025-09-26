import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Research } from '../../types/';

//TEST

interface NewestResearchProps {
    apiUrl?: string;
    className?: string;
    showAuthor?: boolean;
    imageHeight?: string;
    autoFetch?: boolean;
}

export function NewestResearch({
    apiUrl = '/research/newest',
    className = '',
    showAuthor = true,
    imageHeight = 'h-64',
    autoFetch = true,
}: NewestResearchProps) {
    const [research, setResearch] = useState<Research | null>(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchNewestResearch = useCallback(
        async (url: string = apiUrl) => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get(url);
                const data: Research[] = response.data.research; 

                const firstItem: Research | null = data.length > 0 ? data[0] : null;
                setResearch(firstItem);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch research';
                setError(message);
                logError('NewestResearch error:', message, err);
            } finally {
                setLoading(false);
            }
        },
        [apiUrl],
    );

    useEffect(() => {
        if (autoFetch) fetchNewestResearch();
    }, [autoFetch, fetchNewestResearch]);

    const handleReadMore = () => {
        if (research) navigate(`/research/${research.slug}`);
    };

    const handleRetry = () => fetchNewestResearch();

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className={`bg-gray-200 ${imageHeight} rounded-lg mb-4`} />
                <div className="bg-gray-200 h-6 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-4" />
                <div className="bg-gray-200 h-10 rounded w-32" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
                <p className="text-red-800 mb-2">Failed to load research</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button onClick={handleRetry} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
                    Try Again
                </button>
            </div>
        );
    }

    if (!research) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
                <p className="text-gray-600 mb-3">No research available</p>
                <button onClick={handleRetry} className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <article
            className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
        >
            {research.featuredImage && (
                <div className={`relative ${imageHeight} overflow-hidden rounded-t-lg`}>
                    <img
                        src={research.featuredImage}
                        alt={research.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer" onClick={handleReadMore}>
                    {research.title}
                </h1>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                    {showAuthor && research.author && <span className="mr-4">By {research.author}</span>}
                    <time dateTime={research.createdAt}>
                        {new Date(research.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                </div>

                {research.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {research.tags.slice(0, 4).map((t, i) => (
                            <span key={i} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                #{t}
                            </span>
                        ))}
                        {research.tags.length > 4 && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                +{research.tags.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {research.abstract && <p className="text-gray-700 leading-relaxed mb-6 line-clamp-3">{research.abstract}</p>}

                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={handleReadMore}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                        >
                            Read Research
                        </button>

                        {research.pdfAttachment && (
                            <a
                                href={research.pdfAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg inline-flex items-center"
                            >
                                View PDF
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </a>
                        )}
                    </div>

                    <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-800">Research</span>
                </div>
            </div>
        </article>
    );
}
