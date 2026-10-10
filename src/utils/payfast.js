import md5 from 'md5'

const MERCHANT_ID  = '26753445'
const MERCHANT_KEY = 'acdbj7mteeup0'
const PASSPHRASE   = 'DaaglikseHoop5320'
const PAYFAST_URL  = 'https://www.payfast.co.za/eng/process'
const ITN_URL      = 'https://dewaldscheepers.com/api/payfast-itn'

function phpUrlencode(val) {
  return encodeURIComponent(String(val).trim())
    .replace(/%20/g, '+')
    .replace(/[!'()*~]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function buildSignature(params) {
  let str = Object.entries(params)
    .map(([k, v]) => `${k}=${phpUrlencode(v)}`)
    .join('&')
  if (PASSPHRASE) str += `&passphrase=${phpUrlencode(PASSPHRASE)}`
  return md5(str)
}

function submitForm(params) {
  params.signature = buildSignature(params)
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = PAYFAST_URL
  form.style.display = 'none'
  Object.entries(params).forEach(([k, v]) => {
    const input = document.createElement('input')
    input.type = 'hidden'; input.name = k; input.value = String(v)
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
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
    merchant_id:   MERCHANT_ID,
    merchant_key:  MERCHANT_KEY,
    return_url:    `${window.location.origin}/?payment=success&type=${type}&books=${encodeURIComponent(book.id)}&em=${encodeURIComponent(email)}${en ? '&lang=en' : ''}`,
    cancel_url:    `${window.location.origin}/?payment=cancel${en ? '&lang=en' : ''}`,
    notify_url:    ITN_URL,
    email_address: email,
    amount:        book.price.toFixed(2),
    item_name:     book.title.substring(0, 100),
    custom_str1:   email,
    custom_str2:   book.id,
  }
  if (en) params.custom_str3 = 'en'
  submitForm(params)
}

export function checkoutCart(books, email) {
  const base  = window.location.origin
  const total = books.reduce((sum, b) => sum + b.price, 0)
  const name  = books.length === 1
    ? books[0].title.substring(0, 100)
    : books.map(b => b.title).join(', ').substring(0, 100)

  localStorage.setItem('pendingPurchase', books.map(b => b.id).join(','))
  localStorage.setItem('pendingEmail', email)
  submitForm({
    merchant_id:   MERCHANT_ID,
    merchant_key:  MERCHANT_KEY,
    return_url:    `${base}/?payment=success&type=ebook&books=${encodeURIComponent(books.map(b => b.id).join(','))}&em=${encodeURIComponent(email)}`,
    cancel_url:    `${base}/?payment=cancel`,
    notify_url:    ITN_URL,
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
    merchant_id:       MERCHANT_ID,
    merchant_key:      MERCHANT_KEY,
    return_url:        returnUrl,
    cancel_url:        `${window.location.origin}/?payment=cancel&type=subscription${en ? '&lang=en' : ''}`,
    notify_url:        ITN_URL,
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

  submitForm(params)
}
