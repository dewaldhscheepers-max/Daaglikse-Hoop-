/* VOLG JESUS — die week se hekke, en die Skrifverwysings teen die EGTE Bybel.
 *
 * Die tweede helfte van hierdie leer is die waardevolste deel: dit neem elke
 * Skrifverwysing uit Week 1 tot 24 en toets dit teen die 31 102 verse wat
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

    /* Elke verwysing wat Dewald in Week 1 tot 24 geskryf het. */
    const VERWYSINGS = [
      /* Week 1 */ 'Johannes 1:1–18', 'Matteus 1:18–25', 'Markus 1:1–11',
                   'Johannes 1:29–34', 'Markus 1:9–11', 'Johannes 1:35–39',
                   'Johannes 1:35–51',
      /* Week 2 */ 'Markus 1:14–15', 'Lukas 4:14–30', 'Lukas 4:16–21',
      /* Week 3 */ 'Johannes 3:1–21', 'Lukas 18:9–14', 'Johannes 3:14–17',
                   'Johannes 3:18–21', 'Lukas 18:13–14', 'Johannes 3:1–17',
      /* Week 4 */ 'Matteus 4:18–22', 'Matteus 11:28–30', 'Markus 1:16–20',
                   'Lukas 5:1–11', 'Markus 3:13–19', 'Lukas 9:23–27',
      /* Week 5 */ 'Markus 10:45', 'Markus 10:35–45', 'Markus 10:42–45',
                   'Lukas 24:1–12, 44–49', 'Lukas 24:1–12', 'Lukas 24:44–49',
                   'Markus 8:31', 'Markus 9:30–32', 'Markus 10:32–34',
                   'Matteus 20:28', 'Johannes 10:11–18', 'Johannes 12:23–33',
                   'Lukas 22:14–20',
      /* Week 6 */ 'Lukas 9:23–27', 'Lukas 14:25–35', 'Lukas 9:23',
                   'Lukas 14:28–33', 'Lukas 14:25–27', 'Lukas 9:23–25',
                   'Matteus 10:37–39', 'Matteus 16:24–27', 'Markus 8:34–38',
                   'Johannes 12:24–26', 'Markus 10:28–31', 'Johannes 21:19–22',
      /* Week 7 */ 'Matteus 3:13–17', 'Johannes 3:22–26', 'Johannes 4:1–2',
                   'Lukas 3:21–22',
      /* Week 8 */ 'Matteus 7:24–27', 'Johannes 8:31–36', 'Johannes 13:12–17',
                   'Lukas 6:46–49', 'Matteus 21:28–32', 'Johannes 14:15',
                   'Johannes 15:9–10',
      /* Week 9 */ 'Matteus 22:34–40', 'Markus 12:28–34', 'Markus 12:28–30',
                   'Markus 12:31', 'Markus 12:32–34', 'Lukas 10:25–37',
                   'Johannes 13:34–35', 'Matteus 5:43–48', 'Johannes 15:9–17',
      /* Week 10 */ 'Matteus 18:1–5', 'Markus 9:33–37', 'Lukas 18:15–17',
                    'Markus 9:35', 'Markus 9:36–37', 'Matteus 20:20–28',
                    'Lukas 9:46–48', 'Lukas 14:7–11', 'Lukas 22:24–27',
                    'Johannes 13:1–17',
      /* Week 11 */ 'Johannes 4:19–26', 'Matteus 4:8–10', 'Johannes 4:19–24',
                    'Johannes 4:23–24', 'Matteus 6:24', 'Matteus 15:7–9',
                    'Johannes 5:19–23', 'Johannes 12:1–8',
      /* Week 12 */ 'Lukas 18:9–14', 'Matteus 23:1–12, 23–28',
                    'Johannes 5:39–40', 'Matteus 23:23–28', 'Matteus 23:5–12',
                    'Matteus 6:1–18', 'Matteus 7:1–5', 'Matteus 9:10–13',
                    'Matteus 15:1–20', 'Lukas 11:37–54', 'Johannes 9:39–41',
      /* Week 13 */ 'Matteus 6:5–8', 'Markus 1:35', 'Lukas 5:15–16',
                    'Matteus 6:5–6', 'Matteus 6:7–8', 'Matteus 14:23',
                    'Markus 6:46', 'Lukas 6:12', 'Lukas 11:1–13',
                    'Matteus 26:36–44',
      /* Week 14 */ 'Matteus 6:9–13', 'Lukas 11:1–4', 'Matteus 6:9–10',
                    'Matteus 6:11', 'Matteus 6:12', 'Lukas 11:4', 'Matteus 6:13',
                    'Matteus 6:14–15', 'Lukas 11:5–13', 'Johannes 17',
      /* Week 15 */ 'Lukas 11:5–10', 'Lukas 11:11–13', 'Matteus 7:9–11',
                    'Matteus 6:5–13', 'Matteus 15:21–28', 'Markus 10:46–52',
                    'Lukas 22:39–46', 'Johannes 14:13–14', 'Johannes 15:7',
                    'Johannes 16:23–27',
      /* Week 16 */ 'Markus 1:35–39', 'Lukas 6:12–16', 'Markus 1:32–34',
                    'Matteus 14:13', 'Markus 6:30–32, 45–46', 'Lukas 4:42–44',
                    'Lukas 9:18', 'Lukas 9:28–29',
      /* Week 17 */ 'Matteus 6:16–18', 'Matteus 9:14–17', 'Markus 2:18–22',
                    'Lukas 5:33–39', 'Matteus 4:1–4', 'Lukas 4:1–4',
      /* Week 18 */ 'Matteus 6:1–4', 'Matteus 5:14–16', 'Matteus 6:2–3',
                    'Matteus 6:4', 'Matteus 6:19–24', 'Lukas 6:30–35',
                    'Lukas 12:32–34', 'Lukas 14:12–14', 'Markus 12:41–44',
                    'Lukas 18:18–30', 'Lukas 19:1–10',
      /* Week 19 */ 'Matteus 5:1–12', 'Lukas 6:20–26', 'Matteus 5:3–5',
                    'Matteus 5:6–7', 'Matteus 5:8', 'Matteus 5:9–12',
                    'Matteus 20:25–28', 'Matteus 23:11–12', 'Lukas 14:7–14',
      /* Week 20 */ 'Matteus 5:13–16', 'Matteus 5:13', 'Matteus 5:14–15',
                    'Matteus 5:16', 'Matteus 6:1', 'Markus 9:50',
                    'Lukas 14:34–35', 'Johannes 8:12', 'Johannes 15:8',
      /* Week 21 */ 'Matteus 5:21–26', 'Matteus 5:21–22', 'Matteus 5:22',
                    'Matteus 5:23–24', 'Matteus 5:25–26', 'Matteus 5:38–48',
                    'Matteus 18:15–20', 'Matteus 18:21–35', 'Markus 3:1–5',
                    'Markus 11:25', 'Lukas 6:27–36', 'Lukas 17:3–4',
      /* Week 22 */ 'Matteus 5:27–32', 'Matteus 19:1–12', 'Markus 10:2–12',
                    'Matteus 5:27–28', 'Matteus 5:29–30', 'Matteus 5:31–32',
                    'Matteus 19:3–9', 'Matteus 19:10–12',
      /* Week 23 */ 'Matteus 5:33–37', 'Matteus 23:16–22', 'Matteus 5:33–36',
                    'Matteus 5:37', 'Matteus 12:33–37', 'Johannes 8:31–32',
                    'Johannes 18:37',
      /* Week 24 */ 'Matteus 5:38–42', 'Lukas 6:27–31', 'Matteus 5:38–39',
                    'Matteus 5:40–41', 'Matteus 5:42', 'Lukas 6:32–36',
                    'Lukas 22:49–51', 'Johannes 18:19–23',
      /* Die program se fondamentteks */ 'Matteus 28:18–20',
    ]

    const stukkend = []
    for (const v of VERWYSINGS) {
      const foute = keurVerwysing(v, leesBoek)
      if (foute.length) stukkend.push(`${v} → ${foute.join('; ')}`)
    }
    is(`al ${VERWYSINGS.length} verwysings uit Week 1-24 bestaan werklik`, stukkend, [])

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
  is('hulle loop 1 tot 24 sonder n gat',
     nommers, Array.from({ length: nommers.length }, (_, i) => i + 1))

  const SONDER_VIDEO = VERPLIGTE_VELDE.filter(v => v !== 'videoId')
  const leeg = [], verkeerdeNommer = [], sonderWaarskuwing = [], metVideo = []
  for (const n of nommers) {
    const w = WEKE[n]
    if (w.weeknommer !== n) verkeerdeNommer.push(n)
    for (const veld of SONDER_VIDEO) {
      if (String(w[veld] ?? '').trim() === '') leeg.push(`week ${n}: ${veld}`)
    }
    /* Die videoId's word in die admin geplak; hier moet hulle leeg wees. */
    if (String(w.videoId ?? '') !== '') metVideo.push(n)
    if (w.pastoraleRisiko === 'hoog' &&
        String(w.fasiliteerderWaarskuwing || '').trim() === '') sonderWaarskuwing.push(n)
  }
  is('elke week se sleutel en weeknommer stem ooreen', verkeerdeNommer, [])
  is('geen verpligte veld is leeg nie', leeg, [])
  is('elke videoId is nog leeg', metVideo, [])
  is('ELKE hoe-risiko week dra n fasiliteerderwaarskuwing', sonderWaarskuwing, [])

  /* En die hek moet werklik VANG — anders is die groen hierbo waardeloos. */
  is('n hoe-risiko week sonder waarskuwing sou gevang word',
     ['laag', 'medium', 'hoog'].map(r =>
       publiseerFoute({ ...heelWeek(), pastoraleRisiko: r }).length > 0),
     [false, false, true])

  /* Die weke wat mishandeling kan oopmaak, moet dit BY NAAM noem — 'n vae
     waarskuwing help niemand wat dit in 'n sitkamer moet lei nie. */
  for (const n of [21, 22, 24]) {
    is(`week ${n} se waarskuwing noem mishandeling`,
       /mishandel/i.test(WEKE[n].fasiliteerderWaarskuwing || ''), true)
  }
}

console.log('\n── Die etikette ──\n')
is('al tien etikette het woorde',
   Object.entries(ETIKETTE).filter(([, w]) => !w || w.length < 5), [])
is('S is spesifieke sending — die etiket wat swak teologie keer',
   ETIKETTE.S, 'Spesifieke sending')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
