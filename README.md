# Kalkulator kuchni

Aplikacja webowa do projektowania zabudowy kuchennej. Liczy formatki, fronty, okleiny, rozkrój i okucia oraz pokazuje kuchnię w widoku 3D. Działa w przeglądarce, bez serwera i bez instalacji.

## Co potrafi

- **Formatki** każdej szafki (boki, dno, wieńce, półki, przegrody, plecy HDF, cokół, fronty) z prawdziwymi grubościami płyt.
- **Okleiny:** każda formatka ma wymiar gotowy i wymiar do cięcia (po odjęciu okleiny na oklejanych krawędziach). Zestawienie okleiny w mb z zapasem.
- **Fronty nakładane** ze szczeliną (2, 3 lub 4 mm), pionowe (drzwi obok siebie) albo poziome (jeden nad drugim), z wyborem usłojenia i liczbą drzwi 1–4 (poziomych frontów do 6).
- **Kreator modułu wg wnęki:** podajesz wymiary wnęki, a aplikacja dobiera wymiary korpusu, liczbę drzwi, półek i przegród. Każdą wartość „Auto” można nadpisać.
- **Cokół:** płyta ciągła na ciąg, płyta pod każdą szafką, profil alu/PCV (w mb) albo brak. Grubość, prześwit, cofnięcie, zaślepki.
- **Rozkrój** na arkuszach (domyślnie 2800 × 2070 mm) z rzazem i obrzeżem, dla korpusu, frontów i HDF.
- **Układ prosty lub w kształcie L** z szafką narożną ślepą, szafkami wiszącymi i słupkami.
- **Widok 3D** (three.js): obrót na żywo, włączanie i wyłączanie frontów, szafek wiszących i blatu, widoki z góry, z przodu i z boku.
- **Eksport CSV** (separator „;”, przecinek dziesiętny), zawiasy, nóżki, uchwyty.
- Jasny i ciemny motyw zgodnie z ustawieniem systemu. Projekt zapisuje się w przeglądarce (`localStorage`).

## Uruchomienie

Wystarczy otworzyć `index.html` w przeglądarce. Do widoku 3D potrzebny jest dostęp do internetu, bo three.js ładuje się z CDN (cdnjs i jsDelivr).

Lokalny serwer (opcjonalnie):

```bash
npm start        # http://localhost:8000
```

## Testy

Logika obliczeń (`js/core.js`) nie zależy od przeglądarki i ma testy na wbudowanym `node:test`:

```bash
npm test
```

## Wdrożenie na GitHub Pages

1. Utwórz repozytorium i wypchnij kod na gałąź `main`.
2. W repozytorium wejdź w **Settings → Pages** i jako źródło wybierz **GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` uruchomi testy i opublikuje stronę pod adresem `https://<twoja-nazwa>.github.io/<nazwa-repozytorium>/`.

## Struktura

```
index.html            szkielet strony
css/style.css         wygląd (jasny i ciemny motyw)
js/core.js            obliczenia: formatki, fronty, okleiny, cokół, rozkrój, CSV
js/app.js             interfejs i widok 3D
tests/core.test.js    testy obliczeń
.github/workflows/    testy i wdrożenie na Pages
```

## Założenia obliczeń

Wymiary w milimetrach.

| Element | Zasada |
| --- | --- |
| Szerokość frontu | szerokość szafki ÷ liczba drzwi − szczelina |
| Wysokość frontu | wysokość korpusu − szczelina |
| Fronty poziome i szuflady | wysokość pasa ÷ liczba frontów − szczelina |
| Wymiar do cięcia | gotowy − okleina po obu stronach |
| Dno, wieńce, półki | szerokość szafki − 2 × grubość płyty |
| Plecy HDF | w rowku: wymiar wewnętrzny + 14 mm; nakładane: wymiar szafki − 2 mm |
| Zawiasy | 2 szt. do frontu 900 mm, 3 do 1600 mm, 4 do 2000 mm, 5 powyżej |

Domyślne wymiary: płyta 18 mm, HDF 3 mm, cokół 100 mm, korpus 720 mm, blat 38 mm × 600 mm, szafki wiszące 720 mm od wysokości 1400 mm.

Ograniczenia: tylko fronty nakładane, szuflady jako boxy metalowe (bez formatek), rozkrój metodą rzędów (nie pełna optymalizacja). Przed zamówieniem płyt sprawdź wyniki z firmą, która będzie je ciąć.

## Licencja

MIT, zob. [LICENSE](LICENSE).
