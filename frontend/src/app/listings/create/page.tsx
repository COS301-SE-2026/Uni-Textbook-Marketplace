'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ListingForm, { ListingFormData } from '@/components/listings/listingForm'
import  Button  from '@/components/ui/Button'


const ISBN_REGEX = /^(?:\d{9}[\dX]|\d{13}|[\d-]{10,17})$/
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/

function validateStep(
    step: number,
    form: ListingFormData
): Partial<Record<keyof ListingFormData, string>> {

    const errors: Partial<Record<keyof ListingFormData, string>> = {}

    if (step === 1) {
        if (!form.title.trim())
            errors.title = 'Title is required'

        if (!form.author.trim())
            errors.author = 'Author is required'

        if (!form.edition.trim())
            errors.edition = 'Edition is required'

        if (!form.isbn.trim()) {
            errors.isbn = 'ISBN is required'
        } else if (!ISBN_REGEX.test(form.isbn.replace(/-/g, ''))) {
            errors.isbn = 'Enter a valid 10 or 13-digit ISBN'
        }

        if (!form.moduleCode.trim())
            errors.moduleCode = 'Module code is required'

        if (!form.faculty)
            errors.faculty = 'Faculty is required'
    }

    if (step === 2) {
        if (!form.condition)
            errors.condition = 'Condition is required'

        if (!form.annotationLevel)
            errors.annotationLevel = 'Annotation level is required'

        if (!form.price.trim()) {
            errors.price = 'Price is required'
        } else if (!PRICE_REGEX.test(form.price) || Number(form.price) <= 0) {
            errors.price = 'Enter a valid price (e.g. 350 or 350.00)'
        }

        if (!form.description.trim())
            errors.description = 'Description is required'
        else if (form.description.trim().length < 20)
            errors.description = 'Description must be at least 20 characters'
    }

    if (step === 3) {
        if (form.images.length < 4)
            errors.images = 'Please upload at least 4 images'
    }

    return errors
}


const STEP_LABELS = ['Book Details', 'Listing Details', 'Upload Pictures']

export default function CreateListingPage() {

    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState<ListingFormData>({
        title: '',
        author: '',
        edition: '',
        isbn: '',
        moduleCode: '',
        faculty: '',
        condition: '',
        annotationLevel: '',
        price: '',
        description: '',
        images: [],
    })

    const [errors, setErrors] =
        useState<Partial<Record<keyof ListingFormData, string>>>({})

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        setForm(prev => ({
            ...prev,
            images: [...prev.images, ...Array.from(files)],
        }))
        setErrors(prev => ({ ...prev, images: '' }))
    }

    const handleRemoveImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }))
    }

    const isValid = () => {
        const newErrors = validateStep(step, form)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (isValid() && step < 3) setStep(s => s + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1)
    }

    const handleSubmit = async () => {
        if (!isValid()) return

        setLoading(true)

        try {
            const formData = new FormData()

            Object.entries(form).forEach(([key, value]) => {
                if (key !== 'images') formData.append(key, value as string)
            })

            form.images.forEach(img => formData.append('images', img))

            const res = await fetch('/api/listings', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Failed to create listing')

            router.push('/listings/mine')

        } catch (err) {
            console.error(err)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container-content py-8">

            <h1>Sell Your Textbook</h1>
            <h4>Fill in the details below</h4>

            {/* Step tabs */}
            <div className="flex gap-3 my-8">
                {STEP_LABELS.map((label, i) => (
                    <button
                        key={label}
                        disabled
                        className={`px-4 py-2 rounded text-sm font-medium ${step === i + 1
                                ? 'bg-blue-600 text-white'
                                : step > i + 1
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-200 text-gray-500'
                            }`}
                    >
                        {step > i + 1 ? `✓ ${label}` : label}
                    </button>
                ))}
            </div>

            {/* Form */}
            <ListingForm
                step={step}
                form={form}
                errors={errors}
                onChange={handleChange}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
            />

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                {step > 1 ? (
                    <Button onClick={prevStep} variant= "secondary">
                        Previous
                    </Button>
                ) : (
                    <div />
                )}

                {step < 3 ? (
                    <Button onClick={nextStep} variant= "secondary">
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        variant= "secondary"
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'POST LISTING'}
                    </Button>
                )}
            </div>

        </div>
    )
}
