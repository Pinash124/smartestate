# Smart Estate - Quick Start Guide

## 🎯 5-Minute Setup

### 1. Open Test Data Page
```
http://localhost:8000/pages/test-data.html
```
Click "Tạo dữ liệu kiểm thử" to create sample listings and accounts.

### 2. Login & Explore
Use one of these accounts:

**Admin Dashboard**
- Email: `admin@smartestate.vn`
- Password: `admin123`
- Go to: http://localhost:8000/pages/admin/moderation.html

**Browse Listings**
- Go to: http://localhost:8000/pages/listings.html
- No login required!

**Create Listing (as Seller)**
- Email: `seller@smartestate.vn`
- Password: `seller123`
- Go to: http://localhost:8000/pages/seller/create-listing.html

**Get Recommendations (as User)**
- Email: `user@smartestate.vn`
- Password: `user123`
- Go to: http://localhost:8000/pages/user/ai-recommend.html

---

## 🗂️ Key Pages Map

### For Guests (No Login)
| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Search & featured listings |
| Browse Listings | `/pages/listings.html` | Search & filter |
| Listing Detail | `/pages/listing-detail.html?id=1` | View full details, reveal phone |
| Login | `/pages/auth/login.html` | Sign in |
| Signup | `/pages/auth/signup.html` | Create account |

### For Users (Logged In)
| Page | URL | Purpose |
|------|-----|---------|
| AI Recommendations | `/pages/user/ai-recommend.html` | Get personalized suggestions |
| Profile | `/pages/user/profile.html` | Edit profile |
| Report Listing | `/pages/report-listing.html?listing_id=1` | Flag inappropriate listings |

### For Sellers
| Page | URL | Purpose |
|------|-----|---------|
| Create Listing | `/pages/seller/create-listing.html` | Post new property |
| My Listings | `/pages/seller/my-listings.html` | Manage listings |
| Profile | `/pages/seller/profile.html` | Edit profile |

### For Brokers
| Page | URL | Purpose |
|------|-----|---------|
| Takeover Requests | `/pages/broker/requests.html` | Accept/reject requests |
| Managed Listings | `/pages/broker/my-listings.html` | View assigned listings |

### For Admins
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/pages/admin/dashboard.html` | Stats & overview |
| Moderation | `/pages/admin/moderation.html` | Review flagged listings |
| Revenue | `/pages/admin/revenue.html` | Track payments & income |

---

## 🔍 Common Tasks

### Create a Test Listing
1. Login as seller: `seller@smartestate.vn` / `seller123`
2. Go to `/pages/seller/create-listing.html`
3. Fill the form:
   - Title: "Căn hộ 2 phòng tại Quận 1"
   - Type: Apartment
   - Transaction: Buy
   - Price: "3 tỷ"
   - City: Hồ Chí Minh
   - Area: 85 m²
   - Bedrooms: 2
   - Description: "Modern apartment with gym and pool"
   - Images: Add 2-3 images (URLs or drag files)
4. Submit → See AI moderation result

### Review Moderation Queue (as Admin)
1. Login as admin: `admin@smartestate.vn` / `admin123`
2. Go to `/pages/admin/moderation.html`
3. Filter by "NEED_REVIEW" status
4. Click on a listing to view details in modal
5. Click "Phê duyệt" (Approve) or "Từ chối" (Reject)

### Get AI Recommendations (as User)
1. Login as user: `user@smartestate.vn` / `user123`
2. Go to `/pages/user/ai-recommend.html`
3. Fill preferences:
   - Transaction: Buy
   - Property Types: Apartment, House
   - Cities: Hồ Chí Minh
   - Price Range: "1-5 tỷ"
   - Min Area: 50
   - Min Bedrooms: 2
4. Click "Submit" → See top 10 matches with scores

### Request Broker Help (as Seller)
1. Create a listing (see above)
2. Once approved, go to listing detail
3. Look for "Request broker takeover" button
4. Broker receives request at `/pages/broker/requests.html`
5. Broker clicks "Chấp nhận" → Pays 500k fee → Takes over

### Track Revenue (as Admin)
1. Login as admin
2. Go to `/pages/admin/revenue.html`
3. Set date range (defaults to last 30 days)
4. See breakdown by payment type
5. Click "Xuất CSV" to export

---

## 🧪 Testing Workflows

### Test AI Moderation
1. Create listing with:
   - **Title < 10 chars** → Will get flagged ⚠️
   - **No description** → Will get flagged ⚠️
   - **Very high price** → May auto-reject ⚠️
   - **All details filled** → Auto-approved ✓
2. Submit and check moderation result in alert

### Test Phone Reveal
1. Create listing as seller
2. Browse to it as guest (logout first)
3. See "Login to reveal phone" button
4. Login as user
5. Reload page → Phone number now shows
6. Click "Copy" to copy phone

### Test Search Filters
1. Go to `/pages/listings.html`
2. Try filters:
   - Filter by type: "Apartment" → Shows only apartments
   - Filter by city: "Hồ Chí Minh" → Shows HCM listings
   - Price range: "2-4 tỷ" → Shows listings in range
   - Min area: 100 → Shows 100m² and larger
3. Reset filters → Shows all listings

### Test Broker Workflow
1. Create listing as seller
2. Wait for approval (admin to approve or auto-approve)
3. Click "Request broker takeover"
4. Login as broker: `broker@smartestate.vn` / `broker123`
5. Go to `/pages/broker/requests.html`
6. Click "Chấp nhận" → Payment modal appears
7. Check agreement box → Click "Chấp nhận & Thanh toán"
8. Go to `/pages/broker/my-listings.html` → See listing now assigned

---

## 💻 Development Tips

### Clear All Data & Reset
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Check Current User
```javascript
// In browser console
authService.currentUser
```

### View All Listings
```javascript
// In browser console
JSON.parse(localStorage.getItem('listings'))
```

### View All Payments
```javascript
// In browser console
JSON.parse(localStorage.getItem('payments'))
```

### Check User Permissions
```javascript
// In browser console
authService.hasPermission('create_listing')
authService.hasRole('admin')
```

### Test AI Scoring
```javascript
// In browser console
const recommendations = AIRecommendationService.getRecommendations(4, 10);
recommendations.forEach(r => console.log(r.score, r.listing.title));
```

---

## 📝 Code Organization

### Authentication Flow
File: `src/js/auth.js`
- `AuthService` class handles all auth logic
- `ROLES` constant defines role names
- `PERMISSIONS` object defines what each role can do
- `requireAuth()` function protects pages

### Listing Management
File: `src/js/listing-service.js`
- `ListingService` class for CRUD operations
- `AIModerationService` class for content analysis
- `PaymentService` class for transaction tracking
- `LISTING_STATUS` and `MODERATION_STATUS` constants

### AI Recommendations
File: `src/js/recommendation-service.js`
- `AIRecommendationService` class implements scoring
- `scoreListingForUser()` method calculates match %
- `getScoreReasons()` method returns reason badges

### Dynamic Navigation
File: `src/js/navbar.js`
- `NavbarManager` class updates navbar based on user role
- `renderGuestMenu()`, `renderUserMenu()`, etc.
- Called automatically on page load

---

## 🎨 Customization Examples

### Change Moderation Threshold
Edit `src/js/listing-service.js`:
```javascript
// Line ~60
const LOW_RISK = 20;   // Change to 25
const HIGH_RISK = 30;  // Change to 35
```

### Change Broker Takeover Fee
Edit `src/js/listing-service.js`:
```javascript
// Line ~150
const BROKER_TAKEOVER_FEE = 500000;  // Change to 1000000
```

### Add New Permission
Edit `src/js/auth.js`:
```javascript
// Line ~20
const PERMISSIONS = {
    seller: ['create_listing', 'manage_listings', 'request_broker']  // Add here
};
```

### Add New Property Type
Edit listing form HTML:
```html
<!-- In pages/seller/create-listing.html -->
<select id="type">
    <option value="apartment">Căn hộ</option>
    <option value="house">Nhà riêng</option>
    <option value="land">Đất nền</option>
    <option value="office">Văn phòng</option>
    <option value="townhouse">Nhà liên kế</option>  <!-- New -->
</select>
```

---

## 🐛 Debugging

### Check Console for Errors
Press F12 → Console tab → Look for red errors

### Enable Logging
Add to `src/js/listing-service.js`:
```javascript
console.log('Creating listing:', listing);
const moderation = AIModerationService.runModeration(listing);
console.log('Moderation result:', moderation);
```

### Test in Incognito Mode
Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
- Tests guest experience
- Separate from main browser data

---

## 📞 Getting Help

1. **Read the code** - Services are well-commented
2. **Check `RBAC-DOCUMENTATION.md`** - API reference
3. **Search GitHub issues** - Common problems
4. **Check console** - Error messages usually explain issues

---

## ✅ Feature Checklist

### MVP Complete (v1.0)
- ✅ Homepage with search
- ✅ Authentication (login/signup)
- ✅ Role-based access control (5 roles)
- ✅ Create/edit/delete listings
- ✅ AI moderation (auto-approve/reject/review)
- ✅ Admin moderation dashboard
- ✅ Broker takeover workflow
- ✅ Payment tracking
- ✅ AI recommendations
- ✅ Browse & search listings
- ✅ Listing detail with phone reveal
- ✅ User reporting system
- ✅ Revenue dashboard
- ✅ CSV export

### Next Phase (v1.1)
- ⏳ Backend API (Node.js/Express)
- ⏳ Database (MongoDB/PostgreSQL)
- ⏳ Real-time messaging
- ⏳ Saved listings feature
- ⏳ Email notifications
- ⏳ Payment gateway (Stripe/MoMo)
- ⏳ Image optimization
- ⏳ Advanced analytics

---

**Happy coding! 🚀**
