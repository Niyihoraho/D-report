import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/units - List units (with tree structure)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const units = await prisma.organizationalUnit.findMany({
            where: { workspaceId: id },
            include: {
                parent: {
                    select: { id: true, name: true }
                },
                children: {
                    select: { id: true, name: true, type: true }
                },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(units)
    } catch (error) {
        console.error('Error fetching units:', error)
        return NextResponse.json(
            { error: 'Failed to fetch units' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces/[id]/units - Create unit
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            )
        }

        // Validate parent exists if provided
        if (body.parentId) {
            const parent = await prisma.organizationalUnit.findUnique({
                where: { id: body.parentId }
            })

            if (!parent || parent.workspaceId !== id) {
                return NextResponse.json(
                    { error: 'Invalid parent unit' },
                    { status: 400 }
                )
            }
        }

        const unit = await prisma.organizationalUnit.create({
            data: {
                workspaceId: id,
                name: body.name,
                type: body.type,
                parentId: body.parentId || null
            },
            include: {
                parent: {
                    select: { id: true, name: true }
                }
            }
        })

        return NextResponse.json(unit, { status: 201 })
    } catch (error) {
        console.error('Error creating unit:', error)
        return NextResponse.json(
            { error: 'Failed to create unit' },
            { status: 500 }
        )
    }
}
