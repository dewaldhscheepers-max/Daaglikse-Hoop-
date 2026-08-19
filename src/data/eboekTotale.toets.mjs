/* Die twee getalle bo-aan die e-boekblad.
 *
 * Dit is die enigste som in hierdie app wat 'n mens aan die wereld wys, en dit
 * het al een keer 'n fout gehad wat soos 'n feit gelyk het: die teller het van
 * 7 681 na 8 545 gespring omdat 'n vaste getal by 'n lewende een gevoeg is
 * sonder om te kyk.
 */
import {
  eboekTotale, BOEK_WAARDE, VJ_WAARDE, VASTE_BOEKE, VASTE_WAARDE,
} from './eboekTotale.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Die som ──\n')
is('R280 per mens, soos Dewald gevra het', VJ_WAARDE, 280)
is('en R110 per e-boek', BOEK_WAARDE, 110)
{
  const t = eboekTotale({ rgCount: 5000, liveCount: 866, liveValue: 95240, vjDoen: 0 })
  is('boeke', t.boeke, 5000 + VASTE_BOEKE + 866)
  is('waarde', t.waarde, 5000 * 110 + VASTE_WAARDE + 95240)
}

console.log('\n── VOLG JESUS tel by ALBEI getalle ──\n')
{
  const sonder = eboekTotale({ rgCount: 5000, liveCount: 866, liveValue: 95240, vjDoen: 0 })
  const met    = eboekTotale({ rgCount: 5000, liveCount: 866, liveValue: 95240, vjDoen: 10 })
  is('tien mense is tien by die boeke', met.boeke - sonder.boeke, 10)
  is('en R2 800 by die waarde', met.waarde - sonder.waarde, 2800)
}
{
  const een = eboekTotale({ rgCount: 0, liveCount: 0, liveValue: 0, vjDoen: 1 })
  is('een mens alleen', een.boeke, VASTE_BOEKE + 1)
  is('en sy R280', een.waarde, VASTE_WAARDE + 280)
}

console.log('\n── Ontbreek n bron, wys ons NIKS ──\n')
/* Nie 'n nul nie en nie 'n halwe som nie: 'n getal wat eers laer is en dan
   spring, is 'n getal wat 'n mens nie weer glo. */
for (const ontbreek of ['rgCount', 'liveCount', 'liveValue']) {
  const in_ = { rgCount: 5000, liveCount: 866, liveValue: 95240, vjDoen: 3 }
  in_[ontbreek] = null
  const t = eboekTotale(in_)
  is(`sonder ${ontbreek}: geen getal`, t, { boeke: null, waarde: null })
}
is('en heeltemal sonder invoer', eboekTotale(), { boeke: null, waarde: null })
is('n leë voorwerp ook', eboekTotale({}), { boeke: null, waarde: null })

console.log('\n── Maar VOLG JESUS mag die blad NOOIT ophou nie ──\n')
{
  /* Dit is die jongste bron. Val daardie eindpunt om, bly die twee getalle reg
     — hulle is net kleiner. 'n Blad wat op 'n teller wag, is erger. */
  const t = eboekTotale({ rgCount: 5000, liveCount: 866, liveValue: 95240, vjDoen: null })
  is('n ontbrekende telling tel as nul', t.boeke, 5000 + VASTE_BOEKE + 866)
  is('en die waarde bly reg', t.waarde, 5000 * 110 + VASTE_WAARDE + 95240)
  is('undefined ook', eboekTotale({ rgCount: 1, liveCount: 1, liveValue: 1 }).boeke,
     1 + VASTE_BOEKE + 1)
}

console.log('\n── Rommel word nie n getal nie ──\n')
for (const sleg of ['nee', {}, NaN, Infinity, -5]) {
  const t = eboekTotale({ rgCount: sleg, liveCount: 1, liveValue: 1, vjDoen: 1 })
  is(`rgCount=${JSON.stringify(String(sleg))} gee niks`, t, { boeke: null, waarde: null })
}
{
  const t = eboekTotale({ rgCount: 10, liveCount: 1, liveValue: 1, vjDoen: 'baie' })
  is('n stukkende VOLG JESUS-telling tel as nul', t.boeke, 10 + VASTE_BOEKE + 1)
  const n = eboekTotale({ rgCount: 10, liveCount: 1, liveValue: 1, vjDoen: -3 })
  is('n negatiewe telling ook', n.boeke, 10 + VASTE_BOEKE + 1)
}
{
  /* 'n Breuk uit Firestore mag nie 'n desimale rand op die skerm sit nie. */
  const t = eboekTotale({ rgCount: 10.7, liveCount: 2.2, liveValue: 5.9, vjDoen: 1.8 })
  is('alles word afgerond', Number.isInteger(t.boeke) && Number.isInteger(t.waarde), true)
}

console.log('\n── Die getal groei net ──\n')
{
  /* Die "+" agter die getal beloof dit. Meer mense mag dit nooit kleiner maak. */
  let vorige = -1
  for (const n of [0, 1, 5, 50, 500]) {
    const t = eboekTotale({ rgCount: 5000, liveCount: 866, liveValue: 95240, vjDoen: n })
    is(`${n} mense: groter as die vorige`, t.waarde > vorige, true)
    vorige = t.waarde
  }
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
