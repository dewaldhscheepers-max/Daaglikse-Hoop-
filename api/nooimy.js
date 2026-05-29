module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { naam, gemeente, dorp, tipe, datum, telefoon, boodskap } = req.body || {}
  if (!naam || !gemeente || !telefoon) return res.status(400).send('Missing fields')

  const rows = [
    ['Naam',        naam],
    ['Gemeente',    gemeente],
    ['Dorp',        dorp      || '—'],
    ['Tipe',        tipe      || '—'],
    ['Datum',       datum     || '—'],
    ['Telefoon',    telefoon],
    ['Boodskap',    boodskap  || '—'],
  ]

  const html = `
    <h2 style="font-family:sans-serif;color:#2d2040;">🎤 Nuwe Preek-uitnodiging</h2>
    <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;max-width:480px;">
      ${rows.map(([k, v]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#5c4e8e;width:120px;vertical-align:top;">${k}</td>
          <td style="padding:8px 12px;color:#333;">${v}</td>
        </tr>`).join('')}
    </table>
  `

  if (!process.env.RESEND_API_KEY) {
    console.error('nooimy: RESEND_API_KEY not set')
    return res.status(500).send('Missing API key')
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Daaglikse Hoop <onboarding@resend.dev>',
        to:      ['dewald.h.scheepers@gmail.com'],
        subject: `🎤 Nuwe uitnodiging: ${naam} — ${gemeente}`,
        html,
      }),
    })
    const body = await r.text()
    if (!r.ok) {
      console.error('nooimy resend error', r.status, body)
      return res.status(500).send('Email failed')
    }
    console.log('nooimy email sent ok', body)
    return res.status(200).send('OK')
  } catch (e) {
    console.error('nooimy email exception', e)
    return res.status(500).send('Email failed')
  }
}
