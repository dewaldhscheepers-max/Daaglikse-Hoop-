import { useState, useEffect, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, query, orderBy, getDocs, setDoc, deleteDoc, doc, onSnapshot, addDoc, limit } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { subscribeToNotifications, isSamsungBrowser } from '../firebase'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import './Admin.css'

const ADMIN_PIN = '2025'

export default function Admin({ onClose }) {
  const [pin, setPin]           = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'books' | 'notif' | 'aandgebed'

  // ── Aandgebed state ──
  const [apDate,       setApDate]       = useState(new Date().toISOString().slice(0, 10))
  const [apCount,      setApCount]      = useState('')
  const [apAudioFile,  setApAudioFile]  = useState(null)
  const [apRecUrl,     setApRecUrl]     = useState(null)
  const [apRecBlob,    setApRecBlob]    = useState(null)
  const [apRecording,  setApRecording]  = useState(false)
  const [apRecSecs,    setApRecSecs]    = useState(0)
  const [apUploading,  setApUploading]  = useState(false)
  const [apProgress,   setApProgress]   = useState(0)
  const [apSaved,      setApSaved]      = useState(false)
  const [apError,      setApError]      = useState('')
  const [apList,       setApList]       = useState([])
  const apFileRef      = useRef(null)
  const apMrRef        = useRef(null)
  const apChunksRef    = useRef([])
  const apTimerRef     = useRef(null)

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

  // ── Install count ──
  const [installCount, setInstallCount] = useState(null)

  useEffect(() => {
    if (!unlocked) return
    fetch('/api/count-install?pin=2025')
      .then(r => r.json())
      .then(d => setInstallCount(d.total ?? 0))
      .catch(() => {})
  }, [unlocked])

  // ── Email test state ──
  const [testEmailAddr,    setTestEmailAddr]    = useState('dewald.h.scheepers@gmail.com')
  const [testEmailBookId,  setTestEmailBookId]  = useState('')
  const [testEmailBusy,    setTestEmailBusy]    = useState(false)
  const [testEmailResult,  setTestEmailResult]  = useState(null)

  // ── Notification test state ──
  const [notifStatus,  setNotifStatus]  = useState(null)
  const [notifBusy,    setNotifBusy]    = useState(false)
  const [notifDetail,  setNotifDetail]  = useState(null)
  const [swUrl,        setSwUrl]        = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => setSwUrl(reg.active?.scriptURL || reg.scope))
    }
  }, [])

  const [sendAllBusy,   setSendAllBusy]   = useState(false)
  const [sendAllResult, setSendAllResult] = useState(null)
  const [customTitle,   setCustomTitle]   = useState('')
  const [customBody,    setCustomBody]    = useState('')

  async function handleSendAll() {
    if (!customTitle.trim()) { alert('Voer eers \'n titel in'); return }
    if (!window.confirm(`Stuur aan ALMAL?\n\n"${customTitle.trim()}"\n${customBody.trim()}`)) return
    setSendAllBusy(true)
    setSendAllResult(null)
    try {
      const r = await fetch('/api/send-notifications?secret=DaaglikseHoop2025Cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: customTitle.trim(), body: customBody.trim() })
      })
      const data = await r.json().catch(() => ({}))
      setSendAllResult(r.ok
        ? `✅ Gestuur aan ${(data.fcm?.sent ?? 0) + (data.webpush?.sent ?? 0)} mense`
        : `❌ Misluk: ${JSON.stringify(data)}`)
    } catch (e) {
      setSendAllResult('❌ Netwerkfout: ' + e.message)
    }
    setSendAllBusy(false)
  }

  async function handleTestEmail(allBooks) {
    if (!testEmailBookId) { alert('Kies eers \'n boek'); return }
    setTestEmailBusy(true)
    setTestEmailResult(null)
    try {
      const r = await fetch('/api/test-itn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '2025', email: testEmailAddr, bookIds: [testEmailBookId] })
      })
      const data = await r.json()
      setTestEmailResult(data)
    } catch (e) {
      setTestEmailResult({ steps: ['❌ Netwerkfout: ' + e.message] })
    }
    setTestEmailBusy(false)
  }

  async function handleNotifSubscribe() {
    setNotifBusy(true)
    setNotifStatus(null)
    setNotifDetail(null)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setNotifStatus('denied'); setNotifBusy(false); return }
      const result = await subscribeToNotifications()
      const token = localStorage.getItem('fcmToken')
      setNotifDetail(token ? `Token: ${token.slice(0,30)}…` : 'Geen token')
      setNotifStatus(result.ok ? 'ok' : 'fail')
    } catch (e) { setNotifDetail(e.message); setNotifStatus('fail') }
    setNotifBusy(false)
  }

  async function handleNotifTest() {
    setNotifBusy(true)
    setNotifStatus(null)
    setNotifDetail(null)
    const token = localStorage.getItem('fcmToken')
    if (!token) { setNotifStatus('notoken'); setNotifBusy(false); return }
    try {
      const r = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin: '2025' })
      })
      const data = await r.json().catch(() => ({}))
      setNotifDetail(JSON.stringify(data))
      setNotifStatus(r.ok ? 'testsent' : 'fail')
    } catch (e) { setNotifDetail(e.message); setNotifStatus('fail') }
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
    loadAandgebede()
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    return unsub
  }, [unlocked])

  async function loadAandgebede() {
    try {
      const q    = query(collection(db, 'aandgebede'), orderBy('date', 'desc'), limit(10))
      const snap = await getDocs(q)
      setApList(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {}
  }

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

  // ── Aandgebed recording ──
  async function startApRecording() {
    if (apRecUrl) URL.revokeObjectURL(apRecUrl)
    setApRecUrl(null); setApRecBlob(null); setApAudioFile(null); setApRecSecs(0)
    apChunksRef.current = []
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', ''].find(t => !t || MediaRecorder.isTypeSupported(t))
      const mr       = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      apMrRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) apChunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const mime = mr.mimeType || 'audio/webm'
        const blob = new Blob(apChunksRef.current, { type: mime })
        const url  = URL.createObjectURL(blob)
        const ext  = mime.includes('mp4') ? 'm4a' : 'webm'
        setApRecBlob(blob); setApRecUrl(url)
        setApAudioFile(new File([blob], `aandgebed_${Date.now()}.${ext}`, { type: mime }))
      }
      mr.start(); setApRecording(true)
      apTimerRef.current = setInterval(() => setApRecSecs(s => s + 1), 1000)
    } catch { alert('Mikrofoon toegang geweier.') }
  }

  function stopApRecording() {
    if (apMrRef.current?.state === 'recording') apMrRef.current.stop()
    clearInterval(apTimerRef.current); setApRecording(false)
  }

  async function handleApSave() {
    setApError('')
    if (!apAudioFile)     { setApError('Kies of neem eers oudio op'); return }
    if (!apCount || isNaN(Number(apCount))) { setApError('Voer die aantal gebedsversoeke in'); return }

    setApUploading(true); setApProgress(0)
    let audioUrl = ''
    try {
      const ext  = apAudioFile.name.split('.').pop().toLowerCase()
      const sRef = ref(storage, `aandgebede/${apDate}.${ext}`)
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(sRef, apAudioFile)
        task.on('state_changed',
          s => setApProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          reject,
          async () => { audioUrl = await getDownloadURL(task.snapshot.ref); resolve() }
        )
      })
    } catch (e) { setApError('Upload misluk: ' + e.message); setApUploading(false); return }

    setApUploading(false)
    try {
      await setDoc(doc(db, 'aandgebede', apDate), {
        date: apDate, audioUrl, prayerCount: Number(apCount),
        publishedAt: new Date(apDate + 'T20:00:00')
      })
      setApSaved(true); setTimeout(() => setApSaved(false), 3000)
      setApAudioFile(null); setApRecUrl(null); setApRecBlob(null); setApRecSecs(0)
      setApCount(''); setApDate(new Date().toISOString().slice(0, 10))
      if (apFileRef.current) apFileRef.current.value = ''
      await loadAandgebede()
    } catch (e) { setApError('Kon nie stoor nie: ' + e.message) }
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
          {installCount !== null && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 'auto', marginLeft: 10 }}>
              📲 {installCount} installe
            </span>
          )}
          <button className="admin-x" onClick={onClose}>✕</button>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            🎙️ Notas
          </button>
          <button className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
            📚 Boeke
          </button>
          <button className={`admin-tab ${activeTab === 'notif' ? 'active' : ''}`} onClick={() => setActiveTab('notif')}>
            🔔 Notifs
          </button>
          <button className={`admin-tab ${activeTab === 'aandgebed' ? 'active' : ''}`} onClick={() => setActiveTab('aandgebed')}>
            🙏 Gebed
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

              <div className="admin-section-title" style={{ marginTop: 28 }}>📧 Toets E-pos Aflewering</div>
              <div className="admin-field">
                <label>Boek</label>
                <select
                  value={testEmailBookId}
                  onChange={e => setTestEmailBookId(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #DDD5EC', fontSize: 14, background: '#FDFAF6' }}
                >
                  <option value="">— Kies 'n boek —</option>
                  {allBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>E-posadres</label>
                <input
                  type="email"
                  value={testEmailAddr}
                  onChange={e => setTestEmailAddr(e.target.value)}
                  placeholder="jou@epos.com"
                />
              </div>
              <button
                className="admin-save-btn"
                style={{ background: '#27713f' }}
                onClick={() => handleTestEmail(allBooks)}
                disabled={testEmailBusy}
              >
                {testEmailBusy ? 'Besig...' : '📧 Stuur toets-e-pos'}
              </button>
              {testEmailResult && (
                <div style={{ marginTop: 12, background: '#f5f5f5', borderRadius: 10, padding: '12px 14px' }}>
                  {testEmailResult.steps?.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, fontFamily: 'monospace', lineHeight: 1.8,
                      color: s.startsWith('✅') ? '#1a6b2e' : s.startsWith('❌') ? '#c0392b' : '#333' }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}

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

              <div style={{ fontSize: 12, fontFamily: 'monospace', background: '#f5f5f5', borderRadius: 6, padding: '8px 10px', marginBottom: 10, lineHeight: 1.8 }}>
                <div>Browser: {isSamsungBrowser ? '📱 Samsung Internet (Web Push)' : '✅ Chrome/Standaard (FCM)'}</div>
                <div>Toestemming: {
                  'Notification' in window
                    ? (Notification.permission === 'granted' ? '✅ granted' : Notification.permission === 'denied' ? '❌ denied' : '⏳ default')
                    : '❌ nie ondersteun'
                }</div>
                <div>SW: {swUrl ? swUrl.split('/').pop() : '⏳ laai...'}</div>
                  <div>FCM Token: {localStorage.getItem('fcmToken') ? `✅ ${localStorage.getItem('fcmToken').slice(0,25)}…` : '❌ geen'}</div>
              </div>

              {notifStatus === 'ok'       && <div className="admin-success">✅ Geregistreer! Tik nou "Stuur toets" om te bevestig.</div>}
              {notifStatus === 'testsent' && <div className="admin-success">✅ FCM aanvaar. Kyk jou kennisgewings nou.</div>}
              {notifStatus === 'fail'     && <div className="admin-error">❌ Misluk. Kyk instellings of kennisgewings toegelaat is.</div>}
              {notifStatus === 'denied'   && <div className="admin-error">❌ Toestemming geweier. Gaan na Instellings → Kennisgewings.</div>}
              {notifStatus === 'notoken'  && <div className="admin-error">❌ Geen token — tik eers Registreer.</div>}
              {notifDetail && <div style={{ fontSize: 11, fontFamily: 'monospace', background: '#eee', borderRadius: 4, padding: '4px 8px', marginTop: 4, wordBreak: 'break-all' }}>{notifDetail}</div>}

              <div className="admin-section-title" style={{ marginTop: 4, marginBottom: 8 }}>📣 Stuur boodskap aan almal</div>
              <div className="admin-field">
                <label>Titel *</label>
                <input
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="bv. Ek bid vir jou"
                  maxLength={60}
                />
              </div>
              <div className="admin-field">
                <label>Boodskap</label>
                <input
                  value={customBody}
                  onChange={e => setCustomBody(e.target.value)}
                  placeholder="bv. God is by jou vandag. Hy hoor jou gebede."
                  maxLength={120}
                />
              </div>
              <button
                className="admin-save-btn"
                style={{ background: '#5C4E8E', marginBottom: 4 }}
                onClick={handleSendAll}
                disabled={sendAllBusy || notifBusy}
              >
                {sendAllBusy ? 'Besig...' : '📣 Stuur nou aan almal'}
              </button>
              {sendAllResult && (
                <div style={{ fontSize: 13, background: '#f5f5f5', borderRadius: 8, padding: '8px 12px', marginBottom: 8,
                  color: sendAllResult.startsWith('✅') ? '#1a6b2e' : '#c0392b' }}>
                  {sendAllResult}
                </div>
              )}

              <button className="admin-save-btn" onClick={handleNotifSubscribe} disabled={notifBusy}>
                {notifBusy ? 'Besig...' : '🔔 Registreer / Herregistreer'}
              </button>

              <button className="admin-save-btn" style={{ background: '#27713f', marginTop: 4 }} onClick={handleNotifTest} disabled={notifBusy}>
                {notifBusy ? 'Besig...' : '📨 Stuur toets (app oop)'}
              </button>

              {(() => {
                const token = localStorage.getItem('fcmToken')
                if (!token) return null
                const url = `${window.location.origin}/api/test-notification?token=${encodeURIComponent(token)}&pin=2025`
                return (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Toets terwyl app TOE is:</div>
                    <button
                      className="admin-save-btn"
                      style={{ background: '#555', fontSize: 13 }}
                      onClick={() => navigator.clipboard.writeText(url).catch(() => {})}
                    >
                      📋 Kopieer toets-skakel
                    </button>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                      1. Tik hierbo om te kopieer<br/>
                      2. Maak die PWA toe (swipe weg)<br/>
                      3. Plak skakel in adresbalk → Enter
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── AANDGEBED TAB ── */}
          {activeTab === 'aandgebed' && (
            <>
              <div className="admin-section">
                <div className="admin-section-title">Laai aandgebed op</div>

                <label className="admin-label">Datum</label>
                <input
                  type="date"
                  className="admin-input"
                  value={apDate}
                  onChange={e => setApDate(e.target.value)}
                />

                <label className="admin-label">Aantal gebedsversoeke vandag</label>
                <input
                  type="number"
                  className="admin-input"
                  placeholder="bv. 47"
                  value={apCount}
                  onChange={e => setApCount(e.target.value)}
                  min="0"
                />

                <label className="admin-label">Oudio</label>
                <div className="record-row">
                  {!apRecording ? (
                    <button className="record-btn" onClick={startApRecording}>
                      🎙️ Neem op
                    </button>
                  ) : (
                    <button className="record-btn recording" onClick={stopApRecording}>
                      ⏹ Stop ({formatTime(apRecSecs)})
                    </button>
                  )}
                  <span className="record-or">of</span>
                  <label className="file-upload-label">
                    📁 Kies lêer
                    <input
                      ref={apFileRef}
                      type="file"
                      accept="audio/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0]
                        if (f) { setApAudioFile(f); setApRecUrl(null) }
                      }}
                    />
                  </label>
                </div>

                {apRecUrl && (
                  <audio src={apRecUrl} controls style={{ width: '100%', marginTop: 8 }} />
                )}
                {!apRecUrl && apAudioFile && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                    ✅ {apAudioFile.name}
                  </div>
                )}

                {apUploading && (
                  <div className="upload-progress">
                    <div className="upload-bar" style={{ width: `${apProgress}%` }} />
                    <span>{apProgress}%</span>
                  </div>
                )}

                {apError && <div className="admin-error">{apError}</div>}
                {apSaved  && <div className="admin-success">✅ Aandgebed gestoor!</div>}

                <button
                  className="admin-save-btn"
                  onClick={handleApSave}
                  disabled={apUploading || apRecording}
                >
                  {apUploading ? 'Besig...' : 'Stoor Aandgebed'}
                </button>
              </div>

              {apList.length > 0 && (
                <div className="admin-section">
                  <div className="admin-section-title">Vorige Aandgebede</div>
                  {apList.map(ap => (
                    <div key={ap.id} className="admin-note-row" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{ap.date}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ap.prayerCount} versoeke</div>
                      </div>
                      <button
                        className="admin-delete-btn"
                        onClick={async () => {
                          if (!window.confirm('Skrap hierdie aandgebed?')) return
                          try {
                            await deleteDoc(doc(db, 'aandgebede', ap.id))
                            setApList(prev => prev.filter(x => x.id !== ap.id))
                          } catch { alert('Kon nie skrap nie') }
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
