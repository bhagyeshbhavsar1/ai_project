/**
 * backwardChain.js
 * ================
 * Backward Chaining Inference Engine for the Web Dashboard.
 * Direction: GOAL -> DATA
 * 
 * Supports hypothesis testing, clinical question sequence generation,
 * explanation rationale ("Why are we asking this?"), and goal resolution.
 */

import { VET_RULES } from './rulesData.js';

export function getInteractiveQuestions(petType = "dog", primaryHypothesis = "Parvovirus") {
  const pet = (petType || "dog").toLowerCase().trim();
  const rules = VET_RULES.filter(r => r.pet_type === "both" || r.pet_type.toLowerCase() === pet);

  // Focus primarily on high-priority triage diseases
  const targetRule = rules.find(r => r.conclusion.toLowerCase().includes(primaryHypothesis.toLowerCase())) || rules[0];

  const questions = [];
  const baseConditions = targetRule.conditions.filter(c => !c.startsWith("suspect ="));

  // Questions for primary hypothesis
  baseConditions.forEach((cond) => {
    const qText = targetRule.question_map?.[cond] || `Does your ${pet} show signs of ${cond.replace(/_/g, " ")}?`;
    questions.push({
      conditionKey: cond,
      targetHypothesis: targetRule.conclusion,
      ruleId: targetRule.id,
      questionText: qText,
      clinicalRationale: `This question helps confirm or rule out ${targetRule.conclusion}, which commonly presents with ${cond.replace(/_/g, " ")}, especially in high-risk pet profiles.`
    });
  });

  // Also include 1-2 differential check questions from a common alternative (e.g. Kennel Cough / Respiratory)
  const secondaryRule = rules.find(r => r.id !== targetRule.id && r.id !== "R5" && r.id !== "R15");
  if (secondaryRule) {
    const secondaryCond = secondaryRule.conditions.find(c => !questions.some(q => q.conditionKey === c) && !c.startsWith("suspect ="));
    if (secondaryCond) {
      questions.push({
        conditionKey: secondaryCond,
        targetHypothesis: secondaryRule.conclusion,
        ruleId: secondaryRule.id,
        questionText: secondaryRule.question_map?.[secondaryCond] || `Has your pet shown any signs of ${secondaryCond.replace(/_/g, " ")}?`,
        clinicalRationale: `Helps evaluate whether alternative conditions like ${secondaryRule.conclusion} should be considered.`
      });
    }
  }

  return questions;
}

export function evaluateBackwardChaining(petType, hypothesis, answersMap) {
  const pet = (petType || "dog").toLowerCase().trim();
  const applicableRules = VET_RULES.filter(r => r.pet_type === "both" || r.pet_type.toLowerCase() === pet);

  const matchedRule = applicableRules.find(r => 
    r.conclusion.toLowerCase().includes(hypothesis.toLowerCase()) || 
    hypothesis.toLowerCase().includes(r.conclusion.toLowerCase())
  );

  const reasoningTrace = [];
  reasoningTrace.push(`Goal established: Prove hypothesis '${hypothesis}' for species '${pet}'.`);

  if (!matchedRule) {
    return {
      hypothesis,
      status: "INCONCLUSIVE",
      confidencePct: 0,
      provenConditions: [],
      disprovenConditions: [],
      reasoningTrace: [`No rule found in knowledge base for ${hypothesis}`],
      recommendedActions: ["Consult a veterinarian for detailed clinical examination."],
      explanation: "No applicable rules found."
    };
  }

  reasoningTrace.push(`Evaluating Rule ${matchedRule.id}: requires conditions [${matchedRule.conditions.join(", ")}].`);

  const proven = [];
  const disproven = [];

  for (const cond of matchedRule.conditions) {
    if (cond.startsWith("suspect =")) continue;
    const ans = answersMap[cond];
    if (ans === "yes" || ans === true) {
      proven.push(cond);
      reasoningTrace.push(`User answered YES for '${cond}'. Condition satisfied.`);
    } else if (ans === "no" || ans === false) {
      disproven.push(cond);
      reasoningTrace.push(`User answered NO for '${cond}'. Sub-goal refuted.`);
    } else {
      reasoningTrace.push(`Condition '${cond}' was marked 'Not sure' / uncertain.`);
    }
  }

  const baseCount = matchedRule.conditions.filter(c => !c.startsWith("suspect =")).length;
  const isConfirmed = proven.length === baseCount;

  let status = "INCONCLUSIVE";
  let confidence = 0;

  if (isConfirmed) {
    status = "CONFIRMED";
    confidence = Math.round(matchedRule.confidence * 100);
    reasoningTrace.push(`All prerequisites verified! Rule ${matchedRule.id} FIRES -> Hypothesis '${matchedRule.conclusion}' CONFIRMED.`);
  } else if (disproven.length > 0) {
    status = "REFUTED";
    confidence = Math.round((proven.length / baseCount) * matchedRule.confidence * 40);
    reasoningTrace.push(`Hypothesis '${matchedRule.conclusion}' REFUTED due to lack of [${disproven.join(", ")}].`);
  }

  // Find alternatives if refuted
  const alternatives = [];
  if (status !== "CONFIRMED") {
    for (const r of applicableRules) {
      if (r.id === matchedRule.id || r.id === "R5" || r.id === "R15") continue;
      if (r.conditions.some(c => answersMap[c] === "yes")) {
        alternatives.push(r.conclusion);
      }
    }
  }

  return {
    hypothesis: matchedRule.conclusion,
    status,
    confidencePct: confidence,
    provenConditions: proven,
    disprovenConditions: disproven,
    ruleFired: isConfirmed ? matchedRule : null,
    reasoningTrace,
    recommendedActions: matchedRule.recommended_actions,
    alternativeHypotheses: alternatives,
    explanation: matchedRule.explanation,
    severity: matchedRule.severity
  };
}
