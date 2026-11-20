import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAdminRole,
  isSuperAdmin,
  canCreateDelivery,
  canAssignRider,
  canApproveRider,
  canConfigurePricing,
  canAccessRoute,
  getDashboardRoute,
} from '../src/lib/permissions/index.ts';

test('Permissions - Role Privileges', () => {
  assert.equal(isAdminRole('operations_admin'), true);
  assert.equal(isAdminRole('super_admin'), true);
  assert.equal(isAdminRole('customer'), false);
  assert.equal(isAdminRole('rider'), false);

  assert.equal(isSuperAdmin('super_admin'), true);
  assert.equal(isSuperAdmin('operations_admin'), false);

  assert.equal(canCreateDelivery('customer'), true);
  assert.equal(canCreateDelivery('merchant'), true);
  assert.equal(canCreateDelivery('rider'), false); // Riders deliver, don't create customer deliveries

  assert.equal(canAssignRider('operations_admin'), true);
  assert.equal(canAssignRider('customer'), false);

  assert.equal(canApproveRider('operations_admin'), true);
  assert.equal(canApproveRider('customer'), false);

  assert.equal(canConfigurePricing('super_admin'), true);
  assert.equal(canConfigurePricing('operations_admin'), false); // Restricted to Super Admin
});

test('Permissions - Route Access Checking', () => {
  // Admin route protection
  assert.equal(canAccessRoute('operations_admin', '/admin/dispatch'), true);
  assert.equal(canAccessRoute('customer', '/admin/dispatch'), false);
  assert.equal(canAccessRoute('rider', '/admin/dispatch'), false);

  // Rider route protection
  assert.equal(canAccessRoute('rider', '/rider/active'), true);
  assert.equal(canAccessRoute('customer', '/rider/active'), false);

  // Customer route protection
  assert.equal(canAccessRoute('customer', '/customer/book'), true);
  assert.equal(canAccessRoute('operations_admin', '/customer/book'), true);

  // Public route access
  assert.equal(canAccessRoute('customer', '/track'), true);
  assert.equal(canAccessRoute('rider', '/track'), true);
});

test('Permissions - Dashboard Route Mapping', () => {
  assert.equal(getDashboardRoute('customer'), '/customer');
  assert.equal(getDashboardRoute('merchant'), '/merchant');
  assert.equal(getDashboardRoute('rider'), '/rider');
  assert.equal(getDashboardRoute('operations_admin'), '/admin');
  assert.equal(getDashboardRoute('super_admin'), '/admin');
});
