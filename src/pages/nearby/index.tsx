import React, {useEffect, useMemo, useState} from 'react';
import {Box, Page, Spinner, Text} from 'zmp-ui';

import {getRsitemDetail, getRsitems} from '@/services/rsitemService';
import type {PropertyFilters, Rsitem, SortOption} from '@/types/rsitem';

import {defaultFilters, filterRsitems} from './filters';
import {sortRsitems} from './sort';
import type {FilterSheetMode, ViewMode} from './types';

import PropertyCard from './components/PropertyCard';
import MapLibreView from './components/MapLibreView';
import PropertyDetailView from './components/PropertyDetailView';
import FilterPanel from './components/FilterPanel';
import SortPanel from './components/SortPanel';

import {
  getAreaFilterLabel,
  getBedroomsFilterLabel,
  getDirectionFilterLabel,
  getPriceFilterLabel,
  getTypeFilterLabel,
  hasAreaFilter,
  hasBedroomsFilter,
  hasDirectionFilter,
  hasPriceFilter,
  hasTypeFilter,
  getListingTypeFilterLabel,
hasListingTypeFilter,
} from './helpers';

import './style.scss';
import SaleProfileView from './components/SaleProfileView';
function setAppHeaderBack(visible: boolean, onBack?: () => void) {
  window.dispatchEvent(
    new CustomEvent('app-header-back', {
      detail: {
        visible,
        onBack,
      },
    }),
  );
}

export default function NearbyPage() {
  const [mapFocusItem, setMapFocusItem] = useState<Rsitem | null>(null);
  const [items, setItems] = useState<Rsitem[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] =
    useState<PropertyFilters>(defaultFilters);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSheetMode, setFilterSheetMode] =
    useState<FilterSheetMode>('all');
  const [showSort, setShowSort] = useState(false);

  const [detailItem, setDetailItem] = useState<Rsitem | null>(null);
  const [saleItem, setSaleItem] = useState<Rsitem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | string | null>(
    null,
  );
  
  const loadItems = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await getRsitems();

      setItems(data);

      if (data.length > 0) {
        setSelectedItemId(data[0].id);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load properties.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const propertyTypes = useMemo<string[]>(() => {
    const types = Array.from(
      new Set(
        items
          .map(item => item.rstype)
          .filter((type): type is string => Boolean(type)),
      ),
    );

    return ['All', ...types];
  }, [items]);

  const visibleItems = useMemo(() => {
    const filtered = filterRsitems(items, filters);

    return sortRsitems(filtered, sortOption);
  }, [items, filters, sortOption]);
  const mapItem = useMemo(() => {
    return mapFocusItem ? [mapFocusItem] : visibleItems;
    }, [mapFocusItem, visibleItems]);

  useEffect(() => {
    if (visibleItems.length === 0) {
      setSelectedItemId(null);
      return;
    }

    const selectedStillExists = visibleItems.some(
      item => String(item.id) === String(selectedItemId),
    );

    if (!selectedStillExists) {
      setSelectedItemId(visibleItems[0].id);
    }
  }, [visibleItems, selectedItemId]);

  const applyFilters = () => {
    setFilters(draftFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const openDetail = async (item: Rsitem) => {
    try {
      setDetailLoading(true);
      setSelectedItemId(item.id);
      setMapFocusItem(null);

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
    if(!item.sale){
      return;
    }
    setSaleItem(item);
    setDetailItem(null);
  };
  
  const closeSaleProfile = () => {
    setSaleItem(null);
  };
useEffect(() => {
  if (saleItem) {
    setAppHeaderBack(true, closeSaleProfile);

    return () => {
      setAppHeaderBack(false);
    };
  }

  if (detailItem) {
    setAppHeaderBack(true, closeDetail);

    return () => {
      setAppHeaderBack(false);
    };
  }

  setAppHeaderBack(false);

  return undefined;
}, [saleItem, detailItem]);
  const viewDetailOnMap = (item: Rsitem) => {
    setDetailItem(null);
    setMapFocusItem(item);
    setSelectedItemId(item.id);
    setViewMode('map');
  };

  const openFilterSheet = (mode: FilterSheetMode) => {
    setDraftFilters(filters);
    setFilterSheetMode(mode);
    setShowFilters(true);
  };

useEffect(() => {
  if (saleItem) {
    setAppHeaderBack(true, closeSaleProfile);

    return () => {
      setAppHeaderBack(false);
    };
  }

  if (detailItem) {
    setAppHeaderBack(true, closeDetail);

    return () => {
      setAppHeaderBack(false);
    };
  }

  setAppHeaderBack(false);

  return undefined;
}, [saleItem, detailItem]);
  return (
    <Page className="nearby-page">
  {saleItem ? (
    <SaleProfileView
      saleItem={saleItem}
      allItems={items}
      onBack={closeSaleProfile}
      onOpenDetail={openDetail}
    />
  ) : detailItem ? (
    <PropertyDetailView
      item={detailItem}
      loading={detailLoading}
      onBack={closeDetail}
      onViewMap={viewDetailOnMap}
      onOpenSale={openSaleProfile}
    />
  ) : (
        <>
          <Box className="search-header">
            <Box className="search-box">
              <span className="search-icon">⌕</span>

              <input
                aria-label="Search properties"
                title="Search properties"
                className="main-search-input"
                value={filters.keyword}
                placeholder="Bạn tìm BĐS ở đâu?"
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    keyword: event.target.value,
                  }))
                }
              />

              <button
                type="button"
                aria-label="Open all filters"
                title="Open all filters"
                className="search-filter-button"
                onClick={() => openFilterSheet('all')}>
                ☷
              </button>
            </Box>

            <Box className="quick-filter-row">
              <button
  type="button"
  className={`quick-filter-button ${
    hasListingTypeFilter(filters) ? 'active' : ''
  }`}
  onClick={() => openFilterSheet('listingType')}>
  {getListingTypeFilterLabel(filters)}
</button>
              <button
                type="button"
                className={`quick-filter-button ${
                  hasTypeFilter(filters) ? 'active' : ''
                }`}
                onClick={() => openFilterSheet('type')}>
                {getTypeFilterLabel(filters)}
              </button>

              <button
                type="button"
                className={`quick-filter-button ${
                  hasPriceFilter(filters) ? 'active' : ''
                }`}
                onClick={() => openFilterSheet('price')}>
                {getPriceFilterLabel(filters)}
              </button>

              <button
                type="button"
                className={`quick-filter-button ${
                  hasAreaFilter(filters) ? 'active' : ''
                }`}
                onClick={() => openFilterSheet('area')}>
                {getAreaFilterLabel(filters)}
              </button>

              <button
                type="button"
                className={`quick-filter-button ${
                  hasBedroomsFilter(filters) ? 'active' : ''
                }`}
                onClick={() => openFilterSheet('bedrooms')}>
                {getBedroomsFilterLabel(filters)}
              </button>

              <button
                type="button"
                className={`quick-filter-button ${
                  hasDirectionFilter(filters) ? 'active' : ''
                }`}
                onClick={() => openFilterSheet('direction')}>
                {getDirectionFilterLabel(filters)}
              </button>
            </Box>
          </Box>

         {viewMode === 'list' ? (
  <Box className="result-toolbar">
    <Text className="result-count">
      {visibleItems.length} bất động sản
    </Text>

    <button
      type="button"
      className="sort-button"
      onClick={() => setShowSort(true)}>
      Sắp xếp ⇅
    </button>
  </Box>
) : null}

          {loading ? (
            <Box className="loading-box">
              <Spinner />
              <Text className="loading-text">Loading properties...</Text>
            </Box>
          ) : null}

          {errorMessage ? (
            <Box className="error-box">
              <Text className="error-text">{errorMessage}</Text>
            </Box>
          ) : null}

          {!loading && !errorMessage && viewMode === 'list' ? (
            <Box className="property-list">
              {visibleItems.map(item => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  onOpenDetail={openDetail}
                />
              ))}
            </Box>
          ) : null}

          {!loading && !errorMessage && viewMode === 'map' ? (
            <MapLibreView
              items={mapItem}
              selectedItemId={selectedItemId}
              onSelectItem={item => setSelectedItemId(item.id)}
              onOpenDetail={openDetail}
            />
          ) : null}

          <button
            type="button"
            className="floating-map-button"
            onClick={() =>{
              if(viewMode === 'list') {
                setMapFocusItem(null);
                setViewMode('map');
                return;
              }
              setViewMode('list');
              setMapFocusItem(null);
            }}>
            {viewMode === 'list' ? '☷ Bản đồ' : '☷ Danh sách'}
             
          </button>

          {showFilters ? (
            <FilterPanel
              mode={filterSheetMode}
              propertyTypes={propertyTypes}
              filters={draftFilters}
              onChange={setDraftFilters}
              onApply={applyFilters}
              onReset={resetFilters}
              onClose={() => setShowFilters(false)}
            />
          ) : null}

          {showSort ? (
            <SortPanel
              value={sortOption}
              onChange={value => {
                setSortOption(value);
                setShowSort(false);
              }}
              onClose={() => setShowSort(false)}
            />
          ) : null}
        </>
      )}
    </Page>
  );
}