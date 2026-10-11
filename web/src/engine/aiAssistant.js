/**
 * aiAssistant.js
 * ==============
 * AI Clinical Intelligence Layer for VetAssist.
 * 
 * Features:
 * 1. AI Natural Language Symptom Extractor (Parses free-text pet stories into clinical symptom tokens)
 * 2. AI Clinical Triage SOAP Note & Vet Referral Generator (Synthesizes rule firing into veterinary notes)
 * 3. AI Physical Exam Assistant (Provides at-home clinical assessment guidance)
 * 4. AI Dangerous Condition Early Warning Radar (Based on Kaggle Tier 1 Animal Disease Dataset)
 */

import { ALL_SYMPTOMS, VET_RULES } from './rulesData.js';

// Text normalization helper handling contractions, punctuation and whitespace
export function normalizeClinicalText(text) {
  if (!text || typeof text !== "string") return "";
  let s = text.toLowerCase();
  s = s.replace(/\bcan['’]?t\b/g, "cant");
  s = s.replace(/\bcannot\b/g, "cant");
  s = s.replace(/\bwon['’]?t\b/g, "wont");
  s = s.replace(/\bhasn['’]?t\b/g, "hasnt");
  s = s.replace(/\bdoesn['’]?t\b/g, "doesnt");
  s = s.replace(/\bdidn['’]?t\b/g, "didnt");
  s = s.replace(/\bisn['’]?t\b/g, "isnt");
  s = s.replace(/\baren['’]?t\b/g, "arent");
  s = s.replace(/\bwasn['’]?t\b/g, "wasnt");
  s = s.replace(/\bwouldn['’]?t\b/g, "wouldnt");
  s = s.replace(/\bcouldn['’]?t\b/g, "couldnt");
  s = s.replace(/['’`]/g, "");
  s = s.replace(/[^a-z0-9]/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Automatically detects animal species from free-form user query.
 */
export function detectAnimalSpecies(text) {
  if (!text) return null;
  const norm = ` ${normalizeClinicalText(text)} `;
  if (/\b(cat|cats|kitten|kittens|kitty|kitties|feline|felines)\b/.test(norm)) return "cat";
  if (/\b(dog|dogs|puppy|puppies|pup|pups|canine|canines|hound|hounds|pooch|pooches)\b/.test(norm)) return "dog";
  if (/\b(horse|horses|pony|ponies|mare|mares|stallion|stallions|gelding|geldings|foal|foals|equine)\b/.test(norm)) return "horse";
  if (/\b(rabbit|rabbits|bunny|bunnies|hare|hares|lagomorph)\b/.test(norm)) return "rabbit";
  if (/\b(bird|birds|parrot|parrots|parakeet|parakeets|budgie|budgies|cockatiel|cockatiels|canary|canaries|finch|finches|avian)\b/.test(norm)) return "bird";
  if (/\b(cow|cows|cattle|calf|calves|bull|bulls|heifer|heifers|bovine|steer|steers)\b/.test(norm)) return "cattle";
  if (/\b(sheep|lamb|lambs|goat|goats|ram|rams|ewe|ewes|ovine|caprine)\b/.test(norm)) return "sheep";
  return null;
}

// Comprehensive clinical synonym and common-expression keyword map for all 44 signs
const SYMPTOM_KEYWORD_MAP = {
  coughing: ["cough", "coughing", "coughed", "hacking", "gagging", "honking", "choking noise", "dry cough", "persistent cough", "clearing throat", "honk", "kennel cough"],
  sneezing: ["sneeze", "sneezing", "sneezed", "sniffling", "reverse sneezing", "snorting"],
  nasal_discharge: ["runny nose", "running nose", "nasal discharge", "mucus from nose", "snot", "snotty", "green nose", "crusty nose", "discharge from nose", "wet nose dripping", "boogers"],
  tail_bobbing: ["tail bobbing", "bobbing tail", "tail bob", "tail pumping", "heavy breathing tail"],
  open_mouth_breathing: ["open mouth breathing", "open mouth", "open beak", "gasping for air", "gasping", "panting heavily", "breathing hard through mouth", "panting cat", "struggling to breathe"],
  fluffed_feathers: ["fluffed feathers", "puffed up feathers", "puffed up", "fluffed up", "sitting on bottom of cage", "sleeping during day", "eyes closed daytime"],
  labored_breathing: ["labored breathing", "laboured breathing", "heavy breathing", "struggling to breathe", "shortness of breath", "wheezing", "grunting breath", "abdominal breathing", "rapid breathing", "fast breathing", "respiratory distress"],
  vomiting: ["vomit", "vomiting", "vomited", "threw up", "throwing up", "throw up", "puking", "puked", "puke", "regurgitating", "regurgitation", "yellow bile", "white foam", "bringing up food", "sick to stomach", "retching food"],
  diarrhea: ["diarrhea", "diarrhoea", "loose stool", "loose stools", "watery poop", "watery stool", "runny stool", "runny poop", "frequent stool", "soft stool", "liquid poop", "the runs", "liquid stool"],
  bloody_diarrhea: ["bloody stool", "bloody diarrhea", "blood in stool", "blood in poop", "red stool", "red poop", "dark tarry stool", "black stool", "foul bloody", "bloody bowel", "pooping blood", "pooped blood", "bleeding from rectum"],
  loss_of_appetite: ["not eating", "wont eat", "refusing food", "refused food", "loss of appetite", "no appetite", "lost appetite", "anorexia", "anorexic", "skipped meal", "stopped eating", "not hungry", "turned away food", "barely eating", "hasnt eaten", "refuses to eat", "doesnt eat", "refuse food"],
  no_fecal_pellets: ["no fecal pellets", "no poop", "stopped pooping", "not pooping", "hasnt pooped", "cant poop", "tiny droppings", "no pellets", "small droppings", "absence of feces", "rabbit not pooping", "no feces"],
  swollen_abdomen: ["swollen belly", "swollen abdomen", "bloated", "bloat", "hard belly", "tight belly", "distended belly", "distended abdomen", "drum belly", "belly looks big", "enlarged stomach"],
  distended_left_flank: ["distended left flank", "left flank", "bloated left side", "rumen bloat", "swollen left side", "tight left flank"],
  unproductive_retching: ["dry retching", "dry heaving", "gagging nothing comes up", "unproductive retching", "wretching", "trying to vomit nothing comes out", "gagging with no vomit", "unproductive vomiting", "heaving with no vomit"],
  abdominal_pain: ["abdominal pain", "belly pain", "stomach pain", "guarding belly", "tense belly", "tender belly", "crying when belly touched", "whining when abdomen touched", "colic pain"],
  pawing_ground: ["pawing ground", "pawing at ground", "pawing the dirt", "stomping hoof", "scraping hoof", "kicking ground"],
  looking_at_flank: ["looking at flank", "looking at belly", "biting flank", "staring at side", "looking back at stomach", "turning to look at side"],
  rolling_frequently: ["rolling", "rolling frequently", "rolling violently", "rolling on ground", "thrashing", "lying down and getting up repeatedly", "rolling over and over"],
  hunched_posture: ["hunched", "hunched over", "hunched posture", "curled up in ball", "grinding teeth", "tooth grinding", "pressed against floor", "roached back"],
  fever: ["fever", "warm", "hot to touch", "elevated temperature", "high temp", "burning up", "hot ears", "shivering with warmth", "pyrexia", "feverish"],
  lethargy: ["lethargic", "lethargy", "sluggish", "tired", "sleepy", "weak", "weakness", "no energy", "wont move", "barely moving", "depressed", "exhausted", "collapsed", "collapse", "lying around", "listless", "unresponsive", "reluctant to move", "inactive"],
  restlessness: ["restless", "restlessness", "pacing", "cant settle", "wont lie down", "cant get comfortable", "anxious pacing", "walking around agitated", "agitated"],
  dry_tacky_gums: ["dry gums", "tacky gums", "sticky gums", "pale dry gums", "dehydrated gums", "dry mouth", "dehydration", "sunken eyes", "skin tenting"],
  excessive_scratching: ["scratching", "scratching constantly", "itching", "itchy", "biting skin", "chewing skin", "chewing fur", "chewing paws", "grooming obsessively", "pruritus", "scratching like crazy"],
  hair_loss: ["hair loss", "fur loss", "wool loss", "losing hair", "bald spot", "bald spots", "bald patch", "thinning fur", "alopecia", "missing fur"],
  red_skin: ["red skin", "rash", "inflamed skin", "scabs", "scabby skin", "hot spot", "hot spots", "erythema", "irritated skin", "pink skin", "red bumps"],
  hoof_separation: ["hoof separation", "hoof splitting", "horn separation", "hoof horn coming off", "cracked hoof", "hoof wall separating"],
  foul_foot_odor: ["foul foot odor", "smelly foot", "stinky hoof", "rotting hoof", "footrot", "smelly claw", "rotten smell from feet"],
  limping: ["limp", "limping", "favoring leg", "holding up paw", "holding up leg", "wont put weight", "lame", "hobbling", "lameness", "dragging leg"],
  severe_lameness: ["severe lameness", "grazing on knees", "unable to walk", "cant stand", "severe limp", "refusing to put foot down"],
  swelling: ["swelling", "swollen", "swollen joint", "swollen paw", "swollen leg", "puffy leg", "enlarged paw", "edema", "lump on joint"],
  head_shaking: ["shaking head", "shakes head", "shook head", "head shake", "flapping ears", "head tilt", "tilting head", "ear flapping"],
  ear_scratching: ["scratching ears", "scratching ear", "pawing at ear", "pawing ear", "rubbing ear", "digging at ear", "itchy ears"],
  ear_odor: ["ear odor", "smelly ear", "smelly ears", "stinky ear", "stinky ears", "yeasty ear", "foul ear", "ear smell", "brown gunk in ear", "ear wax smell"],
  eye_discharge: ["eye discharge", "runny eyes", "crusty eyes", "pus in eye", "watery eyes", "weepy eyes", "squinting eye", "conjunctivitis", "cloudy eye", "red eye"],
  swollen_udder: ["swollen udder", "hot udder", "mastitis", "hard udder", "swollen teat", "painful udder"],
  abnormal_milk_clots: ["clots in milk", "milk clots", "blood in milk", "watery milk", "flakes in milk", "stringy milk", "abnormal milk"],
  straining_to_urinate: ["cant pee", "cannot pee", "straining to pee", "straining to urinate", "trouble peeing", "squatting and nothing", "difficulty peeing", "trying to pee", "blocked urinary", "little urine", "drops of pee", "straining in litter", "straining in the litter", "hard time peeing", "unable to pee", "peeing pain"],
  frequent_litter_box_visits: ["frequent litter", "running to litter box", "in and out of litter box", "in and out of box", "frequent box visits", "going to litter box constantly", "frequent urination attempts", "keeps going to litter", "visits litter box"],
  crying_in_litter_box: ["crying in litter", "crying in litter box", "crying in the litter", "crying in the litter box", "meowing in litter", "yowling in litter", "screaming in litter", "pain peeing", "crying when peeing", "crying while peeing", "meowing while peeing", "vocalizing in litter"],
  unvaccinated: ["unvaccinated", "not vaccinated", "never vaccinated", "no vaccines", "overdue shots", "missed vaccines", "no shots", "puppy shots not done", "has not had vaccines", "never had shots"],
  recent_activity: ["ran hard", "strenuous activity", "heavy exercise", "jumped off", "fell", "hit by", "trauma", "rough play", "dog park running"],
  eating_foreign_object: ["ate toy", "ate a toy", "ate garbage", "ate trash", "ate sock", "ate a sock", "swallowed foreign", "ate plastic", "ate bone", "table scraps", "chewed up toy", "foreign body", "ate something bad"]
};

/**
 * AI Natural Language Symptom Extractor
 * Parses free-form text from pet owners and identifies matching symptoms with confidence.
 */
export function extractSymptomsWithAI(text, animalType = "dog") {
  if (!text || typeof text !== "string") {
    return { extractedSymptoms: [], matchedKeywords: [], confidenceScore: 0, urgencyNotice: null, detectedAnimal: null };
  }

  const normalized = normalizeClinicalText(text);
  const padded = ` ${normalized} `;
  const detectedAnimal = detectAnimalSpecies(text);
  const extracted = new Set();
  const matchedKeywords = [];
  let isUrgent = false;

  // Direct keyword dictionary scan
  for (const [symptomId, keywords] of Object.entries(SYMPTOM_KEYWORD_MAP)) {
    for (const kw of keywords) {
      const normKw = normalizeClinicalText(kw);
      if (padded.includes(` ${normKw} `) || normalized.includes(normKw)) {
        extracted.add(symptomId);
        matchedKeywords.push({ keyword: kw, symptomId: symptomId });
        break;
      }
    }
  }

  // Contextual pattern matching
  // 1. Litter box crying & urination
  if (/\b(crying|yowling|meowing|screaming|pain)\b/.test(padded) && /\b(litter|box|pee|peeing|urinate|urinating)\b/.test(padded)) {
    extracted.add("crying_in_litter_box");
    extracted.add("straining_to_urinate");
  }
  if (/\b(straining|cant pee|cannot pee|trouble peeing|trying to pee|blocked)\b/.test(padded)) {
    extracted.add("straining_to_urinate");
  }
  if (/\b(in and out|frequent|constantly|keeps going)\b/.test(padded) && /\b(litter|box)\b/.test(padded)) {
    extracted.add("frequent_litter_box_visits");
  }

  // 2. GI & Appetite
  if (/\b(cant|not|stopped|hasnt|wont|refusing|refuses|doesnt)\b/.test(padded) && /\b(eat|eating|food|appetite)\b/.test(padded)) {
    extracted.add("loss_of_appetite");
  }
  if (/\b(cant|not|stopped|hasnt|no)\b/.test(padded) && /\b(poop|pooping|pellet|pellets|droppings|feces)\b/.test(padded)) {
    extracted.add("no_fecal_pellets");
  }
  if (/\b(blood|bloody)\b/.test(padded) && /\b(poop|stool|diarrhea|bowel|feces)\b/.test(padded)) {
    extracted.add("bloody_diarrhea");
  }

  // 3. Ear checks
  if (/\b(ear|ears)\b/.test(padded) && /\b(smell|stink|stinky|odor|yeast|yeasty|gunk|wax)\b/.test(padded)) {
    extracted.add("ear_odor");
  }
  if (/\b(ear|ears)\b/.test(padded) && /\b(scratch|scratching|pawing|rubbing|itch|itchy)\b/.test(padded)) {
    extracted.add("ear_scratching");
  }
  if (/\b(head|ear|ears)\b/.test(padded) && /\b(shak|shaking|tilt|tilting|flap|flapping)\b/.test(padded)) {
    extracted.add("head_shaking");
  }

  // Check emergency triggers
  if (
    extracted.has("bloody_diarrhea") ||
    extracted.has("straining_to_urinate") ||
    extracted.has("swollen_abdomen") ||
    extracted.has("unproductive_retching") ||
    extracted.has("rolling_frequently") ||
    extracted.has("open_mouth_breathing") ||
    extracted.has("no_fecal_pellets") ||
    normalized.includes("blood") ||
    normalized.includes("cant pee") ||
    normalized.includes("bloat") ||
    normalized.includes("colic") ||
    normalized.includes("collapse")
  ) {
    isUrgent = true;
  }

  const symptomList = Array.from(extracted);
  const confidenceScore = Math.min(100, Math.round((symptomList.length / 3) * 85) + 15);

  return {
    extractedSymptoms: symptomList,
    detectedAnimal,
    matchedKeywords,
    confidenceScore: symptomList.length > 0 ? confidenceScore : 0,
    isUrgent,
    urgencyNotice: isUrgent ? "⚠️ High Triage Urgency Detected from reported signs." : null
  };
}

/**
 * AI Clinical Summary & Vet Referral Letter Synthesizer
 * Formulates a structured clinical triage report for vet handoff.
 */
export function generateAIClinicalSummary(petType, primaryDiagnosis, symptomsList, mode = "Forward Chaining") {
  if (!primaryDiagnosis) {
    return "Inconclusive assessment. Please schedule a licensed veterinarian consultation for a comprehensive diagnostic examination.";
  }

  const speciesName = petType.toUpperCase();
  const condName = primaryDiagnosis.conditionName || "Undetermined Condition";
  const conf = primaryDiagnosis.confidencePct || 70;
  const isDangerous = primaryDiagnosis.dangerous === "Yes" || primaryDiagnosis.severity?.includes("Critical") || primaryDiagnosis.severity?.includes("Emergency");

  const triageTag = isDangerous ? "🚨 [HIGH PRIORITY TRIAGE]" : "📋 [ROUTINE VET CONSULTATION]";
  const symptomsStr = symptomsList.length > 0 ? symptomsList.join(", ") : "Noted clinical observations";

  return `
${triageTag} - AI VETERINARY TRIAGE SUMMARY
=====================================================
PATIENT SPECIES: ${speciesName}
REASONING ENGINE: ${mode} (Knowledge-Base Verified)
PRIMARY WORKING HYPOTHESIS: ${condName}
CERTAINTY FACTOR: ${conf}% | SEVERITY: ${primaryDiagnosis.severity || "Moderate"}
DANGEROUS / EMERGENCY CLASSIFICATION: ${isDangerous ? "YES (Immediate Attention Recommended)" : "NO (Non-critical / Outpatient)"}

SUBJECTIVE & OBSERVED SYMPTOMS:
- Reported Signs: ${symptomsStr}

OBJECTIVE INFERENCE TRACE:
- Triggered Expert Rule: ${primaryDiagnosis.ruleStatement || 'Standard clinical correlation'}
- Clinical Rationale: ${primaryDiagnosis.explanation || 'Matches clinical pattern in rule base.'}

RECOMMENDED NEXT STEPS:
${(primaryDiagnosis.recommendedActions || []).map((a, i) => `${i + 1}. ${a}`).join("\n")}

DISCLAIMER: This AI synthesis is for triage assistance and veterinary educational reference only. It does not replace definitive clinical diagnostics (bloodwork, cytology, imaging).
  `.trim();
}

/**
 * AI Physical Exam Assistant Guide
 * Provides step-by-step instructions for owners checking a specific symptom.
 */
export function getAIExamGuideForCondition(conditionKey) {
  const guides = {
    fever: "How to check pet's temperature: The most accurate method is a lubricated pediatric digital rectal thermometer (Normal dog/cat: 38.0°C - 39.2°C / 100.5°F - 102.5°F). Never use human oral thermometers.",
    dry_tacky_gums: "How to check hydration & gums: Gently lift your pet's upper lip. Gums should feel slick and wet like saliva. If they feel sticky, tacky, or dry, your pet is experiencing fluid loss.",
    limping: "How to inspect leg lameness: Gently run your hands from paw to hip/shoulder feeling for heat, swelling, or reflex pull-back. Check paw pads for thorns or broken nails.",
    straining_to_urinate: "How to assess urination: Observe if the pet postures repeatedly with only a few drops or blood produced. In male cats, an obstructed urethra is a fatal emergency <24h.",
    bloody_diarrhea: "Assessing GI bleeding: Note whether blood is bright red (hematochezia - lower bowel) or dark black/tarry (melena - upper GI bleed). Take a photo to show your vet.",
    swollen_abdomen: "Bloat check: Gently tap both sides of the pet's ribcage and belly. A drum-like hollow sound combined with pacing and retching is an acute GDV emergency.",
    tail_bobbing: "Avian respiratory check: Watch the base of the tail from the side. Up-and-down rhythmic pumping with each breath indicates severe breathing effort."
  };

  return guides[conditionKey] || `Inspect your pet calmly in a well-lit area. Note onset duration and any behavioral changes to share with your veterinarian.`;
}
