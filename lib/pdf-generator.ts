import puppeteer from 'puppeteer'

/**
 * Generate a PDF from HTML content using Puppeteer
 * @param html - Complete HTML string to convert to PDF
 * @returns Buffer containing the generated PDF
 */
export async function generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    })

    try {
        const page = await browser.newPage()

        // Set content and wait for all resources to load
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        })

        // Generate PDF with A4 format
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        })

        return Buffer.from(pdf)
    } finally {
        await browser.close()
    }
}
