/* KRISIS gaan OP. ONVEILIG gaan NIE.
 *
 * Dewald, 23 Augustus 2026: "'n Persoon wat oor selfmoordgedagtes, depressie
 * of ernstige emosionele nood praat, moet nie bloot as 'ongewenste inhoud'
 * versteek word nie."
 *
 * Hierdie lêer bestaan om te keer dat daardie twee ooit weer een ding word.
 * Die duurste fout hier is NIE 'n gemiste spam nie — dit is 'n vrou wie se
 * storie oor haar man se drank as "teistering" weggesteek is en wat dus dink
 * niemand wil haar hoor nie.
 */
import { onveiligTreffers, isOnveilig, besluit } from './sorgVeilig.js'
import { krisisTreffers } from './sorgKrisis.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

console.log('\n── NOOD is nie oortreding nie ──\n')
{
  /* DIE lys. Elke een van hierdie mense moet op die muur beland, met Hulp nou
     op sy skerm. Nie een van hulle mag weggesteek word nie. */
  const nood = [
    'Ek wil nie meer lewe nie. Ek dink elke dag daaraan om myself dood te maak.',
    'Ek dink heeltyd aan selfmoord en ek weet nie met wie om te praat nie.',
    'Ek wil myself seermaak wanneer dit te veel raak.',
    'Ek het al die pille gedrink want ek kan nie meer nie.',
    'I want to kill myself. I cannot do this anymore.',
    'Hy slaan my as hy drink en ek weet nie waarheen om te gaan nie.',
    'Ek is verkrag toe ek jonk was en ek het dit nooit vir iemand gesê nie.',
    'My kind word geslaan by die skool en niemand doen iets nie.',
  ]
  for (const t of nood) {
    const k = krisisTreffers(t)
    const b = besluit(t, { krisis: k })
    waar(`"${t.slice(0, 34)}…" is n krisis`, k.length > 0)
    is(`  → dit GAAN OP`, b.wys, true)
    is(`  → Hulp nou wys dadelik`, b.hulpNou, true)
    is(`  → dit is dringend vir admin`, b.dringend, true)
    is(`  → en dit staan in die GEVAAR-hopie`, b.status, 'gevaar')
    is(`  → geen "onveilig"-etiket op die mens`, b.onveilig, [])
  }
}

console.log('\n── Gewone swaar stories loop presies soos altyd ──\n')
{
  const gewoon = [
    'My seun praat al agt maande nie met my nie.',
    'Ek het my werk verloor en ek weet nie hoe om vir my vrou te sê nie.',
    'My ma is oorlede en ek kan nie ophou huil nie.',
    'Ek kan nie my pa vergewe nie.',
    'My man kyk pornografie en ek voel of ek nie genoeg is nie.',
    'Ons praat skaars meer en ek weet nie hoe om by my man uit te kom nie.',
    'Ek word wakker met angs elke oggend.',
    'Ek sukkel met drank en ek is skaam.',
    'Ek voel ek faal my gesin omdat ek nie werk kry nie.',
  ]
  for (const t of gewoon) {
    const b = besluit(t, { krisis: krisisTreffers(t) })
    is(`"${t.slice(0, 34)}…" gaan op`, b.wys, true)
    is(`  → geen rede om terug te hou`, b.onveilig, [])
    is(`  → nie dringend nie`, b.dringend, false)
    is(`  → en dit lewe eenvoudig`, b.status, 'outo')
  }
}

console.log('\n── Wat WEL teruggehou word ──\n')
{
  const sleg = [
    ['Ek gaan jou vermoor as jy weer hier kom', 'dreigement'],
    ['Ek sal hom bliksem', 'dreigement'],
    ['I will kill you', 'dreigement'],
    ['Jy is n hoer en almal weet dit', 'teistering'],
    ["Jy is 'n doos", 'teistering'],
    ['Go kill yourself', 'teistering'],
    ['Stuur my jou naaktefotos', 'seksueel'],
    ['Whatsapp my vir sex', 'seksueel'],
    ['Ek verkoop tik, bel my', 'onwettig'],
    ['Te koop: vuurwapen', 'onwettig'],
    ['Haar adres is Kerkstraat en sy werk by die bank', 'doxxing'],
    ['Verdien R5000 per dag met forex', 'spam'],
    ['Jy het gewen! Klik hier om jou prys te eis', 'spam'],
  ]
  for (const [t, rede] of sleg) {
    const b = besluit(t, { krisis: krisisTreffers(t) })
    is(`"${t.slice(0, 34)}…" gaan NIE op`, b.wys, false)
    waar(`  → die rede is "${rede}"`, b.onveilig.includes(rede))
    is(`  → en dit wag in die ONVEILIG-hopie`, b.status, 'onveilig')
  }
}

console.log('\n── ONVEILIG wen oor KRISIS ──\n')
{
  /* 'n Boodskap wat albei tref — iemand wat 'n ander mens dreig EN oor
     selfmoord praat — mag nie op die muur nie. Die dreigement is 'n ander
     mens se veiligheid, en dit weeg swaarder as die publikasie. Die krisis
     bly steeds dringend, want die mens self het steeds hulp nodig. */
  const t = 'Ek gaan jou vermoor en dan gaan ek myself doodmaak'
  const b = besluit(t, { krisis: krisisTreffers(t) })
  is('dit gaan NIE op nie', b.wys, false)
  is('maar dit is steeds n krisis', b.krisis, true)
  is('en Hulp nou wys steeds', b.hulpNou, true)
  is('en dit is steeds dringend', b.dringend, true)
  is('die hopie is ONVEILIG', b.status, 'onveilig')
}

console.log('\n── Die reëls is NOU, met opset ──\n')
{
  /* 'n Wye patroon steek regte stories weg, en dit is die duurste fout op
     hierdie blad. Elkeen hieronder DEEL 'n woord met 'n reël hierbo. */
  const naby = [
    'Ek gaan more werk toe',                       // "ek gaan" sonder teiken
    'Ek voel of ek n doos is',                     // oor homself, nie oor iemand nie
    'My man het n verhouding gehad',
    'Ek sukkel met pornografie en ek wil vry wees',
    'Ons het nie geld vir kos nie, kan iemand help',
    'Ek verkoop koeksisters vir die kerk se basaar',
    'Hy werk by die bank in die dorp',
    'Ek het R500 nodig vir my kind se skoolgeld',
    'Sy nommer werk nie meer nie en ek kan hom nie kry nie',
    'Ek wil myself nie meer haat nie',
  ]
  for (const t of naby) {
    is(`"${t.slice(0, 40)}" tref NIE`, onveiligTreffers(t), [])
  }
}

console.log('\n── Leeg en rommel ──\n')
{
  for (const rommel of [undefined, null, '', '   ', 0, {}, []]) {
    is(`${JSON.stringify(rommel)} tref niks`, onveiligTreffers(rommel), [])
  }
  is('isOnveilig op leeg', isOnveilig(''), false)
  const b = besluit('', {})
  is('n lee besluit gaan op', b.wys, true)
  is('en is nie n krisis nie', b.krisis, false)
  /* Sonder die krisis-lys mag dit nooit omval nie. */
  is('geen krisis-lys', besluit('iets').krisis, false)
  is('n null krisis-lys', besluit('iets', { krisis: null }).krisis, false)
}

console.log('\n── Aksente en hoofletters ──\n')
{
  waar('HOOFLETTERS tref', isOnveilig('EK GAAN JOU VERMOOR'))
  waar('aksente tref', isOnveilig('Verdíen R5000 per dag met forex'))
  is('geen duplikaat-redes', onveiligTreffers('forex forex bitcoin belegging word ryk'), ['spam'])
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
