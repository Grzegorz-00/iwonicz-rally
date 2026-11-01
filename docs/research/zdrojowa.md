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

Ortofotomapa posłużyła do kontroli kompozycji otoczenia i palety. Nie trasowano nowych obrysów z obrazu, nie połączono obrazu z bazą OSM, nie wgrano go jako tekstury ani pliku do repozytorium. Teren pozostaje płaski; nie pozyskano NMT. Zieleń i obiekty nie tworzą modelu fotogrametrycznego.

## Mapillary — rzeczywiście obejrzane zdjęcia

1. [1265305397614531, autor czecko](https://www.mapillary.com/app/?pKey=1265305397614531&focus=photo) — wybrane z mapy w okolicy 49.567776, 21.793293. Obejrzano pełny widok uliczny, nie tylko miniaturę. Widoczne: asfalt bez linii środkowej, wąski chodnik przy domach po zachodniej stronie, szara elewacja, niebieskoszara drewniana elewacja, strome szare dachy, ogrodzenia, zwarte wysokie iglaki i duża ilość zieleni. W kadrze widać słupy oraz przewody napowietrzne.
2. [1200721834081306, autor czecko](https://www.mapillary.com/app/?pKey=1200721834081306&focus=photo) — południowy fragment w okolicy 49.566503, 21.792953. Widoczne: zabudowa otynkowana w jasnych odcieniach, czerwony dach, chodnik i zielone pobocze, drzewa liściaste oraz słupy. Zdjęcie przedstawia również miejsca postojowe i samochody, których gra nie odtwarza jako potwierdzonego stanu obecnego.

Na mapie potwierdzono pokrycie zdjęciami również północnego fragmentu. Próba wyboru dodatkowego północnego zdjęcia nie otworzyła konkretnego obrazu; nie zaliczono jej jako analizy zdjęciowej tego fragmentu. Nie potwierdzono dat zdjęć i nie wyciągano kluczy API ani tokenów aplikacji. Materiały są odniesieniem, zdjęcia ani zrzuty ekranu nie zostały dołączone do gry.

## Co jest rzeczywiste, a co pozostaje uproszczone

**Z danych:** oś i długość ulicy, orientacja świata, obrysy i rozmieszczenie budynków, drogi boczne, cieki, położenie mostów, oznaczone chodniki, poligony lasów. Wysokości/poziomy budynków tylko tam, gdzie OSM zawiera odpowiednie tagi.

**Ilustracyjne:** wysokości bez tagów (domy zwykle 2 kondygnacje, garaże 1), dachy bez odpowiednich danych, elewacje, rytm okien, barwy, szerokości dróg i cieków, barierki, dokładne położenie słupków tablic z nazwami ulic oraz indywidualne drzewa. Kolory i uproszczone bryły nawiązują do obejrzanych materiałów; nie są ręcznie wymodelowanymi kopiami konkretnych elewacji. Ogródki, pojazdy zaparkowane, przewody i szczegółowe wyposażenie ulicy nie zostały odtworzone. Nie należy opisywać gry jako fotorealistycznego skanu, pełnego cyfrowego bliźniaka ani narzędzia nawigacji.
