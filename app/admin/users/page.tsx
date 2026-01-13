import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"
import { IconUsers } from "@tabler/icons-react"

export default function UsersPage() {
    return (
        <>
            <PageHeader title="Users" actionLabel="Invite User" />
            <div className="rounded-[20px] bg-white dark:bg-[#1F2128] p-6 shadow-sm min-h-[400px] flex items-center justify-center">
                <EmptyState
                    icon={<IconUsers className="h-8 w-8" />}
                    title="Coming Soon"
                    description="User management will be implemented in Phase 2."
                />
            </div>
        </>
    )
}
