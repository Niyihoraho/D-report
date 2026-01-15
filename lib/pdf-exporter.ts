import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer'
import { generatePDF } from './pdf-generator'

export interface PdfExportOptions {
    format?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
    margin?: {
        top?: string
        right?: string
        bottom?: string
        left?: string
    }
    displayHeaderFooter?: boolean
    headerTemplate?: string
    footerTemplate?: string
    printBackground?: boolean
    scale?: number
    preferCSSPageSize?: boolean
}

export interface ReportData {
    templateName: string
    submittedBy: string
    submittedByEmail: string
    submittedAt?: string
    status: string
    responses: Record<string, any>
    member?: {
        name: string
        email: string
        profileData?: any
    }
    // Workspace-specific data for custom branding
    workspace?: {
        id: string
        name: string
        type: 'MINISTRY' | 'CONSTRUCTION' | 'TRAINING' | 'GENERAL'
        logoUrl?: string
        stampUrl?: string
        primaryColor?: string
        address?: string
        motto?: string
    }
    // Template configuration
    templateType?: 'MINISTRY_REPORT' | 'CONSTRUCTION_REPORT' | 'TRAINING_REPORT' | 'GENERIC' | 'CUSTOM'
}

import fs from 'fs'
import path from 'path'

const DEFAULT_OPTIONS: PdfExportOptions = {
    format: 'A4',
    orientation: 'portrait',
    margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm',
    },
    displayHeaderFooter: false,
    printBackground: true,
    scale: 1,
    preferCSSPageSize: true,
}

function logToFile(message: string, data?: any) {
    try {
        const logPath = path.join(process.cwd(), 'pdf-debug.log')
        const timestamp = new Date().toISOString()
        const logMessage = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`
        fs.appendFileSync(logPath, logMessage)
        console.log(message, data)
    } catch (e) {
        console.error('Failed to write to log file', e)
    }
}

/**
 * Generate HTML report from submission data using GBUR Ministry Template
 * This is the original GBUR-specific template for ministry reports
 */
export function generateMinistryReportHTML(data: ReportData): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const submittedDate = data.submittedAt
        ? new Date(data.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'N/A'

    // --- DATA MAPPING LOGIC ---
    // 1. Title/Header Mapping
    // --- DATA MAPPING LOGIC ---
    // 1. Title/Header Mapping
    const reportTitle = "THRIVING TOGETHER IN GBUR STUDENT MINISTRY 2025-2026";

    // 2. Extra Member Data Extraction
    let memberPhone = 'N/A';
    let memberRegion = 'N/A';

    // Try to get from responses first, then profile data
    if (data.responses && data.responses['Phone']) memberPhone = data.responses['Phone'];

    if (data.member?.profileData) {
        const pd = data.member.profileData;
        const findKey = (query: string[]) => Object.keys(pd).find(k => query.some(q => k.toLowerCase().includes(q)));

        // Phone
        if (memberPhone === 'N/A') {
            const phoneKey = findKey(['phone', 'mobile', 'cel', 'tel']);
            if (phoneKey) memberPhone = pd[phoneKey];
        }

        // Region
        const regionKey = findKey(['region', 'staff region', 'location', 'province']);
        if (regionKey) memberRegion = pd[regionKey];
    }

    // 3. Content Injection
    // We will list all responses, but we want to make "Activity" styled fields pop.
    // If a field is named "Activity" or similar, we treat it as a section header.

    let contentHTML = ''
    let activityHeader = 'ACTIVITY REPORT'; // Fallback

    if (data.responses && Object.keys(data.responses).length > 0) {
        // First pass: Find the "Activity" or "Title" to use as the main header
        const headerKey = Object.keys(data.responses).find(key => {
            const lowerKey = key.toLowerCase();
            return lowerKey.includes('activity') || lowerKey.includes('title') || lowerKey.includes('event');
        });

        if (headerKey) {
            activityHeader = formatValue(data.responses[headerKey]);
        }

        // Prepare entries and sort them to put "Where" then "When" (Date) first
        let entries = Object.entries(data.responses);

        const whereEntry = entries.find(([k]) => k.toLowerCase() === 'where');
        const whenEntry = entries.find(([k]) => k.toLowerCase() === 'when');

        // Remove them from the list to add them back in order
        entries = entries.filter(([k]) => k.toLowerCase() !== 'where' && k.toLowerCase() !== 'when');

        const sortedEntries: [string, any][] = [];
        if (whereEntry) sortedEntries.push(whereEntry);
        if (whenEntry) sortedEntries.push(whenEntry);
        sortedEntries.push(...entries);

        sortedEntries.forEach(([key, value]) => {
            const formattedValue = formatValue(value);
            const lowerKey = key.toLowerCase();

            // Map "When" to "Date"
            let displayKey = key;
            if (key === 'When') displayKey = 'Date';

            // Map "Where" to "Where it take place"
            if (lowerKey === 'where') displayKey = 'Where it take place';

            // Skip the field if it's used as the header to avoid duplication?

            // User request: "replace submision data to Activity name"
            // Let's NOT skip it in the list for now to ensure all data is there, or maybe we highlight it differently.
            // Actually, if we promote it to Header, we might not want it in the list duplication if it's identical.
            // But let's keep it safe and just render everything, but maybe change the "Activity" styling since it's now the main header.

            // Highlight "Activity" fields nicely (Keep this logic but maybe make it subtle since we have a main header now)
            if (lowerKey.includes('activity') || lowerKey.includes('title') || lowerKey.includes('event')) {
                // If this is the one we used for the header, maybe don't wrap it in a big box again?
                // Let's just output it as a normal field or a slightly emphasized one.
                contentHTML += `
                    <div class="field-row" style="background-color: #f0fdfa;">
                        <span class="field-label" style="color: #0e7490;">${escapeHtml(displayKey)}:</span>
                        <span class="field-value" style="font-weight: bold; color: #0e7490;">${formattedValue}</span>
                    </div>`
            }
            // Highlight "Impact" fields
            else if (lowerKey.includes('impact') || lowerKey.includes('comment')) {
                contentHTML += `
                    <div class="impact-box">
                        <span class="impact-label">${escapeHtml(displayKey)}</span>
                        <div class="impact-content">${formattedValue}</div>
                    </div>`
            }
            // Image fields (full width)
            else if (formattedValue.includes('submitted-image-container')) {
                contentHTML += `
                    <div class="image-field-row">
                        <span class="field-label">${escapeHtml(displayKey)}:</span>
                        <div class="field-value">${formattedValue}</div>
                    </div>`
            }
            // Standard fields
            else {
                contentHTML += `
                    <div class="field-row">
                        <span class="field-label">${escapeHtml(displayKey)}:</span>
                        <span class="field-value">${formattedValue}</span>
                    </div>`
            }
        })
    } else {
        contentHTML = '<p>No data submitted.</p>'
    }

    // Load logo image
    let logoBase64 = ''
    try {
        const logoPath = path.join(process.cwd(), 'public', 'ifeslogo.png')
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath)
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
        }
    } catch (e) {
        console.error('Failed to load logo image', e)
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.templateName)}</title>
    <style>
        @page {
            size: A4;
            margin: 0; /* Full bleed for cover, internal pages handle own margin */
        }
        
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif; /* Official Serif font */
            margin: 0;
            padding: 0;
            background: white;
            color: #1f2937;
        }

        /* --- COVER PAGE --- */
        .cover-page {
            width: 210mm;
            height: 297mm;
            position: relative;
            padding: 25mm;
            display: flex;
            flex-direction: column;
            page-break-after: always;
        }

        .logo-box {
            position: absolute;
            top: 20mm;
            right: 20mm;
            width: 150px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }

        .report-title {
            margin-top: 60mm;
            font-family: 'Arial', sans-serif;
            font-size: 24pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #1e293b;
            line-height: 1.3;
            border-left: 8px solid #0e7490; /* Teal Accent */
            padding-left: 20px;
            margin-bottom: 20px;
        }

        .intro-text {
            color: #0e7490; /* Teal Text */
            font-size: 14pt;
            line-height: 1.5;
            margin-bottom: 20mm;
            font-style: italic;
        }

        /* STRATEGIC OVERVIEW ON COVER */
        .cover-overview {
            margin-bottom: 20mm;
        }
        
        .strategic-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .strategic-list li {
            font-size: 12pt;
            padding-left: 20px;
            position: relative;
            margin-bottom: 8px;
            color: #0e7490;
            font-weight: 500;
        }

        .strategic-list li::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #0e7490;
            font-weight: bold;
        }

        /* MEMBER INFO GRID */
        .member-grid-container {
            margin-top: auto;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }

        .member-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            column-gap: 20px;
            row-gap: 12px;
            font-size: 11pt;
            align-items: baseline;
        }

        .member-label {
            font-weight: bold;
            color: #0e7490; /* Teal for labels */
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.05em;
            text-align: right;
        }

        .member-value {
            color: #334155;
            font-weight: 500;
        }

        /* --- CONTENT PAGES --- */
        .content-page {
            padding: 25mm;
            padding-top: 15mm;
        }

        .overview-header {
            font-family: 'Arial', sans-serif;
            font-size: 14pt; /* Reduced from 18pt */
            font-weight: 700;
            color: white; 
            background-color: #0e7490; /* Engaged look: Teal background */
            text-transform: uppercase;
            margin-bottom: 20px;
            padding: 10px 15px;
            border-radius: 4px;
            display: inline-block; /* Wrap to content or block? Inline block looks like a label. */
            width: 100%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* --- DYNAMIC CONTENT STYLING --- */
        .activity-section {
            margin-top: 30px;
            margin-bottom: 15px;
            break-inside: avoid;
        }

        .field-row {
            padding: 8px 10px; /* More breathing room */
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: flex-start; /* Align top for multi-line content */
        }
        
        .field-row:nth-child(even) {
            background-color: #f8fafc; /* Zebra striping for better engagement */
        }

        .field-label {
            font-weight: bold;
            width: 200px;
            flex-shrink: 0;
            color: #334155;
            margin-top: 2px;
        }

        .field-value {
            flex-grow: 1;
            color: #0f172a;
        }
        
        /* Full width image layout */
        .image-field-row {
            padding: 15px 10px;
            border-bottom: 1px solid #e2e8f0;
            display: block; /* Stack vertically */
        }
        
        .image-field-row .field-label {
            display: block;
            width: 100%;
            margin-bottom: 10px;
            font-size: 1.1em;
            color: #0e7490;
        }
        
        .submitted-image-container {
            width: 100%;
            display: flex;
            justify-content: center;
        }
        
        .submitted-image {
            width: 100%;
            max-height: 600px; /* Increased height allowance */
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            object-fit: contain; /* Ensure full image is visible */
            display: block;
        }

        .impact-box {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9; /* Lighter Blue Accent */
            padding: 15px;
            margin: 15px 0;
            break-inside: avoid;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Slight lift */
        }

        .impact-label {
            display: block;
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 0.9em;
        }

        .impact-content {
            font-style: italic;
            color: #334155;
        }

        .footer {
            margin-top: 50px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            font-size: 9pt;
            color: #94a3b8;
            text-align: center;
        }

    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <!-- Logo -->
        <div class="logo-box">
             ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="IFES Logo" />` : 'IFES <br> LOGO'}
        </div>

        <!-- Title -->
        <div class="report-title">
            ${reportTitle}
        </div>

        <!-- Intro Text -->
        <div class="intro-text">
            This action plan will be implemented through GBUR staff, in partnership with graduates and other resource people to disciple students and reaching the campus community with the gospel of Jesus Christ.
        </div>

        <!-- Strategic Overview (Moved to Cover) -->
        <div class="cover-overview">
            <p style="font-weight: bold; color: #0e7490; margin-bottom: 10px; font-family: 'Arial', sans-serif;">THE FOUR STRATEGIC PRIORITIES:</p>
            <ul class="strategic-list">
                <li>Thriving in Witness (Evangelism)</li>
                <li>Thriving in Whole-life Commitment (Discipleship & Leadership)</li>
                <li>Thriving on New Ground (Pioneering GBUs)</li>
                <li>Thriving into the Future</li>
            </ul>
        </div>

        <!-- Member Info Grid -->
        <div class="member-grid-container">
            <div class="member-grid">
                <div class="member-label">GBU Name/Staff Report</div>
                <div class="member-value">${escapeHtml(data.responses['GBU Name'] || data.templateName)}</div>

                <div class="member-label">Staff Name</div>
                <div class="member-value">${escapeHtml(data.submittedBy)}</div>

                <div class="member-label">Staff Region</div>
                <div class="member-value">${escapeHtml(memberRegion)}</div>

                <div class="member-label">Phone Number</div>
                <div class="member-value">${escapeHtml(memberPhone)}</div>

                <div class="member-label">Email</div>
                <div class="member-value">${escapeHtml(data.submittedByEmail)}</div>
            </div>
        </div>
    </div>

    <!-- CONTENT PAGE -->
    <div class="content-page">
        <!-- Header -->
        <div class="overview-header">${escapeHtml(activityHeader)}</div>

        ${contentHTML}

        <div class="footer">
            Generated on ${currentDate} | THRIVING TOGETHER IN GBUR STUDENT MINISTRY
        </div>
    </div>

</body>
</html>`
}

/**
 * Format field values for display
 */
function formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value, null, 2)

    // Check if value is an image URL
    const stringValue = String(value);
    if (stringValue.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || stringValue.startsWith('data:image')) {
        let imageSrc = stringValue;

        // If it's a relative path, try to resolve it from public directory and convert to base64
        if (stringValue.startsWith('/') && !stringValue.startsWith('//')) {
            try {
                // Remove query parameters if any
                const cleanPath = stringValue.split('?')[0];
                const localPath = path.join(process.cwd(), 'public', cleanPath);

                if (fs.existsSync(localPath)) {
                    const imageBuffer = fs.readFileSync(localPath);
                    const ext = path.extname(localPath).substring(1);
                    imageSrc = `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
                }
            } catch (e) {
                console.error('PDF Export: Failed to embed local image', e);
            }
        }

        return `<div class="submitted-image-container"><img src="${imageSrc}" class="submitted-image" alt="Submitted Image" /></div>`
    }

    return escapeHtml(stringValue)
}


/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Generate PDF from HTML content
 */
export async function generatePdfFromHtml(
    html: string,
    options: PdfExportOptions = {}
): Promise<Buffer> {
    try {
        logToFile('PDF Exporter: Delegating to shared generatePDF...')

        // Merge options with defaults
        const pdfOptions: PDFOptions = {
            ...DEFAULT_OPTIONS,
            ...options,
        }

        // Use the centralized generator which handles serverless environments
        return await generatePDF(html, pdfOptions)
    } catch (error) {
        logToFile('Error generating PDF in exporter:', error instanceof Error ? error.message : error)
        console.error('Error generating PDF in exporter:', error)
        throw new Error('Failed to generate PDF')
    }
}

/**
 * Main entry point: Generate HTML report based on workspace template type
 * Routes to the appropriate template generator
 */
export function generateReportHTML(data: ReportData): string {
    // Determine template type based on workspace or explicit templateType
    const templateType = data.templateType ||
        (data.workspace?.type === 'MINISTRY' ? 'MINISTRY_REPORT' : 'MINISTRY_REPORT')

    // For now, all templates use the Ministry template
    // TODO: Implement other template types (CONSTRUCTION, TRAINING, GENERIC)
    return generateMinistryReportHTML(data)
}

/**
 * Generate PDF from report data
 */
export async function generateReportPdf(
    data: ReportData,
    options: PdfExportOptions = {}
): Promise<Buffer> {
    const html = generateReportHTML(data)
    return generatePdfFromHtml(html, options)
}

