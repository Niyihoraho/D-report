import { getOrganizationalTree } from "@/app/actions/structure"
import { getUnitTypes } from "@/app/actions/unit-types"
import { getSystemSettings } from "@/app/actions/settings"
import StructureClientPage from "./client-page"

export default async function StructurePage() {
    const settings = await getSystemSettings()
    const units = await getOrganizationalTree()
    const unitTypes = await getUnitTypes()

    return <StructureClientPage
        settings={settings}
        units={units}
        unitTypes={unitTypes}
    />
}
