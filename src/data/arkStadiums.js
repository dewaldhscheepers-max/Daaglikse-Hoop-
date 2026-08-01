/* ────────────────────────────────────────────────────────────
   Bou die Ark — stadiums, doelwitte en die Noag-verhaal.

   Doelwit-tipes:
     lyne     — voltooi n lyne in hierdie stadium
     punte    — verdien n punte in hierdie stadium
     multi    — maak n rye gelyk skoon met een stuk
     kombo    — n opeenvolgende stukke wat elkeen 'n lyn maak
     oorleef  — bly n sekondes aan die lewe

   Elke doelwit is haalbaar met gewone spel. Niks hang van geluk af nie:
   'multi' vra hoogstens drie rye, en 'kombo' hoogstens drie stukke.
   ──────────────────────────────────────────────────────────── */

export const STADIUMS = [
  { naam: 'Die Roeping',        doel: { tipe: 'lyne',    waarde: 4  }, dier: 'duif',
    vers: 'Noag was ’n regverdige man, opreg onder sy tydgenote. Noag het naby God geleef.', ref: 'Genesis 6:9' },

  { naam: 'Die Eerste Planke',  doel: { tipe: 'lyne',    waarde: 6  }, dier: 'skaap',
    vers: 'Maak vir jou ’n ark van goferhout. Maak dit met kamers en smeer dit binne en buite met pik.', ref: 'Genesis 6:14' },

  { naam: 'Die Rib van die Ark', doel: { tipe: 'punte',  waarde: 1500 }, dier: 'bok',
    vers: 'So moet jy dit maak: drie honderd el die lengte van die ark, vyftig el sy breedte en dertig el sy hoogte.', ref: 'Genesis 6:15' },

  { naam: 'Die Onderste Dek',   doel: { tipe: 'lyne',    waarde: 8  }, dier: 'olifant',
    vers: 'Maak vir die ark ’n onderste, ’n tweede en ’n derde verdieping.', ref: 'Genesis 6:16' },

  { naam: 'Die Middelste Dek',  doel: { tipe: 'multi',   waarde: 2  }, dier: 'kameel',
    vers: 'Noag het alles gedoen net soos God hom beveel het.', ref: 'Genesis 6:22' },

  { naam: 'Die Boonste Dek',    doel: { tipe: 'lyne',    waarde: 10 }, dier: 'perd',
    vers: 'Gaan in die ark, jy en jou hele huisgesin, want jy is die enigste opregte mens in hierdie geslag.', ref: 'Genesis 7:1' },

  { naam: 'Die Deur',           doel: { tipe: 'punte',   waarde: 3000 }, dier: 'leeu',
    vers: 'Van al die diere moet jy twee-twee na jou toe laat kom om hulle in die lewe te hou.', ref: 'Genesis 6:19' },

  { naam: 'Die Diere Kom',      doel: { tipe: 'lyne',    waarde: 12 }, dier: 'sebra',
    vers: 'Hulle het na Noag toe in die ark gegaan, twee-twee van alles wat lewe.', ref: 'Genesis 7:15' },

  { naam: 'Die Wolke Pak Saam', doel: { tipe: 'oorleef', waarde: 60 }, dier: 'giraf',
    vers: 'Die Here het toe die deur agter hom toegemaak.', ref: 'Genesis 7:16' },

  { naam: 'Die Reën Begin',     doel: { tipe: 'multi',   waarde: 3  }, dier: 'beer',
    vers: 'Dit het veertig dae lank op die aarde gereën.', ref: 'Genesis 7:12' },

  { naam: 'Die Water Styg',     doel: { tipe: 'lyne',    waarde: 15 }, dier: 'haas',
    vers: 'Die water het aangehou styg en die ark het bo-op die water gedryf.', ref: 'Genesis 7:18' },

  { naam: 'Die Ark Dryf',       doel: { tipe: 'kombo',   waarde: 3  }, dier: 'vos',
    vers: 'God het aan Noag gedink en aan al die diere by hom in die ark.', ref: 'Genesis 8:1' },
]

// Ná die verhaal loop dit voort: dieselfde soorte doelwitte, stadig groter.
const HERHAAL = ['lyne', 'punte', 'multi', 'oorleef', 'lyne', 'kombo']

export function stadiumBy(nr) {
  if (nr <= STADIUMS.length) return { ...STADIUMS[nr - 1], nr }

  const i     = (nr - STADIUMS.length - 1) % HERHAAL.length
  const rondte = Math.floor((nr - STADIUMS.length - 1) / HERHAAL.length)
  const tipe  = HERHAAL[i]

  // Waardes bly haalbaar: multi en kombo word nooit meer as drie nie.
  const waarde = {
    lyne:    12 + rondte * 3,
    punte:   3000 + rondte * 1200,
    multi:   Math.min(3, 2 + Math.floor(rondte / 2)),
    kombo:   Math.min(3, 2 + Math.floor(rondte / 2)),
    oorleef: 60 + rondte * 15,
  }[tipe]

  const dier = STADIUMS[(nr - 1) % STADIUMS.length].dier

  return {
    nr,
    naam: `Die Reis Gaan Voort ${rondte + 1}`,
    doel: { tipe, waarde },
    dier,
    vers: 'Solank die aarde bestaan, sal saaityd en oestyd, koue en hitte, somer en winter, dag en nag nie ophou nie.',
    ref: 'Genesis 8:22',
  }
}

export function doelTeks(doel) {
  switch (doel.tipe) {
    case 'lyne':    return `Voltooi ${doel.waarde} rye`
    case 'punte':   return `Verdien ${doel.waarde.toLocaleString('af')} punte`
    case 'multi':   return `Maak ${doel.waarde} rye gelyk skoon`
    case 'kombo':   return `${doel.waarde} stukke ná mekaar wat elk ’n ry maak`
    case 'oorleef': return `Hou ${doel.waarde} sekondes uit`
    default:        return ''
  }
}

// Vanaf watter stadium die weer inskop
export const WOLKE_VANAF = 9
export const REEN_VANAF  = 10
export const WATER_VANAF = 11
