// src/pages/Post.tsx
import PublicPostList from '../components/PostComps/PostGet';

export function Post() {
    return (
        <div className="w-full flex flex-col text-white gap-6 flex-1 overflow-y-auto bg-neutral-950/70 hide-scrollbar">
                {/* List / Content */}
                <section className="flex-1 overflow-y-auto hide-scrollbar">
                    <PublicPostList />
                </section>
        </div>
    );
}
