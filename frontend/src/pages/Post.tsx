// src/pages/Post.tsx
import PublicPostList from '../components/PostComps/PostGet';

export function Post() {
    return (
        <div className="w-full flex flex-col text-white gap-6 flex-1 overflow-y-auto bg-neutral-950/50 hide-scrollbar pt-[70px]">
            {/* List / Content */}
            <section className="flex-1 overflow-y-auto hide-scrollbar">
                <PublicPostList />
            </section>
        </div>
    );
}
