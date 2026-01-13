import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/units/[unitId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) {
    const { id, unitId } = await params;
    try {
        const unit = await prisma.organizationalUnit.findUnique({
            where: { id: unitId },
            include: {
                parent: {
                    select: { id: true, name: true }
                },
                children: {
                    select: { id: true, name: true, type: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        })

        if (!unit || unit.workspaceId !== id) {
            return NextResponse.json(
                { error: 'Unit not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(unit)
    } catch (error) {
        console.error('Error fetching unit:', error)
        return NextResponse.json(
            { error: 'Failed to fetch unit' },
            { status: 500 }
        )
    }
}

// PATCH /api/workspaces/[id]/units/[unitId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) {
    const { unitId } = await params;
    try {
        const body = await request.json()

        // Prevent circular references
        if (body.parentId === unitId) {
            return NextResponse.json(
                { error: 'Unit cannot be its own parent' },
                { status: 400 }
            )
        }

        const unit = await prisma.organizationalUnit.update({
            where: { id: unitId },
            data: {
                name: body.name,
                type: body.type,
                parentId: body.parentId
            },
            include: {
                parent: {
                    select: { id: true, name: true }
                }
            }
        })

        return NextResponse.json(unit)
    } catch (error) {
        console.error('Error updating unit:', error)
        return NextResponse.json(
            { error: 'Failed to update unit' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[id]/units/[unitId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) {
    const { unitId } = await params;
    try {
        // Check if unit has children
        const unit = await prisma.organizationalUnit.findUnique({
            where: { id: unitId },
            include: {
                children: true,
                members: true
            }
        })

        if (unit && unit.children.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete unit with children. Delete or reassign children first.' },
                { status: 400 }
            )
        }

        if (unit && unit.members.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete unit with members. Reassign members first.' },
                { status: 400 }
            )
        }

        await prisma.organizationalUnit.delete({
            where: { id: unitId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting unit:', error)
        return NextResponse.json(
            { error: 'Failed to delete unit' },
            { status: 500 }
        )
    }
}
