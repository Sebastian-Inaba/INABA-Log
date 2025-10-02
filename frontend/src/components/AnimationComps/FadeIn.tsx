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
    threshold?: number;
}

export function FadeIn({
    children,
    delay = 0,
    duration = 600,
    direction = 'up',
    distance = 30,
    className = '',
    triggerOnce = true,
    threshold = 0.1,
}: FadeInProps) {
    // tracks whether element is considered visible
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    /**
     * Set up IntersectionObserver on mount and clean up on unmount.
     * Observes the element and toggles `isVisible` based on intersection.
     */
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce) observer.unobserve(element); // stop after first reveal
                    } else if (!triggerOnce) {
                        // if we allow replay, hide when it leaves viewport
                        setIsVisible(false);
                    }
                });
            },
            { threshold },
        );

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [triggerOnce, threshold]); // re-create observer only when these change

    /**
     * Compute the transform applied while *not* visible. When visible we
     * return 'none' so the element animates to its natural position.
     */
    const getTransform = () => {
        if (!isVisible) {
            switch (direction) {
                case 'up':
                    return `translateY(${distance}px)`; // start lower, animate up
                case 'down':
                    return `translateY(-${distance}px)`; // start higher, animate down
                case 'left':
                    return `translateX(${distance}px)`; // start right, animate left
                case 'right':
                    return `translateX(-${distance}px)`; // start left, animate right
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
