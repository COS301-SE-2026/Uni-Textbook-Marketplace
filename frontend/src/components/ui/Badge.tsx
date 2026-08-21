//Author: Omphemetse Mokgotahdi
type BadgeProps = Readonly<{
    children: React.ReactNode;
    variant?: "pending" | "approved" | "rejected" | "reserved" | "sold";
}>;

const variants = {
    pending: "badge-pending",
    approved: "badge-approved",
    rejected: "badge-rejected",
    reserved: "badge-reserved",
    sold: "badge-sold",
};

export default function Badge({ children, variant = "pending" }: BadgeProps) {
    return (
        <span className={`badge ${variants[variant]}`}>
            {children}
        </span>
    );
}