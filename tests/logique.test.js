"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../logique.js");

const BD = 60 / 55;
let jourN = 0;
const bloc = (etat, decl) => A.finirBloc(etat, { date: `2026-10-${String(++jourN).padStart(2, "0")}`, h: "21:00", ...decl }).etat;
const propre = etat => bloc(etat, { tenuesPropres: true, yPropres: true });
const nfois = (etat, n, f) => { for (let i = 0; i < n; i++) etat = f(etat); return etat; };

test("date locale, pas UTC", () => {
  assert.equal(A.dateLocale(new Date(2026, 8, 28, 0, 30)), "2026-09-28");
  assert.equal(A.heureLocale(new Date(2026, 8, 28, 7, 5)), "07:05");
});

test("plan de l'étape 1", () => {
  const p = A.planBloc(A.etatInitial(), BD);
  assert.deepEqual(p.map(s => s.exo), ["ccf", "y1", "elev", "sousocc"]);
  assert.equal(p[0].reps, 10); assert.equal(p[0].tenue, "cycle");
  assert.equal(p[1].reps, 8); assert.equal(p[1].series, 2);
  assert.ok(p[1].renfo && !p[2].renfo && !p[0].renfo);
});

test("plans des étapes 2 et 3", () => {
  const e = A.etatInitial(); e.etape = 2;
  assert.deepEqual(A.planBloc(e, BD).map(s => s.exo), ["tete", "y2", "elev", "sousocc"]);
  e.etape = 3;
  const p = A.planBloc(e, BD);
  assert.deepEqual(p.map(s => s.exo), ["tete", "y2", "iso", "elev", "sousocc"]);
  assert.equal(p[2].holds.length, 20);
});

test("tout exercice planifié a un contenu et un lien", () => {
  for (const etape of [1, 2, 3]) {
    const e = A.etatInitial(); e.etape = etape;
    for (const s of A.planBloc(e, BD)) {
      const c = A.CONTENU[s.exo];
      assert.ok(c && c.titre && /^https:\/\//.test(c.video), s.exo);
    }
  }
});

test("séance couplée de l'étape 1 : alternance puis cohérence libre", () => {
  const tl = A.timeline({ type: "couplee", reps: 10, tenue: "cycle", objectif: 300 }, BD);
  const tenues = tl.evenements.filter(e => e.alt === "tenue"), relaches = tl.evenements.filter(e => e.alt === "relache");
  assert.equal(tenues.length, 10); assert.equal(relaches.length, 10);
  assert.ok(Math.abs(relaches[0].t - tenues[0].t - 10 * BD) < 1e-9);
  assert.ok(Math.abs(tenues[1].t - tenues[0].t - 20 * BD) < 1e-9);
  const fin = tl.evenements.find(e => e.son === "fin").t - A.PREP;
  assert.equal(Math.round(fin / (10 * BD)), 28);
  assert.ok(fin >= 300);
  assert.ok(tl.plages.some(p => p.type === "libre"));
});

test("séance couplée : les tenues l'emportent sur un objectif court", () => {
  const tl = A.timeline({ type: "couplee", reps: 10, tenue: "cycle", objectif: 60 }, BD);
  const fin = tl.evenements.find(e => e.son === "fin").t - A.PREP;
  assert.equal(Math.round(fin / (10 * BD)), 20);
  assert.ok(!tl.plages.some(p => p.type === "libre"));
});

test("tenue d'une phase : relâche au début de l'expiration, grille inchangée", () => {
  const tl = A.timeline({ type: "couplee", reps: 5, tenue: "phase", objectif: 300 }, BD);
  const t = tl.evenements.filter(e => e.alt === "tenue"), r = tl.evenements.filter(e => e.alt === "relache");
  assert.equal(t.length, 5); assert.equal(r.length, 5);
  assert.ok(Math.abs(r[0].t - t[0].t - 5 * BD) < 1e-9);
  assert.ok(Math.abs(t[1].t - t[0].t - 20 * BD) < 1e-9);
});

test("Y : 2 séries, cadence de 5 temps, 30 s de repos", () => {
  const tl = A.timeline({ type: "reps", series: 2, reps: 8 }, BD);
  assert.equal(tl.evenements.filter(e => e.son === "hi").length, 16);
  const repos = tl.plages.filter(p => p.type === "repos");
  assert.equal(repos.length, 1); assert.ok(Math.abs(repos[0].t1 - repos[0].t0 - 30) < 1e-9);
  const attendu = A.PREP + 16 * 5 * BD + 30;
  assert.ok(Math.abs(tl.evenements.find(e => e.son === "fin").t - attendu) < 1e-6);
});

test("sous-occipitaux : 3 tenues par côté, un changement de côté", () => {
  const seg = A.planBloc(A.etatInitial(), BD).find(s => s.exo === "sousocc");
  const tl = A.timeline(seg, BD);
  assert.equal(tl.evenements.filter(e => e.son === "tenue").length, 6);
  assert.equal(tl.evenements.filter(e => e.son === "cote").length, 1);
  assert.equal(tl.plages.filter(p => p.type === "relache").length, 4);
  const fin = tl.evenements.find(e => e.son === "fin").t;
  assert.equal(fin, A.PREP + 6 * 6 + 4 * 3 + A.TRANSITION);
});

test("élévateur : gauche, droite en alternance, transitions annoncées", () => {
  const seg = A.planBloc(A.etatInitial(), BD).find(s => s.exo === "elev");
  const tl = A.timeline(seg, BD);
  assert.equal(tl.evenements.filter(e => e.son === "cote").length, 3);
  const tenues = tl.plages.filter(p => p.type === "tenue");
  assert.deepEqual(tenues.map(p => `${p.label} ${p.r}/${p.n}`), ["Côté gauche 1/2", "Côté droit 1/2", "Côté gauche 2/2", "Côté droit 2/2"]);
});

test("3 blocs propres à l'étape 1 : proposition d'étape 2, acceptée", () => {
  let e = nfois(A.etatInitial(), 2, propre);
  assert.equal(A.propositions(e).length, 0);
  e = propre(e);
  assert.ok(A.propositions(e).some(p => p.id === "tenues"));
  e = A.accepter(e, "tenues");
  assert.equal(e.etape, 2);
  assert.deepEqual(e.prog.tete, { tenue: "phase", reps: 5 });
  assert.equal(e.prog.y.reps, 8);
  assert.deepEqual(e.serie, { tenues: 0, y: 0 });
  assert.equal(A.propositions(e).length, 0);
});

test("un jour sans bloc ne casse pas la série, un bloc non propre la remet à 0", () => {
  let e = propre(A.etatInitial());
  jourN += 3;
  e = propre(e);
  assert.equal(e.serie.tenues, 2);
  e = bloc(e, { tenuesPropres: false, yPropres: true });
  assert.deepEqual(e.serie, { tenues: 0, y: 3 });
});

test("proposition reportée : elle revient au bloc propre suivant", () => {
  let e = nfois(A.etatInitial(), 3, propre);
  assert.ok(A.propositions(e).length > 0);
  e = propre(e);
  assert.ok(A.propositions(e).some(p => p.id === "tenues"));
});

test("Y : 8, 10, 12 puis plafond", () => {
  let e = A.etatInitial();
  for (const attendu of [10, 12]) {
    e = nfois(e, 3, s => bloc(s, { tenuesPropres: false, yPropres: true }));
    e = A.accepter(e, "y");
    assert.equal(e.prog.y.reps, attendu);
  }
  e = nfois(e, 3, s => bloc(s, { tenuesPropres: false, yPropres: true }));
  assert.ok(!A.propositions(e).some(p => p.id === "y"));
});

test("étape 2 : paliers de la tête décollée puis étape 3, sans remise à zéro du Y", () => {
  let e = A.accepter(nfois(A.etatInitial(), 3, propre), "tenues");
  e = A.accepter(nfois(e, 3, propre), "y");
  assert.equal(e.prog.y.reps, 10);
  for (const attendu of [{ tenue: "cycle", reps: 5 }, { tenue: "cycle", reps: 10 }]) {
    e = A.accepter(nfois(e, 3, s => bloc(s, { tenuesPropres: true, yPropres: false })), "tenues");
    assert.deepEqual(e.prog.tete, attendu);
  }
  e = A.accepter(nfois(e, 3, s => bloc(s, { tenuesPropres: true, yPropres: false })), "tenues");
  assert.equal(e.etape, 3);
  assert.equal(e.prog.y.reps, 10);
  e = nfois(e, 3, s => bloc(s, { tenuesPropres: true, yPropres: false }));
  assert.ok(!A.propositions(e).some(p => p.id === "tenues"));
});

test("gêne : début de l'étape précédente, séries à 0", () => {
  let e = A.etatInitial();
  e.etape = 2; e.prog = { tete: { tenue: "cycle", reps: 10 }, y: { reps: 12 } }; e.serie = { tenues: 2, y: 2 };
  e = bloc(e, { gene: true, tenuesPropres: true, yPropres: true });
  assert.equal(e.etape, 1);
  assert.equal(e.prog.y.reps, 8);
  assert.deepEqual(e.serie, { tenues: 0, y: 0 });
  e = bloc(e, { gene: true });
  assert.equal(e.etape, 1);
});

test("gêne à l'étape 3 : retour au début de l'étape 2", () => {
  let e = A.etatInitial();
  e.etape = 3; e.prog = { tete: { tenue: "cycle", reps: 10 }, y: { reps: 12 } };
  e = bloc(e, { gene: true });
  assert.equal(e.etape, 2);
  assert.deepEqual(e.prog.tete, { tenue: "phase", reps: 5 });
  assert.equal(e.prog.y.reps, 8);
});

test("un second bloc le même jour ne compte pas", () => {
  const base = A.etatInitial();
  const r1 = A.finirBloc(base, { date: "2026-11-01", h: "20:00", tenuesPropres: true, yPropres: true });
  const r2 = A.finirBloc(r1.etat, { date: "2026-11-01", h: "21:00", tenuesPropres: true, yPropres: true });
  assert.ok(r1.compte); assert.ok(!r2.compte);
  assert.equal(r2.etat.serie.tenues, 1);
  assert.equal(r2.etat.jours["2026-11-01"].bloc.h, "20:00");
});

test("cohérences : durée enregistrée, seules celles qui atteignent l'objectif comptent", () => {
  let e = A.etatInitial();
  e = A.ajouterCoherence(e, { date: "2026-11-02", h: "07:40", s: 305 });
  e = A.ajouterCoherence(e, { date: "2026-11-02", h: "12:10", s: 120 });
  assert.equal(e.jours["2026-11-02"].coherences.length, 2);
  assert.equal(A.resumeJour(e, "2026-11-02").coherences, 1);
  e.reglages.objectif = 120;
  e = A.ajouterCoherence(e, { date: "2026-11-02", h: "17:00", s: 121 });
  assert.equal(A.resumeJour(e, "2026-11-02").coherences, 2);
});

test("les fonctions ne modifient pas l'état reçu", () => {
  const e = A.etatInitial(), gel = JSON.stringify(e);
  A.finirBloc(e, { date: "2026-11-03", h: "20:00", gene: true });
  A.ajouterCoherence(e, { date: "2026-11-03", h: "20:00", s: 300 });
  A.accepter(e, "tenues");
  assert.equal(JSON.stringify(e), gel);
});

test("import : aller-retour et refus d'un fichier étranger", () => {
  const e = propre(A.etatInitial());
  assert.deepEqual(A.migrer(JSON.parse(JSON.stringify(e))), e);
  assert.throws(() => A.migrer({ foo: 1 }));
  assert.throws(() => A.migrer({ v: 1, etape: 7 }));
});
