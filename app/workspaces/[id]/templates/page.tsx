"use client"

import { Button } from "@/components/ui/button"
import { Plus, FileText, Pencil, Trash2, Eye, Copy, ExternalLink, MoreHorizontal, PlayCircle } from "lucide-react"
import { IconLayoutDashboard, IconClock } from "@tabler/icons-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FormPreviewModal } from "@/components/form-builder/form-preview-modal"
import { DeleteModal } from "@/components/delete-modal"

interface FormTemplate {
    id: string
    name: string
    description: string | null
    fields: any[]
    fieldCount?: number
    status: string
    submitLabel?: string
    updatedAt: string
}

export default function TemplatesPage() {
    const params = useParams()
    const workspaceId = params.id as string
    const [templates, setTemplates] = useState<FormTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null)
    const [itemToDelete, setItemToDelete] = useState<FormTemplate | null>(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null)

    useEffect(() => {
        fetchTemplates()
        fetchWorkspace()
    }, [])

    const fetchWorkspace = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}`)
            if (!response.ok) throw new Error('Failed to fetch workspace')
            const data = await response.json()
            setWorkspaceSlug(data.slug)
        } catch (error) {
            console.error('Failed to load workspace slug')
        }
    }

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/form-templates`)
            if (!response.ok) throw new Error('Failed to fetch templates')
            const data = await response.json()
            setTemplates(data)
        } catch (error) {
            toast.error('Failed to load templates')
        } finally {
            setLoading(false)
        }
    }

    const handleActivate = async (templateId: string) => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/form-templates/${templateId}/activate`, {
                method: 'POST'
            })

            if (!response.ok) throw new Error('Failed to activate template')

            toast.success('Template activated successfully')
            fetchTemplates()
        } catch (error) {
            toast.error('Failed to activate template')
        }
    }

    const copyPublicLink = (slug: string) => {
        const link = `${window.location.origin}/register/${slug}`
        navigator.clipboard.writeText(link)
        toast.success('Public link copied to clipboard!')
    }

    const handleDeleteClick = (template: FormTemplate) => {
        setItemToDelete(template)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return

        setIsDeleteLoading(true)
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/form-templates/${itemToDelete.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete')

            toast.success('Template deleted successfully')
            setTemplates(prev => prev.filter(t => t.id !== itemToDelete.id))
            setItemToDelete(null)
        } catch (error) {
            toast.error('Failed to delete template')
        } finally {
            setIsDeleteLoading(false)
        }
    }

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 60) return `${diffMins} minutes ago`
        if (diffHours < 24) return `${diffHours} hours ago`
        if (diffDays < 7) return `${diffDays} days ago`
        return `${Math.floor(diffDays / 7)} weeks ago`
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading templates...</div>
    }

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        Registration Forms
                    </h1>
                    <p className="text-gray-500 mt-2">Manage registration forms and share public links</p>
                </div>
                <Button asChild className="rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/25 px-6">
                    <Link href={`/workspaces/${workspaceId}/registration`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Form
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="glass-card rounded-[24px] p-6 group hover:-translate-y-1 hover:shadow-2xl hover:border-[#6C5DD3]/30 border border-white/20 dark:border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                        {/* Blob Background Effect */}
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-32 w-32 bg-[#6C5DD3]/10 blur-3xl rounded-full absolute -top-10 -right-10 pointer-events-none" />
                        </div>

                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-5 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#6C5DD3]/10 to-[#6C5DD3]/5 flex items-center justify-center text-[#6C5DD3] group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                <FileText className="h-6 w-6" />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-card w-48">
                                    <DropdownMenuItem onClick={() => setPreviewTemplate(template)} className="cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" /> Preview
                                    </DropdownMenuItem>
                                    {template.status !== 'Active' && (
                                        <DropdownMenuItem onClick={() => handleActivate(template.id)} className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600">
                                            <PlayCircle className="mr-2 h-4 w-4" /> Activate
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleDeleteClick(template)}
                                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-[#11142D] dark:text-white group-hover:text-[#6C5DD3] transition-colors line-clamp-1">
                                    {template.name}
                                </h3>
                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${template.status === 'Active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 ring-1 ring-green-600/20'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-gray-500/20'
                                    }`}>
                                    {template.status}
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10 leading-relaxed">
                                {template.description || 'No description provided for this template.'}
                            </p>

                            {/* Public Link for Active Templates */}
                            {template.status === 'Active' && workspaceSlug && (
                                <div className="mb-6 p-1 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 flex items-center pr-1 gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#1F2128] flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                        <ExternalLink className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-medium text-gray-400 truncate">Public Link</p>
                                        <p className="text-xs font-semibold text-[#11142D] dark:text-white truncate">.../register/{workspaceSlug}</p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-[#1F2128] hover:shadow-sm text-gray-400 hover:text-[#6C5DD3]"
                                        onClick={() => copyPublicLink(workspaceSlug)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/5 relative z-10">
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <IconLayoutDashboard className="h-3.5 w-3.5" />
                                    <span>{template.fieldCount || template.fields?.length || 0} Fields</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <IconClock className="h-3.5 w-3.5" />
                                    <span>{getRelativeTime(template.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Primary Action Button */}
                        <Button
                            asChild
                            className="w-full mt-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-[#11142D] hover:bg-[#6C5DD3] dark:hover:bg-[#6C5DD3] dark:hover:text-white shadow-lg transition-all duration-300 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"
                        >
                            <Link href={`/workspaces/${workspaceId}/registration?template=${template.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Template
                            </Link>
                        </Button>
                    </div>
                ))}

                {/* Empty State / Add New Placeholder */}
                <Link href={`/workspaces/${workspaceId}/registration`} className="group cursor-pointer">
                    <div className="h-full min-h-[250px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[24px] flex flex-col items-center justify-center gap-4 text-gray-400 transition-all duration-300 group-hover:border-[#6C5DD3] group-hover:bg-[#6C5DD3]/5 group-hover:-translate-y-1 group-hover:shadow-lg">
                        <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-[#6C5DD3] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-[#6C5DD3]/30">
                            <Plus className="h-8 w-8" />
                        </div>
                        <p className="font-medium group-hover:text-[#6C5DD3] transition-colors">Create New Template</p>
                    </div>
                </Link>
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <FormPreviewModal
                    isOpen={!!previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                    fields={previewTemplate.fields || []}
                    submitLabel={previewTemplate.submitLabel || "Submit"}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Template"
                description="Are you sure you want to delete this form template? This action cannot be undone and any collected data associated with an old version might be affected."
                itemName={itemToDelete?.name}
                loading={isDeleteLoading}
            />
        </div>
    )
}
