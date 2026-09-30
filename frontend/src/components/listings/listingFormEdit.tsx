"use client";

import { useEffect, useState } from "react";
import ListingForm, { ListingFormData } from "./listingForm";
import AccordionSection from "@/components/ui/AccordionSection"
import { getMyListings, uploadImages, editListing, type EditListingData } from "@/lib/listings.api";
import { Button, Modal } from "../ui";
import Fields from "@/components/ui/Fields"
import Image from "next/image";
import { useRouter } from 'next/navigation'
import CornerCropEditor from "@/components/listings/CornerCropEditor"
import { dataUrlToFile } from "@/utils/dataUrlToFile"


const SECTIONS = [
    { key: "bookDetails", title: "Book Details", step: 1 },
    { key: "moduleDetails", title: "Module Details", step: 2 },
    { key: "listingDetails", title: "Listing Details", step: 3 },
    { key: "images", title: "Edit uploaded images", step: 4 },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

type OpenSection = Record<SectionKey, boolean>;

type ListingFormEditProps = {
    listingId: string
}

type CropTarget =
    | { kind: "existing"; index: number }
    | { kind: "new"; index: number }
    | null

export default function ListingFormEdit({ listingId }: ListingFormEditProps) {

    const router = useRouter()
    const [form, setForm] = useState<ListingFormData | null>(null);
    const [original, setOriginal] = useState<ListingFormData | null>(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [originalPhotoUrls, setOriginalPhotoUrls] = useState<string[]>([]);

    const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});
    const [success, setSuccess] = useState(false);

    const [cropTarget, setCropTarget] = useState<CropTarget>(null)
    const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null)

    const [pendingExistingReplacements, setPendingExistingReplacements] = useState<Map<number, File>>(
        () => new Map()
    )

    const [openSections, setOpenSection] = useState<OpenSection>({
        bookDetails: true,
        listingDetails: false,
        moduleDetails: false,
        images: false,
    })

    useEffect(() => {

        let cancelled = false
        async function fetchMineListing() {

            try {
                setLoading(true);

                const data = (await getMyListings(listingId)) as {
                    id: string;
                    title?: string;
                    condition: ListingFormData["condition"];
                    annotation_level: ListingFormData["annotationLevel"];
                    price: number;
                    has_notes: boolean;
                    photo_urls: string[];
                    description?: string;
                    book: { id: string; isbn?: string; title: string; author?: string; edition?: number; publisher?: string };
                    module?: { id: string; code: string; name: string; semester: number; faculty?: { name: string } };
                };

                if (!cancelled) {

                    const mapped: ListingFormData = {

                        bookName: data.book.title,
                        author: data.book.author ?? "",
                        edition: data.book.edition?.toString() ?? "",
                        isbn: data.book.isbn ?? "",
                        publisher: data.book.publisher ?? "",

                        code: data.module?.code ?? "",
                        name: data.module?.name ?? "",
                        faculty: data.module?.faculty?.name ?? "",
                        semester: data.module?.semester.toString() ?? "",

                        listingTitle: data.title ?? "",
                        condition: data.condition,
                        annotationLevel: data.annotation_level,
                        has_notes: data.has_notes,
                        price: data.price.toString(),
                        description: data.description ?? "",
                        images: [],
                    };

                    setForm(mapped);
                    setOriginal(mapped);

                    setExistingImageUrls(data.photo_urls ?? []);
                    setOriginalPhotoUrls(data.photo_urls ?? []);

                }
            } catch (err) {
                if (!cancelled) {
                    console.error('something went wrong', err)
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchMineListing();
        return () => { cancelled = true; };

    }, [listingId])

    
    useEffect(() => {
        return () => {
            if (cropSourceUrl && cropSourceUrl.startsWith('blob:')) {
                URL.revokeObjectURL(cropSourceUrl)
            }
        }
    }, [cropSourceUrl])


    function toggleSection(section: SectionKey) {
        setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {

        const { name, value } = e.target;
        const fieldName = name as keyof ListingFormData;


        setForm((prev) => (prev ? { ...prev, [fieldName]: value } : prev));
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement> | FileList | null) {
        const files: FileList | null = e && "target" in e ? e.target.files : (e as FileList | null);
        if (!files) return;
        setForm((prev) => {
            if (!prev) return prev;
            const existing = (prev as any).images ? Array.from((prev as any).images) : [];
            const added = Array.from(files);
            return { ...prev, images: [...existing, ...added] } as ListingFormData;
        });
    }

    function handleRemoveImage(index: number) {

        setForm((prev) => {
            if (!prev) return prev;
            const imgs = (prev as any).images ? Array.from((prev as any).images) : [];
            imgs.splice(index, 1);
            return { ...prev, images: imgs } as ListingFormData;
        });
    }

    function handleRemoveExistingImage(index: number) {
        setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    }


    function openCropExisting(index: number) {
        const url = existingImageUrls[index]
        if (!url) return
        setCropTarget({ kind: "existing", index })
        setCropSourceUrl(url)
    }

    function openCropNew(index: number) {
        if (!form?.images[index]) return
        setCropTarget({ kind: "new", index })
        setCropSourceUrl(URL.createObjectURL(form.images[index]))
    }

    function closeCrop() {
        if (cropSourceUrl && cropSourceUrl.startsWith('blob:')) {
            URL.revokeObjectURL(cropSourceUrl)
        }
        setCropSourceUrl(null)
        setCropTarget(null)
    }

    async function handleCropConfirm(dataUrl: string) {
        const target = cropTarget
        if (!target || !form) {
            closeCrop()
            return
        }

        try {
            const file = await dataUrlToFile(
                dataUrl,
                target.kind === "existing" ? `existing-${target.index + 1}` : `new-${target.index + 1}`,
            )

            if (target.kind === "new") {
                
                setForm((prev) => {
                    if (!prev) return prev
                    const images = [...prev.images]
                    images[target.index] = file
                    return { ...prev, images }
                })
            } else {
                
                const previewUrl = URL.createObjectURL(file)
                setExistingImageUrls((prev) =>
                    prev.map((url, i) => (i === target.index ? previewUrl : url))
                )
                setPendingExistingReplacements((prev) => {
                    const next = new Map(prev)
                    next.set(target.index, file)
                    return next
                })
            }
        } catch (err) {
            console.error('[ListingFormEdit] Could not save cropped photo', err)
        } finally {
            closeCrop()
        }
    }

    

    function buildDiff(original: ListingFormData, current: ListingFormData, listingId: string): EditListingData {
        const diff: EditListingData = { id: listingId };

        if (original.listingTitle !== current.listingTitle) diff.title = current.listingTitle;
        if (original.condition !== current.condition) diff.condition = current.condition as EditListingData['condition'];
        if (original.annotationLevel !== current.annotationLevel) diff.annotation_level = current.annotationLevel as EditListingData['annotation_level'];
        if (original.price !== current.price) diff.price = Number(current.price);
        if (original.description !== current.description) diff.description = current.description;
        if (original.has_notes !== current.has_notes) diff.has_notes = Boolean(current.has_notes)

        return diff;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form || !original) return;

        setSaving(true);
        
        setErrors({});

        try {
            
            let newUrls: string[] = [];
            if (form.images.length > 0) {
                const result = await uploadImages(Array.from(form.images));
                newUrls = result.urls;
            }

            const replacementUrls = new Map<number, string>()
            if (pendingExistingReplacements.size > 0) {
                const indices = Array.from(pendingExistingReplacements.keys())
                const files = indices.map((i) => pendingExistingReplacements.get(i)!)
                const { urls } = await uploadImages(files)
                indices.forEach((originalIndex, i) => {
                    if (urls[i]) replacementUrls.set(originalIndex, urls[i])
                })
            }

            const finalExisting: string[] = []
            existingImageUrls.forEach((currentUrl, i) => {
                const replacement = replacementUrls.get(i)
                if (replacement) {
                    finalExisting.push(replacement)
                } else if (!currentUrl.startsWith('blob:')) {
                    finalExisting.push(currentUrl)
                }
            })

            const finalPhotoUrls = [...finalExisting, ...newUrls]

            const photoChanged =
                newUrls.length > 0 ||
                pendingExistingReplacements.size > 0 ||
                existingImageUrls.length !== originalPhotoUrls.length

            const diff = buildDiff(original, form, listingId);
            if (photoChanged) {
                diff.photo_urls = finalPhotoUrls;
            }

            await editListing(diff);
            setSuccess(true);

        } catch (err) {
            console.error('failed to edit', err);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-4 text-gray-500">Loading listing...</div>

    return (
        <form onSubmit={handleSubmit} className="px-4 space-y-3">

            {SECTIONS.map(({ key, title }) => (
                <AccordionSection
                    key={key}
                    title={title}
                    isOpen={!success && openSections[key]}
                    OnToggle={() => toggleSection(key)}
                >
                    {key === "bookDetails" && form && (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400">
                                Book details are shared across listings and they cannot be edited directly
                            </p>
                            <Fields label="Title" value={form.bookName} />
                            <Fields label="Author" value={form.author} />
                            <Fields label="ISBN" value={form.isbn} />
                            <Fields label="Edition" value={form.edition} />
                            <Fields label="Publisher" value={form.publisher} />
                        </div>
                    )}

                    {key === "moduleDetails" && form && (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400">
                                Book details are shared across listings and they cannot be edited directly
                            </p>
                            <Fields label="Code" value={form.code} />
                            <Fields label="Name" value={form.name} />
                            <Fields label="Faculty" value={form.faculty} />
                            <Fields label="Semester" value={form.semester} />
                        </div>
                    )}

                    {key === "images" && existingImageUrls.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current images</p>
                            <p className="text-xs text-gray-500 mb-3">
                                Tap <span className="font-semibold text-[#00B4D8]">Crop</span> on any photo to adjust its framing or remove its background.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {existingImageUrls.map((url, index) => (
                                    <div key={`${url}-${index}`} className="relative group">
                                        <div className="relative w-full h-32 rounded overflow-hidden">
                                            <Image
                                                src={url}
                                                alt={`existing-${index + 1}`}
                                                fill
                                                className="object-cover"
                                                unoptimized={url.startsWith('blob:')}
                                            />
                                        </div>

                                        <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                            {index + 1}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(index)}
                                            aria-label={`Remove photo ${index + 1}`}
                                            className="absolute top-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white text-sm leading-none shadow-md hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                        >
                                            ×
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openCropExisting(index)}
                                            aria-label={`Crop photo ${index + 1}`}
                                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-[#00B4D8] bg-white px-3 py-2 text-xs font-semibold text-[#00B4D8] transition-colors hover:bg-[#00B4D8] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B4D8] min-h-[44px]"
                                        >
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 4h4v4H4V4zm12 12h4v4h-4v-4z"
                                                />
                                            </svg>
                                            Crop
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {key === "listingDetails" && form && (
                        <ListingForm
                            step={3}
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                            onImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                        />
                    )}

                    {key === "images" && form && (
                        <ListingForm
                            step={4}
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                            onImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                        />
                    )}
                </AccordionSection>
            ))}

            <div className="py-4 flex justify-start gap-2">
                <Button
                    type="submit"
                    disabled={saving}
                    variant="primary"
                >
                    {saving ? "Saving..." : "Save changes"}
                </Button>
            </div>

            <Modal
                isOpen={cropTarget !== null}
                title="Adjust the corners"
                onClose={closeCrop}
            >
                {cropSourceUrl && (
                    <CornerCropEditor
                        imageUrl={cropSourceUrl}
                        onConfirm={handleCropConfirm}
                        onCancel={closeCrop}
                    />
                )}
            </Modal>

            <Modal
                isOpen={success}
                title="Updated Successfully!!"
                onClose={() => {
                    setSuccess(false);
                    router.push('/listings/mine');
                }}
            >
                <p>
                    Your Listing has been successfully edited
                </p>
            </Modal>
        </form>
    )
}