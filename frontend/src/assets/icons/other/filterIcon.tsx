interface LogoSvgIconComponentProps {
    className?: string;
}

export function FilterSvgIconComponent({
    className = '',
}: LogoSvgIconComponentProps) {
    return (
        <svg
            className={className}
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3.125 5.20831H21.875L14.5833 13.5416V19.7916L10.4167 17.7083V13.5416L3.125 5.20831Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
