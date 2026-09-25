//Author: Omphemetse Mokgotahdi
type BadgeProps = Readonly<{
    children: React.ReactNode;
    variant?: "pending" | "approved" | "active" | "rejected" | "reserved" | "sold" | "new" | "good" | "fair" | "poor";
}>;

const variants = {
    pending: "badge-pending",
    approved: "badge-approved",
    active: "badge-active",
    rejected: "badge-rejected",
    reserved: "badge-reserved",
    sold: "badge-sold",
    new: "badge-new",
    good: "badge-good",
    fair: "badge-fair",
    poor: "badge-poor",
};

export default function Badge({ children, variant = "pending" }: BadgeProps) {
    return (
        <span className={`badge ${variants[variant]}`}>
            {children}
        </span>
    );
}