"use client"

import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteModal } from "@/components/delete-modal"
import { EditWorkspaceDialog } from "./edit-workspace-dialog"
import { useState } from "react"
import { toast } from "sonner"
import { WorkspaceType } from "./workspace-type-badge"

interface Workspace {
    id: string
    name: string
    slug: string
    type: WorkspaceType
    memberCount: number
    createdAt: string
    description?: string | null
}

interface WorkspaceActionsProps {
    workspace: Workspace
    onDelete?: () => void
    onUpdate?: () => void
}

export function WorkspaceActions({ workspace, onDelete, onUpdate }: WorkspaceActionsProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete workspace')

            toast.success('Workspace deleted successfully')
            setShowDeleteModal(false)
            onDelete?.()
        } catch (error) {
            toast.error('Failed to delete workspace')
            console.error('Error deleting workspace:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleMenuItemClick = (e: Event, action: 'edit' | 'delete') => {
        e.preventDefault()
        e.stopPropagation()

        if (action === 'delete') {
            setShowDeleteModal(true)
        } else if (action === 'edit') {
            setShowEditDialog(true)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-0">
                    <DropdownMenuItem onSelect={(e) => handleMenuItemClick(e, 'edit')}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => handleMenuItemClick(e, 'delete')}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Workspace"
                description="Are you sure you want to delete this workspace? This will permanently delete all associated data including templates, members, and registrations. This action cannot be undone."
                itemName={workspace.name}
                loading={isDeleting}
            />

            <EditWorkspaceDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onSuccess={onUpdate}
                workspace={workspace}
            />
        </>
    )
}
