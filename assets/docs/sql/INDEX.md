# RaK SQL audit archiv

Tahle složka není runtime část aplikace. Obsahuje historické a auditní SQL podklady pro Supabase hardening, rollback kontrolu a heartbeat/online invite RPC.

Aktuálně důležité reference:
- `supabase_rpc_hardening_v828.sql` – kontrola rollbacku restriktivních policies pro online hry po rozbití Piškvorek.
- `supabase_keepalive_v834.sql` – původní návrh tabulky `app_keepalive`.
- `supabase_keepalive_rpc_v837.sql` – aktuálnější RPC heartbeat cesta po opravě RLS problému.
- `supabase_game_accept_invite_rpc_v839.sql` – RPC cesta pro přijetí online pozvánky.

Starší `supabase_rpc_hardening_v809` až `v827` jsou ponechané jen jako auditní stopa. Neaplikovat naslepo bez nové kontroly DB a bez dvoumobilového testu online her.
