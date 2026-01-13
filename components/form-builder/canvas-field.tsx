"use client"

import { FormField } from "./types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react"

interface CanvasFieldProps {
    field: FormField
    isSelected: boolean
    onClick: () => void
    onDelete: (e: React.MouseEvent) => void
    onMoveUp: (e: React.MouseEvent) => void
    onMoveDown: (e: React.MouseEvent) => void
    isFirst: boolean
    isLast: boolean
}

export function CanvasField({
    field,
    isSelected,
    onClick,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast
}: CanvasFieldProps) {

    const renderPreview = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
                return <Input disabled placeholder={field.placeholder} className="bg-white/50 dark:bg-black/20" />
            case 'textarea':
                return <Textarea disabled placeholder={field.placeholder} className="bg-white/50 dark:bg-black/20 h-24" />
            case 'file':
                return (
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                                <span className="text-xs font-medium">{field.placeholder || "Click to upload file"}</span>
                            </div>
                        </div>
                    </div>
                )
            case 'number':
                return <Input type="number" disabled placeholder={field.placeholder} className="bg-white/50 dark:bg-black/20" />
            case 'dropdown':
                return (
                    <Select disabled>
                        <SelectTrigger className="bg-white/50 dark:bg-black/20">
                            <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                    </Select>
                )
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox disabled id={`preview-${field.id}`} />
                        <label htmlFor={`preview-${field.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {field.placeholder || "Checkbox option"}
                        </label>
                    </div>
                )
            case 'radio':
                return (
                    <RadioGroup disabled defaultValue={field.options?.[0]}>
                        {field.options && field.options.length > 0 ? (
                            field.options.map((opt, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt} id={`preview-${field.id}-${i}`} />
                                    <Label htmlFor={`preview-${field.id}-${i}`}>{opt}</Label>
                                </div>
                            ))
                        ) : (
                            // Fallback if no options
                            <>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="1" />
                                    <Label>Option 1</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="2" />
                                    <Label>Option 2</Label>
                                </div>
                            </>
                        )}
                    </RadioGroup>
                )
            case 'section':
                return (
                    <div className="w-full py-4 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-dashed border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-black/20 px-4 text-sm text-gray-500 font-medium">Page Break</span>
                        </div>
                        {field.placeholder && (
                            <div className="mt-2 text-center text-xs text-gray-400">
                                {field.placeholder}
                            </div>
                        )}
                    </div>
                )
            default:
                return <Input disabled placeholder={field.placeholder} className="bg-white/50 dark:bg-black/20" />
        }
    }

    return (
        <div
            onClick={onClick}
            className={`relative group rounded-xl transition-all cursor-pointer ${field.type === 'section' ? 'p-2 my-4 border-2 border-transparent hover:border-gray-200' : 'p-4 border-2'} ${isSelected
                ? "border-[#6C5DD3] bg-[#6C5DD3]/5 ring-2 ring-[#6C5DD3]/20"
                : field.type !== 'section' ? "border-transparent hover:border-gray-200 bg-white/40 dark:bg-white/5" : ""
                }`}
        >
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-[#6C5DD3]"
                    onClick={onMoveUp}
                    disabled={isFirst}
                >
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-[#6C5DD3]"
                    onClick={onMoveDown}
                    disabled={isLast}
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className={`space-y-2 pointer-events-none ${field.type === 'section' ? 'w-full' : ''}`}>
                {field.type !== 'section' && (
                    <Label className="text-sm font-semibold flex gap-1 text-[#11142D] dark:text-gray-200">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                    </Label>
                )}
                {renderPreview()}
            </div>
        </div>
    )
}
