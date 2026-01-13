import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/public/forms/assignments/[assignmentSlug]/submit
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ assignmentSlug: string }> }
) {
    try {
        const { assignmentSlug } = await params
        const body = await request.json()
        const { responses, status } = body

        // Find the assignment
        const assignment = await prisma.formAssignment.findUnique({
            where: { publicSlug: assignmentSlug }
        })

        if (!assignment) {
            return NextResponse.json(
                { error: 'Form assignment not found' },
                { status: 404 }
            )
        }

        // Check if assignment is active
        if (!assignment.isActive) {
            return NextResponse.json(
                { error: 'This form assignment is no longer active' },
                { status: 403 }
            )
        }

        // Determine the status
        let newStatus = status || 'SUBMITTED'

        // If status is provided as IN_PROGRESS, keep it as such (for saving drafts)
        if (status === 'IN_PROGRESS') {
            newStatus = 'IN_PROGRESS'
        } else if (assignment.allowMultiple && newStatus === 'SUBMITTED') {
            // If multiple submissions are allowed, we don't mark the assignment as fully SUBMITTED/closed.
            // We keep it PENDING so the form remains accessible on reload.
            newStatus = 'PENDING'
        }

        // Update the assignment with responses
        const dataToUpdate: any = {
            responses: responses,
            status: newStatus,
            // Update submittedAt if this is a submission (even if we keep status PENDING for multiple)
            submittedAt: (status !== 'IN_PROGRESS') ? new Date() : assignment.submittedAt,
            updatedAt: new Date()
        }

        // If allowing multiple submissions, create a submission record and keep/reset status
        if (assignment.allowMultiple && status !== 'IN_PROGRESS') {
            await prisma.formSubmission.create({
                data: {
                    assignmentId: assignment.id,
                    responses: responses,
                    submittedAt: new Date()
                }
            })

            // Clear the responses on the assignment so the form appears empty on reload
            // The actual submissions are stored in the FormSubmission table
            dataToUpdate.responses = {}
            // For multiple submissions, we don't 'complete' the assignment, 
            // but we might want to update the latest response on the parent for quick access.
            // We can keep the status as 'PENDING' or 'IN_PROGRESS' to allow re-entry, 
            // or 'SUBMITTED' but the UI handles it.
            // Let's decide: The UI uses status to show "Success" screen. 
            // If we want "Submit Another", the UI should respect allowMultiple flag.
            // We'll update the parent with the LATEST response.
        }

        const updatedAssignment = await prisma.formAssignment.update({
            where: { publicSlug: assignmentSlug },
            data: dataToUpdate,
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                member: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            assignment: updatedAssignment,
            message: (newStatus === 'SUBMITTED' || (assignment.allowMultiple && status !== 'IN_PROGRESS'))
                ? 'Form submitted successfully!'
                : 'Progress saved successfully!'
        })
    } catch (error) {
        console.error('Error submitting form assignment:', error)
        return NextResponse.json(
            { error: 'Failed to submit form' },
            { status: 500 }
        )
    }
}
