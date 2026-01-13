"use client"

import { PageHeader } from "@/components/PageHeader"
import { ContentCard } from "@/components/ContentCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { IconSearch, IconMail, IconShield } from "@tabler/icons-react"
import { motion } from "framer-motion"

export default function WorkspaceUsersPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Workspace Users"
                actionLabel="Invite User"
                onAction={() => { }}
            />

            <ContentCard title="Team Members" description="Manage access and permissions for this workspace">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                className="pl-9 bg-gray-50 dark:bg-[#2C2F36] border-none"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <IconShield className="h-4 w-4" />
                            Permissions
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {[
                            { name: "Admin User", email: "admin@example.com", role: "Owner", status: "Active" },
                            { name: "Sarah Wilson", email: "sarah@example.com", role: "Editor", status: "Active" },
                            { name: "James Miller", email: "james@example.com", role: "Viewer", status: "Pending" }
                        ].map((user, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#2C2F36] border border-transparent hover:border-[#6C5DD3]/20 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-[#11142D] dark:text-white">{user.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <IconMail className="h-3 w-3" />
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={user.role === "Owner" ? "default" : "secondary"} className={user.role === "Owner" ? "bg-[#6C5DD3]" : ""}>
                                        {user.role}
                                    </Badge>
                                    <span className={`text-xs font-medium ${user.status === "Active" ? "text-green-500" : "text-amber-500"}`}>
                                        {user.status}
                                    </span>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Edit
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ContentCard>
        </div>
    )
}
