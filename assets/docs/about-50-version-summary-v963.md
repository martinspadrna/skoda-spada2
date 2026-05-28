# Souhrn v.1.5 (963)

- Administrace dostala nový **Přehled připojení**.
- Appka zapisuje anonymní podpis zařízení, profil, poslední otevření, počet otevření, verzi, zařízení a viewport.
- Surová IP se neukládá; pro rozlišení je připravený pouze hash IP přes Supabase RPC.
- Přidaná SQL migrace `assets/docs/sql/supabase_app_usage_v963.sql` a admin RPC `rak_admin_get_app_usage`.
- Online hry, rozpisy, machine settings, Piškvorky PvP a pravidla AI zůstaly mimo zásah.
