import { MOCK_ASSIGNMENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User } from 'lucide-react';

export default async function AssignmentsPage() {
    // TODO: Fetch assignments from database
    const assignments: any[] = [];

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                <p className="text-muted-foreground mt-1">
                    View and fill your assigned reports
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                    <Card key={assignment.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{assignment.title}</h3>
                                    <p className="text-xs text-gray-500">
                                        {assignment.templateVersion.template.name}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant={
                                    assignment.status === 'APPROVED' ? 'default' :
                                        assignment.status === 'SUBMITTED' ? 'secondary' :
                                            assignment.status === 'REJECTED' ? 'destructive' :
                                                'outline'
                                }
                            >
                                {assignment.status}
                            </Badge>
                        </div>

                        {assignment.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {assignment.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {assignment.assignedTo.name || assignment.assignedTo.email}
                            </div>
                            {assignment.dueDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <Link href={`/assignments/${assignment.id}/fill`}>
                            <Button className="w-full" variant={assignment.status === 'SUBMITTED' || assignment.status === 'APPROVED' ? 'outline' : 'default'}>
                                {assignment.status === 'SUBMITTED' || assignment.status === 'APPROVED' ? 'View' : 'Fill Report'}
                            </Button>
                        </Link>
                    </Card>
                ))}

                {assignments.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium">No assignments yet</h3>
                        <p className="text-gray-500">Assignments will appear here when created</p>
                    </div>
                )}
            </div>
        </div>
    );
}
