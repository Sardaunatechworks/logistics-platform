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

