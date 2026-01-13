"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { StatusBadge, MemberStatus } from "./status-badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, Eye, FileText } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { FormField } from "@/components/form-builder/types"

export interface Member {
    id: string
    userId: string
    workspaceId: string
    role: string
    status: string
    createdAt: string
    updatedAt: string
    profileData: Record<string, any> | null
    user: {
        id: string
        name: string | null
        email: string
    }
    unit?: {
        id: string
        name: string
        type: string
    } | null
    formAssignments?: {
        id: string
        status: string
        allowMultiple: boolean
        dueDate: string | null
        submittedAt: string | null
        createdAt: string
        template: {
            id: string
            name: string
            description: string | null
        }
    }[]
}

interface MemberTableProps {
    members: Member[]
    isLoading?: boolean
    workspaceId: string
    onViewDetails?: (member: Member) => void
    onEdit?: (member: Member) => void
    onDelete?: (member: Member) => void
    onAssignForm?: (member: Member) => void
}

export function MemberTable({ members, isLoading, workspaceId, onViewDetails, onEdit, onDelete, onAssignForm }: MemberTableProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading data...</div>
    }

    if (members.length === 0) {
        return <div className="p-8 text-center text-gray-500">No data found</div>
    }

    return (
        <div className="glass-card rounded-[24px] overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                    <TableRow>
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead>Regional Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Assigned Forms</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => {
                        const name = member.user.name || member.profileData?.name || 'Unknown'
                        const regionalName = member.profileData?.regionalName || '-'
                        const email = member.user.email || member.profileData?.email || '-'
                        const phone = member.profileData?.phone || '-'

                        return (
                            <TableRow key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} />
                                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[#11142D] dark:text-white font-semibold">
                                            {name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500 dark:text-gray-400">
                                    {regionalName}
                                </TableCell>
                                <TableCell className="text-gray-500 dark:text-gray-400">
                                    {email}
                                </TableCell>
                                <TableCell className="text-gray-500 dark:text-gray-400">
                                    {phone}
                                </TableCell>
                                <TableCell>
                                    {member.formAssignments && member.formAssignments.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            {/* Show first assignment */}
                                            {(() => {
                                                const assignment = member.formAssignments[0]
                                                return (
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 pr-3 pl-1 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${assignment.status === 'SUBMITTED' || assignment.status === 'COMPLETED'
                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                            : assignment.status === 'IN_PROGRESS'
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                            }`}>
                                                            {assignment.status === 'SUBMITTED' || assignment.status === 'COMPLETED' ? 'Done' :
                                                                assignment.status === 'IN_PROGRESS' ? 'WIP' : 'Pending'}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                                            {assignment.template.name}
                                                        </span>
                                                    </div>
                                                )
                                            })()}

                                            {/* Show "+X" badge for remaining */}
                                            {member.formAssignments.length > 1 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 cursor-help hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                                +{member.formAssignments.length - 1}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="p-0 border-none bg-transparent shadow-xl">
                                                            <div className="bg-white dark:bg-[#1F2128] border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex flex-col gap-2 min-w-[200px]">
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">All Assignments</p>
                                                                {member.formAssignments.map((assignment) => (
                                                                    <div key={assignment.id} className="flex items-center justify-between gap-3 p-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                            {assignment.template.name}
                                                                        </span>
                                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${assignment.status === 'SUBMITTED' || assignment.status === 'COMPLETED'
                                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                                            : assignment.status === 'IN_PROGRESS'
                                                                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                                                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                            }`}>
                                                                            {assignment.status === 'SUBMITTED' || assignment.status === 'COMPLETED' ? 'Done' :
                                                                                assignment.status === 'IN_PROGRESS' ? 'WIP' : 'Pending'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {member.role === 'ADMIN' || member.role === 'OWNER' ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                            {member.role}
                                        </span>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {member.formAssignments && member.formAssignments.length > 0 ? (
                                                (() => {
                                                    const hasMultiple = member.formAssignments.some(a => a.allowMultiple)
                                                    return (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border w-fit ${hasMultiple
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                                            : 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                                                            }`}>
                                                            {hasMultiple ? 'Multiple Use' : 'One Time'}
                                                        </span>
                                                    )
                                                })()
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No Access</span>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={member.status as MemberStatus} />
                                </TableCell>
                                <TableCell className="text-gray-500 dark:text-gray-400">
                                    {new Date(member.createdAt).toLocaleDateString()}
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="glass-card">
                                            <DropdownMenuItem onClick={() => onViewDetails?.(member)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onAssignForm?.(member)}>
                                                <FileText className="mr-2 h-4 w-4" /> Assign Form
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit?.(member)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Data
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => onDelete?.(member)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
