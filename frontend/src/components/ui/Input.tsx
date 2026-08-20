type InputProps = {
    id?: string;
    label?: string;
    placeholder?: string;
    type?: string;
    name?: string;
    value?: string;
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
    id,
    label,
    placeholder,
    type = "text",
    name,
    value = "",
    onChange = () => { },
    className,
}: Readonly<InputProps>) {
    return (
        <div>
            {label && <label htmlFor={id} className="form-label">{label}</label>}
            <input
                id={id}
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