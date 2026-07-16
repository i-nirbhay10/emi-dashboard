# Architecture Documentation

## 1. High-Level Architecture Overview
EnergyMallIndia employs a decoupled client-server architecture. The system is split into three primary layers:
1. **Frontend (Consumer Client):** React Native mobile application handling end-user interactions.
2. **Frontend (Admin Client):** Next.js web application functioning as the CMS / Admin Panel.
3. **Backend (API & Database):** [Placeholder: e.g., Node.js / Express or Next.js API Routes] connected to a centralized database [Placeholder: e.g., PostgreSQL / MongoDB] serving both clients.

## 2. Component Architecture

### 2.1 Mobile Application (React Native)
- **State Management:** Redux Toolkit (`store/cartSlice.js`, `store/addressSlice.js`).
- **Navigation:** React Navigation (Stack and Tab Navigators).
- **Component Pattern:** Atomic design principles (e.g., `common/`, `cart/`, `home/`, `product/`).
- **Styling:** Centralized Theme (`theme/index.js`) for colors, spacing, and typography to maintain consistency.

### 2.2 Admin Dashboard (Next.js)
- **Framework:** Next.js 14+ (App Router).
- **Rendering:** Server-side rendering (SSR) for static layouts and Client-side rendering (CSR) for interactive components (`"use client"`).
- **Styling:** Tailwind CSS (utility-first approach) with a strict color palette (Slate and Green).
- **Layout Architecture:** A global `DashboardLayout` client component wrapping a responsive `Sidebar` and `Topbar`, with a flexible `main` content area.

## 3. Data Flow Architecture
1. **Client Request:** The mobile app or dashboard sends an HTTP REST/GraphQL request to the Backend API.
2. **Authentication:** The API Gateway / Middleware verifies JWT tokens or session cookies.
3. **Controller/Service:** The backend validates business logic (e.g., checking inventory before order placement).
4. **Database Query:** Data is retrieved or mutated in the database.
5. **Response:** JSON payload is returned to the client, which updates local state (e.g., Redux in mobile, React State/SWR in dashboard) and triggers UI re-renders.

## 4. Third-Party Integrations (Proposed)
- **Payment Gateway:** Razorpay / Stripe (for processing checkout payments).
- **SMS/OTP:** Twilio / MSG91 (for authentication and order notifications).
- **Cloud Storage:** AWS S3 / Cloudinary (for storing product images and banners).
- **Maps/Location:** Google Maps API (for address auto-completion and site-survey routing).
