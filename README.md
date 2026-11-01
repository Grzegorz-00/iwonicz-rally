# Zdrojowa — mała podróż

Przeglądarkowy symulator 3D z Fiatem 126p na **rzeczywistym przebiegu ul. Zdrojowej w Iwoniczu-Zdroju**. Three.js + Vite, bez backendu i kluczy API.

## Uruchomienie

Node.js 22.12+ lub 24. Sprawdzone na Node 24.19.0.

```sh
npm ci
npm run dev -- --port 5173
```

`npm run build` tworzy stronę statyczną w `dist/`. `npm run preview` uruchamia podgląd kompilacji. Gra działa bez zewnętrznych zapytań po pobraniu własnych plików.

Model samochodu przebudowano według obejrzanego blueprintu The-Blueprints (arkusz 22870): proporcje wcześniejszego 126p, rozstaw osi 1,84 m, nadkola, szyby, wnętrze, lampy i chromowane detale. Kamera pościgowa jest wycentrowana za autem także w zakrętach. Nawierzchnia, dachy i tynki mają własne proceduralne tekstury; fasady otrzymały ramy, parapety i przybliżone ogrodzenia.

## Sterowanie

- ↑ — gaz; ↓ — hamowanie, a po zatrzymaniu cofanie.
- ← / → — skręcanie; spacja — hamulec.
- C — kamera za samochodem / z wnętrza; R — powrót na start.
- Przycisk dźwięku włącza syntezowany silnik. Na telefonie są przyciski dotykowe.

## Rzeczywista mapa i zakres rekonstrukcji

Odcinek **1350,43 m**, od skrzyżowania Aleja Słoneczna / Feliksa Piwarskiego do ul. Długiej. Metryczna geometria osi ulicy, boczne drogi, 583 obrysy budynków w okolicy, Iwoniczanka, dopływy i dwa mosty pochodzą z OSM. Jezdnia nie ma wymyślonej linii środkowej. Minimapę, położenie geograficzne i kolizje oparto na tej samej geometrii; wielokąty budynków nie są zastępowane regularnymi prostokątami.

Przeanalizowano rzeczywistą ortofotomapę **Geoportalu/GUGiK HighResolution** oraz dwa zdjęcia **Mapillary, autor czecko**, w środkowym i południowym fragmencie ulicy. Na tej podstawie usunięto fikcyjną regularną aleję i uwzględniono rozproszoną zabudowę, zieleń ogrodową, paletę elewacji i lokalnie potwierdzony chodnik. [Raport źródeł i obserwacji](docs/research/zdrojowa.md) zawiera konkretne adresy, identyfikatory zdjęć i granice ustaleń.

**To rekonstrukcja kartograficzna ze stylizowaną zabudową, nie fotorealistyczny skan.** Teren i droga korzystają z rzeczywistych wysokości NMT GUGiK; odcinek opada o około 25 m. Profil drogi jest lokalnie wygładzony, a pomosty interpolowane z wysokości przyczółków. Siatka gry ma krok 10 m, więc nie odwzorowuje drobnych nierówności. Brakujące wysokości, dachy, elewacje, okna, szerokości i pojedyncze drzewa są orientacyjne. Nie odtworzono całego wyposażenia ulicy. Zdjęcia i ortofotomapy nie są teksturami ani zasobami gry. Dat wykonania zdjęć nie potwierdzono. Fizyka Fiata jest uproszczona.

## Dane i licencja

© OpenStreetMap contributors — ODbL 1.0. Atrybucja jest stale widoczna w grze. [Baza pochodna JSON](public/data/zdrojowa.json) jest dostępna także jako `/data/zdrojowa.json` po zbudowaniu aplikacji. Zasady: [DATA-LICENSE.md](DATA-LICENSE.md).

Odtworzenie importu z ręcznie pobranego wyciągu XML OSM:

```sh
python3 scripts/import-osm.py /sciezka/do/osm.xml
```

Importer zapisuje identyczne kopie danych w `src/data` (bundler) i `public/data` (pobieranie). Odróżnia główną Zdrojową od pobliskich dróg o tej samej nazwie. Nie pobiera samodzielnie zdjęć ani kafelków.

## Sprawdzenie

```sh
npm run test:geo
npm test
npm run build
```

Testy geometrii sprawdzają ciągłość i długość ulicy, położenie końców, projekcję, mosty i wielokąty wklęsłe. Playwright sprawdza WebGL, jazdę, skręt, hamowanie, cofanie, reset, kamerę, opis źródeł i ekran mobilny. Chromium: `/usr/bin/chromium`; inną ścieżkę ustaw w `playwright.config.js`. Serwer testowy uruchamia się automatycznie. Renderowanie programowe WebGL jest wolniejsze od GPU.

## Wysokości i nachylenie

`src/data/terrain.json` to siatka wysokości GUGiK NMT GRID1, PL-KRON86-NH; kopia do pobrania znajduje się w `public/data/terrain.json`. WCS Geoportalu zwrócił numeryczny GeoTIFF EPSG:2180 z wysokościami float32, pobrany z krokiem 5 m, następnie przeliczony na lokalną siatkę 10 m. Nie użyto kolorów mapy hipsometrycznej jako wysokości. Dane obejmują też zbocza doliny.

Jeśli potrzebny jest ponowny import: `python3 scripts/import-terrain.py /ścieżka/do/nmt.tif` (wymaga `rasterio`, `pyproj`, `numpy`; nie są zależnościami gry). Dokładny wycinek opisano w raporcie źródeł. Po pobraniu gra działa bez usług wysokościowych online.

Nawierzchnia ma gęstszą siatkę niż teren i łagodnie dopasowany profil; grunt przy drodze dostosowuje się do niej. Budynki stoją poziomo na fundamentach, zamiast wyginać się ze zboczem. Samochód zmienia wysokość, pochylenie podłużne i poprzeczne, a składowa grawitacji wpływa na przyspieszenie. Kamera pozostaje za autem i podąża za jego wysokością. Licznik pokazuje wysokość n.p.m. i nachylenie w kierunku jazdy.

## Okolica numeru 87 i sterowanie

Przycisk **Start przy Zdrojowej 87** przenosi samochód na ulicę przy tym adresie; R ponawia start z wybranego miejsca. Adres zidentyfikowano po obrysie OSM, a srebrny dach i ogród sprawdzono na ortofotomapie. Trzy dodatkowe zdjęcia Mapillary posłużyły do poprawienia chodnika, bariery, zieleni i wyposażenia ulicy w sąsiedztwie. Fasada numeru 87 jest zasłonięta na zdjęciach — jej niepotwierdzone szczegóły pozostają uproszczone, co opisano w raporcie.

Samochód zastąpiono kolejnym, nowym modelem w stylu 126p 600 z 1975 r. według drugiego arkusza rzutów: pionowe tylne lampy i dwie sekcje chłodzenia, zwężający się dach, poprawione szyby i profil nadwozia. Nie jest to gotowy model licencjonowany z serwisu ani skan.

Na poboczu i trawie nie ma już dodatkowego spowalniania. Przy małej prędkości promień skrętu wynosi około 4,4 m; przy większej prędkości skręt łagodnieje. Nachylenie terenu i kolizje nadal wpływają na jazdę.

Skręcanie narasta łagodnie, a krótkie naciśnięcia strzałek służą do drobnych korekt. Przy większej prędkości kąt skrętu jest mocniej ograniczony. Zachodni chodnik i główna jezdnia tworzą ciągłe pasy. Gęstsza siatka podłoża przy drodze zapobiega przebijaniu trawy przez nawierzchnię; źródłowa rozdzielczość danych NMT pozostaje bez zmian. Przedłużenie zachodniego chodnika na całą trasę jest uzupełnieniem gry, nie nowym ustaleniem kartograficznym.
