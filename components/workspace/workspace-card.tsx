"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WorkspaceTypeBadge, WorkspaceType } from "./workspace-type-badge"
import { MoreHorizontal, Users, Edit, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { WorkspaceActions } from "./workspace-actions"
import { useState } from "react"
import { toast } from "sonner"

interface WorkspaceCardProps {
    workspace: {
        id: string
        name: string
        slug: string
        type: WorkspaceType
        memberCount: number
        createdAt: string
        description?: string | null
    }
    onDelete?: () => void
    onUpdate?: () => void
}

export function WorkspaceCard({ workspace, onDelete, onUpdate }: WorkspaceCardProps) {


    return (
        <>
            <div className="glass-card rounded-[24px] p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
                {/* Decorative gradient background opacity */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-white/0 pointer-events-none" />

                <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <WorkspaceTypeBadge type={workspace.type} />
                        <WorkspaceActions
                            workspace={workspace}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#11142D] dark:text-white mb-2 group-hover:text-[#6C5DD3] transition-colors">
                            {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active Workspace
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">


                        <Link href={`/workspaces/${workspace.id}`} className="text-sm font-medium text-[#6C5DD3] hover:underline flex items-center gap-1">
                            Open Workspace <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </div>

                {/* Full card clickable overlay */}
                <Link href={`/workspaces/${workspace.id}`} className="absolute inset-0 z-0" aria-label={`Open ${workspace.name}`} />
            </div>
        </>
    )
}

