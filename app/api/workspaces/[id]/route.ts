import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id] - Get single workspace
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: id },
            include: {
                units: {
                    orderBy: { name: 'asc' }
                },
                formTemplates: {
                    orderBy: { updatedAt: 'desc' }
                },
                _count: {
                    select: {
                        members: true,
                        formTemplates: true,
                        units: true
                    }
                }
            }
        })

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace not found' },
                { status: 404 }
            )
        }

        // Get active members count
        const activeMembersCount = await prisma.userWorkspaceRole.count({
            where: {
                workspaceId: id,
                status: 'ACTIVE'
            }
        })

        // Add stats to response
        const workspaceWithStats = {
            ...workspace,
            stats: {
                totalMembers: workspace._count.members,
                activeMembers: activeMembersCount,
                formTemplates: workspace._count.formTemplates,
                units: workspace._count.units
            }
        }

        return NextResponse.json(workspaceWithStats)
    } catch (error) {
        console.error('Error fetching workspace:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workspace' },
            { status: 500 }
        )
    }
}

// PATCH /api/workspaces/[id] - Update workspace
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json()

        const workspace = await prisma.workspace.update({
            where: { id: id },
            data: {
                name: body.name,
                description: body.description,
                type: body.type,
                registrationFields: body.registrationFields,
                isPublicRegistration: body.isPublicRegistration,
                requiresPayment: body.requiresPayment,
                paymentConfig: body.paymentConfig
            }
        })

        return NextResponse.json(workspace)
    } catch (error) {
        console.error('Error updating workspace:', error)
        return NextResponse.json(
            { error: 'Failed to update workspace' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[id] - Delete workspace
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.workspace.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting workspace:', error)
        return NextResponse.json(
            { error: 'Failed to delete workspace' },
            { status: 500 }
        )
    }
}
