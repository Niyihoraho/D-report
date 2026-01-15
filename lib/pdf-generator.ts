import puppeteer, { PDFOptions } from 'puppeteer'
import puppeteerCore from 'puppeteer-core'

/**
 * Generate a PDF from HTML content using Puppeteer
 * @param html - Complete HTML string to convert to PDF
 * @param options - Optional PDF generation options
 * @returns Buffer containing the generated PDF
 */
export async function generatePDF(html: string, options?: PDFOptions): Promise<Buffer> {
    let browser: any = null

    try {
        // Detect if running in a serverless environment (Netlify/AWS Lambda/Vercel)
        const isServerless =
            process.env.AWS_LAMBDA_FUNCTION_VERSION ||
            process.env.NETLIFY ||
            process.env.VERCEL ||
            process.env.NEXT_PUBLIC_IS_SERVERLESS

        console.log('--- PDF Generator Debug ---')
        console.log('Environment Check:', {
            AWS_LAMBDA: !!process.env.AWS_LAMBDA_FUNCTION_VERSION,
            NETLIFY: !!process.env.NETLIFY,
            VERCEL: !!process.env.VERCEL,
            NEXT_PUBLIC_IS_SERVERLESS: !!process.env.NEXT_PUBLIC_IS_SERVERLESS,
            isServerless: !!isServerless
        })

        if (isServerless) {
            // Serverless configuration using chromium-min (CDN-based binary)
            console.log('🚀 Using Serverless Puppeteer (Chromium-Min CDN)')

            try {
                // Import chromium-min dynamically to avoid bundling issues
                const chromium = await import('@sparticuz/chromium-min')

                // Use CDN-hosted Chromium binary (much smaller and doesn't require bundling)
                const executablePath = await chromium.default.executablePath(
                    'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
                )

                console.log('Serverless Executable Path:', executablePath)

                browser = await puppeteerCore.launch({
                    args: [
                        ...(chromium.default as any).args,
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--single-process',
                        '--no-zygote'
                    ],
                    defaultViewport: (chromium.default as any).defaultViewport,
                    executablePath: executablePath,
                    headless: (chromium.default as any).headless,
                })

                console.log('✅ Browser launched successfully')
            } catch (launchError) {
                console.error('SERVERLESS LAUNCH ERROR:', launchError)
                throw launchError
            }
        } else {
            // Local development fallback using standard Puppeteer
            console.log('💻 Using Local Puppeteer')
            try {
                browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ]
                })
            } catch (launchError) {
                console.error('LOCAL LAUNCH ERROR:', launchError)
                throw launchError
            }
        }

        const page = await browser.newPage()

        // Set content and wait for all resources to load
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 60000
        })

        // Default options if none provided
        const finalOptions: PDFOptions = options || {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        }

        // Generate PDF
        const pdf = await page.pdf(finalOptions)

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
