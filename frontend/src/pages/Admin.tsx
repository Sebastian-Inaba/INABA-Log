// src/pages/Admin.tsx
import { UseAuth } from '../provider/AuthProvider';
import { LogoutButton } from '../components/AdminComps/AdminLogout';
import { CreateNewModal } from '../components/AdminComps/AdminPost';
import { ContentList } from '../components/AdminComps/AdminGet';

export function Admin() {
    const { user } = UseAuth();

    return (
        <div data-lenis-prevent className="w-full max-h-7/12 flex flex-col md:flex-row text-white gap-6 p-4 max-w-10/12 mx-auto pt-[70px]">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between bg-purple-900 px-6 py-4 gap-4 md:gap-0">
                    <h1 className="text-2xl font-bold text-purple-200">Admin Content</h1>
                    <div className="flex gap-3 items-center">
                        <CreateNewModal />
                        <LogoutButton />
                        <p className="font-semibold text-purple-100">Admin: {user?.email.split('@')[0]}</p>
                    </div>
                </header>

                {/* Main List / Content */}
                <section className="flex-1 p-6 overflow-y-auto bg-neutral-950/70">
                    <ContentList />
                </section>
            </main>
        </div>
    );
}
