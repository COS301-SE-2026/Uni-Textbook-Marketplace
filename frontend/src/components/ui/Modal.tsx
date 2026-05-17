import Button from "./Button";

type ModalProps = Readonly<{
    isOpen: boolean;
    title?: string;
    children: React.ReactNode;
    onClose: () => void;
}>;

export default function Modal({ isOpen, title, children, onClose }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="card w-full max-w-lg">
                <div className="flex items-center justify-between">
                    {title && <h3>{title}</h3>}
                    <button onClick={onClose} className="text-xl">×</button>
                </div>
                <div className="mt-4">{children}</div>
                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}