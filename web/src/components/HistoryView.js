/**
 * HistoryView.js
 * ==============
 * Diagnosis History viewer with localStorage persistence.
 */

export function renderHistoryView(container, navigateTo) {
  const history = JSON.parse(localStorage.getItem("vetassist_history") || "[]");

  container.innerHTML = `
    <div class="history-view-wrapper">
      <div class="view-title-group" style="margin-bottom: 24px;">
        <h1>Diagnosis History</h1>
        <p>Review previously saved assessments and reasoning sessions.</p>
      </div>

      ${history.length === 0 ? `
        <div style="background: white; padding: 48px; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--card-border);">
          <div style="font-size: 38px; margin-bottom: 12px;">📋</div>
          <h3 style="font-size: 18px; font-weight: 700;">No Saved History Yet</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-top: 6px; margin-bottom: 20px;">
            Run a symptom check or backward chaining diagnosis and click 'Save Result' to keep a clinical log.
          </p>
          <button class="btn-primary-dark" id="history-start-diag-btn">
            Start New Diagnosis &rarr;
          </button>
        </div>
      ` : `
        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Pet Species</th>
                <th>Diagnosis Conclusion</th>
                <th>Confidence</th>
                <th>Reasoning Mode</th>
                <th>Reported Symptoms</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(item => `
                <tr>
                  <td style="font-weight: 600;">${item.date}</td>
                  <td>${item.petType === 'cat' ? '🐈 Cat' : '🐕 Dog'}</td>
                  <td><strong>${item.conditionName}</strong></td>
                  <td><span class="most-likely-badge">${item.confidencePct}%</span></td>
                  <td><span class="rule-code-chip">${item.mode}</span></td>
                  <td style="color: var(--text-muted);">${(item.symptoms || []).join(", ") || 'N/A'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
          <button class="btn-secondary-outline" id="clear-history-btn" style="color: #ef4444;">
            Clear All History
          </button>
        </div>
      `}
    </div>
  `;

  const startBtn = container.querySelector("#history-start-diag-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => navigateTo("symptom-checker"));
  }

  const clearBtn = container.querySelector("#clear-history-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem("vetassist_history");
      renderHistoryView(container, navigateTo);
    });
  }
}
