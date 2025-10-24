/**
 * Drag and Drop Functionality
 * Using SortableJS library
 */

const DragDrop = {
    sortableInstances: [],
    
    // Initialize all sortable areas
    initializeAll() {
        this.setupCatalogItems();
        this.setupDayDropZones();
    },
    
    // Setup draggable catalog items
    setupCatalogItems() {
        const catalogContainer = document.getElementById('catalogItems');
        if (!catalogContainer) return;
        
        const sortable = new Sortable(catalogContainer, {
            group: {
                name: 'catalog',
                pull: 'clone',
                put: false
            },
            animation: 150,
            sort: false,
            onEnd: (evt) => {
                // Remove the clone from catalog
                evt.item.remove();
            }
        });
        
        this.sortableInstances.push(sortable);
    },
    
    // Setup drop zones for days
    setupDayDropZones() {
        const dayContainers = document.querySelectorAll('.day-items');
        
        dayContainers.forEach(container => {
            const dayNumber = container.dataset.dayNumber;
            
            const sortable = new Sortable(container, {
                group: {
                    name: 'items',
                    pull: true,
                    put: ['catalog', 'items']
                },
                animation: 150,
                handle: '.item-card',
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                
                onAdd: (evt) => {
                    this.handleItemAdd(evt, dayNumber);
                },
                
                onUpdate: (evt) => {
                    this.handleItemReorder(evt, dayNumber);
                },
                
                onRemove: (evt) => {
                    this.handleItemRemove(evt);
                }
            });
            
            this.sortableInstances.push(sortable);
        });
    },
    
    // Handle item added to day
    handleItemAdd(evt, dayNumber) {
        const itemData = JSON.parse(evt.item.dataset.itemData || '{}');
        console.log('Item added to day', dayNumber, itemData);
        
        // Update item with day info
        itemData.dayNumber = dayNumber;
        
        // Add to quote items
        if (window.QuoteBuilder) {
            window.QuoteBuilder.quoteItems.push(itemData);
            window.QuoteBuilder.updateSummary();
        }
    },
    
    // Handle item reordered within day
    handleItemReorder(evt, dayNumber) {
        console.log('Item reordered in day', dayNumber);
        // Update sort orders
    },
    
    // Handle item removed from day
    handleItemRemove(evt) {
        console.log('Item removed');
        if (window.QuoteBuilder) {
            window.QuoteBuilder.updateSummary();
        }
    },
    
    // Destroy all sortable instances
    destroyAll() {
        this.sortableInstances.forEach(instance => instance.destroy());
        this.sortableInstances = [];
    },
    
    // Refresh after DOM changes
    refresh() {
        this.destroyAll();
        this.initializeAll();
    }
};

// Export
window.DragDrop = DragDrop;
