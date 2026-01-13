import fs from 'fs'
import path from 'path'
import { ReportData, TemplateGenerator } from '../../types'

/**
 * Generate HTML report from submission data using GBUR Ministry Template
 * This is the original GBUR-specific template for ministry reports
 */
export const gburThrivingTemplate: TemplateGenerator = async (data: ReportData) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const submittedDate = data.submittedAt
        ? new Date(data.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'N/A'

    // --- DATA MAPPING LOGIC ---
    // 1. Title/Header Mapping
    const reportTitle = "THRIVING TOGETHER IN GBUR STUDENT MINISTRY 2026";

    // 2. Extra Member Data Extraction
    let memberPhone = 'N/A';
    let memberRegion = 'N/A';

    // Try to get from responses first, then profile data
    if (data.responses && data.responses['Phone']) memberPhone = data.responses['Phone'];

    if (data.member?.profileData) {
        const pd = data.member.profileData;
        const findKey = (query: string[]) => Object.keys(pd).find(k => query.some(q => k.toLowerCase().includes(q)));

        // Phone
        if (memberPhone === 'N/A') {
            const phoneKey = findKey(['phone', 'mobile', 'cel', 'tel']);
            if (phoneKey) memberPhone = pd[phoneKey];
        }

        // Region
        const regionKey = findKey(['region', 'staff region', 'location', 'province']);
        if (regionKey) memberRegion = pd[regionKey];
    }

    // 3. Content Injection
    // 3. Content Injection
    // Collect all activities
    let allActivities: any[] = [];

    // If history is provided, we assume it contains the FULL list of activities (including the current one)
    if (data.history && Array.isArray(data.history) && data.history.length > 0) {
        allActivities = data.history.map((h: any) => ({
            responses: h.responses,
            date: h.submittedAt || 'N/A'
        }));
    } else if (data.responses) {
        // Fallback: If no history, just use the current submission
        allActivities.push({
            responses: data.responses,
            date: data.submittedAt || new Date().toISOString()
        });
    }

    // Sort by date (oldest first)
    allActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let pagesHTML = '';

    allActivities.forEach((activity, index) => {
        let contentHTML = '';
        const responses = activity.responses;
        let activityHeader = `ACTIVITY REPORT ${index + 1}`; // Fallback with index

        if (responses && Object.keys(responses).length > 0) {
            // Helper to get label from key (which might be an ID)
            const getLabel = (key: string) => {
                if (data.fields && Array.isArray(data.fields)) {
                    const field = data.fields.find((f: any) => f.id === key);
                    if (field) return field.label;
                }
                return key;
            };

            // Find specific header (using resolved labels)
            const headerEntry = Object.entries(responses).find(([key]) => {
                const label = getLabel(key).toLowerCase();
                return label === 'activity' || label === 'title' || label.includes('activity name') || label === 'name';
            });

            if (headerEntry) {
                activityHeader = formatValue(headerEntry[1]);
            }

            // Prepare entries with resolved labels for sorting/filtering
            let entries = Object.entries(responses).map(([key, value]) => ({
                key, // Original key (ID)
                label: getLabel(key), // Resolved label
                value
            }));

            // Find 'where' and 'when' using resolved labels
            const whereEntry = entries.find(e => e.label.toLowerCase() === 'where' || e.label.toLowerCase().includes('location'));
            const whenEntry = entries.find(e => e.label.toLowerCase() === 'when' || e.label.toLowerCase() === 'date');

            // Filter out where/when from main list
            entries = entries.filter(e => e !== whereEntry && e !== whenEntry);

            const sortedEntries: any[] = [];
            if (whereEntry) sortedEntries.push(whereEntry);
            if (whenEntry) sortedEntries.push(whenEntry);
            sortedEntries.push(...entries);

            // Render
            sortedEntries.forEach((entry) => {
                const { label: displayKey, value } = entry;
                const formattedValue = formatValue(value);
                const lowerKey = displayKey.toLowerCase();

                // Rename specific keys if needed
                let finalDisplayKey = displayKey;
                if (displayKey === 'When') finalDisplayKey = 'Date';
                if (lowerKey === 'where') finalDisplayKey = 'Where it take place';
                if (lowerKey.includes('new file field')) finalDisplayKey = 'Image';

                if (lowerKey.includes('activity') || lowerKey.includes('title') || lowerKey.includes('event')) {
                    contentHTML += `
                        <div class="field-row" style="background-color: #f0fdfa;">
                            <span class="field-label" style="color: #0e7490;">${escapeHtml(finalDisplayKey)}:</span>
                            <span class="field-value" style="font-weight: bold; color: #0e7490;">${formattedValue}</span>
                        </div>`
                } else if (lowerKey.includes('impact') || lowerKey.includes('comment')) {
                    contentHTML += `
                        <div class="impact-box">
                            <span class="impact-label">${escapeHtml(finalDisplayKey)}</span>
                            <div class="impact-content">${formattedValue}</div>
                        </div>`
                } else if (formattedValue.includes('submitted-image-container')) {
                    contentHTML += `
                        <div class="image-field-row">
                            <span class="field-label">${escapeHtml(finalDisplayKey)}:</span>
                            <div class="field-value">${formattedValue}</div>
                        </div>`
                } else {
                    contentHTML += `
                        <div class="field-row">
                            <span class="field-label">${escapeHtml(finalDisplayKey)}:</span>
                            <span class="field-value">${formattedValue}</span>
                        </div>`
                }
            })
        } else {
            contentHTML = '<p>No data submitted for this activity.</p>'
        }

        // Add page for this activity
        pagesHTML += `
            <div class="content-page">
                <!-- Header -->
                <div class="overview-header">${activityHeader}</div>
                
                <div style="margin-bottom: 15px; font-style: italic; color: #666; font-size: 0.9em;">
                    Submitted on: ${new Date(activity.date).toLocaleDateString()}
                </div>

                ${contentHTML}

                ${index === allActivities.length - 1 ? `
                <div class="footer">
                    Generated on ${currentDate} | THRIVING TOGETHER IN GBUR STUDENT MINISTRY
                </div>` : ''}
            </div>
            </div>
        `;
    });

    // If no activities found at all (shouldn't happen if submissions exist)
    if (!pagesHTML) {
        pagesHTML = `<div class="content-page"><p>No activities found.</p></div>`;
    }

    // Load logo image
    let logoBase64 = ''
    try {
        const logoPath = path.join(process.cwd(), 'public', 'ifeslogo.png')
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath)
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
        }
    } catch (e) {
        console.error('Failed to load logo image', e)
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.templateName)}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 0;
            background: #FFF7ED;
            color: #000000ff;
        }

        /* --- COVER PAGE --- */
        .cover-page {
            width: 210mm;
            height: 297mm;
            position: relative;
            padding: 25mm;
            display: flex;
            flex-direction: column;
            page-break-after: always;
        }

        .logo-box {
            position: absolute;
            top: 20mm;
            right: 20mm;
            width: 150px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }

        .report-title {
            margin-top: 60mm;
            font-family: 'Arial', sans-serif;
            font-size: 24pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #000000ff;
            line-height: 1.3;
            border-left: 8px solid #f19008ff;
            padding-left: 20px;
            margin-bottom: 20px;
        }

        .intro-text {
            color: #0e7490;
            font-size: 14pt;
            line-height: 1.5;
            margin-bottom: 10mm;
            font-style: italic;
        }

        .cover-overview {
            margin-bottom: 20mm;
        }
        
        .strategic-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .strategic-list li {
            font-size: 12pt;
            padding-left: 20px;
            position: relative;
            margin-bottom: 8px;
            color: #0e7490;
            font-weight: 500;
        }

        .strategic-list li::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #0e7490;
            font-weight: bold;
        }

        .member-grid-container {
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid #cbd5e1; /* Thinner, lighter line */
        }

        .member-grid {
            display: grid;
            grid-template-columns: auto 1fr; /* Auto width for labels to keep them close to values */
            column-gap: 15px;
            row-gap: 8px; /* Reduced vertical space */
            font-size: 11pt;
            align-items: baseline;
            background-color: rgba(255, 255, 255, 0.5); /* Subtle background */
            padding: 15px;
            border-radius: 8px;
        }

        .member-label {
            font-weight: bold;
            color: #0781a3;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.05em;
            text-align: right; /* Keep right align for the "spine" look, or change to left? Right is usually cleaner for forms */
            white-space: nowrap; /* Prevent wrapping */
        }

        .member-value {
            color: #000000ff;
            font-weight: 500;
        }

        /* --- CONTENT PAGES --- */
        .content-page {
            width: 210mm;
            height: 297mm;
            padding: 25mm;
            padding-top: 15mm;
            position: relative;
            overflow: hidden; /* Ensure content doesn't spill over */
            page-break-after: always; /* Force new page after each activity */
        }

        .overview-header {
            font-family: 'Arial', sans-serif;
            font-size: 14pt;
            font-weight: 700;
            color: white; 
            background-color: #0e7490;
            text-transform: uppercase;
            margin-bottom: 20px;
            padding: 10px 15px;
            border-radius: 4px;
            display: inline-block;
            width: 100%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .activity-section {
            margin-top: 30px;
            margin-bottom: 15px;
            break-inside: avoid;
        }

        .field-row {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: flex-start;
        }
        
        .field-row:nth-child(even) {
            background-color: #f8fafc;
        }

        .field-label {
            font-weight: bold;
            width: 200px;
            flex-shrink: 0;
            color: #000000ff;
            margin-top: 2px;
        }

        .field-value {
            flex-grow: 1;
            color: #000000ff;
        }
        
        .image-field-row {
            padding: 15px 10px;
            border-bottom: 1px solid #e2e8f0;
            display: block;
        }
        
        .image-field-row .field-label {
            display: block;
            width: 100%;
            margin-bottom: 10px;
            font-size: 1.1em;
            color: #000000ff;
        }
        
        .submitted-image-container {
            width: 100%;
            display: flex;
            justify-content: center;
        }
        
        .submitted-image {
            width: 100%;
            max-height: 600px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            object-fit: contain;
            display: block;
        }

        .impact-box {
            background: #f0f9ff;
            border-left: 4px solid #f19008ff;
            padding: 15px;
            margin: 15px 0;
            break-inside: avoid;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .impact-label {
            display: block;
            font-weight: bold;
            color: #0c0f10ff;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 0.9em;
        }

        .impact-content {
            font-style: italic;
            color: #213e67ff;
        }

        .footer {
            margin-top: 50px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            font-size: 9pt;
            color: #ff8402ff;
            text-align: center;
        }

    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <!-- Logo -->
        <div class="logo-box">
             ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="IFES Logo" />` : 'IFES <br> LOGO'}
        </div>

        <!-- Title -->
        <div class="report-title">
            ${reportTitle}
        </div>

        <!-- Intro Text -->
        <div class="intro-text">
            This action plan will be implemented through GBUR staff, in partnership with graduates and other resource people to disciple students and reaching the campus community with the gospel of Jesus Christ.
        </div>

        <!-- Strategic Overview -->
        <div class="cover-overview">
            <p style="font-weight: bold; color: #0e7490; margin-bottom: 10px; font-family: 'Arial', sans-serif;">THE FOUR STRATEGIC PRIORITIES:</p>
            <ul class="strategic-list">
                <li>Thriving in Witness (Evangelism)</li>
                <li>Thriving in Whole-life Commitment (Discipleship & Leadership)</li>
                <li>Thriving on New Ground (Pioneering GBUs)</li>
                <li>Thriving into the Future</li>
            </ul>
        </div>

        <!-- Member Info Grid -->
        <div class="member-grid-container">
            <div class="member-grid">
                <div class="member-label">GBU Name/Staff Report</div>
                <div class="member-value">${escapeHtml(data.responses['GBU Name'] || data.templateName)}</div>

                <div class="member-label">Staff Name</div>
                <div class="member-value">${escapeHtml(data.submittedBy)}</div>

                <div class="member-label">Staff Region</div>
                <div class="member-value">${escapeHtml(memberRegion)}</div>

                <div class="member-label">Phone Number</div>
                <div class="member-value">${escapeHtml(memberPhone)}</div>

                <div class="member-label">Email</div>
                <div class="member-value">${escapeHtml(data.submittedByEmail)}</div>
            </div>
        </div>
    </div>

    ${pagesHTML}

</body>
</html>`
}

/**
 * Format field values for display
 */
function formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value, null, 2)

    // Check if value is an image URL
    const stringValue = String(value);
    if (stringValue.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || stringValue.startsWith('data:image')) {
        let imageSrc = stringValue;

        // If it's a relative path, try to resolve it from public directory and convert to base64
        if (stringValue.startsWith('/') && !stringValue.startsWith('//')) {
            try {
                // Remove query parameters if any
                const cleanPath = stringValue.split('?')[0];
                const localPath = path.join(process.cwd(), 'public', cleanPath);

                if (fs.existsSync(localPath)) {
                    const imageBuffer = fs.readFileSync(localPath);
                    const ext = path.extname(localPath).substring(1);
                    imageSrc = `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
                }
            } catch (e) {
                console.error('PDF Export: Failed to embed local image', e);
            }
        }

        return `<div class="submitted-image-container"><img src="${imageSrc}" class="submitted-image" alt="Submitted Image" /></div>`
    }

    return escapeHtml(stringValue)
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}
