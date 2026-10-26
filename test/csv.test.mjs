import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, toCsv, toNumber, toDate, detectDelimiter } from '../lib/csv.mjs'

test('CSV : guillemets, virgules, retours à la ligne et BOM', () => {
  const { headers, records } = parseCsv('﻿a,b\n"x, y","il dit ""oui"""\n"l1\nl2",z\n')
  assert.deepEqual(headers, ['a', 'b'])
  assert.equal(records[0].a, 'x, y')
  assert.equal(records[0].b, 'il dit "oui"')
  assert.equal(records[1].a, 'l1\nl2')
})

test('CSV : séparateur point-virgule détecté, aller-retour sans perte', () => {
  assert.equal(detectDelimiter('a;b;c\n1;2;3'), ';')
  const src = 'a,b\n"x,y","z""w"\n'
  const { headers, records } = parseCsv(src)
  assert.equal(toCsv(headers, records), src)
})

test('nombres et dates tolérants', () => {
  assert.equal(toNumber('1 234,50'), 1234.5)
  assert.equal(toNumber('1,234.50'), 1234.5)
  assert.equal(toNumber('150 000'), 150000)
  assert.ok(Number.isNaN(toNumber('abc')))
  assert.equal(toDate('26/10/2026').toISOString().slice(0, 10), '2026-10-26')
  assert.equal(toDate('2026-10-26').toISOString().slice(0, 10), '2026-10-26')
  assert.equal(toDate('demain'), null)
})
