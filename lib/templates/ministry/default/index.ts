import fs from 'fs'
import path from 'path'
import { ReportData, TemplateGenerator } from '../../types'
import https from 'https'
import http from 'http'

/**
 * Default Ministry Template
 * Generic template for workspaces without specific template
 */
export const defaultMinistryTemplate: TemplateGenerator = async (data: ReportData) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const workspace = data.workspace
    const primaryColor = workspace?.primaryColor || '#6C5DD3'
    const workspaceName = workspace?.name || 'Organization'

    // Load logo
    let logoBase64 = ''
    if (workspace?.logoUrl) {
        logoBase64 = await loadLogoAsBase64(workspace.logoUrl)
    }

    // Build content from responses
    let contentHTML = ''
    if (data.responses && Object.keys(data.responses).length > 0) {
        Object.entries(data.responses).forEach(([key, value]) => {
            const formattedValue = formatValue(value)
            contentHTML += `
                <div class="field-row">
                    <span class="field-label">${escapeHtml(key)}:</span>
                    <span class="field-value">${formattedValue}</span>
                </div>`
        })
    } else {
        contentHTML = '<p>No data submitted.</p>'
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
            margin: 25mm;
        }
        
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #1f2937;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${primaryColor};
        }

        .logo {
            width: 120px;
            height: auto;
        }

        .workspace-info {
            text-align: right;
        }

        .workspace-name {
            font-size: 24pt;
            font-weight: bold;
            color: ${primaryColor};
        }

        .report-title {
            font-size: 18pt;
            font-weight: bold;
            margin: 30px 0 20px 0;
            color: #1e293b;
        }

        .meta-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .meta-label {
            font-weight: bold;
            color: #64748b;
        }

        .field-row {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: flex-start;
        }
        
        .field-row:nth-child(even) {
            background-color: #f8fafc;
        }

        .field-label {
            font-weight: bold;
            width: 200px;
            flex-shrink: 0;
            color: #334155;
        }

        .field-value {
            flex-grow: 1;
            color: #0f172a;
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
    <div class="header">
        <div>
            ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ''}
        </div>
        <div class="workspace-info">
            <div class="workspace-name">${escapeHtml(workspaceName)}</div>
            ${workspace?.address ? `<div style="font-size: 10pt; color: #64748b;">${escapeHtml(workspace.address)}</div>` : ''}
        </div>
    </div>

    <div class="report-title">${escapeHtml(data.templateName)}</div>

    <div class="meta-info">
        <div><span class="meta-label">Submitted By:</span> ${escapeHtml(data.submittedBy)}</div>
        <div><span class="meta-label">Email:</span> ${escapeHtml(data.submittedByEmail)}</div>
        <div><span class="meta-label">Date:</span> ${data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : currentDate}</div>
        <div><span class="meta-label">Status:</span> ${escapeHtml(data.status)}</div>
    </div>

    ${contentHTML}

    <div class="footer">
        Generated on ${currentDate} | ${escapeHtml(workspaceName)}
    </div>
</body>
</html>`
}

/**
 * Load logo from URL or local path and convert to base64
 */
async function loadLogoAsBase64(logoPath: string): Promise<string> {
    try {
        // Check if it's a URL
        if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
            return await fetchImageAsBase64(logoPath)
        }

        // Check if it's an absolute local path
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath)
            const ext = path.extname(logoPath).substring(1) || 'png'
            return `data:image/${ext};base64,${logoBuffer.toString('base64')}`
        }

        // Try relative to public directory
        const publicPath = path.join(process.cwd(), 'public', logoPath.replace(/^\//, ''))
        if (fs.existsSync(publicPath)) {
            const logoBuffer = fs.readFileSync(publicPath)
            const ext = path.extname(publicPath).substring(1) || 'png'
            return `data:image/${ext};base64,${logoBuffer.toString('base64')}`
        }

        console.warn(`Logo not found: ${logoPath}`)
        return ''
    } catch (error) {
        console.error('Error loading logo:', error)
        return ''
    }
}

/**
 * Fetch image from URL and convert to base64
 */
function fetchImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https://') ? https : http
        protocol.get(url, (response) => {
            const chunks: Buffer[] = []
            response.on('data', (chunk) => chunks.push(chunk))
            response.on('end', () => {
                const buffer = Buffer.concat(chunks)
                const ext = path.extname(url).substring(1) || 'png'
                resolve(`data:image/${ext};base64,${buffer.toString('base64')}`)
            })
        }).on('error', reject)
    })
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
        return `<img src="${stringValue}" style="max-width: 100%; height: auto; border-radius: 4px;" alt="Image" />`
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
