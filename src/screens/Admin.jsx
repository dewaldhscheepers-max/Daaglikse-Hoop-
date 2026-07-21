import { useState, useEffect, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, query, orderBy, getDocs, getDoc, setDoc, deleteDoc, doc, onSnapshot, addDoc, limit, where, Timestamp, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { subscribeToNotifications, isSamsungBrowser } from '../firebase'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import './Admin.css'

const ADMIN_PIN = '2025'

function extractYoutubeId(input) {
  const s = (input || '').trim()
  const shorts = s.match(/shorts\/([a-zA-Z0-9_-]+)/)
  if (shorts) return shorts[1]
  const watch = s.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watch) return watch[1]
  const youtu = s.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (youtu) return youtu[1]
  const embed = s.match(/embed\/([a-zA-Z0-9_-]+)/)
  if (embed) return embed[1]
  return s
}

export default function Admin({ onClose }) {
  const [pin, setPin]           = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'books' | 'notif' | 'aandgebed' | 'video'

  // ── Saturday video state ──
  const [svActive,   setSvActive]   = useState(false)
  const [svVideoId,  setSvVideoId]  = useState('')
  const [svTitle,    setSvTitle]    = useState('')
  const [svSubtitle, setSvSubtitle] = useState('')
  const [svSaving,   setSvSaving]   = useState(false)
  const [svSaved,    setSvSaved]    = useState(false)


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

  // ── Wallpaper state ──
  const [wpUploading, setWpUploading] = useState(null)
  const [wpProgress,  setWpProgress]  = useState(0)
  const [wpSaved,     setWpSaved]     = useState(null)
  const [wpTarget,    setWpTarget]    = useState(null)
  const wpInputRef = useRef(null)

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
    getDoc(doc(db, 'config', 'saturdayVideo')).then(d => {
      if (d.exists()) {
        setSvActive(d.data().active || false)
        setSvVideoId(d.data().videoId || '')
        setSvTitle(d.data().title || '')
        setSvSubtitle(d.data().subtitle || '')
      }
    }).catch(() => {})
  }, [unlocked])

  async function handleSvSave() {
    setSvSaving(true)
    await setDoc(doc(db, 'config', 'saturdayVideo'), { active: svActive, videoId: extractYoutubeId(svVideoId), title: svTitle.trim(), subtitle: svSubtitle.trim() })
    setSvSaving(false)
    setSvSaved(true)
    setTimeout(() => setSvSaved(false), 2500)
  }

  useEffect(() => {
    if (!unlocked) return
    fetch('/api/count-install?pin=2025')
      .then(r => r.json())
      .then(d => setInstallCount(d.total ?? 0))
      .catch(() => {})
  }, [unlocked])

  // ── Bulk email state ──
  const [emailCount,     setEmailCount]     = useState(null)
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [bulkSubject,    setBulkSubject]    = useState('')
  const [bulkBody,       setBulkBody]       = useState('')
  const [bulkSending,    setBulkSending]    = useState(false)
  const [bulkResult,     setBulkResult]     = useState(null)
  const [bulkImporting,  setBulkImporting]  = useState(false)
  const [bulkImported,   setBulkImported]   = useState(false)
  const [processResult,  setProcessResult]  = useState(null)

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
  const [newValue, setNewValue]   = useState('')
  const [newEmoji, setNewEmoji]   = useState('📚')
  const [addingBook, setAddingBook] = useState(false)
  const [bookAdded, setBookAdded] = useState(false)

  function getAdminTodaySAST() {
    return new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10)
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }

  useEffect(() => {
    if (!unlocked) return
    loadNotes()
    const unsub = onSnapshot(collection(db, 'books'), snap => {
      const overrides = {}
      snap.docs.forEach(d => { overrides[d.id] = d.data() })
      setBookOverrides(overrides)
    })
    // Load email subscriber count and active campaign via API (avoids Firestore permission errors)
    fetch('/api/email-status')
      .then(r => r.json())
      .then(d => { setEmailCount(d.emailCount || 0); if (d.activeCampaign) setActiveCampaign(d.activeCampaign) })
      .catch(() => {})
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
        free:   true,
        value:  parseFloat(newValue) || 50,
        emoji:  newEmoji || '📚',
        color:  '#EDE8F8',
      })
      setNewTitle(''); setNewDesc(''); setNewValue(''); setNewEmoji('📚')
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

  // ── Bulk email handlers ──
  async function handleImportEmails() {
    setBulkImporting(true)
    try {
      const r = await fetch('/api/import-emails', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '2025' }),
      })
      const data = await r.json()
      if (r.ok) { setBulkImported(true); setEmailCount(data.imported) }
      else alert('Fout: ' + (data.error || 'Onbekend'))
    } catch (e) { alert('Fout: ' + e.message) }
    setBulkImporting(false)
  }

  async function handleBulkSend() {
    if (!bulkSubject.trim() || !bulkBody.trim()) { alert('Onderwerp en boodskap is verpligtend'); return }
    setBulkSending(true); setBulkResult(null)
    try {
      const r = await fetch('/api/send-bulk-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '2025', subject: bulkSubject, body: bulkBody }),
      })
      const data = await r.json()
      if (r.ok) {
        setBulkResult(data); setBulkSubject(''); setBulkBody('')
        if (data.remaining > 0) {
          setActiveCampaign({ id: data.campaignId, subject: bulkSubject.trim(), sentCount: data.sentCount, total: data.total, remaining: data.remaining })
        }
      } else {
        alert('Fout: ' + (data.error || 'Onbekend'))
      }
    } catch (e) { alert('Fout: ' + e.message) }
    setBulkSending(false)
  }

  async function handleProcessQueue() {
    setProcessResult(null)
    try {
      const r = await fetch('/api/process-email-queue?secret=DaaglikseHoop2025Cron')
      const data = await r.json()
      setProcessResult(data)
      if (data.remaining > 0) {
        setActiveCampaign(prev => prev ? { ...prev, sentCount: data.totalSent, remaining: data.remaining } : null)
      } else {
        setActiveCampaign(null)
      }
    } catch (e) { alert('Fout: ' + e.message) }
  }

  // ── Upload wallpaper for a voice note ──
  function triggerWpUpload(note) { setWpTarget(note); wpInputRef.current?.click() }

  async function handleWpUpload(e) {
    const file = e.target.files[0]
    if (!file || !wpTarget) return
    e.target.value = ''
    const note = wpTarget
    setWpUploading(note.id); setWpProgress(0)
    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
      const sRef = ref(storage, `covers/wp_${note.id}.${ext}`)
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(sRef, file)
        task.on('state_changed',
          s => setWpProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          reject,
          async () => {
            const wallpaperUrl = await getDownloadURL(task.snapshot.ref)
            await setDoc(doc(db, 'notes', note.id), { wallpaperUrl }, { merge: true })
            resolve()
          }
        )
      })
      setWpSaved(note.id)
      setTimeout(() => { setWpSaved(null); loadNotes() }, 3000)
    } catch (err) { alert('Wallpaper upload misluk: ' + err.message) }
    setWpUploading(null); setWpTarget(null)
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
          <button className={`admin-tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
            ✉️ E-pos
          </button>
          <button className={`admin-tab ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
            📹 Video
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
                <input ref={wpInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWpUpload} />
                {notesLoading ? <div className="admin-loading">Laai notas...</div>
                  : notes.map(note => (
                    <div key={note.id} className="admin-note-row">
                      <div className="admin-note-info">
                        <div className="admin-note-title">{note.title}</div>
                        <div className="admin-note-meta">
                          {[note.scripture, note.series].filter(Boolean).join(' · ') ||
                            new Date((note.publishedAt?.seconds || 0) * 1000).toLocaleDateString('af')}
                          {note.wallpaperUrl && ' · 🖼 ✓'}
                        </div>
                      </div>
                      {deleteConfirm === note.id ? (
                        <div className="admin-delete-confirm">
                          <button className="admin-delete-yes" onClick={() => handleDelete(note.id)}>Ja, skrap</button>
                          <button className="admin-delete-no" onClick={() => setDeleteConfirm(null)}>Nee</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            className="admin-pdf-btn"
                            onClick={() => triggerWpUpload(note)}
                            disabled={wpUploading === note.id}
                            title="Laai wallpaper op"
                          >
                            {wpUploading === note.id ? `🖼 ${wpProgress}%`
                             : wpSaved === note.id ? '✅'
                             : note.wallpaperUrl ? '🖼 ↑' : '🖼 +'}
                          </button>
                          <button className="admin-delete-btn" onClick={() => setDeleteConfirm(note.id)}>🗑</button>
                        </div>
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
              <div className="admin-field">
                <label>Rand Waarde vir teller (R)</label>
                <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="bv. 50" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Watter bedrag tel op in die "hoop weggegee" teller?</span>
              </div>
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
                        {`🎁 Gratis${book.value ? ` · Teller R${book.value}` : book.price ? ` · Teller R${book.price}` : ''}`}
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
                      <button
                        className="admin-pdf-btn"
                        onClick={() => setDoc(doc(db, 'books', book.id), { featured: !book.featured }, { merge: true })}
                        title="Wys 'n oranje lyn om hierdie boek se kaart"
                      >
                        {book.featured ? '★ Uitgelig' : '☆ Lyn'}
                      </button>
                    </div>
                  </div>
                )
              })}

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

          {/* ── EMAIL TAB ── */}
          {activeTab === 'email' && (
            <div className="admin-section">
              <div className="admin-section-title">
                ✉️ E-pos Inskrywers
                {emailCount !== null && (
                  <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                    ({emailCount} inskrywers)
                  </span>
                )}
              </div>

              {/* Import existing list */}
              {!bulkImported && (emailCount === 0 || emailCount === null) && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-books-note">Geen inskrywers gevind nie. Laai die 836 bestaande adresse eenmalig op:</div>
                  <button className="admin-save-btn" onClick={handleImportEmails} disabled={bulkImporting}>
                    {bulkImporting ? 'Besig om in te voer...' : '⬆ Voer 836 e-posadresse in'}
                  </button>
                </div>
              )}
              {bulkImported && <div className="admin-success">✅ {emailCount} adresse ingevoer!</div>}

              {/* Active campaign progress */}
              {activeCampaign && (
                <div style={{ background: '#f8f5ff', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                    Aktiewe kampanje: "{activeCampaign.subject}"
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                    {activeCampaign.sentCount} / {activeCampaign.total} gestuur
                    {activeCampaign.remaining > 0 &&
                      ` · nog ${Math.ceil(activeCampaign.remaining / 100)} dae oor`}
                  </div>
                  <div style={{ background: '#e8e4f0', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{
                      background: '#5C4E8E', height: '100%',
                      width: `${Math.round(((activeCampaign.sentCount || 0) / (activeCampaign.total || 1)) * 100)}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <button className="admin-save-btn" style={{ background: '#27713f', marginTop: 0 }} onClick={handleProcessQueue}>
                    Stuur volgende 100 nou
                  </button>
                  {processResult && (
                    <div className="admin-success" style={{ marginTop: 8 }}>
                      ✅ {processResult.sent} gestuur · {processResult.remaining} oor
                      {processResult.message === 'Kampanje voltooi!' && ' 🎉 Klaar!'}
                    </div>
                  )}
                  <div className="admin-books-note" style={{ marginTop: 8 }}>
                    Die stelsel stuur ook outomaties elke oggend om 9:00 die volgende 100.
                  </div>
                </div>
              )}

              {/* Compose form — only when no active campaign */}
              {!activeCampaign && emailCount > 0 && (
                <>
                  <div className="admin-section-title" style={{ marginTop: 8 }}>Nuwe e-pos stuur</div>
                  <div className="admin-field">
                    <label>Onderwerp</label>
                    <input
                      value={bulkSubject}
                      onChange={e => setBulkSubject(e.target.value)}
                      placeholder="bv. 'n Boodskap van Dewald"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Boodskap</label>
                    <textarea
                      value={bulkBody}
                      onChange={e => setBulkBody(e.target.value)}
                      placeholder="Skryf jou boodskap hier...&#10;&#10;Gebruik 'n leë reël tussen paragrawe."
                      rows={9}
                      style={{
                        resize: 'vertical', fontFamily: 'inherit', fontSize: 14,
                        padding: '10px 12px', borderRadius: 10, border: '1px solid #DDD5EC',
                        width: '100%', boxSizing: 'border-box', lineHeight: 1.6,
                      }}
                    />
                  </div>
                  {bulkResult && (
                    <div className="admin-success">
                      ✅ {bulkResult.sentCount} e-posse gestuur
                      {bulkResult.remaining > 0 && ` · ${bulkResult.remaining} oor (${bulkResult.daysLeft} dae)`}
                    </div>
                  )}
                  <button className="admin-save-btn" onClick={handleBulkSend} disabled={bulkSending}>
                    {bulkSending ? 'Besig om te stuur...' : `Stuur na alle ${emailCount} inskrywers`}
                  </button>
                  <div className="admin-books-note">
                    Alle e-posse gaan onmiddellik uit.
                  </div>
                </>
              )}
            </div>
          )}


          {activeTab === 'video' && (
            <div className="admin-section">
              <div className="admin-section-title">📹 Saterdag Videogebed</div>
              <p className="admin-books-note">
                Wys 'n tydelike videogebed bo-aan die Luister bladsy. Skakel aan Saterdag, af Maandag.
              </p>
              <div className="admin-field">
                <label>Wys video</label>
                <label className="sv-toggle-row">
                  <input
                    type="checkbox"
                    checked={svActive}
                    onChange={e => setSvActive(e.target.checked)}
                  />
                  <span>{svActive ? '✅ Aan — video wys nou' : '⬜ Af — video is versteek'}</span>
                </label>
              </div>
              <div className="admin-field">
                <label>Titel</label>
                <input
                  value={svTitle}
                  onChange={e => setSvTitle(e.target.value)}
                  placeholder="bv. Naweekgebed vir jou / Weekgebed / Maandgebed"
                />
              </div>
              <div className="admin-field">
                <label>Onderskrif</label>
                <input
                  value={svSubtitle}
                  onChange={e => setSvSubtitle(e.target.value)}
                  placeholder="bv. Rustelose Gedagtes Dag 7 gaan Maandag voort..."
                />
              </div>
              <div className="admin-field">
                <label>YouTube Video ID</label>
                <input
                  value={svVideoId}
                  onChange={e => setSvVideoId(e.target.value)}
                  placeholder="bv. LK-kieYHZJA"
                />
                <div className="admin-books-note" style={{ marginTop: 6 }}>
                  Kopieer net die ID na "?v=" in die YouTube skakel, of die laaste deel van 'n Shorts skakel.
                </div>
              </div>
              {svSaved && <div className="admin-success">✅ Gestoor!</div>}
              <button className="admin-save-btn" onClick={handleSvSave} disabled={svSaving || !svVideoId.trim()}>
                {svSaving ? 'Besig om te stoor...' : 'Stoor'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
