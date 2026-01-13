"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconCalendar, IconClock, IconCheck, IconAlertCircle, IconCopy, IconTrash } from "@tabler/icons-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useState } from "react"

interface FormAssignment {
    id: string
    publicSlug: string
    publicUrl: string
    status: string
    dueDate?: string
    submittedAt?: string
    createdAt: string
    template: {
        id: string
        name: string
        description?: string
    }
}

interface AssignedFormsListProps {
    assignments: FormAssignment[]
    workspaceId: string
    onDelete?: (assignmentId: string) => void
}

export function AssignedFormsList({
    assignments,
    workspaceId,
    onDelete
}: AssignedFormsListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
            case 'COMPLETED':
                return <IconCheck className="h-4 w-4" />
            case 'IN_PROGRESS':
                return <IconClock className="h-4 w-4" />
            case 'PENDING':
                return <IconAlertCircle className="h-4 w-4" />
            default:
                return null
        }
    }

    const handleCopyLink = (publicUrl: string) => {
        const fullUrl = `${window.location.origin}${publicUrl}`
        navigator.clipboard.writeText(fullUrl)
        toast.success('Link copied to clipboard!')
    }

    const handleDelete = async (assignmentId: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) {
            return
        }

        setDeletingId(assignmentId)
        try {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/assignments/${assignmentId}`,
                { method: 'DELETE' }
            )

            if (!response.ok) throw new Error('Failed to delete assignment')

            toast.success('Assignment deleted successfully')
            onDelete?.(assignmentId)
        } catch (error) {
            console.error('Error deleting assignment:', error)
            toast.error('Failed to delete assignment')
        } finally {
            setDeletingId(null)
        }
    }

    if (assignments.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        No forms assigned yet
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {assignments.map((assignment, index) => (
                <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {assignment.template.name}
                                        </h3>
                                        <Badge className={getStatusColor(assignment.status)}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(assignment.status)}
                                                {assignment.status}
                                            </span>
                                        </Badge>
                                    </div>

                                    {assignment.template.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {assignment.template.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <IconCalendar className="h-3 w-3" />
                                            Assigned {new Date(assignment.createdAt).toLocaleDateString()}
                                        </div>
                                        {assignment.dueDate && (
                                            <div className="flex items-center gap-1">
                                                <IconClock className="h-3 w-3" />
                                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        {assignment.submittedAt && (
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <IconCheck className="h-3 w-3" />
                                                Submitted {new Date(assignment.submittedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopyLink(assignment.publicUrl)}
                                    >
                                        <IconCopy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(assignment.id)}
                                        disabled={deletingId === assignment.id}
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
