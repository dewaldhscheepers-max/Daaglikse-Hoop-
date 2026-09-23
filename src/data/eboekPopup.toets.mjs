/* Watter e-boek die opspringer adverteer.
 *
 * Die eerste blok is die EGTE fout, en dit is die een wat nooit weer mag
 * terugkom nie: Dewald het Skinderstories opgelaai en daar was geen opspringer
 * nie, want die opspringer het net die INGEBOUDE lys geken.
 *
 *   node src/data/eboekPopup.toets.mjs
 */
import {
  kanWys, heleLys, kiesBoek, VERSTEK_KLEUR, VERSTEK_EMOJI,
} from './eboekPopup.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) { reg++; return }
  val++
  console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`)
}
const waar = (n, k) => is(n, !!k, true)

/* Die ingeboude lys, soos src/data/books.js. Hulle dra hul PDF in die kode. */
const INGEBOU = [
  { id: 'bid-nou', title: 'BID NOU', pdfUrl: '/pdf/bid-nou.pdf', color: '#E8E6F5', emoji: '🙏' },
  { id: 'toksies', title: 'TOKSIES', pdfUrl: '/pdf/toksies.pdf', color: '#F5E8E8', emoji: '☠️' },
]

/* Opgelaai deur die admin — leef NET in Firestore. */
const SKINDER = {
  id: 'skinderstories-1758500000000',
  title: 'Skinderstories',
  desc: 'Wanneer woorde seermaak.',
  pdfUrl: 'https://firebasestorage.googleapis.com/skinder.pdf',
  createdAt: '2026-09-22T10:00:00.000Z',
}
const GRENSE = {
  id: 'grense-1757000000000',
  title: 'GRENSE',
  desc: 'Wanneer om ja te sê en wanneer nee.',
  pdfUrl: 'https://firebasestorage.googleapis.com/grense.pdf',
  createdAt: '2026-09-04T10:00:00.000Z',
}

console.log('\n── DIE FOUT: n opgelaaide boek moet geadverteer kan word ──')
{
  /* Dit is presies wat op 23 September gebeur het. Voor die regmaak was die
     antwoord hier `null` — nie omdat sy dit gesien het nie, maar omdat die
     opspringer nie geweet het dat die boek bestaan nie. */
  const gesien = INGEBOU.map(b => b.id)
  const b = kiesBoek({ ingebou: INGEBOU, opgelaai: [SKINDER], gesien })
  waar('daar IS n boek om te wys', b)
  is('en dit is Skinderstories', b && b.title, 'Skinderstories')
}

console.log('\n── Die tweede helfte: dit droog nie op nie ──')
{
  /* Wie al die ingeboudes gesien het, het NOOIT weer n e-boek-opspringer
     gekry nie. Elke oplaai maak nou weer iets ongesien. */
  const alles = INGEBOU.map(b => b.id)
  is('sonder opgelaaide boeke is daar niks',
     kiesBoek({ ingebou: INGEBOU, opgelaai: [], gesien: alles }), null)
  waar('maar met een wel',
       kiesBoek({ ingebou: INGEBOU, opgelaai: [GRENSE], gesien: alles }))
}

console.log('\n── Die NUUTSTE opgelaaide boek gaan eerste ──')
{
  /* Hy laai vandag n boek op; dit moet more geadverteer word, nie oor n maand
     wanneer die alfabet daar uitkom nie. */
  const b = kiesBoek({ ingebou: INGEBOU, opgelaai: [GRENSE, SKINDER], gesien: [] })
  is('Skinderstories is nuwer as GRENSE', b && b.title, 'Skinderstories')
  /* En die opgelaaides staan VOOR die ingeboudes, soos op die blad. */
  is('die lys begin by die opgelaaides',
     heleLys({ ingebou: INGEBOU, opgelaai: [GRENSE, SKINDER] }).slice(0, 2).map(b2 => b2.title),
     ['Skinderstories', 'GRENSE'])
}

console.log('\n── n Boek sonder PDF word NIE geadverteer nie ──')
{
  /* Die oplaai is drie stappe. Tussenin bestaan die dokument met n titel en
     sonder PDF — en dan is "Kyk na die e-boek" n knoppie wat niks doen nie.
     Erger: n mens word hoogstens EEN keer per dag gevra, dus is daardie beurt
     vir niks verbruik. */
  const halfpad = { id: 'nuut-1758600000000', title: 'Nog Nie Klaar Nie', createdAt: '2026-09-23T08:00:00.000Z' }
  is('geen PDF, geen advertensie',
     kanWys(halfpad), false)
  const b = kiesBoek({ ingebou: INGEBOU, opgelaai: [halfpad, SKINDER], gesien: INGEBOU.map(x => x.id) })
  is('dit spring hom oor en vat die volgende', b && b.title, 'Skinderstories')

  is('n leë PDF-string tel ook nie', kanWys({ ...halfpad, pdfUrl: '   ' }), false)
  is('en n boek sonder titel ook nie', kanWys({ id: 'x', pdfUrl: '/a.pdf' }), false)
  is('met albei wel', kanWys({ id: 'x', title: 'A', pdfUrl: '/a.pdf' }), true)
}

console.log('\n── Wat sy reeds gesien het, kom nie weer nie ──')
{
  is('Skinderstories is gesien',
     kiesBoek({ ingebou: [], opgelaai: [SKINDER, GRENSE], gesien: [SKINDER.id] }).title, 'GRENSE')
  is('albei gesien gee niks',
     kiesBoek({ ingebou: [], opgelaai: [SKINDER, GRENSE], gesien: [SKINDER.id, GRENSE.id] }), null)
}

console.log('\n── Die opspringer teken n kring: kleur en emoji moet daar wees ──')
{
  /* `EbookPopup` teken `book.color` en `book.emoji`. n Opgelaaide dokument dra
     hulle nie noodwendig nie, en dan is dit n leë kring. */
  const b = kiesBoek({ ingebou: [], opgelaai: [SKINDER], gesien: [] })
  is('n verstek-kleur', b.color, VERSTEK_KLEUR)
  is('n verstek-emoji', b.emoji, VERSTEK_EMOJI)
  /* Maar die boek se EIE keuse wen — die admin laat hom een kies. */
  const eie = kiesBoek({ ingebou: [], opgelaai: [{ ...SKINDER, emoji: '💬', color: '#FFE8E8' }], gesien: [] })
  is('sy eie emoji wen', eie.emoji, '💬')
  is('en sy eie kleur ook', eie.color, '#FFE8E8')
}

console.log('\n── n Ingeboude boek se Firestore-dokument is sy BYVOEGSEL ──')
{
  /* Die kode dra die kleur, die emoji en die beskrywing; Firestore dra die
     egte pdfUrl. Kies n mens een van die twee, verloor hy die ander helfte. */
  const lys = heleLys({
    ingebou: INGEBOU,
    opgelaai: [{ id: 'bid-nou', pdfUrl: 'https://firebasestorage.googleapis.com/bid-nou.pdf' }],
  })
  const bid = lys.find(b => b.id === 'bid-nou')
  is('die titel kom uit die kode', bid.title, 'BID NOU')
  is('die emoji ook', bid.emoji, '🙏')
  is('maar die PDF kom uit Firestore', bid.pdfUrl, 'https://firebasestorage.googleapis.com/bid-nou.pdf')
  is('en hy staan net EEN keer in die lys',
     lys.filter(b => b.id === 'bid-nou').length, 1)
}

console.log('\n── Gemors breek dit nie ──')
{
  is('niks in', kiesBoek(), null)
  is('n lee voorwerp', kiesBoek({}), null)
  is('null-lyste', kiesBoek({ ingebou: null, opgelaai: null, gesien: null }), null)
  is('n string in plaas van n lys', kiesBoek({ ingebou: 'nee', opgelaai: 'nee' }), null)
  is('null in die lys self',
     kiesBoek({ ingebou: [null], opgelaai: [null, SKINDER], gesien: [] }).title, 'Skinderstories')
  is('heleLys sonder argumente', heleLys(), [])
  is('kanWys op gemors', kanWys(null), false)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
