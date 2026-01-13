import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { PdfExportOptions, ReportData } from './templates/types'
import { getTemplateForWorkspace } from './templates'

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
    // Simple console log for now, file logging removed to clean up deps
    console.log(`[PDF DEBUG] ${message}`, data || '')
}


/**
 * Main entry point: Generate HTML report based on workspace template assignment
 */
export async function generateReportHTML(data: ReportData): Promise<string> {
    const workspaceId = data.workspace?.id || 'default'
    const generator = getTemplateForWorkspace(workspaceId)
    return await generator(data)
}



/**
 * Generate PDF from HTML content
 */
export async function generatePdfFromHtml(
    html: string,
    options: PdfExportOptions = {}
): Promise<Buffer> {
    let browser: Browser | null = null

    try {
        logToFile('PDF Exporter: Launching Puppeteer...')
        const executablePath = puppeteer.executablePath()
        logToFile('PDF Exporter: Executable Path resolved to ' + executablePath)

        browser = await puppeteer.launch({
            headless: true,
            executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        })
        logToFile('PDF Exporter: Browser launched successfully')

        const page: Page = await browser.newPage()

        logToFile('PDF Exporter: Setting page content...')
        await page.setContent(html, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        })
        logToFile('PDF Exporter: Page content set')

        const pdfOptions: PDFOptions = {
            ...DEFAULT_OPTIONS,
            ...options,
        }

        logToFile('PDF Exporter: Generating PDF buffer...')
        const pdf = await page.pdf(pdfOptions)
        logToFile(`PDF Exporter: PDF buffer generated. Size: ${pdf.length}`)

        return Buffer.from(pdf)
    } catch (error) {
        logToFile('Error generating PDF in exporter:', error instanceof Error ? error.message : error)
        console.error('Error generating PDF in exporter:', error)
        throw new Error('Failed to generate PDF')
    } finally {
        if (browser) {
            await browser.close()
            logToFile('PDF Exporter: Browser closed')
        }
    }
}

/**
 * Generate PDF from report data
 */
export async function generateReportPdf(
    data: ReportData,
    options: PdfExportOptions = {}
): Promise<Buffer> {
    const html = await generateReportHTML(data)
    return generatePdfFromHtml(html, options)
}
