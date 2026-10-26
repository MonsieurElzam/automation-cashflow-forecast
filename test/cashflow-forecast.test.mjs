import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toDate } from '../lib/csv.mjs'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('27 trésorerie : récurrences, fin de mois, premier solde négatif, autonomie', async () => {
  const { forecast, parseRows } = await mod('cashflow-forecast')
  const r = forecast(parseRows(sample('tresorerie.csv')), { startBalance: 300000, months: 6 })
  assert.deepEqual(r.months.map((m) => m.balance), [435000, -10000, 325000, 60000, -205000, -470000]); assert.equal(r.firstNegative, '2026-12'); assert.equal(r.runwayMonths, 1.5)
  const eom = forecast(parseRows('date,label,amount,recurrence,end\n2027-01-31,Paiement,-100,monthly,\n'), { months: 3 })
  assert.deepEqual(eom.months.map((m) => m.out), [100, 100, 100])
  assert.equal(forecast(parseRows('date,label,amount\n2027-01-05,Vente,500\n'), { months: 2 }).runwayMonths, null)
  assert.throws(() => parseRows('date,label,amount\nhier,x,10'), /ligne 2/)
  assert.equal(run('cashflow-forecast', [samplePath('tresorerie.csv'), '--balance', '300000']).status, 2)
})
