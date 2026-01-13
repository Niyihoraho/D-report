"use client"

import { Button } from "@/components/ui/button"

interface FilterTab {
    label: string
    value: string
    count?: number
}

interface FilterTabsProps {
    tabs: FilterTab[]
    activeTab: string
    onChange: (value: string) => void
}

export function FilterTabs({ tabs, activeTab, onChange }: FilterTabsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
                <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? "secondary" : "ghost"}
                    onClick={() => onChange(tab.value)}
                    className={`rounded-full whitespace-nowrap ${activeTab === tab.value
                            ? "bg-white dark:bg-[#1F2128] hover:bg-gray-100 dark:hover:bg-[#2C2F36] shadow-sm"
                            : "text-gray-500 hover:text-[#11142D] dark:hover:text-white"
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className="ml-2 text-xs opacity-60">({tab.count})</span>
                    )}
                </Button>
            ))}
        </div>
    )
}
