"use client"

import React, { useState, useMemo } from "react"
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableTreeItem } from "./SortableTreeItem"
import { updateUnitParent } from "@/app/actions/structure"
import { toast } from "sonner"

type UnitType = {
    name: string
    level: number
}

type Unit = {
    id: string
    name: string
    typeId: string
    type?: UnitType
    parentId: string | null
    _count?: { users: number, children: number }
    createdAt: Date
    updatedAt: Date
    description: string | null
}

interface TreeBuilderProps {
    initialUnits: Unit[]
    onDelete: (id: string) => void
}

// Helper to build tree structure from flat list
const buildTree = (items: Unit[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new Map<string, any>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roots: any[] = []

    // Initialize
    items.forEach(item => {
        map.set(item.id, { ...item, children: [], depth: 0 })
    })

    // Connect
    items.forEach(item => {
        const node = map.get(item.id)
        if (item.parentId && map.has(item.parentId)) {
            const parent = map.get(item.parentId)
            parent.children.push(node)
        } else {
            roots.push(node)
        }
    })

    return { roots, map }
}

// Helper to flatten tree with depth info
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flattenTree = (roots: any[], depth = 0): (Unit & { depth: number })[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let flat: any[] = []
    for (const node of roots) {
        node.depth = depth
        flat.push(node)
        if (node.children.length > 0) {
            flat = [...flat, ...flattenTree(node.children, depth + 1)]
        }
    }
    return flat
}

export function TreeBuilder({ initialUnits, onDelete }: TreeBuilderProps) {
    // Local state for optimistic UI
    const [items, setItems] = useState<Unit[]>(initialUnits)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    )

    // Derived state: Flattened tree with visual depth
    const flatItems = useMemo(() => {
        // 1. Re-build tree from current state
        const { roots } = buildTree(items)
        // 2. Flatten for display
        return flattenTree(roots)
    }, [items])

    const activeItem = useMemo(() =>
        items.find((item) => item.id === activeId),
        [activeId, items])

    // Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) {
            setActiveId(null)
            return
        }

        // Drop Logic: Drop on top = become child
        const overItem = items.find(i => i.id === overId)
        const activeItem = items.find(i => i.id === activeId)

        if (overItem && activeItem) {
            const newParentId = overItem.id

            // Call server
            const result = await updateUnitParent(activeId, newParentId)

            if (result.success) {
                toast.success(`Moved ${activeItem.name} into ${overItem.name}`)
                // Update local items to reflect new parent
                setItems(prev => prev.map(item =>
                    item.id === activeId ? { ...item, parentId: newParentId } : item
                ))
            } else {
                toast.error(result.error || "Failed to move item")
            }
        }

        setActiveId(null)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="bg-gray-50 dark:bg-[#1F2128]/50 p-4 rounded-xl min-h-[300px]">
                <SortableContext
                    items={flatItems.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {flatItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            No units yet. Add one to start building the tree.
                        </div>
                    ) : (
                        flatItems.map((unit) => (
                            <SortableTreeItem
                                key={unit.id}
                                unit={unit}
                                depth={unit.depth}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </SortableContext>
            </div>

            <DragOverlay>
                {activeId && activeItem ? (
                    <SortableTreeItem
                        unit={activeItem}
                        depth={0}
                        onDelete={() => { }}
                        isOverlay
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
