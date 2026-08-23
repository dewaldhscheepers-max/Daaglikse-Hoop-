/* ────────────────────────────────────────────────────────────
   Wat teruggehou word — en wat NIE.

   Dit is die belangrikste onderskeid op die hele blad, en dit was tot nou
   verkeerd om.

   Tot nou is 'n storie oor selfmoordgedagtes TERUGGEHOU. Die bedoeling was
   goed: 'n mens moet eers daarna kyk. Die gevolg was dit nie. Iemand skryf
   die swaarste sin van sy lewe, druk stuur, en dan verskyn dit nêrens nie —
   terwyl elke ander mens se storie dadelik lewe. Die een wat die meeste
   nodig het om gehoor te word, is die een wat weggesteek word.

   Dewald, 23 Augustus 2026:

     "'n Persoon wat oor selfmoordgedagtes, depressie of ernstige emosionele
      nood praat, moet nie bloot as 'ongewenste inhoud' versteek word nie...
      Publiseer die storie indien dit andersins veilig is. Wys onmiddellik
      die bestaande Hulp nou-inligting. Merk dit dringend vir admin se
      aandag."

   Dit is die regte lyn, en dit loop nie waar dit voorheen geloop het nie:

     KRISIS      → dit gaan OP, Hulp nou wys DADELIK, en dit staan bo in die
                   admin met 'n dringende merk. Nood is nie oortreding nie.
     ONVEILIG    → dit gaan NIE op nie. Spam, dreigemente, teistering,
                   onwettige inhoud, seksuele inhoud, doxxing.

   Die twee mag nooit weer een ding word nie. 'n Mens wat sê hy wil nie meer
   lewe nie, en 'n mens wat iemand anders dreig, is nie dieselfde geval, en
   'n stelsel wat hulle in dieselfde hopie sit, behandel die eerste soos die
   tweede.

   Hierdie leer is SUIWER — teks in, 'n lys redes uit. Geen Firestore, geen
   `Date.now()`. Dit is die enigste manier om dertig gevalle in 'n
   millisekonde te toets.
   ──────────────────────────────────────────────────────────── */

/* Aksente weg, alles klein, en die res bly. Ons hou spasies, want die
   patrone hieronder gebruik woordgrense. */
function plat(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/* ── Die reëls ──

   Elke reël is 'n patroon plus 'n rede. Die rede is wat die admin sien, en
   dit is nie 'n etiket op die MENS nie — dit is 'n etiket op die teks.

   Die patrone is met opset NOU. 'n Wye patroon vang 'n vrou wat oor haar
   man se drank skryf, en dan is haar storie "teistering". Op hierdie blad is
   'n vals treffer duurder as 'n gemiste een: die gemeenskap en die
   Rapporteer-knoppie vang wat hier deurglip, maar niemand vang 'n vrou wie
   se storie stilweg weggesteek is nie. */
const REELS = [
  /* ── Dreigemente teen 'n ANDER mens ──
     Let op wat NIE hier is nie: "ek wil myself doodmaak". Dit is krisis, en
     krisis gaan op. Hierdie patrone vra almal 'n TEIKEN. */
  { rede: 'dreigement', pat: /\b(ek gaan (jou|hom|haar|hulle|julle)|ek maak (jou|hom|haar) (dood|vrek)|ek sal (jou|hom|haar) (vermoor|doodmaak|opfok|bliksem|moer)|i will kill (you|him|her|them)|i'?m going to hurt (you|him|her))\b/ },

  /* ── Teistering: 'n ander mens by die naam, met gif ──
     Dit vra 'n gerigte belediging ("jy is 'n ..."), nie 'n vloekwoord nie.
     Mense in nood vloek, en 'n blad wat hulle daarvoor stilmaak, is nie 'n
     veilige plek nie. */
  { rede: 'teistering', pat: /\b(jy is (n |'n |\u2019n )?(fokken |vervloekte )?(hoer|slet|poes|doos|teef|kak ?mens)|julle is (almal )?(hoere|poese|dose)|jy verdien (om te sterf|die kanker)|go kill yourself|kill yourself)\b/ },

  /* ── Seksuele inhoud ──
     Nie die WOORD "seks" nie — mense skryf oor hul huwelike, oor verkragting,
     oor pornografie waarmee hulle worstel, en al drie hoort hier. Wat nie
     hoort nie, is aanbod en werwing. */
  { rede: 'seksueel', pat: /\b(stuur (my )?(jou )?naaktefotos?|nudes?|sex ?chat|whatsapp my vir sex|escort|sugar ?(daddy|mommy)|onlyfans)\b/ },

  /* ── Onwettig ──
     Verkoop van dwelms, wapens, gesteelde goed. */
  { rede: 'onwettig', pat: /\b(te koop:? ?(tik|nyaope|dagga|mandrax|kokaine|heroine|vuurwapen|pistool)|ek verkoop (tik|nyaope|dagga|mandrax|kokaine|wapens?)|koop (tik|nyaope|mandrax) by my|vals (id|paspoort|dokumente) te koop)\b/ },

  /* ── Doxxing: IEMAND ANDERS se besonderhede ──
     'n Mens mag sy eie nommer deel (dit word elders gemerk en gestroop). Wat
     nie mag nie, is 'n ANDER mens se adres of nommer met sy naam by. */
  { rede: 'doxxing', pat: /\b(sy|haar|hulle) (adres|nommer|werk|van) is\b|\bhier is (sy|haar) (nommer|adres)\b|\bwoon by \d+ [A-Za-z]+ ?(straat|street|laan|avenue|rylaan)\b/ },

  /* ── Spam ──
     Werwing, beleggings, wenners. Dit is die enigste reël wat gereeld sal
     tref, en dit is die enigste een waar 'n vals treffer goedkoop is. */
  { rede: 'spam', pat: /\b(verdien r ?\d{3,}|maak r ?\d{3,} per (dag|week|maand)|forex|bitcoin ?(belegging|investment)|jy het gewen|whatsapp my op \+?\d|klik hier om|besigheids?geleentheid|word ryk)\b/ },
]

/* ── Loop die reëls ──

   Gee 'n LYS redes terug, nie 'n booleaan nie. Die admin moet kan sien
   WAAROM iets teruggehou is; "onveilig" op sy eie is geen inligting nie en
   dan moet hy elke keer die hele teks lees om te raai.

   Geen duplikate: twee spam-patrone in een boodskap is steeds een rede. */
export function onveiligTreffers(teks) {
  const t = plat(teks)
  if (!t.trim()) return []
  const uit = []
  for (const r of REELS) {
    if (r.pat.test(t) && !uit.includes(r.rede)) uit.push(r.rede)
  }
  return uit
}

export function isOnveilig(teks) {
  return onveiligTreffers(teks).length > 0
}

/* ── Die besluit, op EEN plek ──

   Hier kom die krisis-treffers en die onveilig-treffers bymekaar, en hier
   staan die reël wat nie weer mag omdraai nie:

     ONVEILIG hou terug. KRISIS hou NIE terug nie.

   `dringend` is apart van `wys`. 'n Krisis-storie is tegelyk OP DIE MUUR en
   BO IN DIE ADMIN — dit is nie 'n teenstelling nie, dit is die hele punt.

   `hulpNou` is wat die skerm doen: die noodnommers dadelik wys. Dit hang aan
   die KRISIS, nie aan die publikasie nie, want 'n mens in nood moet daardie
   nommers sien of sy storie nou lewe of nie. */
export function besluit(teks, { krisis = [] } = {}) {
  const onveilig = onveiligTreffers(teks)
  const isKrisis = (krisis || []).length > 0
  return {
    /* Gaan dit op die muur? */
    wys: onveilig.length === 0,
    onveilig,
    krisis: isKrisis,
    /* Wys die skerm die noodnommers DADELIK? */
    hulpNou: isKrisis,
    /* Staan dit bo in die admin, met 'n rooi reël? */
    dringend: isKrisis,
    /* Wat in die admin se hopie staan.
         'gevaar'   — 'n mens moet NOU kyk (krisis, ook al is dit op die muur)
         'onveilig' — dit is teruggehou en 'n mens moet besluit
         'outo'     — dit lewe, niks te doen nie */
    status: onveilig.length ? 'onveilig' : (isKrisis ? 'gevaar' : 'outo'),
    /* 'n Krisisstorie wat WEL op die muur is, dra die sensitief-vlag: die
       opmerkings kry hul riglyn en die kaart lees anders. */
    sensitief: isKrisis,
  }
}
