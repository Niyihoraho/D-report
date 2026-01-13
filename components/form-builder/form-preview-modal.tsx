"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DynamicForm } from "@/components/registration/dynamic-form"
import { Eye } from "lucide-react"
import { FormField } from "./types"

interface FormPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    fields: FormField[]
    submitLabel?: string
}

export function FormPreviewModal({ isOpen, onClose, fields, submitLabel }: FormPreviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-[90vw] p-0 overflow-hidden bg-white dark:bg-[#1F2128] border border-gray-200 dark:border-gray-800 shadow-2xl">
                {/* Clean Header */}
                <DialogHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#6C5DD3]/10 dark:bg-[#6C5DD3]/20 flex items-center justify-center text-[#6C5DD3]">
                            <Eye className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-[#11142D] dark:text-white">
                                Form Preview
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                                Review how your form will appear to users
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Content */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                    <div className="mx-auto max-w-xl">
                        <DynamicForm
                            fields={fields}
                            onSubmit={(data) => console.log('Preview Submit:', data)}
                            submitLabel={submitLabel}
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            This is a preview. No data will be saved.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
