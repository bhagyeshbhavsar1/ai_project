# VetAssist: Dashboard Guide & Professor Presentation Walkthrough

> **Project Name:** VetAssist - Veterinary Clinical Diagnosis Support Expert System  
> **Repository:** [https://github.com/bhagyeshbhavsar1/ai_project](https://github.com/bhagyeshbhavsar1/ai_project)  
> **Technology Stack:** Classical Rule-Based Artificial Intelligence (Forward & Backward Chaining) + Vanilla JS / Vite + Python CLI Engine  
> **Key Datasets:** Kaggle Animal Condition Classification Dataset (Tier 1), Kaggle Disease-Symptom-Description Dataset (Tier 2), Merck Veterinary Manual & ASPCA Pet Care (Tier 3)

---

## Table of Contents
1. [Executive Summary in 30 Seconds](#1-executive-summary-in-30-seconds)
2. [What the Dashboard Has & How to Use Each Section](#2-what-the-dashboard-has--how-to-use-each-section)
3. [The Artificial Intelligence Architecture (Simple Plain Language)](#3-the-artificial-intelligence-architecture-simple-plain-language)
4. [Step-by-Step Demo Script to Show Your Professor (5-Minute Walkthrough)](#4-step-by-step-demo-script-to-show-your-professor-5-minute-walkthrough)
5. [Anticipated Professor Questions & Exact Answers](#5-anticipated-professor-questions--exact-answers)
6. [How to Run the Project Locally](#6-how-to-run-the-project-locally)

---

## 1. Executive Summary in 30 Seconds

**VetAssist** is an intelligent veterinary diagnosis support system designed to help both pet owners and veterinary students understand animal illnesses through **100% transparent, explainable Artificial Intelligence (XAI)**.

Unlike "black-box" generative AI models that can hallucinate medical advice, VetAssist uses **deterministic expert system inference engines** (both **Forward Chaining** and **Backward Chaining**) backed by verified veterinary clinical literature. Every diagnosis is accompanied by a step-by-step audit trail showing exactly which rules were evaluated, which premises were satisfied, and how conclusions were reached.

---

## 2. What the Dashboard Has & How to Use Each Section

### 🏠 1. Home View (`#home`)
* **What it has:**
  * **Cinematic Background Hero Slider:** High-resolution slides covering dogs, cats, horses, and exotic animals. Includes a pause/play control and automatic timer.
  * **Quick-Start CTA Buttons:** Direct shortcuts to **Symptom Checker** or **Interactive Diagnosis**.
  * **Two Reasoning Modes Comparison Card:** Clear explanations comparing *"Option 1: I see symptoms"* (Forward Chaining) and *"Option 2: I suspect a disease"* (Backward Chaining).
  * **Core Pillars Grid:** Highlights the two reasoning modes, explainable AI, multi-species support (7 species), and Kaggle-backed datasets.
  * **Educational Disclaimer:** Prominently stated clinical triage safety notice.

### 🩺 2. Symptom Checker (`#symptom-checker`) — Forward Chaining
* **What it has:**
  * **Clear 1-Line Instruction:** *"Pick your animal, tick every sign you have noticed, then press Diagnose."*
  * **7 Supported Animal Species:** Dog 🐕, Cat 🐈, Horse 🐎, Rabbit 🐇, Bird 🦜, Cattle 🐄, Sheep 🐑.
  * **AI Natural Language Symptom Detective:** 
    * A conversational input box where owners can type in everyday words (e.g., *"My cat can't pee and is crying in the litter box"*).
    * Automatically recognizes the animal species and updates the selection.
    * Uses clinical synonym normalization (contractions, spelling, colloquialisms) to extract matching clinical signs.
    * Displays extracted signs with green checkmark tags and provides an instant **"Run Diagnosis on Extracted Signs"** button.
    * Emergency triage radar alerts when high-risk signs (urinary blockage, bloody diarrhea, bloat, colic) are detected.
  * **"Try an Example" Quick Presets:** 1-click test cases for Kennel Cough, Parvovirus Emergency, FLUTD Urinary Straining, and Multi-Hop Chaining (R1 &rarr; R5).
  * **Categorized Clinical Signs Grid:** Organized by system (Respiratory, Gastrointestinal, General, Musculoskeletal, Ears & Eyes, Urinary, History) with a live filter search bar.
  * **Disabled Button Explanation:** If 0 signs are selected, the button clearly states *"Select at least 1 symptom above to run diagnosis"*.

### 💬 3. Interactive Diagnosis (`#interactive-diagnosis`) — Backward Chaining
* **What it has:**
  * **Goal-Driven Hypothesis Selection:** The user picks a condition they are worried about (e.g., Canine Parvovirus, Equine Colic, Feline FLUTD).
  * **Interactive Question Wizard:** The AI engine asks targeted questions one by one.
  * **"Why We Ask This":** Every question explains the underlying veterinary rationale in plain language.
  * **Live Premise Checklist:** Real-time visual progress showing which conditions are **Proven (✓)**, **Disproven (✗)**, or **Pending (?)**.
  * **Hypothesis Refutation & Backtracking:** If an essential premise is missing, the engine gracefully explains *why* the hypothesis was refuted and offers 1-click alternative suggestions.

### 📊 4. Diagnosis Results (`#diagnosis-results`) — Explainable AI (XAI)
* **What it has:**
  * **Primary Working Diagnosis Card:** Displays the disease name, certainty factor percentage, severity rating (Mild, Moderate, Critical), and danger level.
  * **Matched vs Missing Clinical Signs:** Side-by-side badges showing what the pet has vs what other signs would typically accompany the illness.
  * **Step-by-Step Reasoning Trace ("How we reached this"):**
    * Open by default for maximum transparency.
    * Numbered chronological execution steps.
    * Visual chain arrows showing rule connections (e.g., `Rule R1 Fired` &rarr; `Derived Fact: Secondary Tracheitis Risk` &rarr; `Rule R5 Fired`).
  * **AI Veterinary Clinical Triage Summary (SOAP Note):** Formats a veterinary referral letter ready to copy and share with a clinic.
  * **Differential Diagnoses:** Secondary conditions that partially matched the symptom profile.
  * **At-Home Care Guide & Immediate Actions:** Evidence-based first-aid and quarantine steps.

### 🕒 5. Diagnosis History (`#history`)
* **What it has:**
  * Saves every diagnosis to browser `localStorage` with timestamp, species, confidence, and fired rules.
  * Features single-entry delete buttons and a global **"Clear All History"** action with confirmation.
  * Filter by species.

### 📖 6. Knowledge Base Explorer (`#knowledge-base`)
* **What it has:**
  * A full dictionary of all 20+ veterinary rules across 7 animal species.
  * Search bar to look up diseases, premises, or medical citations.
  * Literature sources cited (Kaggle Animal Condition Dataset, ASPCA, AKC, Merck Veterinary Manual).

### 🔍 7. Top Navigation Bar Utilities
* **Global Live Search Dropdown:** Type any symptom, disease, or animal to see immediate results and jump directly to that view.
* **Help Modal ("❓ How It Works"):** A quick modal breaking down Forward vs. Backward chaining and system concepts for first-time users.
* **Persistent Triage Disclaimer Footer:** Stamped on every view for clinical compliance.

---

## 3. The Artificial Intelligence Architecture (Simple Plain Language)

When explaining this project to your professor, use these definitions:

### A. What is an Expert System?
An Expert System is a branch of classical Artificial Intelligence designed to emulate the decision-making ability of a human expert. It consists of three components:
1. **Knowledge Base:** The repository of clinical facts and domain rules (IF premises &rarr; THEN conclusion).
2. **Working Memory:** The current facts known about the patient (e.g., `fever = true`, `species = dog`).
3. **Inference Engine:** The reasoning logic that evaluates rules against working memory to derive conclusions.

### B. Forward Chaining (Data-Driven / Bottom-Up)
* **How it works:** Starts from known facts (symptoms observed by the owner) and moves forward through rules to discover all reachable conclusions.
* **Real-world analogy:** Like a detective arriving at a crime scene, collecting fingerprints and footprints (data), and using rules to figure out who the suspect is.
* **Formula / Rule Evaluation:**
  $$\text{Premises } (P_1 \land P_2 \land \dots \land P_n) \implies \text{Conclusion } C$$
* **Multi-Hop Chaining:** If Rule R1 concludes an intermediate fact (e.g., `suspect = Kennel Cough`), this new fact is added to working memory and triggers Rule R5 (`suspect = Kennel Cough AND nasal_discharge = true` &rarr; `Bacterial Secondary Risk`).

### C. Backward Chaining (Goal-Driven / Top-Down)
* **How it works:** Starts with a goal or hypothesis (e.g., *"Does this dog have Parvovirus?"*) and works backward to see if the required premises are supported by facts. If a fact is unknown, the system asks the user a targeted question.
* **Real-world analogy:** Like a medical specialist testing a specific suspected diagnosis by ordering targeted lab tests.
* **Backtracking:** If an essential premise evaluates to false, the system refutes the hypothesis and backtracks to evaluate alternative differential hypotheses.

### D. Explainable AI (XAI) vs. Deep Learning
* Deep learning and LLMs operate as statistical "black boxes"—they cannot guarantee correctness and can generate plausible-sounding hallucinations.
* VetAssist provides **100% deterministic explainability**: every diagnosis includes an execution trace showing the exact rule IDs (R1, R2, etc.), matched conditions, and scientific citations.

### E. AI Natural Language Symptom Extractor (Hybrid Layer)
* Bridges free-form human language with structured expert rules.
* Cleans contractions (`can't` &rarr; `cant`, `won't` &rarr; `wont`), removes noise, extracts species context, and maps colloquial phrases (e.g., *"crying in litter box"*, *"pooping blood"*) to formal clinical tokens.

---

## 4. Step-by-Step Demo Script to Show Your Professor (5-Minute Walkthrough)

Here is the exact script and sequence you can use in your lab or presentation:

### Step 1: Open the Application & State the Objective (1 Minute)
> *"Good morning, Professor. Today I am presenting VetAssist, an Explainable AI Veterinary Expert System.*  
> *In veterinary clinical triage, owners often describe symptoms without knowing what disease to test for, while clinics need deterministic, traceable logic.  
> *VetAssist implements two classical AI reasoning paradigms: Data-driven Forward Chaining and Goal-directed Backward Chaining, supported by an NLP clinical extraction layer."*

### Step 2: Forward Chaining & Multi-Hop Reasoning Demo (1.5 Minutes)
1. Navigate to **Symptom Checker** from the sidebar or Home screen.
2. Select **Dog** 🐕.
3. Click the preset **"🐕 Kennel Cough (Dog)"** (or tick `Fever`, `Coughing`, `Lethargy`).
4. Add `Nasal Discharge`.
5. Click **"Diagnose Observed Signs"**.
6. On the **Results** screen, point out:
   * **Primary Diagnosis:** Kennel Cough (Confidence 72%).
   * **The Execution Trace:** Show the numbered trace:
     > *"Professor, notice this: Rule R1 fired on the base symptoms. That derived a new working hypothesis, which immediately caused Rule R5 to chain and fire in multi-hop fashion, warning about secondary bacterial complications. This is an authentic multi-hop inference cycle."*
   * Point out the **Matched vs Missing Signs** badges.

### Step 3: Backward Chaining Live Interactive Demo (1.5 Minutes)
1. Click **Interactive Diagnosis** in the sidebar.
2. Select **Canine Parvoviral Enteritis (Parvovirus)**.
3. Click **"Start Guided Diagnosis"**.
4. Answer the questions:
   * Q1 (Vomiting): Click **Yes**.
   * Q2 (Bloody Diarrhea): Click **Yes**.
   * Q3 (Lethargy): Click **Yes**.
   * Q4 (Unvaccinated): Click **Yes**.
5. Show the resulting **Confirmed Hypothesis** card:
   > *"In backward chaining, the engine was driven entirely by the goal of proving Parvovirus. It prioritized the questions needed to satisfy the antecedent premises of Rule R2, tracking progress live on the checklist."*
6. *(Optional)* Click **"Change Suspected Illness"**, select Parvovirus again, and answer **No** to question 1. Show the **Refutation Screen** and explain backtracking:
   > *"When a critical condition fails, the system refutes the hypothesis and provides immediate 1-click links to evaluate alternative differential diagnoses."*

### Step 4: AI Natural Language Symptom Detective Demo (1 Minute)
1. Return to **Symptom Checker**.
2. In the AI Detective box, type:
   > `My cat can't pee and is crying in the litter box`
3. Click **"Extract Symptoms ✨"** (or press Enter).
4. Point out what happens:
   * The system automatically detected the species is **Cat** and updated the selection.
   * It extracted `straining_to_urinate` and `crying_in_litter_box`.
   * It raised an **Urgent Triage Warning** for feline urinary blockage.
   * Click **"Run Diagnosis on Extracted Signs"** to show instant diagnosis in 1 click!

---

## 5. Anticipated Professor Questions & Exact Answers

#### Q1: "Why did you build a rule-based expert system instead of training a deep learning neural network?"
> **Answer:**  
> *"In medical and veterinary triage, explainability, safety, and deterministic auditability are critical. Deep neural networks and Large Language Models are black boxes prone to hallucinations and unexplainable reasoning. A rule-based expert system guarantees that every inference step is verifiable, reproducible, and strictly grounded in peer-reviewed veterinary literature (Merck Veterinary Manual, ASPCA, AKC)."*

#### Q2: "How is the knowledge base structured?"
> **Answer:**  
> *"The knowledge base is structured as a collection of formalized declarative production rules. Each rule contains: an identifier (`id`), animal species (`pet_type`), antecedent premises (`conditions`), consequent (`conclusion`), derived facts (`derived_fact`), certainty factors (`confidence`), severity classification, literature citations, and a question map for backward chaining interviews."*

#### Q3: "What is Multi-Hop Chaining and how does your engine implement it?"
> **Answer:**  
> *"Multi-hop chaining occurs when the conclusion of one rule produces an intermediate fact that satisfies the premise of another rule in subsequent inference passes. In our engine, forward chaining runs in iterative cycles until a fixpoint is reached where no new rules can fire. For example, Rule R1 establishes `suspect = Kennel Cough`, which is added to Working Memory and subsequently enables Rule R5 (`suspect = Kennel Cough AND nasal_discharge`) to fire."*

#### Q4: "How does the system handle uncertainty?"
> **Answer:**  
> *"We use Certainty Factors (CF) ranging from 0.0 to 1.0, grounded in Kaggle clinical dataset prevalence metrics. When rules fire, the confidence percentage is calculated based on premise coverage and rule certainty factors, clearly distinguishing high-confidence confirmations from partial matches."*

#### Q5: "What prevents the AI NLP extractor from giving wrong symptoms?"
> **Answer:**  
> *"The NLP extractor does not diagnose directly. Instead, it acts as a semantic parser: it normalizes contractions, strips grammatical noise, and maps colloquial phrases into validated domain tokens that must exist in our formal `ALL_SYMPTOMS` knowledge schema. The actual diagnosis is still computed by the deterministic inference engine."*

---

## 6. How to Run the Project Locally

### Prerequisites
* **Node.js** (v18 or higher) and `npm`
* **Python** (3.9+ for running the Python CLI engine and pytest suite)

### Step 1: Clone the Repository
```bash
git clone https://github.com/bhagyeshbhavsar1/ai_project.git
cd ai_project
```

### Step 2: Run the Web Dashboard
```bash
cd web
npm install
npm run dev
```
Open `http://localhost:5173` (or the port displayed in your terminal) in any modern web browser.

### Step 3: Run the Python Engine & Tests
From the project root directory:
```bash
# Run the automated pytest suite (100% pass)
python -m pytest tests/test_engine.py -v

# Run the interactive terminal CLI
python engine/cli.py
```

---

## Summary of Completed Engineering Requirements

| Feature Requirement | Status | Verification Detail |
| :--- | :--- | :--- |
| **Forward Chaining Engine** | ✅ Completed | Iterative fixpoint algorithm with multi-hop derivation trace |
| **Backward Chaining Engine** | ✅ Completed | Goal-directed question wizard with live checklist & backtracking |
| **Explainable AI (XAI)** | ✅ Completed | Numbered execution trace, matched/missing signs, SOAP clinical summary |
| **7 Animal Species Coverage** | ✅ Completed | Dog, Cat, Horse, Rabbit, Bird, Cattle, Sheep |
| **AI NLP Symptom Extractor** | ✅ Completed | Auto-detects species, handles contractions (`can't`, `won't`), 44+ symptom map |
| **Usability & Clean Design** | ✅ Completed | Clear labels, zero pre-selected symptoms, 1-line instructions, disabled state explanations |
| **Full Literature Grounding** | ✅ Completed | Kaggle Datasets, ASPCA, AKC, Merck Veterinary Manual |
| **Unit Test Coverage** | ✅ 100% Pass | Python CLI engine test suite and Vite production bundle build pass |
