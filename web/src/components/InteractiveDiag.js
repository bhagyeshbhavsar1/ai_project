/**
 * InteractiveDiag.js
 * ==================
 * Screen 3: Backward Chaining Interactive Assessment View with:
 * 1. Friendly 2-card mode selector ("I see symptoms" vs "I suspect a disease")
 * 2. Plain-language intro box explaining backward chaining
 * 3. Clear disease picker so owners can choose which condition to test
 * 4. Rule being tested in plain words
 * 5. Live checklist beside question (Confirmed / Denied / Not asked yet)
 * 6. Question progress label ("Question X of Y")
 * 7. Back navigation preserving answers
 * 8. "Why are we asking this?" tied directly to hypothesis
 * 9. "Not sure" explains it counts as unconfirmed
 */

import { getInteractiveQuestions, evaluateBackwardChaining } from '../engine/backwardChain.js';
import { getAIExamGuideForCondition } from '../engine/aiAssistant.js';
import { SUPPORTED_ANIMALS, VET_RULES } from '../engine/rulesData.js';
import { getFriendlySymptomName } from '../utils/formatters.js';

export function renderInteractiveDiag(container, navigateTo, state) {
  let selectedPet = state.petType || "dog";
  
  // Default target hypothesis based on animal
  const defaultHypotheses = {
    dog: "Parvovirus",
    cat: "FLUTD",
    horse: "Equine Colic",
    rabbit: "Rabbit GI Stasis",
    bird: "Avian Respiratory",
    cattle: "Bovine Mastitis",
    sheep: "Ovine Footrot"
  };

  let targetHypothesis = state.targetHypothesis || defaultHypotheses[selectedPet] || "Parvovirus";
  let questions = getInteractiveQuestions(selectedPet, targetHypothesis);
  let currentIndex = 0;
  const answers = state.backwardAnswers || {};
  let showModeMenu = false;

  function render() {
    if (questions.length === 0) {
      questions = getInteractiveQuestions(selectedPet, targetHypothesis);
    }

    // Applicable primary diseases for selected animal
    const petDiseases = VET_RULES.filter(r => 
      (r.pet_type === "both" || r.pet_type.toLowerCase() === selectedPet) &&
      r.id !== "R5" && r.id !== "R15"
    );

    // Target hypothesis rule details
    const targetRule = VET_RULES.find(r => 
      r.conclusion.toLowerCase().includes(targetHypothesis.toLowerCase()) ||
      targetHypothesis.toLowerCase().includes(r.conclusion.toLowerCase())
    ) || petDiseases[0] || VET_RULES[0];

    const ruleConditions = targetRule.conditions.filter(c => !c.startsWith("suspect ="));

    const currentQ = questions[currentIndex] || questions[0];
    const total = questions.length;
    const progressPct = Math.round(((currentIndex + 1) / total) * 100);
    const selectedAnswer = answers[currentQ.conditionKey] || null;
    const aiExamGuide = getAIExamGuideForCondition(currentQ.conditionKey);

    let currentStage = 1;
    if (currentIndex >= Math.floor(total * 0.5)) currentStage = 2;
    if (currentIndex === total - 1) currentStage = 3;

    container.innerHTML = `
      <div class="interactive-diag-wrapper">
        <!-- Back Link & Mode Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div class="back-link" id="diag-back-btn">
            <span>&larr;</span> Back to Symptom Checker
          </div>
          
          <div class="mode-dropdown-wrapper" style="position: relative;">
            <button class="mode-selector-pill" id="interactive-mode-toggle" aria-haspopup="true" aria-expanded="${showModeMenu}">
              <span>💬 Checking by Disease</span>
              <span style="font-size: 10px; margin-left: 4px;">▼</span>
            </button>

            <!-- Mode selector popover with clear descriptions -->
            <div class="mode-popover-menu" id="mode-popover-menu" style="display: ${showModeMenu ? 'block' : 'none'}; position: absolute; right: 0; top: 110%; width: 310px; background: white; border: 1px solid var(--card-border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 50; padding: 10px;">
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; padding: 4px 8px 8px 8px; border-bottom: 1px solid #f1f5f9;">
                Choose How You Want to Check
              </div>

              <div class="mode-option-item" id="opt-mode-forward" style="padding: 10px; border-radius: var(--radius-sm); background: #ffffff; border: 1px solid #e2e8f0; margin-top: 8px; cursor: pointer;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <strong style="font-size: 13px; color: #1e293b;">🩺 Check by Symptoms</strong>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.35;">
                  "I know the symptoms - tell me what it could be."
                </div>
              </div>

              <div class="mode-option-item selected" id="opt-mode-backward" style="padding: 10px; border-radius: var(--radius-sm); background: #f0fdf4; border: 1px solid #86efac; margin-top: 6px; cursor: pointer;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <strong style="font-size: 13px; color: #065f46;">💬 Check a Disease (Current)</strong>
                  <span style="color: #16a34a; font-size: 12px;">✓</span>
                </div>
                <div style="font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.35;">
                  "I suspect a disease - ask me questions to check it."
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Non-Technical 2-Card Mode Selector Section -->
        <div class="symptoms-container-card" style="margin-bottom: 20px; padding: 18px 20px; background: #ffffff; border: 1.5px solid var(--card-border);">
          <div style="margin-bottom: 12px;">
            <h2 class="section-block-title" style="margin-bottom: 2px;">How would you like to check your pet?</h2>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0;">
              Pick the approach that matches what you know right now:
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
            <!-- Option 1: By Symptoms (Clickable switch) -->
            <div id="card-switch-to-forward" style="padding: 16px; border-radius: var(--radius-sm); background: #ffffff; border: 1.5px solid #cbd5e1; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: #1e293b; font-size: 14.5px;">🩺 Option 1: I see symptoms</strong>
                  <span class="rule-code-chip" style="font-size: 11px; color: #059669; background: #ecfdf5; border-color: #a7f3d0;">Switch Mode &rarr;</span>
                </div>
                <div style="font-size: 13.5px; font-weight: 600; color: #059669; margin-top: 4px;">
                  "Tell me what illness this could be"
                </div>
                <p style="font-size: 12.5px; color: #64748b; margin-top: 4px; line-height: 1.45;">
                  Tick observed signs from a checklist to find all matching conditions.
                </p>
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); border-top: 1px dashed #e2e8f0; padding-top: 6px;">
                AI Engine: <em>Forward reasoning (Symptom &rarr; Possible condition)</em>
              </div>
            </div>

            <!-- Option 2: By Disease (Active) -->
            <div style="padding: 16px; border-radius: var(--radius-sm); background: #eff6ff; border: 2px solid #3b82f6; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: #1e40af; font-size: 14.5px;">💬 Option 2: I suspect a disease</strong>
                  <span class="most-likely-badge" style="background: #dbeafe; color: #1e40af; font-size: 11px;">Selected</span>
                </div>
                <div style="font-size: 13.5px; font-weight: 600; color: #1e3a8a; margin-top: 4px;">
                  "Ask me questions to test a specific illness"
                </div>
                <p style="font-size: 12.5px; color: #475569; margin-top: 4px; line-height: 1.45;">
                  Worried about a particular illness? Answer guided questions to prove or rule it out.
                </p>
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); border-top: 1px dashed #bfdbfe; padding-top: 6px;">
                AI Engine: <em>Targeted inquiry / Backward chaining (Disease &rarr; Questions)</em>
              </div>
            </div>
          </div>
        </div>

        <!-- Intro Box explaining backward chaining in plain words -->
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px; display: flex; gap: 12px; align-items: flex-start;">
          <span style="font-size: 22px; color: #2563eb;">ℹ️</span>
          <div>
            <strong style="color: #1e40af; font-size: 14px; display: block; margin-bottom: 2px;">
              How Guided Disease Check Works:
            </strong>
            <p style="font-size: 13px; color: #1e3a8a; line-height: 1.45; margin: 0;">
              This mode starts with a disease you suspect and works backwards: to prove it, which signs must be true? We ask you about them one by one.
            </p>
          </div>
        </div>

        <!-- 1. Animal Species Selection -->
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            1. Select Your Animal:
          </h3>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            ${SUPPORTED_ANIMALS.map(anim => `
              <button class="btn-secondary-outline ${selectedPet === anim.id ? 'active' : ''}" data-animal="${anim.id}" id="switch-anim-${anim.id}" style="padding: 7px 16px; font-size: 13px; font-weight: 600; ${selectedPet === anim.id ? 'background: var(--primary-green); color: white; border-color: var(--primary-green);' : ''}">
                ${anim.icon} ${anim.name}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- 2. Disease Picker for selected animal -->
        <div style="background: #ffffff; border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 22px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
            2. Which condition are you worried about in your ${SUPPORTED_ANIMALS.find(a => a.id === selectedPet)?.name || 'pet'}?
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${petDiseases.map(d => {
              const isSelected = targetHypothesis.toLowerCase().includes(d.conclusion.toLowerCase()) || d.conclusion.toLowerCase().includes(targetHypothesis.toLowerCase());
              const isCritical = d.dangerous === "Yes" || d.severity?.includes("Critical") || d.severity?.includes("Emergency");
              return `
                <button 
                  class="condition-select-chip ${isSelected ? 'active' : ''}" 
                  data-conclusion="${d.conclusion}"
                  style="padding: 7px 14px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; ${isSelected ? 'background: var(--primary-green); color: white; border: 1.5px solid var(--primary-green); box-shadow: var(--shadow-sm);' : isCritical ? 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;' : 'background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1;'}"
                >
                  ${isCritical ? '🚨 ' : ''}${d.conclusion}
                  <span style="font-size: 10px; opacity: 0.8; margin-left: 4px;">(${d.id})</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Rule Requirement Display -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">
              Signs required to confirm ${targetRule.conclusion}:
            </span>
            <div style="font-size: 13.5px; color: #1e293b;">
              To confirm <strong>${targetRule.conclusion}</strong> we need ALL of: 
              <span style="color: #047857; font-weight: 600;">${ruleConditions.map(getFriendlySymptomName).join(", ")}</span>.
            </div>
          </div>
          <span class="rule-code-chip" style="font-size: 12px; padding: 4px 10px; background: white;">Rule ${targetRule.id}</span>
        </div>

        <!-- Two Column Layout -->
        <div class="interactive-layout">
          <!-- Left Column: Stepper & Live Checklist -->
          <div class="interactive-stepper" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="background: white; border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 16px;">
              <div class="interactive-step-node ${currentStage >= 1 ? 'active' : ''}">
                <div class="interactive-node-icon">${currentStage > 1 ? '✓' : '●'}</div>
                <span>Asking Questions</span>
              </div>
              <div class="interactive-step-node ${currentStage >= 2 ? 'active' : ''}">
                <div class="interactive-node-icon">${currentStage > 2 ? '✓' : '○'}</div>
                <span>Evaluating Rule Signs</span>
              </div>
              <div class="interactive-step-node ${currentStage >= 3 ? 'active' : ''}">
                <div class="interactive-node-icon">${currentStage > 3 ? '✓' : '○'}</div>
                <span>Checking Next Condition</span>
              </div>
              <div class="interactive-step-node">
                <div class="interactive-node-icon">○</div>
                <span>Final Assessment</span>
              </div>
            </div>

            <!-- Live checklist that updates live (Confirmed / Denied / Not asked yet) -->
            <div class="live-condition-checklist" id="live-condition-checklist" style="background: white; border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 16px;">
              <h3 style="font-size: 13.5px; font-weight: 700; margin-bottom: 4px; color: #1e293b;">
                📋 Live Condition Checklist
              </h3>
              <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px;">
                Signs required for ${targetRule.conclusion}:
              </p>

              <div id="checklist-items-container" style="display: flex; flex-direction: column; gap: 8px;">
                ${ruleConditions.map(cond => {
                  const ans = answers[cond];
                  let statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #f1f5f9; color: #64748b; font-weight: 600;">○ Not asked yet</span>`;
                  if (ans === "yes") {
                    statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: 700; border: 1px solid #a7f3d0;">✓ Confirmed</span>`;
                  } else if (ans === "no") {
                    statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #fef2f2; color: #b91c1c; font-weight: 700; border: 1px solid #fca5a5;">✗ Denied</span>`;
                  } else if (ans === "unsure") {
                    statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #fffbeb; color: #b45309; font-weight: 600; border: 1px solid #fde68a;">? Unconfirmed</span>`;
                  }

                  const isCurrent = currentQ.conditionKey === cond;
                  return `
                    <div class="checklist-item-row" data-cond="${cond}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 6px; ${isCurrent ? 'background: #f0fdf4; border: 1px solid #86efac;' : 'background: #f8fafc; border: 1px solid #e2e8f0;'}">
                      <span style="font-size: 12.5px; color: ${isCurrent ? '#065f46' : '#1e293b'}; font-weight: ${isCurrent ? '600' : '400'};">
                        ${isCurrent ? '👉 ' : ''}${getFriendlySymptomName(cond)}
                      </span>
                      ${statusBadge}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <!-- Right Workspace -->
          <div class="interactive-workspace">
            <div class="question-card">
              <!-- Progress label ("Question X of Y") -->
              <div class="question-progress-header">
                <span style="font-weight: 700; color: var(--primary-green);">Question ${currentIndex + 1} of ${total}</span>
                <span>${progressPct}% Complete</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${progressPct}%;"></div>
              </div>

              <h2 class="question-headline" style="margin-top: 16px;">${currentQ.questionText}</h2>
              <p class="question-subline" style="margin-top: 4px;">
                Checking sign for: <strong style="color: var(--primary-green);">${currentQ.targetHypothesis}</strong>
              </p>

              <!-- Radio Options -->
              <div class="radio-options-stack" style="margin-top: 20px;">
                <div class="radio-option-card ${selectedAnswer === 'yes' ? 'selected' : ''}" data-value="yes" id="opt-answer-yes">
                  <div class="radio-circle">
                    <div class="radio-circle-dot"></div>
                  </div>
                  <span class="radio-label-text">Yes, observed in my pet</span>
                </div>

                <div class="radio-option-card ${selectedAnswer === 'no' ? 'selected' : ''}" data-value="no" id="opt-answer-no">
                  <div class="radio-circle">
                    <div class="radio-circle-dot"></div>
                  </div>
                  <span class="radio-label-text">No, definitely not present</span>
                </div>

                <!-- "Not sure" explains it counts as unconfirmed -->
                <div class="radio-option-card ${selectedAnswer === 'unsure' ? 'selected' : ''}" data-value="unsure" id="opt-answer-unsure">
                  <div class="radio-circle">
                    <div class="radio-circle-dot"></div>
                  </div>
                  <div style="display: flex; flex-direction: column;">
                    <span class="radio-label-text">Not sure / Cannot verify</span>
                    <span style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                      (counts as unconfirmed; result may be lower confidence)
                    </span>
                  </div>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="question-nav-row" style="margin-top: 24px;">
                <button class="btn-secondary-outline" id="prev-question-btn" ${currentIndex === 0 ? 'disabled style="opacity: 0.45; cursor: not-allowed;"' : ''}>
                  &larr; Previous Question
                </button>
                <button class="btn-primary-dark" id="next-question-btn">
                  ${currentIndex === total - 1 ? 'Conclude Assessment &rarr;' : 'Next Question &rarr;'}
                </button>
              </div>
            </div>

            <!-- "Why are we asking this?" tied to hypothesis -->
            <div class="why-asking-card" style="flex-direction: column; gap: 10px; margin-top: 18px;">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div class="disclaimer-icon" style="color: #2563eb;">ℹ️</div>
                <div>
                  <div class="why-asking-title">Why are we asking this?</div>
                  <div class="why-asking-body">
                    <strong>Needed to confirm ${currentQ.targetHypothesis}:</strong> ${currentQ.clinicalRationale}
                  </div>
                </div>
              </div>

              <div style="margin-top: 6px; padding-top: 10px; border-top: 1px solid #bfdbfe; font-size: 12.5px; color: #1e40af; display: flex; gap: 8px; align-items: center;">
                <span>🩺 <strong>At-Home Check Tip:</strong></span>
                <span>${aiExamGuide}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const currentQ = questions[currentIndex] || questions[0];

    // Mode popover toggle
    const modeBtn = container.querySelector("#interactive-mode-toggle");
    if (modeBtn) {
      modeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showModeMenu = !showModeMenu;
        render();
      });
    }

    const optForward = container.querySelector("#opt-mode-forward");
    if (optForward) {
      optForward.addEventListener("click", () => {
        showModeMenu = false;
        state.petType = selectedPet;
        navigateTo("symptom-checker");
      });
    }

    const optBackward = container.querySelector("#opt-mode-backward");
    if (optBackward) {
      optBackward.addEventListener("click", () => {
        showModeMenu = false;
        render();
      });
    }

    // Reciprocal 2-card mode switcher back to Symptom Checker
    const cardSwitchToForward = container.querySelector("#card-switch-to-forward");
    if (cardSwitchToForward) {
      cardSwitchToForward.addEventListener("click", () => {
        state.petType = selectedPet;
        navigateTo("symptom-checker");
      });
    }

    // Back to Symptom Checker
    const backBtn = container.querySelector("#diag-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => navigateTo("symptom-checker"));
    }

    // Animal Switcher
    SUPPORTED_ANIMALS.forEach(anim => {
      const btn = container.querySelector(`#switch-anim-${anim.id}`);
      if (btn) {
        btn.addEventListener("click", () => {
          selectedPet = anim.id;
          state.petType = anim.id;
          targetHypothesis = defaultHypotheses[anim.id] || "Parvovirus";
          state.targetHypothesis = targetHypothesis;
          questions = getInteractiveQuestions(selectedPet, targetHypothesis);
          currentIndex = 0;
          render();
        });
      }
    });

    // Disease Picker Chips
    const condChips = container.querySelectorAll(".condition-select-chip");
    condChips.forEach(chip => {
      chip.addEventListener("click", () => {
        targetHypothesis = chip.dataset.conclusion;
        state.targetHypothesis = targetHypothesis;
        state.backwardAnswers = {};
        Object.keys(answers).forEach(k => delete answers[k]);
        questions = getInteractiveQuestions(selectedPet, targetHypothesis);
        currentIndex = 0;
        render();
      });
    });

    // Option clicks (updates answers, updates classes and checklist without full DOM disruption)
    const radioCards = container.querySelectorAll(".radio-option-card");
    radioCards.forEach(card => {
      card.addEventListener("click", () => {
        const val = card.dataset.value;
        answers[currentQ.conditionKey] = val;
        state.backwardAnswers = answers;
        
        radioCards.forEach(c => {
          c.classList.toggle("selected", c.dataset.value === val);
        });

        // Update the checklist row live if present
        const checkItem = container.querySelector(`.checklist-item-row[data-cond="${currentQ.conditionKey}"]`);
        if (checkItem) {
          let statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #f1f5f9; color: #64748b; font-weight: 600;">○ Not asked yet</span>`;
          if (val === "yes") {
            statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: 700; border: 1px solid #a7f3d0;">✓ Confirmed</span>`;
          } else if (val === "no") {
            statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #fef2f2; color: #b91c1c; font-weight: 700; border: 1px solid #fca5a5;">✗ Denied</span>`;
          } else if (val === "unsure") {
            statusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #fffbeb; color: #b45309; font-weight: 600; border: 1px solid #fde68a;">? Unconfirmed</span>`;
          }
          checkItem.innerHTML = `
            <span style="font-size: 12.5px; color: #065f46; font-weight: 600;">
              👉 ${getFriendlySymptomName(currentQ.conditionKey)}
            </span>
            ${statusBadge}
          `;
        }
      });
    });

    // Previous button - retains previous answer
    const prevBtn = container.querySelector("#prev-question-btn");
    if (prevBtn && currentIndex > 0) {
      prevBtn.addEventListener("click", () => {
        currentIndex--;
        render();
      });
    }

    // Next button
    const nextBtn = container.querySelector("#next-question-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (!answers[currentQ.conditionKey]) {
          answers[currentQ.conditionKey] = "unsure";
          state.backwardAnswers = answers;
        }

        if (currentIndex < questions.length - 1) {
          currentIndex++;
          render();
        } else {
          // Conclude and evaluate backward chaining
          const result = evaluateBackwardChaining(selectedPet, targetHypothesis, answers);
          state.backwardResult = result;
          state.reasoningMode = "Backward Chaining";
          navigateTo("diagnosis-results");
        }
      });
    }
  }

  render();
}
