"use client"

import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"

interface PageHeaderProps {
    title: string
    actionLabel?: string
    onAction?: () => void
    icon?: React.ReactNode
}

export function PageHeader({ title, actionLabel, onAction, icon }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[#11142D] dark:text-white">
                {title}
            </h1>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white rounded-full px-6"
                >
                    {icon || <IconPlus className="mr-2 h-4 w-4" />}
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
