import React, {useEffect, useMemo, useState} from 'react';
import {Box, Spinner, Text} from 'zmp-ui';

import {getDisplayPrice, getRsagent} from '@/services/rsitemService';
import type {
  RsAgent,
  RsAgentAchievement,
  RsAgentCertificate,
  RsAgentGroup,
  Rsitem,
} from '@/types/rsitem';

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

function parseJsonArray<T>(value?: string | T[] | null): T[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSaleName(agent: RsAgent | null, item: Rsitem) {
  return agent?.name || item.sale?.name || 'Môi giới';
}

function getSaleAvatar(agent: RsAgent | null, item: Rsitem) {
  return (
    agent?.avatar ||
    item.sale?.avatar ||
    'https://data.nks.vn//storage/users/default.png'
  );
}

function getAgentPhoneItem(agent: RsAgent | null, fallbackItem: Rsitem): Rsitem {
  return {
    ...fallbackItem,
    phone: agent?.phone || fallbackItem.sale?.phone || fallbackItem.phone,
    sale: {
      ...fallbackItem.sale,
      phone: agent?.phone || fallbackItem.sale?.phone || fallbackItem.phone,
    },
  };
}

function normalizeAgentItem(item: Rsitem, saleItem: Rsitem, agent: RsAgent): Rsitem {
  return {
    ...item,
    province: item.province || saleItem.province,
    address: item.address || saleItem.address,
    sale: {
      id: agent.id,
      name: agent.name || saleItem.sale?.name || null,
      avatar: agent.avatar || saleItem.sale?.avatar || null,
      phone: agent.phone || saleItem.sale?.phone || null,
      email: agent.email || saleItem.sale?.email || null,
    },
  };
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
  const [agent, setAgent] = useState<RsAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const agentId = saleItem.sale?.id;

  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');

        const data = await getRsagent(agentId);

        setAgent(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Không thể tải thông tin môi giới.';

        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [agentId]);

  const saleItems = useMemo(() => {
    if (agent?.rsitems && agent.rsitems.length > 0) {
      return agent.rsitems.map(item => normalizeAgentItem(item, saleItem, agent));
    }

    return allItems.filter(item => item.sale?.id === saleItem.sale?.id);
  }, [agent, allItems, saleItem]);

  const salePosts = useMemo(() => {
    return saleItems.filter(isSalePost);
  }, [saleItems]);

  const rentPosts = useMemo(() => {
    return saleItems.filter(isRentPost);
  }, [saleItems]);

  const visiblePosts = activeTab === 'sale' ? salePosts : rentPosts;

  const achievements = useMemo(() => {
    return parseJsonArray<RsAgentAchievement>(agent?.rsachievement);
  }, [agent]);

  const certificates = useMemo(() => {
    return parseJsonArray<RsAgentCertificate>(agent?.rscertificate);
  }, [agent]);

  const groups = useMemo(() => {
    return parseJsonArray<RsAgentGroup>(agent?.rsgroup);
  }, [agent]);

  const agentPhoneItem = getAgentPhoneItem(agent, saleItem);

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
            src={getSaleAvatar(agent, saleItem)}
            alt={getSaleName(agent, saleItem)}
          />

          <Box className="sale-badge">Môi giới chuyên nghiệp</Box>
        </Box>

        <Text className="sale-name">{getSaleName(agent, saleItem)}</Text>

        {loading ? (
          <Box className="sale-loading">
            <Spinner />
            <Text className="sale-loading-text">
              Đang tải thông tin môi giới...
            </Text>
          </Box>
        ) : null}

        {errorMessage ? (
          <Box className="sale-error-box">
            <Text className="sale-error-text">{errorMessage}</Text>
          </Box>
        ) : null}

        <Box className="sale-stats">
          <Box className="sale-stat-item">
            <Text className="sale-stat-label">Kinh nghiệm</Text>
            <Text className="sale-stat-value">
              {agent?.rsexperience ? `${agent.rsexperience} năm` : 'Đang cập nhật'}
            </Text>
          </Box>

          <Box className="sale-stat-divider" />

          <Box className="sale-stat-item">
            <Text className="sale-stat-label">Tin đăng đang có</Text>
            <Text className="sale-stat-value">
              {agent?.rsitem_count ?? saleItems.length}
            </Text>
          </Box>

          <Box className="sale-stat-divider" />

          <Box className="sale-stat-item">
            <Text className="sale-stat-label">Khu vực</Text>
            <Text className="sale-stat-value">
              {agent?.rslocation || saleItem.province || 'Đang cập nhật'}
            </Text>
          </Box>
        </Box>

        <Box className="sale-slogan">
          <Text>
            {agent?.rslogan || 'Tốc Độ - Minh Bạch - Chuyên Nghiệp'}
          </Text>
        </Box>

        <button
          type="button"
          className="sale-phone-button"
          onClick={() => callPhone(agentPhoneItem)}>
          {getDisplayContactPhone(agentPhoneItem) || 'Chưa có số điện thoại'}
        </button>
      </Box>

      <Box className="sale-about-box">
        <Text className="sale-about-text">
          {agent?.rsbio && agent.rsbio.trim().length > 0
            ? agent.rsbio
            : 'Khách hàng muốn mua hoặc thuê bất động sản có thể liên hệ trực tiếp với môi giới để được tư vấn thông tin chi tiết, hỗ trợ xem nhà và thương lượng giá tốt nhất.'}
        </Text>
      </Box>

      {(achievements.length > 0 || certificates.length > 0 || groups.length > 0) ? (
        <Box className="sale-info-box">
          {achievements.length > 0 ? (
            <>
              <Text className="sale-info-title">Thành tích</Text>
              {achievements.map((item, index) => (
                <Box key={`achievement-${index}`} className="sale-info-row">
                  <Text className="sale-info-main">
                    {item.achievementResult || 'Thành tích'}
                  </Text>
                  <Text className="sale-info-sub">
                    {item.achievementYear || ''}
                  </Text>
                </Box>
              ))}
            </>
          ) : null}

          {certificates.length > 0 ? (
            <>
              <Text className="sale-info-title">Chứng chỉ</Text>
              {certificates.map((item, index) => (
                <Box key={`certificate-${index}`} className="sale-info-row">
                  <Text className="sale-info-main">
                    {item.certificationName || 'Chứng chỉ'}
                  </Text>
                  <Text className="sale-info-sub">
                    {item.certificationCode || ''}
                    {item.certificationIssuedOn
                      ? ` · ${item.certificationIssuedOn}`
                      : ''}
                  </Text>
                  <Text className="sale-info-sub">
                    {item.certificationIssuedAt || ''}
                  </Text>
                </Box>
              ))}
            </>
          ) : null}

          {groups.length > 0 ? (
            <>
              <Text className="sale-info-title">Hội nhóm</Text>
              {groups.map((item, index) => (
                <Box key={`group-${index}`} className="sale-info-row">
                  <Text className="sale-info-main">
                    {item.groupTitle || 'Hội nhóm'}
                  </Text>
                  <Text className="sale-info-sub">
                    {item.groupYear || ''}
                  </Text>
                </Box>
              ))}
            </>
          ) : null}
        </Box>
      ) : null}

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