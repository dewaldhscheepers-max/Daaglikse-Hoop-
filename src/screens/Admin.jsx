import { useState, useEffect, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, query, orderBy, getDocs, setDoc, deleteDoc, doc, onSnapshot, addDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { subscribeToNotifications } from '../firebase'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import './Admin.css'

const ADMIN_PIN = '2025'

export default function Admin({ onClose }) {
  const [pin, setPin]           = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'books' | 'notif'

  // ── Notes state ──
  const [title, setTitle]             = useState('')
  const [audioFile, setAudioFile]     = useState(null)
  const [scripture, setScripture]     = useState('')
  const [scriptureText, setScriptText]= useState('')
  const [series, setSeries]           = useState('')
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10))
  const [uploadProgress, setProgress] = useState(0)
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [formError, setFormError]     = useState('')
  const [notes, setNotes]             = useState([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const fileInputRef = useRef(null)

  // ── Recording state ──
  const [recording,    setRecording]    = useState(false)
  const [recordedUrl,  setRecordedUrl]  = useState(null)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordSecs,   setRecordSecs]   = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const timerRef         = useRef(null)

  // ── Books state ──
  const [bookOverrides, setBookOverrides]     = useState({})
  const [pdfUploading, setPdfUploading]       = useState(null)
  const [pdfProgress, setPdfProgress]         = useState(0)
  const [pdfSaved, setPdfSaved]               = useState(null)
  const pdfInputRef                           = useRef(null)
  const [pdfUploadTarget, setPdfUploadTarget] = useState(null)
  const [coverUploading, setCoverUploading]   = useState(null)
  const [coverProgress, setCoverProgress]     = useState(0)
  const [coverSaved, setCoverSaved]           = useState(null)
  const coverInputRef                         = useRef(null)
  const [coverUploadTarget, setCoverUploadTarget] = useState(null)

  // ── Notification test state ──
  const [notifStatus, setNotifStatus] = useState(null)
  const [notifBusy,   setNotifBusy]   = useState(false)

  async function handleNotifSubscribe() {
    setNotifBusy(true)
    setNotifStatus(null)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setNotifStatus('denied'); setNotifBusy(false); return }
      const ok = await subscribeToNotifications()
      setNotifStatus(ok ? 'ok' : 'fail')
    } catch { setNotifStatus('fail') }
    setNotifBusy(false)
  }

  async function handleNotifTest() {
    setNotifBusy(true)
    setNotifStatus(null)
    const token = localStorage.getItem('fcmToken')
    if (!token) { setNotifStatus('notoken'); setNotifBusy(false); return }
    try {
      const r = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin: '2025' })
      })
      setNotifStatus(r.ok ? 'testsent' : 'fail')
    } catch { setNotifStatus('fail') }
    setNotifBusy(false)
  }

  // ── New book form ──
  const [newTitle, setNewTitle]   = useState('')
  const [newDesc, setNewDesc]     = useState('')
  const [newPrice, setNewPrice]   = useState('')
  const [newFree, setNewFree]     = useState(false)
  const [newEmoji, setNewEmoji]   = useState('📚')
  const [addingBook, setAddingBook] = useState(false)
  const [bookAdded, setBookAdded] = useState(false)

  useEffect(() => {
    if (!unlocked) return
    loadNotes()
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    return unsub
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

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  function clearRecording() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl(null)
    setRecordedBlob(null)
    setRecordSecs(0)
  }

  async function startRecording() {
    clearRecording()
    setAudioFile(null)
    chunksRef.current = []
    setRecordSecs(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', '']
        .find(t => !t || MediaRecorder.isTypeSupported(t))
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const mime = mr.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mime })
        const url  = URL.createObjectURL(blob)
        const ext  = mime.includes('mp4') ? 'm4a' : 'webm'
        const file = new File([blob], `opname_${Date.now()}.${ext}`, { type: mime })
        setRecordedBlob(blob)
        setRecordedUrl(url)
        setAudioFile(file)
      }
      mr.start()
      setRecording(true)
      timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000)
    } catch {
      alert('Mikrofoon toegang geweier. Gaan na jou foon se instellings om dit toe te laat.')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    clearInterval(timerRef.current)
    setRecording(false)
  }

  function checkPin() {
    if (pin === ADMIN_PIN) { setUnlocked(true); setPinError(false) }
    else { setPinError(true); setPin('') }
  }

  // ── Save voice note ──
  async function handleSave() {
    setFormError('')
    if (!title.trim()) { setFormError('Titel is verpligtend'); return }
    if (!audioFile)    { setFormError("Kies 'n oudiolêer"); return }

    setUploading(true); setProgress(0)
    let audioUrl = '', fileId = ''

    try {
      const ext      = audioFile.name.split('.').pop().toLowerCase()
      const safeName = title.trim().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
      fileId         = `${safeName}_${Date.now()}`
      const sRef     = ref(storage, `audio/${fileId}.${ext}`)

      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(sRef, audioFile)
        task.on('state_changed',
          s => setProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          reject,
          async () => { audioUrl = await getDownloadURL(task.snapshot.ref); resolve() }
        )
      })
    } catch (e) { setFormError('Upload misluk: ' + e.message); setUploading(false); return }

    setUploading(false); setSaving(true)

    try {
      await setDoc(doc(db, 'notes', fileId), {
        title: title.trim(), audioUrl, fileId,
        publishedAt: new Date(publishedAt + 'T06:00:00'),
        scripture: scripture.trim(), scriptureText: scriptureText.trim(),
        series: series.trim(), color: '', lengthSeconds: 0
      })
      try { localStorage.removeItem('cachedNotesTime') } catch {}
      setSaved(true)
      setTitle(''); setAudioFile(null); setScripture(''); setScriptText(''); setSeries('')
      setPublishedAt(new Date().toISOString().slice(0, 10))
      if (fileInputRef.current) fileInputRef.current.value = ''
      clearRecording()
      await loadNotes()
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setFormError('Kon nie stoor nie: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete(id) {
    try { await deleteDoc(doc(db, 'notes', id)); setNotes(prev => prev.filter(n => n.id !== id)) }
    catch { alert('Kon nie skrap nie') }
    setDeleteConfirm(null)
  }

  // ── Upload PDF for a book ──
  function triggerPdfUpload(book) {
    setPdfUploadTarget(book)
    pdfInputRef.current?.click()
  }

  async function handlePdfUpload(e) {
    const file = e.target.files[0]
    if (!file || !pdfUploadTarget) return
    e.target.value = ''

    const book = pdfUploadTarget
    setPdfUploading(book.id); setPdfProgress(0)

    try {
      const sRef = ref(storage, `pdfs/${book.id}.pdf`)
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(sRef, file)
        task.on('state_changed',
          s => setPdfProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          reject,
          async () => {
            const pdfUrl = await getDownloadURL(task.snapshot.ref)
            await setDoc(doc(db, 'books', book.id), { pdfUrl }, { merge: true })
            resolve()
          }
        )
      })
      setPdfSaved(book.id)
      setTimeout(() => setPdfSaved(null), 3000)
    } catch (e) { alert('PDF upload misluk: ' + e.message) }

    setPdfUploading(null); setPdfUploadTarget(null)
  }

  // ── Add a new book ──
  async function handleAddBook() {
    if (!newTitle.trim()) { alert('Titel is verpligtend'); return }
    setAddingBook(true)
    try {
      const slug = newTitle.trim().toLowerCase()
        .replace(/[àáâäã]/g,'a').replace(/[èéêë]/g,'e')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
      const id = `${slug}-${Date.now()}`
      await setDoc(doc(db, 'books', id), {
        title:  newTitle.trim(),
        desc:   newDesc.trim(),
        price:  newFree ? 0 : (parseFloat(newPrice) || 0),
        free:   newFree,
        emoji:  newEmoji || '📚',
        color:  '#EDE8F8',
      })
      setNewTitle(''); setNewDesc(''); setNewPrice(''); setNewFree(false); setNewEmoji('📚')
      setBookAdded(true)
      setTimeout(() => setBookAdded(false), 3000)
    } catch (e) { alert('Kon nie boek byvoeg nie: ' + e.message) }
    setAddingBook(false)
  }

  // ── Upload cover image for a book ──
  function triggerCoverUpload(book) {
    setCoverUploadTarget(book)
    coverInputRef.current?.click()
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file || !coverUploadTarget) return
    e.target.value = ''

    const book = coverUploadTarget
    setCoverUploading(book.id); setCoverProgress(0)

    try {
      const ext  = file.name.split('.').pop().toLowerCase() || 'jpg'
      const sRef = ref(storage, `covers/${book.id}.${ext}`)
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(sRef, file)
        task.on('state_changed',
          s => setCoverProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          reject,
          async () => {
            const coverUrl = await getDownloadURL(task.snapshot.ref)
            await setDoc(doc(db, 'books', book.id), { coverUrl }, { merge: true })
            resolve()
          }
        )
      })
      setCoverSaved(book.id)
      setTimeout(() => setCoverSaved(null), 3000)
    } catch (e) { alert('Cover upload misluk: ' + e.message) }

    setCoverUploading(null); setCoverUploadTarget(null)
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
            type="password" inputMode="numeric" placeholder="PIN"
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

        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            🎙️ Stemnotas
          </button>
          <button className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
            📚 E-boeke
          </button>
          <button className={`admin-tab ${activeTab === 'notif' ? 'active' : ''}`} onClick={() => setActiveTab('notif')}>
            🔔 Kennisgewings
          </button>
        </div>

        <div className="admin-body">

          {/* ── NOTES TAB ── */}
          {activeTab === 'notes' && (
            <>
              <div className="admin-section">
                <div className="admin-section-title">Voeg nuwe nota by</div>

                <div className="admin-field">
                  <label>Titel *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="bv. Vergifnis dag 1" />
                </div>

                <div className="admin-field">
                  <label>Oudioléer *</label>
                  <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
                    style={{ display: 'none' }} onChange={e => {
                      clearRecording()
                      setAudioFile(e.target.files[0] || null)
                    }} />

                  {!recording && !recordedUrl && (
                    <div className="audio-row">
                      <button className="admin-file-btn" style={{ flex: 1 }} onClick={() => fileInputRef.current?.click()}>
                        {audioFile ? `✓ ${audioFile.name}` : '📎 Kies lêer'}
                      </button>
                      <button className="record-btn" onClick={startRecording}>🎙 Opneem</button>
                    </div>
                  )}

                  {recording && (
                    <div className="record-live">
                      <span className="record-dot" />
                      <span className="record-timer">{formatTime(recordSecs)}</span>
                      <button className="record-stop-btn" onClick={stopRecording}>⏹ Stop</button>
                    </div>
                  )}

                  {recordedUrl && !recording && (
                    <div className="record-preview">
                      <audio src={recordedUrl} controls className="record-audio" />
                      <button className="record-redo-btn" onClick={startRecording}>🔁 Opneem weer</button>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="admin-upload-progress">
                    <div className="admin-upload-bar">
                      <div className="admin-upload-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span>{uploadProgress}% opgelaai...</span>
                  </div>
                )}

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
                  <input value={series} onChange={e => setSeries(e.target.value)} placeholder="bv. Vergifnis" />
                </div>
                <div className="admin-field">
                  <label>Datum</label>
                  <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
                </div>

                {formError && <div className="admin-error">{formError}</div>}
                {saved     && <div className="admin-success">✅ Nota gestoor en lewendig!</div>}

                <button className="admin-save-btn" onClick={handleSave} disabled={saving || uploading}>
                  {uploading ? `Laai op... ${uploadProgress}%` : saving ? 'Stoor...' : 'Stoor nota'}
                </button>
              </div>

              <div className="admin-section">
                <div className="admin-section-title">Bestaande notas ({notes.length})</div>
                {notesLoading ? <div className="admin-loading">Laai notas...</div>
                  : notes.map(note => (
                    <div key={note.id} className="admin-note-row">
                      <div className="admin-note-info">
                        <div className="admin-note-title">{note.title}</div>
                        <div className="admin-note-meta">
                          {[note.scripture, note.series].filter(Boolean).join(' · ') ||
                            new Date((note.publishedAt?.seconds || 0) * 1000).toLocaleDateString('af')}
                        </div>
                      </div>
                      {deleteConfirm === note.id ? (
                        <div className="admin-delete-confirm">
                          <button className="admin-delete-yes" onClick={() => handleDelete(note.id)}>Ja, skrap</button>
                          <button className="admin-delete-no" onClick={() => setDeleteConfirm(null)}>Nee</button>
                        </div>
                      ) : (
                        <button className="admin-delete-btn" onClick={() => setDeleteConfirm(note.id)}>🗑</button>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* ── BOOKS TAB ── */}
          {activeTab === 'books' && (() => {
            const staticIds = new Set(STATIC_BOOKS.map(b => b.id))
            const allBooks = [
              ...STATIC_BOOKS.map(b => ({ ...b, ...(bookOverrides[b.id] || {}) })),
              ...Object.entries(bookOverrides)
                .filter(([id, d]) => !staticIds.has(id) && d.title)
                .map(([id, d]) => ({ id, color: '#EDE8F8', emoji: '📚', price: 0, free: false, ...d }))
            ]
            return (
            <div className="admin-section">
              <div className="admin-section-title">Voeg nuwe boek by</div>
              <div className="admin-field">
                <label>Titel *</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="bv. Geloof bo Vrees" />
              </div>
              <div className="admin-field">
                <label>Beskrywing</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Kort beskrywing..." />
              </div>
              <div className="admin-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <label style={{ margin: 0 }}>Gratis?</label>
                <input type="checkbox" checked={newFree} onChange={e => setNewFree(e.target.checked)} style={{ width: 20, height: 20 }} />
              </div>
              {!newFree && (
                <div className="admin-field">
                  <label>Prys (R)</label>
                  <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="bv. 50" />
                </div>
              )}
              <div className="admin-field">
                <label>Emoji</label>
                <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} placeholder="📚" style={{ width: 60 }} />
              </div>
              {bookAdded && <div className="admin-success">✅ Boek bygevoeg! Laai nou cover en PDF op.</div>}
              <button className="admin-save-btn" onClick={handleAddBook} disabled={addingBook}>
                {addingBook ? 'Byvoeg...' : '+ Voeg boek by'}
              </button>

              <div className="admin-section-title" style={{ marginTop: 24 }}>Alle boeke ({allBooks.length})</div>
              <div className="admin-books-note">Laai cover en PDF op vir elke boek.</div>

              <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf"
                style={{ display: 'none' }} onChange={handlePdfUpload} />
              <input ref={coverInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleCoverUpload} />

              {allBooks.map(book => {
                const override          = bookOverrides[book.id]
                const hasPdf            = override?.pdfUrl
                const hasCover          = override?.coverUrl
                const isPdfUploading    = pdfUploading === book.id
                const isCoverUploading  = coverUploading === book.id
                const isPdfSaved        = pdfSaved === book.id
                const isCoverSaved      = coverSaved === book.id

                return (
                  <div key={book.id} className="admin-book-row">
                    <div className="admin-book-icon" style={{ position: 'relative' }}>
                      {hasCover
                        ? <img src={override.coverUrl} style={{ width: 36, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                        : book.emoji}
                    </div>
                    <div className="admin-note-info">
                      <div className="admin-note-title">{book.title}</div>
                      <div className="admin-note-meta">
                        {book.free ? '🎁 Gratis' : `💳 R${book.price}`}
                        {' · '}
                        {isPdfUploading ? `PDF ${pdfProgress}%...`
                          : isCoverUploading ? `Cover ${coverProgress}%...`
                          : isPdfSaved ? '✅ PDF opgelaai!'
                          : isCoverSaved ? '✅ Cover opgelaai!'
                          : [hasCover ? 'Cover ✓' : null, hasPdf ? 'PDF ✓' : 'Geen PDF'].filter(Boolean).join(' · ')}
                      </div>
                      {(isPdfUploading || isCoverUploading) && (
                        <div className="admin-upload-bar" style={{ marginTop: 4 }}>
                          <div className="admin-upload-fill" style={{ width: `${isPdfUploading ? pdfProgress : coverProgress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="admin-book-btns">
                      <button
                        className="admin-pdf-btn"
                        onClick={() => triggerCoverUpload(book)}
                        disabled={isCoverUploading || isPdfUploading}
                        title="Laai cover foto op"
                      >
                        {hasCover ? '🖼 Opdateer' : '🖼 Cover'}
                      </button>
                      <button
                        className="admin-pdf-btn"
                        onClick={() => triggerPdfUpload(book)}
                        disabled={isPdfUploading || isCoverUploading}
                        title="Laai PDF op"
                      >
                        {hasPdf ? '↑ PDF' : '↑ PDF'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            )
          })()}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notif' && (
            <div className="admin-section">
              <div className="admin-section-title">Kennisgewings Toets</div>

              <div className="admin-note-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <div className="admin-note-title">Toestelstatus</div>
                <div className="admin-note-meta">
                  {'Notification' in window
                    ? `Toestemming: ${Notification.permission === 'granted' ? '✅ Toegelaat' : Notification.permission === 'denied' ? '❌ Geweier' : '⏳ Nog nie gevra nie'}`
                    : '❌ Kennisgewings word nie ondersteun op hierdie toestel nie'}
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Tik die knoppie om jou kennisgewinginskrywing te herregistreer. Dit sal jou token in Firestore stoor sodat jy oggendkennisgewings ontvang.
              </p>

              {notifStatus === 'ok'       && <div className="admin-success">✅ Geregistreer! Tik nou "Stuur toets" om te bevestig.</div>}
              {notifStatus === 'testsent' && <div className="admin-success">✅ Toets gestuur! Kyk jou foon se kennisgewings nou.</div>}
              {notifStatus === 'fail'     && <div className="admin-error">❌ Misluk. Kyk of kennisgewings toegelaat is in jou foon se instellings.</div>}
              {notifStatus === 'denied'   && <div className="admin-error">❌ Toestemming geweier. Gaan na Instellings → Kennisgewings.</div>}
              {notifStatus === 'notoken'  && <div className="admin-error">❌ Geen token — tik eers Registreer hieronder.</div>}

              <button className="admin-save-btn" onClick={handleNotifSubscribe} disabled={notifBusy}>
                {notifBusy ? 'Besig...' : '🔔 Registreer / Herregistreer'}
              </button>

              <button className="admin-save-btn" style={{ background: '#27713f', marginTop: 4 }} onClick={handleNotifTest} disabled={notifBusy}>
                {notifBusy ? 'Besig...' : '📨 Stuur toets-kennisgewinig nou'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
