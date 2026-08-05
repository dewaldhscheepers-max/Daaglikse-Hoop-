/* ────────────────────────────────────────────────────────────
   Waar staan die GAB se lêers, en hoe lyk hulle binne?

     node skrifte/gab-skema.mjs

   Die vorige lopie het die antwoord op die groot vraag gegee. Hul bondel se
   fetch-oproepe is:

       Ye + "index.json"
       Ye + "books/" + e + ".json"

   Die Bybelteks is dus NIE in Supabase nie. Dit is gewone statiese
   JSON-lêers op hul webbediener — 'n indeks plus een lêer per boek. Supabase
   word net vir `suggestions` en aanmelding gebruik.

   Daar is dus geen sleutel, geen databasis, geen RLS en niks om te omseil
   nie. Om daardie lêers te lees is presies dieselfde as om hul bladsy oop te
   maak.

   Hierdie skrif doen drie dinge en hou dan op:
     1. lees uit hul eie kode wat `Ye` is — die basispad;
     2. haal index.json en druk dit;
     3. haal een boek en druk sy vorm.

   Drie versoeke. Dan weet ons presies hoe om die res te haal.
   ──────────────────────────────────────────────────────────── */

const WERF = 'https://getroueafrikaansebybel.com'
const AGENT = 'DaaglikseHoop-GAB-Importer/1.0; one-time non-commercial import; dewaldscheepers.com'

function se(...d) { console.log(...d) }
function pouse(ms) { return new Promise(r => setTimeout(r, ms)) }

async function haal(url) {
  const r = await fetch(url, { headers: { 'user-agent': AGENT } })
  return { status: r.status, lyf: await r.text() }
}

/* ── 1. Die basispad uit hul kode ── */
se('')
se('== 1. Wat is die basispad? ==')
const tuis = await haal(WERF + '/')
const bates = [...new Set(
  [...tuis.lyf.matchAll(/(?:src|href)=["']([^"']+\.(?:js|mjs))(?:\?[^"']*)?["']/gi)].map(m => m[1])
)].filter(b => /\.(js|mjs)$/.test(b))

let basis = null
for (const b of bates) {
  await pouse(700)
  const url = b.startsWith('http') ? b : WERF + (b.startsWith('/') ? b : '/' + b)
  const d = await haal(url)
  if (d.status !== 200) continue

  /* Vind die naam voor +"index.json" */
  const m = d.lyf.match(/([A-Za-z_$][\w$]*)\s*\+\s*["']index\.json["']/)
  if (!m) continue
  const naam = m[1]
  se(`   ${b}: die veranderlike heet ${naam}`)

  /* Waar word dit toegeken? Enige van: const Ye="...", Ye="...", ,Ye="..." */
  const toeken = new RegExp('(?:const |let |var |,|;|\\{|\\()\\s*' + naam + '\\s*=\\s*["\'`]([^"\'`]{1,120})["\'`]')
  const t = d.lyf.match(toeken)
  if (t) {
    basis = t[1]
    se(`   ${naam} = "${basis}"`)
  } else {
    /* Dalk word dit uit stukke gebou. Wys die omgewing sodat 'n mens kan sien. */
    const i = d.lyf.indexOf(naam + '=')
    se('   Geen eenvoudige toekenning nie. Omgewing:')
    se('   ' + d.lyf.slice(Math.max(0, i - 200), i + 200).replace(/\s+/g, ' '))
  }
  break
}

if (!basis) {
  se('')
  se('   Kon die basispad nie uit die kode lees nie. Ons hou op — raai is')
  se('   presies wat ons nie doen nie.')
  process.exit(0)
}

const BASIS = basis.startsWith('http') ? basis : WERF + (basis.startsWith('/') ? basis : '/' + basis)
const VOL = BASIS.endsWith('/') ? BASIS : BASIS + '/'
se('   volledige basis: ' + VOL)

/* ── 2. index.json ── */
se('')
se('== 2. index.json ==')
await pouse(1500)
const idx = await haal(VOL + 'index.json')
se('   status: ' + idx.status + ' · ' + idx.lyf.length + ' karakters')
if (idx.status !== 200) { se('   Ons hou op.'); process.exit(0) }
se('   ' + idx.lyf.replace(/\s+/g, ' ').slice(0, 1600))

/* ── 3. Een boek ── */
let d = null
try { d = JSON.parse(idx.lyf) } catch { /* nie JSON nie */ }

/* Watter sleutel in die indeks is die boeklys? */
let boeke = null
if (Array.isArray(d)) boeke = d
else if (d && typeof d === 'object') {
  for (const [k, v] of Object.entries(d)) {
    if (Array.isArray(v) && v.length >= 60) { se('   boeklys onder "' + k + '" (' + v.length + ')'); boeke = v; break }
  }
}

se('')
se('== 3. Een boek ==')
if (!boeke || !boeke.length) {
  se("   Kon nie 'n boeklys in die indeks kry nie. Die inhoud hierbo wys hoe dit lyk.")
  process.exit(0)
}

const eerste = boeke[0]
const sleutelVanBoek = typeof eerste === 'string'
  ? eerste
  : (eerste.id || eerste.slug || eerste.file || eerste.code || eerste.abbr || eerste.osis || eerste.key)

se('   eerste inskrywing: ' + JSON.stringify(eerste).slice(0, 300))
se('   ons vra vir: books/' + sleutelVanBoek + '.json')

await pouse(1500)
const boek = await haal(VOL + 'books/' + sleutelVanBoek + '.json')
se('   status: ' + boek.status + ' · ' + boek.lyf.length + ' karakters')
if (boek.status === 200) {
  se('   eerste 1500 karakters:')
  se('   ' + boek.lyf.replace(/\s+/g, ' ').slice(0, 1500))
}

se('')
se('== Klaar ==')
se('')
