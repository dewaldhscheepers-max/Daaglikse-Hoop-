/* ────────────────────────────────────────────────────────────
   Verken hoe getroueafrikaansebybel.com sy teks aan 'n blaaier gee.

     node skrifte/verken-gab.mjs

   Hoekom hierdie skrif bestaan: die gewone manier om dit uit te vind, is om
   Chrome se Network-oortjie oop te maak en 'n HAR te stoor. Dewald het net 'n
   foon, en 'n mens kan nie DevTools op 'n foon oopmaak nie. Hierdie skrif loop
   dus in 'n GitHub-werkstroom en druk dieselfde antwoord in die log.

   ── Wat die eerste lopie gewys het ──

   Die werf is met Astro gebou. Die teks is NIE in die HTML van die tuisblad
   nie, NIE in die bondels nie, en NIE by 'n geraaide endpunt nie. Wat wel in
   config.js staan, is 'n Supabase-adres. Die teks kom dus uit hul databasis.

   robots.txt se: "User-agent: * / Allow: / / Sitemap: .../sitemap.xml"

   Die vraag wat oorbly, en wat hierdie lopie beantwoord: word 'n HOOFSTUK se
   bladsy op die bediener gebou, met die teks in die HTML? Is dit so, dan is
   daar 'n gewone, hoflike pad — 'n bladsy lees wat die werf self in sy
   sitemap adverteer en wat robots.txt uitdruklik toelaat.

   Is dit nie so nie, is hul Supabase die enigste pad, en dan hou ons op en
   vra hulle. Die CC-lisensie gee ons die TEKS; dit gee ons nie hul databasis
   nie.

   ── Grense ──

   Net openbare bladsye, soos 'n gewone besoeker. Geen aanmelding, geen
   sleutels, geen administrateur-endpunte, niks word omseil nie. Hoogstens
   MAKS_HAAL versoeke, een per sekonde, en dit stop by die eerste 403 of 429.
   Dit skryf niks en verander niks.
   ──────────────────────────────────────────────────────────── */

const WERF = 'https://getroueafrikaansebybel.com'

/* Genesis 1:1 soos die werf dit wys. Ons soekdraad. */
const DRAAD = 'In die begin het God die hemel en die aarde geskape'

const MAKS_HAAL = 20
const POUSE_MS  = 1200

const AGENT = 'DaaglikseHoop-verkenning/1.0 (+https://dewaldscheepers.com; eenmalig, om GAB-integrasie te beplan)'

let gehaal = 0

function se(...d) { console.log(...d) }
function pouse(ms) { return new Promise(r => setTimeout(r, ms)) }
function kortom(t, maks = 400) { return t.replace(/\s+/g, ' ').slice(0, maks) }

async function haal(url) {
  if (gehaal >= MAKS_HAAL) return { fout: 'limiet bereik' }
  if (gehaal > 0) await pouse(POUSE_MS)
  gehaal++
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': AGENT, accept: 'text/html,application/xml,application/json,*/*' },
      redirect: 'follow',
    })
    if (r.status === 429 || r.status === 403) return { status: r.status, stop: true, lyf: '' }
    return { status: r.status, tipe: r.headers.get('content-type') || '', lyf: await r.text(), eind: r.url }
  } catch (e) {
    return { fout: String(e && e.message) }
  }
}

/* ── 1. Die sitemap ── */
se('')
se('== 1. Die sitemap ==')
const sm = await haal(WERF + '/sitemap.xml')
se('   status:', sm.status ?? sm.fout, '·', (sm.lyf || '').length, 'karakters')
if (sm.stop) { se('   Die werf wil dit nie he nie. Ons stop.'); process.exit(0) }

let urls = []
if (sm.lyf) {
  urls = [...new Set([...sm.lyf.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1]))]
  se('   ' + urls.length + ' URL(s)')
  se('   eerste tien:')
  se('   ' + urls.slice(0, 10).join('\n   '))
  /* 'n Sitemap-indeks wys na ander sitemaps */
  if (sm.lyf.includes('<sitemapindex') && urls.length) {
    se('')
    se("   Dit is 'n INDEKS. Ons kyk na die eerste een.")
    const kind = await haal(urls[0])
    const kUrls = [...new Set([...(kind.lyf || '').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1]))]
    se('   ' + kUrls.length + ' URL(s) daarin, eerste tien:')
    se('   ' + kUrls.slice(0, 10).join('\n   '))
    urls = kUrls
  }
}

/* ── 2. 'n Hoofstukbladsy ── */
se('')
se("== 2. Word 'n hoofstuk se bladsy op die bediener gebou? ==")

/* Uit die sitemap, of anders die vorms wat 'n mens by so 'n werf sou verwag. */
const uitSitemap = urls.filter(u => /gen|genesis|1\/1|bybel|read|lees/i.test(u)).slice(0, 3)
const raai = [
  '/lees/GEN/1', '/lees/Genesis/1', '/bybel/Genesis/1',
  '/read/GEN/1', '/?book=GEN&chapter=1', '/?boek=GEN&hoofstuk=1',
]
const probeer = [...uitSitemap, ...raai.map(p => WERF + p)]

let gevind = null
for (const u of probeer) {
  if (gehaal >= MAKS_HAAL) { se('   (limiet bereik)'); break }
  const d = await haal(u)
  if (d.stop) { se('   ' + u + ' → ' + d.status + ', ons stop.'); break }
  const het = d.lyf && d.lyf.includes(DRAAD)
  se(`   ${u.replace(WERF, '')} → ${d.status ?? d.fout} · ${(d.lyf || '').length}${het ? '  ← DIE TEKS IS IN DIE HTML' : ''}`)
  if (het && !gevind) {
    gevind = u
    const i = d.lyf.indexOf(DRAAD)
    se('      omgewing: ' + kortom(d.lyf.slice(Math.max(0, i - 400), i + 400), 800))
  }
}

/* ── 3. Opsomming ── */
se('')
se('== Opsomming ==')
se('   versoeke gedoen: ' + gehaal)
if (gevind) {
  se('   Die teks staan in die HTML van ' + gevind)
  se("   Dan is daar 'n gewone pad: die bladsye wat die werf self in sy")
  se('   sitemap adverteer en wat robots.txt toelaat, stadig lees.')
} else {
  se('   Geen bladsy met die teks in die HTML nie.')
  se('   Dan kom die teks uit hul Supabase, en die enigste pad daarheen is')
  se('   hul databasis. Ons hou hier op en vra hulle eers.')
}
se('')
