# RaK v.1.5 (910) – Top score DOM/security hardening

## Cíl

První konkrétní nízkorizikový DOM/security hardening v hrách bez hromadného přepisování renderu.

## Co se změnilo

- `gamesTop3Block()` už neskládá jméno, jednotku, hodnotu a čas přímo z volných hodnot.
- Přidané helpery pro Top score:
  - `gamesSafePlainText()`
  - `gamesSafePlayerName()`
  - `gamesSafeScoreUnit()`
  - `gamesSafeLeaderboardValue()`
  - `gamesNormalizeLeaderboardRow()`
  - `gamesLeaderboardRowHtml()`
- Přidaný read-only guard `getRakGamesTopScoreDomHardeningHealth()`.

## Ochrana

- Jméno hráče se zkracuje na 48 znaků a escapuje přes `escapeHtml()`.
- Jednotka score se zkracuje na 16 znaků a escapuje.
- Hodnota score se převede na bezpečné číslo a omezí na rozumný rozsah.
- Datum/čas výsledku se bere jako text a escapuje.

## Co se neměnilo

- Nezměnilo se ukládání score.
- Nezměnilo se Supabase DB ani policies.
- Nezměnil se online flow Piškvorek ani Lodí.
- Neproběhl hromadný rewrite všech šablon.
