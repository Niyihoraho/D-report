import { customAlphabet } from 'nanoid'

/**
 * Generate a unique public slug for a user profile
 * Format: firstname-lastname-random (e.g., john-doe-x7k9m)
 */
export function generatePublicSlug(name: string, userId: string): string {
    // Create a URL-friendly version of the name
    const namePart = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 30) // Limit length

    // Generate a random suffix using nanoid (URL-safe characters)
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)
    const randomSuffix = nanoid()

    return `${namePart}-${randomSuffix}`
}

/**
 * Sanitize profile data for public display
 * Removes sensitive fields and formats data for display
 */
export function sanitizeProfileData(profileData: any): Record<string, any> {
    if (!profileData || typeof profileData !== 'object') {
        return {}
    }

    // Fields to exclude from public display
    const sensitiveFields = [
        'password',
        'ssn',
        'social_security',
        'tax_id',
        'bank_account',
        'credit_card',
        'internal_id',
        'employee_id'
    ]

    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(profileData)) {
        // Skip sensitive fields
        const lowerKey = key.toLowerCase()
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
            continue
        }

        // Include the field
        sanitized[key] = value
    }

    return sanitized
}

/**
 * Format profile data into organized sections
 * Groups related fields together for better display
 */
export function organizeProfileData(profileData: Record<string, any>): {
    personal: Record<string, any>
    contact: Record<string, any>
    additional: Record<string, any>
} {
    const personal: Record<string, any> = {}
    const contact: Record<string, any> = {}
    const additional: Record<string, any> = {}

    const personalFields = ['name', 'first_name', 'last_name', 'full_name', 'date_of_birth', 'dob', 'age', 'gender']
    const contactFields = ['email', 'phone', 'mobile', 'address', 'city', 'state', 'country', 'zip', 'postal_code']

    for (const [key, value] of Object.entries(profileData)) {
        const lowerKey = key.toLowerCase()

        if (personalFields.some(field => lowerKey.includes(field))) {
            personal[key] = value
        } else if (contactFields.some(field => lowerKey.includes(field))) {
            contact[key] = value
        } else {
            additional[key] = value
        }
    }

    return { personal, contact, additional }
}

/**
 * Format field name for display
 * Converts snake_case or camelCase to Title Case
 */
export function formatFieldName(fieldName: string): string {
    return fieldName
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim()
}

/**
 * Format field value for display
 * Handles different data types appropriately
 */
export function formatFieldValue(value: any): string {
    if (value === null || value === undefined) {
        return 'Not provided'
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
    }

    if (Array.isArray(value)) {
        return value.join(', ')
    }

    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
    }

    return String(value)
}
