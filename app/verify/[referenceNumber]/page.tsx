import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CheckCircle, XCircle, FileText, Building, User, Calendar } from 'lucide-react'

type VerifyPageProps = {
    params: Promise<{ referenceNumber: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { referenceNumber } = await params

    // Fetch report with related data
    const report = await prisma.report.findUnique({
        where: { referenceNumber },
        include: {
            workspace: {
                select: {
                    name: true,
                    logoUrl: true,
                    address: true
                }
            },
            member: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            generatedByUser: {
                select: {
                    name: true
                }
            }
        }
    })

    if (!report) {
        notFound()
    }

    const isValid = report.isVerified

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Report Verification</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Verify the authenticity of this document
                    </p>
                </div>

                {/* Verification Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Status Banner */}
                    <div
                        className={`p-6 ${isValid
                                ? 'bg-green-50 dark:bg-green-900/20 border-b-4 border-green-500'
                                : 'bg-red-50 dark:bg-red-900/20 border-b-4 border-red-500'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {isValid ? (
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-600" />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {isValid ? '✓ Authentic Document' : '✗ Invalid Document'}
                                </h2>
                                <p className="text-sm mt-1">
                                    {isValid
                                        ? 'This document has been verified as authentic'
                                        : 'This document could not be verified'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Report Details */}
                    <div className="p-6 space-y-6">
                        {/* Reference Number */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                Reference Number
                            </h3>
                            <p className="text-2xl font-mono font-bold">{report.referenceNumber}</p>
                        </div>

                        {/* Report Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Report Type */}
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Report Type
                                    </h3>
                                    <p className="text-lg font-medium capitalize">
                                        {report.type.toLowerCase().replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="flex items-start gap-3">
                                <Building className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Organization
                                    </h3>
                                    <p className="text-lg font-medium">{report.workspace.name}</p>
                                    {report.workspace.address && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {report.workspace.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Issued To */}
                            {report.member && (
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                            Issued To
                                        </h3>
                                        <p className="text-lg font-medium">{report.member.user.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {report.member.user.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Generation Date */}
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Generated On
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(report.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Organization Logo */}
                        {report.workspace.logoUrl && (
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <img
                                    src={report.workspace.logoUrl}
                                    alt={`${report.workspace.name} logo`}
                                    className="h-16 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This verification page confirms the authenticity of the document.
                            <br />
                            For any questions, please contact the issuing organization.
                        </p>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        🔒 This verification is secured and cannot be tampered with.
                        <br />
                        Each document has a unique reference number that can only be verified once.
                    </p>
                </div>
            </div>
        </div>
    )
}
