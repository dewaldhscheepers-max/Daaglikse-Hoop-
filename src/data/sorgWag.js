/* ────────────────────────────────────────────────────────────
   Wat iemand kry terwyl hy op 'n antwoord wag.

   Dit is Dewald se idee, en dit los 'n gat wat ek nie klaar toegemaak het
   nie. Die reel is dat elke plasing en elke indiening iets moet dra wat
   help. Ek het dit op VIDEO'S laat terugval — maar daar is nog nul
   Sorg-video's, dus was die valpad leeg en die kaarte weer kaal.

   Die app is intussen vol van goed wat werk: honderde stemnotas op Luister
   en 'n hele rak gratis e-boeke. Daardie goed het nie op 'n antwoord gewag
   nie; hulle was nog altyd daar.

   Die volgorde is 'n besluit:

     1. 'n VIDEO as daar een is wat by die onderwerp pas. Dit is die naaste
        aan 'n antwoord.
     2. STEMNOTAS — drie. Dit is Dewald se eie stem, en dit is die ding wat
        die app se mense klaar ken en vertrou.
     3. 'n E-BOEK, heel laaste en klein. Iemand wat pas geskryf het dat hy
        nie meer wil lewe nie, moet nie 'n boekrak in die gesig kry nie.

   Die stemnotas word by ONDERWERP gekies waar dit kan — die titel en die
   reeks word teen 'n paar woorde getoets. Tref niks, vat ons die nuutstes.
   Dit is nie slim nie, en dit hoef nie te wees nie: 'n stemnota van Dewald
   is in elk geval nooit die verkeerde ding nie.
   ──────────────────────────────────────────────────────────── */

/* Met die .js-uitbreiding, sodat plain `node` hierdie lêer kan invoer —
   die toetse loop sonder 'n toetsraamwerk en sonder Vite. */
import { BOOKS } from './books.js'
import { plat } from './sorgKrisis.js'

/* Woorde wat by 'n onderwerp pas. Nie 'n woordeboek nie — net genoeg om 'n
   stemnota oor rou by iemand in rou uit te bring. */
const WOORDE = {
  angs:       ['angs', 'bekommer', 'vrees', 'bang', 'paniek', 'rus', 'vrede'],
  donker:     ['depressie', 'donker', 'moedeloos', 'hopeloos', 'leeg', 'moeg'],
  rou:        ['rou', 'verlies', 'dood', 'oorlede', 'hartseer', 'treur'],
  sterwend:   ['sterf', 'sterwe', 'afskeid', 'laaste', 'dood', 'oorgee'],
  siekte:     ['siek', 'gesondheid', 'pyn', 'hospitaal', 'kanker', 'genees', 'liggaam'],
  ouerword:   ['ouer', 'oud', 'ma', 'pa', 'versorg', 'sorg'],
  huwelik:    ['huwelik', 'man', 'vrou', 'verhouding', 'egskeiding', 'trou'],
  skeiding:   ['egskeiding', 'skei', 'verlaat', 'huwelik', 'alleen'],
  kinders:    ['kind', 'kinders', 'ouer', 'ma', 'pa', 'familie', 'seun', 'dogter'],
  eensaam:    ['eensaam', 'alleen', 'verwerp', 'verwerping'],
  vergifnis:  ['vergifnis', 'vergewe', 'bitter', 'wrok'],
  woede:      ['woede', 'kwaad', 'bitter', 'wrok', 'haat'],
  skaamte:    ['skaam', 'skaamte', 'skuld', 'sonde', 'genade', 'vergewe'],
  waarde:     ['waarde', 'genoeg', 'selfbeeld', 'identiteit', 'minderwaardig'],
  grense:     ['grens', 'grense', 'nee', 'oorweldig', 'uitgeput'],
  besluit:    ['besluit', 'keuse', 'pad', 'rigting', 'wysheid', 'lei'],
  twyfel:     ['twyfel', 'geloof', 'God', 'stil', 'vergeet', 'ver'],
  verslawing: ['verslaaf', 'verslawing', 'drank', 'alkohol', 'dwelm', 'gewoonte', 'vry'],
  geld:       ['geld', 'finansi', 'skuld', 'werkloos', 'brood'],
  werk:       ['werk', 'roeping', 'beroep', 'werkloos', 'doel'],
  onseker:    ['moeg', 'te veel', 'swaar', 'uitgeput', 'sterk'],
  ander:      [],
}

let notasBelofte = null
let boekeBelofte = null

/* Die stemnotas kom REGSTREEKS uit Firestore, want `notes` is klaar oop vir
   lees (sien firestore.rules) en Luister doen dit al so. Een keer per sessie
   gehaal; 'n mislukking word nie onthou nie.

   Firebase word LUI ingevoer. Die res van hierdie lêer is suiwer keuse-logika
   en die toetse loop met plain `node`, wat nie 'n Firebase-bondel kan laai
   nie. Met 'n gewone invoer bo-aan sou die hele lêer ontoetsbaar wees — en
   dan is die deel wat werklik kan stukkend gaan, die deel wat niemand
   toets nie. */
export function haalNotas() {
  if (!notasBelofte) {
    notasBelofte = (async () => {
      const { db } = await import('../firebase')
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore')
      const k = await getDocs(query(collection(db, 'notes'), orderBy('publishedAt', 'desc'), limit(120)))
      return k.docs.map(d => ({ id: d.id, ...d.data() })).filter(n => n.audioUrl)
    })().catch(() => { notasBelofte = null; return [] })
  }
  return notasBelofte
}

/* Drie stemnotas wat by die onderwerp pas, aangevul met die nuutstes. */
export function notasVir(onderwerp, notas, hoeveel = 3) {
  if (!Array.isArray(notas) || !notas.length) return []

  const woorde = (WOORDE[onderwerp] || []).map(w => plat(w))
  const pas = woorde.length
    ? notas.filter(n => {
        const p = plat(`${n.title || ''} ${n.series || ''} ${n.scripture || ''}`)
        return woorde.some(w => p.includes(w))
      })
    : []

  const uit = [...pas]
  for (const n of notas) {
    if (uit.length >= hoeveel) break
    if (!uit.some(x => x.id === n.id)) uit.push(n)
  }
  return uit.slice(0, hoeveel)
}

/* ── Die boeke se PDF-skakels ──

   `books.js` hou die katalogus, maar die pdfUrl staan daar op `null` — die
   werklike skakel kom uit Firestore se `books`-versameling, want die PDF's
   word opgelaai en nie in die kode gesit nie. Meer.jsx doen dit al so, en
   `books` is klaar oop vir lees.

   Sonder hierdie oproep sou ons 'n boek kon wys sonder 'n manier om dit te
   kry, en dan is dit 'n advertensie in plaas van hulp. */
export function haalBoeke() {
  if (!boekeBelofte) {
    boekeBelofte = (async () => {
      const { db } = await import('../firebase')
      const { collection, getDocs } = await import('firebase/firestore')
      const k = await getDocs(collection(db, 'books'))
      const uit = {}
      k.forEach(d => { uit[d.id] = d.data() || {} })
      return uit
    })().catch(() => { boekeBelofte = null; return {} })
  }
  return boekeBelofte
}

/* Een gratis e-boek MET 'n werkende aflaaiskakel.

   Is daar geen skakel nie, gee ons NIKS terug. Dewald was hieroor duidelik:
   niemand word na die boekeblad gestuur nie. 'n Boek wat 'n mens nie hier kan
   oopmaak nie, hoort dus glad nie hier nie. */
export function boekMetPdf(onderwerp, oorskryf) {
  const b = boekVir(onderwerp)
  if (!b) return null
  const ov = (oorskryf && oorskryf[b.id]) || {}
  const pdfUrl = ov.pdfUrl || b.pdfUrl || null
  return pdfUrl ? { ...b, pdfUrl } : null
}

/* Een gratis e-boek. Altyd gratis — nooit 'n prys op hierdie skerm nie. */
export function boekVir(onderwerp) {
  const gratis = BOOKS.filter(b => b.free)
  if (!gratis.length) return null

  const woorde = (WOORDE[onderwerp] || []).map(w => plat(w))
  const pas = gratis.find(b => {
    const p = plat(`${b.title || ''} ${b.desc || ''}`)
    return woorde.some(w => p.includes(w))
  })
  return pas || gratis[0]
}
