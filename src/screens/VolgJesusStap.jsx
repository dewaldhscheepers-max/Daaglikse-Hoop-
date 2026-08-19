/* ── VOLG JESUS · een blad per dag ──
 *
 * Dewald: "Die gebruiker moet nooit hierdie patroon ervaar nie: lees, klik,
 * lees, klik, skryf, klik, nog 'n kaart, klik. Die ideale gevoel is:
 * OPEN → SIEN EEN DING → DOEN EEN DING → ANTWOORD EEN DING → KLAAR."
 *
 * Die vorige weergawe van hierdie skerm was 'n ketting van agt skermpies met
 * agt knoppies. Dit was my verkeerde lees van "een stap op 'n slag": ek het
 * dit as baie klein skerms gebou in plaas van as MIN INHOUD. Die gevolg het
 * soos huiswerk gevoel.
 *
 * Nou is 'n dag EEN BLAD met 'n paar blokke en EEN knoppie onderaan.
 *
 * ── Wat hierdie skerm NIE doen nie ──
 *
 * Geen punte, geen ranglys, geen XP, geen streak, geen skuldtaal. Geen
 * "voltooiingsblad" met 'n opstel nie. Die enigste vordering is "DAG 2 VAN 5".
 *
 * ── Alles wat hier geskryf word, bly op die foon ──
 *
 * Elke antwoord gaan na localStorage en NERENS anders nie, en dit stoor
 * vanself terwyl 'n mens tik. Geen groep, geen fasiliteerder, geen kerk-admin
 * kan daaraan kom — daar is niks om aan te kom nie.
 */
import { useEffect, useRef, useState } from 'react'
import { ontleedVerwysing } from '../data/volgJesus'
import {
  WEEK1_DAE, WEEK1_REIS, WEEK1_TRANSKRIPSIE, WEEK1_OPENING, WEEK1_DEELSIN,
  WEEK1_VOLGENDE, blokkeVirDag,
} from '../data/volgJesusWeek1'
import Stemboodskap from '../components/Stemboodskap'
import '../components/Stemboodskap.css'
import { weekSkakel } from '../data/volgJesusNooi'
import './VolgJesusStap.css'

const antwoordSleutel = (w, id) => `vj_a_w${w}_${id}`
const plekSleutel = w => `vj_plek_w${w}`

function alleAntwoorde(w) {
  const uit = {}
  try {
    const voor = `vj_a_w${w}_`
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(voor)) uit[k.slice(voor.length)] = localStorage.getItem(k)
    }
  } catch {}
  return uit
}

export default function VolgJesusStap({
  week, opSluit, opBegin, opDagKlaar, binnekort,
  /* Die groep, as daar een is. 'n Solo-mens gee niks, en dan bestaan die
     groepblokke glad nie. */
  inGroep = false, opPraatMetGroep,
  /* Die admin se "Sien wat die gebruiker sien". Dit lees en skryf niks. */
  voorskou = false,
}) {
  const w = Number(week && week.weeknommer) || 1

  /* ── Die voorskou mag NIE aan die mens se plek raak nie ──
   *
   * Die admin se "Sien wat die gebruiker sien" gebruik hierdie einste
   * komponent, en dit was reg — dit is die enigste eerlike voorskou. Maar dit
   * het na DIESELFDE localStorage geskryf. Dewald het die vyf dae in die admin
   * deurgeloop om te kyk of hulle werk, en toe se sy eie app vir hom "VANDAG ·
   * DAG 5 · Gaan voort waar jy opgehou het" terwyl hy nog nooit 'n dag gedoen
   * het nie.
   *
   * 'n Voorskou lees nie en skryf nie. Hy begin elke keer waar 'n vreemde mens
   * sou begin, en dit is boonop 'n beter voorskou. */
  const lewend = !voorskou

  const [blad, setBlad] = useState('oop')      /* 'oop' | 'dag' | 'klaar' | 'weekklaar' */
  const [dag, setDag]   = useState(1)
  const [antwoorde, setAntwoorde] = useState(() => (voorskou ? {} : alleAntwoorde(w)))
  const [hervat, setHervat] = useState(0)
  /* Die week se dae is 'n tweede skerm, nie 'n taaklys op die eerste een nie. */
  const [wysWeek, setWysWeek] = useState(false)
  const bladRef = useRef(null)

  useEffect(() => {
    if (!lewend) { setHervat(0); return }
    try {
      const n = Number(localStorage.getItem(plekSleutel(w)))
      if (Number.isInteger(n) && n >= 1 && n <= 5) setHervat(n)
    } catch {}
  }, [w, lewend])

  function boToe() {
    try { window.scrollTo({ top: 0 }) } catch {}
    try {
      const h = document.querySelector('.vjl-blad')
      if (h) h.scrollTop = 0
      if (bladRef.current) bladRef.current.scrollTop = 0
    } catch {}
  }

  function stel(id, waarde) {
    if (lewend) { try { localStorage.setItem(antwoordSleutel(w, id), waarde) } catch {} }
    setAntwoorde(a => ({ ...a, [id]: waarde }))
  }

  function beginDag(n) {
    setDag(n); setBlad('dag')
    if (lewend) { try { localStorage.setItem(plekSleutel(w), String(n)) } catch {} }
    boToe()
  }

  function klaarMetDag(n) {
    setBlad(n === 5 ? 'weekklaar' : 'klaar')
    boToe()
    if (opDagKlaar) { try { opDagKlaar(n) } catch {} }
  }

  const dagInfo = WEEK1_DAE.find(d => d.n === dag) || WEEK1_DAE[0]
  const vandag = hervat >= 1 ? hervat : 1
  const vandagInfo = WEEK1_DAE.find(d => d.n === vandag) || WEEK1_DAE[0]

  /* ── Die openingsblad: VANDAG EERSTE ────────────────────────────────
   *
   * Dewald se §9: "Moenie die gebruiker onmiddellik 'n lys van vyf take wys
   * nie ... Die hele week mag beskikbaar wees, maar moet nie soos 'n taaklys
   * in die gebruiker se gesig wees nie."
   *
   * Die vyf dae het altyd oop gelê onder die knoppie. Dit is 'n taaklys, en 'n
   * taaklys is die eerste ding wat 'n program soos huiswerk laat voel. Nou
   * staan VANDAG bo, en die week is 'n tweede, stiller knoppie. */
  if (blad === 'oop') {
    return (
      <div className="vs">
        <div className="vs-open">
          <div className="vs-merk">WEEK {w} VAN 52</div>
          <h1 className="vs-open-titel">{week.titel}</h1>
          <p className="vs-open-teks">{week.openingskerm || WEEK1_OPENING}</p>
          <p className="vs-privaat">
            🔒 Alles wat jy persoonlik hier skryf, bly privaat.
          </p>
          {/* VANDAG. Een ding, een knoppie. */}
          <div className="vs-vandag">
            <span className="vs-vandag-merk">VANDAG · DAG {vandag}</span>
            <span className="vs-vandag-titel">{vandagInfo.titel}</span>
            <span className="vs-vandag-fyn">Dag {vandag} van 5</span>
          </div>

          <button className="vs-hoofknop" onClick={() => {
            if (opBegin) { try { opBegin() } catch {} }
            beginDag(vandag)
          }}>
            {hervat > 1 ? 'GAAN VOORT' : `BEGIN WEEK ${w}`}
          </button>
          {hervat > 1 && <p className="vs-hervat">Welkom terug. Gaan voort waar jy opgehou het.</p>}
        </div>

        <button className="vs-week-knop" onClick={() => setWysWeek(v => !v)}>
          {wysWeek ? 'Steek hierdie week weg' : 'Sien hierdie week'}
        </button>

        {wysWeek && (
          <div className="vs-dae">
            {WEEK1_DAE.map(d => (
              <button key={d.n} className="vs-dag-ry" onClick={() => beginDag(d.n)}>
                <span className="vs-dag-merk">DAG {d.n}</span>
                <span className="vs-dag-t">{d.titel}</span>
                <span className="vs-dag-pyl">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ── Dag klaar ──────────────────────────────────────────────────────
     'n Klein bevestiging. Geen viering, geen opstel. */
  if (blad === 'klaar') {
    return (
      <div className="vs" ref={bladRef}>
        <div className="vs-klaar">
          <div className="vs-klaar-merk">✓</div>
          <h2>{dagInfo.klaarKop}</h2>
          {dagInfo.klaarLyf && <p className="vs-klaar-lyf">{dagInfo.klaarLyf}</p>}
          <button className="vs-hoofknop" onClick={() => { setBlad('oop'); boToe() }}>
            TERUG NA VOLG JESUS
          </button>
          <button className="vs-stil" onClick={() => beginDag(Math.min(5, dag + 1))}>
            Ek wil nou al met Dag {Math.min(5, dag + 1)} aangaan
          </button>
        </div>
      </div>
    )
  }

  /* ── Die week is klaar ──────────────────────────────────────────────
     Sy woorde terug, albei wallpapers, die deelbare kaart, en 'n rede om
     volgende week terug te kom. */
  if (blad === 'weekklaar') {
    const rye = WEEK1_REIS
      .map(r => ({ kop: r.kop, teks: String(antwoorde[r.id] || '').trim() }))
      .filter(r => r.teks)

    return (
      <div className="vs" ref={bladRef}>
        <div className="vs-klaar">
          <div className="vs-klaar-merk">✓</div>
          <h2>JY HET BEGIN KYK.</h2>
          <p className="vs-klaar-lyf">
            Nie alles hoef vandag opgelos te wees nie. Maar jy het begin doen wat
            ’n dissipel nooit moet ophou doen nie: weer na Jesus kyk.
          </p>
        </div>

        {rye.length > 0 && (
          <div className="vs-kaart">
            <div className="vs-kop">JOU WEEK</div>
            {rye.map((r, i) => (
              <div key={i} className="vs-reis-ry">
                <span>{r.kop}</span>
                <blockquote>{r.teks}</blockquote>
              </div>
            ))}
            <p className="vs-fyn">🔒 Hierdie bly privaat.</p>
          </div>
        )}

        {/* Die wallpapers staan op die DAE waar hulle hoort — Dag 1 s'n op
            Dag 1, die week s'n aan die einde van Dag 5. Hulle word hier NIE
            herhaal nie: 'n mens het albei pas gesien, en herhaling is presies
            wat hierdie skerm lig moet hou. */}
        <div className="vs-hou">
          <div className="vs-hou-kop">DEEL DIT MET IEMAND</div>
          <p>{WEEK1_DEELSIN}</p>
          <button className="vs-deel" onClick={() => deelWoorde(WEEK1_DEELSIN)}>
            📤  Deel met iemand
          </button>
        </div>

        <div className="vs-kaart vs-volgende">
          <div className="vs-kop">WEEK {WEEK1_VOLGENDE.nommer}</div>
          <h3>{WEEK1_VOLGENDE.titel}</h3>
          <p className="vs-lyf">{WEEK1_VOLGENDE.lyf}</p>
          {binnekort && <p className="vs-fyn">{binnekort.lyf}</p>}
        </div>

        <button className="vs-hoofknop" onClick={() => { setBlad('oop'); boToe(); if (opSluit) opSluit() }}>
          KLAAR
        </button>
      </div>
    )
  }

  /* ── 'n Dag: EEN blad ───────────────────────────────────────────────── */
  /* Groepblokke bestaan GLAD NIE vir 'n solo-mens nie — hulle word nie
     versteek nie, hulle is nie daar nie. 'n Vroeer weergawe het hierdie
     filter op 'n ketting gehad wat nie meer bestaan het, en toe het 'n
     solo-mens die groepbrug gesien. Die blaaiertoets het dit gevang. */
  const blokke = blokkeVirDag(dag).filter(b => !b.netGroep || inGroep)
  return (
    <div className="vs" ref={bladRef}>
      <div className="vs-balk">
        <button className="vs-terug" onClick={() => { setBlad('oop'); boToe() }}>‹ Week {w}</button>
        <span className="vs-balk-dag">DAG {dag} VAN 5</span>
      </div>
      <h2 className="vs-dag-titel">{dagInfo.titel}</h2>

      <div className="vs-blokke">
        {blokke.map((b, i) => (
          <Blok key={i} blok={b} week={week} w={w} antwoorde={antwoorde} stel={stel}
                opPraatMetGroep={opPraatMetGroep} />
        ))}
      </div>

      <button className="vs-hoofknop" onClick={() => klaarMetDag(dag)}>
        {dagInfo.knop}
      </button>
    </div>
  )
}

/* ── Een blok ───────────────────────────────────────────────────────── */
function Blok({ blok: b, week, w, antwoorde, stel, opPraatMetGroep }) {
  if (b.soort === 'lees') return <Lees merk={b.merk} skrif={b.skrif} lyf={b.lyf} />

  if (b.soort === 'stem') {
    return (
      <Stemboodskap
        bron={week.stemboodskapUrl}
        titel={b.titel}
        duurTeks={b.duur}
        sleutel={`w${w}`}
        transkripsie={w === 1 ? WEEK1_TRANSKRIPSIE : week.transkripsie}
      />
    )
  }

  if (b.soort === 'teks') {
    return (
      <div className="vs-kaart">
        {b.kop && <div className="vs-kop">{b.kop}</div>}
        <p className="vs-lyf">{b.lyf}</p>
      </div>
    )
  }

  if (b.soort === 'groot') {
    return (
      <div className="vs-hou">
        <p>{b.lyf}</p>
      </div>
    )
  }

  if (b.soort === 'gebed') {
    return (
      <div className="vs-bid">
        {b.kop && <div className="vs-kop">{b.kop}</div>}
        <p>{b.lyf}</p>
      </div>
    )
  }

  if (b.soort === 'vraag') {
    return (
      <div className="vs-kaart">
        {b.kop && <div className="vs-kop">{b.kop}</div>}
        <Kassie id={b.id} prompt={b.prompt} waarde={antwoorde[b.id] || ''} stel={stel} />
        {/* Een deel-geleentheid per dag, nie vyf nie. */}
        {/* Ons deel die APP se skakel, NOOIT die klanklêer se adres nie.
            Daardie adres maak 'n kaal lêer in 'n blaaier oop, gee die
            Storage-teken vir enigiemand wat die boodskap aanstuur, en lyk soos
            gemors in 'n gesprek. Sien weekSkakel() in volgJesusNooi.js. */}
        {b.deelStem && week.stemboodskapUrl && (
          <button className="vs-deel-stem"
                  onClick={() => deelWoorde(
                    `Luister na hierdie: “${week.titel}” — VOLG JESUS, Week ${w}.`,
                    weekSkakel(w))}>
            📤  Deel die stemboodskap
          </button>
        )}
      </div>
    )
  }

  /* 'n Keuse wat EEN opvolgvraag op DIESELFDE blad oopmaak. Nie 'n nuwe skerm
     nie — dit is presies die klik-ketting wat weg moes gaan. */
  if (b.soort === 'kies') {
    const gekies = antwoorde[b.id]
    return (
      <div className="vs-kaart">
        {b.kop && <div className="vs-kop">{b.kop}</div>}
        {b.lyf && <p className="vs-lyf">{b.lyf}</p>}
        <div className="vs-keuses">
          {b.opsies.map(o => (
            <button key={o.waarde} className={gekies === o.waarde ? 'aan' : ''}
                    onClick={() => stel(b.id, o.waarde)}>
              {o.woorde}
            </button>
          ))}
        </div>
        {gekies && b.vraag && (
          <div className="vs-opvolg">
            <div className="vs-kop">{b.vraag.kop}</div>
            <Kassie id={b.vraag.id} prompt={b.vraag.prompt || 'Skryf dit hier neer…'}
                    waarde={antwoorde[b.vraag.id] || ''} stel={stel} />
          </div>
        )}
      </div>
    )
  }

  /* Die dag se wallpaper, in die blad self. */
  if (b.soort === 'wallpaper') {
    const bron = week[b.bronVeld || 'wallpaper']
    if (!bron) return null
    return (
      <div className="vs-wp">
        <div className="vs-kop">WEEK {w} · {b.kop}</div>
        <Wallpaper bron={bron} week={w} kaal />
      </div>
    )
  }

  /* ── Wil jy hieroor praat? ──
   *
   * §40. Die vier aansette VUL die kassie in die chat; hulle stuur nie. 'n
   * Boodskap wat 'n knoppie namens 'n mens stuur, is nie sy woorde nie. */
  if (b.soort === 'groepbrug') {
    return (
      <div className="vs-brug">
        <div className="vs-kop">WIL JY HIEROOR PRAAT?</div>
        <p className="vs-lyf">
          As iets jou getref het, jy ’n vraag het of jy wil hoor wat jou groep
          dink — jou groep is hier.
        </p>
        <button className="vs-brug-hoof" onClick={() => opPraatMetGroep && opPraatMetGroep('')}>
          💬  PRAAT MET MY GROEP
        </button>
        <div className="vs-brug-aansette">
          {[
            'Iets het my getref',
            'Ek het ’n vraag',
            'Ek sukkel hiermee',
            'Bid asseblief saam met my',
          ].map(a => (
            <button key={a} onClick={() => opPraatMetGroep && opPraatMetGroep(a + ': ')}>{a}</button>
          ))}
        </div>
        <p className="vs-fyn">Jy hoef niks persoonliks te deel wat jy nie wil deel nie.</p>
      </div>
    )
  }

  if (b.soort === 'terugblik') {
    const teks = String(antwoorde[b.bronId] || '').trim()
    if (!teks) return null      /* nooit undefined, nooit 'n leë aanhaling */
    return (
      <div className="vs-terugblik">
        <div className="vs-terugblik-kop">{b.kop}</div>
        <blockquote>{teks}</blockquote>
      </div>
    )
  }

  return null
}

/* 'n Private kassie wat vanself stoor terwyl 'n mens tik. Geen "STOOR"-knoppie
   nie: 'n knoppie is nog 'n klik, en 'n mens wat vergeet druk verloor sy
   woorde. */
function Kassie({ id, prompt, waarde, stel }) {
  return (
    <>
      <textarea
        className="vs-kassie"
        value={waarde}
        onChange={e => stel(id, e.target.value)}
        placeholder={prompt}
        rows={4}
      />
      <p className="vs-fyn">🔒 Net jy kan hierdie lees. Dit bly op hierdie foon.</p>
    </>
  )
}

/* Die LEES-blok. 'n Klein reël en 'n knoppie — geen "EK HET GELEES" wat die
   pad blokkeer nie. Kan die verwysing nie ontleed word nie, verdwyn net die
   knoppie; niemand kry 'n knoppie wat niks doen nie. */
function Lees({ merk, skrif, lyf }) {
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
      {merk && <div className="vs-kop">{merk}</div>}
      <p className="vs-skrif">{skrif}</p>
      {eerste && (
        <button className="vs-lees-knop" onClick={maakOop}>
          📖  Maak in Bybel oop
        </button>
      )}
      {lyf && <p className="vs-lyf vs-lees-nota-lyf">{lyf}</p>}
      {gestuur && <p className="vs-lees-nota">Die Bybel maak by {skrif} oop.</p>}
    </div>
  )
}

/* Die wallpaper. 'n CSS-agtergrond op 'n ONDEURSIGTIGE houer, nooit 'n
   volskerm <img> nie — sien CLAUDE.md se "Android, Chrome, en gekleurde
   strepe". Geen prent, geen blok. */
function Wallpaper({ bron, week, kaal }) {
  const [besig, setBesig] = useState(false)
  const [nota, setNota]   = useState(null)
  if (!bron) return null

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
      const leer = new File([b], `volg-jesus-week-${week}.jpg`, { type: b.type })
      if (navigator.canShare && navigator.canShare({ files: [leer] })) {
        try {
          await navigator.share({ files: [leer] })
          setNota('Gestuur.'); setBesig(false); return
        } catch (e) { if (e && e.name === 'AbortError') { setBesig(false); return } }
      }
      const url = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = url; a.download = `volg-jesus-week-${week}.jpg`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
      setNota('Afgelaai.')
    } catch { setNota('Hou lank op die prent vas om dit te stoor.') }
    setBesig(false)
  }

  /* Die adres word AANGEHAAL. 'n Firebase-aflaai-URL dra `?alt=media&token=...`
     en 'n ongehaalde `url(...)` in CSS is 'n slegte plek vir sulke karakters —
     dit is presies hoe 'n prent stil verdwyn sonder dat enigiets kla. */
  const binne = (
    <>
      <div className="vs-wp-prent" style={{ backgroundImage: `url("${bron}")` }} />
      <button className="vs-deel" onClick={deel} disabled={besig}>
        {besig ? 'Besig...' : 'Stel as agtergrond of deel'}
      </button>
      {nota && <p className="vs-wp-nota">{nota}</p>}
    </>
  )
  return kaal ? binne : <div className="vs-wp">{binne}</div>
}

/* Deel woorde (en 'n skakel). Val `navigator.share` weg — soos op 'n rekenaar
   — beland dit op die knipbord. */
async function deelWoorde(teks, skakel) {
  const boodskap = skakel
    ? `${teks}\n\n${skakel}`
    : `${teks}\n\nhttps://dewaldscheepers.com/go`
  try {
    if (navigator.share) { await navigator.share({ text: boodskap }); return }
  } catch { return }
  try { await navigator.clipboard.writeText(boodskap) } catch {}
}
