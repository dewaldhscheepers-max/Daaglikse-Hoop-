/* ── DIE MUUR AS EEN TEKSLÊER ──
 *
 * Dewald, 21 September 2026: *"kan jy moontlik vir my 'n txt file maak van
 * alles op die dra mekaar muur.... ek wil dit vir chat gpt stuur sodat ons kan
 * kyk waarmee mense die meeste sukkel en hoe om 'n Daaglikse Hoop series
 * rondom dit te bou."*
 *
 * Dit is 'n goeie vraag om aan die muur te vra. Veertig stories lees 'n mens
 * nie in sy kop bymekaar nie, en die app self wys hulle een vir een — wat reg
 * is vir 'n mens wat kom help, en nutteloos vir 'n mens wat wil sien wat
 * TERUGKEER.
 *
 * ── Wat hierin kom, en wat NOOIT ──
 *
 * Hierdie lêer verlaat die app. Dit gaan na 'n ander maatskappy se rekenaar,
 * en daarna kan ons dit nie terugvat nie. Die reël is dus enger as wat die
 * skerm self wys:
 *
 *   · die STORIE kom saam — dit is die hele punt;
 *   · die DATUM en die ONDERWERP kom saam — dit is hoe 'n mens patrone sien;
 *   · 'n NAAM kom NOOIT saam nie. Ook nie 'n foto, 'n toestel-id, 'n e-pos of
 *     'n dokument-id nie.
 *
 * Daardie laaste een is nie oorversigtigheid nie. 'n Mens wat sy naam by sy
 * storie gesit het, het dit vir HIERDIE muur gedoen, voor mense wat saam met
 * hom bid. Hy het dit nie gedoen om in 'n dataleer te beland nie. En vir die
 * vraag wat gevra word — waarmee sukkel mense — is sy naam in elk geval
 * heeltemal nutteloos.
 *
 * Om dieselfde rede loop die OPMERKINGS nie saam nie. Die vraag gaan oor wat
 * mense VRA, nie oor wat ander daaronder geskryf het nie, en elke opmerking is
 * nog 'n mens se woorde.
 *
 * ── Die telling staan BO ──
 *
 * Die eerste ding in die lêer is 'n tallie per onderwerp, want dit is
 * letterlik die vraag. 'n Mens wat net die getalle wil sien, hoef nie veertig
 * stories te lees nie, en 'n masjien wat dit lees, begin met die antwoord in
 * die hand.
 *
 * Hierdie lêer is SUIWER: data in, 'n string uit. Geen fetch, geen
 * `Date.now()`, geen `document`. Die knoppie in die admin doen die aflaai.
 */

import { onderwerpNaam } from './sorgOnderwerpe.js'

/* Die skeier tussen twee stories. Lank genoeg dat 'n mens dit raaksien en 'n
   masjien dit as 'n grens lees. */
const STREEP = '─'.repeat(60)

/* ── Die datum, sonder die uur ──
 *
 * 'n Tydstempel tot op die sekonde is 'n vingerafdruk: twee mense wat 45
 * sekondes uitmekaar geskryf het, is identifiseerbaar vir wie ook al daardie
 * aand gekyk het. Die DAG is genoeg om 'n patroon oor maande te sien. */
export function dagVan(p) {
  const d = p || {}
  const rou = String(d.datum || d.geskep || '')
  const m = rou.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? m[0] : ''
}

/* ── Die storie self, skoongemaak ──
 *
 * Die paragrawe bly — 'n mens skryf sy swaar ding in paragrawe, en 'n blok van
 * een paragraaf lees anders as wat hy bedoel is. Net beheerkarakters gaan uit.
 *
 * Die karakterreeks is met opset uitgeskryf en nie as 'n reeks nie; sien
 * CLAUDE.md se karakterreeks-fout. */
export function skoonStorie(t) {
  return String(t || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n').map(r => r.trim()).join('\n')
    .trim()
}

/* ── Hoeveel stories per onderwerp ──
 *
 * Aflopend, en met die naam soos dit op die skerm staan. 'n Gelykop telling
 * word alfabeties geskei sodat twee lopies dieselfde lêer gee — anders lyk 'n
 * tweede aflaai soos 'n verandering wat nie gebeur het nie. */
export function tellPerOnderwerp(plasings) {
  const lys = Array.isArray(plasings) ? plasings : []
  const tel = new Map()
  for (const p of lys) {
    const s = String((p && p.onderwerp) || 'ander')
    tel.set(s, (tel.get(s) || 0) + 1)
  }
  return [...tel.entries()]
    .map(([sleutel, getal]) => ({ sleutel, naam: onderwerpNaam(sleutel), getal }))
    .sort((a, b) => b.getal - a.getal || a.naam.localeCompare(b.naam))
}

/* ── Een storie ── */
function blok(p, nommer) {
  const reels = [`${nommer}. ${onderwerpNaam(String(p.onderwerp || 'ander'))}`]
  const dag = dagVan(p)
  if (dag) reels.push(`Datum: ${dag}`)
  const titel = skoonStorie(p.titel)
  if (titel) reels.push(`Titel: ${titel}`)
  reels.push('')
  reels.push(skoonStorie(p.teks))
  return reels.join('\n')
}

/* ── Die hele lêer ──
 *
 * `opskrif` sê vir wie dit ook al lees WAT dit is en wat dit nie is nie. Dit
 * is nie versiering nie: 'n lêer van veertig rou stories sonder 'n konteks-
 * reël is 'n lêer wat verkeerd gelees kan word. */
export function bouUittreksel(plasings, opsies) {
  const o = opsies || {}
  const lys = (Array.isArray(plasings) ? plasings : [])
    .filter(p => p && skoonStorie(p.teks).length > 0)

  /* Die leë reëls hier IS die uitleg. 'n Vroeë weergawe het die hele kop deur
     'n `.filter(r => r !== '')` gestuur om die opsionele datum-reël te laat
     val — en dit het elke leë reël saam weggevat, sodat die kop soos een blok
     gelees het. Die opsionele reël word dus BYGESIT, nooit uitgefiltreer. */
  const kop = ['DAAGLIKSE HOOP — DRA MEKAAR', '', `Stories op die muur: ${lys.length}`]
  if (o.opTrek) kop.push(`Uitgetrek: ${o.opTrek}`)
  kop.push(
    '',
    'Hierdie lêer dra NET die stories. Geen naam, geen foto, geen e-pos,',
    'geen toestel-id en geen opmerkings — net wat mense gevra het, met die',
    'datum en die onderwerp daarby.',
    '',
    STREEP,
    'WAAROOR DIE MEESTE GESKRYF WORD',
    STREEP,
    '',
  )

  for (const r of tellPerOnderwerp(lys)) {
    kop.push(`${String(r.getal).padStart(4, ' ')}  ${r.naam}`)
  }

  kop.push('')
  kop.push(STREEP)
  kop.push('DIE STORIES')
  kop.push(STREEP)
  kop.push('')

  const blokke = lys.map((p, i) => blok(p, i + 1))
  return kop.join('\n') + blokke.join(`\n\n${STREEP}\n\n`) + '\n'
}

/* Die lêernaam. 'n Datum daarin, want hy gaan dit meer as een keer trek en
   twee lêers met dieselfde naam in 'n aflaai-vouer is nutteloos. */
export function leernaam(dag) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(dag || '')) ? dag : ''
  return d ? `dra-mekaar-${d}.txt` : 'dra-mekaar.txt'
}
