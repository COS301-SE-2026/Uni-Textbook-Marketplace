type CardProps = Readonly<{
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass'
}>;

export default function Card({ children, className = "", variant = 'default' }: CardProps) {
    const styles = {
        default: 'card',
        glass: 'backdrop-blur-md bg-white/10 border border-white/20 rounded-md p-5'
    }
    return (
        <div className={`${styles[variant]} ${className}`}>
            {children}
        </div>
    )
}