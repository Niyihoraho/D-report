import React from 'react'

export interface AttendanceData {
    workspaceName: string
    workspaceAddress?: string
    workspaceLogo?: string
    primaryColor?: string
    purpose: string
    members: Array<{
        name: string
        email: string
        phone: string
    }>
    generatedDate: string
    referenceNumber: string
    qrCodeUrl: string
}

export const AttendanceTemplate: React.FC<AttendanceData> = ({
    workspaceName,
    workspaceAddress,
    workspaceLogo,
    primaryColor = '#000',
    purpose,
    members,
    generatedDate,
    referenceNumber,
    qrCodeUrl
}) => {
    return (
        <div className="attendance-report">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {workspaceLogo && <img src={workspaceLogo} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />}
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', color: primaryColor }}>{workspaceName}</h1>
                        {workspaceAddress && <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{workspaceAddress}</p>}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Attendance Report</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Ref: {referenceNumber}</p>
                </div>
            </div>

            <div style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                <p><strong>Purpose/Event:</strong> {purpose}</p>
                <p><strong>Date Generated:</strong> {generatedDate}</p>
                <p><strong>Total Attendees:</strong> {members.length}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: primaryColor, color: '#fff' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Signature</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{index + 1}</td>
                            <td style={{ padding: '10px' }}>{member.name}</td>
                            <td style={{ padding: '10px' }}>{member.email}</td>
                            <td style={{ padding: '10px' }}>{member.phone}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'center' }}>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />}
                    <p style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>Scan to Verify</p>
                </div>
            </div>
        </div>
    )
}
