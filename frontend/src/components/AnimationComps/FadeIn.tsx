// components/HomeComps/FadeIn.tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
    className?: string;
    triggerOnce?: boolean;
    threshold?: number; // proportion of element that must be visible (0 = any intersection)
    rootMargin?: string; // optional - e.g. '0px 0px -10% 0px'
}

export function FadeIn({
    children,
    delay = 0,
    duration = 600,
    direction = 'up',
    distance = 30,
    className = '',
    triggerOnce = true,
    threshold = 0, // <<< change: default to 0 so tall elements can show when any part is visible
    rootMargin = '0px',
}: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Immediate check: if any part of the element is already inside the viewport, reveal it.
        // This helps when an element is very tall and the observer callback hasn't fired yet.
        if (typeof window !== 'undefined') {
            const rect = element.getBoundingClientRect();
            const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
            if (inViewport) {
                setIsVisible(true);
                if (triggerOnce) return; // already visible, no need to set up observer
            }
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce && element) observer.unobserve(element);
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                });
            },
            { threshold, rootMargin },
        );

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [triggerOnce, threshold, rootMargin]);

    const getTransform = () => {
        if (!isVisible) {
            switch (direction) {
                case 'up':
                    return `translateY(${distance}px)`;
                case 'down':
                    return `translateY(-${distance}px)`;
                case 'left':
                    return `translateX(${distance}px)`;
                case 'right':
                    return `translateX(-${distance}px)`;
                default:
                    return 'none';
            }
        }
        return 'none';
    };

    return (
        <div
            ref={elementRef}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
