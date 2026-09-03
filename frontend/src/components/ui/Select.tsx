type SelectProps = Readonly<{
    id?: string;
    label?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}>;

export default function Select({ id, label, name, value, onChange, children }: SelectProps) {
    return (
        <div>
            {label && <label htmlFor={id} className="form-label">{label}</label>}
            <select id={id} name={name} value={value} onChange={onChange}>
                {children}
            </select>
        </div>
    )
}