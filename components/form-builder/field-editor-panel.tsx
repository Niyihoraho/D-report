"use client"

import { FormField } from "./types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, Wand2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface FieldEditorPanelProps {
    field: FormField | null
    onUpdate: (field: FormField) => void
    onDelete: (id: string) => void
    submitLabel: string
    onUpdateSubmitLabel: (label: string) => void
}

export function FieldEditorPanel({ field, onUpdate, onDelete, submitLabel, onUpdateSubmitLabel }: FieldEditorPanelProps) {
    if (!field) {
        return (
            <div className="glass-card rounded-[24px] p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6 text-[#11142D] dark:text-white">
                    <h3 className="text-lg font-semibold">Form Settings</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Submit Button Label</Label>
                        <Input
                            value={submitLabel}
                            onChange={(e) => onUpdateSubmitLabel(e.target.value)}
                            placeholder="Submit Registration"
                            className="bg-white/50 dark:bg-black/20"
                        />
                        <p className="text-xs text-gray-500">The text displayed on the final submission button.</p>
                    </div>
                </div>

                <div className="mt-auto pt-6 text-center text-gray-400 text-sm">
                    Select a field to edit its specific properties
                </div>
            </div>
        )
    }

    const handleChange = (key: keyof FormField, value: any) => {
        onUpdate({ ...field, [key]: value })
    }

    const generateIdFromLabel = () => {
        if (!field.label) return
        // Convert label to camelCase (e.g. "Full Name" -> "fullName")
        const newId = field.label
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, "")

        onUpdate({ ...field, id: newId })
    }

    return (
        <div className="glass-card rounded-[24px] p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Edit Field</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(field.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {/* Field ID Management - Crucial for Template Mapping */}
                {/* Field ID Management - Compact Version */}
                <div className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs font-medium text-[#6C5DD3]">Field ID</Label>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-[#6C5DD3] hover:bg-[#6C5DD3]/10"
                                onClick={generateIdFromLabel}
                                disabled={!field.label}
                                title="Auto-generate from Label"
                            >
                                <Wand2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <Input
                        value={field.id}
                        onChange={(e) => handleChange('id', e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                        className="h-8 text-xs font-mono bg-white dark:bg-black/20"
                        placeholder="e.g. fullName"
                    />
                    <p className="text-[10px] text-gray-400 truncate">
                        Matches <span className="font-mono text-[#6C5DD3]">{`{{${field.id || 'id'}}}`}</span> key in Word templates
                    </p>
                </div>

                {field.type === 'section' ? (
                    <>
                        <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input
                                value={field.label}
                                onChange={(e) => handleChange('label', e.target.value)}
                                placeholder="e.g. Personal Information"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Section Description</Label>
                            <Textarea
                                value={field.placeholder || ''}
                                onChange={(e) => handleChange('placeholder', e.target.value)}
                                placeholder="Brief description of this section"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                                value={field.label}
                                onChange={(e) => handleChange('label', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input
                                value={field.placeholder || ''}
                                onChange={(e) => handleChange('placeholder', e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Required Field</Label>
                            <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => handleChange('required', checked)}
                            />
                        </div>

                        {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                            <div className="space-y-2">
                                <Label>Options (comma separated)</Label>
                                <Textarea
                                    value={field.options?.join(', ') || ''}
                                    onChange={(e) => handleChange('options', e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="Option 1, Option 2, Option 3"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
