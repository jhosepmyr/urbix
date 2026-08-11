import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin, Clock, Wallet, Footprints, ArrowLeftRight, Accessibility,
  ShieldCheck, AlertTriangle, Bus, Car, Bike, MessageCircle, Users,
  Star, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Home,
  Map as MapIcon, Sparkles, Send, TrendingUp, TrendingDown, HelpCircle,
  RotateCcw, Zap, Plus, ThumbsUp, CircleDot, ArrowRight, Award,
  BookOpen, Navigation, Flag, PlayCircle, ShieldAlert, ListChecks,
  MessageSquare, CheckCheck, Camera, Trophy,
} from "lucide-react";

/* ============================================================
   0. FUENTES
   ============================================================ */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`;

/* ============================================================
   1. TOKENS DE DISEÑO
   ============================================================ */
const T = {
  paper: "#0B0F1A",
  paperDim: "#141C2E",
  card2: "#1C2640",
  ink: "#E8EDF6",
  inkSoft: "#6D7FA0",
  line: "#232F4A",
  tiempo: "#4F8EF7",
  costo: "#F5C542",
  seguridad: "#22D69A",
  comodidad: "#A855F7",
  alerta: "#F05252",
};

const MODE_COLOR = {
  bus: T.tiempo,
  auto: T.comodidad,
  bici: T.seguridad,
  caminata: T.costo,
};

const MODE_ICON = { bus: Bus, auto: Car, bici: Bike, caminata: Footprints };

const F = {
  display: "'Space Grotesk', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const APP_MODE = "mock"; // "mock" | "integrated"

/* ============================================================
   2. UTILIDADES
   ============================================================ */
const fmtSoles = (n) => `S/ ${Number(n).toFixed(2).replace(/\.00$/, "")}`;
const fmtMin = (min, max) => (min === max ? `${min} min` : `${min}–${max} min`);

const TODAY = new Date("2026-08-11T09:00:00");
const daysSince = (dateStr) => {
  const d = new Date(dateStr);
  return Math.round((TODAY - d) / 86400000);
};
const fmtDaysAgo = (dateStr) => {
  const d = daysSince(dateStr);
  if (d <= 0) return "hoy";
  if (d === 1) return "hace 1 día";
  return `hace ${d} días`;
};

/* ============================================================
   3. DATOS MOCK — corredor San Juan de Lurigancho → San Isidro
   ============================================================ */
function getMockRoutes() {
  return [
    {
      id: "r1",
      name: "Corredor Azul + Metropolitano",
      origin: "San Juan de Lurigancho",
      destination: "San Isidro",
      durationMin: 55,
      durationMax: 75,
      cost: 4.5,
      walkingMeters: 450,
      transfers: 1,
      accessible: true,
      sourceType: "oficial",
      observations: 6,
      lastVerified: "2026-07-20",
      routeSteps: [
        { mode: "caminata", description: "Camina al paradero Los Postes", durationMin: 8, cost: 0 },
        { mode: "bus", description: "Corredor Azul hacia Javier Prado", durationMin: 35, cost: 2.5 },
        { mode: "bus", description: "Metropolitano hacia estación Javier Prado / San Isidro", durationMin: 20, cost: 2.0 },
        { mode: "caminata", description: "Camina hasta el destino final", durationMin: 5, cost: 0 },
      ],
      recentConditions: [
        { date: "2026-08-10", note: "Alta afluencia en hora punta, +10 min de espera reportados." },
        { date: "2026-08-07", note: "Servicio regular, sin incidencias." },
      ],
    },
    {
      id: "r2",
      name: "Bus regular directo (Vía de Evitamiento)",
      origin: "San Juan de Lurigancho",
      destination: "San Isidro",
      durationMin: 70,
      durationMax: 100,
      cost: 3.5,
      walkingMeters: 200,
      transfers: 0,
      accessible: false,
      sourceType: "oficial",
      observations: 3,
      lastVerified: "2026-06-15",
      routeSteps: [
        { mode: "caminata", description: "Camina al paradero de la avenida principal", durationMin: 3, cost: 0 },
        { mode: "bus", description: "Bus directo por Vía de Evitamiento", durationMin: 62, cost: 3.5 },
        { mode: "caminata", description: "Camina hasta el destino final", durationMin: 5, cost: 0 },
      ],
      recentConditions: [
        { date: "2026-08-09", note: "Congestión reportada en Vía de Evitamiento, +15 a +20 min." },
      ],
    },
    {
      id: "r3",
      name: "Mixto: mototaxi + Metropolitano",
      origin: "San Juan de Lurigancho",
      destination: "San Isidro",
      durationMin: 50,
      durationMax: 65,
      cost: 6.0,
      walkingMeters: 600,
      transfers: 2,
      accessible: false,
      sourceType: "oficial",
      observations: 1,
      lastVerified: "2026-03-01",
      routeSteps: [
        { mode: "auto", description: "Mototaxi hasta estación Metropolitano", durationMin: 12, cost: 3.0 },
        { mode: "bus", description: "Metropolitano hacia San Isidro", durationMin: 28, cost: 3.0 },
        { mode: "caminata", description: "Camina hasta el destino final", durationMin: 10, cost: 0 },
      ],
      recentConditions: [
        { date: "2026-07-02", note: "Poca disponibilidad de mototaxis después de las 8pm." },
      ],
    },
  ];
}

function getMockCommunityRoutes() {
  return [
    {
      id: "c1",
      origin: "San Juan de Lurigancho",
      destination: "San Isidro",
      title: "Combi informal directa por Vía de Evitamiento",
      regulatoryStatus: "not_verified",
      communityStatus: "recently_confirmed",
      fareMin: 3,
      fareMax: 4,
      waitMin: 5,
      waitMax: 15,
      durationMin: 60,
      durationMax: 90,
      routeConsistency: "medium",
      informationConfidence: "medium",
      accessible: false,
      lastVerified: "2026-08-05",
      observations: 4,
      sources: 3,
      recentConditions: [
        { date: "2026-08-05", note: "Tres usuarios confirmaron el recorrido esta semana." },
      ],
    },
    {
      id: "c2",
      origin: "San Juan de Lurigancho",
      destination: "San Isidro",
      title: "Auto colectivo compartido (paradero informal Canto Grande)",
      regulatoryStatus: "operator_verified",
      communityStatus: "conflicting_information",
      fareMin: 5,
      fareMax: 8,
      waitMin: 10,
      waitMax: 25,
      durationMin: 45,
      durationMax: 70,
      routeConsistency: "low",
      informationConfidence: "medium",
      accessible: false,
      lastVerified: "2026-07-28",
      observations: 2,
      sources: 2,
      recentConditions: [
        { date: "2026-07-28", note: "Reportes contradictorios sobre el paradero de salida exacto." },
      ],
    },
  ];
}

function getMockIncidents() {
  return [
    { id: "i1", routeId: "r1", description: "Congestión en Javier Prado", extraMinutes: 15 },
    { id: "i2", routeId: "r2", description: "Paradero temporalmente cerrado", extraMinutes: 20 },
  ];
}

function getMockProductivePlaces() {
  return [
    { id: "p1", name: "Biblioteca Municipal Javier Prado", type: "Biblioteca", distanceMeters: 180, note: "Wifi y enchufes disponibles, según 6 reportes.", source: "comunidad" },
    { id: "p2", name: "Sala de estudio Corredor Azul", type: "Sala de estudio", distanceMeters: 90, note: "Abierta 6am–10pm, poco concurrida en la mañana.", source: "comunidad" },
    { id: "p3", name: "Café con wifi Los Postes", type: "Café", distanceMeters: 240, note: "Ideal para llamadas cortas mientras esperas.", source: "comunidad" },
  ];
}

function getMockLeaderboard() {
  return [
    { name: "Rosa M.", zone: "San Juan de Lurigancho", points: 410 },
    { name: "Jhonatan P.", zone: "San Isidro", points: 265 },
    { name: "Milagros T.", zone: "San Juan de Lurigancho", points: 150 },
  ];
}

/* ============================================================
   4. MOTOR DE DECISIÓN
   ============================================================ */
function communityToRoute(c) {
  return {
    id: c.id,
    name: c.title,
    origin: c.origin,
    destination: c.destination,
    durationMin: c.durationMin,
    durationMax: c.durationMax,
    cost: c.fareMin === c.fareMax ? c.fareMin : (c.fareMin + c.fareMax) / 2,
    costMin: c.fareMin,
    costMax: c.fareMax,
    walkingMeters: 300,
    transfers: 0,
    accessible: c.accessible,
    sourceType: "comunitario",
    observations: c.observations,
    lastVerified: c.lastVerified,
    routeSteps: [
      { mode: "auto", description: c.title, durationMin: c.durationMin, cost: c.fareMin },
    ],
    recentConditions: c.recentConditions,
    community: c,
  };
}

function officialConfidence(route) {
  const days = daysSince(route.lastVerified);
  if (route.observations >= 5 && days < 30) return "Alta";
  if (route.observations >= 2 && days < 90) return "Media";
  return "Baja";
}

const REG_SCORE = {
  authorized_verified: 3,
  operator_verified: 2,
  not_verified: 1,
  explicitly_unauthorized: 0,
};
const COM_SCORE = {
  recently_confirmed: 3,
  observed: 2,
  reported: 1,
  outdated: 0,
  conflicting_information: 0,
};
const CONS_SCORE = { high: 2, medium: 1, low: 0 };

function communityConfidence(c) {
  const score =
    REG_SCORE[c.regulatoryStatus] +
    COM_SCORE[c.communityStatus] +
    CONS_SCORE[c.routeConsistency] +
    CONS_SCORE[c.informationConfidence];
  const capped = c.communityStatus === "outdated" || c.communityStatus === "conflicting_information";
  if (capped) return score >= 4 ? "Media" : "Baja";
  if (score >= 8) return "Alta";
  if (score >= 4) return "Media";
  return "Baja";
}

function confidenceLabel(route) {
  return route.sourceType === "comunitario" ? communityConfidence(route.community) : officialConfidence(route);
}

const BASE_WEIGHTS = { time: 0.35, cost: 0.25, walk: 0.2, transfers: 0.1, variability: 0.1 };

function weightBoosts(base, preferences) {
  const w = { ...base };
  if (preferences.includes("equilibrio")) return { ...base };
  if (preferences.includes("tiempo")) w.time += 0.25;
  if (preferences.includes("costo")) w.cost += 0.25;
  if (preferences.includes("caminata")) w.walk += 0.25;
  if (preferences.includes("transbordos")) w.transfers += 0.2;
  if (preferences.includes("comodidad")) { w.transfers += 0.15; w.variability += 0.15; }
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  Object.keys(w).forEach((k) => (w[k] = w[k] / total));
  return w;
}

function norm(val, min, max) {
  if (max === min) return 0;
  return (val - min) / (max - min);
}

function rankRoutes(routes, preferences) {
  if (routes.length === 0) return [];
  const weights = weightBoosts(BASE_WEIGHTS, preferences);
  const avgDur = (r) => (r.durationMin + r.durationMax) / 2;
  const variability = (r) => r.durationMax - r.durationMin;
  const durs = routes.map(avgDur);
  const costs = routes.map((r) => r.cost);
  const walks = routes.map((r) => r.walkingMeters);
  const trans = routes.map((r) => r.transfers);
  const vars = routes.map(variability);

  const accessibilityBonus = preferences.includes("accesibilidad") ? 0.18 : 0;

  const scored = routes.map((r) => {
    const scoreInterno =
      weights.time * norm(avgDur(r), Math.min(...durs), Math.max(...durs)) +
      weights.cost * norm(r.cost, Math.min(...costs), Math.max(...costs)) +
      weights.walk * norm(r.walkingMeters, Math.min(...walks), Math.max(...walks)) +
      weights.transfers * norm(r.transfers, Math.min(...trans), Math.max(...trans)) +
      weights.variability * norm(variability(r), Math.min(...vars), Math.max(...vars)) +
      (r.accessible ? 0 : accessibilityBonus);
    return { ...r, scoreInterno };
  });
  return scored.sort((a, b) => a.scoreInterno - b.scoreInterno);
}

function applyFilters(routes, filters) {
  return routes.filter((r) => {
    if (filters.maxBudget != null && r.cost > filters.maxBudget) return false;
    if (filters.maxWalk != null && r.walkingMeters > filters.maxWalk) return false;
    if (filters.maxTransfers != null && r.transfers > filters.maxTransfers) return false;
    if (filters.needsAccessible && !r.accessible) return false;
    return true;
  });
}

function exceededReasonSingle(route, filters) {
  const fails = [];
  if (filters.maxBudget != null && route.cost > filters.maxBudget) {
    fails.push({ key: "budget", excess: route.cost - filters.maxBudget, margin: 5, label: `supera tu presupuesto por ${fmtSoles(route.cost - filters.maxBudget)}` });
  }
  if (filters.maxWalk != null && route.walkingMeters > filters.maxWalk) {
    fails.push({ key: "walk", excess: route.walkingMeters - filters.maxWalk, margin: 250, label: `implica ${route.walkingMeters - filters.maxWalk} m más de caminata de la tolerada` });
  }
  if (filters.maxTransfers != null && route.transfers > filters.maxTransfers) {
    fails.push({ key: "transfers", excess: route.transfers - filters.maxTransfers, margin: 0, label: `tiene ${route.transfers - filters.maxTransfers} transbordo(s) más de lo aceptado` });
  }
  if (filters.needsAccessible && !route.accessible) {
    fails.push({ key: "accessible", excess: 1, margin: 0, label: "no está confirmada como accesible" });
  }
  if (fails.length !== 1) return null;
  const f = fails[0];
  if (f.excess > f.margin) return null;
  return f;
}

const DIM_LABEL = {
  time: { label: "tiempo", unit: "min", get: (r) => r.durationMin },
  cost: { label: "costo", unit: "S/", get: (r) => r.cost },
  walk: { label: "caminata", unit: "m", get: (r) => r.walkingMeters },
  transfers: { label: "transbordos", unit: "", get: (r) => r.transfers },
};

function tradeoffSentence(route, reference) {
  if (!reference || reference.id === route.id) return "Es tu única alternativa que cumple lo declarado.";
  const dims = Object.keys(DIM_LABEL);
  let bestGain = null;
  let worstLoss = null;
  dims.forEach((k) => {
    const { get } = DIM_LABEL[k];
    const diff = get(reference) - get(route); // positivo = route es mejor (menor)
    if (diff > 0 && (!bestGain || diff / get(reference) > bestGain.pct)) bestGain = { key: k, diff, pct: diff / (get(reference) || 1) };
    if (diff < 0 && (!worstLoss || -diff / get(route) > worstLoss.pct)) worstLoss = { key: k, diff: -diff, pct: -diff / (get(route) || 1) };
  });
  const phrase = (d, sign) => {
    const { label, unit } = DIM_LABEL[d.key];
    const val = unit === "S/" ? fmtSoles(d.diff) : `${Math.round(d.diff)} ${unit}`.trim();
    return `${sign === "gain" ? "ganas" : "sacrificas"} ${val} de ${label}`;
  };
  if (bestGain && worstLoss) return `Frente a la opción más rápida, ${phrase(bestGain, "gain")}, pero ${phrase(worstLoss, "loss")}.`;
  if (bestGain) return `Frente a la opción más rápida, ${phrase(bestGain, "gain")}, sin sacrificar nada relevante.`;
  if (worstLoss) return `Frente a la opción más rápida, ${phrase(worstLoss, "loss")}, sin ganar nada relevante a cambio.`;
  return "Es equivalente a la opción más rápida en todos los factores medidos.";
}

function generateExplanation(route, allRoutes) {
  const others = allRoutes.filter((r) => r.id !== route.id);
  if (others.length === 0) return "Se recomienda porque es tu única alternativa dentro de lo declarado.";
  const wins = [];
  if (others.every((o) => route.walkingMeters <= o.walkingMeters)) wins.push("tiene la menor caminata");
  if (others.every((o) => route.cost <= o.cost)) wins.push("cumple el presupuesto más ajustado");
  if (others.every((o) => (route.durationMin + route.durationMax) / 2 <= (o.durationMin + o.durationMax) / 2)) wins.push("es la más rápida en promedio");
  if (others.every((o) => route.transfers <= o.transfers)) wins.push("tiene menos transbordos");
  if (wins.length === 0) return "Se recomienda porque ofrece el mejor balance general entre tiempo, costo y caminata según tus preferencias.";
  return `Se recomienda porque ${wins.slice(0, 2).join(" y ")}.`;
}

function conditionsChecklist(route, filters) {
  const items = [];
  if (filters.maxBudget != null) items.push({ ok: route.cost <= filters.maxBudget, label: `Presupuesto máximo ${fmtSoles(filters.maxBudget)}` });
  if (filters.maxWalk != null) items.push({ ok: route.walkingMeters <= filters.maxWalk, label: `Caminata máxima ${filters.maxWalk} m` });
  if (filters.maxTransfers != null) items.push({ ok: route.transfers <= filters.maxTransfers, label: `Máximo ${filters.maxTransfers} transbordo(s)` });
  if (filters.needsAccessible) items.push({ ok: route.accessible, label: "Ruta accesible" });
  return items;
}

function sensitivityNotes(route, filters, allUnfiltered) {
  const notes = [];
  if (filters.maxBudget != null) {
    const cheaper = allUnfiltered.filter((r) => r.id !== route.id && r.cost < route.cost).sort((a, b) => b.cost - a.cost)[0];
    if (cheaper) notes.push(`Si tu presupuesto baja a ${fmtSoles(cheaper.cost)}, "${cheaper.name}" pasa a ser la única opción que cumple.`);
  }
  const fasterRoute = allUnfiltered.filter((r) => r.id !== route.id).sort((a, b) => a.durationMin - b.durationMin)[0];
  if (fasterRoute && fasterRoute.durationMin < route.durationMin) {
    notes.push(`Si tu horario se adelanta ${route.durationMin - fasterRoute.durationMin} min, "${fasterRoute.name}" se vuelve más conveniente.`);
  }
  if (notes.length === 0) notes.push("Con las condiciones actuales, esta recomendación es estable ante pequeños cambios.");
  return notes;
}

function planBFor(route) {
  return `Si a los ${Math.round(route.durationMin * 0.4)} min de espera esta opción no aparece o se retrasa, cambia a tu plan B.`;
}

function reputationFor(points) {
  if (points >= 200) return { level: "Líder de Zona", next: null, color: T.costo };
  if (points >= 80) return { level: "Mapeador", next: 200, color: T.comodidad };
  return { level: "Explorador", next: 80, color: T.tiempo };
}

/* ============================================================
   5. COMPONENTES BASE
   ============================================================ */
function Badge({ tone = "neutral", icon: Icon, children }) {
  const toneMap = {
    low: { bg: "rgba(34,214,154,0.12)", fg: T.seguridad },
    medium: { bg: "rgba(245,197,66,0.12)", fg: T.costo },
    high: { bg: "rgba(240,82,82,0.12)", fg: T.alerta },
    neutral: { bg: "rgba(109,127,160,0.12)", fg: T.inkSoft },
    violet: { bg: "rgba(168,85,247,0.12)", fg: T.comodidad },
  };
  const c = toneMap[tone] || toneMap.neutral;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: c.bg, color: c.fg, fontFamily: F.mono, fontWeight: 600,
        fontSize: 11, letterSpacing: 0.2, padding: "4px 8px", borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: F.body, fontWeight: 500, fontSize: 13,
        padding: "9px 14px", borderRadius: 10, cursor: "pointer",
        border: `1px solid ${active ? T.tiempo : T.line}`,
        background: active ? "rgba(79,142,247,0.14)" : T.card2,
        color: active ? T.tiempo : T.ink,
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

function ChipRow({ options, value, onChange, multi = true }) {
  const toggle = (opt) => {
    if (multi) {
      onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    } else {
      onChange(value === opt ? null : opt);
    }
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => (
        <Chip key={opt.value} active={multi ? value.includes(opt.value) : value === opt.value} onClick={() => toggle(opt.value)}>
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}

function Btn({ variant = "primary", icon: Icon, onClick, children, full, disabled, small }) {
  const styles = {
    primary: { bg: T.tiempo, fg: "#0B0F1A", border: "none" },
    secondary: { bg: "transparent", fg: T.ink, border: `1px solid ${T.line}` },
    warning: { bg: "rgba(240,82,82,0.12)", fg: T.alerta, border: `1px solid rgba(240,82,82,0.4)` },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: F.body, fontWeight: 600, fontSize: small ? 13 : 14.5,
        padding: small ? "9px 14px" : "13px 18px", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
        background: s.bg, color: s.fg, border: s.border, width: full ? "100%" : "auto",
        opacity: disabled ? 0.5 : 1, transition: "opacity .15s, transform .1s",
      }}
    >
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
      <label style={{ fontFamily: F.body, fontWeight: 600, fontSize: 13, color: T.inkSoft }}>{label}</label>
      {children}
      {hint && <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  fontFamily: F.body, fontSize: 14.5, color: T.ink, background: T.card2,
  border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px", outline: "none", width: "100%",
};

function Section({ title, icon: Icon, children, right }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <Icon size={15} color={T.inkSoft} />}
          <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 13.5, color: T.inkSoft, textTransform: "uppercase", letterSpacing: 0.6, margin: 0 }}>{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: T.card2, border: `1px solid ${T.line}`, borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={18} color={T.ink} />
          </button>
        )}
        <h2 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 19, color: T.ink, margin: 0 }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

function Disclaimer({ children }) {
  return (
    <div style={{ display: "flex", gap: 8, background: "rgba(109,127,160,0.08)", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 16 }}>
      <Info size={14} color={T.inkSoft} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

/* ============================================================
   6. COMPONENTES DE DOMINIO
   ============================================================ */
function ConfidenceBadge({ route }) {
  const label = confidenceLabel(route);
  const tone = label === "Alta" ? "low" : label === "Media" ? "medium" : "high";
  return <Badge tone={tone} icon={ShieldCheck}>Confianza {label}</Badge>;
}

function SourceBadge({ route }) {
  return route.sourceType === "oficial" ? (
    <Badge tone="neutral" icon={CircleDot}>Fuente oficial</Badge>
  ) : (
    <Badge tone="violet" icon={Users}>Reporte comunitario</Badge>
  );
}

function RouteMap({ route }) {
  const modes = route.routeSteps.map((s) => s.mode);
  return (
    <div style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        {modes.map((m, i) => {
          const Icon = MODE_ICON[m];
          return (
            <React.Fragment key={i}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${MODE_COLOR[m]}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} color={MODE_COLOR[m]} />
              </div>
              {i < modes.length - 1 && <div style={{ flex: 1, height: 2, background: T.line }} />}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 11, color: T.inkSoft }}>
        <span>{route.origin}</span>
        <span>{route.destination}</span>
      </div>
    </div>
  );
}

function RouteCard({ route, reference, allInList, onSelect, onDetail, isNearMiss, nearMissReason, isFavorite, onToggleFavorite }) {
  return (
    <div style={{ background: T.paperDim, border: `1px solid ${isNearMiss ? T.line : T.line}`, borderRadius: 16, padding: 18, marginBottom: 14, opacity: isNearMiss ? 0.85 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 16, color: T.ink, margin: "0 0 6px" }}>{route.name}</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <SourceBadge route={route} />
            <ConfidenceBadge route={route} />
            {route.accessible && <Badge tone="low" icon={Accessibility}>Accesible</Badge>}
          </div>
        </div>
        <button onClick={onToggleFavorite} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Star size={20} color={isFavorite ? T.costo : T.inkSoft} fill={isFavorite ? T.costo : "none"} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
        <Metric icon={Clock} value={fmtMin(route.durationMin, route.durationMax)} color={T.tiempo} />
        <Metric icon={Wallet} value={fmtSoles(route.cost)} color={T.costo} />
        <Metric icon={Footprints} value={`${route.walkingMeters} m`} color={T.seguridad} />
        <Metric icon={ArrowLeftRight} value={`${route.transfers}`} color={T.comodidad} />
      </div>

      {isNearMiss ? (
        <div style={{ display: "flex", gap: 8, background: "rgba(245,197,66,0.08)", border: `1px solid rgba(245,197,66,0.25)`, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
          <AlertTriangle size={14} color={T.costo} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>
            Quedó fuera de tus condiciones: {nearMissReason.label}. La mostramos porque falla un solo criterio y por poco margen.
          </span>
        </div>
      ) : (
        <p style={{ fontFamily: F.body, fontSize: 13.5, color: T.ink, lineHeight: 1.5, margin: "0 0 12px", fontStyle: "italic" }}>
          {tradeoffSentence(route, reference)}
        </p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="secondary" small onClick={() => onDetail(route)}>Ver detalle</Btn>
        <Btn variant="primary" small icon={Check} onClick={() => onSelect(route)}>Elegir esta</Btn>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: T.card2, borderRadius: 10, padding: "10px 4px" }}>
      <Icon size={14} color={color} />
      <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 12.5, color: T.ink }}>{value}</span>
    </div>
  );
}

function QuickConfirm({ route, onSubmitted }) {
  const [answers, setAnswers] = useState({ stillWorks: null, waitMatched: null, costMatched: null });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const YesNo = ({ k, label }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
      <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => set(k, true)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${answers[k] === true ? T.seguridad : T.line}`, background: answers[k] === true ? "rgba(34,214,154,0.15)" : T.card2, cursor: "pointer" }}>
          <Check size={14} color={answers[k] === true ? T.seguridad : T.inkSoft} />
        </button>
        <button onClick={() => set(k, false)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${answers[k] === false ? T.alerta : T.line}`, background: answers[k] === false ? "rgba(240,82,82,0.15)" : T.card2, cursor: "pointer" }}>
          <X size={14} color={answers[k] === false ? T.alerta : T.inkSoft} />
        </button>
      </div>
    </div>
  );
  if (sent) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.seguridad, fontFamily: F.body, fontSize: 13, fontWeight: 600 }}>
        <ShieldCheck size={16} /> Gracias, tu confirmación ayuda a mejorar la confianza de este dato.
      </div>
    );
  }
  return (
    <div style={{ background: T.card2, borderRadius: 12, padding: 14 }}>
      <YesNo k="stillWorks" label="¿Esta ruta sigue funcionando así?" />
      <YesNo k="waitMatched" label="¿El tiempo de espera fue similar?" />
      <YesNo k="costMatched" label="¿El costo fue similar?" />
      <div style={{ marginTop: 10 }}>
        <Btn variant="primary" small full onClick={() => { setSent(true); onSubmitted && onSubmitted(answers); }}>
          Enviar confirmación
        </Btn>
      </div>
    </div>
  );
}

/* ============================================================
   7. NAVEGACIÓN INFERIOR
   ============================================================ */
function BottomNav({ screen, go }) {
  const items = [
    { key: "planning", label: "Planificar", icon: Home },
    { key: "myweek", label: "Mi semana", icon: Calendar },
    { key: "community", label: "Comunidad", icon: Users },
  ];
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, zIndex: 40,
        display: "flex", borderTop: `1px solid ${T.line}`,
        background: "rgba(20,28,46,0.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {items.map((it) => {
        const active = screen === it.key;
        const Icon = it.icon;
        return (
          <button key={it.key} onClick={() => go(it.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
            <div style={{ position: "relative" }}>
              {active && (
                <span style={{ position: "absolute", inset: -6, background: "rgba(79,142,247,0.14)", borderRadius: 10 }} />
              )}
              <Icon size={19} color={active ? T.tiempo : T.inkSoft} style={{ position: "relative" }} />
            </div>
            <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 10.5, color: active ? T.tiempo : T.inkSoft }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   8. PANTALLAS
   ============================================================ */
function WelcomeScreen({ onStart, onOpenChat }) {
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 28 }}>
      <div />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${T.tiempo}, ${T.comodidad})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <MapIcon size={30} color="#0B0F1A" strokeWidth={2.5} />
        </div>
        <h1 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 32, color: T.ink, margin: "0 0 10px" }}>URBIX</h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: T.inkSoft, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 4px" }}>
          Compara cómo moverte por Lima — tiempo, costo, caminata y accesibilidad — sin ocultar lo que sacrificas en cada opción.
        </p>
        <p style={{ fontFamily: F.mono, fontSize: 11.5, color: T.inkSoft, marginTop: 14 }}>ODS 11.2 · acceso al transporte público</p>
      </div>
      <div>
        <Disclaimer>Disponible para el corredor San Juan de Lurigancho ↔ San Isidro — nuevas zonas se activan cada semana con los reportes de la comunidad.</Disclaimer>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn variant="primary" full icon={ArrowRight} onClick={onStart}>Planificar un viaje</Btn>
          <Btn variant="secondary" full icon={MessageSquare} onClick={onOpenChat}>Chatea con URBIX por WhatsApp</Btn>
        </div>
      </div>
    </div>
  );
}

function PlanningScreen({ trip, setTrip, onPersonalize, onSearch }) {
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Planificar viaje" />
      <div style={{ padding: "10px 20px" }}>
        <Field label="Origen">
          <input style={inputStyle} value={trip.origin} onChange={(e) => setTrip({ ...trip, origin: e.target.value })} placeholder="Ej. San Juan de Lurigancho" />
        </Field>
        <Field label="Destino">
          <input style={inputStyle} value={trip.destination} onChange={(e) => setTrip({ ...trip, destination: e.target.value })} placeholder="Ej. San Isidro" />
        </Field>
        <Field label="Fecha">
          <input type="date" style={inputStyle} value={trip.date} onChange={(e) => setTrip({ ...trip, date: e.target.value })} />
        </Field>
        <Field label="¿Cómo quieres planificar la hora?">
          <ChipRow
            multi={false}
            value={trip.timeMode}
            onChange={(v) => setTrip({ ...trip, timeMode: v })}
            options={[
              { value: "arrive", label: "Llegar antes de" },
              { value: "depart", label: "Salir a las" },
            ]}
          />
        </Field>
        <Field label="Hora">
          <input type="time" style={inputStyle} value={trip.time} onChange={(e) => setTrip({ ...trip, time: e.target.value })} />
        </Field>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
          <Btn variant="primary" full icon={Sparkles} onClick={onSearch}>Ver resultados</Btn>
          <Btn variant="secondary" full icon={Zap} onClick={onPersonalize}>Personalizar restricciones y preferencias</Btn>
        </div>
      </div>
    </div>
  );
}

const MAIN_CRITERIA = [
  { value: "tiempo", label: "Tiempo" },
  { value: "costo", label: "Costo" },
  { value: "accesibilidad", label: "Accesibilidad" },
  { value: "comodidad", label: "Comodidad" },
  { value: "equilibrio", label: "Equilibrio" },
];

function PersonalizeScreen({ filters, setFilters, preferences, setPreferences, productiveTime, setProductiveTime, onBack, onApply }) {
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Personalizar" onBack={onBack} />
      <div style={{ padding: "10px 20px" }}>
        <Disclaimer>Las restricciones descartan rutas. Las preferencias solo las reordenan — nunca pierdes alternativas por una prioridad blanda.</Disclaimer>

        <Section title="Restricciones (duras)" icon={ShieldCheck}>
          <Field label={`Presupuesto máximo: ${filters.maxBudget != null ? fmtSoles(filters.maxBudget) : "sin límite"}`}>
            <input type="range" min={0} max={15} step={0.5} value={filters.maxBudget ?? 15} onChange={(e) => setFilters({ ...filters, maxBudget: Number(e.target.value) })} style={{ width: "100%" }} />
          </Field>
          <Field label={`Caminata tolerable: ${filters.maxWalk != null ? `${filters.maxWalk} m` : "sin límite"}`}>
            <input type="range" min={0} max={1000} step={50} value={filters.maxWalk ?? 1000} onChange={(e) => setFilters({ ...filters, maxWalk: Number(e.target.value) })} style={{ width: "100%" }} />
          </Field>
          <Field label={`Transbordos aceptados: ${filters.maxTransfers}`}>
            <input type="range" min={0} max={3} step={1} value={filters.maxTransfers} onChange={(e) => setFilters({ ...filters, maxTransfers: Number(e.target.value) })} style={{ width: "100%" }} />
          </Field>
          <Chip active={filters.needsAccessible} onClick={() => setFilters({ ...filters, needsAccessible: !filters.needsAccessible })}>
            <Accessibility size={13} style={{ verticalAlign: "middle", marginRight: 5 }} /> Necesito ruta accesible
          </Chip>
        </Section>

        <Section title="Tu prioridad principal" icon={Sparkles}>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, margin: "0 0 10px" }}>¿Qué es más importante para ti en este viaje?</p>
          <ChipRow
            multi={false}
            value={MAIN_CRITERIA.find((c) => preferences.includes(c.value))?.value || null}
            onChange={(v) => {
              const withoutMain = preferences.filter((p) => !MAIN_CRITERIA.some((c) => c.value === p));
              setPreferences(v ? [...withoutMain, v] : withoutMain);
            }}
            options={MAIN_CRITERIA}
          />
        </Section>

        <Section title="Ajustes finos (opcional)" icon={ListChecks}>
          <ChipRow
            value={preferences}
            onChange={setPreferences}
            options={[
              { value: "caminata", label: "Priorizar poca caminata" },
              { value: "transbordos", label: "Priorizar pocos transbordos" },
            ]}
          />
        </Section>

        <Section title="¿Tiempo productivo?" icon={BookOpen}>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, margin: "0 0 10px", lineHeight: 1.5 }}>
            Si vas a esperar tu transporte, te sugerimos lugares cercanos reportados por la comunidad para aprovechar ese tiempo.
          </p>
          <Chip active={productiveTime} onClick={() => setProductiveTime(!productiveTime)}>
            <BookOpen size={13} style={{ verticalAlign: "middle", marginRight: 5 }} /> Sí, sugiéreme lugares cercanos
          </Chip>
        </Section>

        <Btn variant="primary" full icon={Check} onClick={onApply}>Aplicar y ver resultados</Btn>
      </div>
    </div>
  );
}

function ResultsScreen({ trip, filters, preferences, allRoutes, incidents, activeIncidents, favorites, onToggleFavorite, onSelect, onDetail, onOpenPitch, onOpenChat, onQuickPriority, productiveTime, productivePlaces, onAdjustCriteria }) {
  const withIncidents = useMemo(
    () =>
      allRoutes.map((r) => {
        const inc = incidents.find((i) => i.routeId === r.id && activeIncidents.includes(i.id));
        if (!inc) return r;
        return { ...r, durationMin: r.durationMin + inc.extraMinutes, durationMax: r.durationMax + inc.extraMinutes, _incident: inc };
      }),
    [allRoutes, incidents, activeIncidents]
  );

  const strictUnranked = applyFilters(withIncidents, filters);
  const strict = rankRoutes(strictUnranked, preferences);
  const fastest = [...withIncidents].sort((a, b) => a.durationMin - b.durationMin)[0];

  const nearMiss = withIncidents
    .filter((r) => !strict.find((s) => s.id === r.id))
    .map((r) => ({ route: r, reason: exceededReasonSingle(r, filters) }))
    .filter((x) => x.reason);

  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar
        title="Resultados"
        right={
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onOpenChat} style={{ background: T.card2, border: `1px solid ${T.line}`, borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <MessageSquare size={15} color={T.seguridad} />
            </button>
            <button onClick={onOpenPitch} style={{ background: T.card2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Award size={14} color={T.costo} />
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.ink, fontWeight: 600 }}>Resumen ejecutivo</span>
            </button>
          </div>
        }
      />
      <div style={{ padding: "6px 20px" }}>
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, margin: "0 0 14px" }}>
          <MapPin size={12} style={{ verticalAlign: -1 }} /> {trip.origin || "San Juan de Lurigancho"} → {trip.destination || "San Isidro"}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <Chip active={preferences.includes("tiempo")} onClick={() => onQuickPriority("tiempo")}><Clock size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Más rápido</Chip>
          <Chip active={preferences.includes("costo")} onClick={() => onQuickPriority("costo")}><Wallet size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Más barato</Chip>
          <Chip active={filters.needsAccessible} onClick={() => onQuickPriority("accesibilidad")}><Accessibility size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Accesible</Chip>
        </div>

        <Section title={`Rutas que cumplen (${strict.length})`} icon={ShieldCheck}>
          {strict.length === 0 && <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft }}>Ninguna ruta cumple exactamente tus condiciones — revisa las alternativas cercanas debajo.</p>}
          {strict.map((r) => (
            <RouteCard
              key={r.id}
              route={r}
              reference={fastest}
              onSelect={onSelect}
              onDetail={onDetail}
              isFavorite={favorites.includes(r.id)}
              onToggleFavorite={() => onToggleFavorite(r.id)}
            />
          ))}
        </Section>

        {nearMiss.length > 0 && (
          <Section title={`Casi cumplen (${nearMiss.length})`} icon={AlertTriangle}>
            {nearMiss.map(({ route, reason }) => (
              <RouteCard
                key={route.id}
                route={route}
                reference={fastest}
                isNearMiss
                nearMissReason={reason}
                onSelect={onSelect}
                onDetail={onDetail}
                isFavorite={favorites.includes(route.id)}
                onToggleFavorite={() => onToggleFavorite(route.id)}
              />
            ))}
          </Section>
        )}

        {productiveTime && (
          <Section title="Aprovecha tu espera" icon={BookOpen}>
            <Disclaimer>Lugares reportados por la comunidad cerca de tus paraderos.</Disclaimer>
            {productivePlaces.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 12, background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(168,85,247,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BookOpen size={15} color={T.comodidad} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 13, color: T.ink }}>{p.name}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft, whiteSpace: "nowrap", marginLeft: 8 }}>{p.distanceMeters} m</span>
                  </div>
                  <span style={{ fontFamily: F.body, fontSize: 11.5, color: T.inkSoft }}>{p.type} · {p.note}</span>
                </div>
              </div>
            ))}
          </Section>
        )}

        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, margin: "0 0 10px" }}>¿Ninguna opción te convence?</p>
          <Btn variant="secondary" icon={RotateCcw} onClick={onAdjustCriteria}>Ajustar mis criterios</Btn>
        </div>
      </div>
    </div>
  );
}

function DetailScreen({ route, filters, allRoutes, incidents, activeIncidents, onToggleIncident, onBack, onFeedback, onStartTrip }) {
  const checklist = conditionsChecklist(route, filters);
  const notes = sensitivityNotes(route, filters, allRoutes);
  const inc = incidents.find((i) => i.routeId === route.id);
  const incidentOn = inc && activeIncidents.includes(inc.id);

  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Detalle de ruta" onBack={onBack} />
      <div style={{ padding: "6px 20px" }}>
        <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: T.ink, margin: "4px 0 8px" }}>{route.name}</h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <SourceBadge route={route} />
          <ConfidenceBadge route={route} />
          {route.accessible && <Badge tone="low" icon={Accessibility}>Accesible</Badge>}
          {route.sourceType === "comunitario" && (
            <Badge tone={route.community.regulatoryStatus === "authorized_verified" ? "low" : route.community.regulatoryStatus === "explicitly_unauthorized" ? "high" : "medium"}>
              {({
                authorized_verified: "Autorizada y verificada",
                operator_verified: "Verificada por operador",
                not_verified: "No verificada",
                explicitly_unauthorized: "No autorizada",
              })[route.community.regulatoryStatus]}
            </Badge>
          )}
        </div>

        <RouteMap route={route} />
        <Disclaimer>Vista simplificada de tramos — el mapa interactivo en tiempo real llega en la siguiente versión.</Disclaimer>

        <Section title="Tramo por tramo" icon={MapIcon}>
          {route.routeSteps.map((s, i) => {
            const Icon = MODE_ICON[s.mode];
            return (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${MODE_COLOR[s.mode]}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color={MODE_COLOR[s.mode]} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: F.body, fontSize: 13.5, color: T.ink, margin: 0 }}>{s.description}</p>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft }}>{s.durationMin} min{s.cost > 0 ? ` · ${fmtSoles(s.cost)}` : ""}</span>
                </div>
              </div>
            );
          })}
        </Section>

        <Section title="¿Por qué esta opción?" icon={HelpCircle}>
          <p style={{ fontFamily: F.body, fontSize: 13.5, color: T.ink, lineHeight: 1.6, margin: 0 }}>{generateExplanation(route, allRoutes)}</p>
        </Section>

        <Section title="Condiciones que declaraste" icon={Check}>
          {checklist.length === 0 && <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft }}>No declaraste restricciones específicas para este viaje.</p>}
          {checklist.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              {c.ok ? <Check size={14} color={T.seguridad} /> : <X size={14} color={T.alerta} />}
              <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink }}>{c.label}</span>
            </div>
          ))}
        </Section>

        <Section title="¿Cómo se evaluó? (sensibilidad)" icon={TrendingUp}>
          {notes.map((n, i) => (
            <p key={i} style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.6, margin: "0 0 8px" }}>{n}</p>
          ))}
          <p style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft, fontStyle: "italic", marginTop: 6 }}>El nivel de confianza se calcula combinando verificación oficial y reportes de la comunidad.</p>
        </Section>

        <Section title="Plan B" icon={RotateCcw}>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{planBFor(route)}</p>
        </Section>

        <Section title="Condiciones recientes reportadas" icon={AlertTriangle}>
          {route.recentConditions.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < route.recentConditions.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.ink, flex: 1 }}>{c.note}</span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft, whiteSpace: "nowrap", marginLeft: 10 }}>{fmtDaysAgo(c.date)}</span>
            </div>
          ))}
        </Section>

        {inc && (
          <Section title="Alerta activa en la ruta" icon={Zap}>
            <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, marginBottom: 10 }}>
              {inc.description} — según reportes recientes, esto añade unos {inc.extraMinutes} min al tiempo estimado.
            </p>
            <Btn variant="warning" small onClick={() => onToggleIncident(inc.id)}>
              {incidentOn ? "Quitar esta alerta de mi ruta" : "Aplicar esta alerta a mi ruta"}
            </Btn>
          </Section>
        )}

        <Section title="Confirmación rápida" icon={ShieldCheck}>
          <QuickConfirm route={route} />
        </Section>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn variant="primary" full icon={PlayCircle} onClick={() => onStartTrip(route)}>Iniciar viaje — guía en tiempo real</Btn>
          <Btn variant="secondary" full icon={Send} onClick={() => onFeedback(route)}>Registrar cómo fue mi viaje</Btn>
        </div>
      </div>
    </div>
  );
}

function GuidingScreen({ route, allRoutes, incidents, activeIncidents, onFinish, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showAlt, setShowAlt] = useState(false);
  const steps = route.routeSteps;
  const isLast = stepIndex === steps.length - 1;
  const inc = incidents.find((i) => i.routeId === route.id && activeIncidents.includes(i.id));

  const alternative = useMemo(() => {
    const ranked = rankRoutes(allRoutes.filter((r) => r.id !== route.id), []);
    return ranked[0];
  }, [allRoutes, route.id]);

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title="Guía en tiempo real" onBack={onBack} />
      <div style={{ padding: "6px 20px" }}>
        <Disclaimer>Marca cada tramo conforme avances en tu viaje — la ubicación automática por GPS llega en la siguiente versión.</Disclaimer>

        <div style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{route.name}</span>
            <Navigation size={18} color={T.tiempo} />
          </div>
          <p style={{ fontFamily: F.mono, fontSize: 12, color: T.inkSoft, margin: 0 }}>
            Llegada estimada: {fmtMin(route.durationMin, route.durationMax)} desde el inicio
          </p>
        </div>

        <Section title={`Tramo ${stepIndex + 1} de ${steps.length}`} icon={ListChecks}>
          {steps.map((s, i) => {
            const Icon = MODE_ICON[s.mode];
            const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
            return (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, opacity: state === "pending" ? 0.45 : 1 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: state === "active" ? `${MODE_COLOR[s.mode]}33` : `${MODE_COLOR[s.mode]}15`,
                  border: state === "active" ? `1px solid ${MODE_COLOR[s.mode]}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {state === "done" ? <Check size={14} color={T.seguridad} /> : <Icon size={14} color={MODE_COLOR[s.mode]} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: F.body, fontSize: 13.5, color: state === "active" ? T.ink : T.inkSoft, fontWeight: state === "active" ? 600 : 400, margin: 0 }}>{s.description}</p>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft }}>{s.durationMin} min{s.cost > 0 ? ` · ${fmtSoles(s.cost)}` : ""}</span>
                </div>
              </div>
            );
          })}
        </Section>

        {(inc || showAlt) && alternative && (
          <Section title="Congestión detectada" icon={ShieldAlert}>
            <div style={{ display: "flex", gap: 8, background: "rgba(240,82,82,0.08)", border: `1px solid rgba(240,82,82,0.3)`, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
              <AlertTriangle size={14} color={T.alerta} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>
                {inc ? inc.description : "Reportaste congestión en este tramo."} Alternativa sugerida: <b>{alternative.name}</b> ({fmtMin(alternative.durationMin, alternative.durationMax)}).
              </span>
            </div>
          </Section>
        )}

        {!inc && !showAlt && (
          <Btn variant="secondary" full small onClick={() => setShowAlt(true)}>Reportar congestión en este tramo</Btn>
        )}

        <div style={{ marginTop: 18 }}>
          {!isLast ? (
            <Btn variant="primary" full icon={ArrowRight} onClick={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}>
              Llegué a este tramo, siguiente
            </Btn>
          ) : (
            <Btn variant="primary" full icon={Flag} onClick={() => onFinish(route)}>Finalizar viaje</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedbackScreen({ route, onBack, onSubmit }) {
  const [form, setForm] = useState({ arrivalTime: "", waitMin: "", cost: "", barriers: [] });
  const [sent, setSent] = useState(false);
  const barrierOptions = [
    { value: "no_ramp", label: "Sin rampa de acceso" },
    { value: "overcrowded", label: "Unidad muy llena" },
    { value: "no_signage", label: "Falta señalización" },
    { value: "unsafe", label: "Me sentí inseguro/a" },
  ];
  if (sent) {
    return (
      <div style={{ padding: 28, textAlign: "center", paddingTop: 90 }}>
        <ShieldCheck size={40} color={T.seguridad} style={{ marginBottom: 14 }} />
        <h2 style={{ fontFamily: F.display, color: T.ink, fontSize: 19 }}>¡Gracias por tu retroalimentación!</h2>
        <p style={{ fontFamily: F.body, color: T.inkSoft, fontSize: 13.5, marginBottom: 20 }}>Tu reporte entra a validación comunitaria — cuando otros lo confirmen, se incorpora y recalibra la confianza de esta ruta.</p>
        <Btn variant="primary" onClick={onBack}>Volver</Btn>
      </div>
    );
  }
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Retroalimentación" onBack={onBack} />
      <div style={{ padding: "10px 20px" }}>
        <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft, marginBottom: 16 }}>Cuéntanos cómo fue tu viaje real en "{route.name}".</p>
        <Field label="Hora real de llegada"><input type="time" style={inputStyle} value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} /></Field>
        <Field label="Minutos de espera"><input type="number" style={inputStyle} value={form.waitMin} onChange={(e) => setForm({ ...form, waitMin: e.target.value })} placeholder="Ej. 12" /></Field>
        <Field label="Costo real (S/)"><input type="number" style={inputStyle} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Ej. 4.50" /></Field>
        <Field label="Barreras encontradas">
          <ChipRow options={barrierOptions} value={form.barriers} onChange={(v) => setForm({ ...form, barriers: v })} />
        </Field>
        <Btn variant="primary" full icon={Send} onClick={() => { setSent(true); onSubmit && onSubmit(form); }}>Enviar</Btn>
      </div>
    </div>
  );
}

const COMMUNITY_STATUS_LABEL = {
  received: { label: "Recibida", tone: "neutral" },
  pending: { label: "Pendiente de confirmación", tone: "medium" },
  observed: { label: "Observada", tone: "violet" },
  incorporated: { label: "Incorporada como alternativa", tone: "low" },
  outdated: { label: "Desactualizada", tone: "high" },
};

function CommunityScreen({ communityRoutes, contributions, onAddContribution, reputationPoints, peerReports, onConfirmReport, leaderboard }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", description: "", type: [], hasPhoto: false });
  const rep = reputationFor(reputationPoints);

  const ranked = useMemo(
    () => [...leaderboard, { name: "Tú", zone: "SJL → San Isidro", points: reputationPoints, self: true }].sort((a, b) => b.points - a.points),
    [leaderboard, reputationPoints]
  );

  const typeOptions = [
    { value: "new", label: "Conexión nueva" },
    { value: "change", label: "Cambio de condición" },
    { value: "confirm", label: "Confirmar información existente" },
  ];

  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Comunidad" />
      <div style={{ padding: "6px 20px" }}>
        <div style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft }}>TU NIVEL</span>
            <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, color: rep.color, margin: "2px 0 0" }}>{rep.level}</h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: T.ink }}>{reputationPoints}</span>
            <p style={{ fontFamily: F.body, fontSize: 11, color: T.inkSoft, margin: 0 }}>{rep.next ? `${rep.next - reputationPoints} pts para el siguiente nivel` : "Nivel máximo"}</p>
          </div>
        </div>

        <Disclaimer>Tus puntos se acreditan cuando el aporte se confirma, no al enviarlo — así no se premia volumen sobre calidad.</Disclaimer>

        <Section title="Clasificación de la zona" icon={Trophy}>
          {ranked.map((p, i) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, background: p.self ? "rgba(79,142,247,0.1)" : T.paperDim, border: `1px solid ${p.self ? T.tiempo : T.line}`, borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
              <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 13, color: i === 0 ? T.costo : T.inkSoft, width: 18 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 13, color: T.ink }}>{p.name}</span>
                <p style={{ fontFamily: F.mono, fontSize: 10.5, color: T.inkSoft, margin: 0 }}>{p.zone}</p>
              </div>
              <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 13, color: T.ink }}>{p.points} pts</span>
            </div>
          ))}
        </Section>

        <Btn variant="primary" full icon={Plus} onClick={() => setShowForm((s) => !s)}>{showForm ? "Cerrar formulario" : "Reportar un aporte"}</Btn>

        {showForm && (
          <div style={{ marginTop: 16, background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16 }}>
            <Field label="Origen"><input style={inputStyle} value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></Field>
            <Field label="Destino"><input style={inputStyle} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></Field>
            <Field label="Tipo de aporte">
              <ChipRow multi={false} options={typeOptions} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
            </Field>
            <Field label="Descripción"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Evidencia">
              <Chip active={form.hasPhoto} onClick={() => setForm({ ...form, hasPhoto: !form.hasPhoto })}>
                <Camera size={13} style={{ verticalAlign: "middle", marginRight: 5 }} /> {form.hasPhoto ? "Foto del paradero adjunta" : "Adjuntar foto del paradero o unidad"}
              </Chip>
            </Field>
            <Btn
              variant="primary"
              full
              icon={Send}
              onClick={() => {
                onAddContribution(form);
                setForm({ origin: "", destination: "", description: "", type: [], hasPhoto: false });
                setShowForm(false);
              }}
            >
              Enviar aporte
            </Btn>
          </div>
        )}

        {contributions.length > 0 && (
          <Section title="Estado de tus aportes" icon={ThumbsUp}>
            {contributions.map((c, i) => {
              const st = COMMUNITY_STATUS_LABEL[c.status];
              return (
                <div key={i} style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink, fontWeight: 600 }}>{c.origin} → {c.destination}</span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        {peerReports.length > 0 && (
          <Section title="Validación comunitaria" icon={ShieldCheck}>
            <Disclaimer>Otros usuarios que hicieron la misma ruta pueden confirmar o ajustar lo reportado. Al validar 3 reportes, la ruta pasa a "Incorporada" y tú ganas puntos de reputación.</Disclaimer>
            {peerReports.map((r) => {
              const st = COMMUNITY_STATUS_LABEL[r.status];
              return (
                <div key={r.id} style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontFamily: F.body, fontSize: 13, color: T.ink, fontWeight: 600 }}>{r.routeName}</span>
                      <p style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft, margin: "2px 0 0" }}>{r.own ? "Tu reporte" : r.user} · {fmtDaysAgo(r.reportedAt)}</p>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: T.inkSoft, margin: "0 0 8px" }}>
                    Tiempo real {r.realTime} min · Costo real {fmtSoles(r.realCost)}{r.note ? ` · ${r.note}` : ""}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft }}>{r.confirmations} confirmación(es)</span>
                    {!r.own && r.status !== "incorporated" && (
                      <Btn variant="secondary" small icon={ThumbsUp} onClick={() => onConfirmReport(r.id)}>Confirmar</Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        <Section title="Conexiones reportadas por la comunidad" icon={Users}>
          {communityRoutes.map((c) => (
            <div key={c.id} style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <h4 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 14.5, color: T.ink, margin: "0 0 8px" }}>{c.title}</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                <Badge tone="violet" icon={Users}>Comunitario</Badge>
                <Badge tone={communityConfidence(c) === "Alta" ? "low" : communityConfidence(c) === "Media" ? "medium" : "high"} icon={ShieldCheck}>Confianza {communityConfidence(c)}</Badge>
              </div>
              <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, margin: 0 }}>
                {fmtSoles(c.fareMin)}–{fmtSoles(c.fareMax)} · espera {c.waitMin}–{c.waitMax} min · {c.sources} reportes · {fmtDaysAgo(c.lastVerified)}
              </p>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function MyWeekScreen({ recurring, favorites, allRoutes }) {
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Mi semana" />
      <div style={{ padding: "6px 20px" }}>
        <Section title="Viajes recurrentes" icon={Calendar}>
          {recurring.map((r, i) => (
            <div key={i} style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 13.5, color: T.ink }}>{r.days}</span>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkSoft }}>{r.time}</span>
              </div>
              <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, margin: "0 0 10px" }}>{r.origin} → {r.destination}</p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                <Check size={13} color={T.seguridad} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.ink }}><b style={{ color: T.seguridad }}>Habitual:</b> {r.usual}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <RotateCcw size={13} color={T.inkSoft} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft }}><b style={{ color: T.ink }}>Alternativa lista:</b> {r.alt}</span>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Rutas favoritas" icon={Star}>
          {favorites.length === 0 && <p style={{ fontFamily: F.body, fontSize: 13, color: T.inkSoft }}>Aún no marcaste rutas como favoritas.</p>}
          {favorites.map((id) => {
            const r = allRoutes.find((x) => x.id === id);
            if (!r) return null;
            const stale = daysSince(r.lastVerified) > 14;
            return (
              <div key={id} style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 13.5, color: T.ink }}>{r.name}</span>
                  {stale && <Badge tone="high" icon={AlertTriangle}>Sin confirmar hace {daysSince(r.lastVerified)} días</Badge>}
                </div>
              </div>
            );
          })}
        </Section>
      </div>
    </div>
  );
}

function DemoPitchView({ routes, onClose }) {
  const ranked = rankRoutes(routes, []);
  const fastest = ranked[0];
  return (
    <div style={{ position: "fixed", inset: 0, background: T.paper, zIndex: 50, overflowY: "auto" }}>
      <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.tiempo }}>RESUMEN EJECUTIVO</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 22, color: T.ink, margin: "2px 0 0" }}>San Juan de Lurigancho → San Isidro</h2>
          </div>
          <button onClick={onClose} style={{ background: T.card2, border: `1px solid ${T.line}`, borderRadius: 10, width: 34, height: 34, cursor: "pointer" }}>
            <X size={16} color={T.ink} style={{ margin: "0 auto" }} />
          </button>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 14, color: T.inkSoft, lineHeight: 1.6, marginBottom: 22 }}>
          Solo el <b style={{ color: T.ink }}>18%</b> de los empleos de Lima Metropolitana son alcanzables en 45 min por transporte público o no motorizado. URBIX no agrega una ruta más: convierte información dispersa en una decisión comprensible.
        </p>
        {ranked.map((r) => (
          <div key={r.id} style={{ background: T.paperDim, border: `1px solid ${T.line}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
            <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 16, color: T.ink, margin: "0 0 8px" }}>{r.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 }}>
              <Metric icon={Clock} value={fmtMin(r.durationMin, r.durationMax)} color={T.tiempo} />
              <Metric icon={Wallet} value={fmtSoles(r.cost)} color={T.costo} />
              <Metric icon={Footprints} value={`${r.walkingMeters} m`} color={T.seguridad} />
              <Metric icon={ArrowLeftRight} value={`${r.transfers}`} color={T.comodidad} />
            </div>
            <p style={{ fontFamily: F.body, fontSize: 13, color: T.ink, fontStyle: "italic", margin: 0 }}>{tradeoffSentence(r, fastest)}</p>
          </div>
        ))}
        <div style={{ background: "rgba(79,142,247,0.08)", border: `1px solid rgba(79,142,247,0.3)`, borderRadius: 14, padding: 16, marginTop: 8 }}>
          <p style={{ fontFamily: F.body, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>
            Esto que ven es el motor. Al ciudadano le llega por WhatsApp — sin instalación, sin registro, bajo consumo de datos. Esta interfaz es la capa institucional para el piloto con ATU, universidades y municipalidades.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ from, children }) {
  const isBot = from === "bot";
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 10 }}>
      <div
        style={{
          maxWidth: "82%", borderRadius: 14,
          borderBottomLeftRadius: isBot ? 4 : 14, borderBottomRightRadius: isBot ? 14 : 4,
          padding: "10px 13px", background: isBot ? T.card2 : T.tiempo,
          color: isBot ? T.ink : "#0B0F1A",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function RouteChatCard({ route, reference, index }) {
  return (
    <div>
      <p style={{ fontFamily: F.body, fontWeight: 700, fontSize: 13, margin: "0 0 6px" }}>{index}. {route.name}</p>
      <p style={{ fontFamily: F.mono, fontSize: 11.5, margin: "0 0 6px", opacity: 0.85 }}>
        ⏱ {fmtMin(route.durationMin, route.durationMax)} · 💰 {fmtSoles(route.cost)} · 🚶 {route.walkingMeters} m · 🔁 {route.transfers}
      </p>
      <p style={{ fontFamily: F.body, fontSize: 12.5, fontStyle: "italic", margin: 0, opacity: 0.9 }}>{tradeoffSentence(route, reference)}</p>
    </div>
  );
}

function ChatDemoView({ routes, onClose }) {
  const ranked = useMemo(() => rankRoutes(routes, []), [routes]);
  const fastest = ranked[0];
  const script = useMemo(
    () => [
      { from: "bot", type: "text", content: "Hola 👋 Soy URBIX. ¿A dónde quieres ir y a qué hora?" },
      { from: "user", type: "text", content: "De San Juan de Lurigancho a San Isidro, salgo mañana 7:00 am" },
      { from: "bot", type: "text", content: `Encontré ${ranked.length} rutas que cumplen tu presupuesto y caminata. Te muestro la mejor:` },
      { from: "bot", type: "card", route: ranked[0], index: 1 },
      { from: "bot", type: "text", content: "¿Quieres ver otra opción o prefieres esta?" },
      { from: "user", type: "text", content: "Muéstrame otra" },
      { from: "bot", type: "card", route: ranked[1], index: 2 },
      { from: "user", type: "text", content: "Voy con la primera" },
      { from: "bot", type: "text", content: "Perfecto ✅ Te aviso cuando sea hora de salir y te guío tramo a tramo. Al llegar te preguntaré cómo te fue, para ayudar a otros vecinos con el mismo dato." },
    ],
    [ranked]
  );

  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (shown >= script.length) return;
    const next = script[shown];
    setTyping(next.from === "bot");
    const t = setTimeout(() => {
      setTyping(false);
      setShown((s) => s + 1);
    }, next.from === "bot" ? 900 : 500);
    return () => clearTimeout(t);
  }, [shown, script]);

  return (
    <div style={{ position: "fixed", inset: 0, background: T.paper, zIndex: 50, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${T.line}`, background: T.paperDim }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.tiempo}, ${T.comodidad})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={17} color="#0B0F1A" />
          </div>
          <div>
            <p style={{ fontFamily: F.display, fontWeight: 700, fontSize: 15, color: T.ink, margin: 0 }}>URBIX</p>
            <p style={{ fontFamily: F.mono, fontSize: 10.5, color: T.seguridad, margin: 0 }}>en línea · WhatsApp</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: T.card2, border: `1px solid ${T.line}`, borderRadius: 10, width: 34, height: 34, cursor: "pointer" }}>
          <X size={16} color={T.ink} style={{ margin: "0 auto" }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <Disclaimer>Así conversa el ciudadano con URBIX — sin instalar nada, directo por WhatsApp.</Disclaimer>
        {script.slice(0, shown).map((m, i) => (
          <ChatBubble key={i} from={m.from}>
            {m.type === "text" ? (
              <span style={{ fontFamily: F.body, fontSize: 13.5, lineHeight: 1.5 }}>{m.content}</span>
            ) : (
              <RouteChatCard route={m.route} reference={fastest} index={m.index} />
            )}
          </ChatBubble>
        ))}
        {typing && (
          <ChatBubble from="bot">
            <span style={{ fontFamily: F.mono, fontSize: 12, opacity: 0.7 }}>escribiendo…</span>
          </ChatBubble>
        )}
        {shown >= script.length && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 4, opacity: 0.6 }}>
            <CheckCheck size={14} color={T.tiempo} />
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.inkSoft }}>Entregado por WhatsApp Business API</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   9. APP RAÍZ
   ============================================================ */
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [prevScreen, setPrevScreen] = useState("planning");
  const [trip, setTrip] = useState({
    origin: "San Juan de Lurigancho",
    destination: "San Isidro",
    date: "2026-08-12",
    timeMode: "arrive",
    time: "09:00",
  });
  const [filters, setFilters] = useState({ maxBudget: 6, maxWalk: 500, maxTransfers: 2, needsAccessible: false });
  const [preferences, setPreferences] = useState([]);
  const [productiveTime, setProductiveTime] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [showPitch, setShowPitch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [contributions, setContributions] = useState([
    { origin: "SJL", destination: "San Isidro", status: "pending" },
  ]);
  const [reputationPoints, setReputationPoints] = useState(35);
  const [peerReports, setPeerReports] = useState([
    { id: "pr1", routeId: "r1", routeName: "Corredor Azul + Metropolitano", user: "Usuario anónimo #482", reportedAt: "2026-08-09", realTime: 68, realCost: 4.5, note: "Todo normal", confirmations: 1, status: "pending", own: false },
    { id: "pr2", routeId: "r2", routeName: "Bus regular directo (Vía de Evitamiento)", user: "Usuario anónimo #117", reportedAt: "2026-08-08", realTime: 95, realCost: 3.5, note: "Congestión fuerte", confirmations: 2, status: "observed", own: false },
  ]);

  const officialRoutes = useMemo(() => getMockRoutes(), []);
  const communityRoutes = useMemo(() => getMockCommunityRoutes(), []);
  const incidents = useMemo(() => getMockIncidents(), []);
  const productivePlaces = useMemo(() => getMockProductivePlaces(), []);
  const leaderboard = useMemo(() => getMockLeaderboard(), []);
  const allRoutes = useMemo(() => [...officialRoutes, ...communityRoutes.map(communityToRoute)], [officialRoutes, communityRoutes]);

  const recurring = [
    { days: "Lun–Vie", time: "07:30", origin: "San Juan de Lurigancho", destination: "San Isidro", usual: "Corredor Azul + Metropolitano", alt: "Bus directo (Vía de Evitamiento)" },
  ];

  const go = (s) => { setPrevScreen(screen); setScreen(s); };

  const toggleFavorite = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const toggleIncident = (id) => setActiveIncidents((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const onQuickPriority = (key) => {
    if (key === "accesibilidad") { setFilters((f) => ({ ...f, needsAccessible: !f.needsAccessible })); return; }
    setPreferences((p) => (p.includes(key) ? p.filter((x) => x !== key) : [key]));
  };

  const addContribution = (form) => {
    setContributions((c) => [...c, { origin: form.origin || "—", destination: form.destination || "—", status: "received" }]);
    setReputationPoints((p) => p + 5);
  };

  const submitFeedback = (route, form) => {
    setPeerReports((prev) => [
      {
        id: `own-${prev.length + 1}`,
        routeId: route.id,
        routeName: route.name,
        user: "Tú",
        reportedAt: trip.date,
        realTime: Number(form.waitMin) || route.durationMin,
        realCost: Number(form.cost) || route.cost,
        note: form.barriers && form.barriers.length > 0 ? "Barreras reportadas: " + form.barriers.join(", ") : "",
        confirmations: 0,
        status: "pending",
        own: true,
      },
      ...prev,
    ]);
    setReputationPoints((p) => p + 5);
  };

  const confirmReport = (id) => {
    setPeerReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const confirmations = r.confirmations + 1;
        const status = confirmations >= 3 ? "incorporated" : confirmations >= 1 ? "observed" : "pending";
        return { ...r, confirmations, status };
      })
    );
    setReputationPoints((p) => p + 3);
  };

  const hideNav = screen === "welcome";

  return (
    <div style={{ fontFamily: F.body }}>
      <style>{FONT_IMPORT}</style>
      <div
        style={{
          maxWidth: 480, margin: "0 auto", minHeight: "100svh",
          background: T.paper, color: T.ink, position: "relative",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>
          {screen === "welcome" && <WelcomeScreen onStart={() => go("planning")} onOpenChat={() => setShowChat(true)} />}

          {screen === "planning" && (
            <PlanningScreen
              trip={trip}
              setTrip={setTrip}
              onPersonalize={() => go("personalize")}
              onSearch={() => go("results")}
            />
          )}

          {screen === "personalize" && (
            <PersonalizeScreen
              filters={filters}
              setFilters={setFilters}
              preferences={preferences}
              setPreferences={setPreferences}
              productiveTime={productiveTime}
              setProductiveTime={setProductiveTime}
              onBack={() => go(prevScreen === "results" ? "results" : "planning")}
              onApply={() => go("results")}
            />
          )}

          {screen === "results" && (
            <ResultsScreen
              trip={trip}
              filters={filters}
              preferences={preferences}
              allRoutes={allRoutes}
              incidents={incidents}
              activeIncidents={activeIncidents}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelect={(r) => { setSelectedRoute(r); go("detail"); }}
              onDetail={(r) => { setSelectedRoute(r); go("detail"); }}
              onOpenPitch={() => setShowPitch(true)}
              onOpenChat={() => setShowChat(true)}
              onQuickPriority={onQuickPriority}
              productiveTime={productiveTime}
              productivePlaces={productivePlaces}
              onAdjustCriteria={() => go("personalize")}
            />
          )}

          {screen === "detail" && selectedRoute && (
            <DetailScreen
              route={selectedRoute}
              filters={filters}
              allRoutes={allRoutes}
              incidents={incidents}
              activeIncidents={activeIncidents}
              onToggleIncident={toggleIncident}
              onBack={() => go("results")}
              onFeedback={(r) => { setSelectedRoute(r); go("feedback"); }}
              onStartTrip={(r) => { setSelectedRoute(r); go("guiding"); }}
            />
          )}

          {screen === "guiding" && selectedRoute && (
            <GuidingScreen
              route={selectedRoute}
              allRoutes={allRoutes}
              incidents={incidents}
              activeIncidents={activeIncidents}
              onBack={() => go("detail")}
              onFinish={(r) => { setSelectedRoute(r); go("feedback"); }}
            />
          )}

          {screen === "feedback" && selectedRoute && (
            <FeedbackScreen
              route={selectedRoute}
              onBack={() => go("results")}
              onSubmit={(form) => submitFeedback(selectedRoute, form)}
            />
          )}

          {screen === "community" && (
            <CommunityScreen
              communityRoutes={communityRoutes}
              contributions={contributions}
              onAddContribution={addContribution}
              reputationPoints={reputationPoints}
              peerReports={peerReports}
              onConfirmReport={confirmReport}
              leaderboard={leaderboard}
            />
          )}

          {screen === "myweek" && <MyWeekScreen recurring={recurring} favorites={favorites} allRoutes={allRoutes} />}
        </div>

        {!hideNav && <BottomNav screen={screen} go={go} />}

        {showPitch && <DemoPitchView routes={officialRoutes} onClose={() => setShowPitch(false)} />}
        {showChat && <ChatDemoView routes={allRoutes} onClose={() => setShowChat(false)} />}
      </div>
    </div>
  );
}
