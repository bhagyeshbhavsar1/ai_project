/**
 * ResultsView.js
 * ==============
 * Screen 4: Diagnosis Results & Reasoning Path Explanation with:
 * 1. Differential Diagnosis Ranking & Confidence Scoring
 * 2. Kaggle Tier 1 "Dangerous: Yes/No" Emergency Triage Tag
 * 3. AI Veterinary Clinical SOAP Note & Referral Summary Generator
 * 4. Rule Firing Chain Trace (IF... THEN...)
 * 5. Expandable Reasoning Execution Log
 */

import { generateAIClinicalSummary } from '../engine/aiAssistant.js';

export function renderResultsView(container, navigateTo, state) {
  const isForward = state.reasoningMode !== "Backward Chaining";
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                  ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let conditionList = [];
  let reasoningTrace = [];

  if (isForward && state.forwardResult) {
    const res = state.forwardResult;
    conditionList = res.rankedDiagnoses || [];
    reasoningTrace = res.reasoningSteps || [];
  } else if (state.backwardResult) {
    const res = state.backwardResult;
    conditionList = [
      {
        conditionName: res.hypothesis,
        confidencePct: res.confidencePct,
        isConfirmed: res.status === "CONFIRMED",
        matchedSymptoms: res.provenConditions,
        missingSymptoms: res.disprovenConditions,
        ruleStatement: res.ruleFired ? `IF ${res.ruleFired.conditions.join(" AND ")} THEN suspect = ${res.ruleFired.conclusion}` : `Hypothesis: ${res.hypothesis}`,
        explanation: res.explanation,
        recommendedActions: res.recommendedActions,
        severity: res.severity || "Consult Vet",
        dangerous: res.ruleFired?.dangerous || "No",
        dataSource: res.ruleFired?.data_source || "Clinical Knowledge Base",
        supportiveSigns: ["Close clinical monitoring"]
      }
    ];

    if (res.alternativeHypotheses) {
      res.alternativeHypotheses.forEach((alt, i) => {
        conditionList.push({
          conditionName: alt,
          confidencePct: Math.max(45 - (i * 15), 20),
          isConfirmed: false,
          matchedSymptoms: ["Shared symptoms under review"],
          missingSymptoms: [],
          ruleStatement: `Alternative candidate consideration`,
          explanation: `Considered as a differential alternative based on reported symptoms.`,
          recommendedActions: ["Discuss this alternative possibility with your veterinarian."],
          severity: "Moderate",
          dangerous: "No",
          dataSource: "Kaggle & Vet Literature",
          supportiveSigns: []
        });
      });
    }

    reasoningTrace = res.reasoningTrace || [];
  }

  // Fallback if accessed directly
  if (conditionList.length === 0) {
    conditionList = [
      {
        conditionName: "Kennel Cough",
        confidencePct: 72,
        isConfirmed: true,
        matchedSymptoms: ["fever", "coughing", "lethargy"],
        missingSymptoms: [],
        ruleStatement: "IF fever AND coughing AND lethargy THEN suspect = Kennel Cough",
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
        supportiveSigns: ["nasal discharge"]
      }
    ];
  }

  let selectedIndex = 0;
  let showReasoningPath = false;
  let showAINote = false;

  function render() {
    const selectedCond = conditionList[selectedIndex] || conditionList[0];
    const isDangerous = selectedCond.dangerous === "Yes" || selectedCond.severity?.includes("Critical") || selectedCond.severity?.includes("Emergency");

    const aiSummaryText = generateAIClinicalSummary(
      state.petType || "dog",
      selectedCond,
      selectedCond.matchedSymptoms || [],
      state.reasoningMode || "Forward Chaining"
    );

    container.innerHTML = `
      <div class="results-view-wrapper">
        <!-- Top Back and Metadata -->
        <div class="results-meta-header">
          <div class="back-link" id="results-back-btn">
            <span>&larr;</span> Back
          </div>
          <div class="meta-info-badge">
            Species: <strong style="text-transform: capitalize;">${state.petType || 'Dog'}</strong> &nbsp;|&nbsp;
            Reasoning Mode: <strong>${state.reasoningMode || 'Forward Chaining'}</strong> &nbsp;|&nbsp;
            ${dateStr}
          </div>
        </div>

        <div class="view-title-group" style="margin-bottom: 24px;">
          <h1>Diagnosis Results & Clinical Triage</h1>
          <p>Deductive inference outcome grounded in verified veterinary rules and Kaggle dataset citations.</p>
        </div>

        <!-- Emergency Dangerous Alert Banner if applicable -->
        ${isDangerous ? `
          <div style="background: #fef2f2; border: 1.5px solid #f87171; border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="font-size: 28px;">🚨</span>
              <div>
                <h3 style="color: #991b1b; font-size: 16px; font-weight: 700;">HIGH TRIAGE DANGER ALERT (Tier 1 Dataset: Dangerous = YES)</h3>
                <p style="color: #b91c1c; font-size: 13px; margin-top: 2px;">
                  This condition carries severe physiological risk. Prompt emergency hospital evaluation is urgently advised.
                </p>
              </div>
            </div>
            <span class="most-likely-badge" style="background: #fee2e2; color: #991b1b; border-color: #fca5a5; font-size: 13px;">URGENT</span>
          </div>
        ` : ''}

        <!-- Two Column Layout -->
        <div class="results-grid-layout">
          <!-- Left Column: Possible Conditions list -->
          <div class="conditions-list-panel">
            <h2 class="conditions-panel-title">Differential Candidates</h2>
            
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
          </div>

          <!-- Right Column: Detail Card -->
          <div class="detail-result-card">
            <div class="detail-card-header">
              <div>
                <h2 class="detail-disease-name">${selectedCond.conditionName}</h2>
                <div class="detail-confidence-text">
                  Certainty Factor: <strong>${selectedCond.confidencePct}%</strong> &nbsp;|&nbsp; 
                  Severity: <strong>${selectedCond.severity || 'Moderate'}</strong>
                </div>
              </div>
              <div>
                ${selectedIndex === 0 ? `
                  <span class="most-likely-badge">Most Likely</span>
                ` : `
                  <span class="most-likely-badge" style="background: #f1f5f9; color: #475569; border-color: #cbd5e1;">Differential</span>
                `}
              </div>
            </div>

            <!-- Why this diagnosis? -->
            <div class="detail-section">
              <h3 class="detail-section-title">Why this diagnosis?</h3>
              <ul class="detail-bullet-list">
                <li>
                  <span class="bullet-dot"></span>
                  <span>Matches clinical symptoms: <strong>${selectedCond.matchedSymptoms ? selectedCond.matchedSymptoms.join(", ") : 'Observed signs'}</strong></span>
                </li>
                <li>
                  <span class="bullet-dot"></span>
                  <span>Rule triggered: <span class="rule-code-chip">${selectedCond.ruleStatement}</span></span>
                </li>
                ${selectedCond.dataSource ? `
                  <li>
                    <span class="bullet-dot"></span>
                    <span>Evidence citation: <em>${selectedCond.dataSource}</em></span>
                  </li>
                ` : ''}
                ${selectedCond.supportiveSigns && selectedCond.supportiveSigns.length > 0 ? `
                  <li>
                    <span class="bullet-dot"></span>
                    <span>Additional supportive signs may include <em>${selectedCond.supportiveSigns.join(", ")}</em></span>
                  </li>
                ` : ''}
              </ul>
            </div>

            <!-- Recommended Action -->
            <div class="detail-section">
              <h3 class="detail-section-title">Recommended Clinical Action</h3>
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
                  <strong style="color: #064e3b; font-size: 13.5px;">AI Veterinary SOAP Triage Note</strong>
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
              This is an educational prediction based on a rule-based expert system. Always consult a licensed veterinarian for professional diagnosis and medical treatment.
            </div>

            <div class="detail-button-row">
              <button class="btn-secondary-outline" id="save-result-btn">
                <span>💾 Save Result</span>
              </button>
              <button class="btn-primary-dark" id="new-diagnosis-btn">
                New Diagnosis <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Expandable Reasoning Path -->
        <button class="reasoning-path-toggle" id="toggle-reasoning-path-btn">
          <span>View Detailed Reasoning Path</span>
          <span>${showReasoningPath ? '▲' : '&gt;'}</span>
        </button>

        <div class="reasoning-path-drawer ${showReasoningPath ? 'open' : ''}" id="reasoning-drawer">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Inference Engine Execution Trace:</h3>
          ${reasoningTrace.map(step => `
            <div class="trace-step-item">${step}</div>
          `).join("")}
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Back
    container.querySelector("#results-back-btn").addEventListener("click", () => {
      if (state.reasoningMode === "Backward Chaining") {
        navigateTo("interactive-diagnosis");
      } else {
        navigateTo("symptom-checker");
      }
    });

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
      localStorage.setItem("vetassist_history", JSON.stringify(history.slice(0, 25)));
      saveBtn.innerHTML = "<span>✓ Saved to History</span>";
      saveBtn.style.borderColor = "#10b981";
      saveBtn.style.color = "#047857";
    });

    // New Diagnosis
    const newBtn = container.querySelector("#new-diagnosis-btn");
    newBtn.addEventListener("click", () => {
      state.symptoms = [];
      state.backwardAnswers = {};
      state.forwardResult = null;
      state.backwardResult = null;
      navigateTo("symptom-checker");
    });

    // Toggle Reasoning Path
    const togglePathBtn = container.querySelector("#toggle-reasoning-path-btn");
    togglePathBtn.addEventListener("click", () => {
      showReasoningPath = !showReasoningPath;
      render();
    });
  }

  render();
}
