/**
 * CareGuideView.js
 * ================
 * Pet Care Guide and Emergency Triage Matrix.
 */

export function renderCareGuideView(container, navigateTo) {
  container.innerHTML = `
    <div class="care-guide-wrapper">
      <div class="view-title-group" style="margin-bottom: 24px;">
        <h1>Pet Care & Triage Guide</h1>
        <p>Essential guidance on recognizing veterinary emergencies and preventive pet wellness.</p>
      </div>

      <!-- Critical Red Flags -->
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 22px 24px; margin-bottom: 24px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="font-size: 24px; color: #dc2626;">🚨</div>
          <div>
            <h3 style="color: #991b1b; font-size: 16px; font-weight: 700;">Immediate Emergency Red Flags</h3>
            <p style="color: #b91c1c; font-size: 13.5px; margin-top: 4px; line-height: 1.5;">
              If your pet exhibits any of the following, seek 24/7 emergency veterinary care immediately without waiting:
            </p>
            <ul style="margin-top: 8px; margin-left: 18px; color: #991b1b; font-size: 13px; line-height: 1.6;">
              <li><strong>Severe respiratory distress</strong>: Open-mouth breathing in cats, blue/pale gums, gasping for air.</li>
              <li><strong>Inability to urinate</strong>: Especially male cats crying and straining at the litter box (urethral obstruction is fatal within 24-48h).</li>
              <li><strong>Bloat / GDV signs</strong>: Hard distended abdomen, pacing, unproductive dry retching.</li>
              <li><strong>Profuse bloody vomiting or bloody diarrhea</strong>: Rapid dehydration risk, especially in unvaccinated puppies (Parvovirus).</li>
              <li><strong>Collapse or unresponsiveness</strong>: Inability to stand, seizures lasting > 3 minutes, or suspected toxin ingestion.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Triage Matrix Grid -->
      <div class="features-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 24px;">
        <div class="feature-card">
          <div class="feature-icon-box">🐕</div>
          <h3 class="feature-title">Canine Wellness Essentials</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • Core vaccinations (Rabies, DHPP: Distemper, Hepatitis, Parvovirus, Parainfluenza).<br/>
            • Bordetella (Kennel Cough) vaccine for dogs in daycares, boarding, or grooming salons.<br/>
            • Year-round flea, tick, and heartworm preventative therapy.<br/>
            • Strict avoidance of human toxic foods: Chocolate, grapes, raisins, onions, garlic, xylitol.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">🐈</div>
          <h3 class="feature-title">Feline Health Essentials</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • Core FVRCP vaccinations (Panleukopenia, Calicivirus, Herpesvirus-1).<br/>
            • Adequate hydration: Multiple clean water bowls or pet fountains to prevent urinary crystals.<br/>
            • Daily coat brushing to prevent trichobezoar (hairball) intestinal blockages.<br/>
            • Toxic plant hazard: True Lilies are fatally nephrotoxic to cats even from pollen grooming.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button class="btn-primary-dark" id="guide-start-diag-btn">
          Run Expert Symptom Check &rarr;
        </button>
      </div>
    </div>
  `;

  container.querySelector("#guide-start-diag-btn").addEventListener("click", () => navigateTo("symptom-checker"));
}
