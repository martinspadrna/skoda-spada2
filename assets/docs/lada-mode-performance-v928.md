# RaK v.1.5 (928) – Láďův režim: výkonové odlehčení

Build v928 kontroluje a mírně přitvrzuje Láďův režim pro slabší nebo zasekané mobily. Cíl je snížit počet drahých efektů a omezit herní smyčky tak, aby aplikace tolik netahala GPU/CPU.

## Co se změnilo

| Oblast | Úprava | Dopad | Riziko |
|---|---|---|---:|
| `buildRakLadaPerformanceProfile()` | Turbo režim používá pomalejší frame budget a delší throttle. | Méně překreslování na slabších telefonech. | nízké až střední |
| Herní fallback profil | Pokud není dostupný profil z UI, hry použijí odlehčené výchozí hodnoty. | Stabilnější chování i při pozdějším načtení UI helperu. | nízké |
| CSS efekty | V `ladaMode` se tvrději vypíná blur, filter, animace a většina těžkých stínů. | Méně sekání při scrollu a ve hrách. | nízké |
| Canvas / hry | V Láďově režimu zůstává DPR limit 1 a frame budget je vyšší. | Nižší zátěž GPU. | nízké |
| Diagnostika | Existing `getLadaPerformanceHealth()` dál ukazuje aktivní profil a hodnoty. | Snazší ověření v konzoli. | nízké |

## Hodnoty profilu

| Hodnota | Lite | Turbo |
|---|---:|---:|
| `frameMs` | 34 ms | 42 ms |
| `canvasDprMax` | 1 | 1 |
| `resizeThrottleMs` | 460 ms | 700 ms |
| `leaderboardTtlMs` | 180 000 ms | 240 000 ms |
| `idleDelayMs` | 220 ms | 360 ms |

## Co se nemění

- Nemění se pravidla her.
- Nemění se online Piškvorky ani online Lodě.
- Nemění se Supabase DB ani policies.
- Nemění se ukládání profilů.
- Nemění se ranky ani achievementy.

## Ruční ověření

1. Zapnout Láďův režim v nastavení.
2. Otevřít dashboard, Rotace a Hry.
3. Zkontrolovat, že scroll nepůsobí trhaněji než předtím.
4. Spustit několik her a ověřit, že jsou ovladatelné.
5. V konzoli ověřit `getLadaPerformanceHealth()` a `getRakLadaPerformanceProfile()`.
6. Na Ládově telefonu zkusit hlavně Hry a přepínání záložek.

Skutečné ověření na konkrétním Ládově mobilu zůstává `manual`.
