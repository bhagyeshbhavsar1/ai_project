/**
 * formatters.js
 * =============
 * Plain-language labels and user-friendly formatters for symptoms,
 * rules, and reasoning explanations.
 */

export const FRIENDLY_SYMPTOM_NAMES = {
  // Gastrointestinal
  bloody_diarrhea: "Blood in diarrhea",
  no_fecal_pellets: "No droppings / fecal pellets",
  vomiting: "Vomiting",
  diarrhea: "Diarrhea",
  loss_of_appetite: "Loss of appetite",
  swollen_abdomen: "Swollen / hard abdomen",
  distended_left_flank: "Swollen left flank",
  unproductive_retching: "Dry retching (trying to vomit)",
  abdominal_pain: "Belly pain / guarding",
  pawing_ground: "Pawing at the ground",
  looking_at_flank: "Looking at / biting flank",
  rolling_frequently: "Rolling frequently",
  hunched_posture: "Hunched posture in pain",

  // Respiratory
  coughing: "Coughing (dry or honking)",
  sneezing: "Sneezing / sniffling",
  nasal_discharge: "Nasal discharge",
  tail_bobbing: "Tail bobbing with breath",
  open_mouth_breathing: "Breathing with open mouth / beak",
  fluffed_feathers: "Fluffed feathers during daytime",
  labored_breathing: "Heavy / labored breathing",

  // General & Vitals
  fever: "Fever / unusually warm",
  lethargy: "Lethargy (extreme tiredness / weakness)",
  restlessness: "Restlessness / unable to settle",
  dry_tacky_gums: "Dry or tacky gums (dehydration)",

  // Dermatological & Hoof
  excessive_scratching: "Excessive itching / scratching",
  hair_loss: "Hair / fur / wool loss",
  red_skin: "Red or inflamed skin",
  hoof_separation: "Hoof horn separation",
  foul_foot_odor: "Foul foot odor",

  // Musculoskeletal
  limping: "Limping / favor one leg",
  severe_lameness: "Severe lameness (grazing on knees)",
  swelling: "Swollen joint or paw",

  // Ears, Eyes & Udder
  head_shaking: "Head shaking / ear flapping",
  ear_scratching: "Persistent ear scratching",
  ear_odor: "Foul or yeasty ear smell",
  eye_discharge: "Eye discharge or redness",
  swollen_udder: "Swollen, hot, or painful udder",
  abnormal_milk_clots: "Clots or flakes in milk",

  // Urinary
  straining_to_urinate: "Straining to pee / unable to urinate",
  frequent_litter_box_visits: "Frequent trips to litter box",
  crying_in_litter_box: "Crying / vocalizing while peeing",

  // History & Exposure
  unvaccinated: "Not vaccinated / overdue shots",
  recent_activity: "Recent strenuous activity",
  eating_foreign_object: "Ate foreign object or garbage"
};

/**
 * Converts a raw symptom or condition key into a friendly, plain-English name.
 */
export function getFriendlySymptomName(rawKey) {
  if (!rawKey) return "";
  const cleaned = rawKey.toLowerCase().trim();

  if (FRIENDLY_SYMPTOM_NAMES[cleaned]) {
    return FRIENDLY_SYMPTOM_NAMES[cleaned];
  }

  // Handle derived fact format like "suspect = Kennel Cough"
  if (cleaned.startsWith("suspect =")) {
    return cleaned.replace("suspect =", "").trim();
  }

  // Fallback: replace underscores with spaces
  return cleaned.replace(/_/g, " ");
}

/**
 * Formats a list of conditions into friendly plain words joined by commas/and.
 */
export function formatFriendlyList(items = []) {
  if (!items || items.length === 0) return "None";
  return items.map(getFriendlySymptomName).join(", ");
}
