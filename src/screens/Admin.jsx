import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'
import './Admin.css'

const ADMIN_PIN = '2025'

function extractFileId(input) {
  const s = input.trim()
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /open\?id=([a-zA-Z0-9_-]{20,})/,
  ]
  for (const p of patterns) {
    const m = s.match(p)
    if (m) return m[1]
  }
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s
  return null
}

export default function Admin({ onClose }) {
  const [pin, setPin]         = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)

  const [title, setTitle]               = useState('')
  const [driveInput, setDriveInput]     = useState('')
  const [scripture, setScripture]       = useState('')
  const [scriptureText, setScriptText]  = useState('')
  const [series, setSeries]             = useState('')
  const [publishedAt, setPublishedAt]   = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [formError, setFormError]       = useState('')

  const [notes, setNotes]               = useState([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    if (unlocked) loadNotes()
  }, [unlocked])

  async function loadNotes() {
    setNotesLoading(true)
    try {
      const q = query(collection(db, 'notes'), orderBy('publishedAt', 'desc'))
      const snap = await getDocs(q)
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {}
    setNotesLoading(false)
  }

  function checkPin() {
    if (pin === ADMIN_PIN) { setUnlocked(true); setPinError(false) }
    else { setPinError(true); setPin('') }
  }

  async function handleSave() {
    setFormError('')
    if (!title.trim()) { setFormError('Titel is verpligtend'); return }
    const fileId = extractFileId(driveInput)
    if (!fileId) { setFormError('Ongeldige Drive URL of lêer-ID'); return }

    setSaving(true)
    try {
      await setDoc(doc(db, 'notes', fileId), {
        title:         title.trim(),
        audioUrl:      `https://drive.google.com/uc?id=${fileId}&export=download`,
        fileId,
        publishedAt:   new Date(publishedAt + 'T06:00:00'),
        scripture:     scripture.trim(),
        scriptureText: scriptureText.trim(),
        series:        series.trim(),
        color:         '',
        lengthSeconds: 0
      })
      setSaved(true)
      setTitle(''); setDriveInput(''); setScripture('')
      setScriptText(''); setSeries('')
      setPublishedAt(new Date().toISOString().slice(0, 10))
      await loadNotes()
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setFormError('Kon nie stoor nie: ' + e.message)
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, 'notes', id))
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch { alert('Kon nie skrap nie') }
    setDeleteConfirm(null)
  }

  if (!unlocked) {
    return (
      <div className="admin-overlay">
        <div className="admin-pin-screen">
          <button className="admin-x" onClick={onClose}>✕</button>
          <div className="admin-pin-logo">🔐</div>
          <div className="admin-pin-title">Admin</div>
          <input
            className={`admin-pin-input ${pinError ? 'error' : ''}`}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(false) }}
            onKeyDown={e => e.key === 'Enter' && checkPin()}
            autoFocus
          />
          {pinError && <div className="admin-pin-error">Verkeerde PIN. Probeer weer.</div>}
          <button className="admin-pin-btn" onClick={checkPin}>Toegang</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-overlay">
      <div className="admin-screen">
        <div className="admin-header">
          <span className="admin-header-title">Admin</span>
          <button className="admin-x" onClick={onClose}>✕</button>
        </div>

        <div className="admin-body">
          <div className="admin-section">
            <div className="admin-section-title">Voeg nuwe nota by</div>

            <div className="admin-field">
              <label>Titel *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="bv. Hy Sien Jou Trane" />
            </div>

            <div className="admin-field">
              <label>Google Drive URL of lêer-ID *</label>
              <input value={driveInput} onChange={e => setDriveInput(e.target.value)} placeholder="Plak die Drive skakel hier" />
            </div>

            <div className="admin-field">
              <label>Skrifverwysing</label>
              <input value={scripture} onChange={e => setScripture(e.target.value)} placeholder="bv. Psalm 56:9" />
            </div>

            <div className="admin-field">
              <label>Skrifteks</label>
              <input value={scriptureText} onChange={e => setScriptText(e.target.value)} placeholder="Die teksvers (opsioneel)" />
            </div>

            <div className="admin-field">
              <label>Reeks / Series</label>
              <input value={series} onChange={e => setSeries(e.target.value)} placeholder="bv. God Sien Jou Trane" />
            </div>

            <div className="admin-field">
              <label>Datum</label>
              <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
            </div>

            {formError && <div className="admin-error">{formError}</div>}
            {saved     && <div className="admin-success">✅ Nota gestoor!</div>}

            <button className="admin-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Besig om te stoor...' : 'Stoor nota'}
            </button>
          </div>

          <div className="admin-section">
            <div className="admin-section-title">Bestaande notas ({notes.length})</div>
            {notesLoading ? (
              <div className="admin-loading">Laai notas...</div>
            ) : notes.map(note => (
              <div key={note.id} className="admin-note-row">
                <div className="admin-note-info">
                  <div className="admin-note-title">{note.title}</div>
                  <div className="admin-note-meta">
                    {[note.scripture, note.series].filter(Boolean).join(' · ') || note.id}
                  </div>
                </div>
                {deleteConfirm === note.id ? (
                  <div className="admin-delete-confirm">
                    <button className="admin-delete-yes" onClick={() => handleDelete(note.id)}>Ja, skrap</button>
                    <button className="admin-delete-no" onClick={() => setDeleteConfirm(null)}>Kanselleer</button>
                  </div>
                ) : (
                  <button className="admin-delete-btn" onClick={() => setDeleteConfirm(note.id)}>🗑</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
