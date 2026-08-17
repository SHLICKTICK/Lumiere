/**
 * Lumière Beauty - Main JavaScript
 * Handles mobile navigation, header scroll effects, and slideshow functionality
 */

(function() {
  'use strict';

  // Mobile Navigation & Header Scroll
  function initMobileNav() {
    const header = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');

    if (!header || !menuToggle || !mobileNav || !mobileNavClose) return;

    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function openMenu() {
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
      mobileNavClose.focus();
    }

    function closeMenu() {
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      menuToggle.focus();
    }

    menuToggle.addEventListener('click', openMenu);
    mobileNavClose.addEventListener('click', closeMenu);
    mobileNav.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    mobileNav
      .querySelectorAll('a')
      .forEach((a) => a.addEventListener('click', closeMenu));
  }

  // Slideshow functionality (used on Index.html)
  function initSlideshow() {
    const showcase = document.querySelector('.photoshoot-showcase');
    const showcaseImage = document.getElementById('showcaseImage');
    const showcaseCategory = document.getElementById('showcaseCategory');
    const showcasePrev = document.getElementById('showcasePrev');
    const showcaseNext = document.getElementById('showcaseNext');
    const showcasePagination = [
      ...document.querySelectorAll('.showcase-pagination button'),
    ];

    if (!showcase || !showcaseImage) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const slides = [
      {
        src: 'assets/photoshoot/reveal/reveal-01.png',
        alt: 'Reveal photoshoot beauty portrait',
        category: 'Reveal',
      },
      {
        src: 'assets/photoshoot/bloom/bloom-1.png',
        alt: 'Bloom photoshoot portrait among red roses',
        category: 'Bloom',
      },
      {
        src: 'assets/photoshoot/after-dark/after-dark-1.png',
        alt: 'After Dark fashion photoshoot outside a cathedral',
        category: 'After Dark',
      },
      {
        src: 'assets/photoshoot/element/element-1.png',
        alt: 'Element photoshoot in a desert landscape',
        category: 'Element',
      },
      {
        src: 'assets/photoshoot/nocturne/nocturne-1.png',
        alt: 'Nocturne fashion photoshoot overlooking the city',
        category: 'Nocturne',
      },
      {
        src: 'assets/photoshoot/finale/finale-1.png',
        alt: 'The Finale ensemble fashion photoshoot',
        category: 'The Finale',
      },
      {
        src: 'assets/photoshoot/the-new-standard/the-new-standard-1.png',
        alt: 'The New Standard beauty ensemble photoshoot',
        category: 'The New Standard',
      },
    ];
    let slideIndex = 0;
    let slideTimer;
    let isTransitioning = false;

    // Preload images
    slides.forEach((slide) => {
      const image = new Image();
      image.src = slide.src;
    });

    function scheduleSlideshow() {
      clearTimeout(slideTimer);
      slideTimer = setTimeout(() => changeSlide(1), 5200);
    }

    function updateShowcase() {
      showcaseImage.src = slides[slideIndex].src;
      showcaseImage.alt = slides[slideIndex].alt;
      showcaseCategory.textContent = slides[slideIndex].category;
      showcasePagination.forEach((button, index) => {
        button.classList.toggle('active', index === slideIndex);
        button.setAttribute(
          'aria-current',
          index === slideIndex ? 'true' : 'false',
        );
      });
    }

    function changeSlide(direction, targetIndex = null) {
      if (isTransitioning) return;
      isTransitioning = true;

      if (reduceMotion.matches) {
        slideIndex =
          targetIndex === null
            ? (slideIndex + direction + slides.length) % slides.length
            : targetIndex;
        updateShowcase();
        isTransitioning = false;
        scheduleSlideshow();
        return;
      }

      showcaseImage.classList.add('is-obscured');
      setTimeout(() => {
        slideIndex =
          targetIndex === null
            ? (slideIndex + direction + slides.length) % slides.length
            : targetIndex;
        updateShowcase();

        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            showcaseImage.classList.remove('is-obscured');
            isTransitioning = false;
            scheduleSlideshow();
          }),
        );
      }, 900);
    }

    if (showcasePrev) showcasePrev.addEventListener('click', () => changeSlide(-1));
    if (showcaseNext) showcaseNext.addEventListener('click', () => changeSlide(1));
    
    showcasePagination.forEach((button) =>
      button.addEventListener('click', () => {
        const target = Number(button.dataset.slide);
        if (target !== slideIndex) changeSlide(0, target);
      }),
    );
    
    showcase.addEventListener('mouseenter', () => clearTimeout(slideTimer));
    showcase.addEventListener('mouseleave', scheduleSlideshow);
    showcase.addEventListener('focusin', () => clearTimeout(slideTimer));
    showcase.addEventListener('focusout', scheduleSlideshow);
    document.addEventListener('visibilitychange', () =>
      document.hidden ? clearTimeout(slideTimer) : scheduleSlideshow(),
    );
    
    scheduleSlideshow();
  }

  // Collection carousel scroll (used on Index.html)
  function initCollectionCarousel() {
    const collectionTrack = document.getElementById('collectionTrack');
    if (!collectionTrack) return;

    function scrollCollection(direction) {
      const card = collectionTrack.querySelector('.issue-card');
      const gap = parseFloat(getComputedStyle(collectionTrack).gap) || 0;
      collectionTrack.scrollBy({
        left: direction * (card.offsetWidth + gap),
        behavior: 'smooth',
      });
    }

    const collectionPrev = document.querySelector('.collection-prev');
    const collectionNext = document.querySelector('.collection-next');

    if (collectionPrev) collectionPrev.addEventListener('click', () => scrollCollection(-1));
    if (collectionNext) collectionNext.addEventListener('click', () => scrollCollection(1));
  }

  // Initialize all components
  initMobileNav();
  initSlideshow();
  initCollectionCarousel();
})();
