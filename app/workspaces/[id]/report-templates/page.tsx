"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Edit, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ReportTemplate {
    id: string
    name: string
    description: string | null
    templateType: string
    isDefault: boolean
    createdAt: string
}

export default function ReportTemplatesPage() {
    const params = useParams()
    const workspaceId = params.id as string

    const [templates, setTemplates] = useState<ReportTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        templateType: 'GENERIC',
        isDefault: false
    })

    useEffect(() => {
        fetchTemplates()
    }, [workspaceId])

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/templates`)
            if (!response.ok) throw new Error('Failed to fetch templates')
            const data = await response.json()
            setTemplates(data)
        } catch (error) {
            console.error('Error fetching templates:', error)
            toast.error('Failed to load templates')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingTemplate
                ? `/api/workspaces/${workspaceId}/templates/${editingTemplate.id}`
                : `/api/workspaces/${workspaceId}/templates`

            const method = editingTemplate ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Failed to save template')

            toast.success(editingTemplate ? 'Template updated' : 'Template created')
            setDialogOpen(false)
            resetForm()
            fetchTemplates()
        } catch (error) {
            console.error('Error saving template:', error)
            toast.error('Failed to save template')
        }
    }

    const handleDelete = async (templateId: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return

        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/templates/${templateId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete template')

            toast.success('Template deleted')
            fetchTemplates()
        } catch (error) {
            console.error('Error deleting template:', error)
            toast.error('Failed to delete template')
        }
    }

    const handleEdit = (template: ReportTemplate) => {
        setEditingTemplate(template)
        setFormData({
            name: template.name,
            description: template.description || '',
            templateType: template.templateType,
            isDefault: template.isDefault
        })
        setDialogOpen(true)
    }

    const resetForm = () => {
        setEditingTemplate(null)
        setFormData({
            name: '',
            description: '',
            templateType: 'GENERIC',
            isDefault: false
        })
    }

    const getTemplateTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'MINISTRY_REPORT': 'Ministry Report',
            'CONSTRUCTION_REPORT': 'Construction Report',
            'TRAINING_REPORT': 'Training Report',
            'GENERIC': 'Generic',
            'CUSTOM': 'Custom'
        }
        return labels[type] || type
    }

    const getTemplateTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'MINISTRY_REPORT': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'CONSTRUCTION_REPORT': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            'TRAINING_REPORT': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'GENERIC': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            'CUSTOM': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        }
        return colors[type] || colors['GENERIC']
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        Report Templates
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Manage PDF report templates for this workspace
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm()
                        setDialogOpen(true)
                    }}
                    className="rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/25"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                </Button>
            </div>

            {/* Templates List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3] mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Loading templates...</p>
                </div>
            ) : templates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No report templates yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Create your first PDF report template to get started
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {template.name}
                                            {template.isDefault && (
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </CardTitle>
                                        {template.description && (
                                            <CardDescription className="mt-1">
                                                {template.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Badge className={getTemplateTypeColor(template.templateType)}>
                                        {getTemplateTypeLabel(template.templateType)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(template)}
                                        className="flex-1"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(template.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? 'Edit Template' : 'Create Template'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTemplate
                                ? 'Update the template details below'
                                : 'Create a new PDF report template for this workspace'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Monthly Activity Report"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this template..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="templateType">Template Type</Label>
                                <Select
                                    value={formData.templateType}
                                    onValueChange={(value) => setFormData({ ...formData, templateType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MINISTRY_REPORT">Ministry Report</SelectItem>
                                        <SelectItem value="CONSTRUCTION_REPORT">Construction Report</SelectItem>
                                        <SelectItem value="TRAINING_REPORT">Training Report</SelectItem>
                                        <SelectItem value="GENERIC">Generic</SelectItem>
                                        <SelectItem value="CUSTOM">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                                    Set as default template for this workspace
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-[#6C5DD3] hover:bg-[#5b4eb3]">
                                {editingTemplate ? 'Update' : 'Create'} Template
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
