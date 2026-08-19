/* Wat "begin heeltemal oor" mag uitvee — en veral wat dit NIE mag nie.
 *
 * Dewald wil die program toets "PRESIES hoe ander mense dit sien". Dit beteken
 * elke merkie wat VOLG JESUS op hierdie foon gelos het, moet weg. Maar 'n
 * knoppie wat te veel uitvee, vat 'n mens se Vredepad-naam of sy stemnota-plek
 * saam, en dan is die toets duurder as die fout.
 */
import { skoonmaakSleutels, skoonFoon, HOU, VOORVOEGSELS } from './volgJesusSkoon.js'

let reg = 0, val = 0
const is = (n, kry, wag) => {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL ${n} — kry ${JSON.stringify(kry)}, wag ${JSON.stringify(wag)}`) }
}

console.log('\n── Wat VOLG JESUS op n foon los ──\n')
{
  const alles = [
    'vj_modus', 'vj_my_week', 'vj_plek_w1', 'vj_klaar_w1',
    'vj_a_w1_dag1_getref', 'vj_a_w1_dag4_gebed',
    'vj_chat_privaat_gesien', 'vj_chat_wenk_gesien',
    'vj_nooi_kode', 'vj_nooi_week', 'vj_stem_w1',
    'vj_tel_oop', 'vj_tel_begin_1',
  ]
  is('elkeen van hulle gaan weg', skoonmaakSleutels(alles).length, alles.length)
}

console.log('\n── Wat dit NIE mag raak nie ──\n')
{
  const ander = [
    'likedNotes', 'vp_anon_uid', 'ark_naam', 'vf_tuinreis',
    'sorg_gesien', 'kg_gevra', 'installeer_gesien', 'gab_laas',
    'notesCache', 'theme',
  ]
  is('niks daarvan word aangeraak nie', skoonmaakSleutels(ander), [])
  is('die anonieme uid staan op die HOU-lys', HOU.includes('vp_anon_uid'), true)
  /* Dit is die belangrikste een: 'n mens se uid uitvee sou hom uit sy groep
     laat val op 'n manier wat hy nie self kan herstel nie. */
  is('en dit oorleef selfs al begin dit met vj_',
     skoonmaakSleutels(['vp_anon_uid']), [])
}

console.log('\n── Rommel laat niks omval nie ──\n')
is('geen lys nie', skoonmaakSleutels(null), [])
is('n string in plaas van n lys', skoonmaakSleutels('vj_modus'), [])
is('nulle en voorwerpe tussenin',
   skoonmaakSleutels(['vj_modus', null, 7, {}, undefined, 'vj_my_week']),
   ['vj_modus', 'vj_my_week'])
is('daar is presies EEN voorvoegsel, en dit is vj_', VOORVOEGSELS, ['vj_'])

console.log('\n── Die foon word werklik skoongemaak ──\n')
{
  function maakBerging(begin) {
    const w = { ...begin }
    return {
      get length() { return Object.keys(w).length },
      key: i => Object.keys(w)[i],
      getItem: k => (k in w ? w[k] : null),
      setItem: (k, v) => { w[k] = String(v) },
      removeItem: k => { delete w[k] },
      _w: w,
    }
  }
  const plaaslik = maakBerging({
    vj_modus: 'groep', vj_my_week: '2', vj_klaar_w1: '[1,2]',
    vj_a_w1_dag1: 'my woorde', likedNotes: '["n1"]', vp_anon_uid: 'abc',
  })
  const sessie = maakBerging({ vj_nooi_kode: 'DA4055', steun_versoek: '1' })

  const n = skoonFoon(plaaslik, sessie)
  is('vyf merkies is uitgevee', n, 5)
  is('VOLG JESUS is weg', Object.keys(plaaslik._w).sort(), ['likedNotes', 'vp_anon_uid'])
  is('sy antwoord is weg', plaaslik.getItem('vj_a_w1_dag1'), null)
  is('maar sy gunstelinge bly', plaaslik.getItem('likedNotes'), '["n1"]')
  is('en sy uid bly', plaaslik.getItem('vp_anon_uid'), 'abc')
  is('die sessie se uitnodiging is ook weg', sessie.getItem('vj_nooi_kode'), null)
  is('maar die steunblad se vlag bly', sessie.getItem('steun_versoek'), '1')

  /* Twee keer druk moet veilig wees. */
  is('n tweede keer vee niks meer nie', skoonFoon(plaaslik, sessie), 0)
}

console.log('\n── Sonder n blaaier val dit nie om nie ──\n')
{
  const stukkend = {
    get length() { throw new Error('nee') },
    key() { throw new Error('nee') },
    getItem() { throw new Error('nee') },
    removeItem() { throw new Error('nee') },
  }
  is('n stukkende berging gee net nul', skoonFoon(stukkend, stukkend), 0)
}

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
