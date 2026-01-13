import { getUnitTypes } from "@/app/actions/unit-types"
import { getSystemSettings } from "@/app/actions/settings"
import StructureSettingsClientPage from "./client-page"

export default async function StructureSettingsPage() {
    const settings = await getSystemSettings()
    const unitTypes = await getUnitTypes()

    return <StructureSettingsClientPage
        settings={settings}
        unitTypes={unitTypes}
    />
}
