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
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://darxfleetdispatch.vercel.app/?fbclid=IwY2xjawSWH4pleHRuA2FlbQIxMABicmlkETFpaDVzeWJMM3JQZ0xSMTdtc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHulZHlRhLJQjw-_EpJ95ACNKC2j-b4k_US6rCTzdanQg6dYzCZcQD2p_pzlG_aem_Mq666_OZf91An2BNN-YUPA)

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

FleetDispatch V2 is a **centralized, real-time platform** covering the full lifecycle of fleet operations — from employee booking requests to trip completion, fuel cost tracking, driver compliance, and exportable financial reporting.

> **Two portals. One system.**
> - <img src="https://api.iconify.design/bi/shield-lock-fill.svg?color=%23006205" width="14" height="14" alt=""> **Admin Dashboard** — full fleet control, booking approvals, driver and vehicle management, financial records
> - <img src="https://api.iconify.design/bi/person-fill.svg?color=%23006205" width="14" height="14" alt=""> **Employee Portal** — submit trip requests, track booking status, browse fleet availability

---

## Features

### <img src="https://api.iconify.design/bi/shield-lock-fill.svg?color=%23006205" width="18" height="18" alt=""> Admin Dashboard

<table>
<tr>
<th width="200">Module</th>
<th>What it does</th>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/speedometer2.svg?color=%23555555" width="14" height="14" alt=""> <b>Overview</b></td>
<td>Live KPI cards (total vehicles, active drivers, today's bookings, monthly fuel cost), booking activity feed, color-coded vehicle status grid, overdue trip alerts, and monthly trend chart</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/truck.svg?color=%23555555" width="14" height="14" alt=""> <b>Vehicles</b></td>
<td>Full vehicle registry with status-coded card grid — Available, On Duty, Under Repair, Out of Service. Add, edit, and view details with linked safety checks, insurance, and repair history</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/person-badge.svg?color=%23555555" width="14" height="14" alt=""> <b>Drivers</b></td>
<td>Driver profiles with license expiry tracking and automatic color-coded warnings (expires within 60 days or already expired). Status filter: Available · On Trip · On Leave · Off Duty · Suspended</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/calendar2-check.svg?color=%23555555" width="14" height="14" alt=""> <b>Bookings</b></td>
<td>Employee booking inbox — approve or reject, assign vehicle + driver, mark trips as Ongoing and Returned. Full history with search and filters</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/collection.svg?color=%23555555" width="14" height="14" alt=""> <b>Fleets</b></td>
<td>Organize vehicles into named fleet groups for operational assignment</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/journal-text.svg?color=%23555555" width="14" height="14" alt=""> <b>Logs</b></td>
<td>Immutable audit trail of every vehicle record change — who changed what and when</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/cash-coin.svg?color=%23555555" width="14" height="14" alt=""> <b>Financial</b></td>
<td>Fuel log entry with receipt image upload, filterable cost table, and running totals. One-click export to <b>Excel (.xlsx)</b> or <b>PDF</b></td>
</tr>
</table>

### <img src="https://api.iconify.design/bi/person-fill.svg?color=%23006205" width="18" height="18" alt=""> Employee Portal

<table>
<tr>
<th width="200">Feature</th>
<th>Description</th>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/pencil-square.svg?color=%23555555" width="14" height="14" alt=""> <b>Booking Form</b></td>
<td>Origin, destination, purpose, departure time (auto-fills to current time), and return date</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/arrow-left-right.svg?color=%23555555" width="14" height="14" alt=""> <b>Status Tracking</b></td>
<td>Live booking status: Pending → Approved → Ongoing → Returned / Rejected</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/eye.svg?color=%23555555" width="14" height="14" alt=""> <b>Fleet View</b></td>
<td>Browse which vehicles are currently available before submitting</td>
</tr>
<tr>
<td><img src="https://api.iconify.design/bi/envelope.svg?color=%23555555" width="14" height="14" alt=""> <b>Email Alerts</b></td>
<td>Automatic approval and rejection email notifications sent via Supabase Edge Functions</td>
</tr>
</table>

### <img src="https://api.iconify.design/bi/gear-fill.svg?color=%23006205" width="18" height="18" alt=""> System-Wide

- <img src="https://api.iconify.design/bi/lock-fill.svg?color=%23555555" width="13" height="13" alt=""> **Role-based access** — admin credentials required for the dashboard; employee portal is publicly accessible
- <img src="https://api.iconify.design/bi/book.svg?color=%23555555" width="13" height="13" alt=""> **Built-in User Manual** — interactive step-by-step guide accessible via the Help button at any time
- <img src="https://api.iconify.design/bi/globe.svg?color=%23555555" width="13" height="13" alt=""> **Browser-based** — no app install required; works on any device
- <img src="https://api.iconify.design/bi/file-earmark-x.svg?color=%23555555" width="13" height="13" alt=""> **Fully digital workflow** — every step from request to return is handled online

---

## Booking Lifecycle

```
  Employee submits request
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
| **Frontend** | React 19 + Vite 8 | Component UI, routing, state management |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | Data storage and authentication |
| **Real-time** | Supabase Realtime | WebSocket live updates |
| **Email** | Supabase Edge Functions | Approval and rejection notifications |
| **File Storage** | Supabase Storage | Fuel receipt image uploads |
| **PDF Export** | jsPDF + jsPDF-AutoTable | Client-side PDF report generation |
| **Excel Export** | fflate + file-saver | Client-side .xlsx generation |
| **Styling** | Custom CSS | Hand-crafted design system, no UI framework |
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

# Install dependencies
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
# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.jsx              # Admin shell — nav, data fetching, global CRUD
│   ├── UserDashboard.jsx               # Employee portal shell
│   ├── Dashboard.jsx                   # Shared dashboard entry component
│   ├── Login.jsx                       # Employee portal entry page
│   ├── AdminLogin.jsx                  # Admin login page
│   ├── UserForm.jsx                    # Employee booking request form
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
│       ├── BookingDetailsModal.jsx     # Full booking detail with action buttons
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
│   ├── UserForm.css                    # Booking form styles
│   ├── Login.css                       # Employee login page styles
│   ├── AdminLogin.css                  # Admin login page styles
│   └── Background.css                  # Global background styles
│
├── utils/
│   ├── vehicleLogger.js                # Vehicle change log helpers
│   ├── bookingLogger.js                # Booking status change log helpers
│   ├── exportExcel.js                  # Excel export utility
│   └── imageUpload.js                  # Supabase Storage upload utility
│
└── supabaseClient.js                   # Supabase client initialization
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `vehicles` | Fleet registry — name, plate, model, year, fuel type, condition, availability |
| `driver_profiles` | Driver info — license number, type, expiry, status, fleet/vehicle assignment |
| `vehicle_bookings` | Booking requests — requester, origin, destination, dates, status, assigned vehicle/driver |
| `fleets` | Fleet groupings — name and vehicle members |
| `fuel_records` | Fuel expense log — vehicle, date, liters, cost per liter, total cost, efficiency, receipt |
| `trip_logs` | Trip event history linked to booking status changes |
| `vehicle_change_logs` | Immutable audit trail of all vehicle record modifications |
| `safety_checks` | Vehicle safety inspection records |
| `insurance_records` | Insurance policy details and renewal dates |
| `repair_records` | Repair event log — description, cost, and date |

---

## Color System

The UI enforces a strict semantic color palette applied consistently across all status indicators:

| Color | Hex | Used For |
|---|---|---|
| <img src="https://api.iconify.design/bi/circle-fill.svg?color=%23006205" width="13" height="13" alt=""> Brand Green | `#006205` | Available · Approved · Good condition |
| <img src="https://api.iconify.design/bi/circle-fill.svg?color=%231e5a3a" width="13" height="13" alt=""> Forest Green | `#1e5a3a` | On Duty |
| <img src="https://api.iconify.design/bi/circle-fill.svg?color=%23f59e0b" width="13" height="13" alt=""> Amber | `#f59e0b` | Pending · Warning |
| <img src="https://api.iconify.design/bi/circle-fill.svg?color=%2364748b" width="13" height="13" alt=""> Slate | `#64748b` | Under Repair · Completed · Neutral |
| <img src="https://api.iconify.design/bi/circle-fill.svg?color=%23dc2626" width="13" height="13" alt=""> Red | `#dc2626` | Out of Service · Rejected · Expired |

---

## User Roles

### <img src="https://api.iconify.design/bi/shield-lock-fill.svg?color=%23006205" width="16" height="16" alt=""> Admin
- Authenticates at `/admin-login` using Supabase credentials
- Full access: vehicles, drivers, bookings, fleets, logs, financial data, user management
- Approves or rejects booking requests and assigns vehicle + driver
- Marks trips as Ongoing (departure confirmed) and Returned (vehicle back)

### <img src="https://api.iconify.design/bi/person-fill.svg?color=%23006205" width="16" height="16" alt=""> Employee
- Accesses the booking portal at `/` — **no account required**
- Submits vehicle trip requests with origin, destination, purpose, and schedule
- Receives automated email on approval or rejection
- Can view fleet availability and track their own booking status

---

## Development Team — Penta Quail

<div align="center">

| Name | Role | GitHub |
|---|---|---|
| **Bryle Jan Nacalaban** | Full-Stack Developer | [@Barjan14](https://github.com/Barjan14) |
| **Shun Cyrel Caseres** | Backend Developer | [@5huncyrel](https://github.com/5huncyrel) |
| **Ian Olandria** | UI/UX Designer | [@IyanuKwent](https://github.com/IyanuKwent) |
| **Rehana Nicole Ruilan** | Frontend Developer | [@BadGalRiirii](https://github.com/BadGalRiirii) |
| **Faith Grace Gutierrez** | QA & Documentation | [@faithgrace7](https://github.com/faithgrace7) |

*Internship Capstone Project · DAR Region 10 · Cagayan de Oro City, Philippines*

</div>

---

<div align="center">

*© 2026 Penta Quail · University of Science and Technology of the Philippines &*
*Department of Agrarian Reform — Region 10*

</div>
