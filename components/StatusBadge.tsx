import { AssignmentStatus } from "@prisma/client"

interface StatusBadgeProps {
    status: AssignmentStatus | "ACTIVE" | "INACTIVE"
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        PENDING: {
            bg: "bg-[#E4D7FF]",
            text: "text-[#6C5DD3]",
            label: "Pending"
        },
        IN_PROGRESS: {
            bg: "bg-[#FFF4D9]",
            text: "text-[#F2994A]",
            label: "In Progress"
        },
        SUBMITTED: {
            bg: "bg-[#DDF1FF]",
            text: "text-[#2F80ED]",
            label: "Submitted"
        },
        APPROVED: {
            bg: "bg-[#D6F3E0]",
            text: "text-[#27AE60]",
            label: "Approved"
        },
        REJECTED: {
            bg: "bg-[#FFE5E6]",
            text: "text-[#EB5757]",
            label: "Rejected"
        },
        ACTIVE: {
            bg: "bg-[#D6F3E0]",
            text: "text-[#27AE60]",
            label: "Active"
        },
        INACTIVE: {
            bg: "bg-[#FFE5E6]",
            text: "text-[#EB5757]",
            label: "Inactive"
        }
    }

    const style = styles[status] || styles.PENDING

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    )
}
