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


export async function createUnit(data: any) {
    return { success: true, data: { id: `unit_${Date.now()}`, ...data } }
}

export async function updateUnitParent(unitId: string, parentId: string) {
    return { success: true }
}

export async function deleteUnit(id: string) {
    // Mock deletion logic
    const isSuccess = true;
    if (isSuccess) {
        return { success: true };
    }
    return { success: false, error: "Failed to delete" };
}
