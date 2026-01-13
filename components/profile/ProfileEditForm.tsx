"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { IconEdit, IconCheck, IconX } from "@tabler/icons-react"
import { formatFieldName } from "@/lib/profile-utils"
import { SuccessModal } from "@/components/ui/success-modal"

interface ProfileEditFormProps {
    memberId: string
    workspaceId: string
    currentProfileData: Record<string, any>
    onUpdate?: (updatedData: Record<string, any>) => void
}

export function ProfileEditForm({
    memberId,
    workspaceId,
    currentProfileData,
    onUpdate
}: ProfileEditFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>(currentProfileData || {})
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleFieldChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleAddField = () => {
        const fieldName = prompt("Enter field name:")
        if (fieldName && !formData[fieldName]) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: ""
            }))
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileData: formData
                })
            })

            if (!response.ok) throw new Error('Failed to update profile')

            const updated = await response.json()

            setShowSuccess(true)
            onUpdate?.(updated.profileData)

            setTimeout(() => {
                setShowSuccess(false)
                setIsEditing(false)
            }, 2000)
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData(currentProfileData || {})
        setIsEditing(false)
    }

    if (!isEditing) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>Update your profile information</CardDescription>
                        </div>
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                        >
                            <IconEdit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>Make changes to your profile information</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <IconX className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                            >
                                <IconCheck className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(formData).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="text-sm font-medium">
                                    {formatFieldName(key)}
                                </Label>
                                {typeof value === 'string' && value.length > 100 ? (
                                    <Textarea
                                        id={key}
                                        value={value}
                                        onChange={(e) => handleFieldChange(key, e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                ) : (
                                    <Input
                                        id={key}
                                        type={typeof value === 'number' ? 'number' : 'text'}
                                        value={value?.toString() || ''}
                                        onChange={(e) => handleFieldChange(key, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            onClick={handleAddField}
                            className="w-full mt-4"
                        >
                            + Add New Field
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => {
                    setShowSuccess(false)
                    setIsEditing(false)
                }}
                title="Profile Updated"
                description="Your profile information has been successfully updated."
            />
        </>
    )
}
