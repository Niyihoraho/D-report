"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge, MemberStatus } from "./status-badge"
import { Member } from "./member-table"
import { FormField } from "@/components/form-builder/types"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface DataDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: Member | null
    workspaceId: string
    onUpdate?: () => void
}

export function DataDetailsModal({ isOpen, onClose, data, workspaceId, onUpdate }: DataDetailsModalProps) {
    const [template, setTemplate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (isOpen && data) {
            fetchActiveTemplate()
        }
    }, [isOpen, data, workspaceId])

    const fetchActiveTemplate = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/form-templates`)
            if (!response.ok) throw new Error('Failed to fetch templates')
            const templates = await response.json()
            const activeTemplate = templates.find((t: any) => t.status === 'Active')
            setTemplate(activeTemplate)
        } catch (error) {
            console.error('Error fetching template:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!data) return

        setUpdating(true)
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members/${data.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error('Failed to update status')

            toast.success(`Submission ${newStatus.toLowerCase()}`)
            onUpdate?.()
            onClose()
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    if (!data) return null

    const profileData = data.profileData || {}
    const formFields = template?.fields || []

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        Submission Details
                    </DialogTitle>
                    <DialogDescription>
                        View and manage form submission data
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <section className="glass-card rounded-[16px] p-4 space-y-3">
                        <h3 className="font-semibold text-[#11142D] dark:text-white flex items-center justify-between">
                            Basic Information
                            <StatusBadge status={data.status as MemberStatus} />
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium text-[#11142D] dark:text-white">
                                    {data.user.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium text-[#11142D] dark:text-white">
                                    {data.user.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                                <p className="font-medium text-[#11142D] dark:text-white">
                                    {new Date(data.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Role</p>
                                <p className="font-medium text-[#11142D] dark:text-white">
                                    {data.role}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Form Submission Data */}
                    <section className="glass-card rounded-[16px] p-4 space-y-3">
                        <h3 className="font-semibold text-[#11142D] dark:text-white">
                            Registration Form Data
                        </h3>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-[#6C5DD3]" />
                            </div>
                        ) : formFields.length > 0 ? (
                            <div className="space-y-4">
                                {formFields.map((field: FormField) => (
                                    <div key={field.id} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            {field.label}
                                        </p>
                                        <p className="font-medium text-[#11142D] dark:text-white">
                                            {profileData[field.id] || 'Not provided'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                                No form template found or no data submitted
                            </p>
                        )}
                    </section>

                    {/* Actions for Pending Submissions */}
                    {data.status === 'PENDING' && (
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={() => handleStatusChange('ACTIVE')}
                                disabled={updating}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                            >
                                {updating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Approve
                            </Button>
                            <Button
                                onClick={() => handleStatusChange('INACTIVE')}
                                disabled={updating}
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded-full"
                            >
                                {updating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Reject
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" onClick={onClose} className="rounded-full">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
