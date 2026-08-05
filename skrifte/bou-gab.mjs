/* ────────────────────────────────────────────────────────────
   Bou die GAB se lêers vir die app.

     node skrifte/bou-gab.mjs <bronlêer> [uitgeegids]

   Verstek uitgeegids is public/gab.

   Die bronlêer is wat die Getroue Afrikaanse Bybel-projek vir ons gee. Ons
   weet nie vooraf watter vorm dit het nie, dus aanvaar hierdie skrif drie:

   1. Genes: { "GEN": { "1": { "1": "teks", "2": "teks" }, ... }, ... }
   2. Rye:   [ { "boek": "GEN", "hoofstuk": 1, "vers": 1, "teks": "..." } ]
             (ook book/chapter/verse/text, en b/c/v/t)
   3. CSV:   boek,hoofstuk,vers,teks   — met of sonder 'n kopreel

   Dit skryf public/gab/indeks.json plus een lêer per boek, in die vorm wat
   src/data/gab.js verwag.

   ── Wat hierdie skrif NIE doen nie ──

   Dit verander nooit een karakter van die teks nie. Die CC BY-NC-ND-lisensie
   verbied afgeleide werke; 'n "reggemaakte" of "netjies gemaakte" teks is 'n
   afgeleide werk. Geen spelling, geen leesteken, geen hoofletter. Wat inkom,
   gaan uit.

   Die enigste ding wat wel gebeur, is dat wit spasie aan die punte afgesny
   word, want dit is 'n eienskap van die lêerformaat en nie van die teks nie.
   ──────────────────────────────────────────────────────────── */

import fs from 'node:fs'
import path from 'node:path'
import { BOEKE } from '../src/data/bybelBoeke.js'

const KODES = Object.keys(BOEKE)
const KODE_STEL = new Set(KODES)

/* Die Bybel het 31 102 verse in die KJV-telling. Dit is nie 'n wet nie —
   party uitgawes tel anders — maar 'n groot verskil beteken die bronlêer is
   onvolledig, en dit moet 'n mens sien voordat dit ontplooi word. */
const VERWAGTE_VERSE = 31102

function stop(boodskap) {
  console.error('\n  ' + boodskap + '\n')
  process.exit(1)
}

/* ── Die bron inlees ── */

function normaliseerKode(rou) {
  const k = String(rou).trim().toUpperCase()
  if (KODE_STEL.has(k)) return k
  // 'n Naam in plaas van 'n kode
  const opNaam = KODES.find(c => BOEKE[c].toLowerCase() === String(rou).trim().toLowerCase())
  return opNaam || null
}

function leesRye(rye) {
  const uit = new Map()
  let nr = 0
  for (const r of rye) {
    nr++
    const kodeRou = r.boek ?? r.book ?? r.b
    const h = Number(r.hoofstuk ?? r.chapter ?? r.c)
    const v = Number(r.vers ?? r.verse ?? r.v)
    const t = r.teks ?? r.text ?? r.t
    const kode = normaliseerKode(kodeRou)
    if (!kode) stop(`Ry ${nr}: onbekende boek "${kodeRou}"`)
    if (!Number.isInteger(h) || h < 1) stop(`Ry ${nr}: hoofstuk "${r.hoofstuk ?? r.chapter}" is nie 'n getal nie`)
    if (!Number.isInteger(v) || v < 1) stop(`Ry ${nr}: vers "${r.vers ?? r.verse}" is nie 'n getal nie`)
    if (typeof t !== 'string') stop(`Ry ${nr}: geen teks nie`)
    if (!uit.has(kode)) uit.set(kode, new Map())
    const boek = uit.get(kode)
    if (!boek.has(h)) boek.set(h, new Map())
    boek.get(h).set(v, t.trim())
  }
  return uit
}

function leesGenes(o) {
  const rye = []
  for (const [kodeRou, hoofstukke] of Object.entries(o)) {
    for (const [h, verse] of Object.entries(hoofstukke || {})) {
      for (const [v, t] of Object.entries(verse || {})) {
        rye.push({ boek: kodeRou, hoofstuk: h, vers: v, teks: t })
      }
    }
  }
  return leesRye(rye)
}

/* 'n Klein CSV-leser wat aanhalings en ingeslote kommas hanteer. */
function leesCsv(teks) {
  const rye = []
  let veld = '', ry = [], inAanhaling = false
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i]
    if (inAanhaling) {
      if (c === '"' && teks[i + 1] === '"') { veld += '"'; i++ }
      else if (c === '"') inAanhaling = false
      else veld += c
    } else if (c === '"') inAanhaling = true
    else if (c === ',') { ry.push(veld); veld = '' }
    else if (c === '\n') { ry.push(veld); rye.push(ry); ry = []; veld = '' }
    else if (c !== '\r') veld += c
  }
  if (veld || ry.length) { ry.push(veld); rye.push(ry) }

  const skoon = rye.filter(r => r.length >= 4 && r.some(x => x.trim()))
  if (!skoon.length) stop('Die CSV is leeg')
  // Kopreel wegvat as die eerste ry nie 'n geldige boek is nie
  const begin = normaliseerKode(skoon[0][0]) ? 0 : 1
  return leesRye(skoon.slice(begin).map(r => ({ boek: r[0], hoofstuk: r[1], vers: r[2], teks: r[3] })))
}

function leesBron(pad) {
  const rou = fs.readFileSync(pad, 'utf8')
  if (pad.toLowerCase().endsWith('.csv')) return leesCsv(rou)
  let d
  try { d = JSON.parse(rou) } catch (e) { stop('Kon nie die lêer as JSON of CSV lees nie: ' + e.message) }
  if (Array.isArray(d)) return leesRye(d)
  if (d && typeof d === 'object') return leesGenes(d)
  stop('Onbekende vorm in die bronlêer')
}

/* ── Keur en skryf ── */

function keurEnBou(data) {
  const boeke = KODES.filter(k => data.has(k))
  const ontbreek = KODES.filter(k => !data.has(k))
  const uit = []
  let totaalVerse = 0

  for (const kode of boeke) {
    const hoofstukke = data.get(kode)
    const nommers = [...hoofstukke.keys()].sort((a, b) => a - b)
    for (let i = 0; i < nommers.length; i++) {
      if (nommers[i] !== i + 1)
        stop(`${BOEKE[kode]}: hoofstuk ${i + 1} ontbreek (kry ${nommers[i]})`)
    }
    const lys = nommers.map(h => {
      const verse = hoofstukke.get(h)
      const vNommers = [...verse.keys()].sort((a, b) => a - b)
      for (let i = 0; i < vNommers.length; i++) {
        if (vNommers[i] !== i + 1)
          stop(`${BOEKE[kode]} ${h}: vers ${i + 1} ontbreek (kry ${vNommers[i]})`)
      }
      const teks = vNommers.map(v => {
        const t = verse.get(v)
        if (!t) stop(`${BOEKE[kode]} ${h}:${v} is leeg`)
        return t
      })
      totaalVerse += teks.length
      return teks
    })
    uit.push({ kode, hoofstukke: lys })
  }

  return { uit, boeke, ontbreek, totaalVerse }
}

/* ── Loop ── */

const [, , bronPad, gidsArg] = process.argv
if (!bronPad) stop('Gebruik: node skrifte/bou-gab.mjs <bronlêer> [uitgeegids]')
if (!fs.existsSync(bronPad)) stop(`Kry nie ${bronPad} nie`)

const gids = gidsArg || 'public/gab'
const weergawe = new Date().toISOString().slice(0, 10)

const data = leesBron(bronPad)
const { uit, boeke, ontbreek, totaalVerse } = keurEnBou(data)

fs.mkdirSync(gids, { recursive: true })
for (const f of fs.readdirSync(gids)) {
  if (f.endsWith('.json')) fs.unlinkSync(path.join(gids, f))
}

let grepe = 0
for (const { kode, hoofstukke } of uit) {
  const lyf = JSON.stringify({ boek: kode, weergawe, hoofstukke })
  fs.writeFileSync(path.join(gids, `${kode}.json`), lyf)
  grepe += Buffer.byteLength(lyf)
}
fs.writeFileSync(path.join(gids, 'indeks.json'),
  JSON.stringify({ weergawe, boeke: uit.map(x => x.kode) }))

console.log('')
console.log(`  ${uit.length} van 66 boeke geskryf na ${gids}`)
console.log(`  ${totaalVerse.toLocaleString('af-ZA')} verse · ${(grepe / 1048576).toFixed(1)} MB`)
console.log(`  weergawe ${weergawe}`)

if (ontbreek.length) {
  console.log('')
  console.log(`  LET OP — ${ontbreek.length} boeke ontbreek:`)
  console.log('  ' + ontbreek.map(k => BOEKE[k]).join(', '))
  console.log('  Die app wys net die boeke wat hier is. Dit werk, maar dit is onvolledig.')
}
if (totaalVerse !== VERWAGTE_VERSE) {
  console.log('')
  console.log(`  LET OP — ${totaalVerse} verse, nie ${VERWAGTE_VERSE} nie.`)
  console.log("  Verskillende uitgawes tel anders, maar 'n groot verskil beteken")
  console.log('  gewoonlik die bronlêer is onvolledig. Gaan dit na voor jy stoot.')
}
console.log('')
