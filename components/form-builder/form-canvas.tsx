"use client"

import { FormField } from "./types"
import { CanvasField } from "./canvas-field"
import { Button } from "@/components/ui/button"

interface FormCanvasProps {
    fields: FormField[]
    onSelectField: (id: string | null) => void
    selectedFieldId: string | null
    onDeleteField: (id: string) => void
    onMoveField: (index: number, direction: 'up' | 'down') => void
    submitLabel?: string
}

export function FormCanvas({
    fields,
    onSelectField,
    selectedFieldId,
    onDeleteField,
    onMoveField,
    submitLabel = "Submit Registration"
}: FormCanvasProps) {

    return (
        <div className="flex-1 h-full min-h-[600px] flex flex-col">
            <div className="flex-1 glass-card rounded-[24px] p-8 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#11142D] dark:text-white">Registration Form</h2>
                    <p className="text-gray-500 text-sm">Click fields on the left to add them here</p>
                </div>

                {fields.length === 0 ? (
                    <div className="h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/5">
                        <p>Form is empty</p>
                        <p className="text-xs mt-2">Add fields from the palette to start building</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {fields.map((field, index) => (
                            <CanvasField
                                key={field.id}
                                field={field}
                                isSelected={field.id === selectedFieldId}
                                onClick={() => onSelectField(field.id)}
                                onDelete={(e) => {
                                    e.stopPropagation()
                                    onDeleteField(field.id)
                                }}
                                onMoveUp={(e) => {
                                    e.stopPropagation()
                                    onMoveField(index, 'up')
                                }}
                                onMoveDown={(e) => {
                                    e.stopPropagation()
                                    onMoveField(index, 'down')
                                }}
                                isFirst={index === 0}
                                isLast={index === fields.length - 1}
                            />
                        ))}
                    </div>
                )}

                {/* Submit Button Selection */}
                <div className="max-w-2xl mx-auto mt-8 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <div
                        onClick={() => onSelectField('submit_button')}
                        className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedFieldId === 'submit_button'
                            ? "border-[#6C5DD3] bg-[#6C5DD3]/5 ring-2 ring-[#6C5DD3]/20"
                            : "border-transparent hover:border-gray-200 bg-white/40 dark:bg-white/5"
                            }`}
                    >
                        <div className="pointer-events-none">
                            <Button className="w-full h-12 rounded-xl bg-[#6C5DD3] hover:bg-[#6C5DD3] text-lg font-semibold shadow-lg shadow-[#6C5DD3]/25 opacity-90">
                                {submitLabel}
                            </Button>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/5 rounded-xl">
                                <span className="text-xs font-medium bg-white dark:bg-black px-2 py-1 rounded-md shadow-sm">Click to Edit Label</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
