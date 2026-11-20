# SwiftLogistics — Logistics & Delivery Management Platform (MVP 1.0)

A web-based logistics and delivery operations management platform built for local and regional courier operations starting in **Dutse, Jigawa State, Nigeria**.

The platform coordinates delivery booking, automated quote calculation, manual operations dispatch, rider assignment acceptance, in-transit status progression, **OTP proof of delivery**, Paystack online payments, and cash-on-delivery reconciliation.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Web Framework** | Next.js 15 (App Router) | Responsive public, customer, rider, and admin interfaces |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety |
| **Styling** | Tailwind CSS | Consistent operational UI/UX design tokens |
| **Database** | PostgreSQL (Supabase) | 12 relational core tables with audit triggers |
| **Authentication** | Supabase Auth | Cookie-based session management via `@supabase/ssr` |
| **Authorization** | PostgreSQL RLS + Server Gates | Role-Based Access Control (Customer, Merchant, Rider, Ops Admin, Super Admin) |
| **Payments** | Paystack + Cash Workflows | Integer-kobo online transactions and audited cash collection |
| **Tracking** | Status Timeline Model | Non-sequential reference-based checkpoints (no simulated GPS) |

---

## 🏛️ Application Architecture

```
logistics-platform/
├── supabase/
│   └── migrations/
│       ├── 00001_initial_schema.sql      # Tables, enums, triggers & helper functions
│       └── 00002_rls_policies.sql        # Row-Level Security access matrix
├── src/
│   ├── app/
│   │   ├── (public)/                     # Home, Services, How It Works, Contact
│   │   ├── track/                        # Privacy-safe public shipment tracker
│   │   ├── auth/                         # Login & role-safe registration
│   │   ├── customer/                     # Customer dashboard, booking wizard & deliveries
│   │   ├── rider/                        # Rider console & touch-friendly OTP handover
│   │   ├── admin/                        # Dispatch queue, fleet management, pricing, payments
│   │   └── api/                          # Next.js Route Handlers
│   ├── components/
│   │   ├── ui/                           # Button, Input, Select, Card, Badge, EmptyState
│   │   └── layout/                       # Public Header/Footer, Role Dashboard Sidebar
│   ├── features/
│   │   ├── pricing/                      # Server-side integer-kobo quote calculation
│   │   ├── deliveries/                   # State machine & booking service
│   │   ├── dispatch/                     # Manual assignment & reassignment
│   │   ├── riders/                       # Rider responses & SHA-256 OTP verification
│   │   └── payments/                     # Paystack API & cash collection reconciliation
│   ├── lib/
│   │   ├── supabase/                     # Typed client, server, admin & middleware
│   │   ├── permissions/                  # RBAC role helpers & route authorization
│   │   ├── validation/                   # Centralized Zod schemas
│   │   └── utils/                        # Naira/kobo formatting & privacy masking
│   ├── types/                            # TypeScript database & domain models
│   └── config/                           # Environment validation & constants
└── tests/                                # Node.js native unit test suite
```

---

## ⚡ Delivery Lifecycle State Machine

Status transitions are strictly validated server-side by `src/features/deliveries/state-machine.ts`:

```
pending ──► confirmed ──► assigned ──► accepted ──► picked_up ──► in_transit ──► delivered (Requires OTP)
   │           │                                                      │
   ▼           ▼                                                      ▼
cancelled  cancelled                                                failed ──► returned
```

- **OTP Proof of Delivery**: Deliveries cannot transition to `delivered` without entering the 6-digit confirmation code provided by the recipient. The code is stored as a SHA-256 hash with automatic expiration and a 5-attempt rate limit.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20.x` or higher (tested on `v24.x`)
- Supabase Project (PostgreSQL database & Auth)
- Paystack Account (Test mode keys)

### 2. Installation
```bash
git clone <repository-url>
cd logistics-platform
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

### 4. Database Migrations
Apply the migrations in `supabase/migrations/` to your Supabase project in order:
1. `00001_initial_schema.sql` (Tables, enums, triggers, tracking generation)
2. `00002_rls_policies.sql` (Row-Level Security policies)

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Execute the unit test suite:
```bash
npm test
```
Type-check the entire codebase:
```bash
npx tsc --noEmit
```
Build for production:
```bash
npm run build
```

---

## 🔒 Security Best Practices Implemented

1. **Role Enforcement**: Public registration defaults to `customer` or `rider`. Privileged administrative roles cannot be selected from the client.
2. **Financial Integrity**: All monetary values are handled and stored as integer **kobo** (1 NGN = 100 kobo). The client browser is never trusted to calculate the payable delivery fee.
3. **Public Tracking Privacy**: The public tracking lookup endpoint (`/api/tracking/:ref`) reveals only non-sensitive checkpoint status history. Personal phone numbers, recipient street addresses, and internal notes are concealed.
4. **OTP Security**: OTP codes are hashed with a unique delivery salt before database storage. Plaintext OTPs are never exposed in logs or API responses.
5. **Idempotent Webhooks**: Paystack webhooks are signed with HMAC SHA512 and processed idempotently to prevent duplicate settlements.
