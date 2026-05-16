<div align="center">

```
███████╗██╗     ███████╗███████╗████████╗
██╔════╝██║     ██╔════╝██╔════╝╚══██╔══╝
█████╗  ██║     █████╗  █████╗     ██║   
██╔══╝  ██║     ██╔══╝  ██╔══╝     ██║   
██║     ███████╗███████╗███████╗   ██║   
╚═╝     ╚══════╝╚══════╝╚══════╝   ╚═╝  
          D I S P A T C H   V 2          
```

### Smart Vehicle Dispatch & Fleet Management System

*Built for the **Department of Agrarian Reform — Region 10***
*by **Penta Quail** · USTP Interns*

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![Last Commit](https://img.shields.io/github/last-commit/Barjan14/FleetDispatchV2?style=flat-square&color=006205)](https://github.com/Barjan14/FleetDispatchV2/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/Barjan14/FleetDispatchV2?style=flat-square&color=006205)](https://github.com/Barjan14/FleetDispatchV2)
[![Issues](https://img.shields.io/github/issues/Barjan14/FleetDispatchV2?style=flat-square&color=d97706)](https://github.com/Barjan14/FleetDispatchV2/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Booking Lifecycle](#booking-lifecycle)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Color System](#color-system)
- [User Roles](#user-roles)
- [Team](#development-team--penta-quail)

---

## Overview

FleetDispatch V2 replaces paper-based vehicle logbooks with a **centralized, real-time platform** covering the full lifecycle of fleet operations — from employee booking requests to trip completion, fuel cost tracking, driver compliance, and exportable financial reporting.

> **Two portals. One system.**
> - 🛡️ **Admin Dashboard** — full fleet control, booking approvals, driver and vehicle management, financial records
> - 👤 **Employee Portal** — submit trip requests, track booking status, browse fleet availability

---

## Features

### 🛡️ Admin Dashboard

<table>
<tr>
<th width="200">Module</th>
<th>What it does</th>
</tr>
<tr>
<td><b>📊 Overview</b></td>
<td>Live KPI cards (vehicles, drivers, today's bookings, monthly fuel cost), booking activity feed, color-coded vehicle status grid, overdue trip alerts, and monthly trend chart</td>
</tr>
<tr>
<td><b>🚘 Vehicles</b></td>
<td>Full vehicle registry with status-coded card grid — Available, On Duty, Under Repair, Out of Service. Add, edit, and view details with linked safety checks, insurance, and repair history</td>
</tr>
<tr>
<td><b>👤 Drivers</b></td>
<td>Driver profiles with license expiry tracking and automatic color-coded warnings. Status filter: Available · On Trip · On Leave · Off Duty · Suspended</td>
</tr>
<tr>
<td><b>📅 Bookings</b></td>
<td>Employee booking inbox — approve or reject, assign vehicle + driver, mark as Ongoing and Returned. Full history with search and filters</td>
</tr>
<tr>
<td><b>🏷️ Fleets</b></td>
<td>Organize vehicles into named fleet groups for operational assignment</td>
</tr>
<tr>
<td><b>📋 Logs</b></td>
<td>Immutable audit trail of every vehicle record change — who changed what and when</td>
</tr>
<tr>
<td><b>💰 Financial</b></td>
<td>Fuel log entry with receipt image upload, filterable cost table, running totals. One-click export to <b>Excel (.xlsx)</b> or <b>PDF</b></td>
</tr>
</table>

### 👤 Employee Portal

<table>
<tr>
<th width="200">Feature</th>
<th>Description</th>
</tr>
<tr>
<td><b>📝 Booking Form</b></td>
<td>Origin, destination, purpose, departure time (auto-fills to now), and return date</td>
</tr>
<tr>
<td><b>🔔 Status Tracking</b></td>
<td>Live booking status: Pending → Approved → Ongoing → Returned / Rejected</td>
</tr>
<tr>
<td><b>🚗 Fleet View</b></td>
<td>Browse which vehicles are currently available before submitting</td>
</tr>
<tr>
<td><b>📧 Email Alerts</b></td>
<td>Automatic approval/rejection emails sent via Supabase Edge Functions</td>
</tr>
</table>

### ✨ System-Wide

- 🔒 **Role-based access** — admin credentials for the dashboard; employee portal is public
- 📖 **Built-in User Manual** — interactive step-by-step guide via the Help button, always accessible
- 📱 **Browser-based** — no app install, works on any device
- 🧾 **Zero-paper workflow** — every step from request to return is fully digital

---

## Booking Lifecycle

```
  👤 Employee submits request
           │
     ┌─────▼─────┐
     │  PENDING  │
     └─────┬─────┘
           │
     Admin reviews
           │
     ┌─────┴──────────────────────┐
     │                            │
┌────▼─────┐                ┌────▼────┐
│ APPROVED │                │REJECTED │  ◄── email sent
└────┬─────┘                └─────────┘
     │  ◄── email sent
     │ vehicle + driver assigned
     │
┌────▼─────┐
│ ONGOING  │  ◄── vehicle → On Duty · driver → On Trip
└────┬─────┘
     │
┌────▼─────┐
│ RETURNED │  ◄── vehicle → Available · driver → Available
└──────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Component UI, routing, state |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | Data storage, authentication |
| **Real-time** | Supabase Realtime | WebSocket live updates |
| **Email** | Supabase Edge Functions | Approval/rejection notifications |
| **File Storage** | Supabase Storage | Fuel receipt image uploads |
| **PDF Export** | jsPDF + jsPDF-AutoTable | Client-side PDF generation |
| **Excel Export** | SheetJS + fflate | Client-side .xlsx generation |
| **Styling** | Custom CSS | No UI framework — hand-crafted design system |
| **Deployment** | Vercel | Static hosting with CI/CD |

---

## Getting Started

### Prerequisites

- Node.js `18+`
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Clone
git clone https://github.com/Barjan14/FleetDispatchV2.git
cd FleetDispatchV2

# Install
npm install

# Configure environment
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

```bash
# Development
npm run dev

# Production build
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.jsx              # Admin shell — nav, data fetching, global CRUD
│   ├── UserDashboard.jsx               # Employee portal shell
│   ├── Login.jsx                       # Employee portal entry
│   ├── AdminLogin.jsx                  # Admin login page
│   ├── AboutModal.jsx                  # Built-in interactive user manual
│   │
│   ├── pages/
│   │   ├── OverviewPage.jsx            # Live dashboard (KPIs, bookings, vehicles, chart)
│   │   ├── BookingsPage.jsx            # Booking inbox + completed history
│   │   ├── VehiclesPage.jsx            # Vehicle card grid with status headers
│   │   ├── DriversPage.jsx             # Driver table with license expiry alerts
│   │   ├── FleetsPage.jsx              # Active trip operations and return management
│   │   ├── FinancialPage.jsx           # Fuel log entry, cost table, Excel/PDF export
│   │   └── VehicleLogsPage.jsx         # Vehicle change and trip audit logs
│   │
│   └── modals/
│       ├── BookingDetailsModal.jsx     # Full booking detail + action buttons
│       ├── VehicleDetailsModal.jsx     # Vehicle profile with linked records
│       ├── VehicleFormModal.jsx        # Add / edit vehicle
│       ├── DriverProfileFormModal.jsx  # Add / edit driver
│       ├── FuelRecordFormModal.jsx     # Fuel record entry with receipt upload
│       ├── TripLogFormModal.jsx        # Manual trip log entry
│       ├── RepairRecordFormModal.jsx   # Repair event logging
│       ├── InsuranceRecordFormModal.jsx# Insurance record management
│       ├── SafetyCheckFormModal.jsx    # Safety inspection form
│       └── UserFormModal.jsx           # System user management
│
├── styles/
│   ├── AdminDashboard.v2.css           # Main design system stylesheet
│   ├── AboutModal.css                  # Dark-theme styles for the user manual
│   ├── UserDashboard.css               # Employee portal styles
│   ├── Login.css / AdminLogin.css      # Auth page styles
│   └── Background.css                  # Global background
│
├── utils/
│   ├── vehicleLogger.js                # Vehicle change log helpers
│   ├── bookingLogger.js                # Booking status change log helpers
│   └── imageUpload.js                  # Supabase Storage upload utility
│
└── supabaseClient.js                   # Supabase client init
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `vehicles` | Fleet registry — name, plate, model, year, fuel type, condition, availability |
| `driver_profiles` | Driver info — license, expiry, status, fleet/vehicle assignment |
| `vehicle_bookings` | Booking requests — requester, origin, destination, dates, status, assignment |
| `fleets` | Fleet groupings — name and vehicle members |
| `fuel_records` | Fuel expense log — vehicle, date, liters, cost, efficiency, receipt image |
| `trip_logs` | Trip event history — linked to bookings and status changes |
| `vehicle_change_logs` | Immutable audit trail of all vehicle record modifications |
| `safety_checks` | Vehicle safety inspection records |
| `insurance_records` | Insurance policy details and renewal dates |
| `repair_records` | Repair event log — description, cost, date |

---

## Color System

The UI enforces a strict semantic color palette across all status indicators:

| Status | Swatch | Hex |
|---|---|---|
| Available / Approved | 🟢 Brand Green | `#006205` |
| On Duty | 🟩 Forest Green | `#1e5a3a` |
| Pending / Warning | 🟡 Amber | `#f59e0b` |
| Under Repair / Neutral | 🔘 Slate | `#64748b` |
| Out of Service / Rejected | 🔴 Red | `#dc2626` |

---

## User Roles

### 🛡️ Admin
- Authenticates at `/admin-login` with Supabase credentials
- Full access: vehicles, drivers, bookings, fleets, logs, financial data, user management
- Approves / rejects requests · assigns vehicle + driver · marks departures and returns

### 👤 Employee
- Accesses booking portal at `/` — **no account required**
- Submits trip requests · receives email notifications · tracks booking status

---

## Development Team — Penta Quail

<div align="center">

| | Name | Role |
|---|---|---|
| 🧑‍💻 | **Bryle** | Full-Stack Developer |
| 🎨 | **Shun** | Frontend Developer |
| ✏️ | **Ian** | UI/UX Designer |
| ⚙️ | **Rehana** | Backend Developer |
| 🧪 | **Faith** | QA & Documentation |

*Internship Capstone Project · DAR Region 10 · Cagayan de Oro City, Philippines*

</div>

---

<div align="center">

*© 2025–2026 Penta Quail · University of Science and Technology of the Philippines*
*Department of Agrarian Reform — Region 10*

</div>
