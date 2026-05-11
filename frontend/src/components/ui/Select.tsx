
type Option = {
    label: string;
    value: string;
}
type SeletProps = {
    label?: string,
    options: Option[];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}


export default function Select({
    label,
    options,
    value,
    onChange
}: SeletProps) {
    return (
        <div>
            {label && (
                <label className="form-label">
                    {label}
                </label>
            )}

            <select
                value={value}
                onChange={onChange}
            >
                {options.map((option) => (

                    <option
                        key={option.value}
                        value={option.value}
                    > {option.label}</option>
                ))}

            </select>
        </div>
    )
}