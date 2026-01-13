/**
 * Generate a unique reference number for reports
 * Format: XX-YYYY-XXXXXX
 * Example: TR-2025-A3F9K2
 * 
 * @param type - Report type (e.g., "TRANSCRIPT", "CERTIFICATE")
 * @returns Unique reference number
 */
export function generateReferenceNumber(type: string): string {
    // Get prefix from type (first 2 letters)
    const prefix = type.substring(0, 2).toUpperCase()

    // Get current year
    const year = new Date().getFullYear()

    // Generate random alphanumeric string (6 characters)
    const random = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
        .padEnd(6, '0')

    return `${prefix}-${year}-${random}`
}

/**
 * Validate reference number format
 * @param referenceNumber - Reference number to validate
 * @returns True if valid format
 */
export function isValidReferenceNumber(referenceNumber: string): boolean {
    // Format: XX-YYYY-XXXXXX
    const pattern = /^[A-Z]{2}-\d{4}-[A-Z0-9]{6}$/
    return pattern.test(referenceNumber)
}
