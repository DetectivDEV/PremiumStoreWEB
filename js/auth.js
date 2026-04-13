/* ========================================
   AUTHENTICATION SYSTEM - FiveM Premium Store
   ======================================== */

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

// Initialize Authentication
function initAuth() {
  // Check if user is already logged in
  checkAuthStatus();
  
  // Setup event listeners
  setupAuthModal();
  setupLoginForm();
  setupSignupForm();
  setupPasswordToggles();
  setupPasswordStrengthMeter();
  setupProfileDropdown();
}

// ========================================
// AUTH MODAL FUNCTIONS
// ========================================

function setupAuthModal() {
  const authBtn = document.getElementById('authBtn');
  const authModal = document.getElementById('authModal');
  const authModalClose = document.getElementById('authModalClose');
  const authOverlay = authModal?.querySelector('.modal');
  
  // Open modal
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      showAuthModal('login');
    });
  }
  
  // Close modal
  if (authModalClose) {
    authModalClose.addEventListener('click', () => {
      hideAuthModal();
    });
  }
  
  // Close on overlay click
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        hideAuthModal();
      }
    });
  }
  
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal?.classList.contains('active')) {
      hideAuthModal();
    }
  });
}

function showAuthModal(tab = 'login') {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('active');
    switchTab(tab);
    document.body.style.overflow = 'hidden';
  }
}

function hideAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset forms
    document.getElementById('loginForm')?.reset();
    document.getElementById('signupForm')?.reset();
    clearFormErrors();
    resetPasswordStrength();
  }
}

function switchTab(tab) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  // Update tab buttons
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });
  
  // Show/hide forms
  if (loginForm && signupForm) {
    if (tab === 'login') {
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
    } else {
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
    }
  }
  
  clearFormErrors();
}

// ========================================
// LOGIN FORM
// ========================================

function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    
    // Real-time validation
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    loginEmail?.addEventListener('blur', () => {
      validateEmail(loginEmail.value, 'loginEmailError');
    });
    
    loginPassword?.addEventListener('blur', () => {
      validateRequired(loginPassword.value, 'Password', 'loginPasswordError');
    });
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Clear previous errors
  clearFormErrors();
  
  // Validate inputs
  let hasErrors = false;
  
  if (!validateEmail(email, 'loginEmailError')) hasErrors = true;
  if (!validateRequired(password, 'Password', 'loginPasswordError')) hasErrors = true;
  
  if (hasErrors) return;
  
  // Check credentials
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    showFieldError('loginEmailError', 'No account found with this email');
    return;
  }
  
  // Verify password (with hashing)
  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    showFieldError('loginPasswordError', 'Incorrect password');
    return;
  }
  
  // Login successful
  saveUserSession(user, rememberMe);
  updateNavbarForAuth(user);
  hideAuthModal();
  showToast(`Welcome back, ${user.username}!`, 3000);
}

// ========================================
// SIGNUP FORM
// ========================================

function setupSignupForm() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
    
    // Real-time validation
    const signupUsername = document.getElementById('signupUsername');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirmPassword = document.getElementById('signupConfirmPassword');
    
    signupUsername?.addEventListener('blur', () => {
      validateUsername(signupUsername.value, 'signupUsernameError');
    });
    
    signupEmail?.addEventListener('blur', () => {
      validateEmail(signupEmail.value, 'signupEmailError');
    });
    
    signupPassword?.addEventListener('input', () => {
      updatePasswordStrength(signupPassword.value);
      validatePassword(signupPassword.value, 'signupPasswordError');
    });
    
    signupConfirmPassword?.addEventListener('blur', () => {
      validateConfirmPassword(signupConfirmPassword.value, signupPassword.value, 'signupConfirmPasswordError');
    });
  }
}

async function handleSignup(event) {
  event.preventDefault();
  
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  
  // Clear previous errors
  clearFormErrors();
  
  // Validate inputs
  let hasErrors = false;
  
  if (!validateUsername(username, 'signupUsernameError')) hasErrors = true;
  if (!validateEmail(email, 'signupEmailError')) hasErrors = true;
  if (!validatePassword(password, 'signupPasswordError')) hasErrors = true;
  if (!validateConfirmPassword(confirmPassword, password, 'signupConfirmPasswordError')) hasErrors = true;
  
  if (!agreeTerms) {
    showToast('Please agree to the Terms of Service and Privacy Policy', 3000);
    hasErrors = true;
  }
  
  if (hasErrors) return;
  
  // Check if email already exists
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showFieldError('signupEmailError', 'This email is already registered');
    return;
  }
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    showFieldError('signupUsernameError', 'This username is already taken');
    return;
  }
  
  // Create new user
  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: 'user_' + Date.now(),
    username: username,
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  // Save user
  users.push(newUser);
  localStorage.setItem('fivem-users', JSON.stringify(users));
  
  // Auto login after signup
  saveUserSession(newUser, false);
  updateNavbarForAuth(newUser);
  hideAuthModal();
  showToast(`Welcome to Premium Store, ${username}!`, 3000);
}

// ========================================
// VALIDATION FUNCTIONS
// ========================================

function validateUsername(username, errorId) {
  if (!username || username.length === 0) {
    showFieldError(errorId, 'Username is required');
    return false;
  }
  
  if (username.length < 3) {
    showFieldError(errorId, 'Username must be at least 3 characters');
    return false;
  }
  
  if (username.length > 20) {
    showFieldError(errorId, 'Username must be less than 20 characters');
    return false;
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showFieldError(errorId, 'Username can only contain letters, numbers, and underscores');
    return false;
  }
  
  clearFieldError(errorId);
  return true;
}

function validateEmail(email, errorId) {
  if (!email || email.length === 0) {
    showFieldError(errorId, 'Email is required');
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError(errorId, 'Please enter a valid email address');
    return false;
  }
  
  clearFieldError(errorId);
  return true;
}

function validatePassword(password, errorId) {
  if (!password || password.length === 0) {
    showFieldError(errorId, 'Password is required');
    return false;
  }
  
  if (password.length < 8) {
    showFieldError(errorId, 'Password must be at least 8 characters');
    return false;
  }
  
  clearFieldError(errorId);
  return true;
}

function validateConfirmPassword(confirmPassword, password, errorId) {
  if (!confirmPassword || confirmPassword.length === 0) {
    showFieldError(errorId, 'Please confirm your password');
    return false;
  }
  
  if (confirmPassword !== password) {
    showFieldError(errorId, 'Passwords do not match');
    return false;
  }
  
  clearFieldError(errorId);
  return true;
}

function validateRequired(value, fieldName, errorId) {
  if (!value || value.length === 0) {
    showFieldError(errorId, `${fieldName} is required`);
    return false;
  }
  clearFieldError(errorId);
  return true;
}

function clearFormErrors() {
  const errorElements = document.querySelectorAll('.form-error');
  errorElements.forEach(el => el.textContent = '');
  
  const inputElements = document.querySelectorAll('.form-group input');
  inputElements.forEach(el => {
    el.classList.remove('error', 'success');
  });
}

function showFieldError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    
    // Mark input as error
    const inputElement = errorElement.previousElementSibling?.querySelector('input') || 
                         errorElement.previousElementSibling;
    if (inputElement) {
      inputElement.classList.add('error');
      inputElement.classList.remove('success');
    }
  }
}

function clearFieldError(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = '';
    
    // Mark input as success
    const inputElement = errorElement.previousElementSibling?.querySelector('input') || 
                         errorElement.previousElementSibling;
    if (inputElement) {
      inputElement.classList.remove('error');
      inputElement.classList.add('success');
    }
  }
}

// ========================================
// PASSWORD STRENGTH METER
// ========================================

function setupPasswordStrengthMeter() {
  const signupPassword = document.getElementById('signupPassword');
  if (signupPassword) {
    signupPassword.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }
}

function updatePasswordStrength(password) {
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  
  if (!strengthBar || !strengthText) return;
  
  const strength = checkPasswordStrength(password);
  
  // Remove all classes
  strengthBar.className = 'strength-bar';
  strengthText.className = 'strength-text';
  
  if (password.length === 0) {
    strengthText.textContent = 'Password strength';
    return;
  }
  
  switch (strength) {
    case 0:
    case 1:
      strengthBar.classList.add('weak');
      strengthText.classList.add('weak');
      strengthText.textContent = 'Weak - Add uppercase, numbers, and special characters';
      break;
    case 2:
      strengthBar.classList.add('fair');
      strengthText.classList.add('fair');
      strengthText.textContent = 'Fair - Add more character types';
      break;
    case 3:
      strengthBar.classList.add('good');
      strengthText.classList.add('good');
      strengthText.textContent = 'Good - Almost there!';
      break;
    case 4:
      strengthBar.classList.add('strong');
      strengthText.classList.add('strong');
      strengthText.textContent = 'Strong - Excellent password!';
      break;
  }
}

function checkPasswordStrength(password) {
  let score = 0;
  
  if (password.length === 0) return 0;
  
  // Length check
  if (password.length >= 8) score++;
  
  // Has uppercase
  if (/[A-Z]/.test(password)) score++;
  
  // Has lowercase
  if (/[a-z]/.test(password)) score++;
  
  // Has number
  if (/[0-9]/.test(password)) score++;
  
  // Has special character
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Return score from 0-4
  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  if (score >= 4) return 4;
  return 0;
}

function resetPasswordStrength() {
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  
  if (strengthBar) strengthBar.className = 'strength-bar';
  if (strengthText) {
    strengthText.className = 'strength-text';
    strengthText.textContent = 'Password strength';
  }
}

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================

function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      togglePasswordVisibility(targetId, btn);
    });
  });
}

function togglePasswordVisibility(inputId, toggleBtn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    input.type = 'password';
    toggleBtn.textContent = '👁️';
  }
}

// ========================================
// PROFILE DROPDOWN
// ========================================

function setupProfileDropdown() {
  const profileTrigger = document.getElementById('profileTrigger');
  const profileDropdown = document.getElementById('profileDropdown');
  
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('active');
      }
    });
    
    // Logout button
    const logoutBtn = profileDropdown.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  }
}

// ========================================
// USER SESSION MANAGEMENT
// ========================================

function saveUserSession(user, rememberMe) {
  const session = {
    id: user.id,
    username: user.username,
    email: user.email,
    isLoggedIn: true,
    loginTime: new Date().toISOString(),
    rememberMe: rememberMe
  };
  
  if (rememberMe) {
    // Store with no expiration (persistent)
    localStorage.setItem('fivem-current-user', JSON.stringify(session));
  } else {
    // Store in sessionStorage (expires when tab closes)
    sessionStorage.setItem('fivem-current-user', JSON.stringify(session));
  }
}

function loadUserSession() {
  // Check localStorage first (remember me)
  let session = localStorage.getItem('fivem-current-user');
  if (session) {
    return JSON.parse(session);
  }
  
  // Check sessionStorage (session only)
  session = sessionStorage.getItem('fivem-current-user');
  if (session) {
    return JSON.parse(session);
  }
  
  return null;
}

function checkAuthStatus() {
  const user = loadUserSession();
  
  if (user && user.isLoggedIn) {
    updateNavbarForAuth(user);
  } else {
    updateNavbarForGuest();
  }
}

function updateNavbarForAuth(user) {
  const authBtn = document.getElementById('authBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  
  if (authBtn) authBtn.style.display = 'none';
  if (profileDropdown) {
    profileDropdown.style.display = 'block';
    
    // Update profile info
    const avatar = profileDropdown.querySelector('.profile-avatar');
    const username = profileDropdown.querySelector('.profile-username');
    
    if (avatar) {
      avatar.textContent = user.username.charAt(0).toUpperCase();
    }
    if (username) {
      username.textContent = user.username;
    }
  }
}

function updateNavbarForGuest() {
  const authBtn = document.getElementById('authBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  
  if (authBtn) authBtn.style.display = 'block';
  if (profileDropdown) profileDropdown.style.display = 'none';
}

function logout() {
  // Clear sessions
  localStorage.removeItem('fivem-current-user');
  sessionStorage.removeItem('fivem-current-user');
  
  updateNavbarForGuest();
  showToast('You have been logged out successfully', 3000);
  
  // Close dropdown
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown) {
    profileDropdown.classList.remove('active');
  }
}

// ========================================
// AUTHENTICATION CHECK
// ========================================

function requireAuth() {
  const user = loadUserSession();
  return user && user.isLoggedIn;
}

function showAuthRequiredToast() {
  showToast('Please login or create an account to add items to cart', 4000);
}

// ========================================
// USER DATABASE FUNCTIONS
// ========================================

function getUsers() {
  const users = localStorage.getItem('fivem-users');
  return users ? JSON.parse(users) : [];
}

// ========================================
// PASSWORD HASHING (Basic SHA-256)
// ========================================

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ========================================
// OAUTH LOGIN FUNCTIONS
// ========================================

function loginWithDiscord() {
  // Discord OAuth2 configuration
  const clientId = 'YOUR_DISCORD_CLIENT_ID';
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/discord/callback');
  const scope = encodeURIComponent('identify email guilds');
  
  // Store state for security
  const state = generateRandomState();
  sessionStorage.setItem('discord_oauth_state', state);
  
  // Build Discord OAuth URL
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  
  // For demo purposes, simulate Discord login
  simulateOAuthLogin('discord');
}

function loginWithCFX() {
  // CFX.re (FiveM) OAuth configuration
  const clientId = 'YOUR_CFX_CLIENT_ID';
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/cfx/callback');
  const scope = encodeURIComponent('identify');
  
  // Store state for security
  const state = generateRandomState();
  sessionStorage.setItem('cfx_oauth_state', state);
  
  // Build CFX OAuth URL
  const cfxAuthUrl = `https://id.cfx.re/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  
  // For demo purposes, simulate CFX login
  simulateOAuthLogin('cfx');
}

function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simulate OAuth login for demo
function simulateOAuthLogin(provider) {
  showToast(`Connecting to ${provider.toUpperCase()}...`, 2000);
  
  // Simulate API delay
  setTimeout(() => {
    const mockUser = {
      id: 'user_' + Date.now(),
      username: provider === 'discord' ? 'DiscordUser' : 'CFXUser',
      email: `user@${provider}.com`,
      provider: provider,
      discordId: provider === 'discord' ? '123456789' : null,
      cfxId: provider === 'cfx' ? 'cfx_123456' : null,
      roles: [], // Will be populated from Discord
      isStaff: false,
      avatar: null
    };
    
    // Check if user has staff role (1492610905349816500)
    // This would normally come from Discord API
    // For demo, we'll check if the username contains "admin"
    if (mockUser.username.toLowerCase().includes('admin')) {
      mockUser.roles = ['1492610905349816500'];
      mockUser.isStaff = true;
    }
    
    // Save user to database
    saveOAuthUser(mockUser);
    
    // Save session
    saveUserSession(mockUser, true);
    updateNavbarForAuth(mockUser);
    hideAuthModal();
    showToast(`Welcome, ${mockUser.username}!`, 3000);
  }, 1500);
}

function saveOAuthUser(user) {
  // Get existing users
  const users = getUsers();
  
  // Check if user already exists
  const existingUserIndex = users.findIndex(u => 
    (user.discordId && u.discordId === user.discordId) || 
    (user.cfxId && u.cfxId === user.cfxId)
  );
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = { ...users[existingUserIndex], ...user };
  } else {
    // Add new user
    users.push(user);
  }
  
  localStorage.setItem('fivem-users', JSON.stringify(users));
}

// ========================================
// SOCIAL AUTH (Placeholder for future)
// ========================================

function setupSocialAuth() {
  // OAuth buttons are now handled by onclick handlers
}

// Initialize social auth when DOM loads
document.addEventListener('DOMContentLoaded', setupSocialAuth);
