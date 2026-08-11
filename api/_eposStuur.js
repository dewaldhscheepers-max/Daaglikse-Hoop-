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
async function stuurBondel({ sleutel, adresse, van, antwoordNa, onderwerp, html }) {
  const slegtes = []

  try {
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sleutel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(adresse.map(to => ({
        from: van, to, reply_to: antwoordNa, subject: onderwerp, html,
      }))),
    })
    if (r.ok) return { gestuur: adresse.length, misluk: 0, slegtes }

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

  return { gestuur, misluk: adresse.length - gestuur, slegtes }
}

module.exports = { stuurBondel, stuurEen, GELYK }
