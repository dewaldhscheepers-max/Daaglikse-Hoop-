import md5 from 'md5'

const MERCHANT_ID  = '26753445'
const MERCHANT_KEY = 'acdbj7mteeup0'
const PAYFAST_URL  = 'https://www.payfast.co.za/eng/process'

function buildSignature(params) {
  const str = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&')
  return md5(str)
}

export function checkoutBook(book, email) {
  const base = window.location.origin

  const params = {
    merchant_id:   MERCHANT_ID,
    merchant_key:  MERCHANT_KEY,
    return_url:    `${base}/?payment=success&title=${encodeURIComponent(book.title)}`,
    cancel_url:    `${base}/?payment=cancel`,
    email_address: email,
    amount:        book.price.toFixed(2),
    item_name:     book.title.substring(0, 100),
    item_description: book.desc.substring(0, 255),
    custom_str1:   book.id,
    custom_str2:   email,
  }

  params.signature = buildSignature(params)

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = PAYFAST_URL
  form.style.display = 'none'

  Object.entries(params).forEach(([k, v]) => {
    const input = document.createElement('input')
    input.type  = 'hidden'
    input.name  = k
    input.value = String(v)
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}
