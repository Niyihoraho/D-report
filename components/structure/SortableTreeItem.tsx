"use client"

import React, { useState } from "react"
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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconGripVertical, IconFolder, IconBuilding, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Types
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
}

interface TreeItemProps {
    unit: Unit
    depth: number
    onDelete: (id: string) => void
    isOverlay?: boolean
}

export function SortableTreeItem({ unit, depth, onDelete, isOverlay }: TreeItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: unit.id, data: { ...unit, depth } })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        marginLeft: `${depth * 24}px`, // Visual indentation
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 mb-2 rounded-xl border bg-white dark:bg-[#1F2128] dark:border-[#2C2F36] shadow-sm group hover:border-[#6C5DD3] transition-colors",
                isOverlay && "shadow-xl border-[#6C5DD3] scale-105"
            )}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-[#6C5DD3]">
                <IconGripVertical className="h-5 w-5" />
            </div>

            {/* Icon based on Type (Visual only for now) */}
            <div className="h-8 w-8 rounded-full bg-[#E4D7FF] dark:bg-[#6C5DD3]/20 flex items-center justify-center text-[#6C5DD3]">
                {/* Use the level from the type if available to decide icon, or depth */}
                {unit.type?.level === 1 || depth === 0 ? <IconBuilding className="h-4 w-4" /> : <IconFolder className="h-4 w-4" />}
            </div>

            {/* Content */}
            <div className="flex-1">
                <p className="font-medium text-[#11142D] dark:text-white text-sm">{unit.name}</p>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2C2F36] text-gray-500">
                        {unit.type?.name || "Unknown"}
                    </span>
                    {unit._count && unit._count.users > 0 && (
                        <span className="text-xs text-gray-400">{unit._count.users} users</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(unit.id)}
                className="opacity-0 group-hover:opacity-100 text-[#EB5757] hover:bg-[#FFE5E6] hover:text-[#EB5757] rounded-full transition-opacity h-8 w-8"
            >
                <IconTrash className="h-4 w-4" />
            </Button>
        </div>
    )
}
