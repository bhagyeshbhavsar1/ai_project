/**
 * main.js
 * =======
 * Main Application Orchestrator for VetAssist Web.
 * Connects the inference engines, sidebar navigation, hamburger toggle,
 * and view rendering.
 */

import { renderHomeView } from './components/HomeView.js';
import { renderSymptomChecker } from './components/SymptomChecker.js';
import { renderInteractiveDiag } from './components/InteractiveDiag.js';
import { renderResultsView } from './components/ResultsView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderKnowledgeView } from './components/KnowledgeView.js';
import { renderCareGuideView } from './components/CareGuideView.js';
import { renderSettingsView } from './components/SettingsView.js';

// Global application state
const appState = {
  currentView: 'home',
  petType: 'dog',
  symptoms: ['fever', 'coughing', 'lethargy'],
  reasoningMode: 'Forward Chaining',
  targetHypothesis: 'Parvovirus',
  forwardResult: null,
  backwardResult: null,
  backwardAnswers: {}
};

let currentCleanup = null;

function navigateTo(viewName) {
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  appState.currentView = viewName;
  const mainContent = document.getElementById('main-content-view');
  if (!mainContent) return;

  // Update active class on sidebar navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const target = item.dataset.view;
    if (target === viewName) {
      item.classList.add('active');
    } else if (
      (viewName === 'interactive-diagnosis' || viewName === 'diagnosis-results') &&
      target === 'symptom-checker'
    ) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Toggle navbar transparency and home-active full bleed styling
  const topNav = document.querySelector('.top-navbar');
  if (topNav) {
    if (viewName === 'home') {
      topNav.classList.add('transparent-nav');
      mainContent.classList.add('home-active');
    } else {
      topNav.classList.remove('transparent-nav');
      mainContent.classList.remove('home-active');
    }
  }

  // Render appropriate view
  switch (viewName) {
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

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const navLinks = document.querySelectorAll('.nav-item');
  const globalSearch = document.getElementById('global-search-input');

  // Initial state: sidebar is open
  document.body.classList.add('sidebar-open');

  // Upper-left Hamburger Menu Toggle: collapses or expands sidebar cleanly
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-open');
    });
  }

  // Sidebar navigation clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view) {
        navigateTo(view);
      }
    });
  });

  // Global search input handling
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearch.value.trim().toLowerCase();
        if (query) {
          // If query mentions dog, cat, or symptom, route smartly
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
  }

  // Initial load
  navigateTo('home');
});
