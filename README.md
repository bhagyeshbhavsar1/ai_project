# VetAssist: Veterinary Symptom Diagnosis Expert System

> **Rule-Based Artificial Intelligence with Forward and Backward Chaining**  
> Educational veterinary triage assistant for canine and feline symptom assessment.

📚 **[Click Here for Full Dashboard Guide & Professor Presentation Walkthrough](HOW_TO_USE_DASHBOARD_AND_EXPLAIN_TO_PROFESSOR.md)** (Explains everything in simple, easy-to-understand language + includes 5-minute presentation script and Q&A answers).

---

## Features
- **Two Classical AI Reasoning Paradigms**:
  - **Forward Chaining (`Data -> Conclusion`)**: Evaluates observed symptoms upfront, chains secondary complications (multi-hop derivation), and ranks differential diagnoses with confidence scores.
  - **Backward Chaining (`Goal -> Data`)**: Starts with a disease hypothesis, interactively interviews the user with clinical rationales, and backtracks to alternatives if refuted.
- **Explainable AI (XAI)**: Full step-by-step reasoning trace displaying fired rules, premise verification, and veterinary clinical rationales.
- **Modern Interactive Dashboard**:
  - Upper-left **hamburger menu** toggles the navigation sidebar cleanly (clean header without redundant logos).
  - **Animated hero carousel** with sliding project overviews and pet care highlights.
  - Complete 4-screen workflow: **Home**, **Symptom Checker**, **Interactive Diagnosis**, and **Diagnosis Results**.
  - **Diagnosis History** and searchable **Knowledge Base Explorer**.

---

## Directory Structure
```
vet-diagnosis-expert-system/
├── data/
│   └── rules.json            # Knowledge base of 20+ veterinary IF-THEN rules
├── engine/
│   ├── __init__.py           # Package init
│   ├── rule_loader.py        # Rule and KnowledgeBase classes
│   ├── forward_chain.py      # Forward chaining engine with multi-hop trace
│   ├── backward_chain.py     # Backward chaining engine with interactive queries
│   └── cli.py                # Terminal interactive demo
├── tests/
│   └── test_engine.py        # Pytest test suite (100% passing)
├── docs/
│   ├── report.md             # Project architecture and evaluation report
│   └── rule_sources.md       # Literature citations (ASPCA, AKC, Merck Vet)
├── web/                      # Interactive Web Application
│   ├── index.html
│   ├── package.json
│   └── src/
├── requirements.txt
└── README.md
```

---

## Quick Start

### 1. Python CLI & Unit Tests
```bash
# Run automated test suite
python -m pytest tests/test_engine.py -v

# Run interactive terminal demo
python engine/cli.py
```

### 2. Web Dashboard
```bash
cd web
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Disclaimer
*This system is developed strictly for educational and illustrative purposes to demonstrate classical expert system inference. It is NOT a substitute for professional veterinary advice, diagnosis, or clinical treatment.*
