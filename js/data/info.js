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
  ['Hoogste punt', 'Königstein (Brandberg), ca. 2573 m'],
  ['Kustlijn', 'ca. 1570 km langs de Atlantische Oceaan'],
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
<p><strong>Kosten (indicatie):</strong> het e-visum kost ca. <strong>N$1.600</strong> per persoon. Bij aankomst kan een hoger tarief gelden (genoemd wordt N$2.000). Een e-visum vooraf scheelt bovendien wachten in de rij bij aankomst. Print de goedkeuring en neem die mee.</p>
<p class="note">Bronnen spreken elkaar tegen over de precieze regels per land. Regels en tarieven wijzigen. Controleer altijd <em>nederlandwereldwijd.nl</em> (reisadvies Namibië) en het officiële e-visumportaal van de Namibische overheid.</p>`,
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
<li><strong>Nieuwe tarieven sinds 1 april 2026</strong> voor buitenlandse volwassenen: ca. <strong>N$280 p.p. per dag</strong> in de "premium" parken (o.a. Etosha, Namib-Naukluft/Sossusvlei, Skeleton Coast, Ai-Ais/Fish River) en ca. <strong>N$200 p.p. per dag</strong> in de overige parken (o.a. Bwabwata, Mudumu, Khaudum). Daar komt een voertuigtarief bij. Voor Sandwich Harbour geldt een aparte concessievergoeding.</li>
<li><strong>Poorttijden:</strong> de meeste parken zijn open van <strong>zonsopkomst tot zonsondergang</strong>. Je moet vóór zonsondergang in je kamp of buiten het park zijn.</li>
<li><strong>Sossusvlei:</strong> er zijn twee poorten. De buitenste poort opent bij zonsopkomst; wie binnen de poort overnacht (Sesriem Campsite, Sossus Dune Lodge) mag via de binnenste poort ca. 1 uur eerder naar de duinen. De tijden verschuiven per maand – vraag ze na bij aankomst. Koop je vergunning bij voorkeur de dag ervoor, om de rij in de ochtend te vermijden.</li>
<li><strong>Laatste 5 km naar Sossusvlei/Deadvlei:</strong> diep zand, alleen voor 4x4. Met een gewone auto parkeer je bij de 2x4-parkeerplaats en neem je de shuttle (betaald, p.p.).</li>
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

  {
    id: 'geschiedenis', icon: '📜', title: 'Geschiedenis in het kort',
    body: `
<ul>
<li><strong>Oudheid:</strong> de San (Bosjesmannen) leven al tienduizenden jaren in het gebied. Hun rotskunst – zoals in Twyfelfontein en de Brandberg – is duizenden jaren oud.</li>
<li><strong>Later:</strong> Nama, Damara, Herero, Ovambo, Kavango en andere volken vestigen zich in verschillende delen van het land.</li>
<li><strong>1486–1488:</strong> Portugese zeevaarders (Diogo Cão bij Cape Cross, Bartolomeu Dias bij Lüderitz) plaatsen stenen kruisen langs de kust.</li>
<li><strong>1884–1915:</strong> Duitse kolonie Deutsch-Südwestafrika. Vandaar de Duitse architectuur, straatnamen en bakkerijen.</li>
<li><strong>1904–1908:</strong> genocide op de Herero en Nama door de Duitse koloniale troepen. Duitsland erkende dit in 2021. Sinds 2025 is 28 mei in Namibië een nationale herdenkingsdag.</li>
<li><strong>1908:</strong> diamantvondst bij Kolmanskop; het zuiden wordt grotendeels "Sperrgebiet" (verboden gebied).</li>
<li><strong>1915–1990:</strong> bestuur door Zuid-Afrika, inclusief apartheidspolitiek. Vanaf 1966 voert SWAPO een onafhankelijkheidsstrijd.</li>
<li><strong>21 maart 1990:</strong> onafhankelijkheid. Namibië is sindsdien een stabiele democratie en was in 1990 een van de eerste landen ter wereld die natuurbescherming in de grondwet opnam.</li>
</ul>`,
  },
  {
    id: 'natuur', icon: '🌵', title: 'Landschap, klimaat & natuur',
    body: `
<p>Namibië is een van de droogste landen ten zuiden van de Sahara. Het land is grofweg op te delen in vier zones:</p>
<ul>
<li><strong>De Namib</strong> – een van de oudste woestijnen ter wereld, langs de hele kust. De koude <strong>Benguelastroom</strong> zorgt voor kustmist, die voor veel planten en dieren de belangrijkste waterbron is.</li>
<li><strong>Het centrale hoogland</strong> – rond Windhoek (ca. 1650 m), met savanne en bergen.</li>
<li><strong>De Kalahari</strong> – in het oosten: rode zandduinen met gras en kameeldoorns.</li>
<li><strong>Het noorden en noordoosten</strong> – vlakker en natter, met de rivieren Kunene, Kavango, Kwando en Zambezi.</li>
</ul>
<h3>Bijzondere planten</h3>
<ul>
<li><strong>Welwitschia mirabilis</strong> – een "levend fossiel" met maar twee bladeren die eindeloos doorgroeien; sommige exemplaren zijn meer dan 1000 jaar oud.</li>
<li><strong>Kokerboom</strong> (quiver tree) – een boomvormige aloë; de San maakten pijlkokers van de takken.</li>
<li><strong>Kameeldoorn</strong> (camelthorn) – de iconische acacia van de Kalahari en Deadvlei.</li>
<li><strong>Mopane</strong> – met vlindervormige bladeren, veel in het noorden; voedsel voor olifanten.</li>
<li><strong>Baobab</strong> – enorme bomen in het noordoosten, o.a. rond Tsumkwe.</li>
</ul>
<h3>Feeënringen (fairy circles)</h3>
<p>Kale, ronde plekken van enkele meters in het grasland van de Namib, vooral rond NamibRand en de Marienfluss. Hoe ze ontstaan is nog steeds onderwerp van wetenschappelijk debat: termieten, of gras dat concurreert om het schaarse water.</p>`,
  },
  {
    id: 'parkenlijst', icon: '🗺️', title: 'Overzicht nationale parken',
    body: `
<table class="tbl">
<tr><th>Park</th><th>Waarom gaan?</th></tr>
<tr><td><b>Etosha</b></td><td>Het wildpark van Namibië: zoutpan en waterpoelen, olifanten, leeuwen, neushoorns.</td></tr>
<tr><td><b>Namib-Naukluft</b></td><td>Sossusvlei, Deadvlei, Sesriem en de Naukluftbergen.</td></tr>
<tr><td><b>Dorob</b></td><td>De kust rond Swakopmund en Walvis Bay, met het Maanlandschap en de Welwitschia Drive.</td></tr>
<tr><td><b>Skeleton Coast</b></td><td>Desolate kust met scheepswrakken, mist en woestijnleeuwen.</td></tr>
<tr><td><b>Ai-Ais/Richtersveld</b></td><td>Fish River Canyon en de warmwaterbronnen van Ai-Ais.</td></tr>
<tr><td><b>Tsau //Khaeb (Sperrgebiet)</b></td><td>Het voormalige diamantgebied; alleen toegankelijk met een tour (o.a. naar Bogenfels).</td></tr>
<tr><td><b>Waterberg Plateau</b></td><td>Zandsteenplateau met wandelpaden en zeldzaam wild.</td></tr>
<tr><td><b>Bwabwata</b></td><td>Rivierlandschap aan de Kavango en Kwando, olifanten en buffels.</td></tr>
<tr><td><b>Nkasa Rupara</b></td><td>Moerassen en eilanden, Namibië's "mini-Okavango".</td></tr>
<tr><td><b>Mudumu</b></td><td>Rustig park aan de Kwando, sitatunga en veel vogels.</td></tr>
<tr><td><b>Khaudum</b></td><td>Ruige wildernis voor ervaren 4x4-reizigers.</td></tr>
</table>
<p class="note">Sinds 1 april 2026 gelden hogere parktarieven voor buitenlandse bezoekers (zie "Nationale parken & permits").</p>`,
  },
  {
    id: 'feestdagen', icon: '🎉', title: 'Feestdagen & evenementen',
    body: `
<h3>Nationale feestdagen 2026</h3>
<table class="tbl">
<tr><td>1 jan</td><td>Nieuwjaarsdag</td></tr>
<tr><td>21 mrt</td><td>Onafhankelijkheidsdag</td></tr>
<tr><td>3 apr</td><td>Goede Vrijdag</td></tr>
<tr><td>6 apr</td><td>Tweede Paasdag</td></tr>
<tr><td>1 mei</td><td>Dag van de Arbeid</td></tr>
<tr><td>4 mei</td><td>Cassinga-dag</td></tr>
<tr><td>14 mei</td><td>Hemelvaartsdag</td></tr>
<tr><td>25 mei</td><td>Afrikadag</td></tr>
<tr><td>28 mei</td><td>Genocide Remembrance Day (sinds 2025)</td></tr>
<tr><td>26 aug</td><td>Heldendag</td></tr>
<tr><td>10 dec</td><td>Dag van de Mensenrechten</td></tr>
<tr><td>25 dec</td><td>Kerstmis</td></tr>
<tr><td>26 dec</td><td>Familiedag</td></tr>
</table>
<p class="small">Valt een feestdag op zondag, dan is de maandag erna meestal ook vrij. Op feestdagen en in de Namibische schoolvakanties (o.a. rond Pasen en december) zijn campings en lodges extra druk, en winkels kunnen korter open zijn.</p>
<h3>Evenementen</h3>
<ul>
<li><strong>Windhoek Karneval (WIKA)</strong> – voorjaar (data wisselen per jaar).</li>
<li><strong>Herero-dag</strong> in Okahandja – eind augustus, rond 26 augustus.</li>
<li><strong>Oktoberfest</strong> – oktober in Windhoek, ook in Swakopmund.</li>
<li><strong>Bank Windhoek Arts Festival</strong> – rond februari; <strong>Enjando Street Festival</strong> in Windhoek – rond maart.</li>
</ul>
<p class="note">Datums van evenementen wisselen per jaar. Controleer altijd de actuele agenda.</p>`,
  },
  {
    id: 'grenzen', icon: '🛃', title: 'Grensovergangen & buurlanden',
    body: `
<ul>
<li><strong>Zuid-Afrika:</strong> Noordoewer/Vioolsdrif (B1, richting Kaapstad) en Ariamsvlei/Nakop (B3, richting Upington).</li>
<li><strong>Botswana:</strong> Trans-Kalahari (Buitepos/Mamuno, bij Gobabis), Mohembo (bij Divundu, richting Okavangodelta) en Ngoma Bridge (bij Katima Mulilo, richting Chobe NP).</li>
<li><strong>Zambia:</strong> Wenela/Sesheke bij Katima Mulilo (richting Victoria Falls via Livingstone).</li>
<li><strong>Angola:</strong> o.a. Oshikango/Santa Clara – voor Nederlanders gelden aparte visumregels.</li>
</ul>
<p><strong>Met een huurauto de grens over?</strong> Je hebt een schriftelijke toestemmingsbrief van de verhuurder nodig (vaak tegen betaling) en betaalt bij de grens een <em>Cross Border Charge</em>/wegenbelasting. Controleer ook de verzekering in het buurland.</p>
<p><strong>Victoria Falls</strong> (Zimbabwe/Zambia) is vanaf Katima Mulilo goed bereikbaar en wordt vaak gecombineerd met Chobe (Botswana).</p>
<p class="note">Openingstijden van grensposten verschillen (sommige alleen overdag). Controleer de actuele tijden.</p>`,
  },
  {
    id: 'kamperen', icon: '⛺', title: 'Kamperen & daktent',
    body: `
<ul>
<li>Namibië is een van de beste kampeerlanden ter wereld: campings hebben vaak een eigen plek met <strong>braai</strong> (barbecue), schaduwboom, kraan en soms een eigen sanitairblokje.</li>
<li>Veel reizigers huren een <strong>4x4 met daktent</strong>, inclusief koelkast, kookspullen en extra tank. Oefen het opzetten van de tent op de eerste dag bij daglicht.</li>
<li><strong>Boek vooruit</strong> in het hoogseizoen (jul–okt en december), vooral binnen nationale parken (Sesriem, Etosha).</li>
<li>Koop <strong>brandhout of houtskool</strong> en aanmaakblokjes bij supermarkten en tankstations. Verzamel geen hout in parken.</li>
<li>Neem altijd extra <strong>water</strong> (minimaal 20 liter) mee.</li>
<li>Het kan in de woestijn \'s nachts <strong>onder nul</strong> gaan (jun–aug): neem warme slaapzakken mee.</li>
<li>Laat <strong>geen eten</strong> buiten of in de tent liggen: jakhalzen, hyena\'s en bavianen zijn slim. Zet koelboxen in de auto.</li>
<li>Kijk 's nachts met een zaklamp om je heen voordat je naar het sanitair loopt, en sluit je tent goed.</li>
<li>Neem je afval mee ("leave no trace").</li>
</ul>`,
  },
  {
    id: 'wildtips', icon: '🔭', title: 'Tips voor wild spotten',
    body: `
<ul>
<li><strong>Vroeg en laat:</strong> dieren zijn het actiefst rond zonsopkomst en het einde van de middag. Midden op de dag rusten ze in de schaduw.</li>
<li><strong>Waterpoelen:</strong> ga in de droge tijd een uur bij een waterpoel staan in plaats van rond te rijden. Geduld wordt bijna altijd beloond.</li>
<li><strong>Let op signalen:</strong> starende of alarmroepende springbokken, cirkelende gieren of stilstaande auto\'s wijzen vaak op roofdieren.</li>
<li><strong>Langzaam rijden</strong> (20–30 km/u) en regelmatig stoppen. Scan de schaduw onder bomen.</li>
<li><strong>Verrekijker</strong> voor iedereen in de auto, en het waarnemingsboek in de kampen (sightings book) raadplegen.</li>
<li><strong>Houd afstand</strong>, zet je motor uit bij dieren dichtbij en blokkeer nooit hun weg naar het water. Bij olifanten: rustig achteruit als ze hun oren spreiden of schudden.</li>
<li><strong>Stilte:</strong> geen harde muziek of geschreeuw. Voer nooit dieren.</li>
</ul>`,
  },
  {
    id: 'fotografie', icon: '📸', title: 'Fotografietips',
    body: `
<ul>
<li><strong>Gouden uur:</strong> het zachte licht net na zonsopkomst en vlak voor zonsondergang geeft de rode duinen hun gloed.</li>
<li><strong>Lenzen:</strong> een telezoom (minimaal 300–400 mm) voor wild, een groothoek voor landschappen en sterren.</li>
<li><strong>Stof:</strong> wissel lenzen in de auto met de ramen dicht. Neem een blaasbalg en microvezeldoekjes mee.</li>
<li><strong>Vanuit de auto:</strong> een rijstzak of bonenzak op het raam werkt als stabiel statief.</li>
<li><strong>Sterren:</strong> statief, groothoek (f/2.8 of lichtsterker), 15–25 seconden, ISO 1600–6400. Plan rond nieuwe maan.</li>
<li><strong>Drones</strong> zijn in nationale parken verboden zonder vergunning. Ook elders gelden strenge regels (registratie bij de luchtvaartautoriteit).</li>
<li><strong>Mensen</strong> altijd eerst om toestemming vragen. Fotografeer geen overheidsgebouwen, politie of militairen.</li>
<li>Maak elke dag een <strong>back-up</strong> van je foto\'s, en verzamel je mooiste dierenfoto\'s in je collectieboek in deze app!</li>
</ul>`,
  },
  {
    id: 'afstanden', icon: '🛣️', title: 'Afstanden & rijtijden',
    body: `
<p>Namibië is groot en veel wegen zijn gravel. Reken op een gemiddelde snelheid van ca. 60–80 km/u inclusief stops, en plan bij voorkeur niet meer dan ca. 400–450 km per dag.</p>
<table class="tbl">
<tr><th>Route</th><th>Ca. km</th><th>Ca. rijtijd</th></tr>
<tr><td>Windhoek → Sesriem</td><td>310</td><td>4–5 u</td></tr>
<tr><td>Sesriem → Sossusvlei (parkeerplaats)</td><td>60</td><td>1 u</td></tr>
<tr><td>Sesriem → Swakopmund (via Solitaire)</td><td>350</td><td>5–6 u</td></tr>
<tr><td>Windhoek → Swakopmund</td><td>360</td><td>4 u (asfalt)</td></tr>
<tr><td>Swakopmund → Twyfelfontein</td><td>ca. 400</td><td>5–6 u</td></tr>
<tr><td>Twyfelfontein → Okaukuejo (Etosha)</td><td>ca. 300</td><td>4–5 u</td></tr>
<tr><td>Etosha → Windhoek</td><td>ca. 420–450</td><td>5 u (asfalt)</td></tr>
<tr><td>Windhoek → Fish River Canyon</td><td>ca. 700</td><td>8 u</td></tr>
</table>
<p class="note">Indicatief – de werkelijke tijd hangt af van wegdek, weer, wegwerkzaamheden en stops. De reisplanner in deze app geeft een schatting per etappe.</p>`,
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
