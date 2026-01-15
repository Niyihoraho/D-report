"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, FileText, User, Mail, Download, Clock, Loader2, ChevronDown, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatFieldValue, formatFieldName, organizeProfileData } from "@/lib/profile-utils"
import { motion, AnimatePresence } from "framer-motion"
import { ConfirmDialog } from "@/components/ConfirmDialog"

interface SubmissionDetail {
    id: string
    templateName: string
    submittedBy: string
    submittedByEmail: string
    status: string
    responses: any
    submittedAt?: string
    createdAt: string
    member: {
        id: string
        name: string
        email: string
        joinedAt: string
        profileData: any
    }
    fields?: any[]
    history?: {
        id: string
        submittedAt: string
        responses?: any
    }[]
}

export default function SubmissionDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.id as string
    const submissionId = params.submissionId as string

    const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const handleDeleteActivity = async () => {
        if (!confirmDeleteId) return

        const idToDelete = confirmDeleteId
        const isCurrentSubmission = idToDelete === submissionId

        // Optimistic update for history items
        const previousSubmission = submission
        if (!isCurrentSubmission && submission) {
            setSubmission({
                ...submission,
                history: submission.history?.filter(h => h.id !== idToDelete)
            })
            // Close modal immediately for optimistic feel
            setConfirmDeleteId(null)
        } else {
            // For current submission, we still want to show loading state in the modal
            setDeletingId(idToDelete)
        }

        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/data/${idToDelete}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete activity')

            toast.success('Activity deleted successfully')

            if (isCurrentSubmission) {
                router.push(`/workspaces/${workspaceId}/data`)
            }
            // No need to fetchSubmission for history items as we updated optimistically
        } catch (error) {
            console.error('Error deleting activity:', error)
            toast.error('Failed to delete activity')

            // Revert optimistic update
            if (!isCurrentSubmission && previousSubmission) {
                setSubmission(previousSubmission)
            }
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    useEffect(() => {
        if (workspaceId && submissionId) {
            fetchSubmission()
        }
    }, [workspaceId, submissionId])

    const fetchSubmission = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/data/${submissionId}`)
            if (!response.ok) throw new Error('Failed to fetch submission')
            const data = await response.json()
            setSubmission(data)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Failed to load submission details')
        } finally {
            setLoading(false)
        }
    }

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

    const renderFieldValue = (key: string, value: any) => {
        const fieldDef = submission?.fields?.find((f: any) => f.label === key || f.id === key)
        const isFile = fieldDef?.type === 'file'

        if (isFile && value) {
            const isImage = value.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            if (isImage) {
                return (
                    <div className="mt-2">
                        <img
                            src={value}
                            alt="Uploaded file"
                            className="max-w-full h-auto max-h-[300px] rounded-lg border border-gray-200 dark:border-gray-800 object-contain"
                        />
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6C5DD3] hover:underline mt-1 block">
                            View full image
                        </a>
                    </div>
                )
            }
            return (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#6C5DD3] hover:underline flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4" />
                    View File ({value.split('/').pop()})
                </a>
            )
        }

        return <p className="whitespace-pre-wrap">{formatFieldValue(value)}</p>
    }

    const handleExportPdf = async (includeHistory: boolean = false) => {
        if (!submission) return

        setExporting(true)
        try {
            const reportData = {
                templateName: submission.templateName,
                submittedBy: submission.submittedBy,
                submittedByEmail: submission.submittedByEmail,
                submittedAt: submission.submittedAt,
                status: submission.status,
                responses: submission.responses,
                member: submission.member,
                fields: submission.fields,
                history: includeHistory ? submission.history : undefined,
            }

            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportData,
                    workspaceId
                }),
            })

            if (!response.ok) {
                const errorBody = await response.json()
                const errorMessage = errorBody.error || 'Failed to generate PDF'
                const errorDetails = errorBody.details || ''
                throw new Error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`)
            }

            const data = await response.json()
            console.log('Received PDF data. Size:', data.size, 'Base64 length:', data.pdf?.length)

            if (!data.pdf || !data.filename) {
                throw new Error('Invalid PDF response from server')
            }

            const binaryString = atob(data.pdf)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            const pdfBlob = new Blob([bytes], { type: 'application/pdf' })
            console.log('Created blob. Size:', pdfBlob.size)

            if (pdfBlob.size === 0) {
                throw new Error('Failed to create PDF blob from base64 data')
            }

            const url = window.URL.createObjectURL(pdfBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = data.filename
            document.body.appendChild(a)
            a.click()

            setTimeout(() => {
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }, 100)

            toast.success('PDF exported successfully!')
        } catch (error: any) {
            console.error('Export error:', error)
            const errorMsg = error.message || 'Failed to export PDF'
            // If the server sent details, try to append them or show them
            // The fetch block above throws Error(error.error) - we might want to include details there
            toast.error(errorMsg, {
                description: "If this persists, please contact support with this error."
            })
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
            </div>
        )
    }

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-gray-500">Submission not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const { personal, contact, additional } = organizeProfileData(submission.member.profileData)

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {submission.templateName}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Submission ID: {submission.id}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2" disabled={exporting}>
                                {exporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Export
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportPdf(false)}>
                                Export Current Activity
                            </DropdownMenuItem>
                            {submission && submission.history && submission.history.length > 0 && (
                                <DropdownMenuItem onClick={() => handleExportPdf(true)}>
                                    Export Full History ({submission.history.length} Activities)
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Member Profile */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] text-white">
                        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 text-3xl font-bold">
                                {submission.member.name?.[0]?.toUpperCase() || <User className="h-10 w-10" />}
                            </div>
                            <h2 className="text-xl font-bold mb-1">{submission.member.name}</h2>
                            <p className="text-white/80 text-sm flex items-center gap-1.5 justify-center">
                                <Mail className="h-3.5 w-3.5" />
                                {submission.member.email}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Badge className={getStatusColor(submission.status) + " bg-white/20 text-white backdrop-blur-md border-0"}>
                                    {submission.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submission History */}
                    {submission.history && submission.history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {submission.history.map((hist, index) => {
                                        if (hist.responses) {
                                            console.log(`History ${index} keys:`, Object.keys(hist.responses));
                                        }
                                        return (
                                            <motion.div
                                                key={hist.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                                className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group ${hist.id === submission.id ? 'border-[#6C5DD3] bg-[#6C5DD3]/5 dark:bg-[#6C5DD3]/10' : 'border-gray-100 dark:border-gray-800'
                                                    }`}
                                                onClick={() => router.push(`/workspaces/${workspaceId}/data/${hist.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${hist.id === submission.id
                                                        ? 'bg-[#6C5DD3] text-white'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                                        }`}>
                                                        {submission.history && submission.history.length - index}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            {(() => {
                                                                const indexLabel = `Activity ${submission.history && submission.history.length - index}`;
                                                                let displayValue = "";

                                                                if (hist.responses) {
                                                                    const keys = Object.keys(hist.responses);
                                                                    const activityKey = keys.find(k => k === 'Activities') ||
                                                                        keys.find(k => k.toLowerCase().includes('activity')) ||
                                                                        keys.find(k => k.toLowerCase().includes('title'));

                                                                    if (activityKey && hist.responses[activityKey]) {
                                                                        let val = String(hist.responses[activityKey]);
                                                                        if (val.length > 30) val = val.substring(0, 30) + '...';
                                                                        displayValue = val;
                                                                    }
                                                                }

                                                                return displayValue ? `${indexLabel}: ${displayValue}` : indexLabel;
                                                            })()}
                                                        </span>
                                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                            {new Date(hist.submittedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {hist.id === submission.id && (
                                                        <Badge variant="outline" className="text-xs border-[#6C5DD3] text-[#6C5DD3]">
                                                            Current
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setConfirmDeleteId(hist.id)
                                                        }}
                                                        disabled={deletingId === hist.id}
                                                    >
                                                        {deletingId === hist.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    )}

                    {/* Member Details */}
                    {(Object.keys(personal).length > 0 || Object.keys(contact).length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Member Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries({ ...personal, ...contact }).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500">{formatFieldName(key)}</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatFieldValue(value)}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Right Column: Submission Data */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <Card>
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Activities</CardTitle>
                                    <CardDescription>
                                        Submitted on {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'} at {submission.submittedAt ? new Date(submission.submittedAt).toLocaleTimeString() : ''}
                                    </CardDescription>
                                </div>
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {submission.responses && Object.keys(submission.responses).length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {Object.entries(submission.responses).map(([key, value], index) => (
                                        <div key={key} className="p-6 hover:bg-gray-50 dark:hover:bg-[#2C2F36] transition-colors">
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                                {key}
                                            </p>
                                            <div className="text-gray-900 dark:text-white prose dark:prose-invert max-w-none">
                                                {renderFieldValue(key, value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No data submitted yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
            <ConfirmDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title="Delete Activity"
                description="Are you sure you want to delete this activity? This action cannot be undone."
                confirmLabel={deletingId ? "Deleting..." : "Delete"}
                variant="destructive"
                onConfirm={handleDeleteActivity}
            />
        </div>
    )
}
