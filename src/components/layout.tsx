import React, { useEffect, useState } from 'react';
import { App, ZMPRouter, AnimationRoutes, Route } from 'zmp-ui';
import { useLocation, useNavigate } from 'react-router-dom';

import NearbyPage from '@/pages/nearby';
import SavedPage from '@/pages/saved';
import AccountPage from '@/pages/account';

import logo from '@/assets/real-estate-logo.png';
import backIcon from '@/assets/back.png';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

type HeaderBackState = {
  visible: boolean;
  onBack?: () => void;
};

declare global {
  interface WindowEventMap {
    'app-header-back': CustomEvent<HeaderBackState>;
  }
}

function SearchIcon() {
  return (
    <svg className="app-nav-svg" viewBox="0 0 24 24" fill="none">
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
    <svg className="app-nav-svg" viewBox="0 0 24 24" fill="none">
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
    <svg className="app-nav-svg" viewBox="0 0 24 24" fill="none">
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

function AppHeader({ backState }: { backState: HeaderBackState }) {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        {backState.visible ? (
          <button
            type="button"
            className="app-header-back"
            onClick={backState.onBack}
          >
            <img className="app-header-back-icon" src={backIcon} alt="Back" />
          </button>
        ) : null}

        <img className="app-header-logo" src={logo} alt="Bất động sản" />

        <div className="app-header-text">
          <div className="app-header-title">Bất động sản</div>
          <div className="app-header-subtitle">Tìm kiếm nhà đất dễ dàng</div>
        </div>
      </div>
    </header>
  );
}

function AppFooter({ hidden }: { hidden: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = location.pathname === '/' ? '/nearby' : location.pathname;

  if (hidden) {
    return null;
  }

  return (
    <nav className="app-bottom-nav">
      {navItems.map((item) => {
        const active = activePath === item.path;

        return (
          <button
            key={item.path}
            type="button"
            className={`app-bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="app-nav-icon-wrap">{item.icon}</span>
            <span className="app-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MainLayout() {
  const [backState, setBackState] = useState<HeaderBackState>({
    visible: false,
  });

  useEffect(() => {
    const handleHeaderBack = (event: WindowEventMap['app-header-back']) => {
      setBackState({
        visible: Boolean(event.detail.visible),
        onBack: event.detail.onBack,
      });
    };

    window.addEventListener('app-header-back', handleHeaderBack);

    return () => {
      window.removeEventListener('app-header-back', handleHeaderBack);
    };
  }, []);

  return (
    <div className={`app-shell ${backState.visible ? 'app-detail-mode' : ''}`}>
      <AppHeader backState={backState} />

      <main className="app-body">
        <AnimationRoutes>
          <Route path="/" element={<NearbyPage />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/account" element={<AccountPage />} />
        </AnimationRoutes>
      </main>

      <AppFooter hidden={backState.visible} />
    </div>
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