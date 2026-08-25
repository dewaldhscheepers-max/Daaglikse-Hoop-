/* Waaroor die groepchat praat.
 *
 * Die duurste geval hier is 'n LEË kaart. 'n Week sonder groepvrae, 'n
 * weeknommer wat nog nie bestaan nie, 'n vraag wat 'n leë string is — elkeen
 * daarvan is 'n blok bo-aan die gesprek wat plek vat en niks sê nie. Daar is
 * meer toetse vir daardie geval as vir die gewone een.
 */
import { onderwerp, weekVrae, BEGINNE, normVraag } from './vjChatOnderwerp.js'
import { WEEK1_SESSIE } from './volgJesusWeek1.js'
import { WEEK2_SESSIE } from './volgJesusWeek2.js'
import { WEEK3_SESSIE } from './volgJesusWeek3.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── Die vrae kom uit die week se groepsessie ──\n')
{
  is('week 1 se vrae', weekVrae(1), WEEK1_SESSIE.vrae)
  is('week 2 se vrae', weekVrae(2), WEEK2_SESSIE.vrae)
  is('week 3 se vrae', weekVrae(3), WEEK3_SESSIE.vrae)
  waar('en daar is werklik vrae', weekVrae(1).length >= 3)
  waar('week 2 ook', weekVrae(2).length >= 3)
  waar('week 3 ook', weekVrae(3).length >= 3)
  /* Dit is die punt van die hele ding: geen nuwe inhoud om te skryf nie. */
  is('week 2 se eerste vraag staan reeds in die sessie', weekVrae(2)[0], WEEK2_SESSIE.vrae[0])
}

console.log('\n── Geen kaart wanneer daar niks is nie ──\n')
{
  /* Week 3 het intussen bygekom (sien volgJesusWeek3.js) — hierdie toets
     gebruik nou 'n week wat werklik nog nie bestaan nie. */
  is('week 4 bestaan nog nie', onderwerp(4, 0), null)
  is('week 52 ook nie', onderwerp(52, 0), null)
  is('geen weeknommer', onderwerp(undefined, 0), null)
  is('null', onderwerp(null, 0), null)
  is('rommel', onderwerp('appelkoos', 0), null)
  is('nul', onderwerp(0, 0), null)
  is('negatief', onderwerp(-1, 0), null)
  is('en weekVrae gee dan n LEE lys, nooit undefined', weekVrae(4), [])
  is('weekVrae van rommel', weekVrae({}), [])
}

console.log('\n── Leë vrae word uitgegooi, nooit gewys nie ──\n')
{
  /* weekVrae maak skoon; dit is die hek wat 'n leë aanhaling keer. */
  const skoon = weekVrae(1)
  waar('geen leë string', skoon.every(v => v.length > 0))
  waar('geen spasie-vraag', skoon.every(v => v.trim() === v))
  waar('almal is stringe', skoon.every(v => typeof v === 'string'))
}

console.log('\n── Die kaart self ──\n')
{
  const o = onderwerp(2, 0)
  is('die kop noem die week', o.kop, 'WEEK 2 · PRAAT SAAM OOR')
  is('die weeknommer', o.week, 2)
  is('die eerste vraag', o.vraag, WEEK2_SESSIE.vrae[0])
  is('die indeks', o.indeks, 0)
  is('hoeveel daar is', o.aantal, WEEK2_SESSIE.vrae.length)
  is('week 1 se kop', onderwerp(1, 0).kop, 'WEEK 1 · PRAAT SAAM OOR')
  /* Die kop word AFGELEI, nooit getik nie — dieselfde reel as binnekort(). */
  waar('die kop word afgelei, nie geskryf nie', /^WEEK \d+ · PRAAT SAAM OOR$/.test(o.kop))
}

console.log('\n── Die knoppie wat na die volgende vraag toe gaan, rol om ──\n')
{
  const n = weekVrae(2).length
  is('vraag 0', onderwerp(2, 0).vraag, WEEK2_SESSIE.vrae[0])
  is('vraag 1', onderwerp(2, 1).vraag, WEEK2_SESSIE.vrae[1])
  is(`vraag ${n} rol om na 0`, onderwerp(2, n).indeks, 0)
  is('vraag 100 val nie buite nie', onderwerp(2, 100).indeks, 100 % n)
  /* 'n Mens kan die knoppie onbeperk druk. Dit mag NOOIT undefined gee nie. */
  for (let i = 0; i < 200; i++) {
    const o = onderwerp(2, i)
    if (!o || typeof o.vraag !== 'string' || !o.vraag) {
      val++; console.log(`  VAL indeks ${i} gee niks`); break
    }
    if (i === 199) reg++
  }
  is('negatiewe indeks rol terug', onderwerp(2, -1).indeks, n - 1)
  is('en -100 ook', onderwerp(2, -100).indeks, ((-100 % n) + n) % n)
}

console.log('\n── n Rommel-indeks land op die eerste vraag ──\n')
{
  for (const rommel of [undefined, null, NaN, Infinity, -Infinity, 'twee', {}, []]) {
    const o = onderwerp(2, rommel)
    is(`indeks ${JSON.stringify(rommel) || String(rommel)}`, o && o.indeks, 0)
  }
  is('n gebroke getal word afgekap', onderwerp(2, 1.9).indeks, 1)
}

console.log('\n── Die beginne is OPENINGE, nie klaargemaakte sinne nie ──\n')
{
  is('daar is drie', BEGINNE.length, 3)
  waar('elkeen het n unieke id', new Set(BEGINNE.map(b => b.id)).size === BEGINNE.length)
  for (const b of BEGINNE) {
    waar(`"${b.woorde}" het woorde vir die knoppie`, b.woorde.length > 3)
    /* Die aanset moet MIDDEL-IN eindig. Eindig dit op 'n punt of 'n vraagteken,
       is dit 'n klaargemaakte sin en dan tik almal dieselfde ding. */
    waar(`"${b.woorde}" eindig oop`, /[a-z] $/.test(b.aanset))
    waar(`"${b.woorde}" se aanset is kort`, b.aanset.length <= 60)
    waar(`"${b.woorde}" se knoppie is kort`, b.woorde.length <= 24)
  }
  waar('die knoppies verskil van mekaar', new Set(BEGINNE.map(b => b.woorde)).size === 3)
  waar('die aansette verskil ook', new Set(BEGINNE.map(b => b.aanset)).size === 3)
}

console.log('\n── Die vrae is regte vrae, kort genoeg vir n kaart ──\n')
{
  for (const w of [1, 2]) {
    for (const v of weekVrae(w)) {
      waar(`week ${w}: "${v.slice(0, 34)}…" is n vraag`, v.includes('?'))
      /* 'n Vraag van 400 karakters vul die halwe skerm. Dewald: "dit moet nie
         die hele skerm bedek en onverstaanbaar wees nie." */
      waar(`week ${w}: "${v.slice(0, 34)}…" pas op n kaart (${v.length})`, v.length <= 200)
    }
  }
}

console.log('\n── n Vraag wat AL gevra is, kom nooit weer nie ──\n')
{
  /* Dewald: "wys dieselfde vraag toe ek uit en weer in gaan… toe stuur ek
     dieselfde vraag." Die GESPREK is die rekord, nie 'n teller in die skerm. */
  const alle = weekVrae(2)
  is('niks gestuur — die eerste vraag', onderwerp(2, 0, []).vraag, alle[0])
  is('en dan is al vier oor', onderwerp(2, 0, []).aantal, alle.length)

  const na1 = onderwerp(2, 0, [alle[0]])
  is('vraag 1 gestuur — die kaart gee die volgende', na1.vraag, alle[1])
  is('drie oor', na1.aantal, alle.length - 1)
  is('en dit tel wat gevra is', na1.gevra, 1)

  /* Presies sy geval: dieselfde vraag TWEE keer in die chat. */
  const dubbel = onderwerp(2, 0, [alle[0], alle[0]])
  is('twee keer dieselfde tel steeds as EEN', dubbel.vraag, alle[1])
  is('en drie is oor', dubbel.aantal, alle.length - 1)

  /* Die indeks kom uit die skerm en begin by 0 na elke oopmaak. Dit mag NIE
     'n gevraagde vraag terugbring nie. */
  for (let i = 0; i < 20; i++) {
    const o = onderwerp(2, i, [alle[0], alle[1]])
    if (!o || o.vraag === alle[0] || o.vraag === alle[1]) {
      val++; console.log(`  VAL indeks ${i} bring n gevraagde vraag terug`); break
    }
    if (i === 19) reg++
  }

  is('al vier gevra — die kaart verdwyn', onderwerp(2, 0, alle), null)
  is('en week 1 ook', onderwerp(1, 0, weekVrae(1)), null)
  /* Een oor: die ↻-knoppie moet weg, want hy gee dieselfde vraag terug. */
  is('een oor', onderwerp(2, 0, [alle[0], alle[1], alle[2]]).aantal, 1)

  /* Die res van die gesprek is nie vrae nie en mag niks wegvat nie. */
  const gewoon = ['Dankie', 'Plesier my dier ❤️', 'Dag 2 klaar gedoen!']
  is('gewone boodskappe vat niks weg nie', onderwerp(2, 0, gewoon).aantal, alle.length)
}

console.log('\n── Spasies en hoofletters maak nie n ander vraag nie ──\n')
{
  const v = weekVrae(2)[0]
  is('n ekstra spasie tel steeds', onderwerp(2, 0, [v + ' ']).vraag, weekVrae(2)[1])
  is('hoofletters ook', onderwerp(2, 0, [v.toUpperCase()]).vraag, weekVrae(2)[1])
  is('n dubbele spasie binne-in ook',
     onderwerp(2, 0, [v.replace(' ', '  ')]).vraag, weekVrae(2)[1])
  is('normVraag van rommel is leeg', normVraag(null), '')
  is('normVraag van undefined is leeg', normVraag(undefined), '')
  /* 'n Lee boodskap mag NOOIT 'n vraag uitwis nie. */
  is('lee boodskappe vat niks weg nie', onderwerp(2, 0, ['', '  ', null]).aantal, weekVrae(2).length)
  is('rommel in plaas van n lys', onderwerp(2, 0, 'nie n lys nie').aantal, weekVrae(2).length)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
