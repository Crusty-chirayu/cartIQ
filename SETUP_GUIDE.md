# CartIQ - Complete Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 9.x
- Redis
- npm or yarn

---

## 📦 Backend Setup

### 1. Install Dependencies
```bash
cd cartiq-backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Core
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/cartiq

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# OpenRouter AI
OPENROUTER_API_KEY=your-openrouter-api-key

# Stripe (get from Stripe Dashboard)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay (if using)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email (Nodemailer Gmail example)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-specific-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 3. Start Backend
```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

Server runs on: `http://localhost:5000`

---

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd cartiq-frontend
npm install
```

### 2. Environment Configuration
```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api' > .env.local
```

### 3. Start Frontend
```bash
npm run dev
```

Application runs on: `http://localhost:3000`

---

## 🗄️ Database Setup

### MongoDB

**Local Setup:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:9

# Or native installation
# Download from: https://www.mongodb.com/try/download/community
```

**Seed Data (Optional):**
```bash
cd cartiq-backend
node seedProducts.js
```

### Redis

**Local Setup:**
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Or native installation
# Download from: https://redis.io/download
```

---

## 🔑 Getting API Keys

### OpenRouter (AI)
1. Go to: https://openrouter.ai
2. Sign up and generate API key
3. Set in `.env` as `OPENROUTER_API_KEY`

### Stripe (Payments)
1. Go to: https://dashboard.stripe.com
2. Create account
3. Get API keys from Developers → API Keys
4. Get Webhook Secret from Developers → Webhooks

### Razorpay (Payments - India)
1. Go to: https://razorpay.com
2. Create account
3. Get API keys from Settings → API Keys

### Google OAuth (Optional)
1. Go to: Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set Authorized JavaScript origins to `http://localhost:3000`

### Twilio (SMS)
1. Go to: https://www.twilio.com
2. Create account
3. Get SID and Auth Token from Console
4. Verify phone number for testing

---

## 🧪 Testing

### Backend Tests
```bash
cd cartiq-backend
npm run test
```

### Frontend Tests
```bash
cd cartiq-frontend
npm run test
```

### E2E Tests
```bash
cd cartiq-frontend
npm run test:e2e
```

---

## 📊 Using the Application

### User Roles

**1. Customer:**
- Browse products
- Search with AI
- Add to cart
- Checkout and pay
- Track orders
- Submit reviews

**2. Seller:**
- Access `/seller/dashboard`
- Manage products
- Submit KYC
- View analytics
- Request payouts

**3. Admin:**
- Access `/admin/dashboard`
- Approve seller KYC
- Verify products
- Manage users
- View analytics

### Default Routes

**Public:**
- `/` - Homepage
- `/shop` - Product browsing
- `/product/{slug}` - Product detail
- `/ai` - AI chat shopping
- `/auth/login` - Login
- `/auth/register` - Sign up

**Protected (Login Required):**
- `/cart` - Shopping cart
- `/checkout` - Payment
- `/orders` - Order history
- `/support` - Support tickets

**Seller (seller role required):**
- `/seller/dashboard` - Seller dashboard

**Admin (admin role required):**
- `/admin/dashboard` - Admin dashboard
- `/admin/sellers` - Seller management
- `/admin/orders` - Order management

---

##  🚀 Deployment

### Frontend (Vercel - Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# Import your repository from Vercel dashboard

# 3. Set environment variables in Vercel
# - NEXT_PUBLIC_API_URL=https://api.cartiq.com

# 4. Deploy
# Automatic on push to main
```

### Backend (Heroku / Railway / Render)

**Using Railway.app:**

```bash
# 1. Install Railway CLI
npm install -g railway

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Set environment variables
railway variables set JWT_SECRET=...
railway variables set MONGODB_URI=mongodb+srv://...
# ... set remaining vars

# 5. Deploy
railway up
```

**Using Render.com:**

```bash
# 1. Connect GitHub repo
# 2. Create Web Service
# 3. Set Build Command: npm install
# 4. Set Start Command: npm start
# 5. Add environment variables
# 6. Deploy
```

**Using Docker:**

```bash
# Build
docker build -t cartiq-backend .

# Run
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/cartiq \
  -e REDIS_HOST=redis \
  cartiq-backend
```

---

## 📝 API Documentation

### Swagger/OpenAPI
```bash
# Generate docs
npm run docs

# Access at http://localhost:5000/api-docs
```

### Postman Collection
- Import: `postman-collection.json` (in root)
- Update base URL to your API
- Explore all endpoints

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB
mongo mongodb://localhost:27017/cartiq

# Check Redis
redis-cli ping

# Check logs
npm run dev --verbose
```

### Frontend build errors
```bash
# Clear cache
rm -rf .next
npm run build

# Check Node version
node --version # Should be 18+
```

### API connection issues
```bash
# Check CORS in backend
# Verify CLIENT_URL in backend .env

# Check request headers
# Authorization: Bearer {token}
```

### Payment issues
- Verify Stripe/Razorpay keys
- Check webhook URLs
- Review logs for API errors

---

## 📊 Monitoring

### Backend Logs
```bash
# Winston logs in ./logs/
cat logs/combined.log

# Real-time
tail -f logs/combined.log | grep "error"
```

### Database Stats
```bash
# MongoDB
use cartiq
db.stats()

# Check collections
db.getCollectionNames()
```

### Redis Stats
```bash
redis-cli INFO stats
redis-cli DBSIZE
```

---

## 🔐 Security Checklist

- [ ] All secrets in `.env` (not committed)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] JWT secrets rotated in production
- [ ] Database backups enabled
- [ ] Rate limiting active on API
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] CSRF protection enabled
- [ ] Security headers configured (Helmet.js)
- [ ] Payment webhook verification working

---

## 📞 Support

### Common Issues

**Q: "Cannot connect to MongoDB"**
A: Ensure MongoDB is running and connection string is correct

**Q: "AI not responding"**
A: Check OpenRouter API key and API usage limits

**Q: "Cart not updating"**
A: Clear browser cache and localStorage

**Q: "Payments failing"**
A: Verify Stripe/Razorpay credentials and webhook setup

---

## 🎯 Next Steps

1. ✅ Set up local development environment
2. ✅ Run both backend and frontend
3. ✅ Configure payment methods
4. ✅ Seed test data
5. ✅ Test user flows (auth → shop → cart → checkout)
6. ✅ Configure email templates
7. ✅ Set up error monitoring (Sentry)
8. ✅ Deploy to production

---

**CartIQ is now ready for development and deployment!** 🚀

For updates and issues: Check GitHub issues and documentation.
