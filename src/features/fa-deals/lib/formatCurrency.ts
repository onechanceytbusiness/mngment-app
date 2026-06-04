/**
 * Indian rupee formatter. Uses Intl.NumberFormat with the en-IN locale so
 * lakhs are grouped correctly (e.g. ₹1,29,999 not ₹129,999). No decimals
 * — every deal price we see is rounded to the rupee.
 */
const FMT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatRupees(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return FMT.format(value);
}
