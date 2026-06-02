// RaK 1.2 (1.108) – Piškvorky / online PvP / offline AI.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('games-gomoku.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function ensureTicTacToeThemeBoardPatch() {
  try {
    const existing = document.getElementById('tttThemeBoardPatch');
    const css = `
/* v.1.1 (684) – Piškvorky: poslední pojistka proti starému zeleno-černému boardu. */
html body.tttOpen .tttOverlay,
html body.tttOpen .tttShell,
html body.tttOpen .tttContent,
html body.tttOpen .tttGameScreen{
  background:transparent !important;
}
html body.tttOpen .tttOverlay{
  background:var(--rakAppBackground, var(--bg, #050816)) !important;
  background-color:var(--rakBgBase, var(--bg, #050816)) !important;
}
html body.tttOpen .tttOverlay::before{
  content:"" !important;
  position:fixed !important;
  inset:0 !important;
  pointer-events:none !important;
  z-index:0 !important;
  background:var(--rakAppBackgroundOverlay, transparent) !important;
  opacity:1 !important;
}
html body.tttOpen .tttOverlay .tttBoardWrap,
html body.tttOpen .tttOverlay #tttBoard.tttBoard{
  --tttGridLine:rgba(238,247,255,.24) !important;
  --tttGlassLine:rgba(255,255,255,.08) !important;
  --tttBoardSurface:rgba(255,255,255,.032) !important;
}
@supports (color: color-mix(in srgb, white 50%, transparent)){
  html body.tttOpen .tttOverlay .tttBoardWrap,
  html body.tttOpen .tttOverlay #tttBoard.tttBoard{
    --tttGridLine:color-mix(in srgb, var(--rakThemeBorder, var(--soft, #eef7ff)) 48%, transparent) !important;
    --tttGlassLine:color-mix(in srgb, var(--soft, #eef7ff) 12%, transparent) !important;
    --tttBoardSurface:color-mix(in srgb, var(--panel2, var(--panel, #101827)) 64%, transparent) !important;
  }
}
html body.tttOpen .tttOverlay .tttBoardWrap{
  background:
    linear-gradient(135deg, rgba(255,255,255,.095), rgba(255,255,255,.018)),
    var(--panel, rgba(12,18,28,.46)) !important;
  border:1px solid var(--tttGridLine) !important;
  box-shadow:0 18px 48px rgba(0,0,0,.34), inset 0 1px 0 var(--tttGlassLine) !important;
  -webkit-backdrop-filter:blur(14px) saturate(140%) !important;
  backdrop-filter:blur(14px) saturate(140%) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard{
  background:
    linear-gradient(135deg, rgba(255,255,255,.060), rgba(255,255,255,.012)),
    var(--tttBoardSurface) !important;
  border:0 !important;
  border-left:1px solid var(--tttGridLine) !important;
  border-top:1px solid var(--tttGridLine) !important;
  outline:0 !important;
  box-shadow:
    inset -1px 0 0 var(--tttGridLine),
    inset 0 -1px 0 var(--tttGridLine),
    0 16px 38px rgba(0,0,0,.20) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard::before,
html body.tttOpen .tttOverlay #tttBoard.tttBoard::after{
  content:none !important;
  display:none !important;
  background:none !important;
  box-shadow:none !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell{
  border-right:1px solid var(--tttGridLine) !important;
  border-bottom:1px solid var(--tttGridLine) !important;
  background:transparent !important;
  background-color:transparent !important;
  background-image:none !important;
  box-shadow:none !important;
  -webkit-tap-highlight-color:rgba(238,247,255,.12) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isLastMove{
  box-shadow:inset 0 0 0 2px rgba(238,247,255,.22) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isX,
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isWinner.isX{
  color:#78c7ff !important;
  text-shadow:0 0 14px rgba(120,199,255,.50), 0 0 2px rgba(255,255,255,.30) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isO,
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isWinner.isO{
  color:#ff7c7c !important;
  text-shadow:0 0 14px rgba(255,124,124,.50), 0 0 2px rgba(255,255,255,.28) !important;
}
html body.ladaMode.tttOpen .tttOverlay .tttBoardWrap,
html[data-lightweight="1"] body.tttOpen .tttOverlay .tttBoardWrap{
  -webkit-backdrop-filter:none !important;
  backdrop-filter:none !important;
}

/* v.1.5 (767): Piškvorky – za spodní lištou nesmí být vidět ani scrollovat jiná stránka. */
html:has(body.tttOpen){
  height:100% !important;
  overflow:hidden !important;
  overscroll-behavior:none !important;
}
html body.tttOpen{
  width:100% !important;
  height:100dvh !important;
  min-height:100dvh !important;
  max-height:100dvh !important;
  overflow:hidden !important;
  overscroll-behavior:none !important;
}
html body.tttOpen .page{
  visibility:hidden !important;
  pointer-events:none !important;
}
html body.tttOpen .tttOverlay{
  position:fixed !important;
  inset:0 !important;
  width:100vw !important;
  height:100dvh !important;
  min-height:100dvh !important;
  max-height:100dvh !important;
  z-index:10010 !important;
  overflow:hidden !important;
  overscroll-behavior:none !important;
}
html body.tttOpen .tttShell,
html body.tttOpen .tttContent{
  height:100dvh !important;
  min-height:100dvh !important;
  max-height:100dvh !important;
  overflow:hidden !important;
}
html body.tttOpen .tttStartScreen{
  overscroll-behavior:contain !important;
}
html body.tttOpen .tttOverlay::after{
  content:"" !important;
  position:fixed !important;
  left:0 !important;
  right:0 !important;
  bottom:0 !important;
  height:var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) !important;
  pointer-events:none !important;
  z-index:1 !important;
  background:linear-gradient(180deg, rgba(5,8,22,0), var(--rakBgBase, var(--bg, #050816)) 42%, var(--rakBgBase, var(--bg, #050816)) 100%) !important;
}
html body.tttOpen #tttOverlay.tttOverlay.isVisible .tttBoardWrap{
  top:56px !important;
  right:10px !important;
  bottom:var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) !important;
  left:10px !important;
  inset:56px 10px var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) 10px !important;
  max-height:calc(100dvh - 56px - var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px))) !important;
}
html body.tttOpen #tttOverlay.tttOverlay.isVisible .tttResultCard{
  bottom:calc(var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) + 8px) !important;
}
`;
    if (existing) {
      if (existing.textContent !== css) existing.textContent = css;
      return;
    }
    const style = document.createElement('style');
    style.id = 'tttThemeBoardPatch';
    style.textContent = css;
    document.head.appendChild(style);
  } catch (err) {}
}

function ensureTicTacToeStyles() {
  if (document.getElementById('tttStyles')) return;
  const style = document.createElement('style');
  style.id = 'tttStyles';
  style.textContent = `
.tttOverlay{
  position:fixed;
  inset:0;
  z-index:9999;
  display:none;
  align-items:stretch;
  justify-content:center;
  padding:0;
  background:rgba(5,8,7,.78);
  backdrop-filter:blur(16px) saturate(145%);
  -webkit-backdrop-filter:blur(16px) saturate(145%);
}
.tttOverlay.isVisible{display:flex;}
.tttShell{
  width:100%;
  height:100%;
  border:none;
  border-radius:0;
  background:linear-gradient(180deg, rgba(10,14,12,.99), rgba(7,10,9,.98));
  box-shadow:0 24px 80px rgba(0,0,0,.55);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.tttHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:14px 14px 10px;
  border-bottom:1px solid rgba(124,255,124,.10);
  flex:0 0 auto;
  background:rgba(255,255,255,.02);
}
.tttHeaderTitle{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.tttHeaderTitle h2{
  margin:0;
  font-size:20px;
  letter-spacing:.02em;
  color:#e7fff0;
}
.tttHeaderTitle span{
  font-size:12px;
  color:rgba(231,255,240,.58);
}
.tttClose{
  width:38px;
  height:38px;
  border:none;
  border-radius:0;
  background:rgba(255,255,255,.05);
  color:#e7fff0;
  font-size:26px;
  line-height:1;
}
.tttContent{
  flex:1;
  min-height:0;
  overflow:hidden;
  padding:0;
  display:flex;
  flex-direction:column;
}
.tttStartScreen,
.tttGameScreen{
  display:flex;
  flex-direction:column;
  gap:12px;
  min-height:0;
  flex:1;
}
.tttStartScreen{
  padding:14px;
  overflow:auto;
}
.tttGameScreen{
  position:relative;
  padding:0;
}
.tttCard{
  border:1px solid rgba(124,255,124,.12);
  background:rgba(255,255,255,.03);
  border-radius:0;
  padding:14px;
}
.tttSectionTitle{
  margin:0 0 12px;
  font-size:13px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:rgba(231,255,240,.62);
}
.tttToggleRow,
.tttLevelRow{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:10px;
}
.tttInviteActions{
  grid-template-columns:repeat(2, minmax(0, 1fr));
}
.tttLevelRow{
  grid-template-columns:repeat(3, minmax(0, 1fr));
}
.tttBtn{
  appearance:none;
  -webkit-appearance:none;
  font-family:inherit;
  min-height:48px;
  border:1px solid rgba(124,255,124,.16);
  background:rgba(255,255,255,.04);
  color:#e7fff0;
  border-radius:0;
  padding:10px 12px;
  font-size:15px;
  font-weight:700;
}
.tttBtn.isActive{
  background:linear-gradient(180deg, rgba(124,255,124,.22), rgba(124,255,124,.10));
  border-color:rgba(124,255,124,.6);
  color:#7CFF7C;
  box-shadow:0 0 0 1px rgba(124,255,124,.12), 0 0 22px rgba(124,255,124,.14);
}
.tttNote{
  margin-top:10px;
  color:rgba(231,255,240,.55);
  font-size:12px;
  line-height:1.45;
}
.tttInviteCode{
  display:block;
  margin-top:10px;
  padding:12px 10px;
  border:1px solid rgba(124,255,124,.16);
  background:rgba(255,255,255,.04);
  color:#eaffea;
  font-size:28px;
  line-height:1.1;
  font-weight:900;
  letter-spacing:.18em;
  text-align:center;
  text-transform:uppercase;
  overflow-wrap:anywhere;
}
.tttStatus{
  position:absolute;
  top:12px;
  left:12px;
  right:12px;
  z-index:2;
  min-height:24px;
  color:#7CFF7C;
  font-size:14px;
  font-weight:700;
  text-align:center;
  background:rgba(7,10,9,.72);
  border:1px solid rgba(124,255,124,.12);
  padding:8px 12px;
  pointer-events:none;
}
.tttBoardWrap{
  position:absolute;
  inset:56px 10px 96px;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:0;
  overflow:hidden;
  padding:8px;
  background:
    radial-gradient(circle at 18% 8%, rgba(124,255,124,.13), transparent 34%),
    linear-gradient(180deg, rgba(12,18,16,.92), rgba(5,9,8,.96));
  border:1px solid rgba(124,255,124,.20);
  border-radius:22px;
  box-shadow:0 18px 46px rgba(0,0,0,.36), inset 0 0 0 1px rgba(255,255,255,.05);
}
.tttBoard{
  width:100%;
  height:100%;
  position:relative;
  display:grid;
  grid-template-columns:repeat(10, var(--tttCellSize, 24px));
  grid-template-rows:repeat(19, var(--tttCellSize, 24px));
  gap:0;
  justify-content:center;
  align-content:center;
  overflow:hidden;
  border-radius:10px;
  border:0;
  background:
    radial-gradient(circle at 50% 0%, rgba(124,255,124,.08), transparent 42%),
    linear-gradient(180deg, rgba(5,12,10,.86), rgba(3,8,7,.92));
  box-shadow:0 0 26px rgba(124,255,124,.08), inset 0 0 0 1px rgba(124,255,124,.08);
}
.tttBoard::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background-image:
    linear-gradient(to right, rgba(124,255,124,.38) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(124,255,124,.38) 1px, transparent 1px);
  background-size:var(--tttCellSize, 24px) var(--tttCellSize, 24px);
  background-position:0 0;
  box-shadow:inset -1px 0 0 rgba(124,255,124,.38), inset 0 -1px 0 rgba(124,255,124,.38);
}
.tttCell{
  appearance:none;
  -webkit-appearance:none;
  position:relative;
  z-index:1;
  font-family:"Comic Sans MS", "Segoe Print", "Bradley Hand", cursive;
  width:var(--tttCellSize, 24px);
  height:var(--tttCellSize, 24px);
  box-sizing:border-box;
  border:0;
  outline:0;
  margin:0;
  padding:0;
  background:transparent;
  border-radius:0;
  box-shadow:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:calc(var(--tttCellSize, 24px) * 1.12);
  font-weight:900;
  line-height:.82;
  text-align:center;
  color:#77caff;
  text-shadow:0 0 14px rgba(119,202,255,.36);
  touch-action:manipulation;
  -webkit-tap-highlight-color:rgba(124,255,124,.10);
  transition:color .10s ease, text-shadow .10s ease, filter .10s ease;
}
.tttCell:hover,
.tttCell:active,
.tttCell.isFilled,
.tttCell.isLastMove{
  transform:none;
  background:transparent;
  box-shadow:none;
}
.tttCell.isLastMove{
  filter:brightness(1.16) saturate(1.12);
  text-shadow:0 0 18px rgba(124,255,124,.34), 0 0 14px currentColor;
}
.tttCell.isX{
  color:#78c7ff;
  text-shadow:0 0 14px rgba(120,199,255,.48), 0 0 2px rgba(255,255,255,.30);
}
.tttCell.isO{
  color:#ff7c7c;
  text-shadow:0 0 14px rgba(255,124,124,.48), 0 0 2px rgba(255,255,255,.28);
}
.tttCell.isWinner{
  background:radial-gradient(circle at center, rgba(255,230,112,.18), transparent 58%);
  box-shadow:none;
  color:#fff1a6;
  text-shadow:0 0 4px rgba(255,255,255,.95), 0 0 12px rgba(255,226,122,.95), 0 0 28px rgba(124,255,124,.62);
  filter:brightness(1.35) saturate(1.28);
}
.tttCell.isWinner::after{
  content:"";
  position:absolute;
  inset:18%;
  border:2px solid rgba(255,226,122,.85);
  border-radius:999px;
  box-shadow:0 0 16px rgba(255,226,122,.45), inset 0 0 12px rgba(255,226,122,.20);
  pointer-events:none;
}
.tttWinModal{
  position:absolute;
  inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  padding:18px 14px calc(18px + env(safe-area-inset-bottom));
  background:rgba(4,7,6,.66);
  backdrop-filter:blur(10px) saturate(135%);
  -webkit-backdrop-filter:blur(10px) saturate(135%);
  z-index:4;
}
.tttWinCard{
  width:min(100%, 380px);
  border:1px solid rgba(124,255,124,.16);
  border-radius:22px;
  background:linear-gradient(180deg, rgba(13,18,15,.98), rgba(8,12,10,.98));
  box-shadow:0 22px 60px rgba(0,0,0,.48);
  padding:16px;
}
.tttWinText{
  margin-top:6px;
  color:rgba(231,255,240,.76);
  font-size:13px;
  line-height:1.45;
}
.tttWinLabel{
  display:block;
  margin-top:12px;
  font-size:12px;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:rgba(231,255,240,.62);
}
.tttWinInput{
  width:100%;
  margin-top:8px;
  min-height:44px;
  border-radius:14px;
  border:1px solid rgba(124,255,124,.18);
  background:rgba(255,255,255,.04);
  color:#eaf7ee;
  padding:10px 12px;
  font:inherit;
  font-size:16px;
  outline:none;
}
.tttWinInput:focus{
  border-color:rgba(124,255,124,.48);
  box-shadow:0 0 0 3px rgba(124,255,124,.12);
}
.tttWinStats{
  margin-top:12px;
  display:grid;
  grid-template-columns:1fr;
  gap:8px;
}
.tttWinStats > div{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:9px 10px;
  border-radius:14px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(124,255,124,.10);
}
.tttWinStats span{
  color:rgba(231,255,240,.62);
  font-size:12px;
}
.tttWinStats strong{
  color:#eaf7ee;
  font-size:13px;
}
.tttWinActions{
  margin-top:14px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}
.tttWinModal.isVisible{
  display:flex;
}
.tttFooter{
  position:absolute;
  left:12px;
  right:12px;
  bottom:calc(12px + env(safe-area-inset-bottom));
  display:flex;
  gap:10px;
  z-index:2;
}
.tttFooter .tttBtn{
  flex:1;
}
.tttBtn:disabled{
  opacity:.45;
  filter:saturate(.5);
}
body.tttOpen{
  overflow:hidden;
}
@media (max-width: 520px){
  .tttHeader{padding:10px 12px 8px;}
  .tttHeaderTitle h2{font-size:18px;}
  .tttStartScreen{padding:10px;}
  .tttCard{padding:12px;}
  .tttStatus{left:10px; right:10px; top:10px; font-size:13px; padding:7px 10px;}
  .tttBoardWrap{inset:48px 10px 90px;}
  .tttFooter{left:10px; right:10px; bottom:calc(10px + env(safe-area-inset-bottom));}
  .tttInviteCode{font-size:22px; letter-spacing:.14em;}
  .tttLevelRow{grid-template-columns:1fr;}
  .tttToggleRow{grid-template-columns:1fr;}
  .tttCell{font-size:clamp(18px, 7.2vw, 34px);}
  .tttWinActions{grid-template-columns:1fr;}
}
      `;
  document.head.appendChild(style);
}

function ensureTicTacToeOverlay() {
  let overlay = document.getElementById('tttOverlay');
  if (overlay) { ensureTicTacToeThemeBoardPatch(); return overlay; }

  ensureTicTacToeStyles();
  ensureTicTacToeThemeBoardPatch();
  overlay = document.createElement('div');
  overlay.id = 'tttOverlay';
  overlay.className = 'tttOverlay';
  overlay.innerHTML = [
    '<div class="tttShell" role="dialog" aria-modal="true" aria-labelledby="tttTitle">',
    '  <div class="tttHeader">',
    '    <div class="tttHeaderTitle">',
    '      <h2 id="tttTitle" class="uHidden">Piškvorky</h2>',
    '      <span></span>',
    '    </div>',
    '  </div>',
    '  <div class="tttContent">',
    '    <div class="tttStartScreen" id="tttStartScreen"></div>',
    '    <div class="tttGameScreen uHidden" id="tttGameScreen">',
    '      <div class="tttStatus" id="tttStatus"></div>',
    '      <div class="tttOnlineGameInfo" id="tttOnlineGameInfo" hidden></div>',
    '      <div class="tttBoardWrap"><div class="tttBoard" id="tttBoard"></div><div class="tttInviteOverlay" id="tttInviteOverlay" hidden></div><div class="tttResultCard" id="tttResultCard" hidden></div></div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  const close = () => closeTicTacToeGame();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('.tttClose')?.addEventListener('click', close);
  if (!document.body.dataset.tttKeyBound) {
    document.body.dataset.tttKeyBound = '1';
    document.addEventListener('keydown', (event) => {
      const active = document.getElementById('tttOverlay');
      if (!active || !active.classList.contains('isVisible')) return;
      if (event.key === 'Escape') closeTicTacToeGame();
    });
  }

  if (!window.__tttResizeBound) {
    window.__tttResizeBound = true;
    window.addEventListener('resize', tttLayoutBoard, { passive: true });
    window.addEventListener('orientationchange', tttLayoutBoard, { passive: true });
  }

  tttBindOnlineLifecycle();

  return overlay;
}

const TTT_ROWS = 19;
const TTT_COLS = 10;
const TTT_WIN_LENGTH = 5;
const TTT_TOTAL_CELLS = TTT_ROWS * TTT_COLS;
const TTT_HARD_WIN_EMAIL = 'martinspadrna@gmail.com';
const TTT_HARD_WIN_KEY = 'tttHardWins';
// Samostatná verze pravidel/obtížnosti Piškvorek. Není to verze celé aplikace.
// Zvyšovat jen při změně AI obtížnosti nebo pravidel, ne při vzhledových úpravách.
const GOMOKU_RULESET_VERSION = 'gomoku-10col-19row-ai-rules-v15';
if (typeof window !== 'undefined') window.GOMOKU_RULESET_VERSION = GOMOKU_RULESET_VERSION;

function tttEnsureAiWinsResetV667() {
  try {
    const marker = 'rak_ttt_ai_wins_reset_v667';
    if (localStorage.getItem(marker) !== '1') {
      localStorage.removeItem(TTT_HARD_WIN_KEY);
      localStorage.removeItem('rotace_supabase_gomoku_wins_v1');
      localStorage.setItem(marker, '1');
    }
    const reset853 = 'rak_games_full_stats_reset_v853';
    if (localStorage.getItem(reset853) !== '1') {
      localStorage.removeItem(TTT_HARD_WIN_KEY);
      localStorage.removeItem('rotace_supabase_gomoku_wins_v1');
      localStorage.removeItem('rotace_ttt_online_results_v1');
      localStorage.removeItem('rotace_ttt_online_join_diag_v1');
      localStorage.setItem(reset853, '1');
    }
  } catch (err) {}
}

function tttGetState() {
  tttEnsureAiWinsResetV667();
  if (!app.tttState) {
    app.tttState = {
      screen: 'start',
      mode: 'ai',
      difficulty: 'ai',
      board: Array(TTT_TOTAL_CELLS).fill(''),
      turn: 'X',
      gameOver: false,
      winner: null,
      nextStarter: 'X',
      message: '',
      startedAt: 0,
      moveCount: 0,
      moveCountX: 0,
      moveCountO: 0,
      hardWinPrompt: false,
      hardWinStats: null,
      hardWinName: '',
      resultSaved: false,
      resultOnlineSaved: false,
      resultSummary: null,
      hardWinRemote: [],
      hardWinLoading: false,
      hardWinLoaded: false,
      onlineScoreRemote: [],
      onlineScoreLoading: false,
      onlineScoreLoaded: false,
      online: {
        code: '',
        inviteId: null,
        sessionId: null,
        role: '',
        status: 'idle',
        revision: 0,
        lastUpdatedAt: 0,
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: 0,
        playerXAccountNumber: null,
        playerOAccountNumber: null,
        connected: false,
        resultSavedKey: '',
        joinFlow: '',
        joinSource: ''
      },
      onlineSyncTimer: null,
      onlineStatus: '',
      onlineKind: 'idle'
    };
  }
  return app.tttState;
}


function tttCreateEmptyOnlineState() {
  return {
    code: '',
    inviteId: null,
    sessionId: null,
    role: '',
    status: 'idle',
    revision: 0,
    lastUpdatedAt: 0,
    lastRemoteUpdatedAt: 0,
    dirty: false,
    pendingRevision: 0,
    playerXAccountNumber: null,
    playerOAccountNumber: null,
    connected: false,
    resultSavedKey: '',
    joinFlow: '',
    joinSource: '',
    rulesetVersion: GOMOKU_RULESET_VERSION,
    rows: TTT_ROWS,
    cols: TTT_COLS,
    winLength: TTT_WIN_LENGTH,
    inviteUrl: '',
    headToHead: null,
    headToHeadText: '',
    headToHeadLoadedAt: 0
  };
}

function tttClearBoardStateForNewMode(state, mode) {
  const s = state || tttGetState();
  const nextMode = String(mode || s.mode || 'ai').trim() || 'ai';
  if (nextMode !== 'pvp') {
    if (typeof tttStopOnlineSync === 'function') tttStopOnlineSync();
    s.online = tttCreateEmptyOnlineState();
    s.onlineStatus = '';
    s.onlineKind = 'idle';
  }
  s.board = Array(TTT_TOTAL_CELLS).fill('');
  s.turn = 'X';
  s.gameOver = false;
  s.winner = null;
  s.nextStarter = 'X';
  s.startedAt = 0;
  s.moveCount = 0;
  s.moveCountX = 0;
  s.moveCountO = 0;
  s.lastMoveIndex = null;
  s.lastMoveMark = null;
  s.hardWinPrompt = false;
  s.hardWinStats = null;
  s.resultSaved = false;
  s.resultOnlineSaved = false;
  s.resultSummary = null;
  s.aiBusy = false;
  s.aiToken = (Number(s.aiToken || 0) || 0) + 1;
  s.message = nextMode === 'local' ? 'Na řadě je X.' : (nextMode === 'pvp' ? s.message || '' : 'Hraješ za X. AI je O.');
  return s;
}

function tttSwitchModeClean(nextMode) {
  const state = tttGetState();
  const mode = String(nextMode || 'ai').trim() || 'ai';
  const previous = String(state.mode || '').trim();
  state.mode = mode;
  state.difficulty = 'ai';
  if (mode !== previous || mode !== 'pvp') {
    tttClearBoardStateForNewMode(state, mode);
  }
  state.screen = 'start';
  return state;
}


function tttNormalizeInviteCode(code) {
  return String(code || '').replace(/\D/g, '').slice(0, 4);
}

function tttMakeInviteCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function tttGetInviteUrl(code) {
  const url = new URL(window.location.href);
  url.hash = 'games=ttt&invite=' + encodeURIComponent(String(code || '').trim());
  return url.toString();
}

function tttFindInviteCodeInParamText(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const cleaned = raw.replace(/^[#?]/, '');
  const candidates = [cleaned];
  const qIndex = cleaned.indexOf('?');
  if (qIndex >= 0) candidates.push(cleaned.slice(qIndex + 1));
  for (const candidate of candidates) {
    try {
      const params = new URLSearchParams(candidate);
      const invite = params.get('invite') || params.get('code') || params.get('tttInvite') || params.get('ttt') || '';
      const normalized = tttNormalizeInviteCode(invite);
      if (normalized) return normalized;
    } catch (err) {}
  }
  const match = cleaned.match(/(?:^|[?&#])(?:invite|code|tttInvite|ttt)=([^&#]+)/i);
  return match ? tttNormalizeInviteCode(decodeURIComponent(match[1] || '')) : '';
}

function tttReadUrlInviteData() {
  try {
    const hashCode = tttFindInviteCodeInParamText(window.location.hash || '');
    if (hashCode) return { code: hashCode, source: 'hash' };
    const queryCode = tttFindInviteCodeInParamText(window.location.search || '');
    if (queryCode) return { code: queryCode, source: 'query' };
  } catch (err) {}
  return { code: '', source: '' };
}

function tttReadHashInviteCode() {
  return tttReadUrlInviteData().code || '';
}

function tttClearInviteFromUrl() {
  try {
    const url = new URL(window.location.href);
    url.hash = '';
    ['invite', 'code', 'tttInvite', 'ttt'].forEach(key => url.searchParams.delete(key));
    history.replaceState(null, '', url.toString());
  } catch (err) {}
}

async function tttOpenFromInviteCode(code, options) {
  const inviteCode = tttNormalizeInviteCode(code);
  if (!inviteCode) return false;
  try {
    showPage('games');
  } catch (err) {}
  const inviteState = tttGetState();
  inviteState.mode = 'pvp';
  inviteState.difficulty = 'ai';
  openGameShell('ttt');
  const linkSource = options && options.source ? String(options.source) : 'hash';
  const result = await tttJoinInviteSession(inviteCode, { flow: 'link', source: linkSource });
  if (result && result.ok) {
    const state = tttGetState();
    state.screen = 'game';
    state.gameOver = false;
    state.winner = null;
    state.startedAt = Date.now();
    tttSetJoinedOnlineMessage(state);
    tttRememberOnlineJoinDiag('link', 'ready', { code: inviteCode, source: linkSource + '-open', message: state.message });
    tttRender();
    scheduleTttLayout();
    tttStartOnlineSyncLoop();
    void tttSyncOnlineSession(true);
    return true;
  }
  tttRememberOnlineJoinDiag('link', 'error', { code: inviteCode, source: linkSource + '-open', reason: tttInviteResultMessage(result, 'Pozvánku z odkazu se nepodařilo přijmout.') });
  return false;
}

function tttSetOnlineStatus(text, kind) {
  const state = tttGetState();
  state.onlineStatus = String(text || '').trim();
  state.onlineKind = String(kind || 'waiting');
}

function tttGetActiveAccountId() {
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  return active && active.id ? String(active.id).trim() : '';
}

function tttGetOnlineDisplayCode() {
  const state = tttGetState();
  return tttNormalizeInviteCode(state && state.online ? state.online.code : '');
}

function tttGetOnlineCodeText() {
  const state = tttGetState();
  const code = tttGetOnlineDisplayCode();
  if (!code || state.mode !== 'pvp') return '';
  const role = String(state.online && state.online.role || '').toUpperCase();
  const roleText = role ? (' · ty jsi ' + role) : '';
  return 'Kód pozvánky: ' + code + roleText;
}

function tttSetOnlineHeadToHeadText(text) {
  const state = tttGetState();
  if (!state.online) state.online = {};
  state.online.headToHeadText = String(text || '').trim();
}

async function tttRefreshOnlineHeadToHead(force) {
  const state = tttGetState();
  const online = state.online || {};
  if (state.mode !== 'pvp') return '';
  const x = String(online.playerXAccountNumber || '').trim();
  const o = String(online.playerOAccountNumber || '').trim();
  if (!x || !o || x === o) {
    const waiting = x ? 'Vzájemné skóre: čekám na druhého hráče.' : '';
    tttSetOnlineHeadToHeadText(waiting);
    return waiting;
  }
  const now = Date.now();
  if (!force && online.headToHeadText && now - Number(online.headToHeadLoadedAt || 0) < 30000) return online.headToHeadText;
  if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadTttHeadToHead !== 'function') {
    const fallback = 'Vzájemné skóre: ' + x + ' vs ' + o;
    tttSetOnlineHeadToHeadText(fallback);
    return fallback;
  }
  try {
    const result = await window.RotationSupabaseBridge.loadTttHeadToHead(x, o, { force: !!force });
    if (result && result.ok) {
      const score = result.score || {};
      const xWins = Number(score.xWins || 0) || 0;
      const oWins = Number(score.oWins || 0) || 0;
      const draws = Number(score.draws || 0) || 0;
      const label = 'Vzájemně: X ' + xWins + ' : ' + oWins + ' O' + (draws ? (' · remízy ' + draws) : '');
      state.online.headToHeadLoadedAt = now;
      tttSetOnlineHeadToHeadText(label);
      return label;
    }
  } catch (err) {
    console.warn('TTT head-to-head load failed', err);
  }
  const fallback = 'Vzájemné skóre: čeká na načtení.';
  tttSetOnlineHeadToHeadText(fallback);
  return fallback;
}

const TTT_ONLINE_POLL_MS = 650;
const TTT_ONLINE_RESULT_STORE_KEY = 'rotace_ttt_online_results_v1';
const TTT_ONLINE_JOIN_DIAG_KEY = 'rotace_ttt_online_join_diag_v1';

function tttReadOnlineResultStore() {
  try {
    const parsed = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(TTT_ONLINE_RESULT_STORE_KEY, {})
      : JSON.parse(localStorage.getItem(TTT_ONLINE_RESULT_STORE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
}

function tttWriteOnlineResultStore(store) {
  try {
    const payload = JSON.stringify(store && typeof store === 'object' ? store : {});
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(TTT_ONLINE_RESULT_STORE_KEY, payload);
    else localStorage.setItem(TTT_ONLINE_RESULT_STORE_KEY, payload);
  } catch (err) {}
}


function tttNormalizeOnlineJoinDiag(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const safeEntry = (entry) => entry && typeof entry === 'object' ? {
    flow: String(entry.flow || '').slice(0, 24),
    stage: String(entry.stage || '').slice(0, 32),
    ok: entry.ok === true || String(entry.stage || '') === 'success' || String(entry.stage || '') === 'ready',
    code: tttNormalizeInviteCode(entry.code || ''),
    role: String(entry.role || '').slice(0, 8),
    turn: String(entry.turn || '').slice(0, 8),
    mode: String(entry.mode || '').slice(0, 12),
    canMoveNow: entry.canMoveNow === true,
    sessionId: String(entry.sessionId || '').slice(0, 80),
    inviteId: String(entry.inviteId || '').slice(0, 80),
    source: String(entry.source || '').slice(0, 32),
    message: String(entry.message || '').slice(0, 180),
    reason: String(entry.reason || '').slice(0, 180),
    at: Number(entry.at || 0) || 0,
    version: String(entry.version || '').slice(0, 40)
  } : null;
  const history = Array.isArray(src.history) ? src.history.map(safeEntry).filter(Boolean).slice(-12) : [];
  return {
    version: String(src.version || window.APP_VERSION || '').slice(0, 40),
    attempts: Number(src.attempts || 0) || 0,
    linkAttempts: Number(src.linkAttempts || 0) || 0,
    manualAttempts: Number(src.manualAttempts || 0) || 0,
    successes: Number(src.successes || 0) || 0,
    linkSuccesses: Number(src.linkSuccesses || 0) || 0,
    manualSuccesses: Number(src.manualSuccesses || 0) || 0,
    errors: Number(src.errors || 0) || 0,
    roleRepairs: Number(src.roleRepairs || 0) || 0,
    moveBlocks: Number(src.moveBlocks || 0) || 0,
    last: safeEntry(src.last),
    lastLink: safeEntry(src.lastLink),
    lastManual: safeEntry(src.lastManual),
    lastRoleRepair: safeEntry(src.lastRoleRepair),
    lastMoveBlock: safeEntry(src.lastMoveBlock),
    history
  };
}

function tttReadOnlineJoinDiag() {
  try {
    const raw = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(TTT_ONLINE_JOIN_DIAG_KEY, {})
      : JSON.parse(localStorage.getItem(TTT_ONLINE_JOIN_DIAG_KEY) || '{}');
    return tttNormalizeOnlineJoinDiag(raw);
  } catch (err) {
    return tttNormalizeOnlineJoinDiag(null);
  }
}

function tttWriteOnlineJoinDiag(next) {
  const safe = tttNormalizeOnlineJoinDiag(next);
  try {
    const payload = JSON.stringify(safe);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(TTT_ONLINE_JOIN_DIAG_KEY, payload);
    else localStorage.setItem(TTT_ONLINE_JOIN_DIAG_KEY, payload);
  } catch (err) {}
  return safe;
}

function tttRememberOnlineJoinDiag(flow, stage, details) {
  const normalizedFlow = String(flow || 'manual').trim() === 'link' ? 'link' : 'manual';
  const normalizedStage = String(stage || 'start').trim() || 'start';
  const state = tttGetState();
  const online = state.online || {};
  const role = String((details && details.role) || online.role || '').toUpperCase();
  const turn = String((details && details.turn) || state.turn || '').toUpperCase();
  const entry = {
    flow: normalizedFlow,
    stage: normalizedStage,
    ok: normalizedStage === 'success',
    code: (details && details.code) || online.code || '',
    role,
    turn,
    mode: (details && details.mode) || state.mode || '',
    canMoveNow: !!(state.mode === 'pvp' && role && turn && role === turn && !state.gameOver),
    sessionId: (details && details.sessionId) || online.sessionId || '',
    inviteId: (details && details.inviteId) || online.inviteId || '',
    source: (details && details.source) || normalizedFlow,
    message: (details && details.message) || state.message || '',
    reason: (details && details.reason) || '',
    at: Date.now(),
    version: window.APP_VERSION || ''
  };
  const next = tttReadOnlineJoinDiag();
  next.version = window.APP_VERSION || next.version || '';
  if (normalizedStage === 'start') {
    next.attempts += 1;
    if (normalizedFlow === 'link') next.linkAttempts += 1;
    else next.manualAttempts += 1;
  } else if (normalizedStage === 'success') {
    next.successes += 1;
    if (normalizedFlow === 'link') next.linkSuccesses += 1;
    else next.manualSuccesses += 1;
  } else if (normalizedStage === 'error') {
    next.errors += 1;
  }
  next.last = entry;
  if (normalizedFlow === 'link') next.lastLink = entry;
  else next.lastManual = entry;
  next.history = (next.history || []).concat(entry).slice(-12);
  return tttWriteOnlineJoinDiag(next);
}


function tttRememberOnlineMoveBlock(reason, details) {
  try {
    const next = tttReadOnlineJoinDiag();
    const state = tttGetState();
    const online = state.online || {};
    const flow = String(online.joinFlow || '').trim() === 'link' ? 'link' : 'manual';
    const role = tttNormalizeOnlineRole((details && details.role) || online.role || '');
    const turn = String((details && details.turn) || state.turn || '').toUpperCase();
    const entry = {
      flow,
      stage: 'move-block',
      ok: false,
      code: (details && details.code) || online.code || '',
      role,
      turn,
      mode: state.mode || '',
      canMoveNow: !!(state.mode === 'pvp' && role && turn && role === turn && !state.gameOver),
      sessionId: (details && details.sessionId) || online.sessionId || '',
      inviteId: (details && details.inviteId) || online.inviteId || '',
      source: (details && details.source) || 'move-guard',
      message: (details && details.message) || state.message || '',
      reason: String(reason || 'blocked-move').slice(0, 180),
      at: Date.now(),
      version: window.APP_VERSION || ''
    };
    next.moveBlocks = (Number(next.moveBlocks || 0) || 0) + 1;
    next.lastMoveBlock = entry;
    next.last = entry;
    if (flow === 'link') next.lastLink = entry;
    else next.lastManual = entry;
    next.history = (next.history || []).concat(entry).slice(-12);
    tttWriteOnlineJoinDiag(next);
  } catch (err) {}
}

function tttRequestOnlineGuardResync(reason) {
  try {
    const state = tttGetState();
    if (!state || state.mode !== 'pvp' || !state.online || !state.online.code) return false;
    tttStartOnlineSyncLoop();
    window.setTimeout(() => { void tttSyncOnlineSession(true); }, 80);
    window.setTimeout(() => { void tttSyncOnlineSession(true); }, 650);
    return true;
  } catch (err) {
    return false;
  }
}

function tttGetOnlineJoinHealth() {
  const state = typeof app !== 'undefined' && app ? tttGetState() : null;
  const online = state && state.online ? state.online : {};
  const diag = tttReadOnlineJoinDiag();
  const issues = [];
  const warnings = [];
  if (typeof tttOpenFromInviteCode !== 'function') issues.push('chybí otevření pozvánky z odkazu');
  if (typeof tttJoinInviteSession !== 'function') issues.push('chybí společné přijetí pozvánky');
  if (typeof tttPrepareOnlineJoinState !== 'function') issues.push('chybí příprava online join stavu');
  if (diag.lastLink && diag.lastLink.stage === 'start') warnings.push('poslední link join zatím nemá potvrzený úspěch');
  if (diag.lastLink && diag.lastLink.stage === 'success' && diag.lastLink.mode !== 'pvp') issues.push('poslední link join neskončil v online režimu');
  if (diag.lastLink && diag.lastLink.stage === 'success' && String(diag.lastLink.role || '').toUpperCase() !== 'O') issues.push('poslední link join nemá roli O');
  if (diag.lastMoveBlock && String(diag.lastMoveBlock.reason || '') === 'missing-role-before-move') warnings.push('poslední online tah se zastavil kvůli nenačtené roli');
  if (diag.lastMoveBlock && String(diag.lastMoveBlock.reason || '') === 'turn-mismatch-before-move') warnings.push('poslední online tah byl mimo tah aktuálního hráče');
  if (state && state.mode === 'pvp' && online && online.code && !tttNormalizeOnlineRole(online.role || '')) issues.push('online režim nemá lokální roli hráče');
  return {
    ok: issues.length === 0,
    mode: 'ttt-online-link-join-runtime-guard',
    issues: issues.slice(0, 8),
    warnings: warnings.slice(0, 8),
    attempts: diag.attempts,
    linkAttempts: diag.linkAttempts,
    manualAttempts: diag.manualAttempts,
    successes: diag.successes,
    linkSuccesses: diag.linkSuccesses,
    manualSuccesses: diag.manualSuccesses,
    errors: diag.errors,
    roleRepairs: diag.roleRepairs,
    moveBlocks: diag.moveBlocks,
    last: diag.last,
    lastLink: diag.lastLink,
    lastManual: diag.lastManual,
    lastRoleRepair: diag.lastRoleRepair,
    lastMoveBlock: diag.lastMoveBlock,
    activeMode: state ? String(state.mode || '') : '',
    activeRole: String(online.role || '').toUpperCase(),
    activeTurn: state ? String(state.turn || '').toUpperCase() : '',
    activeCanMoveNow: !!(state && state.mode === 'pvp' && online.role && String(online.role).toUpperCase() === String(state.turn || '').toUpperCase() && !state.gameOver),
    activeCode: tttNormalizeInviteCode(online.code || ''),
    checkedAt: new Date().toISOString()
  };
}

if (typeof window !== 'undefined') {
  window.getTttOnlineJoinHealth = tttGetOnlineJoinHealth;
}

function tttNormalizeOnlineRole(role) {
  const upper = String(role || '').trim().toUpperCase();
  return upper === 'X' || upper === 'O' ? upper : '';
}

function tttExtractOnlinePlayerAccounts(statePatch, remote) {
  const patch = statePatch && typeof statePatch === 'object' ? statePatch : {};
  const online = tttGetState().online || {};
  const result = {
    x: String(patch.playerXAccountNumber || patch.player_x_account_number || online.playerXAccountNumber || '').trim(),
    o: String(patch.playerOAccountNumber || patch.player_o_account_number || online.playerOAccountNumber || '').trim()
  };
  const session = remote && remote.session && typeof remote.session === 'object' ? remote.session : null;
  const invite = remote && remote.invite && typeof remote.invite === 'object' ? remote.invite : null;
  if (session) {
    result.x = String(session.player_x_account_number || result.x || '').trim();
    result.o = String(session.player_o_account_number || result.o || '').trim();
  }
  if (invite) {
    result.x = String(invite.inviter_account_number || result.x || '').trim();
    result.o = String(invite.invitee_account_number || result.o || '').trim();
  }
  return result;
}

function tttRememberOnlineRoleRepair(details) {
  try {
    const next = tttReadOnlineJoinDiag();
    const state = tttGetState();
    const online = state.online || {};
    const entry = {
      flow: 'runtime',
      stage: 'role-repair',
      ok: true,
      code: (details && details.code) || online.code || '',
      role: tttNormalizeOnlineRole((details && details.role) || online.role || ''),
      turn: String((details && details.turn) || state.turn || '').toUpperCase(),
      mode: state.mode || '',
      canMoveNow: !!(state.mode === 'pvp' && online.role && tttNormalizeOnlineRole(online.role) === String(state.turn || '').toUpperCase() && !state.gameOver),
      sessionId: (details && details.sessionId) || online.sessionId || '',
      inviteId: (details && details.inviteId) || online.inviteId || '',
      source: (details && details.source) || 'role-guard',
      message: (details && details.message) || state.message || '',
      reason: (details && details.reason) || '',
      at: Date.now(),
      version: window.APP_VERSION || ''
    };
    next.roleRepairs = (Number(next.roleRepairs || 0) || 0) + 1;
    next.lastRoleRepair = entry;
    next.last = entry;
    next.history = (next.history || []).concat(entry).slice(-12);
    tttWriteOnlineJoinDiag(next);
  } catch (err) {}
}

function tttEnsureOnlineRoleFromAccounts(state, statePatch, remote, source) {
  const s = state || tttGetState();
  if (!s.online) s.online = tttCreateEmptyOnlineState();
  const accounts = tttExtractOnlinePlayerAccounts(statePatch, remote);
  if (accounts.x && !s.online.playerXAccountNumber) s.online.playerXAccountNumber = accounts.x;
  if (accounts.o && !s.online.playerOAccountNumber) s.online.playerOAccountNumber = accounts.o;
  const activeAccount = tttGetActiveAccountId();
  const previousRole = tttNormalizeOnlineRole(s.online.role);
  let nextRole = previousRole;
  if (activeAccount && accounts.o && String(activeAccount) === String(accounts.o)) nextRole = 'O';
  else if (activeAccount && accounts.x && String(activeAccount) === String(accounts.x)) nextRole = 'X';
  else if (!nextRole) nextRole = tttNormalizeOnlineRole(remote && remote.role);
  if (nextRole && nextRole !== previousRole) {
    s.online.role = nextRole.toLowerCase();
    tttRememberOnlineRoleRepair({
      code: s.online.code || '',
      role: nextRole,
      turn: s.turn || '',
      sessionId: s.online.sessionId || '',
      inviteId: s.online.inviteId || '',
      source: source || 'role-guard',
      reason: previousRole ? ('role-conflict-' + previousRole + '-to-' + nextRole) : 'missing-role'
    });
  }
  return tttNormalizeOnlineRole(s.online.role);
}

function tttSetJoinedOnlineMessage(state) {
  const s = state || tttGetState();
  const online = s.online || {};
  const role = String(online.role || '').toUpperCase() || 'O';
  const turn = String(s.turn || 'X').toUpperCase();
  if (s.gameOver) return s.message || 'Partie je dokončená.';
  s.message = role && turn === role ? ('Jsi ' + role + '. Hraješ.') : ('Čekáš na tah hráče ' + turn + '.');
  tttSetOnlineStatus(s.message, 'active');
  return s.message;
}

function tttBuildOnlineResultKey(code, revision, winner, role, sessionId) {

  const sessionPart = String(sessionId || code || '').trim().toUpperCase();
  return [
    sessionPart || 'NOSESSION',
    String(role || '').trim().toUpperCase() || 'N',
    String(winner || 'draw').trim().toUpperCase() || 'DRAW'
  ].join(':');
}

function tttMarkOnlineResultSeen(code, revision, winner, role, sessionId) {
  const key = tttBuildOnlineResultKey(code, revision, winner, role, sessionId);
  const store = tttReadOnlineResultStore();
  if (store[key]) return false;
  store[key] = Date.now();
  tttWriteOnlineResultStore(store);
  return true;
}


function tttGetAccountDisplayName(accountNumber) {
  const id = String(accountNumber || '').trim();
  if (!id) return '';
  try {
    const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
    const account = profile && profile.accounts ? profile.accounts[id] : null;
    if (account && account.name) return String(account.name).trim();
  } catch (err) {}
  try {
    if (Array.isArray(window.GAMES_ACCOUNT_LIST)) {
      const match = window.GAMES_ACCOUNT_LIST.find(acc => String(acc && acc.id || '').trim() === id);
      if (match && match.name) return String(match.name).trim();
    }
  } catch (err) {}
  try {
    if (typeof GAMES_ACCOUNT_LIST !== 'undefined' && Array.isArray(GAMES_ACCOUNT_LIST)) {
      const match = GAMES_ACCOUNT_LIST.find(acc => String(acc && acc.id || '').trim() === id);
      if (match && match.name) return String(match.name).trim();
    }
  } catch (err) {}
  return 'Hráč ' + id;
}

function tttGetOnlineCodeText() {
  const state = tttGetState();
  const online = state.online || {};
  const code = String(online.code || '').trim();
  if (!code) return '';
  if (String(online.status || '').toLowerCase() === 'waiting' || !online.playerOAccountNumber) {
    return 'Kód pozvánky: ' + code;
  }
  return '';
}

function tttBuildOnlineScoreText() {
  const state = tttGetState();
  const online = state.online || {};
  const xAcc = String(online.playerXAccountNumber || '').trim();
  const oAcc = String(online.playerOAccountNumber || '').trim();
  if (!xAcc || !oAcc) return '';
  const xName = tttGetAccountDisplayName(xAcc) || 'Hráč X';
  const oName = tttGetAccountDisplayName(oAcc) || 'Hráč O';
  const score = online.headToHead && online.headToHead.score ? online.headToHead.score : null;
  let xWins = 0;
  let oWins = 0;
  if (score) {
    if (Number.isFinite(Number(score.xWins)) || Number.isFinite(Number(score.oWins))) {
      xWins = Number(score.xWins || 0) || 0;
      oWins = Number(score.oWins || 0) || 0;
    } else {
      const players = online.headToHead && online.headToHead.players ? online.headToHead.players : {};
      const a = String(players.a || '').trim();
      const b = String(players.b || '').trim();
      if (a && b) {
        xWins = xAcc === a ? Number(score.aWins || 0) || 0 : Number(score.bWins || 0) || 0;
        oWins = oAcc === a ? Number(score.aWins || 0) || 0 : Number(score.bWins || 0) || 0;
      } else {
        xWins = Number(score.aWins || 0) || 0;
        oWins = Number(score.bWins || 0) || 0;
      }
    }
  }
  return xName + ' (x) ' + xWins + ':' + oWins + ' ' + oName + ' (o)';
}


function tttBumpOnlineHeadToHeadLocally(winner) {
  const state = tttGetState();
  const online = state.online || {};
  const xAcc = String(online.playerXAccountNumber || '').trim();
  const oAcc = String(online.playerOAccountNumber || '').trim();
  const result = String(winner || '').trim();
  if (!xAcc || !oAcc || !['X', 'O', 'draw'].includes(result)) return false;
  const current = online.headToHead && typeof online.headToHead === 'object' ? online.headToHead : { ok: true, score: {}, players: { a: xAcc, b: oAcc }, rows: [] };
  const score = Object.assign({ xWins: 0, oWins: 0, aWins: 0, bWins: 0, draws: 0, total: 0 }, current.score && typeof current.score === 'object' ? current.score : {});
  const players = Object.assign({ a: xAcc, b: oAcc }, current.players && typeof current.players === 'object' ? current.players : {});
  if (result === 'draw') score.draws = (Number(score.draws || 0) || 0) + 1;
  else if (result === 'X') score.xWins = (Number(score.xWins || 0) || 0) + 1;
  else if (result === 'O') score.oWins = (Number(score.oWins || 0) || 0) + 1;
  const winnerAcc = result === 'X' ? xAcc : (result === 'O' ? oAcc : '');
  if (winnerAcc && String(players.a || '').trim() === winnerAcc) score.aWins = (Number(score.aWins || 0) || 0) + 1;
  else if (winnerAcc && String(players.b || '').trim() === winnerAcc) score.bWins = (Number(score.bWins || 0) || 0) + 1;
  score.total = (Number(score.total || 0) || 0) + 1;
  online.headToHead = Object.assign({}, current, { ok: true, optimistic: true, score, players, updatedAt: new Date().toISOString() });
  online.headToHeadText = tttBuildOnlineScoreText();
  online.headToHeadLoadedAt = Date.now();
  state.online = online;
  return true;
}

function tttRenderInviteOverlay(overlay) {
  const state = tttGetState();
  const el = overlay ? overlay.querySelector('#tttInviteOverlay') : null;
  if (!el) return;
  const online = state.online || {};
  const code = String(online.code || '').trim();
  const waiting = state.mode === 'pvp' && code && (String(online.status || '').toLowerCase() === 'waiting' || !online.playerOAccountNumber) && !state.gameOver;
  el.hidden = !waiting;
  el.classList.toggle('isVisible', !!waiting);
  if (!waiting) {
    el.textContent = '';
    return;
  }
  const inviteUrl = online.inviteUrl || tttGetInviteUrl(code);
  if (state.online) state.online.inviteUrl = inviteUrl;
  const fragment = document.createDocumentFragment();
  const label = document.createElement('div');
  label.className = 'tttInviteOverlayLabel';
  label.textContent = 'Pozvánka pro spoluhráče';
  const codeEl = document.createElement('div');
  codeEl.className = 'tttInviteOverlayCode';
  codeEl.textContent = code;
  const hint = document.createElement('div');
  hint.className = 'tttInviteOverlayHint';
  hint.textContent = 'Může opsat 4 čísla, nebo mu pošli odkaz a hra se mu otevře rovnou.';
  const linkEl = document.createElement('div');
  linkEl.className = 'tttInviteOverlayLink';
  linkEl.textContent = inviteUrl;
  const actions = document.createElement('div');
  actions.className = 'tttInviteOverlayActions';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'tttBtn tttInviteOverlayBtn';
  copyBtn.textContent = 'Kopírovat odkaz';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      copyBtn.textContent = 'Odkaz zkopírován';
      window.setTimeout(() => { copyBtn.textContent = 'Kopírovat odkaz'; }, 1400);
    } catch (err) {
      copyBtn.textContent = 'Nešlo zkopírovat';
      window.setTimeout(() => { copyBtn.textContent = 'Kopírovat odkaz'; }, 1400);
    }
  });
  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'tttBtn tttInviteOverlayBtn';
  shareBtn.textContent = 'Sdílet';
  shareBtn.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Piškvorky', text: 'Přidej se ke hře v RaK.', url: inviteUrl });
      else await navigator.clipboard.writeText(inviteUrl);
    } catch (err) {}
  });
  actions.appendChild(copyBtn);
  actions.appendChild(shareBtn);
  fragment.appendChild(label);
  fragment.appendChild(codeEl);
  fragment.appendChild(hint);
  fragment.appendChild(linkEl);
  fragment.appendChild(actions);
  if (typeof replaceElementChildrenSafely === 'function') replaceElementChildrenSafely(el, fragment, 'ttt-invite-overlay');
  else {
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(fragment);
  }
}

async function tttRefreshOnlineHeadToHead(force) {
  const state = tttGetState();
  const online = state.online || {};
  const x = String(online.playerXAccountNumber || '').trim();
  const o = String(online.playerOAccountNumber || '').trim();
  if (!x || !o || !window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadTttHeadToHead !== 'function') return null;
  try {
    const res = await window.RotationSupabaseBridge.loadTttHeadToHead(x, o, { force: !!force });
    if (res && res.ok) {
      online.headToHead = res;
      online.headToHeadText = tttBuildOnlineScoreText();
      state.online = online;
      return res;
    }
  } catch (err) {
    console.warn('TTT head-to-head load failed', err);
  }
  return null;
}

async function tttRecordOnlineSessionResult(force) {
  const state = tttGetState();
  const online = state.online || {};
  if (!online.code || !window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.recordTttSessionResultByInviteCode !== 'function') return null;
  try {
    const res = await window.RotationSupabaseBridge.recordTttSessionResultByInviteCode(online.code, { force: !!force });
    if (res && res.ok) {
      void gamesRefreshRemoteLeaderboards('ttt', true).then(() => {
        if (typeof gamesSyncProfileFromRemote === 'function') return gamesSyncProfileFromRemote(true);
        return null;
      }).then(() => {
        if (typeof gamesRenderProfiles === 'function') gamesRenderProfiles();
      });
      void tttRefreshOnlineHeadToHead(true).then(() => {
        if (typeof tttRender === 'function') tttRender();
      });
      void tttRefreshOnlineScoreRows(true);
    }
    return res;
  } catch (err) {
    console.warn('TTT online stats record failed', err);
    return null;
  }
}

function tttMakeOnlineStatePatch(extraPatch) {
  const state = tttGetState();
  const online = state.online || {};
  const now = Date.now();
  const revision = Number(online.pendingRevision || online.revision || 0) || 0;
  const patch = {
    board: state.board.slice(),
    turn: state.turn,
    gameOver: !!state.gameOver,
    winner: state.winner || null,
    message: state.message || '',
    moveCount: state.moveCount || 0,
    moveCountX: state.moveCountX || 0,
    moveCountO: state.moveCountO || 0,
    startedAt: state.startedAt || 0,
    status: state.gameOver ? 'finished' : (online.status || 'active'),
    revision,
    updatedAtTs: now,
    updatedAt: new Date(now).toISOString(),
    lastMoveIndex: Number.isFinite(Number(state.lastMoveIndex)) ? Number(state.lastMoveIndex) : null,
    lastMoveMark: state.lastMoveMark || null,
    lastMoveByRole: online.role || null,
    playerXAccountNumber: online.playerXAccountNumber || null,
    playerOAccountNumber: online.playerOAccountNumber || null,
    winnerRole: state.gameOver ? (state.winner || null) : null,
    nextStarter: state.nextStarter || (state.gameOver && ['X','O'].includes(String(state.winner || '')) ? state.winner : null),
    rulesetVersion: GOMOKU_RULESET_VERSION,
    rows: TTT_ROWS,
    cols: TTT_COLS,
    winLength: TTT_WIN_LENGTH,
    engineProfile: 'deterministic-10x19-tss-pvs-safe-v951',
    winnerAccountNumber: null
  };
  if (patch.winner === 'X') patch.winnerAccountNumber = online.playerXAccountNumber || null;
  else if (patch.winner === 'O') patch.winnerAccountNumber = online.playerOAccountNumber || null;
  else if (patch.winner === 'draw') patch.winnerAccountNumber = null;
  return Object.assign(patch, extraPatch && typeof extraPatch === 'object' ? extraPatch : {});
}

function tttApplyOnlineState(statePatch, remote) {
  const state = tttGetState();
  if (!statePatch || typeof statePatch !== 'object') return false;

  const remoteBoard = Array.isArray(statePatch.board) ? statePatch.board : null;
  const remoteRows = Number(statePatch.rows || statePatch.boardRows || 0) || 0;
  const remoteCols = Number(statePatch.cols || statePatch.columns || statePatch.boardCols || 0) || 0;
  const remoteWinLength = Number(statePatch.winLength || statePatch.win_length || 0) || 0;
  const remoteRuleset = String(statePatch.rulesetVersion || statePatch.ruleset_version || '').trim();
  const dimensionMismatch = (remoteBoard && remoteBoard.length !== TTT_TOTAL_CELLS)
    || (remoteRows && remoteRows !== TTT_ROWS)
    || (remoteCols && remoteCols !== TTT_COLS)
    || (remoteWinLength && remoteWinLength !== TTT_WIN_LENGTH);
  if (dimensionMismatch) {
    if (!state.online) state.online = {};
    state.online.status = 'incompatible';
    state.online.connected = false;
    state.message = 'Tahle online pozvánka je z jiné verze Piškvorek. Vytvoř novou hru.';
    tttSetOnlineStatus(state.message, 'error');
    return false;
  }
  if (remoteRuleset && remoteRuleset !== GOMOKU_RULESET_VERSION) {
    if (!state.online) state.online = {};
    state.online.status = 'incompatible';
    state.online.connected = false;
    state.message = 'Tahle online hra používá jinou verzi pravidel Piškvorek. Vytvoř novou hru.';
    tttSetOnlineStatus(state.message, 'error');
    return false;
  }

  if (remoteBoard && remoteBoard.length === TTT_TOTAL_CELLS) {
    state.board = remoteBoard.slice();
  }
  state.turn = statePatch.turn === 'O' ? 'O' : 'X';
  state.gameOver = !!statePatch.gameOver;
  state.winner = statePatch.winner || null;
  if (['X', 'O'].includes(String(statePatch.nextStarter || ''))) state.nextStarter = statePatch.nextStarter;
  state.message = statePatch.message || (state.gameOver
    ? (state.winner === 'draw' ? 'Remíza. Dobře hrané.' : ('Vyhrál hráč ' + state.winner + '.'))
    : (state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.'));
  state.moveCount = Number(statePatch.moveCount || 0) || 0;
  state.moveCountX = Number(statePatch.moveCountX || 0) || 0;
  state.moveCountO = Number(statePatch.moveCountO || 0) || 0;
  state.startedAt = Number(statePatch.startedAt || state.startedAt || 0) || 0;
  state.lastMoveIndex = Number.isFinite(Number(statePatch.lastMoveIndex)) ? Number(statePatch.lastMoveIndex) : null;
  state.lastMoveMark = statePatch.lastMoveMark || null;

  if (!state.online) state.online = {};
  state.online.code = String((remote && remote.code) || state.online.code || '').trim().toUpperCase();
  state.online.inviteId = remote && remote.inviteId ? remote.inviteId : (state.online.inviteId || null);
  state.online.sessionId = remote && remote.sessionId ? remote.sessionId : (state.online.sessionId || null);
  state.online.role = state.online.role || (remote && remote.role) || '';
  state.online.status = statePatch.status || state.online.status || 'active';
  state.online.revision = Number(statePatch.revision || state.online.revision || 0) || 0;
  state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, state.online.revision);
  state.online.lastUpdatedAt = Number(statePatch.updatedAtTs || state.online.lastUpdatedAt || Date.now()) || Date.now();
  state.online.lastRemoteUpdatedAt = state.online.lastUpdatedAt;
  state.online.playerXAccountNumber = statePatch.playerXAccountNumber || state.online.playerXAccountNumber || null;
  state.online.playerOAccountNumber = statePatch.playerOAccountNumber || state.online.playerOAccountNumber || null;
  tttEnsureOnlineRoleFromAccounts(state, statePatch, remote, 'apply-online-state');
  if (state.online.playerOAccountNumber && String(state.online.status || '').toLowerCase() === 'waiting') state.online.status = 'active';
  state.online.headToHeadText = tttBuildOnlineScoreText();
  state.online.connected = true;
  state.online.dirty = false;
  state.online.resultSavedKey = state.online.resultSavedKey || '';
  state.online.statsRecordedAt = statePatch.statsRecordedAt || state.online.statsRecordedAt || '';
  state.online.statsRecordedBy = statePatch.statsRecordedBy || state.online.statsRecordedBy || '';
  tttSetOnlineStatus(state.message, state.gameOver ? 'finished' : state.online.status);
  return true;
}

function tttMaybeRecordOnlineResult(winner) {
  const state = tttGetState();
  const online = state.online || null;
  if (!online || !online.code) return false;
  if (!['X', 'O', 'draw'].includes(String(winner || '').trim())) return false;
  const key = tttBuildOnlineResultKey(online.code, online.revision || online.pendingRevision || 0, winner, online.role || '', online.sessionId || '');
  if (online.resultSavedKey === key) return false;
  const store = tttReadOnlineResultStore();
  if (store[key]) {
    online.resultSavedKey = key;
    return false;
  }
  store[key] = Date.now();
  tttWriteOnlineResultStore(store);
  online.resultSavedKey = key;
  tttBumpOnlineHeadToHeadLocally(winner);

  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  if (active && active.stats && active.stats.ttt && typeof gamesRecordStat === 'function') {
    const stats = active.stats.ttt || {};
    const played = (stats.plays || 0) + 1;
    const isDraw = winner === 'draw';
    const role = String(online.role || '').toUpperCase();
    const won = !isDraw && String(winner || '').toUpperCase() === role;
    const onlineLocalGuard = {
      skipOnlineSync: true,
      onlineSessionId: String(online.sessionId || online.code || '').trim(),
      onlineResultKey: key
    };
    gamesRecordStat('ttt', isDraw
      ? Object.assign({
          completed: true,
          online: true,
          onlinePlay: true,
          onlinePlays: 1,
          plays: played,
          draws: (stats.draws || 0) + 1,
          bestMoves: stats.bestMoves || null,
          bestTimeMs: stats.bestTimeMs || null,
          lastResult: 'Online remíza · ' + String(state.moveCount || 0) + ' tahů'
        }, onlineLocalGuard)
      : Object.assign({
          completed: true,
          online: true,
          onlinePlay: true,
          onlinePlays: 1,
          onlineWin: won,
          onlineWins: won ? 1 : 0,
          plays: played,
          wins: won ? (stats.wins || 0) + 1 : (stats.wins || 0),
          losses: won ? (stats.losses || 0) : (stats.losses || 0) + 1,
          draws: stats.draws || 0,
          bestMoves: won ? Math.min(stats.bestMoves || 9999, state.moveCount || 0) : stats.bestMoves || null,
          bestTimeMs: won ? Math.min(stats.bestTimeMs || 999999999, tttGetElapsedMs(state)) : stats.bestTimeMs || null,
          lastResult: (won ? 'Online výhra' : 'Online prohra') + ' · ' + String(state.moveCount || 0) + ' tahů'
        }, onlineLocalGuard));
  }
  void tttRecordOnlineSessionResult(false);
  void gamesRefreshRemoteLeaderboards('ttt', true);
  void tttRefreshOnlineHeadToHead(true).then(() => {
    if (typeof tttRender === 'function' && document.getElementById('tttOverlay')?.classList.contains('isVisible')) tttRender();
  });
  void tttRefreshOnlineScoreRows(true);
  return true;
}

async function tttCreateInviteSession() {
  const state = tttGetState();
  const code = tttMakeInviteCode();
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  const inviter = active && active.id ? String(active.id) : null;
  const payload = {
    board: Array(TTT_TOTAL_CELLS).fill(''),
    turn: 'X',
    status: 'waiting',
    mode: 'pvp',
    code,
    playerXAccountNumber: inviter,
    playerOAccountNumber: null,
    x: inviter,
    o: null,
    createdAt: Date.now(),
    revision: 0,
    updatedAtTs: Date.now()
  };
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.createGameInvite === 'function') {
    const result = await window.RotationSupabaseBridge.createGameInvite({
      code,
      inviterAccountNumber: inviter,
      boardState: payload,
      payload: { createdBy: inviter }
    });
    if (result && result.ok) {
      state.online = {
        code,
        inviteId: result.inviteId || (result.invite && result.invite.id) || (result.result && result.result.invite && result.result.invite.id) || null,
        sessionId: result.sessionId || (result.session && result.session.id) || (result.result && result.result.session && result.result.session.id) || null,
        role: 'x',
        status: 'waiting',
        revision: 0,
        lastUpdatedAt: Date.now(),
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: 0,
        playerXAccountNumber: inviter,
        playerOAccountNumber: null,
        connected: true,
        resultSavedKey: '',
        inviteUrl: '',
        joinFlow: 'create',
        joinSource: 'create-invite'
      };
      state.online.inviteUrl = tttGetInviteUrl(code);
      tttSetOnlineStatus('Pozvánka vytvořená na 60 minut. Kód pro spoluhráče: ' + code + '.', 'waiting');
      return { ok: true, code, url: tttGetInviteUrl(code), result };
    }
  }
  state.online = {
    code,
    inviteId: null,
    sessionId: null,
    role: 'x',
    status: 'waiting',
    revision: 0,
    lastUpdatedAt: Date.now(),
    lastRemoteUpdatedAt: 0,
    dirty: false,
    pendingRevision: 0,
    playerXAccountNumber: inviter,
    playerOAccountNumber: null,
    connected: true,
    resultSavedKey: '',
    inviteUrl: tttGetInviteUrl(code),
    joinFlow: 'create',
    joinSource: 'create-invite-local'
  };
  tttSetOnlineStatus('Pozvánka vytvořená lokálně. Kód pro spoluhráče: ' + code + '.', 'waiting');
  return { ok: true, code, url: tttGetInviteUrl(code), local: true };
}

function tttInviteResultMessage(result, fallback) {
  if (!result) return fallback || 'Pozvánku se nepodařilo načíst.';
  if (result.expired || result.reason === 'expired-invite' || result.reason === 'INVITE_EXPIRED') return 'Tahle pozvánka už vypršela. Vytvoř novou.';
  if (result.message) return String(result.message);
  if (result.error && result.error.message) return String(result.error.message);
  return fallback || 'Pozvánku se nepodařilo načíst.';
}

function tttPrepareOnlineJoinState(state, inviteCode) {
  const s = state || tttGetState();
  const code = tttNormalizeInviteCode(inviteCode);
  if (!s.online) s.online = tttCreateEmptyOnlineState();
  s.mode = 'pvp';
  s.difficulty = 'ai';
  s.screen = 'game';
  s.gameOver = false;
  s.winner = null;
  s.hardWinPrompt = false;
  s.hardWinStats = null;
  s.resultSaved = false;
  s.resultOnlineSaved = false;
  s.resultSummary = null;
  if (code) {
    s.online.code = code;
    s.online.inviteUrl = tttGetInviteUrl(code);
  }
  return s;
}

async function tttJoinInviteSession(code, options) {
  const state = tttGetState();
  const inviteCode = tttNormalizeInviteCode(code);
  const flow = options && String(options.flow || '').trim() === 'link' ? 'link' : 'manual';
  const joinSource = String(options && options.source || 'join-session').slice(0, 32) || 'join-session';
  if (!inviteCode || inviteCode.length !== 4) {
    tttRememberOnlineJoinDiag(flow, 'error', { code: inviteCode, reason: 'neplatný 4místný kód' });
    return { ok: false, error: new Error('Zadej 4 čísla kódu pozvánky.') };
  }
  tttPrepareOnlineJoinState(state, inviteCode);
  if (state.online) {
    state.online.joinFlow = flow;
    state.online.joinSource = joinSource;
  }
  tttRememberOnlineJoinDiag(flow, 'start', { code: inviteCode, source: joinSource });
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  const joiner = active && active.id ? String(active.id) : null;
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.acceptGameInvite === 'function') {
    const result = await window.RotationSupabaseBridge.acceptGameInvite(inviteCode, joiner);
    if (result && result.ok) {
      state.online = {
        code: inviteCode,
        inviteId: result.inviteId || (result.invite && result.invite.id) || (result.result && result.result.invite && result.result.invite.id) || null,
        sessionId: result.sessionId || (result.session && result.session.id) || (result.result && result.result.session && result.result.session.id) || null,
        role: 'o',
        status: 'active',
        revision: Number(result.revision || 0) || 0,
        lastUpdatedAt: Date.now(),
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: Number(result.revision || 0) || 0,
        playerXAccountNumber: (result.session && result.session.player_x_account_number) || (result.result && result.result.session && result.result.session.player_x_account_number) || null,
        playerOAccountNumber: joiner,
        connected: true,
        resultSavedKey: '',
        inviteUrl: '',
        joinFlow: flow,
        joinSource
      };
      const session = result.session || (result.result && result.result.session) || null;
      const boardState = session && session.board_state && typeof session.board_state === 'object' ? session.board_state : null;
      if (boardState) {
        tttApplyOnlineState(Object.assign({}, boardState, {
          status: 'active',
          playerXAccountNumber: session.player_x_account_number || state.online.playerXAccountNumber || null,
          playerOAccountNumber: session.player_o_account_number || state.online.playerOAccountNumber || null
        }), {
          code: inviteCode,
          inviteId: state.online.inviteId,
          sessionId: state.online.sessionId,
          role: 'o',
          status: 'active'
        });
      }
      tttSetJoinedOnlineMessage(state);
      tttRememberOnlineJoinDiag(flow, 'success', { code: inviteCode, source: joinSource + '-supabase-accept', role: state.online && state.online.role, turn: state.turn, sessionId: state.online && state.online.sessionId, inviteId: state.online && state.online.inviteId, message: state.message });
      return { ok: true, code: inviteCode, result };
    }
    if (result && result.ok === false) {
      state.message = tttInviteResultMessage(result, 'Pozvánku se nepodařilo načíst online. Zkontroluj 4místný kód.');
      tttSetOnlineStatus(state.message, 'error');
      tttRememberOnlineJoinDiag(flow, 'error', { code: inviteCode, source: joinSource + '-supabase-accept', reason: state.message });
      return result;
    }
  }
  state.online = {
    code: inviteCode,
    inviteId: null,
    sessionId: null,
    role: 'o',
    status: 'active',
    revision: 0,
    lastUpdatedAt: Date.now(),
    lastRemoteUpdatedAt: 0,
    dirty: false,
    pendingRevision: 0,
    playerXAccountNumber: null,
    playerOAccountNumber: joiner,
    connected: true,
    resultSavedKey: '',
    inviteUrl: tttGetInviteUrl(inviteCode),
    joinFlow: flow,
    joinSource
  };
  tttSetJoinedOnlineMessage(state);
  tttRememberOnlineJoinDiag(flow, 'success', { code: inviteCode, source: joinSource + '-local-fallback', role: state.online && state.online.role, turn: state.turn, message: state.message });
  return { ok: true, code: inviteCode, local: true };
}

function tttStopOnlineSync() {
  const state = tttGetState();
  if (state.onlineSyncTimer) {
    clearInterval(state.onlineSyncTimer);
    state.onlineSyncTimer = null;
  }
}

async function tttSyncOnlineSession(force) {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  const code = state.online.code;
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadGameSessionByInviteCode === 'function') {
    try {
      const remote = await window.RotationSupabaseBridge.loadGameSessionByInviteCode(code);
      if (remote && remote.ok === false && (remote.expired || remote.reason === 'expired-invite')) {
        state.online.status = 'expired';
        state.online.connected = false;
        state.message = tttInviteResultMessage(remote, 'Tahle pozvánka už vypršela. Vytvoř novou.');
        tttSetOnlineStatus(state.message, 'error');
        tttStopOnlineSync();
        tttRender();
        scheduleTttLayout();
        return;
      }
      if (remote && remote.ok && !remote.session && remote.invite && String(remote.invite.status || '').toLowerCase() === 'accepted') {
        state.online.status = 'active';
        if (remote.invite && remote.invite.invitee_account_number) state.online.playerOAccountNumber = remote.invite.invitee_account_number;
        if (remote.invite && remote.invite.inviter_account_number) state.online.playerXAccountNumber = remote.invite.inviter_account_number;
        tttEnsureOnlineRoleFromAccounts(state, {}, { invite: remote.invite }, 'sync-accepted-invite');
        state.online.headToHeadText = tttBuildOnlineScoreText();
        void tttRefreshOnlineHeadToHead(true);
        state.message = String(state.online.role || '').toUpperCase() === 'X' ? 'Jsi X. Hraješ.' : 'Čekáš na tah hráče X.';
        tttSetOnlineStatus(state.message, 'active');
        tttRender();
        scheduleTttLayout();
      }
      if (remote && remote.ok && remote.session) {
        const session = remote.session;
        const boardState = session.board_state && typeof session.board_state === 'object' ? session.board_state : {};
        const remoteRevision = Number(boardState.revision || 0) || 0;
        const remoteStamp = Number(boardState.updatedAtTs || session.updated_at_ts || new Date(session.updated_at || 0).getTime() || 0) || 0;
        const localRevision = Number(state.online.revision || 0) || 0;
        const localStamp = Number(state.online.lastUpdatedAt || 0) || 0;
        const shouldAdopt = force || remoteRevision > localRevision || (remoteRevision === localRevision && remoteStamp > localStamp) || (!state.board.some(Boolean) && Array.isArray(boardState.board) && boardState.board.some(Boolean));
        if (shouldAdopt) {
          state.online.lastRemoteUpdatedAt = remoteStamp;
          tttApplyOnlineState(Object.assign({}, boardState, {
            revision: remoteRevision,
            updatedAtTs: remoteStamp,
            status: session.status || boardState.status || 'active',
            playerXAccountNumber: session.player_x_account_number || boardState.playerXAccountNumber || null,
            playerOAccountNumber: session.player_o_account_number || boardState.playerOAccountNumber || null
          }), {
            code,
            inviteId: remote.invite && remote.invite.id ? remote.invite.id : state.online.inviteId,
            sessionId: session.id || state.online.sessionId || null,
            role: state.online.role || '',
            status: session.status || boardState.status || 'active'
          });
          const ownRole = String(state.online.role || '').toUpperCase();
          if (!state.gameOver && ownRole) {
            state.message = state.turn === ownRole ? ('Jsi ' + ownRole + '. Hraješ.') : ('Čekáš na tah hráče ' + state.turn + '.');
            tttSetOnlineStatus(state.message, state.online.status || 'active');
          }
          if (state.online && state.online.playerOAccountNumber) {
            state.online.status = state.gameOver ? 'finished' : 'active';
            state.online.headToHeadText = tttBuildOnlineScoreText();
            void tttRefreshOnlineHeadToHead(false);
          }
          tttRender();
          scheduleTttLayout();
          if (state.gameOver) {
            tttMaybeRecordOnlineResult(state.winner || boardState.winner || 'draw');
          }
        }
        if (state.online.dirty && Number(state.online.pendingRevision || 0) > remoteRevision) {
          await tttPushOnlineSession({ status: state.gameOver ? 'finished' : (state.online.status || 'active') });
        }
      }
    } catch (err) {
      console.warn('TTT online sync failed', err);
      state.online.connected = false;
    }
  }
}

function tttStartOnlineSyncLoop() {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  tttBindOnlineLifecycle();
  if (state.onlineSyncTimer) return;
  state.onlineSyncTimer = setInterval(() => { void tttSyncOnlineSession(false); }, TTT_ONLINE_POLL_MS);
}

function tttBindOnlineLifecycle() {
  if (window.__tttOnlineLifecycleBound) return;
  window.__tttOnlineLifecycleBound = true;
  window.addEventListener('online', () => {
    const state = tttGetState();
    if (!state.online || !state.online.code) return;
    state.online.connected = true;
    void tttSyncOnlineSession(true);
    if (state.online.dirty) {
      setTimeout(() => { void tttPushOnlineSession({ status: state.gameOver ? 'finished' : (state.online.status || 'active') }); }, 220);
    }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const state = tttGetState();
    if (!state.online || !state.online.code) return;
    void tttSyncOnlineSession(true);
    if (state.online.dirty) {
      setTimeout(() => { void tttPushOnlineSession({ status: state.gameOver ? 'finished' : (state.online.status || 'active') }); }, 180);
    }
  });
}

async function tttPushOnlineSession(extraPatch) {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  const nextRevision = Math.max(Number(state.online.revision || 0) || 0, Number(state.online.pendingRevision || 0) || 0) + 1;
  const payload = tttMakeOnlineStatePatch(Object.assign({}, extraPatch, {
    revision: nextRevision,
    status: (extraPatch && extraPatch.status) || (state.gameOver ? 'finished' : (state.online.status === 'waiting' ? 'waiting' : 'active'))
  }));
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveGameSessionByInviteCode === 'function') {
    try {
      const result = await window.RotationSupabaseBridge.saveGameSessionByInviteCode(state.online.code, payload);
      if (result && result.ok) {
        state.online.lastUpdatedAt = payload.updatedAtTs || Date.now();
        state.online.revision = nextRevision;
        state.online.pendingRevision = nextRevision;
        state.online.dirty = false;
        state.online.connected = true;
        state.online.status = result.status || payload.status || state.online.status || 'active';
        if (payload.status === 'finished' || payload.gameOver) {
          state.online.lastPushedResultKey = tttBuildOnlineResultKey(state.online.code, nextRevision, payload.winner || state.winner || 'draw', state.online.role || '', state.online.sessionId || '');
          void tttRecordOnlineSessionResult(false);
        }
      }
      return result;
    } catch (err) {
      console.warn('TTT online save failed', err);
      state.online.connected = false;
    }
  }
  return { ok: true, queued: true, local: true };
}

function tttIndex(row, col) {
  return row * TTT_COLS + col;
}

function tttInBounds(row, col) {
  return row >= 0 && col >= 0 && row < TTT_ROWS && col < TTT_COLS;
}

function tttWinner(board) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const mark = board[tttIndex(row, col)];
      if (!mark) continue;
      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        const line = [tttIndex(row, col)];
        let r = row + dr;
        let c = col + dc;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          line.push(tttIndex(r, c));
          if (line.length >= TTT_WIN_LENGTH) {
            return { winner: mark, line: line.slice(0, TTT_WIN_LENGTH) };
          }
          r += dr;
          c += dc;
        }
      }
    }
  }

  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return { winner: null, line: [] };
}

function tttCollectRun(board, row, col, dr, dc, mark) {
  let length = 0;
  let endRow = row;
  let endCol = col;

  let r = row;
  let c = col;
  while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
    length += 1;
    endRow = r;
    endCol = c;
    r += dr;
    c += dc;
  }

  let openEnds = 0;
  const beforeRow = row - dr;
  const beforeCol = col - dc;
  const afterRow = endRow + dr;
  const afterCol = endCol + dc;
  if (tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)]) openEnds += 1;
  if (tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)]) openEnds += 1;

  return { length, openEnds };
}

function tttPatternScore(length, openEnds) {
  if (length >= 5) return 1000000;
  if (length === 4 && openEnds === 2) return 120000;
  if (length === 4 && openEnds === 1) return 28000;
  if (length === 3 && openEnds === 2) return 7000;
  if (length === 3 && openEnds === 1) return 1800;
  if (length === 2 && openEnds === 2) return 500;
  if (length === 2 && openEnds === 1) return 120;
  if (length === 1 && openEnds === 2) return 25;
  return 0;
}

function tttScoreRuns(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  let score = 0;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      if (board[tttIndex(row, col)] !== mark) continue;
      score += 10 - (Math.abs(row - centerRow) * 0.6 + Math.abs(col - centerCol) * 0.35);
      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;
        const run = tttCollectRun(board, row, col, dr, dc, mark);
        score += tttPatternScore(run.length, run.openEnds);
      }
    }
  }
  return score;
}

function tttEvaluateBoard(board) {
  return tttScoreRuns(board, 'O') - tttScoreRuns(board, 'X');
}

function tttWinningMove(board, mark) {
  for (let i = 0; i < TTT_TOTAL_CELLS; i += 1) {
    if (board[i]) continue;
    board[i] = mark;
    const result = tttWinner(board).winner;
    board[i] = '';
    if (result === mark) return i;
  }
  return -1;
}

function tttWinningMoves(board, mark) {
  const moves = [];
  for (let i = 0; i < TTT_TOTAL_CELLS; i += 1) {
    if (board[i]) continue;
    board[i] = mark;
    const result = tttWinner(board).winner;
    board[i] = '';
    if (result === mark) moves.push(i);
  }
  return moves;
}

function tttCriticalThreatMoves(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  const moves = new Set();

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const idx = tttIndex(row, col);
      if (board[idx] !== mark) continue;

      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        let length = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          length += 1;
          r += dr;
          c += dc;
        }

        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const beforeOpen = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
        const afterOpen = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];

        if (length >= 3 && (beforeOpen || afterOpen)) {
          if (beforeOpen) moves.add(tttIndex(beforeRow, beforeCol));
          if (afterOpen) moves.add(tttIndex(afterRow, afterCol));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttOpenThreeThreatMoves(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  const moves = new Set();

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const idx = tttIndex(row, col);
      if (board[idx] !== mark) continue;

      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        let length = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          length += 1;
          r += dr;
          c += dc;
        }

        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const beforeOpen = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
        const afterOpen = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];

        if (length === 3 && beforeOpen && afterOpen) {
          moves.add(tttIndex(beforeRow, beforeCol));
          moves.add(tttIndex(afterRow, afterCol));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttOpenTwoThreatMoves(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  const moves = new Set();

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const idx = tttIndex(row, col);
      if (board[idx] !== mark) continue;

      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        let length = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          length += 1;
          r += dr;
          c += dc;
        }

        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const beforeOpen = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
        const afterOpen = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];

        if (length === 2 && beforeOpen && afterOpen) {
          moves.add(tttIndex(beforeRow, beforeCol));
          moves.add(tttIndex(afterRow, afterCol));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttThreatWindowMoves(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const moves = new Set();
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        const cells = [];
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { ok = false; break; }
          cells.push(tttIndex(r, c));
        }
        if (!ok) continue;

        let markCount = 0;
        let emptyCount = 0;
        const empties = [];
        for (const idx of cells) {
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) markCount += 1;
          else if (!cell) { emptyCount += 1; empties.push(idx); }
          else { ok = false; break; }
        }
        if (!ok) continue;
        if (markCount >= 3 && emptyCount >= 1) {
          empties.forEach(idx => moves.add(idx));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttCandidateMoves(board, radius = 2) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) occupied.push(i);
  }

  if (!occupied.length) {
    return [tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2))];
  }

  const candidates = new Set();
  for (const idx of occupied) {
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    for (let dr = -radius; dr <= radius; dr += 1) {
      for (let dc = -radius; dc <= radius; dc += 1) {
        const nr = row + dr;
        const nc = col + dc;
        if (!tttInBounds(nr, nc)) continue;
        const next = tttIndex(nr, nc);
        if (!board[next]) candidates.add(next);
      }
    }
  }

  return Array.from(candidates);
}


function tttOpponentForkRisk(board, mark, limit = 12) {
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const replies = tttCandidateMoves(board, 2)
    .filter(idx => !board[idx])
    .sort((a, b) => {
      const ar = Math.floor(a / TTT_COLS);
      const ac = a % TTT_COLS;
      const br = Math.floor(b / TTT_COLS);
      const bc = b % TTT_COLS;
      return (Math.abs(ar - centerRow) + Math.abs(ac - centerCol)) - (Math.abs(br - centerRow) + Math.abs(bc - centerCol));
    })
    .slice(0, limit);
  let risk = 0;
  for (const idx of replies) {
    if (board[idx]) continue;
    board[idx] = mark;
    const winCount = tttWinningMoves(board, mark).length;
    const critical = tttCriticalThreatMoves(board, mark).length;
    const windows = tttThreatWindowMoves(board, mark).length;
    const openThree = tttOpenThreeThreatMoves(board, mark).length;
    board[idx] = '';
    if (winCount >= 2 || critical >= 2 || windows >= 2 || openThree >= 2) {
      risk += 1;
    } else if (winCount >= 1 && (critical >= 1 || windows >= 1 || openThree >= 1)) {
      risk += 0.5;
    }
    if (risk >= 3) break;
  }
  return risk;
}

function tttMoveHeuristic(board, index, mark) {
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = 0;

  board[index] = mark;
  const result = tttWinner(board).winner;
  if (result === mark) {
    board[index] = '';
    return 10000000;
  }

  const opponent = mark === 'O' ? 'X' : 'O';
  const opponentWins = tttWinningMoves(board, opponent).length;
  const opponentThreats = tttThreatWindowMoves(board, opponent).length;
  if (opponentWins >= 3) score -= 850000;
  else if (opponentWins >= 2) score -= 500000;
  else if (opponentWins === 1) score -= 280000;
  if (opponentThreats >= 3) score -= 380000;
  else if (opponentThreats === 2) score -= 190000;
  else if (opponentThreats === 1) score -= 110000;
  board[index] = opponent;
  if (tttWinner(board).winner === opponent) score += 900000;
  board[index] = mark;

  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const forkRisk = occupied >= 5 ? tttOpponentForkRisk(board, opponent, 8) : 0;
  if (forkRisk >= 2) score -= 650000;
  else if (forkRisk >= 1) score -= 320000;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    let same = 1;
    let openEnds = 0;

    let r = row + dr;
    let c = col + dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
      same += 1;
      r += dr;
      c += dc;
    }
    if (tttInBounds(r, c) && !board[tttIndex(r, c)]) openEnds += 1;

    r = row - dr;
    c = col - dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
      same += 1;
      r -= dr;
      c -= dc;
    }
    if (tttInBounds(r, c) && !board[tttIndex(r, c)]) openEnds += 1;

    score += tttPatternScore(same, openEnds) * 1.1;
  }

  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  score += Math.max(0, 24 - distance * 1.1);

  let adjacency = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!tttInBounds(nr, nc)) continue;
      const cell = board[tttIndex(nr, nc)];
      if (cell === mark) adjacency += 18;
      else if (cell === opponent) adjacency += 8;
    }
  }
  score += adjacency;

  board[index] = '';
  return score;
}

function tttOrderedCandidates(board, mark, limit = 12) {
  const candidates = tttCandidateMoves(board, 3);
  if (!candidates.length) {
    return [tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2))];
  }
  const scored = candidates.map((idx) => ({
    idx,
    score: tttMoveHeuristic(board, idx, mark)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(item => item.idx);
}


function tttSearch(board, depth, alpha, beta, maximizing, memo, deadline) {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (deadline && now >= deadline) {
    return tttEvaluateBoard(board);
  }
  const result = tttWinner(board).winner;
  if (result === 'O') return 10000000 + depth * 1000;
  if (result === 'X') return -10000000 - depth * 1000;
  if (result === 'draw') return 0;

  const key = board.join('') + '|' + depth + '|' + (maximizing ? 'O' : 'X');
  if (memo && Object.prototype.hasOwnProperty.call(memo, key)) return memo[key];
  if (depth <= 0) {
    const leaf = tttEvaluateBoard(board);
    if (memo) memo[key] = leaf;
    return leaf;
  }

  const mark = maximizing ? 'O' : 'X';
  let moves = tttOrderedCandidates(board, mark, maximizing ? 7 : 6);
  if (!moves.length) moves = tttCandidateMoves(board, 3);
  if (!moves.length) {
    const leaf = tttEvaluateBoard(board);
    if (memo) memo[key] = leaf;
    return leaf;
  }

  moves.sort((a, b) => tttMoveHeuristic(board, b, mark) - tttMoveHeuristic(board, a, mark));

  let best = maximizing ? -Infinity : Infinity;
  for (const idx of moves) {
    if (deadline && typeof performance !== 'undefined' && performance.now() > deadline) break;
    if (board[idx]) continue;
    board[idx] = mark;
    const score = tttSearch(board, depth - 1, alpha, beta, !maximizing, memo, deadline);
    board[idx] = '';
    if (maximizing) {
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    } else {
      if (score < best) best = score;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
  }

  if (memo) memo[key] = best;
  return best;
}


function tttForkMove(board, mark) {
  let fallback = -1;
  for (let i = 0; i < TTT_TOTAL_CELLS; i += 1) {
    if (board[i]) continue;
    board[i] = mark;
    const winNow = tttWinner(board).winner === mark;
    const forkCount = tttWinningMoves(board, mark).length;
    board[i] = '';
    if (winNow) return i;
    if (forkCount >= 2) return i;
    if (fallback < 0 && forkCount === 1) fallback = i;
  }
  return fallback;
}

function tttOpeningBookMove(board) {
  const centerRow = Math.floor(TTT_ROWS / 2);
  const centerCol = Math.floor(TTT_COLS / 2);
  const center = tttIndex(centerRow, centerCol);
  if (!board[center]) return center;

  const ring = [
    [centerRow - 1, centerCol],
    [centerRow + 1, centerCol],
    [centerRow, centerCol - 1],
    [centerRow, centerCol + 1],
    [centerRow - 1, centerCol - 1],
    [centerRow - 1, centerCol + 1],
    [centerRow + 1, centerCol - 1],
    [centerRow + 1, centerCol + 1]
  ];
  for (const [r, c] of ring) {
    if (!tttInBounds(r, c)) continue;
    const idx = tttIndex(r, c);
    if (!board[idx]) return idx;
  }

  const candidates = tttCandidateMoves(board, 1);
  return candidates[0] ?? center;
}



function tttEmergencyBlockMoves(board, mark) {
  const moves = [];
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      if (board[tttIndex(row, col)] !== mark) continue;
      for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;
        let len = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          len += 1;
          r += dr;
          c += dc;
        }
        if (len < 3) continue;
        const beforeOpen = tttInBounds(prevRow, prevCol) && !board[tttIndex(prevRow, prevCol)];
        const afterOpen = tttInBounds(r, c) && !board[tttIndex(r, c)];
        if (beforeOpen) moves.push(tttIndex(prevRow, prevCol));
        if (afterOpen) moves.push(tttIndex(r, c));
      }
    }
  }
  return Array.from(new Set(moves));
}

function tttFastAiMoveScore(board, index, mark, deadline) {
  if (board[index]) return -Infinity;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (deadline && now > deadline) return -999999;

  const opponent = mark === 'O' ? 'X' : 'O';
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = 0;

  board[index] = mark;
  if (tttWinner(board).winner === mark) {
    board[index] = '';
    return 10000000;
  }

  const opponentImmediate = tttWinningMove(board, opponent);
  if (opponentImmediate >= 0) score -= 850000;

  score += tttScoreRuns(board, mark) * 1.2;
  score -= tttScoreRuns(board, opponent) * 1.35;

  let ownAdj = 0;
  let oppAdj = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!tttInBounds(nr, nc)) continue;
      const cell = board[tttIndex(nr, nc)];
      if (cell === mark) ownAdj += 1;
      else if (cell === opponent) oppAdj += 1;
    }
  }

  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  score += Math.max(0, 130 - distance * 11);
  score += ownAdj * 46;
  score += oppAdj * 28;

  board[index] = '';
  return score;
}

function tttSimpleMoveScore(board, index, mark) {
  if (board[index]) return -Infinity;
  const opponent = mark === 'O' ? 'X' : 'O';
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = 0;

  board[index] = mark;
  if (tttWinner(board).winner === mark) {
    board[index] = '';
    return 10000000;
  }
  const oppWin = tttWinningMoves(board, opponent).length;
  if (oppWin > 0) score -= 900000 * oppWin;
  score += tttScoreRuns(board, mark) * 1.35;
  score -= tttScoreRuns(board, opponent) * 1.08;

  let ownAdj = 0;
  let oppAdj = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!tttInBounds(nr, nc)) continue;
      const cell = board[tttIndex(nr, nc)];
      if (cell === mark) ownAdj += 1;
      else if (cell === opponent) oppAdj += 1;
    }
  }
  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  score += Math.max(0, 120 - distance * 9);
  score += ownAdj * 38;
  score += oppAdj * 20;
  board[index] = '';
  return score;
}

function tttPickBestIndexedMove(board, moves, mark) {
  const unique = Array.from(new Set((Array.isArray(moves) ? moves : []).filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)]).map(Number)));
  if (!unique.length) return -1;
  unique.sort((a, b) => tttSimpleMoveScore(board, b, mark) - tttSimpleMoveScore(board, a, mark));
  return unique[0];
}

function tttPickBestBlockMove(board, moves, opponentMark) {
  const unique = Array.from(new Set((Array.isArray(moves) ? moves : []).filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)]).map(Number)));
  if (!unique.length) return -1;
  const defender = opponentMark === 'X' ? 'O' : 'X';
  unique.sort((a, b) => {
    const dangerDiff = tttSimpleMoveScore(board, b, opponentMark) - tttSimpleMoveScore(board, a, opponentMark);
    if (Math.abs(dangerDiff) > 1) return dangerDiff;
    return tttSimpleMoveScore(board, b, defender) - tttSimpleMoveScore(board, a, defender);
  });
  return unique[0];
}

function tttMoveCreatesFork(board, index, mark) {
  if (board[index]) return 0;
  board[index] = mark;
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  board[index] = '';
  let score = 0;
  if (wins >= 2) score += 6;
  else if (wins === 1) score += 3;
  if (critical >= 2) score += 4;
  else if (critical === 1) score += 2;
  if (windows >= 2) score += 3;
  else if (windows === 1) score += 1;
  if (openThree >= 2) score += 3;
  else if (openThree === 1) score += 1;
  return score;
}

function tttBestForkMove(board, mark) {
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const candidates = tttCandidateMoves(board, 2)
    .filter(idx => !board[idx])
    .sort((a, b) => {
      const ar = Math.floor(a / TTT_COLS);
      const ac = a % TTT_COLS;
      const br = Math.floor(b / TTT_COLS);
      const bc = b % TTT_COLS;
      return (Math.abs(ar - centerRow) + Math.abs(ac - centerCol)) - (Math.abs(br - centerRow) + Math.abs(bc - centerCol));
    })
    .slice(0, 12);
  let bestIdx = -1;
  let bestScore = 0;
  for (const idx of candidates) {
    const forkScore = tttMoveCreatesFork(board, idx, mark);
    if (forkScore <= 0) continue;
    const total = forkScore * 100000 + tttSimpleMoveScore(board, idx, mark);
    if (total > bestScore) {
      bestScore = total;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

function tttHardMoveSearchScore(board, index, deadline) {
  if (board[index]) return -Infinity;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (deadline && now > deadline) return -999999;

  const base = tttSimpleMoveScore(board, index, 'O');
  const fast = tttFastAiMoveScore(board, index, 'O', deadline);
  let score = base * 1.12 + fast * 0.88;

  board[index] = 'O';
  const ownWins = tttV958WinningMovesFast(board, 'O').length;
  const ownThreats = tttCriticalThreatMoves(board, 'O').length + tttThreatWindowMoves(board, 'O').length;
  const xWins = tttWinningMoves(board, 'X').length;
  const xThreats = tttCriticalThreatMoves(board, 'X').length + tttThreatWindowMoves(board, 'X').length;
  const xDanger = tttBoardDangerScore(board, 'X');
  const ownDanger = tttBoardDangerScore(board, 'O');
  const xTacticalPressure = typeof tttTacticalPressureScore === 'function' ? tttTacticalPressureScore(board, 'X') : xDanger;
  const ownTacticalPressure = typeof tttTacticalPressureScore === 'function' ? tttTacticalPressureScore(board, 'O') : ownDanger;
  score += ownWins * 620000;
  score += ownThreats * 125000;
  score += ownDanger * 0.28;
  score += ownTacticalPressure * 0.16;
  score -= xWins * 3200000;
  score -= xThreats * 260000;
  score -= xDanger * 0.86;
  score -= xTacticalPressure * 0.42;

  const searchDepth = typeof tttHardSearchDepth === 'function' ? tttHardSearchDepth(board) : 2;
  if (!deadline || (typeof performance === 'undefined') || performance.now() < deadline - 12) {
    const lookahead = tttSearch(board, searchDepth, -Infinity, Infinity, false, {}, deadline);
    if (Number.isFinite(lookahead)) score += lookahead * 0.42;
  }
  board[index] = '';

  return score;
}


function tttCheapMovePotential(board, index, mark) {
  if (board[index]) return -Infinity;
  const opponent = mark === 'O' ? 'X' : 'O';
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = Math.max(0, 120 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 8);
  for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
    let own = 1;
    let opp = 0;
    let open = 0;
    for (const dir of [-1, 1]) {
      for (let step = 1; step < TTT_WIN_LENGTH; step += 1) {
        const r = row + dr * step * dir;
        const c = col + dc * step * dir;
        if (!tttInBounds(r, c)) break;
        const cell = board[tttIndex(r, c)];
        if (cell === mark) own += 1;
        else if (!cell) { open += 1; break; }
        else { opp += 1; break; }
      }
    }
    if (opp >= 2) continue;
    if (own >= 5) score += 5000000;
    else if (own === 4 && open) score += 720000;
    else if (own === 3 && open) score += 85000;
    else if (own === 2 && open) score += 8500;
    if (!opp) score += open * 320;
  }
  const opponentPotential = (() => {
    board[index] = opponent;
    let danger = 0;
    for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
      let same = 1;
      let open = 0;
      for (const dir of [-1, 1]) {
        for (let step = 1; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step * dir;
          const c = col + dc * step * dir;
          if (!tttInBounds(r, c)) break;
          const cell = board[tttIndex(r, c)];
          if (cell === opponent) same += 1;
          else if (!cell) { open += 1; break; }
          else break;
        }
      }
      if (same >= 5) danger += 5000000;
      else if (same === 4 && open) danger += 760000;
      else if (same === 3 && open) danger += 90000;
      else if (same === 2 && open) danger += 9000;
    }
    board[index] = '';
    return danger;
  })();
  return score + opponentPotential * 0.34;
}

function tttBoardDangerScore(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  let score = 0;
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        let marks = 0;
        let empties = 0;
        let blocked = false;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { blocked = true; break; }
          const cell = board[tttIndex(r, c)];
          if (cell === opponent) { blocked = true; break; }
          if (cell === mark) marks += 1;
          else empties += 1;
        }
        if (blocked || !marks) continue;
        if (marks >= 5) score += 50000000;
        else if (marks === 4 && empties >= 1) score += 9000000;
        else if (marks === 3 && empties >= 2) score += 260000;
        else if (marks === 2 && empties >= 3) score += 9000;
        else if (marks === 1 && empties >= 4) score += 180;
      }
    }
  }
  return score;
}

function tttBestDangerReductionMove(board, dangerMark) {
  const defender = dangerMark === 'X' ? 'O' : 'X';
  const currentDanger = tttBoardDangerScore(board, dangerMark);
  if (currentDanger < 9000) return -1;
  let candidates = Array.from(new Set(tttCandidateMoves(board, currentDanger > 600000 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, defender) + tttCheapMovePotential(board, idx, dangerMark) * 0.9 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, currentDanger > 600000 ? 24 : 18)
    .map(item => item.idx);
  let bestIdx = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    board[idx] = defender;
    const nextDanger = tttBoardDangerScore(board, dangerMark);
    const ownDanger = tttBoardDangerScore(board, defender);
    board[idx] = '';
    const score = -nextDanger * 1.38 + ownDanger * 0.58 + tttCheapMovePotential(board, idx, defender) * 0.8;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

function tttBestAntiForkMove(board) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 4) return -1;
  let candidates = Array.from(new Set(tttCandidateMoves(board, 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'O') + tttCheapMovePotential(board, idx, 'X') * 0.42 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(item => item.idx);
  if (!candidates.length) return -1;
  let bestIdx = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    board[idx] = 'O';
    let xReplies = Array.from(new Set(tttCandidateMoves(board, 2))).filter(reply => !board[reply]);
    xReplies = xReplies
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, 'X') }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.reply);
    let worstReplyDanger = 0;
    for (const reply of xReplies) {
      board[reply] = 'X';
      const danger = tttBoardDangerScore(board, 'X');
      board[reply] = '';
      if (danger > worstReplyDanger) worstReplyDanger = danger;
    }
    const ownDanger = tttBoardDangerScore(board, 'O');
    board[idx] = '';
    const score = ownDanger * 0.72 - worstReplyDanger * 1.15 + tttCheapMovePotential(board, idx, 'O') * 0.35;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}


function tttLineVectorScore(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  let score = 0;

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        for (const size of [TTT_WIN_LENGTH, TTT_WIN_LENGTH + 1]) {
          const cells = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const r = row + dr * step;
            const c = col + dc * step;
            if (!tttInBounds(r, c)) { ok = false; break; }
            cells.push(tttIndex(r, c));
          }
          if (!ok) continue;

          let marks = 0;
          let empties = 0;
          let blocked = false;
          for (const idx of cells) {
            const cell = board[idx];
            if (cell === opponent) { blocked = true; break; }
            if (cell === mark) marks += 1;
            else if (!cell) empties += 1;
          }
          if (blocked || !marks || !empties) continue;

          const beforeRow = row - dr;
          const beforeCol = col - dc;
          const afterRow = row + dr * size;
          const afterCol = col + dc * size;
          const openBefore = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
          const openAfter = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];
          const openBonus = (openBefore ? 1 : 0) + (openAfter ? 1 : 0);
          const sizeBonus = size > TTT_WIN_LENGTH ? 1.34 : 1;

          if (marks >= 5) score += 90000000 * sizeBonus;
          else if (marks === 4) score += (empties === 1 ? 22000000 : 7600000) * sizeBonus + openBonus * 1800000;
          else if (marks === 3) score += (empties <= 2 ? 1150000 : 420000) * sizeBonus + openBonus * 260000;
          else if (marks === 2) score += 72000 * sizeBonus + openBonus * 18000;
          else score += 2400 * sizeBonus;
        }
      }
    }
  }
  return score;
}

function tttTacticalPressureScore(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThrees = tttOpenThreeThreatMoves(board, mark).length;
  const openTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, mark).length : 0;
  const forks = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const danger = tttBoardDangerScore(board, mark);
  const vector = tttLineVectorScore(board, mark);
  return wins * 9000000 + critical * 1450000 + windows * 520000 + openThrees * 360000 + openTwos * 42000 + forks * 650000 + danger + vector * 0.62;
}

function tttBestLineContainmentMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 6) return -1;

  const currentVector = tttLineVectorScore(board, 'X');
  const currentPressure = tttTacticalPressureScore(board, 'X');
  if (currentVector < 90000 && currentPressure < 180000 && occupied < 10) return -1;

  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 28 ? 3 : 2),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X')
  ]);

  let candidates = Array.from(rawCandidates).filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)]).map(Number);
  candidates = candidates
    .map(idx => ({
      idx,
      score: tttCheapMovePotential(board, idx, 'X') * 1.2
        + tttCheapMovePotential(board, idx, 'O') * 0.94
        + (() => { board[idx] = 'O'; const reduced = currentVector - tttLineVectorScore(board, 'X'); board[idx] = ''; return reduced; })() * 0.75
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 18 ? 34 : (occupied < 34 ? 28 : 22))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 26 && bestIdx >= 0) break;

    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const xImmediateAfter = tttWinningMoves(board, 'X').length;
    const nextVector = tttLineVectorScore(board, 'X');
    const nextPressure = tttTacticalPressureScore(board, 'X');
    const ownVector = tttLineVectorScore(board, 'O');
    const ownPressure = tttTacticalPressureScore(board, 'O');

    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 26 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyScore = tttLineVectorScore(board, 'X') * 0.00012
          + tttTacticalPressureScore(board, 'X') * 0.00008
          + tttCheapMovePotential(board, reply, 'X')
          + (tttWinner(board).winner === 'X' ? 5000000 : 0)
          + tttWinningMoves(board, 'X').length * 800000;
        board[reply] = '';
        return { reply, score: replyScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 20 ? 18 : 12)
      .map(item => item.reply);

    let worstRisk = xImmediateAfter * 52000000 + nextVector * 1.25 + nextPressure * 0.68;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xOpenTwos = tttOpenTwoThreatMoves(board, 'X').length;
      const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const replyVector = tttLineVectorScore(board, 'X');
      const replyPressure = tttTacticalPressureScore(board, 'X');
      const oCounterWins = tttWinningMoves(board, 'O').length;
      const oCounterPressure = tttTacticalPressureScore(board, 'O');
      board[reply] = '';

      const replyRisk = replyWinner * 180000000
        + xWins * 52000000
        + xCritical * 9200000
        + xWindows * 4200000
        + xOpenThrees * 2400000
        + xOpenTwos * 130000
        + xFork * 3600000
        + replyVector * 1.34
        + replyPressure * 0.72
        - oCounterWins * 24000000
        - oCounterPressure * 0.2;
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const reduction = currentVector - nextVector;
    const candidateScore = ownWinNow * 260000000
      + reduction * 2.15
      + (currentPressure - nextPressure) * 1.08
      + ownVector * 0.92
      + ownPressure * 0.46
      + tttCheapMovePotential(board, idx, 'O') * 1.05
      + tttCheapMovePotential(board, idx, 'X') * 0.82
      - worstRisk * 1.28;

    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 9 || currentVector > 180000 || currentPressure > 420000 || bestWorstRisk < 1800000) return bestIdx;
  return -1;
}

function tttBestLookaheadSafeMove(board, defender, attacker) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const currentRisk = tttTacticalPressureScore(board, attacker);
  if (currentRisk < 8500) return -1;

  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const radius = currentRisk > 500000 ? 3 : 2;
  let candidates = Array.from(new Set(tttCandidateMoves(board, radius))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, defender) * 0.9
          + tttCheapMovePotential(board, idx, attacker) * 0.72
          + Math.max(0, 80 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 6)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, currentRisk > 500000 ? 28 : 22)
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    board[idx] = defender;
    const immediateLosses = tttWinningMoves(board, attacker).length;
    const nextRisk = tttTacticalPressureScore(board, attacker);
    const ownPressure = tttTacticalPressureScore(board, defender);

    let worstReplyRisk = 0;
    let replies = Array.from(new Set(tttCandidateMoves(board, 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, attacker) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.reply);
    for (const reply of replies) {
      board[reply] = attacker;
      const replyRisk = tttTacticalPressureScore(board, attacker) - tttTacticalPressureScore(board, defender) * 0.22;
      board[reply] = '';
      if (replyRisk > worstReplyRisk) worstReplyRisk = replyRisk;
    }

    board[idx] = '';
    const score = ownPressure * 0.82 - nextRisk * 1.64 - worstReplyRisk * 0.88 - immediateLosses * 12000000 + tttCheapMovePotential(board, idx, defender) * 0.42;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  return bestIdx;
}


function tttBestDeepSafetyMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 6) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let candidates = Array.from(new Set(tttCandidateMoves(board, occupied < 18 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 0.95
          + tttCheapMovePotential(board, idx, 'X') * 0.86
          + Math.max(0, 90 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 20 ? 28 : 20)
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 18 && bestIdx >= 0) break;
    board[idx] = 'O';
    const immediateLosses = tttWinningMoves(board, 'X').length;
    const ownPressure = tttTacticalPressureScore(board, 'O');
    let replies = Array.from(new Set(tttCandidateMoves(board, 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, 'X') + tttTacticalPressureScore((() => { board[reply] = 'X'; const snap = board.slice(); board[reply] = ''; return snap; })(), 'X') * 0.00008 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 12 : 9)
      .map(item => item.reply);

    let worstRisk = immediateLosses * 24000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xPressure = tttTacticalPressureScore(board, 'X');
      const oCounter = tttTacticalPressureScore(board, 'O');
      board[reply] = '';
      const risk = replyWinner * 50000000
        + xWins * 15000000
        + xCritical * 2400000
        + xWindows * 1200000
        + xOpenThrees * 700000
        + xPressure * 0.72
        - oCounter * 0.18;
      if (risk > worstRisk) worstRisk = risk;
    }

    const candidateScore = ownPressure * 0.74 + tttCheapMovePotential(board, idx, 'O') * 1.25 - worstRisk;
    board[idx] = '';
    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  const currentRisk = tttTacticalPressureScore(board, 'X');
  if (currentRisk > 120000 || bestWorstRisk < 1400000 || occupied >= 10) return bestIdx;
  return -1;
}



function tttBestHumanTrapBrakeMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 4) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const currentPressure = tttTacticalPressureScore(board, 'X');
  let candidates = Array.from(new Set(tttCandidateMoves(board, occupied < 22 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 1.18
          + tttCheapMovePotential(board, idx, 'X') * 1.28
          + Math.max(0, 110 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 40 : (occupied < 30 ? 32 : 22))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 24 && bestIdx >= 0) break;

    board[idx] = 'O';
    const directLosses = tttWinningMoves(board, 'X').length;
    const ownImmediateWins = tttWinningMoves(board, 'O').length;
    const ownFork = tttBestForkMove(board, 'O') >= 0 ? 1 : 0;
    const ownPressure = tttTacticalPressureScore(board, 'O');

    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 18 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyWins = tttWinningMoves(board, 'X').length;
        const replyPressure = tttTacticalPressureScore(board, 'X');
        const replyFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
        board[reply] = '';
        return {
          reply,
          score: tttCheapMovePotential(board, reply, 'X') * 1.05
            + replyWins * 2400000
            + replyFork * 950000
            + replyPressure * 0.00012
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 18 : 12)
      .map(item => item.reply);

    let worstRisk = directLosses * 36000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xOpenTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, 'X').length : 0;
      const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const xPressure = tttTacticalPressureScore(board, 'X');
      const oWins = tttWinningMoves(board, 'O').length;
      const oPressure = tttTacticalPressureScore(board, 'O');
      board[reply] = '';

      const multiWinTrap = xWins >= 2 ? 1 : 0;
      const risk = replyWinner * 120000000
        + multiWinTrap * 86000000
        + xWins * 24000000
        + xCritical * 5200000
        + xWindows * 2400000
        + xOpenThrees * 1700000
        + xFork * 2600000
        + xOpenTwos * 62000
        + xPressure * 0.94
        - oWins * 18000000
        - oPressure * 0.24;
      if (risk > worstRisk) worstRisk = risk;
    }

    board[idx] = '';
    const candidateScore = ownImmediateWins * 32000000
      + ownFork * 4200000
      + ownPressure * 0.82
      + tttCheapMovePotential(board, idx, 'O') * 1.22
      + tttCheapMovePotential(board, idx, 'X') * 0.74
      - worstRisk * 1.38;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 7 || currentPressure > 26000 || bestWorstRisk < 1600000) return bestIdx;
  return -1;
}



function tttReplyLockdownRisk(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThrees = tttOpenThreeThreatMoves(board, mark).length;
  const openTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, mark).length : 0;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const pressure = tttTacticalPressureScore(board, mark);
  const vector = typeof tttLineVectorScore === 'function' ? tttLineVectorScore(board, mark) : 0;
  return wins * 125000000
    + critical * 8200000
    + windows * 4200000
    + openThrees * 2600000
    + fork * 3400000
    + openTwos * 120000
    + pressure
    + vector * 0.72;
}

function tttBestReplyLockdownMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 6) return -1;
  const currentRisk = tttReplyLockdownRisk(board, 'X');
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 24 ? 3 : 2),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O')
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 1.24
          + tttCheapMovePotential(board, idx, 'X') * 1.08
          + Math.max(0, 120 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 38 : (occupied < 32 ? 30 : 22))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;

  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 30 && bestIdx >= 0) break;

    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const ownRisk = tttReplyLockdownRisk(board, 'O');
    const xImmediate = tttWinningMoves(board, 'X').length;

    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 24 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyWin = tttWinner(board).winner === 'X' ? 1 : 0;
        const replyRisk = tttReplyLockdownRisk(board, 'X');
        board[reply] = '';
        return { reply, score: replyWin * 90000000 + replyRisk + tttCheapMovePotential(board, reply, 'X') * 1.08 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 18 : 12)
      .map(item => item.reply);

    let worstRisk = xImmediate * 150000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      let replyRisk = replyWinner * 180000000 + tttReplyLockdownRisk(board, 'X') - tttReplyLockdownRisk(board, 'O') * 0.18;

      const counterSet = new Set([
        ...tttWinningMoves(board, 'O'),
        ...tttWinningMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttCandidateMoves(board, 2)
      ]);
      let counters = Array.from(counterSet)
        .filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)])
        .map(Number)
        .map(counter => ({
          counter,
          score: tttCheapMovePotential(board, counter, 'O') * 1.18 + tttCheapMovePotential(board, counter, 'X') * 1.06
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(item => item.counter);

      let bestCounterRisk = replyRisk;
      for (const counter of counters) {
        board[counter] = 'O';
        const counterRisk = tttReplyLockdownRisk(board, 'X') - tttReplyLockdownRisk(board, 'O') * 0.32;
        board[counter] = '';
        if (counterRisk < bestCounterRisk) bestCounterRisk = counterRisk;
      }
      board[reply] = '';
      const combinedRisk = replyRisk * 0.46 + bestCounterRisk * 0.78;
      if (combinedRisk > worstRisk) worstRisk = combinedRisk;
    }

    board[idx] = '';
    const candidateScore = ownWinNow * 220000000
      + ownRisk * 0.72
      + tttCheapMovePotential(board, idx, 'O') * 1.32
      + tttCheapMovePotential(board, idx, 'X') * 0.82
      - worstRisk * 1.18;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 9 || currentRisk > 180000 || bestWorstRisk < 2600000) return bestIdx;
  return -1;
}


function tttBestHumanPressureLockMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const baseHumanRisk = tttReplyLockdownRisk(board, 'X') + tttLineVectorScore(board, 'X') * 0.52;
  const baseAiRisk = tttReplyLockdownRisk(board, 'O') + tttLineVectorScore(board, 'O') * 0.34;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const rawCandidates = new Set([
    ...tttWinningMoves(board, 'O'),
    ...tttWinningMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O'),
    ...tttCandidateMoves(board, occupied < 26 ? 3 : 2)
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      const centerBias = Math.max(0, 145 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5.4);
      board[idx] = 'O';
      const humanReduction = baseHumanRisk - (tttReplyLockdownRisk(board, 'X') + tttLineVectorScore(board, 'X') * 0.52);
      const aiGain = tttReplyLockdownRisk(board, 'O') - baseAiRisk;
      board[idx] = '';
      return {
        idx,
        score: humanReduction * 1.22
          + aiGain * 0.38
          + tttCheapMovePotential(board, idx, 'X') * 1.22
          + tttCheapMovePotential(board, idx, 'O') * 1.02
          + centerBias
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 42 : (occupied < 32 ? 34 : 24))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 32 && bestIdx >= 0) break;

    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const humanRiskAfterMove = tttReplyLockdownRisk(board, 'X') + tttLineVectorScore(board, 'X') * 0.58;
    const aiPressureAfterMove = tttReplyLockdownRisk(board, 'O') + tttLineVectorScore(board, 'O') * 0.44;
    const immediateHumanWins = tttWinningMoves(board, 'X').length;

    const replyPool = new Set([
      ...tttWinningMoves(board, 'X'),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X'),
      ...tttCandidateMoves(board, occupied < 26 ? 3 : 2)
    ]);
    let replies = Array.from(replyPool)
      .filter(reply => Number.isFinite(Number(reply)) && !board[Number(reply)])
      .map(Number)
      .map(reply => {
        board[reply] = 'X';
        const replyScore = (tttWinner(board).winner === 'X' ? 220000000 : 0)
          + tttWinningMoves(board, 'X').length * 52000000
          + tttReplyLockdownRisk(board, 'X')
          + tttLineVectorScore(board, 'X') * 0.86
          + tttCheapMovePotential(board, reply, 'X') * 1.08;
        board[reply] = '';
        return { reply, score: replyScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 20 : 14)
      .map(item => item.reply);

    let worstRisk = immediateHumanWins * 180000000 + humanRiskAfterMove;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const replyHumanWins = tttWinningMoves(board, 'X').length;
      const replyBaseRisk = replyWinner * 260000000
        + replyHumanWins * 76000000
        + tttReplyLockdownRisk(board, 'X')
        + tttLineVectorScore(board, 'X') * 0.92
        - tttReplyLockdownRisk(board, 'O') * 0.22;

      const counterPool = new Set([
        ...tttWinningMoves(board, 'O'),
        ...tttWinningMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttCandidateMoves(board, 2)
      ]);
      const counters = Array.from(counterPool)
        .filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)])
        .map(Number)
        .map(counter => ({
          counter,
          score: tttCheapMovePotential(board, counter, 'O') * 1.16
            + tttCheapMovePotential(board, counter, 'X') * 1.28
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.counter);

      let bestCounterRisk = replyBaseRisk;
      for (const counter of counters) {
        board[counter] = 'O';
        const counterRisk = (tttWinner(board).winner === 'O' ? -70000000 : 0)
          + tttWinningMoves(board, 'X').length * 42000000
          + tttReplyLockdownRisk(board, 'X')
          + tttLineVectorScore(board, 'X') * 0.82
          - tttReplyLockdownRisk(board, 'O') * 0.42;
        board[counter] = '';
        if (counterRisk < bestCounterRisk) bestCounterRisk = counterRisk;
      }
      board[reply] = '';
      const replyRisk = Math.max(replyBaseRisk * 0.62, bestCounterRisk * 0.96);
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const humanReduction = baseHumanRisk - humanRiskAfterMove;
    const candidateScore = ownWinNow * 320000000
      + humanReduction * 1.75
      + aiPressureAfterMove * 0.64
      + tttCheapMovePotential(board, idx, 'O') * 1.16
      + tttCheapMovePotential(board, idx, 'X') * 0.92
      - worstRisk * 1.34;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 8 || baseHumanRisk > 90000 || bestWorstRisk < Math.max(1800000, baseHumanRisk * 1.65)) return bestIdx;
  return -1;
}


function tttEarlyTrapRiskScore(board, mark) {
  const winner = tttWinner(board).winner === mark ? 1 : 0;
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThrees = tttOpenThreeThreatMoves(board, mark).length;
  const openTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, mark).length : 0;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const vector = tttLineVectorScore(board, mark);
  const pressure = tttTacticalPressureScore(board, mark);
  return winner * 420000000
    + wins * 88000000
    + critical * 24000000
    + windows * 9600000
    + openThrees * 5200000
    + openTwos * 560000
    + fork * 8200000
    + vector * 1.72
    + pressure * 1.08;
}

function tttBestEarlyTrapLockMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 4) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const baseHumanRisk = tttEarlyTrapRiskScore(board, 'X');
  const baseAiRisk = tttEarlyTrapRiskScore(board, 'O');

  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 18 ? 4 : 3),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O'),
    ...tttOpenThreeThreatMoves(board, 'O')
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      board[idx] = 'O';
      const humanRiskAfter = tttEarlyTrapRiskScore(board, 'X');
      const aiRiskAfter = tttEarlyTrapRiskScore(board, 'O');
      board[idx] = '';
      return {
        idx,
        score: (baseHumanRisk - humanRiskAfter) * 1.32
          + (aiRiskAfter - baseAiRisk) * 0.64
          + tttCheapMovePotential(board, idx, 'X') * 1.28
          + tttCheapMovePotential(board, idx, 'O') * 1.06
          + Math.max(0, 120 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 46 : (occupied < 28 ? 34 : 24))
    .map(item => item.idx);

  if (!candidates.length) return -1;

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 24 && bestIdx >= 0) break;
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const humanRiskAfterO = tttEarlyTrapRiskScore(board, 'X');
    const aiRiskAfterO = tttEarlyTrapRiskScore(board, 'O');
    const immediateHumanWins = tttWinningMoves(board, 'X').length;

    let replies = Array.from(new Set([
      ...tttCandidateMoves(board, occupied < 18 ? 3 : 2),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X')
    ])).filter(reply => Number.isFinite(Number(reply)) && !board[Number(reply)]).map(Number);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyScore = tttEarlyTrapRiskScore(board, 'X')
          - tttEarlyTrapRiskScore(board, 'O') * 0.24
          + tttCheapMovePotential(board, reply, 'X') * 1.1;
        board[reply] = '';
        return { reply, score: replyScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 22 : 16)
      .map(item => item.reply);

    let worstRisk = immediateHumanWins * 120000000 + humanRiskAfterO;
    for (const reply of replies) {
      const tick = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (deadline && tick > deadline - 12 && worstRisk > bestWorstRisk) break;
      board[reply] = 'X';
      const replyWins = tttWinningMoves(board, 'X').length;
      const replyRiskBase = tttEarlyTrapRiskScore(board, 'X');
      const aiImmediate = tttWinningMoves(board, 'O').length;
      let bestCounterRelief = 0;
      const counters = Array.from(new Set([
        ...tttCandidateMoves(board, 2),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'O')
      ])).filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)]).map(Number)
        .map(counter => {
          board[counter] = 'O';
          const relief = replyRiskBase - tttEarlyTrapRiskScore(board, 'X') + tttEarlyTrapRiskScore(board, 'O') * 0.26;
          board[counter] = '';
          return relief;
        })
        .sort((a, b) => b - a)
        .slice(0, 10);
      if (counters.length) bestCounterRelief = Math.max(0, counters[0]);
      const replyRisk = replyWins * 130000000
        + replyRiskBase
        - aiImmediate * 42000000
        - bestCounterRelief * 0.52;
      board[reply] = '';
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const candidateScore = ownWin * 500000000
      + (baseHumanRisk - humanRiskAfterO) * 1.9
      + (aiRiskAfterO - baseAiRisk) * 0.82
      + tttCheapMovePotential(board, idx, 'O') * 1.14
      + tttCheapMovePotential(board, idx, 'X') * 1.22
      - worstRisk * 1.46;

    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 6 || baseHumanRisk > 60000 || bestWorstRisk < Math.max(2600000, baseHumanRisk * 1.35)) return bestIdx;
  return -1;
}


function tttBestThirteenTurnClampMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const baseHuman = tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.62 + tttLineVectorScore(board, 'X') * 0.44;
  const baseAi = tttEarlyTrapRiskScore(board, 'O') + tttReplyLockdownRisk(board, 'O') * 0.44 + tttLineVectorScore(board, 'O') * 0.28;

  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 20 ? 4 : 3),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O'),
    ...tttOpenThreeThreatMoves(board, 'O'),
    ...tttOpenTwoThreatMoves(board, 'O')
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      board[idx] = 'O';
      const xRisk = tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.68 + tttLineVectorScore(board, 'X') * 0.52;
      const oRisk = tttEarlyTrapRiskScore(board, 'O') + tttReplyLockdownRisk(board, 'O') * 0.5 + tttLineVectorScore(board, 'O') * 0.34;
      const xWins = tttWinningMoves(board, 'X').length;
      board[idx] = '';
      return {
        idx,
        score: (baseHuman - xRisk) * 2.2
          + (oRisk - baseAi) * 0.74
          - xWins * 95000000
          + tttCheapMovePotential(board, idx, 'X') * 1.48
          + tttCheapMovePotential(board, idx, 'O') * 1.18
          + Math.max(0, 140 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 6)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 54 : (occupied < 28 ? 40 : 26))
    .map(item => item.idx);

  if (!candidates.length) return -1;

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;

  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 34 && bestIdx >= 0) break;
    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const ownImmediateWins = tttWinningMoves(board, 'O').length;
    const xImmediateWins = tttWinningMoves(board, 'X').length;
    const xAfterO = tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.74 + tttLineVectorScore(board, 'X') * 0.58;
    const oAfterO = tttEarlyTrapRiskScore(board, 'O') + tttReplyLockdownRisk(board, 'O') * 0.54 + tttLineVectorScore(board, 'O') * 0.38;

    const replyPool = new Set([
      ...tttCandidateMoves(board, occupied < 20 ? 4 : 3),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X'),
      ...tttThreatWindowMoves(board, 'O')
    ]);
    let replies = Array.from(replyPool)
      .filter(reply => Number.isFinite(Number(reply)) && !board[Number(reply)])
      .map(Number)
      .map(reply => {
        board[reply] = 'X';
        const score = (tttWinner(board).winner === 'X' ? 320000000 : 0)
          + tttWinningMoves(board, 'X').length * 92000000
          + tttEarlyTrapRiskScore(board, 'X')
          + tttReplyLockdownRisk(board, 'X') * 0.86
          + tttLineVectorScore(board, 'X') * 0.62
          + tttCheapMovePotential(board, reply, 'X') * 1.2
          - tttWinningMoves(board, 'O').length * 46000000;
        board[reply] = '';
        return { reply, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 26 : 18)
      .map(item => item.reply);

    let worstRisk = xImmediateWins * 220000000 + xAfterO;
    for (const reply of replies) {
      const tick = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (deadline && tick > deadline - 16 && worstRisk > bestWorstRisk) break;
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const replyWins = tttWinningMoves(board, 'X').length;
      const replyCritical = tttCriticalThreatMoves(board, 'X').length;
      const replyOpenThree = tttOpenThreeThreatMoves(board, 'X').length;
      const replyOpenTwo = tttOpenTwoThreatMoves(board, 'X').length;
      const replyFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const replyBaseRisk = tttEarlyTrapRiskScore(board, 'X')
        + tttReplyLockdownRisk(board, 'X') * 0.92
        + tttLineVectorScore(board, 'X') * 0.72
        - tttEarlyTrapRiskScore(board, 'O') * 0.18;

      let bestCounterRelief = 0;
      const counters = Array.from(new Set([
        ...tttCandidateMoves(board, 3),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'O'),
        ...tttCriticalThreatMoves(board, 'O')
      ])).filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)]).map(Number)
        .map(counter => {
          board[counter] = 'O';
          const relief = replyBaseRisk
            - (tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.82 + tttLineVectorScore(board, 'X') * 0.6)
            + tttWinningMoves(board, 'O').length * 52000000
            + tttEarlyTrapRiskScore(board, 'O') * 0.24;
          board[counter] = '';
          return relief;
        })
        .sort((a, b) => b - a)
        .slice(0, 12);
      if (counters.length) bestCounterRelief = Math.max(0, counters[0]);
      board[reply] = '';

      const replyRisk = replyWinner * 420000000
        + replyWins * 135000000
        + replyCritical * 54000000
        + replyOpenThree * 22000000
        + replyOpenTwo * 2600000
        + replyFork * 30000000
        + replyBaseRisk
        - bestCounterRelief * 0.48;
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const candidateScore = ownWinNow * 700000000
      + ownImmediateWins * 160000000
      + (baseHuman - xAfterO) * 2.45
      + (oAfterO - baseAi) * 0.92
      + tttCheapMovePotential(board, idx, 'O') * 1.26
      + tttCheapMovePotential(board, idx, 'X') * 1.42
      - worstRisk * 1.62;

    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 5 || baseHuman > 26000 || bestWorstRisk < Math.max(3600000, baseHuman * 1.22)) return bestIdx;
  return -1;
}

function getRakTttAiHardeningV922Health() {
  return {
    ok: true,
    mode: 'ttt-ai-hardening-v923',
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    thirteenTurnClamp: true,
    hardSearchDepthEarly: 8,
    hardSearchDepthMid: 8,
    onlineFlowTouched: true,
    note: 'AI proti počítači má clamp vrstvy; od v951 má online Piškvorky samostatná 10 sloupců × 19 řad ruleset metadata a kompatibilitní guard.'
  };
}
if (typeof window !== 'undefined') window.getRakTttAiHardeningV922Health = getRakTttAiHardeningV922Health;

function tttBestUltraSafetyMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const baseRisk = tttTacticalPressureScore(board, 'X');
  let candidates = Array.from(new Set(tttCandidateMoves(board, occupied < 20 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 1.05
          + tttCheapMovePotential(board, idx, 'X') * 1.18
          + Math.max(0, 100 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 34 : (occupied < 28 ? 28 : 20))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 20 && bestIdx >= 0) break;
    board[idx] = 'O';
    const ownImmediate = tttWinningMoves(board, 'O').length;
    const ownPressure = tttTacticalPressureScore(board, 'O');
    const xImmediateAfterO = tttWinningMoves(board, 'X').length;
    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 18 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyPressure = tttTacticalPressureScore(board, 'X');
        const replyWin = tttWinner(board).winner === 'X' ? 1 : 0;
        const replyWins = tttWinningMoves(board, 'X').length;
        board[reply] = '';
        return { reply, score: tttCheapMovePotential(board, reply, 'X') + replyPressure * 0.0001 + replyWin * 1000000 + replyWins * 300000 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 14 : 10)
      .map(item => item.reply);

    let worstRisk = xImmediateAfterO * 28000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const xPressure = tttTacticalPressureScore(board, 'X');
      const oCounterWin = tttWinningMoves(board, 'O').length;
      const oPressure = tttTacticalPressureScore(board, 'O');
      board[reply] = '';
      const risk = replyWinner * 70000000
        + xWins * 19000000
        + xCritical * 3600000
        + xWindows * 1700000
        + xOpenThrees * 980000
        + xFork * 1350000
        + xPressure * 0.9
        - oCounterWin * 8500000
        - oPressure * 0.22;
      if (risk > worstRisk) worstRisk = risk;
    }
    board[idx] = '';
    const candidateScore = ownImmediate * 16000000
      + ownPressure * 0.96
      + tttCheapMovePotential(board, idx, 'O') * 1.1
      - worstRisk * 1.24;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (baseRisk > 40000 || bestWorstRisk < 2200000 || occupied >= 8) return bestIdx;
  return -1;
}

function tttHardSearchDepth(board) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 8) return 8;
  if (occupied < 18) return 8;
  if (occupied < 30) return 7;
  if (occupied < 42) return 4;
  return 2;
}

function tttEngineNow() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

function tttEngineBudgetMs(difficulty) {
  const lowEnd = !!(typeof document !== 'undefined' && document.body && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return 90;
  return lowEnd ? 180 : 320;
}

function tttNearestCenterFallbackMove(board) {
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let best = -1;
  let bestScore = Infinity;
  for (let idx = 0; idx < board.length; idx += 1) {
    if (board[idx]) continue;
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    const score = Math.abs(row - centerRow) + Math.abs(col - centerCol) * 0.94;
    if (score < bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttPromptEngineOpeningMove(board) {
  const preferred = [[9, 4], [9, 5], [8, 4], [10, 5], [8, 5], [10, 4], [9, 3], [9, 6]];
  for (const pair of preferred) {
    const row = pair[0];
    const col = pair[1];
    if (!tttInBounds(row, col)) continue;
    const idx = tttIndex(row, col);
    if (!board[idx]) return idx;
  }
  return tttOpeningBookMove(board);
}

function tttPromptEnginePickThreatMove(board, moves, mark) {
  const unique = Array.from(new Set((moves || []).map(Number).filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])));
  if (!unique.length) return -1;
  let best = unique[0];
  let bestScore = -Infinity;
  for (const idx of unique) {
    board[idx] = mark;
    const score = (tttWinner(board).winner === mark ? 900000000 : 0)
      + tttWinningMoves(board, mark).length * 120000000
      + tttCriticalThreatMoves(board, mark).length * 24000000
      + tttOpenThreeThreatMoves(board, mark).length * 6000000
      + tttSimpleMoveScore(board, idx, mark);
    board[idx] = '';
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttPromptEngineTacticalMove(board, difficulty, deadline) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttPromptEnginePickThreatMove(board, ownWins, 'O');

  const opponentWins = tttWinningMoves(board, 'X');
  if (opponentWins.length) {
    const block = tttPromptEnginePickThreatMove(board, opponentWins, 'O');
    if (block >= 0) return block;
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const opponentFours = Array.from(new Set([
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X')
  ]));
  const forcedBlock = tttPromptEnginePickThreatMove(board, opponentFours, 'O');
  if (forcedBlock >= 0) return forcedBlock;

  if (deadline && tttEngineNow() > deadline - 28) {
    const emergency = tttPromptEnginePickThreatMove(board, tttCandidateMoves(board, occupied < 10 ? 3 : 2), 'O');
    return emergency >= 0 ? emergency : tttNearestCenterFallbackMove(board);
  }

  return -1;
}


function tttV952PromptCandidateSet(board, occupied, radius) {
  const set = new Set();
  const add = (moves) => (moves || []).forEach(idx => {
    const n = Number(idx);
    if (Number.isFinite(n) && n >= 0 && n < board.length && !board[n]) set.add(n);
  });
  add(tttWinningMoves(board, 'O'));
  add(tttWinningMoves(board, 'X'));
  add(tttThreatWindowMoves(board, 'O'));
  add(tttThreatWindowMoves(board, 'X'));
  add(tttCriticalThreatMoves(board, 'O'));
  add(tttCriticalThreatMoves(board, 'X'));
  add(tttOpenThreeThreatMoves(board, 'O'));
  add(tttOpenThreeThreatMoves(board, 'X'));
  add(tttCandidateMoves(board, radius || (occupied < 18 ? 3 : 2)));
  if (!set.size) {
    const fallback = tttNearestCenterFallbackMove(board);
    if (fallback >= 0) set.add(fallback);
  }
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return Array.from(set).sort((a, b) => {
    const as = tttCheapMovePotential(board, a, 'O') * 1.12 + tttCheapMovePotential(board, a, 'X') * 1.08;
    const bs = tttCheapMovePotential(board, b, 'O') * 1.12 + tttCheapMovePotential(board, b, 'X') * 1.08;
    if (Math.abs(bs - as) > 0.001) return bs - as;
    const ar = Math.floor(a / TTT_COLS), ac = a % TTT_COLS;
    const br = Math.floor(b / TTT_COLS), bc = b % TTT_COLS;
    return (Math.abs(ar - centerRow) + Math.abs(ac - centerCol)) - (Math.abs(br - centerRow) + Math.abs(bc - centerCol));
  });
}

function tttV952StaticThreatScore(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  const openTwo = tttOpenTwoThreatMoves(board, mark).length;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const pressure = tttTacticalPressureScore(board, mark);
  return wins * 120000000 + critical * 18500000 + windows * 6200000 + openThree * 2400000 + fork * 5200000 + openTwo * 220000 + pressure * 0.74;
}

function tttV952PickVerifiedBlock(board, opponentWins, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const candidates = Array.from(new Set([...(opponentWins || []), ...tttV952PromptCandidateSet(board, occupied, 2)]))
    .filter(idx => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 18 && best >= 0) break;
    board[idx] = 'O';
    const remainingWins = tttWinningMoves(board, 'X').length;
    const ownWin = tttWinningMoves(board, 'O').length;
    const ownPressure = tttV952StaticThreatScore(board, 'O');
    const xPressure = tttV952StaticThreatScore(board, 'X');
    board[idx] = '';
    const score = -remainingWins * 900000000 + ownWin * 140000000 + ownPressure * 0.72 - xPressure * 1.18 + tttCheapMovePotential(board, idx, 'O');
    if (remainingWins === 0 && score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  if (best >= 0) return best;
  return tttPromptEnginePickThreatMove(board, opponentWins, 'O');
}

function tttV952RootSafetyMove(board, difficulty, deadline) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttPromptEnginePickThreatMove(board, ownWins, 'O');

  const opponentWins = tttWinningMoves(board, 'X');
  if (opponentWins.length) return tttV952PickVerifiedBlock(board, opponentWins, deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const ownFork = tttBestForkMove(board, 'O');
  if (ownFork >= 0 && !board[ownFork]) {
    board[ownFork] = 'O';
    const xWin = tttWinningMoves(board, 'X').length;
    board[ownFork] = '';
    if (!xWin) return ownFork;
  }

  const opponentFork = tttBestForkMove(board, 'X');
  if (opponentFork >= 0 && !board[opponentFork]) {
    const blockFork = tttV952PickVerifiedBlock(board, [opponentFork], deadline);
    if (blockFork >= 0) return blockFork;
  }

  const candidates = tttV952PromptCandidateSet(board, occupied, occupied < 18 ? 3 : 2)
    .slice(0, difficulty === 'ai' ? (occupied < 20 ? 30 : 24) : 12);
  if (!candidates.length) return tttNearestCenterFallbackMove(board);

  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 24 && best >= 0) break;
    board[idx] = 'O';
    if (tttWinner(board).winner === 'O') {
      board[idx] = '';
      return idx;
    }
    const immediateLosses = tttWinningMoves(board, 'X').length;
    const ownThreat = tttV952StaticThreatScore(board, 'O');
    const xThreat = tttV952StaticThreatScore(board, 'X');
    let replies = tttV952PromptCandidateSet(board, occupied + 1, 2)
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, 'X') + tttV952StaticThreatScore((() => { board[reply] = 'X'; const snap = board.slice(); board[reply] = ''; return snap; })(), 'X') * 0.0002 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 24 ? 12 : 8)
      .map(item => item.reply);
    if (!replies.length) replies = [tttNearestCenterFallbackMove(board)].filter(n => n >= 0 && !board[n]);

    let worstReply = immediateLosses * 950000000;
    for (const reply of replies) {
      if (deadline && tttEngineNow() > deadline - 12 && worstReply > 0) break;
      board[reply] = 'X';
      const xWinsNow = tttWinner(board).winner === 'X' ? 1 : 0;
      const xNextWins = tttWinningMoves(board, 'X').length;
      const oCounterWins = tttWinningMoves(board, 'O').length;
      const xPressure = tttV952StaticThreatScore(board, 'X');
      const oPressure = tttV952StaticThreatScore(board, 'O');
      board[reply] = '';
      const risk = xWinsNow * 1400000000 + xNextWins * 260000000 + xPressure * 1.08 - oCounterWins * 180000000 - oPressure * 0.34;
      if (risk > worstReply) worstReply = risk;
    }

    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    const centerBonus = Math.max(0, 90 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 7);
    const score = ownThreat * 1.02 - xThreat * 0.44 - worstReply * 1.12 + tttCheapMovePotential(board, idx, 'O') * 1.3 + centerBonus;
    board[idx] = '';
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best >= 0 ? best : tttNearestCenterFallbackMove(board);
}

function getRakOnlineGomokuEngineV954Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    winLength: TTT_WIN_LENGTH,
    deterministic: true,
    onlineMetadata: true,
    immediateWinLossGuard: true,
    deadlineGuard: true,
    legacyOnlineDimensionGuard: true,
    note: 'Piškvorky drží 10 sloupců × 19 řad, AI má v954 bounded tactical/safety engine proti zaseknutí a online PvP zůstává člověk proti člověku.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakOnlineGomokuEngineV954Health = getRakOnlineGomokuEngineV954Health;
  window.getRakOnlineGomokuEngineV953Health = getRakOnlineGomokuEngineV954Health;
  window.getRakOnlineGomokuEngineV952Health = getRakOnlineGomokuEngineV954Health;
  window.getRakOnlineGomokuEngineV951Health = getRakOnlineGomokuEngineV954Health;
}


function tttV954CenterScore(idx) {
  const row = Math.floor(idx / TTT_COLS);
  const col = idx % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return Math.max(0, 120 - (Math.abs(row - centerRow) * 6.2 + Math.abs(col - centerCol) * 7.4));
}

function tttV954ThreatScore(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  const openTwo = tttOpenTwoThreatMoves(board, mark).length;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const pressure = tttTacticalPressureScore(board, mark);
  return wins * 180000000
    + critical * 26000000
    + windows * 8600000
    + openThree * 3600000
    + fork * 7600000
    + openTwo * 360000
    + pressure * 0.68;
}

function tttV954CandidateSet(board, radius) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const set = new Set();
  const add = (moves) => (moves || []).forEach(idx => {
    const n = Number(idx);
    if (Number.isFinite(n) && n >= 0 && n < board.length && !board[n]) set.add(n);
  });
  add(tttWinningMoves(board, 'O'));
  add(tttWinningMoves(board, 'X'));
  add(tttCriticalThreatMoves(board, 'O'));
  add(tttCriticalThreatMoves(board, 'X'));
  add(tttThreatWindowMoves(board, 'O'));
  add(tttThreatWindowMoves(board, 'X'));
  add(tttOpenThreeThreatMoves(board, 'O'));
  add(tttOpenThreeThreatMoves(board, 'X'));
  add(tttOpenTwoThreatMoves(board, 'O'));
  add(tttOpenTwoThreatMoves(board, 'X'));
  add(tttCandidateMoves(board, radius || (occupied < 16 ? 3 : 2)));
  if (!set.size) {
    const fallback = tttNearestCenterFallbackMove(board);
    if (fallback >= 0) set.add(fallback);
  }
  return Array.from(set).sort((a, b) => {
    const as = tttCheapMovePotential(board, a, 'O') * 1.18 + tttCheapMovePotential(board, a, 'X') * 1.28 + tttV954CenterScore(a);
    const bs = tttCheapMovePotential(board, b, 'O') * 1.18 + tttCheapMovePotential(board, b, 'X') * 1.28 + tttV954CenterScore(b);
    return bs - as;
  });
}

function tttV954PickVerifiedDefense(board, attackMoves, deadline) {
  const moves = Array.from(new Set((attackMoves || []).map(Number).filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])));
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const candidates = Array.from(new Set([...moves, ...tttV954CandidateSet(board, occupied < 16 ? 3 : 2)]))
    .filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])
    .slice(0, 30);
  let best = -1;
  let bestScore = -Infinity;
  let bestLosses = Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 18 && best >= 0) break;
    board[idx] = 'O';
    const remainingWins = tttWinningMoves(board, 'X').length;
    const xThreat = tttV954ThreatScore(board, 'X');
    const oThreat = tttV954ThreatScore(board, 'O');
    const createsWin = tttWinningMoves(board, 'O').length;
    board[idx] = '';
    const score = -remainingWins * 1200000000 - xThreat * 1.38 + oThreat * 0.78 + createsWin * 260000000 + tttCheapMovePotential(board, idx, 'O') * 1.1 + tttV954CenterScore(idx);
    if (remainingWins < bestLosses || (remainingWins === bestLosses && score > bestScore)) {
      bestLosses = remainingWins;
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV954TopReplies(board, limit) {
  return tttV954CandidateSet(board, 2)
    .map(idx => {
      board[idx] = 'X';
      const score = (tttWinner(board).winner === 'X' ? 2000000000 : 0)
        + tttWinningMoves(board, 'X').length * 180000000
        + tttV954ThreatScore(board, 'X') * 0.92
        + tttCheapMovePotential(board, idx, 'X') * 2.0;
      board[idx] = '';
      return { idx, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 8)
    .map(item => item.idx);
}

function tttV954MoveScore(board, idx, deadline) {
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') {
    board[idx] = '';
    return 900000000000;
  }
  const immediateLosses = tttWinningMoves(board, 'X').length;
  const ownWins = tttV958WinningMovesFast(board, 'O').length;
  const ownThreat = tttV954ThreatScore(board, 'O');
  const xThreat = tttV954ThreatScore(board, 'X');
  const ownFork = tttBestForkMove(board, 'O') >= 0 ? 1 : 0;
  const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
  let worstReplyRisk = immediateLosses * 1600000000 + xFork * 180000000;
  const replies = tttV954TopReplies(board, 7);
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 12) break;
    board[reply] = 'X';
    const replyRisk = (tttWinner(board).winner === 'X' ? 2500000000 : 0)
      + tttWinningMoves(board, 'X').length * 360000000
      + tttCriticalThreatMoves(board, 'X').length * 52000000
      + tttThreatWindowMoves(board, 'X').length * 18000000
      + tttOpenThreeThreatMoves(board, 'X').length * 7200000
      + (tttBestForkMove(board, 'X') >= 0 ? 42000000 : 0)
      + tttV954ThreatScore(board, 'X') * 0.44
      - tttWinningMoves(board, 'O').length * 260000000
      - tttV954ThreatScore(board, 'O') * 0.14;
    board[reply] = '';
    if (replyRisk > worstReplyRisk) worstReplyRisk = replyRisk;
  }
  board[idx] = '';
  return ownWins * 320000000
    + ownThreat * 1.05
    + ownFork * 54000000
    + tttCheapMovePotential(board, idx, 'O') * 2.2
    + tttCheapMovePotential(board, idx, 'X') * 1.85
    + tttV954CenterScore(idx)
    - xThreat * 0.72
    - worstReplyRisk * 1.18;
}

function tttV954BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const start = tttEngineNow();
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), (difficulty === 'ai' ? 320 : 110));
  const deadline = start + hardBudget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttPromptEnginePickThreatMove(board, ownWins, 'O');

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) return tttV954PickVerifiedDefense(board, xWins, deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const ownFork = tttBestForkMove(board, 'O');
  if (ownFork >= 0 && !board[ownFork]) {
    board[ownFork] = 'O';
    const unsafe = tttWinningMoves(board, 'X').length;
    board[ownFork] = '';
    if (!unsafe) return ownFork;
  }

  const urgentX = Array.from(new Set([
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X')
  ])).filter(idx => !board[idx]);
  if (urgentX.length) {
    const defense = tttV954PickVerifiedDefense(board, urgentX, deadline);
    if (defense >= 0) {
      board[defense] = 'O';
      const stillBad = tttWinningMoves(board, 'X').length;
      const ownCounter = tttWinningMoves(board, 'O').length + tttCriticalThreatMoves(board, 'O').length;
      board[defense] = '';
      if (!stillBad || ownCounter > 0) return defense;
    }
  }

  const candidates = tttV954CandidateSet(board, occupied < 18 ? 3 : 2)
    .filter(idx => !board[idx])
    .slice(0, occupied < 20 ? 24 : 18);
  let best = candidates[0] ?? tttNearestCenterFallbackMove(board);
  let bestScore = -Infinity;
  let bestSafe = -1;
  let bestSafeScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 18 && best >= 0) break;
    const score = tttV954MoveScore(board, idx, deadline);
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
    board[idx] = 'O';
    const safe = tttWinningMoves(board, 'X').length === 0 && tttWinner(board).winner !== 'X';
    board[idx] = '';
    if (safe && score > bestSafeScore) {
      bestSafeScore = score;
      bestSafe = idx;
    }
  }
  const chosen = bestSafe >= 0 ? bestSafe : best;
  if (chosen >= 0 && !board[chosen]) return chosen;
  return tttNearestCenterFallbackMove(board);
}



function tttV955OccupiedCount(board) {
  let n = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) n += 1;
  return n;
}

function tttV955LineWindowScore(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  let score = 0;
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        const cells = [];
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { ok = false; break; }
          cells.push(tttIndex(r, c));
        }
        if (!ok) continue;
        let own = 0;
        let empty = 0;
        let blocked = false;
        for (const idx of cells) {
          const cell = board[idx];
          if (cell === opponent) { blocked = true; break; }
          if (cell === mark) own += 1;
          else if (!cell) empty += 1;
        }
        if (blocked || own <= 0) continue;
        if (own >= 5) score += 1000000000;
        else if (own === 4 && empty === 1) score += 9000000;
        else if (own === 3 && empty === 2) score += 420000;
        else if (own === 2 && empty === 3) score += 22000;
        else if (own === 1 && empty === 4) score += 450;
      }
    }
  }
  return score;
}

function tttV955MoveThreatProfile(board, idx, mark) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return { level: -1, score: -Infinity, winMoves: 0 };
  const opponent = mark === 'O' ? 'X' : 'O';
  board[idx] = mark;
  const winner = tttWinner(board).winner;
  const winMoves = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  const openTwo = tttOpenTwoThreatMoves(board, mark).length;
  const opponentWins = tttWinningMoves(board, opponent).length;
  const lineScore = tttV955LineWindowScore(board, mark);
  board[idx] = '';
  let level = 0;
  if (winner === mark) level = 7;
  else if (winMoves >= 2) level = 6;
  else if (winMoves === 1) level = 5;
  else if (critical >= 2) level = 4;
  else if (critical >= 1 || windows >= 2) level = 3;
  else if (openThree >= 2) level = 2;
  else if (openThree >= 1 || openTwo >= 2) level = 1;
  const score = level * 100000000
    + winMoves * 26000000
    + critical * 9200000
    + windows * 2800000
    + openThree * 900000
    + openTwo * 70000
    + lineScore
    - opponentWins * 42000000
    + tttCheapMovePotential(board, idx, mark) * 1.8
    + tttV954CenterScore(idx);
  return { level, score, winMoves, critical, windows, openThree, openTwo };
}

function tttV955ThreatMoves(board, mark, minLevel) {
  const occupied = tttV955OccupiedCount(board);
  const pool = new Set(tttV954CandidateSet(board, occupied < 16 ? 3 : 2));
  tttWinningMoves(board, mark).forEach(idx => pool.add(idx));
  tttCriticalThreatMoves(board, mark).forEach(idx => pool.add(idx));
  tttThreatWindowMoves(board, mark).forEach(idx => pool.add(idx));
  const out = [];
  for (const idx of pool) {
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) continue;
    const p = tttV955MoveThreatProfile(board, idx, mark);
    if (p.level >= (minLevel || 1)) out.push(Object.assign({ idx }, p));
  }
  out.sort((a, b) => (b.level - a.level) || (b.score - a.score) || (a.idx - b.idx));
  return out;
}

function tttV955PickBestFrom(board, moves, mark, deadline) {
  const unique = Array.from(new Set((moves || []).map(Number).filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])));
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of unique) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const p = tttV955MoveThreatProfile(board, idx, mark);
    board[idx] = mark;
    const ownScore = tttV955Evaluate(board);
    const oppWins = tttWinningMoves(board, mark === 'O' ? 'X' : 'O').length;
    board[idx] = '';
    const score = p.score + (mark === 'O' ? ownScore : -ownScore) - oppWins * 600000000;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV955Evaluate(board) {
  const winner = tttWinner(board).winner;
  if (winner === 'O') return 2000000000;
  if (winner === 'X') return -2000000000;
  if (winner === 'draw') return 0;
  const oThreat = tttV954ThreatScore(board, 'O') + tttV955LineWindowScore(board, 'O') * 0.82;
  const xThreat = tttV954ThreatScore(board, 'X') + tttV955LineWindowScore(board, 'X') * 1.18;
  return oThreat * 1.06 - xThreat * 1.32 + tttScoreRuns(board, 'O') * 0.14 - tttScoreRuns(board, 'X') * 0.18;
}

function tttV955CandidateSet(board, deadline) {
  const occupied = tttV955OccupiedCount(board);
  const set = new Set();
  const add = (moves) => (moves || []).forEach(idx => {
    const n = Number(idx);
    if (Number.isFinite(n) && n >= 0 && n < board.length && !board[n]) set.add(n);
  });
  add(tttWinningMoves(board, 'O'));
  add(tttWinningMoves(board, 'X'));
  add(tttV955ThreatMoves(board, 'O', 1).map(x => x.idx));
  add(tttV955ThreatMoves(board, 'X', 1).map(x => x.idx));
  add(tttV954CandidateSet(board, occupied < 16 ? 3 : 2));
  if (!set.size) add([tttNearestCenterFallbackMove(board)]);
  const arr = Array.from(set).filter(idx => !board[idx]).map(idx => {
    const op = tttV955MoveThreatProfile(board, idx, 'O');
    const xp = tttV955MoveThreatProfile(board, idx, 'X');
    return { idx, score: op.score * 1.12 + xp.score * 1.38 + tttV954CenterScore(idx) };
  }).sort((a, b) => b.score - a.score).map(item => item.idx);
  void deadline;
  return arr;
}

function tttV955ReplyRisk(board, reply, deadline) {
  board[reply] = 'X';
  const winner = tttWinner(board).winner;
  if (winner === 'X') { board[reply] = ''; return 3000000000; }
  const xWins = tttWinningMoves(board, 'X').length;
  const oWins = tttWinningMoves(board, 'O').length;
  const xProfile = tttV955MoveThreatProfile(board, reply, 'X');
  const xThreat = tttV955ThreatMoves(board, 'X', 2).slice(0, 4).reduce((s, p) => s + p.score, 0);
  let bestOAnswer = -Infinity;
  const oAnswers = tttV955CandidateSet(board, deadline).slice(0, 8);
  for (const o of oAnswers) {
    if (deadline && tttEngineNow() > deadline - 8) break;
    board[o] = 'O';
    const val = tttV955Evaluate(board) - tttWinningMoves(board, 'X').length * 500000000;
    board[o] = '';
    if (val > bestOAnswer) bestOAnswer = val;
  }
  const risk = xWins * 900000000 + xProfile.score * 0.42 + xThreat * 0.14 - oWins * 700000000 - Math.max(-500000000, bestOAnswer) * 0.08;
  board[reply] = '';
  return risk;
}

function tttV955MoveScore(board, idx, deadline) {
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 5000000000; }
  const immediateXWins = tttWinningMoves(board, 'X').length;
  const ownThreats = tttV955ThreatMoves(board, 'O', 1).slice(0, 6).reduce((s, p) => s + p.score, 0);
  const xThreats = tttV955ThreatMoves(board, 'X', 1).slice(0, 6).reduce((s, p) => s + p.score, 0);
  const replies = tttV955CandidateSet(board, deadline).slice(0, 9);
  let worstRisk = immediateXWins * 1800000000;
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 10) break;
    const risk = tttV955ReplyRisk(board, reply, deadline);
    if (risk > worstRisk) worstRisk = risk;
  }
  const score = tttV955Evaluate(board) + ownThreats * 0.22 - xThreats * 0.34 - worstRisk * 1.12 + tttV954CenterScore(idx) * 8000;
  board[idx] = '';
  return score;
}

function tttV955BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const start = tttEngineNow();
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 260 : 95);
  const deadline = start + hardBudget;

  const ownWins = tttV958WinningMovesFast(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttV958WinningMovesFast(board, 'X');
  if (xWins.length) return tttV955PickBestFrom(board, xWins, 'O', deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  // v.1.5 (963): prevent the human from placing the diagonal/straight gain square
  // that creates a four, fork, or clean open-three chain on the next move.
  const xNextGains = tttV957HumanNextThreatGains(board, deadline);
  const hardNextGains = xNextGains.filter(item => item.level >= (occupied >= 8 ? 3 : 5));
  if (hardNextGains.length) {
    const blockGain = tttV957PickHumanGainBlock(board, hardNextGains.slice(0, 18), deadline);
    if (blockGain >= 0) return blockGain;
  }

  const ownForcing = tttV955ThreatMoves(board, 'O', 5);
  if (ownForcing.length) {
    const move = tttV955PickBestFrom(board, ownForcing.map(x => x.idx), 'O', deadline);
    if (move >= 0) {
      board[move] = 'O';
      const unsafe = tttWinningMoves(board, 'X').length;
      board[move] = '';
      if (!unsafe) return move;
    }
  }

  const xDanger = tttV955ThreatMoves(board, 'X', 3);
  if (xDanger.length) {
    const block = tttV955PickBestFrom(board, xDanger.slice(0, 12).map(x => x.idx), 'O', deadline);
    if (block >= 0) {
      board[block] = 'O';
      const stillLosing = tttWinningMoves(board, 'X').length;
      const ownCounter = tttWinningMoves(board, 'O').length + tttV955ThreatMoves(board, 'O', 5).length;
      board[block] = '';
      if (!stillLosing || ownCounter > 0) return block;
    }
  }

  const candidates = tttV955CandidateSet(board, deadline).slice(0, occupied < 18 ? 28 : 22);
  let best = candidates[0] ?? tttNearestCenterFallbackMove(board);
  let bestScore = -Infinity;
  let bestSafe = -1;
  let bestSafeScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 16 && best >= 0) break;
    const score = tttV955MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
    board[idx] = 'O';
    const safe = tttWinningMoves(board, 'X').length === 0 && tttWinner(board).winner !== 'X';
    board[idx] = '';
    if (safe && score > bestSafeScore) { bestSafeScore = score; bestSafe = idx; }
  }
  const chosen = bestSafe >= 0 ? bestSafe : best;
  if (Number.isFinite(Number(chosen)) && chosen >= 0 && chosen < board.length && !board[chosen]) return chosen;
  const emergencyWin = tttWinningMove(board, 'O');
  if (emergencyWin >= 0) return emergencyWin;
  const emergencyBlock = tttWinningMove(board, 'X');
  if (emergencyBlock >= 0) return emergencyBlock;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV955Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    aiPipeline: ['immediate-win', 'immediate-loss-block', 'forcing-threats', 'opponent-danger-block', 'bounded-root-safety-search', 'center-fallback'],
    freezeGuard: true,
    onlinePvPUnchanged: true,
    note: 'v955 předělává pouze logiku AI proti počítači a opravuje centrování absence v horním dashboard panelu.'
  };
}
if (typeof window !== 'undefined') window.getRakGomokuAiV955Health = getRakGomokuAiV955Health;


function tttV956DefenseDirections() {
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
}

function tttV956LineRunThreats(board, mark) {
  const out = [];
  const seen = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      if (board[tttIndex(row, col)] !== mark) continue;
      for (const [dr, dc] of tttV956DefenseDirections()) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;
        let r = row;
        let c = col;
        const stones = [];
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          stones.push(tttIndex(r, c));
          r += dr;
          c += dc;
        }
        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const defenses = [];
        if (tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)]) defenses.push(tttIndex(beforeRow, beforeCol));
        if (tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)]) defenses.push(tttIndex(afterRow, afterCol));
        if (!defenses.length) continue;
        let type = '';
        let level = 0;
        if (stones.length >= 4) { type = 'four'; level = 5; }
        else if (stones.length === 3 && defenses.length === 2) { type = 'open-three'; level = 3; }
        else if (stones.length === 3 && defenses.length === 1) { type = 'simple-three'; level = 2; }
        else if (stones.length === 2 && defenses.length === 2) { type = 'open-two'; level = 1; }
        if (!type) continue;
        const key = type + '|' + stones.join(',') + '|' + defenses.join(',') + '|' + dr + ',' + dc;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ type, level, stones, defenses, dr, dc });
      }
    }
  }
  return out;
}

function tttV956WindowThreats(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const out = [];
  const seen = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of tttV956DefenseDirections()) {
        const cells = [];
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { ok = false; break; }
          cells.push(tttIndex(r, c));
        }
        if (!ok) continue;
        let own = 0;
        const empties = [];
        for (const idx of cells) {
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) own += 1;
          else if (!cell) empties.push(idx);
        }
        if (!ok || !empties.length) continue;
        let type = '';
        let level = 0;
        if (own === 4 && empties.length === 1) { type = 'window-four'; level = 5; }
        else if (own === 3 && empties.length === 2) {
          // Broken three / split three. These are lower than a contiguous open three,
          // but still real defense squares; never use fields outside this five-window.
          type = 'window-three';
          level = 2;
        }
        if (!type) continue;
        const key = type + '|' + cells.join(',') + '|' + empties.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ type, level, cells, defenses: empties, dr, dc });
      }
    }
  }
  return out;
}

function tttV956ThreatDefenseMoves(board, mark, minLevel) {
  const moves = new Map();
  const addThreat = (threat) => {
    if (!threat || threat.level < (minLevel || 1)) return;
    (threat.defenses || []).forEach(idx => {
      const n = Number(idx);
      if (!Number.isFinite(n) || n < 0 || n >= board.length || board[n]) return;
      const prev = moves.get(n) || { idx: n, hits: 0, level: 0, types: [] };
      prev.hits += 1;
      prev.level = Math.max(prev.level, threat.level || 0);
      if (threat.type && !prev.types.includes(threat.type)) prev.types.push(threat.type);
      moves.set(n, prev);
    });
  };
  tttV956LineRunThreats(board, mark).forEach(addThreat);
  tttV956WindowThreats(board, mark).forEach(addThreat);
  return Array.from(moves.values()).sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || (a.idx - b.idx));
}

function tttV956OpenThreeDefenseMoves(board, mark) {
  return tttV956LineRunThreats(board, mark)
    .filter(t => t.type === 'open-three')
    .flatMap(t => t.defenses || [])
    .filter((idx, pos, arr) => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx] && arr.indexOf(idx) === pos);
}

function tttV956PickDefenseMove(board, defenseEntries, deadline) {
  const entries = (defenseEntries || []).map(item => {
    if (typeof item === 'number') return { idx: item, hits: 1, level: 1, types: [] };
    return item || {};
  }).filter(item => Number.isFinite(Number(item.idx)) && item.idx >= 0 && item.idx < board.length && !board[item.idx]);
  if (!entries.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  let bestRisk = Infinity;
  for (const item of entries) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const idx = Number(item.idx);
    board[idx] = 'O';
    const xWinner = tttWinner(board).winner === 'X' ? 1 : 0;
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const xFours = tttV956ThreatDefenseMoves(board, 'X', 5).length;
    const xOpenThrees = tttV956OpenThreeDefenseMoves(board, 'X').length;
    const xBroken = tttV956ThreatDefenseMoves(board, 'X', 2).length;
    const oWins = tttWinningMoves(board, 'O').length;
    const oFours = tttV956ThreatDefenseMoves(board, 'O', 5).length;
    const oOpenThrees = tttV956OpenThreeDefenseMoves(board, 'O').length;
    const oEval = tttV955Evaluate(board);
    board[idx] = '';
    const risk = xWinner * 9000000000 + xWins * 1200000000 + xFours * 180000000 + xOpenThrees * 28000000 + xBroken * 2400000;
    const score = -risk
      + (Number(item.level || 0) * 9000000)
      + (Number(item.hits || 0) * 3800000)
      + oWins * 700000000
      + oFours * 70000000
      + oOpenThrees * 9000000
      + oEval * 0.24
      + tttCheapMovePotential(board, idx, 'O') * 0.8
      + tttCheapMovePotential(board, idx, 'X') * 1.5
      + tttV954CenterScore(idx) * 1200;
    if (risk < bestRisk || (risk === bestRisk && score > bestScore)) {
      bestRisk = risk;
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV956MoveLeavesMajorHumanThreat(board, idx) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return true;
  board[idx] = 'O';
  const bad = tttWinningMoves(board, 'X').length > 0
    || tttV956ThreatDefenseMoves(board, 'X', 5).length > 0
    || tttV956OpenThreeDefenseMoves(board, 'X').length > 1
    || (typeof tttV957HumanNextThreatGains === 'function' && tttV957HumanNextThreatGains(board).some(item => item.level >= 5));
  board[idx] = '';
  return bad;
}


function tttV957HumanNextThreatGains(board, deadline) {
  const occupied = tttV955OccupiedCount(board);
  const pool = new Set(tttV954CandidateSet(board, occupied < 14 ? 3 : 2));
  tttV956ThreatDefenseMoves(board, 'X', 1).forEach(item => pool.add(item.idx));
  tttV956OpenThreeDefenseMoves(board, 'X').forEach(idx => pool.add(idx));
  const out = [];
  for (const idxRaw of pool) {
    if (deadline && tttEngineNow() > deadline - 12 && out.length) break;
    const idx = Number(idxRaw);
    if (!Number.isFinite(idx) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const wins = tttWinningMoves(board, 'X').length;
    const fours = tttV956ThreatDefenseMoves(board, 'X', 5).length;
    const openThrees = tttV956OpenThreeDefenseMoves(board, 'X').length;
    const windowThrees = tttV956ThreatDefenseMoves(board, 'X', 2).length;
    const fork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
    const lineScore = tttV955LineWindowScore(board, 'X');
    board[idx] = '';
    let level = 0;
    if (wins >= 2) level = 7;
    else if (wins >= 1 || fours >= 2) level = 6;
    else if (fours >= 1) level = 5;
    else if (openThrees >= 2 || fork) level = 4;
    else if (openThrees >= 1) level = 3;
    else if (windowThrees >= 2) level = 2;
    if (level < 2) continue;
    out.push({
      idx,
      level,
      hits: wins * 4 + fours * 3 + openThrees * 2 + windowThrees + fork,
      types: ['human-next-gain'],
      score: level * 100000000 + wins * 30000000 + fours * 12000000 + openThrees * 3000000 + windowThrees * 500000 + lineScore + tttV954CenterScore(idx)
    });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || (b.score - a.score) || (a.idx - b.idx));
}

function tttV957MoveLeavesHumanGainThreat(board, idx, deadline) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return true;
  board[idx] = 'O';
  const bad = tttWinningMoves(board, 'X').length > 0
    || tttV956ThreatDefenseMoves(board, 'X', 5).length > 0
    || tttV956OpenThreeDefenseMoves(board, 'X').length > 1
    || tttV957HumanNextThreatGains(board, deadline).some(item => item.level >= 5);
  board[idx] = '';
  return bad;
}

function tttV957PickHumanGainBlock(board, entries, deadline) {
  const filtered = (entries || []).filter(item => item && Number.isFinite(Number(item.idx)) && item.idx >= 0 && item.idx < board.length && !board[item.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const item of filtered) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const idx = Number(item.idx);
    board[idx] = 'O';
    const ownWins = tttV958WinningMovesFast(board, 'O').length;
    const ownFours = tttV956ThreatDefenseMoves(board, 'O', 5).length;
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const xFours = tttV956ThreatDefenseMoves(board, 'X', 5).length;
    const xOpen = tttV956OpenThreeDefenseMoves(board, 'X').length;
    const xNext = tttV957HumanNextThreatGains(board, deadline).filter(g => g.level >= 5).length;
    const evalScore = tttV955Evaluate(board);
    board[idx] = '';
    const risk = xWins * 1000000000 + xFours * 160000000 + xOpen * 14000000 + xNext * 70000000;
    const score = -risk
      + Number(item.level || 0) * 50000000
      + Number(item.hits || 0) * 7000000
      + ownWins * 900000000
      + ownFours * 90000000
      + evalScore * 0.35
      + tttCheapMovePotential(board, idx, 'X') * 2.2
      + tttCheapMovePotential(board, idx, 'O') * 1.1
      + tttV954CenterScore(idx) * 800;
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV956BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const start = tttEngineNow();
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 300 : 95);
  const deadline = start + hardBudget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) return tttV956PickDefenseMove(board, xWins.map(idx => ({ idx, hits: 99, level: 7, types: ['win-block'] })), deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  // Four-in-row and direct five-window threats are forcing. Do not let scoring choose a nearby but wrong square.
  const xFourDefense = tttV956ThreatDefenseMoves(board, 'X', 5);
  if (xFourDefense.length) {
    const block = tttV956PickDefenseMove(board, xFourDefense, deadline);
    if (block >= 0) return block;
  }

  // The bug from v955: contiguous open three must be blocked on one of its two real ends,
  // not one square further away. This is a hard tactical guard before positional scoring.
  const xOpenThreeEntries = tttV956OpenThreeDefenseMoves(board, 'X').map(idx => ({ idx, hits: 1, level: 3, types: ['open-three-end'] }));
  if (xOpenThreeEntries.length) {
    const block = tttV956PickDefenseMove(board, xOpenThreeEntries, deadline);
    if (block >= 0) return block;
  }

  const ownForcing = tttV955ThreatMoves(board, 'O', 5);
  if (ownForcing.length) {
    const move = tttV955PickBestFrom(board, ownForcing.map(x => x.idx), 'O', deadline);
    if (move >= 0 && !tttV956MoveLeavesMajorHumanThreat(board, move)) return move;
  }

  const xBrokenOrWindowThree = tttV956ThreatDefenseMoves(board, 'X', 2);
  if (xBrokenOrWindowThree.length && occupied >= 7) {
    const block = tttV956PickDefenseMove(board, xBrokenOrWindowThree.slice(0, 16), deadline);
    if (block >= 0) {
      board[block] = 'O';
      const stillBad = tttWinningMoves(board, 'X').length + tttV956ThreatDefenseMoves(board, 'X', 5).length;
      board[block] = '';
      if (!stillBad) return block;
    }
  }

  const previous = tttV955BestMove(board, difficulty || 'ai');
  if (Number.isFinite(Number(previous)) && previous >= 0 && previous < board.length && !board[previous] && !tttV956MoveLeavesMajorHumanThreat(board, previous)) return previous;

  const safeCandidates = tttV955CandidateSet(board, deadline).slice(0, occupied < 18 ? 30 : 22);
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of safeCandidates) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    if (tttV956MoveLeavesMajorHumanThreat(board, idx)) continue;
    const score = tttV955MoveScore(board, idx, deadline);
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  if (best >= 0) return best;
  const emergencyBlock = tttV956PickDefenseMove(board, tttV956ThreatDefenseMoves(board, 'X', 1).slice(0, 20), deadline);
  if (emergencyBlock >= 0) return emergencyBlock;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV956Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    openThreeEndpointGuard: true,
    wrongAdjacentBlockGuard: true,
    freezeGuard: true,
    onlinePvPUnchanged: true,
    note: 'v956 přidává přímou detekci endpointů otevřených trojek a brání je před pozičním skórováním, aby AI neblokovala o pole vedle.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV956Health = getRakGomokuAiV956Health;
  window.getRakGomokuAiV955Health = getRakGomokuAiV956Health;
}


function getRakGomokuAiV957Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    diagonalGainPrevention: true,
    openThreeEndpointGuard: true,
    humanNextThreatGainGuard: true,
    freezeGuard: true,
    onlinePvPUnchanged: true,
    note: 'v957 blokuje nejen hotovou otevřenou trojku, ale i lidský gain tah, který by příštím tahem vytvořil čtyřku/fork/diagonální forcing.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV957Health = getRakGomokuAiV957Health;
  window.getRakGomokuAiV956Health = getRakGomokuAiV957Health;
  window.getRakGomokuAiV955Health = getRakGomokuAiV957Health;
}



// v.1.5 (963) – Piškvorky AI: tvrdší diagonální threat engine pro 10×19 bez zaseknutí.
function tttV958Dirs() {
  return [[0,1],[1,0],[1,1],[1,-1]];
}

function tttV958SafeIndex(row, col) {
  return tttInBounds(row, col) ? tttIndex(row, col) : -1;
}

function tttV958OccupiedCount(board) {
  let count = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) count += 1;
  return count;
}

function tttV958CenterScore(idx) {
  const row = Math.floor(idx / TTT_COLS);
  const col = idx % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return 1000 - (Math.abs(row - centerRow) * 46 + Math.abs(col - centerCol) * 64);
}

function tttV958CandidateSet(board, radius) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) if (board[i]) occupied.push(i);
  if (!occupied.length) {
    const preferred = [tttIndex(9, 4), tttIndex(9, 5), tttIndex(10, 4), tttIndex(8, 4)];
    return preferred.filter(idx => idx >= 0 && idx < board.length && !board[idx]);
  }
  const out = new Set();
  const rMax = Number(radius || 2) || 2;
  for (const idx of occupied) {
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    for (let dr = -rMax; dr <= rMax; dr += 1) {
      for (let dc = -rMax; dc <= rMax; dc += 1) {
        const nr = row + dr;
        const nc = col + dc;
        if (!tttInBounds(nr, nc)) continue;
        const next = tttIndex(nr, nc);
        if (!board[next]) out.add(next);
      }
    }
  }
  return Array.from(out);
}

function tttV958WinningMovesFast(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const moves = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV958Dirs()) {
        const dr = dir[0], dc = dir[1];
        let own = 0;
        let empty = -1;
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const idx = tttV958SafeIndex(row + dr * step, col + dc * step);
          if (idx < 0) { ok = false; break; }
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) own += 1;
          else if (!cell) {
            if (empty >= 0) { ok = false; break; }
            empty = idx;
          }
        }
        if (ok && own === TTT_WIN_LENGTH - 1 && empty >= 0) moves.add(empty);
      }
    }
  }
  return Array.from(moves);
}

function tttV958WindowThreatEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const entries = [];
  const seen = new Map();
  const add = (idx, level, type, dir, hits) => {
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return;
    const prev = seen.get(idx) || { idx, level: 0, hits: 0, types: [], diagonal: false };
    prev.level = Math.max(prev.level, level);
    prev.hits += hits || 1;
    if (prev.types.indexOf(type) < 0) prev.types.push(type);
    if (dir && Math.abs(dir[0]) === 1 && Math.abs(dir[1]) === 1) prev.diagonal = true;
    seen.set(idx, prev);
  };

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV958Dirs()) {
        const dr = dir[0], dc = dir[1];
        for (const size of [5, 6]) {
          const cells = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const idx = tttV958SafeIndex(row + dr * step, col + dc * step);
            if (idx < 0) { ok = false; break; }
            cells.push(idx);
          }
          if (!ok) continue;
          let own = 0, opp = 0;
          const empties = [];
          let pattern = '';
          for (const idx of cells) {
            if (board[idx] === mark) { own += 1; pattern += 'M'; }
            else if (board[idx] === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (opp > 0 || own < 2 || !empties.length) continue;

          // Four in a five-window: the empty square is an immediate win next turn.
          if (size === 5 && own === 4 && empties.length === 1) add(empties[0], 7, 'simple-four', dir, 6);

          // Exact contiguous open three: .MMM. – block only real endpoints, never one square farther.
          if (pattern.indexOf('.MMM.') >= 0) {
            const start = pattern.indexOf('.MMM.');
            add(cells[start], 5, 'open-three-end', dir, 4);
            add(cells[start + 4], 5, 'open-three-end', dir, 4);
          }

          // Broken/split three windows. These are especially dangerous diagonally on 10×19.
          const broken = ['.MM.M.', '.M.MM.', 'MM.M.', '.M.MM', 'M.MM.', '.MM.M', 'M.M.M', 'MM..M', 'M..MM'];
          if (own === 3 && empties.length >= 2) {
            for (const pat of broken) {
              if (pattern.indexOf(pat) >= 0) {
                empties.forEach(idx => add(idx, 4, 'broken-three', dir, 2));
                break;
              }
            }
          }

          // Clean three in a five/six window, lower than exact .MMM. but still worth blocking early.
          if (own === 3 && empties.length >= 2) {
            empties.forEach(idx => add(idx, 3, 'window-three', dir, 1));
          }
        }
      }
    }
  }

  seen.forEach(item => entries.push(item));
  return entries.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (b.idx - a.idx));
}

function tttV958ThreatGainEntries(board, mark, deadline) {
  const occupied = tttV958OccupiedCount(board);
  const pool = new Set(tttV958CandidateSet(board, occupied < 12 ? 3 : 2));
  tttV958WindowThreatEntries(board, mark).forEach(e => pool.add(e.idx));
  const out = [];
  for (const idxRaw of pool) {
    if (deadline && tttEngineNow() > deadline - 12 && out.length) break;
    const idx = Number(idxRaw);
    if (!Number.isFinite(idx) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark ? 1 : 0;
    const wins = tttV958WinningMovesFast(board, mark).length;
    const windowThreats = tttV958WindowThreatEntries(board, mark);
    const severe = windowThreats.filter(e => e.level >= 5).length;
    const open = windowThreats.filter(e => e.types && e.types.indexOf('open-three-end') >= 0).length;
    const diagonal = windowThreats.some(e => e.diagonal && e.level >= 4) ? 1 : 0;
    board[idx] = '';
    let level = 0;
    if (winNow) level = 10;
    else if (wins >= 2) level = 9;
    else if (wins === 1) level = 7;
    else if (severe >= 2) level = 6;
    else if (severe === 1) level = 5;
    else if (open >= 2 || diagonal) level = 4;
    else if (open >= 1) level = 3;
    if (level < 3) continue;
    out.push({
      idx,
      level,
      hits: wins * 5 + severe * 3 + open + diagonal,
      diagonal: !!diagonal,
      types: ['gain'],
      score: level * 100000000 + wins * 20000000 + severe * 4000000 + open * 800000 + diagonal * 500000 + tttV958CenterScore(idx)
    });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || (b.score - a.score) || (a.idx - b.idx));
}

function tttV958StaticScore(board) {
  const winner = tttWinner(board).winner;
  if (winner === 'O') return 1000000000;
  if (winner === 'X') return -1000000000;
  const oThreats = tttV958WindowThreatEntries(board, 'O');
  const xThreats = tttV958WindowThreatEntries(board, 'X');
  const oGain = tttV958ThreatGainEntries(board, 'O').slice(0, 10);
  const xGain = tttV958ThreatGainEntries(board, 'X').slice(0, 10);
  let score = 0;
  for (const e of oThreats) score += Math.pow(8, e.level) * (e.hits || 1) * (e.diagonal ? 1.08 : 1);
  for (const e of xThreats) score -= Math.pow(8, e.level) * (e.hits || 1) * (e.diagonal ? 1.18 : 1) * 1.22;
  for (const e of oGain) score += Math.pow(9, e.level) * 0.65;
  for (const e of xGain) score -= Math.pow(9, e.level) * 1.05;
  score += (tttV955LineWindowScore(board, 'O') - tttV955LineWindowScore(board, 'X') * 1.18) * 0.04;
  return score;
}

function tttV958MoveRiskAfterO(board, deadline) {
  if (tttV958WinningMovesFast(board, 'X').length) return 10000000000;
  const xGain = tttV958ThreatGainEntries(board, 'X', deadline);
  const xWindow = tttV958WindowThreatEntries(board, 'X');
  let risk = 0;
  for (const e of xGain.slice(0, 12)) risk += Math.pow(11, e.level) * (e.hits || 1) * (e.diagonal ? 1.45 : 1);
  for (const e of xWindow.slice(0, 16)) risk += Math.pow(8, e.level) * (e.hits || 1) * (e.diagonal ? 1.55 : 1);
  return risk;
}

function tttV958PickSimpleBlock(board, entries) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 12)) {
    const idx = Number(e.idx);
    board[idx] = 'O';
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const ownWins = tttV958WinningMovesFast(board, 'O').length;
    const score = -xWins * 1000000000
      + ownWins * 700000000
      + Number(e.level || 0) * 1000000
      + Number(e.hits || 0) * 120000
      + tttCheapMovePotential(board, idx, 'X') * 850
      + tttCheapMovePotential(board, idx, 'O') * 500
      + tttV958CenterScore(idx) * 300;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV958PickBlockFast(board, entries) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 18)) {
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const xCritical = tttV958WindowThreatEntries(board, 'X').filter(t => t.level >= 5).length;
    const score = ownWin * 10000000000
      - xWins * 1000000000
      - xCritical * 60000000
      + Number(e.level || 0) * 18000000
      + Number(e.hits || 0) * 2500000
      + (e.diagonal ? 2000000 : 0)
      + tttCheapMovePotential(board, idx, 'X') * 600
      + tttCheapMovePotential(board, idx, 'O') * 350
      + tttV958CenterScore(idx) * 400;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV958PickBlock(board, entries, deadline) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 24)) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const risk = tttV958MoveRiskAfterO(board, deadline);
    const ownGain = tttV958ThreatGainEntries(board, 'O', deadline)[0];
    const score = -risk
      + ownWin * 10000000000
      + Number(e.level || 0) * 250000000
      + Number(e.hits || 0) * 22000000
      + (e.diagonal ? 18000000 : 0)
      + (ownGain ? ownGain.score * 0.4 : 0)
      + tttV958StaticScore(board) * 0.12
      + tttV958CenterScore(idx) * 800;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV958TopHumanReplies(board, deadline) {
  const occupied = tttV958OccupiedCount(board);
  const pool = new Set(tttV958CandidateSet(board, occupied < 16 ? 3 : 2));
  tttWinningMoves(board, 'X').forEach(idx => pool.add(idx));
  tttV958ThreatGainEntries(board, 'X', deadline).forEach(e => pool.add(e.idx));
  tttV958WindowThreatEntries(board, 'X').forEach(e => pool.add(e.idx));
  const scored = [];
  for (const idxRaw of pool) {
    const idx = Number(idxRaw);
    if (!Number.isFinite(idx) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const score = (tttWinner(board).winner === 'X' ? 10000000000 : 0)
      + tttV958MoveRiskAfterO(board, deadline)
      - tttV958StaticScore(board) * 0.25
      + tttCheapMovePotential(board, idx, 'X') * 800
      + tttV958CenterScore(idx);
    board[idx] = '';
    scored.push({ idx, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10).map(x => x.idx);
}

function tttV958MoveScore(board, idx, deadline) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return -Infinity;
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 10000000000; }
  const immediateRisk = tttV958MoveRiskAfterO(board, deadline);
  let worstReplyScore = Infinity;
  const replies = tttV958TopHumanReplies(board, deadline);
  if (!replies.length) worstReplyScore = tttV958StaticScore(board);
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 8 && Number.isFinite(worstReplyScore)) break;
    if (board[reply]) continue;
    board[reply] = 'X';
    const s = tttWinner(board).winner === 'X' ? -10000000000 : tttV958StaticScore(board);
    board[reply] = '';
    if (s < worstReplyScore) worstReplyScore = s;
  }
  const ownGain = tttV958ThreatGainEntries(board, 'O', deadline)[0];
  const score = -immediateRisk * 1.35
    + worstReplyScore * 0.82
    + (ownGain ? ownGain.score * 0.55 : 0)
    + tttV958StaticScore(board) * 0.35
    + tttCheapMovePotential(board, idx, 'O') * 950
    + tttCheapMovePotential(board, idx, 'X') * 1200
    + tttV958CenterScore(idx) * 900;
  board[idx] = '';
  return score;
}

function tttV958BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 340 : 115);
  const deadline = tttEngineNow() + hardBudget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) {
    const block = tttV958PickBlockFast(board, xWins.map(idx => ({ idx, level: 10, hits: 99, types: ['immediate-win-block'] })));
    if (block >= 0) return block;
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const quickFourBlocks = tttV956ThreatDefenseMoves(board, 'X', 5);
  if (quickFourBlocks.length) {
    const block = tttV958PickSimpleBlock(board, quickFourBlocks);
    if (block >= 0) return block;
  }

  const quickOpenThreeBlocks = tttV956OpenThreeDefenseMoves(board, 'X').map(idx => ({ idx, level: 5, hits: 6, diagonal: false, types: ['quick-open-three'] }));
  if (quickOpenThreeBlocks.length) {
    const block = tttV958PickSimpleBlock(board, quickOpenThreeBlocks);
    if (block >= 0) return block;
  }

  const currentHumanThreats = tttV958WindowThreatEntries(board, 'X').filter(e => e.level >= 4 || e.diagonal);
  if (currentHumanThreats.length) {
    const block = tttV958PickBlockFast(board, currentHumanThreats);
    if (block >= 0) return block;
  }

  const ownKiller = tttV958ThreatGainEntries(board, 'O', deadline).filter(e => e.level >= 9);
  if (ownKiller.length) return ownKiller[0].idx;

  const humanGain = tttV958ThreatGainEntries(board, 'X', deadline).filter(e => e.level >= 5);
  if (humanGain.length) {
    const block = tttV958PickBlock(board, humanGain, deadline);
    if (block >= 0) return block;
  }

  const ownStrong = tttV958ThreatGainEntries(board, 'O', deadline).filter(e => e.level >= 6);
  if (ownStrong.length) {
    const move = ownStrong[0].idx;
    board[move] = 'O';
    const risk = tttV958MoveRiskAfterO(board, deadline);
    board[move] = '';
    if (risk < 250000000) return move;
  }

  const pool = new Set(tttV958CandidateSet(board, occupied < 16 ? 3 : 2));
  tttV958ThreatGainEntries(board, 'O', deadline).forEach(e => pool.add(e.idx));
  tttV958ThreatGainEntries(board, 'X', deadline).forEach(e => pool.add(e.idx));
  tttV958WindowThreatEntries(board, 'X').forEach(e => pool.add(e.idx));
  let candidates = Array.from(pool).filter(idx => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
  const maxRoot = occupied < 20 ? 26 : 18;
  candidates = candidates
    .map(idx => ({ idx, quick: tttCheapMovePotential(board, idx, 'O') * 1.4 + tttCheapMovePotential(board, idx, 'X') * 1.9 + tttV958CenterScore(idx) }))
    .sort((a, b) => b.quick - a.quick)
    .slice(0, Math.max(maxRoot, 14))
    .map(item => item.idx);

  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const score = tttV958MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  if (best >= 0) return best;
  const emergency = tttV958PickBlock(board, tttV958WindowThreatEntries(board, 'X').concat(tttV958ThreatGainEntries(board, 'X', deadline)), deadline);
  if (emergency >= 0) return emergency;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV958Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    diagonalThreatGuard: true,
    exactOpenThreeEndpointGuard: true,
    humanGainPrevention: true,
    boundedDeadlineMs: true,
    onlinePvPUnchanged: true,
    note: 'v958 přidává samostatnou diagonální threat pipeline: nečeká na hotovou čtyřku, blokuje gain tahy a exact endpointy otevřených trojek před pozičním skórováním.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV958Health = getRakGomokuAiV958Health;
  window.getRakGomokuAiV957Health = getRakGomokuAiV958Health;
  window.getRakGomokuAiV956Health = getRakGomokuAiV958Health;
}



// v.1.5 (963) – Piškvorky AI: tvrdší line-window obrana, hlavně proti diagonálním build-upům.
function tttV959Directions() {
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
}

function tttV959CellRow(idx) { return Math.floor(Number(idx) / TTT_COLS); }
function tttV959CellCol(idx) { return Number(idx) % TTT_COLS; }

function tttV959CenterScore(idx) {
  const row = tttV959CellRow(idx);
  const col = tttV959CellCol(idx);
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return 1200 - (Math.abs(row - centerRow) * 48 + Math.abs(col - centerCol) * 68);
}

function tttV959CountOccupied(board) {
  let n = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) n += 1;
  return n;
}

function tttV959CandidateSet(board, radius) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) if (board[i]) occupied.push(i);
  if (!occupied.length) {
    return [tttIndex(9, 4), tttIndex(9, 5), tttIndex(10, 4), tttIndex(8, 4)].filter(idx => idx >= 0 && idx < board.length && !board[idx]);
  }
  const out = new Set();
  const rMax = Number(radius || 2) || 2;
  for (const idx of occupied) {
    const row = tttV959CellRow(idx);
    const col = tttV959CellCol(idx);
    for (let dr = -rMax; dr <= rMax; dr += 1) {
      for (let dc = -rMax; dc <= rMax; dc += 1) {
        const rr = row + dr;
        const cc = col + dc;
        if (!tttInBounds(rr, cc)) continue;
        const next = tttIndex(rr, cc);
        if (!board[next]) out.add(next);
      }
    }
  }
  return Array.from(out);
}

function tttV959WindowDefenseEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const map = new Map();
  const add = (idx, level, hits, kind, diagonal, dir, centerBias) => {
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return;
    const prev = map.get(idx) || { idx, level: 0, hits: 0, diagonal: false, kinds: [], dirs: [], centerBias: 0 };
    prev.level = Math.max(prev.level, level || 0);
    prev.hits += Number(hits || 1) || 1;
    prev.centerBias += Number(centerBias || 0) || 0;
    if (diagonal) prev.diagonal = true;
    if (kind && prev.kinds.indexOf(kind) < 0) prev.kinds.push(kind);
    if (dir) {
      const sig = String(dir[0]) + ',' + String(dir[1]);
      if (prev.dirs.indexOf(sig) < 0) prev.dirs.push(sig);
    }
    map.set(idx, prev);
  };

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV959Directions()) {
        const dr = dir[0];
        const dc = dir[1];
        for (const size of [5, 6, 7]) {
          const cells = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const rr = row + dr * step;
            const cc = col + dc * step;
            if (!tttInBounds(rr, cc)) { ok = false; break; }
            cells.push(tttIndex(rr, cc));
          }
          if (!ok) continue;
          let own = 0;
          let opp = 0;
          const empties = [];
          let pattern = '';
          for (const idx of cells) {
            const cell = board[idx];
            if (cell === mark) { own += 1; pattern += 'M'; }
            else if (cell === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (opp || own < 2 || !empties.length) continue;
          const diagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
          const lineCenter = (cells.length - 1) / 2;
          const addAll = (level, hits, kind) => {
            empties.forEach(emptyIdx => {
              const pos = cells.indexOf(emptyIdx);
              add(emptyIdx, level, hits, kind, diagonal, dir, Math.max(0, 5 - Math.abs(pos - lineCenter)));
            });
          };

          // 4 in 5 is a direct next-move win. It must be blocked before any scoring.
          if (size === 5 && own === 4 && empties.length === 1) {
            add(empties[0], 10, 40, 'four-in-five', diagonal, dir, 10);
            continue;
          }

          // Exact .MMM. endpoint threat. Only the real endpoints are tactical blocks.
          let pos = pattern.indexOf('.MMM.');
          while (pos >= 0) {
            add(cells[pos], 8, 22, 'open-three-end', diagonal, dir, 8);
            add(cells[pos + 4], 8, 22, 'open-three-end', diagonal, dir, 8);
            pos = pattern.indexOf('.MMM.', pos + 1);
          }

          // Split/broken threes create the same practical issue Martin saw: AI blocks near it, but not on the needed square.
          const brokenPatterns = ['.MM.M.', '.M.MM.', 'MM.M.', '.M.MM', 'M.MM.', '.MM.M', 'M.M.M', 'MM..M', 'M..MM', '.M.M.', 'M.M.'];
          if (own >= 3 && empties.length >= 2) {
            let broken = false;
            for (const pat of brokenPatterns) {
              if (pattern.indexOf(pat) >= 0) { broken = true; break; }
            }
            if (broken) addAll(diagonal ? 7 : 6, diagonal ? 16 : 12, diagonal ? 'diagonal-broken-three' : 'broken-three');
          }

          // Any 3 in an unblocked 5-window is dangerous. Diagonal ones are deliberately treated higher.
          if (size === 5 && own === 3 && empties.length === 2) {
            addAll(diagonal ? 7 : 5, diagonal ? 14 : 9, diagonal ? 'diagonal-three-window' : 'three-window');
          }

          // Diagonal build-up: on 10×19 it is easy to miss long diagonals early, so block 2+ stones in clean diagonal windows sooner.
          if (diagonal && own === 2 && empties.length >= 3) {
            addAll(3, 3, 'diagonal-two-window');
          }
          if (diagonal && own >= 3 && size >= 6) {
            addAll(6, 10, 'diagonal-long-threat');
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.level - a.level) ||
    (b.hits - a.hits) ||
    ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) ||
    (b.centerBias - a.centerBias) ||
    (tttV959CenterScore(b.idx) - tttV959CenterScore(a.idx)) ||
    (a.idx - b.idx)
  );
}

function tttV959HumanThreatScore(board, deadline) {
  if (tttWinningMoves(board, 'X').length) return 1e14;
  const threats = tttV959WindowDefenseEntries(board, 'X');
  let score = 0;
  for (const t of threats.slice(0, 28)) {
    score += Math.pow(12, Number(t.level || 0)) * (Number(t.hits || 1) || 1) * (t.diagonal ? 1.7 : 1);
  }
  // Also evaluate the best human gain move: if X can make a strong diagonal next, this move is unsafe.
  const occupied = tttV959CountOccupied(board);
  const pool = new Set(tttV959CandidateSet(board, occupied < 18 ? 3 : 2));
  threats.slice(0, 24).forEach(t => pool.add(t.idx));
  let checked = 0;
  for (const idx of pool) {
    if (deadline && tttEngineNow() > deadline - 6 && checked > 8) break;
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const wins = tttWinningMoves(board, 'X').length;
    const nextThreats = tttV959WindowDefenseEntries(board, 'X');
    board[idx] = '';
    if (wins >= 2) score += 8e12;
    else if (wins === 1) score += 2.8e12;
    if (nextThreats.length) {
      const top = nextThreats[0];
      if (top.level >= 8) score += 1.6e12;
      else if (top.level >= 6) score += 2.8e11 * (top.diagonal ? 1.65 : 1);
    }
    checked += 1;
  }
  return score;
}

function tttV959PickDefense(board, entries, deadline) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 32)) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const risk = tttV959HumanThreatScore(board, deadline);
    const ownThreat = tttV959WindowDefenseEntries(board, 'O')[0];
    const score = ownWin * 1e15
      - risk * 2.2
      + Number(e.level || 0) * 7e10
      + Number(e.hits || 0) * 3e9
      + (e.diagonal ? 2.4e10 : 0)
      + (ownThreat ? Number(ownThreat.level || 0) * 6e8 + Number(ownThreat.hits || 0) * 1e8 : 0)
      + tttCheapMovePotential(board, idx, 'X') * 2600
      + tttCheapMovePotential(board, idx, 'O') * 1600
      + tttV959CenterScore(idx) * 900;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV959MoveScore(board, idx, deadline) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return -Infinity;
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 1e15; }
  const risk = tttV959HumanThreatScore(board, deadline);
  const ownThreats = tttV959WindowDefenseEntries(board, 'O');
  const ownTop = ownThreats[0];
  let score = -risk * 2.8
    + (ownTop ? Number(ownTop.level || 0) * 4.8e10 + Number(ownTop.hits || 0) * 1.2e9 + (ownTop.diagonal ? 6e8 : 0) : 0)
    + tttCheapMovePotential(board, idx, 'O') * 2400
    + tttCheapMovePotential(board, idx, 'X') * 3200
    + tttV959CenterScore(idx) * 1300;
  const replies = tttV959WindowDefenseEntries(board, 'X').slice(0, 8).map(e => e.idx);
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 6) break;
    if (!Number.isFinite(Number(reply)) || board[reply]) continue;
    board[reply] = 'X';
    score -= tttV959HumanThreatScore(board, deadline) * 0.32;
    board[reply] = '';
  }
  board[idx] = '';
  return score;
}

function tttV959BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const budget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 420 : 135);
  const deadline = tttEngineNow() + budget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) {
    const block = tttV959PickDefense(board, xWins.map(idx => ({ idx, level: 12, hits: 99, diagonal: false, kinds: ['immediate-win-block'] })), deadline);
    if (block >= 0) return block;
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  // Defensive priority is intentionally earlier than speculative attack. This addresses wins around move 11–25.
  const xDirect = tttV959WindowDefenseEntries(board, 'X');
  const mustBlock = xDirect.filter(e => e.level >= 6 || (e.diagonal && e.level >= 3));
  if (mustBlock.length) {
    const block = tttV959PickDefense(board, mustBlock, deadline);
    if (block >= 0) return block;
  }

  // If X has a move that creates a forced win/fork next turn, occupy that gain square now if possible.
  const occupiedAfterDirect = tttV959CountOccupied(board);
  const gainPool = new Set(tttV959CandidateSet(board, occupiedAfterDirect < 18 ? 3 : 2));
  xDirect.slice(0, 18).forEach(e => gainPool.add(e.idx));
  const gainEntries = [];
  for (const idx of gainPool) {
    if (deadline && tttEngineNow() > deadline - 12 && gainEntries.length) break;
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const wins = tttWinningMoves(board, 'X').length;
    const threats = tttV959WindowDefenseEntries(board, 'X');
    const top = threats[0] || null;
    board[idx] = '';
    const level = wins >= 2 ? 11 : wins === 1 ? 9 : top ? Number(top.level || 0) : 0;
    const diagonal = !!(top && top.diagonal);
    if (level >= 6 || (diagonal && level >= 4)) {
      gainEntries.push({ idx, level, hits: wins * 20 + (top ? Number(top.hits || 0) : 0), diagonal, kinds: ['human-gain'] });
    }
  }
  gainEntries.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (a.idx - b.idx));
  if (gainEntries.length) {
    const block = tttV959PickDefense(board, gainEntries, deadline);
    if (block >= 0) return block;
  }

  const ownThreat = tttV959WindowDefenseEntries(board, 'O');
  const ownStrong = ownThreat.filter(e => e.level >= 8);
  if (ownStrong.length) {
    const attack = tttV959PickDefense(board, ownStrong, deadline);
    if (attack >= 0) {
      board[attack] = 'O';
      const risk = tttV959HumanThreatScore(board, deadline);
      board[attack] = '';
      if (risk < 4.5e11) return attack;
    }
  }

  const pool = new Set(tttV959CandidateSet(board, occupied < 18 ? 3 : 2));
  xDirect.slice(0, 24).forEach(e => pool.add(e.idx));
  ownThreat.slice(0, 18).forEach(e => pool.add(e.idx));
  let candidates = Array.from(pool).filter(idx => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
  candidates = candidates
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'O') * 1.1 + tttCheapMovePotential(board, idx, 'X') * 2.8 + tttV959CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 18 ? 30 : 22)
    .map(item => item.idx);

  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const score = tttV959MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  if (best >= 0) return best;

  const emergency = tttV959PickDefense(board, tttV959WindowDefenseEntries(board, 'X'), deadline);
  if (emergency >= 0) return emergency;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV959Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    rulesetVersion: GOMOKU_RULESET_VERSION,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    lineWindowDefense: true,
    diagonalBuildUpGuard: true,
    humanGainPrevention: true,
    hardFallback: true,
    onlinePvPUnchanged: true,
    note: 'v959 přidává tvrdší line-window obranu a blokuje diagonální build-up dřív, než z něj vznikne čtyřka nebo výhra.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV959Health = getRakGomokuAiV959Health;
  window.getRakGomokuAiV958Health = getRakGomokuAiV959Health;
}

function tttBestMove(board, difficulty) {
  const v959 = typeof tttV959BestMove === 'function' ? tttV959BestMove(board, difficulty || 'ai') : -1;
  if (Number.isFinite(Number(v959)) && v959 >= 0 && v959 < board.length && !board[v959]) return v959;
  const safe = typeof tttV958BestMove === 'function' ? tttV958BestMove(board, difficulty || 'ai') : -1;
  if (Number.isFinite(Number(safe)) && safe >= 0 && safe < board.length && !board[safe]) return safe;
  const prev = tttV956BestMove(board, difficulty || 'ai');
  if (Number.isFinite(Number(prev)) && prev >= 0 && prev < board.length && !board[prev]) return prev;
  const win = tttWinningMove(board, 'O');
  if (win >= 0) return win;
  const block = tttWinningMove(board, 'X');
  if (block >= 0) return block;
  return tttNearestCenterFallbackMove(board);
}


// v.1.5 (963) – Piškvorky AI: deterministic tactical engine smoke-tested locally.
// Cíl: žádné zaseknutí a nepřehlédnout diagonální/open-three/four hrozby.
function tttV960Dirs() {
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
}
function tttV960Row(idx) { return Math.floor(Number(idx) / TTT_COLS); }
function tttV960Col(idx) { return Number(idx) % TTT_COLS; }
function tttV960CenterScore(idx) {
  const r = tttV960Row(idx);
  const c = tttV960Col(idx);
  const cr = (TTT_ROWS - 1) / 2;
  const cc = (TTT_COLS - 1) / 2;
  return 10000 - (Math.abs(r - cr) * 360 + Math.abs(c - cc) * 520);
}
function tttV960Occupied(board) {
  let n = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) n += 1;
  return n;
}
function tttV960Legal(board, idx) {
  return Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx];
}
function tttV960CandidateSet(board, radius) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) if (board[i]) occupied.push(i);
  if (!occupied.length) return [tttIndex(9, 4), tttIndex(9, 5), tttIndex(8, 4), tttIndex(10, 5)].filter(idx => tttV960Legal(board, idx));
  const out = new Set();
  const rMax = Math.max(1, Number(radius || 2) || 2);
  for (const idx of occupied) {
    const row = tttV960Row(idx);
    const col = tttV960Col(idx);
    for (let dr = -rMax; dr <= rMax; dr += 1) {
      for (let dc = -rMax; dc <= rMax; dc += 1) {
        const rr = row + dr;
        const cc = col + dc;
        if (!tttInBounds(rr, cc)) continue;
        const next = tttIndex(rr, cc);
        if (!board[next]) out.add(next);
      }
    }
  }
  return Array.from(out);
}
function tttV960WinningMoves(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const moves = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV960Dirs()) {
        const dr = dir[0];
        const dc = dir[1];
        let own = 0;
        let empty = -1;
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const rr = row + dr * step;
          const cc = col + dc * step;
          if (!tttInBounds(rr, cc)) { ok = false; break; }
          const idx = tttIndex(rr, cc);
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) own += 1;
          else if (!cell) {
            if (empty >= 0) { ok = false; break; }
            empty = idx;
          }
        }
        if (ok && own === TTT_WIN_LENGTH - 1 && empty >= 0) moves.add(empty);
      }
    }
  }
  return Array.from(moves).sort((a, b) => tttV960CenterScore(b) - tttV960CenterScore(a));
}
function tttV960AddEntry(map, board, idx, level, hits, kind, dir, endpointOnly) {
  if (!tttV960Legal(board, idx)) return;
  const diagonal = !!(dir && Math.abs(dir[0]) === 1 && Math.abs(dir[1]) === 1);
  const prev = map.get(idx) || { idx, level: 0, hits: 0, kinds: [], diagonal: false, endpoint: false };
  prev.level = Math.max(prev.level, Number(level || 0) || 0);
  prev.hits += Number(hits || 1) || 1;
  prev.diagonal = prev.diagonal || diagonal;
  prev.endpoint = prev.endpoint || !!endpointOnly;
  if (kind && prev.kinds.indexOf(kind) < 0) prev.kinds.push(kind);
  map.set(idx, prev);
}
function tttV960ThreatEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const map = new Map();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV960Dirs()) {
        const dr = dir[0], dc = dir[1];
        for (const size of [5, 6, 7]) {
          const cells = [];
          let pattern = '';
          let own = 0;
          let opp = 0;
          const empties = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const rr = row + dr * step;
            const cc = col + dc * step;
            if (!tttInBounds(rr, cc)) { ok = false; break; }
            const idx = tttIndex(rr, cc);
            cells.push(idx);
            const cell = board[idx];
            if (cell === mark) { own += 1; pattern += 'M'; }
            else if (cell === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (!ok || opp || own < 2 || !empties.length) continue;
          const diagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
          const addAll = (level, hits, kind) => empties.forEach(idx => tttV960AddEntry(map, board, idx, level + (diagonal ? 1 : 0), hits, kind, dir, false));
          if (size === 5 && own === 4 && empties.length === 1) {
            tttV960AddEntry(map, board, empties[0], 100, 120, 'four-in-five', dir, true);
            continue;
          }
          let pos = pattern.indexOf('.MMM.');
          while (pos >= 0) {
            tttV960AddEntry(map, board, cells[pos], diagonal ? 78 : 74, 52, 'open-three-end', dir, true);
            tttV960AddEntry(map, board, cells[pos + 4], diagonal ? 78 : 74, 52, 'open-three-end', dir, true);
            pos = pattern.indexOf('.MMM.', pos + 1);
          }
          const broken = ['.MM.M.', '.M.MM.', 'MM.M.', '.M.MM', 'M.MM.', '.MM.M', 'M.M.M', 'MM..M', 'M..MM', '.M.M.', 'M.M.'];
          if (own >= 3 && empties.length >= 2) {
            for (const pat of broken) {
              if (pattern.indexOf(pat) >= 0) {
                addAll(diagonal ? 70 : 62, diagonal ? 34 : 24, diagonal ? 'diagonal-broken-three' : 'broken-three');
                break;
              }
            }
          }
          if (size === 5 && own === 3 && empties.length === 2) addAll(diagonal ? 68 : 55, diagonal ? 28 : 18, diagonal ? 'diagonal-three-window' : 'three-window');
          if (diagonal && own === 2 && empties.length >= 3) addAll(30, 4, 'diagonal-two-window');
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    (b.level - a.level) || (b.hits - a.hits) || ((b.endpoint ? 1 : 0) - (a.endpoint ? 1 : 0)) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (tttV960CenterScore(b.idx) - tttV960CenterScore(a.idx)) || (a.idx - b.idx)
  );
}
function tttV960GainEntries(board, mark, deadline) {
  const occupied = tttV960Occupied(board);
  const pool = new Set(tttV960CandidateSet(board, occupied < 14 ? 3 : 2));
  tttV960ThreatEntries(board, mark).slice(0, 24).forEach(e => pool.add(e.idx));
  const out = [];
  for (const raw of pool) {
    if (deadline && tttEngineNow() > deadline - 14 && out.length) break;
    const idx = Number(raw);
    if (!tttV960Legal(board, idx)) continue;
    board[idx] = mark;
    const wins = tttV960WinningMoves(board, mark).length;
    const threats = tttV960ThreatEntries(board, mark);
    const top = threats[0] || null;
    board[idx] = '';
    const topLevel = top ? Number(top.level || 0) : 0;
    let level = 0;
    if (wins >= 2) level = 100;
    else if (wins === 1) level = 92;
    else if (topLevel >= 74) level = 78;
    else if (topLevel >= 65) level = 68;
    else if (topLevel >= 55) level = 48;
    if (level < 48) continue;
    out.push({ idx, level, hits: wins * 40 + (top ? Number(top.hits || 0) : 0), diagonal: !!(top && top.diagonal), kinds: ['gain'] });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (a.idx - b.idx));
}
function tttV960HumanRisk(board, deadline) {
  if (tttV960WinningMoves(board, 'X').length) return 1e15;
  let risk = 0;
  for (const e of tttV960ThreatEntries(board, 'X').slice(0, 26)) risk += Math.pow(10, Math.min(9, e.level / 10)) * (e.hits || 1) * (e.diagonal ? 1.6 : 1);
  for (const g of tttV960GainEntries(board, 'X', deadline).slice(0, 16)) risk += Math.pow(10, Math.min(9, g.level / 10)) * (g.hits || 1) * (g.diagonal ? 1.8 : 1) * 1.2;
  return risk;
}
function tttV960PickBest(board, entries, mark, deadline) {
  const list = (entries || []).filter(e => e && tttV960Legal(board, e.idx));
  if (!list.length) return -1;
  let best = -1, bestScore = -Infinity;
  for (const e of list.slice(0, 36)) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = mark;
    const ownWin = tttWinner(board).winner === mark ? 1 : 0;
    const humanRisk = tttV960HumanRisk(board, deadline);
    const ownTop = tttV960ThreatEntries(board, mark)[0];
    const ownGain = tttV960GainEntries(board, mark, deadline)[0];
    board[idx] = '';
    const score = ownWin * 1e16
      - humanRisk * (mark === 'O' ? 3.4 : 1.0)
      + Number(e.level || 0) * 1e11
      + Number(e.hits || 0) * 4e9
      + (e.diagonal ? 6e10 : 0)
      + (e.endpoint ? 3e10 : 0)
      + (ownTop ? Number(ownTop.level || 0) * 8e8 + Number(ownTop.hits || 0) * 1e8 : 0)
      + (ownGain ? Number(ownGain.level || 0) * 7e8 : 0)
      + tttCheapMovePotential(board, idx, 'O') * 1800
      + tttCheapMovePotential(board, idx, 'X') * 3600
      + tttV960CenterScore(idx) * 1000;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}
function tttV960MoveScore(board, idx, deadline) {
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 1e16; }
  const risk = tttV960HumanRisk(board, deadline);
  const ownThreats = tttV960ThreatEntries(board, 'O');
  const ownGain = tttV960GainEntries(board, 'O', deadline);
  const score = -risk * 4.0
    + (ownThreats[0] ? Number(ownThreats[0].level || 0) * 6e10 + Number(ownThreats[0].hits || 0) * 1.8e9 : 0)
    + (ownGain[0] ? Number(ownGain[0].level || 0) * 5e10 + Number(ownGain[0].hits || 0) * 1.1e9 : 0)
    + tttCheapMovePotential(board, idx, 'O') * 2600
    + tttCheapMovePotential(board, idx, 'X') * 4200
    + tttV960CenterScore(idx) * 1400;
  board[idx] = '';
  return score;
}
function tttV960BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const budget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 220 : 90);
  const deadline = tttEngineNow() + budget;
  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];
  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];
  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }
  const currentX = tttV960ThreatEntries(board, 'X');
  const direct = currentX.filter(e => e.level >= 68 || (e.diagonal && e.level >= 30));
  if (direct.length) return direct[0].idx;
  const xGains = tttV960GainEntries(board, 'X', deadline).filter(e => e.level >= 68 || (e.diagonal && e.level >= 48));
  if (xGains.length) return xGains[0].idx;
  const ownGains = tttV960GainEntries(board, 'O', deadline).filter(e => e.level >= 78);
  if (ownGains.length) {
    const attack = tttV960PickBest(board, ownGains, 'O', deadline);
    if (attack >= 0) {
      board[attack] = 'O';
      const risk = tttV960HumanRisk(board, deadline);
      board[attack] = '';
      if (risk < 1e9) return attack;
    }
  }
  const pool = new Set(tttV960CandidateSet(board, occupied < 18 ? 3 : 2));
  currentX.slice(0, 24).forEach(e => pool.add(e.idx));
  tttV960ThreatEntries(board, 'O').slice(0, 18).forEach(e => pool.add(e.idx));
  tttV960GainEntries(board, 'X', deadline).slice(0, 18).forEach(e => pool.add(e.idx));
  let candidates = Array.from(pool).filter(idx => tttV960Legal(board, idx));
  candidates = candidates.map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'X') * 4.2 + tttCheapMovePotential(board, idx, 'O') * 1.7 + tttV960CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 18 ? 28 : 20)
    .map(x => x.idx);
  let best = -1, bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const score = tttV960MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  if (best >= 0) return best;
  const emergency = tttV960PickBest(board, currentX.concat(tttV960GainEntries(board, 'X', deadline)), 'O', deadline);
  if (emergency >= 0) return emergency;
  return tttNearestCenterFallbackMove(board);
}
function getRakGomokuAiV960Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || '1.2 (1.108)'),
    rulesetVersion: GOMOKU_RULESET_VERSION,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    localSmokeTested: true,
    testedCases: ['diagonal-open-three', 'diagonal-four-block', 'horizontal-open-three', 'ai-immediate-win'],
    deterministicFallback: true,
    onlinePvPUnchanged: true,
    note: 'v960 nahrazuje vrchní AI výběr jednodušší deterministickou threat pipeline, která v lokálním smoke testu blokuje diagonální i vodorovné základní hrozby a netrvá sekundy.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV960Health = getRakGomokuAiV960Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV960Health;
  window.getRakGomokuAiV958Health = getRakGomokuAiV960Health;
}



// v.1.5 (963) – Piškvorky AI: pomalejší, bezpečnější tactical verification nad v960.
const TTT_V961_SOFT_DEADLINE_MS = 1600;
const TTT_V961_HARD_DEADLINE_MS = 2200;

function tttV961Budget(difficulty) {
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: 360, hard: 620 };
  return lowEnd ? { soft: 1200, hard: 1900 } : { soft: TTT_V961_SOFT_DEADLINE_MS, hard: TTT_V961_HARD_DEADLINE_MS };
}

function tttV961TimeUp(deadline, margin) {
  return !!(deadline && tttEngineNow() > deadline - (Number(margin || 0) || 0));
}

function tttV961Legal(board, idx) {
  return typeof tttV960Legal === 'function' ? tttV960Legal(board, idx) : (Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
}

function tttV961CenterScore(idx) {
  return typeof tttV960CenterScore === 'function' ? tttV960CenterScore(idx) : tttV954CenterScore(idx);
}

function tttV961AddThreatEntry(map, board, idx, level, hits, kind, dir, flags) {
  const n = Number(idx);
  if (!tttV961Legal(board, n)) return;
  const opts = flags || {};
  const diagonal = !!(opts.diagonal || (dir && Math.abs(Number(dir[0] || 0)) === 1 && Math.abs(Number(dir[1] || 0)) === 1));
  const prev = map.get(n) || { idx: n, level: 0, hits: 0, diagonal: false, endpoint: false, gap: false, exact: false, kinds: [], dirs: [] };
  prev.level = Math.max(prev.level, Number(level || 0) || 0);
  prev.hits += Number(hits || 1) || 1;
  prev.diagonal = prev.diagonal || diagonal;
  prev.endpoint = prev.endpoint || !!opts.endpoint;
  prev.gap = prev.gap || !!opts.gap;
  prev.exact = prev.exact || !!opts.exact;
  if (kind && prev.kinds.indexOf(kind) < 0) prev.kinds.push(kind);
  if (dir) {
    const sig = String(dir[0]) + ',' + String(dir[1]);
    if (prev.dirs.indexOf(sig) < 0) prev.dirs.push(sig);
  }
  map.set(n, prev);
}

function tttV961ThreatEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const map = new Map();
  const patternRules = [
    { pat: 'MMMM.', defs: [{ p: 4, level: 116, hits: 160, kind: 'simple-four', endpoint: true, exact: true }] },
    { pat: '.MMMM', defs: [{ p: 0, level: 116, hits: 160, kind: 'simple-four', endpoint: true, exact: true }] },
    { pat: '.MMM.', defs: [{ p: 0, level: 84, hits: 58, kind: 'open-three-end', endpoint: true, exact: true }, { p: 4, level: 84, hits: 58, kind: 'open-three-end', endpoint: true, exact: true }] },
    { pat: 'MM.M.', defs: [{ p: 2, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 4, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: '.M.MM', defs: [{ p: 2, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 0, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: 'M.MM.', defs: [{ p: 1, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 4, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: '.MM.M', defs: [{ p: 3, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 0, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: '.MM.M.', defs: [{ p: 3, level: 88, hits: 72, kind: 'open-broken-three-gap', gap: true, exact: true }, { p: 0, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }, { p: 5, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }] },
    { pat: '.M.MM.', defs: [{ p: 2, level: 88, hits: 72, kind: 'open-broken-three-gap', gap: true, exact: true }, { p: 0, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }, { p: 5, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }] },
    { pat: 'M.M.M', defs: [{ p: 1, level: 82, hits: 50, kind: 'split-three-gap', gap: true, exact: true }, { p: 3, level: 82, hits: 50, kind: 'split-three-gap', gap: true, exact: true }] },
    { pat: 'MM..M', defs: [{ p: 2, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }, { p: 3, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }] },
    { pat: 'M..MM', defs: [{ p: 1, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }, { p: 2, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }] }
  ];

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV960Dirs()) {
        const dr = dir[0];
        const dc = dir[1];
        const diagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
        for (const size of [5, 6, 7]) {
          const cells = [];
          let pattern = '';
          let own = 0;
          let opp = 0;
          const empties = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const rr = row + dr * step;
            const cc = col + dc * step;
            if (!tttInBounds(rr, cc)) { ok = false; break; }
            const idx = tttIndex(rr, cc);
            cells.push(idx);
            const cell = board[idx];
            if (cell === mark) { own += 1; pattern += 'M'; }
            else if (cell === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (!ok || opp || own < 2 || !empties.length) continue;

          const addAtPatternPos = (patStart, def, extraLevel) => {
            const pos = patStart + Number(def.p || 0);
            const idx = cells[pos];
            const flags = { diagonal, endpoint: !!def.endpoint, gap: !!def.gap, exact: !!def.exact };
            tttV961AddThreatEntry(map, board, idx, Number(def.level || 0) + (diagonal ? Number(extraLevel || 0) : 0), Number(def.hits || 1), diagonal && def.kind && !/^diagonal-/.test(def.kind) ? 'diagonal-' + def.kind : def.kind, dir, flags);
          };

          for (const rule of patternRules) {
            let from = pattern.indexOf(rule.pat);
            while (from >= 0) {
              for (const def of rule.defs) addAtPatternPos(from, def, rule.pat.indexOf('MMMM') >= 0 ? 8 : 6);
              from = pattern.indexOf(rule.pat, from + 1);
            }
          }

          if (size === 5 && own === 4 && empties.length === 1) {
            tttV961AddThreatEntry(map, board, empties[0], diagonal ? 124 : 120, 180, diagonal ? 'diagonal-four-in-five' : 'four-in-five', dir, { diagonal, exact: true, endpoint: true });
            continue;
          }

          if (size === 5 && own === 3 && empties.length === 2) {
            const level = diagonal ? 78 : 68;
            for (const idx of empties) tttV961AddThreatEntry(map, board, idx, level, diagonal ? 36 : 24, diagonal ? 'diagonal-three-window' : 'three-window', dir, { diagonal, exact: false });
          }

          if (size >= 6 && own >= 3 && empties.length >= 2) {
            for (const idx of empties) tttV961AddThreatEntry(map, board, idx, diagonal ? 69 : 58, diagonal ? 18 : 12, diagonal ? 'diagonal-long-three-window' : 'long-three-window', dir, { diagonal });
          }

          if (diagonal && own === 2 && empties.length >= 3) {
            for (const idx of empties) tttV961AddThreatEntry(map, board, idx, 38, 4, 'diagonal-two-build-up', dir, { diagonal });
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.level - a.level)
    || (b.hits - a.hits)
    || ((b.exact ? 1 : 0) - (a.exact ? 1 : 0))
    || ((b.gap ? 1 : 0) - (a.gap ? 1 : 0))
    || ((b.endpoint ? 1 : 0) - (a.endpoint ? 1 : 0))
    || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0))
    || (tttV961CenterScore(b.idx) - tttV961CenterScore(a.idx))
    || (a.idx - b.idx)
  );
}

function tttV961GainEntries(board, mark, deadline) {
  const occupied = tttV960Occupied(board);
  const pool = new Set(tttV960CandidateSet(board, occupied < 18 ? 3 : 2));
  tttV961ThreatEntries(board, mark).slice(0, 28).forEach(e => pool.add(e.idx));
  tttV961ThreatEntries(board, mark === 'X' ? 'O' : 'X').slice(0, 18).forEach(e => pool.add(e.idx));
  const out = [];
  for (const raw of pool) {
    if (tttV961TimeUp(deadline, 20) && out.length) break;
    const idx = Number(raw);
    if (!tttV961Legal(board, idx)) continue;
    board[idx] = mark;
    const wins = tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const top = threats[0] || null;
    const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0 ? 1 : 0;
    board[idx] = '';
    const topLevel = top ? Number(top.level || 0) : 0;
    let level = 0;
    if (wins >= 2) level = 122;
    else if (wins >= 1) level = 112;
    else if (fork && topLevel >= 78) level = 104;
    else if (topLevel >= 116) level = 104;
    else if (topLevel >= 86) level = 92;
    else if (topLevel >= 78) level = 82;
    else if (topLevel >= 68) level = 70;
    if (level < 70) continue;
    out.push({ idx, level, hits: wins * 100 + (top ? Number(top.hits || 0) : 0) + fork * 36, diagonal: !!(top && top.diagonal), endpoint: !!(top && top.endpoint), gap: !!(top && top.gap), kinds: ['gain'].concat(top && top.kinds ? top.kinds : []) });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (a.idx - b.idx));
}

function tttV961ThreatRisk(board, mark, deadline) {
  const winner = tttWinner(board).winner;
  if (winner === mark) return 1e18;
  const wins = tttV960WinningMoves(board, mark).length;
  const threats = tttV961ThreatEntries(board, mark);
  const gains = tttV961GainEntries(board, mark, deadline);
  const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  let score = wins * 8e16 + fork * 8e12;
  for (const e of threats.slice(0, 30)) {
    score += Math.pow(12, Math.min(12, Number(e.level || 0) / 10)) * (Number(e.hits || 1) || 1) * (e.diagonal ? 1.65 : 1) * (e.exact ? 1.18 : 1);
  }
  for (const g of gains.slice(0, 18)) {
    score += Math.pow(12, Math.min(12, Number(g.level || 0) / 10)) * (Number(g.hits || 1) || 1) * (g.diagonal ? 1.8 : 1) * 1.35;
  }
  return score;
}

function tttV961EntryListFromMoves(moves, level, kind) {
  return (moves || []).map(idx => ({ idx: Number(idx), level: Number(level || 0), hits: 999, exact: true, endpoint: true, kinds: [kind || 'move'] }));
}

function tttV961PickDefense(board, entries, deadline) {
  const list = (entries || []).filter(e => e && tttV961Legal(board, e.idx));
  if (!list.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  let bestImmediateLosses = Infinity;
  for (const e of list.slice(0, 24)) {
    if (tttV961TimeUp(deadline, 12) && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const immediateLosses = tttV960WinningMoves(board, 'X').length;
    const xThreats = tttV961ThreatEntries(board, 'X');
    const xTop = xThreats[0] || null;
    const oThreats = tttV961ThreatEntries(board, 'O');
    const oTop = oThreats[0] || null;
    board[idx] = '';
    const remainingSevere = xThreats.filter(t => Number(t.level || 0) >= 110).length;
    const score = ownWin * 1e19
      - immediateLosses * 9e17
      - remainingSevere * 8e16
      - (xTop ? Number(xTop.level || 0) * 5e13 + Number(xTop.hits || 0) * 2e12 : 0)
      + (oTop ? Number(oTop.level || 0) * 2.6e13 + Number(oTop.hits || 0) * 8e11 : 0)
      + Number(e.level || 0) * 3.2e14
      + Number(e.hits || 0) * 1.8e12
      + (e.exact ? 5e13 : 0)
      + (e.gap ? 3e13 : 0)
      + (e.endpoint ? 1.4e13 : 0)
      + (e.diagonal ? 1.2e13 : 0)
      + tttCheapMovePotential(board, idx, 'X') * 5200
      + tttCheapMovePotential(board, idx, 'O') * 2600
      + tttV961CenterScore(idx) * 1800;
    if (immediateLosses < bestImmediateLosses || (immediateLosses === bestImmediateLosses && score > bestScore)) {
      bestImmediateLosses = immediateLosses;
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV961CandidatePool(board, deadline) {
  const occupied = tttV960Occupied(board);
  const pool = new Set(tttV960CandidateSet(board, occupied < 20 ? 3 : 2));
  tttV960WinningMoves(board, 'O').forEach(idx => pool.add(idx));
  tttV960WinningMoves(board, 'X').forEach(idx => pool.add(idx));
  tttV961ThreatEntries(board, 'X').slice(0, 32).forEach(e => pool.add(e.idx));
  tttV961ThreatEntries(board, 'O').slice(0, 24).forEach(e => pool.add(e.idx));
  tttV961GainEntries(board, 'X', deadline).slice(0, 20).forEach(e => pool.add(e.idx));
  tttV961GainEntries(board, 'O', deadline).slice(0, 18).forEach(e => pool.add(e.idx));
  return Array.from(pool)
    .map(Number)
    .filter(idx => tttV961Legal(board, idx))
    .map(idx => {
      board[idx] = 'O';
      const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
      const xWins = tttV960WinningMoves(board, 'X').length;
      const oTop = tttV961ThreatEntries(board, 'O')[0];
      const xTop = tttV961ThreatEntries(board, 'X')[0];
      board[idx] = '';
      return {
        idx,
        score: ownWin * 1e18
          - xWins * 9e16
          + (oTop ? Number(oTop.level || 0) * 8e12 + Number(oTop.hits || 0) * 7e10 : 0)
          + (xTop ? Number(xTop.level || 0) * 7e12 + Number(xTop.hits || 0) * 8e10 : 0)
          + tttCheapMovePotential(board, idx, 'X') * 5800
          + tttCheapMovePotential(board, idx, 'O') * 3600
          + tttV961CenterScore(idx) * 2000
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.idx);
}

function tttV961SafetyReport(board, idx, deadline) {
  if (!tttV961Legal(board, idx)) return { idx, illegal: true, risk: 1e20, immediateLosses: 99, openFourThreats: 99, forkThreat: true };
  const occupied = tttV960Occupied(board);
  board[idx] = 'O';
  const ownWinNow = tttWinner(board).winner === 'O';
  const immediateLosses = tttV960WinningMoves(board, 'X').length;
  const xThreats = tttV961ThreatEntries(board, 'X');
  const xGains = tttV961GainEntries(board, 'X', deadline);
  const openFourThreats = xThreats.filter(e => e.level >= 110).length + xGains.filter(e => e.level >= 112).length;
  const forkThreat = typeof tttBestForkMove === 'function' && tttBestForkMove(board, 'X') >= 0;
  const replyPool = new Set(tttV960CandidateSet(board, occupied < 22 ? 3 : 2));
  xThreats.slice(0, 18).forEach(e => replyPool.add(e.idx));
  xGains.slice(0, 16).forEach(e => replyPool.add(e.idx));
  tttV961ThreatEntries(board, 'O').slice(0, 12).forEach(e => replyPool.add(e.idx));
  let replies = Array.from(replyPool).map(Number).filter(reply => tttV961Legal(board, reply));
  replies = replies.map(reply => {
    board[reply] = 'X';
    const score = (tttWinner(board).winner === 'X' ? 1e18 : 0)
      + tttV960WinningMoves(board, 'X').length * 9e16
      + tttV961ThreatRisk(board, 'X', deadline) * 0.04
      + tttCheapMovePotential(board, reply, 'X') * 4600
      - tttV960WinningMoves(board, 'O').length * 7e16;
    board[reply] = '';
    return { reply, score };
  }).sort((a, b) => b.score - a.score).slice(0, occupied < 22 ? 16 : 12).map(item => item.reply);

  let worstReplyRisk = 0;
  for (const reply of replies) {
    if (tttV961TimeUp(deadline, 18) && worstReplyRisk > 0) break;
    board[reply] = 'X';
    const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
    const xWins = tttV960WinningMoves(board, 'X').length;
    const xRisk = tttV961ThreatRisk(board, 'X', deadline);
    const oWins = tttV960WinningMoves(board, 'O').length;
    const oRisk = tttV961ThreatRisk(board, 'O', deadline);
    let bestCounterRelief = 0;
    const counters = tttV961CandidatePool(board, deadline).slice(0, 8);
    for (const counter of counters) {
      if (tttV961TimeUp(deadline, 10)) break;
      board[counter] = 'O';
      const relief = xRisk - tttV961ThreatRisk(board, 'X', deadline) + (tttWinner(board).winner === 'O' ? 1e17 : 0) + tttV960WinningMoves(board, 'O').length * 3e16;
      board[counter] = '';
      if (relief > bestCounterRelief) bestCounterRelief = relief;
    }
    board[reply] = '';
    const risk = replyWinner * 1e19 + xWins * 6e17 + xRisk * 1.15 - oWins * 2.2e17 - oRisk * 0.16 - bestCounterRelief * 0.32;
    if (risk > worstReplyRisk) worstReplyRisk = risk;
  }

  const ownRisk = tttV961ThreatRisk(board, 'O', deadline);
  const xRiskAfter = tttV961ThreatRisk(board, 'X', deadline);
  board[idx] = '';
  const risk = (ownWinNow ? 0 : 0)
    + immediateLosses * 1e19
    + openFourThreats * 8e17
    + (forkThreat ? 8e16 : 0)
    + xRiskAfter * 1.24
    + worstReplyRisk * 0.9
    - ownRisk * 0.24;
  return { idx, illegal: false, ownWinNow, immediateLosses, openFourThreats, forkThreat, worstReplyRisk, risk };
}

function tttV961MoveScore(board, idx, deadline) {
  const safety = tttV961SafetyReport(board, idx, deadline);
  if (safety.illegal) return -Infinity;
  board[idx] = 'O';
  const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
  const ownRisk = tttV961ThreatRisk(board, 'O', deadline);
  const xRisk = tttV961ThreatRisk(board, 'X', deadline);
  const ownGains = tttV961GainEntries(board, 'O', deadline);
  board[idx] = '';
  const safeBonus = (!safety.immediateLosses && !safety.openFourThreats && !safety.forkThreat) ? 2e15 : 0;
  return ownWin * 1e20
    + safeBonus
    + ownRisk * 1.08
    + (ownGains[0] ? Number(ownGains[0].level || 0) * 1.2e14 + Number(ownGains[0].hits || 0) * 7e12 : 0)
    - xRisk * 1.55
    - safety.risk * 1.85
    + tttCheapMovePotential(board, idx, 'O') * 5000
    + tttCheapMovePotential(board, idx, 'X') * 6200
    + tttV961CenterScore(idx) * 2400;
}

function tttV961PickVerifiedRootMove(board, candidates, deadline) {
  const list = (candidates || []).filter(idx => tttV961Legal(board, idx)).slice(0, 16);
  let best = -1;
  let bestScore = -Infinity;
  let bestSafe = -1;
  let bestSafeScore = -Infinity;
  for (const idx of list) {
    if (tttV961TimeUp(deadline, 26) && best >= 0) break;
    const score = tttV961MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
    const safety = tttV961SafetyReport(board, idx, deadline);
    const safe = safety.ownWinNow || (!safety.immediateLosses && !safety.openFourThreats && !safety.forkThreat);
    if (safe && score > bestSafeScore) { bestSafeScore = score; bestSafe = idx; }
  }
  return bestSafe >= 0 ? bestSafe : best;
}

function tttV961BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const terminal = tttWinner(board).winner;
  if (terminal) return tttNearestCenterFallbackMove(board);
  const budget = tttV961Budget(difficulty || 'ai');
  const hardDeadline = tttEngineNow() + Number(budget.hard || TTT_V961_HARD_DEADLINE_MS);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return tttV961PickDefense(board, tttV961EntryListFromMoves(ownWins, 160, 'own-immediate-win'), hardDeadline);

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return tttV961PickDefense(board, tttV961EntryListFromMoves(xWins, 180, 'immediate-loss-block'), hardDeadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }
  const currentX = tttV961ThreatEntries(board, 'X');
  const forcedFours = currentX.filter(e => e.level >= 110);
  if (forcedFours.length) {
    const block = tttV961PickDefense(board, forcedFours, hardDeadline);
    if (tttV961Legal(board, block)) return block;
  }

  const openThreeAndBroken = currentX.filter(e => e.level >= 78 || (e.diagonal && e.level >= 69) || e.gap || e.exact);
  if (openThreeAndBroken.length) {
    const block = tttV961PickDefense(board, openThreeAndBroken, hardDeadline);
    if (tttV961Legal(board, block)) return block;
  }

  const xGains = tttV961GainEntries(board, 'X', hardDeadline).filter(e => e.level >= 82 || (e.diagonal && e.level >= 70));
  if (xGains.length) {
    const block = tttV961PickDefense(board, xGains, hardDeadline);
    if (tttV961Legal(board, block)) return block;
  }

  const ownForcing = tttV961GainEntries(board, 'O', hardDeadline).filter(e => e.level >= 104);
  if (ownForcing.length) {
    const attack = tttV961PickDefense(board, ownForcing, hardDeadline);
    if (tttV961Legal(board, attack)) {
      const safety = tttV961SafetyReport(board, attack, hardDeadline);
      if (safety.ownWinNow || (!safety.immediateLosses && !safety.openFourThreats)) return attack;
    }
  }

  const candidates = tttV961CandidatePool(board, hardDeadline);
  const verified = tttV961PickVerifiedRootMove(board, candidates, hardDeadline);
  if (tttV961Legal(board, verified)) return verified;

  const emergency = tttV961PickDefense(board, currentX.concat(tttV961GainEntries(board, 'X', hardDeadline)), hardDeadline);
  if (tttV961Legal(board, emergency)) return emergency;
  const v960 = typeof tttV960BestMove === 'function' ? tttV960BestMove(board, difficulty || 'ai') : -1;
  if (tttV961Legal(board, v960)) return v960;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV961Health() {
  const budget = tttV961Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: '1-2 ply on top root candidates',
    softDeadlineMs: Number(budget.soft || TTT_V961_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V961_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v961.js',
    note: 'v961 nechává online PvP beze změny a přidává nad offline AI bezpečnostní ověření kandidátů včetně přesných diagonálních endpoint/gap defense squares.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV961Health = getRakGomokuAiV961Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV961Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV961Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV961BestMove === 'function' ? tttV961BestMove(board, difficulty || 'ai') : -1;
  if (tttV961Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV961Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV961Legal(board, block)) return block;
  const prev = typeof tttV960BestMove === 'function' ? tttV960BestMove(board, difficulty || 'ai') : -1;
  if (tttV961Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}


// v.1.5 (963) – Piškvorky AI: anti-fork/anti-open-four vrstva nad v961.
// Cíl: nenechat X vytvořit dvojité okamžité výhry typu .XXXX. a podobné pasti.
const TTT_V962_SOFT_DEADLINE_MS = 1700;
const TTT_V962_HARD_DEADLINE_MS = 2300;

function tttV962Budget(difficulty) {
  const prev = typeof tttV961Budget === 'function' ? tttV961Budget(difficulty || 'ai') : { soft: 1600, hard: 2200 };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(420, Number(prev.soft || 0) || 0), hard: Math.max(720, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1300, hard: 2000 } : { soft: TTT_V962_SOFT_DEADLINE_MS, hard: TTT_V962_HARD_DEADLINE_MS };
}

function tttV962Now() {
  return typeof tttEngineNow === 'function' ? tttEngineNow() : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
}

function tttV962TimeUp(deadline, margin) {
  return !!(deadline && tttV962Now() > deadline - (Number(margin || 0) || 0));
}

function tttV962Legal(board, idx) {
  return typeof tttV961Legal === 'function' ? tttV961Legal(board, idx) : (Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
}

function tttV962CenterScore(idx) {
  return typeof tttV961CenterScore === 'function' ? tttV961CenterScore(idx) : 0;
}

function tttV962Coord(idx) {
  return { row: Math.floor(Number(idx) / TTT_COLS), col: Number(idx) % TTT_COLS };
}

function tttV962UniqueEntries(entries) {
  const map = new Map();
  for (const e of entries || []) {
    if (!e || !Number.isFinite(Number(e.idx))) continue;
    const idx = Number(e.idx);
    const prev = map.get(idx);
    if (!prev || Number(e.level || 0) > Number(prev.level || 0) || (Number(e.level || 0) === Number(prev.level || 0) && Number(e.hits || 0) > Number(prev.hits || 0))) {
      map.set(idx, Object.assign({}, e, { idx }));
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    (Number(b.level || 0) - Number(a.level || 0))
    || (Number(b.hits || 0) - Number(a.hits || 0))
    || (Number(b.immediateWins || 0) - Number(a.immediateWins || 0))
    || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0))
    || (tttV962CenterScore(b.idx) - tttV962CenterScore(a.idx))
    || (a.idx - b.idx)
  );
}

function tttV962CandidateSet(board, radius) {
  const occupied = typeof tttV960Occupied === 'function' ? tttV960Occupied(board) : board.filter(Boolean).length;
  const pool = new Set(typeof tttV960CandidateSet === 'function' ? tttV960CandidateSet(board, radius || (occupied < 22 ? 3 : 2)) : []);
  if (!occupied) {
    [tttIndex(9, 4), tttIndex(9, 5), tttIndex(8, 4), tttIndex(10, 5)].forEach(idx => pool.add(idx));
  }
  try { tttV960WinningMoves(board, 'O').forEach(idx => pool.add(idx)); } catch (_) {}
  try { tttV960WinningMoves(board, 'X').forEach(idx => pool.add(idx)); } catch (_) {}
  try { tttV961ThreatEntries(board, 'X').slice(0, 42).forEach(e => pool.add(e.idx)); } catch (_) {}
  try { tttV961ThreatEntries(board, 'O').slice(0, 32).forEach(e => pool.add(e.idx)); } catch (_) {}
  return Array.from(pool).map(Number).filter(idx => tttV962Legal(board, idx));
}

function tttV962StrongThreatCount(entries, minLevel) {
  let n = 0;
  const seen = new Set();
  for (const e of entries || []) {
    if (!e || seen.has(e.idx)) continue;
    if (Number(e.level || 0) >= Number(minLevel || 84)) {
      seen.add(e.idx);
      n += 1;
    }
  }
  return n;
}

function tttV962KillerEntries(board, mark, deadline) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const pool = tttV962CandidateSet(board, (tttV960Occupied(board) < 24 ? 3 : 2));
  const out = [];
  for (const idx of pool) {
    if (tttV962TimeUp(deadline, 22) && out.length) break;
    if (!tttV962Legal(board, idx)) continue;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark;
    const immediateWins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const top = threats[0] || null;
    const severeThreats = tttV962StrongThreatCount(threats, 84);
    const forcedThreats = tttV962StrongThreatCount(threats, 110);
    const forkMove = immediateWins >= 2 || severeThreats >= 2;
    const diagonal = !!(top && top.diagonal);
    const exact = !!(top && top.exact);
    const gap = !!(top && top.gap);
    const endpoint = !!(top && top.endpoint);
    board[idx] = '';

    let level = 0;
    if (winNow) level = 240;
    else if (immediateWins >= 2) level = 218;
    else if (immediateWins === 1 && severeThreats >= 2) level = 196;
    else if (immediateWins === 1) level = 176;
    else if (forcedThreats >= 2) level = 166;
    else if (forcedThreats >= 1 && severeThreats >= 2) level = 158;
    else if (severeThreats >= 3) level = 148;
    else if (severeThreats >= 2) level = 138;
    else if (top && Number(top.level || 0) >= 116) level = 128;
    else if (top && Number(top.level || 0) >= 88 && exact) level = 108;
    else if (top && Number(top.level || 0) >= 84) level = 102;
    if (level < 102) continue;

    out.push({
      idx,
      level,
      hits: immediateWins * 800 + forcedThreats * 300 + severeThreats * 90 + (top ? Number(top.hits || 0) : 0),
      immediateWins,
      severeThreats,
      severeGains: 0,
      forcedThreats,
      forkMove,
      diagonal,
      exact,
      gap,
      endpoint,
      kinds: ['killer'].concat(top && top.kinds ? top.kinds.slice(0, 4) : []),
      opponent
    });
  }
  return tttV962UniqueEntries(out);
}

function tttV962LineRunAfterMove(board, idx, mark) {
  if (!Number.isFinite(Number(idx))) return 0;
  const row = Math.floor(Number(idx) / TTT_COLS);
  const col = Number(idx) % TTT_COLS;
  let best = 0;
  for (const dir of tttV960Dirs()) {
    const dr = dir[0], dc = dir[1];
    let len = 1;
    let r = row + dr, c = col + dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) { len += 1; r += dr; c += dc; }
    r = row - dr; c = col - dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) { len += 1; r -= dr; c -= dc; }
    if (len > best) best = len;
  }
  return best;
}

function tttV962PositionRisk(board, mark, deadline) {
  // Rychlý odhad rizika bez vnořeného killer scanu; ten se řeší samostatně.
  const wins = tttV960WinningMoves(board, mark).length;
  const threats = tttV961ThreatEntries(board, mark);
  const gains = tttV961GainEntries(board, mark, deadline);
  const top = threats[0] || null;
  const topGain = gains[0] || null;
  const severeThreats = tttV962StrongThreatCount(threats, 84);
  const severeGains = tttV962StrongThreatCount(gains, 104);
  return wins * 9e18
    + severeThreats * 6e16
    + severeGains * 9e16
    + (top ? Number(top.level || 0) * 3e14 + Number(top.hits || 0) * 2.8e12 + (top.exact ? 8e13 : 0) : 0)
    + (topGain ? Number(topGain.level || 0) * 4e14 + Number(topGain.hits || 0) * 2.6e12 : 0);
}

function tttV962SafetyReport(board, idx, deadline) {
  if (!tttV962Legal(board, idx)) return { idx, illegal: true, risk: 1e30, immediateLosses: 99, killerLevel: 999, killerCount: 99 };
  board[idx] = 'O';
  const ownWinNow = tttWinner(board).winner === 'O';
  const immediateLosses = tttV960WinningMoves(board, 'X').length;
  const killers = tttV962KillerEntries(board, 'X', deadline);
  const killerLevel = killers[0] ? Number(killers[0].level || 0) : 0;
  const killerCount = killers.filter(e => Number(e.level || 0) >= 138).length;
  const xRisk = tttV962PositionRisk(board, 'X', deadline);
  const oRisk = tttV962PositionRisk(board, 'O', deadline);
  let worstReply = 0;
  const replies = tttV962UniqueEntries(killers.concat(tttV961GainEntries(board, 'X', deadline)).concat(tttV961ThreatEntries(board, 'X')))
    .filter(e => tttV962Legal(board, e.idx))
    .slice(0, 8);
  for (const e of replies) {
    if (tttV962TimeUp(deadline, 20) && worstReply > 0) break;
    const reply = Number(e.idx);
    board[reply] = 'X';
    const replyWin = tttWinner(board).winner === 'X' ? 1 : 0;
    const replyWins = tttV960WinningMoves(board, 'X').length;
    const replyThreat = tttV961ThreatEntries(board, 'X')[0] || null;
    const replyGain = tttV961GainEntries(board, 'X', deadline)[0] || null;
    const oImmediate = tttV960WinningMoves(board, 'O').length;
    board[reply] = '';
    const score = replyWin * 1e24
      + replyWins * 8e21
      + (replyThreat ? Number(replyThreat.level || 0) * 3e18 + Number(replyThreat.hits || 0) * 8e15 : 0)
      + (replyGain ? Number(replyGain.level || 0) * 5e18 + Number(replyGain.hits || 0) * 9e15 : 0)
      - oImmediate * 2e20;
    if (score > worstReply) worstReply = score;
  }
  board[idx] = '';
  const risk = (ownWinNow ? 0 : immediateLosses * 1e25)
    + killerLevel * 2.6e20
    + killerCount * 6e21
    + xRisk * 1.7
    + worstReply * 0.8
    - oRisk * 0.34;
  return { idx, illegal: false, ownWinNow, immediateLosses, killerLevel, killerCount, xRisk, oRisk, worstReply, risk };
}

function tttV962PickDefense(board, entries, deadline) {
  const list = tttV962UniqueEntries(entries).filter(e => tttV962Legal(board, e.idx)).slice(0, 34);
  if (!list.length) return -1;
  let best = -1;
  let bestRank = null;
  for (const e of list) {
    if (tttV962TimeUp(deadline, 26) && best >= 0) break;
    const idx = Number(e.idx);
    const safety = tttV962SafetyReport(board, idx, deadline);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const ownThreat = tttV961ThreatEntries(board, 'O')[0] || null;
    const ownKill = tttV962KillerEntries(board, 'O', deadline)[0] || null;
    const runBlock = tttV962LineRunAfterMove(board, idx, 'O') + tttV962LineRunAfterMove(board, idx, 'X') * 0.35;
    board[idx] = '';
    const rank = [
      ownWin ? 1 : 0,
      -Number(safety.immediateLosses || 0),
      -Number(safety.killerCount || 0),
      -Number(safety.killerLevel || 0),
      -Number(safety.risk || 0),
      Number(e.level || 0) * 1e16 + Number(e.hits || 0) * 1e13,
      ownKill ? Number(ownKill.level || 0) * 1e14 + Number(ownKill.hits || 0) * 1e12 : 0,
      ownThreat ? Number(ownThreat.level || 0) * 1e13 + Number(ownThreat.hits || 0) * 1e11 : 0,
      runBlock * 1e12,
      (e.exact ? 4e12 : 0) + (e.gap ? 3e12 : 0) + (e.endpoint ? 2e12 : 0) + (e.diagonal ? 1e12 : 0),
      tttV962CenterScore(idx)
    ];
    if (!bestRank || tttV962CompareRank(rank, bestRank) > 0) {
      bestRank = rank;
      best = idx;
    }
  }
  return best;
}

function tttV962CompareRank(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = Number(a[i] || 0);
    const bv = Number(b[i] || 0);
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function tttV962MoveScore(board, idx, deadline) {
  const safety = tttV962SafetyReport(board, idx, deadline);
  if (safety.illegal) return -Infinity;
  board[idx] = 'O';
  const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
  const ownKill = tttV962KillerEntries(board, 'O', deadline)[0] || null;
  const ownThreat = tttV961ThreatEntries(board, 'O')[0] || null;
  const xThreat = tttV961ThreatEntries(board, 'X')[0] || null;
  board[idx] = '';
  return ownWin * 1e30
    - Number(safety.immediateLosses || 0) * 1e28
    - Number(safety.killerCount || 0) * 6e26
    - Number(safety.killerLevel || 0) * 2e24
    - Number(safety.risk || 0) * 2.2
    + (ownKill ? Number(ownKill.level || 0) * 9e21 + Number(ownKill.hits || 0) * 5e18 : 0)
    + (ownThreat ? Number(ownThreat.level || 0) * 8e20 + Number(ownThreat.hits || 0) * 4e18 : 0)
    - (xThreat ? Number(xThreat.level || 0) * 5e20 + Number(xThreat.hits || 0) * 4e18 : 0)
    + tttCheapMovePotential(board, idx, 'O') * 12000
    + tttCheapMovePotential(board, idx, 'X') * 15000
    + tttV962CenterScore(idx) * 3500;
}

function tttV962PickRoot(board, candidates, deadline) {
  const list = Array.from(new Set((candidates || []).map(Number).filter(idx => tttV962Legal(board, idx)))).slice(0, 24);
  let best = -1;
  let bestScore = -Infinity;
  let safest = -1;
  let safestScore = -Infinity;
  for (const idx of list) {
    if (tttV962TimeUp(deadline, 28) && best >= 0) break;
    const score = tttV962MoveScore(board, idx, deadline);
    const safety = tttV962SafetyReport(board, idx, deadline);
    const safe = safety.ownWinNow || (!safety.immediateLosses && !safety.killerCount && Number(safety.killerLevel || 0) < 138);
    if (score > bestScore) { bestScore = score; best = idx; }
    if (safe && score > safestScore) { safestScore = score; safest = idx; }
  }
  return safest >= 0 ? safest : best;
}

function tttV962BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const terminal = tttWinner(board).winner;
  if (terminal) return tttNearestCenterFallbackMove(board);
  const budget = tttV962Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Number(budget.hard || TTT_V962_HARD_DEADLINE_MS);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length === 1) return xWins[0];
  if (xWins.length > 1) {
    const multiBlock = typeof tttV961PickDefense === 'function' ? tttV961PickDefense(board, tttV961EntryListFromMoves(xWins, 260, 'multi-immediate-loss-block'), hardDeadline) : xWins[0];
    if (tttV962Legal(board, multiBlock)) return multiBlock;
    return xWins[0];
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const currentX = tttV961ThreatEntries(board, 'X');
  const forcedX = currentX.filter(e => Number(e.level || 0) >= 110 || (e.exact && Number(e.level || 0) >= 84));
  if (forcedX.length) {
    const quickBlock = typeof tttV961PickDefense === 'function' ? tttV961PickDefense(board, forcedX, hardDeadline) : forcedX[0].idx;
    if (tttV962Legal(board, quickBlock)) return quickBlock;
  }

  // Nejdůležitější novinka v962: dřív než AI zaútočí, blokuje tah X,
  // který by příštím tahem vytvořil dvě a více okamžitých výher.
  const xKillers = tttV962KillerEntries(board, 'X', hardDeadline);
  const unstoppableBuilder = xKillers.filter(e => Number(e.immediateWins || 0) >= 2 || Number(e.level || 0) >= 176);
  if (unstoppableBuilder.length) {
    const block = tttV962PickDefense(board, unstoppableBuilder, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const strongXKillers = xKillers.filter(e => Number(e.level || 0) >= 138 || (e.diagonal && Number(e.level || 0) >= 120));
  if (strongXKillers.length) {
    const block = tttV962PickDefense(board, strongXKillers, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const xGains = tttV961GainEntries(board, 'X', hardDeadline).filter(e => Number(e.level || 0) >= 92 || (e.diagonal && Number(e.level || 0) >= 78));
  if (xGains.length) {
    const block = tttV962PickDefense(board, xGains, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const ownKillers = tttV962KillerEntries(board, 'O', hardDeadline).filter(e => Number(e.level || 0) >= 148);
  if (ownKillers.length) {
    const attack = tttV962PickDefense(board, ownKillers, hardDeadline);
    if (tttV962Legal(board, attack)) {
      const safety = tttV962SafetyReport(board, attack, hardDeadline);
      if (safety.ownWinNow || (!safety.immediateLosses && Number(safety.killerLevel || 0) < 176)) return attack;
    }
  }

  const candidates = tttV962CandidateSet(board, occupied < 24 ? 3 : 2)
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'X') * 7.5 + tttCheapMovePotential(board, idx, 'O') * 5.2 + tttV962CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 24 ? 34 : 26)
    .map(x => x.idx);
  const verified = tttV962PickRoot(board, candidates, hardDeadline);
  if (tttV962Legal(board, verified)) return verified;

  const v961 = typeof tttV961BestMove === 'function' ? tttV961BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v961)) return v961;
  const v960 = typeof tttV960BestMove === 'function' ? tttV960BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v960)) return v960;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV962Health() {
  const budget = tttV962Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    multiImmediateLossBlock: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    antiForkDefense: true,
    antiOpenFourBuilderDefense: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: '1-2 ply on top root candidates + v962 killer scan',
    softDeadlineMs: Number(budget.soft || TTT_V962_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V962_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v962.js',
    note: 'v962 blokuje i tah X, který by příště vytvořil dvě okamžité výhry / open-four fork. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV962Health = getRakGomokuAiV962Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV962Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV962Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV962Health;
}


const TTT_V965_SOFT_DEADLINE_MS = 1900;
const TTT_V965_HARD_DEADLINE_MS = 3800;

function tttV965Budget(difficulty) {
  const prev = typeof tttV962Budget === 'function' ? tttV962Budget(difficulty || 'ai') : { soft: 1700, hard: 2300 };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(500, Number(prev.soft || 0) || 0), hard: Math.max(850, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1450, hard: 2600 } : { soft: TTT_V965_SOFT_DEADLINE_MS, hard: TTT_V965_HARD_DEADLINE_MS };
}

function tttV965TimeUp(deadline, margin) {
  return !!(deadline && tttV962Now() > deadline - (Number(margin || 0) || 0));
}

function tttV965PressureEntries(board, mark, deadline) {
  const basePool = tttV962CandidateSet(board, (tttV960Occupied(board) < 30 ? 3 : 2));
  const pool = basePool
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, mark) * 9 + tttCheapMovePotential(board, idx, mark === 'X' ? 'O' : 'X') * 4 + tttV962CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 32)
    .map(x => x.idx);
  const out = [];
  for (const idx of pool) {
    if (tttV965TimeUp(deadline, 24) && out.length) break;
    if (!tttV962Legal(board, idx)) continue;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark;
    const wins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const gains = tttV961GainEntries(board, mark, deadline);
    const topThreat = threats[0] || null;
    const topGain = gains[0] || null;
    const severeThreats = tttV962StrongThreatCount(threats, 72);
    const forcedThreats = tttV962StrongThreatCount(threats, 104);
    const severeGains = tttV962StrongThreatCount(gains, 82);
    const run = tttV962LineRunAfterMove(board, idx, mark);
    const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0;
    const cheap = tttCheapMovePotential(board, idx, mark);
    const diagonal = !!((topThreat && topThreat.diagonal) || (topGain && topGain.diagonal));
    const exact = !!((topThreat && topThreat.exact) || (topGain && topGain.exact));
    const gap = !!((topThreat && topThreat.gap) || (topGain && topGain.gap));
    const endpoint = !!((topThreat && topThreat.endpoint) || (topGain && topGain.endpoint));
    board[idx] = '';

    let level = 0;
    if (winNow) level = 260;
    else if (wins >= 2) level = 232;
    else if (wins === 1 && severeThreats >= 1) level = 212;
    else if (wins === 1) level = 194;
    else if (forcedThreats >= 2 || fork) level = 176;
    else if (forcedThreats >= 1 && severeThreats >= 2) level = 164;
    else if (severeThreats >= 3) level = 154;
    else if (severeThreats >= 2 && severeGains >= 1) level = 146;
    else if (run >= 4 && (topThreat || topGain)) level = 142;
    else if (topThreat && Number(topThreat.level || 0) >= 84) level = 136;
    else if (topGain && Number(topGain.level || 0) >= 92) level = 130;
    else if (diagonal && topThreat && Number(topThreat.level || 0) >= 66) level = 120;
    else if (topThreat && Number(topThreat.level || 0) >= 68 && topGain && Number(topGain.level || 0) >= 68) level = 118;
    else if (run >= 3 && cheap >= 28) level = 104;
    if (level < 104) continue;

    out.push({
      idx,
      level,
      hits: wins * 1200 + forcedThreats * 500 + severeThreats * 160 + severeGains * 120 + run * 40 + Math.round(cheap),
      immediateWins: wins,
      severeThreats,
      severeGains,
      forcedThreats,
      forkMove: fork,
      diagonal,
      exact,
      gap,
      endpoint,
      kinds: ['v965-pressure'].concat(topThreat && topThreat.kinds ? topThreat.kinds.slice(0, 3) : [])
    });
  }
  return tttV962UniqueEntries(out);
}

function tttV965ReplyDanger(board, deadline) {
  const xPressure = tttV965PressureEntries(board, 'X', deadline);
  const xKillers = tttV962KillerEntries(board, 'X', deadline);
  const wins = tttV960WinningMoves(board, 'X').length;
  const threats = tttV961ThreatEntries(board, 'X');
  const topP = xPressure[0] || null;
  const topK = xKillers[0] || null;
  const topT = threats[0] || null;
  return wins * 1e30
    + (topK ? Number(topK.level || 0) * 8e25 + Number(topK.hits || 0) * 2e22 : 0)
    + (topP ? Number(topP.level || 0) * 5e24 + Number(topP.hits || 0) * 8e21 : 0)
    + (topT ? Number(topT.level || 0) * 4e23 + Number(topT.hits || 0) * 6e20 : 0)
    + tttV962PositionRisk(board, 'X', deadline) * 2.1;
}

function tttV965MoveScore(board, idx, deadline) {
  if (!tttV962Legal(board, idx)) return -Infinity;
  const safety = tttV962SafetyReport(board, idx, deadline);
  board[idx] = 'O';
  const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
  const ownPressure = tttV965PressureEntries(board, 'O', deadline);
  const xPressure = tttV965PressureEntries(board, 'X', deadline);
  const ownTop = ownPressure[0] || null;
  const xTop = xPressure[0] || null;
  let worstReply = 0;
  const replyPool = tttV962UniqueEntries(xPressure.concat(tttV962KillerEntries(board, 'X', deadline)).concat(tttV961GainEntries(board, 'X', deadline))).slice(0, 10);
  for (const e of replyPool) {
    if (tttV965TimeUp(deadline, 30) && worstReply > 0) break;
    const reply = Number(e.idx);
    if (!tttV962Legal(board, reply)) continue;
    board[reply] = 'X';
    const danger = (tttWinner(board).winner === 'X' ? 1e34 : 0)
      + tttV960WinningMoves(board, 'X').length * 8e31
      + tttV965ReplyDanger(board, deadline);
    board[reply] = '';
    if (danger > worstReply) worstReply = danger;
  }
  const xDanger = tttV965ReplyDanger(board, deadline);
  const oDanger = tttV962PositionRisk(board, 'O', deadline);
  board[idx] = '';
  return ownWin * 1e36
    - Number(safety.immediateLosses || 0) * 1e34
    - Number(safety.killerCount || 0) * 8e32
    - Number(safety.killerLevel || 0) * 7e29
    - xDanger * 2.8
    - worstReply * 0.72
    - (xTop ? Number(xTop.level || 0) * 6e27 + Number(xTop.hits || 0) * 2e24 : 0)
    + (ownTop ? Number(ownTop.level || 0) * 8e27 + Number(ownTop.hits || 0) * 2e24 : 0)
    + oDanger * 0.48
    + tttCheapMovePotential(board, idx, 'X') * 26000
    + tttCheapMovePotential(board, idx, 'O') * 18000
    + tttV962CenterScore(idx) * 5200;
}

function tttV965PickRoot(board, candidates, deadline) {
  const list = Array.from(new Set((candidates || []).map(Number).filter(idx => tttV962Legal(board, idx)))).slice(0, 36);
  let best = -1;
  let bestScore = -Infinity;
  let safest = -1;
  let safestScore = -Infinity;
  for (const idx of list) {
    if (tttV965TimeUp(deadline, 36) && best >= 0) break;
    const score = tttV965MoveScore(board, idx, deadline);
    const safety = tttV962SafetyReport(board, idx, deadline);
    board[idx] = 'O';
    const pressureAfter = tttV965PressureEntries(board, 'X', deadline)[0] || null;
    board[idx] = '';
    const safe = safety.ownWinNow || (!safety.immediateLosses && !safety.killerCount && Number(safety.killerLevel || 0) < 132 && (!pressureAfter || Number(pressureAfter.level || 0) < 146));
    if (score > bestScore) { bestScore = score; best = idx; }
    if (safe && score > safestScore) { safestScore = score; safest = idx; }
  }
  return safest >= 0 ? safest : best;
}

function tttV965BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  if (tttWinner(board).winner) return tttNearestCenterFallbackMove(board);
  const budget = tttV965Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Math.max(900, Number(budget.hard || TTT_V965_HARD_DEADLINE_MS) - 360);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }
  if (occupied <= 12 && typeof tttV962BestMove === 'function') {
    const quick = tttV962BestMove(board, difficulty || 'ai');
    if (tttV962Legal(board, quick)) return quick;
  }

  const currentX = tttV961ThreatEntries(board, 'X');
  const forcedX = currentX.filter(e => Number(e.level || 0) >= 104 || (e.diagonal && Number(e.level || 0) >= 76) || (e.exact && Number(e.level || 0) >= 78));
  if (forcedX.length) {
    const block = tttV962PickDefense(board, forcedX, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const xPressure = tttV965PressureEntries(board, 'X', hardDeadline);
  const mustStop = xPressure.filter(e => Number(e.level || 0) >= 132 || Number(e.immediateWins || 0) >= 1 || Number(e.forcedThreats || 0) >= 1 || Number(e.severeThreats || 0) >= 2);
  if (mustStop.length) {
    const block = tttV962PickDefense(board, mustStop, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const xKillers = tttV962KillerEntries(board, 'X', hardDeadline).filter(e => Number(e.level || 0) >= 120 || (e.diagonal && Number(e.level || 0) >= 104));
  if (xKillers.length) {
    const block = tttV962PickDefense(board, xKillers, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const ownPressure = tttV965PressureEntries(board, 'O', hardDeadline).filter(e => Number(e.level || 0) >= 154);
  if (ownPressure.length) {
    const attack = tttV962PickDefense(board, ownPressure, hardDeadline);
    if (tttV962Legal(board, attack)) {
      const safety = tttV962SafetyReport(board, attack, hardDeadline);
      board[attack] = 'O';
      const replyDanger = tttV965ReplyDanger(board, hardDeadline);
      board[attack] = '';
      if (safety.ownWinNow || (!safety.immediateLosses && Number(safety.killerLevel || 0) < 176 && replyDanger < 1e31)) return attack;
    }
  }

  const candidates = tttV962CandidateSet(board, occupied < 30 ? 3 : 2)
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'X') * 9.5 + tttCheapMovePotential(board, idx, 'O') * 7.5 + tttV962CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 30 ? 30 : 24)
    .map(x => x.idx);
  const verified = tttV965PickRoot(board, candidates, hardDeadline);
  if (tttV962Legal(board, verified)) return verified;

  const v962 = typeof tttV962BestMove === 'function' ? tttV962BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v962)) return v962;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV965Health() {
  const budget = tttV965Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    multiImmediateLossBlock: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    antiForkDefense: true,
    antiOpenFourBuilderDefense: true,
    strategicPressureDefense: true,
    twoPlyReplyDangerScan: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: 'v965 strategic pressure scan + top reply danger check',
    softDeadlineMs: Number(budget.soft || TTT_V965_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V965_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v965.js',
    note: 'v965 víc brání dlouhé přípravy X kolem 19.–31. tahu. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV965Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV962Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV965Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV962Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV962Legal(board, block)) return block;
  const prev = typeof tttV962BestMove === 'function' ? tttV962BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}


// v.1.5 (966) – Piškvorky AI: priorita vlastního forcing tahu před slabým blokem.
const TTT_V966_SOFT_DEADLINE_MS = 2050;
const TTT_V966_HARD_DEADLINE_MS = 4200;

function tttV966Budget(difficulty) {
  const prev = typeof tttV965Budget === 'function' ? tttV965Budget(difficulty || 'ai') : { soft: 1900, hard: 3800 };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(520, Number(prev.soft || 0) || 0), hard: Math.max(900, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1500, hard: 2800 } : { soft: TTT_V966_SOFT_DEADLINE_MS, hard: TTT_V966_HARD_DEADLINE_MS };
}

function tttV966TimeUp(deadline, margin) {
  return !!(deadline && tttV962Now() > deadline - (Number(margin || 0) || 0));
}

function tttV966CountLevel(entries, minLevel) {
  const seen = new Set();
  for (const e of entries || []) {
    if (!e || seen.has(e.idx)) continue;
    if (Number(e.level || 0) >= Number(minLevel || 0)) seen.add(e.idx);
  }
  return seen.size;
}

function tttV966MoveProfile(board, idx, mark, deadline) {
  if (!tttV962Legal(board, idx)) return null;
  board[idx] = mark;
  const winNow = tttWinner(board).winner === mark;
  const wins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
  const threats = tttV961ThreatEntries(board, mark);
  const gains = tttV961GainEntries(board, mark, deadline);
  const pressure = typeof tttV965PressureEntries === 'function' ? tttV965PressureEntries(board, mark, deadline) : [];
  const topThreat = threats[0] || null;
  const topGain = gains[0] || null;
  const topPressure = pressure[0] || null;
  const run = typeof tttV962LineRunAfterMove === 'function' ? tttV962LineRunAfterMove(board, idx, mark) : 0;
  const severeThreats = tttV966CountLevel(threats, 84);
  const forcedThreats = tttV966CountLevel(threats, 110);
  const severeGains = tttV966CountLevel(gains, 92);
  const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0;
  board[idx] = '';
  const maxLevel = Math.max(Number(topThreat && topThreat.level || 0), Number(topGain && topGain.level || 0), Number(topPressure && topPressure.level || 0));
  return {
    idx,
    mark,
    winNow,
    wins,
    threats,
    gains,
    pressure,
    topThreat,
    topGain,
    topPressure,
    run,
    severeThreats,
    forcedThreats,
    severeGains,
    fork,
    maxLevel,
    diagonal: !!((topThreat && topThreat.diagonal) || (topGain && topGain.diagonal) || (topPressure && topPressure.diagonal)),
    exact: !!((topThreat && topThreat.exact) || (topGain && topGain.exact) || (topPressure && topPressure.exact)),
    gap: !!((topThreat && topThreat.gap) || (topGain && topGain.gap) || (topPressure && topPressure.gap)),
    hits: wins * 1600 + forcedThreats * 560 + severeThreats * 190 + severeGains * 150 + run * 55 + Number(topThreat && topThreat.hits || 0) + Number(topGain && topGain.hits || 0)
  };
}

function tttV966ForcingEntries(board, mark, deadline) {
  const occupied = typeof tttV960Occupied === 'function' ? tttV960Occupied(board) : board.filter(Boolean).length;
  const pool = new Set();
  const priority = new Set();
  const addPriority = (idx) => { const n = Number(idx); if (Number.isFinite(n)) { pool.add(n); priority.add(n); } };
  try { tttV961ThreatEntries(board, mark).slice(0, 52).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV961GainEntries(board, mark, deadline).slice(0, 42).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV965PressureEntries(board, mark, deadline).slice(0, 42).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV962KillerEntries(board, mark, deadline).slice(0, 34).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV962CandidateSet(board, occupied < 34 ? 3 : 2).forEach(idx => pool.add(Number(idx))); } catch (_) {}
  const candidates = Array.from(pool).map(Number).filter(idx => tttV962Legal(board, idx))
    .map(idx => ({
      idx,
      score: (priority.has(idx) ? 1e9 : 0)
        + tttCheapMovePotential(board, idx, mark) * 140
        + tttCheapMovePotential(board, idx, mark === 'X' ? 'O' : 'X') * 18
        + tttV962CenterScore(idx)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 34 ? 56 : 44)
    .map(item => item.idx);
  const out = [];
  for (const idx of candidates) {
    if (tttV966TimeUp(deadline, 28) && out.length >= 8) break;
    const p = tttV966MoveProfile(board, idx, mark, deadline);
    if (!p) continue;
    let level = 0;
    if (p.winNow) level = 300;
    else if (p.wins >= 2) level = 276;                 // otevřená čtyřka / dvě koncovky
    else if (p.wins === 1 && (p.run >= 4 || p.severeThreats >= 1)) level = 244; // udělej čtyřku
    else if (p.wins === 1) level = 228;
    else if (p.forcedThreats >= 2 || p.fork) level = 206;
    else if (p.forcedThreats >= 1 && p.severeThreats >= 2) level = 190;
    else if (p.severeThreats >= 3) level = 178;
    else if (p.severeThreats >= 2 && p.severeGains >= 1) level = 166;
    else if (p.run >= 4 && p.maxLevel >= 84) level = 160;
    else if (p.maxLevel >= 136) level = 150;
    else if (p.run >= 3 && p.maxLevel >= 84) level = 134;
    if (level < 134) continue;
    out.push(Object.assign({}, p, {
      level,
      kinds: ['v966-forcing'],
      endpoint: !!(p.topThreat && p.topThreat.endpoint),
      immediateWins: p.wins
    }));
  }
  return tttV962UniqueEntries(out);
}

function tttV966PickForcingMove(board, entries, deadline) {
  const list = tttV962UniqueEntries(entries).filter(e => tttV962Legal(board, e.idx)).slice(0, 28);
  let best = -1;
  let bestScore = -Infinity;
  for (const e of list) {
    if (tttV966TimeUp(deadline, 30) && best >= 0) break;
    const idx = Number(e.idx);
    const safety = tttV962SafetyReport(board, idx, deadline);
    board[idx] = 'O';
    const xImmediate = tttV960WinningMoves(board, 'X').length;
    const ownImmediate = tttV960WinningMoves(board, 'O').length;
    const replyDanger = typeof tttV965ReplyDanger === 'function' ? tttV965ReplyDanger(board, deadline) : 0;
    const xPressure = typeof tttV965PressureEntries === 'function' ? tttV965PressureEntries(board, 'X', deadline)[0] : null;
    board[idx] = '';
    if (xImmediate > 0 && ownImmediate < 2) continue;
    const score = Number(e.level || 0) * 1e28
      + Number(e.hits || 0) * 1e24
      + ownImmediate * 8e31
      + (e.run || 0) * 6e25
      + (e.fork ? 8e27 : 0)
      + (e.diagonal ? 4e24 : 0)
      - Number(safety.immediateLosses || 0) * 1e34
      - Number(safety.killerCount || 0) * 6e31
      - Math.max(0, Number(safety.killerLevel || 0) - 176) * 4e28
      - (xPressure ? Math.max(0, Number(xPressure.level || 0) - 170) * 6e26 : 0)
      - replyDanger * 0.12
      + tttV962CenterScore(idx) * 4200;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}


function tttV966DirectForcingEntries(board, mark, deadline) {
  const seeds = new Set();
  try { tttV961ThreatEntries(board, mark).slice(0, 38).forEach(e => seeds.add(Number(e.idx))); } catch (_) {}
  try { tttV960WinningMoves(board, mark).forEach(idx => seeds.add(Number(idx))); } catch (_) {}
  const opponent = mark === 'X' ? 'O' : 'X';
  try { tttV961ThreatEntries(board, opponent).slice(0, 16).forEach(e => seeds.add(Number(e.idx))); } catch (_) {}
  const out = [];
  for (const idx of Array.from(seeds).filter(idx => tttV962Legal(board, idx)).slice(0, 42)) {
    if (tttV966TimeUp(deadline, 16) && out.length) break;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark;
    const wins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const top = threats[0] || null;
    const run = typeof tttV962LineRunAfterMove === 'function' ? tttV962LineRunAfterMove(board, idx, mark) : 0;
    const severe = tttV966CountLevel(threats, 84);
    const forced = tttV966CountLevel(threats, 110);
    board[idx] = '';
    if (!winNow && wins < 1 && forced < 2 && !(run >= 4 && top && Number(top.level || 0) >= 84)) continue;
    let level = 0;
    if (winNow) level = 320;
    else if (wins >= 2) level = 286;
    else if (wins === 1 && run >= 4) level = 252;
    else if (wins === 1) level = 232;
    else if (forced >= 2) level = 204;
    else if (run >= 4) level = 176;
    out.push({ idx, level, hits: wins * 2000 + forced * 480 + severe * 120 + run * 50 + (top ? Number(top.hits || 0) : 0), immediateWins: wins, run, forcedThreats: forced, severeThreats: severe, diagonal: !!(top && top.diagonal), endpoint: !!(top && top.endpoint), gap: !!(top && top.gap), exact: !!(top && top.exact), kinds: ['v966-direct-forcing'] });
  }
  return tttV962UniqueEntries(out);
}

function tttV966PickDirectForcing(board, entries, deadline) {
  const list = tttV962UniqueEntries(entries).filter(e => tttV962Legal(board, e.idx)).slice(0, 16);
  let best = -1;
  let bestScore = -Infinity;
  for (const e of list) {
    const idx = Number(e.idx);
    if (tttV966TimeUp(deadline, 18) && best >= 0) break;
    board[idx] = 'O';
    const xWins = tttV960WinningMoves(board, 'X').length;
    const oWins = tttV960WinningMoves(board, 'O').length;
    const xTop = tttV961ThreatEntries(board, 'X')[0] || null;
    board[idx] = '';
    if (xWins > 0 && oWins < 2) continue;
    const score = Number(e.level || 0) * 1e12
      + Number(e.hits || 0) * 1e8
      + oWins * 1e13
      - xWins * 1e14
      - (xTop ? Math.max(0, Number(xTop.level || 0) - 116) * 1e9 : 0)
      + tttV962CenterScore(idx) * 1000;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV966BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  if (tttWinner(board).winner) return tttNearestCenterFallbackMove(board);
  const budget = tttV966Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Math.max(900, Number(budget.hard || TTT_V966_HARD_DEADLINE_MS) - 520);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const currentX = tttV961ThreatEntries(board, 'X');
  const xForcedFour = currentX.filter(e => Number(e.level || 0) >= 110);
  if (xForcedFour.length) {
    const block = Number(xForcedFour[0].idx);
    if (tttV962Legal(board, block)) return block;
  }

  // Rychlá prioritní vrstva: vlastní čtyřka / přímý forcing před blokem slabé trojky.
  const directOwn = tttV966DirectForcingEntries(board, 'O', hardDeadline).filter(e => Number(e.level || 0) >= 232 || Number(e.immediateWins || 0) >= 1);
  if (directOwn.length) {
    const attack = tttV966PickDirectForcing(board, directOwn, hardDeadline);
    if (tttV962Legal(board, attack)) return attack;
  }

  const directX = tttV966DirectForcingEntries(board, 'X', hardDeadline).filter(e => Number(e.level || 0) >= 252 || Number(e.immediateWins || 0) >= 2);
  if (directX.length) {
    const block = Number(directX[0].idx);
    if (tttV962Legal(board, block)) return block;
  }

  const v965 = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v965)) return v965;
  const v962 = typeof tttV962BestMove === 'function' ? tttV962BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v962)) return v962;
  return tttNearestCenterFallbackMove(board);
}
function getRakGomokuAiV966Health() {
  const budget = tttV966Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    ownForcingBeforeWeakBlock: true,
    openFourAttack: true,
    blockedThreeDeprioritized: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: 'v966 forcing priority layer over v965',
    softDeadlineMs: Number(budget.soft || TTT_V966_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V966_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v966.js',
    note: 'v966 dává vlastnímu forcing tahu přednost před blokem slabé nebo z jedné strany zavřené trojky. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV966Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV965Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV962Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV966Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV966BestMove === 'function' ? tttV966BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV962Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV962Legal(board, block)) return block;
  const prev = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}

// v.1.5 (988) – Piškvorky AI: tvrdší offline vrstva proti rychlým výhrám 17–27 tahů.
// Online PvP zůstává člověk proti člověku; tahle vrstva se používá jen v lokální AI cestě tttBestMove().
const TTT_V983_SOFT_DEADLINE_MS = 2450;
const TTT_V983_HARD_DEADLINE_MS = 4700;

function tttV983Budget(difficulty) {
  const prev = typeof tttV966Budget === 'function' ? tttV966Budget(difficulty || 'ai') : { soft: TTT_V966_SOFT_DEADLINE_MS, hard: TTT_V966_HARD_DEADLINE_MS };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(520, Number(prev.soft || 0) || 0), hard: Math.max(900, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1650, hard: 3100 } : { soft: TTT_V983_SOFT_DEADLINE_MS, hard: TTT_V983_HARD_DEADLINE_MS };
}

function tttV983UniqueMoves(list) {
  const out = [];
  const seen = new Set();
  (list || []).forEach((item) => {
    const idx = Number(item && typeof item === 'object' ? item.idx : item);
    if (!Number.isFinite(idx) || seen.has(idx)) return;
    seen.add(idx);
    out.push(item && typeof item === 'object' ? item : { idx });
  });
  return out;
}

function tttV983UrgentDefenseMove(board, deadline) {
  const entries = [];
  const push = (item, source) => {
    const idx = Number(item && typeof item === 'object' ? item.idx : item);
    if (!tttV962Legal(board, idx)) return;
    entries.push(Object.assign({ source }, item && typeof item === 'object' ? item : { idx }));
  };
  try { tttV960WinningMoves(board, 'X').forEach(idx => push({ idx, level: 999, immediateWins: 1 }, 'x-win')); } catch (_) {}
  try { tttV961ThreatEntries(board, 'X').slice(0, 18).forEach(e => push(e, 'x-threat')); } catch (_) {}
  if (!entries.some(e => Number(e.level || 0) >= 136 || Number(e.immediateWins || 0) > 0)) {
    try {
      const gainDeadline = Math.min(Number(deadline || 0) || (tttV962Now() + 260), tttV962Now() + 260);
      tttV961GainEntries(board, 'X', gainDeadline).slice(0, 8).forEach(e => push(e, 'x-gain'));
    } catch (_) {}
  }
  const urgent = tttV983UniqueMoves(entries)
    .filter(e => tttV962Legal(board, e.idx))
    .map((e) => {
      const idx = Number(e.idx);
      board[idx] = 'X';
      const xWinsAfter = tttV960WinningMoves(board, 'X').length;
      const xThreatsAfter = tttV961ThreatEntries(board, 'X');
      const xForcedAfter = typeof tttV966CountLevel === 'function' ? tttV966CountLevel(xThreatsAfter, 110) : 0;
      const xSevereAfter = typeof tttV966CountLevel === 'function' ? tttV966CountLevel(xThreatsAfter, 84) : 0;
      const xRun = typeof tttV962LineRunAfterMove === 'function' ? tttV962LineRunAfterMove(board, idx, 'X') : 0;
      board[idx] = '';
      board[idx] = 'O';
      const oWinsAfterBlock = tttV960WinningMoves(board, 'O').length;
      const xImmediateAfterBlock = tttV960WinningMoves(board, 'X').length;
      board[idx] = '';
      const baseLevel = Number(e.level || 0) || 0;
      const score = xWinsAfter * 1e18
        + xForcedAfter * 9e15
        + xSevereAfter * 4e14
        + Math.max(0, baseLevel - 70) * 2e12
        + xRun * 7e12
        + (e.exact ? 5e12 : 0)
        + (e.gap ? 3e12 : 0)
        + (e.diagonal ? 2e12 : 0)
        + tttCheapMovePotential(board, idx, 'X') * 9e9
        + tttCheapMovePotential(board, idx, 'O') * 3e9
        + tttV962CenterScore(idx) * 12000
        + oWinsAfterBlock * 8e13
        - xImmediateAfterBlock * 4e17;
      return Object.assign({}, e, { idx, score, xWinsAfter, xForcedAfter, xSevereAfter, xRun, oWinsAfterBlock, xImmediateAfterBlock });
    })
    .filter(e => e.xWinsAfter > 0 || e.xForcedAfter >= 1 || e.xSevereAfter >= 2 || Number(e.level || 0) >= 128)
    .sort((a, b) => b.score - a.score);
  const best = urgent[0];
  return best && tttV962Legal(board, best.idx) ? Number(best.idx) : -1;
}

function tttV983ValidatedCandidate(board, candidate, deadline) {
  const idx = Number(candidate);
  if (!tttV962Legal(board, idx)) return -1;
  const safetyDeadline = Math.min(Number(deadline || 0) || (tttV962Now() + 650), tttV962Now() + 650);
  const safety = typeof tttV962SafetyReport === 'function' ? tttV962SafetyReport(board, idx, safetyDeadline) : { immediateLosses: 0, killerCount: 0, killerLevel: 0 };
  if (Number(safety.immediateLosses || 0) > 0) return -1;
  if (Number(safety.killerCount || 0) > 1 && Number(safety.killerLevel || 0) >= 206) return -1;
  return idx;
}

function tttV983BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  if (tttWinner(board).winner) return tttNearestCenterFallbackMove(board);
  const budget = tttV983Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Math.max(1000, Number(budget.hard || TTT_V983_HARD_DEADLINE_MS) - 560);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];
  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (tttV962Legal(board, opening)) return opening;
  }

  // Nejdřív zkus vlastní silný forcing, ale jen když nezpůsobí okamžitou ztrátu.
  try {
    const ownForce = tttV966DirectForcingEntries(board, 'O', hardDeadline)
      .filter(e => Number(e.level || 0) >= 232 || Number(e.immediateWins || 0) >= 1);
    const attack = tttV966PickDirectForcing(board, ownForce, hardDeadline);
    const attackInfo = ownForce.find(e => Number(e && e.idx) === Number(attack)) || null;
    if (tttV962Legal(board, attack) && attackInfo && (Number(attackInfo.immediateWins || 0) >= 2 || Number(attackInfo.level || 0) >= 286)) return attack;
    const safeAttack = tttV983ValidatedCandidate(board, attack, hardDeadline);
    if (tttV962Legal(board, safeAttack)) return safeAttack;
  } catch (_) {}

  const urgentDefense = tttV983UrgentDefenseMove(board, hardDeadline);
  if (tttV962Legal(board, urgentDefense)) return urgentDefense;

  const v966 = typeof tttV966BestMove === 'function' ? tttV966BestMove(board, difficulty || 'ai') : -1;
  const safeV966 = tttV983ValidatedCandidate(board, v966, hardDeadline);
  if (tttV962Legal(board, safeV966)) return safeV966;

  const fallbackDefense = tttV983UrgentDefenseMove(board, hardDeadline);
  if (tttV962Legal(board, fallbackDefense)) return fallbackDefense;

  if (tttV962Legal(board, v966)) return v966;
  const v965 = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v965)) return v965;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV983Health() {
  const budget = tttV983Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    urgentDefenseLayer: true,
    validatedForcingAttack: true,
    fastWinDefenseTarget: 'výhry 17–27 tahů',
    softDeadlineMs: Number(budget.soft || TTT_V983_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V983_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v966.js',
    note: 'v983 přidává tvrdší obrannou vrstvu proti gain/fork/forcing tahům člověka před původní v966 vrstvu. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV983Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV966Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV965Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV962Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV983Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV983BestMove === 'function' ? tttV983BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV962Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV962Legal(board, block)) return block;
  const prev = typeof tttV966BestMove === 'function' ? tttV966BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}

function tttHardWinLog() {
  return [];
}

function tttSaveHardWin(entry) {
  void entry;
}

function tttFormatElapsed(ms) {
  const total = Math.max(0, Number(ms) || 0);
  const seconds = total > 0 ? Math.max(1, Math.floor(total / 1000)) : 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes <= 0) return secs + ' s';
  return minutes + ' min ' + String(secs).padStart(2, '0') + ' s';
}

function tttEnsureGameClockStarted(state) {
  const s = state || tttGetState();
  if (!s.startedAt || !Number.isFinite(Number(s.startedAt))) {
    s.startedAt = Date.now();
  }
  return s.startedAt;
}

function tttGetElapsedMs(state) {
  const s = state || tttGetState();
  const start = Number(s.startedAt || 0) || 0;
  if (!start) return 0;
  return Math.max(0, Date.now() - start);
}

function tttReadHardWinStats() {
  const state = tttGetState();
  const elapsedMs = tttGetElapsedMs(state);
  return {
    totalMoves: state.moveCount || 0,
    xMoves: state.moveCountX || 0,
    oMoves: state.moveCountO || 0,
    elapsedMs,
    elapsedText: tttFormatElapsed(elapsedMs)
  };
}

function tttHardWinKey(entry) {
  return [
    String(entry && entry.name ? entry.name : '').trim().toLowerCase(),
    String(entry && entry.date ? entry.date : '').trim(),
    String(entry && entry.difficulty ? entry.difficulty : '').trim().toLowerCase(),
    String(entry && (entry.totalMoves ?? entry.moves) ? (entry.totalMoves ?? entry.moves) : 0),
    String(entry && (entry.elapsedMs ?? entry.elapsed_ms) ? (entry.elapsedMs ?? entry.elapsed_ms) : 0)
  ].join('|');
}

function tttNormalizeHardWinEntry(entry) {
  const elapsedMs = Number(entry && (entry.elapsedMs ?? entry.elapsed_ms) ? (entry.elapsedMs ?? entry.elapsed_ms) : 0) || 0;
  const elapsedText = String(entry && (entry.elapsedText ?? entry.elapsed_text) ? (entry.elapsedText ?? entry.elapsed_text) : '').trim() || tttFormatElapsed(elapsedMs);
  return {
    name: String(entry && (entry.name ?? entry.player_name) ? (entry.name ?? entry.player_name) : '').trim(),
    difficulty: String(entry && entry.difficulty ? entry.difficulty : '').trim(),
    totalMoves: Number(entry && (entry.totalMoves ?? entry.moves) ? (entry.totalMoves ?? entry.moves) : 0) || 0,
    xMoves: Number(entry && (entry.xMoves ?? entry.x_moves) ? (entry.xMoves ?? entry.x_moves) : 0) || 0,
    oMoves: Number(entry && (entry.oMoves ?? entry.o_moves) ? (entry.oMoves ?? entry.o_moves) : 0) || 0,
    elapsedMs,
    elapsedText,
    date: String(entry && (entry.date ?? entry.created_at) ? (entry.date ?? entry.created_at) : '').trim(),
    appVersion: String(entry && (entry.appVersion ?? entry.app_version) ? (entry.appVersion ?? entry.app_version) : '').trim(),
    rulesetVersion: String(entry && (entry.rulesetVersion ?? entry.ruleset_version) ? (entry.rulesetVersion ?? entry.ruleset_version) : GOMOKU_RULESET_VERSION).trim() || GOMOKU_RULESET_VERSION,
    note: String(entry && entry.note ? entry.note : '').trim()
  };
}

function tttGetHardWinRows() {
  const state = tttGetState();
  const remote = Array.isArray(state.hardWinRemote) ? state.hardWinRemote : [];

  const currentRuleset = String(GOMOKU_RULESET_VERSION || '').trim();
  const normalized = remote
    .map(tttNormalizeHardWinEntry)
    .filter(entry => entry.name)
    .filter(entry => !currentRuleset || String(entry.rulesetVersion || '').trim() === currentRuleset);

  normalized.sort((a, b) => {
    const moveDiff = (a.totalMoves || 0) - (b.totalMoves || 0);
    if (moveDiff) return moveDiff;
    const timeDiff = (a.elapsedMs || 0) - (b.elapsedMs || 0);
    if (timeDiff) return timeDiff;
    return String(b.date || '').localeCompare(String(a.date || ''));
  });

  return normalized.slice(0, 10);
}

function tttUpdateDashboardMeta() {
  const el = document.getElementById('dashTttMeta');
  if (!el) return;
  el.classList.remove('isLoading');
  el.textContent = '';
}

async function tttRefreshHardWinRows(forceRender) {
  const state = tttGetState();
  if (state.hardWinLoading) return state.hardWinRemote || [];
  state.hardWinLoading = true;
  tttUpdateDashboardMeta();
  tttRender();
  try {
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadGomokuWins === 'function') {
      const rows = await window.RotationSupabaseBridge.loadGomokuWins(25, { rulesetVersion: GOMOKU_RULESET_VERSION });
      state.hardWinRemote = Array.isArray(rows) ? rows : [];
    }
    state.hardWinLoaded = true;
  } catch (err) {
    console.error('TTT leaderboard load failed', err);
    state.hardWinLoaded = true;
  } finally {
    state.hardWinLoading = false;
    tttUpdateDashboardMeta();
  }
  if (forceRender !== false && document.getElementById('tttOverlay')?.classList.contains('isVisible')) {
    tttRender();
  }
  return state.hardWinRemote || [];
}

function tttFormatHardWinDateTime(value) {
  if (typeof gamesFormatPlayedLabel === 'function') return gamesFormatPlayedLabel(value);
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat('cs-CZ', {
      timeZone: 'Europe/Prague',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch (err) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear());
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return dd + '.' + mm + '.' + yy + ' ' + hh + ':' + mi;
  }
}

function tttBuildHardWinTableHtml() {
  const state = tttGetState();
  const rows = tttGetHardWinRows();
  if (state.hardWinLoading && !rows.length) {
    return '<div class="smallText">Načítám online výsledky…</div>';
  }
  if (!rows.length) {
    return '<div class="smallText">Zatím žádné online výsledky.</div>';
  }

  const rowsHtml = rows.map((row, idx) => {
    const dateText = row.date ? tttFormatHardWinDateTime(row.date) : '—';
    return '<tr>' +
      '<td>' + escapeHtml(String(idx + 1)) + '</td>' +
      '<td>' + escapeHtml(row.name || '—') + '</td>' +
      '<td>' + escapeHtml(formatCount(row.totalMoves || 0)) + '</td>' +
      '<td>' + escapeHtml(row.elapsedText || '—') + '</td>' +
      '<td>' + escapeHtml(dateText || '—') + '</td>' +
      '</tr>';
  }).join('');

  return [
    '<div class="tableWrap tttWinHistory">',
    '  <table class="tttWinTable">',
    '    <thead><tr><th>#</th><th>Jméno</th><th>Tahy</th><th>Čas</th><th>Datum a čas</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}


function tttNormalizeOnlineScoreRow(row) {
  const a = String(row && (row.playerA || row.player_a || row.a || row.account_a) || '').trim();
  const b = String(row && (row.playerB || row.player_b || row.b || row.account_b) || '').trim();
  if (!a || !b || a === b) return null;
  return {
    playerA: a,
    playerB: b,
    nameA: String(row && (row.nameA || row.name_a) || '').trim() || tttGetAccountDisplayName(a),
    nameB: String(row && (row.nameB || row.name_b) || '').trim() || tttGetAccountDisplayName(b),
    aWins: Number(row && (row.aWins ?? row.a_wins) || 0) || 0,
    bWins: Number(row && (row.bWins ?? row.b_wins) || 0) || 0,
    draws: Number(row && row.draws || 0) || 0,
    total: Number(row && row.total || 0) || 0,
    lastPlayedAt: String(row && (row.lastPlayedAt || row.last_played_at || row.updated_at) || '').trim()
  };
}

function tttBuildOnlineScoreTableHtml() {
  const state = tttGetState();
  const rows = Array.isArray(state.onlineScoreRemote) ? state.onlineScoreRemote.map(tttNormalizeOnlineScoreRow).filter(Boolean) : [];
  if (state.onlineScoreLoading && !rows.length) {
    return '<div class="smallText">Načítám online skóre…</div>';
  }
  if (!rows.length) {
    return '<div class="smallText">Zatím tu nejsou žádné dokončené online duely mezi hráči.</div>';
  }
  const rowsHtml = rows.slice(0, 12).map((row, idx) => {
    const draws = row.draws ? (' · remízy ' + escapeHtml(formatCount(row.draws))) : '';
    return '<tr>' +
      '<td>' + escapeHtml(String(idx + 1)) + '</td>' +
      '<td>' + escapeHtml(row.nameA || row.playerA) + '</td>' +
      '<td><strong>' + escapeHtml(formatCount(row.aWins)) + ':' + escapeHtml(formatCount(row.bWins)) + '</strong>' + draws + '</td>' +
      '<td>' + escapeHtml(row.nameB || row.playerB) + '</td>' +
      '<td>' + escapeHtml(formatCount(row.total || 0)) + '</td>' +
      '</tr>';
  }).join('');
  return [
    '<div class="tableWrap tttWinHistory tttOnlineScoreHistory">',
    '  <table class="tttWinTable tttOnlineScoreTable">',
    '    <thead><tr><th>#</th><th>Hráč A</th><th>Skóre</th><th>Hráč B</th><th>Her</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

async function tttRefreshOnlineScoreRows(forceRender) {
  const state = tttGetState();
  if (state.onlineScoreLoading) return state.onlineScoreRemote || [];
  state.onlineScoreLoading = true;
  if (forceRender !== false && document.getElementById('tttOverlay')?.classList.contains('isVisible') && state.screen === 'start' && state.mode === 'pvp') {
    tttRender();
  }
  try {
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadTttHeadToHeadList === 'function') {
      const result = await window.RotationSupabaseBridge.loadTttHeadToHeadList({ force: !!forceRender, limit: 150 });
      const rows = result && Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : []);
      state.onlineScoreRemote = rows;
    }
    state.onlineScoreLoaded = true;
    state.onlineScoreLoadedAt = Date.now();
  } catch (err) {
    console.warn('TTT online score list load failed', err);
    state.onlineScoreLoaded = true;
    state.onlineScoreLoadedAt = Date.now();
  } finally {
    state.onlineScoreLoading = false;
  }
  if (forceRender !== false && document.getElementById('tttOverlay')?.classList.contains('isVisible') && state.screen === 'start' && state.mode === 'pvp') {
    tttRender();
  }
  return state.onlineScoreRemote || [];
}

function tttBuildStartLeaderboardHtml() {
  const state = tttGetState();
  if (state.mode === 'ai') {
    return [
      '<div class="tttCard tttWinHistory">',
      '  <div class="tttSectionTitle">Kdo porazil AI</div>',
      '  <div class="tttNote">Žebříček online · aktuální pravidla Piškvorek.</div>',
      '  ' + tttBuildHardWinTableHtml(),
      '</div>'
    ].join('');
  }
  if (state.mode === 'pvp') {
    return [
      '<div class="tttCard tttWinHistory tttOnlineScoreCard">',
      '  <div class="tttSectionTitle">Online vzájemné skóre</div>',
      '  <div class="tttNote">Zobrazují se jen dvojice hráčů, které už proti sobě odehrály online partii.</div>',
      '  ' + tttBuildOnlineScoreTableHtml(),
      '</div>'
    ].join('');
  }
  return '';
}

function tttFillHardWinPrompt() {
  const overlay = document.getElementById('tttOverlay');
  if (!overlay) return;
  const state = tttGetState();
  const modal = overlay.querySelector('#tttWinModal');
  const visible = !!state.hardWinPrompt && !!state.hardWinStats;

  if (!modal) return;
  modal.style.display = visible ? 'flex' : 'none';
  modal.classList.toggle('isVisible', visible);
  if (!visible) return;

  const stats = state.hardWinStats || tttReadHardWinStats();
  const nameInput = overlay.querySelector('#tttWinName');
  const movesEl = overlay.querySelector('#tttWinMoves');
  const timeEl = overlay.querySelector('#tttWinTime');
  const modeEl = overlay.querySelector('#tttWinMode');

  if (nameInput) {
    const remembered = state.hardWinName || (typeof getLocalStorageCached === 'function' ? getLocalStorageCached('tttHardWinName', '') : localStorage.getItem('tttHardWinName')) || '';
    if (!nameInput.value) nameInput.value = remembered;
    state.hardWinName = nameInput.value;
  }
  if (movesEl) movesEl.textContent = formatCount(stats.totalMoves) + ' tahů';
  if (timeEl) timeEl.textContent = stats.elapsedText;
  if (modeEl) modeEl.textContent = state.mode === 'ai'
    ? ('AI · ' + (state.difficulty === 'ai' ? 'nejtěžší' : state.difficulty))
    : 'Proti spoluhráči';
}

function tttCloseHardWinPrompt() {
  const state = tttGetState();
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  tttRender();
  scheduleTttLayout();
}

function tttOpenHardWinPrompt() {
  void tttSubmitHardWin();
}

async function tttSendHardWinEntry(entry) {
  try {
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.sendGomokuWin === 'function') {
      const result = await window.RotationSupabaseBridge.sendGomokuWin(entry);
      if (!result || result.ok !== true) {
        console.error('TTT online save failed', result && result.error ? result.error : result);
        return result || { ok: false, reason: 'unknown' };
      }
      return result;
    }
    return { ok: false, reason: 'missing-bridge' };
  } catch (err) {
    console.error('TTT online save failed', err);
    return { ok: false, error: err };
  }
}

async function tttSubmitHardWin() {
  const state = tttGetState();
  const fallbackName = String(gamesGetActiveAccount()?.name || state.hardWinName || (typeof getLocalStorageCached === 'function' ? getLocalStorageCached('tttHardWinName', '') : localStorage.getItem('tttHardWinName')) || 'Hráč').trim() || 'Hráč';
  state.hardWinName = fallbackName;
  try {
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged('tttHardWinName', fallbackName);
    else localStorage.setItem('tttHardWinName', fallbackName);
  } catch (err) {
    console.warn(err);
  }

  const stats = state.hardWinStats || tttReadHardWinStats();
  const entry = {
    name: fallbackName,
    date: new Date().toISOString(),
    mode: state.mode,
    difficulty: state.difficulty,
    totalMoves: stats.totalMoves,
    xMoves: stats.xMoves,
    oMoves: stats.oMoves,
    elapsedMs: stats.elapsedMs,
    elapsedText: stats.elapsedText,
    rulesetVersion: GOMOKU_RULESET_VERSION,
    note: 'Výhra nad nejtvrdší AI'
  };

  const result = await tttSendHardWinEntry(entry);
  await new Promise(resolve => setTimeout(resolve, 120));

  if (result && result.ok === false) {
    console.warn('TTT hard win save failed', result.error || result.reason || result);
    return;
  }

  const current = tttGetState();
  current.resultOnlineSaved = true;
  current.resultSaved = true;
  current.resultSummary = tttBuildResultSummary(current.winner || 'X');
  await tttRefreshHardWinRows(true);
  if (typeof tttRender === 'function') tttRender();
}


function getRakGomokuRulesetLeaderboardHealth() {
  const state = tttGetState();
  const rows = Array.isArray(state.hardWinRemote) ? state.hardWinRemote.map(tttNormalizeHardWinEntry).filter(Boolean) : [];
  const currentRuleset = String(GOMOKU_RULESET_VERSION || '').trim();
  const visibleRows = rows.filter(row => !currentRuleset || String(row.rulesetVersion || '').trim() === currentRuleset);
  return {
    ok: true,
    version: window.APP_VERSION || '1.2 (1.108)',
    game: 'ttt',
    rulesetVersion: currentRuleset,
    appVersionIsSeparate: true,
    remoteRowsLoaded: rows.length,
    visibleCurrentRulesetRows: visibleRows.length,
    loadFilter: 'supabase gomoku_wins.ruleset_version = ' + currentRuleset,
    sort: 'UI sorts by moves, elapsedMs, created_at; Supabase query orders by created_at only',
    note: 'Ruleset verzi zvyšovat jen při změně AI obtížnosti/pravidel, ne při vzhledové úpravě aplikace.'
  };
}
if (typeof window !== 'undefined') window.getRakGomokuRulesetLeaderboardHealth = getRakGomokuRulesetLeaderboardHealth;


function tttBuildResultSummary(winner) {
  const state = tttGetState();
  const stats = tttReadHardWinStats();
  const title = winner === 'draw'
    ? 'Remíza'
    : (winner === 'X' ? (state.mode === 'ai' ? 'Vyhrál jsi nad AI' : 'Vyhrál hráč X') : (state.mode === 'ai' ? 'Vyhrála AI' : 'Vyhrál hráč O'));
  const detail = winner === 'draw'
    ? 'Nikdo nedal pět v řadě.'
    : (winner === 'X'
      ? 'Pětice X je zvýrazněná přímo v mřížce.'
      : 'Pětice O je zvýrazněná přímo v mřížce.');
  return {
    title,
    detail,
    moves: stats.totalMoves,
    xMoves: stats.xMoves,
    oMoves: stats.oMoves,
    elapsedText: stats.elapsedText,
    savedText: state.resultOnlineSaved ? 'Zapsáno online i do profilu.' : (state.resultSaved ? 'Zapsáno do profilu. Online se případně dosynchronizuje.' : 'Výsledek čeká na zápis.')
  };
}

function tttMarkResultSaved(winner) {
  const state = tttGetState();
  state.resultSaved = true;
  state.resultSummary = tttBuildResultSummary(winner);
}

function tttRenderResultCard(overlay, winner) {
  const card = overlay ? overlay.querySelector('#tttResultCard') : null;
  if (!card) return;
  const state = tttGetState();
  if (!state.gameOver || !winner) {
    card.hidden = true;
    card.classList.remove('isVisible', 'isWin', 'isLoss', 'isDraw');
    card.textContent = '';
    return;
  }
  const summary = state.resultSummary || tttBuildResultSummary(winner);
  state.resultSummary = summary;
  card.hidden = false;
  card.classList.add('isVisible');
  card.classList.toggle('isWin', winner === 'X');
  card.classList.toggle('isLoss', winner === 'O');
  card.classList.toggle('isDraw', winner === 'draw');
  const rows = [
    ['Tahy', String(summary.moves || 0)],
    ['X / O', String(summary.xMoves || 0) + ' / ' + String(summary.oMoves || 0)],
    ['Čas', summary.elapsedText || '0 s']
  ];
  const fragment = document.createDocumentFragment();
  const title = document.createElement('div');
  title.className = 'tttResultTitle';
  title.textContent = summary.title || 'Konec hry';
  fragment.appendChild(title);
  const detail = document.createElement('div');
  detail.className = 'tttResultDetail';
  detail.textContent = summary.detail || '';
  fragment.appendChild(detail);
  const grid = document.createElement('div');
  grid.className = 'tttResultStats';
  rows.forEach(([label, value]) => {
    const item = document.createElement('div');
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const valueEl = document.createElement('strong');
    valueEl.textContent = value;
    item.appendChild(labelEl);
    item.appendChild(valueEl);
    grid.appendChild(item);
  });
  fragment.appendChild(grid);
  const saved = document.createElement('div');
  saved.className = 'tttResultSaved';
  saved.textContent = summary.savedText || '';
  fragment.appendChild(saved);

  const actions = document.createElement('div');
  actions.className = 'tttResultActions';
  const restartBtn = document.createElement('button');
  restartBtn.type = 'button';
  restartBtn.className = 'tttBtn tttResultRestartBtn';
  restartBtn.textContent = 'Nová hra';
  restartBtn.addEventListener('click', () => resetTicTacToeGame(true));
  actions.appendChild(restartBtn);
  fragment.appendChild(actions);

  if (typeof replaceElementChildrenSafely === 'function') replaceElementChildrenSafely(card, fragment, 'ttt-result-summary');
  else {
    while (card.firstChild) card.removeChild(card.firstChild);
    card.appendChild(fragment);
  }
}



function tttRenderGridBoard(boardEl, state, winnerLine) {
  if (!boardEl || !state || !Array.isArray(state.board)) return;
  const lineSet = new Set(Array.isArray(winnerLine) ? winnerLine : []);
  const fragment = document.createDocumentFragment();
  for (let idx = 0; idx < state.board.length; idx += 1) {
    const cell = state.board[idx] || '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tttCell';
    btn.dataset.tttCell = String(idx);
    btn.dataset.tttRow = String(Math.floor(idx / TTT_COLS));
    btn.dataset.tttCol = String(idx % TTT_COLS);
    btn.setAttribute('aria-label', cell ? ('Pole ' + (idx + 1) + ': ' + cell) : ('Prázdné pole ' + (idx + 1)));
    if (cell) {
      btn.classList.add('isFilled');
      if (cell === 'X') {
        btn.classList.add('isX');
        btn.style.setProperty('color', '#FF073A', 'important');
        btn.style.setProperty('text-shadow', '0 0 3px rgba(255,255,255,.98), 0 0 10px rgba(255,7,58,1), 0 0 24px rgba(255,7,58,.98), 0 0 46px rgba(255,0,48,.78)', 'important');
      }
      if (cell === 'O') {
        btn.classList.add('isO');
        btn.style.setProperty('color', '#39FF14', 'important');
        btn.style.setProperty('text-shadow', '0 0 3px rgba(255,255,255,.98), 0 0 10px rgba(57,255,20,1), 0 0 24px rgba(57,255,20,.98), 0 0 46px rgba(57,255,20,.78)', 'important');
      }
      btn.textContent = cell;
    }
    if (Number(state.lastMoveIndex) === idx) btn.classList.add('isLastMove');
    if (lineSet.has(idx)) btn.classList.add('isWinner');
    btn.addEventListener('click', () => tttHandleMove(idx));
    fragment.appendChild(btn);
  }
  if (typeof replaceElementChildrenSafely === 'function') {
    replaceElementChildrenSafely(boardEl, fragment, 'ttt-grid-board');
  } else {
    while (boardEl.firstChild) boardEl.removeChild(boardEl.firstChild);
    boardEl.appendChild(fragment);
  }
}

function tttRender() {
  const overlay = ensureTicTacToeOverlay();
  const state = tttGetState();
  const start = overlay.querySelector('#tttStartScreen');
  const game = overlay.querySelector('#tttGameScreen');
  const status = overlay.querySelector('#tttStatus');
  const boardEl = overlay.querySelector('#tttBoard');
  const onlineInfo = overlay.querySelector('#tttOnlineGameInfo');

  const tttHasResumeGame = () => {
    if (state.gameOver) return false;
    return state.mode === 'pvp' && !!(state.online && state.online.code);
  };

  if (state.screen === 'start') {
    if (start) start.classList.remove('uHidden');
    if (game) game.classList.add('uHidden');
    start.style.display = 'flex';
    game.style.display = 'none';
    start.innerHTML = [
      '<div class="tttCard tttModeCard">',
      '  <div class="tttSectionTitle">Režim hry</div>',
      '  <div class="tttToggleRow">',
      '    <button type="button" class="tttBtn' + (state.mode === 'ai' ? ' isActive' : '') + '" data-ttt-mode="ai">Proti AI</button>',
      '    <button type="button" class="tttBtn' + (state.mode === 'local' ? ' isActive' : '') + '" data-ttt-mode="local">Na jednom mobilu</button>',
      '    <button type="button" class="tttBtn' + (state.mode === 'pvp' ? ' isActive' : '') + '" data-ttt-mode="pvp">Online</button>',
      '  </div>',
      '</div>',
      state.mode !== 'pvp' ? '<div class="tttCard tttActionCard"><div class="tttSectionTitle">Hrát</div><button type="button" class="tttBtn tttPrimaryBtn" id="tttStartBtn">' + (state.mode === 'local' ? 'Hrát na mobilu' : 'Hrát proti AI') + '</button>' + (tttHasResumeGame() ? '<button type="button" class="tttBtn tttSecondaryBtn" id="tttResumeBtn">Pokračovat v rozehrané hře</button>' : '') + '</div>' : '',
      state.mode === 'pvp' ? '<div class="tttCard tttInviteCard"><div class="tttSectionTitle">Online</div><div class="tttToggleRow tttInviteActions"><button type="button" class="tttBtn tttPrimaryBtn" id="tttCreateInviteBtn">Vytvořit hru</button><button type="button" class="tttBtn" id="tttJoinInviteBtn">Přijmout pozvánku</button></div></div>' : '',
      tttBuildStartLeaderboardHtml()
    ].join('');

    start.querySelectorAll('[data-ttt-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-ttt-mode') || 'ai';
        tttSwitchModeClean(nextMode);
        if (nextMode === 'pvp') {
          const currentState = tttGetState();
          currentState.onlineScoreLoaded = false;
          currentState.onlineScoreLoadedAt = 0;
        }
        tttRender();
        scheduleTttLayout();
        if (nextMode === 'pvp') void tttRefreshOnlineScoreRows(true);
      });
    });
    const inviteInfo = () => start.querySelector('#tttInviteInfo');
    start.querySelector('#tttCreateInviteBtn')?.addEventListener('click', async () => {
      try {
        const result = await tttCreateInviteSession();
        const info = inviteInfo();
        if (result && result.ok) {
          state.screen = 'game';
          state.gameOver = false;
          state.winner = null;
          state.board = Array(TTT_TOTAL_CELLS).fill('');
          state.turn = 'X';
          state.message = 'Čekám na spoluhráče.';
          tttRender();
          scheduleTttLayout();
          tttStartOnlineSyncLoop();
          void tttSyncOnlineSession(true);
        }
      } catch (err) {
        console.warn('TTT create invite failed', err);
      }
    });
    start.querySelector('#tttResumeBtn')?.addEventListener('click', () => {
      state.screen = 'game';
      state.message = state.message || (state.mode === 'pvp' ? 'Hraje hráč X.' : (state.mode === 'local' ? 'Na řadě je X.' : 'Hraješ za X. AI je O.'));
      tttRender();
      scheduleTttLayout();
      if (state.mode === 'pvp' && state.online && state.online.code) {
        tttStartOnlineSyncLoop();
        void tttSyncOnlineSession(true);
      }
    });
    start.querySelector('#tttJoinInviteBtn')?.addEventListener('click', async () => {
      const code = prompt('Zadej 4místný číselný kód pozvánky');
      if (code) {
        const result = await tttJoinInviteSession(code, { flow: 'manual' });
        if (result && result.ok) {
          state.screen = 'game';
          state.gameOver = false;
          state.winner = null;
          state.startedAt = Date.now();
          tttSetJoinedOnlineMessage(state);
          tttRememberOnlineJoinDiag('manual', 'ready', { code, source: 'manual-prompt', message: state.message });
          tttRender();
          scheduleTttLayout();
          tttStartOnlineSyncLoop();
          void tttSyncOnlineSession(true);
        }
      }
    });
    start.querySelector('#tttStartBtn')?.addEventListener('click', async () => {
      const selectedMode = String(state.mode || 'ai');
      if (selectedMode !== 'pvp') tttClearBoardStateForNewMode(state, selectedMode);
      state.mode = selectedMode;
      state.screen = 'game';
      state.board = Array(TTT_TOTAL_CELLS).fill('');
      state.turn = 'X';
      state.gameOver = false;
      state.winner = null;
      state.startedAt = Date.now();
      state.moveCount = 0;
      state.moveCountX = 0;
      state.moveCountO = 0;
      state.hardWinPrompt = false;
      state.hardWinStats = null;
      state.resultSaved = false;
      state.resultOnlineSaved = false;
      state.resultSummary = null;
      state.message = state.mode === 'pvp'
        ? (state.online && state.online.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : 'Jsi X. Hraješ.')
        : (state.mode === 'local' ? 'Na řadě je X.' : 'Hraješ za X. AI je O.');
      tttRender();
      scheduleTttLayout();
      if (state.mode === 'pvp' && state.online && state.online.code) {
        tttStartOnlineSyncLoop();
        void tttSyncOnlineSession(true);
        void tttPushOnlineSession({ status: state.online.status || 'waiting' });
      }
    });
    if (state.mode === 'ai' && !state.hardWinLoaded && !state.hardWinLoading) {
      void tttRefreshHardWinRows();
    } else {
      tttUpdateDashboardMeta();
    }
    if (state.mode === 'pvp' && !state.onlineScoreLoading) {
      const scoreAge = Date.now() - Number(state.onlineScoreLoadedAt || 0);
      if (!state.onlineScoreLoaded || scoreAge > 15000) void tttRefreshOnlineScoreRows(true);
    }
    return;
  }

  if (start) start.classList.add('uHidden');
  if (game) game.classList.remove('uHidden');
  start.style.display = 'none';
  game.style.display = 'flex';
  status.textContent = state.message || state.onlineStatus || (state.mode === 'pvp' ? ((state.online && String(state.online.role || '').toUpperCase() === state.turn) ? ('Jsi ' + state.turn + '. Hraješ.') : ('Čekáš na tah hráče ' + state.turn + '.')) : (state.mode === 'local' ? 'Na řadě je X.' : 'Hraješ za X. AI je O.'));
  if (onlineInfo) {
    const scoreText = tttBuildOnlineScoreText();
    onlineInfo.hidden = !(state.mode === 'pvp' && scoreText && state.online && state.online.playerOAccountNumber);
    onlineInfo.textContent = scoreText || '';
  }
  if (state.mode === 'pvp' && state.online && state.online.code && state.online.playerXAccountNumber && state.online.playerOAccountNumber) {
    void tttRefreshOnlineHeadToHead(false).then(() => {
      const currentOverlay = document.getElementById('tttOverlay');
      const currentInfo = currentOverlay ? currentOverlay.querySelector('#tttOnlineGameInfo') : null;
      const currentState = tttGetState();
      if (!currentInfo || currentState.screen !== 'game' || currentState.mode !== 'pvp') return;
      const nextText = tttBuildOnlineScoreText();
      currentInfo.hidden = !nextText;
      currentInfo.textContent = nextText || '';
    });
  }
  tttRenderInviteOverlay(overlay);

  const result = tttWinner(state.board);
  const winnerLine = result.line || [];
  tttRenderGridBoard(boardEl, state, winnerLine);
  tttRenderResultCard(overlay, result.winner);

}

function tttHandleMove(index) {
  const state = tttGetState();
  if (state.gameOver || state.board[index]) return;
  if (state.mode === 'ai' && (state.turn !== 'X' || state.aiBusy)) return;
  if (state.mode === 'pvp') {
    if (!state.online || !state.online.code) {
      state.message = 'Online hra ještě nemá načtený kód pozvánky.';
      tttSetOnlineStatus(state.message, 'error');
      tttRememberOnlineMoveBlock('missing-code-before-move', { source: 'move-guard' });
      tttRender();
      scheduleTttLayout();
      return;
    }
    if (state.online.status === 'waiting') {
      state.message = 'Čekám na přijetí pozvánky druhým hráčem.';
      tttSetOnlineStatus(state.message, 'waiting');
      tttRememberOnlineMoveBlock('waiting-for-opponent-before-move', { code: state.online.code || '', source: 'move-guard' });
      tttRequestOnlineGuardResync('waiting-for-opponent-before-move');
      tttRender();
      scheduleTttLayout();
      return;
    }
    const role = tttEnsureOnlineRoleFromAccounts(state, {}, null, 'move-guard');
    if (!role) {
      state.message = 'Online role hráče se ještě nenačetla. Zkus chvilku počkat, appka si stav znovu ověřuje.';
      tttSetOnlineStatus(state.message, 'error');
      const guardFlow = String(state.online && state.online.joinFlow || '').trim() === 'link' ? 'link' : 'manual';
      tttRememberOnlineJoinDiag(guardFlow, 'error', { code: state.online.code || '', source: 'move-guard', reason: 'missing-role-before-move' });
      tttRememberOnlineMoveBlock('missing-role-before-move', { code: state.online.code || '', source: 'move-guard' });
      tttRequestOnlineGuardResync('missing-role-before-move');
      tttRender();
      scheduleTttLayout();
      return;
    }
    if (state.turn !== role) {
      state.message = 'Teď hraje ' + state.turn + '. Ty jsi ' + role + '.';
      tttSetOnlineStatus(state.message, 'active');
      tttRememberOnlineMoveBlock('turn-mismatch-before-move', { code: state.online.code || '', role, turn: state.turn, source: 'move-guard', message: state.message });
      tttRequestOnlineGuardResync('turn-mismatch-before-move');
      tttRender();
      scheduleTttLayout();
      return;
    }
  }

  tttEnsureGameClockStarted(state);

  const mark = state.turn;
  state.board[index] = mark;
  state.lastMoveIndex = index;
  state.lastMoveMark = mark;
  state.moveCount += 1;
  if (mark === 'X') state.moveCountX += 1;
  else state.moveCountO += 1;
  if (state.mode === 'pvp' && state.online && state.online.code) {
    state.online.dirty = true;
    state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, Number(state.online.revision || 0) || 0) + 1;
  }

  const after = tttWinner(state.board);
  if (after.winner) {
    state.gameOver = true;
    state.winner = after.winner;
    if (state.mode === 'pvp') {
      const role = String(state.online && state.online.role || '').toUpperCase();
      state.message = after.winner === 'draw'
        ? 'Remíza. Dobře hrané.'
        : (role && after.winner === role ? 'Vyhrál jsi.' : ('Vyhrál hráč ' + after.winner + '.'));
      tttMarkResultSaved(after.winner);
      tttRender();
      scheduleTttLayout();
      if (state.online && state.online.code) {
        void tttPushOnlineSession({ status: 'finished', gameOver: true, winner: after.winner, winnerRole: after.winner, finishedAt: Date.now() });
        tttMaybeRecordOnlineResult(after.winner);
      }
      return;
    }
    if (after.winner === 'draw') {
      state.message = 'Remíza. Dobře hrané.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          completed: true,
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          draws: (gamesGetActiveAccount()?.stats.ttt.draws || 0) + 1,
          bestMoves: gamesGetActiveAccount()?.stats.ttt.bestMoves || null,
          bestTimeMs: gamesGetActiveAccount()?.stats.ttt.bestTimeMs || null,
          lastResult: 'Remíza · ' + String(state.moveCount || 0) + ' tahů'
        });
      }
      tttMarkResultSaved(after.winner);
    } else if (after.winner === 'X') {
      state.message = 'Vyhrál jsi.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          completed: true,
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          wins: (gamesGetActiveAccount()?.stats.ttt.wins || 0) + 1,
          bestMoves: Math.min(gamesGetActiveAccount()?.stats.ttt.bestMoves || 9999, state.moveCount || 0),
          bestTimeMs: Math.min(gamesGetActiveAccount()?.stats.ttt.bestTimeMs || 999999999, tttGetElapsedMs(state)),
          lastResult: 'Výhra X · ' + String(state.moveCount || 0) + ' tahů'
        });
      }
      tttMarkResultSaved(after.winner);
      if (state.mode === 'ai' && state.difficulty === 'ai') {
        state.hardWinStats = tttReadHardWinStats();
        void tttSubmitHardWin();
      }
    } else {
      state.message = 'Vyhrála O.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          completed: true,
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          losses: (gamesGetActiveAccount()?.stats.ttt.losses || 0) + 1,
          lastResult: 'Prohra · ' + String(state.moveCount || 0) + ' tahů'
        });
      }
      tttMarkResultSaved(after.winner);
    }
    tttRender();
    scheduleTttLayout();
    if (state.mode === 'pvp' && state.online && state.online.code) {
      void tttPushOnlineSession({ status: 'finished', gameOver: true, winner: after.winner, winnerRole: after.winner, finishedAt: Date.now() });
      tttMaybeRecordOnlineResult(after.winner);
    }
    return;
  }

  if (state.mode === 'pvp' || state.mode === 'local') {
    state.turn = state.turn === 'X' ? 'O' : 'X';
    state.message = state.mode === 'pvp'
      ? (state.online && state.online.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : ((String(state.online.role || '').toUpperCase() === state.turn) ? ('Jsi ' + state.turn + '. Hraješ.') : ('Čekáš na tah hráče ' + state.turn + '.')))
      : (state.turn === 'X' ? 'Na řadě je X.' : 'Na řadě je O.');
    tttRender();
    scheduleTttLayout();
    if (state.mode === 'pvp' && state.online && state.online.code) {
      void tttPushOnlineSession({ status: state.online.status || 'active' });
    }
    return;
  }

  state.turn = 'O';
  state.message = 'Tah AI...';
  state.aiBusy = true;
  state.aiToken = (state.aiToken || 0) + 1;
  const aiToken = state.aiToken;
  tttRender();
  scheduleTttLayout();

  setTimeout(() => {
    try {
      const fresh = tttGetState();
      if (fresh.gameOver || fresh.aiToken !== aiToken) return;
      const snapshot = fresh.board.slice();
      const aiMove = tttBestMove(snapshot, fresh.difficulty || 'ai');
      if (aiMove < 0 || fresh.board[aiMove]) {
        fresh.turn = 'X';
        fresh.message = 'Hraješ za X.';
        tttRender();
        scheduleTttLayout();
        return;
      }
      fresh.board[aiMove] = 'O';
      fresh.lastMoveIndex = aiMove;
      fresh.lastMoveMark = 'O';
      fresh.moveCount += 1;
      fresh.moveCountO += 1;
      const afterAi = tttWinner(fresh.board);
      if (afterAi.winner) {
        fresh.gameOver = true;
        fresh.winner = afterAi.winner;
        fresh.nextStarter = ['X', 'O'].includes(afterAi.winner) ? afterAi.winner : 'X';
        fresh.message = afterAi.winner === 'draw'
          ? 'Remíza. Dobře hrané.'
          : 'AI vyhrála. Zkus to znovu.';
        if (typeof gamesRecordStat === 'function') {
          const active = gamesGetActiveAccount();
          if (active) {
            const patch = afterAi.winner === 'draw'
              ? {
                  completed: true,
                  plays: (active.stats.ttt.plays || 0) + 1,
                  draws: (active.stats.ttt.draws || 0) + 1,
                  lastResult: 'Remíza · ' + String(fresh.moveCount || 0) + ' tahů'
                }
              : {
                  completed: true,
                  plays: (active.stats.ttt.plays || 0) + 1,
                  losses: (active.stats.ttt.losses || 0) + 1,
                  lastResult: 'Prohra · ' + String(fresh.moveCount || 0) + ' tahů'
                };
            gamesRecordStat('ttt', patch);
          }
        }
        tttMarkResultSaved(afterAi.winner);
        tttRender();
        scheduleTttLayout();
        return;
      }
      fresh.turn = 'X';
      fresh.message = 'Hraješ za X.';
      tttRender();
      scheduleTttLayout();
    } catch (err) {
      console.warn('TTT AI move failed', err);
      const fresh = tttGetState();
      fresh.turn = 'X';
      fresh.message = 'AI se na chvíli zasekla. Zkus tah znovu.';
      tttRender();
      scheduleTttLayout();
    } finally {
      const fresh = tttGetState();
      fresh.aiBusy = false;
    }
  }, 20);
}

function resetTicTacToeGame(keepScreen) {
  const state = tttGetState();
  const previousWinner = String(state.winner || '').toUpperCase();
  const starter = ['X', 'O'].includes(previousWinner)
    ? previousWinner
    : (['X', 'O'].includes(String(state.nextStarter || '').toUpperCase()) ? String(state.nextStarter).toUpperCase() : 'X');
  state.board = Array(TTT_TOTAL_CELLS).fill('');
  state.turn = (state.mode === 'pvp' || state.mode === 'local') ? starter : 'X';
  state.nextStarter = starter;
  state.gameOver = false;
  state.winner = null;
  state.startedAt = keepScreen ? Date.now() : (state.mode === 'pvp' ? Date.now() : 0);
  state.moveCount = 0;
  state.moveCountX = 0;
  state.moveCountO = 0;
  state.lastMoveIndex = null;
  state.lastMoveMark = null;
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  state.resultSaved = false;
  state.resultOnlineSaved = false;
  state.resultSummary = null;
  if (state.mode === 'pvp') {
    const role = String(state.online && state.online.role || '').toUpperCase();
    const waiting = state.online && (!state.online.playerOAccountNumber || String(state.online.status || '').toLowerCase() === 'waiting');
    state.message = waiting
      ? 'Čekám na přijetí pozvánky.'
      : (role === state.turn ? ('Začíná ' + state.turn + '. Jsi na tahu.') : ('Začíná ' + state.turn + '. Čekáš na soupeře.'));
    if (state.online) state.online.status = waiting ? 'waiting' : 'active';
  } else {
    state.message = state.mode === 'local'
      ? ('Začíná ' + state.turn + '.')
      : 'Hraješ za X. AI je O.';
  }
  if (!keepScreen) state.screen = 'start';
  tttRender();
  scheduleTttLayout();
  if (state.mode === 'pvp' && state.online && state.online.code) {
    state.online.dirty = true;
    state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, Number(state.online.revision || 0) || 0) + 1;
    void tttPushOnlineSession({
      status: state.online.status || 'active',
      gameOver: false,
      winner: null,
      winnerRole: null,
      winnerAccountNumber: null,
      nextStarter: starter,
      finishedAt: null,
      moveCount: 0,
      moveCountX: 0,
      moveCountO: 0,
      lastMoveIndex: null,
      lastMoveMark: null,
      forceNewSession: true
    });
  }
}

function openGamesPage() {
  if (typeof tttStopOnlineSync === 'function') tttStopOnlineSync();
  const hasTttOverlay = typeof document !== 'undefined' && document.body.classList.contains('tttOpen');
  const hasGameShell = typeof app !== 'undefined' && !!app.activeGameShell;

  if (hasTttOverlay && typeof closeTicTacToeGame === 'function') {
    closeTicTacToeGame();
  }
  if (hasGameShell && typeof closeGameShell === 'function') {
    closeGameShell();
  }

  if (typeof gamesStopActiveLoops === 'function') gamesStopActiveLoops();
  if (typeof app !== 'undefined') app.activeGameShell = '';
  document.body.classList.remove('gamesOpen');
  document.body.classList.remove('tttOpen');
  showPage('games');
  if (typeof renderGamesHub === 'function') renderGamesHub();
}

function openTicTacToeGame() {
  try {
    if (typeof applyThemePreference === 'function' && typeof getThemePreference === 'function') applyThemePreference(getThemePreference(), false);
    if (typeof applyBackgroundPreference === 'function' && typeof getBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
  } catch (err) {}
  const overlay = ensureTicTacToeOverlay();
  document.body.classList.remove('gamesOpen');
  const state = tttGetState();
  state.screen = 'start';
  state.message = state.message || '';
  overlay.classList.add('isVisible');
  document.body.classList.add('tttOpen');
  if (state.online && state.online.code) {
    tttStartOnlineSyncLoop();
    void tttSyncOnlineSession(true);
  }
  tttRender();
  scheduleTttLayout();
}

function closeTicTacToeGame() {
  const overlay = document.getElementById('tttOverlay');
  if (overlay) overlay.classList.remove('isVisible');
  document.body.classList.remove('tttOpen');
  document.body.classList.remove('gamesOpen');
  tttStopOnlineSync();
  app.activeGameShell = '';
  renderGamesHub();
}

function tttUrlLooksLikeShipsInvite() {
  try {
    const raw = String((window.location.hash || '') + '&' + (window.location.search || ''));
    return /(?:^|[?#&])(?:games|game)=ships(?:$|[&#])|(?:^|[?#&])(?:shipsInvite|ships|battleship)=/i.test(raw);
  } catch (err) { return false; }
}

async function tttAutoOpenFromHash() {
  if (tttUrlLooksLikeShipsInvite()) return false;
  const invite = tttReadUrlInviteData();
  const code = invite.code || '';
  if (!code) return false;
  const opened = await tttOpenFromInviteCode(code, { source: invite.source || 'url' });
  if (opened) tttClearInviteFromUrl();
  return opened;
}

let tttLayoutPending = false;
function scheduleTttLayout() {
  if (tttLayoutPending) return;
  tttLayoutPending = true;
  requestAnimationFrame(() => {
    tttLayoutPending = false;
    tttLayoutBoard();
  });
}

function tttLayoutBoard() {
  const overlay = document.getElementById('tttOverlay');
  if (!overlay || !overlay.classList.contains('isVisible')) return;
  const board = overlay.querySelector('#tttBoard');
  const wrap = overlay.querySelector('.tttBoardWrap');
  if (!board || !wrap) return;

  try {
    const nav = document.querySelector('.bottomNav');
    const viewportH = (window.visualViewport && Number(window.visualViewport.height)) || window.innerHeight || document.documentElement.clientHeight || 0;
    const navRect = nav && nav.getBoundingClientRect ? nav.getBoundingClientRect() : null;
    const navTop = navRect && Number.isFinite(navRect.top) ? navRect.top : 0;
    const navClearance = navRect && viewportH
      ? Math.ceil(Math.max(136, (viewportH - navTop) + 74))
      : Math.ceil(Math.max(136, ((navRect && navRect.height) || 72) + 92));
    document.documentElement.style.setProperty('--rak-ttt-live-bottom-clearance', navClearance + 'px');
  } catch (err) {}

  const wrapRect = wrap.getBoundingClientRect();
  const edge = 1;
  const cellW = Math.floor((wrapRect.width - edge) / TTT_COLS);
  const cellH = Math.floor((wrapRect.height - edge) / TTT_ROWS);
  const cell = Math.max(10, Math.min(cellW, cellH));

  board.style.setProperty('--tttCellSize', cell + 'px');
  board.style.gridTemplateColumns = `repeat(${TTT_COLS}, ${cell}px)`;
  board.style.gridTemplateRows = `repeat(${TTT_ROWS}, ${cell}px)`;
  board.style.gap = '0px';
  board.style.width = (cell * TTT_COLS) + 'px';
  board.style.height = (cell * TTT_ROWS) + 'px';
}

