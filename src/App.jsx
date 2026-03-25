import { useState, useRef, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const C = {
  accent:     "#E8500A", accentDark: "#C94209", accentBg: "#FFF3EE",
  bg:         "#F1F1F4", surface:    "#FFFFFF",
  border:     "rgba(0,0,0,0.08)", borderLight:"rgba(0,0,0,0.05)",
  text:       "#111111", textSub:    "#333333", textMuted: "#777777",
  textFaint:  "#999999", textGhost:  "#BBBBBB",
  green:      "#16A34A", greenBg:    "#F0FDF4",
  orange:     "#EA580C", orangeBg:   "#FFF7ED",
  red:        "#DC2626", redBg:      "#FEF2F2",
  blue:       "#1D4ED8", blueBg:     "#EFF6FF",
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

const SESSION_COLORS = [
  { id:"red",    bg:"#FECACA", border:"#EF4444", label:"Rouge"  },
  { id:"orange", bg:"#FED7AA", border:"#F97316", label:"Orange" },
  { id:"yellow", bg:"#FEF08A", border:"#EAB308", label:"Jaune"  },
  { id:"green",  bg:"#BBF7D0", border:"#22C55E", label:"Vert"   },
  { id:"blue",   bg:"#BFDBFE", border:"#3B82F6", label:"Bleu"   },
  { id:"purple", bg:"#E9D5FF", border:"#A855F7", label:"Violet" },
  { id:"pink",   bg:"#FBCFE8", border:"#EC4899", label:"Rose"   },
  { id:"gray",   bg:"#E5E7EB", border:"#6B7280", label:"Gris"   },
];

// ─── EXERCISE DATABASE ────────────────────────────────────────────────────────

const EXERCISE_DB = {
  // ── Pectoraux ──
  "Presse pectoraux machine": { tier:"S+", primary:["Pectoraux"], secondary:["Triceps"], desc:"Assis ou allongé selon la machine, poussée guidée. Cible le grand pectoral dans son ensemble, le petit pectoral, le triceps brachial et les faisceaux antérieurs du deltoïde. La machine élimine le travail stabilisateur et concentre le stimulus sur les pectoraux. Les faisceaux médians et inférieurs du pectoral (les plus puissants) sont pleinement activés. Le dentelé antérieur et les rhomboïdes stabilisent l'omoplate." , movement:"push" },
  "Écarté câble assis": { tier:"S",  primary:["Pectoraux"], secondary:[], desc:"Poulie vis-à-vis, buste légèrement incliné. Résistance constante sur toute la plage de mouvement. En variant l'inclinaison du buste et la hauteur des câbles, on cible les différents faisceaux du grand pectoral : câbles bas = faisceaux supérieurs ; câbles en haut = faisceaux inférieurs. Le petit pectoral (stabilisateur de l'omoplate) est aussi sollicité. Bras croisés en fin de mouvement = accentuation sur la partie sternale." , movement:"push" },
  "Développé couché barre": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Allongé, dos légèrement cambré, pieds au sol pour la stabilité. Prise en pronation plus large que les épaules. Le grand pectoral (toutes portions), le petit pectoral, le triceps, le deltoïde antérieur, le dentelé antérieur et le coraco-brachial sont sollicités. Personnes avec bras longs : le grand pectoral est plus étiré à la descente, augmentant le risque de déchirure — envisager une prise plus serrée. Cage thoracique épaisse = amplitude réduite = plus sécurisé. Jamais de rebond sur la poitrine." , movement:"push" },
  "Développé incliné barre": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Banc incliné 45-60°, barre sur la fourchette sternale. Sollicite principalement le faisceau claviculaire du grand pectoral (haut des pectoraux), les faisceaux antérieurs du deltoïde, les triceps, le dentelé antérieur et le petit pectoral. Au-delà de 60° d'inclinaison, l'effort bascule vers les deltoïdes. Ce mouvement pousse vers le haut = stabilise l'articulation acromio-claviculaire — recommandé en cas de pathologie acromio-claviculaire." , movement:"push" },
  "Développé couché haltères": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Allongé, haltères en pronation. Même muscles que le développé barre mais plus grande amplitude — le grand pectoral est davantage étiré en bas. Rotation des avant-bras pour ramener les mains face à face en haut = contraction maximale de la partie sternale. Révèle les déséquilibres gauche/droite. Moins de risque de déchirure qu'avec la barre car l'amplitude peut être contrôlée individuellement." , movement:"push" },
  "Développé incliné haltères": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Banc incliné 45-60°, haltères. Même que le développé incliné barre mais plus grande plage de mouvement. Travaille les faisceaux claviculaires du pectoral, les deltoïdes antérieurs, le dentelé antérieur, le petit pectoral et les triceps. Variante : démarrer mains en pronation et tourner vers la semi-pronation = concentre sur la partie sternale." , movement:"push" },
  "Dips lestés": { tier:"A",  primary:["Pectoraux","Triceps"], secondary:["Épaules"], desc:"Dips aux barres parallèles. Buste incliné = plus de pectoraux (partie inférieure) ; buste droit = plus de triceps et de deltoïdes antérieurs. Excellent pour étirer le grand pectoral. Attention aux cervicales : tête en extension (menton relevé) peut compresser les racines nerveuses cervicales — maintenir la tête neutre ou légèrement en avant." , movement:"push" },
  "Pompes déficit": { tier:"A",  primary:["Pectoraux"], secondary:["Triceps","Épaules"], desc:"Pompes avec les mains posées sur des supports surélevés, permettant une descente plus profonde. Augmente l'étirement du grand pectoral en bas du mouvement — stimulus hypertrophique supérieur à la pompe classique." , movement:"push" },
  "Développé couché Smith": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Développé couché guidé sur Smith machine. La barre guidée permet de pousser plus lourd en sécurité sans partenaire. Moins de travail stabilisateur que la barre libre mais le stimulus pectoral est similaire. Permet de varier la position des pieds et la cambrure." , movement:"push" },
  "Développé incliné Smith": { tier:"A",  primary:["Pectoraux"], secondary:["Épaules","Triceps"], desc:"Version inclinée sur Smith machine. Sécurisé et guidé — idéal pour travailler lourd sur le faisceau claviculaire des pectoraux." , movement:"push" },
  "Croisé poulies": { tier:"A",  primary:["Pectoraux"], secondary:[], desc:"Débout, buste légèrement incliné, câbles vis-à-vis. En variant l'angle de travail (câbles bas = faisceaux supérieurs ; câbles haut = faisceaux inférieurs), on cible tout le grand pectoral. Résistance constante sur toute la plage. Croiser les bras en fin de mouvement accentue le travail de la partie sternale. Le petit pectoral (stabilisateur de l'omoplate) est aussi actif." , movement:"push" },
  "Peck deck": { tier:"A",  primary:["Pectoraux"], secondary:[], desc:"Assis, avant-bras appuyés sur les boudins ou mains sur les poignées, rapprochement des coudes. Isole le grand pectoral — en particulier la partie sternale lors du rapprochement final. Développe aussi le coraco-brachial et la courte portion du biceps. La tension constante et les séries longues favorisent la congestion. Bonne introduction pour acquérir la force avant les mouvements complexes." , movement:"push" },
  "Écarté haltères": { tier:"A",  primary:["Pectoraux"], secondary:[], desc:"Allongé sur banc étroit, haltères bras tendus, écartement jusqu'à l'horizontale. Isole le grand pectoral avec un fort étirement en bas du mouvement. Petite contraction isométrique en fin de mouvement pour la partie sternale. Ne jamais travailler lourd — risque de déchirure des faisceaux claviculaires élevé en position d'étirement extrême. Excellent mouvement pour l'expansion thoracique." , movement:"push" },
  "Développé décliné barre": { tier:"B",  primary:["Pectoraux"], secondary:["Triceps"], desc:"Allongé tête en bas, 20-40°, pieds fixés. Descente sur le bas des pectoraux. Sollicite principalement les faisceaux inférieurs du grand pectoral, les triceps et les faisceaux antérieurs du deltoïde. Intéressant pour souligner le sillon inférieur des pectoraux. Avec charges légères, descente au niveau du cou = excellent étirement des pectoraux." , movement:"push" },
  "Développé décliné haltères": { tier:"B",  primary:["Pectoraux"], secondary:["Triceps"], desc:"Version déclinée avec haltères. Plus grande amplitude que la barre. Cible les faisceaux inférieurs des pectoraux avec les triceps et les deltoïdes antérieurs." , movement:"push" },
  "Pompes élastiques": { tier:"B",  primary:["Pectoraux"], secondary:["Triceps"], desc:"L'élastique augmente la résistance en fin de mouvement (contraction). Bonne option sans matériel. La charge maximale est limitée par l'élastique disponible." , movement:"push" },
  "Pompes": { tier:"C",  primary:["Pectoraux"], secondary:["Triceps","Épaules"], desc:"En appui face au sol, mains écartées. Grand pectoral, triceps brachial, deltoïdes antérieurs et dentelés antérieurs (qui maintiennent les omoplates sur la cage thoracique). Pieds surélevés = faisceaux claviculaires ; buste surélevé = partie inférieure. Mains rapprochées = partie sternale ; mains écartées = partie externe." , movement:"push" },
  "Développé sol": { tier:"C",  primary:["Pectoraux"], secondary:["Triceps"],           desc:"La plage de mouvement est limitée par le sol. Acceptable en dépannage mais beaucoup mieux disponible." , movement:"push" },
  "Pull-over haltère": { tier:"D",  primary:["Dos","Pectoraux"], secondary:[], desc:"Allongé sur banc (ou transversalement), haltère tenu à deux mains, bras tendus derrière la tête. Développe le grand pectoral en épaisseur, le chef long du triceps, le grand rond, le grand dorsal, le dentelé antérieur, le rhomboïde et le petit pectoral. Ces trois derniers muscles stabilisent l'omoplate. Mouvement fondamental pour l'expansion thoracique si travaillé léger avec inspiration maximale en démarrant le mouvement." , movement:"neutral" },
  // ── Dos ──
  "Tirage vertical prise large": { tier:"S",  primary:["Dos"], secondary:["Biceps"], desc:"Poulie haute, prise en pronation écartée, tirage jusqu'à la fourchette sternale (version poitrine). Travaille les fibres supérieures et centrales du grand dorsal en profondeur et épaisseur. Rhomboïde, trapèze (portions moyenne et inférieure), biceps brachial et brachial sont aussi sollicités. La version nuque (barre derrière la tête) développe les fibres externes du grand dorsal pour la largeur mais présente un risque de syndrome d'accrochage — à éviter si espace sous-acromial réduit." , movement:"pull" },
  "Tirage vertical prise neutre": { tier:"S",  primary:["Dos"], secondary:["Biceps"], desc:"Poulie haute, poignée neutre serrée, tirage jusqu'au sternum. La prise en semi-pronation permet une large participation du brachio-radial et une bonne activation du grand dorsal et du grand rond dans leur ensemble. Rhomboïde et faisceaux postérieurs du deltoïde sont sollicités en fin de mouvement." , movement:"pull" },
  "Tirage vertical 1 bras": { tier:"S",  primary:["Dos"], secondary:["Biceps"], desc:"Poulie haute, un bras à la fois. Permet un étirement supérieur du grand dorsal et corrige les déséquilibres gauche/droite. Même muscles que le tirage deux mains." , movement:"pull" },
  "Meadows row": { tier:"S",  primary:["Dos"], secondary:["Biceps"], desc:"Debout, barre en T saisie unilatéralement. Position qui permet une plage complète et un étirement exceptionnel du grand dorsal. Sollicite le grand dorsal, le grand rond, le rhomboïde, le deltoïde postérieur et les fléchisseurs du bras." , movement:"pull" },
  "Rowing buste appuyé": { tier:"S",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Poitrine appuyée sur banc incliné à 45°, haltères. L'appui élimine totalement l'élan du buste et le travail des muscles spinaux — le dos travaille en isolation complète. Grand dorsal, grand rond, rhomboïdes, faisceaux postérieurs du deltoïde et fléchisseurs des bras. Excellent pour l'épaisseur du dos." , movement:"pull" },
  "Rowing câble": { tier:"S",  primary:["Dos"], secondary:["Biceps"], desc:"Assis, câble prise serrée semi-pronation, tirage jusqu'à la base du sternum. Grand dorsal, grand rond, faisceaux postérieurs du deltoïde, biceps brachial, brachio-radial, et en fin de mouvement lors du rapprochement des omoplates : trapèze et rhomboïdes. La position assise élimine les compensations lombaires. Permet aussi d'assouplir le dos en phase négative." , movement:"pull" },
  "Rowing câble prise large": { tier:"S",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Assis, câble prise large en pronation. La prise large accentue les faisceaux postérieurs du deltoïde, l'infra-épineux, le petit rond et la portion moyenne des trapèzes. Grand dorsal et grand rond également sollicités. En supination = plus de biceps et de trapèze supérieur." , movement:"pull" },
  "Tractions prise large": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Traction prise pronation large. Accentue les fibres externes du grand dorsal pour la largeur du dos. Participent aussi le biceps brachial, le brachial, le brachio-radial et lors du rapprochement des omoplates : les rhomboïdes et trapèze." , movement:"pull" },
  "Tractions prise neutre": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Prise parallèle ou semi-pronation — position la plus forte mécaniquement pour le coude. Sollicite le grand dorsal et le grand rond en combinant l'épaisseur et la largeur. Moins de stress sur les coudes qu'en pronation. Biceps brachial et brachial fortement impliqués." , movement:"pull" },
  "Tirage vertical croisé 1 bras": { tier:"A",  primary:["Dos"], secondary:["Biceps"], desc:"Câble croisé, un bras à la fois, angle différent du tirage vertical classique. Varie l'angle d'attaque sur le grand dorsal. Sollicite aussi le grand rond et les biceps." , movement:"pull" },
  "Pendlay row déficit": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Version Pendlay depuis une surélévation des pieds — plus grande amplitude de mouvement. Augmente l'étirement du grand dorsal et l'activation musculaire totale." , movement:"pull" },
  "Rowing haltère 1 bras": { tier:"A",  primary:["Dos"], secondary:["Biceps"], desc:"Main et genou opposés en appui sur un banc. Grand dorsal, grand rond, faisceaux postérieurs du deltoïde, en fin de tirage : trapèze et rhomboïde. Les fléchisseurs du bras participent. Une légère torsion du buste en fin de tirage maximise la contraction. Ne jamais arrondir le dos." , movement:"pull" },
  "Kroc row": { tier:"A",  primary:["Dos"], secondary:["Biceps","Avant-bras"], desc:"Rowing haltère unilatéral avec charge très lourde et légère triche en fin de série. Développe la force de préhension et l'épaisseur du dos. Grand dorsal, grand rond et muscles fléchisseurs des doigts (avant-bras) fortement sollicités." , movement:"pull" },
  "Tractions lestées": { tier:"A",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"En suspension, prise en pronation très écartée. Développe le grand dorsal, le grand rond et lors du rapprochement des omoplates en fin de traction, les rhomboïdes et les portions moyennes et inférieures du trapèze. Le biceps brachial, le brachial et le brachio-radial participent. Coudes ramenés le long du corps = fibres externes du grand dorsal = largeur du dos. Coudes tirés en arrière avec menton à la barre = fibres supérieures et centrales du grand dorsal = épaisseur. En séries longues : maintenir les coudes légèrement fléchis pour protéger le tendon distal du biceps." , movement:"pull" },
  "Tractions prise supination": { tier:"B",  primary:["Dos","Biceps"], secondary:["Trapèzes"], desc:"Prise en supination (paumes vers soi). La supination implique davantage le biceps brachial en plus du grand dorsal et du grand rond. Sollicite aussi le trapèze et le rhomboïde. Excellent exercice combiné dos/biceps." , movement:"pull" },
  "Rowing barre": { tier:"B",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Debout buste incliné. Grand dorsal, grand rond, deltoïde postérieur, fléchisseurs des bras, rhomboïdes et trapèze. Ne jamais arrondir le dos." , movement:"pull" },
  "Pendlay row": { tier:"B",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"Depuis le sol, buste horizontal, tirage explosif jusqu'à la poitrine. Chaque répétition part du sol — élimine l'élan et travaille le dos en isométrie maximale. Grand dorsal, grand rond, rhomboïdes, trapèze et fléchisseurs des bras." , movement:"pull" },
  "Face pull corde": { tier:"B",  primary:["Épaules","Trapèzes"], secondary:[], desc:"Poulie dans l'axe des épaules, corde tirée vers le visage. Infra-épineux, petit rond (rotateurs externes de l'humérus) et faisceaux postérieurs du deltoïde. Rhomboïdes et trapèze en fin de mouvement. Indispensable pour contrebalancer l'entraînement des pectoraux et prévenir les pathologies de l'épaule." , movement:"pull" },
  "Soulevé de terre": { tier:"C",  primary:["Dos","Ischio-jambiers","Fessiers"], secondary:["Trapèzes"], desc:"Depuis le sol, jambes fléchies, buste fixé et légèrement cambré. Travaille l'ensemble des muscles du corps : sacro-lombaires, trapèzes, fessiers, quadriceps, ischio-jambiers fortement sollicités. Pendant la montée : les jambes poussent puis le dos redresse. La barre remonte le long des tibias — ne jamais arrondir le dos pour protéger les disques intervertébraux. Blocage indispensable avec charges lourdes : inspiration profonde + contraction abdominale + cambrer les lombaires." , movement:"neutral" },
  "Yates row": { tier:"C",  primary:["Dos"], secondary:["Biceps"], desc:"Rowing buste semi-droit (45-70°). La position plus verticale réduit le travail des spinaux et accentue le trapèze supérieur. Grand dorsal et biceps également sollicités." , movement:"pull" },
  "Rowing inversé": { tier:"C",  primary:["Dos"], secondary:["Biceps","Trapèzes"], desc:"En suspension sous une barre fixe horizontale, corps incliné. Équivalent des tractions pour les débutants. Grand dorsal, grand rond, rhomboïdes, biceps brachial. Vite trop facile — passer aux tractions." , movement:"pull" },
  "T-bar row": { tier:"C",  primary:["Dos"], secondary:["Biceps"], desc:"Tirage à la barre en T. Grand dorsal, grand rond, infra-épineux, rhomboïdes, trapèze et fléchisseurs des avant-bras. La position inclinée sollicite les muscles abdominaux et spinaux en isométrie. Prise semi-pronation = plus de brachio-radial." , movement:"pull" },
  "Rack pull": { tier:"D",  primary:["Dos"], secondary:["Trapèzes"], desc:"Soulevé de terre partiel depuis un support (genoux ou mi-cuisses). Travaille principalement les trapèzes supérieurs et les muscles spinaux sur une amplitude partielle. Permet des charges très élevées. Peu de stimulus hypertrophique comparé au soulevé complet." , movement:"neutral" },
  "Renegade row": { tier:"F",  primary:["Dos"], secondary:[], desc:"En position de planche, rowing unilatéral avec haltères. La planche sollicite les abdominaux et les stabilisateurs du tronc en isométrie. Grand dorsal sollicité mais la charge est limitée par la stabilisation. Ratio stimulus/fatigue faible pour le dos." , movement:"pull" },
  // ── Épaules ──
  "Élévations latérales câble": { tier:"S",  primary:["Épaules"], secondary:[], desc:"Poulie basse, élévation latérale avec câble. Le câble maintient une tension en bas du mouvement là où les haltères n'en ont aucune — stimulus plus complet sur la portion moyenne du deltoïde. Même muscles que les élévations haltères : portion moyenne du deltoïde et supra-épineux en profondeur." , movement:"neutral" },
  "Cable Y raise": { tier:"S",  primary:["Épaules"], secondary:["Trapèzes"], desc:"Poulies basses, élévation en Y. Cible simultanément le deltoïde postérieur et les trapèzes (portions moyenne et inférieure) — muscles responsables du redressement des omoplates et de la posture. Excellent pour contrebalancer l'entraînement excessif des pectoraux qui tire les épaules en avant." , movement:"pull" },
  "Élévations latérales câble dos": { tier:"S",  primary:["Épaules"], secondary:[], desc:"Câble croisé, buste légèrement penché, tirage vers l'arrière. Angle différent qui cible davantage le deltoïde postérieur et les rotateurs externes (infra-épineux, petit rond). Excellent pour l'équilibre antéro-postérieur de l'épaule." , movement:"pull" },
  "Oiseau machine": { tier:"S",  primary:["Épaules"], secondary:["Trapèzes"], desc:"Machine peck deck inverse ou machine arrière des épaules, assis, buste appuyé. Isole les faisceaux postérieurs du deltoïde, l'infra-épineux et le petit rond. En fin de mouvement (rapprochement des omoplates) : trapèze et rhomboïdes. Ces muscles sont souvent le siège de contractures qui, si non traitées, peuvent générer des frottements du tendon du chef long du biceps dans sa gouttière." , movement:"pull" },
  "Croisé poulies inverse": { tier:"S",  primary:["Épaules"], secondary:["Trapèzes"], desc:"Poulies hautes croisées, buste légèrement penché. Même muscles que l'oiseau machine : deltoïde postérieur, infra-épineux, petit rond, en fin de mouvement les rhomboïdes et le trapèze. La tension constante du câble est supérieure aux haltères pour cet exercice." , movement:"pull" },
  "Développé épaules machine": { tier:"A+", primary:["Épaules"], secondary:["Triceps"], desc:"Machine guidée pour les épaules. La trajectoire fixe permet de se concentrer uniquement sur le deltoïde sans effort de stabilisation. Idéal pour les personnes fragiles des épaules — les développés coudes vers l'avant limitent les frottements excessifs sous l'acromion. Sollicite la portion moyenne et les faisceaux antérieurs du deltoïde, le trapèze et le triceps." , movement:"push" },
  "Élévations latérales inclinées": { tier:"A",  primary:["Épaules"], secondary:[], desc:"Allongé sur le côté ou assis incliné. La position met le deltoïde en étirement dès le départ — contrairement aux élévations debout où la résistance est nulle en bas, ici le travail est maximal en début de mouvement. Le supra-épineux est particulièrement sollicité dans la phase initiale d'élévation." , movement:"neutral" },
  "Développé militaire haltères": { tier:"A",  primary:["Épaules"], secondary:["Triceps"], desc:"Assis, haltères en pronation au niveau des épaules. Mêmes muscles que le développé militaire barre mais les haltères offrent plus de liberté de mouvement. La variante mains en semi-pronation avec rotation des poignets (Arnold press) active aussi bien les faisceaux antérieurs. Sollicite le deltoïde (portion moyenne et antérieure), le trapèze, le dentelé antérieur et le triceps." , movement:"push" },
  "Élévations latérales allongé": { tier:"A",  primary:["Épaules"], secondary:[], desc:"Allongé sur le côté, haltère en pronation. La position couchée place le deltoïde en pré-étirement, concentrant l'effort sur la phase initiale de l'élévation. Séries de 10-20 répétitions. Varier la position de départ de l'haltère (devant, sur la cuisse, derrière) pour cibler les différents faisceaux." , movement:"neutral" },
  "Arnold press": { tier:"A",  primary:["Épaules"], secondary:["Triceps"], desc:"Haltères en supination (paumes vers soi) au départ, rotation vers la pronation en montant. Ce mouvement sollicite les trois faisceaux du deltoïde successivement tout au long de la montée, grâce à la rotation. Le faisceau claviculaire du grand pectoral et le triceps participent. Recommandé aux personnes fragiles des épaules : les coudes en avant limitent les frottements sous-acromiaux." , movement:"push" },
  "Développé militaire barre": { tier:"B+", primary:["Épaules"], secondary:["Triceps"], desc:"Assis ou debout, barre en pronation devant ou derrière la nuque. Sollicite le deltoïde (faisceaux antérieur et portion moyenne), le trapèze, le triceps brachial, le dentelé antérieur et en profondeur le supra-épineux. Développé devant = plus sûr, moins traumatisant pour l'articulation acromio-claviculaire. Développé nuque = risque de syndrome d'accrochage si l'espace sous-acromial est réduit. Coudes écartés = portion moyenne du deltoïde ; coudes vers l'avant = faisceaux antérieurs." , movement:"push" },
  "Élévations latérales haltères": { tier:"B",  primary:["Épaules"], secondary:[], desc:"Debout, bras légèrement fléchis, élévation jusqu'à l'horizontale. Cible la portion moyenne multipennée du deltoïde — la seule à déplacer le bras latéralement dans tous les plans. Le supra-épineux (en profondeur sous le deltoïde) contribue à l'initiation du mouvement. Varier la position de départ des haltères (devant, sur les côtés, derrière les fesses) pour solliciter tous les faisceaux penniformes. Ne jamais dépasser l'horizontale si douleur — l'espace sous-acromial peut être pincé." , movement:"neutral" },
  "Oiseau haltères": { tier:"B",  primary:["Épaules"], secondary:[], desc:"Buste penché en avant à 45°, dos plat, élévation latérale. Travaille l'ensemble des épaules en accentuant les faisceaux postérieurs du deltoïde. Resserrer les omoplates en fin de mouvement = sollicite aussi le trapèze (portions moyenne et inférieure), le rhomboïde, le petit rond et l'infra-épineux. Important pour l'équilibre postural et la prévention du syndrome d'accrochage." , movement:"pull" },
  "Élévations latérales machine": { tier:"B",  primary:["Épaules"], secondary:[], desc:"Assis sur la machine, pousser les coudes jusqu'à l'horizontale. La machine maintient une tension constante et guide la trajectoire. Excellent pour les débutants. Sollicite la portion moyenne du deltoïde et, si l'élévation dépasse l'horizontale, la portion supérieure du trapèze." , movement:"neutral" },
  "Tirage menton": { tier:"B",  primary:["Épaules","Trapèzes"], secondary:["Biceps"], desc:"Debout, barre en pronation, tirer jusqu'au menton en montant les coudes. Sollicite principalement l'ensemble des deltoïdes, les trapèzes, les biceps et les muscles de l'avant-bras. La prise large accentue les deltoïdes, la prise serrée les trapèzes. Attention : l'élévation du coude au-dessus de l'épaule peut pincer le tendon du supra-épineux contre la voûte acromio-coracoïdienne chez les personnes à l'espace sous-acromial réduit." , movement:"pull" },
  "Élévations latérales élastique": { tier:"C",  primary:["Épaules"], secondary:[], desc:"Élévation latérale à l'élastique. La résistance augmente progressivement contrairement aux haltères. Bon pour l'échauffement ou sans matériel. La charge maximale est limitée, pas idéal pour l'hypertrophie significative." , movement:"neutral" },
  "Élévations frontales": { tier:"D",  primary:["Épaules"], secondary:[], desc:"Debout, élévation des bras en avant jusqu'au niveau des yeux. Cible principalement les faisceaux antérieurs du deltoïde et le faisceau claviculaire du grand pectoral. Le biceps brachial participe faiblement. Tous les fixateurs de la scapula sont en contraction isométrique pour stabiliser le mouvement. Note : le deltoïde antérieur étant déjà très sollicité dans tous les mouvements de poussée, cet exercice est rarement nécessaire." , movement:"push" },
  // ── Biceps ──
  "Bayesian curl face away": { tier:"S+", primary:["Biceps"], secondary:[], desc:"Face éloignée de la poulie, câble dans le dos. Le bras est en extension derrière le corps — le biceps brachial et le chef long notamment sont en étirement maximal à la position de départ. Cette pré-tension augmente significativement le stimulus hypertrophique. Analogie avec le curl bras en croix : le chef court est mis en tension par la position bras écarté. Le brachial est également sollicité." , movement:"pull" },
  "Curl pupitre haltère": { tier:"S",  primary:["Biceps"], secondary:[], desc:"Assis, coude calé sur la face interne de la cuisse ou sur pupitre. L'appui élimine toute triche et contrôle l'amplitude, la vitesse et la rectitude du mouvement. Cible le biceps brachial et le brachial antérieur en isolation. La supination de l'haltère en fin de mouvement maximise la contraction. Attention à la tension très importante lors de l'extension complète — utilise des charges modérées au début." , movement:"pull" },
  "Curl pupitre machine": { tier:"S",  primary:["Biceps"], secondary:[], desc:"Même principe que le curl pupitre haltère mais la machine guide la trajectoire et maintient la tension constante. Les bras calés rendent la triche impossible. Tension musculaire très intense au démarrage — échauffement sérieux requis et ne pas tendre complètement les bras pour protéger les tendons." , movement:"pull" },
  "Curl marteau pupitre": { tier:"S",  primary:["Biceps"], secondary:["Avant-bras"], desc:"Version marteau sur pupitre Scott. Le pupitre élimine tout mouvement du coude et du buste — isolation maximale. La prise neutre cible le brachial et le brachio-radial en plus du biceps brachial, ce qui développe l'épaisseur du bras. La tension est très intense au démarrage (coude en extension) — impératif d'échauffer et de ne pas tendre complètement les bras pour éviter toute tendinite." , movement:"pull" },
  "Curl barre EZ": { tier:"A",  primary:["Biceps"], secondary:[], desc:"Debout, dos bien droit, barre en supination légèrement plus large que les épaules. Le biceps brachial est le moteur principal, assisté du brachial antérieur (plus profond, souvent sous-développé) et dans une moindre mesure du brachio-radial. La barre EZ soulage les poignets en cas de valgus du coude marqué — utilise-la si la barre droite est douloureuse. Variante : prise serrée = plus de chef long ; prise large = plus de chef court. Évite le balancement du buste qui transfère la charge sur les lombaires." , movement:"pull" },
  "Curl haltères debout": { tier:"A",  primary:["Biceps"], secondary:[], desc:"Debout, haltères en semi-pronation au départ, rotation vers la supination pendant la montée. Cet exercice réalise la fonction complète du biceps : flexion de l'avant-bras + supination (le biceps est le supinateur le plus puissant). Sollicite le brachio-radial, le brachial antérieur et le deltoïde antérieur. La rotation du poignet est clé — sans elle, tu travailles surtout le brachio-radial. Prise en supination dès le départ = prédominance biceps ; semi-pronation = prédominance brachio-radial." , movement:"pull" },
  "Curl incliné": { tier:"A",  primary:["Biceps"], secondary:[], desc:"Sur banc incliné, bras pendants en arrière. La position inclinée étire le chef long du biceps (portion externe) dès le départ — le tendon frotte dans le sillon intertuberculaire de l'humérus. Cela force le biceps à travailler depuis sa position d'étirement maximal, ce qui est optimal pour l'hypertrophie. Travaille aussi le brachio-radial et le brachial. Attention : ne pas trop incliner le banc — si le bras part trop en arrière, le tendon du chef long s'use prématurément dans le sillon." , movement:"pull" },
  "Curl haltères allongé": { tier:"A",  primary:["Biceps"], secondary:[], desc:"Allongé sur un banc, bras le long du corps. La position allongée crée un étirement du biceps similaire au curl incliné. Le biceps travaille sur toute la plage de tension maximale, du bas vers le haut." , movement:"pull" },
  "Curl câble debout": { tier:"A",  primary:["Biceps"], secondary:[], desc:"Face à la poulie basse, prise en supination. Le câble maintient une tension constante sur toute la plage contrairement à la gravité avec les haltères. Permet de bien localiser et congestioner le biceps brachial. Le brachial mono-articulaire est aussi sollicité. Séries longues recommandées pour la congestion. Variante à deux mains possible." , movement:"pull" },
  "Curl marteau": { tier:"A",  primary:["Biceps"], secondary:["Avant-bras"], desc:"Prise neutre (marteau) tout au long du mouvement. Cible principalement le brachio-radial (long supinateur) et le brachial — deux muscles souvent négligés qui forment l'épaisseur du bras. Le biceps intervient en second plan. Ce sont les muscles profonds, rectilignes, les plus économiques qui sont recrutés en premier ; plus la charge est lourde, plus les fibres superficielles s'activent. Excellent complément au curl classique pour un développement complet." , movement:"pull" },
  "Curl barre": { tier:"B",  primary:["Biceps"], secondary:[], desc:"Grand classique debout, barre droite en supination. Le biceps brachial est le moteur principal avec le brachial. Utilise la barre EZ si les poignets sont sensibles (valgus du coude). Prise serrée accentue le chef long, prise large le chef court. Lever les coudes en fin de mouvement augmente la contraction et fait intervenir les faisceaux antérieurs du deltoïde." , movement:"pull" },
  "Curl Scott": { tier:"C",  primary:["Biceps"], secondary:[], desc:"Le banc Scott place les bras en avant, ce qui met le biceps dans une position où le chef court est davantage sollicité. Attention : la tension est très forte en début de mouvement (coudes tendus). Ne pas étendre complètement les bras." , movement:"pull" },
  "Drag curl": { tier:"C",  primary:["Biceps"], secondary:[], desc:"Mouvement de curl où la barre remonte le long du corps en tirant les coudes vers l'arrière plutôt qu'en les gardant fixes. Cela accentue le travail du chef court du biceps et réduit l'implication du deltoïde. Charge limitée mais bonne isolation." , movement:"pull" },
  "Spider curl": { tier:"C",  primary:["Biceps"], secondary:[], desc:"Allongé à plat ventre sur un banc incliné, bras perpendiculaires au sol. Position qui immobilise complètement le coude et élimine toute compensation. Bonne isolation mais position inconfortable qui limite la charge." , movement:"pull" },
  // ── Triceps ──
  "Extension triceps câble barre": { tier:"S+", primary:["Triceps"], secondary:[], desc:"Debout face à la poulie haute, coudes le long du corps. Isolation du triceps — sollicite le chef latéral principalement. La variante dos à l'appareil (poulie arrière) place les coudes en hauteur, ce qui étire le chef long (polyarticulaire, qui croise l'épaule) et maximise son activation. La contraction isométrique 1-2 secondes en fin de mouvement intensifie la sensation. Avec une corde, le chef latéral est encore plus sollicité ; en supination, l'effort se porte sur le chef médial." , movement:"push" },
  "Barre front (Skullcrusher)": { tier:"S",  primary:["Triceps"], secondary:[], desc:"Allongé, barre en pronation, bras verticaux. La flexion descend la barre vers le front ou derrière la tête. Vers le front = prédominance des chefs médial et latéral ; derrière la tête = prédominance du chef long (étiré car bras au-dessus de la tête). Les trois chefs s'insèrent sur une plaque tendineuse commune à l'olécrâne. La barre EZ réduit le stress sur les poignets. Contrôle la descente — la tension est maximale en position d'étirement." , movement:"push" },
  "Pushdown barre": { tier:"A",  primary:["Triceps"], secondary:[], desc:"Poulie haute, coudes le long du corps. Exercice d'isolation classique du triceps, sollicite le triceps brachial et l'anconé. La charge lourde demande d'incliner légèrement le buste en avant pour plus de stabilité. Les extenseurs des poignets travaillent en contraction isométrique pour maintenir le poignet droit." , movement:"push" },
  "Extension triceps câble corde": { tier:"A",  primary:["Triceps"], secondary:[], desc:"Poulie haute avec corde. La corde permet une légère supination en fin de mouvement, accentuant la contraction du chef latéral. Sollicite le triceps brachial et l'anconé. Mains en supination reporte l'effort sur le chef médial ou vaste interne." , movement:"push" },
  "Extension triceps haltère 1 bras": { tier:"A",  primary:["Triceps"], secondary:[], desc:"Assis ou debout, bras vertical, haltère derrière la nuque. La position verticale du bras étire fortement le chef long du triceps — favorisant sa contraction lors du travail. Contracter la sangle abdominale pour éviter de cambrer le dos. Préférer un banc à dossier court." , movement:"push" },
  "Skullcrusher haltères": { tier:"A",  primary:["Triceps"], secondary:[], desc:"Même principe que le skullcrusher à la barre mais les haltères permettent plus de liberté de mouvement et une rotation individuelle des mains. Sollicite les trois chefs du triceps. La position allongée avec bras verticaux étire le chef long favorablement." , movement:"push" },
  "JM press Smith": { tier:"A",  primary:["Triceps"], secondary:[], desc:"Version guidée sur Smith machine du JM press. La trajectoire fixe sécurise l'exécution et permet de concentrer l'effort sur les triceps sans effort de stabilisation." , movement:"push" },
  "Kickback câble": { tier:"A",  primary:["Triceps"], secondary:[], desc:"Buste penché, bras à l'horizontale, extension de l'avant-bras. Le câble maintient la tension constante sur toute la plage, supérieur au haltère où la résistance est nulle en début de mouvement. Excellent pour congestioner l'ensemble du triceps. Séries longues jusqu'à la brûlure donnent les meilleurs résultats." , movement:"push" },
  "Développé couché prise serrée": { tier:"A",  primary:["Triceps"], secondary:["Pectoraux","Épaules"], desc:"Allongé, prise en pronation 10-40 cm d'écartement selon souplesse des poignets. Excellent pour la partie sternale des pectoraux et les triceps — peut s'inclure dans un programme spécifique bras. Coudes le long du corps = report sur deltoïdes antérieurs. Attention aux coudes : lors du verrouillage en fin de mouvement, micro-traumatismes potentiels — éviter d'étendre totalement les bras si douleur apparaît." , movement:"push" },
  "Pushdown corde": { tier:"B",  primary:["Triceps"], secondary:[], desc:"Variante avec corde à la poulie haute. La rotation finale écarte les brins vers l'extérieur, ce qui cible davantage le chef latéral mais réduit la charge possible par rapport à la barre. Bonne option en finisher." , movement:"push" },
  "Extension nuque haltère": { tier:"B",  primary:["Triceps"], secondary:[], desc:"Assis, haltère à deux mains derrière la nuque, bras verticaux. La position verticale étire fortement le chef long. Les fibres des trois chefs convergent sur une plaque tendineuse qui se rattache à l'olécrâne — lors de la contraction, le muscle forme sa forme caractéristique en fer à cheval. Contracter la sangle abdominale, utiliser un banc à dossier court." , movement:"push" },
  "JM press": { tier:"B",  primary:["Triceps"], secondary:[], desc:"Hybride entre développé couché et extension. La barre descend vers le visage en gardant les coudes légèrement vers l'avant. Permet une charge importante sur les triceps. Technique exigeante à maîtriser." , movement:"push" },
  "Dips prise serrée": { tier:"B",  primary:["Triceps"], secondary:["Pectoraux"], desc:"Dips avec prise serrée ou dips banc. La prise serrée isole davantage les triceps par rapport aux dips larges. Charge limitée par rapport aux extensions mais bon exercice de masse." , movement:"push" },
  "Dips machine": { tier:"B",  primary:["Triceps"], secondary:[], desc:"Version assistée ou lestée des dips. Permet de progresser ou de travailler avec surcharge ciblée. Même logique que les dips aux barres parallèles." , movement:"push" },
  "Pompes diamant": { tier:"B",  primary:["Triceps"], secondary:["Pectoraux"], desc:"Mains rapprochées en losange, prise serrée au sol. Sollicite les triceps intensément ainsi que la partie centrale des pectoraux. Vite limité par le poids du corps — à lester ou remplacer quand les répétitions dépassent 20." , movement:"push" },
  "Dips banc": { tier:"C",  primary:["Triceps"], secondary:[], desc:"Mains posées sur le bord d'un banc, pieds sur un autre banc. Travaille les triceps, les pectoraux et les faisceaux antérieurs des deltoïdes. La charge peut être augmentée en posant un poids sur les cuisses. Position moins traumatisante que les dips libres mais charge maximale plus limitée." , movement:"push" },
  "Kickback haltère": { tier:"C",  primary:["Triceps"], secondary:[], desc:"Buste penché, bras à l'horizontale. Extension de l'avant-bras en arrière. La tension gravitationnelle est quasi nulle en début de mouvement et maximale à l'horizontale seulement — le câble est supérieur pour l'isolation. Utile en finisher léger." , movement:"push" },
  // ── Quadriceps ──
  "Hack squat": { tier:"S+", primary:["Quadriceps"], secondary:["Fessiers"], desc:"Presse inclinée dite hack squat — dos contre le dossier, épaules sous les boudins. Permet de localiser l'effort sur les quadriceps sans contrainte lombaire excessive. Plus les pieds sont en avant sur la plate-forme = plus de fessiers ; pieds normaux = quads. Plus les pieds sont écartés = plus d'adducteurs. La position guidée permet des charges élevées en relative sécurité." , movement:"neutral" },
  "Squat barre": { tier:"S",  primary:["Quadriceps","Fessiers"], secondary:["Ischio-jambiers"], desc:"Barre sur les trapèzes, pieds dans l'axe des genoux. Travaille principalement les quadriceps, les fessiers, la masse des adducteurs, les muscles érecteurs du rachis, les abdominaux et les ischio-jambiers. Brévilignes (buste long, jambes courtes) : buste peu incliné, travail intense des quads. Longilignes (jambes longues) : buste très incliné, plus de fessiers et de lombaires — cale sous les talons recommandée. Ne jamais arrondir le dos. Descendre les cuisses à l'horizontale minimum pour bien activer les grands fessiers." , movement:"neutral" },
  "Pendulum squat": { tier:"S",  primary:["Quadriceps"], secondary:["Fessiers"], desc:"Trajectoire en arc guidée. Profondeur maximale possible sans contrainte lombaire. Excellent isolateur des quadriceps." , movement:"neutral" },
  "Squat Smith": { tier:"S",  primary:["Quadriceps","Fessiers"], secondary:[], desc:"Squat guidé sur Smith machine. La trajectoire fixe permet de pousser lourd en sécurité et de cibler spécifiquement les quads en jouant sur la position des pieds (pieds en avant = plus de fessiers ; pieds normaux = plus de quads)." , movement:"neutral" },
  "Fentes bulgares": { tier:"S",  primary:["Quadriceps","Fessiers"], secondary:["Ischio-jambiers"], desc:"Un pied surélevé sur un banc derrière, descente verticale. Quadriceps et grand fessier de la jambe avant, étirement du droit de la cuisse et de l'ilio-psoas de la jambe arrière. Révèle et corrige les déséquilibres gauche/droite. Grand pas = plus de fessiers ; petit pas = plus de quads. Demande de l'équilibre — débuter avec charges légères." , movement:"neutral" },
  "Squat avant": { tier:"A",  primary:["Quadriceps"], secondary:["Fessiers"], desc:"Barre posée sur les faisceaux antérieurs des deltoïdes et les pectoraux. La position avancée de la barre interdit toute inclinaison du buste — quadriceps en priorité absolue, moins de lombaires et d'ischio-jambiers. Travaille aussi les fessiers, les ischio-jambiers et la sangle abdominale. Se travaille toujours moins lourd que le squat classique. Talons surélevés recommandés pour plus de stabilité." , movement:"neutral" },
  "Squat barre basse": { tier:"A",  primary:["Quadriceps","Fessiers"], secondary:[], desc:"Barre placée plus bas, sur les deltoïdes postérieurs à la façon des powerlifteurs. Réduit le porte-à-faux en augmentant la puissance du dos. Permet des charges plus lourdes mais accentue le travail des fessiers et des lombaires. Technique des compétiteurs de force." , movement:"neutral" },
  "Presse 45°": { tier:"A",  primary:["Quadriceps","Fessiers"], secondary:[], desc:"Allongé sur la presse inclinée, pieds sur la plate-forme. Quadriceps, fessiers et muscles périphériques. Pieds haut = fessiers et ischio-jambiers ; pieds bas = quadriceps ; pieds écartés = adducteurs ; pieds serrés = quadriceps externes. Charge très élevée possible. Ne jamais décoller les fessiers du dossier." , movement:"neutral" },
  "Leg extension": { tier:"A",  primary:["Quadriceps"], secondary:[], desc:"Assis, chevilles sous les boudins, extension jusqu'à l'horizontale. Seul exercice d'isolation pure du quadriceps. Plus le dossier est incliné = bassin en rétroversion = droit de la cuisse (portion bi-articulaire) davantage étiré = travail plus intense. Recommandé pour acquérir la force avant les exercices plus techniques." , movement:"neutral" },
  "Nordic inverse": { tier:"A",  primary:["Quadriceps"], secondary:[], desc:"Fléchi vers l'avant depuis un appui aux genoux, résistance excentrique. Cible le quadriceps (droit de la cuisse) en excentrique. Difficile mais excellent pour l'hypertrophie et la prévention des blessures." , movement:"neutral" },
  "Fentes": { tier:"B",  primary:["Quadriceps","Fessiers"], secondary:["Ischio-jambiers"], desc:"Un pas en avant, cuisse à l'horizontale. Grand pas = prédominance du grand fessier et des ischio-jambiers ; petit pas = prédominance des quadriceps. Les grands fessiers redressent le bassin lors de la remontée. Ne pas arrondir le dos." , movement:"neutral" },
  "Goblet squat": { tier:"B",  primary:["Quadriceps","Fessiers"], secondary:[], desc:"Haltère tenu contre la poitrine, squat profond. La charge frontale oblige le buste à rester droit — excellent pour apprendre le mouvement de squat. Quadriceps, fessiers et adducteurs. Charge limitée à long terme." , movement:"neutral" },
  "Sissy squat": { tier:"B",  primary:["Quadriceps"], secondary:[], desc:"Genoux qui avancent en avant, talon surélevé. Étirement extrême du quadriceps (surtout le droit de la cuisse). Stress élevé sur les tendons rotuliens — à utiliser prudemment avec charges progressives." , movement:"neutral" },
  "Presse horizontale": { tier:"C",  primary:["Quadriceps"], secondary:["Fessiers"],          desc:"Moins efficace que la presse 45° en raison de la position couchée qui modifie la mécanique." , movement:"neutral" },
  "Step-ups": { tier:"C",  primary:["Quadriceps","Fessiers"], secondary:[], desc:"Montée sur banc ou marche. Fonctionnel mais charge maximale limitée. Quadriceps et fessiers. La hauteur du banc influence le ratio quad/fessier." , movement:"neutral" },
  "Pistol squat": { tier:"C",  primary:["Quadriceps","Fessiers"], secondary:[], desc:"Squat unilatéral sur une jambe, l'autre tendue en avant. Très technique — l'équilibre limite la progression en hypertrophie. Bon pour la force fonctionnelle et l'équilibre." , movement:"neutral" },
  "Squat sauté": { tier:"F",  primary:["Quadriceps"], secondary:[],                    desc:"Exercice pliométrique — bon pour la puissance mais inutile voire contre-productif pour l'hypertrophie." , movement:"neutral" },
  "Squat Bosu": { tier:"F-", primary:["Quadriceps"], secondary:[], desc:"Squat sur plateau instable. L'instabilité réduit la charge possible et le stimulus pour l'hypertrophie. À éviter si l'objectif est la masse musculaire." , movement:"neutral" },
  // ── Fessiers ──
  "Fentes marchées": { tier:"S",  primary:["Fessiers","Quadriceps"], secondary:["Ischio-jambiers"], desc:"Fentes en déplacement progressif. Dynamique, révèle les déséquilibres. Grand pas = fessiers ; pas court = quads. Volume élevé possible avec charges modérées. Ilio-psoas et droit de la cuisse de la jambe arrière s'étirent favorablement." , movement:"neutral" },
  "Abduction machine": { tier:"S",  primary:["Fessiers"], secondary:[], desc:"Assis sur la machine, écartement des cuisses. Buste sur le dossier = moyen fessier principalement ; buste penché en avant = portion supérieure du grand fessier. Excellent pour les femmes : raffermit et galbe le haut de la hanche, marque la taille. L'abduction de la hanche est limitée par la butée du col du fémur sur le rebord de la cavité cotyloïde — ne pas forcer au-delà." , movement:"neutral" },
  "Extension dos 45°": { tier:"S",  primary:["Fessiers","Ischio-jambiers"], secondary:["Dos"], desc:"Allongé sur banc à 45°, pieds fixés, buste dans le vide. Travaille principalement l'ensemble des muscles spinaux érecteurs du rachis (ilio-costal, longissimus, épineux, splénius, semi-épineux), le carré des lombes, et dans une moindre mesure les grands fessiers et les ischio-jambiers. La flexion complète est excellente pour assouplir les sacro-lombaires. La variante avec bâton sur les épaules immobilise le haut du dos et concentre l'effort sur les lombaires inférieurs." , movement:"neutral" },
  "Fentes Smith pied surélevé": { tier:"S",  primary:["Fessiers","Quadriceps"], secondary:[], desc:"Pied avant surélevé sur une marche, fente sur Smith machine. L'élévation du pied avant augmente la profondeur de descente et l'étirement des fessiers. Cible intensément le grand fessier et les adducteurs." , movement:"neutral" },
  "Hip thrust machine": { tier:"A",  primary:["Fessiers"], secondary:["Ischio-jambiers"], desc:"Extension de hanche guidée par la machine, dos calé contre un banc. Grand fessier principalement, semi-tendineux, semi-membraneux et chef long du biceps fémoral. L'extension de la hanche est limitée par la mise en tension du ligament ilio-fémoral (ligament de Bertin). Contraction isométrique 2 secondes en fin de mouvement pour maximiser l'activation du grand fessier." , movement:"neutral" },
  "Hip thrust 1 jambe haltère": { tier:"A",  primary:["Fessiers"], secondary:["Ischio-jambiers"], desc:"Version unilatérale du hip thrust. Corrige les déséquilibres gauche/droite et augmente l'activation par côté. Grand fessier et ischio-jambiers." , movement:"neutral" },
  "Kickbacks fessiers": { tier:"A",  primary:["Fessiers"], secondary:[], desc:"Debout face à la poulie, extension de la hanche en arrière. Grand fessier principalement, ischio-jambiers en assistance. L'extension est limitée par le ligament ilio-fémoral. Contraction isométrique finale pour maximiser le recrutement du grand fessier." , movement:"neutral" },
  "Soulevé de terre Roumain": { tier:"A",  primary:["Ischio-jambiers","Fessiers"], secondary:["Dos"], desc:"Debout, barre tenue, descente en gardant les jambes quasi-tendues. Le grand fessier et les ischio-jambiers (sauf le chef court du biceps fémoral) s'étirent lors de la descente et se contractent pour redresser le bassin. Ne jamais arrondir le dos — colonne neutre et cambrée impérative. Plus les charges sont importantes, plus les grands fessiers prennent le relais des ischio-jambiers." , movement:"neutral" },
  "Hip thrust barre": { tier:"B",  primary:["Fessiers"], secondary:["Ischio-jambiers"], desc:"Version classique du hip thrust, barre sur les hanches. Mêmes muscles que la machine. Mise en place plus contraignante mais charge maximale élevée." , movement:"neutral" },
  "Glute bridge": { tier:"B",  primary:["Fessiers"], secondary:["Ischio-jambiers"], desc:"Allongé sur le dos, genoux fléchis, décoller les fesses du sol. Grand fessier et ischio-jambiers. Amplitude plus limitée qu'avec un banc (hip thrust). Variante pieds surélevés = plus d'ischio-jambiers. Séries longues." , movement:"neutral" },
  "Abduction câble": { tier:"B",  primary:["Fessiers"], secondary:[], desc:"Debout, jambe reliée à la poulie basse, élévation latérale. Moyen fessier et petit fessier (plus profond). La mobilité dépend de la conformation osseuse du col du fémur. Séries longues jusqu'à la brûlure recommandées." , movement:"neutral" },
  "Fentes curtsy": { tier:"B",  primary:["Fessiers","Quadriceps"], secondary:[], desc:"Fente en croisant la jambe arrière derrière la jambe d'appui. Cible le moyen fessier et l'abducteur en plus du grand fessier et des quads. Complémentaire aux fentes classiques pour un travail latéral des fessiers." , movement:"neutral" },
  "Soulevé de terre sumo": { tier:"B",  primary:["Fessiers","Ischio-jambiers"], secondary:["Dos"], desc:"Jambes très écartées, pieds vers l'extérieur. Cible davantage les quadriceps, les adducteurs des cuisses et les fessiers, avec moins de travail du dos comparé au soulevé conventionnel. La charnière sacro-iliaque est fortement sollicitée avec des charges importantes. Fait partie des trois mouvements du powerlifting." , movement:"neutral" },
  "Frog pumps": { tier:"C",  primary:["Fessiers"], secondary:[], desc:"Allongé sur le dos, plantes des pieds se touchant, poussée des hanches. Activation légère du grand fessier en pré-activation ou échauffement. Peu de charge possible." , movement:"neutral" },
  "Donkey kicks": { tier:"D",  primary:["Fessiers"], secondary:[], desc:"À quatre pattes, extension de la hanche en arrière. Grand fessier principalement. La charge possible est très limitée sans élastique ou poulie — activation insuffisante pour l'hypertrophie optimale." , movement:"neutral" },
  "Kettlebell swing": { tier:"D",  primary:["Fessiers","Ischio-jambiers"], secondary:[], desc:"Balancement du kettlebell avec extension explosive de la hanche. Plus un exercice de puissance que d'hypertrophie. Grand fessier et ischio-jambiers comme moteurs principaux, avec les spinaux en isométrie." , movement:"neutral" },
  // ── Ischio-jambiers ──
  "Nordic curl": { tier:"S+", primary:["Ischio-jambiers"], secondary:[], desc:"Agenouillé, chevilles fixées, descente contrôlée du corps vers l'avant. Contraction excentrique maximale des ischio-jambiers — le semi-tendineux, le semi-membraneux et le biceps fémoral (chef long) travaillent depuis leur position d'étirement. Le chef court du biceps fémoral est le seul ischio-jambier mono-articulaire et reste actif en toutes positions. Exercice préventif contre les déchirures musculaires aux ischio-jambiers, fréquentes au squat quand le buste s'incline excessivement." , movement:"neutral" },
  "Leg curl assis": { tier:"S",  primary:["Ischio-jambiers"], secondary:[], desc:"Assis, cuisses calées, chevilles sur le boudin. La position assise (hanche fléchie = ischio-jambiers en étirement à leur origine) cible favorablement le semi-membraneux, le semi-tendineux et le chef long du biceps fémoral. Travaille aussi en profondeur le muscle poplité. Pieds en flexion dorsale = plus de gastrocnémiens ; pieds en extension = plus d'ischio-jambiers." , movement:"neutral" },
  "Leg curl couché": { tier:"A",  primary:["Ischio-jambiers"], secondary:[], desc:"Allongé à plat ventre, chevilles sous les boudins. Sollicite l'ensemble des ischio-jambiers et les gastrocnémiens. Moins d'étirement des ischios à l'origine qu'en position assise. Pieds en extension = prédominance ischio-jambiers ; pieds en flexion dorsale = prédominance gastrocnémiens. Séries longues pour les gastrocnémiens, charges lourdes pour les ischio-jambiers." , movement:"neutral" },
  "Soulevé de terre jambes tendues": { tier:"B",  primary:["Ischio-jambiers","Fessiers"], secondary:["Dos"], desc:"Depuis le sol, jambes tendues, buste penché. Étirement intense des ischio-jambiers et des fessiers lors de la descente. Les pieds surélevés par rapport à la barre augmentent l'amplitude. Réalisé léger, peut être considéré comme un exercice de stretching pour les ischio-jambiers." , movement:"neutral" },
  "Good morning": { tier:"B",  primary:["Ischio-jambiers","Dos"], secondary:["Fessiers"], desc:"Debout, barre sur les trapèzes, flexion du buste vers l'avant en gardant le dos cambré. Travaille le grand fessier, l'ensemble des muscles spinaux et surtout les ischio-jambiers (à l'exception du chef court du biceps fémoral). Les ischio-jambiers ont pour fonction principale la rétroversion du bassin — c'est ce mouvement qui est sollicité ici. Genoux légèrement fléchis = ischio-jambiers plus relâchés, mouvement plus facile. Jambes tendues = ischio-jambiers en étirement = plus de travail. Travaillé léger avec charges modérées, excellent préventif contre les déchirures musculaires." , movement:"neutral" },
  // ── Mollets ──
  "Mollets assis": { tier:"S",  primary:["Mollets"], secondary:[], desc:"Assis, genoux fléchis à 90°, avant des pieds sur une cale. Les genoux fléchis détendent les gastrocnémiens (qui s'attachent au-dessus de l'articulation du genou) — seul le soléaire (muscle profond, en dessous des gastrocnémiens) est alors sollicité significativement. Exercice indispensable et complémentaire aux mollets debout car le soléaire, souvent sous-entraîné, contribue de façon importante au volume global du mollet." , movement:"neutral" },
  "Mollets debout": { tier:"A",  primary:["Mollets"], secondary:[], desc:"Debout, avant des pieds sur une cale, extension complète du pied. Cible le triceps sural : les deux gastrocnémiens (chef médial et latéral) qui sont polyarticulaires (croisent le genou) et le soléaire en profondeur. Jambes tendues = gastrocnémiens en étirement maximum = stimulus optimal pour ces muscles. Il est important de réaliser une flexion complète à chaque répétition pour bien étirer les muscles. Le triceps sural est résistant à l'entraînement — ne pas hésiter à charger lourd en séries longues jusqu'à la brûlure." , movement:"neutral" },
  "Mollets presse": { tier:"A",  primary:["Mollets"], secondary:[], desc:"Sur la presse à cuisses, avant des pieds sur la plate-forme, extension des pieds. Sollicite le triceps sural avec l'avantage de décharger la colonne vertébrale — idéal pour les personnes souffrant du dos. Les gastrocnémiens sont bien étirés grâce à la flexion de hanche. Permet des charges importantes." , movement:"neutral" },
  // ── Abdominaux ──
  "Cable crunch": { tier:"S",  primary:["Abdominaux"], secondary:[], desc:"À genoux, câble avec barre ou corde, enroulement vertébral. En musculation, les exercices abdominaux doivent impérativement se réaliser dos rond (enroulement vertébral) — contrairement aux squats et soulevés de terre. La contraction rapproche le pubis du sternum par activation des droits de l'abdomen. Les obliques contribuent si on ajoute une rotation. Charge progressive possible — supérieur au crunch au sol. Ne jamais travailler lourd : se concentrer sur la sensation musculaire." , movement:"neutral" },
  "Ab wheel": { tier:"A",  primary:["Abdominaux"], secondary:[], desc:"Depuis les genoux, roulement de la roue en avant et retour. Engagement intense des droits de l'abdomen sur toute leur longueur, des obliques et des muscles spinaux en gainage. L'ilio-psoas, le droit de la cuisse et le tenseur du fascia lata participent lors du retour. Exercice de gainage dynamique — le dos ne doit jamais se creuser en fin d'extension." , movement:"neutral" },
  "Relevé de jambes suspendu": { tier:"A",  primary:["Abdominaux"], secondary:[], desc:"Suspendu à la barre, ramener les genoux vers la poitrine avec enroulement du rachis. Ilio-psoas, droit de la cuisse et tenseur du fascia lata lors du relevé des jambes ; droits de l'abdomen et obliques lors de l'enroulement. Importantes : maintenir les genoux légèrement groupés par contraction isométrique. Petites oscillations sans descendre les genoux sous l'horizontale = localisation maximale sur la sangle abdominale." , movement:"neutral" },
  "Crunch": { tier:"C",  primary:["Abdominaux"], secondary:[], desc:"Allongé, cuisses à la verticale, genoux fléchis, décoller les épaules du sol en enroulant le rachis. Sollicite principalement le droit de l'abdomen. Ajouter une rotation (coude droit vers genou gauche) = obliques plus intensément sollicités. Les mains derrière la tête ne doivent pas tirer sur la nuque. Coudes écartés = plus difficile. Contrairement aux squats, ici le dos DOIT être arrondi — c'est l'enroulement vertébral qui constitue le mouvement." , movement:"neutral" },
  "Planche": { tier:"C",  primary:["Abdominaux"], secondary:[], desc:"Gainage statique en appui sur les avant-bras. Sollicite les abdominaux, les obliques, les érecteurs du rachis et les fessiers en contraction isométrique. Le transverse de l'abdomen (muscle profond de contention des viscères) est fortement activé. Peu de stimulus d'hypertrophie dynamique — compléter avec des exercices en enroulement vertébral." , movement:"neutral" },
  "Russian twist": { tier:"C",  primary:["Abdominaux"], secondary:[], desc:"Assis, torse incliné, rotation du buste à droite et à gauche. Obliques externos et interno-abdominaux, droit de l'abdomen. La rotation du buste est à proscrire pour les personnes ayant des pathologies lombaires ou une hernie discale — les rotations vertébrales avec charge peuvent aggraver ces conditions." , movement:"neutral" },
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
  const grade = score === 100 ? "S" : score >= 93 ? "A+" : score >= 85 ? "A" : score >= 77 ? "B+" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F";
  const color = score === 100 ? "#B8860B" : score >= 77 ? C.green : score >= 50 ? C.orange : C.red;
  return { score, grade, color, issues };
}

function buildScoreSummary(weeklyVol, priorities, sessions, db, backToBack) {
  const totalSets = Object.values(weeklyVol).reduce((a,b) => a+b, 0);
  if (!totalSets) return null;

  const parts = [];

  // What's good
  const wellTrained = ALL_MUSCLES.filter(m => {
    const s = classifyVolume(weeklyVol[m] ?? 0);
    const p = priorities[m];
    return (p === "priority" && s === "bon") || (p === "priority" && s === "prio") || (p !== "priority" && s === "bon");
  });
  const prioOk = ALL_MUSCLES.filter(m => priorities[m] === "priority" && classifyVolume(weeklyVol[m]??0) === "bon");
  const covered = MAJOR_MUSCLES.filter(m => (weeklyVol[m]??0) > 0);

  if (prioOk.length) parts.push("✓ Priorités couvertes");
  else if (covered.length === MAJOR_MUSCLES.length) parts.push("✓ Tous les groupes majeurs travaillés");

  // Push/pull
  const { push: ps, pull: pl } = computePushPullSets(sessions, db);
  if (ps + pl > 0) {
    const ratio = pl / Math.max(ps, 1);
    if (ratio >= 0.9 && ratio <= 1.3) parts.push("✓ Équilibre push/pull optimal");
    else if (ratio >= 0.8) parts.push("✓ Bon équilibre push/pull");
  }

  // Back to back
  if (backToBack.length === 0 && sessions.length > 2) parts.push("✓ Récupération musculaire bien planifiée");

  // What's missing
  const absent = MAJOR_MUSCLES.filter(m => !(weeklyVol[m]??0));
  if (absent.length) parts.push(`⚠ Absent : ${absent.join(", ")}`);

  const prioLow = ALL_MUSCLES.filter(m => priorities[m] === "priority" && (classifyVolume(weeklyVol[m]??0) === "neutral" || classifyVolume(weeklyVol[m]??0) === "maintain"));
  if (prioLow.length) parts.push("⚠ Priorités sous-entraînées");

  return parts.slice(0, 3);
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
  const restDays  = week.filter(d => !d).length;

  const freq = Object.fromEntries(ALL_MUSCLES.map(m => [m, 0]));
  week.forEach(day => {
    if (!day) return;
    const seen = new Set();
    day.exercises.forEach(ex => {
      const d = db[ex.name]; if (!d) return;
      d.primary.forEach(m => { if (!seen.has(m)) { seen.add(m); freq[m]++; } });
    });
  });

  const freq2  = ALL_MUSCLES.filter(m => freq[m] >= 2);
  const absent = MAJOR_MUSCLES.filter(m => !weeklyVol[m] || weeklyVol[m] === 0);
  const prios  = ALL_MUSCLES.filter(m => priorities[m] === "priority");
  const { push: pushSets, pull: pullSets } = computePushPullSets(sessions, db);

  return { split, sessions: sessions.length, restDays, totalSets, freq2, absent, prios, pushSets, pullSets };
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

const VOL_COLOR = { neutral:C.textMuted, maintain:C.textMuted, bon:C.green, prio:C.red };
const VOL_LABEL = { neutral:"—", maintain:"MAINTIEN", bon:"BON", prio:"PRIO" };
const VOL_BG    = { neutral:"transparent", maintain:`${C.textMuted}25`, bon:`${C.green}20`, prio:`${C.red}20` };

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
  const [darkMode,       setDarkMode]       = useState(() => localStorage.getItem("workout-dark") === "1");
  const [zoom,           setZoom]           = useState(() => parseFloat(localStorage.getItem("workout-zoom") || "1"));
  const [dragSrc,        setDragSrc]        = useState(null); // {dayId, exIdx}
  const [dragOver,       setDragOver]       = useState(null); // {dayId, insertIdx}
  const [colorPickerId,  setColorPickerId]  = useState(null); // dayId
  const [renamingDay,    setRenamingDay]    = useState(null); // dayId
  const [renamingName,   setRenamingName]   = useState("");
  const [editingSets,    setEditingSets]    = useState(null); // {dayId, exId} — null = compact badge
  const [priosExpanded,  setPriosExpanded]  = useState(false);

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
  const scoreSummaryLines = buildScoreSummary(weeklyVol, priorities, sessions, db, backToBack);

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
    try {
      const s = JSON.parse(localStorage.getItem("workout-db") || "null");
      if (s) setDb(() => {
        // Per-exercise merge: localStorage custom fields override, but desc/tier from EXERCISE_DB fills in missing ones
        const merged = { ...EXERCISE_DB };
        Object.entries(s).forEach(([name, saved]) => {
          merged[name] = { ...merged[name], ...saved, desc: saved.desc || merged[name]?.desc };
        });
        return merged;
      });
    } catch (_) {}
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
    localStorage.setItem("workout-dark", darkMode ? "1" : "0");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("workout-zoom", zoom.toString());
  }, [zoom]);

  const ZOOM_STEPS = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2];
  const zoomIn  = () => setZoom(z => { const i = ZOOM_STEPS.indexOf(z); return ZOOM_STEPS[Math.min(i+1, ZOOM_STEPS.length-1)]; });
  const zoomOut = () => setZoom(z => { const i = ZOOM_STEPS.indexOf(z); return ZOOM_STEPS[Math.max(i-1, 0)]; });
  const zoomReset = () => setZoom(1);

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
  function addEx(dayId, exName, keepOpen = false) {
    updateDayExercises(dayId, exs => [...exs, { id:uid(), name:exName, sets:3 }]);
    if (!keepOpen) { setPickerSearch(""); closeModal(); }
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
    setDragSrc(null);
    setDragOver(null);
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
  }

  function onDropRestSlot(dayIndex) {
    if (!dragSrc) return;
    const { dayId:srcId, exIdx:srcIdx } = dragSrc;
    setDragSrc(null);
    setDragOver(null);
    let moved = null;
    updateWeek(w => {
      const step = w.map(slot => {
        if (slot?.id !== srcId) return slot;
        const exs = [...slot.exercises]; [moved] = exs.splice(srcIdx, 1);
        return {...slot, exercises: exs};
      });
      const updated = [...step];
      if (!updated[dayIndex]) {
        updated[dayIndex] = { id:uid(), name:DAY_LONG[dayIndex], exercises:[] };
      }
      updated[dayIndex] = { ...updated[dayIndex], exercises:[...updated[dayIndex].exercises, moved] };
      return updated;
    });
  }

  function setSessionColor(dayId, colorId) {
    updateWeek(w => w.map(slot => slot?.id !== dayId ? slot : { ...slot, color: colorId || null }));
    setColorPickerDay(null);
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
      <span style={{ fontSize:"0.6rem", fontWeight:800, padding:"2px 7px", borderRadius:20,
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
    const isFreq2    = summary?.freq2?.includes(muscle);

    return (
      <div style={{ marginBottom:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
          <span style={{ fontSize:"0.7rem", fontWeight:500, color:C.textSub, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:"0.8rem" }}>{MUSCLE_EMOJI[muscle]}</span>
            {muscle}
            {isFreq2 && (
              <span style={{ fontSize:"0.52rem", fontWeight:700, padding:"1px 5px", borderRadius:20,
                background:"#EFF6FF", color:"#1D4ED8", border:"1px solid #BFDBFE",
                letterSpacing:"0.2px" }}>×2</span>
            )}
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
        <div style={{ height:3, background:"rgba(0,0,0,0.06)", borderRadius:2, position:"relative" }}>
          <div style={{ position:"absolute", inset:0, width:`${fillPct}%`, height:4, borderRadius:2,
            background: MUSCLE_COLOR[muscle], opacity: status === "prio" ? 0.6 : 0.9,
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
      <div className={`app${darkMode ? " dark" : ""}`}>

        {/* ── TOPBAR ─────────────────────────────────────────────────── */}
        <header className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontWeight:800, fontSize:"1.05rem", letterSpacing:"-0.5px", color:C.text }}>
              Work<span style={{ color:C.accent }}>out</span>
            </span>
            <div style={{ width:1, height:18, background:C.border }} />
            <button className="prog-btn" onClick={() => setModal({ type:"progList" })}>
              {activeProgramName} <span style={{ color:C.accent, fontSize:"0.55rem", marginLeft:4 }}>▼</span>
            </button>
            <div className={`save-dot ${saveStatus}`} />
          </div>

          {/* Score + résumé — centre */}
          {sessions.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, justifyContent:"center", minWidth:0 }}>

              {/* Grade badge */}
              <div style={{ display:"flex", alignItems:"baseline", gap:4, flexShrink:0 }}>
                <span style={{ fontSize:"1.7rem", fontWeight:800, color:scoreData.color, lineHeight:1, letterSpacing:"-1.5px" }}>
                  {scoreData.grade}
                </span>
                <span style={{ fontSize:"0.65rem", color:"var(--text-muted)", fontWeight:600 }}>{scoreData.score}/100</span>
              </div>

              {/* Separator */}
              <div style={{ width:1, height:28, background:C.border, flexShrink:0 }} />

              {/* Summary chips */}
              {summary && (
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", minWidth:0 }}>
                  {/* Split + sessions */}
                  <div className="summary-chip summary-chip-main">
                    <span className="summary-chip-label">{summary.split}</span>
                    <span className="summary-chip-sep">·</span>
                    <span>{summary.sessions} séance{summary.sessions > 1 ? "s" : ""}</span>
                    <span className="summary-chip-sep">·</span>
                    <span>{summary.restDays}j repos</span>
                  </div>

                  {/* Volume */}
                  {summary.totalSets > 0 && (
                    <div className="summary-chip">
                      <span className="summary-chip-icon">📊</span>
                      <span>{summary.totalSets} sér/sem</span>
                    </div>
                  )}

                  {/* Push/pull ratio */}
                  {summary.pushSets + summary.pullSets > 0 && (
                    <div className="summary-chip">
                      <span className="summary-chip-icon">⚖️</span>
                      <span>{summary.pushSets}P / {summary.pullSets}T</span>
                    </div>
                  )}

                  {/* Fréquence 2x */}
                  {summary.freq2.length > 0 && (
                    <div className="summary-chip">
                      <span className="summary-chip-icon">🔁</span>
                      <span>2x : {summary.freq2.slice(0,3).join(", ")}{summary.freq2.length > 3 ? "…" : ""}</span>
                    </div>
                  )}

                  {/* Absent warning */}
                  {summary.absent.length > 0 && (
                    <div className="summary-chip summary-chip-warn">
                      <span>⚠ {summary.absent.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button className="hdr-ghost" onClick={() => setModal({ type:"library" })}>Bibliothèque</button>
            <button className="hdr-ghost" onClick={() => fileInputRef.current?.click()}>↑ Importer</button>
            <button className="hdr-solid" onClick={exportBackup}>↓ Exporter</button>
            {/* Zoom controls */}
            <div style={{ display:"flex", alignItems:"center", gap:1, background:"var(--sets-bg)",
              border:"1px solid var(--border)", borderRadius:8, padding:"2px", flexShrink:0 }}>
              <button className="zoom-btn" onClick={zoomOut} disabled={zoom <= ZOOM_STEPS[0]} title="Dézoomer">−</button>
              <button className="zoom-reset" onClick={zoomReset} title="Zoom 100%">
                {Math.round(zoom * 100)}%
              </button>
              <button className="zoom-btn" onClick={zoomIn} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length-1]} title="Zoomer">+</button>
            </div>

            <button className="theme-toggle" onClick={() => setDarkMode(d => !d)} title={darkMode ? "Mode clair" : "Mode sombre"}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display:"none" }} onChange={onFileSelected} />
          </div>
        </header>

        {/* ── MAIN ───────────────────────────────────────────────────── */}
        <div className="main" onClick={() => setColorPickerId(null)}>

          {/* ── WEEK BOARD ──────────────────────────────────────────── */}
          <div className="week-board" style={{ overflow:"auto" }}>
            <div style={{
              display:"flex", alignItems:"flex-start", gap:10,
              transform:`scale(${zoom})`,
              transformOrigin:"top left",
              width: zoom < 1 ? `${100/zoom}%` : "max-content",
              minHeight: zoom < 1 ? `${100/zoom}%` : undefined,
              padding: zoom !== 1 ? `${16/zoom}px` : 16,
              transition:"transform 0.15s ease",
            }}>
            {DAY_KEYS.map((key, idx) => {
              const session = week[idx];
              const isRest  = !session;

              if (isRest) {
                return (
                  <div key={key}
                    className={`rest-slot${dragSrc && dragOver?.dayId === key ? " rest-slot-drag-over" : ""}`}
                    onClick={() => addSessionToDay(idx)}
                    onDragOver={e => { e.preventDefault(); setDragOver({ dayId:key, insertIdx:0 }); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => { e.preventDefault(); onDropToRest(idx); }}>
                    <span className="rest-label">{DAY_LABELS[idx]}</span>
                    <span className="rest-icon">{dragSrc ? "⊕" : "+"}</span>
                    <span className="rest-text">{dragSrc ? "Déposer ici" : "Repos"}</span>
                  </div>
                );
              }

              // Session column
              const dayVol     = computeWeeklyVolume([session], db);
              const activeMuscles = ALL_MUSCLES.filter(m => dayVol[m] > 0);
              const isBackToBack  = idx > 0 && week[idx-1] !== null && backToBack.some(b =>
                b.dayALabel === DAY_LABELS[idx-1] && b.dayBLabel === DAY_LABELS[idx]
              );

              const sessionColor = SESSION_COLORS.find(c => c.id === session.color);
              const isDragTarget = dragOver?.dayId === session.id;

              return (
                <div key={key}
                  className={`session-col${isBackToBack ? " btb-warning" : ""}${isDragTarget ? " drag-target" : ""}`}
                  style={sessionColor ? { borderColor: sessionColor.border } : {}}
                  onDragOver={e => { e.preventDefault(); setDragOver({ dayId:session.id, exIdx:session.exercises.length }); }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                  onDrop={e => { e.preventDefault(); const idx = (dragOver && dragOver.dayId === session.id && dragOver.exIdx != null) ? dragOver.exIdx : session.exercises.length; onDrop(session.id, idx); }}>

                  {/* Color band */}
                  {sessionColor && (
                    <div style={{ height:5, background:sessionColor.bg, borderRadius:"8px 8px 0 0",
                      borderBottom:`1px solid ${sessionColor.border}40` }} />
                  )}

                  {/* Column header */}
                  <div className="col-header" style={{ position:"relative" }}>
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
                          background:MUSCLE_COLOR[m], display:"inline-block", boxShadow:"0 0 0 1px rgba(255,255,255,0.6)" }} />
                      ))}
                      {/* Color picker button */}
                      <button className="col-icon-btn" title="Couleur"
                        onClick={e => { e.stopPropagation(); setColorPickerId(colorPickerId === session.id ? null : session.id); }}
                        style={{ fontSize:"0.75rem", opacity: session.color ? 1 : 0.4 }}>🎨</button>
                      <button className="col-del-btn" onClick={() => removeSessionFromDay(session.id)} title="Supprimer">✕</button>
                    </div>

                    {/* Color picker popover */}
                    {colorPickerId === session.id && (
                      <div style={{ position:"absolute", top:"100%", right:0, zIndex:50,
                        background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10,
                        padding:8, display:"flex", gap:5, flexWrap:"wrap", width:160,
                        boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}
                        onClick={e => e.stopPropagation()}>
                        {SESSION_COLORS.map(c => (
                          <button key={c.id} title={c.label}
                            onClick={() => setSessionColor(session.id, c.id)}
                            style={{ width:22, height:22, borderRadius:6, border:`2px solid ${session.color===c.id ? c.border : "transparent"}`,
                              background:c.bg, cursor:"pointer", transition:"border 0.1s" }} />
                        ))}
                        <button title="Aucune couleur"
                          onClick={() => setSessionColor(session.id, null)}
                          style={{ width:22, height:22, borderRadius:6, border:`2px solid ${!session.color ? "#999" : "transparent"}`,
                            background:"#F3F4F6", cursor:"pointer", fontSize:"0.6rem", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                      </div>
                    )}
                  </div>

                  {isBackToBack && (
                    <div style={{ padding:"5px 14px", background:"#FFF7ED", borderBottom:"1px solid rgba(234,88,12,0.1)",
                      fontSize:"0.62rem", color:"#C2410C", fontWeight:600, letterSpacing:"-0.1px" }}>
                      ⚡ Muscles en J-J consécutifs
                    </div>
                  )}

                  {/* Exercise list */}
                  <div className="ex-list">
                    {session.exercises.map((ex, idx2) => {
                      const exData = db[ex.name];
                      const isDropTarget = dragOver?.dayId === session.id && dragOver?.exIdx === idx2;
                      return (
                        <div key={ex.id} style={{ position:"relative" }}>
                          {/* Drop indicator line */}
                          {isDropTarget && (
                            <div style={{ position:"absolute", top:0, left:8, right:8, height:2,
                              background:C.blue, borderRadius:1, zIndex:10 }} />
                          )}
                          <div className="ex-row"
                            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver({ dayId:session.id, exIdx:idx2 }); }}
                            onDrop={e => { e.stopPropagation(); onDrop(session.id, idx2); }}>

                          {/* Drag handle */}
                          <span className="drag-handle"
                            draggable
                            onDragStart={e => { e.stopPropagation(); setDragSrc({ dayId:session.id, exIdx:idx2 }); }}
                            onDragEnd={() => { setDragSrc(null); setDragOver(null); }}>
                            ⠿
                          </span>

                          {/* Index */}
                          <span className="ex-idx">{idx2+1}</span>

                          {/* Content */}
                          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:5 }}>

                            {/* Line 1 — name left · badges right */}
                            <div style={{ display:"flex", alignItems:"center", gap:5, minWidth:0 }}>
                              <span className="ex-name" onClick={() => setModal({ type:"exDetail", name:ex.name })}>
                                {ex.name}
                              </span>
                              <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0, marginLeft:"auto" }}>
                                <TierBadge tier={exData?.tier} />
                                {exData?.movement && exData.movement !== "neutral" && (
                                  <span style={{ fontSize:"0.56rem", fontWeight:800, padding:"2px 6px", borderRadius:20,
                                    background: exData.movement==="push"?"#FFF3EE":"#EFF6FF",
                                    color: exData.movement==="push"?"#C94209":"#1D4ED8",
                                    border: exData.movement==="push"?"1px solid #FDDDD0":"1px solid #BFDBFE",
                                    flexShrink:0 }}>
                                    {exData.movement === "push" ? "PSH" : "PLL"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Line 2 — muscles left · sets right */}
                            <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                              {/* Muscle pills */}
                              <div style={{ display:"flex", gap:3, flex:1, minWidth:0, flexWrap:"wrap" }}>
                                {exData?.primary.map(m => (
                                  <span key={m} style={{ fontSize:"0.68rem", fontWeight:700, padding:"2px 8px",
                                    borderRadius:20, background:MUSCLE_COLOR[m]+"18", color:MUSCLE_COLOR[m],
                                    whiteSpace:"nowrap", border:`1px solid ${MUSCLE_COLOR[m]}25` }}>{m}</span>
                                ))}
                                {exData?.secondary.map(m => (
                                  <span key={m} style={{ fontSize:"0.62rem", fontWeight:500, padding:"2px 7px",
                                    borderRadius:20, background:"transparent", color:"var(--text-muted)",
                                    whiteSpace:"nowrap", border:"1px dashed var(--border)" }}>{m} ½</span>
                                ))}
                              </div>

                              {/* Sets right + actions */}
                              <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                                {/* Actions — visible on row hover */}
                                <div style={{ display:"flex", gap:2 }}>
                                  <button className="ex-btn" title="Dupliquer"
                                    onClick={() => updateDayExercises(session.id, exs => [...exs, { id:uid(), name:ex.name, sets:ex.sets }])}>⊕</button>
                                  <button className="ex-btn" title="Remplacer"
                                    onClick={() => { setModal({ type:"replaceEx", dayId:session.id, exId:ex.id }); setPickerSearch(""); }}>⇄</button>
                                  <button className="ex-btn" title="Copier vers…"
                                    onClick={() => setModal({ type:"copyEx", ex, srcDayId:session.id })}>⧉</button>
                                  <button className="ex-btn del" title="Supprimer"
                                    onClick={() => deleteEx(session.id, ex.id)}>✕</button>
                                </div>
                                {/* Sets badge */}
                                {editingSets?.dayId === session.id && editingSets?.exId === ex.id ? (
                                  <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                                    <button className="sets-btn" onClick={() => setSets(session.id, ex.id, ex.sets-1)}>−</button>
                                    <input className="sets-input" type="number" min={MIN_SETS} max={MAX_SETS}
                                      value={ex.sets} autoFocus
                                      onChange={e => setSets(session.id, ex.id, e.target.value)}
                                      onWheel={e => { e.preventDefault(); setSets(session.id, ex.id, ex.sets + (e.deltaY < 0 ? 1 : -1)); }}
                                      onBlur={() => setEditingSets(null)}
                                      onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingSets(null); }} />
                                    <button className="sets-btn" onClick={() => setSets(session.id, ex.id, ex.sets+1)}>+</button>
                                  </div>
                                ) : (
                                  <button className="sets-badge" onClick={() => setEditingSets({ dayId:session.id, exId:ex.id })}>
                                    {ex.sets}<span style={{ fontWeight:500, opacity:0.6, fontSize:"0.7em", marginLeft:"1px", color:"var(--text-muted)" }}>sér</span>
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                        </div>
                      );
                    })}

                    {/* Insert line at end */}
                    {dragOver?.dayId === session.id && dragOver?.insertIdx >= session.exercises.length && (
                      <div style={{ height:3, background:C.accent, borderRadius:2, margin:"0 10px 2px", opacity:0.8 }} />
                    )}
                    <button className="add-ex-btn"
                      onClick={() => { setModal({ type:"addEx", dayId:session.id }); setPickerSearch(""); }}>
                      + Exercice
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* ── ANALYSIS PANEL ──────────────────────────────────────── */}
          <aside className="analysis-panel">

            {/* Score */}
            <div className="panel-block">
              <div className="panel-label">NOTE</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:6 }}>
                <span style={{ fontSize:"2.4rem", fontWeight:800, color:scoreData.color, lineHeight:1, letterSpacing:"-2px" }}>
                  {scoreData.grade}
                </span>
                <span style={{ fontSize:"0.88rem", fontWeight:700, color:scoreData.color }}>{scoreData.score}</span>
                <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>/100</span>
              </div>
              {scoreData.issues.length > 0 && (
                <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
                  {scoreData.issues.map((issue, i) => (
                    <div key={i} style={{ fontSize:"0.68rem", color:issue.severity==="high"?"#B91C1C":"#C2410C",
                      display:"flex", gap:4, alignItems:"flex-start" }}>
                      <span style={{ flexShrink:0 }}>{issue.icon}</span>
                      <span>{issue.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {scoreData.score > 0 && scoreSummaryLines?.length > 0 && (
                <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
                  {scoreSummaryLines.map((line, i) => {
                    const isGood = line.startsWith("✓");
                    const color = isGood ? C.green : C.orange;
                    const icon = line.slice(0, 1);
                    const rest = line.slice(2);
                    const colonIdx = rest.indexOf(" : ");
                    const label = colonIdx >= 0 ? rest.slice(0, colonIdx) : rest;
                    const value = colonIdx >= 0 ? rest.slice(colonIdx + 3) : null;
                    return (
                      <div key={i} style={{ fontSize:"0.68rem", color, fontWeight:600, display:"flex", gap:4, flexWrap:"nowrap" }}>
                        <span style={{ flexShrink:0 }}>{icon}</span>
                        <span style={{ flexShrink:0 }}>{label}{value ? " :" : ""}</span>
                        {value && <span style={{ fontWeight:500, flexShrink:1, minWidth:0 }}>{value}</span>}
                      </div>
                    );
                  })}
                </div>
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
                  { c:C.textMuted, l:"MAINTIEN — 1–5 séries" },
                  { c:C.green, l:"BON — 6–12 séries" },
                  { c:C.red, l:"PRIO — 13+ séries" },
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
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <div className="panel-label">PRIORITÉS</div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {hasCustomPrios && !priosExpanded && (
                    <button onClick={resetPrios} style={{ background:"none", border:"none", fontSize:"0.62rem",
                      color:"var(--text-muted)", cursor:"pointer", fontFamily:"inherit", padding:0 }}>Reset</button>
                  )}
                  <button onClick={() => setPriosExpanded(e => !e)} style={{
                    background:"none", border:"none", fontSize:"0.62rem", fontWeight:600,
                    color:"var(--accent)", cursor:"pointer", fontFamily:"inherit", padding:0 }}>
                    {priosExpanded ? "Fermer" : "Modifier"}
                  </button>
                </div>
              </div>

              {/* Collapsed view — show only active priorities */}
              {!priosExpanded && (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {(() => {
                    const prios    = ALL_MUSCLES.filter(m => priorities[m] === "priority");
                    const maintains = ALL_MUSCLES.filter(m => priorities[m] === "maintain");
                    if (!prios.length && !maintains.length) {
                      return (
                        <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontStyle:"italic" }}>
                          Aucune priorité définie — tout en équilibré
                        </div>
                      );
                    }
                    return (<>
                      {prios.length > 0 && (
                        <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                          <span style={{ fontSize:"0.72rem", flexShrink:0, marginTop:1 }}>🎯</span>
                          <div style={{ minWidth:0 }}>
                            <span style={{ fontSize:"0.62rem", fontWeight:700, color:"var(--accent)",
                              textTransform:"uppercase", letterSpacing:"0.5px" }}>Priorité</span>
                            <div style={{ fontSize:"0.74rem", fontWeight:600, color:"var(--text)", lineHeight:1.4, marginTop:2 }}>
                              {prios.map(m => `${MUSCLE_EMOJI[m]} ${m}`).join("  ·  ")}
                            </div>
                          </div>
                        </div>
                      )}
                      {maintains.length > 0 && (
                        <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                          <span style={{ fontSize:"0.72rem", flexShrink:0, marginTop:1 }}>🔒</span>
                          <div style={{ minWidth:0 }}>
                            <span style={{ fontSize:"0.62rem", fontWeight:700, color:"#1D4ED8",
                              textTransform:"uppercase", letterSpacing:"0.5px" }}>Maintien</span>
                            <div style={{ fontSize:"0.74rem", fontWeight:600, color:"var(--text)", lineHeight:1.4, marginTop:2 }}>
                              {maintains.map(m => `${MUSCLE_EMOJI[m]} ${m}`).join("  ·  ")}
                            </div>
                          </div>
                        </div>
                      )}
                    </>);
                  })()}
                </div>
              )}

              {/* Expanded view — full editor */}
              {priosExpanded && (
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {hasCustomPrios && (
                    <button onClick={resetPrios} style={{
                      alignSelf:"flex-end", background:"none", border:"1px solid var(--border)",
                      borderRadius:6, fontSize:"0.62rem", color:"var(--text-muted)", cursor:"pointer",
                      fontFamily:"inherit", padding:"2px 8px", marginBottom:2 }}>
                      Tout réinitialiser
                    </button>
                  )}
                  {ALL_MUSCLES.map(m => {
                    const cur = priorities[m];
                    return (
                      <div key={m} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:"0.8rem", width:18, flexShrink:0 }}>{MUSCLE_EMOJI[m]}</span>
                        <span style={{ fontSize:"0.72rem", fontWeight:500, color:"var(--text-sub)", flex:1, minWidth:0 }}>{m}</span>
                        <div style={{ display:"flex", gap:2, flexShrink:0 }}>
                          {PRIO_OPTS.map(opt => {
                            const active = cur === opt.value;
                            return (
                              <button key={opt.value} onClick={() => setMusclePrio(m, opt.value)} style={{
                                background: active ? opt.aBg : "transparent",
                                color:      active ? opt.aCl : "var(--text-faint)",
                                border:     `1px solid ${active ? opt.aBd : "var(--border)"}`,
                                borderRadius:6, padding:"2px 7px",
                                fontSize:"0.62rem", fontWeight: active ? 700 : 500,
                                cursor:"pointer", fontFamily:"inherit", transition:"all 0.1s", whiteSpace:"nowrap",
                              }}>{opt.label}</button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {modal && (
        <div className="overlay" onClick={closeModal}>

          {/* Exercise Picker */}
          {(modal.type === "addEx" || modal.type === "replaceEx") && (() => {
            const alreadyIn = modal.type === "addEx"
              ? new Set(week.find(s => s?.id === modal.dayId)?.exercises.map(e => e.name) ?? [])
              : new Set();
            const isReplace = modal.type === "replaceEx";
            return (
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">{isReplace ? "Remplacer l'exercice" : "Ajouter un exercice"}</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div style={{ padding:"10px 14px 6px", flexShrink:0, display:"flex", gap:8 }}>
                <input ref={pickerInputRef} className="picker-search" style={{ flex:1 }} placeholder="Rechercher..."
                  value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
                <button className="btn-save" style={{ flexShrink:0 }} onClick={() => { setPickerSearch(""); closeModal(); }}>Fermer</button>
              </div>
              <div style={{ overflowY:"auto", flex:1, background:C.surface }}>
                {!pickerSearch && smartPicker.length > 0 && (
                  <>
                    <div style={{ padding:"8px 14px 4px", fontSize:"0.58rem", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.8px", color:C.accent }}>
                      ✨ Recommandés pour votre programme
                    </div>
                    {smartPicker.map(name => {
                      const d = db[name];
                      const added = alreadyIn.has(name);
                      return (
                        <div key={`s-${name}`} className="picker-row" style={{ background:C.accentBg }}
                          onClick={() => isReplace ? replaceEx(modal.dayId, modal.exId, name) : addEx(modal.dayId, name, true)}>
                          <TierBadge tier={d?.tier} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:"0.83rem", fontWeight:600, color:C.text }}>{name}</div>
                            <div style={{ fontSize:"0.65rem", color:C.textMuted, marginTop:1 }}>
                              {d.primary.join(", ")}{d.secondary.length ? ` · ${d.secondary.join(", ")} ½` : ""}
                            </div>
                          </div>
                          {added && <span style={{ fontSize:"0.6rem", color:C.green, fontWeight:700, flexShrink:0 }}>✓</span>}
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
                    const added = alreadyIn.has(name);
                    return (
                      <div key={name} className="picker-row"
                        onClick={() => isReplace ? replaceEx(modal.dayId, modal.exId, name) : addEx(modal.dayId, name, true)}>
                        <TierBadge tier={d?.tier} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"0.83rem", fontWeight:600, color:C.text }}>{name}</div>
                          <div style={{ fontSize:"0.65rem", color:C.textMuted, marginTop:1 }}>
                            {d.primary.join(", ")}{d.secondary.length ? ` · ${d.secondary.join(", ")} ½` : ""}
                          </div>
                        </div>
                        {added && <span style={{ fontSize:"0.6rem", color:C.green, fontWeight:700, flexShrink:0 }}>✓</span>}
                      </div>
                    );
                  })
                }
              </div>
              {!isReplace && (
                <div style={{ padding:"10px 14px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
                  <button className="btn-full-accent" onClick={closeModal}>Terminer</button>
                </div>
              )}
            </div>
            );
          })()}

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
                          border:`1px solid ${t.color}40`, borderRadius:7, padding:"4px 10px" }}>
                          <span style={{ fontSize:"1rem", fontWeight:800, color:t.color }}>{d.tier}</span>
                          
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

                  {/* Movement badge */}
                  {d?.movement && d.movement !== "neutral" && (
                    <div style={{ display:"flex", gap:6 }}>
                      <span style={{ fontSize:"0.72rem", fontWeight:700, padding:"3px 10px", borderRadius:20,
                        background: d.movement==="push" ? "#FFEDD5" : "#DBEAFE",
                        color: d.movement==="push" ? "#EA580C" : "#1D4ED8",
                        border: `1.5px solid ${d.movement==="push" ? "#EA580C" : "#1D4ED8"}` }}>
                        {d.movement === "push" ? "Push" : "Pull"}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {desc ? (
                    <div style={{ fontSize:"0.84rem", color:C.textSub, lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                      {desc}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {d?.tier && TIER[d.tier] && (
                        <div style={{ background:TIER[d.tier].bg, borderRadius:8, padding:"10px 12px",
                          border:`1px solid ${TIER[d.tier].color}25` }}>
                          <div style={{ fontSize:"0.75rem", color:TIER[d.tier].color, lineHeight:1.6 }}>
                            {TIER[d.tier].label}
                          </div>
                        </div>
                      )}
                      <button disabled={exDescLoading} onClick={() => generateExDesc(name)} style={{
                        padding:"9px 16px", background: exDescLoading ? C.bg : C.accent,
                        color: exDescLoading ? C.textMuted : "#fff",
                        border:"none", borderRadius:8, cursor: exDescLoading ? "default" : "pointer",
                        fontFamily:"inherit", fontSize:"0.76rem", fontWeight:700,
                        display:"flex", alignItems:"center", gap:7,
                      }}>
                        {exDescLoading
                          ? <><span className="spinner" /> Génération...</>
                          : "✨ Générer la description"
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
                      background: active ? "#FFF3EE" : "#FFFFFF",
                      border:`1.5px solid ${active ? C.accent : "rgba(0,0,0,0.07)"}`,
                      boxShadow: active ? "0 0 0 3px rgba(232,80,10,0.08)" : "none",
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

          {/* Copy exercise to another day */}
          {modal.type === "copyEx" && (
            <div className="modal" style={{ width:380 }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">Copier vers…</span>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ fontSize:"0.75rem", color:C.textMuted, marginBottom:4 }}>
                  Copier <strong>{modal.ex?.name}</strong> dans :
                </div>
                {sessions.filter(s => s.id !== modal.srcDayId).map(s => (
                  <button key={s.id} onClick={() => { duplicateExToDay(modal.ex, s.id); closeModal(); }}
                    style={{ padding:"10px 14px", background:C.surface, border:`1.5px solid ${C.borderLight}`,
                      borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:"0.84rem",
                      fontWeight:600, color:C.text, textAlign:"left", transition:"all 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.background=C.accentBg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.borderLight; e.currentTarget.style.background=C.surface; }}>
                    {s.name}
                  </button>
                ))}
                {sessions.filter(s => s.id !== modal.srcDayId).length === 0 && (
                  <div style={{ fontSize:"0.78rem", color:C.textFaint, padding:"8px 0" }}>
                    Aucune autre séance dans ce programme.
                  </div>
                )}
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,400&display=swap');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }

  :root {
    --bg: #F1F1F4;
    --surface: #FFFFFF;
    --surface2: #FAFAFA;
    --border: rgba(0,0,0,0.08);
    --border-light: rgba(0,0,0,0.05);
    --text: #111111;
    --text-sub: #333333;
    --text-muted: #777777;
    --text-faint: #999999;
    --text-ghost: #BBBBBB;
    --accent: #E8500A;
    --accent-bg: #FFF3EE;
    --accent-dark: #C94209;
    --panel-bg: #FAFAFA;
    --row-hover: #FAFAFA;
    --sets-bg: #F4F4F5;
    --sets-border: #D0D0D3;
    --input-bg: #F7F7F8;
    --input-border: #EBEBED;
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03);
    --shadow-md: 0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04);
    --row-alt: rgba(0,0,0,0.016);
  }

  .dark {
    --bg: #0F0F11;
    --surface: #1A1A1D;
    --surface2: #131315;
    --border: rgba(255,255,255,0.10);
    --border-light: rgba(255,255,255,0.06);
    --text: #F0F0F3;
    --text-sub: #C0C0C8;
    --text-muted: #909098;
    --text-faint: #707078;
    --text-ghost: #55555F;
    --accent: #FF6B2B;
    --accent-bg: rgba(255,107,43,0.15);
    --accent-dark: #E8500A;
    --panel-bg: #131315;
    --row-hover: rgba(255,255,255,0.04);
    --sets-bg: rgba(255,255,255,0.08);
    --sets-border: rgba(255,255,255,0.12);
    --input-bg: rgba(255,255,255,0.06);
    --input-border: rgba(255,255,255,0.12);
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25);
    --shadow-md: 0 2px 8px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35);
    --row-alt: rgba(255,255,255,0.025);
  }

  html, body {
    height:100%;
    background:var(--bg);
    font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color:var(--text);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    transition:background 0.25s, color 0.25s;
  }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#D1D1D6; border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:#AEAEB2; }

  .app { display:flex; flex-direction:column; height:100dvh; }

  /* ─────────────────────────────────────────────
     TOPBAR
  ───────────────────────────────────────────── */

  .topbar {
    flex-shrink:0;
    height:52px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:0 20px;
    gap:12px;
    background:var(--surface);
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);
    position:relative;
    z-index:10;
  }

  .prog-btn {
    display:flex;
    align-items:center;
    gap:4px;
    padding:5px 10px;
    background:transparent;
    border:1px solid var(--border);
    border-radius:8px;
    cursor:pointer;
    font-family:inherit;
    font-size:0.78rem;
    font-weight:600;
    color:var(--text);
    max-width:180px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    transition:all 0.15s;
  }
  .prog-btn:hover { border-color:#E8500A; background:#FFF3EE; color:#E8500A; }

  .save-dot { width:6px; height:6px; border-radius:50%; background:#D1D1D6; flex-shrink:0; transition:background 0.4s; }
  .save-dot.saving { background:#F59E0B; }
  .save-dot.saved  { background:#22C55E; }
  .save-dot.error  { background:#EF4444; }

  .hdr-ghost {
    font-family:inherit;
    font-size:0.72rem;
    font-weight:500;
    padding:5px 12px;
    background:transparent;
    border:1px solid var(--border);
    border-radius:8px;
    color:#555;
    cursor:pointer;
    transition:all 0.15s;
    white-space:nowrap;
    letter-spacing:-0.1px;
  }
  .hdr-ghost:hover { border-color:var(--text); color:var(--text); background:var(--row-hover); }

  .hdr-solid {
    font-family:inherit;
    font-size:0.72rem;
    font-weight:600;
    padding:5px 14px;
    background:#E8500A;
    border:none;
    border-radius:8px;
    color:#FFFFFF;
    cursor:pointer;
    transition:all 0.15s;
    white-space:nowrap;
    letter-spacing:-0.1px;
    box-shadow:0 1px 3px rgba(232,80,10,0.3);
  }
  .hdr-solid:hover { background:#C94209; box-shadow:0 1px 4px rgba(232,80,10,0.4); }

  /* ─────────────────────────────────────────────
     LAYOUT
  ───────────────────────────────────────────── */

  .main { flex:1; min-height:0; display:grid; grid-template-columns:1fr 292px; overflow:hidden; }

  /* ─────────────────────────────────────────────
     WEEK BOARD
  ───────────────────────────────────────────── */

  .week-board {
    overflow:auto;
    background:var(--bg);
    flex:1;
    min-height:0;
  }

  /* ─────────────────────────────────────────────
     REST SLOT
  ───────────────────────────────────────────── */

  .rest-slot {
    flex-shrink:0;
    width:64px;
    min-height:120px;
    background:var(--surface);
    opacity:0.7;
    border:1.5px dashed var(--border);
    border-radius:12px;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:5px;
    cursor:pointer;
    transition:all 0.2s;
    align-self:stretch;
  }
  .rest-slot:hover {
    border-color:var(--accent);
    background:var(--accent-bg);
    opacity:1;
    transform:scale(1.01);
  }
  .rest-slot-drag-over {
    border-color:#E8500A !important;
    background:rgba(255,243,238,0.9) !important;
    transform:scale(1.02) !important;
    box-shadow:0 0 0 3px rgba(232,80,10,0.12) !important;
  }
  .rest-label { font-size:0.6rem; font-weight:700; color:var(--text-muted); letter-spacing:0.8px; text-transform:uppercase; }
  .rest-icon  { font-size:1.1rem; color:var(--text-faint); line-height:1; transition:color 0.2s; }
  .rest-text  { font-size:0.58rem; color:var(--text-faint); }
  .rest-slot:hover .rest-icon { color:var(--accent); }
  .rest-slot:hover .rest-text { color:var(--accent); }
  .rest-slot:hover .rest-label { color:var(--accent); }

  /* ─────────────────────────────────────────────
     SESSION COLUMN
  ───────────────────────────────────────────── */

  .session-col {
    flex-shrink:0;
    width:370px;
    background:var(--surface);
    border-radius:14px;
    border:1px solid var(--border);
    display:flex;
    flex-direction:column;
    box-shadow:var(--shadow-sm);
    align-self:flex-start;
    transition:box-shadow 0.2s, border-color 0.2s;
    overflow:hidden;
  }
  .session-col:hover {
    box-shadow:var(--shadow-md);
  }
  .session-col.drag-target {
    border-color:#E8500A;
    box-shadow:0 0 0 3px rgba(232,80,10,0.12), 0 4px 16px rgba(0,0,0,0.08);
  }
  .session-col.btb-warning { border-color:#FB923C; }

  .col-header {
    display:flex;
    align-items:center;
    gap:6px;
    padding:12px 14px 11px;
    border-bottom:1px solid var(--border-light);
    flex-shrink:0;
    min-height:50px;
  }

  .session-name {
    font-size:0.88rem;
    font-weight:700;
    color:var(--text);
    flex:1;
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor:pointer;
    letter-spacing:-0.2px;
    transition:color 0.1s;
  }
  .session-name:hover { color:#E8500A; }

  .rename-input {
    flex:1;
    background:transparent;
    border:none;
    border-bottom:2px solid var(--accent);
    font-family:inherit;
    font-size:0.88rem;
    font-weight:700;
    color:var(--text);
    outline:none;
    padding-bottom:1px;
    min-width:0;
    letter-spacing:-0.2px;
  }

  .col-icon-btn {
    background:none;
    border:none;
    cursor:pointer;
    padding:3px 4px;
    border-radius:6px;
    min-width:24px;
    min-height:24px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:all 0.15s;
    opacity:0;
    font-size:0.8rem;
  }
  .col-header:hover .col-icon-btn { opacity:0.5; }
  .col-icon-btn:hover { opacity:1 !important; background:var(--sets-bg); }

  .col-del-btn {
    background:none;
    border:none;
    color:var(--text-faint);
    font-size:0.65rem;
    cursor:pointer;
    padding:3px 4px;
    border-radius:6px;
    min-width:24px;
    min-height:24px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:all 0.15s;
    opacity:0;
  }
  .col-header:hover .col-del-btn { opacity:1; }
  .col-del-btn:hover { color:#EF4444; background:#FEF2F2; }

  /* ─────────────────────────────────────────────
     EXERCISE LIST & ROW
  ───────────────────────────────────────────── */

  .ex-list { display:flex; flex-direction:column; }

  .ex-row {
    display:flex;
    align-items:flex-start;
    gap:8px;
    padding:11px 14px 11px 10px;
    border-bottom:1px solid #D1D1D6;
    transition:background 0.12s;
    position:relative;
  }
  .dark .ex-row { border-bottom-color:#333338; }
  .ex-row:last-of-type { border-bottom:none; }
  .dark .ex-row:last-of-type { border-bottom:none; }
  .ex-row:nth-child(even) { background:var(--row-alt, rgba(0,0,0,0.015)); }
  .ex-row:hover { background:var(--row-hover) !important; }

  .drag-handle {
    font-size:0.85rem;
    color:var(--text-faint);
    cursor:grab;
    user-select:none;
    flex-shrink:0;
    padding:2px 1px;
    line-height:1;
    opacity:0;
    transition:opacity 0.15s, color 0.15s;
    margin-top:2px;
  }
  .ex-row:hover .drag-handle { opacity:1; }
  .drag-handle:hover { color:var(--text-muted); }
  .drag-handle:active { cursor:grabbing; }

  .ex-idx {
    font-size:0.68rem;
    font-weight:700;
    color:var(--text-muted);
    width:18px;
    height:18px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    margin-top:2px;
    font-variant-numeric:tabular-nums;
    background:var(--sets-bg);
    border-radius:5px;
  }

  .ex-name {
    font-size:0.86rem;
    font-weight:600;
    color:var(--text);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    flex:1;
    min-width:0;
    cursor:pointer;
    letter-spacing:-0.2px;
    transition:color 0.1s;
  }
  .ex-name:hover { color:var(--accent); }

  /* Sets badge (compact mode) */
  .sets-badge {
    font-family:inherit;
    font-size:0.82rem;
    font-weight:700;
    padding:4px 10px;
    background:var(--sets-bg, #F4F4F5);
    border:1.5px solid var(--sets-border, #D8D8DA);
    border-radius:20px;
    cursor:pointer;
    color:var(--text, #111);
    transition:all 0.12s;
    white-space:nowrap;
    flex-shrink:0;
    letter-spacing:-0.2px;
  }
  .sets-badge:hover {
    background:var(--accent-bg, #FFF3EE);
    border-color:var(--accent, #E8500A);
    color:var(--accent, #E8500A);
  }

  /* Sets controls */
  .sets-btn {
    width:24px;
    height:24px;
    background:var(--sets-bg);
    border:none;
    border-radius:6px;
    cursor:pointer;
    font-size:0.85rem;
    display:flex;
    align-items:center;
    justify-content:center;
    color:var(--text-muted);
    flex-shrink:0;
    transition:all 0.12s;
    font-weight:500;
  }
  .sets-btn:hover { background:var(--accent); color:#fff; }
  .sets-btn:active { transform:scale(0.92); }

  .sets-input {
    width:30px;
    height:24px;
    text-align:center;
    border:1px solid var(--input-border);
    border-radius:6px;
    font-family:inherit;
    font-size:0.86rem;
    font-weight:700;
    color:var(--text);
    background:var(--input-bg);
    outline:none;
    padding:0;
    -moz-appearance:textfield;
    transition:all 0.12s;
    font-variant-numeric:tabular-nums;
  }
  .sets-input:hover { border-color:var(--text-ghost); background:var(--sets-bg); }
  .sets-input:focus { border-color:var(--accent); background:var(--accent-bg); box-shadow:0 0 0 2px rgba(232,80,10,0.15); }
  .sets-input::-webkit-inner-spin-button, .sets-input::-webkit-outer-spin-button { -webkit-appearance:none; }

  .ex-btn {
    background:none;
    border:none;
    font-size:0.68rem;
    color:#C7C7CC;
    cursor:pointer;
    padding:3px 4px;
    border-radius:5px;
    min-width:20px;
    min-height:20px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:all 0.12s;
    opacity:0;
  }
  .ex-row:hover .ex-btn { opacity:1; }
  .ex-btn:focus { opacity:1; }
  .ex-btn:hover { background:#F4F4F5; color:#333; opacity:1; }
  .ex-btn.del:hover { background:#FEF2F2; color:#EF4444; }

  .add-ex-btn {
    display:flex;
    align-items:center;
    gap:7px;
    padding:11px 14px;
    font-family:inherit;
    font-size:0.78rem;
    font-weight:600;
    color:var(--text-muted);
    background:none;
    border:none;
    border-top:1px solid var(--border-light);
    cursor:pointer;
    width:100%;
    min-height:38px;
    transition:all 0.12s;
    letter-spacing:-0.1px;
  }
  .add-ex-btn:hover { color:var(--accent); background:var(--accent-bg); }

  /* ─────────────────────────────────────────────
     ANALYSIS PANEL
  ───────────────────────────────────────────── */

  .analysis-panel {
    border-left:1px solid var(--border);
    background:var(--panel-bg);
    overflow-y:auto;
    display:flex;
    flex-direction:column;
  }

  .panel-block {
    padding:14px 15px;
    border-bottom:1px solid var(--border-light);
  }
  .panel-block:last-child { border-bottom:none; }

  .panel-label {
    font-size:0.58rem;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:1.2px;
    color:var(--text-muted);
  }

  /* ─────────────────────────────────────────────
     SUMMARY CHIPS (topbar)
  ───────────────────────────────────────────── */

  .summary-chip {
    display:flex;
    align-items:center;
    gap:5px;
    padding:4px 10px;
    background:rgba(0,0,0,0.04);
    border-radius:20px;
    font-size:0.71rem;
    font-weight:500;
    color:var(--text-sub);
    white-space:nowrap;
    border:1px solid rgba(0,0,0,0.06);
    transition:all 0.1s;
  }
  .summary-chip-main {
    background:rgba(0,0,0,0.06);
    font-weight:600;
    color:#111;
    border-color:rgba(0,0,0,0.09);
  }
  .summary-chip-warn {
    background:rgba(232,80,10,0.08);
    color:#E8500A;
    border-color:rgba(232,80,10,0.15);
    font-weight:600;
  }
  .summary-chip-label { font-weight:700; color:#111; }
  .summary-chip-sep { color:#D1D1D6; font-weight:400; }
  .summary-chip-icon { font-size:0.7rem; }

  /* ─────────────────────────────────────────────
     MODALS
  ───────────────────────────────────────────── */

  .overlay {
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.35);
    backdrop-filter:blur(4px);
    -webkit-backdrop-filter:blur(4px);
    z-index:200;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    animation:fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .modal {
    background:var(--surface);
    border-radius:16px;
    width:480px;
    max-height:88vh;
    display:flex;
    flex-direction:column;
    box-shadow:0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    animation:slideUp 0.18s ease;
    border:1px solid var(--border);
  }

  .modal-handle {
    width:32px;
    height:3px;
    background:#E0E0E4;
    border-radius:2px;
    margin:10px auto 0;
    flex-shrink:0;
  }

  .modal-header {
    padding:14px 16px 12px;
    border-bottom:1px solid var(--border-light);
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-shrink:0;
  }

  .modal-title {
    font-size:0.95rem;
    font-weight:700;
    color:var(--text);
    letter-spacing:-0.3px;
  }

  .modal-close {
    background:var(--sets-bg);
    border:none;
    color:var(--text-muted);
    font-size:0.65rem;
    font-weight:700;
    cursor:pointer;
    width:22px;
    height:22px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:all 0.12s;
    flex-shrink:0;
  }
  .modal-close:hover { background:var(--input-border); color:var(--text); }

  .picker-search {
    width:100%;
    background:var(--input-bg);
    border:1px solid var(--input-border);
    border-radius:10px;
    padding:9px 13px;
    color:var(--text);
    font-family:inherit;
    font-size:0.86rem;
    outline:none;
    transition:all 0.15s;
  }
  .picker-search::placeholder { color:#AEAEB2; }
  .picker-search:focus {
    background:var(--surface);
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(232,80,10,0.1);
  }

  .picker-row {
    display:flex;
    align-items:center;
    gap:10px;
    padding:10px 14px;
    border-bottom:1px solid var(--border-light);
    cursor:pointer;
    min-height:50px;
    transition:background 0.1s;
  }
  .picker-row:last-child { border-bottom:none; }
  .picker-row:hover { background:var(--accent-bg); }

  .lib-row {
    display:flex;
    align-items:center;
    gap:10px;
    padding:10px 14px;
    border-bottom:1px solid var(--border-light);
    cursor:pointer;
    transition:background 0.1s;
  }
  .lib-row:hover { background:var(--accent-bg); }

  .modal-form {
    padding:16px;
    display:flex;
    flex-direction:column;
    gap:14px;
    overflow-y:auto;
  }

  .form-label {
    font-size:0.62rem;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:0.7px;
    color:#AEAEB2;
    margin-bottom:5px;
    display:block;
  }

  .form-input {
    width:100%;
    background:var(--input-bg);
    border:1px solid var(--input-border);
    border-radius:10px;
    padding:10px 13px;
    color:var(--text);
    font-family:inherit;
    font-size:0.9rem;
    outline:none;
    min-height:42px;
    transition:all 0.15s;
  }
  .form-input::placeholder { color:var(--text-ghost); }
  .form-input:focus {
    background:var(--surface);
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(232,80,10,0.1);
  }

  .form-select {
    width:100%;
    background:var(--input-bg);
    border:1px solid var(--input-border);
    border-radius:10px;
    padding:10px 13px;
    color:var(--text);
    font-family:inherit;
    font-size:0.9rem;
    outline:none;
    cursor:pointer;
    min-height:42px;
    transition:all 0.15s;
  }
  .form-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(232,80,10,0.1); }

  /* ─────────────────────────────────────────────
     BUTTONS
  ───────────────────────────────────────────── */

  .btn-cancel {
    background:var(--sets-bg);
    border:none;
    color:var(--text-muted);
    font-family:inherit;
    font-size:0.8rem;
    font-weight:600;
    padding:9px 16px;
    border-radius:10px;
    cursor:pointer;
    min-height:38px;
    transition:all 0.12s;
    letter-spacing:-0.1px;
  }
  .btn-cancel:hover { background:var(--input-border); color:var(--text); }

  .btn-save {
    background:#E8500A;
    border:none;
    color:#FFFFFF;
    font-family:inherit;
    font-size:0.8rem;
    font-weight:700;
    padding:9px 18px;
    border-radius:10px;
    cursor:pointer;
    min-height:38px;
    transition:all 0.12s;
    letter-spacing:-0.1px;
    box-shadow:0 1px 3px rgba(232,80,10,0.25);
  }
  .btn-save:hover { background:#C94209; box-shadow:0 2px 6px rgba(232,80,10,0.35); }

  .btn-full-accent {
    width:100%;
    font-family:inherit;
    font-size:0.85rem;
    font-weight:700;
    padding:12px;
    background:#E8500A;
    border:none;
    color:#FFFFFF;
    border-radius:10px;
    cursor:pointer;
    min-height:44px;
    transition:all 0.12s;
    letter-spacing:-0.1px;
    box-shadow:0 1px 3px rgba(232,80,10,0.25);
  }
  .btn-full-accent:hover { background:#C94209; box-shadow:0 2px 6px rgba(232,80,10,0.35); }

  .btn-icon-sm {
    background:#F4F4F5;
    border:none;
    color:#777;
    font-size:0.8rem;
    cursor:pointer;
    padding:4px 8px;
    border-radius:7px;
    min-width:28px;
    min-height:28px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:all 0.12s;
  }
  .btn-icon-sm:hover { background:#E8500A; color:#fff; }
  .btn-icon-sm.del:hover { background:#FEF2F2; color:#EF4444; }

  /* ─────────────────────────────────────────────
     MISC
  ───────────────────────────────────────────── */

  /* Zoom controls */
  .zoom-btn {
    background:none;
    border:none;
    cursor:pointer;
    width:26px;
    height:26px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:1rem;
    font-weight:600;
    color:var(--text-muted);
    border-radius:6px;
    transition:all 0.12s;
    font-family:inherit;
  }
  .zoom-btn:hover:not(:disabled) { background:var(--surface); color:var(--text); }
  .zoom-btn:disabled { opacity:0.3; cursor:default; }
  .zoom-reset {
    background:none;
    border:none;
    cursor:pointer;
    padding:0 6px;
    height:26px;
    font-family:inherit;
    font-size:0.7rem;
    font-weight:700;
    color:var(--text-sub);
    min-width:36px;
    text-align:center;
    border-radius:4px;
    transition:all 0.12s;
  }
  .zoom-reset:hover { background:var(--surface); color:var(--accent); }

  /* Theme toggle */
  .theme-toggle {
    background:none;
    border:1px solid var(--border, rgba(0,0,0,0.08));
    border-radius:8px;
    cursor:pointer;
    width:32px;
    height:32px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:0.9rem;
    transition:all 0.15s;
    flex-shrink:0;
  }
  .theme-toggle:hover { background:var(--bg, #F1F1F4); }

  .spinner {
    width:13px; height:13px;
    border:2px solid rgba(255,255,255,0.3);
    border-top-color:#fff;
    border-radius:50%;
    animation:spin 0.7s linear infinite;
    display:inline-block;
  }
  @keyframes spin { to { transform:rotate(360deg); } }
`;
