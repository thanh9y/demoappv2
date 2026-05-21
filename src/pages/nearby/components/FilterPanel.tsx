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

export default function FilterPanel({
  mode,
  propertyTypes,
  filters,
  onChange,
  onApply,
  onReset,
  onClose,
}: FilterPanelProps) {
  const showType = mode === 'all' || mode === 'type';
  const showPrice = mode === 'all' || mode === 'price';
  const showArea = mode === 'all' || mode === 'area';
  const showBedrooms = mode === 'all' || mode === 'bedrooms';
  const showDirection = mode === 'all' || mode === 'direction';
  const showListingType = mode === 'all' || mode === 'listingType';

  const title =
  mode === 'listingType'
    ? 'Nhu cầu'
    : mode === 'type'
      ? 'Loại nhà đất'
      : mode === 'price'
        ? 'Khoảng giá'
        : mode === 'area'
          ? 'Diện tích'
          : mode === 'bedrooms'
            ? 'Số phòng ngủ'
            : mode === 'direction'
              ? 'Hướng nhà'
              : 'Filter Properties';

  return (
    <Box className="sheet-backdrop">
      <Box className="filter-sheet">
        <Box className="sheet-header">
            
          <Text className="sheet-title">{title}</Text>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </Box>
        {showListingType ? (
  <>
    <Text className="filter-label">Nhu cầu</Text>
    <Box className="chip-grid">
      <button
        type="button"
        className={`filter-chip ${
          filters.listingType === 'all' ? 'active' : ''
        }`}
        onClick={() =>
          onChange({
            ...filters,
            listingType: 'all',
          })
        }>
        Tất cả
      </button>

      <button
        type="button"
        className={`filter-chip ${
          filters.listingType === 'sale' ? 'active' : ''
        }`}
        onClick={() =>
          onChange({
            ...filters,
            listingType: 'sale',
          })
        }>
        Bán
      </button>

      <button
        type="button"
        className={`filter-chip ${
          filters.listingType === 'rent' ? 'active' : ''
        }`}
        onClick={() =>
          onChange({
            ...filters,
            listingType: 'rent',
          })
        }>
        Cho thuê
      </button>
    </Box>
  </>
) : null}
        {showType ? (
          <>
            <Text className="filter-label">Property Type</Text>
            <Box className="chip-grid">
              {propertyTypes.map(type => (
                <button
                  type="button"
                  key={type}
                  className={`filter-chip ${
                    filters.propertyType === type ? 'active' : ''
                  }`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      propertyType: type,
                    })
                  }>
                  {type}
                </button>
              ))}
            </Box>
          </>
        ) : null}

        {showPrice ? (
          <>
            <Text className="filter-label">Khoảng giá</Text>

            <DualRangeSlider
              min={0}
              max={60}
              step={1}
              minValue={filters.minPrice}
              maxValue={filters.maxPrice}
              onChange={(minPrice, maxPrice) =>
                onChange({
                  ...filters,
                  minPrice,
                  maxPrice,
                })
              }
              formatValue={value => `${value >= 60 ? '60+' : value} tỷ`}
            />

            <Text className="range-value">
              {filters.minPrice} tỷ -{' '}
              {filters.maxPrice >= 60 ? '60+' : filters.maxPrice} tỷ
            </Text>
          </>
        ) : null}

        {showArea ? (
          <>
            <Text className="filter-label">Diện tích</Text>

            <DualRangeSlider
              min={0}
              max={150}
              step={1}
              minValue={filters.minArea}
              maxValue={filters.maxArea}
              onChange={(minArea, maxArea) =>
                onChange({
                  ...filters,
                  minArea,
                  maxArea,
                })
              }
              formatValue={value => `${value >= 150 ? '150+' : value} m²`}
            />

            <Text className="range-value">
              {filters.minArea} m² -{' '}
              {filters.maxArea >= 150 ? '150+' : filters.maxArea} m²
            </Text>
          </>
        ) : null}

        {showBedrooms ? (
          <>
            <Text className="filter-label">Bedrooms</Text>
            <Box className="chip-grid">
              <button
                type="button"
                className={`filter-chip ${
                  filters.bedrooms === null ? 'active' : ''
                }`}
                onClick={() => onChange({...filters, bedrooms: null})}>
                Any
              </button>

              {[1, 2, 3, 4, 5, 6].map(number => (
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
          </>
        ) : null}

        {showDirection ? (
          <>
            <Text className="filter-label">Direction</Text>
            <Box className="chip-grid">
              <button
                type="button"
                className={`filter-chip ${
                  filters.direction === null ? 'active' : ''
                }`}
                onClick={() => onChange({...filters, direction: null})}>
                Any
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
          </>
        ) : null}

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