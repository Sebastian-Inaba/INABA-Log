import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routesConfig } from './routes/routes';

function AppRoutes() {
    return useRoutes(routesConfig);
}

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App;
