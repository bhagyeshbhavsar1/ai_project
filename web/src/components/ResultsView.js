/**
 * ResultsView.js
 * ==============
 * Screen 4: Assessment Results & Reasoning Path Explanation with:
 * 1. Plain-language labels ("Other possible conditions", "Why this condition?")
 * 2. High triage emergency alert banner ("This can be life-threatening. Contact a vet immediately.")
 * 3. Matched signs vs Missing signs for transparency
 * 4. Step-by-step: how we reached this (numbered sentences, visual multi-hop chain)
 * 5. 1-line confidence explanation
 * 6. Evidence source citation ("Based on: ...")
 * 7. Support for backward chaining confirmation / refutation + next condition retry
 */

import { generateAIClinicalSummary } from '../engine/aiAssistant.js';
import { getFriendlySymptomName, formatFriendlyList } from '../utils/formatters.js';
import { VET_RULES } from '../engine/rulesData.js';

export function renderResultsView(container, navigateTo, state) {
  const isForward = state.reasoningMode !== "Backward Chaining";
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                  ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let conditionList = [];
  let firedRules = [];
  let initialSymptoms = [];

  if (isForward && state.forwardResult) {
    const res = state.forwardResult;
    conditionList = res.rankedDiagnoses || [];
    firedRules = res.firedRules || [];
    initialSymptoms = res.initialSymptoms || [];
  } else if (state.backwardResult) {
    const res = state.backwardResult;
    const ruleRef = VET_RULES.find(r => 
      r.conclusion.toLowerCase().includes(res.hypothesis.toLowerCase()) ||
      res.hypothesis.toLowerCase().includes(r.conclusion.toLowerCase())
    );

    conditionList = [
      {
        conditionName: res.hypothesis,
        confidencePct: res.confidencePct,
        isConfirmed: res.status === "CONFIRMED",
        isRefuted: res.status === "REFUTED",
        ruleId: res.ruleFired?.id || ruleRef?.id || "Rule",
        matchedSymptoms: res.provenConditions || [],
        missingSymptoms: res.disprovenConditions || [],
        ruleStatement: res.ruleFired ? `IF ${res.ruleFired.conditions.map(getFriendlySymptomName).join(" AND ")} THEN suspect = ${res.ruleFired.conclusion}` : `Target: ${res.hypothesis}`,
        explanation: res.explanation || ruleRef?.explanation,
        recommendedActions: res.recommendedActions || ruleRef?.recommended_actions,
        severity: res.severity || ruleRef?.severity || "Consult Vet",
        dangerous: res.ruleFired?.dangerous || ruleRef?.dangerous || "No",
        dataSource: res.ruleFired?.data_source || ruleRef?.data_source || "AKC Health & VCA Animal Hospitals",
        supportiveSigns: ruleRef?.supportive_signs || [],
        backwardStatus: res.status,
        alternativeHypotheses: res.alternativeHypotheses || []
      }
    ];

    if (res.alternativeHypotheses && res.alternativeHypotheses.length > 0) {
      res.alternativeHypotheses.forEach((alt, i) => {
        const altRule = VET_RULES.find(r => r.conclusion.toLowerCase() === alt.toLowerCase());
        conditionList.push({
          conditionName: alt,
          confidencePct: Math.max(45 - (i * 15), 20),
          isConfirmed: false,
          isRefuted: false,
          ruleId: altRule?.id || "Alt",
          matchedSymptoms: ["Shared symptoms under review"],
          missingSymptoms: [],
          ruleStatement: altRule ? `IF ${altRule.conditions.map(getFriendlySymptomName).join(" AND ")} THEN ${altRule.conclusion}` : `Alternative candidate consideration`,
          explanation: altRule?.explanation || `Considered as an alternative condition based on reported signs.`,
          recommendedActions: altRule?.recommended_actions || ["Discuss this alternative possibility with your veterinarian."],
          severity: altRule?.severity || "Moderate",
          dangerous: altRule?.dangerous || "No",
          dataSource: altRule?.data_source || "Kaggle & Veterinary Literature",
          supportiveSigns: altRule?.supportive_signs || []
        });
      });
    }
  }

  // Fallback if accessed directly with no state
  if (conditionList.length === 0 && !isForward) {
    conditionList = [];
  } else if (conditionList.length === 0 && isForward && (!state.symptoms || state.symptoms.length === 0)) {
    // No symptoms selected state handled below
  } else if (conditionList.length === 0) {
    conditionList = [
      {
        conditionName: "Kennel Cough",
        confidencePct: 72,
        isConfirmed: true,
        ruleId: "R1",
        matchedSymptoms: ["fever", "coughing", "lethargy"],
        missingSymptoms: [],
        ruleStatement: "IF Fever AND Coughing AND Lethargy THEN Kennel Cough",
        explanation: "Dry persistent hacking cough combined with fever and lethargy is classic for infectious tracheobronchitis.",
        recommendedActions: [
          "Consult a veterinarian for proper examination",
          "Keep your pet isolated from other animals",
          "Ensure rest and hydration",
          "Monitor for worsening symptoms"
        ],
        severity: "Mild to Moderate",
        dangerous: "No",
        dataSource: "AKC Health & VCA Animal Hospitals",
        supportiveSigns: ["nasal_discharge"]
      }
    ];
  }

  let selectedIndex = 0;
  // Task 7: "Show the 'How we reached this' section OPEN by default"
  let showReasoningPath = true;

  // Build plain-language numbered sentences for forward chaining (Task 9)
  function getNumberedSentences() {
    const sentences = [];
    if (initialSymptoms.length > 0) {
      sentences.push({
        num: 1,
        title: "You told us",
        text: `You noticed: ${initialSymptoms.map(getFriendlySymptomName).join(", ")}.`
      });
    } else {
      sentences.push({
        num: 1,
        title: "You told us",
        text: "You checked signs observed in your pet."
      });
    }

    let stepNum = 2;
    if (firedRules.length === 0) {
      sentences.push({
        num: stepNum++,
        title: "Rule check",
        text: "We checked all veterinary expert rules against the signs you reported."
      });
      sentences.push({
        num: stepNum,
        title: "Conclusion reached",
        text: "No complete rule matched your exact symptom pattern. No more rules can fire. Done."
      });
      return sentences;
    }

    firedRules.forEach((f, idx) => {
      const friendlyConds = f.matchedConditions.map(getFriendlySymptomName).join(" AND ");
      sentences.push({
        num: stepNum++,
        title: `Rule ${f.ruleId} matched`,
        text: `IF ${friendlyConds} THEN ${f.conclusion} (${Math.round(f.confidence * 100)}%).`
      });

      if (idx < firedRules.length - 1) {
        sentences.push({
          num: stepNum++,
          title: `New fact learned: "${f.conclusion}"`,
          text: `Checking rules again with new knowledge...`
        });
      }
    });

    sentences.push({
      num: stepNum,
      title: "Finished",
      text: "No more rules can fire. Done."
    });

    return sentences;
  }

  // Build visual chain for multi-step results like R1 -> R5 (Task 10)
  function getVisualChain() {
    if (firedRules.length <= 1) return null;
    return firedRules;
  }

  function render() {
    // Handle empty results (Task 24)
    if (conditionList.length === 0) {
      container.innerHTML = `
        <div class="results-view-wrapper">
          <div class="results-meta-header">
            <div class="back-link" id="results-back-btn">
              <span>&larr;</span> Back to Symptom Checker
            </div>
            <div class="meta-info-badge">
              Species: <strong style="text-transform: capitalize;">${state.petType || 'Dog'}</strong> &nbsp;|&nbsp;
              ${dateStr}
            </div>
          </div>

          <div style="background: white; border: 1.5px solid var(--card-border); border-radius: var(--radius-md); padding: 40px 24px; text-align: center; margin-top: 24px;">
            <div style="font-size: 38px; margin-bottom: 12px;">🔍</div>
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">No match in our knowledge base</h2>
            <p style="color: #64748b; font-size: 14px; max-width: 520px; margin: 0 auto 20px auto; line-height: 1.6;">
              <!-- Task 24: "No match found" state wording -->
              No match in our knowledge base. This does NOT mean your pet is healthy - contact a vet if you are worried.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              <button class="btn-primary-dark" id="empty-retry-btn">
                Pick Other Signs &rarr;
              </button>
            </div>
          </div>
        </div>
      `;

      const backBtn = container.querySelector("#results-back-btn");
      if (backBtn) backBtn.addEventListener("click", () => navigateTo("symptom-checker"));
      const retryBtn = container.querySelector("#empty-retry-btn");
      if (retryBtn) retryBtn.addEventListener("click", () => navigateTo("symptom-checker"));
      return;
    }

    const selectedCond = conditionList[selectedIndex] || conditionList[0];
    const isDangerous = !selectedCond.isRefuted && (selectedCond.dangerous === "Yes" || selectedCond.severity?.includes("Critical") || selectedCond.severity?.includes("Emergency"));
    const visualChainRules = getVisualChain();
    const numberedSentences = isForward ? getNumberedSentences() : [];

    const aiSummaryText = generateAIClinicalSummary(
      state.petType || "dog",
      selectedCond,
      selectedCond.matchedSymptoms || [],
      state.reasoningMode || "Forward Chaining"
    );

    // Backward chaining specific state
    const isRefuted = !isForward && state.backwardResult?.status === "REFUTED";
    const isConfirmed = !isForward && state.backwardResult?.status === "CONFIRMED";

    container.innerHTML = `
      <div class="results-view-wrapper">
        <!-- Top Back and Metadata -->
        <div class="results-meta-header">
          <div class="back-link" id="results-back-btn">
            <span>&larr;</span> Back
          </div>
          <div class="meta-info-badge">
            Species: <strong style="text-transform: capitalize;">${state.petType || 'Dog'}</strong> &nbsp;|&nbsp;
            Mode: <strong>${state.reasoningMode || 'Forward Chaining'}</strong> &nbsp;|&nbsp;
            ${dateStr}
          </div>
        </div>

        <!-- Task 22: Say "possible condition", never "diagnosis is" -->
        <div class="view-title-group" style="margin-bottom: 20px;">
          <h1>Assessment Results & Clinical Triage</h1>
          <p>Deductive inference outcome grounded in verified veterinary rules and citations.</p>
        </div>

        <!-- Task 23: Dangerous/critical results emergency line -->
        ${isDangerous ? `
          <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 32px;">🚨</span>
              <div>
                <h3 style="color: #991b1b; font-size: 16.5px; font-weight: 700;">
                  This can be life-threatening. Contact a vet immediately.
                </h3>
                <p style="color: #b91c1c; font-size: 13.5px; margin-top: 3px;">
                  High triage risk detected. Transport your pet to a 24/7 veterinary emergency hospital without delay.
                </p>
              </div>
            </div>
            <span class="most-likely-badge" style="background: #fee2e2; color: #991b1b; border-color: #fca5a5; font-size: 13px; font-weight: 700;">EMERGENCY</span>
          </div>
        ` : ''}

        <!-- Task 19: Backward chaining REFUTED alert & backtracking step -->
        ${isRefuted ? `
          <div style="background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 24px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <span style="font-size: 26px;">⚠️</span>
              <div style="flex: 1;">
                <h3 style="color: #92400e; font-size: 16px; font-weight: 700;">
                  We stopped because you answered No to ${formatFriendlyList(state.backwardResult.disprovenConditions)}, which ${state.backwardResult.hypothesis} requires.
                </h3>
                <p style="color: #b45309; font-size: 13px; margin-top: 4px;">
                  This rules out ${state.backwardResult.hypothesis} as the primary suspect under our knowledge base rules.
                </p>

                ${state.backwardResult.alternativeHypotheses && state.backwardResult.alternativeHypotheses.length > 0 ? `
                  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #fde68a; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div>
                      <span style="font-size: 13px; font-weight: 600; color: #78350f;">
                        Trying the next possible condition: <strong>${state.backwardResult.alternativeHypotheses[0]}</strong>
                      </span>
                    </div>
                    <button class="btn-primary-dark" id="try-next-condition-btn" style="padding: 7px 16px; font-size: 13px;">
                      Check ${state.backwardResult.alternativeHypotheses[0]} &rarr;
                    </button>
                  </div>
                ` : `
                  <div style="margin-top: 12px;">
                    <button class="btn-secondary-outline" id="try-next-condition-btn" style="padding: 6px 14px; font-size: 12.5px;">
                      Try another condition &rarr;
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Task 20: Backward chaining CONFIRMED alert -->
        ${isConfirmed ? `
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 28px;">✅</span>
              <div>
                <h3 style="color: #065f46; font-size: 16px; font-weight: 700;">
                  Condition Verified: ${selectedCond.conditionName}
                </h3>
                <p style="color: #047857; font-size: 13px; margin-top: 2px;">
                  All required signs confirmed: <strong>${formatFriendlyList(selectedCond.matchedSymptoms)}</strong>. Verified via Rule ${selectedCond.ruleId}.
                </p>
              </div>
            </div>
            <span class="most-likely-badge" style="background: #dcfce7; color: #166534; font-size: 13px;">CONFIRMED</span>
          </div>
        ` : ''}

        <!-- Two Column Layout -->
        <div class="results-grid-layout">
          <!-- Left Column: Possible Conditions list (Task 3: "Other possible conditions") -->
          <div class="conditions-list-panel">
            <h2 class="conditions-panel-title">Other Possible Conditions</h2>
            
            ${conditionList.map((cond, idx) => `
              <div class="condition-rank-card ${idx === selectedIndex ? 'selected' : ''}" data-index="${idx}">
                <div class="condition-card-top">
                  <span class="condition-name">${cond.conditionName}</span>
                  <span class="condition-pct">${cond.confidencePct}%</span>
                </div>
                <div class="condition-bar-track">
                  <div class="condition-bar-fill" style="width: ${cond.confidencePct}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: var(--text-muted);">
                  <span>Severity: ${cond.severity || 'Moderate'}</span>
                  <span>${cond.dangerous === 'Yes' ? '⚠️ High Risk' : '✓ Non-Critical'}</span>
                </div>
              </div>
            `).join("")}

            <!-- Task 12: Explain confidence in one line -->
            <div style="padding: 12px 14px; background: #f8fafc; border: 1px solid var(--card-border); border-radius: var(--radius-sm); margin-top: 14px; font-size: 12px; color: var(--text-muted); line-height: 1.4;">
              💡 <strong>Understanding Confidence:</strong> Confidence shows how strongly this symptom pattern points to the condition. It is not a guarantee.
            </div>
          </div>

          <!-- Right Column: Detail Card -->
          <div class="detail-result-card">
            <div class="detail-card-header">
              <div>
                <h2 class="detail-disease-name">${selectedCond.conditionName}</h2>
                <div class="detail-confidence-text">
                  Certainty: <strong>${selectedCond.confidencePct}%</strong> &nbsp;|&nbsp; 
                  Severity: <strong>${selectedCond.severity || 'Moderate'}</strong>
                </div>
              </div>
              <div>
                ${selectedIndex === 0 ? `
                  <span class="most-likely-badge">${selectedCond.isRefuted ? 'Refuted' : 'Most Likely'}</span>
                ` : `
                  <span class="most-likely-badge" style="background: #f1f5f9; color: #475569; border-color: #cbd5e1;">Candidate</span>
                `}
              </div>
            </div>

            <!-- Task 22: "Why this condition?" -->
            <div class="detail-section">
              <h3 class="detail-section-title">Why this condition?</h3>
              <ul class="detail-bullet-list">
                <!-- Task 11: List "Symptoms you have that match" and "Symptoms still missing" -->
                <li>
                  <span class="bullet-dot"></span>
                  <div>
                    <strong>Symptoms you have that match:</strong>
                    <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                      ${(selectedCond.matchedSymptoms && selectedCond.matchedSymptoms.length > 0) ? 
                        selectedCond.matchedSymptoms.map(s => `<span class="rule-code-chip" style="background: #ecfdf5; color: #065f46; border-color: #a7f3d0;">✓ ${getFriendlySymptomName(s)}</span>`).join("")
                        : '<span style="font-size: 12.5px; color: var(--text-muted);">None observed</span>'
                      }
                    </div>
                  </div>
                </li>

                <li style="margin-top: 8px;">
                  <span class="bullet-dot"></span>
                  <div>
                    <strong>Symptoms still missing:</strong>
                    <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                      ${(selectedCond.missingSymptoms && selectedCond.missingSymptoms.length > 0) ? 
                        selectedCond.missingSymptoms.map(s => `<span class="rule-code-chip" style="background: #fef2f2; color: #991b1b; border-color: #fca5a5;">— ${getFriendlySymptomName(s)}</span>`).join("")
                        : '<span class="rule-code-chip" style="background: #f0fdf4; color: #166534; border-color: #bbf7d0;">✓ None - all required signs present!</span>'
                      }
                    </div>
                  </div>
                </li>

                <li style="margin-top: 8px;">
                  <span class="bullet-dot"></span>
                  <span>Rule triggered: <span class="rule-code-chip">${selectedCond.ruleStatement}</span></span>
                </li>

                <!-- Task 26: Show the source as "Based on: AKC, VCA Animal Hospitals" -->
                <li style="margin-top: 8px;">
                  <span class="bullet-dot"></span>
                  <span><strong>Based on:</strong> <em>${selectedCond.dataSource || 'AKC Health & VCA Animal Hospitals'}</em></span>
                </li>

                ${selectedCond.supportiveSigns && selectedCond.supportiveSigns.length > 0 ? `
                  <li style="margin-top: 8px;">
                    <span class="bullet-dot"></span>
                    <span>Additional signs to watch for: <em>${selectedCond.supportiveSigns.map(getFriendlySymptomName).join(", ")}</em></span>
                  </li>
                ` : ''}
              </ul>
            </div>

            <!-- Recommended Action -->
            <div class="detail-section">
              <h3 class="detail-section-title">Recommended Steps for Pet Owners</h3>
              <ul class="detail-bullet-list actions-list">
                ${(selectedCond.recommendedActions || [
                  "Consult a veterinarian for proper examination",
                  "Keep your pet isolated from other animals",
                  "Ensure rest and hydration",
                  "Monitor for worsening symptoms"
                ]).map(act => `
                  <li>
                    <span class="action-check-icon">✓</span>
                    <span>${act}</span>
                  </li>
                `).join("")}
              </ul>
            </div>

            <!-- AI Vet Referral Summary Feature -->
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-sm); padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" id="toggle-ai-note-btn">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>✨</span>
                  <strong style="color: #064e3b; font-size: 13.5px;">Summary for Your Vet Visit</strong>
                </div>
                <button class="btn-secondary-outline" id="copy-ai-note-btn" style="font-size: 12px; padding: 4px 10px; background: white;">
                  📋 Copy Note for Vet
                </button>
              </div>
              <div style="margin-top: 10px; font-family: monospace; font-size: 11.5px; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0; white-space: pre-wrap; line-height: 1.4; color: #1e293b;">
${aiSummaryText}
              </div>
            </div>

            <div class="detail-footer-disclaimer">
              This is an educational assessment based on expert rules. Always consult a licensed veterinarian for professional diagnosis and medical treatment.
            </div>

            <div class="detail-button-row">
              <button class="btn-secondary-outline" id="save-result-btn">
                <span>💾 Save Result</span>
              </button>
              <button class="btn-primary-dark" id="new-diagnosis-btn">
                Check Other Signs <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Task 7, 8, 9, 10: "Step-by-step: how we reached this" OPEN by default -->
        <button class="reasoning-path-toggle" id="toggle-reasoning-path-btn" style="margin-top: 24px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>🔍</span>
            <span><strong>Step-by-step: how we reached this</strong> (Forward chaining: from your symptoms to a conclusion)</span>
          </div>
          <span>${showReasoningPath ? '▲' : '▼'}</span>
        </button>

        <div class="reasoning-path-drawer ${showReasoningPath ? 'open' : ''}" id="reasoning-drawer">
          <!-- Task 8: Plain-language intro -->
          <div style="padding: 12px 16px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; margin-bottom: 16px; font-size: 13.5px; color: #1e40af; line-height: 1.5;">
            <strong>How Forward Chaining works:</strong> Forward chaining starts with the symptoms you gave us, checks every rule, and keeps going until nothing new can be concluded.
          </div>

          <!-- Task 10: Multi-step visual chain diagram with arrows (R1 -> R5) -->
          ${visualChainRules ? `
            <div style="background: #f8fafc; border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 18px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
                Chained Inference Path:
              </div>
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px;">
                <span class="rule-code-chip" style="background: #e2e8f0; font-weight: 600;">[${initialSymptoms.map(getFriendlySymptomName).join(" + ")}]</span>
                ${visualChainRules.map(r => `
                  <span style="font-weight: 700; color: var(--accent-emerald); font-size: 15px;">&rarr;</span>
                  <span class="most-likely-badge" style="font-size: 11px;">${r.ruleId}</span>
                  <span style="font-weight: 700; color: var(--accent-emerald); font-size: 15px;">&rarr;</span>
                  <span class="rule-code-chip" style="background: #dbeafe; color: #1e40af; font-weight: 700;">[${r.conclusion}]</span>
                `).join("")}
              </div>
            </div>
          ` : ''}

          <!-- Task 9: Numbered sentences for steps -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${numberedSentences.map(s => `
              <div class="trace-step-item" style="display: flex; gap: 10px; align-items: flex-start; font-family: var(--font-body); font-size: 13.5px;">
                <span style="font-weight: 700; color: var(--primary-green); min-width: 55px;">Step ${s.num}:</span>
                <div>
                  <strong style="color: #0f172a;">${s.title}</strong> — 
                  <span style="color: #334155;">${s.text}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Back
    const backBtn = container.querySelector("#results-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (state.reasoningMode === "Backward Chaining") {
          navigateTo("interactive-diagnosis");
        } else {
          navigateTo("symptom-checker");
        }
      });
    }

    // Try next condition if refuted
    const tryNextBtn = container.querySelector("#try-next-condition-btn");
    if (tryNextBtn) {
      tryNextBtn.addEventListener("click", () => {
        if (state.backwardResult?.alternativeHypotheses && state.backwardResult.alternativeHypotheses.length > 0) {
          state.targetHypothesis = state.backwardResult.alternativeHypotheses[0];
          state.backwardAnswers = {};
          state.backwardResult = null;
          navigateTo("interactive-diagnosis");
        } else {
          navigateTo("symptom-checker");
        }
      });
    }

    // Select Condition Card
    const condCards = container.querySelectorAll(".condition-rank-card");
    condCards.forEach(card => {
      card.addEventListener("click", () => {
        selectedIndex = parseInt(card.dataset.index, 10);
        render();
      });
    });

    // Copy AI Note
    const copyBtn = container.querySelector("#copy-ai-note-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedCond = conditionList[selectedIndex];
        const text = generateAIClinicalSummary(state.petType || "dog", selectedCond, selectedCond.matchedSymptoms || [], state.reasoningMode || "Forward Chaining");
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerText = "✓ Copied!";
          setTimeout(() => { copyBtn.innerText = "📋 Copy Note for Vet"; }, 2500);
        });
      });
    }

    // Save Result to LocalStorage
    const saveBtn = container.querySelector("#save-result-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const history = JSON.parse(localStorage.getItem("vetassist_history") || "[]");
        const current = conditionList[selectedIndex];
        history.unshift({
          id: Date.now(),
          date: dateStr,
          petType: state.petType || "dog",
          conditionName: current.conditionName,
          confidencePct: current.confidencePct,
          mode: state.reasoningMode || "Forward Chaining",
          symptoms: current.matchedSymptoms || []
        });
        localStorage.setItem("vetassist_history", JSON.stringify(history.slice(0, 30)));
        saveBtn.innerHTML = "<span>✓ Saved to History</span>";
        saveBtn.style.borderColor = "#10b981";
        saveBtn.style.color = "#047857";
      });
    }

    // New Diagnosis / Check other signs
    const newBtn = container.querySelector("#new-diagnosis-btn");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        state.symptoms = [];
        state.backwardAnswers = {};
        state.forwardResult = null;
        state.backwardResult = null;
        navigateTo("symptom-checker");
      });
    }

    // Toggle Reasoning Path
    const togglePathBtn = container.querySelector("#toggle-reasoning-path-btn");
    if (togglePathBtn) {
      togglePathBtn.addEventListener("click", () => {
        showReasoningPath = !showReasoningPath;
        render();
      });
    }
  }

  render();
}
