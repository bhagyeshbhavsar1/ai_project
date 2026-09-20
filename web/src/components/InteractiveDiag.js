/**
 * InteractiveDiag.js
 * ==================
 * Screen 3: Backward Chaining Interactive Diagnosis View with:
 * 1. Multi-animal hypothesis evaluation (Dog, Cat, Horse, Rabbit, Bird)
 * 2. Left vertical stepper (Asking Questions -> Evaluating -> Checking Alternatives -> Final Result)
 * 3. AI Physical Exam Assistant ("How to inspect your pet for this symptom")
 * 4. Clinical rationale and seamless result generation
 */

import { getInteractiveQuestions, evaluateBackwardChaining } from '../engine/backwardChain.js';
import { getAIExamGuideForCondition } from '../engine/aiAssistant.js';
import { SUPPORTED_ANIMALS } from '../engine/rulesData.js';

export function renderInteractiveDiag(container, navigateTo, state) {
  let selectedPet = state.petType || "dog";
  
  // Default target hypothesis based on animal
  const defaultHypotheses = {
    dog: "Parvovirus",
    cat: "FLUTD",
    horse: "Equine Colic",
    rabbit: "Rabbit GI Stasis",
    bird: "Avian Respiratory"
  };

  let targetHypothesis = state.targetHypothesis || defaultHypotheses[selectedPet] || "Parvovirus";

  let questions = getInteractiveQuestions(selectedPet, targetHypothesis);
  let currentIndex = 0;
  const answers = state.backwardAnswers || {};

  function render() {
    if (questions.length === 0) {
      questions = getInteractiveQuestions(selectedPet, targetHypothesis);
    }
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="back-link" id="diag-back-btn">
            <span>&larr;</span> Back to Symptom Checker
          </div>
          <button class="mode-selector-pill" id="interactive-mode-toggle">
            <span>💬 Backward Chaining Mode</span>
            <span style="font-size: 10px; margin-left: 4px;">▼</span>
          </button>
        </div>

        <div class="view-title-group" style="margin-bottom: 20px;">
          <h1>Interactive Diagnostic Inquiry</h1>
          <p>Evaluating working hypothesis <strong>${currentQ.targetHypothesis}</strong> in <strong>${SUPPORTED_ANIMALS.find(a => a.id === selectedPet)?.name || 'Patient'}</strong> via goal-driven backward chaining.</p>
        </div>

        <!-- Animal Species Selector Switcher -->
        <div style="display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
          ${SUPPORTED_ANIMALS.map(anim => `
            <button class="btn-secondary-outline ${selectedPet === anim.id ? 'active' : ''}" data-animal="${anim.id}" id="switch-anim-${anim.id}" style="padding: 6px 14px; font-size: 13px; ${selectedPet === anim.id ? 'background: var(--primary-green); color: white;' : ''}">
              ${anim.icon} ${anim.name}
            </button>
          `).join("")}
        </div>

        <!-- Two Column Layout -->
        <div class="interactive-layout">
          <!-- Left Vertical Stepper -->
          <div class="interactive-stepper">
            <div class="interactive-step-node ${currentStage >= 1 ? 'active' : ''}">
              <div class="interactive-node-icon">${currentStage > 1 ? '✓' : '●'}</div>
              <span>Asking Questions</span>
            </div>
            <div class="interactive-step-node ${currentStage >= 2 ? 'active' : ''}">
              <div class="interactive-node-icon">${currentStage > 2 ? '✓' : '○'}</div>
              <span>Evaluating Rules</span>
            </div>
            <div class="interactive-step-node ${currentStage >= 3 ? 'active' : ''}">
              <div class="interactive-node-icon">${currentStage > 3 ? '✓' : '○'}</div>
              <span>Checking Alternatives</span>
            </div>
            <div class="interactive-step-node">
              <div class="interactive-node-icon">○</div>
              <span>Final Result</span>
            </div>
          </div>

          <!-- Right Workspace -->
          <div class="interactive-workspace">
            <div class="question-card">
              <div class="question-progress-header">
                <span>Clinical Query ${currentIndex + 1} of ${total}</span>
                <span>${progressPct}% Complete</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${progressPct}%;"></div>
              </div>

              <h2 class="question-headline">${currentQ.questionText}</h2>
              <p class="question-subline">
                Evaluating clinical sign for hypothesis: <strong style="color: var(--primary-green);">${currentQ.targetHypothesis}</strong>
              </p>

              <!-- Radio Options -->
              <div class="radio-options-stack">
                <div class="radio-option-card ${selectedAnswer === 'yes' ? 'selected' : ''}" data-value="yes">
                  <div class="radio-circle">
                    <div class="radio-circle-dot"></div>
                  </div>
                  <span class="radio-label-text">Yes, observed</span>
                </div>

                <div class="radio-option-card ${selectedAnswer === 'no' ? 'selected' : ''}" data-value="no">
                  <div class="radio-circle">
                    <div class="radio-circle-dot"></div>
                  </div>
                  <span class="radio-label-text">No, not present</span>
                </div>

                <div class="radio-option-card ${selectedAnswer === 'unsure' ? 'selected' : ''}" data-value="unsure">
                  <div class="radio-circle">
                    <div class="radio-circle-dot"></div>
                  </div>
                  <span class="radio-label-text">Not sure / Cannot verify</span>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="question-nav-row">
                <button class="btn-secondary-outline" id="prev-question-btn" ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                  &larr; Previous
                </button>
                <button class="btn-primary-dark" id="next-question-btn">
                  ${currentIndex === total - 1 ? 'Conclude Diagnostic Trace &rarr;' : 'Next Question &rarr;'}
                </button>
              </div>
            </div>

            <!-- "Why are we asking this?" + AI Exam Guide -->
            <div class="why-asking-card" style="flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div class="disclaimer-icon" style="color: #2563eb;">ℹ️</div>
                <div>
                  <div class="why-asking-title">Why are we asking this?</div>
                  <div class="why-asking-body">${currentQ.clinicalRationale}</div>
                </div>
              </div>

              <div style="margin-top: 6px; padding-top: 10px; border-top: 1px solid #bfdbfe; font-size: 12.5px; color: #1e40af; display: flex; gap: 8px; align-items: center;">
                <span>🩺 <strong>AI At-Home Physical Exam Tip:</strong></span>
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
    // Back to Symptom Checker
    container.querySelector("#diag-back-btn").addEventListener("click", () => navigateTo("symptom-checker"));
    container.querySelector("#interactive-mode-toggle").addEventListener("click", () => navigateTo("symptom-checker"));

    // Animal Switcher
    SUPPORTED_ANIMALS.forEach(anim => {
      const btn = container.querySelector(`#switch-anim-${anim.id}`);
      if (btn) {
        btn.addEventListener("click", () => {
          selectedPet = anim.id;
          state.petType = anim.id;
          targetHypothesis = defaultHypotheses[anim.id] || "Parvovirus";
          questions = getInteractiveQuestions(selectedPet, targetHypothesis);
          currentIndex = 0;
          render();
        });
      }
    });

    // Option clicks
    const radioCards = container.querySelectorAll(".radio-option-card");
    radioCards.forEach(card => {
      card.addEventListener("click", () => {
        const val = card.dataset.value;
        const currentQ = questions[currentIndex];
        answers[currentQ.conditionKey] = val;
        state.backwardAnswers = answers;
        render();
      });
    });

    // Previous
    const prevBtn = container.querySelector("#prev-question-btn");
    if (prevBtn && currentIndex > 0) {
      prevBtn.addEventListener("click", () => {
        currentIndex--;
        render();
      });
    }

    // Next
    const nextBtn = container.querySelector("#next-question-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const currentQ = questions[currentIndex];
        if (!answers[currentQ.conditionKey]) {
          answers[currentQ.conditionKey] = "yes";
        }

        if (currentIndex < questions.length - 1) {
          currentIndex++;
          render();
        } else {
          // Evaluate backward chaining
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
