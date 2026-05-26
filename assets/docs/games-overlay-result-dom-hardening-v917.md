# RaK v.1.5 (920) – Hry modaly/výsledky DOM hardening

## Cíl
Malý read-only DOM/security krok pro herní modaly, overlaye a výsledkové texty.

## Co guard hlídá
- výsledkové nadpisy,
- stavové zprávy v overlayích,
- CTA popisky,
- hráčské texty ve výsledkových blocích.

## Bezpečnostní pravidlo
Texty se mají normalizovat, zkrátit a escapovat před vložením do HTML. Guard nic neukládá, nemaže a nečte hodnoty ze storage ani ze Supabase.

## Záměrně beze změny
- gameplay,
- online Piškvorky,
- online Lodě,
- Supabase DB,
- Supabase policies.
