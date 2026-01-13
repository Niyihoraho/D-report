"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Loader2, Award, Receipt, GraduationCap, Check, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Member {
    id: string
    user: {
        name: string
        email: string
    }
}

interface GenerateReportDialogProps {
    isOpen: boolean
    onClose: () => void
    workspaceId: string
    members: Member[]
}

const REPORT_TYPES = [
    { value: 'TRANSCRIPT', label: 'Academic Transcript', icon: GraduationCap, description: 'Student academic records and grades', category: 'Individual' },
    { value: 'CERTIFICATE', label: 'Certificate', icon: Award, description: 'Completion or achievement certificates', category: 'Individual' },
    { value: 'RECEIPT', label: 'Payment Receipt', icon: Receipt, description: 'Payment confirmation documents', category: 'Individual' },
    { value: 'ATTENDANCE', label: 'Attendance Sheet', icon: FileText, description: 'List of members for attendance tracking', category: 'Group' },
]

const REPORT_CATEGORIES = [
    { value: 'Individual', label: 'Individual Reports', description: 'Generate separate reports for each member' },
    { value: 'Group', label: 'Group Reports', description: 'Generate a single report for all selected members' },
]

export function GenerateReportDialog({ isOpen, onClose, workspaceId, members }: GenerateReportDialogProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedReportType, setSelectedReportType] = useState<string>("")
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
    const [generating, setGenerating] = useState(false)
    const [success, setSuccess] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState<string>("")
    const [generatedFilename, setGeneratedFilename] = useState<string>("")

    const toggleMember = (memberId: string) => {
        const newSelected = new Set(selectedMembers)
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId)
        } else {
            newSelected.add(memberId)
        }
        setSelectedMembers(newSelected)
    }

    const toggleAll = () => {
        if (selectedMembers.size === members.length) {
            setSelectedMembers(new Set())
        } else {
            setSelectedMembers(new Set(members.map(m => m.id)))
        }
    }

    const handleGenerate = async () => {
        if (!selectedReportType || selectedMembers.size === 0) {
            toast.error('Please select a report type and at least one member')
            return
        }

        setGenerating(true)
        console.log('Sending Report Request:', {
            type: selectedReportType,
            trimmed: selectedReportType?.trim(),
            category: selectedCategory
        })
        try {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/reports/generate`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reportType: selectedReportType?.trim(),
                        memberIds: Array.from(selectedMembers),
                        templateData: selectedReportType?.trim() === 'ATTENDANCE' ? {
                            purpose: (document.getElementById('attendance-purpose') as HTMLTextAreaElement)?.value
                        } : undefined
                    })
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to generate reports')
                return
            }

            // Download the file
            // Download the file
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition')
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
            const filename = filenameMatch?.[1] ||
                (selectedMembers.size === 1 ? 'Report.pdf' : 'Reports.zip')

            setDownloadUrl(url)
            setGeneratedFilename(filename)
            setSuccess(true)

            toast.success(`${selectedMembers.size} report(s) generated successfully!`)
        } catch (error: any) {
            console.error('Unexpected error generating reports:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    const handleClose = () => {
        if (downloadUrl) window.URL.revokeObjectURL(downloadUrl)
        setDownloadUrl("")
        setGeneratedFilename("")
        setSuccess(false)
        setSelectedCategory("")
        setSelectedReportType("")
        setSelectedMembers(new Set())
        onClose()
    }

    const handleDownload = () => {
        if (!downloadUrl) return
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = generatedFilename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        // Don't auto-close - let user close manually
    }

    const selectedType = REPORT_TYPES.find(t => t.value === selectedReportType)
    const filteredTypes = REPORT_TYPES.filter(t => t.category === selectedCategory)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center justify-center py-10 space-y-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                                className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center p-4"
                            >
                                <Check className="w-12 h-12 text-green-600 dark:text-green-400" strokeWidth={3} />
                            </motion.div>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Ready!</h3>
                                <p className="text-gray-500 max-w-[300px]">
                                    Your documents have been generated successfully and are ready for download.
                                </p>
                            </div>

                            <div className="flex gap-4 w-full max-w-sm pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1 rounded-xl h-12"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 h-12 text-lg font-medium shadow-lg shadow-green-200 dark:shadow-green-900/20"
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Download
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DialogHeader>
                                <DialogTitle>Generate Reports</DialogTitle>
                                <DialogDescription>
                                    Select a report category and type to generate professional PDF documents
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Report Category Selection */}
                                    <div className="space-y-2">
                                        <Label>Report Category</Label>
                                        <Select
                                            value={selectedCategory}
                                            onValueChange={(value) => {
                                                setSelectedCategory(value)
                                                setSelectedReportType("") // Reset type when category changes

                                                // Auto-select all/none based on category
                                                if (value === 'Group') {
                                                    setSelectedMembers(new Set(members.map(m => m.id)))
                                                } else {
                                                    setSelectedMembers(new Set())
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {REPORT_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className="font-medium">{cat.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Report Type Selection */}
                                    <div className="space-y-2">
                                        <Label>Report Type</Label>
                                        <Select
                                            value={selectedReportType}
                                            onValueChange={setSelectedReportType}
                                            disabled={!selectedCategory}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue placeholder={selectedCategory ? "Select Type" : "Select Category First"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center gap-2">
                                                            <type.icon className="h-4 w-4" />
                                                            <div className="flex flex-col items-start gap-0.5">
                                                                <span className="font-medium">{type.label}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Report Type Info */}
                                {selectedType && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start gap-2">
                                            <selectedType.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                    {selectedType.label}
                                                </p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                    {selectedType.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Attendance Specific Fields */}
                                {selectedReportType === 'ATTENDANCE' && (
                                    <div className="space-y-2 pt-2">
                                        <Label>Purpose of Attendance</Label>
                                        <textarea
                                            className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                            placeholder="Enter the purpose of this attendance record..."
                                            id="attendance-purpose"
                                        />
                                    </div>
                                )}

                                {/* Member Selection */}
                                {selectedCategory === 'Individual' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Select Members ({selectedMembers.size} selected)</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={toggleAll}
                                                className="h-8 text-xs"
                                            >
                                                {selectedMembers.size === members.length ? 'Deselect All' : 'Select All'}
                                            </Button>
                                        </div>

                                        <div className="border rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-3">
                                            {members.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                    No members found
                                                </p>
                                            ) : (
                                                members.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                                        onClick={() => toggleMember(member.id)}
                                                    >
                                                        <Checkbox
                                                            checked={selectedMembers.has(member.id)}
                                                            onCheckedChange={() => toggleMember(member.id)}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{member.user.name}</p>
                                                            <p className="text-xs text-gray-500">{member.user.email}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1 rounded-xl"
                                    disabled={generating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!selectedReportType || selectedMembers.size === 0 || generating}
                                    className="flex-1 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            {selectedCategory === 'Group'
                                                ? 'Generate Report'
                                                : `Generate ${selectedMembers.size > 1 ? `${selectedMembers.size} Reports` : 'Report'}`
                                            }
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog >
    )
}
