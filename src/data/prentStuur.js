/* ── 'N PRENT DEEL, OF DIT AFLAAI ──
 *
 * Hierdie kode het in `Luister.jsx` gewoon en net vandag se wallpaper bedien.
 * Die VORIGE PRENTE-galery het dieselfde ding nodig, en 'n tweede kopie is 'n
 * tweede plek wat stilweg agterbly die dag wanneer iets hieraan verander —
 * presies wat met `prentPad` gebeur het, wat in `src/data/prentPad.js` gewoon
 * het EN 'n tweede keer in Luister.jsx.
 *
 * Alles hieronder is uit daardie werkende weergawe gelig. Die kommentaar kom
 * saam, want dit dra die redes.
 *
 * ── Waarom die prent deur ons eie bediener kom ──
 *
 * Die eerste weergawe het `fetch(url)` direk gedoen en dit het NIE gewerk nie:
 * die prent lê op firebasestorage.googleapis.com en daardie emmer het geen
 * CORS-opstelling nie. 'n `<img>` wys hom sonder moeite, maar 'n `fetch` van 'n
 * ander domein af word geblokkeer. Die kode het toe stil na teks-alleen
 * teruggeval, en op WhatsApp het net 'n skakel geland — dit LYK of dit werk.
 *
 * `prentPad()` stuur enige vreemde domein deur /api/wallpaper.
 *
 * ── WhatsApp gooi die byskrif weg ──
 *
 * `navigator.share({ files, text })` stuur albei. Elke ander app gebruik die
 * teks — Telegram, Instagram, e-pos, SMS — maar WhatsApp ignoreer dit sodra
 * daar 'n prent by is. Daarom word die sin EERSTE op die knipbord gesit, in
 * dieselfde tik as die klik (die knipbord vereis 'n vars aanraking, dus voor
 * die fetch), en die skerm sê dan: plak dit as 'n tweede boodskap.
 *
 * ── En as die prent glad nie kom nie ──
 *
 * Dan word dit GESÊ. 'n Stille terugval na teks is presies hoe hierdie fout die
 * eerste keer verby gekom het.
 */

import { prentPad } from './prentPad'

export const DEEL_SIN = 'Luister die volle boodskap by https://dewaldscheepers.com/go'

/* Haal die prent as 'n blob, of `null`. 'n Foutbladsy is ook 'n geldige
   antwoord — net 'n PRENT tel, en 'n prent is groter as 'n kilogreep. */
async function haalPrent(url) {
  try {
    const r = await fetch(prentPad(url))
    if (!r.ok) return null
    const b = await r.blob()
    if (/^image\//.test(b.type) && b.size > 1024) return b
    return null
  } catch {
    return null
  }
}

function stoorBlob(blob, naam) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = naam
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/* ── AFLAAI ──
 *
 * Dewald: *"hul moet dit kan aflaai en deel."* Twee verskillende dade: aflaai
 * sit dit op HAAR foon (om as skermagtergrond te gebruik), deel stuur dit aan
 * IEMAND ANDERS. Die een is nie 'n terugval vir die ander nie.
 *
 * Gee `{ ok, fout }`. */
export async function laaiPrentAf(url, naam = 'daaglikse-hoop.jpg') {
  const blob = await haalPrent(url)
  if (!blob) return { ok: false, fout: 'Die prent kon nie gelaai word nie. Probeer weer.' }
  try {
    stoorBlob(blob, naam)
    return { ok: true }
  } catch {
    return { ok: false, fout: 'Die prent kon nie gestoor word nie.' }
  }
}

/* ── DEEL ──
 *
 * Gee `{ ok, hoe, gekopieer, nota, fout }`:
 *   hoe = 'gedeel'   — die foon se deelvenster het dit gevat
 *   hoe = 'afgelaai' — die blaaier kan nie lêers deel nie (meestal 'n rekenaar)
 *   hoe = 'gekanselleer' — die mens het die venster toegemaak; nie 'n fout nie
 *   hoe = 'net-teks' — die prent kon nie kom nie, en ons sê dit
 */
export async function deelPrent(url, { titel = '', naam = 'daaglikse-hoop.jpg' } = {}) {
  const boodskap = `${titel || 'Daaglikse Hoop'}\n\n${DEEL_SIN}`

  /* VOOR enige `await`. Die knipbord werk net terwyl die tik nog "vars" is, en
     'n fetch oor 'n stadige netwerk kan daardie venster verby laat gaan. */
  let gekopieer = false
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(boodskap)
      gekopieer = true
    }
  } catch { /* die knipbord is nie oral beskikbaar nie */ }

  const blob = await haalPrent(url)

  if (blob) {
    const lêer = new File([blob], naam, { type: blob.type })
    try {
      /* `canShare({ files })` is die enigste betroubare toets. `navigator.share`
         bestaan op baie blaaiers wat NIE lêers kan deel nie, en dan gooi dit
         eers wanneer 'n mens dit roep. */
      if (navigator.canShare && navigator.canShare({ files: [lêer] })) {
        await navigator.share({ files: [lêer], text: boodskap })
        return {
          ok: true, hoe: 'gedeel', gekopieer,
          nota: gekopieer
            ? 'Die prent is gestuur. WhatsApp los die woorde uit by \'n prent — die skakel is gekopieer, plak dit as \'n tweede boodskap.'
            : `Die prent is gestuur. Stuur die skakel ook: ${DEEL_SIN}`,
        }
      }
    } catch (e) {
      /* Die mens het die deelvenster toegemaak. Dit is nie 'n fout nie. */
      if (e && e.name === 'AbortError') return { ok: true, hoe: 'gekanselleer', gekopieer }
    }

    try {
      stoorBlob(blob, naam)
      return {
        ok: true, hoe: 'afgelaai', gekopieer,
        nota: gekopieer
          ? 'Die prent is na jou Aflaaie toe, en die skakel is gekopieer.'
          : 'Die prent is na jou Aflaaie toe. Stuur dit van daar af.',
      }
    } catch { /* val deur na die teks-pad */ }
  }

  /* Die prent kon glad nie gekry word nie. Stuur die woorde, en sê dit. */
  try {
    if (navigator.share) await navigator.share({ text: boodskap })
    else if (navigator.clipboard) await navigator.clipboard.writeText(boodskap)
  } catch { /* ook dit kan geweier word */ }
  return {
    ok: false, hoe: 'net-teks', gekopieer,
    fout: 'Die prent kon nie gestuur word nie — net die skakel is gestuur. Hou jou vinger op die foto en kies "Save image".',
  }
}
