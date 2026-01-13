import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/workspaces/[id]/form-templates/[templateId]/activate
// Activates a template for public registration
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; templateId: string }> }
) {
    const { id, templateId } = await params;
    try {
        // Get the template
        const template = await prisma.formTemplate.findUnique({
            where: { id: templateId }
        })

        if (!template || template.workspaceId !== id) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // Mark template as active, others as draft (only one can be active)
        await prisma.formTemplate.updateMany({
            where: { workspaceId: id },
            data: { status: 'Draft' }
        })

        await prisma.formTemplate.update({
            where: { id: templateId },
            data: { status: 'Active' }
        })

        // Get workspace slug for public URL
        const workspace = await prisma.workspace.findUnique({
            where: { id: id },
            select: { slug: true }
        })

        return NextResponse.json({
            success: true,
            message: 'Template activated successfully',
            publicUrl: `/register/${workspace?.slug}`,
            workspaceSlug: workspace?.slug
        })
    } catch (error) {
        console.error('Error activating template:', error)
        return NextResponse.json(
            { error: 'Failed to activate template' },
            { status: 500 }
        )
    }
}
