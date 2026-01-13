"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Copy, CheckCircle2 } from "lucide-react"

interface FormTemplate {
    id: string
    name: string
    description?: string
    fields: any
}

interface AssignFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    memberId: string
    memberName: string
    workspaceId: string
    templates: FormTemplate[]
    assignedBy: string
    onSuccess?: (assignment: any) => void
}

export function AssignFormDialog({
    open,
    onOpenChange,
    memberId,
    memberName,
    workspaceId,
    templates,
    assignedBy,
    onSuccess
}: AssignFormDialogProps) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [dueDate, setDueDate] = useState<string>("")
    const [hasDueDate, setHasDueDate] = useState(false)
    const [allowMultiple, setAllowMultiple] = useState(false)
    const [loading, setLoading] = useState(false)
    const [assignmentResult, setAssignmentResult] = useState<any>(null)
    const [copied, setCopied] = useState(false)

    const handleAssign = async () => {
        if (!selectedTemplateId) {
            toast.error("Please select a form template")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/members/${memberId}/assign-form`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        templateId: selectedTemplateId,
                        assignedBy,
                        dueDate: hasDueDate && dueDate ? dueDate : null,
                        allowMultiple
                    })
                }
            )

            if (!response.ok) throw new Error('Failed to assign form')

            const result = await response.json()
            setAssignmentResult(result)
            toast.success('Form assigned successfully!')
            onSuccess?.(result)
        } catch (error) {
            console.error('Error assigning form:', error)
            toast.error('Failed to assign form')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = () => {
        if (assignmentResult?.publicUrl) {
            const fullUrl = `${window.location.origin}${assignmentResult.publicUrl}`
            navigator.clipboard.writeText(fullUrl)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        setSelectedTemplateId("")
        setDueDate("")
        setHasDueDate(false)
        setAssignmentResult(null)
        setCopied(false)
        onOpenChange(false)
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Assign Form to {memberName}</DialogTitle>
                    <DialogDescription>
                        {assignmentResult
                            ? "Form assigned successfully! Share the link below with the user."
                            : "Select a form template to assign to this user."
                        }
                    </DialogDescription>
                </DialogHeader>

                {!assignmentResult ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="template">Form Template</Label>
                            <Select
                                value={selectedTemplateId}
                                onValueChange={setSelectedTemplateId}
                            >
                                <SelectTrigger id="template">
                                    <SelectValue placeholder="Select a form template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedTemplate?.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedTemplate.description}
                                </p>
                            )}
                        </div>


                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasDueDate"
                                    checked={hasDueDate}
                                    onCheckedChange={(checked) => {
                                        setHasDueDate(checked as boolean)
                                        if (!checked) setDueDate("") // Clear date when unchecked
                                    }}
                                />
                                <Label htmlFor="hasDueDate" className="text-sm font-normal cursor-pointer text-muted-foreground">
                                    Set due date
                                </Label>
                            </div>

                            {hasDueDate && (
                                <div className="space-y-2 pl-6">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Leave unchecked for recurring activities where the due date depends on when the activity happens
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="allowMultiple"
                                checked={allowMultiple}
                                onCheckedChange={(checked) => setAllowMultiple(checked as boolean)}
                            />
                            <Label htmlFor="allowMultiple" className="text-sm font-normal cursor-pointer text-muted-foreground">
                                Allow multiple submissions
                            </Label>
                        </div>

                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                        Assignment Created
                                    </h4>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        {assignmentResult.template.name} has been assigned to {memberName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Public Form Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={`${window.location.origin}${assignmentResult.publicUrl}`}
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Share this link with the user to fill out the form
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {!assignmentResult ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={loading || !selectedTemplateId}
                                className="bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Assign Form
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose} className="bg-[#6C5DD3] hover:bg-[#5b4eb3]">
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
