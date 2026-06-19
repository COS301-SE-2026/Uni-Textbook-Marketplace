//Author: Omphemetse Mokgotahdi
type BadgeProps = Readonly<{
    children: React.ReactNode;
    variant?: "pending" | "approved" | "rejected";
}>;

const variants = {
    pending: "badge-pending",
    approved: "badge-approved",
    rejected: "badge-rejected",
};

export default function Badge({ children, variant = "pending" }: BadgeProps) {
    return (
        <span className={`badge ${variants[variant]}`}>
            {children}
        </span>
    );
}