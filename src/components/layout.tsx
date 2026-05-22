import React from 'react';
import {
  App,
  ZMPRouter,
  AnimationRoutes,
  Route,
  BottomNavigation,
} from 'zmp-ui';
import {useLocation, useNavigate} from 'react-router-dom';

import NearbyPage from '@/pages/nearby';
import SavedPage from '@/pages/saved';
import AccountPage from '@/pages/account';

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = location.pathname === '/' ? '/nearby' : location.pathname;

  return (
    <>
      <AnimationRoutes>
        <Route path="/" element={<NearbyPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/account" element={<AccountPage />} />
      </AnimationRoutes>

      <BottomNavigation
        fixed
        activeKey={activeKey}
        onChange={key => navigate(key)}>
        <BottomNavigation.Item
          key="/nearby"
          label="Tìm kiếm"
          icon={<span>🔍</span>}
        />

        <BottomNavigation.Item
          key="/saved"
          label="Tin đã lưu"
          icon={<span>♡</span>}
        />

        <BottomNavigation.Item
          key="/account"
          label="Tài khoản"
          icon={<span>👤</span>}
        />
      </BottomNavigation>
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