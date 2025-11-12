// src/components/HomeComps/NewPost.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utilities/api';
import { error as logError } from '../../utilities/logger';
import type { Post } from '../../types/';
import { OtherIcons } from '../../assets/icons/icons';
import PlaceholderImageSvg from '../../assets/icons/PlaceholderImage/PlaceHolderImageNoStars.svg';

interface NewestPostProps {
    apiUrl?: string;
    className?: string;
    autoFetch?: boolean;
}

export function NewestPost({
    apiUrl = '/posts/newest',
    className = '',
    autoFetch = true,
}: NewestPostProps) {
    // Component state
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Fetch handler
    const handleFetchNewestPost = useCallback(
        async (url: string = apiUrl) => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    post: Post;
                }>(url);
                setPost(response.data.post);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch post';
                setError(errorMessage);
                logError('NewestPost component error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        },
        [apiUrl],
    );

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) handleFetchNewestPost();
    }, [autoFetch, handleFetchNewestPost]);

    // Redirect handler
    const handleReadMore = (slug: string) => {
        if (!slug) return;
        navigate(`/post/${slug}`);
    };

    // Retry handler
    const handleRetry = () => handleFetchNewestPost();

    // Error state
    if (error) {
        return (
            <div
                className={`rounded-lg text-center bg-transparent border border-gray-700 p-8 ${className}`}
                role="alert"
                aria-live="polite"
            >
                <p className="text-gray-300 mb-2 text-sm sm:text-base md:text-lg leading-relaxed tracking-wide">
                    Something went wrong getting the latest post.
                </p>
                <button
                    onClick={handleRetry}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg mt-2 text-sm sm:text-base"
                    aria-label="Retry fetching newest post"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div
                className={`rounded-lg text-center bg-transparent border border-gray-700 p-8 ${className}`}
                role="status"
                aria-live="polite"
                aria-label="Loading newest post"
            >
                <div className="animate-pulse space-y-4">
                    <div className="h-6 sm:h-8 w-1/2 mx-auto rounded bg-gray-700 mb-4" />
                    <div className="h-48 sm:h-64 w-full rounded bg-gray-800 mb-4" />
                    <div className="h-4 sm:h-6 w-3/4 mx-auto rounded bg-gray-700 mb-2" />
                    <div className="h-3 sm:h-4 w-1/2 mx-auto rounded bg-gray-700 mb-2" />
                    <div className="h-8 sm:h-10 w-32 mx-auto rounded bg-gray-700" />
                </div>
            </div>
        );
    }

    // Empty state
    if (!post) {
        return (
            <div
                className={`bg-gray-50 border border-gray-200 rounded-lg text-center p-8 ${className}`}
                role="status"
                aria-live="polite"
            >
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed tracking-wide">
                    No posts available
                </p>
                <button
                    onClick={handleRetry}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                    aria-label="Refresh to check for posts"
                >
                    Refresh
                </button>
            </div>
        );
    }

    // Default state
    return (
        <>
            {/* Component styles */}
            <style>{`
                .newpost-container * { 
                    box-sizing: border-box; 
                    margin: 0; 
                    padding: 0; 
                }
                .newpost-container { 
                    width: 100%; 
                }

                /* SVG filter definitions - hidden from layout */
                .newpost-container svg[aria-hidden="true"] { 
                    position: fixed; 
                    width: 0; 
                    height: 0; 
                    left: 0; 
                    top: 0; 
                }

                /* Main wrapper with overflow hidden */
                .newpost-container .post-wrapper {
                    position: relative;
                    overflow: hidden;
                    margin: 0 auto;
                    width: 100%;
                    height: 100%;
                }

                /* Grid-based layering system */
                .newpost-container .post-wrapper,
                .newpost-container .layer, 
                .newpost-container .rect { 
                    display: grid; 
                }

                .newpost-container .layer {
                    grid-area: 1/1/span 2;
                    position: relative;
                }

                .newpost-container .layer .rect { 
                    grid-area: 1/1/span 2; 
                }

                /* Content grid: 2 columns on mobile (no arrow), 3 columns on desktop */
                .newpost-container .wrap {
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-rows: auto auto 1fr auto auto;
                    align-items: start;
                    row-gap: 0;
                    min-width: 0;
                    border: 1px solid transparent;
                }

                .newpost-container .wrap > span {
                    display: inline-grid;
                    text-align: left;
                    color: #252525;
                    min-width: 0;
                }

                /* Gap maker - spacing and transitions */
                .newpost-container .gapMaker {
                    border-radius: 10px;
                    padding: 0.6em;
                    width: 100%;
                    height: 100%;
                    display: grid;
                    place-items: center;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                /* Badge positioning - top right */
                .newpost-container .wrap > span:nth-child(1) {
                    grid-row: 1;
                    justify-self: end;
                    align-self: start;
                    padding: 0 0 8px 8px;
                }

                @media (max-width: 640px) {
                    .newpost-container .wrap > span:nth-child(1) {
                        grid-column: 2;
                    }
                }

                @media (min-width: 641px) {
                    .newpost-container .wrap > span:nth-child(1) {
                        grid-column: 3;
                    }
                }

                /* Badge width - fit content */
                .newpost-container .wrap > span:nth-child(1) .gapMaker {
                    width: fit-content;
                    min-width: fit-content;
                }

                /* Title positioning */
                .newpost-container .wrap > span:nth-child(2) {
                    grid-row: 4;
                    justify-self: start;
                    align-self: end;
                }

                /* Mobile: title spans full width */
                @media (max-width: 640px) {
                    .newpost-container .wrap > span:nth-child(2) {
                        grid-column: 1 / span 2;
                    }
                }

                /* Desktop: title in first column with right padding */
                @media (min-width: 641px) {
                    .newpost-container .wrap > span:nth-child(2) {
                        grid-column: 1;
                        padding: 8px 8px 0 0;
                    }
                }

                /* Description positioning */
                .newpost-container .wrap > span:nth-child(3) {
                    grid-row: 5;
                    justify-self: start;
                    align-self: stretch;
                    height: 100%;
                }

                /* Mobile: description spans full width */
                @media (max-width: 640px) {
                    .newpost-container .wrap > span:nth-child(3) {
                        grid-column: 1 / span 2;
                        padding: 8px 8px 0 0;
                    }
                }

                /* Desktop: description in first column with right padding */
                @media (min-width: 641px) {
                    .newpost-container .wrap > span:nth-child(3) {
                        grid-column: 1;
                        padding: 8px 8px 0 0;
                    }
                }

                /* Description text styling */
                .newpost-container .description {
                    max-width: 30em;
                    line-height: 1.4;
                    width: 100%;
                    min-width: 0;
                    white-space: normal;
                    overflow: visible;
                    text-overflow: clip;
                    overflow-wrap: anywhere;
                    font-size: 0.875rem;
                }

                @media (min-width: 1280px) {
                    .newpost-container .description {
                        font-size: 1rem;
                    }
                }

                /* Remove max-width on mobile for full width */
                @media (max-width: 640px) {
                    .newpost-container .description {
                        max-width: none;
                    }
                }

                /* Arrow button - hide on mobile, show on desktop */
                .newpost-container .wrap > span:nth-child(4) {
                    grid-column: 3;
                    grid-row: 5;
                    justify-self: end;
                    align-self: end;
                    width: 3.5rem;
                    height: 3.5rem;
                    transition: transform 0.3s ease;
                    min-width: 0;
                    padding: 8px;
                }

                @media (max-width: 640px) {
                    .newpost-container .wrap > span:nth-child(4) {
                        display: none;
                    }
                }

                /* Arrow hover animation */
                .newpost-container:hover .wrap > span:nth-child(4) {
                    transform: scale(1.04);
                }

                .newpost-container .wrap > span:nth-child(4) .gapMaker {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }

                /* Background image layer with blur effect */
                .newpost-container .image-layer { 
                    filter: url(#extr);
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }
                
                /* Hover and touch active animations */
                .newpost-container:hover .image-layer,
                .newpost-container.touch-active .image-layer { 
                    transform: scale(1.01); 
                }

                /* Background image styling */
                .newpost-container .image-layer::before {
                    position: absolute; 
                    inset: 0; 
                    z-index: -1; 
                    opacity: 0.5;
                    background: url(${post.featuredImage || PlaceholderImageSvg}) 50%/cover content-box no-repeat;
                    content: "";
                }
                
                /* Border blur effect */
                .newpost-container .image-layer .rect { 
                    outline: solid 1em #000; 
                    filter: url(#rond); 
                }
                
                .newpost-container .image-layer span:not([class]) { 
                    background: #9162CB; 
                }

                /* Content layer - prevent background clicks */
                .newpost-container .content-layer {
                    pointer-events: none;
                }
                
                /* Enable clicks on interactive elements */
                .newpost-container .content-layer .gapMaker {
                    pointer-events: auto;
                }

                /* Title wrapper - full width */
                .newpost-container .title-wrapper {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                }

                /* Title underline hover animation */
                .newpost-container .title-underline {
                    position: absolute;
                    left: 0;
                    bottom: -2px;
                    height: 2px;
                    width: 100%;
                    background: #9162CB;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                }

                /* Show underline on hover and touch */
                .newpost-container:hover .content-layer .wrap > span:nth-child(2) .title-underline,
                .newpost-container.touch-active .content-layer .wrap > span:nth-child(2) .title-underline {
                    transform: scaleX(1);
                }
                
                /* Color transitions - default state */
                .newpost-container .content-layer .gapMaker {
                    color: #0A1F44;
                }
                
                /* Color transitions - hover and touch states */
                .newpost-container:hover .content-layer .gapMaker,
                .newpost-container.touch-active .content-layer .gapMaker {
                    color: #ffffff;
                }
                
                .newpost-container:hover .content-layer .collection,
                .newpost-container.touch-active .content-layer .collection {
                    background-color: rgba(10, 10, 10, 0.6);
                }
                
                .newpost-container:hover .content-layer .wrap > span:nth-child(4) .gapMaker,
                .newpost-container.touch-active .content-layer .wrap > span:nth-child(4) .gapMaker {
                    background-color: rgba(10, 10, 10, 0.6);
                }

                /* Badge styling */
                .newpost-container .badge {
                    font-size: 0.625rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 0.25em 0.75em;
                    white-space: nowrap;
                    display: inline-block;
                    width: fit-content;
                }

                @media (min-width: 1280px) {
                    .newpost-container .badge {
                        font-size: 0.75rem;
                    }
                }

                /* Responsive title sizes */
                .newpost-container .title-wrapper {
                    font-size: 1rem;
                }

                @media (min-width: 1280px) {
                    .newpost-container .title-wrapper {
                        font-size: 1.5rem;
                    }
                }

                @media (min-width: 1024px) {
                    .newpost-container .title-wrapper {
                        font-size: 1.75rem;
                    }
                }

                /* Touch devices: always show hover effects */
                @media (hover: none) and (pointer: coarse) {                  
                    .newpost-container .content-layer .gapMaker {
                        color: #ffffff;
                    }
                    
                    .newpost-container .content-layer .collection {
                        background-color: rgba(10, 10, 10, 0.6);
                    }
                    
                    .newpost-container .content-layer .wrap > span:nth-child(4) .gapMaker {
                        background-color: rgba(10, 10, 10, 0.6);
                    }
                    
                    .newpost-container .content-layer .wrap > span:nth-child(2) .title-underline {
                        transform: scaleX(1);
                    }
                }
                    @media (max-width: 1280px) {
  .newpost-container {
    min-height: 500px; 
  }
                       @media (max-width: 1024px) {
  .newpost-container {
    min-height: 400px; 
  }
}

            `}</style>

            <article
                className={`newpost-container ${className} border border-[#9162CB] p-2 rounded-2xl`}
                aria-label={`Newest post: ${post.title}`}
            >
                {/* SVG filters for visual effects */}
                <svg
                    aria-hidden="true"
                    width="0"
                    height="0"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Rounded blur filter */}
                    <filter id="rond" colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                        <feComponentTransfer>
                            <feFuncA type="table" tableValues="-1 10" />
                        </feComponentTransfer>
                        <feColorMatrix
                            type="matrix"
                            values="
                            0 0 0 0 0.569
                            0 0 0 0 0.384
                            0 0 0 0 0.796
                            0 0 0 1 0"
                        />
                    </filter>

                    {/* Extract filter */}
                    <filter id="extr">
                        <feComponentTransfer result="image">
                            <feFuncA type="table" tableValues="0 1 0" />
                        </feComponentTransfer>
                    </filter>
                </svg>

                <div className="post-wrapper">
                    {/* Background image layer */}
                    <div
                        className="layer image-layer"
                        onClick={() => handleReadMore(post.slug)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Read more about ${post.title}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleReadMore(post.slug);
                            }
                        }}
                    >
                        <div className="rect">
                            <div className="wrap">
                                {/* Badge */}
                                <span>
                                    <span className="gapMaker badge collection border-2">
                                        New Post
                                    </span>
                                </span>

                                {/* Title */}
                                <span>
                                    <span className="gapMaker collection border-2">
                                        <span
                                            className="title-wrapper cursor-pointer"
                                            onClick={() =>
                                                handleReadMore(post.slug)
                                            }
                                        >
                                            <h2>{post.title}</h2>
                                            <span className="title-underline" />
                                        </span>
                                    </span>
                                </span>

                                {/* Description */}
                                <span>
                                    <span
                                        className="cursor-pointer description collection gapMaker border-2"
                                        onClick={() =>
                                            handleReadMore(post.slug)
                                        }
                                    >
                                        <p className="line-clamp-5">
                                            {post.description}
                                        </p>
                                    </span>
                                </span>

                                {/* Arrow icon */}
                                <span>
                                    <span
                                        className="gapMaker border-2"
                                        onClick={() =>
                                            handleReadMore(post.slug)
                                        }
                                    >
                                        <OtherIcons.LongArrow className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Foreground content layer */}
                    <div className="layer content-layer" aria-hidden="true">
                        <div className="rect">
                            <div className="wrap">
                                {/* Badge */}
                                <span>
                                    <span className="gapMaker badge collection border-2 border-[#9162CB] bg-[#9162CB]">
                                        New Post
                                    </span>
                                </span>

                                {/* Title */}
                                <span>
                                    <span className="gapMaker collection border-2 border-[#9162CB] bg-[#9162CB]">
                                        <span
                                            className="title-wrapper cursor-pointer"
                                            onClick={() =>
                                                handleReadMore(post.slug)
                                            }
                                        >
                                            <h2>{post.title}</h2>
                                            <span className="title-underline" />
                                        </span>
                                    </span>
                                </span>

                                {/* Description */}
                                <span>
                                    <span
                                        className="cursor-pointer description collection gapMaker border-2 border-[#9162CB] bg-[#9162CB]"
                                        onClick={() =>
                                            handleReadMore(post.slug)
                                        }
                                    >
                                        <p className="line-clamp-5">
                                            {post.description}
                                        </p>
                                    </span>
                                </span>

                                {/* Arrow icon */}
                                <span>
                                    <span
                                        className="gapMaker border-2 border-[#9162CB] bg-[#9162CB] cursor-pointer"
                                        onClick={() =>
                                            handleReadMore(post.slug)
                                        }
                                    >
                                        <OtherIcons.LongArrow className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}
