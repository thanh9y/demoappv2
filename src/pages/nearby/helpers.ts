import {openChat, openPhone} from 'zmp-sdk/apis';

import {
  getDisplayPrice,
  getDisplaySqrPrice,
} from '@/services/rsitemService';
import type {PropertyFilters, Rsitem} from '@/types/rsitem';

import type {MapItem} from './types';

export function getDistanceInMeters(a: MapItem, b: MapItem) {
  const earthRadius = 6371000;

  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLng = ((b.longitude - a.longitude) * Math.PI) / 180;

  const value =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const angle = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));

  return earthRadius * angle;
}

export function sortMapItemsByNearbyPath(mapItems: MapItem[]) {
  if (mapItems.length <= 2) {
    return mapItems;
  }

  const remaining = [...mapItems];
  const sorted: MapItem[] = [];

  let current = remaining.shift();

  if (!current) {
    return mapItems;
  }

  sorted.push(current);

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = getDistanceInMeters(current, remaining[0]);

    for (let index = 1; index < remaining.length; index += 1) {
      const distance = getDistanceInMeters(current, remaining[index]);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    const next = remaining.splice(nearestIndex, 1)[0];

    sorted.push(next);
    current = next;
  }

  return sorted;
}

export function getPositiveNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

export function getTextValue(value: unknown) {
  const text = String(value ?? '').trim();

  return text.length > 0 ? text : null;
}

export function getListMetaParts(item: Rsitem) {
  const parts: string[] = [];

  const area = getPositiveNumber(item.total_area);
  const sqrPrice = getDisplaySqrPrice(item);
  const bed = getPositiveNumber(item.bed);
  const bath = getPositiveNumber(item.bath);

  if (area) {
    parts.push(`${area} m²`);
  }

  if (sqrPrice && sqrPrice !== 'N/A') {
    parts.push(sqrPrice);
  }

  if (bed) {
    parts.push(`${bed} 🛏`);
  }

  if (bath) {
    parts.push(`${bath} 🛁`);
  }

  return parts;
}

export function getMapMetaParts(item: Rsitem) {
  const parts: string[] = [];

  const type = getTextValue(item.rstype);
  const area = getPositiveNumber(item.total_area);
  const bed = getPositiveNumber(item.bed);
  const bath = getPositiveNumber(item.bath);

  if (type) {
    parts.push(`🏠 ${type}`);
  }

  if (area) {
    parts.push(`${area} m²`);
  }

  if (bed) {
    parts.push(`🛏 ${bed}`);
  }

  if (bath) {
    parts.push(`🛁 ${bath}`);
  }

  return parts;
}

export function getDetailPriceParts(item: Rsitem) {
  const parts: string[] = [];

  const price = getDisplayPrice(item);
  const area = getPositiveNumber(item.total_area);
  const sqrPrice = getDisplaySqrPrice(item);

  if (price) {
    parts.push(price);
  }

  if (area) {
    parts.push(`${area} m²`);
  }

  if (sqrPrice && sqrPrice !== 'N/A') {
    parts.push(sqrPrice);
  }

  return parts;
}

export function getDetailRoomParts(item: Rsitem) {
  const parts: string[] = [];

  const bed = getPositiveNumber(item.bed);
  const bath = getPositiveNumber(item.bath);
  const floors = getPositiveNumber(item.floors);

  if (bed) {
    parts.push(`🛏 ${bed} PN`);
  }

  if (bath) {
    parts.push(`🛁 ${bath} WC`);
  }

  if (floors) {
    parts.push(`🏢 ${floors} tầng`);
  }

  return parts;
}

export function getPriceFilterLabel(filters: PropertyFilters) {
  if (filters.minPrice === 0 && filters.maxPrice >= 60) {
    return 'Khoảng giá';
  }

  const max = filters.maxPrice >= 60 ? '60+' : filters.maxPrice;

  return `${filters.minPrice} - ${max} tỷ`;
}

export function getAreaFilterLabel(filters: PropertyFilters) {
  if (filters.minArea === 0 && filters.maxArea >= 150) {
    return 'Diện tích';
  }

  const max = filters.maxArea >= 150 ? '150+' : filters.maxArea;

  return `${filters.minArea} - ${max} m²`;
}

export function getTypeFilterLabel(filters: PropertyFilters) {
  if (!filters.propertyType || filters.propertyType === 'All') {
    return 'Loại nhà đất';
  }

  return filters.propertyType;
}

export function getBedroomsFilterLabel(filters: PropertyFilters) {
  if (filters.bedrooms === null) {
    return 'Phòng ngủ';
  }

  return filters.bedrooms >= 6 ? '6+ PN' : `${filters.bedrooms} PN`;
}

export function getDirectionFilterLabel(filters: PropertyFilters) {
  if (!filters.direction) {
    return 'Hướng nhà';
  }

  return filters.direction;
}

export function hasTypeFilter(filters: PropertyFilters) {
  return Boolean(filters.propertyType && filters.propertyType !== 'All');
}

export function hasPriceFilter(filters: PropertyFilters) {
  return filters.minPrice > 0 || filters.maxPrice < 60;
}

export function hasAreaFilter(filters: PropertyFilters) {
  return filters.minArea > 0 || filters.maxArea < 150;
}

export function hasBedroomsFilter(filters: PropertyFilters) {
  return filters.bedrooms !== null;
}

export function hasDirectionFilter(filters: PropertyFilters) {
  return Boolean(filters.direction);
}

export function cleanDescription(value?: string | null) {
  if (!value) {
    return 'No description available.';
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;

  const decoded = textarea.value;

  return decoded
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
export function getContactPhone(item: Rsitem) {
  /**
   * Ưu tiên số điện thoại của nhân viên/môi giới.
   * Nếu sale.phone không có thì dùng số phone chung của tin đăng.
   */
  return item.sale?.phone || item.phone || '';
}
export function getDisplayContactPhone(item: Rsitem) {
  const phoneNumber = normalizeVietnamPhone(getContactPhone(item));

  return phoneNumber || '';
}

function normalizeVietnamPhone(phone?: string | null) {
  const rawPhone = String(phone ?? '').trim();

  if (!rawPhone) {
    return '';
  }

  let cleanPhone = rawPhone.replace(/[^\d]/g, '');

  // +(84) 932030958 hoặc +84932030958 -> 84932030958
  // đổi về 0932030958
  if (cleanPhone.startsWith('84')) {
    cleanPhone = `0${cleanPhone.slice(2)}`;
  }

  // 932030958 -> 0932030958
  if (cleanPhone.length === 9) {
    cleanPhone = `0${cleanPhone}`;
  }

  return cleanPhone;
}

export async function callPhone(item: Rsitem) {
  const phoneNumber = normalizeVietnamPhone(getContactPhone(item));

  if (!phoneNumber) {
    alert('Tin đăng này chưa có số điện thoại.');
    return;
  }

  try {
    await openPhone({
      phoneNumber,
    });
  } catch (error) {
    console.log('Open phone failed:', error);
    window.location.href = `tel:${phoneNumber}`;
  }
}

export async function openZaloChatByPhone(item: Rsitem) {
  const phoneNumber = normalizeVietnamPhone(getContactPhone(item));
  const zaloUserId = item.sale?.zaloUserId;

  if (!phoneNumber) {
    alert('Tin đăng này chưa có số điện thoại Zalo.');
    return;
  }

  /**
   * Cách mở chat Zalo chuẩn cần zaloUserId.
   * API hiện tại của bạn chưa có zaloUserId,
   * nên không thể kiểm tra chắc chắn số này có đăng ký Zalo hay không.
   */
  if (!zaloUserId) {
    alert(
      `Không thể mở chat Zalo trực tiếp với số ${phoneNumber}.\n\nCó thể số này chưa đăng ký Zalo hoặc API chưa cung cấp Zalo User ID. Bạn có thể bấm Gọi để liên hệ.`,
    );
    return;
  }

  try {
    await openChat({
      type: 'user',
      id: zaloUserId,
      message: 'Xin chào, tôi quan tâm bất động sản này.',
    });
  } catch (error) {
    console.log('Open Zalo chat failed:', error);

    alert(
      `Không thể mở chat Zalo với số ${phoneNumber}. Có thể tài khoản này không tồn tại hoặc không cho phép liên hệ.`,
    );
  }
}
export function getListingTypeFilterLabel(filters: PropertyFilters) {
  if (filters.listingType === 'sale') {
    return 'Bán';
  }

  if (filters.listingType === 'rent') {
    return 'Cho thuê';
  }

  return 'Nhu cầu';
}

export function hasListingTypeFilter(filters: PropertyFilters) {
  return filters.listingType !== 'all';
}
const FAVORITE_RSITEM_IDS_KEY = 'favorite_rsitem_ids';

export function getFavoriteRsitemIds() {
  try {
    const rawValue = localStorage.getItem(FAVORITE_RSITEM_IDS_KEY);

    if (!rawValue) {
      return [];
    }

    const ids = JSON.parse(rawValue);

    if (!Array.isArray(ids)) {
      return [];
    }

    return ids.map(id => String(id));
  } catch {
    return [];
  }
}

export function isFavoriteRsitem(item: Rsitem) {
  const favoriteIds = getFavoriteRsitemIds();

  return favoriteIds.includes(String(item.id));
}

export function toggleFavoriteRsitem(item: Rsitem) {
  const favoriteIds = getFavoriteRsitemIds();
  const itemId = String(item.id);

  const nextIds = favoriteIds.includes(itemId)
    ? favoriteIds.filter(id => id !== itemId)
    : [...favoriteIds, itemId];

  localStorage.setItem(FAVORITE_RSITEM_IDS_KEY, JSON.stringify(nextIds));

  return nextIds.includes(itemId);
}
