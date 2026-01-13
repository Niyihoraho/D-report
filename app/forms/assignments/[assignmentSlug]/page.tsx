"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DynamicForm } from "@/components/registration/dynamic-form"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Calendar, User } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { formatFieldName, formatFieldValue, organizeProfileData } from "@/lib/profile-utils"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

interface AssignmentData {
    id: string
    publicSlug: string
    status: string
    allowMultiple?: boolean
    dueDate?: string
    submittedAt?: string
    responses?: any
    template: {
        id: string
        name: string
        description?: string
        fields: any[]
        submitLabel: string
    }
    history?: {
        id: string
        submittedAt: string
        responses: any
    }[]
    member: {
        id: string
        profileData: Record<string, any>
        user: {
            id: string
            name: string
            email: string
            createdAt: string
        }
        workspace: {
            id: string
            name: string
            slug: string
            logoUrl?: string
            primaryColor?: string
        }
    }
}

export default function FormAssignmentPage() {
    const params = useParams()
    const assignmentSlug = params?.assignmentSlug as string

    const [assignment, setAssignment] = useState<AssignmentData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formKey, setFormKey] = useState(0) // Key to force form remount
    const [countdown, setCountdown] = useState(3) // Countdown for auto-reset
    const [exporting, setExporting] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)
    const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set())

    const toggleActivity = (id: string) => {
        const next = new Set(selectedActivities)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedActivities(next)
    }

    const toggleAll = () => {
        if (!assignment?.history) return
        if (selectedActivities.size === assignment.history.length) {
            setSelectedActivities(new Set())
        } else {
            setSelectedActivities(new Set(assignment.history.map(h => h.id)))
        }
    }

    const handleExport = async () => {
        if (!assignment) return
        setExporting(true)
        try {
            const selectedHistory = (assignment.history || []).filter(h => selectedActivities.has(h.id))

            if (selectedHistory.length === 0) {
                toast.error("Please select at least one activity")
                setExporting(false)
                return
            }

            const reportData = {
                templateName: assignment.template.name,
                submittedBy: assignment.member.user.name,
                submittedByEmail: assignment.member.user.email,
                submittedAt: new Date().toISOString(),
                status: 'EXPORTED',
                responses: {},
                member: assignment.member,
                fields: assignment.template.fields,
                history: selectedHistory
            }

            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportData,
                    workspaceId: assignment.member.workspace.id
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate PDF')
            }

            const data = await response.json()
            if (!data.pdf || !data.filename) throw new Error('Invalid PDF response')

            const binaryString = atob(data.pdf)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            const pdfBlob = new Blob([bytes], { type: 'application/pdf' })
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
            setShowExportModal(false)
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    useEffect(() => {
        if (assignmentSlug) {
            fetchAssignment()
        }
    }, [assignmentSlug])

    // Auto-reset form after success for multiple submissions
    useEffect(() => {
        if (success && assignment?.allowMultiple) {
            setCountdown(3) // Reset countdown to 3 seconds

            // Update countdown every second
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            // Reset form after 3 seconds
            const resetTimer = setTimeout(() => {
                setSuccess(false)
                setAssignment(prev => prev ? { ...prev, status: 'PENDING', responses: {} } : null)
                setFormKey(prev => prev + 1)
            }, 3000)

            return () => {
                clearInterval(countdownInterval)
                clearTimeout(resetTimer)
            }
        }
    }, [success, assignment?.allowMultiple])

    const fetchAssignment = async () => {
        try {
            const response = await fetch(`/api/public/forms/assignments/${assignmentSlug}`)
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Form assignment not found')
                } else if (response.status === 403) {
                    throw new Error('This form assignment is no longer active')
                }
                throw new Error('Failed to load form assignment')
            }
            const data = await response.json()
            setAssignment(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (data: any, isDraft = false) => {
        setSubmitting(true)
        try {
            const response = await fetch(
                `/api/public/forms/assignments/${assignmentSlug}/submit`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        responses: data,
                        status: isDraft ? 'IN_PROGRESS' : 'SUBMITTED'
                    })
                }
            )

            if (!response.ok) throw new Error('Failed to submit form')

            const result = await response.json()
            toast.success(result.message)

            if (!isDraft) {
                setSuccess(true)
            }

            // Update local state
            setAssignment(prev => prev ? {
                ...prev,
                status: result.assignment.status,
                responses: result.assignment.responses,
                submittedAt: result.assignment.submittedAt
            } : null)
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Failed to submit form')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1D23] dark:to-[#11142D]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#6C5DD3] mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1D23] dark:to-[#11142D]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 bg-white dark:bg-[#2C2F36] rounded-3xl shadow-xl max-w-md"
                >
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="h-8 w-8 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Form Not Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </motion.div>
            </div>
        )
    }

    if (!assignment) {
        return null
    }

    // Filter out section fields and other non-data elements
    const effectiveProfileData = { ...assignment.member.profileData }
    assignment.template.fields.forEach((field: any) => {
        if (field.type === 'section') {
            delete effectiveProfileData[field.id]
        }
    })

    const { personal, contact, additional } = organizeProfileData(effectiveProfileData)
    const isSubmitted = success || assignment.status === 'SUBMITTED' || assignment.status === 'COMPLETED'

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1D23] dark:to-[#11142D] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Workspace Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        {assignment.member.workspace.logoUrl && (
                            <img
                                src={assignment.member.workspace.logoUrl}
                                alt={assignment.member.workspace.name}
                                className="h-12 w-auto"
                            />
                        )}
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {assignment.member.workspace.name}
                            </h2>
                        </div>
                    </div>
                    {isSubmitted && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Submitted
                        </Badge>
                    )}
                </motion.div>

                {/* Member Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-none shadow-lg bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <User className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold mb-1">{assignment.member.user.name}</h1>
                                    <p className="text-white/80">{assignment.member.user.email}</p>
                                    <p className="text-white/60 text-sm mt-1">
                                        Member since {new Date(assignment.member.user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* User Profile Data */}
                {(Object.keys(personal).length > 0 || Object.keys(contact).length > 0 || Object.keys(additional).length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle>Member Information</CardTitle>
                                    <CardDescription>Information we have on file</CardDescription>
                                </div>
                                {assignment.history && assignment.history.length > 0 && (
                                    <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Download className="h-4 w-4" />
                                                Export Report
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl text-left bg-white dark:bg-[#2C2F36]">
                                            <DialogHeader>
                                                <DialogTitle>Export Activities</DialogTitle>
                                                <DialogDescription>Select the activities you want to include in the report.</DialogDescription>
                                            </DialogHeader>

                                            <div className="py-4">
                                                <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <Checkbox id="select-all"
                                                        checked={assignment.history.length > 0 && selectedActivities.size === assignment.history.length}
                                                        onCheckedChange={toggleAll}
                                                    />
                                                    <Label htmlFor="select-all" className="font-bold cursor-pointer">Select All {assignment.history.length} Activities</Label>
                                                </div>

                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                    {assignment.history.map((h, i) => {
                                                        const indexLabel = `Activity ${assignment.history!.length - i}`
                                                        let displayValue = ""
                                                        if (h.responses) {
                                                            // 1. Try to find the field ID from the template definition
                                                            const titleField = assignment.template.fields.find(f => {
                                                                const label = (f.label || f.id || '').toLowerCase()
                                                                return label === 'activity' || label === 'title' || label.includes('activity name') || label === 'name'
                                                            })

                                                            let val = ""
                                                            if (titleField && h.responses[titleField.id]) {
                                                                val = String(h.responses[titleField.id])
                                                            } else {
                                                                // 2. Fallback: Search keys directly (if responses use labels as keys, or we missed the field def)
                                                                const keys = Object.keys(h.responses)
                                                                const activityKey = keys.find(k => k.toLowerCase() === 'activity') ||
                                                                    keys.find(k => k.toLowerCase() === 'title') ||
                                                                    keys.find(k => k.toLowerCase() === 'name') ||
                                                                    keys.find(k => k.toLowerCase().startsWith('activity')) ||
                                                                    keys.find(k => k.toLowerCase().includes('title'))

                                                                if (activityKey) val = String(h.responses[activityKey])
                                                            }

                                                            if (val) {
                                                                if (val.length > 50) val = val.substring(0, 50) + '...'
                                                                displayValue = val
                                                            }
                                                        }

                                                        return (
                                                            <div key={h.id} className="flex items-start space-x-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                <Checkbox id={h.id}
                                                                    checked={selectedActivities.has(h.id)}
                                                                    onCheckedChange={() => toggleActivity(h.id)}
                                                                    className="mt-1"
                                                                />
                                                                <Label htmlFor={h.id} className="flex-1 cursor-pointer grid gap-1">
                                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {displayValue || indexLabel}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                                                        <span className="font-medium text-gray-400">{indexLabel}</span>
                                                                        <span>•</span>
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>Submitted: {new Date(h.submittedAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </Label>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button variant="ghost" onClick={() => setShowExportModal(false)}>Cancel</Button>
                                                <Button onClick={handleExport} disabled={exporting || selectedActivities.size === 0}>
                                                    {exporting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                                    {exporting ? "Generating..." : `Export (${selectedActivities.size})`}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries({ ...personal, ...contact, ...additional }).map(([key, value]) => (
                                        <div key={key} className="space-y-1">
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {formatFieldName(key)}
                                            </p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {formatFieldValue(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{assignment.template.name}</CardTitle>
                                    {assignment.template.description && (
                                        <CardDescription className="mt-2">
                                            {assignment.template.description}
                                        </CardDescription>
                                    )}
                                </div>
                                {assignment.dueDate && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center border border-green-200 dark:border-green-800"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.1
                                        }}
                                        className="h-20 w-20 bg-green-100 dark:bg-green-900 mx-auto mb-4 rounded-full flex items-center justify-center"
                                    >
                                        <svg
                                            className="h-10 w-10 text-green-600 dark:text-green-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                                            Form Submitted Successfully!
                                        </h3>
                                        <p className="text-green-700 dark:text-green-300 mb-4">
                                            Submitted on {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Thank you for completing this form. Your response has been recorded.
                                        </p>
                                    </motion.div>

                                    {assignment.allowMultiple && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="mt-6 space-y-3"
                                        >
                                            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                    <span className="text-lg font-bold">{countdown}</span>
                                                </div>
                                                <p className="text-sm">
                                                    Form will reset in {countdown} second{countdown !== 1 ? 's' : ''}...
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setSuccess(false)
                                                    setAssignment(prev => prev ? { ...prev, status: 'PENDING', responses: {} } : null)
                                                    setFormKey(prev => prev + 1) // Force form remount with empty data
                                                }}
                                                variant="outline"
                                                className="bg-white dark:bg-gray-800 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            >
                                                Submit Another Response Now
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <DynamicForm
                                    key={formKey} // Force remount when key changes
                                    fields={assignment.template.fields}
                                    onSubmit={(data) => handleSubmit(data, false)}
                                    submitLabel={submitting ? 'Submitting...' : assignment.template.submitLabel}
                                    initialData={assignment.status === 'IN_PROGRESS' ? assignment.responses : {}}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-sm text-gray-500 dark:text-gray-400"
                >
                    <p>Powered by ArtCodE</p>
                </motion.div>
            </div>
        </div>
    )
}
