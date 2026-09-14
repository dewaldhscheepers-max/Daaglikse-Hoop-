/* ── Een clip uit die voer haal ──
 *
 * Dewald, 14 September 2026, met 'n skermkiekie van *"Video currently
 * unavailable"* in die voer: *"how to remove only this one that isn't playing
 * how will i know what link it is."*
 *
 * Albei helftes van daardie sin is 'n egte gat.
 *
 * ── Die tweede helfte eerste: hoe weet hy WATTER een ──
 *
 * Elke clip in die voer is vir hom anoniem. TikTok se foutblad wys nie eens die
 * maker se naam nie, dus is daar niks op die skerm om mee te soek.
 *
 * Maar daar IS 'n knoppie wat die clip se identiteit gee, en hy staan reeds
 * langs hom: **Deel**. Daardie skakel is `…/reels/<id>`, en `<id>` is presies
 * die dokumentnaam in Firestore. Een tik, plak dit in die admin, en die app
 * weet presies watter clip hy bedoel.
 *
 * Dit is hoekom hierdie lêer die DEEL-SKAKEL as sy eerste vorm aanvaar. Geen
 * nuwe knoppie in die voer nie — die voer is die publieke skerm en 'n
 * admin-kontrole daar is 'n nuwe oppervlak met nuwe maniere om verkeerd te
 * loop.
 *
 * ── Wat nog aanvaar word, en hoekom ──
 *
 * 'n Mens plak wat hy byderhand het, nie wat 'n program verwag nie:
 *
 *   · ons deel-skakel      `https://dewaldscheepers.com/reels/7412…`
 *   · 'n KAAL id           `7412345678901234567`
 *   · TikTok se volle adres `https://www.tiktok.com/@iemand/video/7412…`
 *   · TikTok se KORT skakel `https://vt.tiktok.com/ZSqHxCETq/`
 *
 * Die eerste drie kan HIER opgelos word — die id staan in die string. Die
 * vierde nie: 'n kort skakel dra die id nie, en dit moet oopgemaak word. Dit
 * word dus as `kort` teruggegee sodat die BEDIENER hom kan volg; hierdie lêer
 * bly suiwer en raak nooit die netwerk nie.
 *
 * ── Wat dit NIE doen nie ──
 *
 * Dit raai nooit. Kry dit nie 'n id nie, gee dit `null` met 'n rede wat 'n mens
 * kan lees. 'n Verwyder-kassie wat 'n string half verstaan en dan die verkeerde
 * clip uitvee, is erger as een wat niks doen nie.
 */
import { geldigeId, idUitPad } from './reels.js'
import { tiktokIdUit, isKortSkakel } from './tiktokId.js'

/* ── Wanneer is 'n id BRUIKBAAR ──
 *
 * `geldigeId()` vra net of 'n string 'n dokumentnaam KAN wees — dit laat `123`
 * deur. Vir 'n VERWYDERING is dit te los, en die toets het dit gevang: 'n
 * vreemde webwerf se `/reels/123` het deurgekom.
 *
 * Elke clip in `reels` is 'n TikTok-post-id, en dié is 'n lang nommer. 'n Id wat
 * uit net syfers bestaan, moet dus LANK genoeg wees om een te kan wees. Iets
 * korter is 'n string wat toevallig soos 'n pad lyk, nie 'n clip nie. */
function bruikbareId(id) {
  const s = String(id || '').trim()
  if (!geldigeId(s)) return false
  if (/^[0-9]+$/.test(s)) return s.length >= 6 && s.length <= 25
  return true
}

/* Ons eie deel-skakel. Die GASHEER maak nie saak nie — hy plak dalk die lewende
   adres, 'n Vercel-voorskou of iets van sy foon se geskiedenis af — dit is die
   PAD wat tel, en die id daarin moet bruikbaar wees. */
function uitOnsSkakel(s) {
  let pad = ''
  try { pad = new URL(s).pathname }
  catch { return null }
  const id = idUitPad(pad)
  return id && bruikbareId(id) ? id : null
}

export function leesInset(teks) {
  const s = String(teks == null ? '' : teks).trim()
  if (!s) return { soort: null, fout: 'Plak die clip se skakel' }

  /* 'n KAAL id. Dit moet EERSTE getoets word: 'n string van net syfers is
     ondubbelsinnig, en dit is wat 'n mens uit 'n vorige verslag kopieer. */
  if (/^[0-9]+$/.test(s) && bruikbareId(s)) return { soort: 'id', id: s }

  if (/^https?:\/\//i.test(s)) {
    /* Ons eie deel-skakel — die pad is `/reels/<id>`. */
    const ons = uitOnsSkakel(s)
    if (ons) return { soort: 'id', id: ons }

    /* TikTok se volle adres dra die id in die pad. */
    const tt = tiktokIdUit(s)
    if (tt) return { soort: 'id', id: tt }
  }

  /* 'n Kort skakel dra die id NIE. Die bediener moet hom volg. */
  if (isKortSkakel(s)) return { soort: 'kort', skakel: s }

  return { soort: null, fout: 'Dit lyk nie soos n clip se skakel nie' }
}

/* Wat die admin op die skerm wys nadat die bediener die clip gevind het.
   Suiwer, sodat die woorde getoets kan word: 'n verwyder-knoppie wat die
   VERKEERDE naam wys, is hoe 'n mens die verkeerde ding uitvee. */
export function beskryf(klip) {
  const k = klip && typeof klip === 'object' ? klip : null
  if (!k) return ''
  const naam = String(k.naam || k.handvatsel || '').trim()
  const id = String(k.id || '').trim()
  if (!naam) return id
  return `${naam} · ${id}`
}
