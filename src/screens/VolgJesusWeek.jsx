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
 *   · die opening is KORT — wie is ek, wat leer ek, wat druk ek. Die lang
 *     inleiding kom NA die klik, nie voor nie;
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
import './VolgJesusWeek.css'

/* Wat elke dag se kop se. Punt 3 §55. */
const DAE = [
  { n: 1, merk: 'DAG 1', titel: 'Ontmoet Jesus' },
  { n: 2, merk: 'DAG 2', titel: 'Kyk weer' },
  { n: 3, merk: 'DAG 3', titel: 'Gehoorsaam' },
  { n: 4, merk: 'DAG 4', titel: 'Hart' },
  { n: 5, merk: 'DAG 5', titel: 'Leef dit' },
]

export default function VolgJesusWeek({ week, rol = 'solo', opSluit }) {
  const [blad, setBlad] = useState('oop')   /* 'oop' | 'dag' | 'klaar' | 'groep' | 'fas' */
  const [dag, setDag]   = useState(1)
  const [antwoord, setAntwoord] = useState(null)

  if (!week) return null

  const wysOortjies = rol === 'groep' || rol === 'fasiliteerder'

  function beginDag(n) { setDag(n); setBlad('dag'); setAntwoord(null); boToe() }
  function klaarMetDag() { setBlad('klaar'); boToe() }
  function boToe() { try { window.scrollTo({ top: 0 }) } catch {} }

  /* ── Die opening: kort ──────────────────────────────────────────────
     Op 'n foon moet iemand binne twee sekondes weet waar hy is, wat hy gaan
     leer, en wat hy druk. Die lang inleiding wag agter die knoppie. */
  if (blad === 'oop') {
    return (
      <div className="vw">
        {wysOortjies && <Oortjies rol={rol} aktief="week" opKies={setBlad} />}
        <div className="vw-open">
          <div className="vw-open-merk">WEEK {week.weeknommer} VAN 52</div>
          <h1 className="vw-open-titel">{week.titel}</h1>
          {week.doel && <p className="vw-open-doel">{week.doel}</p>}
          <button className="vw-hoofknop" onClick={() => beginDag(1)}>
            BEGIN WEEK {week.weeknommer}
          </button>
        </div>

        {/* Die lang inleiding, NA die knoppie. Wie dit wil lees, lees dit. */}
        {week.openingskerm && (
          <details className="vw-meer">
            <summary>Waaroor gaan hierdie week?</summary>
            <p>{week.openingskerm}</p>
          </details>
        )}

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
            {[week.groepVraag1, week.groepVraag2, week.groepVraag3]
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
    </>
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
