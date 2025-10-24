# Travel Quote Builder - Project Structure

Volledige projectstructuur volgens QuoteBuilder.pdf specificaties.

## ✅ Reeds aangemaakt:

### Root bestanden:
- `widget.html` - Complete responsive UI structuur
- `widget.css` - Core styling met CSS variables (basis versie, zie attached_file:2 voor volledige CSS)
- `widget.js` - Main controller met event handling
- `README.md` - Project documentatie

### Utils map (/utils):
- `api.js` - Zoho Creator API integratie

## 📝 Nog aan te maken bestanden:

### Utils map (/utils):
```javascript
// helpers.js - Helper functies
- formatCurrency()
- formatDate()
- generateQuoteNumber()
- calculateDaysBetween()
- debounce()

// dragdrop.js - Drag & drop met SortableJS
- initializeSortable()
- setupDraggableItems()
- handleDrop()
```

### Components map (/components):
```javascript
// sidebar.js - Sidebar functionaliteit
- renderCatalogItems()
- filterItems()
- handleCategorySwitch()

// timeline.js - Timeline beheer
- generateDays()
- addDay()
- removeDay()
- updateDayTotal()

// day-card.js - Dag card component
- renderDayCard()
- updateDayInfo()
- setupDropZone()

// item-card.js - Item card component  
- renderItemCard()
- editItem()
- deleteItem()
- calculateItemTotal()

// search-modal.js - Zoek modal
- openSearchModal()
- searchCatalog()

// api-search.js - HotelBeds API zoeken
- searchHotels()
- parseHotelResults()
- addHotelToQuote()
```

### Configuratie bestanden:
```json
// package.json
{
  "name": "zoho-creator-quote-builder",
  "version": "1.0.0",
  "description": "Travel Quote Builder Widget voor Zoho Creator",
  "dependencies": {
    "sortablejs": "^1.15.0"
  }
}

// plugin-manifest.json - Zoho Creator Widget Manifest
{
  "widgetName": "QuoteBuilder",
  "version": "1.0",
  "author": "DMC",
  "description": "Quote Builder voor reisprogramma's",
  "permissions": ["data", "api"]
}
```

## 📂 Database Schema (Zoho Creator):

Volgens PDF specificatie:

### 1. Quote (Hoofdformulier)
- QuoteNumber (autonumber)
- Client (Lookup → Clients)
- StartDate (Date)
- EndDate (Date)  
- TotalDays (Number)
- TotalAmount (Decimal)
- Status (Dropdown: Draft/Sent/Confirmed/Cancelled)

### 2. QuoteDays
- Quote (Lookup → Quote)
- DayNumber (Number)
- DayDate (Date)
- DayTitle (Text)
- DayNotes (Multi-line)
- DayTotal (Decimal)

### 3. QuoteItems
- Quote (Lookup → Quote)
- DayNumber (Number)
- ItemType (Dropdown: Accommodation/Transfer/Excursion/Package/Other)
- ItemSource (Dropdown: API/Manual/Form)
- ItemName (Text)
- Description (Multi-line)
- StartTime (Time)
- EndTime (Time)
- UnitPrice (Decimal)
- TotalPrice (Decimal)
- Supplier (Text)
- Status (Dropdown)

### 4. Accommodations (Catalog)
- Name, Type, Location, StarRating, StandardRate, Description

## 🔌 API Integraties:

### HotelBeds API:
- Endpoint: https://developer.hotelbeds.com/documentation/hotels  
- Functionaliteit: Hotels, transfers, excursies zoeken en toevoegen

### Zoho Creator API:
- SDK: ZOHO.CREATOR.API
- Functies: addRecord, getRecordById, updateRecord

## 🎨 Styling:

Volledige CSS (6000+ regels) beschikbaar in `widget.css` attachment.
Bevat: Header, Sidebar, Timeline, Day Cards, Item Cards, Modals, Forms, Responsive design

## 🚀 Volgende Stappen:

1. Volledige CSS uit attached_file:2 overnemen in widget.css
2. Component modules implementeren (sidebar, timeline, day-card, item-card)
3. Utility functies uitbreiden (helpers, dragdrop)
4. HotelBeds API integratie afronden
5. Zoho Creator database forms aanmaken
6. Widget testen en debuggen
7. Deployment naar Zoho Creator
