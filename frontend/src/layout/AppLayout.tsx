import { Outlet } from 'react-router-dom';
import { Header } from '../components/CommonComps/Header';
import { Footer } from '../components/CommonComps/Footer';

export function AppLayout() {
    return (
        <div className="App">
            <header className="navMenu">
                <Header />
            </header>
            <main>
                <Outlet /> {/* Pages render in main*/}
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}
