# RaK v.1.5 (881) – DOM/action registry audit

Cíl buildu: začít novou fázi DOM/action registry auditu bez změny funkčnosti aplikace.

## Co přibylo

- nový helper `rak-dom-action-audit.js`,
- nová diagnostika `getRakDomActionRegistryHealth()`,
- read-only kontrola `data-action` prvků v DOM,
- kontrola proti existujícím allowlistům `__rakDelegatedAllowedActions` a `__rakDelegatedChangeActions`,
- kontrola spodní navigace, vybraných cílových data atributů a externích odkazů.

## Bezpečnostní pravidlo

Tento build nic nepřepojuje. Navigace, render stránek, hry, online flow ani Supabase zůstávají beze změny. Helper pouze čte DOM a vrací diagnostický report.

## Další krok

Po ověření je možné doplnit mapu action handlerů a postupně připravovat přehled, které akce patří do navigace, kalkulaček, her, externích odkazů a administrace.
