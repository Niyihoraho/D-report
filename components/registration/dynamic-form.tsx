import { useState, useMemo, useEffect, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { FormField } from "@/components/form-builder/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { ChevronRight, ChevronLeft, Upload, Loader2, X, Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DynamicFormProps {
    fields: FormField[]
    onSubmit: (data: any) => void
    submitLabel?: string
    initialData?: any
}

export function DynamicForm({ fields, onSubmit, submitLabel = "Submit Registration", initialData }: DynamicFormProps) {
    const { register, handleSubmit, control, trigger, reset, formState: { errors } } = useForm()
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        // Reset form with initialData, or reset to empty if no initialData
        reset(initialData || {})
    }, [initialData, reset])

    const steps = useMemo(() => {
        const stepsList: { title?: string; description?: string; fields: FormField[] }[] = []
        let currentStepFields: FormField[] = []
        let currentStepTitle: string | undefined = undefined
        let currentStepDesc: string | undefined = undefined

        fields.forEach((field) => {
            if (field.type === 'section') {
                if (currentStepFields.length > 0 || stepsList.length === 0) {
                    stepsList.push({
                        title: currentStepTitle,
                        description: currentStepDesc,
                        fields: currentStepFields
                    })
                }
                currentStepFields = []
                currentStepTitle = field.label
                currentStepDesc = field.placeholder
            } else {
                currentStepFields.push(field)
            }
        })

        // Push final step
        stepsList.push({
            title: currentStepTitle,
            description: currentStepDesc,
            fields: currentStepFields
        })

        // Filter out empty steps if any (e.g. if section break is last item, though that might be valid for just info)
        return stepsList.filter(step => step.fields.length > 0 || step.title)
    }, [fields])

    const handleFormSubmit = (data: any) => {
        onSubmit(data)
    }

    const onInvalid = () => {
        toast.error("Please fill in all required fields.")
    }

    const handleNext = async () => {
        const currentFields = steps[currentStep].fields
        const isValid = await trigger(currentFields.map(f => f.id))

        if (isValid) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            toast.error("Please fill in all required fields to continue.")
        }
    }

    const handleBack = () => {
        setCurrentStep(prev => prev - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!fields || fields.length === 0) {
        return <div className="text-center py-10 text-gray-500">No fields configured for this form.</div>
    }

    const currentStepData = steps[currentStep]
    const isLastStep = currentStep === steps.length - 1

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Allow Enter in Textarea
            if (e.target instanceof HTMLTextAreaElement) return

            e.preventDefault()

            // Move to next step if not last step
            if (!isLastStep) {
                handleNext()
            }
        }
    }

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit, onInvalid)}
            className="space-y-6"
            onKeyDown={handleKeyDown}
        >
            {/* Step Progress Indicator (only if multiple steps) */}
            {steps.length > 1 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Step {currentStep + 1} of {steps.length}</span>
                        <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Completed</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#6C5DD3] transition-all duration-300 ease-in-out"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Step Header */}
            {(currentStepData.title || currentStepData.description) && (
                <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    {currentStepData.title && (
                        <h3 className="text-xl font-bold text-[#11142D] dark:text-white mb-1">
                            {currentStepData.title}
                        </h3>
                    )}
                    {currentStepData.description && (
                        <p className="text-sm text-gray-500">
                            {currentStepData.description}
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {currentStepData.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-[#11142D] dark:text-white font-medium">
                            {field.label} <span className="text-red-500">*</span>
                        </Label>

                        {field.type === 'text' && (
                            <Input
                                id={field.id}
                                placeholder={field.placeholder}
                                {...register(field.id, { required: true })}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 focus:border-[#6C5DD3] transition-colors"
                            />
                        )}

                        {field.type === 'email' && (
                            <Input
                                type="email"
                                id={field.id}
                                placeholder={field.placeholder}
                                {...register(field.id, { required: true })}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 focus:border-[#6C5DD3] transition-colors"
                            />
                        )}

                        {field.type === 'textarea' && (
                            <Textarea
                                id={field.id}
                                placeholder={field.placeholder}
                                {...register(field.id, { required: true })}
                                className="min-h-[120px] rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 focus:border-[#6C5DD3] transition-colors"
                            />
                        )}

                        {field.type === 'number' && (
                            <Input
                                type="number"
                                id={field.id}
                                placeholder={field.placeholder}
                                {...register(field.id, { required: true, valueAsNumber: true })}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 focus:border-[#6C5DD3] transition-colors"
                            />
                        )}

                        {field.type === 'dropdown' && (
                            <Controller
                                control={control}
                                name={field.id}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <Select onValueChange={onChange} defaultValue={value}>
                                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800">
                                            <SelectValue placeholder={field.placeholder || "Select option"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        )}

                        {field.type === 'radio' && (
                            <Controller
                                control={control}
                                name={field.id}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <RadioGroup onValueChange={onChange} defaultValue={value} className="flex flex-col space-y-2 mt-2">
                                        {field.options?.map((opt, i) => (
                                            <div key={i} className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                                                <Label htmlFor={`${field.id}-${i}`} className="font-normal cursor-pointer text-gray-600 dark:text-gray-300">
                                                    {opt}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                        )}

                        {field.type === 'date' && (
                            <Controller
                                control={control}
                                name={field.id}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <DatePickerField
                                        value={value}
                                        onChange={onChange}
                                        placeholder={field.placeholder || "Pick a date"}
                                    />
                                )}
                            />
                        )}

                        {field.type === 'checkbox' && (
                            <div className="flex items-center space-x-3 mt-2">
                                <Controller
                                    control={control}
                                    name={field.id}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <Checkbox
                                            id={field.id}
                                            checked={value}
                                            onCheckedChange={onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor={field.id} className="font-normal cursor-pointer text-gray-600 dark:text-gray-300 m-0">
                                    {field.placeholder || field.label}
                                </Label>
                            </div>
                        )}

                        {field.type === 'file' && (
                            <Controller
                                control={control}
                                name={field.id}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <FileUploadField
                                        value={value}
                                        onChange={onChange}
                                        label={field.placeholder || "Click to upload file"}
                                    />
                                )}
                            />
                        )}

                        {/* Basic fallback for other types */}
                        {!['text', 'email', 'dropdown', 'number', 'radio', 'date', 'checkbox', 'section', 'file', 'textarea'].includes(field.type) && (
                            <Input
                                id={field.id}
                                placeholder={field.placeholder}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                            />
                        )}


                    </div>
                ))}
            </div>

            <div className="flex gap-4 mt-8 pt-4">
                {currentStep > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 h-12 rounded-xl border-gray-200 dark:border-gray-800 hover:text-[#6C5DD3] hover:border-[#6C5DD3]"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                )}

                {isLastStep ? (
                    <Button
                        type="submit"
                        className="flex-1 h-12 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb3] text-lg font-semibold shadow-lg shadow-[#6C5DD3]/25"
                    >
                        {submitLabel}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 h-12 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb3] text-lg font-semibold shadow-lg shadow-[#6C5DD3]/25"
                    >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </form>
    )
}

function DatePickerField({ value, onChange, placeholder }: { value: string | undefined, onChange: (val: string) => void, placeholder: string }) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                        "w-full h-12 rounded-xl justify-start text-left font-normal border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date: Date | undefined) => {
                        onChange(date ? date.toISOString().split('T')[0] : '')
                        setOpen(false) // Close on select
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

function FileUploadField({ value, onChange, label }: { value?: string, onChange: (url: string | null) => void, label: string }) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            onChange(data.url)
            toast.success("File uploaded")
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload file")
        } finally {
            setUploading(false)
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const triggerUpload = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent any form submission
        fileInputRef.current?.click()
    }

    const isImage = value?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

    if (value) {
        return (
            <div className="relative group rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-white/5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                        <Upload className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                            {value.split('/').pop() || "File uploaded"}
                        </p>
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#6C5DD3] hover:underline truncate block"
                        >
                            View file
                        </a>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => onChange(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {isImage && (
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-auto max-h-[300px] object-contain"
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
            />
            <Button
                type="button"
                onClick={triggerUpload}
                variant="outline"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-700 hover:border-[#6C5DD3] hover:bg-[#6C5DD3]/5"
                    }`}
                disabled={uploading}
            >
                {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#6C5DD3]" />
                ) : (
                    <>
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">{label}</span>
                    </>
                )}
            </Button>
        </div>
    )
}
