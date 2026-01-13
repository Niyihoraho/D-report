"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate login
        setTimeout(() => {
            setIsLoading(false)
            console.log("Logged in")
        }, 2000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C5DD3] rounded-full filter blur-[80px] opacity-20" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2F80ED] rounded-full filter blur-[60px] opacity-20" />

                <div className="text-center relative z-10">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] flex items-center justify-center text-white shadow-lg shadow-[#6C5DD3]/30 mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-[#11142D] dark:text-white">Welcome Back</h2>
                    <p className="mt-2 text-gray-500 text-sm">
                        Sign in to access your workspaces
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-gray-800 focus:border-[#6C5DD3]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-xs text-[#6C5DD3] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-gray-800 focus:border-[#6C5DD3]"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm font-normal text-gray-500">Remember me for 30 days</Label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb3] text-lg font-semibold shadow-lg shadow-[#6C5DD3]/25"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 relative z-10">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[#6C5DD3] font-semibold hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    )
}
