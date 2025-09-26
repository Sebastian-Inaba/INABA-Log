// src/components/AnimationComps/Scroll/ScrollWrapper.tsx
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';

interface LenisScrollProps {
    children: ReactNode;
}

export function LenisScroll({ children }: LenisScrollProps) {
    // Ref to store the Lenis instance
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis for smooth scrolling
        lenisRef.current = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1,
            autoRaf: true,
        });

        return () => {
            lenisRef.current?.destroy();
        };
    }, []);

    return <div className="h-full w-full">{children}</div>;
}
