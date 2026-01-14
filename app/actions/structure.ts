"use server"

export async function getOrganizationalTree() {
    return [
        {
            id: "root",
            name: "Main Ministry",
            type: "Ministry",
            children: []
        }
    ]
}


export async function createUnit(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return { success: true, data: { id: `unit_${Date.now()}`, ...data } }
}

export async function updateUnitParent(unitId: string, parentId: string): Promise<{ success: boolean; error?: string }> {
    return { success: true }
}

export async function deleteUnit(id: string): Promise<{ success: boolean; error?: string }> {
    // Mock deletion logic
    const isSuccess = true as boolean;
    if (isSuccess) {
        return { success: true };
    }
    return { success: false, error: "Failed to delete" };
}
