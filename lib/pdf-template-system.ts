import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer'
import { generatePDF } from './pdf-generator'
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
    try {
        logToFile('PDF Exporter: Delegating to shared generatePDF...')

        const pdfOptions: PDFOptions = {
            ...DEFAULT_OPTIONS,
            ...options,
        }

        return await generatePDF(html, pdfOptions)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logToFile('Error generating PDF in exporter:', errorMessage)
        console.error('Error generating PDF in exporter:', error)
        throw new Error(`PDF Generation Failed: ${errorMessage}`)
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
