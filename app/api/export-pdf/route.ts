import { NextRequest, NextResponse } from 'next/server'
import { generateReportPdf } from '@/lib/pdf-template-system'
import { ReportData } from '@/lib/templates/types'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        console.log('PDF Export: Received request')
        const body = await request.json()
        const { reportData, filename, workspaceId } = body as {
            reportData: ReportData
            filename?: string
            workspaceId?: string
        }

        if (!reportData) {
            console.error('PDF Export Error: No reportData provided')
            return NextResponse.json(
                { error: 'Report data is required' },
                { status: 400 }
            )
        }

        // Validate required fields
        if (!reportData.templateName || !reportData.submittedBy || !reportData.submittedByEmail) {
            console.error('PDF Export Error: Missing required fields', {
                templateName: !!reportData.templateName,
                submittedBy: !!reportData.submittedBy,
                submittedByEmail: !!reportData.submittedByEmail
            })
            return NextResponse.json(
                { error: 'Missing required report fields' },
                { status: 400 }
            )
        }

        // Fetch workspace data if workspaceId provided
        if (workspaceId) {
            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: workspaceId },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        logoUrl: true,
                        stampUrl: true,
                        primaryColor: true,
                        address: true,
                        motto: true,
                        reportTemplates: {
                            where: { isDefault: true },
                            take: 1
                        }
                    }
                })

                if (workspace) {
                    reportData.workspace = {
                        id: workspace.id,
                        name: workspace.name,
                        type: workspace.type,
                        logoUrl: workspace.logoUrl || undefined,
                        stampUrl: workspace.stampUrl || undefined,
                        primaryColor: workspace.primaryColor || undefined,
                        address: workspace.address || undefined,
                        motto: workspace.motto || undefined
                    }

                    // Use workspace's default template type if available
                    if (!reportData.templateType && workspace.reportTemplates.length > 0) {
                        const defaultTemplate = workspace.reportTemplates[0]
                        reportData.templateType = defaultTemplate.templateType as any
                        console.log(`Using workspace default template: ${defaultTemplate.name} (${defaultTemplate.templateType})`)
                    }
                    // Fall back to workspace type mapping
                    else if (!reportData.templateType) {
                        const typeMap: Record<string, ReportData['templateType']> = {
                            'MINISTRY': 'MINISTRY_REPORT',
                            'CONSTRUCTION': 'CONSTRUCTION_REPORT',
                            'TRAINING': 'TRAINING_REPORT',
                            'GENERAL': 'GENERIC'
                        }
                        reportData.templateType = typeMap[workspace.type] || 'GENERIC'
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch workspace data:', error)
                // Continue without workspace data
            }
        }

        console.log('PDF Export: Generating PDF for', reportData.templateName)

        // Generate PDF
        const pdfBuffer = await generateReportPdf(reportData)

        console.log('PDF Export: PDF Buffer generated. Size:', pdfBuffer.length)

        if (pdfBuffer.length === 0) {
            throw new Error('Generated PDF buffer is empty')
        }

        // Generate filename
        const sanitizedTemplateName = reportData.templateName
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()
        const timestamp = new Date().toISOString().split('T')[0]
        const pdfFilename = filename || `${sanitizedTemplateName}_${timestamp}.pdf`

        console.log('PDF Export: Preparing response with filename:', pdfFilename)

        // Convert to base64 as workaround for Next.js binary response issues
        const base64Pdf = pdfBuffer.toString('base64')

        console.log('PDF Export: Base64 length:', base64Pdf.length)

        // Return as JSON with base64-encoded PDF
        return NextResponse.json({
            success: true,
            filename: pdfFilename,
            pdf: base64Pdf,
            size: pdfBuffer.length
        })
    } catch (error) {
        console.error('Error generating PDF:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
