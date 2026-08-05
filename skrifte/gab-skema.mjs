/* ────────────────────────────────────────────────────────────
   Waarheen vra hul bladsy vir 'n hoofstuk?

     node skrifte/gab-skema.mjs

   ── Wat ons tot dusver weet ──

   · Die werf is Astro. config.js gee 'n Supabase-adres en 'n
     sb_publishable_-sleutel, met hul eie kommentaar: "the publishable key is
     browser-safe by design. (The secret key is NOT here; it lives only in
     the server .env.)"
   · Met die regte kopteks (net apikey, geen Authorization) werk die sleutel:
     die tabel `suggestions` gee 200.
   · Maar `suggestions` is die ENIGSTE tabel wat hul kliëntkode noem, en die
     Bybelteks is nie daarin nie.
   · Die teks is ook nie in die HTML, nie in die sitemap, en nie by 'n
     geraaide pad nie.

   Die vraag wat oorbly: waarheen gaan die versoek wanneer 'n mens 'n
   hoofstuk oopmaak? Dit staan in hul openbare JavaScript. Ons lees dit —
   dieselfde as om na 'n werf se bronkode te kyk — en volg die dinamiese
   brokke wat die bondel self invoer.

   Ons omseil niks, ons raai niks, en ons hou op by 401, 403 of 429.
   ──────────────────────────────────────────────────────────── */

const WERF = 'https://getroueafrikaansebybel.com'
const AGENT = 'DaaglikseHoop/1.0 (+https://dewaldscheepers.com; gratis Afrikaanse app; GAB onder CC BY-NC-ND 4.0)'

function se(...d) { console.log(...d) }
function pouse(ms) { return new Promise(r => setTimeout(r, ms)) }

async function haal(url) {
  const r = await fetch(url, { headers: { 'user-agent': AGENT } })
  return { status: r.status, lyf: await r.text() }
}

/* Alles wat na 'n pad of 'n adres lyk, uit 'n stuk JavaScript. */
function paaieUit(kode) {
  const uit = new Set()
  for (const m of kode.matchAll(/["'`](\/[a-zA-Z0-9_./{}$-]{2,80})["'`]/g)) uit.add(m[1])
  for (const m of kode.matchAll(/["'`](https?:\/\/[^"'`\s]{6,120})["'`]/g)) uit.add(m[1])
  return [...uit]
}

/* Die argumente van elke fetch(...) — dit is waar die data vandaan kom. */
function fetchOproepe(kode) {
  const uit = new Set()
  for (const m of kode.matchAll(/fetch\(([^)]{0,160})/g)) uit.add(m[1].replace(/\s+/g, ' ').trim())
  return [...uit]
}

se('')
se('== 1. Die bladsy se bondels ==')
const tuis = await haal(WERF + '/')
const eerste = [...new Set(
  [...tuis.lyf.matchAll(/(?:src|href)=["']([^"']+\.(?:js|mjs))(?:\?[^"']*)?["']/gi)].map(m => m[1])
)]
se('   ' + eerste.join('\n   '))

/* Astro laai eilande as dinamiese brokke. Ons volg /_astro/-verwysings een
   vlak diep — dit is waar 'n leser se kode gewoonlik sit. */
const gesien = new Set()
const ry = eerste.map(b => (b.startsWith('http') ? b : WERF + (b.startsWith('/') ? b : '/' + b)))
const alleFetches = new Set()
const alleUrls = new Set()

se('')
se('== 2. Wat vra hulle, en waarvandaan? ==')
let nr = 0
while (ry.length && nr < 12) {
  const url = ry.shift()
  if (gesien.has(url)) continue
  gesien.add(url)
  nr++
  await pouse(700)
  const d = await haal(url)
  if ([401, 403, 429].includes(d.status)) { se('   ' + url + ' → ' + d.status + ', ons hou op.'); break }
  if (d.status !== 200) { se('   ' + url + ' → ' + d.status); continue }

  const paaie = paaieUit(d.lyf)
  const fetches = fetchOproepe(d.lyf)
  fetches.forEach(f => alleFetches.add(f))
  paaie.filter(p => /json|api|data|bybel|bible|gab|vers|chapter|hoofstuk|book/i.test(p)).forEach(p => alleUrls.add(p))

  se(`   ${url.replace(WERF, '')} · ${d.lyf.length} karakters · ${fetches.length} fetch-oproep(e)`)

  /* Volg verdere /_astro/-brokke */
  for (const p of paaie) {
    if (/^\/_astro\/[^/]+\.(js|mjs)$/.test(p)) {
      const v = WERF + p
      if (!gesien.has(v)) ry.push(v)
    }
  }
}

se('')
se('   fetch-oproepe:')
se(alleFetches.size ? [...alleFetches].map(f => '     ' + f).join('\n') : '     (geen)')

se('')
se('   paaie wat na data lyk:')
se(alleUrls.size ? [...alleUrls].map(u => '     ' + u).join('\n') : '     (geen)')

se('')
se('== Klaar ==')
se('')
