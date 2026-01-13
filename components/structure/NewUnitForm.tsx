"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createUnit } from "@/app/actions/structure"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface UnitType {
    id: string
    name: string
    level: number
}

interface NewUnitFormProps {
    unitTypes: UnitType[]
    onSuccess?: () => void
}

export function NewUnitForm({ unitTypes, onSuccess }: NewUnitFormProps) {
    const [isPending, setIsPending] = useState(false)

    // Form Action wrapper
    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)

        const data = {
            name: formData.get("name") as string,
            typeId: formData.get("typeId") as string,
            description: formData.get("description") as string || undefined
        }

        const result = await createUnit(data)

        if (result.success) {
            toast.success("Unit created successfully")
            const form = document.querySelector('form') as HTMLFormElement
            form?.reset()
            onSuccess?.()
        } else {
            toast.error(result.error || "Failed to create unit")
        }
        setIsPending(false)
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Unit Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Finance Department"
                    required
                    className="rounded-lg"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="typeId">Type</Label>
                <Select name="typeId" required>
                    <SelectTrigger className="rounded-lg bg-gray-50 dark:bg-[#1F2128]">
                        <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                    <SelectContent>
                        {unitTypes && unitTypes.length > 0 ? (
                            unitTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name} (Level {type.level})
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500 text-center">
                                No levels defined. <br />
                                Go to Structure Settings to add them.
                            </div>
                        )}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                    The hierarchal level of this unit
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief details..."
                    className="rounded-lg h-24"
                />
            </div>

            <Button
                type="submit"
                className="w-full rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white"
                disabled={isPending}
            >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Unit
            </Button>
        </form>
    )
}
