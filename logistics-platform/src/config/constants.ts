// ============================================================================
// Application Constants
// ============================================================================

export const APP_NAME = 'SwiftLogistics'; // Placeholder - replaceable

export const PACKAGE_CATEGORIES = [
  'Documents',
  'Electronics',
  'Clothing & Fashion',
  'Food & Perishables',
  'Health & Pharmacy',
  'Household Items',
  'Books & Stationery',
  'Auto Parts',
  'Building Materials',
  'Others',
] as const;

export type PackageCategory = (typeof PACKAGE_CATEGORIES)[number];

export const VEHICLE_TYPES = [
  'Motorcycle',
  'Bicycle',
  'Car',
  'Van',
  'Truck',
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

// Nigerian states relevant to initial operations
export const SUPPORTED_STATES = [
  'Jigawa',
  'Kano',
  'Bauchi',
  'Kaduna',
  'Abuja FCT',
] as const;

// OTP Configuration
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 30;
export const OTP_MAX_ATTEMPTS = 5;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate limiting
export const TRACKING_LOOKUP_RATE_LIMIT = 10; // per minute
export const OTP_VERIFY_RATE_LIMIT = 5; // per 15 minutes
export const PAYMENT_INIT_RATE_LIMIT = 5; // per minute

// Status descriptions for public tracking
export const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'Your delivery request has been received and is awaiting confirmation.',
  confirmed: 'Your delivery has been confirmed and is awaiting rider assignment.',
  assigned: 'A rider has been assigned to your delivery.',
  accepted: 'Your assigned rider has accepted the delivery.',
  picked_up: 'Your package has been picked up.',
  in_transit: 'Your package is on its way to the destination.',
  delivered: 'Your package has been successfully delivered.',
  failed: 'There was an issue with your delivery. Please contact support.',
  cancelled: 'This delivery has been cancelled.',
  returned: 'The package is being returned.',
};

