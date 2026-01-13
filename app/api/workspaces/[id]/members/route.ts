import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePublicSlug } from '@/lib/profile-utils'

// GET /api/workspaces/[id]/members - List members
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const members = await prisma.userWorkspaceRole.findMany({
            where: { workspaceId: id },
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
                },
                formAssignments: {
                    include: {
                        template: {
                            select: {
                                id: true,
                                name: true,
                                description: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(members)
    } catch (error) {
        console.error('Error fetching members:', error)
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces/[id]/members - Register new member
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json()

        let userId = body.userId
        let userName = ''

        // For public registrations without userId, create an anonymous user
        if (!userId && body.profileData) {
            // Extract email and name from profileData
            const profileData = body.profileData

            // Try to get email from profileData.email or search for @ symbol
            const email = profileData.email || Object.values(profileData).find((value: any) =>
                typeof value === 'string' && value.includes('@')
            ) as string | undefined

            // Try to get name from profileData.name or first value
            userName = profileData.name || Object.values(profileData)[0] as string || 'Anonymous User'

            // Check if user already exists
            const emailToUse = email || `anonymous-${Date.now()}@temp.local`
            let user = await prisma.user.findUnique({
                where: { email: emailToUse }
            })

            if (!user) {
                // Create new user if not found
                user = await prisma.user.create({
                    data: {
                        email: emailToUse,
                        name: userName,
                        password: `temp-${Date.now()}` // Temporary password for anonymous users
                    }
                })
            }
            userId = user.id
        } else if (userId) {
            // Get user name for existing user
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true }
            })
            userName = user?.name || 'User'
        }

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required or profile data must be provided' },
                { status: 400 }
            )
        }

        // Check if user already exists in workspace
        const existing = await prisma.userWorkspaceRole.findUnique({
            where: {
                userId_workspaceId: {
                    userId: userId,
                    workspaceId: id
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'User already exists in this workspace' },
                { status: 409 }
            )
        }

        // Generate a public slug for the new member
        const publicSlug = generatePublicSlug(userName, userId)

        const member = await prisma.userWorkspaceRole.create({
            data: {
                userId: userId,
                workspaceId: id,
                unitId: body.unitId || null,
                role: body.role || 'MEMBER',
                profileData: body.profileData || null,
                status: body.status || 'PENDING',
                publicSlug: publicSlug,
                isPublicProfile: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(member, { status: 201 })
    } catch (error: any) {
        console.error('Error creating member:', error)
        // Ensure we always return a valid JSON error object
        const errorMessage = error instanceof Error ? error.message : 'Failed to create member'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
