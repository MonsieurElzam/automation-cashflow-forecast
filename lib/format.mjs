/** Montant lisible : « 1 234 567,50 » (espace simple, virgule décimale). */
export function money(n, decimals = 0) {
  if (!Number.isFinite(n)) return '—'
  const [int, dec] = Math.abs(n).toFixed(decimals).split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${n < 0 ? '-' : ''}${grouped}${dec ? `,${dec}` : ''}`
}

export const pct = (n, decimals = 1) => (Number.isFinite(n) ? `${(n * 100).toFixed(decimals).replace('.', ',')} %` : '—')

/** Arrondi à `decimals` décimales (évite 0,1 + 0,2 = 0,30000000000000004 dans les totaux). */
export const round = (n, decimals = 2) => Math.round((n + Number.EPSILON) * 10 ** decimals) / 10 ** decimals

/** Échappement HTML minimal pour les documents générés. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
