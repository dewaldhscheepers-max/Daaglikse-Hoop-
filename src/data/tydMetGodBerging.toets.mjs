/* Die onsuiwer helfte van Vandag se Tyd met God — die deel wat aan die foon
 * raak. `tydMetGod.toets.mjs` toets die REELS; hierdie een toets die skryf.
 *
 * Dit bestaan vir een sin van Dewald: "make sure that when someone pray on
 * bidsaam that it counts with the number on the last skerm."
 *
 * Loop met:  node src/data/tydMetGodBerging.toets.mjs
 */

/* 'n Foon se localStorage, in 'n voorwerp. Dieselfde vorm as die egte een,
   insluitend die feit dat alles 'n string is. */
function maakBerging(begin = {}) {
  const data = { ...begin }
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v) },
    removeItem: k => { delete data[k] },
    _data: data,
  }
}

const seine = []
globalThis.window = { dispatchEvent: e => seine.push(e && e.type) }
globalThis.CustomEvent = class { constructor(t) { this.type = t } }
globalThis.localStorage = maakBerging()

const { leesStaat, skryfStaat, merkGebidNou, merkGeluisterNou } =
  await import('./tydMetGodBerging.js')
const { SLEUTEL, leegStaat, dagSleutel } = await import('./tydMetGod.js')

let reg = 0, val = 0
function is(naam, kry, wag) {
  const ok = JSON.stringify(kry) === JSON.stringify(wag)
  if (ok) { reg++; console.log(`  ok   ${naam}`) }
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}

function skoon(begin = {}) {
  globalThis.localStorage = maakBerging(begin)
  seine.length = 0
}

console.log("\n── 'n Gebed op die muur tel in DIESELFDE getal ──")
/* Dit is die hele punt. Die muur se knoppie en die vloei se knoppie is twee
   skerms, maar een gebed en een getal. */
{
  skoon()
  is('daar is niks om mee te begin nie', leesStaat().gebidMaand, 0)

  const na1 = merkGebidNou()
  is('een gebed tel een, vir die maand', na1.gebidMaand, 1)
  is('en vir vandag',                    na1.gebid, 1)

  const na2 = merkGebidNou()
  is('twee gebede tel twee', na2.gebidMaand, 2)

  /* En dit LE op die foon — nie net in die geheue nie. Sonder hierdie skryf
     sou die getal verdwyn sodra 'n mens die blad verlaat, en die klaar-skerm
     sou nul wys vir iemand wat pas vir twee mense gebid het. */
  is('dit staan in localStorage', leesStaat().gebidMaand, 2)
  is('en onder die regte sleutel', JSON.parse(localStorage.getItem(SLEUTEL)).gebidMaand, 2)
}

console.log('\n── Die kaart op Luister hoor daarvan ──')
/* `storage` vuur NIE in die oortjie wat geskryf het nie. Sonder hierdie sein
   wys die kaart nog die ou toestand nadat 'n mens op die muur gebid het. */
{
  skoon()
  merkGebidNou()
  is("een `tmg-verander`-sein", seine, ['tmg-verander'])
}

console.log('\n── Dit mag NOOIT gooi nie ──')
/* Dit sit binne-in die muur se knoppie. 'n Uitsondering daar sou 'n GEBED kos
   vir 'n getal wat niks kos nie. 'n Blaaier in privaat modus, 'n vol skyf, 'n
   toestel wat berging weier — al drie gooi by `setItem`. */
{
  skoon()
  globalThis.localStorage = {
    getItem: () => { throw new Error('geen berging') },
    setItem: () => { throw new Error('geen berging') },
    removeItem: () => {},
  }
  let gegooi = false
  let uit
  try { uit = merkGebidNou() } catch { gegooi = true }
  is('berging wat gooi, gooi nie deur nie', gegooi, false)
  is('en die skerm kry steeds \'n getal',   uit && uit.gebidMaand, 1)
}
{
  /* Stukkende JSON. Die `catch` in `leesStaat` moet DEUR `rolDag` gaan —
     `leegStaat()` het 'n leë `dag` en `maand`, en 'n gebed wat daarop geskryf
     word, word deur die volgende lees uitgewis. Dit was 'n regte fout: 'n
     gebed op die muur was weg voor die klaar-skerm dit kon wys. */
  skoon({ [SLEUTEL]: 'dit is nie JSON nie' })
  let gegooi = false
  try { merkGebidNou() } catch { gegooi = true }
  is('stukkende JSON gooi ook nie', gegooi, false)
  is('en die gebed OORLEEF die volgende lees', leesStaat().gebidMaand, 1)
}

console.log('\n── Die dag rol, die maand nie ──')
/* Dieselfde reël as `rolDag`: 'n nuwe dag maak vandag skoon en los die maand.
   Wie gister vir drie mense gebid het, moet vandag steeds "hierdie maand" sien
   — dit is die enigste rede waarom daardie reël op die skerm staan. */
{
  const gister = { ...leegStaat(), dag: '2020-01-01', maand: '2020-01', gebid: 3, gebidMaand: 3 }
  skoon({ [SLEUTEL]: JSON.stringify(gister) })
  const nou = leesStaat()
  is('vandag begin op nul',   nou.gebid, 0)
  is('die maand hou nie vas nie (ander maand)', nou.gebidMaand, 0)
}
{
  /* Dieselfde maand, ander dag. */
  const maand = dagSleutel().slice(0, 7)
  const vroeer = { ...leegStaat(), dag: '1999-01-01', maand, gebid: 3, gebidMaand: 3 }
  skoon({ [SLEUTEL]: JSON.stringify(vroeer) })
  const nou = leesStaat()
  is('vandag begin op nul',        nou.gebid, 0)
  is('maar die maand hou vas',     nou.gebidMaand, 3)
  is("en 'n nuwe gebed tel daarby", merkGebidNou().gebidMaand, 4)
}

console.log('\n── Die ander skrywer raak nie hieraan nie ──')
/* `merkGeluisterNou` en `merkGebidNou` skryf dieselfde voorwerp. Een mag nie
   die ander se werk uitvee nie — hulle loop op dieselfde dag, minute uitmekaar. */
{
  skoon()
  merkGebidNou()
  merkGeluisterNou('n1')
  const s = leesStaat()
  is('die gebed oorleef die luister-merk', s.gebidMaand, 1)
  is('en die luister-merk is daar',        s.geluister, 'n1')
  merkGebidNou()
  is('en andersom ook', leesStaat().geluister, 'n1')
  is('met die getal op twee', leesStaat().gebidMaand, 2)
}

console.log(`\n${reg} reg, ${val} vals`)
process.exit(val ? 1 : 0)
