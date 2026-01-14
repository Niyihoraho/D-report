import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    const { id, templateId } = await params
    try {
        const assignments = await prisma.formAssignment.findMany({
            where: {
                templateId: templateId,
                template: {
                    workspaceId: id
                }
            },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                template: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Determine base URL dynamically
        const host = request.headers.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

        const formattedAssignments = assignments.map(assignment => ({
            id: assignment.id,
            member: {
                name: assignment.member.user.name || (assignment.member.profileData as any)?.name || 'Unknown',
                email: assignment.member.user.email,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignment.memberId}`
            },
            status: assignment.status,
            dueDate: assignment.dueDate,
            submittedAt: assignment.submittedAt,
            publicSlug: assignment.publicSlug,
            publicLink: `${baseUrl}/forms/assignments/${assignment.publicSlug}`
        }))

        return NextResponse.json(formattedAssignments)

    } catch (error) {
        console.error('Error fetching template assignments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch template assignments' },
            { status: 500 }
        )
    }
}
