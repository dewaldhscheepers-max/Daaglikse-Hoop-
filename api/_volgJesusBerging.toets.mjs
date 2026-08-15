/* Hoe 'n VOLG JESUS-week gestoor en teruggelees word.
 *
 * Die belangrikste toets in hierdie leer is die laaste een: `gepubliseer`
 * moet ALTYD vals begin en mag nooit deur die JSON-lading verander word nie.
 * Die hele ontwerp hang daaraan dat niks in die app verskyn voor Dewald dit
 * self aanskakel nie.
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { dokNaam, naFirestore, uitFirestore, lysInskrywing, MAX_GREPE } =
  require('./_volgJesusBerging.js')

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

const NOU = '2026-08-15T12:00:00Z'
const WEEK = { weeknommer: 1, titel: 'Wie is Jesus?', videoId: 'dQw4w9WgXcQ',
               kernwaarheid: 'Dissipelskap begin by Wie Jesus is.' }

console.log('\n── Die dokument se naam ──\n')
is('week 1 kry n nul voor',  dokNaam(1),  'week-01')
is('week 9 ook',             dokNaam(9),  'week-09')
is('week 10 nie',            dokNaam(10), 'week-10')
is('week 52 ook nie',        dokNaam(52), 'week-52')
/* Sonder die nul sou week-10 voor week-2 sorteer. */
is('en hulle sorteer reg',
   [dokNaam(2), dokNaam(10)].sort(), ['week-02', 'week-10'])
for (const sleg of [0, 53, -1, 1.5, 'een', null, undefined, {}, '1; DROP']) {
  is(`${JSON.stringify(sleg)} kry geen naam nie`, dokNaam(sleg), null)
}

console.log('\n── Heen en terug ──\n')
{
  const f = naFirestore(WEEK, NOU)
  is('die weeknommer staan apart vir sortering', f.fields.weeknommer, { integerValue: '1' })
  is('die tyd word gestoor', f.fields.opgedateer, { timestampValue: NOU })
  is('en die hele week is een string', typeof f.fields.data.stringValue, 'string')

  const terug = uitFirestore({ fields: f.fields })
  is('die titel oorleef',        terug.titel, 'Wie is Jesus?')
  is('die video-id ook',         terug.videoId, 'dQw4w9WgXcQ')
  is('en die kernwaarheid ook',  terug.kernwaarheid, WEEK.kernwaarheid)
}

console.log('\n── Gepubliseer begin ALTYD vals ──\n')
{
  is('n nuwe week is nie gepubliseer nie',
     naFirestore(WEEK, NOU).fields.gepubliseer, { booleanValue: false })

  /* Iemand wat `gepubliseer: true` in die JSON instuur, mag dit nie so kry
     nie — die aparte veld is die waarheid, en hy word uitdruklik gestel. */
  is('maar dit word gerespekteer as dit uitdruklik waar is',
     naFirestore({ ...WEEK, gepubliseer: true }, NOU).fields.gepubliseer,
     { booleanValue: true })
  is('n string "true" tel NIE',
     naFirestore({ ...WEEK, gepubliseer: 'true' }, NOU).fields.gepubliseer,
     { booleanValue: false })
  is('en 1 ook nie',
     naFirestore({ ...WEEK, gepubliseer: 1 }, NOU).fields.gepubliseer,
     { booleanValue: false })
}

console.log('\n── Die APARTE veld is die waarheid, nie die JSON nie ──\n')
{
  /* Sou 'n ou dokument `gepubliseer: true` binne sy JSON dra terwyl die
     aparte veld vals is, moet die aparte veld wen. Andersom sou 'n mens 'n
     week kon publiseer deur die JSON te redigeer. */
  const bedrieglik = {
    fields: {
      data: { stringValue: JSON.stringify({ ...WEEK, gepubliseer: true }) },
      gepubliseer: { booleanValue: false },
      opgedateer: { timestampValue: NOU },
    },
  }
  is('die JSON kan nie publikasie afdwing nie', uitFirestore(bedrieglik).gepubliseer, false)

  const andersom = {
    fields: {
      data: { stringValue: JSON.stringify({ ...WEEK, gepubliseer: false }) },
      gepubliseer: { booleanValue: true },
      opgedateer: { timestampValue: NOU },
    },
  }
  is('en dit kan dit ook nie verberg nie', uitFirestore(andersom).gepubliseer, true)
  is('n ontbrekende veld tel as nie gepubliseer nie',
     uitFirestore({ fields: { data: { stringValue: JSON.stringify(WEEK) } } }).gepubliseer, false)
}

console.log('\n── n Halwe week is erger as geen week nie ──\n')
for (const [naam, dok] of [
  ['niks',                undefined],
  ['n lee dokument',      {}],
  ['sonder velde',        { fields: {} }],
  ['data is nie n string', { fields: { data: { integerValue: '5' } } }],
  ['stukkende JSON',      { fields: { data: { stringValue: '{nie json' } } }],
  ['JSON wat n getal is', { fields: { data: { stringValue: '42' } } }],
  ['JSON wat null is',    { fields: { data: { stringValue: 'null' } } }],
]) {
  is(`${naam} gee null`, uitFirestore(dok), null)
}

console.log('\n── Die lys wys net die rugstring ──\n')
{
  const week = uitFirestore({ fields: naFirestore(WEEK, NOU).fields })
  const ry = lysInskrywing(week)
  is('die lys het presies hierdie sleutels',
     Object.keys(ry).sort(),
     ['gepubliseer', 'hersiening', 'hetVideo', 'opgedateer', 'titel', 'weeknommer'])
  /* Die volle week is groot; 52 van hulle op 'n foon is onnodig. */
  is('en NIE die hele inhoud nie', 'kernwaarheid' in ry, false)
  is('dit wys of daar n video is', ry.hetVideo, true)
  is('en sonder video wys dit dit ook',
     lysInskrywing({ ...week, videoId: '' }).hetVideo, false)
  is('n week sonder hersiening wag', ry.hersiening, 'wag')
  is('null gee null',                lysInskrywing(null), null)
}

console.log('\n── n Week wat te groot is, is n fout ──\n')
{
  let gegooi = false
  try { naFirestore({ ...WEEK, gebed: 'x'.repeat(MAX_GREPE + 1) }, NOU) }
  catch { gegooi = true }
  is('dit word gekeer', gegooi, true)
  is('maar n normale week gaan deur', !!naFirestore(WEEK, NOU), true)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
