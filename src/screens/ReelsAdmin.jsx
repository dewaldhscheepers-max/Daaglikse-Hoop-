/* ── Plak TikTok-skakels; kry clips ──
 *
 * Dewald, 12 September 2026: *"dit sou eintlik makliker wees as ek net al die
 * skakels so kon kopie en past in admin in die toekoms dit sou dit vinniger vir
 * my maak."* En toe: *"hier is die eerste klomp videos add hulle solank."* —
 * 124 kort skakels, aanmekaar geplak, sonder 'n enkele spasie.
 *
 * Hierdie skerm doen EEN ding: 'n plaksel in, clips uit.
 *
 * ── Waarom dit in HAPPE loop ──
 *
 * 'n Kort skakel dra die post-ID nie; hy moet oopgemaak word, en dit is 'n
 * netwerk-versoek per skakel. Honderd-vier-en-twintig daarvan in een
 * Vercel-funksie is presies die fout wat die oggendkennisgewing gebreek het.
 * Die bediener vat dus 'n hap en gee die res terug; hierdie skerm stuur die res
 * weer, en 'n mens sien 'n getal loop in plaas van 'n tydgrens.
 *
 * ── Wat dit NIE doen nie ──
 *
 * Dit tik nie 'n naam of 'n sin in nie. Die maker se HANDVATSEL kom uit die
 * opgeloste adres en word die clip se naam — erkenning is 'n hek, en dit moet
 * nie iets wees wat 'n mens kan vergeet om in te vul nie. Wil hy later sy eie
 * woorde by 'n clip sit, is dit 'n aparte vorm; die voer werk sonder dit.
 */
import { useMemo, useState } from 'react'
import { keurPlaksel } from '../data/reelsPlak'
import { REELS_INVOER, REELS_INVOER_2 } from '../data/reelsInvoer'
import './ReelsAdmin.css'

export default function ReelsAdmin({ geheim }) {
  const [plaksel, setPlaksel] = useState('')
  const [besig, setBesig]     = useState(false)
  const [staan, setStaan]     = useState('')
  const [verslag, setVerslag] = useState(null)

  const keur = useMemo(() => keurPlaksel(plaksel), [plaksel])

  /* ── Stuur 'n lys in happe ──
   *
   * Die bediener sê hoeveel oorbly en GEE die res terug; ons stuur dit weer.
   * Nooit 'n lus wat self die happe uitwerk nie — dan is daar twee plekke wat
   * die hap-grootte ken en die een bly agter. */
  async function stuur(skakels) {
    setBesig(true)
    setVerslag(null)
    const gedoen = []
    const oorgeslaan = []
    const misluk = []
    let oor = skakels
    let rondtes = 0

    try {
      while (oor.length && rondtes < 60) {
        rondtes++
        setStaan(`Besig… ${gedoen.length + oorgeslaan.length + misluk.length} van ${skakels.length}`)
        const r = await fetch('/api/reels-voeg-by', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
          body: JSON.stringify({ skakels: oor }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) {
          misluk.push({ skakel: '(die versoek self)', fout: j.fout || `HTTP ${r.status}` })
          break
        }
        gedoen.push(...(j.gedoen || []))
        oorgeslaan.push(...(j.oorgeslaan || []))
        misluk.push(...(j.misluk || []))
        const volgende = Array.isArray(j.volgende) ? j.volgende : []
        /* Gaan dit nie vorentoe nie, hou op — anders is dit 'n lus wat 124 keer
           dieselfde hap stuur. */
        if (volgende.length >= oor.length) break
        oor = volgende
      }
      setVerslag({ gedoen, oorgeslaan, misluk, gevra: skakels.length })
      setStaan('')
    } catch (e) {
      setStaan('')
      setVerslag({ gedoen, oorgeslaan, misluk: [...misluk, { skakel: '(die netwerk)', fout: e.message }], gevra: skakels.length })
    } finally {
      setBesig(false)
    }
  }

  return (
    <div className="admin-section ra">
      <div className="admin-section-title">🎞️ Reels — plak die skakels</div>

      <p className="admin-books-note">
        Plak die TikTok-skakels hier. Hulle mag aanmekaar wees, een per reël, of
        met kommas — dit maak nie saak nie. Elke skakel word oopgemaak, die
        video se nommer en die maker se naam word uitgehaal, en dit word 'n clip
        in die voer.
      </p>

      <div className="admin-field">
        <label>Skakels</label>
        <textarea
          className="ra-kassie"
          value={plaksel}
          onChange={e => setPlaksel(e.target.value)}
          placeholder="https://vt.tiktok.com/…"
          rows={7}
          disabled={besig}
        />
        <div className="ra-tel">
          {keur.leeg && 'Nog niks geplak nie.'}
          {keur.niksGevind && '⚠️ Niks wat soos \'n TikTok-skakel lyk nie.'}
          {keur.aantal > 0 && `${keur.aantal} ${keur.aantal === 1 ? 'skakel' : 'skakels'} gevind`}
          {keur.afgekap && ' — net die eerste 500 word gevat.'}
        </div>
      </div>

      <button
        className="admin-save-btn"
        onClick={() => stuur(keur.skakels)}
        disabled={besig || keur.aantal === 0}
      >
        {besig ? staan || 'Besig…' : `Voeg ${keur.aantal || ''} by`.trim()}
      </button>

      {/* ── Dewald se eerste klomp ──
          Sy 124 skakels staan in `reelsInvoer.js`, want hy het hulle EEN keer
          gestuur en moet dit nie weer doen nie. Skakels wat al 'n clip is, word
          oorgeslaan, dus is dit veilig om weer te druk. */}
      <div className="ra-invoer">
        <div className="ra-invoer-kop">Die eerste klomp</div>
        <p className="admin-books-note">
          Die {REELS_INVOER.length} skakels wat op 12 September gestuur is, staan
          reeds in die app. Druk dit een keer. Wat al ingekom het, word
          oorgeslaan — dit is veilig om weer te druk.
        </p>
        <button
          className="ra-invoer-knop"
          onClick={() => stuur(REELS_INVOER)}
          disabled={besig}
        >
          {besig ? staan || 'Besig…' : `Voer die ${REELS_INVOER.length} skakels in`}
        </button>
      </div>

      {/* ── Die tweede klomp ──
          Dewald, 13 September 2026: *"don't add it if it is already on the Reel
          page, because I think more than half of these links we already added."*

          Dit is presies wat gebeur, en dit is nie nuwe werk nie — die oplosser
          ontdubbel al van die begin af op die POST-ID en nie op die skakel nie.
          Dit moes ook so wees: 'n kort skakel is nie die video se ID nie, en
          TikTok gee 'n nuwe kort skakel elke keer as 'n mens deel. Twee
          verskillende skakels kan dus dieselfde video wees.

          Die verslag hieronder wys "Nuut" en "Was al daar" langs mekaar. Dit is
          die getal wat sy vraag beantwoord. */}
      <div className="ra-invoer">
        <div className="ra-invoer-kop">Die tweede klomp</div>
        <p className="admin-books-note">
          Die {REELS_INVOER_2.length} skakels van 13 September. Wat al 'n clip is,
          word oorgeslaan — die oplosser vergelyk die VIDEO se id, nie die skakel
          nie, dus maak dit nie saak hoeveel van hulle al daar is nie. 'n Clip wat
          reeds bestaan, hou sy deel-telling en sy plek in die voer.
        </p>
        <button
          className="ra-invoer-knop"
          onClick={() => stuur(REELS_INVOER_2)}
          disabled={besig}
        >
          {besig ? staan || 'Besig…' : `Voer die ${REELS_INVOER_2.length} skakels in`}
        </button>
      </div>

      {verslag && (
        <div className="ra-verslag">
          <div className="ra-verslag-kop">
            {verslag.gedoen.length} nuwe {verslag.gedoen.length === 1 ? 'clip' : 'clips'} bygevoeg
          </div>
          <div className="ra-ry">
            <span>Gevra</span><b>{verslag.gevra}</b>
          </div>
          <div className="ra-ry">
            <span>Nuut</span><b>{verslag.gedoen.length}</b>
          </div>
          <div className="ra-ry">
            <span>Was al daar</span><b>{verslag.oorgeslaan.length}</b>
          </div>
          <div className={`ra-ry${verslag.misluk.length ? ' ra-ry-fout' : ''}`}>
            <span>Kon nie</span><b>{verslag.misluk.length}</b>
          </div>

          {verslag.gedoen.length > 0 && (
            <details className="ra-lys">
              <summary>Wie se clips bygekom het</summary>
              <ul>
                {[...new Set(verslag.gedoen.map(g => g.naam))].map(n => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </details>
          )}

          {verslag.misluk.length > 0 && (
            <details className="ra-lys ra-lys-fout" open>
              <summary>Wat nie ingekom het nie</summary>
              <ul>
                {verslag.misluk.slice(0, 40).map((m, i) => (
                  <li key={i}><code>{m.skakel}</code> — {m.fout}</li>
                ))}
              </ul>
              {verslag.misluk.length > 40 && <p>…en {verslag.misluk.length - 40} meer.</p>}
            </details>
          )}

          <p className="admin-books-note" style={{ marginTop: 10 }}>
            Die voer haal sy clips een keer per oopmaak en hou hulle ses uur lank.
            Sien dit nie dadelik nie, maak die app toe en weer oop.
          </p>
        </div>
      )}
    </div>
  )
}
