"use client"

import { useState } from "react"
import { PageHeader } from "@/components/PageHeader"
import { ContentCard } from "@/components/ContentCard"
import { BreadcrumbNav } from "@/components/BreadcrumbNav"
import { NewUnitForm } from "@/components/structure/NewUnitForm"
import { TreeBuilder } from "@/components/structure/TreeBuilder"
import { deleteUnit } from "@/app/actions/structure"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type UnitType = {
    id: string
    name: string
    level: number
}

interface StructurePageProps {
    settings: any
    units: any[]
    unitTypes: UnitType[]
}

export default function StructureClientPage({ settings, units, unitTypes }: StructurePageProps) {
    const router = useRouter()

    const handleDelete = async (unitId: string) => {
        if (confirm("Are you sure you want to delete this unit?")) {
            const result = await deleteUnit(unitId)
            if (result.success) {
                toast.success("Unit deleted")
                router.refresh()
            } else {
                toast.error(result.error)
            }
        }
    }

    return (
        <>
            <BreadcrumbNav
                items={[
                    { label: "Dashboard", href: "/admin/dashboard" },
                    { label: "Structure" }
                ]}
            />

            <PageHeader
                title={`${settings?.name || 'Organization'} Structure`}
                actionLabel="Manage Levels"
                onAction={() => router.push(`/admin/structure-settings`)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* Left Column: Tree Builder */}
                <div className="lg:col-span-2">
                    <ContentCard
                        title="Organizational Tree"
                        description="Drag and drop units to arrange the hierarchy."
                    >
                        <TreeBuilder
                            initialUnits={units}
                            onDelete={handleDelete}
                        />
                    </ContentCard>
                </div>

                {/* Right Column: Add New Unit Form */}
                <div>
                    <ContentCard title="Add Unit" description="Create a new leaf in the tree.">
                        <NewUnitForm
                            unitTypes={unitTypes}
                            onSuccess={() => router.refresh()}
                        />
                    </ContentCard>

                    <div className="mt-6 rounded-[20px] bg-[#E4D7FF]/30 p-6 border border-[#E4D7FF]">
                        <h3 className="font-semibold text-[#6C5DD3] mb-2">Did you know?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            This structure powers the <strong>Waterfall Security</strong>.
                            A manager assigned to a parent unit automatically sees data from all child units.
                        </p>
                    </div>
                </div>

            </div>
        </>
    )
}
