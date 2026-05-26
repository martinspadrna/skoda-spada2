# RaK v.1.5 (920) – DOM/security hardening herního HUD a hlášek

## Cíl

Navazuje na zpevnění Top score a profilů. Tento krok se zaměřuje na malé, nízkorizikové zpevnění textů v herním HUD a fallback chybové kartě arcade rendererů.

## Co se mění

- `games-arcade.js` má lokální bezpečný `gamesStatLine()` pro arcade hry.
- Label i hodnota HUD řádku se normalizují, zkracují a escapují.
- Fallback karta `Hra se nenačetla` používá společný bezpečný formatter pro chybovou zprávu.
- Přidaný guard `getRakGamesHudMessageDomHardeningHealth()`.

## Co se nemění

- Online Piškvorky a Lodě.
- Supabase DB a policies.
- Herní logika a výpočty score.
- Dashboard, kalkulačky, rotace a statistiky.

## Ověření

- `npm run check` musí projít.
- Release gate `games-hud-message-dom-hardening` má být `ok` nebo nejvýš warning při chybějícím runtime načtení.
- Ručně na mobilu ověřit HUD u několika her a fallback zobrazení při případné chybě rendereru.
