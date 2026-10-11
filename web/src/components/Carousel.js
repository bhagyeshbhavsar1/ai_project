/**
 * Carousel.js
 * ===========
 * Animated, interactive hero carousel for Screen 1.
 * Slides automatically with rich transitions, highlighting the pets,
 * forward chaining, backward chaining, and veterinary rules.
 */

export class HeroCarousel {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentIndex = 0;
    this.timer = null;
    this.slides = [
      {
        image: "/assets/hero_pets.jpg",
        badge: "Smart Veterinary Triage",
        quote: "Same care. A healthier tomorrow.",
        title: "Compassionate Pet Health AI",
        subtitle: "Intelligent rule-based inference for dogs and cats"
      },
      {
        image: "/assets/clinic_care.jpg",
        badge: "Forward Chaining (Data -> Conclusion)",
        quote: "Multi-Hop Reasoning",
        title: "From Symptoms to Diagnoses",
        subtitle: "Evaluates initial symptoms and chains secondary complications"
      },
      {
        image: "/assets/hero_pets.jpg",
        badge: "Backward Chaining (Goal -> Data)",
        quote: "Interactive Diagnosis",
        title: "Goal-Driven Clinical Questions",
        subtitle: "Targeted hypothesis testing with 'Why are we asking this?' explanations"
      },
      {
        image: "/assets/clinic_care.jpg",
        badge: "Evidence-Based Rules",
        quote: "20+ Curated Rules",
        title: "Grounded in Clinical Literature",
        subtitle: "Verified against ASPCA, AKC, and Merck Veterinary Manual"
      }
    ];

    this.render();
    this.bindEvents();
    this.startAutoPlay();
  }

  render() {
    this.container.innerHTML = `
      <div class="hero-carousel-container" id="hero-carousel">
        <div class="carousel-track" id="carousel-track">
          ${this.slides.map((slide, i) => `
            <div class="carousel-slide ${i === 0 ? 'active' : ''}">
              <img src="${slide.image}" alt="${slide.title}" />
              <div class="carousel-quote-tag">${slide.quote}</div>
              <div class="carousel-slide-overlay">
                <span class="carousel-slide-badge">${slide.badge}</span>
                <h3 class="carousel-slide-title">${slide.title}</h3>
                <p class="carousel-slide-subtitle">${slide.subtitle}</p>
              </div>
            </div>
          `).join("")}
        </div>

        <button class="carousel-nav-btn carousel-prev" id="carousel-prev-btn" aria-label="Previous Slide">&#8249;</button>
        <button class="carousel-nav-btn carousel-next" id="carousel-next-btn" aria-label="Next Slide">&#8250;</button>

        <div class="carousel-dots" id="carousel-dots">
          ${this.slides.map((_, i) => `
            <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>
          `).join("")}
        </div>
      </div>
    `;
  }

  bindEvents() {
    const prevBtn = this.container.querySelector("#carousel-prev-btn");
    const nextBtn = this.container.querySelector("#carousel-next-btn");
    const dots = this.container.querySelectorAll(".carousel-dot");
    const carouselEl = this.container.querySelector("#hero-carousel");

    prevBtn.addEventListener("click", () => {
      this.prev();
      this.resetAutoPlay();
    });

    nextBtn.addEventListener("click", () => {
      this.next();
      this.resetAutoPlay();
    });

    dots.forEach(dot => {
      dot.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        this.goTo(index);
        this.resetAutoPlay();
      });
    });

    // Pause on mouse hover for great user experience
    carouselEl.addEventListener("mouseenter", () => this.pauseAutoPlay());
    carouselEl.addEventListener("mouseleave", () => this.startAutoPlay());
  }

  goTo(index) {
    this.currentIndex = (index + this.slides.length) % this.slides.length;
    const track = this.container.querySelector("#carousel-track");
    const slides = this.container.querySelectorAll(".carousel-slide");
    const dots = this.container.querySelectorAll(".carousel-dot");

    if (track) {
      track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === this.currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === this.currentIndex);
    });
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  startAutoPlay() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.next();
    }, 4200);
  }

  pauseAutoPlay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetAutoPlay() {
    this.pauseAutoPlay();
    this.startAutoPlay();
  }

  destroy() {
    this.pauseAutoPlay();
  }
}
