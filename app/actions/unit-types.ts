"use server"

export async function getUnitTypes() {
    return [
        { id: "1", name: "Ministry", level: 1 },
        { id: "2", name: "Campus", level: 2 },
        { id: "3", name: "Department", level: 3 }
    ]
}

export async function createUnitType(data: any) {
    return { success: true, data: { id: "4", ...data } }
}

export async function deleteUnitType(id: string) {
    return { success: true }
}
