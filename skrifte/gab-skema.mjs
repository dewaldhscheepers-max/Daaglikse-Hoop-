/* ────────────────────────────────────────────────────────────
   Kyk hoe die GAB se openbare data lyk, voordat ons dit haal.

     node skrifte/gab-skema.mjs

   Hoekom dit nodig is: hul leser trek elke hoofstuk uit Supabase. Ons weet
   nie watter tabelle en kolomme daar is nie, en 'n mens moet nie raai as 'n
   mens kan vra nie.

   ── Wat ons gebruik, en wat ons NIE gebruik nie ──

   Ons lees hul eie config.js — die lêer wat elke besoeker se blaaier klaar
   aflaai — en gebruik die anon-sleutel daaruit. Dit is die sleutel wat vir
   ongeverifieerde besoekers bedoel is; dit is hul openbare leeskoppelvlak.
   PostgREST gee by die wortel 'n OpenAPI-beskrywing van presies dit wat
   daardie sleutel mag sien.

   Ons omseil niks nie: geen aanmelding, geen RLS, geen diensrol-sleutel,
   geen administrateur-endpunt. Sien ons 401, 403 of 429, hou ons dadelik op.

   Die sleutel word NOOIT in hierdie repo geskryf nie. Dit word by elke lopie
   uit hul openbare config gelees, sodat ons weergawe ophou werk as hulle dit
   ooit verander — wat reg is.
   ──────────────────────────────────────────────────────────── */

const WERF = 'https://getroueafrikaansebybel.com'
const DRAAD = 'In die begin het God die hemel en die aarde geskape'

const AGENT = 'DaaglikseHoop/1.0 (+https://dewaldscheepers.com; gratis Afrikaanse app; GAB onder CC BY-NC-ND 4.0)'

function se(...d) { console.log(...d) }
function pouse(ms) { return new Promise(r => setTimeout(r, ms)) }

async function haalTeks(url, koppe = {}) {
  const r = await fetch(url, { headers: { 'user-agent': AGENT, ...koppe } })
  return { status: r.status, koppe: r.headers, lyf: await r.text() }
}

/* ── 1. Die openbare config ── */
se('')
se('== 1. Hul openbare config.js ==')
const cfg = await haalTeks(WERF + '/config.js')
se('   status: ' + cfg.status + ' · ' + cfg.lyf.length + ' karakters')
if (cfg.status !== 200) { se('   Kon dit nie kry nie. Ons hou op.'); process.exit(0) }

const mUrl = cfg.lyf.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i)
/* 'n Supabase anon-sleutel is 'n JWT: drie base64-dele met punte tussenin. */
const mSleutel = cfg.lyf.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/)

if (!mUrl || !mSleutel) {
  se('   Geen Supabase-adres of anon-sleutel in die config nie. Ons hou op.')
  process.exit(0)
}
const BASIS = mUrl[0]
const SLEUTEL = mSleutel[0]
se('   Supabase: ' + BASIS)
se('   anon-sleutel: ' + SLEUTEL.slice(0, 12) + '… (' + SLEUTEL.length + ' karakters, nie hier gestoor nie)')

const KOPPE = { apikey: SLEUTEL, authorization: 'Bearer ' + SLEUTEL, accept: 'application/json' }

/* ── 2. Wat mag hierdie sleutel sien? ── */
se('')
se('== 2. Die tabelle wat die openbare sleutel mag lees ==')
await pouse(800)
const wortel = await haalTeks(BASIS + '/rest/v1/', KOPPE)
if ([401, 403, 429].includes(wortel.status)) {
  se('   status ' + wortel.status + ' — die sleutel mag dit nie. Ons hou op.')
  process.exit(0)
}
se('   status: ' + wortel.status)

let spek = null
try { spek = JSON.parse(wortel.lyf) } catch { /* nie JSON nie */ }

let tabelle = []
if (spek && spek.definitions) tabelle = Object.keys(spek.definitions)
else if (spek && spek.paths) tabelle = Object.keys(spek.paths).filter(p => p !== '/').map(p => p.slice(1))

if (!tabelle.length) {
  se('   Geen tabellelys nie. Rou antwoord, eerste 600 karakters:')
  se('   ' + wortel.lyf.replace(/\s+/g, ' ').slice(0, 600))
} else {
  se('   ' + tabelle.length + ' tabel(le): ' + tabelle.join(', '))
}

/* Die kolomme van elke tabel wat na verse of boeke lyk */
const interessant = tabelle.filter(t => /vers|verse|chapter|hoofstuk|book|boek|bible|bybel|gab|scripture/i.test(t))
se('')
se('   Lyk soos Bybeldata: ' + (interessant.join(', ') || '(niks)'))
for (const t of (interessant.length ? interessant : tabelle).slice(0, 8)) {
  const d = spek && spek.definitions && spek.definitions[t]
  if (d && d.properties) se('     ' + t + ': ' + Object.keys(d.properties).join(', '))
}

/* ── 3. Een ry, om te sien hoe die data werklik lyk ── */
se('')
se('== 3. Een ry uit elke kandidaat ==')
for (const t of (interessant.length ? interessant : tabelle).slice(0, 6)) {
  await pouse(800)
  const d = await haalTeks(`${BASIS}/rest/v1/${t}?select=*&limit=1`, KOPPE)
  if ([401, 403, 429].includes(d.status)) { se(`   ${t} → ${d.status}, ons hou op.`); break }
  se(`   ${t} → ${d.status} · ${d.lyf.replace(/\s+/g, ' ').slice(0, 400)}`)
}

/* ── 4. Kan ons Genesis 1:1 by die naam kry? ── */
se('')
se('== 4. Hoeveel rye is daar, en waar is Genesis 1:1? ==')
for (const t of interessant.slice(0, 4)) {
  await pouse(800)
  /* Prefer count zonder die rye self te trek */
  const c = await haalTeks(`${BASIS}/rest/v1/${t}?select=*&limit=1`, { ...KOPPE, prefer: 'count=exact' })
  const reeks = c.koppe.get('content-range') || '(geen)'
  se(`   ${t}: content-range ${reeks}`)
}

await pouse(800)
for (const t of interessant.slice(0, 4)) {
  const kolomme = (spek && spek.definitions && spek.definitions[t] && Object.keys(spek.definitions[t].properties || {})) || []
  const teksKol = kolomme.find(k => /^(teks|text|afrikaans|afr|gab|verse_text|content|body)$/i.test(k))
  if (!teksKol) continue
  await pouse(800)
  const d = await haalTeks(`${BASIS}/rest/v1/${t}?select=*&${teksKol}=like.*${encodeURIComponent('In die begin het God')}*&limit=2`, KOPPE)
  if ([401, 403, 429].includes(d.status)) { se(`   ${t} → ${d.status}, ons hou op.`); break }
  const raak = d.lyf.includes(DRAAD)
  se(`   ${t}.${teksKol} soek "In die begin het God" → ${d.status}${raak ? '  ← GEVIND' : ''}`)
  if (raak) se('      ' + d.lyf.replace(/\s+/g, ' ').slice(0, 500))
}

se('')
se('== Klaar ==')
se('')
