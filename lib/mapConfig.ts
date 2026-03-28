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

export const PICKUP_LOCATIONS = [
  { id: 'P1', name: 'Lal Chowk (City Center)', location: { lat: 34.0734, lng: 74.8055 } },
  { id: 'P2', name: 'Srinagar Int. Airport', location: { lat: 33.9870, lng: 74.7740 } },
  { id: 'P3', name: 'Hazratbal Shrine', location: { lat: 34.1300, lng: 74.8390 } },
  { id: 'P4', name: 'Dal Lake (Boulevard Road)', location: { lat: 34.0880, lng: 74.8320 } },
  { id: 'P5', name: 'Nishat Garden', location: { lat: 34.1250, lng: 74.8730 } },
  { id: 'P6', name: 'NIT Srinagar Campus', location: { lat: 34.1200, lng: 74.8370 } },
  { id: 'P7', name: 'Batamaloo Bus Stand', location: { lat: 34.0760, lng: 74.7920 } },
  { id: 'P8', name: 'Pantha Chowk By-pass', location: { lat: 34.0200, lng: 74.8600 } },
  { id: 'P9', name: 'Qamarwari Square', location: { lat: 34.0950, lng: 74.7820 } },
  { id: 'P10', name: 'Jamia Masjid (Downtown)', location: { lat: 34.0950, lng: 74.8140 } }
];

export const HOSPITALS = [
  { id: 'H1', name: 'Sher-i-Kashmir Institute (SKIMS)', location: { lat: 34.1331, lng: 74.8021 }, type: 'SPECIALIST' },
  { id: 'H2', name: 'SMHS Hospital', location: { lat: 34.0827, lng: 74.7937 }, type: 'GENERAL' },
  { id: 'H3', name: 'Lalla Ded Hospital', location: { lat: 34.0722, lng: 74.8016 }, type: 'SPECIALIST' },
  { id: 'H4', name: 'Bone and Joint Hospital', location: { lat: 34.0681, lng: 74.7825 }, type: 'SPECIALIST' },
  { id: 'H5', name: 'JVC SKIMS (Bemina)', location: { lat: 34.0750, lng: 74.7600 }, type: 'GENERAL' },
  { id: 'H6', name: 'JLNM Hospital (Rainawari)', location: { lat: 34.0950, lng: 74.8190 }, type: 'GENERAL' },
  { id: 'H7', name: 'CD Hospital (Dalgate)', location: { lat: 34.0850, lng: 74.8320 }, type: 'SPECIALIST' },
  { id: 'H8', name: 'Kashmir Nursing Home (Gupkar)', location: { lat: 34.0750, lng: 74.8350 }, type: 'CLINIC' },
  { id: 'H9', name: 'Modern Hospital (Rajbagh)', location: { lat: 34.0670, lng: 74.8080 }, type: 'GENERAL' },
  { id: 'H10', name: 'Florence Hospital (Chanapora)', location: { lat: 34.0450, lng: 74.7900 }, type: 'GENERAL' },
  { id: 'H11', name: 'Noora Hospital (Umerabad)', location: { lat: 34.0980, lng: 74.7500 }, type: 'GENERAL' },
  { id: 'H12', name: 'Khyber Medical Institute', location: { lat: 34.0810, lng: 74.8160 }, type: 'SPECIALIST' },
  { id: 'H13', name: 'City Hospital (Tengpora)', location: { lat: 34.0650, lng: 74.7800 }, type: 'GENERAL' },
  { id: 'H14', name: 'Govt Psychiatric Hospital', location: { lat: 34.0960, lng: 74.8210 }, type: 'SPECIALIST' },
  { id: 'H15', name: 'Medicare Hospital (Karan Nagar)', location: { lat: 34.0830, lng: 74.7950 }, type: 'GENERAL' },
  { id: 'H16', name: 'Ramzana Hospital (Gogji Bagh)', location: { lat: 34.0690, lng: 74.7980 }, type: 'GENERAL' },
  { id: 'H17', name: 'Valley Healthcare (Sonwar)', location: { lat: 34.0700, lng: 74.8430 }, type: 'CLINIC' },
  { id: 'H18', name: 'Star Hospital (Sanat Nagar)', location: { lat: 34.0480, lng: 74.8000 }, type: 'GENERAL' },
  { id: 'H19', name: 'Shifa Medical Center', location: { lat: 34.0730, lng: 74.7950 }, type: 'CLINIC' },
  { id: 'H20', name: 'Apex Hospital (Hyderpora)', location: { lat: 34.0580, lng: 74.8050 }, type: 'GENERAL' },
  { id: 'H21', name: 'Ahmad Hospital (Nowgam)', location: { lat: 34.0450, lng: 74.8200 }, type: 'GENERAL' }
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
