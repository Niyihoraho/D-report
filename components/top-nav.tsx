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
    IconFiles,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { IconMenu2 } from "@tabler/icons-react"

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
        }
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
            <div className="glass-card flex h-20 items-center justify-between rounded-[24px] px-4 md:px-8 transition-all duration-300 hover:shadow-2xl">
                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <IconMenu2 className="h-6 w-6 text-gray-600 dark:text-white" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] border-r-0 bg-white dark:bg-[#0F111A]">
                            <SheetHeader className="text-left mb-6">
                                <SheetTitle className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] text-white">
                                        <IconFiles className="h-6 w-6" />
                                    </div>
                                    <span className="text-xl font-bold text-[#11142D] dark:text-white">
                                        Menu
                                    </span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2">
                                {currentNavItems.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <SheetClose key={item.href} asChild>
                                            <Link
                                                href={item.href}
                                                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive
                                                    ? "bg-[#6C5DD3]/10 text-[#6C5DD3]"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F2128]"
                                                    }`}
                                            >
                                                {item.title}
                                            </Link>
                                        </SheetClose>
                                    )
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <Link href={isWorkspaceContext ? `/workspaces/${workspaceId}` : "/workspaces"} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] shadow-lg shadow-[#6C5DD3]/30 text-white transform hover:scale-105 transition-transform duration-300">
                        <IconFiles className="h-6 w-6" />
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
                                className="h-11 w-11 rounded-full bg-gradient-to-br from-[#6C5DD3]/10 to-[#6C5DD3]/5 border-2 border-transparent hover:border-[#6C5DD3] hover:from-[#6C5DD3] hover:to-[#5b4eb3] transition-all duration-300 group"
                            >
                                <IconUser className="h-6 w-6 text-[#6C5DD3] group-hover:text-white transition-colors" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
