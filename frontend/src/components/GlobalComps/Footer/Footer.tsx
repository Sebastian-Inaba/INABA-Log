// src/components/CommonComps/Footer/Footer.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { routesConfig } from '../../../routes/routes';
import { socialIcons, otherIcons } from '../../../assets/icons/icons';
import type { RouteConfig } from '../../../routes/routes';

type FooterProps = {
    logoFont?: string;
    navFont?: string;
    ctaFont?: string;
};

export function Footer({
    logoFont = 'Poppins',
    navFont = 'Lato',
    ctaFont = 'Roboto_Slab',
}: FooterProps) {
    const footerNavItems: RouteConfig[] = useMemo(
        () => routesConfig[0].children?.filter((r) => r.showInNav) ?? [],
        [],
    );

    // local arrays
    const socialIconList = [
        {
            key: 'github',
            icon: (socialIcons as Record<string, string>).github,
            label: 'GitHub',
            url: 'https://github.com/yourname',
        },
        {
            key: 'linkedin',
            icon: (socialIcons as Record<string, string>).linkedin,
            label: 'LinkedIn',
            url: 'https://linkedin.com/in/yourname',
        },
        {
            key: 'instagram',
            icon: (socialIcons as Record<string, string>).instagram,
            label: 'Instagram',
            url: 'https://instagram.com/yourname',
        },
    ];

    const otherList = [
        {
            key: 'longArrow',
            icon: (otherIcons as Record<string, string>).longArrow,
            label: 'Long Arrow',
        },
    ];

    // Lookup directly by key
    const longArrow = otherList.find((i) => i.key === 'longArrow')?.icon;

    return (
        <div className="w-full flex justify-center relative tracking-wider">
            <div className="flex">
                {/* Vertical divider */}
                <div className="w-1 bg-gray-300 mr-6" />

                {/* Footer content */}
                <div className="flex flex-col gap-4">
                    {/* Row 1: Logo */}
                    <Link
                        to="/"
                        style={{ fontFamily: logoFont }}
                        className="text-2xl text-purple-500 font-medium tracking-widest"
                    >
                        INABA-Log
                    </Link>

                    {/* Row 2: Page nav */}
                    <nav aria-label="Footer Navigation">
                        <ul className="flex flex-wrap gap-y-1 text-gray-300 text-base">
                            {footerNavItems.map((item, idx) => (
                                <li key={item.path} className="flex">
                                    <Link
                                        to={item.path}
                                        style={{ fontFamily: navFont }}
                                        className="hover:text-purple-500 transition-colors underline"
                                    >
                                        {item.label}
                                    </Link>
                                    {idx < footerNavItems.length - 1 && (
                                        <span className="px-3 text-gray-400">
                                            •
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Row 3: Call to action to portfolio */}
                    <div className="flex items-center gap-4 text-lg">
                        <span
                            className="text-green-400 font-bold"
                            style={{ fontFamily: ctaFont }}
                        >
                            Like what you see?
                        </span>

                        {longArrow && (
                            <img
                                src={longArrow}
                                alt="Arrow"
                                className="w-4 h-4"
                            />
                        )}

                        <Link
                            to="/portfolio"
                            className="group flex items-center gap-1 px-2 py-1 relative text-yellow-400 font-bold hover:border-yellow-200"
                        >
                            <span className="absolute top-1 left-1 right-1 border-t border-yellow-400 group-hover:border-yellow-200 transition-colors" />
                            <span className="absolute bottom-1 left-1 right-1 border-b border-yellow-400 group-hover:border-yellow-200 transition-colors" />
                            <span className="text-yellow-400 font-bold group-hover:text-yellow-200 transition-colors">
                                -
                            </span>
                            <span className="group-hover:text-yellow-200 transition-colors">
                                Portfolio
                            </span>
                            <span className="text-yellow-400 font-bold group-hover:text-yellow-200 transition-colors">
                                -
                            </span>
                        </Link>
                    </div>

                    {/* Row 4: Social icons */}
                    <div className="flex gap-10 bg-gray-100 rounded-2xl justify-center p-3">
                        {socialIconList.map((s) => (
                            <a key={s.key} href={s.url} aria-label={s.label}>
                                <img
                                    src={s.icon}
                                    alt={s.label}
                                    className="w-8 h-8"
                                />
                            </a>
                        ))}
                    </div>

                    {/* Row 5: Copyright */}
                    <div className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} INABA-Log. All rights
                        reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
