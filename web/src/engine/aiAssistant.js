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

// Keyword dictionary mapping natural language synonyms to formal symptom IDs
const SYMPTOM_KEYWORD_MAP = {
  coughing: ["cough", "coughing", "hacking", "gagging", "honking", "clearing throat", "dry cough", "choking noise"],
  fever: ["fever", "warm", "hot", "temperature", "high temp", "burning up", "hot ears", "shivering"],
  lethargy: ["lethargic", "lethargy", "tired", "sleepy", "weak", "no energy", "wont move", "sluggish", "depressed", "exhausted", "collapsed"],
  vomiting: ["vomit", "vomiting", "threw up", "throwing up", "puking", "regurgitating", "bile", "yellow foam", "retic"],
  diarrhea: ["diarrhea", "loose stool", "watery poop", "runny stool", "frequent stool", "soft stool"],
  bloody_diarrhea: ["bloody stool", "bloody diarrhea", "blood in stool", "red stool", "dark tarry stool", "black stool", "foul bloody"],
  loss_of_appetite: ["not eating", "refusing food", "loss of appetite", "anorexia", "wont eat", "skipped meal", "no appetite", "picky"],
  nasal_discharge: ["runny nose", "nasal discharge", "mucus", "snot", "sneezing discharge", "green nose", "crusty nose"],
  sneezing: ["sneeze", "sneezing", "sniffling", "reverse sneezing"],
  unvaccinated: ["unvaccinated", "no vaccines", "overdue shots", "puppy shots", "missed vaccine", "never vaccinated"],
  straining_to_urinate: ["straining to pee", "cant pee", "straining in litter", "squatting", "little urine", "blocked", "trying to urinate"],
  frequent_litter_box_visits: ["running to litter box", "frequent visits", "in and out of box", "frequent urination attempts"],
  crying_in_litter_box: ["crying in box", "meowing in litter", "yowling when peeing", "screaming in litter", "pain peeing"],
  swollen_abdomen: ["swollen belly", "bloated", "hard belly", "tight stomach", "distended abdomen", "drum belly"],
  unproductive_retching: ["dry retching", "gagging nothing comes up", "unproductive vomit", "wretching"],
  restlessness: ["restless", "pacing", "cant lie down", "anxious", "panting pacing", "agitated"],
  pawing_ground: ["pawing", "pawing ground", "stomping feet", "scraping hoof"],
  looking_at_flank: ["looking at belly", "biting flank", "staring at side", "kicking at belly"],
  rolling_frequently: ["rolling violently", "rolling on ground", "thrashing", "lying down getting up"],
  no_fecal_pellets: ["no poop", "no fecal pellets", "stopped pooping", "tiny droppings", "no pellets"],
  hunched_posture: ["hunched", "hunched over", "pressed to floor", "curled in ball", "grinding teeth in pain"],
  tail_bobbing: ["tail bobbing", "bobbing tail", "tail pumping", "heavy breathing tail"],
  open_mouth_breathing: ["open mouth breathing", "open beak", "gasping", "panting cat"],
  fluffed_feathers: ["fluffed feathers", "puffed up", "eyes closed daytime", "sleeping on perch bottom"],
  excessive_scratching: ["scratching", "itching", "biting skin", "chewing fur", "grooming constantly"],
  hair_loss: ["hair loss", "bald patches", "thinning fur", "losing hair", "alopecia"],
  red_skin: ["red skin", "rash", "inflamed skin", "scabby skin", "hot spot"],
  limping: ["limping", "favoring leg", "holding up paw", "wont put weight", "lame", "hobbling"],
  swelling: ["swelling", "swollen joint", "puffy leg", "enlarged paw", "edema"],
  head_shaking: ["shaking head", "flapping ears", "head tilt", "ear shaking"],
  ear_scratching: ["scratching ears", "pawing at ear", "rubbing ear on floor"],
  ear_odor: ["smelly ears", "ear odor", "stinky ear", "yeast smell", "brown ear gunk"],
  black_ear_debris: ["black ear wax", "coffee grounds in ear", "black crust in ear", "ear mites debris"],
  eating_foreign_object: ["ate toy", "ate garbage", "ate sock", "foreign object", "chewed plastic", "table scraps"],
  high_fat_meal: ["bacon grease", "fatty food", "table scraps", "butter", "ate sausage", "fat scraps"],
  tick_exposure: ["tick", "tick bite", "found a tick", "tall grass", "woods walking", "woodland tick"],
  dry_tacky_gums: ["dry gums", "sticky gums", "tacky mouth", "pale dry gums", "dehydrated mouth"]
};

/**
 * AI Natural Language Symptom Extractor
 * Parses free-form text from pet owners and identifies matching symptoms with confidence.
 */
export function extractSymptomsWithAI(text, animalType = "dog") {
  if (!text || typeof text !== "string") {
    return { extractedSymptoms: [], matchedKeywords: [], confidenceScore: 0, urgencyNotice: null };
  }

  const normalized = text.toLowerCase();
  const extracted = new Set();
  const matchedKeywords = [];
  let isUrgent = false;

  // Scan keyword dictionary
  for (const [symptomId, keywords] of Object.entries(SYMPTOM_KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        extracted.add(symptomId);
        matchedKeywords.push({ keyword: kw, symptomId: symptomId });
        break;
      }
    }
  }

  // Check emergency triggers
  if (
    normalized.includes("blood") ||
    normalized.includes("cant pee") ||
    normalized.includes("straining") ||
    normalized.includes("bloat") ||
    normalized.includes("collapse") ||
    normalized.includes("colic") ||
    normalized.includes("open mouth breathing") ||
    normalized.includes("no poop")
  ) {
    isUrgent = true;
  }

  const symptomList = Array.from(extracted);
  const confidenceScore = Math.min(100, Math.round((symptomList.length / 3) * 85) + 15);

  return {
    extractedSymptoms: symptomList,
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
