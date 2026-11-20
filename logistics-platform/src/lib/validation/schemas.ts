// ============================================================================
// Validation Schemas - Zod schemas for all form inputs and API requests
// These are the single source of truth for input validation.
// ============================================================================

import { z } from 'zod';

// ============================================================================
// SHARED VALIDATORS
// ============================================================================

const phoneRegex = /^(\+234|0)[0-9]{10}$/;

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(phoneRegex, 'Enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)');

export const emailSchema = z
  .string()
  .email('Enter a valid email address');

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: emailSchema,
  phone: phoneSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  confirm_password: z.string(),
  account_type: z.enum(['customer', 'rider']).default('customer'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url().optional().nullable(),
});

// ============================================================================
// BUSINESS SCHEMAS
// ============================================================================

export const createBusinessSchema = z.object({
  business_name: z.string().min(2, 'Business name is required').max(200),
  business_type: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().min(5, 'Business address is required').max(500),
});

// ============================================================================
// RIDER SCHEMAS
// ============================================================================

export const riderRegistrationSchema = z.object({
  vehicle_type: z.enum(['Motorcycle', 'Bicycle', 'Car', 'Van', 'Truck'], {
    required_error: 'Vehicle type is required',
  }),
  vehicle_registration: z.string().min(1, 'Vehicle registration is required').max(50),
  license_number: z.string().optional(),
});

export const riderApprovalSchema = z.object({
  rider_profile_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  verification_notes: z.string().optional(),
});

// ============================================================================
// ADDRESS SCHEMAS
// ============================================================================

export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  contact_name: z.string().max(100).optional(),
  contact_phone: phoneSchema.optional(),
  address_text: z.string().min(5, 'Address is required').max(500),
  area: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  is_default: z.boolean().default(false),
});

// ============================================================================
// DELIVERY BOOKING SCHEMAS
// ============================================================================

export const pickupSchema = z.object({
  pickup_contact_name: z.string().min(2, 'Contact name is required').max(100),
  pickup_contact_phone: phoneSchema,
  pickup_address: z.string().min(5, 'Pickup address is required').max(500),
  pickup_area: z.string().max(100).optional(),
  pickup_city: z.string().min(1, 'City is required').max(100),
  pickup_state: z.string().min(1, 'State is required').max(100),
});

export const destinationSchema = z.object({
  recipient_name: z.string().min(2, 'Recipient name is required').max(100),
  recipient_phone: phoneSchema,
  destination_address: z.string().min(5, 'Destination address is required').max(500),
  destination_area: z.string().max(100).optional(),
  destination_city: z.string().min(1, 'City is required').max(100),
  destination_state: z.string().min(1, 'State is required').max(100),
});

export const packageSchema = z.object({
  package_description: z.string().min(3, 'Package description is required').max(500),
  package_category: z.string().min(1, 'Package category is required'),
  package_size: z.enum(['small', 'medium', 'large', 'extra_large'], {
    required_error: 'Package size is required',
  }),
  delivery_type: z.enum(['standard', 'express', 'intercity'], {
    required_error: 'Delivery type is required',
  }),
  customer_instructions: z.string().max(1000).optional(),
});

export const paymentSelectionSchema = z.object({
  payment_method: z.enum(['online', 'cash'], {
    required_error: 'Payment method is required',
  }),
});

// Combined delivery booking schema
export const createDeliverySchema = pickupSchema
  .merge(destinationSchema)
  .merge(packageSchema)
  .merge(paymentSelectionSchema);

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;

// ============================================================================
// PRICING SCHEMAS
// ============================================================================

export const pricingRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  delivery_type: z.enum(['standard', 'express', 'intercity']),
  base_fee_kobo: z.number().int().nonnegative('Base fee must be non-negative'),
  zone_surcharge_kobo: z.number().int().nonnegative().default(0),
  package_surcharge_kobo: z.number().int().nonnegative().default(0),
  express_surcharge_kobo: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  effective_from: z.string().datetime(),
  effective_until: z.string().datetime().optional().nullable(),
});

// ============================================================================
// DISPATCH SCHEMAS
// ============================================================================

export const assignRiderSchema = z.object({
  delivery_id: z.string().uuid('Invalid delivery ID'),
  rider_id: z.string().uuid('Invalid rider ID'),
  notes: z.string().max(500).optional(),
});

export const respondAssignmentSchema = z.object({
  assignment_id: z.string().uuid('Invalid assignment ID'),
  action: z.enum(['accept', 'reject']),
  notes: z.string().max(500).optional(),
});

export const updateDeliveryStatusSchema = z.object({
  delivery_id: z.string().uuid('Invalid delivery ID'),
  new_status: z.enum([
    'pending', 'confirmed', 'assigned', 'accepted',
    'picked_up', 'in_transit', 'delivered', 'failed',
    'cancelled', 'returned',
  ]),
  notes: z.string().max(500).optional(),
  otp: z.string().length(6).optional(), // Required for delivered status
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const initializePaymentSchema = z.object({
  delivery_id: z.string().uuid('Invalid delivery ID'),
});

export const recordCashCollectionSchema = z.object({
  delivery_id: z.string().uuid('Invalid delivery ID'),
  amount_kobo: z.number().int().positive('Amount must be positive'),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// TRACKING SCHEMAS
// ============================================================================

export const trackingLookupSchema = z.object({
  tracking_number: z
    .string()
    .min(1, 'Tracking number is required')
    .max(20)
    .transform((val) => val.trim().toUpperCase()),
});

// ============================================================================
// OTP SCHEMAS
// ============================================================================

export const verifyOtpSchema = z.object({
  delivery_id: z.string().uuid('Invalid delivery ID'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
});

// ============================================================================
// QUERY/FILTER SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export const deliveryFilterSchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'assigned', 'accepted',
    'picked_up', 'in_transit', 'delivered', 'failed',
    'cancelled', 'returned',
  ]).optional(),
  delivery_type: z.enum(['standard', 'express', 'intercity']).optional(),
  payment_method: z.enum(['online', 'cash']).optional(),
  search: z.string().max(100).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  customer_id: z.string().uuid().optional(),
  rider_id: z.string().uuid().optional(),
}).merge(paginationSchema);

