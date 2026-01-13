import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Building2, Briefcase, GraduationCap, Users } from "lucide-react"

export type WorkspaceType = "MINISTRY" | "CONSTRUCTION" | "TRAINING" | "GENERAL"

interface WorkspaceTypeBadgeProps {
    type: WorkspaceType
    className?: string
}

const typeConfig = {
    MINISTRY: {
        label: "Ministry",
        icon: Users,
        variant: "default", // Purple in this theme usually
        className: "bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white"
    },
    CONSTRUCTION: {
        label: "Construction",
        icon: Briefcase,
        variant: "secondary",
        className: "bg-[#F2994A] hover:bg-[#e08a3e] text-white"
    },
    TRAINING: {
        label: "Training",
        icon: GraduationCap,
        variant: "secondary",
        className: "bg-[#2F80ED] hover:bg-[#256dc9] text-white"
    },
    GENERAL: {
        label: "General",
        icon: Building2,
        variant: "outline",
        className: "border-[#6C5DD3] text-[#6C5DD3]"
    }
}

export function WorkspaceTypeBadge({ type, className }: WorkspaceTypeBadgeProps) {
    const config = typeConfig[type]
    const Icon = config.icon

    return (
        <Badge
            variant={config.variant as any}
            className={cn("gap-1.5 py-1 px-3", config.className, className)}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    )
}
