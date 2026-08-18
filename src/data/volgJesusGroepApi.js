/* Die dun laag na /api/vj-groep.
 *
 * Alles wat 'n kliënt NIE self mag doen nie loop hierdeur: 'n groep skep, met
 * 'n kode aansluit, verlaat, verwyder, 'n rol verander, die kode roteer.
 *
 * Elke oproep dra 'n Firebase ID-token. Ons stuur NOOIT 'n uid saam nie — die
 * bediener haal dit uit die token, en 'n uid in die liggaam word geïgnoreer
 * (daar is 'n toets wat presies dit afdwing).
 */
import { idToken } from './volgJesusIdentiteit'

async function vra(doen, data = {}) {
  const token = await idToken()
  if (!token) {
    return { ok: false, fout: 'Ons kon nie by die aanmelding kom nie. Kyk of jy aanlyn is.' }
  }
  try {
    const r = await fetch('/api/vj-groep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ doen, ...data }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return { ok: false, fout: j.fout || 'Iets het misluk. Probeer asseblief weer.' }
    return { ok: true, ...j }
  } catch {
    return { ok: false, fout: 'Kyk of jy aanlyn is en probeer weer.' }
  }
}

export const skepGroep   = (naam, gemeente, vertoonnaam) => vra('skep', { naam, gemeente, vertoonnaam })
export const kykGroep    = kode => vra('kyk', { kode })
export const sluitAan    = (kode, vertoonnaam) => vra('sluitaan', { kode, vertoonnaam })
export const verlaatGroep = groepId => vra('verlaat', { groepId })
export const verwyderLid = (groepId, uid) => vra('verwyder', { groepId, uid })
export const stelRol     = (groepId, uid, rol) => vra('rol', { groepId, uid, rol })
export const roteerKode  = groepId => vra('kode', { groepId })
export const sluitKodeAf = groepId => vra('kode', { groepId, aan: false })
export const myGroepe    = () => vra('myne')
