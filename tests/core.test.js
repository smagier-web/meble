const test = require('node:test');
const assert = require('node:assert/strict');
const KC = require('../js/core.js');

const base = () => { const m = KC.defaults(); return m; };
const find = (res, id, name) => res.byCab[id].filter(p => p.name === name);

test('front szafki 800 mm z dwojgiem drzwi: 397 x 717 mm (szczelina 3 mm)', () => {
  const r = KC.compute(base());
  const fronts = find(r, 'c2', 'Front');
  assert.equal(fronts.length, 2);
  assert.equal(fronts[0].L, 717);
  assert.equal(fronts[0].W, 397);
});

test('wymiar do cięcia = gotowy minus okleina z obu stron', () => {
  const r = KC.compute(base());
  const f = find(r, 'c2', 'Front')[0];
  assert.equal(f.cutL, 713); // 717 - 2*2
  assert.equal(f.cutW, 393); // 397 - 2*2
});

test('wyłączenie odejmowania okleiny zostawia wymiary gotowe', () => {
  const m = base(); m.s.subEdge = false;
  const f = find(KC.compute(m), 'c2', 'Front')[0];
  assert.equal(f.cutL, f.L);
  assert.equal(f.cutW, f.W);
});

test('zmiana szczeliny przelicza fronty', () => {
  const m = base(); m.s.gap = 2;
  const f = find(KC.compute(m), 'c2', 'Front')[0];
  assert.equal(f.W, 398);
  assert.equal(f.L, 718);
});

test('korpus: bok, dno i wieńce szafki dolnej 800 mm', () => {
  const r = KC.compute(base());
  const bok = find(r, 'c2', 'Bok')[0];
  assert.equal(bok.L, 720); assert.equal(bok.W, 520);
  const dno = find(r, 'c2', 'Dno')[0];
  assert.equal(dno.L, 764); assert.equal(dno.W, 500);
  assert.equal(find(r, 'c2', 'Wieniec przedni')[0].W, 100);
});

test('plecy HDF nakładane i w rowku mają różne wymiary', () => {
  const m = base(); m.s.back = 'nakladane';
  const hdf = find(KC.compute(m), 'c2', 'Plecy HDF')[0];
  assert.equal(hdf.L, 718); assert.equal(hdf.W, 798);
});

test('fronty poziome: n frontów jeden nad drugim', () => {
  const m = base();
  m.cabs = [{ id: 'x', run: 'A', lvl: 'base', type: 'drzwi', w: 800, n: 2, shelves: 0, orient: 'poz', fw: 450 }];
  m.s.layout = 'I';
  const fr = KC.compute(m).byCab.x.filter(p => p.kind === 'front');
  assert.equal(fr.length, 2);
  assert.equal(fr[0].W, 357); // (717+3)/2 - 3
  assert.equal(fr[0].box[3], 797);
  assert.equal(fr[0].gv, false);
});

test('moduł wg wnęki: wymiary, auto drzwi, przegrody i półki', () => {
  const m = base(); m.s.layout = 'I';
  m.cabs = [{ id: 'm', run: 'A', lvl: 'mod', type: 'drzwi', nw: 1200, nh: 2100, nd: 560, clr: 2, pl: 100,
    aN: true, aSh: true, aDiv: true, aLv: true, orient: 'pion', n: 1, shelves: 0, dividers: 0, levels: 1, fw: 450 }];
  const r = KC.compute(m); const c = m.cabs[0];
  assert.equal(c.w, 1196); assert.equal(c.H, 1998); assert.equal(c.D, 540);
  assert.equal(c.n, 2); assert.equal(c.dividers, 1); assert.equal(c.levels, 2);
  assert.equal(r.byCab.m.filter(p => p.name === 'Przegroda pionowa').length, 1);
  assert.equal(r.byCab.m.filter(p => p.name === 'Półka').length, c.shelves * 2);
});

test('moduł: wartości ręczne nadpisują auto', () => {
  const m = base(); m.s.layout = 'I';
  m.cabs = [{ id: 'm', run: 'A', lvl: 'mod', type: 'drzwi', nw: 900, nh: 800, nd: 400, clr: 2, pl: 0,
    aN: false, n: 3, aSh: false, shelves: 2, aDiv: false, dividers: 0, aLv: true, orient: 'pion', levels: 1, fw: 450 }];
  KC.compute(m); const c = m.cabs[0];
  assert.equal(c.n, 3); assert.equal(c.shelves, 2); assert.equal(c.dividers, 0);
});

test('cokół ciągły: jedna listwa na ciąg, dzielona wg maks. długości', () => {
  const r = KC.compute(base());
  const a = r.pieces.filter(p => p.kind === 'plinth' && p.code === 'COK-A');
  assert.ok(a.length >= 2);
  const total = a.reduce((s, p) => s + p.L, 0);
  assert.ok(Math.abs(total - 3700) < 0.5);
});

test('cokół: tryby szafki / listwa / brak', () => {
  const m = base(); m.s.plMode = 'szafki';
  assert.ok(KC.compute(m).pieces.some(p => p.name === 'Cokół' && p.cab === 'c2'));
  m.s.plMode = 'listwa';
  const r = KC.compute(m);
  assert.ok(r.plProfile > 5000);
  assert.ok(!r.pieces.some(p => p.kind === 'plinth'));
  m.s.plMode = 'brak';
  assert.ok(!KC.compute(m).pieces.some(p => p.kind === 'plinth'));
});

test('rozkrój: formatki mieszczą się w arkuszu i nie nakładają się', () => {
  const m = base(); const r = KC.compute(m); const s = m.s;
  for (const k of Object.keys(r.sheets)) {
    assert.equal(r.sheets[k].unfit.length, 0);
    for (const sh of r.sheets[k].sheets) {
      for (const a of sh.items) {
        assert.ok(a.x + a.w <= s.sheetL - s.trim + 0.01);
        assert.ok(a.y + a.h <= s.sheetW - s.trim + 0.01);
        for (const b of sh.items) {
          if (a === b) continue;
          const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
          assert.ok(!overlap, `${a.label} nakłada się na ${b.label}`);
        }
      }
    }
  }
});

test('okleina: zestawienie w mb rośnie o zapas', () => {
  const r = KC.compute(base());
  assert.ok(r.edges.length >= 3);
  r.edges.forEach(e => assert.ok(e.gross > e.net && e.buy >= e.gross));
});

test('ostrzeżenia: za długi ciąg i zbyt wąski narożnik', () => {
  const m = base(); m.s.roomA = 3000;
  assert.ok(KC.compute(m).warn.some(w => w.includes('przekraczają ścianę')));
  const m2 = base(); m2.cabs[0].w = 300;
  assert.ok(KC.compute(m2).warn.some(w => w.includes('Narożnik')));
});

test('eksport CSV ma nagłówek i wiersze', () => {
  const m = base(); const csv = KC.csv(KC.compute(m), m).split('\n');
  assert.ok(csv[0].startsWith('Szafka;Element'));
  assert.ok(csv.length > 50);
});
