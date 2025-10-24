/**
 * Helper Functions
 * Utility functies voor de Quote Builder
 */

const Helpers = {
    // Format currency to Euro
    formatCurrency(amount) {
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    },
    
    // Format date to Dutch format
    formatDate(date, format = 'long') {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        
        if (format === 'short') {
            return d.toLocaleDateString('nl-NL', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }
        
        return d.toLocaleDateString('nl-NL', { 
            weekday: 'short',
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    },
    
    // Generate quote number
    generateQuoteNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `Q${year}${month}-${random}`;
    },
    
    // Calculate days between dates
    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Debounce function for search
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Get icon for item type
    getItemIcon(type) {
        const icons = {
            accommodation: '🏨',
            transfer: '🚗',
            excursion: '🎫',
            package: '📦',
            other: '⭐'
        };
        return icons[type] || icons.other;
    },
    
    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// Export
window.Helpers = Helpers;
