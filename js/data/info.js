// Praktische informatie over Namibië. Regels (visum, prijzen) kunnen wijzigen:
// controleer altijd de actuele situatie vlak voor vertrek.

export const FACTS = [
  ['Hoofdstad', 'Windhoek'],
  ['Inwoners', 'ca. 3 miljoen (een van de dunst bevolkte landen ter wereld)'],
  ['Oppervlakte', 'ca. 825.000 km² (ca. 20× Nederland)'],
  ['Onafhankelijk', '21 maart 1990'],
  ['Officiële taal', 'Engels; daarnaast o.a. Oshiwambo, Afrikaans, Otjiherero, Khoekhoegowab (Nama/Damara), Duits'],
  ['Munt', 'Namibische dollar (NAD, N$) – 1:1 gekoppeld aan de Zuid-Afrikaanse rand (ZAR); rand wordt overal geaccepteerd'],
  ['Tijdzone', 'CAT, UTC+2 (geen zomertijd). In de Europese zomer gelijk aan Nederland, in de winter 1 uur later'],
  ['Stroom', '220–230 V, stekkertype D en M (grote ronde pinnen, zoals Zuid-Afrika). Neem een wereldstekker mee'],
  ['Verkeer', 'Links rijden'],
  ['Landnummer', '+264'],
];

export const SECTIONS = [
  {
    id: 'visum', icon: '🛂', title: 'Visum & inreis',
    body: `
<p>Sinds <strong>1 april 2025</strong> hebben Nederlanders en Belgen <strong>een visum nodig</strong> voor toeristische reizen naar Namibië. Dit kan via een <strong>e-visum</strong> (vooraf online aanvragen, aanbevolen) of als <strong>visum bij aankomst</strong> op o.a. Hosea Kutako International Airport.</p>
<ul>
<li>Paspoort minimaal <strong>6 maanden geldig</strong> na vertrek uit Namibië, met minimaal 2–3 lege pagina's.</li>
<li>Houd je retourticket, accommodatieadressen en eventueel bewijs van voldoende middelen bij de hand.</li>
<li>Reis je door Zuid-Afrika of Botswana: controleer ook die regels.</li>
<li>Reis je met minderjarigen: neem een (internationaal) uittreksel geboorteakte en toestemmingsverklaringen mee.</li>
</ul>
<p class="note">Regels en tarieven wijzigen. Controleer altijd <em>nederlandwereldwijd.nl</em> (reisadvies Namibië) en het officiële e-visumportaal van de Namibische overheid.</p>`,
  },
  {
    id: 'geld', icon: '💵', title: 'Geld & betalen',
    body: `
<ul>
<li>Betaal met de <strong>Namibische dollar (N$)</strong> of de <strong>Zuid-Afrikaanse rand</strong> (1:1). Wisselgeld krijg je vaak in N$ – die kun je buiten Namibië niet gebruiken, dus geef die als laatste uit.</li>
<li><strong>Creditcards</strong> (Visa, Mastercard) worden breed geaccepteerd in steden en lodges. Maestro/V-Pay werken niet altijd: neem een creditcard mee.</li>
<li><strong>Tanken</strong> kan steeds vaker met kaart, maar heb altijd <strong>contant geld</strong> bij je – soms werkt het pinapparaat niet.</li>
<li><strong>Geldautomaten (ATM)</strong> vind je in alle grotere plaatsen (FNB, Standard Bank, Bank Windhoek, Nedbank). Pin bij voorkeur overdag en binnen in een winkelcentrum.</li>
<li>Contant handig voor: parkentree, campings, fooien, tankstationbedienden, souvenirs langs de weg.</li>
</ul>`,
  },
  {
    id: 'fooi', icon: '🤝', title: 'Fooien',
    body: `
<ul>
<li><strong>Restaurant:</strong> ca. 10% bij goede service.</li>
<li><strong>Tankstation:</strong> bedienden tanken voor je, wassen de ruiten en controleren bandenspanning – N$ 5–10 is gebruikelijk.</li>
<li><strong>Parkeerwachters</strong> in steden: N$ 5–10.</li>
<li><strong>Safarigids / ranger:</strong> ca. N$ 100–200 per persoon per dag (meer bij uitstekende service).</li>
<li><strong>Lodge-personeel:</strong> vaak is er een fooienpot voor al het personeel bij de receptie.</li>
</ul>`,
  },
  {
    id: 'rijden', icon: '🚙', title: 'Rijden in Namibië',
    body: `
<p>De meeste reizigers verkennen Namibië met een (4x4-)huurauto. Het wegennet is goed, maar het grootste deel is <strong>gravel</strong>.</p>
<ul>
<li><strong>Links rijden</strong>, gordels verplicht, rijbewijs altijd bij je. Een <strong>internationaal rijbewijs</strong> wordt aanbevolen (verkrijgbaar bij de ANWB).</li>
<li><strong>Snelheid:</strong> max. 120 km/u op asfalt, <strong>80 km/u op gravel</strong> (en houd je daar écht aan), 60 km/u in de bebouwde kom en 60 km/u in Etosha.</li>
<li><strong>Gravelwegen</strong> zijn verraderlijk: losse stenen, zandbanken, wasbordpatronen. Rem niet hard in bochten en vertraag bij tegenliggers (stof en opspattende stenen).</li>
<li><strong>Rijd nooit in het donker</strong>: wild, vee en voetgangers op de weg zijn de grootste oorzaak van ongelukken.</li>
<li><strong>Tank vol</strong> waar het kan. Afstanden tussen tankstations kunnen 200–300 km zijn.</li>
<li>Controleer dagelijks de <strong>banden</strong> en neem bij voorkeur 2 reservebanden mee. Leer vooraf hoe je een band wisselt.</li>
<li>Neem altijd extra drinkwater mee (minimaal 5 liter per persoon in de auto).</li>
<li>Bij politiecontroles: blijf vriendelijk, houd rijbewijs en huurcontract bij de hand.</li>
<li><strong>Grensoverschrijding</strong> met een huurauto? Vraag vooraf een toestemmingsbrief van het verhuurbedrijf en betaal de grensbelasting (Cross Border Charge).</li>
</ul>`,
  },
  {
    id: 'gezondheid', icon: '⚕️', title: 'Gezondheid',
    body: `
<ul>
<li><strong>Malaria:</strong> risico vooral in het noorden en noordoosten (Kunene-rivier, Kavango, Zambezi-regio) en in mindere mate in/rond Etosha, met name in het regenseizoen (nov–jun). Overleg met de GGD of je huisarts over malariatabletten.</li>
<li><strong>Vaccinaties:</strong> laat je adviseren door de GGD (o.a. DTP, hepatitis A). Een <strong>gelekoortsbewijs</strong> is verplicht als je via een gelekoortsland reist.</li>
<li><strong>Zon & hitte:</strong> zonnebrand (SPF 50), hoed, zonnebril en veel drinken. In de woestijn droog je snel uit.</li>
<li><strong>Kraanwater</strong> is in steden en de meeste lodges drinkbaar, maar op afgelegen plekken kun je beter flessenwater nemen.</li>
<li><strong>Medische zorg:</strong> goede privéklinieken in Windhoek, Swakopmund en Walvis Bay. Op het platteland is zorg beperkt – sluit een goede reisverzekering af die repatriëring dekt.</li>
<li>Neem een EHBO-set mee met o.a. pleisters, ORS, pijnstillers, antihistaminica en DEET.</li>
</ul>`,
  },
  {
    id: 'veiligheid', icon: '🛡️', title: 'Veiligheid',
    body: `
<ul>
<li>Namibië is een van de veiligste landen van Afrika, maar kleine criminaliteit komt voor in steden.</li>
<li>Laat nooit waardevolle spullen zichtbaar in de auto liggen. Parkeer bij bewaakte parkeerplaatsen.</li>
<li>Loop in Windhoek \'s avonds niet alleen; neem een taxi die je lodge/hotel voor je regelt.</li>
<li>Kopieer je paspoort en bewaar een digitale kopie.</li>
<li><strong>Wilde dieren:</strong> blijf in de auto in wildparken, houd afstand van olifanten en nijlpaarden, en voer nooit dieren (ook geen bavianen of jakhalzen op de camping).</li>
<li>Controleer schoenen en kleding op schorpioenen voordat je ze aantrekt.</li>
</ul>`,
  },
  {
    id: 'klimaat', icon: '☀️', title: 'Klimaat & beste reistijd',
    body: `
<table class="tbl">
<tr><th>Periode</th><th>Seizoen</th><th>Kenmerken</th></tr>
<tr><td>mei – okt</td><td>Droog / winter</td><td>Beste tijd voor wild (dieren bij de waterpoelen). Overdag 20–30°C, \'s nachts in de woestijn tot onder 0°C (juni–aug)!</td></tr>
<tr><td>sep – okt</td><td>Droog & warm</td><td>Topwildzicht maar het wordt heet, tot 35°C+.</td></tr>
<tr><td>nov – apr</td><td>Regentijd / zomer</td><td>Heet (30–40°C), onweersbuien in de middag in het noorden en midden. Groen landschap, jonge dieren, veel trekvogels. Rivieren kunnen onbegaanbaar zijn.</td></tr>
</table>
<p>De <strong>kust</strong> (Swakopmund, Walvis Bay, Lüderitz) is het hele jaar koel (15–20°C) en vaak mistig door de koude Benguelastroom.</p>
<p><strong>Inpaktip:</strong> uien-principe! Warme fleece en muts voor vroege game drives en woestijnnachten, korte broek voor overdag.</p>`,
  },
  {
    id: 'parken', icon: '🏞️', title: 'Nationale parken & permits',
    body: `
<ul>
<li><strong>Entreegeld</strong> betaal je bij de poort of in het kantoor (bijv. Okaukuejo of Sesriem): per persoon per dag + per voertuig per dag. Houd contant of een creditcard bij de hand.</li>
<li><strong>Poorttijden:</strong> de meeste parken zijn open van <strong>zonsopkomst tot zonsondergang</strong>. Je moet vóór zonsondergang in je kamp of buiten het park zijn.</li>
<li><strong>Sossusvlei:</strong> wie binnen de poort overnacht (Sesriem Campsite, Sossus Dune Lodge) mag ca. 1 uur vóór zonsopkomst naar de duinen; de buitenste poort opent later.</li>
<li><strong>Etosha:</strong> drie hoofdpoorten (Andersson in het zuiden, Von Lindequist in het oosten, Galton in het westen) plus de King Nehale Gate in het noorden. Overnachten binnen het park kan in de NWR-kampen.</li>
<li>Kampen van <strong>Namibia Wildlife Resorts (NWR)</strong> zijn in het hoogseizoen (jul–okt) vaak maanden vooruit volgeboekt. Boek ruim van tevoren!</li>
<li>Voor sommige gebieden (bijv. Welwitschia Drive, Sandwich Harbour, Fish River-hike) heb je een aparte <strong>permit</strong> nodig.</li>
<li>Drones zijn in nationale parken niet toegestaan zonder vergunning.</li>
</ul>`,
  },
  {
    id: 'internet', icon: '📶', title: 'Telefoon & internet',
    body: `
<ul>
<li>Koop een lokale <strong>SIM-kaart</strong> (of eSIM) van <strong>MTC</strong> (beste dekking) of <strong>Paratus</strong>, bijvoorbeeld op het vliegveld of in een winkelcentrum. Je moet je paspoort laten zien voor registratie.</li>
<li>Bijladen ("airtime"/databundels) kan in supermarkten en tankstations.</li>
<li>Buiten steden en hoofdwegen is er vaak <strong>geen bereik</strong>. Download offline kaarten (Google Maps, Maps.me, Tracks4Africa) vóórdat je vertrekt.</li>
<li>Veel lodges hebben wifi, maar die is soms traag of alleen bij de receptie.</li>
<li><strong>Deze app werkt offline</strong>: je collectie en dagboek kun je overal bijhouden.</li>
</ul>`,
  },
  {
    id: 'eten', icon: '🍖', title: 'Eten & drinken',
    body: `
<ul>
<li><strong>Braai</strong> (barbecue) is een nationale traditie. Houtskool en hout koop je bij elke supermarkt of tankstation.</li>
<li>Probeer <strong>wildvlees</strong>: oryx (gemsbok), koedoe, springbok, eland – vaak op het menu in lodges.</li>
<li><strong>Biltong</strong> (gedroogd vlees) en <strong>droëwors</strong>: perfecte snack voor onderweg.</li>
<li><strong>Kapana</strong>: gegrilde reepjes rundvlees op straatmarkten (o.a. Single Quarters in Katutura, Windhoek).</li>
<li>Bier: Namibië brouwt volgens het Duitse Reinheitsgebot – probeer <strong>Windhoek Lager</strong> of <strong>Tafel Lager</strong>.</li>
<li>Oesters uit Walvis Bay en Lüderitz zijn wereldberoemd.</li>
<li>Apfelstrudel in Swakopmund en appeltaart in Solitaire – de Duitse invloed proef je overal.</li>
<li>Let op: alcoholverkoop in winkels is op zondagen en avonden beperkt.</li>
</ul>`,
  },
  {
    id: 'cultuur', icon: '🌍', title: 'Cultuur & etiquette',
    body: `
<ul>
<li>Namibië kent veel volken: Ovambo (grootste groep), Herero, Himba, Damara, Nama, San, Kavango, Caprivianen, Baster, en een Duitse en Afrikaanse gemeenschap.</li>
<li><strong>Vraag altijd toestemming</strong> voordat je mensen fotografeert.</li>
<li>Groet mensen eerst voordat je iets vraagt – een kort praatje is beleefd.</li>
<li>Herero-vrouwen dragen opvallende Victoriaanse jurken en "koeienhoorn"-hoofddeksels, een erfenis van de koloniale tijd.</li>
<li>Geschiedenis: Duitse kolonie (1884–1915), daarna onder Zuid-Afrikaans bestuur tot de onafhankelijkheid in 1990. De genocide op de Herero en Nama (1904–1908) is een gevoelig onderwerp.</li>
</ul>`,
  },
];

export const EMERGENCY = [
  { label: 'Politie (Nampol)', number: '10111', note: 'Landelijk alarmnummer politie' },
  { label: 'Alarmnummer via mobiel', number: '112', note: 'Werkt via de meeste mobiele netwerken' },
  { label: 'BZ 24/7 Contactcenter', number: '+31247247247', display: '+31 247 247 247', note: 'Ministerie van Buitenlandse Zaken – hulp voor Nederlanders in het buitenland' },
];
export const EMERGENCY_NOTE = 'Noteer hieronder ook de noodnummers van je autoverhuurder, reisverzekering en (private) medische hulpdienst – die werken op het platteland vaak sneller dan openbare diensten. Nederland heeft geen eigen ambassade in Namibië; de ambassade in Pretoria (Zuid-Afrika) is bevoegd. Controleer altijd de actuele gegevens op nederlandwereldwijd.nl.';

export const PHRASES = [
  { lang: 'Afrikaans', items: [['Goedemorgen', 'Goeiemôre'], ['Hoe gaat het?', 'Hoe gaan dit?'], ['Dank je wel', 'Baie dankie'], ['Alsjeblieft', 'Asseblief'], ['Ja / Nee', 'Ja / Nee'], ['Hoeveel kost het?', 'Hoeveel kos dit?'], ['Proost!', 'Gesondheid!']] },
  { lang: 'Oshiwambo', items: [['Goedemorgen', 'Wa lalapo'], ['Goedemiddag', 'Wa uhala po'], ['Dank je wel', 'Tangi (unene)'], ['Ja / Nee', 'Eeno / Aaye']] },
  { lang: 'Otjiherero', items: [['Hallo / goedemorgen', 'Moro'], ['Dank je wel', 'Okuhepa']] },
  { lang: 'Engels (handig)', items: [['Ik sta vast met de auto', 'My car is stuck'], ['Lekke band', 'Flat tyre'], ['Vol tanken a.u.b.', 'Fill it up, please'], ['Waar is de dichtstbijzijnde garage?', 'Where is the nearest garage?'], ['"Now now" / "just now"', '= straks… of veel later 😉']] },
];

export const PACKING = [
  { group: 'Documenten', items: ['Paspoort (6+ mnd geldig, lege pagina\'s)', 'Visum / e-visum bevestiging', 'Rijbewijs + internationaal rijbewijs', 'Creditcard (geen alleen-Maestro)', 'Reisverzekering (polis + noodnummer)', 'Kopieën van documenten', 'Boekingsbevestigingen'] },
  { group: 'Kleding', items: ['Warme fleece / jas (woestijnnachten!)', 'Muts & sjaal voor vroege game drives', 'Korte broeken & T-shirts', 'Lange broek & lange mouwen (muggen)', 'Stevige wandelschoenen', 'Slippers / sandalen', 'Zonnehoed / pet', 'Zwemkleding', 'Neutrale kleuren voor safari (beige, groen)'] },
  { group: 'Gezondheid', items: ['Zonnebrand SPF 50', 'Lippenbalsem met SPF', 'DEET / muggenspray', 'Malariatabletten (indien nodig)', 'EHBO-set', 'ORS (rehydratie)', 'Persoonlijke medicijnen', 'Oogdruppels (stof)'] },
  { group: 'Techniek & foto', items: ['Camera + telezoomlens', 'Extra geheugenkaarten', 'Extra accu\'s', 'Powerbank', 'Wereldstekker (type D/M)', 'Autolader 12V / USB', 'Verrekijker', 'Hoofdlamp / zaklamp', 'Offline kaarten gedownload', 'Stofdichte zak voor camera'] },
  { group: 'Onderweg', items: ['Herbruikbare waterflessen', 'Koelbox (vaak bij huurauto)', 'Zakmes / multitool', 'Vuilniszakken', 'Natte doekjes', 'Snacks / biltong', 'Contant geld (N$/ZAR)'] },
];

export const TIPS = [
  'Rijd nooit in het donker – wild en vee op de weg zijn het grootste gevaar.',
  'Tank vol bij elk tankstation dat je tegenkomt in afgelegen gebieden.',
  'De beste dierenfoto\'s maak je in het gouden uur: vlak na zonsopkomst en vlak voor zonsondergang.',
  'Ga in Etosha een uur bij een waterpoel staan. Geduld wordt bijna altijd beloond.',
  'Neem altijd meer water mee dan je denkt nodig te hebben.',
  'Download offline kaarten – buiten de steden is er vaak geen bereik.',
  'Houd 80 km/u aan op gravel. Klapbanden en slippen gebeuren vaker dan je denkt.',
  'Woestijnnachten kunnen in de winter onder nul gaan. Pak een warme jas in!',
  'Begroet mensen altijd eerst met een "Hello, how are you?" voordat je iets vraagt.',
  'Vraag toestemming voordat je mensen fotografeert.',
  'Kijk \'s nachts omhoog: Namibië heeft een van de donkerste sterrenhemels ter wereld.',
  'Laat bij tankstations de bediende de bandenspanning controleren – en geef een kleine fooi.',
];
