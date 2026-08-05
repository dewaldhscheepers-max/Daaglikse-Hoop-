/* ────────────────────────────────────────────────────────────
   Die vers en die gebed wat iemand DADELIK kry nadat hy geskryf het.

   Hier staan net VERWYSINGS, nooit versteks nie. Die woorde kom uit die
   Getroue Afrikaanse Bybel wat reeds in die app is (`gabVers`). Twee redes,
   en albei is hard:

   1. 'n Afrikaanse vers wat 'n mens uit die geheue tik, is verkeerd. Dit is
      al 'n paar keer in hierdie projek gebeur.
   2. Die GAB is CC BY-NC-ND: die teks mag nooit verander word nie, ook nie
      per ongeluk deur oortik nie, en die erkenning moet saam wys.

   Is die GAB nie beskikbaar nie, val die skerm terug op die gebed alleen.
   'n Gebed is ons eie woorde en mag hier staan.

   DEWALD MOET DIE VERWYSINGS NAGAAN. Nie die teks nie — dit kom uit die
   Bybel — maar of dit die regte vers vir daardie mens is.
   ──────────────────────────────────────────────────────────── */

export const SORG_VERSE = {
  angs: {
    verwysing: { kode: 'PHP', hoofstuk: 4, vers: 6, wys: 'Filippense 4:6' },
    gebed:
      'Here, ek bring die bekommernis wat nie stil raak nie na U toe. Ek kan ' +
      'dit nie self neerlê nie. Neem dit vanaand uit my hande uit en gee my ' +
      'net genoeg vrede vir vannag.',
  },
  rou: {
    verwysing: { kode: 'PSA', hoofstuk: 34, vers: 18, wys: 'Psalm 34:18' },
    gebed:
      'Here, U weet wat ek verloor het. Ek vra nie dat U dit wegvat nie — ek ' +
      'vra dat U naby bly terwyl ek dit dra.',
  },
  huwelik: {
    verwysing: { kode: 'PSA', hoofstuk: 147, vers: 3, wys: 'Psalm 147:3' },
    gebed:
      'Here, dit is stil in my eie huis. Wees U in die stilte. Gee my woorde ' +
      'waar ek nie meer woorde het nie, en gee my geduld waar ek nie meer ' +
      'geduld het nie.',
  },
  vergifnis: {
    verwysing: { kode: 'EPH', hoofstuk: 4, vers: 32, wys: 'Efesiërs 4:32' },
    gebed:
      'Here, ek kan nog nie vergewe nie. Ek maak nie asof ek kan nie. Werk U ' +
      'aan my hart tot ek eendag kan, en hou my intussen sag.',
  },
  eensaam: {
    verwysing: { kode: 'DEU', hoofstuk: 31, vers: 6, wys: 'Deuteronomium 31:6' },
    gebed:
      'Here, dit voel of niemand my raaksien nie. U sien my. Laat my dit ' +
      'vandag glo, ook wanneer die huis leeg bly.',
  },
  kinders: {
    verwysing: { kode: 'ISA', hoofstuk: 54, vers: 13, wys: 'Jesaja 54:13' },
    gebed:
      'Here, ek kan nie my kind se pad vir hom loop nie. Ek gee hom vir U. ' +
      'Wees waar ek nie kan wees nie, en gee my rus in die nagte waar ek wag.',
  },
  twyfel: {
    verwysing: { kode: 'PSA', hoofstuk: 13, vers: 1, wys: 'Psalm 13:1' },
    gebed:
      'Here, dit voel of U ver is. Ek bly praat, ook wanneer dit lyk of ' +
      'niemand luister nie. Kom weer naby op U tyd.',
  },
  geld: {
    verwysing: { kode: 'MAT', hoofstuk: 6, vers: 26, wys: 'Matteus 6:26' },
    gebed:
      'Here, ek weet nie hoe die maand gaan werk nie. Ek vra vir vandag se ' +
      'brood en vir die krag om nie in die nag daaroor te lê nie.',
  },
  onseker: {
    verwysing: { kode: 'MAT', hoofstuk: 11, vers: 28, wys: 'Matteus 11:28' },
    gebed:
      'Here, alles het te veel geword en ek weet nie eens waar om te begin ' +
      'nie. Ek kom net so. Dra U wat ek nie meer kan optel nie.',
  },
  ander: {
    verwysing: { kode: 'PSA', hoofstuk: 121, vers: 1, wys: 'Psalm 121:1' },
    gebed:
      'Here, U weet wat ek nie in woorde kan sit nie. Kyk na daardie ding, ' +
      'ook wanneer ek dit nie kan verduidelik nie.',
  },
}

/* Daar moet ALTYD iets wees. 'n Onbekende onderwerp val hierop terug. */
export function versVir(onderwerp) {
  return SORG_VERSE[onderwerp] || SORG_VERSE.ander
}
