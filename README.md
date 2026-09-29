# Cabana Fitness

Statische PWA (HTML, CSS, JavaScript), geen build-stap en geen server nodig.

## Bestanden
- `index.html` – de app (alles in één bestand), klaar om te hosten
- `app.html` – dezelfde app zonder `<head>`, gebruikt voor de Claude-preview
- `img/` – foto's van de instructieborden per toestel (moet mee op de host)
- `manifest.webmanifest`, `sw.js`, `icon*.png`, `icon.svg` – maken hem installeerbaar en offline bruikbaar

## Op de iPhone als echte app
1. Zet deze map op een https-host (bijv. GitHub Pages of Netlify Drop: sleep de map erin).
2. Open de link in Safari → Deel → "Zet op beginscherm".
3. Daarna start hij schermvullend en werkt hij ook zonder wifi.

## Data
- Opslag: `localStorage` op de iPhone, sleutel `cabana.v1`, gescheiden per profiel (Patrick / Paula).
- Export: knop rechtsboven → CSV (komma of puntkomma voor Excel NL) of volledige JSON-back-up.
- CSV-kolommen: datum, tijd, profiel, module, oefening, sets, herhalingen, gewicht_kg, volume_kg, seconden,
  pullup_stap, duur_min, afstand_km, kcal_toestel, niveau, watch_actieve_kcal, watch_totaal_kcal,
  hartslag_gem, hartslag_max, zithoogte, rugleuning, instelling_overig, foto, bron, notities, id.

## Fase 1.5: glas-look
- Hoofdmenu-tegels in "liquid glass"-stijl boven een strand-zonsondergang (donkere modus: schemering).
- Vier zelf getekende illustraties (inline SVG in `app.html`, object `ILL`): werken offline, geen licenties.
- Tikken: tegel veert in, lichtgolf vanaf je vinger, korte trilling, daarna pas naar het scherm.

## Aannames fase 1
- Pull-up stappen: A = negatieven (3×5), B = met band (3×8), C = volledig (3×5).
- Toestellen: de 14 Matrix-toestellen van Cabana (van de foto's), elk met de instellingen die op het bord staan.
- Gewichtsstapels: standaard 4,5 · 11 · 18 · 25 kg … (15 lbs-stappen), Arm Curl / Lateral Raise / Kabelstation 4,5 · 9 · 14 · 18 kg … (10 lbs), per toestel aan te passen.
- Progressie-voorstel: bij 15 herhalingen gehaald → één plaatje zwaarder (vrije gewichten +2,5 kg) en terug naar 8 herhalingen.
- OCR van het Matrix-scherm: foto wordt nu bewaard bij de sessie, uitlezen volgt in fase 2.

## Fase 2: Apple Gezondheid en Obsidian
- **Apple Gezondheid**: een website kan niet zelf in HealthKit schrijven. De app geeft de krachttraining van een dag als JSON
  door aan de opdracht **"Cabana naar Gezondheid"** (app Opdrachten) via `shortcuts://run-shortcut`. Die opdracht legt met
  "Registreer training" (Log Workout) een workout Traditionele krachttraining vast: starttijd, duur en actieve kcal.
  Sets, herhalingen en gewichten kan Gezondheid niet opslaan; ze gaan mee als `samenvatting`.
  Knop op het dashboard (training van vandaag) en scherm "Apple Gezondheid" via Data & export. De stappen om de opdracht
  te maken staan in dat scherm. Cardio telt niet mee: die registreert de Apple Watch zelf.
  JSON-sleutels: app, profiel, type, start ("jjjj-mm-dd uu:mm"), minuten, kcal, oefeningen, volume_kg, samenvatting.
  Duur = eerste log − 10 min tot laatste log (min. 15), kcal-schatting 5 per minuut; beide aan te passen.
- **Obsidian**: Logboek (één notitie: YAML-properties, progressietabel per oefening, dagboek met tabellen) of
  Vault-map (zip): `Cabana/<naam>/Dagen/<datum> <naam>.md` en `Cabana/<naam>/Oefeningen/<oefening> · <naam>.md`,
  aan elkaar gelinkt met [[links]], plus `Cabana overzicht.md` met een Dataview-query.
- **JSON voor AI**: sessies en toestelinstellingen per persoon, zonder foto's en lege velden.
- CSV: `datum` is nu de lokale datum (was UTC, waardoor late sessies op de verkeerde dag konden vallen).

## Fase 3: toestel-foto's en Trainingsprogramma's
- Toestelscherm: de foto van het instructiebord staat meteen groot bovenaan, met je eigen instellingen erop en de stappen eronder. Tik = volledig scherm (lightbox).
- 5e tegel **Trainingsprogramma's** (brede tegel, atlete met halter, `ILL.programs`). Schema's in `PROGRAMS`:
  Boring But Big (5/3/1, 4 dagen), Matrix Circuit (A/B, 3 dagen), Push · Pull · Benen (3 dagen). Elke oefening met foto, instellingen en een Log-knop
  die het toestelscherm opent met sets, herhalingen en gewicht ingevuld; daarna terug naar het schema met ✓.
- BBB-gewichten: trainingsmax = 90% van de geschatte 1RM (Epley) uit je beste set van de laatste 20 logs op dat toestel, afgerond op de echte gewichtsstapel.
  Met + en − zelf bij te stellen. Hulpoefeningen: laatste gewicht, of één plaatje zwaarder na 15 herhalingen.
- Opslag per profiel: `prog` (actief schema, week, dag, eigen trainingsmax). Sessies uit een schema krijgen `prog` en de schemanaam in `notities`, `bron` = schema.

## Bewegende figuren
- Alle vijf tegelfiguren bewegen met een korte CSS-lus die bij de sport past (rennen, trekken, drukken, rekken, tillen). Onderdelen zitten in `<g class="a-…">` in `ILL`; uit bij 'Beweging beperken' op de iPhone.

## Achtergrond
- Standaard de strandfoto `img/beach.jpg` (540 × 360, van Norman), met een lichte waas voor leesbaarheid en een donkere waas in donkere modus.
- Terug naar de getekende zonsondergang: Data & export → Achtergrond. Opgeslagen als `bg` in `cabana.v1`.
