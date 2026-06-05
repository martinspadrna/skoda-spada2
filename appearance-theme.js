// RaK 1.2 (1.131) – theme, pozadí a profilové UI nastavení.

const RAK_THEME_STORAGE_KEY = APP_KEY + ':theme_v1';
const RAK_THEME_BASE_VARS = {
  '--bg': '#0b0f0c',
  '--panel': '#151a17',
  '--panel2': '#1c1f1d',
  '--green': '#4CAF50',
  '--green2': '#7CFF7C',
  '--text': '#ffffff',
  '--muted': '#777',
  '--soft': '#ccc'
};
const RAK_THEME_DEFS = [
  {
    "id": "default",
    "label": "RaK glass",
    "subtitle": "Základní zelený glass styl",
    "color": "#7CFF7C",
    "unlockText": "Vždy dostupné",
    "minPlays": 0,
    "minAchievements": 0,
    "vars": {
      "--bg": "#07100b",
      "--panel": "rgba(18,28,22,.72)",
      "--panel2": "rgba(24,36,28,.68)",
      "--green": "#4ADE80",
      "--green2": "#B7FFBE",
      "--muted": "#91a396",
      "--soft": "#e5f7e9",
      "--rakThemeGlow": "rgba(124,255,124,.30)",
      "--rakThemeBorder": "rgba(124,255,124,.20)"
    }
  },
  {
    "id": "emerald-pro",
    "label": "Emerald Pro",
    "subtitle": "Sytá zelená, výraznější aktivní prvky",
    "color": "#00FF88",
    "unlockText": "10 her + 2 achievementy",
    "minPlays": 10,
    "minAchievements": 2,
    "vars": {
      "--bg": "#02110b",
      "--panel": "rgba(5,40,26,.76)",
      "--panel2": "rgba(10,64,42,.68)",
      "--green": "#00FF88",
      "--green2": "#B6FFD8",
      "--muted": "#8bc2a6",
      "--soft": "#e8fff2",
      "--rakThemeGlow": "rgba(0,255,136,.36)",
      "--rakThemeBorder": "rgba(0,255,136,.28)"
    }
  },
  {
    "id": "midnight-blue",
    "label": "Midnight Blue",
    "subtitle": "Modrý OLED kontrast s chladným glow",
    "color": "#38BDF8",
    "unlockText": "20 her + 4 achievementy",
    "minPlays": 20,
    "minAchievements": 4,
    "vars": {
      "--bg": "#020617",
      "--panel": "rgba(9,22,49,.78)",
      "--panel2": "rgba(18,39,82,.68)",
      "--green": "#38BDF8",
      "--green2": "#BAE6FD",
      "--muted": "#90a9c4",
      "--soft": "#e8f5ff",
      "--rakThemeGlow": "rgba(56,189,248,.38)",
      "--rakThemeBorder": "rgba(56,189,248,.28)"
    }
  },
  {
    "id": "cyber-cyan",
    "label": "Cyber Cyan",
    "subtitle": "Tyrkysový neon s ostrým futuristickým akcentem",
    "color": "#00F5FF",
    "unlockText": "35 her + 6 achievementů",
    "minPlays": 35,
    "minAchievements": 6,
    "vars": {
      "--bg": "#001217",
      "--panel": "rgba(0,35,45,.78)",
      "--panel2": "rgba(0,68,78,.62)",
      "--green": "#00F5FF",
      "--green2": "#B8FEFF",
      "--muted": "#8fc8cf",
      "--soft": "#e8ffff",
      "--rakThemeGlow": "rgba(0,245,255,.42)",
      "--rakThemeBorder": "rgba(0,245,255,.30)"
    }
  },
  {
    "id": "violet-pulse",
    "label": "Violet Pulse",
    "subtitle": "Fialovo-růžový neon, hodně viditelná změna UI",
    "color": "#D946EF",
    "unlockText": "50 her + 8 achievementů",
    "minPlays": 50,
    "minAchievements": 8,
    "vars": {
      "--bg": "#12061b",
      "--panel": "rgba(45,16,65,.78)",
      "--panel2": "rgba(72,23,96,.66)",
      "--green": "#D946EF",
      "--green2": "#F5D0FE",
      "--muted": "#c39acb",
      "--soft": "#faeaff",
      "--rakThemeGlow": "rgba(217,70,239,.40)",
      "--rakThemeBorder": "rgba(217,70,239,.30)"
    }
  },
  {
    "id": "crimson-alert",
    "label": "Crimson Alert",
    "subtitle": "Červený sportovní skin s výrazným glow",
    "color": "#FF3B3B",
    "unlockText": "65 her + 10 achievementů",
    "minPlays": 65,
    "minAchievements": 10,
    "vars": {
      "--bg": "#150608",
      "--panel": "rgba(55,12,18,.78)",
      "--panel2": "rgba(82,18,26,.66)",
      "--green": "#FF3B3B",
      "--green2": "#FFC9C9",
      "--muted": "#c99a9d",
      "--soft": "#fff0f0",
      "--rakThemeGlow": "rgba(255,59,59,.42)",
      "--rakThemeBorder": "rgba(255,59,59,.32)"
    }
  },
  {
    "id": "sunset-plasma",
    "label": "Sunset Plasma",
    "subtitle": "Oranžovo-růžový teplý glass",
    "color": "#FB923C",
    "unlockText": "80 her + 12 achievementů",
    "minPlays": 80,
    "minAchievements": 12,
    "vars": {
      "--bg": "#17090a",
      "--panel": "rgba(65,28,18,.76)",
      "--panel2": "rgba(92,38,24,.64)",
      "--green": "#FB923C",
      "--green2": "#FED7AA",
      "--muted": "#c7a28f",
      "--soft": "#fff4e8",
      "--rakThemeGlow": "rgba(251,146,60,.40)",
      "--rakThemeBorder": "rgba(251,146,60,.30)"
    }
  },
  {
    "id": "graphite",
    "label": "Titanium Graphite",
    "subtitle": "Prémiově šedý dark mód bez barevného cirkusu",
    "color": "#CBD5E1",
    "unlockText": "100 her + 14 achievementů",
    "minPlays": 100,
    "minAchievements": 14,
    "vars": {
      "--bg": "#05070a",
      "--panel": "rgba(17,24,39,.78)",
      "--panel2": "rgba(31,41,55,.66)",
      "--green": "#CBD5E1",
      "--green2": "#F8FAFC",
      "--muted": "#a7b0bd",
      "--soft": "#edf2f7",
      "--rakThemeGlow": "rgba(203,213,225,.28)",
      "--rakThemeBorder": "rgba(203,213,225,.22)"
    }
  },
  {
    "id": "ice-prism",
    "label": "Ice Prism",
    "subtitle": "Ledově světlý cyan/teal akcent",
    "color": "#99F6E4",
    "unlockText": "120 her + 16 achievementů",
    "minPlays": 120,
    "minAchievements": 16,
    "vars": {
      "--bg": "#011011",
      "--panel": "rgba(10,49,59,.74)",
      "--panel2": "rgba(17,90,92,.58)",
      "--green": "#99F6E4",
      "--green2": "#CCFBF1",
      "--muted": "#9ec5c3",
      "--soft": "#edfffb",
      "--rakThemeGlow": "rgba(153,246,228,.38)",
      "--rakThemeBorder": "rgba(153,246,228,.30)"
    }
  },
  {
    "id": "toxic-lime",
    "label": "Toxic Lime",
    "subtitle": "Fosforová limetka pro maximální arcade vibe",
    "color": "#C6FF00",
    "unlockText": "145 her + 18 achievementů",
    "minPlays": 145,
    "minAchievements": 18,
    "vars": {
      "--bg": "#071100",
      "--panel": "rgba(25,45,4,.78)",
      "--panel2": "rgba(46,72,8,.64)",
      "--green": "#C6FF00",
      "--green2": "#F1FFB3",
      "--muted": "#b6c98f",
      "--soft": "#fbffe6",
      "--rakThemeGlow": "rgba(198,255,0,.42)",
      "--rakThemeBorder": "rgba(198,255,0,.32)"
    }
  },
  {
    "id": "royal-gold",
    "label": "Royal Gold",
    "subtitle": "Zlatý achievement skin pro dlouhodobé hraní",
    "color": "#FACC15",
    "unlockText": "170 her + 20 achievementů",
    "minPlays": 170,
    "minAchievements": 20,
    "vars": {
      "--bg": "#130d02",
      "--panel": "rgba(54,38,5,.78)",
      "--panel2": "rgba(84,58,8,.66)",
      "--green": "#FACC15",
      "--green2": "#FEF3C7",
      "--muted": "#c7b78a",
      "--soft": "#fff8dc",
      "--rakThemeGlow": "rgba(250,204,21,.40)",
      "--rakThemeBorder": "rgba(250,204,21,.32)"
    }
  },
  {
    "id": "amoled-legend",
    "label": "AMOLED Legend",
    "subtitle": "Skoro černá, ostrý neon, odměna pro největší grind",
    "color": "#B8FF67",
    "unlockText": "200 her + 22 achievementů",
    "minPlays": 200,
    "minAchievements": 22,
    "vars": {
      "--bg": "#000000",
      "--panel": "rgba(5,8,6,.86)",
      "--panel2": "rgba(10,16,11,.74)",
      "--green": "#B8FF67",
      "--green2": "#ECFCCB",
      "--muted": "#939c91",
      "--soft": "#f4ffe9",
      "--rakThemeGlow": "rgba(184,255,103,.45)",
      "--rakThemeBorder": "rgba(184,255,103,.34)"
    }
  },
  {
    "id": "hyper-magenta",
    "label": "Hyper Magenta",
    "subtitle": "Hodně sytý růžovo-fialový arcade skin",
    "color": "#FF00E5",
    "unlockText": "Rank Mistr nebo 28 achievementů",
    "minRank": "Mistr",
    "minAchievements": 28,
    "vars": {
      "--bg": "#16001f",
      "--panel": "rgba(64,0,82,.82)",
      "--panel2": "rgba(110,0,135,.66)",
      "--green": "#FF00E5",
      "--green2": "#FFD1FA",
      "--muted": "#d89de0",
      "--soft": "#fff0ff",
      "--rakThemeGlow": "rgba(255,0,229,.54)",
      "--rakThemeBorder": "rgba(255,0,229,.38)"
    }
  },
  {
    "id": "acid-cyber",
    "label": "Acid Cyber",
    "subtitle": "Kyselá limetka a cyan, opravdu výrazné UI",
    "color": "#D7FF00",
    "unlockText": "Rank Senior nebo 34 achievementů",
    "minRank": "Senior",
    "minAchievements": 34,
    "vars": {
      "--bg": "#050a00",
      "--panel": "rgba(25,44,0,.86)",
      "--panel2": "rgba(50,82,0,.72)",
      "--green": "#D7FF00",
      "--green2": "#F5FF9E",
      "--muted": "#c8d889",
      "--soft": "#fdffe8",
      "--rakThemeGlow": "rgba(215,255,0,.56)",
      "--rakThemeBorder": "rgba(215,255,0,.40)"
    }
  },
  {
    "id": "lava-core",
    "label": "Lava Core",
    "subtitle": "Sytá červená a oranžová jako herní reward",
    "color": "#FF2D00",
    "unlockText": "Rank Legenda RaK nebo 42 achievementů",
    "minRank": "Legenda RaK",
    "minAchievements": 42,
    "vars": {
      "--bg": "#180200",
      "--panel": "rgba(70,11,0,.86)",
      "--panel2": "rgba(124,23,0,.72)",
      "--green": "#FF2D00",
      "--green2": "#FFD3C7",
      "--muted": "#d8a192",
      "--soft": "#fff1ed",
      "--rakThemeGlow": "rgba(255,45,0,.58)",
      "--rakThemeBorder": "rgba(255,45,0,.42)"
    }
  },
  {
    "id": "storm-signal",
    "label": "Storm Signal",
    "subtitle": "Cyan, limetka a červený signál jako výrazný pozdní reward",
    "color": "#22D3EE",
    "unlockText": "Rank Legenda RaK nebo 46 achievementů",
    "minAchievements": 46,
    "vars": {
      "--bg": "#020617",
      "--panel": "rgba(3,20,38,.86)",
      "--panel2": "rgba(5,35,62,.72)",
      "--green": "#22D3EE",
      "--green2": "#D7FF00",
      "--muted": "#9ccfd8",
      "--soft": "#effcff",
      "--rakThemeGlow": "rgba(34,211,238,.62)",
      "--rakThemeBorder": "rgba(215,255,0,.34)",
      "--rakThemeAccentStrong": "#22D3EE",
      "--rakThemeAccentSoft": "#D7FF00"
    },
    "minRank": "Legenda RaK"
  },
  {
    "id": "matrix-redline",
    "label": "Matrix Redline",
    "subtitle": "Černý tech skin se zeleným kontrastem a červenou linkou",
    "color": "#22C55E",
    "unlockText": "Rank RaK nesmrtelný nebo 52 achievementů",
    "minAchievements": 52,
    "vars": {
      "--bg": "#020403",
      "--panel": "rgba(3,16,12,.88)",
      "--panel2": "rgba(12,28,24,.74)",
      "--green": "#22C55E",
      "--green2": "#FF3B3B",
      "--muted": "#95b9a4",
      "--soft": "#effff4",
      "--rakThemeGlow": "rgba(34,197,94,.50)",
      "--rakThemeBorder": "rgba(255,59,59,.30)",
      "--rakThemeAccentStrong": "#22C55E",
      "--rakThemeAccentSoft": "#FF3B3B"
    },
    "minRank": "RaK nesmrtelný"
  },
  {
    "id": "light-brown",
    "label": "Světlý modrý",
    "subtitle": "Bílý základ s modrým písmem a okraji",
    "color": "#2563EB",
    "unlockText": "Vždy dostupné",
    "minPlays": 0,
    "minAchievements": 0,
    "vars": {
      "--bg": "#f7fbff",
      "--panel": "rgba(255,255,255,.90)",
      "--panel2": "rgba(232,241,255,.86)",
      "--green": "#2563EB",
      "--green2": "#60A5FA",
      "--text": "#0F2E5F",
      "--muted": "#486A98",
      "--soft": "#08275A",
      "--rakThemeGlow": "rgba(37,99,235,.20)",
      "--rakThemeBorder": "rgba(37,99,235,.34)",
      "--rakThemeAccentStrong": "#2563EB",
      "--rakThemeAccentSoft": "#93C5FD"
    }
  }
];
window.RAK_THEME_DEFS = RAK_THEME_DEFS;

const RAK_BACKGROUND_STORAGE_KEY = APP_KEY + ':background_v1';
const RAK_BACKGROUND_BASE_VARS = {
  '--rakBgBase': '#050816',
  '--rakAppBackground': 'radial-gradient(circle at 16% 10%, rgba(56,189,248,.24), transparent 32%), radial-gradient(circle at 84% 18%, rgba(168,85,247,.20), transparent 35%), radial-gradient(circle at 52% 86%, rgba(20,184,166,.16), transparent 38%), linear-gradient(160deg, #050816 0%, #08111f 46%, #0f172a 100%)',
  '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(4,8,18,.40), transparent 26%, rgba(255,255,255,.035) 50%, transparent 74%, rgba(4,8,18,.40)), radial-gradient(circle at 48% 44%, rgba(255,255,255,.055), transparent 44%)',
  '--rakAppBackgroundLite': 'linear-gradient(160deg, #050816 0%, #08111f 52%, #0f172a 100%)',
  '--rakBgAccent': 'rgba(56,189,248,.24)'
};
const RAK_BACKGROUND_DEFS = [
  {
    "id": "ios-mesh",
    "label": "iOS mesh",
    "subtitle": "Tmavé modro-fialové pozadí pro glass",
    "color": "#38bdf8",
    "swatch": "radial-gradient(circle at 18% 18%, rgba(56,189,248,.95), transparent 34%), radial-gradient(circle at 82% 22%, rgba(168,85,247,.80), transparent 36%), radial-gradient(circle at 48% 82%, rgba(20,184,166,.70), transparent 40%), linear-gradient(145deg, #050816, #0f172a)",
    "vars": {
      "--rakBgBase": "#050816",
      "--rakAppBackground": "radial-gradient(circle at 15% 10%, rgba(56,189,248,.24), transparent 32%), radial-gradient(circle at 84% 17%, rgba(168,85,247,.20), transparent 34%), radial-gradient(circle at 52% 86%, rgba(20,184,166,.16), transparent 38%), linear-gradient(160deg, #050816 0%, #08111f 45%, #0f172a 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(4,8,18,.42), transparent 25%, rgba(255,255,255,.035) 50%, transparent 75%, rgba(4,8,18,.42)), radial-gradient(circle at 46% 42%, rgba(255,255,255,.055), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #050816 0%, #08111f 52%, #0f172a 100%)",
      "--rakBgAccent": "rgba(56,189,248,.24)"
    }
  },
  {
    "id": "skoda-green",
    "label": "Škoda glass",
    "subtitle": "Emerald + Electric green",
    "color": "#78FAAE",
    "swatch": "radial-gradient(circle at 18% 18%, rgba(120,250,174,.95), transparent 34%), radial-gradient(circle at 78% 18%, rgba(14,58,47,.96), transparent 42%), radial-gradient(circle at 55% 86%, rgba(63,215,142,.72), transparent 42%), linear-gradient(145deg, #04100d, #0E3A2F)",
    "vars": {
      "--rakBgBase": "#04100d",
      "--rakAppBackground": "radial-gradient(circle at 14% 12%, rgba(120,250,174,.26), transparent 32%), radial-gradient(circle at 86% 18%, rgba(14,58,47,.72), transparent 38%), radial-gradient(circle at 55% 86%, rgba(38,208,132,.18), transparent 42%), linear-gradient(160deg, #030a08 0%, #082019 48%, #0E3A2F 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(3,10,8,.48), transparent 26%, rgba(120,250,174,.040) 50%, transparent 74%, rgba(3,10,8,.48)), radial-gradient(circle at 48% 42%, rgba(120,250,174,.070), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #030a08 0%, #082019 55%, #0E3A2F 100%)",
      "--rakBgAccent": "rgba(120,250,174,.26)",
      "--green": "#78FAAE",
      "--green2": "#B9FFD6"
    }
  },
  {
    "id": "light-green",
    "label": "Světle zelená",
    "subtitle": "Jemné světlé green glass pozadí",
    "color": "#A7FFB0",
    "swatch": "radial-gradient(circle at 18% 20%, rgba(180,255,187,.98), transparent 34%), radial-gradient(circle at 80% 24%, rgba(80,230,145,.78), transparent 36%), radial-gradient(circle at 50% 86%, rgba(125,255,205,.62), transparent 42%), linear-gradient(145deg, #06130b, #11351d)",
    "vars": {
      "--rakBgBase": "#06130b",
      "--rakAppBackground": "radial-gradient(circle at 16% 12%, rgba(180,255,187,.24), transparent 32%), radial-gradient(circle at 84% 20%, rgba(88,230,148,.18), transparent 35%), radial-gradient(circle at 52% 86%, rgba(125,255,205,.15), transparent 42%), linear-gradient(160deg, #041008 0%, #0c2815 48%, #11351d 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(3,10,5,.44), transparent 27%, rgba(180,255,187,.040) 50%, transparent 73%, rgba(3,10,5,.44)), radial-gradient(circle at 45% 42%, rgba(180,255,187,.060), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #041008 0%, #0c2815 55%, #11351d 100%)",
      "--rakBgAccent": "rgba(180,255,187,.24)",
      "--green": "#A7FFB0",
      "--green2": "#D7FFDB"
    }
  },
  {
    "id": "deep-aurora",
    "label": "Deep aurora",
    "subtitle": "Tyrkys + modrá pro výrazný glass",
    "color": "#22d3ee",
    "swatch": "radial-gradient(circle at 20% 18%, rgba(34,211,238,.90), transparent 34%), radial-gradient(circle at 80% 20%, rgba(37,99,235,.80), transparent 38%), radial-gradient(circle at 52% 86%, rgba(14,165,233,.58), transparent 42%), linear-gradient(145deg, #03121d, #061826)",
    "vars": {
      "--rakBgBase": "#03121d",
      "--rakAppBackground": "radial-gradient(circle at 16% 12%, rgba(34,211,238,.22), transparent 32%), radial-gradient(circle at 86% 18%, rgba(37,99,235,.22), transparent 36%), radial-gradient(circle at 52% 86%, rgba(14,165,233,.15), transparent 42%), linear-gradient(160deg, #020912 0%, #061826 48%, #0b1326 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,9,18,.46), transparent 26%, rgba(34,211,238,.035) 50%, transparent 74%, rgba(2,9,18,.46)), radial-gradient(circle at 45% 42%, rgba(255,255,255,.045), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020912 0%, #061826 55%, #0b1326 100%)",
      "--rakBgAccent": "rgba(34,211,238,.22)"
    }
  },
  {
    "id": "ember",
    "label": "Ember glass",
    "subtitle": "Teplejší oranžovo-fialový kontrast",
    "color": "#fb923c",
    "swatch": "radial-gradient(circle at 22% 76%, rgba(251,146,60,.92), transparent 34%), radial-gradient(circle at 76% 24%, rgba(190,24,93,.70), transparent 38%), radial-gradient(circle at 36% 18%, rgba(124,58,237,.56), transparent 40%), linear-gradient(145deg, #14070d, #260b12)",
    "vars": {
      "--rakBgBase": "#14070d",
      "--rakAppBackground": "radial-gradient(circle at 22% 76%, rgba(251,146,60,.22), transparent 34%), radial-gradient(circle at 78% 18%, rgba(190,24,93,.18), transparent 36%), radial-gradient(circle at 36% 18%, rgba(124,58,237,.14), transparent 40%), linear-gradient(160deg, #09050b 0%, #1a0710 48%, #26100b 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(9,5,11,.48), transparent 27%, rgba(251,146,60,.035) 50%, transparent 73%, rgba(9,5,11,.48)), radial-gradient(circle at 45% 42%, rgba(255,255,255,.040), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #09050b 0%, #1a0710 55%, #26100b 100%)",
      "--rakBgAccent": "rgba(251,146,60,.22)"
    }
  },
  {
    "id": "neon-lagoon",
    "label": "Neon lagoon",
    "subtitle": "Výrazný tyrkys, fialová a teplý glow",
    "color": "#22d3ee",
    "swatch": "radial-gradient(circle at 18% 18%, rgba(34,211,238,.98), transparent 34%), radial-gradient(circle at 82% 18%, rgba(217,70,239,.82), transparent 36%), radial-gradient(circle at 34% 84%, rgba(251,146,60,.72), transparent 38%), linear-gradient(145deg, #020617, #111827)",
    "vars": {
      "--rakBgBase": "#020617",
      "--rakAppBackground": "radial-gradient(circle at 14% 12%, rgba(34,211,238,.30), transparent 32%), radial-gradient(circle at 86% 18%, rgba(217,70,239,.24), transparent 35%), radial-gradient(circle at 34% 86%, rgba(251,146,60,.18), transparent 39%), radial-gradient(circle at 62% 48%, rgba(59,130,246,.16), transparent 42%), linear-gradient(160deg, #020617 0%, #08111f 46%, #111827 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,6,23,.48), transparent 25%, rgba(34,211,238,.052) 50%, transparent 75%, rgba(2,6,23,.48)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.070), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020617 0%, #08111f 55%, #111827 100%)",
      "--rakBgAccent": "rgba(34,211,238,.30)",
      "--green": "#22d3ee",
      "--green2": "#a5f3fc"
    }
  },
  {
    "id": "electric-lime",
    "label": "Electric lime",
    "subtitle": "Hodně výrazná světle zelená pro glass",
    "color": "#bef264",
    "swatch": "radial-gradient(circle at 18% 20%, rgba(190,242,100,.98), transparent 33%), radial-gradient(circle at 82% 20%, rgba(34,197,94,.86), transparent 37%), radial-gradient(circle at 50% 84%, rgba(20,184,166,.66), transparent 42%), linear-gradient(145deg, #031108, #17351c)",
    "vars": {
      "--rakBgBase": "#031108",
      "--rakAppBackground": "radial-gradient(circle at 15% 12%, rgba(190,242,100,.30), transparent 31%), radial-gradient(circle at 86% 19%, rgba(34,197,94,.23), transparent 36%), radial-gradient(circle at 52% 84%, rgba(20,184,166,.18), transparent 42%), linear-gradient(160deg, #020a05 0%, #0a2410 48%, #17351c 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,10,5,.46), transparent 26%, rgba(190,242,100,.056) 50%, transparent 74%, rgba(2,10,5,.46)), radial-gradient(circle at 48% 40%, rgba(190,242,100,.075), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020a05 0%, #0a2410 55%, #17351c 100%)",
      "--rakBgAccent": "rgba(190,242,100,.30)",
      "--green": "#bef264",
      "--green2": "#ecfccb"
    }
  },
  {
    "id": "skoda-electric",
    "label": "Škoda electric",
    "subtitle": "Výraznější zelený Škoda směr",
    "color": "#78FAAE",
    "swatch": "radial-gradient(circle at 16% 16%, rgba(120,250,174,.98), transparent 34%), radial-gradient(circle at 84% 22%, rgba(0,168,107,.88), transparent 37%), radial-gradient(circle at 50% 86%, rgba(12,64,48,.88), transparent 44%), linear-gradient(145deg, #020805, #0e3a2f)",
    "vars": {
      "--rakBgBase": "#020805",
      "--rakAppBackground": "radial-gradient(circle at 13% 10%, rgba(120,250,174,.34), transparent 31%), radial-gradient(circle at 86% 20%, rgba(0,168,107,.26), transparent 36%), radial-gradient(circle at 54% 86%, rgba(12,64,48,.54), transparent 44%), radial-gradient(circle at 42% 42%, rgba(185,255,214,.10), transparent 42%), linear-gradient(160deg, #020805 0%, #062018 48%, #0e3a2f 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,8,5,.50), transparent 25%, rgba(120,250,174,.064) 50%, transparent 75%, rgba(2,8,5,.50)), radial-gradient(circle at 47% 42%, rgba(120,250,174,.086), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020805 0%, #062018 55%, #0e3a2f 100%)",
      "--rakBgAccent": "rgba(120,250,174,.34)",
      "--green": "#78FAAE",
      "--green2": "#d5ffe5"
    }
  },
  {
    "id": "candy-glass",
    "label": "Candy glass",
    "subtitle": "Modro-fialovo-růžové iOS pozadí",
    "color": "#c084fc",
    "swatch": "radial-gradient(circle at 18% 18%, rgba(96,165,250,.96), transparent 34%), radial-gradient(circle at 82% 20%, rgba(236,72,153,.86), transparent 38%), radial-gradient(circle at 50% 86%, rgba(168,85,247,.74), transparent 42%), linear-gradient(145deg, #07051c, #1e1b4b)",
    "vars": {
      "--rakBgBase": "#07051c",
      "--rakAppBackground": "radial-gradient(circle at 14% 12%, rgba(96,165,250,.28), transparent 32%), radial-gradient(circle at 86% 18%, rgba(236,72,153,.24), transparent 37%), radial-gradient(circle at 52% 86%, rgba(168,85,247,.20), transparent 42%), linear-gradient(160deg, #050316 0%, #111042 48%, #1e1b4b 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(5,3,22,.48), transparent 26%, rgba(236,72,153,.045) 50%, transparent 74%, rgba(5,3,22,.48)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.065), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #050316 0%, #111042 55%, #1e1b4b 100%)",
      "--rakBgAccent": "rgba(236,72,153,.24)",
      "--green": "#c084fc",
      "--green2": "#f0abfc"
    }
  },
  {
    "id": "aurora-punch",
    "label": "Aurora punch",
    "subtitle": "Hodně výrazná modrá, růžová a tyrkys",
    "color": "#38bdf8",
    "swatch": "radial-gradient(circle at 14% 18%, rgba(56,189,248,.98), transparent 32%), radial-gradient(circle at 82% 18%, rgba(244,114,182,.92), transparent 36%), radial-gradient(circle at 48% 86%, rgba(45,212,191,.78), transparent 42%), linear-gradient(145deg, #020617, #172554)",
    "vars": {
      "--rakBgBase": "#020617",
      "--rakAppBackground": "radial-gradient(circle at 12% 10%, rgba(56,189,248,.36), transparent 31%), radial-gradient(circle at 86% 18%, rgba(244,114,182,.28), transparent 36%), radial-gradient(circle at 50% 86%, rgba(45,212,191,.20), transparent 42%), radial-gradient(circle at 42% 44%, rgba(129,140,248,.18), transparent 43%), linear-gradient(160deg, #020617 0%, #071633 48%, #172554 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,6,23,.48), transparent 24%, rgba(56,189,248,.060) 50%, transparent 76%, rgba(2,6,23,.48)), radial-gradient(circle at 46% 42%, rgba(255,255,255,.085), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020617 0%, #071633 55%, #172554 100%)",
      "--rakBgAccent": "rgba(56,189,248,.36)",
      "--green": "#38bdf8",
      "--green2": "#bae6fd"
    }
  },
  {
    "id": "violet-storm",
    "label": "Violet storm",
    "subtitle": "Fialová bouřka s neonovým sklem",
    "color": "#a78bfa",
    "swatch": "radial-gradient(circle at 18% 16%, rgba(167,139,250,.98), transparent 34%), radial-gradient(circle at 80% 18%, rgba(59,130,246,.78), transparent 37%), radial-gradient(circle at 48% 86%, rgba(236,72,153,.68), transparent 42%), linear-gradient(145deg, #09051c, #2e1065)",
    "vars": {
      "--rakBgBase": "#09051c",
      "--rakAppBackground": "radial-gradient(circle at 14% 12%, rgba(167,139,250,.32), transparent 32%), radial-gradient(circle at 84% 18%, rgba(59,130,246,.22), transparent 36%), radial-gradient(circle at 52% 86%, rgba(236,72,153,.18), transparent 42%), radial-gradient(circle at 44% 42%, rgba(255,255,255,.08), transparent 43%), linear-gradient(160deg, #060316 0%, #171044 48%, #2e1065 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(6,3,22,.48), transparent 25%, rgba(167,139,250,.060) 50%, transparent 75%, rgba(6,3,22,.48)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.080), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #060316 0%, #171044 55%, #2e1065 100%)",
      "--rakBgAccent": "rgba(167,139,250,.32)",
      "--green": "#a78bfa",
      "--green2": "#ddd6fe"
    }
  },
  {
    "id": "sunset-plasma",
    "label": "Sunset plasma",
    "subtitle": "Oranžovo-růžové výrazné pozadí",
    "color": "#fb7185",
    "swatch": "radial-gradient(circle at 16% 18%, rgba(251,113,133,.96), transparent 34%), radial-gradient(circle at 82% 20%, rgba(251,146,60,.88), transparent 38%), radial-gradient(circle at 50% 86%, rgba(168,85,247,.62), transparent 42%), linear-gradient(145deg, #17050c, #431407)",
    "vars": {
      "--rakBgBase": "#17050c",
      "--rakAppBackground": "radial-gradient(circle at 13% 11%, rgba(251,113,133,.30), transparent 32%), radial-gradient(circle at 86% 19%, rgba(251,146,60,.25), transparent 37%), radial-gradient(circle at 50% 86%, rgba(168,85,247,.16), transparent 42%), linear-gradient(160deg, #10030a 0%, #2a0714 48%, #431407 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(16,3,10,.50), transparent 25%, rgba(251,146,60,.062) 50%, transparent 75%, rgba(16,3,10,.50)), radial-gradient(circle at 47% 42%, rgba(255,255,255,.070), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #10030a 0%, #2a0714 55%, #431407 100%)",
      "--rakBgAccent": "rgba(251,113,133,.30)",
      "--green": "#fb7185",
      "--green2": "#fecdd3"
    }
  },
  {
    "id": "polar-mint",
    "label": "Polar mint",
    "subtitle": "Ledově mintové sklo s výrazným kontrastem",
    "color": "#99f6e4",
    "swatch": "radial-gradient(circle at 16% 16%, rgba(153,246,228,.98), transparent 34%), radial-gradient(circle at 82% 18%, rgba(34,211,238,.80), transparent 37%), radial-gradient(circle at 50% 86%, rgba(59,130,246,.62), transparent 42%), linear-gradient(145deg, #021011, #083344)",
    "vars": {
      "--rakBgBase": "#021011",
      "--rakAppBackground": "radial-gradient(circle at 13% 10%, rgba(153,246,228,.30), transparent 31%), radial-gradient(circle at 86% 19%, rgba(34,211,238,.24), transparent 36%), radial-gradient(circle at 52% 86%, rgba(59,130,246,.16), transparent 42%), linear-gradient(160deg, #020b0c 0%, #06262b 48%, #083344 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,11,12,.50), transparent 26%, rgba(153,246,228,.060) 50%, transparent 74%, rgba(2,11,12,.50)), radial-gradient(circle at 47% 42%, rgba(255,255,255,.076), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020b0c 0%, #06262b 55%, #083344 100%)",
      "--rakBgAccent": "rgba(153,246,228,.30)",
      "--green": "#99f6e4",
      "--green2": "#ccfbf1"
    }
  },
  {
    "id": "blue-orbit",
    "label": "Blue orbit",
    "subtitle": "Sytě modré orbity pro výraznější glass hrany",
    "color": "#60a5fa",
    "swatch": "radial-gradient(circle at 18% 18%, rgba(96,165,250,.98), transparent 34%), radial-gradient(circle at 84% 22%, rgba(14,165,233,.84), transparent 38%), radial-gradient(circle at 52% 84%, rgba(99,102,241,.72), transparent 42%), linear-gradient(145deg, #020617, #1e1b4b)",
    "vars": {
      "--rakBgBase": "#020617",
      "--rakAppBackground": "radial-gradient(circle at 14% 11%, rgba(96,165,250,.34), transparent 32%), radial-gradient(circle at 86% 19%, rgba(14,165,233,.26), transparent 36%), radial-gradient(circle at 52% 86%, rgba(99,102,241,.20), transparent 42%), radial-gradient(circle at 42% 42%, rgba(255,255,255,.075), transparent 44%), linear-gradient(160deg, #020617 0%, #071633 48%, #1e1b4b 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,6,23,.50), transparent 25%, rgba(96,165,250,.070) 50%, transparent 75%, rgba(2,6,23,.50)), radial-gradient(circle at 47% 42%, rgba(255,255,255,.080), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020617 0%, #071633 55%, #1e1b4b 100%)",
      "--rakBgAccent": "rgba(96,165,250,.34)",
      "--green": "#60a5fa",
      "--green2": "#bfdbfe"
    }
  },
  {
    "id": "magma-lime",
    "label": "Magma lime",
    "subtitle": "Kontrast limetky, oranžové a tmavé hloubky",
    "color": "#bef264",
    "swatch": "radial-gradient(circle at 16% 18%, rgba(190,242,100,.98), transparent 34%), radial-gradient(circle at 82% 20%, rgba(249,115,22,.86), transparent 38%), radial-gradient(circle at 50% 86%, rgba(236,72,153,.66), transparent 42%), linear-gradient(145deg, #080b03, #431407)",
    "vars": {
      "--rakBgBase": "#080b03",
      "--rakAppBackground": "radial-gradient(circle at 13% 10%, rgba(190,242,100,.34), transparent 31%), radial-gradient(circle at 86% 18%, rgba(249,115,22,.26), transparent 37%), radial-gradient(circle at 50% 86%, rgba(236,72,153,.16), transparent 42%), radial-gradient(circle at 44% 44%, rgba(255,255,255,.065), transparent 43%), linear-gradient(160deg, #070902 0%, #1f1605 48%, #431407 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(7,9,2,.52), transparent 25%, rgba(190,242,100,.070) 50%, transparent 75%, rgba(7,9,2,.52)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.074), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #070902 0%, #1f1605 55%, #431407 100%)",
      "--rakBgAccent": "rgba(190,242,100,.34)",
      "--green": "#bef264",
      "--green2": "#ecfccb"
    }
  },
  {
    "id": "storm-signal",
    "label": "Storm signal",
    "subtitle": "Cyan, limetka a červený radar jako pozdní reward pozadí",
    "color": "#22d3ee",
    "swatch": "radial-gradient(circle at 12% 14%, rgba(34,211,238,.98), transparent 32%), radial-gradient(circle at 86% 18%, rgba(215,255,0,.90), transparent 34%), radial-gradient(circle at 54% 86%, rgba(255,45,85,.76), transparent 42%), linear-gradient(145deg, #020617, #111827)",
    "unlockText": "Rank Legenda RaK nebo 48 achievementů",
    "minAchievements": 48,
    "vars": {
      "--rakBgBase": "#020617",
      "--rakAppBackground": "radial-gradient(circle at 12% 9%, rgba(34,211,238,.42), transparent 31%), radial-gradient(circle at 88% 18%, rgba(215,255,0,.27), transparent 35%), radial-gradient(circle at 50% 88%, rgba(255,45,85,.20), transparent 42%), radial-gradient(circle at 45% 42%, rgba(59,130,246,.22), transparent 42%), linear-gradient(160deg, #020617 0%, #071633 48%, #111827 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,6,23,.52), transparent 23%, rgba(34,211,238,.080) 50%, transparent 77%, rgba(2,6,23,.52)), radial-gradient(circle at 48% 42%, rgba(215,255,0,.085), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020617 0%, #071633 55%, #111827 100%)",
      "--rakBgAccent": "rgba(34,211,238,.42)",
      "--green": "#22D3EE",
      "--green2": "#D7FF00"
    },
    "minRank": "Legenda RaK"
  },
  {
    "id": "classic-rak",
    "label": "Původní RaK",
    "subtitle": "Klidnější tmavé zelené pozadí",
    "color": "#7CFF7C",
    "swatch": "radial-gradient(circle at 50% 50%, rgba(124,255,124,.42), transparent 42%), linear-gradient(145deg, #0b0f0c, #141a17)",
    "vars": {
      "--rakBgBase": "#0b0f0c",
      "--rakAppBackground": "linear-gradient(160deg, #0b0f0c 0%, #101612 54%, #141a17 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(11,15,12,.92) 0%, rgba(11,15,12,.62) 26%, rgba(124,255,124,.060) 50%, rgba(11,15,12,.62) 74%, rgba(11,15,12,.92) 100%), radial-gradient(ellipse at center, rgba(124,255,124,.10) 0%, rgba(124,255,124,.05) 22%, rgba(11,15,12,0) 62%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #0b0f0c 0%, #101612 54%, #141a17 100%)",
      "--rakBgAccent": "rgba(124,255,124,.14)"
    }
  },
  {
    "id": "neon-carnival",
    "label": "Neon carnival",
    "subtitle": "Hodně sytý cyan, magenta a limetka",
    "color": "#00f5ff",
    "swatch": "radial-gradient(circle at 12% 18%, rgba(0,245,255,.98), transparent 32%), radial-gradient(circle at 86% 18%, rgba(255,0,229,.92), transparent 36%), radial-gradient(circle at 52% 86%, rgba(215,255,0,.82), transparent 42%), linear-gradient(145deg, #020617, #13001f)",
    "unlockText": "Rank Mistr nebo 28 achievementů",
    "minRank": "Mistr",
    "minAchievements": 28,
    "vars": {
      "--rakBgBase": "#030014",
      "--rakAppBackground": "radial-gradient(circle at 12% 10%, rgba(0,245,255,.42), transparent 31%), radial-gradient(circle at 88% 18%, rgba(255,0,229,.34), transparent 36%), radial-gradient(circle at 52% 88%, rgba(215,255,0,.22), transparent 42%), linear-gradient(160deg, #020617 0%, #090024 48%, #13001f 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,6,23,.52), transparent 24%, rgba(255,255,255,.075) 50%, transparent 76%, rgba(2,6,23,.52)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.09), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020617 0%, #090024 55%, #13001f 100%)",
      "--rakBgAccent": "rgba(0,245,255,.42)",
      "--green": "#00F5FF",
      "--green2": "#D7FF00"
    }
  },
  {
    "id": "lava-neon",
    "label": "Lava neon",
    "subtitle": "Sytá červená, oranžová a růžová",
    "color": "#ff2d00",
    "swatch": "radial-gradient(circle at 16% 18%, rgba(255,45,0,.98), transparent 34%), radial-gradient(circle at 82% 24%, rgba(255,0,119,.86), transparent 38%), radial-gradient(circle at 50% 86%, rgba(250,204,21,.76), transparent 42%), linear-gradient(145deg, #180200, #431407)",
    "unlockText": "Rank Senior nebo 36 achievementů",
    "minRank": "Senior",
    "minAchievements": 36,
    "vars": {
      "--rakBgBase": "#180200",
      "--rakAppBackground": "radial-gradient(circle at 14% 11%, rgba(255,45,0,.42), transparent 32%), radial-gradient(circle at 86% 20%, rgba(255,0,119,.30), transparent 38%), radial-gradient(circle at 52% 86%, rgba(250,204,21,.20), transparent 42%), linear-gradient(160deg, #120200 0%, #2a0714 48%, #431407 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(18,2,0,.54), transparent 24%, rgba(255,210,120,.070) 50%, transparent 76%, rgba(18,2,0,.54)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.070), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #120200 0%, #2a0714 55%, #431407 100%)",
      "--rakBgAccent": "rgba(255,45,0,.42)",
      "--green": "#FF2D00",
      "--green2": "#FFD3C7"
    }
  },
  {
    "id": "acid-night",
    "label": "Acid night",
    "subtitle": "Fosforová limetka na černém glassu",
    "color": "#d7ff00",
    "swatch": "radial-gradient(circle at 18% 18%, rgba(215,255,0,.98), transparent 34%), radial-gradient(circle at 82% 22%, rgba(0,245,255,.78), transparent 38%), radial-gradient(circle at 50% 86%, rgba(34,197,94,.72), transparent 42%), linear-gradient(145deg, #000000, #071100)",
    "unlockText": "Rank Legenda RaK nebo 44 achievementů",
    "minRank": "Legenda RaK",
    "minAchievements": 44,
    "vars": {
      "--rakBgBase": "#000000",
      "--rakAppBackground": "radial-gradient(circle at 13% 10%, rgba(215,255,0,.42), transparent 31%), radial-gradient(circle at 86% 18%, rgba(0,245,255,.25), transparent 37%), radial-gradient(circle at 52% 86%, rgba(34,197,94,.20), transparent 42%), linear-gradient(160deg, #000 0%, #061000 50%, #071100 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(0,0,0,.56), transparent 24%, rgba(215,255,0,.075) 50%, transparent 76%, rgba(0,0,0,.56)), radial-gradient(circle at 48% 42%, rgba(215,255,0,.070), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #000 0%, #061000 55%, #071100 100%)",
      "--rakBgAccent": "rgba(215,255,0,.42)",
      "--green": "#D7FF00",
      "--green2": "#F5FF9E"
    }
  },
  {
    "id": "violet-blackout",
    "label": "Violet blackout",
    "subtitle": "Ultrafialová odměna s tmavým AMOLED dojmem",
    "color": "#7c3aed",
    "swatch": "radial-gradient(circle at 16% 16%, rgba(124,58,237,.98), transparent 34%), radial-gradient(circle at 82% 20%, rgba(255,0,229,.78), transparent 38%), radial-gradient(circle at 50% 86%, rgba(56,189,248,.64), transparent 42%), linear-gradient(145deg, #000000, #090021)",
    "unlockText": "Rank RaK nesmrtelný nebo 55 achievementů",
    "minRank": "RaK nesmrtelný",
    "minAchievements": 55,
    "vars": {
      "--rakBgBase": "#000000",
      "--rakAppBackground": "radial-gradient(circle at 13% 10%, rgba(124,58,237,.40), transparent 31%), radial-gradient(circle at 86% 20%, rgba(255,0,229,.28), transparent 37%), radial-gradient(circle at 52% 86%, rgba(56,189,248,.18), transparent 42%), linear-gradient(160deg, #000 0%, #050015 50%, #090021 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(0,0,0,.56), transparent 24%, rgba(255,255,255,.065) 50%, transparent 76%, rgba(0,0,0,.56)), radial-gradient(circle at 48% 42%, rgba(124,58,237,.080), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #000 0%, #050015 55%, #090021 100%)",
      "--rakBgAccent": "rgba(124,58,237,.40)",
      "--green": "#7C3AED",
      "--green2": "#DDD6FE"
    }
  },
  {
    "id": "midnight-gold",
    "label": "Midnight gold",
    "subtitle": "Tmavě modrá se zlatými paprsky jako pozdní premium pozadí",
    "color": "#facc15",
    "swatch": "radial-gradient(circle at 16% 16%, rgba(250,204,21,.98), transparent 34%), radial-gradient(circle at 82% 18%, rgba(96,165,250,.78), transparent 38%), radial-gradient(circle at 50% 86%, rgba(251,146,60,.66), transparent 42%), linear-gradient(145deg, #020617, #312e05)",
    "unlockText": "Rank RaK nesmrtelný nebo 58 achievementů",
    "minAchievements": 58,
    "vars": {
      "--rakBgBase": "#020617",
      "--rakAppBackground": "radial-gradient(circle at 13% 10%, rgba(250,204,21,.34), transparent 31%), radial-gradient(circle at 86% 18%, rgba(96,165,250,.22), transparent 36%), radial-gradient(circle at 52% 86%, rgba(251,146,60,.18), transparent 42%), linear-gradient(160deg, #020617 0%, #101729 48%, #312e05 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(2,6,23,.56), transparent 24%, rgba(250,204,21,.070) 50%, transparent 76%, rgba(2,6,23,.56)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.068), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(160deg, #020617 0%, #101729 55%, #312e05 100%)",
      "--rakBgAccent": "rgba(250,204,21,.34)",
      "--green": "#facc15",
      "--green2": "#fef3c7"
    },
    "minRank": "RaK nesmrtelný"
  },
  {
    "id": "light-zigzag",
    "label": "Světlý cikcak",
    "subtitle": "Bílé pozadí se světlými úzkými cikcak čárkami",
    "color": "#6B3F22",
    "swatch": "linear-gradient(135deg, rgba(107,63,34,.18) 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(225deg, rgba(107,63,34,.14) 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(315deg, rgba(107,63,34,.10) 25%, transparent 25%) 0 0/16px 16px, linear-gradient(45deg, rgba(107,63,34,.10) 25%, #fffdf8 25%) 0 0/16px 16px",
    "unlockText": "Vždy dostupné",
    "minPlays": 0,
    "minAchievements": 0,
    "vars": {
      "--rakBgBase": "#f8f3eb",
      "--rakAppBackground": "linear-gradient(135deg, rgba(107,63,34,.10) 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(225deg, rgba(107,63,34,.08) 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(315deg, rgba(107,63,34,.065) 25%, transparent 25%) 0 0/24px 24px, linear-gradient(45deg, rgba(107,63,34,.065) 25%, transparent 25%) 0 0/24px 24px, linear-gradient(180deg, #fffefa 0%, #f8f3eb 56%, #efe3d2 100%)",
      "--rakAppBackgroundOverlay": "linear-gradient(90deg, rgba(255,255,255,.70), transparent 24%, rgba(107,63,34,.035) 50%, transparent 76%, rgba(255,255,255,.70)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.48), transparent 46%)",
      "--rakAppBackgroundLite": "linear-gradient(180deg, #fffefa 0%, #f8f3eb 60%, #efe3d2 100%)",
      "--rakBgAccent": "rgba(107,63,34,.18)",
      "--green": "#6B3F22",
      "--green2": "#8B5E34"
    }
  }
];

// RaK 1.2 (1.131) – světlé pracovní patterny pro část existujících pozadí.
// Záměr: zachovat původní ID kvůli kompatibilitě profilů, ale dát zhruba polovině pozadí
// jemnější bílý styl podobný „Světlému cikcaku“ s odlišnými linkami, mřížkami a úhlovými vzory.
const RAK_LIGHT_PATTERN_BACKGROUND_PATCHES_V1131 = Object.freeze({
  'skoda-green': Object.freeze({
    label: 'Škoda linky',
    subtitle: 'Bílé pozadí s jemnými zelenými šikmými linkami',
    color: '#0E7A52',
    swatch: 'repeating-linear-gradient(135deg, rgba(14,122,82,.18) 0 2px, transparent 2px 14px), linear-gradient(180deg, #ffffff 0%, #f3fbf7 100%)',
    vars: Object.freeze({
      '--rakBgBase': '#f3fbf7',
      '--rakAppBackground': 'repeating-linear-gradient(135deg, rgba(14,122,82,.075) 0 1px, transparent 1px 18px), repeating-linear-gradient(45deg, rgba(120,250,174,.050) 0 1px, transparent 1px 28px), linear-gradient(180deg, #ffffff 0%, #f3fbf7 58%, #e8f7ef 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.74), transparent 24%, rgba(14,122,82,.035) 50%, transparent 76%, rgba(255,255,255,.74)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.44), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #f3fbf7 60%, #e8f7ef 100%)',
      '--rakBgAccent': 'rgba(14,122,82,.18)',
      '--green': '#0E7A52',
      '--green2': '#78FAAE'
    })
  }),
  'light-green': Object.freeze({
    label: 'Mint mřížka',
    subtitle: 'Světlý mint základ s tenkou technickou mřížkou',
    color: '#22C55E',
    swatch: 'linear-gradient(rgba(34,197,94,.16) 1px, transparent 1px) 0 0/14px 14px, linear-gradient(90deg, rgba(34,197,94,.12) 1px, transparent 1px) 0 0/14px 14px, linear-gradient(180deg, #ffffff, #f0fff6)',
    vars: Object.freeze({
      '--rakBgBase': '#f0fff6',
      '--rakAppBackground': 'linear-gradient(rgba(34,197,94,.060) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(90deg, rgba(34,197,94,.050) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(180deg, #ffffff 0%, #f0fff6 58%, #e8f8ee 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.76), transparent 24%, rgba(34,197,94,.030) 50%, transparent 76%, rgba(255,255,255,.76))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #f0fff6 64%, #e8f8ee 100%)',
      '--rakBgAccent': 'rgba(34,197,94,.16)',
      '--green': '#22C55E',
      '--green2': '#86EFAC'
    })
  }),
  'deep-aurora': Object.freeze({
    label: 'Modrý blueprint',
    subtitle: 'Bílý podklad s jemnými modrými technickými linkami',
    color: '#2563EB',
    swatch: 'linear-gradient(90deg, rgba(37,99,235,.16) 1px, transparent 1px) 0 0/16px 16px, linear-gradient(rgba(37,99,235,.10) 1px, transparent 1px) 0 0/16px 16px, linear-gradient(180deg, #ffffff, #eef6ff)',
    vars: Object.freeze({
      '--rakBgBase': '#eef6ff',
      '--rakAppBackground': 'linear-gradient(90deg, rgba(37,99,235,.060) 1px, transparent 1px) 0 0/24px 24px, linear-gradient(rgba(37,99,235,.045) 1px, transparent 1px) 0 0/24px 24px, radial-gradient(circle at 80% 16%, rgba(96,165,250,.18), transparent 30%), linear-gradient(180deg, #ffffff 0%, #eef6ff 62%, #e4f0ff 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.75), transparent 24%, rgba(37,99,235,.032) 50%, transparent 76%, rgba(255,255,255,.75))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #eef6ff 62%, #e4f0ff 100%)',
      '--rakBgAccent': 'rgba(37,99,235,.18)',
      '--green': '#2563EB',
      '--green2': '#93C5FD'
    })
  }),
  'ember': Object.freeze({
    label: 'Pískové šipky',
    subtitle: 'Teplé světlé pozadí s úzkými zalomenými linkami',
    color: '#B45309',
    swatch: 'linear-gradient(135deg, rgba(180,83,9,.16) 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(225deg, rgba(180,83,9,.12) 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(180deg, #fffaf2, #f8eddf)',
    vars: Object.freeze({
      '--rakBgBase': '#fff7ed',
      '--rakAppBackground': 'linear-gradient(135deg, rgba(180,83,9,.070) 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(225deg, rgba(180,83,9,.055) 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(180deg, #fffdf8 0%, #fff7ed 58%, #f4e6d6 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.72), transparent 24%, rgba(180,83,9,.032) 50%, transparent 76%, rgba(255,255,255,.72))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #fffdf8 0%, #fff7ed 62%, #f4e6d6 100%)',
      '--rakBgAccent': 'rgba(180,83,9,.18)',
      '--green': '#B45309',
      '--green2': '#FDBA74'
    })
  }),
  'neon-lagoon': Object.freeze({
    label: 'Lagoon vlnky',
    subtitle: 'Světlý tyrkysový podklad s jemnými vlnkami',
    color: '#0891B2',
    swatch: 'radial-gradient(ellipse at 50% 0%, transparent 55%, rgba(8,145,178,.16) 56% 58%, transparent 59%) 0 0/28px 16px, linear-gradient(180deg, #ffffff, #ecfeff)',
    vars: Object.freeze({
      '--rakBgBase': '#ecfeff',
      '--rakAppBackground': 'radial-gradient(ellipse at 50% 0%, transparent 55%, rgba(8,145,178,.060) 56% 58%, transparent 59%) 0 0/34px 20px, radial-gradient(circle at 18% 16%, rgba(34,211,238,.16), transparent 30%), linear-gradient(180deg, #ffffff 0%, #ecfeff 58%, #dff8fb 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.75), transparent 24%, rgba(8,145,178,.030) 50%, transparent 76%, rgba(255,255,255,.75))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #ecfeff 60%, #dff8fb 100%)',
      '--rakBgAccent': 'rgba(8,145,178,.18)',
      '--green': '#0891B2',
      '--green2': '#67E8F9'
    })
  }),
  'electric-lime': Object.freeze({
    label: 'Limetkové řezy',
    subtitle: 'Bílý základ s ostrými limetkovými řezy',
    color: '#65A30D',
    swatch: 'repeating-linear-gradient(60deg, rgba(101,163,13,.18) 0 2px, transparent 2px 15px), linear-gradient(180deg, #ffffff, #f7fee7)',
    vars: Object.freeze({
      '--rakBgBase': '#f7fee7',
      '--rakAppBackground': 'repeating-linear-gradient(60deg, rgba(101,163,13,.070) 0 1px, transparent 1px 20px), repeating-linear-gradient(120deg, rgba(190,242,100,.050) 0 1px, transparent 1px 34px), linear-gradient(180deg, #ffffff 0%, #f7fee7 58%, #eff8d6 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.74), transparent 24%, rgba(101,163,13,.030) 50%, transparent 76%, rgba(255,255,255,.74))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #f7fee7 62%, #eff8d6 100%)',
      '--rakBgAccent': 'rgba(101,163,13,.18)',
      '--green': '#65A30D',
      '--green2': '#BEF264'
    })
  }),
  'skoda-electric': Object.freeze({
    label: 'Zelený okruh',
    subtitle: 'Světlé pozadí s propojenými úhlovými linkami',
    color: '#047857',
    swatch: 'linear-gradient(45deg, transparent 44%, rgba(4,120,87,.16) 45% 55%, transparent 56%) 0 0/22px 22px, linear-gradient(-45deg, transparent 44%, rgba(4,120,87,.12) 45% 55%, transparent 56%) 0 0/22px 22px, linear-gradient(180deg, #ffffff, #effdf5)',
    vars: Object.freeze({
      '--rakBgBase': '#effdf5',
      '--rakAppBackground': 'linear-gradient(45deg, transparent 44%, rgba(4,120,87,.058) 45% 55%, transparent 56%) 0 0/30px 30px, linear-gradient(-45deg, transparent 44%, rgba(4,120,87,.046) 45% 55%, transparent 56%) 0 0/30px 30px, linear-gradient(180deg, #ffffff 0%, #effdf5 58%, #e3f8ed 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.75), transparent 24%, rgba(4,120,87,.030) 50%, transparent 76%, rgba(255,255,255,.75))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #effdf5 62%, #e3f8ed 100%)',
      '--rakBgAccent': 'rgba(4,120,87,.18)',
      '--green': '#047857',
      '--green2': '#6EE7B7'
    })
  }),
  'candy-glass': Object.freeze({
    label: 'Růžové střípky',
    subtitle: 'Bílý podklad s jemnými růžovými zalomenými čárkami',
    color: '#DB2777',
    swatch: 'repeating-linear-gradient(150deg, rgba(219,39,119,.16) 0 2px, transparent 2px 13px), repeating-linear-gradient(30deg, rgba(168,85,247,.10) 0 1px, transparent 1px 21px), linear-gradient(180deg, #ffffff, #fff1f7)',
    vars: Object.freeze({
      '--rakBgBase': '#fff1f7',
      '--rakAppBackground': 'repeating-linear-gradient(150deg, rgba(219,39,119,.060) 0 1px, transparent 1px 20px), repeating-linear-gradient(30deg, rgba(168,85,247,.040) 0 1px, transparent 1px 32px), linear-gradient(180deg, #ffffff 0%, #fff1f7 58%, #f8e8ff 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.74), transparent 24%, rgba(219,39,119,.030) 50%, transparent 76%, rgba(255,255,255,.74))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #fff1f7 62%, #f8e8ff 100%)',
      '--rakBgAccent': 'rgba(219,39,119,.18)',
      '--green': '#DB2777',
      '--green2': '#F9A8D4'
    })
  }),
  'aurora-punch': Object.freeze({
    label: 'Fialové zlomy',
    subtitle: 'Světlé pozadí s nepravidelnými fialovými úhly',
    color: '#7C3AED',
    swatch: 'linear-gradient(120deg, transparent 0 42%, rgba(124,58,237,.15) 43% 45%, transparent 46% 100%) 0 0/24px 18px, linear-gradient(180deg, #ffffff, #f6f0ff)',
    vars: Object.freeze({
      '--rakBgBase': '#f6f0ff',
      '--rakAppBackground': 'linear-gradient(120deg, transparent 0 42%, rgba(124,58,237,.060) 43% 45%, transparent 46% 100%) 0 0/32px 24px, linear-gradient(30deg, transparent 0 52%, rgba(14,165,233,.035) 53% 55%, transparent 56% 100%) 0 0/42px 28px, linear-gradient(180deg, #ffffff 0%, #f6f0ff 58%, #ece4ff 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.75), transparent 24%, rgba(124,58,237,.030) 50%, transparent 76%, rgba(255,255,255,.75))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #f6f0ff 62%, #ece4ff 100%)',
      '--rakBgAccent': 'rgba(124,58,237,.18)',
      '--green': '#7C3AED',
      '--green2': '#C4B5FD'
    })
  }),
  'violet-storm': Object.freeze({
    label: 'Levandulový cikcak',
    subtitle: 'Bílé pozadí s levandulovým cikcak vzorem',
    color: '#8B5CF6',
    swatch: 'linear-gradient(135deg, rgba(139,92,246,.18) 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(225deg, rgba(139,92,246,.12) 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(180deg, #ffffff, #f7f2ff)',
    vars: Object.freeze({
      '--rakBgBase': '#f7f2ff',
      '--rakAppBackground': 'linear-gradient(135deg, rgba(139,92,246,.070) 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(225deg, rgba(139,92,246,.055) 25%, transparent 25%) -12px 0/24px 24px, linear-gradient(315deg, rgba(56,189,248,.035) 25%, transparent 25%) 0 0/24px 24px, linear-gradient(180deg, #ffffff 0%, #f7f2ff 58%, #eee7ff 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.74), transparent 24%, rgba(139,92,246,.030) 50%, transparent 76%, rgba(255,255,255,.74))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #f7f2ff 62%, #eee7ff 100%)',
      '--rakBgAccent': 'rgba(139,92,246,.18)',
      '--green': '#8B5CF6',
      '--green2': '#C4B5FD'
    })
  }),
  'sunset-plasma': Object.freeze({
    label: 'Meruňkové linky',
    subtitle: 'Světlý teplý základ s tenkými oranžovými tahy',
    color: '#EA580C',
    swatch: 'repeating-linear-gradient(100deg, rgba(234,88,12,.16) 0 2px, transparent 2px 17px), linear-gradient(180deg, #ffffff, #fff3e8)',
    vars: Object.freeze({
      '--rakBgBase': '#fff3e8',
      '--rakAppBackground': 'repeating-linear-gradient(100deg, rgba(234,88,12,.062) 0 1px, transparent 1px 22px), repeating-linear-gradient(160deg, rgba(251,146,60,.040) 0 1px, transparent 1px 36px), linear-gradient(180deg, #ffffff 0%, #fff3e8 58%, #fbe3cf 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.74), transparent 24%, rgba(234,88,12,.030) 50%, transparent 76%, rgba(255,255,255,.74))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #fff3e8 62%, #fbe3cf 100%)',
      '--rakBgAccent': 'rgba(234,88,12,.18)',
      '--green': '#EA580C',
      '--green2': '#FDBA74'
    })
  }),
  'polar-mint': Object.freeze({
    label: 'Ledové čáry',
    subtitle: 'Čistý bílý vzhled s ledově modrými úzkými linkami',
    color: '#0EA5E9',
    swatch: 'repeating-linear-gradient(0deg, rgba(14,165,233,.13) 0 1px, transparent 1px 9px), repeating-linear-gradient(90deg, rgba(45,212,191,.08) 0 1px, transparent 1px 18px), linear-gradient(180deg, #ffffff, #effcff)',
    vars: Object.freeze({
      '--rakBgBase': '#effcff',
      '--rakAppBackground': 'repeating-linear-gradient(0deg, rgba(14,165,233,.050) 0 1px, transparent 1px 14px), repeating-linear-gradient(90deg, rgba(45,212,191,.035) 0 1px, transparent 1px 28px), linear-gradient(180deg, #ffffff 0%, #effcff 58%, #e4f8ff 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.76), transparent 24%, rgba(14,165,233,.030) 50%, transparent 76%, rgba(255,255,255,.76))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #effcff 62%, #e4f8ff 100%)',
      '--rakBgAccent': 'rgba(14,165,233,.18)',
      '--green': '#0EA5E9',
      '--green2': '#BAE6FD'
    })
  }),
  'blue-orbit': Object.freeze({
    label: 'Modré orbity',
    subtitle: 'Světlý podklad s jemnými kruhovými linkami',
    color: '#1D4ED8',
    swatch: 'radial-gradient(circle at 50% 50%, transparent 0 54%, rgba(29,78,216,.16) 55% 57%, transparent 58%) 0 0/28px 28px, linear-gradient(180deg, #ffffff, #edf4ff)',
    vars: Object.freeze({
      '--rakBgBase': '#edf4ff',
      '--rakAppBackground': 'radial-gradient(circle at 50% 50%, transparent 0 54%, rgba(29,78,216,.055) 55% 57%, transparent 58%) 0 0/38px 38px, radial-gradient(circle at 82% 16%, rgba(96,165,250,.16), transparent 28%), linear-gradient(180deg, #ffffff 0%, #edf4ff 58%, #e2edff 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.75), transparent 24%, rgba(29,78,216,.030) 50%, transparent 76%, rgba(255,255,255,.75))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, #edf4ff 62%, #e2edff 100%)',
      '--rakBgAccent': 'rgba(29,78,216,.18)',
      '--green': '#1D4ED8',
      '--green2': '#93C5FD'
    })
  })
});

function applyLightPatternBackgroundsV1131() {
  RAK_BACKGROUND_DEFS.forEach((bg) => {
    const patch = RAK_LIGHT_PATTERN_BACKGROUND_PATCHES_V1131[String(bg && bg.id || '')];
    if (!patch) return;
    Object.assign(bg, patch, { vars: Object.assign({}, bg.vars || {}, patch.vars || {}) });
  });
}
applyLightPatternBackgroundsV1131();


// RaK 1.2 (1.131) – výkonová vrstva nad světlými patterny.
// Swatche i reálná pozadí držíme záměrně lehká: jedna jemná linková vrstva + světlý podklad.
// Vzory zůstávají rozdílné úhlem, rozestupem a akcentem, ale nemají drahé vícenásobné radiální vrstvy.
const RAK_LIGHT_PATTERN_FAST_VARIANTS_V1131 = Object.freeze({
  'skoda-green': Object.freeze({ angle: '135deg', gap: 24, base: '#f3fbf7', low: 'rgba(14,122,82,.060)', high: 'rgba(14,122,82,.16)', green: '#0E7A52', green2: '#78FAAE' }),
  'light-green': Object.freeze({ angle: '90deg', gap: 22, base: '#f0fff6', low: 'rgba(34,197,94,.055)', high: 'rgba(34,197,94,.15)', green: '#22C55E', green2: '#86EFAC' }),
  'deep-aurora': Object.freeze({ angle: '0deg', gap: 20, base: '#eef6ff', low: 'rgba(37,99,235,.055)', high: 'rgba(37,99,235,.16)', green: '#2563EB', green2: '#93C5FD' }),
  'ember': Object.freeze({ angle: '45deg', gap: 26, base: '#fff7ed', low: 'rgba(180,83,9,.055)', high: 'rgba(180,83,9,.16)', green: '#B45309', green2: '#FDBA74' }),
  'neon-lagoon': Object.freeze({ angle: '120deg', gap: 26, base: '#ecfeff', low: 'rgba(8,145,178,.055)', high: 'rgba(8,145,178,.16)', green: '#0891B2', green2: '#67E8F9' }),
  'electric-lime': Object.freeze({ angle: '60deg', gap: 24, base: '#f7fee7', low: 'rgba(101,163,13,.055)', high: 'rgba(101,163,13,.16)', green: '#65A30D', green2: '#BEF264' }),
  'skoda-electric': Object.freeze({ angle: '-45deg', gap: 28, base: '#effdf5', low: 'rgba(4,120,87,.052)', high: 'rgba(4,120,87,.15)', green: '#047857', green2: '#6EE7B7' }),
  'candy-glass': Object.freeze({ angle: '150deg', gap: 24, base: '#fff1f7', low: 'rgba(219,39,119,.052)', high: 'rgba(219,39,119,.15)', green: '#DB2777', green2: '#F9A8D4' }),
  'aurora-punch': Object.freeze({ angle: '30deg', gap: 30, base: '#f6f0ff', low: 'rgba(124,58,237,.052)', high: 'rgba(124,58,237,.15)', green: '#7C3AED', green2: '#C4B5FD' }),
  'violet-storm': Object.freeze({ angle: '135deg', gap: 18, base: '#f7f2ff', low: 'rgba(139,92,246,.052)', high: 'rgba(139,92,246,.15)', green: '#8B5CF6', green2: '#C4B5FD' }),
  'sunset-plasma': Object.freeze({ angle: '100deg', gap: 28, base: '#fff3e8', low: 'rgba(234,88,12,.052)', high: 'rgba(234,88,12,.15)', green: '#EA580C', green2: '#FDBA74' }),
  'polar-mint': Object.freeze({ angle: '0deg', gap: 14, base: '#effcff', low: 'rgba(14,165,233,.045)', high: 'rgba(14,165,233,.13)', green: '#0EA5E9', green2: '#BAE6FD' }),
  'blue-orbit': Object.freeze({ angle: '90deg', gap: 30, base: '#edf4ff', low: 'rgba(29,78,216,.050)', high: 'rgba(29,78,216,.15)', green: '#1D4ED8', green2: '#93C5FD' })
});

function applyLightPatternFastVariantsV1131() {
  RAK_BACKGROUND_DEFS.forEach((bg) => {
    const v = RAK_LIGHT_PATTERN_FAST_VARIANTS_V1131[String(bg && bg.id || '')];
    if (!v) return;
    const swatch = 'repeating-linear-gradient(' + v.angle + ', ' + v.high + ' 0 1px, transparent 1px ' + Math.max(12, Math.round(v.gap * 0.70)) + 'px), linear-gradient(180deg, #ffffff 0%, ' + v.base + ' 100%)';
    const appBackground = 'repeating-linear-gradient(' + v.angle + ', ' + v.low + ' 0 1px, transparent 1px ' + v.gap + 'px), linear-gradient(180deg, #ffffff 0%, ' + v.base + ' 62%, #eaf2ff 100%)';
    bg.swatch = swatch;
    bg.vars = Object.assign({}, bg.vars || {}, {
      '--rakBgBase': v.base,
      '--rakAppBackground': appBackground,
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(255,255,255,.76), transparent 24%, rgba(37,99,235,.026) 50%, transparent 76%, rgba(255,255,255,.76))',
      '--rakAppBackgroundLite': 'linear-gradient(180deg, #ffffff 0%, ' + v.base + ' 64%, #eaf2ff 100%)',
      '--rakBgAccent': v.high,
      '--green': v.green,
      '--green2': v.green2
    });
  });
}
applyLightPatternFastVariantsV1131();


const RAK_BACKGROUND_UNLOCKS_V927 = {
  'light-zigzag': { unlockText: 'Vždy dostupné', minPlays: 0, minAchievements: 0 },
  'ios-mesh': { unlockText: 'Vždy dostupné', minPlays: 0, minAchievements: 0 },
  'skoda-green': { unlockText: '5 her nebo 1 achievement', minPlays: 5, minAchievements: 1 },
  'light-green': { unlockText: '10 her nebo 2 achievementy', minPlays: 10, minAchievements: 2 },
  'deep-aurora': { unlockText: '20 her nebo 4 achievementy', minPlays: 20, minAchievements: 4 },
  'ember': { unlockText: '30 her nebo 5 achievementů', minPlays: 30, minAchievements: 5 },
  'neon-lagoon': { unlockText: '40 her nebo 6 achievementů', minPlays: 40, minAchievements: 6 },
  'electric-lime': { unlockText: '55 her nebo 8 achievementů', minPlays: 55, minAchievements: 8 },
  'skoda-electric': { unlockText: '70 her nebo 10 achievementů', minPlays: 70, minAchievements: 10 },
  'candy-glass': { unlockText: '90 her nebo 12 achievementů', minPlays: 90, minAchievements: 12 },
  'aurora-punch': { unlockText: '110 her nebo 14 achievementů', minPlays: 110, minAchievements: 14 },
  'violet-storm': { unlockText: '130 her nebo 16 achievementů', minPlays: 130, minAchievements: 16 },
  'sunset-plasma': { unlockText: '145 her nebo 17 achievementů', minPlays: 145, minAchievements: 17 },
  'polar-mint': { unlockText: '150 her nebo 18 achievementů', minPlays: 150, minAchievements: 18 },
  'blue-orbit': { unlockText: 'Rank Týmař nebo 20 achievementů', minRank: 'Týmař', minAchievements: 20 },
  'magma-lime': { unlockText: 'Rank Mistr nebo 24 achievementů', minRank: 'Mistr', minAchievements: 24 },
  'classic-rak': { unlockText: 'Rank Učeň nebo 6 achievementů', minRank: 'Učeň', minAchievements: 6 },
  'storm-signal': { unlockText: 'Rank Legenda RaK nebo 48 achievementů', minRank: 'Legenda RaK', minAchievements: 48 },
  'midnight-gold': { unlockText: 'Rank RaK nesmrtelný nebo 58 achievementů', minRank: 'RaK nesmrtelný', minAchievements: 58 }
};
RAK_BACKGROUND_DEFS.forEach((bg) => {
  const unlock = RAK_BACKGROUND_UNLOCKS_V927[String(bg && bg.id || '')] || null;
  if (unlock) Object.assign(bg, unlock);
});

// RaK 1.2 (1.131) – appearance reward contract guard.
// Slouží jako jednoduché interní pravidlo pro budoucí theme/pozadí: klidně jich může přibýt víc,
// ale nesmí to být skoro stejné varianty a výrazné kusy se musí odemykat postupně.
const RAK_APPEARANCE_REWARD_CONTRACT_V181 = Object.freeze({
  version: '1.2 (1.131)',
  intent: 'distinct-progressive-appearance-rewards',
  defaultThemeId: 'default',
  defaultBackgroundId: 'ios-mesh',
  basicThemeIds: Object.freeze(['default', 'light-brown']),
  basicBackgroundIds: Object.freeze(['ios-mesh', 'light-zigzag']),
  rules: Object.freeze([
    'Vždy dostupné mohou být základní theme a základní světlý theme/pozadí podle pracovního nastavení.',
    'Nové theme/pozadí nesmí být jen lehce přebarvená kopie existujícího skinu.',
    'Každý nový výrazný skin musí mít minPlays, minAchievements nebo minRank.',
    'Před přidáním nového skinu porovnat hlavní color/swatch/akcent s existující rodinou.',
    'Když nový skin spadá do stejné rodiny, musí mít jiný kontrast, náladu nebo účel v UI.'
  ]),
  themeFamilies: Object.freeze({
    green: Object.freeze(['default', 'emerald-pro', 'toxic-lime', 'acid-cyber', 'matrix-redline']),
    blueCyan: Object.freeze(['midnight-blue', 'cyber-cyan', 'ice-prism', 'storm-signal']),
    violetPink: Object.freeze(['violet-pulse', 'hyper-magenta']),
    redOrange: Object.freeze(['crimson-alert', 'sunset-plasma', 'lava-core']),
    neutralPremium: Object.freeze(['graphite', 'royal-gold', 'amoled-legend'])
  }),
  backgroundFamilies: Object.freeze({
    green: Object.freeze(['skoda-green', 'light-green', 'electric-lime', 'acid-night', 'classic-rak']),
    blueCyan: Object.freeze(['ios-mesh', 'deep-aurora', 'neon-lagoon', 'skoda-electric', 'blue-orbit', 'storm-signal']),
    violetPink: Object.freeze(['candy-glass', 'violet-storm', 'neon-carnival', 'violet-blackout']),
    warm: Object.freeze(['ember', 'sunset-plasma', 'magma-lime', 'lava-neon', 'midnight-gold']),
    calm: Object.freeze(['aurora-punch', 'polar-mint'])
  }),
  reservedRemovedThemeIds: Object.freeze(['electric-ocean', 'gold-rush-neon', 'arctic-radar', 'candy-voltage', 'stealth-purple', 'ultra-violet']),
  reservedRemovedBackgroundIds: Object.freeze(['nebula-shock', 'emerald-smoke', 'ruby-circuit', 'cobalt-fire', 'solar-flare'])
});

// RaK 1.2 (1.131) – appearance readability contract guard.
// Cíl: výrazné theme/pozadí mohou být odemykané rewardy, ale nesmí zhoršit čitelnost Dashboardu,
// Administrace, Nastavení vzhledu ani herních karet. Je to statická pojistka pro budoucí skiny.
const RAK_APPEARANCE_READABILITY_CONTRACT_V189 = Object.freeze({
  version: '1.2 (1.131)',
  intent: 'dashboard-admin-readable-appearance',
  protectedScreens: Object.freeze(['dashboard', 'admin-connections', 'settings-appearance', 'games-leaderboards']),
  requiredThemeVars: Object.freeze(['--bg', '--panel', '--panel2', '--green', '--green2', '--muted', '--soft', '--rakThemeGlow', '--rakThemeBorder']),
  requiredBackgroundVars: Object.freeze(['--rakBgBase', '--rakAppBackground', '--rakAppBackgroundOverlay', '--rakAppBackgroundLite', '--rakBgAccent']),
  minSoftContrastOnBg: 4.5,
  minMutedContrastOnBg: 3,
  maxBackgroundBaseLuminance: 1,
  glassReadabilityRules: Object.freeze([
    'Každé theme musí mít světlé --soft a dostatečně čitelné --muted proti --bg.',
    'Pozadí může být tmavé nebo světlé, ale glass panely a text musí zůstat čitelné.',
    'Dashboard, Administrace a Nastavení vzhledu nesmí spoléhat jen na barvu akcentu.',
    'Výrazný reward skin může měnit náladu, ale nesmí zhoršit kontrast textu a panelů.'
  ])
});
window.RAK_APPEARANCE_REWARD_CONTRACT_V181 = RAK_APPEARANCE_REWARD_CONTRACT_V181;
window.RAK_APPEARANCE_READABILITY_CONTRACT_V189 = RAK_APPEARANCE_READABILITY_CONTRACT_V189;
window.RAK_BACKGROUND_DEFS = RAK_BACKGROUND_DEFS;

const RAK_PROFILE_UI_REMOTE_DEBOUNCE_MS = 650;
let rakProfileUiRemoteSaveTimer = null;
let rakProfileUiRemoteSavePromise = null;
let rakProfileUiRemoteLoadAccount = '';
let rakProfileUiRemoteLoadPromise = null;
let rakProfileUiLastRemoteSaveSignature = '';
const rakProfileUiSyncGuard = {
  remoteLoads: 0,
  remoteApplies: 0,
  remoteSameSkips: 0,
  remoteOlderSkips: 0,
  remoteMissingCreates: 0,
  loadInFlightJoins: 0,
  saveInFlightJoins: 0,
  saveSameSkips: 0,
  remoteSaves: 0,
  remoteSaveQueued: 0,
  remoteSaveErrors: 0,
  lastLoadAt: 0,
  lastApplyAt: 0,
  lastSaveAt: 0
};

function getProfileUiPayloadSignature(payload) {
  if (!payload || typeof payload !== 'object') return '';
  return [
    String(payload.account_number || payload.accountNumber || '').trim(),
    normalizeThemePreferenceId(payload.theme_id || payload.themeId || payload.theme || 'default', 'default'),
    normalizeBackgroundPreferenceId(payload.background_id || payload.backgroundId || payload.background || 'ios-mesh', 'ios-mesh')
  ].join('|');
}

function getProfileUiSyncStatus() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  return {
    account: account ? String(account.name || account.id || '').trim() : '',
    themeId: ui && ui.themeId ? ui.themeId : getLocalThemePreference(),
    backgroundId: ui && ui.backgroundId ? ui.backgroundId : getLocalBackgroundPreference(),
    remoteLoadActive: !!rakProfileUiRemoteLoadPromise,
    remoteSaveActive: !!rakProfileUiRemoteSavePromise,
    guard: Object.assign({}, rakProfileUiSyncGuard)
  };
}
window.getProfileUiSyncStatus = getProfileUiSyncStatus;

function normalizeThemePreferenceId(themeId, fallback = 'default') {
  const id = String(themeId || '').trim();
  if (id && RAK_THEME_DEFS.some(theme => theme.id === id)) return id;
  const fb = String(fallback || '').trim();
  return RAK_THEME_DEFS.some(theme => theme.id === fb) ? fb : 'default';
}

function normalizeBackgroundPreferenceId(bgId, fallback = 'ios-mesh') {
  const id = String(bgId || '').trim();
  if (id && RAK_BACKGROUND_DEFS.some(bg => bg.id === id)) return id;
  const fb = String(fallback || '').trim();
  return RAK_BACKGROUND_DEFS.some(bg => bg.id === fb) ? fb : 'ios-mesh';
}

function getLocalThemePreference() {
  try {
    const raw = typeof getLocalStorageCached === 'function' ? getLocalStorageCached(RAK_THEME_STORAGE_KEY, 'default') : (localStorage.getItem(RAK_THEME_STORAGE_KEY) || 'default');
    return normalizeThemePreferenceId(raw || 'default', 'default');
  } catch (err) { return 'default'; }
}

function getLocalBackgroundPreference() {
  try {
    const raw = typeof getLocalStorageCached === 'function' ? getLocalStorageCached(RAK_BACKGROUND_STORAGE_KEY, 'ios-mesh') : (localStorage.getItem(RAK_BACKGROUND_STORAGE_KEY) || 'ios-mesh');
    return normalizeBackgroundPreferenceId(raw || 'ios-mesh', 'ios-mesh');
  } catch (err) { return 'ios-mesh'; }
}

function getActiveProfileUiAccount() {
  try {
    const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
    if (!profile || !profile.activeAccountId || !profile.accounts) return null;
    return profile.accounts[profile.activeAccountId] || null;
  } catch (err) {
    return null;
  }
}

function ensureAccountUiSettings(account) {
  if (!account || typeof account !== 'object') return null;
  if (!account.uiSettings || typeof account.uiSettings !== 'object') account.uiSettings = {};
  if (!account.uiSettings.themeId && (account.themeId || account.uiTheme)) account.uiSettings.themeId = String(account.themeId || account.uiTheme || '').trim();
  if (!account.uiSettings.backgroundId && (account.backgroundId || account.uiBackground)) account.uiSettings.backgroundId = String(account.backgroundId || account.uiBackground || '').trim();
  account.uiSettings.themeId = account.uiSettings.themeId ? normalizeThemePreferenceId(account.uiSettings.themeId, '') : '';
  account.uiSettings.backgroundId = account.uiSettings.backgroundId ? normalizeBackgroundPreferenceId(account.uiSettings.backgroundId, '') : '';
  account.uiSettings.updatedAt = Number(account.uiSettings.updatedAt || 0) || 0;
  return account.uiSettings;
}

function getProfileThemePreference() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  return ui && ui.themeId ? normalizeThemePreferenceId(ui.themeId, '') : '';
}

function getProfileBackgroundPreference() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  return ui && ui.backgroundId ? normalizeBackgroundPreferenceId(ui.backgroundId, '') : '';
}

function saveActiveAccountUiSettings(partial, options = {}) {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const account = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const ui = ensureAccountUiSettings(account);
  if (!profile || !account || !ui) return false;
  let changed = false;
  if (Object.prototype.hasOwnProperty.call(partial || {}, 'themeId')) {
    const nextTheme = normalizeThemePreferenceId(partial.themeId, ui.themeId || getLocalThemePreference());
    if (ui.themeId !== nextTheme) { ui.themeId = nextTheme; changed = true; }
  }
  if (Object.prototype.hasOwnProperty.call(partial || {}, 'backgroundId')) {
    const nextBg = normalizeBackgroundPreferenceId(partial.backgroundId, ui.backgroundId || getLocalBackgroundPreference());
    if (ui.backgroundId !== nextBg) { ui.backgroundId = nextBg; changed = true; }
  }
  if (changed || !ui.updatedAt) {
    ui.updatedAt = Date.now();
    account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
    profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
    gamesSaveProfile(profile);
    app.gamesProfile = profile;
  }
  if (!options.skipRemote) scheduleActiveAccountUiRemoteSave(options.reason || 'profile-ui-local-save');
  return true;
}

function getActiveAccountUiRemotePayload() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  if (!account || !ui) return null;
  return {
    account_number: String(account.id || '').trim(),
    theme_id: normalizeThemePreferenceId(ui.themeId || getLocalThemePreference(), 'default'),
    background_id: normalizeBackgroundPreferenceId(ui.backgroundId || getLocalBackgroundPreference(), 'ios-mesh'),
    updated_at: new Date(Number(ui.updatedAt || Date.now()) || Date.now()).toISOString()
  };
}

function scheduleActiveAccountUiRemoteSave(reason) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveGameAccountUiSettings !== 'function') return false;
  const payload = getActiveAccountUiRemotePayload();
  if (!payload || !payload.account_number) return false;
  const signature = getProfileUiPayloadSignature(payload);
  if (signature && signature === rakProfileUiLastRemoteSaveSignature && !rakProfileUiRemoteSavePromise) {
    rakProfileUiSyncGuard.saveSameSkips += 1;
    return false;
  }
  if (rakProfileUiRemoteSaveTimer) clearTimeout(rakProfileUiRemoteSaveTimer);
  rakProfileUiRemoteSaveTimer = setTimeout(() => {
    rakProfileUiRemoteSaveTimer = null;
    void pushActiveAccountUiRemoteSettings(reason || 'profile-ui-debounced');
  }, RAK_PROFILE_UI_REMOTE_DEBOUNCE_MS);
  return true;
}

async function pushActiveAccountUiRemoteSettings(reason) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveGameAccountUiSettings !== 'function') return null;
  const payload = getActiveAccountUiRemotePayload();
  if (!payload || !payload.account_number) return null;
  const signature = getProfileUiPayloadSignature(payload);
  if (signature && signature === rakProfileUiLastRemoteSaveSignature && !rakProfileUiRemoteSavePromise) {
    rakProfileUiSyncGuard.saveSameSkips += 1;
    return { ok: true, skipped: true, reason: 'same-profile-ui' };
  }
  if (rakProfileUiRemoteSavePromise) {
    rakProfileUiSyncGuard.saveInFlightJoins += 1;
    return await rakProfileUiRemoteSavePromise;
  }
  rakProfileUiRemoteSavePromise = bridge.saveGameAccountUiSettings(Object.assign({ reason: reason || 'profile-ui-save' }, payload))
    .then((result) => {
      if (result && result.ok !== false) {
        rakProfileUiLastRemoteSaveSignature = signature;
        rakProfileUiSyncGuard.remoteSaves += 1;
        rakProfileUiSyncGuard.lastSaveAt = Date.now();
        if (result.queued || result.deferred) rakProfileUiSyncGuard.remoteSaveQueued += 1;
      } else {
        rakProfileUiSyncGuard.remoteSaveErrors += 1;
      }
      return result;
    })
    .catch((err) => {
      rakProfileUiSyncGuard.remoteSaveErrors += 1;
      console.warn('Profile UI remote save failed', err);
      return { ok: false, error: err };
    })
    .finally(() => { rakProfileUiRemoteSavePromise = null; });
  return await rakProfileUiRemoteSavePromise;
}

async function loadActiveAccountUiRemoteSettings(accountId) {
  const id = String(accountId || '').trim();
  const bridge = window.RotationSupabaseBridge;
  if (!id || !bridge || typeof bridge.loadGameAccountUiSettings !== 'function') return null;
  if (rakProfileUiRemoteLoadAccount === id && rakProfileUiRemoteLoadPromise) {
    rakProfileUiSyncGuard.loadInFlightJoins += 1;
    return await rakProfileUiRemoteLoadPromise;
  }
  rakProfileUiRemoteLoadAccount = id;
  rakProfileUiRemoteLoadPromise = (async () => {
    try {
      rakProfileUiSyncGuard.remoteLoads += 1;
      rakProfileUiSyncGuard.lastLoadAt = Date.now();
      const remote = await bridge.loadGameAccountUiSettings(id);
      if (!remote || typeof remote !== 'object') {
        rakProfileUiSyncGuard.remoteMissingCreates += 1;
        void pushActiveAccountUiRemoteSettings('profile-ui-create-missing-remote');
        return null;
      }
      const remoteTheme = normalizeThemePreferenceId(remote.theme_id || remote.themeId || remote.theme || '', '');
      const remoteBg = normalizeBackgroundPreferenceId(remote.background_id || remote.backgroundId || remote.background || '', '');
      if (!remoteTheme && !remoteBg) return null;
      const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
      const account = profile && profile.accounts ? profile.accounts[id] : null;
      const ui = ensureAccountUiSettings(account);
      if (!profile || !account || !ui) return null;
      const localTs = Number(ui.updatedAt || 0) || 0;
      const remoteTs = Date.parse(String(remote.updated_at || remote.updatedAt || '')) || 0;
      const remoteIsOlder = localTs > 0 && remoteTs > 0 && remoteTs + 1000 < localTs;
      if (remoteIsOlder) {
        rakProfileUiSyncGuard.remoteOlderSkips += 1;
        void pushActiveAccountUiRemoteSettings('profile-ui-remote-older-push-local');
        return Object.assign({ ok: true, skipped: true, reason: 'remote-older' }, remote);
      }
      let changed = false;
      if (remoteTheme && ui.themeId !== remoteTheme) { ui.themeId = remoteTheme; changed = true; }
      if (remoteBg && ui.backgroundId !== remoteBg) { ui.backgroundId = remoteBg; changed = true; }
      const rewardMetrics = getThemeUnlockMetrics(profile);
      const remoteThemeDef = RAK_THEME_DEFS.find(theme => String(theme.id || '') === String(ui.themeId)) || RAK_THEME_DEFS[0];
      const remoteBgDef = RAK_BACKGROUND_DEFS.find(bg => String(bg.id || '') === String(ui.backgroundId)) || RAK_BACKGROUND_DEFS[0];
      if (!isAppearanceRewardUnlocked(remoteThemeDef, rewardMetrics, 'default')) { ui.themeId = 'default'; changed = true; }
      if (!isAppearanceRewardUnlocked(remoteBgDef, rewardMetrics, 'ios-mesh')) { ui.backgroundId = 'ios-mesh'; changed = true; }
      ui.updatedAt = Math.max(localTs, remoteTs || Date.now());
      if (changed) {
        rakProfileUiSyncGuard.remoteApplies += 1;
        rakProfileUiSyncGuard.lastApplyAt = Date.now();
        account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
        profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
        gamesSaveProfile(profile);
        app.gamesProfile = profile;
        applyThemePreference(ui.themeId || 'default', true, { skipProfile: true });
        applyBackgroundPreference(ui.backgroundId || 'ios-mesh', true, { skipProfile: true });
        if (ui.themeId !== remoteTheme || ui.backgroundId !== remoteBg) scheduleActiveAccountUiRemoteSave('profile-ui-locked-remote-normalized');
        if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
      } else {
        rakProfileUiSyncGuard.remoteSameSkips += 1;
        if (remoteTheme || remoteBg) {
          rakProfileUiLastRemoteSaveSignature = getProfileUiPayloadSignature({ account_number: id, theme_id: remoteTheme || ui.themeId, background_id: remoteBg || ui.backgroundId });
        }
      }
      return remote;
    } catch (err) {
      console.warn('Profile UI remote load failed', err);
      return null;
    }
  })();
  try {
    return await rakProfileUiRemoteLoadPromise;
  } finally {
    rakProfileUiRemoteLoadAccount = '';
    rakProfileUiRemoteLoadPromise = null;
  }
}

function applyProfileUiPreferencesForActiveAccount(options = {}) {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const account = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const ui = ensureAccountUiSettings(account);
  if (!profile || !account || !ui) return false;
  const localTheme = getLocalThemePreference();
  const localBg = getLocalBackgroundPreference();
  const defaultTheme = normalizeThemePreferenceId('default', 'default');
  const defaultBg = normalizeBackgroundPreferenceId('ios-mesh', 'ios-mesh');
  let changed = false;
  // RaK 1.2 (1.131): při aktualizaci nesmí prázdné profilové uiSettings shodit uživatelské pozadí zpět na základ.
  // Local fallback použijeme jen pro aktivní účet a jen jako migraci chybějící hodnoty; zamčené skiny se níže dál normalizují na default.
  if (!ui.themeId) { ui.themeId = localTheme || defaultTheme; changed = true; }
  if (!ui.backgroundId) { ui.backgroundId = localBg || defaultBg; changed = true; }
  const rewardMetrics = getThemeUnlockMetrics(profile);
  const savedTheme = RAK_THEME_DEFS.find(theme => String(theme.id || '') === String(ui.themeId)) || RAK_THEME_DEFS[0];
  const savedBg = RAK_BACKGROUND_DEFS.find(bg => String(bg.id || '') === String(ui.backgroundId)) || RAK_BACKGROUND_DEFS[0];
  if (!isAppearanceRewardUnlocked(savedTheme, rewardMetrics, 'default')) { ui.themeId = defaultTheme; changed = true; }
  if (!isAppearanceRewardUnlocked(savedBg, rewardMetrics, 'ios-mesh')) { ui.backgroundId = defaultBg; changed = true; }
  if (changed || !ui.updatedAt) {
    ui.updatedAt = Date.now();
    account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
    profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
    gamesSaveProfile(profile);
    app.gamesProfile = profile;
  }
  applyThemePreference(ui.themeId || localTheme, true, { skipProfile: true });
  applyBackgroundPreference(ui.backgroundId || localBg, true, { skipProfile: true });
  if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
  if (changed) scheduleActiveAccountUiRemoteSave('profile-ui-initialized-from-local');
  if (options.loadRemote !== false) void loadActiveAccountUiRemoteSettings(account.id);
  return true;
}

window.applyProfileUiPreferencesForActiveAccount = applyProfileUiPreferencesForActiveAccount;
window.pushActiveAccountUiRemoteSettings = pushActiveAccountUiRemoteSettings;
window.loadActiveAccountUiRemoteSettings = loadActiveAccountUiRemoteSettings;

function getThemePreference() {
  const profileTheme = getProfileThemePreference();
  if (profileTheme) return profileTheme;
  return getLocalThemePreference();
}


function getBackgroundPreference() {
  const profileBg = getProfileBackgroundPreference();
  if (profileBg) return profileBg;
  return getLocalBackgroundPreference();
}

function updateBackgroundMetaColor(bg) {
  try {
    const vars = bg && bg.vars && typeof bg.vars === 'object' ? bg.vars : {};
    const nextColor = String((bg && bg.themeColor) || vars['--rakBgBase'] || '#050816').trim() || '#050816';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta && document.head) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    if (meta && meta.getAttribute('content') !== nextColor) meta.setAttribute('content', nextColor);
  } catch (err) {}
}
window.updateBackgroundMetaColor = updateBackgroundMetaColor;

function setRakStyleProperty(target, key, value, priority = '', statKey = '') {
  if (!target || !target.style) return false;
  if (typeof setStylePropertyIfChanged === 'function') {
    return setStylePropertyIfChanged(target, key, value, priority, statKey || key);
  }
  try {
    target.style.setProperty(key, value, priority || '');
    return true;
  } catch (err) {
    return false;
  }
}

function applyBackgroundPreference(bgId, persist = true, options = {}) {
  let bg = RAK_BACKGROUND_DEFS.find(item => item.id === normalizeBackgroundPreferenceId(bgId, 'ios-mesh')) || RAK_BACKGROUND_DEFS[0];
  if (!options.allowLocked) {
    const metrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
    if (!isAppearanceRewardUnlocked(bg, metrics, 'ios-mesh')) bg = RAK_BACKGROUND_DEFS[0];
  }
  const root = document.documentElement;
  root.dataset.rakBackground = bg.id;
  Object.entries(RAK_BACKGROUND_BASE_VARS).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'background-' + key);
  });
  Object.entries(bg.vars || {}).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'background-' + key);
  });
  updateBackgroundMetaColor(bg);
  if (persist) {
    try {
      if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_BACKGROUND_STORAGE_KEY, bg.id);
      else localStorage.setItem(RAK_BACKGROUND_STORAGE_KEY, bg.id);
    } catch (err) {}
    if (!options.skipProfile) saveActiveAccountUiSettings({ backgroundId: bg.id }, { reason: 'background-change', skipRemote: !!options.skipRemote });
  }
  return bg.id;
}
window.getBackgroundPreference = getBackgroundPreference;
window.applyBackgroundPreference = applyBackgroundPreference;
window.RAK_BACKGROUND_STORAGE_KEY = RAK_BACKGROUND_STORAGE_KEY;

(function initBackgroundPreference() {
  try { applyBackgroundPreference(getBackgroundPreference(), false); } catch (err) {}
})();

(function installAppearancePreferenceGuards() {
  if (window.__rakAppearancePreferenceGuardV556) return;
  window.__rakAppearancePreferenceGuardV556 = true;
  const syncAppearance = () => {
    try {
      applyThemePreference(getThemePreference(), false);
      applyBackgroundPreference(getBackgroundPreference(), false);
      if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
    } catch (err) {}
  };
  window.addEventListener('pageshow', syncAppearance);
  window.addEventListener('focus', syncAppearance);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncAppearance();
  });
  window.addEventListener('storage', (event) => {
    if (!event || event.key === RAK_BACKGROUND_STORAGE_KEY || event.key === RAK_THEME_STORAGE_KEY) syncAppearance();
  });
})();

function getThemeUnlockMetrics(profile) {
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  if (!active) return { totalPlays: 0, bestScore: 0, achievements: 0, xp: 0, rank: '', rankIndex: 0, hasProfile: false };
  const total = typeof gamesGetTotals === 'function' ? gamesGetTotals(active) : { totalPlays: 0, bestScore: 0 };
  const achievements = typeof gamesGetAchievementCount === 'function' ? gamesGetAchievementCount(active) : 0;
  const progress = typeof window.gamesBuildProgressSummary === 'function' ? window.gamesBuildProgressSummary(active) : null;
  const rankName = String(progress && progress.rank || '').trim();
  const ranks = Array.isArray(window.GAMES_RANK_DEFS) ? window.GAMES_RANK_DEFS : [];
  const rankIndex = Math.max(0, ranks.findIndex(rank => String(rank && rank.name || '') === rankName));
  return {
    totalPlays: Number(total.totalPlays || 0) || 0,
    bestScore: Number(total.bestScore || 0) || 0,
    achievements: Number(achievements || 0) || 0,
    xp: Number(progress && progress.xp || 0) || 0,
    rank: rankName,
    rankIndex: rankIndex < 0 ? 0 : rankIndex,
    hasProfile: true
  };
}

function getThemeUnlockScore(profile) {
  const metrics = getThemeUnlockMetrics(profile);
  return metrics.totalPlays + Math.floor(metrics.bestScore / 50) + (metrics.achievements * 2) + (metrics.rankIndex * 8);
}

function getRewardRequiredRankIndex(reward) {
  const required = String(reward && reward.minRank || '').trim();
  if (!required) return 0;
  const ranks = Array.isArray(window.GAMES_RANK_DEFS) ? window.GAMES_RANK_DEFS : [];
  const idx = ranks.findIndex(rank => String(rank && rank.name || '') === required);
  return idx < 0 ? 0 : idx;
}

function isAppearanceRewardUnlocked(reward, metrics, defaultId) {
  const id = String(reward && reward.id || '').trim();
  if (!reward || id === defaultId) return true;
  const playsNeed = Number(reward.minPlays || 0) || 0;
  const achNeed = Number(reward.minAchievements || 0) || 0;
  const rankNeed = getRewardRequiredRankIndex(reward);
  const byPlays = playsNeed > 0 && Number(metrics.totalPlays || 0) >= playsNeed;
  const byAchievements = achNeed > 0 && Number(metrics.achievements || 0) >= achNeed;
  const byRank = rankNeed > 0 && Number(metrics.rankIndex || 0) >= rankNeed;
  if (!playsNeed && !achNeed && !rankNeed) return true;
  return byPlays || byAchievements || byRank;
}

function buildAppearanceRewardProgressText(reward, metrics) {
  const parts = [];
  const playsNeed = Number(reward && reward.minPlays || 0) || 0;
  const achNeed = Number(reward && reward.minAchievements || 0) || 0;
  const rankNeed = getRewardRequiredRankIndex(reward);
  if (playsNeed) parts.push(String(metrics.totalPlays || 0) + '/' + String(playsNeed) + ' her');
  if (achNeed) parts.push(String(metrics.achievements || 0) + '/' + String(achNeed) + ' ach.');
  if (rankNeed) parts.push('rank ' + (metrics.rank || '—') + '/' + String(reward.minRank || ''));
  return parts.length ? (' · máš ' + parts.join(', ')) : '';
}

function applyThemePreference(themeId, persist = true, options = {}) {
  let theme = RAK_THEME_DEFS.find(t => t.id === normalizeThemePreferenceId(themeId, 'default')) || RAK_THEME_DEFS[0];
  if (!options.allowLocked) {
    const metrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
    if (!isAppearanceRewardUnlocked(theme, metrics, 'default')) theme = RAK_THEME_DEFS[0];
  }
  const root = document.documentElement;
  root.dataset.rakTheme = theme.id;
  setRakStyleProperty(root, '--rakThemeAccent', String(theme.color || '#7CFF7C'), '', 'theme-accent');
  Object.entries(RAK_THEME_BASE_VARS).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'theme-base-' + key);
  });
  Object.entries(theme.vars || {}).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'theme-' + key);
  });
  if (persist) {
    try {
      if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_THEME_STORAGE_KEY, theme.id);
      else localStorage.setItem(RAK_THEME_STORAGE_KEY, theme.id);
    } catch (err) {}
    if (!options.skipProfile) saveActiveAccountUiSettings({ themeId: theme.id }, { reason: 'theme-change', skipRemote: !!options.skipRemote });
  }
  return theme.id;
}

(function initThemePreference() {
  try {
    applyThemePreference(getThemePreference(), false);
    if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
  } catch (err) {}
})();

function buildThemeSystemSettingsHtml() {
  const defs = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
  const currentId = getThemePreference();
  const currentTheme = defs.find(theme => String(theme.id || '') === String(currentId)) || defs[0] || { label: 'Výchozí' };
  const cards = defs.map(theme => {
    const unlockedText = theme && theme.unlockText ? String(theme.unlockText) : '';
    return '<button type="button" class="appMenuThemeCard" data-theme-id="' + escapeHtml(String(theme.id || '')) + '">' +
      '<div class="appMenuThemeSwatch" style="--theme-swatch:' + escapeHtml(String(theme.color || '#7CFF7C')) + '"></div>' +
      '<div class="appMenuThemeInfo">' +
      '<div class="appMenuThemeTitle">' + escapeHtml(String(theme.label || '')) + '</div>' +
      '<div class="appMenuThemeBadge">' + escapeHtml(unlockedText) + '</div>' +
      '</div>' +
    '</button>';
  }).join('');
  const bgDefs = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const currentBgId = typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : 'ios-mesh';
  const currentBg = bgDefs.find(bg => String(bg.id || '') === String(currentBgId)) || bgDefs[0] || { label: 'iOS mesh' };
  const bgCards = bgDefs.map(bg => {
    const swatch = String(bg.swatch || bg.color || '#38bdf8');
    const unlockedText = bg && bg.unlockText ? String(bg.unlockText) : 'Odměna za hraní';
    return '<button type="button" class="appMenuBackgroundCard" data-bg-id="' + escapeHtml(String(bg.id || '')) + '">' +
      '<div class="appMenuBackgroundSwatch" style="--background-swatch:' + escapeHtml(swatch) + '"></div>' +
      '<div class="appMenuThemeInfo">' +
      '<div class="appMenuThemeTitle">' + escapeHtml(String(bg.label || '')) + '</div>' +
      '<div class="appMenuThemeBadge">' + escapeHtml(unlockedText) + '</div>' +
      '</div>' +
    '</button>';
  }).join('');
  return [
    '<div class="appMenuCard appMenuSettingsCard appMenuThemeCardWrap">',
    '  <div class="appMenuCardTitle">Theme / barvy aplikace</div>',
    '  <details class="appMenuThemeAccordion" id="appMenuThemeAccordion">',
    '    <summary class="appMenuAction appMenuSettingBtn appMenuThemeSummary">',
    '      <span class="appMenuThemeSummaryLeft">',
    '        <span class="appMenuThemeSummaryTitle">Theme / barvy</span>',
    '        <span class="appMenuThemeSummaryMeta" id="appMenuThemeSummaryMeta">Aktivní: ' + escapeHtml(String(currentTheme.label || 'Výchozí')) + '</span>',
    '      </span>',
    '      <span class="appMenuThemeSummaryChevron" aria-hidden="true">⌄</span>',
    '    </summary>',
    '    <div class="appMenuThemeAccordionBody">',
    '      <div class="appMenuThemeGrid" id="appMenuThemeGrid">' + cards + '</div>',
    '      <div class="appMenuThemeHint" id="appMenuThemeHint"></div>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuThemeAccordion appMenuBackgroundAccordion" id="appMenuBackgroundAccordion">',
    '    <summary class="appMenuAction appMenuSettingBtn appMenuThemeSummary">',
    '      <span class="appMenuThemeSummaryLeft">',
    '        <span class="appMenuThemeSummaryTitle">Pozadí</span>',
    '        <span class="appMenuThemeSummaryMeta" id="appMenuBackgroundSummaryMeta">Aktivní: ' + escapeHtml(String(currentBg.label || 'iOS mesh')) + '</span>',
    '      </span>',
    '      <span class="appMenuThemeSummaryChevron" aria-hidden="true">⌄</span>',
    '    </summary>',
    '    <div class="appMenuThemeAccordionBody">',
    '      <div class="appMenuBackgroundGrid" id="appMenuBackgroundGrid">' + bgCards + '</div>',
    '      <div class="appMenuThemeHint" id="appMenuBackgroundHint"></div>',
    '    </div>',
    '  </details>',
    '</div>'
  ].join('');
}

function renderThemeSettingsCards() {
  const grid = document.getElementById('appMenuThemeGrid');
  const hint = document.getElementById('appMenuThemeHint');
  const summaryMeta = document.getElementById('appMenuThemeSummaryMeta');
  if (!grid) return;
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const metrics = getThemeUnlockMetrics(profile);
  const current = getThemePreference();
  const themeList = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
  const themeById = new Map(themeList.map(theme => [String(theme.id || ''), theme]));

  Array.from(grid.querySelectorAll('.appMenuThemeCard')).forEach(card => {
    const id = String(card.dataset.themeId || '').trim();
    const theme = themeById.get(id) || null;
    const unlocked = isAppearanceRewardUnlocked(theme, metrics, 'default');
    card.classList.toggle('isActive', id === current);
    card.classList.toggle('isLocked', !unlocked && id !== 'default');
    card.setAttribute('aria-pressed', id === current ? 'true' : 'false');
    const badge = card.querySelector('.appMenuThemeBadge');
    if (badge && theme) {
      const progressText = buildAppearanceRewardProgressText(theme, metrics);
      const nextBadgeText = unlocked ? 'Odemčeno' : ('Zamčeno · ' + (theme.unlockText || 'podmínka nesplněna') + progressText);
      if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(badge, nextBadgeText, 'themeBadge-' + id);
      else badge.textContent = nextBadgeText;
    }
    if (!card.dataset.bound) {
      card.dataset.bound = '1';
      card.addEventListener('click', () => {
        const nextTheme = themeById.get(id) || null;
        if (!nextTheme) return;
        const nextMetrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
        const nextUnlocked = isAppearanceRewardUnlocked(nextTheme, nextMetrics, 'default');
        if (!nextUnlocked) {
          if (hint) {
            const nextHintText = '';
            if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextHintText, 'themeHintLocked');
            else hint.textContent = nextHintText;
          }
          return;
        }
        applyThemePreference(id, true);
        if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
        renderThemeSettingsCards();
        if (hint) {
          const nextHintText = '';
          if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextHintText, 'themeHintActive');
          else hint.textContent = nextHintText;
        }
      });
    }
  });

  const bgGrid = document.getElementById('appMenuBackgroundGrid');
  const bgHint = document.getElementById('appMenuBackgroundHint');
  const bgSummaryMeta = document.getElementById('appMenuBackgroundSummaryMeta');
  const bgList = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const bgById = new Map(bgList.map(bg => [String(bg.id || ''), bg]));
  const currentBg = typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : 'ios-mesh';
  if (bgGrid) {
    Array.from(bgGrid.querySelectorAll('.appMenuBackgroundCard')).forEach(card => {
      const id = String(card.dataset.bgId || '').trim();
      const bg = bgById.get(id) || null;
      const bgUnlocked = isAppearanceRewardUnlocked(bg, metrics, 'ios-mesh');
      card.classList.toggle('isActive', id === currentBg);
      card.classList.toggle('isLocked', !bgUnlocked && id !== 'ios-mesh');
      card.setAttribute('aria-pressed', id === currentBg ? 'true' : 'false');
      const bgBadge = card.querySelector('.appMenuThemeBadge');
      if (bgBadge && bg) {
        const progressText = buildAppearanceRewardProgressText(bg, metrics);
        const nextBgBadgeText = bgUnlocked ? 'Odemčeno' : ('Zamčeno · ' + (bg.unlockText || 'odměna za hraní') + progressText);
        if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgBadge, nextBgBadgeText, 'backgroundBadge-' + id);
        else bgBadge.textContent = nextBgBadgeText;
      }
      if (!card.dataset.bound) {
        card.dataset.bound = '1';
        card.addEventListener('click', () => {
          const nextBg = bgById.get(id) || null;
          if (!nextBg) return;
          const nextMetrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
          const nextUnlocked = isAppearanceRewardUnlocked(nextBg, nextMetrics, 'ios-mesh');
          if (!nextUnlocked) {
            if (bgHint) {
              const nextBgHintText = '';
              if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgHint, nextBgHintText, 'backgroundHintLocked');
              else bgHint.textContent = nextBgHintText;
            }
            return;
          }
          if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(id, true);
          renderThemeSettingsCards();
          if (bgHint) {
            const nextBgHintText = '';
            if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgHint, nextBgHintText, 'backgroundHintActive');
            else bgHint.textContent = nextBgHintText;
          }
        });
      }
    });
  }
  if (bgSummaryMeta) {
    const activeBgName = (bgById.get(currentBg) || bgList[0] || { label: 'iOS mesh' }).label;
    const nextBgSummary = 'Aktivní: ' + String(activeBgName);
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgSummaryMeta, nextBgSummary, 'backgroundSummaryMeta');
    else bgSummaryMeta.textContent = nextBgSummary;
  }

  if (summaryMeta) {
    const activeName = (themeById.get(current) || themeList[0] || { label: 'Výchozí' }).label;
    const rankPart = metrics.rank ? (' · Rank ' + String(metrics.rank)) : '';
    const nextThemeSummary = 'Aktivní: ' + String(activeName) + ' · ' + String(metrics.totalPlays) + ' her / ' + String(metrics.achievements) + ' achievementů' + rankPart;
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(summaryMeta, nextThemeSummary, 'themeSummaryMeta');
    else summaryMeta.textContent = nextThemeSummary;
  }

  if (hint) {
    const nextThemeHint = '';
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextThemeHint, 'themeHintSummary');
    else hint.textContent = nextThemeHint;
  }
}

const RAK_APPEARANCE_UPDATE_PERSISTENCE_CONTRACT_V1105 = Object.freeze({
  scope: 'profile-appearance-update-migration',
  intent: 'nevracet vybrané pozadí po aktualizaci na základní',
  migrationSource: 'localStorage fallback při chybějícím account.uiSettings.backgroundId',
  protectedStorage: Object.freeze(['account.uiSettings.backgroundId', RAK_BACKGROUND_STORAGE_KEY]),
  fallbackBackground: 'ios-mesh'
});
window.RAK_APPEARANCE_UPDATE_PERSISTENCE_CONTRACT_V1105 = RAK_APPEARANCE_UPDATE_PERSISTENCE_CONTRACT_V1105;

function getRakProfileAppearanceRewardHealth() {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const metrics = getThemeUnlockMetrics(profile);
  const themes = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
  const backgrounds = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const themeRewards = themes.filter(item => String(item && item.id || '') !== 'default');
  const backgroundRewards = backgrounds.filter(item => String(item && item.id || '') !== 'ios-mesh');
  return {
    version: window.APP_VERSION || '1.2 (1.131)',
    mode: 'profile-appearance-reward-health-v928',
    activeProfile: metrics.hasProfile,
    profileThemeStorage: 'account.uiSettings.themeId',
    profileBackgroundStorage: 'account.uiSettings.backgroundId',
    globalFallbackStorage: [RAK_THEME_STORAGE_KEY, RAK_BACKGROUND_STORAGE_KEY],
    metrics,
    themes: { total: themes.length, rewards: themeRewards.length, unlocked: themes.filter(item => isAppearanceRewardUnlocked(item, metrics, 'default')).length },
    backgrounds: { total: backgrounds.length, rewards: backgroundRewards.length, unlocked: backgrounds.filter(item => isAppearanceRewardUnlocked(item, metrics, 'ios-mesh')).length },
    note: 'Aktivní téma a pozadí se při přihlášeném profilu ukládají do uiSettings konkrétního účtu; localStorage je už jen fallback mimo profil.'
  };
}
window.getRakProfileAppearanceRewardHealth = getRakProfileAppearanceRewardHealth;

window.openGameShell = function openGameShellPublic(gameId) {
  const id = String(gameId || '').trim();
  if (!id) return false;
  if (typeof gamesStopActiveLoops === 'function') gamesStopActiveLoops();
  if (typeof app !== 'undefined') app.activeGameShell = id;
  if (typeof window.rakGameEngineActivate === 'function') window.rakGameEngineActivate(id, 'public-open');
  if (id === 'ttt' && typeof openTicTacToeGame === 'function') {
    openTicTacToeGame();
    return true;
  }
  if (document.body && document.body.classList) document.body.classList.add('gamesOpen');
  if (typeof renderGameShell === 'function') {
    renderGameShell(id);
    return true;
  }
  return false;
};


const rakInternalCloseGameShell = (typeof closeGameShell === 'function') ? closeGameShell : null;
window.closeGameShell = function closeGameShellProxy() {
  if (typeof rakInternalCloseGameShell === 'function') return rakInternalCloseGameShell();
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.remove('gamesOpen');
    document.body.classList.remove('tttOpen');
    if (document.body.dataset) delete document.body.dataset.rakArcadeGame;
  }
  if (typeof app !== 'undefined') app.activeGameShell = '';
  return true;
};


function syncGamesLockedSections() {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const lockedEls = [
    document.querySelector('#games .gamesProfilesFolder'),
    document.querySelector('#games .gamesAchievementsFolder')
  ];
  lockedEls.forEach((el) => {
    if (!el) return;
    el.hidden = !active;
  });
  const duplicateStatsFolder = document.querySelector('#games .gamesStatsFolder');
  if (duplicateStatsFolder) duplicateStatsFolder.hidden = true;
}



window.addEventListener('load', () => {
  try {
    if (typeof applyThemePreference === 'function') applyThemePreference(getThemePreference(), false);
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
    if (typeof applyProfileUiPreferencesForActiveAccount === 'function') applyProfileUiPreferencesForActiveAccount({ loadRemote: true, source: 'window-load' });
    if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
  } catch (err) {}
}, { once: true });




function getRakDashboardGlassThemeHealth() {
  let rootStyle = null;
  let bodyClass = '';
  try { rootStyle = getComputedStyle(document.documentElement); } catch (err) { rootStyle = null; }
  try { bodyClass = String(document.body && document.body.className || ''); } catch (err) { bodyClass = ''; }
  const readVar = (name) => {
    try { return rootStyle ? String(rootStyle.getPropertyValue(name) || '').trim() : ''; } catch (err) { return ''; }
  };
  const theme = String(typeof getThemePreference === 'function' ? getThemePreference() : (document.documentElement.dataset.rakTheme || 'default'));
  const background = String(typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : (document.documentElement.dataset.rakBackground || 'ios-mesh'));
  const lightweight = /(?:^|\s)(?:lightweightMode|lowEndDevice|ladaMode)(?:\s|$)/.test(bodyClass);
  return {
    ok: true,
    version: window.APP_VERSION || '1.2 (1.131)',
    mode: 'dashboard-ios-glass-viewport-fit-v945',
    theme,
    background,
    themeAware: !!(readVar('--green') && readVar('--green2')),
    themeIconAware: true,
    dashboardCards: 'dark-unified-transparent-glass-viewport-fit-v945',
    dashboardPanelHeight: 'height-aware-balanced-360x800-slightly-taller-cards',
    viewportFit: {
      enabled: true,
      target: '360x800',
      strategy: 'CSS media queries podle šířky i výšky displeje, s chráněnou velikostí horního směnového panelu',
      dashboardScrollGoal: 'bez zbytečného scrollu na běžném 360×800 viewportu'
    },
    dashboardIcons: 'theme-color',
    activeBottomNavIcon: 'theme-color',
    glassVariables: {
      panel: readVar('--panel'),
      panel2: readVar('--panel2'),
      green: readVar('--green'),
      green2: readVar('--green2'),
      themeGlow: readVar('--rakThemeGlow'),
      themeBorder: readVar('--rakThemeBorder'),
      dashboardBlur: readVar('--rakDashboardGlassBlur')
    },
    selectors: [
      '#home .dashboardShell',
      '#home .dashboardHeroCard',
      '#home .dashboardCard',
      'body.lightweightMode #home .dashboardCard',
      'body.lowEndDevice #home .dashboardCard',
      'body.ladaMode #home .dashboardCard'
    ],
    lightweightSafe: lightweight ? 'blur-off' : 'full-glass',
    note: 'Dashboard panely drží tmavší odstín a průhledný glass; ve v945 zůstává horní směnový panel čitelný a běžné dashboard panely jsou lehce zvětšené, protože nad spodní lištou byla ještě rezerva.'
  };
}
window.getRakDashboardGlassThemeHealth = getRakDashboardGlassThemeHealth;
try {
  if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.register === 'function') {
    window.RaK.diagnostics.register('dashboardGlassTheme', getRakDashboardGlassThemeHealth);
  }
} catch (err) {}

try { if (typeof window !== 'undefined' && typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('appearance-theme.js','loaded',{source:'appearance-theme'}); } catch (err) {}
