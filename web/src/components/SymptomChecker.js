/**
 * SymptomChecker.js
 * =================
 * Screen 2: Forward Chaining Symptom Checker View with:
 * 1. Multi-Animal Selection (Dog, Cat, Horse, Rabbit, Bird, Cattle, Sheep)
 * 2. Clear instructions for pet owners
 * 3. Categorized, Searchable Symptom Grid with friendly plain-language labels
 * 4. Mode switcher popover with clear descriptions
 * 5. "Try an example" quick presets
 * 6. Disabled state explaining "Select at least 1 symptom to continue"
 */

import { SUPPORTED_ANIMALS, ALL_SYMPTOMS } from '../engine/rulesData.js';
import { runForwardChaining } from '../engine/forwardChain.js';
import { extractSymptomsWithAI } from '../engine/aiAssistant.js';
import { getFriendlySymptomName } from '../utils/formatters.js';

export function renderSymptomChecker(container, navigateTo, state) {
  let selectedPet = state.petType || "dog";
  // Task 1: Start with NO symptoms pre-selected
  let selectedSymptoms = new Set(state.symptoms || []);
  let showMore = false;
  let searchTerm = "";
  let naturalLanguageInput = "";
  let aiExtractionNotice = null;
  let showModeMenu = false;

  function render() {
    // Filter symptoms applicable to selected animal or general
    const animalSymptoms = ALL_SYMPTOMS.filter(s => 
      !s.animals || s.animals.includes(selectedPet) || s.category === "General"
    );

    const commonList = animalSymptoms.slice(0, 12);
    const visibleSymptoms = animalSymptoms.filter(s => {
      const friendly = getFriendlySymptomName(s.id);
      const matchesSearch = s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            friendly.toLowerCase().includes(searchTerm.toLowerCase());
      if (searchTerm) return matchesSearch;
      return showMore ? true : commonList.some(cs => cs.id === s.id);
    });

    container.innerHTML = `
      <div class="symptom-checker-wrapper">
        <!-- View Header -->
        <div class="view-header">
          <div class="view-title-group">
            <h1>Symptom Checker</h1>
            <!-- Task 2: One-line instruction at the top -->
            <p style="color: var(--primary-green); font-weight: 600; font-size: 14.5px;">
              Pick your animal, tick every sign you have noticed, then press Diagnose.
            </p>
          </div>
        </div>

        <!-- Task 29: "Try an example" presets on Symptom Checker -->
        <div style="background: #ffffff; border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 15px;">💡</span>
            <span style="font-size: 13px; font-weight: 700; color: #334155;">Try an example:</span>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="preset-pill-btn" id="example-kennel-cough" style="padding: 5px 11px; font-size: 12px; border-radius: var(--radius-full); border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer; color: #1e293b; font-weight: 500;">
              🐕 Kennel Cough (Dog)
            </button>
            <button class="preset-pill-btn" id="example-parvo" style="padding: 5px 11px; font-size: 12px; border-radius: var(--radius-full); border: 1px solid #fca5a5; background: #fef2f2; cursor: pointer; color: #991b1b; font-weight: 500;">
              🚨 Parvovirus Warning (Dog)
            </button>
            <button class="preset-pill-btn" id="example-flutd" style="padding: 5px 11px; font-size: 12px; border-radius: var(--radius-full); border: 1px solid #ddd6fe; background: #f5f3ff; cursor: pointer; color: #5b21b6; font-weight: 500;">
              🐈 FLUTD Straining (Cat)
            </button>
            <button class="preset-pill-btn" id="example-multi-hop" style="padding: 5px 11px; font-size: 12px; border-radius: var(--radius-full); border: 1px solid #bae6fd; background: #f0f9ff; cursor: pointer; color: #0369a1; font-weight: 500;">
              🔗 Multi-Hop Chain (R1 &rarr; R5)
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
            <span>Review Possible Conditions</span>
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
            <span class="most-likely-badge" style="background: #dcfce7; color: #166534; font-size: 11px;">AI Assistant</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">
            Describe your pet's behavior in your own words (e.g. <em>"My dog has a fever, dry cough, and is unusually sluggish"</em>). We will automatically match and tick the symptoms below!
          </p>

          <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
            <input 
              type="text" 
              class="search-input" 
              id="ai-nlp-input" 
              placeholder="Describe what you notice in your pet..." 
              value="${naturalLanguageInput}"
              style="height: 42px; border-radius: var(--radius-sm); border: 1px solid #a7f3d0; background: white; flex: 1; min-width: 220px;"
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

          ${aiExtractionNotice ? (aiExtractionNotice.success ? `
            <div style="margin-top: 14px; padding: 14px 16px; border-radius: var(--radius-sm); background: #ecfdf5; border: 1.5px solid #10b981; font-size: 13.5px; color: #064e3b;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">✨</span>
                  <strong>AI Extracted ${aiExtractionNotice.count} Clinical Sign${aiExtractionNotice.count > 1 ? 's' : ''} for ${aiExtractionNotice.animalName}:</strong>
                </div>
                ${aiExtractionNotice.urgencyNotice ? `<span class="most-likely-badge" style="background: #fee2e2; color: #991b1b; font-size: 11px;">⚠️ Urgent Triage</span>` : ''}
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0;">
                ${aiExtractionNotice.symptoms.map(s => `
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #ffffff; border: 1px solid #6ee7b7; border-radius: var(--radius-full); font-size: 12.5px; font-weight: 600; color: #065f46;">
                    <span>✓</span> ${getFriendlySymptomName(s)}
                  </span>
                `).join('')}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px dashed #6ee7b7; padding-top: 10px; margin-top: 6px;">
                <span style="font-size: 12px; color: #047857;">Signs have been ticked automatically in the list below.</span>
                <button class="btn-primary-dark" id="ai-quick-diagnose-btn" style="padding: 7px 18px; font-size: 13px; background: #059669;">
                  Run Diagnosis on Extracted Signs (${aiExtractionNotice.count}) &rarr;
                </button>
              </div>
            </div>
          ` : `
            <div style="margin-top: 12px; padding: 12px 14px; border-radius: var(--radius-sm); background: #fef2f2; border: 1px solid #fca5a5; font-size: 13px; color: #991b1b; display: flex; align-items: center; gap: 8px;">
              <span>ℹ️</span>
              <div>${aiExtractionNotice.message}</div>
            </div>
          `) : ''}
        </div>

        <!-- 2. Select Symptoms Checkboxes -->
        <div class="symptoms-container-card">
          <div class="symptoms-header-row">
            <div>
              <h2 class="section-block-title" style="margin-bottom: 2px;">2. Observed Signs & Symptoms</h2>
              <span style="font-size: 12.5px; color: var(--text-muted);">
                Showing signs for <strong>${SUPPORTED_ANIMALS.find(a => a.id === selectedPet)?.name || 'Selected Species'}</strong> (${selectedSymptoms.size} selected)
              </span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="symptoms-search">
                <input 
                  type="text" 
                  class="search-input" 
                  id="symptom-search-input" 
                  placeholder="Filter signs..." 
                  value="${searchTerm}"
                />
              </div>
              <span class="common-tag">Evidence-Based</span>
            </div>
          </div>

          <div class="symptoms-checkbox-grid">
            ${visibleSymptoms.map(sym => {
              // Task 4: Friendly labels instead of raw ids
              let displayLabel = sym.label;
              if (sym.id === "bloody_diarrhea") displayLabel = "Blood in diarrhea";
              if (sym.id === "no_fecal_pellets") displayLabel = "No droppings / fecal pellets (>8h)";
              return `
                <label class="checkbox-label ${selectedSymptoms.has(sym.id) ? 'checked' : ''}">
                  <input 
                    type="checkbox" 
                    class="checkbox-input" 
                    value="${sym.id}" 
                    ${selectedSymptoms.has(sym.id) ? 'checked' : ''}
                  />
                  <span>${displayLabel}</span>
                </label>
              `;
            }).join("")}
          </div>

          ${!searchTerm && animalSymptoms.length > 12 ? `
            <button class="toggle-more-btn" id="toggle-more-symptoms-btn">
              <span>${showMore ? 'Show Fewer Signs ▲' : `Show All ${animalSymptoms.length} Signs ▼`}</span>
            </button>
          ` : ''}

          <!-- Task 5: When Diagnose is disabled, show reason: "Select at least 1 symptom to continue." -->
          <div class="checker-actions" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <button class="btn-secondary-outline" id="clear-symptoms-btn" style="font-size: 13px; padding: 8px 16px;">
              Clear All Selection
            </button>

            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              ${selectedSymptoms.size === 0 ? `
                <span class="disabled-reason-hint" style="font-size: 13px; color: #dc2626; font-weight: 500;">
                  ⚠️ Select at least 1 symptom to continue.
                </span>
              ` : ''}
              <button 
                class="btn-primary-dark" 
                id="run-diagnosis-btn" 
                ${selectedSymptoms.size === 0 ? 'disabled style="opacity: 0.55; cursor: not-allowed;"' : ''}
              >
                <!-- Task 22: Say "possible condition", never "diagnosis is" -->
                Check Possible Conditions (${selectedSymptoms.size} Selected) <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Task 29: Presets on Symptom Checker
    const btnKC = container.querySelector("#example-kennel-cough");
    if (btnKC) {
      btnKC.addEventListener("click", () => {
        selectedPet = "dog";
        state.petType = "dog";
        selectedSymptoms = new Set(["fever", "coughing", "lethargy"]);
        state.symptoms = Array.from(selectedSymptoms);
        aiExtractionNotice = `Loaded example: <strong>Kennel Cough (Dog)</strong> with Fever, Coughing, Lethargy.`;
        render();
      });
    }

    const btnParvo = container.querySelector("#example-parvo");
    if (btnParvo) {
      btnParvo.addEventListener("click", () => {
        selectedPet = "dog";
        state.petType = "dog";
        selectedSymptoms = new Set(["vomiting", "bloody_diarrhea", "lethargy", "unvaccinated"]);
        state.symptoms = Array.from(selectedSymptoms);
        aiExtractionNotice = `Loaded example: <strong>Parvovirus Emergency (Dog)</strong>.`;
        render();
      });
    }

    const btnFlutd = container.querySelector("#example-flutd");
    if (btnFlutd) {
      btnFlutd.addEventListener("click", () => {
        selectedPet = "cat";
        state.petType = "cat";
        selectedSymptoms = new Set(["straining_to_urinate", "frequent_litter_box_visits", "crying_in_litter_box"]);
        state.symptoms = Array.from(selectedSymptoms);
        aiExtractionNotice = `Loaded example: <strong>FLUTD Triage (Cat)</strong>.`;
        render();
      });
    }

    const btnMultiHop = container.querySelector("#example-multi-hop");
    if (btnMultiHop) {
      btnMultiHop.addEventListener("click", () => {
        selectedPet = "dog";
        state.petType = "dog";
        selectedSymptoms = new Set(["fever", "coughing", "lethargy", "nasal_discharge"]);
        state.symptoms = Array.from(selectedSymptoms);
        aiExtractionNotice = `Loaded example: <strong>Multi-Hop Chaining (R1 &rarr; R5)</strong>.`;
        render();
      });
    }

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
        state.symptoms = Array.from(selectedSymptoms);
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
      if (aiResult.detectedAnimal && aiResult.detectedAnimal !== selectedPet) {
        selectedPet = aiResult.detectedAnimal;
        state.petType = selectedPet;
      }
      if (aiResult.extractedSymptoms.length > 0) {
        aiResult.extractedSymptoms.forEach(s => selectedSymptoms.add(s));
        state.symptoms = Array.from(selectedSymptoms);
        const animalName = SUPPORTED_ANIMALS.find(a => a.id === selectedPet)?.name || selectedPet;
        aiExtractionNotice = {
          success: true,
          animalName: animalName,
          count: aiResult.extractedSymptoms.length,
          symptoms: aiResult.extractedSymptoms,
          urgencyNotice: aiResult.urgencyNotice
        };
      } else {
        aiExtractionNotice = {
          success: false,
          message: "No matching clinical signs found in that description. Try everyday words like 'coughing', 'vomiting', 'wont eat', 'scratching ears', or tick signs from the list below."
        };
      }
      render();
    }

    if (extractBtn && nlpInput) {
      extractBtn.addEventListener("click", () => executeAIExtraction(nlpInput.value.trim()));
      nlpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") executeAIExtraction(nlpInput.value.trim());
      });
    }

    // AI Quick Diagnose Direct Button
    const quickDiagnoseBtn = container.querySelector("#ai-quick-diagnose-btn");
    if (quickDiagnoseBtn) {
      quickDiagnoseBtn.addEventListener("click", () => {
        if (selectedSymptoms.size === 0) return;
        state.petType = selectedPet;
        state.symptoms = Array.from(selectedSymptoms);
        const results = runForwardChaining(selectedPet, Array.from(selectedSymptoms));
        state.forwardResult = results;
        state.reasoningMode = "Forward Chaining";
        navigateTo("diagnosis-results");
      });
    }

    // Quick prompt chip buttons
    const chips = container.querySelectorAll(".quick-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const promptText = chip.dataset.text;
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
        state.symptoms = [];
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

    // Run Diagnosis Button
    const runBtn = container.querySelector("#run-diagnosis-btn");
    if (runBtn) {
      runBtn.addEventListener("click", () => {
        if (selectedSymptoms.size === 0) return;
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
