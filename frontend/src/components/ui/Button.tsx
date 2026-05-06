//Author: Omphemetse Mokgotahdi

type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
};


export default function Button({
    children,
    variant = "primary",
    disabled = false,
    onClick,
    className = "",

}: ButtonProps) {

    const varients = {
        primary: "btn-primary ",
        secondary: "btn-secondary",
        danger: "btn-danger",
    };

    return (


        <button
            onClick={onClick}
            disabled={disabled}
            className={`${varients[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

