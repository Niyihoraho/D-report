"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/PageHeader"
import { StatCard } from "@/components/StatCard"
import { ContentCard } from "@/components/ContentCard"
import {
    IconUsers,
    IconFileText,
    IconClipboardList,
    IconSitemap,
    IconUserPlus,
    IconLayoutGrid
} from "@tabler/icons-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface WorkspaceStats {
    totalMembers: number
    activeMembers: number
    formTemplates: number
    units: number
}

interface WorkspaceData {
    id: string
    name: string
    description: string
    type: string
    stats: WorkspaceStats
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export default function WorkspaceDashboardPage() {
    const params = useParams()
    const workspaceId = params.id as string
    const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceData()
        }
    }, [workspaceId])

    const fetchWorkspaceData = async () => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}`)
            if (!response.ok) {
                if (response.status === 404) throw new Error('Workspace not found')
                throw new Error('Failed to fetch workspace')
            }
            const data = await response.json()
            setWorkspace(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
            </div>
        )
    }

    if (error || !workspace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="text-red-500 font-medium">{error || 'Workspace not found'}</div>
                <Link href="/workspaces">
                    <Button variant="outline">Return to Workspaces</Button>
                </Link>
            </div>
        )
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6"
        >
            <PageHeader
                title={workspace.name}
                actionLabel="Settings"
                onAction={() => { }} // Placeholder for now
            />

            <p className="text-gray-500 dark:text-gray-400 -mt-4">
                {workspace.description || `Manage your ${workspace.type.toLowerCase()} workspace`}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Members"
                    value={workspace.stats.totalMembers}
                    icon={<IconUsers className="h-6 w-6" />}
                    iconBgColor="bg-[#DDF1FF] dark:bg-[#2F80ED]/20"
                    iconColor="text-[#2F80ED]"
                    delay={0.1}
                />

                <StatCard
                    title="Active Members"
                    value={workspace.stats.activeMembers}
                    icon={<IconUserPlus className="h-6 w-6" />}
                    iconBgColor="bg-[#D6F3E0] dark:bg-[#27AE60]/20"
                    iconColor="text-[#27AE60]"
                    delay={0.2}
                />

                <StatCard
                    title="Form Templates"
                    value={workspace.stats.formTemplates}
                    icon={<IconFileText className="h-6 w-6" />}
                    iconBgColor="bg-[#FFF4D9] dark:bg-[#F2994A]/20"
                    iconColor="text-[#F2994A]"
                    delay={0.3}
                />

                <StatCard
                    title="Units / Groups"
                    value={workspace.stats.units}
                    icon={<IconSitemap className="h-6 w-6" />}
                    iconBgColor="bg-[#E4D7FF] dark:bg-[#6C5DD3]/20"
                    iconColor="text-[#6C5DD3]"
                    delay={0.4}
                />
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-[#11142D] dark:text-white mt-8 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href={`/workspaces/${workspaceId}/members`}>
                    <motion.div
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-6 rounded-[24px] bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/20 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconUsers className="h-24 w-24 text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <IconUsers className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Manage Members</h3>
                                <p className="text-white/80 text-sm mt-1">View and manage workspace members</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                <Link href={`/workspaces/${workspaceId}/data`}>
                    <motion.div
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-6 rounded-[24px] bg-gradient-to-br from-[#27AE60] to-[#219653] shadow-lg shadow-[#27AE60]/20 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconLayoutGrid className="h-24 w-24 text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <IconLayoutGrid className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Data</h3>
                                <p className="text-white/80 text-sm mt-1">View all collected submissions</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                <Link href={`/workspaces/${workspaceId}/registration`}>
                    <motion.div
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-6 rounded-[24px] bg-gradient-to-br from-[#2F80ED] to-[#2563eb] shadow-lg shadow-[#2F80ED]/20 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconFileText className="h-24 w-24 text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <IconFileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Form Builder</h3>
                                <p className="text-white/80 text-sm mt-1">Customize registration forms</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                <Link href={`/workspaces/${workspaceId}/assignments`}>
                    <motion.div
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-6 rounded-[24px] bg-gradient-to-br from-[#F2994A] to-[#F2C94C] shadow-lg shadow-[#F2994A]/20 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconClipboardList className="h-24 w-24 text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <IconClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Assignments</h3>
                                <p className="text-white/80 text-sm mt-1">Manage tasks and assignments</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </div>
        </motion.div>
    )
}
