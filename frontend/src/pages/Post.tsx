// src/pages/Post.tsx
import PublicPostList from '../components/PostComps/PostGet';

export function Post() {
    return (
        <div className="w-full max-h-7/12 flex flex-col text-white gap-6 p-4 max-w-10/12 mx-auto">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between bg-blue-900 px-6 py-4 gap-4 md:gap-0">
                    <h1 className="text-2xl font-bold text-blue-200">Posts Page</h1>
                    <p className="font-semibold text-blue-100">List of posts will appear here.</p>
                </header>

                {/* Main List / Content */}
                <section className="flex-1 p-6 overflow-y-auto bg-neutral-950/70">
                    <PublicPostList />
                </section>
            </main>
        </div>
    );
}
