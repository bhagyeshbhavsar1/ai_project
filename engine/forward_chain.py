"""
forward_chain.py
================
Forward Chaining Inference Engine for Veterinary Diagnosis.

Reasoning Direction: DATA -> CONCLUSION (Bottom-Up)
Starts from observed symptoms (known facts) and repeatedly applies IF-THEN rules
to infer new diagnoses, severity complications, and clinical recommendations.

Supports:
1. Exact rule firing with multi-hop chained inferences (e.g. R1 -> R5).
2. Transparent reasoning trace explaining step-by-step how conclusion was reached.
3. Differential diagnosis ranking with confidence scoring for partial matches.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Set, Any, Optional
from .rule_loader import Rule, KnowledgeBase


@dataclass
class FiredRuleRecord:
    """Detailed log record of a rule that fired during inference."""
    step: int
    rule_id: str
    rule_name: str
    rule_statement: str
    matched_conditions: List[str]
    conclusion: str
    derived_fact: str
    confidence: float
    explanation: str


@dataclass
class DiagnosisCandidate:
    """Diagnosis candidate ranked by certainty."""
    condition_name: str
    confidence_pct: int
    is_confirmed: bool
    matching_symptoms: List[str]
    missing_symptoms: List[str]
    primary_rule: Rule
    fired_rule_chain: List[str]
    recommended_actions: List[str]
    severity: str
    explanation: str


@dataclass
class ForwardChainingResult:
    """Complete output of forward chaining reasoning."""
    pet_type: str
    initial_symptoms: List[str]
    all_derived_facts: Set[str]
    fired_rules: List[FiredRuleRecord]
    ranked_diagnoses: List[DiagnosisCandidate]
    reasoning_steps: List[str]
    primary_diagnosis: Optional[DiagnosisCandidate] = None


class ForwardChainingEngine:
    """
    Executes forward chaining inference over a given KnowledgeBase.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def infer(self, pet_type: str, known_symptoms: List[str]) -> ForwardChainingResult:
        """
        Execute forward chaining given a pet species and a list of observed symptoms.

        Algorithm:
        1. Initialize working memory with known symptoms.
        2. Loop until no new rules can fire:
            For each rule applicable to this pet:
                If rule has not already fired AND all its conditions are in working memory:
                    Fire rule!
                    Add rule's conclusion & derived_fact to working memory.
                    Log the firing step.
        3. Rank all candidate diagnoses (both fully fired rules and high partial-matches).
        4. Return complete transparent result object.
        """
        # Clean and normalize input facts
        cleaned_pet = pet_type.lower().strip()
        working_memory: Set[str] = {s.strip().lower() for s in known_symptoms if s.strip()}
        initial_facts = set(working_memory)

        applicable_rules = self.kb.filter_by_pet(cleaned_pet)
        fired_records: List[FiredRuleRecord] = []
        already_fired_ids: Set[str] = set()
        reasoning_trace: List[str] = []

        reasoning_trace.append(f"Starting forward chaining with {len(working_memory)} initial facts: {sorted(working_memory)}")

        step_counter = 1
        changed = True

        # Main Forward Chaining loop
        while changed:
            changed = False
            for rule in applicable_rules:
                if rule.id in already_fired_ids:
                    continue

                # Check if all conditions of the rule exist in working memory
                rule_conditions_set = {c.lower().strip() for c in rule.conditions}
                if rule_conditions_set.issubset(working_memory):
                    # Fire this rule
                    already_fired_ids.add(rule.id)
                    changed = True

                    # Add new derived knowledge into working memory
                    working_memory.add(rule.conclusion.lower().strip())
                    working_memory.add(rule.derived_fact.lower().strip())

                    record = FiredRuleRecord(
                        step=step_counter,
                        rule_id=rule.id,
                        rule_name=rule.name,
                        rule_statement=rule.format_rule_statement(),
                        matched_conditions=rule.conditions,
                        conclusion=rule.conclusion,
                        derived_fact=rule.derived_fact,
                        confidence=rule.confidence,
                        explanation=rule.explanation
                    )
                    fired_records.append(record)

                    trace_msg = (
                        f"Step {step_counter}: Rule {rule.id} FIRED -> Condition [{', '.join(rule.conditions)}] satisfied. "
                        f"Derived: '{rule.conclusion}' with confidence {int(rule.confidence * 100)}%."
                    )
                    reasoning_trace.append(trace_msg)
                    step_counter += 1

        if not fired_records:
            reasoning_trace.append("No rules fired completely with current symptom set.")

        # Differential Diagnosis Candidate ranking
        ranked_diagnoses = self._calculate_differential_ranking(
            applicable_rules=applicable_rules,
            initial_facts=initial_facts,
            working_memory=working_memory,
            fired_records=fired_records
        )

        primary = ranked_diagnoses[0] if ranked_diagnoses else None

        return ForwardChainingResult(
            pet_type=cleaned_pet,
            initial_symptoms=sorted(initial_facts),
            all_derived_facts=working_memory,
            fired_rules=fired_records,
            ranked_diagnoses=ranked_diagnoses,
            reasoning_steps=reasoning_trace,
            primary_diagnosis=primary
        )

    def _calculate_differential_ranking(
        self,
        applicable_rules: List[Rule],
        initial_facts: Set[str],
        working_memory: Set[str],
        fired_records: List[FiredRuleRecord]
    ) -> List[DiagnosisCandidate]:
        """
        Rank conditions for veterinary triage.
        Rules that fired completely receive their full confidence score.
        Rules with partial condition matches receive proportional confidence.
        """
        candidates: Dict[str, DiagnosisCandidate] = {}
        fired_ids = {f.rule_id for f in fired_records}

        for rule in applicable_rules:
            # Skip pure secondary fact rules from appearing as primary disease headers
            if rule.id in ("R5", "R15"):
                continue

            cond_set = {c.lower().strip() for c in rule.conditions if not c.startswith("suspect =")}
            if not cond_set:
                continue

            matched = [c for c in rule.conditions if c.lower().strip() in working_memory]
            missing = [c for c in rule.conditions if c.lower().strip() not in working_memory]
            match_ratio = len(matched) / max(len(rule.conditions), 1)

            if rule.id in fired_ids:
                # 100% matched rule
                conf_pct = int(rule.confidence * 100)
                is_confirmed = True
            elif match_ratio >= 0.5:
                # Significant partial match: scale confidence by match proportion
                conf_pct = int(rule.confidence * match_ratio * 100)
                is_confirmed = False
            else:
                continue

            # Check if any chained rules enhanced this diagnosis
            chains = [f.rule_statement for f in fired_records if f.conclusion == rule.conclusion or f.rule_id == rule.id]
            if not chains and rule.id in fired_ids:
                chains.append(rule.format_rule_statement())

            candidate = DiagnosisCandidate(
                condition_name=rule.conclusion,
                confidence_pct=conf_pct,
                is_confirmed=is_confirmed,
                matching_symptoms=matched,
                missing_symptoms=missing,
                primary_rule=rule,
                fired_rule_chain=chains if chains else [rule.format_rule_statement()],
                recommended_actions=rule.recommended_actions,
                severity=rule.severity,
                explanation=rule.explanation
            )

            # Keep highest score if duplicate conclusion exists
            if rule.conclusion not in candidates or candidates[rule.conclusion].confidence_pct < conf_pct:
                candidates[rule.conclusion] = candidate

        # Sort descending by confidence percentage
        sorted_candidates = sorted(candidates.values(), key=lambda c: c.confidence_pct, reverse=True)
        return sorted_candidates
