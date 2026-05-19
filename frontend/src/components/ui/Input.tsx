type InputProps = {
    label?: string;
    placeholder?: string;
    type?: string;
    name?: string;
    value?: string;
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
    label,
    placeholder,
    type = "text",
    name,
    value = "",
    onChange,
    className,
}: Readonly<InputProps>) {
    return (
        <div>
            {label && <label className="form-label">{label}</label>}
            <input
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className={className}
            />
        </div>
    );
}