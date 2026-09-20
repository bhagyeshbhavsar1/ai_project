# Veterinary Knowledge Base & Data Sources

This expert system integrates verified veterinary datasets and peer-reviewed clinical literature organized across three formal tiers:

---

## Tier 1 — Primary Public Datasets
1. **Animal Condition Classification Dataset (Kaggle)**  
   *URL*: [kaggle.com/datasets/gracehephzibahm/animal-disease](https://www.kaggle.com/datasets/gracehephzibahm/animal-disease)  
   *Role*: Ground truth for multi-animal disease symptom sets (Canine, Feline, Equine, Avian) and the binary `Dangerous` (Yes/No) urgency metric used in emergency triage flags.

---

## Tier 2 — Structural & Severity References
2. **Disease-Symptom-Description Dataset (Kaggle)**  
   *URL*: [kaggle.com/datasets/itachi9604/disease-symptom-description-dataset](https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset)  
   *Role*: Architectural template for symptom clustering, structured precaution mappings, and certainty/severity weights.

3. **Disease Prediction Machine Learning Dataset (Kaggle)**  
   *URL*: [kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning](https://www.kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning)  
   *Role*: Binary matrix mapping used to evaluate rule antecedent satisfaction and partial differential scoring.

---

## Tier 3 — Veterinary Health Libraries & Clinical Literature
4. **VCA Animal Hospitals — Health Library**  
   *URL*: [vcahospitals.com/know-your-pet](https://vcahospitals.com/know-your-pet)  
   *Role*: Comprehensive clinical symptom guides, differential diagnoses, and at-home examination procedures.

5. **American Kennel Club (AKC) Canine Health**  
   *URL*: [akc.org/expert-advice/health/](https://www.akc.org/expert-advice/health/)  
   *Role*: Canine-specific infectious disease profiles (Kennel Cough, Parvovirus, Canine Influenza, Lyme Disease).

6. **International Cat Care (iCatCare)**  
   *URL*: [icatcare.org/advice/](https://www.icatcare.org/advice/)  
   *Role*: Feline-specific disease profiles (Feline Upper Respiratory Infection, FLUTD, Ear Mites).

7. **ASPCA Animal Poison Control & Pet Care Center**  
   *URL*: [aspca.org/pet-care](https://www.aspca.org/pet-care)  
   *Role*: Toxin exposure protocols, gastrointestinal dietary indiscretion, and emergency indicators.

---

## Verified Rule Catalog

| Rule ID | Species | Condition Name | Antecedent Symptoms | Severity / Risk | Primary Source Citation |
|---|---|---|---|---|---|
| **R1** | Dog | Kennel Cough | fever, coughing, lethargy | Mild to Moderate | AKC Health & VCA Hospitals |
| **R2** | Dog | Canine Parvovirus | vomiting, bloody_diarrhea, lethargy, unvaccinated | **Critical Emergency (Dangerous: Yes)** | Kaggle Animal Disease & ASPCA |
| **R3** | Dog/Cat | Flea Allergy Dermatitis | excessive_scratching, hair_loss, red_skin | Mild to Moderate | Kaggle Symptom Dataset & VCA |
| **R4** | Dog/Cat/Horse | Muscle Strain / Sprain | limping, swelling, recent_activity | Moderate | VCA Hospitals & AKC Orthopedic |
| **R5** | Dog | Complicated Kennel Cough | suspect = Kennel Cough, nasal_discharge | Moderate to High | AKC Health & JVIM Consensus |
| **R6** | Dog | Canine Influenza | fever, coughing, nasal_discharge, loss_of_appetite | **High (Dangerous: Yes)** | Kaggle Animal Disease & CDC CIV |
| **R7** | Cat | FLUTD (Urinary Blockage) | straining_to_urinate, frequent_litter_box_visits, crying_in_box | **Critical Emergency (Dangerous: Yes)** | iCatCare & VCA Health |
| **R8** | Cat | Feline URI (Cat Flu) | sneezing, eye_discharge, nasal_discharge, lethargy | Moderate | iCatCare & ASPCA |
| **R9** | Dog/Cat | Acute Gastroenteritis | vomiting, diarrhea, eating_foreign_object | Moderate | Kaggle Dataset & VCA Health |
| **R10** | Horse | Equine Colic | pawing_ground, looking_at_flank, rolling_frequently, loss_of_appetite | **Critical Emergency (Dangerous: Yes)** | Kaggle Animal Disease & VCA Equine |
| **R11** | Rabbit | Rabbit GI Stasis | loss_of_appetite, no_fecal_pellets, hunched_posture, lethargy | **Critical Emergency (Dangerous: Yes)** | VCA Health & Exotic Pet Medicine |
| **R12** | Bird | Avian Air Sac Infection | tail_bobbing, open_mouth_breathing, fluffed_feathers, lethargy | **Critical Emergency (Dangerous: Yes)** | Kaggle Animal Disease & Avian Vet |
| **R13** | Dog | GDV / Bloat | swollen_abdomen, unproductive_retching, restlessness | **Critical Emergency (Dangerous: Yes)** | Kaggle Animal Disease & AKC |
| **R14** | Dog/Cat | Otitis Externa | head_shaking, ear_scratching, ear_odor | Moderate | Kaggle Dataset & VCA Health |
| **R15** | All | Systemic Dehydration | vomiting, diarrhea, dry_tacky_gums | **High (Dangerous: Yes)** | Merck Vet Manual & VCA Health |
| **R16** | Dog | Lyme Disease | fever, limping, swollen_joints, tick_exposure | Moderate to High | AKC Health & VCA Hospitals |
| **R17** | Dog | Acute Pancreatitis | vomiting, abdominal_pain, loss_of_appetite, high_fat_meal | **High (Dangerous: Yes)** | Kaggle Animal Disease & VCA |
| **R18** | Cat | Feline Ear Mites | ear_scratching, head_shaking, black_ear_debris | Mild to Moderate | iCatCare & VCA Health |
