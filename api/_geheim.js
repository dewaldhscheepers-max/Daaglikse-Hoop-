/* ────────────────────────────────────────────────────────────
   Een plek waar 'n geheim vergelyk word.

   Hierdie projek het 'n geheim gehad — `DaaglikseHoop2025Cron` — wat in die
   openbare JavaScript-bondel beland het, en daarna in `vercel.json`, en
   daarna as 'n TERUGVAL in twee lêers wat aflaaiskakels teken, en daarna as
   'n gewone string in 'n derde. Elke keer het dit soos 'n slot gelyk.

   Die les is nie "gebruik 'n beter string" nie. Dit is dat 'n geheim wat op
   MEER as een plek geskryf word, op een van daardie plekke gaan agterbly
   wanneer dit verander. Daarom staan die vergelyking nou hier, een keer.

   ── Waarom timingSafeEqual ──

   `a === b` hou op sodra twee karakters verskil. Wie die antwoord baie keer
   meet, kan die geheim karakter vir karakter uitwerk. Dit is 'n stadige en
   raserige aanval en dit is onwaarskynlik dat iemand dit hier sou doen — maar
   die regte vergelyking kos een reël, en dan hoef 'n mens nooit weer daaroor
   te dink nie.

   Buffers van verskillende lengtes laat `timingSafeEqual` GOOI, dus toets ons
   die lengte eers. Dit lek die lengte, en dit is die een ding wat nie saak
   maak nie.
   ──────────────────────────────────────────────────────────── */

const crypto = require('crypto')

function selfde(a, b) {
  const x = Buffer.from(String(a || ''))
  const y = Buffer.from(String(b || ''))
  if (!x.length || x.length !== y.length) return false
  return crypto.timingSafeEqual(x, y)
}

/* ── Mag hierdie versoek 'n admin-ding doen? ──

   Twee paaie in, en albei se waarde bestaan NET as 'n omgewingsveranderlike
   op Vercel:

     die MENS  → SORG_ADMIN_GEHEIM in 'n `x-sorg-geheim`-kopstuk
     die CRON  → CRON_SECRET, wat Vercel self as `Authorization: Bearer …`
                 stuur; `?secret=` word ook nog aanvaar vir wat van buite roep

   Die admin-wagwoord moet minstens twaalf karakters wees. Nie omdat twaalf
   veilig is nie, maar omdat 'n LEË veranderlike andersins met 'n leë kopstuk
   sou pas en die slot heeltemal sou oopstaan. */
function wieMag(req) {
  const cron  = process.env.CRON_SECRET || ''
  const admin = process.env.SORG_ADMIN_GEHEIM || ''

  const draer = (req.headers && req.headers['authorization']) || ''
  const gegee = (req.query && req.query.secret) || (req.body && req.body.secret) || ''
  const kop   = (req.headers && req.headers['x-sorg-geheim']) || ''

  /* Die MENS eerste. Dit maak saak: die oggendkennisgewing word deur 'n
     dag-slot beperk tot een per dag, en 'n mens wat die knoppie druk mag
     nooit stilweg deur daardie slot gekeer word nie. */
  if (admin.length >= 12 && selfde(kop, admin)) return 'admin'
  if (!!cron && (selfde(draer, `Bearer ${cron}`) || selfde(gegee, cron))) return 'cron'
  return null
}

function magAdminDing(req) {
  return wieMag(req) !== null
}

/* ── Die sleutel waarmee aflaaiskakels geteken word ──

   Dit was `process.env.CRON_SECRET || 'DaaglikseHoop2025Cron'`. Daardie
   terugval is die hele probleem: die string was openbaar, dus kon enigiemand
   wat hom gelees het self 'n geldige teken vir enige boek uitreken en 'n
   betaalde boek gratis aflaai. En 'n terugval bly stil staan — niks breek
   nie, niks waarsku nie, dit werk net vir die verkeerde mense ook.

   Nou is daar geen terugval nie. Is die veranderlike leeg, gooi dit, en die
   aflaai gee 'n fout wat 'n mens KAN sien. Stukkend is beter as oop. */
function tekenSleutel() {
  const sleutel = process.env.CRON_SECRET || ''
  if (sleutel.length < 12) {
    throw new Error('CRON_SECRET ontbreek — aflaaiskakels kan nie geteken word nie')
  }
  return sleutel
}

/* ── Die kode wat 'n beskermde NAAM oopsluit ──
 *
 * Dewald: "As ek Dewald Scheepers intik moet dit vra vir kode... en gee haar
 * verified merk ook."
 *
 * Die vergelyking staan HIER, saam met die res, en om dieselfde rede: 'n
 * geheim wat op sewe plekke vergelyk word, is een wat op ses plekke agterbly
 * wanneer dit verander.
 *
 * Die waarde bestaan NET as 'n omgewingsveranderlike (`SORG_NAAM_KODE`). Daar
 * is geen terugval in hierdie lêer nie, en dit is met opset: hierdie projek
 * het presies daardie fout vyf keer gemaak, en 'n terugval-string is 'n
 * geheim wat vir altyd in die geskiedenis staan. Sonder die veranderlike werk
 * die kode eenvoudig nie, en dan kan niemand daardie name vat nie — die
 * veilige kant.
 */
function magNaamVat(kode) {
  const verwag = process.env.SORG_NAAM_KODE
  if (!verwag) return false
  return selfde(String(kode || '').trim(), verwag)
}

module.exports = { selfde, wieMag, magAdminDing, tekenSleutel, magNaamVat }
