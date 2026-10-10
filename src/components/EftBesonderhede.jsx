/* ── Die EFT-besonderhede ──
 *
 * Dewald: "dalk moet jy die eft opsie beter maak. groter. skenk via direkte
 * eft. en by maandeliks wys dit nie eers nie."
 *
 * Dit was 'n klein onderstreepte skakeltjie onder die PayFast-knoppie in die
 * eenmalige vorm, en dit het glad NIE by die maandelikse vorm bestaan nie.
 *
 * Hoekom dit saak maak: PayFast vat 'n snytjie van elke bydrae, en baie
 * mense in Suid-Afrika betaal eerder direk uit hul bank-app — veral ouer
 * mense, en veral vir 'n bediening. 'n Skakel wat soos fyndruk lyk, lees
 * soos 'n noodplan; 'n knoppie langs die ander lees soos 'n keuse.
 *
 * ── Hoekom EEN komponent en nie twee blokke nie ──
 *
 * DonationCard.jsx se eie kommentaar sê dit reeds: "'n tweede kaart met sy
 * eie pad is 'n tweede plek wat stilweg agterbly die dag wanneer die
 * betaalstelsel verander." Dieselfde geld vir 'n rekeningnommer. Verander
 * die bank ooit, verander dit HIER, en dit verander oral.
 *
 * ── Die kopieerknoppie ──
 *
 * Die grootste wrywing by EFT is nie die besluit nie — dit is om 'n
 * tiensyfer-nommer van een app na 'n ander oor te tik, met die foon se
 * sleutelbord in die pad. Een tik kopieer dit.
 *
 * Geen transform of opacity op :active nie — sien CLAUDE.md.
 */
import { useState } from 'react'
import './EftBesonderhede.css'

const BANK = {
  bank:    'Capitec',
  naam:    'Dewald Scheepers',
  rekening:'2427361174',
  takkode: '470010',
}

/* Twee tale — die Engelse e-boekblad wys dieselfde EFT-blok in Engels. Die
   bankbesonderhede bly dieselfde; net die woorde skuif. */
const WOORDE = {
  af: {
    knopEenmalig: 'Of skenk direk via EFT',
    knopMaandeliks: 'Of stel ’n maandelikse EFT op',
    inlei: <>Stel dit een keer as ’n <b>maandelikse debietorder</b> by jou eie bank op. Dit loop dan vanself, en jy bly heeltemal in beheer — jy kan dit enige tyd by jou bank stop.</>,
    bank: 'Bank', naam: 'Naam', rekening: 'Rekening', takkode: 'Tak-kode',
    kopieer: 'Tik om te kopieer', gekopieer: '✓ Gekopieer',
    nota: <>Gebruik jou <b>selfoonnommer</b> as verwysing, sodat ons weet wie jy is.</>,
  },
  en: {
    knopEenmalig: 'Or give directly via EFT',
    knopMaandeliks: 'Or set up a monthly EFT',
    inlei: <>Set it up once as a <b>monthly debit order</b> with your own bank. It then runs by itself, and you stay fully in control — you can stop it at your bank at any time.</>,
    bank: 'Bank', naam: 'Name', rekening: 'Account', takkode: 'Branch code',
    kopieer: 'Tap to copy', gekopieer: '✓ Copied',
    nota: <>Use your <b>cellphone number</b> as the reference, so we know who you are.</>,
  },
}

export default function EftBesonderhede({ maandeliks = false, taal = 'af' }) {
  const w = WOORDE[taal] || WOORDE.af
  const [oop, setOop] = useState(false)
  const [gekopieer, setGekopieer] = useState('')

  async function kopieer(waarde, watter) {
    try {
      await navigator.clipboard.writeText(waarde)
      setGekopieer(watter)
      setTimeout(() => setGekopieer(''), 2000)
    } catch {
      /* Sommige blaaiers weier sonder 'n veilige konteks. Die nommer staan
         steeds op die skerm — 'n mens kan dit self oortik. */
    }
  }

  return (
    <div className="eft">
      <button className="eft-knop" onClick={() => setOop(v => !v)}>
        <span className="eft-knop-ikoon" aria-hidden="true">🏦</span>
        <span className="eft-knop-teks">
          {maandeliks ? w.knopMaandeliks : w.knopEenmalig}
        </span>
        <span className="eft-knop-pyl" aria-hidden="true">{oop ? '▲' : '▼'}</span>
      </button>

      {oop && (
        <div className="eft-blok">
          {maandeliks && <p className="eft-inlei">{w.inlei}</p>}

          <div className="eft-ry"><span>{w.bank}</span><b>{BANK.bank}</b></div>
          <div className="eft-ry"><span>{w.naam}</span><b>{BANK.naam}</b></div>

          <button
            className="eft-ry eft-ry-kopieer"
            onClick={() => kopieer(BANK.rekening, 'rekening')}
          >
            <span>{w.rekening}</span>
            <b>
              {BANK.rekening}
              <span className="eft-kopie-merk">
                {gekopieer === 'rekening' ? w.gekopieer : w.kopieer}
              </span>
            </b>
          </button>

          <button
            className="eft-ry eft-ry-kopieer"
            onClick={() => kopieer(BANK.takkode, 'takkode')}
          >
            <span>{w.takkode}</span>
            <b>
              {BANK.takkode}
              <span className="eft-kopie-merk">
                {gekopieer === 'takkode' ? w.gekopieer : w.kopieer}
              </span>
            </b>
          </button>

          <p className="eft-nota">{w.nota}</p>
        </div>
      )}
    </div>
  )
}
