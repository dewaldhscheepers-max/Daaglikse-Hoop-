/* ────────────────────────────────────────────────────────────
   Een bondel e-pos stuur, sonder dat een slegte adres die res doodmaak.

   ── Wat gebeur het ──

   Die stuur het in bondels van honderd na Resend se /emails/batch gegaan.
   Weier Resend die bondel — en EEN adres wat hy nie kan lees nie, is genoeg —
   dan gee hy 'n fout vir die HELE bondel terug. Die kode het toe honderd by
   `failedCount` getel en aangegaan.

   Op 11 Augustus was dit 2383 gestuur en 600 misluk. Ses honderd is presies
   ses bondels. Sowat ses stukkende adresse het 594 mense hul boodskap gekos,
   en niks in die paneel het gese watter ses nie.

   ── Wat nou gebeur ──

   Slaag die bondel, is ons klaar — dit is die gewone geval en dit bly een
   versoek vir honderd mense.

   Weier hy, gaan ons NIE weg nie. Ons stuur die honderd weer, een vir een,
   twintig gelyktydig. Die goeies kom deur en die slegtes word by die naam
   genoem, sodat 'n mens hulle kan gaan regmaak in plaas van raai.

   Dit is stadiger, maar net vir 'n bondel wat in elk geval sou misluk het.
   ──────────────────────────────────────────────────────────── */

const { sifGeblok } = require('./_eposGeblok')

const GELYK = 20

async function stuurEen({ sleutel, to, van, antwoordNa, onderwerp, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sleutel}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: van, to, reply_to: antwoordNa, subject: onderwerp, html }),
  })
  if (r.ok) return { ok: true, to }
  const uit = await r.json().catch(() => ({}))
  return { ok: false, to, rede: String((uit && (uit.message || uit.name)) || r.status) }
}

/* Stuur een bondel. Gee terug hoeveel werklik deurgekom het, en WATTER
   adresse geweier is. */
async function stuurBondel({ sleutel, adresse: rou, van, antwoordNa, onderwerp, html }) {
  const slegtes = []

  /* ── Die blok, hier en nie hoër nie ──

     Dit sou netjieser lyk om die geblokte adresse by die LYS uit te haal en
     hier niks te weet nie. Dit is nie genoeg nie: 'n veldtog wat reeds in
     die ry staan, dra sy eie kopie van die adresse in
     `campaign.pendingEmails`, en daardie kopie is gemaak voordat iemand
     gevra het om af te kom.

     Elke bulk-stuur in hierdie projek — `send-bulk-email.js` en
     `process-email-queue.js` — kom hierlangs. Dit is die enigste plek waar
     een sif almal dek. */
  const { adresse, geblok } = sifGeblok(rou)
  if (!adresse.length) return { gestuur: 0, misluk: 0, slegtes, geblok }

  try {
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sleutel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(adresse.map(to => ({
        from: van, to, reply_to: antwoordNa, subject: onderwerp, html,
      }))),
    })
    if (r.ok) return { gestuur: adresse.length, misluk: 0, slegtes, geblok }

    const uit = await r.json().catch(() => ({}))
    console.error('Resend batch error:', JSON.stringify(uit))
  } catch (e) {
    console.error('Resend batch fout:', e.message)
  }

  /* Die bondel is af. Nou een vir een, sodat net die werklik stukkende
     adresse val. */
  let gestuur = 0
  for (let i = 0; i < adresse.length; i += GELYK) {
    const stuk = adresse.slice(i, i + GELYK)
    const uitslae = await Promise.all(stuk.map(to =>
      stuurEen({ sleutel, to, van, antwoordNa, onderwerp, html })
        .catch(e => ({ ok: false, to, rede: e.message }))
    ))
    for (const u of uitslae) {
      if (u.ok) gestuur++
      else slegtes.push({ adres: u.to, rede: u.rede })
    }
  }

  /* `misluk` tel net wat GEPROBEER is. 'n Geblokte adres het nie misluk
     nie — ons het hom nooit gestuur nie, en dit as 'n mislukking tel, sou
     die paneel laat lyk of iets stukkend is. */
  return { gestuur, misluk: adresse.length - gestuur, slegtes, geblok }
}

module.exports = { stuurBondel, stuurEen, GELYK }
