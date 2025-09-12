// src/components/CommonComps/Header.tsx
import { Link } from 'react-router-dom';

export function Header() {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/post">Posts</Link>
                </li>
                <li>
                    <Link to="/research">Research</Link>
                </li>
            </ul>
        </nav>
    );
}
