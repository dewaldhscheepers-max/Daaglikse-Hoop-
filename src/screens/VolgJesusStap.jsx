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
/* Die week se dae kom uit die REGISTER, nie uit Week 1 nie. Hierdie skerm was
   aan week 1 vasgemaak; nou bedien dit elke week wat 'n dag-pad het. Sien
   volgJesusDae.js. */
import {
  weekDae, weekReis, weekOpening, weekDeelsin, weekVolgende,
  weekTranskripsie, blokkeVir,
} from '../data/volgJesusDae'
import Stemboodskap from '../components/Stemboodskap'
import '../components/Stemboodskap.css'
import { weekSkakel } from '../data/volgJesusNooi'
import { prentPad } from '../data/prentPad'
import './VolgJesusStap.css'
import DonationCard from '../components/DonationCard'

const antwoordSleutel = (w, id) => `vj_a_w${w}_${id}`
const plekSleutel = w => `vj_plek_w${w}`

/* ── Watter dae is KLAAR ──
 *
 * Die skerm het net onthou watter dag laas OOPGEMAAK is, en dus het dit ná Dag
 * 1 steeds "BEGIN WEEK 1" gese. Dewald: "dit se heeltyd begin by week een al
 * het ek dag een klaar gemaak."
 *
 * Klaar is iets anders as oopgemaak, en dit is die ding wat 'n mens wil sien.
 *
 * Dit le op die FOON en nerens anders nie. Dewald: "onthou as ek dag een klaar
 * gemaak het moet dit nie vir al die groep lede so wys nie." Daar is niks om
 * uit te lek nie — hierdie getal gaan nooit oor 'n draad nie. */
const klaarSleutel = w => `vj_klaar_w${w}`

function leesKlaar(w) {
  try {
    const rou = JSON.parse(localStorage.getItem(klaarSleutel(w)) || '[]')
    if (!Array.isArray(rou)) return []
    return rou.filter(n => Number.isInteger(n) && n >= 1 && n <= 5)
  } catch { return [] }
}

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
  const [klaarDae, setKlaarDae] = useState(() => (voorskou ? [] : leesKlaar(w)))
  const bladRef = useRef(null)

  /* Wat op hierdie foon reeds klaar is. Dit is die enigste ding wat die
     openingsblad nou onthou — "watter dag is laas oopgemaak" het niks beteken
     en het die skerm laat lieg. */
  useEffect(() => {
    setKlaarDae(lewend ? leesKlaar(w) : [])
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
    setKlaarDae(oud => {
      if (oud.includes(n)) return oud
      const nuwe = [...oud, n].sort((a, b) => a - b)
      if (lewend) {
        try { localStorage.setItem(klaarSleutel(w), JSON.stringify(nuwe)) } catch {}
      }
      return nuwe
    })
    if (opDagKlaar) { try { opDagKlaar(n) } catch {} }
  }

  const DAE = weekDae(w)
  const volgende = weekVolgende(w)
  const dagInfo = DAE.find(d => d.n === dag) || DAE[0] || {}
  const isKlaar = n => klaarDae.includes(n)
  const hoeveelKlaar = klaarDae.length

  /* ── Die openingsblad: DIE VYF DAE ──────────────────────────────────
   *
   * Hier het 'n VANDAG-kaart gestaan met een knoppie, en die vyf dae was
   * agter 'n tweede knoppie weggesteek. Dit het uit §9 gekom: moenie 'n mens
   * met 'n lys take begroet nie.
   *
   * Dit het in die praktyk stukkend gegaan, want die kaart het geraai watter
   * dag "vandag" is uit die laas OOPGEMAAKTE dag — en 'n dag wat 'n mens
   * klaargemaak het, was steeds die dag wat oopgemaak is. Dewald: "dit se
   * heeltyd begin by week een al het ek dag een klaar gemaak. hoekom vat jy
   * nie eerder daai knoppie weg en wys al die dae."
   *
   * Sy antwoord is beter as 'n slimmer raaiskoot. Die vyf dae staan nou oop,
   * en wat KLAAR is, dra 'n groen merkie. 'n Mens sien in een oogopslag waar
   * hy is — en dit is nie 'n taaklys nie, want die app het nog nooit gese wat
   * jy vandag MOET doen nie. Dit wys net wat jy reeds gedoen het.
   *
   * Die merkie le op HIERDIE FOON. Dewald: "onthou as ek dag een klaar gemaak
   * het moet dit nie vir al die groep lede so wys nie." Dit gaan nooit oor 'n
   * draad nie — daar is niks om te lek nie. */
  if (blad === 'oop') {
    return (
      <div className="vs">
        <div className="vs-open">
          <div className="vs-merk">WEEK {w} VAN 52</div>
          <h1 className="vs-open-titel">{week.titel}</h1>
          {/* ── Die KODE wen vir 'n week met 'n dag-pad ──
           *
           * Dit was `week.openingskerm || weekOpening(w)`, en Firestore het dus
           * gewen. Toe Dewald Week 1 se teks laat oorskryf, het al vyf dae
           * verander maar die OPENINGSBLAD het die ou woorde bly wys, want
           * daardie rekord is maande gelede uit die ou saad geskryf. Van buite
           * af lyk dit of die verandering nie ontplooi het nie.
           *
           * Vir 'n week wat sy dae in die kode dra, is die kode die bron van
           * die hele week — die opening hoort daarby. Weke sonder 'n dag-pad
           * gee `''` terug en val steeds op die rekord terug. */}
          <p className="vs-open-teks">{weekOpening(w) || week.openingskerm}</p>
          <p className="vs-privaat">
            🔒 Alles wat jy persoonlik hier skryf, bly privaat.
          </p>
        </div>

        {hoeveelKlaar > 0 && (
          <div className="vs-vordering">
            {hoeveelKlaar === 5
              ? 'Jy het al vyf die dae van hierdie week gedoen.'
              : `${hoeveelKlaar} van 5 dae gedoen`}
          </div>
        )}

        <div className="vs-dae">
          {DAE.map(d => {
            const klaar = isKlaar(d.n)
            return (
              <button
                key={d.n}
                className={`vs-dag-ry${klaar ? ' klaar' : ''}`}
                onClick={() => {
                  if (opBegin) { try { opBegin() } catch {} }
                  beginDag(d.n)
                }}
              >
                <span className="vs-dag-merk">{klaar ? '✓' : `DAG ${d.n}`}</span>
                <span className="vs-dag-t">{d.titel}</span>
                <span className="vs-dag-pyl">›</span>
              </button>
            )
          })}
        </div>

        {/* ── Help my om dit gratis te hou ──
         *
         * DIESELFDE donasie-vloei as oral elders in die app — `open-donation`.
         * 'n Eie betaalpad hier sou 'n tweede plek wees wat stilweg agterbly
         * die dag wanneer die stelsel verander.
         *
         * Dit staan ONDER die dae, nooit voor hulle nie: die mens kom hierheen
         * om die week te doen, nie om te betaal nie. En die klein reël onderaan
         * moet bly — 'n vraag om geld sonder "geen verpligting" lees soos 'n
         * hek voor die program. */}
        <DonationCard
          klas="vs-steun"
          titel="Help my om VOLG JESUS gratis te hou"
          teks={'Ek dra self die kostes om Daaglikse Hoop en VOLG JESUS gratis '
              + 'beskikbaar te stel. As hierdie program jou help en jy wil my '
              + 'help om die kostes te dra, kan jy hier ’n vrywillige bydrae maak.'}
          knop="HELP MY MET DIE KOSTES"
          fyn="Geen verpligting nie. VOLG JESUS bly gratis."
        />
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
    const rye = weekReis(w)
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
          <p>{weekDeelsin(w)}</p>
          <button className="vs-deel" onClick={() => deelWoorde(weekDeelsin(w))}>
            📤  Deel met iemand
          </button>
        </div>

        {/* Wat volgende week wag. Is daar niks — die laaste geskrewe week —
            wys ons NIKS eerder as 'n leë kaart. */}
        {volgende && (
        <div className="vs-kaart vs-volgende">
          <div className="vs-kop">WEEK {volgende.nommer}</div>
          <h3>{volgende.titel}</h3>
          <p className="vs-lyf">{volgende.lyf}</p>
          {binnekort && <p className="vs-fyn">{binnekort.lyf}</p>}
        </div>
        )}

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
  const blokke = blokkeVir(w, dag).filter(b => !b.netGroep || inGroep)
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
        transkripsie={weekTranskripsie(w) || week.transkripsie}
      />
    )
  }

  /* 'n Teksblok mag 'n Skrifgedeelte dra. Week 2 se Dag 5 het "JAKOBUS 4:7–8"
     as opskrif gehad met NIKS om dit oop te maak nie — 'n verwysing sonder 'n
     knoppie lees soos 'n stukkende LEES-kaart, en dit is presies hoe dit vir
     Dewald gelyk het. Die knoppie hoort waar die verwysing staan. */
  if (b.soort === 'teks') {
    return (
      <div className="vs-kaart">
        {b.kop && <div className="vs-kop">{b.kop}</div>}
        <p className="vs-lyf">{b.lyf}</p>
        <BybelKnop skrif={b.skrif} />
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
        {/* Die vraag se eie woorde. Sonder hierdie reel wys 'n vraagblok net
            'n opskrif en 'n leë kassie — en elke sin wat Dewald onder 'n
            opskrif geskryf het, was stil onsigbaar. */}
        {b.lyf && <p className="vs-lyf">{b.lyf}</p>}
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
            {b.vraag.lyf && <p className="vs-lyf">{b.vraag.lyf}</p>}
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
function BybelKnop({ skrif, bo }) {
  const [gestuur, setGestuur] = useState(false)
  const spanne = ontleedVerwysing(skrif)
  const eerste = spanne && spanne[0]
  if (!eerste) return null

  function maakOop() {
    try {
      window.dispatchEvent(new CustomEvent('open-bybel', {
        detail: { boek: eerste.boek, hoofstuk: eerste.hoofstuk, vers: eerste.van || null },
      }))
      setGestuur(true)
    } catch {}
  }

  return (
    <>
      <button className={bo ? 'vs-lees-knop' : 'vs-lees-knop vs-lees-knop-onder'}
              onClick={maakOop}>
        📖  Maak in Bybel oop
      </button>
      {gestuur && <p className="vs-lees-nota">Die Bybel maak by {skrif} oop.</p>}
    </>
  )
}

function Lees({ merk, skrif, lyf }) {
  return (
    <div className="vs-kaart vs-lees">
      {merk && <div className="vs-kop">{merk}</div>}
      <p className="vs-skrif">{skrif}</p>
      <BybelKnop skrif={skrif} bo />
      {lyf && <p className="vs-lyf vs-lees-nota-lyf">{lyf}</p>}
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
      /* DEUR /api/wallpaper, nooit direk nie.
       *
       * Die prent WYS uit firebasestorage.googleapis.com, maar 'n `fetch`
       * daarheen word deur CORS geblokkeer — en 'n mens moet die grepe he om 'n
       * LEER te deel. Dewald: "hierdie wallpaper wil nie deel nie." Die prent
       * was al die tyd sigbaar; dit is die HAAL wat misluk het.
       *
       * Sien src/data/prentPad.js en api/wallpaper.js. */
      const r = await fetch(prentPad(bron))
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
