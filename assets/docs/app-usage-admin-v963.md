# RaK v.1.5 (963) – Přehled připojení v administraci

Build v963 přidává do administrace sekci **Přehled připojení**.

Co se ukládá:
- anonymní podpis zařízení `device_key`,
- jméno/profil v appce, pokud je vybraný,
- první a poslední otevření,
- počet otevření,
- verze appky,
- aktuální stránka / hra,
- user-agent a základní info o viewportu,
- hash IP adresy, ne surová IP.

Co se záměrně neukládá:
- surová IP adresa,
- přesná poloha,
- žádné nové herní ani rozpisové online flow.

Supabase část je v `assets/docs/sql/supabase_app_usage_v963.sql`.
