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
    key: string;
    required?: boolean;
    description?: string;
    options?: { label: string; value: string }[];
    children?: FormElement[];
    placeholder?: string;
    defaultValue?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}
