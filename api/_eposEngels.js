/* ────────────────────────────────────────────────────────────
   Die ENGELSE e-posse — een plek.

   Dewald, 10 Oktober 2026: *"as iemand aflaai kry hul die epos in engels saam
   met die boek... aparte plek in admin vir engelse eposte... die boodskap wat
   hul kry nadat hulle geskenk het moet ook engels wees. Weerwens die afrikaans
   werk reg moet niks daar verander nie."*

   ── Twee reëls ──

   1. Die Engelse adresse gaan na 'n APARTE versameling, `emailListEn` — nooit
      na `emailList` nie. Die Afrikaanse nuusbrief-masjien (send-bulk-email, die
      e-poswerkry) lees net `emailList`, dus kan 'n Engelse mens NOOIT per
      ongeluk 'n Afrikaanse blas kry nie. Daar is niks om te onthou om te
      filter nie.
   2. Die Afrikaanse e-posse word NIE hier aangeraak nie. Hulle bly woord vir
      woord in free-book-download.js en payfast-itn.js. Hierdie lêer word net
      geroep wanneer 'n boek of 'n skenking uitdruklik Engels is.

   Die steun-knoppies in die Engelse e-posse wys na /english — daar staan die
   Engelse donasie-kaart. /go/support maak die AFRIKAANSE steunblad oop.
   ──────────────────────────────────────────────────────────── */

const ENGELSE_LYS = 'emailListEn'
const ENGELSE_BLAD = 'https://www.dewaldscheepers.com/english'

/* Dieselfde witlys as `isEngels()` in src/data/engelsBoeke.js. Dit word hier
   herhaal omdat hierdie lêer CommonJS is en daardie een ESM; die toets
   (_eposEngels.toets.mjs) voer ALBEI uit en eis dieselfde antwoord. */
const ENGELS = new Set(['en', 'eng', 'english', 'engels'])
function isEngelseTaal(taal) {
  return ENGELS.has(String(taal || '').toLowerCase().trim())
}

/* 'n Titel kom uit Firestore en beland in HTML. Ontsnap dit. */
function ontsnap(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const KOP = `
    <div style="background:#5C4E8E;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:28px;">Daaglikse Hoop</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">with Dewald Scheepers</p>
    </div>`

const STEUN = `
    <hr style="border:none;border-top:1px solid #e8e4f0;margin:28px 0 24px;">
    <p style="font-size:15px;font-weight:700;color:#2d2d2d;margin:0 0 18px;text-align:center;">Help the next person receive free hope too:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:0 4px 10px 0;" width="50%">
          <a href="${ENGELSE_BLAD}" style="display:block;background:#5C4E8E;color:white;text-decoration:none;border-radius:10px;padding:13px 10px;font-size:13px;font-weight:700;text-align:center;font-family:Georgia,serif;">
            💜 Monthly Partner
          </a>
        </td>
        <td style="padding:0 0 10px 4px;" width="50%">
          <a href="${ENGELSE_BLAD}" style="display:block;background:white;color:#5C4E8E;text-decoration:none;border-radius:10px;padding:12px 10px;font-size:13px;font-weight:700;text-align:center;border:2px solid #5C4E8E;font-family:Georgia,serif;">
            🙏 Give once
          </a>
        </td>
      </tr>
    </table>`

const VOET = `
    <hr style="border:none;border-top:1px solid #e8e4f0;margin:20px 0 20px;">
    <p style="color:#888;font-size:13px;line-height:1.6;">
      Daaglikse Hoop &middot;
      <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a><br>
      You are receiving this email because you downloaded a free e-book. To unsubscribe, email info@dewaldscheepers.com
    </p>`

function raam(lyf) {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2d2d2d;">
      ${KOP}
      <div style="padding:32px 24px;background:white;border-radius:0 0 12px 12px;border:1px solid #e8e4f0;">
        ${lyf}
      </div>
    </div>`
}

/* Die e-pos met die gratis boek. Met 'n PDF: die aflaai-knoppie. Sonder: 'n
   eerlike "dit kom binnekort". Dieselfde twee gevalle as die Afrikaanse een. */
function boekEpos({ titel, pdfUrl }) {
  const t = ontsnap(titel)
  if (pdfUrl) {
    return {
      onderwerp: `Your free e-book: ${String(titel || '').trim()} 🎁`,
      html: raam(`
        <p style="font-size:20px;font-weight:700;margin:0 0 8px;">Your free e-book is here! 🎁</p>
        <p style="color:#555;line-height:1.6;margin:0 0 6px;">This book is free for you:</p>
        <p style="color:#2d2d2d;font-weight:700;line-height:1.6;margin:0 0 20px;">${t}</p>
        <p style="color:#666;line-height:1.7;margin:0 0 20px;">Click below to download your free e-book:</p>
        <div style="margin:16px 0;padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;">
          <p style="margin:0 0 10px;font-weight:700;color:#2d2d2d;font-size:16px;">${t}</p>
          <a href="${ontsnap(pdfUrl)}" style="display:inline-block;padding:11px 22px;background:#5C4E8E;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
            📥 Download
          </a>
        </div>
        <p style="color:#666;line-height:1.7;margin:16px 0 0;">More free English books are on <a href="${ENGELSE_BLAD}" style="color:#5C4E8E;">dewaldscheepers.com/english</a>.</p>
        ${STEUN}
        ${VOET}`),
    }
  }
  return {
    onderwerp: `Your e-book is coming soon: ${String(titel || '').trim()}`,
    html: raam(`
      <p style="font-size:20px;font-weight:700;margin:0 0 8px;">We've received your request! 🙏</p>
      <p style="color:#555;line-height:1.6;margin:0 0 20px;">
        We're preparing <strong>${t}</strong>. As soon as it's ready, we'll send you a download link.
      </p>
      <div style="padding:16px;background:#f8f5ff;border-radius:10px;border-left:4px solid #5C4E8E;margin:0 0 20px;">
        <p style="margin:0;color:#5C4E8E;font-weight:700;">Keep an eye on your inbox — we'll let you know!</p>
      </div>
      ${STEUN}
      ${VOET}`),
  }
}

const SEEN = `
    <p style="font-size:16px;line-height:1.8;margin:0 0 28px;">May the Lord bless you richly. 🙏🏻</p>
    <hr style="border:none;border-top:1px solid #e8e4f0;margin:0 0 24px;">
    <p style="margin:0;font-size:15px;line-height:1.6;color:#2d2d2d;">Blessings</p>
    <p style="margin:4px 0 24px;font-size:15px;font-weight:700;color:#2d2d2d;">Dewald Scheepers</p>
    <p style="color:#aaa;font-size:12px;line-height:1.6;margin:0;">
      Questions? Contact us at
      <a href="mailto:info@dewaldscheepers.com" style="color:#5C4E8E;">info@dewaldscheepers.com</a>
    </p>`

/* Ná 'n eenmalige skenking. */
function skenkDankie() {
  return {
    onderwerp: 'Thank you for your support 🙏',
    html: raam(`
      <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Hello,</p>
      <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">Thank you so much for your support. I truly appreciate it from my heart.</p>
      <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">Your gift helps us keep bringing hope, prayer and God's Word to people.</p>
      ${SEEN}`),
  }
}

/* Ná die eerste maandelikse vennoot-betaling. */
function vennootDankie() {
  return {
    onderwerp: 'Thank you for becoming a Hope Partner 🙏',
    html: raam(`
      <p style="font-size:17px;line-height:1.8;margin:0 0 16px;">Hello,</p>
      <p style="font-size:16px;line-height:1.8;margin:0 0 14px;">Thank you for becoming a Monthly Hope Partner! Thank you so much for your support.</p>
      <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">I truly appreciate it from my heart. Your monthly gift helps us keep bringing hope, prayer and God's Word to people who need it every day.</p>
      ${SEEN}`),
  }
}

module.exports = {
  ENGELSE_LYS, ENGELSE_BLAD, isEngelseTaal, ontsnap,
  boekEpos, skenkDankie, vennootDankie,
}
