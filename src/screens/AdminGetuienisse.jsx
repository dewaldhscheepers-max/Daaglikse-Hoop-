/* ── Admin → 🕊️ Getuienisse ──
 *
 * Dewald, 1 November 2026: *"Delete die 2 uit die getuienis afdeling op
 * bidsaam... dis gebede nie getuienisse nie."* Daar was geen manier om een
 * weg te kry nie.
 *
 * `firestore.rules` laat GEEN uitvee van `testimonies` toe nie (`allow delete:
 * if false`), en dit bly so. 'n Getuienis word WEGGESTEEK: `reported: true` is
 * presies die vlag waarop Bid Saam reeds filter (`!t.reported`), en
 * `verwyderDeurAdmin` sê dat dit 'n besluit was en nie 'n gebruiker se rapport
 * nie. Niks gaan verlore nie; die woorde bly in Firestore.
 *
 * "Skuif na Bid Saam" is vir presies hierdie geval: iemand het om GEBED gevra
 * op die verkeerde plek. Dan gaan sy woorde op die gebedsmuur deur dieselfde
 * `magDeel()`-keuring as die muur se eie vorm, en die getuienis word
 * weggesteek — sodat hy steeds gebed kry.
 */
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, limit, getDocs, updateDoc, addDoc, doc, serverTimestamp } from 'firebase/firestore'
import { magDeel } from '../data/gebedDeel'

const TYDGRENS = 12000

function datumVan(t) {
  const s = t && t.createdAt && (t.createdAt.seconds || (t.createdAt.toDate && t.createdAt.toDate().getTime() / 1000))
  if (!s) return ''
  return new Date(s * 1000).toLocaleDateString('af-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AdminGetuienisse() {
  const [lys, setLys]       = useState(null)   // null = laai nog
  const [fout, setFout]     = useState('')
  const [besig, setBesig]   = useState('')     // id van die een wat besig is
  const [boodskap, setBoodskap] = useState('')

  async function laai() {
    setFout('')
    let klok
    try {
      const snap = await Promise.race([
        getDocs(query(collection(db, 'testimonies'), orderBy('createdAt', 'desc'), limit(100))),
        new Promise((_, weier) => { klok = setTimeout(() => weier(new Error('tydgrens')), TYDGRENS) }),
      ])
      setLys(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      setFout('Kon nie die getuienisse laai nie. Probeer weer.')
      setLys(l => l || [])
    } finally {
      clearTimeout(klok)
    }
  }
  useEffect(() => { laai() }, [])

  async function steekWeg(t) {
    await updateDoc(doc(db, 'testimonies', t.id), { reported: true, verwyderDeurAdmin: true })
    setLys(l => l.map(x => x.id === t.id ? { ...x, reported: true, verwyderDeurAdmin: true } : x))
  }

  async function verwyder(t) {
    if (!window.confirm('Verwyder hierdie getuienis van Bid Saam af?')) return
    setBesig(t.id); setBoodskap('')
    try { await steekWeg(t); setBoodskap('Verwyder.') }
    catch { setBoodskap('Kon nie verwyder nie. Probeer weer.') }
    setBesig('')
  }

  async function skuif(t) {
    if (!window.confirm('Skuif hierdie na die Bid Saam-gebedsmuur, en haal dit uit die getuienisse?')) return
    setBesig(t.id); setBoodskap('')
    try {
      const keuring = magDeel({ teks: t.text || '' })
      await addDoc(collection(db, 'prayers'), {
        text: String(t.text || '').trim(),
        prayedCount: 0,
        createdAt: serverTimestamp(),
        reported: false,
        deelbaar: keuring.mag,
      })
      await steekWeg(t)
      setBoodskap('Op die gebedsmuur, en uit die getuienisse.')
    } catch {
      setBoodskap('Kon nie skuif nie. Probeer weer.')
    }
    setBesig('')
  }

  const sigbaar = (lys || []).filter(t => !t.reported)
  const weg     = (lys || []).filter(t => t.reported)

  return (
    <div className="admin-section ag">
      <div className="admin-section-title">🕊️ Getuienisse op Bid Saam</div>
      <p className="admin-books-note">
        Staan 'n gebedsversoek tussen die getuienisse, druk <b>Skuif na Bid Saam</b>: dan gaan
        dit op die gebedsmuur en verdwyn dit hier. <b>Verwyder</b> haal dit net af.
      </p>

      {fout && <p className="ag-fout">{fout} <button className="ag-knop" onClick={laai}>Laai weer</button></p>}
      {boodskap && <p className="ag-boodskap">{boodskap}</p>}
      {lys === null && <p className="admin-books-note">Laai…</p>}

      {lys && sigbaar.length === 0 && !fout && <p className="admin-books-note">Geen getuienisse op die blad nie.</p>}

      {sigbaar.map(t => (
        <div key={t.id} className="ag-item">
          <div className="ag-datum">{datumVan(t)}</div>
          <p className="ag-teks">{t.text}</p>
          <div className="ag-ry">
            <button className="ag-knop" disabled={!!besig} onClick={() => skuif(t)}>
              🙏 Skuif na Bid Saam
            </button>
            <button className="ag-knop ag-rooi" disabled={!!besig} onClick={() => verwyder(t)}>
              🗑 Verwyder
            </button>
          </div>
        </div>
      ))}

      {weg.length > 0 && (
        <p className="admin-books-note ag-weg">
          {weg.length} weggesteek (gerapporteer of deur jou verwyder) — hulle wys nie op Bid Saam nie.
        </p>
      )}
    </div>
  )
}
