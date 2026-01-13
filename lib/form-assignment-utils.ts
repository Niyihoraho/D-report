import { customAlphabet } from 'nanoid'

/**
 * Generate a unique public slug for a form assignment
 * Format: username-formname-random (e.g., john-doe-health-form-x7k9m)
 */
export function generateFormAssignmentSlug(
    userName: string,
    formName: string
): string {
    // Create URL-friendly versions
    const userPart = userName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 20)

    const formPart = formName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 20)

    // Generate a random suffix
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)
    const randomSuffix = nanoid()

    return `${userPart}-${formPart}-${randomSuffix}`
}

/**
 * Generate a unique public slug for a form template
 * Format: formname-random (e.g., health-assessment-x7k9m)
 */
export function generateFormTemplateSlug(formName: string): string {
    const formPart = formName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 40)

    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)
    const randomSuffix = nanoid()

    return `${formPart}-${randomSuffix}`
}
