import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/form-templates/[templateId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    const { id, templateId } = await params;
    try {
        const template = await prisma.formTemplate.findUnique({
            where: { id: templateId }
        })

        if (!template || template.workspaceId !== id) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(template)
    } catch (error) {
        console.error('Error fetching form template:', error)
        return NextResponse.json(
            { error: 'Failed to fetch form template' },
            { status: 500 }
        )
    }
}

// PATCH /api/workspaces/[id]/form-templates/[templateId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    const { templateId } = await params;
    try {
        const body = await request.json()

        const template = await prisma.formTemplate.update({
            where: { id: templateId },
            data: {
                name: body.name,
                description: body.description,
                fields: body.fields,
                submitLabel: body.submitLabel,
                status: body.status
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error('Error updating form template:', error)
        return NextResponse.json(
            { error: 'Failed to update form template' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[id]/form-templates/[templateId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    const { templateId } = await params;
    try {
        await prisma.formTemplate.delete({
            where: { id: templateId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting form template:', error)
        return NextResponse.json(
            { error: 'Failed to delete form template' },
            { status: 500 }
        )
    }
}
