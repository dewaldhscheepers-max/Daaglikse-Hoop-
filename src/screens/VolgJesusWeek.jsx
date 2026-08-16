/* ── VOLG JESUS — wat die GEBRUIKER sien ──
 *
 * Een dag op 'n slag. Nooit die hele week as een lang blad nie.
 *
 * Die admin se voorskou wys die hele week op een blad, en dit is reg — dit is
 * 'n proefblad vir Dewald om alles op een slag na te gaan. Maar dit is nie
 * die produk nie. Punt 3 §48 se dit self: "Een ding op 'n slag."
 *
 * ── Wat hierdie skerm probeer laat gebeur ──
 *
 * Nie: "sjoe, baie inhoud."
 * Maar: "ek wil Jesus beter leer ken, en ek kom môre terug."
 *
 * Daarom:
 *
 *   · die OPENING word gelees, nie weggesteek nie. Dit was 'n uitklap en dit
 *     was verkeerd: dit is die sterkste skryfwerk in die week en die ding wat
 *     iemand laat besluit om te begin. Titel → opening → BEGIN;
 *   · elke dag het 'n herkenbare EINDE, nie 'n vloei in die volgende dag nie;
 *   · elke einde dra 'n haak na môre. Geen streak, geen "jy verloor jou
 *     rekord" — net 'n rede om nuuskierig te wees;
 *   · die gehoorsaamheidstap lyk ANDERS as die res. Dit is die oomblik waar
 *     'n mens van lees na doen beweeg, en dit is die belangrikste kaart in
 *     die week;
 *   · 'n solo-mens sien NOOIT die groep- of fasiliteerdermateriaal nie.
 */
import { useState } from 'react'
import { geldigeVideoId } from '../data/volgJesus'
import { mylpaalVir, biedKontak, antwoordVir } from '../data/volgJesusMylpale'
import './VolgJesusWeek.css'

/* Wat elke dag se kop se. Punt 3 §55. */
const DAE = [
  { n: 1, merk: 'DAG 1', titel: 'Ontmoet Jesus' },
  { n: 2, merk: 'DAG 2', titel: 'Kyk weer' },
  { n: 3, merk: 'DAG 3', titel: 'Gehoorsaam' },
  { n: 4, merk: 'DAG 4', titel: 'Hart' },
  { n: 5, merk: 'DAG 5', titel: 'Leef dit' },
]

export default function VolgJesusWeek({ week, rol = 'solo', opSluit, opMylpaal }) {
  const [blad, setBlad] = useState('oop')   /* 'oop' | 'dag' | 'klaar' | 'groep' | 'fas' */
  const [dag, setDag]   = useState(1)
  const [antwoord, setAntwoord] = useState(null)
  const [mylStaat, setMylStaat] = useState(null)   /* { waarde, toestemming } */

  if (!week) return null

  const wysOortjies = rol === 'groep' || rol === 'fasiliteerder'

  function beginDag(n) { setDag(n); setBlad('dag'); setAntwoord(null); boToe() }
  function klaarMetDag() { setBlad('klaar'); boToe() }
  function boToe() { try { window.scrollTo({ top: 0 }) } catch {} }

  /* ── Die opening ────────────────────────────────────────────────────
   *
   * Die openingskerm was agter 'n uitklap — "＋ Waaroor gaan hierdie week?"
   * Dit was my keuse, om die eerste skerm kort te hou, en dit was verkeerd.
   *
   * Dewald: "waaroor gaan hierdie week is weggesteek. dit moet deel van die
   * program wees."
   *
   * Hy is reg, en sy eie dokument sê dit ook: die opening staan VOOR die
   * BEGIN-knoppie, nie agter 'n plusteken nie. Dit is die sterkste skryfwerk
   * in die week en dit is die ding wat iemand laat besluit om te begin. 'n
   * Uitklap beteken die meeste mense lees dit nooit.
   *
   * Die volgorde is nou soos hy dit geskryf het:
   *
   *     WEEK 1 VAN 52  →  Wie is Jesus?  →  die opening  →  [ BEGIN WEEK 1 ]
   *
   * `doel` staan nie meer hier nie. In sy dokument is dit metadata — dit staan
   * bo saam met die Beweging en die kerntekste, met die woorde "Doel van die
   * week". Dit is die fasiliteerder se taal, en dit wys nou op die
   * fasiliteerderblad. */
  if (blad === 'oop') {
    return (
      <div className="vw">
        {wysOortjies && <Oortjies rol={rol} aktief="week" opKies={setBlad} />}
        <div className="vw-open">
          <div className="vw-open-merk">WEEK {week.weeknommer} VAN 52</div>
          <h1 className="vw-open-titel">{week.titel}</h1>
          {week.openingskerm && <p className="vw-open-teks">{week.openingskerm}</p>}
          <button className="vw-hoofknop" onClick={() => beginDag(1)}>
            BEGIN WEEK {week.weeknommer}
          </button>
        </div>

        {/* Die mylpaal staan op die openingskerm, nie in 'n uitklap nie.
            Punt 1 §12: dit is nie 'n venster wat een keer kom en weggaan nie.
            Mense groei en kry hulle vrae beantwoord; wanneer iemand later
            gereed is, moet hy kan terugkom en die volgende tree gee. */}
        <Mylpaal week={week} staat={mylStaat} opKies={s => {
          setMylStaat(s)
          if (opMylpaal) opMylpaal(s)
        }} />

        <div className="vw-dae">
          {DAE.map(d => (
            <button key={d.n} className="vw-dag-ry" onClick={() => beginDag(d.n)}>
              <span className="vw-dag-n">{d.n}</span>
              <span className="vw-dag-t">{d.titel}</span>
              <span className="vw-dag-pyl">›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ── Dag klaar ──────────────────────────────────────────────────────
     'n Herkenbare einde, en 'n haak na môre. Dit is nie 'n speletjie nie —
     daar is geen punt, geen strook, geen "moenie jou rekord verloor nie". */
  if (blad === 'klaar') {
    const volgende = DAE.find(d => d.n === dag + 1)
    return (
      <div className="vw">
        <div className="vw-klaar">
          <div className="vw-klaar-merk">✓</div>
          <h2>Dag {dag} voltooi</h2>
          {week.kernwaarheid && <p className="vw-klaar-kern">{week.kernwaarheid}</p>}

          {volgende ? (
            <div className="vw-more">
              <span className="vw-more-kop">MÔRE</span>
              <p>{week.moreTeaser || volgende.titel}</p>
            </div>
          ) : (
            <div className="vw-more">
              <span className="vw-more-kop">HIERDIE WEEK IS KLAAR</span>
              <p>Volgende week gaan ons verder.</p>
            </div>
          )}

          <button className="vw-hoofknop" onClick={() => (opSluit ? opSluit() : setBlad('oop'))}>
            KLAAR VIR VANDAG
          </button>
          {volgende && (
            <button className="vw-stil" onClick={() => beginDag(volgende.n)}>
              Ek wil nou al verder gaan
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── Die groep ──────────────────────────────────────────────────────
     'n Solo-mens kom nooit hier nie. */
  if (blad === 'groep') {
    return (
      <div className="vw">
        <Oortjies rol={rol} aktief="groep" opKies={setBlad} />
        <div className="vw-kaart">
          <div className="vw-kop">ONS GROEP</div>
          <p className="vw-skrif">{week.primereSkrif}</p>
          <ol className="vw-vrae">
            {[week.groepVraag1, week.groepVraag2, week.groepVraag3, week.groepVraag4]
              .filter(Boolean).map((v, i) => <li key={i}>{v}</li>)}
          </ol>
        </div>
        {week.gebed && (
          <div className="vw-kaart">
            <div className="vw-kop">BID SAAM</div>
            <p className="vw-gebed">{week.gebed}</p>
          </div>
        )}
      </div>
    )
  }

  /* ── Die fasiliteerder ──────────────────────────────────────────────
     Net vir wie 'n groep lei. Die waarskuwing staan BO, nie onder nie: 'n
     mens moet dit sien voor hy die gesprek begin, nie daarna nie. */
  if (blad === 'fas') {
    return (
      <div className="vw">
        <Oortjies rol={rol} aktief="fas" opKies={setBlad} />
        {week.pastoraleRisiko === 'hoog' && week.fasiliteerderWaarskuwing && (
          <div className="vw-waarsku">
            <strong>⚠ Wees versigtig met hierdie gesprek</strong>
            <p>{week.fasiliteerderWaarskuwing}</p>
          </div>
        )}
        {week.doel && (
          <div className="vw-kaart">
            <div className="vw-kop">DOEL VAN DIE WEEK</div>
            <p>{week.doel}</p>
          </div>
        )}
        <div className="vw-kaart">
          <div className="vw-kop">DIE HOOFPUNT</div>
          <p>{week.fasiliteerderHoofpunt}</p>
        </div>
        <div className="vw-kaart">
          <div className="vw-kop">WAT ONS NIE MOET AFLEI NIE</div>
          <p>{week.fasiliteerderGrens}</p>
        </div>
      </div>
    )
  }

  /* ── 'n Gewone dag ──────────────────────────────────────────────────── */
  const dagInfo = DAE.find(d => d.n === dag) || DAE[0]
  return (
    <div className="vw">
      <div className="vw-balk">
        <button className="vw-terug" onClick={() => setBlad('oop')}>‹ Week {week.weeknommer}</button>
        <span className="vw-balk-dag">{dagInfo.merk}</span>
      </div>

      {dag === 1 && <Dag1 week={week} />}
      {dag === 2 && <Eenvoudig kop="KYK WEER" skrif={week.dag2Skrif} teks={week.dag2Prompt} />}
      {dag === 3 && <Dag3 week={week} antwoord={antwoord} setAntwoord={setAntwoord} />}
      {dag === 4 && <Privaat kop="WAT GEBEUR BINNE JOU?" teks={week.dag4Vraag} />}
      {dag === 5 && <Eenvoudig kop="LEEF DIT" teks={week.dag5Prompt} />}

      <button className="vw-hoofknop vw-onder" onClick={klaarMetDag}>
        KLAAR MET DAG {dag}
      </button>
    </div>
  )
}

/* ── Dag 1: die volle ritme ──────────────────────────────────────────── */
function Dag1({ week }) {
  return (
    <>
      <div className="vw-kaart">
        <div className="vw-kop">LEES</div>
        <p className="vw-skrif">{week.primereSkrif}</p>
        <p className="vw-fyn">Lees die gedeelte stadig. Jy hoef nie vandag alles te verstaan nie.</p>
      </div>

      <VideoKaart week={week} />

      {week.kernwaarheid && (
        <div className="vw-kaart vw-kern-kaart">
          <div className="vw-kop">HOU DIT VAS</div>
          <p className="vw-kern">{week.kernwaarheid}</p>
        </div>
      )}

      {week.privaatRefleksie && <Privaat kop="WEES EERLIK" teks={week.privaatRefleksie} />}

      {/* Die belangrikste kaart in die week. Dit LYK anders omdat dit die
          oomblik is waar 'n mens van lees na doen beweeg. */}
      {week.gehoorsaamheidStap && (
        <div className="vw-doen">
          <div className="vw-doen-kop">GEHOORSAAM</div>
          <p>{week.gehoorsaamheidStap}</p>
        </div>
      )}

      {week.gebed && (
        <div className="vw-kaart">
          <div className="vw-kop">BID</div>
          <p className="vw-gebed">{week.gebed}</p>
        </div>
      )}

      {/* Die laaste hou van Dag 1. Dit staan heel onder omdat dit die sin is
          waarmee 'n mens die skerm verlaat en die dag ingaan. */}
      {week.eenSin && (
        <div className="vw-eensin">
          <div className="vw-eensin-kop">DIE EEN SIN WAT VANDAG MOET BLY</div>
          <p>{week.eenSin}</p>
        </div>
      )}

      <WallpaperKaart week={week} />
    </>
  )
}

/* ── Die week se wallpaper ──
 *
 * Dieselfde sin as `eenSin`, maar op 'n prent wat 'n mens op sy sluitskerm
 * sit. Dit is die enigste deel van VOLG JESUS wat BUITE die app gesien word:
 * die adres is in die prent ingebrand, en dus is elke deelnemer se foon 'n
 * week lank 'n stil advertensie vir /go.
 *
 * Die adres MOET op die prent wees en nie net in die byskrif nie. Sodra daar
 * 'n leer by `navigator.share()` is, gooi WhatsApp die teks weg — elke ander
 * app hou dit. Sien dieselfde les in Luister.jsx.
 *
 * En let op hoe die voorskou geteken word: 'n CSS-`background-image` op 'n
 * ONDEURSIGTIGE houer, nooit 'n volskerm `<img>` nie. 'n Volskerm-prent is die
 * grootste tekstuur in die app en Chrome gee dit maklik sy eie laag; dit is
 * presies wat die gekleurde strepe in Vrugtefees teruggebring het.
 * Sien CLAUDE.md. */
function WallpaperKaart({ week }) {
  const [besig, setBesig] = useState(false)
  const [nota, setNota]   = useState(null)
  const bron = week.wallpaper
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
      const leer = new File([b], 'volg-jesus-week-1.webp', { type: b.type })

      /* canShare({ files }) is die enigste betroubare toets: navigator.share
         bestaan op baie blaaiers wat NIE leers kan deel nie. */
      if (navigator.canShare && navigator.canShare({ files: [leer] })) {
        try {
          await navigator.share({ files: [leer] })
          setNota('Gestuur. Sit dit op jou sluitskerm of jou status.')
          setBesig(false); return
        } catch (e) {
          if (e && e.name === 'AbortError') { setBesig(false); return }
        }
      }

      /* Geen leerdeel nie (meestal 'n rekenaar): laai dit af. */
      const url = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = url; a.download = 'volg-jesus-week-1.webp'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
      setNota('Afgelaai.')
    } catch {
      setNota('Hou lank op die prent vas om dit te stoor.')
    }
    setBesig(false)
  }

  return (
    <div className="vw-wp">
      <div className="vw-wp-kop">📱 SIT DIT OP JOU SKERM</div>
      <div className="vw-wp-prent" style={{ backgroundImage: `url(${bron})` }} />
      <button className="vw-wp-knop" onClick={deel} disabled={besig}>
        {besig ? 'Besig…' : 'Stoor of deel'}
      </button>
      <p className="vw-wp-fyn">
        Sit dit as jou sluitskerm sodat die vraag die hele week by jou bly — of
        stuur dit vir iemand.
      </p>
      {nota && <p className="vw-wp-nota">{nota}</p>}
    </div>
  )
}

/* Die video is waar Dewald se stem die program warm maak. Die Skrif bly
   eerste, maar hierdie kaart moet die mooiste ding op die blad wees. */
function VideoKaart({ week }) {
  const [speel, setSpeel] = useState(false)
  const geldig = geldigeVideoId(week.videoId)

  if (!geldig) {
    return (
      <div className="vw-kaart">
        <div className="vw-kop">VERSTAAN</div>
        <div className="vw-geenvideo">Die video kom binnekort</div>
      </div>
    )
  }

  return (
    <div className="vw-video">
      {speel ? (
        <iframe
          className="vw-video-raam"
          src={`https://www.youtube.com/embed/${week.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={week.titel} allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button className="vw-video-duim" onClick={() => setSpeel(true)}
                style={{ backgroundImage: `url(https://i.ytimg.com/vi/${week.videoId}/hqdefault.jpg)` }}>
          <span className="vw-video-sluier" />
          <span className="vw-video-speel">▶</span>
          <span className="vw-video-woorde">
            <span className="vw-video-kop">VERSTAAN</span>
            <span className="vw-video-titel">{week.titel}</span>
          </span>
        </button>
      )}
    </div>
  )
}

function Eenvoudig({ kop, skrif, teks }) {
  return (
    <div className="vw-kaart">
      <div className="vw-kop">{kop}</div>
      {skrif && <p className="vw-skrif">{skrif}</p>}
      <p>{teks}</p>
    </div>
  )
}

function Privaat({ kop, teks }) {
  return (
    <div className="vw-kaart">
      <div className="vw-kop">{kop}</div>
      <p>{teks}</p>
      <div className="vw-kassie">Skryf vir jouself…</div>
      <p className="vw-slot">🔒 Net jy kan hierdie lees.</p>
    </div>
  )
}

/* Dag 3 vra terug oor die week se stap. Geen straf by "nog nie" — sien
   Punt 3 §18. */
function Dag3({ week, antwoord, setAntwoord }) {
  const WOORDE = {
    gedoen:  'Neem ’n oomblik en dank God dat jy kon reageer op wat Jesus jou geleer het.',
    sukkel:  'Gehoorsaamheid beteken nie elke stap voel maklik nie. Gaan weer terug na Jesus se woorde en vra Hom vir wysheid en moed.',
    nogNie:  'Jy hoef nie voor te gee nie. Die vraag bly oop: wat is jou volgende getroue stap?',
  }
  return (
    <>
      <div className="vw-doen">
        <div className="vw-doen-kop">JOU STAP HIERDIE WEEK</div>
        <p>{week.gehoorsaamheidStap}</p>
      </div>
      {week.dag3Prompt && (
        <div className="vw-kaart"><p>{week.dag3Prompt}</p></div>
      )}
      <div className="vw-keuses">
        {[['gedoen', 'Ek het ’n stap gegee'],
          ['sukkel', 'Ek wil, maar ek sukkel'],
          ['nogNie', 'Ek het nog nie']].map(([s, w]) => (
          <button key={s} className={antwoord === s ? 'aan' : ''} onClick={() => setAntwoord(s)}>{w}</button>
        ))}
      </div>
      {antwoord && <div className="vw-antwoord">{WOORDE[antwoord]}</div>}
    </>
  )
}

/* ── Die mylpaal ──
 *
 * Week 6 vra of jy Jesus wil volg. Week 7 vra waar jy met doop staan.
 *
 * Dit sluit NIKS toe nie. Kies iemand "ek is nog nie gereed nie", gaan die
 * week net so voort — die app ken nie sy gewete, sy omstandighede of sy
 * plaaslike kerk nie. Sien blokkeerVolgendeWeek() in volgJesusMylpale.js.
 *
 * En die kerk sien NIKS totdat die mens self die tweede knoppie druk. Die
 * eerste keuse is syne alleen. */
function Mylpaal({ week, staat, opKies }) {
  const [vorm, setVorm] = useState(false)
  const m = mylpaalVir(week.weeknommer)
  if (!m) return null

  const gekies = staat && staat.waarde
  const magVra = biedKontak(m, gekies)

  return (
    <div className="vw-myl">
      <div className="vw-myl-kop">JOU VOLGENDE STAP</div>
      <h3>{m.titel}</h3>
      <p className="vw-myl-lyf">{m.lyf}</p>

      <div className="vw-myl-keuses">
        {m.keuses.map(k => (
          <button key={k.waarde}
                  className={gekies === k.waarde ? 'aan' : ''}
                  onClick={() => opKies({ waarde: k.waarde, toestemming: false })}>
            {k.woorde}
          </button>
        ))}
      </div>

      {gekies && <p className="vw-myl-antwoord">{antwoordVir(m, gekies)}</p>}

      {/* Die tweede knoppie. Die kerk hoor NIKS voor dit gedruk is. */}
      {magVra && (
        staat.toestemming
          ? <p className="vw-myl-gestuur">
              ✓ Jou gemeente sal met jou kontak maak. Hulle sien net jou naam en hoe om jou te bereik —
              niks van wat jy geskryf het nie.
            </p>
          : (vorm
              ? <KontakVorm mylpaal={m} waarde={gekies}
                            opKlaar={() => opKies({ ...staat, toestemming: true })}
                            opKanselleer={() => setVorm(false)} />
              : <button className="vw-myl-kontak" onClick={() => setVorm(true)}>
                  {m.kontakVraag}
                </button>)
      )}

      {gekies && (
        <p className="vw-myl-oop">Jy kan hierdie enige tyd verander.</p>
      )}
    </div>
  )
}

/* ── "Kontak my" ──
 *
 * Hier is die eerlike spanning: ons het deurgaans gese die kerk sien niks
 * persoonliks nie, maar 'n mens kan nie "kontak my" he sonder iets om mee te
 * kontak nie.
 *
 * Die antwoord is nie om die reel te breek nie — dit is om dit presies te
 * stel. Twee velde, self ingetik, op hierdie oomblik, vir hierdie doel. Die
 * refleksies en die hartsantwoorde gaan NOOIT hierheen nie; hulle verlaat
 * nooit die toestel nie. Dit staan op die skerm sodat 'n mens dit kan sien
 * voor hy tik. */
function KontakVorm({ mylpaal, waarde, opKlaar, opKanselleer }) {
  const [naam, setNaam]     = useState('')
  const [kontak, setKontak] = useState('')
  const [besig, setBesig]   = useState(false)
  const [fout, setFout]     = useState(null)

  async function stuur() {
    setBesig(true); setFout(null)
    try {
      const r = await fetch('/api/volg-jesus-versoek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mylpaal: mylpaal.sleutel, waarde, naam, kontak }),
      })
      const j = await r.json()
      if (j.ok) opKlaar()
      else setFout(j.fout || 'Kon nie stuur nie')
    } catch { setFout('Kon nie stuur nie') }
    finally { setBesig(false) }
  }

  return (
    <div className="vw-vorm">
      <p className="vw-vorm-lyf">
        Ons stuur net jou naam en hoe om jou te bereik. Niks wat jy in hierdie app geskryf het,
        gaan saam nie.
      </p>
      <input value={naam} onChange={e => setNaam(e.target.value)}
             placeholder="Jou naam" autoComplete="name" />
      <input value={kontak} onChange={e => setKontak(e.target.value)}
             placeholder="E-pos of selnommer" autoComplete="tel" inputMode="text" />
      {fout && <p className="vw-vorm-fout">{fout}</p>}
      <button className="vw-myl-kontak" onClick={stuur} disabled={besig || !naam || !kontak}>
        {besig ? 'Besig…' : 'Stuur'}
      </button>
      <button className="vw-stil" onClick={opKanselleer}>Nie nou nie</button>
    </div>
  )
}

function Oortjies({ rol, aktief, opKies }) {
  const lys = [['week', 'My week'], ['groep', 'Ons groep']]
  if (rol === 'fasiliteerder') lys.push(['fas', 'Fasiliteerder'])
  return (
    <div className="vw-oortjies">
      {lys.map(([s, w]) => (
        <button key={s} className={aktief === s ? 'aan' : ''}
                onClick={() => opKies(s === 'week' ? 'oop' : s)}>{w}</button>
      ))}
    </div>
  )
}
