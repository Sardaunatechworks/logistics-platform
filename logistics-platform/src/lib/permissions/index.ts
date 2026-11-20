// ============================================================================
// Permission Helpers
// Centralized authorization checks used by server actions and middleware
// ============================================================================

import type { UserRole, DeliveryStatus } from '@/types/database';

// ============================================================================
// ROLE CHECKS
// ============================================================================

export function isAdminRole(role: UserRole): boolean {
  return role === 'operations_admin' || role === 'super_admin';
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canCreateDelivery(role: UserRole): boolean {
  return ['customer', 'merchant', 'operations_admin', 'super_admin'].includes(role);
}

export function canAssignRider(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canApproveRider(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canConfigurePricing(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canRecordCashCollection(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canManageRoles(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canViewAuditLogs(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canViewAllDeliveries(role: UserRole): boolean {
  return isAdminRole(role);
}

// ============================================================================
// DELIVERY STATUS PERMISSIONS
// ============================================================================

/**
 * Determines who can transition a delivery to a given status
 */
export function canTransitionTo(
  role: UserRole,
  newStatus: DeliveryStatus,
  isAssignedRider: boolean = false
): boolean {
  switch (newStatus) {
    case 'confirmed':
      return isAdminRole(role);
    case 'assigned':
      return isAdminRole(role);
    case 'accepted':
      return role === 'rider' && isAssignedRider;
    case 'picked_up':
      return role === 'rider' && isAssignedRider;
    case 'in_transit':
      return role === 'rider' && isAssignedRider;
    case 'delivered':
      return (role === 'rider' && isAssignedRider) || isAdminRole(role);
    case 'failed':
      return (role === 'rider' && isAssignedRider) || isAdminRole(role);
    case 'cancelled':
      return isAdminRole(role); // Customers can cancel only while pending (checked separately)
    case 'returned':
      return isAdminRole(role);
    default:
      return false;
  }
}

// ============================================================================
// ROUTE PROTECTION
// ============================================================================

const ROLE_ROUTES: Record<UserRole, string> = {
  customer: '/customer',
  merchant: '/merchant',
  rider: '/rider',
  operations_admin: '/admin',
  super_admin: '/admin',
};

export function getDashboardRoute(role: UserRole): string {
  return ROLE_ROUTES[role] || '/customer';
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith('/admin')) {
    return isAdminRole(role);
  }
  if (pathname.startsWith('/rider')) {
    return role === 'rider' || isAdminRole(role);
  }
  if (pathname.startsWith('/merchant')) {
    return role === 'merchant' || isAdminRole(role);
  }
  if (pathname.startsWith('/customer')) {
    return role === 'customer' || role === 'merchant' || isAdminRole(role);
  }
  return true; // Public routes
}

