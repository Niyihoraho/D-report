import puppeteer from 'puppeteer'
import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'

/**
 * Generate a PDF from HTML content using Puppeteer
 * @param html - Complete HTML string to convert to PDF
 * @returns Buffer containing the generated PDF
 */
export async function generatePDF(html: string): Promise<Buffer> {
    let browser: any = null

    try {
        // Detect if running in a serverless environment (Netlify/AWS Lambda)
        const isServerless = process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.NETLIFY || process.env.NEXT_PUBLIC_IS_SERVERLESS

        if (isServerless) {
            // Serverless configuration using sparticuz/chromium
            console.log('🚀 Using Serverless Puppeteer (Sparticuz/Chromium)')

            // Configure font support for specialized characters if needed
            // await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

            browser = await puppeteerCore.launch({
                args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: { width: 1920, height: 1080 },
                executablePath: await chromium.executablePath(),
                headless: true,
            })
        } else {
            // Local development fallback using standard Puppeteer
            console.log('💻 Using Local Puppeteer')
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            })
        }

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
    } catch (error) {
        console.error('❌ PDF Generation Error:', error)
        throw error
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
