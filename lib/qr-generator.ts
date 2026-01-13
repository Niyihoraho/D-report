import QRCode from 'qrcode'

/**
 * Generate QR code as data URL for embedding in PDFs
 * @param data - Data to encode in QR code (typically verification URL)
 * @returns Data URL string for the QR code image
 */
export async function generateQRCode(data: string): Promise<string> {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(data, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        return qrCodeDataURL
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}

/**
 * Generate QR code as buffer for file storage
 * @param data - Data to encode in QR code
 * @returns Buffer containing QR code image
 */
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
        const buffer = await QRCode.toBuffer(data, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        return buffer
    } catch (error) {
        console.error('Error generating QR code buffer:', error)
        throw new Error('Failed to generate QR code buffer')
    }
}
