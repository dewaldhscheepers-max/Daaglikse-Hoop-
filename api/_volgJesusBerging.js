/* Hoe 'n VOLG JESUS-week in Firestore gestoor word.
 *
 * ── Waarom een JSON-string en nie dertig velde nie ──
 *
 * 'n Week het sowat dertig velde, en Firestore se REST-API wil elkeen
 * afsonderlik getik he (`stringValue`, `booleanValue`, `mapValue`...). Dertig
 * velde beteken dertig plekke waar 'n tikfout stilweg 'n veld laat wegval, en
 * 'n week wat 'n veld verloor het, is 'n week wat halfpad publiseer.
 *
 * Die hele week gaan dus as EEN JSON-string in `data`. Wat langs dit staan,
 * is net die drie dinge waarop ons moet kan sorteer of filter:
 *
 *   weeknommer    om 1..52 in volgorde te lys
 *   gepubliseer   om te weet wat lewendig mag wees
 *   opgedateer    om te sien wanneer laas geraak
 *
 * 'n Week is 'n paar kilogreep; Firestore hou tot sowat 'n miljoen greep in
 * een string. Daar is baie ruimte.
 *
 * Hierdie leer is suiwer sodat die kodering met plain node getoets kan word.
 */

const MAX_GREPE = 200 * 1024   /* 'n week wat groter is, is 'n fout, nie inhoud */

function dokNaam(weeknommer) {
  const n = Number(weeknommer)
  if (!Number.isInteger(n) || n < 1 || n > 52) return null
  /* Met 'n nul voor sorteer Firestore se dokumentname self reg: week-02 kom
     voor week-10. Sonder dit kom week-10 voor week-2. */
  return `week-${String(n).padStart(2, '0')}`
}

/* Van 'n week-voorwerp na Firestore se velde. */
function naFirestore(week, nou) {
  const n = Number(week.weeknommer)
  const rou = JSON.stringify(week)
  if (Buffer.byteLength(rou, 'utf8') > MAX_GREPE) {
    throw new Error('Die week is te groot om te stoor')
  }
  return {
    fields: {
      weeknommer:  { integerValue: String(n) },
      data:        { stringValue: rou },
      /* Dit is die belangrikste veld in hierdie leer. Dit begin ALTYD vals.
         Punt 3 se hele ontwerp hang daaraan dat niks in die app verskyn voor
         Dewald dit self aanskakel nie. */
      gepubliseer: { booleanValue: week.gepubliseer === true },
      opgedateer:  { timestampValue: nou },
    },
  }
}

/* En terug. 'n Dokument wat ons nie kan lees nie, gee null in plaas van 'n
   halwe week — 'n halwe week op 'n skerm lyk soos werk wat gedoen is. */
function uitFirestore(dok) {
  if (!dok || !dok.fields) return null
  const rou = dok.fields.data && dok.fields.data.stringValue
  if (typeof rou !== 'string') return null
  let week
  try { week = JSON.parse(rou) } catch { return null }
  if (!week || typeof week !== 'object') return null

  /* Die twee velde langs die JSON is die WAARHEID oor publikasie en tyd —
     nie wat toevallig in die JSON ingesluip het nie. */
  week.gepubliseer = dok.fields.gepubliseer
    ? dok.fields.gepubliseer.booleanValue === true
    : false
  week.opgedateer = (dok.fields.opgedateer && dok.fields.opgedateer.timestampValue) || null
  return week
}

/* Wat 'n LYS-oproep terugstuur. Die volle week is groot en die lys wys net
   die rugstring; stuur alles en 'n admin op 'n foon laai 52 keer te veel. */
function lysInskrywing(week) {
  if (!week) return null
  return {
    weeknommer:  week.weeknommer,
    titel:       week.titel || '',
    gepubliseer: week.gepubliseer === true,
    opgedateer:  week.opgedateer || null,
    hetVideo:    !!week.videoId,
    hersiening:  week.hersieningStatus || 'wag',
  }
}

module.exports = { dokNaam, naFirestore, uitFirestore, lysInskrywing, MAX_GREPE }
