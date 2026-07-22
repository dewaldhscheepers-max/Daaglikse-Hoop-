// Static manifest for 5 Afrikaans children's picture books
// Image assets live at /books/[id]/ — 00-cover.png + numbered pages

function makeBook(id, title, description, extraSlugs) {
  const defaultSlugs = ['00-cover', '01', '02', '03', '04', '05', '06', '07', '08', '09']
  const slugs = extraSlugs || defaultSlugs
  return {
    id,
    title,
    description,
    ageRange: '2–5 jaar',
    audio: null,
    cover: `/books/${id}/00-cover.png`,
    thumb: `/books/${id}/00-cover.png`,
    pages: slugs.map(s => `/books/${id}/${s}.png`),
  }
}

export const KINDER_BOEKE = [
  makeBook(
    'die-donker-is-nie-te-sterk-nie',
    'Die donker is nie te sterk nie',
    'Help kinders om nie bang te wees vir die donker nie — want God se lig is altyd sterker.'
  ),
  makeBook(
    'foutjies-help-my-groei',
    'Foutjies help my groei',
    'Leer kinders dat foutjies deel van groei is — God gebruik selfs ons foutjies.'
  ),
  makeBook(
    'my-woorde-is-saadjies',
    'My woorde is saadjies',
    'Wys kinders dat woorde krag het — goeie woorde plant hoop en lewe.'
  ),
  makeBook(
    'wanneer-my-gevoelens-te-groot-word',
    'Wanneer my gevoelens te groot word',
    "Help kinders om groot emosies op 'n eenvoudige manier te verstaan en rustig te raak."
  ),
  makeBook(
    'lelike-woorde-is-nie-die-waarheid-nie',
    'Lelike woorde is nie die waarheid nie',
    'Herinner kinders dat slegte woorde wat ander sê nie die waarheid oor hulle is nie.',
    ['00-cover', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']
  ),
]
