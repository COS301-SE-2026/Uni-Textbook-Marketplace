type InputProps = {
    label?: string;
    placeholder?: string;
    type?: string;
    value?: string;
    className?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
    label,
    placeholder,
    type = "text",
    value = "",
    onChange,
    className,
}: InputProps) {

    return (
        <div>
            {label && <label className="form-label">{label}</label>}
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className={`className`}
            />
        </div>
    );
}