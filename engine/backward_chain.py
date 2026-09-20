"""
backward_chain.py
=================
Backward Chaining Inference Engine for Veterinary Diagnosis.

Reasoning Direction: GOAL -> DATA (Top-Down)
Starts with a target diagnostic hypothesis (e.g. "Parvovirus" or "Kennel Cough")
and works backward to determine what evidence is required to prove it.

Features:
1. Goal decomposition: breaks hypotheses down into sub-goal condition checks.
2. Interactive query generator: formulates natural language clinical questions
   with contextual clinical explanations ("Why are we asking this?").
3. Backtracking: if a hypothesis is refuted by negative evidence, the engine
   gracefully pivots to alternative differential diagnoses.
4. Step-by-step stateful interface suitable for both CLI and Web frontends.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional, Callable, Tuple
from .rule_loader import Rule, KnowledgeBase


@dataclass
class DiagnosticQuestion:
    """Represents an interactive question presented to the user during backward chaining."""
    step_number: int
    total_steps: int
    condition_key: str
    target_hypothesis: str
    question_text: str
    clinical_rationale: str
    rule_id: str
    options: List[str] = field(default_factory=lambda: ["Yes", "No", "Not sure"])


@dataclass
class BackwardChainingResult:
    """Outcome of backward chaining diagnostic inquiry."""
    hypothesis: str
    status: str  # 'CONFIRMED', 'REFUTED', 'INCONCLUSIVE'
    confidence_pct: int
    proven_conditions: List[str]
    disproven_conditions: List[str]
    rule_fired: Optional[Rule]
    reasoning_trace: List[str]
    recommended_actions: List[str]
    alternative_hypotheses: List[str]
    explanation: str


class BackwardChainingEngine:
    """
    Executes goal-driven backward chaining.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def evaluate_hypothesis(
        self,
        pet_type: str,
        hypothesis_disease: str,
        known_facts: Optional[Dict[str, bool]] = None,
        ask_user_callback: Optional[Callable[[DiagnosticQuestion], bool]] = None
    ) -> BackwardChainingResult:
        """
        Evaluate a specific hypothesis disease using backward chaining.
        If conditions are unknown, queries the user via ask_user_callback.
        """
        pet = pet_type.lower().strip()
        facts: Dict[str, bool] = dict(known_facts) if known_facts else {}
        candidate_rules = self.kb.find_rules_by_conclusion(hypothesis_disease)

        # Filter to pet applicable rules
        matching_rules = [r for r in candidate_rules if r.is_applicable_to_pet(pet)]

        if not matching_rules:
            return BackwardChainingResult(
                hypothesis=hypothesis_disease,
                status="INCONCLUSIVE",
                confidence_pct=0,
                proven_conditions=[],
                disproven_conditions=[],
                rule_fired=None,
                reasoning_trace=[f"No diagnostic rules in knowledge base for hypothesis '{hypothesis_disease}' in {pet}."],
                recommended_actions=["Consult a veterinarian for tailored clinical workup."],
                alternative_hypotheses=[],
                explanation=f"No knowledge base entries for {hypothesis_disease}."
            )

        reasoning_trace: List[str] = [
            f"Goal established: Prove or disprove hypothesis '{hypothesis_disease}' for {pet}."
        ]

        target_rule = matching_rules[0]
        proven: List[str] = []
        disproven: List[str] = []
        total_conditions = len(target_rule.conditions)

        reasoning_trace.append(
            f"Evaluating Rule {target_rule.id}: requires conditions {target_rule.conditions}."
        )

        for idx, cond in enumerate(target_rule.conditions, start=1):
            cond_key = cond.lower().strip()

            # If condition is already known in facts
            if cond_key in facts:
                if facts[cond_key]:
                    proven.append(cond_key)
                    reasoning_trace.append(f"Condition '{cond_key}' verified TRUE from prior facts.")
                else:
                    disproven.append(cond_key)
                    reasoning_trace.append(f"Condition '{cond_key}' verified FALSE from prior facts.")
                    break
            elif ask_user_callback:
                # Generate question
                q_text = target_rule.question_map.get(
                    cond,
                    f"Does your {pet} show symptoms of {cond.replace('_', ' ')}?"
                )
                rationale = (
                    f"This question helps confirm or rule out {target_rule.conclusion}, "
                    f"which commonly presents with {cond.replace('_', ' ')}."
                )

                question = DiagnosticQuestion(
                    step_number=idx,
                    total_steps=total_conditions,
                    condition_key=cond_key,
                    target_hypothesis=target_rule.conclusion,
                    question_text=q_text,
                    clinical_rationale=rationale,
                    rule_id=target_rule.id
                )

                user_answer = ask_user_callback(question)
                facts[cond_key] = user_answer
                if user_answer:
                    proven.append(cond_key)
                    reasoning_trace.append(f"User confirmed '{cond_key}' -> Added to working memory as TRUE.")
                else:
                    disproven.append(cond_key)
                    reasoning_trace.append(f"User denied '{cond_key}' -> Sub-goal failed.")
                    break
            else:
                # Callback not provided; cannot resolve condition
                reasoning_trace.append(f"Condition '{cond_key}' is UNKNOWN (no query handler).")
                disproven.append(cond_key)
                break

        # Check outcome
        if len(proven) == len(target_rule.conditions):
            status = "CONFIRMED"
            conf = int(target_rule.confidence * 100)
            reasoning_trace.append(f"All conditions satisfied! Rule {target_rule.id} FIRES -> '{target_rule.conclusion}' CONFIRMED.")
            return BackwardChainingResult(
                hypothesis=target_rule.conclusion,
                status=status,
                confidence_pct=conf,
                proven_conditions=proven,
                disproven_conditions=disproven,
                rule_fired=target_rule,
                reasoning_trace=reasoning_trace,
                recommended_actions=target_rule.recommended_actions,
                alternative_hypotheses=[],
                explanation=target_rule.explanation
            )
        else:
            # Hypothesis refuted: find alternative hypotheses that share any proven conditions
            alternatives = self._find_alternatives(pet, proven, target_rule.conclusion)
            status = "REFUTED"
            reasoning_trace.append(f"Hypothesis '{hypothesis_disease}' REFUTED due to lack of '{', '.join(disproven)}'.")
            if alternatives:
                reasoning_trace.append(f"Backtracking to alternative hypotheses: {', '.join(alternatives)}")

            return BackwardChainingResult(
                hypothesis=target_rule.conclusion,
                status=status,
                confidence_pct=20 if proven else 0,
                proven_conditions=proven,
                disproven_conditions=disproven,
                rule_fired=None,
                reasoning_trace=reasoning_trace,
                recommended_actions=["Consider veterinary examination for alternative differential diagnoses."],
                alternative_hypotheses=alternatives,
                explanation=f"Hypothesis {target_rule.conclusion} could not be confirmed."
            )

    def _find_alternatives(self, pet: str, proven_facts: List[str], current_goal: str) -> List[str]:
        """Find alternative conditions that match at least one of the already proven facts."""
        alternatives = set()
        for r in self.kb.filter_by_pet(pet):
            if r.conclusion.lower() == current_goal.lower():
                continue
            r_conds = {c.lower() for c in r.conditions}
            if any(p in r_conds for p in proven_facts):
                alternatives.add(r.conclusion)
        return sorted(alternatives)

    def generate_question_sequence(self, pet_type: str, candidate_goals: Optional[List[str]] = None) -> List[DiagnosticQuestion]:
        """
        Generates the standard ordered sequence of questions for interactive backward chaining
        (used by the web interactive diagnosis wizard).
        """
        pet = pet_type.lower().strip()
        rules = self.kb.filter_by_pet(pet)

        if candidate_goals:
            rules = [r for r in rules if any(g.lower() in r.conclusion.lower() for g in candidate_goals)]

        # Focus on prominent diagnostic rules (Parvovirus, Kennel Cough, FLUTD, Gastroenteritis, etc.)
        ordered_questions: List[DiagnosticQuestion] = []
        seen_conditions: Set[str] = set()

        for rule in rules:
            for cond in rule.conditions:
                if cond in seen_conditions or cond.startswith("suspect ="):
                    continue
                seen_conditions.add(cond)

                q_text = rule.question_map.get(
                    cond,
                    f"Does your {pet} show symptoms of {cond.replace('_', ' ')}?"
                )
                rationale = (
                    f"This question helps confirm or rule out {rule.conclusion}, "
                    f"which commonly presents with {cond.replace('_', ' ')}."
                )

                ordered_questions.append(
                    DiagnosticQuestion(
                        step_number=len(ordered_questions) + 1,
                        total_steps=5,  # Will be recalculated
                        condition_key=cond,
                        target_hypothesis=rule.conclusion,
                        question_text=q_text,
                        clinical_rationale=rationale,
                        rule_id=rule.id
                    )
                )

        # Recalculate total steps
        total = len(ordered_questions)
        for q in ordered_questions:
            q.total_steps = total

        return ordered_questions
