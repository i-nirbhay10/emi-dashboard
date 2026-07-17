const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');
const dashboardGroupDir = path.join(appDir, '(dashboard)');
const authGroupDir = path.join(appDir, '(auth)');

// Create route groups
if (!fs.existsSync(dashboardGroupDir)) fs.mkdirSync(dashboardGroupDir, { recursive: true });
if (!fs.existsSync(authGroupDir)) fs.mkdirSync(authGroupDir, { recursive: true });

// Move login to (auth)
const loginDir = path.join(appDir, 'login');
if (fs.existsSync(loginDir)) {
  fs.renameSync(loginDir, path.join(authGroupDir, 'login'));
}

// Move all dashboard directories to (dashboard)
const dashboardDirs = ['analytics', 'banners', 'categories', 'content', 'customers', 'inventory', 'offers', 'orders', 'products', 'security', 'settings', 'users'];

dashboardDirs.forEach(dir => {
  const sourceDir = path.join(appDir, dir);
  if (fs.existsSync(sourceDir)) {
    fs.renameSync(sourceDir, path.join(dashboardGroupDir, dir));
  }
});

// Move page.js to (dashboard)
const pageJs = path.join(appDir, 'page.js');
if (fs.existsSync(pageJs)) {
  fs.renameSync(pageJs, path.join(dashboardGroupDir, 'page.js'));
}

// Create layout.js for (dashboard)
const dashboardLayoutContent = `import DashboardLayout from '../../components/DashboardLayout';

export default function AppDashboardLayout({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}`;
fs.writeFileSync(path.join(dashboardGroupDir, 'layout.js'), dashboardLayoutContent);

// Update root layout.js to remove DashboardLayout
const rootLayoutPath = path.join(appDir, 'layout.js');
let rootLayoutContent = fs.readFileSync(rootLayoutPath, 'utf8');
rootLayoutContent = rootLayoutContent.replace('import DashboardLayout from "../components/DashboardLayout";', '');
rootLayoutContent = rootLayoutContent.replace('<DashboardLayout>', '');
rootLayoutContent = rootLayoutContent.replace('</DashboardLayout>', '');
fs.writeFileSync(rootLayoutPath, rootLayoutContent);

console.log('App directory successfully restructured into Route Groups.');
