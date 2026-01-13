"use client"

import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon: React.ReactNode
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-[#E4D7FF] dark:bg-[#6C5DD3]/20 flex items-center justify-center mb-4">
                <div className="text-[#6C5DD3] flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-[#11142D] dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white rounded-full px-6"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
