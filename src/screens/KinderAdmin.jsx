import { useState, useEffect, useRef } from 'react'
import { db, storage, auth } from '../firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { signInAnonymously } from 'firebase/auth'
import { KINDER_BOEKE } from '../data/kinderBoeke'
import './KinderAdmin.css'

async function ensureAuth() {
  if (!auth.currentUser) await signInAnonymously(auth)
}

function compressImage(file, maxWidth = 1500, quality = 0.82) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio  = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export default function KinderAdmin({ geheim = '' }) {
  const [books,          setBooks]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [editingBook,    setEditingBook]    = useState(null)
  const [saving,         setSaving]         = useState(false)
  const [uploading,      setUploading]      = useState(false)
  const [uploadMsg,      setUploadMsg]      = useState('')
  const [audioUploading, setAudioUploading] = useState(false)
  const [audioMsg,       setAudioMsg]       = useState('')
  const [saveMsg,        setSaveMsg]        = useState('')
  const [deleteConfirm,  setDeleteConfirm]  = useState(false)
  const fileInputRef  = useRef(null)
  const audioInputRef = useRef(null)

  useEffect(() => { loadBooks() }, [])

  async function seedMissingBooks(fetchedBooks) {
    const existingIds = new Set(fetchedBooks.map(b => b.id))
    const missing = KINDER_BOEKE.filter(b => !existingIds.has(b.id))
    if (!missing.length) return fetchedBooks

    for (const book of missing) {
      try {
        await fetch('/api/kinder-boek-save', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
          body: JSON.stringify({
            book: {
              id:          book.id,
              title:       book.title,
              description: book.description,
              ageRange:    book.ageRange,
              cover:       book.cover,
              pages:       book.pages,
              status:      'published',
              audioUrl:    '',
            },
          }),
        })
      } catch {}
    }

    const r    = await fetch('/api/kinder-boeke-list')
    const data = await r.json()
    return data.books || fetchedBooks
  }

  async function loadBooks() {
    setLoading(true)
    try {
      const r      = await fetch('/api/kinder-boeke-list')
      const data   = await r.json()
      const seeded = await seedMissingBooks(data.books || [])
      setBooks(seeded)
    } catch {
      setBooks([])
    }
    setLoading(false)
  }

  function openNewBook() {
    setEditingBook({ id: '', title: '', description: '', ageRange: '2–5 jaar', pages: [], status: 'draft', audioUrl: '' })
    setSaveMsg('')
    setAudioMsg('')
    setDeleteConfirm(false)
  }

  function openEditBook(book) {
    setEditingBook({ audioUrl: '', ...book, pages: [...(book.pages || [])] })
    setSaveMsg('')
    setAudioMsg('')
    setDeleteConfirm(false)
  }

  function goBack() {
    setEditingBook(null)
    setSaveMsg('')
    setAudioMsg('')
    setDeleteConfirm(false)
    loadBooks()
  }

  function getBookId() {
    if (editingBook.id) return editingBook.id
    return (editingBook.title || '').trim().toLowerCase()
      .replace(/[àáâäã]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôöõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
      || ('boek-' + Date.now())
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    e.target.value = ''

    const bookId = getBookId()
    if (!bookId) { alert('Voer eers die boektitel in'); return }

    setUploading(true)
    setUploadMsg('Aanmeld...')
    const uploaded = []
    let lastError = ''

    try { await ensureAuth() } catch (err) {
      setUploading(false)
      setUploadMsg('Aanmeldfout: ' + err.message)
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        setUploadMsg(`Komprimeer prent ${i + 1} van ${files.length}...`)
        const blob = await compressImage(file)
        if (!blob) { lastError = 'Kon nie prent komprimeer nie'; continue }
        const sizeKB  = Math.round(blob.size / 1024)
        const filename = `page_${String(Date.now()).slice(-6)}_${String(i + 1).padStart(3, '0')}.jpg`
        setUploadMsg(`Stuur ${sizeKB}KB... (${i + 1} van ${files.length})`)
        const storageRef = ref(storage, `kinder-boeke/${bookId}/${filename}`)
        await new Promise((resolve, reject) => {
          uploadBytesResumable(storageRef, blob, { contentType: 'image/jpeg' })
            .on('state_changed', null, reject, resolve)
        })
        uploaded.push(await getDownloadURL(storageRef))
      } catch (err) {
        lastError = `Upload misluk: ${err.message}`
      }
    }

    setEditingBook(prev => ({ ...prev, pages: [...(prev.pages || []), ...uploaded] }))
    setUploading(false)
    setUploadMsg(uploaded.length ? `✅ ${uploaded.length} bladsy(e) opgelaai` : (lastError || 'Geen bladsye opgelaai nie'))
    setTimeout(() => setUploadMsg(''), 4000)
  }

  async function handleAudioUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    const bookId = getBookId()
    if (!bookId) { alert('Voer eers die boektitel in'); return }

    setAudioUploading(true)
    setAudioMsg('Stemopname word opgelaai...')

    try {
      await ensureAuth()
      const ext        = file.name.split('.').pop().toLowerCase() || 'mp3'
      const storageRef = ref(storage, `kinder-boeke/${bookId}/audio.${ext}`)
      await new Promise((resolve, reject) => {
        uploadBytesResumable(storageRef, file)
          .on('state_changed', null, reject, resolve)
      })
      const url = await getDownloadURL(storageRef)
      setEditingBook(prev => ({ ...prev, audioUrl: url }))
      setAudioMsg('✅ Opgelaai! Stoor die boek om te bevestig.')
    } catch (err) {
      setAudioMsg('Fout: ' + err.message)
    }

    setAudioUploading(false)
  }

  async function handleSave() {
    if (!(editingBook.title || '').trim()) { alert('Titel is verpligtend'); return }
    setSaving(true)
    setSaveMsg('')
    try {
      const r = await fetch('/api/kinder-boek-save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
        body:    JSON.stringify({ book: editingBook }),
      })
      const data = await r.json()
      if (data.ok) {
        setEditingBook(prev => ({ ...prev, id: data.id }))
        setSaveMsg('Gestoor!')
        setTimeout(() => setSaveMsg(''), 3000)
        loadBooks()
      } else {
        setSaveMsg('Fout: ' + (data.error || 'Onbekend'))
      }
    } catch (e) {
      setSaveMsg('Netwerkfout: ' + e.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editingBook.id) { goBack(); return }
    try {
      await deleteDoc(doc(db, 'kinderBoeke', editingBook.id))
      goBack()
    } catch (e) {
      alert('Kon nie verwyder nie: ' + e.message)
    }
    setDeleteConfirm(false)
  }

  function movePage(idx, dir) {
    const pages  = [...(editingBook.pages || [])]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= pages.length) return
    ;[pages[idx], pages[newIdx]] = [pages[newIdx], pages[idx]]
    setEditingBook(prev => ({ ...prev, pages }))
  }

  function removePage(idx) {
    setEditingBook(prev => ({
      ...prev,
      pages: (prev.pages || []).filter((_, i) => i !== idx),
    }))
  }

  /* ── LIST VIEW ── */
  if (!editingBook) {
    return (
      <div className="ka-wrap">
        <div className="ka-list-header">
          <span className="ka-list-title">Kinderboeke</span>
          <button className="ka-new-btn" onClick={openNewBook}>+ Nuwe Boek</button>
        </div>

        {loading ? (
          <div className="admin-loading">Boeke word gelaai en gesinkroniseer...</div>
        ) : books.length === 0 ? (
          <div className="ka-empty">Geen boeke nie. Skep die eerste een.</div>
        ) : (
          <div className="ka-book-list">
            {books.map(book => (
              <div key={book.id} className="ka-book-row">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="ka-list-thumb" />
                ) : (
                  <div className="ka-list-thumb-ph">📖</div>
                )}
                <div className="ka-book-info">
                  <div className="ka-book-title">{book.title || '(Sonder titel)'}</div>
                  <div className="ka-book-meta">
                    <span className={`ka-badge ${book.status === 'published' ? 'ka-badge-pub' : 'ka-badge-draft'}`}>
                      {book.status === 'published' ? 'Gepubliseer' : 'Konsep'}
                    </span>
                    {book.audioUrl && <span className="ka-audio-badge">🎵 Oudio</span>}
                  </div>
                </div>
                <button className="ka-edit-btn" onClick={() => openEditBook(book)}>Wysig</button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ── EDIT VIEW ── */
  const pageCount      = (editingBook.pages || []).length
  const isSaveMsgError = saveMsg.startsWith('Fout') || saveMsg.startsWith('Netwerk')
  const isAudioError   = audioMsg.startsWith('Fout') || audioMsg.startsWith('Netwerk') || audioMsg.startsWith('Lêer')

  return (
    <div className="ka-wrap">
      <button className="ka-back-btn" onClick={goBack}>← Terug</button>

      <div className="admin-field">
        <label>Titel</label>
        <input
          value={editingBook.title}
          onChange={e => setEditingBook(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Boektitel..."
        />
      </div>

      <div className="admin-field">
        <label>Beskrywing</label>
        <textarea
          className="ka-textarea"
          value={editingBook.description}
          onChange={e => setEditingBook(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Kort beskrywing van die boek..."
          rows={3}
        />
      </div>

      <div className="admin-field">
        <label>Ouderdomsgroep</label>
        <input
          value={editingBook.ageRange}
          onChange={e => setEditingBook(prev => ({ ...prev, ageRange: e.target.value }))}
          placeholder="bv. 2–5 jaar"
        />
      </div>

      <div className="admin-field">
        <label>Status</label>
        <select
          className="ka-select"
          value={editingBook.status}
          onChange={e => setEditingBook(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="draft">Konsep</option>
          <option value="published">Gepubliseer</option>
        </select>
      </div>

      {/* ── Stemopname / Audio ── */}
      <div className="ka-audio-section">
        <div className="ka-pages-header">
          <span className="ka-pages-title">🎵 Stemopname</span>
          <span className="ka-pages-hint">MP3 of M4A · maks 10MB</span>
        </div>

        {editingBook.audioUrl ? (
          <div className="ka-audio-current">
            <audio controls src={editingBook.audioUrl} className="ka-audio-player" />
            <button
              className="ka-audio-remove"
              onClick={() => { setEditingBook(prev => ({ ...prev, audioUrl: '' })); setAudioMsg('') }}
            >
              Verwyder oudio
            </button>
          </div>
        ) : null}

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/mp4,audio/m4a,.mp3,.m4a"
          style={{ display: 'none' }}
          onChange={handleAudioUpload}
        />

        {audioUploading ? (
          <div className="ka-upload-msg">{audioMsg}</div>
        ) : (
          <button className="ka-upload-btn" onClick={() => audioInputRef.current?.click()}>
            {editingBook.audioUrl ? '↻ Vervang stemopname' : '+ Laai stemopname op'}
          </button>
        )}

        {audioMsg && !audioUploading && (
          <div className={isAudioError ? 'admin-error' : 'admin-success'}>{audioMsg}</div>
        )}
      </div>

      {/* ── Bladsye ── */}
      <div className="ka-pages-section">
        <div className="ka-pages-header">
          <span className="ka-pages-title">Bladsye ({pageCount})</span>
          {pageCount > 0 && (
            <span className="ka-pages-hint">Eerste = voorblad · gebruik ↑↓ vir volgorde</span>
          )}
        </div>

        {pageCount > 0 && (
          <div className="ka-pages-scroll">
            {(editingBook.pages || []).map((url, idx) => (
              <div key={idx} className="ka-page-item">
                <img src={url} alt={`Bladsy ${idx + 1}`} className="ka-page-img" />
                <div className="ka-page-num">
                  {idx === 0 ? 'Voorblad' : `Bladsy ${idx}`}
                </div>
                <div className="ka-page-btns">
                  <button
                    className="ka-pg-btn"
                    onClick={() => movePage(idx, -1)}
                    disabled={idx === 0}
                    title="Skuif op"
                  >↑</button>
                  <button
                    className="ka-pg-btn"
                    onClick={() => movePage(idx, 1)}
                    disabled={idx === pageCount - 1}
                    title="Skuif af"
                  >↓</button>
                  <button
                    className="ka-pg-btn ka-pg-remove"
                    onClick={() => removePage(idx)}
                    title="Verwyder"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {uploading ? (
          <div className="ka-upload-msg">{uploadMsg}</div>
        ) : (
          <>
            <button className="ka-upload-btn" onClick={() => fileInputRef.current?.click()}>
              + Voeg bladsye by (in volgorde)
            </button>
            {uploadMsg && <div className="admin-success">{uploadMsg}</div>}
          </>
        )}
      </div>

      {saveMsg ? (
        <div className={isSaveMsgError ? 'admin-error' : 'admin-success'}>
          {isSaveMsgError ? saveMsg : '✅ ' + saveMsg}
        </div>
      ) : null}

      <button
        className="admin-save-btn"
        onClick={handleSave}
        disabled={saving || uploading || audioUploading}
      >
        {saving ? 'Stoor...' : 'Stoor'}
      </button>

      {editingBook.id && (
        <div className="ka-danger">
          {deleteConfirm ? (
            <div className="ka-del-confirm">
              <p className="ka-del-q">Seker jy wil hierdie boek permanent verwyder?</p>
              <div className="ka-del-btns">
                <button className="ka-del-yes" onClick={handleDelete}>Ja, verwyder</button>
                <button className="ka-del-no" onClick={() => setDeleteConfirm(false)}>Nee, kanselleer</button>
              </div>
            </div>
          ) : (
            <button className="ka-del-btn" onClick={() => setDeleteConfirm(true)}>
              Verwyder boek
            </button>
          )}
        </div>
      )}
    </div>
  )
}
