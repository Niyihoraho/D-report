"use client"

import { useState } from "react"
import { BreadcrumbNav } from "@/components/BreadcrumbNav"
import { Button } from "@/components/ui/button"
import { IconPlus, IconDeviceFloppy, IconDeviceMobile, IconBrowser } from "@tabler/icons-react"
import { FieldEditor, FieldConfig } from "@/components/forms/FieldEditor"
import { updateMemberSchema } from "@/app/actions/schema"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

interface MemberSchemaPageProps {
    schema: any
}

export default function MemberSchemaClientPage({ schema: initialSchema }: MemberSchemaPageProps) {
    const [fields, setFields] = useState<FieldConfig[]>(Array.isArray(initialSchema) ? initialSchema : [])
    const [isSaving, setIsSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')

    const addField = () => {
        const newField: FieldConfig = {
            id: crypto.randomUUID(),
            key: `field_${fields.length + 1}`,
            label: "New Field",
            type: "text",
            required: false
        }
        setFields([...fields, newField])
    }

    const updateField = (index: number, updatedField: FieldConfig) => {
        const newFields = [...fields]
        newFields[index] = updatedField
        setFields(newFields)
    }

    const removeField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index)
        setFields(newFields)
    }

    const handleSave = async () => {
        setIsSaving(true)
        const result = await updateMemberSchema(fields)
        if (result.success) {
            toast.success("Schema saved successfully")
        } else {
            toast.error("Failed to save schema")
        }
        setIsSaving(false)
    }

    return (
        <div className="min-h-screen pb-20">
            <BreadcrumbNav
                items={[
                    { label: "Dashboard", href: "/admin/dashboard" },
                    { label: "Settings", href: "/admin/settings" },
                    { label: "Member Schema" }
                ]}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#11142D] dark:text-white">Form Builder</h1>
                    <p className="text-gray-500 mt-2">Design the registration form for your members</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white rounded-full px-8 h-12 shadow-lg shadow-[#6C5DD3]/20 transition-all hover:scale-105"
                >
                    <IconDeviceFloppy className="mr-2 h-5 w-5" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: EDITOR */}
                <div className="lg:col-span-7 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {fields.map((field, index) => (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                layout
                            >
                                <FieldEditor
                                    field={field}
                                    onChange={(updated) => updateField(index, updated)}
                                    onDelete={() => removeField(index)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <motion.div layout>
                        <Button
                            onClick={addField}
                            variant="outline"
                            className="w-full border-dashed border-2 py-8 text-gray-400 hover:text-[#6C5DD3] hover:border-[#6C5DD3] hover:bg-[#E4D7FF]/10 rounded-2xl transition-all"
                        >
                            <IconPlus className="mr-2 h-5 w-5" />
                            Add New Field
                        </Button>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="lg:col-span-5 sticky top-24">
                    <div className="bg-white dark:bg-[#1F2128] rounded-[30px] p-1 shadow-xl border border-gray-100 dark:border-gray-800">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <span className="font-semibold text-gray-900 dark:text-white">Live Preview</span>
                            <div className="flex bg-gray-100 dark:bg-[#2C2F36] rounded-full p-1">
                                <button
                                    onClick={() => setPreviewMode('mobile')}
                                    className={`p-2 rounded-full transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-[#1F2128] shadow-sm text-[#6C5DD3]' : 'text-gray-400'}`}
                                >
                                    <IconDeviceMobile className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewMode('desktop')}
                                    className={`p-2 rounded-full transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-[#1F2128] shadow-sm text-[#6C5DD3]' : 'text-gray-400'}`}
                                >
                                    <IconBrowser className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Preview Canvas */}
                        <div className={`transition-all duration-300 mx-auto bg-gray-50 dark:bg-[#0F111A] flex items-center justify-center py-8 ${previewMode === 'mobile' ? 'max-w-[375px] ' : 'w-full'}`}>

                            {/* The "Device" Frame */}
                            <div className={`bg-white dark:bg-[#1F2128] w-full shadow-2xl overflow-hidden transition-all duration-300 ${previewMode === 'mobile' ? 'rounded-[30px] border-[8px] border-gray-900' : 'rounded-none border-0 min-h-[500px]'}`}>

                                {/* Fake Mobile Header */}
                                {previewMode === 'mobile' && (
                                    <div className="h-7 bg-gray-900 w-full flex justify-center items-center">
                                        <div className="w-16 h-4 bg-black rounded-b-xl"></div>
                                    </div>
                                )}

                                <div className="p-6 h-full min-h-[500px] overflow-y-auto">
                                    {/* Brand Header inside preview */}
                                    <div className="text-center mb-8">
                                        <div className="h-12 w-12 bg-[#6C5DD3] rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                                            I
                                        </div>
                                        <h3 className="font-bold text-lg dark:text-white">Create Account</h3>
                                        <p className="text-xs text-gray-400">Join Member Portal</p>
                                    </div>

                                    <div className="space-y-4">
                                        {fields.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed rounded-xl">
                                                Add fields to see them here
                                            </div>
                                        ) : (
                                            fields.map((field) => (
                                                <motion.div
                                                    key={field.key}
                                                    className="space-y-1.5"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                                        {field.label} {field.required && <span className="text-[#EB5757] ml-0.5">*</span>}
                                                    </Label>

                                                    {field.type === 'select' ? (
                                                        <Select>
                                                            <SelectTrigger className="h-10 rounded-xl bg-gray-50 dark:bg-[#2C2F36] border-0 text-sm">
                                                                <SelectValue placeholder={`Select ${field.label}`} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {field.options?.map(opt => (
                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : field.type === 'textarea' ? (
                                                        <textarea
                                                            placeholder={field.placeholder || "Enter details..."}
                                                            className="w-full rounded-xl bg-gray-50 dark:bg-[#2C2F36] border-0 px-3 py-2 text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-[#6C5DD3]"
                                                        />
                                                    ) : (
                                                        <Input
                                                            type={field.type}
                                                            placeholder={field.placeholder || "..."}
                                                            className="h-10 rounded-xl bg-gray-50 dark:bg-[#2C2F36] border-0 text-sm focus:ring-2 focus:ring-[#6C5DD3]"
                                                        />
                                                    )}
                                                    {field.required && <p className="text-[10px] text-gray-400 opacity-0 group-focus-within:opacity-100 transition-opacity">This field is required</p>}
                                                </motion.div>
                                            ))
                                        )}

                                        <Button className="w-full h-11 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white font-medium mt-6 shadow-lg shadow-[#6C5DD3]/20">
                                            Register Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
