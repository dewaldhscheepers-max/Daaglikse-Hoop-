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

  /* ── Groep 2: Die diere van die veld (13–24) ── */

  { naam: 'Die Osse Kom',       doel: { tipe: 'lyne',    waarde: 10 }, dier: 'os',
    vers: 'As daar nie osse is nie, is die voerkrip leeg; met net een goeie os bring jy ’n groot oes in.', ref: 'Spreuke 14:4' },

  { naam: 'Die Koeie Wei',     doel: { tipe: 'punte',   waarde: 4000 }, dier: 'koei',
    vers: 'Uit die rivier kom daar toe sewe mooi vet koeie uit en hulle gaan wei in die vleigras.', ref: 'Genesis 41:2' },

  { naam: 'Die Donkie Praat',   doel: { tipe: 'lyne',    waarde: 12 }, dier: 'donkie',
    vers: 'Die Here het die donkie laat praat, en sy het vir Bileam gesê: Wat het ek jou aangedoen?', ref: 'Numeri 22:28' },

  { naam: 'Die Muil van die Koning', doel: { tipe: 'multi', waarde: 2 }, dier: 'muil',
    vers: 'Laat Salomo op my eie muil ry en bring hom af na Gihon toe.', ref: '1 Konings 1:33' },

  { naam: 'Die Ram in die Bos', doel: { tipe: 'lyne',    waarde: 14 }, dier: 'ram',
    vers: 'Abraham het opgekyk en agter hom ’n ram gesien wat met sy horings in die bos vasgevang was.', ref: 'Genesis 22:13' },

  { naam: 'Die Vetgemaakte Kalf', doel: { tipe: 'punte', waarde: 5500 }, dier: 'kalf',
    vers: 'Bring die vetgemaakte kalf, slag hom, en laat ons eet en feesvier.', ref: 'Lukas 15:23' },

  { naam: 'Die Varke van die Vreemde', doel: { tipe: 'lyne', waarde: 16 }, dier: 'vark',
    vers: 'Hy het hom in diens gestel by een van die burgers van daardie land, wat hom uitgestuur het om varke op te pas.', ref: 'Lukas 15:15' },

  { naam: 'Die Honde onder die Tafel', doel: { tipe: 'kombo', waarde: 3 }, dier: 'hond',
    vers: 'Ja, Here, maar die hondjies eet tog van die krummels wat van hulle base se tafel afval.', ref: 'Matteus 15:27' },

  { naam: 'Die Kraai Vlieg Uit', doel: { tipe: 'lyne',   waarde: 18 }, dier: 'kraai',
    vers: 'Hy het ’n kraai uitgestuur, en die het heen en weer gevlieg totdat die water op die aarde opgedroog het.', ref: 'Genesis 8:7' },

  { naam: 'Op Arendsvlerke',    doel: { tipe: 'oorleef', waarde: 75 }, dier: 'arend',
    vers: 'Julle het self gesien wat Ek aan Egipte gedoen het, en hoe Ek julle op arendsvlerke gedra en na My toe gebring het.', ref: 'Eksodus 19:4' },

  { naam: 'Nie Een Mossie Nie', doel: { tipe: 'multi',   waarde: 3 }, dier: 'mossie',
    vers: 'Word twee mossies nie vir ’n sent verkoop nie? En nie een van hulle sal op die grond val sonder julle Vader nie.', ref: 'Matteus 10:29' },

  { naam: 'Die Volstruis se Vlerk', doel: { tipe: 'lyne', waarde: 20 }, dier: 'volstruis',
    vers: 'Die vlerke van die volstruis klap vrolik net soos dié van die ooievaar en die valk.', ref: 'Job 39:16' },

  /* ── Groep 3: Die wilde diere (25–36) ── */

  { naam: 'Die Wolf en die Lam', doel: { tipe: 'lyne',   waarde: 22 }, dier: 'wolf',
    vers: 'Die wolf sal by die lam bly kuier, en die luiperd by die bokkie gaan lê.', ref: 'Jesaja 11:6' },

  { naam: 'Die Luiperd se Vlekke', doel: { tipe: 'punte', waarde: 8000 }, dier: 'luiperd',
    vers: 'Kan ’n Kussiet sy vel verander, of ’n luiperd sy vlekke?', ref: 'Jeremia 13:23' },

  { naam: 'Die Slang in die Tuin', doel: { tipe: 'lyne', waarde: 24 }, dier: 'slang',
    vers: 'Die slang was listiger as al die wilde diere wat die Here God gemaak het.', ref: 'Genesis 3:1' },

  { naam: 'Leviatan',           doel: { tipe: 'oorleef', waarde: 90 }, dier: 'krokodil',
    vers: 'Kan jy ’n krokodil met ’n hoek vang of hom ’n tou in die bek sit?', ref: 'Job 40:20' },

  { naam: 'Die Akkedis',        doel: { tipe: 'lyne',    waarde: 26 }, dier: 'akkedis',
    vers: 'Die volgende diertjies wat volop voorkom in die veld, moet julle as onrein beskou: molle, muise en al die akkedissoorte.', ref: 'Levitikus 11:29' },

  { naam: 'Die Muis',           doel: { tipe: 'kombo',   waarde: 3 }, dier: 'muis',
    vers: 'Die goue afbeeldings van die muise was vir die versterkte en onversterkte stede van die vyf Filistynse regeerders.', ref: '1 Samuel 6:18' },

  { naam: 'Die Sprinkane Kom',  doel: { tipe: 'lyne',    waarde: 28 }, dier: 'sprinkaan',
    vers: 'Die sprinkane het oor die hele Egipte getrek en in die hele gebied van Egipte gaan sit.', ref: 'Eksodus 10:14' },

  { naam: 'Die Kwartels in die Aand', doel: { tipe: 'punte', waarde: 11000 }, dier: 'kwartel',
    vers: 'Daardie aand het kwartels opgekom en die kamp oordek.', ref: 'Eksodus 16:13' },

  { naam: 'Die Groot Vis',      doel: { tipe: 'lyne',    waarde: 30 }, dier: 'vis',
    vers: 'Die Here het ’n groot vis beskik om Jona in te sluk, en Jona was drie dae en drie nagte in die maag van die vis.', ref: 'Jona 1:17' },

  { naam: 'Die Ape van Tarsis', doel: { tipe: 'multi',   waarde: 3 }, dier: 'aap',
    vers: 'Elke drie jaar het die skepe van Tarsis goud, silwer, ivoor, ape en poue gebring.', ref: '1 Konings 10:22' },

  { naam: 'Die Seekoei', doel: { tipe: 'lyne',   waarde: 32 }, dier: 'seekoei',
    vers: 'Kyk die seekoei: Ek het hom gemaak toe Ek jou gemaak het, hy vreet gras soos ’n bees.', ref: 'Job 40:10' },

  { naam: 'Die Jakkalse',       doel: { tipe: 'punte',   waarde: 15000 }, dier: 'jakkals',
    vers: 'Hy het toe drie honderd jakkalse gaan vang en hulle sterte twee-twee aan mekaar vasgemaak.', ref: 'Rigters 15:4' },

  /* ── Die laaste stadium: die gesin gaan in ── */

  { naam: 'Noag en Sy Gesin',   doel: { tipe: 'oorleef', waarde: 120 }, dier: 'noag',
    vers: 'Op daardie selfde dag het Noag in die ark gegaan, en Sem, Gam en Jafet, die seuns van Noag, en Noag se vrou en die drie vroue van sy seuns saam met hulle.', ref: 'Genesis 7:13' },
]

/* Die ark self word in die eerste twaalf stadiums gebou. Daarna kom die
   diere aan boord, en heel laaste Noag en sy gesin. Die tekening van die
   ark vul dus oor die eerste twaalf en bly daarna vol. */
export const ARK_KLAAR = 12

/* Die drie groepe plus die gesin. Die versamelskerm wys hulle so, want
   sewe-en-dertig diere in een lang ry lees soos 'n lys en nie soos 'n ark
   wat vol word nie. */
export const GROEPE = [
  { naam: 'Die Ark',                vanaf: 1,  tot: 12 },
  { naam: 'Die Diere van die Veld', vanaf: 13, tot: 24 },
  { naam: 'Die Wilde Diere',        vanaf: 25, tot: 36 },
  { naam: 'Die Gesin',              vanaf: 37, tot: 37 },
]

// Elke stadium se dier, in volgorde. Die spel se enigste bron hiervoor.
export const ALLE_DIERE = STADIUMS.map(s => s.dier)

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
