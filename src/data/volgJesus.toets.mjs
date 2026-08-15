/* VOLG JESUS — die week se hekke, en die Skrifverwysings teen die EGTE Bybel.
 *
 * Die tweede helfte van hierdie leer is die waardevolste deel: dit neem elke
 * Skrifverwysing uit Week 1 tot 5 en toets dit teen die 31 102 verse wat
 * reeds in public/gab/ staan. Bestaan die boek? Die hoofstuk? Die verse?
 *
 * Dit vervang NIE Dewald se nagaan nie — die reel bly dat hy elke vers teen
 * sy Bybel kontroleer. Maar hy hoef nie 'n tikfout te gaan soek nie.
 */
import { readFileSync, existsSync } from 'node:fs'
import {
  ETIKETTE, BEWEGINGS, bewegingVir, KONTROLES,
  publiseerFoute, magPubliseer, geldigeVideoId,
  ontleedVerwysing, keurVerwysing, BOEKKODES,
} from './volgJesus.js'

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

    /* Elke verwysing uit Week 1 tot 5 wat Dewald geskryf het. */
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
      /* Die program se fondamentteks */ 'Matteus 28:18–20',
    ]

    const stukkend = []
    for (const v of VERWYSINGS) {
      const foute = keurVerwysing(v, leesBoek)
      if (foute.length) stukkend.push(`${v} → ${foute.join('; ')}`)
    }
    is(`al ${VERWYSINGS.length} verwysings uit Week 1-5 bestaan werklik`, stukkend, [])

    /* En die keurder moet werklik VANG — anders is die groen hierbo waardeloos. */
    is('n hoofstuk wat nie bestaan nie word gevang',
       keurVerwysing('Matteus 99:1', leesBoek).length > 0, true)
    is('n vers wat nie bestaan nie ook',
       keurVerwysing('Markus 1:9999', leesBoek).length > 0, true)
    is('en n reeks wat agteruit loop',
       keurVerwysing('Johannes 3:16-2', leesBoek).length > 0, true)
  }
}

console.log('\n── Die etikette ──\n')
is('al tien etikette het woorde',
   Object.entries(ETIKETTE).filter(([, w]) => !w || w.length < 5), [])
is('S is spesifieke sending — die etiket wat swak teologie keer',
   ETIKETTE.S, 'Spesifieke sending')

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
