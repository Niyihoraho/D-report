import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string; submissionId: string }> }
) {
    const { id, submissionId } = await context.params
    try {
        // First try to find as an assignment (single submission or parent)
        let assignment = await prisma.formAssignment.findUnique({
            where: {
                id: submissionId,
                member: {
                    workspaceId: id
                }
            },
            include: {
                submissions: {
                    orderBy: { submittedAt: 'desc' },
                    select: {
                        id: true,
                        submittedAt: true,
                        createdAt: true,
                        responses: true
                    }
                },
                template: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        fields: true
                    }
                },
                member: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                createdAt: true
                            }
                        },
                        workspace: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        // If found as assignment, transform and return
        if (assignment) {
            const fields = assignment.template.fields as any[] || []
            const fieldMap = fields.reduce((acc: Record<string, string>, field: any) => {
                if (field.id && field.label) {
                    acc[field.id] = field.label
                }
                return acc
            }, {})

            const transformedResponses: Record<string, any> = {}
            if (assignment.responses) {
                Object.entries(assignment.responses as Record<string, any>).forEach(([key, value]) => {
                    const label = fieldMap[key] || key
                    transformedResponses[label] = value
                })
            }

            const data = {
                id: assignment.id,
                type: 'assignment',
                templateId: assignment.template?.id || 'unknown',
                templateName: assignment.template?.name || 'Unknown Template',
                submittedBy: assignment.member.user.name || assignment.member.user.email,
                submittedByEmail: assignment.member.user.email,
                member: {
                    id: assignment.member.id,
                    name: assignment.member.user.name,
                    email: assignment.member.user.email,
                    joinedAt: assignment.member.user.createdAt,
                    profileData: assignment.member.profileData
                },
                responses: transformedResponses,
                status: assignment.status,
                submittedAt: assignment.submittedAt,
                createdAt: assignment.createdAt,
                updatedAt: assignment.updatedAt,
                publicSlug: assignment.publicSlug,
                dueDate: assignment.dueDate,
                fields: fields, // Include field metadata for checking types
                history: assignment.submissions?.map(sub => {
                    const subResponses: Record<string, any> = {}
                    if (sub.responses && typeof sub.responses === 'object') {
                        Object.entries(sub.responses).forEach(([key, value]) => {
                            const label = fieldMap[key] || key
                            subResponses[label] = value
                        })
                    }
                    return {
                        id: sub.id,
                        submittedAt: sub.submittedAt || sub.createdAt,
                        responses: subResponses
                    }
                }) || []
            }

            return NextResponse.json(data)
        }

        // If not found as assignment, try finding as a submission
        const submission = await prisma.formSubmission.findUnique({
            where: {
                id: submissionId
            },
            include: {
                assignment: {
                    include: {
                        submissions: {
                            orderBy: { submittedAt: 'desc' },
                            select: {
                                id: true,
                                submittedAt: true,
                                createdAt: true,
                                responses: true
                            }
                        },
                        template: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                fields: true
                            }
                        },
                        member: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        createdAt: true
                                    }
                                },
                                workspace: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            )
        }

        // Check workspace permission via assignment -> member -> workspaceId
        if (submission.assignment.member.workspaceId !== id) {
            return NextResponse.json(
                { error: 'Submission not found in this workspace' },
                { status: 404 }
            )
        }

        // Transform submission data
        const fields = submission.assignment.template.fields as any[] || []
        const fieldMap = fields.reduce((acc: Record<string, string>, field: any) => {
            if (field.id && field.label) {
                acc[field.id] = field.label
            }
            return acc
        }, {})

        const transformedResponses: Record<string, any> = {}
        if (submission.responses) {
            Object.entries(submission.responses as Record<string, any>).forEach(([key, value]) => {
                const label = fieldMap[key] || key
                transformedResponses[label] = value
            })
        }

        const data = {
            id: submission.id,
            type: 'submission',
            templateId: submission.assignment.template?.id || 'unknown',
            templateName: submission.assignment.template?.name || 'Unknown Template',
            submittedBy: submission.assignment.member.user.name || submission.assignment.member.user.email,
            submittedByEmail: submission.assignment.member.user.email,
            member: {
                id: submission.assignment.member.id,
                name: submission.assignment.member.user.name,
                email: submission.assignment.member.user.email,
                joinedAt: submission.assignment.member.user.createdAt,
                profileData: submission.assignment.member.profileData
            },
            responses: transformedResponses,
            status: 'SUBMITTED', // Submissions are inherently submitted
            submittedAt: submission.submittedAt,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
            publicSlug: submission.assignment.publicSlug,
            dueDate: submission.assignment.dueDate,
            fields: fields, // Include field metadata for checking types
            history: submission.assignment.submissions?.map(sub => {
                const subResponses: Record<string, any> = {}
                if (sub.responses && typeof sub.responses === 'object') {
                    Object.entries(sub.responses).forEach(([key, value]) => {
                        const label = fieldMap[key] || key
                        subResponses[label] = value
                    })
                }
                return {
                    id: sub.id,
                    submittedAt: sub.submittedAt || sub.createdAt,
                    responses: subResponses
                }
            }) || []
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Error fetching submission:', error)
        return NextResponse.json(
            { error: 'Failed to fetch submission details' },
            { status: 500 }
        )
    }
}
