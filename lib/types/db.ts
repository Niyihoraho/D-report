export interface Template {
    id: string;
    name: string;
    description: string | null;
    category: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateVersion {
    id: string;
    templateId: string;
    versionNumber: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    structure: any; // Using any for JSON structure simplicity
    visualMapping: any;
    isPublished: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type TemplateWithVersions = Template & {
    versions: TemplateVersion[];
};

export type TemplateVersionWithTemplate = TemplateVersion & {
    template: Template;
};
