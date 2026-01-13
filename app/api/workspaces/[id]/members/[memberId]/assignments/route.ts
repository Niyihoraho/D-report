import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/members/[memberId]/assignments
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const { id: workspaceId, memberId } = params

        // Verify member exists and belongs to workspace
        const member = await prisma.userWorkspaceRole.findUnique({
            where: { id: memberId }
        })

        if (!member || member.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Member not found in this workspace' },
                { status: 404 }
            )
        }

        // Fetch all assignments for this member
        const assignments = await prisma.formAssignment.findMany({
            where: { memberId },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        submitLabel: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Add public URLs to each assignment
        const assignmentsWithUrls = assignments.map(assignment => ({
            ...assignment,
            publicUrl: `/forms/assignments/${assignment.publicSlug}`
        }))

        return NextResponse.json(assignmentsWithUrls)
    } catch (error) {
        console.error('Error fetching assignments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        )
    }
}
