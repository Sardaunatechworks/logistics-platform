// ============================================================================
// Pricing Engine
// Centralized server-side quote calculation for delivery orders
// All calculations in integer kobo to avoid floating-point inaccuracies
// ============================================================================

import type {
  DeliveryType,
  PackageSize,
  PricingRule,
  DeliveryQuote,
  PricingSnapshot,
  QuoteLineItem,
} from '@/types/database';

export interface QuoteCalculationParams {
  deliveryType: DeliveryType;
  packageSize: PackageSize;
  pickupArea?: string | null;
  destinationArea?: string | null;
  isIntercity?: boolean;
  pricingRule: PricingRule;
}

/**
 * Multiplier/add-on mapping for package sizes relative to rule base surcharges
 */
const PACKAGE_SIZE_MULTIPLIERS: Record<PackageSize, number> = {
  small: 1.0,
  medium: 1.5,
  large: 2.2,
  extra_large: 3.5,
};

/**
 * Calculates an itemized delivery quote based on the active pricing rule
 * Never trust client-submitted calculations; this must always execute server-side.
 */
export function calculateQuote(params: QuoteCalculationParams): DeliveryQuote {
  const { deliveryType, packageSize, pricingRule } = params;

  const baseFee = pricingRule.base_fee_kobo;
  const itemized: QuoteLineItem[] = [
    {
      label: 'Base Delivery Fee',
      amount_kobo: baseFee,
    },
  ];

  // Express surcharge
  let expressSurcharge = 0;
  if (deliveryType === 'express') {
    expressSurcharge = pricingRule.express_surcharge_kobo;
    itemized.push({
      label: 'Express Priority Surcharge',
      amount_kobo: expressSurcharge,
    });
  }

  // Package size surcharge
  let packageSurcharge = 0;
  if (pricingRule.package_surcharge_kobo > 0) {
    const multiplier = PACKAGE_SIZE_MULTIPLIERS[packageSize] ?? 1.0;
    packageSurcharge = Math.round(pricingRule.package_surcharge_kobo * multiplier);
    itemized.push({
      label: `Package Weight/Size Surcharge (${packageSize.replace('_', ' ')})`,
      amount_kobo: packageSurcharge,
    });
  }

  // Zone surcharge (if applicable, e.g. cross-zone or intercity)
  let zoneSurcharge = 0;
  if (params.isIntercity || deliveryType === 'intercity') {
    zoneSurcharge = pricingRule.zone_surcharge_kobo;
    itemized.push({
      label: 'Intercity Zone Surcharge',
      amount_kobo: zoneSurcharge,
    });
  }

  const subtotal = baseFee;
  const totalSurcharges = expressSurcharge + packageSurcharge + zoneSurcharge;
  const total = subtotal + totalSurcharges;

  return {
    delivery_type: deliveryType,
    package_size: packageSize,
    base_fee_kobo: baseFee,
    zone_surcharge_kobo: zoneSurcharge,
    package_surcharge_kobo: packageSurcharge,
    express_surcharge_kobo: expressSurcharge,
    subtotal_kobo: subtotal,
    total_kobo: total,
    pricing_rule_id: pricingRule.id,
    pricing_rule_name: pricingRule.name,
    itemized,
  };
}

/**
 * Create an immutable snapshot of the pricing calculation to store on the delivery record
 */
export function createPricingSnapshot(quote: DeliveryQuote): PricingSnapshot {
  return {
    pricing_rule_id: quote.pricing_rule_id,
    pricing_rule_name: quote.pricing_rule_name,
    delivery_type: quote.delivery_type,
    base_fee_kobo: quote.base_fee_kobo,
    zone_surcharge_kobo: quote.zone_surcharge_kobo,
    package_surcharge_kobo: quote.package_surcharge_kobo,
    express_surcharge_kobo: quote.express_surcharge_kobo,
    total_kobo: quote.total_kobo,
    calculated_at: new Date().toISOString(),
  };
}

