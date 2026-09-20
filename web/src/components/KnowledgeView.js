/**
 * KnowledgeView.js
 * ================
 * Interactive Knowledge Base explorer displaying all veterinary rules,
 * conditions, conclusions, confidence factors, and clinical citations.
 */

import { VET_RULES } from '../engine/rulesData.js';

export function renderKnowledgeView(container, navigateTo) {
  let activeFilter = "all";
  let searchFilter = "";

  function render() {
    const filteredRules = VET_RULES.filter(r => {
      const matchPet = activeFilter === "all" || r.pet_type === "both" || r.pet_type === activeFilter;
      const matchQuery = searchFilter === "" || 
        r.conclusion.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.conditions.some(c => c.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchPet && matchQuery;
    });

    container.innerHTML = `
      <div class="knowledge-view-wrapper">
        <div class="view-title-group" style="margin-bottom: 24px;">
          <h1>Knowledge Base Explorer</h1>
          <p>Browse the verified IF-THEN expert rules powering both forward and backward chaining engines.</p>
        </div>

        <!-- Filter & Search Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary-outline ${activeFilter === 'all' ? 'active' : ''}" id="filter-all-btn" style="${activeFilter === 'all' ? 'background: var(--primary-green); color: white;' : ''}">
              All Rules (${VET_RULES.length})
            </button>
            <button class="btn-secondary-outline ${activeFilter === 'dog' ? 'active' : ''}" id="filter-dog-btn" style="${activeFilter === 'dog' ? 'background: var(--primary-green); color: white;' : ''}">
              🐕 Canine Rules
            </button>
            <button class="btn-secondary-outline ${activeFilter === 'cat' ? 'active' : ''}" id="filter-cat-btn" style="${activeFilter === 'cat' ? 'background: var(--primary-green); color: white;' : ''}">
              🐈 Feline Rules
            </button>
          </div>

          <div style="max-width: 300px; width: 100%;">
            <input 
              type="text" 
              class="search-input" 
              id="rule-search-input" 
              placeholder="Search rule or symptom..." 
              value="${searchFilter}"
            />
          </div>
        </div>

        <!-- Rules Table -->
        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 70px;">Rule ID</th>
                <th style="width: 80px;">Species</th>
                <th>Antecedent (IF Conditions)</th>
                <th>Consequent (THEN Conclusion)</th>
                <th style="width: 100px;">Certainty</th>
                <th style="width: 140px;">Severity</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRules.map(rule => `
                <tr>
                  <td><span class="rule-code-chip" style="font-weight: 700;">${rule.id}</span></td>
                  <td>${rule.pet_type === 'cat' ? '🐈 Cat' : rule.pet_type === 'dog' ? '🐕 Dog' : '🐾 Both'}</td>
                  <td>
                    <div style="font-size: 13px; line-height: 1.4;">
                      ${rule.conditions.map(c => `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-right: 4px; display: inline-block; margin-bottom: 2px;">${c}</span>`).join(" <strong>AND</strong> ")}
                    </div>
                  </td>
                  <td>
                    <strong>${rule.conclusion}</strong>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${rule.explanation}</div>
                  </td>
                  <td><span class="most-likely-badge">${Math.round(rule.confidence * 100)}%</span></td>
                  <td>
                    <span style="font-size: 12px; font-weight: 600; color: ${rule.severity.includes('Critical') || rule.severity.includes('High') ? '#b91c1c' : '#047857'};">
                      ${rule.severity}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    container.querySelector("#filter-all-btn").addEventListener("click", () => {
      activeFilter = "all";
      render();
    });
    container.querySelector("#filter-dog-btn").addEventListener("click", () => {
      activeFilter = "dog";
      render();
    });
    container.querySelector("#filter-cat-btn").addEventListener("click", () => {
      activeFilter = "cat";
      render();
    });

    const searchInput = container.querySelector("#rule-search-input");
    searchInput.addEventListener("input", (e) => {
      searchFilter = e.target.value;
      render();
      const inputNow = container.querySelector("#rule-search-input");
      if (inputNow) {
        inputNow.focus();
        inputNow.setSelectionRange(searchFilter.length, searchFilter.length);
      }
    });
  }

  render();
}
