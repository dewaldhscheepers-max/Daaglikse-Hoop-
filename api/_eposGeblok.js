/* ────────────────────────────────────────────────────────────
   Mense wat NIE weer 'n e-pos moet kry nie.

   ── Waarom dit nie 'n uitvee is nie ──

   Die voor die hand liggende antwoord op "verwyder hierdie drie adresse" is
   om hulle dokumente in `emailList` uit te vee. Dit werk vir presies een
   stuur.

   Sien die nota bo-aan `_eposLys.js`: dieselfde adres kry 'n NUWE dokument
   wanneer iemand 'n boek kry, wanneer iemand skenk, en wanneer iemand 'n
   vennoot word — daar is ses honderd duplikate in die lys presies daarom.
   Vee 'n mens die dokument uit, is die adres weg tot die volgende keer dat
   daardie mens 'n gratis boek aflaai, en dan is hy stilweg terug op die lys
   en kry weer die nuusbrief. Niemand sou weet nie.

   'n Blok is anders: dit is 'n besluit oor 'n MENS, nie oor 'n dokument nie,
   en dit oorleef elke pad waarlangs 'n adres teruggevoeg kan word.

   ── Waarom die adresse gehas is ──

   Iemand wat vra om van 'n lys af te kom, se adres vir altyd in 'n
   git-geskiedenis skryf, is die verkeerde antwoord op daardie versoek. 'n
   SHA-256 van die genormaliseerde adres beantwoord die enigste vraag wat
   ons hier vra — "is HIERDIE adres geblok?" — en niks anders nie. 'n Mens
   kan nie 'n lys mense uit hierdie lêer lees nie.

   Dit is nie 'n geheim nie en dit maak niks toe nie; dit is net so min
   persoonlike inligting soos wat die werk toelaat.

   ── Om nog een by te voeg ──

       node api/_eposGeblok.js iemand@epos.com

   Dit druk die reël wat hier onder ingaan. Stoot dit, en daardie mens is
   van die volgende stuur af uit — uit ALBEI paaie, ook uit 'n veldtog wat
   reeds in die ry staan, want die sif staan in `stuurBondel` self.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')

/* Presies dieselfde normalisering as `_eposLys.js` se ontleding: kleinletters
   en gestroop. Wyk dit ooit af, gaan die blok stil verby 'n adres wat met 'n
   hoofletter geskryf is. */
function sleutel(adres) {
  return crypto.createHash('sha256')
    .update(String(adres || '').toLowerCase().trim())
    .digest('hex')
}

/* Elke reël is een mens wat gevra het om nie meer te hoor nie. Die
   kommentaar wys genoeg om 'n reël te kan verwyder as iemand terugkom, en
   te min om die adres te herbou. */
const GEBLOK = new Set([
  '156743914c66d6c4096cd42d75ec227188bf104f424637e5f211154dc4b76812', // g…b@gmail.com · 2026-08-31
  'f4b38aff621416bbd32e925e2450adb79a834f36afec67b89a0a79538b6c8c4a', // n…r@gmail.com · 2026-08-31
  'dd5b91d0954aee111cdd46b8eb800cac4edc8a68571dd3b68f214c477eb79464', // c…4@gmail.com · 2026-08-31
])

function isGeblok(adres) {
  if (!adres) return false
  return GEBLOK.has(sleutel(adres))
}

/* Sif 'n lys, en sê hoeveel uit is. Die GETAL maak saak: sonder dit lyk 'n
   stuur na 2728 in plaas van 2731 soos drie mislukkings. */
function sifGeblok(adresse) {
  const deur = []
  let geblok = 0
  for (const a of adresse || []) {
    if (isGeblok(a)) geblok++
    else deur.push(a)
  }
  return { adresse: deur, geblok }
}

module.exports = { isGeblok, sifGeblok, sleutel, GEBLOK }

/* `node api/_eposGeblok.js iemand@epos.com` */
if (require.main === module) {
  const adres = process.argv[2]
  if (!adres) {
    console.log('Gebruik: node api/_eposGeblok.js iemand@epos.com')
    process.exit(1)
  }
  const h = sleutel(adres)
  const kort = String(adres).toLowerCase().trim().replace(/^(.).*(.)@/, '$1…$2@')
  const dag = new Date().toISOString().slice(0, 10)
  console.log(isGeblok(adres) ? '\nReeds geblok.\n' : '\nVoeg hierdie reël by GEBLOK:\n')
  console.log(`  '${h}', // ${kort} · ${dag}\n`)
}
