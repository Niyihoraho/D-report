import { TemplateGenerator } from './types'
import { gburThrivingTemplate } from './ministry/THRIVING TOGETHER IN GBUR STUDENT MINISTRY'
import { defaultMinistryTemplate } from './ministry/default'

// Configuration: Map Workspace IDs to specific templates
const WORKSPACE_MAP: Record<string, TemplateGenerator> = {
    // GBUR THRIVING Workspace
    // We also support looking up by name in getTemplateForWorkspace
    'cm47x4u8000010cjz503p4l5q': gburThrivingTemplate,
    'cmk5tqie80000wlek1zg5sdgi': gburThrivingTemplate,
};

/**
 * Get the appropriate template generator for a workspace
 * @param workspaceId The unique ID of the workspace
 * @param workspaceName The name of the workspace (optional)
 */
export function getTemplateForWorkspace(workspaceId: string, workspaceName?: string): TemplateGenerator {
    // 1. Try ID match
    if (WORKSPACE_MAP[workspaceId]) {
        return WORKSPACE_MAP[workspaceId]
    }

    // 2. Try Name match (fuzzy)
    if (workspaceName) {
        const normalizedName = workspaceName.toLowerCase().trim()
        if (normalizedName.includes('thrive together in gbu') ||
            normalizedName.includes('thriving together in gbu')) {
            return gburThrivingTemplate
        }
    }

    // 3. Fallback to default
    return defaultMinistryTemplate
}

/**
 * Helper to register a new workspace template mapping at runtime if needed
 * (Though typically we just update WORKSPACE_MAP above)
 */
export function registerTemplate(workspaceId: string, template: TemplateGenerator) {
    WORKSPACE_MAP[workspaceId] = template
}
