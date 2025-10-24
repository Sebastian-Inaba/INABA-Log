// src/pages/Research.tsx
import PublicResearchList from '../components/ResearchComps/ResearchGet';

export function Research() {
    return (
        <div className="w-full flex flex-col text-white gap-6 flex-1 overflow-y-auto bg-neutral-950/70 hide-scrollbar">
            {/* List / Content */}
            <section className="flex-1 overflow-y-auto hide-scrollbar">
                <PublicResearchList />
            </section>
        </div>
    );
}
