import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import './KinderAdmin.css'

const PIN = '2025'

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function KinderAdmin() {
  const [books,         setBooks]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editingBook,   setEditingBook]   = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [uploadMsg,     setUploadMsg]     = useState('')
  const [saveMsg,       setSaveMsg]       = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { loadBooks() }, [])

  async function loadBooks() {
    setLoading(true)
    try {
      const r    = await fetch('/api/kinder-boeke-list')
      const data = await r.json()
      setBooks(data.books || [])
    } catch {
      setBooks([])
    }
    setLoading(false)
  }

  function openNewBook() {
    setEditingBook({ id: '', title: '', description: '', ageRange: '2–5 jaar', pages: [], status: 'draft' })
    setSaveMsg('')
    setDeleteConfirm(false)
  }

  function openEditBook(book) {
    setEditingBook({ ...book, pages: [...(book.pages || [])] })
    setSaveMsg('')
    setDeleteConfirm(false)
  }

  function goBack() {
    setEditingBook(null)
    setSaveMsg('')
    setDeleteConfirm(false)
    loadBooks()
  }

  // Derive a temporary bookId for the upload path (before the book is saved)
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
    setUploading(true)
    const uploaded = []

    for (let i = 0; i < files.length; i++) {
      setUploadMsg(`Laai op... (${i + 1} van ${files.length})`)
      const file = files[i]
      try {
        const base64   = await readAsBase64(file)
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filename = `${Date.now()}_${i}_${safeName}`
        const r = await fetch('/api/kinder-upload', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ pin: PIN, bookId, filename, imageBase64: base64 }),
        })
        const data = await r.json()
        if (data.url) uploaded.push(data.url)
      } catch {
        // skip failed uploads silently
      }
    }

    setEditingBook(prev => ({ ...prev, pages: [...(prev.pages || []), ...uploaded] }))
    setUploading(false)
    setUploadMsg('')
  }

  async function handleSave() {
    if (!(editingBook.title || '').trim()) { alert('Titel is verpligtend'); return }
    setSaving(true)
    setSaveMsg('')
    try {
      const r = await fetch('/api/kinder-boek-save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pin: PIN, book: editingBook }),
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
          <div className="admin-loading">Laai boeke...</div>
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
                  <span className={`ka-badge ${book.status === 'published' ? 'ka-badge-pub' : 'ka-badge-draft'}`}>
                    {book.status === 'published' ? 'Gepubliseer' : 'Konsep'}
                  </span>
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
  const pageCount = (editingBook.pages || []).length
  const isSaveMsgError = saveMsg.startsWith('Fout') || saveMsg.startsWith('Netwerk')

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

      {/* ── Pages ── */}
      <div className="ka-pages-section">
        <div className="ka-pages-header">
          <span className="ka-pages-title">Bladsye ({pageCount})</span>
          {pageCount > 0 && (
            <span className="ka-pages-hint">Eerste bladsy = voorblad</span>
          )}
        </div>

        {pageCount > 0 && (
          <div className="ka-pages-scroll">
            {(editingBook.pages || []).map((url, idx) => (
              <div key={idx} className="ka-page-item">
                <img src={url} alt={`Bladsy ${idx + 1}`} className="ka-page-img" />
                <div className="ka-page-num">{idx + 1}</div>
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
          <button className="ka-upload-btn" onClick={() => fileInputRef.current?.click()}>
            + Voeg bladsye by
          </button>
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
        disabled={saving || uploading}
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
