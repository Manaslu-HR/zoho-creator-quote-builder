/**
 * Zoho Creator API Integration
 * Handles all communication with Zoho Creator backend
 */

const ZohoAPI = {
    // Zoho Creator API endpoint
    baseURL: 'https://creator.zoho.eu/api/v2',
    
    // Save quote to Zoho Creator
    async saveQuote(quoteData, isDraft = false) {
        try {
            const data = {
                data: {
                    Client: quoteData.clientId,
                    StartDate: quoteData.startDate,
                    EndDate: quoteData.endDate,
                    TotalDays: quoteData.totalDays,
                    TotalAmount: quoteData.totalAmount,
                    Status: isDraft ? 'Draft' : 'Sent'
                }
            };
            
            // Use Zoho Creator SDK
            const response = await ZOHO.CREATOR.API.addRecord({
                appName: 'travel-quote-builder',
                formName: 'Quote',
                data: data
            });
            
            return response;
        } catch (error) {
            console.error('Error saving quote:', error);
            throw error;
        }
    },
    
    // Load existing quote
    async loadQuote(quoteId) {
        try {
            const response = await ZOHO.CREATOR.API.getRecordById({
                appName: 'travel-quote-builder',
                formName: 'Quote',
                id: quoteId
            });
            return response.data;
        } catch (error) {
            console.error('Error loading quote:', error);
            throw error;
        }
    },
    
    // Get catalog items
    async getCatalogItems(type = 'all') {
        // Implementation for loading catalog from Zoho Creator
        return [];
    }
};

// Export
window.API = ZohoAPI;
