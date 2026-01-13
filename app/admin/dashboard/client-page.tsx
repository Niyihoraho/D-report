"use client"

import { PageHeader } from "@/components/PageHeader"
import { StatCard } from "@/components/StatCard"
import { ContentCard } from "@/components/ContentCard"
import { IconBuilding, IconUsers, IconFileText, IconClipboardList, IconTrendingUp, IconClock, IconSitemap } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface DashboardStats {
    totalUsers: number
    totalTemplates: number
    activeAssignments: number
    pendingSubmissions: number
    completedThisMonth: number
}

interface RecentActivity {
    id: string
    type: string
    description: string
    timestamp: Date
    user?: string
}

interface DashboardClientPageProps {
    stats: DashboardStats
    recentActivity: RecentActivity[]
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

export default function DashboardClientPage({ stats, recentActivity }: DashboardClientPageProps) {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6"
        >
            <PageHeader
                title="Dashboard"
                actionLabel="Quick Actions"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<IconUsers className="h-6 w-6" />}
                    iconBgColor="bg-[#DDF1FF] dark:bg-[#2F80ED]/20"
                    iconColor="text-[#2F80ED]"
                    delay={0.1}
                />

                <StatCard
                    title="Templates"
                    value={stats.totalTemplates}
                    icon={<IconFileText className="h-6 w-6" />}
                    iconBgColor="bg-[#FFF4D9] dark:bg-[#F2994A]/20"
                    iconColor="text-[#F2994A]"
                    delay={0.2}
                />

                <StatCard
                    title="Active Assignments"
                    value={stats.activeAssignments}
                    icon={<IconClipboardList className="h-6 w-6" />}
                    iconBgColor="bg-[#D6F3E0] dark:bg-[#27AE60]/20"
                    iconColor="text-[#27AE60]"
                    delay={0.3}
                />

                <StatCard
                    title="Pending Submissions"
                    value={stats.pendingSubmissions}
                    icon={<IconClock className="h-6 w-6" />}
                    iconBgColor="bg-[#FFE5E6] dark:bg-[#EB5757]/20"
                    iconColor="text-[#EB5757]"
                    delay={0.4}
                />

                <StatCard
                    title="Completed This Month"
                    value={stats.completedThisMonth}
                    icon={<IconTrendingUp className="h-6 w-6" />}
                    iconBgColor="bg-[#E4D7FF] dark:bg-[#6C5DD3]/20"
                    iconColor="text-[#6C5DD3]"
                    trend={{ value: "+12%", positive: true }}
                    delay={0.5}
                />
            </div>

            {/* Quick Actions */}
            <motion.div
                variants={item}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <Link href="/admin/structure" className="block h-full">
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="rounded-[24px] bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] p-6 shadow-lg shadow-[#6C5DD3]/20 h-full relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconSitemap className="h-24 w-24 text-white" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-white/30 transition-colors">
                                <IconSitemap className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Manage Structure</h3>
                                <p className="text-white/80 text-sm">Update hierarchy & units</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                <Link href="/admin/templates/new" className="block h-full">
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="rounded-[24px] bg-gradient-to-br from-[#2F80ED] to-[#2563eb] p-6 shadow-lg shadow-[#2F80ED]/20 h-full relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconFileText className="h-24 w-24 text-white" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-white/30 transition-colors">
                                <IconFileText className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">New Template</h3>
                                <p className="text-white/80 text-sm">Create report template</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                <Link href="/admin/users/invite" className="block h-full">
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="rounded-[24px] bg-gradient-to-br from-[#27AE60] to-[#229954] p-6 shadow-lg shadow-[#27AE60]/20 h-full relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                            <IconUsers className="h-24 w-24 text-white" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-white/30 transition-colors">
                                <IconUsers className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Invite User</h3>
                                <p className="text-white/80 text-sm">Add team member</p>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={item}>
                    <ContentCard
                        title="Recent Activity"
                        description="Latest actions across the organization"
                    >
                        <div className="space-y-2">
                            {recentActivity.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">No recent activity</p>
                            ) : (
                                recentActivity.map((activity, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        key={activity.id}
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2C2F36] transition-colors group cursor-default"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-[#6C5DD3] mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                                        <div className="flex-1">
                                            <p className="text-sm text-[#11142D] dark:text-white font-medium group-hover:text-[#6C5DD3] transition-colors">
                                                {activity.description}
                                            </p>
                                            {activity.user && (
                                                <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </ContentCard>
                </motion.div>

                <motion.div variants={item}>
                    <ContentCard
                        title="System Overview"
                        description="Platform health and status"
                    >
                        <div className="space-y-4">
                            {[
                                { name: "Database", sub: "PostgreSQL", status: "bg-[#27AE60]" },
                                { name: "Storage", sub: "File uploads active", status: "bg-[#27AE60]" },
                                { name: "Email Service", sub: "Ready for invites", status: "bg-[#27AE60]" }
                            ].map((item, i) => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    key={i}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#2C2F36] border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-[#11142D] dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.sub}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-[#27AE60]">Operational</span>
                                        <div className={`h-2.5 w-2.5 rounded-full ${item.status} animate-pulse shadow-[0_0_10px_rgba(39,174,96,0.6)]`} />
                                    </div>
                                </motion.div>
                            ))}

                            <Link href="/admin/settings">
                                <Button variant="outline" className="w-full rounded-full mt-4 hover:bg-[#6C5DD3] hover:text-white hover:border-[#6C5DD3] transition-all duration-300">
                                    View System Settings
                                </Button>
                            </Link>
                        </div>
                    </ContentCard>
                </motion.div>
            </div>
        </motion.div>
    )
}
