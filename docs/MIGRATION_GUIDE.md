# Migration Guide: Word Templates to HTML-to-PDF Reports

## Overview

The report generation system has been upgraded from Word templates (docxtemplater) to HTML-to-PDF generation using Puppeteer. This provides better control, flexibility, and professional results.

## What Changed

### Before (Old System)
- Upload Word (.docx) templates with `{{placeholders}}`
- System extracts placeholders and creates forms
- Generated documents as Word files
- Limited styling control
- Formatting issues with complex templates

### After (New System)
- Select from predefined report types (Transcript, Certificate, Receipt)
- Professional PDF generation with pixel-perfect layouts
- QR code verification on every document
- Workspace branding (logos, stamps, colors)
- Consistent, high-quality output

## New Features

### 1. Report Types

**Transcript**
- Academic records with student information
- Course results table with grades and credits
- GPA calculation support
- Professional academic styling

**Certificate**
- Completion certificates with decorative borders
- Recipient name prominently displayed
- Program details and completion date
- Optional signatory section

**Receipt**
- Payment confirmation documents
- Itemized list support
- Transaction ID tracking
- Payment method and amount display

### 2. Verification System

Every generated report includes:
- **Unique Reference Number**: Format `XX-YYYY-XXXXXX` (e.g., `TR-2025-A3F9K2`)
- **QR Code**: Scan to verify authenticity
- **Verification Page**: Public URL at `/verify/[referenceNumber]`

### 3. Workspace Branding

Configure your organization's branding in workspace settings:
- **Logo**: Appears in report header
- **Stamp**: Appears in report footer
- **Address**: Organization address
- **Motto**: Organization motto or tagline
- **Primary Color**: Brand color for accents

## How to Use

### Step 1: Configure Workspace Branding (Optional)

1. Go to Workspace Settings
2. Upload your organization logo
3. Upload official stamp (if applicable)
4. Add address and motto
5. Set primary brand color

### Step 2: Generate Reports

1. Navigate to your workspace members page
2. Click "Generate Reports" button
3. Select report type:
   - **Transcript**: For academic records
   - **Certificate**: For completion certificates
   - **Receipt**: For payment confirmations
4. Select one or more members
5. Click "Generate"
6. Download PDF (single) or ZIP (multiple)

### Step 3: Verify Reports

Recipients can verify report authenticity:
1. Scan QR code on the report
2. Or visit `/verify/[reference-number]`
3. View report details and confirmation

## Data Requirements

### For Transcripts

Member profile data should include:
```json
{
  "regNumber": "2024/001",
  "program": "Computer Science",
  "intakeYear": "2024",
  "results": [
    {
      "course": "Mathematics",
      "marks": 85,
      "grade": "A",
      "credits": 3
    }
  ],
  "gpa": 3.8,
  "totalCredits": 120
}
```

### For Certificates

Member profile data should include:
```json
{
  "programName": "Web Development Bootcamp",
  "completionDate": "2025-01-15",
  "description": "Successfully completed 12-week intensive program",
  "signatory": {
    "name": "Dr. John Doe",
    "title": "Program Director",
    "signature": "https://example.com/signature.png"
  }
}
```

### For Receipts

Member profile data should include:
```json
{
  "amount": 50000,
  "currency": "RWF",
  "paymentMethod": "Mobile Money",
  "transactionId": "MTN-2025-123456",
  "description": "Annual membership fee",
  "items": [
    {
      "description": "Membership Fee",
      "quantity": 1,
      "unitPrice": 50000,
      "total": 50000
    }
  ]
}
```

## Migrating Existing Templates

### Option 1: Use Standard Templates (Recommended)

The new system provides professional templates out of the box. Simply:
1. Map your existing data fields to the new format
2. Update member profile data structure
3. Start generating reports

### Option 2: Custom Templates (Advanced)

For custom report types:
1. Create a new template component in `/reports/templates/`
2. Extend the `BaseTemplate` component
3. Add your custom layout and styling
4. Update the API route to support your new type

Example:
```tsx
// reports/templates/custom-template.tsx
import { BaseTemplate } from './base-template'

export function CustomTemplate({ workspace, report, data }) {
  return (
    <BaseTemplate workspace={workspace} report={report} title="Custom Report">
      {/* Your custom content here */}
    </BaseTemplate>
  )
}
```

## Troubleshooting

### Issue: Reports not generating

**Solution**: Check that:
- Members have required profile data
- Workspace branding URLs are accessible
- Puppeteer is installed correctly

### Issue: QR codes not appearing

**Solution**: Ensure `NEXT_PUBLIC_URL` environment variable is set correctly

### Issue: Missing data in reports

**Solution**: Verify member profile data includes all required fields for the selected report type

## Technical Details

### Database Changes

New models added:
- `Report`: Tracks all generated reports
- `ReportType` enum: TRANSCRIPT, CERTIFICATE, RECEIPT, MEMBERSHIP_CARD, CUSTOM

New workspace fields:
- `logoUrl`, `stampUrl`, `address`, `motto`, `primaryColor`

### Dependencies

Added:
- `puppeteer`: PDF generation
- `qrcode`: QR code generation

Removed:
- `docxtemplater`: Word template processing
- `pizzip`: ZIP handling for Word files
- `mammoth`: Word to HTML conversion
- `docx-preview`: Word preview

### API Endpoints

**Generate Reports**
```
POST /api/workspaces/[id]/reports/generate
Body: { reportType, memberIds, templateData }
Response: PDF file or ZIP archive
```

**Verify Report**
```
GET /verify/[referenceNumber]
Response: HTML verification page
```

## Best Practices

1. **Keep member data updated**: Ensure profile data is complete before generating reports
2. **Use consistent branding**: Set up workspace branding once for all reports
3. **Test with sample data**: Generate test reports before bulk generation
4. **Store reference numbers**: Keep track of generated reports for verification
5. **Regular backups**: Database contains all report metadata

## Support

For issues or questions:
1. Check this migration guide
2. Review the implementation plan
3. Contact system administrator

---

**Migration completed**: All old Word template functionality has been removed and replaced with the new HTML-to-PDF system.
