import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/form-templates - List templates
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const templates = await prisma.formTemplate.findMany({
            where: { workspaceId: id },
            orderBy: { updatedAt: 'desc' }
        })

        // Transform for frontend (add computed fields count)
        const templatesWithMeta = templates.map(template => ({
            ...template,
            fields: typeof template.fields === 'string'
                ? JSON.parse(template.fields as string)
                : template.fields,
            fieldCount: Array.isArray(template.fields)
                ? (template.fields as any[]).length
                : 0
        }))

        return NextResponse.json(templatesWithMeta)
    } catch (error) {
        console.error('Error fetching form templates:', error)
        return NextResponse.json(
            { error: 'Failed to fetch form templates' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces/[id]/form-templates - Create template
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Template name is required' },
                { status: 400 }
            )
        }

        const template = await prisma.formTemplate.create({
            data: {
                workspaceId: id,
                name: body.name,
                description: body.description || null,
                fields: body.fields || [],
                submitLabel: body.submitLabel || "Submit Registration",
                status: body.status || "Draft"
            }
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        console.error('Error creating form template:', error)
        return NextResponse.json(
            { error: 'Failed to create form template' },
            { status: 500 }
        )
    }
}
