import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/data - Fetch all submissions (assigned + public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workspaceId } = await params
        const { searchParams } = new URL(request.url)
        const templateId = searchParams.get('templateId')
        const status = searchParams.get('status')

        // Fetch all form assignments
        const assignments = await prisma.formAssignment.findMany({
            where: {
                member: { workspaceId },
                ...(templateId && { templateId }),
                ...(status && { status: status as any })
            },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        fields: true
                    }
                },
                member: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                },
                // Include submissions for multiple-submission assignments
                submissions: {
                    orderBy: { submittedAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Transform into unified data format
        const data: any[] = []

        assignments.forEach(assignment => {
            // Helper to map fields
            const fields = assignment.template.fields as any[] || []
            const fieldMap = fields.reduce((acc: Record<string, string>, field: any) => {
                if (field.id && field.label) acc[field.id] = field.label
                return acc
            }, {})

            const transformResponses = (responses: any) => {
                const transformed: Record<string, any> = {}
                if (responses) {
                    Object.entries(responses as Record<string, any>).forEach(([key, value]) => {
                        const label = fieldMap[key] || key
                        transformed[label] = value
                    })
                }
                return transformed
            }

            const baseData = {
                templateId: assignment.template.id,
                templateName: assignment.template.name,
                submittedBy: assignment.member.user.name || assignment.member.user.email,
                submittedByEmail: assignment.member.user.email,
                userId: assignment.member.user.id,
                memberId: assignment.member.id,
                publicSlug: assignment.publicSlug,
                dueDate: assignment.dueDate,
                status: assignment.status, // Default status
                submittedAt: assignment.submittedAt,
                createdAt: assignment.createdAt,
                updatedAt: assignment.updatedAt,
            }

            // Scenario 1: Multiple Submissions
            if (assignment.allowMultiple && assignment.submissions.length > 0) {
                assignment.submissions.forEach(sub => {
                    data.push({
                        ...baseData,
                        id: sub.id, // Use submission ID
                        assignmentId: assignment.id, // Grouping key
                        type: 'submission',
                        responses: transformResponses(sub.responses),
                        status: 'SUBMITTED', // Submissions are always submitted
                        submittedAt: sub.submittedAt,
                        createdAt: sub.createdAt
                    })
                })
            }
            // Scenario 2: Single Submission (Legacy or Standard)
            // Even if allowMultiple is true, if there are no sub-records but there is response data on the assignment itself (legacy), show it.
            // OR if it's standard single-mode.
            else if (assignment.responses || !assignment.allowMultiple) {
                data.push({
                    ...baseData,
                    id: assignment.id,
                    assignmentId: assignment.id, // Grouping key
                    type: 'assignment',
                    responses: transformResponses(assignment.responses),
                    // Use assignment status and dates
                })
            }
        })

        // Get unique templates for filtering
        const templates = await prisma.formTemplate.findMany({
            where: { workspaceId },
            select: {
                id: true,
                name: true
            }
        })

        return NextResponse.json({
            data,
            templates,
            total: data.length
        })
    } catch (error) {
        console.error('Error fetching workspace data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        )
    }
}
