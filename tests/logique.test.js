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
  assert.equal(p[0].holds.length, 10); assert.equal(p[0].holds[0].tenue, 10);
  assert.equal(p[1].reps, 8); assert.equal(p[1].series, 2);
  assert.ok(p[0].renfo && p[1].renfo && !p[2].renfo && !p[3].renfo);
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

test("fiches : but, position, étapes, sensation, erreurs ; une vidéo validée sauf pour la cohérence", () => {
  for (const [id, c] of Object.entries(A.CONTENU)) {
    assert.ok(c.titre && c.lieu && c.but && c.sensation, id);
    assert.ok(c.etapes.length >= 3 && c.erreurs.length >= 2, id);
    if (id === "coh") assert.equal(c.video, null);
    else assert.ok(/^https:\/\//.test(c.video) && c.source, id);
  }
});

test("créneaux : midi à 11 h, soir à 15 h par défaut", () => {
  const c = A.etatInitial().reglages.creneaux;
  assert.equal(A.creneauDe("10:59", c), "matin");
  assert.equal(A.creneauDe("11:00", c), "midi");
  assert.equal(A.creneauDe("14:59", c), "midi");
  assert.equal(A.creneauDe("15:00", c), "soir");
});

test("action du jour : cohérence du créneau, bloc le soir, puis plus rien", () => {
  const d = "2026-12-01";
  let e = A.etatInitial();
  assert.equal(A.actionDuJour(e, d, "08:00").type, "coherence");
  e = A.ajouterCoherence(e, { date: d, h: "08:00", s: 120 });
  assert.equal(A.actionDuJour(e, d, "08:10").type, "coherence", "sous l'objectif, le créneau n'est pas fait");
  e = A.ajouterCoherence(e, { date: d, h: "08:10", s: 300 });
  assert.deepEqual(A.actionDuJour(e, d, "09:00"), { creneau: "matin", type: null, suite: { creneau: "midi", heure: 11 } });
  assert.equal(A.actionDuJour(e, d, "12:00").type, "coherence");
  assert.equal(A.actionDuJour(e, d, "18:00").type, "bloc");
  e = A.ajouterCoherence(e, { date: d, h: "21:00", s: 300 });
  e = A.finirBloc(e, { date: d, h: "21:10", tenuesPropres: true, yPropres: true }).etat;
  assert.deepEqual(A.actionDuJour(e, d, "21:30"), { creneau: "soir", type: null, suite: null });
});

test("action du jour : bloc fait avant 15 h, reste la cohérence du soir", () => {
  const d = "2026-12-02";
  let e = A.ajouterCoherence(A.etatInitial(), { date: d, h: "14:00", s: 300 });
  e = A.finirBloc(e, { date: d, h: "14:10", tenuesPropres: true, yPropres: true }).etat;
  assert.equal(A.actionDuJour(e, d, "18:00").type, "coherence");
  const ej = A.etatJour(e, d);
  assert.equal(ej.midi, "14:00"); assert.equal(ej.soir, null); assert.equal(ej.bloc.h, "14:10");
});

test("créneaux réglables", () => {
  const e = A.etatInitial(); e.reglages.creneaux = { midi: 12, soir: 17 };
  assert.equal(A.actionDuJour(e, "2026-12-03", "16:00").creneau, "midi");
  assert.equal(A.actionDuJour(e, "2026-12-03", "17:00").type, "bloc");
});

test("jour du programme et prochain relevé", () => {
  assert.equal(A.jourProgramme(null, "2026-09-27"), null);
  assert.deepEqual(A.jourProgramme("2026-09-27", "2026-09-27"), { n: 0, duree: 42, releve: { j: 0, date: "2026-09-27", aujourdhui: true } });
  assert.deepEqual(A.jourProgramme("2026-09-27", "2026-09-30").releve, { j: 7, date: "2026-10-04", aujourdhui: false });
  assert.deepEqual(A.jourProgramme("2026-09-27", "2026-10-26"), { n: 29, duree: 42, releve: { j: 42, date: "2026-11-08", aujourdhui: false } }, "passage à l'heure d'hiver");
  assert.equal(A.jourProgramme("2026-09-27", "2026-11-08").releve.aujourdhui, true);
  assert.equal(A.jourProgramme("2026-09-27", "2026-11-09").releve, null);
  assert.equal(A.jourProgramme("2026-09-27", "2026-09-25").n, -2);
});

test("micro-pause : mâchoire au repos, 5 tenues de 5 s, 45 s après la mise en place", () => {
  const tl = A.timeline(A.planMicro()[0], BD);
  assert.equal(tl.plages[1].type, "machoire");
  const tenues = tl.plages.filter(p => p.type === "tenue");
  assert.equal(tenues.length, 5);
  assert.ok(tenues.every(p => p.t1 - p.t0 === 5));
  assert.equal(tl.plages.filter(p => p.type === "relache").length, 4);
  assert.equal(tl.evenements.find(e => e.son === "fin").t - A.PREP, 45);
});

test("cohérence seule : aucune tenue, au moins l'objectif", () => {
  const tl = A.timeline(A.planCoherence(A.etatInitial())[0], BD);
  assert.ok(!tl.evenements.some(e => e.alt));
  assert.deepEqual(tl.plages.map(p => p.type), ["prep", "libre"]);
  assert.ok(tl.coherence.fin - tl.coherence.t0 >= 300);
});

test("micro-pauses comptées par jour", () => {
  let e = A.etatInitial();
  e = A.ajouterMicro(A.ajouterMicro(e, "2026-12-04"), "2026-12-04");
  assert.equal(A.etatJour(e, "2026-12-04").micro, 2);
  assert.equal(A.etatJour(e, "2026-12-05").micro, 0);
});

test("import : réglages v0.1 complétés, créneaux et date invalides remis par défaut", () => {
  const v01 = A.etatInitial(); delete v01.reglages.creneaux; delete v01.reglages.debut;
  const e = A.migrer(JSON.parse(JSON.stringify(v01)));
  assert.deepEqual(e.reglages.creneaux, { midi: 11, soir: 15 }); assert.equal(e.reglages.debut, null);
  const faux = A.etatInitial(); faux.reglages.creneaux = { midi: 16, soir: 12 }; faux.reglages.debut = "demain";
  const f = A.migrer(JSON.parse(JSON.stringify(faux)));
  assert.deepEqual(f.reglages.creneaux, { midi: 11, soir: 15 }); assert.equal(f.reglages.debut, null);
  const bon = A.etatInitial(); bon.reglages.debut = "2026-09-27";
  assert.equal(A.migrer(JSON.parse(JSON.stringify(bon))).reglages.debut, "2026-09-27");
});

test("micro-pause et cohérence ne modifient pas l'état reçu", () => {
  const e = A.etatInitial(), gel = JSON.stringify(e);
  A.ajouterMicro(e, "2026-12-06");
  A.actionDuJour(e, "2026-12-06", "08:00");
  assert.equal(JSON.stringify(e), gel);
});

test("flexion cranio-cervicale : 10 tenues de 10 s, 10 s de relâchement, sans bips de respiration", () => {
  const seg = A.planBloc(A.etatInitial(), BD)[0];
  assert.equal(seg.type, "tenues");
  const tl = A.timeline(seg, BD);
  const tenues = tl.plages.filter(p => p.type === "tenue"), relaches = tl.plages.filter(p => p.type === "relache");
  assert.equal(tenues.length, 10); assert.equal(relaches.length, 9);
  assert.ok(tenues.every(p => p.t1 - p.t0 === 10) && relaches.every(p => p.t1 - p.t0 === 10));
  assert.ok(!tl.evenements.some(e => ["hi", "mid", "lo", "cote"].includes(e.son)));
  assert.equal(A.dosage(seg), "10 tenues de 10 s, 10 s de relâchement entre deux");
});

test("tête décollée : paliers 5 × 5 s, 5 × 10 s, 10 × 10 s", () => {
  let e = A.etatInitial(); e.etape = 2;
  const secondes = et => A.planBloc(et, BD)[0].holds.map(h => h.tenue);
  assert.deepEqual(secondes(e), [5, 5, 5, 5, 5]);
  e.prog.tete = { tenue: "cycle", reps: 5 }; assert.deepEqual(secondes(e), [10, 10, 10, 10, 10]);
  e.prog.tete = { tenue: "cycle", reps: 10 }; assert.equal(secondes(e).length, 10);
  assert.match(A.descriptionEtape(e), /tête décollée, 10 × 10 s/);
});

test("écrans « Prêt » : mise en place et un seul point à surveiller pour chaque exercice", () => {
  for (const [id, c] of Object.entries(A.CONTENU)) {
    assert.ok(c.enPlace && c.pendant, id);
    assert.equal((c.pendant.match(/Seul point à surveiller/g) || []).length, 1, id);
  }
});
