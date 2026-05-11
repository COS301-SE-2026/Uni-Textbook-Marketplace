type TextAreaProps = {
    label?: string,
    placeholder?: string,
    rows?: number,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}


export default function TextAreaProps({
    label,
    placeholder,
    rows = 4,
    value,
    onChange,
}: TextAreaProps) {
    return (
        <div>

            {label && (
                <label className="form-label">
                    {label}
                </label>
            )}

            <textarea
                rows={rows}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />

        </div>
    )
}
