"""
cli.py
======
Interactive Command-Line Interface for the Veterinary Diagnosis Expert System.
Allows testing both Forward Chaining and Backward Chaining inference directly.

Usage:
    python engine/cli.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from engine.rule_loader import load_rules_from_file
from engine.forward_chain import ForwardChainingEngine
from engine.backward_chain import BackwardChainingEngine, DiagnosticQuestion


def print_banner():
    print("=" * 65)
    print("    VetAssist - Veterinary Symptom Diagnosis Expert System")
    print("        Forward & Backward Chaining Rule-Based AI")
    print("=" * 65)
    print("Disclaimer: For educational use only. Not a veterinary replacement.\n")


def run_forward_demo(engine: ForwardChainingEngine):
    print("\n--- FORWARD CHAINING MODE (Data -> Conclusion) ---")
    pet = input("Select pet type (dog/cat) [dog]: ").strip().lower() or "dog"
    print("\nEnter symptoms separated by commas (e.g., 'fever, coughing, lethargy'):")
    symptom_input = input("> ").strip()
    if not symptom_input:
        symptom_input = "fever, coughing, lethargy"
        print(f"Using default demo input: '{symptom_input}'")

    symptoms = [s.strip().replace(" ", "_") for s in symptom_input.split(",") if s.strip()]

    result = engine.infer(pet_type=pet, known_symptoms=symptoms)

    print("\n" + "=" * 50)
    print(f"DIAGNOSIS RESULTS FOR {pet.upper()}")
    print("=" * 50)

    print("\n[Reasoning Trace]")
    for step in result.reasoning_steps:
        print(f"  • {step}")

    print("\n[Differential Diagnosis Ranking]")
    for rank, diag in enumerate(result.ranked_diagnoses, start=1):
        status = "CONFIRMED" if diag.is_confirmed else "PARTIAL MATCH"
        print(f"  {rank}. {diag.condition_name} ({diag.confidence_pct}%) [{status}]")
        print(f"     Matched: {diag.matching_symptoms} | Missing: {diag.missing_symptoms}")

    if result.primary_diagnosis:
        p = result.primary_diagnosis
        print(f"\n[Most Likely Condition]: {p.condition_name} (Confidence: {p.confidence_pct}%)")
        print(f"Severity: {p.severity}")
        print(f"Clinical Explanation: {p.explanation}")
        print("\nTriggered Rule Chains:")
        for r_stmt in p.fired_rule_chain:
            print(f"  --> {r_stmt}")
        print("\nRecommended Actions:")
        for act in p.recommended_actions:
            print(f"  * {act}")
    else:
        print("\n[Result]: Inconclusive. No rules fired. Consult a licensed veterinarian.")


def run_backward_demo(engine: BackwardChainingEngine):
    print("\n--- BACKWARD CHAINING MODE (Goal -> Data) ---")
    pet = input("Select pet type (dog/cat) [dog]: ").strip().lower() or "dog"
    print("\nEnter hypothesis disease to verify (e.g., 'Kennel Cough', 'Parvovirus'):")
    hypothesis = input("> ").strip() or "Parvovirus"

    def ask_user(q: DiagnosticQuestion) -> bool:
        print(f"\n[Question {q.step_number}/{q.total_steps}]: {q.question_text}")
        print(f"  Why asking: {q.clinical_rationale}")
        ans = input("  Answer (y/n/skip) [y]: ").strip().lower()
        return ans in ("y", "yes", "")

    result = engine.evaluate_hypothesis(
        pet_type=pet,
        hypothesis_disease=hypothesis,
        ask_user_callback=ask_user
    )

    print("\n" + "=" * 50)
    print(f"BACKWARD CHAINING VERIFICATION: {result.hypothesis}")
    print("=" * 50)
    print(f"Status: {result.status} (Confidence: {result.confidence_pct}%)")
    print("\n[Reasoning Trace]")
    for step in result.reasoning_trace:
        print(f"  • {step}")

    if result.status == "CONFIRMED" and result.rule_fired:
        print(f"\nRule {result.rule_fired.id} Proved:")
        print(f"  {result.rule_fired.format_rule_statement()}")
        print("\nRecommended Actions:")
        for act in result.recommended_actions:
            print(f"  * {act}")
    elif result.alternative_hypotheses:
        print(f"\nAlternative Hypotheses to explore: {result.alternative_hypotheses}")


def main():
    print_banner()
    rules_path = PROJECT_ROOT / "data" / "rules.json"
    kb = load_rules_from_file(str(rules_path))
    fc_engine = ForwardChainingEngine(kb)
    bc_engine = BackwardChainingEngine(kb)

    while True:
        print("\nChoose an option:")
        print("1. Run Forward Chaining Demo (Symptom -> Diagnosis)")
        print("2. Run Backward Chaining Demo (Hypothesis -> Questioning)")
        print("3. Exit")
        choice = input("\nEnter selection (1-3): ").strip()
        if choice == "1":
            run_forward_demo(fc_engine)
        elif choice == "2":
            run_backward_demo(bc_engine)
        elif choice == "3":
            print("\nExiting VetAssist. Goodbye!")
            break
        else:
            print("Invalid choice, please select 1, 2, or 3.")


if __name__ == "__main__":
    main()
