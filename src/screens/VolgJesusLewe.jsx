/* ── VOLG JESUS, lewendig in die app ──
 *
 * Die skerm wat oopmaak wanneer iemand op die kaart op Luister druk.
 *
 * Dit is die WRAPPER, nie die week nie. Die week self staan in
 * VolgJesusWeek.jsx en word deur die admin se voorskou net so gebruik; hier
 * kom die drie dinge by wat net vir 'n regte mens geld:
 *
 *   1. WAT is gepubliseer. Die app vra dit by /api/volg-jesus-openbaar, wat
 *      net weke met `gepubliseer === true` uitgee en die fasiliteerder- en
 *      groepmateriaal uitlaat. Sien src/data/volgJesusOpenbaar.js.
 *
 *   2. WAAR is hierdie mens. Sy week staan op sy eie toestel en gaan nêrens
 *      heen nie. Die program het geen rekeninge nie en moet dit ook nie kry
 *      nie: 'n mens moet 'n dissipelskapprogram kan begin sonder om eers 'n
 *      wagwoord te kies.
 *
 *   3. Wat gebeur wanneer hy VERBY die laaste week loop. Dit is die deel wat
 *      Dewald gevra het: "daar kan net kort boodskap na week een wees wat sê
 *      week 2 kom binnekort." Daardie boodskap word nooit getik nie — sy
 *      nommer word afgelei uit wat gepubliseer is, en skuif dus vanself.
 *
 * Rol is ALTYD 'solo'. Die groep- en fasiliteerdermateriaal bestaan, maar dit
 * kom nie eers oor die netwerk nie.
 */
import { useEffect, useState, useCallback } from 'react'
import VolgJesusWeek from './VolgJesusWeek'
import VolgJesusStap from './VolgJesusStap'
import { kiesWeek, binnekort } from '../data/volgJesusOpenbaar'
import { tel } from '../data/volgJesusTel'
import VolgJesusChat, { GroepKnoppie, useOngelees } from './VolgJesusChat'
import {
  GroepOfSolo, KryJouByMense, VoorJyAlleenBegin, SluitAan, BeginGroep,
  GroepGereed, NooiPastoor, GroepInstellings, Groepsessie, FasiliteerderGids,
} from './VolgJesusGroep'
import { myGroepe } from '../data/volgJesusGroepApi'
import { myUid } from '../data/volgJesusIdentiteit'
import './VolgJesusLewe.css'

const MY_WEEK = 'vj_my_week'

function leesMyWeek() {
  try {
    const n = Number(localStorage.getItem(MY_WEEK))
    return Number.isInteger(n) && n >= 1 && n <= 52 ? n : 1
  } catch { return 1 }
}
function skryfMyWeek(n) {
  try { localStorage.setItem(MY_WEEK, String(n)) } catch {}
}

export default function VolgJesusLewe({ onClose }) {
  const [lys, setLys]     = useState(null)     /* { klaar, weke: [...] } */
  const [fout, setFout]   = useState(false)
  const [week, setWeek]   = useState(null)     /* die oop week se volle inhoud */
  const [nommer, setNommer] = useState(leesMyWeek)
  const [besig, setBesig] = useState(true)

  /* ── Die groep ──
   *
   * `modus` is 'wag' totdat ons weet: 'onbeslis' (nog nooit gekies nie),
   * 'solo', of 'groep'. Die keuse staan op die TOESTEL sodat 'n solo-mens nooit
   * op 'n bediener hoef te wag om sy week te sien nie; die groep self kom van
   * die bediener af, want dit is die waarheid. */
  const [modus, setModus]   = useState('wag')
  const [groep, setGroep]   = useState(null)
  const [myLid, setMyLid]   = useState(null)
  const [uid, setUid]       = useState('')
  /* null | 'kies' | 'mense' | 'kode' | 'skep' | 'gereed' | 'pastoor' | 'alleen'
     | 'instellings' | 'chat' */
  const [groepBlad, setGroepBlad] = useState(null)
  const [chatAanset, setChatAanset] = useState('')

  useEffect(() => {
    let dood = false
    ;(async () => {
      const u = await myUid()
      if (dood) return
      setUid(u)

      let gekies = ''
      try { gekies = localStorage.getItem('vj_modus') || '' } catch {}

      /* Wie 'n uid het, vra die bediener waar hy hoort. Dit is hoe 'n groep 'n
         herinstallasie oorleef — die uid is dieselfde sodra hy weer aanmeld. */
      if (u) {
        const r = await myGroepe()
        if (dood) return
        const eerste = r.ok && r.groepe && r.groepe[0]
        if (eerste) {
          setGroep(eerste)
          setMyLid({ uid: u, naam: eerste.myNaam, rol: eerste.myRol, status: 'aktief' })
          setModus('groep')
          try { localStorage.setItem('vj_modus', 'groep') } catch {}
          return
        }
      }
      setModus(gekies === 'solo' ? 'solo' : 'onbeslis')
    })()
    return () => { dood = true }
  }, [])

  function kiesSolo() {
    setModus('solo'); setGroepBlad(null)
    try { localStorage.setItem('vj_modus', 'solo') } catch {}
  }
  function naGroep(g) {
    setGroep(g)
    setMyLid({ uid, naam: g.myNaam || '', rol: g.eienaar === uid ? 'fasiliteerder' : 'deelnemer', status: 'aktief' })
    setModus('groep')
    try { localStorage.setItem('vj_modus', 'groep') } catch {}
  }

  /* Die ongeleesde telling loop in die agtergrond, sodat die knoppie sy getal
     ken sonder dat die chat oop is. */
  const { boodskappe, laasGelees } = useOngelees(groep && groep.id, uid)

  /* Die kaart is oopgemaak. Een keer per toestel. */
  useEffect(() => { tel('oop') }, [])

  useEffect(() => {
    let dood = false
    setBesig(true)
    fetch('/api/volg-jesus-openbaar')
      .then(r => r.json())
      .then(j => { if (!dood) { setLys(j || { klaar: 0, weke: [] }); setFout(false) } })
      .catch(() => { if (!dood) setFout(true) })
      .finally(() => { if (!dood) setBesig(false) })
    return () => { dood = true }
  }, [])

  const nommers = (lys && Array.isArray(lys.weke) ? lys.weke : []).map(w => w.weeknommer)
  const keuse = kiesWeek(nommer, nommers)

  /* Haal die oop week se inhoud. Dit gebeur eers wanneer ons weet WATTER week
     — 'n mens laai nie 52 weke om een te wys nie. */
  useEffect(() => {
    if (!keuse.nommer) { setWeek(null); return }
    let dood = false
    setBesig(true)
    fetch(`/api/volg-jesus-openbaar?week=${keuse.nommer}`)
      .then(r => r.json())
      .then(j => { if (!dood) setWeek((j && j.week) || null) })
      .catch(() => { if (!dood) setWeek(null) })
      .finally(() => { if (!dood) setBesig(false) })
    return () => { dood = true }
  }, [keuse.nommer])

  const opBegin = useCallback(() => {
    if (keuse.nommer) tel('begin', keuse.nommer)
  }, [keuse.nommer])

  /* 'n Dag is klaar. Dag 5 sluit die week af en skuif die mens vorentoe — maar
     NET vorentoe: iemand wat 'n ou week weer deurloop, mag nie teruggestoot
     word nie. */
  const opDagKlaar = useCallback(dag => {
    const w = keuse.nommer
    if (!w) return
    tel('dag', w, dag)
    if (dag === 5) {
      tel('weekKlaar', w)
      if (leesMyWeek() <= w) skryfMyWeek(Math.min(52, w + 1))
    }
  }, [keuse.nommer])

  const boodskap = binnekort(nommers)

  /* Wat aan die einde van die OOP week gesê word.
   *
   * Dit is nie altyd dieselfde sin as die binnekort-boodskap nie, en die
   * verskil is maklik om te mis: iemand wat Week 1 klaarmaak terwyl Week 3
   * reeds lewendig is, moet nie hoor "Week 4 kom binnekort" nie. Hy moet hoor
   * dat die volgende week vir hom wag.
   *
   * Net wie op die LAASTE lewende week staan, kry die binnekort-boodskap. */
  const opDieRand = keuse.nommer !== null && keuse.nommer >= keuse.klaar
  const weekBoodskap = opDieRand ? boodskap : {
    kop: `WEEK ${(keuse.nommer || 0) + 1} WAG VIR JOU`,
    lyf: 'Vat ’n dag of twee as jy wil — die volgende week loop nie weg nie.',
  }

  /* ── Wat wys ons ─────────────────────────────────────────────────── */
  let binne

  /* Die groep se eie skerms staan BO die week: hulle is 'n pad wat 'n mens
     een keer loop, en dan is hulle klaar. */
  const groepSkerm = {
    kies:    <GroepOfSolo opSaam={() => setGroepBlad('mense')} opSolo={() => setGroepBlad('alleen')} />,
    mense:   <KryJouByMense opKode={() => setGroepBlad('kode')} opSkep={() => setGroepBlad('skep')}
                            opPastoor={() => setGroepBlad('pastoor')} opSolo={() => setGroepBlad('alleen')} />,
    alleen:  <VoorJyAlleenBegin opGroep={() => setGroepBlad('skep')}
                                opPastoor={() => setGroepBlad('pastoor')} opVoort={kiesSolo} />,
    kode:    <SluitAan opTerug={() => setGroepBlad('mense')}
                       opKlaar={g => { naGroep(g); setGroepBlad(null) }} />,
    skep:    <BeginGroep opTerug={() => setGroepBlad('mense')}
                         opKlaar={g => { naGroep(g); setGroepBlad('gereed') }} />,
    gereed:  groep ? <GroepGereed groep={groep} opKlaar={() => setGroepBlad(null)} /> : null,
    pastoor: <NooiPastoor opTerug={() => setGroepBlad('mense')} />,
    instellings: groep
      ? <GroepInstellings groep={groep} myLid={myLid} opTerug={() => setGroepBlad(null)}
                          opBlad={setGroepBlad}
                          opUit={() => { setGroep(null); setMyLid(null); kiesSolo() }} />
      : null,
    /* Die groepsessie staan APART van die vyf dae en blokkeer niks (§44). Die
       gids wys NET vir 'n fasiliteerder. */
    sessie: <Groepsessie opTerug={() => setGroepBlad('instellings')} />,
    gids: myLid && myLid.rol === 'fasiliteerder'
      ? <FasiliteerderGids opTerug={() => setGroepBlad('instellings')} />
      : null,
  }[groepBlad]

  if (modus === 'wag') {
    binne = <div className="vjl-stil">Besig om te laai…</div>
  } else if (groepBlad && groepSkerm) {
    binne = groepSkerm
  } else if (modus === 'onbeslis') {
    binne = groepSkerm || <GroepOfSolo opSaam={() => setGroepBlad('mense')} opSolo={() => setGroepBlad('alleen')} />
  } else if (besig && !week) {
    binne = <div className="vjl-stil">Besig om die program te laai…</div>
  } else if (fout) {
    binne = (
      <div className="vjl-stil">
        Ons kon nie die program laai nie. Kyk of jy aanlyn is en probeer weer.
      </div>
    )
  } else if (!nommers.length) {
    /* Niks gepubliseer nie. Dit behoort nooit te gebeur nie — dan wys die
       kaart op Luister ook nie — maar 'n leë skerm is nie 'n antwoord nie. */
    binne = <div className="vjl-stil">Die program kom binnekort.</div>
  } else if (keuse.wag) {
    binne = (
      <div className="vjl-wag">
        <div className="vjl-wag-merk">✓</div>
        <h2>Jy is op datum</h2>
        <p className="vjl-wag-lyf">
          Jy het alles gedoen wat tot dusver hier is.
        </p>
        {boodskap && (
          <div className="vjl-binnekort">
            <span className="vjl-binnekort-kop">{boodskap.kop}</span>
            <p>{boodskap.lyf}</p>
          </div>
        )}
        <button className="vjl-terugknop" onClick={() => setNommer(keuse.klaar)}>
          Gaan terug na Week {keuse.klaar}
        </button>
      </div>
    )
  } else if (!week) {
    binne = <div className="vjl-stil">Hierdie week is nie beskikbaar nie.</div>
  } else {
    /* Week 1 is heeltemal oorgeskryf: een stap op 'n slag, 'n stemboodskap in
       plaas van 'n video, en 'n oomblik op Dag 5 waar die app die mens sy eie
       Dag 1-woorde teruggee. Daardie vorm pas nie in die ou plat uitleg nie,
       en die ou skerm bly staan vir elke week wat nog so geskryf is. */
    binne = week.weeknommer === 1 ? (
      <VolgJesusStap
        week={week}
        binnekort={weekBoodskap}
        opBegin={opBegin}
        opDagKlaar={opDagKlaar}
        opSluit={onClose}
        inGroep={modus === 'groep' && !!groep && !!myLid}
        opPraatMetGroep={a => { setChatAanset(a || ''); setGroepBlad('chat') }}
      />
    ) : (
      <VolgJesusWeek
        week={week}
        rol="solo"
        binnekort={weekBoodskap}
        opBegin={opBegin}
        opDagKlaar={opDagKlaar}
        opSluit={onClose}
      />
    )
  }

  return (
    <div className="vjl">
      <div className="vjl-balk">
        <button className="vjl-toe" onClick={onClose} aria-label="Maak toe">✕</button>
        {modus === 'groep' && groep ? (
          <button className="vjl-balk-groep" onClick={() => setGroepBlad('instellings')}>
            <span className="vjl-balk-naam">VOLG JESUS</span>
            <span className="vjl-balk-fyn">{groep.naam}</span>
          </button>
        ) : (
          <span className="vjl-balk-naam">VOLG JESUS</span>
        )}
        {/* Die weekkieser. Iemand wat by Week 3 is, moet Week 1 weer kan
            oopmaak — die program is 'n pad, nie 'n toets. Dit wys eers
            wanneer daar meer as een week is. */}
        {nommers.length > 1 && (
          <select className="vjl-kies" value={keuse.nommer || keuse.klaar}
                  onChange={e => setNommer(Number(e.target.value))}>
            {nommers.map(n => <option key={n} value={n}>Week {n}</option>)}
          </select>
        )}
      </div>
      <div className="vjl-blad">
        {binne}
        {/* §39: die knoppie is op ELKE VOLG JESUS-skerm, dit maak niks toe
            nie, en die ongeleesde telling is helder. */}
        {modus === 'groep' && groep && myLid && !groepBlad && (
          <GroepKnoppie
            groep={groep}
            boodskappe={boodskappe}
            laasGeleesId={laasGelees}
            myUid={uid}
            opKlik={() => setGroepBlad('chat')}
          />
        )}
      </div>

      {/* ── Die chat lê BO-OP, dit vervang nie ──
       *
       * Dit was 'n vroeë-terugkeer, en dan het die weekskerm afgebreek: 'n mens
       * maak die chat toe en staan weer op die openingsblad, met sy halfgetikte
       * antwoord weg. §39 verbied presies dit — "huidige dag bly waar dit was;
       * geskryfde antwoord bly staan; audio-posisie bly staan."
       *
       * Die chat is `position: fixed` met sy eie z-index, dus dek dit die skerm
       * sonder om dit te ontmantel. Die blaaiertoets het hierdie een gevang. */}
      {groepBlad === 'chat' && groep && myLid && (
        <VolgJesusChat
          groep={groep}
          myLid={myLid}
          aanset={chatAanset}
          opSluit={() => { setGroepBlad(null); setChatAanset('') }}
        />
      )}
    </div>
  )
}
