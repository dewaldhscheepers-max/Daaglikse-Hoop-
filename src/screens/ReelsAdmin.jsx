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
import { beskryf } from '../data/reelsVerwyder'
import './ReelsAdmin.css'

export default function ReelsAdmin({ geheim }) {
  const [plaksel, setPlaksel] = useState('')
  const [besig, setBesig]     = useState(false)
  const [staan, setStaan]     = useState('')
  const [verslag, setVerslag] = useState(null)

  /* ── Een clip UITHAAL ──
   *
   * Dewald, 14 September 2026, met 'n skermkiekie van "Video currently
   * unavailable": *"how to remove only this one that isn't playing how will i
   * know what link it is."*
   *
   * Die antwoord op sy tweede vraag is die DEEL-knoppie langs die clip: daardie
   * skakel is `…/reels/<id>`, en `<id>` is die dokumentnaam. Een tik, en hy
   * plak dit hier.
   *
   * Dit is twee stappe met opset. `gevind` dra die maker se naam, en die rooi
   * knoppie kom eers daarna — die enigste ding wat 'n mens van die skerm af in
   * die hand het, is 'n id van negentien syfers, en niemand kan dit lees nie. */
  const [weg, setWeg]         = useState('')
  const [gevind, setGevind]   = useState(null)
  const [wegBesig, setWegBesig] = useState(false)
  const [wegFout, setWegFout] = useState('')

  const keur = useMemo(() => keurPlaksel(plaksel), [plaksel])

  async function soekOfVee(verwyder) {
    setWegBesig(true)
    setWegFout('')
    if (!verwyder) setGevind(null)
    try {
      const r = await fetch('/api/reels-verwyder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
        body: JSON.stringify({ inset: weg.trim(), verwyder: !!verwyder }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setWegFout(j.fout || `Fout ${r.status}`); setGevind(null); return }
      setGevind(j)
      /* Die kassie word leeg NA 'n verwydering, sodat 'n tweede druk nie
         dieselfde ding weer probeer nie. */
      if (j.verwyder) setWeg('')
    } catch (e) {
      setWegFout(e.message)
      setGevind(null)
    } finally {
      setWegBesig(false)
    }
  }

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

          {/* Hierdie reël het gesê die voer "hou hulle ses uur lank", en dit was
              verkeerd genoeg om Dewald te laat twyfel: hy het 'n skakel ingesit,
              dit nie gesien nie, en dit toe weer ingesit. Die voer haal ELKE
              oopmaak vars; die ses uur geld net vir wat hy WYS terwyl dit laai.
              Wat hom wel kan ophou, is die bediener se vyf-minuut-kas. */}
          <p className="admin-books-note" style={{ marginTop: 10 }}>
            Die voer haal sy clips elke keer as dit oopmaak. Die bediener hou sy
            antwoord vyf minute, dus maak die app toe en weer oop — of wag 'n
            paar minute as jy dit nie dadelik sien nie.
          </p>
        </div>
      )}

      {/* ── Een clip uithaal ── */}
      <div className="ra-invoer ra-weg">
        <div className="ra-invoer-kop">Kyk of 'n clip in is — of haal hom uit</div>
        {/* Dewald, 14 September 2026: *"ek het skakel ingesit.... en toe weet ek
            nie of dit in is nie toe sit ek dit weer in."*

            Hierdie kassie doen albei. `Soek die clip` VEE NIKS — dit sê net of
            hy in die voer is en wie se clip dit is. Dit is die antwoord op "is
            dit in?", en dit was al die hele tyd hier; net die opskrif het dit
            weggesteek. */}
        <p className="admin-books-note">
          Plak enige skakel en druk <b>Soek die clip</b> — dit sê of hy reeds in
          die voer is en wie se clip dit is. Dit vee niks uit nie.
        </p>
        <p className="admin-books-note">
          Twee keer insit kan nooit 'n duplikaat maak nie: die video se eie id is
          sy naam in die databasis. Speel 'n clip nie
          (&ldquo;Video currently unavailable&rdquo;), druk <b>Deel</b> langs
          daardie clip en plak die skakel hier — die rooi knoppie kom eers nadat
          jy sien wie se clip dit is.
        </p>
        <input
          className="ra-weg-kassie"
          value={weg}
          onChange={e => { setWeg(e.target.value); setGevind(null); setWegFout('') }}
          placeholder="Plak die Deel-skakel"
          disabled={wegBesig}
        />
        {/* 'n EIE klas, nie `ra-invoer-knop` alleen nie. Die twee invoer-knoppies
            deel daardie klas, en 'n toets wat `.last()` gebruik, sou hierdie een
            gryp — die blaaierlopie het dit dadelik gevang. */}
        <button
          className="ra-invoer-knop ra-weg-soek"
          onClick={() => soekOfVee(false)}
          disabled={wegBesig || !weg.trim()}
        >
          {wegBesig ? 'Besig…' : 'Soek die clip'}
        </button>

        {wegFout && <p className="ra-weg-fout">{wegFout}</p>}

        {gevind && !gevind.gevind && (
          <p className="admin-books-note">
            Daardie clip is nie in die voer nie — hy is reeds uit.
          </p>
        )}

        {gevind && gevind.gevind && gevind.verwyder && (
          <p className="ra-weg-klaar">
            Uit die voer: <b>{beskryf(gevind)}</b>
          </p>
        )}

        {gevind && gevind.gevind && !gevind.verwyder && (
          <>
            <p className="ra-weg-gevind">
              <b>{beskryf(gevind)}</b>
              {gevind.gedeel > 0 && (
                <span> — {gevind.gedeel} keer gedeel, en daardie telling kom nie terug nie.</span>
              )}
            </p>
            <button
              className="ra-invoer-knop ra-weg-knop"
              onClick={() => soekOfVee(true)}
              disabled={wegBesig}
            >
              {wegBesig ? 'Besig…' : 'Haal hom uit die voer'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
