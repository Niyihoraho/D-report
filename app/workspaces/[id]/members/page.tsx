"use client"

import { MemberTable, Member } from "@/components/members/member-table"
import { DataDetailsModal } from "@/components/members/data-details-modal"
import { EditDataModal } from "@/components/members/edit-data-modal"
import { DeleteModal } from "@/components/delete-modal"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AssignFormDialog } from "@/components/forms/AssignFormDialog"
import { RegisterMemberDialog } from "@/components/members/RegisterMemberDialog"
import { SuccessModal } from "@/components/ui/success-modal"

export default function MembersPage() {
    const params = useParams()
    const workspaceId = params.id as string
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)

    // Modal states
    const [selectedMember, setSelectedMember] = useState<Member | null>(null)
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [deletingMember, setDeletingMember] = useState<Member | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [assigningMember, setAssigningMember] = useState<Member | null>(null)
    const [templates, setTemplates] = useState<any[]>([])
    const [showRegisterDialog, setShowRegisterDialog] = useState(false)
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

    useEffect(() => {
        if (workspaceId) {
            fetchMembers()
            fetchTemplates()
        }
    }, [workspaceId])

    const fetchMembers = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members`)
            if (!response.ok) throw new Error('Failed to fetch members')
            const data = await response.json()
            setMembers(data)
        } catch (error) {
            toast.error('Failed to load data')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/form-templates`)
            if (!response.ok) throw new Error('Failed to fetch templates')
            const data = await response.json()
            setTemplates(data.filter((t: any) => t.status === 'Active'))
        } catch (error) {
            console.error('Error fetching templates:', error)
        }
    }

    const handleDelete = async () => {
        if (!deletingMember) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members/${deletingMember.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete')

            // Show success modal
            setShowDeleteSuccess(true)

            setDeletingMember(null)
            fetchMembers()

            // Close after delay
            setTimeout(() => {
                setShowDeleteSuccess(false)
            }, 2000)
        } catch (error) {
            toast.error('Failed to delete member')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        Members
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Register and manage members
                    </p>
                </div>
                <Button
                    onClick={() => setShowRegisterDialog(true)}
                    className="bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register New Member
                </Button>
            </div>

            {/* Members Table */}
            <MemberTable
                members={members}
                isLoading={loading}
                workspaceId={workspaceId}
                onViewDetails={setSelectedMember}
                onEdit={setEditingMember}
                onDelete={setDeletingMember}
                onAssignForm={setAssigningMember}
            />

            {/* View Details Modal */}
            <DataDetailsModal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                data={selectedMember}
                workspaceId={workspaceId}
            />

            {/* Edit Data Modal */}
            <EditDataModal
                isOpen={!!editingMember}
                onClose={() => setEditingMember(null)}
                data={editingMember}
                onUpdate={() => {
                    setEditingMember(null)
                    fetchMembers()
                }}
                workspaceId={workspaceId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={!!deletingMember}
                onClose={() => setDeletingMember(null)}
                onConfirm={handleDelete}
                title="Delete Member"
                description="Are you sure you want to delete this member? This action cannot be undone."
                loading={isDeleting}
            />

            {/* Register Member Dialog */}
            <RegisterMemberDialog
                open={showRegisterDialog}
                onOpenChange={setShowRegisterDialog}
                workspaceId={workspaceId}
                onSuccess={fetchMembers}
            />

            {/* Assign Form Dialog */}
            <AssignFormDialog
                open={!!assigningMember}
                onOpenChange={(open) => !open && setAssigningMember(null)}
                memberId={assigningMember?.id || ''}
                memberName={assigningMember?.user.name || assigningMember?.user.email || ''}
                workspaceId={workspaceId}
                templates={templates}
                assignedBy="current-user-id" // TODO: Get from auth
                onSuccess={() => {
                    toast.success('Form assigned successfully!')
                    setAssigningMember(null)
                    fetchMembers()
                }}
            />

            <SuccessModal
                isOpen={showDeleteSuccess}
                onClose={() => setShowDeleteSuccess(false)}
                title="Member Deleted"
                description="The member has been successfully removed from the workspace."
            />
        </div>
    )
}
