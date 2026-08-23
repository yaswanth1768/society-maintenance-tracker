<div align="center">

<br/>

> ### 🚀 &nbsp;[**LIVE — society-maintenance-track.vercel.app**](https://society-maintenance-track.vercel.app/)&nbsp; 🚀
> *Click to open the deployed app — no setup needed!*

<br/>

[![🌐 Open Live App](https://img.shields.io/badge/🌐%20Open%20Live%20App-society--maintenance--track.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0f0f23)](https://society-maintenance-track.vercel.app/)

<br/>

<img src="society-bg.jpg" alt="Society Maintenance Tracker" width="100%" style="border-radius: 12px; margin-bottom: 16px;" />

# 🏢 Society Maintenance Tracker

**A full-featured, role-based society management web app — built with zero frameworks, pure Vanilla JS.**

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-Visit%20Now-6366f1?style=for-the-badge&logo=vercel)](https://society-maintenance-track.vercel.app/)
[![Built With](https://img.shields.io/badge/Built%20With-Vanilla%20JS%20%2B%20Vite-f59e0b?style=for-the-badge&logo=javascript)](https://vitejs.dev)
[![Deployed On](https://img.shields.io/badge/Deployed%20On-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**Society Maintenance Tracker (SMT)** is a modern, Single Page Application (SPA) designed to digitize and streamline residential society operations. It provides a seamless experience for both **residents** and **admins**, eliminating paper-based complaint management and manual tracking with a real-time, data-driven dashboard.

> Built entirely with **Vanilla JavaScript**, **HTML5**, and **CSS3** — no React, no Angular, no Vue. Just fast, clean, handcrafted code.

---

## ✨ Features

### 👤 Resident Portal
| Feature | Description |
|---|---|
| 🔐 **Login / Register** | Secure credential-based authentication with role detection |
| 📊 **Personal Dashboard** | View your complaint status, maintenance history & notices |
| 📝 **Submit Complaints** | File complaints with category, priority, and optional photo |
| 📂 **My Complaints** | Track all submitted complaints with real-time status |
| 🔍 **Complaint Detail** | View full complaint history, updates, and admin comments |
| 📋 **Notice Board** | Read society notices and announcements from admin |

### 🛡️ Admin Portal
| Feature | Description |
|---|---|
| 📈 **Maintenance Overview** | Live charts: status distribution & category breakdown |
| 📊 **Analytics & Reports** | In-depth stats: resolution rates, response times, trends |
| 🚨 **Overdue Tracker** | Dedicated view for overdue & SLA-breached complaints |
| 🗂️ **Complaints Manager** | Full CRUD — filter, update status, add notes, close |
| 📣 **Notices Manager** | Create, edit & delete society-wide notices |
| 🔎 **Complaint Detail** | Deep-dive into any complaint with full audit trail |

---

## 🏗️ Architecture

```
society-maintenance/
├── index.html                  # App entry point
├── vite.config.js              # Vite bundler config
├── vercel.json                 # Vercel deployment config (SPA rewrites)
├── society-bg.jpg              # App background asset
└── src/
    ├── main.js                 # App bootstrap & route registration
    ├── router.js               # Hash-based SPA router w/ auth guards
    ├── store.js                # Lightweight event-driven state store
    ├── api.js                  # Mock REST API layer (localStorage)
    ├── utils.js                # Shared helpers & formatters
    ├── assets/
    │   └── icons.js            # SVG icon library
    ├── components/
    │   ├── layout/
    │   │   └── AppShell.js     # Sidebar + header layout shell
    │   └── ui/
    │       └── Modal.js        # Reusable modal component
    ├── pages/
    │   ├── LoginPage.js        # Auth: Login
    │   ├── RegisterPage.js     # Auth: Registration
    │   ├── admin/
    │   │   ├── AdminDashboard.js       # Charts, stats, overdue summary
    │   │   ├── AdminComplaints.js      # Complaint list + filter
    │   │   ├── AdminComplaintDetail.js # Full complaint audit view
    │   │   ├── AdminOverdue.js         # SLA breach tracker
    │   │   ├── AdminNotices.js         # Notice management
    │   │   └── AdminReports.js         # Analytics & reporting
    │   └── resident/
    │       ├── ResidentDashboard.js    # Personal overview
    │       ├── MyComplaints.js         # My complaint list
    │       ├── ComplaintDetail.js      # Individual complaint view
    │       ├── NewComplaint.js         # Submit new complaint
    │       └── NoticeBoard.js          # Read-only notice board
    └── styles/
        └── components.css      # Full design system & component styles
```

---

## 🔑 Demo Credentials

> The app uses `localStorage` as a mock backend. Data is seeded automatically on first load.

| Role | Email | Password |
|---|---|---|
| 🛡️ **Admin** | `admin@society.com` | `admin123` |
| 👤 **Resident** | `rohith@example.com` | `password123` |
| 👤 **Resident** | `priya@example.com` | `password123` |
| 👤 **Resident** | `amit@example.com` | `password123` |

---

## 🛣️ Routing

The app uses a **custom hash-based SPA router** (`#/path`) with built-in guards:

| Route | Role | Page |
|---|---|---|
| `#/login` | Guest | Login Page |
| `#/register` | Guest | Register Page |
| `#/dashboard` | Resident | Resident Dashboard |
| `#/complaints` | Resident | My Complaints |
| `#/complaints/new` | Resident | Submit Complaint |
| `#/complaints/:id` | Resident | Complaint Detail |
| `#/notices` | Resident | Notice Board |
| `#/admin/dashboard` | Admin | Admin Overview |
| `#/admin/complaints` | Admin | Manage Complaints |
| `#/admin/complaints/:id` | Admin | Complaint Detail |
| `#/admin/overdue` | Admin | Overdue Tracker |
| `#/admin/notices` | Admin | Manage Notices |
| `#/admin/reports` | Admin | Analytics & Reports |

> **Auth guards** automatically redirect unauthenticated users to `/login` and prevent role-crossing (admin ↔ resident).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/society-maintenance-tracker.git
cd society-maintenance-tracker

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be live at **`http://localhost:5173`**.

### Build for Production

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview the production build locally
```

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| **Vanilla JavaScript (ES Modules)** | Core application logic |
| **HTML5** | Semantic markup & SPA shell |
| **CSS3 (Custom Properties)** | Full design system, animations |
| **Chart.js** | Admin dashboard analytics charts |
| **Vite** | Dev server, HMR, production bundler |
| **localStorage** | Client-side mock data persistence |
| **Vercel** | Hosting & deployment (SPA rewrites) |

---

## 🧠 Key Design Decisions

- **No framework** — The entire SPA is built with plain JS using ES modules, making it blazing fast with zero runtime overhead.
- **Mock API layer** — `src/api.js` mirrors real REST endpoints and returns Promises, so swapping in a real backend is a clean, minimal change.
- **Event-driven store** — `src/store.js` implements a tiny pub/sub pattern for reactive state without any external library.
- **Hash router** — A custom router handles dynamic params (`:id`), role guards, and page cleanup (`currentCleanup`) to prevent memory leaks.
- **SLA tracking** — The overdue system automatically flags complaints breaching response SLAs, configurable via admin settings.

---

## 📦 Deployment

This project is pre-configured for **Vercel** with SPA hash-routing support:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

To deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---


## 📸 Screenshots

### 🔐 Login Page
> *Auto-generated from the live app — always up to date*

[![Login Page](https://image.thum.io/get/width/1280/crop/768/https://society-maintenance-track.vercel.app/)](https://society-maintenance-track.vercel.app/#/login)

---

### 👤 Resident Dashboard

> These pages require login — click the button to explore live:

[![View Resident Dashboard](https://img.shields.io/badge/▶%20View%20Live-Resident%20Dashboard-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/dashboard)

**Preview:** Login with `rohith@example.com` / `password123`

- 📊 Stats: Total complaints, Open, In Progress, Resolved
- 📋 Recent complaints table with priority & status badges
- 📣 Recent notices from admin
- ✅ Society Rules acknowledgement modal

---

### 📋 Society Rules & Code of Conduct

[![View Rules Modal](https://img.shields.io/badge/▶%20View%20Live-Society%20Rules%20Modal-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/dashboard)

- Quiet Hours & Noise Control rules
- Waste Segregation & Collection policy
- Parking, Amenities & Gym timings
- Monthly Maintenance Payments
- Complaint Resolution SLAs

---

### 📣 Notice Board (Resident)

[![View Notice Board](https://img.shields.io/badge/▶%20View%20Live-Notice%20Board-0891b2?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/notices)

- Water Tank Cleaning notice
- Monthly Maintenance Charges Due
- Parking Area Repainting
- Diwali Celebration Planning Meeting

---

### 📝 New Complaint Form

[![View Complaint Form](https://img.shields.io/badge/▶%20View%20Live-New%20Complaint-16a34a?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/complaints/new)

- Category selector (Plumbing, Electrical, Lift, Security…)
- Description textarea with guidance prompt
- Optional photo upload (JPG/PNG/WEBP up to 5MB)

---

### 🛡️ Admin Dashboard

[![View Admin Dashboard](https://img.shields.io/badge/▶%20View%20Live-Admin%20Dashboard-dc2626?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/admin/dashboard)

**Preview:** Login with `admin@society.com` / `admin123`

- 5 KPI cards: Total, Open, In Progress, Resolved, Overdue
- Complaints by Status — doughnut chart
- Complaints by Category — bar chart
- Overdue complaints table with days-open counter

---

### 📊 Reports & Analytics

[![View Reports](https://img.shields.io/badge/▶%20View%20Live-Reports%20%26%20Analytics-ea580c?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/admin/reports)

- Total Issues · Resolution Rate · Avg. Age · Active Overdue SLA
- Status Distribution doughnut chart
- Complaints by Priority Level bar chart
- Complaints by Department / Category bar chart

---

### 🗂️ Manage Complaints

[![View Complaints](https://img.shields.io/badge/▶%20View%20Live-Manage%20Complaints-b45309?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/admin/complaints)

- Search bar + Category / Status / Priority filters
- Full complaint table with resident name, flat, days open, overdue flag
- One-click Manage action per complaint

---

### 📣 Manage Society Notices

[![View Notices](https://img.shields.io/badge/▶%20View%20Live-Manage%20Notices-0f766e?style=for-the-badge&logo=vercel&logoColor=white)](https://society-maintenance-track.vercel.app/#/admin/notices)

- + New Notice button
- Title, Priority badge, Description, Created Date, Author columns
- Edit & Delete actions per notice

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for modern society management

**[⬆ Back to Top](#-society-maintenance-tracker)**

</div>
