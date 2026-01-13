import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const { id: workspaceId, memberId } = params

        const member = await prisma.userWorkspaceRole.findUnique({
            where: { id: memberId },
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
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        primaryColor: true
                    }
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        })

        if (!member || member.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(member)
    } catch (error) {
        console.error('Error fetching member profile:', error)
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const { id: workspaceId, memberId } = params
        const body = await request.json()

        // Verify member exists and belongs to workspace
        const existingMember = await prisma.userWorkspaceRole.findUnique({
            where: { id: memberId }
        })

        if (!existingMember || existingMember.workspaceId !== workspaceId) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            )
        }

        // Update profile data
        const updatedMember = await prisma.userWorkspaceRole.update({
            where: { id: memberId },
            data: {
                profileData: body.profileData || existingMember.profileData,
                isPublicProfile: body.isPublicProfile !== undefined
                    ? body.isPublicProfile
                    : existingMember.isPublicProfile,
                status: body.status || existingMember.status,
                role: body.role || existingMember.role,
                unitId: body.unitId !== undefined ? body.unitId : existingMember.unitId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        })

        return NextResponse.json(updatedMember)
    } catch (error) {
        console.error('Error updating member profile:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
