import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateFormAssignmentSlug } from '@/lib/form-assignment-utils'

// POST /api/workspaces/[id]/members/[memberId]/assign-form
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        const { id: workspaceId, memberId } = await params
        const body = await request.json()
        const { templateId, assignedBy, dueDate } = body

        // Validate required fields
        if (!templateId || !assignedBy) {
            return NextResponse.json(
                { error: 'Template ID and assignedBy are required' },
                { status: 400 }
            )
        }

        // Verify member exists and belongs to workspace
        const member = await prisma.userWorkspaceRole.findUnique({
            where: { id: memberId },
            include: {
                user: {
                    select: { name: true }
                }
            }
        })

        if (!member || member.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Member not found in this workspace' },
                { status: 404 }
            )
        }

        // Verify template exists and belongs to workspace
        const template = await prisma.formTemplate.findUnique({
            where: { id: templateId }
        })

        if (!template || template.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Template not found in this workspace' },
                { status: 404 }
            )
        }

        // Generate unique public slug
        const publicSlug = generateFormAssignmentSlug(
            member.user.name,
            template.name
        )

        // Create form assignment
        const assignment = await prisma.formAssignment.create({
            data: {
                templateId,
                memberId,
                assignedBy,
                dueDate: dueDate ? new Date(dueDate) : null,
                publicSlug,
                isActive: true,
                allowMultiple: body.allowMultiple || false,
                status: 'PENDING'
            },
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
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            ...assignment,
            publicUrl: `/forms/assignments/${publicSlug}`
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating form assignment:', error)
        return NextResponse.json(
            { error: 'Failed to create form assignment' },
            { status: 500 }
        )
    }
}
