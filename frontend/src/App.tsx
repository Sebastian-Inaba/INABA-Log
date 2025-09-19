import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routesConfig } from './routes/routes';
import { AuthProvider } from './provider/AuthProvider';

function AppRoutes() {
    return useRoutes(routesConfig);
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
