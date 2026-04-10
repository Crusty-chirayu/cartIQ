# 🚀 CartIQ - Quick Start Guide

## ✅ Everything is Already Running!

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:5000  
**API:** http://localhost:5000/api

Open your browser and visit **http://localhost:3000** to start!

---

## 👥 Quick Login

### Option 1: Customer
```
Email: bob@test.com
Password: password123
```

### Option 2: Seller
```
Email: seller@test.com
Password: seller123
```

### Option 3: Register New Account
- Go to `/auth/register`
- Fill in your details
- Create account (now with readable input fields!)

---

## 🎯 What to Try First

### 1. **Homepage** ✨
- Visit http://localhost:3000
- See the beautiful new design with:
  - Gradient backgrounds
  - Animated promotional banners
  - Smooth animations on load

### 2. **Search Products** 🔍
- Go to `/shop`
- **Search text is now READABLE!** (This was the main issue - FIXED!)
- Try searching for any product name
- Search bar has clear dark text

### 3. **Filter & Sort** 📊
- Use price range filter on left sidebar
- Sort by: Newest, Price (Low-High), Price (High-Low), Rating
- See products update in real-time

### 4. **Vendor Dashboard** 📈
- Login as: `seller@test.com` / `seller123`
- Go to url: http://localhost:3000/vendor/dashboard
- See:
  - 📦 Total Products (with animated count)
  - 💰 Total Sales (animated card)
  - 📦 Total Orders (animated card)
  - ⭐ Average Rating (animated card)

### 5. **Add New Product** ➕
- From dashboard, click "➕ Add New Product"
- Or go to: http://localhost:3000/vendor/products/add
- Fill in product form:
  - **Title:** "My Awesome Product"
  - **Description:** Detailed product info
  - **Price:** ₹1999
  - **Stock:** 50
  - **Category:** Electronics
  - **Images:** https://via.placeholder.com/300
- Click "✅ Add Product"

### 6. **View Your Product** 🛍️
- Logout from seller account
- Login as customer: `bob@test.com` / `password123`
- Go to `/shop`
- See your newly added product!

### 7. **AI Chat** 🤖
- Visit http://localhost:3000/ai
- Chat with AI for product recommendations
- Ask for help finding products

---

## 🎨 New UI Features

### Animations
- ✅ Fade-in effects on page load
- ✅ Slide animations on navigation
- ✅ Hover scale effects on buttons
- ✅ Glowing pulse on CTAs
- ✅ Floating promotional banners

### Colors
- ✅ Blue to Purple gradients
- ✅ Pink accents
- ✅ Better contrast (WCAG compliant)

### Readability
- ✅ Dark text on light backgrounds
- ✅ Larger, bolder fonts
- ✅ Better spacing
- ✅ Clear error messages

---

## 🔧 Commands (If needed to restart servers)

### Start Backend (from project root)
```bash
cd cartiq-backend
npm run dev
```

### Start Frontend (from project root)
```bash
cd cartiq-frontend
npm run dev
```

---

## 📝 Test Scenarios

### Scenario 1: Complete Shopping Flow (5 mins)
```
1. Open http://localhost:3000
2. Register new account OR login as bob@test.com
3. Go to /shop
4. SEARCH for products (notice text is READABLE now!)
5. Filter by price
6. Sort by rating
7. View product details
8. Add to cart
9. Checkout
```

### Scenario 2: Vendor Workflow (10 mins)
```
1. Login as seller@test.com
2. Go to /vendor/dashboard
3. See your stats (animated cards!)
4. Click "Add New Product"
5. Fill in product details
6. Submit
7. Logout
8. Login as customer
9. Search for your product
10. Verify it appears in results
```

### Scenario 3: Full Feature Demo (20 mins)
```
1. Play with animations on homepage
2. Test search functionality
3. Test all filters and sorting
4. Add product as vendor
5. Leave a product review
6. Try AI chat
7. Add to wishlist
8. Create an order
9. View order history
10. Submit support ticket
```

---

## ✨ What's New (Summary)

| Feature | Status | What to Check |
|---------|--------|---------------|
| **Readable Inputs** | ✅ FIXED | Search bar, login form, registration |
| **Beautiful UI** | ✅ NEW | Homepage, shop page animations |
| **Vendor Dashboard** | ✅ NEW | `/vendor/dashboard` with stats |
| **Product Creation** | ✅ NEW | `/vendor/products/add` form |
| **Animations** | ✅ NEW | Page transitions, button hovers |
| **Promotional Ads** | ✅ NEW | Homepage banner carousel |
| **Better Buttons** | ✅ ENHANCED | Hover effects, gradients |
| **Responsive Design** | ✅ WORKING | View on mobile size |

---

## 🐛 Troubleshooting Quick Fix

### Search text not visible?
- ✅ FIXED! Text is now dark on white

### Buttons don't work?
- Check backend is running: `curl http://localhost:5000/health`
- Check frontend is running: Visit `http://localhost:3000`

### Login fails?
- Try the test accounts provided above
- Or register a new account (now easier!)

### Vendor page blank?
- Ensure you're logged in as seller
- Email must be `seller@test.com`
- Or register as seller in `/auth/register`

### Product doesn't appear?
- Verify form was submitted (check console for success message)
- Refresh shop page
- Check browser cache (clear if needed)

---

## 📞 API Endpoints Quick Reference

### Public (No Auth Needed)
```
GET  http://localhost:5000/api/products
GET  http://localhost:5000/api/categories
GET  http://localhost:5000/api/products/:slug
```

### Authentication (All Users)
```
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
GET  http://localhost:5000/api/auth/profile
```

### Vendor Only
```
GET  http://localhost:5000/api/vendor/stats
GET  http://localhost:5000/api/vendor/dashboard
POST http://localhost:5000/api/products (add product)
```

---

## 🎉 Ready to Go!

Everything is set up and running. Just open **http://localhost:3000** and start exploring!

### Things to Definitely Try:
1. 🔍 Search for something (TEXT IS NOW READABLE!)
2. ➕ Add a product as seller
3. 🎨 Notice the beautiful new animations
4. 🤖 Ask AI chat a question
5. ⭐ Leave a product review

---

**Start URL:** http://localhost:3000  
**Happy Testing! 🎉**

Last Updated: April 9, 2026
