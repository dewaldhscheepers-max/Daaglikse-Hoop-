/* ────────────────────────────────────────────────────────────
   Die e-poslys, EEN keer ontleed.

   Die paneel het "Stuur na alle 2731 inskrywers" gese en daarna "2131
   e-posse gestuur". Nie een van die twee was 'n leuen nie — hulle het net
   verskillende dinge getel:

     · email-status.js het ROU DOKUMENTE getel. Geen ontdubbeling nie.
     · send-bulk-email.js het .toLowerCase().trim() gedoen en toe
       [...new Set(...)] — dus die UNIEKE adresse.

   Dieselfde adres kan meer as een dokument he: dit word by die e-poslys
   gevoeg wanneer iemand 'n boek kry, wanneer iemand skenk, en wanneer
   iemand 'n vennoot word, en die dokument-ID is oor die jare op meer as een
   manier gebou. Ses honderd duplikate is dus heeltemal geloofwaardig.

   Hierdie lêer is nou die enigste plek waar daardie som gemaak word. Albei
   endpunte voer dit in, dus kan hulle nie weer verskil nie.

   Let wel: daar is TANS GEEN afmeld-veld in die data nie. Ons kan dus nie
   afgemelde mense tel nie, en ons maak nie of ons kan nie. Sien die nota
   onder by `afgemeld`.
   ──────────────────────────────────────────────────────────── */

// Doelbewus ruim. Ons wil net klaarblyklike gemors uithou, nie oor
// randgevalle in die RFC stry nie.
const ADRES = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ontleedLys(documents) {
  const rou = documents || []
  const gesien = new Set()
  const adresse = []

  let sonderVeld = 0     // dokument sonder 'n e-posveld hoegenaamd
  let ongeldig   = 0     // daar is iets, maar dit is nie 'n adres nie
  let duplikate  = 0     // dieselfde adres, meer as een dokument

  for (const d of rou) {
    const rouAdres = d && d.fields && d.fields.email && d.fields.email.stringValue
    if (!rouAdres) { sonderVeld++; continue }

    const adres = String(rouAdres).toLowerCase().trim()
    if (!ADRES.test(adres)) { ongeldig++; continue }
    if (gesien.has(adres)) { duplikate++; continue }

    gesien.add(adres)
    adresse.push(adres)
  }

  return {
    adresse,
    totaal:     rou.length,
    aktief:     adresse.length,
    duplikate,
    ongeldig,
    sonderVeld,
    /* Uitgesluit = alles wat in die totaal is maar nie gestuur gaan word nie.
       Dit is die getal wat die verskil verduidelik. */
    uitgesluit: rou.length - adresse.length,
    /* Daar is nog geen afmeld-meganisme in die data nie. Ons gee dit as null
       terug eerder as 0, sodat die paneel "onbekend" kan wys in plaas van
       "niemand het afgemeld nie" — wat 'n aanname sou wees. */
    afgemeld:   null,
  }
}

/* Haal die hele emailList, met blaaie. Gee die ontleding terug. */
async function haalEnOntleed(projectId, token) {
  const documents = []
  let pageToken = ''
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/emailList?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) break
    const data = await r.json()
    if (data.documents) documents.push(...data.documents)
    pageToken = data.nextPageToken || ''
  } while (pageToken)

  return ontleedLys(documents)
}

module.exports = { ontleedLys, haalEnOntleed, ADRES }
