/* ────────────────────────────────────────────────────────────
   Die dag-slot — een oggend-kennisgewing per dag, nooit twee.

   ── Waarom dit bestaan ──

   Die oggend-kennisgewing is jare lank deur 'n diens BUITE hierdie projek
   afgeskop. Niemand weet meer watter een nie. Ons trek dit nou as 'n gewone
   Vercel-cron in die projek in — maar as daardie ou diens nog leef en nog
   deurkom, dan roep TWEE dinge dieselfde funksie om 06:30, en dan kry ses
   duisend mense twee kennisgewings met dieselfde boodskap.

   Dit is nie 'n teoretiese risiko nie. Dit is die waarskynlikste ding wat
   more oggend verkeerd kan loop.

   ── Hoe dit werk ──

   Firestore se skep-met-'n-naam gee 'n 409 as daardie naam reeds bestaan.
   Dit is een oproep, en die beslissing gebeur BY Google, nie hier nie. Die
   dokument se naam is die datum in Suid-Afrikaanse tyd:

       kennisgewing_dae/2026-08-07

   Vuur twee oproepe op dieselfde oomblik, wen presies een van hulle die skep
   en die ander kry 'n 409. Daar is geen oomblik tussen "kyk" en "skryf"
   waarin albei kan deurglip nie — want daar is nie 'n "kyk" nie.

   Dit is die hele rede waarom dit NIE 'n lees-dan-skryf is nie. 'n Lees wat
   sê "nog niks vandag nie", gevolg deur 'n skryf, is presies die vorm wat
   twee gelyktydige oproepe albei laat deurkom.

   ── Wat dit NIE keer nie ──

   'n Mens wat in die admin sit en die knoppie druk. Dit is met opset: as
   Dewald 'n boodskap wil stuur, moet dit gaan, of dit die soveelste van die
   dag is of nie. Die slot geld net vir die OUTOMATIESE oggendlopie.
   ──────────────────────────────────────────────────────────── */

const VERSAMELING = 'kennisgewing_dae'

/* Suid-Afrika is UTC+2 die hele jaar deur — geen somertyd nie, dus is 'n
   plat twee uur reg en bly dit reg. Om 04:30 UTC (06:30 by ons) is die
   datum in albei sones dieselfde; die +2 maak saak vir 'n handlopie laat
   in die aand, wanneer UTC reeds gister is. */
function saDatum(nou) {
  const ms = typeof nou === 'number' ? nou : Date.now()
  return new Date(ms + 2 * 3600000).toISOString().slice(0, 10)
}

function url(projectId, pad, soek) {
  const basis = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${pad}`
  return soek ? `${basis}?${soek}` : basis
}

/* ── Eis die dag op ──

   Gee `true` terug as ONS die dag gekry het en dus moet stuur, en `false` as
   iemand anders hom reeds gehad het.

   'n Netwerkfout gee `true`. Dit is met opset: kan ons nie by Firestore kom
   nie, is die keuse tussen "moontlik twee kennisgewings" en "moontlik geen
   kennisgewing". Geen kennisgewing is erger. */
async function eisDag({ projectId, accessToken, dag, haal = fetch }) {
  const r = await haal(url(projectId, VERSAMELING, `documentId=${dag}`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        begin:  { timestampValue: new Date().toISOString() },
        klaar:  { booleanValue: false },
      },
    }),
  })

  if (r.status === 409) return { geeis: false, rede: 'reeds gestuur vandag' }
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    console.warn('[dagslot] kon nie eis nie, stuur eerder:', r.status, t.slice(0, 200))
    return { geeis: true, rede: 'slot onbeskikbaar — eerder stuur as nie stuur nie' }
  }
  return { geeis: true, rede: '' }
}

/* ── Gee die dag terug ──

   Net wanneer die lopie omgeval het VOORDAT een enkele boodskap uit is.
   Dan is niemand geraak nie en 'n tweede probeerslag is skoon.

   Het daar wel iets uitgegaan, bly die slot staan. 'n Halwe stuur wat oorbegin
   word, beteken die eerste helfte kry alles twee keer, en dit is erger as 'n
   halwe stuur wat Dewald self in die admin kan klaarmaak. */
async function geeDagTerug({ projectId, accessToken, dag, haal = fetch }) {
  try {
    await haal(url(projectId, `${VERSAMELING}/${dag}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch (e) {
    console.warn('[dagslot] kon nie teruggee nie:', e.message)
  }
}

/* ── Skryf neer wat gebeur het ──

   Sodat 'n mens die volgende oggend kan VRA of dit gewerk het, in plaas van
   ses duisend mense te vra. */
async function merkKlaar({ projectId, accessToken, dag, uitslag, haal = fetch }) {
  try {
    const velde = ['klaar', 'gestuur', 'totaal', 'misluk', 'dood', 'redes', 'sekondes', 'einde']
    const soek = velde.map(v => `updateMask.fieldPaths=${v}`).join('&')
    await haal(url(projectId, `${VERSAMELING}/${dag}`, soek), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          klaar:    { booleanValue: true },
          gestuur:  { integerValue: String(uitslag.gestuur || 0) },
          totaal:   { integerValue: String(uitslag.totaal  || 0) },
          misluk:   { integerValue: String(uitslag.misluk  || 0) },
          dood:     { integerValue: String(uitslag.dood    || 0) },
          /* Wat Google gese het. Net die foutkodes en hoe dikwels — nooit
             'n token nie. */
          redes:    { stringValue: String(uitslag.redes || '').slice(0, 300) },
          sekondes: { doubleValue: Number(uitslag.sekondes) || 0 },
          einde:    { timestampValue: new Date().toISOString() },
        },
      }),
    })
  } catch (e) {
    console.warn('[dagslot] kon nie klaar merk nie:', e.message)
  }
}

/* ── Wat het op 'n gegewe dag gebeur? ──
   Vir die droëloop, sodat Dewald kan sien of vanoggend s'n geloop het. */
async function lopieVir({ projectId, accessToken, dag, haal = fetch }) {
  try {
    const r = await haal(url(projectId, `${VERSAMELING}/${dag}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!r.ok) return null
    const d = await r.json()
    const f = d.fields || {}
    return {
      dag,
      klaar:    f.klaar?.booleanValue === true,
      gestuur:  Number(f.gestuur?.integerValue || 0),
      totaal:   Number(f.totaal?.integerValue  || 0),
      misluk:   Number(f.misluk?.integerValue  || 0),
      dood:     Number(f.dood?.integerValue    || 0),
      redes:    f.redes?.stringValue || '',
      sekondes: Number(f.sekondes?.doubleValue || 0),
    }
  } catch { return null }
}

module.exports = { VERSAMELING, saDatum, eisDag, geeDagTerug, merkKlaar, lopieVir }
