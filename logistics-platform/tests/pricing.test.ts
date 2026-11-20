import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote, createPricingSnapshot } from '../src/features/pricing/pricing-engine.ts';
import type { PricingRule } from '../src/types/database.ts';

const mockRule: PricingRule = {
  id: 'test-rule-1',
  name: 'Standard Dutse Rule',
  delivery_type: 'standard',
  base_fee_kobo: 80000, // ₦800
  zone_surcharge_kobo: 30000, // ₦300
  package_surcharge_kobo: 20000, // ₦200
  express_surcharge_kobo: 40000, // ₦400
  active: true,
  effective_from: '2026-01-01T00:00:00Z',
  effective_until: null,
  created_by: 'admin-1',
  created_at: '2026-01-01T00:00:00Z',
};

test('Pricing Engine - Standard Small Delivery', () => {
  const quote = calculateQuote({
    deliveryType: 'standard',
    packageSize: 'small',
    pricingRule: mockRule,
  });

  assert.equal(quote.base_fee_kobo, 80000);
  assert.equal(quote.express_surcharge_kobo, 0); // Not express
  assert.equal(quote.package_surcharge_kobo, 20000); // 20000 * 1.0
  assert.equal(quote.zone_surcharge_kobo, 0); // Not intercity
  assert.equal(quote.total_kobo, 100000); // ₦1,000.00
});

test('Pricing Engine - Express Priority Delivery', () => {
  const expressRule = { ...mockRule, delivery_type: 'express' as const };
  const quote = calculateQuote({
    deliveryType: 'express',
    packageSize: 'medium', // 1.5 multiplier
    pricingRule: expressRule,
  });

  assert.equal(quote.base_fee_kobo, 80000);
  assert.equal(quote.express_surcharge_kobo, 40000); // ₦400
  assert.equal(quote.package_surcharge_kobo, 30000); // 20000 * 1.5 = 30000
  assert.equal(quote.total_kobo, 150000); // ₦1,500.00
});

test('Pricing Engine - Intercity Surcharge', () => {
  const quote = calculateQuote({
    deliveryType: 'intercity',
    packageSize: 'large', // 2.2 multiplier
    isIntercity: true,
    pricingRule: mockRule,
  });

  assert.equal(quote.zone_surcharge_kobo, 30000); // ₦300
  assert.equal(quote.package_surcharge_kobo, 44000); // 20000 * 2.2 = 44000
  assert.equal(quote.total_kobo, 80000 + 30000 + 44000);
});

test('Pricing Snapshot Generation', () => {
  const quote = calculateQuote({
    deliveryType: 'standard',
    packageSize: 'small',
    pricingRule: mockRule,
  });

  const snapshot = createPricingSnapshot(quote);
  assert.equal(snapshot.pricing_rule_id, mockRule.id);
  assert.equal(snapshot.total_kobo, quote.total_kobo);
  assert.ok(snapshot.calculated_at);
});
