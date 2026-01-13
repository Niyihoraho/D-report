"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EditWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    workspace: {
        id: string
        name: string
        type: string
        description?: string | null
    } | null
}

export function EditWorkspaceDialog({ open, onOpenChange, onSuccess, workspace }: EditWorkspaceDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState<string>("")
    const [description, setDescription] = useState("")

    // Update form when workspace changes
    useEffect(() => {
        if (workspace) {
            setName(workspace.name)
            setType(workspace.type)
            setDescription(workspace.description || "")
        }
    }, [workspace])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !type || !workspace) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    type,
                    description,
                }),
            })

            if (!response.ok) throw new Error("Failed to update workspace")

            toast.success("Workspace updated successfully")
            onOpenChange(false)
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error) {
            toast.error("Failed to update workspace")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Workspace</DialogTitle>
                    <DialogDescription>
                        Update your workspace details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Workspace Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Campus Ministry"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type *</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MINISTRY">Ministry</SelectItem>
                                <SelectItem value="CONSTRUCTION">Construction</SelectItem>
                                <SelectItem value="TRAINING">Training</SelectItem>
                                <SelectItem value="GENERAL">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#6C5DD3] hover:bg-[#5b4eb3]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Workspace
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
