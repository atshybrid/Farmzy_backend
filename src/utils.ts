
export function toNumber(v:any) {
  return typeof v === 'string' ? Number(v) : v;
}
