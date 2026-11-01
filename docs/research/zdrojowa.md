# Rekonstrukcja Zdrojowej — stan na 1 listopada 2026

## Zakres i identyfikacja ulicy

Odtworzono główną ul. Zdrojową (droga powiatowa 2002R) w **Iwoniczu-Zdroju**, od węzła Aleja Słoneczna / Feliksa Piwarskiego (49.5659871, 21.7927991) do ul. Długiej (49.5778285, 21.7948911). Długość osi z danych OSM: **1350,43 m**. Nie pomylono jej z innymi drogami o tej samej nazwie w pobliżu, w tym ze wschodnią drogą lokalną o ID 173013161.

Źródła były oglądane 1 listopada 2026. Nie oznacza to, że zdjęcia wykonano tego dnia. Dat nalotu i wykonania zdjęć nie potwierdzono; materiały mogą przedstawiać różne okresy.

## OpenStreetMap — geometria użyta w grze

Pobrano pojedynczy wyciąg API:

https://api.openstreetmap.org/api/0.6/map?bbox=21.785,49.562,21.801,49.583

Łańcuch ulicy łączy 10 ways, 66 punktów, bez wygładzania i bez zmiany skali: 1196864977, 33448557, 347636247, 758659018, 759026432, 759026431, 1573287352, 1573287351, 347636250, 253534533. Importer łączy je po wspólnych identyfikatorach węzłów i odwraca orientację w razie potrzeby; nie sortuje punktów tylko po szerokości geograficznej.

W scenie wykorzystano też 583 obrysy budynków, 218 odcinków dróg i ścieżek, 42 odcinki cieków oraz poligony pokrycia terenu w otoczeniu trasy. Te liczby dotyczą obiektów/odcinków w wyciągu, nie liczby całych ulic, rzek czy działek. OSM nie zawierało indywidualnych węzłów drzew w wybranym korytarzu.

Dwa odcinki mają `bridge=yes`. Wszystkie odcinki głównej ulicy mają `lane_markings=no`, dlatego usunięto wymyśloną przerywaną linię środkową. Chodniki oznaczone w OSM odtwarzane są po właściwej stronie z uwzględnieniem kierunku way. Nie zakładamy, że brak tagu oznacza potwierdzony brak chodnika. Dodatkowo krótki zachodni chodnik w sąsiedztwie obejrzanego zdjęcia Mapillary (stacja 178–224 m) dodano na podstawie obrazu; jego granice są przybliżone. Szerokość głównej jezdni przyjęto orientacyjnie jako 6,2 m, a chodnika 1,35 m — to nie pomiar geodezyjny.

Współrzędne gry to lokalne metry: X na zachód, Z na północ. Skala długości geograficznej uwzględnia cosinus szerokości 49.5659871°. Minimapę i fizykę generuje ten sam zbiór co drogę. Obrysy budynków zachowują wielokąty, także wklęsłe, zamiast zastępować je regularnym szeregiem prostokątów.

Dane po przetworzeniu: [../../public/data/zdrojowa.json](../../public/data/zdrojowa.json). Kopia używana przez bundler: `src/data/zdrojowa.json`. Obie generuje `python3 scripts/import-osm.py /ścieżka/do/osm.xml`. Importer nie pobiera danych samodzielnie. Atrybucja: **© OpenStreetMap contributors**, [ODbL](https://www.openstreetmap.org/copyright). Udostępniony plik danych pozostaje bazą pochodną na ODbL 1.0. Kod gry nie jest częścią bazy kartograficznej.

## Geoportal / GUGiK — analiza ortofotomapy

Sprawdzono capabilities oficjalnej usługi `PZGIK/ORTO/WMS/StandardResolution`. GetCapabilities działał, lecz kolejne poprawnie sformułowane GetMap (WMS 1.1.1/1.3.0, EPSG:4326 i EPSG:3857) zwracały HTTP 404. Nie traktowano działającej strony startowej jako dowodu dostępności zdjęć.

Obraz uzyskano z oficjalnego wariantu:

https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution

Obejrzano dwa pojedyncze widoki WMS `Raster`, EPSG:3857, JPEG: zbliżenie środka ulicy oraz całą trasę. Nie wykonywano masowego pobierania/harvestingu. Parametry większego widoku: środek odniesienia 21.793° E, 49.568° N przeliczony na EPSG:3857, BBOX od (x−450,y−500) do (x+650,y+1800), 900×1882 px.

Ortofotomapa pokazuje rozproszoną zabudowę mieszkalną, nierówną linię zabudowy, ogrody, dojazdy i stoki z lasami po bokach doliny. Domy mają dachy m.in. szare, czerwone i brązowe. W północnej części zabudowa jest rzadsza, występują pola/łąki. To uzasadnia usunięcie poprzedniej fikcyjnej, równej alei kamienic i regularnych rzędów drzew.

Ortofotomapa posłużyła do kontroli kompozycji otoczenia i palety. Nie trasowano nowych obrysów z obrazu, nie połączono obrazu z bazą OSM, nie wgrano go jako tekstury ani pliku do repozytorium. Na etapie analizy ortofotomapy teren był płaski; później dodano liczbowy NMT opisany poniżej. Zieleń i obiekty nie tworzą modelu fotogrametrycznego.

## Mapillary — rzeczywiście obejrzane zdjęcia

1. [1265305397614531, autor czecko](https://www.mapillary.com/app/?pKey=1265305397614531&focus=photo) — wybrane z mapy w okolicy 49.567776, 21.793293. Obejrzano pełny widok uliczny, nie tylko miniaturę. Widoczne: asfalt bez linii środkowej, wąski chodnik przy domach po zachodniej stronie, szara elewacja, niebieskoszara drewniana elewacja, strome szare dachy, ogrodzenia, zwarte wysokie iglaki i duża ilość zieleni. W kadrze widać słupy oraz przewody napowietrzne.
2. [1200721834081306, autor czecko](https://www.mapillary.com/app/?pKey=1200721834081306&focus=photo) — południowy fragment w okolicy 49.566503, 21.792953. Widoczne: zabudowa otynkowana w jasnych odcieniach, czerwony dach, chodnik i zielone pobocze, drzewa liściaste oraz słupy. Zdjęcie przedstawia również miejsca postojowe i samochody, których gra nie odtwarza jako potwierdzonego stanu obecnego.

Na mapie potwierdzono pokrycie zdjęciami również północnego fragmentu. Próba wyboru dodatkowego północnego zdjęcia nie otworzyła konkretnego obrazu; nie zaliczono jej jako analizy zdjęciowej tego fragmentu. Nie potwierdzono dat zdjęć i nie wyciągano kluczy API ani tokenów aplikacji. Materiały są odniesieniem, zdjęcia ani zrzuty ekranu nie zostały dołączone do gry.

## Co jest rzeczywiste, a co pozostaje uproszczone

**Z danych:** oś i długość ulicy, orientacja świata, obrysy i rozmieszczenie budynków, drogi boczne, cieki, położenie mostów, oznaczone chodniki, poligony lasów. Wysokości/poziomy budynków tylko tam, gdzie OSM zawiera odpowiednie tagi.

**Ilustracyjne:** wysokości bez tagów (domy zwykle 2 kondygnacje, garaże 1), dachy bez odpowiednich danych, elewacje, rytm okien, barwy, szerokości dróg i cieków, barierki, dokładne położenie słupków tablic z nazwami ulic oraz indywidualne drzewa. Kolory i uproszczone bryły nawiązują do obejrzanych materiałów; nie są ręcznie wymodelowanymi kopiami konkretnych elewacji. Ogródki, pojazdy zaparkowane, przewody i szczegółowe wyposażenie ulicy nie zostały odtworzone. Nie należy opisywać gry jako fotorealistycznego skanu, pełnego cyfrowego bliźniaka ani narzędzia nawigacji.

## Doprecyzowanie modelu 126p i detalu sceny

Obejrzano publiczny podgląd blueprintu [Fiat 126p — The-Blueprints, arkusz 22870](https://www.the-blueprints.com/blueprints/cars/fiat/22870/view/fiat_126p/). Rysunek pokazuje dwie odmiany; dla wcześniejszej podaje długość 3054 mm, szerokość 1377 mm, wysokość 1335 mm i rozstaw osi 1840 mm. Na jego podstawie skorygowano proporcje, pochylenie szyb, linię dachu oraz pozycje kół. Podgląd obejrzano lokalnie; nie jest rozpowszechniany w repozytorium. Model pozostaje autorską geometrią proceduralną, nie gotowym skanem samochodu. Detale wyposażenia nie stanowią rekonstrukcji konkretnego egzemplarza/rocznika.

Strony Wikipedia i Automobile-Catalog odrzucały żądania HTTP 403; nie wykorzystano ich jako zweryfikowanych źródeł. Publiczny katalog The-Blueprints i podgląd rysunku były dostępne bez logowania.

Dodano własne proceduralne tekstury asfaltu, tynku, zieleni i pokrycia dachowego, ramy i parapety okien, dwuspadowe dachy dla czworokątnych obrysów oraz ogrodzenia przy zabudowie. Położenie ogrodzeń, kominy i detale fasad są przybliżeniami inspirowanymi oglądanymi zdjęciami, nie nowymi pomiarami. Nie skopiowano z zewnętrznych serwisów tekstur. Wielokątne, złożone dachy pozostają uproszczone. Kamera pościgowa ma zerowe przesunięcie boczne względem kierunku auta; nie dryfuje na bok w zakrętach.

## Liczbowy model terenu — GUGiK NMT

Pozyskano rzeczywisty raster wysokości, nie obraz cieniowania: oficjalny WCS `https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WCS/DigitalTerrainModelFormatTIFF`, warstwa `DTM_PL-KRON86-NH_TIFF`. GetCapabilities i DescribeCoverage potwierdziły format TIFF, układ EPSG:2180 i brak ograniczeń dostępu (`accessConstraints: none`).

Żądanie WCS 1.0.0 GetCoverage: BBOX `701014,191894,702714,194394`, CRS/RESPONSE_CRS `EPSG:2180`, RESX/RESY `5`, FORMAT `image/tiff`, INTERPOLATION `bilinear`. Zwrócono prawidłowy GeoTIFF float32, 340×500 pikseli, 680959 bajtów. Współrzędne zweryfikowano przez reprojekcję pyproj, wysokości odczytano rasterio. SHA256 źródła jest w metadanych JSON. Nie użyto zastępczych wysokości Open-Meteo; kontrolne zapytanie tego API wskazało jedynie podobny ogólny kierunek spadku.

Importer przelicza próbki na lokalny układ gry, z krokiem 10 m, metodą biliniową. Odrzuca brakujące próbki, wartości nodata i zakres poza wycinkiem. Siatka 131×211 obejmuje X od −650 do 650 m oraz Z od −350 do 1750 m; wysokości w tym wycinku wynoszą około 342–478 m w układzie PL-KRON86-NH. Poza brzegiem siatki interpolator ogranicza współrzędne do brzegu; obszar jazdy leży wewnątrz pokrycia.

Dla drogi próbki wzdłuż osi są łagodnie filtrowane w sąsiedztwie ±6 m i resamplowane co 5 m. Profil przy południowym końcu wynosi około 382,75 m, przy Długiej 358,01 m: spadek 24,74 m. Są to wartości przetworzonego modelu, a nie niwelacja geodezyjna nawierzchni. Wąski pas jezdni jest wyrównany poprzecznie, a grunt łagodnie przechodzi do surowego NMT w pasie do 12,5 m od osi. Pomosty nad ciekami interpolowane są z poziomów przyczółków, gdyż NMT może pokazywać grunt poniżej mostu. Dokładnych rzędnych pomostów nie ustalono.

Geometria terenu, jezdni i chodników otrzymuje wysokości przed renderowaniem; budynki zachowują pion i poziome kondygnacje, a fundamenty sięgają poniżej lokalnego terenu. Auto opiera się na tym samym profilu; pochylenie wynika z różnicy wysokości przed/za autem i między stronami. Składowa grawitacji `−g·sin(arctan(nachylenie))` zmienia przyspieszenie. Hamulec zatrzymuje także na stoku; stojące auto ma uproszczone podtrzymanie postoju. To model jazdy, nie pełna symulacja zawieszenia.

Daty konkretnego pomiaru NMT nie ustalono; datą pobrania jest 1 listopada 2026. Siatka 10 m nie odwzorowuje krawężników, kolein ani centymetrowych nierówności.

## Zdrojowa 87 — dodatkowa analiza i korekty

Adres potwierdzono w obiekcie OSM **way 347637101**, z tagami `addr:street=Zdrojowa`, `addr:housenumber=87`. Środek obrysu: około 49.572510 N, 21.792251 E. To cofnięty od ulicy dom po jej zachodniej stronie; nie pomylono go z budynkiem stojącym tuż przy chodniku.

Obejrzano trzy dodatkowe, pełne widoki Mapillary, autor **czecko**:

- [759802678521830](https://www.mapillary.com/app/?pKey=759802678521830&focus=photo), położenie wybrane w aplikacji około 49.572384, 21.792754.
- [492372242585593](https://www.mapillary.com/app/?pKey=492372242585593&focus=photo), około 49.573064, 21.792858.
- [415026326851271](https://www.mapillary.com/app/?pKey=415026326851271&focus=photo), około 49.571895, 21.792675.

Początkowo aplikacja pokazywała pustą mapę. Kolejne wczytanie z dopuszczeniem cookies komponentów mapowych zadziałało; dopiero po obejrzeniu pełnych zdjęć zapisano obserwacje. Zdjęcia pokazują chodnik z betonowej kostki z czerwonym pasem, linię krawędziową (bez linii środkowej), metalową barierę po wschodniej stronie, słupy i przewody napowietrzne oraz gęstą roślinność i ogrodzenia. W kierunku południowym widoczny jest faktyczny spadek drogi. Dodano przybliżony odcinek tych elementów przy stacjach 650–830 m, nie zakładając ich identycznego występowania na całej ulicy. Obecności zaparkowanych samochodów, tablic remontowych i ograniczeń tymczasowych nie potraktowano jako stałych cech ulicy.

Obejrzano też jeden widok ortofotomapy GUGiK HighResolution skupiony na numerze 87: środek 21.7922514 E, 49.5725098 N, EPSG:3857, BBOX ±125 m od środka w tym układzie, 900×900 px. Potwierdza jasny/srebrny dach ustawiony główną kalenicą północ–południe, nieregularny obrys domu, cofnięcie w głąb działki, dojazd i grządki od północy. Na tej podstawie numer 87 otrzymał osobny dach zamiast poprzedniej płaskiej nakrywy. Zachowano obrys OSM. Gra udostępnia przycisk „Start przy Zdrojowej 87”, aby łatwo obejrzeć ten odcinek.

**Granice wierności:** nie odczytano numeru 87 na fotografii ulicznej; identyfikacja adresu pochodzi z OSM i położenia na ortofotomapie. Elewacja jest częściowo zasłonięta. Wysokość przyjęta w modelu (5,8 m do okapu), układ okien, kolory tynku, kominy i wysokość dachu są przybliżeniami, nie potwierdzonymi pomiarami konkretnej fasady. Ogród odtworzono poglądowo. Dodana tabliczka 87 pomaga rozpoznać obiekt; jej faktycznego umiejscowienia nie ustalono. Daty wykonania zdjęć i nalotu nadal nie są potwierdzone. Obrazy pozostają wyłącznie referencjami, bez kopiowania ich do repozytorium.

## Kolejna przebudowa samochodu i sterowania

Ponownie obejrzano arkusz 22870 i drugi publiczny podgląd [Fiat 126P (1975), The-Blueprints 1197](https://www.the-blueprints.com/vectordrawings/show/1197/fiat_126p/). Drugi pokazuje rzuty przodu, tyłu, boku i góry, z wymiarami 3054×1378×1302 mm i rozstawem osi 1840 mm. Poprzedni model miał błędny dominujący poziomy grill z tyłu i za szerokie tylne lampy. Zastąpiono go nową geometrią: węższe pionowe tylne lampy, dwie sekcje otworów chłodzenia, mniejsze przeszklenie, zwężający się dach, profilowane nadkola, podział drzwi, oddzielne wnętrze i stalowe koła z kołpakami. Wybrano wczesny styl 600; nie miesza się już opisu silnika 650 z tą wersją. Model jest autorski i proceduralny, nie fotogrametryczny. Podglądy oglądano bez pobierania płatnego pliku; nie są częścią zasobów gry. Próby uzyskania fotografii z innych serwisów zakończyły się odmową dostępu lub błędem — nie przedstawiamy ich jako obejrzanych zdjęć.

Usunięto dodatkowy opór 1,4/s poza jezdnią: asfalt i trawa mają teraz ten sam opór bazowy 0,16/s i limit prędkości. Grawitacja i kolizje nadal działają. Skręt oparto na modelu rowerowym z rozstawem osi 1,84 m; przy małej prędkości promień toru środka tylnej osi wynosi około 4,4 m (wcześniej około 26 m). Przy większej prędkości ograniczono kąt kół, aby zachować kontrolę. Nie jest to pomiar fabrycznego koła zawracania; to świadomie bardziej zwrotne sterowanie gry.

## Łagodniejszy skręt i ciągłość nawierzchni

Skręt narasta teraz liniowo do pełnego wychylenia w około 0,67 s; krótkie naciśnięcia mają progresywnie mniejszy efekt. Powrót do środka jest szybszy. Przy większej prędkości mocniej ograniczono kąt kół, zachowując ciasne manewry przy małej prędkości.

Zachodni chodnik połączono w jeden ciąg wzdłuż całej głównej trasy na życzenie użytkownika. To świadome uzupełnienie gry, nie potwierdzenie geodezyjne istnienia chodnika w każdym punkcie. Wschodnią stronę pozostawiono zgodnie z oznaczonymi odcinkami, bez dodawania chodnika w miejscu widocznej na zdjęciach bariery. Usunięto dublujące się, osobno kończące odcinki przy numerze 87 i na południu. Główna jezdnia również powstaje jako jeden pas, z połączeniami narożników uwzględniającymi skręt, zamiast niezależnych siatek dla każdego way OSM.

Podłoże otrzymało siatkę 2 m przy drodze, z dopasowanymi krawędziami przejścia do siatki rzadszej. Nie oznacza to zwiększenia rozdzielczości źródłowego NMT: nadal interpolujemy te same dane 10 m. Obniżono powierzchnię trawy względem nawierzchni, poszerzono lokalnie wyrównany pas z 4,5 do 6 m od osi, a chodnikom i jezdni dodano pionowe krawędzie. Przejście do surowego NMT kończy się obecnie 14 m od osi. Test porównuje wysokości faktycznych trójkątów asfaltu/chodnika i trawy na całej trasie (także wewnątrz trójkątów), zamiast sprawdzać wyłącznie analityczną funkcję wysokości.

## Fasady ze zdjęcia ulicznego i materiały fotograficzne

Ponownie otwarto pełne ujęcia Mapillary **1200721834081306** i **1265305397614531** w widoku 1600×1100. Z odpowiedzi danych publicznej aplikacji dla drugiego obrazu odczytano wyłącznie metadane zdjęcia: autor czecko, `captured_at=1656947942717` (**4 lipca 2022 r.**), `computed_geometry=[21.793323733902,49.567786696718]`, `computed_compass_angle=173.0079072344°`. Nie odczytywano ani nie zapisywano tokenów aplikacji.

**Korekta orientacji:** ten widok patrzy na południe. Domy po lewej stronie zdjęcia stoją po **wschodniej** stronie drogi. Wcześniejsze opisy kierunków przy tym ujęciu były przybliżone; do przypisania aktualnych modeli wykorzystano teraz pozycję i azymut zdjęcia oraz obrysy OSM, nie samą stronę kadru.

W pliku `src/data/facade-references.json` zapisano jawne profile wybranych budynków:

- **347636108 / Zdrojowa 14**: szara tynkowana fasada przy pozycji kamery, jasne opaski i podziały wysokich okien, niski czterospadowy dach, wysoka zieleń od strony ulicy.
- **347636206 / Zdrojowa 6**: dalej na południe — niebieskoszare poziome deskowanie, stromy srebrnoszary dach, biały balkon i słupki, wyższe okna z podziałami. To wizualne dopasowanie do pozycji obrysu; numeru nie odczytano na elewacji.
- **347636255 / Zdrojowa 2** i **402687290 / Zdrojowa 4**: jasna grupa o stromych dachach na dalszym planie. Przypisanie konkretnej części grupy do numeru oraz układ okien są mniej pewne; zapisano to w profilach. Nie przedstawiamy tych modeli jako dokładnej dokumentacji obmiarowej.
- **347637101 / Zdrojowa 87**: nadal kształt dachu z ortofotomapy i obrys z OSM; elewacja zasłonięta, szczegóły pozostają przybliżone.

Nowe modele zachowują obrys ścian OSM. Dachy dostosowano do kierunku głównej krawędzi, dodano gzymsy, rynny, rury spustowe, cokół, osobne ramy i parapety, podziały okien oraz wejścia. W grupie referencyjnej osobno modelowane są deskowanie, balkon i żywopłot. Dla pozostałych budynków zastosowano ulepszone, **wciąż przybliżone** dachy i fasady. Prostokątna obwiednia części dachów i nieudokumentowane strony budynków nie są geodezyjnie dokładne. Nowy widok `?start=villas` ustawia grę na tej części ulicy, w kierunku odpowiadającym zdjęciu.

Do wykończeń pobrano z biblioteki **Poly Haven (CC0)**: Asphalt 04, Herringbone Pavement 02, White Plaster 02, Grass Ground, Roof Slates 02 i niebo HDRI Kloofendal 48d Partly Cloudy (Pure Sky). Przed wyborem obejrzano podglądy; mniej spękany Asphalt 04 pasuje do zdjęć lepiej niż początkowo wypróbowany Asphalt 02. Materiały są fotograficzne, ale **nie pochodzą z konkretnego chodnika ani asfaltu Zdrojowej**. Tynk wykorzystuje fotograficzne mapy mikrowypukłości i szorstkości z barwą farby dobraną w modelu. Deskowanie i blacha są proceduralne. Czerwono-szara kostka jest podobnym materiałem bibliotecznym, nie pomiarem dokładnego wzoru na każdym fragmencie.

Gra stosuje mapy koloru, normalnych OpenGL i szorstkości, skalę tekstur w metrach, filtrowanie anizotropowe oraz odbicia i światło z HDRI. Tło HDRI zawiera samo niebo — nie jest fotografią nieba nad Iwoniczem ani źródłem geometrii otoczenia. Silne wcześniejsze żółte doświetlenie zastąpiono neutralniejszym światłem. Roślinność korzysta z instancjonowanych, wycinanych sylwetek liści zamiast pełnych stożków i kul; nie są to skany drzew ani ich dokładne położenie.

Pobrano 16 plików, około 11,4 MB. Zweryfikowano MD5 podane przez dostawcę i zapisano SHA256. `public/materials/sources.json` zawiera autorów, adresy i sumy. `scripts/fetch-materials.py` odtwarza pobranie bez wyłączania TLS czy weryfikacji. Nie pobierano pełnych, wielusetmegabajtowych modeli drzew; wybrano lżejszą geometrię odpowiednią do przeglądarki.

**Wynik i ograniczenia:** to istotnie bardziej szczegółowa rekonstrukcja z materiałami fotograficznymi i wybranymi fasadami odniesionymi do zdjęć. Nie jest fotogrametrią, pełnym cyfrowym bliźniakiem ani fotorealistycznym odtworzeniem wszystkich 583 budynków. Pozostałe elewacje, ukryte ściany, dokładne wymiary otworów i obecny stan zabudowy wymagają dalszych zdjęć/obmiarów.

Modele statyczne dzielone są na obszary 64×64 m według faktycznego położenia trójkątów — również wtedy, gdy geometria budynku ma początek obiektu w (0,0,0). Dzięki temu kamera nie musi rysować wszystkich domów jednocześnie. Wykryte renderowanie programowe (np. SwiftShader) automatycznie obniża rozdzielczość i jakość cieni oraz wyłącza drogie cienie kart liści; modele i fotograficzne materiały pozostają te same. Na akcelerowanym GPU zachowano wyższą rozdzielczość i cienie liści. Pierwszy test jazdy ujawnił zbyt duży koszt nowych materiałów przy pełnej rozdzielczości programowej; po optymalizacji ponownie zweryfikowano faktyczne poruszanie auta, zamiast zastępować test sprawdzeniem samego otwarcia strony.

## Skanowane drzewa, osadzenie budynków i detale samochodu

Dalsza poprawa koncentruje się na elementach blisko kamery, bez zmiany zidentyfikowanego przebiegu drogi ani sterowania. Pozyskano **Tree Small 02 / Rico Cilliers / Poly Haven / CC0**. Najpierw sprawdzono strukturę glTF: źródło zawierało ponad 2 mln trójkątów, bez gotowego lekkiego LOD. Dostępne środowisko miało około 32 GB wolnej pamięci i 5 rdzeni; przygotowanie ograniczono do jednego modelu, z sekwencyjną redukcją zamiast dodawania pełnych modeli do całego lasu.

Zweryfikowane oryginały to około 101 MB i pozostają w `/tmp`. Po weld/simplify/resize (glTF Transform **4.5.1**, ratio **0.08**, error **0.003**, tekstury **512 px**) model ma **164 792 trójkąty**, około **10,3 MB**, i jest samodzielnym GLB bez zewnętrznych plików tekstur. Wstępny wariant około 3,5 MB zbyt mocno usuwał liście; pozostawiono gęstszy model, ale ograniczono go do **dwóch drzew naraz**, w odległości do 24 m od gracza. Pełna geometria ładuje się w tle tylko przy akcelerowanym renderowaniu. Wariant programowy korzysta z atlasu bez pobierania GLB.

Atlas 2048×512 zawiera cztery kierunki patrzenia wypieczone z tej samej zoptymalizowanej geometrii i oświetlenia. Wybór kadru odpowiada położeniu kamery i obrotowi drzewa. Dalej od kamery renderowane są lekkie powierzchnie z wycinaną sylwetką. Podejście zachowuje pień i układ gałęzi skanu, zamiast rysować liściaste drzewa jako zbiory wielkich proceduralnych listków. Iglaki i żywopłoty pozostają uproszczone. Rozmieszczenie i gatunki **nie są inwentaryzacją rzeczywistych drzew ulicy**.

Próba wypieczenia atlasu bezpośrednio z pełnego, wielomilionowego źródła przekroczyła możliwości procesu Chromium. Nie wykorzystano niedokończonych wyników; atlas ponownie wyrenderowano w całości z poprawnego modelu po redukcji. `scripts/prepare-tree.py` odtwarza pobranie z kontrolą sum i redukcję, a `scripts/bake-tree.mjs` wypieka atlas. `public/vegetation/sources.json` dokumentuje pochodzenie, parametry i hashe oryginałów oraz obu wyników. Renderer nie pobiera żadnych danych od Poly Haven w czasie gry.

Fundamenty sięgają teraz poniżej najniższego narożnika obrysu na NMT, zamiast mieć stałe 2 m. Zapobiega to wiszącym ścianom na stromym zboczu. Cokół dostosowuje się do różnicy poziomów przy ścianie. W pobliżu kamery dodano delikatne przyciemnienie styku z gruntem — to wizualne przybliżenie okluzji, nie pomiar rzeczywistych cieni. Przy scalaniu sceny zachowuje się flagi rzucania i odbierania cieni, aby taki detal nie tworzył dodatkowych, błędnych cieni w mapie światła.

Fiat ma kontaktowe przyciemnienie pod podwoziem, czerwone światła stop przy spacji i hamowaniu strzałką w dół oraz ruch kierownicy zgodny ze skrętem. Koła są teraz niezależne od grupy przechyłu karoserii i obracają się zgodnie z promieniem 0,245 m. Nie dodano fikcyjnych świateł cofania do modelu we wczesnym stylu.

Sprawdzane są oba warianty drzew: integralność GLB i atlasu, brak zewnętrznych zależności w GLB, rzeczywisty render modelu w małej scenie WebGL oraz limit dwóch modeli szczegółowych. Osobne testy kontrolują fundament na stromym zboczu i zachowanie flag cienia po scalaniu. Dotychczasowe testy trawy pod nawierzchnią, geometrii ulicy i jazdy nadal obowiązują. Zmiany nie oznaczają pełnego fotorealistycznego odtworzenia zabudowy ani dokumentacji wszystkich posesji.
