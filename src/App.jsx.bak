import { useState, useRef, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const COLOR = {
  accent:       "#E8500A",
  accentDark:   "#C94209",
  accentBg:     "#FFF3EE",
  bg:           "#F2F2F7",
  surface:      "#FFFFFF",
  border:       "#D1D1D6",
  borderLight:  "#E5E5EA",
  text:         "#1C1C1E",
  textSecond:   "#3A3A3C",
  textMuted:    "#6B6B6B",
  textFaint:    "#8E8E93",
  textDisabled: "#AEAEB2",
  green:        "#22C55E",
  red:          "#EF4444",
  blue:         "#1D4ED8",
};

// Séries hebdomadaires : 1-5 = Maintien, 6-12 = Optimal, 13+ = Max
const VOLUME_THRESHOLDS = { maintain: 5, optimal: 12 };
const BAR_SCALE_MAX = 16;
const MIN_SETS = 1;
const MAX_SETS = 20;

// ─── DONNÉES EXERCICES ────────────────────────────────────────────────────────

const TIER_DISPLAY = {
  "S+": { color: "#B45309", bg: "#FEF3C7" },
  "S":  { color: "#92400E", bg: "#FDE68A" },
  "A+": { color: "#166534", bg: "#DCFCE7" },
  "A":  { color: "#15803D", bg: "#D1FAE5" },
  "B+": { color: "#1E40AF", bg: "#DBEAFE" },
  "B":  { color: "#1D4ED8", bg: "#EFF6FF" },
  "C":  { color: "#6B7280", bg: "#F3F4F6" },
  "D":  { color: "#9CA3AF", bg: "#F9FAFB" },
  "F":  { color: "#DC2626", bg: "#FEF2F2" },
  "F-": { color: "#991B1B", bg: "#FEE2E2" },
};

const TIER_SORT_ORDER = ["S+", "S", "A+", "A", "B+", "B", "C", "D", "F", "F-"];

const EXERCISE_DB = {
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
  "Nordic curl":                     { tier: "S+", primary: ["Ischio-jambiers"], secondary: [] },
  "Leg curl assis":                  { tier: "S",  primary: ["Ischio-jambiers"], secondary: [] },
  "Leg curl couché":                 { tier: "A",  primary: ["Ischio-jambiers"], secondary: [] },
  "Soulevé de terre jambes tendues": { tier: "B",  primary: ["Ischio-jambiers", "Fessiers"], secondary: ["Dos"] },
  "Good morning":                    { tier: "B",  primary: ["Ischio-jambiers", "Dos"], secondary: ["Fessiers"] },
  "Mollets assis":                   { tier: "S",  primary: ["Mollets"], secondary: [] },
  "Mollets debout":                  { tier: "A",  primary: ["Mollets"], secondary: [] },
  "Mollets presse":                  { tier: "A",  primary: ["Mollets"], secondary: [] },
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
  "Trapèzes", "Abdominaux", "Avant-bras",
];

const MUSCLE_COLOR = {
  "Pectoraux": "#FF4444", "Dos": "#3B82F6", "Épaules": "#F59E0B",
  "Biceps": "#22C55E", "Triceps": "#A855F7", "Quadriceps": "#EC4899",
  "Ischio-jambiers": "#FB923C", "Fessiers": "#06B6D4", "Mollets": "#84CC16",
  "Trapèzes": "#8B5CF6", "Abdominaux": "#14B8A6", "Avant-bras": "#D946EF",
};

const MUSCLE_EMOJI = {
  "Pectoraux": "💪", "Dos": "🔷", "Épaules": "⚡", "Biceps": "💚",
  "Triceps": "💜", "Quadriceps": "🦵", "Ischio-jambiers": "🔶",
  "Fessiers": "🔵", "Mollets": "🟢", "Trapèzes": "🔮",
  "Abdominaux": "⬜", "Avant-bras": "🦾",
};

// ─── PROGRAMME DÉMO ───────────────────────────────────────────────────────────

const DEMO_PROGRAM = [
  { id: "d1", name: "Push — A", exercises: [
    { id: "e1", name: "Développé couché barre",       sets: 4 },
    { id: "e2", name: "Développé incliné haltères",   sets: 3 },
    { id: "e3", name: "Développé militaire barre",    sets: 3 },
    { id: "e4", name: "Élévations latérales câble",   sets: 4 },
    { id: "e5", name: "Extension triceps câble barre",sets: 3 },
  ]},
  { id: "d2", name: "Pull — B", exercises: [
    { id: "e6",  name: "Tractions lestées",            sets: 4 },
    { id: "e7",  name: "Rowing buste appuyé",          sets: 4 },
    { id: "e8",  name: "Tirage vertical prise neutre", sets: 3 },
    { id: "e9",  name: "Curl barre EZ",                sets: 3 },
    { id: "e10", name: "Curl marteau",                 sets: 3 },
  ]},
  { id: "d3", name: "Legs — C", exercises: [
    { id: "e11", name: "Squat barre",              sets: 4 },
    { id: "e12", name: "Soulevé de terre Roumain", sets: 3 },
    { id: "e13", name: "Leg extension",            sets: 3 },
    { id: "e14", name: "Leg curl assis",           sets: 3 },
    { id: "e15", name: "Mollets debout",           sets: 4 },
  ]},
];

// ─── FONCTIONS PURES ──────────────────────────────────────────────────────────

let nextId = 200;
function generateId() { return `x${nextId++}`; }

function createProgram(name) {
  return { id: generateId(), name, days: [] };
}

// Retourne un objet vide pour le formulaire d'exercice.
// Fonction (pas constante) pour éviter toute mutation partagée.
function emptyExerciseForm() {
  return { name: "", tier: "A", primary: [], secondary: [] };
}

// Volume hebdomadaire par muscle. Les muscles secondaires comptent 0.5 série.
function computeWeeklyVolume(days, exerciseDb) {
  const volume = Object.fromEntries(ALL_MUSCLES.map(m => [m, 0]));
  days.forEach(day =>
    day.exercises.forEach(ex => {
      const data = exerciseDb[ex.name];
      if (!data) return;
      data.primary.forEach(m   => { if (m in volume) volume[m] += ex.sets; });
      data.secondary.forEach(m => { if (m in volume) volume[m] += ex.sets * 0.5; });
    })
  );
  return volume;
}

function classifyVolume(sets) {
  if (sets === 0) return "neutral";
  if (sets <= VOLUME_THRESHOLDS.maintain) return "maintain";
  if (sets <= VOLUME_THRESHOLDS.optimal)  return "ok";
  return "over";
}

function getVolumeTarget(musclePriority) {
  if (musclePriority === "priority") return { sets: 12, color: COLOR.accent };
  if (musclePriority === "maintain") return { sets: 4,  color: COLOR.textDisabled };
  return                                    { sets: 9,  color: COLOR.green };
}

function sortExercisesByTier(names, exerciseDb) {
  return [...names].sort((a, b) =>
    TIER_SORT_ORDER.indexOf(exerciseDb[a]?.tier ?? "C") -
    TIER_SORT_ORDER.indexOf(exerciseDb[b]?.tier ?? "C")
  );
}

function toggleArrayItem(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ─── CONSTANTES D'AFFICHAGE ───────────────────────────────────────────────────

const VOLUME_STATUS_COLOR = {
  neutral:  COLOR.textDisabled,
  maintain: COLOR.textDisabled,
  ok:       COLOR.green,
  over:     COLOR.red,
};

const VOLUME_STATUS_LABEL = {
  neutral:  "—",
  maintain: "MAINTIEN",
  ok:       "OPTIMAL",
  over:     "MAX",
};

const MUSCLE_PRIORITY_OPTIONS = [
  { value: "priority", label: "🎯 Priorité",  activeBg: COLOR.accentBg, activeColor: COLOR.accentDark, activeBorder: COLOR.accent },
  { value: "balanced", label: "⚖️ Équilibré", activeBg: "#E5E5EA",      activeColor: COLOR.text,       activeBorder: COLOR.textDisabled },
  { value: "maintain", label: "🔒 Maintien",  activeBg: "#EFF6FF",      activeColor: COLOR.blue,       activeBorder: "#60A5FA" },
];

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function WorkoutBuilder() {

  const [programs, setPrograms] = useState([
    { id: "p1", name: "Mon Programme", days: DEMO_PROGRAM },
  ]);
  const [activeProgramId, setActiveProgramId] = useState("p1");

  const activeDays = programs.find(p => p.id === activeProgramId)?.days ?? [];
  const activeProgram = programs.find(p => p.id === activeProgramId);
  const activeProgramName = activeProgram?.name ?? "—";

  function updateActiveDays(updaterFn) {
    setPrograms(all => all.map(p =>
      p.id !== activeProgramId
        ? p
        : { ...p, days: updaterFn(p.days.map(d => ({ ...d, exercises: [...d.exercises] }))) }
    ));
  }

  const [exerciseDb, setExerciseDb] = useState(EXERCISE_DB);
  const [currentPage, setCurrentPage] = useState("program");
  const [modal, setModal] = useState(null);
  function closeModal() { setModal(null); }

  const [exerciseForm, setExerciseForm]               = useState(emptyExerciseForm);
  const [editingExerciseName, setEditingExerciseName] = useState(null);
  const [exerciseFormError, setExerciseFormError]     = useState("");

  const [programFormName, setProgramFormName]   = useState("");
  const [programFormError, setProgramFormError] = useState("");
  const [editingProgramId, setEditingProgramId] = useState(null);

  const [renamingDayId, setRenamingDayId]     = useState(null);
  const [renamingDayName, setRenamingDayName] = useState("");

  const [collapsedDayIds, setCollapsedDayIds] = useState({});
  function toggleDayCollapse(dayId) {
    setCollapsedDayIds(s => ({ ...s, [dayId]: !s[dayId] }));
  }

  const [dragSource, setDragSource] = useState(null);

  const [pickerSearch, setPickerSearch]           = useState("");
  const [libSearch, setLibSearch]                 = useState("");
  const [libMuscleFilter, setLibMuscleFilter]     = useState("Tous");
  const [libTierFilter, setLibTierFilter]         = useState("Tous");

  const [importText, setImportText]   = useState("");
  const [importError, setImportError] = useState("");

  const [musclePriorities, setMusclePriorities] = useState(
    Object.fromEntries(ALL_MUSCLES.map(m => [m, "balanced"]))
  );
  function setMusclePriority(muscle, priority) {
    setMusclePriorities(prev => ({ ...prev, [muscle]: priority }));
  }
  function resetAllMusclePriorities() {
    setMusclePriorities(Object.fromEntries(ALL_MUSCLES.map(m => [m, "balanced"])));
  }
  const hasMusclesWithCustomPriority = Object.values(musclePriorities).some(v => v !== "balanced");

  const [aiAnalysisText, setAiAnalysisText]       = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  const [saveStatus, setSaveStatus] = useState("idle");
  const saveStatusTimerRef  = useRef(null);
  const programSaveTimerRef = useRef(null);
  const dbSaveTimerRef      = useRef(null);
  const prioSaveTimerRef    = useRef(null);
  const pickerSearchInputRef = useRef(null);
  const fileInputRef         = useRef(null);

  const weeklyVolume = computeWeeklyVolume(activeDays, exerciseDb);

  const pickerExercises = sortExercisesByTier(
    Object.keys(exerciseDb).filter(n => n.toLowerCase().includes(pickerSearch.toLowerCase())),
    exerciseDb
  );

  const libraryExercises = sortExercisesByTier(
    Object.keys(exerciseDb).filter(name => {
      const data = exerciseDb[name];
      return (
        name.toLowerCase().includes(libSearch.toLowerCase()) &&
        (libMuscleFilter === "Tous" || data.primary.includes(libMuscleFilter) || data.secondary.includes(libMuscleFilter)) &&
        (libTierFilter   === "Tous" || data.tier === libTierFilter)
      );
    }),
    exerciseDb
  );

  // ── Chargement localStorage ──────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("workout-programs") || "null");
      if (saved?.programs?.length) {
        setPrograms(saved.programs);
        setActiveProgramId(saved.activeProgramId ?? saved.programs[0].id);
      } else {
        // Migration depuis l'ancien format (programme unique)
        const legacy = JSON.parse(localStorage.getItem("workout-program") || "null");
        if (legacy?.days) setPrograms([{ id: "p1", name: "Mon Programme", days: legacy.days }]);
      }
    } catch (_) {}
    try {
      const savedDb = JSON.parse(localStorage.getItem("workout-db") || "null");
      if (savedDb) setExerciseDb(savedDb);
    } catch (_) {}
    try {
      const savedPriorities = JSON.parse(localStorage.getItem("workout-priorities") || "null");
      if (savedPriorities) setMusclePriorities(prev => ({ ...prev, ...savedPriorities }));
    } catch (_) {}
  }, []);

  // ── Auto-sauvegarde ──────────────────────────────────────────────────────

  useEffect(() => {
    clearTimeout(programSaveTimerRef.current);
    programSaveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      try {
        localStorage.setItem("workout-programs", JSON.stringify({ programs, activeProgramId }));
        setSaveStatus("saved");
        clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (_) { setSaveStatus("error"); }
    }, 800);
    return () => clearTimeout(programSaveTimerRef.current);
  }, [programs, activeProgramId]);

  useEffect(() => {
    clearTimeout(dbSaveTimerRef.current);
    dbSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem("workout-db", JSON.stringify(exerciseDb)); } catch (_) {}
    }, 800);
    return () => clearTimeout(dbSaveTimerRef.current);
  }, [exerciseDb]);

  useEffect(() => {
    clearTimeout(prioSaveTimerRef.current);
    prioSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem("workout-priorities", JSON.stringify(musclePriorities)); } catch (_) {}
    }, 600);
    return () => clearTimeout(prioSaveTimerRef.current);
  }, [musclePriorities]);

  // Focus automatique sur la recherche quand le picker s'ouvre
  useEffect(() => {
    if (modal?.type === "addExercise" || modal?.type === "replaceExercise") {
      setTimeout(() => pickerSearchInputRef.current?.focus(), 50);
    }
  }, [modal]);

  // ── Export / Import ──────────────────────────────────────────────────────

  function downloadBackup() {
    const json = JSON.stringify({ programs, activeProgramId, db: exerciseDb }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workout-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImportText(ev.target.result);
      setImportError("");
      setModal({ type: "import" });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function confirmImport() {
    try {
      const data = JSON.parse(importText);
      if (data.programs) {
        setPrograms(data.programs);
        setActiveProgramId(data.activeProgramId ?? data.programs[0].id);
      } else if (data.days) {
        setPrograms(prev => [...prev, { id: generateId(), name: "Programme importé", days: data.days }]);
      } else {
        throw new Error("Format non reconnu");
      }
      if (data.db) setExerciseDb(data.db);
      setImportText("");
      closeModal();
    } catch (err) {
      setImportError("Fichier invalide : " + err.message);
    }
  }

  // ── Gestion des programmes ───────────────────────────────────────────────

  function openCreateProgramModal() {
    setProgramFormName(""); setProgramFormError(""); setEditingProgramId(null);
    setModal({ type: "programForm" });
  }

  function openRenameProgramModal(programId) {
    const prog = programs.find(p => p.id === programId);
    setProgramFormName(prog?.name ?? ""); setProgramFormError(""); setEditingProgramId(programId);
    setModal({ type: "programForm" });
  }

  function saveProgramForm() {
    const name = programFormName.trim();
    if (!name) { setProgramFormError("Donne un nom à ce programme."); return; }
    if (editingProgramId) {
      setPrograms(all => all.map(p => p.id === editingProgramId ? { ...p, name } : p));
    } else {
      const newProg = createProgram(name);
      setPrograms(all => [...all, newProg]);
      setActiveProgramId(newProg.id);
    }
    closeModal();
  }

  function duplicateProgram(programId) {
    const source = programs.find(p => p.id === programId);
    if (!source) return;
    const copy = { id: generateId(), name: `${source.name} (copie)`, days: JSON.parse(JSON.stringify(source.days)) };
    setPrograms(all => [...all, copy]);
    setActiveProgramId(copy.id);
    closeModal();
  }

  function deleteProgram(programId) {
    if (programs.length === 1) { alert("Impossible de supprimer le seul programme."); return; }
    if (!window.confirm("Supprimer ce programme ?")) return;
    setPrograms(all => all.filter(p => p.id !== programId));
    if (activeProgramId === programId)
      setActiveProgramId(programs.find(p => p.id !== programId)?.id ?? "");
  }

  function switchToProgram(programId) { setActiveProgramId(programId); closeModal(); }

  // ── Gestion des séances ──────────────────────────────────────────────────

  function addDay() {
    updateActiveDays(days => [
      ...days,
      { id: generateId(), name: `Séance ${days.length + 1}`, exercises: [] },
    ]);
  }

  function deleteDay(dayId) {
    updateActiveDays(days => days.filter(d => d.id !== dayId));
  }

  function commitDayRename(dayId, newName) {
    updateActiveDays(days => days.map(d => d.id !== dayId ? d : { ...d, name: newName }));
    setRenamingDayId(null);
  }

  // ── Gestion des exercices dans une séance ────────────────────────────────

  function addExerciseToDay(dayId, exerciseName) {
    updateActiveDays(days => days.map(d =>
      d.id !== dayId ? d : {
        ...d, exercises: [...d.exercises, { id: generateId(), name: exerciseName, sets: 3 }],
      }
    ));
    setPickerSearch(""); closeModal();
  }

  function replaceExerciseInDay(dayId, exerciseId, newName) {
    updateActiveDays(days => days.map(d =>
      d.id !== dayId ? d : {
        ...d, exercises: d.exercises.map(e => e.id !== exerciseId ? e : { ...e, name: newName }),
      }
    ));
    setPickerSearch(""); closeModal();
  }

  function deleteExerciseFromDay(dayId, exerciseId) {
    updateActiveDays(days => days.map(d =>
      d.id !== dayId ? d : { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) }
    ));
  }

  function moveExerciseUp(dayId, exerciseIndex) {
    if (exerciseIndex === 0) return;
    updateActiveDays(days => days.map(d => {
      if (d.id !== dayId) return d;
      const exs = [...d.exercises];
      [exs[exerciseIndex - 1], exs[exerciseIndex]] = [exs[exerciseIndex], exs[exerciseIndex - 1]];
      return { ...d, exercises: exs };
    }));
  }

  function updateExerciseSets(dayId, exerciseId, newSets) {
    updateActiveDays(days => days.map(d =>
      d.id !== dayId ? d : {
        ...d, exercises: d.exercises.map(e =>
          e.id !== exerciseId ? e : { ...e, sets: clamp(Number(newSets), MIN_SETS, MAX_SETS) }
        ),
      }
    ));
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────

  function handleDragStart(dayId, exerciseIndex) {
    setDragSource({ dayId, exerciseIndex });
  }

  function handleDropOnExercise(targetDayId, targetIndex) {
    if (!dragSource) return;
    const { dayId: sourceDayId, exerciseIndex: sourceIndex } = dragSource;
    updateActiveDays(days => {
      let moved = null;
      const withoutSource = days.map(d => {
        if (d.id !== sourceDayId) return d;
        const exs = [...d.exercises];
        [moved] = exs.splice(sourceIndex, 1);
        return { ...d, exercises: exs };
      });
      return withoutSource.map(d => {
        if (d.id !== targetDayId) return d;
        const exs = [...d.exercises];
        exs.splice(targetIndex, 0, moved);
        return { ...d, exercises: exs };
      });
    });
    setDragSource(null);
  }

  // ── Bibliothèque d'exercices ─────────────────────────────────────────────

  function openAddExerciseToDbModal() {
    setExerciseForm(emptyExerciseForm()); setEditingExerciseName(null);
    setExerciseFormError(""); setModal({ type: "editExerciseInDb" });
  }

  function openEditExerciseInDbModal(exerciseName) {
    setExerciseForm({ name: exerciseName, ...exerciseDb[exerciseName] });
    setEditingExerciseName(exerciseName); setExerciseFormError("");
    setModal({ type: "editExerciseInDb" });
  }

  function deleteExerciseFromDb(exerciseName) {
    if (!window.confirm(`Supprimer « ${exerciseName} » de la bibliothèque ?`)) return;
    setExerciseDb(db => { const u = { ...db }; delete u[exerciseName]; return u; });
  }

  function saveExerciseForm() {
    const name = exerciseForm.name.trim();
    if (!name)                                    { setExerciseFormError("Le nom est obligatoire."); return; }
    if (!exerciseForm.primary.length)             { setExerciseFormError("Sélectionne au moins un muscle principal."); return; }
    if (!editingExerciseName && exerciseDb[name]) { setExerciseFormError("Un exercice avec ce nom existe déjà."); return; }
    setExerciseDb(db => {
      const u = { ...db };
      if (editingExerciseName && editingExerciseName !== name) delete u[editingExerciseName];
      u[name] = { tier: exerciseForm.tier, primary: exerciseForm.primary, secondary: exerciseForm.secondary };
      return u;
    });
    closeModal();
  }

  // ── Analyse IA ───────────────────────────────────────────────────────────

  async function generateAiAnalysis() {
    setAiAnalysisLoading(true); setAiAnalysisText(null);
    const programSummary = activeProgram?.days
      .map(d => `${d.name}: ${d.exercises.map(e => `${e.name} (${e.sets} séries)`).join(", ")}`)
      .join("\n");
    const volumeSummary = Object.entries(weeklyVolume)
      .filter(([, v]) => v > 0)
      .map(([muscle, sets]) => {
        const p = musclePriorities[muscle];
        return `${muscle}: ${sets} séries${p === "priority" ? " 🎯" : p === "maintain" ? " 🔒" : ""}`;
      }).join(", ");
    const priorityContext = hasMusclesWithCustomPriority
      ? `\nObjectifs :\n- Priorité : ${ALL_MUSCLES.filter(m => musclePriorities[m] === "priority").join(", ") || "aucun"}\n- Maintien : ${ALL_MUSCLES.filter(m => musclePriorities[m] === "maintain").join(", ") || "aucun"}`
      : "\nObjectif : programme équilibré.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Tu es un coach musculation. Analyse ce programme en français, de façon directe et concise.\n\nProgramme "${activeProgram?.name}" :\n${programSummary}\n\nVolume par groupe musculaire (séries/semaine) :\n${volumeSummary}\n${priorityContext}\n\n3-4 paragraphes courts : adéquation volume/objectifs, équilibres push/pull, ajustements concrets, recommandation actionnable. Pas de titres. Max 220 mots.` }],
        }),
      });
      const data = await res.json();
      setAiAnalysisText(data.content?.[0]?.text ?? "Analyse indisponible.");
    } catch { setAiAnalysisText("Erreur de connexion. Réessaie."); }
    setAiAnalysisLoading(false);
  }

  // ─── SOUS-RENDUS ──────────────────────────────────────────────────────────

  function renderTierBadge(tier) {
    if (!tier || !TIER_DISPLAY[tier]) return null;
    const { color, bg } = TIER_DISPLAY[tier];
    return (
      <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 5,
        letterSpacing: "0.3px", whiteSpace: "nowrap", flexShrink: 0,
        border: `1px solid ${color}44`, background: bg, color }}>
        {tier}
      </span>
    );
  }

  function renderMusclePills(primaryMuscles, secondaryMuscles = []) {
    return (
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginTop: 5 }}>
        {primaryMuscles.map(m => (
          <span key={m} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 7px",
            borderRadius: 5, background: MUSCLE_COLOR[m] + "18", color: MUSCLE_COLOR[m] }}>
            {m}
          </span>
        ))}
        {secondaryMuscles.map(m => (
          <span key={m} style={{ fontSize: "0.62rem", color: COLOR.textFaint }}>{m} ½</span>
        ))}
      </div>
    );
  }

  function renderVolumeBar(muscle) {
    const sets      = weeklyVolume[muscle];
    const status    = classifyVolume(sets);
    const color     = MUSCLE_COLOR[muscle];
    const target    = getVolumeTarget(musclePriorities[muscle]);
    const fillPct   = Math.min(100, (sets / BAR_SCALE_MAX) * 100);
    const targetPct = Math.min(100, (target.sets / BAR_SCALE_MAX) * 100);
    const prioIcon  = musclePriorities[muscle] === "priority" ? " 🎯" : musclePriorities[muscle] === "maintain" ? " 🔒" : "";

    return (
      <div key={muscle} style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1rem" }}>{MUSCLE_EMOJI[muscle]}</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 500, color: COLOR.textSecond }}>{muscle}{prioIcon}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {status !== "neutral" && (
              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.5px",
                padding: "2px 7px", borderRadius: 20,
                background: VOLUME_STATUS_COLOR[status] + "20", color: VOLUME_STATUS_COLOR[status] }}>
                {VOLUME_STATUS_LABEL[status]}
              </span>
            )}
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: COLOR.text }}>
              {Number.isInteger(sets) ? sets : sets.toFixed(1)}
            </span>
          </div>
        </div>
        <div style={{ height: 6, background: "#E5E5EA", borderRadius: 3, position: "relative" }}>
          <div style={{ height: 6, borderRadius: 3, transition: "width 0.35s ease",
            width: `${fillPct}%`, background: color, opacity: status === "over" ? 0.6 : 1 }} />
          {/* Marqueurs de seuil à 5 (maintien) et 12 (optimal) */}
          {[VOLUME_THRESHOLDS.maintain, VOLUME_THRESHOLDS.optimal].map((threshold, i) => (
            <div key={i} style={{ position: "absolute", top: -3, width: 2, height: 12, borderRadius: 1,
              left: `${(threshold / BAR_SCALE_MAX) * 100}%`,
              background: i === 0 ? "#D1D1D6" : COLOR.green }} />
          ))}
          {/* Marqueur de cible personnalisée */}
          <div style={{ position: "absolute", top: -4, left: `${targetPct}%`,
            width: 2, height: 14, background: target.color, borderRadius: 1,
            transform: "translateX(-50%)" }} />
        </div>
      </div>
    );
  }

  // ─── PAGES ───────────────────────────────────────────────────────────────

  function renderProgramPage() {
    return (
      <div className="page">
        <div><div className="page-title">Programme</div><span className="page-title-accent" /></div>

        {activeDays.map(day => {
          const isOpen = !collapsedDayIds[day.id];
          return (
            <div key={day.id} className="day-card">
              <div className={`day-header${isOpen ? " open" : ""}`} onClick={() => toggleDayCollapse(day.id)}>
                <span className={`day-collapse-icon${isOpen ? " open" : ""}`}>›</span>
                {renamingDayId === day.id ? (
                  <input className="day-name-input" value={renamingDayName} autoFocus
                    onClick={e => e.stopPropagation()}
                    onChange={e => setRenamingDayName(e.target.value)}
                    onBlur={() => commitDayRename(day.id, renamingDayName || day.name)}
                    onKeyDown={e => e.key === "Enter" && commitDayRename(day.id, renamingDayName || day.name)} />
                ) : (
                  <span className="day-name">{day.name}</span>
                )}
                <span className="day-count">{day.exercises.length} ex.</span>
                <button className="day-edit-btn" title="Renommer" onClick={e => { e.stopPropagation(); setRenamingDayId(day.id); setRenamingDayName(day.name); }}>✏️</button>
                <button className="day-del-btn"  title="Supprimer" onClick={e => { e.stopPropagation(); deleteDay(day.id); }}>✕</button>
              </div>

              {isOpen && (
                <div className="ex-list" onDragOver={e => e.preventDefault()} onDrop={() => handleDropOnExercise(day.id, day.exercises.length)}>
                  {day.exercises.map((ex, idx) => {
                    const exData = exerciseDb[ex.name];
                    return (
                      <div key={ex.id} className="ex-row" draggable
                        onDragStart={() => handleDragStart(day.id, idx)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.stopPropagation(); handleDropOnExercise(day.id, idx); }}>
                        <span className="ex-idx">{idx + 1}</span>
                        <div className="ex-info">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="ex-name">{ex.name}</span>
                            {exData?.tier && renderTierBadge(exData.tier)}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 5 }}>
                            <span className="ex-sets-badge">{ex.sets} séries</span>
                            {exData && renderMusclePills(exData.primary)}
                          </div>
                        </div>
                        {/* Mobile */}
                        <div className="ex-mob-btns">
                          <div className="sets-ctrl">
                            <button className="sets-btn" onClick={() => updateExerciseSets(day.id, ex.id, ex.sets - 1)}>−</button>
                            <span className="sets-val">{ex.sets}</span>
                            <button className="sets-btn" onClick={() => updateExerciseSets(day.id, ex.id, ex.sets + 1)}>+</button>
                          </div>
                          <button className="ex-mob-btn" onClick={() => { setModal({ type: "replaceExercise", dayId: day.id, exerciseId: ex.id }); setPickerSearch(""); }}>⇄</button>
                          <button className="ex-mob-btn del" onClick={() => deleteExerciseFromDay(day.id, ex.id)}>✕</button>
                        </div>
                        {/* Desktop */}
                        <div className="sets-ctrl icon-btn" style={{ cursor: "default", gap: 3 }}>
                          <button className="sets-btn" onClick={() => updateExerciseSets(day.id, ex.id, ex.sets - 1)}>−</button>
                          <span className="sets-val">{ex.sets}</span>
                          <button className="sets-btn" onClick={() => updateExerciseSets(day.id, ex.id, ex.sets + 1)}>+</button>
                        </div>
                        <button className="icon-btn"     title="Monter"    onClick={() => moveExerciseUp(day.id, idx)}>↑</button>
                        <button className="icon-btn rep" title="Remplacer" onClick={() => { setModal({ type: "replaceExercise", dayId: day.id, exerciseId: ex.id }); setPickerSearch(""); }}>⇄</button>
                        <button className="icon-btn del" title="Supprimer" onClick={() => deleteExerciseFromDay(day.id, ex.id)}>✕</button>
                        <span className="ex-chevron">›</span>
                      </div>
                    );
                  })}
                  <button className="add-ex-btn" onClick={() => { setModal({ type: "addExercise", dayId: day.id }); setPickerSearch(""); }}>
                    + Ajouter un exercice
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button className="add-day-btn" onClick={addDay}>+ Ajouter une séance</button>
      </div>
    );
  }

  function renderVolumeSidebar() {
    return (
      <div className="desktop-sidebar">
        <div className="panel-title">Volume hebdo.</div>
        {ALL_MUSCLES.map(muscle => renderVolumeBar(muscle))}
        <div style={{ height: "1.5px", background: "#E5E5EA", margin: "14px 0" }} />
        {[
          { color: COLOR.textDisabled, label: "MAINTIEN — 1 à 5 séries" },
          { color: COLOR.green,        label: "OPTIMAL — 6 à 12 séries" },
          { color: COLOR.red,          label: "MAX — plus de 12 séries" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.72rem", fontWeight: 500, color: COLOR.textMuted, marginBottom: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    );
  }

  function renderStatsPage() {
    return (
      <div className="page">
        <div><div className="page-title">Analyse</div><span className="page-title-accent" /></div>

        {/* Objectifs musculaires */}
        <div style={{ background: COLOR.surface, border: `1.5px solid ${COLOR.border}`, borderRadius: 10, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: COLOR.textMuted }}>Objectifs musculaires</div>
              <div style={{ fontSize: "0.75rem", color: COLOR.textFaint, marginTop: 3 }}>Définis tes priorités pour adapter l'analyse IA</div>
            </div>
            {hasMusclesWithCustomPriority && (
              <button onClick={resetAllMusclePriorities} style={{ background: "none", border: `1.5px solid ${COLOR.border}`, color: COLOR.textMuted, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "6px 12px", borderRadius: 8 }}>
                Réinitialiser
              </button>
            )}
          </div>
          {ALL_MUSCLES.map(muscle => {
            const currentPriority = musclePriorities[muscle];
            return (
              <div key={muscle} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "1rem", width: 22, flexShrink: 0 }}>{MUSCLE_EMOJI[muscle]}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: COLOR.text, flex: 1, minWidth: 0 }}>{muscle}</span>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  {MUSCLE_PRIORITY_OPTIONS.map(opt => {
                    const isActive = currentPriority === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setMusclePriority(muscle, opt.value)} style={{
                        background: isActive ? opt.activeBg : COLOR.bg,
                        color:      isActive ? opt.activeColor : COLOR.textFaint,
                        border:     isActive ? `1.5px solid ${opt.activeBorder}` : `1.5px solid ${COLOR.borderLight}`,
                        borderRadius: 8, padding: "6px 11px",
                        fontSize: "0.72rem", fontWeight: isActive ? 700 : 500,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                        whiteSpace: "nowrap", minHeight: 32,
                      }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Analyse IA */}
        <div style={{ background: "#EBF4FF", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: COLOR.text }}>🤖 Analyse IA</div>
            <button className="ai-generate-btn" onClick={generateAiAnalysis} disabled={aiAnalysisLoading}>
              {aiAnalysisLoading ? "Analyse..." : aiAnalysisText ? "Relancer" : "Analyser"}
            </button>
          </div>
          {aiAnalysisLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLOR.textMuted, fontSize: "0.82rem" }}>
              <div className="ai-spinner" /> Analyse du programme en cours...
            </div>
          )}
          {!aiAnalysisLoading && !aiAnalysisText && (
            <div style={{ fontSize: "0.82rem", color: COLOR.textFaint, lineHeight: 1.6 }}>
              Lance l'analyse pour obtenir un résumé personnalisé basé sur tes objectifs.
            </div>
          )}
          {!aiAnalysisLoading && aiAnalysisText && (
            <div style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#1E3A5F" }}>{aiAnalysisText}</div>
          )}
        </div>

        {/* Volume hebdomadaire */}
        <div style={{ background: COLOR.surface, border: `1.5px solid ${COLOR.border}`, borderRadius: 10, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: COLOR.textMuted, marginBottom: 14 }}>Volume hebdomadaire</div>
          {ALL_MUSCLES.map(muscle => renderVolumeBar(muscle))}
          <div style={{ height: "1.5px", background: "#E5E5EA", margin: "14px 0" }} />
          {[
            { color: COLOR.textDisabled, label: "MAINTIEN — 1 à 5 séries" },
            { color: COLOR.green,        label: "OPTIMAL — 6 à 12 séries" },
            { color: COLOR.red,          label: "MAX — plus de 12 séries" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.72rem", fontWeight: 500, color: COLOR.textMuted, marginBottom: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderLibraryPage() {
    return (
      <div className="page">
        <div><div className="page-title">Bibliothèque</div><span className="page-title-accent" /></div>
        <div className="lib-toolbar">
          <input className="lib-search" placeholder="Rechercher un exercice..." value={libSearch} onChange={e => setLibSearch(e.target.value)} />
          <select className="lib-select" value={libMuscleFilter} onChange={e => setLibMuscleFilter(e.target.value)}>
            <option>Tous</option>
            {ALL_MUSCLES.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="lib-select" value={libTierFilter} onChange={e => setLibTierFilter(e.target.value)}>
            <option>Tous</option>
            {TIER_SORT_ORDER.map(t => <option key={t}>{t}</option>)}
          </select>
          <span style={{ fontSize: "0.72rem", fontWeight: 500, color: COLOR.textMuted, whiteSpace: "nowrap" }}>
            {libraryExercises.length}/{Object.keys(exerciseDb).length}
          </span>
          <button className="lib-add-btn" onClick={openAddExerciseToDbModal}>+ Nouveau</button>
        </div>
        <div>
          {libraryExercises.length === 0 && <div className="lib-empty">Aucun exercice trouvé.</div>}
          {libraryExercises.map(name => {
            const data = exerciseDb[name];
            return (
              <div key={name} className="lib-ex-row" onClick={() => openEditExerciseInDbModal(name)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: COLOR.text }}>{name}</span>
                    {data.tier && renderTierBadge(data.tier)}
                  </div>
                  {renderMusclePills(data.primary, data.secondary)}
                </div>
                <div className="lib-actions" onClick={e => e.stopPropagation()}>
                  <button className="lib-btn edit" onClick={() => openEditExerciseInDbModal(name)}>✏️</button>
                  <button className="lib-btn del"  onClick={() => deleteExerciseFromDb(name)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── MODALES ─────────────────────────────────────────────────────────────

  function renderPickerModal(title, onPick) {
    return (
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-search-wrap">
          <input ref={pickerSearchInputRef} className="modal-search" placeholder="Rechercher un exercice..."
            value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
        </div>
        <div className="ex-picker">
          {pickerExercises.length === 0
            ? <div style={{ padding: 20, color: COLOR.textFaint, fontSize: "0.9rem", textAlign: "center" }}>Aucun résultat</div>
            : pickerExercises.map(name => {
              const data = exerciseDb[name];
              return (
                <div key={name} className="ex-option" onClick={() => onPick(name)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: COLOR.text }}>{name}</div>
                    <div style={{ fontSize: "0.7rem", color: COLOR.textMuted, marginTop: 2 }}>
                      {data.primary.join(", ")}{data.secondary.length ? ` · ${data.secondary.join(", ")} ½` : ""}
                    </div>
                  </div>
                  {data.tier && renderTierBadge(data.tier)}
                </div>
              );
            })}
        </div>
        <div style={{ height: 12, flexShrink: 0 }} />
      </div>
    );
  }

  function renderExerciseFormModal() {
    return (
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">{editingExerciseName ? "Modifier l'exercice" : "Nouvel exercice"}</span>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-form">
          <div>
            <label className="form-label">Nom</label>
            <input className="form-input" value={exerciseForm.name} onChange={e => setExerciseForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex : Curl pupitre haltère" />
          </div>
          <div>
            <label className="form-label">Note Nippard</label>
            <select className="form-select" value={exerciseForm.tier} onChange={e => setExerciseForm(f => ({ ...f, tier: e.target.value }))}>
              {TIER_SORT_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="">— Non noté</option>
            </select>
          </div>
          <div>
            <label className="form-label">Muscles principaux</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ALL_MUSCLES.map(m => {
                const isActive = exerciseForm.primary.includes(m);
                return (
                  <button key={m} onClick={() => setExerciseForm(f => ({
                    ...f,
                    primary:   toggleArrayItem(f.primary, m),
                    secondary: f.secondary.filter(x => x !== m),
                  }))} style={{
                    fontSize: "0.75rem", fontWeight: isActive ? 700 : 500, padding: "7px 14px", borderRadius: 20,
                    border:      isActive ? `1.5px solid ${MUSCLE_COLOR[m]}` : `1.5px solid ${COLOR.borderLight}`,
                    background:  isActive ? MUSCLE_COLOR[m] + "18" : COLOR.surface,
                    color:       isActive ? MUSCLE_COLOR[m] : COLOR.textFaint,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="form-label">Muscles secondaires</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ALL_MUSCLES.filter(m => !exerciseForm.primary.includes(m)).map(m => {
                const isActive = exerciseForm.secondary.includes(m);
                return (
                  <button key={m} onClick={() => setExerciseForm(f => ({ ...f, secondary: toggleArrayItem(f.secondary, m) }))} style={{
                    fontSize: "0.75rem", fontWeight: isActive ? 700 : 500, padding: "7px 14px", borderRadius: 20,
                    border:     isActive ? `1.5px solid ${COLOR.textDisabled}` : `1.5px solid ${COLOR.borderLight}`,
                    background: isActive ? COLOR.bg : COLOR.surface,
                    color:      isActive ? COLOR.textSecond : COLOR.textFaint,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
          {exerciseFormError && <div style={{ fontSize: "0.78rem", fontWeight: 600, color: COLOR.red }}>{exerciseFormError}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="btn-cancel" onClick={closeModal}>Annuler</button>
            <button className="btn-save"   onClick={saveExerciseForm}>Sauvegarder</button>
          </div>
        </div>
      </div>
    );
  }

  function renderProgramListModal() {
    return (
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Mes programmes</span>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, overflowY: "auto", flex: 1 }}>
          {programs.map(prog => (
            <div key={prog.id} onClick={() => switchToProgram(prog.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              background: prog.id === activeProgramId ? COLOR.accentBg : COLOR.surface,
              border: `1.5px solid ${prog.id === activeProgramId ? COLOR.accent : COLOR.borderLight}`,
              borderRadius: 10, cursor: "pointer", minHeight: 56,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${prog.id === activeProgramId ? COLOR.accent : COLOR.textDisabled}`,
                background: prog.id === activeProgramId ? COLOR.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem", fontWeight: 700, color: COLOR.surface,
              }}>
                {prog.id === activeProgramId ? "✓" : ""}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: prog.id === activeProgramId ? COLOR.accentDark : COLOR.text }}>{prog.name}</div>
                <div style={{ fontSize: "0.7rem", color: COLOR.textFaint, marginTop: 2 }}>
                  {prog.days.length} séance{prog.days.length !== 1 ? "s" : ""} · {prog.days.reduce((n, d) => n + d.exercises.length, 0)} exercices
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                {[
                  { icon: "✏️", title: "Renommer",  action: () => openRenameProgramModal(prog.id) },
                  { icon: "📋", title: "Dupliquer", action: () => duplicateProgram(prog.id) },
                  { icon: "🗑️", title: "Supprimer", action: () => deleteProgram(prog.id) },
                ].map(btn => (
                  <button key={btn.title} title={btn.title} onClick={btn.action} style={{
                    background: COLOR.bg, border: `1.5px solid ${COLOR.border}`, color: COLOR.textMuted,
                    fontSize: "0.85rem", cursor: "pointer", padding: "5px 7px",
                    borderRadius: 7, minWidth: 34, minHeight: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: `1.5px solid ${COLOR.border}`, flexShrink: 0 }}>
          <button className="prog-new-btn" onClick={() => { closeModal(); setTimeout(openCreateProgramModal, 50); }}>
            + Nouveau programme
          </button>
        </div>
      </div>
    );
  }

  function renderProgramFormModal() {
    return (
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">{editingProgramId ? "Renommer" : "Nouveau programme"}</span>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-form">
          <div>
            <label className="form-label">{editingProgramId ? "Nouveau nom" : "Nom du programme"}</label>
            <input className="form-input" autoFocus value={programFormName}
              onChange={e => setProgramFormName(e.target.value)}
              placeholder="Ex : PPL Hypertrophie, Full Body..."
              onKeyDown={e => e.key === "Enter" && saveProgramForm()} />
          </div>
          {programFormError && <div style={{ fontSize: "0.78rem", fontWeight: 600, color: COLOR.red }}>{programFormError}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="btn-cancel" onClick={closeModal}>Annuler</button>
            <button className="btn-save"   onClick={saveProgramForm}>{editingProgramId ? "Renommer" : "Créer"}</button>
          </div>
        </div>
      </div>
    );
  }

  function renderImportModal() {
    return (
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Importer</span>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-form">
          <div style={{ fontSize: "0.85rem", color: COLOR.textMuted }}>Confirmer le remplacement du programme et de la bibliothèque ?</div>
          <textarea style={{ background: COLOR.surface, border: `1.5px solid ${COLOR.textDisabled}`, borderRadius: 10, color: COLOR.text, fontFamily: "monospace", fontSize: "0.75rem", padding: 12, height: 130, resize: "vertical", outline: "none", width: "100%" }}
            value={importText} onChange={e => setImportText(e.target.value)} spellCheck={false} />
          {importError && <div style={{ fontSize: "0.78rem", fontWeight: 600, color: COLOR.red }}>{importError}</div>}
          <button style={{ fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 700, padding: 14, background: COLOR.accent, border: "none", color: "#FFFFFF", borderRadius: 10, cursor: "pointer", minHeight: 48 }} onClick={confirmImport}>
            Confirmer l'import
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDU PRINCIPAL ──────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>

      <div className="app">

        {/* Header desktop */}
        <div className="header">
          <div className="header-brand"><h1>Work<span>out</span></h1></div>
          {[
            { id: "program", label: "Programme" },
            { id: "stats",   label: "Analyse" },
            { id: "library", label: `Bibliothèque (${Object.keys(exerciseDb).length})` },
          ].map(tab => (
            <button key={tab.id} className={`nav-tab${currentPage === tab.id ? " active" : ""}`} onClick={() => setCurrentPage(tab.id)}>
              {tab.label}
            </button>
          ))}
          <div className="header-spacer" />
          <div className="header-actions">
            <button className="prog-switcher" onClick={() => setModal({ type: "programList" })}>
              <span className="prog-switcher-name">{activeProgramName}</span>
              <span className="prog-switcher-chevron">▼</span>
            </button>
            <div className={`save-dot ${saveStatus}`} />
            <button className="hdr-btn hdr-btn-ghost" onClick={() => fileInputRef.current?.click()}>Importer</button>
            <button className="hdr-btn hdr-btn-solid" onClick={downloadBackup}>Exporter</button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileSelected} />
          </div>
        </div>

        {/* Header mobile */}
        <div className="mobile-header">
          <button className="prog-switcher" style={{ maxWidth: "55vw" }} onClick={() => setModal({ type: "programList" })}>
            <span className="prog-switcher-name">{activeProgramName}</span>
            <span className="prog-switcher-chevron">▼</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className={`save-dot ${saveStatus}`} />
            <button className="mob-btn" onClick={() => fileInputRef.current?.click()}>↑ Import</button>
            <button className="mob-btn" onClick={downloadBackup}>↓ Export</button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileSelected} />
          </div>
        </div>

        {/* Contenu principal */}
        <div className={`content${currentPage !== "program" ? " full-width" : ""}`}>
          {currentPage === "program" && renderProgramPage()}
          {currentPage === "stats"   && renderStatsPage()}
          {currentPage === "library" && renderLibraryPage()}
          {currentPage === "program" && renderVolumeSidebar()}
        </div>

        {/* Navigation mobile */}
        <div className="bottom-nav">
          {[
            { id: "program", icon: "📋", label: "Programme" },
            { id: "stats",   icon: "📊", label: "Analyse" },
            { id: "library", icon: "📚", label: "Bibliothèque" },
          ].map(tab => (
            <button key={tab.id} className={`bnav-btn${currentPage === tab.id ? " active" : ""}`} onClick={() => setCurrentPage(tab.id)}>
              <span className="bnav-icon">{tab.icon}</span>
              <span className="bnav-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modales */}
      {modal && (
        <div className="overlay" onClick={closeModal}>
          {modal.type === "addExercise"      && renderPickerModal("Ajouter un exercice",  name => addExerciseToDay(modal.dayId, name))}
          {modal.type === "replaceExercise"  && renderPickerModal("Remplacer l'exercice", name => replaceExerciseInDay(modal.dayId, modal.exerciseId, name))}
          {modal.type === "editExerciseInDb" && renderExerciseFormModal()}
          {modal.type === "programList"      && renderProgramListModal()}
          {modal.type === "programForm"      && renderProgramFormModal()}
          {modal.type === "import"           && renderImportModal()}
        </div>
      )}
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
// Séparé du composant pour ne pas polluer la logique.
// Aucune fonction CSS moderne (color-mix, etc.) — compatibilité Safari iOS 14+.

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { height: 100%; background: #F2F2F7; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #E5E5EA; }
  ::-webkit-scrollbar-thumb { background: #AEAEB2; border-radius: 2px; }

  .app { font-family: 'Inter', -apple-system, sans-serif; background: #F2F2F7; color: #1C1C1E; display: flex; flex-direction: column; height: 100vh; height: 100dvh; padding-top: env(safe-area-inset-top); }

  .header { display: none; padding: 0 24px; border-bottom: 1.5px solid #D1D1D6; background: #FFFFFF; align-items: stretch; flex-shrink: 0; }
  @media (min-width: 768px) { .header { display: flex; } }
  .header-brand { display: flex; align-items: center; padding: 14px 20px 14px 0; border-right: 1.5px solid #D1D1D6; margin-right: 8px; }
  .header-brand h1 { font-size: 1.4rem; font-weight: 800; color: #1C1C1E; letter-spacing: -0.5px; }
  .header-brand span { color: #E8500A; }
  .nav-tab { font-family: inherit; font-size: 0.78rem; font-weight: 600; background: none; border: none; color: #6B6B6B; cursor: pointer; padding: 0 16px; border-bottom: 2.5px solid transparent; transition: color 0.15s, border-color 0.15s; min-height: 48px; }
  .nav-tab:hover { color: #1C1C1E; }
  .nav-tab.active { color: #E8500A; border-bottom-color: #E8500A; }
  .header-spacer { flex: 1; }
  .header-actions { display: flex; align-items: center; gap: 8px; padding: 10px 0; }
  .hdr-btn { font-family: inherit; font-size: 0.75rem; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; min-height: 36px; }
  .hdr-btn-ghost { background: none; border: 1.5px solid #AEAEB2; color: #3A3A3C; }
  .hdr-btn-ghost:hover { border-color: #E8500A; color: #E8500A; }
  .hdr-btn-solid { background: #E8500A; border: 1.5px solid #E8500A; color: #FFFFFF; }
  .hdr-btn-solid:hover { background: #C94209; border-color: #C94209; }

  .prog-switcher { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #F2F2F7; border: 1.5px solid #AEAEB2; border-radius: 8px; cursor: pointer; max-width: 200px; min-height: 36px; transition: border-color 0.15s; }
  .prog-switcher:hover { border-color: #E8500A; }
  .prog-switcher-name { font-family: inherit; font-size: 0.78rem; font-weight: 600; color: #1C1C1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .prog-switcher-chevron { color: #E8500A; font-size: 0.6rem; flex-shrink: 0; }

  .save-dot { width: 8px; height: 8px; border-radius: 50%; background: #AEAEB2; transition: background 0.3s; }
  .save-dot.saving { background: #F97316; }
  .save-dot.saved  { background: #22C55E; }
  .save-dot.error  { background: #EF4444; }

  .mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #FFFFFF; border-bottom: 1.5px solid #D1D1D6; flex-shrink: 0; }
  @media (min-width: 768px) { .mobile-header { display: none; } }
  .mob-btn { background: #F2F2F7; border: 1.5px solid #AEAEB2; color: #3A3A3C; font-family: inherit; font-size: 0.7rem; font-weight: 600; padding: 7px 12px; border-radius: 8px; cursor: pointer; min-height: 36px; }
  .mob-btn:active { border-color: #E8500A; color: #E8500A; }

  .content { flex: 1; min-height: 0; overflow-y: auto; }
  @media (min-width: 768px) {
    .content { overflow: hidden; display: grid; grid-template-columns: 1fr 280px; }
    .content > * { overflow-y: auto; }
    .content.full-width { grid-template-columns: 1fr; }
  }

  .page { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
  .page-title { font-size: 2.2rem; font-weight: 800; color: #1C1C1E; letter-spacing: -0.8px; line-height: 1; }
  .page-title-accent { display: block; width: 36px; height: 3px; background: #E8500A; margin-top: 6px; border-radius: 2px; }

  .desktop-sidebar { display: none; }
  @media (min-width: 768px) { .desktop-sidebar { display: block; background: #FFFFFF; border-left: 1.5px solid #D1D1D6; padding: 20px; overflow-y: auto; } }
  .panel-title { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6B6B6B; margin-bottom: 16px; }

  .day-card { background: #FFFFFF; border: 1.5px solid #D1D1D6; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .day-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #FFFFFF; cursor: pointer; user-select: none; min-height: 48px; border-radius: 10px; transition: background 0.1s; }
  .day-header:hover { background: #F7F7F7; }
  .day-header.open { border-radius: 10px 10px 0 0; border-bottom: 1.5px solid #E5E5EA; }
  .day-collapse-icon { color: #AEAEB2; font-size: 0.85rem; transition: transform 0.2s; flex-shrink: 0; }
  .day-collapse-icon.open { transform: rotate(90deg); color: #E8500A; }
  .day-name { font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #3A3A3C; flex: 1; }
  .day-name-input { background: transparent; border: none; border-bottom: 2px solid #E8500A; color: #1C1C1E; font-family: inherit; font-size: 0.85rem; font-weight: 700; outline: none; flex: 1; padding-bottom: 2px; }
  .day-count { font-size: 0.7rem; font-weight: 500; color: #8E8E93; background: #F2F2F7; padding: 2px 8px; border-radius: 20px; }
  .day-edit-btn, .day-del-btn { background: none; border: none; color: #AEAEB2; font-size: 0.9rem; cursor: pointer; padding: 4px; border-radius: 6px; min-width: 36px; min-height: 36px; display: flex; align-items: center; justify-content: center; transition: all 0.12s; }
  .day-edit-btn:hover, .day-edit-btn:active { color: #E8500A; background: #FFF3EE; }
  .day-del-btn:hover,  .day-del-btn:active  { color: #EF4444; background: #FFF0F0; }

  .ex-list { display: flex; flex-direction: column; }
  .ex-row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-bottom: 1px solid #F2F2F7; transition: background 0.1s; }
  .ex-row:last-of-type { border-bottom: none; }
  .ex-row:hover { background: #FAFAFA; }
  @media (min-width: 768px) { .ex-row { cursor: grab; } }
  .ex-idx { font-size: 0.72rem; font-weight: 600; color: #AEAEB2; width: 18px; flex-shrink: 0; display: none; text-align: center; }
  @media (min-width: 768px) { .ex-idx { display: block; } }
  .ex-info { flex: 1; min-width: 0; }
  .ex-name { font-size: 0.92rem; font-weight: 600; color: #1C1C1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ex-sets-badge { font-size: 0.68rem; font-weight: 600; background: #F2F2F7; color: #3A3A3C; padding: 2px 8px; border-radius: 5px; border: 1px solid #E5E5EA; }

  .sets-ctrl { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
  .sets-btn { background: #F2F2F7; border: 1.5px solid #D1D1D6; color: #3A3A3C; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 500; display: flex; align-items: center; justify-content: center; transition: all 0.12s; }
  .sets-btn:hover, .sets-btn:active { background: #E8500A; border-color: #E8500A; color: #FFFFFF; }
  @media (min-width: 768px) { .sets-btn { width: 26px; height: 26px; font-size: 0.9rem; border-radius: 5px; } }
  .sets-val { font-size: 1rem; font-weight: 700; color: #1C1C1E; min-width: 28px; text-align: center; }
  @media (min-width: 768px) { .sets-val { font-size: 0.85rem; min-width: 22px; } }

  .ex-mob-btns { display: flex; gap: 5px; flex-shrink: 0; }
  @media (min-width: 768px) { .ex-mob-btns { display: none; } }
  .ex-mob-btn { background: #F2F2F7; border: 1.5px solid #D1D1D6; color: #3A3A3C; font-size: 0.78rem; font-weight: 600; font-family: inherit; border-radius: 8px; padding: 6px 12px; cursor: pointer; min-height: 36px; display: flex; align-items: center; }
  .ex-mob-btn:active { background: #E8500A; border-color: #E8500A; color: #FFFFFF; }
  .ex-mob-btn.del:active { background: #EF4444; border-color: #EF4444; color: #FFFFFF; }

  .icon-btn { background: none; border: none; cursor: pointer; color: #AEAEB2; font-size: 0.8rem; padding: 4px 6px; border-radius: 5px; display: none; align-items: center; justify-content: center; min-width: 32px; min-height: 32px; transition: all 0.12s; }
  @media (min-width: 768px) { .icon-btn { display: flex; } .icon-btn:hover { color: #3A3A3C; background: #F2F2F7; } .icon-btn.del:hover { color: #EF4444; background: #FFF0F0; } .icon-btn.rep:hover { color: #E8500A; background: #FFF3EE; } }
  .ex-chevron { color: #D1D1D6; font-size: 0.8rem; display: none; }
  @media (min-width: 768px) { .ex-chevron { display: block; } }

  .add-ex-btn { display: flex; align-items: center; gap: 8px; padding: 14px 16px; font-family: inherit; font-size: 0.82rem; font-weight: 600; color: #E8500A; background: none; border: none; cursor: pointer; width: 100%; min-height: 44px; transition: all 0.1s; }
  .add-ex-btn:hover, .add-ex-btn:active { color: #C94209; background: #FFF3EE; }
  .add-day-btn { font-family: inherit; font-size: 0.85rem; font-weight: 600; background: #FFFFFF; border: 2px dashed #AEAEB2; color: #6B6B6B; padding: 14px 20px; cursor: pointer; border-radius: 10px; width: 100%; text-align: center; min-height: 48px; transition: all 0.15s; }
  .add-day-btn:hover, .add-day-btn:active { border-color: #E8500A; color: #E8500A; background: #FFF3EE; }
  @media (min-width: 768px) { .add-day-btn { width: auto; align-self: flex-start; } }

  .lib-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .lib-search { flex: 1; min-width: 160px; background: #FFFFFF; border: 1.5px solid #AEAEB2; border-radius: 10px; padding: 11px 14px; color: #1C1C1E; font-family: inherit; font-size: 0.85rem; outline: none; min-height: 44px; }
  .lib-search::placeholder { color: #8E8E93; }
  .lib-search:focus { border-color: #E8500A; box-shadow: 0 0 0 3px rgba(232,80,10,0.12); }
  .lib-select { background: #FFFFFF; border: 1.5px solid #AEAEB2; border-radius: 10px; padding: 10px 12px; color: #3A3A3C; font-family: inherit; font-size: 0.8rem; font-weight: 500; outline: none; cursor: pointer; min-height: 44px; }
  .lib-select:focus { border-color: #E8500A; box-shadow: 0 0 0 3px rgba(232,80,10,0.12); }
  .lib-add-btn { font-family: inherit; font-size: 0.78rem; font-weight: 700; padding: 10px 16px; background: #E8500A; border: none; color: #FFFFFF; border-radius: 10px; cursor: pointer; white-space: nowrap; min-height: 44px; transition: background 0.12s; }
  .lib-add-btn:hover, .lib-add-btn:active { background: #C94209; }
  .lib-ex-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #FFFFFF; border-bottom: 1.5px solid #F2F2F7; cursor: pointer; transition: background 0.1s; }
  .lib-ex-row:first-child { border-radius: 10px 10px 0 0; }
  .lib-ex-row:last-child  { border-radius: 0 0 10px 10px; border-bottom: none; }
  .lib-ex-row:only-child  { border-radius: 10px; border-bottom: none; }
  .lib-ex-row:hover, .lib-ex-row:active { background: #FFF3EE; }
  .lib-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .lib-btn { background: #F2F2F7; border: 1.5px solid #D1D1D6; color: #6B6B6B; font-family: inherit; font-size: 0.72rem; font-weight: 500; padding: 6px 12px; border-radius: 7px; cursor: pointer; min-height: 36px; min-width: 36px; display: flex; align-items: center; justify-content: center; transition: all 0.12s; }
  .lib-btn:hover, .lib-btn:active { border-color: #E8500A; color: #E8500A; background: #FFF3EE; }
  .lib-btn.del:hover, .lib-btn.del:active { border-color: #EF4444; color: #EF4444; background: #FFF0F0; }
  .lib-empty { font-size: 0.85rem; font-weight: 500; color: #8E8E93; padding: 40px; text-align: center; background: #FFFFFF; border-radius: 10px; border: 1.5px solid #E5E5EA; }

  .bottom-nav { display: flex; align-items: center; background: #FFFFFF; border-top: 1.5px solid #D1D1D6; padding-bottom: env(safe-area-inset-bottom); flex-shrink: 0; }
  @media (min-width: 768px) { .bottom-nav { display: none; } }
  .bnav-btn { flex: 1; background: none; border: none; cursor: pointer; padding: 10px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; min-height: 56px; transition: background 0.1s; }
  .bnav-btn:active { background: #FFF3EE; }
  .bnav-icon  { font-size: 1.35rem; line-height: 1; }
  .bnav-label { font-family: inherit; font-size: 0.58rem; font-weight: 600; letter-spacing: 0.3px; color: #8E8E93; }
  .bnav-btn.active .bnav-label { color: #E8500A; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
  @media (min-width: 768px) { .overlay { align-items: center; padding: 20px; } }
  .modal { background: #F2F2F7; border-radius: 16px 16px 0 0; width: 100%; max-height: 92dvh; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom); }
  @media (min-width: 768px) { .modal { border-radius: 12px; width: 520px; max-height: 86vh; padding-bottom: 0; } .modal-lg { width: 580px; } }
  .modal-handle { width: 40px; height: 4px; background: #AEAEB2; border-radius: 2px; margin: 12px auto 0; flex-shrink: 0; }
  @media (min-width: 768px) { .modal-handle { display: none; } }
  .modal-header { padding: 16px 18px 14px; border-bottom: 1.5px solid #D1D1D6; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; background: #FFFFFF; border-radius: 16px 16px 0 0; }
  @media (min-width: 768px) { .modal-header { border-radius: 12px 12px 0 0; } }
  .modal-title { font-size: 1rem; font-weight: 700; color: #1C1C1E; letter-spacing: -0.2px; }
  .modal-close { background: #E5E5EA; border: none; color: #3A3A3C; font-size: 0.75rem; font-weight: 700; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.12s; }
  .modal-close:hover, .modal-close:active { background: #AEAEB2; }
  .modal-search-wrap { padding: 12px 14px 8px; flex-shrink: 0; background: #F2F2F7; }
  .modal-search { width: 100%; background: #FFFFFF; border: 1.5px solid #AEAEB2; border-radius: 10px; padding: 11px 14px; color: #1C1C1E; font-family: inherit; font-size: 0.9rem; outline: none; min-height: 44px; }
  .modal-search::placeholder { color: #8E8E93; }
  .modal-search:focus { border-color: #E8500A; box-shadow: 0 0 0 3px rgba(232,80,10,0.12); }
  .ex-picker { overflow-y: auto; flex: 1; background: #FFFFFF; }
  .ex-option { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; border-bottom: 1px solid #F2F2F7; cursor: pointer; gap: 12px; min-height: 56px; transition: background 0.1s; }
  .ex-option:last-child { border-bottom: none; }
  .ex-option:hover, .ex-option:active { background: #FFF3EE; }

  .modal-form { padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
  .form-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6B6B6B; margin-bottom: 6px; display: block; }
  .form-input { width: 100%; background: #FFFFFF; border: 1.5px solid #AEAEB2; border-radius: 10px; padding: 13px 14px; color: #1C1C1E; font-family: inherit; font-size: 0.95rem; outline: none; min-height: 48px; }
  .form-input::placeholder { color: #8E8E93; }
  .form-input:focus { border-color: #E8500A; box-shadow: 0 0 0 3px rgba(232,80,10,0.12); }
  .form-select { width: 100%; background: #FFFFFF; border: 1.5px solid #AEAEB2; border-radius: 10px; padding: 13px 14px; color: #1C1C1E; font-family: inherit; font-size: 0.95rem; outline: none; cursor: pointer; min-height: 48px; }
  .form-select:focus { border-color: #E8500A; box-shadow: 0 0 0 3px rgba(232,80,10,0.12); }
  .btn-cancel { background: #F2F2F7; border: 1.5px solid #D1D1D6; color: #3A3A3C; font-family: inherit; font-size: 0.82rem; font-weight: 600; padding: 12px 18px; border-radius: 10px; cursor: pointer; min-height: 44px; transition: background 0.12s; }
  .btn-cancel:hover, .btn-cancel:active { background: #E5E5EA; }
  .btn-save { background: #E8500A; border: none; color: #FFFFFF; font-family: inherit; font-size: 0.82rem; font-weight: 700; padding: 12px 22px; border-radius: 10px; cursor: pointer; min-height: 44px; transition: background 0.12s; }
  .btn-save:hover, .btn-save:active { background: #C94209; }

  .prog-new-btn { width: 100%; font-family: inherit; font-size: 0.85rem; font-weight: 700; padding: 14px; background: #E8500A; border: none; color: #FFFFFF; border-radius: 10px; cursor: pointer; min-height: 48px; transition: background 0.12s; }
  .prog-new-btn:hover, .prog-new-btn:active { background: #C94209; }

  .ai-generate-btn { font-family: inherit; font-size: 0.75rem; font-weight: 700; padding: 8px 16px; background: #1D4ED8; border: none; color: #FFFFFF; border-radius: 8px; cursor: pointer; min-height: 36px; transition: background 0.12s; }
  .ai-generate-btn:hover { background: #1E40AF; }
  .ai-generate-btn:disabled { background: #AEAEB2; cursor: default; }
  .ai-spinner { width: 16px; height: 16px; border: 2px solid #D1D1D6; border-top-color: #E8500A; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
