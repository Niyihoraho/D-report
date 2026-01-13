import DashboardClientPage from "./client-page"

async function getDashboardStats() {
    // TODO: Fetch real stats from database
    return {
        totalUsers: 0,
        totalTemplates: 0,
        activeAssignments: 0,
        pendingSubmissions: 0,
        completedThisMonth: 0
    }
}

async function getRecentActivity() {
    // TODO: Fetch recent activity from database
    return []
}

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()

    return <DashboardClientPage stats={stats} recentActivity={recentActivity} />
}
