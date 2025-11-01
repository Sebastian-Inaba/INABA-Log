interface LogoSvgIconComponentProps {
    className?: string;
}

export function LongArrowSvgIconComponent({
    className = '',
}: LogoSvgIconComponentProps) {
    return (
        <svg
            className={className}
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.125 6.5H10.875M7.125 2.125L11.5 6.5L7.125 10.875"
                stroke="currentColor"
                strokeWidth="2.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
