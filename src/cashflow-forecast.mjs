#!/usr/bin/env node
/* Prévision de trésorerie mois par mois : encaissements, décaissements (ponctuels ou récurrents), solde et autonomie. */
import { readFileSync } from 'node:fs'
import { parseCsv, toNumber, toDate } from '../lib/csv.mjs'
import { money, round } from '../lib/format.mjs'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

const ym = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`

/** Lignes : date, label, amount (positif = encaissement), recurrence (none|weekly|monthly|yearly), end (facultatif). */
export function forecast(rows, { startBalance = 0, months = 6, from } = {}) {
  const first = from ?? new Date(Math.min(...rows.map((r) => r.date)))
  const start = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1))
  const endExclusive = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, 1))
  const table = new Map()
  for (let i = 0; i < months; i++) table.set(ym(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))), { in: 0, out: 0 })
  const add = (d, amount) => { const row = table.get(ym(d)); if (row) amount >= 0 ? (row.in += amount) : (row.out += -amount) }
  for (const r of rows) {
    const rec = (r.recurrence || 'none').toLowerCase()
    const limit = r.end && r.end < endExclusive ? r.end : endExclusive
    let d = new Date(r.date)
    for (let guard = 0; d < limit && guard < 5000; guard++) {
      if (d >= start) add(d, r.amount)
      if (rec === 'weekly') d = new Date(d.getTime() + 7 * 86_400_000)
      else if (rec === 'monthly') d = addMonth(d, r.date)
      else if (rec === 'yearly') d = new Date(Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()))
      else break
    }
  }
  let balance = startBalance
  const result = [...table].map(([month, v]) => { balance = round(balance + v.in - v.out); return { month, in: round(v.in), out: round(v.out), net: round(v.in - v.out), balance } })
  const negative = result.find((m) => m.balance < 0)
  const burn = result.filter((m) => m.net < 0)
  const avgBurn = burn.length ? burn.reduce((s, m) => s + -m.net, 0) / result.length : 0
  return { months: result, firstNegative: negative?.month ?? null, runwayMonths: avgBurn > 0 ? round(Math.max(startBalance, 0) / avgBurn, 1) : null }
}

/** Même jour du mois suivant (borné à la fin du mois : le 31 devient le 30 ou le 28/29). */
function addMonth(d, origin) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m, Math.min(origin.getUTCDate(), last)))
}

export function parseRows(text) {
  return parseCsv(text).records.flatMap((r, i) => {
    const date = toDate(r.date), amount = toNumber(r.amount)
    if (!date || Number.isNaN(amount)) throw new Error(`ligne ${i + 2} : date ou montant illisible.`)
    return [{ date, label: r.label, amount, recurrence: r.recurrence, end: r.end ? toDate(r.end) : null }]
  })
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help'])
  usage(`
Usage : node src/cashflow-forecast.mjs flux.csv [--balance 500000] [--months 6] [--from 2026-11-01]
Colonnes : date, label, amount (positif = encaissement, négatif = dépense), recurrence (none|weekly|monthly|yearly), end (facultatif).
Code de sortie 2 si le solde devient négatif sur la période.`, args, 1)
  let r
  try { r = forecast(parseRows(readFileSync(args._[0], 'utf8')), { startBalance: Number(args.balance ?? 0), months: Number(args.months ?? 6), from: args.from ? toDate(args.from) : undefined }) } catch (e) { fail(e.message) }
  console.log('Mois       Entrées      Sorties      Net          Solde')
  r.months.forEach((m) => console.log(`${m.month}  ${money(m.in).padStart(11)}  ${money(m.out).padStart(11)}  ${money(m.net).padStart(11)}  ${money(m.balance).padStart(11)}${m.balance < 0 ? '  ⚠' : ''}`))
  console.log(r.firstNegative ? `\n✗ Solde négatif dès ${r.firstNegative}.` : '\n✓ Solde positif sur toute la période.')
  if (r.runwayMonths !== null) console.log(`Autonomie estimée : ${r.runwayMonths} mois au rythme de consommation moyen.`)
  process.exit(r.firstNegative ? 2 : 0)
}
