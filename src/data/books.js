// Book catalogue — update pdfUrl values once PDFs are uploaded to Firebase Storage
export const BOOKS = [
  // ── Paid books ──────────────────────────────────────────────
  {
    id: 'bid-nou',
    title: 'BID NOU',
    desc: '100 kort gebede vir oomblikke wanneer jou gedagtes raas, jou hart swaar is en jy nie weet wat om vir God te sê nie.',
    price: 105,
    free: false,
    color: '#EDE8F8',
    emoji: '🙏'
  },
  {
    id: 'narsistiese-verhoudings',
    title: 'Narsistiese Verhoudings',
    desc: 'Hoe om te herken, te herstel en jouself terug te kry.',
    price: 105,
    free: false,
    color: '#F3E8F8',
    emoji: '💜'
  },
  {
    id: 'wen-die-oorlog',
    title: 'Wen die Oorlog in Jou Gedagtes',
    desc: "Heeltemal herskryf met nuwe hoofstukke, onvertelde stories en 'n verbeterde 40-dae denkvernuwing. Nie dieselfde boek nie — 100× beter.",
    price: 105,
    free: false,
    color: '#E8EDF8',
    emoji: '⚔️'
  },
  {
    id: 'die-duiwel-is-n-leuenaar',
    title: "Die Duiwel is 'n Leuenaar",
    desc: "Ontmasker die vyand se strategie en kry jou vrede terug.",
    price: 100,
    free: false,
    color: '#F8EDE8',
    emoji: '🔥'
  },
  {
    id: 'wanneer-mense-jou-seermaak',
    title: 'Wanneer Mense Jou Seermaak',
    desc: "'n Kragtige 7-dae dagstukreeks om jou hart te genees ná verraad, teleurstelling en seer.",
    price: 50,
    free: false,
    color: '#F8E8EE',
    emoji: '💛'
  },
  {
    id: 'toksies',
    title: 'TOKSIES',
    desc: 'Hoe om ontslae te raak van wat jou lewe vergiftig: toksiese mense, gedagtes, plekke en gewoontes.',
    price: 50,
    free: false,
    color: '#E8F8EC',
    emoji: '🌿'
  },
  {
    id: 'deursoek-my',
    title: 'Deursoek my · Breek my · Stuur my',
    desc: "'n Kragtige mini-reeks oor gevaarlike gebede wat jou hart oopbreek.",
    price: 30,
    free: false,
    color: '#FDF4E7',
    emoji: '✝️'
  },
  {
    id: 'angs-detox',
    title: 'Angs Detox',
    desc: "'n Kragtige 7-dag geestelike reis vir mense wat moeg is vir konstante angs en innerlike onrus.",
    price: 30,
    free: false,
    color: '#E8F4F8',
    emoji: '🕊️'
  },
  {
    id: 'wanneer-angs-toeslaan',
    title: 'Wanneer Angs Toeslaan',
    desc: "'n Kragtige kort e-boek om vrede te vind wanneer vrees en bekommernis oorweldig.",
    price: 30,
    free: false,
    color: '#F8F0E8',
    emoji: '🌅'
  },
  {
    id: 'dink-nuut-leef-nuut',
    title: 'Dink Nuut, Leef Nuut',
    desc: "'n Kragtige e-boek wat jou help om jou gedagtes te vernuwe en jou lewe te transformeer.",
    price: 30,
    free: false,
    color: '#EEF8E8',
    emoji: '🌱'
  },
  {
    id: 'verander-jou-hart',
    title: 'Verander Jou Hart',
    desc: "'n Kragtige e-boek oor innerlike genesing, vergifnis en geestelike herstel.",
    price: 30,
    free: false,
    color: '#F8E8EC',
    emoji: '❤️'
  },
  {
    id: 'as-alles-wegval',
    title: 'As Alles Wegval (Job)',
    desc: "'n Kragtige 7-hoofstuk PDF oor Job — van pyn en stilte na hoop en herstel.",
    price: 30,
    free: false,
    color: '#F0EBE8',
    emoji: '📖'
  },
  // ── Free books ──────────────────────────────────────────────
  {
    id: '7-leuens',
    title: '7 Leuens van die Duiwel & 7 Waarhede van God',
    desc: "Herken die vyand se stem en kies die Here se waarheid.",
    price: 0,
    free: true,
    pdfUrl: null, // Add Firebase Storage URL when PDF is uploaded
    color: '#E8F0F8',
    emoji: '📘'
  },
  {
    id: 'bybel-hulpbron',
    title: 'Die Bybel Maklik Gemaak',
    desc: "Verstaan die groot prent van die Bybel. Met Bybelstudie-vrae, antwoorde en sertifikaat. Perfek vir selgroepe en huisbybelstudie.",
    price: 0,
    free: true,
    pdfUrl: null, // Add Firebase Storage URL when PDF is uploaded
    color: '#F0F8E8',
    emoji: '📗'
  }
]
