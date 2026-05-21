import React, {useEffect, useMemo, useState} from 'react';
import {Box, Page, Spinner, Text} from 'zmp-ui';

import {
  getRsitemDetail,
  getRsitems,
} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

import PropertyCard from '@/pages/nearby/components/PropertyCard';
import PropertyDetailView from '@/pages/nearby/components/PropertyDetailView';
import SaleProfileView from '@/pages/nearby/components/SaleProfileView';
import {
  getFavoriteRsitemIds,
  isFavoriteRsitem,
} from '@/pages/nearby/helpers';

import '@/pages/nearby/style.scss';

export default function SavedPage() {
  const [items, setItems] = useState<Rsitem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailItem, setDetailItem] = useState<Rsitem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saleItem, setSaleItem] = useState<Rsitem | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await getRsitems();

      setItems(data.filter(item => isFavoriteRsitem(item)));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải tin đã lưu.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const favoriteIds = useMemo(() => getFavoriteRsitemIds(), [items]);

  const openDetail = async (item: Rsitem) => {
    try {
      setDetailLoading(true);

      if (!item.slug) {
        setDetailItem(item);
        return;
      }

      const detail = await getRsitemDetail(item.slug);

      setDetailItem(detail);
    } catch (error) {
      console.log('Load detail failed:', error);
      setDetailItem(item);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailItem(null);
  };

  const openSaleProfile = (item: Rsitem) => {
    if (!item.sale) {
      return;
    }

    setSaleItem(item);
    setDetailItem(null);
  };

  const closeSaleProfile = () => {
    setSaleItem(null);
  };

  const removeItemFromSavedList = (item: Rsitem, saved: boolean) => {
    if (saved) {
      return;
    }

    setItems(prev => prev.filter(value => String(value.id) !== String(item.id)));
  };

  if (saleItem) {
    return (
      <Page className="nearby-page">
        <SaleProfileView
          saleItem={saleItem}
          allItems={items}
          onBack={closeSaleProfile}
          onOpenDetail={openDetail}
        />
      </Page>
    );
  }

  if (detailItem) {
    return (
      <Page className="nearby-page">
        <PropertyDetailView
          item={detailItem}
          loading={detailLoading}
          onBack={closeDetail}
          onViewMap={() => {
            alert('Bạn hãy mở bản đồ ở trang tìm kiếm.');
          }}
          onOpenSale={openSaleProfile}
        />
      </Page>
    );
  }

  return (
    <Page className="nearby-page saved-page">
      <Box className="saved-header">
        <Text className="saved-title">Tin đã lưu</Text>
        <Text className="saved-subtitle">
          {items.length} tin bất động sản đã lưu
        </Text>
      </Box>

      {loading ? (
        <Box className="loading-box">
          <Spinner />
          <Text className="loading-text">Đang tải tin đã lưu...</Text>
        </Box>
      ) : null}

      {errorMessage ? (
        <Box className="error-box">
          <Text className="error-text">{errorMessage}</Text>
        </Box>
      ) : null}

      {!loading && !errorMessage && items.length === 0 ? (
        <Box className="saved-empty-box">
          <Text className="saved-empty-title">Chưa có tin đã lưu</Text>
          <Text className="saved-empty-text">
            Bạn hãy bấm biểu tượng tim ở danh sách tin đăng để lưu tin yêu thích.
          </Text>
        </Box>
      ) : null}

      {!loading && !errorMessage && items.length > 0 ? (
        <Box className="property-list">
          {items.map(item => (
            <PropertyCard
              key={item.id}
              item={item}
              onOpenDetail={openDetail}
              onFavoriteChange={removeItemFromSavedList}
            />
          ))}
        </Box>
      ) : null}
    </Page>
  );
}