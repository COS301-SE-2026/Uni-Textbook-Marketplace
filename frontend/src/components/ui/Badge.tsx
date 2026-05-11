//Author: Omphemetse Mokgotahdi
type BadgeProps ={
    children: React.ReactElement;
    variant?: "pending" | "approved" | "rejected";
    
}

export default function Badge({
    children,
    variant = "pending",
    
}:BadgeProps){

    const varients ={
        pending:"badge-pending",
        approved:"badge-approved",
        rejected:"badge-rejected"
    }

    return(
        <span 
            className={`badge ${varients[variant]}`}
        >
            {children}
        </span>
    );
}