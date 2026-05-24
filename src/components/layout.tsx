import React from 'react';
import {App, ZMPRouter, AnimationRoutes, Route} from 'zmp-ui';
import {useLocation, useNavigate} from 'react-router-dom';

import NearbyPage from '@/pages/nearby';
import SavedPage from '@/pages/saved';
import AccountPage from '@/pages/account';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

function SearchIcon() {
  return (
    <svg
      className="app-nav-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M16.2 16.2 21 21"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      className="app-nav-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M12 20.4S4.2 15.8 4.2 9.5A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.8 2.2c0 6.3-7.8 10.9-7.8 10.9Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="app-nav-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M12 12.2a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M4.5 21c.8-4.1 3.5-6.4 7.5-6.4s6.7 2.3 7.5 6.4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    path: '/nearby',
    label: 'Tìm kiếm',
    icon: <SearchIcon />,
  },
  {
    path: '/saved',
    label: 'Tin đã lưu',
    icon: <HeartIcon />,
  },
  {
    path: '/account',
    label: 'Tài khoản',
    icon: <UserIcon />,
  },
];

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = location.pathname === '/' ? '/nearby' : location.pathname;

  return (
    <>
      <AnimationRoutes>
        <Route path="/" element={<NearbyPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/account" element={<AccountPage />} />
      </AnimationRoutes>

      <nav className="app-bottom-nav">
        {navItems.map(item => {
          const active = activePath === item.path;

          return (
            <button
              key={item.path}
              type="button"
              className={`app-bottom-nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="app-nav-icon-wrap">{item.icon}</span>
              <span className="app-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default function Layout() {
  return (
    <App>
      <ZMPRouter>
        <MainLayout />
      </ZMPRouter>
    </App>
  );
}