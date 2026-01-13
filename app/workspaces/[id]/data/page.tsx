"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Eye, FileText, Calendar, User, History } from "lucide-react"
import { toast } from "sonner"
import { formatFieldValue } from "@/lib/profile-utils"
import { motion } from "framer-motion"

interface SubmissionData {
    id: string
    assignmentId?: string
    type: 'assignment' | 'submission'
    templateId: string
    templateName: string
    submittedBy: string
    submittedByEmail: string
    responses: any
    status: string
    submittedAt?: string
    createdAt: string
    publicSlug: string
}

export default function DataPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.id as string

    const [data, setData] = useState<SubmissionData[]>([])
    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")

    useEffect(() => {
        if (workspaceId) {
            fetchData()
        }
    }, [workspaceId, selectedTemplate, selectedStatus])

    const fetchData = async () => {
        try {
            const params = new URLSearchParams()
            if (selectedTemplate !== 'all') params.append('templateId', selectedTemplate)
            if (selectedStatus !== 'all') params.append('status', selectedStatus)

            const response = await fetch(`/api/workspaces/${workspaceId}/data?${params}`)
            if (!response.ok) throw new Error('Failed to fetch data')

            const result = await response.json()
            setData(result.data)
            setTemplates(result.templates)
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    // Filter first
    const filteredRaw = data.filter(item => {
        const matchesSearch =
            item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.submittedByEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.templateName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    // Group by assignmentId
    const groupedData = filteredRaw.reduce((acc: any[], item) => {
        // If it's a submission for an assignment, group it
        const groupId = item.assignmentId || item.id
        const existingGroup = acc.find(g => g.id === groupId)

        if (existingGroup) {
            existingGroup.items.push(item)
            // Keep the latest submission as the main display
            if (new Date(item.submittedAt || item.createdAt) > new Date(existingGroup.primary.submittedAt || existingGroup.primary.createdAt)) {
                existingGroup.primary = item
            }
        } else {
            acc.push({
                id: groupId,
                primary: item,
                items: [item]
            })
        }
        return acc
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#11142D] to-[#6C5DD3] dark:from-white dark:to-[#A093E5]">
                        Data Collection
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        All submissions from templates and forms
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-full">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, or template..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Template Filter */}
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Templates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Templates</SelectItem>
                                {templates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Submissions Count */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {groupedData.length} {groupedData.length === 1 ? 'Entry' : 'Entries'}
                </h2>
            </div>

            {/* List View */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3] mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Loading data...</p>
                </div>
            ) : groupedData.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No submissions found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {groupedData.map((group, index) => {
                        const submission = group.primary
                        const count = group.items.length
                        return (
                            <motion.div
                                key={group.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/workspaces/${workspaceId}/data/${submission.id}`)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Left: Member Info */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#5b4eb3] flex items-center justify-center flex-shrink-0">
                                                    <User className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {submission.submittedBy}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                            {submission.submittedByEmail}
                                                        </p>
                                                        {count > 1 && (
                                                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                {count} Submissions
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle: Template & Date */}
                                            <div className="hidden md:flex flex-col gap-1 flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700 dark:text-gray-300 truncate">
                                                        {submission.templateName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {submission.submittedAt
                                                            ? new Date(submission.submittedAt).toLocaleDateString()
                                                            : new Date(submission.createdAt).toLocaleDateString()
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right: Status & Action */}
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusColor(submission.status)}>
                                                    {submission.status}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(`/workspaces/${workspaceId}/data/${submission.id}`)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile: Template & Date */}
                                        <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">{submission.templateName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {submission.submittedAt
                                                        ? new Date(submission.submittedAt).toLocaleDateString()
                                                        : new Date(submission.createdAt).toLocaleDateString()
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}
