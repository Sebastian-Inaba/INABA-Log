// src/pages/PostDetail.tsx
import { useParams } from 'react-router-dom';
import { PostHeader } from '../components/PostComps/PostDetail/PostHeader';
import { PostMain } from '../components/PostComps/PostDetail/PostMain';
import { FeaturedPosts } from '../components/PostComps/PostFeatured';
import { FadeIn } from '../components/AnimationComps/FadeIn';

export function PostDetail() {
    const { slug } = useParams<{ slug: string }>();

    if (!slug) {
        return (
            <div className="w-full h-full overflow-x-hidden overflow-y-auto">
                <div className="w-full mb-8">
                    <div className="text-center py-12 text-gray-500 text-lg">
                        Invalid post URL.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-x-hidden overflow-y-auto hide-scrollbar pt-[70px]">
            {/* Header */}
            <div className="w-full mb-8">
                <PostHeader slug={slug} />
            </div>

            {/* Main Area */}
            <div className="w-full flex justify-center">
                <div className="w-full flex gap-0 justify-between">
                    {/* Left spacer */}
                    <div className="w-80 max-[1440px]:hidden wrap-shrink-0" />

                    {/* Content */}
                    <div className="flex-1 lg:max-w-[1200px]">
                        <PostMain slug={slug} />
                    </div>

                    {/* Featured posts */}
                    <div className="w-80 max-[1440px]:hidden wrap-shrink-0 px-4">
                        <FadeIn direction="left" duration={700} delay={1600}>
                            <FeaturedPosts />
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    );
}
