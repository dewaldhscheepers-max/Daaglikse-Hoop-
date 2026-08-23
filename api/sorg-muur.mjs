/* ────────────────────────────────────────────────────────────
   Die muur — wat almal sien.

     GET  /api/sorg-muur                → die goedgekeurde plasings
     POST /api/sorg-muur { muurId }     → "ek dra dit saam met jou"

   Dit lees uit `sorg_muur`, wat NET dra wat 'n mens gelees, geredigeer en
   goedgekeur het. Die rou boodskappe le in 'n ander versameling waarby
   hierdie lêer nie eens kom nie.

   ── Die reaksie ──

   Daar is EEN, en dit is nie 'n punt nie. "37 mense dra dit vandag saam met
   jou" is geselskap; 'n telling wat plasings teen mekaar rangskik, maak van
   iemand se pyn 'n wedstryd. Daarom:

   · net een soort reaksie, en dit is 'n saamdra en nie 'n "hou van" nie;
   · geen rangskikking volgens die telling nie — die muur is altyd nuutste
     eerste;
   · geen kommentaar nie. Geen vreemdeling se raad onder 'n vrou se
     beskrywing van haar huwelik nie.

   Een toestel tel een keer per plasing. Dit loop deur klein dokumente in
   `sorg_saam` — een per toestel per plasing — sodat die telling nie 'n lys
   op die plasing self hoef te dra nie.
   ──────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { lysDokke, leesDok, skryfDok } from './_sorgFirestore.mjs'
import { saamTelReaksies } from '../src/data/sorgSaamstaan.js'
import { keurRede, naRapport } from '../src/data/sorgModereer.js'

const MUUR = 'sorg_muur'
const SAAM = 'sorg_saam'
const WOORDE = 'sorg_woorde'
const INKOMEND = 'sorg_inkomend'

function hasToestel(t) {
  const s = String(t || '').trim()
  if (!s) return ''
  const sout = process.env.SORG_SOUT || 'daaglikse-hoop-sorg'
  return crypto.createHash('sha256').update(sout + ':' + s).digest('hex').slice(0, 24)
}

/* ── Die SAAI-lopie is weg ──
 *
 * Dewald, 23 Augustus 2026: "Verwyder die automatiese reaksies en comments."
 *
 * Hier het drie reaksies en drie opmerkings vanself op elke nuwe plasing
 * verskyn — een van Daaglikse Hoop en twee "anoniem" — sodat 'n jong muur nie
 * leeg lyk nie. Die bedoeling was goed en die gevolg was 'n leuen: 'n mens wat
 * geskryf het, het gedink drie mense het geantwoord, en niemand het.
 *
 * Op 'n blad waar dit oor eerlikheid gaan, is 'n uitgedinkte opmerking die
 * duurste ding wat daar kan staan.
 *
 * Wat REEDS gesaai is, bly in Firestore staan. Dit word hier uitgefilter — 'n
 * uitvee-lopie oor die lewende data hoort in die admin, met 'n mens se hand
 * daarop, nie in 'n leesversoek nie. Sien `saaiWeg()` hieronder.
 */

/* 'n Gesaaide opmerking het 'n vaste id: `saai_<muurId>_<n>`. Dit is hoe ons
   hulle nou uitken sonder om 'n veld by te sit wat op ou dokumente ontbreek. */
function isGesaai(w) {
  return String((w && w.id) || '').startsWith('saai_') ||
         String((w && w.toestel) || '').startsWith('saai:')
}

/* Nuutste eerste, tot op die sekonde. *//* Nuutste eerste, tot op die sekonde. */
function volgorde(a, b) {
  const t = x => String(x.geskep || x.datum || '') + '|' + String(x.id || '')
  return t(b).localeCompare(t(a))
}

/* Wat na die kliënt gaan. Nooit die bronId nie — dit wys na die rou
   boodskap, en niemand buite die admin het daarmee te doen nie. */
/* Die somtelling woon in `src/data/sorgSaamstaan.js`, saam met die druk-pad
   s'n. Hier het 'n eie kopie gestaan, en die druk-pad het glad nie saamgetel
   nie — 'n mens sien 3, druk een keer, en die getal spring na 1. Een funksie,
   een antwoord. */
const saamTel = saamTelReaksies

function virDieSkerm(m, woorde) {
  const myne = (woorde || []).filter(w => w.muurId === m.id)
  return {
    id: m.id,
    titel: m.titel || '',
    teks: m.teks,
    /* ── Wie by hierdie storie verskyn ──
     *
     * `anoniem` wen altyd, en dit is die verstek: 'n ou plasing het nie eens
     * die veld nie en bly presies soos hy was. Die naam en die foto gaan net
     * oor die draad wanneer die mens dit self gekies het — dit is nie "die
     * skerm wys dit nie", die velde is eenvoudig leeg. */
    naam: m.anoniem === false ? String(m.naam || '') : '',
    foto: m.anoniem === false ? String(m.foto || '') : '',
    onderwerp: m.onderwerp || 'ander',
    datum: m.datum || '',
    antwoord: m.antwoord || null,
    saam: Number(m.saam) || 0,
    /* Wat mense gedruk het, PLUS die eerstes. Hulle le apart sodat die
       saai-lopie nooit iemand se regte druk kan oorskryf nie. */
    /* Net WERKLIKE drukke. Die tweede argument was die drie gesaaide
       reaksies; hulle is weg. */
    reaksies: saamTel(m.reaksies, null),
    /* Die skerm moet dit weet om die skryfblok weg te laat. Dit is 'n
       vlaggie, nie inligting oor die mens nie — dit se net dat hierdie
       storie te swaar is vir 'n vreemdeling se raad. */
    sensitief: m.sensitief === true,
    /* Hoeveel mense dit gerapporteer het. Die MUUR wys dit nooit — dit is vir
       die admin. Sien die rapporteer-aksie hieronder. */
    rapporte: Number(m.rapporte) || 0,
    /* Die eerste twee woorde, en hoeveel daar in totaal is. */
    /* AL die opmerkings, nie net die eerste paar nie.

       Die kaart wys twee; die blad wat oopgaan wanneer 'n mens die
       spraakborrel druk, wys almal. Sou ons net drie stuur, moes daardie
       blad 'n tweede oproep doen net om oop te gaan — en dan kyk 'n mens na
       'n leë blad terwyl dit laai. Hulle is hoogstens tweehonderd
       karakters elk; vyftig van hulle is kleiner as een foto. */
    woorde: myne.slice(0, 50).map(w => ({
      id: w.id,
      teks: w.teks,
      /* `wanneer` is die DAG ("2026-08-23") en dit bly, want die ou woorde in
         Firestore het niks anders nie.

         `geskepOp` is die egte tydstempel, en dit is wat die skerm laat "3 u"
         skryf in plaas van "23 Augustus". Dewald het ons opmerkings langs
         Facebook s'n gesit: 'n absolute datum op 'n vars opmerking laat 'n
         mens som, en dan lyk 'n lewendige gesprek dood. Kom dit nie deur nie
         — 'n ou woord — val die skerm terug op die dag. Sien
         `src/data/sorgTyd.js`. */
      geskepOp: typeof w.geskep === 'string' ? w.geskep : '',
      wanneer: w.dag || '',
      /* Hoeveel mense hierdie opmerking bemoedig het. Facebook wys 'n telling
         op ELKE opmerking, en dit is nie versiering nie: dit is hoe 'n mens
         wat iets moois geskryf het, sien dat dit gehelp het. */
      bemoedig: Number(w.bemoedig) || 0,
      /* ── Wie praat ──
       *
       * Tot nou het NET Daaglikse Hoop 'n naam gedra en alles anders was
       * "Anoniem". Dewald het dit omgedraai: 'n mens kies self, en die
       * keuse geld per opmerking.
       *
       * Dit is 'n WITLYS: net hierdie drie velde gaan oor die draad, uit die
       * dokument gelees. Voeg iemand more 'n veld by, kom dit eers uit
       * wanneer dit HIER bygesit word — dieselfde reël as VOLG JESUS se
       * openbare eindpunt, en om dieselfde rede.
       *
       * `anoniem` wen altyd. 'n Ou opmerking het nie eens die veld nie, en
       * dan bly hy presies soos hy was. */
      naam: w.bron === 'hoop' ? (w.naam || 'Daaglikse Hoop')
        : (w.anoniem === false ? String(w.skrywerNaam || '') : ''),
      foto: w.bron === 'hoop' ? '' : (w.anoniem === false ? String(w.skrywerFoto || '') : ''),
      hoop: w.bron === 'hoop',
      /* Die verifikasie-merk. Dit kom uit die ROL wat die bediener gestel het
         toe die opmerking geskryf is — nooit uit die naam nie, en nooit uit
         die versoek nie. Sien `keurSkrywer()` in api/sorg-saamstaan.mjs. */
      geverifieer: w.rol === 'dewald' || w.rol === 'bediening' || w.bron === 'hoop',
    })),
    woordeTotaal: myne.length,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      /* ── Waarom die muur nou by die RAND gekas word ──
       *
       * Dewald: "die post load kak lank as ek op die bladsy kliek."
       *
       * Elke oopmaak het TWEE lyste van 300 dokumente uit Firestore gelees en
       * boonop 'n skryf-lopie (`saai`) gedoen — in 'n LEESversoek. Vir die
       * mens is dit 'n leë blad met "Besig om te laai…" terwyl dit gebeur.
       *
       * Tien sekondes by die rand maak die tweede mens se oopmaak
       * onmiddellik, en `stale-while-revalidate` beteken die derde een kry
       * die ou antwoord DADELIK terwyl 'n vars een agter die skerms haal.
       *
       * Tien, nie sestig nie: die skerm vra in elk geval elke vyftien
       * sekondes weer, en 'n muur wat 'n minuut agter is, voel dood. */
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=60')
      const alles = await lysDokke(MUUR, { grootte: 300 })

      /* Net wat WYS. Wat vir Dewald se oog wag, en wat hy weggesteek het,
         kom nooit hier uit nie. Oudste eerste binne 'n plasing — 'n gesprek
         lees van bo af, nie andersom nie. */
      const woorde = (await lysDokke(WOORDE, { grootte: 300 }))
        /* Wat vroeer gesaai is, wys nie meer nie. Sien hierbo. */
        .filter(w => !isGesaai(w))
        .filter(w => w.status === 'wys' && w.teks)
        /* Oudste eerste — 'n gesprek lees van bo af. Die `rang`-sortering
           hierbo het die gesaaide woorde boontoe gehou; hulle bestaan nie
           meer nie, maar die reël bly onskadelik vir ou dokumente. */
        .sort((a, b) => {
          const s = (b.rang !== undefined ? 1 : 0) - (a.rang !== undefined ? 1 : 0)
          if (s) return s
          if (a.rang !== undefined && b.rang !== undefined) return a.rang - b.rang
          return String(a.id).localeCompare(String(b.id))
        })

      const lys = alles
        .filter(m => m.gepubliseer !== false && m.teks)
        /* Nuutste eerste. GEEN rangskikking volgens die telling nie.

           Dit het op `datum` gesorteer, en `datum` is net 'n DAG. Alles wat
           op dieselfde dag geplaas is, was dus gelyk, en dan het Firestore se
           eie volgorde beslis — wat volgens die dokument se naam is, en ons
           name begin met die tyd. Die gevolg: die dag se plasings het van
           OUDSTE na nuutste gele, presies andersom as wat dit moet.

           `geskep` is 'n regte tydstempel in ISO-vorm, en ISO-teks sorteer
           korrek as teks. Ontbreek dit op 'n ou plasing, val ons terug op die
           dag en dan op die id (wat ook met die tyd begin). */
        .sort(volgorde)
        .map(m => virDieSkerm(m, woorde))

      /* GEEN kas nie.

         Dit was `public, max-age=30, s-maxage=120`. Dit het gelyk soos 'n
         goedkoop wins — die muur verander mos nie elke sekonde nie. Maar die
         TELLING verander wel: Dewald het "Ek dra dit saam met jou" gedruk, sy
         vrou ook, en toe hulle terugkom was die telling nog nul. Vercel se
         rand het twee minute lank 'n ou kopie bedien.

         'n Telling wat lieg, is erger as geen telling nie: die hele punt van
         daardie knoppie is om iemand te wys dat ander mense sy ding saamdra.
         Die muur is klein; hom elke keer vars haal kos niks. */
      /* ── Die gemeenskapstrook ──

         Dit tel wat AL OOIT gedra is, nie wat vandag gedra is nie. 'n Blad
         wat "3 mense het vandag saamgebid" sê, laat die plek eensamer lyk
         as stilte, en op 'n jong muur is dit wat 'n dagtelling gaan sê. 'n
         Lopende totaal groei net, en dit is ewe waar.

         Dit kos ook niks ekstra nie: die getalle sit reeds in wat ons pas
         gelees het. */
      const saamTotaal = lys.reduce((n, m) => {
        const r = m.reaksies || {}
        return n + Object.values(r).reduce((a, b) => a + (Number(b) || 0), 0) + (Number(m.saam) || 0)
      }, 0)
      const woordeTotaal = lys.reduce((n, m) => n + (Number(m.woordeTotaal) || 0), 0)

      return res.status(200).json({
        plasings: lys,
        saamtel: { saam: saamTotaal, woorde: woordeTotaal, stories: lys.length },
      })
    } catch (e) {
      /* 'n Stukkende muur mag nie die blad doodmaak nie. */
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ plasings: [], fout: String(e && e.message) })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })
  res.setHeader('Cache-Control', 'no-store')

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data nie' })

  /* ── Watter van hierdie plasings is MYNE? ──

     Die mens wat geskryf het, het nooit gesien dat mense haar dra nie. Sy
     plaas, sy verdwyn, en daar is geen pad terug nie — die private kode is
     doelbewus van die skerm af weg, want niemand wil 'n kode onthou nie.

     Die kode BESTAAN egter nog, want Dewald het hom nodig. Die foon hou hom
     stil, en hier ruil ons hom om vir die muur-id. Dit lek niks: 'n mens
     moet die kode besit, en net wie geskryf het, het hom.

     Ons stuur NIE die inkomende id terug nie — net die muur-id, wat in elk
     geval al openbaar is. */
  if (Array.isArray(lyf.kodes)) {
    try {
      const kodes = new Set(lyf.kodes.map(k => String(k || '').slice(0, 60)).filter(Boolean).slice(0, 40))
      if (!kodes.size) return res.status(200).json({ myne: [] })
      const inkomend = await lysDokke(INKOMEND, { grootte: 300 })
      const myne = inkomend
        .filter(b => kodes.has(b.kode) && b.muurId)
        .map(b => b.muurId)
      return res.status(200).json({ myne })
    } catch (e) {
      return res.status(200).json({ myne: [], fout: String(e && e.message) })
    }
  }

  const muurId = String(lyf.muurId || '').slice(0, 40)
  if (!/^[a-zA-Z0-9]+$/.test(muurId)) return res.status(400).json({ fout: 'geen plasing nie' })

  const toestel = hasToestel(lyf.toestel)
  if (!toestel) return res.status(200).json({ ok: true, reeds: true })

  /* ── Rapporteer ────────────────────────────────────────────────────────
   *
   * Plasings gaan nou DADELIK op die muur (sien api/sorg-stuur.mjs). Dewald:
   * "ek wil nie alles heeltyd na gaan nie... mense moet kan report."
   *
   * Dit is dieselfde ruil as die VOLG JESUS-groepchat: niks wag vooraf nie,
   * en die gemeenskap wys wat moet gaan.
   *
   * EEN rapport per toestel per plasing, met dieselfde merkie-truuk as
   * saamstaan — anders kan een mens 'n storie van die muur af stem.
   *
   * Die plasing verdwyn NIE vanself nie. Sy telling gaan op, en die admin
   * wys hom bo. 'n Outomatiese verwydering is 'n knoppie waarmee enigiemand
   * iemand anders se seer kan uitvee. */
  if (lyf.aksie === 'rapporteer') {
    try {
      const plasing = await leesDok(MUUR, muurId)
      if (!plasing || plasing.gepubliseer === false) {
        /* Dit is al weg. Dit is 'n goeie uitkoms, nie 'n fout nie. */
        return res.status(200).json({ ok: true })
      }
      const merkId = `r_${muurId}_${toestel}`
      const reeds = await leesDok(SAAM, merkId)
      if (reeds) return res.status(200).json({ ok: true, reeds: true })

      await skryfDok(SAAM, merkId, {
        muurId, toestel, soort: 'rapport',
        rede: keurRede(lyf.rede),
        dag: new Date().toISOString().slice(0, 10),
      })
      const rapporte = (Number(plasing.rapporte) || 0) + 1
      const redes = [...new Set([...(Array.isArray(plasing.redes) ? plasing.redes : []),
                                 keurRede(lyf.rede)].filter(Boolean))]
      const uit = naRapport({ rapporte, redes, outoOnveilig: plasing.outoOnveilig === true })
      await skryfDok(MUUR, muurId, {
        rapporte,
        redes,
        dringend: uit.dringend,
        /* Dit BLY op die muur tot by die drempel. Een mens se druk is 'n
           mening; drie verskillende toestelle is 'n patroon. Sien
           src/data/sorgModereer.js. */
        gepubliseer: uit.wys,
        modRede: uit.rede,
      }, { velde: ['rapporte', 'redes', 'dringend', 'gepubliseer', 'modRede'] })
      return res.status(200).json({ ok: true, weg: !uit.wys, rapporte })
    } catch (e) {
      return res.status(500).json({ fout: String(e && e.message) })
    }
  }

  try {
    const plasing = await leesDok(MUUR, muurId)
    if (!plasing || plasing.gepubliseer === false) {
      return res.status(404).json({ fout: 'daardie plasing bestaan nie' })
    }

    const merkId = `${muurId}_${toestel}`
    const reeds = await leesDok(SAAM, merkId)
    if (reeds) return res.status(200).json({ ok: true, reeds: true, saam: Number(plasing.saam) || 0 })

    await skryfDok(SAAM, merkId, { muurId, toestel, dag: new Date().toISOString().slice(0, 10) })
    const saam = (Number(plasing.saam) || 0) + 1
    await skryfDok(MUUR, muurId, { saam }, { velde: ['saam'] })

    return res.status(200).json({ ok: true, saam })
  } catch (e) {
    return res.status(500).json({ fout: String(e && e.message) })
  }
}
