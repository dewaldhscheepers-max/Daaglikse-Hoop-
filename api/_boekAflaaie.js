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

module.exports = { telPerBoek }
