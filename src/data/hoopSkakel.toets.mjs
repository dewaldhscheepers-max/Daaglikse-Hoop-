/* Loop met:  node src/data/hoopSkakel.toets.mjs
 *
 * Die gedeelde skakel is die enigste pad waarlangs 'n mens wat NIE die app
 * het nie, by 'n boodskap uitkom. Werk hy nie, is die hele deel-knoppie 'n
 * knoppie wat niks doen nie — en dit is die stilste manier waarop hierdie
 * projek al gebreek het.
 */

import { hoopSkakel, idUitPad, geldigeId, deelBoodskap, BASIS, ONTVANG_TITEL } from './hoopSkakel.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  const gelyk = JSON.stringify(kry) === JSON.stringify(wag)
  if (gelyk) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}

/* Presies die vorm wat hierdie app se nota-id's het. */
const EG = 'Nie_my_wil_nie__maar_U_wil_geskied_1788231738800'

console.log('\n── Die skakel ──')
is('die egte id', hoopSkakel(EG), `${BASIS}/hoop/${EG}`)
is('\'n eie basis', hoopSkakel('a1', 'https://toets.co.za'), 'https://toets.co.za/hoop/a1')
is('skuinsstrepe aan die einde val weg', hoopSkakel('a1', 'https://x.com///'), 'https://x.com/hoop/a1')

console.log('\n── Heen en weer ──')
/* Die enigste toets wat werklik saak maak: wat gebou word, moet gelees kan
   word. Elkeen hiervan kom uit 'n werklike notatitel. */
for (const id of [
  EG,
  'WANNEER_JOU_SIEL_MOEG_IS_1787984697800',
  'Deursoek_my__O_God_1788146950482',
  'n-id-met-koppeltekens',
  '1 Konings',                 // spasies
  'Matteüs_6',                 // deeltekens
  'a',
  '100',
]) {
  const skakel = hoopSkakel(id)
  const pad = skakel.replace(BASIS, '')
  is(`${JSON.stringify(id)} kom heel terug`, idUitPad(pad), id)
}

console.log('\n── Paaie wat NIKS moet gee nie ──')
/* Gee dit iets terug waar dit nie moet nie, kaap hierdie skerm elke ander
   bladsy in die app. */
for (const pad of [
  '/', '/hoop', '/hoop/', '/bid/abc', '/go', '/sorg/iets',
  '/hoop/a/b', '/HOOPX/a', '', null, undefined, '/hoop//',
]) {
  is(`${JSON.stringify(pad)} → null`, idUitPad(pad), null)
}
/* Hoofletters in die PAD self is wel goed — 'n mens tik soms /Hoop/. */
is('/Hoop/abc werk', idUitPad('/Hoop/abc'), 'abc')
is('en \'n skuinsstreep aan die einde ook', idUitPad('/hoop/abc/'), 'abc')

console.log('\n── Wat \'n geldige id is ──')
is('gewoon',            geldigeId(EG), true)
is('koppeltekens',      geldigeId('a-b-c'), true)
is('spasies',           geldigeId('twee woorde'), true)
is('leeg',              geldigeId(''), false)
is('net spasies',       geldigeId('   '), false)
is('null',              geldigeId(null), false)
is('\'n skuinsstreep',  geldigeId('a/b'), false)
is('te lank',           geldigeId('x'.repeat(301)), false)
is('301 is te lank, 300 nie', geldigeId('x'.repeat(300)), true)
/* Beheerkarakters — die reël wat as 'n karakterreeks geskryf was en toe elke
   id met 'n koppelteken verwerp het. */
is('\'n nuwe reël in die id', geldigeId('a\nb'), false)
/* `String.fromCharCode(0)`, nie 'n rou NUL in die bronleer nie — 'n leer
   met 'n NUL in is 'n binere leer en grep hou op werk daarop. */
is('een NUL-greep',           geldigeId('a' + String.fromCharCode(0) + 'b'), false)
is('\'n tab',                 geldigeId('a\tb'), false)

console.log('\n── Die woorde ──')
{
  const teks = deelBoodskap('https://x.com/hoop/a1')
  /* Dit mag NOOIT advertensietaal word nie. 'n Mens stuur nie "laai die app
     af" aan 'n vriendin wat swaarkry nie — en dan word die skakel nooit
     gestuur nie. */
  is('geen "laai af"',      /laai.*af|download|installeer/i.test(teks), false)
  is('geen appnaam',        /Daaglikse Hoop/i.test(teks), false)
  is('dit klink soos \'n mens', /aan jou gedink/.test(teks), true)
  is('en die skakel is daarin', teks.includes('https://x.com/hoop/a1'), true)
  is('sonder \'n skakel bly die sin staan', deelBoodskap('').includes('aan jou gedink'), true)
}

console.log('\n── Die ontvanger se opskrif noem NIEMAND nie ──')
/* Die skakel dra geen sender-id nie en die skerm mag dus nooit 'n naam wys
   nie. 'n Skakel wat 'n mens kan terugvolg na wie hom gestuur het, is 'n ding
   wat hierdie app nie oor homself wil kan sê nie. */
is('geen naam in die opskrif', /\b(van|deur)\s+[A-Z]/.test(ONTVANG_TITEL), false)
is('en dit sê wat gebeur het', /gedeel/.test(ONTVANG_TITEL), true)

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
