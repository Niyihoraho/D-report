import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/templates - Get all report templates for a workspace
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workspaceId } = await params

        const templates = await prisma.reportTemplate.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(templates)
    } catch (error) {
        console.error('Error fetching templates:', error)
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces/[id]/templates - Create a new report template for workspace
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workspaceId } = await params
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.templateType) {
            return NextResponse.json(
                { error: 'Name and templateType are required' },
                { status: 400 }
            )
        }

        // If this is set as default, unset other defaults
        if (body.isDefault) {
            await prisma.reportTemplate.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const template = await prisma.reportTemplate.create({
            data: {
                workspaceId,
                name: body.name,
                description: body.description || null,
                templateType: body.templateType,
                isDefault: body.isDefault || false,
                config: body.config || {}
            }
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        console.error('Error creating template:', error)
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        )
    }
}
