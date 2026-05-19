type SelectProps = Readonly<{
    label?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}>;

export default function Select({ label, name, value, onChange, children }: SelectProps) {
    return (
        <div>
            {label && <label className="form-label">{label}</label>}
            <select name={name} value={value} onChange={onChange}>
                {children}
            </select>
        </div>
    )
}