/* ── 'n Prent oplaai vir 'n VOLG JESUS-week ──
 *
 * Dewald: "moenie die ander een delete nie, dit moet ook bly."
 *
 * 'n Week het nou TWEE wallpapers. Die een sluit Dag 1 af — die dag waarop die
 * stemboodskap land — en die ander sluit die hele week af op Dag 5. Albei bly
 * staan; die een vervang nie die ander nie.
 *
 * Dit laai op na `covers/` in Storage, dieselfde vouer as die daaglikse
 * wallpapers. Prente WORD deur die diensketter gekas (anders as klank); sien
 * magKas() in kasBesluit.js.
 *
 * Hoekom dit 'n oplaaier is en nie 'n teksveld nie: 'n adres bestaan nie
 * voordat die lêer erens is nie. Dieselfde fout as die stemboodskap s'n, en
 * ek maak dit nie 'n derde keer nie.
 */
import { useRef, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

export default function PrentOplaai({ week, sleutel, kop, hulp, waarde, op, geheim = '' }) {
  const leerRef = useRef(null)
  const [besig, setBesig] = useState(false)
  const [pers, setPers]   = useState(0)
  const [fout, setFout]   = useState(null)
  /* Die prente wat VOORHEEN vir hierdie week en hierdie plek opgelaai is.
     null = nog nie gesoek nie. Sien api/vj-ou-prente.js. */
  const [ou, setOu]       = useState(null)
  const [soek, setSoek]   = useState(false)

  async function soekOu() {
    setSoek(true); setFout(null)
    try {
      const r = await fetch(`/api/vj-ou-prente?week=${encodeURIComponent(week)}&veld=${encodeURIComponent(sleutel)}`,
                            { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      if (!j.ok) throw new Error(j.fout || 'Kon nie soek nie')
      setOu(j.prente || [])
    } catch (e) {
      setFout('Kon nie die vorige prente kry nie: ' + (e && e.message))
    } finally { setSoek(false) }
  }

  async function stuurOp(leer) {
    if (!leer) return
    setBesig(true); setPers(0); setFout(null)
    try {
      const uit = (leer.name.split('.').pop() || 'jpg').toLowerCase()
      const naam = `vj-w${week}-${sleutel}-${Date.now()}.${uit}`
      const plek = ref(storage, `covers/${naam}`)
      const url = await new Promise((klaar, val) => {
        const taak = uploadBytesResumable(plek, leer)
        taak.on('state_changed',
          s => setPers(Math.round(s.bytesTransferred / s.totalBytes * 100)),
          val,
          async () => klaar(await getDownloadURL(taak.snapshot.ref)))
      })
      op(url)
    } catch (e) {
      setFout('Die oplaai het misluk: ' + (e && e.message))
    } finally { setBesig(false) }
  }

  return (
    <div className="so">
      <div className="so-kop">{kop}</div>
      {hulp && <p className="so-leeg">{hulp}</p>}

      {waarde && (
        <div className="so-daar">
          <div className="so-daar-kop">✓ Die prent is opgelaai</div>
          {/* 'n Klein voorskou as agtergrond, nie 'n <img> nie — sien
              CLAUDE.md se "Android, Chrome, en gekleurde strepe". */}
          <div className="so-prent" style={{ backgroundImage: `url("${waarde}")` }} />
          <button className="so-vee" onClick={() => op('')}>Haal dit af</button>
        </div>
      )}

      {besig ? (
        <div className="so-besig">
          <div className="so-balk"><div className="so-vul" style={{ width: `${pers}%` }} /></div>
          <span>Besig om op te laai… {pers}%</span>
        </div>
      ) : (
        <button className="so-knop" onClick={() => leerRef.current && leerRef.current.click()}>
          🖼  {waarde ? 'Vervang die prent' : 'Kies ’n prent'}
        </button>
      )}

      {ou === null ? (
        <button className="so-knop so-ou" disabled={soek} onClick={soekOu}>
          {soek ? 'Besig om te soek…' : '↺ Soek vorige prente vir hierdie plek'}
        </button>
      ) : ou.length === 0 ? (
        <p className="so-leeg">Daar is nog nooit 'n prent vir hierdie plek in Week {week} opgelaai nie.</p>
      ) : (
        <div className="so-ou-lys">
          <div className="so-daar-kop">Vorige prente vir hierdie plek — nuutste eerste</div>
          {ou.map(p => (
            <div key={p.url} className="so-ou-ry">
              {/* Agtergrond, nie 'n <img> nie — sien die voorskou hierbo. */}
              <div className="so-prent so-ou-prent" style={{ backgroundImage: `url("${p.url}")` }} />
              <div className="so-ou-reg">
                <span className="so-ou-tyd">
                  {p.tyd ? new Date(p.tyd).toLocaleString('af-ZA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : p.naam}
                </span>
                {p.url === waarde
                  ? <span className="so-ou-hier">✓ Dit is die huidige een</span>
                  : <button className="so-knop" onClick={() => op(p.url)}>Gebruik hierdie een</button>}
              </div>
            </div>
          ))}
          <p className="so-leeg">Druk daarna <strong>Stoor</strong>.</p>
        </div>
      )}

      <input ref={leerRef} type="file" style={{ display: 'none' }} accept="image/*"
             onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; stuurOp(f) }} />
      {fout && <p className="so-fout">{fout}</p>}
    </div>
  )
}
