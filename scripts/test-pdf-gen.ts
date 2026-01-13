
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

async function testPdfGeneration() {
    console.log('Starting standalone PDF test...')
    let browser;
    try {
        console.log('Launching browser...')
        console.log('Executable Path:', puppeteer.executablePath())
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        })
        console.log('Browser launched.')

        const page = await browser.newPage()
        console.log('Page created.')

        await page.setContent('<h1>Hello World</h1><p>PDF Test</p>')
        console.log('Content set.')

        const pdfBuffer = await page.pdf({ format: 'A4' })
        console.log(`PDF generated. Size: ${pdfBuffer.length} bytes`)

        const key = Date.now()
        const outputPath = path.resolve(process.cwd(), `test-output-${key}.pdf`)
        fs.writeFileSync(outputPath, pdfBuffer)
        console.log(`Saved to ${outputPath}`)

    } catch (error) {
        console.error('TEST FAILED:', error)
    } finally {
        if (browser) await browser.close()
    }
}

testPdfGeneration()
