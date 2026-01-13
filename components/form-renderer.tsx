'use client';

import { useState, useEffect } from 'react';
import { FormElement, FormField, FormRepeater, FormSection } from '@/lib/types/form-structure';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface FormRendererProps {
    structure: FormElement[];
    initialData?: any;
    onSubmit: (data: any) => void;
    readOnly?: boolean;
}

export default function FormRenderer({ structure, initialData = {}, onSubmit, readOnly = false }: FormRendererProps) {
    const [formData, setFormData] = useState<any>(initialData);

    const handleChange = (path: string[], value: any) => {
        setFormData((prev: any) => {
            const newData = { ...prev };
            let current = newData;
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {structure.map((element) => (
                <RenderElement
                    key={element.id}
                    element={element}
                    data={formData}
                    onChange={handleChange}
                    path={[]}
                    readOnly={readOnly}
                />
            ))}

            {!readOnly && (
                <div className="flex justify-end pt-4">
                    <Button type="submit">Submit Report</Button>
                </div>
            )}
        </form>
    );
}

interface RenderElementProps {
    element: FormElement;
    data: any;
    onChange: (path: string[], value: any) => void;
    path: string[];
    readOnly: boolean;
}

function RenderElement({ element, data, onChange, path, readOnly }: RenderElementProps) {
    if (element.type === 'section') {
        return (
            <Card className="p-4 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">{element.label}</h3>
                <div className="space-y-4">
                    {(element as FormSection).children.map((child) => (
                        <RenderElement
                            key={child.id}
                            element={child}
                            data={data}
                            onChange={onChange}
                            path={path} // Sections don't necessarily nest data, or do they?
                            // Usually sections are visual. Let's assume flattened data or check id.
                            // If section has an ID, maybe we shouldn't nest data under it 
                            // unless it's a logical grouping in the JSON.
                            // For simplicity, let's NOT nest data under sections, 
                            // assuming fields have unique IDs relative to their container.
                            // However, in recursions, unique IDs are tricky.
                            // Use the field's ID as the key.
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            </Card>
        );
    }

    if (element.type === 'repeater') {
        const repeater = element as FormRepeater;
        const items = (data[repeater.id] as any[]) || [];

        const handleAddItem = () => {
            const newItem: any = {};
            // Initialize default values
            repeater.fields.forEach(f => {
                if (f.defaultValue !== undefined) newItem[f.id] = f.defaultValue;
            });
            onChange([...path, repeater.id], [...items, newItem]);
        };

        const handleRemoveItem = (index: number) => {
            const newItems = [...items];
            newItems.splice(index, 1);
            onChange([...path, repeater.id], newItems);
        };

        const handleItemChange = (index: number, fieldId: string, value: any) => {
            const newItems = [...items];
            if (!newItems[index]) newItems[index] = {};
            newItems[index] = { ...newItems[index], [fieldId]: value };
            onChange([...path, repeater.id], newItems);
        };

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{repeater.label}</Label>
                    {!readOnly && (
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <Plus className="w-4 h-4 mr-1" /> Add Item
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <Card key={index} className="p-3 relative">
                            {!readOnly && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {repeater.fields.map((field) => (
                                    <div key={field.id} className="space-y-1">
                                        <Label className="text-xs text-gray-500">{field.label}</Label>
                                        <RenderFieldInput
                                            field={field}
                                            value={item[field.id]}
                                            onChange={(val) => handleItemChange(index, field.id, val)}
                                            readOnly={readOnly}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center p-4 border-2 border-dashed rounded-lg text-gray-400">
                            No items added.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // It's a field
    const field = element as FormField;
    // For top level fields, access data directly by ID
    // Check if we are inside a path?
    // If path is empty, we are at root.
    // NOTE: Sections passed empty path.
    const value = data[field.id];

    return (
        <div className="space-y-1">
            <Label>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RenderFieldInput
                field={field}
                value={value}
                onChange={(val) => onChange([...path, field.id], val)}
                readOnly={readOnly}
            />
        </div>
    );
}

function RenderFieldInput({ field, value, onChange, readOnly }: { field: FormField, value: any, onChange: (val: any) => void, readOnly: boolean }) {
    const val = value !== undefined ? value : (field.defaultValue || '');

    if (field.type === 'textarea') {
        return (
            <Textarea
                value={val}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                disabled={readOnly}
                required={field.required}
            />
        );
    }

    if (field.type === 'select') {
        return (
            <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={val}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                required={field.required}
            >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <Input
            type={field.type}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={readOnly}
            required={field.required}
        />
    );
}
