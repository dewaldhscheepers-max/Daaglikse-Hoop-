/* ── Laai die PDF-biblioteek, op ENIGE Node-weergawe, sonder om te crash ──
 *
 * 10 Oktober 2026: die admin se "Haal teks uit" het 'n KAAL "HTTP 500" gegee —
 * geen boodskap nie, want die funksie het gesterf terwyl hy LAAI, voor een reël
 * van die handler geloop het. pdfjs 5 (onder pdf-parse) eis Node 20.16+. Op
 * Node 18 bestaan `process.getBuiltinModule` nie, pdfjs kry dan nie sy eie
 * `require` nie, en die module gooi `DOMMatrix is not defined` by die INVOER.
 * Plaaslik en in die sandbox was dit Node 20/22 en alles het gewerk.
 *
 * Twee lesse, albei hier vasgelê:
 *
 *   1. Die invoer is DINAMIES en binne 'n try (sien `laaiPdfParse`), sodat 'n
 *      mislukking 'n LEESBARE fout in die admin word in plaas van 'n kaal 500.
 *      Die paaie is LETTERLIKE stringe — @vercel/nft spoor 'n letterlike
 *      `import('…')` wel (dit is pdfjs se BEREKENDE invoer van sy werker wat
 *      hy nie sien nie; daarom laai ons die werker self).
 *   2. Die drie dinge wat Node 18 kort, word net aangevul as hulle ONTBREEK.
 *      Op Node 20/22 doen hierdie lêer dus niks behalwe laai.
 *
 * Toets: `kykNftTeks.mjs` in die scratchpad, onder Node 18, 20 EN 22. */

import { createRequire } from 'node:module'

const vereis = createRequire(import.meta.url)

function vulAan() {
  if (typeof process.getBuiltinModule !== 'function') {
    process.getBuiltinModule = naam => {
      try { return vereis(String(naam)) } catch { return undefined }
    }
  }
  if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function () {
      let resolve, reject
      const promise = new this((r, j) => { resolve = r; reject = j })
      return { promise, resolve, reject }
    }
  }
  /* Net vir teks hoef pdfjs nooit te TEKEN nie; hy wil net die naam hê. 'n
     Minimale matriks is genoeg — die egte een is 'n grafika-biblioteek. */
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor(m) {
        const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = Array.isArray(m) ? m : []
        Object.assign(this, { a, b, c, d, e, f })
      }
      multiplySelf() { return this }
      preMultiplySelf() { return this }
      translate() { return this }
      scale() { return this }
      invertSelf() { return this }
    }
  }
}

let klaar = null

/* Gee `PDFParse`, of gooi 'n fout MET 'n boodskap. Een keer per koue begin. */
export async function laaiPdfParse() {
  if (klaar) return klaar
  vulAan()
  await import('pdfjs-dist/legacy/build/pdf.worker.mjs')
  const { PDFParse } = await import('pdf-parse')
  klaar = PDFParse
  return klaar
}
