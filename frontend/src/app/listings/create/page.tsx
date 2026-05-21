'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ListingForm, { ListingFormData } from '@/components/listings/listingForm'
import Button from '@/components/ui/Button'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { createBook, createModule, uploadImages, createListing, CreateListingData } from '@/lib/listings.api'
import Modal from '@/components/ui/Modal'

const ISBN_REGEX = /^(?:\d{10}|\d{13})$/
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/

function validateStep(
    step: number,
    form: ListingFormData
): Partial<Record<keyof ListingFormData, string>> {

    const errors: Partial<Record<keyof ListingFormData, string>> = {}

    //Book Details
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

        if (!form.publisher.trim())
            errors.publisher = 'Publisher is required'
    }

    //Module Details
    if (step === 2) {
        if (!form.code.trim())
            errors.code = 'Module code is required'

        if (!form.name.trim())
            errors.name = 'Module name is required'

        if (!form.faculty)
            errors.faculty = 'Faculty is required'
    }

    //Listing Details
    if (step === 3) {
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

    //Images
    if (step === 4) {
        if (form.images.length < 4)
            errors.images = 'Please upload at least 4 images'
    }

    return errors
}

const STEP_LABELS = ['Book Details', 'Module Details', 'Listing Details', 'Upload Pictures']

export default function CreateListingPage() {

    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const [form, setForm] = useState<ListingFormData>({
        // Book
        title: '',
        author: '',
        edition: '',
        isbn: '',
        publisher: '',
        // Module
        code: '',
        name: '',
        faculty: '',
        // Listing
        condition: '',
        annotationLevel: '',
        price: '',
        description: '',
        // Images
        images: [],
    })

    const [errors, setErrors] =
        useState<Partial<Record<keyof ListingFormData, string>>>({})

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
        if (isValid() && step < 4) setStep(s => s + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1)
    }

    const handleSubmit = async () => {
        if (!isValid()) return

        setLoading(true)

        try {
            //Step 1 create the book
            const book = await createBook({
                title: form.title,
                author: form.author,
                edition: form.edition ? Number(form.edition) : undefined,
                isbn: form.isbn || undefined,
                publisher: form.publisher || undefined,
            })

            //Step 2 create the module
            const createdModule = await createModule({
                code: form.code,
                name: form.name,
                faculty: form.faculty || undefined,
            })

            //Step 3 upload images
            const { urls } = await uploadImages(form.images)

            //Step 4 create the listing
            await createListing({
                title: form.title,
                bookId: book.id,
                moduleId: createdModule.id,
                condition: form.condition as CreateListingData['condition'],
                annotationLevel: form.annotationLevel as CreateListingData['annotationLevel'],
                price: Number(form.price),
                hasNotes: false,
                photoUrls: urls,
            })

            setShowSuccess(true)

        } catch (err) {
            console.error(err)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ProtectedRoute>
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
                        <Button onClick={prevStep} variant="secondary">
                            Previous
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <Button onClick={nextStep} variant="secondary">
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            variant="secondary"
                            disabled={loading}
                        >
                            {loading ? 'Posting...' : 'POST LISTING'}
                        </Button>
                    )}
                </div>

            </div>

            <Modal
                isOpen={showSuccess}
                title="Listing Posted!"
                onClose={() => router.push('/listings/mine')}
            >
                <p className="text-sm text-gray-600">
                    Your textbook has been submitted successfully and is now pending status.
                </p>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push('/listings/mine')}
                        className="btn-primary"
                    >
                        View My Listings
                    </button>
                </div>
            </Modal>
        </ProtectedRoute>
    )
}