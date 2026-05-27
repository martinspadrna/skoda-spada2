# RaK v.1.5 (926) – témata a pozadí jako profilové odměny

Build v926 mění logiku vzhledu tak, aby vybrané téma a pozadí patřily aktivnímu přihlášenému profilu. LocalStorage zůstává jen jako fallback pro stav mimo profil.

## Co se změnilo

| Oblast | Stav | Poznámka |
|---|---:|---|
| Uložení aktivního tématu | OK | Při přihlášeném profilu se ukládá do `account.uiSettings.themeId`. |
| Uložení aktivního pozadí | OK | Při přihlášeném profilu se ukládá do `account.uiSettings.backgroundId`. |
| Nový profil | OK | Nepřebírá vzhled po předchozím profilu; začíná na výchozím vzhledu. |
| Odměnové zamykání | OK | Témata a pozadí se odemykají podle her, achievementů nebo ranku. |
| Syté varianty | OK | Přidané výrazné neon/lava/acid/violet varianty. |

## Nové syté motivy

- `hyper-magenta` – růžovo-fialový arcade skin,
- `acid-cyber` – limetka a cyan,
- `lava-core` – červenooranžová odměna,
- `ultra-violet` – sytá ultrafialová.

## Nová sytá pozadí

- `neon-carnival`,
- `lava-neon`,
- `acid-night`,
- `violet-blackout`.

## Runtime helper

`getRakProfileAppearanceRewardHealth()` vrací stav aktivního profilu, počet témat/pozadí, počet odemčených odměn a storage klíče používané pro profilové uložení.

## Ruční ověření

1. Přihlásit profil A.
2. Vybrat jiné téma a jiné pozadí.
3. Přepnout na profil B a ověřit, že se nenačte vzhled profilu A.
4. Vrátit se na profil A a ověřit, že se jeho vzhled obnoví.
5. Zkusit kliknout na zamčené téma/pozadí a ověřit, že se neaktivuje.
6. Po získání ranku/achievementu ověřit, že se odměna odemkne.

## Nelze potvrdit bez reálného testu

- vzdálená synchronizace UI nastavení přes přihlášený profil v produkčním prostředí,
- vizuální čitelnost všech sytých témat na konkrétním telefonu,
- cache/PWA chování po nasazení.
