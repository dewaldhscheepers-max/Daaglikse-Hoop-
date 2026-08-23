/* ────────────────────────────────────────────────────────────
   Die keurpaneel — Dewald se inbak.

   Dit is die enigste skerm in die app waar mense se rou boodskappe wys. Dit
   sit agter dieselfde geheim as die video-admin (SORG_ADMIN_GEHEIM), nie
   agter die PIN nie: die PIN staan in die bondel wat elke besoeker aflaai.

   Die werkvloei is met opset klein — vier knoppies en 'n teksblok:

     lees → redigeer → Plaas op die muur
                    of  Gelees, nie geplaas nie

   Wat op die muur beland, is die GEREDIGEERDE teks. 'n Naam, 'n dorp, 'n
   nommer mag uit. Die persoon het daarvoor toestemming gegee, en dit is hoe
   'n mens hom beskerm.

   Die Gevaar-hopie staan eerste en wys WATTER woorde getref het, sodat
   Dewald dadelik sien hoekom.

   ── Een hopie, een lys ──

   Dit was nie so nie, en dit was 'n gemors om te gebruik. Die muur is onder
   ELKE hopie geteken, en die oortjie "Op die muur" het boonop die verkeerde
   lys gewys: die rou inkomende kopiee van wat goedgekeur is, met die egte
   muur eers daaronder. Om een antwoord by te sit, moes 'n mens verby elke
   plasing scroll om by die tweede lys uit te kom.

   Nou wys elke oortjie presies een lys, en "Op die muur" is die muur self.

   Binne die muur staan die plasings SONDER 'n antwoord eerste. Dit is die
   werk wat wag; die res is klaar.

   Geen transform of opacity op :active nie — net kleur. Sien CLAUDE.md.
   ──────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react'
import { onderwerpNaam } from '../data/sorgOnderwerpe'
import { vergeetMuur } from '../data/sorgMuur'
import SorgOpname from '../components/SorgOpname'
import './SorgKeur.css'

/* ── Dit is nie meer 'n PUBLIKASIEHEK nie ──
 *
 * Dewald: "Verander Sorg Admin na 'n eenvoudige veiligheids- en
 * modereringsblad... Admin is nie meer 'n publikasiehek nie."
 *
 * Elke plasing gaan vanself op (sien api/sorg-stuur.mjs). Wat hier oorbly, is
 * die vier dinge waaroor 'n MENS moet besluit:
 *
 *   Dringend    krisis, en wat iemand as "iemand is in gevaar" gemerk het
 *   Gemerk      outomaties as onveilig gemerk, of genoeg rapporte gekry
 *   Op die muur alles wat lewe — vir wanneer hy iets moet gaan soek
 *   Weg         versteek, verwyder, spam
 *
 * "Nuut" is weg. Daar is nie meer 'n hopie wat op sy oog wag nie, en dit was
 * die hele punt van hierdie verandering: die getal wat net kon groei, met sy
 * naam op. */
const HOPIES = [
  { sleutel: 'gevaar', naam: 'Dringend' },
  { sleutel: 'gemerk', naam: 'Gemerk' },
  { sleutel: 'gekeur', naam: 'Op die muur' },
  /* Net die GEVLAGDE woorde. Wat reeds wys en niemand gepla het nie, kom
     nooit hier nie — dit is die hele punt van die ontwerp: Dewald lees nie
     elke woord nie, net dié waaroor iets gese is. */
  { sleutel: 'woorde', naam: 'Opmerkings' },
  { sleutel: 'weg',    naam: 'Weg' },
]


/* ── Watter plasing in watter hopie hoort ──
 *
 * Dit was 'n reguit `status === hopie`. Dit werk nie meer nie, want die
 * statusse gaan nou oor MODEREERING en nie oor publikasie nie: 'n plasing kan
 * tegelyk op die muur wees EN dringend wees (sien src/data/sorgVeilig.js).
 *
 * Die volgorde tel: `gevaar` wen oor alles, want 'n mens moet dit NOU sien. */
function inHopie(b, hopie) {
  const status = String(b.status || 'nuut')
  const rapporte = Number(b.rapporte || b.gerapporteer) || 0
  const gemerk = (b.onveiligRedes || []).length > 0 || status === 'onveilig' || rapporte > 0

  if (hopie === 'gevaar')  return status === 'gevaar' || b.dringend === true
  if (hopie === 'gemerk')  return gemerk && status !== 'gevaar' && status !== 'weg' && status !== 'verwyder'
  if (hopie === 'weg')     return status === 'weg' || status === 'verwyder' || status === 'spam'
  /* "Op die muur" tel die MUUR self, nie hierdie lys nie — sien hieronder. */
  return false
}

export default function SorgKeur({ geheim }) {
  const [data, setData] = useState(null)
  /* `null` beteken: nog nie gekies nie. Ons kies self sodra die data daar is.

     Dit het op 'gevaar' begin. Gevaar is meestal leeg — dit is die punt — dus
     het Dewald die admin oopgemaak en "Niks in hierdie hopie nie" gesien
     terwyl daar nuwe boodskappe gewag het. */
  const [hopie, setHopie] = useState(null)
  const [oop, setOop] = useState(null)        // die id wat oop is
  const [teks, setTeks] = useState('')
  const [titel, setTitel] = useState('')
  const [besig, setBesig] = useState(false)
  const [boodskap, setBoodskap] = useState(null)

  const haal = useCallback(async () => {
    if (!geheim) return
    try {
      const r = await fetch('/api/sorg-keur', { headers: { 'x-sorg-geheim': geheim } })
      const d = await r.json()
      if (r.ok) setData(d)
      else setBoodskap({ fout: d.fout || ('HTTP ' + r.status) })
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
    }
  }, [geheim])

  useEffect(() => { haal() }, [haal])

  /* Gevaar eerste as daar iets in is — dit is die enigste hopie wat nie kan
     wag nie. Anders die eerste hopie waarin daar werk is. */
  useEffect(() => {
    if (hopie !== null || !data) return
    const inkom = data.inkomend || []
    const tel = k => inkom.filter(b => inHopie(b, k)).length
    const eerste = HOPIES.map(h => h.sleutel).find(k => tel(k) > 0)
    /* Is daar nêrens werk nie, land 'n mens op die muur self — nie op 'n leë
       hopie nie. Dit is die goeie geval: niks wag vir hom nie. */
    setHopie(eerste || 'gekeur')
  }, [data, hopie])

  async function doen(lyf) {
    setBesig(true)
    setBoodskap(null)
    try {
      const r = await fetch('/api/sorg-keur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sorg-geheim': geheim },
        body: JSON.stringify(lyf),
      })
      const d = await r.json()
      if (!r.ok) { setBoodskap({ fout: d.fout || ('HTTP ' + r.status) }); return null }
      if (d.waarsku) { setBoodskap({ waarsku: d.waarsku, herhaalId: lyf.id }); return null }
      vergeetMuur()
      await haal()
      return d
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
      return null
    } finally { setBesig(false) }
  }

  /* ── Die eenmalige migrasie ──
   *
   * Dewald: "Publiseer hulle sonder om duplikate te skep... Neem 'n veilige
   * databasisrugsteun voor die migrasie."
   *
   * TWEE knoppies, en die droëloop is die eerste. Daar is geen "probeer weer"
   * ná 'n migrasie oor lewende data nie: 'n storie wat verkeerdelik openbaar
   * gaan, kan afgehaal word maar nie ongesien gemaak word nie.
   *
   * Die droëloop loop PRESIES dieselfde kode en skryf net nie. Hy gee ook die
   * rugsteun terug — alles wat gaan skuif, presies soos dit gaan lyk — as 'n
   * lêer wat 'n mens stoor voordat hy die egte knoppie druk. */
  const [migrasie, setMigrasie] = useState(null)
  const [migBesig, setMigBesig] = useState(false)

  async function loopMigrasie(droog) {
    if (migBesig) return
    if (!droog) {
      const n = migrasie ? migrasie.inHierdieLopie : '?'
      if (!window.confirm(
        `Publiseer ${n} plasings op die muur?\n\n` +
        'Dit gaan LEWENDIG. Het jy die rugsteun afgelaai?')) return
    }
    setMigBesig(true)
    setBoodskap(null)
    try {
      const r = await fetch('/api/sorg-migreer' + (droog ? '?kyk=1' : ''), {
        method: 'POST',
        headers: { 'x-sorg-geheim': geheim },
      })
      const d = await r.json()
      if (!r.ok) { setBoodskap({ fout: d.fout || ('HTTP ' + r.status) }); return }
      setMigrasie(d)
      if (!droog) { vergeetMuur(); await haal() }
    } catch (e) {
      setBoodskap({ fout: String(e && e.message) })
    } finally { setMigBesig(false) }
  }

  function laaiRugsteun() {
    if (!migrasie || !migrasie.rugsteun) return
    const blob = new Blob([JSON.stringify(migrasie.rugsteun, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'sorg-migrasie-rugsteun.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  }

  function maakOop(b) {
    setOop(b.id)
    setTeks(b.teks || '')
    setTitel('')
    setBoodskap(null)
  }

  /* Die teks kom ALTYD uit die toestand, nooit uit 'n gestoorde kopie nie.

     "Plaas tog so" het vroeer die oorspronklike versoek herhaal. Sien Dewald
     dus die waarskuwing "daar is nog 'n telefoonnommer in", haal die nommer
     uit, en druk dan "Plaas tog so", het die OU teks — met die nommer — op
     die muur beland. Dit is die teenoorgestelde van wat die waarskuwing
     veronderstel is om te doen. */
  async function plaas(id, tochPlaas = false) {
    const b = (data.inkomend || []).find(x => x.id === id)
    if (!b) return
    const d = await doen({
      aksie: 'keur',
      id: b.id,
      titel,
      teks,
      onderwerp: b.onderwerp,
      anoniem: !b.naam,
      naam: b.naam,
      tochPlaas,
    })
    if (d && d.ok) { setOop(null); setBoodskap({ goed: 'Op die muur.' }) }
  }

  /* 'n Mislukte haal het vroeer "Besig om te laai…" vir ALTYD gewys, want die
     foutboodskap is eers laer af geteken en hierdie reel het voor hom
     teruggekeer. Dewald sou 'n dooie skerm sien met geen idee hoekom nie. */
  if (!data) {
    return (
      <div className="sk">
        <div className="admin-section-title">🤍 Sorg &amp; Ondersteuning — Boodskappe</div>
        {boodskap && boodskap.fout ? (
          <>
            <div className="admin-error">{boodskap.fout}</div>
            <button className="sk-knop sk-plaas" onClick={haal}>Probeer weer</button>
          </>
        ) : (
          <p className="sk-leeg">Besig om te laai…</p>
        )}
      </div>
    )
  }

  const inkomend = data.inkomend || []
  const lys = inkomend.filter(b => inHopie(b, hopie))

  return (
    <div className="sk">
      <div className="admin-section-title">🤍 Sorg &amp; Ondersteuning — Boodskappe</div>

      {/* ── Die migrasie ──
          Dit staan BO die hopies, want dit is 'n eenmalige ding wat eers
          gedoen moet word; daarna is die getalle almal nul en dan verdwyn dit
          in die agtergrond. */}
      <div className="sk-migrasie">
        <p className="sk-migrasie-kop">Publiseer die plasings wat nog wag</p>
        <p className="sk-migrasie-fyn">
          Die goedkeuringshek is weg. Hierdie lopie vat die ou plasings wat net
          daar gewag het en sit hulle op die muur — met hul oorspronklike datum,
          onderwerp, inhoud en anonimiteitskeuse. Krisis, gerapporteerde, spam en
          plasings sonder toestemming bly uit. Dit kan nie duplikate maak nie.
        </p>
        <div className="sk-migrasie-knoppe">
          <button className="sk-knop" disabled={migBesig} onClick={() => loopMigrasie(true)}>
            {migBesig ? 'Besig…' : '🔍 Gaan na, skryf niks'}
          </button>
          {migrasie && migrasie.droog && migrasie.gepubliseer > 0 && (
            <>
              <button className="sk-knop" onClick={laaiRugsteun}>⬇ Laai die rugsteun af</button>
              <button className="sk-knop sk-plaas" disabled={migBesig} onClick={() => loopMigrasie(false)}>
                Publiseer {migrasie.inHierdieLopie} nou
              </button>
            </>
          )}
        </div>

        {migrasie && (
          <div className="sk-migrasie-uitslag">
            <p>
              <b>{migrasie.gepubliseer}</b> {migrasie.droog ? 'gaan publiseer' : 'gepubliseer'}
              {' · '}<b>{migrasie.uitgesluit}</b> uitgesluit
              {' · '}<b>{migrasie.reedsDaar}</b> reeds daar
              {' · '}<b>{migrasie.misluk}</b> misluk
              {migrasie.nogOor > 0 && <> · <b>{migrasie.nogOor}</b> nog oor (druk weer)</>}
            </p>
            {/* "Uitgesluit: 12" op sy eie is geen inligting nie. */}
            {migrasie.redes && Object.keys(migrasie.redes).length > 0 && (
              <ul className="sk-migrasie-redes">
                {Object.entries(migrasie.redes).map(([rede, n]) => (
                  <li key={rede}>{n} × {rede}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="sk-hopies">
        {HOPIES.map(h => {
          /* "Op die muur" tel die MUUR, nie die inkomende kopiee nie. Dit was
             die inkomendes, en die twee getalle loop uitmekaar sodra 'n mens
             een plasing uitvee of afhaal. */
          const n = h.sleutel === 'gekeur'
            ? (data.muur || []).length
            : h.sleutel === 'woorde'
              ? (data.woorde || []).length
              : inkomend.filter(b => inHopie(b, h.sleutel)).length
          return (
            <button
              key={h.sleutel}
              className={`sk-hopie${hopie === h.sleutel ? ' aktief' : ''}${h.sleutel === 'gevaar' && n ? ' gevaar' : ''}`}
              onClick={() => { setHopie(h.sleutel); setOop(null) }}
            >
              {h.naam} {n > 0 && <b>{n}</b>}
            </button>
          )
        })}
      </div>

      {boodskap && boodskap.fout && <div className="admin-error">{boodskap.fout}</div>}
      {boodskap && boodskap.goed && <div className="admin-success">✅ {boodskap.goed}</div>}
      {boodskap && boodskap.waarsku && (
        <div className="sk-waarsku">
          <p>{boodskap.waarsku}</p>
          <button
            className="sk-knop"
            disabled={besig}
            onClick={() => plaas(boodskap.herhaalId, true)}
          >
            Plaas tog so
          </button>
        </div>
      )}

      {/* Een hopie, een lys. Die muur is 'n hopie soos die ander, nie 'n
          tweede lys onderaan elke hopie nie. */}
      {hopie === 'gekeur' ? (
        <Muur data={data} doen={doen} besig={besig} />
      ) : hopie === 'woorde' ? (
        <Woorde data={data} doen={doen} besig={besig} />
      ) : (
        <>
      {!lys.length && <p className="sk-leeg">Niks in hierdie hopie nie.</p>}

      {lys.map(b => (
        <div key={b.id} className={`sk-ry${b.status === 'gevaar' ? ' gevaar' : ''}`}>
          <div className="sk-ry-fyn">
            {b.dag} · {b.naam ? b.naam : 'Anoniem'} · {onderwerpNaam(b.onderwerp) || 'geen onderwerp'}
            {b.kode ? ` · ${b.kode}` : ''}
          </div>

          {/* Hoekom dit in die Gevaar-hopie is. Dewald moet dit kan sien
              sonder om die hele boodskap eers te lees. */}
          {(b.krisisWoorde || []).length > 0 && (
            <div className="sk-krisis">Getref: {(b.krisisWoorde || []).join(', ')}</div>
          )}
          {(b.kontakWaarskuwing || []).length > 0 && (
            <div className="sk-kontak">Bevat {(b.kontakWaarskuwing || []).join(' en ')}</div>
          )}
          {/* Vra om geld of goed. Dit keer niks — Dewald besluit. Dit spaar
              hom net die sorteer. */}
          {(b.hulpversoek || []).length > 0 && (
            <div className="sk-hulpversoek">Vra om hulp met geld of goed</div>
          )}

          {oop === b.id ? (
            <>
              <input
                className="sk-video"
                value={titel}
                onChange={e => setTitel(e.target.value)}
                maxLength={110}
                placeholder="Die vraag in een reel — bv. Moet ek die tablet koop?"
              />
              <div className="admin-books-note">
                Dit staan BO die storie op die muur. Sonder dit begin die kaart
                as 'n blok teks en niemand weet waaroor dit gaan nie.
              </div>

              <textarea
                className="sk-teks"
                value={teks}
                onChange={e => setTeks(e.target.value)}
                rows={9}
              />
              <div className="admin-books-note">
                Dít is wat op die muur gaan wys. Haal name, dorpe en nommers
                uit. Die rou weergawe bly hier en gaan nêrens heen nie.
              </div>

              <div className="sk-knoppe">
                <button className="sk-knop sk-plaas" disabled={besig || teks.trim().length < 10} onClick={() => plaas(b.id)}>
                  Plaas op die muur
                </button>
                <button className="sk-knop" disabled={besig} onClick={() => doen({ aksie: 'weg', id: b.id })}>
                  Gelees, nie geplaas
                </button>
                <button className="sk-knop" onClick={() => setOop(null)}>Los</button>
              </div>
            </>
          ) : (
            <>
              <Voorskou teks={b.teks} />
              <div className="sk-knoppe">
                {b.status !== 'gekeur' && (
                  /* In die Gevaar-hopie staan daar NIE "Lees en keur" nie.
                     'n Boodskap waarin iemand van selfmoord skryf, mag nooit
                     met een verkeerde druk openbaar gaan nie. Daar is "Lees
                     nou" — wat oopmaak sonder om iets te belowe — en "Hou
                     terug", wat dit uit die pad haal sonder om dit te
                     verloor. */
                  <button className="sk-knop sk-plaas" onClick={() => maakOop(b)}>
                    {b.status === 'gevaar' ? 'Lees nou' : 'Lees en keur'}
                  </button>
                )}
                {b.status === 'gevaar' && (
                  <button className="sk-knop" disabled={besig} onClick={() => doen({ aksie: 'weg', id: b.id })}>
                    Hou terug
                  </button>
                )}
                {/* Geen "Vee uit" op 'n noodboodskap nie. Een verkeerde druk
                    en dit is permanent weg — insluitend die enigste rekord
                    dat iemand om hulp geroep het. */}
                {b.status !== 'gevaar' && <button className="sk-knop sk-vee" onClick={() => {
                  if (window.confirm("Vee hierdie boodskap heeltemal uit?\n\nDit gaan van die muur EN uit die inbak weg. Dit is wat \u0027n mens doen wanneer die persoon self vra dat dit weggaan.")) {
                    doen({ aksie: 'vee', id: b.id, muurId: b.muurId })
                  }
                }}>Vee uit</button>}
              </div>
            </>
          )}
        </div>
      ))}
        </>
      )}
    </div>
  )
}

/* ── 'n Voorskou wat nie die bladsy oorneem nie ──
   Dit het die VOLLE teks gewys. Tien boodskappe van agthonderd karakters en
   die knoppie waarna 'n mens soek, is vier skerms ver. Vier reels, en dan
   "Wys alles" vir wie meer wil sien. Die rou teks gaan nêrens heen nie — dit
   staan heel in die redigeerblok sodra 'n mens die ry oopmaak. */
function Voorskou({ teks }) {
  const [oop, setOop] = useState(false)
  const lank = String(teks || '').length > 200
  return (
    <>
      <p className={`sk-voorskou${lank && !oop ? ' kort' : ''}`}>{teks}</p>
      {lank && (
        <button className="sk-meer" onClick={() => setOop(o => !o)}>
          {oop ? 'Wys minder' : 'Wys alles'}
        </button>
      )}
    </>
  )
}

/* ── Die gevlagde woorde ──

   Hier kom net twee soorte: wat outomaties gewag het (die eerste keer van 'n
   mens, of iets met 'n nommer of skakel in), en wat iemand GERAPPORTEER het.

   'n Gerapporteerde woord is reeds van die muur af — dit gebeur op die druk,
   nie hier nie. Dewald besluit net of dit terug moet. Dit is met opset
   ongebalanseerd: 'n goeie woord wat 'n uur weg was, is 'n klein skade; 'n
   slegte woord wat 'n uur onder iemand se storie staan, is nie. */
function Woorde({ data, doen, besig }) {
  const woorde = data.woorde || []
  if (!woorde.length) {
    return <p className="sk-leeg">Niks wag op jou nie. Woorde wat deurgaan, wys sommer.</p>
  }

  /* Waarheen wys hierdie woord? Sonder die storie daarby is 'n los sin
     onmoontlik om te beoordeel — "gaan hospitaal toe" is goeie raad op een
     plasing en gevaarlik op 'n ander. */
  const opMuur = new Map((data.muur || []).map(m => [m.id, m]))

  return (
    <>
      <p className="sk-wag">
        Net die gevlagdes en die gerapporteerdes kom hier. Al die ander woorde
        wys sommer.
      </p>

      {woorde.map(w => {
        const plasing = opMuur.get(w.muurId)
        return (
          <div key={w.id} className={`sk-ry${w.gerapporteer ? ' gevaar' : ''}`}>
            <div className="sk-ry-fyn">
              {w.dag} · {w.bron === 'klaar' ? 'klaargemaakte woord' : 'eie woorde'}
              {w.gerapporteer ? ` · ${w.gerapporteer}× gerapporteer` : ''}
              {w.rede && !w.gerapporteer ? ` · ${w.rede}` : ''}
              {/* Die belangrikste ding op hierdie ry: staan dit NOU op die
                  muur of nie? 'n Gevlagde woord wys; 'n gerapporteerde een is
                  reeds af. Sonder hierdie reel weet 'n mens nie of hy haastig
                  moet wees nie. */}
              {w.status === 'wys'
                ? <b className="sk-lewend"> · staan NOU op die muur</b>
                : <span> · nie op die muur nie</span>}
            </div>

            {plasing && plasing.titel && (
              <p className="sk-ry-titel">Onder: {plasing.titel}</p>
            )}
            {plasing && plasing.sensitief && (
              <div className="sk-krisis">Dit is 'n sensitiewe plasing</div>
            )}

            <p className="sk-voorskou">{w.teks}</p>

            <div className="sk-knoppe">
              <button
                className="sk-knop sk-plaas"
                disabled={besig}
                onClick={() => doen({ aksie: 'woord', woordId: w.id, wys: true })}
              >
                Laat wys
              </button>
              <button
                className="sk-knop"
                disabled={besig}
                onClick={() => doen({ aksie: 'woord', woordId: w.id, wys: false })}
              >
                Hou weg
              </button>
              <button className="sk-knop sk-vee" disabled={besig} onClick={() => {
                if (window.confirm('Vee hierdie woord heeltemal uit?')) {
                  doen({ aksie: 'woord', woordId: w.id, vee: true })
                }
              }}>Vee uit</button>
            </div>
          </div>
        )
      })}
    </>
  )
}

/* ── Wat BO staan ──
 *
 * Dit was: onbeantwoord eerste. 'n Plasing het as onbeantwoord getel totdat
 * DEWALD hom beantwoord het — nie totdat iemand gehelp het nie.
 *
 * Dewald: "die Pastorale Sorg-blad maak my ongelooflik moeg. ek het net teveel
 * om te doen. en kan nie almal antw nie."
 *
 * Daardie sortering was 'n deel van die rede. Dit het elke dag 'n groeiende
 * lys skuld boontoe gestoot, met sy naam op.
 *
 * Nou staan bo wat die GEMEENSKAP nog nie gedra het nie. Dit is die plasing
 * wat werklik aandag nodig het — 'n mens wat geskryf het en vir wie niemand
 * opgedaag het nie. Of Dewald geantwoord het, verander die volgorde glad nie. */
function rangMuur(m) {
  if (m.gepubliseer === false) return 3
  /* Gerapporteer staan HEEL BO. Plasings gaan nou dadelik op die muur, dus is
     'n rapport die enigste sein dat 'n mens moet kyk. */
  if (Number(m.rapporte) > 0) return 0
  return Number(m.saam) > 0 ? 2 : 1
}

/* ── Wat reeds op die muur is, en Dewald se antwoord daaronder ── */
function Muur({ data, doen, besig }) {
  const [oop, setOop] = useState(null)
  const [tipe, setTipe] = useState('oudio')
  const [bron, setBron] = useState('')
  const [teks, setTeks] = useState('')
  const [titel, setTitel] = useState('')

  /* Redigeer wat REEDS op die muur staan.

     Die opskrifte is later bygekom, dus het die eerste plasings nie een nie.
     Sonder hierdie knoppie sou 'n mens die plasing moes uitvee en die hele
     boodskap oordoen — en dan verloor jy die saamdra-telling en die
     antwoord. */
  const [wysigOop, setWysigOop] = useState(null)
  const [wTitel, setWTitel] = useState('')
  const [wTeks, setWTeks] = useState('')

  /* Wat nog nie beantwoord is nie, staan BO. Dit is die enigste rede om
     hierdie lys oop te maak: iets wag op 'n antwoord. Die res is klaar en
     hoef nie in die pad te wees nie. Afgehaalde plasings gaan heel onder.

     Die bediener stuur die muur reeds nuutste-eerste; ons hou daardie
     volgorde binne elke groep (sort is stabiel in elke blaaier wat ons
     ondersteun). */
  /* ── Die ROU boodskap, soos die mens dit gestuur het ──

     Die muur dra 'n GEREDIGEERDE kopie; die oorspronklike bly in die inbak.
     Dit het 'n mens gered toe die muur se perk 'n vrou se boodskap by 1188
     karakters afgekap het en die swaarste sin — dat sy 22 kg verloor het —
     eenvoudig verdwyn het. Die volle teks was al die tyd hier.

     Nou kan Dewald dit met een druk terugtrek. */
  const rou = new Map((data.inkomend || []).map(b => [b.id, b]))

  const muur = [...(data.muur || [])].sort((a, b) => rangMuur(a) - rangMuur(b))
  if (!muur.length) return <p className="sk-leeg">Niks op die muur nie.</p>

  async function stuur(m) {
    const d = await doen({ aksie: 'antwoord', muurId: m.id, antwoord: { tipe, titel, bron, teks } })
    if (d && d.ok) { setOop(null); setBron(''); setTeks(''); setTitel('') }
  }

  async function stoorWysig(m) {
    const d = await doen({ aksie: 'wysig', muurId: m.id, titel: wTitel, teks: wTeks })
    if (d && d.ok) setWysigOop(null)
  }

  /* Wat NIEMAND nog gedra het nie. Hier het "N plasings wag nog op jou
     antwoord" gestaan, en daardie getal kon net groei. Dit is nou 'n getal
     oor die gemeenskap, nie oor Dewald nie — en dit is 'n getal wat kan daal
     sonder dat hy 'n vinger lig. */
  const alleen = muur.filter(m => m.gepubliseer !== false && !Number(m.saam)).length
  const gedra = muur.filter(m => m.gepubliseer !== false && Number(m.saam) > 0).length

  const gerapporteer = muur.filter(m => m.gepubliseer !== false && Number(m.rapporte) > 0)

  return (
    <>
      {/* Die enigste ding op hierdie blad wat Dewald se oog MOET vang.
          Plasings gaan dadelik op; 'n rapport is die sein dat iets fout is. */}
      {gerapporteer.length > 0 && (
        <p className="sk-rapport-kop">
          ⚠ {gerapporteer.length === 1
            ? 'Een plasing is gerapporteer'
            : `${gerapporteer.length} plasings is gerapporteer`} — hulle staan heel bo.
        </p>
      )}

      {alleen > 0 ? (
        <p className="sk-wag">
          {alleen === 1
            ? 'Een plasing het nog niemand wat saam dra nie.'
            : `${alleen} plasings het nog niemand wat saam dra nie.`}
          {' '}Hulle staan hier bo.
        </p>
      ) : muur.length > 0 && (
        <p className="sk-gedra">
          Die gemeenskap dra elke plasing op die muur.
        </p>
      )}
      {gedra > 0 && (
        <p className="sk-gedra-fyn">
          {gedra === 1 ? 'Een plasing word gedra' : `${gedra} plasings word gedra`} —
          {' '}jy hoef nie op hulle te antwoord nie.
        </p>
      )}

      {/* Die merkie is nou vir 'n plasing wat ALLEEN staan, nie vir een
          sonder Dewald se antwoord nie. En "nog geen antwoord" is weg: 'n
          plasing is nie stukkend omdat hy nie geantwoord is nie. */}
      {muur.map(m => (
        <div key={m.id} className={`sk-ry${Number(m.rapporte) ? ' gerapporteer' : m.gepubliseer !== false && !Number(m.saam) ? ' wag' : ''}`}>
          <div className="sk-ry-fyn">
            {m.datum} · {m.naam || 'Anoniem'}
            {Number(m.saam) ? ` · ${m.saam} dra dit saam` : ' · nog niemand dra dit saam'}
            {m.antwoord ? ' · jy het bygevoeg' : ''}
            {Number(m.rapporte) ? ` · ⚠ ${m.rapporte} rapport${m.rapporte === 1 ? '' : 'e'}` : ''}
          </div>
          {/* Die opskrif, sodat 'n mens 'n plasing kan uitken sonder om die
              storie te lees. Op 'n vol muur is dit die verskil tussen soek en
              raaksien. */}
          {m.titel && <p className="sk-ry-titel">{m.titel}</p>}
          {/* Sonder hierdie merkie lyk 'n afgehaalde plasing presies soos een
              wat op die muur staan, en dan haal 'n mens dieselfde een twee
              keer af en wonder hoekom niks gebeur nie. */}
          {m.gepubliseer === false && <div className="sk-kontak">Van die muur af</div>}

          {/* ── Is hierdie plasing AFGESNY? ──

              Die muur het 'n perk van 1200 karakters gehad en het stilweg
              afgekap. 'n Vrou se boodskap het by 1188 opgehou, middel in 'n
              sin, en die swaarste deel — dat sy 22 kg verloor het — was
              eenvoudig weg.

              Die perk is nou ruim en dit weier eerder as om te sny, maar wat
              REEDS afgesny is, staan nog so. 'n Mens moet dit kan SIEN
              sonder om elke plasing oop te maak. */}
          {rou.get(m.bronId) && rou.get(m.bronId).teks &&
           rou.get(m.bronId).teks.length > (m.teks || '').length + 5 && (
            <div className="sk-krisis">
              Afgesny — {rou.get(m.bronId).teks.length - (m.teks || '').length} karakters
              van haar boodskap wys nie. Druk Redigeer en haal dit terug.
            </div>
          )}

          <Voorskou teks={m.teks} />

          {wysigOop === m.id && (
            <>
              <input
                className="sk-video"
                value={wTitel}
                onChange={e => setWTitel(e.target.value)}
                maxLength={110}
                placeholder="Die vraag in een reel"
              />
              <div className="admin-books-note">
                Dit staan BO die storie op die muur.
              </div>
              <textarea
                className="sk-teks"
                rows={9}
                value={wTeks}
                onChange={e => setWTeks(e.target.value)}
              />
              <div className="admin-books-note">
                {wTeks.length} karakters
                {rou.get(m.bronId) && rou.get(m.bronId).teks && rou.get(m.bronId).teks.length > wTeks.length && (
                  <b> · die oorspronklike is {rou.get(m.bronId).teks.length} — daar is teks wat NIE hier is nie</b>
                )}
              </div>

              {/* Trek die volle boodskap terug soos die mens dit gestuur het.
                  Dit is die pad terug wanneer iets uit die muur se kopie
                  weggeraak het. */}
              {rou.get(m.bronId) && rou.get(m.bronId).teks && (
                <button
                  className="sk-knop"
                  onClick={() => {
                    if (wTeks.trim() && !window.confirm(
                      'Vervang wat hier staan met die VOLLE boodskap soos sy dit gestuur het?' +
                      '\n\nJou redigering gaan verlore. Jy kan dit daarna weer regmaak voor jy stoor.'
                    )) return
                    setWTeks(rou.get(m.bronId).teks)
                  }}
                >
                  ↩ Haal die volle oorspronklike terug
                </button>
              )}

              <div className="sk-knoppe">
                <button className="sk-knop sk-plaas" disabled={besig || wTeks.trim().length < 10} onClick={() => stoorWysig(m)}>
                  Stoor
                </button>
                <button className="sk-knop" onClick={() => setWysigOop(null)}>Los</button>
              </div>
            </>
          )}

          {oop === m.id ? (
            <>
              <input
                className="sk-video"
                value={titel}
                onChange={e => setTitel(e.target.value)}
                maxLength={110}
                placeholder="Waarop antwoord jy? — bv. Wanneer is 'n groot uitgawe wysheid?"
              />
              <div className="admin-books-note">
                Dit staan bo die klankgreep. "Dewald antwoord" se nie waaroor
                dit gaan nie; hierdie reel wel, en dis wat mense laat druk.
              </div>

              <div className="sk-tipes">
                {[['oudio', 'Stemnota'], ['video', 'Video'], ['teks', 'Geskrewe']].map(([k, n]) => (
                  <button key={k} className={`sk-tipe${tipe === k ? ' aktief' : ''}`} onClick={() => setTipe(k)}>
                    {n}
                  </button>
                ))}
              </div>
              {/* 'n Stemnota word HIER opgeneem of gekies, nie iewers anders
                  opgelaai en dan geplak nie. Dieselfde as die stemnotas op
                  Luister. Vir 'n video bly dit 'n YouTube-skakel — daardie
                  bandwydte hoort nie by ons nie. */}
              {tipe === 'oudio' && <SorgOpname bron={bron} onBron={setBron} />}

              {tipe === 'video' && (
                <input
                  className="sk-video"
                  value={bron}
                  onChange={e => setBron(e.target.value)}
                  placeholder="YouTube-skakel"
                />
              )}
              <textarea
                className="sk-teks"
                rows={tipe === 'teks' ? 10 : 4}
                value={teks}
                onChange={e => setTeks(e.target.value)}
                placeholder={tipe === 'teks' ? 'Jou antwoord' : 'Iets daarby, as jy wil (opsioneel)'}
              />
              {/* Die antwoord het by 1500 karakters stilweg afgekap en die
                  einde van 'n paar antwoorde is so verlore. Die perk is nou
                  20 000 en dit weier eerder as om te sny — maar die telling
                  staan hier sodat dit nooit weer 'n verrassing is nie. */}
              <div className="admin-books-note">{teks.length} karakters</div>
              <div className="sk-knoppe">
                <button
                  className="sk-knop sk-plaas"
                  disabled={besig || (tipe === 'teks' ? !teks.trim() : !bron.trim())}
                  onClick={() => stuur(m)}
                >
                  Plaas die antwoord
                </button>
                <button className="sk-knop" onClick={() => setOop(null)}>Los</button>
              </div>
            </>
          ) : (
            <div className="sk-knoppe">
              <button className="sk-knop" onClick={() => {
                setOop(null)
                setWysigOop(m.id)
                setWTitel(m.titel || '')
                setWTeks(m.teks || '')
              }}>
                Redigeer
              </button>
              <button className="sk-knop sk-plaas" onClick={() => {
                setWysigOop(null)
                setOop(m.id)
                setTipe((m.antwoord && m.antwoord.tipe) || 'oudio')
                setTitel((m.antwoord && m.antwoord.titel) || '')
                setBron((m.antwoord && m.antwoord.bron) || '')
                setTeks((m.antwoord && m.antwoord.teks) || '')
              }}>
                {m.antwoord ? 'Verander die antwoord' : 'Antwoord'}
              </button>
              {/* Afhaal moet omkeerbaar wees. Dit was dit nie: 'n mens kon
                  'n plasing afhaal en dan was daar geen knoppie om hom terug
                  te sit nie. Die enigste pad terug sou deur die Firebase-
                  konsole gewees het. */}
              <button
                className="sk-knop"
                disabled={besig}
                onClick={() => doen({ aksie: 'wysig', muurId: m.id, gepubliseer: m.gepubliseer === false })}
              >
                {m.gepubliseer === false ? 'Sit terug op die muur' : 'Haal van die muur af'}
              </button>
              {/* Vra iemand dat sy ding heeltemal weggaan — POPIA gee hom
                  daardie reg — moet ALBEI kante weg: die muur en die rou
                  boodskap in die inbak. `bronId` wys na daardie kopie.

                  Hierdie knoppie het voorheen net op die inkomende lys
                  gestaan. Daardie lys wys nie meer hier nie, dus sou die
                  enigste volledige uitvee-pad verdwyn het. */}
              <button className="sk-knop sk-vee" disabled={besig} onClick={() => {
                if (window.confirm("Vee hierdie plasing heeltemal uit?\n\nDit gaan van die muur EN uit die inbak weg, saam met die antwoord en die saamdra-telling. Dit is wat 'n mens doen wanneer die persoon self vra dat dit weggaan.")) {
                  doen({ aksie: 'vee', muurId: m.id, id: m.bronId })
                }
              }}>Vee uit</button>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
