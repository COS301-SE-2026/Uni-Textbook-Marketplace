

interface ErrorProps {
    children: React.ReactNode;
    className?: string;
}

export default function ErrorText({ children, className = ""

}
    : ErrorProps) {
    return (
        <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
            {children}
        </p>
    );
}