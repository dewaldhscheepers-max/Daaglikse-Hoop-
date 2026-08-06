/* Loop met:  node src/data/sorgVideos.toets.mjs

   Die geplakte lys. Die toets gebruik Dewald se EGTE veertien reëls, presies
   soos hulle uit WhatsApp kom — met die `?si=`-stert, die emoji, die dubbele
   spasies en die oop reëls tussenin. */

import { ontleedPlak, isVideoSkakel } from './sorgVideos.js'

let reg = 0, val = 0
function is(naam, kry, wag) {
  if (JSON.stringify(kry) === JSON.stringify(wag)) reg++
  else { val++; console.log(`  VAL  ${naam}\n         kry: ${JSON.stringify(kry)}\n         wag: ${JSON.stringify(wag)}`) }
}

const PLAK = `Slegte Geselskap Bederf Jou Stadig‼️
https://youtube.com/shorts/zJFAjk0qIV8?si=81ys3radTZUBE49g

4 Dinge wat vergifnis nie beteken nie🔥‼️
https://youtu.be/yGDuxCjp3mo?si=pu6FhBXxsL7jVVUo

God sien jou moegheid
https://youtube.com/shorts/IYnJA3wEz-U?si=R_wlF-dgVfy3kkbi


3 Dinge wat jy moet doen wanneer negatiewe gedagtes jou aanval🔥‼️
https://youtube.com/shorts/KEM6abSArz4?si=X4I6cJEImu3nHC9x

3 Dinge wat jy moet doen wanneer Angstige gedagtes jou vrede steel🔥‼️
https://youtube.com/shorts/juTrF6JpFAU?si=EeftDmbHGVhzAPwZ

4 Dinge wat jou finansies en perspektief kan verander
https://youtu.be/-NpYynbRid8?si=XQro-mVC78nRowqp

3 Dinge wanneer  verwerping  jou laat voel jy is nie goed genoeg nie
https://youtu.be/bMrdcumqico?si=zW88v9hXnTEF2JcY

3 Dinge wat jy moet doen as daar geestelike aanvalle op jou huwelik en jou gesin is 🔥‼️
https://youtube.com/shorts/qZBUNcY3o54?si=FuRWTppj1eaHCc0O

5 Dinge wat jy moet weet oor rustelose gedagtes🔥‼️
https://youtu.be/fkMWJ6Zgm7A?si=NzdOWn2ecCipWlmf


4 Dinge wanneer die vyand jou kinders aanval🙏🏻‼️
https://youtube.com/shorts/dFukBqH0A_k?si=OjiJ0xPTIRL5lGw1

As iemand  jou bitter seergemaak het🙏🏻‼️
https://youtu.be/65IuFvTwir4?si=B56H07uYv_rr1THq

As jy voel jy het te veel verloor om weer op te staan🙏🏻🔥‼️
https://youtube.com/shorts/8CbMCUVzHeE?si=rSEBKfqzX4cw5D0j

As familie jou seermaak🙏🏻‼️
https://youtube.com/shorts/-9B10wMTlIA?si=DDg3OTgY_TumAeng

Wanneer  jou gedagtes jou wakker hou🔥🙏🏻‼️
https://youtube.com/shorts/1YSaNpP6Wrs?si=-MBQCricUZ8hM8N-`

const uit = ontleedPlak(PLAK)

console.log('\n── Die egte plak ──')
is('al veertien kom deur', uit.length, 14)
is('nie een sonder titel nie', uit.filter(x => !x.titel).length, 0)
is('nie een sonder skakel nie', uit.filter(x => !x.skakel).length, 0)

/* Die volgorde is die hele punt van hierdie versoek: die eerste een moet
   onder wees, die laaste bo. Die ontleder moet dus die PLAK-volgorde
   behou; die bediener draai dit later om. */
is('eerste bly eerste', uit[0].titel, 'Slegte Geselskap Bederf Jou Stadig‼️')
is('laaste bly laaste',  uit[13].titel, 'Wanneer  jou gedagtes jou wakker hou🔥🙏🏻‼️')

is('titel en skakel pas bymekaar', uit[5], {
  skakel: 'https://youtu.be/-NpYynbRid8?si=XQro-mVC78nRowqp',
  titel:  '4 Dinge wat jou finansies en perspektief kan verander',
})

/* Twee oop reëls agtermekaar mag nie 'n titel laat wegval nie. */
is('twee oop reels breek niks', uit[3].titel, '3 Dinge wat jy moet doen wanneer negatiewe gedagtes jou aanval🔥‼️')

console.log('\n── Wat as ’n skakel tel ──')
is('shorts',        isVideoSkakel('https://youtube.com/shorts/abc123'), true)
is('youtu.be',      isVideoSkakel('https://youtu.be/abc123'), true)
is('gewone watch',  isVideoSkakel('https://www.youtube.com/watch?v=abc123'), true)

/* Die slaggat. `haalVideoId` aanvaar 'n kaal id — enige 6-20 letters — en
   'n titel van EEN woord pas presies daardie patroon. Sou die ontleder dit
   as 'n skakel gelees het, sou "Vergifnis" 'n video geword het en die egte
   skakel daaronder sou sy titel geword het. */
is('een-woord-titel is NIE ’n skakel', isVideoSkakel('Vergifnis'), false)
is('gewone titel ook nie',             isVideoSkakel('God sien jou moegheid'), false)

console.log('\n── Ander maniere waarop mense plak ──')
is('titel en skakel op EEN reel', ontleedPlak('My titel — https://youtu.be/abc123'), [
  { skakel: 'https://youtu.be/abc123', titel: 'My titel' },
])
is('net skakels, geen titels', ontleedPlak('https://youtu.be/abc123\nhttps://youtu.be/def456'), [
  { skakel: 'https://youtu.be/abc123', titel: '' },
  { skakel: 'https://youtu.be/def456', titel: '' },
])
/* Twee titels agtermekaar: die naaste een wen. Die ander was 'n kopstuk. */
is('twee titels, die naaste wen', ontleedPlak('Sondag se lot\nRegte titel\nhttps://youtu.be/abc123'), [
  { skakel: 'https://youtu.be/abc123', titel: 'Regte titel' },
])
is('leeg gee leeg', ontleedPlak(''), [])
is('net gemors gee leeg', ontleedPlak('hallo\nwereld'), [])

console.log(`\n${reg} reg, ${val} vals\n`)
process.exit(val ? 1 : 0)
