// src/pages/ResearchDetail.tsx
import { useParams } from 'react-router-dom';
import { ResearchMain } from '../components/ResearchComps/ResearchDetail/ResearchMain';

export function ResearchDetail() {
    const { slug } = useParams<{ slug: string }>();

    if (!slug) {
        return (
            <div className="w-full h-full overflow-x-hidden overflow-y-auto">
                <div className="w-full mb-8">
                    <div className="text-center py-12 text-gray-500 text-lg">Invalid research URL.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-x-hidden overflow-y-auto">
            <div className="w-full flex justify-center px-4 lg:px-8 py-8">
                <div className="w-full max-w-[1400px]">
                    {/* ResearchMain */}
                    <ResearchMain slug={slug} />
                </div>
            </div>
        </div>
    );
}
