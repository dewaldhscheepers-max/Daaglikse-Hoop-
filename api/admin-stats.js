const { getAccessToken, fsGet } = require('./_firebase')

function todayStr() { return new Date().toISOString().slice(0, 10) }

function extractInt(fields, key) {
  const f = fields?.[key]
  if (!f) return 0
  return parseInt(f.integerValue ?? f.doubleValue ?? '0') || 0
}

module.exports = async function handler(req, res) {
  const pin = req.query.pin || (req.body || {}).pin
  if (pin !== '2025') return res.status(401).json({ error: 'Unauthorized' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'

  try {
    const token = await getAccessToken()
    const [globalDoc, todayDoc] = await Promise.all([
      fsGet(projectId, token, 'stats/global'),
      fsGet(projectId, token, `stats/${todayStr()}`),
    ])

    const g = globalDoc?.fields || {}
    const t = todayDoc?.fields  || {}

    return res.status(200).json({
      installs:         extractInt(g, 'installs'),
      totalPlays:       extractInt(g, 'totalPlays'),
      notifSubscribers: extractInt(g, 'notifSubscribers'),
      prayerRequests:   extractInt(g, 'prayerRequests'),
      prayedTaps:       extractInt(g, 'prayedTaps'),
      appShares:        extractInt(g, 'appShares'),
      opensToday:       extractInt(t, 'opens'),
      playsToday:       extractInt(t, 'plays'),
    })
  } catch (e) {
    console.error('admin-stats error:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
