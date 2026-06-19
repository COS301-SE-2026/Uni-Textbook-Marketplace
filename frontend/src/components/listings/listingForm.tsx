'use client'

import Image from 'next/image'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import TextArea from '@/components/ui/TextArea'
import ErrorText from '@/components/ui/ErrorText'

export interface ListingFormData {
    title: string
    author: string
    edition: string
    isbn: string
    publisher: string
    code: string
    name: string
    faculty: string
    condition: string
    annotationLevel: string
    price: string
    description: string
    images: File[]
}

interface ListingFormProps {
    step: number
    form: ListingFormData
    errors: Partial<Record<keyof ListingFormData, string>>
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveImage: (index: number) => void
}

export default function ListingForm({
    step,
    form,
    errors,
    onChange,
    onImageUpload,
    onRemoveImage,
}: ListingFormProps) {

    // Step 1 : Book Details

    if (step === 1) {
        return (
            <div className="card flex flex-col gap-5">

                <h3>Book Details</h3>

                <div>
                    <Input
                        label="Title *"
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        placeholder="e.g. Software Engineering"
                    />
                    {errors.title && <ErrorText>{errors.title}</ErrorText>}
                </div>

                <div>
                    <Input
                        label="Author *"
                        name="author"
                        value={form.author}
                        onChange={onChange}
                        placeholder="e.g. David C Kung"
                    />
                    {errors.author && <ErrorText>{errors.author}</ErrorText>}
                </div>

                <div>
                    <Input
                        label="Edition *"
                        name="edition"
                        value={form.edition}
                        onChange={onChange}
                        placeholder="e.g. 2"
                        type="number"
                    />
                    {errors.edition && <ErrorText>{errors.edition}</ErrorText>}
                </div>

                <div>
                    <Input
                        label="ISBN *"
                        name="isbn"
                        value={form.isbn}
                        onChange={onChange}
                        placeholder="e.g. 978-1260792683"
                    />
                    {errors.isbn && <ErrorText>{errors.isbn}</ErrorText>}
                </div>

                <div>
                    <Input
                        label="Publisher *"
                        name="publisher"
                        value={form.publisher}
                        onChange={onChange}
                        placeholder="e.g. McGraw Hill"
                    />
                    {errors.publisher && <ErrorText>{errors.publisher}</ErrorText>}
                </div>

            </div>
        )
    }

    // Step 2 : Module Details

    if (step === 2) {
        return (
            <div className="card flex flex-col gap-5">

                <h3>Module Details</h3>

                <div>
                    <Input
                        label="Module Code *"
                        name="code"
                        value={form.code}
                        onChange={onChange}
                        placeholder="e.g. COS301"
                    />
                    {errors.code && <ErrorText>{errors.code}</ErrorText>}
                </div>

                <div>
                    <Input
                        label="Module Name *"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="e.g. Software Engineering"
                    />
                    {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </div>

                <div>
                    <Select
                        label="Faculty *"
                        name="faculty"
                        value={form.faculty}
                        onChange={onChange}
                    >
                        <option value="">Select Faculty</option>
                        <option value="EBIT">EBIT</option>
                        <option value="LAW">Law</option>
                        <option value="HUM">Humanities</option>
                        <option value="MED">Health Sciences</option>
                        <option value="NAT">Natural Sciences</option>
                        <option value="ECO">Economic Sciences</option>
                        <option value="EDU">Education</option>
                    </Select>
                    {errors.faculty && <ErrorText>{errors.faculty}</ErrorText>}
                </div>

            </div>
        )
    }

    // Step 3 : Listing Details

    if (step === 3) {
        return (
            <div className="card flex flex-col gap-5">

                <h3>Listing Details</h3>

                <div>
                    <Select
                        label="Condition *"
                        name="condition"
                        value={form.condition}
                        onChange={onChange}
                    >
                        <option value="">Select Condition</option>
                        <option value="new">New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </Select>
                    {errors.condition && <ErrorText>{errors.condition}</ErrorText>}
                </div>

                <div>
                    <Select
                        label="Annotation Level *"
                        name="annotationLevel"
                        value={form.annotationLevel}
                        onChange={onChange}
                    >
                        <option value="">Select Level</option>
                        <option value="none">None</option>
                        <option value="light">Light</option>
                        <option value="heavy">Heavy</option>
                    </Select>
                    {errors.annotationLevel && <ErrorText>{errors.annotationLevel}</ErrorText>}
                </div>

                <div>
                    <Input
                        label="Price (R) *"
                        name="price"
                        value={form.price}
                        onChange={onChange}
                        placeholder="e.g. 350"
                        type="number"
                    />
                    {errors.price && <ErrorText>{errors.price}</ErrorText>}
                </div>

                <div>
                    <TextArea
                        label="Description *"
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        rows={4}
                        placeholder="Describe the condition of your book, any highlights, missing pages, etc."
                    />
                    {errors.description && <ErrorText>{errors.description}</ErrorText>}
                </div>

            </div>
        )
    }

    // Step 4 : Upload Pictures

    if (step === 4) {
        return (
            <div className="card flex flex-col gap-5">

                <h3>Upload Pictures</h3>

                <p className="text-sm text-gray-600">
                    Please upload at least 4 clear photos:
                </p>

                <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                    <li>Front cover</li>
                    <li>Back cover</li>
                    <li>Side / spine view</li>
                    <li>Inside pages (showing any annotations)</li>
                </ul>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <svg
                        className="w-8 h-8 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                    <span className="text-sm text-gray-500">
                        Click to upload images
                    </span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={onImageUpload}
                        className="hidden"
                    />
                </label>

                {errors.images && <ErrorText>{errors.images}</ErrorText>}

                {form.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {form.images.map((image, index) => (
                            <div key={index} className="relative group">
                                <div className="relative h-32 w-full rounded border overflow-hidden">
                                    <Image
                                        src={URL.createObjectURL(image)}
                                        alt={`preview-${index}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                    {index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-gray-400">
                    {form.images.length} / 4+ images uploaded
                </p>

            </div>
        )
    }

    return null
}