// ============================================================================
// Database Types - Mirrors the PostgreSQL schema
// These types are the source of truth for the application layer.
// Auto-generated types from Supabase will supplement these.
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole =
  | 'customer'
  | 'merchant'
  | 'rider'
  | 'operations_admin'
  | 'super_admin';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export type BusinessStatus = 'pending' | 'active' | 'suspended';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type AvailabilityStatus = 'available' | 'unavailable' | 'suspended';

export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'returned';

export type DeliveryType = 'standard' | 'express' | 'intercity';

export type PackageSize = 'small' | 'medium' | 'large' | 'extra_large';

export type PaymentMethod = 'online' | 'cash';

export type PaymentStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'abandoned'
  | 'refunded';

export type PaymentProvider = 'paystack' | 'cash';

export type AssignmentStatus =
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'completed';

export type ReconciliationStatus = 'pending' | 'reconciled' | 'disputed';

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  account_status: AccountStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_type: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: BusinessStatus;
  created_at: string;
  updated_at: string;
}

export interface RiderProfile {
  id: string;
  user_id: string;
  vehicle_type: string;
  vehicle_registration: string | null;
  license_number: string | null;
  id_document_url: string | null;
  vehicle_document_url: string | null;
  verification_status: VerificationStatus;
  availability_status: AvailabilityStatus;
  verification_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  address_text: string;
  area: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  delivery_type: DeliveryType;
  base_fee_kobo: number;
  zone_surcharge_kobo: number;
  package_surcharge_kobo: number;
  express_surcharge_kobo: number;
  active: boolean;
  effective_from: string;
  effective_until: string | null;
  created_by: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  tracking_number: string;
  customer_id: string;
  business_id: string | null;
  created_by: string;

  // Pickup snapshot
  pickup_contact_name: string;
  pickup_contact_phone: string;
  pickup_address: string;
  pickup_area: string | null;
  pickup_city: string;
  pickup_state: string;

  // Destination snapshot
  recipient_name: string;
  recipient_phone: string;
  destination_address: string;
  destination_area: string | null;
  destination_city: string;
  destination_state: string;

  // Package
  package_description: string;
  package_category: string;
  package_size: PackageSize;
  delivery_type: DeliveryType;
  delivery_status: DeliveryStatus;

  // Payment
  payment_method: PaymentMethod;
  subtotal_kobo: number;
  surcharge_kobo: number;
  total_amount_kobo: number;
  pricing_rule_id: string | null;
  pricing_snapshot: PricingSnapshot | null;

  // Additional
  customer_instructions: string | null;
  cancellation_reason: string | null;
  failure_reason: string | null;

  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignment {
  id: string;
  delivery_id: string;
  rider_id: string;
  assigned_by: string;
  assignment_status: AssignmentStatus;
  assigned_at: string;
  responded_at: string | null;
  notes: string | null;
}

export interface DeliveryStatusHistory {
  id: string;
  delivery_id: string;
  previous_status: DeliveryStatus | null;
  new_status: DeliveryStatus;
  updated_by: string;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  delivery_id: string;
  customer_id: string;
  payment_reference: string;
  provider_reference: string | null;
  provider: PaymentProvider;
  method: PaymentMethod;
  amount_kobo: number;
  currency: string;
  status: PaymentStatus;
  verified_at: string | null;
  collected_by: string | null;
  collected_at: string | null;
  reconciliation_status: ReconciliationStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryOtp {
  id: string;
  delivery_id: string;
  otp_hash: string;
  expires_at: string;
  verified_at: string | null;
  attempt_count: number;
  max_attempts: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  related_delivery_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================================================
// DERIVED / COMPOSITE TYPES
// ============================================================================

export interface PricingSnapshot {
  pricing_rule_id: string;
  pricing_rule_name: string;
  delivery_type: DeliveryType;
  base_fee_kobo: number;
  zone_surcharge_kobo: number;
  package_surcharge_kobo: number;
  express_surcharge_kobo: number;
  total_kobo: number;
  calculated_at: string;
}

export interface DeliveryQuote {
  delivery_type: DeliveryType;
  package_size: PackageSize;
  base_fee_kobo: number;
  zone_surcharge_kobo: number;
  package_surcharge_kobo: number;
  express_surcharge_kobo: number;
  subtotal_kobo: number;
  total_kobo: number;
  pricing_rule_id: string;
  pricing_rule_name: string;
  itemized: QuoteLineItem[];
}

export interface QuoteLineItem {
  label: string;
  amount_kobo: number;
}

export interface PublicTrackingInfo {
  tracking_number: string;
  delivery_status: DeliveryStatus;
  delivery_type: DeliveryType;
  pickup_city: string;
  pickup_state: string;
  destination_city: string;
  destination_state: string;
  created_at: string;
  status_history: PublicStatusEvent[];
}

export interface PublicStatusEvent {
  status: DeliveryStatus;
  timestamp: string;
  description: string;
}

// Delivery with related data for detail views
export interface DeliveryWithDetails extends Delivery {
  customer?: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'>;
  business?: Pick<Business, 'id' | 'business_name'>;
  assignments?: (DeliveryAssignment & {
    rider?: Pick<Profile, 'id' | 'full_name' | 'phone'>;
  })[];
  status_history?: DeliveryStatusHistory[];
  payments?: Payment[];
}

// Rider with profile for admin views
export interface RiderWithProfile extends RiderProfile {
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'account_status'>;
}

// Assignment with rider and delivery info
export interface AssignmentWithDetails extends DeliveryAssignment {
  rider?: Pick<Profile, 'id' | 'full_name' | 'phone'>;
  delivery?: Pick<Delivery, 'id' | 'tracking_number' | 'delivery_status' | 'pickup_address' | 'destination_address'>;
}

// ============================================================================
// STATUS DISPLAY HELPERS
// ============================================================================

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  accepted: 'Accepted',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: 'warning',
  confirmed: 'info',
  assigned: 'info',
  accepted: 'info',
  picked_up: 'info',
  in_transit: 'primary',
  delivered: 'success',
  failed: 'danger',
  cancelled: 'muted',
  returned: 'muted',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  successful: 'Successful',
  failed: 'Failed',
  abandoned: 'Abandoned',
  refunded: 'Refunded',
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  offered: 'Offered',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  completed: 'Completed',
};

export const PACKAGE_SIZE_LABELS: Record<PackageSize, string> = {
  small: 'Small (up to 2kg)',
  medium: 'Medium (2-5kg)',
  large: 'Large (5-15kg)',
  extra_large: 'Extra Large (15kg+)',
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  standard: 'Standard Delivery',
  express: 'Express Delivery',
  intercity: 'Intercity Delivery',
};

// ============================================================================
// SUPABASE CLIENT DATABASE GENERIC TYPE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      businesses: {
        Row: Business;
        Insert: Partial<Business> & { owner_id: string; business_name: string };
        Update: Partial<Business>;
        Relationships: [];
      };
      rider_profiles: {
        Row: RiderProfile;
        Insert: Partial<RiderProfile> & { user_id: string; vehicle_type: string };
        Update: Partial<RiderProfile>;
        Relationships: [];
      };
      addresses: {
        Row: Address;
        Insert: Partial<Address> & { user_id: string; address_text: string; city: string; state: string };
        Update: Partial<Address>;
        Relationships: [];
      };
      pricing_rules: {
        Row: PricingRule;
        Insert: Partial<PricingRule> & { name: string; delivery_type: DeliveryType; base_fee_kobo: number; created_by: string; effective_from: string };
        Update: Partial<PricingRule>;
        Relationships: [];
      };
      deliveries: {
        Row: Delivery;
        Insert: Partial<Delivery> & {
          tracking_number: string;
          customer_id: string;
          created_by: string;
          pickup_contact_name: string;
          pickup_contact_phone: string;
          pickup_address: string;
          pickup_city: string;
          pickup_state: string;
          recipient_name: string;
          recipient_phone: string;
          destination_address: string;
          destination_city: string;
          destination_state: string;
          package_description: string;
          package_category: string;
          package_size: PackageSize;
          delivery_type: DeliveryType;
          payment_method: PaymentMethod;
          subtotal_kobo: number;
          total_amount_kobo: number;
        };
        Update: Partial<Delivery>;
        Relationships: [];
      };
      delivery_assignments: {
        Row: DeliveryAssignment;
        Insert: Partial<DeliveryAssignment> & { delivery_id: string; rider_id: string; assigned_by: string };
        Update: Partial<DeliveryAssignment>;
        Relationships: [];
      };
      delivery_status_history: {
        Row: DeliveryStatusHistory;
        Insert: Partial<DeliveryStatusHistory> & { delivery_id: string; new_status: DeliveryStatus; updated_by: string };
        Update: Partial<DeliveryStatusHistory>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Partial<Payment> & { delivery_id: string; customer_id: string; payment_reference: string; provider: PaymentProvider; method: PaymentMethod; amount_kobo: number };
        Update: Partial<Payment>;
        Relationships: [];
      };
      delivery_otps: {
        Row: DeliveryOtp;
        Insert: Partial<DeliveryOtp> & { delivery_id: string; otp_hash: string; expires_at: string };
        Update: Partial<DeliveryOtp>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & { user_id: string; title: string; message: string; notification_type: string };
        Update: Partial<Notification>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Partial<AuditLog> & { action: string; entity_type: string };
        Update: Partial<AuditLog>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      delivery_status: DeliveryStatus;
      delivery_type: DeliveryType;
      package_size: PackageSize;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}


