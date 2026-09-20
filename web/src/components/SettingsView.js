/**
 * SettingsView.js
 * ===============
 * Settings and presets for demo testing.
 */

export function renderSettingsView(container, navigateTo, state) {
  container.innerHTML = `
    <div class="settings-wrapper">
      <div class="view-title-group" style="margin-bottom: 24px;">
        <h1>Settings & Demo Presets</h1>
        <p>Configure reasoning thresholds or quickly load pre-configured clinical test scenarios.</p>
      </div>

      <!-- Quick Demo Presets for Presentations -->
      <div class="symptoms-container-card" style="margin-bottom: 24px;">
        <h2 class="section-block-title">Interactive Demo Presets</h2>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px;">
          Select a preset to automatically populate symptoms and demonstrate inference:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div class="feature-card" style="cursor: pointer;" id="preset-kennel-cough">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--primary-green);">Preset 1: Kennel Cough (Dog)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Symptoms: Fever, Coughing, Lethargy. Verifies Rule R1.
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Preset &rarr;
            </button>
          </div>

          <div class="feature-card" style="cursor: pointer;" id="preset-parvo">
            <h4 style="font-size: 14px; font-weight: 700; color: #dc2626;">Preset 2: Parvovirus Emergency (Dog)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Symptoms: Vomiting, Bloody Diarrhea, Lethargy, Unvaccinated. Verifies Rule R2.
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Preset &rarr;
            </button>
          </div>

          <div class="feature-card" style="cursor: pointer;" id="preset-flutd">
            <h4 style="font-size: 14px; font-weight: 700; color: #7c3aed;">Preset 3: FLUTD Triage (Cat)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Symptoms: Straining to urinate, frequent box visits, crying in box. Verifies Rule R11.
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Preset &rarr;
            </button>
          </div>

          <div class="feature-card" style="cursor: pointer;" id="preset-multi-hop">
            <h4 style="font-size: 14px; font-weight: 700; color: #0284c7;">Preset 4: Multi-Hop Chaining (R1 &rarr; R5)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Symptoms: Fever, Coughing, Lethargy + Nasal Discharge. Demonstrates derived fact chaining!
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Preset &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Engine Configuration -->
      <div class="symptoms-container-card">
        <h2 class="section-block-title">Reasoning Parameters</h2>
        <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
          <div>
            <label style="font-size: 13.5px; font-weight: 600; display: block; margin-bottom: 6px;">
              Minimum Differential Match Threshold:
            </label>
            <input type="range" min="20" max="80" value="40" style="width: 100%; accent-color: var(--accent-emerald);" />
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
              <span>20% (Loose)</span>
              <span>40% (Standard)</span>
              <span>80% (Strict)</span>
            </div>
          </div>

          <div>
            <label style="font-size: 13.5px; font-weight: 600; display: block; margin-bottom: 6px;">
              Active Knowledge Base:
            </label>
            <div class="rule-code-chip" style="display: inline-block;">data/rules.json (20 Rules Active)</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Preset Handlers
  container.querySelector("#preset-kennel-cough").addEventListener("click", () => {
    state.petType = "dog";
    state.symptoms = ["fever", "coughing", "lethargy"];
    navigateTo("symptom-checker");
  });

  container.querySelector("#preset-parvo").addEventListener("click", () => {
    state.petType = "dog";
    state.symptoms = ["vomiting", "bloody_diarrhea", "lethargy", "unvaccinated"];
    navigateTo("symptom-checker");
  });

  container.querySelector("#preset-flutd").addEventListener("click", () => {
    state.petType = "cat";
    state.symptoms = ["straining_to_urinate", "frequent_litter_box_visits", "crying_in_litter_box"];
    navigateTo("symptom-checker");
  });

  container.querySelector("#preset-multi-hop").addEventListener("click", () => {
    state.petType = "dog";
    state.symptoms = ["fever", "coughing", "lethargy", "nasal_discharge"];
    navigateTo("symptom-checker");
  });
}
