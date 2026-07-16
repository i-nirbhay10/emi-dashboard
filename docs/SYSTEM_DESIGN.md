# System Design

## 1. Database Schema (Conceptual Entity-Relationship)
*Note: This is a high-level representation. Actual implementation will depend on chosen ORM (Prisma/Mongoose/Sequelize).*

### Users Table
- `id` (PK, UUID)
- `phone` (String, Unique)
- `email` (String, Nullable)
- `role` (Enum: USER, ADMIN, SUPER_ADMIN)
- `password_hash` (String, for admins)
- `created_at` (Timestamp)

### Products Table
- `id` (PK, UUID)
- `sku` (String, Unique)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `original_price` (Decimal)
- `category_id` (FK -> Categories.id)
- `inventory_id` (FK -> Inventory.id)
- `features` (JSON Array)
- `specifications` (JSON Object)
- `images` (Array of URLs)

### Inventory Table
- `id` (PK, UUID)
- `product_id` (FK -> Products.id)
- `in_stock` (Integer)
- `reserved` (Integer)
- `incoming` (Integer)
- `low_stock_threshold` (Integer)

### Orders Table
- `id` (PK, UUID)
- `user_id` (FK -> Users.id)
- `total_amount` (Decimal)
- `status` (Enum: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- `shipping_address_id` (FK -> Addresses.id)
- `payment_status` (Enum: UNPAID, PAID, REFUNDED)
- `created_at` (Timestamp)

### Banners / Promotions Table
- `id` (PK, UUID)
- `title` (String)
- `image_url` (String)
- `target_url` (String)
- `placement` (Enum: HOME_HERO, CATEGORY_TOP, CHECKOUT, etc.)
- `status` (Enum: ACTIVE, DRAFT, SCHEDULED)

## 2. API Design & Endpoints (RESTful approach)

### Auth API
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/admin-login` (Returns JWT)

### Product API
- `GET /api/products` (Filters: category, search, price range)
- `GET /api/products/:id`
- `POST /api/admin/products` (Admin Only)
- `PUT /api/admin/products/:id` (Admin Only)

### Order API
- `POST /api/orders` (Place new order)
- `GET /api/orders` (User's order history)
- `GET /api/admin/orders` (Admin view of all orders)
- `PATCH /api/admin/orders/:id/status` (Update order status)

### Banner API
- `GET /api/banners` (Fetch active banners for mobile app)
- `POST /api/admin/banners` (Admin create banner)

## 3. Infrastructure & Deployment (Proposed)
- **Frontend Hosting (Dashboard):** Vercel (Optimized for Next.js).
- **Backend Hosting:** Vercel API Routes / Render / AWS ECS.
- **Database Hosting:** Supabase (PostgreSQL) or MongoDB Atlas.
- **Mobile App Distribution:** Google Play Console (Android) & Apple App Store Connect (iOS), utilizing EAS (Expo Application Services) or fastlane for CI/CD.
