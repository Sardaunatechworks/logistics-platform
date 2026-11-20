-- ============================================================================
-- Migration: 00001_initial_schema
-- Description: Create all core tables, enums, indexes, constraints, and 
--              helper functions for the Logistics & Delivery Management Platform
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'customer',
  'merchant',
  'rider',
  'operations_admin',
  'super_admin'
);

CREATE TYPE account_status AS ENUM (
  'active',
  'pending',
  'suspended',
  'disabled'
);

CREATE TYPE business_status AS ENUM (
  'pending',
  'active',
  'suspended'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE availability_status AS ENUM (
  'available',
  'unavailable',
  'suspended'
);

CREATE TYPE delivery_status AS ENUM (
  'pending',
  'confirmed',
  'assigned',
  'accepted',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
  'returned'
);

CREATE TYPE delivery_type AS ENUM (
  'standard',
  'express',
  'intercity'
);

CREATE TYPE package_size AS ENUM (
  'small',
  'medium',
  'large',
  'extra_large'
);

CREATE TYPE payment_method AS ENUM (
  'online',
  'cash'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'successful',
  'failed',
  'abandoned',
  'refunded'
);

CREATE TYPE payment_provider AS ENUM (
  'paystack',
  'cash'
);

CREATE TYPE assignment_status AS ENUM (
  'offered',
  'accepted',
  'rejected',
  'withdrawn',
  'completed'
);

CREATE TYPE reconciliation_status AS ENUM (
  'pending',
  'reconciled',
  'disputed'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. PROFILES
-- Application profile linked to Supabase Auth
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'customer',
  account_status account_status NOT NULL DEFAULT 'active',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_account_status ON profiles(account_status);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- 2. BUSINESSES
CREATE TABLE businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  status        business_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_status ON businesses(status);

-- 3. RIDER PROFILES
CREATE TABLE rider_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type         TEXT NOT NULL,
  vehicle_registration TEXT,
  license_number       TEXT,
  id_document_url      TEXT,  -- Private storage reference
  vehicle_document_url TEXT,  -- Private storage reference
  verification_status  verification_status NOT NULL DEFAULT 'pending',
  availability_status  availability_status NOT NULL DEFAULT 'unavailable',
  verification_notes   TEXT,
  approved_by          UUID REFERENCES profiles(id),
  approved_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rider_profiles_user ON rider_profiles(user_id);
CREATE INDEX idx_rider_profiles_verification ON rider_profiles(verification_status);
CREATE INDEX idx_rider_profiles_availability ON rider_profiles(availability_status);

-- 4. ADDRESSES
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT,              -- Home, Office, etc.
  contact_name  TEXT,
  contact_phone TEXT,
  address_text  TEXT NOT NULL,
  area          TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  latitude      NUMERIC,
  longitude     NUMERIC,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- 5. PRICING RULES
CREATE TABLE pricing_rules (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  delivery_type          delivery_type NOT NULL,
  base_fee_kobo          BIGINT NOT NULL CHECK (base_fee_kobo >= 0),
  zone_surcharge_kobo    BIGINT NOT NULL DEFAULT 0 CHECK (zone_surcharge_kobo >= 0),
  package_surcharge_kobo BIGINT NOT NULL DEFAULT 0 CHECK (package_surcharge_kobo >= 0),
  express_surcharge_kobo BIGINT NOT NULL DEFAULT 0 CHECK (express_surcharge_kobo >= 0),
  active                 BOOLEAN NOT NULL DEFAULT true,
  effective_from         TIMESTAMPTZ NOT NULL,
  effective_until        TIMESTAMPTZ,
  created_by             UUID REFERENCES profiles(id),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pricing_rules_active ON pricing_rules(active, delivery_type);
CREATE INDEX idx_pricing_rules_effective ON pricing_rules(effective_from, effective_until);

-- 6. DELIVERIES
CREATE TABLE deliveries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number       TEXT NOT NULL UNIQUE,
  customer_id           UUID NOT NULL REFERENCES profiles(id),
  business_id           UUID REFERENCES businesses(id),
  created_by            UUID NOT NULL REFERENCES profiles(id),
  
  -- Pickup snapshot
  pickup_contact_name   TEXT NOT NULL,
  pickup_contact_phone  TEXT NOT NULL,
  pickup_address        TEXT NOT NULL,
  pickup_area           TEXT,
  pickup_city           TEXT NOT NULL,
  pickup_state          TEXT NOT NULL,
  
  -- Destination snapshot
  recipient_name        TEXT NOT NULL,
  recipient_phone       TEXT NOT NULL,
  destination_address   TEXT NOT NULL,
  destination_area      TEXT,
  destination_city      TEXT NOT NULL,
  destination_state     TEXT NOT NULL,
  
  -- Package details
  package_description   TEXT NOT NULL,
  package_category      TEXT NOT NULL,
  package_size          package_size NOT NULL,
  delivery_type         delivery_type NOT NULL,
  delivery_status       delivery_status NOT NULL DEFAULT 'pending',
  
  -- Payment
  payment_method        payment_method NOT NULL,
  subtotal_kobo         BIGINT NOT NULL CHECK (subtotal_kobo >= 0),
  surcharge_kobo        BIGINT NOT NULL DEFAULT 0 CHECK (surcharge_kobo >= 0),
  total_amount_kobo     BIGINT NOT NULL CHECK (total_amount_kobo >= 0),
  pricing_rule_id       UUID REFERENCES pricing_rules(id),
  pricing_snapshot      JSONB,
  
  -- Additional
  customer_instructions TEXT,
  cancellation_reason   TEXT,
  failure_reason        TEXT,
  
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_tracking ON deliveries(tracking_number);
CREATE INDEX idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX idx_deliveries_business ON deliveries(business_id);
CREATE INDEX idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);
CREATE INDEX idx_deliveries_payment_method ON deliveries(payment_method);

-- 7. DELIVERY ASSIGNMENTS
CREATE TABLE delivery_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id       UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  rider_id          UUID NOT NULL REFERENCES profiles(id),
  assigned_by       UUID NOT NULL REFERENCES profiles(id),
  assignment_status assignment_status NOT NULL DEFAULT 'offered',
  assigned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at      TIMESTAMPTZ,
  notes             TEXT
);

CREATE INDEX idx_assignments_delivery ON delivery_assignments(delivery_id);
CREATE INDEX idx_assignments_rider ON delivery_assignments(rider_id);
CREATE INDEX idx_assignments_status ON delivery_assignments(assignment_status);

-- 8. DELIVERY STATUS HISTORY
CREATE TABLE delivery_status_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id     UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  previous_status delivery_status,
  new_status      delivery_status NOT NULL,
  updated_by      UUID NOT NULL REFERENCES profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_delivery ON delivery_status_history(delivery_id);
CREATE INDEX idx_status_history_created ON delivery_status_history(created_at DESC);

-- 9. PAYMENTS
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id           UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  customer_id           UUID NOT NULL REFERENCES profiles(id),
  payment_reference     TEXT NOT NULL UNIQUE,
  provider_reference    TEXT UNIQUE,
  provider              payment_provider NOT NULL,
  method                payment_method NOT NULL,
  amount_kobo           BIGINT NOT NULL CHECK (amount_kobo >= 0),
  currency              TEXT NOT NULL DEFAULT 'NGN',
  status                payment_status NOT NULL DEFAULT 'pending',
  verified_at           TIMESTAMPTZ,
  collected_by          UUID REFERENCES profiles(id),
  collected_at          TIMESTAMPTZ,
  reconciliation_status reconciliation_status NOT NULL DEFAULT 'pending',
  metadata              JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_delivery ON payments(delivery_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_reconciliation ON payments(reconciliation_status);

-- 10. DELIVERY OTPs
CREATE TABLE delivery_otps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id   UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  otp_hash      TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  verified_at   TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts  INTEGER NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otps_delivery ON delivery_otps(delivery_id);
CREATE INDEX idx_otps_expires ON delivery_otps(expires_at);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  message             TEXT NOT NULL,
  notification_type   TEXT NOT NULL,
  related_delivery_id UUID REFERENCES deliveries(id),
  read_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 12. AUDIT LOGS
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role (for use in RLS policies)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Get current user's account status
CREATE OR REPLACE FUNCTION get_user_account_status()
RETURNS account_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status FROM profiles WHERE id = auth.uid();
$$;

-- Check if user is an admin (operations_admin or super_admin)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('operations_admin', 'super_admin')
    AND account_status = 'active'
  );
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND account_status = 'active'
  );
$$;

-- Check if user is an active rider
CREATE OR REPLACE FUNCTION is_active_rider()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN rider_profiles rp ON rp.user_id = p.id
    WHERE p.id = auth.uid() 
    AND p.role = 'rider'
    AND p.account_status = 'active'
    AND rp.verification_status = 'approved'
  );
$$;


-- ============================================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to tables with updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_rider_profiles_updated_at
  BEFORE UPDATE ON rider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'customer'
    ),
    'active'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================================
-- DELIVERY STATUS TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_delivery_status_transition(
  current_status delivery_status,
  new_status delivery_status
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE
    -- pending transitions
    WHEN current_status = 'pending' AND new_status IN ('confirmed', 'cancelled') THEN true
    -- confirmed transitions
    WHEN current_status = 'confirmed' AND new_status IN ('assigned', 'cancelled') THEN true
    -- assigned transitions
    WHEN current_status = 'assigned' AND new_status IN ('accepted', 'confirmed') THEN true
    -- accepted transitions
    WHEN current_status = 'accepted' AND new_status IN ('picked_up', 'failed') THEN true
    -- picked_up transitions
    WHEN current_status = 'picked_up' AND new_status IN ('in_transit', 'failed') THEN true
    -- in_transit transitions
    WHEN current_status = 'in_transit' AND new_status IN ('delivered', 'failed') THEN true
    -- failed transitions
    WHEN current_status = 'failed' AND new_status = 'returned' THEN true
    ELSE false
  END;
END;
$$;


-- ============================================================================
-- TRACKING NUMBER GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  tracking TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate format: DLV-XXXXXX (6 alphanumeric chars)
    tracking := 'DLV-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
    
    SELECT EXISTS (
      SELECT 1 FROM deliveries WHERE tracking_number = tracking
    ) INTO exists_already;
    
    EXIT WHEN NOT exists_already;
  END LOOP;
  
  RETURN tracking;
END;
$$;


-- ============================================================================
-- PAYMENT REFERENCE GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ref TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    ref := 'PAY-' || upper(substr(md5(gen_random_uuid()::text), 1, 10));
    
    SELECT EXISTS (
      SELECT 1 FROM payments WHERE payment_reference = ref
    ) INTO exists_already;
    
    EXIT WHEN NOT exists_already;
  END LOOP;
  
  RETURN ref;
END;
$$;



-- ============================================================================
-- Migration: 00002_rls_policies
-- Description: Row-Level Security policies for all tables
-- Following the access matrix from TRD §11
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT USING (is_admin());

-- Riders can see minimal info (for assignment context)
-- (They see names via delivery assignments, not raw profile access)

-- Users can update their own profile (non-role fields)
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())  -- Cannot change own role
    AND account_status = (SELECT account_status FROM profiles WHERE id = auth.uid())  -- Cannot change own status
  );

-- Super admin can update any profile (including role changes)
CREATE POLICY profiles_update_super_admin ON profiles
  FOR UPDATE USING (is_super_admin());

-- Profile creation is handled by the trigger, not direct inserts
-- But allow the trigger (which runs as SECURITY DEFINER) to work
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());


-- ============================================================================
-- BUSINESSES POLICIES
-- ============================================================================

-- Owner can read their own business
CREATE POLICY businesses_select_owner ON businesses
  FOR SELECT USING (owner_id = auth.uid());

-- Admins can read all businesses
CREATE POLICY businesses_select_admin ON businesses
  FOR SELECT USING (is_admin());

-- Owner can create a business
CREATE POLICY businesses_insert_owner ON businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Owner can update their business
CREATE POLICY businesses_update_owner ON businesses
  FOR UPDATE USING (owner_id = auth.uid());

-- Admin can update business status
CREATE POLICY businesses_update_admin ON businesses
  FOR UPDATE USING (is_admin());


-- ============================================================================
-- RIDER PROFILES POLICIES
-- ============================================================================

-- Rider can read their own rider profile
CREATE POLICY rider_profiles_select_own ON rider_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all rider profiles
CREATE POLICY rider_profiles_select_admin ON rider_profiles
  FOR SELECT USING (is_admin());

-- Users with rider role can create their rider profile
CREATE POLICY rider_profiles_insert ON rider_profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND get_user_role() = 'rider'
  );

-- Riders can update their own non-verification fields
CREATE POLICY rider_profiles_update_own ON rider_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Cannot change their own verification_status
    AND verification_status = (
      SELECT verification_status FROM rider_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can update rider profiles (for approval/rejection)
CREATE POLICY rider_profiles_update_admin ON rider_profiles
  FOR UPDATE USING (is_admin());


-- ============================================================================
-- ADDRESSES POLICIES
-- ============================================================================

-- Users can CRUD their own addresses
CREATE POLICY addresses_select_own ON addresses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY addresses_insert_own ON addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY addresses_update_own ON addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY addresses_delete_own ON addresses
  FOR DELETE USING (user_id = auth.uid());

-- Admins can read addresses (for dispatch context)
CREATE POLICY addresses_select_admin ON addresses
  FOR SELECT USING (is_admin());


-- ============================================================================
-- PRICING RULES POLICIES
-- ============================================================================

-- All authenticated users can read active pricing rules (needed for quotes)
CREATE POLICY pricing_rules_select_active ON pricing_rules
  FOR SELECT USING (active = true);

-- Admins can read all pricing rules (including inactive)
CREATE POLICY pricing_rules_select_admin ON pricing_rules
  FOR SELECT USING (is_admin());

-- Only super admin can manage pricing rules
CREATE POLICY pricing_rules_insert ON pricing_rules
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY pricing_rules_update ON pricing_rules
  FOR UPDATE USING (is_super_admin());


-- ============================================================================
-- DELIVERIES POLICIES
-- ============================================================================

-- Customers can read their own deliveries
CREATE POLICY deliveries_select_customer ON deliveries
  FOR SELECT USING (customer_id = auth.uid() OR created_by = auth.uid());

-- Merchants can read deliveries for their business
CREATE POLICY deliveries_select_merchant ON deliveries
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Riders can read deliveries assigned to them (via active assignment)
CREATE POLICY deliveries_select_rider ON deliveries
  FOR SELECT USING (
    get_user_role() = 'rider'
    AND id IN (
      SELECT delivery_id FROM delivery_assignments
      WHERE rider_id = auth.uid()
      AND assignment_status IN ('offered', 'accepted')
    )
  );

-- Admins can read all deliveries
CREATE POLICY deliveries_select_admin ON deliveries
  FOR SELECT USING (is_admin());

-- Customers and merchants can create deliveries
CREATE POLICY deliveries_insert ON deliveries
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND customer_id = auth.uid()
    AND get_user_role() IN ('customer', 'merchant')
  );

-- Admins can create deliveries
CREATE POLICY deliveries_insert_admin ON deliveries
  FOR INSERT WITH CHECK (is_admin());

-- Only admins and authorized riders can update deliveries
-- (riders only for status updates on assigned deliveries via server action)
CREATE POLICY deliveries_update_admin ON deliveries
  FOR UPDATE USING (is_admin());

-- Customers can update their own deliveries only while pending
CREATE POLICY deliveries_update_customer ON deliveries
  FOR UPDATE USING (
    customer_id = auth.uid()
    AND delivery_status = 'pending'
  );


-- ============================================================================
-- DELIVERY ASSIGNMENTS POLICIES
-- ============================================================================

-- Riders can read their own assignments
CREATE POLICY assignments_select_rider ON delivery_assignments
  FOR SELECT USING (rider_id = auth.uid());

-- Admins can read all assignments
CREATE POLICY assignments_select_admin ON delivery_assignments
  FOR SELECT USING (is_admin());

-- Only admins can create assignments
CREATE POLICY assignments_insert_admin ON delivery_assignments
  FOR INSERT WITH CHECK (is_admin());

-- Riders can update their own offered assignments (accept/reject)
CREATE POLICY assignments_update_rider ON delivery_assignments
  FOR UPDATE USING (
    rider_id = auth.uid()
    AND assignment_status = 'offered'
  );

-- Admins can update assignments
CREATE POLICY assignments_update_admin ON delivery_assignments
  FOR UPDATE USING (is_admin());


-- ============================================================================
-- DELIVERY STATUS HISTORY POLICIES
-- ============================================================================

-- Customers can read status history for their deliveries
CREATE POLICY status_history_select_customer ON delivery_status_history
  FOR SELECT USING (
    delivery_id IN (
      SELECT id FROM deliveries WHERE customer_id = auth.uid()
    )
  );

-- Riders can read status history for their assigned deliveries
CREATE POLICY status_history_select_rider ON delivery_status_history
  FOR SELECT USING (
    delivery_id IN (
      SELECT delivery_id FROM delivery_assignments
      WHERE rider_id = auth.uid()
    )
  );

-- Admins can read all status history
CREATE POLICY status_history_select_admin ON delivery_status_history
  FOR SELECT USING (is_admin());

-- Status history is append-only via server actions (service role)
-- No direct insert from client
CREATE POLICY status_history_insert ON delivery_status_history
  FOR INSERT WITH CHECK (is_admin() OR get_user_role() = 'rider');


-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Customers can read their own payments
CREATE POLICY payments_select_customer ON payments
  FOR SELECT USING (customer_id = auth.uid());

-- Merchants can read payments for their business deliveries
CREATE POLICY payments_select_merchant ON payments
  FOR SELECT USING (
    delivery_id IN (
      SELECT id FROM deliveries
      WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

-- Admins can read all payments
CREATE POLICY payments_select_admin ON payments
  FOR SELECT USING (is_admin());

-- Payment creation and updates happen via server actions (service role)
-- No direct client inserts/updates for payment integrity


-- ============================================================================
-- DELIVERY OTPs POLICIES
-- ============================================================================

-- OTPs should NEVER be readable by any client
-- All OTP operations happen via server actions using service role
-- No SELECT policies for OTPs from client side


-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Notification creation happens via server actions (service role)


-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Only super admin can read audit logs
CREATE POLICY audit_logs_select_super_admin ON audit_logs
  FOR SELECT USING (is_super_admin());

-- Operations admin can read limited audit logs (not role changes)
CREATE POLICY audit_logs_select_ops_admin ON audit_logs
  FOR SELECT USING (
    get_user_role() = 'operations_admin'
    AND action NOT IN ('role_change', 'admin_bootstrap', 'staff_permission_change')
  );

-- Audit log creation happens via server actions (service role)


-- ============================================================================
-- INITIAL SEED PRICING RULES (Dutse Baseline)
-- ============================================================================

INSERT INTO pricing_rules (
  id,
  name,
  delivery_type,
  base_fee_kobo,
  zone_surcharge_kobo,
  package_surcharge_kobo,
  express_surcharge_kobo,
  active,
  effective_from
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Dutse Standard Baseline',
  'standard',
  80000, -- ₦800.00 base
  30000, -- ₦300.00 zone
  20000, -- ₦200.00 package
  0,
  true,
  now()
),
(
  '00000000-0000-0000-0000-000000000002',
  'Dutse Express Priority',
  'express',
  120000, -- ₦1,200.00 base
  30000,  -- ₦300.00 zone
  20000,  -- ₦200.00 package
  40000,  -- ₦400.00 express
  true,
  now()
),
(
  '00000000-0000-0000-0000-000000000003',
  'Jigawa Intercity Corridor',
  'intercity',
  250000, -- ₦2,500.00 base
  50000,  -- ₦500.00 zone
  40000,  -- ₦400.00 package
  0,
  true,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SCHEMA & TABLE PERMISSION GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

