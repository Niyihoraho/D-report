"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { IconDots, IconEdit, IconTrash, IconEye } from "@tabler/icons-react"

interface ActionMenuProps {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
    customActions?: Array<{
        label: string
        icon: React.ReactNode
        onClick: () => void
        variant?: "default" | "destructive"
    }>
}

export function ActionMenu({ onView, onEdit, onDelete, customActions }: ActionMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gray-400 hover:text-[#11142D] dark:hover:text-white"
                >
                    <IconDots className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg">
                {onView && (
                    <DropdownMenuItem onClick={onView}>
                        <IconEye className="mr-2 h-4 w-4" />
                        View
                    </DropdownMenuItem>
                )}
                {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                )}
                {customActions && customActions.map((action, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={action.onClick}
                        className={action.variant === "destructive" ? "text-[#EB5757]" : ""}
                    >
                        <span className="mr-2 flex items-center justify-center">{action.icon}</span>
                        {action.label}
                    </DropdownMenuItem>
                ))}
                {onDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-[#EB5757]">
                            <IconTrash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
