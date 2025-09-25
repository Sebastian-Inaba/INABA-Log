// src/pages/Research.tsx
import PublicResearchList from '../components/ResearchComps/ResearchGet';

export function Research() {
    return (
        <div className="w-full max-h-7/12 flex flex-col text-white gap-6 p-4 max-w-10/12 mx-auto">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between bg-purple-900 px-6 py-4 gap-4 md:gap-0">
                    <h1 className="text-2xl font-bold text-purple-200">Research / Deepdives Page</h1>
                    <p className="font-semibold text-purple-100">All research content will be listed here.</p>
                </header>

                {/* Main List / Content */}
                <section className="flex-1 p-6 overflow-y-auto bg-neutral-950/70">
                    <PublicResearchList />
                </section>
            </main>
        </div>
    );
}
