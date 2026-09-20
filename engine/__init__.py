"""
Veterinary Diagnosis Expert System (VetAssist) - Inference Engine Package.

Provides forward chaining (data -> conclusion) and backward chaining (goal -> data)
reasoning over veterinary diagnostic rules.
"""

from .rule_loader import Rule, KnowledgeBase, load_rules_from_file
from .forward_chain import ForwardChainingEngine, ForwardChainingResult
from .backward_chain import BackwardChainingEngine, BackwardChainingResult

__all__ = [
    "Rule",
    "KnowledgeBase",
    "load_rules_from_file",
    "ForwardChainingEngine",
    "ForwardChainingResult",
    "BackwardChainingEngine",
    "BackwardChainingResult",
]
