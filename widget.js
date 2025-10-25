/**
 * TRAVEL QUOTE BUILDER - Main Widget Controller
 * Zoho Creator Widget voor DMC reisprogramma samenstelling
 */

// Global state
const QuoteBuilder = {
    currentQuote: null,
    quoteDays: [],
    quoteItems: [],
    catalogItems: [],
    currentFilter: 'all',
    isDirty: false,
    
    // Initialize the widget
    init() {
        console.log('Quote Builder initializing...');
        this.bindEvents();
        this.checkForExistingQuote();
        this.loadCatalogItems();
    },
    
    // Check if opening existing quote (via URL param)
    checkForExistingQuote() {
        const urlParams = new URLSearchParams(window.location.search);
        const quoteId = urlParams.get('quoteId');
        
        if (quoteId) {
            this.loadExistingQuote(quoteId);
        } else {
            this.showInitialModal();
        }
    },
    
    // Show initial quote setup modal
    showInitialModal() {
        const modal = document.getElementById('initialModal');
        modal.classList.add('show');
    },
    
    // Bind all event listeners
    bindEvents() {
        // Mobile menu toggle
        document.getElementById('mobileMenuToggle')?.addEventListener('click', this.toggleMobileMenu);
        document.getElementById('sidebarOverlay')?.addEventListener('click', this.toggleMobileMenu);
        
        // Header buttons
        document.getElementById('btnSave')?.addEventListener('click', () => this.saveQuote());
        document.getElementById('btnDraft')?.addEventListener('click', () => this.saveQuote(true));
        
        // Initial modal
        document.getElementById('clientType')?.addEventListener('change', this.handleClientTypeChange);
        document.getElementById('btnNextInitial')?.addEventListener('click', () => this.handleInitialNext());
        document.getElementById('btnCancelInitial')?.addEventListener('click', () => this.closeModal('initialModal'));
        
        // Date inputs
        document.getElementById('startDate')?.addEventListener('change', () => this.updateEndDate());
        document.getElementById('totalDays')?.addEventListener('change', () => this.updateEndDate());
        document.getElementById('btnGenerateDays')?.addEventListener('click', () => this.generateDays());
        
        // Category switch
        document.getElementById('categorySelect')?.addEventListener('change', this.handleCategoryChange.bind(this));
        
        // Search and filters
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.filterCatalog(e.target.value));
//         document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.type));
        });
        
        // API search
        document.getElementById('btnApiSearch')?.addEventListener('click', () => this.searchHotelBeds());
    },
    
    // Toggle mobile menu
    toggleMobileMenu() {
        const sidebar = document.getElementById('builderSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('show');
    },
    
    // Save quote to Zoho Creator
    async saveQuote(isDraft = false) {
        // Implementation in utils/api.js
        console.log('Saving quote...', isDraft ? 'as draft' : 'final');
    },
    
    // Generate days based on date range
    generateDays() {
        // Implementation in components/timeline.js
        console.log('Generating days...');
    },
    
    // Update summary totals
    updateSummary() {
        // Calculate and display totals
        const total = this.quoteItems.reduce((sum, item) => sum + (item.price || 0), 0);
        document.getElementById('summaryTotal').textContent = `€ ${total.toFixed(2)}`;
        document.getElementById('summaryDays').textContent = this.quoteDays.length;
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.className = `toast ${type} show`;
        document.getElementById('toastMessage').textContent = message;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    QuoteBuilder.init();
});
