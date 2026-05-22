type TextAreaProps = Readonly<{
    label?: string;
    placeholder?: string;
    rows?: number;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}>;

export default function TextArea({ label, placeholder, rows = 4,name , value, onChange }: TextAreaProps) {
    return (
        <div>
            {label && <label className="form-label">{label}</label>}
            <textarea rows={rows} name={name} placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
}