# Energy Mall India (EMI) - Next.js 14 Admin Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-v14.1-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-v18.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)

`emi-dashboard` is the management dashboard for Energy Mall India administrators, store managers, and support agents. Built with Next.js 14 App Router and Tailwind CSS, it provides real-time oversight of customer accounts, active shopping carts, saved wishlists, offers, banners, and lifetime store revenue analytics.

---

## 📊 Core Features & Functionality

- **Customers Directory**: Complete real-time listing of customer accounts displaying primary login phone numbers, verified email badges, active carts, and completed orders.
- **Slide-Over Inspection Drawer**: Click any customer row to open an interactive drawer displaying:
  - **Overview**: Lifetime spend, completed orders, immutable phone credential, email verification state, and last active timestamp.
  - **Live Cart**: Real-time breakdown of items currently sitting in the customer's shopping cart with estimated monetary value.
  - **Saved Wishlist**: Real-time list of products saved for later purchase.
- **Customer Management Modals**: Add new customers, update profile info, change status (`Active` / `Inactive`), and delete accounts.
- **KPI Summary Analytics Cards**: Live counts for total accounts, email verification ratio, active shopping cart value, and wishlist items.
- **Advanced Filtering & Sorting**: Filter directory by status (`Active`, `Inactive`), Email Verified, Active Carts, Wishlist, or VIP High Spenders (>₹20k). Sort by Latest Activity, Spend, Orders, or Name.

---

## 📁 Dashboard Structure

```
emi-dashboard/src/
├── app/
│   ├── customers/
│   │   └── page.js      # Customers Directory Page & Inspection Slide-Over Drawer
│   ├── orders/
│   │   └── page.js      # Order Management & Status Updates
│   ├── products/
│   │   └── page.js      # Product Catalog Management
│   ├── offers/
│   │   └── page.js      # Promo Offers & Coupons Management
│   ├── page.js          # Main Dashboard Overview KPI Analytics
│   ├── layout.js        # Root App Shell & Navigation Sidebar
│   └── globals.css      # Tailwind CSS Styling Tokens & Utilities
├── components/
│   └── layout/          # Sidebar, Header, Breadcrumbs & KPI Cards
└── lib/
    └── api.js           # Admin REST API Client (`getCustomers`, `createCustomer`, `updateCustomer`, `deleteCustomer`)
```

---

## 🚀 Running the Admin Dashboard

```bash
# Install dependencies
npm install

# Start Next.js development server (Port 3000 / 3001)
npm run dev
```
