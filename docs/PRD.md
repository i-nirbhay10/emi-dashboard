# Product Requirements Document (PRD)

## 1. Project Overview
**Product Name:** EnergyMallIndia
**Description:** A complete e-commerce ecosystem dedicated to renewable energy products (solar panels, inverters, batteries, accessories, and installation services). It consists of a React Native mobile application for end-consumers and a Next.js web-based CMS Admin Dashboard for internal management.
**Target Audience:** 
- *End-Users:* Homeowners, businesses, and industrial clients in India looking to purchase solar equipment and book installation services.
- *Admins:* Internal staff, inventory managers, and customer support agents who manage the catalog, orders, and promotions.

## 2. Product Goals & Objectives
- **Consumer Adoption:** Simplify the process of purchasing solar energy equipment and booking site surveys.
- **Operational Efficiency:** Provide administrators with a centralized, enterprise-grade Next.js dashboard to manage products, categories, orders, and users.
- **Scalability:** Ensure the platform can handle increasing product catalogs, traffic, and feature expansions (like multi-vendor support).

## 3. Core Modules & Features

### 3.1 End-User Mobile Application (React Native)
- **Authentication:** Phone number / OTP login, email registration, and biometric support.
- **Home Screen:** Dynamic promotional banners, category grid, top brands, featured deals, and a CTA for free site surveys.
- **Product Catalog:** Filtering, sorting, detailed product pages with specifications, high-res images, and reviews.
- **Cart & Checkout:** Real-time summary, delivery address management, installation service upsells, and secure payment gateway integration.
- **User Profile:** Order history, saved addresses, wishlist, and customer support chat.

### 3.2 Admin CMS Dashboard (Next.js)
- **Dashboard Overview:** KPI widgets (Revenue, Orders, Customers), analytics graphs, and low-stock alerts.
- **E-Commerce Management:** 
  - *Products & Categories:* Full CRUD operations, image uploads, category nesting, and pricing management.
  - *Inventory:* Real-time stock tracking and low-stock thresholds.
  - *Orders:* Status progression, invoice generation, and refund management.
- **Marketing:**
  - *Offers & Banners:* Dynamic banner placement (Hero, Category, Checkout) and discount code generation (Percentage, Fixed, BOGO).
  - *Customers:* Profile viewing, account blocking/unblocking, and loyalty tracking.
- **System Settings:** CMS static pages, RBAC (Role-Based Access Control), audit logs, and 2FA security.

## 4. User Journeys
**End-User (Consumer):**
1. Opens app -> Browses Home Screen -> Selects "Hybrid Inverters" category.
2. Clicks on a specific inverter -> Reads specifications -> Adds to Cart.
3. Proceeds to Checkout -> Selects saved address -> Adds "Installation Service" -> Pays via gateway.
4. Tracks order status via Profile -> Receives push notifications upon dispatch.

**Admin:**
1. Logs into Dashboard via 2FA.
2. Reviews "Low Stock" widget -> Navigates to Inventory -> Marks incoming shipment.
3. Navigates to Offers -> Creates a "Summer Sale" banner -> Pushes banner to Mobile App Home Screen.
4. Processes pending orders -> Updates status to "Shipped".

## 5. Non-Functional Requirements
- **Performance:** App load time < 2 seconds; Dashboard API response time < 200ms.
- **Responsiveness:** Admin dashboard must be fully usable on desktop, tablet, and mobile browsers.
- **Security:** Data encryption at rest and in transit. API key management and strict session validation.

## 6. Future Enhancements (Post-MVP)
- **Installer Portal:** A separate interface for solar installers to track assigned jobs.
- **Solar Calculator:** An in-app tool to calculate estimated savings based on roof size and electricity bills.
- **Multi-Language Support:** Localized content for regional Indian languages (Hindi, Marathi, Tamil, etc.).
