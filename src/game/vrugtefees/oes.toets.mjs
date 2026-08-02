/* Toets Die Oneindige Oes se lopie en die herspeel-validasie.

   Die hele ranglys hang aan een aanname: dieselfde saad en dieselfde
   skuiwe gee altyd dieselfde punte. As dit ooit nie waar is nie, verwerp
   die bediener eerlike spelers en niemand sal weet hoekom nie. Hierdie
   toets speel dus regte lopies en dwing die twee kante om te klop.

   Loop met:  node src/game/vrugtefees/oes.toets.mjs */

import { magRuil } from './enjin.js'
import {
  beginOes, oesSkuif, herspeel, rondeVrug, rondeTeiken,
  dagSleutel, dagSaad, isDagSleutel, BEGIN_SKUIWE,
} from './oes.js'

let geslaag = 0, gedruip = 0
function is(naam, a, b) {
  const gelyk = JSON.stringify(a) === JSON.stringify(b)
  if (gelyk) { geslaag++ } else {
    gedruip++
    console.log(`  ✗ ${naam}\n      gekry:   ${JSON.stringify(a)}\n      verwag:  ${JSON.stringify(b)}`)
  }
}
function waar(naam, v) { is(naam, !!v, true) }
function kop(t) { console.log(`\n── ${t} ──`) }

/* 'n Bot wat speel en sy skuiwe neerskryf — presies wat die regte skerm
   doen. Ons gebruik geen ander pad na die enjin nie, sodat die toets die
   werklike vloei toets en nie 'n nabootsing daarvan nie. */
function speelEnSkryf(saad, maksSkuiwe = 400, kiesLukraak = false) {
  const lopie = beginOes(saad)
  const skuiwe = []
  let wagter = 0
  while (!lopie.klaar && skuiwe.length < maksSkuiwe && wagter++ < 5000) {
    const keuses = []
    for (let r = 0; r < 8; r++)
      for (let k = 0; k < 8; k++)
        for (const [dk, dr] of [[1, 0], [0, 1]]) {
          const a = { k, r }, b = { k: k + dk, r: r + dr }
          if (b.k < 8 && b.r < 8 && magRuil(lopie.bord, a, b)) keuses.push([a, b])
        }
    if (!keuses.length) break
    // Verkies 'n skuif wat die gevraagde vrug raak, sodat rondes klaarkom.
    let kies = keuses[0]
    if (kiesLukraak) kies = keuses[skuiwe.length % keuses.length]
    else {
      for (const [a, b] of keuses) {
        const sa = lopie.bord.selle[a.r * 8 + a.k], sb = lopie.bord.selle[b.r * 8 + b.k]
        if (sa.vrug === lopie.soort || sb.vrug === lopie.soort) { kies = [a, b]; break }
      }
    }
    const [a, b] = kies
    const uit = oesSkuif(lopie, a, b)
    if (!uit.geldig) break
    skuiwe.push([a.k, a.r, b.k, b.r])
  }
  return { lopie, skuiwe }
}

/* ── Determinisme ── */
kop('Dieselfde saad gee dieselfde lopie')
for (const saad of [1, 7, 12345, 999983]) {
  const a = speelEnSkryf(saad, 120)
  const b = speelEnSkryf(saad, 120)
  is(`saad ${saad}: dieselfde skuiwe`, a.skuiwe, b.skuiwe)
  is(`saad ${saad}: dieselfde punte`, a.lopie.punte, b.lopie.punte)
  is(`saad ${saad}: dieselfde rondes`, a.lopie.rondesKlaar, b.lopie.rondesKlaar)
}

/* ── Die bediener kom by dieselfde antwoord uit as die speler ──
   Dit is die toets waarvoor die hele lêer bestaan. */
kop('Herspeel gee presies dieselfde punte as die gespeelde lopie')
let herspeelToetse = 0
for (let saad = 1; saad <= 40; saad++) {
  const { lopie, skuiwe } = speelEnSkryf(saad, 250)
  if (skuiwe.length < 5) continue
  herspeelToetse++
  const uit = herspeel(saad, skuiwe)
  is(`saad ${saad}: die bediener aanvaar dit`, uit.ok, true)
  is(`saad ${saad}: punte klop`, uit.punte, lopie.punte)
  is(`saad ${saad}: rondes klop`, uit.rondes, lopie.rondesKlaar)
  is(`saad ${saad}: skuiwe klop`, uit.skuiwe, lopie.skuiweGedoen)
  is(`saad ${saad}: beste ketting klop`, uit.grootsteKetting, lopie.grootsteKetting)
}
waar(`ten minste 30 lopies is oorgespeel (${herspeelToetse})`, herspeelToetse >= 30)

/* ── Wat die bediener moet weier ── */
kop('Vervalsing')
{
  const { skuiwe } = speelEnSkryf(31337, 120)
  waar('die eerlike lopie word aanvaar', herspeel(31337, skuiwe).ok)

  // 'n Ander saad met dieselfde skuiwe: die bord is anders, dus is die
  // skuiwe amper seker onmoontlik.
  const anderSaad = herspeel(31338, skuiwe)
  waar('dieselfde skuiwe op \'n ander bord word gewantrou', !anderSaad.ok)

  // Een skuif verander
  const gepeuter = skuiwe.map(s => [...s])
  gepeuter[3] = [0, 0, 1, 0]
  const uitGepeuter = herspeel(31337, gepeuter)
  waar('\'n veranderde skuif word gevang', !uitGepeuter.ok || uitGepeuter.punte !== herspeel(31337, skuiwe).punte)

  // Skuiwe wat nie eens die regte vorm het nie
  waar('nie-getalle word geweier', !herspeel(31337, [[0, 0, 1, 'x']]).ok)
  waar('buite die bord word geweier', !herspeel(31337, [[0, 0, 0, 9]]).ok)
  waar('nie-lys word geweier', !herspeel(31337, 'baie punte asseblief').ok)
  waar('te veel skuiwe word geweier', !herspeel(31337, new Array(4000).fill([0, 0, 1, 0])).ok)
  waar('slegte saad word geweier', !herspeel(-1, skuiwe).ok)
  waar('nie-heelgetal saad word geweier', !herspeel(1.5, skuiwe).ok)
}

kop('Die lopie kan nie verby sy einde loop nie')
{
  // Speel tot die lopie klaar is, plak dan nog skuiwe agteraan.
  const { lopie, skuiwe } = speelEnSkryf(4242, 3000)
  if (lopie.klaar) {
    const teVeel = [...skuiwe, [0, 0, 1, 0]]
    waar('ekstra skuiwe na die einde word geweier', !herspeel(4242, teVeel).ok)
  } else {
    // Nie klaar nie is ook goed — dan het die bot net opgehou.
    waar('die lopie het \'n einde', lopie.skuiweOor >= 0)
  }
  waar('skuiweOor gaan nooit onder nul nie', lopie.skuiweOor >= 0)
}

kop('Ongeldige skuiwe kos niks')
{
  const lopie = beginOes(555)
  const voor = { punte: lopie.punte, oor: lopie.skuiweOor, gedoen: lopie.skuiweGedoen }
  const uit = oesSkuif(lopie, { k: 0, r: 0 }, { k: 7, r: 7 })   // nie buurmanne nie
  is('die skuif is ongeldig', uit.geldig, false)
  is('punte onveranderd', lopie.punte, voor.punte)
  is('skuiwe oor onveranderd', lopie.skuiweOor, voor.oor)
  is('skuiwe gedoen onveranderd', lopie.skuiweGedoen, voor.gedoen)
}

/* ── Rondes ── */
kop('Rondes')
{
  is('ronde 1 vra 8', rondeTeiken(1), 8)
  is('ronde 2 vra 11', rondeTeiken(2), 11)
  waar('elke ronde vra meer as die vorige',
       [1, 2, 3, 4, 5, 9, 20].every(n => rondeTeiken(n + 1) > rondeTeiken(n)))

  // Die gevraagde vrug moet altyd op die bord kan wees
  let almalGeldig = true
  for (let saad = 1; saad <= 200; saad++)
    for (let ronde = 1; ronde <= 30; ronde++) {
      const v = rondeVrug(saad, ronde)
      if (!Number.isInteger(v) || v < 0 || v > 5) almalGeldig = false
    }
  waar('die gevraagde vrug is altyd een wat op die bord bestaan', almalGeldig)

  // ...en dit moet nie altyd dieselfde vrug wees nie
  const gesien = new Set()
  for (let ronde = 1; ronde <= 40; ronde++) gesien.add(rondeVrug(77, ronde))
  waar(`die vrug wissel oor rondes (${gesien.size} verskillendes)`, gesien.size >= 4)

  // 'n Voltooide ronde moet skuiwe bysit, anders is dit nie oneindig nie
  const { lopie } = speelEnSkryf(88, 400)
  waar('die bot het ten minste een ronde klaargemaak', lopie.rondesKlaar >= 1)
  waar('rondes klaar pas by die rondenommer', lopie.ronde === lopie.rondesKlaar + 1)
}

kop('Elke lopie begin eners')
{
  const l = beginOes(9)
  is('begin met die regte aantal skuiwe', l.skuiweOor, BEGIN_SKUIWE)
  is('begin op ronde 1', l.ronde, 1)
  is('begin met nul punte', l.punte, 0)
  is('begin nie klaar nie', l.klaar, false)
  is('die bord is 8 by 8', l.bord.selle.length, 64)
  waar('geen versperrings in die oes nie', l.bord.selle.every(s => !s.blok))
}

/* ── Vandag se Oes ── */
kop('Vandag se Oes')
{
  is('dagSleutel gebruik UTC', dagSleutel(new Date('2026-08-02T23:30:00Z')), '2026-08-02')
  is('net oor middernag UTC is dit die volgende dag', dagSleutel(new Date('2026-08-03T00:30:00Z')), '2026-08-03')
  is('dieselfde dag gee dieselfde saad', dagSaad('2026-08-02'), dagSaad('2026-08-02'))
  waar('verskillende dae gee verskillende sade', dagSaad('2026-08-02') !== dagSaad('2026-08-03'))

  // Die saad moet oor 'n hele jaar goed versprei wees, anders speel twee
  // dae dieselfde bord.
  const sade = new Set()
  for (let d = 0; d < 365; d++) {
    const dt = new Date(Date.UTC(2026, 0, 1 + d))
    sade.add(dagSaad(dagSleutel(dt)))
  }
  is('365 dae gee 365 verskillende borde', sade.size, 365)

  waar('die saad pas in die enjin se perke',
       [...sade].every(s => Number.isInteger(s) && s >= 0 && s <= 2147483647))

  waar('geldige sleutel', isDagSleutel('2026-08-02'))
  waar('slegte sleutel word geweier', !isDagSleutel('2026-8-2'))
  waar('nie-string word geweier', !isDagSleutel(20260802))

  // Almal wat vandag speel, kry dieselfde bord.
  const saad = dagSaad('2026-08-02')
  const a = beginOes(saad), b = beginOes(saad)
  is('twee spelers kry dieselfde bord',
     a.bord.selle.map(s => s.vrug), b.bord.selle.map(s => s.vrug))
}

/* ── Werkverrigting ──
   Die bediener moet 'n lang lopie binne 'n redelike tyd kan oorspeel. */
kop('Werkverrigting')
{
  const { skuiwe } = speelEnSkryf(2024, 600)
  const begin = process.hrtime.bigint()
  const uit = herspeel(2024, skuiwe)
  const ms = Number(process.hrtime.bigint() - begin) / 1e6
  waar(`${skuiwe.length} skuiwe oorgespeel in ${ms.toFixed(0)} ms`, uit.ok && ms < 2000)
}

console.log('\n' + '─'.repeat(50))
if (gedruip) {
  console.log(`${gedruip} van ${geslaag + gedruip} toetse het gedruip.`)
  process.exit(1)
} else {
  console.log(`Al ${geslaag} toetse slaag.`)
}
