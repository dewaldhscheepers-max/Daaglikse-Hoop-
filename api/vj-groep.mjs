/* ── VOLG JESUS · groepe: alles wat 'n kliënt NIE mag doen nie ──
 *
 *   POST { doen: 'skep',     naam, gemeente, vertoonnaam }
 *   POST { doen: 'kyk',      kode }                       → 'n voorskou
 *   POST { doen: 'sluitaan', kode, vertoonnaam }
 *   POST { doen: 'chat', groepId, uid, aan }   → uit/terug in die groepchat
 *   POST { doen: 'verlaat',  groepId }
 *   POST { doen: 'verwyder', groepId, uid }
 *   POST { doen: 'rol',      groepId, uid, rol }
 *   POST { doen: 'kode',     groepId, aan }               → roteer of sluit af
 *   POST { doen: 'myne' }                                 → my groepe
 *
 * Elke oproep dra 'n Firebase ID-token in `Authorization: Bearer …`. Die uid
 * kom uit daardie token en NOOIT uit die liggaam nie — sien `_vjToken.js` en
 * Dewald se §15.
 *
 * ── Waarom die kliënt nie self kan aansluit nie ──
 *
 * Om by 'n kode uit te kom, moet 'n mens groepe kan SOEK. 'n Kliënt wat dit
 * kan doen, kan die hele kode-ruimte deurloop en elke groep in die app se naam,
 * gemeente en ledetal opsom. Die soektog staan dus hier, agter 'n telling wat
 * raai duur maak (§51).
 *
 * Lidmaatskap word ook net hier geskryf. Sonder dit kon iemand homself 'n
 * fasiliteerder maak deur een dokument te skryf.
 */
import crypto from 'node:crypto'
import token from './_vjToken.js'
import {
  keurGroepkode, maakGroepkode, keurGroepnaam, keurGemeente, keurVertoonnaam,
  magVerlaat,
} from '../src/data/volgJesusGroep.js'

const { wieIsDit } = token

const PROJEK = process.env.FIREBASE_PROJECT_ID || 'daaglikse-hoop'
const WORTEL = `https://firestore.googleapis.com/v1/projects/${PROJEK}/databases/(default)/documents`

/* ── Firestore met die diensrekening ── */
async function kryToken() {
  const nou = Math.floor(Date.now() / 1000)
  const kop = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const eis = Buffer.from(JSON.stringify({
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: nou, exp: nou + 3600,
  })).toString('base64url')
  const sleutel = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const teken = crypto.createSign('RSA-SHA256')
  teken.update(`${kop}.${eis}`)
  const jwt = `${kop}.${eis}.${teken.sign(sleutel, 'base64url')}`
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt,
    }),
  })
  if (!r.ok) throw new Error(`oauth ${r.status}`)
  const j = await r.json()
  if (!j.access_token) throw new Error('geen teken')
  return j.access_token
}

/* ── Firestore se waarde-vorm, in en uit ── */
const inW = v => {
  if (v === null || v === undefined) return { nullValue: null }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (v instanceof Date) return { timestampValue: v.toISOString() }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(inW) } }
  if (typeof v === 'object') return { mapValue: { fields: velde(v) } }
  return { stringValue: String(v) }
}
const velde = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, inW(v)]))

const uitW = v => {
  if (!v || typeof v !== 'object') return null
  if ('stringValue' in v) return v.stringValue
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('timestampValue' in v) return v.timestampValue
  if ('nullValue' in v) return null
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(uitW)
  if ('mapValue' in v) return uitDok({ fields: v.mapValue.fields })
  return null
}
const uitDok = d => Object.fromEntries(Object.entries((d && d.fields) || {}).map(([k, v]) => [k, uitW(v)]))

/* ── Klein Firestore-helpers ── */
function maakFs(bearer) {
  const kop = { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' }

  return {
    async lees(pad) {
      const r = await fetch(`${WORTEL}/${pad}`, { headers: kop })
      if (r.status === 404) return null
      if (!r.ok) throw new Error(`firestore lees ${r.status}`)
      const j = await r.json()
      return { id: String(j.name || '').split('/').pop(), ...uitDok(j) }
    },
    /* Skep MET 'n naam. Bestaan die naam, gee Firestore 'n 409 — 'n atomiese
       eis, nie 'n lees-dan-skryf nie. Dieselfde patroon as die dagslot in
       api/_dagslot.js. */
    async skepMetNaam(versameling, naam, data) {
      const r = await fetch(`${WORTEL}/${versameling}?documentId=${encodeURIComponent(naam)}`, {
        method: 'POST', headers: kop, body: JSON.stringify({ fields: velde(data) }),
      })
      if (r.status === 409) return { botsing: true }
      if (!r.ok) throw new Error(`firestore skep ${r.status}`)
      return { botsing: false }
    },
    async stel(pad, data, saamvoeg = true) {
      const maskers = saamvoeg
        ? Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
        : ''
      const r = await fetch(`${WORTEL}/${pad}${maskers ? '?' + maskers : ''}`, {
        method: 'PATCH', headers: kop, body: JSON.stringify({ fields: velde(data) }),
      })
      if (!r.ok) throw new Error(`firestore stel ${r.status}`)
    },
    async lys(versameling, grootte = 100) {
      const r = await fetch(`${WORTEL}/${versameling}?pageSize=${grootte}`, { headers: kop })
      if (!r.ok) return []
      const j = await r.json()
      return (j.documents || []).map(d => ({ id: String(d.name || '').split('/').pop(), ...uitDok(d) }))
    },
    /* Soek 'n groep op sy kode. Dit is die EEN navraag wat 'n kliënt nooit mag
       doen nie. */
    async groepMetKode(kode) {
      const r = await fetch(`${WORTEL}:runQuery`, {
        method: 'POST', headers: kop,
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'vjGroepe' }],
            where: {
              compositeFilter: {
                op: 'AND',
                filters: [
                  { fieldFilter: { field: { fieldPath: 'kode' }, op: 'EQUAL', value: { stringValue: kode } } },
                  { fieldFilter: { field: { fieldPath: 'kodeAan' }, op: 'EQUAL', value: { booleanValue: true } } },
                ],
              },
            },
            limit: 1,
          },
        }),
      })
      if (!r.ok) throw new Error(`firestore soek ${r.status}`)
      const j = await r.json()
      const ry = (Array.isArray(j) ? j : []).find(x => x && x.document)
      if (!ry) return null
      return { id: String(ry.document.name).split('/').pop(), ...uitDok(ry.document) }
    },
  }
}

/* ── Raai duur maak ──
 *
 * §51: 'n groepkode mag nie deur brute krag gevind word nie. Die venster is
 * per UID, want 'n uid kos 'n Firebase-aanmelding en is dus nie gratis nie.
 * Ons vertel ook niks: 'n verkeerde kode en 'n te veel pogings lyk dieselfde
 * van buite af, behalwe vir die woorde. */
const POGINGS = 8
const VENSTER = 10 * 60 * 1000

async function magProbeer(fs, uid, nou) {
  const pad = `vjPogings/${uid}`
  const bestaande = await fs.lees(pad)
  const begin = bestaande && bestaande.begin ? Date.parse(bestaande.begin) : 0
  const binne = nou - begin < VENSTER
  const tel = binne ? Number(bestaande.tel || 0) : 0
  if (tel >= POGINGS) return false
  await fs.stel(pad, {
    tel: tel + 1,
    begin: binne ? new Date(begin) : new Date(nou),
  })
  return true
}

/* ── Die uitleg wat 'n mens mag sien ── */
const groepUit = (g, aantal, fasiliteerder) => ({
  id: g.id,
  naam: g.naam,
  gemeente: g.gemeente || '',
  kode: g.kode,
  kodeAan: g.kodeAan !== false,
  eienaar: g.eienaar,
  ledeMagNooi: g.ledeMagNooi !== false,
  aantalLede: aantal,
  fasiliteerder: fasiliteerder || '',
})

async function ledeVan(fs, groepId) {
  const lys = await fs.lys(`vjGroepe/${groepId}/lede`)
  return lys.filter(l => l.status === 'aktief')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ fout: 'net POST' })
  }

  const uid = await wieIsDit(req, PROJEK)
  if (!uid) return res.status(401).json({ fout: 'Meld eers aan.' })

  let lyf = req.body
  if (typeof lyf === 'string') { try { lyf = JSON.parse(lyf) } catch { lyf = null } }
  if (!lyf || typeof lyf !== 'object') return res.status(400).json({ fout: 'geen data' })

  let fs
  try { fs = maakFs(await kryToken()) }
  catch (e) {
    console.error('[vj-groep oauth]', e && e.message)
    return res.status(500).json({ fout: 'Kon nie by die databasis kom nie.' })
  }

  const nou = Date.now()
  const nouISO = new Date(nou).toISOString()

  try {
    switch (lyf.doen) {

      /* ── 'n Groep skep ───────────────────────────────────────────── */
      case 'skep': {
        const naam = keurGroepnaam(lyf.naam)
        if (!naam.ok) return res.status(400).json({ fout: naam.fout })
        const gemeente = keurGemeente(lyf.gemeente)
        if (!gemeente.ok) return res.status(400).json({ fout: gemeente.fout })
        const vnaam = keurVertoonnaam(lyf.vertoonnaam)
        if (!vnaam.ok) return res.status(400).json({ fout: vnaam.fout })

        /* 'n Kode wat nog nie bestaan nie. Ons probeer 'n paar keer; die kode
           dra 24 letters maal 10 000, dus is 'n botsing skaars. */
        let kode = ''
        for (let poging = 0; poging < 12 && !kode; poging++) {
          const kans = maakGroepkode(naam.waarde, [
            crypto.randomInt(1000) / 1000,
            crypto.randomInt(1000) / 1000,
            crypto.randomInt(10000) / 10000,
          ])
          if (!(await fs.groepMetKode(kans))) kode = kans
        }
        if (!kode) return res.status(503).json({ fout: 'Probeer asseblief weer.' })

        const groepId = crypto.randomUUID()
        await fs.stel(`vjGroepe/${groepId}`, {
          naam: naam.waarde,
          gemeente: gemeente.waarde,
          kode,
          kodeAan: true,
          eienaar: uid,
          ledeMagNooi: true,
          week: 1,
          geargiveer: null,
          geskep: nouISO,
        }, false)

        /* Die skepper is die eienaar EN 'n fasiliteerder (§18). */
        await fs.stel(`vjGroepe/${groepId}/lede/${uid}`, {
          naam: vnaam.waarde,
          rol: 'fasiliteerder',
          status: 'aktief',
          aangesluit: nouISO,
        }, false)

        await onthouLidmaatskap(fs, uid, groepId, nouISO)

        /* `myNaam` en `myRol` MOET saamkom.
         *
         * Sonder hulle stel die skerm `myLid.naam` op '' — en die eerste
         * boodskap wat hierdie mens stuur, dra geen naam nie en wys as
         * "Iemand". Dewald: "hoekom staan Nadia se naam nie daar nie. ek wil
         * weet wie iemand is."
         *
         * Dit is die bediener se werk, nie die skerm s'n: die kliënt weet wel
         * watter naam hy pas getik het, maar 'n naam wat net in 'n skerm se
         * geheue lewe, is weg by die volgende oopmaak. */
        return res.status(200).json({
          ok: true,
          groep: {
            ...groepUit({ id: groepId, naam: naam.waarde, gemeente: gemeente.waarde, kode, eienaar: uid }, 1, vnaam.waarde),
            myNaam: vnaam.waarde,
            myRol: 'fasiliteerder',
          },
        })
      }

      /* ── Kyk eers wat agter die kode is ──────────────────────────── */
      case 'kyk': {
        const kode = keurGroepkode(lyf.kode)
        if (!kode) return res.status(400).json({ fout: 'Daardie kode lyk nie reg nie.' })
        if (!(await magProbeer(fs, uid, nou))) {
          return res.status(429).json({ fout: 'Te veel pogings. Probeer oor tien minute weer.' })
        }
        const groep = await fs.groepMetKode(kode)
        if (!groep || groep.geargiveer) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })

        const lede = await ledeVan(fs, groep.id)
        const fasil = lede.find(l => l.rol === 'fasiliteerder')
        return res.status(200).json({
          ok: true,
          groep: groepUit(groep, lede.length, fasil ? fasil.naam : ''),
          isReedsLid: lede.some(l => l.id === uid),
        })
      }

      /* ── Sluit aan ───────────────────────────────────────────────── */
      case 'sluitaan': {
        const kode = keurGroepkode(lyf.kode)
        if (!kode) return res.status(400).json({ fout: 'Daardie kode lyk nie reg nie.' })
        const vnaam = keurVertoonnaam(lyf.vertoonnaam)
        if (!vnaam.ok) return res.status(400).json({ fout: vnaam.fout })
        if (!(await magProbeer(fs, uid, nou))) {
          return res.status(429).json({ fout: 'Te veel pogings. Probeer oor tien minute weer.' })
        }
        const groep = await fs.groepMetKode(kode)
        if (!groep || groep.geargiveer) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })

        /* Heraktiveer as hy voorheen weg is. §16: sy programvordering en sy
           private antwoorde bly — hulle is in elk geval op sy foon. */
        const bestaande = await fs.lees(`vjGroepe/${groep.id}/lede/${uid}`)
        if (bestaande && bestaande.status === 'verwyder') {
          return res.status(403).json({ fout: 'Jy is uit hierdie groep verwyder.' })
        }
        await fs.stel(`vjGroepe/${groep.id}/lede/${uid}`, {
          naam: vnaam.waarde,
          rol: (bestaande && bestaande.rol) || 'deelnemer',
          status: 'aktief',
          aangesluit: (bestaande && bestaande.aangesluit) || nouISO,
        }, false)

        await onthouLidmaatskap(fs, uid, groep.id, nouISO)

        const lede = await ledeVan(fs, groep.id)
        const fasil = lede.find(l => l.rol === 'fasiliteerder')
        /* Sien die nota by 'skep': sonder `myNaam` wys hierdie mens se eerste
           boodskap as "Iemand". */
        return res.status(200).json({
          ok: true,
          groep: {
            ...groepUit(groep, lede.length, fasil ? fasil.naam : ''),
            myNaam: vnaam.waarde,
            myRol: (bestaande && bestaande.rol) || 'deelnemer',
          },
        })
      }

      /* ── Verlaat ─────────────────────────────────────────────────── */
      case 'verlaat': {
        const groepId = String(lyf.groepId || '')
        const groep = await fs.lees(`vjGroepe/${groepId}`)
        if (!groep) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })
        const lede = await ledeVan(fs, groepId)
        if (!lede.some(l => l.id === uid)) return res.status(403).json({ fout: 'Jy is nie in hierdie groep nie.' })

        const besluit = magVerlaat(groep, uid, lede.length)
        if (!besluit.ok) return res.status(409).json({ fout: besluit.fout })

        await fs.stel(`vjGroepe/${groepId}/lede/${uid}`, { status: 'weg', wegOp: nouISO })
        if (besluit.argiveer) await fs.stel(`vjGroepe/${groepId}`, { geargiveer: nouISO, kodeAan: false })
        await vergeetLidmaatskap(fs, uid, groepId)
        return res.status(200).json({ ok: true })
      }

      /* ── Verwyder iemand ─────────────────────────────────────────── */
      case 'verwyder': {
        const groepId = String(lyf.groepId || '')
        const wie = String(lyf.uid || '')
        const groep = await fs.lees(`vjGroepe/${groepId}`)
        if (!groep) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })
        const ek = await fs.lees(`vjGroepe/${groepId}/lede/${uid}`)
        if (!ek || ek.status !== 'aktief' || ek.rol !== 'fasiliteerder') {
          return res.status(403).json({ fout: 'Net n fasiliteerder kan iemand verwyder.' })
        }
        if (wie === groep.eienaar) return res.status(409).json({ fout: 'Die eienaar kan nie verwyder word nie.' })
        if (wie === uid) return res.status(409).json({ fout: 'Gebruik eerder Verlaat die groep.' })

        await fs.stel(`vjGroepe/${groepId}/lede/${wie}`, {
          status: 'verwyder', verwyderOp: nouISO, verwyderDeur: uid,
        })
        await vergeetLidmaatskap(fs, wie, groepId)
        return res.status(200).json({ ok: true })
      }

      /* ── 'n Fasiliteerder aanstel of afhaal ──────────────────────── */
      case 'rol': {
        const groepId = String(lyf.groepId || '')
        const wie = String(lyf.uid || '')
        const rol = lyf.rol === 'fasiliteerder' ? 'fasiliteerder' : 'deelnemer'
        const groep = await fs.lees(`vjGroepe/${groepId}`)
        if (!groep) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })
        if (groep.eienaar !== uid) return res.status(403).json({ fout: 'Net die eienaar kan rolle verander.' })
        /* Die eienaar bly altyd 'n fasiliteerder (§46). */
        if (wie === groep.eienaar && rol !== 'fasiliteerder') {
          return res.status(409).json({ fout: 'Die eienaar bly n fasiliteerder.' })
        }
        await fs.stel(`vjGroepe/${groepId}/lede/${wie}`, { rol })
        return res.status(200).json({ ok: true })
      }

      /* ── Uit die groepchat, maar nie uit die groep nie ───────────
       *
       * Dewald: "if someone makes nonsense on the group chat the fasiliteerder
       * must be able to remove that person from the group's chat. They should
       * still do the program and go on like normal."
       *
       * Daarom raak dit NIE aan `status` nie. Die mens bly 'n lid, hou sy week,
       * sy antwoorde en sy plek in die program. Net `chatAf` verander, en die
       * reels in firestore.rules doen die res.
       *
       * Twee dinge mag nie: die EIENAAR kan nie stilgemaak word nie (dan kan
       * niemand die groep meer modereer nie), en 'n mens kan dit nie op homself
       * doen nie — daarvoor is daar "Verlaat die groep". */
      case 'chat': {
        const groepId = String(lyf.groepId || '')
        const wie = String(lyf.uid || '')
        const af = lyf.aan === false || lyf.af === true

        const groep = await fs.lees(`vjGroepe/${groepId}`)
        if (!groep) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })
        const ek = await fs.lees(`vjGroepe/${groepId}/lede/${uid}`)
        if (!ek || ek.status !== 'aktief' || ek.rol !== 'fasiliteerder') {
          return res.status(403).json({ fout: 'Net n fasiliteerder kan dit doen.' })
        }
        if (wie === groep.eienaar) {
          return res.status(409).json({ fout: 'Die eienaar kan nie uit die chat gehaal word nie.' })
        }
        if (wie === uid) return res.status(409).json({ fout: 'Jy kan dit nie op jouself doen nie.' })

        const lid = await fs.lees(`vjGroepe/${groepId}/lede/${wie}`)
        if (!lid || lid.status !== 'aktief') {
          return res.status(404).json({ fout: 'Daardie mens is nie in hierdie groep nie.' })
        }

        await fs.stel(`vjGroepe/${groepId}/lede/${wie}`, af
          ? { chatAf: true, chatAfOp: nouISO, chatAfDeur: uid }
          : { chatAf: false })
        return res.status(200).json({ ok: true, chatAf: af })
      }

      /* ── Die kode roteer of afsluit ──────────────────────────────── */
      case 'kode': {
        const groepId = String(lyf.groepId || '')
        const groep = await fs.lees(`vjGroepe/${groepId}`)
        if (!groep) return res.status(404).json({ fout: 'Ons kry nie daardie groep nie.' })
        if (groep.eienaar !== uid) return res.status(403).json({ fout: 'Net die eienaar kan die kode verander.' })

        if (lyf.aan === false) {
          await fs.stel(`vjGroepe/${groepId}`, { kodeAan: false })
          return res.status(200).json({ ok: true, kodeAan: false })
        }
        let kode = ''
        for (let poging = 0; poging < 12 && !kode; poging++) {
          const kans = maakGroepkode(groep.naam, [
            crypto.randomInt(1000) / 1000,
            crypto.randomInt(1000) / 1000,
            crypto.randomInt(10000) / 10000,
          ])
          if (!(await fs.groepMetKode(kans))) kode = kans
        }
        if (!kode) return res.status(503).json({ fout: 'Probeer asseblief weer.' })
        await fs.stel(`vjGroepe/${groepId}`, { kode, kodeAan: true, kodeGeroteer: nouISO })
        return res.status(200).json({ ok: true, kode, kodeAan: true })
      }

      /* ── My groepe ───────────────────────────────────────────────
       *
       * Hoe 'n mens sy groep terugkry ná 'n herinstallasie: die uid is
       * dieselfde sodra hy weer aanmeld, en hier staan waar hy hoort. */
      case 'myne': {
        const my = await fs.lees(`vjGebruikers/${uid}`)
        const groepe = (my && Array.isArray(my.groepe) ? my.groepe : []).filter(Boolean)
        const uit = []
        for (const gid of groepe.slice(0, 10)) {
          const groep = await fs.lees(`vjGroepe/${gid}`)
          if (!groep || groep.geargiveer) continue
          const lid = await fs.lees(`vjGroepe/${gid}/lede/${uid}`)
          if (!lid || lid.status !== 'aktief') continue
          const lede = await ledeVan(fs, gid)
          const fasil = lede.find(l => l.rol === 'fasiliteerder')
          uit.push({
            ...groepUit(groep, lede.length, fasil ? fasil.naam : ''),
            myRol: lid.rol, myNaam: lid.naam,
            /* Of hierdie mens uit die GROEPCHAT is. Sy lidmaatskap bly heel —
               net die gesprek is toe. Die skerm gebruik dit om die
               chat-knoppie te versteek; die REELS is wat dit werklik toemaak. */
            myChatAf: lid.chatAf === true,
          })
        }
        return res.status(200).json({ ok: true, groepe: uit, aktief: (my && my.aktief) || (uit[0] && uit[0].id) || null })
      }

      default:
        return res.status(400).json({ fout: 'onbekende versoek' })
    }
  } catch (e) {
    console.error('[vj-groep]', lyf.doen, e && e.message)
    return res.status(500).json({ fout: 'Iets het misluk. Probeer asseblief weer.' })
  }
}

/* Onthou waar hierdie mens hoort. Dit is 'n GEMAK, nie sekuriteit nie — die
   waarheid oor lidmaatskap staan in `vjGroepe/{id}/lede/{uid}`. */
async function onthouLidmaatskap(fs, uid, groepId, nouISO) {
  const my = await fs.lees(`vjGebruikers/${uid}`)
  const groepe = new Set((my && Array.isArray(my.groepe) ? my.groepe : []).filter(Boolean))
  groepe.add(groepId)
  await fs.stel(`vjGebruikers/${uid}`, {
    modus: 'groep',
    aktief: groepId,
    groepe: [...groepe].slice(0, 10),
    opgedateer: nouISO,
  })
}

async function vergeetLidmaatskap(fs, uid, groepId) {
  const my = await fs.lees(`vjGebruikers/${uid}`)
  if (!my) return
  const groepe = (Array.isArray(my.groepe) ? my.groepe : []).filter(g => g && g !== groepId)
  await fs.stel(`vjGebruikers/${uid}`, {
    groepe,
    aktief: my.aktief === groepId ? (groepe[0] || null) : my.aktief,
    modus: groepe.length ? 'groep' : 'solo',
  })
}
