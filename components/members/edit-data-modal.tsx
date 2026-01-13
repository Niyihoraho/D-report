"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


import { Member } from "./member-table"
import { FormField } from "@/components/form-builder/types"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { SuccessModal } from "@/components/ui/success-modal"

interface EditDataModalProps {
    isOpen: boolean
    onClose: () => void
    data: Member | null
    workspaceId: string
    onUpdate?: () => void
}

export function EditDataModal({ isOpen, onClose, data, workspaceId, onUpdate }: EditDataModalProps) {
    const [saving, setSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm()

    useEffect(() => {
        if (data) {
            reset({
                name: data.profileData?.name || data.user.name || '',
                regionalName: data.profileData?.regionalName || '',
                email: data.profileData?.email || data.user.email || '',
                phone: data.profileData?.phone || '',
                assignments: data.formAssignments?.map(a => ({
                    id: a.id,
                    allowMultiple: a.allowMultiple
                })) || []
            })
        }
    }, [data, reset])

    const onSubmit = async (formData: any) => {
        if (!data) return

        setSaving(true)
        try {
            // Seperate assignments from profileData
            const { assignments, ...profileFields } = formData

            const response = await fetch(`/api/workspaces/${workspaceId}/members/${data.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments, // Send assignments to backend
                    profileData: {
                        ...data.profileData,
                        ...profileFields
                    }
                })
            })

            if (!response.ok) throw new Error('Failed to update data')

            // Show success modal
            setShowSuccess(true)

            // Trigger update immediately so UI reflects chances
            onUpdate?.()

            // Close after delay
            setTimeout(() => {
                setShowSuccess(false)
                onClose()
            }, 2000)

        } catch (error) {
            toast.error('Failed to update data')
        } finally {
            setSaving(false)
        }
    }

    if (!data) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                            Edit Member
                        </DialogTitle>
                        <DialogDescription>
                            Update details for {data.user.name || data.user.email}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                {...register('name', { required: true })}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                            />
                            {errors.name && <p className="text-sm text-red-500">Name is required</p>}
                        </div>



                        {/* Regional Name */}
                        <div className="space-y-2">
                            <Label htmlFor="regionalName">
                                Regional Name
                            </Label>
                            <Input
                                id="regionalName"
                                placeholder="Enter regional name"
                                {...register('regionalName')}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                {...register('email', { required: true })}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                            />
                            {errors.email && <p className="text-sm text-red-500">Email is required</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Phone <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                placeholder="Enter phone number"
                                {...register('phone', { required: true })}
                                className="h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                            />
                            {errors.phone && <p className="text-sm text-red-500">Phone is required</p>}
                        </div>

                        {/* Assignments Permissions */}
                        {data.formAssignments && data.formAssignments.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <Label>Assignment Permissions</Label>
                                <div className="space-y-3">
                                    {data.formAssignments.map((assignment, index) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {assignment.template.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Status: {assignment.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Controller
                                                    name={`assignments.${index}.allowMultiple`}
                                                    control={control}
                                                    defaultValue={assignment.allowMultiple}
                                                    render={({ field }) => (
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                            className="h-4 w-4 rounded border-gray-300 text-[#6C5DD3] focus:ring-[#6C5DD3]"
                                                        />
                                                    )}
                                                />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Multiple
                                                </span>
                                                {/* Hidden input to track ID */}
                                                <input
                                                    type="hidden"
                                                    {...register(`assignments.${index}.id`)}
                                                    value={assignment.id}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={saving}
                                className="flex-1 rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white rounded-full shadow-lg shadow-[#6C5DD3]/25"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Member Updated"
                description="The member's details have been successfully updated."
            />
        </>
    )
}
