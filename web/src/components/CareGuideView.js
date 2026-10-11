/**
 * CareGuideView.js
 * ================
 * Pet Care Guide and Multi-Species Emergency Triage Matrix.
 * Covers Dog, Cat, Horse, Rabbit, Bird, Cattle, and Sheep (Task 32).
 */

export function renderCareGuideView(container, navigateTo) {
  container.innerHTML = `
    <div class="care-guide-wrapper">
      <div class="view-title-group" style="margin-bottom: 24px;">
        <h1>Pet Care & Emergency Triage Guide</h1>
        <p>Essential guidance on recognizing urgent veterinary emergencies and preventive animal wellness.</p>
      </div>

      <!-- Critical Red Flags -->
      <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: var(--radius-md); padding: 22px 24px; margin-bottom: 24px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="font-size: 24px; color: #dc2626;">🚨</div>
          <div>
            <h3 style="color: #991b1b; font-size: 16px; font-weight: 700;">Immediate Emergency Red Flags Across All Species</h3>
            <p style="color: #b91c1c; font-size: 13.5px; margin-top: 4px; line-height: 1.5;">
              If your animal exhibits any of the following, seek 24/7 emergency veterinary care immediately without waiting:
            </p>
            <ul style="margin-top: 8px; margin-left: 18px; color: #991b1b; font-size: 13px; line-height: 1.6;">
              <li><strong>Severe respiratory distress</strong>: Open-mouth breathing in cats/birds, tail bobbing, gasping, blue or pale gums.</li>
              <li><strong>Inability to urinate</strong>: Especially male cats straining/crying at the litter box (fatal within 24-48h).</li>
              <li><strong>Bloat & distention</strong>: Distended left flank in cattle/sheep, hard bloated abdomen with dry retching in dogs.</li>
              <li><strong>Severe GI distress</strong>: Absence of fecal pellets in rabbits (>8 hours), profuse bloody diarrhea in puppies.</li>
              <li><strong>Acute agony or collapse</strong>: Violent rolling in horses (acute colic), inability to stand, seizures > 3 minutes.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Multi-Species Triage Matrix Grid (Task 32: Dog, Cat, Horse, Rabbit, Bird, Cattle, Sheep) -->
      <div class="features-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <!-- Dog -->
        <div class="feature-card">
          <div class="feature-icon-box">🐕</div>
          <h3 class="feature-title">Canine Emergency Signs & Care</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>Emergency Signs:</strong> Unproductive dry retching (GDV bloat), projectile bloody diarrhea + vomiting (Parvovirus), collapse.<br/>
            • <strong>Core Prevention:</strong> Rabies, DHPP vaccinations; annual Bordetella if boarding; year-round flea/tick/heartworm prevention.<br/>
            • <strong>Hazards:</strong> Chocolate, grapes, raisins, onions, garlic, xylitol/birch bark sweeteners.
          </p>
        </div>

        <!-- Cat -->
        <div class="feature-card">
          <div class="feature-icon-box">🐈</div>
          <h3 class="feature-title">Feline Emergency Signs & Care</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>Emergency Signs:</strong> Straining in litter box with no urine (FLUTD blockage), open-mouth panting, sudden hind leg paralysis.<br/>
            • <strong>Core Prevention:</strong> FVRCP vaccines, ample water fountains to prevent crystal formation, daily brushing.<br/>
            • <strong>Deadly Hazard:</strong> True lilies (Lilium spp.) — even licking pollen or drinking vase water causes fatal acute kidney failure.
          </p>
        </div>

        <!-- Horse -->
        <div class="feature-card">
          <div class="feature-icon-box">🐎</div>
          <h3 class="feature-title">Equine (Horse) Emergency Signs</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>Acute Colic Signs:</strong> Pawing at ground, looking at or biting flank, repeated violent rolling, absence of gut sounds.<br/>
            • <strong>Laminitis (Founder):</strong> Reluctance to walk, rocking back on hind hooves, bounding digital pulse, hot hooves.<br/>
            • <strong>Immediate Action:</strong> Keep horse walking slowly; do NOT allow rolling or administer feed until a veterinarian arrives.
          </p>
        </div>

        <!-- Rabbit -->
        <div class="feature-card">
          <div class="feature-icon-box">🐇</div>
          <h3 class="feature-title">Rabbit (Lagomorph) Emergency Signs</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>GI Stasis Emergency:</strong> Refusing favorite treats/hay, hunched painful posture, tooth grinding, no fecal pellets for >8 hours.<br/>
            • <strong>Head Tilt (Torticollis):</strong> Loss of balance, rolling, caused by E. cuniculi or severe inner ear infection.<br/>
            • <strong>Critical Rule:</strong> Rabbits cannot vomit; GI slowdown is rapidly fatal within 24 hours without prompt vet syringe hydration.
          </p>
        </div>

        <!-- Bird -->
        <div class="feature-card">
          <div class="feature-icon-box">🦜</div>
          <h3 class="feature-title">Avian (Bird) Emergency Signs</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>Acute Dyspnea:</strong> Tail bobbing up and down with each breath, open-beak breathing, audible respiratory clicking.<br/>
            • <strong>Illness Masking:</strong> Sitting puffed on cage bottom, loss of balance, bleeding feather (can bleed out quickly).<br/>
            • <strong>Toxin Hazard:</strong> Overheated Teflon/PTFE non-stick cookware fumes, aerosol sprays, scented candles kill pet birds in minutes.
          </p>
        </div>

        <!-- Cattle -->
        <div class="feature-card">
          <div class="feature-icon-box">🐄</div>
          <h3 class="feature-title">Cattle (Bovine) Emergency Signs</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>Acute Ruminal Bloat:</strong> Rapidly swelling drum-tight left flank, respiratory grunting, frequent defecation attempts.<br/>
            • <strong>Acute Mastitis:</strong> Hot, firm, swollen quarter udder accompanied by watery, clotted, or bloody milk secretions and high fever.<br/>
            • <strong>Action:</strong> Bloat is an immediate asphyxiation emergency requiring immediate veterinary stomach tube or trocar relief.
          </p>
        </div>

        <!-- Sheep -->
        <div class="feature-card">
          <div class="feature-icon-box">🐑</div>
          <h3 class="feature-title">Sheep & Goat Emergency Signs</h3>
          <p class="feature-desc" style="font-size: 13px; line-height: 1.6; margin-top: 6px;">
            • <strong>Ruminal Bloat:</strong> Distended left paralumbar fossa, labored breathing, kicking at abdomen.<br/>
            • <strong>Contagious Footrot:</strong> Severe kneeling/grazing lameness, separation of outer hoof horn, pungent necrotizing odor.<br/>
            • <strong>Urinary Calculi (Wethers):</strong> Straining, vocalizing, tail pumping due to urethral stones from imbalanced calcium/phosphorus feed.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button class="btn-primary-dark" id="guide-start-diag-btn">
          Run Expert Health Check &rarr;
        </button>
      </div>
    </div>
  `;

  const btn = container.querySelector("#guide-start-diag-btn");
  if (btn) btn.addEventListener("click", () => navigateTo("symptom-checker"));
}
