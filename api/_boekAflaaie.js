/* ── Hoeveel keer is elke e-boek afgelaai? ──
 *
 * Dewald, 20 November 2026: "wat is die top 4 boeke wat afgelaai is op eboek
 * blad". Daar is net EEN teller vir alle boeke saam (`stats/ebooks_given`) —
 * maar elke aflaai skryf `freeDownloads/<dedupId>` met sy `bookId`
 * (free-book-download.js). Een dokument per e-pos per boek, dus tel dit
 * MENSE per boek, nie drukke nie: wie dieselfde boek twee keer vra, tel een
 * keer.
 *
 * Suiwer: Firestore-dokumente in, `[{ bookId, aantal }]` uit, grootste eerste.
 */
function telPerBoek(documents) {
  const tel = new Map()
  for (const d of documents || []) {
    const id = d && d.fields && d.fields.bookId && d.fields.bookId.stringValue
    if (!id || typeof id !== 'string') continue
    tel.set(id, (tel.get(id) || 0) + 1)
  }
  return [...tel.entries()]
    .map(([bookId, aantal]) => ({ bookId, aantal }))
    .sort((a, b) => b.aantal - a.aantal || a.bookId.localeCompare(b.bookId))
}

/* Haal elke `freeDownloads`-dokument (net bookId), tel, en stoor die top-50
   in `berekening/topBoeke`. Gooi as die lees misluk — 'n halwe telling lyk
   soos 'n feit. Die stoor mag misluk; dan bly gister se lys staan. */
const BASIS = p => `https://firestore.googleapis.com/v1/projects/${p}/databases/(default)/documents`

async function telEnStoor(projectId, token) {
  const documents = []
  let pageToken = ''
  do {
    const r = await fetch(`${BASIS(projectId)}/freeDownloads?pageSize=1000&mask.fieldPaths=bookId`
      + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''),
      { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) throw new Error('lees ' + r.status)
    const data = await r.json()
    if (data.documents) documents.push(...data.documents)
    pageToken = data.nextPageToken || ''
  } while (pageToken)

  const boeke = telPerBoek(documents)
  let gestoor = false
  try {
    const w = await fetch(`${BASIS(projectId)}/berekening/topBoeke`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        lys:    { stringValue: JSON.stringify(boeke.slice(0, 50)) },
        totaal: { integerValue: String(documents.length) },
        datum:  { timestampValue: new Date().toISOString() },
      } }),
    })
    gestoor = w.ok
  } catch { /* sien hierbo */ }
  return { totaal: documents.length, boeke, gestoor }
}

/* Is die gestoorde lys ouer as `maksMs` (of bestaan hy nie)? Suiwer. */
function isOud(datumIso, nouMs, maksMs = 24 * 3600 * 1000) {
  const t = Date.parse(String(datumIso || ''))
  if (!Number.isFinite(t)) return true
  return nouMs - t > maksMs
}

module.exports = { telPerBoek, telEnStoor, isOud, BASIS }
