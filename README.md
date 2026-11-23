# 🇳🇦 Namibië Reisapp

Een persoonlijke reisapp voor Namibië: reisgids, reisdagboek en dierencollectie in één. Het is een
**Progressive Web App (PWA)**: je opent hem in de browser, zet hem op je beginscherm en daarna werkt hij **offline**.
Handig in de woestijn zonder bereik (zie *Offline gebruik* hieronder).

## Functies

- **🏠 Home**: aftellen naar je reis of "Dag 8 van 21", waar je vannacht slaapt, tip van de dag en snelle acties.
- **📔 Reisdagboek**: maak een reis aan en leg per dag verhalen vast met foto's, plaats, GPS-locatie, overnachting en gereden km.
- **🦁 Dierencollectie**: een verzamelboek met 76 Namibische diersoorten (zoogdieren, vogels, zeedieren, reptielen).
  Fotografeer een dier en het vakje kleurt in met jouw foto. Verder: zeldzaamheidssterren, weetjes, waar je het dier kunt zien, badges
  (o.a. *Grote Vijf*), meerdere waarnemingen per dier, een omslagfoto kiezen en eigen soorten toevoegen.
- **🧭 Ontdek**
  - ruim 40 bezienswaardigheden per regio, met tips, route via Google Maps, "bezocht" en een wensenlijst
  - aanbevolen accommodaties per regio (lodges, NWR-kampen, campings) met prijsindicatie
  - **Mijn boekingen**: je eigen lodges met data, boekingsnummer en telefoon, ook offline
  - supermarkten: ketens en de belangrijkste plaatsen om boodschappen te doen
  - kaart met alle plekken plus je eigen verhalen en waarnemingen (basiskaart werkt offline)
- **ℹ️ Info**: visum, geld & fooien, rijden op gravel, gezondheid & malaria, veiligheid, klimaat & beste reistijd,
  parken & permits, SIM-kaart, eten, cultuur, valuta-omrekenaar, paklijst om af te vinken, noodnummers (met je eigen contacten)
  en handige zinnetjes.
- **💾 Back-up**: exporteer en herstel al je gegevens (inclusief foto's) als één bestand.

## Offline gebruik

Open de app één keer met internet. Daarna staat alles op je toestel en werkt de app ook in de woestijn zonder bereik.
Bovenin verschijnt dan een "📴 Offline"-label.

- **Volledig offline:** dagboek, foto's, dierencollectie, reisinformatie, bezienswaardigheden, accommodaties,
  supermarkten, boekingen, paklijst, noodnummers en de **basiskaart** (landsgrenzen, plaatsen en alle bezienswaardigheden).
- **Gedetailleerde kaarttegels** die je online bekijkt worden bewaard (tot ca. 3000 tegels) en zijn later offline zichtbaar.
  Tip: zoom vóór vertrek in op de gebieden waar je heen gaat.
- **Navigeren zonder bereik:** download vooraf offline kaarten van Namibië in Google Maps, Apple Kaarten, Maps.me of
  Tracks4Africa. De knop **📍 Kaart-app** opent die app op de juiste plek.
- Onder *Info → Instellingen & back-up → Offline gebruik* zie je of de app volledig offline beschikbaar is.

## Beveiliging

De app is ontworpen zodat je persoonlijke gegevens (dagboek, foto's, boekingen, contacten, locaties) niet bij anderen terechtkomen.

| Maatregel | Wat het doet |
|---|---|
| **Geen server** | Er wordt niets naar een server gestuurd; er is geen account, tracking of analytics. |
| **App-vergrendeling** (optioneel, aanbevolen) | Wachtwoordscherm, plus versleuteling van álle gegevens en foto's met **AES-256-GCM**. De sleutel wordt afgeleid met **PBKDF2-SHA256 (600.000 iteraties)**; het wachtwoord wordt nooit opgeslagen. |
| **Automatisch vergrendelen** | Bij verlaten van de app (direct, 1, 5, 15 of 60 min) en na inactiviteit. Ontsleutelde inhoud wordt dan uit het geheugen en scherm gewist. |
| **Bescherming tegen raden** | Na 3 foute pogingen een oplopende wachttijd (tot 5 min), die ook na herladen blijft. |
| **Versleutelde back-ups** | Back-ups kunnen (standaard) met een eigen wachtwoord worden versleuteld. |
| **Strenge import-controle** | Back-ups worden veld voor veld gevalideerd; onbekende velden, ongeldige id's en niet-foto-bestanden (zoals SVG) worden geweigerd. |
| **XSS-bescherming** | Alle gegevens worden ge-escaped voordat ze op het scherm komen, plus een strikte **Content Security Policy** (geen externe of inline scripts). |
| **Clickjacking-bescherming** | De app weigert te draaien binnen een frame van een andere website. |
| **Foto-metadata verwijderd** | EXIF-gegevens (GPS-locatie, toestel, serienummer) worden bij het opslaan uit foto's gestript. |
| **Geen referrer** | Externe links (Google Maps e.d.) krijgen niet te zien vanaf welke pagina je kwam. |

**Waar je zelf op moet letten**

- Zet de **schermvergrendeling** (pincode/Face ID) van je tablet aan. Dat is de eerste verdedigingslinie.
- Kies een **sterk wachtwoord** (bijv. een korte zin). Een zwak wachtwoord kan door iemand met een kopie van de opslag offline worden geraden.
- Zet de vergrendeling **aan vóórdat je persoonlijke gegevens invoert**. Gegevens die eerder onversleuteld zijn opgeslagen, kunnen als restanten op de opslag van het toestel achterblijven.
- **Vergeten wachtwoord = gegevens weg.** Maak daarom een versleutelde back-up en bewaar het wachtwoord in een wachtwoordmanager.
- Gebruik voor **GitHub Pages** het adres `<gebruiker>.github.io` alleen voor deze app. Alle Pages-projecten van één account delen
  hetzelfde webadres en zouden elkaars opslag kunnen lezen. Met de app-vergrendeling aan blijft die opslag versleuteld.
- Een besmette (gejailbreakte/geroote) tablet of kwaadaardige browserextensie kan meekijken terwijl de app ontgrendeld is. Daar kan geen enkele web-app tegen beschermen.

## Privacy

Alles (foto's, dagboek, collectie) wordt **alleen op je eigen toestel** opgeslagen, in de IndexedDB van de browser.
Er is geen server en geen account. Maak dus regelmatig een back-up via *Info → Instellingen & back-up*.

## Gebruiken

De app bestaat alleen uit statische bestanden en hoeft niet gebouwd te worden.

**Lokaal testen**

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

**Online zetten (gratis) met GitHub Pages**

1. Ga in GitHub naar *Settings → Pages*.
2. Kies *Deploy from a branch*, selecteer de branch en map `/ (root)`.
3. Open de link op je telefoon en kies *Zet op beginscherm* (iPhone) of *App installeren* (Android).

Een PWA heeft HTTPS nodig. Dat regelt GitHub Pages automatisch.

## Structuur

```
index.html            App-shell
css/style.css         Vormgeving (licht + donker)
js/app.js             Router en alle schermen
js/db.js              Opslag (IndexedDB), foto's, back-up
js/data/animals.js    Diersoorten voor de collectie
js/data/places.js     Bezienswaardigheden, accommodaties, supermarkten
js/data/info.js       Praktische info, paklijst, noodnummers, zinnetjes
js/data/borders.js    Landsgrenzen voor de offline kaart (Natural Earth, publiek domein)
vendor/leaflet/       Kaartbibliotheek Leaflet 1.9.4 (BSD-2), lokaal voor offline gebruik
sw.js                 Service worker (offline)
```

Inhoud aanpassen of aanvullen kan direct in de bestanden in `js/data/`. Verhoog na wijzigingen `VERSION` in `sw.js`,
zodat geïnstalleerde apps de update ophalen.

> Regels zoals visumplicht, entreeprijzen en openingstijden veranderen. Controleer vlak voor vertrek altijd
> nederlandwereldwijd.nl en de officiële bronnen.
