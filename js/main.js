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
  initShoppingCart();
  initProductFiltering();
  initScrollAnimations();
  initLazyLoading();
  initNewsletter();
  initBottomNav();
})();

/**
 * Shopping Cart System with localStorage persistence
 */
function initShoppingCart() {
  const CART_KEY = 'lumiere_cart';
  
  // Cart state
  let cart = loadCart();
  
  // DOM Elements
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartCount = document.getElementById('cartCount');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartEmptyMessage = document.getElementById('cartEmptyMessage');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  // Load cart from localStorage
  function loadCart() {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }
  
  // Save cart to localStorage
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }
  
  // Update cart UI
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update badge count
    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update items list
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      
      if (cart.length === 0) {
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
      } else {
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
        
        cart.forEach((item, index) => {
          const itemEl = document.createElement('div');
          itemEl.className = 'cart-item';
          itemEl.setAttribute('data-product-id', item.id);
          itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
            <div class="cart-item-details">
              <h4 class="cart-item-name">${item.name}</h4>
              <p class="cart-item-shade">${item.shade || ''}</p>
              <p class="cart-item-price">$${item.price.toFixed(2)}</p>
              <div class="cart-item-quantity">
                <button class="qty-btn minus" data-index="${index}" aria-label="Decrease quantity">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn plus" data-index="${index}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-index="${index}" aria-label="Remove ${item.name} from cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          `;
          cartItemsContainer.appendChild(itemEl);
        });
        
        // Add event listeners for quantity buttons
        cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(btn => {
          btn.addEventListener('click', (e) => changeQuantity(e.target.dataset.index, -1));
        });
        cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(btn => {
          btn.addEventListener('click', (e) => changeQuantity(e.target.dataset.index, 1));
        });
        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
          btn.addEventListener('click', (e) => removeItem(e.target.closest('button').dataset.index));
        });
      }
      
      // Update subtotal
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (cartSubtotal) {
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      }
      
      // Disable checkout button if cart is empty
      if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
      }
    }
  }
  
  // Add item to cart
  function addItem(product) {
    const existingIndex = cart.findIndex(item => 
      item.id === product.id && item.shade === product.shade
    );
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to bag`);
    openCart();
  }
  
  // Change item quantity
  function changeQuantity(index, delta) {
    const item = cart[index];
    if (!item) return;
    
    item.quantity += delta;
    
    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }
    
    saveCart();
    updateCartUI();
  }
  
  // Remove item from cart
  function removeItem(index) {
    const item = cart[index];
    if (!item) return;
    
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showNotification(`${item.name} removed from bag`);
  }
  
  // Open cart drawer
  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('open');
      cartDrawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cart-open');
      if (cartClose) cartClose.focus();
    }
  }
  
  // Close cart drawer
  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('open');
      cartDrawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('cart-open');
      if (cartToggle) cartToggle.focus();
    }
  }
  
  // Show notification
  function showNotification(message) {
    let notification = document.querySelector('.cart-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.setAttribute('role', 'status');
      notification.setAttribute('aria-live', 'polite');
      document.body.appendChild(notification);
      
      // Add styles if not already present
      if (!document.getElementById('cart-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-notification-styles';
        style.textContent = `
          .cart-notification {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #1a1a1a;
            color: #fff;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 10001;
          }
          .cart-notification.show {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }
  
  // Event Listeners
  if (cartToggle) {
    cartToggle.addEventListener('click', openCart);
  }
  
  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }
  
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }
  
  if (cartDrawer) {
    cartDrawer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCart();
    });
    
    // Touch swipe to close
    let touchStartY = 0;
    cartDrawer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    cartDrawer.addEventListener('touchmove', (e) => {
      if (e.touches[0].clientY - touchStartY > 100) {
        closeCart();
      }
    }, { passive: true });
  }
  
  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        window.location.href = 'checkout.html';
      }
    });
  }
  
  // Add to bag buttons delegation
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add"]');
    if (!addBtn) return;
    
    const productCard = addBtn.closest('.product-card');
    if (!productCard) return;
    
    // Get selected shade
    const activeShade = productCard.querySelector('.shade.active');
    const shadeName = activeShade ? activeShade.title : null;
    
    const product = {
      id: productCard.dataset.productId || Date.now().toString(),
      name: productCard.dataset.productName || 'Product',
      price: parseFloat(productCard.dataset.productPrice) || 0,
      image: productCard.dataset.productImage || '',
      shade: shadeName
    };
    
    addItem(product);
  });
  
  // Shade selection
  document.addEventListener('click', (e) => {
    const shade = e.target.closest('.shade');
    if (!shade) return;
    
    const shadeList = shade.closest('.shade-list');
    if (!shadeList) return;
    
    shadeList.querySelectorAll('.shade').forEach(s => s.classList.remove('active'));
    shade.classList.add('active');
    
    // Update product card data attribute
    const productCard = shadeList.closest('.product-card');
    if (productCard && shade.dataset.shade) {
      productCard.dataset.productShade = shade.dataset.shade;
    }
  });
  
  // Initialize UI
  updateCartUI();
}

/**
 * Product Filtering and Sorting
 */
function initProductFiltering() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const sortSelect = document.getElementById('productSort');
  const productGrid = document.querySelector('.product-grid');
  
  if (!productGrid) return;
  
  const products = Array.from(productGrid.querySelectorAll('.product-card'));
  
  // Filter by category
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      
      products.forEach(product => {
        const category = product.dataset.category;
        if (filter === 'all' || category === filter) {
          product.style.display = 'block';
          product.classList.add('fade-in');
        } else {
          product.style.display = 'none';
        }
      });
    });
  });
  
  // Sort products
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const sortBy = sortSelect.value;
      const visibleProducts = products.filter(p => p.style.display !== 'none');
      
      visibleProducts.sort((a, b) => {
        const priceA = parseFloat(a.dataset.productPrice) || 0;
        const priceB = parseFloat(b.dataset.productPrice) || 0;
        const nameA = a.dataset.productName || '';
        const nameB = b.dataset.productName || '';
        
        switch (sortBy) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'name-az':
            return nameA.localeCompare(nameB);
          default:
            return 0;
        }
      });
      
      visibleProducts.forEach(product => productGrid.appendChild(product));
    });
  }
}

/**
 * Scroll Animations with Intersection Observer
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.product-card, .essential-card, .model-card, .blog-card');
  
  if (animatedElements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
  
  // Add animation styles if not present
  if (!document.getElementById('scroll-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'scroll-animation-styles';
    style.textContent = `
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      .fade-in {
        animation: fadeIn 0.4s ease forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Lazy Loading Images
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if (lazyImages.length === 0) return;
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, { rootMargin: '50px 0px' });
  
  lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Newsletter Signup
 */
function initNewsletter() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (!newsletterForm) return;
  
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value : '';
    
    if (email) {
      // Store in localStorage
      const subscribers = JSON.parse(localStorage.getItem('lumiere_newsletter') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('lumiere_newsletter', JSON.stringify(subscribers));
      }
      
      // Show success message
      showNotification('Thank you for subscribing!');
      newsletterForm.reset();
    }
  });
  
  function showNotification(message) {
    let notification = document.querySelector('.newsletter-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'newsletter-notification';
      notification.setAttribute('role', 'status');
      document.body.appendChild(notification);
      
      if (!document.getElementById('newsletter-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'newsletter-notification-styles';
        style.textContent = `
          .newsletter-notification {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #1a1a1a;
            color: #fff;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 10001;
          }
          .newsletter-notification.show {
            opacity: 1;
            visibility: visible;
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }
}

/**
 * Mobile Bottom Navigation
 */
function initBottomNav() {
  // Only create on mobile and if not already present
  if (window.innerWidth > 768) return;
  if (document.querySelector('.bottom-nav')) return;
  
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'bottom-nav';
  bottomNav.setAttribute('role', 'navigation');
  bottomNav.setAttribute('aria-label', 'Mobile bottom navigation');
  bottomNav.innerHTML = `
    <a href="index.html" class="bottom-nav-item" aria-label="Home">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span>Home</span>
    </a>
    <a href="products.html" class="bottom-nav-item" aria-label="Shop">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span>Shop</span>
    </a>
    <a href="#" class="bottom-nav-item" id="bottomNavBag" aria-label="Shopping Bag">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <span>Bag</span>
    </a>
    <a href="models.html" class="bottom-nav-item" aria-label="Models">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span>Models</span>
    </a>
    <a href="#" class="bottom-nav-item" id="bottomNavMenu" aria-label="Menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <span>Menu</span>
    </a>
  `;
  
  document.body.appendChild(bottomNav);
  
  // Add styles
  if (!document.getElementById('bottom-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'bottom-nav-styles';
    style.textContent = `
      .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        z-index: 1000;
      }
      .bottom-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-decoration: none;
        color: #333;
        font-size: 11px;
        gap: 4px;
        padding: 4px 12px;
        transition: color 0.2s ease;
      }
      .bottom-nav-item:hover,
      .bottom-nav-item.active {
        color: #c9a55c;
      }
      .bottom-nav-item svg {
        width: 24px;
        height: 24px;
      }
      @media (min-width: 769px) {
        .bottom-nav {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Handle bag click
  const bagBtn = document.getElementById('bottomNavBag');
  if (bagBtn) {
    bagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cartToggle = document.getElementById('cartToggle');
      if (cartToggle) cartToggle.click();
    });
  }
  
  // Handle menu click
  const menuBtn = document.getElementById('bottomNavMenu');
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const menuToggle = document.getElementById('menuToggle');
      if (menuToggle) menuToggle.click();
    });
  }
}
