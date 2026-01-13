# D-Report System Documentation

> **Project Name:** D-Report (FlexibleConnect)  
> **Version:** 0.1.0  
> **Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, PostgreSQL  
> **Purpose:** A workspace-based organizational operating system for data collection, management, and document generation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Directory Structure](#directory-structure)
5. [Core Features](#core-features)
6. [Technology Stack](#technology-stack)
7. [API Routes](#api-routes)
8. [Components](#components)
9. [Utilities & Libraries](#utilities--libraries)
10. [Deployment](#deployment)

---

## 🎯 System Overview

**D-Report** (codename: FlexibleConnect) is a comprehensive organizational management platform designed to:

- **Collect** data through flexible, customizable forms (registration and reports)
- **Organize** data using isolated workspaces with hierarchical security
- **Transform** data into professional documents via Word template injection
- **Manage** members, organizational units, and workflows across multiple workspaces

### Core Innovation: The Hybrid Workflow

**Design Offline (Word) → Collect Online (Web) → Inject & Export (PDF/DOCX)**

This system bridges the gap between traditional document design (Word) and modern web-based data collection, enabling organizations to:
1. Design templates in Microsoft Word with `{{placeholders}}`
2. Auto-generate web forms from those placeholders
3. Collect data through mobile-friendly forms
4. Inject collected data back into Word templates
5. Generate perfect PDF/DOCX documents

---

## 🏗️ Architecture

### The Four Pillars

#### 1. **Hybrid Reporting Engine**
- Block-based form builder using React and @dnd-kit
- Dynamic form rendering with validation (React Hook Form + Zod)
- Document generation using docxtemplater + pizzip
- PDF conversion with Puppeteer

#### 2. **Workspace Architecture**
- Multi-tenant isolation (one deployment = multiple workspaces)
- Hierarchical organizational units (self-referencing tree structure)
- Role-based access control (ADMIN, MANAGER, MEMBER, VIEWER)
- Waterfall security principle (users see their unit + child units)

#### 3. **Dynamic Registration + Payment Integration**
- Flexible registration forms with custom fields (stored as JSON)
- Public registration links with optional payment requirements
- Payment gateway integration ready (Flutterwave, Stripe, Paystack)
- Member management with dynamic profile data

#### 4. **Self-Hosted Deployment**
- Docker-based containerization
- PostgreSQL database
- MinIO for file storage (S3-compatible)
- Caddy reverse proxy for SSL/TLS

---

## 🗄️ Database Schema

### Core Models

#### **User**
Global user accounts that can belong to multiple workspaces.
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `password`: Bcrypt hashed password
- `name`: User's full name
- `workspaceRoles`: Many-to-many relationship with workspaces

#### **Workspace**
Isolated environments for different organizations/departments.
- `id`: Unique identifier
- `name`: Workspace name
- `slug`: URL-friendly unique identifier
- `type`: MINISTRY | CONSTRUCTION | TRAINING | GENERAL
- `logoUrl`, `stampUrl`, `address`, `motto`: Branding for reports
- `primaryColor`: Brand color (default: #6C5DD3)
- `registrationFields`: JSON schema for dynamic registration forms
- `isPublicRegistration`: Enable public registration
- `requiresPayment`: Require payment for registration
- `paymentConfig`: Payment gateway configuration (JSON)

#### **OrganizationalUnit**
Hierarchical structure within workspaces (self-referencing tree).
- `id`: Unique identifier
- `name`: Unit name (e.g., "Huye Campus", "Construction Site A")
- `type`: Custom type string (e.g., "REGION", "CAMPUS", "SITE")
- `parentId`: Reference to parent unit (nullable for root units)
- `workspaceId`: Belongs to a workspace

#### **UserWorkspaceRole**
Membership linking users to workspaces with roles and profiles.
- `id`: Unique identifier
- `userId`: Reference to User
- `workspaceId`: Reference to Workspace
- `unitId`: Reference to OrganizationalUnit (security scope)
- `role`: ADMIN | MANAGER | MEMBER | VIEWER
- `status`: PENDING | ACTIVE | SUSPENDED | INACTIVE
- `profileData`: JSON object storing custom registration data
- `publicSlug`: Unique slug for public profiles
- `isPublicProfile`: Enable public profile visibility

#### **FormTemplate**
Reusable form definitions for data collection.
- `id`: Unique identifier
- `workspaceId`: Belongs to a workspace
- `name`: Template name
- `description`: Template description
- `fields`: JSON array of FormField objects
- `submitLabel`: Custom submit button text
- `status`: Draft | Active
- `publicSlug`: Unique slug for public access
- `isPublic`: Enable public form access

#### **FormAssignment**
Assigns forms to specific members for completion.
- `id`: Unique identifier
- `templateId`: Reference to FormTemplate
- `memberId`: Reference to UserWorkspaceRole
- `assignedBy`: User ID who created the assignment
- `dueDate`: Optional deadline
- `publicSlug`: Unique public link for form submission
- `isActive`: Enable/disable assignment
- `allowMultiple`: Allow multiple submissions
- `responses`: Latest response data (JSON)
- `status`: PENDING | IN_PROGRESS | SUBMITTED | COMPLETED

#### **FormSubmission**
Historical record of all form submissions.
- `id`: Unique identifier
- `assignmentId`: Reference to FormAssignment
- `responses`: Submitted data (JSON)
- `submittedAt`: Timestamp

#### **Template**
Report template definitions (Word documents).
- `id`: Unique identifier
- `title`: Template title
- `workspaceId`: Belongs to a workspace
- `activeVersionId`: Current active version

#### **TemplateVersion**
Immutable snapshots of templates (preserves historical data).
- `id`: Unique identifier
- `versionNumber`: Incremental version number
- `templateId`: Reference to Template
- `structure`: JSON schema with placeholders
- `docxUrl`: URL to Word document (MinIO/S3)
- `publishedAt`: Publication timestamp

#### **Assignment**
Internal report assignments for workers.
- `id`: Unique identifier
- `templateVersionId`: Reference to TemplateVersion
- `workerId`: Reference to User
- `status`: PENDING | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED
- `dueDate`: Optional deadline
- `answers`: Submitted data (JSON)

#### **Report**
Generated documents with verification.
- `id`: Unique identifier
- `type`: TRANSCRIPT | CERTIFICATE | RECEIPT | MEMBERSHIP_CARD | ATTENDANCE | CUSTOM
- `referenceNumber`: Unique verification number
- `workspaceId`: Reference to Workspace
- `memberId`: Reference to UserWorkspaceRole
- `generatedBy`: User ID who generated the report
- `templateName`: Name of template used
- `qrCodeData`: QR code for verification
- `isVerified`: Verification status
- `pdfUrl`: URL to generated PDF

---

## 📁 Directory Structure

```
d-report/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server actions
│   ├── admin/                    # Admin pages
│   │   ├── assignments/          # Assignment management
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── member-schema/        # Member schema configuration
│   │   ├── structure/            # Organizational structure
│   │   ├── structure-settings/   # Structure settings
│   │   └── users/                # User management
│   ├── api/                      # API routes
│   │   ├── public/               # Public API endpoints
│   │   ├── upload/               # File upload handlers
│   │   └── workspaces/           # Workspace API routes
│   ├── dashboard/                # User dashboard
│   ├── fixed/                    # Fixed pages
│   ├── forms/                    # Form pages
│   ├── guests/                   # Guest pages
│   ├── login/                    # Authentication
│   ├── restaurant/               # Restaurant module (example)
│   ├── rooms/                    # Rooms module (example)
│   ├── verify/                   # Verification pages
│   ├── workspaces/               # Workspace pages
│   │   └── [id]/                 # Dynamic workspace routes
│   │       ├── assignments/      # Workspace assignments
│   │       ├── data/             # Workspace data
│   │       ├── members/          # Member management
│   │       ├── registration/     # Registration form builder
│   │       ├── reports/          # Report generation
│   │       ├── settings/         # Workspace settings
│   │       ├── structure/        # Organizational structure
│   │       └── templates/        # Template management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects to /workspaces)
│
├── components/                   # React components
│   ├── categories/               # Category components
│   ├── form-builder/             # Form builder components
│   │   ├── canvas-field.tsx      # Draggable field on canvas
│   │   ├── field-editor-panel.tsx # Field property editor
│   │   ├── field-palette.tsx     # Available field types
│   │   ├── form-builder.tsx      # Main builder component
│   │   ├── form-canvas.tsx       # Drop zone for fields
│   │   ├── form-preview-modal.tsx # Preview modal
│   │   └── sortable-field.tsx    # Sortable field wrapper
│   ├── forms/                    # Form components
│   ├── member-types/             # Member type components
│   ├── members/                  # Member components
│   ├── profile/                  # Profile components
│   ├── registration/             # Registration components
│   ├── structure/                # Structure components
│   ├── templates/                # Template components
│   ├── ui/                       # Shadcn UI components (32 components)
│   ├── workspace/                # Workspace components
│   ├── data-table.tsx            # Reusable data table
│   ├── delete-modal.tsx          # Delete confirmation modal
│   ├── form-renderer.tsx         # Dynamic form renderer
│   ├── nav-documents.tsx         # Document navigation
│   ├── nav-main.tsx              # Main navigation
│   ├── nav-secondary.tsx         # Secondary navigation
│   ├── nav-user.tsx              # User navigation
│   ├── theme-provider.tsx        # Theme context provider
│   ├── top-nav.tsx               # Top navigation bar
│   └── [Various UI components]   # ActionMenu, BreadcrumbNav, etc.
│
├── lib/                          # Utility libraries
│   ├── types/                    # TypeScript type definitions
│   │   ├── db.ts                 # Database types
│   │   ├── form-structure.ts     # Form structure types
│   │   └── visual-mapper-lists.ts # Visual mapper types
│   ├── form-assignment-utils.ts  # Form assignment utilities
│   ├── html-renderer.ts          # HTML rendering utilities
│   ├── mock-data.ts              # Mock data for development
│   ├── pdf-generator.ts          # PDF generation utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── profile-utils.ts          # Profile data utilities
│   ├── qr-generator.ts           # QR code generation
│   ├── reference-generator.ts    # Reference number generation
│   └── utils.ts                  # General utilities
│
├── prisma/                       # Database
│   ├── migrations/               # Database migrations
│   └── schema.prisma             # Prisma schema definition
│
├── public/                       # Static assets
│   └── [Images, logos, etc.]
│
├── scripts/                      # Build and utility scripts
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── components.json               # Shadcn UI configuration
├── eslint.config.mjs             # ESLint configuration
├── FLEXIBLECONNECT_ARCHITECTURE.md # Architecture documentation
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project readme
```

---

## ⚙️ Core Features

### 1. **Workspace Management**
- Create and manage multiple isolated workspaces
- Customize workspace branding (logo, stamp, colors, motto)
- Configure workspace types (Ministry, Construction, Training, General)
- Public registration with optional payment requirements

### 2. **Member Management**
- Add members to workspaces with roles
- Assign members to organizational units
- Dynamic profile data based on custom registration forms
- Public member profiles with unique slugs
- Member status tracking (Pending, Active, Suspended, Inactive)

### 3. **Organizational Structure**
- Hierarchical organizational units (unlimited depth)
- Self-referencing tree structure (parent-child relationships)
- Waterfall security (users see their unit + all child units)
- Custom unit types per workspace

### 4. **Form Builder**
- Drag-and-drop form builder interface
- Multiple field types:
  - Text input (short and long)
  - Number input
  - Email input
  - Phone input
  - Date picker
  - Select dropdown
  - Radio buttons
  - Checkboxes
  - File upload
  - Section headers
- Field validation rules
- Conditional logic support
- Form preview mode
- Public form links

### 5. **Form Assignments**
- Assign forms to specific members
- Set due dates
- Track submission status
- Allow single or multiple submissions
- Public submission links
- Submission history

### 6. **Template Management**
- Upload Word document templates
- Define placeholders in templates
- Version control for templates
- Template reusability across workspaces

### 7. **Report Generation**
- Generate documents from templates
- Inject member data into templates
- Export as PDF or DOCX
- QR code verification
- Unique reference numbers
- Report types: Transcript, Certificate, Receipt, Membership Card, Attendance, Custom

### 8. **Authentication & Authorization**
- User authentication (email/password)
- Role-based access control
- Workspace-level permissions
- Unit-level data scoping

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + Shadcn UI
- **Icons:** Tabler Icons, Lucide React
- **Drag & Drop:** @dnd-kit
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack React Table
- **Charts:** Recharts
- **Theme:** next-themes
- **Animations:** Framer Motion
- **Date Handling:** date-fns, react-day-picker

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma 6.19
- **Authentication:** bcryptjs
- **File Upload:** react-dropzone
- **Document Generation:** docxtemplater, pizzip, archiver
- **PDF Generation:** Puppeteer
- **QR Codes:** qrcode
- **Unique IDs:** nanoid

### Development Tools
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Database Tools:** Prisma Studio
- **Package Manager:** npm

---

## 🔌 API Routes

### Public Routes
- `GET /api/public/[...]` - Public API endpoints (registration, forms)

### Workspace Routes
- `GET /api/workspaces` - List all workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/[id]` - Get workspace details
- `PUT /api/workspaces/[id]` - Update workspace
- `DELETE /api/workspaces/[id]` - Delete workspace
- `GET /api/workspaces/[id]/members` - List workspace members
- `POST /api/workspaces/[id]/members` - Add member
- `GET /api/workspaces/[id]/forms` - List form templates
- `POST /api/workspaces/[id]/forms` - Create form template
- `GET /api/workspaces/[id]/assignments` - List form assignments
- `POST /api/workspaces/[id]/assignments` - Create assignment
- `GET /api/workspaces/[id]/reports` - List generated reports
- `POST /api/workspaces/[id]/reports` - Generate report
- `GET /api/workspaces/[id]/structure` - Get organizational structure
- `POST /api/workspaces/[id]/structure` - Update structure

### Upload Routes
- `POST /api/upload` - Handle file uploads

---

## 🧩 Components

### Layout Components
- **TopNav** - Top navigation bar with workspace context switching
- **nav-main** - Main sidebar navigation
- **nav-documents** - Document navigation
- **nav-secondary** - Secondary navigation
- **nav-user** - User profile menu
- **BreadcrumbNav** - Breadcrumb navigation

### Form Components
- **FormBuilder** - Main form builder interface
- **FormCanvas** - Drop zone for form fields
- **FieldPalette** - Available field types
- **FieldEditorPanel** - Field property editor
- **CanvasField** - Individual field on canvas
- **SortableField** - Sortable field wrapper
- **FormRenderer** - Dynamic form renderer
- **FormPreviewModal** - Form preview dialog

### Data Display Components
- **DataTable** - Reusable data table with sorting/filtering
- **StatCard** - Statistics card
- **StatusBadge** - Status indicator badge
- **EmptyState** - Empty state placeholder
- **LoadingSkeleton** - Loading skeleton

### Workspace Components
- **WorkspaceActions** - Workspace action menu
- **WorkspaceTypeBadge** - Workspace type indicator
- **CreateWorkspaceDialog** - Workspace creation dialog

### UI Components (Shadcn)
32 reusable UI components including:
- Button, Input, Select, Checkbox, Radio, Switch
- Dialog, Alert Dialog, Popover, Tooltip
- Table, Tabs, Separator, Scroll Area
- Avatar, Label, Card, Badge
- Dropdown Menu, Toggle, Toggle Group
- And more...

---

## 🔧 Utilities & Libraries

### Database
- **prisma.ts** - Prisma client singleton (prevents connection exhaustion)

### Form Utilities
- **form-assignment-utils.ts** - Form assignment helper functions
- **profile-utils.ts** - Profile data manipulation utilities

### Document Generation
- **html-renderer.ts** - Convert data to HTML
- **pdf-generator.ts** - Generate PDFs from HTML
- **qr-generator.ts** - Generate QR codes for verification
- **reference-generator.ts** - Generate unique reference numbers

### Type Definitions
- **db.ts** - Database type definitions
- **form-structure.ts** - Form structure types
- **visual-mapper-lists.ts** - Visual mapper types

### Development
- **mock-data.ts** - Mock data for development and testing

---

## 🚀 Deployment

### Development
```bash
# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

### Production (Docker)
```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, minio]
    
  db:
    image: postgres:16-alpine
    volumes: ["./pgdata:/var/lib/postgresql/data"]
    
  minio:
    image: minio/minio
    command: server /data
    ports: ["9000:9000"]
    volumes: ["./uploads:/data"]
    
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: ["./Caddyfile:/etc/caddy/Caddyfile"]
```

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dreport"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### Database Scripts
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database
```

---

## 📊 Key Design Patterns

### 1. **Workspace Isolation**
Each workspace is completely isolated with its own:
- Members and roles
- Organizational structure
- Form templates
- Reports and documents
- Branding and configuration

### 2. **Hierarchical Security (Waterfall Principle)**
Users can only access data from:
- Their assigned organizational unit
- All child units below their unit
- Implemented via recursive SQL queries

### 3. **Flexible Schema (JSON Storage)**
Dynamic data stored as JSON for flexibility:
- `Workspace.registrationFields` - Custom registration form schema
- `UserWorkspaceRole.profileData` - Member profile data
- `FormTemplate.fields` - Form field definitions
- `FormAssignment.responses` - Form submission data

### 4. **Immutable Versioning**
Templates use immutable versions to preserve historical data:
- Each template change creates a new version
- Assignments reference specific versions
- Historical reports remain accurate

### 5. **Public Access via Slugs**
Unique slugs enable public access without authentication:
- Workspace registration forms
- Form assignments
- Member profiles
- All slugs are globally unique

---

## 🎯 Use Cases

### 1. **Ministry Organization (GBUR)**
- Manage campus ministry across multiple universities
- Collect annual reports from campus leaders
- Generate certificates and transcripts
- Track member registrations with payments

### 2. **Construction Company**
- Manage multiple construction sites
- Track stock and inventory
- Generate safety reports
- Monitor site progress

### 3. **Training Programs**
- Manage training cohorts
- Collect participant registrations
- Generate certificates
- Track assessments and progress

### 4. **General Organizations**
- Flexible workspace for any organization type
- Custom forms and reports
- Member management
- Document generation

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Flutterwave, Stripe, Paystack)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics and dashboards
- [ ] Mobile app (React Native)
- [ ] Offline PWA support
- [ ] Multi-language support
- [ ] Advanced reporting with charts
- [ ] Bulk operations
- [ ] API webhooks
- [ ] Third-party integrations

---

## 📝 Notes

- The system is currently in active development (v0.1.0)
- Some features from the architecture document are planned but not yet implemented
- The codebase follows Next.js 16 App Router conventions
- All components use TypeScript for type safety
- The UI is built with Tailwind CSS and Shadcn UI for consistency
- Database migrations are managed by Prisma

---

**Last Updated:** 2026-01-07  
**Documentation Version:** 1.0  
**Status:** Active Development
