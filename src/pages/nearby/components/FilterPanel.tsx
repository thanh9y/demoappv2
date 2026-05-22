import React from 'react';
import {Box, Text} from 'zmp-ui';

import type {PropertyFilters} from '@/types/rsitem';

import {directionOptions} from '../filters';
import type {FilterSheetMode} from '../types';
import DualRangeSlider from './DualRangeSlider';

type FilterPanelProps = {
  mode: FilterSheetMode;
  propertyTypes: string[];
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const bedroomOptions = [1, 2, 3, 4, 5, 6];

function getSheetTitle(mode: FilterSheetMode) {
  switch (mode) {
    case 'listingType':
      return 'Nhu cầu';
    case 'type':
      return 'Loại nhà đất';
    case 'price':
      return 'Khoảng giá';
    case 'area':
      return 'Diện tích';
    case 'bedrooms':
      return 'Số phòng ngủ';
    case 'direction':
      return 'Hướng nhà';
    case 'all':
    default:
      return 'Bộ lọc';
  }
}

export default function FilterPanel({
  mode,
  propertyTypes,
  filters,
  onChange,
  onApply,
  onReset,
  onClose,
}: FilterPanelProps) {
  const showListingType = mode === 'all' || mode === 'listingType';
  const showSectionLabel = mode === 'all';
  const showType = mode === 'all' || mode === 'type';
  const showPrice = mode === 'all' || mode === 'price';
  const showArea = mode === 'all' || mode === 'area';
  const showBedrooms = mode === 'all' || mode === 'bedrooms';
  const showDirection = mode === 'all' || mode === 'direction';

  return (
    <Box className="sheet-backdrop" onClick={onClose}>
      <Box className="filter-sheet" onClick={event => event.stopPropagation()}>
        <Box className="sheet-header">
          <Text className="sheet-title">{getSheetTitle(mode)}</Text>

          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </Box>

        <Box className="sheet-content">
          {showListingType ? (
            <Box className="filter-section">
              {showSectionLabel ? (
                <Text className="filter-label">Nhu cầu</Text>
              ) : null}

              <Box className="chip-grid">
                <button
                  type="button"
                  className={`filter-chip ${
                    filters.listingType === 'all' ? 'active' : ''
                  }`}
                  onClick={() => onChange({...filters, listingType: 'all'})}>
                  Tất cả
                </button>

                <button
                  type="button"
                  className={`filter-chip ${
                    filters.listingType === 'sale' ? 'active' : ''
                  }`}
                  onClick={() => onChange({...filters, listingType: 'sale'})}>
                  Bán
                </button>

                <button
                  type="button"
                  className={`filter-chip ${
                    filters.listingType === 'rent' ? 'active' : ''
                  }`}
                  onClick={() => onChange({...filters, listingType: 'rent'})}>
                  Cho thuê
                </button>
              </Box>
            </Box>
          ) : null}

          {showType ? (
            <Box className="filter-section">
              {showSectionLabel ? (
                <Text className="filter-label">Loại nhà đất</Text>
              ) : null}

              <Box className="chip-grid">
                {propertyTypes.map(type => (
                  <button
                    type="button"
                    key={type}
                    className={`filter-chip ${
                      filters.propertyType === type ? 'active' : ''
                    }`}
                    onClick={() => onChange({...filters, propertyType: type})}>
                    {type === 'All' ? 'Tất cả' : type}
                  </button>
                ))}
              </Box>
            </Box>
          ) : null}

          {showPrice ? (
            <Box className="filter-section">
              {showSectionLabel ? (
                <Text className="filter-label">Khoảng giá</Text>
              ) : null}

              <DualRangeSlider
                min={0}
                max={60}
                step={1}
                minValue={filters.minPrice}
                maxValue={filters.maxPrice}
                onChange={(minPrice, maxPrice) =>
                  onChange({...filters, minPrice, maxPrice})
                }
                formatValue={value => `${value >= 60 ? '60+' : value} tỷ`}
              />

              <Text className="range-value">
                {filters.minPrice} tỷ -{' '}
                {filters.maxPrice >= 60 ? '60+' : filters.maxPrice} tỷ
              </Text>
            </Box>
          ) : null}

          {showArea ? (
            <Box className="filter-section">
              {showSectionLabel ? (
                <Text className="filter-label">Diện tích</Text>
              ) : null}

              <DualRangeSlider
                min={0}
                max={150}
                step={1}
                minValue={filters.minArea}
                maxValue={filters.maxArea}
                onChange={(minArea, maxArea) =>
                  onChange({...filters, minArea, maxArea})
                }
                formatValue={value => `${value >= 150 ? '150+' : value} m²`}
              />

              <Text className="range-value">
                {filters.minArea} m² -{' '}
                {filters.maxArea >= 150 ? '150+' : filters.maxArea} m²
              </Text>
            </Box>
          ) : null}

          {showBedrooms ? (
            <Box className="filter-section">
              {showSectionLabel ? (
                <Text className="filter-label">Số phòng ngủ</Text>
              ) : null}

              <Box className="chip-grid">
                <button
                  type="button"
                  className={`filter-chip ${
                    filters.bedrooms === null ? 'active' : ''
                  }`}
                  onClick={() => onChange({...filters, bedrooms: null})}>
                  Tất cả
                </button>

                {bedroomOptions.map(number => (
                  <button
                    type="button"
                    key={number}
                    className={`filter-chip ${
                      filters.bedrooms === number ? 'active' : ''
                    }`}
                    onClick={() => onChange({...filters, bedrooms: number})}>
                    {number === 6 ? '6+' : number}
                  </button>
                ))}
              </Box>
            </Box>
          ) : null}

          {showDirection ? (
            <Box className="filter-section">
              {showSectionLabel ? (
                <Text className="filter-label">Hướng nhà</Text>
              ) : null}

              <Box className="chip-grid">
                <button
                  type="button"
                  className={`filter-chip ${
                    filters.direction === null ? 'active' : ''
                  }`}
                  onClick={() => onChange({...filters, direction: null})}>
                  Tất cả
                </button>

                {directionOptions.map(direction => (
                  <button
                    type="button"
                    key={direction.code}
                    className={`filter-chip ${
                      filters.direction === direction.code ? 'active' : ''
                    }`}
                    onClick={() =>
                      onChange({...filters, direction: direction.code})
                    }>
                    {direction.label}
                  </button>
                ))}
              </Box>
            </Box>
          ) : null}
        </Box>

        <Box className="sheet-actions">
          <button type="button" className="reset-button" onClick={onReset}>
            Reset
          </button>

          <button type="button" className="apply-button" onClick={onApply}>
            Apply
          </button>
        </Box>
      </Box>
    </Box>
  );
}
