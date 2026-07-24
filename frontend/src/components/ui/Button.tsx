//Author: Omphemetse Mokgotahdi
type ButtonProps = Readonly<{
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
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
    type ,
    onClick,
    className = "",
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}