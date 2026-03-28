export const MAP_CONFIG = {
  // Default map settings for Srinagar, Kashmir
  DEFAULT_CENTER: { lat: 34.08, lng: 74.79 },
  DEFAULT_ZOOM: 13,
  MAP_STYLE: 'mapbox://styles/mapbox/dark-v11',
  CITY_BOUNDS: {
    minLat: 34.05,
    maxLat: 34.12,
    minLng: 74.75,
    maxLng: 74.85
  }
};

export const HOSPITALS = [
  { id: 'H1', name: 'Sher-i-Kashmir Institute (SKIMS)', location: { lat: 34.1331, lng: 74.8021 } },
  { id: 'H2', name: 'SMHS Hospital', location: { lat: 34.0827, lng: 74.7937 } },
  { id: 'H3', name: 'Lalla Ded Hospital', location: { lat: 34.0722, lng: 74.8016 } },
  { id: 'H4', name: 'Bone and Joint Hospital', location: { lat: 34.0681, lng: 74.7825 } },
  { id: 'H5', name: 'JVC SKIMS (Bemina)', location: { lat: 34.0750, lng: 74.7600 } },
  { id: 'H6', name: 'JLNM Hospital (Rainawari)', location: { lat: 34.0950, lng: 74.8190 } },
  { id: 'H7', name: 'CD Hospital (Dalgate)', location: { lat: 34.0850, lng: 74.8320 } },
  { id: 'H8', name: 'GB Pant Children Hospital', location: { lat: 34.0680, lng: 74.8450 } }
];

export const TRAFFIC_SIGNALS = [
  { id: 'S1', name: 'Jehangir Chowk Crossing', location: { lat: 34.0754, lng: 74.8034 } },
  { id: 'S2', name: 'Residency Road Signal', location: { lat: 34.0721, lng: 74.8142 } },
  { id: 'S3', name: 'Dalgate Junction', location: { lat: 34.0811, lng: 74.8211 } },
  { id: 'S4', name: 'Karan Nagar Crossing', location: { lat: 34.0845, lng: 74.7923 } },
  { id: 'S5', name: 'Qamarwari Crossing', location: { lat: 34.0956, lng: 74.7654 } },
  { id: 'S6', name: 'Soura Crossing', location: { lat: 34.1287, lng: 74.8011 } },
  { id: 'S7', name: 'Hazratbal Crossing', location: { lat: 34.1234, lng: 74.8411 } },
  { id: 'S8', name: 'Batamaloo Cross', location: { lat: 34.0789, lng: 74.7891 } }
];
