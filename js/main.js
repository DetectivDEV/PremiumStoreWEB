/* ========================================
   MAIN JAVASCRIPT - FiveM Premium Storee
   ======================================== */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initializePageLoader();
  initializeNavigation();
  initializeScrollAnimations();
  initializeCart();
  initializeToasts();
  initializeCustomCursor();
  initializeFloatingLogos();
});

// Page Loader
function initializePageLoader() {
  // Create loader if it doesn't exist
  if (!document.querySelector('.page-loader')) {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <div class="loader-logo">
        <img src="assets/images/logo.png" alt="Premium Store">
      </div>
    `;
    document.body.insertBefore(loader, document.body.firstChild);
  }

  // Hide loader after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.querySelector('.page-loader');
      if (loader) {
        loader.classList.add('hidden');
      }
    }, 500);
  });

  // Show loader on page transitions
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only handle internal links
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:')) {
      link.addEventListener('click', (e) => {
        const loader = document.querySelector('.page-loader');
        if (loader) {
          loader.classList.remove('hidden');
        }
      });
    }
  });
}

// Custom Cursor
function initializeCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  
  if (!cursor || !cursorDot) return;
  
  // Check for touch device
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    cursorDot.style.display = 'none';
    document.querySelectorAll('*').forEach(el => el.style.cursor = 'auto');
    return;
  }
  
  // Initialize to center of viewport to avoid starting at top-left
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let cursorX = mouseX, cursorY = mouseY;
  let dotX = mouseX, dotY = mouseY;
  
  // Set initial positions immediately
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  cursorDot.style.left = dotX + 'px';
  cursorDot.style.top = dotY + 'px';
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Hover effect on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, .product-card, .category-card, .oauth-btn, .modal-close');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
  
  // Re-apply hover effects when modal opens (for dynamically added elements)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        const newElements = document.querySelectorAll('a, button, input, textarea, .product-card, .category-card, .oauth-btn, .modal-close');
        newElements.forEach(el => {
          el.removeEventListener('mouseenter', () => cursor.classList.add('hover'));
          el.removeEventListener('mouseleave', () => cursor.classList.remove('hover'));
          el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Animation loop
  function animateCursor() {
    // Smooth follow for outer cursor
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    // Faster follow for dot
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// Floating Logos for all pages
function initializeFloatingLogos() {
  // Add floating logos to pages that don't have the homepage logo background
  if (document.querySelector('.logo-background')) return;
  
  const existingContainer = document.querySelector('.floating-logo-container');
  if (existingContainer) return;
  
  const container = document.createElement('div');
  container.className = 'floating-logo-container';
  container.innerHTML = `
    <div class="floating-logo"><img src="assets/images/logo.png" alt=""></div>
    <div class="floating-logo"><img src="assets/images/logo.png" alt=""></div>
    <div class="floating-logo"><img src="assets/images/logo.png" alt=""></div>
    <div class="floating-logo"><img src="assets/images/logo.png" alt=""></div>
    <div class="floating-logo"><img src="assets/images/logo.png" alt=""></div>
  `;
  document.body.insertBefore(container, document.body.firstChild);
}

// Navigation
function initializeNavigation() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navbarMenu = document.querySelector('.navbar-menu');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile menu toggle
  if (menuToggle && navbarMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navbarMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    const navLinks = navbarMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
      });
    });
  }

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// Scroll Animations
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  const scrollElements = document.querySelectorAll('.scroll-animate');
  scrollElements.forEach(element => {
    observer.observe(element);
  });
}

// Cart System
let cart = [];

function initializeCart() {
  // Load cart from localStorage
  const savedCart = localStorage.getItem('fivem-cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }

  // Cart icon click
  const cartIcon = document.querySelector('.cart-icon');
  const cartSidebar = document.querySelector('.cart-sidebar');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartClose = document.querySelector('.cart-close');

  if (cartIcon && cartSidebar) {
    cartIcon.addEventListener('click', () => {
      cartSidebar.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
    });
  }

  if (cartClose && cartSidebar) {
    cartClose.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
      if (cartOverlay) cartOverlay.classList.remove('active');
    });
  }

  if (cartOverlay && cartSidebar) {
    cartOverlay.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
      cartOverlay.classList.remove('active');
    });
  }

  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const productCard = button.closest('.product-card');
      if (productCard) {
        const product = {
          id: productCard.dataset.productId,
          name: productCard.querySelector('.product-title')?.textContent,
          price: parseFloat(productCard.dataset.price),
          image: productCard.querySelector('.product-image img')?.src,
          category: productCard.querySelector('.product-category')?.textContent,
          quantity: 1
        };
        addToCart(product);
      }
    });
  });
}

function addToCart(product) {
  // Check if user is logged in
  const currentUser = localStorage.getItem('fivem-current-user') || sessionStorage.getItem('fivem-current-user');
  if (!currentUser) {
    showAuthRequiredToast();
    showAuthModal('signup');
    return;
  }
  
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push(product);
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartUI();
    }
  }
}

function saveCart() {
  localStorage.setItem('fivem-cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartCount = document.querySelector('.cart-count');
  const cartItems = document.querySelector('.cart-items');
  const cartTotal = document.querySelector('.cart-total-price');

  // Update count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    if (totalItems > 0) {
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }
  
  // Show/hide currency converter based on cart items
  const currencyConverter = document.getElementById('currencyConverter');
  if (currencyConverter) {
    if (cart.length === 0) {
      currencyConverter.classList.add('hidden');
    } else {
      currencyConverter.classList.remove('hidden');
    }
  }

  // Update items
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Your cart is empty</p>';
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">€${item.price.toFixed(2)}</div>
            <div class="cart-item-quantity">
              <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Update total
  if (cartTotal) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `€${total.toFixed(2)}`;
    
    // Update currency converter
    updateCurrencyConverter(total);
  }
}

// Currency converter function
function updateCurrencyConverter(euroAmount) {
  // Approximate conversion rates (1 EUR = X)
  const rates = {
    usd: 1.08,  // 1 EUR = 1.08 USD
    rs: 90.5,   // 1 EUR = 90.5 Indian Rupees
    bdt: 119.5  // 1 EUR = 119.5 Bangladeshi Taka
  };
  
  const usdValue = document.getElementById('usd-value');
  const rsValue = document.getElementById('rs-value');
  const bdtValue = document.getElementById('bdt-value');
  
  if (usdValue) usdValue.textContent = `$${(euroAmount * rates.usd).toFixed(2)} USD`;
  if (rsValue) rsValue.textContent = `₹${(euroAmount * rates.rs).toFixed(2)} RS`;
  if (bdtValue) bdtValue.textContent = `৳${(euroAmount * rates.bdt).toFixed(2)} BDT`;
}

// Toggle currency converter dropdown
function toggleCurrencyConverter() {
  const converter = document.getElementById('currencyConverter');
  if (converter) {
    converter.classList.toggle('active');
  }
}

// Close currency converter when clicking outside
document.addEventListener('click', function(e) {
  const converter = document.getElementById('currencyConverter');
  if (converter && !converter.contains(e.target)) {
    converter.classList.remove('active');
  }
});

// Toast Notifications
function initializeToasts() {
  // Toast container
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    `;
    document.body.appendChild(container);
  }
}

function showToast(message, duration = 3000) {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-message">✓ ${message}</div>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showAuthRequiredToast() {
  showToast('Please login or create an account to add items to cart', 4000);
}

// Utility Functions
function formatPrice(price) {
  return `€${price.toFixed(2)}`;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
