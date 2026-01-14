export type FormElementType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'section'
    | 'group'
    | 'repeater';

export interface FormElement {
    id: string;
    type: FormElementType;
    label: string;
    // For root elements, key is usually the id, but specific fields might have a key
    key?: string;
    required?: boolean;
    description?: string;
    options?: { label: string; value: string }[];
    // For Container types (section, group)
    children?: FormElement[];
    // For Repeater
    fields?: FormField[]; // Fields inside a repeater

    placeholder?: string;
    defaultValue?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

export interface FormField extends FormElement {
    type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';
}

export interface FormSection extends FormElement {
    type: 'section' | 'group';
    children: FormElement[];
}

export interface FormRepeater extends FormElement {
    type: 'repeater';
    fields: FormField[];
}
