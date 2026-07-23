module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { email, type } = req.body || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Geldige e-posadres vereis' })
  }

  const isSubscription = type === 'subscription'

  const subject = isSubscription
    ? "Dankie dat jy 'n Hoop-Vennoot geword het 🙏"
    : 'Dankie vir jou ondersteuning 🙏'

  const intro = isSubscription
    ? "Dankie dat jy 'n Maandelikse Hoop-Vennoot geword het! Baie baie dankie vir die ondersteuning."
    : 'Baie baie dankie vir die ondersteuning.'

  const body = isSubscription
    ? 'Ek waardeer dit regtig uit my hart uit. Jou maandelikse bydrae help ons om aan te hou om hoop, gebed en God se Woord by mense uit te kry wat dit elke dag nodig het.'
    : 'Ek waardeer dit regtig uit my hart uit. Jou ondersteuning help ons om aan te hou om hoop, gebed en God se Woord by mense uit te kry.'

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
      <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">met Dewald Scheepers</p>
      </div>
      <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
        <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Goeiedag,</p>
        <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">${intro}</p>
        <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">${body}</p>
        <p style="font-size:16px;line-height:1.8;margin:0 0 28px;">Mag die Here u ryklik seën. 🙏🏻</p>
        <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 24px;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#2d2d2d;">Seënwense</p>
        <p style="margin:4px 0 24px;font-size:15px;font-weight:700;color:#2d2d2d;">Dewald Scheepers</p>
        <p style="color:#aaa;font-size:12px;line-height:1.6;margin:0;">
          Vrae? Kontak ons by
          <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
        </p>
      </div>
    </div>
  `

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     'Dewald Scheepers <noreply@dewaldscheepers.com>',
        to:       email,
        reply_to: 'info@dewaldscheepers.com',
        subject,
        html,
      }),
    })
    if (!r.ok) {
      const err = await r.text()
      return res.status(500).json({ error: 'E-pos kon nie gestuur word nie: ' + err })
    }
  } catch (e) {
    return res.status(500).json({ error: 'Netwerkfout: ' + e.message })
  }

  return res.status(200).json({ ok: true })
}
