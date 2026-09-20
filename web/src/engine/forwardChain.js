/**
 * forwardChain.js
 * ===============
 * Forward Chaining Inference Engine for the Web Dashboard.
 * Direction: DATA -> CONCLUSION
 * 
 * Takes in the selected pet type and symptom array, iteratively matches rules,
 * asserts derived facts (supporting multi-hop chaining), logs an audit trace,
 * and computes ranked differential diagnoses.
 */

import { VET_RULES } from './rulesData.js';

export function runForwardChaining(petType, selectedSymptoms) {
  const pet = (petType || "dog").toLowerCase().trim();
  const workingMemory = new Set(selectedSymptoms.map(s => s.toLowerCase().trim()));
  const initialFacts = Array.from(workingMemory);

  // Filter rules applicable to pet species
  const applicableRules = VET_RULES.filter(r => 
    r.pet_type === "both" || r.pet_type.toLowerCase() === pet
  );

  const firedRecords = [];
  const alreadyFiredIds = new Set();
  const reasoningSteps = [];

  reasoningSteps.push(`Starting forward chaining with ${workingMemory.size} initial facts: [${Array.from(workingMemory).join(", ")}]`);

  let changed = true;
  let stepCounter = 1;

  while (changed) {
    changed = false;
    for (const rule of applicableRules) {
      if (alreadyFiredIds.has(rule.id)) continue;

      // Check if all conditions are in working memory
      const allConditionsMet = rule.conditions.every(c => workingMemory.has(c.toLowerCase().trim()));

      if (allConditionsMet) {
        alreadyFiredIds.add(rule.id);
        changed = true;

        // Add derived conclusions to working memory
        workingMemory.add(rule.conclusion.toLowerCase().trim());
        workingMemory.add(rule.derived_fact.toLowerCase().trim());

        const ruleStatement = `IF ${rule.conditions.join(" AND ")} THEN suspect = ${rule.conclusion}`;

        firedRecords.push({
          step: stepCounter,
          ruleId: rule.id,
          ruleName: rule.name,
          ruleStatement,
          matchedConditions: [...rule.conditions],
          conclusion: rule.conclusion,
          derivedFact: rule.derived_fact,
          confidence: rule.confidence,
          explanation: rule.explanation,
          actions: rule.recommended_actions,
          severity: rule.severity,
          supportiveSigns: rule.supportive_signs
        });

        reasoningSteps.push(
          `Step ${stepCounter}: Rule ${rule.id} FIRED -> Condition [${rule.conditions.join(", ")}] satisfied. Derived: '${rule.conclusion}' (${Math.round(rule.confidence * 100)}%).`
        );
        stepCounter++;
      }
    }
  }

  // Calculate differential ranking for primary diseases
  const ranked = [];
  const handledConclusions = new Set();

  // First, add all completely fired primary disease rules
  for (const fired of firedRecords) {
    if (fired.ruleId === "R5" || fired.ruleId === "R15") continue; // Secondary fact rules
    if (handledConclusions.has(fired.conclusion)) continue;
    handledConclusions.add(fired.conclusion);

    // Check if secondary complications chained
    const chained = firedRecords
      .filter(f => f.ruleId !== fired.ruleId && (f.ruleStatement.includes(fired.conclusion) || f.matchedConditions.some(c => c.includes(fired.conclusion))))
      .map(f => f.ruleStatement);

    ranked.push({
      conditionName: fired.conclusion,
      confidencePct: Math.round(fired.confidence * 100),
      isConfirmed: true,
      ruleId: fired.ruleId,
      matchedSymptoms: fired.matchedConditions,
      missingSymptoms: [],
      ruleStatement: fired.ruleStatement,
      chainedRules: chained,
      explanation: fired.explanation,
      recommendedActions: fired.actions,
      severity: fired.severity,
      supportiveSigns: fired.supportiveSigns || []
    });
  }

  // Second, add near-matches (partial condition satisfaction) for clinical differential ranking
  for (const rule of applicableRules) {
    if (rule.id === "R5" || rule.id === "R15") continue;
    if (handledConclusions.has(rule.conclusion)) continue;

    const baseConditions = rule.conditions.filter(c => !c.startsWith("suspect ="));
    const matched = baseConditions.filter(c => workingMemory.has(c.toLowerCase().trim()));
    const missing = baseConditions.filter(c => !workingMemory.has(c.toLowerCase().trim()));
    const matchRatio = matched.length / Math.max(baseConditions.length, 1);

    if (matchRatio >= 0.4) {
      handledConclusions.add(rule.conclusion);
      const conf = Math.round(rule.confidence * matchRatio * 100);
      ranked.push({
        conditionName: rule.conclusion,
        confidencePct: conf,
        isConfirmed: false,
        ruleId: rule.id,
        matchedSymptoms: matched,
        missingSymptoms: missing,
        ruleStatement: `IF ${rule.conditions.join(" AND ")} THEN suspect = ${rule.conclusion}`,
        chainedRules: [],
        explanation: rule.explanation,
        recommendedActions: rule.recommended_actions,
        severity: rule.severity,
        supportiveSigns: rule.supportive_signs || []
      });
    }
  }

  // Sort descending by confidence
  ranked.sort((a, b) => b.confidencePct - a.confidencePct);

  return {
    petType: pet,
    initialSymptoms: initialFacts,
    allDerivedFacts: Array.from(workingMemory),
    firedRules: firedRecords,
    rankedDiagnoses: ranked,
    primaryDiagnosis: ranked.length > 0 ? ranked[0] : null,
    reasoningSteps
  };
}
