/* node src/data/videoBron.toets.mjs — watter skakel is in die Bid Saam-
   videogebed se veld geplak: YouTube of TikTok? */
import { videoBronUit, bronVan } from './videoBron.js'

let n = 0, f = 0
const t = (ok, m) => { n++; if (!ok) { f++; console.log('✗ ' + m) } }
const is = (inset, verwag, m) => {
  const u = videoBronUit(inset)
  t(u.bron === verwag.bron && u.id === (verwag.id || '') && u.kort === !!verwag.kort,
    `${m}: ${JSON.stringify(inset)} -> ${JSON.stringify(u)}`)
}

// ── YouTube: elke vorm wat al gewerk het, werk steeds ──
is('LK-kieYHZJA', { bron: 'youtube', id: 'LK-kieYHZJA' }, 'kaal YouTube-ID')
is('https://youtu.be/jACGS5QkLkQ?si=DjVIhhIlhHKS4Hg6', { bron: 'youtube', id: 'jACGS5QkLkQ' }, 'youtu.be met ?si=')
is('https://www.youtube.com/watch?v=LK-kieYHZJA', { bron: 'youtube', id: 'LK-kieYHZJA' }, 'watch?v=')
is('https://youtube.com/shorts/LK-kieYHZJA?feature=share', { bron: 'youtube', id: 'LK-kieYHZJA' }, 'Shorts')

// ── TikTok ──
is('https://www.tiktok.com/@dewaldscheepers/video/7412345678901234567?is_from_webapp=1', { bron: 'tiktok', id: '7412345678901234567' }, 'volle TikTok-skakel')
is('7412345678901234567', { bron: 'tiktok', id: '7412345678901234567' }, 'kaal TikTok-ID (19 syfers, nie YouTube nie)')
is('https://vt.tiktok.com/ZSqa9Knhv/', { bron: 'tiktok', kort: true }, 'kort skakel van die foon: die bediener moet hom oopmaak')
is('https://www.tiktok.com/t/ZTabc123/', { bron: 'tiktok', kort: true }, 'tiktok.com/t/ kort vorm')
is('  https://vt.tiktok.com/ZSqa9Knhv/  ', { bron: 'tiktok', kort: true }, 'spasies om die skakel')

// ── Gemors: niks word gestoor nie ──
is('', { bron: '' }, 'leeg')
is('hallo', { bron: '' }, 'n woord')
is('https://www.tiktok.com/@dewaldscheepers', { bron: '' }, 'n TikTok-PROFIEL is nie n video nie en mag nie as YouTube deurglip nie')
is('https://vimeo.com/123456789', { bron: '' }, 'Vimeo')
t(videoBronUit(null).bron === '' && videoBronUit(undefined).bron === '', 'null en undefined')

// ── bronVan: elke OU dokument is YouTube ──
t(bronVan({ videoId: 'LK-kieYHZJA' }) === 'youtube', 'geen bron-veld (elke video tot vandag) is YouTube')
t(bronVan({ bron: 'tiktok', videoId: '7412345678901234567' }) === 'tiktok', 'tiktok')
t(bronVan({ bron: 'iets' }) === 'youtube', 'n onbekende bron val terug op YouTube')
t(bronVan(null) === 'youtube', 'geen dokument')

console.log(f ? `${f} van ${n} FOUT` : `${n} toetse groen`)
process.exit(f ? 1 : 0)
