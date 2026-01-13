"use client"

import {
    Type,
    Mail,
    Phone,
    List,
    CheckSquare,
    Calendar,
    Upload,
    CircleDot,
    Plus,
    Hash,
    Split,
    AlignLeft
} from "lucide-react"

export const fieldTypes = [
    { type: 'text', icon: Type, label: 'Text Input', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { type: 'number', icon: Hash, label: 'Number', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
    { type: 'email', icon: Mail, label: 'Email', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    { type: 'phone', icon: Phone, label: 'Phone', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { type: 'dropdown', icon: List, label: 'Dropdown', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { type: 'radio', icon: CircleDot, label: 'Radio', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' },
    { type: 'checkbox', icon: CheckSquare, label: 'Checkbox', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { type: 'date', icon: Calendar, label: 'Date', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { type: 'textarea', icon: AlignLeft, label: 'Long Text', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
    { type: 'file', icon: Upload, label: 'Image / File Upload', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { type: 'section', icon: Split, label: 'Section Break', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-500/10' },
]

interface FieldPaletteProps {
    onAddField: (type: string) => void
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
    return (
        <div className="glass-card rounded-[24px] p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-[#11142D] dark:text-white">Form Fields</h3>
            <p className="text-xs text-gray-400 mb-4">Click to add fields to your form.</p>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {fieldTypes.map((field) => {
                    const Icon = field.icon
                    return (
                        <button
                            key={field.type}
                            onClick={() => onAddField(field.type)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-white/5 active:scale-95 group text-left"
                        >
                            <div className={`p-2 rounded-lg ${field.bg}`}>
                                <Icon className={`h-5 w-5 ${field.color}`} />
                            </div>
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-200 group-hover:text-[#6C5DD3] transition-colors whitespace-nowrap">{field.label}</span>
                            <Plus className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-[#6C5DD3]" />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
