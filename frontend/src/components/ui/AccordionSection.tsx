import { ChevronDown } from "lucide-react";
import Button from "./Button";

type AccordionSectionProps = {
    title: string
    isOpen: boolean
    OnToggle: () => void
    children: React.ReactNode
}

export default function AccordionSection({
    title,
    isOpen,
    OnToggle,
    children,
}: AccordionSectionProps){

    return(
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
            <Button
                type="button"
                onClick={() => OnToggle?.()}
                variant="primary"
                className="w-full flex items-center justify-between px-4 py-3"
            >
                <span className="font-medium">{title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" :""}`}/>
            </Button>
            {isOpen && <div className="p-4">{children}</div>}
        </div>
    )
}