/* Die VOLGORDE waarin "begin heeltemal oor" werk.
 *
 * Dit is die enigste deel wat werklik kan breek, en 'n blaaier is die verkeerde
 * gereedskap daarvoor: 'n mens sien nie 'n volgorde op 'n skermkiekie nie.
 *
 * Drie dinge moet in hierdie orde gebeur, en die orde is die omgekeerde van wat
 * 'n mens sou dink:
 *
 *   1. eers die ANDER lede uit — die eienaar mag nie loop terwyl daar lede
 *      binne is nie (§46), dus weier die bediener stap 2 anders;
 *   2. dan self loop, wat die groep argiveer omdat die eienaar laaste is;
 *   3. en HEEL LAASTE die foon skoonmaak. Andersom sou 'n mislukte oproep die
 *      foon skoon los met die groep nog lewendig — en dan sit daar 'n groep wat
 *      niemand meer kan bereik nie.
 */
import { beginOor } from './volgJesusTerugstel.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

function vals(opsies = {}) {
  const log = []
  const api = {
    myne: async () => {
      log.push('myne')
      return { ok: true, groepe: opsies.groepe || [] }
    },
    lede: async id => { log.push(`lede:${id}`); return opsies.lede || [] },
    verwyder: async (id, uid) => {
      log.push(`verwyder:${uid}`)
      return opsies.verwyderFout ? { ok: false, fout: opsies.verwyderFout } : { ok: true }
    },
    verlaat: async id => {
      log.push(`verlaat:${id}`)
      return opsies.verlaatFout ? { ok: false, fout: opsies.verlaatFout } : { ok: true }
    },
    skoon: () => { log.push('skoon'); return opsies.sleutels ?? 7 },
  }
  return { api, log }
}

const GROEP = { id: 'g1', naam: 'Daaglikse Hoop Groep', eienaar: 'uid-dewald', myRol: 'fasiliteerder' }
const LEDE = [
  { uid: 'uid-dewald', naam: 'Dewald' },
  { uid: 'uid-nadia', naam: 'Nadia' },
]

console.log('\n── Die fasiliteerder: lede eers, dan self, dan die foon ──\n')
{
  const { api, log } = vals({ groepe: [GROEP], lede: LEDE })
  const v = await beginOor({ api })
  is('presies hierdie volgorde', log,
     ['myne', 'lede:g1', 'verwyder:uid-nadia', 'verlaat:g1', 'skoon'])
  is('Nadia is afgehaal', v.lede, 1)
  is('die groep is verlaat', v.groepe, 1)
  is('en die foon is skoongemaak', v.sleutels, 7)
  is('geen foute', v.foute, [])
}

console.log('\n── Die EIENAAR word nooit self verwyder nie ──\n')
{
  /* Sou ons die eienaar deur `verwyder` stuur, gee die bediener 'n 409 en die
     hele terugstelling staan met 'n fout wat soos 'n breuk lyk. */
  const { api, log } = vals({ groepe: [GROEP], lede: LEDE })
  await beginOor({ api })
  is('net Nadia', log.filter(x => x.startsWith('verwyder:')), ['verwyder:uid-nadia'])
}

console.log('\n── n Deelnemer haal niemand af nie ──\n')
{
  const { api, log } = vals({
    groepe: [{ ...GROEP, myRol: 'deelnemer' }], lede: LEDE,
  })
  const v = await beginOor({ api })
  is('sy vra nie eens vir die lede nie', log, ['myne', 'verlaat:g1', 'skoon'])
  is('en sy verwyder niemand nie', v.lede, 0)
}

console.log('\n── Die foon word LAASTE skoongemaak ──\n')
{
  const { api, log } = vals({ groepe: [GROEP], lede: LEDE })
  await beginOor({ api })
  is('skoon is die heel laaste ding', log[log.length - 1], 'skoon')
}

console.log('\n── n Mislukte verlaat verloor nie die foon nie ──\n')
{
  /* Selfs as die netwerk omval, word die foon steeds skoongemaak — anders bly
     'n mens vasgevang met 'n halwe terugstelling en geen knoppie wat help. Maar
     dit moet SE wat verkeerd geloop het. */
  const { api, log } = vals({ groepe: [GROEP], lede: LEDE, verlaatFout: 'Kon nie.' })
  const v = await beginOor({ api })
  is('die foon is nog skoongemaak', log[log.length - 1], 'skoon')
  is('maar die groep tel nie as verlaat nie', v.groepe, 0)
  is('en dit se hoekom', v.foute, ['Kon nie.'])
}

console.log('\n── Geen groep: net die foon ──\n')
{
  const { api, log } = vals({ groepe: [] })
  const v = await beginOor({ api })
  is('niks word gebel nie', log, ['myne', 'skoon'])
  is('en dit werk steeds', v.sleutels, 7)
}

console.log('\n── Twee groepe word albei hanteer ──\n')
{
  const g2 = { id: 'g2', naam: 'Tweede', eienaar: 'uid-ander', myRol: 'deelnemer' }
  const { api, log } = vals({ groepe: [GROEP, g2], lede: LEDE })
  const v = await beginOor({ api })
  is('albei is verlaat', v.groepe, 2)
  is('en die foon net EEN keer skoongemaak', log.filter(x => x === 'skoon').length, 1)
}

console.log('\n── Die stap-boodskappe bereik die skerm ──\n')
{
  const woorde = []
  const { api } = vals({ groepe: [GROEP], lede: LEDE })
  await beginOor({ api, stap: w => woorde.push(w) })
  is('daar is iets om te wys', woorde.length >= 3, true)
  is('en die laaste se dat die foon skoongemaak word', /foon/.test(woorde[woorde.length - 1]), true)
}

console.log('\n── n Stukkende stap-funksie laat niks omval nie ──\n')
{
  const { api } = vals({ groepe: [GROEP], lede: LEDE })
  const v = await beginOor({ api, stap: () => { throw new Error('nee') } })
  is('dit loop klaar', v.groepe, 1)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
