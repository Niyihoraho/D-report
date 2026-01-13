"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { IconTrash } from "@tabler/icons-react"

export type FieldType = "text" | "number" | "date" | "select" | "email" | "phone" | "textarea"

export interface FieldConfig {
    id: string
    key: string
    label: string
    type: FieldType
    required: boolean
    placeholder?: string
    options?: string[] // For select
}

interface FieldEditorProps {
    field: FieldConfig
    onChange: (field: FieldConfig) => void
    onDelete: () => void
}

export function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
    const handleChange = (key: keyof FieldConfig, value: any) => {
        onChange({ ...field, [key]: value })
    }

    return (
        <div className="p-4 border rounded-xl bg-white dark:bg-[#1F2128] dark:border-[#2C2F36] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">

                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-2">
                        <Label>Field Label</Label>
                        <Input
                            value={field.label}
                            onChange={(e) => handleChange("label", e.target.value)}
                            placeholder="e.g. Full Name"
                            className="rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Database Key</Label>
                        <Input
                            value={field.key}
                            onChange={(e) => handleChange("key", e.target.value)}
                            placeholder="e.g. fullName"
                            className="font-mono text-sm rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={field.type}
                            onValueChange={(val) => handleChange("type", val)}
                        >
                            <SelectTrigger className="rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="textarea">Long Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                        <Switch
                            checked={field.required}
                            onCheckedChange={(checked: boolean) => handleChange("required", checked)}
                        />
                        <Label>Required</Label>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-[#EB5757] hover:bg-[#FFE5E6] rounded-full shrink-0"
                >
                    <IconTrash className="h-5 w-5" />
                </Button>
            </div>

            {field.type === "select" && (
                <div className="bg-gray-50 dark:bg-[#2C2F36] p-3 rounded-lg">
                    <Label className="mb-2 block">Options (comma separated)</Label>
                    <Input
                        value={field.options?.join(", ") || ""}
                        onChange={(e) => handleChange("options", e.target.value.split(",").map(s => s.trim()))}
                        placeholder="Option 1, Option 2, Option 3"
                        className="rounded-lg bg-white dark:bg-[#1F2128]"
                    />
                </div>
            )}
        </div>
    )
}
