import React, {useState} from 'react';
import {Box, Spinner, Text} from 'zmp-ui';

import {getItemImages} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

import {DEFAULT_IMAGE} from '../constants';
import {
  callPhone,
  cleanDescription,
  getDisplayContactPhone,
  getDetailPriceParts,
  getDetailRoomParts,
  openZaloChatByPhone,
  isFavoriteRsitem,
toggleFavoriteRsitem,
} from '../helpers';
import DetailMiniMap from './DetailMiniMap';

type PropertyDetailViewProps = {
  item: Rsitem;
  loading: boolean;
  onBack: () => void;
  onViewMap: (item: Rsitem) => void;
  onOpenSale: (item: Rsitem) => void;
};

export default function PropertyDetailView({
  item,
  loading,
  onBack,
  onViewMap,
  onOpenSale,
}: PropertyDetailViewProps) {
  const images = getItemImages(item);
  const mainImage = images[0] || DEFAULT_IMAGE;
const [saved, setSaved] = useState(() => isFavoriteRsitem(item));
  return (
    <Box className="detail-page">
      <Box className="detail-image-wrap">
        <img
          className="detail-main-image"
          src={mainImage}
          alt={item.title || 'Property image'}
        />

        <button type="button" className="detail-back-button" onClick={onBack}>
          ←
        </button>

        

        <span className="detail-photo-count">1/{images.length}</span>
      </Box>

      {loading ? (
        <Box className="detail-loading">
          <Spinner />
          <Text>Loading detail...</Text>
        </Box>
      ) : null}

      <Box className="detail-content">
        {getDetailPriceParts(item).length > 0 ? (
          <Text className="detail-price-row">
            {getDetailPriceParts(item).join(' · ')}
          </Text>
        ) : null}

        {getDetailRoomParts(item).length > 0 ? (
          <Text className="detail-room-row">
            {getDetailRoomParts(item).join(' · ')}
          </Text>
        ) : null}

        <Box className="detail-title-block">
          <span className="verified-tag">✓ Xác thực</span>

          <Text className="detail-title">
            {item.title || 'Untitled property'}
          </Text>

          <Text className="detail-address">
            {item.address || item.province || 'No address'}
          </Text>
        </Box>

        <Box className="detail-sale-card">
          <Box className="detail-sale-left" onClick={() => onOpenSale(item)}>
            <img
              className="detail-sale-avatar"
              src={
                item.sale?.avatar ||
                'https://data.nks.vn//storage/users/default.png'
              }
              alt={item.sale?.name || 'Môi giới'}
            />

            <Box className="detail-sale-info">
              <Text className="detail-sale-name">
                {item.sale?.name || 'Môi giới'}
              </Text>

              <Text className="detail-sale-desc">
                Nhấn để xem hồ sơ và tin đăng
              </Text>
            </Box>
          </Box>

          <button
            type="button"
            className="detail-sale-button"
            onClick={() => onOpenSale(item)}>
            Xem
          </button>
        </Box>

        <DetailMiniMap item={item} onViewMap={() => onViewMap(item)} />

        {item.road ? (
          <Box className="detail-road-card">
            <Text className="detail-road-title">
              Đường {item.road.title || 'Đang cập nhật'}
              {item.road.width ? ` (${item.road.width}m)` : ''}
            </Text>

            <Text className="detail-road-address">
              {item.road.address ||
                item.address ||
                item.province ||
                'Đang cập nhật'}
            </Text>

            <Text className="detail-road-line">
              Giá tham khảo:{' '}
              <span className="detail-road-value">
                {item.road.formatedPrice
                  ? `${item.road.formatedPrice}/m²`
                  : 'Đang cập nhật'}
              </span>
            </Text>

            <Text className="detail-road-note">
              Giá đất 2026 theo Nghị quyết 87/2025/NQ-HĐND
            </Text>

            <Text className="detail-road-line">
              Đất ở (OTD){' '}
              <span className="detail-road-value">
                {item.road.formatedNewPriceOTD
                  ? `${item.road.formatedNewPriceOTD}/m²`
                  : 'Đang cập nhật'}
              </span>
            </Text>

            <Text className="detail-road-line">
              Đất TMDV (TMD){' '}
              <span className="detail-road-value">
                {item.road.formatedNewPriceTMD
                  ? `${item.road.formatedNewPriceTMD}/m²`
                  : 'Đang cập nhật'}
              </span>
            </Text>

            <Text className="detail-road-line">
              Đất SX KD Phi NN (SKC){' '}
              <span className="detail-road-value">
                {item.road.formatedNewPriceSKC
                  ? `${item.road.formatedNewPriceSKC}/m²`
                  : 'Đang cập nhật'}
              </span>
            </Text>
          </Box>
        ) : null}

        <Text className="detail-section-title">Mô tả</Text>

        <Text className="detail-description">
          {cleanDescription(item.description)}
        </Text>
      </Box>

      <Box className="detail-bottom-bar">
<button
  type="button"
  className={`detail-save-button ${saved ? 'active' : ''}`}
  onClick={() => {
    const nextSaved = toggleFavoriteRsitem(item);
    setSaved(nextSaved);
  }}>
  {saved ? '♥' : '♡'}
</button>

  <button
    type="button"
    className="detail-zalo-button"
    onClick={() => openZaloChatByPhone(item)}>
    Zalo
  </button>

  <button
    type="button"
    className="detail-call-button"
    onClick={() => callPhone(item)}>
    Call {getDisplayContactPhone(item)}
  </button>
</Box>
    </Box>
  );
}