# Fleet Dispatch V2

A real-time fleet management system built for the **Department of Agrarian Reform (DAR Region 10)**, developed by **Penta Quail** — five interns from the University of Science and Technology of the Philippines (USTP).

---

## Overview

Fleet Dispatch V2 replaces manual vehicle logbooks with a centralized, real-time platform that manages the full lifecycle of vehicle dispatch operations — from employee booking requests to trip completion, cost tracking, and compliance reporting.

---

## Features

| Feature | Description |
|---|---|
| **Real-time Dashboard** | Live stat cards, booking calendar, active trip strip, overdue alerts, and monthly financial snapshot |
| **Booking Management** | Employee-submitted requests reviewed and approved by admins with automated email notifications |
| **Vehicle Fleet** | Complete vehicle registry with condition tracking, availability, fuel type, and odometer data |
| **Driver Profiles** | Driver management with license tracking, expiry warnings, and real-time availability statuses |
| **Fleet Operations** | Live trip monitoring — mark departures, track ongoing trips, and confirm returns |
| **Financial Data** | Monthly fuel, maintenance, and repair cost aggregation with visual breakdown charts |
| **Audit Logs** | Immutable vehicle change history and trip event logs for compliance reporting |
| **Role-based Access** | Separate admin portal and public employee request form |
| **Email Notifications** | Automated approval/rejection emails sent via Supabase Edge Functions |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Database & Auth | Supabase (PostgreSQL + Row-Level Security) |
| Real-time | Supabase Realtime (WebSocket subscriptions) |
| Email | Supabase Edge Functions (`send-approval-email`) |
| Styling | Custom CSS (no UI framework) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Barjan14/FleetDispatchV2.git
   cd FleetDispatchV2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** — create `.env` in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.jsx          # Main admin shell — navigation, data fetching, CRUD
│   ├── pages/
│   │   ├── OverviewPage.jsx        # Live dashboard: stats, calendar, active trips, finance
│   │   ├── BookingsPage.jsx        # Booking inbox (active) + completed trip history
│   │   ├── VehiclesPage.jsx        # Vehicle cards with status-coded headers
│   │   ├── DriversPage.jsx         # Driver table with license expiry tracking
│   │   ├── FleetsPage.jsx          # Active trip operations and return management
│   │   ├── FinancialPage.jsx       # Expense entry and monthly cost reports
│   │   └── VehicleLogsPage.jsx     # Vehicle change and trip audit logs
│   ├── modals/
│   │   ├── BookingDetailsModal.jsx # Full booking detail view
│   │   ├── VehicleDetailsModal.jsx # Vehicle detail with status banner
│   │   ├── VehicleFormModal.jsx    # Add / edit vehicle form
│   │   └── DriverProfileFormModal.jsx # Add / edit driver form
│   └── AboutModal.jsx              # System info, team profiles, and user guide
├── styles/
│   ├── AdminDashboard.v2.css       # Main stylesheet (custom design system)
│   └── AboutModal.css              # About modal dark-theme styles
├── utils/
│   └── vehicleLogger.js            # Vehicle change log helpers
└── supabaseClient.js               # Supabase client initialization
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `vehicles` | Fleet registry — name, plate, model, year, fuel type, condition, availability |
| `driver_profiles` | Driver info — license number/type/expiry, availability, assigned vehicle |
| `vehicle_bookings` | Booking requests — requester, destination, dates, status, vehicle/driver assignment |
| `fleets` | Fleet groupings — name, vehicle members |
| `fuel_records` | Fuel expense log — vehicle, date, liters, cost |
| `maintenance_costs` | Scheduled maintenance cost entries |
| `repair_records` | Repair event log — issue description, cost, date |
| `trip_logs` | Automated trip event history |
| `vehicle_change_logs` | Automated vehicle modification audit trail |

---

## User Roles

### Admin
- Logs in at `/admin-login` using Supabase credentials
- Full access: manage vehicles, drivers, bookings, fleets, finances, and logs
- Approves or rejects booking requests and assigns vehicle + driver
- Marks trips as ongoing and returned

### Employee (Public)
- Accesses the booking form at `/` or `/user` — **no account required**
- Submits vehicle requests with destination, purpose, passenger count, and schedule
- Receives automated email notification on approval or rejection

---

## Booking Lifecycle

```
Employee submits request
        ↓
  Status: Pending
        ↓
Admin assigns vehicle + driver → Approves/Rejects
        ↓                              ↓
  Status: Approved             Status: Rejected
  (email sent)                  (email sent)
        ↓
Admin marks departure
        ↓
  Status: Ongoing
  (vehicle → On Duty, driver → On Trip)
        ↓
Admin marks return
        ↓
  Status: Returned
  (vehicle → Available, driver → Available)
```

---

## Color System

The UI uses a strict four-color semantic palette:

| Color | Hex | Meaning |
|---|---|---|
| Brand Green | `#006205` | Available / Approved / Good |
| Amber | `#d97706` | Active / On Trip / Warning |
| Red | `#dc2626` | Critical / Rejected / Out of Service |
| Slate | `#64748b` | Neutral / Completed / Under Repair |

---

## Development Team — Penta Quail

| Name | Role |
|---|---|
| Bryle | Full-Stack Developer |
| Shun | Frontend Developer |
| Ian | UI/UX Designer |
| Rehana | Backend Developer |
| Faith | QA & Documentation |

Developed as an internship capstone project at **DAR Region 10**, Cagayan de Oro City.

---

© 2025 Penta Quail · USTP — Department of Agrarian Reform Region 10
