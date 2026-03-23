import { useState, useRef, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const C = {
  accent:     "#E8500A", accentDark: "#C94209", accentBg: "#FFF3EE",
  bg:         "#EEEEF3", surface:    "#FFFFFF",
  border:     "#D1D1D6", borderLight:"#E5E5EA",
  text:       "#1C1C1E", textSub:    "#3A3A3C", textMuted: "#6B6B6B",
  textFaint:  "#8E8E93", textGhost:  "#AEAEB2",
  green:      "#16A34A", greenBg:    "#DCFCE7",
  orange:     "#EA580C", orangeBg:   "#FFEDD5",
  red:        "#DC2626", redBg:      "#FEE2E2",
  blue:       "#1D4ED8", blueBg:     "#DBEAFE",
};

const VOLUME   = { maintain: 5, bon: 12 }; // 1-5 MAINTIEN · 6-12 BON · 13+ PRIO
const BAR_MAX  = 18;
const MIN_SETS = 1;
const MAX_SETS = 20;

// ─── WEEK STRUCTURE ───────────────────────────────────────────────────────────

const DAY_KEYS   = ["lun","mar","mer","jeu","ven","sam","dim"];
const DAY_LABELS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const DAY_LONG   = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

// ─── TIER DATA ────────────────────────────────────────────────────────────────

const TIER = {
  "S+": { color:"#92400E", bg:"#FEF3C7", label:"Meilleur choix absolu. Tension maximale sur toute la plage de mouvement, ratio stimulus/fatigue exceptionnel." , movement:"neutral" },
  "S": { color:"#78350F", bg:"#FDE68A", label:"Excellent exercice. Très efficace pour l'hypertrophie, difficulté d'exécution raisonnable." , movement:"neutral" },
  "A+": { color:"#166534", bg:"#DCFCE7", label:"Très bon choix. Légèrement en dessous du S sur un critère spécifique." , movement:"neutral" },
  "A": { color:"#15803D", bg:"#D1FAE5", label:"Bon exercice polyvalent et éprouvé. Solide dans n'importe quel programme." , movement:"neutral" },
  "B+": { color:"#1E40AF", bg:"#DBEAFE", label:"Solide avec quelques limitations mécaniques mineures." , movement:"neutral" },
  "B": { color:"#1D4ED8", bg:"#EFF6FF", label:"Acceptable mais des alternatives plus efficaces existent." , movement:"neutral" },
  "C": { color:"#6B7280", bg:"#F3F4F6", label:"Moyen. À utiliser en complément seulement, pas comme mouvement principal." , movement:"neutral" },
  "D": { color:"#9CA3AF", bg:"#F9FAFB", label:"Peu efficace pour l'hypertrophie. Beaucoup mieux disponible." , movement:"neutral" },
  "F": { color:"#DC2626", bg:"#FEF2F2", label:"Déconseillé. Mauvais ratio stimulus/fatigue ou risque de blessure élevé." , movement:"neutral" },
  "F-": { color:"#991B1B", bg:"#FEE2E2", label:"À éviter absolument." , movement:"neutral" },
};
const TIER_ORDER = ["S+","S","A+","A","B+","B","C","D","F","F-"];

// ─── EXERCISE DATABASE ────────────────────────────────────────────────────────

const EXERCISE_DB = {
  // ── Pectoraux ──
  "Presse pectoraux machine": { tier:"S+", primary:["Pectoraux"], secondary:["Triceps"],           desc:"Isole parfaitement les pectoraux avec une tension constante sur toute la plage. La machine stabilise la trajectoire — idéal pour maximiser la contraction sans compenser. Note S+ car tension maximale en étirement et contraction." , movement:"push" },
  "Écarté câble assis": { tier:"S",  primary:["Pectoraux"], secondary:[],                   desc:"Le câble maintient une tension constante contrairement aux haltères qui perdent en tension en haut. Excellent finisseur ou exercice d'isolation principal pour les pectoraux." , movement:"push" },
  "Développé couché barre": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Exercice de force fondamental. Moins efficace que la machine pour l'isolation pure car la stabilisation divise le stimulus, mais excellent pour développer la force brute et la masse globale." , movement:"push" },
  "Développé incliné barre": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"L'inclinaison accentue le faisceau claviculaire. La barre permet plus de charge que les haltères. Bon exercice de masse pour le haut des pectoraux." , movement:"push" },
  "Développé couché haltères": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Plus grande plage de mouvement que la barre. Chaque bras travaille indépendamment ce qui révèle les déséquilibres. Excellent pour l'hypertrophie pectorale." , movement:"push" },
  "Développé incliné haltères": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"L'inclinaison accentue le faisceau claviculaire. Les haltères permettent une plage de mouvement plus complète qu'une barre. Bon exercice multiarticulaire pour le haut des pectoraux." , movement:"push" },
  "Dips lestés": { tier:"A",  primary:["Pectoraux","Triceps"], secondary:["Épaules"], desc:"Exercice au poids du corps lestable. L'inclinaison du tronc vers l'avant accentue les pectoraux. Excellent rapport force/hypertrophie." , movement:"push" },
  "Pompes déficit": { tier:"A",  primary:["Pectoraux"], secondary:["Triceps","Épaules"], desc:"Le déficit augmente la plage de mouvement et l'étirement pectoral. Version plus efficace que la pompe classique pour l'hypertrophie." , movement:"push" },
  "Développé couché Smith": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"La Smith machine guide la trajectoire et permet de pousser plus lourd en sécurité. Moins de travail stabilisateur mais stimulus pectoral similaire à la barre libre." , movement:"push" },
  "Développé incliné Smith": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Version inclinée sur Smith. Sécurisé, permet de progresser en charge. Bon pour le haut des pectoraux." , movement:"push" },
  "Croisé poulies": { tier:"A",  primary:["Pectoraux"], secondary:[],                   desc:"La hauteur du câble modifie l'angle de travail (bas = faisceau inférieur, haut = supérieur). Tension constante, grande plage. Très polyvalent." , movement:"push" },
  "Peck deck": { tier:"A",  primary:["Pectoraux"], secondary:[],                   desc:"Isolation complète des pectoraux avec tension constante en contraction. La machine guide le mouvement et sécurise les épaules. Excellent finisseur." , movement:"push" },
  "Écarté haltères": { tier:"A",  primary:["Pectoraux"], secondary:[],                   desc:"Grand classique d'isolation. Les haltères perdent en tension en haut du mouvement, mais l'étirement en bas est excellent." , movement:"push" },
  "Développé décliné barre": { tier:"B",  primary:["Pectoraux"], secondary:["Triceps"],           desc:"Accentue le faisceau sternal inférieur. Moins polyvalent que le développé couché classique, rarement nécessaire." , movement:"push" },
  "Développé décliné haltères": { tier:"B",  primary:["Pectoraux"], secondary:["Triceps"],           desc:"Version déclinée avec haltères. Plage de mouvement correcte mais intérêt limité par rapport aux autres angles." , movement:"push" },
  "Pompes élastiques": { tier:"B",  primary:["Pectoraux"], secondary:["Triceps"],           desc:"L'élastique augmente la résistance en fin de mouvement. Bonne option sans matériel mais charge maximale limitée." , movement:"push" },
  "Pompes": { tier:"C",  primary:["Pectoraux"], secondary:["Triceps","Épaules"], desc:"Base mais vite limitant pour l'hypertrophie une fois qu'on peut faire plus de 20 répétitions. À charger ou remplacer." , movement:"push" },
  "Développé sol": { tier:"C",  primary:["Pectoraux"], secondary:["Triceps"],           desc:"La plage de mouvement est limitée par le sol. Acceptable en dépannage mais beaucoup mieux disponible." , movement:"push" },
  "Pull-over haltère": { tier:"D",  primary:["Dos","Pectoraux"], secondary:[],              desc:"L'intérêt est discutable — ni vraiment dos, ni vraiment pec. La tension est faible sur toute la plage." , movement:"neutral" },
  // ── Dos ──
  "Tirage vertical prise large": { tier:"S",  primary:["Dos"], secondary:["Biceps"],                  desc:"Le tirage vertical simule le mouvement de traction avec une charge modulable. La prise large accentue le grand dorsal." , movement:"pull" },
  "Tirage vertical prise neutre": { tier:"S",  primary:["Dos"], secondary:["Biceps"],                  desc:"La prise neutre est la position la plus forte et naturelle pour le coude. Moins de stress articulaire qu'en pronation." , movement:"pull" },
  "Tirage vertical 1 bras": { tier:"S",  primary:["Dos"], secondary:["Biceps"],                  desc:"Unilatéral permet un étirement supérieur et corrige les déséquilibres. Excellent pour la largeur du dos." , movement:"pull" },
  "Meadows row": { tier:"S",  primary:["Dos"], secondary:["Biceps"],                  desc:"Position unilatérale à la barre T. Plage complète et étirement exceptionnel du grand dorsal. Très efficace pour l'épaisseur et la largeur." , movement:"pull" },
  "Rowing buste appuyé": { tier:"S",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"La poitrine appuyée élimine l'élan et force le dos à travailler isolément. Excellent pour les rhomboïdes et le milieu du dos." , movement:"pull" },
  "Rowing câble": { tier:"S",  primary:["Dos"], secondary:["Biceps"],                  desc:"Tension constante sur toute la plage grâce au câble. Excellent exercice bilatéral pour l'épaisseur du dos." , movement:"pull" },
  "Rowing câble prise large": { tier:"S",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"La prise large accentue les rhomboïdes et le milieu du dos. Bonne alternative pour varier les angles." , movement:"pull" },
  "Tractions prise large": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Le mouvement de traction est fondamental. Prise large = accent sur le grand dorsal pour la largeur." , movement:"pull" },
  "Tractions prise neutre": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Position la plus forte mécaniquement. Excellent compromis entre dos et biceps." , movement:"pull" },
  "Tirage vertical croisé 1 bras": { tier:"A",  primary:["Dos"], secondary:["Biceps"],                  desc:"Le câble croisé permet un angle et un étirement différent du tirage vertical classique." , movement:"pull" },
  "Pendlay row déficit": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Le déficit augmente la plage de mouvement. Mouvement explosif qui développe la puissance du dos." , movement:"pull" },
  "Rowing haltère 1 bras": { tier:"A",  primary:["Dos"], secondary:["Biceps"],                  desc:"Classique unilatéral. Bonne plage de mouvement, permet beaucoup de charge." , movement:"pull" },
  "Kroc row": { tier:"A",  primary:["Dos"], secondary:["Biceps","Avant-bras"],      desc:"Version lourde et partielle du rowing haltère. Développe la force de préhension et l'épaisseur du dos." , movement:"pull" },
  "Tractions lestées": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Le mouvement de traction est un des plus efficaces pour le dos. Les lester dès qu'on dépasse 10-12 répétitions." , movement:"pull" },
  "Tractions prise supination": { tier:"B",  primary:["Dos","Biceps"], secondary:["Trapèzes"],        desc:"La supination implique plus les biceps. Bon exercice mais le dos est moins isolé qu'en pronation." , movement:"pull" },
  "Rowing barre": { tier:"B",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Efficace mais la triche avec le bas du dos est commune. Exécution stricte requise." , movement:"pull" },
  "Pendlay row": { tier:"B",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Mouvement depuis le sol, bonne exécution. Moins de plage que le Pendlay en déficit." , movement:"pull" },
  "Face pull corde": { tier:"B",  primary:["Épaules","Trapèzes"], secondary:[],            desc:"Excellent pour la santé des épaules et le travail des rotateurs externes. Sous-utilisé dans la plupart des programmes." , movement:"pull" },
  "Soulevé de terre": { tier:"C",  primary:["Dos","Ischio-jambiers","Fessiers"], secondary:["Trapèzes"], desc:"Excellent pour la force mais sous-optimal pour l'hypertrophie isolée du dos. La fatigue systémique élevée réduit la fréquence possible." , movement:"neutral" },
  "Yates row": { tier:"C",  primary:["Dos"], secondary:["Biceps"],                  desc:"Version semi-inclinée. La position debout permet de la triche facilement." , movement:"pull" },
  "Rowing inversé": { tier:"C",  primary:["Dos"], secondary:["Biceps","Trapèzes"],        desc:"Au poids du corps, bien pour les débutants. Vite trop facile." , movement:"pull" },
  "T-bar row": { tier:"C",  primary:["Dos"], secondary:["Biceps"],                  desc:"Efficace mais la position peut stresser les lombaires si exécution imparfaite." , movement:"pull" },
  "Rack pull": { tier:"D",  primary:["Dos"], secondary:["Trapèzes"],                 desc:"Plage partielle du soulevé de terre. Peu de stimulus d'hypertrophie, surtout un exercice de force partielle." , movement:"neutral" },
  "Renegade row": { tier:"F",  primary:["Dos"], secondary:[],                          desc:"La stabilisation en planche limite la charge possible. Mauvais ratio stimulus/fatigue pour le dos." , movement:"pull" },
  // ── Épaules ──
  "Élévations latérales câble": { tier:"S",  primary:["Épaules"], secondary:[],                      desc:"Le câble maintient la tension en bas du mouvement là où les haltères n'en ont aucune. Meilleur choix pour le deltoïde latéral." , movement:"neutral" },
  "Cable Y raise": { tier:"S",  primary:["Épaules"], secondary:["Trapèzes"],             desc:"Cible le deltoïde postérieur et les trapèzes moyens. Excellent pour l'équilibre et la santé de l'épaule." , movement:"pull" },
  "Élévations latérales câble dos": { tier:"S",  primary:["Épaules"], secondary:[],                      desc:"Angle différent qui cible mieux le deltoïde latéral en position d'étirement." , movement:"pull" },
  "Oiseau machine": { tier:"S",  primary:["Épaules"], secondary:["Trapèzes"],             desc:"Isole le deltoïde postérieur avec tension constante. Indispensable pour les épaules arrière." , movement:"pull" },
  "Croisé poulies inverse": { tier:"S",  primary:["Épaules"], secondary:["Trapèzes"],             desc:"Version câble de l'oiseau. Tension constante, excellent pour le deltoïde postérieur." , movement:"pull" },
  "Développé épaules machine": { tier:"A+", primary:["Épaules"], secondary:["Triceps"],              desc:"La machine guide la trajectoire. Permet de se concentrer sur le deltoïde antérieur sans stabilisation. Souvent mieux toléré que la barre." , movement:"push" },
  "Élévations latérales inclinées": { tier:"A",  primary:["Épaules"], secondary:[],                      desc:"L'inclinaison met le deltoïde en position d'étirement au départ. Excellent pour maximiser la plage de mouvement." , movement:"neutral" },
  "Développé militaire haltères": { tier:"A",  primary:["Épaules"], secondary:["Triceps"],              desc:"Les haltères permettent plus de liberté de mouvement que la barre. Bon exercice de masse pour les épaules." , movement:"push" },
  "Élévations latérales allongé": { tier:"A",  primary:["Épaules"], secondary:[],                      desc:"Position allongée = étirement maximal du deltoïde latéral. Charge légère mais stimulus élevé." , movement:"neutral" },
  "Arnold press": { tier:"A",  primary:["Épaules"], secondary:["Triceps"],              desc:"La rotation implique les 3 faisceaux du deltoïde. Plus complet qu'un développé classique mais plus complexe techniquement." , movement:"push" },
  "Développé militaire barre": { tier:"B+", primary:["Épaules"], secondary:["Triceps"],              desc:"Force debout fondamentale. Bon pour la force générale mais la barre limite la plage et les stabilisateurs divisent l'effort." , movement:"push" },
  "Élévations latérales haltères": { tier:"B",  primary:["Épaules"], secondary:[],                      desc:"Grand classique mais la tension est quasi nulle en bas du mouvement. Le câble est supérieur pour l'isolation." , movement:"neutral" },
  "Oiseau haltères": { tier:"B",  primary:["Épaules"], secondary:[],                      desc:"Même remarque que les élévations — la tension est faible en bas. La machine ou le câble sont préférables." , movement:"pull" },
  "Élévations latérales machine": { tier:"B",  primary:["Épaules"], secondary:[],                      desc:"Tension constante selon la machine. Moins polyvalent que le câble mais acceptable." , movement:"neutral" },
  "Tirage menton": { tier:"B",  primary:["Épaules","Trapèzes"], secondary:["Biceps"],    desc:"Ciblage du deltoïde latéral et des trapèzes. L'élévation au-dessus de l'épaule peut stresser l'articulation acromio-claviculaire." , movement:"pull" },
  "Élévations latérales élastique": { tier:"C",  primary:["Épaules"], secondary:[],                      desc:"Charge très limitée. Utile en réchauffement ou sans matériel mais pas idéal pour l'hypertrophie." , movement:"neutral" },
  "Élévations frontales": { tier:"D",  primary:["Épaules"], secondary:[],                      desc:"Le deltoïde antérieur est déjà très sollicité dans tous les mouvements de poussée. Cet exercice est rarement nécessaire." , movement:"push" },
  // ── Biceps ──
  "Bayesian curl face away": { tier:"S+", primary:["Biceps"], secondary:[],                       desc:"Face au câble = biceps en étirement maximal (épaule en extension). Maximise le stimulus d'hypertrophie. Un des rares exercices qui coche toutes les cases." , movement:"pull" },
  "Curl pupitre haltère": { tier:"S",  primary:["Biceps"], secondary:[],                       desc:"Le pupitre élimine la triche et force le biceps à travailler sur toute la plage. L'haltère permet une supination complète au sommet." , movement:"pull" },
  "Curl pupitre machine": { tier:"S",  primary:["Biceps"], secondary:[],                       desc:"Version machine du curl pupitre. Tension constante, idéal pour l'isolation." , movement:"pull" },
  "Curl marteau pupitre": { tier:"S",  primary:["Biceps"], secondary:["Avant-bras"],            desc:"Cible le brachial et le brachioradial en plus du biceps. Excellent pour l'épaisseur du bras." , movement:"pull" },
  "Curl barre EZ": { tier:"A",  primary:["Biceps"], secondary:[],                       desc:"La forme EZ réduit le stress sur les poignets et les coudes. Permet plus de charge que les haltères pour beaucoup de pratiquants." , movement:"pull" },
  "Curl haltères debout": { tier:"A",  primary:["Biceps"], secondary:[],                       desc:"Grand classique. La supination en haut maximise la contraction du biceps. Charge bilatérale modifiable." , movement:"pull" },
  "Curl incliné": { tier:"A",  primary:["Biceps"], secondary:[],                       desc:"Position inclinée = épaule en extension = étirement maximal du biceps. Excellent pour le chef long." , movement:"pull" },
  "Curl haltères allongé": { tier:"A",  primary:["Biceps"], secondary:[],                       desc:"Position allongée crée un étirement similaire au curl incliné. Tension maximale en position d'étirement." , movement:"pull" },
  "Curl câble debout": { tier:"A",  primary:["Biceps"], secondary:[],                       desc:"Le câble maintient une tension constante contrairement aux haltères. Excellente option d'isolation." , movement:"pull" },
  "Curl marteau": { tier:"A",  primary:["Biceps"], secondary:["Avant-bras"],            desc:"Prise neutre cible le brachial. Complément utile au curl classique pour un développement complet du bras." , movement:"pull" },
  "Curl barre": { tier:"B",  primary:["Biceps"], secondary:[],                       desc:"Efficace mais la barre droite peut stresser les poignets. La barre EZ est généralement préférable." , movement:"pull" },
  "Curl Scott": { tier:"C",  primary:["Biceps"], secondary:[],                       desc:"Le pupitre Scott limite la plage en haut du mouvement. Le curl pupitre classique est supérieur." , movement:"pull" },
  "Drag curl": { tier:"C",  primary:["Biceps"], secondary:[],                       desc:"Le mouvement vers l'arrière accentue le chef court. Intéressant mais peu praticable avec charge élevée." , movement:"pull" },
  "Spider curl": { tier:"C",  primary:["Biceps"], secondary:[],                       desc:"Bonne isolation mais la position est inconfortable et limite la charge." , movement:"pull" },
  // ── Triceps ──
  "Extension triceps câble barre": { tier:"S+", primary:["Triceps"], secondary:[],                      desc:"Coude fléchi par-dessus la tête = chef long du triceps en étirement maximal. La barre donne une prise stable. Meilleur exercice d'isolation pour le triceps." , movement:"push" },
  "Barre front (Skullcrusher)": { tier:"S",  primary:["Triceps"], secondary:[],                      desc:"Étirement maximal du triceps en position allongée. La barre EZ réduit le stress sur les poignets. Un des meilleurs pour le chef long." , movement:"push" },
  "Pushdown barre": { tier:"A",  primary:["Triceps"], secondary:[],                      desc:"Bon exercice d'isolation. La barre permet une prise stable et une charge élevée." , movement:"push" },
  "Extension triceps câble corde": { tier:"A",  primary:["Triceps"], secondary:[],                      desc:"La corde permet une supination en fin de mouvement pour une contraction maximale. Version plus intense que la barre." , movement:"push" },
  "Extension triceps haltère 1 bras": { tier:"A",  primary:["Triceps"], secondary:[],                      desc:"Unilatéral au-dessus de la tête = chef long en étirement. Correction des déséquilibres possible." , movement:"push" },
  "Skullcrusher haltères": { tier:"A",  primary:["Triceps"], secondary:[],                      desc:"Version haltères du skullcrusher. Plus de liberté de mouvement, bon pour l'hypertrophie." , movement:"push" },
  "JM press Smith": { tier:"A",  primary:["Triceps"], secondary:[],                      desc:"Hybride entre développé et extension. La Smith sécurise la trajectoire. Excellent pour la masse." , movement:"push" },
  "Kickback câble": { tier:"A",  primary:["Triceps"], secondary:[],                      desc:"Le câble maintient la tension tout au long du mouvement. Supérieur au kickback haltère pour l'isolation." , movement:"push" },
  "Développé couché prise serrée": { tier:"A",  primary:["Triceps"], secondary:["Pectoraux","Épaules"],  desc:"Exercice composé qui permet beaucoup de charge sur les triceps. La prise serrée accentue le travail des triceps." , movement:"push" },
  "Pushdown corde": { tier:"B",  primary:["Triceps"], secondary:[],                      desc:"Populaire mais la rotation en fin de mouvement réduit la tension. La barre est généralement supérieure." , movement:"push" },
  "Extension nuque haltère": { tier:"B",  primary:["Triceps"], secondary:[],                      desc:"Au-dessus de la tête = chef long en étirement. Version bilatérale pratique mais moins précise qu'un bras." , movement:"push" },
  "JM press": { tier:"B",  primary:["Triceps"], secondary:[],                      desc:"Version à la barre libre du JM press. Bonne surcharge mais technique difficile à maîtriser." , movement:"push" },
  "Dips prise serrée": { tier:"B",  primary:["Triceps"], secondary:["Pectoraux"],            desc:"Poids du corps, lestable. Moins spécifique au triceps que les extensions mais bonne surcharge." , movement:"push" },
  "Dips machine": { tier:"B",  primary:["Triceps"], secondary:[],                      desc:"Version assistée/lestée. Bonne option pour progresser ou varier." , movement:"push" },
  "Pompes diamant": { tier:"B",  primary:["Triceps"], secondary:["Pectoraux"],            desc:"Poids du corps. Vite limité en charge, à lester ou remplacer pour progresser." , movement:"push" },
  "Dips banc": { tier:"C",  primary:["Triceps"], secondary:[],                      desc:"Charge très limitée et stress potentiel sur les épaules. Peu efficace pour l'hypertrophie." , movement:"push" },
  "Kickback haltère": { tier:"C",  primary:["Triceps"], secondary:[],                      desc:"Tension minimale sur la majeure partie du mouvement. Le câble est bien supérieur." , movement:"push" },
  // ── Quadriceps ──
  "Hack squat": { tier:"S+", primary:["Quadriceps"], secondary:["Fessiers"],          desc:"Charge le quadriceps sans contrainte lombaire excessive. Le dossier incliné permet une profondeur optimale. Souvent supérieur au squat barre pour l'hypertrophie pure du quad." , movement:"neutral" },
  "Squat barre": { tier:"S",  primary:["Quadriceps","Fessiers"], secondary:["Ischio-jambiers"], desc:"Roi des exercices de jambes pour la force. Pour l'hypertrophie pure du quad, le hack squat ou la presse sont souvent supérieurs, mais reste excellent pour le développement global." , movement:"neutral" },
  "Pendulum squat": { tier:"S",  primary:["Quadriceps"], secondary:["Fessiers"],          desc:"Trajectoire guidée en arc qui permet une profondeur maximale sans contrainte lombaire. Un des meilleurs exercices machine pour le quad." , movement:"neutral" },
  "Squat Smith": { tier:"S",  primary:["Quadriceps","Fessiers"], secondary:[],         desc:"La Smith machine guide la trajectoire. Permet de pousser plus lourd en sécurité, bon pour l'hypertrophie." , movement:"neutral" },
  "Fentes bulgares": { tier:"S",  primary:["Quadriceps","Fessiers"], secondary:["Ischio-jambiers"], desc:"Unilatéral qui révèle et corrige les déséquilibres. Étirement profond du fléchisseur de hanche. Difficile mais excellent." , movement:"neutral" },
  "Squat avant": { tier:"A",  primary:["Quadriceps"], secondary:["Fessiers"],          desc:"Posture plus verticale que le squat arrière = plus de quad, moins de dos. Excellent pour l'hypertrophie du quad." , movement:"neutral" },
  "Squat barre basse": { tier:"A",  primary:["Quadriceps","Fessiers"], secondary:[],         desc:"Permet plus de charge mais le tronc est plus incliné, ce qui engage plus les fessiers et ischios." , movement:"neutral" },
  "Presse 45°": { tier:"A",  primary:["Quadriceps","Fessiers"], secondary:[],         desc:"Permet une charge très élevée avec peu de risque. L'écartement des pieds modifie le muscle ciblé." , movement:"neutral" },
  "Leg extension": { tier:"A",  primary:["Quadriceps"], secondary:[],                    desc:"Seul exercice d'isolation pure du quadriceps. Tension maximale en contraction. Indispensable pour finir les quads." , movement:"neutral" },
  "Nordic inverse": { tier:"A",  primary:["Quadriceps"], secondary:[],                    desc:"Excentrique pour le quad. Difficile mais excellent pour l'hypertrophie et la prévention des blessures." , movement:"neutral" },
  "Fentes": { tier:"B",  primary:["Quadriceps","Fessiers"], secondary:["Ischio-jambiers"], desc:"Exercice fonctionnel unilatéral. Moins de charge que le squat mais bon développement global." , movement:"neutral" },
  "Goblet squat": { tier:"B",  primary:["Quadriceps","Fessiers"], secondary:[],         desc:"Excellent pour apprendre le squat. Charge limitée à long terme mais bonne option avec haltère." , movement:"neutral" },
  "Sissy squat": { tier:"B",  primary:["Quadriceps"], secondary:[],                    desc:"Étirement extrême du quad. Stress élevé sur les genoux — à utiliser prudemment." , movement:"neutral" },
  "Presse horizontale": { tier:"C",  primary:["Quadriceps"], secondary:["Fessiers"],          desc:"Moins efficace que la presse 45° en raison de la position couchée qui modifie la mécanique." , movement:"neutral" },
  "Step-ups": { tier:"C",  primary:["Quadriceps","Fessiers"], secondary:[],         desc:"Fonctionnel mais charge maximale limitée et exécution variable. Peu optimal pour l'hypertrophie pure." , movement:"neutral" },
  "Pistol squat": { tier:"C",  primary:["Quadriceps","Fessiers"], secondary:[],         desc:"Très technique. La difficulté d'équilibre limite la progression en hypertrophie." , movement:"neutral" },
  "Squat sauté": { tier:"F",  primary:["Quadriceps"], secondary:[],                    desc:"Exercice pliométrique — bon pour la puissance mais inutile voire contre-productif pour l'hypertrophie." , movement:"neutral" },
  "Squat Bosu": { tier:"F-", primary:["Quadriceps"], secondary:[],                    desc:"L'instabilité réduit la charge et ne correspond à aucun stimulus utile pour l'hypertrophie. À éviter." , movement:"neutral" },
  // ── Fessiers ──
  "Fentes marchées": { tier:"S",  primary:["Fessiers","Quadriceps"], secondary:["Ischio-jambiers"], desc:"Dynamique et fonctionnel. L'allongement de la foulée accentue les fessiers, la réduction accentue les quads." , movement:"neutral" },
  "Abduction machine": { tier:"S",  primary:["Fessiers"], secondary:[],                      desc:"Isole le moyen fessier souvent négligé par les composés. Tension constante. Indispensable pour un développement complet." , movement:"neutral" },
  "Extension dos 45°": { tier:"S",  primary:["Fessiers","Ischio-jambiers"], secondary:["Dos"], desc:"Un des rares exercices qui travaille les fessiers et ischios en étirement simultané. L'angle 45° est optimal." , movement:"neutral" },
  "Fentes Smith pied surélevé": { tier:"S",  primary:["Fessiers","Quadriceps"], secondary:[],         desc:"Le pied surélevé augmente la plage et l'étirement des fessiers. Excellent pour les fessiers en particulier." , movement:"neutral" },
  "Hip thrust machine": { tier:"A",  primary:["Fessiers"], secondary:["Ischio-jambiers"],     desc:"Extension de hanche avec charge externe — stimulus direct sur le grand fessier. La machine sécurise la charge." , movement:"neutral" },
  "Hip thrust 1 jambe haltère": { tier:"A",  primary:["Fessiers"], secondary:["Ischio-jambiers"],     desc:"Version unilatérale qui corrige les déséquilibres et augmente l'activation par côté." , movement:"neutral" },
  "Kickbacks fessiers": { tier:"A",  primary:["Fessiers"], secondary:[],                      desc:"Isolation des fessiers en extension de hanche. Bon exercice si résistance suffisante (câble ou machine)." , movement:"neutral" },
  "Soulevé de terre Roumain": { tier:"A",  primary:["Ischio-jambiers","Fessiers"], secondary:["Dos"], desc:"Excellent exercice d'étirement pour les ischios et les fessiers. Focus maximal sur la chaîne postérieure." , movement:"neutral" },
  "Hip thrust barre": { tier:"B",  primary:["Fessiers"], secondary:["Ischio-jambiers"],     desc:"Version classique au poids de corps ou avec barre. Efficace mais la mise en place est contraignante." , movement:"neutral" },
  "Glute bridge": { tier:"B",  primary:["Fessiers"], secondary:["Ischio-jambiers"],     desc:"Version au sol du hip thrust. Plage de mouvement plus limitée mais accessible sans banc." , movement:"neutral" },
  "Abduction câble": { tier:"B",  primary:["Fessiers"], secondary:[],                      desc:"Tension constante du câble. Bonne option si la machine d'abduction n'est pas disponible." , movement:"neutral" },
  "Fentes curtsy": { tier:"B",  primary:["Fessiers","Quadriceps"], secondary:[],         desc:"Cible le moyen fessier et l'abducteur. Complémentaire aux fentes classiques." , movement:"neutral" },
  "Soulevé de terre sumo": { tier:"B",  primary:["Fessiers","Ischio-jambiers"], secondary:["Dos"], desc:"L'écartement large accentue les adducteurs et les fessiers. Bon pour varier la chaîne postérieure." , movement:"neutral" },
  "Frog pumps": { tier:"C",  primary:["Fessiers"], secondary:[],                      desc:"Activation légère des fessiers. Utile en réchauffement mais peu de surcharge possible." , movement:"neutral" },
  "Donkey kicks": { tier:"D",  primary:["Fessiers"], secondary:[],                      desc:"Très peu de charge possible, activation limitée. Remplacer par du câble ou une machine." , movement:"neutral" },
  "Kettlebell swing": { tier:"D",  primary:["Fessiers","Ischio-jambiers"], secondary:[],    desc:"Plus un exercice de puissance que d'hypertrophie. Le stimulus est faible pour développer la masse." , movement:"neutral" },
  // ── Ischio-jambiers ──
  "Nordic curl": { tier:"S+", primary:["Ischio-jambiers"], secondary:[],               desc:"Étirement excentrique sous charge maximale — le stimulus le plus efficace pour l'hypertrophie des ischios. Très difficile mais irremplaçable." , movement:"neutral" },
  "Leg curl assis": { tier:"S",  primary:["Ischio-jambiers"], secondary:[],               desc:"Position assise = hanche fléchie = ischios en étirement au niveau de l'origine. Supérieur au leg curl couché pour l'hypertrophie." , movement:"neutral" },
  "Leg curl couché": { tier:"A",  primary:["Ischio-jambiers"], secondary:[],               desc:"Version classique. Moins d'étirement que le leg curl assis mais reste un bon exercice d'isolation." , movement:"neutral" },
  "Soulevé de terre jambes tendues": { tier:"B",  primary:["Ischio-jambiers","Fessiers"], secondary:["Dos"], desc:"Étirement important des ischios. Attention au dos si la technique n'est pas maîtrisée." , movement:"neutral" },
  "Good morning": { tier:"B",  primary:["Ischio-jambiers","Dos"], secondary:["Fessiers"], desc:"Exercice technique avec barre sur la nuque. Bon étirement des ischios mais technique exigeante." , movement:"neutral" },
  // ── Mollets ──
  "Mollets assis": { tier:"S",  primary:["Mollets"], secondary:[],                       desc:"Cible le soléaire (muscle profond) qui est actif quand le genou est fléchi. Indispensable en complément des mollets debout." , movement:"neutral" },
  "Mollets debout": { tier:"A",  primary:["Mollets"], secondary:[],                       desc:"Cible le gastrocnémien. Jambe tendue = chef externe du gastro en position d'étirement." , movement:"neutral" },
  "Mollets presse": { tier:"A",  primary:["Mollets"], secondary:[],                       desc:"Permet une charge très élevée et une plage de mouvement complète. Bonne option sur la presse à jambes." , movement:"neutral" },
  // ── Abdominaux ──
  "Cable crunch": { tier:"S",  primary:["Abdominaux"], secondary:[],                    desc:"Le câble maintient une résistance constante sur toute la plage. Charge progressive possible. Meilleur exercice d'isolation pour les abdominaux." , movement:"neutral" },
  "Ab wheel": { tier:"A",  primary:["Abdominaux"], secondary:[],                    desc:"Excellent exercice de gainage dynamique. La roue engage les abdominaux sur toute leur longueur." , movement:"neutral" },
  "Relevé de jambes suspendu": { tier:"A",  primary:["Abdominaux"], secondary:[],                    desc:"Très efficace pour le bas des abdominaux. Difficile mais excellent une fois maîtrisé." , movement:"neutral" },
  "Crunch": { tier:"C",  primary:["Abdominaux"], secondary:[],                    desc:"Base mais plage de mouvement limitée. Le cable crunch offre beaucoup plus de surcharge possible." , movement:"neutral" },
  "Planche": { tier:"C",  primary:["Abdominaux"], secondary:[],                    desc:"Bon gainage statique mais peu de stimulus d'hypertrophie. Le dynamic crunch est supérieur." , movement:"neutral" },
  "Russian twist": { tier:"C",  primary:["Abdominaux"], secondary:[],                    desc:"Cible les obliques mais avec peu de charge possible. Intérêt limité pour l'hypertrophie." , movement:"neutral" },
};

const ALL_MUSCLES = [
  "Pectoraux","Dos","Épaules","Biceps","Triceps",
  "Quadriceps","Ischio-jambiers","Fessiers","Mollets",
  "Trapèzes","Abdominaux","Avant-bras",
];

const MUSCLE_COLOR = {
  "Pectoraux":"#FF4444","Dos":"#3B82F6","Épaules":"#F59E0B","Biceps":"#22C55E",
  "Triceps":"#A855F7","Quadriceps":"#EC4899","Ischio-jambiers":"#FB923C",
  "Fessiers":"#06B6D4","Mollets":"#84CC16","Trapèzes":"#8B5CF6",
  "Abdominaux":"#14B8A6","Avant-bras":"#D946EF",
};

const MUSCLE_EMOJI = {
  "Pectoraux":"💪","Dos":"🔷","Épaules":"⚡","Biceps":"💚",
  "Triceps":"💜","Quadriceps":"🦵","Ischio-jambiers":"🔶",
  "Fessiers":"🔵","Mollets":"🟢","Trapèzes":"🔮","Abdominaux":"⬜","Avant-bras":"🦾",
};

// ─── DEMO WEEK ────────────────────────────────────────────────────────────────
// week = array of 7 (DAY_KEYS order). null = repos. object = session.

const DEMO_WEEK = [
  { id:"d1", name:"Push — A", exercises:[
    { id:"e1", name:"Développé couché barre",        sets:4 },
    { id:"e2", name:"Développé incliné haltères",    sets:3 },
    { id:"e3", name:"Développé militaire barre",     sets:3 },
    { id:"e4", name:"Élévations latérales câble",    sets:4 },
    { id:"e5", name:"Extension triceps câble barre", sets:3 },
  ]},
  { id:"d2", name:"Pull — B", exercises:[
    { id:"e6",  name:"Tractions lestées",            sets:4 },
    { id:"e7",  name:"Rowing buste appuyé",          sets:4 },
    { id:"e8",  name:"Tirage vertical prise neutre", sets:3 },
    { id:"e9",  name:"Curl barre EZ",                sets:3 },
    { id:"e10", name:"Curl marteau",                 sets:3 },
  ]},
  null,
  { id:"d3", name:"Legs — C", exercises:[
    { id:"e11", name:"Squat barre",              sets:4 },
    { id:"e12", name:"Soulevé de terre Roumain", sets:3 },
    { id:"e13", name:"Leg extension",            sets:3 },
    { id:"e14", name:"Leg curl assis",           sets:3 },
    { id:"e15", name:"Mollets debout",           sets:4 },
  ]},
  { id:"d4", name:"Push — B", exercises:[
    { id:"e16", name:"Presse pectoraux machine",  sets:4 },
    { id:"e17", name:"Écarté câble assis",        sets:3 },
    { id:"e18", name:"Développé épaules machine", sets:3 },
    { id:"e19", name:"Élévations latérales câble",sets:4 },
    { id:"e20", name:"Barre front (Skullcrusher)",sets:3 },
  ]},
  null,
  null,
];

// ─── PURE UTILITIES ───────────────────────────────────────────────────────────

let _id = 200;
const uid      = () => `x${_id++}`;
const clamp    = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const toggle   = (arr, x)    => arr.includes(x) ? arr.filter(i => i !== x) : [...arr, x];
const sortByTier = (names, db) => [...names].sort((a,b) =>
  TIER_ORDER.indexOf(db[a]?.tier ?? "C") - TIER_ORDER.indexOf(db[b]?.tier ?? "C")
);

// days = sessions only (week.filter(Boolean))
function computeWeeklyVolume(days, db) {
  const vol = Object.fromEntries(ALL_MUSCLES.map(m => [m, 0]));
  days.forEach(day => day.exercises.forEach(ex => {
    const d = db[ex.name]; if (!d) return;
    d.primary.forEach(m   => { if (m in vol) vol[m] += ex.sets; });
    d.secondary.forEach(m => { if (m in vol) vol[m] += ex.sets * 0.5; });
  }));
  return vol;
}

function classifyVolume(sets) {
  if (sets === 0)               return "neutral";
  if (sets <= VOLUME.maintain)  return "maintain";
  if (sets <= VOLUME.bon)       return "bon";
  return "prio";
}

// ─── ANALYSIS ALGORITHMS ─────────────────────────────────────────────────────

// Push/pull ratio is calculated per exercise (movement tag), not per muscle group
// This handles edge cases like rear delt (pull) vs shoulder press (push)
const LEGS_MUSCLES  = ["Quadriceps","Ischio-jambiers","Fessiers"];
const MAJOR_MUSCLES = ["Pectoraux","Dos","Épaules","Quadriceps","Ischio-jambiers"];

function computePushPullSets(days, db) {
  let push = 0, pull = 0;
  days.forEach(day => day.exercises.forEach(ex => {
    const d = db[ex.name];
    const mv = d?.movement ?? "neutral";
    if (mv === "push") push += ex.sets;
    if (mv === "pull") pull += ex.sets;
  }));
  return { push, pull };
}

// Returns { muscle, dayA, dayB, dayALabel, dayBLabel } for each back-to-back conflict
function detectBackToBack(week, db) {
  const conflicts = [];
  for (let i = 0; i < 6; i++) {
    const dayA = week[i];
    const dayB = week[i + 1];
    if (!dayA || !dayB) continue;

    const musclesA = new Set();
    const musclesB = new Set();
    dayA.exercises.forEach(ex => { const d = db[ex.name]; if (d) d.primary.forEach(m => musclesA.add(m)); });
    dayB.exercises.forEach(ex => { const d = db[ex.name]; if (d) d.primary.forEach(m => musclesB.add(m)); });

    const overlap = [...musclesA].filter(m => musclesB.has(m));
    if (overlap.length > 0) {
      conflicts.push({ muscles: overlap, dayALabel: DAY_LABELS[i], dayBLabel: DAY_LABELS[i+1], dayAName: dayA.name, dayBName: dayB.name });
    }
  }
  return conflicts;
}

function computeProgramScore(weeklyVol, priorities, backToBack, days, db) {
  const totalSets = Object.values(weeklyVol).reduce((a,b) => a+b, 0);
  if (totalSets === 0) return { score: 0, grade:"—", color: C.textGhost, issues:[] };

  let score = 100;
  const issues = [];

  MAJOR_MUSCLES.forEach(m => {
    if ((weeklyVol[m] ?? 0) === 0) {
      score -= 8;
      issues.push({ icon:"⚠️", text:`${m} absent du programme`, severity:"high" });
    }
  });

  ALL_MUSCLES.forEach(m => {
    const p = priorities[m];
    const status = classifyVolume(weeklyVol[m] ?? 0);
    if (p === "priority" && (status === "neutral" || status === "maintain")) {
      score -= 12;
      issues.push({ icon:"🎯", text:`${m} priorité — volume insuffisant (${weeklyVol[m]??0} sér.)`, severity:"high" });
    }
    if (p === "maintain" && status === "prio") {
      score -= 5;
      issues.push({ icon:"🔒", text:`${m} maintien — volume excessif`, severity:"medium" });
    }
  });

  const { push: pushSets, pull: pullSets } = computePushPullSets(days, db);
  if (pushSets + pullSets > 0) {
    const ratio = pullSets / Math.max(pushSets, 1);
    if (ratio < 0.6)      { score -= 15; issues.push({ icon:"⚖️", text:`Push/pull déséquilibré — ${pushSets} push vs ${pullSets} pull`, severity:"high" }); }
    else if (ratio < 0.8) { score -= 7;  issues.push({ icon:"⚖️", text:`Léger déséquilibre push > pull`, severity:"medium" }); }
  }

  // Back-to-back penalty (-8 per conflict, max -24)
  const bbPenalty = Math.min(backToBack.length * 8, 24);
  if (bbPenalty > 0) {
    score -= bbPenalty;
    backToBack.forEach(b => {
      issues.push({ icon:"🔄", text:`${b.muscles.join(", ")} travaillé ${b.dayALabel}→${b.dayBLabel} (récupération insuffisante)`, severity:"medium" });
    });
  }

  if (totalSets < 20) { score -= 10; issues.push({ icon:"📉", text:"Volume global faible", severity:"medium" }); }

  score = clamp(Math.round(score), 0, 100);
  const grade = score >= 93 ? "A+" : score >= 85 ? "A" : score >= 77 ? "B+" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F";
  const color = score >= 77 ? C.green : score >= 50 ? C.orange : C.red;
  return { score, grade, color, issues };
}

function detectSplit(sessions) {
  if (!sessions.length) return null;
  const names = sessions.map(d => d.name.toUpperCase());
  const has = (...kws) => kws.some(kw => names.some(n => n.includes(kw)));
  if (has("PUSH") && has("PULL") && has("LEG","JAMB","QUAD")) return "Push/Pull/Legs";
  if (has("PUSH") && has("PULL"))                              return "Push/Pull";
  if (has("UPPER","HAUT") && has("LOWER","BAS"))               return "Upper/Lower";
  if (has("FULL","CORPS"))                                     return "Full Body";
  if (sessions.length <= 2)                                    return "Full Body";
  if (sessions.length === 3)                                   return "Full Body 3j";
  return `Programme ${sessions.length}j`;
}

function buildNaturalSummary(week, weeklyVol, priorities, db) {
  const sessions = week.filter(Boolean);
  if (!sessions.length) return null;

  const split     = detectSplit(sessions);
  const totalSets = Object.values(weeklyVol).reduce((a,b) => a+b, 0);

  // Fréquence par muscle (nb de séances où il apparaît en primaire)
  const freq = Object.fromEntries(ALL_MUSCLES.map(m => [m, 0]));
  week.forEach(day => {
    if (!day) return;
    const seen = new Set();
    day.exercises.forEach(ex => {
      const d = db[ex.name]; if (!d) return;
      d.primary.forEach(m => { if (!seen.has(m)) { seen.add(m); freq[m]++; } });
    });
  });

  const freq2 = ALL_MUSCLES.filter(m => freq[m] >= 2);
  const absent = MAJOR_MUSCLES.filter(m => !weeklyVol[m] || weeklyVol[m] === 0);
  const prios  = ALL_MUSCLES.filter(m => priorities[m] === "priority");
  const restDays = week.filter(d => !d).length;

  let parts = [];
  parts.push(`${split} · ${sessions.length} séance${sessions.length > 1 ? "s" : ""} · ${restDays} jours de repos`);
  if (totalSets > 0) parts.push(`${totalSets} séries/sem.`);
  if (freq2.length) parts.push(`Fréquence 2x : ${freq2.join(", ")}`);
  if (prios.length) parts.push(`Priorités : ${prios.join(", ")}`);
  if (absent.length) parts.push(`Absent : ${absent.join(", ")}`);

  return parts.join(" · ");
}

function bestExForMuscle(muscle, db, exclude = []) {
  return Object.entries(db)
    .filter(([n, d]) => d.primary.includes(muscle) && !exclude.includes(n))
    .sort(([,a],[,b]) => TIER_ORDER.indexOf(a.tier??"C") - TIER_ORDER.indexOf(b.tier??"C"))
    [0]?.[0] ?? null;
}

function buildSuggestions(weeklyVol, priorities, sessions, db, backToBack) {
  const inProgram = sessions.flatMap(d => d.exercises.map(e => e.name));
  const suggestions = [];

  ALL_MUSCLES.forEach(m => {
    if (priorities[m] !== "priority") return;
    const status = classifyVolume(weeklyVol[m] ?? 0);
    if (status !== "neutral" && status !== "maintain") return;
    const best = bestExForMuscle(m, db, inProgram);
    const targetDay = sessions.find(d => d.exercises.some(e => db[e.name]?.primary.includes(m))) ?? sessions[0];
    suggestions.push({
      id: `prio-${m}`, icon:"🎯", priority:3,
      text:`${m} en Priorité — ${weeklyVol[m]??0} sér., objectif 6+`,
      subtext: best ? `Suggéré : ${best} (${db[best]?.tier})` : null,
      action: best && targetDay ? { label:`Ajouter à "${targetDay.name}"`, dayId:targetDay.id, exName:best } : null,
    });
  });

  // Back-to-back suggestions
  backToBack.forEach(b => {
    suggestions.push({
      id:`btb-${b.dayALabel}`, icon:"🔄", priority:2,
      text:`${b.muscles.join(", ")} entraîné ${b.dayALabel} et ${b.dayBLabel} — récupération insuffisante`,
      subtext:`Placer un jour de repos entre ${b.dayALabel} et ${b.dayBLabel}, ou changer l'exercice de ${b.dayBLabel}`,
      action: null,
    });
  });

  const { push: pushSets, pull: pullSets } = computePushPullSets(sessions, db);
  if (pushSets > 0 && pullSets / pushSets < 0.7) {
    const best = bestExForMuscle("Dos", db, inProgram);
    const day  = sessions.find(d => d.exercises.some(e => db[e.name]?.primary.includes("Dos"))) ?? sessions[0];
    suggestions.push({
      id:"balance", icon:"⚖️", priority:2,
      text:`Push/pull déséquilibré — ${pushSets} push vs ${pullSets} pull`,
      subtext: best ? `Suggéré : ${best} (${db[best]?.tier})` : null,
      action: best && day ? { label:`Ajouter à "${day.name}"`, dayId:day.id, exName:best } : null,
    });
  }

  MAJOR_MUSCLES.forEach(m => {
    if ((weeklyVol[m] ?? 0) > 0) return;
    const best = bestExForMuscle(m, db, inProgram);
    suggestions.push({
      id:`absent-${m}`, icon:"⚠️", priority:1,
      text:`${m} absent du programme`,
      subtext: best ? `Suggéré : ${best} (${db[best]?.tier})` : null,
      action: best && sessions[0] ? { label:`Ajouter à "${sessions[0].name}"`, dayId:sessions[0].id, exName:best } : null,
    });
  });

  return suggestions.sort((a,b) => b.priority - a.priority).slice(0, 6);
}

// ─── DISPLAY CONSTANTS ────────────────────────────────────────────────────────

const VOL_COLOR = { neutral:C.textGhost, maintain:C.textGhost, bon:C.green, prio:C.red };
const VOL_LABEL = { neutral:"—", maintain:"MAINTIEN", bon:"BON", prio:"PRIO" };
const VOL_BG    = { neutral:"transparent", maintain:`${C.textGhost}20`, bon:`${C.green}20`, prio:`${C.red}20` };

const PRIO_OPTS = [
  { value:"priority", label:"🎯 Priorité",  aBg:C.accentBg, aCl:C.accentDark, aBd:C.accent },
  { value:"balanced", label:"⚖️ Équilibré", aBg:"#E5E5EA",  aCl:C.text,       aBd:C.textGhost },
  { value:"maintain", label:"🔒 Maintien",  aBg:C.blueBg,   aCl:C.blue,       aBd:"#60A5FA" },
];

const emptyExForm = () => ({ name:"", tier:"A", primary:[], secondary:[], movement:"neutral" });
const makeProgram = name => ({ id:uid(), name, week: Array(7).fill(null) });

// ─── MIGRATION: old days[] format → new week[] format ────────────────────────
function migrateToWeek(oldDays) {
  // Spread sessions across Mon,Tue,Wed,Thu,Fri — rest on Sat,Sun
  const week = Array(7).fill(null);
  const slots = [0,1,2,3,4]; // Mon-Fri
  oldDays.slice(0,5).forEach((day, i) => { week[slots[i]] = day; });
  return week;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkoutDashboard() {

  const [programs,        setPrograms]        = useState([{ id:"p1", name:"Mon Programme", week: DEMO_WEEK }]);
  const [activeProgramId, setActiveProgramId] = useState("p1");

  const activeProgram     = programs.find(p => p.id === activeProgramId);
  const week              = activeProgram?.week ?? Array(7).fill(null);
  const sessions          = week.filter(Boolean);
  const activeProgramName = activeProgram?.name ?? "—";

  function updateWeek(fn) {
    setPrograms(all => all.map(p =>
      p.id !== activeProgramId ? p : { ...p, week: fn([...p.week]) }
    ));
  }

  function updateDayExercises(dayId, fn) {
    updateWeek(w => w.map(slot =>
      slot?.id !== dayId ? slot : { ...slot, exercises: fn([...slot.exercises]) }
    ));
  }

  const [db, setDb] = useState(EXERCISE_DB);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [modal,          setModal]          = useState(null);
  const [pickerSearch,   setPickerSearch]   = useState("");
  const [libSearch,      setLibSearch]      = useState("");
  const [libMuscle,      setLibMuscle]      = useState("Tous");
  const [libTier,        setLibTier]        = useState("Tous");
  const [importText,     setImportText]     = useState("");
  const [importError,    setImportError]    = useState("");
  const [saveStatus,     setSaveStatus]     = useState("idle");
  const [dragSrc,        setDragSrc]        = useState(null); // {dayId, exIdx}
  const [renamingDay,    setRenamingDay]    = useState(null); // dayId
  const [renamingName,   setRenamingName]   = useState("");
  const [focusedSets,    setFocusedSets]    = useState(null); // {dayId, exId}

  const [progFormName,   setProgFormName]   = useState("");
  const [progFormError,  setProgFormError]  = useState("");
  const [editingProgId,  setEditingProgId]  = useState(null);

  const [exForm,         setExForm]         = useState(emptyExForm);
  const [editingExName,  setEditingExName]  = useState(null);
  const [exFormError,    setExFormError]    = useState("");

  const [exDescCache,    setExDescCache]    = useState({});
  const [exDescLoading,  setExDescLoading]  = useState(false);

  const [priorities, setPriorities] = useState(
    Object.fromEntries(ALL_MUSCLES.map(m => [m, "balanced"]))
  );
  const setMusclePrio = (m, v) => setPriorities(p => ({...p, [m]:v}));
  const resetPrios    = ()     => setPriorities(Object.fromEntries(ALL_MUSCLES.map(m => [m,"balanced"])));
  const hasCustomPrios = Object.values(priorities).some(v => v !== "balanced");

  // ── Derived analysis (real-time) ────────────────────────────────────────────
  const weeklyVol  = computeWeeklyVolume(sessions, db);
  const backToBack = detectBackToBack(week, db);
  const scoreData  = computeProgramScore(weeklyVol, priorities, backToBack, sessions, db);
  const summary    = buildNaturalSummary(week, weeklyVol, priorities, db);
  const suggestions = buildSuggestions(weeklyVol, priorities, sessions, db, backToBack);

  // ── Picker lists ────────────────────────────────────────────────────────────
  const pickerList = sortByTier(
    Object.keys(db).filter(n => n.toLowerCase().includes(pickerSearch.toLowerCase())),
    db
  );

  // Smart suggestions for picker: muscles that need volume
  const needMuscles = ALL_MUSCLES.filter(m => {
    const s = classifyVolume(weeklyVol[m]??0);
    return priorities[m] === "priority" ? s === "neutral" || s === "maintain" : s === "neutral";
  }).slice(0, 3);

  const smartPicker = !pickerSearch
    ? sortByTier(
        needMuscles.flatMap(m => Object.entries(db)
          .filter(([n,d]) => d.primary.includes(m)).map(([n]) => n)
        ).filter((n,i,a) => a.indexOf(n) === i).slice(0, 5),
        db
      )
    : [];

  const libraryList = sortByTier(
    Object.keys(db).filter(name => {
      const d = db[name];
      return name.toLowerCase().includes(libSearch.toLowerCase())
        && (libMuscle === "Tous" || d.primary.includes(libMuscle) || d.secondary.includes(libMuscle))
        && (libTier   === "Tous" || d.tier === libTier);
    }),
    db
  );

  // ── Refs ────────────────────────────────────────────────────────────────────
  const pickerInputRef  = useRef(null);
  const fileInputRef    = useRef(null);
  const saveTimer       = useRef(null);
  const dbTimer         = useRef(null);
  const prioTimer       = useRef(null);
  const statusTimer     = useRef(null);

  // ── Persistence ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("workout-programs") || "null");
      if (s?.programs?.length) {
        // Migrate old days[] format to week[]
        const migrated = s.programs.map(p => ({
          ...p,
          week: p.week ?? migrateToWeek(p.days ?? []),
        }));
        setPrograms(migrated);
        setActiveProgramId(s.activeProgramId ?? migrated[0].id);
      }
    } catch (_) {}
    try { const s = JSON.parse(localStorage.getItem("workout-db") || "null"); if (s) setDb(d => ({ ...EXERCISE_DB, ...s })); } catch (_) {}
    try { const s = JSON.parse(localStorage.getItem("workout-priorities") || "null"); if (s) setPriorities(p => ({...p,...s})); } catch (_) {}
  }, []);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      try {
        localStorage.setItem("workout-programs", JSON.stringify({ programs, activeProgramId }));
        setSaveStatus("saved");
        clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (_) { setSaveStatus("error"); }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [programs, activeProgramId]);

  useEffect(() => {
    clearTimeout(dbTimer.current);
    dbTimer.current = setTimeout(() => { try { localStorage.setItem("workout-db", JSON.stringify(db)); } catch(_) {} }, 800);
    return () => clearTimeout(dbTimer.current);
  }, [db]);

  useEffect(() => {
    clearTimeout(prioTimer.current);
    prioTimer.current = setTimeout(() => { try { localStorage.setItem("workout-priorities", JSON.stringify(priorities)); } catch(_) {} }, 600);
    return () => clearTimeout(prioTimer.current);
  }, [priorities]);

  useEffect(() => {
    if (modal?.type === "addEx" || modal?.type === "replaceEx") {
      setTimeout(() => pickerInputRef.current?.focus(), 60);
    }
  }, [modal]);

  const closeModal = () => setModal(null);

  // ── Import / Export ──────────────────────────────────────────────────────────
  function exportBackup() {
    const json = JSON.stringify({ programs, activeProgramId, db }, null, 2);
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([json], { type:"application/json" })),
      download:"workout-backup.json",
    });
    a.click(); URL.revokeObjectURL(a.href);
  }

  function onFileSelected(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setImportText(ev.target.result); setImportError(""); setModal({ type:"import" }); };
    r.readAsText(file);
    e.target.value = "";
  }

  function confirmImport() {
    try {
      const data = JSON.parse(importText);
      if (data.programs) {
        const migrated = data.programs.map(p => ({ ...p, week: p.week ?? migrateToWeek(p.days ?? []) }));
        setPrograms(migrated);
        setActiveProgramId(data.activeProgramId ?? migrated[0].id);
      } else if (data.days) {
        const np = { id:uid(), name:"Importé", week: migrateToWeek(data.days) };
        setPrograms(prev => [...prev, np]);
      } else throw new Error("Format non reconnu");
      if (data.db) setDb(data.db);
      setImportText(""); closeModal();
    } catch (err) { setImportError("Fichier invalide : " + err.message); }
  }

  // ── Programs CRUD ────────────────────────────────────────────────────────────
  function openNewProg()  { setProgFormName(""); setProgFormError(""); setEditingProgId(null); setModal({ type:"progForm" }); }
  function openRenameProg(id) {
    setProgFormName(programs.find(p => p.id === id)?.name ?? "");
    setProgFormError(""); setEditingProgId(id); setModal({ type:"progForm" });
  }
  function saveProgForm() {
    const name = progFormName.trim();
    if (!name) { setProgFormError("Donne un nom à ce programme."); return; }
    if (editingProgId) { setPrograms(all => all.map(p => p.id === editingProgId ? {...p, name} : p)); }
    else { const np = makeProgram(name); setPrograms(all => [...all, np]); setActiveProgramId(np.id); }
    closeModal();
  }
  function duplicateProg(id) {
    const src = programs.find(p => p.id === id); if (!src) return;
    const copy = { id:uid(), name:`${src.name} (copie)`, week: JSON.parse(JSON.stringify(src.week)) };
    setPrograms(all => [...all, copy]); setActiveProgramId(copy.id); closeModal();
  }
  function deleteProg(id) {
    if (programs.length === 1) { alert("Impossible de supprimer le seul programme."); return; }
    if (!window.confirm("Supprimer ce programme ?")) return;
    setPrograms(all => all.filter(p => p.id !== id));
    if (activeProgramId === id) setActiveProgramId(programs.find(p => p.id !== id)?.id ?? "");
  }

  // ── Week / Day mutations ─────────────────────────────────────────────────────
  function addSessionToDay(dayIndex) {
    updateWeek(w => {
      const updated = [...w];
      updated[dayIndex] = { id:uid(), name:`${DAY_LONG[dayIndex]}`, exercises:[] };
      return updated;
    });
  }

  function removeSessionFromDay(dayId) {
    if (!window.confirm("Supprimer cette séance ?")) return;
    updateWeek(w => w.map(slot => slot?.id === dayId ? null : slot));
  }

  function commitRenameDay(dayId, name) {
    updateWeek(w => w.map(slot => slot?.id !== dayId ? slot : {...slot, name: name || slot.name}));
    setRenamingDay(null);
  }

  // ── Exercise mutations ───────────────────────────────────────────────────────
  function addEx(dayId, exName) {
    updateDayExercises(dayId, exs => [...exs, { id:uid(), name:exName, sets:3 }]);
    setPickerSearch(""); closeModal();
  }

  function replaceEx(dayId, exId, newName) {
    updateDayExercises(dayId, exs => exs.map(e => e.id !== exId ? e : {...e, name:newName}));
    setPickerSearch(""); closeModal();
  }

  function deleteEx(dayId, exId) {
    updateDayExercises(dayId, exs => exs.filter(e => e.id !== exId));
  }

  function setSets(dayId, exId, val) {
    updateDayExercises(dayId, exs => exs.map(e =>
      e.id !== exId ? e : {...e, sets: clamp(Number(val) || MIN_SETS, MIN_SETS, MAX_SETS)}
    ));
  }

  function moveExUp(dayId, idx) {
    if (idx === 0) return;
    updateDayExercises(dayId, exs => {
      const arr = [...exs]; [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr;
    });
  }

  function onDrop(targetDayId, targetIdx) {
    if (!dragSrc) return;
    const { dayId:srcId, exIdx:srcIdx } = dragSrc;
    updateWeek(w => {
      let moved = null;
      const step = w.map(slot => {
        if (slot?.id !== srcId) return slot;
        const exs = [...slot.exercises]; [moved] = exs.splice(srcIdx, 1);
        return {...slot, exercises: exs};
      });
      return step.map(slot => {
        if (slot?.id !== targetDayId) return slot;
        const exs = [...slot.exercises]; exs.splice(targetIdx, 0, moved);
        return {...slot, exercises: exs};
      });
    });
    setDragSrc(null);
  }

  // ── Library mutations ────────────────────────────────────────────────────────
  function openAddExToLib()   { setExForm(emptyExForm()); setEditingExName(null); setExFormError(""); setModal({ type:"editExInLib" }); }
  function openEditExInLib(n) { setExForm({ name:n, movement:"neutral", ...db[n] }); setEditingExName(n); setExFormError(""); setModal({ type:"editExInLib" }); }
  function deleteExFromLib(n) {
    if (!window.confirm(`Supprimer « ${n} » de la bibliothèque ?`)) return;
    setDb(d => { const u = {...d}; delete u[n]; return u; });
  }
  function saveExForm() {
    const name = exForm.name.trim();
    if (!name)                           { setExFormError("Le nom est obligatoire."); return; }
    if (!exForm.primary.length)          { setExFormError("Sélectionne au moins un muscle principal."); return; }
    if (!editingExName && db[name])      { setExFormError("Un exercice avec ce nom existe déjà."); return; }
    setDb(d => {
      const u = {...d};
      if (editingExName && editingExName !== name) delete u[editingExName];
      u[name] = { tier:exForm.tier, primary:exForm.primary, secondary:exForm.secondary, movement:exForm.movement ?? "neutral" };
      return u;
    });
    closeModal();
  }

  // ── Exercise detail + AI description ─────────────────────────────────────────
  async function generateExDesc(name) {
    if (exDescCache[name] || exDescLoading) return;
    setExDescLoading(true);
    const d = db[name];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:350,
          messages:[{ role:"user", content:`Décris l'exercice "${name}" en musculation en français. 3 parties très courtes :\n1. Exécution (1-2 phrases)\n2. Pourquoi c'est efficace pour ${d?.primary?.join(", ")}\n3. Justification note Nippard ${d?.tier} (${TIER[d?.tier]?.label ?? ""})\n\nVoix de coach, 150 mots max.` }],
        }),
      });
      const json = await res.json();
      setExDescCache(c => ({...c, [name]: json.content?.[0]?.text ?? "Indisponible."}));
    } catch { setExDescCache(c => ({...c, [name]: "Erreur de connexion."})); }
    setExDescLoading(false);
  }

  function applySuggestion(action) {
    if (action) addEx(action.dayId, action.exName);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  function TierBadge({ tier }) {
    if (!tier || !TIER[tier]) return null;
    const { color, bg } = TIER[tier];
    return (
      <span style={{ fontSize:"0.56rem", fontWeight:700, padding:"1px 5px", borderRadius:4,
        border:`1px solid ${color}40`, background:bg, color, flexShrink:0, letterSpacing:"0.3px" }}>
        {tier}
      </span>
    );
  }

  function VolumeRow({ muscle }) {
    const sets    = weeklyVol[muscle] ?? 0;
    const status  = classifyVolume(sets);
    const prio    = priorities[muscle];
    const target  = prio === "priority" ? 12 : prio === "maintain" ? 4 : 9;
    const fillPct = Math.min(100, (sets / BAR_MAX) * 100);
    const targPct = Math.min(100, (target / BAR_MAX) * 100);
    const isConflict = backToBack.some(b => b.muscles.includes(muscle));

    return (
      <div style={{ marginBottom:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
          <span style={{ fontSize:"0.7rem", fontWeight:500, color:C.textSub, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:"0.8rem" }}>{MUSCLE_EMOJI[muscle]}</span>
            {muscle}
            {isConflict && <span style={{ fontSize:"0.58rem", color:C.orange, fontWeight:700 }}>⚡J-J</span>}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            {status !== "neutral" && (
              <span style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.5px", padding:"1px 5px",
                borderRadius:3, background:VOL_BG[status], color:VOL_COLOR[status] }}>
                {VOL_LABEL[status]}
              </span>
            )}
            <span style={{ fontSize:"0.7rem", fontWeight:700, color:C.text, minWidth:18, textAlign:"right" }}>
              {Number.isInteger(sets) ? sets : sets.toFixed(1)}
            </span>
          </div>
        </div>
        <div style={{ height:4, background:C.borderLight, borderRadius:2, position:"relative" }}>
          <div style={{ position:"absolute", inset:0, width:`${fillPct}%`, height:4, borderRadius:2,
            background: MUSCLE_COLOR[muscle], opacity: status === "prio" ? 0.55 : 0.85,
            transition:"width 0.25s ease" }} />
          <div style={{ position:"absolute", top:-2, left:`${(VOLUME.maintain/BAR_MAX)*100}%`,
            width:1.5, height:8, background:C.textGhost, borderRadius:1 }} />
          <div style={{ position:"absolute", top:-2, left:`${(VOLUME.bon/BAR_MAX)*100}%`,
            width:1.5, height:8, background:C.green, borderRadius:1 }} />
          <div style={{ position:"absolute", top:-3, left:`${targPct}%`,
            width:2, height:10, background: prio === "priority" ? C.accent : `${C.textGhost}80`,
            borderRadius:1, transform:"translateX(-50%)" }} />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── TOPBAR ─────────────────────────────────────────────────── */}
        <header className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontWeight:800, fontSize:"1.1rem", letterSpacing:"-0.3px", color:C.text }}>
              Work<span style={{ color:C.accent }}>out</span>
            </span>
            <div style={{ width:1, height:18, background:C.border }} />
            <button className="prog-btn" onClick={() => setModal({ type:"progList" })}>
              {activeProgramName} <span style={{ color:C.accent, fontSize:"0.55rem", marginLeft:4 }}>▼</span>
            </button>
            <div className={`save-dot ${saveStatus}`} />
          </div>

          {/* Score — centre */}
          {sessions.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:"1.6rem", fontWeight:800, color:scoreData.color, lineHeight:1, letterSpacing:"-1px" }}>
                {scoreData.grade}
              </span>
              <span style={{ fontSize:"0.68rem", color:C.textFaint, fontWeight:600 }}>{scoreData.score}/100</span>
              {summary && (
                <div style={{ fontSize:"0.68rem", color:C.textMuted, borderLeft:`1.5px solid ${C.border}`,
                  paddingLeft:10, maxWidth:420, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                  {summary}
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button className="hdr-ghost" onClick={() => setModal({ type:"library" })}>Bibliothèque</button>
            <button className="hdr-ghost" onClick={() => fileInputRef.current?.click()}>↑ Importer</button>
            <button className="hdr-solid" onClick={exportBackup}>↓ Exporter</button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display:"none" }} onChange={onFileSelected} />
          </div>
        </header>

        {/* ── MAIN ───────────────────────────────────────────────────── */}
        <div className="main">

          {/* ── WEEK BOARD ──────────────────────────────────────────── */}
          <div className="week-board">
            {DAY_KEYS.map((key, idx) => {
              const session = week[idx];
              const isRest  = !session;

              if (isRest) {
                return (
                  <div key={key} className="rest-slot" onClick={() => addSessionToDay(idx)}>
                    <span className="rest-label">{DAY_LABELS[idx]}</span>
                    <span className="rest-icon">+</span>
                    <span className="rest-text">Repos</span>
                  </div>
                );
              }

              // Session column
              const dayVol     = computeWeeklyVolume([session], db);
              const activeMuscles = ALL_MUSCLES.filter(m => dayVol[m] > 0);
              const isBackToBack  = idx > 0 && week[idx-1] !== null && backToBack.some(b =>
                b.dayALabel === DAY_LABELS[idx-1] && b.dayBLabel === DAY_LABELS[idx]
              );

              return (
                <div key={key} className={`session-col${isBackToBack ? " btb-warning" : ""}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(session.id, session.exercises.length)}>

                  {/* Column header */}
                  <div className="col-header">
                    <span style={{ fontSize:"0.6rem", fontWeight:700, color:C.accent, letterSpacing:"1px" }}>
                      {DAY_LABELS[idx]}
                    </span>
                    {renamingDay === session.id ? (
                      <input className="rename-input" value={renamingName} autoFocus
                        onChange={e => setRenamingName(e.target.value)}
                        onBlur={() => commitRenameDay(session.id, renamingName)}
                        onKeyDown={e => e.key === "Enter" && commitRenameDay(session.id, renamingName)} />
                    ) : (
                      <span className="session-name" onClick={() => { setRenamingDay(session.id); setRenamingName(session.name); }}>
                        {session.name}
                      </span>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:3, marginLeft:"auto", flexShrink:0 }}>
                      {activeMuscles.slice(0,6).map(m => (
                        <span key={m} title={m} style={{ width:6, height:6, borderRadius:"50%",
                          background:MUSCLE_COLOR[m], display:"inline-block" }} />
                      ))}
                      <button className="col-del-btn" onClick={() => removeSessionFromDay(session.id)} title="Supprimer">✕</button>
                    </div>
                  </div>

                  {isBackToBack && (
                    <div style={{ padding:"3px 10px", background:C.orangeBg, borderBottom:`1px solid ${C.orange}30`,
                      fontSize:"0.6rem", color:C.orange, fontWeight:600 }}>
                      ⚡ Muscles en J-J consécutifs
                    </div>
                  )}

                  {/* Exercise list */}
                  <div className="ex-list">
                    {session.exercises.map((ex, idx2) => {
                      const exData = db[ex.name];
                      const isFocused = focusedSets?.dayId === session.id && focusedSets?.exId === ex.id;

                      return (
                        <div key={ex.id} className="ex-row"
                          draggable
                          onDragStart={() => setDragSrc({ dayId:session.id, exIdx:idx2 })}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => { e.stopPropagation(); onDrop(session.id, idx2); }}>

                          {/* Index */}
                          <span className="ex-idx">{idx2+1}</span>

                          {/* Two-line content */}
                          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:6 }}>

                            {/* Line 1 — name + tier */}
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <span className="ex-name" onClick={() => setModal({ type:"exDetail", name:ex.name })}>
                                {ex.name}
                              </span>
                              <TierBadge tier={exData?.tier} />
                              {exData?.movement && exData.movement !== "neutral" && (
                                <span style={{ fontSize:"0.55rem", fontWeight:700, padding:"1px 5px", borderRadius:3,
                                  background: exData.movement==="push"?"#FFEDD5":"#DBEAFE",
                                  color: exData.movement==="push"?"#EA580C":"#1D4ED8",
                                  flexShrink:0 }}>
                                  {exData.movement === "push" ? "PSH" : "PLL"}
                                </span>
                              )}
                            </div>

                            {/* Line 2 — muscles + sets + actions */}
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"nowrap" }}>
                              {/* Muscle pills */}
                              <div style={{ display:"flex", gap:4, flex:1, minWidth:0, flexWrap:"wrap" }}>
                                {exData?.primary.map(m => (
                                  <span key={m} style={{ fontSize:"0.7rem", fontWeight:600, padding:"2px 8px",
                                    borderRadius:4, background:MUSCLE_COLOR[m]+"18", color:MUSCLE_COLOR[m],
                                    whiteSpace:"nowrap" }}>{m}</span>
                                ))}
                                {exData?.secondary.map(m => (
                                  <span key={m} style={{ fontSize:"0.65rem", fontWeight:500, padding:"2px 6px",
                                    borderRadius:4, background:"#F2F2F7", color:C.textFaint,
                                    whiteSpace:"nowrap" }}>{m} ½</span>
                                ))}
                              </div>

                              {/* Sets control */}
                              <div style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0 }}>
                                <button className="sets-btn" onClick={() => setSets(session.id, ex.id, ex.sets-1)}>−</button>
                                <input
                                  className="sets-input"
                                  type="number" min={MIN_SETS} max={MAX_SETS}
                                  value={ex.sets}
                                  onChange={e => setSets(session.id, ex.id, e.target.value)}
                                  onFocus={() => setFocusedSets({ dayId:session.id, exId:ex.id })}
                                  onBlur={() => setFocusedSets(null)}
                                />
                                <button className="sets-btn" onClick={() => setSets(session.id, ex.id, ex.sets+1)}>+</button>
                                <span style={{ fontSize:"0.65rem", color:C.textFaint, marginLeft:1 }}>sér.</span>
                              </div>

                              {/* Actions */}
                              <div style={{ display:"flex", gap:2, flexShrink:0 }}>
                                <button className="ex-btn" title="Remplacer"
                                  onClick={() => { setModal({ type:"replaceEx", dayId:session.id, exId:ex.id }); setPickerSearch(""); }}>
                                  ⇄
                                </button>
                                <button className="ex-btn del" title="Supprimer" onClick={() => deleteEx(session.id, ex.id)}>
                                  ✕
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}

                    <button className="add-ex-btn"
                      onClick={() => { setModal({ type:"addEx", dayId:session.id }); setPickerSearch(""); }}>
                      + Exercice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ANALYSIS PANEL ──────────────────────────────────────── */}
          <aside className="analysis-panel">

            {/* Score */}
            <div className="panel-block">
              <div className="panel-label">NOTE</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:6 }}>
                <span style={{ fontSize:"2.6rem", fontWeight:800, color:scoreData.color, lineHeight:1, letterSpacing:"-2px" }}>
                  {scoreData.grade}
                </span>
                <span style={{ fontSize:"0.9rem", fontWeight:700, color:scoreData.color }}>{scoreData.score}</span>
                <span style={{ fontSize:"0.7rem", color:C.textFaint }}>/100</span>
              </div>
              {scoreData.issues.length > 0 && (
                <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
                  {scoreData.issues.map((issue, i) => (
                    <div key={i} style={{ fontSize:"0.68rem", color:issue.severity==="high"?C.red:C.orange,
                      display:"flex", gap:4, alignItems:"flex-start" }}>
                      <span style={{ flexShrink:0 }}>{issue.icon}</span>
                      <span>{issue.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {scoreData.issues.length === 0 && scoreData.score > 0 && (
                <div style={{ marginTop:6, fontSize:"0.7rem", color:C.green, fontWeight:600 }}>Programme équilibré ✓</div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="panel-block">
                <div className="panel-label">SUGGESTIONS</div>
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:6 }}>
                  {suggestions.map(s => (
                    <div key={s.id} style={{ background:C.bg, borderRadius:7, padding:"7px 9px",
                      border:`1px solid ${C.borderLight}` }}>
                      <div style={{ fontSize:"0.68rem", fontWeight:600, color:C.textSub, display:"flex", gap:4 }}>
                        <span>{s.icon}</span><span>{s.text}</span>
                      </div>
                      {s.subtext && (
                        <div style={{ fontSize:"0.62rem", color:C.textFaint, marginTop:2 }}>{s.subtext}</div>
                      )}
                      {s.action && (
                        <button onClick={() => applySuggestion(s.action)} style={{
                          marginTop:5, fontSize:"0.62rem", fontWeight:700, padding:"3px 9px",
                          background:C.accent, color:"#fff", border:"none", borderRadius:5,
                          cursor:"pointer", fontFamily:"inherit",
                        }}>{s.action.label}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Volume */}
            <div className="panel-block">
              <div className="panel-label">VOLUME HEBDO</div>
              <div style={{ marginTop:8 }}>
                {ALL_MUSCLES.map(m => <VolumeRow key={m} muscle={m} />)}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:3, marginTop:8,
                paddingTop:8, borderTop:`1px solid ${C.borderLight}` }}>
                {[
                  { c:C.textGhost, l:"MAINTIEN — 1–5 séries" },
                  { c:C.green,     l:"BON — 6–12 séries" },
                  { c:C.red,       l:"PRIO — 13+ séries" },
                ].map(({ c, l }) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:c, flexShrink:0 }} />
                    <span style={{ fontSize:"0.6rem", color:C.textFaint }}>{l}</span>
                  </div>
                ))}
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <span style={{ fontSize:"0.6rem", color:C.orange, fontWeight:600 }}>⚡J-J</span>
                  <span style={{ fontSize:"0.6rem", color:C.textFaint }}>Muscle travaillé 2 jours consécutifs</span>
                </div>
              </div>
            </div>

            {/* Priorities */}
            <div className="panel-block">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="panel-label">PRIORITÉS</div>
                {hasCustomPrios && (
                  <button onClick={resetPrios} style={{ background:"none", border:"none", fontSize:"0.6rem",
                    color:C.textFaint, cursor:"pointer", fontFamily:"inherit" }}>Reset</button>
                )}
              </div>
              <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:5 }}>
                {ALL_MUSCLES.map(m => {
                  const cur = priorities[m];
                  return (
                    <div key={m} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:"0.78rem", width:18, flexShrink:0 }}>{MUSCLE_EMOJI[m]}</span>
                      <span style={{ fontSize:"0.68rem", fontWeight:500, color:C.textSub, flex:1, minWidth:0 }}>{m}</span>
                      <div style={{ display:"flex", gap:2, flexShrink:0 }}>
                        {PRIO_OPTS.map(opt => {
                          const active = cur === opt.value;
                          return (
                            <button key={opt.value} onClick={() => setMusclePrio(m, opt.value)} style={{
                              background: active ? opt.aBg : C.bg,
                              color:      active ? opt.aCl : C.textFaint,
                              border:     `1px solid ${active ? opt.aBd : C.borderLight}`,
                              borderRadius:5, padding:"2px 6px",
                              fontSize:"0.6rem", fontWeight: active ? 700 : 500,
                              cursor:"pointer", fontFamily:"inherit", transition:"all 0.1s", whiteSpace:"nowrap",
                            }}>{opt.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {modal && (
        <div className="overlay" onClick={closeModal}>

          {/* Exercise Picker */}
          {(modal.type === "addEx" || modal.type === "replaceEx") && (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">{modal.type === "addEx" ? "Ajouter un exercice" : "Remplacer"}</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div style={{ padding:"10px 14px 6px", flexShrink:0 }}>
                <input ref={pickerInputRef} className="picker-search" placeholder="Rechercher..."
                  value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
              </div>
              <div style={{ overflowY:"auto", flex:1, background:C.surface }}>
                {!pickerSearch && smartPicker.length > 0 && (
                  <>
                    <div style={{ padding:"6px 14px 3px", fontSize:"0.6rem", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"1px", color:C.accent }}>
                      ✨ Recommandés pour votre programme
                    </div>
                    {smartPicker.map(name => {
                      const d = db[name];
                      return (
                        <div key={`s-${name}`} className="picker-row" style={{ background:C.accentBg }}
                          onClick={() => modal.type === "addEx" ? addEx(modal.dayId, name) : replaceEx(modal.dayId, modal.exId, name)}>
                          <TierBadge tier={d?.tier} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:"0.83rem", fontWeight:600, color:C.text }}>{name}</div>
                            <div style={{ fontSize:"0.65rem", color:C.textMuted, marginTop:1 }}>
                              {d.primary.join(", ")}{d.secondary.length ? ` · ${d.secondary.join(", ")} ½` : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height:1, background:C.borderLight, margin:"3px 0" }} />
                  </>
                )}
                {pickerList.length === 0
                  ? <div style={{ padding:24, textAlign:"center", color:C.textFaint, fontSize:"0.85rem" }}>Aucun résultat</div>
                  : pickerList.map(name => {
                    const d = db[name];
                    return (
                      <div key={name} className="picker-row"
                        onClick={() => modal.type === "addEx" ? addEx(modal.dayId, name) : replaceEx(modal.dayId, modal.exId, name)}>
                        <TierBadge tier={d?.tier} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"0.83rem", fontWeight:600, color:C.text }}>{name}</div>
                          <div style={{ fontSize:"0.65rem", color:C.textMuted, marginTop:1 }}>
                            {d.primary.join(", ")}{d.secondary.length ? ` · ${d.secondary.join(", ")} ½` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}

          {/* Exercise Detail */}
          {modal.type === "exDetail" && (() => {
            const name = modal.name;
            const d    = db[name];
            const desc = d?.desc || exDescCache[name];
            return (
              <div className="modal" style={{ width:500 }} onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-header">
                  <span className="modal-title" style={{ fontSize:"0.9rem" }}>{name}</span>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div style={{ padding:16, overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:12 }}>
                  {/* Tier + muscles */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7, alignItems:"center" }}>
                    {d?.tier && (() => {
                      const t = TIER[d.tier];
                      return (
                        <div style={{ display:"flex", alignItems:"center", gap:6, background:t.bg,
                          border:`1px solid ${t.color}40`, borderRadius:7, padding:"5px 10px" }}>
                          <span style={{ fontSize:"1rem", fontWeight:800, color:t.color }}>{d.tier}</span>
                          <span style={{ fontSize:"0.65rem", color:t.color, fontWeight:600 }}>Nippard Tier</span>
                        </div>
                      );
                    })()}
                    {d?.primary.map(m => (
                      <span key={m} style={{ fontSize:"0.7rem", fontWeight:700, padding:"3px 9px",
                        borderRadius:6, background:MUSCLE_COLOR[m]+"18", color:MUSCLE_COLOR[m] }}>
                        {MUSCLE_EMOJI[m]} {m}
                      </span>
                    ))}
                    {d?.secondary.map(m => (
                      <span key={m} style={{ fontSize:"0.66rem", fontWeight:500, padding:"2px 7px",
                        borderRadius:6, background:C.bg, color:C.textMuted, border:`1px solid ${C.borderLight}` }}>
                        {m} ½
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  {desc ? (
                    <div style={{ fontSize:"0.82rem", color:C.textSub, lineHeight:1.75, whiteSpace:"pre-wrap" }}>
                      {desc}
                    </div>
                  ) : (
                    <div>
                      {d?.tier && TIER[d.tier] && (
                        <div style={{ background:TIER[d.tier].bg, borderRadius:8, padding:"10px 12px",
                          border:`1px solid ${TIER[d.tier].color}25`, marginBottom:10 }}>
                          <div style={{ fontSize:"0.68rem", color:TIER[d.tier].color, fontWeight:700, marginBottom:3 }}>
                            Pourquoi {d.tier} ?
                          </div>
                          <div style={{ fontSize:"0.78rem", color:C.textSub, lineHeight:1.6 }}>
                            {TIER[d.tier].label}
                          </div>
                        </div>
                      )}
                      <button disabled={exDescLoading} onClick={() => generateExDesc(name)} style={{
                        padding:"8px 16px", background: exDescLoading ? C.bg : C.accent,
                        color: exDescLoading ? C.textMuted : "#fff",
                        border:"none", borderRadius:8, cursor: exDescLoading ? "default" : "pointer",
                        fontFamily:"inherit", fontSize:"0.76rem", fontWeight:700,
                        display:"flex", alignItems:"center", gap:7,
                      }}>
                        {exDescLoading
                          ? <><span className="spinner" /> Génération...</>
                          : "✨ Description détaillée IA"
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Program List */}
          {modal.type === "progList" && (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">Mes programmes</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"10px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                {programs.map(p => {
                  const active = p.id === activeProgramId;
                  const sess   = (p.week ?? []).filter(Boolean);
                  return (
                    <div key={p.id} onClick={() => { setActiveProgramId(p.id); closeModal(); }} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                      background: active ? C.accentBg : C.surface,
                      border:`1.5px solid ${active ? C.accent : C.borderLight}`,
                      borderRadius:10, cursor:"pointer", minHeight:50,
                    }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0,
                        background: active ? C.accent : "transparent",
                        border:`2px solid ${active ? C.accent : C.textGhost}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"0.55rem", fontWeight:700, color:"#fff" }}>
                        {active ? "✓" : ""}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"0.85rem", fontWeight:600, color: active ? C.accentDark : C.text }}>{p.name}</div>
                        <div style={{ fontSize:"0.66rem", color:C.textFaint, marginTop:1 }}>
                          {sess.length} séance{sess.length !== 1 ? "s" : ""} · {sess.reduce((n,d) => n + d.exercises.length, 0)} exercices
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:3 }} onClick={e => e.stopPropagation()}>
                        {[
                          { icon:"✏️", title:"Renommer",  fn:() => openRenameProg(p.id) },
                          { icon:"📋", title:"Dupliquer", fn:() => duplicateProg(p.id) },
                          { icon:"🗑️", title:"Supprimer", fn:() => deleteProg(p.id) },
                        ].map(btn => (
                          <button key={btn.title} title={btn.title} onClick={btn.fn} style={{
                            background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                            padding:"3px 6px", cursor:"pointer", fontSize:"0.8rem",
                            minWidth:28, minHeight:28, display:"flex", alignItems:"center", justifyContent:"center",
                          }}>{btn.icon}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:"10px 12px", borderTop:`1.5px solid ${C.border}`, flexShrink:0 }}>
                <button className="btn-full-accent" onClick={() => { closeModal(); setTimeout(openNewProg, 50); }}>
                  + Nouveau programme
                </button>
              </div>
            </div>
          )}

          {/* Program Form */}
          {modal.type === "progForm" && (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">{editingProgId ? "Renommer" : "Nouveau programme"}</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="modal-form">
                <div>
                  <label className="form-label">{editingProgId ? "Nouveau nom" : "Nom du programme"}</label>
                  <input className="form-input" autoFocus value={progFormName}
                    onChange={e => setProgFormName(e.target.value)}
                    placeholder="Ex : PPL Hypertrophie, Full Body..."
                    onKeyDown={e => e.key === "Enter" && saveProgForm()} />
                </div>
                {progFormError && <div style={{ fontSize:"0.73rem", color:C.red, fontWeight:600 }}>{progFormError}</div>}
                <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
                  <button className="btn-cancel" onClick={closeModal}>Annuler</button>
                  <button className="btn-save" onClick={saveProgForm}>{editingProgId ? "Renommer" : "Créer"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Library */}
          {modal.type === "library" && (
            <div className="modal" style={{ width:640 }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">Bibliothèque · {Object.keys(db).length} exercices</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div style={{ padding:"10px 14px 6px", flexShrink:0, display:"flex", gap:8, flexWrap:"wrap" }}>
                <input className="picker-search" style={{ flex:1, minWidth:130 }} placeholder="Rechercher..."
                  value={libSearch} onChange={e => setLibSearch(e.target.value)} />
                <select className="form-select" style={{ width:"auto", minWidth:120 }}
                  value={libMuscle} onChange={e => setLibMuscle(e.target.value)}>
                  <option>Tous</option>
                  {ALL_MUSCLES.map(m => <option key={m}>{m}</option>)}
                </select>
                <select className="form-select" style={{ width:"auto", minWidth:75 }}
                  value={libTier} onChange={e => setLibTier(e.target.value)}>
                  <option>Tous</option>
                  {TIER_ORDER.map(t => <option key={t}>{t}</option>)}
                </select>
                <button className="btn-save" style={{ whiteSpace:"nowrap" }} onClick={openAddExToLib}>+ Nouveau</button>
              </div>
              <div style={{ overflowY:"auto", flex:1 }}>
                {libraryList.length === 0 && (
                  <div style={{ padding:28, textAlign:"center", color:C.textFaint, fontSize:"0.85rem" }}>Aucun exercice.</div>
                )}
                {libraryList.map(name => {
                  const d = db[name];
                  return (
                    <div key={name} className="lib-row" onClick={() => setModal({ type:"exDetail", name })}>
                      <TierBadge tier={d.tier} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"0.83rem", fontWeight:600, color:C.text }}>{name}</div>
                        <div style={{ display:"flex", gap:4, marginTop:2, flexWrap:"wrap" }}>
                          {d.primary.map(m => (
                            <span key={m} style={{ fontSize:"0.6rem", fontWeight:600, padding:"1px 5px",
                              borderRadius:3, background:MUSCLE_COLOR[m]+"18", color:MUSCLE_COLOR[m] }}>{m}</span>
                          ))}
                          {d.secondary.map(m => (
                            <span key={m} style={{ fontSize:"0.58rem", color:C.textFaint }}>{m} ½</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:4 }} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon-sm" onClick={() => openEditExInLib(name)}>✏️</button>
                        <button className="btn-icon-sm del" onClick={() => deleteExFromLib(name)}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exercise Edit Form */}
          {modal.type === "editExInLib" && (
            <div className="modal" style={{ width:560 }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">{editingExName ? "Modifier l'exercice" : "Nouvel exercice"}</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="modal-form">
                <div>
                  <label className="form-label">Nom</label>
                  <input className="form-input" value={exForm.name}
                    onChange={e => setExForm(f => ({...f, name:e.target.value}))}
                    placeholder="Ex : Curl pupitre haltère" />
                </div>
                <div>
                  <label className="form-label">Note Nippard</label>
                  <select className="form-select" value={exForm.tier}
                    onChange={e => setExForm(f => ({...f, tier:e.target.value}))}>
                    {TIER_ORDER.map(t => <option key={t} value={t}>{t} — {TIER[t]?.label.substring(0,50)}…</option>)}
                    <option value="">— Non noté</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Type de mouvement</label>
                  <div style={{ display:"flex", gap:8 }}>
                    {[
                      { value:"push",    label:"Push",  bg:"#FFEDD5", c:"#EA580C" },
                      { value:"pull",    label:"Pull",  bg:"#DBEAFE", c:"#1D4ED8" },
                      { value:"neutral", label:"Neutre",bg:"#F3F4F6", c:"#6B7280" },
                    ].map(opt => {
                      const active = (exForm.movement ?? "neutral") === opt.value;
                      return (
                        <button key={opt.value} onClick={() => setExForm(f => ({...f, movement:opt.value}))} style={{
                          padding:"7px 16px", borderRadius:20, cursor:"pointer", fontFamily:"inherit",
                          fontSize:"0.78rem", fontWeight:active?700:500,
                          background:active?opt.bg:"#F2F2F7",
                          color:active?opt.c:C.textFaint,
                          border:`1.5px solid ${active?opt.c:C.borderLight}`,
                        }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="form-label">Muscles principaux</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {ALL_MUSCLES.map(m => {
                      const a = exForm.primary.includes(m);
                      return (
                        <button key={m} onClick={() => setExForm(f => ({
                          ...f, primary:toggle(f.primary, m), secondary:f.secondary.filter(x => x !== m),
                        }))} style={{
                          fontSize:"0.7rem", fontWeight:a?700:500, padding:"5px 11px", borderRadius:20,
                          border:`1.5px solid ${a?MUSCLE_COLOR[m]:C.borderLight}`,
                          background: a ? MUSCLE_COLOR[m]+"18" : C.surface,
                          color: a ? MUSCLE_COLOR[m] : C.textFaint,
                          cursor:"pointer", fontFamily:"inherit",
                        }}>{m}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="form-label">Muscles secondaires</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {ALL_MUSCLES.filter(m => !exForm.primary.includes(m)).map(m => {
                      const a = exForm.secondary.includes(m);
                      return (
                        <button key={m} onClick={() => setExForm(f => ({...f, secondary:toggle(f.secondary, m)}))} style={{
                          fontSize:"0.7rem", fontWeight:a?700:500, padding:"5px 11px", borderRadius:20,
                          border:`1.5px solid ${a?C.textGhost:C.borderLight}`,
                          background: a ? C.bg : C.surface,
                          color: a ? C.textSub : C.textFaint,
                          cursor:"pointer", fontFamily:"inherit",
                        }}>{m}</button>
                      );
                    })}
                  </div>
                </div>
                {exFormError && <div style={{ fontSize:"0.73rem", color:C.red, fontWeight:600 }}>{exFormError}</div>}
                <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
                  <button className="btn-cancel" onClick={closeModal}>Annuler</button>
                  <button className="btn-save" onClick={saveExForm}>Sauvegarder</button>
                </div>
              </div>
            </div>
          )}

          {/* Import */}
          {modal.type === "import" && (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">Importer un backup</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="modal-form">
                <div style={{ fontSize:"0.82rem", color:C.textMuted }}>
                  Remplace le programme actuel et la bibliothèque avec le fichier importé.
                </div>
                <textarea style={{ background:C.surface, border:`1.5px solid ${C.textGhost}`, borderRadius:8,
                  color:C.text, fontFamily:"monospace", fontSize:"0.72rem", padding:10,
                  height:110, resize:"vertical", outline:"none", width:"100%" }}
                  value={importText} onChange={e => setImportText(e.target.value)} spellCheck={false} />
                {importError && <div style={{ fontSize:"0.73rem", color:C.red, fontWeight:600 }}>{importError}</div>}
                <button className="btn-full-accent" onClick={confirmImport}>Confirmer l'import</button>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
// Compatibilité Safari iOS 14+. Aucune fonction CSS moderne.

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  html, body { height:100%; background:#EEEEF3; font-family:'Inter',-apple-system,sans-serif; color:#1C1C1E; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#C7C7CC; border-radius:2px; }

  .app { display:flex; flex-direction:column; height:100dvh; }

  /* ── Topbar ── */
  .topbar { flex-shrink:0; height:50px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; gap:12px; background:#FFFFFF; border-bottom:1.5px solid #D1D1D6; }
  .prog-btn { display:flex; align-items:center; padding:5px 11px; background:#F0F0F5; border:1.5px solid #AEAEB2; border-radius:7px; cursor:pointer; font-family:inherit; font-size:0.76rem; font-weight:600; color:#1C1C1E; max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:border-color 0.15s; }
  .prog-btn:hover { border-color:#E8500A; }
  .save-dot { width:7px; height:7px; border-radius:50%; background:#AEAEB2; flex-shrink:0; transition:background 0.3s; }
  .save-dot.saving { background:#F97316; }
  .save-dot.saved  { background:#22C55E; }
  .save-dot.error  { background:#EF4444; }
  .hdr-ghost { font-family:inherit; font-size:0.7rem; font-weight:600; padding:6px 12px; background:none; border:1.5px solid #AEAEB2; border-radius:7px; color:#3A3A3C; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .hdr-ghost:hover { border-color:#E8500A; color:#E8500A; }
  .hdr-solid { font-family:inherit; font-size:0.7rem; font-weight:700; padding:6px 12px; background:#E8500A; border:none; border-radius:7px; color:#FFFFFF; cursor:pointer; transition:background 0.15s; white-space:nowrap; }
  .hdr-solid:hover { background:#C94209; }

  /* ── Main grid ── */
  .main { flex:1; min-height:0; display:grid; grid-template-columns:1fr 284px; overflow:hidden; }

  /* ── Week board ── */
  .week-board { display:flex; align-items:flex-start; gap:8px; padding:12px; overflow-x:auto; overflow-y:auto; }

  /* ── Rest slot — compact, vertical ── */
  .rest-slot { flex-shrink:0; width:62px; min-height:90px; background:#FFFFFF; border:1.5px dashed #D1D1D6; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; cursor:pointer; transition:all 0.15s; align-self:stretch; opacity:0.7; }
  .rest-slot:hover { border-color:#E8500A; background:#FFF3EE; opacity:1; }
  .rest-label { font-size:0.62rem; font-weight:700; color:#8E8E93; letter-spacing:0.5px; text-transform:uppercase; }
  .rest-icon  { font-size:1rem; color:#AEAEB2; line-height:1; }
  .rest-text  { font-size:0.58rem; color:#AEAEB2; }
  .rest-slot:hover .rest-icon { color:#E8500A; }
  .rest-slot:hover .rest-text { color:#E8500A; }

  /* ── Session column ── */
  .session-col { flex-shrink:0; width:380px; background:#FFFFFF; border-radius:10px; border:1.5px solid #D1D1D6; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,0.05); align-self:flex-start; }
  .session-col.btb-warning { border-color:#EA580C; }
  .col-header { display:flex; align-items:center; gap:6px; padding:12px 14px 10px; border-bottom:1px solid #F2F2F7; flex-shrink:0; min-height:50px; }
  .session-name { font-size:0.85rem; font-weight:700; color:#1C1C1E; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }
  .session-name:hover { color:#E8500A; }
  .rename-input { flex:1; background:transparent; border:none; border-bottom:2px solid #E8500A; font-family:inherit; font-size:0.74rem; font-weight:700; color:#1C1C1E; outline:none; padding-bottom:1px; min-width:0; }
  .col-del-btn { background:none; border:none; color:#AEAEB2; font-size:0.7rem; cursor:pointer; padding:2px 4px; border-radius:4px; min-width:22px; min-height:22px; display:flex; align-items:center; justify-content:center; transition:all 0.1s; }
  .col-del-btn:hover { color:#EF4444; background:#FFF0F0; }

  /* ── Exercise row ── */
  .ex-list { display:flex; flex-direction:column; }
  .ex-row { display:flex; align-items:flex-start; gap:10px; padding:12px 12px 12px 14px; border-bottom:1px solid #F2F2F7; cursor:grab; transition:background 0.1s; }
  .ex-row:last-of-type { border-bottom:none; }
  .ex-row:hover { background:#FAFAFA; }
  .ex-idx { font-size:0.72rem; font-weight:600; color:#AEAEB2; width:16px; text-align:center; flex-shrink:0; padding-top:2px; }
  .ex-name { font-size:0.9rem; font-weight:600; color:#1C1C1E; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; cursor:pointer; }
  .ex-name:hover { color:#E8500A; }

  /* Sets — inline input */
  .sets-btn { width:26px; height:26px; background:#F2F2F7; border:1px solid #D1D1D6; border-radius:5px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center; color:#3A3A3C; flex-shrink:0; transition:all 0.1s; }
  .sets-btn:hover { background:#E8500A; border-color:#E8500A; color:#fff; }
  .sets-input { width:32px; height:26px; text-align:center; border:1px solid #E5E5EA; border-radius:4px; font-family:inherit; font-size:0.9rem; font-weight:700; color:#1C1C1E; background:transparent; outline:none; padding:0; -moz-appearance:textfield; }
  .sets-input:focus { border-color:#E8500A; background:#FFF3EE; }
  .sets-input::-webkit-inner-spin-button, .sets-input::-webkit-outer-spin-button { -webkit-appearance:none; }

  .ex-btn { background:none; border:none; font-size:0.7rem; color:#AEAEB2; cursor:pointer; padding:2px 4px; border-radius:4px; min-width:22px; min-height:22px; display:flex; align-items:center; justify-content:center; transition:all 0.1s; }
  .ex-btn:hover { background:#F2F2F7; color:#3A3A3C; }
  .ex-btn.del:hover { background:#FFF0F0; color:#EF4444; }

  .add-ex-btn { display:flex; align-items:center; gap:6px; padding:11px 14px; font-family:inherit; font-size:0.82rem; font-weight:600; color:#E8500A; background:none; border:none; border-top:1px solid #F2F2F7; cursor:pointer; width:100%; min-height:40px; transition:background 0.1s; }
  .add-ex-btn:hover { background:#FFF3EE; }

  /* ── Analysis panel ── */
  .analysis-panel { border-left:1.5px solid #D1D1D6; background:#FFFFFF; overflow-y:auto; display:flex; flex-direction:column; }
  .panel-block { padding:12px 13px; border-bottom:1px solid #F2F2F7; }
  .panel-block:last-child { border-bottom:none; }
  .panel-label { font-size:0.58rem; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#8E8E93; }

  /* ── Modals ── */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal { background:#F2F2F7; border-radius:14px; width:480px; max-height:88vh; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
  .modal-handle { width:36px; height:4px; background:#AEAEB2; border-radius:2px; margin:10px auto 0; flex-shrink:0; }
  .modal-header { padding:13px 15px 11px; border-bottom:1.5px solid #D1D1D6; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; background:#FFFFFF; border-radius:14px 14px 0 0; }
  .modal-title  { font-size:0.92rem; font-weight:700; color:#1C1C1E; }
  .modal-close  { background:#E5E5EA; border:none; color:#3A3A3C; font-size:0.7rem; font-weight:700; cursor:pointer; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.1s; }
  .modal-close:hover { background:#AEAEB2; }

  .picker-search { width:100%; background:#FFFFFF; border:1.5px solid #AEAEB2; border-radius:9px; padding:9px 13px; color:#1C1C1E; font-family:inherit; font-size:0.86rem; outline:none; }
  .picker-search::placeholder { color:#8E8E93; }
  .picker-search:focus { border-color:#E8500A; box-shadow:0 0 0 3px rgba(232,80,10,0.1); }
  .picker-row { display:flex; align-items:center; gap:9px; padding:10px 13px; border-bottom:1px solid #F2F2F7; cursor:pointer; min-height:48px; transition:background 0.1s; }
  .picker-row:last-child { border-bottom:none; }
  .picker-row:hover { background:#FFF3EE; }

  .lib-row { display:flex; align-items:center; gap:9px; padding:10px 13px; border-bottom:1px solid #F2F2F7; cursor:pointer; transition:background 0.1s; }
  .lib-row:hover { background:#FFFAF7; }

  .modal-form { padding:13px; display:flex; flex-direction:column; gap:13px; overflow-y:auto; }
  .form-label  { font-size:0.63rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#6B6B6B; margin-bottom:5px; display:block; }
  .form-input  { width:100%; background:#FFFFFF; border:1.5px solid #AEAEB2; border-radius:9px; padding:10px 13px; color:#1C1C1E; font-family:inherit; font-size:0.9rem; outline:none; min-height:42px; }
  .form-input::placeholder { color:#8E8E93; }
  .form-input:focus { border-color:#E8500A; box-shadow:0 0 0 3px rgba(232,80,10,0.1); }
  .form-select { background:#FFFFFF; border:1.5px solid #AEAEB2; border-radius:9px; padding:10px 13px; color:#1C1C1E; font-family:inherit; font-size:0.9rem; outline:none; cursor:pointer; min-height:42px; }
  .form-select:focus { border-color:#E8500A; }

  .btn-cancel { background:#F2F2F7; border:1.5px solid #D1D1D6; color:#3A3A3C; font-family:inherit; font-size:0.78rem; font-weight:600; padding:9px 15px; border-radius:9px; cursor:pointer; min-height:38px; transition:background 0.1s; }
  .btn-cancel:hover { background:#E5E5EA; }
  .btn-save { background:#E8500A; border:none; color:#FFFFFF; font-family:inherit; font-size:0.78rem; font-weight:700; padding:9px 16px; border-radius:9px; cursor:pointer; min-height:38px; transition:background 0.1s; }
  .btn-save:hover { background:#C94209; }
  .btn-full-accent { width:100%; font-family:inherit; font-size:0.83rem; font-weight:700; padding:12px; background:#E8500A; border:none; color:#FFFFFF; border-radius:9px; cursor:pointer; min-height:44px; transition:background 0.1s; }
  .btn-full-accent:hover { background:#C94209; }
  .btn-icon-sm { background:#F2F2F7; border:1px solid #D1D1D6; color:#6B6B6B; font-size:0.8rem; cursor:pointer; padding:3px 7px; border-radius:5px; min-width:28px; min-height:28px; display:flex; align-items:center; justify-content:center; transition:all 0.1s; }
  .btn-icon-sm:hover { border-color:#E8500A; color:#E8500A; background:#FFF3EE; }
  .btn-icon-sm.del:hover { border-color:#EF4444; color:#EF4444; background:#FFF0F0; }

  .spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;
