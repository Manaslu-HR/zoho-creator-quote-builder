/**
 * Timeline Component
 * Manages the day-by-day timeline view with day generation and management
 */

const Timeline = {
  days: [],
  currentQuoteId: null,
  
  /**
   * Initialize the timeline component
   */
  init(quoteId) {
    this.currentQuoteId = quoteId;
    this.bindEvents();
    this.loadDays();
  },
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Add day button
    const addDayBtn = document.getElementById('addDayBtn');
    if (addDayBtn) {
      addDayBtn.addEventListener('click', () => this.addDay());
    }
    
    // Generate days button
    const generateDaysBtn = document.getElementById('generateDaysBtn');
    if (generateDaysBtn) {
      generateDaysBtn.addEventListener('click', () => this.generateDaysFromDateRange());
    }
  },
  
  /**
   * Load existing days from Zoho Creator
   */
  async loadDays() {
    try {
      const criteria = `QuoteID == ${this.currentQuoteId}`;
      const days = await window.API.fetchRecords('QuoteDays', criteria);
      
      this.days = days.sort((a, b) => a.DayNumber - b.DayNumber);
      this.renderTimeline();
    } catch (error) {
      console.error('Error loading days:', error);
    }
  },
  
  /**
   * Generate days automatically from quote date range
   */
  async generateDaysFromDateRange() {
    try {
      const startDate = document.getElementById('quoteStartDate').value;
      const endDate = document.getElementById('quoteEndDate').value;
      
      if (!startDate || !endDate) {
        alert('Please set start and end dates for the quote first');
        return;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      // Clear existing days
      this.days = [];
      const container = document.getElementById('timelineContainer');
      container.innerHTML = '';
      
      // Generate days
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        
        await this.addDay({
          dayNumber: i + 1,
          dayDate: date.toISOString().split('T')[0],
          dayTitle: `Day ${i + 1}`
        });
      }
      
      this.renderTimeline();
    } catch (error) {
      console.error('Error generating days:', error);
      alert('Failed to generate days');
    }
  },
  
  /**
   * Add a new day to the timeline
   */
  async addDay(dayData = null) {
    try {
      const dayNumber = this.days.length + 1;
      
      const newDay = {
        QuoteID: this.currentQuoteId,
        DayNumber: dayData?.dayNumber || dayNumber,
        DayDate: dayData?.dayDate || window.Helpers.addDays(new Date(), dayNumber - 1),
        DayTitle: dayData?.dayTitle || `Day ${dayNumber}`,
        DayNotes: dayData?.dayNotes || '',
        DayTotal: 0
      };
      
      // Save to Zoho Creator
      const savedDay = await window.API.createRecord('QuoteDays', newDay);
      
      this.days.push(savedDay);
      this.renderTimeline();
      
      return savedDay;
    } catch (error) {
      console.error('Error adding day:', error);
      throw error;
    }
  },
  
  /**
   * Remove a day from the timeline
   */
  async removeDay(dayId) {
    try {
      if (!confirm('Are you sure you want to delete this day and all its items?')) {
        return;
      }
      
      // Delete day and its items from Zoho Creator
      await window.API.deleteRecord('QuoteDays', dayId);
      
      // Delete all items for this day
      const items = await window.API.fetchRecords('QuoteItems', `DayID == ${dayId}`);
      for (const item of items) {
        await window.API.deleteRecord('QuoteItems', item.ID);
      }
      
      // Remove from local array
      this.days = this.days.filter(day => day.ID !== dayId);
      
      // Re-render timeline
      this.renderTimeline();
    } catch (error) {
      console.error('Error removing day:', error);
      alert('Failed to remove day');
    }
  },
  
  /**
   * Update day information
   */
  async updateDay(dayId, updates) {
    try {
      await window.API.updateRecord('QuoteDays', dayId, updates);
      
      // Update local data
      const day = this.days.find(d => d.ID === dayId);
      if (day) {
        Object.assign(day, updates);
      }
      
      this.renderTimeline();
    } catch (error) {
      console.error('Error updating day:', error);
      throw error;
    }
  },
  
  /**
   * Add an item to a specific day
   */
  async addItemToDay(dayId, itemData) {
    try {
      const newItem = {
        DayID: dayId,
        ItemType: itemData.itemType,
        ItemSource: itemData.itemSource || 'catalog',
        ItemName: itemData.Name || itemData.Title,
        Description: itemData.Description || '',
        StartTime: itemData.StartTime || '',
        EndTime: itemData.EndTime || '',
        UnitPrice: itemData.StandardRate || itemData.Price || 0,
        Quantity: itemData.Quantity || 1,
        TotalPrice: (itemData.StandardRate || itemData.Price || 0) * (itemData.Quantity || 1)
      };
      
      // Save to Zoho Creator
      const savedItem = await window.API.createRecord('QuoteItems', newItem);
      
      // Update day total
      await this.updateDayTotal(dayId);
      
      // Re-render the day card
      const dayElement = document.querySelector(`[data-day-id="${dayId}"]`);
      if (dayElement) {
        const day = this.days.find(d => d.ID === dayId);
        if (day) {
          window.DayCard.render(dayElement, day);
        }
      }
      
      return savedItem;
    } catch (error) {
      console.error('Error adding item to day:', error);
      alert('Failed to add item to day');
    }
  },
  
  /**
   * Update day total by summing all items
   */
  async updateDayTotal(dayId) {
    try {
      const items = await window.API.fetchRecords('QuoteItems', `DayID == ${dayId}`);
      const total = items.reduce((sum, item) => sum + (item.TotalPrice || 0), 0);
      
      await this.updateDay(dayId, { DayTotal: total });
      
      // Update quote total
      await this.updateQuoteTotal();
    } catch (error) {
      console.error('Error updating day total:', error);
    }
  },
  
  /**
   * Update quote total by summing all days
   */
  async updateQuoteTotal() {
    try {
      const days = await window.API.fetchRecords('QuoteDays', `QuoteID == ${this.currentQuoteId}`);
      const total = days.reduce((sum, day) => sum + (day.DayTotal || 0), 0);
      
      await window.API.updateRecord('Quote', this.currentQuoteId, { TotalAmount: total });
      
      // Update UI
      const totalElement = document.getElementById('quoteTotalAmount');
      if (totalElement) {
        totalElement.textContent = window.Helpers.formatCurrency(total);
      }
    } catch (error) {
      console.error('Error updating quote total:', error);
    }
  },
  
  /**
   * Render the timeline with all days
   */
  renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this.days.length === 0) {
      container.innerHTML = `
        <div class="empty-timeline">
          <i class="fas fa-calendar-plus fa-3x"></i>
          <p>No days yet. Click "Add Day" or "Generate Days" to start building your itinerary.</p>
        </div>
      `;
      return;
    }
    
    this.days.forEach(day => {
      const dayCard = window.DayCard.create(day);
      container.appendChild(dayCard);
    });
    
    // Initialize drag & drop for timeline
    window.DragDrop.initializeTimeline();
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Timeline = Timeline;
}
