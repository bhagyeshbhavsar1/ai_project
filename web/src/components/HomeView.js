/**
 * HomeView.js
 * ===========
 * Full-Bleed Cinematic Sliding Background Home Page.
 * - Sliding background images covering the full width of the hero
 * - Glassmorphic typography & interactive CTA controls on top
 * - Transparent navbar integration
 * - Multi-species veterinary triage showcase
 */

export function renderHomeView(container, navigateTo) {
  const slides = [
    {
      image: "/assets/hero_pets.jpg",
      badge: "🐾 Canine & Feline Diagnostic Triage",
      title: "Compassionate Pet Health AI",
      subtitle: "Intelligent rule-based inference for dogs and cats with 100% transparent reasoning.",
      quote: "Same care. A healthier tomorrow."
    },
    {
      image: "/assets/clinic_care.jpg",
      badge: "⚙️ Forward Chaining (Data ➔ Conclusion)",
      title: "From Observed Signs to Clinical Diagnosis",
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

              <div class="hero-actions-row">
                <button class="btn-hero-primary" id="hero-start-diag-btn">
                  <span>Start Multi-Species Diagnosis</span>
                  <span style="font-size: 18px;">&rarr;</span>
                </button>
                <button class="btn-hero-secondary" id="hero-explore-kb-btn">
                  Explore Knowledge Base
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
                <p class="feature-card-sub">Forward chaining (symptom &rarr; diagnosis) and backward chaining (goal &rarr; question).</p>
              </div>
            </div>

            <div class="feature-card-modern">
              <div class="feature-icon-circle">📋</div>
              <div>
                <h3 class="feature-card-heading">100% Explainable AI</h3>
                <p class="feature-card-sub">Transparent audit trace showing fired rules, premises met, and clinical rationales.</p>
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

    const kbBtn = container.querySelector("#hero-explore-kb-btn");
    if (kbBtn) kbBtn.addEventListener("click", () => navigateTo("knowledge-base"));

    // Slider Controls
    const prevBtn = container.querySelector("#slider-prev-btn");
    const nextBtn = container.querySelector("#slider-next-btn");
    const dots = container.querySelectorAll(".hero-slider-dot");
    const heroSection = container.querySelector("#cinematic-hero");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentSlide - 1);
        startTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToSlide(currentSlide + 1);
        startTimer();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        goToSlide(idx);
        startTimer();
      });
    });

    if (heroSection) {
      heroSection.addEventListener("mouseenter", () => pauseTimer());
      heroSection.addEventListener("mouseleave", () => startTimer());
    }
  }

  render();
  startTimer();

  return () => {
    pauseTimer();
  };
}
