/* ── Waar die clips vandaan kom ──
 *
 * Die voer lees `reels` uit Firestore, presies soos Luister sy notas lees:
 * EEN `getDocs` met 'n tydgrens, uit die kas geverf terwyl dit laai, en nooit
 * 'n antwoord aanvaar wat kleiner is as wat ons reeds het nie. Sien die kop van
 * `Reels.jsx` vir waarom dit nie 'n `onSnapshot` is nie.
 *
 * Hierdie lêer is die SAAI: die clips wat in die kode staan totdat daar iets in
 * Firestore is. Dit is nie 'n terugval vir 'n netwerkfout nie — dit is sodat
 * die oortjie nooit leeg is nie. 'n Leë voer is 'n stukkende app.
 *
 * ── Die vorm van 'n clip ──
 *
 *   id          die id in die skakel: /reels/<id>. Kort en blywend.
 *   bron        'tiktok' | 'youtube' | 'eie'
 *   bronId      TikTok se post-ID, YouTube se video-ID
 *   naam        WIE dit gemaak het. Sonder hierdie veld wys die clip glad nie
 *               — sien `magWys()` in reels.js. Erkenning is 'n hek.
 *   handvatsel  '@iets', opsioneel, net vir die oog
 *   woorde      die sin onderaan
 *   eie         is dit Daaglikse Hoop se eie? Net dan mag daar 'n brug wees
 *   gebeurtenis + brug   die knoppie terug na die app se eie inhoud
 *
 * ── Wat hier NIE inkom nie ──
 *
 * Geen `<script>`, geen rou HTML, geen adres wat die speler kan volg. 'n Clip
 * is 'n paar velde; die speler word uit `bron` gekies. Word dit ooit 'n veld
 * met 'n URL in, is dit die dag wanneer 'n vreemde bediener se bladsy binne
 * hierdie app oopmaak.
 */

export const REELS_SAAI = [
  {
    id: 'dh-1',
    bron: 'youtube',
    /* Dieselfde video wat reeds op die blad staan (public/featured-video.json).
       Dit is met opset 'n bestaande, egte video en nie 'n versinde id nie: 'n
       id wat nie bestaan nie, is 'n swart blok wat soos 'n stukkende speler
       lyk. */
    bronId: '109Y_ZAwDFc',
    naam: 'Daaglikse Hoop',
    handvatsel: '@daagliksehoop',
    woorde: 'Jy hoef nie vandag alles te verstaan nie. Jy moet net opstaan en die eerste ding doen.',
    eie: true,
    gebeurtenis: 'gaan-luister',
    brug: 'Luister die volle boodskap',
  },
]
