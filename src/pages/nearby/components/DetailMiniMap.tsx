import React, {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import {Box, Text} from 'zmp-ui';

import {parseGeolocation} from '@/services/rsitemService';
import type {Rsitem} from '@/types/rsitem';

type DetailMiniMapProps = {
  item: Rsitem;
  onViewMap: () => void;
};

export default function DetailMiniMap({
  item,
  onViewMap,
}: DetailMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const location = parseGeolocation(item.geolocation);

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
      zoom: 15,
      interactive: false,
    });

    mapRef.current = map;

    const markerElement = document.createElement('div');
    markerElement.className = 'detail-mini-marker';

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
  }, [location]);

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
        <span className="detail-map-pin">📍</span>
        <span>View on map</span>
      </div>
    </button>
  );
}