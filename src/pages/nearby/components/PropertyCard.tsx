import React, {useState} from 'react';
import {Box, Text} from 'zmp-ui';

import {getDisplayPrice} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

import {DEFAULT_IMAGE} from '../constants';
import {
  callPhone,
  getDisplayContactPhone,
  getListMetaParts,
  isFavoriteRsitem,
  toggleFavoriteRsitem,
} from '../helpers';

type PropertyCardProps = {
  item: Rsitem;
  onOpenDetail: (item: Rsitem) => void;
  onFavoriteChange?: (item: Rsitem, saved: boolean) => void;
};

export default function PropertyCard({
  item,
  onOpenDetail,
  onFavoriteChange,
}: PropertyCardProps) {
  const metaParts = getListMetaParts(item);
  const [saved, setSaved] = useState(() => isFavoriteRsitem(item));
  return (
    <button
      type="button"
      className="property-card"
      onClick={() => onOpenDetail(item)}>
      <Box className="property-image-wrap">
        <img
          className="property-image"
          src={item.featureimg || DEFAULT_IMAGE}
          alt={item.title || 'Property image'}
        />

        <span className="vip-badge">VIP Kim Cương</span>
        <span className="photo-count">▧ 24</span>
      </Box>

      <Box className="property-content">
        <Box className="property-tags">
          <span className="verified-tag">✓ Xác thực</span>
        </Box>

        <Text className="property-title">
          {item.title || 'Untitled property'}
        </Text>

        <Text className="property-meta">
          {getDisplayPrice(item)}
          {metaParts.length > 0 ? ` · ${metaParts.join(' · ')}` : ''}
        </Text>

        <Text className="property-address">
          ⌖ {item.address || item.province || 'No address'}
        </Text>

        <Box className="agent-row">
          <Box className="agent-avatar">N</Box>

          <Box className="agent-info">
            <Text className="agent-name">
              {item.sale?.name || 'Nguyễn Chí Vĩ'}
            </Text>
            <Text className="agent-time">Đăng hôm qua</Text>
          </Box>

          <button
  type="button"
  className="call-button"
  onClick={event => {
    event.stopPropagation();
    callPhone(item);
  }}>
  {getDisplayContactPhone(item) || 'Gọi'}
</button>

          <button
  type="button"
  className={`heart-button ${saved ? 'active' : ''}`}
  onClick={event => {
    event.stopPropagation();
    const nextSaved = toggleFavoriteRsitem(item);
    setSaved(nextSaved);
    onFavoriteChange?.(item, nextSaved);
  }}>
  {saved ? '♥' : '♡'}
</button>
        </Box>
      </Box>
    </button>
  );
}