/* ── VOLG JESUS — die admin ──
 *
 * Die 52-week dissipelskapprogram word HIER gebou, en dit staan doelbewus
 * buite die app tot dit klaar is.
 *
 * Dewald: "moenie dit in die app sit tot dit heeltemal klaar is tot by dag 52
 * nie. so dalk moet ons dit in admin bou met knoppie waar ek dit elke keer kan
 * gaan toets."
 *
 * Daarom:
 *
 *   · daar is GEEN openbare eindpunt nie — net /api/volg-jesus-week, en dit
 *     eis die admin-geheim;
 *   · elke week begin met `gepubliseer: false`, en die bediener stel daardie
 *     veld apart van die JSON sodat 'n mens dit nie per ongeluk deur die
 *     inhoud kan aanskakel nie;
 *   · VOORSKOU wys die week presies soos 'n gebruiker dit sal sien, sonder
 *     dat iemand anders daarby kan kom.
 *
 * Die video kom van YouTube af, net soos Sorg s'n. Geen audio — dit was
 * Dewald se besluit, en YouTube laat 'n mens self 144p kies, wat minder data
 * gebruik as die app se eie stemnotas.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  BEWEGINGS, bewegingVir, KONTROLES, RISIKO_VLAKKE,
  publiseerFoute, magPubliseer, geldigeVideoId, ontleedVerwysing,
} from '../data/volgJesus'
import { WEKE } from '../data/volgJesusWeke'
import { keurVideoInset } from '../data/youtubeId'
import VolgJesusWeek from './VolgJesusWeek'
import VolgJesusStap from './VolgJesusStap'
import './VolgJesusAdmin.css'

/* ── Die video ──
 *
 * Dewald: "maak seker ek kan in admin by die series die hele link insit en nie
 * net die ID nie."
 *
 * Hy plak wat sy foon hom gee, en dit is nooit die rou ID nie:
 *
 *     https://youtu.be/jACGS5QkLkQ?si=DjVIhhIlhHKS4Hg6
 *
 * Die veld hou die skakel soos hy dit geplak het en wys onder wat werklik
 * gestoor gaan word. Kry ons niks bruikbaars nie, se dit dit — in plaas
 * daarvan om die hele URL as 'n "video-ID" te stoor en die lee speler weke
 * later te ontdek. */
function VideoVeld({ waarde, op }) {
  const k = keurVideoInset(waarde)
  return (
    <div className="vj-veld">
      <label>Video — plak die hele YouTube-skakel</label>
      <input value={waarde} onChange={e => op(e.target.value)}
             placeholder="https://youtu.be/jACGS5QkLkQ?si=..." />
      {k.leeg && <span className="vj-hint">Nog geen video nie.</span>}
      {!k.leeg && k.geldig && (
        <span className="vj-goed">
          ✓ Video-ID: <strong>{k.id}</strong>{k.wasSkakel ? ' — uit die skakel gehaal' : ''}
        </span>
      )}
      {!k.leeg && !k.geldig && (
        <span className="vj-fout">
          Ek kry nie 'n YouTube-video hierin nie. Plak die hele skakel, bv.
          https://youtu.be/jACGS5QkLkQ
        </span>
      )}
    </div>
  )
}

const LEEG = (n) => ({
  weeknommer: n,
  titel: '', doel: '', openingskerm: '',
  primereSkrif: '', ondersteunendeSkrif: '',
  videoId: '',
  kernwaarheid: '', privaatRefleksie: '', gehoorsaamheidStap: '', gebed: '',
  dag1Titel: '', dag2Titel: '', dag3Titel: '', dag4Titel: '', dag5Titel: '',
  dag2Skrif: '', dag3Skrif: '', dag4Skrif: '', dag5Skrif: '',
  dag2Prompt: '', dag3Prompt: '', dag4Vraag: '', dag5Prompt: '',
  moreTeaser: '',
  groepVraag1: '', groepVraag2: '', groepVraag3: '', groepVraag4: '',
  eenSin: '', weekKern: '', wallpaper: '',
  fasiliteerderHoofpunt: '', fasiliteerderGrens: '', fasiliteerderWaarskuwing: '',
  pastoraleRisiko: 'laag',
  kontroles: { teks: false, konteks: false, jesus: false, toepassing: false, grens: false },
  hersieningStatus: 'wag',
  stemboodskapUrl: '',
  gepubliseer: false,
})

export default function VolgJesusAdmin({ geheim = '' }) {
  const [lys, setLys]         = useState([])
  const [week, setWeek]       = useState(null)
  const [besig, setBesig]     = useState(false)
  const [boodskap, setBoodskap] = useState(null)
  const [voorskou, setVoorskou] = useState(false)
  const [opBesig, setOpBesig]   = useState(false)
  const [rol, setRol]           = useState('solo')
  const [versoeke, setVersoeke] = useState([])
  /* Die bevestiging vir 'Begin oor'. Dit val na tien sekondes vanself terug. */
  const [seker, setSeker]       = useState(false)
  /* Die tellers. Vier heelgetalle plus een ry per week — geen naam en geen
     toestel-id, sien api/_volgJesusTelVelde.js. */
  const [tellers, setTellers]   = useState(null)

  const kop = useCallback(() => ({ 'Content-Type': 'application/json', 'x-sorg-geheim': geheim }), [geheim])

  const laaiLys = useCallback(async () => {
    try {
      const r = await fetch('/api/volg-jesus-week', { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      setLys(Array.isArray(j.weke) ? j.weke : [])
    } catch { setLys([]) }
  }, [geheim])

  const laaiTellers = useCallback(async () => {
    try {
      const r = await fetch('/api/volg-jesus-telling', { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      setTellers(j && j.tellers ? j.tellers : {})
    } catch { setTellers({}) }
  }, [geheim])

  const laaiVersoeke = useCallback(async () => {
    try {
      const r = await fetch('/api/volg-jesus-versoek', { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      setVersoeke(Array.isArray(j.versoeke) ? j.versoeke : [])
    } catch { setVersoeke([]) }
  }, [geheim])

  async function merkHanteer(id) {
    try {
      await fetch('/api/volg-jesus-versoek', {
        method: 'PATCH', headers: kop(), body: JSON.stringify({ id, hanteer: true }),
      })
      laaiVersoeke()
    } catch {}
  }

  useEffect(() => { laaiLys(); laaiVersoeke(); laaiTellers() }, [laaiLys, laaiVersoeke, laaiTellers])

  async function maakOop(n) {
    setBesig(true); setBoodskap(null); setVoorskou(false)
    try {
      const r = await fetch(`/api/volg-jesus-week?week=${n}`, { headers: { 'x-sorg-geheim': geheim } })
      const j = await r.json()
      setWeek(j.week || LEEG(n))
    } catch { setWeek(LEEG(n)) }
    finally { setBesig(false) }
  }

  async function stoor() {
    if (!week) return
    setBesig(true); setBoodskap(null)
    try {
      /* Die skakel word HIER in 'n ID verander, nie by elke tikslag nie — 'n
         halwe URL tydens die tik moet nie 'n fout laat flits nie. */
      const skoon = { ...week, videoId: keurVideoInset(week.videoId).id }
      const r = await fetch('/api/volg-jesus-week', {
        method: 'PUT', headers: kop(), body: JSON.stringify({ week: skoon }),
      })
      const j = await r.json()
      if (j.ok) { setBoodskap({ goed: true, teks: 'Gestoor.' }); laaiLys() }
      else setBoodskap({ goed: false, teks: j.fout || 'Kon nie stoor nie' })
    } catch { setBoodskap({ goed: false, teks: 'Kon nie stoor nie' }) }
    finally { setBesig(false) }
  }

  /* ── Publiseer ──
   *
   * Hierdie knoppie het ONTBREEK, en dit was die duurste soort fout: alles
   * anders het gewerk. Die openbare eindpunt filter op `gepubliseer === true`,
   * die kaart op Luister hang aan daardie lys, en die hele pad is getoets —
   * maar niks in hierdie admin kon daardie veld ooit aanskakel nie. Dewald:
   * "die verandering is op admin maar nie op luister nou skerm nie."
   *
   * Dit is 'n APARTE knoppie en nie 'n merkie langs Stoor nie, want dit doen
   * iets anders as stoor: dit maak 'n week vir duisende mense sigbaar. 'n
   * Mens moet kan stoor sonder om te publiseer, en dit is presies hoe hy
   * elke dag 'n week bou.
   *
   * Die hek is `magPubliseer` — dieselfde vyf kontroles wat op die skerm
   * staan. Afhaal het geen hek nie: is 'n week verkeerd, moet dit dadelik af
   * kan kom. */
  async function stelPublikasie(aan) {
    if (!week) return
    if (aan && !magPubliseer(week)) return
    setBesig(true); setBoodskap(null)
    try {
      const skoon = { ...week, videoId: keurVideoInset(week.videoId).id, gepubliseer: aan }
      const r = await fetch('/api/volg-jesus-week', {
        method: 'PUT', headers: kop(), body: JSON.stringify({ week: skoon }),
      })
      const j = await r.json()
      if (j.ok) {
        setWeek(w => ({ ...w, gepubliseer: aan }))
        setBoodskap({
          goed: true,
          teks: aan
            ? `Week ${week.weeknommer} is LEWENDIG. Die kaart op Luister wys hom nou.`
            : `Week ${week.weeknommer} is afgehaal en is nie meer in die app nie.`,
        })
        laaiLys()
      } else setBoodskap({ goed: false, teks: j.fout || 'Kon nie publiseer nie' })
    } catch { setBoodskap({ goed: false, teks: 'Kon nie publiseer nie' }) }
    finally { setBesig(false) }
  }

  /* ── Laai Week 1 tot 5 op, in een slag ──
   *
   * Dewald het hierdie vyf weke geskryf. Om hulle een vir een oop te maak,
   * te laai en te stoor is tien klikke vir werk wat reeds gedoen is.
   *
   * Dit skryf na die LEWENDE Firestore, en dit is hoekom dit 'n knoppie is
   * en nie iets wat ek self gedoen het nie: CLAUDE.md se dat 'n mens nie aan
   * die lewende projek raak sonder om te vra nie. Hierdie is Dewald wat vra,
   * met sy eie geheim.
   *
   * Dit oorskryf NIE 'n week wat reeds inhoud het nie — dit sou 'n aand se
   * redigering kon uitvee. */
  async function laaiAlmalOp() {
    if (opBesig) return
    setOpBesig(true); setBoodskap(null)
    const gedoen = [], oorgeslaan = [], misluk = []
    for (const n of Object.keys(WEKE).map(Number).sort((a, b) => a - b)) {
      try {
        const bestaan = await fetch(`/api/volg-jesus-week?week=${n}`, {
          headers: { 'x-sorg-geheim': geheim },
        }).then(r => r.json()).catch(() => ({}))

        /* 'n Week met 'n titel is werk wat iemand gedoen het. Los dit. */
        if (bestaan.week && String(bestaan.week.titel || '').trim()) {
          oorgeslaan.push(n); continue
        }

        const r = await fetch('/api/volg-jesus-week', {
          method: 'PUT', headers: kop(),
          body: JSON.stringify({ week: { ...LEEG(n), ...WEKE[n] } }),
        })
        const j = await r.json()
        if (j.ok) gedoen.push(n); else misluk.push(n)
      } catch { misluk.push(n) }
    }
    await laaiLys()
    setOpBesig(false)
    const dele = []
    if (gedoen.length)     dele.push(`Week ${gedoen.join(', ')} opgelaai`)
    if (oorgeslaan.length) dele.push(`Week ${oorgeslaan.join(', ')} het reeds inhoud — oorgeslaan`)
    if (misluk.length)     dele.push(`Week ${misluk.join(', ')} het misluk`)
    setBoodskap({ goed: !misluk.length, teks: dele.join('. ') + '.' })
  }

  /* ── Wys wanneer die databasis agter die geskrewe teks is ──
   *
   * Dit het Dewald nou DRIE keer tyd gekos. Hy kyk na die voorskou, sien ou
   * inhoud, en dink die kode is verkeerd — terwyl die kode reeds reg is en
   * Firestore net nog die vorige weergawe dra.
   *
   * Die rede is struktureel: hierdie skerm lees uit die DATABASIS, maar die
   * teks word in volgJesusWeke.js geskryf en met 'n knoppie oorgedra. Tussen
   * daardie twee kan 'n gaping wees, en niks het dit gewys nie.
   *
   * Nou wys dit. Ons vergelyk elke veld wat die BRON het teen wat gelaai is,
   * en tel hoeveel verskil. Velde wat net in die admin bestaan (videoId, die
   * kontroles, hersieningStatus, gepubliseer) word nie vergelyk nie — hulle
   * hoort nie in die bron nie. */
  function verskilVanBron(w) {
    const bron = w && WEKE[w.weeknommer]
    if (!bron) return []
    return Object.keys(bron).filter(veld =>
      String(w[veld] ?? '').trim() !== String(bron[veld] ?? '').trim())
  }

  /* ── Begin oor ──
   *
   * Dewald skryf die program oor, en die ou weke uit volgJesusWeke.js haal
   * help niks: hierdie skerm lees uit FIRESTORE, en daar staan hulle nog.
   * Dit is presies waarom sy rooster nog "Doop", "Word klein" en "Ware
   * aanbidding" gewys het nadat die kode al skoon was.
   *
   * Hierdie knoppie vee die hele versameling uit en skryf dan die geskrewe
   * weke terug. Dit VERNIETIG data, en daarom:
   *
   *   · dit vra twee keer — die eerste druk verander net die knoppie;
   *   · die tweede druk wag tien sekondes voor dit weer wapen, sodat 'n dubbel-
   *     tik op 'n foon nie per ongeluk 'n aand se werk uitvee nie;
   *   · dit gebruik ?alles=ja, wat opsetlik omslagtig is.
   *
   * Anders as `laaiAlmalOp` slaan dit NIKS oor nie — dit is die punt. */
  async function beginOor() {
    if (opBesig) return
    if (!seker) {
      setSeker(true)
      setBoodskap({ goed: false, teks: 'Druk weer om te bevestig. Dit vee ALLES uit wat tans in die databasis staan.' })
      setTimeout(() => setSeker(false), 10000)
      return
    }
    setSeker(false); setOpBesig(true); setBoodskap(null)
    try {
      const r = await fetch('/api/volg-jesus-week?alles=ja', {
        method: 'DELETE', headers: { 'x-sorg-geheim': geheim },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.fout || 'Kon nie uitvee nie')

      const gedoen = [], misluk = []
      for (const n of Object.keys(WEKE).map(Number).sort((a, b) => a - b)) {
        try {
          const p = await fetch('/api/volg-jesus-week', {
            method: 'PUT', headers: kop(),
            body: JSON.stringify({ week: { ...LEEG(n), ...WEKE[n] } }),
          })
          if ((await p.json()).ok) gedoen.push(n); else misluk.push(n)
        } catch { misluk.push(n) }
      }
      await laaiLys()
      const dele = [`${(j.uitgevee || []).length} weke uitgevee`]
      if (gedoen.length) dele.push(`Week ${gedoen.join(', ')} weer opgelaai`)
      if (misluk.length) dele.push(`Week ${misluk.join(', ')} het misluk`)
      setBoodskap({ goed: !misluk.length && !(j.misluk || []).length, teks: dele.join('. ') + '.' })
    } catch (e) {
      setBoodskap({ goed: false, teks: e.message || 'Kon nie begin oor nie' })
    } finally { setOpBesig(false) }
  }

  /* Laai Dewald se geskrewe week in die vorm. Dit STOOR nie — hy kyk
     eers, verander wat hy wil, en druk dan self Stoor. */
  function laaiGeskrewe(n) {
    const bron = WEKE[n]
    if (!bron) return
    setWeek(w => ({ ...LEEG(n), ...bron, ...(w && w.opgedateer ? { gepubliseer: w.gepubliseer } : {}) }))
    setBoodskap({ goed: true, teks: `Week ${n} se geskrewe teks is gelaai. Nog nie gestoor nie.` })
  }

  const stel = (veld, waarde) => setWeek(w => ({ ...w, [veld]: waarde }))
  const stelKontrole = (s, v) =>
    setWeek(w => ({ ...w, kontroles: { ...(w.kontroles || {}), [s]: v } }))

  const foute = week ? publiseerFoute(week) : []

  /* ── Die lys ───────────────────────────────────────────────────────── */
  if (!week) {
    return (
      <div className="vj">
        <div className="vj-kop">
          <h3>VOLG JESUS</h3>
          <p className="vj-sub">
            52 weke. 'n Week wat GEPUBLISEER is, is lewendig in die app — die
            kaart op Luister wys hom en mense kan hom doen. Al die res word
            hier gebou en hier getoets en gaan nêrens heen nie.
          </p>
          <button className="vj-groot" onClick={laaiAlmalOp} disabled={opBesig}>
            {opBesig
              ? 'Besig om op te laai…'
              : Object.keys(WEKE).length === 1
                ? '⬆  Laai Week 1 op'
                : `⬆  Laai Week 1 tot ${Object.keys(WEKE).length} op`}
          </button>
          <p className="vj-sub vj-fyn">
            Skryf al die weke wat reeds geskryf is na die databasis. 'n Week wat
            al inhoud het, word oorgeslaan. Daarna hoef jy net die video's by te sit.
          </p>

          {/* Die enigste knoppie in hierdie hele admin wat data vernietig.
              Daarom lyk dit anders, staan dit apart, en vra dit twee keer. */}
          <button className={`vj-gevaarlik${seker ? ' vj-gewapen' : ''}`}
                  onClick={beginOor} disabled={opBesig}>
            {opBesig
              ? 'Besig…'
              : seker
                ? '⚠  Druk weer — vee ALLES uit'
                : '🗑  Begin oor: vee alles uit en laai oor'}
          </button>
          <p className="vj-sub vj-fyn">
            Vee elke week uit die databasis en skryf dan net die geskrewe weke
            terug. Gebruik dit wanneer die program oorgeskryf word. Dit kan nie
            teruggedraai word nie.
          </p>
        </div>
        {boodskap && (
          <p className={`vj-boodskap ${boodskap.goed ? 'goed' : 'sleg'}`}>{boodskap.teks}</p>
        )}

        {/* Mense wat gevra het dat iemand hulle kontak. Dit staan BO, want
            'n doopversoek wat drie weke lank onder 52 blokkies lê, is 'n mens
            wat gevra het en niks gehoor het nie. */}
        {versoeke.some(v => !v.hanteer) && (
          <div className="vj-versoeke">
            <div className="vj-versoeke-kop">MENSE WAT WAG OM GEHOOR TE WORD</div>
            {versoeke.filter(v => !v.hanteer).map(v => (
              <div key={v.id} className="vj-versoek">
                <div className="vj-versoek-teks">
                  <strong>{v.opskrif}</strong>
                  <span>{v.naam} · {v.kontak}</span>
                  <span className="vj-versoek-tyd">{(v.geskep || '').slice(0, 10)}</span>
                </div>
                <button onClick={() => merkHanteer(v.id)}>Gedoen</button>
              </div>
            ))}
          </div>
        )}
        <Tellers tellers={tellers} lys={lys} />

        {BEWEGINGS.map(b => (
          <div key={b.nommer} className="vj-beweging">
            <div className="vj-beweging-kop">
              {b.nommer}. {b.naam} <span>Week {b.van}–{b.tot}</span>
            </div>
            <div className="vj-rooster">
              {Array.from({ length: b.tot - b.van + 1 }, (_, i) => b.van + i).map(n => {
                const ry = lys.find(x => x.weeknommer === n)
                const klas = ry ? (ry.gepubliseer ? 'lewe' : 'geskryf') : 'leeg'
                return (
                  <div key={n} className={`vj-blok ${klas}`}>
                    <button className="vj-blok-hoof" onClick={() => maakOop(n)}>
                      <span className="vj-blok-n">{n}</span>
                      <span className="vj-blok-t">{ry ? ry.titel : '—'}</span>
                    </button>
                    {/* Reguit na die voorskou, sonder om eers deur die vorm te
                        gaan. Dewald: "ek soek knoppie waar ek kan kliek en
                        presies kan sien wat die gebruikers gaan sien." */}
                    {ry && (
                      <button className="vj-blok-oog" title="Sien wat die gebruiker sien"
                              onClick={async () => { await maakOop(n); setVoorskou(true) }}>
                        👁
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Die voorskou ──────────────────────────────────────────────────── */
  if (voorskou) {
    return (
      <div className="vj">
        <div className="vj-balk">
          <button className="vj-terug" onClick={() => setVoorskou(false)}>← Terug na redigeer</button>
          <div className="vj-radio">
            {[['solo', 'Alleen'], ['groep', 'In n groep'], ['fasiliteerder', 'Fasiliteerder']].map(([s, w]) => (
              <button key={s} className={rol === s ? 'aan' : ''} onClick={() => setRol(s)}>{w}</button>
            ))}
          </div>
        </div>
        {/* Die EGTE komponent, nie 'n namaaksel nie. 'n Voorskou wat sy eie
            weergawe van die skerm teken, is 'n voorskou wat lieg — dit sou
            reg kon lyk terwyl die ding wat mense sien, stukkend is. */}
        {/* Die voorskou moet die EGTE skerm wys, en dit is nie meer een skerm
            nie: Week 1 is oorgeskryf as 'n pad van stappe (VolgJesusStap) en
            die res van die weke gebruik nog die plat uitleg. Wys die admin die
            verkeerde een, is die voorskou 'n voorskou wat LIEG — dit kan reg
            lyk terwyl die ding wat mense sien iets anders is.

            Die groep- en fasiliteerderblaaie leef nog net in die ou skerm, dus
            gaan net die solo-rol na die stapskerm. */}
        <div className="vj-skerm" key={rol}>
          {week.weeknommer === 1 && rol === 'solo'
            ? <VolgJesusStap week={week} />
            : <VolgJesusWeek week={week} rol={rol} />}
        </div>
      </div>
    )
  }

  /* ── Redigeer ──────────────────────────────────────────────────────── */
  const bew = bewegingVir(week.weeknommer)
  return (
    <div className="vj">
      <div className="vj-balk">
        <button className="vj-terug" onClick={() => { setWeek(null); setBoodskap(null) }}>← Al 52 weke</button>
        <div className="vj-balk-knoppe">
          <button className="vj-knop-oog" onClick={() => setVoorskou(true)}>
            👁 Sien wat die gebruiker sien
          </button>
          <button className="vj-knop" onClick={stoor} disabled={besig}>
            {besig ? 'Besig…' : 'Stoor'}
          </button>
        </div>
      </div>

      <h3 className="vj-titel">
        Week {week.weeknommer} — {week.titel || 'sonder titel'}
        {week.gepubliseer && <span className="vj-lewe-merk">LEWENDIG</span>}
      </h3>
      {bew && <p className="vj-sub">Beweging {bew.nommer}: {bew.naam}</p>}

      {boodskap && (
        <p className={`vj-boodskap ${boodskap.goed ? 'goed' : 'sleg'}`}>{boodskap.teks}</p>
      )}

      {WEKE[week.weeknommer] && (() => {
        const anders = verskilVanBron(week)
        return (
          <>
            {anders.length > 0 && (
              <div className="vj-verouderd">
                <strong>Die geskrewe teks het verander</strong>
                <p>
                  {anders.length === 1
                    ? 'Een veld hier verskil van wat in die kode staan'
                    : `${anders.length} velde hier verskil van wat in die kode staan`}
                  {' '}({anders.slice(0, 6).join(', ')}{anders.length > 6 ? '…' : ''}).
                  {' '}Wat jy hier en in die voorskou sien, is die ou weergawe uit die databasis.
                  Laai die nuwe teks en druk Stoor.
                </p>
              </div>
            )}
            <button className={`vj-laai${anders.length ? ' vj-laai-nodig' : ''}`}
                    onClick={() => laaiGeskrewe(week.weeknommer)}>
              ↓ Laai die geskrewe teks vir Week {week.weeknommer}
            </button>
          </>
        )
      })()}

      <Veld l="Titel"        v={week.titel}        op={v => stel('titel', v)} />
      <Veld l="Doel van die week" v={week.doel}    op={v => stel('doel', v)} lank />
      <Veld l="Openingskerm" v={week.openingskerm} op={v => stel('openingskerm', v)} lank />

      <SkrifVeld l="Primêre Skrif"       v={week.primereSkrif}        op={v => stel('primereSkrif', v)} />
      <SkrifVeld l="Ondersteunende Skrif" v={week.ondersteunendeSkrif} op={v => stel('ondersteunendeSkrif', v)} />

      <VideoVeld waarde={week.videoId || ''} op={v => stel('videoId', v)} />

      {/* Die stemboodskap. Vir Week 1 VERVANG dit die video heeltemal — Dewald
          neem dit self op en die app speel dit. Plak die volle adres van die
          klanklêer (dieselfde soort skakel as 'n gewone stemnota). */}
      <Veld l="Stemboodskap (adres van die klanklêer)"
            v={week.stemboodskapUrl}
            op={v => stel('stemboodskapUrl', v)} />
      <p className="vj-sub vj-fyn">
        Laat dit leeg en die skerm sê eerlik "Die stemboodskap kom binnekort" in
        plaas daarvan om 'n dooie speler te wys.
      </p>

      <Veld l="Hou dit vas (Dag 1, en die wallpaper se sin)" v={week.kernwaarheid} op={v => stel('kernwaarheid', v)} lank />
      <Veld l="Die laaste hou (Dag 1)" v={week.eenSin} op={v => stel('eenSin', v)} lank />
      <Veld l="Hierdie week se kernwaarheid (fasiliteerder)" v={week.weekKern} op={v => stel('weekKern', v)} lank />
      <Veld l="Wallpaper (pad na die prent)" v={week.wallpaper} op={v => stel('wallpaper', v.trim())} />
      <Veld l="Privaat refleksie"      v={week.privaatRefleksie} op={v => stel('privaatRefleksie', v)} lank />
      <Veld l="Gehoorsaamheidstap"     v={week.gehoorsaamheidStap} op={v => stel('gehoorsaamheidStap', v)} lank />
      <Veld l="Gebed"                  v={week.gebed} op={v => stel('gebed', v)} lank />

      <h4 className="vj-afdeling">Elke dag se opskrif</h4>
      {[1, 2, 3, 4, 5].map(n => (
        <Veld key={n} l={`Dag ${n} — opskrif`} v={week[`dag${n}Titel`]}
              op={v => stel(`dag${n}Titel`, v)} />
      ))}

      <h4 className="vj-afdeling">Dag 2 tot 5</h4>
      <SkrifVeld l="Dag 2 — Skrif" v={week.dag2Skrif} op={v => stel('dag2Skrif', v)} />
      <Veld l="Dag 2 — vraag"  v={week.dag2Prompt} op={v => stel('dag2Prompt', v)} lank />
      <SkrifVeld l="Dag 3 — Skrif" v={week.dag3Skrif} op={v => stel('dag3Skrif', v)} />
      <Veld l="Dag 3 — vraag"  v={week.dag3Prompt} op={v => stel('dag3Prompt', v)} lank />
      <SkrifVeld l="Dag 4 — Skrif" v={week.dag4Skrif} op={v => stel('dag4Skrif', v)} />
      <Veld l="Dag 4 — hartsvraag" v={week.dag4Vraag} op={v => stel('dag4Vraag', v)} lank />
      <Veld l="Dag 5 — leef dit"   v={week.dag5Prompt} op={v => stel('dag5Prompt', v)} lank />
      {/* Die haak na môre. Geen streak, geen "moenie jou rekord verloor
          nie" — net 'n rede om nuuskierig te wees. */}
      <Veld l="Môre-haak (wat wag môre?)" v={week.moreTeaser}
            op={v => stel('moreTeaser', v)} lank />

      <h4 className="vj-afdeling">Die groep</h4>
      <Veld l="Groepvraag 1" v={week.groepVraag1} op={v => stel('groepVraag1', v)} lank />
      <Veld l="Groepvraag 2" v={week.groepVraag2} op={v => stel('groepVraag2', v)} lank />
      <Veld l="Groepvraag 3" v={week.groepVraag3} op={v => stel('groepVraag3', v)} lank />
      <Veld l="Groepvraag 4 (opsioneel)" v={week.groepVraag4} op={v => stel('groepVraag4', v)} lank />

      <h4 className="vj-afdeling">Die fasiliteerder</h4>
      <Veld l="Hoofpunt" v={week.fasiliteerderHoofpunt} op={v => stel('fasiliteerderHoofpunt', v)} lank />
      <Veld l="Wat ons NIE uit die teks moet aflei nie" v={week.fasiliteerderGrens}
            op={v => stel('fasiliteerderGrens', v)} lank />

      <div className="vj-veld">
        <label>Pastorale risiko</label>
        <div className="vj-radio">
          {RISIKO_VLAKKE.map(r => (
            <button key={r} className={week.pastoraleRisiko === r ? 'aan' : ''}
                    onClick={() => stel('pastoraleRisiko', r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Punt 3 §36: hierdie blok verskyn NET waar nodig — en waar dit nodig
          is, is dit verpligtend. Week 22 (huwelik) en Week 30 (vergifnis) kan
          mishandeling oopmaak. */}
      {week.pastoraleRisiko === 'hoog' && (
        <Veld l="⚠ Fasiliteerderwaarskuwing (verpligtend by hoë risiko)"
              v={week.fasiliteerderWaarskuwing}
              op={v => stel('fasiliteerderWaarskuwing', v)} lank />
      )}

      <h4 className="vj-afdeling">Die vyf kontroles</h4>
      <p className="vj-sub">Geen week publiseer voordat al vyf groen is nie.</p>
      {KONTROLES.map(k => (
        <label key={k.sleutel} className="vj-kontrole">
          <input type="checkbox" checked={(week.kontroles || {})[k.sleutel] === true}
                 onChange={e => stelKontrole(k.sleutel, e.target.checked)} />
          <span><strong>{k.sleutel}</strong> — {k.vraag}</span>
        </label>
      ))}

      <div className="vj-veld">
        <label>Teologiese hersiening</label>
        <div className="vj-radio">
          {['wag', 'goedgekeur'].map(s => (
            <button key={s} className={week.hersieningStatus === s ? 'aan' : ''}
                    onClick={() => stel('hersieningStatus', s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className={`vj-status ${foute.length ? 'sleg' : 'goed'}`}>
        {foute.length === 0
          ? '✓ Hierdie week is gereed om te publiseer.'
          : <>
              <strong>Nog nie gereed nie — {foute.length} ding{foute.length === 1 ? '' : 'e'}:</strong>
              <ul>{foute.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </>}
      </div>

      {/* Die knoppie wat die week vir die wêreld aanskakel. Dit staan DIREK
          onder die vyf kontroles, want dit is die ding waarvoor daardie
          kontroles bestaan. */}
      <div className={`vj-publiseer${week.gepubliseer ? ' aan' : ''}`}>
        {week.gepubliseer ? (
          <>
            <div className="vj-publiseer-kop">✓ HIERDIE WEEK IS LEWENDIG</div>
            <p>
              Die kaart op Luister wys Week {week.weeknommer} en mense kan hom doen.
              Stoor jy nou iets, is dit dadelik by hulle.
            </p>
            <button className="vj-af" onClick={() => stelPublikasie(false)} disabled={besig}>
              {besig ? 'Besig…' : 'Haal dit uit die app uit'}
            </button>
          </>
        ) : (
          <>
            <div className="vj-publiseer-kop">HIERDIE WEEK IS NOG NIE IN DIE APP NIE</div>
            <p>
              {foute.length
                ? 'Maak eers al vyf die kontroles hierbo groen en keur die hersiening goed.'
                : 'Druk hier en Week ' + week.weeknommer + ' is dadelik lewendig vir almal.'}
            </p>
            <button className="vj-op" onClick={() => stelPublikasie(true)}
                    disabled={besig || foute.length > 0}>
              {besig ? 'Besig…' : `⬆  Publiseer Week ${week.weeknommer}`}
            </button>
          </>
        )}
      </div>

      <div className="vj-onder">
        <button className="vj-knop-oog" onClick={() => setVoorskou(true)}>
          👁 Sien wat die gebruiker sien
        </button>
        <button className="vj-knop" onClick={stoor} disabled={besig}>
          {besig ? 'Besig…' : 'Stoor'}
        </button>
      </div>
    </div>
  )
}

/* ── Hoeveel mense loop die program ──
 *
 * Dewald: "en as iemand die program doen moet dit in admin tel hoeveel mense
 * begin het en so."
 *
 * Vier getalle bo, en dan een ry per week wat lewendig is.
 *
 * ── Wat elke getal WERKLIK beteken ──
 *
 * Dit staan op die skerm, want 'n getal sonder sy definisie is 'n getal wat
 * later verkeerd aangehaal word. Hierdie projek het daardie fout al gemaak
 * met die installasie-teller minus die tokens — 'n aftreksom wat soos 'n feit
 * gelyk het en 'n raaiskoot was.
 *
 * Elke TOESTEL tel homself een keer per ding. Dieselfde mens op twee fone tel
 * dus twee keer, en 'n herinstallasie tel weer. Die getal is 'n bietjie te
 * laag eerder as te hoog, en dit is die regte kant om op te fouteer.
 *
 * Daar is geen naam, geen e-pos en geen toestel-id agter hierdie getalle nie.
 * Wat mense in die program tik, verlaat nooit hulle foon nie. */
function Tellers({ tellers, lys }) {
  if (!tellers) return null
  const n = v => Number(tellers[v] || 0)
  const lewe = (lys || []).filter(w => w.gepubliseer).map(w => w.weeknommer).sort((a, b) => a - b)

  const GROOT = [
    ['Het die kaart oopgemaak', n('oop'),      'Op Luister gedruk en die program oopgemaak.'],
    ['Het BEGIN gedruk',        n('begin'),    'Werklik met \u2019n week begin.'],
    ['Dae voltooi',             n('dagKlaar'), 'Elke keer wat iemand \u2018Klaar met dag\u2019 gedruk het.'],
    ['Weke voltooi',            n('weekKlaar'),'Al vyf dae van \u2019n week klaar.'],
  ]

  return (
    <div className="vj-tellers">
      <div className="vj-tellers-kop">HOEVEEL MENSE LOOP DIE PROGRAM</div>
      <div className="vj-tellers-ry">
        {GROOT.map(([w, v, fyn]) => (
          <div key={w} className="vj-teller">
            <span className="vj-teller-n">{v.toLocaleString('af-ZA').replace(/,/g, '\u00a0')}</span>
            <span className="vj-teller-w">{w}</span>
            <span className="vj-teller-f">{fyn}</span>
          </div>
        ))}
      </div>

      {lewe.length > 0 && (
        <table className="vj-teller-tabel">
          <thead>
            <tr><th>Week</th><th>Begin</th><th>Dag 1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>Klaar</th></tr>
          </thead>
          <tbody>
            {lewe.map(w => (
              <tr key={w}>
                <td>{w}</td>
                <td>{n(`w${w}begin`)}</td>
                {[1, 2, 3, 4, 5].map(d => <td key={d}>{n(`w${w}dag${d}`)}</td>)}
                <td>{n(`w${w}klaar`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="vj-sub vj-fyn">
        Een toestel tel een keer per ding. Twee fone is twee; ’n
        herinstallasie tel weer. Geen naam, geen e-pos, geen toestel-id —
        net getalle.
      </p>
    </div>
  )
}

function Veld({ l, v, op, lank }) {
  return (
    <div className="vj-veld">
      <label>{l}</label>
      {lank
        ? <textarea rows={3} value={v || ''} onChange={e => op(e.target.value)} />
        : <input value={v || ''} onChange={e => op(e.target.value)} />}
    </div>
  )
}

/* 'n Skrifveld wys dadelik wat dit ontleed het. 'n Verwysing wat ons nie kan
   lees nie, is 'n verwysing wat die app nie sal kan wys nie. */
function SkrifVeld({ l, v, op }) {
  const spanne = ontleedVerwysing(v || '')
  return (
    <div className="vj-veld">
      <label>{l}</label>
      <input value={v || ''} onChange={e => op(e.target.value)} placeholder="Johannes 1:1–18" />
      {v && (spanne.length
        ? <span className="vj-ok">
            {spanne.map(s => `${s.boek} ${s.hoofstuk ?? ''}${s.van ? ':' + s.van + '-' + s.tot : ''}`).join(' · ')}
          </span>
        : <span className="vj-fout">Kan hierdie verwysing nie lees nie</span>)}
    </div>
  )
}
