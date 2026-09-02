'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter,useSearchParams } from 'next/navigation'
import ListingForm, { ListingFormData } from '@/components/listings/listingForm'
import Button from '@/components/ui/Button'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { createBook, createModule, uploadImages, createListing, CreateListingData } from '@/lib/listings.api'
import Modal from '@/components/ui/Modal'
import Image from 'next/image'
import { PlusCircle } from 'lucide-react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/components/tutorials/tutorial.css'


const ISBN_REGEX = /^(?:\d{9}[\dX]|\d{13})$/i;

const PRICE_REGEX = /^\d+(\.\d{1,2})?$/

type FormErrors = Partial<Record<keyof ListingFormData, string>>

function validateBookDetails(form: ListingFormData): FormErrors {
    const errors: FormErrors = {}
    if (!form.bookName.trim())     errors.bookName     = 'Book name is required'
    if (!form.author.trim())    errors.author    = 'Author is required'
    if (!form.edition.trim())   errors.edition   = 'Edition is required'
    if (!form.publisher.trim()) errors.publisher = 'Publisher is required'

    if (!form.isbn.trim()) {
        errors.isbn = 'ISBN is required'
    } else if (!ISBN_REGEX.test(form.isbn.replace(/-/g, ''))) {
        errors.isbn = 'Enter a valid 10 or 13-digit ISBN'
    }

    return errors
}

function validateModuleDetails(form: ListingFormData): FormErrors {
    const errors: FormErrors = {}
    if (!form.code.trim()) errors.code    = 'Module code is required'
    if (!form.name.trim()) errors.name    = 'Module name is required'
    if (!form.semester.trim()) errors.name = 'Semester is required'
    if (!form.faculty)     errors.faculty = 'Faculty is required'
    return errors
}

function validateListingDetails(form: ListingFormData): FormErrors {
    const errors: FormErrors = {}
    if (!form.condition)       errors.condition       = 'Condition is required'
    if (!form.annotationLevel) errors.annotationLevel = 'Annotation level is required'
    if (!form.listingTitle) errors.listingTitle = 'Listing title is required'
    if (!form.price.trim()) {
        errors.price = 'Price is required'
    } else if (!PRICE_REGEX.test(form.price) || Number(form.price) <= 0) {
        errors.price = 'Enter a valid price (e.g. 350 or 350.00)'
    }

    const description = form.description.trim()
    if (!description)                errors.description = 'Description is required'
    else if (description.length < 20) errors.description = 'Description must be at least 20 characters'

    return errors
}

function validateImages(form: ListingFormData): FormErrors {
    return form.images.length < 4
        ? { images: 'Please upload at least 4 images' }
        : {}
}

const STEP_VALIDATORS: Record<number, (form: ListingFormData) => FormErrors> = {
    1: validateBookDetails,
    2: validateModuleDetails,
    3: validateListingDetails,
    4: validateImages,
}

function validateStep(step: number, form: ListingFormData): FormErrors {
    return STEP_VALIDATORS[step]?.(form) ?? {}
}

const STEP_LABELS = ['Book Details', 'Module Details', 'Listing Details', 'Upload Pictures']

type TutorialStep = {
    element: string
    popover: {
        title: string
        description: string
    }
}

const TUTORIAL_STEPS: Record<number,TutorialStep>  = {
    
    1: {
        element: '.card',
        popover: {
            title: 'Step 1: Book Details',
            description: 'Enter book details'
        }
    },
    2: {
        element: '.card',
        popover: {
            title: 'Step 2: Module Details',
            description: 'Enter module details'
        }
    },
    3: {
        element: '.card',
        popover: {
            title: 'Step 3: Listing Details',
            description: 'Enter Listing details'
        }
    },
    4: {
        element: '.card',
        popover: {
            title: 'Step 4: Upload pictures',
            description: 'Upload atleast 4 clear photos of the book'
        }
    },

    
}


function CreateListingPageInner() {

    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const searchParams = useSearchParams()
    const [tutorialActive, setTutorialActive] = useState(false)

    const [form, setForm] = useState<ListingFormData>({
        // Book
        bookName: '',
        author: '',
        edition: '',
        isbn: '',
        publisher: '',
        // Module
        code: '',
        name: '',
        faculty: '',
        semester: '',
        // Listing
        listingTitle: '',
        condition: '',
        annotationLevel: '',
        price: '',
        description: '',
        has_notes: false,
        // Images
        images: [],
    })

    const [errors, setErrors] = useState<FormErrors>({})

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
            const book = await createBook({
                title: form.bookName,
                author: form.author,
                edition: Number(form.edition),
                isbn: form.isbn,
                publisher: form.publisher,
            })

            const createdModule = await createModule({
                code: form.code,
                name: form.name,
                faculty_id: form.faculty,
                semester: Number(form.semester),
            })

            const { urls } = await uploadImages(form.images)
            

            await createListing({
                title: form.listingTitle,
                bookId: book.id,
                moduleId: createdModule.id,
                condition: form.condition as CreateListingData['condition'],
                annotationLevel: form.annotationLevel as CreateListingData['annotationLevel'],
                price: Number(form.price),
                has_notes: form.has_notes,
                photoUrls: urls,
                description: form.description,
            })

            setShowSuccess(true)

        } catch (err) {
            console.error(err)

            if (err instanceof Error) {
                console.error('Error:', err.message)
                alert(`Error: ${err.message}`)
            } else {
                alert('Something went wrong. Please try again.')
            }
            
        } finally {
            setLoading(false)
        }
    }

    const runTutorialForStep = useCallback((stepNum: number) => {

        const isLastStep = stepNum === 4

        const tour = driver({
            showProgress:true,
            steps:[
                TUTORIAL_STEPS[stepNum],
                {
                    element: isLastStep ? '#post-listing-btn' : '#next-step-btn',
                    popover: {
                        title: isLastStep ? 'Post it!' : 'Next Step',
                        description: isLastStep
                            ? 'Once your photos are uploaded click here to submit'
                            : 'Click Next to continue'
                    }
                }
            ]
        })
        tour.drive()
    },[])

    useEffect(() => {
        
        if( tutorialActive) runTutorialForStep(step)

    },[step, tutorialActive,runTutorialForStep])

    return (
        <ProtectedRoute>
            
            <div className="relative overflow-hidden h-[180px] md:h-[200px] w-full" style={{
                background: 'linear-gradient(135deg, #000f2b 0%, #001a3d 30%, #00264a 55%, #004F66 75%, #006D8A 100%)',
                
            }}>
                
                <div className="absolute inset-0 right-0 w-full md:w-3/5 lg:w-1/2 ml-auto">
                    <div className="relative w-full h-full">


                        <Image
                            src="/../../sell.png"
                            alt="Student reading textbook"
                            fill
                            className="object-contain object-right"
                            priority
                            style={{ objectPosition: '100% 50%' }}
                        />
                        {/* Gradient overlay*/}
                        <div className="absolute inset-0" style={{
                            background: 'linear-gradient(90deg, rgba(0,15,43,0.9) 0%, rgba(0,26,61,0.6) 30%, rgba(0,38,74,0.3) 50%, transparent 70%)',
                        }} />

                    </div>
                </div>


                
                
                <div className="absolute inset-0 opacity-20" style={{
                    background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0,180,216,0.05) 0%, transparent 50%)',
                }} />
                
                
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 180, 216, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 180, 216, 0.15) 0%, transparent 50%)',
                }} />

                
                
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
                
                
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }} />
                
                <div className="relative z-10 px-6 py-4 md:px-8 lg:px-12 h-full flex flex-col justify-center max-w-7xl mx-auto w-full">
                    <div className="flex items-start gap-4">


                        <div className="p-2 rounded-xl" style={{
                            background: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <PlusCircle size={24} className="text-[#00B4D8]" />
                        </div>

                        <div>


                            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-lg">
                                Sell Your Textbook
                            </h1>
                            <p className="text-white/80 text-xs md:text-sm mt-0.5 drop-shadow-md">
                                Fill in the details below to create your listing
                            </p>
                        </div>


                    </div>
                </div>
                
                
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.3), transparent)',
                }} />
            </div>

            <div className="container-content py-8">
                
                <div className="flex my-8 w-full gap-1">
                    {STEP_LABELS.map((label, i) => {
                        const stepNum = i + 1
                        const isActive = step === stepNum
                        const isCompleted = step > stepNum
                        const textColor = isActive || isCompleted ? 'text-white' : 'text-gray-500'
                        let background = '#e5e7eb'
                        if (isCompleted) {
                            background = '#04505f'
                        }
                        if (isActive) {
                            background = 'linear-gradient(135deg, #00B4D8, #0096B4)'
                        }

                        return (
                            <div key={label} className="flex-1 relative">
                                
                                <div 
                                    className={`
                                        relative flex items-center justify-center px-4 py-3
                                        text-sm font-medium transition-all duration-300
                                        ${textColor}
                                    `}
                                    style={{
                                        clipPath: 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%)',
                                        background,
                                        minHeight: '48px',
                                        width: '100%',
                                    }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isCompleted && <span className="text-white text-sm">✓</span>}
                                        <span className="truncate">{label}</span>
                                    </span>
                                </div>


                            </div>
                        )
                    })}
                </div>

                
                <ListingForm
                    step={step}
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                />

                
                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <Button onClick={prevStep} variant="primary" className="cursor-pointer">Previous</Button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <Button onClick={nextStep} id='next-step-btn' variant="primary" className="cursor-pointer">Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} id='post-listing-btn' variant="primary" disabled={loading} className="cursor-pointer">
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
                        type="button"
                        onClick={() => router.push('/listings/mine')}
                        className="btn-primary cursor-pointer"
                    >
                        View My Listings
                    </button>


                </div>
            </Modal>
            
        </ProtectedRoute>
    )
}

export default function  CreateListingPage(){

    return(

        <Suspense fallback={null}>
            <CreateListingPageInner/>
        </Suspense>
    )
}