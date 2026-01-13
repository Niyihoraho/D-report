"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { FormField } from "./types"
import { GripVertical, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface SortableFieldProps {
    field: FormField
    isSelected: boolean
    onClick: () => void
}

export function SortableField({ field, isSelected, onClick }: SortableFieldProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: field.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const renderPreview = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
                return <Input disabled placeholder={field.placeholder || "Input text..."} className="bg-white/50" />
            case 'dropdown':
                return (
                    <Select disabled>
                        <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )
            case 'radio':
                return (
                    <RadioGroup disabled>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="r1" />
                            <Label htmlFor="r1">Option 1</Label>
                        </div>
                    </RadioGroup>
                )
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox id="c1" disabled />
                        <Label htmlFor="c1">Checkbox option</Label>
                    </div>
                )
            default:
                return <Input disabled placeholder="Text input" className="bg-white/50" />
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={`relative group p-4 rounded-xl border-2 transition-all ${isSelected
                    ? "border-[#6C5DD3] bg-[#6C5DD3]/5 ring-2 ring-[#6C5DD3]/20"
                    : "border-transparent hover:border-gray-200 bg-white/40 dark:bg-white/5"
                }`}
        >
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-gray-100 rounded">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="space-y-2 pointer-events-none">
                <Label className="text-sm font-semibold flex gap-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                </Label>
                {renderPreview()}
            </div>
        </div>
    )
}
