/**
 * Cabana Fitness -> Google Sheets
 *
 * Eenmalig: plak dit in Extensions > Apps Script van een lege Google Sheet,
 * kies bovenin de functie "setup" en tik op Run. Daarna Deploy > New deployment >
 * Web app (Execute as: Me, Who has access: Anyone) en plak de Web app URL in Cabana
 * onder Data & export > Google Sheets.
 *
 * Cabana stuurt steeds al je sessies; rijen die al in het blad "Log" staan (zelfde ID)
 * worden overgeslagen, dus dubbel versturen kan geen kwaad.
 */

const LOG = "Log";
const HEAD = ["Datum", "Tijd", "Profiel", "Onderdeel", "Oefening", "Sets", "Herhalingen", "Gewicht (kg)",
  "Volume (kg)", "Geschat max (kg)", "Duur (min)", "Afstand (km)", "Kcal", "Seconden", "Notitie", "ID"];
const PROFILES = ["Patrick", "Paula"];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = ss.getSheetByName(LOG) || ss.insertSheet(LOG, 0);
  log.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight("bold").setFontColor("#ffffff").setBackground("#1b8a9a");
  log.setFrozenRows(1);
  log.getRange("A:A").setNumberFormat("d-m-yyyy");
  log.hideColumns(HEAD.length);
  PROFILES.forEach(buildProgress_);
  const first = ss.getSheets().find(s => s.getName() === "Sheet1" || s.getName() === "Blad1");
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
}

/* Blad "Progressie <naam>": zwaarste gewicht per dag, een kolom per oefening, met lijngrafiek */
function buildProgress_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const title = "Progressie " + name;
  const sh = ss.getSheetByName(title) || ss.insertSheet(title);
  sh.clear();
  sh.getCharts().forEach(c => sh.removeChart(c));
  sh.getRange("A1").setFormula(
    `=IFERROR(QUERY(${LOG}!A:P; "select A, max(H) where H > 0 and C = '${name}' group by A pivot E label A 'Datum'"; 1); "Nog geen krachttraining van ${name}")`
      .replace(/; /g, ", "));
  sh.getRange("A:A").setNumberFormat("d-m-yyyy");
  sh.getRange("1:1").setFontWeight("bold");
  sh.setFrozenRows(1);
  const chart = sh.newChart().asLineChart()
    .addRange(sh.getRange("A1:Z500"))
    .setNumHeaders(1)
    .setOption("title", "Progressie " + name + ": zwaarste gewicht per dag (kg)")
    .setOption("interpolateNulls", true)
    .setOption("pointSize", 6)
    .setOption("lineWidth", 3)
    .setOption("legend", { position: "bottom" })
    .setOption("colors", ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"])
    .setOption("vAxis", { title: "kg", gridlines: { color: "#e3e3e3" } })
    .setOption("hAxis", { format: "d MMM" })
    .setPosition(2, 13, 0, 0)
    .setOption("width", 900).setOption("height", 480)
    .build();
  sh.insertChart(chart);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let log = ss.getSheetByName(LOG);
    if (!log) { setup(); log = ss.getSheetByName(LOG); }
    const last = log.getLastRow();
    const have = new Set(last > 1 ? log.getRange(2, HEAD.length, last - 1, 1).getValues().map(r => String(r[0])) : []);
    const rows = (data.rows || []).filter(r => r.id && !have.has(String(r.id))).map(r => {
      const [y, m, d] = String(r.datum).split("-").map(Number);
      const v = (x) => (x === "" || x == null) ? "" : x;
      return [new Date(y, m - 1, d), v(r.tijd), v(r.profiel), v(r.onderdeel), v(r.oefening), v(r.sets), v(r.herhalingen),
        v(r.gewicht), v(r.volume), v(r.max), v(r.duur), v(r.afstand), v(r.kcal), v(r.seconden), v(r.notitie), String(r.id)];
    });
    if (rows.length) {
      log.getRange(last + 1, 1, rows.length, HEAD.length).setValues(rows);
      log.getRange(2, 1, log.getLastRow() - 1, HEAD.length).sort([{ column: 1, ascending: true }, { column: 2, ascending: true }]);
    }
    const removed = new Set((data.removed || []).map(String));
    if (removed.size) {
      const ids = log.getRange(2, HEAD.length, log.getLastRow() - 1, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) if (removed.has(String(ids[i][0]))) log.deleteRow(i + 2);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, added: rows.length })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/* Om te testen in de browser: de Web app URL openen laat zien dat hij werkt */
function doGet() {
  return ContentService.createTextOutput("Cabana-koppeling werkt. Plak deze URL in Cabana onder Data & export > Google Sheets.");
}
