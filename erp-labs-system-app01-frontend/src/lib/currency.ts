const formatter = new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'CDF', maximumFractionDigits: 0 });

export function formatCDF(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? Number(amount) : (amount ?? 0);
  const safe = Number.isFinite(Number(num)) ? Number(num) : 0;
  return formatter.format(safe);
}


