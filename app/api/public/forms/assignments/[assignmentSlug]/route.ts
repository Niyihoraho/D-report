import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeProfileData } from '@/lib/profile-utils'

// GET /api/public/forms/assignments/[assignmentSlug]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ assignmentSlug: string }> }
) {
    try {
        const { assignmentSlug } = await params

        // Find the assignment by public slug
        const assignment = await prisma.formAssignment.findUnique({
            where: { publicSlug: assignmentSlug },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        fields: true,
                        submitLabel: true
                    }
                },
                member: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                createdAt: true
                            }
                        },
                        workspace: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                logoUrl: true,
                                primaryColor: true
                            }
                        }
                    }
                },
                submissions: {
                    orderBy: {
                        submittedAt: 'desc'
                    }
                }
            }
        })

        if (!assignment) {
            return NextResponse.json(
                { error: 'Form assignment not found' },
                { status: 404 }
            )
        }

        // Check if assignment is active
        if (!assignment.isActive) {
            return NextResponse.json(
                { error: 'This form assignment is no longer active' },
                { status: 403 }
            )
        }

        // Sanitize member profile data for public display
        const sanitizedProfileData = sanitizeProfileData(assignment.member.profileData)

        // Return assignment data
        return NextResponse.json({
            id: assignment.id,
            publicSlug: assignment.publicSlug,
            status: assignment.status,
            allowMultiple: assignment.allowMultiple,
            dueDate: assignment.dueDate,
            submittedAt: assignment.submittedAt,
            responses: assignment.responses, // Include existing responses for editing
            template: assignment.template,
            member: {
                ...assignment.member,
                profileData: sanitizedProfileData
            },
            history: assignment.submissions,
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt
        })
    } catch (error) {
        console.error('Error fetching form assignment:', error)
        return NextResponse.json(
            { error: 'Failed to fetch form assignment' },
            { status: 500 }
        )
    }
}
