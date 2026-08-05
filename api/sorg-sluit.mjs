/* ────────────────────────────────────────────────────────────
   Die admin se slot.

     POST /api/sorg-sluit   met die wagwoord in die X-Sorg-Geheim-kop
       → { ok: true }                    dit is reg
       → { ok: false, opgestel: false }  daar is nog geen wagwoord op Vercel

   Hoekom hierdie lêer bestaan:

   Die admin het 'n PIN gehad wat IN DIE KODE gestaan het ('2025'). Dit
   beskerm niks. Die app se lêers is openbaar — enigiemand kan hulle oopmaak
   en die PIN lees, en dit vat sowat dertig sekondes. 'n Langer wagwoord in
   dieselfde plek is presies net so oop; hy lyk net sterker.

   Nou werk dit soos 'n wagwoord hoort te werk: die app weet dit NIE. Dewald
   tik dit, ons stuur dit hierheen, en die bediener vergelyk dit met
   SORG_ADMIN_GEHEIM wat net op Vercel bestaan. Wie die app se kode lees, kry
   niks.

   Die vergelyking loop in konstante tyd (`magSkryf`), sodat 'n mens dit nie
   letter vir letter kan raai deur te meet hoe lank die antwoord vat nie.

   Daar is met opset GEEN pad in hierdie lêer wat 'ja' antwoord sonder die
   regte wagwoord nie. Is die veranderlike nie opgestel nie, sê ons dit
   reguit — dan weet Dewald wat om te doen — maar ons maak niks oop nie.
   ──────────────────────────────────────────────────────────── */

import { magSkryf } from './_sorgFirestore.mjs'

/* 'n Stadige antwoord maak raai duur. Dit is nie 'n groot beskerming nie,
   maar dit kos niks en dit maak duisende pogings per minuut onprakties. */
function wag(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sorg-Geheim')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Method Not Allowed' })

  const mag = magSkryf(req)
  if (mag.ok) return res.status(200).json({ ok: true })

  await wag(700)

  /* Ons sê WEL of die veranderlike ontbreek. Dit is nie 'n lek nie — dit lyk
     presies dieselfde vir 'n vreemdeling as vir Dewald — en sonder dit sou
     hy nie weet hoekom die regte wagwoord nie werk nie. */
  const opgestel = !!(process.env.SORG_ADMIN_GEHEIM && process.env.SORG_ADMIN_GEHEIM.length >= 16)
  return res.status(401).json({
    ok: false,
    opgestel,
    fout: opgestel
      ? 'Verkeerde wagwoord.'
      : 'Daar is nog geen wagwoord opgestel nie. Stel SORG_ADMIN_GEHEIM op Vercel (minstens 16 karakters) en ontplooi weer.',
  })
}
