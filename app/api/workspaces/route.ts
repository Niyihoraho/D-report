import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces - List all workspaces
export async function GET() {
    try {
        const workspaces = await prisma.workspace.findMany({
            include: {
                _count: {
                    select: {
                        members: true,
                        formTemplates: true,
                        units: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(workspaces)
    } catch (error) {
        console.error('Error fetching workspaces:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workspaces' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces - Create workspace
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            )
        }

        // Generate slug from name
        const baseSlug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')

        // Ensure unique slug
        let slug = baseSlug
        let counter = 1
        while (await prisma.workspace.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        const workspace = await prisma.workspace.create({
            data: {
                name: body.name,
                slug,
                type: body.type,
                description: body.description || null,
                isPublicRegistration: body.isPublicRegistration || false,
                requiresPayment: body.requiresPayment || false
            }
        })

        return NextResponse.json(workspace, { status: 201 })
    } catch (error) {
        console.error('Error creating workspace:', error)
        return NextResponse.json(
            { error: 'Failed to create workspace' },
            { status: 500 }
        )
    }
}
