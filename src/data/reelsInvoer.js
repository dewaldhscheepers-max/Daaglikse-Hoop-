/* ── Die skakels wat Dewald geplak het ──
 *
 * 12 September 2026: *"hier is die eerste klomp videos add hulle solank."*
 * 124 kort TikTok-skakels, aanmekaar geplak sonder 'n enkele spasie.
 *
 * ── Waarom hulle HIER staan en nie klaar as clips nie ──
 *
 * 'n Kort skakel dra die post-ID nie. Hy is 'n aanwyser: 'n mens moet hom
 * OOPMAAK om te sien waarheen hy wys, en TikTok is nie bereikbaar van die
 * plek waar hierdie kode geskryf is nie. Die oplos gebeur dus op Vercel, waar
 * die netwerk wel oop is — `api/reels-voeg-by.mjs`.
 *
 * Hierdie lys is dus 'n WERKLYS en nie die voer nie. Die admin het 'n knoppie
 * wat hom in stukke deur die oplosser stuur; elke skakel word 'n dokument in
 * `reels` met sy post-ID en die maker se handvatsel. Daarna is hierdie lys
 * geskiedenis — dit word nie weer geloop nie, en 'n skakel wat al 'n clip
 * geword het, word oorgeslaan.
 *
 * Dit staan in die kode en nie in 'n plakkassie nie omdat Dewald hulle EEN keer
 * gestuur het en dit nie weer moet doen nie. Nuwe skakels gaan deur die
 * plakkassie in die admin.
 */

export const REELS_INVOER = [
  'https://vt.tiktok.com/ZSqmNv24S/',
  'https://vt.tiktok.com/ZSqmN3j62/',
  'https://vt.tiktok.com/ZSqmNsfJ4/',
  'https://vt.tiktok.com/ZSqmNscRU/',
  'https://vt.tiktok.com/ZSqmNtoXV/',
  'https://vt.tiktok.com/ZSqmNn1UC/',
  'https://vt.tiktok.com/ZSqmNbndT/',
  'https://vt.tiktok.com/ZSqmN3K6e/',
  'https://vt.tiktok.com/ZSqmNpo2Y/',
  'https://vt.tiktok.com/ZSqmFFjvr/',
  'https://vt.tiktok.com/ZSqmN7Tkv/',
  'https://vt.tiktok.com/ZSqmF1JYG/',
  'https://vt.tiktok.com/ZSqmNsyhB/',
  'https://vt.tiktok.com/ZSqmNsEeU/',
  'https://vt.tiktok.com/ZSqmFFB6C/',
  'https://vt.tiktok.com/ZSqmNxe47/',
  'https://vt.tiktok.com/ZSqmNDP9D/',
  'https://vt.tiktok.com/ZSqmNQDDG/',
  'https://vt.tiktok.com/ZSqmNXtxe/',
  'https://vt.tiktok.com/ZSqmNPt87/',
  'https://vt.tiktok.com/ZSqmN98NK/',
  'https://vt.tiktok.com/ZSqmNCktn/',
  'https://vt.tiktok.com/ZSqmNDDX7/',
  'https://vt.tiktok.com/ZSqmNxgEs/',
  'https://vt.tiktok.com/ZSqmNQ4pb/',
  'https://vt.tiktok.com/ZSqmNBXhv/',
  'https://vt.tiktok.com/ZSqmFHRrH/',
  'https://vt.tiktok.com/ZSqmFAG7U/',
  'https://vt.tiktok.com/ZSqmF6WGj/',
  'https://vt.tiktok.com/ZSqmFYpxG/',
  'https://vt.tiktok.com/ZSqmFaSnR/',
  'https://vt.tiktok.com/ZSqmF2gS3/',
  'https://vt.tiktok.com/ZSqmFMPX4/',
  'https://vt.tiktok.com/ZSqmFQmnq/',
  'https://vt.tiktok.com/ZSqmFM7Fo/',
  'https://vt.tiktok.com/ZSqmFxnRb/',
  'https://vt.tiktok.com/ZSqmFygVy/',
  'https://vt.tiktok.com/ZSqmFPBYA/',
  'https://vt.tiktok.com/ZSqmFrVX8/',
  'https://vt.tiktok.com/ZSqmFAh6Y/',
  'https://vt.tiktok.com/ZSqmFo45G/',
  'https://vt.tiktok.com/ZSqmFsfas/',
  'https://vt.tiktok.com/ZSqmFG9Xd/',
  'https://vt.tiktok.com/ZSqmYdcKQ/',
  'https://vt.tiktok.com/ZSqmYPyAK/',
  'https://vt.tiktok.com/ZSqmY8NH2/',
  'https://vt.tiktok.com/ZSqmYNSxg/',
  'https://vt.tiktok.com/ZSqmY6X8U/',
  'https://vt.tiktok.com/ZSqmYMTfc/',
  'https://vt.tiktok.com/ZSqmYMyuB/',
  'https://vt.tiktok.com/ZSqmYAPnY/',
  'https://vt.tiktok.com/ZSqmYAnBe/',
  'https://vt.tiktok.com/ZSqmYUs5x/',
  'https://vt.tiktok.com/ZSqmYhj84/',
  'https://vt.tiktok.com/ZSqmY8Rhp/',
  'https://vt.tiktok.com/ZSqmYmW6X/',
  'https://vt.tiktok.com/ZSqmYfyxV/',
  'https://vt.tiktok.com/ZSqmYjmhA/',
  'https://vt.tiktok.com/ZSqmY53xw/',
  'https://vt.tiktok.com/ZSqmYavEu/',
  'https://vt.tiktok.com/ZSqmYM4sg/',
  'https://vt.tiktok.com/ZSqmY5Vdu/',
  'https://vt.tiktok.com/ZSqmYxTxC/',
  'https://vt.tiktok.com/ZSqmYsefj/',
  'https://vt.tiktok.com/ZSqmYpES9/',
  'https://vt.tiktok.com/ZSqmY47nx/',
  'https://vt.tiktok.com/ZSqmY7B4S/',
  'https://vt.tiktok.com/ZSqmYxXwP/',
  'https://vt.tiktok.com/ZSqmYnWr5/',
  'https://vt.tiktok.com/ZSqmYTwdb/',
  'https://vt.tiktok.com/ZSqmY71mW/',
  'https://vt.tiktok.com/ZSqm2rTH8/',
  'https://vt.tiktok.com/ZSqmYEYSG/',
  'https://vt.tiktok.com/ZSqm2jvVq/',
  'https://vt.tiktok.com/ZSqm2L5SF/',
  'https://vt.tiktok.com/ZSqm2eoPU/',
  'https://vt.tiktok.com/ZSqm2NJmT/',
  'https://vt.tiktok.com/ZSqm2MKxN/',
  'https://vt.tiktok.com/ZSqm26xW4/',
  'https://vt.tiktok.com/ZSqm282Db/',
  'https://vt.tiktok.com/ZSqm2BP4A/',
  'https://vt.tiktok.com/ZSqm2UryD/',
  'https://vt.tiktok.com/ZSqm2LMS9/',
  'https://vt.tiktok.com/ZSqm2jMfP/',
  'https://vt.tiktok.com/ZSqm28BBQ/',
  'https://vt.tiktok.com/ZSqm2rV8G/',
  'https://vt.tiktok.com/ZSqm6qGFW/',
  'https://vt.tiktok.com/ZSqm6BaxP/',
  'https://vt.tiktok.com/ZSqm6BRfy/',
  'https://vt.tiktok.com/ZSqm6mYTy/',
  'https://vt.tiktok.com/ZSqm65UwC/',
  'https://vt.tiktok.com/ZSqm6mDrg/',
  'https://vt.tiktok.com/ZSqm6qb9v/',
  'https://vt.tiktok.com/ZSqm6bujg/',
  'https://vt.tiktok.com/ZSqm64rKJ/',
  'https://vt.tiktok.com/ZSqm6SMnB/',
  'https://vt.tiktok.com/ZSqm6Desw/',
  'https://vt.tiktok.com/ZSqm6CeXu/',
  'https://vt.tiktok.com/ZSqm64y8U/',
  'https://vt.tiktok.com/ZSqm6VKk4/',
  'https://vt.tiktok.com/ZSqm6Abtv/',
  'https://vt.tiktok.com/ZSqm6V5dJ/',
  'https://vt.tiktok.com/ZSqm6VBRy/',
  'https://vt.tiktok.com/ZSqm6V93p/',
  'https://vt.tiktok.com/ZSqm6X2R8/',
  'https://vt.tiktok.com/ZSqm6SvyX/',
  'https://vt.tiktok.com/ZSqm65RxU/',
  'https://vt.tiktok.com/ZSqm6wWdm/',
  'https://vt.tiktok.com/ZSqm6TyDT/',
  'https://vt.tiktok.com/ZSqm6mFrG/',
  'https://vt.tiktok.com/ZSqm6fWMF/',
  'https://vt.tiktok.com/ZSqmMLXeg/',
  'https://vt.tiktok.com/ZSqmM8bft/',
  'https://vt.tiktok.com/ZSqm6nLXu/',
  'https://vt.tiktok.com/ZSqmMRsaD/',
  'https://vt.tiktok.com/ZSqmM2aY4/',
  'https://vt.tiktok.com/ZSqmMd9nP/',
  'https://vt.tiktok.com/ZSqmMNt3R/',
  'https://vt.tiktok.com/ZSqm63WsW/',
  'https://vt.tiktok.com/ZSqm6o6vu/',
  'https://vt.tiktok.com/ZSqm63VHE/',
  'https://vt.tiktok.com/ZSqm6Ejvn/',
  'https://vt.tiktok.com/ZSqm6K2d6/',
  'https://vt.tiktok.com/ZSqmMJVBe/',
]

/* ── Die TWEEDE klomp, 13 September 2026 ──
 *
 * Dewald: *"I have now copied more links for my Reel page... But don't add it if
 * it is already on the Reel page, because I think more than half of these links
 * we already added to the Reels page. So just add those that aren't on the page
 * yet."*
 *
 * ── Waarom hierdie lys NIE teen die eerste een ontdubbel is nie ──
 *
 * Dit lyk na die voor die hand liggende ding om te doen, en dit sou 'n LEUEN
 * wees. 'n Kort skakel is nie die video se ID nie — TikTok gee 'n NUWE kort
 * skakel elke keer as 'n mens deel. Dieselfde video kan dus in albei lyste
 * staan onder twee heeltemal verskillende skakels, en geen vergelyking van
 * hierdie stringe sou dit sien nie.
 *
 * Nie een van hierdie 86 stem ooreen met een van die eerste 124 nie, en dit sê
 * presies niks oor hoeveel van hulle dieselfde VIDEOS is.
 *
 * Die enigste plek waar dit eerlik beantwoord kan word, is NA die oplos, teen
 * die post-ID — en dit staan reeds in `api/reels-voeg-by.mjs`: `bestaanAl()`
 * vra Firestore watter id's al daar is, 'n clip wat al bestaan gaan in
 * `oorgeslaan` en word NIE as nuut getel nie, en die skryf is 'n `update` met 'n
 * `updateMask` sodat sy `gedeel`-telling en sy plek in die orde bly staan.
 *
 * Die admin se verslag wys dus "Nuut" en "Was al daar" langs mekaar. Dit is die
 * getal wat sy vraag beantwoord, en dit is die enigste een wat waar kan wees.
 *
 * Dit is dus veilig om hierdie knoppie te druk, ook al is die helfte reeds daar.
 */
export const REELS_INVOER_2 = [
  'https://vt.tiktok.com/ZSqHxCETq/',
  'https://vt.tiktok.com/ZSqHxVXVW/',
  'https://vt.tiktok.com/ZSqHxyvxQ/',
  'https://vt.tiktok.com/ZSqHx2T1x/',
  'https://vt.tiktok.com/ZSqHxF1gn/',
  'https://vt.tiktok.com/ZSqHxaUK9/',
  'https://vt.tiktok.com/ZSqH93Ko5/',
  'https://vt.tiktok.com/ZSqHx1xVF/',
  'https://vt.tiktok.com/ZSqHxeJHh/',
  'https://vt.tiktok.com/ZSqH9svqB/',
  'https://vt.tiktok.com/ZSqH9bDcR/',
  'https://vt.tiktok.com/ZSqH9aRAX/',
  'https://vt.tiktok.com/ZSqH99pPN/',
  'https://vt.tiktok.com/ZSqH9fdw1/',
  'https://vt.tiktok.com/ZSqH9fXFS/',
  'https://vt.tiktok.com/ZSqH9yE3s/',
  'https://vt.tiktok.com/ZSqH9P8fB/',
  'https://vt.tiktok.com/ZSqH99WYJ/',
  'https://vt.tiktok.com/ZSqH959c2/',
  'https://vt.tiktok.com/ZSqH9agFy/',
  'https://vt.tiktok.com/ZSqH9h5Q3/',
  'https://vt.tiktok.com/ZSqH9ANX5/',
  'https://vt.tiktok.com/ZSqH9anvU/',
  'https://vt.tiktok.com/ZSqH9k3nm/',
  'https://vt.tiktok.com/ZSqH9jEf8/',
  'https://vt.tiktok.com/ZSqH9a32m/',
  'https://vt.tiktok.com/ZSqH96Rgh/',
  'https://vt.tiktok.com/ZSqH9apx8/',
  'https://vt.tiktok.com/ZSqH9j8pT/',
  'https://vt.tiktok.com/ZSqH9UhDL/',
  'https://vt.tiktok.com/ZSqH99gDh/',
  'https://vt.tiktok.com/ZSqH9QDh3/',
  'https://vt.tiktok.com/ZSqH9UpXJ/',
  'https://vt.tiktok.com/ZSqH9kQoc/',
  'https://vt.tiktok.com/ZSqH9MLRE/',
  'https://vt.tiktok.com/ZSqH9dU9H/',
  'https://vt.tiktok.com/ZSqHHbgX4/',
  'https://vt.tiktok.com/ZSqH9MKv2/',
  'https://vt.tiktok.com/ZSqHHKcdC/',
  'https://vt.tiktok.com/ZSqHHGfRJ/',
  'https://vt.tiktok.com/ZSqHHpE9g/',
  'https://vt.tiktok.com/ZSqHHcmeW/',
  'https://vt.tiktok.com/ZSqH9Jf1C/',
  'https://vt.tiktok.com/ZSqH988o5/',
  'https://vt.tiktok.com/ZSqHHbbYU/',
  'https://vt.tiktok.com/ZSqHH7m67/',
  'https://vt.tiktok.com/ZSqHHcYLK/',
  'https://vt.tiktok.com/ZSqHuhUfv/',
  'https://vt.tiktok.com/ZSqHuNYFu/',
  'https://vt.tiktok.com/ZSqHmEgW2/',
  'https://vt.tiktok.com/ZSqHuYjPb/',
  'https://vt.tiktok.com/ZSqHuktPE/',
  'https://vt.tiktok.com/ZSqHujvT9/',
  'https://vt.tiktok.com/ZSqHukkTe/',
  'https://vt.tiktok.com/ZSqHu2xSU/',
  'https://vt.tiktok.com/ZSqHmTYkS/',
  'https://vt.tiktok.com/ZSqHuhHjE/',
  'https://vt.tiktok.com/ZSqHmE5rh/',
  'https://vt.tiktok.com/ZSqHm3Twv/',
  'https://vt.tiktok.com/ZSqHuh571/',
  'https://vt.tiktok.com/ZSqHuhTem/',
  'https://vt.tiktok.com/ZSqHuhrXf/',
  'https://vt.tiktok.com/ZSqHmLhk5/',
  'https://vt.tiktok.com/ZSqHmYw6G/',
  'https://vt.tiktok.com/ZSqHmAu3P/',
  'https://vt.tiktok.com/ZSqHmN1GH/',
  'https://vt.tiktok.com/ZSqHmteGu/',
  'https://vt.tiktok.com/ZSqHmVt5J/',
  'https://vt.tiktok.com/ZSqHmP3LR/',
  'https://vt.tiktok.com/ZSqHmXQwu/',
  'https://vt.tiktok.com/ZSqHmqfmp/',
  'https://vt.tiktok.com/ZSqHmCd1U/',
  'https://vt.tiktok.com/ZSqHmpvTb/',
  'https://vt.tiktok.com/ZSqHm5a5d/',
  'https://vt.tiktok.com/ZSqHmmXer/',
  'https://vt.tiktok.com/ZSqHmsmHb/',
  'https://vt.tiktok.com/ZSqHmgtfL/',
  'https://vt.tiktok.com/ZSqHH5Dpm/',
  'https://vt.tiktok.com/ZSqHHmen4/',
  'https://vt.tiktok.com/ZSqHHqjkT/',
  'https://vt.tiktok.com/ZSqHH9NuC/',
  'https://vt.tiktok.com/ZSqHHrHta/',
  'https://vt.tiktok.com/ZSqHHQxq6/',
  'https://vt.tiktok.com/ZSqHHmqae/',
  'https://vt.tiktok.com/ZSqHHBau5/',
  'https://vt.tiktok.com/ZSqH9eww6/',
]
