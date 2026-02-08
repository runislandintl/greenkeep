import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import OfflineBanner from './OfflineBanner';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      {/* Desktop layout */}
      <div className="hidden md:flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Mobile layout */}
      <div className="md:hidden">
        <Header />
        <main className="p-4 pb-20">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
