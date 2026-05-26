# Supabase client/offline queue closure v892

Tahle verze uzavírá Supabase klientský/offline queue audit jako read-only fázi.

## Co closure hlídá
- lokální offline frontu `rotace_supabase_queue_v1`,
- smoke report fronty,
- ruční guard,
- že není zapnutý automatický flush,
- že není zapnuté automatické mazání,
- že audit nemění DB ani Supabase policies.

## Pravidlo
Automatický flush ani cleanup fronty se nespouští. Jakýkoliv ruční zásah do fronty musí být později udělaný jen po výslovném potvrzení a podle konkrétního seznamu položek.
