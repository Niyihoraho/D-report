import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbNavProps {
    items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-[#6C5DD3] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-[#11142D] dark:text-white font-medium">
                            {item.label}
                        </span>
                    )}
                    {index < items.length - 1 && (
                        <IconChevronRight className="h-4 w-4" />
                    )}
                </div>
            ))}
        </div>
    )
}
