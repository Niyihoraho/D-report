"use client"

import { Input } from "@/components/ui/input"
import { IconSearch } from "@tabler/icons-react"

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
    return (
        <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 rounded-lg border-gray-200 dark:border-[#2C2F36] bg-transparent"
            />
        </div>
    )
}
