/**
 * SymptomChecker.js
 * =================
 * Screen 2: Forward Chaining Symptom Checker View with:
 * 1. Multi-Animal Selection (Dog, Cat, Horse, Rabbit, Bird)
 * 2. AI Natural Language Symptom Extractor ("AI Symptom Detective")
 * 3. Categorized, Searchable Symptom Grid grounded in Kaggle & Vet datasets
 * 4. Mode dropdown (Forward Chaining / Backward Chaining)
 * 5. 'Run Diagnosis ->' execution
 */

import { SUPPORTED_ANIMALS, ALL_SYMPTOMS } from '../engine/rulesData.js';
import { runForwardChaining } from '../engine/forwardChain.js';
import { extractSymptomsWithAI } from '../engine/aiAssistant.js';

export function renderSymptomChecker(container, navigateTo, state) {
  let selectedPet = state.petType || "dog";
  let selectedSymptoms = new Set(state.symptoms || ["fever", "coughing", "lethargy"]);
  let showMore = false;
  let searchTerm = "";
  let naturalLanguageInput = "";
  let aiExtractionNotice = null;

  function render() {
    // Filter symptoms applicable to selected animal or general
    const animalSymptoms = ALL_SYMPTOMS.filter(s => 
      !s.animals || s.animals.includes(selectedPet) || s.category === "General"
    );

    const commonList = animalSymptoms.slice(0, 12);
    const visibleSymptoms = animalSymptoms.filter(s => {
      const matchesSearch = s.label.toLowerCase().includes(searchTerm.toLowerCase());
      if (searchTerm) return matchesSearch;
      return showMore ? true : commonList.some(cs => cs.id === s.id);
    });

    container.innerHTML = `
      <div class="symptom-checker-wrapper">
        <!-- View Header -->
        <div class="view-header">
          <div class="view-title-group">
            <h1>Symptom Checker</h1>
            <p>Select your animal species and observed symptoms. Forward chaining will infer diagnoses and triage severity.</p>
          </div>
          <div class="mode-dropdown-wrapper">
            <button class="mode-selector-pill" id="mode-selector-btn">
              <span>⚙️ Forward Chaining</span>
              <span style="font-size: 10px; margin-left: 4px;">▼</span>
            </button>
          </div>
        </div>

        <!-- Stepper -->
        <div class="stepper-container">
          <div class="step-item active">
            <span class="step-circle">1</span>
            <span>Select Animal</span>
          </div>
          <div class="stepper-divider"></div>
          <div class="step-item ${selectedSymptoms.size > 0 ? 'active' : ''}">
            <span class="step-circle">2</span>
            <span>Choose Symptoms</span>
          </div>
          <div class="stepper-divider"></div>
          <div class="step-item">
            <span class="step-circle">3</span>
            <span>Review & Diagnose</span>
          </div>
        </div>

        <!-- 1. Select Animal Species -->
        <div class="section-block">
          <h2 class="section-block-title">1. Select Animal Species</h2>
          <div class="pet-type-grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
            ${SUPPORTED_ANIMALS.map(anim => `
              <div class="pet-card ${selectedPet === anim.id ? 'selected' : ''}" data-pet="${anim.id}" id="pet-select-${anim.id}" style="padding: 16px 12px; flex-direction: column; gap: 6px;">
                <span class="pet-card-icon" style="font-size: 32px;">${anim.icon}</span>
                <span style="font-size: 16px;">${anim.name}</span>
                <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-body); font-weight: 500;">${anim.species}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- AI Natural Language Symptom Extractor Card -->
        <div class="symptoms-container-card" style="background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%); border: 1.5px solid #86efac; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">✨</span>
              <h3 style="font-size: 18px; font-weight: 700; color: #064e3b;">AI Natural Language Symptom Detective</h3>
            </div>
            <span class="most-likely-badge" style="background: #dcfce7; color: #166534; font-size: 11px;">AI Feature</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">
            Describe your pet's behavior or symptoms in plain English (e.g. <em>"My dog has been vomiting yellow foam, has bloody diarrhea, and won't get up"</em>). AI will parse and automatically check the clinical symptoms below!
          </p>

          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input 
              type="text" 
              class="search-input" 
              id="ai-nlp-input" 
              placeholder="Describe symptoms in your own words..." 
              value="${naturalLanguageInput}"
              style="height: 42px; border-radius: var(--radius-sm); border: 1px solid #a7f3d0; background: white;"
            />
            <button class="btn-primary-dark" id="ai-extract-btn" style="white-space: nowrap; padding: 0 18px; font-size: 13.5px;">
              Extract Symptoms ✨
            </button>
          </div>

          <!-- Quick Scenario Chips -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px;">
            <span style="font-size: 11.5px; font-weight: 600; color: #065f46;">Try AI Prompts:</span>
            <button class="quick-chip" data-text="Dog coughing like dry hacking, high fever, and very lethargic">🐕 Coughing Dog</button>
            <button class="quick-chip" data-text="Puppy vomiting, severe bloody diarrhea, lethargic and unvaccinated">🚨 Parvo Warning</button>
            <button class="quick-chip" data-text="Cat crying in litter box, straining with little urine produced">🐈 FLUTD Straining</button>
            <button class="quick-chip" data-text="Horse pawing ground, looking at flank, and rolling in pain">🐎 Equine Colic</button>
            <button class="quick-chip" data-text="Rabbit stopped eating hay, no fecal pellets for 10 hours, hunched">🐇 Rabbit Stasis</button>
            <button class="quick-chip" data-text="Bird tail bobbing with breath, open mouth breathing on cage bottom">🦜 Bird Respiratory</button>
          </div>

          ${aiExtractionNotice ? `
            <div style="margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-sm); background: #ecfdf5; border: 1px solid #6ee7b7; font-size: 13px; color: #064e3b; display: flex; align-items: center; gap: 8px;">
              <span>🤖</span>
              <div>${aiExtractionNotice}</div>
            </div>
          ` : ''}
        </div>

        <!-- 2. Select Symptoms Checkboxes -->
        <div class="symptoms-container-card">
          <div class="symptoms-header-row">
            <div>
              <h2 class="section-block-title" style="margin-bottom: 2px;">2. Observed Clinical Symptoms</h2>
              <span style="font-size: 12.5px; color: var(--text-muted);">
                Showing symptoms for <strong>${SUPPORTED_ANIMALS.find(a => a.id === selectedPet)?.name || 'Selected Species'}</strong> (${selectedSymptoms.size} selected)
              </span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="symptoms-search">
                <input 
                  type="text" 
                  class="search-input" 
                  id="symptom-search-input" 
                  placeholder="Filter symptoms..." 
                  value="${searchTerm}"
                />
              </div>
              <span class="common-tag">Evidence-Based</span>
            </div>
          </div>

          <div class="symptoms-checkbox-grid">
            ${visibleSymptoms.map(sym => `
              <label class="checkbox-label ${selectedSymptoms.has(sym.id) ? 'checked' : ''}">
                <input 
                  type="checkbox" 
                  class="checkbox-input" 
                  value="${sym.id}" 
                  ${selectedSymptoms.has(sym.id) ? 'checked' : ''}
                />
                <span>${sym.label}</span>
              </label>
            `).join("")}
          </div>

          ${!searchTerm && animalSymptoms.length > 12 ? `
            <button class="toggle-more-btn" id="toggle-more-symptoms-btn">
              <span>${showMore ? 'Show Fewer Symptoms ▲' : `Show All ${animalSymptoms.length} Symptoms ▼`}</span>
            </button>
          ` : ''}

          <div class="checker-actions" style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn-secondary-outline" id="clear-symptoms-btn" style="font-size: 13px; padding: 8px 16px;">
              Clear All Selection
            </button>
            <button class="btn-primary-dark" id="run-diagnosis-btn" ${selectedSymptoms.size === 0 ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
              Run Expert Diagnosis (${selectedSymptoms.size} Symptoms) <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Animal species click
    SUPPORTED_ANIMALS.forEach(anim => {
      const card = container.querySelector(`#pet-select-${anim.id}`);
      if (card) {
        card.addEventListener("click", () => {
          selectedPet = anim.id;
          state.petType = anim.id;
          render();
        });
      }
    });

    // Checkboxes
    const checkboxes = container.querySelectorAll(".checkbox-input");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", (e) => {
        if (e.target.checked) {
          selectedSymptoms.add(e.target.value);
        } else {
          selectedSymptoms.delete(e.target.value);
        }
        render();
      });
    });

    // AI Natural Language Extraction
    const nlpInput = container.querySelector("#ai-nlp-input");
    const extractBtn = container.querySelector("#ai-extract-btn");

    function executeAIExtraction(textToParse) {
      if (!textToParse) return;
      naturalLanguageInput = textToParse;
      const aiResult = extractSymptomsWithAI(textToParse, selectedPet);
      if (aiResult.extractedSymptoms.length > 0) {
        aiResult.extractedSymptoms.forEach(s => selectedSymptoms.add(s));
        aiExtractionNotice = `<strong>AI Extracted ${aiResult.extractedSymptoms.length} signs:</strong> [${aiResult.extractedSymptoms.join(", ")}]. ${aiResult.urgencyNotice || 'Populated into checklist!'}`;
      } else {
        aiExtractionNotice = `No recognized clinical terms found in input. Please select symptoms manually from the list.`;
      }
      render();
    }

    if (extractBtn && nlpInput) {
      extractBtn.addEventListener("click", () => executeAIExtraction(nlpInput.value.trim()));
      nlpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") executeAIExtraction(nlpInput.value.trim());
      });
    }

    // Quick prompt chip buttons
    const chips = container.querySelectorAll(".quick-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const promptText = chip.dataset.text;
        // Auto-switch animal if prompt indicates
        if (promptText.startsWith("Dog") || promptText.startsWith("Puppy")) selectedPet = "dog";
        if (promptText.startsWith("Cat")) selectedPet = "cat";
        if (promptText.startsWith("Horse")) selectedPet = "horse";
        if (promptText.startsWith("Rabbit")) selectedPet = "rabbit";
        if (promptText.startsWith("Bird")) selectedPet = "bird";
        state.petType = selectedPet;
        executeAIExtraction(promptText);
      });
    });

    // Toggle more
    const toggleBtn = container.querySelector("#toggle-more-symptoms-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        showMore = !showMore;
        render();
      });
    }

    // Clear Selection
    const clearBtn = container.querySelector("#clear-symptoms-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        selectedSymptoms.clear();
        aiExtractionNotice = null;
        render();
      });
    }

    // Search filter
    const searchInput = container.querySelector("#symptom-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value;
        render();
        const inputNow = container.querySelector("#symptom-search-input");
        if (inputNow) {
          inputNow.focus();
          inputNow.setSelectionRange(searchTerm.length, searchTerm.length);
        }
      });
    }

    // Mode toggle to Backward Chaining
    const modeBtn = container.querySelector("#mode-selector-btn");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => navigateTo("interactive-diagnosis"));
    }

    // Run Diagnosis Button
    const runBtn = container.querySelector("#run-diagnosis-btn");
    if (runBtn) {
      runBtn.addEventListener("click", () => {
        state.petType = selectedPet;
        state.symptoms = Array.from(selectedSymptoms);
        const results = runForwardChaining(selectedPet, Array.from(selectedSymptoms));
        state.forwardResult = results;
        state.reasoningMode = "Forward Chaining";
        navigateTo("diagnosis-results");
      });
    }
  }

  render();
}
