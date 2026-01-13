import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // 1. Fetch form templates with their assignment stats
        // We only care about templates that have at least one assignment
        const templatesWithAssignments = await prisma.formTemplate.findMany({
            where: {
                workspaceId: id,
                assignments: {
                    some: {} // Only templates with assignments
                }
            },
            select: {
                id: true,
                name: true,
                assignments: {
                    select: {
                        id: true,
                        status: true,
                        dueDate: true,
                        createdAt: true
                    }
                }
            }
        })

        // 2. Process data for "Active Assignments" and Global Stats
        let globalTotal = 0
        let globalCompleted = 0
        let globalInProgress = 0
        let globalOverdue = 0

        const activeAssignments = templatesWithAssignments.map(template => {
            const total = template.assignments.length
            const completed = template.assignments.filter(a =>
                a.status === 'SUBMITTED' || a.status === 'COMPLETED'
            ).length
            const inProgress = template.assignments.filter(a =>
                a.status === 'PENDING' || a.status === 'IN_PROGRESS'
            ).length

            // Check for overdue assignments (not completed and past due date)
            const now = new Date()
            const overdueCount = template.assignments.filter(a =>
                (a.status === 'PENDING' || a.status === 'IN_PROGRESS') &&
                a.dueDate && new Date(a.dueDate) < now
            ).length

            // Calculate "Days Left" or Status for the template card
            // Logic: Find the earliest due date of INCOMPLETE assignments
            const pendingWithDueDates = template.assignments
                .filter(a => (a.status === 'PENDING' || a.status === 'IN_PROGRESS') && a.dueDate)
                .map(a => new Date(a.dueDate!).getTime())
                .sort((a, b) => a - b) // Ascending order

            let timeStatus = "No Due Date"
            let badgeStatus = "In Progress"

            if (overdueCount > 0) {
                timeStatus = "Overdue"
                badgeStatus = "Urgent"
            } else if (pendingWithDueDates.length > 0) {
                // Determine days left for the soonest due date
                const soonestDue = pendingWithDueDates[0]
                const diffTime = soonestDue - now.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays < 0) {
                    timeStatus = "Overdue"
                    badgeStatus = "Urgent"
                } else if (diffDays === 0) {
                    timeStatus = "Due Today"
                    badgeStatus = "Urgent"
                } else {
                    timeStatus = `${diffDays} days left`
                }
            } else if (total === completed && total > 0) {
                timeStatus = "Completed"
                badgeStatus = "Completed"
            }

            // Update global stats
            globalTotal += total
            globalCompleted += completed
            globalInProgress += inProgress
            globalOverdue += overdueCount

            return {
                id: template.id,
                title: template.name,
                due: timeStatus,
                completed,
                total,
                status: badgeStatus
            }
        })

        const completionRate = globalTotal > 0 ? Math.round((globalCompleted / globalTotal) * 100) : 0

        return NextResponse.json({
            stats: {
                completionRate,
                completed: globalCompleted,
                inProgress: globalInProgress,
                overdue: globalOverdue
            },
            activeAssignments
        })

    } catch (error) {
        console.error('Error fetching assignment stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch assignment stats' },
            { status: 500 }
        )
    }
}
