/**
 * rulesData.js
 * ============
 * Veterinary Expert System Multi-Species Knowledge Base for the Web App.
 * Grounded in:
 * - Tier 1: Animal Condition Classification Dataset (Kaggle)
 * - Tier 2: Disease-Symptom-Description Dataset (Kaggle)
 * - Tier 3: VCA Animal Hospitals, AKC Health, iCatCare, ASPCA, Merck Veterinary Manual
 */

export const SUPPORTED_ANIMALS = [
  { id: "dog", name: "Dog", icon: "🐕", species: "Canine" },
  { id: "cat", name: "Cat", icon: "🐈", species: "Feline" },
  { id: "horse", name: "Horse", icon: "🐎", species: "Equine" },
  { id: "rabbit", name: "Rabbit", icon: "🐇", species: "Lagomorph" },
  { id: "bird", name: "Bird", icon: "🦜", species: "Avian" },
  { id: "cattle", name: "Cattle / Cow", icon: "🐄", species: "Bovine" },
  { id: "sheep", name: "Sheep / Goat", icon: "🐑", species: "Ovine/Caprine" }
];

export const VET_RULES = [
  {
    id: "R1",
    name: "Canine Infectious Tracheobronchitis (Kennel Cough)",
    pet_type: "dog",
    animal_name: "Dog",
    conditions: ["fever", "coughing", "lethargy"],
    conclusion: "Kennel Cough",
    derived_fact: "suspect = Kennel Cough",
    confidence: 0.72,
    severity: "Mild to Moderate",
    dangerous: "No",
    data_source: "AKC Health & VCA Animal Hospitals",
    explanation: "Dry persistent hacking cough accompanied by mild fever and lethargy is classic for infectious tracheobronchitis, commonly contracted after exposure to group facilities.",
    supportive_signs: ["nasal_discharge", "loss_of_appetite"],
    precautions: [
      "Isolate from other canines to prevent contagious transmission",
      "Switch from neck collar to harness to avoid tracheal pressure",
      "Provide humidified air via warm bathroom steam sessions",
      "Monitor hydration and rest closely"
    ],
    recommended_actions: [
      "Schedule a non-emergency veterinary checkup for cough suppressants",
      "Maintain strict 14-day quarantine from dog parks and daycares",
      "Ensure fresh water is continuously available"
    ],
    question_map: {
      fever: "Does your dog feel unusually warm or have an elevated temperature?",
      coughing: "Has your dog had a persistent dry, hacking, or honking cough?",
      lethargy: "Is your dog unusually sluggish, sleepy, or unwilling to play?"
    }
  },
  {
    id: "R2",
    name: "Canine Parvoviral Enteritis",
    pet_type: "dog",
    animal_name: "Dog",
    conditions: ["vomiting", "bloody_diarrhea", "lethargy", "unvaccinated"],
    conclusion: "Canine Parvovirus",
    derived_fact: "suspect = Parvovirus",
    confidence: 0.90,
    severity: "Critical - Emergency",
    dangerous: "Yes",
    data_source: "Animal Condition Classification Dataset (Kaggle) & ASPCA Pet Care",
    explanation: "Acute severe projectile vomiting, foul bloody diarrhea, marked depression, and lack of core vaccination strongly indicate canine parvoviral enteritis.",
    supportive_signs: ["fever", "dehydration", "loss_of_appetite", "abdominal_pain"],
    precautions: [
      "RED ALERT: Transport to emergency veterinary hospital immediately",
      "Do not attempt home oral remedies or force-feeding",
      "Bleach home surfaces (1:32 dilution) to eliminate resilient viral particles",
      "Keep patient warm during immediate transit"
    ],
    recommended_actions: [
      "Immediate ICU hospitalization for IV fluid resuscitation and antiemetics",
      "Isolate from all other unvaccinated animals immediately",
      "Complete blood count and Parvo SNAP antigen testing"
    ],
    question_map: {
      vomiting: "Is your dog vomiting repeatedly or bringing up fluids?",
      bloody_diarrhea: "Does your dog have severe, liquid, or foul bloody diarrhea?",
      lethargy: "Is your dog in a state of severe weakness or collapse?",
      unvaccinated: "Is your dog a puppy or overdue for core DHPP/Parvo vaccines?"
    }
  },
  {
    id: "R3",
    name: "Flea Allergy Dermatitis (FAD)",
    pet_type: "both",
    animal_name: "Dog/Cat",
    conditions: ["excessive_scratching", "hair_loss", "red_skin"],
    conclusion: "Flea Allergy Dermatitis",
    derived_fact: "suspect = Flea Allergy Dermatitis",
    confidence: 0.78,
    severity: "Mild to Moderate",
    dangerous: "No",
    data_source: "Disease-Symptom-Description Dataset (Kaggle) & VCA Health",
    explanation: "Pruritic response triggered by flea saliva antigens, causing alopecia, erythema, and intense chewing predominantly around the tail-base, thighs, and groin.",
    supportive_signs: ["flea_dirt", "scabs", "skin_chewing"],
    precautions: [
      "Apply veterinarian-approved isoxazoline or topical flea adulticide",
      "Wash pet bedding in hot water cycle (>60°C)",
      "Vacuum all carpets, rugs, and upholstered furniture thoroughly"
    ],
    recommended_actions: [
      "Consult vet for prescription antipruritic medication if skin is raw",
      "Administer soothing colloidal oatmeal bath"
    ],
    question_map: {
      excessive_scratching: "Is your pet biting, scratching, or chewing at their fur?",
      hair_loss: "Have you noticed bald patches or thinning fur on their coat?",
      red_skin: "Is the underlying skin red, inflamed, or hot to the touch?"
    }
  },
  {
    id: "R4",
    name: "Acute Musculoskeletal Strain or Joint Sprain",
    pet_type: "both",
    animal_name: "Dog/Cat/Horse",
    conditions: ["limping", "swelling", "recent_activity"],
    conclusion: "Musculoskeletal Strain / Sprain",
    derived_fact: "suspect = Strain or Sprain",
    confidence: 0.68,
    severity: "Moderate",
    dangerous: "No",
    data_source: "VCA Animal Hospitals & AKC Orthopedic Guidelines",
    explanation: "Sudden onset weight-bearing lameness with localized swelling following vigorous exercise or trauma points to an acute ligament or muscle injury.",
    supportive_signs: ["pain_on_palpation", "reluctance_to_jump", "whining"],
    precautions: [
      "Strict cage/stall rest; restrict running, jumping, stairs, and rough play",
      "Do NOT administer human NSAIDs (Ibuprofen, Acetaminophen/Paracetamol are toxic to pets)",
      "Apply cool compress wrapped in cloth for 10-15 minutes if swelling is acute"
    ],
    recommended_actions: [
      "Veterinary orthopedic palpation and X-rays if non-weight bearing persists >24 hours"
    ],
    question_map: {
      limping: "Is your pet limping or favoring one leg?",
      swelling: "Do you see or feel localized swelling around any joint or limb?",
      recent_activity: "Did your pet engage in strenuous running, jumping, or traumatic impact?"
    }
  },
  {
    id: "R5",
    name: "Kennel Cough Secondary Rhinitis Complication",
    pet_type: "dog",
    animal_name: "Dog",
    conditions: ["suspect = Kennel Cough", "nasal_discharge"],
    conclusion: "Complicated Kennel Cough with Secondary Rhinitis",
    derived_fact: "severity = Moderate to High - Vet Therapy Indicated",
    confidence: 0.86,
    severity: "Moderate to High",
    dangerous: "No",
    data_source: "AKC Health Articles & JVIM Respiratory Standards",
    explanation: "Multi-hop chained deduction: development of purulent nasal discharge in a patient with Kennel Cough indicates secondary bacterial infection of the upper airway.",
    supportive_signs: ["productive_cough", "loss_of_appetite"],
    precautions: [
      "Keep dog in warm, humidified area",
      "Clean nasal secretions with warm damp cloth",
      "Avoid smoke, dust, and aerosol irritants"
    ],
    recommended_actions: [
      "Veterinary appointment for targeted antimicrobial and mucolytic prescription"
    ],
    question_map: {
      "suspect = Kennel Cough": "Has your dog been assessed with symptoms matching Kennel Cough?",
      nasal_discharge: "Is your dog having colored or cloudy mucus discharge from the nose?"
    }
  },
  {
    id: "R6",
    name: "Canine Influenza Virus (CIV)",
    pet_type: "dog",
    animal_name: "Dog",
    conditions: ["fever", "coughing", "nasal_discharge", "loss_of_appetite"],
    conclusion: "Canine Influenza",
    derived_fact: "suspect = Canine Influenza",
    confidence: 0.82,
    severity: "Moderate to High",
    dangerous: "Yes",
    data_source: "Animal Condition Classification Dataset (Kaggle) & CDC CIV",
    explanation: "High fever, productive cough, persistent nasal discharge, and anorexia distinguish Canine Influenza from uncomplicated tracheobronchitis.",
    supportive_signs: ["lethargy", "eye_discharge", "sneezing"],
    precautions: [
      "Quarantine from other dogs for a minimum of 21-28 days",
      "Maintain adequate hydration with broths or warmed wet food",
      "Monitor respiratory rate while resting"
    ],
    recommended_actions: [
      "Veterinary examination and PCR testing for influenza strains H3N8/H3N2"
    ],
    question_map: {
      fever: "Does your dog have a significant fever?",
      coughing: "Is your dog experiencing deep, wet coughing?",
      nasal_discharge: "Is there thick nasal discharge?",
      loss_of_appetite: "Has your dog stopped eating or lost interest in food?"
    }
  },
  {
    id: "R7",
    name: "Feline Lower Urinary Tract Disease (FLUTD)",
    pet_type: "cat",
    animal_name: "Cat",
    conditions: ["straining_to_urinate", "frequent_litter_box_visits", "crying_in_litter_box"],
    conclusion: "Feline Lower Urinary Tract Disease (FLUTD)",
    derived_fact: "suspect = FLUTD",
    confidence: 0.92,
    severity: "Emergency in Male Cats",
    dangerous: "Yes",
    data_source: "International Cat Care (iCatCare) & VCA Health",
    explanation: "Straining in the litter box, pain vocalizations during elimination, and frequent unproductive urination attempts signal severe cystitis, bladder stones, or urethral blockage.",
    supportive_signs: ["blood_in_urine", "excessive_genital_licking", "urinating_outside_box"],
    precautions: [
      "CRITICAL: If a male cat is unable to pass urine, this is a fatal obstruction requiring ER care",
      "Transition immediately to all-wet high moisture canned food",
      "Place multiple wide litter boxes in calm, quiet locations"
    ],
    recommended_actions: [
      "Immediate veterinary emergency evaluation for urethral palpation and urinalysis"
    ],
    question_map: {
      straining_to_urinate: "Is your cat squatting and straining with little or no urine coming out?",
      frequent_litter_box_visits: "Does your cat repeatedly run to the litter box every few minutes?",
      crying_in_litter_box: "Is your cat meowing, yowling, or groaning while attempting to pee?"
    }
  },
  {
    id: "R8",
    name: "Feline Upper Respiratory Infection (Cat Flu / FHV-1)",
    pet_type: "cat",
    animal_name: "Cat",
    conditions: ["sneezing", "eye_discharge", "nasal_discharge", "lethargy"],
    conclusion: "Feline Upper Respiratory Infection (Cat Flu)",
    derived_fact: "suspect = Feline URI",
    confidence: 0.85,
    severity: "Moderate to Serious in Kittens",
    dangerous: "No",
    data_source: "International Cat Care (iCatCare) & ASPCA",
    explanation: "Sneezing clusters with conjunctival ocular discharge, nasal congestion, and malaise indicate feline viral rhinotracheitis (FHV-1) or calicivirus.",
    supportive_signs: ["fever", "loss_of_appetite", "squinting"],
    precautions: [
      "Warm food to enhance olfactory aroma (cats will not eat if they cannot smell food)",
      "Wipe eyes and nose with warm saline moistened pads",
      "Provide steamy bathroom sessions to clear airway secretions"
    ],
    recommended_actions: [
      "Vet visit for ophthalmic medication and antiviral/antibiotic evaluation"
    ],
    question_map: {
      sneezing: "Is your cat sneezing recurrently?",
      eye_discharge: "Are your cat's eyes teary, red, or crusty?",
      nasal_discharge: "Is there mucus coming from your cat's nose?",
      lethargy: "Is your cat unusually inactive and tired?"
    }
  },
  {
    id: "R9",
    name: "Acute Gastrointestinal Indiscretion",
    pet_type: "both",
    animal_name: "Dog/Cat",
    conditions: ["vomiting", "diarrhea", "eating_foreign_object"],
    conclusion: "Acute Gastroenteritis (Dietary Indiscretion)",
    derived_fact: "suspect = Acute Gastroenteritis",
    confidence: 0.80,
    severity: "Moderate",
    dangerous: "No",
    data_source: "Disease-Symptom-Description Dataset (Kaggle) & VCA Health",
    explanation: "Sudden onset emesis and liquid stools following ingestion of trash, foreign materials, or unaccustomed table foods indicate acute gastrointestinal mucosal irritation.",
    supportive_signs: ["abdominal_gurgling", "lethargy", "drooling"],
    precautions: [
      "Offer small, frequent sips of fresh water",
      "Feed a bland diet (boiled plain chicken breast and white rice) in small portions",
      "Seek urgent care if vomiting becomes intractable or unyielding"
    ],
    recommended_actions: [
      "Veterinary consultation if symptoms persist longer than 24-36 hours"
    ],
    question_map: {
      vomiting: "Has your pet vomited food or bile?",
      diarrhea: "Does your pet have frequent liquid or loose stools?",
      eating_foreign_object: "Did your pet eat table scraps, garbage, toxic plants, or chew foreign objects?"
    }
  },
  {
    id: "R10",
    name: "Equine Colic Syndrome (Abdominal Crisis)",
    pet_type: "horse",
    animal_name: "Horse",
    conditions: ["pawing_ground", "looking_at_flank", "rolling_frequently", "loss_of_appetite"],
    conclusion: "Equine Colic (Gastrointestinal Emergency)",
    derived_fact: "suspect = Equine Colic",
    confidence: 0.94,
    severity: "CRITICAL EMERGENCY",
    dangerous: "Yes",
    data_source: "Animal Condition Classification Dataset (Kaggle) & VCA Equine",
    explanation: "Pawing the ground, repeatedly turning head toward flank, violent rolling, and complete feed refusal indicate acute equine intestinal obstruction, impaction, or torsion.",
    supportive_signs: ["sweating", "absence_of_gut_sounds", "elevated_heart_rate"],
    precautions: [
      "RED ALERT: Contact equine veterinarian immediately for emergency farm call",
      "Withhold all grain and hay immediately",
      "Walk the horse gently if safe to do so to prevent violent injury from rolling",
      "Do NOT administer tranquilizers or banamine without vet authorization"
    ],
    recommended_actions: [
      "Emergency veterinary nasogastric tube decompression and rectal examination"
    ],
    question_map: {
      pawing_ground: "Is your horse pawing at the ground repeatedly?",
      looking_at_flank: "Is your horse turning its head and biting or staring at its flank/belly?",
      rolling_frequently: "Is the horse repeatedly trying to lie down and roll violently?",
      loss_of_appetite: "Has the horse completely refused grain or hay?"
    }
  },
  {
    id: "R11",
    name: "Rabbit Gastrointestinal Stasis (GI Stasis)",
    pet_type: "rabbit",
    animal_name: "Rabbit",
    conditions: ["loss_of_appetite", "no_fecal_pellets", "hunched_posture", "lethargy"],
    conclusion: "Rabbit Gastrointestinal Stasis",
    derived_fact: "suspect = Rabbit GI Stasis",
    confidence: 0.92,
    severity: "CRITICAL EMERGENCY",
    dangerous: "Yes",
    data_source: "VCA Health & Exotic Companion Pet Medicine",
    explanation: "Cessation of eating, absence of fecal pellet output for >8 hours, painful hunched posture, and tooth grinding indicate life-threatening rabbit gut slowdown.",
    supportive_signs: ["teeth_grinding_pain", "cold_ears", "bloated_belly"],
    precautions: [
      "EMERGENCY: Rabbits can deteriorate rapidly within 12-24 hours of gut stasis",
      "Keep rabbit warm with towels or a gentle heating pad",
      "Do NOT fast rabbits; seek exotic veterinary care immediately"
    ],
    recommended_actions: [
      "Immediate veterinary intervention with motility agents, pain relief, and fluid therapy"
    ],
    question_map: {
      loss_of_appetite: "Has your rabbit stopped eating hay or favorite greens?",
      no_fecal_pellets: "Has your rabbit produced zero or abnormally tiny fecal pellets in the last 8-12 hours?",
      hunched_posture: "Is the rabbit sitting hunched in a tight ball with belly pressed to floor?",
      lethargy: "Is your rabbit unusually unresponsive and reluctant to hop?"
    }
  },
  {
    id: "R12",
    name: "Avian Respiratory Distress & Air Sac Infection",
    pet_type: "bird",
    animal_name: "Bird",
    conditions: ["tail_bobbing", "open_mouth_breathing", "fluffed_feathers", "lethargy"],
    conclusion: "Avian Respiratory Infection / Air Sacculitis",
    derived_fact: "suspect = Avian Respiratory Infection",
    confidence: 0.90,
    severity: "CRITICAL EMERGENCY",
    dangerous: "Yes",
    data_source: "Animal Condition Classification Dataset (Kaggle) & Avian Vet Library",
    explanation: "Rhythmic tail bobbing with each breath, open-beak respiration, and permanently fluffed feathers indicate acute avian dyspnea or air sac infection.",
    supportive_signs: ["sitting_on_cage_bottom", "nasal_crusts", "voice_change"],
    precautions: [
      "Transport in a warm (28-30°C), dark, well-ventilated carrier without drafts",
      "Avoid handling or stressing the bird (fragile avian respiratory compensation)",
      "Strictly avoid aerosol sprays, non-stick Teflon fumes, or candles"
    ],
    recommended_actions: [
      "Rush to an avian veterinary emergency specialist for oxygen therapy"
    ],
    question_map: {
      tail_bobbing: "Is your bird's tail bobbing up and down distinctly with each breath?",
      open_mouth_breathing: "Is your bird breathing with its beak open or clicking?",
      fluffed_feathers: "Is the bird sitting puffed up with closed eyes during daytime?",
      lethargy: "Is your bird sitting at the bottom of the cage instead of perching?"
    }
  },
  {
    id: "R13",
    name: "Bovine Acute Mastitis / Udder Inflammation",
    pet_type: "cattle",
    animal_name: "Cattle",
    conditions: ["swollen_udder", "abnormal_milk_clots", "fever", "lethargy"],
    conclusion: "Bovine Acute Clinical Mastitis",
    derived_fact: "suspect = Bovine Mastitis",
    confidence: 0.91,
    severity: "High - Urgent Vet Treatment Required",
    dangerous: "Yes",
    data_source: "Animal Condition Classification Dataset (Kaggle) & Merck Veterinary Manual",
    explanation: "Hot, firm, swollen quarter udder accompanied by watery or clotted milk secretions and systemic fever indicates acute coliform or staphylococcal mastitis.",
    supportive_signs: ["reduced_milk_yield", "loss_of_appetite", "reluctance_to_walk"],
    precautions: [
      "Isolate milk from bulk tank immediately",
      "Strip affected quarter frequently to remove toxic bacterial accumulation",
      "Provide clean dry bedding and ample fresh water"
    ],
    recommended_actions: [
      "Veterinary intramammary infusion, systemic antimicrobial, and anti-inflammatory therapy"
    ],
    question_map: {
      swollen_udder: "Is the cow's udder or quarter swollen, hard, hot, or painful to touch?",
      abnormal_milk_clots: "Is the milk watery, bloody, discolored, or showing flakes/clots?",
      fever: "Does the animal have an elevated body temperature?",
      lethargy: "Is the cow dull, slow to rise, or lagging behind the herd?"
    }
  },
  {
    id: "R14",
    name: "Bovine / Ovine Acute Ruminal Tympany (Bloat)",
    pet_type: "cattle",
    animal_name: "Cattle/Sheep",
    conditions: ["distended_left_flank", "frequent_defecation_attempts", "labored_breathing"],
    conclusion: "Acute Ruminal Tympany (Rumen Bloat)",
    derived_fact: "suspect = Rumen Bloat",
    confidence: 0.94,
    severity: "CRITICAL EMERGENCY",
    dangerous: "Yes",
    data_source: "Animal Condition Classification Dataset (Kaggle) & WSAVA",
    explanation: "Pronounced distention of the left paralumbar fossa, respiratory distress, and grunting indicate life-threatening rumen gas entrapment.",
    supportive_signs: ["extended_neck", "drooling", "frequent_kicking_belly"],
    precautions: [
      "EMERGENCY: Contact herd veterinarian immediately; severe cases require trocarization",
      "Remove herd from lush legume pastures immediately",
      "Keep animal standing and moving calmly"
    ],
    recommended_actions: [
      "Immediate stomach tube passage or antifoaming drench administration"
    ],
    question_map: {
      distended_left_flank: "Is the left side of the animal's belly (left flank) distinctly swollen and drum-tight?",
      frequent_defecation_attempts: "Is the animal straining repeatedly or shifting weight anxiously?",
      labored_breathing: "Is the animal breathing heavily with mouth open and neck stretched out?"
    }
  },
  {
    id: "R15",
    name: "Ovine Contagious Footrot",
    pet_type: "sheep",
    animal_name: "Sheep",
    conditions: ["severe_lameness", "foul_foot_odor", "hoof_separation"],
    conclusion: "Ovine Contagious Footrot",
    derived_fact: "suspect = Ovine Footrot",
    confidence: 0.88,
    severity: "Moderate to High Contagion",
    dangerous: "No",
    data_source: "Merck Veterinary Manual & Kaggle Animal Disease Dataset",
    explanation: "Severe grazing on knees lameness, moist necrotizing interdigital dermatitis, and separation of the hoof horn characterize Dichelobacter nodosus footrot.",
    supportive_signs: ["weight_loss", "grazing_on_carpi"],
    precautions: [
      "Separate lame sheep from clean flock to prevent pasture contamination",
      "Run flock through zinc sulfate (10%) footbath",
      "Trim necrotic hoof horn carefully"
    ],
    recommended_actions: [
      "Veterinary systemic antibiotic therapy and flock-wide vaccination/eradication program"
    ],
    question_map: {
      severe_lameness: "Is the sheep limping heavily, holding up a hoof, or grazing on its knees?",
      foul_foot_odor: "Is there a strong, foul, rotting odor coming from the interdigital claw?",
      hoof_separation: "Is the hard outer hoof horn lifting or separating from the sensitive foot tissue?"
    }
  }
];

export const ALL_SYMPTOMS = [
  // Respiratory
  { id: "coughing", label: "Coughing (Dry / Honking)", category: "Respiratory", animals: ["dog", "cat", "horse", "cattle", "sheep"] },
  { id: "sneezing", label: "Sneezing / Sniffling", category: "Respiratory", animals: ["dog", "cat", "rabbit", "bird"] },
  { id: "nasal_discharge", label: "Nasal Discharge (Clear / Mucus)", category: "Respiratory", animals: ["dog", "cat", "horse", "rabbit", "bird", "cattle"] },
  { id: "tail_bobbing", label: "Tail Bobbing with Breath", category: "Respiratory", animals: ["bird"] },
  { id: "open_mouth_breathing", label: "Open Beak / Mouth Breathing", category: "Respiratory", animals: ["bird", "cat", "dog", "cattle", "sheep"] },
  { id: "fluffed_feathers", label: "Fluffed Feathers During Daytime", category: "Respiratory", animals: ["bird"] },
  { id: "labored_breathing", label: "Heavy Labored Breathing / Grunting", category: "Respiratory", animals: ["cattle", "sheep", "horse", "dog"] },

  // Gastrointestinal
  { id: "vomiting", label: "Vomiting / Regurgitation", category: "Gastrointestinal", animals: ["dog", "cat"] },
  { id: "diarrhea", label: "Diarrhea (Watery / Loose Stool)", category: "Gastrointestinal", animals: ["dog", "cat", "horse", "cattle", "sheep"] },
  { id: "bloody_diarrhea", label: "Bloody / Dark Diarrhea", category: "Gastrointestinal", animals: ["dog", "cat", "cattle"] },
  { id: "loss_of_appetite", label: "Loss of Appetite / Anorexia", category: "Gastrointestinal", animals: ["dog", "cat", "horse", "rabbit", "bird", "cattle", "sheep"] },
  { id: "no_fecal_pellets", label: "Absence of Fecal Pellets (>8h)", category: "Gastrointestinal", animals: ["rabbit"] },
  { id: "swollen_abdomen", label: "Swollen / Hard Distended Abdomen", category: "Gastrointestinal", animals: ["dog", "cat", "rabbit"] },
  { id: "distended_left_flank", label: "Distended Left Flank (Rumen Bloat)", category: "Gastrointestinal", animals: ["cattle", "sheep"] },
  { id: "unproductive_retching", label: "Unproductive Dry Retching", category: "Gastrointestinal", animals: ["dog"] },
  { id: "abdominal_pain", label: "Abdominal Guarding / Pain", category: "Gastrointestinal", animals: ["dog", "cat", "horse", "rabbit", "cattle"] },
  { id: "pawing_ground", label: "Pawing at the Ground", category: "Gastrointestinal", animals: ["horse", "cattle"] },
  { id: "looking_at_flank", label: "Looking at / Biting Flank", category: "Gastrointestinal", animals: ["horse"] },
  { id: "rolling_frequently", label: "Rolling Frequently / Violent Agitation", category: "Gastrointestinal", animals: ["horse"] },
  { id: "hunched_posture", label: "Painful Hunched Posture", category: "Gastrointestinal", animals: ["rabbit", "cat", "bird", "sheep"] },

  // General / Vitals
  { id: "fever", label: "Fever / Elevated Body Temp", category: "General", animals: ["dog", "cat", "horse", "cattle", "sheep"] },
  { id: "lethargy", label: "Lethargy / Extreme Weakness", category: "General", animals: ["dog", "cat", "horse", "rabbit", "bird", "cattle", "sheep"] },
  { id: "restlessness", label: "Pacing / Inability to Rest", category: "General", animals: ["dog", "horse", "cattle"] },
  { id: "dry_tacky_gums", label: "Dry / Tacky Gums (Dehydration)", category: "General", animals: ["dog", "cat", "horse", "cattle"] },

  // Dermatological & Hoof
  { id: "excessive_scratching", label: "Excessive Itching / Scratching", category: "Dermatological", animals: ["dog", "cat", "rabbit", "sheep"] },
  { id: "hair_loss", label: "Hair / Fur / Wool Loss", category: "Dermatological", animals: ["dog", "cat", "rabbit", "sheep"] },
  { id: "red_skin", label: "Red / Inflamed Skin (Erythema)", category: "Dermatological", animals: ["dog", "cat"] },
  { id: "hoof_separation", label: "Hoof Horn Separation", category: "Dermatological", animals: ["sheep", "cattle", "horse"] },
  { id: "foul_foot_odor", label: "Foul Interdigital Foot Odor", category: "Dermatological", animals: ["sheep", "cattle"] },

  // Musculoskeletal
  { id: "limping", label: "Limping / Shifting Lameness", category: "Musculoskeletal", animals: ["dog", "cat", "horse", "cattle", "sheep"] },
  { id: "severe_lameness", label: "Severe Lameness / Kneeling", category: "Musculoskeletal", animals: ["sheep", "cattle", "horse"] },
  { id: "swelling", label: "Localized Joint / Paw Swelling", category: "Musculoskeletal", animals: ["dog", "cat", "horse", "cattle"] },

  // Ears, Eyes & Udder
  { id: "head_shaking", label: "Head Shaking / Ear Flapping", category: "Ears & Eyes", animals: ["dog", "cat", "rabbit", "sheep"] },
  { id: "ear_scratching", label: "Persistent Ear Scratching", category: "Ears & Eyes", animals: ["dog", "cat", "rabbit"] },
  { id: "ear_odor", label: "Foul / Yeasty Ear Odor", category: "Ears & Eyes", animals: ["dog", "cat"] },
  { id: "eye_discharge", label: "Eye Discharge / Redness", category: "Ears & Eyes", animals: ["dog", "cat", "rabbit", "bird", "cattle"] },
  { id: "swollen_udder", label: "Swollen Hot Quarter Udder", category: "Mammary", animals: ["cattle", "sheep"] },
  { id: "abnormal_milk_clots", label: "Clots / Blood / Flakes in Milk", category: "Mammary", animals: ["cattle", "sheep"] },

  // Urinary
  { id: "straining_to_urinate", label: "Straining / Inability to Urinate", category: "Urinary", animals: ["cat", "dog", "sheep"] },
  { id: "frequent_litter_box_visits", label: "Frequent Unproductive Box Visits", category: "Urinary", animals: ["cat"] },
  { id: "crying_in_litter_box", label: "Crying / Vocalizing When Urinating", category: "Urinary", animals: ["cat"] },

  // History / Exposure
  { id: "unvaccinated", label: "Unvaccinated / Overdue Core Shots", category: "History", animals: ["dog", "cat", "horse", "cattle", "sheep"] },
  { id: "recent_activity", label: "Recent Strenuous Activity / Trauma", category: "History", animals: ["dog", "cat", "horse"] },
  { id: "eating_foreign_object", label: "Ate Garbage / Non-Food Object", category: "History", animals: ["dog", "cat"] }
];
