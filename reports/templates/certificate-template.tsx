import React from 'react'

export interface CertificateData {
    recipientName: string
    programName: string
    completionDate: string
    description?: any
    signatory?: any
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

interface CertificateTemplateProps {
    workspace: WorkspaceData
    report: ReportMetadata
    data: CertificateData
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
    workspace,
    report,
    data
}) => {
    const primaryColor = workspace.primaryColor || '#1a365d'

    return (
        <div style={{ padding: '40px', border: `10px solid ${primaryColor}`, height: '100%', position: 'relative', fontFamily: "'Times New Roman', serif" }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                {workspace.logoUrl && <img src={workspace.logoUrl} alt="Logo" style={{ height: '80px', marginBottom: '20px' }} />}
                <h1 style={{ fontSize: '36px', color: primaryColor, margin: '0 0 10px 0', textTransform: 'uppercase' }}>{workspace.name}</h1>
                {workspace.address && <p style={{ margin: 0, color: '#666' }}>{workspace.address}</p>}
                {workspace.motto && <p style={{ fontStyle: 'italic', margin: '5px 0 0 0', color: '#888' }}>"{workspace.motto}"</p>}
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '48px', margin: 0, fontFamily: 'cursive', color: '#b8860b' }}>Certificate of Completion</h2>
            </div>

            {/* Body */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <p style={{ fontSize: '18px', margin: '0 0 20px 0' }}>This is to certify that</p>
                <h3 style={{ fontSize: '32px', margin: '0 0 20px 0', borderBottom: '1px solid #ccc', display: 'inline-block', paddingBottom: '5px', minWidth: '300px' }}>
                    {data.recipientName}
                </h3>
                <p style={{ fontSize: '18px', margin: '0 0 20px 0' }}>has successfully completed the program</p>
                <h3 style={{ fontSize: '28px', margin: '0 0 20px 0', color: primaryColor }}>
                    {data.programName}
                </h3>
                <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>
                    Completed on: {new Date(data.completionDate).toLocaleDateString()}
                </p>
                {data.description && <p style={{ fontSize: '14px', color: '#555', maxWidth: '600px', margin: '0 auto' }}>{data.description}</p>}
            </div>

            {/* Custom Fields */}
            {data.customFields && Object.keys(data.customFields).length > 0 && (
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    {Object.entries(data.customFields).map(([key, value]) => (
                        <div key={key} style={{ margin: '5px' }}>
                            <strong>{key}: </strong> {String(value)}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '200px', borderBottom: '1px solid #000', marginBottom: '10px' }}>
                        {/* Signature Area */}
                        {data.signatory && <div style={{ fontFamily: 'cursive', fontSize: '20px' }}>{data.signatory}</div>}
                    </div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Signature</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                    {workspace.stampUrl && <img src={workspace.stampUrl} alt="Stamp" style={{ width: '100px', opacity: 0.8 }} />}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px' }}>
                        {report.qrCodeDataURL && <img src={report.qrCodeDataURL} alt="Verify" style={{ width: '80px', height: '80px' }} />}
                    </div>
                    <p style={{ fontSize: '10px', margin: 0 }}>ID: {report.referenceNumber}</p>
                </div>
            </div>

        </div>
    )
}
