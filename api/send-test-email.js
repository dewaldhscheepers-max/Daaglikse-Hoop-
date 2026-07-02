module.exports = async function handler(req, res) {
  const { secret, to } = req.query
  if (secret !== 'DaaglikseHoop2025Cron') return res.status(403).send('Forbidden')
  if (!to) return res.status(400).send('?to= required')

  // Try with info@ first, then noreply@ as fallback
  async function trySend(from) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: 'Daaglikse Hoop — Toets e-pos',
        html: '<p>Toets e-pos. As jy dit ontvang, werk Resend korrek.</p>',
      }),
    })
    const text = await r.text()
    return { ok: r.ok, status: r.status, body: text, from }
  }

  const infoResult    = await trySend('Daaglikse Hoop <info@dewaldscheepers.com>')
  const noreplyResult = await trySend('Daaglikse Hoop <noreply@dewaldscheepers.com>')

  return res.json({ info: infoResult, noreply: noreplyResult })
}
