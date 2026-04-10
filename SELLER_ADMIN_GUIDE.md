# 👑 Complete CartIQ Setup Guide - Seller Registration & Admin KYC Verification

## ✅ What We Just Fixed

1. **Login Error Fixed** - Better error messages when login fails
2. **Role Selection Added** - Now you can choose Seller or Customer during signup
3. **Admin KYC Dashboard Created** - A complete admin panel to verify seller documents

---

## 📝 How to Register as a Seller

### Step 1: Go to Registration Page
Visit: **http://localhost:3000/auth/register**

### Step 2: Fill in Your Details
- **Full Name:** Your name (e.g., "John Seller")
- **Email:** Your email (e.g., `seller1@test.com`)
- **Password:** 6+ characters (e.g., `password123`)
- **Confirm Password:** Same password

### Step 3: SELECT YOUR ROLE
**THIS IS IMPORTANT!** Click the dropdown that says:
- 👤 **Customer** - Buy Products (default)
- 🏪 **Seller** - Sell Products ← SELECT THIS

### Step 4: Accept Terms & Sign Up
Check the agreement checkbox and click "Create Account"

### Result
✅ You're now logged in as a **Seller**  
✅ You can go to `/vendor/dashboard` to add products

---

## 🏪 Seller Workflow

### Access Vendor Dashboard
1. Login as seller (newly registered or `seller@test.com`)
2. Go to: **http://localhost:3000/vendor/dashboard**
3. You'll see:
   - 📦 Total Products (starts at 0)
   - 💰 Total Sales (starts at $0)  
   - 📦 Total Orders (starts at 0)
   - ⭐ Average Rating (starts at 0⭐)

### Add a Product
1. From dashboard, click **"➕ Add New Product"** button
2. Or go directly to: **http://localhost:3000/vendor/products/add**
3. Fill in:
   - **Title:** Product name
   - **Description:** Product details
   - **Price:** Price in rupees (e.g., 1999)
   - **Stock:** Available quantity (e.g., 50)
   - **Category:** Select category (e.g., Electronics)
   - **Images:** Paste image URLs (e.g., https://via.placeholder.com/300)
4. Click **"✅ Add Product"**
5. Product appears immediately in the shop!

---

## 👑 Admin Setup (How to Become Admin)

### Option 1: Using Test Admin Account
We'll provide you with a test admin account:
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Role:** admin

### Option 2: Create Admin via Database (Manual)
If needed, run this in MongoDB:

```javascript
// In MongoDB console
db.users.insertOne({
  name: "Admin",
  email: "admin@test.com",
  passwordHash: "$2b$10$...", // Bcrypt hash of "admin123"
  role: "admin",
  isBanned: false,
  createdAt: new Date()
})
```

### Option 3: Register as Admin (Recommended for Testing)
Coming soon - we'll add a registration option to select "Admin" role during signup

---

## ✅ KYC Verification (Admin Panel)

### What is KYC?
KYC = "Know Your Customer" - Verification of seller identity  
As the God/Admin, **you verify sellers** before they can fully operate

### Access Admin Dashboard
1. Login as: `admin@test.com` / `admin123`
2. Go to: **http://localhost:3000/admin/dashboard**
3. Click on **"KYC Verification →"** button

### KYC Verification Page
You'll see a list of sellers waiting for approval:

**Features:**
- 📊 **Stats Cards** showing:
  - Pending Verification (yellow)
  - Approved (green)
  - Rejected (red)

- 🔍 **Filter Tabs** to view:
  - All requests
  - Pending (needs action)
  - Verified (already approved)
  - Rejected

- 📄 **For Each Seller:**
  - Name & Email
  - Document Type (ID Card, Passport, etc.)
  - Document Number
  - Document Image (clickable link)
  - Submission Date
  - **Action Buttons:**
    - ✅ **Approve** - Verify the seller
    - ❌ **Reject** - Decline verification

### How to Approve a Seller
1. Go to Admin > KYC Verification
2. Find the seller in "Pending" tab
3. Review their document (click "📄 View Document")
4. Click **"✅ Approve"** or **"❌ Reject"**
5. Status updates to green ✓

---

## 🎯 Complete Workflow Example

### As a Customer:
```
1. Visit http://localhost:3000
2. Register as CUSTOMER role
   Email: bob@test.com
3. Go to /shop
4. Search for products (readable text!)
5. Filter by price, sort by rating
6. Add to cart & checkout
```

### As a Seller:
```
1. Register as SELLER role
   Email: seller1@test.com
2. Go to /vendor/dashboard
3. Add new products
4. See stats update in real-time
5. Manage orders & payouts
```

### As an Admin:
```
1. Login as ADMIN role
   Email: admin@test.com
2. Go to /admin/dashboard
3. See platform stats
4. Click "KYC Verification"
5. Approve/Reject sellers
6. Manage users, products, orders
```

---

## 🔧 Test Accounts Available

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Customer** | `bob@test.com` | `password123` | Buy products |
| **Seller** | `seller@test.com` | `seller123` | Add & sell products |
| **Admin** | `admin@test.com` | `admin123` | Verify sellers & manage platform |

---

## 🆕 New Changes Made

### Frontend (Seller Registration)
✅ Added role dropdown to registration form  
✅ Can now select "Customer" or "Seller" role  
✅ Fixed login error display (no more empty {})  

### Admin Features
✅ Created `/admin/kyc` KYC verification dashboard  
✅ Can view all KYC requests with filters  
✅ Can approve/reject sellers  
✅ See document previews  
✅ Get status statistics  

### Seller Dashboard
✅ Already created - see stats of your business  
✅ Already created - add products easily  
✅ Already created - track sales metrics  

---

## 📍 Important URLs

| Page | URL | Who Can Access |
|------|-----|-----------------|
| Homepage | http://localhost:3000 | Everyone |
| Register | http://localhost:3000/auth/register | Everyone |
| Login | http://localhost:3000/auth/login | Everyone |
| Shop | http://localhost:3000/shop | Customers |
| Customer Dashboard | http://localhost:3000/dashboard | Customers |
| **Seller Dashboard** | **http://localhost:3000/vendor/dashboard** | **Sellers** |
| **Add Product** | **http://localhost:3000/vendor/products/add** | **Sellers** |
| **Admin Dashboard** | **http://localhost:3000/admin/dashboard** | **Admins** |
| **KYC Verification** | **http://localhost:3000/admin/kyc** | **Admins** |

---

## ⚡ Quick Start Commands

### Check if backend is running:
```bash
curl http://localhost:5000/health
```

### Check if frontend is running:
```bash
curl http://localhost:3000
```

### View backend logs:
```bash
# Terminal in cartiq-backend folder
npm run dev
```

### View frontend logs:
```bash
# Terminal in cartiq-frontend folder
npm run dev
```

---

## 🎉 You're All Set!

1. **Go to Registration:** http://localhost:3000/auth/register
2. **Choose your role** (Seller or Customer)
3. **Create account**
4. **Test it out!**

For admin features:
1. **Login as admin:** admin@test.com / admin123
2. **Go to KYC:** http://localhost:3000/admin/kyc
3. **Approve sellers!**

---

## ❓ Frequently Asked Questions

**Q: Can I be both seller and customer?**  
A: Not with the same account. Create two separate accounts or switch roles via direct database edit.

**Q: How do sellers submit KYC?**  
A: Sellers submit via their dashboard after registering. Documents are then reviewed by you (admin).

**Q: What happens after I approve KYC?**  
A: Seller becomes fully verified and can operate their store unlimitedly.

**Q: Can I see all seller information?**  
A: Yes! Go to Admin > "Manage Users" or "Verify Sellers" to see all seller details.

**Q: What if a seller submits bad documents?**  
A: Click "❌ Reject" - they'll need to resubmit with correct documents.

---

**Last Updated:** April 9, 2026  
**Status:** ✅ All Systems Ready for Testing
