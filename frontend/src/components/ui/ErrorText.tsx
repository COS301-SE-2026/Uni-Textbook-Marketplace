type ErrorProps = Readonly<{
    children: React.ReactNode;
    className?: string;
}>;

export default function ErrorText({ children }: ErrorProps) {
    return (
        <p className="form-error">
            {children}
        </p>
    );
}