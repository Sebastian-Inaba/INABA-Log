import { Outlet } from 'react-router-dom';
import { Header } from '../components/CommonComps/Header/Header';
import { Footer } from '../components/CommonComps/Footer';

export function AppLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
            <header className="sticky top-0 h-[60px] w-full z-50 bg-neutral-900 flex items-center justify-center" role="banner">
                <Header />
            </header>

            <main className="flex-1 w-full bg-neutral-900 flex items-center justify-center">
                <Outlet /> {/* Pages render in main */}
            </main>

            <footer className="w-full bg-neutral-800 flex items-center justify-center p-4">
                <Footer />
            </footer>
        </div>
    );
}
