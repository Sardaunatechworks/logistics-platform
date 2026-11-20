import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatNaira,
  nairaToKobo,
  koboToNaira,
  normalizePhone,
  maskPhone,
  maskAddress,
} from '../src/lib/utils/index.ts';

test('Utils - Currency Conversion & Formatting', () => {
  assert.equal(nairaToKobo(1500), 150000);
  assert.equal(koboToNaira(150000), 1500);

  // Kobo formatting (Nigerian currency format)
  const formatted = formatNaira(250000);
  assert.ok(formatted.includes('2,500.00'));
});

test('Utils - Phone Normalization', () => {
  assert.equal(normalizePhone('08012345678'), '+2348012345678');
  assert.equal(normalizePhone('+2348012345678'), '+2348012345678');
  assert.equal(normalizePhone('2348012345678'), '+2348012345678');
});

test('Utils - Privacy Masking', () => {
  const maskedPhone = maskPhone('+2348012345678');
  assert.equal(maskedPhone, '+234***5678');

  const maskedAddress = maskAddress('Suite 4, Commercial Plaza, Dutse');
  assert.equal(maskedAddress, '*****, Dutse');
});
