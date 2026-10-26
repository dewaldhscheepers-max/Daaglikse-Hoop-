/* Die suiwer logika in api/sorg-videos.mjs.

     node api/_sorg-videos.toets.mjs

   Die eindpunt self kan nie hier loop nie — dit het die diensrekening nodig.
   Maar die stukke waar 'n fout STIL sou wees, is suiwer funksies, en dit is
   hulle wat hier getoets word.

   Veral: die karakterreeks-fout. '[ -<>]' lyk soos vier karakters maar is 'n
   reeks van spasie tot <, en dit gooi syfers en spasies weg. Dit het al twee
   keer in hierdie kodebasis gebeur, en ek het dit hier weer gedoen voordat
   hierdie toets dit gevang het. */
import fs from 'node:fs'
const bron = fs.readFileSync(new URL('./sorg-videos.mjs', import.meta.url), 'utf8')
const { keurOnderwerp } = await import(new URL('../src/data/sorgOnderwerpe.js', import.meta.url).href)
/* Die snit hieronder verwys na goed wat die lêer INVOER. Wat hy nodig het,
   word hier ingegee — anders druip die toets op 'n invoer eerder as op 'n
   fout in die kode wat hy toets. */
const { saamTelReaksies } = await import(new URL('../src/data/sorgSaamstaan.js', import.meta.url).href)
const { saaiReaksies, saaiWoorde } = await import(new URL('../src/data/sorgSaai.js', import.meta.url).href)

const { videoBronUit } = await import(new URL('../src/data/videoBron.js', import.meta.url).href)
/* 'n Vals `volgSkakel`: die egte een gaan na TikTok, wat hier geblokkeer is. */
const gevolg = []
const volgSkakel = async (s) => { gevolg.push(s); return /ZSgoed/.test(s) ? { ok: true, id: '7499999999999999999' } : { ok: false } }

const begin = bron.indexOf('function haalVideoId')
const eind  = bron.indexOf('export default')
const M = new Function('keurOnderwerp', 'saamTelReaksies', 'saaiReaksies', 'saaiWoorde', 'videoBronUit', 'volgSkakel',
  bron.slice(begin, eind) + '\nreturn { haalVideoId, skoonTeks, skoonVideo, bronVan }')(
  keurOnderwerp, saamTelReaksies, saaiReaksies, saaiWoorde, videoBronUit, volgSkakel)

let gedruip = 0
const kyk = (n, w, e) => {
  if (w) console.log('  ok    ' + n)
  else { gedruip++; console.log('  DRUIP ' + n + (e !== undefined ? ' — ' + JSON.stringify(e) : '')) }
}

const I = M.haalVideoId
kyk('gewone skakel',   I('https://www.youtube.com/watch?v=LK-kieYHZJA') === 'LK-kieYHZJA', I('https://www.youtube.com/watch?v=LK-kieYHZJA'))
kyk('kort skakel',     I('https://youtu.be/LK-kieYHZJA') === 'LK-kieYHZJA')
kyk('shorts',          I('https://youtube.com/shorts/LK-kieYHZJA') === 'LK-kieYHZJA')
kyk('embed',           I('https://www.youtube.com/embed/LK-kieYHZJA') === 'LK-kieYHZJA')
kyk('net die ID',      I('LK-kieYHZJA') === 'LK-kieYHZJA')
kyk('met tydstempel',  I('https://youtu.be/LK-kieYHZJA?t=30') === 'LK-kieYHZJA', I('https://youtu.be/LK-kieYHZJA?t=30'))
kyk('gemors gee null', I('nie n video nie!!') === null, I('nie n video nie!!'))
kyk('leeg gee null',   I('') === null)

/* Die karakterreeks-fout: syfers, spasies en koppeltekens moet BLY. Dit is
   presies wat '[ -<>]' sou weggegooi het. */
const T = M.skoonTeks
kyk('syfers bly',       T('Psalm 23 vers 4', 100) === 'Psalm 23 vers 4', T('Psalm 23 vers 4', 100))
kyk('koppeltekens bly', T('Wanneer alles te-veel word', 100) === 'Wanneer alles te-veel word', T('Wanneer alles te-veel word', 100))
kyk('aksente bly',      T('Geloof en twyfel by Esegiel', 100) === 'Geloof en twyfel by Esegiel')
kyk('leestekens bly',   T('Is dit reg? Ja! (dalk)', 100) === 'Is dit reg? Ja! (dalk)', T('Is dit reg? Ja! (dalk)', 100))
kyk('beheerkarakters uit', T('a' + String.fromCharCode(9) + 'b' + String.fromCharCode(0) + 'c', 100) === 'a b c',
    T('a' + String.fromCharCode(9) + 'b' + String.fromCharCode(0) + 'c', 100))
kyk('afgekap op lengte', T('abcdefghij', 4) === 'abcd')

const V = M.skoonVideo
const g = await V({ videoId: 'https://youtu.be/LK-kieYHZJA', titel: 'Toets', onderwerpe: ['angs', 'onbekend', 'angs'] })
kyk('geldige video', !g.fout && g.video.videoId === 'LK-kieYHZJA')
kyk('YouTube kry bron youtube', g.video.bron === 'youtube', g.video.bron)
kyk('onbekende onderwerp word "ander"', g.video.onderwerpe.includes('ander'), g.video.onderwerpe)
kyk('duplikate weg', g.video.onderwerpe.length === 2, g.video.onderwerpe)
kyk('geen titel word geweier', !!(await V({ videoId: 'LK-kieYHZJA', titel: '  ' })).fout)
kyk('geen video word geweier', !!(await V({ videoId: 'xxx!!', titel: 'Toets' })).fout)
kyk('gepubliseer by verstek', (await V({ videoId: 'LK-kieYHZJA', titel: 'T' })).video.gepubliseer === true)
kyk('versteek werk', (await V({ videoId: 'LK-kieYHZJA', titel: 'T', gepubliseer: false })).video.gepubliseer === false)
kyk('slegte datum word vandag', /^\d{4}-\d{2}-\d{2}$/.test((await V({ videoId: 'LK-kieYHZJA', titel: 'T', datum: 'gister' })).video.datum))
kyk('n YouTube-video hou sy eie regop-keuse', (await V({ videoId: 'LK-kieYHZJA', titel: 'T', regop: false })).video.regop === false)

/* ── TikTok (26 Oktober 2026) ── */
const B = M.bronVan
const vol = await V({ videoId: 'https://www.tiktok.com/@dewaldscheepers/video/7412345678901234567?is_from_webapp=1', titel: 'T' })
kyk('volle TikTok-skakel', !vol.fout && vol.video.videoId === '7412345678901234567' && vol.video.bron === 'tiktok', vol)
kyk('n TikTok is altyd regop', vol.video.regop === true)
const kaal = await V({ videoId: '7412345678901234567', titel: 'T', regop: false })
kyk('n kaal 19-syfer-ID is TikTok, nie YouTube nie (redigeer hou die bron)', kaal.video.bron === 'tiktok' && kaal.video.regop === true, kaal.video)
const kort = await B('https://vt.tiktok.com/ZSgoed123/')
kyk('n kort skakel word deur die bediener gevolg', kort && kort.videoId === '7499999999999999999' && kort.bron === 'tiktok' && gevolg.length === 1, { kort, gevolg })
kyk('n kort skakel wat nie oopmaak nie: null', (await B('https://vt.tiktok.com/ZSsleg123/')) === null)
kyk('n TikTok-PROFIEL glip nie as YouTube deur nie', (await B('https://www.tiktok.com/@dewaldscheepers')) === null)
kyk('YouTube bly YouTube', (await B('https://youtube.com/shorts/LK-kieYHZJA')).bron === 'youtube')
kyk('n kort skakel in skoonVideo', (await V({ videoId: 'https://vt.tiktok.com/ZSgoed999/', titel: 'T' })).video.videoId === '7499999999999999999')

console.log(gedruip ? `\n${gedruip} GEDRUIP` : '\nalles geslaag')
process.exit(gedruip ? 1 : 0)
