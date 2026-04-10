# 🚀 CartIQ Application - Complete Testing Guide

## ✅ Current Status

**Backend:** Running on `http://localhost:5000` ✓  
**Frontend:** Running on `http://localhost:3000` ✓  
**Database:** MongoDB Connected ✓

---

## 👥 Test Accounts

### Customer Account
- **Email:** `bob@test.com`
- **Password:** `password123`
- **Role:** Customer

### Seller Account
- **Email:** `seller@test.com`
- **Password:** `seller123`
- **Role:** Seller/Vendor

---

## 🎯 Features to Test

### 1. **Authentication & User Management**
- ✅ Login with customer account
- ✅ Login with seller account
- ✅ Register new accounts
- ✅ Logout functionality

### 2. **Shop & Search**
- ✅ Browse all products with enhanced UI
- ✅ Search products (text now visible and readable)
- ✅ Filter by price range
- ✅ Filter by category
- ✅ Sort by: Newest, Price (Low-High), Price (High-Low), Rating
- ✅ Pagination

### 3. **Vendor Features** (For Sellers)

#### Access Vendor Dashboard:
1. Login with `seller@test.com`
2. Go to: `http://localhost:3000/vendor/dashboard`
3. See:
   - 📊 Total Products Count
   - 💰 Total Sales Amount
   - 📦 Total Orders
   - ⭐ Average Rating

#### Add New Products:
1. From Dashboard, click "➕ Add New Product"
2. Or go directly to: `http://localhost:3000/vendor/products/add`
3. Fill in:
   - Product Title
   - Description
   - Price (₹)
   - Stock Quantity
   - Category
   - Image URLs (comma-separated)
4. Click "✅ Add Product"

### 4. **AI Chat**
- Go to: `http://localhost:3000/ai`
- Ask AI assistant questions about products, recommendations, etc.
- Features:
  - Smart recommendations
  - Product information
  - Shopping assistance

### 5. **Other Features**
- ✅ Product Details Page
- ✅ Wishlist
- ✅ Shopping Cart
- ✅ Orders
- ✅ Support Tickets
- ✅ Product Reviews
- ✅ User Profile

---

## 🎨 UI Improvements

### ✨ What's New:

1. **Enhanced Visibility**
   - Input fields now have dark text on white background
   - Placeholders are clearly visible
   - Better contrast across all pages

2. **Beautiful Animations**
   - Fade-in animations on page load
   - Slide-in effects on elements
   - Hover animations on buttons and cards
   - Floating effects on promotional items
   - Pulse glow effects on important CTAs

3. **Promotional Ads**
   - Moving promotional banners at the top of homepage
   - Rotating ads with discount codes
   - Eye-catching design

4. **Improved Design**
   - Gradient backgrounds
   - Better typography
   - Card-based layout
   - Modern color scheme
   - Emoji indicators for visual hierarchy

---

## 🛠️ Testing Workflow

### Quick Start Test (10 mins):

```
1. Open http://localhost:3000
2. Click "Sign up" → Create account with your details
3. Use "🛒 Shop Now" to browse products
4. Try searching something in the search bar
5. Login as seller (seller@test.com / seller123)
6. Go to /vendor/dashboard
7. Add a new product
8. Logout and login as customer to see your product
```

### Comprehensive Test (30 mins):

```
1. Authentication
   - Register new account
   - Login with multiple accounts
   - Logout

2. Shopping
   - Browse products
   - Search with filters
   - Add items to cart
   - Checkout

3. Vendor Management
   - Seller login
   - View dashboard stats
   - Add multiple products
   - View product list

4. AI Features
   - Use AI chat for recommendations
   - Ask product questions

5. Other Features
   - Leave product reviews
   - Add to wishlist
   - Submit support tickets
```

---

## 📝 Test Cases Checklist

### Authentication
- [ ] User can register with email and password
- [ ] User can login with valid credentials
- [ ] User cannot login with invalid credentials
- [ ] User can logout
- [ ] User stays logged in after page refresh

### Shop & Search
- [ ] Products load on shop page
- [ ] Search bar is visible and readable
- [ ] Search filters work
- [ ] Price filter works
- [ ] Category filter works
- [ ] Sorting works (all options)
- [ ] Pagination works

### Vendor Features
- [ ] Seller can access vendor dashboard
- [ ] Dashboard shows correct stats
- [ ] Seller can add new products
- [ ] Products appear in shop after adding
- [ ] Seller can view their products

### UI/UX
- [ ] All text is readable (dark on light backgrounds)
- [ ] Animations are smooth
- [ ] Buttons have proper hover effects
- [ ] Forms have clear error messages
- [ ] Mobile responsive design works

---

## 🐛 Troubleshooting

### If search text is not visible:
- Check browser console for errors
- Clear browser cache
- Refresh the page
- Verify input styling in globals.css

### If login doesn't work:
- Verify MongoDB connection
- Check if backend is running: `http://localhost:5000/health`
- Clear localStorage in browser
- Try creating new account

### If vendor features don't work:
- Ensure you're logged in as seller (seller@test.com)
- Check if token is properly stored in localStorage
- Verify backend vendor routes are loaded

### If animations are not working:
- Check if globals.css loaded properly
- Verify Tailwind CSS is configured correctly
- Browser might not support animations (rare)

---

## 📚 API Endpoints (for reference)

### Public Endpoints
```
GET  /api/products                    - Get all products
GET  /api/categories                 - Get categories
GET  /api/products/:slug             - Get product details
```

### Authentication
```
POST /api/auth/register              - Register user
POST /api/auth/login                 - Login user
GET  /api/auth/profile               - Get user profile
```

### Vendor/Seller
```
GET  /api/vendor/stats               - Get dashboard stats
POST /api/products                   - Add product (seller only)
GET  /api/vendor/products            - Get seller's products
```

### User Features
```
GET  /api/cart                       - Get cart
POST /api/cart                       - Add to cart
GET  /api/orders                     - Get user's orders
POST /api/orders                     - Create order
GET  /api/wishlist                   - Get wishlist
POST /api/wishlist                   - Add to wishlist
```

---

## 🎉 Features Implemented

✅ Beautiful UI with animations  
✅ Readable search inputs globally  
✅ Vendor dashboard and stats  
✅ Product creation for sellers  
✅ Search functionality  
✅ Product filtering & sorting  
✅ Cart management  
✅ Order system  
✅ AI chat integration  
✅ User reviews  
✅ Support tickets  
✅ Wishlist  
✅ Mobile responsive  

---

## 🚀 Next Steps (Future Enhancements)

- Payment gateway integration (Stripe)
- Email notifications
- Push notifications
- Real-time chat
- Advanced analytics
- Live inventory tracking
- Product recommendations ML
- Seller ratings system

---

## 📞 Support

For issues or questions, check:
1. Browser console (F12) for JavaScript errors
2. Backend logs (terminal where backend is running)
3. MongoDB connection status
4. Ensure both servers are running

---

**Last Updated:** April 9, 2026  
**System Status:** ✅ All systems operational
