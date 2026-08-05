/* ────────────────────────────────────────────────────────────
   Verken hoe getroueafrikaansebybel.com sy teks aan 'n blaaier gee.

     node skrifte/verken-gab.mjs

   Hoekom hierdie skrif bestaan: die gewone manier om dit uit te vind, is om
   Chrome se Network-oortjie oop te maak en 'n HAR te stoor. Dewald het net 'n
   foon, en 'n mens kan nie DevTools op 'n foon oopmaak nie. Hierdie skrif loop
   dus in 'n GitHub-werkstroom en druk dieselfde antwoord in die log.

   ── Grense ──

   Dit haal NET openbare bladsye, presies soos 'n gewone besoeker. Geen
   aanmelding, geen sleutels, geen administrateur-endpunte, en niks word
   omseil nie. Dit is 'n verkenning, nie 'n aflaai nie: hoogstens MAKS_HAAL
   versoeke, een per sekonde, en dit stop by die eerste teken dat die werf dit
   nie wil he nie.

   Dit skryf niks en verander niks. Dit druk 'n verslag.
   ──────────────────────────────────────────────────────────── */

const WERF = 'https://getroueafrikaansebybel.com'

/* Genesis 1:1 soos die werf dit wys. Dit is ons soekdraad: kry ons hierdie
   sin erens in 'n lêer, weet ons waar die teks sit. */
const DRAAD = 'In die begin het God die hemel en die aarde geskape'

const MAKS_HAAL = 24
const POUSE_MS  = 1000

const AGENT = 'DaaglikseHoop-verkenning/1.0 (+https://dewaldscheepers.com; eenmalig, om GAB-integrasie te beplan)'

let gehaal = 0
const verslag = []

function se(...d) { console.log(...d); }

function pouse(ms) { return new Promise(r => setTimeout(r, ms)) }

async function haal(url, { rou = false } = {}) {
  if (gehaal >= MAKS_HAAL) return { fout: 'die verkenning se limiet is bereik' }
  if (gehaal > 0) await pouse(POUSE_MS)
  gehaal++
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': AGENT, accept: rou ? '*/*' : 'text/html,application/json,*/*' },
      redirect: 'follow',
    })
    const tipe = r.headers.get('content-type') || ''
    if (r.status === 429 || r.status === 403) {
      return { status: r.status, tipe, stop: true, lyf: '' }
    }
    const lyf = await r.text()
    return { status: r.status, tipe, lyf }
  } catch (e) {
    return { fout: String(e && e.message) }
  }
}

function kortom(lyf, maks = 400) {
  return lyf.replace(/\s+/g, ' ').slice(0, maks)
}

/* ── 1. Die tuisblad ── */
se('')
se('== 1. Die tuisblad ==')
const tuis = await haal(WERF + '/')
se('   status:', tuis.status ?? tuis.fout, '·', tuis.tipe || '', '·', (tuis.lyf || '').length, 'karakters')
if (tuis.stop) { se('   Die werf wil dit nie he nie. Ons stop hier.'); process.exit(0) }
if (!tuis.lyf) { se('   Geen liggaam nie. Ons kan nie verder nie.'); process.exit(0) }

const inHtml = tuis.lyf.includes(DRAAD)
se('   Genesis 1:1 direk in die HTML:', inHtml ? 'JA' : 'nee')
if (inHtml) {
  const i = tuis.lyf.indexOf(DRAAD)
  se('   omgewing:', kortom(tuis.lyf.slice(Math.max(0, i - 260), i + 260)))
}

/* ── 2. Watter lêers laai die bladsy ── */
se('')
se('== 2. Bates op die bladsy ==')
const bates = [...new Set(
  [...tuis.lyf.matchAll(/(?:src|href)=["']([^"']+\.(?:js|json|mjs))(?:\?[^"']*)?["']/gi)]
    .map(m => m[1])
)]
se("   " + (bates.length ? bates.join("\n   ") : "(geen js/json in die HTML nie — dalk 'n inlyn-bondel)"))

/* Supabase, Firebase of 'n ander API wat in die HTML genoem word */
const wenke = [...new Set(
  [...tuis.lyf.matchAll(/https:\/\/[a-z0-9.-]*(supabase|firebaseio|firestore|googleapis|api)[a-z0-9./-]*/gi)]
    .map(m => m[0])
)]
se('')
se("   Verwysings na 'n API of databasis in die HTML:")
se('   ' + (wenke.length ? wenke.slice(0, 12).join('\n   ') : '(geen)'))

/* ── 3. Die bondels deursoek ── */
se('')
se('== 3. Die bondels ==')
const jsBates = bates.filter(b => /\.(js|mjs)$/i.test(b)).slice(0, 8)
for (const b of jsBates) {
  const url = b.startsWith('http') ? b : WERF + (b.startsWith('/') ? b : '/' + b)
  const d = await haal(url, { rou: true })
  if (d.stop) { se('   ' + b + ' → ' + d.status + ', ons stop.'); break }
  if (!d.lyf) { se('   ' + b + ' → ' + (d.fout || d.status)); continue }
  const mb = (d.lyf.length / 1048576).toFixed(2)
  const het = d.lyf.includes(DRAAD)
  se(`   ${b} · ${mb} MB · Genesis 1:1 daarin: ${het ? 'JA' : 'nee'}`)
  if (het) {
    const i = d.lyf.indexOf(DRAAD)
    se('      omgewing:', kortom(d.lyf.slice(Math.max(0, i - 300), i + 300), 600))
    verslag.push({ soort: 'bondel-bevat-teks', url })
  }
  /* Endpunte wat die bondel self noem */
  const paaie = [...new Set(
    [...d.lyf.matchAll(/["'`](\/(?:api|data|bybel|bible|gab)\/[a-z0-9_./{}$:-]*)["'`]/gi)].map(m => m[1])
  )].slice(0, 15)
  if (paaie.length) se('      paaie in die bondel: ' + paaie.join(' , '))
  const dienste = [...new Set(
    [...d.lyf.matchAll(/https:\/\/[a-z0-9-]+\.supabase\.co[a-z0-9./_-]*/gi)].map(m => m[0])
  )].slice(0, 6)
  if (dienste.length) se('      Supabase: ' + dienste.join(' , '))
}

/* ── 4. Voor die hand liggende openbare paaie ── */
se('')
se("== 4. Paaie wat 'n mens sou raai ==")
const raai = [
  '/api/bible/GEN/1', '/api/bybel/GEN/1', '/api/chapter?book=GEN&chapter=1',
  '/data/GEN.json', '/bybel/GEN/1', '/gab/GEN.json', '/api/books', '/api/verses',
]
for (const p of raai) {
  if (gehaal >= MAKS_HAAL) { se('   (limiet bereik)'); break }
  const d = await haal(WERF + p)
  if (d.stop) { se(`   ${p} → ${d.status}, ons stop.`); break }
  const merk = d.lyf && d.lyf.includes(DRAAD) ? '  ← BEVAT DIE TEKS' : ''
  se(`   ${p} → ${d.status ?? d.fout} · ${(d.tipe || '').split(';')[0]} · ${(d.lyf || '').length}${merk}`)
  if (merk) verslag.push({ soort: 'endpunt', url: WERF + p })
}

/* ── 5. robots.txt en sitemap, want dit is die hoflike ding om te lees ── */
se('')
se('== 5. robots.txt ==')
const rob = await haal(WERF + '/robots.txt')
se('   ' + (rob.lyf ? kortom(rob.lyf, 600) : (rob.status ?? rob.fout)))

se('')
se('== Opsomming ==')
se('   versoeke gedoen: ' + gehaal)
se(verslag.length
  ? '   gekry: ' + JSON.stringify(verslag, null, 2)
  : "   Die teks is nie in 'n statiese lêer of 'n geraaide endpunt gekry nie.\n" +
    "   Dit beteken die bladsy laai dit waarskynlik uit 'n databasis met 'n\n" +
    "   versoek wat ons nie van die HTML af kan sien nie.")
se('')
