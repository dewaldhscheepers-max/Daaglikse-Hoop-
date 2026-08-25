import InstallTelling from './InstallTelling'
import { useState, useEffect } from 'react'
import './PopupStyles.css'

/* Dewald: "Die popup vra vir donasie maar dit vra net eenmalig. Daar moet 2
 * knopies wees... Word 'n Maandelikse Hoop-Vennoot of Eenmalige bydrae. Soos
 * al die ander kaarte in die app."
 *
 * `DonationCard.jsx` het presies hierdie twee knoppies al oral in die app —
 * op Luister, Speel, Bid Nou, Sorg, ensovoorts. Hierdie opspringer was die
 * EEN plek wat agtergebly het: dit het net na die eenmalige vloei gewys, en
 * aan die einde van 'n maand — wanneer mense juis besluit om te gee — is 'n
 * maandelikse opsie wat glad nie gevra word nie, geld wat nooit kom nie. */
export function DonationPopup({ onMonthly, onOnce, onClose }) {
  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onClose}>✕</button>
        <div className="popup-icon">🙏</div>
        <h3 className="popup-title">Het Daaglikse Hoop jou hierdie maand gehelp?</h3>
        <p className="popup-body">
          As hierdie app vir jou hoop, vrede of krag gebring het, kan jy help dat ons meer mense bereik.
        </p>
        <p className="popup-body">
          Jou bydrae help ons om daaglikse stemnotas, gebed en geestelike hulpbronne beskikbaar te hou vir mense wat swaar dra.
        </p>
        <button className="popup-btn-monthly" onClick={onMonthly}>Word 'n Maandelikse Hoop-Vennoot</button>
        <button className="popup-btn-once" onClick={onOnce}>Eenmalige bydrae</button>
        <button className="popup-btn-secondary" onClick={onClose}>Nie nou nie</button>
      </div>
    </div>
  )
}

/* ── Die installeer-uitklap ──
 *
 * `pad` kom van `kiesPad()` in src/data/installeerPad.js — die enigste plek
 * waar besluit word wat 'n besoeker kan doen. Elke pad kry hier 'n knoppie
 * wat WERKLIK iets doen op daardie foon.
 *
 * Dit was een uitklap vir almal met "Sit op my foon" daarop, en op die
 * meeste fone het daardie knoppie op 'n hulpvenster uitgekom met "tik die
 * drie kolletjies, kies Voeg by tuisskerm". In Facebook se blaaier is daar
 * geen drie kolletjies nie. Op 'n iPhone wat nie Safari is nie, is daar geen
 * "Voeg by tuisskerm" nie. Die mense het gelees, probeer, niks gekry, en
 * weggeloop.
 *
 * 'n Knoppie wat niks doen nie is erger as stilte. */
const STAPPE = {
  safari: [
    ['Maak ', 'Safari', ' oop op jou iPhone'],
    ['Gaan na ', 'dewaldscheepers.com', ''],
    ['Tik ', '⬆ Deel', ' en dan "Voeg by tuisskerm"'],
  ],
  ios: [
    ['Tik die ', '⬆ Deel', '-knoppie onderaan'],
    ['Kies ', '"Voeg by tuisskerm"', ''],
    ['Tik ', '"Voeg by"', ' — klaar!'],
  ],
}

export function InstallPopup({ pad = 'prompt', onInstall, onLater, onHelp, chromeUrl }) {
  const [gekopieer, setGekopieer] = useState(false)

  const lyf = {
    prompt: 'Sit dit op jou foon se tuisskerm, dan kan jy elke oggend maklik luister.',
    chrome: 'Maak dit een keer in Chrome oop, tik Installeer, en dit staan op jou tuisskerm — met ’n boodskap elke oggend.',
    safari: 'Op ’n iPhone kan net Safari dit op jou tuisskerm sit.',
    ios:    'Drie tikke, en dit staan op jou tuisskerm.',
    stappe: 'Sit dit op jou foon se tuisskerm, dan kan jy elke oggend maklik luister.',
  }[pad] || 'Sit dit op jou foon se tuisskerm, dan kan jy elke oggend maklik luister.'

  /* Daar is geen manier om 'n iPhone na Safari te dwing nie — iOS het niks
     soos Android se intent nie. Die adres na die knipbord is al wat ons kan
     gee, en niemand tik 'n URL oor nie. */
  async function kopieerAdres() {
    try {
      await navigator.clipboard.writeText('https://www.dewaldscheepers.com')
      setGekopieer(true)
    } catch { setGekopieer(true) }
  }

  const stappe = STAPPE[pad]

  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🏡</div>
        <h3 className="popup-title">Sit Daaglikse Hoop op jou foon</h3>
        <p className="popup-body">{lyf}</p>

        {stappe && (
          <ol className="popup-stappe">
            {stappe.map(([voor, sterk, na], i) => (
              <li key={i}>{voor}<strong>{sterk}</strong>{na}</li>
            ))}
          </ol>
        )}

        {/* Die getal staan HIER, op die oomblik van die besluit. 'n Mens wat
            twyfel of dit die moeite werd is, kry die antwoord van ander mense
            eerder as van 'n knoppie. */}
        <InstallTelling klas="popup-telling" />

        {pad === 'chrome' && (
          <a className="popup-btn-primary" href={chromeUrl}>Maak oop in Chrome</a>
        )}
        {pad === 'safari' && (
          <button className="popup-btn-primary" onClick={kopieerAdres}>
            {gekopieer ? '✓ Gekopieer — plak dit in Safari' : '📋 Kopieer die adres'}
          </button>
        )}
        {pad === 'prompt' && (
          <button className="popup-btn-primary" onClick={onInstall}>Sit op my foon</button>
        )}
        {pad === 'stappe' && (
          <button className="popup-btn-primary" onClick={onHelp}>Wys my hoe</button>
        )}

        <button className="popup-btn-secondary" onClick={onLater}>Later</button>
      </div>
    </div>
  )
}

/* ── "Kry elke oggend 'n boodskap" ──

   Dit was 'n dun balkie onderaan die skerm met 13px-teks en 'n ✕. Dit het
   soos 'n advertensie gelyk en 'n mens het dit weggevee sonder om te lees.
   Nou is dit dieselfde uitklap as die installasie-vraag — die vorm wat die
   app reeds gebruik wanneer hy iets belangriks vra.

   ── Wat NIE verander het nie, en hoekom ──

   HOE DIKWELS dit vra, bly presies dieselfde: net ná 'n nota klaar
   gespeel het, hoogstens drie keer in 'n leeftyd, minstens sewe dae
   uitmekaar. Sien src/data/kennisgewingVra.js en CLAUDE.md.

   Daardie reels is duur geleer. Hier het 'n balkie gestaan wat ná ELKE
   oopmaak gewys het sonder enige geheue, en dit het teen homself gewerk:
   iemand druk dit weg, dit kom môre weer, en op 'n dag druk hy die
   BLAAIER se "Block" om daarvan ontslae te raak. Daardie besluit is
   PERMANENT — `requestPermission()` gee van toe af dadelik `denied`
   sonder om iets te wys, en die app kan hom nooit weer bereik nie.

   Groter mag dus nie meer beteken nie. */
export function KennisgewingPopup({ onJa, onLater }) {
  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🌅</div>
        <h3 className="popup-title">Wil jy elke oggend 'n boodskap kry?</h3>
        <p className="popup-body">
          Ons stuur een keer per dag, in die oggend, 'n kort woord van hoop —
          niks anders nie. Jy kan dit enige tyd afskakel.
        </p>
        <button className="popup-btn-primary" onClick={onJa}>Ja, stuur dit vir my</button>
        <button className="popup-btn-secondary" onClick={onLater}>Nie nou nie</button>
      </div>
    </div>
  )
}

/* ── "Nog een stap" ──

   Op Android 13 en later moet die APP self toestemming he om kennisgewings
   te wys, en die app se venster kry dit nie aangeskakel nie. Dit is 'n oop
   fout in die TWA-gereedskap (PWABuilder #4817, android-browser-helper
   #563): 'n mens druk "Toelaat", die stelsel gee niks, en die webvraag word
   dadelik geweier — sonder om iets te wys.

   Dewald en sy vrou het albei "Ja" gedruk en albei niks gekry nie. Toe sy
   dit HANDMATIG in Android se instellings aangeskakel het, het dit
   onmiddellik gewerk. Die weg is dus daar; die app moet net vertel waar.

   Sonder hierdie skerm druk 'n mens "Ja, stuur dit vir my", daar gebeur
   niks sigbaars, en hy dink die app is stukkend. Dit is die presiese
   oomblik waar hy dit wil he — nie 'n stil reel iewers onder nie. */
export function KennisgewingStappe({ opProbeerWeer, onLater }) {
  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🔔</div>
        <h3 className="popup-title">Nog een stap op jou foon</h3>
        <p className="popup-body">
          Android moet dit eers vir Daaglikse Hoop toelaat. Dit vat 'n halwe minuut:
        </p>
        <ol className="popup-stappe">
          <li>Hou jou vinger op die Daaglikse Hoop-ikoon op jou tuisskerm</li>
          <li>Tik die <b>ⓘ</b> (Programinligting)</li>
          <li>Kies <b>Kennisgewings</b></li>
          <li>Sit <b>Laat kennisgewings toe</b> aan</li>
          <li>Kom terug hierheen</li>
        </ol>
        <button className="popup-btn-primary" onClick={opProbeerWeer}>Ek het dit aangesit</button>
        <button className="popup-btn-secondary" onClick={onLater}>Later</button>
      </div>
    </div>
  )
}

const SHARE_MSG = 'Ek dink hierdie app gaan jou help. Daaglikse Hoop gee elke oggend \'n kort boodskap van hoop, gebed en bemoediging.\n\nLaai dit hier af: https://dewaldscheepers.com/go'
const WA_GROUP_URL = `https://wa.me/?text=${encodeURIComponent(SHARE_MSG)}`

export function SharePopup({ onShare, onDone, onLater }) {
  const [count, setCount] = useState(0)

  async function handleShare() {
    await onShare()
    setCount(c => c + 1)
  }

  if (count >= 3) {
    return (
      <div className="popup-backdrop" onClick={onDone}>
        <div className="popup-card" onClick={e => e.stopPropagation()}>
          <div className="popup-icon">🙏</div>
          <h3 className="popup-title">Baie dankie!</h3>
          <p className="popup-body">Jy het 3 mense gehelp om elke oggend hoop te ontvang. God seën jou daarvoor.</p>
          <button className="popup-btn-primary" onClick={onDone}>Klaar</button>
        </div>
      </div>
    )
  }

  const titles = [
    'Ken jy iemand wat hoop nodig het?',
    'Mooi! Dink aan nog iemand?',
    'Amper daar — laaste een?',
  ]
  const bodies = [
    'Dink aan 3 mense in jou lewe wat hierdie boodskap nodig het. Deel die app met elkeen — dit kan hulle dag verander.',
    "Een persoon het jy gehelp. Wie anders in jou lewe dra swaar en het 'n woord van hoop nodig?",
    'Nog een stuur en jy het 3 mense se oggend verander. Wie het jy nog nie gestuur nie?',
  ]

  return (
    <div className="popup-backdrop" onClick={onLater}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onLater}>✕</button>
        <div className="popup-icon">🌱</div>

        <div className="share-dots">
          {[0, 1, 2].map(i => (
            <div key={i} className={`share-dot${i < count ? ' share-dot-filled' : ''}`} />
          ))}
        </div>

        <h3 className="popup-title">{titles[count]}</h3>
        <p className="popup-body">{bodies[count]}</p>

        <button className="popup-btn-primary" onClick={handleShare}>
          {count === 0 ? 'Deel die app 🙏' : 'Deel met nog een →'}
        </button>
        <a
          className="popup-btn-whatsapp"
          href={WA_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setTimeout(onDone, 500) }}
        >
          💬 Stuur na 'n WhatsApp groep
        </a>
        <button className="popup-btn-secondary" onClick={count > 0 ? onDone : onLater}>
          {count > 0 ? 'Klaar' : 'Later'}
        </button>
      </div>
    </div>
  )
}

export function EbookPopup({ book, onView, onClose }) {
  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-x" onClick={onClose}>✕</button>
        <div className="popup-book-icon" style={{ background: book.color }}>
          <span>{book.emoji}</span>
        </div>
        <p className="popup-label">Nuwe e-boek beskikbaar</p>
        <h3 className="popup-title">{book.title}</h3>
        <p className="popup-body">{book.desc}</p>
        <button className="popup-btn-primary" onClick={onView}>Kyk na die e-boek</button>
        <button className="popup-btn-secondary" onClick={onClose}>Later</button>
      </div>
    </div>
  )
}
