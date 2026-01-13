"use client"

import { Button } from "@/components/ui/button"
import { WorkspaceActions } from "@/components/workspace/workspace-actions"
import { WorkspaceTypeBadge } from "@/components/workspace/workspace-type-badge"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"
import { Plus, LayoutGrid } from "lucide-react"
import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"

interface Workspace {
    id: string
    name: string
    slug: string
    type: "MINISTRY" | "CONSTRUCTION" | "TRAINING" | "GENERAL"
    _count?: {
        members: number
    }
    createdAt: string
}

export default function WorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    useEffect(() => {
        fetchWorkspaces()
    }, [])

    const fetchWorkspaces = async () => {
        try {
            const response = await fetch('/api/workspaces')
            if (!response.ok) throw new Error('Failed to fetch workspaces')
            const data = await response.json()
            setWorkspaces(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading workspaces...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-red-500">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        My Workspaces
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your organizations and registration forms
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/25 px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Workspace
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                            <TableHead className="w-[350px] pl-6 h-14 text-xs font-semibold uppercase tracking-wider text-gray-400">Workspace Name</TableHead>
                            <TableHead className="h-14 text-xs font-semibold uppercase tracking-wider text-gray-400">Type</TableHead>

                            <TableHead className="h-14 text-xs font-semibold uppercase tracking-wider text-gray-400">Created At</TableHead>
                            <TableHead className="text-right pr-6 h-14 text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workspaces.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-16">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-2">
                                            <LayoutGrid className="w-8 h-8 opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No workspaces yet</h3>
                                        <p className="text-sm text-gray-500 max-w-[300px] mb-4">
                                            Create your first workspace to start managing organizations and generating reports.
                                        </p>
                                        <Button
                                            onClick={() => setCreateDialogOpen(true)}
                                            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb3] shadow-md shadow-[#6C5DD3]/20"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Workspace
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            workspaces.map((workspace) => (
                                <TableRow
                                    key={workspace.id}
                                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                                >
                                    <TableCell className="font-medium py-4 pl-6">
                                        <Link
                                            href={`/workspaces/${workspace.id}`}
                                            className="flex items-center gap-4 group/link"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5DD3]/10 to-[#6C5DD3]/5 flex items-center justify-center text-lg font-bold text-[#6C5DD3] shadow-sm group-hover/link:from-[#6C5DD3] group-hover/link:to-[#5b4eb3] group-hover/link:text-white transition-all duration-300">
                                                {workspace.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover/link:text-[#6C5DD3] transition-colors">
                                                    {workspace.name}
                                                </span>
                                                <span className="text-xs text-gray-400 font-normal">
                                                    {workspace.slug}
                                                </span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <WorkspaceTypeBadge type={workspace.type} className="shadow-none" />
                                    </TableCell>

                                    <TableCell className="text-sm text-gray-500 font-medium py-4">
                                        {new Date(workspace.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <WorkspaceActions
                                                workspace={{
                                                    ...workspace,
                                                    memberCount: workspace._count?.members || 0
                                                }}
                                                onDelete={fetchWorkspaces}
                                                onUpdate={fetchWorkspaces}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )
                        }
                    </TableBody>
                </Table>
            </div>

            <CreateWorkspaceDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchWorkspaces}
            />
        </div>
    )
}
