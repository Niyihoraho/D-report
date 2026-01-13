"use client"

import { PageHeader } from "@/components/PageHeader"
import { ContentCard } from "@/components/ContentCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconCopy, IconArrowLeft, IconExternalLink } from "@tabler/icons-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/members/status-badge"

export default function AssignmentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.id as string
    const templateId = params.templateId as string

    const [assignments, setAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [templateName, setTemplateName] = useState("Assignment Details")

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await fetch(`/api/workspaces/${workspaceId}/form-templates/${templateId}/assignments`)
                if (!response.ok) throw new Error('Failed to fetch assignments')
                const data = await response.json()
                setAssignments(data)

                // Extract template name from first assignment if available
                if (data.length > 0 && data[0].templateName) {
                    setTemplateName(data[0].templateName)
                }
            } catch (error) {
                console.error(error)
                toast.error('Failed to load assignments')
            } finally {
                setLoading(false)
            }
        }
        if (workspaceId && templateId) fetchAssignments()
    }, [workspaceId, templateId])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Public link copied to clipboard")
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <IconArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-[#11142D] dark:text-white">
                        {assignments.length > 0 ? `Assignments: ${assignments[0].templateName || 'Template'}` : 'Assignment Details'}
                    </h1>
                    <p className="text-gray-500 text-sm">Manage assignments and view public links</p>
                </div>
            </div>

            <ContentCard title="Assignment Submissions">
                {assignments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No assignments found for this template.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Public Link</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={assignment.member.avatar} />
                                                <AvatarFallback>{assignment.member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-[#11142D] dark:text-white">{assignment.member.name}</div>
                                                <div className="text-xs text-gray-500">{assignment.member.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={assignment.status} />
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-2"
                                                onClick={() => copyToClipboard(assignment.publicLink)}
                                            >
                                                <IconCopy className="h-3.5 w-3.5" />
                                                Copy Link
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => window.open(assignment.publicLink, '_blank')}
                                            >
                                                <IconExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </ContentCard>
        </div>
    )
}
