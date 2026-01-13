"use client"

import { useState } from "react"
import { PageHeader } from "@/components/PageHeader"
import { ContentCard } from "@/components/ContentCard"
import { BreadcrumbNav } from "@/components/BreadcrumbNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { createUnitType, deleteUnitType } from "@/app/actions/unit-types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { motion, AnimatePresence } from "framer-motion"

interface UnitType {
    id: string
    name: string
    level: number
    description: string | null
    _count: { units: number }
}

interface StructureSettingsPageProps {
    settings: any
    unitTypes: UnitType[]
}

export default function StructureSettingsClientPage({
    settings,
    unitTypes
}: StructureSettingsPageProps) {
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        // Convert FormData to object matching the action signature
        const data = {
            name: formData.get("name") as string,
            level: parseInt(formData.get("level") as string),
            description: formData.get("description") as string || undefined,
        }

        const result = await createUnitType(data)

        if (result.success) {
            toast.success("Unit type created successfully")
            setIsAdding(false)
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        const result = await deleteUnitType(deleteId)

        if (result.success) {
            toast.success("Unit type deleted")
            router.refresh()
        } else {
            toast.error(result.error)
        }
        setDeleteId(null)
    }

    return (
        <>
            <BreadcrumbNav
                items={[
                    { label: "Dashboard", href: "/admin/dashboard" },
                    { label: "Structure", href: "/admin/structure" },
                    { label: "Settings" }
                ]}
            />

            <PageHeader
                title="Structure Settings"
                actionLabel="Add Level"
                onAction={() => setIsAdding(true)}
            />

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                    <ContentCard
                        title="Hierarchy Levels"
                        description="Define the organizational structure levels for your organization"
                    >
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {unitTypes.map((type) => (
                                    <motion.div
                                        key={type.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2C2F36] group hover:border-[#6C5DD3] transition-colors"
                                    >
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#E4D7FF] dark:bg-[#6C5DD3]/20 text-[#6C5DD3] font-bold shrink-0">
                                            {type.level}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-[#11142D] dark:text-white">
                                                {type.name}
                                            </h3>
                                            {type.description && (
                                                <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                                            )}
                                            {type._count.units > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {type._count.units} unit{type._count.units !== 1 ? 's' : ''} using this type
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteId(type.id)}
                                            className="opacity-0 group-hover:opacity-100 text-[#EB5757] hover:bg-[#FFE5E6] rounded-full transition-opacity"
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {unitTypes.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                    <p className="text-gray-400 mb-4">No hierarchy levels defined yet</p>
                                    <Button onClick={() => setIsAdding(true)} className="rounded-full">
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        Add First Level
                                    </Button>
                                </div>
                            )}
                        </div>
                    </ContentCard>
                </div>

                <div>
                    {isAdding ? (
                        <ContentCard title="Add New Level" description="Define a new hierarchy level">
                            <form action={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Level Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Region, Campus, Department"
                                        required
                                        className="rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level">Level Number</Label>
                                    <Input
                                        id="level"
                                        name="level"
                                        type="number"
                                        min="1"
                                        placeholder="1, 2, 3..."
                                        required
                                        className="rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500">
                                        1 = Top level, 2 = Second level, etc.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="What is this level for?"
                                        className="rounded-lg h-20"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="flex-1 rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb3]"
                                    >
                                        Create Level
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAdding(false)}
                                        className="rounded-full"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </ContentCard>
                    ) : (
                        <ContentCard title="How It Works" description="Understanding hierarchy levels">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                <p>
                                    Create levels that match your organization's hierarchy.
                                    For example: National → Region → Campus.
                                    All units must use these types to ensure consistency.
                                </p>
                            </div>
                        </ContentCard>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Unit Type"
                description="Are you sure? This will fail if any units are using this type."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    )
}
