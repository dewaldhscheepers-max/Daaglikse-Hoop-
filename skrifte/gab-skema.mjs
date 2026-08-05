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

/* Die hele lêer, want dit is klein en dit is wat elke besoeker se blaaier
   in elk geval kry. Ons wil sien hoe die sleutel genoem word. */
se('   inhoud:')
se(cfg.lyf.split('\n').map(r => '     ' + r).join('\n'))

const mUrl = cfg.lyf.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i)

/* Supabase het twee vorms: die ou anon-JWT (eyJ....eyJ....sig) en die nuwe
   publiseerbare sleutel (sb_publishable_...). Ons aanvaar albei. */
const mSleutel =
  cfg.lyf.match(/sb_publishable_[A-Za-z0-9_-]{10,}/) ||
  cfg.lyf.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/)

let BASIS = mUrl && mUrl[0]
let SLEUTEL = mSleutel && mSleutel[0]

/* Staan die sleutel nie in config.js nie, sit hy in die Astro-bondel. */
if (!SLEUTEL) {
  se('')
  se('   Geen sleutel in config.js. Ons kyk in die bondels.')
  const tuis = await haalTeks(WERF + '/')
  const bates = [...new Set(
    [...tuis.lyf.matchAll(/(?:src|href)=["']([^"']+\.(?:js|mjs))(?:\?[^"']*)?["']/gi)].map(m => m[1])
  )]
  for (const b of bates.slice(0, 6)) {
    await pouse(700)
    const url = b.startsWith('http') ? b : WERF + (b.startsWith('/') ? b : '/' + b)
    const d = await haalTeks(url)
    const k = d.lyf.match(/sb_publishable_[A-Za-z0-9_-]{10,}/) ||
              d.lyf.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/)
    const u = d.lyf.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i)
    se(`     ${b} · ${d.lyf.length} karakters · sleutel: ${k ? 'JA' : 'nee'} · adres: ${u ? u[0] : 'nee'}`)
    if (k && !SLEUTEL) SLEUTEL = k[0]
    if (u && !BASIS) BASIS = u[0]
  }
}

if (!BASIS || !SLEUTEL) {
  se('')
  se('   Geen Supabase-adres of openbare sleutel gekry nie. Ons hou op.')
  process.exit(0)
}
se('   Supabase: ' + BASIS)
se('   anon-sleutel: ' + SLEUTEL.slice(0, 12) + '… (' + SLEUTEL.length + ' karakters, nie hier gestoor nie)')

/* Presies die kopteks wat hul eie bladsy stuur.

   Die eerste lopie het 401 gekry omdat ek die sleutel ook as
   "Authorization: Bearer" gestuur het. 'n sb_publishable_-sleutel is nie 'n
   JWT nie; Supabase verwag hom in die apikey-kopteks, en Authorization is vir
   'n aangemelde gebruiker se token. Dit was my fout, nie 'n muur nie.

   Werk hierdie een ook nie, is dit die muur, en dan hou ons op. */
const KOPPE = { apikey: SLEUTEL, accept: 'application/json' }

/* ── 2. Watter tabel gebruik hul eie kliëntkode? ──

   Ons raai nie tabelname nie. Hul bondel is openbare JavaScript en dit se
   presies watter tabelle die bladsy lees — .from('...') en enige
   /rest/v1/-pad. Dit is dieselfde as om na 'n werf se bronkode te kyk. */
se('')
se('== 2. Wat lees hul eie bladsy? ==')
const tuisblad = await haalTeks(WERF + '/')
const bondels = [...new Set(
  [...tuisblad.lyf.matchAll(/(?:src|href)=["']([^"']+\.(?:js|mjs))(?:\?[^"']*)?["']/gi)].map(m => m[1])
)]

const tabelle = new Set()
const paaie = new Set()
for (const b of bondels.slice(0, 6)) {
  await pouse(700)
  const url = b.startsWith('http') ? b : WERF + (b.startsWith('/') ? b : '/' + b)
  const d = await haalTeks(url)
  for (const m of d.lyf.matchAll(/\.from\(\s*["'`]([a-z0-9_]+)["'`]/gi)) tabelle.add(m[1])
  for (const m of d.lyf.matchAll(/\/rest\/v1\/([a-z0-9_]+)/gi)) tabelle.add(m[1])
  for (const m of d.lyf.matchAll(/["'`](\/rest\/v1\/[^"'`]*)["'`]/gi)) paaie.add(m[1])
  /* Ook: watter kolomme vra hulle? select('...') */
  for (const m of d.lyf.matchAll(/\.select\(\s*["'`]([^"'`]{2,120})["'`]/gi)) se('     select: ' + m[1])
  se(`   ${b} · ${d.lyf.length} karakters`)
}
se('   tabelle wat die kode noem: ' + ([...tabelle].join(', ') || '(geen)'))
if (paaie.size) se('   paaie: ' + [...paaie].join(' , '))

/* ── 3. Vra dieselfde as wat hul bladsy vra ── */
se('')
se('== 3. Lees, met dieselfde kopteks as hul bladsy ==')
const kandidate = [...tabelle]
if (!kandidate.length) {
  se('   Hul kode noem geen tabel nie. Ons kan nie verder sonder om te raai nie,')
  se('   en raai is presies wat ons nie doen nie. Ons hou op.')
  process.exit(0)
}

let werk = null
for (const t of kandidate.slice(0, 12)) {
  await pouse(800)
  const d = await haalTeks(`${BASIS}/rest/v1/${t}?select=*&limit=1`, { ...KOPPE, prefer: 'count=exact' })
  const reeks = d.koppe.get('content-range') || ''
  se(`   ${t} → ${d.status}${reeks ? ' · rye: ' + reeks : ''}`)
  if (d.status === 429) { se('   429 — te vinnig. Ons hou op.'); process.exit(0) }
  if (d.status === 200) {
    se('      ' + d.lyf.replace(/\s+/g, ' ').slice(0, 500))
    if (d.lyf.length > 20 && !werk) werk = t
  }
}

if (!werk) {
  se('')
  se('   Alles antwoord 401 of 403. Die openbare sleutel mag hierdie tabelle nie')
  se('   lees nie — dit is die muur, nie my kopteks nie. Ons hou hier op.')
  process.exit(0)
}

/* ── 4. Waar sit Genesis 1:1? ── */
se('')
se('== 4. Genesis 1:1 ==')
await pouse(800)
const proef = await haalTeks(`${BASIS}/rest/v1/${werk}?select=*&limit=3`, KOPPE)
se('   drie rye uit ' + werk + ':')
se('   ' + proef.lyf.replace(/\s+/g, ' ').slice(0, 900))

se('')
se('== Klaar ==')
se('')
