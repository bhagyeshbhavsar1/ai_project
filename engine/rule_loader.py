"""
rule_loader.py
==============
Loads and structures veterinary diagnostic rules from JSON format.
Ensures human-readable rule objects that can be parsed by both
forward and backward chaining inference engines.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Dict, Optional, Set, Any


@dataclass
class Rule:
    """
    Represents an IF-THEN expert rule.

    Attributes:
        id: Unique identifier (e.g. 'R1', 'R2')
        name: Descriptive human name
        pet_type: 'dog', 'cat', or 'both'
        conditions: List of prerequisite conditions (premises) that must all be satisfied (AND logic)
        conclusion: Disease or assessment reached when all conditions are met
        derived_fact: Fact string added to working memory upon firing
        confidence: Certainty factor from 0.0 to 1.0
        severity: Clinical urgency / triage level
        explanation: Human-readable veterinary rationale explaining why this conclusion follows
        supportive_signs: Secondary symptoms that increase clinical suspicion
        recommended_actions: Immediate next steps for the pet owner
        question_map: Mapping of condition tokens to friendly natural language questions
    """
    id: str
    name: str
    pet_type: str
    conditions: List[str]
    conclusion: str
    derived_fact: str
    confidence: float
    severity: str
    explanation: str
    supportive_signs: List[str] = field(default_factory=list)
    recommended_actions: List[str] = field(default_factory=list)
    question_map: Dict[str, str] = field(default_factory=dict)

    def is_applicable_to_pet(self, pet: str) -> bool:
        """Check if rule applies to the given pet species ('dog' or 'cat')."""
        target = pet.lower().strip()
        return self.pet_type.lower() in ("both", target)

    def format_rule_statement(self) -> str:
        """Returns standard IF-THEN rule representation."""
        premises = " AND ".join(self.conditions)
        return f"IF {premises} THEN suspect = {self.conclusion}"


class KnowledgeBase:
    """
    Stores and queries the collection of veterinary rules.
    """

    def __init__(self, rules: List[Rule]):
        self.rules = rules
        self._rules_by_id = {r.id: r for r in rules}
        self._rules_by_conclusion = {}
        for r in rules:
            self._rules_by_conclusion.setdefault(r.conclusion.lower(), []).append(r)

    def get_all_rules(self) -> List[Rule]:
        return list(self.rules)

    def get_rule_by_id(self, rule_id: str) -> Optional[Rule]:
        return self._rules_by_id.get(rule_id)

    def find_rules_by_conclusion(self, conclusion: str) -> List[Rule]:
        """Find rules whose conclusion matches the target goal (case-insensitive)."""
        target = conclusion.lower().strip()
        matched = []
        for c_key, r_list in self._rules_by_conclusion.items():
            if target in c_key or c_key in target:
                matched.extend(r_list)
        return matched

    def filter_by_pet(self, pet: str) -> List[Rule]:
        """Return subset of rules applicable for 'dog' or 'cat'."""
        return [r for r in self.rules if r.is_applicable_to_pet(pet)]

    def get_all_symptoms(self, pet: Optional[str] = None) -> Set[str]:
        """Extract all unique base symptoms (excluding derived facts) from rules."""
        symptoms = set()
        rules = self.filter_by_pet(pet) if pet else self.rules
        for r in rules:
            for cond in r.conditions:
                if not cond.startswith("suspect =") and not cond.startswith("severity =") and not cond.startswith("complication ="):
                    symptoms.add(cond)
        return symptoms


def load_rules_from_file(file_path: str) -> KnowledgeBase:
    """
    Read rules from a JSON file path and return an initialized KnowledgeBase.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Rules database not found at: {file_path}")

    with open(path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    rules = [
        Rule(
            id=item["id"],
            name=item.get("name", item["id"]),
            pet_type=item.get("pet_type", "both"),
            conditions=item["conditions"],
            conclusion=item["conclusion"],
            derived_fact=item.get("derived_fact", f"suspect = {item['conclusion']}"),
            confidence=float(item.get("confidence", 0.7)),
            severity=item.get("severity", "Moderate"),
            explanation=item.get("explanation", ""),
            supportive_signs=item.get("supportive_signs", []),
            recommended_actions=item.get("recommended_actions", []),
            question_map=item.get("question_map", {})
        )
        for item in raw_data
    ]
    return KnowledgeBase(rules)
