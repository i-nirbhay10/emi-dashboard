# Setup and Configuration Guide

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** or **pnpm**
- **Android Studio** (for local Android development/emulation)
- **Xcode** (for local iOS development, macOS only)

## Repository Structure
The workspace is split into two distinct applications:
1. `EnergyMallIndia/` - The React Native (Expo/CLI) Mobile Application.
2. `emi-dashboard/` - The Next.js Admin CMS Web Application.

---

## 1. Running the Admin Dashboard (Next.js)

1. Open a terminal and navigate to the dashboard directory:
   ```bash
   cd path/to/emi_project/emi-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard in your browser at: `http://localhost:3000`

---

## 2. Running the Mobile Application (React Native)

1. Open a new terminal and navigate to the mobile app directory:
   ```bash
   cd path/to/emi_project/EnergyMallIndia
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Metro Bundler:
   ```bash
   npm start
   ```
4. Run on Android Emulator (ensure a virtual device is running in Android Studio):
   ```bash
   npm run android
   ```
   *Note: If encountering "project directory not found" errors, ensure your Android SDK paths and local.properties are correctly configured for your environment.*

## Environment Variables
*Note: A `.env.local` or `.env` file should be created in each respective directory based on the `.env.example` templates once backend APIs and Payment Gateways are integrated.*
