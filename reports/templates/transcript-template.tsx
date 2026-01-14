import React from 'react'

export interface TranscriptData {
    student: {
        fullName: string
        regNumber: string
        program: string
        intakeYear: string
    }
    results: Array<{
        code?: string
        courseCode?: string
        title?: string
        courseName?: string
        credits?: number
        credit?: number
        grade: string
        points?: number
        gradePoint?: number
    }>
    gpa?: number
    totalCredits?: number
    customFields?: Record<string, any>
}

interface WorkspaceData {
    name: string
    address?: string
    logoUrl?: string
    stampUrl?: string
    motto?: string
    primaryColor?: string
}

interface ReportMetadata {
    referenceNumber: string
    generatedAt: Date
    qrCodeDataURL: string
}

interface TranscriptTemplateProps {
    workspace: WorkspaceData
    report: ReportMetadata
    data: TranscriptData
}

export const TranscriptTemplate: React.FC<TranscriptTemplateProps> = ({
    workspace,
    report,
    data
}) => {
    const primaryColor = workspace.primaryColor || '#000'

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>

            {/* Header */}
            <div style={{ borderBottom: `4px double ${primaryColor}`, paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>
                    {workspace.logoUrl && <img src={workspace.logoUrl} alt="Logo" style={{ height: '100px' }} />}
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{workspace.name}</h1>
                        {workspace.address && <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{workspace.address}</p>}
                    </div>
                </div>
                <h2 style={{ margin: '20px 0 0 0', fontSize: '24px', textTransform: 'uppercase' }}>Academic Transcript</h2>
            </div>

            {/* Student Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '4px' }}>
                <div>
                    <p style={{ margin: '5px 0' }}><strong>Name:</strong> {data.student.fullName}</p>
                    <p style={{ margin: '5px 0' }}><strong>Reg. Number:</strong> {data.student.regNumber}</p>
                </div>
                <div>
                    <p style={{ margin: '5px 0' }}><strong>Program:</strong> {data.student.program}</p>
                    <p style={{ margin: '5px 0' }}><strong>Intake:</strong> {data.student.intakeYear}</p>
                </div>
            </div>

            {/* Results Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '12px' }}>
                <thead>
                    <tr style={{ backgroundColor: primaryColor, color: '#fff' }}>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #000' }}>Code</th>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #000' }}>Course Title</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #000' }}>Credits</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #000' }}>Grade</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #000' }}>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {data.results && data.results.length > 0 ? (
                        data.results.map((result, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{result.code || result.courseCode || '-'}</td>
                                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{result.title || result.courseName || 'Unknown Course'}</td>
                                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{result.credits ?? result.credit ?? 0}</td>
                                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>
                                    <strong>{result.grade}</strong>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{result.points ?? result.gradePoint ?? 0}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc' }}>No results recorded.</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                        <td colSpan={2} style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>TOTAL / GPA</td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{data.totalCredits ?? '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}></td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{data.gpa ?? '-'}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer / Verification */}
            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '12px' }}>
                <div>
                    <p>Date Generated: {new Date().toLocaleDateString()}</p>
                    <p>Reference: {report.referenceNumber}</p>
                    <p style={{ marginTop: '20px', fontStyle: 'italic', fontSize: '10px' }}>This transcript is valid without a signature if verified via QR code.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    {report.qrCodeDataURL && <img src={report.qrCodeDataURL} alt="Verify" style={{ width: '80px', height: '80px' }} />}
                    <p style={{ margin: '5px 0' }}>Scan to Verify</p>
                </div>
            </div>

        </div>
    )
}
