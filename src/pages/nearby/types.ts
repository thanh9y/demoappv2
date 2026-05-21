import type {Rsitem} from '@/types/rsitem';

export type ViewMode = 'list' | 'map';

export type FilterSheetMode =
  | 'all'
  | 'listingType'
  | 'type'
  | 'price'
  | 'area'
  | 'bedrooms'
  | 'direction';

export type MapItem = {
  item: Rsitem;
  latitude: number;
  longitude: number;
};