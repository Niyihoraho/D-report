"use client"

import { PageHeader } from "@/components/PageHeader"
import { ContentCard } from "@/components/ContentCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconClipboardList, IconCalendar, IconCheck } from "@tabler/icons-react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AssignmentsPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.id as string
    const [stats, setStats] = useState<any>(null)
    const [activeAssignments, setActiveAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/workspaces/${workspaceId}/stats/assignments`)
                if (!response.ok) throw new Error('Failed to fetch stats')
                const data = await response.json()
                setStats(data.stats)
                setActiveAssignments(data.activeAssignments || [])
            } catch (error) {
                console.error(error)
                // toast.error('Failed to load assignment dashboard')
            } finally {
                setLoading(false)
            }
        }
        if (workspaceId) fetchData()
    }, [workspaceId])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Assignments"

            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Assignments */}
                <div className="lg:col-span-2 space-y-6">
                    <ContentCard title="Active Assignments">
                        {activeAssignments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No active assignments found.</div>
                        ) : (
                            <div className="space-y-4">
                                {activeAssignments.map((task, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={task.id}
                                        onClick={() => router.push(`/workspaces/${workspaceId}/assignments/${task.id}`)}
                                        className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#2C2F36]/50 hover:bg-white dark:hover:bg-[#2C2F36] hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                                                    <IconClipboardList className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#11142D] dark:text-white group-hover:text-[#6C5DD3] transition-colors">{task.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <IconCalendar className="h-3 w-3" />
                                                        {task.due}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={task.status === "Urgent" ? "destructive" : task.status === "Completed" ? "outline" : "secondary"}>
                                                {task.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Progress</span>
                                                <span>{task.total > 0 ? Math.round((task.completed / task.total) * 100) : 0}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${task.status === "Urgent" ? "bg-red-500" : task.status === "Completed" ? "bg-green-500" : "bg-[#6C5DD3]"}`}
                                                    style={{ width: `${task.total > 0 ? (task.completed / task.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{task.completed} completed</span>
                                                <span>{task.total} total</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </ContentCard>
                </div>

                {/* Stats / Summary */}
                <div className="space-y-6">
                    <ContentCard title="Overview">
                        <div className="space-y-6">
                            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] text-white shadow-lg shadow-purple-500/20">
                                <h3 className="text-4xl font-bold mb-1">{stats?.completionRate || 0}%</h3>
                                <p className="text-white/80 text-sm">Completion Rate</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.completed || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.inProgress || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overdue</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats?.overdue || 0}</span>
                                </div>
                            </div>
                        </div>
                    </ContentCard>
                </div>
            </div>
        </div>
    )
}
