import type {PropertyFilters, Rsitem} from '@/types/rsitem';
import {getMainPrice} from '@/services/rsitemService';

export const directionOptions = [
  {code: 'Bắc', label: 'Bắc (N)'},
  {code: 'Nam', label: 'Nam (S)'},
  {code: 'Đông', label: 'Đông (E)'},
  {code: 'Tây', label: 'Tây (W)'},
  {code: 'Đông Bắc', label: 'Đông Bắc (NE)'},
  {code: 'Tây Bắc', label: 'Tây Bắc (NW)'},
  {code: 'Đông Nam', label: 'Đông Nam (SE)'},
  {code: 'Tây Nam', label: 'Tây Nam (SW)'},
];

export const defaultFilters: PropertyFilters = {
  keyword: '',
  listingType: 'all',
  propertyType: 'All',
  minPrice: 0,
  maxPrice: 60,
  minArea: 0,
  maxArea: 150,
  bedrooms: null,
  direction: null,
};

function normalizeText(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function priceToBillion(price: number) {
  return price / 1000000000;
}

function matchesKeyword(item: Rsitem, keyword: string) {
  const cleanKeyword = normalizeText(keyword.trim());

  if (!cleanKeyword) {
    return true;
  }

  const text = [
    item.title,
    item.address,
    item.province,
    item.rstype,
    item.direction,
  ]
    .map(normalizeText)
    .join(' ');

  return text.includes(cleanKeyword);
}

function matchesPropertyType(item: Rsitem, propertyType: string) {
  if (!propertyType || propertyType === 'All') {
    return true;
  }

  return normalizeText(item.rstype) === normalizeText(propertyType);
}

function matchesPrice(item: Rsitem, filters: PropertyFilters) {
  const price = getMainPrice(item);

  if (!price) {
    return filters.minPrice === 0;
  }

  const billion = priceToBillion(price);

  return (
    billion >= filters.minPrice &&
    (filters.maxPrice >= 60 || billion <= filters.maxPrice)
  );
}

function matchesArea(item: Rsitem, filters: PropertyFilters) {
  const area = Number(item.total_area ?? 0);

  if (!area) {
    return filters.minArea === 0;
  }

  return (
    area >= filters.minArea &&
    (filters.maxArea >= 150 || area <= filters.maxArea)
  );
}

function matchesBedrooms(item: Rsitem, bedrooms: number | null) {
  if (bedrooms === null) {
    return true;
  }

  const bed = Number(item.bed ?? 0);

  if (bedrooms >= 6) {
    return bed >= 6;
  }

  return bed === bedrooms;
}

function matchesDirection(item: Rsitem, direction: string | null) {
  if (!direction) {
    return true;
  }

  return normalizeText(item.direction) === normalizeText(direction);
}

export function filterRsitems(items: Rsitem[], filters: PropertyFilters) {
  return items.filter(item => {
    return (
      matchesKeyword(item, filters.keyword) &&
      matchesListingType(item, filters.listingType) &&
      matchesPropertyType(item, filters.propertyType) &&
      matchesPrice(item, filters) &&
      matchesArea(item, filters) &&
      matchesBedrooms(item, filters.bedrooms) &&
      matchesDirection(item, filters.direction)
    );
  });
}
function matchesListingType(item: Rsitem, listingType: PropertyFilters['listingType']) {
  if (!listingType || listingType === 'all') {
    return true;
  }

  const price = Number(item.price ?? 0);
  const rentprice = Number(item.rentprice ?? 0);

  if (listingType === 'sale') {
    return price > 0;
  }

  if (listingType === 'rent') {
    return rentprice > 0;
  }

  return true;
}