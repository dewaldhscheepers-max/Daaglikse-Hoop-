const { getAccessToken, batchWrite } = require('./_firebase')

function todayStr() { return new Date().toISOString().slice(0, 10) }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { type } = req.body || {}
  if (!type) return res.status(400).json({ error: 'Missing type' })

  const projectId = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
  const base      = `projects/${projectId}/databases/(default)/documents`
  const globalDoc = `${base}/stats/global`
  const todayDoc  = `${base}/stats/${todayStr()}`

  function inc(document, fieldPath) {
    return { transform: { document, fieldTransforms: [{ fieldPath, increment: { integerValue: '1' } }] } }
  }

  let writes = []
  switch (type) {
    case 'open':    writes = [inc(todayDoc, 'opens')]; break
    case 'install': writes = [inc(globalDoc, 'installs')]; break
    case 'play':    writes = [inc(todayDoc, 'plays'), inc(globalDoc, 'totalPlays')]; break
    case 'notif':   writes = [inc(globalDoc, 'notifSubscribers')]; break
    case 'prayer':  writes = [inc(globalDoc, 'prayerRequests')]; break
    case 'prayed':  writes = [inc(globalDoc, 'prayedTaps')]; break
    case 'share':   writes = [inc(globalDoc, 'appShares')]; break
    default: return res.status(400).json({ error: 'Unknown type: ' + type })
  }

  try {
    const token = await getAccessToken()
    await batchWrite(projectId, token, writes)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('track-stat error:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
