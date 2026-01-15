import puppeteer, { PDFOptions } from 'puppeteer'
import chromium from '@sparticuz/chromium'
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
            // Serverless configuration using sparticuz/chromium
            console.log('🚀 Using Serverless Puppeteer (Sparticuz/Chromium)')

            try {
                // Modern configuration for @sparticuz/chromium
                (chromium as any).setHeadlessMode = true;
                (chromium as any).setGraphicsMode = false;

                // For Netlify, we might need to explicitly point to the right location or trust the library defaults
                // logging specific environment variables that might help debug path issues
                console.log('AWS_LAMBDA_TASK_ROOT:', process.env.AWS_LAMBDA_TASK_ROOT);

                const executablePath = await chromium.executablePath();
                console.log('Serverless Executable Path:', executablePath);

                browser = await puppeteerCore.launch({
                    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
                    defaultViewport: (chromium as any).defaultViewport,
                    executablePath: executablePath,
                    headless: (chromium as any).headless,
                    ignoreDefaultArgs: ['--disable-extensions'],
                })
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
            waitUntil: 'networkidle0', // Stricter wait ensuring meaningful content is loaded
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
