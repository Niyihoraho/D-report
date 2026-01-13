import { PageHeader } from "@/components/PageHeader"
import { ContentCard } from "@/components/ContentCard"
import { EmptyState } from "@/components/EmptyState"
import { IconMail } from "@tabler/icons-react"
import { BreadcrumbNav } from "@/components/BreadcrumbNav"

export default function InviteUserPage() {
    return (
        <>
            <BreadcrumbNav
                items={[
                    { label: "Dashboard", href: "/admin/dashboard" },
                    { label: "Users", href: "/admin/users" },
                    { label: "Invite" }
                ]}
            />
            <PageHeader title="Invite User" />

            <ContentCard title="Send Invitation">
                <div className="flex items-center justify-center py-12">
                    <EmptyState
                        icon={<IconMail className="h-10 w-10" />}
                        title="Invite System Coming Soon"
                        description="You will be able to send email invitations to new users here."
                    />
                </div>
            </ContentCard>
        </>
    )
}
