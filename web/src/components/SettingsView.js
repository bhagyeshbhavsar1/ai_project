/**
 * SettingsView.js
 * ===============
 * Settings and presets renamed to "Try an example" (Task 29).
 */

export function renderSettingsView(container, navigateTo, state) {
  container.innerHTML = `
    <div class="settings-wrapper">
      <div class="view-title-group" style="margin-bottom: 24px;">
        <h1>Settings & Examples</h1>
        <p>Configure reasoning thresholds or quickly load pre-configured clinical test scenarios.</p>
      </div>

      <!-- Task 29: Rename presets to "Try an example" -->
      <div class="symptoms-container-card" style="margin-bottom: 24px;">
        <h2 class="section-block-title">Try an example</h2>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px;">
          Select any pre-configured scenario to see how the expert engine evaluates rules step-by-step:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div class="feature-card" style="cursor: pointer;" id="preset-kennel-cough">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--primary-green);">Example 1: Kennel Cough (Dog)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Signs: Fever, Coughing, Lethargy. Evaluates Rule R1 to 72% confidence.
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Example &rarr;
            </button>
          </div>

          <div class="feature-card" style="cursor: pointer;" id="preset-parvo">
            <h4 style="font-size: 14px; font-weight: 700; color: #dc2626;">Example 2: Parvovirus Warning (Dog)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Signs: Vomiting, Blood in diarrhea, Lethargy, Not vaccinated. Evaluates Rule R2.
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Example &rarr;
            </button>
          </div>

          <div class="feature-card" style="cursor: pointer;" id="preset-flutd">
            <h4 style="font-size: 14px; font-weight: 700; color: #7c3aed;">Example 3: FLUTD Straining (Cat)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Signs: Straining to pee, frequent box visits, crying in box. Evaluates Rule R11.
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Example &rarr;
            </button>
          </div>

          <div class="feature-card" style="cursor: pointer;" id="preset-multi-hop">
            <h4 style="font-size: 14px; font-weight: 700; color: #0284c7;">Example 4: Multi-Hop Chaining (R1 &rarr; R5)</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
              Signs: Fever, Coughing, Lethargy + Nasal Discharge. Demonstrates derived fact chaining!
            </p>
            <button class="btn-secondary-outline" style="margin-top: 10px; width: fit-content; font-size: 12px; padding: 6px 12px;">
              Load Example &rarr;
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
              Minimum Candidate Match Threshold:
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
            <div class="rule-code-chip" style="display: inline-block;">data/rules.json (15 Clinical Rules Active)</div>
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
