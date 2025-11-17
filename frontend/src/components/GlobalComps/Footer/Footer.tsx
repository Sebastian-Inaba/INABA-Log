// src/components/CommonComps/Footer/Footer.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { routesConfig } from '../../../routes/routes';
import { SocialIcons, LogoIcon } from '../../../assets/icons/icons';
import type { RouteConfig } from '../../../routes/routes';

export function Footer() {
    const footerNavItems: RouteConfig[] = useMemo(
        () => routesConfig[0].children?.filter((r) => r.showInNav) ?? [],
        [],
    );

    // local arrays
    const socialIconList = [
        {
            key: 'github',
            Icon: SocialIcons.Github,
            label: 'GitHub Icon',
            url: 'https://github.com/Sebastian-Inaba',
        },
        {
            key: 'linkedin',
            Icon: SocialIcons.Linkedin,
            label: 'LinkedIn Icon',
            url: 'https://www.linkedin.com/in/sebastian-inaba-123abc/',
        },
        {
            key: 'instagram',
            Icon: SocialIcons.Instagram,
            label: 'Instagram Icon',
            url: 'https://www.instagram.com/sebastianinaba/',
        },
    ];

    return (
        <div className="w-full flex justify-center relative tracking-wider">
            <div className="flex border-t-2 border-gray-300 px-5 lg:px-25 py-3 gap-0 max-w-6xl w-full items-start">
                {/* Left: Logo */}
                <div className="hidden lg:flex items-start justify-start w-40">
                    <Link
                        to="/"
                        className="tracking-widest flex items-start"
                        aria-label="Logo link to homepage"
                    >
                        <LogoIcon className="h-12 w-auto" />
                    </Link>
                </div>

                {/* Center: Page nav + (mobile logo on smaller devices) + socials + copyright */}
                <div className="flex flex-col flex-1 items-center gap-4 lg:gap-15">
                    {/* Row 1: Page nav */}
                    <nav aria-label="Footer Navigation">
                        <ul className="flex flex-wrap gap-y-1 text-gray-300 text-base justify-center">
                            {footerNavItems.map((item, idx) => (
                                <li key={item.path} className="flex">
                                    <Link
                                        to={item.path}
                                        className="hover:text-green-400 transition-colors underline"
                                    >
                                        {item.label}
                                    </Link>
                                    {idx < footerNavItems.length - 1 && (
                                        <span className="px-2 md:px-8 lg:px-15 text-gray-400">
                                            •
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Logo(row 2 on Mobile / Tablet) */}
                    <div className="flex lg:hidden mt-3">
                        <Link
                            to="/"
                            className="tracking-widest flex items-center"
                            aria-label="Logo link to homepage"
                        >
                            <LogoIcon className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Row 2: Social icons */}
                    <div className="flex gap-10 rounded-2xl justify-center p-3">
                        {socialIconList.map((s) => {
                            const IconComponent = s.Icon;
                            return (
                                <a
                                    key={s.key}
                                    href={s.url}
                                    aria-label={s.label}
                                    className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 hover:border-2 hover:border-green-400"
                                >
                                    <IconComponent className="w-8 h-8" />
                                </a>
                            );
                        })}
                    </div>

                    {/* Row 3: Copyright */}
                    <div className="text-gray-400 text-sm text-center">
                        © {new Date().getFullYear()} INABA-Log. All rights
                        reserved. Made by Sebastian Inaba.
                    </div>
                </div>

                {/* Right spacer */}
                <div
                    className="hidden lg:flex items-start justify-end w-40"
                    aria-hidden
                ></div>
            </div>
        </div>
    );
}
