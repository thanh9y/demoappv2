export type SortOption =
  | 'default'
  | 'priceAsc'
  | 'priceDesc'
  | 'sqrPriceAsc'
  | 'sqrPriceDesc'
  | 'areaAsc'
  | 'areaDesc';

export type PropertyFilters = {
  keyword: string;
  listingType: ListingType;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  bedrooms: number | null;
  direction: string | null;
};
export type RsitemGallery = {
  code: string;
  image: string;
  note: string | null;
};

export type SaleUser = {
  id: number;
  name: string;
  avatar: string | null;
  phone: string | null;
  email: string | null;
};

export type Rsitem = {
  id: number;
  title?: string | null;
  slug?: string | null;
  featureimg?: string | null;
  geolocation?: string | null;
  address?: string | null;
  province?: string | null;
  fulladd?: string | null;

  phone?: string | null;
  price?: number | null;
  sqrprice?: number | null;
  rentprice?: number | null;
  sqrrentprice?: number | null;

  total_area?: number | null;
  bed?: number | null;
  bath?: number | null;
  floors?: number | null;
  direction?: string | null;
  description?: string | null;
  rstype?: string | null;

  formatedPrice?: string | number | null;
  formatedSqrPrice?: string | number | null;
  formatedRentPrice?: string | number | null;
  formatedSqrRentPrice?: string | number | null;

  gallery?: {
    code?: string | null;
    image: string;
    note?: string | null;
  }[];

  sale?: {
  id?: number | null;
  name?: string | null;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;
  zaloUserId?: string | null;
} | null;
  road?: RsitemRoad | null;
};
export type ListingType = 'all' | 'sale' | 'rent';
export type RsitemRoad = {
  id?: number | null;
  title?: string | null;
  price?: number | null;
  width?: number | null;
  pricemax?: number | null;
  pricemin?: number | null;
  newpriceotc?: number | null;
  newpricetmd?: number | null;
  newpriceskc?: number | null;
  parent?: number | null;
  address?: string | null;
  formatedPrice?: string | null;
  formatedNewPriceOTD?: string | null;
  formatedNewPriceTMD?: string | null;
  formatedNewPriceSKC?: string | null;
  color?: string | null;
  opacity?: number | null;
  childs?: unknown[];
};
export type RsAgentAchievement = {
  achievementYear?: string | null;
  achievementResult?: string | null;
};

export type RsAgentCertificate = {
  certificationCode?: string | null;
  certificationName?: string | null;
  certificationIssuedOn?: string | null;
  certificationIssuedAt?: string | null;
};

export type RsAgentGroup = {
  groupTitle?: string | null;
  groupYear?: string | null;
};

export type RsAgent = {
  id: number;
  name?: string | null;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;

  rslogan?: string | null;
  rsbio?: string | null;
  rsexperience?: number | null;
  rslocation?: string | null;

  /**
   * API hiện tại trả về dạng string JSON.
   * Nhưng để an toàn, cho phép cả string hoặc array.
   */
  rsachievement?: string | RsAgentAchievement[] | null;
  rscertificate?: string | RsAgentCertificate[] | null;
  rsgroup?: string | RsAgentGroup[] | null;

  rsitem_count?: number | null;
  rsitems?: Rsitem[];
};