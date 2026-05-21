import React, {useMemo, useState} from 'react';
import {Box, Text} from 'zmp-ui';

import {
  getDisplayPrice,
} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

import {DEFAULT_IMAGE} from '../constants';
import {
  callPhone,
  getDisplayContactPhone,
  getListMetaParts,
} from '../helpers';

type SaleTab = 'sale' | 'rent';

type SaleProfileViewProps = {
  saleItem: Rsitem;
  allItems: Rsitem[];
  onBack: () => void;
  onOpenDetail: (item: Rsitem) => void;
};

function getSaleName(item: Rsitem) {
  return item.sale?.name || 'Môi giới';
}

function getSaleAvatar(item: Rsitem) {
  return item.sale?.avatar || 'https://data.nks.vn//storage/users/default.png';
}

function getSalePhone(item: Rsitem) {
  return item.sale?.phone || item.phone || '';
}

function isSameSale(item: Rsitem, saleItem: Rsitem) {
  const saleId = saleItem.sale?.id;

  if (!saleId) {
    return false;
  }

  return item.sale?.id === saleId;
}

function isSalePost(item: Rsitem) {
  return Number(item.price ?? 0) > 0;
}

function isRentPost(item: Rsitem) {
  return Number(item.rentprice ?? 0) > 0;
}

function SalePostCard({
  item,
  onOpenDetail,
}: {
  item: Rsitem;
  onOpenDetail: (item: Rsitem) => void;
}) {
  const metaParts = getListMetaParts(item);

  return (
    <button
      type="button"
      className="sale-post-card"
      onClick={() => onOpenDetail(item)}>
      <Box className="sale-post-image-wrap">
        <img
          className="sale-post-image"
          src={item.featureimg || DEFAULT_IMAGE}
          alt={item.title || 'Property image'}
        />

        <span className="sale-post-photo-count">▧</span>
      </Box>

      <Box className="sale-post-content">
        <Text className="sale-post-title">
          {item.title || 'Tin bất động sản'}
        </Text>

        <Text className="sale-post-meta">
          {getDisplayPrice(item)}
          {metaParts.length > 0 ? ` · ${metaParts.join(' · ')}` : ''}
        </Text>

        <Text className="sale-post-address">
          ⌖ {item.address || item.province || 'Không có địa chỉ'}
        </Text>

        <Text className="sale-post-time">Đăng hôm nay</Text>
      </Box>
    </button>
  );
}

export default function SaleProfileView({
  saleItem,
  allItems,
  onBack,
  onOpenDetail,
}: SaleProfileViewProps) {
  const [activeTab, setActiveTab] = useState<SaleTab>('sale');

  const saleItems = useMemo(() => {
    return allItems.filter(item => isSameSale(item, saleItem));
  }, [allItems, saleItem]);

  const salePosts = useMemo(() => {
    return saleItems.filter(isSalePost);
  }, [saleItems]);

  const rentPosts = useMemo(() => {
    return saleItems.filter(isRentPost);
  }, [saleItems]);

  const visiblePosts = activeTab === 'sale' ? salePosts : rentPosts;

  return (
    <Box className="sale-profile-page">
      <Box className="sale-profile-header">
        <button type="button" className="sale-profile-back" onClick={onBack}>
          ←
        </button>

        <Box className="sale-cover" />

        <Box className="sale-avatar-row">
          <img
            className="sale-avatar"
            src={getSaleAvatar(saleItem)}
            alt={getSaleName(saleItem)}
          />

          <Box className="sale-badge">Môi giới chuyên nghiệp</Box>
        </Box>

        <Text className="sale-name">{getSaleName(saleItem)}</Text>

        <Box className="sale-stats">
          <Box className="sale-stat-item">
            <Text className="sale-stat-label">Kinh nghiệm</Text>
            <Text className="sale-stat-value">3 năm</Text>
          </Box>

          <Box className="sale-stat-divider" />

          <Box className="sale-stat-item">
            <Text className="sale-stat-label">Tin đăng đang có</Text>
            <Text className="sale-stat-value">{saleItems.length}</Text>
          </Box>

          <Box className="sale-stat-divider" />

          <Box className="sale-stat-item">
            <Text className="sale-stat-label">Khu vực</Text>
            <Text className="sale-stat-value">
              {saleItem.province || 'Đang cập nhật'}
            </Text>
          </Box>
        </Box>

        <Box className="sale-slogan">
          <Text>Tốc Độ - Minh Bạch - Chuyên Nghiệp</Text>
        </Box>

        <button
          type="button"
          className="sale-phone-button"
          onClick={() => callPhone(saleItem)}>
          {getDisplayContactPhone(saleItem) || getSalePhone(saleItem)}
        </button>
      </Box>

      <Box className="sale-about-box">
        <Text className="sale-about-text">
          Khách hàng muốn mua hoặc thuê bất động sản có thể liên hệ trực tiếp
          với môi giới để được tư vấn thông tin chi tiết, hỗ trợ xem nhà và
          thương lượng giá tốt nhất.
        </Text>
      </Box>

      <Box className="sale-section">
        <Text className="sale-section-title">Bất động sản của môi giới</Text>

        <Box className="sale-tabs">
          <button
            type="button"
            className={`sale-tab ${activeTab === 'sale' ? 'active' : ''}`}
            onClick={() => setActiveTab('sale')}>
            Tin bán ({salePosts.length})
          </button>

          <button
            type="button"
            className={`sale-tab ${activeTab === 'rent' ? 'active' : ''}`}
            onClick={() => setActiveTab('rent')}>
            Tin thuê ({rentPosts.length})
          </button>
        </Box>

        {visiblePosts.length > 0 ? (
          <Box className="sale-post-list">
            {visiblePosts.map(item => (
              <SalePostCard
                key={item.id}
                item={item}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </Box>
        ) : (
          <Box className="sale-empty-box">
            <Text className="sale-empty-text">
              Chưa có tin {activeTab === 'sale' ? 'bán' : 'thuê'}.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}