// src/components/HomeComps/HeroInfo.tsx
import { FadeIn } from '../AnimationComps/FadeIn';
import { Link } from 'react-router-dom';

interface HeroInfoProps {
    className?: string;
    heroTitle?: string;
    heroText?: string;
    heroCtaText?: string;
}

export function HeroInfo({
    className = '',
    heroTitle = 'The place of infinite loops of coffee and errors',
    heroText = 'You have come to the right place if you are interested in web development, gaming, or Sebastian Inaba(me). I can assure you my code and jokes works most of the time, so feel free to look around; and if something catches your eye, check out my latest projects, or deep dives and recent posts below.',
    heroCtaText = 'or go deeper.',
}: HeroInfoProps) {
    return (
        // Card
        <section
            className={`${className} relative z-20 h-full flex flex-col md:justify-center`}
            aria-labelledby="home-hero"
            role="region"
        >
            <div className="border justify-center gap-7 border-[#9162CB] p-4 rounded-2xl bg-neutral-950/80 h-full flex flex-col min-h-0">
                {/* title + paragraph */}
                <div className="flex flex-col gap-3">
                    <FadeIn direction="right" delay={0}>
                        <h2
                            id="home-hero" // referenced by section aria-labelledby
                            className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-white wrap-break-words"
                        >
                            {heroTitle}
                        </h2>
                    </FadeIn>

                    <FadeIn direction="right" delay={100}>
                        <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-base text-gray-600 dark:text-slate-300">
                            {heroText}
                        </p>
                    </FadeIn>
                </div>

                {/* CTA row */}
                <div>
                    <FadeIn direction="right" delay={200}>
                        <div className="flex flex-wrap gap-1 sm:gap-3 items-center">
                            {/* Portfolio link */}
                            <a
                                href="/portfolio"
                                className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/40 whitespace-nowrap bg-neutral-900/50"
                                aria-label="View portfolio"
                            >
                                View Portfolio
                            </a>

                            {/* External GitHub link */}
                            <a
                                href="https://github.com/your-username"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/40 whitespace-nowrap bg-neutral-900/50"
                                aria-label="Open GitHub in a new tab"
                            >
                                GitHub
                            </a>

                            <div>
                                {/* Visual separator dot */}
                                <span
                                    className="pr-2 inline text-sm text-gray-500 dark:text-slate-400"
                                    aria-hidden="true"
                                >
                                    •
                                </span>

                                {/* Small inline CTA */}
                                <Link
                                    to="/research"
                                    className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 hover:underline whitespace-nowrap"
                                    aria-label={heroCtaText}
                                >
                                    {heroCtaText}
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
