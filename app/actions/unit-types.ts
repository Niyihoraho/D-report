"use server"

export async function getUnitTypes() {
    return [
        { id: "1", name: "Ministry", level: 1, description: "Top level", _count: { units: 1 } },
        { id: "2", name: "Campus", level: 2, description: null, _count: { units: 0 } },
        { id: "3", name: "Department", level: 3, description: null, _count: { units: 0 } }
    ]
}

export async function createUnitType(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return { success: true, data: { id: "4", ...data } }
}

export async function deleteUnitType(id: string): Promise<{ success: boolean; error?: string }> {
    return { success: true }
}
