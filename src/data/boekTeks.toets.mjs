/* PDF-teks skoonmaak + hoofstuk-split vir die LUISTER-knoppie.
 *
 *   node src/data/boekTeks.toets.mjs
 */
import { skoonTeks, splitHoofstukke, genoegTeks, verwerkBoekTeks, MAKS_STUK } from './boekTeks.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)
const vals = (n, k) => is(n, !!k, false)

console.log('\n── skoonTeks ──')
{
  /* Woord oor 'n reël gebreek word heel gemaak. */
  is('koppelteken-breuk', skoonTeks('ge-\nbreek'), 'gebreek')
  /* Reëls binne 'n blok word een paragraaf; 'n leë reël skei paragrawe. */
  is('paragrawe', skoonTeks('one two\nthree four\n\nsecond para'),
     'one two three four\n\nsecond para')
  /* Bladsynommers en losstaande Romeinse syfers val uit. */
  is('bladsynommer uit', skoonTeks('Real line\n12\nNext line'), 'Real line Next line')
  is('page-woord uit', skoonTeks('Body here\nPage 3\nMore body'), 'Body here More body')
  is('meervoudige spasies', skoonTeks('a    b\t c'), 'a b c')
  is('leeg', skoonTeks(''), '')
}

console.log('\n── splitHoofstukke: duidelike koppe ──')
{
  const skoon = [
    'Chapter 1: The Restless Mind',
    'Your thoughts can feel like a storm.',
    'Chapter 2: Renewing Your Thoughts',
    'Transformation begins in the mind.',
  ].join('\n\n')
  const s = splitHoofstukke(skoon, { titel: 'Restless' })
  is('twee afdelings', s.length, 2)
  is('eerste titel', s[0].titel, 'Chapter 1: The Restless Mind')
  is('tweede titel', s[1].titel, 'Chapter 2: Renewing Your Thoughts')
  waar('eerste dra sy lyf', s[0].teks.includes('storm'))
  /* "Day N" tel ook as 'n kop. */
  const d = splitHoofstukke('Day 1\n\nBody one\n\nDay 2\n\nBody two')
  is('Day-koppe', d.map(a => a.titel), ['Day 1', 'Day 2'])
}

console.log('\n── Teks VOOR die eerste kop kry sy eie afdeling ──')
{
  const s = splitHoofstukke('A short intro paragraph.\n\nChapter 1\n\nThe body.', { titel: 'Boek' })
  is('intro + hoofstuk', s.length, 2)
  is('intro-titel val op die boek terug', s[0].titel, 'Boek')
  waar('intro dra sy teks', s[0].teks.includes('intro'))
}

console.log('\n── Geen koppe → gelyke stukke ──')
{
  const para = 'word '.repeat(200).trim()      // ~1000 chars
  const baie = Array.from({ length: 6 }, () => para).join('\n\n')  // ~6000 chars, geen koppe
  const s = splitHoofstukke(baie, { titel: 'Peace' })
  waar('meer as een stuk', s.length > 1)
  waar('elke stuk onder die perk se grens', s.every(a => a.teks.length <= MAKS_STUK * 1.6))
  is('stukke dra die boek se naam', s[0].titel, 'Peace 1')
}

console.log('\n── Altyd minstens een, nooit leeg ──')
{
  is('leeg gee niks', splitHoofstukke(''), [])
  const een = splitHoofstukke('Just one short paragraph of text.')
  is('een paragraaf, een afdeling', een.length, 1)
}

console.log('\n── genoegTeks: die prent-PDF word gevang ──')
{
  waar('genoeg egte teks', genoegTeks('This is a real paragraph of readable words. '.repeat(20)))
  vals('te min', genoegTeks('a b c'))
  vals('leeg', genoegTeks(''))
  vals('gemors-grepe', genoegTeks('\u0001\u0002 � � 12 34 !@#$ %^&*'.repeat(20)))
}

console.log('\n── verwerkBoekTeks: die hele pyplyn ──')
{
  const goed = verwerkBoekTeks('Chapter 1\n12\nThe real body of the book with many readable words. '.repeat(1), { titel: 'B' })
  // bou 'n egte lang een
  const lang = 'Chapter 1\n\n' + 'Readable sentence here. '.repeat(60) + '\n\nChapter 2\n\n' + 'More readable text. '.repeat(60)
  const r = verwerkBoekTeks(lang, { titel: 'B' })
  waar('ok', r.ok)
  is('twee hoofstukke', r.afdelings.length, 2)

  const sleg = verwerkBoekTeks('� � 1 2 3', { titel: 'B' })
  vals('prent-PDF: nie ok', sleg.ok)
  is('rede is geen-teks', sleg.rede, 'geen-teks')
}

console.log('\n── Wat n EGTE boek doen (uit n Chrome-PDF gemeet) ──')
{
  /* pdf-parse se bladsymerker word nie voorgelees nie. */
  is('bladsymerker uit', skoonTeks('Body one\n-- 3 of 18 --\nBody two'), 'Body one Body two')
  waar('ook "van"', !skoonTeks('A\n-- 2 van 9 --\nB').includes('--'))

  const lyf = 'Readable sentence for the chapter body. '.repeat(30)
  const boek = [
    'RESTLESS THOUGHTS', 'Dewald Scheepers', 'Copyright © 2026 Dewald Scheepers. All rights reserved.',
    'Contents', 'Chapter 1: Rest', 'Chapter 2: Captive',
    'Chapter 1: Rest', lyf, 'Chapter 2: Captive', lyf,
  ].join('\n\n')
  const s2 = splitHoofstukke(boek, { titel: 'Restless' })
  is('inhoudsopgawe + voorwerk weg: net die twee egte hoofstukke', s2.map(a => a.titel), ['Chapter 1: Rest', 'Chapter 2: Captive'])
  waar('elke hoofstuk dra sy volle lyf', s2.every(a => a.teks.length > 500))

  /* 'n Kort, EGTE inleiding (sonder kopiereg of inhoud) bly staan. */
  const s3 = splitHoofstukke('Welcome, friend. This book is for you.\n\nChapter 1\n\n' + lyf, { titel: 'B' })
  is('egte kort inleiding bly', s3.length, 2)
}

console.log(`\n${reg} reg, ${val} vals\n`)
if (val) process.exit(1)
