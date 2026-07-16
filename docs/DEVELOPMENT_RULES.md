# Development Rules and Conventions

## 1. General Principles
- **Clean Code:** Write self-documenting code. Use meaningful variable and function names. Avoid magic numbers.
- **Modularity:** Break down large files into smaller, reusable components. Keep functions focused on a single responsibility (DRY principle).
- **No Direct DOM Manipulation:** Always use React state/refs instead of `document.getElementById` or jQuery.

## 2. React Native (Mobile App) Conventions
- **Directory Structure:** 
  - `src/components/` for reusable UI (split by domain, e.g., `cart/`, `home/`).
  - `src/screens/` for full-page views.
  - `src/store/` for Redux slices.
  - `src/theme/` for centralized styling (Colors, Spacing, Typography).
- **Styling:** Always use `StyleSheet.create()`. Do not use inline styles unless computing dynamic values based on state or props.
- **State Management:** Use Redux Toolkit for global state (Cart, User, Addresses). Use local `useState` for component-level UI state (e.g., modal visibility, form inputs).
- **UI Consistency:** Rely heavily on the `theme.colors.background` / `surface` variables to ensure notch/status-bar integration is seamless.

## 3. Next.js (Admin Dashboard) Conventions
- **App Router:** Use the Next.js 14 App Router (`src/app/`).
- **Server vs Client Components:** By default, components are Server Components. Only use `"use client"` when necessary (e.g., using `useState`, `useEffect`, `onClick`, or `usePathname`).
- **Styling:** Use Tailwind CSS utility classes exclusively. Avoid writing custom CSS in `globals.css` unless defining base layer variables.
- **Design System:** Stick to the established color palette (Slate for layout/borders/text, Green-600 for primary buttons/accents).
- **Layouts:** Use `DashboardLayout.js` to handle responsive mobile sidebar drawers and global padding.

## 4. Git & Version Control
- **Branching Strategy:** Use Git Flow (or similar). `main` is production-ready. Create feature branches (`feature/add-inventory-ui`) or bugfix branches (`bugfix/header-mismatch`).
- **Commits:** Write clear, concise commit messages.

## 5. QA & Testing
- **Linting:** Ensure ESLint is configured and running without errors.
- **Testing:** (When implemented) write Jest unit tests for critical Redux reducers and utility functions.
