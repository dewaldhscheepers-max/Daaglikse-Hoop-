import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './NooimyModal.css'

export default function NooimyModal({ onClose }) {
  const [form, setForm] = useState({
    naam: '', gemeente: '', dorp: '', datum: '', tipe: '', telefoon: '', boodskap: ''
  })
  const [busy, setBusy]   = useState(false)
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function submit() {
    if (!form.naam.trim())     { setError('Voer asb jou naam in.'); return }
    if (!form.gemeente.trim()) { setError('Voer asb jou gemeente of organisasie se naam in.'); return }
    if (!form.telefoon.trim()) { setError('Voer asb jou kontaknommer in.'); return }

    setBusy(true)
    try {
      await addDoc(collection(db, 'preek_versoeke'), {
        ...form,
        createdAt: serverTimestamp()
      })
      setSent(true)
    } catch {
      setError('Iets het nie reg gegaan nie. Probeer asseblief weer.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="modal-backdrop nooimy-backdrop" onClick={onClose}>
        <div className="nooimy-card" onClick={e => e.stopPropagation()}>
          <div className="sent-icon">✉️</div>
          <h3 className="nooimy-title">Uitnodiging Ontvang!</h3>
          <p className="nooimy-sent-msg">
            Dankie, {form.naam.split(' ')[0]}. Ons het jou uitnodiging ontvang en sal so gou moontlik terugkom.
          </p>
          <button className="btn-primary nooimy-close-btn" onClick={onClose}>Klaar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop nooimy-backdrop" onClick={onClose}>
      <div className="nooimy-card" onClick={e => e.stopPropagation()}>
        <button className="nooimy-x" onClick={onClose}>✕</button>

        <div className="nooimy-icon">🎤</div>
        <h3 className="nooimy-title">Nooi My Om Te Preek</h3>
        <p className="nooimy-credibility">
          Dewald Scheepers bring boodskappe oor hoop, gedagtes, trauma, geloof en geestelike herstel.
        </p>

        <div className="nooimy-fields">
          <div className="field-group">
            <label>Naam *</label>
            <input type="text" placeholder="Jan van der Merwe" value={form.naam}
              onChange={e => update('naam', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Gemeente / Organisasie *</label>
            <input type="text" placeholder="NG Kerk Stellenbosch" value={form.gemeente}
              onChange={e => update('gemeente', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Dorp / Stad</label>
            <input type="text" placeholder="Kaapstad" value={form.dorp}
              onChange={e => update('dorp', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Tipe geleentheid</label>
            <input type="text" placeholder="Oggenddiens / Konferensie / Kamp" value={form.tipe}
              onChange={e => update('tipe', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Verkose datum</label>
            <input type="text" placeholder="bv. 15 Augustus 2025" value={form.datum}
              onChange={e => update('datum', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Kontaknommer *</label>
            <input type="tel" placeholder="082 000 0000" value={form.telefoon}
              onChange={e => update('telefoon', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Kort boodskap</label>
            <textarea rows={3} placeholder="Tema, tipe gehoor, grootte van geleentheid..." value={form.boodskap}
              onChange={e => update('boodskap', e.target.value)} />
          </div>
        </div>

        {error && <p className="nooimy-error">{error}</p>}

        <button className="btn-primary nooimy-submit" onClick={submit} disabled={busy}>
          {busy ? 'Besig om te stuur...' : 'Stuur Uitnodiging'}
        </button>
      </div>
    </div>
  )
}
