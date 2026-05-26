# RaK v.1.5 (911) – DOM/security hardening profilů a achievementů

## Cíl

Navazuje na v911, kde se bezpečnostně zpevnil renderer Top score. V909 stejným malým krokem zpevňuje textové výpisy v herních profilech, statistikách a achievementech.

## Co se mění

- Uživatelská jména profilů se normalizují a zkracují před složením HTML.
- ID profilu, iniciály, název ranku, oblíbená hra a texty achievementů se převádějí na bezpečný text.
- Číselné hodnoty jako level, XP, win rate, počty her, progress a procenta progress baru se normalizují jako čísla.
- Přidaný read-only guard `getRakGamesProfileDomHardeningHealth()`.

## Bezpečnostní hranice

- Nečtou se hodnoty z `localStorage`, `sessionStorage` ani Supabase.
- Nemění se online flow Piškvorek ani Lodí.
- Nemění se Supabase DB ani policies.
- Nejde o hromadný rewrite šablon, jen o cílený hardening konkrétního rendereru.
