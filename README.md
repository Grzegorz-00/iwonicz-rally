# Zdrojowa — mała podróż

Przeglądarkowa gra 3D z autorskim modelem Fiata 126p, uzdrowiskową scenerią, minimapą i syntezowanym dźwiękiem silnika. Three.js + Vite, bez backendu i kluczy API.

## Uruchomienie

Node.js 22.12+ lub 24 (sprawdzone na 24.19.0).

```sh
npm ci
npm run dev -- --port 5173
```

`npm run build` tworzy stronę statyczną w `dist/`. `npm run preview` uruchamia podgląd kompilacji.

## Sterowanie

- ↑ — gaz; ↓ — hamowanie, a po zatrzymaniu cofanie.
- ← / → — skręcanie; spacja — hamulec.
- C — kamera za samochodem / z wnętrza; R — powrót na start.
- Dźwięk włącza się osobnym przyciskiem. Na małych ekranach dostępne są przyciski dotykowe.

## Wierność lokalizacji

**Sceneria i przebieg trasy są poglądowe, nie stanowią wiernej rekonstrukcji ulicy Zdrojowej w Iwoniczu-Zdroju.** Próby dostępu do OpenStreetMap, Geoportalu, Mapillary oraz Wikipedii zostały zablokowane przez politykę sieci środowiska (HTTP 403 na proxy). Nie pobrano i nie wykorzystano zdjęć, geometrii ani danych tych serwisów. Linki do dalszej weryfikacji są dostępne w grze w sekcji „O mapie i źródłach”. Przed rekonstrukcją rzeczywistej ulicy należy pozyskać i zweryfikować geometrię oraz materiały referencyjne wraz z warunkami licencyjnymi.

Gra nie wykonuje zewnętrznych żądań po załadowaniu. Modele, materiały i minimapa są generowane lokalnie. Trasa ma ograniczony zasięg, a jej koniec sygnalizuje komunikat. Budynki zatrzymują samochód; jazda po poboczu spowalnia. Fizyka jest uproszczona, zręcznościowa.

## Testy

```sh
npm test
```

Testy Playwright sprawdzają renderowanie WebGL, przyspieszanie, skręt, hamowanie, cofanie, reset, kamerę, okno źródeł oraz przyciski na telefonie. Konfiguracja używa Chromium z `/usr/bin/chromium` (dostosuj `executablePath`, jeśli przeglądarka znajduje się gdzie indziej). Serwer deweloperski jest uruchamiany automatycznie. Renderowanie programowe WebGL wymaga więcej czasu niż GPU.
