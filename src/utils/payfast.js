import md5 from 'md5'

const MERCHANT_ID  = '26753445'
const MERCHANT_KEY = 'acdbj7mteeup0'
const PAYFAST_URL  = 'https://www.payfast.co.za/eng/process'
const ITN_URL      = 'https://daaglikse-hoop.vercel.app/api/payfast-itn'

function buildSignature(params) {
  const str = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&')
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

export function checkoutCart(books, email) {
  const base  = window.location.origin
  const total = books.reduce((sum, b) => sum + b.price, 0)
  const name  = books.length === 1
    ? books[0].title.substring(0, 100)
    : `${books.length} E-boeke — Daaglikse Hoop`

  submitForm({
    merchant_id:   MERCHANT_ID,
    merchant_key:  MERCHANT_KEY,
    return_url:    `${base}/?payment=success`,
    cancel_url:    `${base}/?payment=cancel`,
    notify_url:    ITN_URL,
    email_address: email,
    amount:        total.toFixed(2),
    item_name:     name,
    custom_str1:   email,
    custom_str2:   books.map(b => b.id).join(','),
  })
}
