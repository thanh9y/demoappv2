import type {Rsitem, SortOption} from '@/types/rsitem';
import {getMainPrice, getMainSqrPrice} from '@/services/rsitemService';

function getArea(item: Rsitem) {
  return Number(item.total_area ?? 0);
}

function asc(a: number, b: number) {
  const safeA = a || Number.MAX_SAFE_INTEGER;
  const safeB = b || Number.MAX_SAFE_INTEGER;

  return safeA - safeB;
}

function desc(a: number, b: number) {
  return (b || 0) - (a || 0);
}

export function sortRsitems(items: Rsitem[], sortOption: SortOption) {
  const copied = [...items];

  switch (sortOption) {
    case 'priceAsc':
      return copied.sort((a, b) => asc(getMainPrice(a), getMainPrice(b)));

    case 'priceDesc':
      return copied.sort((a, b) => desc(getMainPrice(a), getMainPrice(b)));

    case 'sqrPriceAsc':
      return copied.sort((a, b) => asc(getMainSqrPrice(a), getMainSqrPrice(b)));

    case 'sqrPriceDesc':
      return copied.sort((a, b) =>
        desc(getMainSqrPrice(a), getMainSqrPrice(b)),
      );

    case 'areaAsc':
      return copied.sort((a, b) => asc(getArea(a), getArea(b)));

    case 'areaDesc':
      return copied.sort((a, b) => desc(getArea(a), getArea(b)));

    case 'default':
    default:
      return copied;
  }
}

export const sortLabels: Record<SortOption, string> = {
  default: 'Default',
  priceAsc: 'Price: Low to High',
  priceDesc: 'Price: High to Low',
  sqrPriceAsc: 'Price/m²: Low to High',
  sqrPriceDesc: 'Price/m²: High to Low',
  areaAsc: 'Area: Small to Large',
  areaDesc: 'Area: Large to Small',
};