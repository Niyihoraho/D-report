"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { SuccessModal } from "@/components/ui/success-modal"

interface RegisterMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceId: string
    onSuccess: () => void
}

export function RegisterMemberDialog({
    open,
    onOpenChange,
    workspaceId,
    onSuccess
}: RegisterMemberDialogProps) {
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        regionalName: "",
        email: "",
        phone: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim()) {
            toast.error("Name is required")
            return
        }
        if (!formData.email.trim()) {
            toast.error("Email is required")
            return
        }
        if (!formData.phone.trim()) {
            toast.error("Phone number is required")
            return
        }

        setLoading(true)
        try {
            const payload = {
                profileData: {
                    name: formData.name,
                    regionalName: formData.regionalName,
                    email: formData.email,
                    phone: formData.phone
                },
                status: 'ACTIVE'
            }

            console.log('Sending member registration:', payload)

            const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            console.log('Response status:', response.status)

            if (!response.ok) {
                let errorData: any = {}
                try {
                    errorData = await response.json()
                } catch (e) {
                    console.error('Failed to parse error response JSON', e)
                }

                console.error('Server returned error:', response.status, errorData)
                throw new Error(errorData.error || errorData.message || 'Failed to register member')
            }

            // Show success modal
            setShowSuccess(true)

            // Reset form
            setFormData({
                name: "",
                regionalName: "",
                email: "",
                phone: ""
            })

            // Trigger parent success callback
            onSuccess()

            // Close main dialog after a short delay to let success modal show
            setTimeout(() => {
                setShowSuccess(false)
                onOpenChange(false)
            }, 2000)
        } catch (error: any) {
            toast.error(error.message || 'Failed to register member')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Register New Member</DialogTitle>
                        <DialogDescription>
                            Add a new member to this workspace
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Regional Name */}
                        <div className="space-y-2">
                            <Label htmlFor="regionalName">
                                Regional Name
                            </Label>
                            <Input
                                id="regionalName"
                                placeholder="Enter regional name (optional)"
                                value={formData.regionalName}
                                onChange={(e) => handleChange('regionalName', e.target.value)}
                                disabled={loading}
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
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    'Register Member'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Member Registered"
                description="The new member has been successfully added to the workspace."
            />
        </>
    )
}
