# Logistics & Delivery Management Platform

## Product Requirements Document (PRD), Technical Requirements Document (TRD), UI/UX Design Guide & Implementation Prompt

**Document version:** 1.0\
**Product version:** MVP 1.0\
**Status:** Development baseline\
**Initial market:** Dutse, Jigawa State, Nigeria\
**Business model:** Hybrid logistics operations and future logistics
SaaS\
**Application format:** Responsive web application\
**Payment methods:** Online payment and cash\
**Tracking model:** Tracking reference and status timeline\
**Proposed stack:** Next.js, TypeScript, Tailwind CSS, Supabase,
PostgreSQL, Paystack

------------------------------------------------------------------------

# PART I --- PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Product overview

The product is a web-based logistics and delivery management platform
that coordinates delivery requests, customers, merchants, riders,
dispatch operations, shipment status, and payment records.

The first release will support the company's own delivery operations in
Dutse. The architecture should be designed so that a future release can
support additional operating locations and independent logistics
businesses through a multi-tenant SaaS model.

The MVP prioritizes a complete, dependable delivery workflow over
advanced automation.

### 1.1 Product vision

Make local and intercity parcel delivery easier to request, coordinate,
track, and verify through a reliable digital platform.

### 1.2 Product goals

1.  Allow customers and merchants to submit delivery requests.
2.  Allow administrators to review requests and manually assign riders.
3.  Allow riders to accept assignments and update delivery progress.
4.  Give customers a tracking reference and clear status timeline.
5.  Support online payments and cash collection.
6.  Record delivery, assignment, payment, and administrative activity.
7.  Provide an operational foundation that can be improved using
    real-world feedback.

### 1.3 Success measures

The MVP should measure:

-   Number of delivery requests created.
-   Number and percentage of successfully completed deliveries.
-   Delivery failure and cancellation rates.
-   Average time from request to rider assignment.
-   Average delivery completion time.
-   Revenue and direct cost per delivery.
-   Repeat customer and active merchant rates.
-   Active and productive riders.
-   Payment reconciliation discrepancies.
-   Customer complaints and resolution time.

Do not treat registrations, page views, or dashboard counters as
evidence of business success on their own.

## 2. Target users

### 2.1 Customer

An individual who requests a parcel or item to be collected and
delivered.

Needs: - Simple booking. - Clear price before confirmation. - Delivery
reference. - Status updates. - Payment choice. - Access to delivery
history and support.

### 2.2 Merchant

A business that regularly sends products to customers.

Needs: - Business account. - Ability to create and monitor deliveries. -
Access to business delivery history. - Payment and order records. - A
straightforward workflow for repeat deliveries.

For MVP, merchants can use the same booking workflow with
merchant-specific account access. Advanced staff management and bulk
imports are deferred.

### 2.3 Rider

A verified delivery worker who receives assignments and completes
deliveries.

Needs: - Registration and approval. - Clear assignment details. -
Ability to accept or reject assignments. - Pickup and delivery
instructions. - Simple status updates. - Earnings and completed-delivery
history.

### 2.4 Operations administrator

A staff member responsible for daily delivery operations.

Needs: - View and process delivery requests. - Assign and reassign
riders. - Approve and monitor riders. - Handle failed deliveries and
cancellations. - Record cash collection. - Review operational activity.

### 2.5 Super administrator

The trusted platform owner or authorized senior administrator.

Needs: - Full platform administration. - Manage users and staff
access. - Configure pricing and service settings. - Review payments and
audit records. - Manage operational permissions.

## 3. MVP scope

### 3.1 Included

-   Responsive public website.
-   Customer registration, login, and profile.
-   Merchant account designation.
-   Rider registration and approval.
-   Role-based dashboards.
-   Delivery booking.
-   Configurable delivery quotation.
-   Manual rider assignment and reassignment.
-   Rider assignment acceptance or rejection.
-   Delivery status updates.
-   Unique shipment tracking reference.
-   Public tracking page with limited information.
-   OTP proof of delivery.
-   Paystack online payment integration.
-   Cash payment and collection recording.
-   Payment records and basic reconciliation.
-   In-app notification records.
-   Basic operational dashboard and reports.
-   Audit logs for sensitive administrative actions.
-   Responsive layouts for desktop and mobile browsers.

### 3.2 Explicitly out of scope for MVP

-   Native Android or iOS applications.
-   Live GPS tracking.
-   AI dispatch or automatic rider matching.
-   Advanced route optimization.
-   Intercity transport marketplace.
-   Automated multi-city operations.
-   Full SaaS subscription billing and tenant self-service.
-   Warehouse management.
-   Inventory management.
-   Complex fleet maintenance.
-   Automated payroll.
-   Customer loyalty programme.
-   Advanced analytics and business intelligence.

Intercity deliveries may be entered and coordinated by an administrator
using manually managed transport or partner arrangements. The MVP must
not imply real-time vehicle tracking where none exists.

## 4. Functional requirements

### 4.1 Authentication and account management

**FR-AUTH-01:** Users can register and sign in using the supported
authentication method.

**FR-AUTH-02:** The application must use Supabase Auth. Passwords must
never be stored in application tables.

**FR-AUTH-03:** Every authenticated user must have a corresponding
profile record.

**FR-AUTH-04:** Users can update permitted profile fields.

**FR-AUTH-05:** Role assignment must be controlled by trusted
server-side processes. Public registration must never allow a user to
choose an administrative role.

**FR-AUTH-06:** Suspended or disabled accounts must not access protected
workflows.

### 4.2 Customer and merchant delivery booking

**FR-BOOK-01:** An authenticated customer or merchant can create a
delivery request.

**FR-BOOK-02:** Required booking fields include: - Pickup contact name
and phone. - Pickup address and relevant location instructions. -
Recipient name and phone. - Destination address and relevant location
instructions. - Package description. - Package category. - Package size
or weight band. - Delivery type. - Optional delivery instructions. -
Selected payment method.

**FR-BOOK-03:** The system must calculate a quote using active
administrator-configured pricing rules.

**FR-BOOK-04:** The customer must see the quote before confirming the
request.

**FR-BOOK-05:** The server must calculate and validate the final amount.
The browser must not be trusted to submit the payable amount.

**FR-BOOK-06:** On successful creation, the system generates a unique,
non-sequential tracking reference.

**FR-BOOK-07:** The system stores pickup and destination details as
snapshots on the delivery record so later edits to saved addresses do
not alter historical deliveries.

**FR-BOOK-08:** A customer can view only their own deliveries. A
merchant can view only deliveries belonging to their business, subject
to explicit business membership rules.

### 4.3 Pricing

**FR-PRICE-01:** Authorized administrators can configure pricing rules.

**FR-PRICE-02:** Pricing may include: - Base fee. - Zone or distance
component. - Package size or weight surcharge. - Express delivery
surcharge. - Other clearly described service charges.

**FR-PRICE-03:** Each quote must record the pricing rule/version and
itemized calculation used.

**FR-PRICE-04:** A confirmed delivery must retain its quoted amount even
if pricing rules change later.

**FR-PRICE-05:** If reliable distance calculation is not available in
MVP, use administrator-defined zones or a transparent base-plus-zone
pricing model. Do not fabricate distance measurements.

### 4.4 Delivery and dispatch management

**FR-DLV-01:** Administrators can view and filter delivery requests.

**FR-DLV-02:** Operations administrators can confirm eligible requests
and assign an approved rider.

**FR-DLV-03:** A rider can accept or reject an assignment.

**FR-DLV-04:** Rejected assignments return to the operations queue and
must be visible to administrators.

**FR-DLV-05:** Administrators can reassign a delivery. Previous
assignments must remain in assignment history.

**FR-DLV-06:** The system must prevent conflicting active assignments
where operational rules prohibit them.

**FR-DLV-07:** Cancellation and failed-delivery actions require a reason
and must be recorded.

### 4.5 Rider operations

**FR-RIDER-01:** Riders can submit registration and verification
information.

**FR-RIDER-02:** New riders remain pending until approved by an
authorized administrator.

**FR-RIDER-03:** Riders can view only assignments allocated to them and
the minimum customer information required to complete the job.

**FR-RIDER-04:** Riders can accept or reject offered assignments.

**FR-RIDER-05:** Riders can update permitted statuses in the approved
sequence.

**FR-RIDER-06:** Riders can view completed delivery history and an
earnings summary based on recorded settlement rules.

**FR-RIDER-07:** Rider earnings must not be assumed to equal the
delivery fee. Earnings and company revenue are separate financial
concepts.

### 4.6 Delivery status and tracking

Supported delivery statuses:

-   `pending`
-   `confirmed`
-   `assigned`
-   `accepted`
-   `picked_up`
-   `in_transit`
-   `delivered`
-   `failed`
-   `cancelled`
-   `returned`

**FR-TRACK-01:** Every delivery has a unique tracking reference.

**FR-TRACK-02:** Customers can enter the tracking reference on a public
tracking page.

**FR-TRACK-03:** Public tracking exposes only safe, limited information.
It must not expose full phone numbers, private notes, payment details,
identity documents, or precise private addresses.

**FR-TRACK-04:** Every status transition creates an immutable
status-history record containing the actor, timestamp, previous status,
new status, and optional reason.

**FR-TRACK-05:** Status transitions must be validated server-side.

**FR-TRACK-06:** The interface must clearly state that MVP tracking is
status-based and is not live GPS tracking.

### 4.7 Proof of delivery

**FR-POD-01:** A delivery can only be marked delivered after successful
OTP verification.

**FR-POD-02:** OTPs must be generated securely, expire after a
configured period, and be stored as hashes.

**FR-POD-03:** OTP attempts must be rate-limited and logged.

**FR-POD-04:** The verification endpoint must confirm that the
authenticated rider is assigned to the delivery or that an authorized
administrator is performing an approved exception.

**FR-POD-05:** OTP must never be included in public tracking responses
or ordinary application logs.

### 4.8 Payments

Supported methods: - Online payment through Paystack. - Cash payment
recorded through the operational workflow.

**FR-PAY-01:** Payment status is separate from delivery status.

**FR-PAY-02:** Online payment initialization occurs on the server using
the server-calculated amount.

**FR-PAY-03:** The server verifies the transaction with Paystack or
validates its authenticated webhook before marking it successful.

**FR-PAY-04:** Webhook processing must be idempotent. Repeated webhook
delivery must not create duplicate successful payments.

**FR-PAY-05:** A payment reference must be unique.

**FR-PAY-06:** Cash collection must be recorded by an authorized user,
with amount, collector, timestamp, and reconciliation status.

**FR-PAY-07:** Cash collection must not be confused with rider earnings
or company profit.

**FR-PAY-08:** Failed, abandoned, pending, refunded, and successful
payment states must be distinguishable.

**FR-PAY-09:** Do not store card numbers, CVV, PIN, or other sensitive
card data.

### 4.9 Notifications

MVP notification support should include an in-app notification record
for key events: - Delivery request created. - Delivery confirmed. -
Rider assigned. - Assignment accepted or rejected. - Package picked
up. - Delivery in transit. - Delivery completed or failed. - Payment
result.

Email, SMS, and push delivery can be added through providers later. The
system must not show a notification as sent if the delivery provider has
not confirmed it.

### 4.10 Administration and reporting

Administrators can: - Search deliveries by tracking reference. - Filter
by status, date, customer, rider, and payment method. - Approve or
suspend riders. - Assign and reassign riders. - Configure pricing. -
Review payment records. - Record cash collection. - Review delivery
history. - View basic counts and totals.

Dashboard totals must be calculated from real database records and must
use clearly defined date ranges and financial definitions.

## 5. Business rules

1.  Only approved and active riders can receive assignments.
2.  A suspended rider cannot accept or progress assignments.
3.  A rider can update only deliveries assigned to them.
4.  Customer and merchant users cannot change delivery statuses.
5.  Delivery completion requires valid OTP verification.
6.  Failed delivery requires a reason and may require administrator
    review.
7.  Cancellation requires authorization according to delivery state.
8.  Confirmed delivery prices are immutable except through a documented
    authorized adjustment.
9.  Payment state and delivery state are independent.
10. All sensitive actions are logged.
11. Reassignment preserves previous assignment records.
12. Public tracking must not reveal sensitive personal information.
13. Administrative role grants and changes must be audited.
14. All monetary calculations use integer kobo, not floating-point
    values.
15. All timestamps are stored in UTC and presented in the user's
    appropriate local time.

## 6. Acceptance criteria

The MVP is ready for pilot when:

-   A customer can register, request a delivery, receive a
    server-calculated quote, and view the resulting tracking reference.
-   An administrator can review the request and assign an approved
    rider.
-   A rider can accept or reject the assignment and update the delivery
    through valid statuses.
-   The customer can see the status timeline using the tracking
    reference.
-   A delivery cannot be completed without OTP verification.
-   Online payments are verified server-side.
-   Cash collections are recorded with an accountable user and
    timestamp.
-   Customers, merchants, riders, and administrators are restricted to
    their authorized data.
-   Payment webhooks are idempotent.
-   Critical workflows work on mobile and desktop browsers.
-   Error states, loading states, empty states, and validation messages
    are implemented.
-   Production secrets are not exposed to the browser.
-   Backup and recovery procedures are documented and tested.

------------------------------------------------------------------------

# PART II --- TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 7. Recommended technical architecture

### 7.1 Architecture approach

Use a modular monolithic Next.js application with Supabase as the
managed backend.

Do not introduce microservices for the MVP. Keep business logic
organized by domain so components can be separated later if actual scale
and operational needs justify it.

### 7.2 Technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Web framework           Next.js with App Router Customer, rider,
                                                  merchant, and admin
                                                  interfaces

  Language                TypeScript              Type safety

  Styling                 Tailwind CSS            Responsive design
                                                  system

  UI components           Accessible reusable     Consistent interface
                          component library       

  Backend                 Supabase                Managed backend
                                                  services

  Database                PostgreSQL              Relational data

  Authentication          Supabase Auth           User authentication

  Authorization           PostgreSQL RLS + server Data and action
                          checks                  protection

  File storage            Supabase Storage        Private rider documents
                                                  and approved assets

  Payments                Paystack                Online payments

  Hosting                 Vercel                  Web application
                                                  deployment

  Monitoring              Error monitoring and    Production diagnostics
                          structured logs         
  -----------------------------------------------------------------------

Google Maps or another mapping provider is not required for status-based
tracking MVP. If later introduced for address assistance or distance
pricing, API keys must be restricted and usage costs monitored.

### 7.3 High-level architecture

``` text
Customer / Merchant / Rider / Admin Browser
                    |
                    v
          Next.js Web Application
          - Public pages
          - Protected dashboards
          - Server actions / route handlers
                    |
          +---------+----------+
          |                    |
          v                    v
     Supabase Auth       Trusted server logic
                               |
                    +----------+----------+
                    |          |          |
                    v          v          v
                PostgreSQL  Storage   Paystack API
                    |
                    v
             RLS / Constraints /
             Database functions
```

## 8. Application structure

Recommended source structure:

``` text
logistics-platform/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── services/
│   │   │   └── track/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── merchant/
│   │   ├── rider/
│   │   ├── admin/
│   │   └── api/
│   │       ├── payments/
│   │       ├── webhooks/
│   │       └── tracking/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── delivery/
│   ├── features/
│   │   ├── auth/
│   │   ├── profiles/
│   │   ├── businesses/
│   │   ├── riders/
│   │   ├── deliveries/
│   │   ├── dispatch/
│   │   ├── pricing/
│   │   ├── payments/
│   │   ├── tracking/
│   │   └── notifications/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── permissions/
│   │   ├── validation/
│   │   ├── payments/
│   │   └── utils/
│   ├── types/
│   └── config/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── public/
├── .env.example
├── package.json
└── README.md
```

Keep route files thin. Put domain rules in feature services and trusted
server-side modules.

## 9. Database schema requirements

Use UUID primary keys unless a specific external reference is required.
Use `timestamptz` for timestamps. Store currency amounts as `bigint` in
kobo. Add `created_at` and `updated_at` where appropriate.

### 9.1 `profiles`

Purpose: Application profile linked to Supabase Auth.

  -----------------------------------------------------------------------
  Column                  Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK, references
                                                  `auth.users.id`

  full_name               text                    Required

  email                   text                    Optional or
                                                  synchronized

  phone                   text                    Normalized phone

  role                    enum/text               customer, merchant,
                                                  rider,
                                                  operations_admin,
                                                  super_admin

  account_status          enum/text               active, pending,
                                                  suspended, disabled

  created_at              timestamptz             Default now

  updated_at              timestamptz             Maintained on update
  -----------------------------------------------------------------------

Role changes must only occur through trusted administrative procedures.
Never trust role values sent from a browser.

### 9.2 `businesses`

  Column          Type          Notes
  --------------- ------------- ----------------------------
  id              uuid          PK
  owner_id        uuid          FK to profiles
  business_name   text          Required
  business_type   text          Optional
  phone           text          Contact
  email           text          Optional
  address         text          Business address
  status          text          pending, active, suspended
  created_at      timestamptz   Default now
  updated_at      timestamptz   Maintained on update

If merchant staff access is required later, introduce a
`business_memberships` table rather than adding multiple owner IDs to
this table.

### 9.3 `rider_profiles`

  Column                 Type          Notes
  ---------------------- ------------- -------------------------------------
  id                     uuid          PK
  user_id                uuid          Unique FK to profiles
  vehicle_type           text          Motorcycle, bicycle, car, van, etc.
  vehicle_registration   text          Restricted access
  verification_status    text          pending, approved, rejected
  availability_status    text          available, unavailable, suspended
  verification_notes     text          Restricted
  approved_by            uuid          FK to profiles, nullable
  approved_at            timestamptz   Nullable
  created_at             timestamptz   Default now
  updated_at             timestamptz   Maintained on update

Sensitive identity and vehicle documents should be stored in private
storage, with metadata and access restrictions.

### 9.4 `addresses`

  Column          Type          Notes
  --------------- ------------- --------------------
  id              uuid          PK
  user_id         uuid          FK to profiles
  label           text          Home, office, etc.
  contact_name    text          Optional
  contact_phone   text          Optional
  address_text    text          Required
  area            text          Optional
  city            text          Required
  state           text          Required
  latitude        numeric       Nullable
  longitude       numeric       Nullable
  created_at      timestamptz   Default now

### 9.5 `pricing_rules`

  Column                   Type          Notes
  ------------------------ ------------- ------------------------------
  id                       uuid          PK
  name                     text          Required
  delivery_type            text          standard, express, intercity
  base_fee_kobo            bigint        Non-negative
  zone_surcharge_kobo      bigint        Default 0
  package_surcharge_kobo   bigint        Default 0
  express_surcharge_kobo   bigint        Default 0
  active                   boolean       Default true
  effective_from           timestamptz   Required
  effective_until          timestamptz   Nullable
  created_by               uuid          FK to profiles
  created_at               timestamptz   Default now

For a future zone-based pricing model, introduce `service_zones` and
`zone_pricing` rather than overloading this table.

### 9.6 `deliveries`

  Column                  Type          Notes
  ----------------------- ------------- -------------------------------
  id                      uuid          PK
  tracking_number         text          Unique
  customer_id             uuid          FK to profiles
  business_id             uuid          Nullable FK to businesses
  created_by              uuid          FK to profiles
  pickup_contact_name     text          Required
  pickup_contact_phone    text          Required
  pickup_address          text          Snapshot
  pickup_area             text          Optional
  pickup_city             text          Required
  pickup_state            text          Required
  recipient_name          text          Required
  recipient_phone         text          Required
  destination_address     text          Snapshot
  destination_area        text          Optional
  destination_city        text          Required
  destination_state       text          Required
  package_description     text          Required
  package_category        text          Required
  package_size            text          Required
  delivery_type           text          standard, express, intercity
  delivery_status         text/enum     Controlled status
  payment_method          text          online, cash
  subtotal_kobo           bigint        Non-negative
  surcharge_kobo          bigint        Non-negative
  total_amount_kobo       bigint        Non-negative
  pricing_rule_id         uuid          FK to pricing_rules, nullable
  pricing_snapshot        jsonb         Itemized quote snapshot
  customer_instructions   text          Nullable
  cancellation_reason     text          Nullable
  created_at              timestamptz   Default now
  updated_at              timestamptz   Maintained on update

Do not store a single mutable current rider ID as the only assignment
record. Use the assignment history table as the source of assignment
history and derive the current active assignment safely.

### 9.7 `delivery_assignments`

  -----------------------------------------------------------------------
  Column                  Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  delivery_id             uuid                    FK to deliveries

  rider_id                uuid                    FK to profiles

  assigned_by             uuid                    FK to profiles

  assignment_status       text                    offered, accepted,
                                                  rejected, withdrawn,
                                                  completed

  assigned_at             timestamptz             Default now

  responded_at            timestamptz             Nullable

  notes                   text                    Nullable
  -----------------------------------------------------------------------

Use a transaction or database function to ensure assignment consistency
and prevent conflicting active assignments.

### 9.8 `delivery_status_history`

  Column            Type          Notes
  ----------------- ------------- --------------------------
  id                uuid          PK
  delivery_id       uuid          FK to deliveries
  previous_status   text          Nullable for first event
  new_status        text          Required
  updated_by        uuid          FK to profiles
  notes             text          Nullable
  created_at        timestamptz   Default now

Status history should be append-only for normal application users.
Corrections should be performed through an audited administrative
process.

### 9.9 `payments`

  Column                  Type          Notes
  ----------------------- ------------- --------------------------------------------------
  id                      uuid          PK
  delivery_id             uuid          FK to deliveries
  customer_id             uuid          FK to profiles
  payment_reference       text          Unique internal reference
  provider_reference      text          Nullable unique provider reference
  provider                text          paystack, cash
  method                  text          online, cash
  amount_kobo             bigint        Non-negative
  currency                text          NGN
  status                  text          pending, successful, failed, abandoned, refunded
  verified_at             timestamptz   Nullable
  collected_by            uuid          Nullable FK to profiles
  collected_at            timestamptz   Nullable
  reconciliation_status   text          pending, reconciled, disputed
  created_at              timestamptz   Default now
  updated_at              timestamptz   Maintained on update

A delivery may have multiple payment attempts. Define a clear rule for
the amount outstanding and prevent overpayment or duplicate successful
settlement.

### 9.10 `delivery_otps`

  Column          Type          Notes
  --------------- ------------- ------------------
  id              uuid          PK
  delivery_id     uuid          FK to deliveries
  otp_hash        text          Hash only
  expires_at      timestamptz   Required
  verified_at     timestamptz   Nullable
  attempt_count   integer       Default 0
  created_at      timestamptz   Default now

Store no plaintext OTP. Apply rate limits and invalidate or rotate codes
according to the delivery workflow.

### 9.11 `notifications`

  Column                Type          Notes
  --------------------- ------------- ----------------
  id                    uuid          PK
  user_id               uuid          FK to profiles
  title                 text          Required
  message               text          Required
  notification_type     text          Required
  related_delivery_id   uuid          Nullable FK
  read_at               timestamptz   Nullable
  created_at            timestamptz   Default now

### 9.12 `audit_logs`

  Column        Type          Notes
  ------------- ------------- ----------------------------------
  id            uuid          PK
  actor_id      uuid          Nullable FK to profiles
  action        text          Required
  entity_type   text          Required
  entity_id     uuid          Nullable
  metadata      jsonb         Avoid secrets and sensitive data
  created_at    timestamptz   Default now

Audit logs should not contain passwords, access tokens, card data,
plaintext OTPs, or unnecessary personal information.

## 10. Database relationships

``` text
auth.users
    |
    +--- profiles
            |
            +--- rider_profiles
            +--- addresses
            +--- businesses (owner)
            +--- deliveries (customer / creator)
            +--- delivery_assignments (rider / assigner)
            +--- notifications
            +--- audit_logs

businesses
    |
    +--- deliveries

deliveries
    |
    +--- delivery_assignments
    +--- delivery_status_history
    +--- payments
    +--- delivery_otps
```

## 11. Role-based access control

Apply authorization in both server-side business logic and PostgreSQL
RLS.

  ---------------------------------------------------------------------------------
  Resource/action   Customer    Merchant    Rider        Operations    Super admin
                                                         admin         
  ----------------- ----------- ----------- ------------ ------------- ------------
  Read own profile  Yes         Yes         Yes          Yes           Yes

  Create delivery   Yes         Yes         No           Yes           Yes

  Read own          Yes         Business    Assigned     Operational   All
  deliveries                    scope       only         scope         

  Update delivery   Before      Before      No           Authorized    Authorized
  details           lock, own   lock, own                              
                                business                               

  View assignment   No          No          Own          Operational   All
                                                         scope         

  Accept/reject     No          No          Own offered  Authorized    Authorized
  assignment                                job          override      override

  Update delivery   No          No          Assigned job Authorized    Authorized
  status                                    only                       

  Approve riders    No          No          No           Yes           Yes

  Configure pricing No          No          No           No            Yes

  Record cash       No          No          Only if      Yes           Yes
  collection                                explicitly                 
                                            authorized                 

  Review payment    Own limited Business    Own earnings Operational   All
  records           view        scope       summary      scope         

  Manage roles      No          No          No           No            Yes

  Read audit logs   No          No          No           Limited       Yes
  ---------------------------------------------------------------------------------

RLS policies must use stable helper functions and avoid recursive
profile-policy dependencies. Test policies using real authenticated
users for every role.

## 12. Critical server-side operations

Implement trusted server-side operations for:

1.  Create delivery and calculate quote.
2.  Confirm delivery request.
3.  Assign or reassign rider.
4.  Accept or reject assignment.
5.  Update delivery status.
6.  Generate and verify delivery OTP.
7.  Initialize Paystack payment.
8.  Verify Paystack transaction.
9.  Process Paystack webhook idempotently.
10. Record cash collection.
11. Approve or suspend rider.
12. Change role or account status.
13. Generate operational reports.

For multi-step operations, use PostgreSQL transactions or carefully
designed database functions so partial updates do not leave inconsistent
records.

## 13. Delivery state machine

Permitted transitions should be enforced on the server:

``` text
pending -> confirmed
pending -> cancelled

confirmed -> assigned
confirmed -> cancelled

assigned -> accepted
assigned -> confirmed (if assignment is withdrawn)

accepted -> picked_up
accepted -> failed

picked_up -> in_transit
picked_up -> failed

in_transit -> delivered (OTP required)
in_transit -> failed

failed -> returned (authorized workflow)
```

The exact transition policy should be centralized in one domain service
or database function. Do not duplicate different transition rules across
UI components.

A status change must atomically: - Validate the current status. -
Validate the actor's permission. - Validate the requested transition. -
Apply any OTP or payment-related requirements. - Update the delivery. -
Append status history. - Create appropriate notification records. -
Write an audit event when required.

## 14. Payment integration requirements

### Paystack

-   Initialize transactions on the server.
-   Use a server-calculated amount in kobo.
-   Generate a unique payment reference.
-   Store the reference before redirecting the customer.
-   Verify the transaction server-side.
-   Validate webhook signatures using the raw request body and the
    official provider method.
-   Make webhook processing idempotent.
-   Confirm amount, currency, reference, and delivery association.
-   Never rely only on the browser's payment callback.
-   Never expose the Paystack secret key to the client.

### Cash

-   Mark the payment as awaiting collection when the delivery is
    created.
-   Record the collector, amount, and collection time.
-   Restrict cash confirmation to an authorized workflow.
-   Reconcile cash separately from rider earnings.
-   Provide a way to record a dispute or discrepancy.

## 15. Security and privacy

-   Enable RLS on every table exposed through Supabase APIs.
-   Use least-privilege access.
-   Keep service-role keys and payment secrets server-side.
-   Validate all input using schemas.
-   Rate-limit authentication, tracking lookup, OTP, and payment
    endpoints.
-   Use private storage buckets for identity documents.
-   Use signed URLs with short expiry for approved document access.
-   Do not expose sensitive contact details on public tracking pages.
-   Use secure session handling and server-side route protection.
-   Add audit logs for privileged actions.
-   Apply data retention and deletion practices appropriate to Nigerian
    legal requirements.
-   Review applicable privacy and data protection obligations before
    launch.

## 16. API and route requirements

The following are logical endpoints; implementation may use route
handlers, server actions, or Supabase RPC where appropriate.

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Purpose
  ----------------------- ------------------------------------- -----------------------
  POST                    `/api/deliveries/quote`               Calculate a delivery
                                                                quote

  POST                    `/api/deliveries`                     Create delivery

  GET                     `/api/deliveries`                     List authorized
                                                                deliveries

  GET                     `/api/deliveries/:id`                 Retrieve authorized
                                                                delivery

  POST                    `/api/deliveries/:id/assign`          Assign rider

  POST                    `/api/assignments/:id/respond`        Accept/reject
                                                                assignment

  POST                    `/api/deliveries/:id/status`          Apply permitted status
                                                                change

  POST                    `/api/deliveries/:id/otp/generate`    Generate delivery OTP

  POST                    `/api/deliveries/:id/otp/verify`      Verify OTP

  POST                    `/api/payments/initialize`            Initialize Paystack
                                                                transaction

  GET                     `/api/payments/verify/:reference`     Verify payment

  POST                    `/api/webhooks/paystack`              Process payment webhook

  POST                    `/api/payments/:id/cash-collection`   Record authorized cash
                                                                collection

  GET                     `/api/tracking/:trackingNumber`       Return safe public
                                                                tracking data
  -------------------------------------------------------------------------------------

Every endpoint must authenticate and authorize the caller, validate
inputs, and return consistent error responses.

## 17. Environment variables

Example `.env.example`:

``` env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
```

Use the exact environment variable naming required by the selected
Supabase SDK version. Do not commit real secrets. Do not prefix secret
keys with `NEXT_PUBLIC_`.

## 18. Testing requirements

### Unit tests

-   Pricing calculations.
-   Delivery state transitions.
-   Permission helpers.
-   Tracking reference generation.
-   Payment amount validation.
-   OTP expiry and verification logic.

### Integration tests

-   Registration and profile creation.
-   Delivery creation.
-   Rider assignment.
-   Assignment acceptance and rejection.
-   Status history creation.
-   OTP verification.
-   Payment verification and webhook idempotency.
-   Cash collection recording.

### Authorization tests

-   Customer cannot read another customer's delivery.
-   Merchant cannot read another business's deliveries.
-   Rider cannot access unassigned deliveries.
-   Operations admin cannot configure restricted super-admin settings.
-   Suspended users cannot execute protected actions.
-   Public tracking does not disclose sensitive data.

### End-to-end tests

Test the complete customer-to-rider-to-delivery workflow in a staging
environment using test payment credentials.

## 19. Deployment requirements

Environments: - Local development. - Staging/testing. - Production.

Before production: - Configure separate environment secrets. - Apply
reviewed database migrations. - Configure production RLS. - Configure
Paystack live credentials and webhook. - Configure domain and HTTPS. -
Verify backups and recovery. - Configure application error monitoring. -
Run smoke and end-to-end tests. - Create the first super-admin account
through a secure bootstrap procedure.

------------------------------------------------------------------------

# PART III --- UI/UX DESIGN GUIDE

## 20. Design direction

### 20.1 Design philosophy

The interface should communicate: - Reliability. - Speed. - Clarity. -
Safety. - Professionalism. - Accessibility.

The product should look like a credible logistics and technology
business, not a generic admin template.

Use a clean, modern, operational design. Prioritize clear information
hierarchy and simple workflows over decorative elements.

### 20.2 Brand identity

The final startup name, logo, and brand identity have not yet been
finalized.

Therefore: - Use a temporary text-based wordmark. - Keep the logo area
replaceable. - Avoid hardcoding a permanent company name in shared
components. - Use neutral design tokens that can be rebranded later. -
Do not invent an established brand identity.

### 20.3 Suggested visual system

A provisional palette:

  Token          Suggested value   Usage
  -------------- ----------------- ------------------------------------
  Primary        `#1D4ED8`         Main actions and active navigation
  Primary dark   `#1E3A8A`         Hover and emphasis
  Success        `#15803D`         Completed and verified
  Warning        `#D97706`         Pending and attention
  Danger         `#DC2626`         Failed and destructive actions
  Background     `#F8FAFC`         Application background
  Surface        `#FFFFFF`         Cards and panels
  Text           `#0F172A`         Primary text
  Muted          `#64748B`         Secondary text
  Border         `#E2E8F0`         Dividers and outlines

Use semantic color tokens rather than repeating raw hex values
throughout the application. Check text contrast and do not rely on color
alone to communicate status.

### 20.4 Typography

Recommended: - Inter or a comparable readable sans-serif. - Clear
heading hierarchy. - Body text around 14--16px for desktop interfaces. -
Comfortable line height. - Tabular numerals for financial values and
dashboard metrics.

### 20.5 Spacing and components

Use a consistent spacing scale based on 4px increments.

Common components: - Buttons. - Inputs and selects. - Form labels and
validation messages. - Cards. - Tables. - Status badges. - Tabs. -
Dialogs. - Drawers. - Toast notifications. - Pagination. - Empty
states. - Loading skeletons. - Confirmation prompts.

Components must be reusable and accessible.

## 21. Information architecture

### Public website

-   Home.
-   Services.
-   How it works.
-   Track shipment.
-   Login.
-   Register.
-   Contact/support.

### Customer portal

-   Overview.
-   Book delivery.
-   My deliveries.
-   Delivery details.
-   Saved addresses.
-   Payments.
-   Profile and settings.

### Merchant portal

-   Overview.
-   Create delivery.
-   Business deliveries.
-   Delivery details.
-   Payment history.
-   Business profile.

### Rider portal

-   Overview.
-   Available/assigned jobs.
-   Assignment details.
-   Active delivery.
-   Completed deliveries.
-   Earnings.
-   Profile and verification.

### Admin portal

-   Overview.
-   Delivery management.
-   Dispatch queue.
-   Rider management.
-   Customer management.
-   Merchant management.
-   Payments and cash reconciliation.
-   Pricing configuration.
-   Reports.
-   Staff and permissions.
-   Settings and audit logs.

## 22. Key screen specifications

### 22.1 Public home page

Purpose: Explain the service and direct visitors to booking or tracking.

Sections: 1. Header with wordmark and navigation. 2. Hero with clear
delivery proposition. 3. Primary action: Book a delivery. 4. Secondary
action: Track a shipment. 5. Service categories. 6. How it works. 7.
Business/merchant call-to-action. 8. Contact and footer.

Avoid unsupported claims such as guaranteed delivery times unless the
operations team has validated them.

### 22.2 Customer dashboard

Display: - Greeting and account summary. - Primary "Book a delivery"
action. - Active delivery card. - Recent deliveries. - Payment
summary. - Tracking shortcut.

Prioritize the next action over decorative analytics.

### 22.3 Delivery booking flow

Use a clear step-based form:

**Step 1: Pickup** - Contact name. - Phone. - Address. - Area and city.

**Step 2: Destination** - Recipient. - Phone. - Destination address. -
Area and city.

**Step 3: Package** - Description. - Category. - Size/weight band. -
Delivery type. - Instructions.

**Step 4: Quote and payment** - Itemized price. - Payment method. -
Terms and confirmation.

Show field-level validation. Preserve form data when moving between
steps. Clearly distinguish a quote from a confirmed order.

### 22.4 Delivery tracking page

Display: - Tracking number. - Current status. - Visual timeline. -
Request date. - Pickup and destination summaries. - Last update time. -
Support contact.

Public tracking must not expose full private addresses, personal phone
numbers, or internal notes.

Use a vertical timeline on mobile and a clear status summary on desktop.

### 22.5 Rider dashboard

Display: - Availability or account status. - Current assignment. -
Pending assignments. - Today's completed deliveries. - Recent
activity. - Earnings summary.

The primary task should be obvious. Use large touch-friendly buttons for
assignment and delivery actions.

### 22.6 Rider delivery detail

Display: - Tracking reference. - Pickup contact and address. - Recipient
contact and address. - Package description. - Instructions. - Current
status. - Primary next action.

Show sensitive customer details only to the assigned rider and only when
necessary for fulfilment.

### 22.7 Admin dashboard

Display: - Total deliveries for a selected period. - Pending requests. -
Deliveries awaiting assignment. - Active deliveries. - Completed
deliveries. - Failed/cancelled deliveries. - Active riders. - Payment
summary.

Include: - Date filters. - Search. - Recent activity. - Operational
alerts. - Quick links to dispatch and delivery management.

Do not use fabricated metrics or hardcoded chart data.

### 22.8 Dispatch queue

This is one of the most important operational screens.

Display: - Delivery reference. - Customer. - Pickup and destination
summary. - Delivery type. - Current status. - Time created. - Payment
status. - Assignment status. - Available approved riders.

Allow authorized administrators to: - Assign a rider. - Reassign a
rider. - Review rider availability. - View assignment history.

Confirm consequential actions and show success or failure feedback.

### 22.9 Payment and reconciliation screen

Display: - Transaction reference. - Delivery reference. - Customer. -
Payment method. - Amount. - Payment status. - Collection or verification
time. - Collector, where applicable. - Reconciliation status.

Separate online payment verification from cash collection. Do not label
a pending payment as revenue received.

## 23. Responsive design requirements

### Desktop

-   Persistent sidebar for protected dashboards.
-   Clear page header and action area.
-   Tables with filters and pagination.
-   Dashboard cards in a consistent grid.

### Tablet

-   Collapsible navigation.
-   Responsive cards.
-   Tables that can scroll or adapt into compact rows.

### Mobile

-   Compact navigation or mobile menu.
-   Single-column content.
-   Touch targets ideally at least 44px.
-   Forms that fit narrow screens.
-   Sticky primary action only where it does not obscure content.
-   Tables transformed into readable cards when appropriate.

Customer and rider workflows must be comfortable on a mobile browser.

## 24. Interaction and accessibility standards

-   Every input has a visible label.
-   Keyboard navigation works.
-   Focus indicators are visible.
-   Validation errors explain how to correct the issue.
-   Destructive actions require confirmation.
-   Loading states prevent accidental duplicate submissions.
-   Buttons show disabled and processing states.
-   Empty states explain the next useful action.
-   Status labels use text and not color alone.
-   Dialogs are keyboard accessible.
-   Respect reduced-motion preferences.
-   Use semantic HTML and accessible form controls.

## 25. Design handoff requirements

For each screen, design: - Default state. - Loading state. - Empty
state. - Error state. - Success state. - Disabled state. - Mobile
layout. - Desktop layout.

Deliverables should include: - Design tokens. - Typography and spacing
system. - Component library. - Navigation map. - Main user flows. -
High-fidelity key screens. - Responsive behavior. - Interaction notes. -
Developer handoff specifications.

------------------------------------------------------------------------

# PART IV --- MASTER IMPLEMENTATION PROMPT

## 26. Instructions for the AI coding agent or development team

The following prompt is intended to be used as the master implementation
brief in an AI coding assistant or shared with a software engineering
team.

------------------------------------------------------------------------

## MASTER PROMPT

You are acting as a senior full-stack software engineer, solution
architect, database engineer, security engineer, and UI/UX
implementation specialist.

Your task is to design and implement a production-conscious MVP for a
Logistics and Delivery Management Platform.

The product will initially operate in Dutse, Jigawa State, Nigeria.

You must follow the requirements in this document. Treat the PRD, TRD,
UI/UX guide, business rules, database design, and acceptance criteria as
the authoritative product specification.

### A. Product objective

Build a functional, responsive web application that allows:

1.  Customers to request and track deliveries.
2.  Merchants to manage their business deliveries.
3.  Riders to receive and fulfil assigned delivery requests.
4.  Administrators to manage riders, deliveries, dispatch, pricing, and
    payment records.
5.  Customers to pay online or through cash collection workflows.

This is a real operational MVP, not a static prototype.

### B. Required technology stack

Use: - Next.js with App Router. - TypeScript with strict type
checking. - Tailwind CSS. - Supabase Auth. - Supabase PostgreSQL. -
Supabase Storage. - Supabase Realtime only where genuinely needed. -
Paystack for online payments. - Vercel for deployment.

Use current stable, mutually compatible package versions. Check official
documentation for APIs that may have changed.

Do not introduce unnecessary technologies or services.

### C. Architecture requirements

1.  Use a modular monolithic architecture.
2.  Organize code by domain and feature.
3.  Keep UI components separate from business logic.
4.  Keep privileged operations on the server.
5.  Use typed database models and validation schemas.
6.  Use database migrations as the source of truth for schema changes.
7.  Use reusable components and shared layouts.
8.  Keep environment-specific configuration outside source code.
9.  Design for future multi-tenant support without building a complete
    SaaS billing system now.
10. Do not introduce microservices for MVP.

### D. Required modules

Implement these modules in the following order:

**Module 1: Foundation** - Project setup. - Tailwind and design
tokens. - Supabase client and server utilities. - Environment
validation. - Shared layouts. - Error handling. - Logging. - Database
migration structure.

**Module 2: Authentication and authorization** - Registration. -
Login. - Logout. - Password reset. - Profile creation. - Role-aware
routing. - Protected layouts. - Account suspension handling. - RLS
policies. - Secure administrator bootstrap.

Never allow public registration to assign privileged roles.

**Module 3: Customer and merchant** - Customer dashboard. - Merchant
profile. - Delivery booking form. - Quote calculation. - Delivery
history. - Delivery detail. - Tracking reference display. - Payment
selection.

**Module 4: Admin and dispatch** - Admin dashboard. - Delivery queue. -
Search and filtering. - Rider approval. - Rider management. - Manual
assignment. - Reassignment. - Pricing configuration. - Payment review. -
Basic reports.

**Module 5: Rider** - Rider onboarding. - Rider verification state. -
Rider dashboard. - Assignment list. - Assignment acceptance/rejection. -
Pickup confirmation. - In-transit update. - OTP delivery confirmation. -
Completed delivery history. - Earnings summary based on recorded data.

**Module 6: Tracking** - Unique tracking reference. - Public tracking
lookup. - Status timeline. - Safe public response. - Status history. -
No live GPS tracking in MVP.

**Module 7: Payments** - Paystack initialization. - Server-side
verification. - Webhook verification. - Idempotent event processing. -
Cash collection records. - Payment history. - Reconciliation status.

**Module 8: Quality and deployment** - Unit tests. - Integration
tests. - RLS tests. - End-to-end tests. - Accessibility checks. -
Production configuration. - Monitoring and backup documentation.

### E. Database requirements

Implement the core tables:

-   profiles
-   businesses
-   rider_profiles
-   addresses
-   pricing_rules
-   deliveries
-   delivery_assignments
-   delivery_status_history
-   payments
-   delivery_otps
-   notifications
-   audit_logs

Follow the schema and constraints in the TRD.

Use: - UUID primary keys. - Foreign keys. - Unique constraints. - Check
constraints. - Indexes for common filters. - `timestamptz`. - Integer
kobo for monetary values. - Immutable history records. - Secure
references. - Database migrations.

Create seed data for local development only. Never seed production with
fake customer transactions or fabricated financial results.

### F. Security requirements

Security is mandatory, not optional.

-   Enable RLS on exposed tables.
-   Write and test policies for every role.
-   Validate every server request.
-   Check resource ownership and assignment.
-   Keep service-role and payment keys server-side.
-   Never trust client-submitted prices or roles.
-   Verify Paystack transactions server-side.
-   Validate webhook signatures.
-   Make webhook handling idempotent.
-   Hash OTPs.
-   Rate-limit OTP and public tracking requests.
-   Protect rider documents in private storage.
-   Audit privileged actions.
-   Avoid exposing sensitive information in logs.
-   Test direct API access, not only UI restrictions.

Do not use a broad policy that allows every authenticated user to read
or modify all records.

### G. Delivery workflow requirements

Implement the controlled delivery lifecycle:

`pending → confirmed → assigned → accepted → picked_up → in_transit → delivered`

Also support authorized failed, cancelled, and returned workflows.

Every transition must: 1. Validate the actor. 2. Validate the current
status. 3. Validate the next status. 4. Enforce required conditions. 5.
Update the delivery. 6. Insert status history. 7. Record related
activity. 8. Trigger appropriate notifications.

Use transactions or secure database functions to avoid partially applied
operations.

### H. Payment requirements

For Paystack: - Initialize from trusted server logic. - Use
server-calculated amount in kobo. - Generate unique references. - Verify
the transaction. - Validate webhook signatures. - Check amount and
currency. - Handle duplicate webhook delivery safely. - Never trust a
browser redirect as payment proof.

For cash: - Record the collection amount. - Record the responsible
collector. - Record the collection timestamp. - Maintain reconciliation
status. - Separate payment collection from rider earnings.

### I. UI/UX requirements

Follow the design guide in this document.

Build a polished, clean, professional interface with: - Consistent
design tokens. - Responsive layouts. - Reusable UI components. - Clear
navigation. - Accessible forms. - Clear status badges. - Useful loading
states. - Useful empty states. - Useful error states. - Confirmation
dialogs for consequential actions.

Do not create a generic dashboard filled with decorative charts.

Use real database-backed data. If no data exists, show a proper empty
state.

The final company name and logo are not yet finalized. Use replaceable
placeholder branding.

### J. Code quality requirements

-   TypeScript strict mode.
-   No unnecessary `any`.
-   Reusable domain services.
-   Centralized validation.
-   Consistent error handling.
-   Clear naming.
-   No duplicated business rules.
-   No hardcoded production secrets.
-   No frontend-only authorization.
-   No simulated successful payments.
-   No fake delivery records in production.
-   No non-functional buttons or links.
-   No unfinished placeholder screens presented as complete
    functionality.

Document complex business rules and security-sensitive operations.

### K. Required project documentation

Create and maintain: - `README.md` - `.env.example` - Database migration
files. - Seed instructions. - Setup instructions. - Deployment
instructions. - Architecture notes. - API documentation. - Testing
instructions. - Security notes. - Known limitations.

### L. Development execution method

Work in small, verifiable phases.

At the start: 1. Inspect the existing repository. 2. Identify existing
functionality. 3. Identify dependencies and current architecture. 4. Do
not overwrite working code without understanding it. 5. Propose an
implementation plan. 6. Identify missing credentials or decisions.

Then implement one module at a time.

For each module: 1. Explain the intended changes. 2. Implement database
changes first where appropriate. 3. Implement server-side business
logic. 4. Implement the UI. 5. Add tests. 6. Run linting and type
checks. 7. Fix errors before proceeding. 8. Document completed
functionality and remaining limitations.

Do not claim a feature works unless it has been implemented and tested.

Do not skip security work to make the UI appear complete.

### M. Completion criteria

The MVP is complete only when the following end-to-end scenario works:

1.  A customer registers.
2.  The customer creates a delivery request.
3.  The server calculates and returns a quote.
4.  The customer confirms the request and selects a payment method.
5.  An administrator reviews and assigns an approved rider.
6.  The rider accepts the assignment.
7.  The rider collects the package.
8.  The rider updates the status to in transit.
9.  The recipient provides the OTP.
10. The rider completes the delivery.
11. The customer can see the completed status through tracking.
12. The payment is correctly recorded and reconciled.
13. The complete process is available in the administrator's delivery
    history.

Also prove that unauthorized users cannot access another user's records.

### N. Final instruction

Build a real, secure, maintainable logistics application that can be
piloted with actual customers, riders, and administrators in Dutse.

Prioritize correctness, reliability, usability, and security over
unnecessary complexity.

When requirements are ambiguous, identify the ambiguity and propose the
smallest safe implementation. Do not silently invent business rules that
could affect money, privacy, rider compensation, or delivery
accountability.

Begin by inspecting the repository and producing a phased implementation
plan. Then proceed with the foundation and database package.

------------------------------------------------------------------------

# PART V --- IMPLEMENTATION GOVERNANCE

## 27. Definition of done

A feature is complete only when:

-   Its acceptance criteria are met.
-   Its database and server logic are implemented.
-   Its authorization is tested.
-   Its error and empty states are implemented.
-   Its responsive behavior is verified.
-   Its tests pass.
-   Its documentation is updated.

## 28. Release checklist

### Product

-   [ ] Customer booking works.
-   [ ] Merchant booking works.
-   [ ] Rider onboarding and approval work.
-   [ ] Manual dispatch works.
-   [ ] Status-based tracking works.
-   [ ] OTP proof of delivery works.
-   [ ] Online payment works.
-   [ ] Cash collection works.

### Technical

-   [ ] Migrations reviewed and applied.
-   [ ] RLS enabled and tested.
-   [ ] Payment webhook verified.
-   [ ] Secrets protected.
-   [ ] Database backups configured.
-   [ ] Monitoring configured.
-   [ ] Error handling tested.

### Design

-   [ ] Desktop layouts tested.
-   [ ] Mobile layouts tested.
-   [ ] Forms validated.
-   [ ] Empty states implemented.
-   [ ] Loading states implemented.
-   [ ] Accessibility reviewed.

### Operations

-   [ ] Initial administrators configured.
-   [ ] Rider onboarding procedure ready.
-   [ ] Delivery pricing configured.
-   [ ] Cash reconciliation procedure ready.
-   [ ] Customer support contact ready.
-   [ ] Pilot test completed.

## 29. Post-MVP improvement backlog

After the first working release and pilot feedback, consider:

1.  Progressive Web App installation for riders.
2.  Live GPS tracking.
3.  Automated rider assignment.
4.  Merchant bulk delivery.
5.  SMS and WhatsApp notifications.
6.  Intercity partner management.
7.  Rider payout automation.
8.  Advanced analytics.
9.  Multi-city operations.
10. Multi-tenant SaaS subscriptions.
11. Native rider application.
12. Route optimization.

These are future enhancements, not launch blockers.

------------------------------------------------------------------------

**END OF DOCUMENT**

**Logistics & Delivery Management Platform --- MVP 1.0**\
**Document package:** PRD + TRD + UI/UX Design Guide + Master
Implementation Prompt\
**Status:** Ready for technical review and phased implementation
