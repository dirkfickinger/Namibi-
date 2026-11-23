// Dieren die je in Namibië kunt tegenkomen.
// zeldzaamheid: 1 = algemeen, 2 = regelmatig, 3 = zeldzaam / geluk nodig
export const CATEGORIES = [
  { id: 'big', name: 'Grote vijf & grote zoogdieren' },
  { id: 'roof', name: 'Roofdieren' },
  { id: 'hoef', name: 'Antilopen & hoefdieren' },
  { id: 'klein', name: 'Kleine zoogdieren' },
  { id: 'zee', name: 'Kust & zee' },
  { id: 'vogel', name: 'Vogels' },
  { id: 'reptiel', name: 'Reptielen & overig' },
];

export const ANIMALS = [
  // Grote zoogdieren
  { id: 'olifant', cat: 'big', emoji: '🐘', name: 'Afrikaanse olifant', sci: 'Loxodonta africana', rarity: 1, where: 'Etosha, Zambezi-regio, Damaraland (woestijnolifanten)', fact: 'In Damaraland en Kunene leven woestijnolifanten die dagen zonder water kunnen en enorme afstanden lopen.' },
  { id: 'leeuw', cat: 'big', emoji: '🦁', name: 'Leeuw', sci: 'Panthera leo', rarity: 2, where: 'Etosha, Skeleton Coast (woestijnleeuwen), Bwabwata', fact: 'De woestijnleeuwen van de Skeleton Coast jagen soms zelfs op zeehonden en aalscholvers.' },
  { id: 'luipaard', cat: 'big', emoji: '🐆', name: 'Luipaard', sci: 'Panthera pardus', rarity: 3, where: 'Okonjima, Etosha, Waterberg', fact: 'Namibië heeft een van de grootste luipaardpopulaties ter wereld, maar ze zijn meesters in verstoppen.' },
  { id: 'zwarteneushoorn', cat: 'big', emoji: '🦏', name: 'Zwarte neushoorn', sci: 'Diceros bicornis', rarity: 2, where: 'Etosha (waterpoel Okaukuejo bij nacht), Damaraland', fact: 'Namibië heeft de grootste vrij levende populatie zwarte neushoorns ter wereld. Te herkennen aan de puntige bovenlip.' },
  { id: 'wittenneushoorn', cat: 'big', emoji: '🦏', name: 'Witte neushoorn', sci: 'Ceratotherium simum', rarity: 3, where: 'Waterberg, private reservaten', fact: '"Wit" komt waarschijnlijk van het Afrikaanse "wyd" (breed), naar de brede mond waarmee hij gras graast.' },
  { id: 'buffel', cat: 'big', emoji: '🐃', name: 'Kaapse buffel', sci: 'Syncerus caffer', rarity: 2, where: 'Zambezi-regio (Bwabwata, Mudumu, Nkasa Rupara), Waterberg', fact: 'In Etosha komen geen buffels voor; daarvoor moet je naar het noordoosten.' },
  { id: 'giraf', cat: 'big', emoji: '🦒', name: 'Giraf', sci: 'Giraffa giraffa angolensis', rarity: 1, where: 'Etosha, Damaraland, Kalahari', fact: 'De Angolese giraf heeft lichtere vlekken die tot onder de knieën doorlopen.' },
  { id: 'nijlpaard', cat: 'big', emoji: '🦛', name: 'Nijlpaard', sci: 'Hippopotamus amphibius', rarity: 2, where: 'Kavango- en Zambezirivier, Nkasa Rupara', fact: 'Een nijlpaard kan op land sneller rennen dan een mens. Houd altijd afstand.' },
  { id: 'burchellzebra', cat: 'big', emoji: '🦓', name: 'Steppezebra', sci: 'Equus quagga', rarity: 1, where: 'Etosha, Kalahari', fact: 'Steppezebra\'s hebben vaak vage "schaduwstrepen" tussen de zwarte strepen.' },
  { id: 'bergzebra', cat: 'big', emoji: '🦓', name: 'Hartmann-bergzebra', sci: 'Equus zebra hartmannae', rarity: 2, where: 'Naukluft, Damaraland, westelijk Etosha (Dolomite)', fact: 'Herkenbaar aan het "barcodepatroon" op het achterwerk en een huidplooi (keelkwab) aan de hals.' },

  // Roofdieren
  { id: 'jachtluipaard', cat: 'roof', emoji: '🐆', name: 'Jachtluipaard (cheetah)', sci: 'Acinonyx jubatus', rarity: 2, where: 'Okonjima / AfriCat, Etosha, boerderijen in centraal Namibië', fact: 'Namibië wordt de "cheetah-hoofdstad van de wereld" genoemd.' },
  { id: 'gevlektehyena', cat: 'roof', emoji: '🐺', name: 'Gevlekte hyena', sci: 'Crocuta crocuta', rarity: 2, where: 'Etosha (vaak \'s nachts bij de waterpoel)', fact: 'Een zeer succesvolle jager – geen pure aaseter zoals vaak gedacht.' },
  { id: 'bruinehyena', cat: 'roof', emoji: '🐺', name: 'Bruine hyena (strandwolf)', sci: 'Parahyaena brunnea', rarity: 3, where: 'Kust bij Lüderitz en Skeleton Coast, Etosha', fact: 'Langs de kust leeft hij van aangespoeld zeeleven en jonge zeehonden.' },
  { id: 'jakhals', cat: 'roof', emoji: '🦊', name: 'Zadeljakhals', sci: 'Lupulella mesomelas', rarity: 1, where: 'Overal: Etosha, Cape Cross, Namib', fact: 'Bij Cape Cross patrouilleren jakhalzen tussen de zeehonden op zoek naar zwakke pups.' },
  { id: 'lakenhond', cat: 'roof', emoji: '🐕', name: 'Wilde hond', sci: 'Lycaon pictus', rarity: 3, where: 'Zambezi-regio, Khaudum', fact: 'Een van de meest bedreigde roofdieren van Afrika; zeer succesvolle jagers in roedels.' },
  { id: 'lostoor', cat: 'roof', emoji: '🦊', name: 'Lepelhond (bat-eared fox)', sci: 'Otocyon megalotis', rarity: 2, where: 'Kalahari, Etosha, Namib', fact: 'Met zijn enorme oren hoort hij termieten onder de grond lopen.' },
  { id: 'kaapsevos', cat: 'roof', emoji: '🦊', name: 'Kaapse vos', sci: 'Vulpes chama', rarity: 3, where: 'Kalahari, zuidelijk Namibië', fact: 'De enige echte vos van zuidelijk Afrika; vooral actief in de schemering.' },
  { id: 'karakal', cat: 'roof', emoji: '🐈', name: 'Karakal', sci: 'Caracal caracal', rarity: 3, where: 'Droge gebieden door het hele land', fact: 'Kan uit stand meters hoog springen om vogels uit de lucht te slaan.' },
  { id: 'aardwolf', cat: 'roof', emoji: '🐺', name: 'Aardwolf', sci: 'Proteles cristata', rarity: 3, where: 'Kalahari, Etosha (\'s nachts)', fact: 'Eet vrijwel alleen termieten – tot wel 250.000 per nacht.' },
  { id: 'stokstaartje', cat: 'roof', emoji: '🦦', name: 'Stokstaartje', sci: 'Suricata suricatta', rarity: 2, where: 'Kalahari, zuidelijk Namibië', fact: 'Er staat altijd één schildwacht op wacht terwijl de rest voedsel zoekt.' },
  { id: 'mangoest', cat: 'roof', emoji: '🦦', name: 'Gestreepte mangoest', sci: 'Mungos mungo', rarity: 1, where: 'Etosha, Waterberg, noorden', fact: 'Leeft in groepen tot wel 40 dieren en zoekt samen naar insecten.' },
  { id: 'honingdas', cat: 'roof', emoji: '🦡', name: 'Honingdas', sci: 'Mellivora capensis', rarity: 3, where: 'Etosha, Kalahari', fact: 'Bekend als het meest onverschrokken dier: valt zelfs leeuwen en cobra\'s aan.' },

  // Hoefdieren
  { id: 'gemsbok', cat: 'hoef', emoji: '🦌', name: 'Gemsbok (oryx)', sci: 'Oryx gazella', rarity: 1, where: 'Sossusvlei, Kalahari, Etosha', fact: 'Het nationale dier van Namibië – staat op het wapen. Kan zijn lichaamstemperatuur laten oplopen om water te sparen.' },
  { id: 'springbok', cat: 'hoef', emoji: '🦌', name: 'Springbok', sci: 'Antidorcas marsupialis', rarity: 1, where: 'Etosha, Namib, Kalahari', fact: 'Maakt hoge sprongen met gekromde rug ("pronken") – waarschijnlijk om roofdieren te laten zien hoe fit hij is.' },
  { id: 'koedoe', cat: 'hoef', emoji: '🦌', name: 'Grote koedoe', sci: 'Tragelaphus strepsiceros', rarity: 1, where: 'Etosha, Waterberg, Damaraland', fact: 'Mannetjes hebben prachtige spiraalvormige hoorns van wel 1,5 meter.' },
  { id: 'dikdik', cat: 'hoef', emoji: '🦌', name: 'Damara-dikdik', sci: 'Madoqua kirkii', rarity: 2, where: 'Etosha (Namutoni), Waterberg', fact: 'Een van de kleinste antilopen, ca. 40 cm hoog. Leeft in vaste paartjes.' },
  { id: 'impala', cat: 'hoef', emoji: '🦌', name: 'Zwartsnuitimpala', sci: 'Aepyceros melampus petersi', rarity: 2, where: 'Etosha (oosten), Kunene', fact: 'De zwartsnuitimpala komt alleen in Namibië en zuidwest-Angola voor.' },
  { id: 'gnoe', cat: 'hoef', emoji: '🐃', name: 'Blauwe gnoe', sci: 'Connochaetes taurinus', rarity: 1, where: 'Etosha, Kalahari', fact: 'Gnoes en zebra\'s trekken vaak samen op: ze vullen elkaar aan in waakzaamheid.' },
  { id: 'hartebeest', cat: 'hoef', emoji: '🦌', name: 'Rode hartenbeest', sci: 'Alcelaphus buselaphus caama', rarity: 2, where: 'Etosha, Kalahari', fact: 'Ondanks zijn wat lompe uiterlijk een van de snelste antilopen.' },
  { id: 'elandantilope', cat: 'hoef', emoji: '🐂', name: 'Elandantilope', sci: 'Taurotragus oryx', rarity: 2, where: 'Etosha, Waterberg', fact: 'De grootste antilope ter wereld – kan toch over 2 meter hoge hekken springen.' },
  { id: 'steenbok', cat: 'hoef', emoji: '🦌', name: 'Steenbokje', sci: 'Raphicerus campestris', rarity: 1, where: 'Overal in open savanne', fact: 'Drinkt bijna nooit: haalt vocht uit bladeren en wortels.' },
  { id: 'klipspringer', cat: 'hoef', emoji: '🐐', name: 'Klipspringer', sci: 'Oreotragus oreotragus', rarity: 2, where: 'Rotsgebieden: Naukluft, Spitzkoppe, Fish River Canyon', fact: 'Loopt op de punten van zijn hoeven, als een ballerina op de rotsen.' },
  { id: 'wrattenzwijn', cat: 'hoef', emoji: '🐗', name: 'Wrattenzwijn', sci: 'Phacochoerus africanus', rarity: 1, where: 'Etosha, Waterberg, lodges', fact: 'Rent met de staart recht omhoog, zodat de jongen de groep kunnen volgen in het hoge gras.' },
  { id: 'roanantilope', cat: 'hoef', emoji: '🐂', name: 'Paardantilope (roan)', sci: 'Hippotragus equinus', rarity: 3, where: 'Waterberg, Khaudum, Zambezi', fact: 'Een van de grootste antilopen, met opvallende zwart-witte "masker"-kop.' },
  { id: 'sabelantilope', cat: 'hoef', emoji: '🐂', name: 'Sabelantilope', sci: 'Hippotragus niger', rarity: 3, where: 'Waterberg, Bwabwata', fact: 'Mannetjes zijn glanzend zwart met lange, naar achter gebogen hoorns.' },
  { id: 'letsjwe', cat: 'hoef', emoji: '🦌', name: 'Rode lechwe', sci: 'Kobus leche', rarity: 2, where: 'Zambezi-regio, moerassen', fact: 'Langere achterpoten helpen hem snel door ondiep water te rennen.' },

  // Kleine zoogdieren
  { id: 'bavianen', cat: 'klein', emoji: '🐒', name: 'Beerbaviaan', sci: 'Papio ursinus', rarity: 1, where: 'Naukluft, Fish River Canyon, Waterberg', fact: 'Let op je eten: bavianen zijn slim en openen zelfs autodeuren.' },
  { id: 'meerkatvervet', cat: 'klein', emoji: '🐒', name: 'Groene meerkat (vervet)', sci: 'Chlorocebus pygerythrus', rarity: 2, where: 'Noorden en Zambezi-regio', fact: 'Heeft verschillende alarmroepen voor arenden, slangen en luipaarden.' },
  { id: 'klipdas', cat: 'klein', emoji: '🐹', name: 'Klipdas', sci: 'Procavia capensis', rarity: 1, where: 'Rotsgebieden overal', fact: 'Verrassend genoeg is de olifant een van zijn naaste verwanten.' },
  { id: 'grondeekhoorn', cat: 'klein', emoji: '🐿️', name: 'Kaapse grondeekhoorn', sci: 'Xerus inauris', rarity: 1, where: 'Kalahari, Etosha, campings', fact: 'Gebruikt zijn pluimstaart als parasol tegen de zon.' },
  { id: 'springhaas', cat: 'klein', emoji: '🐇', name: 'Springhaas', sci: 'Pedetes capensis', rarity: 2, where: 'Kalahari, Etosha (\'s nachts)', fact: 'Geen haas maar een knaagdier dat springt als een mini-kangoeroe.' },
  { id: 'stekelvarken', cat: 'klein', emoji: '🦔', name: 'Kaapse stekelvarken', sci: 'Hystrix africaeaustralis', rarity: 3, where: 'Overal, \'s nachts', fact: 'Het grootste knaagdier van Afrika; stekels tot 50 cm lang.' },
  { id: 'aardvarken', cat: 'klein', emoji: '🐽', name: 'Aardvarken', sci: 'Orycteropus afer', rarity: 3, where: 'Kalahari, centrale savanne (\'s nachts)', fact: 'Zijn holen worden later door tientallen andere diersoorten gebruikt.' },
  { id: 'schubdier', cat: 'klein', emoji: '🦔', name: 'Steppeschubdier', sci: 'Smutsia temminckii', rarity: 3, where: 'Kalahari, centraal Namibië', fact: 'Het meest gesmokkelde zoogdier ter wereld. Een waarneming is een enorme geluksvogel-moment.' },

  // Kust & zee
  { id: 'pelsrob', cat: 'zee', emoji: '🦭', name: 'Kaapse pelsrob', sci: 'Arctocephalus pusillus', rarity: 1, where: 'Cape Cross, Pelican Point (Walvis Bay)', fact: 'Bij Cape Cross leven tot wel 100.000 pelsrobben – je ruikt ze eerder dan je ze ziet.' },
  { id: 'heavisidedolfijn', cat: 'zee', emoji: '🐬', name: 'Heaviside-dolfijn', sci: 'Cephalorhynchus heavisidii', rarity: 2, where: 'Walvis Bay, Lüderitz (boottocht)', fact: 'Komt alleen voor langs de kust van Namibië en westelijk Zuid-Afrika.' },
  { id: 'tuimelaar', cat: 'zee', emoji: '🐬', name: 'Tuimelaar', sci: 'Tursiops truncatus', rarity: 2, where: 'Walvis Bay, Swakopmund', fact: 'Zwemt vaak mee met de catamarans in de lagune van Walvis Bay.' },
  { id: 'bultrug', cat: 'zee', emoji: '🐋', name: 'Bultrug', sci: 'Megaptera novaeangliae', rarity: 3, where: 'Voor de kust bij Walvis Bay en Lüderitz (ca. jul–nov)', fact: 'Trekt langs de kust op weg naar en van de warmere kraamgebieden.' },
  { id: 'zonnevis', cat: 'zee', emoji: '🐟', name: 'Maanvis (mola mola)', sci: 'Mola mola', rarity: 3, where: 'Walvis Bay (boottocht)', fact: 'De zwaarste beenvis ter wereld; zonnebaadt soms aan het wateroppervlak.' },
  { id: 'lederschildpad', cat: 'zee', emoji: '🐢', name: 'Lederschildpad', sci: 'Dermochelys coriacea', rarity: 3, where: 'Walvis Bay (zeldzaam)', fact: 'De grootste schildpad ter wereld – kan meer dan 600 kg wegen.' },

  // Vogels
  { id: 'flamingo', cat: 'vogel', emoji: '🦩', name: 'Flamingo', sci: 'Phoenicopterus roseus / Phoeniconaias minor', rarity: 1, where: 'Lagune van Walvis Bay, Etosha-pan (na regen)', fact: 'In Walvis Bay zie je zowel de grote als de kleine flamingo.' },
  { id: 'pelikaan', cat: 'vogel', emoji: '🦢', name: 'Roze pelikaan', sci: 'Pelecanus onocrotalus', rarity: 1, where: 'Walvis Bay', fact: 'Op de boottochten in Walvis Bay landen pelikanen soms gewoon op de boot.' },
  { id: 'struisvogel', cat: 'vogel', emoji: '🐦', name: 'Struisvogel', sci: 'Struthio camelus', rarity: 1, where: 'Etosha, Namib, Kalahari', fact: 'De grootste vogel ter wereld; loopt tot 70 km/u.' },
  { id: 'koritrap', cat: 'vogel', emoji: '🐦', name: 'Koritrap', sci: 'Ardeotis kori', rarity: 2, where: 'Etosha', fact: 'Een van de zwaarste vogels die kunnen vliegen.' },
  { id: 'secretarisvogel', cat: 'vogel', emoji: '🐦', name: 'Secretarisvogel', sci: 'Sagittarius serpentarius', rarity: 2, where: 'Etosha, open savanne', fact: 'Doodt slangen door er met zijn poten op te stampen.' },
  { id: 'gier', cat: 'vogel', emoji: '🦅', name: 'Witruggier', sci: 'Gyps africanus', rarity: 2, where: 'Etosha, Waterberg', fact: 'Bij de Waterberg leeft ook de zeldzame Kaapse gier.' },
  { id: 'schreeuwarend', cat: 'vogel', emoji: '🦅', name: 'Afrikaanse zeearend', sci: 'Haliaeetus vocifer', rarity: 2, where: 'Kavango, Zambezi', fact: 'Zijn roep wordt "de stem van Afrika" genoemd.' },
  { id: 'bateleur', cat: 'vogel', emoji: '🦅', name: 'Bateleur (goochelaar)', sci: 'Terathopius ecaudatus', rarity: 2, where: 'Etosha, noorden', fact: 'Heeft een opvallend kort staartje en kantelt in de vlucht als een koorddanser.' },
  { id: 'gewondeuil', cat: 'vogel', emoji: '🦉', name: 'Verreaux\' oehoe', sci: 'Ketupa lactea', rarity: 3, where: 'Etosha, bomen bij waterpoelen', fact: 'Herkenbaar aan zijn roze oogleden.' },
  { id: 'gelekandelaar', cat: 'vogel', emoji: '🐦', name: 'Monteiro\'s tok (neushoornvogel)', sci: 'Tockus monteiri', rarity: 2, where: 'Damaraland, Kunene, Erongo', fact: 'Een bijna-endeem van Namibië; vrouwtjes metselen zich in een boomholte in om te broeden.' },
  { id: 'geelsnaveltok', cat: 'vogel', emoji: '🐦', name: 'Zuidelijke geelsnaveltok', sci: 'Tockus leucomelas', rarity: 1, where: 'Etosha, Waterberg, lodges', fact: 'De "vliegende banaan" – vaak tam rond lodges en picknickplaatsen.' },
  { id: 'wevervogel', cat: 'vogel', emoji: '🐦', name: 'Republikeinwever', sci: 'Philetairus socius', rarity: 1, where: 'Kalahari, zuiden, Sossusvlei-gebied', fact: 'Bouwt reusachtige gemeenschapsnesten met honderden bewoners – zichtbaar in bomen en op elektriciteitspalen.' },
  { id: 'scharrelaar', cat: 'vogel', emoji: '🐦', name: 'Vorkstaartscharrelaar (lilac-breasted roller)', sci: 'Coracias caudatus', rarity: 1, where: 'Etosha, noorden', fact: 'Een van de kleurrijkste vogels van de savanne.' },
  { id: 'duinleeuwerik', cat: 'vogel', emoji: '🐦', name: 'Namib-duinleeuwerik', sci: 'Calendulauda erythrochlamys', rarity: 3, where: 'Duinen rond Sossusvlei en Gobabeb', fact: 'De enige vogelsoort die alleen in Namibië voorkomt (endemisch).' },
  { id: 'kraanvogel', cat: 'vogel', emoji: '🐦', name: 'Blauwe kraanvogel', sci: 'Grus paradisea', rarity: 3, where: 'Etosha (o.a. Andoni)', fact: 'In Etosha leeft een kleine, geïsoleerde populatie.' },
  { id: 'pinguin', cat: 'vogel', emoji: '🐧', name: 'Afrikaanse pinguïn', sci: 'Spheniscus demersus', rarity: 3, where: 'Halifax Island bij Lüderitz (boottocht)', fact: 'Een bedreigde soort; bij Lüderitz broeden ze op eilandjes voor de kust.' },
  { id: 'parelhoen', cat: 'vogel', emoji: '🐓', name: 'Helmparelhoen', sci: 'Numida meleagris', rarity: 1, where: 'Overal', fact: 'Groepen parelhoenders steken vaak luidruchtig de weg over.' },

  // Reptielen & overig
  { id: 'krokodil', cat: 'reptiel', emoji: '🐊', name: 'Nijlkrokodil', sci: 'Crocodylus niloticus', rarity: 2, where: 'Kavango, Kunene (Epupa), Zambezi', fact: 'Zwem nooit in de rivieren in het noorden.' },
  { id: 'kameleon', cat: 'reptiel', emoji: '🦎', name: 'Namaqua-kameleon', sci: 'Chamaeleo namaquensis', rarity: 3, where: 'Namib bij Swakopmund (Living Desert-tour)', fact: 'Een woestijnkameleon die op de grond leeft en zelfs kevers en schorpioenen eet.' },
  { id: 'gekko', cat: 'reptiel', emoji: '🦎', name: 'Webvoetgekko', sci: 'Pachydactylus rangei', rarity: 3, where: 'Duinen bij Swakopmund', fact: 'Doorschijnende huid en zwemvliezen om over zand te "zwemmen".' },
  { id: 'sidewinder', cat: 'reptiel', emoji: '🐍', name: 'Peringuey-adder', sci: 'Bitis peringueyi', rarity: 3, where: 'Namib-duinen', fact: 'Beweegt zijwaarts over het zand en heeft de ogen bovenop de kop.' },
  { id: 'schildpad', cat: 'reptiel', emoji: '🐢', name: 'Panterschildpad', sci: 'Stigmochelys pardalis', rarity: 2, where: 'Savanne, langs wegen', fact: 'De grootste landschildpad van zuidelijk Afrika.' },
  { id: 'varaan', cat: 'reptiel', emoji: '🦎', name: 'Steppevaraan', sci: 'Varanus albigularis', rarity: 3, where: 'Noord- en centraal Namibië', fact: 'Kan meer dan een meter lang worden.' },
  { id: 'agame', cat: 'reptiel', emoji: '🦎', name: 'Rotsagame', sci: 'Agama planiceps', rarity: 1, where: 'Spitzkoppe, Damaraland', fact: 'Mannetjes hebben een felle oranje kop en blauw lijf.' },
  { id: 'mistkever', cat: 'reptiel', emoji: '🪲', name: 'Mistkever (Namib-kever)', sci: 'Onymacris unguicularis', rarity: 3, where: 'Namib-duinen in de vroege ochtend', fact: 'Gaat op de duinkam "op zijn kop" staan om water uit de ochtendmist op te vangen.' },
  { id: 'schorpioen', cat: 'reptiel', emoji: '🦂', name: 'Schorpioen', sci: 'Parabuthus spp.', rarity: 2, where: 'Overal – controleer je schoenen!', fact: 'Vuistregel: dikke staart en kleine scharen = giftiger.' },
];

export const animalById = id => ANIMALS.find(a => a.id === id);
