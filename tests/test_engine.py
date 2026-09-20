"""
test_engine.py
==============
Sanity unit tests for VetAssist Forward and Backward Chaining inference engines.
"""

import pytest
from pathlib import Path
import sys

# Ensure root is in python path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.rule_loader import load_rules_from_file
from engine.forward_chain import ForwardChainingEngine
from engine.backward_chain import BackwardChainingEngine, DiagnosticQuestion


@pytest.fixture
def test_kb():
    rules_path = ROOT / "data" / "rules.json"
    return load_rules_from_file(str(rules_path))


def test_rule_loader(test_kb):
    """Verify rules are loaded properly from JSON."""
    assert len(test_kb.rules) >= 15
    r1 = test_kb.get_rule_by_id("R1")
    assert r1 is not None
    assert r1.conclusion == "Kennel Cough"
    assert "fever" in r1.conditions
    assert "coughing" in r1.conditions
    assert "lethargy" in r1.conditions


def test_forward_chaining_kennel_cough(test_kb):
    """Test Forward Chaining when fever, coughing, and lethargy are provided."""
    engine = ForwardChainingEngine(test_kb)
    result = engine.infer(pet_type="dog", known_symptoms=["fever", "coughing", "lethargy"])

    fired_ids = [r.rule_id for r in result.fired_rules]
    assert "R1" in fired_ids
    assert result.primary_diagnosis is not None
    assert result.primary_diagnosis.condition_name == "Kennel Cough"
    assert result.primary_diagnosis.confidence_pct == 72
    assert result.primary_diagnosis.is_confirmed is True


def test_forward_chaining_multi_hop_chain(test_kb):
    """
    Test multi-hop chaining:
    R1 fires on [fever, coughing, lethargy] -> derives 'suspect = Kennel Cough'.
    With 'nasal_discharge' present, R5 should then chain off R1's derived fact!
    """
    engine = ForwardChainingEngine(test_kb)
    result = engine.infer(
        pet_type="dog",
        known_symptoms=["fever", "coughing", "lethargy", "nasal_discharge"]
    )

    fired_ids = [r.rule_id for r in result.fired_rules]
    assert "R1" in fired_ids
    assert "R5" in fired_ids  # Chained rule fired!
    r1_step = next(r.step for r in result.fired_rules if r.rule_id == "R1")
    r5_step = next(r.step for r in result.fired_rules if r.rule_id == "R5")
    assert r1_step < r5_step


def test_forward_chaining_parvovirus(test_kb):
    """Verify Parvovirus critical rule fires on canine with acute GI symptoms."""
    engine = ForwardChainingEngine(test_kb)
    result = engine.infer(
        pet_type="dog",
        known_symptoms=["vomiting", "bloody_diarrhea", "lethargy", "unvaccinated"]
    )

    fired_ids = [r.rule_id for r in result.fired_rules]
    assert "R2" in fired_ids
    assert result.primary_diagnosis is not None
    assert "Parvovirus" in result.primary_diagnosis.condition_name
    assert result.primary_diagnosis.confidence_pct >= 85


def test_forward_chaining_equine_colic(test_kb):
    """Verify Horse Colic rule fires with high certainty."""
    engine = ForwardChainingEngine(test_kb)
    result = engine.infer(
        pet_type="horse",
        known_symptoms=["pawing_ground", "looking_at_flank", "rolling_frequently", "loss_of_appetite"]
    )

    fired_ids = [r.rule_id for r in result.fired_rules]
    assert "R10" in fired_ids
    assert result.primary_diagnosis.condition_name == "Equine Colic (Gastrointestinal Emergency)"
    assert result.primary_diagnosis.confidence_pct >= 90


def test_forward_chaining_rabbit_stasis(test_kb):
    """Verify Rabbit GI stasis emergency rule fires."""
    engine = ForwardChainingEngine(test_kb)
    result = engine.infer(
        pet_type="rabbit",
        known_symptoms=["loss_of_appetite", "no_fecal_pellets", "hunched_posture", "lethargy"]
    )

    fired_ids = [r.rule_id for r in result.fired_rules]
    assert "R11" in fired_ids
    assert result.primary_diagnosis.condition_name == "Rabbit Gastrointestinal Stasis"


def test_forward_chaining_inconclusive(test_kb):
    """Verify edge case: unknown or unrelated symptom produces inconclusive result."""
    engine = ForwardChainingEngine(test_kb)
    result = engine.infer(pet_type="dog", known_symptoms=["odd_whistling_sound"])

    assert len(result.fired_rules) == 0
    assert result.primary_diagnosis is None or result.primary_diagnosis.is_confirmed is False


def test_backward_chaining_confirmed(test_kb):
    """Test Backward Chaining confirming Kennel Cough through simulated user questions."""
    engine = BackwardChainingEngine(test_kb)

    def mock_ask_yes(q: DiagnosticQuestion) -> bool:
        return True

    result = engine.evaluate_hypothesis(
        pet_type="dog",
        hypothesis_disease="Kennel Cough",
        ask_user_callback=mock_ask_yes
    )

    assert result.status == "CONFIRMED"
    assert result.confidence_pct == 72
    assert result.rule_fired is not None
    assert result.rule_fired.id == "R1"
    assert len(result.proven_conditions) == 3


def test_backward_chaining_refuted_with_alternatives(test_kb):
    """Test Backward Chaining refuting Parvovirus when bloody_diarrhea is denied."""
    engine = BackwardChainingEngine(test_kb)

    def mock_ask(q: DiagnosticQuestion) -> bool:
        if "bloody_diarrhea" in q.condition_key:
            return False
        return True

    result = engine.evaluate_hypothesis(
        pet_type="dog",
        hypothesis_disease="Parvovirus",
        ask_user_callback=mock_ask
    )

    assert result.status == "REFUTED"
    assert "bloody_diarrhea" in result.disproven_conditions
    assert len(result.alternative_hypotheses) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
