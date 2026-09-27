/* APLOMB : logique pure (aucun accès au DOM ni à l'audio).
   Script classique : expose le global Aplomb dans le navigateur, module.exports sous Node. */
(function (racine) {
  "use strict";

  const VERSION = "0.1.0";
  const MODELE = 1;
  const PREP = 5;            // secondes de mise en place avant chaque exercice minuté
  const TRANSITION = 5;      // secondes entre deux côtés ou deux directions
  const REPOS_SERIES = 30;   // secondes entre deux séries de Y
  const CYCLE_BLOC = 10;     // temps par cycle dans le bloc (5 inspiration, 5 expiration, verrouillé)
  const PHASE_BLOC = 5;

  // ---------- contenu (aligné sur docs/programme.md) ----------
  const CONTENU = {
    ccf: {
      titre: "Flexion cranio-cervicale",
      lieu: "Allongé sur le dos, serviette pliée sous la tête",
      consignes: [
        "Petit « oui » qui allonge l'arrière du cou ; l'arrière de la tête ne quitte pas la serviette.",
        "Langue posée au palais, dents desserrées.",
        "Deux doigts sur le SCOM : s'il durcit, trop de force, réduis l'amplitude.",
        "Respiration jamais bloquée pendant la tenue."
      ],
      video: "https://ca.physitrack.com/home-exercise-video/deep-neck-flexors-in--supine"
    },
    tete: {
      titre: "Menton rentré, tête décollée",
      lieu: "Allongé sur le dos",
      consignes: [
        "Menton rentré d'abord.",
        "Tête soulevée en le gardant rentré, redescente sans le relâcher.",
        "Langue posée au palais, dents desserrées.",
        "Respiration jamais bloquée pendant la tenue."
      ],
      video: "https://us.physitrack.com/home-exercise-video/chin-tuck%252c-head-lift"
    },
    y1: {
      titre: "Y au sol, coudes fléchis",
      lieu: "Sur le ventre, front sur une serviette",
      consignes: [
        "Mouvement court qui part des omoplates : en arrière et légèrement vers le bas.",
        "Pouces vers le plafond.",
        "Le buste ne décolle pas."
      ],
      video: "https://au.physitrack.com/home-exercise-video/prone-arm-lift-with-elbows-bent---lower-trapezius"
    },
    y2: {
      titre: "Y au sol, bras tendus",
      lieu: "Sur le ventre, front sur une serviette",
      consignes: [
        "Mouvement court qui part des omoplates : en arrière et légèrement vers le bas.",
        "Pouces vers le plafond.",
        "Le buste ne décolle pas."
      ],
      video: "https://us.physitrack.com/home-exercise-video/shoulder-y-raise-in-prone"
    },
    iso: {
      titre: "Isométries en quatre directions",
      lieu: "Assis",
      consignes: [
        "Main contre la tête, menton rétracté.",
        "Pression graduelle, sans mouvement, intensité modérée.",
        "Respiration jamais bloquée."
      ],
      video: "https://www.chiropractic.ca/wp-content/uploads/2017/08/Neck-Motor-Control-Strengthening-Instructions-FR-1-12.pdf",
      videoLibelle: "Guide PDF"
    },
    elev: {
      titre: "Étirement de l'élévateur de la scapula",
      lieu: "Assis",
      consignes: [
        "Main du côté étiré dans le dos.",
        "L'autre main tire la tête en avant et vers le côté opposé, jusqu'à l'étirement de la base du crâne à l'omoplate.",
        "Traction douce."
      ],
      video: "https://fr.physitrack.com/home-exercise-video/%C3%89tirement-des-%C3%A9l%C3%A9vateurs-de-la-scapula-"
    },
    sousocc: {
      titre: "Étirement des sous-occipitaux",
      lieu: "Assis",
      consignes: [
        "Menton rentré, puis léger enroulement vers l'avant, avec la rotation décrite par la vidéo.",
        "Ne pas reprendre les exercices de fin de la vidéo qui passent la tête en extension."
      ],
      video: "https://www.masseur-kinesitherapeute-lanneau-thierry.fr/articles/cervicalgie/article/comment-etirer-le-cou-etirement-des-muscles-principaux-conseil-de-kine",
      videoLibelle: "Article de T. Lanneau, kiné"
    },
    micro: {
      titre: "Rentrée de menton assise",
      lieu: "Assis, au bureau",
      consignes: [],
      video: "https://fr.physitrack.com/home-exercise-video/r%C3%A9traction-cervicale-active"
    }
  };

  const RESPIRATION = "Une main sur le ventre, l'autre en haut de la poitrine : le ventre monte à l'inspiration, la poitrine bouge peu, épaules et cou relâchés.";
  const DIRECTIONS = ["Vers l'avant, main sur le front", "Vers l'arrière, main derrière la tête", "Côté gauche, main sur la tempe", "Côté droit, main sur la tempe"];

  // ---------- dates ----------
  const deux = n => String(n).padStart(2, "0");
  const dateLocale = d => `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
  const heureLocale = d => `${deux(d.getHours())}:${deux(d.getMinutes())}`;

  // ---------- état ----------
  const clone = o => JSON.parse(JSON.stringify(o));
  function etatInitial() {
    return {
      v: MODELE,
      etape: 1,
      serie: { tenues: 0, y: 0 },
      prog: { tete: { tenue: "phase", reps: 5 }, y: { reps: 8 } },
      jours: {},
      reglages: { tempo: 55, objectif: 300, son: "bip", hauteur: 0, volume: 0.7 }
    };
  }
  function migrer(obj) {
    if (!obj || typeof obj !== "object" || obj.v !== MODELE) throw new Error("Fichier non reconnu : version de modèle attendue " + MODELE + ".");
    const e = etatInitial();
    if (![1, 2, 3].includes(obj.etape)) throw new Error("Étape invalide.");
    e.etape = obj.etape;
    e.serie = { tenues: +(obj.serie && obj.serie.tenues) || 0, y: +(obj.serie && obj.serie.y) || 0 };
    if (obj.prog && obj.prog.tete && ["phase", "cycle"].includes(obj.prog.tete.tenue) && [5, 10].includes(obj.prog.tete.reps)) e.prog.tete = { tenue: obj.prog.tete.tenue, reps: obj.prog.tete.reps };
    if (obj.prog && obj.prog.y && [8, 10, 12].includes(obj.prog.y.reps)) e.prog.y = { reps: obj.prog.y.reps };
    if (obj.jours && typeof obj.jours === "object") e.jours = clone(obj.jours);
    if (obj.reglages && typeof obj.reglages === "object") e.reglages = { ...e.reglages, ...obj.reglages };
    return e;
  }

  // ---------- plan du bloc ----------
  function planBloc(etat, bd) {
    const e = etat.etape, obj = etat.reglages.objectif;
    const s = [];
    if (e === 1) s.push({ type: "couplee", exo: "ccf", reps: 10, tenue: "cycle", objectif: obj });
    else s.push({ type: "couplee", exo: "tete", reps: etat.prog.tete.reps, tenue: etat.prog.tete.tenue, objectif: obj });
    s.push({ type: "reps", exo: e === 1 ? "y1" : "y2", series: 2, reps: etat.prog.y.reps, renfo: true });
    if (e === 3) {
      const holds = [];
      DIRECTIONS.forEach(d => { for (let i = 0; i < 5; i++) holds.push({ label: d, tenue: PHASE_BLOC * bd, repos: PHASE_BLOC * bd }); });
      s.push({ type: "tenues", exo: "iso", holds, renfo: true });
    }
    s.push({ type: "tenues", exo: "elev", holds: ["Côté gauche", "Côté droit", "Côté gauche", "Côté droit"].map(label => ({ label, tenue: 30, repos: 0 })) });
    s.push({ type: "tenues", exo: "sousocc", holds: ["Côté gauche", "Côté gauche", "Côté gauche", "Côté droit", "Côté droit", "Côté droit"].map(label => ({ label, tenue: 6, repos: 3 })) });
    return s;
  }
  function dosage(seg) {
    if (seg.type === "couplee") return `${seg.reps} tenues d'${seg.tenue === "cycle" ? "un cycle" : "une phase"}, alternées avec un relâchement, dans une cohérence de ${Math.round(seg.objectif / 60)} min`;
    if (seg.type === "reps") return `${seg.series} séries de ${seg.reps}, ${REPOS_SERIES} s de repos entre les séries`;
    if (seg.exo === "iso") return "5 tenues d'une phase par direction, 4 directions";
    if (seg.exo === "elev") return "2 × 30 s par côté, en alternant";
    if (seg.exo === "sousocc") return "3 × 6 s par côté";
    return "";
  }

  // ---------- timelines ----------
  // Chaque timeline : { duree, evenements: [{ t, son, alt? }], plages: [{ t0, t1, type, ... }], respi? }
  // Temps en secondes depuis le début de la mise en place.
  function prep(ev, pl) {
    pl.push({ t0: 0, t1: PREP, type: "prep" });
    [PREP - 3, PREP - 2, PREP - 1].forEach(t => ev.push({ t, son: "tic" }));
  }

  function timelineCouplee(seg, bd) {
    const ev = [], pl = [], L = CYCLE_BLOC, T = PREP;
    prep(ev, pl);
    const hold = seg.tenue === "cycle" ? L : PHASE_BLOC;
    const nCycles = Math.max(Math.ceil(seg.objectif / (L * bd) - 1e-9), 2 * seg.reps);
    for (let n = 0; n < nCycles * L; n++) {
      const pos = n % L, c = Math.floor(n / L), inh = pos < PHASE_BLOC;
      const k = inh ? pos : pos - PHASE_BLOC;
      const e = { t: T + n * bd, son: k === 0 ? "hi" : k === PHASE_BLOC - 1 ? "lo" : "mid" };
      const r = Math.floor(c / 2);
      if (r < seg.reps) {
        if (n === 2 * r * L) e.alt = "tenue";
        if (n === 2 * r * L + hold) e.alt = "relache";
      }
      ev.push(e);
    }
    for (let r = 0; r < seg.reps; r++) {
      const a = T + 2 * r * L * bd;
      pl.push({ t0: a, t1: a + hold * bd, type: "tenue", r: r + 1, n: seg.reps });
      pl.push({ t0: a + hold * bd, t1: a + 2 * L * bd, type: "relache", r: r + 1, n: seg.reps });
    }
    const fin = T + nCycles * L * bd;
    if (2 * seg.reps < nCycles) pl.push({ t0: T + 2 * seg.reps * L * bd, t1: fin, type: "libre" });
    ev.push({ t: fin, son: "fin" });
    return { duree: fin + 1.6, evenements: ev, plages: pl, respi: { t0: T, bd, L, inh: PHASE_BLOC }, coherence: { t0: T, fin, objectif: seg.objectif } };
  }

  function timelineReps(seg, bd) {
    const ev = [], pl = [];
    prep(ev, pl);
    let t = PREP;
    const etapes = [["Monte", 1, "hi"], ["Tiens", 2, "mid"], ["Descends", 1, "lo"], ["Pose", 1, null]];
    for (let s = 0; s < seg.series; s++) {
      if (s > 0) {
        pl.push({ t0: t, t1: t + REPOS_SERIES, type: "repos", serie: s + 1, series: seg.series });
        [3, 2, 1].forEach(d => ev.push({ t: t + REPOS_SERIES - d, son: "tic" }));
        t += REPOS_SERIES;
      }
      for (let r = 0; r < seg.reps; r++) {
        for (const [mot, nb, son] of etapes) {
          if (son) ev.push({ t, son });
          if (mot === "Tiens") ev.push({ t: t + bd, son: "mid" });
          pl.push({ t0: t, t1: t + nb * bd, type: "rep", mot, r: r + 1, n: seg.reps, serie: s + 1, series: seg.series });
          t += nb * bd;
        }
      }
    }
    ev.push({ t, son: "fin" });
    return { duree: t + 1.6, evenements: ev, plages: pl };
  }

  function timelineTenues(seg) {
    const ev = [], pl = [];
    prep(ev, pl);
    let t = PREP;
    const total = {}, vus = {};
    seg.holds.forEach(h => { total[h.label] = (total[h.label] || 0) + 1; });
    seg.holds.forEach((h, i) => {
      if (i > 0 && seg.holds[i - 1].label !== h.label) {
        pl.push({ t0: t, t1: t + TRANSITION, type: "transition", label: h.label });
        ev.push({ t, son: "cote" });
        t += TRANSITION;
      }
      vus[h.label] = (vus[h.label] || 0) + 1;
      ev.push({ t, son: "tenue" });
      pl.push({ t0: t, t1: t + h.tenue, type: "tenue", label: h.label, r: vus[h.label], n: total[h.label] });
      t += h.tenue;
      const dernier = i === seg.holds.length - 1;
      ev.push({ t, son: dernier ? "fin" : "relache" });
      const suivantMeme = !dernier && seg.holds[i + 1].label === h.label;
      if (suivantMeme && h.repos > 0) {
        pl.push({ t0: t, t1: t + h.repos, type: "relache", label: h.label });
        t += h.repos;
      }
    });
    return { duree: t + 1.6, evenements: ev, plages: pl };
  }

  function timeline(seg, bd) {
    const tl = seg.type === "couplee" ? timelineCouplee(seg, bd) : seg.type === "reps" ? timelineReps(seg, bd) : timelineTenues(seg);
    tl.evenements.sort((a, b) => a.t - b.t);
    return tl;
  }

  // ---------- journal ----------
  function jour(etat, date) {
    if (!etat.jours[date]) etat.jours[date] = { coherences: [], micro: 0 };
    return etat.jours[date];
  }
  function ajouterCoherence(etat, { date, h, s }) {
    const e = clone(etat);
    jour(e, date).coherences.push({ h, s: Math.round(s), ok: s >= e.reglages.objectif - 0.5 });
    return e;
  }
  function resumeJour(etat, date) {
    const j = etat.jours[date] || { coherences: [], micro: 0 };
    return { coherences: j.coherences.filter(c => c.ok).length, bloc: j.bloc || null, micro: j.micro || 0 };
  }

  // ---------- progression ----------
  // decl : { gene, tenuesPropres, yPropres }. Renvoie { etat, compte }.
  function finirBloc(etat, { date, h, gene, tenuesPropres, yPropres }) {
    const e = clone(etat), j = jour(e, date);
    if (j.bloc) return { etat: e, compte: false };
    j.bloc = { h, etape: e.etape, tenuesPropres: !gene && !!tenuesPropres, yPropres: !gene && !!yPropres, gene: !!gene };
    if (gene) {
      e.etape = Math.max(1, e.etape - 1);
      e.prog = { tete: { tenue: "phase", reps: 5 }, y: { reps: 8 } };
      e.serie = { tenues: 0, y: 0 };
    } else {
      e.serie.tenues = tenuesPropres ? e.serie.tenues + 1 : 0;
      e.serie.y = yPropres ? e.serie.y + 1 : 0;
    }
    return { etat: e, compte: true };
  }
  function paliersTete() { return [{ tenue: "phase", reps: 5 }, { tenue: "cycle", reps: 5 }, { tenue: "cycle", reps: 10 }]; }
  function indexTete(t) { return paliersTete().findIndex(p => p.tenue === t.tenue && p.reps === t.reps); }
  const fmtTete = p => `${p.reps} tenues d'${p.tenue === "cycle" ? "un cycle" : "une phase"}`;

  function propositions(etat) {
    const out = [];
    if (etat.serie.tenues >= 3) {
      if (etat.etape === 1) out.push({ id: "tenues", texte: "Passer à l'étape 2 : tête décollée (5 tenues d'une phase) et Y bras tendus (2 × 8)." });
      else if (etat.etape === 2) {
        const i = indexTete(etat.prog.tete);
        if (i < 2) out.push({ id: "tenues", texte: `Tête décollée : passer à ${fmtTete(paliersTete()[i + 1])}.` });
        else out.push({ id: "tenues", texte: "Passer à l'étape 3 : ajout des isométries en quatre directions." });
      }
    }
    if (etat.serie.y >= 3 && etat.prog.y.reps < 12) out.push({ id: "y", texte: `Y au sol : passer à 2 × ${etat.prog.y.reps + 2}.` });
    return out;
  }
  function accepter(etat, id) {
    if (!propositions(etat).some(p => p.id === id)) return clone(etat);
    const e = clone(etat);
    if (id === "y") { e.prog.y.reps += 2; e.serie.y = 0; return e; }
    e.serie.tenues = 0;
    if (e.etape === 1) { e.etape = 2; e.prog = { tete: { tenue: "phase", reps: 5 }, y: { reps: 8 } }; e.serie.y = 0; }
    else if (e.etape === 2) {
      const i = indexTete(e.prog.tete);
      if (i < 2) e.prog.tete = clone(paliersTete()[i + 1]); else e.etape = 3;
    }
    return e;
  }
  function descriptionEtape(etat) {
    const e = etat.etape, y = etat.prog.y.reps;
    if (e === 1) return `Étape 1 : 10 tenues d'un cycle, Y coudes fléchis 2 × ${y}, étirements.`;
    if (e === 2) return `Étape 2 : tête décollée, ${fmtTete(etat.prog.tete)}, Y bras tendus 2 × ${y}, étirements.`;
    return `Étape 3 : tête décollée, ${fmtTete(etat.prog.tete)}, Y bras tendus 2 × ${y}, isométries, étirements.`;
  }

  const API = {
    VERSION, MODELE, PREP, TRANSITION, REPOS_SERIES, CONTENU, RESPIRATION, DIRECTIONS,
    dateLocale, heureLocale, etatInitial, migrer, planBloc, dosage, timeline,
    ajouterCoherence, resumeJour, finirBloc, propositions, accepter, descriptionEtape
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else racine.Aplomb = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
