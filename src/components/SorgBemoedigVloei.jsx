/* ────────────────────────────────────────────────────────────
   "Luister na iemand" — een mens op 'n slag.

   Dewald: "wanneer jy op die knoppie bid saam kliek op bid saam page dan
   [neem] dit jou deur al die gebede, en dan bid mense saam. dieselfde moet
   gebeur wanneer ek op Luister na iemand kliek... maar in plek dat jy saam
   bid klik kan jy die persoon bemoedig deur te komment."

   Dit is Bid Saam se `SaamgebedFlow`, met een verskil: die knoppie onderaan
   is nie "Ek het gebid" nie — dit is 'n KASSIE waarin 'n mens skryf.

   Ons gebruik doelbewus dieselfde `sg-*`-klasse. Dit is nie luiheid nie:
   Dewald het gesê "dit moet dieselfde wys", en 'n mens wat Bid Saam se vloei
   ken, moet hierdie een herken sonder om iets te leer. Een stel style, een
   gedrag, een plek om dit te verander.

   ── Waarom dit 'n WAGRY is en nie 'n lys nie ──

   Die muur is 'n lys van sewe-en-sestig stories. 'n Mens wat wil help, kyk
   daarna en weet nie waar om te begin nie, en dan help hy niemand. 'n Wagry
   vra een vraag: hierdie mens, nou. Dit is presies waarom Bid Saam s'n werk.

   Die wagry word EEN keer gebou en dan vasgehou — anders skuif 'n storie
   onder jou uit terwyl jy tik. Dieselfde `queueRef`-truuk as Bid Saam, en om
   dieselfde rede.
   ──────────────────────────────────────────────────────────── */

import { useState, useRef } from 'react'
import { MAKS_WOORD, klaarWoordeVir, telOpmerkings } from '../data/sorgSaamstaan'
import { stuurWoord, onthouSaamDra } from '../data/sorgMuur'
import { myProfiel } from '../data/sorgProfielBerging'
import { onderwerpNaam } from '../data/sorgOnderwerpe'
import { gelede } from '../data/sorgTyd'
import { meet } from '../data/sorgMeetStuur'
import SorgProfiel from './SorgProfiel'
import './SorgBemoedigVloei.css'

/* Hoeveel dae oud 'n storie nog in die ry mag wees. Bid Saam gebruik twee
   dae; hier is dit vier — 'n mens wat 'n storie skryf, wag nie oornag op
   antwoord soos 'n gebedsversoek nie, en die muur is stiller. */
const VIER_DAE_MS = 4 * 24 * 60 * 60 * 1000

export default function SorgBemoedigVloei({ plasings, saamDra, gereed, onClose, onGeskryf }) {
  const [idx, setIdx] = useState(0)
  const [gedoen, setGedoen] = useState(new Set())
  const [klaar, setKlaar] = useState(false)
  const [teks, setTeks] = useState('')
  const [besig, setBesig] = useState(false)
  const [fout, setFout] = useState('')
  const [profiel, setProfiel] = useState(() => myProfiel())
  const [profielOop, setProfielOop] = useState(false)

  /* ── Die wagry, een keer gebou ──
   *
   * Wie NOG NIEMAND gehad het nie, kom eerste. Dit is dieselfde sortering as
   * die blad self ("Wag nog vir iemand" bo), en dit is die hele punt van
   * hierdie skerm: die mens wat die langste gewag het, kry die eerste woord.
   *
   * Dewald: "dit moet net die boodskappe wys wat ek nog nie geantwoord het
   * nie. en ook nie ouer as 4 dae nie. kyk hoe bidsaam werk." Bid Saam se
   * `SaamgebedFlow` doen presies dit: `!prayed.has(p.id)` en 'n dae-grens op
   * `queueRef`-bou. Hier is `prayed` se ewebeeld `saamDra` — die gesprekke
   * waarby HIERDIE foon reeds gaan sit het (sien sorgSaamDra.js). Wat langer
   * as vier dae oud is, val ook uit: 'n storie van verlede week het reeds
   * ander mense se antwoorde gehad, en hoort nie meer in 'n "nou-nou"-ry
   * nie. */
  const ryRef = useRef(null)
  if (ryRef.current === null && gereed) {
    const gedra = new Set((saamDra || []).map(r => r.id))
    const grens = Date.now() - VIER_DAE_MS
    ryRef.current = [...(plasings || [])]
      .filter(p => p && p.id && p.teks)
      .filter(p => !gedra.has(p.id))
      .filter(p => {
        const ms = Date.parse(p.geskep || p.datum || '')
        return Number.isFinite(ms) && ms >= grens
      })
      .sort((a, b) => {
        const n = telOpmerkings(a) - telOpmerkings(b)
        if (n !== 0) return n
        /* Binne dieselfde telling: die OUDSTE eerste. Hy wag die langste. */
        return String(a.geskep || a.datum || '').localeCompare(String(b.geskep || b.datum || ''))
      })
  }

  if (ryRef.current === null) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-title">Besig om die stories te haal…</p>
          <p className="sg-done-sub">Net 'n oomblik.</p>
        </div>
      </div>
    )
  }

  const ry = ryRef.current
  const totaal = ry.length
  const huidige = ry[idx]

  function volgende() {
    setTeks('')
    setFout('')
    if (idx + 1 >= totaal) setKlaar(true)
    else setIdx(i => i + 1)
  }

  async function stuur(sleutel, watProfiel = profiel) {
    if (besig || !huidige) return
    /* Die EERSTE keer word om 'n naam gevra — dieselfde as in die
       opmerkings-blad. Sy woorde bly staan terwyl hy kies. */
    if (!watProfiel && !profielOop) { setProfielOop(true); return }

    setBesig(true)
    setFout('')
    const d = await stuurWoord(
      huidige.id,
      sleutel ? { woord: sleutel } : { teks: teks.trim() },
      'muur',
      watProfiel,
    )
    setBesig(false)
    if (d && d.fout) { setFout(d.fout); return }
    if (!d || (!d.woord && !d.wag)) {
      setFout('Ons kon dit nie plaas nie. Probeer asseblief weer.')
      return
    }
    onthouSaamDra(huidige.id, telOpmerkings(huidige) + 1)
    meet('antwoordKlaar')
    setGedoen(s => new Set([...s, huidige.id]))
    if (onGeskryf) onGeskryf()
    volgende()
  }

  if (totaal === 0) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-title">Niemand wag op hierdie oomblik nie.</p>
          <p className="sg-done-sub">Kom later terug — daar is elke dag nuwe mense.</p>
          <button className="sg-back-btn" onClick={onClose}>Terug</button>
        </div>
      </div>
    )
  }

  if (klaar) {
    return (
      <div className="sg-overlay">
        <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        <div className="sg-done-body">
          <div className="sg-done-cross">✦</div>
          <p className="sg-done-eyebrow">Klaar</p>
          <p className="sg-done-title">
            Jy het {gedoen.size} {gedoen.size === 1 ? 'mens' : 'mense'} bemoedig.
          </p>
          <p className="sg-done-sub">
            Elkeen van hulle sien vandag dat iemand hulle gehoor het.
          </p>
          <button className="sg-back-btn" onClick={onClose}>Terug na Dra Mekaar</button>
        </div>
      </div>
    )
  }

  const vordering = totaal > 0 ? (idx / totaal) * 100 : 0
  const wieNaam = huidige.naam || 'Anoniem'
  const wanneer = gelede(huidige.geskep || huidige.datum)
  const nogNiemand = telOpmerkings(huidige) === 0

  return (
    <div className="sg-overlay">
      <div className="sg-top-bar">
        <div className="sg-progress-track">
          <div className="sg-progress-fill" style={{ width: `${vordering}%` }} />
        </div>
        <div className="sg-top-row">
          <span className="sg-progress-label">{idx + 1} van {totaal}</span>
          <button className="sg-close-btn" onClick={onClose} aria-label="Maak toe">✕</button>
        </div>
      </div>

      <div className="sg-body sbv-body">
        <p className="sg-eyebrow">
          {nogNiemand
            ? 'Niemand het nog geantwoord nie. Skryf vir hierdie mens.'
            : 'Neem ’n oomblik. Lees, en skryf iets vir hierdie mens.'}
        </p>

        <div className="sg-prayer-card-inner">
          <div className="sg-card-accent" />
          {huidige.titel && <p className="sbv-titel">{huidige.titel}</p>}
          {/* Die HELE storie, nie 'n afgekapte een nie. 'n Mens kan nie iemand
              bemoedig oor 'n halwe sin nie. */}
          <p className="sg-prayer-text sbv-teks">{huidige.teks}</p>
          <span className="sg-prayer-meta">
            {wieNaam}
            {onderwerpNaam(huidige.onderwerp) ? ` · ${onderwerpNaam(huidige.onderwerp)}` : ''}
            {wanneer ? ` · ${wanneer}` : ''}
          </span>
        </div>

        {profielOop ? (
          <div className="sbv-profiel">
            <SorgProfiel
              profiel={profiel}
              kop="Wie praat hier?"
              fyn="Mense moet weet wie saam met hulle praat. Jy tik dit net hierdie een keer."
              onKlaar={p => { setProfiel(p); setProfielOop(false); stuur('', p) }}
              onSluit={() => { setProfielOop(false); stuur('', null) }}
            />
          </div>
        ) : (
          <>
            {/* Vir wie nie weet wat om te sê nie. Een druk stuur dit en gaan
                aan — dieselfde ritme as "Ek het gebid". */}
            <div className="sbv-vinnig">
              {klaarWoordeVir('muur').map(w => (
                <button
                  key={w.sleutel}
                  className="sbv-vinnig-knop"
                  disabled={besig}
                  onClick={() => stuur(w.sleutel)}
                >
                  {w.teks}
                </button>
              ))}
            </div>

            <textarea
              className="sbv-kassie"
              value={teks}
              rows={4}
              maxLength={MAKS_WOORD}
              placeholder="Skryf iets vir hierdie mens…"
              onChange={e => { setTeks(e.target.value.slice(0, MAKS_WOORD)); setFout('') }}
            />
            {/* Die telling wys eers wanneer 'n mens naby die perk kom. 'n
                Teller wat van die eerste letter af tel, laat 'n mens korter
                skryf as wat hy wou. */}
            {teks.length > MAKS_WOORD - 300 && (
              <p className="sbv-tel">{teks.length} / {MAKS_WOORD}</p>
            )}

            {fout && <p className="sbv-fout">{fout}</p>}

            <button
              className="sg-prayed-btn"
              disabled={besig || !teks.trim()}
              onClick={() => stuur('')}
            >
              <span className="sg-prayed-icon">💬</span>
              {besig ? 'Besig…' : 'Stuur en gaan voort'}
            </button>

            <button className="sg-stop-btn" onClick={volgende}>Slaan oor</button>
            <button className="sg-stop-btn" onClick={onClose}>Ek wil ophou</button>
          </>
        )}
      </div>
    </div>
  )
}
