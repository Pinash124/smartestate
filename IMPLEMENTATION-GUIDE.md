# Smart Estate - Real Estate Marketplace Platform

A comprehensive real estate marketplace platform with AI-powered moderation, role-based access control, and advanced listing management. Built with vanilla JavaScript, TailwindCSS, and localStorage (with API-ready architecture).

## 🌟 Key Features

### 1. **Role-Based Access Control (RBAC)**
- **Guest**: Browse/search approved listings, register/login
- **User**: Browse/search, AI recommendations, report listings, messaging
- **Seller**: Create/manage listings, request broker help, chat with buyers
- **Broker**: Accept/reject takeover requests, manage assigned listings
- **Admin**: Moderate listings, view revenue, manage content reports

### 2. **AI-Powered Moderation System**
- Automatic content analysis (title, description, images, price)
- Risk scoring algorithm (0-100 scale)
- Auto-decision: LOW_RISK (score <20) → Auto-approved
- AUTO_REJECTED for HIGH_RISK (score >30)
- Manual review queue for MEDIUM_RISK (20-30)
- Flagging and suggestions system

### 3. **Listing Management**
- Create listings with title, price, location, images, description
- Support for multiple property types: Apartment, House, Land, Office
- Transaction types: Buy/Sell or Rent
- Listing lifecycle: DRAFT → PENDING_MODERATION → APPROVED → ACTIVE → DONE/CANCELLED
- Broker takeover workflow with payment integration
- User reporting system for inappropriate listings

### 4. **AI Recommendation Engine**
- Multi-factor scoring algorithm
- Weights: Location (30%), Type (20%), Price (20%), Transaction (15%), Area (10%), Bedrooms (5%)
- Personalized recommendations based on user preferences
- Match percentage and reason badges for each listing

### 5. **Payment & Revenue Tracking**
- Payment types: POST_LISTING, PUSH_LISTING, BROKER_MEMBERSHIP, TAKEOVER_FEE
- Admin revenue dashboard with date range filtering
- CSV export functionality
- Payment status tracking (PAID, PENDING, FAILED)

### 6. **Advanced Search & Filtering**
- Filter by: Transaction type, property type, city, price range, area, bedrooms
- Responsive grid display
- Real-time result count

### 7. **User Features**
- Reveal phone number after login
- AI-powered recommendations
- Profile management
- Saved listings (ready for implementation)
- Messaging system (schema ready, UI in progress)

## 📁 Project Structure

```
smartestate/
├── index.html                      # Homepage with search
├── pages/
│   ├── auth/
│   │   ├── login.html             # Login page
│   │   └── signup.html            # Registration page
│   ├── listing-detail.html        # Single listing view with phone reveal
│   ├── listings.html              # Browse & search listings
│   ├── report-listing.html        # Report inappropriate listing
│   ├── test-data.html             # Create test data
│   ├── user/
│   │   ├── profile.html           # User profile edit
│   │   └── ai-recommend.html      # AI recommendations
│   ├── seller/
│   │   ├── create-listing.html    # Create new listing
│   │   ├── my-listings.html       # Manage listings
│   │   └── profile.html           # Seller profile
│   ├── broker/
│   │   ├── requests.html          # Takeover requests
│   │   └── my-listings.html       # Manage assigned listings
│   └── admin/
│       ├── dashboard.html         # Stats & moderation queue
│       ├── moderation.html        # Content review interface
│       └── revenue.html           # Revenue dashboard
├── src/
│   ├── js/
│   │   ├── auth.js                # Authentication & RBAC
│   │   ├── listing-service.js     # Listing CRUD & AI moderation
│   │   ├── recommendation-service.js # AI recommendations
│   │   └── navbar.js              # Dynamic navigation
│   └── styles/
│       └── input.css              # TailwindCSS utilities
├── README.md                       # This file
├── RBAC-DOCUMENTATION.md          # Detailed API reference
├── package.json                   # Dependencies
└── tailwind.config.js             # TailwindCSS config

```

## 🚀 Getting Started

### Setup
```bash
# 1. Clone repository
git clone https://github.com/yourusername/smartestate
cd smartestate

# 2. Install dependencies (for TailwindCSS build - optional)
npm install

# 3. Open in browser
open index.html
# or
python -m http.server 8000
# Then visit http://localhost:8000
```

### Create Test Data
1. Open `/pages/test-data.html`
2. Click "Tạo dữ liệu kiểm thử" (Create test data)
3. Use test accounts to explore:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartestate.vn | admin123 |
| Seller | seller@smartestate.vn | seller123 |
| Broker | broker@smartestate.vn | broker123 |
| User | user@smartestate.vn | user123 |

## 📋 User Workflows

### Guest → Browse Listings
1. Visit `pages/listings.html`
2. Use filters to search by type, city, price, area, bedrooms
3. Click listing to view details
4. "Login to reveal phone" button prompts authentication

### User → Get AI Recommendations
1. Login as user
2. Go to "AI Recommend" in navbar
3. Submit preference form (transaction type, property types, cities, price range, area, bedrooms)
4. System displays top 10 recommendations with match % and reasons

### Seller → Create & Sell Listing
1. Login as seller
2. Go to "Đăng tin mới"
3. Fill form with title, type, price, location, images, description
4. Submit → AI moderation runs automatically
5. View result: AUTO_APPROVED, NEED_REVIEW, or AUTO_REJECTED
6. View in "Tin của tôi" dashboard

### Seller → Request Broker Help
1. From listing detail page → "Request broker takeover"
2. Broker receives request in `/pages/broker/requests.html`
3. Broker clicks "Chấp nhận" → Payment modal appears
4. Broker pays takeover fee ($500k) → becomes responsible for listing
5. Listing transfers to broker, seller sees "Broker assigned"

### Admin → Moderate Listings
1. Login as admin
2. Go to "Duyệt tin" (Moderation)
3. Filter by risk level or moderation status
4. Review listing in modal
5. Click "Phê duyệt" (approve) or "Từ chối" (reject)
6. Listing status updates and becomes active/rejected

### Admin → Track Revenue
1. Go to "Dashboard" → "Revenue"
2. Set date range (default: last 30 days)
3. View: Total revenue, breakdown by payment type
4. Export to CSV: Click "Xuất CSV"

## 🔐 Authentication & Permissions

### Login System
```javascript
// Login
authService.login('seller@smartestate.vn', 'seller123');
// User saved to localStorage, auto-load on page refresh

// Logout
authService.logout();

// Check authentication
if (authService.isAuthenticated()) { /* ... */ }
```

### Permission Checking
```javascript
// Check if user has role
if (authService.hasRole('seller')) { /* ... */ }

// Check if user has permission
if (authService.hasPermission('create_listing')) { /* ... */ }

// Protect route
requireAuth('seller', 'create_listing');  // Redirect to login if denied
```

## 🤖 AI Moderation System

### Moderation Flow
```
CREATE LISTING
    ↓
AIModerationService.runModeration(listing)
    ├─ Title check: 10+ characters ✓
    ├─ Description: 50+ characters ✓
    ├─ Images: min 1 image ✓
    ├─ Price: realistic range ✓
    ├─ Forbidden words check
    ├─ Duplicate detection
    └─ Risk Score calculation
    ↓
DECISION:
├─ Score < 20  → AUTO_APPROVED ✓
├─ Score 20-30 → NEED_REVIEW (admin queue)
└─ Score > 30  → AUTO_REJECTED ✗
```

### Moderation Constants
```javascript
LISTING_STATUS = {
    DRAFT: 'draft',
    PENDING_MODERATION: 'pending_moderation',
    APPROVED: 'approved',
    ACTIVE: 'active',
    DONE: 'done',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected'
}

MODERATION_STATUS = {
    PENDING: 'pending',
    NEED_REVIEW: 'need_review',
    AUTO_APPROVED: 'auto_approved',
    AUTO_REJECTED: 'auto_rejected',
    MANUALLY_APPROVED: 'manually_approved',
    MANUALLY_REJECTED: 'manually_rejected'
}
```

## 💰 Payment System

### Payment Types
```javascript
PAYMENT_TYPE = {
    POST_LISTING: 'post_listing',      // 50k
    PUSH_LISTING: 'push_listing',      // 100k
    BROKER_MEMBERSHIP: 'broker_fee',   // 1M/month
    TAKEOVER_FEE: 'takeover_fee'       // 500k per listing
}
```

### Recording Payment
```javascript
PaymentService.recordPayment({
    type: PAYMENT_TYPE.POST_LISTING,
    amount: 50000,
    listingId: 123,
    status: 'PAID',
    date: new Date(),
    description: 'Fee for listing creation'
});

// Get revenue by date range
const revenue = PaymentService.getRevenueByDateRange(startDate, endDate);
```

## 🎨 AI Recommendation Algorithm

### Scoring System (0-100 scale)
```javascript
scoreListingForUser(listing, preferences) {
    let score = 0;
    
    // Location (30 points max)
    if (city match) score += 30;      // +30
    if (district match) score += 25;   // +25
    
    // Property Type (20 points)
    if (type match) score += 20;
    
    // Transaction Type (15 points)
    if (transaction match) score += 15;
    
    // Price (20 points) - exact or 10% tolerance
    if (price in range) score += 20;
    
    // Area (10 points)
    if (area >= min) score += 10;
    
    // Bedrooms (5 points)
    if (bedrooms >= min) score += 5;
    
    // Quality Bonus (10 points)
    if (3+ images) score += 5;
    if (100+ char description) score += 5;
    
    return Math.min(score, 100);
}
```

### Example Output
```javascript
{
    listing: { id: 1, title: "Căn hộ 2 phòng..." },
    score: 85,  // Match percentage
    reasons: [
        { icon: '📍', text: 'Đúng thành phố Hồ Chí Minh (+30)' },
        { icon: '🏠', text: 'Loại căn hộ phù hợp (+20)' },
        { icon: '💰', text: 'Giá trong khoảng 2-5 tỷ (+20)' },
        { icon: '📸', text: 'Có 3 ảnh chất lượng (+5)' }
    ]
}
```

## 🔌 API Integration Ready

### Backend Architecture
The system is designed to work with a Node.js/Express backend. All localStorage calls are abstracted in service classes, making migration simple:

**Current (localStorage):**
```javascript
const listings = JSON.parse(localStorage.getItem('listings') || '[]');
```

**Future (REST API):**
```javascript
const listings = await fetch('/api/listings').then(r => r.json());
```

### API Endpoints (Planned)
```
Authentication:
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/logout
GET    /api/auth/me

Listings:
GET    /api/listings
GET    /api/listings/:id
POST   /api/listings
PUT    /api/listings/:id
DELETE /api/listings/:id

Moderation:
GET    /api/admin/moderation/pending
POST   /api/admin/moderation/:id/approve
POST   /api/admin/moderation/:id/reject

Payments:
GET    /api/admin/revenue?startDate=...&endDate=...
POST   /api/payments

Broker:
GET    /api/broker/requests
POST   /api/broker/requests/:id/accept
POST   /api/broker/requests/:id/reject
```

## 📊 Database Schema (Ready for Backend)

### Users
```javascript
{
    id: number,
    name: string,
    email: string (unique),
    password: string (hashed),
    role: 'guest' | 'user' | 'seller' | 'broker' | 'admin',
    profile: {
        avatar: string,
        phone: string,
        address: string
    },
    createdAt: date,
    updatedAt: date
}
```

### Listings
```javascript
{
    id: number,
    sellerId: number,
    sellerName: string,
    sellerPhone: string,
    responsibleBrokerId: number | null,
    title: string,
    type: 'apartment' | 'house' | 'land' | 'office',
    transaction: 'buy' | 'rent',
    price: string,
    area: number,
    bedrooms: number,
    bathrooms: number,
    city: string,
    district: string,
    address: string,
    description: string,
    images: string[],
    status: LISTING_STATUS,
    moderation: {
        status: MODERATION_STATUS,
        decision: 'APPROVED' | 'REJECTED' | 'NEED_REVIEW',
        riskScore: number (0-100),
        flags: string[],
        suggestions: string[],
        reviewedBy: number (admin id),
        reviewedAt: date
    },
    brokerRequests: [{
        brokerId: number,
        status: 'pending' | 'accepted' | 'rejected',
        requestedAt: date,
        respondedAt: date,
        sellerName: string
    }],
    reports: [{
        userId: number,
        reason: string,
        note: string,
        reportedAt: date
    }],
    createdAt: date,
    approvedAt: date | null,
    completedAt: date | null
}
```

### Messages
```javascript
{
    id: number,
    senderId: number,
    recipientId: number,
    listingId: number,
    content: string,
    isRead: boolean,
    createdAt: date
}
```

### Payments
```javascript
{
    id: number,
    type: PAYMENT_TYPE,
    amount: number,
    listingId: number,
    userId: number,
    status: 'PAID' | 'PENDING' | 'FAILED',
    date: date,
    description: string
}
```

## 🛠️ Customization

### Colors
Edit `tailwind.config.js`:
```javascript
extend: {
    colors: {
        primary: '#fbbf24',  // Amber-400
        'primary-dark': '#f59e0b'  // Amber-600
    }
}
```

### Moderation Rules
Edit `src/js/listing-service.js` → `AIModerationService.runModeration()`:
```javascript
// Add forbidden words
const FORBIDDEN_WORDS = ['spam', 'fake', ...];

// Adjust risk thresholds
const LOW_RISK = 20;      // Score below this = auto-approve
const HIGH_RISK = 30;     // Score above this = auto-reject
```

### Payment Amounts
Edit `src/js/listing-service.js`:
```javascript
const LISTING_POST_FEE = 50000;        // Posting fee
const LISTING_PUSH_FEE = 100000;       // Push/boost fee
const BROKER_TAKEOVER_FEE = 500000;    // Broker takeover fee
```

## 📱 Responsive Design
- Mobile-first approach
- TailwindCSS breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Tested on: iPhone, iPad, Desktop

## ♿ Accessibility
- Semantic HTML5
- ARIA labels (ready)
- Keyboard navigation (ready)
- Color contrast ratios meet WCAG AA

## 🐛 Known Limitations

### Current (MVP)
- Data stored in localStorage (5-10MB limit)
- No real email notifications
- No actual payment processing (Stripe/MoMo integration)
- No virtual tour support
- No real-time messaging (polling ready)

### Next Phase
- Backend API (Node.js/Express)
- Database (MongoDB/PostgreSQL)
- Email notifications
- Payment gateway integration
- Real-time messaging (WebSocket)
- Image optimization & CDN

## 📚 Additional Documentation

See `RBAC-DOCUMENTATION.md` for:
- Detailed role matrix
- Permission definitions
- Complete API specification
- Database schema diagrams
- Authentication flows
- Webhook events

## 🤝 Contributing

Development workflow:
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes
3. Test with sample data
4. Commit: `git commit -m "feat: add feature"`
5. Push: `git push origin feature/feature-name`
6. Create pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

- Issues: GitHub Issues
- Email: support@smartestate.vn
- Documentation: `RBAC-DOCUMENTATION.md`

---

**Version:** 1.0.0 MVP  
**Last Updated:** January 2024  
**Status:** Active Development
