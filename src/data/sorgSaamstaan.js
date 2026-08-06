/* ────────────────────────────────────────────────────────────
   Saamstaan — hoe die gemeenskap onder 'n storie reageer.

   Dit was een knoppie en een telling, en op 'n jong muur het daardie telling
   "1 mens dra dit saam met jou" gesê. Vir 'n vrou wie se ma sterwend is, is
   dit erger as niks: dit sê een mens gee om.

   Twee goed vervang dit.

   ── Vier reaksies ──

   Nie ses nie. Dit klink na 'n detail, maar dit is die hele ontwerp: op 'n
   muur waar 'n plasing vyf drukke kry, deel ses knoppies daardie vyf in ses
   hopies en dan wys elke knoppie 'n nul. Ses nulle onder iemand se storie is
   erger as een 1.

   Daarom, soos Facebook dit doen: 'n knoppie wat NIEMAND gedruk het nie, wys
   nie 'n telling nie. Wat 'n mens sien, is die reaksies wat GESTUUR is, en
   een groot totaal daarby. Die knoppies self bly staan om te druk.

   Een reaksie per toestel per plasing. Dan is die totaal letterlik die getal
   MENSE, en "24 mense dra dit saam met jou" is waar.

   Die vier dek vier verskillende dade, en nie een kan verkeerd land op 'n
   storie oor 'n sterwende ma nie: gebed, gehoor word, omhelsing, krag.

   ── Klaargemaakte woorde ──

   'n Reaksie is 'n syfer. Woorde is 'n mens. Maar vrye teks onder 'n storie
   oor selfmoordgedagtes of 'n weiering om hospitaal toe te gaan, is 'n risiko
   wat geen filter vang nie — verkeerde raad kom in mooi Afrikaans.

   Die uitweg: sinne wat DEWALD geskryf het, wat iemand met een druk stuur.
   Nul modereringsrisiko, want hy het dit self geskryf. Dit verskyn dadelik,
   en van die eerste dag af staan daar regte menslike sinne onder 'n storie.

   Vrye teks kom daarby, maar met reels — sien `magVryeTeks`.

   Hierdie lêer is SUIWER: geen window, geen fetch, geen Date.now() in die
   besluite. Die bediener en die skerm gebruik dieselfde reels, en die toetse
   loop met plain `node`.
   ──────────────────────────────────────────────────────────── */

export const REAKSIES = [
  { sleutel: 'bid',  teken: '🙏', naam: 'Ek bid saam' },
  { sleutel: 'hoor', teken: '❤️', naam: 'Ek hoor jou' },
  { sleutel: 'vas',  teken: '🤗', naam: 'Ek hou jou vas' },
  { sleutel: 'moed', teken: '💪', naam: 'Hou moed' },
]

const REAKSIE_OP_SLEUTEL = new Map(REAKSIES.map(r => [r.sleutel, r]))

export function keurReaksie(s) {
  return REAKSIE_OP_SLEUTEL.has(s) ? s : ''
}

export function reaksieBy(s) {
  return REAKSIE_OP_SLEUTEL.get(s) || null
}

/* ── Wat onder 'n storie gewys word ──

   Gee die reaksies terug wat WERKLIK gestuur is, in die vaste volgorde van
   REAKSIES, plus die totaal. 'n Nul kom nooit deur nie.

   Die ou `saam`-telling tel saam in die totaal. Niemand se telling word
   teruggestel nie: wat mense reeds gedra het, bly gedra. */
export function wysReaksies(tellings, ouSaam = 0) {
  const t = tellings && typeof tellings === 'object' ? tellings : {}
  const gewys = REAKSIES
    .map(r => ({ ...r, tel: Math.max(0, Number(t[r.sleutel]) || 0) }))
    .filter(r => r.tel > 0)
  const totaal = gewys.reduce((n, r) => n + r.tel, 0) + Math.max(0, Number(ouSaam) || 0)
  return { gewys, totaal }
}

/* ── Dewald se klaargemaakte woorde ──

   Kort, sag, en nie een is raad nie. Dit is die toets wat elkeen moet slaag:
   sou hierdie sin verkeerd kon land op die swaarste storie op die muur? 'n
   Sin soos "Alles gebeur vir 'n rede" sou — daarom is dit nie hier nie. */
export const KLAAR_WOORDE = [
  { sleutel: 'saam',   teks: 'Ek bid vandag saam met jou.' },
  { sleutel: 'alleen', teks: 'Jy is nie alleen nie.' },
  { sleutel: 'ook',    teks: 'Ek het ook hierdeur gegaan.' },
  { sleutel: 'krag',   teks: 'Mag God jou krag gee vir vandag.' },
  { sleutel: 'dink',   teks: 'Ek dink aan jou.' },
]

const WOORD_OP_SLEUTEL = new Map(KLAAR_WOORDE.map(w => [w.sleutel, w]))

/* Die kliënt stuur 'n SLEUTEL, nooit die teks nie. Stuur hy die teks, kan
   iemand met 'n gereedskapstuk enigiets in daardie veld sit en dit sou as 'n
   "klaargemaakte" woord verskyn — sonder hersiening, want klaargemaakte
   woorde word mos vertrou. Die bediener slaan die sleutel op en soek die
   teks self hier op. */
export function klaarWoordTeks(sleutel) {
  const w = WOORD_OP_SLEUTEL.get(sleutel)
  return w ? w.teks : ''
}

export const MAKS_WOORD = 200

/* ── Wat 'n eie woord mag wees ──

   Kort, en sonder die goed wat 'n openbare blad met anonieme mense in die
   moeilikheid bring: kontakbesonderhede, skakels, en beheerkarakters.

   Die karakterreeks hier is met opset uitgeskryf. `[ -<>&"]` LYK soos vier
   karakters maar is 'n REEKS van spasie (0x20) tot `<` (0x3C) — dit verwerp
   syfers en spasies. Daardie fout is in hierdie kodebasis al twee keer
   gemaak; sien CLAUDE.md. */
export function skoonWoord(t) {
  return String(t || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAKS_WOORD)
}

/* Redes waarom 'n eie woord nie dadelik mag wys nie.

   Dit KEER niks — Dewald besluit. Dit sorteer net: wat hier tref, wag vir sy
   oog; die res gaan deur. */
const SKAKEL = /(https?:\/\/|www\.|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)/i
const NOMMER = /(\+?\d[\d\s().-]{7,}\d)/
const SOSIAAL = /\b(whatsapp|facebook|instagram|tiktok|telegram|snapchat|dm\s+my|inbox\s+my)\b/i

export function woordVlae(teks) {
  const t = String(teks || '')
  const vlae = []
  if (SKAKEL.test(t)) vlae.push('n skakel of e-posadres')
  if (NOMMER.test(t)) vlae.push('n telefoonnommer')
  if (SOSIAAL.test(t)) vlae.push('n versoek om buite die app kontak te maak')
  return vlae
}

/* ── Mag hierdie mens vrye teks skryf, en mag dit dadelik wys? ──

   Drie reels, en die eerste is die belangrikste.

   1. Op 'n SENSITIEWE plasing — een waar die krisiswoorde getref het — is
      daar GEEN vrye teks nie. Net Dewald se klaargemaakte woorde. 'n Storie
      oor iemand wat weier om hospitaal toe te gaan, mag nie 'n vreemdeling
      se "hospitale het my ma doodgemaak" onder hom kry nie. Geen filter vang
      daardie sin nie, want daar is niks verkeerd met die WOORDE nie.

   2. Al die res WYS DADELIK. Alles. Altyd. Vir almal.

   Daar was twee hekke voor hierdie een, en albei is weg omdat albei
   dieselfde ding gedoen het: iemand se woorde laat verdwyn sonder dat hy
   weet hoekom.

   Die eerste was 'verdien vertroue': die eerste woord van elke toestel wag.
   Die meeste mense skryf een keer, dus het die meeste mense hul eie woord
   nooit gesien nie. Dit lyk soos 'n app wat stukkend is.

   Die tweede was 'n outomatiese hek op nommers en skakels. Dit vang party
   slegte goed, en dit vang ook 'n vrou wat 'n Bybelvers verkeerd tik. 'n
   Gesprek waar 'n mens nie weet of jou woorde deurgekom het nie, is nie 'n
   gesprek nie.

   Die vlae BESTAAN nog — hulle keer net niks meer nie. Wat 'n nommer of 'n
   skakel bevat, wys saam met die res EN verskyn in Dewald se hopie met die
   rede daarby, sodat hy dit kan sien sonder dat iemand se woorde intussen
   in 'n laai gele het.

   Wat oorbly om skade te keer, en dit is genoeg:
     · 'n krisisplasing laat glad geen vrye teks toe nie — daar is net
       Dewald se klaargemaakte sinne;
     · Rapporteer haal 'n woord met EEN druk dadelik af;
     · alles wat gerapporteer of gevlag is, land in die Woorde-hopie. */
export function magVryeTeks({ sensitief }) {
  return !sensitief
}

export function woordStatus({ teks, sensitief }) {
  if (sensitief) return { status: 'weier', rede: 'sensitiewe plasing' }
  const skoon = skoonWoord(teks)
  if (skoon.length < 2) return { status: 'weier', rede: 'te kort' }
  /* Die vlae keer niks. Hulle sê net vir Dewald waarna om te kyk. */
  const vlae = woordVlae(skoon)
  return {
    status: 'wys',
    teks: skoon,
    ...(vlae.length ? { vlae, rede: vlae.join(' en ') } : {}),
  }
}

/* ── Hoeveel mense het gelees ──

   'n Klein getal is erger as geen getal nie. "3 mense het dit gelees" laat
   'n storie eensamer lyk as stilte. Onder die vloer wys ons niks — nie 'n
   nul nie, niks. */
export const LEES_VLOER = 10

export function wysGelees(n) {
  const g = Math.max(0, Number(n) || 0)
  return g >= LEES_VLOER ? g : 0
}
