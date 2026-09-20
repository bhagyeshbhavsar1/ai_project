# Veterinary Diagnosis Expert System (VetAssist) - Project Report

## 1. Executive Summary
**VetAssist** is an educational, rule-based artificial intelligence expert system designed for first-level veterinary triage of common canine and feline health conditions. It implements two foundational paradigms of classical artificial intelligence inference:
1. **Forward Chaining (Data $\rightarrow$ Conclusion)**: Deductive inference starting from known symptoms to derive candidate diseases, chained complications, and clinical action recommendations.
2. **Backward Chaining (Goal $\rightarrow$ Data)**: Diagnostic inquiry starting from a candidate condition hypothesis, querying the user interactively with clinical rationales, and backtracking if symptoms are refuted.

---

## 2. Architecture & System Design

```
+-------------------------------------------------------------------------+
|                              VetAssist UI                               |
|   - Screen 1: Dashboard & Animated Project Showcase                     |
|   - Screen 2: Forward Chaining Symptom Checker                          |
|   - Screen 3: Backward Chaining Interactive Diagnosis                   |
|   - Screen 4: Ranked Results & Explanatory Reasoning Path               |
+------------------------------------+------------------------------------+
                                     |
                                     v
+------------------------------------+------------------------------------+
|                         Inference Engine                                |
|  +-----------------------------+     +-------------------------------+  |
|  |   Forward Chaining Engine   |     |    Backward Chaining Engine   |  |
|  |  (Working Memory & Chaining)|     |   (Goal Decomposition & Q&A)  |  |
|  +-----------------------------+     +-------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                      Knowledge Base (rules.json)                        |
|  - 20+ Curated IF-THEN Rules across Dogs & Cats                         |
|  - Multi-hop Chained Rules (e.g., R1 -> R5 Secondary Complications)     |
|  - Certainty Factors & Clinical Triage Severity Levels                  |
+-------------------------------------------------------------------------+
```

### 2.1 Forward Chaining Mechanism
- **Working Memory**: Initialized with set of observed symptoms.
- **Rule Matching**: Iteratively evaluates IF conditions against working memory.
- **Fact Derivation**: When all conditions of a rule are met, its conclusion and derived facts (e.g. `suspect = Kennel Cough`) are asserted into working memory.
- **Multi-Hop Chaining**: Subsequent rules (such as `R5: IF suspect = Kennel Cough AND nasal_discharge THEN severity = Moderate to High`) fire automatically on derived facts.
- **Explainability**: Every fired rule creates an audit record detailing the exact firing step, premises satisfied, and clinical explanation.

### 2.2 Backward Chaining Mechanism
- **Hypothesis Evaluation**: Starts with a goal disease (e.g. `Parvovirus`).
- **Decomposition**: Identifies prerequisite symptoms required by the matching rule.
- **Interactive Questioning**: If a condition is not yet in working memory, it queries the pet owner with contextual clinical explanation ("Why are we asking this?").
- **Backtracking**: If a crucial premise is denied (e.g. bloody diarrhea = NO), the goal is refuted and the engine backtracks to search alternative hypotheses that share any confirmed facts.

---

## 3. Knowledge Base Summary
The knowledge base comprises 20 rules covering:
- **Canine Conditions**: Kennel Cough, Parvovirus, Canine Influenza, Canine Lyme Disease, Gastric Dilatation-Volvulus (GDV / Bloat), Acute Pancreatitis, Sarcoptic Mange.
- **Feline Conditions**: Feline Upper Respiratory Infection (URI / FHV-1), Feline Lower Urinary Tract Disease (FLUTD), Feline Hairball Obstruction, Feline Ear Mite Infestation.
- **Cross-Species Conditions**: Flea Allergy Dermatitis, Sprain & Soft Tissue Injury, Acute Gastroenteritis (Dietary Indiscretion), Otitis Externa, Conjunctivitis, Heatstroke, Systemic Dehydration.

---

## 4. Evaluation and Verification Results
- **Automated Tests**: Unit tests in `tests/test_engine.py` verify rule parsing, forward chaining single and multi-hop execution, backward chaining question resolution, hypothesis refutation with alternative suggestion, and inconclusive handling.
- **Explainability**: Both engines output human-readable reasoning traces, fulfilling academic criteria for rule-based transparent reasoning.
