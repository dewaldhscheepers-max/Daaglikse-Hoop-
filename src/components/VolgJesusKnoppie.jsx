/* ── Die VOLG JESUS-kaart ──
 *
 * Die groot goue knoppie wat later op Luister en op die E-boeke-blad staan.
 *
 * ── Dit is NIE 'n <img> nie ──
 *
 * Dit is 'n CSS-`background-image` op 'n ONDEURSIGTIGE houer, en dit is nie
 * 'n smaaksaak nie. 'n Volskerm-`<img>` is die grootste tekstuur in die app
 * en Chrome gee dit maklik sy eie saamgestelde laag; dit is presies wat
 * Vrugtefees se gekleurde strepe veroorsaak het. 'n Agtergrond word in die
 * ouer se laag geverf, en 'n ongeverfde teel wys die agtergrondkleur in
 * plaas van rou geheue. Sien CLAUDE.md.
 *
 * Om dieselfde rede is daar geen `transform` op `:active` nie — net kleur.
 *
 * ── Die woorde is TEKS, nie deel van die prent nie ──
 *
 * Die eerste weergawe van hierdie kunswerk het "VOLG JESUS" en "BEGIN HIER"
 * ingebak gehad. Dan kan die knoppie nooit verander in
 * "Week 17 van 52 · GAAN VOORT" nie — 'n mens sou 52 prente moes maak. Nou
 * dra die prent net die sonsopkoms, en die woorde staan bo-oor.
 */
import './VolgJesusKnoppie.css'

export default function VolgJesusKnoppie({ week = null, opKlik }) {
  const begin = !week || !week.nommer

  return (
    <button className="vjk" onClick={opKlik}>
      {/* Die donker sluier onder die teks. Die kunswerk is links onder reeds
          donker, maar 'n mens mag nooit op 'n PRENT staatmaak vir leesbare
          teks nie — 'n ander prent, of 'n prent wat nie laai nie, en die
          woorde verdwyn. */}
      <span className="vjk-sluier" />

      <span className="vjk-binne">
        <span className="vjk-titel">VOLG JESUS</span>
        <span className="vjk-streep" />
        <span className="vjk-sub">
          {begin ? '52 weke saam met Jesus' : `Week ${week.nommer} van 52`}
        </span>
        {!begin && week.titel && <span className="vjk-week">{week.titel}</span>}
        <span className="vjk-knop">
          {begin ? 'BEGIN HIER' : 'GAAN VOORT'} <span aria-hidden="true">›</span>
        </span>
      </span>
    </button>
  )
}
