# Project Bible
## Veterinary Symptom Diagnosis Expert System using Forward and Backward Chaining

---

## 1. The Problem We Are Solving

Pet owners often notice symptoms in their dog or cat (fever, vomiting, coughing, limping, etc.) but don't know whether it's something minor or something urgent. They usually either panic and rush to the vet unnecessarily, or ignore something serious because they don't recognize the pattern.

**Our system solves this by acting like a first-level triage assistant** — it takes in symptoms, reasons over a knowledge base of vet-informed rules, and gives a likely diagnosis (or shortlist of possibilities) along with an explanation of *why* it thinks so.

**Important scope note (say this in your report + demo):**
This is an **educational rule-based AI system**, not a replacement for a real veterinarian. It demonstrates forward and backward chaining inference — the medical accuracy is illustrative, not clinical-grade. Always include a disclaimer in the UI: *"This tool is for educational purposes only. Consult a licensed veterinarian for actual diagnosis and treatment."*

### Why this problem is a good fit for the assignment
- It requires **real reasoning over rules**, not just a lookup table — this is what forward/backward chaining is *for*.
- The domain (common pet ailments) has a small, well-documented rule set, so it stays achievable in a few weeks.
- It's niche enough (pets, not humans) that it won't look like every other "medical diagnosis" project in the class.

---

## 2. What We're Actually Building

A system with **two reasoning modes**, both operating over the same knowledge base of rules:

### A. Forward Chaining ("data → conclusion")
- User provides a list of known symptoms upfront (checkbox form).
- Engine scans all rules, finds which ones match, and *chains* — if firing one rule produces a fact that satisfies the condition of another rule, that rule fires too.
- Ends when no more rules can fire. Outputs all diagnoses reached, with the chain of rules that led there (for explainability).

**Use case in the demo:** "I know my dog has fever, vomiting, and lethargy — what's wrong?"

### B. Backward Chaining ("goal → data")
- System starts with a hypothesis (a specific disease, e.g., Parvovirus) and works backward to check if the known facts support it.
- If it doesn't have enough facts, it actively **asks the user follow-up questions** one at a time until the hypothesis is confirmed, denied, or inconclusive.

**Use case in the demo:** System asks: *"Does your dog have bloody diarrhea?"* → No → *"Is your dog vaccinated?"* → Yes → *"Then Parvo is unlikely, let's check Kennel Cough instead."* This is the more impressive, interactive part to show live.

---

## 3. Knowledge Base Design

The knowledge base is a set of `IF-THEN` rules. Example structure:

```
Rule ID: R1
IF: fever AND coughing AND lethargy
THEN: suspect = "Kennel Cough"
Confidence: 0.7

Rule ID: R2
IF: vomiting AND bloody_diarrhea AND lethargy AND unvaccinated
THEN: suspect = "Parvovirus"
Confidence: 0.85

Rule ID: R3
IF: excessive_scratching AND hair_loss AND red_skin
THEN: suspect = "Flea Allergy Dermatitis"
Confidence: 0.75

Rule ID: R4
IF: limping AND swelling AND recent_activity
THEN: suspect = "Sprain/Soft Tissue Injury"
Confidence: 0.6

Rule ID: R5
IF: suspect = "Kennel Cough" AND nasal_discharge
THEN: severity = "Moderate - Vet visit recommended"
```

Notice **R5 chains off R1's conclusion** — this is what makes forward chaining meaningful (a derived fact feeding into another rule), not just a flat if-else.

**Target size:** 20–30 rules covering 8–10 common conditions (kennel cough, parvo, fleas/ticks, ear infection, upset stomach, allergies, minor injury, dehydration, etc.) is enough for a solid demo — don't over-engineer this.

**Where to get real data:** Vet extension sites, ASPCA / AKC symptom guides, veterinary teaching hospital public symptom checklists. One team member should compile this into a spreadsheet (Symptom | Disease | Confidence) before anyone writes code — this is the "research" part that can't be skipped or faked.

---

## 4. Tech Stack

Keep this simple — you don't need heavy frameworks for a 20-30 rule system.

| Layer | Recommended Tech | Why |
|---|---|---|
| Core language | **Python** | Easiest to hand-write a rule engine, huge community support, fast to debug |
| Rule storage | **JSON or Python dicts/CSV** | Simple, human-readable, easy to edit without touching code |
| Inference engine | Hand-written (no framework needed) | A basic forward/backward chaining loop is ~100–150 lines; frameworks like CLIPS/Pyke add overhead you don't need for this scale |
| Interface | **Streamlit** (recommended) or plain HTML/Flask | Streamlit lets you build a clickable, polished-looking demo UI in under an hour, no frontend experience needed |
| Version control | **GitHub** | For team collaboration + to show commit history as proof of individual contribution |
| Documentation | Markdown / Word report | For your final submission and viva |

**If Streamlit feels unfamiliar:** a plain command-line version is 100% acceptable too — professors care more about the reasoning logic being correct than a fancy UI. Don't burn time on UI polish before the engine works.

---

## 5. How the Codebase Should Look

```
vet-diagnosis-expert-system/
│
├── data/
│   └── rules.json          # The knowledge base — all IF-THEN rules
│
├── engine/
│   ├── __init__.py
│   ├── forward_chain.py    # Forward chaining logic
│   ├── backward_chain.py   # Backward chaining logic
│   └── rule_loader.py      # Loads & parses rules.json into usable objects
│
├── ui/
│   └── app.py               # Streamlit (or Flask) interface
│
├── tests/
│   └── test_engine.py       # A few sanity tests: does R1 fire correctly given symptoms?
│
├── docs/
│   ├── report.md             # Final write-up: problem, approach, results
│   └── rule_sources.md       # Where each rule's data came from (for credibility)
│
├── README.md
└── requirements.txt
```

### Example: what `rules.json` looks like
```json
[
  {
    "id": "R1",
    "conditions": ["fever", "coughing", "lethargy"],
    "conclusion": "Kennel Cough",
    "confidence": 0.7
  },
  {
    "id": "R2",
    "conditions": ["vomiting", "bloody_diarrhea", "lethargy", "unvaccinated"],
    "conclusion": "Parvovirus",
    "confidence": 0.85
  }
]
```

### Example: forward chaining pseudocode
```python
def forward_chain(known_facts, rules):
    derived = set(known_facts)
    fired = []
    changed = True
    while changed:
        changed = False
        for rule in rules:
            if set(rule["conditions"]).issubset(derived) and rule["conclusion"] not in derived:
                derived.add(rule["conclusion"])
                fired.append(rule)
                changed = True
    return derived, fired
```

### Example: backward chaining pseudocode
```python
def backward_chain(goal, rules, known_facts, ask_user):
    rule = find_rule_with_conclusion(goal, rules)
    if not rule:
        return False
    for condition in rule["conditions"]:
        if condition not in known_facts:
            answer = ask_user(condition)   # asks user yes/no
            if not answer:
                return False
            known_facts.add(condition)
    return True
```

These are simplified — I can help flesh out the full working versions when your team is ready to start coding.

---

## 6. Suggested Team Role Split (3-4 members)

| Role | Responsibility |
|---|---|
| **Member 1 – Knowledge Engineer** | Research real vet symptom-disease data, build and document `rules.json`, write `docs/rule_sources.md` |
| **Member 2 – Forward Chaining Dev** | Build and test `forward_chain.py`, handle chained rule firing correctly |
| **Member 3 – Backward Chaining Dev** | Build and test `backward_chain.py`, design the question-asking flow |
| **Member 4 – UI/Integration + Docs** | Build the Streamlit/Flask interface, wire it to the engine, write the final report and prepare the demo script |

*(If only 3 members, merge Member 3 and 4's roles, or split UI + docs between two people.)*

---

## 7. Evaluation / What to Show in the Demo

1. **Forward chaining demo:** Enter a full symptom list → show diagnosis + explain which rules fired and in what order (this "explainability" is a big plus point to mention).
2. **Backward chaining demo:** Pick a hypothesis → show the system asking questions live and narrowing down.
3. **Edge case:** Show a case where symptoms don't match any rule confidently → system says "inconclusive, consult a vet" (shows you handled the "no answer" case, which examiners like to see).
4. **Explain the rule base briefly** — where the data came from, why you picked these conditions.

---

## 8. Rough Timeline (adjust to your deadline)

| Week | Task |
|---|---|
| 1 | Finalize rule base (research + write 20-30 rules), set up GitHub repo |
| 2 | Build forward chaining engine + basic tests |
| 3 | Build backward chaining engine + basic tests |
| 4 | Build UI, integrate everything, write report, rehearse demo |

---

## 9. One-Line Summary (for your abstract/spreadsheet if needed)

> A rule-based expert system that diagnoses common canine and feline ailments using forward chaining (symptom-to-diagnosis) and backward chaining (goal-driven questioning), built to demonstrate classical AI inference techniques on a real-world veterinary triage problem.
