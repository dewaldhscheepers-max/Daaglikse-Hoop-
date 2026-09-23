import { useState, useMemo } from 'react'
import { prentPad } from '../data/prentPad'
import { deelPrent, laaiPrentAf } from '../data/prentStuur'
import {
  prenteUit, blad, hetMeer, nogOor, datumWoorde, PER_BLAD,
} from '../data/vorigePrente'
import './VorigePrente.css'

/* ── DIE PRENTE-GALERY ──
 *
 * Dewald, 24 September 2026: *"al die prente is opgelaai saam vorige
 * stemboodskappe... en hul moet dit kan aflaai en deel."*
 *
 * Elke nota dra 'n wallpaper wat presies EEN dag lank sigbaar was. Hier is
 * hulle almal.
 *
 * ── Agt op 'n slag ──
 *
 * Dewald: *"moenie al die wallpapers gelyk laai nie... hulle kan mos kliek laai
 * meer."* Die reëls staan in src/data/vorigePrente.js, suiwer en met toetse.
 *
 * Daarby dra elke `<img>` `loading="lazy"`: selfs binne die agt wat gewys word,
 * haal die blaaier net wat naby die skerm is. Die twee saam beteken 'n mens wat
 * die eerste twee prente sien, betaal vir twee prente.
 *
 * ── AFLAAI en DEEL is twee dinge ──
 *
 * Aflaai sit dit op HAAR foon, om as skermagtergrond te gebruik. Deel stuur dit
 * aan IEMAND ANDERS. Die een is nie 'n terugval vir die ander nie, en albei
 * loop deur `src/data/prentStuur.js` — dieselfde pad as vandag se wallpaper op
 * Luister, want twee paaie is twee plekke om te breek.
 *
 * ── Die prent hoort aan 'n BOODSKAP ──
 *
 * Daardie verbinding is gratis: albei lê op dieselfde dokument. Dit maak die
 * galery 'n tweede pad in die argief in, vir 'n mens wat met haar oë soek in
 * plaas van met 'n titel.
 */
export default function VorigePrente({ notas, sonder, onSluit, onLuister }) {
  const prente = useMemo(() => prenteUit(notas, { sonder }), [notas, sonder])
  const [blaaie, setBlaaie] = useState(1)
  const [oop, setOop] = useState(null)      /* die prent wat oopgemaak is */
  const [besig, setBesig] = useState(false)
  const [nota, setNota] = useState(null)
  const [fout, setFout] = useState(null)

  const wys = blad(prente, blaaie)
  const meer = hetMeer(prente, blaaie)
  const oorig = nogOor(prente, blaaie)

  async function doenDeel(p) {
    if (besig) return
    setBesig(true); setNota(null); setFout(null)
    const r = await deelPrent(p.url, { titel: p.titel })
    if (r.nota) setNota(r.nota)
    if (r.fout) setFout(r.fout)
    setBesig(false)
  }

  async function doenAflaai(p) {
    if (besig) return
    setBesig(true); setNota(null); setFout(null)
    const r = await laaiPrentAf(p.url)
    if (r.ok) setNota('Die prent is na jou Aflaaie toe.')
    else setFout(r.fout)
    setBesig(false)
  }

  return (
    <div className="vp">
      <div className="vp-kop">
        <button className="vp-terug" onClick={onSluit} aria-label="Terug">←</button>
        <h2 className="vp-titel">Vorige prente</h2>
      </div>

      {prente.length === 0 ? (
        /* Geen prente nie — en dit word GESÊ. 'n Leë skerm laat 'n mens dink
           die app is stukkend. */
        <p className="vp-leeg">
          Daar is nog geen vorige prente nie. Elke nuwe boodskap bring een saam.
        </p>
      ) : (
        <>
          <p className="vp-fyn">
            Laai enige prent af vir jou skerm, of stuur dit vir iemand.
          </p>

          <div className="vp-rooster">
            {wys.map(p => (
              <button
                key={p.id}
                className="vp-teel"
                onClick={() => { setOop(p); setNota(null); setFout(null) }}
              >
                {/* 'n `background-image` op 'n ONDEURSIGTIGE houer sou hier die
                    veiliger keuse wees, maar 'n teël is klein en die houer dra
                    reeds sy eie grond — die Android-strepe kom van GROOT
                    teksture. Die grond staan agter die prent sodat 'n teël wat
                    nog laai, soos 'n teël lyk en nie soos 'n gat nie. */}
                <img
                  src={prentPad(p.url)}
                  alt={p.titel || 'Prent'}
                  loading="lazy"
                  decoding="async"
                  className="vp-prent"
                />
                {p.datum && <span className="vp-datum">{datumWoorde(p.datum)}</span>}
              </button>
            ))}
          </div>

          {meer && (
            /* Die getal staan op die knoppie. "Laai meer" alleen laat 'n mens
               wonder of dit nog tien of nog tweehonderd is. */
            <button className="vp-meer" onClick={() => setBlaaie(b => b + 1)}>
              Laai meer ({oorig > PER_BLAD ? `nog ${PER_BLAD} van ${oorig}` : `nog ${oorig}`})
            </button>
          )}
        </>
      )}

      {/* ── Een prent, oopgemaak ── */}
      {oop && (
        <div className="vp-oorleg" onClick={() => setOop(null)}>
          <div className="vp-blad" onClick={e => e.stopPropagation()}>
            <button className="vp-x" onClick={() => setOop(null)} aria-label="Maak toe">✕</button>
            <img src={prentPad(oop.url)} alt={oop.titel || 'Prent'} className="vp-groot" />
            {oop.titel && <p className="vp-blad-titel">{oop.titel}</p>}
            {oop.datum && <p className="vp-blad-datum">{datumWoorde(oop.datum)}</p>}

            <button className="vp-knop vp-knop-hoof" disabled={besig}
                    onClick={() => doenDeel(oop)}>
              {besig ? 'Een oomblik…' : 'Deel hierdie prent'}
            </button>
            <button className="vp-knop" disabled={besig}
                    onClick={() => doenAflaai(oop)}>
              Laai af na my foon
            </button>

            {/* Die prent hoort aan 'n boodskap. Dit kos niks om die pad daarheen
                oop te hou, en dit is die halwe rede waarom hierdie skerm meer is
                as 'n prentekas. */}
            {oop.oudio && onLuister && (
              <button className="vp-knop vp-knop-stil"
                      onClick={() => { onLuister(oop.id); onSluit() }}>
                Luister na hierdie boodskap
              </button>
            )}

            {nota && <p className="vp-nota">{nota}</p>}
            {fout && <p className="vp-fout">{fout}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
