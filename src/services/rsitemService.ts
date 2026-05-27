import type {
  Insight,
  InsightDetail,
  RsAgent,
  RsAgentSummary,
  Rsitem,
} from '@/types/rsitem';

const API_BASE_URL = 'https://online.nks.vn/api/nks';

type AgentResponse = {
  success: boolean;
  option?: unknown;
  data?: RsAgent;
  message?: string;
};

type AgentsResponse = {
  success: boolean;
  option?: unknown;
  data?: RsAgentSummary[];
  message?: string;
};

type InsightsResponse = {
  success: boolean;
  option?: unknown;
  data?: Insight[];
  message?: string;
};

type InsightResponse = {
  success: boolean;
  option?: unknown;
  data?: InsightDetail;
  message?: string;
};

type ListResponse = {
  success: boolean;
  option?: unknown;
  data?: Rsitem[];
  message?: string;
};

type DetailResponse = {
  success: boolean;
  option?: unknown;
  data?: Rsitem;
  message?: string;
};

function getErrorMessage(defaultMessage: string, error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error('API returned empty response.');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('API returned invalid JSON.');
  }
}

export function parseGeolocation(geolocation?: string | null) {
  if (!geolocation) {
    return null;
  }

  const parts = geolocation.split(',');

  if (parts.length !== 2) {
    return null;
  }

  const latitude = Number(parts[0]);
  const longitude = Number(parts[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

export function getMainPrice(item: Rsitem) {
  const price = Number(item.price ?? 0);
  const rentprice = Number(item.rentprice ?? 0);

  return price > 0 ? price : rentprice;
}

export function getMainSqrPrice(item: Rsitem) {
  const sqrprice = Number(item.sqrprice ?? 0);
  const sqrrentprice = Number(item.sqrrentprice ?? 0);

  return sqrprice > 0 ? sqrprice : sqrrentprice;
}

export function getDisplayPrice(item: Rsitem) {
  if (item.formatedPrice) {
    return String(item.formatedPrice);
  }

  if (item.formatedRentPrice) {
    return `${item.formatedRentPrice}/rent`;
  }

  const price = getMainPrice(item);

  if (!price) {
    return 'Thỏa thuận';
  }

  if (price >= 1000000000) {
    return `${Math.round((price / 1000000000) * 10) / 10} tỷ`;
  }

  if (price >= 1000000) {
    return `${Math.round(price / 1000000)} triệu`;
  }

  return `${price}`;
}

export function getDisplaySqrPrice(item: Rsitem) {
  if (item.formatedSqrPrice) {
    return `${item.formatedSqrPrice}/m²`;
  }

  if (item.formatedSqrRentPrice) {
    return `${item.formatedSqrRentPrice}/m²`;
  }

  const value = getMainSqrPrice(item);

  if (!value) {
    return 'N/A';
  }

  if (value >= 1000000) {
    return `${Math.round((value / 1000000) * 10) / 10} triệu/m²`;
  }

  return `${value}/m²`;
}

export function getItemImages(item: Rsitem) {
  const galleryImages = item.gallery?.map((gallery) => gallery.image) ?? [];

  const images = [item.featureimg, ...galleryImages].filter(
    (image): image is string => Boolean(image),
  );

  return images.length > 0
    ? images
    : ['https://placehold.co/800x500?text=No+Image'];
}

export async function getRsitems() {
  try {
    const response = await fetch(`${API_BASE_URL}/rsitems`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    const json = await readJsonResponse<ListResponse>(response);

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to load properties.');
    }

    return json.data ?? [];
  } catch (error) {
    console.log('getRsitems error:', error);
    throw new Error(getErrorMessage('Unable to load properties.', error));
  }
}

export async function getRsitemDetail(slug: string) {
  try {
    const formData = new FormData();
    formData.append('slug', slug);

    const response = await fetch(`${API_BASE_URL}/rsitem`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const json = await readJsonResponse<DetailResponse>(response);

    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || 'Unable to load property detail.');
    }

    return json.data;
  } catch (error) {
    console.log('getRsitemDetail error:', error);
    throw new Error(getErrorMessage('Unable to load property detail.', error));
  }
}

export async function getRsagent(id: number | string) {
  try {
    const formData = new FormData();
    formData.append('id', String(id));

    const response = await fetch(`${API_BASE_URL}/rsagent`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const json = await readJsonResponse<AgentResponse>(response);

    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || 'Unable to load agent detail.');
    }

    return json.data;
  } catch (error) {
    console.log('getRsagent error:', error);
    throw new Error(getErrorMessage('Unable to load agent detail.', error));
  }
}

export async function getRsagents() {
  try {
    const response = await fetch(`${API_BASE_URL}/rsagents`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    const json = await readJsonResponse<AgentsResponse>(response);

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to load agents.');
    }

    return json.data ?? [];
  } catch (error) {
    console.log('getRsagents error:', error);
    throw new Error(getErrorMessage('Unable to load agents.', error));
  }
}

export async function getInsights() {
  try {
    const response = await fetch(`${API_BASE_URL}/insights`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    const json = await readJsonResponse<InsightsResponse>(response);

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to load insights.');
    }

    return json.data ?? [];
  } catch (error) {
    console.log('getInsights error:', error);
    throw new Error(getErrorMessage('Unable to load insights.', error));
  }
}

export async function getInsightDetail(slug: string) {
  try {
    const formData = new FormData();
    formData.append('slug', slug);

    const response = await fetch(`${API_BASE_URL}/insight`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const json = await readJsonResponse<InsightResponse>(response);

    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || 'Unable to load insight detail.');
    }

    return json.data;
  } catch (error) {
    console.log('getInsightDetail error:', error);
    throw new Error(getErrorMessage('Unable to load insight detail.', error));
  }
}