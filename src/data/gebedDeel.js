/* ────────────────────────────────────────────────────────────
   "Bid vir my" — die reels.

   Iemand plaas 'n gebedsversoek en kan iemand wat hy vertrou vra om saam te
   bid. Die ontvanger maak 'n skakel oop, druk "Ek bid saam", en die teller
   loop op.

   Alles wat 'n mens verkeerd kan kry, sit in hierdie lêer, want dit is die
   deel wat sonder 'n blaaier getoets kan word.

   ── Die drie dinge wat nooit mag gebeur nie ──

   1. 'n KRISISVERSOEK MAG NOOIT DEELBAAR WEES NIE. Iemand wat oor selfmoord,
      mishandeling of gevaar skryf, se woorde word nie 'n deel-kaart nie.
      Daardie mens het hulp nodig, nie 'n teller nie. Die hek staan hier en
      word ook op die bediener weer nagegaan — 'n kliënt kan lieg.

   2. GEEN KONTAKBESONDERHEDE NIE. 'n Nommer of 'n adres in 'n versoek wat
      oor WhatsApp versprei, is 'n mens se privaatheid wat weg is.

   3. GEEN TELLER WAT SEERMAAK NIE. "0 mense bid vir jou" is die wreedste sin
      wat hierdie app kan wys. Sien `saamSin`.
   ──────────────────────────────────────────────────────────── */

import { krisisTreffers, kontakTreffers } from './sorgKrisis.js'

/* Kort genoeg om te lees op 'n foon, lank genoeg om iets te sê. */
export const MIN_LENGTE = 15
export const MAKS_LENGTE = 600

/* ── Mag hierdie versoek gedeel word? ──

   Twee hekke, en albei gaan oor die TEKS. Daar was 'n derde — 'n
   toestemmingsblokkie onder die kassie — en dit is weg.

   Die rede: die deel-aksie self IS die toestemming. 'n Mens plaas sy versoek,
   sien dan "Wil jy dit ook vir iemand stuur wat jy vertrou?", en druk die
   knoppie. Dit is 'n vrywillige, spesifieke en ingeligte keuse op die oomblik
   dat dit gebeur — hy sien presies wat gestuur word en aan wie hy dit stuur.

   Die blokkie het gevra dat iemand vooraf besluit oor iets wat hy dalk nooit
   gaan doen nie, op die presiese oomblik dat hy net gebed wil vra. Dit het die
   skerm administratief laat voel op die plek waar dit menslik moet wees.

   Toestemming vir die OPENBARE MUUR is 'n aparte ding en bly waar dit was —
   dit is wat die "Anoniem, geen name word gestoor nie"-reël bo die kassie doen.
   Die twee moet nie deurmekaar geraak nie: op die muur verskyn is nie
   dieselfde as om 'n skakel aan jou suster te stuur nie.

   Gee 'n rede terug, nie net 'n ja of nee nie — die skerm moet kan sê wat
   fout is. */
export function magDeel({ teks }) {
  const krisis = krisisTreffers(teks)
  if (krisis.length) {
    return { mag: false, rede: 'krisis', krisis, kontak: [] }
  }

  const kontak = kontakTreffers(teks)
  if (kontak.length) {
    return { mag: false, rede: 'kontak', krisis: [], kontak }
  }

  const skoon = String(teks || '').trim()
  if (skoon.length < MIN_LENGTE) {
    return { mag: false, rede: 'te-kort', krisis: [], kontak: [] }
  }

  return { mag: true, rede: null, krisis: [], kontak: [] }
}

/* ── Die teller se woorde ──

   Die spesifikasie is hier heeltemal reg en dit is die belangrikste ontwerp-
   besluit in die hele funksie: wanneer niemand nog gebid het nie, wys ons
   NIE 'n nul nie.

   'n Mens wat swaarkry en "0 mense bid vir jou" sien, kry presies die
   teenoorgestelde van wat hierdie funksie moet doen. Hy voel dan nie net
   alleen nie — hy voel afgewys.

   En dit is nooit "likes" nie. Dit is altyd SAAMSTAAN. */
export function saamSin(n) {
  const getal = Number(n) || 0
  if (getal <= 0) return 'Jou gebedsversoek is nou deel van ons gebedsgemeenskap.'
  if (getal === 1) return '1 persoon bid saam met jou.'
  return `${getal} mense bid saam met jou.`
}

/* Dieselfde getal, maar gesien deur die oe van 'n vreemdeling wat die skakel
   oopgemaak het. Hier is 'n nul ook stil — die ontvanger hoef nie te weet dat
   hy die eerste is nie, want dan voel die versoek verlate. */
export function saamSinVirOntvanger(n) {
  const getal = Number(n) || 0
  if (getal <= 0) return ''
  if (getal === 1) return '1 persoon bid reeds saam.'
  return `${getal} mense bid reeds saam.`
}

/* ── Die skakel ──

   Kort, en dit lees soos wat dit is. /bid/<id> */
export function gebedSkakel(id, basis = 'https://dewaldscheepers.com') {
  return `${String(basis).replace(/\/+$/, '')}/bid/${encodeURIComponent(String(id || ''))}`
}

/* Lees 'n gebed-id uit 'n pad. Gee null vir enigiets anders. */
export function idUitPad(pad) {
  const m = String(pad || '').match(/^\/bid\/([A-Za-z0-9_-]{6,64})\/?$/)
  return m ? m[1] : null
}

/* ── Die boodskap wat oor WhatsApp gaan ──

   Die spesifikasie is streng hieroor en tereg. Dit sê nie "laai die app af"
   nie en dit sê nie "help ons groei" nie. Dit vra een ding.

   Die mens deel nie vir Daaglikse Hoop nie. Hy deel omdat hy gebed nodig
   het. */
export function deelBoodskap(skakel) {
  return [
    'Ek gaan deur iets waarvoor ek gebed nodig het.',
    "Ek het 'n gebedsversoek op Daaglikse Hoop geplaas.",
    'Sal jy asseblief saam met my bid? 🙏🏻',
    '',
    skakel,
  ].join('\n')
}

/* ── Wat die persoon later sien ──

   Die groeilus word 'n sorglus. Ná 'n paar dae vra die app hoe dit gaan.

   Nie te gou nie — vra jy 'n uur later, is dit 'n kennisgewing en nie sorg
   nie. Nie te laat nie, want dan is die oomblik verby. */
export const VRA_NA_DAE = 3

export function magVraHoeGaanDit({ geplaasOp, laasGevraOp, nou }) {
  const geplaas = new Date(geplaasOp).getTime()
  const tyd = new Date(nou).getTime()
  if (!isFinite(geplaas) || !isFinite(tyd)) return false

  const dae = (tyd - geplaas) / 86400000
  if (dae < VRA_NA_DAE) return false

  /* Een keer is genoeg. Twee keer is 'n stelsel wat aandring. */
  if (laasGevraOp) return false

  return true
}
