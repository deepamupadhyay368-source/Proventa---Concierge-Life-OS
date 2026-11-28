export interface SatelliteLocalityCoordinate {
  slug: string;
  name: string;
  city: string;
  zone: string;
  coordinates: [number, number]; // [lng, lat] WGS-84
  zoom: number;
  corridorTag: string;
  radiusKm: number;
}

export interface SatelliteProviderConfig {
  providerId: 'maptiler' | 'mapbox' | 'esri-world-imagery';
  providerName: string;
  satelliteTiles: string[];
  labelOverlayTiles: string[];
  darkStreetTiles: string[];
  attribution: string;
  tileSize: number;
  maxZoom: number;
  requiresKeyEnv: string | null;
  configuredViaKey: boolean;
}

/**
 * Verified WGS-84 coordinates for Gujarat / Ahmedabad / Gandhinagar real estate corridors.
 * Coordinates correspond to real municipal/corridor centroids; market metrics and project
 * counts are strictly bound at runtime to live /api/real-estate/market and /api/projects.
 */
export const GUJARAT_SATELLITE_LOCALITIES: SatelliteLocalityCoordinate[] = [
  {
    slug: 'sg-highway',
    name: 'SG Highway',
    city: 'Ahmedabad',
    zone: 'West Arterial Spine',
    coordinates: [72.5078, 23.0300],
    zoom: 13.2,
    corridorTag: 'Commercial & Mixed-Use Spine',
    radiusKm: 2.2,
  },
  {
    slug: 'bodakdev',
    name: 'Bodakdev',
    city: 'Ahmedabad',
    zone: 'West Prime Residential',
    coordinates: [72.5070, 23.0387],
    zoom: 13.8,
    corridorTag: 'Prime Residential',
    radiusKm: 1.5,
  },
  {
    slug: 'thaltej',
    name: 'Thaltej',
    city: 'Ahmedabad',
    zone: 'West Metro Terminus',
    coordinates: [72.5015, 23.0497],
    zoom: 13.8,
    corridorTag: 'Metro & Residential Hub',
    radiusKm: 1.6,
  },
  {
    slug: 'science-city',
    name: 'Science City',
    city: 'Ahmedabad',
    zone: 'North-West Growth Belt',
    coordinates: [72.4955, 23.0736],
    zoom: 13.6,
    corridorTag: 'High-Rise Residential',
    radiusKm: 1.8,
  },
  {
    slug: 'satellite',
    name: 'Satellite',
    city: 'Ahmedabad',
    zone: 'West Established Core',
    coordinates: [72.5177, 23.0260],
    zoom: 13.8,
    corridorTag: 'Established Urban Core',
    radiusKm: 1.5,
  },
  {
    slug: 'prahlad-nagar',
    name: 'Prahlad Nagar',
    city: 'Ahmedabad',
    zone: 'West Commercial & Residential',
    coordinates: [72.5065, 23.0121],
    zoom: 13.8,
    corridorTag: 'Grade-A Commercial',
    radiusKm: 1.4,
  },
  {
    slug: 'bopal',
    name: 'Bopal',
    city: 'Ahmedabad',
    zone: 'West Ring Road Belt',
    coordinates: [72.4649, 23.0338],
    zoom: 13.6,
    corridorTag: 'SP Ring Road Residential',
    radiusKm: 1.8,
  },
  {
    slug: 'south-bopal',
    name: 'South Bopal',
    city: 'Ahmedabad',
    zone: 'South-West Residential',
    coordinates: [72.4631, 23.0182],
    zoom: 13.8,
    corridorTag: 'Residential Growth Node',
    radiusKm: 1.6,
  },
  {
    slug: 'shela',
    name: 'Shela',
    city: 'Ahmedabad',
    zone: 'South-West Expansion',
    coordinates: [72.4494, 23.0052],
    zoom: 13.6,
    corridorTag: 'New High-Rise Corridor',
    radiusKm: 1.9,
  },
  {
    slug: 'gota',
    name: 'Gota',
    city: 'Ahmedabad',
    zone: 'North-West SG Highway',
    coordinates: [72.5413, 23.1011],
    zoom: 13.6,
    corridorTag: 'North SG Highway Hub',
    radiusKm: 1.8,
  },
  {
    slug: 'gift-city',
    name: 'GIFT City',
    city: 'Gandhinagar',
    zone: 'IFSC Financial Hub',
    coordinates: [72.6836, 23.1620],
    zoom: 13.8,
    corridorTag: 'IFSC & Metro Phase-2',
    radiusKm: 2.0,
  },
  {
    slug: 'gandhinagar',
    name: 'Gandhinagar',
    city: 'Gandhinagar',
    zone: 'Capital Region',
    coordinates: [72.6369, 23.2156],
    zoom: 12.8,
    corridorTag: 'Institutional Capital',
    radiusKm: 2.8,
  },
  {
    slug: 'sanand',
    name: 'Sanand',
    city: 'Ahmedabad',
    zone: 'West Industrial Corridor',
    coordinates: [72.3788, 22.9912],
    zoom: 12.8,
    corridorTag: 'GIDC & Semiconductor Belt',
    radiusKm: 2.6,
  },
  {
    slug: 'changodar',
    name: 'Changodar',
    city: 'Ahmedabad',
    zone: 'South-West Industrial Belt',
    coordinates: [72.4357, 22.9222],
    zoom: 12.8,
    corridorTag: 'Logistics & Manufacturing',
    radiusKm: 2.4,
  },
];

/**
 * Verified major road & transit corridors (approximate centerline geometry for visual orientation).
 */
export const GUJARAT_CORRIDOR_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'SG Highway (NH-147)', category: 'EXPRESSWAY', color: '#4D9FFF' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.4875, 22.9890],
          [72.5065, 23.0121],
          [72.5078, 23.0300],
          [72.5082, 23.0510],
          [72.5230, 23.0760],
          [72.5413, 23.1011],
          [72.5670, 23.1350],
          [72.6050, 23.1780],
          [72.6369, 23.2156],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Ahmedabad–GIFT City Metro Phase-2 Axis', category: 'METRO', color: '#D7AD69' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.5800, 23.0920],
          [72.6060, 23.1120],
          [72.6360, 23.1410],
          [72.6836, 23.1620],
          [72.6500, 23.2080],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Sardar Patel Ring Road (West Arc)', category: 'RING_ROAD', color: '#4D9FFF' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.5413, 23.1011],
          [72.4950, 23.0840],
          [72.4730, 23.0580],
          [72.4649, 23.0338],
          [72.4631, 23.0050],
          [72.4870, 22.9780],
          [72.5320, 22.9610],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Sanand–Changodar Industrial Axis', category: 'INDUSTRIAL', color: '#D7AD69' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.4649, 23.0338],
          [72.4200, 23.0120],
          [72.3788, 22.9912],
          [72.4050, 22.9520],
          [72.4357, 22.9222],
        ],
      },
    },
  ],
};

/**
 * Generates clean circular GeoJSON polygons for locality study areas.
 */
export function buildLocalityBoundaryGeoJson(): GeoJSON.FeatureCollection {
  const steps = 28;
  return {
    type: 'FeatureCollection',
    features: GUJARAT_SATELLITE_LOCALITIES.map((loc) => {
      const [lng, lat] = loc.coordinates;
      const latDelta = loc.radiusKm / 111.32;
      const lngDelta = loc.radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
      const ring: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        ring.push([lng + lngDelta * Math.cos(theta), lat + latDelta * Math.sin(theta)]);
      }
      return {
        type: 'Feature',
        properties: { slug: loc.slug, name: loc.name, city: loc.city },
        geometry: { type: 'Polygon', coordinates: [ring] },
      };
    }),
  };
}

/**
 * Resolves the satellite tile provider configuration.
 * - Uses MapTiler Satellite if NEXT_PUBLIC_MAPTILER_KEY is configured.
 * - Uses Mapbox Satellite if NEXT_PUBLIC_MAPBOX_TOKEN is configured.
 * - Defaults to Esri World Imagery (legitimate satellite raster service with full attribution)
 *   plus CARTO Dark Matter reference labels — zero secret credentials exposed in client bundles.
 */
export function getSatelliteProviderConfig(): SatelliteProviderConfig {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  if (maptilerKey) {
    return {
      providerId: 'maptiler',
      providerName: 'MapTiler Satellite',
      satelliteTiles: [`https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${maptilerKey}`],
      labelOverlayTiles: [
        'https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
      ],
      darkStreetTiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      attribution: '© MapTiler © OpenStreetMap contributors · © CARTO',
      tileSize: 256,
      maxZoom: 18,
      requiresKeyEnv: 'NEXT_PUBLIC_MAPTILER_KEY',
      configuredViaKey: true,
    };
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  if (mapboxToken) {
    return {
      providerId: 'mapbox',
      providerName: 'Mapbox Satellite',
      satelliteTiles: [
        `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=${mapboxToken}`,
      ],
      labelOverlayTiles: [
        'https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
      ],
      darkStreetTiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      attribution: '© Mapbox © Maxar © OpenStreetMap · © CARTO',
      tileSize: 256,
      maxZoom: 18,
      requiresKeyEnv: 'NEXT_PUBLIC_MAPBOX_TOKEN',
      configuredViaKey: true,
    };
  }

  return {
    providerId: 'esri-world-imagery',
    providerName: 'Esri World Imagery',
    satelliteTiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    labelOverlayTiles: [
      'https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
    ],
    darkStreetTiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    ],
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics · Labels © CARTO',
    tileSize: 256,
    maxZoom: 17,
    requiresKeyEnv: null,
    configuredViaKey: false,
  };
}
