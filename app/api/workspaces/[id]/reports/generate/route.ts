import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReportType } from '@prisma/client'
import { generatePDF } from '@/lib/pdf-generator'
import { renderHTML } from '@/lib/html-renderer'
import { generateReferenceNumber } from '@/lib/reference-generator'
import { generateQRCode } from '@/lib/qr-generator'
import { TranscriptTemplate, TranscriptData } from '@/reports/templates/transcript-template'
import { CertificateTemplate, CertificateData } from '@/reports/templates/certificate-template'
import { ReceiptTemplate, ReceiptData } from '@/reports/templates/receipt-template'
import { AttendanceTemplate, AttendanceData } from '@/reports/templates/attendance-template'
import archiver from 'archiver'
import React from 'react'

// Helper to normalize keys slightly
function normalizeKey(key: string): string {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// POST /api/workspaces/[id]/reports/generate - Generate PDF reports
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: workspaceId } = await params

    // Determine base URL dynamically for QR codes and links
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`


    try {
        const body = await request.json()
        const { reportType, memberIds, templateData } = body as {
            reportType: string
            memberIds: string[]
            templateData?: Record<string, any>
        }

        if (!memberIds || memberIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one member ID is required' },
                { status: 400 }
            )
        }

        if (!reportType) {
            return NextResponse.json(
                { error: 'Report type is required' },
                { status: 400 }
            )
        }

        // Get workspace with branding AND registration field definitions
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                stampUrl: true,
                address: true,
                motto: true,
                primaryColor: true,
                registrationFields: true // Fetch form definitions to decode profile data
            }
        })

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace not found' },
                { status: 404 }
            )
        }

        // Get members with profile data
        const members = await prisma.userWorkspaceRole.findMany({
            where: {
                id: { in: memberIds },
                workspaceId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (members.length === 0) {
            return NextResponse.json(
                { error: 'No members found' },
                { status: 404 }
            )
        }

        // TODO: Get current user ID from session
        const currentUserId = members[0].userId // Temporary - should come from auth

        // Create a map of Field ID -> Field Label from registrationFields
        const fieldLabelMap = new Map<string, string>()
        if (workspace.registrationFields && Array.isArray(workspace.registrationFields)) {
            (workspace.registrationFields as any[]).forEach((field: any) => {
                if (field.id && field.label) {
                    fieldLabelMap.set(field.id, field.label)
                }
            })
        }

        // Generate reports
        const reports: Array<{ pdf: Buffer; filename: string }> = []

        // Normalize report type to uppercase for consistent comparison
        const normalizedReportType = reportType.trim().toUpperCase()
        console.log('=== REPORT GENERATION DEBUG ===')
        console.log('Report Type Received (RAW):', JSON.stringify(reportType))
        console.log('Report Type Received (STRING):', String(reportType))
        console.log('Normalized Report Type:', normalizedReportType)
        console.log('Is ATTENDANCE?:', normalizedReportType.includes('ATTENDANCE'))
        console.log('Member Count:', members.length)
        console.log('Template Data:', JSON.stringify(templateData))

        // --- ATTENDANCE REPORT (Aggregated) ---
        // Only generate attendance report when explicitly requested
        const isAttendance = normalizedReportType.includes('ATTENDANCE')

        if (isAttendance) {
            console.log('✅ ENTERING ATTENDANCE BRANCH (Type match or group report detected)')
            const referenceNumber = await generateReferenceNumber(reportType)
            const qrCodeData = await generateQRCode(
                `${baseUrl}/verify/${referenceNumber}`
            )

            // Map all members to the attendance format
            const attendanceMembers = members.map(m => ({
                name: m.user.name || 'Unknown',
                email: m.user.email || 'No Email',
                phone: (m.user as any).phone || 'N/A'
            }))

            console.log('Attendance Members:', attendanceMembers.length)
            console.log('Purpose:', templateData?.purpose)

            // Read the specific logo file for attendance reports if it exists
            let attendanceLogo = workspace.logoUrl
            try {
                const fs = require('fs')
                const path = require('path')
                const logoPath = path.join(process.cwd(), 'public', 'logo2.jpg')
                if (fs.existsSync(logoPath)) {
                    const logoBuffer = fs.readFileSync(logoPath)
                    const base64Logo = logoBuffer.toString('base64')
                    attendanceLogo = `data:image/jpeg;base64,${base64Logo}`
                    console.log('✅ Loaded local logo2.jpg as Base64')
                } else {
                    console.log('❌ logo2.jpg not found at', logoPath)
                }
            } catch (err) {
                console.error('Error loading local logo:', err)
            }

            const templateProps: AttendanceData = {
                workspaceName: workspace.name,
                workspaceAddress: workspace.address || undefined,
                workspaceLogo: attendanceLogo || undefined,
                primaryColor: workspace.primaryColor || undefined,
                purpose: templateData?.purpose || 'Attendance Record',
                members: attendanceMembers,
                generatedDate: new Date().toLocaleDateString(),
                referenceNumber,
                qrCodeUrl: qrCodeData
            }

            console.log('Rendering Attendance Template...')
            const html = renderHTML(React.createElement(AttendanceTemplate, templateProps))
            console.log('Generating PDF from HTML...')
            const pdf = await generatePDF(html)
            console.log('PDF Generated, size:', pdf.length, 'bytes')

            // Save single report record
            await prisma.report.create({
                data: {
                    type: 'ATTENDANCE' as ReportType,
                    referenceNumber,
                    workspaceId,
                    memberId: null, // Aggregated report links to no specific member
                    generatedBy: currentUserId,
                    templateName: 'Attendance Sheet',
                    qrCodeData: qrCodeData,
                    isVerified: true
                }
            })

            const filename = `${workspace.name.replace(/[^a-zA-Z0-9]/g, '_')}_Attendance.pdf`
            reports.push({ pdf, filename })
            console.log('✅ ATTENDANCE REPORT COMPLETED')

        } else {
            console.log('❌ NOT ATTENDANCE - Entering individual reports branch')
            // --- STANDARD REPORTS (One per member) ---
            for (const member of members) {
                // Generate reference number
                const referenceNumber = await generateReferenceNumber(reportType)

                // Generate QR code for verification
                const verificationUrl = `${baseUrl}/verify/${referenceNumber}`
                const qrCodeData = await generateQRCode(verificationUrl)

                // Create report metadata
                const reportMetadata = {
                    referenceNumber,
                    generatedAt: new Date(),
                    qrCodeDataURL: qrCodeData
                }

                // 1. Normalize Profile Data using Field Labels
                const rawProfile = (member.profileData as Record<string, any>) || {}
                const normalizedProfile: Record<string, any> = { ...rawProfile }

                // Map field_ids to human readable labels
                if (fieldLabelMap.size > 0) {
                    Object.entries(rawProfile).forEach(([key, value]) => {
                        const label = fieldLabelMap.get(key)
                        if (label) {
                            normalizedProfile[label] = value
                            normalizedProfile[normalizeKey(label)] = value
                        }
                    })
                }

                // Map member data to template format using smart lookups
                const data = mapMemberDataToTemplate(member, normalizedProfile, reportType, templateData)

                // Render template based on type
                let templateComponent: React.ReactElement

                switch (normalizedReportType) {
                    case 'TRANSCRIPT':
                        templateComponent = React.createElement(TranscriptTemplate, {
                            workspace: {
                                ...workspace,
                                address: workspace.address || undefined,
                                logoUrl: workspace.logoUrl || undefined,
                                stampUrl: workspace.stampUrl || undefined,
                                motto: workspace.motto || undefined,
                                primaryColor: workspace.primaryColor || undefined
                            },
                            report: reportMetadata,
                            data: data as TranscriptData
                        })
                        break

                    case 'CERTIFICATE':
                        templateComponent = React.createElement(CertificateTemplate, {
                            workspace: {
                                ...workspace,
                                address: workspace.address || undefined,
                                logoUrl: workspace.logoUrl || undefined,
                                stampUrl: workspace.stampUrl || undefined,
                                motto: workspace.motto || undefined,
                                primaryColor: workspace.primaryColor || undefined
                            },
                            report: reportMetadata,
                            data: data as CertificateData
                        })
                        break

                    case 'RECEIPT':
                        templateComponent = React.createElement(ReceiptTemplate, {
                            workspace: {
                                ...workspace,
                                address: workspace.address || undefined,
                                logoUrl: workspace.logoUrl || undefined,
                                stampUrl: workspace.stampUrl || undefined,
                                motto: workspace.motto || undefined,
                                primaryColor: workspace.primaryColor || undefined
                            },
                            report: reportMetadata,
                            data: data as ReceiptData
                        })
                        break

                    default:
                        console.error('Unsupported report type:', reportType, 'Normalized:', normalizedReportType)
                        return NextResponse.json(
                            { error: `Unsupported report type: ${reportType}. Supported types: TRANSCRIPT, CERTIFICATE, RECEIPT, ATTENDANCE` },
                            { status: 400 }
                        )
                }

                // Render HTML
                const resultHtml = renderHTML(templateComponent)

                // Generate PDF
                const pdf = await generatePDF(resultHtml)

                // Save report record to database
                await prisma.report.create({
                    data: {
                        type: reportType.toUpperCase() as ReportType,
                        referenceNumber,
                        workspaceId,
                        memberId: member.id,
                        generatedBy: currentUserId,
                        templateName: reportType,
                        qrCodeData: verificationUrl,
                        isVerified: true
                    }
                })

                // Add to reports array
                const filename = `${member.user.name.replace(/[^a-zA-Z0-9]/g, '_')}_${reportType}.pdf`
                reports.push({ pdf, filename })
            }
        }


        // Return single PDF or ZIP
        if (reports.length === 1) {
            return new NextResponse(new Uint8Array(reports[0].pdf), {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${reports[0].filename}"`
                }
            })
        }

        // Create ZIP for multiple reports
        const archive = archiver('zip', { zlib: { level: 9 } })
        const chunks: Buffer[] = []

        archive.on('data', (chunk) => chunks.push(chunk))

        for (const report of reports) {
            archive.append(report.pdf, { name: report.filename })
        }

        await archive.finalize()

        const zipBuffer = Buffer.concat(chunks)

        return new NextResponse(new Uint8Array(zipBuffer), {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${reportType}_Reports.zip"`
            }
        })
    } catch (error: any) {
        console.error('Error generating reports:', error)

        return NextResponse.json(
            {
                error: 'Failed to generate reports',
                details: error.message
            },
            { status: 500 }
        )
    }
}

/**
 * Smart Mapping Function
 * Looks for values using multiple possible key names
 */
function getValue(data: Record<string, any>, possibleKeys: string[]): any {
    // 1. Check exact matches in normalized keys
    for (const key of possibleKeys) {
        const normalized = normalizeKey(key)
        if (data[normalized] !== undefined) return data[normalized]
        if (data[key] !== undefined) return data[key]
    }

    // 2. Check "includes" match in all keys (fuzzy search)
    // Only do this for specific keys to avoid false positives
    const fuzzyKeys = possibleKeys.filter(k => k.length > 3)
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase()
        for (const pKey of fuzzyKeys) {
            if (lowerKey.includes(pKey.toLowerCase())) return value
        }
    }

    return undefined
}

/**
 * Map member data to template-specific format using smart keys
 */
function mapMemberDataToTemplate(
    member: any,
    normalizedProfile: Record<string, any>,
    reportType: string,
    customData?: Record<string, any>
): any {
    const baseData = {
        ...normalizedProfile,
        ...customData
    }

    switch (reportType.toUpperCase()) {
        case 'TRANSCRIPT':
            // Identify standard keys we already mapped
            const standardKeys = [
                'regNumber', 'registrationNumber', 'regNo', 'studentId', 'idNumber', 'matricNumber',
                'program', 'course', 'degree', 'department', 'major',
                'intakeYear', 'year', 'admissionYear', 'cohort',
                'results', 'gpa', 'totalCredits'
            ]

            // Collect remaining keys for custom fields
            const customFields: Record<string, any> = {}
            Object.entries(baseData).forEach(([key, value]) => {
                // Skip if it's a standard key or looks like a field ID
                if (!standardKeys.some(sk => normalizeKey(key).includes(sk)) && !key.startsWith('field_')) {
                    // Skip complex objects
                    if (typeof value !== 'object' || value === null) {
                        customFields[key] = value
                    }
                }
            })

            return {
                student: {
                    fullName: member.user.name,
                    regNumber: getValue(baseData, ['regNumber', 'registrationNumber', 'regNo', 'studentId', 'idNumber', 'matricNumber']) || 'N/A',
                    program: getValue(baseData, ['program', 'course', 'degree', 'department', 'major']) || 'N/A',
                    intakeYear: getValue(baseData, ['intakeYear', 'year', 'admissionYear', 'cohort']) || new Date().getFullYear().toString()
                },
                results: baseData.results || [],
                gpa: baseData.gpa,
                totalCredits: baseData.totalCredits,
                customFields
            }

        case 'CERTIFICATE':
            // Standard certificate keys
            const certKeys = ['programName', 'program', 'course', 'training', 'workshop', 'completionDate', 'date', 'finishedAt', 'description', 'summary', 'details', 'signatory']

            // Collect remaining keys
            const certCustomFields: Record<string, any> = {}
            Object.entries(baseData).forEach(([key, value]) => {
                if (!certKeys.some(sk => normalizeKey(key).includes(sk)) && !key.startsWith('field_')) {
                    if (typeof value !== 'object' || value === null) certCustomFields[key] = value
                }
            })

            return {
                recipientName: member.user.name,
                programName: getValue(baseData, ['programName', 'program', 'course', 'training', 'workshop']) || 'Program',
                completionDate: getValue(baseData, ['completionDate', 'date', 'finishedAt']) || new Date().toISOString(),
                description: getValue(baseData, ['description', 'summary', 'details']),
                signatory: baseData.signatory,
                customFields: certCustomFields
            }

        case 'RECEIPT':
            // Standard receipt keys
            const receiptKeys = ['amount', 'total', 'price', 'cost', 'currency', 'code', 'paymentMethod', 'method', 'type', 'transactionId', 'txnId', 'reference', 'description', 'for', 'reason', 'items']

            // Collect remaining keys
            const receiptCustomFields: Record<string, any> = {}
            Object.entries(baseData).forEach(([key, value]) => {
                if (!receiptKeys.some(sk => normalizeKey(key).includes(sk)) && !key.startsWith('field_')) {
                    if (typeof value !== 'object' || value === null) receiptCustomFields[key] = value
                }
            })

            return {
                recipientName: member.user.name,
                amount: getValue(baseData, ['amount', 'total', 'price', 'cost']) || 0,
                currency: getValue(baseData, ['currency', 'code']) || 'RWF',
                paymentMethod: getValue(baseData, ['paymentMethod', 'method', 'type']) || 'Cash',
                transactionId: getValue(baseData, ['transactionId', 'txnId', 'reference']) || generateReferenceNumber('TX'),
                description: getValue(baseData, ['description', 'for', 'reason']) || 'Payment received',
                items: baseData.items,
                customFields: receiptCustomFields
            }

        default:
            return baseData
    }
}
