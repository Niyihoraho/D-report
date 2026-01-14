import React from 'react'

export interface ReceiptData {
    recipientName: string
    amount: number
    currency: string
    paymentMethod: string
    transactionId: string
    description: string
    items?: any
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

interface ReceiptTemplateProps {
    workspace: WorkspaceData
    report: ReportMetadata
    data: ReceiptData
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
    workspace,
    report,
    data
}) => {
    const primaryColor = workspace.primaryColor || '#000'

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {workspace.logoUrl && <img src={workspace.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />}
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', color: primaryColor }}>{workspace.name}</h1>
                        {workspace.address && <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px', whiteSpace: 'pre-line' }}>{workspace.address}</p>}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '32px', color: '#888' }}>RECEIPT</h2>
                    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>#{report.referenceNumber}</p>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Date: {new Date(report.generatedAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Info Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>Received From</h3>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{data.recipientName}</p>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <h3 style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>Payment Details</h3>
                    <p style={{ margin: '0 0 5px 0' }}>Method: <strong>{data.paymentMethod}</strong></p>
                    <p style={{ margin: 0 }}>Ref: <strong>{data.transactionId}</strong></p>
                </div>
            </div>

            {/* Amount Section */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Amount Paid</p>
                <h2 style={{ margin: '10px 0 0 0', fontSize: '36px', color: primaryColor }}>
                    {data.currency} {data.amount.toLocaleString()}
                </h2>
                <p style={{ margin: '10px 0 0 0', fontStyle: 'italic', fontSize: '14px' }}>{data.description}</p>
            </div>

            {/* Items Details if available */}
            {data.items && Array.isArray(data.items) && data.items.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '10px' }}>{item.name || item.description}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Footer */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Thank you for your payment!</p>
                    {workspace.motto && <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#999' }}>"{workspace.motto}"</p>}
                </div>
                <div>
                    {report.qrCodeDataURL && <img src={report.qrCodeDataURL} alt="Verify" style={{ width: '60px', height: '60px' }} />}
                </div>
            </div>

        </div>
    )
}
