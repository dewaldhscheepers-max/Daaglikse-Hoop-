/* Gee die LEWENDE werf die GAB se lêers uit?

     node skrifte/kyk-gab-lewend.mjs

   Die lêers is in git en in dist/, en vercel.json se roetes het 'n
   "handle": "filesystem" voor die catch-all, dus behoort hulle bedien te
   word. Maar Dewald se foon wys geen Afrikaans-afdeling nie, wat beteken
   /gab/indeks.json laai nie by hom nie.

   Hierdie skrif vra dit reguit vir die lewende werf. Dit skei die twee
   moontlikhede:

     · 404 of HTML terug  → dit is nie ontplooi nie, of 'n roete vang dit
     · 200 met JSON       → dit is 'n kas op sy foon, nie die werf nie
*/

const WERWE = [
  'https://dewaldscheepers.com',
  'https://www.dewaldscheepers.com',
]

const PAAIE = ['/gab/indeks.json', '/gab/PSA.json', '/index.html']

function se(...d) { console.log(...d) }

for (const werf of WERWE) {
  se('')
  se('== ' + werf + ' ==')
  for (const pad of PAAIE) {
    try {
      const r = await fetch(werf + pad, { headers: { accept: '*/*' }, redirect: 'follow' })
      const tipe = (r.headers.get('content-type') || '').split(';')[0]
      const lyf = await r.text()
      const eerste = lyf.replace(/\s+/g, ' ').slice(0, 110)
      se(`   ${pad}`)
      se(`      ${r.status} · ${tipe} · ${lyf.length} karakters`)
      se(`      ${eerste}`)
      if (pad.endsWith('.json') && tipe.includes('html')) {
        se('      ↑ HTML in plaas van JSON — die catch-all vang dit')
      }
    } catch (e) {
      se(`   ${pad} → kon nie: ${e.message}`)
    }
  }
}
se('')
