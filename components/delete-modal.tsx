"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
    itemName?: string
    loading?: boolean
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item",
    description = "This action cannot be undone.",
    itemName,
    loading = false
}: DeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[320px] p-0 overflow-hidden bg-white dark:bg-[#1F2128] border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl">
                <div className="p-5 text-center">
                    <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-[#11142D] dark:text-white text-center">
                            {title}
                        </DialogTitle>
                        <div className="mt-2 text-center">
                            {itemName && (
                                <p className="text-sm font-medium text-[#11142D] dark:text-gray-200 mb-1 truncate px-2">
                                    "{itemName}"
                                </p>
                            )}
                            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="grid grid-cols-2 gap-0 border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="h-12 rounded-none text-gray-600 dark:text-gray-400 hover:text-[#11142D] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="h-12 rounded-none bg-white dark:bg-[#1F2128] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 shadow-none font-medium"
                    >
                        {loading ? '...' : 'Delete'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
