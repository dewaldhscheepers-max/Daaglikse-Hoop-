/* ────────────────────────────────────────────────────────────
   Twee knoppies wat onderaan elke speletjie se eerste blad sit.

   Die res van die app vra hier en daar vir steun; die speletjies het dit
   glad nie gedoen nie, en dit is juis waar mense tyd deurbring.

   Dit sit ONDERAAN, nooit voor die Speel-knoppie nie. Iemand wat wil speel,
   moet nooit eers by 'n versoek om geld verbykom nie.
   ──────────────────────────────────────────────────────────── */

export default function SteunKnoppies({ teks, donker = true }) {
  return (
    <div className={'steun-blok' + (donker ? ' donker' : '')}>
      <p className="steun-teks">
        {teks || 'Hierdie speletjie is gratis. As dit vir jou iets beteken, help ons om dit so te hou.'}
      </p>
      <div className="steun-rye">
        <button
          className="steun-knop steun-primer"
          onClick={() => window.dispatchEvent(new CustomEvent('open-hoop-vennoot'))}
        >
          Maandelikse Hoopdraer
        </button>
        <button
          className="steun-knop steun-spook"
          onClick={() => window.dispatchEvent(new CustomEvent('open-donation'))}
        >
          Eenmalige bydrae
        </button>
      </div>
    </div>
  )
}
