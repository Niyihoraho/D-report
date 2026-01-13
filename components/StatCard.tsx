"use client"

import { motion } from "framer-motion"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: {
        value: string
        positive: boolean
    }
    iconBgColor?: string
    iconColor?: string
    delay?: number
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    iconBgColor = "bg-[#E4D7FF] dark:bg-[#6C5DD3]/20",
    iconColor = "text-[#6C5DD3]",
    delay = 0
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            className="rounded-[20px] bg-white dark:bg-[#1F2128] p-6 shadow-sm border border-transparent hover:border-[#E4D7FF] dark:hover:border-[#2C2F36] transition-colors relative overflow-hidden group"
        >


            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-[#11142D] dark:text-white mt-2 tracking-tight">
                        {value}
                    </h3>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${iconBgColor} flex items-center justify-center shrink-0 shadow-inner`}>
                    <div className={`${iconColor} flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
                        {icon}
                    </div>
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-2 mt-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.positive ? 'bg-[#D6F3E0] text-[#27AE60]' : 'bg-[#FFE5E6] text-[#EB5757]'}`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                </div>
            )}
        </motion.div>
    )
}

