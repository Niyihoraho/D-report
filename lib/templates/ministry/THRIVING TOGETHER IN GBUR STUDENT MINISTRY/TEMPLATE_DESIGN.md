# Thrive Together Template Design Documentation

## Overview
The **Thriving Together in GBUR Student Ministry** template is a specialized PDF report generator designed for GBUR staff and student ministry reports. It transforms submission data into a professional, branded document that aligns with the "Thriving Together 2026" strategic vision.

**File Location**: `lib/templates/ministry/THRIVING TOGETHER IN GBUR STUDENT MINISTRY/index.ts`

## Visual Identity & Branding
The template uses a distinct color palette and typography to match GBUR branding:
- **Primary Color**: Cyan/Teal (`#0e7490`) - Used for headers, list bullets, and labels.
- **Accent Color**: Orange (`#f19008`) - Used for the title border and footer text.
- **Background**: Light Cream (`#FFF7ED`) - Provides a warm, paper-like feel.
- **Typography**: 
  - *Headers*: Arial, sans-serif (Bold, Uppercase).
  - *Body*: Times New Roman, serif (Formal, readable).

---

## Report Structure

### 1. Cover Page
The cover page is the first impression and contains static strategic context alongside dynamic member data.
- **Logo**: Embeds the IFES/GBUR logo (top-right).
- **Title**: "THRIVING TOGETHER IN GBUR STUDENT MINISTRY 2026".
- **Introductory Text**: A mission statement ensuring alignment with the ministry's goals.
- **Strategic Priorities**: A hardcoded list of the four pillars (Witness, Whole-life User, Pioneering, Future).
- **Member Information Grid**: A clean, two-column grid at the bottom displaying:
  - GBU Name
  - Staff Name
  - Region (Auto-extracted from profile)
  - Phone (Auto-extracted from profile)
  - Email

### 2. Activity Pages
Each reported activity is rendered on its **own dedicated page** to ensure clarity and readability.
- **Header**: Displays the Activity Name (or "ACTIVITY REPORT X" if unnamed).
- **Metadata**: Shows the submission date.
- **Content Parsing**:
  - **Standard Fields**: Rendered as alternating colored rows (`#f8fafc` for even rows).
  - **Impact/Comments**: Highlighted in a special **Impact Box** with a left orange border and light blue background (`#f0f9ff`) to emphasize qualitative results.
  - **Images**: Automatically detects image URLs or Base64 data and renders them in a centered container with shadow styling.
- **Footer**: Appears on the final page with the generation date and timestamp.

---

## Data Logic & Mapping

### Member Data Extraction
The template includes smart logic to find user details properly:
- **Region**: Searches profile data for keys like `region`, `staff region`, `location`, or `province`.
- **Phone**: Searches for `phone`, `mobile`, `cel`, or `tel`.

### Activity Handling
- **Multi-Activity Support**: Supports generating reports for multiple activities at once (via `data.history`).
- **Sorting**: Automatically sorts activities chronologically (oldest to newest).
- **Field Formatting**:
  - Boolean values become "Yes"/"No".
  - Arrays are joined with commas.
  - Dates are formatted to US locale standards.

### Smart Field Recognition
The template attempts to identify specific fields to present them better:
- **"Where" / "Location"**: Renamed to "Where it take place".
- **"When"**: Renamed to "Date".
- **"Activity" / "Title"**: Promoted to the page header if found.

---

## Technical Implementation Details
- **Base64 Images**: Local images (like the logo) are read from the `public` directory and converted to Base64 to ensure they render correctly in the PDF generation process (Puppeteer).
- **CSS Paging**: Uses `@page { size: A4; margin: 0; }` to strictly control printer output settings.
- **XSS Protection**: All user input is passed through an `escapeHtml` function to prevent script injection attacks.
