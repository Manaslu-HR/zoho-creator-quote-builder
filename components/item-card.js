/**
 * Item Card Component
 * Renders individual item cards within day cards with edit/delete functionality
 */

const ItemCard = {
  /**
   * Create an item card element
   */
  create(itemData) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.itemId = itemData.ID;
    card.dataset.itemType = itemData.ItemType;
    
    const iconMap = {
      accommodations: 'fa-hotel',
      transfers: 'fa-car',
      excursions: 'fa-map-marked-alt',
      packages: 'fa-box',
      flights: 'fa-plane'
    };
    
    const icon = iconMap[itemData.ItemType] || 'fa-box';
    const sourceIcon = itemData.ItemSource === 'api' ? 'fa-cloud' : 'fa-database';
    
    card.innerHTML = `
      <div class="item-card-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="item-card-content">
        <div class="item-card-header">
          <span class="item-name">${itemData.ItemName}</span>
          <span class="item-source"><i class="fas ${sourceIcon}"></i></span>
        </div>
        <div class="item-card-details">
          ${itemData.StartTime ? `<span class="item-time"><i class="far fa-clock"></i> ${itemData.StartTime}${itemData.EndTime ? ' - ' + itemData.EndTime : ''}</span>` : ''}
          <span class="item-quantity">Qty: ${itemData.Quantity || 1}</span>
        </div>
        ${itemData.Description ? `<div class="item-description">${itemData.Description}</div>` : ''}
      </div>
      <div class="item-card-actions">
        <span class="item-price">${window.Helpers.formatCurrency(itemData.TotalPrice || 0)}</span>
        <button class="btn-icon-sm" data-action="edit" data-item-id="${itemData.ID}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon-sm" data-action="delete" data-item-id="${itemData.ID}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    this.bindEvents(card, itemData);
    return card;
  },
  
  /**
   * Bind events for item card
   */
  bindEvents(cardElement, itemData) {
    // Edit button
    const editBtn = cardElement.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.openEditModal(itemData);
      });
    }
    
    // Delete button
    const deleteBtn = cardElement.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        await this.deleteItem(itemData.ID, itemData.DayID);
      });
    }
  },
  
  /**
   * Open edit modal for item
   */
  openEditModal(itemData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editItemModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Item</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Item Name</label>
            <input type="text" id="editItemName" value="${itemData.ItemName}" class="form-control" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="editItemDescription" class="form-control" rows="3">${itemData.Description || ''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" id="editItemStartTime" value="${itemData.StartTime || ''}" class="form-control" />
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" id="editItemEndTime" value="${itemData.EndTime || ''}" class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Unit Price</label>
              <input type="number" id="editItemPrice" value="${itemData.UnitPrice || 0}" class="form-control" step="0.01" />
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input type="number" id="editItemQuantity" value="${itemData.Quantity || 1}" class="form-control" min="1" />
            </div>
          </div>
          <div class="form-group">
            <label>Total Price</label>
            <input type="number" id="editItemTotal" value="${itemData.TotalPrice || 0}" class="form-control" step="0.01" readonly />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-primary" data-action="save">Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Bind modal events
    this.bindModalEvents(modal, itemData);
  },
  
  /**
   * Bind events for edit modal
   */
  bindModalEvents(modal, itemData) {
    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    
    const closeModal = () => {
      modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Auto-calculate total
    const priceInput = modal.querySelector('#editItemPrice');
    const quantityInput = modal.querySelector('#editItemQuantity');
    const totalInput = modal.querySelector('#editItemTotal');
    
    const updateTotal = () => {
      const price = parseFloat(priceInput.value) || 0;
      const quantity = parseInt(quantityInput.value) || 1;
      totalInput.value = (price * quantity).toFixed(2);
    };
    
    priceInput.addEventListener('input', updateTotal);
    quantityInput.addEventListener('input', updateTotal);
    
    // Save button
    const saveBtn = modal.querySelector('[data-action="save"]');
    saveBtn.addEventListener('click', async () => {
      const updates = {
        ItemName: modal.querySelector('#editItemName').value,
        Description: modal.querySelector('#editItemDescription').value,
        StartTime: modal.querySelector('#editItemStartTime').value,
        EndTime: modal.querySelector('#editItemEndTime').value,
        UnitPrice: parseFloat(modal.querySelector('#editItemPrice').value) || 0,
        Quantity: parseInt(modal.querySelector('#editItemQuantity').value) || 1,
        TotalPrice: parseFloat(modal.querySelector('#editItemTotal').value) || 0
      };
      
      await this.updateItem(itemData.ID, itemData.DayID, updates);
      closeModal();
    });
  },
  
  /**
   * Update item
   */
  async updateItem(itemId, dayId, updates) {
    try {
      await window.API.updateRecord('QuoteItems', itemId, updates);
      
      // Update day total
      await window.Timeline.updateDayTotal(dayId);
      
      // Re-render the day card
      const dayElement = document.querySelector(`[data-day-id="${dayId}"]`);
      if (dayElement) {
        const day = window.Timeline.days.find(d => d.ID === dayId);
        if (day) {
          await window.DayCard.render(dayElement, day);
        }
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  },
  
  /**
   * Delete item
   */
  async deleteItem(itemId, dayId) {
    try {
      if (!confirm('Are you sure you want to delete this item?')) {
        return;
      }
      
      await window.API.deleteRecord('QuoteItems', itemId);
      
      // Update day total
      await window.Timeline.updateDayTotal(dayId);
      
      // Remove from UI
      window.DayCard.removeItem(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ItemCard = ItemCard;
}
