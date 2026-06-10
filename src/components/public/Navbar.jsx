/**
 * Purpose: Render the public top navigation for marketing and catalog pages.
 * Used by: `src/components/layout/PublicLayout.jsx`.
 * Main dependencies: React Router links, button component, auth context, and lucide icons.
 * Public/main functions: Default `Navbar` component export.
 * Important side effects: Reads auth state to switch between dashboard/login actions and toggles the mobile nav menu.
 */
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';
import { useAuth } from '@/lib/AuthContext';
import { Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/programs', label: 'Programs' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/demo-guide', label: 'Demo Guide' },
  { to: '/verify-certificate', label: 'Verify Certificate' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = appClient.getRoleHomePath(user?.role);
  const logoSrc = '/vteki-logo.png';

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoSrc} alt="V-TEKI" className="h-10 w-auto object-contain" />
          <div className="hidden sm:block">
            <p className="font-display text-lg font-bold tracking-tight text-primary">V-TEKI</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Center of Excellence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {isAuthenticated ? (
            <Link to={dashboardPath}>
              <Button className="hidden h-10 px-4 sm:inline-flex">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" className="h-10 px-4">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="h-10 px-4">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-2 grid gap-2 border-t border-border/60 pt-3">
              {isAuthenticated ? (
                <Link to={dashboardPath} onClick={closeMobileMenu}>
                  <Button className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
