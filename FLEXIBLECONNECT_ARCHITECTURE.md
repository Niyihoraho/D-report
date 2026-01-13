# FlexibleConnect: Complete System Architecture

**Project Codename:** FlexibleConnect  
**Vision:** An Organizational Operating System for Rwanda and Beyond  
**Architecture:** Workspace-Based Multi-Purpose Platform  
**Deployment:** Self-Hosted Docker Solution

---

## 🎯 Executive Summary

FlexibleConnect is not just a reporting tool—it's a **Data Transformation Pipeline** that allows organizations to:

1. **Collect** data through flexible forms (registration or reports)
2. **Organize** data using isolated workspaces with hierarchical security
3. **Transform** data into professional documents via Word template injection
4. **Host** everything in a portable, self-contained Docker environment

### The Core Innovation: "The Hybrid Workflow"

**Design Offline (Word) → Collect Online (Web) → Inject & Export (PDF/DOCX)**

---

## 📐 The Four Pillars

### Pillar 1: Hybrid Reporting Engine

**What it solves:** Managers know Word but can't collect data from 500 people. Web forms collect data but can't generate beautiful reports.

**How it works:**
1. Manager designs template in Word with `{{placeholders}}`
2. System auto-generates web form from placeholders
3. Workers fill form on mobile (offline-supported)
4. System injects answers into Word → Perfect PDF/DOCX

**Technical Implementation:**
- **Frontend:** Block Builder (React + @dnd-kit)
- **Backend:** docxtemplater + pizzip
- **Storage:** Template versions (immutable snapshots)

---

### Pillar 2: Workspace Architecture

**What it solves:** Different departments need different tools. "Construction" shouldn't see "Ministry" data.

**Structure:**
```
Deployment (1 Server = 1 Organization)
├── Workspace A: "Campus Ministry"
│   ├── Hierarchy: National → Region → Campus
│   ├── Templates: Annual Reports, Bible Studies
│   └── Members: Students, Leaders
├── Workspace B: "Construction Sites"
│   ├── Hierarchy: HQ → District → Site
│   ├── Templates: Stock Logs, Safety Reports
│   └── Members: Engineers, Foremen
└── Workspace C: "SIP Training"
    ├── Hierarchy: National → Cohort → Participant
    ├── Templates: Certificates, Assessments
    └── Members: Mentors, Trainees
```

**Key Database Models:**

```prisma
model Workspace {
  id              String         @id
  name            String         // "Campus Ministry"
  type            WorkspaceType  // MINISTRY, CONSTRUCTION, TRAINING
  
  // Dynamic registration form
  registrationFields Json?
  
  // Payment settings for public registration
  requiresPayment    Boolean @default(false)
  paymentConfig      Json?
  
  units           OrganizationalUnit[]
  templates       Template[]
  members         UserWorkspaceRole[]
}

model UserWorkspaceRole {
  id          String  @id
  userId      String
  workspaceId String
  
  // Security: Which unit do they belong to?
  unitId      String?
  
  // Role: ADMIN, MANAGER, MEMBER, VIEWER
  role        Role
  
  // Flexible profile data (answers to registration form)
  profileData Json?
  
  // Payment tracking
  status      MemberStatus
  paymentId   String?
}
```

**The Waterfall Security Principle:**

```typescript
// Recursive query finds user's unit + all child units
export async function getAccessibleUnitIds(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }});
  
  const units = await prisma.$queryRaw`
    WITH RECURSIVE SubUnits AS (
      SELECT id FROM "OrganizationalUnit" WHERE id = ${user.unitId}
      UNION
      SELECT o.id FROM "OrganizationalUnit" o
      INNER JOIN SubUnits s ON s.id = o."parentId"
    )
    SELECT id FROM SubUnits;
  `;
  
  return units.map(u => u.id);
}
```

**Result:** Campus Leader at "UR Huye" **cannot** see "UR Musanze" data—database-level enforcement.

---

### Pillar 3: Dynamic Registration + Payment Integration

**What it solves:** Every event needs different data. Hard-coding fields is impossible.

**The Unified Builder Strategy:**

The same Block Builder used for reports is reused for registration forms:

1. **Admin Design:**
   - Drags blocks: "Name", "Campus" (Dropdown), "T-Shirt Size", "Dietary Preference"
   - Toggles "Enable Public Access" + "Require Payment"
   - Sets payment: Fixed ($50) or Variable (based on dropdown selection)

2. **System Generation:**
   - Creates public link: `reports.gbur.org/register/training-2025`
   - Saves schema to `Workspace.registrationFields` (JSON)

3. **User Registration:**
   - User fills form (no login required)
   - Selects "Campus" → System captures as `unitId` (security scope)
   - Payment flow: Flutterwave/Stripe integration
   - System creates `UserWorkspaceRole` with `profileData` JSON

4. **Admin Management:**
   - Dynamic table shows: Name, Email, Unit, Status, + custom fields
   - Actions: Edit (opens form pre-filled), Delete (soft delete), Export (Excel)

**Payment Security:**

```typescript
// NEVER trust frontend payment status
// 1. User pays → Frontend receives payment_intent_id
// 2. Backend verifies with gateway
const payment = await flutterwave.verify(paymentIntentId);

if (payment.status !== 'succeeded') {
  throw new Error("Payment not confirmed");
}

// 3. Only then create membership
await prisma.userWorkspaceRole.create({
  data: { userId, workspaceId, status: 'ACTIVE', paymentId }
});
```

**Recommended Gateways for Rwanda:**
- **Flutterwave:** MTN MoMo, Airtel Money (3.8% + RWF 100)
- **Paystack:** Card, Bank Transfer (1.5% + RWF 100)
- **Stripe:** International cards (2.9% + $0.30)

---

### Pillar 4: Docker "Box" Deployment

**What it solves:** AWS/Vercel is expensive. Clients want data sovereignty.

**The Self-Contained Stack:**

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

**Deployment Workflow:**

1. **For GBUR:**
   ```bash
   cp docker-compose.yml /server/gbur/
   echo "APP_NAME=GBUR Reports" > .env.production
   docker-compose up -d
   ```

2. **For Construction Company:**
   ```bash
   cp docker-compose.yml /server/construction/
   echo "APP_NAME=BuildRwanda Stock" > .env.production
   docker-compose up -d
   ```

**Cost Analysis:**
- **VPS:** $10/month (2 CPU, 4GB RAM)
- **Domain:** $12/year
- **Software:** $0 (open source)
- **Total Cost:** ~$15/month
- **Client Price:** $50-150/month
- **Profit Margin:** $35-135/month per client

---

## 🔗 The Synergy: How Pillars Support Each Other

### 1. Registration → Reporting (Data Source Synergy)

**Scenario:** Print ID badges for 500 SIP participants

**Execution:**
1. Participants registered via Pillar 3 (captured: Name, Photo, Role)
2. Admin creates Word template: `ID_Badge.docx` with `{{name}}`, `{{photo}}`, `{{role}}`
3. Pillar 1 (Reporting Engine) pulls data from `UserWorkspaceRole.profileData`
4. System generates 500 personalized badges in seconds

**Benefit:** Zero additional code. The registration system **is** the data source.

---

### 2. Workspaces → Docker (Security Synergy)

**Scenario:** GBUR has sensitive "Counseling Data" and public "Event Data"

**Execution:**
1. Pillar 4 (Docker) hosts both on one server (cost savings)
2. Pillar 2 (Workspaces) creates isolation
3. Waterfall Security ensures Event volunteers cannot query Counseling database

**Benefit:** Multi-purpose organizations on a single, affordable server.

---

### 3. Builder → UX (Learning Synergy)

**Scenario:** Manager learns the system

**Execution:**
1. Week 1: Creates "Monthly Report" using Block Builder
2. Week 2: Needs "Conference Registration Form"
3. Sees **exact same interface** (same builder, different purpose)

**Benefit:** Single learning curve. Manager becomes expert in one tool, applies it everywhere.

---

### 4. Docker → Business (White-Label Synergy)

**Scenario:** Meet new client at 10:00 AM

**Execution:**
1. Copy `docker-compose.yml` to their server
2. Change `APP_NAME="ClientName"`
3. Run `docker-compose up -d`
4. By 10:05 AM: Branded system live

**Benefit:** Instant deployment = Faster sales cycle.

---

## 🗄️ Complete Database Schema

```prisma
// 1. GLOBAL USERS (Shared across workspaces)
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // bcrypt
  name          String
  workspaceRoles UserWorkspaceRole[]
}

// 2. WORKSPACES (Isolated departments/projects)
model Workspace {
  id                  String       @id @default(cuid())
  name                String
  slug                String       @unique
  type                WorkspaceType
  
  // Dynamic registration form
  registrationFields  Json?
  isPublicRegistration Boolean     @default(false)
  requiresPayment     Boolean      @default(false)
  paymentConfig       Json?
  
  units               OrganizationalUnit[]
  templates           Template[]
  members             UserWorkspaceRole[]
}

// 3. FLEXIBLE HIERARCHY (Self-referencing tree)
model OrganizationalUnit {
  id          String   @id @default(cuid())
  name        String
  type        String   // "REGION", "CAMPUS", "SITE"
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  
  parentId    String?
  parent      OrganizationalUnit? @relation("Tree", fields: [parentId], references: [id])
  children    OrganizationalUnit[] @relation("Tree")
}

// 4. MEMBERSHIP (User in Workspace with profile)
model UserWorkspaceRole {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  
  // Security scope
  unitId      String?
  unit        OrganizationalUnit? @relation(fields: [unitId], references: [id])
  
  role        Role     @default(MEMBER)
  
  // Flexible profile (answers to registrationFields)
  profileData Json?
  
  // Payment tracking
  status      MemberStatus @default(PENDING)
  payment     Payment?
  
  @@unique([userId, workspaceId])
}

// 5. TEMPLATES (Report definitions)
model Template {
  id          String   @id @default(cuid())
  title       String
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  
  versions    TemplateVersion[]
  activeVersionId String?
}

// 6. IMMUTABLE VERSIONS (Preserve historical data)
model TemplateVersion {
  id           String   @id @default(cuid())
  versionNumber Int
  templateId   String
  template     Template @relation(fields: [templateId], references: [id])
  
  // Form structure (JSON)
  structure    Json
  
  // AWS S3/MinIO URL to Word file
  docxUrl      String
  
  assignments  Assignment[]
  publishedAt  DateTime @default(now())
}

// 7. ASSIGNMENTS (Internal reports)
model Assignment {
  id                String   @id @default(cuid())
  templateVersionId String
  templateVersion   TemplateVersion @relation(fields: [templateVersionId], references: [id])
  workerId          String
  worker            User    @relation(fields: [workerId], references: [id])
  
  status      Status   @default(PENDING)
  dueDate     DateTime?
  answers     Json?
  
  submittedAt DateTime?
}

// 8. PUBLIC SUBMISSIONS (External registrations)
model PublicSubmission {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  
  answers     Json
  ipAddress   String
  userAgent   String
  
  payment     Payment?
  submittedAt DateTime @default(now())
}

// 9. PAYMENTS
model Payment {
  id                   String   @id @default(cuid())
  submissionId         String?  @unique
  submission           PublicSubmission? @relation(fields: [submissionId], references: [id])
  userWorkspaceRoleId  String?  @unique
  member               UserWorkspaceRole? @relation(fields: [userWorkspaceRoleId], references: [id])
  
  amount               Int      // Smallest unit (cents/agori)
  currency             String
  status               PaymentStatus @default(PENDING)
  gateway              String   // "flutterwave", "stripe"
  gatewayTransactionId String?
  
  paidAt      DateTime?
  createdAt   DateTime @default(now())
}

enum WorkspaceType {
  MINISTRY
  CONSTRUCTION
  TRAINING
  GENERAL
}

enum Role {
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

enum MemberStatus {
  PENDING
  ACTIVE
  REJECTED
  ARCHIVED
}

enum Status {
  PENDING
  IN_PROGRESS
  SUBMITTED
  APPROVED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}
```

---

## 🏗️ Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Next.js 15 + TypeScript setup
- [ ] PostgreSQL + Prisma configuration
- [ ] Authentication (NextAuth.js)
- [ ] Basic layout (Sidebar, Header)
- [ ] Workspace CRUD

**Deliverable:** Admin can create workspaces

---

### Phase 2: Hierarchy Builder (Week 1-2)
- [ ] Organizational Unit tree builder
- [ ] Parent-child linking
- [ ] Waterfall security function
- [ ] Role management UI

**Deliverable:** 3-level hierarchy (National → Region → Campus)

---

### Phase 3: Block Builder Engine (Week 2)
- [ ] Drag-and-drop interface (@dnd-kit)
- [ ] Block components (Text, Table, etc.)
- [ ] Tag generator ({{variable}} preview)
- [ ] JSON schema generation

**Deliverable:** Manager can build forms visually

---

### Phase 4: Form Renderer (Week 3)
- [ ] Dynamic form rendering
- [ ] React Hook Form + Zod validation
- [ ] Auto-save (localStorage)
- [ ] Offline PWA support
- [ ] Assignment system

**Deliverable:** Workers can fill forms on mobile

---

### Phase 5: Document Generation (Week 3-4)
- [ ] docxtemplater integration
- [ ] AWS S3/MinIO upload
- [ ] PDF conversion (Puppeteer)
- [ ] Combined report merger

**Deliverable:** Perfect DOCX/PDF generation

---

### Phase 6: Registration + Payment (Week 4)
- [ ] Public form configuration
- [ ] Flutterwave integration
- [ ] Dynamic member table
- [ ] Payment verification webhooks

**Deliverable:** Event registration with fees

---

### Phase 7: Docker Deployment (Week 5)
- [ ] Dockerfile (multi-stage build)
- [ ] docker-compose.yml
- [ ] MinIO configuration
- [ ] Caddy reverse proxy

**Deliverable:** Portable "box" deployment

---

### Phase 8: Polish (Week 5)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] E2E tests (Playwright)
- [ ] Documentation

**Deliverable:** Production-ready system

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Template Creation Speed** | < 30 minutes | Manager creates GBUR annual report |
| **Form Completion Speed** | < 20 minutes | Campus leader fills report on mobile |
| **Document Quality** | 100% match | Generated PDF matches Word design |
| **Concurrency** | 100+ users | Simultaneous active users |
| **Generation Speed** | < 2 minutes | From submission to download |
| **Deployment Speed** | < 10 minutes | From code to live server |
| **User Satisfaction** | 4.5+ stars | Post-implementation survey |

---

## 💼 Business Model

### Option A: Agency Model
- **Setup Fee:** $1,000 (Server setup + training)
- **Monthly Fee:** $100 (Maintenance + support)
- **Best For:** Construction companies, large NGOs

### Option B: SaaS Model
- **Monthly Fee:** $150 (Managed hosting)
- **Best For:** Small churches, ministries

### Option C: Hybrid
- **Deployment:** One-time $500
- **Support:** $50/month (optional)
- **Best For:** Tech-savvy organizations

---

## 🚀 Competitive Advantages

| Feature | Google Forms | Microsoft Forms | **FlexibleConnect** |
|---------|--------------|-----------------|---------------------|
| Professional Documents | ❌ Raw data only | ❌ Excel only | ✅ Perfect Word/PDF |
| Offline Support | ❌ | ❌ | ✅ PWA + localStorage |
| Hierarchical Security | ❌ | ❌ | ✅ Waterfall principle |
| Payment Integration | ❌ | ❌ | ✅ Flutterwave/Stripe |
| Self-Hosted | ❌ | ❌ | ✅ Docker deployment |
| Multi-Purpose Workspaces | ❌ | ❌ | ✅ Unlimited flexibility |
| Template Reusability | ❌ Need redesign | ❌ Limited | ✅ Forever reusable |

---

## 📊 Target Market (Rwanda)

### Primary Customers
1. **GBUR** (National Office)
2. **Churches** (Anglican, Catholic dioceses)
3. **Construction Companies** (Site management)
4. **NGOs** (USAID projects, World Vision)
5. **Government Agencies** (District reporting)

### Value Proposition
- **Data Sovereignty:** "Your data stays in Rwanda"
- **Cost Savings:** "Pay once, use forever vs. $10/user/month SaaS"
- **Flexibility:** "One system for reports, registration, AND inventory"
- **Familiar UX:** "Design in Word, the tool you already know"

---

## 🎓 Conclusion

FlexibleConnect is not just a product—it's a **Platform**. By combining:

1. **Word-to-Web** bridge (Unique innovation)
2. **Workspace isolation** (Security + flexibility)
3. **Dynamic registration** (Revenue generation)
4. **Docker packaging** (Easy deployment)

You create a system that can compete with international SaaS products while being perfectly tailored to the Rwandan market's needs for data sovereignty, offline support, and cost efficiency.

**Next Steps:**
1. Initialize Next.js project
2. Set up local Docker development environment
3. Build Workspace CRUD (Week 1 deliverable)

---

**Document Version:** 2.0 (Complete Architecture)  
**Last Updated:** 2025-12-19  
**Author:** Niyihoraho (System Architect)  
**Status:** Ready for Implementation
