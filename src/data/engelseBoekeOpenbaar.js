/* ── Wat van 'n Engelse boek oor die draad gaan ──
 *
 * `api/engelse-boeke.mjs` lees die boeke met die diensrekening en stuur net
 * hierdie velde — 'n WITLYS, dieselfde vorm as reelsOpenbaar.js en
 * volgJesusOpenbaar.js. Kom daar môre 'n interne veld op 'n boek (soos die ou
 * `luisterTeks`, honderde kilogrepe), kom dit nie oor die draad nie.
 *
 * Suiwer: geen window, geen netwerk. */
import { isEngels } from './engelsBoeke.js'

export const VELDE = ['title', 'desc', 'coverUrl', 'pdfUrl', 'color', 'emoji', 'featured', 'createdAt', 'updatedAt', 'taal']

export function openbareEngelseBoeke(rou) {
  return (Array.isArray(rou) ? rou : [])
    .filter(b => b && b.id && b.title && isEngels(b))
    .map(b => {
      const uit = { id: String(b.id) }
      for (const v of VELDE) if (b[v] !== undefined && b[v] !== null && b[v] !== '') uit[v] = b[v]
      return uit
    })
}
