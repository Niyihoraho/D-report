"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
    IconBell,
    IconMail,
    IconMoon,
    IconSearch,
    IconSun,
    IconUser,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function TopNav() {
    const pathname = usePathname()
    const { setTheme, theme } = useTheme()

    if (pathname?.startsWith("/register") || pathname?.startsWith("/forms")) return null

    // Determine context
    // Path: /workspaces -> segments: ['', 'workspaces'] -> Global
    // Path: /workspaces/123 -> segments: ['', 'workspaces', '123'] -> Workspace Context
    const segments = pathname?.split('/') || []
    const isWorkspaceContext = segments[1] === 'workspaces' && segments.length > 2
    const workspaceId = isWorkspaceContext ? segments[2] : null

    // Define Navigation Items
    const globalNavItems = [
        {
            title: "Workspaces",
            href: "/workspaces",
        },
        {
            title: "Fixed",
            href: "/fixed",
        },
    ]

    const workspaceNavItems = workspaceId ? [
        {
            title: "Members",
            href: `/workspaces/${workspaceId}/members`,
        },
        {
            title: "Form Builder",
            href: `/workspaces/${workspaceId}/registration`,
        },
        {
            title: "Data",
            href: `/workspaces/${workspaceId}/data`,
        },
        {
            title: "Templates",
            href: `/workspaces/${workspaceId}/templates`,
        },
        {
            title: "Assignments",
            href: `/workspaces/${workspaceId}/assignments`,
        },
    ] : []

    const currentNavItems = isWorkspaceContext ? workspaceNavItems : globalNavItems

    return (
        <header className="sticky top-4 z-50 w-full px-4">
            <div className="glass-card flex h-20 items-center justify-between rounded-[24px] px-8 transition-all duration-300 hover:shadow-2xl">
                {/* Logo */}
                <Link href={isWorkspaceContext ? `/workspaces/${workspaceId}` : "/workspaces"} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/30 text-white transform hover:scale-105 transition-transform duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5] leading-none">
                            {isWorkspaceContext ? "Workspace" : "Inntegrate"}
                        </span>
                        {isWorkspaceContext && (
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                                Environment
                            </span>
                        )}
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-2 bg-[#F5F6FA] dark:bg-[#1F2128] p-1.5 rounded-full border border-gray-100 dark:border-gray-800">
                    {currentNavItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${isActive
                                    ? "bg-white dark:bg-[#2C2F36] text-[#6C5DD3] shadow-sm dark:text-white"
                                    : "text-gray-500 hover:text-[#6C5DD3] dark:text-gray-400 dark:hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full bg-white dark:bg-[#2C2F36] shadow-sm -z-10 animate-in fade-in zoom-in duration-200" />
                                )}
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <div className="relative hidden lg:block group">
                        <IconSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C5DD3] transition-colors" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="h-11 w-64 rounded-full border-2 border-transparent bg-gray-50 dark:bg-[#1F2128]/50 pl-11 text-sm font-medium focus:bg-white dark:focus:bg-[#1F2128] focus:border-[#6C5DD3]/20 focus:shadow-lg focus:shadow-[#6C5DD3]/10 transition-all duration-300"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#1F2128] transition-all hover:scale-110"
                        >
                            <IconSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-400" />
                            <IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#6C5DD3]" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <div className="text-right hidden xl:block">
                                <p className="text-sm font-bold text-[#11142D] dark:text-white leading-tight">Admin User</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-full p-1 border-2 border-transparent hover:border-[#6C5DD3] transition-all duration-300"
                            >
                                <img
                                    src="https://github.com/shadcn.png"
                                    alt="User"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
