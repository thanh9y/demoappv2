import React, {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import {Box, Text} from 'zmp-ui';

import {parseGeolocation} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

import {
  getGeojson3DFeatureCollection,
  hasGeojson3D,
  getGeojsonFeatureCollection,
  hasGeojson,
} from '../helpers';

type DetailMiniMapProps = {
  item: Rsitem;
  onViewMap: () => void;
};
const DETAIL_GEOJSON_SOURCE_ID = 'detail-geojson';
const DETAIL_GEOJSON_FILL_LAYER_ID = 'detail-geojson-fill';
const DETAIL_GEOJSON_LINE_LAYER_ID = 'detail-geojson-line';
const DETAIL_3D_SOURCE_ID = 'detail-3d-building';
const DETAIL_3D_LAYER_ID = 'detail-3d-building-layer';
const DETAIL_3D_OUTLINE_LAYER_ID = 'detail-3d-building-outline';
function addDetailGeojsonLayer(map: maplibregl.Map, item: Rsitem) {
  if (!hasGeojson(item)) {
    return;
  }

  if (!map.getSource(DETAIL_GEOJSON_SOURCE_ID)) {
    map.addSource(DETAIL_GEOJSON_SOURCE_ID, {
      type: 'geojson',
      data: getGeojsonFeatureCollection([item]),
    });
  }

  if (!map.getLayer(DETAIL_GEOJSON_FILL_LAYER_ID)) {
    map.addLayer({
      id: DETAIL_GEOJSON_FILL_LAYER_ID,
      type: 'fill',
      source: DETAIL_GEOJSON_SOURCE_ID,
      paint: {
        'fill-color': '#2563eb',
        'fill-opacity': 0.28,
      },
    });
  }

  if (!map.getLayer(DETAIL_GEOJSON_LINE_LAYER_ID)) {
    map.addLayer({
      id: DETAIL_GEOJSON_LINE_LAYER_ID,
      type: 'line',
      source: DETAIL_GEOJSON_SOURCE_ID,
      paint: {
        'line-color': '#1d4ed8',
        'line-width': 2.5,
        'line-opacity': 0.95,
      },
    });
  }
}
function addDetail3DBuildingLayer(map: maplibregl.Map, item: Rsitem) {
  if (!hasGeojson3D(item)) {
    return;
  }

  if (!map.getSource(DETAIL_3D_SOURCE_ID)) {
    map.addSource(DETAIL_3D_SOURCE_ID, {
      type: 'geojson',
      data: getGeojson3DFeatureCollection([item]),
    });
  }

  if (!map.getLayer(DETAIL_3D_LAYER_ID)) {
    map.addLayer({
      id: DETAIL_3D_LAYER_ID,
      type: 'fill-extrusion',
      source: DETAIL_3D_SOURCE_ID,
      paint: {
        'fill-extrusion-color': ['get', '_color'],
        'fill-extrusion-height': ['get', '_height'],
        'fill-extrusion-base': ['get', '_baseHeight'],
        'fill-extrusion-opacity': 0.86,
      },
    });
  }

  if (!map.getLayer(DETAIL_3D_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: DETAIL_3D_OUTLINE_LAYER_ID,
      type: 'line',
      source: DETAIL_3D_SOURCE_ID,
      paint: {
        'line-color': '#111827',
        'line-width': 1.4,
        'line-opacity': 0.6,
      },
    });
  }
}

export default function DetailMiniMap({
  item,
  onViewMap,
}: DetailMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const location = parseGeolocation(item.geolocation);
  const has3D = hasGeojson3D(item);

  useEffect(() => {
    if (!location || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
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
      center: [location.longitude, location.latitude],
      zoom: hasGeojson(item)||hasGeojson3D(item) ? 18 : 15,
      pitch: has3D ? 55 : 0,
      bearing: has3D ? -25 : 0,
      interactive: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      addDetail3DBuildingLayer(map, item);
      addDetailGeojsonLayer(map, item);

      window.setTimeout(() => {
        map.resize();
      }, 100);
    });

    const markerElement = document.createElement('div');
    markerElement.className = has3D
      ? 'detail-mini-marker detail-mini-marker-3d'
      : 'detail-mini-marker';

    markerRef.current = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [item, location, has3D]);

  if (!location) {
    return (
      <button type="button" className="detail-map-preview" onClick={onViewMap}>
        <Box className="detail-map-box">
          <Text className="detail-map-text">No map location</Text>
        </Box>
      </button>
    );
  }

  return (
    <button type="button" className="detail-mini-map-wrap" onClick={onViewMap}>
      <div ref={mapContainerRef} className="detail-mini-map" />

      <div className="detail-mini-map-overlay">
        <span className="detail-map-pin">{has3D ? '🏢' : '📍'}</span>
        <span>{has3D ? 'View 3D map' : 'View on map'}</span>
      </div>
    </button>
  );
}