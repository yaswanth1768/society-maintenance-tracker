# 🏢 Society Maintenance Tracker (SMT)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Built%20With-Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

> **Society Maintenance Tracker** is a modern, role-based Single Page Application (SPA) designed to streamline residential society operations. Residents can submit and monitor maintenance complaints with photo attachments, view real-time audit history, and receive email alerts. Society administrators manage complaints through deterministic status lifecycles, configure SLA overdue thresholds, publish pinned society circulars, and monitor facility health through interactive analytics dashboards.

---

## 🚀 Live Demo & Demo Accounts

- **Hosted URL**: [society-maintenance-track.vercel.app](https://society-maintenance-track.vercel.app/) *(or run locally using instructions below)*

### 🔑 Demo Credentials

| Role | Email | Password | Flat / Unit | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Society Admin** | `admin@society.com` | `admin123` | Office | Full admin dashboard, complaints management, SLA config, notices CRUD, analytics |
| **Resident 1** | `yaswanth@example.com` | `password123` | Flat A-404 | Raise complaints, upload photos, view audit history, read notices, email updates |
| **Resident 2** | `priya@example.com` | `password123` | Flat B-302 | Submit requests, view notifications, acknowledge society rules |
| **Resident 3** | `amit@example.com` | `password123` | Flat C-105 | Resident portal access |

*Note: 1-click Quick Demo Sign-in and Google Sign-in simulation are also provided directly on the Login page.*

---

## ✨ Key Features & Capabilities

### 👤 Resident Portal
- **Complaint Submission**: Select category (Plumbing, Electrical, Lift, Security, Cleaning, Water Supply, Common Area, Other), enter detailed description, and attach supporting photos (drag-and-drop or file picker, JPG/PNG/WEBP < 5MB).
- **Status Lifecycle Audit Trail**: Full chronological timeline for each complaint with status badges, timestamps, actor names, and administrative remarks.
- **Photo Lightbox**: Interactive full-resolution modal preview for uploaded complaint images.
- **Notice Board**: View all society circulars with pinned **Important** announcements highlighted at the top.
- **Society Rules & Regulations**: Community bylaws review and acknowledgment modal.
- **Email & Notification Center**: Top-bar notification bell with unread badge counter, email preview modal (From, To, Subject, Timestamp, Body), and mark-as-read functionality.

### 🛡️ Admin Management Console
- **Analytics Dashboard**: Real-time KPI summary cards, Chart.js Doughnut chart (Status distribution), Chart.js Bar chart (Complaints by category), and quick-access Overdue list.
- **Filter & Search Complaints**: Filter by **Category**, **Status**, **Date** (Today, Last 7 Days, Last 30 Days, All), **Priority** (Low, Medium, High), **Overdue SLA flag**, or search across resident names, flats, categories, and descriptions.
- **Deterministic Status Workflow**: Move complaints through `Open` → `In Progress` → `Resolved (Closed)` with required/optional audit remarks. Marking an issue `Resolved` officially closes it.
- **Configurable SLA Overdue Detection**: Customize the overdue threshold in days (default: 5 days). Complaints exceeding the threshold dynamically surface at the top of the admin view with distinct red alert badges.
- **Notice Board CRUD**: Publish new notices, toggle "Pin as Important" (triggers automated email broadcast to all residents), edit existing notices, and delete notices with confirmation modals.
- **Operational Reports & Analytics**: Department-level resolution rates, average age of open requests, and priority breakdown.

---

## 🏗️ Project Architecture & Structure

The project adopts a clean, modular Vanilla JavaScript architecture using ES Modules and Vite bundling with zero framework runtime overhead:

```
society-maintenance-tracker/
├── index.html                  # HTML5 SPA entry point & viewport meta
├── vite.config.js              # Vite configuration & server options
├── vercel.json                 # Vercel SPA rewrite deployment config
├── package.json                # Project dependencies (Vite, Chart.js)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules (node_modules, dist, .env)
├── SYSTEM_DESIGN.md            # System design write-up (800 words max)
├── README.md                   # Comprehensive project documentation
├── society-bg.jpg              # Asset background image
└── src/
    ├── main.js                 # Application bootstrap & route declarations
    ├── router.js               # Hash-based SPA router with auth/role guards
    ├── store.js                # Reactive pub/sub store & session manager
    ├── api.js                  # Asynchronous REST API service (localStorage)
    ├── utils.js                # Formatting, date helpers, sanitization, debounce
    ├── assets/
    │   └── icons.js            # Scalable SVG icon library
    ├── components/
    │   ├── layout/
    │   │   └── AppShell.js     # Sidebar, top header, notification bell, mobile nav
    │   └── ui/
    │       ├── Modal.js        # Accessible modal dialog & confirm dialogs
    │       ├── Toast.js        # Animated toast notifications (success/error/info)
    │       └── NotificationModal.js # Notification hub & transactional email viewer
    ├── pages/
    │   ├── LoginPage.js        # Auth: Sign in (Resident/Admin tabs & Google OAuth)
    │   ├── RegisterPage.js     # Auth: Resident registration
    │   ├── admin/
    │   │   ├── AdminDashboard.js       # Admin overview & charts
    │   │   ├── AdminComplaints.js      # Filterable complaints table (Date/Category/Status)
    │   │   ├── AdminComplaintDetail.js # Status & priority update with audit notes
    │   │   ├── AdminOverdue.js         # Configurable SLA threshold & overdue tracker
    │   │   ├── AdminNotices.js         # Notice board CRUD & email broadcast
    │   │   └── AdminReports.js         # Resolution metrics & category breakdown
    │   └── resident/
    │       ├── ResidentDashboard.js    # Personal stats, recent complaints, bylaws
    │       ├── MyComplaints.js         # Resident complaint table & search
    │       ├── ComplaintDetail.js      # Individual complaint view & history timeline
    │       ├── NewComplaint.js         # Complaint creation & photo upload handler
    │       └── NoticeBoard.js          # Resident view of pinned & standard notices
    └── styles/
        ├── variables.css       # Design tokens (colors, typography, spacing, radius)
        ├── reset.css           # CSS reset & box sizing
        ├── global.css          # Core layout utilities, cards, tables, badges
        └── components.css      # Component styling, animations, lightbox, responsive
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kotarohith45/Society-Maintenance-Track.git
   cd Society-Maintenance-Track
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled production output will be generated in `/dist`.

6. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment

This application is pre-configured for one-click deployment on **Vercel**, **Render**, or **Railway**.

### Vercel Deployment Config (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📡 API Documentation

All API methods in `src/api.js` return standard ES6 Promises to mirror an asynchronous RESTful backend.

### 1. Authentication Endpoints

#### `apiLogin(email, password)`
- **Description**: Authenticates user credentials and establishes a session.
- **Parameters**: `email` (string), `password` (string).
- **Response**:
  ```json
  {
    "id": "USR-001",
    "name": "Yaswanth Kumar",
    "email": "yaswanth@example.com",
    "role": "resident",
    "flat": "A-404",
    "phone": "9876543210",
    "created_at": "2026-06-25T10:30:00.000Z"
  }
  ```

#### `apiRegister({ name, email, password, flat, phone })`
- **Description**: Registers a new resident account.
- **Parameters**: Object with resident registration fields.
- **Response**: Safe User object (password omitted).

#### `apiGoogleAuth(googleAccount)`
- **Description**: Authenticates or auto-provisions a resident profile via Google OAuth.

---

### 2. Complaints Management Endpoints

#### `apiGetComplaints(filters)`
- **Description**: Retrieves complaints filtered by parameters with computed SLA status and overdue prioritization.
- **Parameters**:
  - `resident_id` *(optional)*: Filter complaints for a specific resident.
  - `status` *(optional)*: `'All' | 'Open' | 'In Progress' | 'Resolved'`
  - `category` *(optional)*: `'All' | 'Plumbing' | 'Electrical' | ...`
  - `priority` *(optional)*: `'All' | 'Low' | 'Medium' | 'High'`
  - `date_range` *(optional)*: `'all' | 'today' | '7days' | '30days'`
  - `overdue` *(optional)*: `boolean` (return only SLA-breached complaints)
  - `search` *(optional)*: String search in ID, resident name, flat, description.
- **Response**: Array of enriched Complaint objects.

#### `apiGetComplaint(id)`
- **Description**: Fetches detailed information for a single complaint.
- **Parameters**: `id` (e.g. `'CMP-1042'`).

#### `apiCreateComplaint({ resident_id, category, description, photo_url })`
- **Description**: Submits a new maintenance request, automatically creates an initial `Open` history entry, and assigns default `Low` priority.

#### `apiUpdateComplaintStatus(id, { status, note, actor_id, actor_name })`
- **Description**: Updates complaint status (`Open`, `In Progress`, `Resolved`), creates an immutable history record, and triggers transactional email dispatch to the resident.

#### `apiUpdateComplaintPriority(id, priority)`
- **Description**: Admin updates priority level (`Low`, `Medium`, `High`).

#### `apiGetComplaintHistory(complaintId)`
- **Description**: Fetches chronological lifecycle audit records for a complaint.

---

### 3. Notices & Broadcast Endpoints

#### `apiGetNotices()`
- **Description**: Fetches all society notices, sorted with pinned `is_important` notices first.

#### `apiCreateNotice({ title, description, is_important, created_by, author_name })`
- **Description**: Publishes a new notice. If `is_important` is `true`, automatically broadcasts transactional email alerts to all registered residents.

#### `apiUpdateNotice(id, updates)` / `apiDeleteNotice(id)`
- **Description**: Admin updates or deletes a society notice.

---

### 4. Notification Center & Email Hub Endpoints

#### `apiGetNotifications(userId)`
- **Description**: Retrieves in-app notifications and outbound emails for a user.

#### `apiMarkNotificationRead(id)` / `apiMarkAllNotificationsRead(userId)`
- **Description**: Updates notification read state and updates real-time header badge.

#### `apiGetUnreadNotificationCount(userId)`
- **Description**: Returns integer count of unread notifications.

---

### 5. Analytics & Settings Endpoints

#### `apiGetDashboardStats(residentId)`
- **Description**: Computes metrics: `total`, `open`, `inProgress`, `resolved`, `overdue`, and `categories` breakdown.

#### `apiGetSettings()` / `apiUpdateSettings({ overdue_threshold_days })`
- **Description**: Retrieves and configures dynamic society overdue SLA threshold.

---

## 🗄️ Database Schema & Data Models

The system architecture utilizes a normalized relational data model:

```
┌─────────────────┐       1:N       ┌────────────────────────┐
│     users       ├─────────────────┤       complaints       │
├─────────────────┤                 ├────────────────────────┤
│ id (PK)         │                 │ id (PK)                │
│ name            │                 │ resident_id (FK:users) │
│ email (UQ)      │                 │ category               │
│ password        │                 │ description            │
│ role            │                 │ photo_url              │
│ flat            │                 │ priority               │
│ phone           │                 │ status                 │
│ created_at      │                 │ created_at             │
└────────┬────────┘                 │ updated_at             │
         │                          └───────────┬────────────┘
         │ 1:N                                  │ 1:N
         │                                      ▼
         │                          ┌────────────────────────┐
         │                          │   complaint_history    │
         │                          ├────────────────────────┤
         │                          │ id (PK)                │
         │                          │ complaint_id (FK)      │
         │                          │ status                 │
         │                          │ actor_id (FK:users)    │
         │                          │ actor_name             │
         │                          │ note                   │
         │                          │ created_at             │
         │                          └────────────────────────┘
         │ 1:N
         ▼
┌────────────────────────┐          ┌────────────────────────┐
│     notifications      │          │        notices         │
├────────────────────────┤          ├────────────────────────┤
│ id (PK)                │          │ id (PK)                │
│ user_id (FK:users)     │          │ title                  │
│ recipient_email        │          │ description            │
│ type                   │          │ is_important (boolean) │
│ title                  │          │ created_by (FK:users)  │
│ message                │          │ author_name            │
│ is_read (boolean)      │          │ created_at             │
│ email_subject          │          └────────────────────────┘
│ email_body             │
│ created_at             │
└────────────────────────┘
```

### Table Definitions

#### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Unique user identifier (`USR-001`) |
| `name` | VARCHAR(128) | NOT NULL | Full user name |
| `email` | VARCHAR(128) | UNIQUE, NOT NULL | User email address |
| `password` | VARCHAR(256) | NOT NULL | User password |
| `role` | VARCHAR(16) | NOT NULL | `'resident' \| 'admin'` |
| `flat` | VARCHAR(32) | NULLABLE | Flat / Unit number (e.g. `A-404`) |
| `phone` | VARCHAR(20) | NULLABLE | Contact telephone |
| `created_at` | TIMESTAMP | NOT NULL | Registration timestamp |

#### 2. `complaints`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Unique complaint ID (`CMP-1042`) |
| `resident_id` | VARCHAR(32) | FK → users.id | Submitting resident ID |
| `category` | VARCHAR(64) | NOT NULL | Category (Plumbing, Electrical, Lift, etc.) |
| `description` | TEXT | NOT NULL | Issue description |
| `photo_url` | TEXT | NULLABLE | Base64 DataURL or CDN image URL |
| `priority` | VARCHAR(16) | DEFAULT 'Low' | `'Low' \| 'Medium' \| 'High'` |
| `status` | VARCHAR(16) | DEFAULT 'Open' | `'Open' \| 'In Progress' \| 'Resolved'` |
| `created_at` | TIMESTAMP | NOT NULL | Submission timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

#### 3. `complaint_history`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | History entry ID (`H-001`) |
| `complaint_id` | VARCHAR(32) | FK → complaints.id | Parent complaint ID |
| `status` | VARCHAR(16) | NOT NULL | Snapshot status (`Open`, `In Progress`, `Resolved`) |
| `actor_id` | VARCHAR(32) | FK → users.id | Actor user ID who executed change |
| `actor_name` | VARCHAR(128) | NOT NULL | Actor display name |
| `note` | TEXT | NULLABLE | Remarks and action notes |
| `created_at` | TIMESTAMP | NOT NULL | History entry timestamp |

#### 4. `notices`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Unique notice ID (`NTC-001`) |
| `title` | VARCHAR(256) | NOT NULL | Notice title |
| `description` | TEXT | NOT NULL | Content body |
| `is_important` | BOOLEAN | DEFAULT FALSE | Pinned priority flag |
| `created_by` | VARCHAR(32) | FK → users.id | Admin user ID |
| `author_name` | VARCHAR(128) | NOT NULL | Author display name |
| `created_at` | TIMESTAMP | NOT NULL | Publication timestamp |

#### 5. `settings`
| Column | Type | Description |
| :--- | :--- | :--- |
| `overdue_threshold_days` | INTEGER | Configurable SLA threshold in days (Default: `5`) |

#### 6. `notifications`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Notification ID (`NTF-101`) |
| `user_id` | VARCHAR(32) | FK → users.id | Recipient resident ID |
| `recipient_email` | VARCHAR(128) | NOT NULL | Email address |
| `type` | VARCHAR(32) | NOT NULL | `'complaint_status_update' \| 'important_notice'` |
| `title` | VARCHAR(256) | NOT NULL | Brief title |
| `message` | TEXT | NOT NULL | Notification body |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read indicator |
| `email_subject` | VARCHAR(256) | NOT NULL | Transactional email subject line |
| `email_body` | TEXT | NOT NULL | Full formatted email body text |
| `created_at` | TIMESTAMP | NOT NULL | Dispatch timestamp |

---

## 🧪 Verification & Testing Checklist

- [x] **Resident Registration & Login**: Successful account creation with unit assignment and role detection.
- [x] **Complaint Creation with Photo**: Upload drag-and-drop file validation (< 5MB) and preview removal.
- [x] **Complaint Status Lifecycle**: Status moves from `Open` to `In Progress` to `Resolved` with immutable audit history.
- [x] **Overdue SLA Surfacing**: Complaints open beyond threshold automatically surface at top of admin view.
- [x] **Configurable Overdue Days**: Updating threshold in Admin Settings immediately recalculates overdue flags.
- [x] **Pinned Important Notices**: Notices marked `Important` display with distinctive styling and pin to top.
- [x] **Email & In-App Notification Hub**: Status transitions and important notices generate emails with full preview.
- [x] **Interactive Analytics Dashboard**: Chart.js doughnut chart (status) and bar chart (category) render accurately.
- [x] **Search & Multi-Filter**: Filter complaints by Category, Status, Date range, and Priority.
- [x] **Responsive Mobile Layout**: Collapsible sidebar, mobile navigation bar, and responsive table cards.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
