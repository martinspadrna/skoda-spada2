#!/usr/bin/env node
// RaK 1.2 (1.146) – smoke test offline Gomoku AI.
const fs = require('fs');
const { performance } = require('perf_hooks');

const source = fs.readFileSync('games-gomoku.js', 'utf8');
const start = source.indexOf('const TTT_ROWS = 19;');
const end = source.indexOf('function tttHardWinLog()');
if (start < 0 || end < start) {
  console.error('Nepodařilo se najít AI úsek v games-gomoku.js.');
  process.exit(1);
}

const aiSource = source.slice(start, end);
const harness = `
function cell(row, col) { return tttIndex(row, col); }
function emptyBoard() { return Array(TTT_TOTAL_CELLS).fill(''); }
function place(board, mark, cells) { for (const pair of cells) board[cell(pair[0], pair[1])] = mark; return board; }
function coord(idx) { return [Math.floor(idx / TTT_COLS), idx % TTT_COLS]; }
function sameCell(idx, pair) { return idx === cell(pair[0], pair[1]); }
function oneOf(idx, pairs) { return pairs.some(pair => sameCell(idx, pair)); }
function assertCase(name, setup, accepts, maxMs) {
  const board = setup(emptyBoard());
  const before = performance.now();
  const move = tttBestMove(board, 'ai');
  const elapsedMs = performance.now() - before;
  const legal = Number.isFinite(Number(move)) && move >= 0 && move < board.length && !board[move];
  const ok = legal && (!accepts || accepts(move, board)) && elapsedMs <= (maxMs || TTT_V966_HARD_DEADLINE_MS);
  return { name, ok, move, coord: legal ? coord(move) : null, elapsedMs: Math.round(elapsedMs * 100) / 100, legal };
}
const cases = [
  assertCase('AI blokuje diagonální otevřenou trojku backslash', (b) => place(b, 'X', [[5,2],[6,3],[7,4]]), (m) => oneOf(m, [[4,1],[8,5]])),
  assertCase('AI blokuje diagonální otevřenou trojku /', (b) => place(b, 'X', [[7,6],[8,5],[9,4]]), (m) => oneOf(m, [[6,7],[10,3]])),
  assertCase('AI blokuje horizontální otevřenou trojku', (b) => place(b, 'X', [[9,3],[9,4],[9,5]]), (m) => oneOf(m, [[9,2],[9,6]])),
  assertCase('AI blokuje svislou otevřenou trojku', (b) => place(b, 'X', [[7,4],[8,4],[9,4]]), (m) => oneOf(m, [[6,4],[10,4]])),
  assertCase('AI blokuje diagonální čtyřku', (b) => place(b, 'X', [[5,1],[6,2],[7,3],[8,4]]), (m) => oneOf(m, [[4,0],[9,5]])),
  assertCase('AI zahraje vlastní okamžitou výhru', (b) => place(b, 'O', [[8,2],[8,3],[8,4],[8,5]]), (m) => oneOf(m, [[8,1],[8,6]])),
  assertCase('AI vytvoří vlastní čtyřku místo bloku soupeřovy otevřené trojky', (b) => place(place(b, 'O', [[8,3],[8,4],[8,5]]), 'X', [[10,3],[10,4],[10,5]]), (m) => oneOf(m, [[8,2],[8,6]])),
  assertCase('AI prodlouží vlastní otevřenou trojku, když soupeřova trojka je z jedné strany zavřená', (b) => place(place(b, 'O', [[9,3],[9,4],[9,5],[7,1]]), 'X', [[7,2],[7,3],[7,4]]), (m) => oneOf(m, [[9,2],[9,6]])),
  assertCase('AI blokuje tah, který by X vytvořil otevřenou čtyřku se dvěma výhrami', (b) => place(b, 'X', [[4,4],[5,4],[6,4]]), (m) => oneOf(m, [[3,4],[7,4]])),
  assertCase('AI blokuje křížový fork gain square', (b) => place(b, 'X', [[5,3],[5,4],[5,5],[3,6],[4,6],[6,6]]), (m) => oneOf(m, [[5,6]])),
  assertCase('AI řeší rekonstruovanou pozici před otevřenou čtyřkou ze screenshotu', (b) => place(place(b, 'X', [[4,4],[5,3],[5,4],[5,5],[6,4],[6,6],[7,3],[7,5]]), 'O', [[3,3],[4,6],[5,6],[7,6],[8,6],[9,1],[9,4],[9,7]]), (m) => oneOf(m, [[3,4],[7,4]])),
  assertCase('AI v965 brzdí pozdní středový tlak před 19.–31. tahem', (b) => place(place(b, 'X', [[7,3],[7,4],[8,4],[9,5],[10,5],[10,6],[11,6],[12,6],[9,3],[11,4]]), 'O', [[6,4],[8,3],[8,5],[9,4],[10,4],[11,5],[12,5],[13,5],[6,6]]), (m) => oneOf(m, [[7,5],[8,6],[9,6],[11,3],[11,7],[12,7],[6,2]])),
  assertCase('AI nevrátí nelegální tah', (b) => place(place(b, 'X', [[9,4],[9,5],[8,5],[10,3],[7,6],[11,2]]), 'O', [[9,3],[8,4],[10,4],[7,5],[11,5]]), null),
  assertCase('AI se nezasekne u rozehrané pozice', (b) => place(place(b, 'X', [[9,4],[9,5],[8,5],[10,3],[7,6],[11,2],[6,7],[12,1],[5,8],[13,0]]), 'O', [[9,3],[8,4],[10,4],[7,5],[11,5],[6,6],[12,4],[5,7],[13,3]]), null)
];
const health = getRakGomokuAiV966Health();
const summary = { ok: cases.every(c => c.ok), rulesetVersion: GOMOKU_RULESET_VERSION, boardRows: TTT_ROWS, boardCols: TTT_COLS, hardDeadlineMs: health.hardDeadlineMs, cases };
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exit(1);
`;

new Function('performance', "const window = globalThis;\nconst document = { body: { classList: { contains: () => false } } };\nglobalThis.performance = performance;\n" + aiSource + '\n' + harness)(performance);
