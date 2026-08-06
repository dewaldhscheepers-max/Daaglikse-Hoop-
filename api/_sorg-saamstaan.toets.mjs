/* ────────────────────────────────────────────────────────────
   Die bediener se kant van Saamstaan.

     node api/_sorg-saamstaan.toets.mjs

   Hier word drie grense getoets, en al drie is die soort wat 'n mens nie
   met die oog sien breek nie:

   1. 'n SENSITIEWE plasing kry geen vrye teks nie, EN die vlag kom uit die
      plasing soos dit in Firestore staan — nooit uit die versoek. Sou dit
      uit die versoek kom, sê 'n aanvaller eenvoudig `sensitief: false` en
      skryf wat hy wil onder 'n selfmoordboodskap.

   2. 'n Klaargemaakte woord se TEKS kom uit die lys, nooit uit die versoek.
      Sou die kliënt die teks kon stuur, kon iemand enigiets as 'n
      "klaargemaakte" woord laat verskyn — sonder hersiening, want
      klaargemaakte woorde word mos vertrou.

   3. Een reaksie per toestel per plasing.

   Ons vervang `fetch` met 'n nagemaakte Firestore. Ons raak NOOIT aan die
   lewende projek nie — sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'

const sleutelPaar = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
process.env.FIREBASE_CLIENT_EMAIL = 'toets@voorbeeld.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = sleutelPaar.privateKey.export({ type: 'pkcs8', format: 'pem' })
process.env.FIREBASE_PROJECT_ID = 'toets-projek'
process.env.SORG_ADMIN_GEHEIM = 'n-lang-genoeg-toetsgeheim'

let gedruip = 0
const kyk = (naam, waar, ekstra) => {
  if (waar) console.log('  ok    ' + naam)
  else {
    gedruip++
    console.log('  DRUIP ' + naam + (ekstra !== undefined ? ' — ' + JSON.stringify(ekstra) : ''))
  }
}
const afdeling = n => console.log('\n' + n)

/* ── Die nagemaakte Firestore ── */
let winkel = {}
let skryfwerk = []

function naVeld(w) {
  if (w === null || w === undefined) return { nullValue: null }
  if (typeof w === 'boolean') return { booleanValue: w }
  if (typeof w === 'number') {
    return Number.isInteger(w) ? { integerValue: String(w) } : { doubleValue: w }
  }
  if (w instanceof Date) return { timestampValue: w.toISOString() }
  if (Array.isArray(w)) return { arrayValue: { values: w.map(naVeld) } }
  if (typeof w === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(w).map(([k, v]) => [k, naVeld(v)])) } }
  }
  return { stringValue: String(w) }
}
const naDok = (pad, o) => ({
  name: `projects/p/databases/(default)/documents/${pad}`,
  fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, naVeld(v)])),
})

function stelWinkel(nuut) {
  winkel = JSON.parse(JSON.stringify(nuut))
  skryfwerk = []
}

globalThis.fetch = async (url, opsies = {}) => {
  const u = String(url)
  if (u.includes('oauth2.googleapis.com')) {
    return { ok: true, status: 200, json: async () => ({ access_token: 'toets-token' }) }
  }
  const pad = u.split('/documents/')[1].split('?')[0]
  const metode = (opsies.method || 'GET').toUpperCase()

  if (metode === 'PATCH') {
    skryfwerk.push(pad)
    const [vers, id] = pad.split('/')
    const lyf = JSON.parse(opsies.body || '{}')
    const uit = {}
    for (const [k, v] of Object.entries(lyf.fields || {})) {
      uit[k] = v.stringValue ?? (v.integerValue !== undefined ? Number(v.integerValue)
        : v.booleanValue !== undefined ? v.booleanValue
        : v.timestampValue ?? (v.mapValue
          ? Object.fromEntries(Object.entries(v.mapValue.fields || {})
              .map(([a, b]) => [a, Number(b.integerValue ?? 0)]))
          : null))
    }
    winkel[vers] = winkel[vers] || {}
    winkel[vers][id] = { ...(winkel[vers][id] || {}), ...uit }
    return { ok: true, status: 200, json: async () => ({}) }
  }

  if (pad.includes('/')) {                       // een dokument
    const [vers, id] = pad.split('/')
    const d = (winkel[vers] || {})[id]
    if (!d) return { ok: false, status: 404, json: async () => ({}) }
    return { ok: true, status: 200, json: async () => naDok(pad, d) }
  }

  const almal = winkel[pad] || {}               // 'n hele versameling
  return {
    ok: true, status: 200,
    json: async () => ({
      documents: Object.entries(almal).map(([id, d]) => naDok(`${pad}/${id}`, d)),
    }),
  }
}

const { default: handler } = await import('./sorg-saamstaan.mjs')

function maakRes() {
  const r = { kode: 0, lyf: null }
  r.setHeader = () => {}
  r.status = k => { r.kode = k; return r }
  r.json = d => { r.lyf = d; return r }
  r.end = () => r
  return r
}
async function stuur(lyf) {
  const res = maakRes()
  await handler({ method: 'POST', body: lyf, headers: {} }, res)
  return res
}

const MUUR = {
  gewoon: { teks: 'x', gepubliseer: true, saam: 0, reaksies: {}, sensitief: false },
  swaar:  { teks: 'y', gepubliseer: true, saam: 0, reaksies: {}, sensitief: true },
  af:     { teks: 'z', gepubliseer: false, saam: 0, reaksies: {}, sensitief: false },
}

afdeling('n SENSITIEWE plasing kry GEEN vrye teks nie')
{
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  let r = await stuur({ muurId: 'swaar', toestel: 'jan', teks: 'Net bid, God sal haar genees.' })
  kyk('vrye teks word geweier', r.kode === 400, r.lyf)
  kyk('en die mens word na die klaar woorde gestuur',
      String(r.lyf.fout).includes('woorde hier onder'), r.lyf)
  kyk('niks is geskryf nie', skryfwerk.length === 0, skryfwerk)

  /* Die aanval: sê self dat dit nie sensitief is nie. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'swaar', toestel: 'jan', teks: 'Hospitale het my ma doodgemaak.', sensitief: false })
  kyk('n versoek kan NIE die vlag omdraai nie', r.kode === 400, r.lyf)

  /* Maar klaargemaakte woorde werk wel daar — dit is die punt. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'swaar', toestel: 'jan', woord: 'alleen' })
  kyk('n klaargemaakte woord gaan wel deur', r.kode === 200 && r.lyf.ok, r.lyf)
  kyk('en dit wys dadelik', r.lyf.woord && r.lyf.woord.teks === 'Jy is nie alleen nie.', r.lyf)
}

afdeling('Die teks van n klaargemaakte woord kom uit die LYS')
{
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  let r = await stuur({ muurId: 'gewoon', toestel: 'jan', woord: 'saam' })
  kyk('die regte sin word gestoor',
      r.lyf.woord.teks === 'Ek bid vandag saam met jou.', r.lyf)

  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'gewoon', toestel: 'jan', woord: 'nie-bestaande' })
  kyk('n onbekende sleutel word geweier', r.kode === 400, r.lyf)

  /* Die aanval: stuur die sleutel EN jou eie teks. Die teks moet geignoreer
     word, want 'n klaargemaakte woord word nie hersien nie. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'gewoon', toestel: 'jan', woord: 'saam', teks: 'BESOEK MY WEBWERF' })
  kyk('n saamgestuurde teks word geignoreer',
      r.lyf.woord.teks === 'Ek bid vandag saam met jou.', r.lyf)
}

afdeling('n Gewone woord WYS DADELIK')
{
  /* Die eerste woord van elke toestel het gewag, en die meeste mense skryf
     een keer — dus het die meeste mense hul eie woord nooit gesien nie. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  let r = await stuur({ muurId: 'gewoon', toestel: 'jan', teks: 'Ek dink aan jou vandag.' })
  kyk('die eerste keer wys dadelik', r.lyf.wag === false, r.lyf)
  kyk('en die woord kom terug', r.lyf.woord && r.lyf.woord.teks === 'Ek dink aan jou vandag.', r.lyf)
  kyk('en dit is op wys gestoor',
      Object.values(winkel.sorg_woorde).some(w => w.status === 'wys' && w.bron === 'eie'),
      winkel.sorg_woorde)

  /* Ook wat gevlag is, WYS — die vlag keer niks, dit merk net. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'gewoon', toestel: 'sanet', teks: 'bel my 082 123 4567' })
  kyk('n telefoonnommer WYS ook', r.lyf.wag === false && !!r.lyf.woord, r.lyf)
  kyk('maar dit is gemerk vir Dewald se oog',
      Object.values(winkel.sorg_woorde).some(w => w.gevlag === true),
      Object.values(winkel.sorg_woorde))
  kyk('en dit staan op wys', Object.values(winkel.sorg_woorde).every(w => w.status === 'wys'),
      Object.values(winkel.sorg_woorde))

  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'gewoon', toestel: 'piet', teks: 'kyk by https://x.co' })
  kyk('n skakel WYS ook', r.lyf.wag === false && !!r.lyf.woord, r.lyf)

  /* Die enigste ding wat vrye teks nog keer. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  r = await stuur({ muurId: 'swaar', toestel: 'jan', teks: 'Net bid.' })
  kyk('n krisisplasing weier steeds', r.kode === 400, r.lyf)
}

afdeling('EEN mens mag meer as een keer praat')
{
  /* Die fout wat dit stil laat verdwyn het: 'n tweede opmerking op dieselfde
     plasing het `reeds: true` teruggegee — geen woord, geen fout, en niks
     gestoor nie. Die skerm het 'n dankie gewys terwyl daar niks verskyn het
     nie, en dit was ook nerens om goed te keur nie. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  let r = await stuur({ muurId: 'gewoon', toestel: 'jan', teks: 'Ek bid vir jou.' })
  kyk('die eerste kom deur', r.lyf.woord && r.lyf.woord.teks === 'Ek bid vir jou.', r.lyf)

  r = await stuur({ muurId: 'gewoon', toestel: 'jan', teks: 'Ek bid ook vir jou.' })
  kyk('die TWEEDE kom ook deur', r.lyf.woord && r.lyf.woord.teks === 'Ek bid ook vir jou.', r.lyf)
  kyk('en dit is nie stilweg weggegooi nie', r.lyf.reeds !== true, r.lyf)
  kyk('albei is gestoor',
      Object.values(winkel.sorg_woorde).filter(w => w.bron === 'eie').length === 2,
      Object.values(winkel.sorg_woorde).map(w => w.teks))

  /* Die daaglikse perk is die ding wat spam keer. */
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: {} })
  const has = crypto.createHash('sha256').update('daaglikse-hoop-sorg:jan').digest('hex').slice(0, 24)
  const dag = new Date().toISOString().slice(0, 10)
  const vol = {}
  for (let i = 0; i < 20; i++) vol['w' + i] = { toestel: has, dag, bron: 'eie', status: 'wys', muurId: 'x' }
  stelWinkel({ sorg_muur: MUUR, sorg_woorde: vol })
  r = await stuur({ muurId: 'gewoon', toestel: 'jan', teks: 'Nog een.' })
  kyk('die daaglikse perk keer wel, en dit SE so', r.kode === 429 && !!r.lyf.fout, r.lyf)
}

afdeling('Een reaksie per toestel per plasing')
{
  stelWinkel({ sorg_muur: MUUR, sorg_saam: {}, sorg_woorde: {} })
  let r = await stuur({ muurId: 'gewoon', toestel: 'jan', reaksie: 'bid' })
  kyk('die eerste druk tel', r.lyf.ok && r.lyf.reaksies.bid === 1, r.lyf)
  kyk('en dit onthou watter een', r.lyf.myne === 'bid', r.lyf)

  r = await stuur({ muurId: 'gewoon', toestel: 'jan', reaksie: 'moed' })
  kyk('n tweede druk tel NIE', r.lyf.reeds === true, r.lyf)
  kyk('en die telling bly een', (winkel.sorg_muur.gewoon.reaksies || {}).bid === 1,
      winkel.sorg_muur.gewoon.reaksies)

  r = await stuur({ muurId: 'gewoon', toestel: 'sanet', reaksie: 'bid' })
  kyk('n ANDER toestel tel wel', r.lyf.reaksies.bid === 2, r.lyf)

  r = await stuur({ muurId: 'gewoon', toestel: 'piet', reaksie: 'duim' })
  kyk('n onbekende reaksie word geweier', r.kode === 400, r.lyf)

  r = await stuur({ muurId: 'af', toestel: 'piet', reaksie: 'bid' })
  kyk('n afgehaalde plasing kan nie gedruk word nie', r.kode === 404, r.lyf)

  r = await stuur({ muurId: 'gewoon', toestel: '', reaksie: 'bid' })
  kyk('sonder n toestel tel ons niks eerder as om te lieg', r.lyf.reeds === true, r.lyf)
}

afdeling('Die gewone weiering')
{
  stelWinkel({ sorg_muur: MUUR, sorg_saam: {}, sorg_woorde: {} })
  const res = maakRes()
  await handler({ method: 'GET', headers: {} }, res)
  kyk('GET word geweier', res.kode === 405, res.lyf)

  let r = await stuur({ toestel: 'jan', reaksie: 'bid' })
  kyk('sonder n plasing gebeur niks', r.kode === 400, r.lyf)

  r = await stuur({ muurId: 'bestaannie', toestel: 'jan', reaksie: 'bid' })
  kyk('n onbekende plasing gee 404', r.kode === 404, r.lyf)

  /* Die id-keuring is streng met opset: net letters en syfers. 'n Koppelteken
     of 'n skuinsstreep is nie 'n id van ons nie, en 'n pad soos
     `../../ander/versameling` moet nooit by die Firestore-URL kom nie. */
  r = await stuur({ muurId: 'bestaan-nie', toestel: 'jan', reaksie: 'bid' })
  kyk('n id met n koppelteken kom nie eens by Firestore nie', r.kode === 400, r.lyf)
  r = await stuur({ muurId: '../sorg_inkomend/x', toestel: 'jan', reaksie: 'bid' })
  kyk('n pad in die id word geweier', r.kode === 400, r.lyf)
}

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
