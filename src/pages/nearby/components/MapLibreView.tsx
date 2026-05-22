import React, {useEffect, useMemo, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import {Box, Text} from 'zmp-ui';

import {
  getDisplayPrice,
  parseGeolocation,
} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

import {
  MAP_CARD_OFFSET,
  MAP_CENTER_PADDING,
} from '../constants';
import {
  getGeojson3DFeatureCollection,
  getGeojsonFeatureCollection,
  getMapMetaParts,
  hasGeojson,
  hasGeojson3D,
  sortMapItemsByNearbyPath,
} from '../helpers';
import type {MapItem} from '../types';

type MapLibreViewProps = {
  items: Rsitem[];
  selectedItemId: number | string | null;
  onSelectItem: (item: Rsitem) => void;
  onOpenDetail: (item: Rsitem) => void;
};
const PROPERTY_GEOJSON_SOURCE_ID = 'property-geojson';
const PROPERTY_GEOJSON_FILL_LAYER_ID = 'property-geojson-fill';
const PROPERTY_GEOJSON_LINE_LAYER_ID = 'property-geojson-line';
const BUILDING_3D_SOURCE_ID = 'property-3d-buildings';
const BUILDING_3D_LAYER_ID = 'property-3d-buildings-layer';
const BUILDING_3D_OUTLINE_LAYER_ID = 'property-3d-buildings-outline';

function ensure3DBuildingLayers(map: maplibregl.Map) {
  if (!map.getSource(BUILDING_3D_SOURCE_ID)) {
    map.addSource(BUILDING_3D_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  if (!map.getLayer(BUILDING_3D_LAYER_ID)) {
    map.addLayer({
      id: BUILDING_3D_LAYER_ID,
      type: 'fill-extrusion',
      source: BUILDING_3D_SOURCE_ID,
      paint: {
        'fill-extrusion-color': ['get', '_color'],
        'fill-extrusion-height': ['get', '_height'],
        'fill-extrusion-base': ['get', '_baseHeight'],
        'fill-extrusion-opacity': 0.82,
      },
    });
  }

  if (!map.getLayer(BUILDING_3D_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: BUILDING_3D_OUTLINE_LAYER_ID,
      type: 'line',
      source: BUILDING_3D_SOURCE_ID,
      paint: {
        'line-color': '#111827',
        'line-width': 1.5,
        'line-opacity': 0.55,
      },
    });
  }
}

function update3DBuildingData(map: maplibregl.Map, items: Rsitem[]) {
  const source = map.getSource(BUILDING_3D_SOURCE_ID) as
    | maplibregl.GeoJSONSource
    | undefined;

  if (!source) {
    return;
  }

  source.setData(getGeojson3DFeatureCollection(items));
}

function getZoomForItem(map: maplibregl.Map, item: Rsitem) {
  return Math.max(map.getZoom(), hasGeojson(item)||hasGeojson3D(item) ? 18 : 15);
}

function getPitchForItem(map: maplibregl.Map, item: Rsitem) {
  return hasGeojson(item)||hasGeojson3D(item) ? 55 : map.getPitch();
}

function getBearingForItem(map: maplibregl.Map, item: Rsitem) {
  return hasGeojson(item)||hasGeojson3D(item) ? -25 : map.getBearing();
}

export default function MapLibreView({
  items,
  selectedItemId,
  onSelectItem,
  onOpenDetail,
}: MapLibreViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const cardScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldSyncCardRef = useRef(false);
  const scrollTimerRef = useRef<number | null>(null);
  const initializedFitRef = useRef(false);

  const mapItems = useMemo(() => {
    const validItems = items
      .map(item => {
        const location = parseGeolocation(item.geolocation);

        if (!location) {
          return null;
        }

        return {
          item,
          latitude: location.latitude,
          longitude: location.longitude,
        };
      })
      .filter((value): value is MapItem => Boolean(value));

    return sortMapItemsByNearbyPath(validItems);
  }, [items]);

  const selectedMapItem = useMemo(() => {
    return mapItems.find(
      ({item}) => String(item.id) === String(selectedItemId),
    );
  }, [mapItems, selectedItemId]);

  const moveMapToItem = (mapItem: MapItem, duration = 450) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.stop();

    map.easeTo({
      center: [mapItem.longitude, mapItem.latitude],
      zoom: getZoomForItem(map, mapItem.item),
      pitch: getPitchForItem(map, mapItem.item),
      bearing: getBearingForItem(map, mapItem.item),
      duration,
      offset: MAP_CARD_OFFSET,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      retainPadding: false,
    } as maplibregl.EaseToOptions);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const firstLocation = mapItems[0];
    const has3DData = items.some(hasGeojson3D);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: firstLocation
        ? [firstLocation.longitude, firstLocation.latitude]
        : [106.660172, 10.762622],
      zoom: firstLocation ? 13 : 11,
      pitch: has3DData ? 45 : 0,
      bearing: has3DData ? -20 : 0,
    });

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
      }),
      'bottom-right',
    );

    mapRef.current = map;

    map.on('load', () => {
      ensure3DBuildingLayers(map);
      update3DBuildingData(map, items);
      ensurePropertyGeojsonLayers(map);
      updatePropertyGeojsonData(map, items);
    });

    window.setTimeout(() => {
      map.resize();
    }, 300);

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      map.remove();
      mapRef.current = null;
      initializedFitRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const updateData = () => {
      ensure3DBuildingLayers(map);
      update3DBuildingData(map, items);
      ensurePropertyGeojsonLayers(map);
      updatePropertyGeojsonData(map, items);
    };

    if (map.loaded()) {
      updateData();
    } else {
      map.once('load', updateData);
    }
  }, [items]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    mapItems.forEach(({item, latitude, longitude}) => {
      const markerElement = document.createElement('button');

      markerElement.type = 'button';
      markerElement.className = 'property-map-marker';
      markerElement.setAttribute('aria-label', item.title || 'Property marker');
      markerElement.innerHTML = '<span class="property-map-marker-dot"></span>';

      markerElement.onclick = () => {
        shouldSyncCardRef.current = true;
        onSelectItem(item);

        map.stop();

        map.easeTo({
          center: [longitude, latitude],
          zoom: getZoomForItem(map, item),
          pitch: getPitchForItem(map, item),
          bearing: getBearingForItem(map, item),
          duration: 450,
          offset: MAP_CARD_OFFSET,
          padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          retainPadding: false,
        } as maplibregl.EaseToOptions);
      };

      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'bottom',
        offset: [0, 0],
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markersRef.current[String(item.id)] = marker;
    });

    window.setTimeout(() => {
      map.resize();
    }, 100);
  }, [mapItems, onSelectItem]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const element = marker.getElement();

      if (String(id) === String(selectedItemId)) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
  }, [selectedItemId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapItems.length === 0 || initializedFitRef.current) {
      return;
    }

    initializedFitRef.current = true;

    if (mapItems.length === 1) {
      const onlyItem = mapItems[0];

      map.easeTo({
        center: [onlyItem.longitude, onlyItem.latitude],
        zoom: hasGeojson3D(onlyItem.item) ? 18 : 15,
        pitch: hasGeojson3D(onlyItem.item) ? 55 : map.getPitch(),
        bearing: hasGeojson3D(onlyItem.item) ? -25 : map.getBearing(),
        duration: 300,
        padding: MAP_CENTER_PADDING,
      });

      return;
    }

    const bounds = new maplibregl.LngLatBounds();

    mapItems.forEach(({latitude, longitude}) => {
      bounds.extend([longitude, latitude]);
    });

    map.fitBounds(bounds, {
      padding: {
        top: 70,
        bottom: 210,
        left: 50,
        right: 50,
      },
      maxZoom: 14,
      duration: 400,
    });
  }, [mapItems]);

  useEffect(() => {
    if (!selectedMapItem || !mapRef.current) {
      return;
    }

    moveMapToItem(selectedMapItem);

    if (!shouldSyncCardRef.current) {
      return;
    }

    shouldSyncCardRef.current = false;

    const card = document.getElementById(`map-card-${selectedMapItem.item.id}`);

    window.setTimeout(() => {
      card?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }, 80);
  }, [selectedMapItem]);

  const handleCardScroll = () => {
    const container = cardScrollRef.current;

    if (!container) {
      return;
    }

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>('.map-card-page'),
      );

      if (cards.length === 0) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let nearestIndex = 0;
      let nearestDistance = Number.MAX_SAFE_INTEGER;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const mapItem = mapItems[nearestIndex];

      if (!mapItem) {
        return;
      }

      if (String(mapItem.item.id) !== String(selectedItemId)) {
        onSelectItem(mapItem.item);
      }

      moveMapToItem(mapItem);
    }, 220);
  };

  if (mapItems.length === 0) {
    return (
      <Box className="map-empty-box">
        <Text className="map-empty-title">No map locations</Text>
        <Text className="map-empty-text">
          These properties do not have valid geolocation data.
        </Text>
      </Box>
    );
  }

  return (
    <Box className="map-view">
      <div ref={mapContainerRef} className="maplibre-container" />

      <Box className="map-bottom-carousel">
        <div
          ref={cardScrollRef}
          className="map-card-scroll"
          onScroll={handleCardScroll}>
          {mapItems.map(({item}) => {
            const metaParts = getMapMetaParts(item);
            const has3D = hasGeojson3D(item);

            return (
              <Box
                key={item.id}
                id={`map-card-${item.id}`}
                className="map-card-page">
                <button
                  type="button"
                  className={`map-property-card ${
                    String(item.id) === String(selectedItemId) ? 'active' : ''
                  }`}
                  onClick={() => onOpenDetail(item)}>
                  <img
                    className="map-property-image"
                    src={
                      item.featureimg ||
                      'https://placehold.co/300x240?text=No+Image'
                    }
                    alt={item.title || 'Property image'}
                  />

                  <Box className="map-property-info">
                    <Text className="map-property-title">
                      {item.title || 'Untitled property'}
                    </Text>

                    <Text className="map-property-price">
                      {getDisplayPrice(item)}
                    </Text>

                    {metaParts.length > 0 ? (
                      <Text className="map-property-meta">
                        {metaParts.join(' · ')}
                      </Text>
                    ) : null}

                    {has3D ? (
                      <Text className="map-property-meta">
                        🏢 Có dữ liệu 3D
                      </Text>
                    ) : null}

                    <Text className="map-property-address">
                      📍 {item.address || item.province || 'No address'}
                    </Text>
                  </Box>
                </button>
              </Box>
            );
          })}
        </div>
      </Box>
    </Box>
  );
}
function ensurePropertyGeojsonLayers(map: maplibregl.Map) {
  if (!map.getSource(PROPERTY_GEOJSON_SOURCE_ID)) {
    map.addSource(PROPERTY_GEOJSON_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  if (!map.getLayer(PROPERTY_GEOJSON_FILL_LAYER_ID)) {
    map.addLayer({
      id: PROPERTY_GEOJSON_FILL_LAYER_ID,
      type: 'fill',
      source: PROPERTY_GEOJSON_SOURCE_ID,
      paint: {
        'fill-color': ['get', '_fillColor'],
        'fill-opacity': 0.28,
      },
    });
  }

  if (!map.getLayer(PROPERTY_GEOJSON_LINE_LAYER_ID)) {
    map.addLayer({
      id: PROPERTY_GEOJSON_LINE_LAYER_ID,
      type: 'line',
      source: PROPERTY_GEOJSON_SOURCE_ID,
      paint: {
        'line-color': ['get', '_lineColor'],
        'line-width': 2.5,
        'line-opacity': 0.9,
      },
    });
  }
}

function updatePropertyGeojsonData(map: maplibregl.Map, items: Rsitem[]) {
  const source = map.getSource(PROPERTY_GEOJSON_SOURCE_ID) as
    | maplibregl.GeoJSONSource
    | undefined;

  if (!source) {
    return;
  }

  source.setData(getGeojsonFeatureCollection(items));
}