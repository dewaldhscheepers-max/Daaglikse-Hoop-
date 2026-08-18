/* ── VOLG JESUS · een stap op 'n slag ──
 *
 * Dewald: "Moenie ’n hele dag as een lang dokument op een skerm wys nie. Elke
 * dag moet soos ’n rustige, persoonlike reis voel: Lees → Luister/Dink →
 * Reageer → Bid → Voltooi. Gebruik een duidelike primêre aksie per skerm."
 *
 * Die ou skerm het 'n hele dag in een blad gegooi en 'n mens moes daardeur
 * skuif. Hierdie een wys EEN ding, met EEN knoppie, en dan die volgende.
 *
 * ── Wat hierdie skerm NIE doen nie ──
 *
 * Geen punte. Geen ranglys. Geen XP. Geen streak. Geen skuldtaal. Die enigste
 * vordering wat gewys word, is "DAG 2 VAN 5" en "stap 3 van 8" — 'n mens moet
 * kan sien hoe ver hy is sonder om iets te verloor.
 *
 * ── Alles wat hier geskryf word, bly op die foon ──
 *
 * Elke antwoord gaan na localStorage en NERENS anders nie. Geen groep, geen
 * fasiliteerder, geen kerk-admin kan daaraan kom, want daar is niks om aan te
 * kom nie: dit verlaat nooit die toestel nie. Dit staan ook op die skerm,
 * want 'n mens moet dit KAN SIEN voor hy iets eerliks tik.
 *
 * ── Die belangrikste oomblik ──
 *
 * Op Dag 5 wys die app die mens sy EIE Dag 1-antwoord terug. Nie "onthou wat
 * jy gedink het?" nie — die werklike woorde. Is daar niks gestoor nie, word
 * daardie kaart heeltemal oorgeslaan; nooit `undefined`, nooit 'n leë blok.
 */
import { useEffect, useRef, useState } from 'react'
import { ontleedVerwysing } from '../data/volgJesus'
import {
  WEEK1_DAE, WEEK1_REIS, WEEK1_TRANSKRIPSIE, BEGINPUNT, DAG5_INLEI, stappeVirDag,
} from '../data/volgJesusWeek1'
import Stemboodskap from '../components/Stemboodskap'
import '../components/Stemboodskap.css'
import './VolgJesusStap.css'

/* Waar 'n antwoord staan. Per week, sodat Week 2 se "dink" nie Week 1 s'n
   oorskryf nie. */
const antwoordSleutel = (w, id) => `vj_a_w${w}_${id}`
const plekSleutel = w => `vj_plek_w${w}`

function lees(w, id) {
  try { return localStorage.getItem(antwoordSleutel(w, id)) || '' } catch { return '' }
}
function skryf(w, id, waarde) {
  try { localStorage.setItem(antwoordSleutel(w, id), waarde) } catch {}
}

/* Alles wat hierdie mens al geskryf het. Dit dryf die takke (Dag 3 se area)
   en die terugblik (Dag 5). */
function alleAntwoorde(w) {
  const uit = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      const voor = `vj_a_w${w}_`
      if (k && k.startsWith(voor)) uit[k.slice(voor.length)] = localStorage.getItem(k)
    }
  } catch {}
  return uit
}

export default function VolgJesusStap({ week, opSluit, opBegin, opDagKlaar, binnekort }) {
  const w = Number(week && week.weeknommer) || 1

  /* 'oop' | 'begin' | 'dag' | 'klaar' | 'weekklaar' */
  const [blad, setBlad] = useState('oop')
  const [dag, setDag]   = useState(1)
  const [stap, setStap] = useState(0)
  const [antwoorde, setAntwoorde] = useState(() => alleAntwoorde(w))
  const bladRef = useRef(null)

  /* Hervat waar hy opgehou het. Dewald: "gebruiker moet altyd presies kan
     hervat waar hy/sy opgehou het." */
  const [hervat, setHervat] = useState(null)
  useEffect(() => {
    try {
      const rou = localStorage.getItem(plekSleutel(w))
      if (!rou) return
      const p = JSON.parse(rou)
      if (p && p.dag >= 1 && p.dag <= 5) setHervat(p)
    } catch {}
  }, [w])

  function stoorPlek(d, s) {
    try { localStorage.setItem(plekSleutel(w), JSON.stringify({ dag: d, stap: s })) } catch {}
  }

  function boToe() {
    try { window.scrollTo({ top: 0 }) } catch {}
    try {
      const h = document.querySelector('.vjl-blad')
      if (h) h.scrollTop = 0
      if (bladRef.current) bladRef.current.scrollTop = 0
    } catch {}
  }

  function stelAntwoord(id, waarde) {
    skryf(w, id, waarde)
    setAntwoorde(a => ({ ...a, [id]: waarde }))
  }

  /* Stappe wat net vir SOMMIGE mense bestaan (die "as jy nog nie seker is
     nie"-kaart) word heeltemal uitgelaat, nie oorgeslaan nie. 'n Stap wat
     bestaan maar homself dadelik verbyspring, laat die vorderingspitte lieg. */
  const stappe = stappeVirDag(dag, antwoorde)
    .filter(st => !st.netAs || antwoorde[st.netAs.id] === st.netAs.waarde)
  const dagInfo = WEEK1_DAE.find(d => d.n === dag) || WEEK1_DAE[0]

  function volgende() {
    const s = stap + 1
    if (s >= stappe.length) {
      setBlad('klaar'); boToe()
      if (opDagKlaar) { try { opDagKlaar(dag) } catch {} }
      stoorPlek(dag, 0)
      return
    }
    setStap(s); stoorPlek(dag, s); boToe()
  }

  function beginDag(n, by = 0) {
    setDag(n); setStap(by); setBlad('dag'); stoorPlek(n, by); boToe()
  }

  /* ── Die openingskerm ─────────────────────────────────────────────── */
  if (blad === 'oop') {
    return (
      <div className="vs">
        <div className="vs-open">
          <div className="vs-merk">WEEK {w} VAN 52</div>
          <h1 className="vs-open-titel">{week.titel}</h1>
          {week.openingskerm && <p className="vs-open-teks">{week.openingskerm}</p>}
          <p className="vs-privaat">
            🔒 Alles wat jy hier skryf, is privaat. Dit bly op hierdie foon —
            niemand anders sien dit nie.
          </p>

          {/* Hervat. Dit staan BO die begin-knoppie, want iemand wat terugkom,
              soek dit eerste. */}
          {hervat && hervat.dag >= 1 ? (
            <>
              <button className="vs-hoofknop" onClick={() => beginDag(hervat.dag, hervat.stap || 0)}>
                GAAN VOORT MET DAG {hervat.dag}
              </button>
              <p className="vs-hervat">Welkom terug. Gaan voort waar jy opgehou het.</p>
            </>
          ) : (
            <button className="vs-hoofknop" onClick={() => {
              if (opBegin) { try { opBegin() } catch {} }
              setBlad('begin'); boToe()
            }}>
              BEGIN WEEK {w}
            </button>
          )}
        </div>

        <div className="vs-dae">
          {WEEK1_DAE.map(d => (
            <button key={d.n} className="vs-dag-ry" onClick={() => beginDag(d.n)}>
              <span className="vs-dag-merk">DAG {d.n}</span>
              <span className="vs-dag-t">{d.titel}</span>
              <span className="vs-dag-pyl">›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ── Waar begin jy vandag ─────────────────────────────────────────── */
  if (blad === 'begin') {
    const gekies = antwoorde[BEGINPUNT.id]
    const keuse = BEGINPUNT.keuses.find(k => k.waarde === gekies)
    return (
      <div className="vs" ref={bladRef}>
        <div className="vs-kaart">
          <div className="vs-kop">{BEGINPUNT.kop}</div>
          <p className="vs-lyf">{BEGINPUNT.lyf}</p>
          <div className="vs-keuses">
            {BEGINPUNT.keuses.map(k => (
              <button key={k.waarde} className={gekies === k.waarde ? 'aan' : ''}
                      onClick={() => stelAntwoord(BEGINPUNT.id, k.waarde)}>
                {k.woorde}
              </button>
            ))}
          </div>
          {keuse && <p className="vs-antwoord">{keuse.antwoord}</p>}
        </div>
        <button className="vs-hoofknop" disabled={!gekies}
                onClick={() => beginDag(1)}>
          {BEGINPUNT.knop}
        </button>
      </div>
    )
  }

  /* ── Dag klaar ────────────────────────────────────────────────────── */
  if (blad === 'klaar') {
    const laaste = dag === 5
    return (
      <div className="vs" ref={bladRef}>
        <div className="vs-klaar">
          <div className="vs-klaar-merk">✓</div>
          <div className="vs-merk">DAG {dag} VAN 5 VOLTOOI</div>
          <h2>{dagInfo.klaarKop}</h2>
          {dagInfo.klaarLyf && <p className="vs-klaar-lyf">{dagInfo.klaarLyf}</p>}

          {dagInfo.more && (
            <div className="vs-more">
              <span className="vs-more-kop">MÔRE</span>
              <p>{dagInfo.more}</p>
            </div>
          )}

          {laaste && binnekort && (
            <div className="vs-more">
              <span className="vs-more-kop">{binnekort.kop}</span>
              <p>{binnekort.lyf}</p>
            </div>
          )}

          <button className="vs-hoofknop" onClick={() => {
            if (laaste) { setBlad('oop'); boToe(); if (opSluit) opSluit() }
            else { setBlad('oop'); boToe() }
          }}>
            {laaste ? 'VOLTOOI WEEK 1' : `VOLTOOI DAG ${dag}`}
          </button>
          {!laaste && (
            <button className="vs-stil" onClick={() => beginDag(dag + 1)}>
              Ek wil nou al met Dag {dag + 1} aangaan
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── 'n Stap ──────────────────────────────────────────────────────── */
  const s = stappe[Math.min(stap, stappe.length - 1)]
  return (
    <div className="vs" ref={bladRef}>
      <div className="vs-balk">
        <button className="vs-terug" onClick={() => { setBlad('oop'); boToe() }}>
          ‹ Week {w}
        </button>
        <span className="vs-balk-dag">DAG {dag} VAN 5</span>
      </div>

      {/* Rustige vordering. Geen punte, net waar 'n mens in die dag is. */}
      <div className="vs-vorder">
        {stappe.map((_, i) => (
          <span key={i} className={`vs-pit${i <= stap ? ' aan' : ''}`} />
        ))}
      </div>

      <Stap stap={s} week={week} w={w} antwoorde={antwoorde}
            stel={stelAntwoord} volgende={volgende} />
    </div>
  )
}

/* ── Een stap ───────────────────────────────────────────────────────── */
function Stap({ stap: s, week, w, antwoorde, stel, volgende }) {
  if (!s) return null

  if (s.soort === 'lees') {
    return (
      <>
        <Lees kop={s.kop} skrif={s.skrif} lyf={s.lyf} />
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'stem') {
    return (
      <>
        <Stemboodskap
          bron={week.stemboodskapUrl}
          titel={s.titel}
          sleutel={`w${w}`}
          transkripsie={w === 1 ? WEEK1_TRANSKRIPSIE : week.transkripsie}
        />
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'teks') {
    const inlei = s.inleiVan ? DAG5_INLEI[antwoorde[s.inleiVan]] : null
    return (
      <>
        <div className="vs-kaart">
          {s.kop && <div className="vs-kop">{s.kop}</div>}
          {inlei && <p className="vs-inlei">{inlei}</p>}
          <p className="vs-lyf">{s.lyf}</p>
          {s.fyn && <p className="vs-fyn">🔒 {s.fyn}</p>}
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'hou') {
    return (
      <>
        <div className="vs-hou">
          <div className="vs-hou-kop">HOU DIT VAS</div>
          <p>{s.lyf}</p>
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'bid') {
    return (
      <>
        <div className="vs-bid">
          {s.kop && <div className="vs-kop">{s.kop}</div>}
          <p>{s.gebed}</p>
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'vraag') {
    const klaar = s.magOorslaan || s.velde.every(v => String(antwoorde[v.id] || '').trim())
    return (
      <>
        <div className="vs-kaart">
          {s.kop && <div className="vs-kop">{s.kop}</div>}
          {s.lyf && <p className="vs-lyf">{s.lyf}</p>}
          {s.velde.map(v => (
            <div key={v.id} className="vs-veld">
              <label>{v.prompt}</label>
              <textarea
                value={antwoorde[v.id] || ''}
                onChange={e => stel(v.id, e.target.value)}
                placeholder="Skryf vir jouself…"
                rows={4}
              />
            </div>
          ))}
          <p className="vs-fyn">🔒 Net jy kan hierdie lees. Dit bly op hierdie foon.</p>
        </div>
        {/* Die stemboodskap kan aangestuur word. Dit staan HIER en nie by die
            speler nie: 'n mens deel iets nadat dit hom getref het, nie voor
            hy dit gehoor het nie. */}
        {s.deelStem && week.stemboodskapUrl && (
          <button className="vs-deel-stem"
                  onClick={() => deelWoorde(
                    `Luister na hierdie: "${week.titel}" — VOLG JESUS, Week ${w}.`,
                    week.stemboodskapUrl)}>
            📤  Deel die stemboodskap
          </button>
        )}
        <button className="vs-hoofknop" onClick={volgende} disabled={!klaar}>{s.knop}</button>
        {!klaar && <p className="vs-wag">Skryf iets — al is dit net een sin.</p>}
      </>
    )
  }

  if (s.soort === 'keuse') {
    const gekies = antwoorde[s.id]
    const k = s.keuses.find(x => x.waarde === gekies)
    return (
      <>
        <div className="vs-kaart">
          {s.kop && <div className="vs-kop">{s.kop}</div>}
          {s.lyf && <p className="vs-lyf">{s.lyf}</p>}
          <div className="vs-keuses">
            {s.keuses.map(x => (
              <button key={x.waarde} className={gekies === x.waarde ? 'aan' : ''}
                      onClick={() => stel(s.id, x.waarde)}>
                {x.woorde}
              </button>
            ))}
          </div>
          {k && k.antwoord && <p className="vs-antwoord">{k.antwoord}</p>}
        </div>
        <button className="vs-hoofknop" onClick={volgende} disabled={!gekies}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'spieel') {
    const gekies = antwoorde[s.id]
    return (
      <>
        <div className="vs-kaart">
          <div className="vs-kop">{s.kop}</div>
          <p className="vs-lyf">{s.lyf}</p>
          <div className="vs-keuses">
            {s.areas.map(a => (
              <button key={a.waarde} className={gekies === a.waarde ? 'aan' : ''}
                      onClick={() => stel(s.id, a.waarde)}>
                {a.woorde}
              </button>
            ))}
          </div>
        </div>
        <button className="vs-hoofknop" onClick={volgende} disabled={!gekies}>GAAN AAN</button>
      </>
    )
  }

  /* ── Die terugblik ──
   *
   * Die belangrikste oomblik in die week: die app wys 'n mens sy EIE woorde
   * terug. Is daar niks gestoor nie, slaan ons hierdie skerm heeltemal oor —
   * 'n leë aanhalingsteken is erger as geen kaart. */
  if (s.soort === 'terugblik') {
    const teks = String(antwoorde[s.bronId] || '').trim()
    if (!teks) { volgende(); return null }
    return (
      <>
        <div className="vs-terugblik">
          <div className="vs-kop">{s.kop}</div>
          <div className="vs-terugblik-kop">{s.bronKop}</div>
          <blockquote>{teks}</blockquote>
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  /* ── Nog 'n area op Dag 3 ──
   *
   * Dewald: "Dit is nooit nodig om nog 'n area te kies om Dag 3 te voltooi
   * nie." Die primêre knoppie gaan dus AAN; die tweede een is die sagte een.
   * Kies hy weer, begin die spieël van voor af met 'n skoon keuse. */
  if (s.soort === 'nogArea') {
    return (
      <>
        <div className="vs-kaart">
          <p className="vs-lyf">{s.lyf}</p>
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
        <button className="vs-stil" onClick={() => stel('area', '')}>
          Ek wil nog ’n area ondersoek
        </button>
      </>
    )
  }

  /* ── Die wallpaper ──
   *
   * Dit is die enigste deel van die week wat BUITE die app gesien word: die
   * adres is in die prent ingebrand, en dus is elke deelnemer se sluitskerm 'n
   * week lank 'n stil uitnodiging.
   *
   * Let op hoe die voorskou geteken word: 'n CSS-`background-image` op 'n
   * ONDEURSIGTIGE houer, nooit 'n volskerm <img> nie — sien CLAUDE.md. */
  if (s.soort === 'wallpaper') {
    if (!week.wallpaper) { return <Slaan volgende={volgende} /> }
    return (
      <>
        <div className="vs-wp">
          <div className="vs-kop">{s.kop}</div>
          <div className="vs-wp-prent" style={{ backgroundImage: `url(${week.wallpaper})` }} />
          <DeelKnop
            bron={week.wallpaper}
            naam={`volg-jesus-week-${w}.webp`}
            woorde="Stoor dit as jou agtergrond, sodat die vraag die hele week voor jou bly — of deel dit met iemand."
            knop="Stoor of deel"
          />
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  /* ── Die deelbare kaart ──
   *
   * Die een sin, om aan te stuur. Dit dra die adres saam, want die punt is dat
   * die mens wat dit kry, self hier kan uitkom. */
  if (s.soort === 'deelkaart') {
    return (
      <>
        <div className="vs-hou">
          <div className="vs-hou-kop">{s.kop}</div>
          <p>{s.sin}</p>
          <button className="vs-deel" onClick={() => deelWoorde(s.sin)}>
            📤  Deel dit
          </button>
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  if (s.soort === 'reis') {
    const rye = WEEK1_REIS
      .map(r => ({ kop: r.kop, teks: String(antwoorde[r.id] || '').trim() }))
      .filter(r => r.teks)
    return (
      <>
        <div className="vs-kaart">
          <div className="vs-kop">{s.kop}</div>
          {rye.length === 0
            ? <p className="vs-lyf">Jy het hierdie week deurgeloop. Wat jy geskryf het, bly hier vir jou.</p>
            : rye.map((r, i) => (
                <div key={i} className="vs-reis-ry">
                  <span>{r.kop}</span>
                  <blockquote>{r.teks}</blockquote>
                </div>
              ))}
          <p className="vs-fyn">
            🔒 Hierdie antwoorde is net vir jou. Jy kan later terugkom en weer sien
            waar jou reis begin het.
          </p>
        </div>
        <button className="vs-hoofknop" onClick={volgende}>{s.knop}</button>
      </>
    )
  }

  return null
}

/* 'n Stap wat niks het om te wys nie, gaan dadelik verby. Dit gebeur net vir
   'n week sonder wallpaper. */
function Slaan({ volgende }) {
  useEffect(() => { volgende() }, [])
  return null
}

/* Deel woorde (en 'n skakel) met wie ook al. Val `navigator.share` weg — soos
   op 'n rekenaar — beland dit op die knipbord. */
async function deelWoorde(teks, skakel) {
  const boodskap = skakel ? `${teks}\n\n${skakel}` : `${teks}\n\nhttps://dewaldscheepers.com/go`
  try {
    if (navigator.share) { await navigator.share({ text: boodskap }); return }
  } catch { return }
  try { await navigator.clipboard.writeText(boodskap) } catch {}
}

/* Die wallpaper stoor of deel. Dieselfde les as Luister.jsx: sodra daar 'n
   LEER by navigator.share() is, gooi WhatsApp die byskrif weg — elke ander app
   hou dit. Daarom is die adres in die PRENT ingebrand en nie net in die teks
   nie. */
function DeelKnop({ bron, naam, woorde, knop }) {
  const [besig, setBesig] = useState(false)
  const [nota, setNota]   = useState(null)

  async function deel() {
    if (besig) return
    setBesig(true); setNota(null)
    try {
      const r = await fetch(bron)
      const b = r.ok ? await r.blob() : null
      if (!b || !/^image\//.test(b.type) || b.size < 1024) {
        setNota('Die prent wou nie laai nie. Hou lank op die prent vas om dit te stoor.')
        setBesig(false); return
      }
      const leer = new File([b], naam, { type: b.type })
      if (navigator.canShare && navigator.canShare({ files: [leer] })) {
        try {
          await navigator.share({ files: [leer] })
          setNota('Gestuur. Sit dit op jou sluitskerm of jou status.')
          setBesig(false); return
        } catch (e) { if (e && e.name === 'AbortError') { setBesig(false); return } }
      }
      const url = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = url; a.download = naam
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
      setNota('Afgelaai.')
    } catch {
      setNota('Hou lank op die prent vas om dit te stoor.')
    }
    setBesig(false)
  }

  return (
    <>
      <button className="vs-deel" onClick={deel} disabled={besig}>
        {besig ? 'Besig…' : knop}
      </button>
      <p className="vs-wp-fyn">{woorde}</p>
      {nota && <p className="vs-wp-nota">{nota}</p>}
    </>
  )
}

/* Die LEES-kaart, met die knoppie na die app se eie Bybel. Dieselfde patroon
   as die vorige skerm: kan die verwysing nie ontleed word nie, verdwyn net
   die knoppie — niemand kry 'n knoppie wat niks doen nie. */
function Lees({ kop, skrif, lyf }) {
  const [gestuur, setGestuur] = useState(false)
  const spanne = ontleedVerwysing(skrif)
  const eerste = spanne && spanne[0]

  function maakOop() {
    if (!eerste) return
    try {
      window.dispatchEvent(new CustomEvent('open-bybel', {
        detail: { boek: eerste.boek, hoofstuk: eerste.hoofstuk, vers: eerste.van || null },
      }))
      setGestuur(true)
    } catch {}
  }

  return (
    <div className="vs-kaart vs-lees">
      <div className="vs-kop">{kop || 'LEES'}</div>
      <p className="vs-skrif">{skrif}</p>
      <p className="vs-lees-eis">
        Moenie hierdie deel oorslaan nie. Die res van vandag bou op hierdie
        gedeelte — gaan lees dit eers.
      </p>
      {eerste && (
        <button className="vs-lees-knop" onClick={maakOop}>
          📖  Lees dit in die app se Bybel
        </button>
      )}
      {eerste && <p className="vs-fyn-grys">Of lees dit in jou eie Bybel.</p>}
      {lyf && <p className="vs-lyf">{lyf}</p>}
      {gestuur && <p className="vs-lees-nota">Die Bybel maak by {skrif} oop.</p>}
    </div>
  )
}
