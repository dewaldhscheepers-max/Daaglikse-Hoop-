/* Die eenmalige lopie oor LEWENDE data.
 *
 * Twee dinge kan hier onherstelbaar skeefloop, en die hele lêer gaan oor
 * hulle:
 *
 *   1. 'n DUPLIKAAT. Vir die mens wat geskryf het, lyk dieselfde storie twee
 *      keer op die muur soos 'n lek.
 *   2. IEMAND SE WOORDE WAT OPENBAAR GAAN SONDER TOESTEMMING.
 *
 * Daar is geen "probeer weer" ná 'n migrasie nie. Dit moet die eerste keer
 * reg wees.
 */
import { besluitOor, muurUit, beplan, verslag, REDES } from './sorgMigrasie.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}
const waar = (n, k) => is(n, !!k, true)

const OK = {
  id: 'b1', teks: 'My seun praat al agt maande nie met my nie.',
  onderwerp: 'kinders', dag: '2026-06-14', geskep: '2026-06-14T09:12:00.000Z',
  status: 'nuut', anoniem: true,
  toestemmings: { openbaar: true, redigeer: true },
}
const leeg = new Set()

console.log('\n── n Gewone wagtende plasing gaan op ──\n')
{
  is('dit publiseer', besluitOor(OK, leeg).uitkoms, 'publiseer')
  is('sonder n rede, want daar is niks fout nie', besluitOor(OK, leeg).rede, '')
}

console.log('\n── DUPLIKATE ──\n')
{
  /* Twee hekke, want die een kan verlore gaan wanneer 'n lopie halfpad omval
     en die ander nooit nie. */
  is('n plasing met n muurId is reeds daar',
     besluitOor({ ...OK, muurId: 'm9' }, leeg).uitkoms, 'bestaan')
  is('en een wat op die muur staan ook',
     besluitOor(OK, new Set(['b1'])).uitkoms, 'bestaan')

  /* DIE toets: loop die hele ding TWEE keer. Die tweede lopie mag niks
     publiseer nie. */
  const inkomend = [OK, { ...OK, id: 'b2' }, { ...OK, id: 'b3' }]
  const een = beplan(inkomend, new Set())
  is('die eerste lopie publiseer drie', een.publiseer.length, 3)

  const naEen = new Set(een.publiseer.map(x => x.muur.bronId))
  const twee = beplan(inkomend, naEen)
  is('die tweede lopie publiseer NIKS', twee.publiseer.length, 0)
  is('en tel hulle almal as "bestaan"', twee.bestaan.length, 3)

  /* Val 'n lopie halfpad om, moet die volgende een net die res vat. */
  const half = beplan(inkomend, new Set(['b1']))
  is('n halwe lopie hervat', half.publiseer.length, 2)
  is('en herhaal nie die eerste een nie', half.bestaan.length, 1)
}

console.log('\n── TOESTEMMING is die duurste hek ──\n')
{
  /* Sonder 'n gemerkte blokkie is dit iemand se woorde wat openbaar gaan
     sonder dat hy ja gesê het. 'n Ontbrekende veld tel as GEEN toestemming —
     die veilige kant. */
  const sonder = [
    { ...OK, toestemmings: undefined },
    { ...OK, toestemmings: null },
    { ...OK, toestemmings: {} },
    { ...OK, toestemmings: { openbaar: false } },
    /* 'n String is nie 'n ja nie. Dit is presies die soort ding wat 'n ou
       rekord dra. */
    { ...OK, toestemmings: { openbaar: 'true' } },
    { ...OK, toestemmings: { openbaar: 1 } },
    { ...OK, toestemmings: { redigeer: true } },
  ]
  for (const p of sonder) {
    const b = besluitOor(p, leeg)
    is(`toestemmings ${JSON.stringify(p.toestemmings)} → uitgesluit`, b.uitkoms, 'uitgesluit')
    is('  → en die rede sê hoekom', b.rede, REDES.geenToestemming)
  }
}

console.log('\n── Wat n mens REEDS besluit het, staan ──\n')
{
  for (const [status, rede] of [
    ['gevaar', REDES.gevaar],
    ['onveilig', REDES.onveilig],
    ['weg', REDES.verwyder],
    ['verwyder', REDES.verwyder],
    ['spam', REDES.spam],
  ]) {
    const b = besluitOor({ ...OK, status }, leeg)
    is(`status "${status}" → uitgesluit`, b.uitkoms, 'uitgesluit')
    is('  → met die regte rede', b.rede, rede)
  }
  /* 'n Krisis word NIE hier gepubliseer nie. Nuwe krisis-plasings gaan wel
     dadelik op (sien src/data/sorgVeilig.js) — maar 'n OU een het nooit deur
     daardie pad geloop nie, en niemand het al daarna gekyk nie. */
  is('n ou krisis wag vir n mens', besluitOor({ ...OK, status: 'gevaar' }, leeg).uitkoms, 'uitgesluit')

  /* Wat reeds outomaties geplaas is, tel as "bestaan" via muurId. */
  is('n outo-plasing is reeds daar',
     besluitOor({ ...OK, status: 'outo', muurId: 'm4' }, leeg).uitkoms, 'bestaan')
}

console.log('\n── Vlaggies op die rekord self ──\n')
{
  is('gerapporteer as getal', besluitOor({ ...OK, gerapporteer: 2 }, leeg).rede, REDES.gerapporteer)
  is('gerapporteer as waar', besluitOor({ ...OK, gerapporteer: true }, leeg).rede, REDES.gerapporteer)
  is('gerapporteer: 0 keer NIKS', besluitOor({ ...OK, gerapporteer: 0 }, leeg).uitkoms, 'publiseer')
  is('verwyder', besluitOor({ ...OK, verwyder: true }, leeg).rede, REDES.verwyder)
  is('weg', besluitOor({ ...OK, weg: true }, leeg).rede, REDES.verwyder)
  is('spam', besluitOor({ ...OK, spam: true }, leeg).rede, REDES.spam)
}

console.log('\n── Leeg en rommel val stil uit ──\n')
{
  is('geen teks', besluitOor({ ...OK, teks: '' }, leeg).rede, REDES.leeg)
  is('net spasies', besluitOor({ ...OK, teks: '   ' }, leeg).rede, REDES.leeg)
  is('geen id', besluitOor({ ...OK, id: '' }, leeg).uitkoms, 'uitgesluit')
  is('null', besluitOor(null, leeg).uitkoms, 'uitgesluit')
  is('n lee lys gee n lee plan', beplan([], leeg),
     { publiseer: [], bestaan: [], uitgesluit: [] })
  is('null ook', beplan(null, leeg), { publiseer: [], bestaan: [], uitgesluit: [] })
  is('n ontbrekende stel breek nie', besluitOor(OK, null).uitkoms, 'publiseer')
}

console.log('\n── Die OORSPRONKLIKE datum, tyd en inhoud gaan oor ──\n')
{
  const m = muurUit(OK)
  is('die datum bly Junie', m.datum, '2026-06-14')
  is('en die tydstempel ook', m.geskep, '2026-06-14T09:12:00.000Z')
  is('die teks is onveranderd', m.teks, OK.teks)
  is('die onderwerp bly', m.onderwerp, 'kinders')
  is('dit is gepubliseer', m.gepubliseer, true)
  is('dit wys terug na sy bron', m.bronId, 'b1')
  is('en dit is as gemigreer gemerk', m.gemigreer, true)
}

console.log('\n── Die anonimiteitskeuse gaan PRESIES oor ──\n')
{
  const anon = muurUit({ ...OK, anoniem: true, naam: 'Maria', foto: 'https://x/y.jpg' })
  is('anoniem gee geen naam', anon.naam, '')
  is('en geen foto', anon.foto, '')
  is('en die vlag staan', anon.anoniem, true)

  const genoem = muurUit({ ...OK, anoniem: false, naam: 'Maria K.', foto: 'https://x/y.jpg' })
  is('genoem behou die naam', genoem.naam, 'Maria K.')
  is('en die foto', genoem.foto, 'https://x/y.jpg')
  is('en die vlag', genoem.anoniem, false)

  /* Die VERSTEK is anoniem — 'n ou rekord het nie eens die veld nie. */
  const oud = muurUit({ ...OK, anoniem: undefined, naam: 'Maria' })
  is('geen veld = anoniem', oud.anoniem, true)
  is('en die naam kom nie deur nie', oud.naam, '')
}

console.log('\n── Die rou rekord se geheime kom NIE oor nie ──\n')
{
  /* 'n WITLYS. Voeg iemand more 'n veld by die inkomende rekord, kom dit eers
     uit wanneer dit in muurUit bygesit word. */
  const m = muurUit({
    ...OK,
    toestel: 'has-abc-123',
    kode: 'ABCD-EFGH-IJKL',
    krisisWoorde: ['selfmoord'],
    toestemDatum: '2026-06-14',
    kontakWaarskuwing: ['n nommer'],
    onveiligRedes: ['spam'],
    epos: 'iemand@voorbeeld.co.za',
  })
  const rou = JSON.stringify(m)
  for (const geheim of ['has-abc-123', 'ABCD-EFGH-IJKL', 'krisisWoorde', 'toestemDatum',
                        'kontakWaarskuwing', 'onveiligRedes', 'epos']) {
    is(`geen "${geheim}" op die muur`, rou.includes(geheim), false)
  }
  /* En die antwoord wat hy reeds geskryf het, bly WEL. */
  is('n bestaande antwoord bly', muurUit({ ...OK, antwoord: { tipe: 'teks', teks: 'x' } }).antwoord,
     { tipe: 'teks', teks: 'x' })
  is('geen antwoord gee null', muurUit(OK).antwoord, null)
}

console.log('\n── Die verslag ──\n')
{
  const inkomend = [
    OK,
    { ...OK, id: 'b2' },
    { ...OK, id: 'b3', muurId: 'm3' },
    { ...OK, id: 'b4', toestemmings: {} },
    { ...OK, id: 'b5', toestemmings: {} },
    { ...OK, id: 'b6', status: 'gevaar' },
    { ...OK, id: 'b7', spam: true },
  ]
  const v = verslag(beplan(inkomend, leeg))
  is('gepubliseer', v.gepubliseer, 2)
  is('reeds daar', v.reedsDaar, 1)
  is('uitgesluit', v.uitgesluit, 4)
  is('misluk', v.misluk, 0)
  /* "Uitgesluit: 4" op sy eie is geen inligting nie. */
  is('en die redes staan uitgeskryf', v.redes, {
    [REDES.geenToestemming]: 2,
    [REDES.gevaar]: 1,
    [REDES.spam]: 1,
  })
  is('n mislukking word deurgegee', verslag(beplan([], leeg), 3).misluk, 3)
}

console.log('\n── Die DROELOOP gee presies dieselfde getalle ──\n')
{
  /* Dit is die hele punt van 'n droëloop: dieselfde kode, net sonder die
     skryf. Sou hulle uitmekaar dryf, is die getalle wat Dewald sien voor hy
     druk, 'n raaiskoot. */
  const inkomend = [OK, { ...OK, id: 'b2' }, { ...OK, id: 'b3', toestemmings: {} }]
  is('twee lopies, een antwoord',
     verslag(beplan(inkomend, leeg)), verslag(beplan(inkomend, leeg)))
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
