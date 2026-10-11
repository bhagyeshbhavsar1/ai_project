/**
 * HomeView.js
 * ===========
 * Full-Bleed Cinematic Sliding Background Home Page.
 * - Sliding background images covering the full width of the hero
 * - Glassmorphic typography & interactive CTA controls on top
 * - Transparent navbar integration
 * - Forward vs Backward comparison card (Task 21)
 * - Pausable hero carousel & reduced-motion respect (Task 33)
 */

export function renderHomeView(container, navigateTo) {
  const slides = [
    {
      image: "/assets/hero_pets.jpg",
      badge: "🐾 Canine & Feline Health Check",
      title: "Compassionate Pet Health AI",
      subtitle: "Intelligent rule-based inference for dogs and cats with 100% transparent reasoning.",
      quote: "Same care. A healthier tomorrow."
    },
    {
      image: "/assets/clinic_care.jpg",
      badge: "⚙️ Forward Chaining (Data ➔ Conclusion)",
      title: "From Observed Signs to Possible Conditions",
      subtitle: "Evaluates multi-symptom clusters and chains secondary complications automatically.",
      quote: "Multi-Hop Chained Derivations"
    },
    {
      image: "/assets/horse_vet.jpg",
      badge: "🐎 Equine & Large Animal Medicine",
      title: "Equine Colic & Farm Livestock Triage",
      subtitle: "Grounded in the Kaggle Animal Disease Dataset & veterinary clinical literature.",
      quote: "Multi-Species Coverage"
    },
    {
      image: "/assets/exotic_vet.jpg",
      badge: "🦜 Avian, Rabbit & Exotic Pet Care",
      title: "Specialized Exotic & Small Animal AI",
      subtitle: "Early detection of avian respiratory crises and lagomorph GI stasis emergencies.",
      quote: "Critical Emergency Radar"
    }
  ];

  let currentSlide = 0;
  let autoPlayTimer = null;
  // Task 33: respect reduced motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isPaused = prefersReducedMotion;

  function render() {
    container.innerHTML = `
      <div class="home-fullbleed-wrapper">
        <!-- Full-Bleed Cinematic Hero with Background Slider -->
        <section class="cinematic-hero-slider" id="cinematic-hero">
          <!-- Background Image Slides -->
          <div class="hero-bg-track" id="hero-bg-track">
            ${slides.map((s, i) => `
              <div class="hero-bg-slide ${i === currentSlide ? 'active' : ''}" style="background-image: url('${s.image}');">
                <div class="hero-bg-overlay"></div>
              </div>
            `).join("")}
          </div>

          <!-- Hero Content Layer (Floating on top of sliding background) -->
          <div class="hero-foreground-content">
            <div class="hero-glass-card">
              <div class="hero-badge-tag">${slides[currentSlide].badge}</div>
              <h1 class="hero-headline">Understand Your Animal's Health With Intelligent Reasoning</h1>
              <p class="hero-subtext">
                ${slides[currentSlide].subtitle}
              </p>

              <!-- Non-technical human-oriented action buttons -->
              <div class="hero-actions-row" style="flex-wrap: wrap; gap: 12px;">
                <button class="btn-hero-primary" id="hero-start-diag-btn">
                  <span>🩺 Symptom Checker</span>
                  <span style="font-size: 18px;">&rarr;</span>
                </button>
                <button class="btn-hero-secondary" id="hero-start-disease-btn" style="background: rgba(255, 255, 255, 0.2); border: 1.5px solid rgba(255, 255, 255, 0.45); color: white; display: flex; align-items: center; gap: 8px;">
                  <span>💬 Interactive Diagnosis</span>
                  <span style="font-size: 18px;">&rarr;</span>
                </button>
              </div>

              <!-- Animal Species Quick Access Badges -->
              <div class="hero-animal-pills">
                <span style="font-size: 12px; color: #cbd5e1; font-weight: 600;">Supported Species:</span>
                <span class="animal-pill">🐕 Dog</span>
                <span class="animal-pill">🐈 Cat</span>
                <span class="animal-pill">🐎 Horse</span>
                <span class="animal-pill">🐇 Rabbit</span>
                <span class="animal-pill">🦜 Bird</span>
                <span class="animal-pill">🐄 Cattle</span>
                <span class="animal-pill">🐑 Sheep</span>
              </div>
            </div>

            <!-- Slide Info & Navigation Controls on Bottom-Right -->
            <div class="hero-slide-controls">
              <div class="slide-quote-pill">${slides[currentSlide].quote}</div>
              <div class="slide-control-bar">
                <button class="hero-slider-nav prev" id="slider-prev-btn" aria-label="Previous Slide">&#8249;</button>
                <div class="hero-slider-dots">
                  ${slides.map((_, i) => `
                    <button class="hero-slider-dot ${i === currentSlide ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>
                  `).join("")}
                </div>
                <button class="hero-slider-nav next" id="slider-next-btn" aria-label="Next Slide">&#8250;</button>
                <!-- Task 33: Pausable hero carousel toggle -->
                <button class="hero-slider-nav play-pause" id="slider-play-pause-btn" aria-label="${isPaused ? 'Resume Slideshow' : 'Pause Slideshow'}" title="${isPaused ? 'Play' : 'Pause'}">
                  ${isPaused ? '▶' : '⏸'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Plain-language "Which Option Fits You?" comparison card -->
        <section style="padding: 24px 36px 0 36px;">
          <div class="feature-card-modern" style="border: 1.5px solid var(--card-border); background: #ffffff;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
              <span style="font-size: 22px;">⚖️</span>
              <div>
                <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">How would you like to start?</h2>
                <p style="font-size: 12.5px; color: var(--text-muted); margin: 0;">Pick based on what you already know about your pet:</p>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
              <!-- Option 1: Forward Chaining -->
              <div style="padding: 16px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <strong style="color: #065f46; font-size: 14.5px;">🩺 Option 1: I see symptoms</strong>
                    <span class="rule-code-chip" style="font-size: 11px;">Symptoms &rarr; Illness</span>
                  </div>
                  <p style="font-size: 13.5px; color: #166534; font-weight: 600; margin-top: 4px;">
                    "Tell me what illness this could be"
                  </p>
                  <p style="font-size: 12.5px; color: #475569; margin-top: 2px; line-height: 1.4;">
                    Tick the signs you see in your pet and our engine checks every rule forward to find what fits.
                  </p>
                </div>
                <button class="btn-primary-dark" id="home-card-forward-btn" style="padding: 7px 16px; font-size: 12.5px; margin-top: 12px; width: fit-content;">
                  Open Symptom Checker &rarr;
                </button>
              </div>

              <!-- Option 2: Backward Chaining -->
              <div style="padding: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius-sm); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <strong style="color: #1e40af; font-size: 14.5px;">💬 Option 2: I suspect a disease</strong>
                    <span class="rule-code-chip" style="font-size: 11px;">Disease &rarr; Questions</span>
                  </div>
                  <p style="font-size: 13.5px; color: #1e3a8a; font-weight: 600; margin-top: 4px;">
                    "Ask me questions to test a specific illness"
                  </p>
                  <p style="font-size: 12.5px; color: #475569; margin-top: 2px; line-height: 1.4;">
                    Worried about Parvovirus, Colic, or another illness? We test that exact rule with guided questions.
                  </p>
                </div>
                <button class="btn-primary-dark" id="home-card-backward-btn" style="padding: 7px 16px; font-size: 12.5px; margin-top: 12px; width: fit-content; background: #1e40af;">
                  Start Interactive Diagnosis &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 4 Feature Cards Grid (Edge-to-Edge Full Width) -->
        <section class="home-features-section">
          <div class="features-grid-full">
            <div class="feature-card-modern">
              <div class="feature-icon-circle">🩺</div>
              <div>
                <h3 class="feature-card-heading">Two Reasoning Modes</h3>
                <p class="feature-card-sub">Forward chaining (symptom &rarr; condition) and backward chaining (condition &rarr; question).</p>
              </div>
            </div>

            <div class="feature-card-modern">
              <div class="feature-icon-circle">📋</div>
              <div>
                <h3 class="feature-card-heading">100% Explainable AI</h3>
                <p class="feature-card-sub">Step-by-step audit trace showing premises met, fired rules, and clinical citations.</p>
              </div>
            </div>

            <div class="feature-card-modern">
              <div class="feature-icon-circle">🐾</div>
              <div>
                <h3 class="feature-card-heading">Multi-Species Coverage</h3>
                <p class="feature-card-sub">Canine, feline, equine, lagomorph, avian, bovine, and ovine diagnostic rules.</p>
              </div>
            </div>

            <div class="feature-card-modern">
              <div class="feature-icon-circle">📖</div>
              <div>
                <h3 class="feature-card-heading">Evidence-Based Datasets</h3>
                <p class="feature-card-sub">Grounded in Kaggle Animal Disease datasets, VCA Hospitals, AKC & Merck Manual.</p>
              </div>
            </div>
          </div>

          <!-- Educational Disclaimer Banner -->
          <div class="disclaimer-banner-full">
            <div class="disclaimer-icon-box">ℹ️</div>
            <div class="disclaimer-text-box">
              <strong>Veterinary Educational Purpose Disclaimer:</strong>
              This tool is developed for educational and clinical triage assistance. It demonstrates rule-based artificial intelligence inference and is NOT a substitute for in-person evaluation by a licensed veterinarian. Always seek professional veterinary care for sick or injured animals.
            </div>
          </div>
        </section>
      </div>
    `;

    bindEvents();
  }

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    render();
  }

  function startTimer() {
    if (isPaused) return;
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 4600);
  }

  function pauseTimer() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function bindEvents() {
    // Nav actions
    const startBtn = container.querySelector("#hero-start-diag-btn");
    if (startBtn) startBtn.addEventListener("click", () => navigateTo("symptom-checker"));

    const diseaseHeroBtn = container.querySelector("#hero-start-disease-btn");
    if (diseaseHeroBtn) diseaseHeroBtn.addEventListener("click", () => navigateTo("interactive-diagnosis"));

    const cardFwdBtn = container.querySelector("#home-card-forward-btn");
    if (cardFwdBtn) cardFwdBtn.addEventListener("click", () => navigateTo("symptom-checker"));

    const cardBwdBtn = container.querySelector("#home-card-backward-btn");
    if (cardBwdBtn) cardBwdBtn.addEventListener("click", () => navigateTo("interactive-diagnosis"));

    const kbBtn = container.querySelector("#hero-explore-kb-btn");
    if (kbBtn) kbBtn.addEventListener("click", () => navigateTo("knowledge-base"));

    // Slider Controls
    const prevBtn = container.querySelector("#slider-prev-btn");
    const nextBtn = container.querySelector("#slider-next-btn");
    const playPauseBtn = container.querySelector("#slider-play-pause-btn");
    const dots = container.querySelectorAll(".hero-slider-dot");
    const heroSection = container.querySelector("#cinematic-hero");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentSlide - 1);
        if (!isPaused) startTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToSlide(currentSlide + 1);
        if (!isPaused) startTimer();
      });
    }

    // Play/Pause button handler (Task 33)
    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        isPaused = !isPaused;
        if (isPaused) {
          pauseTimer();
        } else {
          startTimer();
        }
        render();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        goToSlide(idx);
        if (!isPaused) startTimer();
      });
    });

    if (heroSection) {
      heroSection.addEventListener("mouseenter", () => {
        if (!isPaused) pauseTimer();
      });
      heroSection.addEventListener("mouseleave", () => {
        if (!isPaused) startTimer();
      });
    }
  }

  render();
  if (!isPaused) startTimer();

  return () => {
    pauseTimer();
  };
}
