/* ========================================
   DATABASE - FiveM Premium Store
   ======================================== */

// Database Configuration
const DB_CONFIG = {
  name: 'PremiumStoreDB',
  version: 1,
  stores: {
    products: 'products',
    users: 'users',
    orders: 'orders',
    cart: 'cart'
  }
};

// Staff Role ID from Discord
const STAFF_ROLE_ID = '1492610905349816500';

// Database Manager
class DatabaseManager {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Products Store
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.products)) {
          const productStore = db.createObjectStore(DB_CONFIG.stores.products, { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('framework', 'framework', { unique: false });
          productStore.createIndex('price', 'price', { unique: false });
        }

        // Users Store
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.users)) {
          const userStore = db.createObjectStore(DB_CONFIG.stores.users, { keyPath: 'id', autoIncrement: true });
          userStore.createIndex('discordId', 'discordId', { unique: true });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('role', 'role', { unique: false });
        }

        // Orders Store
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.orders)) {
          const orderStore = db.createObjectStore(DB_CONFIG.stores.orders, { keyPath: 'id', autoIncrement: true });
          orderStore.createIndex('userId', 'userId', { unique: false });
          orderStore.createIndex('status', 'status', { unique: false });
          orderStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  // Product Operations
  async addProduct(product) {
    if (!await this.isStaff()) throw new Error('Unauthorized: Staff only');
    return this.add(DB_CONFIG.stores.products, product);
  }

  async updateProduct(id, updates) {
    if (!await this.isStaff()) throw new Error('Unauthorized: Staff only');
    return this.update(DB_CONFIG.stores.products, id, updates);
  }

  async deleteProduct(id) {
    if (!await this.isStaff()) throw new Error('Unauthorized: Staff only');
    return this.delete(DB_CONFIG.stores.products, id);
  }

  async getAllProducts() {
    return this.getAll(DB_CONFIG.stores.products);
  }

  async getProductsByCategory(category) {
    return this.getByIndex(DB_CONFIG.stores.products, 'category', category);
  }

  async getProductsByFramework(framework) {
    return this.getByIndex(DB_CONFIG.stores.products, 'framework', framework);
  }

  // User Operations
  async addUser(user) {
    return this.add(DB_CONFIG.stores.users, user);
  }

  async getUserByDiscordId(discordId) {
    return this.getByIndex(DB_CONFIG.stores.users, 'discordId', discordId);
  }

  async updateUserRole(discordId, roles) {
    const user = await this.getUserByDiscordId(discordId);
    if (user) {
      user.roles = roles;
      user.isStaff = roles.includes(STAFF_ROLE_ID);
      return this.update(DB_CONFIG.stores.users, user.id, user);
    }
  }

  // Check if current user is staff
  async isStaff() {
    const currentUser = await this.getCurrentUser();
    return currentUser && (currentUser.isStaff || (currentUser.roles && currentUser.roles.includes(STAFF_ROLE_ID)));
  }

  async getCurrentUser() {
    const userData = localStorage.getItem('fivem-current-user') || sessionStorage.getItem('fivem-current-user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return this.getUserByDiscordId(user.discordId);
  }

  // Generic CRUD Operations
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, id, updates) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => {
        const data = { ...request.result, ...updates, id };
        store.put(data);
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Initialize sample products
const sampleProducts = [
  {
    id: 'mlo-001',
    name: 'Luxury Penthouse MLO',
    category: 'mlos',
    framework: 'standalone',
    price: 49.99,
    originalPrice: 69.99,
    description: 'High-end penthouse with stunning city views, modern furniture, and custom lighting.',
    image: 'https://picsum.photos/seed/penthouse/800/600',
    badge: 'SALE',
    features: ['Custom Interior', 'Optimized Performance', 'Easy Installation'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'veh-003',
    name: 'Emergency Vehicle Pack',
    category: 'vehicles',
    framework: 'standalone',
    price: 89.99,
    description: 'Complete pack: Police, Ambulance, Fire trucks with working lights and sirens.',
    image: 'https://picsum.photos/seed/emergency/800/600',
    badge: 'POPULAR',
    features: ['5 Vehicles', 'ELS Compatible', 'Custom Handling'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'scr-001',
    name: 'Advanced Housing System',
    category: 'scripts',
    framework: 'qbox',
    price: 39.99,
    description: 'Complete housing system with furniture placement, storage, and key sharing.',
    image: 'https://picsum.photos/seed/housing/800/600',
    badge: 'NEW',
    features: ['Furniture System', 'Storage', 'Key Sharing'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'scr-002',
    name: 'ESX Job System',
    category: 'scripts',
    framework: 'esx',
    price: 29.99,
    description: 'Complete job system with multiple professions and progression.',
    image: 'https://picsum.photos/seed/jobs/800/600',
    badge: null,
    features: ['Multiple Jobs', 'Progression System', 'Salary Management'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'scr-003',
    name: 'QB-Core Inventory',
    category: 'scripts',
    framework: 'qbcore',
    price: 34.99,
    description: 'Advanced inventory system with crafting and storage.',
    image: 'https://picsum.photos/seed/inventory/800/600',
    badge: null,
    features: ['Crafting', 'Storage', 'Weight System'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'qbx-001',
    name: 'QBox Garage System',
    category: 'scripts',
    framework: 'qbox',
    price: 44.99,
    description: 'Modern garage system for QBox framework with impound and insurance.',
    image: 'https://picsum.photos/seed/garage/800/600',
    badge: 'NEW',
    features: ['Impound', 'Insurance', 'Private Garages'],
    createdAt: new Date().toISOString()
  }
];

// Initialize Database
const db = new DatabaseManager();

// Seed database with sample products
db.init().then(async () => {
  const existingProducts = await db.getAllProducts();
  if (existingProducts.length === 0) {
    for (const product of sampleProducts) {
      await db.add(DB_CONFIG.stores.products, product);
    }
    console.log('Database seeded with sample products');
  }
});

// Export for use in other modules
window.DatabaseManager = DatabaseManager;
window.db = db;
window.STAFF_ROLE_ID = STAFF_ROLE_ID;
