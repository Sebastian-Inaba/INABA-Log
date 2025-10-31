// src/components/PostComps/PostDetail/PostHeader.tsx
import { useEffect, useState, useMemo } from 'react';
import { FadeIn } from '../../AnimationComps/FadeIn';
import { apiClient } from '../../../utilities/api';
import { error as logError } from '../../../utilities/logger';
import type { Post } from '../../../types';

// color options for tag
const COLOR_OPTIONS = [
    'text-yellow-300',
    'text-green-300',
    'text-blue-300',
    'text-pink-300',
    'text-red-300',
];

interface PostHeaderProps {
    slug: string;
}

/**
 * TagList - responsive tag list
 *
 * - Defaults to shrink-to-content (inline-flex) so container only uses needed width.
 * - Pass `fullWidth` to force `w-full` behavior.
 */
interface TagListProps {
    tags: string[];
    tagColorMap: string[]; // colors corresponding to tags (may be shorter)
    maxVisible?: number;
    className?: string;
    fullWidth?: boolean; // default false -> shrink-to-content
}
function TagList({
    tags,
    tagColorMap,
    maxVisible = 5,
    className = '',
    fullWidth = false,
}: TagListProps) {
    const visible = tags.slice(0, maxVisible);

    const containerClass = [
        fullWidth ? 'w-full min-w-0 flex' : 'inline-flex',
        'flex-wrap',
        'items-center',
        'gap-2',
        'rounded-lg',
        'bg-neutral-900',
        'p-2 md:p-3',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={containerClass}>
            {visible.map((tag, idx) => {
                const textColor = tagColorMap[idx] ?? 'text-white';
                const bgColor = textColor.replace(/^text-/, 'bg-') + '/30';
                return (
                    <div key={idx} className="flex items-center">
                        <span
                            className={`inline-block px-3 py-1 md:px-4 rounded-full ${bgColor} ${textColor} text-sm truncate max-w-[200px] max-[425px]:px-2 max-[425px]:mx-1`}
                            title={tag}
                        >
                            {tag}
                        </span>

                        {idx !== visible.length - 1 && (
                            <span className="mx-2 text-white max-[425px]:mx-0">
                                |
                            </span>
                        )}
                    </div>
                );
            })}

            {tags.length > maxVisible && (
                <span className="ml-2 px-2 py-1 rounded-full bg-white/20 text-white text-sm max-[425px]:p-0 max-[425px]:m-0">
                    +{tags.length - maxVisible} more
                </span>
            )}
        </div>
    );
}

export function PostHeader({ slug }: PostHeaderProps) {
    // fetched post
    const [post, setPost] = useState<Post | null>(null);
    // loading / error state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // whether we have a featured image (controls which layout to render)
    const hasImage = Boolean(post?.featuredImage);

    // fetch the post when slug changes
    useEffect(() => {
        const handleFetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get<{
                    success: boolean;
                    post: Post;
                }>(`/posts/${slug}`);
                setPost(response.data.post);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch post';
                setError(errorMessage);
                logError('PostHeader error:', errorMessage, err);
            } finally {
                setLoading(false);
            }
        };
        handleFetchPost();
    }, [slug]);

    // formatted date for display
    const formattedDate = post
        ? new Date(post.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';

    // generate up to 5 tag colors (random selection per render)
    const tagColorMap = useMemo(() => {
        if (!post?.tags) return [];
        const availableColors = [...COLOR_OPTIONS];
        return post.tags.slice(0, 5).map(() => {
            if (availableColors.length === 0)
                availableColors.push(...COLOR_OPTIONS);
            const randomIndex = Math.floor(
                Math.random() * availableColors.length,
            );
            return availableColors.splice(randomIndex, 1)[0];
        });
    }, [post]);

    // Loading state
    if (loading) {
        return (
            <FadeIn direction="up" duration={500} distance={100}>
                <section className="rounded-2xl animate-pulse px-4">
                    <div className="flex justify-center items-center w-full">
                        <div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl">
                            <div className="w-full md:w-28rem h-72 md:h-28rem bg-purple-200" />
                            <div className="flex-1 space-y-4 max-w-xl">
                                <div className="h-10 w-3/4 bg-purple-200" />
                                <div className="h-6 w-1/2 bg-purple-300" />
                                <div className="h-6 w-2/3 bg-purple-200" />
                                <div className="h-4 w-1/3 bg-purple-300" />
                            </div>
                        </div>
                    </div>
                </section>
            </FadeIn>
        );
    }

    // Error state
    if (error) {
        return (
            <FadeIn direction="up" duration={500} distance={100}>
                <section className="p-6 md:p-10">
                    <div className="flex justify-center items-center w-full">
                        <div className="text-center w-full max-w-6xl">
                            <p className="text-red-500 text-lg mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </section>
            </FadeIn>
        );
    }

    // Not found state
    if (!post) {
        return (
            <FadeIn direction="up" duration={500} distance={100}>
                <section className="p-6 md:p-10">
                    <div className="flex justify-center items-center w-full">
                        <div className="text-center text-gray-500 text-lg w-full max-w-6xl">
                            Post not found.
                        </div>
                    </div>
                </section>
            </FadeIn>
        );
    }

    // Helper to avoid SSR crash when reading window
    const isLargeViewport =
        typeof window !== 'undefined' ? window.innerWidth > 1440 : false;

    // Default Post Detail render
    return (
        <FadeIn direction="up" duration={800} distance={100}>
            <section className="w-full mt-[60px]">
                <div className="w-full">
                    {hasImage ? (
                        <>
                            {/* MOBILE/TABLET: Stacked layout (< 1024px) */}
                            <div className="lg:hidden">
                                {/* Image*/}
                                <div className="w-full h-64 md:h-80 overflow-hidden flex items-center justify-center bg-[#9162CB]">
                                    <FadeIn
                                        direction="up"
                                        duration={700}
                                        distance={0}
                                        delay={200}
                                    >
                                        <img
                                            src={
                                                post.featuredImage ?? undefined
                                            }
                                            alt={post.title}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </FadeIn>
                                </div>

                                {/* Content */}
                                <div className="bg-[#9162CB] p-6 md:p-8">
                                    {/* Title & Category */}
                                    <FadeIn
                                        direction="up"
                                        duration={700}
                                        distance={50}
                                        delay={400}
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-start sm:justify-between gap-4 mb-4">
                                            <h1 className="text-3xl md:text-4xl text-gray-900">
                                                {post.title}
                                            </h1>

                                            {post.category && (
                                                <span className="inline-flex flex-none self-start items-center rounded-4xl border border-neutral-900 px-3 py-1 text-base md:text-lg text-gray-900 whitespace-nowrap">
                                                    {post.category}
                                                </span>
                                            )}
                                        </div>
                                    </FadeIn>

                                    {/* Tags - LEFT aligned for image layout */}
                                    {post.tags?.length > 0 && (
                                        <FadeIn
                                            direction="up"
                                            duration={700}
                                            distance={50}
                                            delay={600}
                                        >
                                            <div className="mb-4 flex justify-start">
                                                <TagList
                                                    tags={post.tags}
                                                    tagColorMap={tagColorMap}
                                                />
                                            </div>
                                        </FadeIn>
                                    )}

                                    {/* Description */}
                                    {post.description && (
                                        <FadeIn
                                            direction="up"
                                            duration={700}
                                            distance={50}
                                            delay={800}
                                        >
                                            <p className="text-lg md:text-xl text-gray-900 mb-6">
                                                {post.description}
                                            </p>
                                        </FadeIn>
                                    )}

                                    {/* Author & Date */}
                                    <FadeIn
                                        direction="up"
                                        duration={700}
                                        distance={0}
                                        delay={1100}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-base md:text-lg text-gray-900 pt-4 border-t border-gray-900/20">
                                            <span className="truncate">
                                                {post.author || ''}
                                            </span>
                                            <span className="truncate">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </FadeIn>
                                </div>
                            </div>

                            {/* DESKTOP: Original grid layout (>= 1024px) */}
                            <div
                                className="hidden lg:grid w-full "
                                style={{
                                    gridTemplateColumns: isLargeViewport
                                        ? 'auto minmax(280px,640px) minmax(auto,800px) auto'
                                        : '0px minmax(280px,640px) minmax(auto,800px) auto',
                                    gridTemplateRows: '100px auto 36px 72px',
                                    alignItems: 'stretch',
                                    gridTemplateAreas: `
                                        "emptyTop imageColumn emptyTopRight emptyTopFar"
                                        "purpleLeft imageColumn mainContent purpleRight"
                                        "purpleLeft imageColumn authorArea emptyRight"
                                        "emptyBottom imageColumn emptyBottomRight emptyBottomFar"
                                    `,
                                }}
                            >
                                <div
                                    style={{ gridArea: 'emptyTop' }}
                                    className="bg-transparent"
                                />
                                {/* Image*/}
                                <div
                                    style={{ gridArea: 'imageColumn' }}
                                    className="flex justify-center items-center"
                                >
                                    <div className="bg-[#9162CB] w-full h-full">
                                        <FadeIn
                                            direction="up"
                                            duration={700}
                                            distance={0}
                                            delay={200}
                                            className="bg-[#9162CB] p-5 w-full h-full flex justify-center items-center"
                                        >
                                            <img
                                                src={
                                                    post.featuredImage ??
                                                    undefined
                                                }
                                                alt={post.title}
                                                className="w-full h-full max-w-full max-h-38rem object-cover object-center block"
                                            />
                                        </FadeIn>
                                    </div>
                                </div>

                                <div
                                    style={{ gridArea: 'emptyTopRight' }}
                                    className="bg-transparent"
                                />
                                <div
                                    style={{ gridArea: 'emptyTopFar' }}
                                    className="bg-transparent"
                                />
                                <div
                                    style={{ gridArea: 'purpleLeft' }}
                                    className="bg-[#9162CB]"
                                />

                                <div
                                    style={{ gridArea: 'mainContent' }}
                                    className="flex flex-col justify-start w-full h-full bg-[#9162CB]"
                                >
                                    {/* Content */}
                                    <div className="flex items-center justify-between w-full bg-[#9162CB]">
                                        {/* Title & Category */}
                                        <FadeIn
                                            direction="up"
                                            duration={700}
                                            distance={50}
                                            delay={400}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <h1 className="text-4xl text-gray-900 p-5">
                                                {post.title}
                                            </h1>

                                            {post.category && (
                                                <span className="rounded-4xl border border-neutral-900 p-5 text-lg text-gray-900">
                                                    {post.category}
                                                </span>
                                            )}
                                        </FadeIn>
                                    </div>

                                    {/* Tags - LEFT aligned for image layout */}
                                    {post.tags?.length > 0 && (
                                        <div className="flex items-center justify-start gap-2 bg-[#9162CB] p-3">
                                            <FadeIn
                                                direction="up"
                                                duration={700}
                                                distance={50}
                                                delay={600}
                                                className="flex items-center"
                                            >
                                                <TagList
                                                    tags={post.tags}
                                                    tagColorMap={tagColorMap}
                                                />
                                            </FadeIn>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {post.description && (
                                        <div className="flex flex-col h-full bg-[#9162CB]">
                                            <FadeIn
                                                direction="up"
                                                duration={700}
                                                distance={50}
                                                delay={800}
                                                className="flex flex-col h-full"
                                            >
                                                <p className="flex-1 text-xl text-gray-900 p-5 w-full">
                                                    {post.description}
                                                </p>
                                            </FadeIn>
                                        </div>
                                    )}
                                </div>

                                <div
                                    style={{ gridArea: 'purpleRight' }}
                                    className="bg-[#9162CB]"
                                />

                                {/* Author and Date */}
                                <div
                                    style={{ gridArea: 'authorArea' }}
                                    className="bg-[#8452C2] text-lg text-gray-900 w-full"
                                >
                                    <FadeIn
                                        direction="up"
                                        duration={700}
                                        distance={0}
                                        delay={1100}
                                        className="flex justify-between items-center px-4 pt-1"
                                    >
                                        {post.author ? (
                                            <span className="truncate">
                                                {post.author}
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="truncate">
                                            {formattedDate}
                                        </span>
                                    </FadeIn>
                                </div>

                                <div
                                    style={{ gridArea: 'emptyRight' }}
                                    className="bg-transparent"
                                />
                                <div
                                    style={{ gridArea: 'emptyBottom' }}
                                    className="bg-transparent"
                                />
                                <div
                                    style={{ gridArea: 'emptyBottomRight' }}
                                    className="bg-transparent"
                                />
                                <div
                                    style={{ gridArea: 'emptyBottomFar' }}
                                    className="bg-transparent"
                                />
                            </div>
                        </>
                    ) : (
                        // SIMPLER GRID (when no image) - Tags centered
                        <div className="w-full bg-[#9162CB] mx-auto px-2 md:px-8">
                            <div className="h-[60px] md:h-[100px]" />

                            <div className="flex flex-col items-center w-full">
                                {/* Title */}
                                <FadeIn
                                    direction="up"
                                    duration={700}
                                    distance={50}
                                    delay={200}
                                    className="w-full"
                                >
                                    <h1 className="text-3xl md:text-4xl text-gray-900 p-5 text-center">
                                        {post.title}
                                    </h1>
                                </FadeIn>

                                {/* Category */}
                                {post.category && (
                                    <FadeIn
                                        direction="up"
                                        duration={700}
                                        distance={50}
                                        delay={400}
                                        className="w-full flex justify-center"
                                    >
                                        <span className="rounded-4xl border border-neutral-900 p-5 text-base md:text-lg text-gray-900 text-center">
                                            {post.category}
                                        </span>
                                    </FadeIn>
                                )}

                                {/* Tags - centered; TagList intrinsic width */}
                                {post.tags?.length > 0 && (
                                    <div className="flex items-center justify-center gap-2 p-3">
                                        <FadeIn
                                            direction="up"
                                            duration={700}
                                            distance={50}
                                            delay={600}
                                        >
                                            <TagList
                                                tags={post.tags}
                                                tagColorMap={tagColorMap}
                                            />
                                        </FadeIn>
                                    </div>
                                )}

                                {/* Description */}
                                {post.description && (
                                    <FadeIn
                                        direction="up"
                                        duration={700}
                                        distance={50}
                                        delay={800}
                                        className="w-full flex justify-center"
                                    >
                                        <p className="text-lg md:text-xl text-gray-900 p-5 w-full max-w-prose text-center">
                                            {post.description}
                                        </p>
                                    </FadeIn>
                                )}
                            </div>

                            {/* Author and date */}
                            <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-base md:text-lg text-gray-900 mx-auto max-w-4xl border-t border-gray-900/20">
                                <FadeIn
                                    direction="up"
                                    duration={700}
                                    distance={0}
                                    delay={1100}
                                    className="flex flex-col sm:flex-row justify-between w-full gap-2"
                                >
                                    <div className="flex-1 text-center sm:text-left">
                                        {post.author ?? ''}
                                    </div>
                                    <div className="flex-1 text-center sm:text-right">
                                        {formattedDate}
                                    </div>
                                </FadeIn>
                            </div>

                            <div className="h-40px md:h-[72px]" />
                        </div>
                    )}
                </div>
            </section>
        </FadeIn>
    );
}
