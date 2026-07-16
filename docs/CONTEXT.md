# Memory and Context Reference

## Project State Snapshot
- **E-Commerce Mobile App (React Native):** Fully styled frontend with Redux Toolkit for state management (Cart, Address, Wishlist). Features dynamic banner integrations across Home, Category, and Checkout screens. Status bar and UI padding heavily optimized.
- **Admin Dashboard (Next.js):** 13-page enterprise CMS built with Tailwind CSS. Includes modules for Analytics, Inventory, Orders, Products, Promotions (Offers/Banners), Users, and Security. Fully responsive layout utilizing dynamic sidebar drawer.
- **Backend / Database:** Pending implementation (currently relies on static mocked data Arrays).

## Key Design Decisions
- **Unified Color Palette:** The brand utilizes a strict combination of `slate` (for typography, backgrounds, borders) and `green` (primary brand color, used for success actions and highlighting).
- **Notch / Status Bar Safety:** The mobile app relies on `SafeAreaView` locking its background color to `theme.colors.background` (#FFFFFF) to seamlessly blend with `ScreenHeader`. Non-white backgrounds must be applied to inner elements (e.g. `ScrollView`) to prevent visual glitches near the device notch.
- **Shared Banner Architecture:** The Next.js dashboard defines banner placements (`home-hero`, `category-top`, `checkout`). The mobile app implements a generic `<PromoBanner />` component capable of receiving these configurations and rendering them consistently anywhere in the app layout.

## Future Development Context
When picking up development for Phase 2 (Backend Integration):
1. Review `AGENTS.md` for AI rules.
2. Review `SYSTEM_DESIGN.md` before finalizing a database schema to ensure it maps correctly to the existing static Frontend interfaces.
3. Replace all Redux static initialization with dynamic fetching.
