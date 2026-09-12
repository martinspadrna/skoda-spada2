// RaK 1.2 (1.155) – Supabase veřejná konfigurace.
window.SUPABASE_CONFIG = {
  url: "https://bkqamcbkiwumsvelahxr.supabase.co",
  publishableKey: "sb_publishable_MYL2dR_WGYFUMf0jKHpUbQ_70mCbUOy"
};

// Produkční načtení rychlé vrstvy pro denní výjimku „kalírna“.
(function loadRakKalirnaDayModOverride() {
  const src = "kalirna-daymod-override.js?v=20260912-main1";
  try {
    if (document.querySelector('script[data-rak-kalirna-daymod-override="1"]')) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.rakKalirnaDaymodOverride = "1";
    (document.head || document.documentElement).appendChild(script);
  } catch (err) {}
})();
