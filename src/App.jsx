import { useState, useRef, useEffect, useCallback } from "react";

/* ─── TIER METADATA ─────────────────────────────────────────────────────── */
const TIER_META = {
  "S+": { color: "#ffd700", bg: "#ffd70022" },
  "S":  { color: "#ffaa00", bg: "#ffaa0022" },
  "A+": { color: "#88ff44", bg: "#88ff4422" },
  "A":  { color: "#4dff91", bg: "#4dff9122" },
  "B+": { color: "#66bbff", bg: "#66bbff22" },
  "B":  { color: "#4d9fff", bg: "#4d9fff22" },
  "C":  { color: "#aaaaaa", bg: "#aaaaaa22" },
  "D":  { color: "#888888", bg: "#88888822" },
  "F":  { color: "#ff4d4d", bg: "#ff4d4d22" },
  "F-": { color: "#cc2222", bg: "#cc222222" },
};

/* ─── EXERCISE DATABASE (Jeff Nippard Tier Lists) ───────────────────────── */
const EXERCISE_DB = {
  // ── PECTORAUX ────────────────────────────────────────────────────────────
  "Presse pectoraux machine":        { tier: "S+", primary: ["Pectoraux"], secondary: ["Triceps"] },
  "Écarté câble assis":              { tier: "S",  primary: ["Pectoraux"], secondary: [] },
  "Développé couché barre":          { tier: "A",  primary: ["Pectoraux"], secondary: ["Épaules", "Triceps"] },
  "Développé incliné barre":         { tier: "A",  primary: ["Pectoraux"], secondary: ["Épaules", "Triceps"] },
  "Développé couché haltères":       { tier: "A",  primary: ["Pectoraux"], secondary: ["Épaules", "Triceps"] },
  "Développé incliné haltères":      { tier: "A",  primary: ["Pectoraux"], secondary: ["Épaules", "Triceps"] },
  "Dips lestés":                     { tier: "A",  primary: ["Pectoraux", "Triceps"], secondary: ["Épaules"] },
  "Pompes déficit":                  { tier: "A",  primary: ["Pectoraux"], secondary: ["Triceps", "Épaules"] },
  "Développé couché Smith":          { tier: "A",  primary: ["Pectoraux"], secondary: ["Épaules", "Triceps"] },
  "Développé incliné Smith":         { tier: "A",  primary: ["Pectoraux"], secondary: ["Épaules", "Triceps"] },
  "Croisé poulies":                  { tier: "A",  primary: ["Pectoraux"], secondary: [] },
  "Peck deck":                       { tier: "A",  primary: ["Pectoraux"], secondary: [] },
  "Écarté haltères":                 { tier: "A",  primary: ["Pectoraux"], secondary: [] },
  "Développé décliné barre":         { tier: "B",  primary: ["Pectoraux"], secondary: ["Triceps"] },
  "Développé décliné haltères":      { tier: "B",  primary: ["Pectoraux"], secondary: ["Triceps"] },
  "Pompes élastiques":               { tier: "B",  primary: ["Pectoraux"], secondary: ["Triceps"] },
  "Pompes":                          { tier: "C",  primary: ["Pectoraux"], secondary: ["Triceps", "Épaules"] },
  "Développé sol":                   { tier: "C",  primary: ["Pectoraux"], secondary: ["Triceps"] },
  "Pull-over haltère":               { tier: "D",  primary: ["Dos", "Pectoraux"], secondary: [] },

  // ── DOS ──────────────────────────────────────────────────────────────────
  "Tirage vertical prise large":     { tier: "S",  primary: ["Dos"], secondary: ["Biceps"] },
  "Tirage vertical prise neutre":    { tier: "S",  primary: ["Dos"], secondary: ["Biceps"] },
  "Tirage vertical 1 bras":          { tier: "S",  primary: ["Dos"], secondary: ["Biceps"] },
  "Meadows row":                     { tier: "S",  primary: ["Dos"], secondary: ["Biceps"] },
  "Rowing buste appuyé":             { tier: "S",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Rowing câble":                    { tier: "S",  primary: ["Dos"], secondary: ["Biceps"] },
  "Rowing câble prise large":        { tier: "S",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Tractions prise large":           { tier: "A",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Tractions prise neutre":          { tier: "A",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Tirage vertical croisé 1 bras":   { tier: "A",  primary: ["Dos"], secondary: ["Biceps"] },
  "Pendlay row déficit":             { tier: "A",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Rowing haltère 1 bras":           { tier: "A",  primary: ["Dos"], secondary: ["Biceps"] },
  "Kroc row":                        { tier: "A",  primary: ["Dos"], secondary: ["Biceps", "Avant-bras"] },
  "Tractions lestées":               { tier: "A",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Tractions prise supination":      { tier: "B",  primary: ["Dos", "Biceps"], secondary: ["Trapèzes"] },
  "Rowing barre":                    { tier: "B",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Pendlay row":                     { tier: "B",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "Face pull corde":                 { tier: "B",  primary: ["Épaules", "Trapèzes"], secondary: [] },
  "Soulevé de terre":                { tier: "C",  primary: ["Dos", "Ischio-jambiers", "Fessiers"], secondary: ["Trapèzes"] },
  "Yates row":                       { tier: "C",  primary: ["Dos"], secondary: ["Biceps"] },
  "Rowing inversé":                  { tier: "C",  primary: ["Dos"], secondary: ["Biceps", "Trapèzes"] },
  "T-bar row":                       { tier: "C",  primary: ["Dos"], secondary: ["Biceps"] },
  "Rack pull":                       { tier: "D",  primary: ["Dos"], secondary: ["Trapèzes"] },
  "Renegade row":                    { tier: "F",  primary: ["Dos"], secondary: [] },

  // ── ÉPAULES ──────────────────────────────────────────────────────────────
  "Élévations latérales câble":      { tier: "S",  primary: ["Épaules"], secondary: [] },
  "Cable Y raise":                   { tier: "S",  primary: ["Épaules"], secondary: ["Trapèzes"] },
  "Élévations latérales câble dos":  { tier: "S",  primary: ["Épaules"], secondary: [] },
  "Oiseau machine":                  { tier: "S",  primary: ["Épaules"], secondary: ["Trapèzes"] },
  "Croisé poulies inverse":          { tier: "S",  primary: ["Épaules"], secondary: ["Trapèzes"] },
  "Développé épaules machine":       { tier: "A+", primary: ["Épaules"], secondary: ["Triceps"] },
  "Élévations latérales inclinées":  { tier: "A",  primary: ["Épaules"], secondary: [] },
  "Développé militaire haltères":    { tier: "A",  primary: ["Épaules"], secondary: ["Triceps"] },
  "Élévations latérales allongé":    { tier: "A",  primary: ["Épaules"], secondary: [] },
  "Arnold press":                    { tier: "A",  primary: ["Épaules"], secondary: ["Triceps"] },
  "Développé militaire barre":       { tier: "B+", primary: ["Épaules"], secondary: ["Triceps"] },
  "Élévations latérales haltères":   { tier: "B",  primary: ["Épaules"], secondary: [] },
  "Oiseau haltères":                 { tier: "B",  primary: ["Épaules"], secondary: [] },
  "Élévations latérales machine":    { tier: "B",  primary: ["Épaules"], secondary: [] },
  "Tirage menton":                   { tier: "B",  primary: ["Épaules", "Trapèzes"], secondary: ["Biceps"] },
  "Élévations latérales élastique":  { tier: "C",  primary: ["Épaules"], secondary: [] },
  "Élévations frontales":            { tier: "D",  primary: ["Épaules"], secondary: [] },

  // ── BICEPS ───────────────────────────────────────────────────────────────
  "Bayesian curl face away":         { tier: "S+", primary: ["Biceps"], secondary: [] },
  "Curl pupitre haltère":            { tier: "S",  primary: ["Biceps"], secondary: [] },
  "Curl pupitre machine":            { tier: "S",  primary: ["Biceps"], secondary: [] },
  "Curl marteau pupitre":            { tier: "S",  primary: ["Biceps"], secondary: ["Avant-bras"] },
  "Curl barre EZ":                   { tier: "A",  primary: ["Biceps"], secondary: [] },
  "Curl haltères debout":            { tier: "A",  primary: ["Biceps"], secondary: [] },
  "Curl incliné":                    { tier: "A",  primary: ["Biceps"], secondary: [] },
  "Curl haltères allongé":           { tier: "A",  primary: ["Biceps"], secondary: [] },
  "Curl câble debout":               { tier: "A",  primary: ["Biceps"], secondary: [] },
  "Curl marteau":                    { tier: "A",  primary: ["Biceps"], secondary: ["Avant-bras"] },
  "Curl barre":                      { tier: "B",  primary: ["Biceps"], secondary: [] },
  "Curl Scott":                      { tier: "C",  primary: ["Biceps"], secondary: [] },
  "Drag curl":                       { tier: "C",  primary: ["Biceps"], secondary: [] },
  "Spider curl":                     { tier: "C",  primary: ["Biceps"], secondary: [] },

  // ── TRICEPS ──────────────────────────────────────────────────────────────
  "Extension triceps câble barre":   { tier: "S+", primary: ["Triceps"], secondary: [] },
  "Barre front (Skullcrusher)":      { tier: "S",  primary: ["Triceps"], secondary: [] },
  "Pushdown barre":                  { tier: "A",  primary: ["Triceps"], secondary: [] },
  "Extension triceps câble corde":   { tier: "A",  primary: ["Triceps"], secondary: [] },
  "Extension triceps haltère 1 bras":{ tier: "A",  primary: ["Triceps"], secondary: [] },
  "Skullcrusher haltères":           { tier: "A",  primary: ["Triceps"], secondary: [] },
  "JM press Smith":                  { tier: "A",  primary: ["Triceps"], secondary: [] },
  "Kickback câble":                  { tier: "A",  primary: ["Triceps"], secondary: [] },
  "Développé couché prise serrée":   { tier: "A",  primary: ["Triceps"], secondary: ["Pectoraux", "Épaules"] },
  "Pushdown corde":                  { tier: "B",  primary: ["Triceps"], secondary: [] },
  "Extension nuque haltère":         { tier: "B",  primary: ["Triceps"], secondary: [] },
  "JM press":                        { tier: "B",  primary: ["Triceps"], secondary: [] },
  "Dips prise serrée":               { tier: "B",  primary: ["Triceps"], secondary: ["Pectoraux"] },
  "Dips machine":                    { tier: "B",  primary: ["Triceps"], secondary: [] },
  "Pompes diamant":                  { tier: "B",  primary: ["Triceps"], secondary: ["Pectoraux"] },
  "Dips banc":                       { tier: "C",  primary: ["Triceps"], secondary: [] },
  "Kickback haltère":                { tier: "C",  primary: ["Triceps"], secondary: [] },

  // ── QUADRICEPS ───────────────────────────────────────────────────────────
  "Hack squat":                      { tier: "S+", primary: ["Quadriceps"], secondary: ["Fessiers"] },
  "Squat barre":                     { tier: "S",  primary: ["Quadriceps", "Fessiers"], secondary: ["Ischio-jambiers"] },
  "Pendulum squat":                  { tier: "S",  primary: ["Quadriceps"], secondary: ["Fessiers"] },
  "Squat Smith":                     { tier: "S",  primary: ["Quadriceps", "Fessiers"], secondary: [] },
  "Fentes bulgares":                 { tier: "S",  primary: ["Quadriceps", "Fessiers"], secondary: ["Ischio-jambiers"] },
  "Squat avant":                     { tier: "A",  primary: ["Quadriceps"], secondary: ["Fessiers"] },
  "Squat barre basse":               { tier: "A",  primary: ["Quadriceps", "Fessiers"], secondary: [] },
  "Presse 45°":                      { tier: "A",  primary: ["Quadriceps", "Fessiers"], secondary: [] },
  "Leg extension":                   { tier: "A",  primary: ["Quadriceps"], secondary: [] },
  "Nordic inverse":                  { tier: "A",  primary: ["Quadriceps"], secondary: [] },
  "Fentes":                          { tier: "B",  primary: ["Quadriceps", "Fessiers"], secondary: ["Ischio-jambiers"] },
  "Goblet squat":                    { tier: "B",  primary: ["Quadriceps", "Fessiers"], secondary: [] },
  "Sissy squat":                     { tier: "B",  primary: ["Quadriceps"], secondary: [] },
  "Presse horizontale":              { tier: "C",  primary: ["Quadriceps"], secondary: ["Fessiers"] },
  "Step-ups":                        { tier: "C",  primary: ["Quadriceps", "Fessiers"], secondary: [] },
  "Pistol squat":                    { tier: "C",  primary: ["Quadriceps", "Fessiers"], secondary: [] },
  "Squat sauté":                     { tier: "F",  primary: ["Quadriceps"], secondary: [] },
  "Squat Bosu":                      { tier: "F-", primary: ["Quadriceps"], secondary: [] },

  // ── FESSIERS ─────────────────────────────────────────────────────────────
  "Fentes marchées":                 { tier: "S",  primary: ["Fessiers", "Quadriceps"], secondary: ["Ischio-jambiers"] },
  "Abduction machine":               { tier: "S",  primary: ["Fessiers"], secondary: [] },
  "Extension dos 45°":               { tier: "S",  primary: ["Fessiers", "Ischio-jambiers"], secondary: ["Dos"] },
  "Fentes Smith pied surélevé":      { tier: "S",  primary: ["Fessiers", "Quadriceps"], secondary: [] },
  "Hip thrust machine":              { tier: "A",  primary: ["Fessiers"], secondary: ["Ischio-jambiers"] },
  "Hip thrust 1 jambe haltère":      { tier: "A",  primary: ["Fessiers"], secondary: ["Ischio-jambiers"] },
  "Kickbacks fessiers":              { tier: "A",  primary: ["Fessiers"], secondary: [] },
  "Soulevé de terre Roumain":        { tier: "A",  primary: ["Ischio-jambiers", "Fessiers"], secondary: ["Dos"] },
  "Hip thrust barre":                { tier: "B",  primary: ["Fessiers"], secondary: ["Ischio-jambiers"] },
  "Glute bridge":                    { tier: "B",  primary: ["Fessiers"], secondary: ["Ischio-jambiers"] },
  "Abduction câble":                 { tier: "B",  primary: ["Fessiers"], secondary: [] },
  "Fentes curtsy":                   { tier: "B",  primary: ["Fessiers", "Quadriceps"], secondary: [] },
  "Soulevé de terre sumo":           { tier: "B",  primary: ["Fessiers", "Ischio-jambiers"], secondary: ["Dos"] },
  "Frog pumps":                      { tier: "C",  primary: ["Fessiers"], secondary: [] },
  "Donkey kicks":                    { tier: "D",  primary: ["Fessiers"], secondary: [] },
  "Kettlebell swing":                { tier: "D",  primary: ["Fessiers", "Ischio-jambiers"], secondary: [] },

  // ── ISCHIO-JAMBIERS ───────────────────────────────────────────────────────
  "Nordic curl":                     { tier: "S+", primary: ["Ischio-jambiers"], secondary: [] },
  "Leg curl assis":                  { tier: "S",  primary: ["Ischio-jambiers"], secondary: [] },
  "Leg curl couché":                 { tier: "A",  primary: ["Ischio-jambiers"], secondary: [] },
  "Soulevé de terre jambes tendues": { tier: "B",  primary: ["Ischio-jambiers", "Fessiers"], secondary: ["Dos"] },
  "Good morning":                    { tier: "B",  primary: ["Ischio-jambiers", "Dos"], secondary: ["Fessiers"] },

  // ── MOLLETS ──────────────────────────────────────────────────────────────
  "Mollets assis":                   { tier: "S",  primary: ["Mollets"], secondary: [] },
  "Mollets debout":                  { tier: "A",  primary: ["Mollets"], secondary: [] },
  "Mollets presse":                  { tier: "A",  primary: ["Mollets"], secondary: [] },

  // ── ABDOMINAUX ───────────────────────────────────────────────────────────
  "Cable crunch":                    { tier: "S",  primary: ["Abdominaux"], secondary: [] },
  "Ab wheel":                        { tier: "A",  primary: ["Abdominaux"], secondary: [] },
  "Relevé de jambes suspendu":       { tier: "A",  primary: ["Abdominaux"], secondary: [] },
  "Crunch":                          { tier: "C",  primary: ["Abdominaux"], secondary: [] },
  "Planche":                         { tier: "C",  primary: ["Abdominaux"], secondary: [] },
  "Russian twist":                   { tier: "C",  primary: ["Abdominaux"], secondary: [] },
};

const ALL_MUSCLES = [
  "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps",
  "Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets",
  "Trapèzes", "Abdominaux", "Avant-bras"
];

const MUSCLE_META = {
  "Pectoraux":       { color: "#ff4d4d", emoji: "💪" },
  "Dos":             { color: "#4d9fff", emoji: "🔷" },
  "Épaules":         { color: "#ffb84d", emoji: "⚡" },
  "Biceps":          { color: "#4dff91", emoji: "💚" },
  "Triceps":         { color: "#c084fc", emoji: "💜" },
  "Quadriceps":      { color: "#f472b6", emoji: "🦵" },
  "Ischio-jambiers": { color: "#fb923c", emoji: "🔶" },
  "Fessiers":        { color: "#22d3ee", emoji: "🔵" },
  "Mollets":         { color: "#a3e635", emoji: "🟢" },
  "Trapèzes":        { color: "#818cf8", emoji: "🔮" },
  "Abdominaux":      { color: "#2dd4bf", emoji: "⬜" },
  "Avant-bras":      { color: "#e879f9", emoji: "🦾" },
};

// Recommended weekly sets per muscle (Dr. Mike Israetel style)
// min = MEV, max = MRV, target = mid-MAV (balanced default)
const RECOMMENDED_SETS = {
  "Pectoraux":        { min: 10, max: 20, mev: 6,  mav: 15 },
  "Dos":              { min: 10, max: 20, mev: 6,  mav: 15 },
  "Épaules":          { min: 10, max: 20, mev: 6,  mav: 15 },
  "Biceps":           { min: 6,  max: 16, mev: 4,  mav: 11 },
  "Triceps":          { min: 6,  max: 16, mev: 4,  mav: 11 },
  "Quadriceps":       { min: 8,  max: 16, mev: 6,  mav: 12 },
  "Ischio-jambiers":  { min: 6,  max: 16, mev: 4,  mav: 11 },
  "Fessiers":         { min: 6,  max: 16, mev: 4,  mav: 11 },
  "Mollets":          { min: 8,  max: 16, mev: 6,  mav: 12 },
  "Trapèzes":         { min: 0,  max: 20, mev: 0,  mav: 10 },
  "Abdominaux":       { min: 0,  max: 20, mev: 0,  mav: 10 },
  "Avant-bras":       { min: 0,  max: 20, mev: 0,  mav: 10 },
};

// Derive adaptive targets based on priority setting
// "priority" → push to MAV ceiling (mav + buffer)
// "maintain" → target MEV
// "balanced"  → target mid-MAV
function getTarget(muscle, priority) {
  const { min, max, mev, mav } = RECOMMENDED_SETS[muscle];
  if (min === 0) return null; // accessory muscles: no strict target
  if (priority === "priority") return { target: mav + 3, label: "Cible priorité", color: "#007AFF" };
  if (priority === "maintain") return { target: mev, label: "Cible maintien", color: "#8E8E93" };
  return { target: mav, label: "Cible équilibré", color: "#34C759" };
}

/* ─── INITIAL PROGRAM ───────────────────────────────────────────────────── */
const INITIAL_PROGRAM = [
  {
    id: "d1", name: "Push — A",
    exercises: [
      { id: "e1", name: "Développé couché barre", sets: 4 },
      { id: "e2", name: "Développé incliné haltères", sets: 3 },
      { id: "e3", name: "Développé militaire barre", sets: 3 },
      { id: "e4", name: "Élévations latérales câble", sets: 4 },
      { id: "e5", name: "Extension triceps câble barre", sets: 3 },
    ],
  },
  {
    id: "d2", name: "Pull — B",
    exercises: [
      { id: "e6", name: "Tractions lestées", sets: 4 },
      { id: "e7", name: "Rowing buste appuyé", sets: 4 },
      { id: "e8", name: "Tirage vertical prise neutre", sets: 3 },
      { id: "e9", name: "Curl barre EZ", sets: 3 },
      { id: "e10", name: "Curl marteau", sets: 3 },
    ],
  },
  {
    id: "d3", name: "Legs — C",
    exercises: [
      { id: "e11", name: "Squat barre", sets: 4 },
      { id: "e12", name: "Soulevé de terre Roumain", sets: 3 },
      { id: "e13", name: "Leg extension", sets: 3 },
      { id: "e14", name: "Leg curl assis", sets: 3 },
      { id: "e15", name: "Mollets debout", sets: 4 },
    ],
  },
];

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
let _id = 200;
const uid = () => `e${_id++}`;
const TIER_ORDER = ["S+", "S", "A+", "A", "B+", "B", "C", "D", "F", "F-"];

function calcSets(program, db) {
  const totals = {};
  ALL_MUSCLES.forEach(m => totals[m] = 0);
  program.forEach(day =>
    day.exercises.forEach(ex => {
      const data = db[ex.name];
      if (!data) return;
      data.primary.forEach(m => { if (totals[m] !== undefined) totals[m] += ex.sets; });
      data.secondary.forEach(m => { if (totals[m] !== undefined) totals[m] += ex.sets * 0.5; });
    })
  );
  return totals;
}

function getStatus(sets, muscle, priority = "balanced") {
  const { min, max, mev, mav } = RECOMMENDED_SETS[muscle];
  if (min === 0 && sets === 0) return "neutral";
  if (priority === "maintain") {
    if (sets < mev) return "under";
    if (sets > mev + 4) return "over";
    return "ok";
  }
  if (priority === "priority") {
    if (sets < mav) return "under";
    if (sets > max) return "over";
    return "ok";
  }
  // balanced
  if (sets < min) return "under";
  if (sets > max) return "over";
  return "ok";
}

const EMPTY_EX_FORM = { name: "", tier: "A", primary: [], secondary: [] };
const mkProgram = (name) => ({ id: uid(), name, days: [] });

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function WorkoutBuilder() {
  // ── Multi-program state ───────────────────────────────────────────────────
  const [programs, setPrograms] = useState([
    { id: "p1", name: "Mon Programme", days: INITIAL_PROGRAM }
  ]);
  const [activeProgramId, setActiveProgramId] = useState("p1");

  // Derived: current program's days
  const program = programs.find(p => p.id === activeProgramId)?.days ?? [];
  // Setter that updates within programs array
  const setProgram = fn => setPrograms(ps => ps.map(p =>
    p.id !== activeProgramId ? p : { ...p, days: typeof fn === "function" ? fn(p.days) : fn }
  ));

  const [db, setDb] = useState(EXERCISE_DB);
  const [page, setPage] = useState("program");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [dragInfo, setDragInfo] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [editingDayName, setEditingDayName] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  // Library filters
  const [libSearch, setLibSearch] = useState("");
  const [libMuscle, setLibMuscle] = useState("Tous");
  const [libTier, setLibTier] = useState("Tous");
  // Exercise form
  const [exForm, setExForm] = useState(EMPTY_EX_FORM);
  const [exFormOldName, setExFormOldName] = useState(null);
  const [exFormError, setExFormError] = useState("");
  // Program form
  const [progFormName, setProgFormName] = useState("");
  const [progFormError, setProgFormError] = useState("");
  const [editingProgId, setEditingProgId] = useState(null);

  // Muscle priorities: "priority" | "maintain" | "balanced"
  const [musclePriorities, setMusclePriorities] = useState(
    Object.fromEntries(ALL_MUSCLES.map(m => [m, "balanced"]))
  );
  function setPriority(muscle, value) {
    setMusclePriorities(p => ({ ...p, [muscle]: value }));
  }
  function resetPriorities() {
    setMusclePriorities(Object.fromEntries(ALL_MUSCLES.map(m => [m, "balanced"])));
  }
  const hasPriorities = Object.values(musclePriorities).some(v => v !== "balanced");

  const saveTimer = useRef(null);
  const searchRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimer = useRef(null);

  const [collapsedDays, setCollapsedDays] = useState({});
  const toggleCollapse = (dayId) => setCollapsedDays(s => ({ ...s, [dayId]: !s[dayId] }));

  const muscleSets = calcSets(program, db);

  // ── Storage: load on mount ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("workout-programs") || "null");
      if (saved?.programs?.length) {
        setPrograms(saved.programs);
        setActiveProgramId(saved.activeProgramId ?? saved.programs[0].id);
      } else {
        // Migrate legacy single-program save
        const legacy = JSON.parse(localStorage.getItem("workout-program") || "null");
        if (legacy?.days) setPrograms([{ id: "p1", name: "Mon Programme", days: legacy.days }]);
      }
    } catch (_) {}
    try {
      const r2 = JSON.parse(localStorage.getItem("workout-db") || "null");
      if (r2) setDb(r2);
    } catch (_) {}
    try {
      const r3 = JSON.parse(localStorage.getItem("workout-priorities") || "null");
      if (r3) setMusclePriorities(prev => ({ ...prev, ...r3 }));
    } catch (_) {}
  }, []);

  // ── Auto-save all programs ────────────────────────────────────────────────
  const saveAll = useCallback((progs, activeId) => {
    setSaveStatus("saving");
    try {
      localStorage.setItem("workout-programs", JSON.stringify({ programs: progs, activeProgramId: activeId, savedAt: Date.now() }));
      setSaveStatus("saved");
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (_) { setSaveStatus("error"); }
  }, []);

  useEffect(() => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveAll(programs, activeProgramId), 800);
    return () => clearTimeout(autoSaveTimer.current);
  }, [programs, activeProgramId, saveAll]);

  // ── Auto-save db ──────────────────────────────────────────────────────────
  const dbSaveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(dbSaveTimer.current);
    dbSaveTimer.current = setTimeout(() => {
      try { localStorage.setItem("workout-db", JSON.stringify(db)); } catch (_) {}
    }, 800);
    return () => clearTimeout(dbSaveTimer.current);
  }, [db]);

  // ── Auto-save priorities ──────────────────────────────────────────────────
  const prioSaveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(prioSaveTimer.current);
    prioSaveTimer.current = setTimeout(() => {
      try { localStorage.setItem("workout-priorities", JSON.stringify(musclePriorities)); } catch (_) {}
    }, 600);
    return () => clearTimeout(prioSaveTimer.current);
  }, [musclePriorities]);

  // ── Export / Import ───────────────────────────────────────────────────────
  function exportJSON() {
    const blob = new Blob([JSON.stringify({ programs, activeProgramId, db }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "workout-builder.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function handleImportFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImportText(ev.target.result); setModal({ type: "import" }); setImportError(""); };
    reader.readAsText(file);
    e.target.value = "";
  }
  function confirmImport() {
    try {
      const data = JSON.parse(importText);
      // Support both old format (days) and new (programs)
      if (data.programs) {
        setPrograms(data.programs);
        setActiveProgramId(data.activeProgramId ?? data.programs[0].id);
      } else if (data.days) {
        setPrograms(ps => [...ps, { id: uid(), name: "Programme importé", days: data.days }]);
      } else throw new Error("Format invalide");
      if (data.db) setDb(data.db);
      setModal(null); setImportText(""); setImportError("");
    } catch (e) { setImportError("Fichier invalide : " + e.message); }
  }

  // ── Program management ────────────────────────────────────────────────────
  function openNewProgram() {
    setProgFormName(""); setProgFormError(""); setEditingProgId(null);
    setModal({ type: "progForm" });
  }
  function openEditProgram(id) {
    const p = programs.find(p => p.id === id);
    setProgFormName(p?.name ?? ""); setProgFormError(""); setEditingProgId(id);
    setModal({ type: "progForm" });
  }
  function saveProgForm() {
    const name = progFormName.trim();
    if (!name) { setProgFormError("Donne un nom à ce programme."); return; }
    if (editingProgId) {
      setPrograms(ps => ps.map(p => p.id === editingProgId ? { ...p, name } : p));
    } else {
      const newProg = mkProgram(name);
      setPrograms(ps => [...ps, newProg]);
      setActiveProgramId(newProg.id);
    }
    setModal(null);
  }
  function duplicateProgram(id) {
    const src = programs.find(p => p.id === id);
    if (!src) return;
    const copy = { id: uid(), name: `${src.name} (copie)`, days: JSON.parse(JSON.stringify(src.days)) };
    setPrograms(ps => [...ps, copy]);
    setActiveProgramId(copy.id);
    setModal(null);
  }
  function deleteProgram(id) {
    if (programs.length === 1) { alert("Tu ne peux pas supprimer le seul programme."); return; }
    if (!window.confirm("Supprimer ce programme ?")) return;
    setPrograms(ps => ps.filter(p => p.id !== id));
    if (activeProgramId === id) setActiveProgramId(programs.find(p => p.id !== id)?.id ?? "");
  }
  function switchProgram(id) { setActiveProgramId(id); setModal(null); }

  // ── Program mutations ─────────────────────────────────────────────────────
  const mut = fn => setProgram(p => fn(p.map(d => ({ ...d, exercises: [...d.exercises] }))));
  function deleteExercise(dayId, exId) { mut(p => p.map(d => d.id !== dayId ? d : { ...d, exercises: d.exercises.filter(e => e.id !== exId) })); }
  function moveExercise(dayId, idx, dir) {
    mut(p => p.map(d => {
      if (d.id !== dayId) return d;
      const exs = [...d.exercises]; const ni = idx + dir;
      if (ni < 0 || ni >= exs.length) return d;
      [exs[idx], exs[ni]] = [exs[ni], exs[idx]]; return { ...d, exercises: exs };
    }));
  }
  function updateSets(dayId, exId, val) {
    const v = Math.max(1, Math.min(20, Number(val)));
    mut(p => p.map(d => d.id !== dayId ? d : { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, sets: v } : e) }));
  }
  function pickExercise(name) {
    if (!modal) return;
    if (modal.type === "replace") {
      mut(p => p.map(d => d.id !== modal.dayId ? d : { ...d, exercises: d.exercises.map(e => e.id === modal.exId ? { ...e, name } : e) }));
    } else {
      mut(p => p.map(d => d.id !== modal.dayId ? d : { ...d, exercises: [...d.exercises, { id: uid(), name, sets: 3 }] }));
    }
    setModal(null); setSearch("");
  }
  function addDay() { setProgram(p => [...p, { id: uid(), name: `Jour ${p.length + 1}`, exercises: [] }]); }
  function deleteDay(dayId) { setProgram(p => p.filter(d => d.id !== dayId)); }
  function renameDay(dayId, name) { setProgram(p => p.map(d => d.id !== dayId ? d : { ...d, name })); setEditingDay(null); }
  function onDragStart(dayId, exIdx) { setDragInfo({ dayId, exIdx }); }
  function onDrop(targetDayId, targetIdx) {
    if (!dragInfo) return;
    const { dayId: srcDayId, exIdx: srcIdx } = dragInfo;
    mut(p => {
      let moved = null;
      const np = p.map(d => { if (d.id !== srcDayId) return d; const exs = [...d.exercises]; [moved] = exs.splice(srcIdx, 1); return { ...d, exercises: exs }; });
      return np.map(d => { if (d.id !== targetDayId) return d; const exs = [...d.exercises]; exs.splice(targetIdx, 0, moved); return { ...d, exercises: exs }; });
    });
    setDragInfo(null);
  }

  // ── DB mutations ──────────────────────────────────────────────────────────
  function openAddEx() { setExForm(EMPTY_EX_FORM); setExFormOldName(null); setExFormError(""); setModal({ type: "editEx" }); }
  function openEditEx(name) { setExForm({ name, ...db[name] }); setExFormOldName(name); setExFormError(""); setModal({ type: "editEx" }); }
  function deleteEx(name) {
    if (!window.confirm(`Supprimer « ${name} » de la bibliothèque ?`)) return;
    setDb(d => { const n = { ...d }; delete n[name]; return n; });
  }
  function toggleMuscle(arr, m) { return arr.includes(m) ? arr.filter(x => x !== m) : [...arr, m]; }
  function saveExForm() {
    const name = exForm.name.trim();
    if (!name) { setExFormError("Le nom est obligatoire."); return; }
    if (!exForm.primary.length) { setExFormError("Sélectionne au moins un muscle principal."); return; }
    if (exFormOldName === null && db[name]) { setExFormError("Un exercice avec ce nom existe déjà."); return; }
    setDb(d => {
      const n = { ...d };
      if (exFormOldName && exFormOldName !== name) delete n[exFormOldName];
      n[name] = { tier: exForm.tier, primary: exForm.primary, secondary: exForm.secondary };
      return n;
    });
    setModal(null);
  }

  // ── AI Analysis ──────────────────────────────────────────────────────────
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function generateAnalysis() {
    setAiLoading(true); setAiAnalysis(null);
    const activeProgram = programs.find(p => p.id === activeProgramId);
    const summary = activeProgram?.days.map(d =>
      `${d.name}: ${d.exercises.map(e => `${e.name} (${e.sets} séries)`).join(", ")}`
    ).join("\n");
    const muscleData = Object.entries(muscleSets)
      .filter(([, v]) => v > 0)
      .map(([m, v]) => {
        const prio = musclePriorities[m];
        const tag = prio === "priority" ? " 🎯 PRIORITÉ" : prio === "maintain" ? " 🔒 MAINTIEN" : "";
        return `${m}: ${v} séries${tag}`;
      }).join(", ");
    const priorityList = ALL_MUSCLES.filter(m => musclePriorities[m] !== "balanced");
    const priorityContext = priorityList.length > 0
      ? `\nObjectifs définis par l'utilisateur :\n- Priorité développement : ${ALL_MUSCLES.filter(m => musclePriorities[m] === "priority").join(", ") || "aucun"}\n- Maintien : ${ALL_MUSCLES.filter(m => musclePriorities[m] === "maintain").join(", ") || "aucun"}`
      : "\nL'utilisateur vise un programme équilibré sans priorité particulière.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Tu es un coach en musculation expert. Analyse ce programme en français de façon concise et directe.

Programme "${activeProgram?.name}" :
${summary}

Volume par groupe musculaire (séries totales par semaine) :
${muscleData}
${priorityContext}

Donne une analyse structurée en 3-4 paragraphes courts :
1. Est-ce que le volume actuel correspond aux objectifs définis (priorités/maintien/équilibre) ?
2. Les équilibres musculaires (push/pull, quad/ischios, etc.)
3. Les ajustements concrets à faire pour mieux coller aux objectifs
4. Une recommandation courte et actionnable

Sois direct, comme un vrai coach. Pas de titres, juste des paragraphes. Maximum 220 mots.`
          }]
        })
      });
      const data = await res.json();
      setAiAnalysis(data.content?.[0]?.text ?? "Analyse indisponible.");
    } catch { setAiAnalysis("Erreur lors de la génération de l'analyse."); }
    setAiLoading(false);
  }

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredPicker = Object.keys(db)
    .filter(n => n.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => TIER_ORDER.indexOf(db[a].tier ?? "C") - TIER_ORDER.indexOf(db[b].tier ?? "C"));

  const filteredLib = Object.keys(db)
    .filter(n => {
      const d = db[n];
      const matchSearch = n.toLowerCase().includes(libSearch.toLowerCase());
      const matchMuscle = libMuscle === "Tous" || d.primary.includes(libMuscle) || d.secondary.includes(libMuscle);
      const matchTier = libTier === "Tous" || d.tier === libTier;
      return matchSearch && matchMuscle && matchTier;
    })
    .sort((a, b) => TIER_ORDER.indexOf(db[a].tier ?? "C") - TIER_ORDER.indexOf(db[b].tier ?? "C"));

  useEffect(() => { if (modal?.type === "replace" || modal?.type === "add") setTimeout(() => searchRef.current?.focus(), 50); }, [modal]);

  const statusColor = { under: "#FF9500", ok: "#34C759", over: "#FF3B30", neutral: "#C7C7CC" };
  const statusLabel = { under: "BON", ok: "OPTIMAL", over: "EXCESSIF", neutral: "—" };
  const activeProgName = programs.find(p => p.id === activeProgramId)?.name ?? "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        html, body { height: 100%; background: #F2F2F7; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #FFFFFF; }
        ::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 2px; }

        /* ── APP SHELL ── */
        .app {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #F2F2F7; color: #1C1C1E;
          display: flex; flex-direction: column;
          height: 100dvh;
          padding-top: env(safe-area-inset-top);
        }

        /* ── DESKTOP HEADER ── */
        .header { display: none; padding: 0 24px; border: 1px solid #E5E5EA; background: #F2F2F7; align-items: stretch; flex-shrink: 0; }
        @media (min-width: 768px) { .header { display: flex; } }
        .header-brand { display: flex; align-items: center; padding: 12px 20px 12px 0; border: 1px solid #E5E5EA; margin-right: 4px; }
        .header-brand h1 { font-family: 'Inter', -apple-system, sans-serif; font-size: 1.6rem; letter-spacing: -0.3px; color: #1C1C1E; }
        .header-brand span { color: #ff6b35; }
        .nav-tab { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.68rem; letter-spacing: -0.2px; text-transform: uppercase; background: none; border: none; color: #8E8E93; cursor: pointer; padding: 0 14px; border-bottom: 2px solid transparent; transition: all 0.15s; }
        .nav-tab.active { color: #ff6b35; border-bottom-color: #ff6b35; }
        .header-spacer { flex: 1; }
        .header-actions { display: flex; align-items: center; gap: 8px; padding: 10px 0; }
        .hdr-btn { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.62rem; letter-spacing: 1.5px; padding: 5px 12px; border-radius: 3px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; }
        .hdr-btn-ghost { background: none; border: 1px solid #E5E5EA; color: #8E8E93; }
        .hdr-btn-ghost:hover { border-color: #ff6b35; color: #ff6b35; }
        .hdr-btn-solid { background: #ff6b35; border: none; color: #000; }
        .hdr-btn-solid:hover { background: #ff8c5a; }

        /* ── PROG SWITCHER ── */
        .prog-switcher { display: flex; align-items: center; gap: 6px; padding: 5px 12px; background: #F2F2F7; border: 1px solid #E5E5EA; border-radius: 4px; cursor: pointer; max-width: 200px; }
        .prog-switcher:hover { border-color: #ff6b35; }
        .prog-switcher-name { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.72rem; color: #1C1C1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .prog-switcher-chevron { color: #ff6b35; font-size: 0.6rem; flex-shrink: 0; }

        /* ── SAVE DOT ── */
        .save-dot { width: 6px; height: 6px; border-radius: 50%; background: #D1D1D6; transition: background 0.3s; }
        .save-dot.saving { background: #ffb84d; }
        .save-dot.saved { background: #4dff91; }
        .save-dot.error { background: #ff4d4d; }

        /* ── MOBILE HEADER ── */
        .mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #F2F2F7; border: 1px solid #E5E5EA; flex-shrink: 0; }
        @media (min-width: 768px) { .mobile-header { display: none; } }
        .mobile-right { display: flex; align-items: center; gap: 8px; }
        .mob-btn { background: none; border: 1px solid #E5E5EA; color: #8E8E93; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.6rem; padding: 5px 10px; border-radius: 3px; cursor: pointer; text-transform: uppercase; }
        .mob-btn:active { border-color: #ff6b35; color: #ff6b35; }

        /* ── MAIN CONTENT ── */
        /* Mobile: one scrollable column */
        .content { flex: 1; min-height: 0; overflow-y: auto; }
        /* Desktop: two columns, each scrolls */
        @media (min-width: 768px) {
          .content { overflow: hidden; display: grid; grid-template-columns: 1fr 300px; }
          .content > * { overflow-y: auto; }
        }

        /* ── PAGE ── */
        .page { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        @media (min-width: 768px) { .page { padding: 24px; } }

        /* ── PAGE TITLE ── */
        .page-title { font-family: 'Inter', -apple-system, sans-serif; font-size: 2rem; letter-spacing: -0.2px; color: #1C1C1E; }
        .page-title-accent { display: block; width: 32px; height: 2px; background: #ff6b35; margin-top: 4px; border-radius: 1px; }

        /* ── DAY CARD ── */
        .day-card { border: 1px solid #E5E5EA; border-radius: 6px; overflow: hidden; }
        .day-header { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #FFFFFF; cursor: pointer; user-select: none; }
        .day-header:hover { background: #F7F7F7; }
        .day-header.open { border: 1px solid #E5E5EA; }
        .day-collapse-icon { color: #AEAEB2; font-size: 0.7rem; transition: transform 0.2s; flex-shrink: 0; }
        .day-collapse-icon.open { transform: rotate(90deg); color: #ff6b35; }
        .day-name { font-family: 'Inter', -apple-system, sans-serif; font-size: 1rem; letter-spacing: -0.2px; color: #1C1C1E; flex: 1; }
        .day-name-input { background: transparent; border: none; border-bottom: 1px solid #ff6b35; color: #1C1C1E; font-family: 'Inter', -apple-system, sans-serif; font-size: 1rem; letter-spacing: -0.2px; outline: none; flex: 1; }
        .day-count { font-size: 0.6rem; color: #AEAEB2; letter-spacing: 1px; }
        .day-edit-btn { background: none; border: none; color: #AEAEB2; font-size: 0.8rem; cursor: pointer; padding: 4px 6px; border-radius: 3px; min-width: 28px; min-height: 28px; display: flex; align-items: center; justify-content: center; }
        .day-edit-btn:hover, .day-edit-btn:active { color: #ffb84d; }
        .day-del-btn { background: none; border: none; color: #C7C7CC; font-size: 0.75rem; cursor: pointer; padding: 4px 6px; border-radius: 3px; min-width: 28px; min-height: 28px; display: flex; align-items: center; justify-content: center; }
        .day-del-btn:hover, .day-del-btn:active { color: #ff4d4d; }

        /* ── EXERCISE ROW ── */
        .ex-list { display: flex; flex-direction: column; }
        .ex-row { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border: 1px solid #F2F2F7; }
        .ex-row:last-of-type { border-bottom: none; }
        .ex-row:hover { background: #FAFAFA; }
        @media (min-width: 768px) { .ex-row { cursor: grab; } }
        .ex-idx { font-size: 0.58rem; color: #C7C7CC; width: 16px; flex-shrink: 0; display: none; }
        @media (min-width: 768px) { .ex-idx { display: block; } }
        .ex-info { flex: 1; min-width: 0; }
        .ex-name { font-size: 0.82rem; color: #1C1C1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ex-sub { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; margin-top: 4px; }
        .ex-sets-badge { font-size: 0.6rem; background: #F2F2F7; color: #636366; padding: 2px 7px; border: 1px solid #E5E5EA; }
        .muscle-pill { font-size: 0.55rem; padding: 2px 6px; border-radius: 3px; }
        .tier-badge { font-size: 0.58rem; font-weight: 500; padding: 1px 6px; border-radius: 3px; letter-spacing: 0.3px; white-space: nowrap; flex-shrink: 0; border: 1px solid transparent; }

        /* ── SETS CONTROL ── */
        .sets-ctrl { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .sets-btn { background: #F2F2F7; border: 1px solid #E5E5EA; color: #636366; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
        .sets-btn:active { border-color: #ff6b35; color: #ff6b35; }
        @media (min-width: 768px) { .sets-btn { width: 22px; height: 22px; font-size: 0.8rem; border-radius: 2px; } }
        .sets-val { font-size: 0.9rem; color: #1C1C1E; font-weight: 600; min-width: 26px; text-align: center; }
        @media (min-width: 768px) { .sets-val { font-size: 0.78rem; min-width: 18px; } }

        /* Mobile action buttons */
        .ex-mob-btns { display: flex; gap: 4px; flex-shrink: 0; }
        @media (min-width: 768px) { .ex-mob-btns { display: none; } }
        .ex-mob-btn { background: #F2F2F7; border: 1px solid #E5E5EA; color: #8E8E93; font-size: 0.75rem; font-family: 'Inter', -apple-system, sans-serif; border-radius: 4px; padding: 6px 10px; cursor: pointer; min-height: 32px; display: flex; align-items: center; }
        .ex-mob-btn:active { border-color: #ff6b35; color: #ff6b35; }
        .ex-mob-btn.del:active { border-color: #ff4d4d; color: #ff4d4d; }

        /* Desktop icon buttons */
        .icon-btn { background: none; border: none; cursor: pointer; color: #D1D1D6; font-size: 0.75rem; padding: 3px 5px; border-radius: 3px; display: none; align-items: center; justify-content: center; min-width: 28px; min-height: 28px; transition: color 0.12s; }
        @media (min-width: 768px) { .icon-btn { display: flex; } .icon-btn:hover { color: #636366; } .icon-btn.del:hover { color: #ff4d4d; } .icon-btn.rep:hover { color: #ffb84d; } }
        .ex-chevron { color: #D1D1D6; font-size: 0.7rem; display: none; }
        @media (min-width: 768px) { .ex-chevron { display: block; } }

        /* ── ADD EXERCISE / DAY ── */
        .add-ex-btn { display: flex; align-items: center; gap: 8px; padding: 12px 14px; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.7rem; color: #AEAEB2; background: none; border: none; cursor: pointer; width: 100%; letter-spacing: 1px; }
        .add-ex-btn:hover, .add-ex-btn:active { color: #ff6b35; }
        .add-day-btn { font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.2px; font-size: 0.9rem; background: none; border: 1px dashed #222; color: #AEAEB2; padding: 13px 20px; cursor: pointer; border-radius: 6px; width: 100%; text-align: center; }
        .add-day-btn:hover, .add-day-btn:active { border-color: #ff6b35; color: #ff6b35; }
        @media (min-width: 768px) { .add-day-btn { width: auto; align-self: flex-start; } }

        /* ── ANALYSIS PANEL ── */
        .panel-title { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.95rem; letter-spacing: -0.3px; color: #8E8E93; margin-bottom: 14px; }
        .muscle-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
        .muscle-info { display: flex; justify-content: space-between; align-items: center; }
        .muscle-name-row { display: flex; align-items: center; gap: 6px; }
        .muscle-label { font-size: 0.68rem; color: #636366; }
        .muscle-sets { font-size: 0.7rem; color: #1C1C1E; }
        .bar-bg { height: 4px; background: #F2F2F7; border-radius: 2px; position: relative; }
        .bar-fill { height: 4px; border-radius: 2px; transition: width 0.3s; }
        .bar-marker { position: absolute; top: -3px; width: 2px; height: 10px; border-radius: 1px; }
        .status-badge { font-size: 0.52rem; letter-spacing: 1.5px; padding: 1px 5px; border-radius: 3px; }
        .legend-row { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; color: #AEAEB2; }
        .legend-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .divider { height: 1px; background: #F2F2F7; margin: 12px 0; }
        .analysis-label { font-size: 0.62rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: #8E8E93; }

        /* ── AI ANALYSIS ── */
        .ai-card { background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 6px; padding: 14px; }
        .ai-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .ai-title { font-size: 0.78rem; color: #1C1C1E; display: flex; align-items: center; gap: 6px; }
        .ai-generate-btn { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.68rem; padding: 6px 12px; background: #ff6b35; border: none; color: #000; border-radius: 3px; cursor: pointer; letter-spacing: 0.5px; }
        .ai-generate-btn:hover { background: #ff8c5a; }
        .ai-generate-btn:disabled { background: #D1D1D6; color: #666; cursor: default; }
        .ai-text { font-size: 0.8rem; line-height: 1.7; color: #aaa; }
        .ai-loading { display: flex; align-items: center; gap: 8px; color: #8E8E93; font-size: 0.78rem; }
        .ai-spinner { width: 14px; height: 14px; border: 2px solid #222; border-top-color: #ff6b35; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── LIBRARY ── */
        .lib-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .lib-search { flex: 1; min-width: 140px; background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 4px; padding: 9px 12px; color: #1C1C1E; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.78rem; outline: none; }
        .lib-search:focus { border-color: #ff6b35; }
        .lib-select { background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 4px; padding: 8px 10px; color: #636366; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.72rem; outline: none; cursor: pointer; }
        .lib-select:focus { border-color: #ff6b35; }
        .lib-count { font-size: 0.62rem; color: #AEAEB2; }
        .lib-add-btn { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.68rem; letter-spacing: 1px; padding: 8px 14px; background: #ff6b35; border: none; color: #000; border-radius: 4px; cursor: pointer; }
        .lib-add-btn:hover, .lib-add-btn:active { background: #ff8c5a; }
        .lib-ex-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #FAFAFA; border: 1px solid #F2F2F7; cursor: pointer; }
        .lib-ex-row:first-child { border-radius: 6px 6px 0 0; }
        .lib-ex-row:last-child { border-radius: 0 0 6px 6px; border-bottom: none; }
        .lib-ex-row:only-child { border-radius: 6px; border-bottom: none; }
        .lib-ex-row:hover, .lib-ex-row:active { background: #FFFFFF; }
        .lib-ex-name { font-size: 0.8rem; color: #1C1C1E; }
        .lib-ex-sub { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 3px; align-items: center; }
        .lib-actions { display: flex; gap: 5px; flex-shrink: 0; }
        .lib-btn { background: none; border: 1px solid #E5E5EA; color: #AEAEB2; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.62rem; padding: 5px 10px; border-radius: 3px; cursor: pointer; min-height: 30px; display: flex; align-items: center; }
        .lib-btn:hover, .lib-btn:active { border-color: #ff6b35; color: #ff6b35; }
        .lib-btn.del:hover, .lib-btn.del:active { border-color: #ff4d4d; color: #ff4d4d; }
        .lib-empty { font-size: 0.8rem; color: #AEAEB2; padding: 30px; text-align: center; background: #FAFAFA; border-radius: 6px; }

        /* ── BOTTOM NAV (mobile only) ── */
        .bottom-nav { display: flex; align-items: center; background: #F2F2F7; border: 1px solid #E5E5EA; padding-bottom: env(safe-area-inset-bottom); flex-shrink: 0; }
        @media (min-width: 768px) { .bottom-nav { display: none; } }
        .bnav-btn { flex: 1; background: none; border: none; cursor: pointer; padding: 10px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .bnav-icon { font-size: 1.3rem; line-height: 1; }
        .bnav-label { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.52rem; letter-spacing: 0.5px; color: #AEAEB2; }
        .bnav-btn.active .bnav-label { color: #ff6b35; }

        /* ── MODAL ── */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
        @media (min-width: 768px) { .overlay { align-items: center; padding: 20px; } }
        .modal { background: #FFFFFF; border: 1px solid #E5E5EA; border-radius: 14px 14px 0 0; width: 100%; max-height: 90dvh; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom); }
        @media (min-width: 768px) { .modal { border-radius: 8px; width: 500px; max-height: 85vh; padding-bottom: 0; } .modal-lg { width: 560px; } }
        .modal-handle { width: 36px; height: 4px; background: #D1D1D6; border-radius: 2px; margin: 10px auto 0; flex-shrink: 0; }
        @media (min-width: 768px) { .modal-handle { display: none; } }
        .modal-header { padding: 14px 18px 12px; border: 1px solid #F2F2F7; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .modal-title { font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.2px; font-size: 1rem; color: #1C1C1E; }
        .modal-close { background: #F2F2F7; border: none; color: #636366; font-size: 0.75rem; cursor: pointer; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .modal-close:hover, .modal-close:active { background: #D1D1D6; color: #1C1C1E; }
        .modal-search-wrap { padding: 10px 14px 8px; flex-shrink: 0; }
        .modal-search { width: 100%; background: #F2F2F7; border: 1px solid #E5E5EA; border-radius: 6px; padding: 10px 14px; color: #1C1C1E; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.85rem; outline: none; }
        .modal-search:focus { border-color: #ff6b35; }
        .ex-picker { overflow-y: auto; flex: 1; }
        .ex-option { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid #0d0d0d; cursor: pointer; gap: 10px; }
        .ex-option:active, .ex-option:hover { background: #EFEFF4; }
        .ex-opt-name { font-size: 0.82rem; color: #1C1C1E; }
        .ex-opt-sub { font-size: 0.65rem; color: #8E8E93; margin-top: 2px; }
        .picker-footer { height: 10px; flex-shrink: 0; }

        /* Programs modal */
        .prog-list { display: flex; flex-direction: column; gap: 2px; padding: 10px; overflow-y: auto; flex: 1; }
        .prog-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #F2F2F7; border-radius: 6px; cursor: pointer; border: 1px solid transparent; }
        .prog-item:hover, .prog-item:active { background: #E5E5EA; }
        .prog-item.active-prog { border-color: #ff6b35; background: #F2F2F7; }
        .prog-checkmark { width: 20px; height: 20px; border: 1px solid #D1D1D6; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #8E8E93; flex-shrink: 0; }
        .prog-item.active-prog .prog-checkmark { background: #ff6b35; border-color: #ff6b35; color: #000; }
        .prog-item-name { font-size: 0.8rem; color: #1C1C1E; flex: 1; }
        .prog-item.active-prog .prog-item-name { color: #ff6b35; }
        .prog-item-days { font-size: 0.62rem; color: #8E8E93; margin-top: 2px; }
        .prog-item-actions { display: flex; gap: 3px; }
        .prog-icon-btn { background: #FFFFFF; border: 1px solid #E5E5EA; color: #8E8E93; font-size: 0.8rem; cursor: pointer; padding: 5px 7px; border-radius: 4px; min-width: 30px; min-height: 30px; display: flex; align-items: center; justify-content: center; }
        .prog-icon-btn:hover, .prog-icon-btn:active { border-color: #ff6b35; color: #ff6b35; }
        .prog-footer { padding: 10px; border: 1px solid #F2F2F7; flex-shrink: 0; }
        .prog-new-btn { width: 100%; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.75rem; letter-spacing: 1px; padding: 12px; background: #ff6b35; border: none; color: #000; border-radius: 6px; cursor: pointer; }
        .prog-new-btn:hover, .prog-new-btn:active { background: #ff8c5a; }

        /* Forms */
        .modal-form { padding: 14px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
        .form-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px; color: #8E8E93; margin-bottom: 5px; display: block; }
        .form-input { width: 100%; background: #F2F2F7; border: 1px solid #E5E5EA; border-radius: 6px; padding: 11px 14px; color: #1C1C1E; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.9rem; outline: none; }
        .form-input:focus { border-color: #ff6b35; }
        .form-select { width: 100%; background: #F2F2F7; border: 1px solid #E5E5EA; border-radius: 6px; padding: 11px 14px; color: #1C1C1E; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.88rem; outline: none; cursor: pointer; }
        .form-select:focus { border-color: #ff6b35; }
        .muscle-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .muscle-toggle { font-size: 0.65rem; padding: 6px 12px; border: 1px solid #E5E5EA; background: #FAFAFA; color: #8E8E93; cursor: pointer; font-family: 'Inter', -apple-system, sans-serif; }
        .muscle-toggle.active-primary { border-color: var(--mc); color: var(--mc); background: color-mix(in srgb, var(--mc) 10%, transparent); }
        .muscle-toggle.active-secondary { border-color: #C7C7CC; color: #636366; background: #F2F2F7; }
        .form-error { font-size: 0.7rem; color: #ff4d4d; }
        .form-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
        .btn-cancel { background: #F2F2F7; border: 1px solid #E5E5EA; color: #8E8E93; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.72rem; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
        .btn-cancel:hover, .btn-cancel:active { color: #636366; }
        .btn-save { background: #ff6b35; border: none; color: #000; font-family: 'Inter', -apple-system, sans-serif; font-size: 0.72rem; padding: 10px 18px; border-radius: 6px; cursor: pointer; }
        .btn-save:hover, .btn-save:active { background: #ff8c5a; }
        .import-body { padding: 14px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .import-textarea { background: #F2F2F7; border: 1px solid #E5E5EA; border-radius: 6px; color: #1C1C1E; font-family: monospace; font-size: 0.72rem; padding: 10px; height: 130px; resize: vertical; outline: none; }
        .import-textarea:focus { border-color: #ff6b35; }
        .import-error { font-size: 0.7rem; color: #ff4d4d; }
        .import-confirm { font-family: 'Inter', -apple-system, sans-serif; font-size: 0.75rem; padding: 12px; background: #ff6b35; border: none; color: #000; border-radius: 6px; cursor: pointer; }
        .import-confirm:hover { background: #ff8c5a; }
      `}</style>

      <div className="app">

        {/* ── DESKTOP HEADER ── */}
        <div className="header">
          <div className="header-brand"><h1>Work<span>out</span></h1></div>
          <button className={`nav-tab ${page === "program" ? "active" : ""}`} onClick={() => setPage("program")}>Programme</button>
          <button className={`nav-tab ${page === "stats" ? "active" : ""}`} onClick={() => setPage("stats")}>Analyse</button>
          <button className={`nav-tab ${page === "library" ? "active" : ""}`} onClick={() => setPage("library")}>Bibliothèque ({Object.keys(db).length})</button>
          <div className="header-spacer" />
          <div className="header-actions">
            <button className="prog-switcher" onClick={() => setModal({ type: "programs" })}>
              <span className="prog-switcher-name">{activeProgName}</span>
              <span className="prog-switcher-chevron">▼</span>
            </button>
            <div className={`save-dot ${saveStatus}`} />
            <button className="hdr-btn hdr-btn-ghost" onClick={() => fileInputRef.current?.click()}>Importer</button>
            <button className="hdr-btn hdr-btn-solid" onClick={exportJSON}>Exporter</button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportFile} />
          </div>
        </div>

        {/* ── MOBILE HEADER ── */}
        <div className="mobile-header">
          <button className="prog-switcher" style={{ maxWidth: "55vw" }} onClick={() => setModal({ type: "programs" })}>
            <span className="prog-switcher-name">{activeProgName}</span>
            <span className="prog-switcher-chevron">▼</span>
          </button>
          <div className="mobile-right">
            <div className={`save-dot ${saveStatus}`} />
            <button className="mob-btn" onClick={() => fileInputRef.current?.click()}>↑</button>
            <button className="mob-btn" onClick={exportJSON}>↓</button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportFile} />
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="content">

          {/* Programme */}
          {page === "program" && (
            <div className="page">
              <div><div className="page-title">Programme</div><span className="page-title-accent" /></div>
              {program.map(day => {
                const isOpen = !collapsedDays[day.id];
                return (
                  <div key={day.id} className="day-card">
                    <div className={`day-header ${isOpen ? "open" : ""}`} onClick={() => toggleCollapse(day.id)}>
                      <span className={`day-collapse-icon ${isOpen ? "open" : ""}`}>›</span>
                      {editingDay === day.id ? (
                        <input className="day-name-input" value={editingDayName} autoFocus
                          onClick={e => e.stopPropagation()}
                          onChange={e => setEditingDayName(e.target.value)}
                          onBlur={() => renameDay(day.id, editingDayName || day.name)}
                          onKeyDown={e => e.key === "Enter" && renameDay(day.id, editingDayName || day.name)} />
                      ) : (
                        <span className="day-name">{day.name}</span>
                      )}
                      <span className="day-count">{day.exercises.length} ex.</span>
                      <button className="day-edit-btn" onClick={e => { e.stopPropagation(); setEditingDay(day.id); setEditingDayName(day.name); }}>✏️</button>
                      <button className="day-del-btn" onClick={e => { e.stopPropagation(); deleteDay(day.id); }}>✕</button>
                    </div>
                    {isOpen && (
                      <div className="ex-list" onDragOver={e => e.preventDefault()} onDrop={() => onDrop(day.id, day.exercises.length)}>
                        {day.exercises.map((ex, idx) => {
                          const data = db[ex.name];
                          return (
                            <div key={ex.id} className="ex-row" draggable
                              onDragStart={() => onDragStart(day.id, idx)}
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => { e.stopPropagation(); onDrop(day.id, idx); }}>
                              <span className="ex-idx">{idx + 1}</span>
                              <div className="ex-info">
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <span className="ex-name">{ex.name}</span>
                                  {data?.tier && <span className="tier-badge" style={{ background: TIER_META[data.tier]?.bg, color: TIER_META[data.tier]?.color, borderColor: TIER_META[data.tier]?.color + "44" }}>{data.tier}</span>}
                                </div>
                                <div className="ex-sub">
                                  <span className="ex-sets-badge">{ex.sets} séries</span>
                                  {data?.primary.map(m => <span key={m} className="muscle-pill" style={{ background: MUSCLE_META[m]?.color + "18", color: MUSCLE_META[m]?.color }}>{m}</span>)}
                                </div>
                              </div>
                              {/* Mobile */}
                              <div className="ex-mob-btns">
                                <div className="sets-ctrl">
                                  <button className="sets-btn" onClick={() => updateSets(day.id, ex.id, ex.sets - 1)}>−</button>
                                  <span className="sets-val">{ex.sets}</span>
                                  <button className="sets-btn" onClick={() => updateSets(day.id, ex.id, ex.sets + 1)}>+</button>
                                </div>
                                <button className="ex-mob-btn" onClick={() => { setModal({ type: "replace", dayId: day.id, exId: ex.id }); setSearch(""); }}>⇄</button>
                                <button className="ex-mob-btn del" onClick={() => deleteExercise(day.id, ex.id)}>✕</button>
                              </div>
                              {/* Desktop */}
                              <div className="sets-ctrl icon-btn" style={{ cursor: "default", gap: "3px" }}>
                                <button className="sets-btn" onClick={() => updateSets(day.id, ex.id, ex.sets - 1)}>−</button>
                                <span className="sets-val">{ex.sets}</span>
                                <button className="sets-btn" onClick={() => updateSets(day.id, ex.id, ex.sets + 1)}>+</button>
                              </div>
                              <button className="icon-btn" onClick={() => moveExercise(day.id, idx, -1)}>↑</button>
                              <button className="icon-btn rep" onClick={() => { setModal({ type: "replace", dayId: day.id, exId: ex.id }); setSearch(""); }}>⇄</button>
                              <button className="icon-btn del" onClick={() => deleteExercise(day.id, ex.id)}>✕</button>
                              <span className="ex-chevron">›</span>
                            </div>
                          );
                        })}
                        <button className="add-ex-btn" onClick={() => { setModal({ type: "add", dayId: day.id }); setSearch(""); }}>
                          + Ajouter un exercice
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <button className="add-day-btn" onClick={addDay}>+ Ajouter une séance</button>
            </div>
          )}

          {/* Stats — mobile standalone, hidden on desktop in favour of sidebar */}
          {page === "stats" && (
            <div className="page">
              <div><div className="page-title">Analyse</div><span className="page-title-accent" /></div>
              {renderAnalysisContent()}
            </div>
          )}

          {/* Desktop sidebar — always shown alongside Programme */}
          {page === "program" && (
            <div style={{ padding: 20, background: "#080808", borderLeft: "1px solid #1e1e1e", display: "none" }} className="desktop-sidebar">
              {/* shown via CSS below */}
            </div>
          )}

          {/* Library */}
          {page === "library" && (
            <div className="page">
              <div><div className="page-title">Bibliothèque</div><span className="page-title-accent" /></div>
              <div className="lib-toolbar">
                <input className="lib-search" placeholder="Rechercher..." value={libSearch} onChange={e => setLibSearch(e.target.value)} />
                <select className="lib-select" value={libMuscle} onChange={e => setLibMuscle(e.target.value)}>
                  <option>Tous</option>
                  {ALL_MUSCLES.map(m => <option key={m}>{m}</option>)}
                </select>
                <select className="lib-select" value={libTier} onChange={e => setLibTier(e.target.value)}>
                  <option>Tous</option>
                  {TIER_ORDER.map(t => <option key={t}>{t}</option>)}
                </select>
                <span className="lib-count">{filteredLib.length}/{Object.keys(db).length}</span>
                <button className="lib-add-btn" onClick={openAddEx}>+ Nouveau</button>
              </div>
              <div>
                {filteredLib.length === 0 && <div className="lib-empty">Aucun exercice trouvé.</div>}
                {filteredLib.map(name => {
                  const d = db[name];
                  return (
                    <div key={name} className="lib-ex-row" onClick={() => openEditEx(name)}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="lib-ex-name">{name}</span>
                          {d.tier && <span className="tier-badge" style={{ background: TIER_META[d.tier]?.bg, color: TIER_META[d.tier]?.color, borderColor: TIER_META[d.tier]?.color + "44" }}>{d.tier}</span>}
                        </div>
                        <div className="lib-ex-sub">
                          {d.primary.map(m => <span key={m} className="muscle-pill" style={{ background: MUSCLE_META[m]?.color + "18", color: MUSCLE_META[m]?.color }}>{m}</span>)}
                          {d.secondary.map(m => <span key={m} style={{ color: "#444", fontSize: "0.58rem" }}>{m} ½</span>)}
                        </div>
                      </div>
                      <div className="lib-actions" onClick={e => e.stopPropagation()}>
                        <button className="lib-btn edit" onClick={() => openEditEx(name)}>✏️</button>
                        <button className="lib-btn del" onClick={() => deleteEx(name)}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="bottom-nav">
          <button className={`bnav-btn ${page === "program" ? "active" : ""}`} onClick={() => setPage("program")}>
            <span className="bnav-icon">📋</span><span className="bnav-label">Programme</span>
          </button>
          <button className={`bnav-btn ${page === "stats" ? "active" : ""}`} onClick={() => setPage("stats")}>
            <span className="bnav-icon">📊</span><span className="bnav-label">Analyse</span>
          </button>
          <button className={`bnav-btn ${page === "library" ? "active" : ""}`} onClick={() => setPage("library")}>
            <span className="bnav-icon">📚</span><span className="bnav-label">Biblio</span>
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className={`modal ${modal.type === "editEx" ? "modal-lg" : ""}`} onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">
                {modal.type === "replace" ? "Remplacer" : modal.type === "add" ? "Ajouter un exercice"
                  : modal.type === "import" ? "Importer" : modal.type === "programs" ? "Mes programmes"
                  : modal.type === "progForm" ? (editingProgId ? "Renommer" : "Nouveau programme")
                  : modal.type === "editEx" && exFormOldName ? "Modifier l'exercice" : "Nouvel exercice"}
              </span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {(modal.type === "add" || modal.type === "replace") && <>
              <div className="modal-search-wrap">
                <input ref={searchRef} className="modal-search" placeholder="Rechercher un exercice..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="ex-picker">
                {filteredPicker.length === 0
                  ? <div style={{ padding: "20px", color: "#555", fontSize: "0.8rem", textAlign: "center" }}>Aucun résultat</div>
                  : filteredPicker.map(name => {
                    const d = db[name];
                    return (
                      <div key={name} className="ex-option" onClick={() => pickExercise(name)}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ex-opt-name">{name}</div>
                          <div className="ex-opt-sub">{d.primary.join(", ")}{d.secondary.length > 0 ? ` · ${d.secondary.join(", ")} ½` : ""}</div>
                        </div>
                        {d.tier && <span className="tier-badge" style={{ background: TIER_META[d.tier]?.bg, color: TIER_META[d.tier]?.color, borderColor: TIER_META[d.tier]?.color + "44" }}>{d.tier}</span>}
                      </div>
                    );
                  })}
              </div>
              <div className="picker-footer" />
            </>}

            {modal.type === "programs" && <>
              <div className="prog-list">
                {programs.map(p => (
                  <div key={p.id} className={`prog-item ${p.id === activeProgramId ? "active-prog" : ""}`} onClick={() => switchProgram(p.id)}>
                    <div className="prog-checkmark">{p.id === activeProgramId ? "✓" : ""}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="prog-item-name">{p.name}</div>
                      <div className="prog-item-days">{p.days.length} jour{p.days.length !== 1 ? "s" : ""} · {p.days.reduce((n, d) => n + d.exercises.length, 0)} exercices</div>
                    </div>
                    <div className="prog-item-actions" onClick={e => e.stopPropagation()}>
                      <button className="prog-icon-btn" onClick={() => openEditProgram(p.id)}>✏️</button>
                      <button className="prog-icon-btn" onClick={() => duplicateProgram(p.id)}>📋</button>
                      <button className="prog-icon-btn" onClick={() => deleteProgram(p.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="prog-footer">
                <button className="prog-new-btn" onClick={() => { setModal(null); setTimeout(openNewProgram, 50); }}>+ Nouveau programme</button>
              </div>
            </>}

            {modal.type === "progForm" && (
              <div className="modal-form">
                <div>
                  <label className="form-label">{editingProgId ? "Nouveau nom" : "Nom du programme"}</label>
                  <input className="form-input" autoFocus value={progFormName} onChange={e => setProgFormName(e.target.value)}
                    placeholder="Ex: PPL, Full Body..." onKeyDown={e => e.key === "Enter" && saveProgForm()} />
                </div>
                {progFormError && <div className="form-error">{progFormError}</div>}
                <div className="form-footer">
                  <button className="btn-cancel" onClick={() => setModal(null)}>Annuler</button>
                  <button className="btn-save" onClick={saveProgForm}>{editingProgId ? "Renommer" : "Créer"}</button>
                </div>
              </div>
            )}

            {modal.type === "import" && (
              <div className="import-body">
                <div style={{ fontSize: "0.8rem", color: "#555" }}>Confirmer le remplacement du programme et de la bibliothèque ?</div>
                <textarea className="import-textarea" value={importText} onChange={e => setImportText(e.target.value)} spellCheck={false} />
                {importError && <div className="import-error">{importError}</div>}
                <button className="import-confirm" onClick={confirmImport}>Confirmer</button>
              </div>
            )}

            {modal.type === "editEx" && (
              <div className="modal-form">
                <div>
                  <label className="form-label">Nom</label>
                  <input className="form-input" value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Curl pupitre haltère" />
                </div>
                <div>
                  <label className="form-label">Note Nippard</label>
                  <select className="form-select" value={exForm.tier} onChange={e => setExForm(f => ({ ...f, tier: e.target.value }))}>
                    {TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="">— Non noté</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Muscles principaux</label>
                  <div className="muscle-grid">
                    {ALL_MUSCLES.map(m => (
                      <button key={m} className={`muscle-toggle ${exForm.primary.includes(m) ? "active-primary" : ""}`}
                        style={{ "--mc": MUSCLE_META[m].color }}
                        onClick={() => setExForm(f => ({ ...f, primary: toggleMuscle(f.primary, m), secondary: f.secondary.filter(x => x !== m) }))}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Muscles secondaires</label>
                  <div className="muscle-grid">
                    {ALL_MUSCLES.filter(m => !exForm.primary.includes(m)).map(m => (
                      <button key={m} className={`muscle-toggle ${exForm.secondary.includes(m) ? "active-secondary" : ""}`}
                        onClick={() => setExForm(f => ({ ...f, secondary: toggleMuscle(f.secondary, m) }))}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {exFormError && <div className="form-error">{exFormError}</div>}
                <div className="form-footer">
                  <button className="btn-cancel" onClick={() => setModal(null)}>Annuler</button>
                  <button className="btn-save" onClick={saveExForm}>Sauvegarder</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  function renderMuscleRows() {
    return ALL_MUSCLES.map(muscle => {
      const sets = muscleSets[muscle];
      const { min, max } = RECOMMENDED_SETS[muscle];
      const prio = musclePriorities[muscle];
      const status = getStatus(sets, muscle, prio);
      const targetInfo = getTarget(muscle, prio);
      const color = MUSCLE_META[muscle].color;
      const barMax = Math.max(max + 4, sets + 4, 1);
      const targetPct = targetInfo ? Math.min(100, (targetInfo.target / barMax) * 100) : null;
      const prioLabel = prio === "priority" ? "🎯" : prio === "maintain" ? "🔒" : null;

      return (
        <div key={muscle} className="muscle-row" style={{ marginBottom: 14 }}>
          <div className="muscle-info">
            <div className="muscle-name-row">
              <span style={{ fontSize: "1rem" }}>{MUSCLE_META[muscle].emoji}</span>
              <span className="muscle-label">{muscle}</span>
              {prioLabel && <span style={{ fontSize: "0.75rem" }}>{prioLabel}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {min > 0 && <span className="status-badge" style={{ background: statusColor[status] + "20", color: statusColor[status] }}>{statusLabel[status]}</span>}
              <span className="muscle-sets">{sets % 1 === 0 ? sets : sets.toFixed(1)}{targetInfo ? ` / ${targetInfo.target}` : ""}</span>
            </div>
          </div>
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: `${Math.min(100, (sets / barMax) * 100)}%`, background: color, opacity: status === "over" ? 0.5 : 1 }} />
            {min > 0 && <div className="bar-marker" style={{ left: `${(min / barMax) * 100}%`, background: "#C7C7CC" }} />}
            {max > 0 && <div className="bar-marker" style={{ left: `${(max / barMax) * 100}%`, background: "#E5E5EA" }} />}
            {targetPct !== null && (
              <div style={{ position: "absolute", top: -4, left: `${targetPct}%`, width: 2, height: 14, background: targetInfo.color, borderRadius: 1, transform: "translateX(-50%)" }} />
            )}
          </div>
        </div>
      );
    });
  }

  function renderAnalysisContent() {
    const PRIO_OPTIONS = [
      { value: "priority", label: "🎯 Priorité", desc: "Développer", bg: "#EBF4FF", color: "#007AFF" },
      { value: "balanced", label: "⚖️ Équilibré", desc: "Standard", bg: "#F2F2F7", color: "#3A3A3C" },
      { value: "maintain", label: "🔒 Maintien", desc: "Conserver", bg: "#F2F2F7", color: "#8E8E93" },
    ];

    return (
      <>
        {/* Priorities card */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="analysis-label">Objectifs musculaires</div>
              <div style={{ fontSize: "0.75rem", color: "#8E8E93", marginTop: 2 }}>
                Définis tes priorités pour adapter l'analyse
              </div>
            </div>
            {hasPriorities && (
              <button onClick={resetPriorities} style={{ background: "none", border: "none", color: "#007AFF", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "4px 0" }}>
                Tout équilibré
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ALL_MUSCLES.map(muscle => {
              const prio = musclePriorities[muscle];
              return (
                <div key={muscle} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1rem", width: 22, flexShrink: 0 }}>{MUSCLE_META[muscle].emoji}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#1C1C1E", flex: 1, minWidth: 0 }}>{muscle}</span>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {PRIO_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setPriority(muscle, opt.value)}
                        style={{
                          background: prio === opt.value ? opt.color : "#F2F2F7",
                          color: prio === opt.value ? "#fff" : "#8E8E93",
                          border: "none", borderRadius: 10, padding: "5px 10px",
                          fontSize: "0.7rem", fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit", transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="ai-card">
          <div className="ai-header">
            <div className="ai-title">🤖 Analyse IA</div>
            <button className="ai-generate-btn" onClick={generateAnalysis} disabled={aiLoading}>
              {aiLoading ? "Analyse..." : aiAnalysis ? "Relancer" : "Analyser"}
            </button>
          </div>
          {aiLoading && (
            <div className="ai-loading">
              <div className="ai-spinner" />
              Analyse du programme en cours...
            </div>
          )}
          {!aiLoading && !aiAnalysis && (
            <div style={{ fontSize: "0.82rem", color: "#8E8E93", lineHeight: 1.6 }}>
              Lance l'analyse pour obtenir un résumé personnalisé basé sur tes objectifs musculaires.
            </div>
          )}
          {!aiLoading && aiAnalysis && (
            <div className="ai-text">{aiAnalysis}</div>
          )}
        </div>

        {/* Volume bars */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="analysis-label">Volume hebdomadaire</div>
          </div>
          {renderMuscleRows()}
          <div className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[{c: "#34C759", l: "OPTIMAL — dans la fourchette cible"}, {c: "#FF9500", l: "BON — en dessous de la cible"}, {c: "#FF3B30", l: "EXCESSIF — au-delà du volume max"}].map(({c, l}) => (
              <div key={l} className="legend-row"><div className="legend-dot" style={{ background: c }} /><span style={{ fontSize: "0.72rem", color: "#8E8E93" }}>{l}</span></div>
            ))}
            <div className="legend-row">
              <div style={{ width: 8, height: 8, borderRadius: 1, background: "#007AFF", flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", color: "#8E8E93" }}>Trait coloré = cible selon ton objectif</span>
            </div>
          </div>
        </div>
      </>
    );
  }
}
