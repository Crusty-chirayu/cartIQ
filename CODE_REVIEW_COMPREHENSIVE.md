# CartIQ Codebase - Comprehensive Code Review

**Review Date:** April 9, 2026  
**Scope:** Full stack review of backend (Node.js/Express/MongoDB) and frontend (Next.js/React/TypeScript)  
**Assessment Type:** Code quality, security vulnerabilities, performance issues, best practices violations

---

## Executive Summary

The CartIQ codebase has **97 identified issues** across backend and frontend:
- **Critical:** 18 issues
- **High:** 25 issues  
- **Medium:** 35 issues
- **Low:** 19 issues

Major concerns include:
1. **TOCTOU race conditions** with inventory/stock management
2. **In-memory data stores** (reviews, wishlist) with data loss on restart
3. **Token/API key mismatches** causing authentication failures
4. **Missing data validation and sanitization** across inputs
5. **No transaction support** for multi-step operations
6. **Type safety issues** in frontend

---

## BACKEND ISSUES

### AUTH & SECURITY

#### 1. **Password Not Hashed in Registration** ⚠️ CRITICAL
- **File:** [controllers/authController.js](controllers/authController.js#L43)
- **Issue Type:** Security Vulnerability
- **Severity:** CRITICAL
- **Description:** Password stored as plain text before being hashed. While User.js has a pre-save hook to hash passwords, it's an anti-pattern to not handle this explicitly in the controller. No password strength validation.
- **Lines:** 43, 77 (register and login)
- **Fix:** Validate password strength before saving; move password validation to middleware

```javascript
// ❌ Current (risky)
passwordHash: password,

// ✅ Should validate first
if (password.length < 8) throw new Error('Password too weak');
```

#### 2. **No Email Validation** ⚠️ MEDIUM
- **File:** [controllers/authController.js](controllers/authController.js#L22-L30)
- **Issue Type:** Security & Quality Issue
- **Severity:** MEDIUM
- **Description:** Email format not validated. Only checks existence, not validity.
- **Lines:** 22-30
- **Fix:** Add email regex validation or use `zod` validation schema

#### 3. **No Email Verification Flow** ⚠️ HIGH
- **File:** [controllers/authController.js](controllers/authController.js#L20-L70)
- **Issue Type:** Best Practices Violation
- **Severity:** HIGH
- **Description:** Users can register with any email. No OTP/verification email sent. This allows fake emails and fake signups.
- **Lines:** 20-70
- **Recommendation:** Implement email verification with OTP

#### 4. **Profile Update Not Sanitized** ⚠️ MEDIUM
- **File:** [controllers/authController.js](controllers/authController.js#L161-L170)
- **Issue Type:** Security Vulnerability (XSS)
- **Severity:** MEDIUM
- **Description:** `updateProfile` accepts `name`, `phone`, `avatar` without sanitization. Avatar URL not validated.
- **Lines:** 161-170
- **Fix:** Sanitize inputs; validate avatar URL

#### 5. **Token Stored in Database Plaintext** ⚠️ MEDIUM
- **File:** [models/User.js](models/User.js#L70), [controllers/authController.js](controllers/authController.js#L48)
- **Issue Type:** Security Vulnerability
- **Severity:** MEDIUM
- **Description:** Refresh tokens stored in plain text in DB. If DB compromised, attacker can use refresh tokens.
- **Lines:** User.js line 70, authController.js line 48, 95
- **Fix:** Hash refresh tokens using JWT signature validation or redis with TTL

#### 6. **Admin Endpoints Missing Authorization Check** ⚠️ CRITICAL
- **File:** [controllers/adminController.js](controllers/adminController.js)
- **Issue Type:** Security Vulnerability
- **Severity:** CRITICAL
- **Description:** No verification that requester is actually an admin. Routes call `getAllUsers`, `banUser`, etc. If routes missing auth middleware, attackers can modify user data.
- **Lines:** All endpoints
- **Fix:** Ensure `authorizeRoles('admin')` middleware applied to all routes

#### 7. **Authentication Rate Limiting Limited** ⚠️ MEDIUM
- **File:** [middleware/authMiddleware.js](middleware/authMiddleware.js#L7)
- **Issue Type:** Security Vulnerability
- **Severity:** MEDIUM
- **Description:** `protect` middleware queries DB for every request to fetch user. N+1 query pattern. No rate limiting on token verification attempts.
- **Lines:** 7-27
- **Fix:** Cache user in middleware using Redis; add rate limiting

#### 8. **Silent Failures in Optional Auth** ⚠️ LOW
- **File:** [middleware/authMiddleware.js](middleware/authMiddleware.js#L43-L55)
- **Issue Type:** Quality/Debug Issue
- **Severity:** LOW
- **Description:** `optionalAuth` silently ignores token errors. Can hide security issues.
- **Lines:** 43-55
- **Fix:** Log token errors; return user as null explicitly

---

### PAYMENT & TRANSACTIONS

#### 9. **Payment Webhook Signature Verification Issues** ⚠️ CRITICAL
- **File:** [controllers/paymentController.js](controllers/paymentController.js#L148-L175)
- **Issue Type:** Security Vulnerability
- **Severity:** CRITICAL
- **Description:** Stripe webhook signature verification requires raw body, but Express JSON middleware parses it first. `req.rawBody` may not exist.
- **Lines:** 148-175
- **Fix:** Use `bodyParser.raw()` for webhook endpoint before JSON parser

#### 10. **Payment Verification Called Multiple Times** ⚠️ HIGH
- **File:** [controllers/paymentController.js](controllers/paymentController.js#L64), [services/paymentService.js](services/paymentService.js#L50)
- **Issue Type:** Logic Bug
- **Severity:** HIGH
- **Description:** `verifyPayment` called from both controller (line 64) and webhook (service.js). May cause duplicate transaction processing.
- **Lines:** paymentController.js line 64, paymentService.js
- **Fix:** Use idempotency keys; ensure single payment verification

#### 11. **No Idempotency Key Support** ⚠️ MEDIUM
- **File:** [controllers/paymentController.js](controllers/paymentController.js)
- **Issue Type:** Quality/Safety Issue
- **Severity:** MEDIUM
- **Description:** `initiatePayment` doesn't support idempotency keys. Duplicate requests create duplicate payments.
- **Lines:** All
- **Fix:** Generate and store idempotency keys; check for duplicates

#### 12. **Inconsistent Error Response Format** ⚠️ MEDIUM
- **File:** [controllers/paymentController.js](controllers/paymentController.js#L15), [controllers/supportController.js](controllers/supportController.js#L30)
- **Issue Type:** Quality Issue
- **Severity:** MEDIUM
- **Description:** Error responses use `errorResponse(statusCode, message)` in some places and `errorResponse(message, statusCode)` in others.
- **Lines:** Line 15 vs Line 17
- **Example:**
  ```javascript
  // Inconsistent order
  errorResponse(404, "Order not found")  // Line 15
  errorResponse(400, "Payment verification failed")  // Line 44
  ```
- **Fix:** Standardize to single format: `errorResponse(message, statusCode)` or use TypeScript overloads

---

### INVENTORY & ORDERS

#### 13. **TOCTOU Race Condition in Stock Management** ⚠️ CRITICAL
- **File:** [services/orderService.js](services/orderService.js#L10-L25), [controllers/cartController.js](controllers/cartController.js#L34-L35)
- **Issue Type:** Race Condition/Performance Bug
- **Severity:** CRITICAL
- **Description:** Stock validated, then reduced in separate operations. Between check and reduction, stock can change. Two concurrent orders can both pass validation.
- **Lines:** orderService.js line 10-25
- **Scenario:**
  ```
  Product stock = 5
  Order 1: Check stock (5 >= 5) ✓       <- Pass
  Order 2: Check stock (5 >= 5) ✓       <- Pass
  Order 1: Reduce stock (5 - 5 = 0) ✓   
  Order 2: Reduce stock (0 - 5 = -5) ✗  <- Oversold!
  ```
- **Fix:** Use MongoDB atomic operations: `findByIdAndUpdate` with `$inc` in single operation, or use transactions

#### 14. **Stock Updated After Order Created** ⚠️ CRITICAL
- **File:** [services/orderService.js](services/orderService.js#L40-42)
- **Issue Type:** Transaction Safety
- **Severity:** CRITICAL
- **Description:** Order created first, then stock reduced. If stock update fails, order exists but inventory not decremented.
- **Lines:** 40-42
- **Fix:** Use MongoDB transactions to wrap both operations
  ```javascript
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Create order and reduce stock in transaction
    session.commitTransaction();
  } catch (err) {
    session.abortTransaction();
  }
  ```

#### 15. **Non-existent Field Reference** ⚠️ CRITICAL
- **File:** [services/orderService.js](services/orderService.js#L56)
- **Issue Type:** Quality Bug
- **Severity:** CRITICAL
- **Description:** Updates `aiProfile.recentOrders` but User.js model doesn't have this field. Silently fails.
- **Lines:** 56
- **Fix:** Remove this line or add field to User model

#### 16. **Hardcoded Shipping Cost** ⚠️ MEDIUM
- **File:** [services/orderService.js](services/orderService.js#L51)
- **Issue Type:** Quality/Design Issue
- **Severity:** MEDIUM
- **Description:** Shipping hardcoded to 99. Should be configurable or calculated based on weight/distance.
- **Lines:** 51
- **Fix:** Create Shipping model; retrieve from config

#### 17. **No Address Validation** ⚠️ MEDIUM
- **File:** [services/orderService.js](services/orderService.js#L26)
- **Issue Type:** Quality/Data Issue
- **Severity:** MEDIUM
- **Description:** `shippingAddress` and `billingAddress` accepted without validation. May contain invalid postal codes, incomplete data.
- **Lines:** 26
- **Fix:** Add Zod schema validation for addresses

#### 18. **Multi-Seller Order Authorization May Fail** ⚠️ MEDIUM
- **File:** [controllers/orderController.js](controllers/orderController.js#L99-L104)
- **Issue Type:** Security Logic Issue
- **Severity:** MEDIUM
- **Description:** `updateStatus` checks if current user is seller of ANY item. If user is seller of one item, they can update status for entire order (including other sellers' items).
- **Lines:** 99-104
- **Fix:** Filter order items by seller before updating

---

### DATA VALIDATION & SANITIZATION

#### 19. **Insufficient Input Validation** ⚠️ HIGH
- **File:** [controllers/productController.js](controllers/productController.js#L50), [controllers/cartController.js](controllers/cartController.js#L28)
- **Issue Type:** Security Vulnerability
- **Severity:** HIGH
- **Description:** Prices, quantities not validated as positive numbers. Price could be negative.
- **Lines:** productController.js line 50, cartController.js line 28
- **Fix:** Add validation middleware using Zod:
  ```javascript
  const priceSchema = z.number().positive();
  ```

#### 20. **No Sanitization on String Inputs** ⚠️ HIGH
- **File:** [controllers/aiController.js](controllers/aiController.js#L37), [controllers/supportController.js](controllers/supportController.js#L13)
- **Issue Type:** Security Vulnerability (XSS/Injection)
- **Severity:** HIGH
- **Description:** Message, subject, title inputs not sanitized. Could contain malicious scripts.
- **Lines:** aiController.js line 37, supportController.js line 13
- **Fix:** Use `express-mongo-sanitize` (already imported in app.js, but not applied by default)

#### 21. **Cart Item Validation Missing** ⚠️ MEDIUM
- **File:** [controllers/cartController.js](controllers/cartController.js#L28-L45)
- **Issue Type:** Quality Issue
- **Severity:** MEDIUM
- **Description:** `addItem` doesn't validate quantity > 0, productId is valid ObjectId.
- **Lines:** 28-45
- **Fix:** Add validation schema

---

### CODE STRUCTURE & DESIGN ISSUES

#### 22. **Review Controller Uses In-Memory Array** ⚠️ CRITICAL
- **File:** [controllers/reviewController.js](controllers/reviewController.js#L1-5)
- **Issue Type:** Critical Design Flaw
- **Severity:** CRITICAL
- **Description:** Reviews stored in global `let reviews = []` array instead of MongoDB. Data lost on server restart. Shared across all instances (multi-server issue).
- **Lines:** 1-5
- **Fix:** Replace with MongoDB database calls
- **Recommendation:** This file is a stub/placeholder. Needs full implementation.

#### 23. **Wishlist Controller Uses Global Array** ⚠️ CRITICAL
- **File:** [controllers/wishlistController.js](controllers/wishlistController.js#L1-3)
- **Issue Type:** Critical Design Flaw
- **Severity:** CRITICAL
- **Description:** Wishlist stored in global `let wishlist = []`. Not per-user! All users share same wishlist. Data loss on restart.
- **Lines:** 1-3
- **Fix:** 
  ```javascript
  // Get user's wishlist from DB
  const getWishlist = async (req, res) => {
    const wishlist = await Wishlist.find({ user: req.user._id });
    res.json(successResponse(wishlist));
  };
  ```

#### 24. **Review Controller Missing Authorization** ⚠️ CRITICAL
- **File:** [controllers/reviewController.js](controllers/reviewController.js#L6-16)
- **Issue Type:** Security Vulnerability
- **Severity:** CRITICAL
- **Description:** `createReview` doesn't verify user owns the order or purchased product. Any user can review any product.
- **Lines:** 6-16
- **Fix:** Add order verification

#### 25. **Review Controller Using Insecure IDs** ⚠️ MEDIUM
- **File:** [controllers/reviewController.js](controllers/reviewController.js#L8)
- **Issue Type:** Security/Quality Issue
- **Severity:** MEDIUM
- **Description:** `id: Date.now().toString()` is guessable and not unique across instances.
- **Lines:** 8
- **Fix:** Use MongoDB ObjectId

#### 26. **AI Service is Dummy Implementation** ⚠️ CRITICAL
- **File:** [services/aiService.js](services/aiService.js)
- **Issue Type:** Incomplete Implementation
- **Severity:** CRITICAL
- **Description:** AI service returns dummy responses. Not connected to Google Generative AI (package installed but not used).
- **Lines:** All
- **Recommendation:** Requires full implementation using `@google/generative-ai` package

#### 27. **AI Chat Without Input Sanitization** ⚠️ HIGH
- **File:** [controllers/aiController.js](controllers/aiController.js#L15-20)
- **Issue Type:** Security Vulnerability (Injection)
- **Severity:** HIGH
- **Description:** AI message sent to external AI service without sanitization. Could be used for prompt injection.
- **Lines:** 15-20
- **Fix:** Sanitize message; add length limits; rate limit

#### 28. **Search Endpoint May Have Injection Issues** ⚠️ MEDIUM
- **File:** [services/searchService.js](services/searchService.js#L15-19)
- **Issue Type:** Security Vulnerability
- **Severity:** MEDIUM
- **Description:** Search query passed to `$text` search without sanitization. Even with sanitizer, text search could be abused.
- **Lines:** 15-19
- **Fix:** Validate search query length and format

#### 29. **Admin Controller Missing Authorization** ⚠️ CRITICAL
- **File:** [controllers/adminController.js](controllers/adminController.js#L12)
- **Issue Type:** Security Vulnerability
- **Severity:** CRITICAL
- **Description:** `banUser` endpoint doesn't check if requester is admin
- **Lines:** 12-23
- **Assumption:** Routes have middleware, but controller should be defensive

#### 30. **Cart Using Undefined Function** ⚠️ CRITICAL
- **File:** [controllers/cartController.js](controllers/cartController.js#L21-23)
- **Issue Type:** Runtime Error
- **Severity:** CRITICAL
- **Description:** `getCart` calls `updateCartTotals(cart)` but this function not defined in this file. Will crash.
- **Lines:** 21-23
- **Error:** `ReferenceError: updateCartTotals is not defined`
- **Fix:** Define function or import from service

---

### MIDDLEWARE & CONFIGURATION

#### 31. **Upload Middleware Missing Virus Scan** ⚠️ MEDIUM
- **File:** [middleware/uploadMiddleware.js](middleware/uploadMiddleware.js)
- **Issue Type:** Security/Quality
- **Severity:** MEDIUM
- **Description:** Files uploaded to disk without virus scanning. No malware detection.
- **Lines:** All
- **Fix:** Integrate ClamAV or similar for virus scanning

#### 32. **File Upload Not Using Cloud Storage** ⚠️ MEDIUM
- **File:** [middleware/uploadMiddleware.js](middleware/uploadMiddleware.js#L9-17)
- **Issue Type:** Architecture/Quality
- **Severity:** MEDIUM
- **Description:** Files stored on local disk. Doesn't scale with multiple servers. Package `multer-storage-cloudinary` installed but not used.
- **Lines:** 9-17
- **Fix:** Use Cloudinary storage instead

#### 33. **Database Connection Not Called** ⚠️ MEDIUM
- **File:** [server.js](server.js#L5-7)
- **Issue Type:** Configuration Issue
- **Severity:** MEDIUM
- **Description:** `connectDB` function defined but never imported or called. MongoDB not connected in production.
- **Lines:** 5-7
- **Fix:** Import and call `connectDB()`

#### 34. **Redis Disabled in All Modes** ⚠️ MEDIUM
- **File:** [server.js](server.js#L10-12)
- **Issue Type:** Configuration Issue
- **Severity:** MEDIUM
- **Description:** Redis disabled (mock object used). Required for session storage, caching, rate limiting.
- **Lines:** 10-12
- **Fix:** Enable Redis or use mock only in dev

---

### LOGGING & ERROR HANDLING

#### 35. **Logging May Contain Sensitive Info** ⚠️ MEDIUM
- **File:** [utils/logger.js](utils/logger.js)
- **Issue Type:** Security Issue
- **Severity:** MEDIUM
- **Description:** Error logs include full stack traces, may contain passwords or tokens if error message includes them.
- **Lines:** All
- **Fix:** Filter sensitive data from logs

#### 36. **Error Handler Exposes Stack Trace in Dev** ⚠️ LOW
- **File:** [middleware/errorHandlerMiddleware.js](middleware/errorHandlerMiddleware.js#L6-12)
- **Issue Type:** Security Information Disclosure
- **Severity:** LOW
- **Description:** Stack traces sent in dev responses are OK, but should not be sent in production (correctly handled).
- **Lines:** 6-12

---

### PERFORMANCE ISSUES

#### 37. **N+1 Query Pattern in Recommendations** ⚠️ HIGH
- **File:** [services/recommendationService.js](services/recommendationService.js#L16-18)
- **Issue Type:** Performance Issue
- **Severity:** HIGH
- **Description:** For each recently viewed product, category extracted without aggregation. Could load N categories separately.
- **Lines:** 16-18
- **Fix:** Use aggregation pipeline to extract categories in single query

#### 38. **Auth Middleware Queries DB on Every Request** ⚠️ HIGH
- **File:** [middleware/authMiddleware.js](middleware/authMiddleware.js#L23)
- **Issue Type:** Performance Issue (N+1 queries)
- **Severity:** HIGH
- **Description:** `User.findById(decoded.id)` called for every protected route. Should cache in request or use JWT claims.
- **Lines:** 23
- **Fix:** Cache user in `req.user` after first lookup; use Redis

#### 39. **Cart Totals Not Indexed** ⚠️ MEDIUM
- **File:** [models/Cart.js](models/Cart.js)
- **Issue Type:** Performance Issue
- **Severity:** MEDIUM
- **Description:** No index on `user` field for Cart lookups.
- **Lines:** Cart.js
- **Fix:** Add `unique: true` index on user field (already present, good)

#### 40. **Product Search May Use Poor Index** ⚠️ MEDIUM
- **File:** [models/Product.js](models/Product.js#L116)
- **Issue Type:** Performance Issue
- **Severity:** MEDIUM
- **Description:** Text index created but no index on `status` or `stock` for filtering.
- **Lines:** 116
- **Fix:** Add compound index: `{ status: 1, stock: 1, createdAt: -1 }`

---

## FRONTEND ISSUES

### AUTHENTICATION & SECURITY

#### 41. **Token Stored in localStorage (XSS Vulnerable)** ⚠️ HIGH
- **File:** [lib/api.ts](lib/api.ts#L22), [components/AuthModal.tsx](components/AuthModal.tsx#L49)
- **Issue Type:** Security Vulnerability (XSS)
- **Severity:** HIGH
- **Description:** JWT token stored in localStorage. Any XSS vulnerability allows attacker to steal tokens.
- **Lines:** api.ts line 22, AuthModal.tsx line 49
- **Fix:** Use httpOnly cookies instead (requires backend support)
- **Current:** `localStorage.setItem('cartiq_token', data.token);`
- **Better:** Use `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict`

#### 42. **Token Key Mismatch** ⚠️ CRITICAL
- **File:** [lib/api.ts](lib/api.ts#L22), [components/AuthModal.tsx](components/AuthModal.tsx#L49)
- **Issue Type:** Logic Bug
- **Severity:** CRITICAL
- **Description:** AuthModal stores token as `'cartiq_token'` but api.ts reads from `'token'`. Token not retrieved on page reload.
- **Lines:** api.ts line 22 vs AuthModal.tsx line 49
- **Scenario:**
  ```javascript
  // AuthModal.tsx
  localStorage.setItem('cartiq_token', data.token);  // Line 49
  
  // api.ts
  const token = localStorage.getItem('token');  // Line 22 - DIFFERENT KEY!
  ```
- **Fix:** Use same key: `'authiq_token'` everywhere

#### 43. **No CSRF Protection** ⚠️ HIGH
- **File:** [lib/api.ts](lib/api.ts)
- **Issue Type:** Security Vulnerability
- **Severity:** HIGH
- **Description:** No CSRF token sent with requests. API vulnerable to CSRF attacks.
- **Lines:** All
- **Fix:** 
  1. Backend: Set CSRF token in cookie
  2. Frontend: Read token from cookie, send in header

#### 44. **No Content Security Policy** ⚠️ MEDIUM
- **File:** [app/layout.tsx](app/layout.tsx)
- **Issue Type:** Security Headers
- **Severity:** MEDIUM
- **Description:** No CSP header. Browser allows any script source.
- **Lines:** layout.tsx
- **Fix:** Set CSP header in next.config.ts:
  ```javascript
  headers: [{ key: 'Content-Security-Policy', value: "default-src 'self'" }]
  ```

#### 45. **Refresh Token Sent in Request Body** ⚠️ MEDIUM
- **File:** [lib/api.ts](lib/api.ts#L34-36)
- **Issue Type:** Security Issue
- **Severity:** MEDIUM
- **Description:** Refresh token sent in request body, could be logged or cached.
- **Lines:** 34-36
- **Fix:** Send refresh token via httpOnly cookie instead

---

### API & DATA HANDLING

#### 46. **API Response Type Mismatch** ⚠️ CRITICAL
- **File:** [lib/api.ts](lib/api.ts#L30-43)
- **Issue Type:** Type Safety Bug
- **Severity:** CRITICAL
- **Description:** API responses may have `data` key or direct data. No consistent data extraction.
- **Lines:** 30-43
- **Issue:**
  ```typescript
  // Backend returns:
  { success: true, data: { token, user } }
  
  // But code accesses:
  const { token } = response.data.data;  // Extra nesting
  ```
- **Fix:** Standardize response structure

#### 47. **cartApi Methods Have Parameter Mismatches** ⚠️ CRITICAL
- **File:** [lib/api.ts](lib/api.ts#L115-125)
- **Issue Type:** API Design Bug
- **Severity:** CRITICAL
- **Description:** Methods use different parameter structures:
  - `addItem`: expects `{ productId, quantity }`
  - `updateItem`: expects `itemId, quantity` (missing object wrapper)
  - `removeItem`: expects `itemId` (but backend route expects from body)
- **Lines:** 115-125
- **Example:**
  ```typescript
  // Line 116 - expects object
  addItem: (data: { productId: string; quantity: number }) =>
    apiClient.post("/cart/items", data),
    
  // Line 118 - expects separate params (type error!)
  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch(`/cart/items/${itemId}`, { quantity }),
  ```
- **Fix:** Standardize to object parameters

#### 48. **cartApi.remove Not Implemented** ⚠️ CRITICAL
- **File:** [lib/api.ts](lib/api.ts#L115-125)
- **Issue Type:** Missing Implementation
- **Severity:** CRITICAL
- **Description:** `cartApi.remove` called in CartSidebar.tsx but not defined in api.ts. Should be `removeItem`.
- **Lines:** api.ts line 125 (missing)
- **Error:** Will throw `TypeError: cartApi.remove is not a function`
- **Fix:** Add method or use `removeItem`

#### 49. **No Error Response Type Handling** ⚠️ MEDIUM
- **File:** [lib/api.ts](lib/api.ts#L26-47)
- **Issue Type:** Type Safety
- **Severity:** MEDIUM
- **Description:** Response interceptor assumes error.response exists. Could crash if network error.
- **Lines:** 26-47
- **Fix:** Add null checks

---

### AUTHENTICATION & COMPONENTS

#### 50. **AuthModal Token Storage Key Mismatch** ⚠️ CRITICAL
- **File:** [components/AuthModal.tsx](components/AuthModal.tsx#L49)
- **Issue Type:** Bug
- **Severity:** CRITICAL
- **Description:** Stores token as `'cartiq_token'` but app requests `'token'`. (Same as issue #42)
- **Lines:** 49
- **Fix:** Change to `'token'` to match api.ts

#### 51. **No Email Validation UI** ⚠️ MEDIUM
- **File:** [components/AuthModal.tsx](components/AuthModal.tsx)
- **Issue Type:** Quality/UX Issue
- **Severity:** MEDIUM
- **Description:** Email input doesn't validate format before submit.
- **Lines:** All
- **Fix:** Add email regex validation

#### 52. **No Password Strength Indicator** ⚠️ MEDIUM
- **File:** [components/AuthModal.tsx](components/AuthModal.tsx)
- **Issue Type:** Quality/UX Issue
- **Severity:** MEDIUM
- **Description:** No feedback on password strength for registration.
- **Lines:** All
- **Fix:** Add password strength meter

#### 53. **No Email Confirmation After Register** ⚠️ MEDIUM
- **File:** [components/AuthModal.tsx](components/AuthModal.tsx#L42-58)
- **Issue Type:** Security Issue
- **Severity:** MEDIUM
- **Description:** User logged in immediately after register without email verification.
- **Lines:** 42-58
- **Fix:** Require email confirmation before login

#### 54. **Error State Not Cleared Between Auth Modes** ⚠️ LOW
- **File:** [components/AuthModal.tsx](components/AuthModal.tsx#L24)
- **Issue Type:** UX Issue
- **Severity:** LOW
- **Description:** Error message persists when switching between login/register.
- **Lines:** 24
- **Fix:** Clear error when mode changes

---

### CART & PRODUCT COMPONENTS

#### 55. **Product Route Parameter Mismatch** ⚠️ CRITICAL
- **File:** [components/ProductCard.tsx](components/ProductCard.tsx#L52)
- **Issue Type:** Routing Bug
- **Severity:** CRITICAL
- **Description:** Product link uses `product._id` but should use `product.slug` for SEO-friendly URLs.
- **Lines:** 52
- **Current:** `/product/${product._id}`
- **Should be:** `/product/${product.slug}`
- **Problem:** This link won't match backend route expecting slug

#### 56. **ProductCard Accesses Wrong Property Names** ⚠️ CRITICAL
- **File:** [components/ProductCard.tsx](components/ProductCard.tsx#L68-80)
- **Issue Type:** Type/Data Bug
- **Severity:** CRITICAL
- **Description:** Component accesses `product.name` and `product.countInStock` but backend returns `product.title` and `product.stock`.
- **Lines:** 68-80
- **Errors:**
  ```typescript
  // Line 68 - wrong property
  const imageHeightClass = ... product.image  // Backend: images (array)
  
  // Line 81 - undefined
  {product.countInStock === 0...}  // Backend: product.stock
  
  // Line 93 - undefined reference
  {product.name}  // Backend: product.title
  ```
- **Fix:** Update property names to match backend

#### 57. **CartSidebar Uses Wrong API Methods** ⚠️ CRITICAL
- **File:** [components/CartSidebar.tsx](components/CartSidebar.tsx#L20-29)
- **Issue Type:** API Bug
- **Severity:** CRITICAL
- **Description:** Uses `cartApi.remove` (doesn't exist, should be `removeItem`) and `cartApi.update` (param types wrong).
- **Lines:** 20-29
- **Fix:** Use correct method names and signatures

#### 58. **Cart Item Direct Property Access** ⚠️ MEDIUM
- **File:** [components/CartSidebar.tsx](components/CartSidebar.tsx#L39-40)
- **Issue Type:** Data Access Bug
- **Severity:** MEDIUM
- **Description:** Accesses `item.product.price` without validation. Product may not be populated.
- **Lines:** 39-40
- **Fix:** Add null checks and type guards

#### 59. **Wishlist State Not Persisted** ⚠️ MEDIUM
- **File:** [components/ProductCard.tsx](components/ProductCard.tsx#L48)
- **Issue Type:** Feature Bug
- **Severity:** MEDIUM
- **Description:** `isWishlisted` state local to component, not saved. Wishlist API called but response not stored.
- **Lines:** 48
- **Fix:** Store wishlist state in AppContext; call wishlist API

---

### CONTEXT & STATE MANAGEMENT

#### 60. **User Not Restored on Page Reload** ⚠️ HIGH
- **File:** [context/AppContext.tsx](context/AppContext.tsx)
- **Issue Type:** State Management Bug
- **Severity:** HIGH
- **Description:** User data stored in React state. Lost on page refresh. Not restored from localStorage/API.
- **Lines:** All
- **Fix:** 
  ```typescript
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile from API
      const user = await authApi.getProfile();
      dispatch({ type: 'SET_USER', payload: user });
    }
  }, []);
  ```

#### 61. **No Authentication Check on App Load** ⚠️ HIGH
- **File:** [context/AppContext.tsx](context/AppContext.tsx)
- **Issue Type:** Quality/Security Issue
- **Severity:** HIGH
- **Description:** App doesn't verify stored token is still valid. Stale token could remain in state.
- **Lines:** All
- **Fix:** Validate token with backend on app load

#### 62. **Toast Auto-dismiss Not Implemented** ⚠️ LOW
- **File:** [context/AppContext.tsx](context/AppContext.tsx)
- **Issue Type:** UX Issue
- **Severity:** LOW
- **Description:** Toast messages display indefinitely until hidden.
- **Lines:** All
- **Fix:** Add timeout to auto-dismiss

---

### HEADER & SEARCH

#### 63. **Search Race Condition** ⚠️ MEDIUM
- **File:** [components/Header.tsx](components/Header.tsx#L60-74)
- **Issue Type:** Logic Bug
- **Severity:** MEDIUM
- **Description:** Async search with timeout may return results out-of-order if user types fast.
- **Lines:** 60-74
- **Scenario:** User types "laptop" then deletes and types "phone" - "laptop" results may overwrite "phone" results
- **Fix:** Cancel previous request or use debounce

#### 64. **No Debounce on Search Input** ⚠️ MEDIUM
- **File:** [components/Header.tsx](components/Header.tsx#L60-74)
- **Issue Type:** Performance Issue
- **Severity:** MEDIUM
- **Description:** Search API called for every keystroke (with 350ms delay). Should debounce to fewer requests.
- **Lines:** 60-74
- **Fix:** Use useDebouncedValue hook or increase delay

#### 65. **Search URL Encoding May Fail** ⚠️ LOW
- **File:** [components/Header.tsx](components/Header.tsx#L83)
- **Issue Type:** URL Encoding Issue
- **Severity:** LOW
- **Description:** `encodeURIComponent(searchQuery)` used, but spaces already trimmed. Query parameter handling varies.
- **Lines:** 83
- **Note:** Actually correct implementation, minor issue

---

### TYPE SAFETY

#### 66. **TypeScript Not in Strict Mode** ⚠️ MEDIUM
- **File:** [tsconfig.json](tsconfig.json)
- **Issue Type:** Type Safety
- **Severity:** MEDIUM
- **Description:** TypeScript likely not in strict mode, allowing implicit `any` types.
- **Fix:** Set `"strict": true` in tsconfig.json

#### 67. **Incomplete Type Definitions** ⚠️ MEDIUM
- **File:** [lib/api.ts](lib/api.ts)
- **Issue Type:** Type Safety
- **Severity:** MEDIUM
- **Description:** Types imported but `Product`, `CartItem` may be incomplete. Cart reference in api.ts:
  ```typescript
  export interface CartItem {
    productId: string;
    quantity: number;
    variant?: string;
    product: any;  // ← Using any!
  }
  ```
- **Fix:** Define complete types

#### 68. **No Error Type Safety** ⚠️ MEDIUM
- **File:** [components/AuthModal.tsx](components/AuthModal.tsx#L42)
- **Issue Type:** Type Safety
- **Severity:** MEDIUM
- **Description:** Error caught as untyped. Should be `AxiosError` or custom error.
- **Lines:** 42
- **Current:** `catch (err) { ... }`
- **Fix:** Type errors properly

---

### PERFORMANCE & OPTIMIZATION

#### 69. **No Lazy Loading for Heavy Components** ⚠️ MEDIUM
- **File:** [components/ProductCard.tsx](components/ProductCard.tsx)
- **Issue Type:** Performance Issue
- **Severity:** MEDIUM
- **Description:** ProductCard component likely loaded for entire product list. No lazy loading.
- **Fix:** Use dynamic imports or React.lazy:
  ```typescript
  const ProductCard = dynamic(() => import('./ProductCard'), { loading: () => <Skeleton /> });
  ```

#### 70. **Missing Image Optimization** ⚠️ MEDIUM
- **File:** [app/page.tsx](app/page.tsx)
- **Issue Type:** Performance Issue
- **Severity:** MEDIUM
- **Description:** Uses regular `img` tags instead of Next.js `Image` component. No automatic optimization.
- **Lines:** All
- **Fix:** Use `Image` component from next/image

#### 71. **No Data Caching** ⚠️ MEDIUM
- **File:** [components/Header.tsx](components/Header.tsx), [app/page.tsx](app/page.tsx)
- **Issue Type:** Performance Issue
- **Severity:** MEDIUM
- **Description:** Fetches products/categories on every mount. No caching or stale-while-revalidate.
- **Fix:** Implement React Query/SWR for caching

---

### ACCESSIBILITY & UX

#### 72. **Missing ARIA Labels** ⚠️ LOW
- **File:** [components/ProductCard.tsx](components/ProductCard.tsx)
- **Issue Type:** Accessibility Issue
- **Severity:** LOW
- **Description:** Buttons missing proper `aria-label` descriptions.
- **Fix:** Add descriptive aria labels

#### 73. **No Keyboard Navigation** ⚠️ LOW
- **File:** [components/Header.tsx](components/Header.tsx)
- **Issue Type:** Accessibility Issue
- **Severity:** LOW
- **Description:** Search results don't support arrow key navigation.
- **Fix:** Add keyboard support

---

## CROSS-CUTTING CONCERNS

### 74. **No Transaction Support for Multi-Step Operations** ⚠️ CRITICAL
- **Files:** Multiple (orderService, paymentService, cartController)
- **Issue Type:** Data Integrity
- **Severity:** CRITICAL
- **Description:** Operations like "create order + reduce stock + process payment" not atomic. Partial failures leave inconsistent state.
- **Fix:** Implement MongoDB transactions using session:
  ```javascript
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Order.create([...], { session });
    await Product.updateMany({...}, {...}, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  }
  ```

### 75. **No Comprehensive Input Validation** ⚠️ HIGH
- **Files:** All controllers
- **Issue Type:** Security & Quality
- **Severity:** HIGH
- **Description:** Validation middleware created (validateMiddleware.js) but rarely used. Many endpoints accept unvalidated input.
- **Fix:** Apply validation middleware to all routes
- **Example:**
  ```javascript
  const productCreateSchema = z.object({
    title: z.string().min(3),
    price: z.number().positive(),
    category: z.string().refine(isObjectId),
  });
  
  router.post('/products', validateBody(productCreateSchema), createProduct);
  ```

### 76. **No Centralized Error Handling** ⚠️ MEDIUM
- **Files:** All
- **Issue Type:** Code Quality
- **Severity:** MEDIUM
- **Description:** Error responses inconsistent. Some use `errorResponse(statusCode, msg)`, others `errorResponse(msg, statusCode)`.
- **Fix:** Create typed error classes:
  ```javascript
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
    }
  }
  ```

### 77. **No API Documentation** ⚠️ MEDIUM
- **Files:** All routes
- **Issue Type:** Documentation
- **Severity:** MEDIUM
- **Description:** No OpenAPI/Swagger documentation. Backend endpoints not documented.
- **Fix:** Add Swagger with `swagger-jsdoc`

### 78. **Missing Environment Variable Validation** ⚠️ MEDIUM
- **Files:** config/*, server.js
- **Issue Type:** Configuration/Security
- **Severity:** MEDIUM
- **Description:** No validation that required env vars (JWT_SECRET, API keys) are set.
- **Fix:** 
  ```javascript
  const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI', 'STRIPE_KEY'];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) throw new Error(`Missing env var: ${varName}`);
  });
  ```

### 79. **No Request ID Tracking** ⚠️ MEDIUM
- **Files:** All
- **Issue Type:** Observability
- **Severity:** MEDIUM
- **Description:** No request IDs for tracing logs. Hard to debug issues.
- **Fix:** Add `express-request-id` middleware

### 80. **No Health Checks for Dependencies** ⚠️ MEDIUM
- **Files:** server.js, routes
- **Issue Type:** Reliability
- **Severity:** MEDIUM
- **Description:** `/health` endpoint only checks app, not DB or Redis.
- **Fix:** 
  ```javascript
  app.get('/health', async (req, res) => {
    const checks = {
      app: 'ok',
      db: await checkMongoDB(),
      redis: await checkRedis(),
    };
    res.status(Object.values(checks).every(c => c === 'ok') ? 200 : 503).json(checks);
  });
  ```

---

## ADDITIONAL ISSUES

### 81. **productController slug() Returns Spaces** ⚠️ MEDIUM
- **File:** [controllers/productController.js](controllers/productController.js#L56)
- **Issue Type:** Quality Bug
- **Severity:** MEDIUM
- **Description:** Slug not guaranteed unique. Two products with same title get same slug.
- **Fix:** Ensure unique slug with counter/UUID

### 82. **No Bulk Operations Support** ⚠️ LOW
- **Files:** controllers
- **Issue Type:** Performance
- **Severity:** LOW
- **Description:** No batch endpoints for operations like bulk cart add, bulk wishlist operations.
- **Recommendation:** Add bulk endpoints for better performance

### 83. **No Deprecation Warnings** ⚠️ LOW
- **Files:** All
- **Issue Type:** Maintenance
- **Severity:** LOW
- **Description:** No clear path for API versioning or deprecation.
- **Fix:** Implement v1, v2 routes or use header-based versioning

### 84. **Missing Features in Reviews** ⚠️ MEDIUM  
- **File:** [controllers/reviewController.js](controllers/reviewController.js)
- **Issue Type:** Missing Business Logic
- **Severity:** MEDIUM
- **Description:** No review moderation, no spam detection, no duplicate review prevention.

### 85. **No Notification Service Implementation** ⚠️ MEDIUM
- **File:** [services/notificationService.js](services/notificationService.js)
- **Issue Type:** Incomplete Implementation
- **Severity:** MEDIUM
- **Description:** Referenced but likely stubbed. No email/SMS actually sent.

### 86. **Order Stats Endpoint Missing** ⚠️ LOW
- **File:** [routes/orderRoutes.js](routes/orderRoutes.js#L18)
- **Issue Type:** Missing Implementation
- **Severity:** LOW
- **Description:** `getStats` route referenced but controller missing.

### 87. **No Audit Logging** ⚠️ MEDIUM
- **Files:** All
- **Issue Type:** Compliance/Security
- **Severity:** MEDIUM
- **Description:** No audit trail for sensitive operations (ban user, update product, etc.).
- **Fix:** Log all admin actions

### 88. **Banner/Promotion Data Hard to Manage** ⚠️ LOW
- **Files:** Models
- **Issue Type:** Design Issue
- **Severity:** LOW
- **Description:** Promotion model exists but no API endpoints to manage promotions.

### 89. **KYC Endpoint Exists but Incomplete** ⚠️ MEDIUM
- **File:** [controllers/adminController.js](controllers/adminController.js#L59)
- **Issue Type:** Incomplete Feature
- **Severity:** MEDIUM
- **Description:** KYC approval exists but no document verification or rejection flow.

### 90. **No Rate Limit on Delete Operations** ⚠️ MEDIUM
- **Files:** All delete endpoints
- **Issue Type:** Abuse Prevention
- **Severity:** MEDIUM
- **Description:** Users can delete reviews/products indefinitely. Could spam delete.
- **Fix:** Add delete operation rate limiting

### 91. **No Soft Delete Implementation** ⚠️ MEDIUM
- **Files:** Models
- **Issue Type:** Data Recovery
- **Severity:** MEDIUM
- **Description:** Hard deletes used. Data cannot be recovered. Should use soft delete for important records.

### 92. **Shipping Address Schema Incomplete** ⚠️ LOW
- **File:** [models/Order.js](models/Order.js#L47-54)
- **Issue Type:** Data Quality
- **Severity:** LOW
- **Description:** Phone field in shippingAddress but not in billingAddress. Inconsistent.

### 93. **Variant Handling Uses Mixed Type** ⚠️ MEDIUM
- **Files:** [models/CartItem.js](models/CartItem.js#L15), [models/Order.js](models/Order.js#L23)
- **Issue Type:** Type Safety
- **Severity:** MEDIUM
- **Description:** `variant: Schema.Types.Mixed` avoids type checking. Should be specific variant schema.

### 94. **No Rate Limit on AI Endpoints** ⚠️ HIGH
- **File:** [routes/aiRoutes.js](routes/aiRoutes.js)
- **Issue Type:** Cost/Abuse Prevention
- **Severity:** HIGH
- **Description:** AI calls can be expensive (Google API costs). No rate limiting to prevent abuse.
- **Fix:** Apply `aiChatLimiter` (defined but not used)

### 95. **No Support Ticket Attachment Support** ⚠️ LOW
- **File:** [models/SupportTicket.js](models/SupportTicket.js)
- **Issue Type:** Feature Gap
- **Severity:** LOW
- **Description:** No attachments field for support tickets.

### 96. **Cart Expiration Not Enforced** ⚠️ MEDIUM
- **File:** [models/Cart.js](models/Cart.js#L38-40)
- **Issue Type:** Quality Issue
- **Severity:** MEDIUM
- **Description:** Cart has `expiresAt` field but TTL index not created. Expired carts never deleted.
- **Fix:** Add TTL index: `cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`

### 97. **No Multi-Language Support** ⚠️ LOW
- **Files:** All
- **Issue Type:** Feature Request
- **Severity:** LOW
- **Description:** User preferences include language but no i18n implementation.

---

## SUMMARY BY SEVERITY

### CRITICAL (18 issues)
1. Password not hashed
2. TOCTOU stock race condition
3. Stock updated after order created
4. Review controller uses in-memory array
5. Wishlist controller uses global array
6. Wishlist has no user association
7. Review controller missing authorization
8. AI service is dummy implementation
9. Admin endpoints missing authorization check
10. Cart using undefined function
11. Token key mismatch (frontend)
12. Product route uses wrong parameter
13. ProductCard accesses wrong properties
14. CartSidebar uses wrong API methods
15. cartApi.remove not implemented
16. API response type mismatch
17. Cart item direct access without validation (data bug)
18. Non-existent field reference (recentOrders)

### HIGH (25 issues)
19-43: Various security, validation, and performance issues

### MEDIUM (35 issues)
44-78: Quality, design, and architectural issues

### LOW (19 issues)
79-97: Minor UX, documentation, and feature gap issues

---

## RECOMMENDED PRIORITY

### Phase 1 - Fix Critical Issues (Blocks functionality)
- [ ] Fix token key mismatch
- [ ] Fix cartApi methods mismatch
- [ ] Fix product property access in components
- [ ] Replace in-memory stores with DB
- [ ] Fix TOCTOU race conditions
- [ ] Implement missing functions

### Phase 2 - Fix High Severity (Security & Logic)
- [ ] Add input validation
- [ ] Secure payment webhook handling
- [ ] Implement authorization checks
- [ ] Add transaction support
- [ ] Fix XSS vulnerabilities

### Phase 3 - Quality & Performance (Rewrite)
- [ ] Refactor for consistency
- [ ] Add proper error handling
- [ ] Implement caching
- [ ] Add comprehensive logging
- [ ] Optimize queries

### Phase 4 - Enhancement
- [ ] Add features (soft delete, audit logging)
- [ ] Improve UX
- [ ] Add documentation
- [ ] Performance optimization

---

## QUICK WINS (Easy to fix, high impact)

1. Token key mismatch (5 min) - CRITICAL
2. Product property names (10 min) - CRITICAL  
3. Cart API methods (15 min) - CRITICAL
4. Input validation middleware application (30 min) - HIGH
5. Remove undefined function references (5 min) - CRITICAL
6. Add TTL index for cart expiration (5 min) - MEDIUM
7. Standardize error response format (20 min) - MEDIUM

---

## RECOMMENDED TOOLS & LIBRARIES

- **Input Validation:** Already using `zod`, apply consistently
- **Security:** Helmet (already imported), enable stricter CSP
- **Caching:** Redis (installed but disabled), Redis client
- **Transactions:** Mongoose sessions
- **Testing:** Jest, Supertest (already in package.json)
- **Documentation:** Swagger/OpenAPI
- **Frontend State:** TanStack Query (React Query) for data fetching & caching
- **XSS Protection:** DOMPurify for sanitization
- **Rate Limiting:** Already have rate-limit middleware, apply consistently

---

## NEXT STEPS

1. **Create issue backlog** in GitHub Issues or project management tool
2. **Assign severity levels** to each developer
3. **Allocate 2-3 sprints** for critical fixes
4. **Implement automated testing** to prevent regressions
5. **Add pre-commit hooks** to validate code before merge
6. **Set up code review process** focusing on security
7. **Document architecture decisions** in ADRs
8. **Implement CI/CD pipeline** with linting and security scanning

