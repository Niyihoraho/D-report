"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatFieldName, formatFieldValue, organizeProfileData } from "@/lib/profile-utils"
import { IconUser, IconMail, IconPhone, IconMapPin, IconCalendar } from "@tabler/icons-react"
import { motion } from "framer-motion"

interface ProfileDisplayProps {
    profileData: Record<string, any>
    userName: string
    userEmail: string
    workspaceName: string
    memberSince: Date
    role: string
    status: string
}

export function ProfileDisplay({
    profileData,
    userName,
    userEmail,
    workspaceName,
    memberSince,
    role,
    status
}: ProfileDisplayProps) {
    const { personal, contact, additional } = organizeProfileData(profileData)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'SUSPENDED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
            case 'MANAGER':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-none shadow-lg bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                                    <IconUser className="h-10 w-10" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-1">{userName}</h1>
                                    <p className="text-white/80 flex items-center gap-2">
                                        <IconMail className="h-4 w-4" />
                                        {userEmail}
                                    </p>
                                    <p className="text-white/80 text-sm mt-1">
                                        Member of {workspaceName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <Badge className={getRoleColor(role)}>
                                    {role}
                                </Badge>
                                <Badge className={getStatusColor(status)}>
                                    {status}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-white/80 text-sm">
                            <IconCalendar className="h-4 w-4" />
                            Member since {new Date(memberSince).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Personal Information */}
            {Object.keys(personal).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconUser className="h-5 w-5 text-[#6C5DD3]" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(personal).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {formatFieldName(key)}
                                        </p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {formatFieldValue(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Contact Information */}
            {Object.keys(contact).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconMapPin className="h-5 w-5 text-[#6C5DD3]" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(contact).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {formatFieldName(key)}
                                        </p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {formatFieldValue(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Additional Information */}
            {Object.keys(additional).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconPhone className="h-5 w-5 text-[#6C5DD3]" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(additional).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {formatFieldName(key)}
                                        </p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {formatFieldValue(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
