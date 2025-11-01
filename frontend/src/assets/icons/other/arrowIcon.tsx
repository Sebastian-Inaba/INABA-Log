interface LogoSvgIconComponentProps {
    className?: string;
}

export function ArrowSvgIconComponent({
    className = '',
}: LogoSvgIconComponentProps) {
    return (
        <svg
            className={className}
            width="15"
            height="9"
            viewBox="0 0 15 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.75 1.625L7.5 7.375L13.25 1.625"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
