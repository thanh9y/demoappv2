import type {SortOption} from '@/types/rsitem';

export const sortOptions: SortOption[] = [
  'default',
  'priceAsc',
  'priceDesc',
  'sqrPriceAsc',
  'sqrPriceDesc',
  'areaAsc',
  'areaDesc',
];

export const DEFAULT_IMAGE = 'https://placehold.co/800x500?text=No+Image';

export const MAP_CENTER_PADDING = {
  top: 70,
  bottom: 150,
  left: 30,
  right: 30,
};

export const MAP_CARD_OFFSET: [number, number] = [0, -68];