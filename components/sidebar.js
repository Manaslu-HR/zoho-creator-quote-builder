/**
 * Sidebar Component
 * Manages the product catalog sidebar with filtering, category switching, and drag & drop functionality
 */

const Sidebar = {
  currentCategory: 'accommodations',
  searchQuery: '',
  
  /**
   * Initialize the sidebar component
   */
  init() {
    this.bindEvents();
    this.loadCatalogItems();
  },
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Category tab switching
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchCategory(e.target.dataset.category);
      });
    });
    
    // Search input
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterCatalogItems();
      });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.applyFilter(e.target.dataset.filter);
      });
    });
    
    // Open API search modal
    const apiSearchBtn = document.getElementById('apiSearchBtn');
    if (apiSearchBtn) {
      apiSearchBtn.addEventListener('click', () => {
        window.APISearch.openModal(this.currentCategory);
      });
    }
  },
  
  /**
   * Switch between product categories
   */
  switchCategory(category) {
    this.currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // Load items for the selected category
    this.loadCatalogItems();
  },
  
  /**
   * Load catalog items from Zoho Creator database
   */
  async loadCatalogItems() {
    try {
      const formName = this.getCategoryFormName();
      const items = await window.API.fetchRecords(formName);
      
      this.renderCatalogItems(items);
      this.initializeDragDrop();
    } catch (error) {
      console.error('Error loading catalog items:', error);
      this.showError('Failed to load catalog items');
    }
  },
  
  /**
   * Get the Zoho Creator form name for current category
   */
  getCategoryFormName() {
    const formMap = {
      accommodations: 'Accommodations',
      transfers: 'Transfers',
      excursions: 'Excursions',
      packages: 'Packages',
      flights: 'Flights'
    };
    
    return formMap[this.currentCategory] || 'Accommodations';
  },
  
  /**
   * Render catalog items in the sidebar
   */
  renderCatalogItems(items) {
    const container = document.getElementById('catalogItems');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (items.length === 0) {
      container.innerHTML = '<div class="no-items">No items found</div>';
      return;
    }
    
    items.forEach(item => {
      const itemElement = this.createCatalogItemElement(item);
      container.appendChild(itemElement);
    });
  },
  
  /**
   * Create a catalog item element
   */
  createCatalogItemElement(item) {
    const div = document.createElement('div');
    div.className = 'catalog-item';
    div.draggable = true;
    div.dataset.itemId = item.ID;
    div.dataset.itemType = this.currentCategory;
    div.dataset.itemData = JSON.stringify(item);
    
    const iconMap = {
      accommodations: 'fa-hotel',
      transfers: 'fa-car',
      excursions: 'fa-map-marked-alt',
      packages: 'fa-box',
      flights: 'fa-plane'
    };
    
    const icon = iconMap[this.currentCategory] || 'fa-box';
    
    div.innerHTML = `
      <div class="catalog-item-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="catalog-item-content">
        <div class="catalog-item-title">${item.Name || item.Title}</div>
        <div class="catalog-item-subtitle">${item.Location || item.Description || ''}</div>
        <div class="catalog-item-price">${window.Helpers.formatCurrency(item.StandardRate || item.Price || 0)}</div>
      </div>
      <div class="catalog-item-action">
        <i class="fas fa-plus"></i>
      </div>
    `;
    
    return div;
  },
  
  /**
   * Initialize drag and drop for catalog items
   */
  initializeDragDrop() {
    const catalogItems = document.querySelectorAll('.catalog-item');
    
    catalogItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', item.dataset.itemData);
        e.dataTransfer.setData('itemType', item.dataset.itemType);
        item.classList.add('dragging');
      });
      
      item.addEventListener('dragend', (e) => {
        item.classList.remove('dragging');
      });
      
      // Click to add item to timeline
      item.addEventListener('click', () => {
        this.addItemToTimeline(JSON.parse(item.dataset.itemData));
      });
    });
  },
  
  /**
   * Filter catalog items based on search query
   */
  filterCatalogItems() {
    const items = document.querySelectorAll('.catalog-item');
    
    items.forEach(item => {
      const title = item.querySelector('.catalog-item-title').textContent.toLowerCase();
      const subtitle = item.querySelector('.catalog-item-subtitle').textContent.toLowerCase();
      
      const matches = title.includes(this.searchQuery) || subtitle.includes(this.searchQuery);
      item.style.display = matches ? 'flex' : 'none';
    });
  },
  
  /**
   * Apply filter to catalog items
   */
  applyFilter(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Apply filter logic based on category
    const items = document.querySelectorAll('.catalog-item');
    
    items.forEach(item => {
      const itemData = JSON.parse(item.dataset.itemData);
      let show = true;
      
      // Category-specific filtering
      switch(filter) {
        case 'starred':
          show = itemData.Starred === true;
          break;
        case 'recent':
          // Show items added in last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          show = new Date(itemData.CreatedDate) > thirtyDaysAgo;
          break;
        case 'popular':
          show = (itemData.UsageCount || 0) > 5;
          break;
        default:
          show = true;
      }
      
      item.style.display = show ? 'flex' : 'none';
    });
  },
  
  /**
   * Add item to timeline (finds the most recent day)
   */
  addItemToTimeline(itemData) {
    // Find the last day in the timeline
    const days = document.querySelectorAll('.day-card');
    if (days.length === 0) {
      alert('Please create a day first before adding items');
      return;
    }
    
    const lastDay = days[days.length - 1];
    const dayId = lastDay.dataset.dayId;
    
    // Add item to the last day
    window.Timeline.addItemToDay(dayId, {
      ...itemData,
      itemType: this.currentCategory,
      itemSource: 'catalog'
    });
  },
  
  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById('catalogItems');
    if (container) {
      container.innerHTML = `<div class="error-message">${message}</div>`;
    }
  }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Sidebar.init());
} else {
  Sidebar.init();
}
