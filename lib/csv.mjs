/** Lecture / écriture CSV (RFC 4180) sans dépendance. Détecte « , » ou « ; ». */

export function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const semi = (firstLine.match(/;/g) || []).length
  const comma = (firstLine.match(/,/g) || []).length
  const tab = (firstLine.match(/\t/g) || []).length
  if (tab > semi && tab > comma) return '\t'
  return semi > comma ? ';' : ','
}

/** Renvoie un tableau de lignes (tableaux de cellules). */
export function parseRows(text, delimiter = detectDelimiter(text)) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += c
    } else if (c === '"') quoted = true
    else if (c === delimiter) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      rows.push(row); row = []
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

/** Renvoie { headers, records } où chaque enregistrement est un objet. */
export function parseCsv(text, delimiter) {
  const rows = parseRows(text, delimiter)
  const headers = (rows.shift() ?? []).map((h) => h.trim())
  const records = rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])))
  return { headers, records }
}

function escapeCell(value, delimiter) {
  const s = value == null ? '' : String(value)
  return s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delimiter)
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export function toCsv(headers, records, delimiter = ',') {
  const lines = [headers.map((h) => escapeCell(h, delimiter)).join(delimiter)]
  for (const r of records) lines.push(headers.map((h) => escapeCell(r[h], delimiter)).join(delimiter))
  return lines.join('\n') + '\n'
}

/** Nombre tolérant : « 1 234,50 », « 1,234.50 », « 12 % ». NaN si illisible. */
export function toNumber(value) {
  if (typeof value === 'number') return value
  let s = String(value ?? '').trim().replace(/[\s €$%]/g, '')
  if (!s) return NaN
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (s.includes(',')) s = s.replace(',', '.')
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN
}

/** Date AAAA-MM-JJ ou JJ/MM/AAAA → Date UTC, sinon null. */
export function toDate(value) {
  const s = String(value ?? '').trim()
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]))
  return null
}
