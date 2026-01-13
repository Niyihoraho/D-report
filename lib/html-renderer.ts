import 'server-only'
import { ReactElement } from 'react'

/**
 * Convert a React component to a complete HTML document string
 * @param component - React component to render
 * @returns Complete HTML document as string
 */
export function renderHTML(component: ReactElement): string {
  // Dynamic import to avoid bundling issues with react-dom/server
  const { renderToStaticMarkup } = require('react-dom/server')
  const bodyContent = renderToStaticMarkup(component)

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report</title>
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
        background: #fff;
      }

      /* Print-specific styles */
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }

      /* Table styles */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }

      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f0f0f0;
        font-weight: bold;
      }

      /* Heading styles */
      h1, h2, h3, h4, h5, h6 {
        margin: 10px 0;
        font-weight: bold;
      }

      h1 { font-size: 24pt; }
      h2 { font-size: 20pt; }
      h3 { font-size: 16pt; }

      /* Paragraph spacing */
      p {
        margin: 8px 0;
      }

      /* Image handling */
      img {
        max-width: 100%;
        height: auto;
      }

      /* Utility classes */
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: bold; }
      .italic { font-style: italic; }
    </style>
  </head>
  <body>
    ${bodyContent}
  </body>
</html>
  `.trim()
}
