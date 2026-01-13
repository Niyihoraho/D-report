import { TemplateGenerator } from './types'
import { gburThrivingTemplate } from './ministry/THRIVING TOGETHER IN GBUR STUDENT MINISTRY'
import { defaultMinistryTemplate } from './ministry/default'

// Configuration: Map Workspace IDs to specific templates
const WORKSPACE_MAP: Record<string, TemplateGenerator> = {
    // GBUR THRIVING Workspace
    // Note: You can add more IDs here as needed
    'cm47x4u8000010cjz503p4l5q': gburThrivingTemplate,
    'cmk5tqie80000wlek1zg5sdgi': gburThrivingTemplate,
};

/**
 * Get the appropriate template generator for a workspace
 * @param workspaceId The unique ID of the workspace
 */
export function getTemplateForWorkspace(workspaceId: string): TemplateGenerator {
    return WORKSPACE_MAP[workspaceId] || defaultMinistryTemplate
}

/**
 * Helper to register a new workspace template mapping at runtime if needed
 * (Though typically we just update WORKSPACE_MAP above)
 */
export function registerTemplate(workspaceId: string, template: TemplateGenerator) {
    WORKSPACE_MAP[workspaceId] = template
}
