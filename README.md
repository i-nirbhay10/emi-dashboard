# EnergyMallIndia - Admin Dashboard ☀️

A modern, enterprise-grade Content Management System (CMS) and Admin Panel built for the **EnergyMallIndia** solar e-commerce platform. Designed with clean, scalable, and responsive UI/UX principles inspired by Stripe, Shopify, and Vercel.

---

## 🚀 Features & Modules

This dashboard serves as the central command center for managing the entire business lifecycle:

### Overview & Analytics
* **Dashboard (`/`)**: High-level KPIs, revenue charts, recent activity timelines, and quick action shortcuts.
* **Analytics (`/analytics`)**: Detailed sales metrics, category breakdowns, and top-selling product reports.

### E-Commerce Management
* **Orders (`/orders`)**: Advanced order tracking, status management, and fulfillment pipelines.
* **Products (`/products`)**: Core product catalog management with status badges and stock indicators.
* **Categories (`/categories`)**: Hierarchical organization for solar panels, inverters, batteries, and accessories.
* **Inventory (`/inventory`)**: Stock level tracking, reserved stock vs. incoming shipment data, and dynamic low-stock threshold warnings.

### Marketing & Growth
* **Customers (`/customers`)**: Shopper profiles, spend history, and account status management.
* **Offers & Promotions (`/offers`)**: Management for discount codes, flat rate sales, and BOGO campaigns.
* **Banners (`/banners`)**: Controls for homepage hero sliders, category banners, and checkout promotions.

### System & Content
* **Content CMS (`/content`)**: Management table for static pages like Privacy Policies, FAQs, and Blogs.
* **Users & Roles (`/users`)**: Role-based access control (RBAC) for the administrative team (e.g., Super Admins vs. Support Agents).
* **Security (`/security`)**: Controls for Two-Factor Authentication (2FA), active session management, and live audit logs.
* **Settings (`/settings`)**: Core store configurations, contact details, and danger-zone actions (e.g., pausing storefronts).

---

## 🛠️ Tech Stack

* **Framework**: [Next.js (App Router)](https://nextjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: Inline SVG / Heroicons methodology
* **State Management**: React Hooks (`useState`, `useEffect`) and Next Navigation (`usePathname`)
* **Responsive Design**: Mobile-first architecture with dynamic slide-over drawers and adaptable layouts.

---

## 📂 Project Architecture

```text
emi-dashboard/
├── src/
│   ├── app/                    # Next.js App Router (Pages & Layouts)
│   │   ├── analytics/
│   │   ├── banners/
│   │   ├── categories/
│   │   ├── content/
│   │   ├── customers/
│   │   ├── inventory/
│   │   ├── offers/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── security/
│   │   ├── settings/
│   │   ├── users/
│   │   ├── layout.js           # Root layout and theme wrapper
│   │   └── page.js             # Main Dashboard entry point
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── DashboardLayout.js  # Mobile-responsive wrapper & state manager
│   │   ├── Sidebar.js          # Main navigation drawer
│   │   └── Topbar.js           # Header, search, and mobile menu toggle
```

---

## 💻 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 🎨 Design Philosophy

The application utilizes a strict, eco-friendly color palette (`slate` for structure, `green-600` for primary actions) combined with modern UI paradigms:
- Soft shadows and subtle borders for depth.
- Standardized `px-6 py-4` table paddings.
- Intelligent active-state navigation highlighting.
- Skeleton loading states and clean empty states (upcoming phases).
- A unified `.bg-slate-50` backdrop to ensure white cards natively pop off the page.

---
*Built for EnergyMallIndia - Empowering the solar transition.*
