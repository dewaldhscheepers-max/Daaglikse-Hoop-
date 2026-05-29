// ═══════════════════════════════════════════════════
//  Daaglikse Hoop — Stemnotas Importeerder
//  Plak hierdie kode in jou Google Sheet se Script-editor
//  (Uitbreidings → Apps Script)
// ═══════════════════════════════════════════════════

const DRIVE_FOLDER_ID  = '158Jma6Ca7b_kQmY5evf_uL4p_udnC9NY'
const FIREBASE_PROJECT = 'daaglikse-hoop'
const FIREBASE_API_KEY = 'AIzaSyD8fB-xYtMc9IOFGdfWIwFCsvFwb6Zj67s'
const SHEET_NAME       = 'Stemnotas'
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'aac']

// ── Voeg 'n knoppie-menu by die Spreadsheet ──────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎙️ Daaglikse Hoop')
    .addItem('📥  Importeer Nuwe Stemnotas', 'importFromDrive')
    .addSeparator()
    .addItem('🔄  Sinkroniseer na Firebase', 'syncAllToFirestore')
    .addToUi()
}

// ── Hooffunksie: Drive → Sheet → Firestore ────────────
function importFromDrive() {
  const sheet = getOrCreateSheet()
  ensureHeaders(sheet)

  const existingIds = getExistingFileIds(sheet)
  const folder      = DriveApp.getFolderById(DRIVE_FOLDER_ID)
  const files       = folder.getFiles()

  const newRows = []

  while (files.hasNext()) {
    const file = files.next()
    const name = file.getName()
    const ext  = name.split('.').pop().toLowerCase()
    if (!AUDIO_EXTENSIONS.includes(ext)) continue

    const fileId = file.getId()
    if (existingIds.has(fileId)) continue

    // Maak seker die lêer is publiek toeganklik
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW) }
    catch (e) { /* folder-level sharing is fine */ }

    const title      = name.replace(/\.[^/.]+$/, '').trim()
    const audioUrl   = `https://drive.google.com/uc?id=${fileId}&export=download`
    const publishedAt = file.getDateCreated().toISOString()

    newRows.push([title, audioUrl, fileId, publishedAt, '', '', '', ''])
  }

  if (newRows.length === 0) {
    SpreadsheetApp.getUi().alert('✅ Geen nuwe stemnotas gevind nie — alles is al op datum.')
    return
  }

  // Sorteer nuwer eerste
  newRows.sort((a, b) => new Date(b[3]) - new Date(a[3]))
  newRows.forEach(row => sheet.appendRow(row))

  // Sinkroniseer nuwe rye na Firestore
  syncAllToFirestore()

  SpreadsheetApp.getUi().alert(
    `✅ ${newRows.length} nuwe stemnotas bygevoeg en na Firebase gesinkroniseer!`
  )
}

// ── Sinkroniseer alle rye van die Sheet na Firestore ──
function syncAllToFirestore() {
  const sheet   = getOrCreateSheet()
  const data    = sheet.getDataRange().getValues()
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('Geen data om te sinkroniseer nie.')
    return
  }

  let synced = 0
  let errors = 0

  for (let i = 1; i < data.length; i++) {
    const [title, audioUrl, fileId, publishedAt, series, scripture, scriptureText, color] = data[i]
    if (!fileId) continue

    const result = firestoreWrite('notes', String(fileId), {
      title:          String(title || ''),
      audioUrl:       String(audioUrl || ''),
      fileId:         String(fileId),
      publishedAt:    new Date(publishedAt || Date.now()),
      series:         String(series || ''),
      scripture:      String(scripture || ''),
      scriptureText:  String(scriptureText || ''),
      color:          String(color || ''),
      lengthSeconds:  0
    })

    if (result.error) {
      Logger.log(`❌ Firestore fout vir ${fileId}: ${JSON.stringify(result.error)}`)
      errors++
    } else {
      synced++
    }
  }

  Logger.log(`✅ ${synced} gesinkroniseer, ${errors} foute`)
  if (errors === 0) {
    SpreadsheetApp.getUi().alert(`✅ ${synced} stemnotas suksesvol na Firebase gesinkroniseer!`)
  } else {
    SpreadsheetApp.getUi().alert(`⚠️ ${synced} gesinkroniseer, ${errors} foute — kyk Logs vir besonderhede.`)
  }
}

// ── Firestore REST API skryffunksie ───────────────────
function firestoreWrite(collection, docId, data) {
  const url = [
    'https://firestore.googleapis.com/v1/projects/',
    FIREBASE_PROJECT,
    '/databases/(default)/documents/',
    collection, '/',
    encodeURIComponent(docId),
    '?key=', FIREBASE_API_KEY
  ].join('')

  const fields = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string')
      fields[key] = { stringValue: value }
    else if (typeof value === 'number')
      fields[key] = { integerValue: String(Math.round(value)) }
    else if (typeof value === 'boolean')
      fields[key] = { booleanValue: value }
    else if (value instanceof Date)
      fields[key] = { timestampValue: value.toISOString() }
  }

  const response = UrlFetchApp.fetch(url, {
    method:      'PATCH',
    contentType: 'application/json',
    payload:     JSON.stringify({ fields }),
    muteHttpExceptions: true
  })

  return JSON.parse(response.getContentText())
}

// ── Sheet hulpfunksies ────────────────────────────────
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'title', 'audioUrl', 'fileId', 'publishedAt',
      'series', 'scripture', 'scriptureText', 'color'
    ])
    sheet.getRange(1, 1, 1, 8)
      .setFontWeight('bold')
      .setBackground('#f3f3f3')
    sheet.setFrozenRows(1)
    sheet.setColumnWidth(1, 220) // title
    sheet.setColumnWidth(2, 320) // audioUrl
    sheet.setColumnWidth(4, 160) // publishedAt
    sheet.setColumnWidth(6, 160) // scripture
    sheet.setColumnWidth(7, 200) // scriptureText
  }
}

function getExistingFileIds(sheet) {
  const ids     = new Set()
  const lastRow = sheet.getLastRow()
  if (lastRow <= 1) return ids
  sheet.getRange(2, 3, lastRow - 1, 1).getValues()
    .forEach(([id]) => { if (id) ids.add(String(id)) })
  return ids
}
