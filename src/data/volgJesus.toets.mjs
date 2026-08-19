/* VOLG JESUS — die week se hekke, en die Skrifverwysings teen die EGTE Bybel.
 *
 * Die tweede helfte van hierdie leer is die waardevolste deel: dit neem elke
 * Skrifverwysing wat Dewald geskryf het en toets dit teen die 31 102 verse wat
 * reeds in public/gab/ staan. Bestaan die boek? Die hoofstuk? Die verse?
 *
 * Dit vervang NIE Dewald se nagaan nie — die reel bly dat hy elke vers teen
 * sy Bybel kontroleer. Maar hy hoef nie 'n tikfout te gaan soek nie.
 */
import { readFileSync, existsSync } from 'node:fs'
import {
  ETIKETTE, BEWEGINGS, bewegingVir, KONTROLES,
  publiseerFoute, magPubliseer, geldigeVideoId,
  ontleedVerwysing, keurVerwysing, BOEKKODES, VERPLIGTE_VELDE,
} from './volgJesus.js'
import { WEKE } from './volgJesusWeke.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

/* 'n Week wat AAN ALLES voldoen. Elke toets hieronder breek presies een ding. */
function heelWeek(oor = {}) {
  return {
    weeknommer: 1,
    titel: 'Wie is Jesus?',
    doel: 'Voordat iemand leer wat Jesus vra, moet hy sien Wie Jesus is.',
    openingskerm: 'Week 1 van 52...',
    primereSkrif: 'Johannes 1:1-18',
    videoId: 'dQw4w9WgXcQ',
    kernwaarheid: 'Dissipelskap begin by Wie Jesus is.',
    privaatRefleksie: 'Wat glo jy op hierdie stadium oor wie Jesus is?',
    gehoorsaamheidStap: 'Vra by elke Evangelieteks: wat wys dit vir my van Jesus?',
    gebed: 'Vader, help my om Jesus te leer ken soos U Woord Hom openbaar.',
    groepVraag1: 'Wat sien ons in hierdie tekste van Jesus?',
    groepVraag2: 'Het iets jou verras?',
    groepVraag3: 'Wat gebeur as ons net die dele van Jesus aanvaar waarvan ons hou?',
    fasiliteerderHoofpunt: 'Alles wat volg hang af van Wie Jesus is.',
    fasiliteerderGrens: 'Jesus het nie by Sy doop die Seun van God GEWORD nie.',
    pastoraleRisiko: 'laag',
    kontroles: { teks: true, konteks: true, jesus: true, toepassing: true, grens: true },
    hersieningStatus: 'goedgekeur',
    ...oor,
  }
}

console.log('\n── Die bewegings ──\n')
is('agt bewegings', BEWEGINGS.length, 8)
is('hulle dek presies 52 weke',
   BEWEGINGS.reduce((n, b) => n + (b.tot - b.van + 1), 0), 52)
is('sonder gate of oorvleueling',
   BEWEGINGS.map(b => b.van), [1, 7, 13, 19, 30, 38, 43, 48])
is('week 1 is Ontmoet Jesus',  bewegingVir(1).naam,  'Ontmoet Jesus')
is('week 44 (Nagmaal) is Bly in Jesus', bewegingVir(44).naam, 'Bly in Jesus')
is('week 52 is Gaan',          bewegingVir(52).naam, 'Gaan')
is('week 0 en 53 bestaan nie', [bewegingVir(0), bewegingVir(53)], [null, null])

console.log('\n── n Volledige week mag publiseer ──\n')
is('geen foute nie', publiseerFoute(heelWeek()), [])
is('en dit mag',     magPubliseer(heelWeek()), true)

console.log('\n── Die vyf kontroles is nie versiering nie ──\n')
for (const { sleutel } of KONTROLES) {
  const week = heelWeek({ kontroles: { ...heelWeek().kontroles, [sleutel]: false } })
  is(`sonder "${sleutel}" mag dit NIE publiseer nie`, magPubliseer(week), false)
}
is('sonder enige kontroles ook nie', magPubliseer(heelWeek({ kontroles: {} })), false)
/* Iemand wat 'n string "true" instuur, moet nie deurglip nie. */
is('n string "true" tel nie as groen nie',
   magPubliseer(heelWeek({ kontroles: { teks: 'true', konteks: true, jesus: true, toepassing: true, grens: true } })),
   false)

console.log('\n── Teologiese hersiening ──\n')
is('sonder goedkeuring mag dit nie',
   magPubliseer(heelWeek({ hersieningStatus: 'wag' })), false)
is('en n ontbrekende status ook nie',
   magPubliseer(heelWeek({ hersieningStatus: undefined })), false)

console.log('\n── Hoe pastorale risiko moet die fasiliteerder waarsku ──\n')
{
  /* Week 22 (huwelik) en Week 30 (vergifnis) kan mishandeling oopmaak. 'n
     Fasiliteerder wat dit sonder waarskuwing lei, kan skade doen. */
  const sonder = heelWeek({ weeknommer: 22, pastoraleRisiko: 'hoog' })
  is('hoe risiko sonder waarskuwing mag NIE', magPubliseer(sonder), false)
  const met = heelWeek({
    weeknommer: 22, pastoraleRisiko: 'hoog',
    fasiliteerderWaarskuwing: 'Hierdie gesprek kan mishandeling oopmaak.',
  })
  is('met die waarskuwing mag dit', magPubliseer(met), true)
  is('lae risiko het dit nie nodig nie',
     magPubliseer(heelWeek({ pastoraleRisiko: 'laag' })), true)
}

console.log('\n── Verpligte velde ──\n')
for (const veld of ['titel', 'primereSkrif', 'videoId', 'kernwaarheid', 'gehoorsaamheidStap', 'groepVraag1']) {
  is(`sonder ${veld} mag dit nie`, magPubliseer(heelWeek({ [veld]: '' })), false)
}
is('n veld met net spasies tel as leeg', magPubliseer(heelWeek({ titel: '   ' })), false)

/* ── Die hoofboodskap mag 'n STEMBOODSKAP wees ──
 *
 * Week 1 het doelbewus geen video nie — die hoofboodskap is 'n stemboodskap
 * wat in die app speel. Die hek het steeds `videoId` geeis, en toe kon die
 * week nie publiseer nie al was alles anders reg. Dit is presies die soort
 * fout wat 'n mens eers op die dag sien: die toetse het die pad NA die hek
 * gemeet en nooit gevra of 'n mens by die hek kan uitkom nie. */
console.log('\n── Die hoofboodskap: video OF stemboodskap ──\n')
{
  const stemWeek = heelWeek({ videoId: '', stemboodskapUrl: 'https://x/audio/w1.mp3' })
  is('n week met NET n stemboodskap mag publiseer', magPubliseer(stemWeek), true)
  is('en die fout praat nie van n video nie',
     publiseerFoute(stemWeek).some(f => /video/i.test(f)), false)

  is('n week met NET n video mag ook',
     magPubliseer(heelWeek({ stemboodskapUrl: '' })), true)
  is('albei is ook goed',
     magPubliseer(heelWeek({ stemboodskapUrl: 'https://x/audio/w1.mp3' })), true)

  const geenEen = heelWeek({ videoId: '', stemboodskapUrl: '' })
  is('maar sonder albei mag dit nie', magPubliseer(geenEen), false)
  is('en dit se WAT kort',
     publiseerFoute(geenEen).some(f => /hoofboodskap/.test(f)), true)

  is('n stemboodskap red nie n stukkende video-ID nie',
     magPubliseer(heelWeek({ videoId: 'nie-n-id!', stemboodskapUrl: 'https://x/a.mp3' })), false)
  is('net spasies in die stemboodskap tel nie',
     magPubliseer(heelWeek({ videoId: '', stemboodskapUrl: '   ' })), false)
}

console.log('\n── Die weeknommer ──\n')
for (const n of [0, 53, -1, 1.5, 'een', null]) {
  is(`${JSON.stringify(n)} is nie n geldige weeknommer nie`,
     magPubliseer(heelWeek({ weeknommer: n })), false)
}
is('52 is wel', magPubliseer(heelWeek({ weeknommer: 52 })), true)

console.log('\n── Die YouTube-ID ──\n')
is('n egte id',            geldigeVideoId('dQw4w9WgXcQ'), true)
is('met strepies',         geldigeVideoId('a-B_c1D2e3F'), true)
for (const sleg of ['', 'kort', 'hierdieistelank', 'dQw4w9WgXc!', null, 12345,
                    'https://youtu.be/dQw4w9WgXcQ', 'dQw4 9WgXcQ']) {
  is(`${JSON.stringify(sleg)} word geweier`, geldigeVideoId(sleg), false)
}

console.log('\n── Skrifverwysings ontleed ──\n')
is('Markus 10:45',
   ontleedVerwysing('Markus 10:45'),
   [{ boek: 'MRK', hoofstuk: 10, van: 45, tot: 45 }])
is('Johannes 1:1-18',
   ontleedVerwysing('Johannes 1:1–18'),
   [{ boek: 'JHN', hoofstuk: 1, van: 1, tot: 18 }])
is('Lukas 24:1-12, 44-49 gee TWEE spanne',
   ontleedVerwysing('Lukas 24:1–12, 44–49'),
   [{ boek: 'LUK', hoofstuk: 24, van: 1, tot: 12 },
    { boek: 'LUK', hoofstuk: 24, van: 44, tot: 49 }])
is('Matteus 5:31-32; 19:3-12 oor twee hoofstukke',
   ontleedVerwysing('Matteus 5:31–32; 19:3–12'),
   [{ boek: 'MAT', hoofstuk: 5, van: 31, tot: 32 },
    { boek: 'MAT', hoofstuk: 19, van: 3, tot: 12 }])
is('Johannes 4 is n hele hoofstuk',
   ontleedVerwysing('Johannes 4'),
   [{ boek: 'JHN', hoofstuk: 4, van: null, tot: null }])
is('Johannes 19-20 is twee hoofstukke',
   ontleedVerwysing('Johannes 19–20'),
   [{ boek: 'JHN', hoofstuk: 19, van: null, tot: null },
    { boek: 'JHN', hoofstuk: 20, van: null, tot: null }])
/* Die langste naam moet wen, anders word "1 Johannes" as "Johannes" gelees. */
is('1 Johannes word nie Johannes nie',
   ontleedVerwysing('1 Johannes 3:16')[0].boek, '1JN')
is('n onbekende boek gee niks', ontleedVerwysing('Hobbits 1:1'), [])
is('n lee string ook',          ontleedVerwysing(''), [])
is('en geen argument ook nie',  ontleedVerwysing(), [])

console.log('\n── En nou teen die EGTE Bybel ──\n')
{
  const kas = {}
  function leesBoek(kode) {
    if (kas[kode] !== undefined) return kas[kode]
    const pad = new URL(`../../public/gab/${kode}.json`, import.meta.url)
    kas[kode] = existsSync(pad) ? JSON.parse(readFileSync(pad, 'utf8')) : null
    return kas[kode]
  }

  const mat = leesBoek('MAT')
  is('die GAB is hier', !!mat, true)

  if (mat) {
    is('Matteus het 28 hoofstukke', mat.hoofstukke.length, 28)

    /* Elke verwysing wat Dewald geskryf het. */
    const VERWYSINGS = [
      /* Week 1 */ 'Johannes 1:1–18', 'Matteus 1:18–25', 'Markus 1:9–11',
                   'Jakobus 2:19', 'Johannes 1:1–5', 'Johannes 1:14–18',
                   'Johannes 8:58', 'Johannes 10:30–38',
                   'Johannes 14:6–11', 'Johannes 17:1–5', 'Johannes 20:28–31',
      /* Die program se fondamentteks */ 'Matteus 28:18–20',
    ]

    const stukkend = []
    for (const v of VERWYSINGS) {
      const foute = keurVerwysing(v, leesBoek)
      if (foute.length) stukkend.push(`${v} → ${foute.join('; ')}`)
    }
    is(`al ${VERWYSINGS.length} verwysings uit die geskrewe weke bestaan werklik`, stukkend, [])

    /* En die keurder moet werklik VANG — anders is die groen hierbo waardeloos. */
    is('n hoofstuk wat nie bestaan nie word gevang',
       keurVerwysing('Matteus 99:1', leesBoek).length > 0, true)
    is('n vers wat nie bestaan nie ook',
       keurVerwysing('Markus 1:9999', leesBoek).length > 0, true)
    is('en n reeks wat agteruit loop',
       keurVerwysing('Johannes 3:16-2', leesBoek).length > 0, true)
  }
}

/* ── En nou die WEKE wat Dewald werklik geskryf het ──
 *
 * publiseerFoute() kan nie hierop loop nie: die videoId, die vyf kontroles en
 * die teologiese hersiening word in die admin gestel, nie hier nie. Maar alles
 * ANDERS moet reeds klaar wees, anders laai die bulkknoppie 'n halwe week op.
 *
 * Die belangrikste reel hier is die laaste een. 'n Hoe-risiko week sonder 'n
 * fasiliteerderwaarskuwing mag nie publiseer nie — en week 21, 22 en 24 raak
 * mishandeling. Val die waarskuwing ooit uit, moet hierdie toets rooi word
 * lank voordat 'n fasiliteerder in 'n sitkamer daarsonder sit.
 */
console.log('\n── Die geskrewe weke self ──\n')
{
  const nommers = Object.keys(WEKE).map(Number).sort((a, b) => a - b)
  is('daar is ten minste een geskrewe week', nommers.length >= 1, true)
  is('hulle loop van 1 af sonder n gat',
     nommers, Array.from({ length: nommers.length }, (_, i) => i + 1))

  const SONDER_VIDEO = VERPLIGTE_VELDE.filter(v => v !== 'videoId')
  const leeg = [], verkeerdeNommer = [], sonderWaarskuwing = [], slegteVideo = []
  for (const n of nommers) {
    const w = WEKE[n]
    if (w.weeknommer !== n) verkeerdeNommer.push(n)
    for (const veld of SONDER_VIDEO) {
      if (String(w[veld] ?? '').trim() === '') leeg.push(`week ${n}: ${veld}`)
    }
    /* 'n Week hoef nog nie 'n video te he nie. Maar as sy een het, moet dit
       die KAAL ID wees en nie 'n URL nie. Dit was eers "elke videoId is nog
       leeg", en dit was 'n oomblik en nie 'n reel nie: die dag toe Week 1 sy
       video gekry het, het die toets rooi geword sonder dat iets stukkend was.
       Die werklike gevaar is 'n hele skakel wat as 'n "ID" gestoor word — die
       speler wys dan 'n lee blok en niks kla nie. */
    const v = String(w.videoId ?? '')
    if (v !== '' && !geldigeVideoId(v)) slegteVideo.push(`week ${n}: ${v}`)
    if (w.pastoraleRisiko === 'hoog' &&
        String(w.fasiliteerderWaarskuwing || '').trim() === '') sonderWaarskuwing.push(n)
  }
  is('elke week se sleutel en weeknommer stem ooreen', verkeerdeNommer, [])
  is('geen verpligte veld is leeg nie', leeg, [])
  is('geen videoId is n skakel of rommel nie', slegteVideo, [])
  is('ELKE hoe-risiko week dra n fasiliteerderwaarskuwing', sonderWaarskuwing, [])

  /* En die hek moet werklik VANG — anders is die groen hierbo waardeloos. */
  is('n hoe-risiko week sonder waarskuwing sou gevang word',
     ['laag', 'medium', 'hoog'].map(r =>
       publiseerFoute({ ...heelWeek(), pastoraleRisiko: r }).length > 0),
     [false, false, true])

  /* Die weke wat mishandeling kan oopmaak, moet dit BY NAAM noem — 'n vae
     waarskuwing help niemand wat dit in 'n sitkamer moet lei nie. */
  const hoog = nommers.filter(n => WEKE[n].pastoraleRisiko === 'hoog')
  for (const n of hoog) {
    is(`week ${n} se waarskuwing noem mishandeling`,
       /mishandel/i.test(WEKE[n].fasiliteerderWaarskuwing || ''), true)
  }
  if (!hoog.length) console.log('  (geen hoe-risiko week geskryf nie — niks om te keur)')
}

console.log('\n── Die etikette ──\n')
is('al tien etikette het woorde',
   Object.entries(ETIKETTE).filter(([, w]) => !w || w.length < 5), [])
is('S is spesifieke sending — die etiket wat swak teologie keer',
   ETIKETTE.S, 'Spesifieke sending')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
