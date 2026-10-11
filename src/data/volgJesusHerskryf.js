/* ────────────────────────────────────────────────────────────
   VOLG JESUS — wat gebeur met vordering wanneer 'n week HERSKRYF word

   Dewald het Week 8 op 11 Oktober 2026 heeltemal oorgeskryf, en dieselfde
   middag die program oopgemaak: *"Hoekom wys dit gedoen... ek het nog niks
   gedoen nie."* Die skerm het "4 van 5 dae gedoen" gesê, met vier groen
   regmerkies by dae wat hy nog nooit gesien het nie.

   Hy het wel iets gedoen: Dag 1 tot 4 van die OU Week 8. Daardie merkies leef
   in `vj_klaar_w8` op die foon, en hulle weet net van 'n DAGNOMMER, nie van
   die inhoud wat op daardie dag gestaan het nie. Wie ook al die ou week begin
   het, sien dus 'n nuwe week wat reeds half "klaar" is — en die dae wat hy nou
   die nodigste het, staan as gedoen.

   ── DIE BESLUIT ──

   Een keer per foon per herskrywing (`vj_herskryf_w<n>` dra die merk):

     · het hy die NUWE weergawe reeds begin — daar is 'n antwoord op een van
       sy NUWE vrae — word niks aangeraak nie. Sy vordering is egte vordering;
     · anders gaan die dag-merkies en die plek weg (`vj_klaar_w<n>`,
       `vj_plek_w<n>`), en staan `vj_my_week` verby hierdie week, skuif dit
       terug. Dit is presies wat "Gaan terug na Week N" in VolgJesusLewe doen.

   Sy geskrewe antwoorde bly staan. Hulle hang aan die OU vrae se id's, wat
   die nuwe week nie meer vra nie, dus wys niks hulle onder 'n verkeerde vraag
   nie — en om iemand se woorde uit te vee, is nie hierdie kode se besluit nie.

   Die prys is bekend: die nuwe Week 8 se Dag 1 het geen skryfkassie nie. Wie
   vandag NET die nuwe Dag 1 gedoen het, kan nie van die ou week onderskei word
   nie en begin Dag 1 weer — een druk. Dit is beter as vier vals regmerkies.

   Moenie die merk verander nadat dit uit is nie: elke foon wat dit reeds
   gesien het, sou weer skoongemaak word — ook dié wat intussen die nuwe week
   gedoen het. 'n NUWE herskrywing kry 'n NUWE merk.
   ──────────────────────────────────────────────────────────── */

/* LEEG, en dit is met opset. Week 8 se herskrywing van 11 Oktober is
   dieselfde middag teruggedraai — Dewald het besluit die weergawe van 29
   September bly Week 8. Daardie ou merkies is toe weer EGTE vordering, en 'n
   inskrywing hier sou hulle op elke foon wat oopmaak, uitgevee het.

   Herskryf Dewald weer 'n week en die inhoud VERVANG die oue, kom daardie week
   hier in, met sy nuwe vraag-id's en 'n merk wat nog nooit gebruik is nie
   (nie '2026-10-11' nie — sekere fone dra dit reeds vir Week 8):

     8: { merk: '2026-11-02', nuweIds: ['...'] },  */
export const HERSKRYF = {}

const merkSleutel = w => `vj_herskryf_w${w}`

/* Suiwer. Wat moet met een week gebeur?
 *
 *   gesien      — wat in `vj_herskryf_w<n>` staan (of null)
 *   antwoordIds — die id's waarvoor daar 'n antwoord op die foon is
 *   myWeek      — `vj_my_week` as getal (of null)
 *
 * Gee { vee, myWeek, merk }: `vee` sê of die merkies en die plek weg moet,
 * `myWeek` is die nuwe waarde (of null = los dit), `merk` moet geskryf word
 * (of null = niks om te skryf nie). */
export function herskryfBesluit(week, { gesien = null, antwoordIds = [], myWeek = null } = {}, tabel = HERSKRYF) {
  const h = tabel[week]
  if (!h) return { vee: false, myWeek: null, merk: null }
  if (gesien === h.merk) return { vee: false, myWeek: null, merk: null }

  const nuut = antwoordIds.some(id => h.nuweIds.includes(id))
  if (nuut) return { vee: false, myWeek: null, merk: h.merk }

  const terug = Number.isFinite(myWeek) && myWeek > week ? week : null
  return { vee: true, myWeek: terug, merk: h.merk }
}

/* Die onsuiwer helfte. Loop een keer, voor die app teken (main.jsx), sodat
   geen skerm ooit die ou merkies lees nie. Misluk die berging, gebeur niks —
   die ergste is dat die ou merkies bly staan, soos tot nou toe. */
export function herstelHerskryfdeWeke(berging, tabel = HERSKRYF) {
  try {
    if (!berging) return
    for (const w of Object.keys(tabel).map(Number)) {
      const voor = `vj_a_w${w}_`
      const antwoordIds = []
      for (let i = 0; i < berging.length; i++) {
        const k = berging.key(i)
        if (k && k.startsWith(voor) && berging.getItem(k)) antwoordIds.push(k.slice(voor.length))
      }
      const myRou = parseInt(berging.getItem('vj_my_week'), 10)
      const b = herskryfBesluit(w, {
        gesien: berging.getItem(merkSleutel(w)),
        antwoordIds,
        myWeek: Number.isFinite(myRou) ? myRou : null,
      }, tabel)
      if (b.vee) {
        berging.removeItem(`vj_klaar_w${w}`)
        berging.removeItem(`vj_plek_w${w}`)
      }
      if (b.myWeek !== null) berging.setItem('vj_my_week', String(b.myWeek))
      if (b.merk) berging.setItem(merkSleutel(w), b.merk)
    }
  } catch {}
}
