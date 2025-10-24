/**
 * API Search Component
 * Handles HotelBeds API search integration for hotels, activities, and transfers
 */

const APISearch = {
  apiKey: null,
  apiSecret: null,
  currentModal: null,
  
  /**
   * Initialize API Search with credentials
   */
  init(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  },
  
  /**
   * Open API search modal
   */
  openModal(category) {
    const modal = this.createModal(category);
    document.body.appendChild(modal);
    this.currentModal = modal;
    modal.style.display = 'flex';
  },
  
  /**
   * Close API search modal
   */
  closeModal() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
    }
  },
  
  /**
   * Create API search modal
   */
  createModal(category) {
    const modal = document.createElement('div');
    modal.className = 'modal api-search-modal';
    
    const categoryLabels = {
      accommodations: 'Hotels',
      excursions: 'Activities',
      transfers: 'Transfers'
    };
    
    const categoryLabel = categoryLabels[category] || 'Items';
    
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3><i class="fas fa-cloud"></i> Search HotelBeds ${categoryLabel}</h3>
          <button class="modal-close">&times;</button>
        </div>
        
        <div class="api-search-form">
          ${this.renderSearchForm(category)}
        </div>
        
        <div class="modal-body">
          <div id="apiSearchResults" class="search-results-grid">
            <div class="empty-state">
              <i class="fas fa-search fa-3x"></i>
              <p>Enter search criteria above and click Search to find ${categoryLabel.toLowerCase()}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="results-count"></div>
          <button class="btn btn-secondary" data-action="cancel">Close</button>
        </div>
      </div>
    `;
    
    this.bindModalEvents(modal, category);
    return modal;
  },
  
  /**
   * Render search form based on category
   */
  renderSearchForm(category) {
    switch(category) {
      case 'accommodations':
        return `
          <div class="form-row">
            <div class="form-group">
              <label>Destination</label>
              <input type="text" id="apiDestination" class="form-control" placeholder="City or country code" />
            </div>
            <div class="form-group">
              <label>Check-in</label>
              <input type="date" id="apiCheckIn" class="form-control" />
            </div>
            <div class="form-group">
              <label>Check-out</label>
              <input type="date" id="apiCheckOut" class="form-control" />
            </div>
            <div class="form-group">
              <label>Rooms</label>
              <input type="number" id="apiRooms" class="form-control" value="1" min="1" />
            </div>
          </div>
          <button class="btn btn-primary" id="apiSearchBtn">
            <i class="fas fa-search"></i> Search Hotels
          </button>
        `;
      
      case 'excursions':
        return `
          <div class="form-row">
            <div class="form-group">
              <label>Destination</label>
              <input type="text" id="apiDestination" class="form-control" placeholder="City or country code" />
            </div>
            <div class="form-group">
              <label>Date From</label>
              <input type="date" id="apiDateFrom" class="form-control" />
            </div>
            <div class="form-group">
              <label>Date To</label>
              <input type="date" id="apiDateTo" class="form-control" />
            </div>
          </div>
          <button class="btn btn-primary" id="apiSearchBtn">
            <i class="fas fa-search"></i> Search Activities
          </button>
        `;
      
      case 'transfers':
        return `
          <div class="form-row">
            <div class="form-group">
              <label>From</label>
              <input type="text" id="apiFromLocation" class="form-control" placeholder="Airport or location" />
            </div>
            <div class="form-group">
              <label>To</label>
              <input type="text" id="apiToLocation" class="form-control" placeholder="Hotel or location" />
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" id="apiTransferDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>Time</label>
              <input type="time" id="apiTransferTime" class="form-control" />
            </div>
          </div>
          <button class="btn btn-primary" id="apiSearchBtn">
            <i class="fas fa-search"></i> Search Transfers
          </button>
        `;
      
      default:
        return '<p>Search form not available for this category</p>';
    }
  },
  
  /**
   * Bind modal events
   */
  bindModalEvents(modal, category) {
    // Close buttons
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    
    const closeModal = () => this.closeModal();
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Search button
    const searchBtn = modal.querySelector('#apiSearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch(category);
      });
    }
  },
  
  /**
   * Perform API search
   */
  async performSearch(category) {
    const resultsContainer = this.currentModal.querySelector('#apiSearchResults');
    
    // Show loading
    resultsContainer.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p>Searching HotelBeds...</p>
      </div>
    `;
    
    try {
      let results = [];
      
      switch(category) {
        case 'accommodations':
          results = await this.searchHotels();
          break;
        case 'excursions':
          results = await this.searchActivities();
          break;
        case 'transfers':
          results = await this.searchTransfers();
          break;
      }
      
      this.renderResults(results, category);
    } catch (error) {
      console.error('API search error:', error);
      resultsContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle fa-2x"></i>
          <p>${error.message || 'Failed to search HotelBeds API'}</p>
        </div>
      `;
    }
  },
  
  /**
   * Search hotels via HotelBeds API
   */
  async searchHotels() {
    const destination = this.currentModal.querySelector('#apiDestination').value;
    const checkIn = this.currentModal.querySelector('#apiCheckIn').value;
    const checkOut = this.currentModal.querySelector('#apiCheckOut').value;
    const rooms = this.currentModal.querySelector('#apiRooms').value;
    
    if (!destination || !checkIn || !checkOut) {
      throw new Error('Please fill in all required fields');
    }
    
    // Note: This is a placeholder. In production, you would call the actual HotelBeds API
    // through a backend proxy to avoid exposing API credentials
    
    // Example mock response
    return [
      {
        code: 'HOTEL001',
        name: 'Example Hotel',
        destinationName: destination,
        categoryName: '4 stars',
        minRate: 150.00,
        maxRate: 250.00,
        currency: 'EUR',
        description: 'Luxury hotel in the city center'
      }
    ];
  },
  
  /**
   * Search activities via HotelBeds API
   */
  async searchActivities() {
    const destination = this.currentModal.querySelector('#apiDestination').value;
    const dateFrom = this.currentModal.querySelector('#apiDateFrom').value;
    const dateTo = this.currentModal.querySelector('#apiDateTo').value;
    
    if (!destination || !dateFrom || !dateTo) {
      throw new Error('Please fill in all required fields');
    }
    
    // Placeholder - implement actual API call
    return [];
  },
  
  /**
   * Search transfers via HotelBeds API
   */
  async searchTransfers() {
    const fromLocation = this.currentModal.querySelector('#apiFromLocation').value;
    const toLocation = this.currentModal.querySelector('#apiToLocation').value;
    const transferDate = this.currentModal.querySelector('#apiTransferDate').value;
    
    if (!fromLocation || !toLocation || !transferDate) {
      throw new Error('Please fill in all required fields');
    }
    
    // Placeholder - implement actual API call
    return [];
  },
  
  /**
   * Render search results
   */
  renderResults(results, category) {
    const container = this.currentModal.querySelector('#apiSearchResults');
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search fa-2x"></i>
          <p>No results found. Try adjusting your search criteria.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    results.forEach(result => {
      const card = this.createResultCard(result, category);
      container.appendChild(card);
    });
    
    // Update count
    const countElement = this.currentModal.querySelector('.results-count');
    if (countElement) {
      countElement.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
    }
  },
  
  /**
   * Create result card
   */
  createResultCard(result, category) {
    const card = document.createElement('div');
    card.className = 'search-result-card api-result';
    
    const iconMap = {
      accommodations: 'fa-hotel',
      excursions: 'fa-map-marked-alt',
      transfers: 'fa-car'
    };
    
    const icon = iconMap[category] || 'fa-box';
    
    card.innerHTML = `
      <div class="result-card-icon">
        <i class="fas ${icon}"></i>
        <span class="api-badge">API</span>
      </div>
      <div class="result-card-content">
        <h4>${result.name}</h4>
        <p class="result-subtitle">${result.destinationName || result.location || ''}</p>
        <p class="result-description">${result.description || result.categoryName || ''}</p>
        <div class="result-meta">
          <span class="result-price">
            ${result.minRate ? window.Helpers.formatCurrency(result.minRate) : 'Price on request'}
          </span>
          <span class="result-source">
            <i class="fas fa-cloud"></i> HotelBeds
          </span>
        </div>
      </div>
      <div class="result-card-action">
        <button class="btn btn-sm btn-primary" data-action="add">
          <i class="fas fa-plus"></i> Add to Catalog
        </button>
      </div>
    `;
    
    // Bind add button
    const addBtn = card.querySelector('[data-action="add"]');
    addBtn.addEventListener('click', async () => {
      await this.addToCatalog(result, category);
    });
    
    return card;
  },
  
  /**
   * Add API result to catalog
   */
  async addToCatalog(result, category) {
    try {
      const formName = category.charAt(0).toUpperCase() + category.slice(1);
      
      const catalogItem = {
        Name: result.name,
        Type: result.categoryName || '',
        Location: result.destinationName || result.location || '',
        Description: result.description || '',
        StandardRate: result.minRate || result.price || 0,
        Source: 'api',
        APICode: result.code || '',
        Currency: result.currency || 'EUR'
      };
      
      await window.API.createRecord(formName, catalogItem);
      
      alert(`${result.name} has been added to your catalog!`);
      
      // Refresh sidebar
      if (window.Sidebar) {
        window.Sidebar.loadCatalogItems();
      }
    } catch (error) {
      console.error('Error adding to catalog:', error);
      alert('Failed to add item to catalog');
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.APISearch = APISearch;
}
