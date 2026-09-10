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
  /* Klaar met alles wat gepubliseer is, en wag vir die volgende week. */
  const wag = !begin && week.wag === true

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

        {/* ── Drie gesigte, nie twee nie ──

            "GAAN VOORT" op 'n week wat 'n mens KLAAR het, is 'n kaart wat lieg.
            Dewald, 10 September 2026, met 'n skermkiekie: "week 4 klaar maar
            kaart wys nog week 4."

            Is hy by die laaste gepubliseerde week en het hy dit klaar, dan sê
            die kaart wat werklik waar is: die volgende week kom. Die knoppie
            bly — sy antwoorde, die groepsessie en die wallpapers is almal nog
            daarbinne. */}
        <span className="vjk-sub">
          {begin
            ? '52 weke saam met Jesus'
            : wag
              ? `Week ${week.volgende || week.nommer + 1} kom binnekort`
              : `Week ${week.nommer} van 52`}
        </span>

        {!begin && (
          wag
            ? <span className="vjk-week">Jy het Week {week.nommer} klaargemaak.</span>
            : week.titel && <span className="vjk-week">{week.titel}</span>
        )}

        <span className="vjk-knop">
          {begin ? 'BEGIN HIER' : wag ? 'SIEN DIT WEER' : 'GAAN VOORT'}
          {' '}<span aria-hidden="true">›</span>
        </span>
      </span>
    </button>
  )
}
