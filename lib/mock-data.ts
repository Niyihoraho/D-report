// Mock data to replace backend database
import { TemplateWithVersions, TemplateVersion, Template } from "@/lib/types/db";

const user = {
    id: "user-1",
    email: "admin@test.com",
    role: "ADMIN",
    profileData: {
        fullName: "Admin User"
    }
};

const template1: Template = {
    id: "1",
    name: "Annual Activity Report 2024",
    description: "Standard annual report for all campuses",
    category: "Annual",
    createdById: "user-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
};

const version1: TemplateVersion = {
    id: "v1",
    templateId: "1",
    versionNumber: 1,
    fileUrl: "/placeholder.docx",
    fileName: "annual_report.docx",
    fileSize: 1024,
    structure: [],
    visualMapping: {},
    isPublished: true,
    publishedAt: new Date("2024-01-20"),
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
};

export const MOCK_TEMPLATES = [
    {
        ...template1,
        versions: [
            {
                ...version1,
                // Helper to simulate "include: { template: true }"
                template: template1
            }
        ]
    },
    {
        id: "2",
        name: "Event Budget Request",
        description: "For requesting funds for campus events",
        category: "Financial",
        createdById: "user-1",
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10"),
        versions: [
            {
                id: "v2",
                templateId: "2",
                versionNumber: 1,
                fileUrl: "/placeholder.docx",
                fileName: "budget_request.docx",
                fileSize: 2048,
                structure: [],
                visualMapping: {},
                isPublished: true,
                publishedAt: new Date("2024-02-10"),
                createdAt: new Date("2024-02-10"),
                updatedAt: new Date("2024-02-10"),
                template: {
                    id: "2",
                    name: "Event Budget Request",
                    description: "For requesting funds for campus events",
                    category: "Financial",
                    createdById: "user-1",
                    createdAt: new Date("2024-02-10"),
                    updatedAt: new Date("2024-02-10"),
                }
            }
        ]
    },
    {
        id: "3",
        name: "Monthly Progress Update",
        description: "Short monthly check-in for regional coordinators",
        category: "Periodic",
        createdById: "user-1",
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date("2024-03-05"),
        versions: [
            {
                id: "v3",
                templateId: "3",
                versionNumber: 1,
                fileUrl: "/placeholder.docx",
                fileName: "monthly_update.docx",
                fileSize: 512,
                structure: [],
                visualMapping: {},
                isPublished: true,
                publishedAt: new Date("2024-03-05"),
                createdAt: new Date("2024-03-05"),
                updatedAt: new Date("2024-03-05"),
                template: {
                    id: "3",
                    name: "Monthly Progress Update",
                    description: "Short monthly check-in for regional coordinators",
                    category: "Periodic",
                    createdById: "user-1",
                    createdAt: new Date("2024-03-05"),
                    updatedAt: new Date("2024-03-05"),
                }
            }
        ]
    }
];

export const MOCK_USER = user;

export const MOCK_ASSIGNMENTS = [
    {
        id: "a1",
        title: "Q4 Activity Report",
        description: "Please fill out the annual activity report",
        status: "PENDING",
        dueDate: new Date("2024-12-31"),
        assignedToId: "user-1",
        createdAt: new Date("2024-12-01"),
        templateVersion: {
            ...version1,
            template: template1
        },
        assignedTo: {
            ...user,
            name: user.profileData.fullName
        }
    }
];

export const MOCK_STATS = {
    templatesCount: 3,
    assignmentsCount: 1,
    pendingCount: 1,
    completedCount: 0
};
