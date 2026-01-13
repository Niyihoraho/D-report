export interface PdfExportOptions {
    format?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
    margin?: {
        top?: string
        right?: string
        bottom?: string
        left?: string
    }
    displayHeaderFooter?: boolean
    headerTemplate?: string
    footerTemplate?: string
    printBackground?: boolean
    scale?: number
    preferCSSPageSize?: boolean
}

export interface ReportData {
    templateName: string
    submittedBy: string
    submittedByEmail: string
    submittedAt?: string
    status: string
    responses: Record<string, any>
    member?: {
        name: string
        email: string
        profileData?: any
    }
    // Workspace-specific data for custom branding
    workspace?: {
        id: string
        name: string
        type: 'MINISTRY' | 'CONSTRUCTION' | 'TRAINING' | 'GENERAL'
        logoUrl?: string
        stampUrl?: string
        primaryColor?: string
        address?: string
        motto?: string
    }
    // Template configuration
    templateType?: 'MINISTRY_REPORT' | 'CONSTRUCTION_REPORT' | 'TRAINING_REPORT' | 'GENERIC' | 'CUSTOM'
    history?: any[]
    fields?: any[]
}

export interface TemplateGenerator {
    (data: ReportData): Promise<string> | string;
}
