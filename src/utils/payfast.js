/* ── Geen geheim in die app nie ──
 *
 * Hier het MERCHANT_KEY en PASSPHRASE gestaan, en die handtekening is in die
 * blaaier bereken. Die app se kode is publiek, dus was die wagwoordfrase
 * publiek — PayFast het Dewald op 27 November 2026 gevra om dit te vervang.
 * Die bediener teken nou (`/api/payfast-teken`, sien api/_payfast.js); die app
 * stuur net die betaling se velde, en die geheim verlaat nooit Vercel nie. */
/* ── Die ITN-adres is die adres waarop die blad WERKLIK loop ──
 *
 * Dit was vas `https://dewaldscheepers.com/api/payfast-itn` — sonder www. Die
 * werf loop op www.dewaldscheepers.com, en stuur die kaal domein daarheen aan,
 * dan kry PayFast se POST 'n aanstuur in plaas van ons bediener. PayFast volg
 * dit nie: die betaling slaag, PayFast stuur sy eie e-posse, en ons hoor nooit
 * daarvan nie — geen dankie-e-pos, nie in Engels en nie in Afrikaans nie
 * (Dewald, 10 Oktober 2026, ná 'n R10- en 'n R50-skenking). Die gratis
 * e-boek-e-pos het intussen gewerk, want die app roep daardie eindpunt RELATIEF.
 *
 * `window.location.origin` is per definisie 'n adres wat ons bediener direk
 * bedien — die blad het pas daarvandaan gelaai. */
function itnUrl() {
  try {
    const o = window.location.origin
    if (/^https:\/\//.test(o)) return `${o}/api/payfast-itn`
  } catch {}
  return 'https://www.dewaldscheepers.com/api/payfast-itn'
}

/* Die bediener teken en sit merchant_id/merchant_key by; ons bou net die vorm
   uit wat hy teruggee, in sy volgorde. Misluk dit, sê ons dit — 'n knoppie wat
   stil niks doen nie, is erger as 'n eerlike sin. */
async function submitForm(params) {
  const { merchant_id, merchant_key, signature, ...velde } = params // eie waardes word nooit gestuur nie
  let antwoord = null
  try {
    const r = await fetch('/api/payfast-teken', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ velde }),
    })
    antwoord = r.ok ? await r.json() : null
  } catch {}
  if (!antwoord || !antwoord.velde || !antwoord.aksie) {
    const en = String(velde.custom_str3 || '') === 'en'
    alert(en
      ? 'We could not open PayFast right now. Please try again in a moment.'
      : 'Ons kon nie nou na PayFast gaan nie. Probeer asseblief oor \'n oomblik weer.')
    return false
  }
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = antwoord.aksie
  form.style.display = 'none'
  Object.entries(antwoord.velde).forEach(([k, v]) => {
    const input = document.createElement('input')
    input.type = 'hidden'; input.name = k; input.value = String(v)
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
  return true
}

/* `taal: 'en'` kom van die ENGELSE blad. Dan dra die terugkeer-adres
   `&lang=en` (die dankie-opspringer is Engels) en custom_str3 = 'en' (die
   dankie-e-pos is Engels en die adres gaan na die Engelse lys — sien
   api/_eposEngels.js). Sonder `taal` is die vorm WOORD VIR WOORD wat dit altyd
   was: die Afrikaanse pad verander nie. */
export function checkoutBook(book, email, type = 'ebook', { taal } = {}) {
  const en = taal === 'en'
  if (type === 'ebook') {
    localStorage.setItem('pendingPurchase', book.id)
    localStorage.setItem('pendingEmail', email)
  }
  const params = {
    return_url:    `${window.location.origin}/?payment=success&type=${type}&books=${encodeURIComponent(book.id)}&em=${encodeURIComponent(email)}${en ? '&lang=en' : ''}`,
    cancel_url:    `${window.location.origin}/?payment=cancel${en ? '&lang=en' : ''}`,
    notify_url:    itnUrl(),
    email_address: email,
    amount:        book.price.toFixed(2),
    item_name:     book.title.substring(0, 100),
    custom_str1:   email,
    custom_str2:   book.id,
  }
  if (en) params.custom_str3 = 'en'
  return submitForm(params)
}

export function checkoutCart(books, email) {
  const base  = window.location.origin
  const total = books.reduce((sum, b) => sum + b.price, 0)
  const name  = books.length === 1
    ? books[0].title.substring(0, 100)
    : books.map(b => b.title).join(', ').substring(0, 100)

  localStorage.setItem('pendingPurchase', books.map(b => b.id).join(','))
  localStorage.setItem('pendingEmail', email)
  return submitForm({
    return_url:    `${base}/?payment=success&type=ebook&books=${encodeURIComponent(books.map(b => b.id).join(','))}&em=${encodeURIComponent(email)}`,
    cancel_url:    `${base}/?payment=cancel`,
    notify_url:    itnUrl(),
    email_address: email,
    amount:        total.toFixed(2),
    item_name:     name,
    custom_str1:   email,
    custom_str2:   books.map(b => b.id).join(','),
  })
}

export function checkoutSubscription(amountRand, email, { taal } = {}) {
  const en = taal === 'en'
  const amount = Number(amountRand).toFixed(2)

  if (email) localStorage.setItem('pendingEmail', email)

  // Next billing date = same day next month, capped to last day of that month
  const today = new Date()
  const lastDayNext = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate()
  const billingDay  = Math.min(today.getDate(), lastDayNext)
  const billingDate = new Date(today.getFullYear(), today.getMonth() + 1, billingDay)
    .toISOString().slice(0, 10)

  const returnUrl = (email
    ? `${window.location.origin}/?payment=success&type=subscription&em=${encodeURIComponent(email)}`
    : `${window.location.origin}/?payment=success&type=subscription`) + (en ? '&lang=en' : '')

  const params = {
    return_url:        returnUrl,
    cancel_url:        `${window.location.origin}/?payment=cancel&type=subscription${en ? '&lang=en' : ''}`,
    notify_url:        itnUrl(),
    amount,
    item_name:         en ? 'Monthly Hope Partner' : 'Maandelikse Hoop-Vennoot',
    /* Net vir die Engelse blad; PayFast stuur dit terug in elke ITN. */
    ...(en ? { custom_str3: 'en' } : {}),
    subscription_type: '1',
    billing_date:      billingDate,
    recurring_amount:  amount,
    frequency:         '3',
    cycles:            '0',
  }
  if (email) params.email_address = email

  return submitForm(params)
}
