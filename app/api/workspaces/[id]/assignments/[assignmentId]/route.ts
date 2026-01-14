import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/assignments/[assignmentId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
    try {
        const { id: workspaceId, assignmentId } = await params

        const assignment = await prisma.formAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                template: true,
                member: {
                    include: {
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

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            )
        }

        // Verify assignment belongs to workspace
        if (assignment.member.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Assignment not found in this workspace' },
                { status: 404 }
            )
        }

        return NextResponse.json(assignment)
    } catch (error) {
        console.error('Error fetching assignment:', error)
        return NextResponse.json(
            { error: 'Failed to fetch assignment' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[id]/assignments/[assignmentId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
    try {
        const { id: workspaceId, assignmentId } = await params

        // Verify assignment exists and belongs to workspace
        const assignment = await prisma.formAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                member: true
            }
        })

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            )
        }

        if (assignment.member.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Assignment not found in this workspace' },
                { status: 404 }
            )
        }

        // Delete the assignment
        await prisma.formAssignment.delete({
            where: { id: assignmentId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting assignment:', error)
        return NextResponse.json(
            { error: 'Failed to delete assignment' },
            { status: 500 }
        )
    }
}

// PATCH /api/workspaces/[id]/assignments/[assignmentId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
    try {
        const { id: workspaceId, assignmentId } = await params
        const body = await request.json()

        // Verify assignment exists and belongs to workspace
        const existingAssignment = await prisma.formAssignment.findUnique({
            where: { id: assignmentId },
            include: { member: true }
        })

        if (!existingAssignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            )
        }

        if (existingAssignment.member.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Assignment not found in this workspace' },
                { status: 404 }
            )
        }

        // Update assignment
        const updatedAssignment = await prisma.formAssignment.update({
            where: { id: assignmentId },
            data: {
                isActive: body.isActive !== undefined ? body.isActive : existingAssignment.isActive,
                dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existingAssignment.dueDate,
                status: body.status || existingAssignment.status
            },
            include: {
                template: true,
                member: {
                    include: {
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

        return NextResponse.json(updatedAssignment)
    } catch (error) {
        console.error('Error updating assignment:', error)
        return NextResponse.json(
            { error: 'Failed to update assignment' },
            { status: 500 }
        )
    }
}
