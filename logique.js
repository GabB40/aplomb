/* APLOMB : logique pure (aucun accès au DOM ni à l'audio).
   Script classique : expose le global Aplomb dans le navigateur, module.exports sous Node. */
(function (racine) {
  "use strict";

  const VERSION = "0.3.0";
  const MODELE = 1;
  const PREP = 5;            // secondes de mise en place avant chaque exercice minuté
  const TRANSITION = 5;      // secondes entre deux côtés ou deux directions
  const REPOS_SERIES = 30;   // secondes entre deux séries de Y
  const CYCLE_BLOC = 10;     // temps par cycle de cohérence (5 inspiration, 5 expiration)
  const PHASE_BLOC = 5;
  const TENUE_SEC = { phase: 5, cycle: 10 };   // flexion cranio-cervicale et tête décollée
  const RELACHE_TENUES = 10;
  const MACHOIRE = 8;        // secondes de mâchoire au repos en début de micro-pause
  const MICRO = { reps: 5, tenue: 5, repos: 3 };
  const RELEVES = [0, 7, 21, 42];
  const CRENEAUX_DEFAUT = { midi: 11, soir: 15 };

  // ---------- contenu (aligné sur docs/programme.md) ----------
  // Fiches : but, position (lieu), étapes, sensation, erreurs, vidéo validée (docs/videos.md).
  const CONTENU = {
    ccf: {
      titre: "Flexion cranio-cervicale",
      lieu: "Allongé sur le dos, serviette pliée sous la tête",
      enPlace: "Allongé sur le dos, serviette pliée sous la tête. Langue au palais, dents desserrées. Deux doigts sur le SCOM, le muscle en corde sur le côté du cou. Respire normalement.",
      pendant: "Petit « oui » : le menton descend légèrement, l'arrière de la tête reste sur la serviette. Seul point à surveiller : le SCOM reste mou sous les doigts.",
      but: "Entraîner en endurance les fléchisseurs profonds du cou, qui tiennent la tête sans l'aide des muscles de surface.",
      etapes: [
        "Langue posée au palais, dents desserrées.",
        "Deux doigts sur le SCOM, le muscle en corde sur le côté du cou.",
        "Petit « oui » : le menton descend légèrement, l'arrière du cou s'allonge.",
        "L'arrière de la tête ne quitte pas la serviette.",
        "Tiens en respirant, puis relâche."
      ],
      sensation: "Un effort léger. Le SCOM reste relâché sous les doigts : s'il durcit, c'est trop de force, réduis l'amplitude.",
      erreurs: [
        "La tête décolle de la serviette.",
        "Le menton écrase vers la poitrine.",
        "Le SCOM durcit sous les doigts.",
        "La respiration se bloque pendant la tenue."
      ],
      video: "https://www.physioactif.com/videos-dexercise/flechisseurs-profonds-du-cou",
      source: "Physioactif"
    },
    tete: {
      titre: "Menton rentré, tête décollée",
      lieu: "Allongé sur le dos",
      enPlace: "Allongé sur le dos. Langue au palais, dents desserrées. Respire normalement.",
      pendant: "Rentre le menton, décolle la tête en le gardant rentré, redescends sans le relâcher. Seul point à surveiller : le menton ne ressort pas.",
      but: "Les mêmes muscles profonds, avec le poids de la tête en plus.",
      etapes: [
        "Langue posée au palais, dents desserrées.",
        "Menton rentré d'abord.",
        "Tête soulevée en gardant le menton rentré.",
        "Tiens en respirant.",
        "Redescends sans relâcher le menton, puis relâche une fois la tête posée."
      ],
      sensation: "Le SCOM reste relâché sous les doigts pendant toute la tenue.",
      erreurs: [
        "Le menton ressort quand la tête monte ou redescend.",
        "Le SCOM durcit.",
        "La respiration se bloque."
      ],
      video: "https://www.youtube.com/watch?v=WGPrYtMe9ug",
      source: "YouTube"
    },
    y1: {
      titre: "Y au sol, coudes fléchis",
      lieu: "À plat ventre, front posé sur une serviette pliée",
      enPlace: "À plat ventre, front sur une serviette pliée. Bras au-dessus de la tête en Y, coudes fléchis à environ 45°, pouces vers le plafond.",
      pendant: "Les omoplates glissent en arrière et un peu vers le bas, les bras se décollent de quelques centimètres. Seul point à surveiller : le buste et la tête restent au sol.",
      but: "Endurance du bas des trapèzes, qui tiennent l'omoplate en arrière et en bas.",
      etapes: [
        "Bras au-dessus de la tête, écartés en Y, coudes fléchis à environ 45°.",
        "Pouces vers le plafond.",
        "Le mouvement part des omoplates : elles glissent en arrière et légèrement vers le bas.",
        "Les bras se décollent de quelques centimètres ; petite tenue en haut.",
        "Redescends en contrôlant. La tête reste posée du début à la fin."
      ],
      sensation: "Le travail se sent au bas des omoplates ; les épaules restent loin des oreilles.",
      erreurs: [
        "Le buste ou la tête décollent du sol, même un peu.",
        "La tête se relève, le regard part vers l'avant.",
        "Les épaules montent vers les oreilles."
      ],
      video: "https://au.physitrack.com/home-exercise-video/prone-arm-lift-with-elbows-slightly-bent-%28lower-trapezius%29",
      source: "Physitrack, en anglais"
    },
    y2: {
      titre: "Y au sol, bras tendus",
      lieu: "À plat ventre, front posé sur une serviette pliée",
      enPlace: "À plat ventre, front sur une serviette pliée. Bras tendus au-dessus de la tête en Y, comme des aiguilles sur 10 h 10, pouces vers le plafond.",
      pendant: "Les omoplates glissent en arrière et un peu vers le bas, les bras se décollent de quelques centimètres. Seul point à surveiller : le buste et la tête restent au sol.",
      but: "Le bas des trapèzes avec un levier plus long, donc plus de travail.",
      etapes: [
        "Bras tendus au-dessus de la tête, en Y, comme des aiguilles sur 10 h 10.",
        "Pouces vers le plafond.",
        "Le mouvement part des omoplates : elles glissent en arrière et légèrement vers le bas.",
        "Les bras se décollent de quelques centimètres ; petite tenue en haut.",
        "Redescends en contrôlant. La tête reste posée du début à la fin."
      ],
      sensation: "Le travail se sent au bas des omoplates ; les épaules restent loin des oreilles.",
      erreurs: [
        "Le buste ou la tête décollent du sol, même un peu.",
        "La tête se relève, le regard part vers l'avant.",
        "Les épaules montent vers les oreilles.",
        "Les coudes se plient : c'est la version de l'étape 1."
      ],
      video: "https://www.youtube.com/watch?v=sC-AyKwTiLA",
      source: "YouTube"
    },
    iso: {
      titre: "Isométries en quatre directions",
      lieu: "Assis",
      enPlace: "Assis, menton rétracté. Main contre la tête à l'endroit annoncé : front, arrière de la tête, puis chaque tempe. Respire normalement.",
      pendant: "La tête pousse contre la main, progressivement, intensité modérée. Seul point à surveiller : la tête ne bouge pas.",
      but: "Renforcer le cou dans les quatre directions, sans le bouger.",
      etapes: [
        "Menton rétracté ; main contre la tête : sur le front, derrière la tête, puis sur chaque tempe.",
        "La tête pousse contre la main, progressivement, sans aucun mouvement.",
        "Intensité modérée ; tiens en respirant.",
        "Relâche doucement."
      ],
      sensation: "Un effort modéré ; la tête reste immobile.",
      erreurs: [
        "La tête bouge.",
        "La pression arrive d'un coup.",
        "La respiration se bloque."
      ],
      video: "https://www.chiropractic.ca/wp-content/uploads/2017/08/Neck-Motor-Control-Strengthening-Instructions-FR-1-12.pdf",
      source: "Guide PDF de l'Association chiropratique canadienne"
    },
    elev: {
      titre: "Étirement de l'élévateur de la scapula",
      lieu: "Assis",
      enPlace: "Assis. Main du côté annoncé dans le dos.",
      pendant: "Tourne la tête vers l'autre côté, puis penche-la en avant, nez vers l'aisselle ; l'autre main accompagne doucement. Seul point à surveiller : le nez reste dirigé vers l'aisselle.",
      but: "Étirer le muscle qui relie le haut de l'omoplate aux premières vertèbres du cou.",
      etapes: [
        "Pour étirer le côté droit : main droite dans le dos, dos de la main posé au bas du dos.",
        "Tourne la tête vers la gauche, puis penche-la en avant, nez vers l'aisselle gauche.",
        "Main gauche sur l'arrière ou le haut de la tête : elle accompagne le mouvement, traction douce.",
        "L'épaule droite reste basse. Tiens sans rebond, puis change de côté."
      ],
      sensation: "Étirement de la base du crâne jusqu'à l'omoplate, du côté de la main dans le dos.",
      erreurs: [
        "La tête s'incline seulement sur le côté, visage vers l'avant : c'est un autre étirement, celui du trapèze supérieur.",
        "Le nez ou le menton partent vers le plafond.",
        "La main du côté étiré n'est pas dans le dos.",
        "Traction forte, à-coups ou rebonds."
      ],
      video: "https://fr.physitrack.com/home-exercise-video/%C3%89tirement-du-muscle-%C3%A9l%C3%A9vateur-de-l%27omoplate-%28levator-scapula%29",
      source: "Physitrack"
    },
    sousocc: {
      titre: "Étirement des sous-occipitaux",
      lieu: "Assis",
      enPlace: "Assis. Paume de la main du côté annoncé sur l'oreille, pouce juste sous le crâne ; l'autre main sur le haut du crâne.",
      pendant: "Tourne la tête vers l'autre côté, rentre le menton, enroule légèrement vers l'avant. Seul point à surveiller : la tête ne part jamais en arrière.",
      but: "Étirer les petits muscles profonds situés sous le crâne, entre l'arrière de la tête et le haut du cou.",
      etapes: [
        "Pour étirer le côté droit : paume de la main droite sur l'oreille droite, pouce à l'arrière du cou, juste sous le crâne.",
        "Main gauche sur le haut du crâne, un peu en arrière.",
        "Tourne la tête vers la gauche, environ 45°.",
        "Rentre le menton, puis enroule légèrement la tête vers l'avant.",
        "Tiens, relâche, recommence ; changer un peu l'angle de rotation est permis. Puis l'autre côté."
      ],
      sensation: "Étirement sous le crâne, à l'arrière, du côté de la main posée sur l'oreille.",
      erreurs: [
        "La tête part en arrière, nez ou menton vers le plafond, à n'importe quel moment.",
        "L'oreille descend vers l'épaule sans rotation ni enroulement.",
        "Traction forte ou à-coups."
      ],
      video: "https://www.youtube.com/embed/YleLF-g2544?start=72&end=188",
      source: "T. Lanneau, kiné, de 1:12 à 3:08"
    },
    micro: {
      titre: "Flexion cranio-cervicale assise",
      lieu: "Assis droit, au bureau",
      enPlace: "Assis droit. Mâchoire au repos : lèvres jointes, dents desserrées, langue au palais. Deux doigts sur le SCOM.",
      pendant: "Petit « oui », la tête ne recule ni n'avance. Seul point à surveiller : le SCOM reste mou.",
      but: "Refaire dans la journée le geste du bloc, là où la tête avance : au bureau.",
      etapes: [
        "Mâchoire au repos : lèvres jointes, dents desserrées, langue au palais.",
        "Deux doigts sur le SCOM.",
        "Petit « oui » : le menton descend légèrement, l'arrière du cou s'allonge, la tête ne recule ni n'avance.",
        "Tiens 5 s en respirant, puis relâche."
      ],
      sensation: "Le même effort léger que dans le bloc ; le SCOM reste relâché.",
      erreurs: [
        "Le menton va vers la poitrine : tout le cou plie.",
        "La tête recule (c'est une rétraction) ou avance.",
        "La tête part en arrière.",
        "La tête pousse contre un appui ou une main : c'est l'isométrie de l'étape 3."
      ],
      video: "https://www.physioactif.com/videos-dexercise/controle-de-la-flexion-cranio-vertebrale",
      source: "Physioactif"
    },
    coh: {
      titre: "Cohérence cardiaque",
      lieu: "Assis ou allongé",
      enPlace: "Assis ou allongé, mâchoire au repos. Une main sur le ventre, l'autre en haut de la poitrine.",
      pendant: "Suis le disque : inspire quand il grandit, expire quand il diminue. Seul point à surveiller : c'est le ventre qui bouge, pas la poitrine.",
      but: "Respirer lentement avec le ventre : une respiration haute fait travailler le SCOM, les scalènes et le haut des trapèzes à chaque inspiration.",
      etapes: [
        "Mâchoire au repos : lèvres jointes, dents desserrées, langue au palais.",
        "Une main sur le ventre, l'autre en haut de la poitrine.",
        "Le ventre monte à l'inspiration, la poitrine bouge peu.",
        "Suis le disque et les bips : il grandit à l'inspiration et diminue à l'expiration."
      ],
      sensation: "Épaules et cou relâchés.",
      erreurs: [
        "Les épaules montent à l'inspiration.",
        "La poitrine se soulève plus que le ventre."
      ],
      video: null,
      source: null
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
      reglages: { tempo: 55, objectif: 300, son: "bip", hauteur: 0, volume: 0.7, debut: null, creneaux: clone(CRENEAUX_DEFAUT) }
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
    const c = e.reglages.creneaux;
    e.reglages.creneaux = c && Number.isInteger(c.midi) && Number.isInteger(c.soir) && c.midi > 0 && c.midi < c.soir && c.soir < 24
      ? { midi: c.midi, soir: c.soir } : clone(CRENEAUX_DEFAUT);
    if (!(typeof e.reglages.debut === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.reglages.debut))) e.reglages.debut = null;
    return e;
  }

  // ---------- plan du bloc ----------
  function planBloc(etat, bd) {
    const e = etat.etape;
    const s = [];
    const tenues = (n, sec) => Array.from({ length: n }, () => ({ label: "Tenue", tenue: sec, repos: RELACHE_TENUES }));
    if (e === 1) s.push({ type: "tenues", exo: "ccf", holds: tenues(10, TENUE_SEC.cycle), renfo: true });
    else s.push({ type: "tenues", exo: "tete", holds: tenues(etat.prog.tete.reps, TENUE_SEC[etat.prog.tete.tenue]), renfo: true });
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
  function planCoherence(etat) { return [{ type: "coherence", exo: "coh", objectif: etat.reglages.objectif }]; }
  function planMicro() { return [{ type: "micro", exo: "micro" }]; }
  function dosage(seg) {
    if (seg.type === "coherence") return `${Math.round(seg.objectif / 60)} min, 5 temps d'inspiration et 5 d'expiration`;
    if (seg.type === "micro") return `${MACHOIRE} s de mâchoire au repos, puis ${MICRO.reps} tenues de ${MICRO.tenue} s séparées par ${MICRO.repos} s de relâchement`;
    if (seg.exo === "ccf" || seg.exo === "tete") return `${seg.holds.length} tenues de ${seg.holds[0].tenue} s, ${RELACHE_TENUES} s de relâchement entre deux`;
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

  function timelineCoherence(seg, bd) {
    const ev = [], pl = [], L = CYCLE_BLOC, T = PREP;
    prep(ev, pl);
    const nCycles = Math.max(1, Math.ceil(seg.objectif / (L * bd) - 1e-9));
    for (let n = 0; n < nCycles * L; n++) {
      const pos = n % L, k = pos < PHASE_BLOC ? pos : pos - PHASE_BLOC;
      ev.push({ t: T + n * bd, son: k === 0 ? "hi" : k === PHASE_BLOC - 1 ? "lo" : "mid" });
    }
    const fin = T + nCycles * L * bd;
    pl.push({ t0: T, t1: fin, type: "libre" });
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

  function timelineMicro() {
    const ev = [], pl = [];
    prep(ev, pl);
    let t = PREP;
    pl.push({ t0: t, t1: t + MACHOIRE, type: "machoire" });
    t += MACHOIRE;
    for (let r = 1; r <= MICRO.reps; r++) {
      ev.push({ t, son: "tenue" });
      pl.push({ t0: t, t1: t + MICRO.tenue, type: "tenue", label: "Hochement", r, n: MICRO.reps });
      t += MICRO.tenue;
      const dernier = r === MICRO.reps;
      ev.push({ t, son: dernier ? "fin" : "relache" });
      if (!dernier) { pl.push({ t0: t, t1: t + MICRO.repos, type: "relache", label: "Hochement" }); t += MICRO.repos; }
    }
    return { duree: t + 1.6, evenements: ev, plages: pl };
  }

  function timeline(seg, bd) {
    const tl = seg.type === "coherence" ? timelineCoherence(seg, bd)
      : seg.type === "micro" ? timelineMicro()
      : seg.type === "reps" ? timelineReps(seg, bd) : timelineTenues(seg);
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
  function ajouterMicro(etat, date) {
    const e = clone(etat), j = jour(e, date);
    j.micro = (j.micro || 0) + 1;
    return e;
  }

  // ---------- journée : créneaux et action du moment ----------
  const minutes = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  function creneauDe(h, c) { const m = minutes(h); return m < c.midi * 60 ? "matin" : m < c.soir * 60 ? "midi" : "soir"; }
  // Cohérences à l'objectif rangées par créneau (heure de la première), bloc, micro-pauses.
  function etatJour(etat, date) {
    const j = etat.jours[date] || { coherences: [], micro: 0 };
    const out = { matin: null, midi: null, soir: null, bloc: j.bloc || null, micro: j.micro || 0, coherences: 0 };
    for (const x of j.coherences || []) {
      if (!x.ok) continue;
      out.coherences++;
      const k = creneauDe(x.h, etat.reglages.creneaux);
      if (!out[k]) out[k] = x.h;
    }
    return out;
  }
  // type : "bloc", "coherence" ou null ; suite : prochain créneau quand celui-ci est fait (hors soir).
  function actionDuJour(etat, date, h) {
    const c = etat.reglages.creneaux, cr = creneauDe(h, c), ej = etatJour(etat, date);
    if (cr === "soir") return { creneau: cr, type: !ej.bloc ? "bloc" : !ej.soir ? "coherence" : null, suite: null };
    if (!ej[cr]) return { creneau: cr, type: "coherence", suite: null };
    return { creneau: cr, type: null, suite: cr === "matin" ? { creneau: "midi", heure: c.midi } : { creneau: "soir", heure: c.soir } };
  }

  // ---------- jour du programme et relevés ----------
  const versUTC = d => { const [y, m, j] = d.split("-").map(Number); return Date.UTC(y, m - 1, j); };
  function ajouterJours(d, n) {
    const x = new Date(versUTC(d) + n * 864e5);
    return `${x.getUTCFullYear()}-${deux(x.getUTCMonth() + 1)}-${deux(x.getUTCDate())}`;
  }
  function jourProgramme(debut, date) {
    if (!debut) return null;
    const n = Math.round((versUTC(date) - versUTC(debut)) / 864e5);
    const p = RELEVES.find(r => r >= n);
    return { n, duree: RELEVES[RELEVES.length - 1], releve: p === undefined ? null : { j: p, date: ajouterJours(debut, p), aujourdhui: p === n } };
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
  const fmtTete = p => `${p.reps} × ${TENUE_SEC[p.tenue]} s`;

  function propositions(etat) {
    const out = [];
    if (etat.serie.tenues >= 3) {
      if (etat.etape === 1) out.push({ id: "tenues", texte: "Passer à l'étape 2 : tête décollée (5 × 5 s) et Y bras tendus (2 × 8)." });
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
    if (e === 1) return `Étape 1 : flexion cranio-cervicale 10 × 10 s, Y coudes fléchis 2 × ${y}, étirements.`;
    if (e === 2) return `Étape 2 : tête décollée, ${fmtTete(etat.prog.tete)}, Y bras tendus 2 × ${y}, étirements.`;
    return `Étape 3 : tête décollée, ${fmtTete(etat.prog.tete)}, Y bras tendus 2 × ${y}, isométries, étirements.`;
  }

  const API = {
    VERSION, MODELE, PREP, TRANSITION, TENUE_SEC, RELACHE_TENUES, REPOS_SERIES, MACHOIRE, MICRO, RELEVES, CONTENU, RESPIRATION, DIRECTIONS,
    dateLocale, heureLocale, etatInitial, migrer, planBloc, planCoherence, planMicro, dosage, timeline,
    ajouterCoherence, ajouterMicro, resumeJour, etatJour, creneauDe, actionDuJour, jourProgramme, ajouterJours,
    finirBloc, propositions, accepter, descriptionEtape
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else racine.Aplomb = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
