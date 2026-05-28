import { useState } from 'react'
import './NooimyModal.css'

export default function NooimyModal({ onClose }) {
  const [form, setForm]       = useState({ naam: '', epos: '', telefoon: '', gemeente: '', datum: '', boodskap: '' })
  const [busy, setBusy]       = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function submit() {
    if (!form.naam.trim())     { setError('Voer asb jou naam in.'); return }
    if (!form.epos.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.epos)) {
      setError("Voer asb 'n geldige e-posadres in."); return
    }
    if (!form.gemeente.trim()) { setError("Voer asb jou gemeente of geleentheid se naam in."); return }

    setBusy(true)
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'nooi-my', ...form }).toString()
      })
      setSent(true)
    } catch {
      setError('Iets het fout gegaan. Probeer asb weer.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="modal-backdrop nooimy-backdrop" onClick={onClose}>
        <div className="nooimy-card" onClick={e => e.stopPropagation()}>
          <div className="sent-icon">✉️</div>
          <h3 className="nooimy-title">Versoek Gestuur!</h3>
          <p className="nooimy-sent-msg">
            Dankie, {form.naam.split(' ')[0]}! Ek het jou versoek ontvang en sal so gou moontlik met jou in verbinding tree.
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
        <p className="nooimy-sub">Vul die vorm in en ek sal so gou moontlik terugkom na jou.</p>

        <div className="nooimy-fields">
          <div className="field-group">
            <label>Jou naam *</label>
            <input type="text" placeholder="Jan van der Merwe" value={form.naam}
              onChange={e => update('naam', e.target.value)} />
          </div>
          <div className="field-group">
            <label>E-posadres *</label>
            <input type="email" placeholder="jan@kerk.co.za" value={form.epos}
              onChange={e => update('epos', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Telefoonnommer</label>
            <input type="tel" placeholder="082 000 0000" value={form.telefoon}
              onChange={e => update('telefoon', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Gemeente of geleentheid *</label>
            <input type="text" placeholder="NG Kerk Stellenbosch / Konferensie naam" value={form.gemeente}
              onChange={e => update('gemeente', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Verkose datum</label>
            <input type="text" placeholder="bv. 15 Augustus 2025 of 'n naweek in Julie" value={form.datum}
              onChange={e => update('datum', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Enige iets anders?</label>
            <textarea rows={3} placeholder="Tema, tipe geleentheid, grootte van gehoor..." value={form.boodskap}
              onChange={e => update('boodskap', e.target.value)} />
          </div>
        </div>

        {error && <p className="nooimy-error">{error}</p>}

        <button className="btn-primary nooimy-submit" onClick={submit} disabled={busy}>
          {busy ? 'Besig...' : 'Stuur Versoek'}
        </button>
      </div>
    </div>
  )
}
