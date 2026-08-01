/* ────────────────────────────────────────────────────────────
   Vrugtefees — die tekenaar.

   Die enjin sê WAT gebeur het. Hierdie lêer wys HOE dit lyk terwyl dit
   gebeur: vrugte gly, val, swel op en bars.

   Waarom 'n canvas en nie DOM nie: my eerste poging het die selle aan hul
   roosterposisie vasgemaak, dus het niks ooit beweeg nie. Om 64 elemente
   elke raam te skuif is presies waarvoor 'n canvas gemaak is.

   Waarom dit veilig is ná Bou die Ark: die doek loop met
   willReadFrequently, wat Chrome laat kies om dit op die SVE te hou in
   plaas van 'n eie GPU-laag. Daardie laag was die strepe op haar foon.
   Daar is ook geen border-radius op die doek nie — 'n afgeronde rand op 'n
   saamgestelde element dwing 'n masker-laag.
   ──────────────────────────────────────────────────────────── */

import { bedekSel, RYLIG, KOLOMLIG, OESKRAG, REENBOOGVRUG, FEESMANDJIE } from './enjin'

const MERK = {
  [RYLIG]: '↔', [KOLOMLIG]: '↕', [OESKRAG]: '✷',
  [REENBOOGVRUG]: '✺', [FEESMANDJIE]: '❉',
}

const BLOK_KLEUR = {
  droeblaar: ['#8A6E3C', '#C9AA6E'],
  onkruid:   ['#4E6B3A', '#8FB268'],
  doring:    ['#6E3A46', '#C08090'],
  klip:      ['#4C5568', '#8792A8'],
  krat:      ['#7A5A34', '#C09A66'],
}

/* ── Vrugte een keer na 'n prentjie omskakel ──
   'n SVG op 'n canvas teken is stadig. Ons doen dit een keer per grootte en
   plak daarna net die prentjie oor. */
function maakPrente(vrugte, sy) {
  return vrugte.map(v => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sy}" height="${sy}" viewBox="0 0 64 64">${v.svg}</svg>`
    const beeld = new Image()
    beeld.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    return beeld
  })
}

/* Een vrug op die bord. x en y is in SELLE, met breukdele, sodat 'n vrug
   tussen twee selle kan wees terwyl dit beweeg. */
let volgendeId = 1
function maakSprite(k, r, vrug, spesiaal) {
  return { id: volgendeId++, k, r, x: k, y: r, doelX: k, doelY: r, vrug, spesiaal, skaal: 1, alfa: 1, sterf: false }
}

export function maakTekenaar(doek, opsies) {
  const { vrugte, kolomme = 8, rye = 8, opGereed } = opsies
  let prente = null
  let sy = 0

  const st = {
    sprites: new Map(),      // id → sprite
    rooster: [],             // r*kolomme+k → id of null
    blokke: [],              // 'n kopie van die bord se versperrings
    kies: null,
    skud: null,
    tydOor: 0,
    loop: null,
    rustig: false,
  }

  function selGrootte() { return doek.width / kolomme }

  function stelPrente() {
    const nuweSy = Math.max(24, Math.round(selGrootte()))
    if (prente && sy === nuweSy) return
    sy = nuweSy
    prente = maakPrente(vrugte, sy)
    let oor = prente.length
    prente.forEach(p => {
      const klaar = () => { if (--oor === 0 && opGereed) opGereed() }
      if (p.complete) klaar(); else { p.onload = klaar; p.onerror = klaar }
    })
  }

  /* Bou die sprites van voor af uit 'n bord. */
  function stelBord(bord) {
    st.sprites.clear()
    st.rooster = new Array(kolomme * rye).fill(null)
    st.blokke = bord.selle.map(s => (s.blok ? { tipe: s.blok, slae: s.blokSlae } : null))
    for (let r = 0; r < rye; r++)
      for (let k = 0; k < kolomme; k++) {
        const sel = bord.selle[r * kolomme + k]
        if (!sel || sel.vrug === null || bedekSel(sel)) continue
        const sp = maakSprite(k, r, sel.vrug, sel.spesiaal)
        st.sprites.set(sp.id, sp)
        st.rooster[r * kolomme + k] = sp.id
      }
    stelPrente()
  }

  function spriteBy(k, r) {
    const id = st.rooster[r * kolomme + k]
    return id ? st.sprites.get(id) : null
  }

  /* ── Die animasies ──
     Elkeen gee 'n belofte terug wat klaarmaak wanneer die beweging klaar is.
     In rustige modus gebeur alles amper dadelik. */
  function duur(ms) { return st.rustig ? Math.min(ms, 40) : ms }

  function beweeg(ms) {
    return new Promise(res => {
      const t = duur(ms)
      const begin = performance.now()
      const beginne = [...st.sprites.values()].map(s => ({ s, x0: s.x, y0: s.y }))
      function raam(nou) {
        const p = Math.min(1, (nou - begin) / t)
        const e = 1 - Math.pow(1 - p, 3)          // sag uit
        for (const { s, x0, y0 } of beginne) {
          s.x = x0 + (s.doelX - x0) * e
          s.y = y0 + (s.doelY - y0) * e
        }
        if (p < 1) requestAnimationFrame(raam)
        else { beginne.forEach(({ s }) => { s.x = s.doelX; s.y = s.doelY }); res() }
      }
      requestAnimationFrame(raam)
    })
  }

  function bars(ids, ms) {
    return new Promise(res => {
      const t = duur(ms)
      const begin = performance.now()
      const lys = ids.map(id => st.sprites.get(id)).filter(Boolean)
      lys.forEach(s => { s.sterf = true })
      function raam(nou) {
        const p = Math.min(1, (nou - begin) / t)
        for (const s of lys) {
          // eers effens groter, dan weg
          s.skaal = p < 0.3 ? 1 + p * 0.7 : 1.21 - (p - 0.3) * 1.73
          s.alfa = p < 0.4 ? 1 : 1 - (p - 0.4) / 0.6
        }
        if (p < 1) requestAnimationFrame(raam)
        else { lys.forEach(s => st.sprites.delete(s.id)); res() }
      }
      requestAnimationFrame(raam)
    })
  }

  /* ── Die stappe van die enjin afspeel ── */
  async function speelStappe(stappe, bord) {
    for (const stap of stappe) {
      if (stap.tipe === 'ongeldig') {
        const a = spriteBy(stap.a.k, stap.a.r), b = spriteBy(stap.b.k, stap.b.r)
        if (a && b) {
          a.doelX = b.k; a.doelY = b.r; b.doelX = a.k; b.doelY = a.r
          await beweeg(170)
          a.doelX = a.k; a.doelY = a.r; b.doelX = b.k; b.doelY = b.r
          await beweeg(170)
        }
      } else if (stap.tipe === 'ruil') {
        const ia = stap.a.r * kolomme + stap.a.k
        const ib = stap.b.r * kolomme + stap.b.k
        const idA = st.rooster[ia], idB = st.rooster[ib]
        st.rooster[ia] = idB; st.rooster[ib] = idA
        const a = st.sprites.get(idA), b = st.sprites.get(idB)
        if (a) { a.k = stap.b.k; a.r = stap.b.r; a.doelX = a.k; a.doelY = a.r }
        if (b) { b.k = stap.a.k; b.r = stap.a.r; b.doelX = b.k; b.doelY = b.r }
        await beweeg(200)
      } else if (stap.tipe === 'kombinasie') {
        await new Promise(res => setTimeout(res, duur(170)))
      } else if (stap.tipe === 'vee') {
        const ids = []
        for (const [k, r] of stap.selle) {
          const i = r * kolomme + k
          const id = st.rooster[i]
          if (id) { ids.push(id); st.rooster[i] = null }
        }
        // versperrings wat geraak is
        for (const v of stap.versperrings) {
          const i = v.r * kolomme + v.k
          if (v.oor <= 0) st.blokke[i] = null
          else if (st.blokke[i]) st.blokke[i].slae = v.oor
        }
        await bars(ids, 320)
        // nuwe spesiale vrugte verskyn waar die enjin hulle gesit het
        for (const ns of stap.spesiaalGemaak) {
          const sp = maakSprite(ns.k, ns.r, ns.vrug, ns.soort)
          sp.skaal = 0.2
          st.sprites.set(sp.id, sp)
          st.rooster[ns.r * kolomme + ns.k] = sp.id
          groei(sp)
        }
      } else if (stap.tipe === 'val') {
        for (const bw of stap.bewegings) {
          const [k0, r0] = bw.van, [k1, r1] = bw.na
          const id = st.rooster[r0 * kolomme + k0]
          if (!id) continue
          st.rooster[r0 * kolomme + k0] = null
          st.rooster[r1 * kolomme + k1] = id
          const s = st.sprites.get(id)
          if (s) { s.k = k1; s.r = r1; s.doelX = k1; s.doelY = r1 }
        }
        for (const n of stap.nuwe) {
          const sp = maakSprite(n.k, n.r, n.vrug, null)
          sp.y = -1 - Math.random() * 2          // val van bo af in
          sp.x = n.k
          st.sprites.set(sp.id, sp)
          st.rooster[n.r * kolomme + n.k] = sp.id
        }
        await beweeg(300)
      }
    }
    // Sinchroniseer met die enjin, sodat 'n fout nooit kan opbou nie
    if (bord) stelBlokkeUit(bord)
  }

  function groei(sp) {
    const begin = performance.now()
    const t = duur(230)
    function raam(nou) {
      const p = Math.min(1, (nou - begin) / t)
      sp.skaal = 0.2 + 0.8 * (1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(raam)
      else sp.skaal = 1
    }
    requestAnimationFrame(raam)
  }

  function stelBlokkeUit(bord) {
    st.blokke = bord.selle.map(s => (s.blok ? { tipe: s.blok, slae: s.blokSlae } : null))
  }

  /* ── Teken ── */
  function teken() {
    const ctx = doek.getContext('2d', { willReadFrequently: true })
    const g = selGrootte()
    ctx.clearRect(0, 0, doek.width, doek.height)

    /* Die bord se agtergrond word HIER geteken, met afgeronde hoeke en
       effens deurskynend, sodat die geskilderde tuin daaragter deurskyn.
       'n border-radius in CSS sou 'n masker-laag afdwing — die ding wat op
       haar foon gebreek het. Binne die doek is dit net verf. */
    const hoek = g * 0.42
    ctx.save()
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(0, 0, doek.width, doek.height, hoek)
    else ctx.rect(0, 0, doek.width, doek.height)
    ctx.clip()

    ctx.fillStyle = 'rgba(18, 25, 40, 0.74)'
    ctx.fillRect(0, 0, doek.width, doek.height)
    ctx.fillStyle = 'rgba(255,255,255,0.035)'
    for (let r = 0; r < rye; r++)
      for (let k = 0; k < kolomme; k++) {
        if ((k + r) % 2) continue
        ctx.fillRect(k * g, r * g, g, g)
      }

    // gekose sel
    if (st.kies) {
      ctx.strokeStyle = '#E4C98A'
      ctx.lineWidth = Math.max(2, g * 0.06)
      ctx.strokeRect(st.kies.k * g + 2, st.kies.r * g + 2, g - 4, g - 4)
    }

    // vrugte
    if (prente) {
      for (const s of st.sprites.values()) {
        const beeld = prente[s.vrug]
        if (!beeld || !beeld.complete || !beeld.naturalWidth) continue
        const grootte = g * 0.92 * s.skaal
        const cx = s.x * g + g / 2, cy = s.y * g + g / 2
        ctx.globalAlpha = s.alfa
        ctx.drawImage(beeld, cx - grootte / 2, cy - grootte / 2, grootte, grootte)
        if (s.spesiaal) {
          const rr = g * 0.17
          ctx.fillStyle = '#F0DCA8'
          ctx.beginPath()
          ctx.arc(cx + g * 0.28, cy + g * 0.28, rr, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#14202E'
          ctx.font = `700 ${Math.round(rr * 1.5)}px system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(MERK[s.spesiaal] || '?', cx + g * 0.28, cy + g * 0.30)
        }
        ctx.globalAlpha = 1
      }
    }

    /* Versperrings.
       Dit was 'n plat gekleurde blok AGTER die vrug, met die slae-stippels
       in die middel waar die vrug hulle toegemaak het. 'n Mens kon nie sien
       wat onkruid is of hoeveel slae oor is nie.
       Nou word elkeen geteken soos die ding wat dit is, OOR die vrug se
       rande, en die stippels sit in die hoek waar niks hulle toemaak nie. */
    for (let i = 0; i < st.blokke.length; i++) {
      const b = st.blokke[i]
      if (!b) continue
      const k = i % kolomme, r = Math.floor(i / kolomme)
      const x = k * g, y = r * g
      const [donker, lig] = BLOK_KLEUR[b.tipe] || ['#555', '#999']

      if (b.tipe === 'klip') {
        // 'n Klip vat die hele sel; daar is geen vrug om te wys nie
        ctx.fillStyle = donker
        ctx.beginPath()
        ctx.ellipse(x + g * 0.5, y + g * 0.56, g * 0.38, g * 0.32, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = lig
        ctx.beginPath()
        ctx.ellipse(x + g * 0.40, y + g * 0.44, g * 0.16, g * 0.11, -0.5, 0, Math.PI * 2)
        ctx.fill()
      } else if (b.tipe === 'krat') {
        ctx.fillStyle = donker
        ctx.fillRect(x + g * 0.12, y + g * 0.12, g * 0.76, g * 0.76)
        ctx.strokeStyle = lig
        ctx.lineWidth = Math.max(2, g * 0.06)
        ctx.strokeRect(x + g * 0.12, y + g * 0.12, g * 0.76, g * 0.76)
        ctx.beginPath()
        ctx.moveTo(x + g * 0.12, y + g * 0.5); ctx.lineTo(x + g * 0.88, y + g * 0.5)
        ctx.moveTo(x + g * 0.5, y + g * 0.12); ctx.lineTo(x + g * 0.5, y + g * 0.88)
        ctx.stroke()
      } else if (b.tipe === 'onkruid') {
        // Rankies wat van onder af oor die vrug groei
        ctx.strokeStyle = donker
        ctx.lineWidth = Math.max(2, g * 0.075)
        ctx.lineCap = 'round'
        for (const [vx, hoogte] of [[0.24, 0.42], [0.5, 0.55], [0.76, 0.40]]) {
          ctx.beginPath()
          ctx.moveTo(x + g * vx, y + g * 0.96)
          ctx.quadraticCurveTo(x + g * (vx + 0.1), y + g * (0.96 - hoogte * 0.6), x + g * vx, y + g * (0.96 - hoogte))
          ctx.stroke()
        }
        ctx.fillStyle = lig
        for (const [bx, by, rr] of [[0.20, 0.56, 0.11], [0.55, 0.42, 0.13], [0.80, 0.58, 0.10]]) {
          ctx.beginPath()
          ctx.ellipse(x + g * bx, y + g * by, g * rr, g * rr * 0.55, -0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (b.tipe === 'doring') {
        // Stingels met stekels wat oor die sel kruis
        ctx.strokeStyle = donker
        ctx.lineWidth = Math.max(2, g * 0.085)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x + g * 0.10, y + g * 0.86); ctx.lineTo(x + g * 0.90, y + g * 0.16)
        ctx.moveTo(x + g * 0.10, y + g * 0.20); ctx.lineTo(x + g * 0.90, y + g * 0.84)
        ctx.stroke()
        ctx.fillStyle = lig
        for (const [tx, ty] of [[0.30, 0.68], [0.55, 0.42], [0.72, 0.66], [0.40, 0.34]]) {
          ctx.beginPath()
          ctx.moveTo(x + g * tx, y + g * ty)
          ctx.lineTo(x + g * (tx + 0.11), y + g * (ty - 0.06))
          ctx.lineTo(x + g * (tx + 0.03), y + g * (ty + 0.09))
          ctx.closePath()
          ctx.fill()
        }
      } else {
        // droë blaar: 'n gekrulde blaar oor die onderste hoek
        ctx.fillStyle = donker
        ctx.beginPath()
        ctx.ellipse(x + g * 0.34, y + g * 0.70, g * 0.28, g * 0.16, -0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = lig
        ctx.beginPath()
        ctx.ellipse(x + g * 0.66, y + g * 0.76, g * 0.22, g * 0.13, 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = lig
        ctx.lineWidth = Math.max(1.5, g * 0.035)
        ctx.beginPath()
        ctx.moveTo(x + g * 0.16, y + g * 0.80); ctx.lineTo(x + g * 0.52, y + g * 0.62)
        ctx.stroke()
      }

      /* Hoeveel slae oor. Links bo, waar die vrug niks toemaak nie. */
      if (b.slae > 1) {
        for (let n = 0; n < b.slae; n++) {
          const px = x + g * 0.16 + n * g * 0.15, py = y + g * 0.15
          ctx.fillStyle = 'rgba(10, 14, 24, 0.75)'
          ctx.beginPath(); ctx.arc(px, py, g * 0.075, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = lig
          ctx.beginPath(); ctx.arc(px, py, g * 0.05, 0, Math.PI * 2); ctx.fill()
        }
      }
    }

    // 'n dun goue rand om die bord, binne die klip
    ctx.strokeStyle = 'rgba(228, 201, 138, 0.28)'
    ctx.lineWidth = Math.max(2, g * 0.05)
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(1, 1, doek.width - 2, doek.height - 2, hoek)
    else ctx.rect(1, 1, doek.width - 2, doek.height - 2)
    ctx.stroke()
    ctx.restore()
  }

  function begin() {
    if (st.loop) return
    const raam = () => { teken(); st.loop = requestAnimationFrame(raam) }
    st.loop = requestAnimationFrame(raam)
  }
  function stop() {
    if (st.loop) cancelAnimationFrame(st.loop)
    st.loop = null
  }

  return {
    stelBord,
    speelStappe,
    stelBlokkeUit,
    begin, stop, teken, stelPrente,
    stelKies: (k) => { st.kies = k },
    stelRustig: (v) => { st.rustig = v },
    selBy: (px, py) => {
      const g = selGrootte()
      const k = Math.floor(px / g), r = Math.floor(py / g)
      if (k < 0 || r < 0 || k >= kolomme || r >= rye) return null
      return { k, r }
    },
  }
}
