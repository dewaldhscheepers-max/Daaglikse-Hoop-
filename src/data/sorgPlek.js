/* ────────────────────────────────────────────────────────────
   Hoeveel plek daar vandag is.

   Bo-aan die Sorg-blad staan 'n reel wat lyk soos 'n klein ding en 'n groot
   ding doen:

     Vandag maak ek plek vir 20 mense wat pastorale begeleiding nodig het
     8 van 20 reeds ingestuur

   Dit is 'n BELOFTE, nie 'n meter nie. Dit sê drie goed tegelyk vir iemand
   wat oorweeg om te skryf: daar gaan werklik na jou boodskap gekyk word,
   daar is 'n MENS aan die ander kant met 'n grens, en die plek is nie
   oneindig nie.

   Die getal kom uit dieselfde plek as die plafon in die admin — dieselfde
   teller wat 'n indiening laat deurgaan of keer. Daar is nie 'n tweede som
   op die skerm nie; dan sou die twee kon uitmekaar loop en die blad sou 'n
   plek belowe wat die vorm dan weier.

   Die kas is kort en die skerm vra dit doelbewus weer op drie oomblikke:
   elke vyftien sekondes, wanneer 'n mens na die app toe terugkeer, en
   DADELIK wanneer die vorm toemaak.

   Daardie laaste een is die belangrikste. Sonder dit het die reel "8 van
   20" gewys terwyl daar reeds twintig was, en dan skryf iemand 'n hele
   boodskap vol wat dan geweier word. Die bediener het altyd reg gekeer —
   dit was die SKERM wat gelieg het, en dit is die soort ding wat 'n mens
   laat ophou probeer.
   ──────────────────────────────────────────────────────────── */

const PAD = '/api/sorg-instellings'
const VARS_MS = 60 * 1000

let belofte = null
let gehaalOp = 0

export function haalPlek() {
  if (!belofte || Date.now() - gehaalOp > VARS_MS) {
    gehaalOp = Date.now()
    belofte = fetch(PAD, { headers: { accept: 'application/json' }, cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(d => (d && Number.isFinite(Number(d.plafon)) ? d : null))
      /* 'n Mislukking word NIE onthou nie — die foon was dalk net 'n oomblik
         aflyn. En dan wys ons eenvoudig niks: 'n blad sonder die reel is
         reg, 'n blad met 'n verkeerde getal is nie. */
      .catch(() => { belofte = null; return null })
  }
  return belofte
}

export function vergeetPlek() { belofte = null; gehaalOp = 0 }
