"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FieldPalette } from "./field-palette"
import { FormCanvas } from "./form-canvas"
import { FieldEditorPanel } from "./field-editor-panel"
import { FormPreviewModal } from "./form-preview-modal"
import { FormField } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Save, Eye } from "lucide-react"
import { toast } from "sonner"

export function FormBuilder() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const workspaceId = params.id as string
    const templateId = searchParams.get('template')

    const [fields, setFields] = useState<FormField[]>([])
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [submitLabel, setSubmitLabel] = useState("Submit Registration")
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
    const [templateName, setTemplateName] = useState("")
    const [templateDescription, setTemplateDescription] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Load existing template data when editing
    useEffect(() => {
        if (templateId) {
            loadTemplate()
        }
    }, [templateId])

    const loadTemplate = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/form-templates/${templateId}`)
            if (!response.ok) throw new Error('Failed to load template')

            const template = await response.json()
            setTemplateName(template.name || "")
            setTemplateDescription(template.description || "")
            setFields(template.fields || [])
            setSubmitLabel(template.submitLabel || "Submit Registration")
        } catch (error) {
            toast.error('Failed to load template')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddField = (type: string) => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type,
            label: `New ${type} field`,
            required: false,
            placeholder: `Enter ${type}...`,
            options: ['Option 1', 'Option 2']
        }
        setFields(prev => [...prev, newField])
        setSelectedFieldId(newField.id)
    }

    const handleMoveField = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === fields.length - 1) return

        const newFields = [...fields]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        const temp = newFields[index]
        newFields[index] = newFields[targetIndex]
        newFields[targetIndex] = temp

        setFields(newFields)
    }

    const handleUpdateField = (updatedField: FormField) => {
        setFields(prev => prev.map(f => f.id === selectedFieldId ? updatedField : f))

        // If ID changed, update the selection too
        if (selectedFieldId !== null && selectedFieldId !== updatedField.id) {
            setSelectedFieldId(updatedField.id)
        }
    }

    const handleDeleteField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id))
        if (selectedFieldId === id) setSelectedFieldId(null)
    }

    const handleSave = async () => {
        if (fields.length === 0) {
            toast.error('Please add at least one field to the form')
            return
        }

        if (!templateName.trim()) {
            setIsSaveDialogOpen(true)
            return
        }

        setIsSaving(true)
        try {
            const url = templateId
                ? `/api/workspaces/${workspaceId}/form-templates/${templateId}`
                : `/api/workspaces/${workspaceId}/form-templates`

            const method = templateId ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: templateName,
                    description: templateDescription,
                    fields,
                    submitLabel
                })
            })

            if (!response.ok) throw new Error('Failed to save template')

            toast.success(templateId ? 'Template updated successfully' : 'Template created successfully')
            router.push(`/workspaces/${workspaceId}/templates`)
        } catch (error) {
            toast.error('Failed to save template')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveWithName = async () => {
        if (!templateName.trim()) {
            toast.error('Please enter a template name')
            return
        }
        setIsSaveDialogOpen(false)
        await handleSave()
    }

    const selectedField = fields.find(f => f.id === selectedFieldId) || null

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-120px)] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 border-4 border-[#6C5DD3]/30 border-t-[#6C5DD3] rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500">Loading template...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        {templateId ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {templateId
                            ? `Editing: ${templateName || 'Untitled Template'}`
                            : 'Design your registration flow'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 rounded-full border-gray-200 dark:border-gray-700 hover:border-[#6C5DD3] hover:text-[#6C5DD3] transition-colors"
                        onClick={() => setIsPreviewOpen(true)}
                        disabled={fields.length === 0}
                    >
                        <Eye className="h-4 w-4" /> Preview
                    </Button>
                    <Button
                        className="gap-2 rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/25 transition-all hover:scale-105 active:scale-95"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : (templateId ? 'Update' : 'Save Form')}
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 h-full min-h-0">
                <div className="col-span-12 md:col-span-3 lg:col-span-3 h-full min-h-0 flex flex-col">
                    <div className="flex-1 overflow-hidden rounded-[24px]">
                        <FieldPalette onAddField={handleAddField} />
                    </div>
                </div>

                <div className="col-span-12 md:col-span-6 lg:col-span-6 h-full min-h-0 flex flex-col">
                    <div className="flex-1 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gray-50/50 dark:bg-black/20 rounded-[32px] border border-gray-200/50 dark:border-white/5 backdrop-blur-sm -z-10" />
                        <FormCanvas
                            fields={fields}
                            onSelectField={setSelectedFieldId}
                            selectedFieldId={selectedFieldId}
                            onDeleteField={handleDeleteField}
                            onMoveField={handleMoveField}
                            submitLabel={submitLabel}
                        />
                    </div>
                </div>

                <div className="col-span-12 md:col-span-3 h-full min-h-0 flex flex-col">
                    <div className="flex-1 overflow-hidden rounded-[24px]">
                        <FieldEditorPanel
                            field={selectedField}
                            onUpdate={handleUpdateField}
                            onDelete={handleDeleteField}
                            submitLabel={submitLabel}
                            onUpdateSubmitLabel={setSubmitLabel}
                        />
                    </div>
                </div>
            </div>

            <FormPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fields={fields}
                submitLabel={submitLabel}
            />

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Form Template</DialogTitle>
                        <DialogDescription>
                            Give your form template a name and description
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Student Registration"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of this form"
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveWithName} disabled={!templateName.trim()}>
                            Save Template
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
