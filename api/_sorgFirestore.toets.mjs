/* ────────────────────────────────────────────────────────────
   Die Firestore-laag onder Pastorale Sorg.

     node api/_sorgFirestore.toets.mjs

   Een ding hier is belangriker as al die res: `lysDokke` MOET deur al die
   bladsye loop.

   Firestore se REST-API gee die dokumente in volgorde van hul NAAM, en net
   een bladsy op 'n slag. Ons id's begin met die tyd, dus is alfabetiese
   volgorde tydvolgorde, en die eerste bladsy is die OUDSTE driehonderd.
   Ignoreer 'n mens die `nextPageToken`, verdwyn elke NUWE boodskap sodra die
   versameling driehonderd verbysteek — stil, sonder 'n fout, maande later.

   Ons vervang `fetch` met 'n nagemaakte bediener en tel die bladsye.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'

/* Die diensrekening word nagemaak sodat kryToken() nie regtig gaan haal nie.
   Ons raak NOOIT aan die lewende projek nie — sien CLAUDE.md. */
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

/* ── Die nagemaakte bediener ── */
let versoeke = []
function stelBediener({ totaal, perBladsy = 300, status = 200 }) {
  versoeke = []
  globalThis.fetch = async (url, opsies) => {
    const u = String(url)

    /* Die toegangstoken */
    if (u.includes('oauth2.googleapis.com')) {
      return { ok: true, status: 200, json: async () => ({ access_token: 'toets-token' }) }
    }

    versoeke.push(u)
    if (status !== 200) {
      return { ok: false, status, json: async () => ({}) }
    }

    const vraag = new URL(u).searchParams
    const begin = Number(vraag.get('pageToken') || 0)
    const grootte = Number(vraag.get('pageSize') || 300)
    const einde = Math.min(begin + grootte, totaal)

    const documents = []
    for (let i = begin; i < einde; i++) {
      documents.push({
        name: `projects/p/databases/(default)/documents/toets/d${String(i).padStart(5, '0')}`,
        fields: { nommer: { integerValue: String(i) } },
      })
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        documents,
        ...(einde < totaal ? { nextPageToken: String(einde) } : {}),
      }),
    }
  }
}

const { lysDokke, naVeld, uitVeld, uitDok, magSkryf, MIN_WAGWOORD } =
  await import('./_sorgFirestore.mjs')

afdeling('lysDokke moet deur AL die bladsye loop')
{
  stelBediener({ totaal: 12 })
  let d = await lysDokke('toets')
  kyk('minder as een bladsy', d.length === 12, d.length)
  kyk('een versoek', versoeke.length === 1, versoeke.length)

  /* Presies die geval wat stil sou breek. */
  stelBediener({ totaal: 750 })
  d = await lysDokke('toets')
  kyk('750 dokumente kom ALMAL deur', d.length === 750, d.length)
  kyk('drie bladsye gehaal', versoeke.length === 3, versoeke.length)
  kyk('die NUUTSTE is daar', d[d.length - 1].nommer === 749, d[d.length - 1])
  kyk('die oudste is ook daar', d[0].nommer === 0, d[0])

  stelBediener({ totaal: 301 })
  d = await lysDokke('toets')
  kyk('301 — een oor die ou perk', d.length === 301, d.length)

  stelBediener({ totaal: 0 })
  d = await lysDokke('toets')
  kyk('leeg is leeg', d.length === 0)

  /* Die perk mag nie stil afkap nie — hy waarsku. */
  stelBediener({ totaal: 5000 })
  const ouWarn = console.warn
  let gewaarsku = false
  console.warn = () => { gewaarsku = true }
  d = await lysDokke('toets', { maks: 600 })
  console.warn = ouWarn
  kyk('die perk hou op by die perk', d.length >= 600 && d.length <= 900, d.length)
  kyk('die perk waarsku hardop', gewaarsku)

  stelBediener({ totaal: 10, status: 404 })
  d = await lysDokke('toets')
  kyk('n versameling wat nie bestaan nie gee leeg', d.length === 0)

  stelBediener({ totaal: 10, status: 500 })
  let gegooi = false
  try { await lysDokke('toets') } catch { gegooi = true }
  kyk('n regte fout word gegooi', gegooi)
}

afdeling('Die waardevorm, heen en terug')
{
  const heen = w => uitVeld(naVeld(w))
  kyk('string', heen('hallo') === 'hallo')
  kyk('heelgetal', heen(42) === 42)
  kyk('nul', heen(0) === 0)
  kyk('negatief', heen(-7) === -7)
  kyk('desimaal', heen(1.5) === 1.5)
  kyk('waar', heen(true) === true)
  kyk('vals', heen(false) === false, heen(false))
  kyk('null', heen(null) === null)
  kyk('lys', JSON.stringify(heen([1, 'twee', true])) === '[1,"twee",true]', heen([1, 'twee', true]))
  kyk('leë lys', JSON.stringify(heen([])) === '[]', heen([]))
  kyk('kaart', heen({ a: 1, b: 'twee' }).a === 1)
  kyk('kaart in kaart', heen({ a: { b: { c: 3 } } }).a.b.c === 3)
  kyk('datum word n tydstempel', typeof heen(new Date('2026-08-05T10:00:00Z')) === 'string')

  /* Die goed wat werklik in 'n boodskap voorkom */
  kyk('aksente oorleef', heen('Ek is moeg, mét alles') === 'Ek is moeg, mét alles')
  kyk('nuwe reels oorleef', heen('een\ntwee') === 'een\ntwee')
  kyk('n leë string is nie null nie', heen('') === '')
  kyk('groot getal bly heel', heen(1754400000000) === 1754400000000, heen(1754400000000))

  kyk('uitDok sit die id by', uitDok({ name: 'a/b/c/xyz', fields: {} }).id === 'xyz')
  kyk('uitDok sonder velde breek nie', typeof uitDok({ name: 'a/b' }) === 'object')
  kyk('uitDok van niks breek nie', typeof uitDok(null) === 'object')
}

afdeling('Wie mag skryf')
{
  const req = g => ({ headers: g === null ? {} : { 'x-sorg-geheim': g } })
  kyk('die regte geheim', magSkryf(req(process.env.SORG_ADMIN_GEHEIM)).ok)
  kyk('geen geheim', !magSkryf(req(null)).ok)
  kyk('leë geheim', !magSkryf(req('')).ok)
  kyk('verkeerde geheim', !magSkryf(req('iets-heeltemal-anders')).ok)
  kyk('korter geheim', !magSkryf(req(process.env.SORG_ADMIN_GEHEIM.slice(0, -1))).ok)
  kyk('langer geheim', !magSkryf(req(process.env.SORG_ADMIN_GEHEIM + 'x')).ok)

  /* Is die veranderlike te kort of afwesig, gaan NIKS oop nie. */
  const bewaar = process.env.SORG_ADMIN_GEHEIM
  process.env.SORG_ADMIN_GEHEIM = ''
  kyk('geen geheim opgestel — alles toe', !magSkryf(req('enigiets')).ok)
  process.env.SORG_ADMIN_GEHEIM = 'kort'
  kyk('te kort opgestel — alles toe', !magSkryf(req('kort')).ok)
  process.env.SORG_ADMIN_GEHEIM = bewaar

  kyk('die minimum is 12', MIN_WAGWOORD === 12, MIN_WAGWOORD)
}

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
