/**
 * Day Card Component
 * Renders and manages individual day cards in the timeline with drop zones and item management
 */

const DayCard = {
  /**
   * Create a day card element
   */
  create(dayData) {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.dataset.dayId = dayData.ID;
    card.dataset.dayNumber = dayData.DayNumber;
    
    this.render(card, dayData);
    return card;
  },
  
  /**
   * Render day card content
   */
  async render(cardElement, dayData) {
    // Load items for this day
    const items = await window.API.fetchRecords('QuoteItems', `DayID == ${dayData.ID}`);
    
    cardElement.innerHTML = `
      <div class="day-card-header">
        <div class="day-card-header-left">
          <div class="day-number">Day ${dayData.DayNumber}</div>
          <input type="text" 
                 class="day-title-input" 
                 value="${dayData.DayTitle || ''}" 
                 placeholder="Day title..."
                 data-day-id="${dayData.ID}" />
          <input type="date" 
                 class="day-date-input" 
                 value="${dayData.DayDate || ''}" 
                 data-day-id="${dayData.ID}" />
        </div>
        <div class="day-card-header-right">
          <span class="day-total">${window.Helpers.formatCurrency(dayData.DayTotal || 0)}</span>
          <button class="btn-icon" data-action="expand" data-day-id="${dayData.ID}">
            <i class="fas fa-chevron-down"></i>
          </button>
          <button class="btn-icon" data-action="delete" data-day-id="${dayData.ID}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="day-card-body">
        <div class="day-items-container" data-day-id="${dayData.ID}">
          ${items.length === 0 ? '<div class="day-empty-state">Drag items here or click items from the sidebar</div>' : ''}
          ${items.map(item => window.ItemCard.create(item).outerHTML).join('')}
        </div>
        
        <div class="day-card-notes">
          <textarea 
            class="day-notes-input" 
            placeholder="Add notes for this day..."
            data-day-id="${dayData.ID}"
          >${dayData.DayNotes || ''}</textarea>
        </div>
      </div>
    `;
    
    // Bind events
    this.bindCardEvents(cardElement, dayData.ID);
    
    // Initialize drag & drop
    this.initializeDropZone(cardElement, dayData.ID);
  },
  
  /**
   * Bind events for day card
   */
  bindCardEvents(cardElement, dayId) {
    // Day title input
    const titleInput = cardElement.querySelector('.day-title-input');
    if (titleInput) {
      titleInput.addEventListener('blur', async (e) => {
        await window.Timeline.updateDay(dayId, { DayTitle: e.target.value });
      });
    }
    
    // Day date input
    const dateInput = cardElement.querySelector('.day-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', async (e) => {
        await window.Timeline.updateDay(dayId, { DayDate: e.target.value });
      });
    }
    
    // Day notes textarea
    const notesInput = cardElement.querySelector('.day-notes-input');
    if (notesInput) {
      notesInput.addEventListener('blur', async (e) => {
        await window.Timeline.updateDay(dayId, { DayNotes: e.target.value });
      });
    }
    
    // Expand/collapse button
    const expandBtn = cardElement.querySelector('[data-action="expand"]');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        cardElement.classList.toggle('collapsed');
        const icon = expandBtn.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
      });
    }
    
    // Delete button
    const deleteBtn = cardElement.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        await window.Timeline.removeDay(dayId);
      });
    }
  },
  
  /**
   * Initialize drop zone for day card
   */
  initializeDropZone(cardElement, dayId) {
    const dropZone = cardElement.querySelector('.day-items-container');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
      if (e.target === dropZone) {
        dropZone.classList.remove('drag-over');
      }
    });
    
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      try {
        const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const itemType = e.dataTransfer.getData('itemType');
        
        // Add item to this day
        await window.Timeline.addItemToDay(dayId, {
          ...itemData,
          itemType: itemType
        });
      } catch (error) {
        console.error('Error dropping item:', error);
        alert('Failed to add item to day');
      }
    });
  },
  
  /**
   * Update day total display
   */
  updateTotal(dayId, newTotal) {
    const card = document.querySelector(`[data-day-id="${dayId}"]`);
    if (!card) return;
    
    const totalElement = card.querySelector('.day-total');
    if (totalElement) {
      totalElement.textContent = window.Helpers.formatCurrency(newTotal);
    }
  },
  
  /**
   * Add item to day card UI
   */
  addItem(dayId, itemData) {
    const card = document.querySelector(`[data-day-id="${dayId}"]`);
    if (!card) return;
    
    const container = card.querySelector('.day-items-container');
    if (!container) return;
    
    // Remove empty state if present
    const emptyState = container.querySelector('.day-empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    
    // Create and add item card
    const itemCard = window.ItemCard.create(itemData);
    container.appendChild(itemCard);
  },
  
  /**
   * Remove item from day card UI
   */
  removeItem(itemId) {
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!itemElement) return;
    
    const container = itemElement.closest('.day-items-container');
    itemElement.remove();
    
    // Add empty state if no more items
    if (container && container.children.length === 0) {
      container.innerHTML = '<div class="day-empty-state">Drag items here or click items from the sidebar</div>';
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.DayCard = DayCard;
}
