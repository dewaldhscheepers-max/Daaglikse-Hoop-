/* ── VOLG JESUS · groepe: die reëls, suiwer ──
 *
 * Alles wat besluit of iets MAG, en alles wat 'n mens se invoer keur, staan
 * hier. Geen `window`, geen netwerk, geen Firestore — sodat elke reël met
 * plain node getoets kan word, en sodat die kliënt en die bediener presies
 * dieselfde antwoord gee.
 *
 * Daardie laaste punt is nie 'n netheidsding nie. Keur die kliënt 'n naam
 * anders as die bediener, dan wys die skerm 'n fout wat nie bestaan nie — of
 * erger, dit laat iets deur wat die bediener gaan weier nádat die mens dit
 * getik het.
 *
 * ── Waar die sekuriteit werklik staan ──
 *
 * NIE hier nie. Hierdie leer keur INVOER. Wie wat mag lees en skryf, staan in
 * `firestore.rules` en in `api/vj-groep.mjs`, en dit word deur Firestore self
 * afgedwing. 'n Kliënt wat hierdie funksies omseil, kom nêrens.
 */

/* ── Die groepkode ──
 *
 * Twee letters uit die groepnaam plus vier syfers lees maklik oor 'n
 * WhatsApp-boodskap: FJ4827. Die generering staan op die BEDIENER (dit het
 * ewekansigheid nodig en moet teen bestaandes gekeur word); hier staan net wat
 * 'n GELDIGE kode is, sodat die kliënt 'n tikfout kan vang voor hy vra.
 *
 * Ons aanvaar 'n mens se tikwerk mildelik — kleinletters, spasies, 'n
 * koppelteken — en normaliseer dit. Wat ons NIE doen nie, is raai. */
const KODE = /^[A-Z]{2}[0-9]{4}$/

export function keurGroepkode(rou) {
  const s = String(rou == null ? '' : rou)
    .toUpperCase()
    .replace(/[\s-]/g, '')
  return KODE.test(s) ? s : ''
}

/* Die letters waaruit 'n kode gebou word. `I`, `O`, `0` en `1` is uit: hulle
   word oor 'n foon verkeerd gelees en verkeerd getik. */
export const KODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

/* Bou 'n kode uit 'n naam en 'n ewekansige getal. Die ewekansigheid kom van
   BUITE af (die bediener gee dit), sodat hierdie funksie suiwer bly en die
   toets elke moontlike uitkoms kan afdwing. */
export function maakGroepkode(naam, ewekansig) {
  const letters = String(naam || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .filter(c => KODE_LETTERS.includes(c))

  const a = letters[0] || KODE_LETTERS[Math.floor(ewekansig[0] * KODE_LETTERS.length)]
  const b = letters[1] || KODE_LETTERS[Math.floor(ewekansig[1] * KODE_LETTERS.length)]
  const syfers = String(Math.floor(ewekansig[2] * 10000)).padStart(4, '0')
  return `${a}${b}${syfers}`
}

/* ── Beheerkarakters ──
 *
 * Skryf hulle UIT. `[ -<>&"]` lyk soos "hierdie vier karakters" en is 'n reeks
 * van spasie tot `<` — dit verwerp syfers en spasies. Sien CLAUDE.md. */
const BEHEER = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u2028\u2029\ufeff]/g

const skoon = rou => String(rou == null ? '' : rou).replace(BEHEER, '').trim()

/* ── Name ──
 *
 * 'n Vertoonnaam en 'n groepnaam. Albei is NET vir vertoon — hulle is nooit
 * identiteit nie (§15), en niks hang daaraan nie. Daarom is die reël eenvoudig:
 * dit moet iets wees, en dit moet nie 'n opstel wees nie. */
export function keurNaam(rou, { min = 2, maks = 40 } = {}) {
  const s = skoon(rou).replace(/\s+/g, ' ')
  if (s.length < min) return { ok: false, waarde: '', fout: `Dit moet minstens ${min} karakters wees.` }
  if (s.length > maks) return { ok: false, waarde: '', fout: `Hou dit korter as ${maks} karakters.` }
  return { ok: true, waarde: s, fout: '' }
}

export const keurVertoonnaam = rou => keurNaam(rou, { min: 2, maks: 30 })
export const keurGroepnaam   = rou => keurNaam(rou, { min: 3, maks: 50 })

/* Die gemeente is OPSIONEEL. 'n Leë waarde is nie 'n fout nie — dit is 'n
   antwoord. */
export function keurGemeente(rou) {
  const s = skoon(rou).replace(/\s+/g, ' ')
  if (!s) return { ok: true, waarde: '', fout: '' }
  if (s.length > 60) return { ok: false, waarde: '', fout: 'Hou dit korter as 60 karakters.' }
  return { ok: true, waarde: s, fout: '' }
}

/* ── 'n Boodskap ──
 *
 * §51: hoogstens 4 000 Unicode-karakters, en MOENIE STILWEG AFKAP NIE. Iemand
 * wat 'n lang gebed tik en dan 'n halwe sin gestuur sien, het nie 'n perk
 * ontmoet nie — hy het 'n fout ontmoet wat niks gesê het nie.
 *
 * Ons tel met `[...s]`, nie `s.length` nie: 'n emoji is een karakter vir 'n
 * mens en twee vir JavaScript, en 'n perk wat halfpad deur 'n emoji sny, is 'n
 * perk wat 'n stukkende karakter maak. */
export const MAKS_BOODSKAP = 4000

export function keurBoodskap(rou) {
  /* Beheerkarakters weg, maar NUWE REËLS bly — 'n mens breek sy gebed in
     paragrawe op. */
  const s = String(rou == null ? '' : rou)
    .replace(/\r\n?/g, '\n')
    .replace(BEHEER, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()

  if (!s) return { ok: false, waarde: '', fout: '' }   /* stil: die knoppie is net dood */

  const lengte = [...s].length
  if (lengte > MAKS_BOODSKAP) {
    return {
      ok: false, waarde: '',
      fout: `Dit is ${lengte - MAKS_BOODSKAP} karakters te lank. Stuur dit eerder in twee boodskappe.`,
      telling: lengte,
    }
  }
  return { ok: true, waarde: s, fout: '', telling: lengte }
}

/* ── Wie mag wat ──
 *
 * 'n Lid is 'n `{ rol, status }`. Die bediener en die reëls dwing dit af; dit
 * hier is sodat die SKERM nie 'n knoppie wys wat gaan misluk nie. */
export const isAktief = lid => !!lid && lid.status === 'aktief'
export const isFasiliteerder = lid => isAktief(lid) && lid.rol === 'fasiliteerder'
export const isEienaar = (groep, uid) => !!groep && !!uid && groep.eienaar === uid

export function magLees(lid) { return isAktief(lid) }
export function magStuur(lid) { return isAktief(lid) }

/* §20: by verstek mag ELKE lid nooi. Die eienaar kan dit toemaak. */
export function magNooi(groep, lid) {
  if (!isAktief(lid)) return false
  if (groep && groep.ledeMagNooi === false) return isFasiliteerder(lid)
  return true
}

/* 'n Deelnemer mag NET sy eie boodskap uitvee. 'n Fasiliteerder modereer sy
   eie groep. */
export function magUitvee(lid, boodskap) {
  if (!isAktief(lid) || !boodskap) return false
  if (boodskap.uid === lid.uid) return true
  return isFasiliteerder(lid)
}

/* Vasspeld en modereer is die fasiliteerder s'n. */
export function magVasspeld(lid) { return isFasiliteerder(lid) }

/* ── Iemand uit die GROEPCHAT haal ──
 *
 * Dewald: "if someone makes nonsense on the group chat the fasiliteerder must
 * be able to remove that person from the group's chat. They should still do the
 * program and go on like normal."
 *
 * Dit is nie dieselfde as uit die groep gooi nie. Die mens bly 'n lid, hou sy
 * week, sy antwoorde en sy plek — net die gesprek gaan toe.
 *
 * Drie dinge mag nie:
 *   · net 'n fasiliteerder mag dit doen;
 *   · nie op jou eie boodskap nie — daarvoor is daar "Verwyder";
 *   · nie op die EIENAAR nie. Sou 'n tweede fasiliteerder die eienaar kon
 *     stilmaak, kon hy die groep oorneem.
 *
 * Die skerm gebruik hierdie reel om die knoppie te wys. Wat dit WERKLIK keer,
 * is api/vj-groep.mjs en die reels in firestore.rules — 'n knoppie wat 'n mens
 * wegsteek, is nie 'n slot nie. */
export function magChatVerwyder(myLid, boodskap, groep) {
  if (!isFasiliteerder(myLid) || !boodskap || !boodskap.uid) return false
  if (boodskap.uid === myLid.uid) return false
  if (groep && groep.eienaar && boodskap.uid === groep.eienaar) return false
  return true
}

/* Of HIERDIE mens in die chat mag wees. Ontbreek die veld — soos by elke lid
   wat voor hierdie dag aangesluit het — is die antwoord ja. */
export function inChat(lid) {
  if (!isAktief(lid)) return false
  return lid.chatAf !== true
}

/* Die eienaar mag nie eenvoudig loop nie — 'n groep sonder eienaar is 'n groep
   wat niemand kan regmaak nie. §46. */
export function magVerlaat(groep, uid, aantalLede) {
  if (!isEienaar(groep, uid)) return { ok: true, fout: '' }
  if (aantalLede <= 1) return { ok: true, fout: '', argiveer: true }
  return {
    ok: false,
    fout: 'Jy is die eienaar van hierdie groep. Dra eers die groep aan iemand anders oor.',
  }
}

/* ── Die ongeleesde telling ──
 *
 * §39: dit moet OPVALLEND wees. En dit moet reg wees: 'n mens se eie boodskap
 * tel nooit as ongelees nie, en 'n uitgeveede boodskap ook nie.
 *
 * `laasGeleesId` is die LAASTE boodskap wat hy gesien het. Alles NÁ daardie een
 * is ongelees. Ken ons daardie id nie (nuwe lid, of die boodskap is uitgevee),
 * dan is alles wat nie syne is nie ongelees — dit is die veilige kant: eerder
 * 'n merkie te veel as 'n gesprek wat 'n mens mis. */
export function ongeleesTel(boodskappe, laasGeleesId, myUid) {
  if (!Array.isArray(boodskappe) || !boodskappe.length) return 0
  const skoonLys = boodskappe.filter(b => b && !b.uitgevee)
  const i = laasGeleesId ? skoonLys.findIndex(b => b.id === laasGeleesId) : -1
  const na = i === -1 ? skoonLys : skoonLys.slice(i + 1)
  return na.filter(b => b.uid !== myUid).length
}

/* Die woorde op die knoppie. §39 gee hulle presies. */
export function ongeleesWoorde(n) {
  if (!n || n < 1) return 'GROEP'
  if (n === 1) return '1 NUWE BOODSKAP'
  if (n > 99) return '99+ NUWE BOODSKAPPE'
  return `${n} NUWE BOODSKAPPE`
}

/* ── Die uitnodiging ──
 *
 * §21. Die kode staan in die teks EN in die skakel: 'n mens plak dit soms in 'n
 * plek waar skakels nie werk nie, en dan moet die kode steeds oorleef.
 *
 * ── Waarom daar TWEE paaie in staan ──
 *
 * Dewald het die eerste uitnodiging gestuur en dadelik gevra: "wat van die
 * mense wat reeds die app op hulle fone het ... nou maak dit die blaaier oop."
 *
 * Hy is reg, en dit is nie iets wat 'n mens met kode kan oplos nie. 'n Skakel
 * in WhatsApp gaan na die blaaier. Android kan 'n geïnstalleerde app die
 * skakel laat vang, maar dit hang af van die foon, van hoe die app geïnstalleer
 * is, en van 'n instelling wat die meeste mense nooit sien nie. Ons kan dit nie
 * belowe nie.
 *
 * Wat WEL altyd werk, is die kode. Dus staan albei hier: die skakel vir wie die
 * app nog nie het nie, en die kode vir wie hom wel het. Niemand kom by 'n
 * doodloopstraat uit nie. */
export function uitnodiging(groep, basis = 'https://dewaldscheepers.com') {
  const naam = String((groep && groep.naam) || '').trim() || 'ons groep'
  const kode = String((groep && groep.kode) || '').trim()
  const skakel = `${basis}/go/volg-jesus/join?kode=${encodeURIComponent(kode)}`
  return [
    'Ek nooi jou om VOLG JESUS saam met ons te doen.',
    '',
    `Ons groep: ${naam}`,
    `Groepkode: ${kode}`,
    '',
    'Ons stap saam om Jesus beter te leer ken en Hom in ons werklike lewe te volg.',
    '',
    `Het jy Daaglikse Hoop reeds op jou foon? Maak dit oop, druk VOLG JESUS, kies "Sluit aan by 'n groep" en tik ${kode}.`,
    '',
    `Het jy dit nog nie? Sluit hier aan: ${skakel}`,
  ].join('\n')
}

/* §55: die nudge hang af van hoe groot die groep is, en dit hou op sodra die
   groep lewe. Geen "top inviter", geen telling wat na 'n wedstryd lyk. */
export function nooiNudge(aantalLede) {
  const n = Number(aantalLede) || 0
  if (n <= 1) return 'Wie kan hierdie reis saam met jou begin?'
  if (n === 2) return 'Julle is reeds twee. Is daar nog iemand wat natuurlik saam met julle kan stap?'
  return ''
}
