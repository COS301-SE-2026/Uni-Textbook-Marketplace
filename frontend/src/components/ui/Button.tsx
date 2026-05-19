//Author: Omphemetse Mokgotahdi
type ButtonProps = Readonly<{
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}>;

const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
};

export default function Button({
    children,
    variant = "primary",
    disabled = false,
    onClick,
    className = "",
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}