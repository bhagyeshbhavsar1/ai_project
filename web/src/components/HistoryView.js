/**
 * HistoryView.js
 * ==============
 * Assessment History viewer with localStorage persistence,
 * single-item delete, clear-all, and plain-language formatting.
 */

import { getFriendlySymptomName } from '../utils/formatters.js';

export function renderHistoryView(container, navigateTo) {
  function getHistory() {
    return JSON.parse(localStorage.getItem("vetassist_history") || "[]");
  }

  function render() {
    const history = getHistory();

    const speciesIcons = {
      dog: "🐕 Dog",
      cat: "🐈 Cat",
      horse: "🐎 Horse",
      rabbit: "🐇 Rabbit",
      bird: "🦜 Bird",
      cattle: "🐄 Cattle",
      sheep: "🐑 Sheep"
    };

    container.innerHTML = `
      <div class="history-view-wrapper">
        <div class="view-title-group" style="margin-bottom: 24px;">
          <!-- Task 22: "Assessment History" -->
          <h1>Assessment History</h1>
          <p>Review previously saved assessments and reasoning sessions.</p>
        </div>

        ${history.length === 0 ? `
          <div style="background: white; padding: 48px; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--card-border);">
            <div style="font-size: 38px; margin-bottom: 12px;">📋</div>
            <h3 style="font-size: 18px; font-weight: 700;">No Saved Assessments Yet</h3>
            <p style="color: var(--text-muted); font-size: 14px; margin-top: 6px; margin-bottom: 20px;">
              Run a health check or interactive inquiry and results will be automatically logged here.
            </p>
            <button class="btn-primary-dark" id="history-start-diag-btn">
              Start New Health Check &rarr;
            </button>
          </div>
        ` : `
          <div class="table-card" style="overflow-x: auto;">
            <table class="custom-table" style="min-width: 650px;">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Species</th>
                  <!-- Task 22: "Possible Condition", not "Diagnosis Conclusion" -->
                  <th>Possible Condition</th>
                  <th>Certainty</th>
                  <th>Mode</th>
                  <th>Observed Signs</th>
                  <!-- Task 31: Individual delete action -->
                  <th style="width: 70px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${history.map((item, idx) => `
                  <tr>
                    <td style="font-weight: 600; font-size: 13px;">${item.date}</td>
                    <td>${speciesIcons[item.petType] || '🐾 ' + (item.petType || 'Pet')}</td>
                    <td><strong>${item.conditionName}</strong></td>
                    <td><span class="most-likely-badge">${item.confidencePct}%</span></td>
                    <td><span class="rule-code-chip" style="font-size: 11px;">${item.mode}</span></td>
                    <td style="color: var(--text-muted); font-size: 12.5px;">
                      ${(item.symptoms || []).map(getFriendlySymptomName).join(", ") || 'General evaluation'}
                    </td>
                    <td style="text-align: center;">
                      <button 
                        class="delete-history-btn" 
                        data-index="${idx}" 
                        data-id="${item.id}"
                        title="Delete this record"
                        style="background: transparent; border: 1px solid #fecaca; color: #dc2626; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px;"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          
          <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <button class="btn-secondary-outline" id="history-start-diag-btn" style="font-size: 13px;">
              Start New Check &rarr;
            </button>
            <button class="btn-secondary-outline" id="clear-history-btn" style="color: #ef4444; border-color: #fca5a5; font-size: 13px;">
              Clear All History
            </button>
          </div>
        `}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const startBtn = container.querySelector("#history-start-diag-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => navigateTo("symptom-checker"));
    }

    // Task 31: Clear all history
    const clearBtn = container.querySelector("#clear-history-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all assessment history?")) {
          localStorage.removeItem("vetassist_history");
          render();
        }
      });
    }

    // Task 31: Delete individual history item
    const deleteBtns = container.querySelectorAll(".delete-history-btn");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const history = getHistory();
        history.splice(idx, 1);
        localStorage.setItem("vetassist_history", JSON.stringify(history));
        render();
      });
    });
  }

  render();
}
