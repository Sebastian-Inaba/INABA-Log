// src/pages/Admin.tsx
import { UseAuth } from '../provider/AuthProvider';
import { LogoutButton } from '../components/AdminComps/AdminLogout';
import CreateNewModal from '../components/AdminComps/AdminPost';
import ContentList from '../components/AdminComps/AdminGet';

export function Admin() {
    const { user } = UseAuth();

    return (
        <div className="w-full max-h-full flex flex-col md:flex-row text-white gap-6 p-4 max-w-11/12 mx-auto mb-10">
            {/* Left Column */}
            <div className="w-full md:w-1/4 border-4 border-red-500 p-4 min-h-[300px] min-w-[200px] flex items-start justify-center">
                <p className="text-center">Left Column Placeholder</p>
            </div>

            {/* Right Column */}
            <div className="flex flex-col w-full md:w-3/4 border-4 border-blue-500 min-h-[800px] min-w-[400px]">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b-4 border-yellow-500 gap-2">
                    <h1 className="text-2xl">Admin Content</h1>
                    <div className="flex gap-2 items-center">
                        <CreateNewModal />
                        <LogoutButton />
                        <p className="font-bold">Admin: {user?.email.split('@')[0]}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 border-t-4 border-purple-500 flex flex-col gap-4">

                    <div className="flex-1 border-2 border-yellow-500 p-4 flex items-center justify-center">
                        <ContentList />
                    </div>
                </div>
            </div>
        </div>
    );
}
