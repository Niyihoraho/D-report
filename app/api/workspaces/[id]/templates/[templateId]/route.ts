import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/templates/[templateId] - Get specific template
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    try {
        const { id: workspaceId, templateId } = await params

        const template = await prisma.reportTemplate.findFirst({
            where: {
                id: templateId,
                workspaceId
            }
        })

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(template)
    } catch (error) {
        console.error('Error fetching template:', error)
        return NextResponse.json(
            { error: 'Failed to fetch template' },
            { status: 500 }
        )
    }
}

// PATCH /api/workspaces/[id]/templates/[templateId] - Update template
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    try {
        const { id: workspaceId, templateId } = await params
        const body = await request.json()

        // Verify template belongs to workspace
        const existing = await prisma.reportTemplate.findFirst({
            where: { id: templateId, workspaceId }
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // If setting as default, unset other defaults
        if (body.isDefault) {
            await prisma.reportTemplate.updateMany({
                where: { workspaceId, isDefault: true, id: { not: templateId } },
                data: { isDefault: false }
            })
        }

        const template = await prisma.reportTemplate.update({
            where: { id: templateId },
            data: {
                name: body.name,
                description: body.description,
                templateType: body.templateType,
                isDefault: body.isDefault,
                config: body.config
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error('Error updating template:', error)
        return NextResponse.json(
            { error: 'Failed to update template' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[id]/templates/[templateId] - Delete template
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    try {
        const { id: workspaceId, templateId } = await params

        // Verify template belongs to workspace
        const existing = await prisma.reportTemplate.findFirst({
            where: { id: templateId, workspaceId }
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        await prisma.reportTemplate.delete({
            where: { id: templateId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting template:', error)
        return NextResponse.json(
            { error: 'Failed to delete template' },
            { status: 500 }
        )
    }
}
