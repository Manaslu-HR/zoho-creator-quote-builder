/**
 * Search Modal Component
 * Generic search modal for filtering and selecting catalog items
 */

const SearchModal = {
  currentModal: null,
  currentCategory: null,
  onSelectCallback: null,
  
  /**
   * Open search modal
   */
  open(category, onSelectCallback) {
    this.currentCategory = category;
    this.onSelectCallback = onSelectCallback;
    
    const modal = this.createModal();
    document.body.appendChild(modal);
    this.currentModal = modal;
    
    modal.style.display = 'flex';
    
    // Load initial results
    this.loadCatalogItems();
    
    // Focus search input
    setTimeout(() => {
      const searchInput = modal.querySelector('#modalSearchInput');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  },
  
  /**
   * Close search modal
   */
  close() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
    }
  },
  
  /**
   * Create modal element
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal search-modal';
    modal.id = 'searchModal';
    
    const categoryLabels = {
      accommodations: 'Accommodations',
      transfers: 'Transfers',
      excursions: 'Excursions',
      packages: 'Packages',
      flights: 'Flights'
    };
    
    const categoryLabel = categoryLabels[this.currentCategory] || 'Items';
    
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Search ${categoryLabel}</h3>
          <button class="modal-close">&times;</button>
        </div>
        
        <div class="modal-search-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              id="modalSearchInput" 
              placeholder="Search by name, location, description..."
              class="form-control search-input" 
            />
          </div>
          <button class="btn btn-primary" id="apiSearchToggleBtn">
            <i class="fas fa-cloud"></i> Search API
          </button>
        </div>
        
        <div class="modal-filters">
          <button class="filter-chip active" data-filter="all">All</button>
          <button class="filter-chip" data-filter="catalog">Catalog</button>
          <button class="filter-chip" data-filter="api">API</button>
          <button class="filter-chip" data-filter="starred">Starred</button>
        </div>
        
        <div class="modal-body">
          <div id="modalSearchResults" class="search-results-grid">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin fa-2x"></i>
              <p>Loading...</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="results-count">0 results found</div>
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
        </div>
      </div>
    `;
    
    this.bindModalEvents(modal);
    return modal;
  },
  
  /**
   * Bind modal events
   */
  bindModalEvents(modal) {
    // Close buttons
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    
    const closeModal = () => this.close();
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Click outside modal to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Search input
    const searchInput = modal.querySelector('#modalSearchInput');
    searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
    
    // API search toggle
    const apiSearchBtn = modal.querySelector('#apiSearchToggleBtn');
    if (apiSearchBtn) {
      apiSearchBtn.addEventListener('click', () => {
        window.APISearch.openModal(this.currentCategory);
        this.close();
      });
    }
    
    // Filter chips
    const filterChips = modal.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filterResults(chip.dataset.filter);
      });
    });
  },
  
  /**
   * Load catalog items
   */
  async loadCatalogItems() {
    try {
      const formName = this.getCategoryFormName();
      const items = await window.API.fetchRecords(formName);
      
      this.renderResults(items);
      this.updateResultsCount(items.length);
    } catch (error) {
      console.error('Error loading catalog items:', error);
      this.showError('Failed to load items');
    }
  },
  
  /**
   * Get form name for category
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
   * Render search results
   */
  renderResults(items) {
    const container = this.currentModal.querySelector('#modalSearchResults');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (items.length === 0) {
      container.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No results found</p></div>';
      return;
    }
    
    items.forEach(item => {
      const card = this.createResultCard(item);
      container.appendChild(card);
    });
  },
  
  /**
   * Create result card
   */
  createResultCard(item) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.dataset.itemId = item.ID;
    
    const iconMap = {
      accommodations: 'fa-hotel',
      transfers: 'fa-car',
      excursions: 'fa-map-marked-alt',
      packages: 'fa-box',
      flights: 'fa-plane'
    };
    
    const icon = iconMap[this.currentCategory] || 'fa-box';
    
    card.innerHTML = `
      <div class="result-card-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="result-card-content">
        <h4>${item.Name || item.Title}</h4>
        <p class="result-subtitle">${item.Location || item.Type || ''}</p>
        <p class="result-description">${(item.Description || '').substring(0, 100)}${item.Description?.length > 100 ? '...' : ''}</p>
        <div class="result-meta">
          <span class="result-price">${window.Helpers.formatCurrency(item.StandardRate || item.Price || 0)}</span>
          <span class="result-source">
            <i class="fas ${item.Source === 'api' ? 'fa-cloud' : 'fa-database'}"></i>
            ${item.Source === 'api' ? 'API' : 'Catalog'}
          </span>
        </div>
      </div>
      <div class="result-card-action">
        <button class="btn btn-sm btn-primary" data-action="select">
          <i class="fas fa-plus"></i> Add
        </button>
      </div>
    `;
    
    // Bind select button
    const selectBtn = card.querySelector('[data-action="select"]');
    selectBtn.addEventListener('click', () => {
      if (this.onSelectCallback) {
        this.onSelectCallback(item);
      }
      this.close();
    });
    
    return card;
  },
  
  /**
   * Handle search
   */
  handleSearch(query) {
    const cards = this.currentModal.querySelectorAll('.search-result-card');
    const lowerQuery = query.toLowerCase();
    
    let visibleCount = 0;
    
    cards.forEach(card => {
      const title = card.querySelector('h4').textContent.toLowerCase();
      const subtitle = card.querySelector('.result-subtitle').textContent.toLowerCase();
      const description = card.querySelector('.result-description').textContent.toLowerCase();
      
      const matches = title.includes(lowerQuery) || 
                     subtitle.includes(lowerQuery) || 
                     description.includes(lowerQuery);
      
      card.style.display = matches ? 'flex' : 'none';
      if (matches) visibleCount++;
    });
    
    this.updateResultsCount(visibleCount);
  },
  
  /**
   * Filter results
   */
  filterResults(filter) {
    const cards = this.currentModal.querySelectorAll('.search-result-card');
    
    let visibleCount = 0;
    
    cards.forEach(card => {
      let show = true;
      
      if (filter === 'catalog') {
        show = card.querySelector('.result-source').textContent.includes('Catalog');
      } else if (filter === 'api') {
        show = card.querySelector('.result-source').textContent.includes('API');
      } else if (filter === 'starred') {
        // Would need to check if item is starred
        show = false; // Placeholder
      }
      
      card.style.display = show ? 'flex' : 'none';
      if (show) visibleCount++;
    });
    
    this.updateResultsCount(visibleCount);
  },
  
  /**
   * Update results count
   */
  updateResultsCount(count) {
    const countElement = this.currentModal.querySelector('.results-count');
    if (countElement) {
      countElement.textContent = `${count} result${count !== 1 ? 's' : ''} found`;
    }
  },
  
  /**
   * Show error
   */
  showError(message) {
    const container = this.currentModal.querySelector('#modalSearchResults');
    if (container) {
      container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>${message}</p></div>`;
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SearchModal = SearchModal;
}
