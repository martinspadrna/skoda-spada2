# RaK v.1.5 (916) – Herní akční texty DOM/security guard

Build přidává malý read-only guard `getRakGamesActionTextDomHardeningHealth()`.

## Rozsah

- herní akční tlačítka,
- popisky akcí,
- toast/stavové texty,
- aria labely u akčních prvků.

## Pravidlo

Texty se před vložením do HTML normalizují, zkracují a escapují. Guard je pouze diagnostický: nečte uložená data, nemění gameplay, online Piškvorky, Lodě ani Supabase.
