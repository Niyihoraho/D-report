import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type MemberStatus = string

interface StatusBadgeProps {
    status: MemberStatus
    className?: string
}

const statusConfig: Record<string, { label: string, className: string }> = {
    ACTIVE: {
        label: "Active",
        className: "bg-[#D6F3E0] text-[#27AE60] hover:bg-[#cbf0d8]"
    },
    PENDING: {
        label: "Pending",
        className: "bg-[#FFF4D9] text-[#F2994A] hover:bg-[#ffecc2]"
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-[#FFE5E6] text-[#EB5757] hover:bg-[#ffced0]"
    },
    ARCHIVED: {
        label: "Archived",
        className: "bg-gray-100 text-gray-500 hover:bg-gray-200"
    },
    // Assignment Statuses
    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200"
    },
    SUBMITTED: {
        label: "Submitted",
        className: "bg-purple-100 text-purple-700 hover:bg-purple-200"
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-green-100 text-green-700 hover:bg-green-200"
    }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        className: "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }

    return (
        <Badge
            variant="outline"
            className={cn("border-transparent font-medium", config.className, className)}
        >
            {config.label}
        </Badge>
    )
}
