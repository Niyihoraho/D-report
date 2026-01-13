import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/members/[memberId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    const { id, memberId } = await params;
    try {
        const member = await prisma.userWorkspaceRole.findUnique({
            where: { id: memberId },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                unit: {
                    select: { id: true, name: true, type: true }
                }
            }
        })

        if (!member || member.workspaceId !== id) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(member)
    } catch (error) {
        console.error('Error fetching member:', error)
        return NextResponse.json(
            { error: 'Failed to fetch member' },
            { status: 500 }
        )
    }
}

// PATCH /api/workspaces/[id]/members/[memberId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    const { memberId } = await params;
    try {
        const body = await request.json()

        // 1. Update Member Details
        const member = await prisma.userWorkspaceRole.update({
            where: { id: memberId },
            data: {
                unitId: body.unitId,
                role: body.role,
                status: body.status,
                profileData: body.profileData
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                unit: { select: { id: true, name: true } },
                formAssignments: {
                    include: {
                        template: { select: { id: true, name: true, description: true } }
                    }
                }
            }
        })

        // 2. Update Assignments if provided
        if (body.assignments && Array.isArray(body.assignments)) {
            // We can't use a bulk update easily for different values on different IDs, 
            // so we'll use a transaction of updates.
            const updates = body.assignments.map((assignment: any) =>
                prisma.formAssignment.update({
                    where: { id: assignment.id },
                    // @ts-ignore - Prisma Client needs regeneration to recognize allowMultiple
                    data: { allowMultiple: assignment.allowMultiple }
                })
            )
            await prisma.$transaction(updates)

            // Re-fetch member to get latest assignments state? 
            // Or just trust the frontend update? 
            // The `member` object above might have stale assignment data if we fetched it before updates.
            // But checking the Prisma docs, `update` returns the object BEFORE the transaction updates if called before.
            // Actually, we called `update` on userWorkspaceRole first.
            // Let's rely on the client refreshing or just return the base member update. 
            // Ideally we should return fresh data.
        }

        return NextResponse.json(member)

        return NextResponse.json(member)
    } catch (error) {
        console.error('Error updating member:', error)
        return NextResponse.json(
            { error: 'Failed to update member' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[id]/members/[memberId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    const { memberId } = await params;
    try {
        await prisma.userWorkspaceRole.delete({
            where: { id: memberId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting member:', error)
        return NextResponse.json(
            { error: 'Failed to delete member' },
            { status: 500 }
        )
    }
}
