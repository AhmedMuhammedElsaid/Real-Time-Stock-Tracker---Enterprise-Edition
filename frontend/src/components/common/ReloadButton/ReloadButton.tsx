import './ReloadButton.css';

interface ReloadButtonProps {
    onClick?: () => void;
    label?: string;
}

export default function ReloadButton({ onClick, label = 'Reload Page' }: ReloadButtonProps) {
    const handleClick = onClick || (() => window.location.reload());

    return <button
        className="error-boundary-reload-btn"
        onClick={handleClick}
    >
        {label}
    </button>
}
