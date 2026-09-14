/* ── DIE GEBEDSKAART IN DIE VOER ──
 *
 * Dewald se eie ontwerp, 14 September 2026: 'n volskerm-kaart tussen die clips
 * wat vra of ons saam met haar kan bid, met die deel-knoppie in die middel en 'n
 * klein ondersteuner-reël heel onder.
 *
 * Die REËLS staan in `src/data/reelsGebed.js` — wanneer hy wys, waar hy staan,
 * en wanneer die ondersteuner-reël wegval. Lees daardie kop eerste.
 *
 * ── Wat hierdie skerm doen, en wat hy NIE doen nie ──
 *
 * Hy skep niks. Die knoppie maak die BESTAANDE gebedsvorm op Bid Saam oop, tot
 * IN die kassie; die twee klein skakels maak die BESTAANDE skenk-vorms oop. Daar
 * is geen tikkassie hier nie — 'n sleutelbord in 'n snap-voer veg met die voer,
 * en 'n vrye teksblok wat direk op die muur land, gaan verby die krisis-keuring
 * wat die egte vorm reeds doen.
 *
 * ── Net die KNOPPIE navigeer ──
 *
 * Dewald: *"net as ek op deel gebedsversoek kliek."* Hy is reg, en dit is die
 * belangrikste besluit hierin: 'n volskerm-tikteiken in 'n swiep-voer vuur op
 * swiep-bedoeling, en dan voel die kaart soos 'n strik.
 *
 * ── Die Android-reëls geld hier ook ──
 *
 * Die grond is 'n ONDEURSIGTIGE kleur met 'n `linear-gradient` daarop — geen
 * `<img>`, geen `filter: blur()`, geen `backdrop-filter`. Die dagbreek is dus
 * geverf in die ouer se laag en maak geen saamgestelde laag oor 'n bewegende
 * voer nie. Geen `transform` of `opacity` op `:active` nie — net kleur.
 *
 * ── Die 🙏 ──
 *
 * Dieselfde uitsondering as `TekenHande` op Tyd met God, en om dieselfde rede:
 * Dewald het self gevra dat dit bidhandjies moet wees, en elke geteken de
 * weergawe lees soos 'n blaar of 'n pen-punt. *"gebruik net die emoji."* Die
 * prys — dit lyk op elke foon anders — is bekend en aanvaar.
 */
import './ReelsGebedKaart.css'

export default function ReelsGebedKaart({ wysSteun, onDeelVersoek, onSkenk }) {
  return (
    <div className="rg">
      <div className="rg-binne">
        <span className="rg-emoji" aria-hidden="true">🙏</span>

        <h2 className="rg-kop">Kan ons saam met jou bid?</h2>

        <p className="rg-lei">Jy hoef nie alles alleen te dra nie.</p>
        <p className="rg-teks">
          Deel jou hart op die gebedsmuur, sodat die Daaglikse
          Hoop-gemeenskap saam met jou kan bid.
        </p>

        {/* Die ENIGSTE ding op hierdie kaart wat navigeer. */}
        <button className="rg-knop" onClick={onDeelVersoek}>
          Deel my gebedsversoek
        </button>
      </div>

      {/* ── Die ondersteuner-reël ──
          Bietjie groter as die klein ry op Tyd met God se klaar-skerm — Dewald
          het dit so gevra — maar steeds duidelik kleiner as die goue pil, wat
          die enigste ding op die skerm bly wat soos 'n knoppie skree.

          Hy val heeltemal weg op 'n dag wat daar reeds oor geld gepraat is.
          Sien `magWysSteun()`. */}
      {wysSteun && (
        <div className="rg-steun">
          <p className="rg-steun-lei">Word ’n Daaglikse Hoop-ondersteuner</p>
          <div className="rg-steun-ry">
            <button className="rg-steun-knop" onClick={() => onSkenk('een')}>
              Eenmalige donasie
            </button>
            <button className="rg-steun-knop" onClick={() => onSkenk('maand')}>
              Maandelikse donasie
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
