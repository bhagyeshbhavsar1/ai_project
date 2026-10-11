/**
 * main.js
 * =======
 * Main Application Orchestrator for VetAssist Web.
 * Connects the inference engines, sidebar navigation, hamburger toggle,
 * hash routing, global search, and view rendering.
 */

import { renderHomeView } from './components/HomeView.js';
import { renderSymptomChecker } from './components/SymptomChecker.js';
import { renderInteractiveDiag } from './components/InteractiveDiag.js';
import { renderResultsView } from './components/ResultsView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderKnowledgeView } from './components/KnowledgeView.js';
import { renderCareGuideView } from './components/CareGuideView.js';
import { renderSettingsView } from './components/SettingsView.js';
import { VET_RULES, ALL_SYMPTOMS } from './engine/rulesData.js';
import { getFriendlySymptomName } from './utils/formatters.js';

// Global application state (starts with NO symptoms pre-selected per user specification)
const appState = {
  currentView: 'home',
  petType: 'dog',
  symptoms: [], // Empty default: user must choose their own
  reasoningMode: 'Forward Chaining',
  targetHypothesis: 'Parvovirus',
  forwardResult: null,
  backwardResult: null,
  backwardAnswers: {}
};

let currentCleanup = null;

const VALID_VIEWS = [
  'home',
  'symptom-checker',
  'interactive-diagnosis',
  'diagnosis-results',
  'history',
  'knowledge-base',
  'care-guide',
  'settings'
];

function autoSaveResult(state) {
  try {
    let itemToSave = null;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                    ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (state.reasoningMode === "Backward Chaining" && state.backwardResult) {
      const bRes = state.backwardResult;
      itemToSave = {
        id: Date.now(),
        date: dateStr,
        petType: state.petType || "dog",
        conditionName: bRes.hypothesis,
        confidencePct: bRes.confidencePct,
        mode: "Backward Chaining",
        symptoms: bRes.provenConditions || [],
        status: bRes.status
      };
    } else if (state.forwardResult && state.forwardResult.primaryDiagnosis) {
      const pDiag = state.forwardResult.primaryDiagnosis;
      itemToSave = {
        id: Date.now(),
        date: dateStr,
        petType: state.petType || "dog",
        conditionName: pDiag.conditionName,
        confidencePct: pDiag.confidencePct,
        mode: "Forward Chaining",
        symptoms: pDiag.matchedSymptoms || []
      };
    }

    if (itemToSave) {
      const history = JSON.parse(localStorage.getItem("vetassist_history") || "[]");
      // Prevent rapid duplicate writes
      if (history.length > 0 && history[0].conditionName === itemToSave.conditionName && (Date.now() - history[0].id < 3000)) {
        return;
      }
      history.unshift(itemToSave);
      localStorage.setItem("vetassist_history", JSON.stringify(history.slice(0, 30)));
    }
  } catch (err) {
    console.warn("Could not auto-save assessment:", err);
  }
}

export function navigateTo(viewName, updateHash = true) {
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const targetView = VALID_VIEWS.includes(viewName) ? viewName : 'home';
  appState.currentView = targetView;

  // Sync browser URL hash if requested
  if (updateHash && window.location.hash !== `#${targetView}`) {
    window.location.hash = `#${targetView}`;
  }

  const mainContent = document.getElementById('main-content-view');
  if (!mainContent) return;

  // Update active class on sidebar navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const target = item.dataset.view;
    if (target === targetView) {
      item.classList.add('active');
    } else if (
      targetView === 'diagnosis-results' &&
      ((appState.reasoningMode === 'Backward Chaining' && target === 'interactive-diagnosis') ||
       (appState.reasoningMode !== 'Backward Chaining' && target === 'symptom-checker'))
    ) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Toggle navbar styling and full-bleed home styling
  const topNav = document.querySelector('.top-navbar');
  if (topNav) {
    if (targetView === 'home') {
      topNav.classList.add('transparent-nav');
      mainContent.classList.add('home-active');
    } else {
      topNav.classList.remove('transparent-nav');
      mainContent.classList.remove('home-active');
    }
  }

  // Auto-save completed results to history when viewing results
  if (targetView === 'diagnosis-results') {
    autoSaveResult(appState);
  }

  // Render appropriate view
  switch (targetView) {
    case 'home':
      currentCleanup = renderHomeView(mainContent, navigateTo);
      break;
    case 'symptom-checker':
      currentCleanup = renderSymptomChecker(mainContent, navigateTo, appState);
      break;
    case 'interactive-diagnosis':
      currentCleanup = renderInteractiveDiag(mainContent, navigateTo, appState);
      break;
    case 'diagnosis-results':
      currentCleanup = renderResultsView(mainContent, navigateTo, appState);
      break;
    case 'history':
      currentCleanup = renderHistoryView(mainContent, navigateTo);
      break;
    case 'knowledge-base':
      currentCleanup = renderKnowledgeView(mainContent, navigateTo);
      break;
    case 'care-guide':
      currentCleanup = renderCareGuideView(mainContent, navigateTo);
      break;
    case 'settings':
      currentCleanup = renderSettingsView(mainContent, navigateTo, appState);
      break;
    default:
      currentCleanup = renderHomeView(mainContent, navigateTo);
  }
}

function getViewFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  return VALID_VIEWS.includes(hash) ? hash : 'home';
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const navLinks = document.querySelectorAll('.nav-item');
  const globalSearch = document.getElementById('global-search-input');
  const searchDropdown = document.getElementById('search-results-dropdown');
  const helpTrigger = document.getElementById('help-modal-trigger-btn');
  const helpBackdrop = document.getElementById('help-modal-backdrop');
  const helpClose = document.getElementById('help-modal-close-btn');

  // Initial state: sidebar is open on wider screens, collapsed on mobile (< 768px)
  if (window.innerWidth <= 768) {
    if (sidebar) sidebar.classList.add('collapsed');
    document.body.classList.remove('sidebar-open');
  } else {
    document.body.classList.add('sidebar-open');
  }

  // Upper-left Hamburger Menu Toggle
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-open');
    });
  }

  // Close sidebar on mobile when navigating
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view) {
        if (window.innerWidth <= 768 && sidebar) {
          sidebar.classList.add('collapsed');
          document.body.classList.remove('sidebar-open');
        }
        navigateTo(view);
      }
    });
  });

  // Help modal handlers (Task 28)
  if (helpTrigger && helpBackdrop) {
    helpTrigger.addEventListener('click', () => {
      helpBackdrop.style.display = 'flex';
    });
  }
  if (helpClose && helpBackdrop) {
    helpClose.addEventListener('click', () => {
      helpBackdrop.style.display = 'none';
    });
  }
  if (helpBackdrop) {
    helpBackdrop.addEventListener('click', (e) => {
      if (e.target === helpBackdrop) {
        helpBackdrop.style.display = 'none';
      }
    });
  }

  // Live Global Search implementation (Task 27)
  if (globalSearch && searchDropdown) {
    function performLiveSearch(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        searchDropdown.style.display = 'none';
        searchDropdown.innerHTML = '';
        return;
      }

      // Find matching rules / conditions
      const matchingRules = VET_RULES.filter(r => 
        r.conclusion.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.conditions.some(c => c.toLowerCase().includes(q) || getFriendlySymptomName(c).toLowerCase().includes(q))
      ).slice(0, 4);

      // Find matching symptoms
      const matchingSymptoms = ALL_SYMPTOMS.filter(s =>
        s.label.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        getFriendlySymptomName(s.id).toLowerCase().includes(q)
      ).slice(0, 4);

      if (matchingRules.length === 0 && matchingSymptoms.length === 0) {
        searchDropdown.innerHTML = `
          <div style="padding: 12px 14px; font-size: 13px; color: var(--text-muted); text-align: center;">
            No matching conditions or symptoms found for "${query}".
          </div>
        `;
        searchDropdown.style.display = 'block';
        return;
      }

      let html = '';
      if (matchingRules.length > 0) {
        html += `<div class="search-category-header">Conditions & Rules (${matchingRules.length})</div>`;
        matchingRules.forEach(r => {
          html += `
            <div class="search-result-item" data-type="rule" data-id="${r.id}" data-hypothesis="${r.conclusion}" data-pet="${r.pet_type === 'both' ? 'dog' : r.pet_type}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>${r.conclusion}</strong>
                <span class="rule-code-chip">${r.id}</span>
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                Species: ${r.animal_name} | Requires: ${r.conditions.map(getFriendlySymptomName).join(', ')}
              </div>
            </div>
          `;
        });
      }

      if (matchingSymptoms.length > 0) {
        html += `<div class="search-category-header">Symptoms (${matchingSymptoms.length})</div>`;
        matchingSymptoms.forEach(s => {
          html += `
            <div class="search-result-item" data-type="symptom" data-id="${s.id}">
              <div>
                <strong>${s.label}</strong>
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted);">
                Category: ${s.category}
              </div>
            </div>
          `;
        });
      }

      searchDropdown.innerHTML = html;
      searchDropdown.style.display = 'block';

      // Bind click handlers to dropdown items
      const ruleItems = searchDropdown.querySelectorAll('.search-result-item[data-type="rule"]');
      ruleItems.forEach(item => {
        item.addEventListener('click', () => {
          searchDropdown.style.display = 'none';
          globalSearch.value = '';
          appState.targetHypothesis = item.dataset.hypothesis;
          if (item.dataset.pet) appState.petType = item.dataset.pet;
          navigateTo('interactive-diagnosis');
        });
      });

      const symptomItems = searchDropdown.querySelectorAll('.search-result-item[data-type="symptom"]');
      symptomItems.forEach(item => {
        item.addEventListener('click', () => {
          searchDropdown.style.display = 'none';
          globalSearch.value = '';
          if (!appState.symptoms.includes(item.dataset.id)) {
            appState.symptoms.push(item.dataset.id);
          }
          navigateTo('symptom-checker');
        });
      });
    }

    globalSearch.addEventListener('input', (e) => {
      performLiveSearch(e.target.value);
    });

    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearch.value.trim().toLowerCase();
        searchDropdown.style.display = 'none';
        if (query) {
          if (query.includes('history')) {
            navigateTo('history');
          } else if (query.includes('rule') || query.includes('knowledge')) {
            navigateTo('knowledge-base');
          } else if (query.includes('guide') || query.includes('emergency')) {
            navigateTo('care-guide');
          } else {
            navigateTo('symptom-checker');
          }
        }
      }
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!globalSearch.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
      }
    });
  }

  // URL Hash routing listener (Task 30)
  window.addEventListener('hashchange', () => {
    const view = getViewFromHash();
    if (view !== appState.currentView) {
      navigateTo(view, false);
    }
  });

  // Initial load using URL hash if present
  const initialView = getViewFromHash();
  navigateTo(initialView);
});
